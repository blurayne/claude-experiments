import { gl } from '../gpu/context'
import { trackVAOBuffers } from '../gpu/buffers'
import { BODIES, NB, N_PLANETS, I_P9, bodyPos, tmp, tmpSun } from '../astro/bodies'
import { pTr, U } from './passes/points'
import { readout, simClock } from './state'

/**
 * The swept paths, and the closed orbits that stand in for them.
 *
 * Two different things are drawn through one program. A TRAIL is the path actually watched
 * being swept: TRAIL_N samples in a sliding window, sample TRAIL_N−1 being now and the
 * brightest, sample 0 the earliest seen. A RING is each planet's orbit as a closed
 * heliocentric loop, sampled once — in this model orbits neither precess nor decay, so the
 * ring is the same at any epoch — and it stands in wherever sweeping is impossible: inside the
 * dive at high speed a million orbits pass per second, no line can trace them, and the path
 * they all follow is exactly this ring.
 */

/** sliding window: TRAIL_N samples, spacing set by the length slider */
export const TRAIL_N = 2400;
const trails: Float32Array[] = [], trailBufs: WebGLBuffer[] = [], trailVaos: WebGLVertexArrayObject[] = [];

/**
 * Build the sliding windows. Called from main.ts rather than at import: this is the sixth of
 * the seven things that consume the boot sequence in order, and building it anywhere else
 * moves everything after it.
 */
export function initTrails(): void {
  for(let i=0;i<NB;i++){
    const a = new Float32Array(TRAIL_N*3);
    for(let k=0;k<TRAIL_N;k++){
      bodyPos(i, (k-(TRAIL_N-1))*simClock.dtSample, tmp);
      a[k*3]=tmp[0]; a[k*3+1]=tmp[1]; a[k*3+2]=tmp[2];
    }
    trails.push(a);
    const vao=gl.createVertexArray()!; gl.bindVertexArray(vao);
    const b=gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,a,gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null);
    trailBufs.push(b); trailVaos.push(vao);
  }
}

const RING_N = 96;
const ringVaos: (WebGLVertexArrayObject | null)[] = [];

/** The orbit rings — the seventh and last of the boot's ordered builders. */
export function initOrbitRings(): void {
  const q = new Float64Array(3), s0 = new Float64Array(3);
  for(let i=0;i<NB;i++){
    if(i === 0){ ringVaos.push(null); continue; }
    const a = new Float32Array(RING_N*3);
    const P = BODIES[i][1] as number;
    for(let k=0;k<RING_N;k++){
      const ts = k/RING_N*P;
      bodyPos(i, ts, q); bodyPos(0, ts, s0);
      a[k*3]=q[0]-s0[0]; a[k*3+1]=q[1]-s0[1]; a[k*3+2]=q[2]-s0[2];
    }
    const vao=gl.createVertexArray()!; gl.bindVertexArray(vao);
    const b=gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null); trackVAOBuffers(vao,[b]); ringVaos.push(vao);
  }
}

// Trails are stored as absolute positions minus a local anchor. Float32 alone cannot
// hold a position of magnitude ~900 to sub-AU precision — the error is about 7 AU,
// which at dive zoom is the whole frame — so the anchor keeps the stored numbers small
// and the draw passes (org - anchor), subtracted in double precision, as the origin.
export const trailAnchor = new Float64Array(3);

function trailPos(i: number, ts: number, out: Float64Array): Float64Array {
  bodyPos(i, ts, out);
  out[0]-=trailAnchor[0]; out[1]-=trailAnchor[1]; out[2]-=trailAnchor[2];
  return out;
}

export function pushTrail(i: number, ts: number): void {
  const a=trails[i];
  a.copyWithin(0,3);
  trailPos(i, ts, tmp);
  a[(TRAIL_N-1)*3]=tmp[0]; a[(TRAIL_N-1)*3+1]=tmp[1]; a[(TRAIL_N-1)*3+2]=tmp[2];
}

/** Push this frame's samples to the GPU. Only called on a frame that took any. */
export function uploadTrails(): void {
  for(let i=0;i<NB;i++){
    gl.bindBuffer(gl.ARRAY_BUFFER,trailBufs[i]);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,trails[i]);
  }
}

export function refillTrails(): void {
  bodyPos(0, simClock.simT, tmpSun);
  trailAnchor[0]=tmpSun[0]; trailAnchor[1]=tmpSun[1]; trailAnchor[2]=tmpSun[2];
  // The trail is the path the viewer has watched being swept: sample TRAIL_N−1 is now and
  // the brightest, sample 0 the earliest seen and the dimmest. With the clock running
  // backwards "earliest seen" is the LATER sim time, so the samples run the other way —
  // otherwise the trail pointed into the sim-past, which in reverse lies ahead of the
  // body, and it led instead of trailed.
  const dirT = simClock.shuttle < 0 ? -1 : 1;
  for(let i=0;i<NB;i++){
    const a=trails[i];
    for(let k=0;k<TRAIL_N;k++){
      trailPos(i, simClock.simT - dirT*((TRAIL_N-1)-k)*simClock.dtSample, tmp);
      a[k*3]=tmp[0]; a[k*3+1]=tmp[1]; a[k*3+2]=tmp[2];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,trailBufs[i]);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,a);
  }
}

export interface TrailInputs {
  projMat: Float32Array
  viewMat: Float32Array
  camDist: number
  org: Float64Array
  /** the two transparency sliders, and the star gain the thin lines are lifted with */
  trailAlpha: number
  orbitAlpha: number
  starGain: number
  /** derived from those sliders: 0% is off. psH is the swept helix, psO the closed ring */
  psH: boolean
  psO: boolean
  showP9: boolean
  showDwarfs: boolean
  wasEaten: readonly boolean[]
}

/**
 * Trail buffers hold absolute positions, and at the Sun's radius a float32 step is 6.1e-5
 * scene units — a quarter pixel around cam.dist 0.17. Fade across that boundary rather than
 * cutting, so leaving real scale doesn't drop them abruptly.
 *
 * Planets are drawable only while their points stand apart from the Sun's: Neptune's orbit
 * spans about six pixels at 0.13 units of camera distance, and beyond that the whole system
 * is inside one point — only the Sun's own trail means anything there.
 */
export function drawTrails(
  { projMat, viewMat, camDist, org, trailAlpha, orbitAlpha, starGain,
    psH, psO, showP9, showDwarfs, wasEaten }: TrailInputs,
): void {
  const solarClose = camDist < 0.13;
  gl.useProgram(pTr);
  gl.uniformMatrix4fv(U.trProj,false,projMat);
  gl.uniformMatrix4fv(U.trView,false,viewMat);
  gl.uniform1f(U.trLen,TRAIL_N);
  const last = (showP9 ? NB : I_P9)-1;
  // the origin for anchored buffers, subtracted in double precision
  const aox = org[0]-trailAnchor[0], aoy = org[1]-trailAnchor[1], aoz = org[2]-trailAnchor[2];
  gl.uniform3f(U.trOrg, aox, aoy, aoz);
  for(let i=last;i>=0;i--){
    const c=BODIES[i][4] as number[];
    if(i === I_P9 && !showP9) continue;
    if(i >= N_PLANETS && i < I_P9 && !showDwarfs) continue;
    if(i <= 3 && i > 0 && wasEaten[i]) continue;   // no path for a planet that is gone
    if(readout.globePx > 40) continue;   // zoomed onto the globe, every orbit and helix is a line across the sky
    if(i > 0){
      if(!solarClose) continue;                    // collapsed into the Sun's point
      const spo = (BODIES[i][1] as number)/simClock.dtSample;
      // the ring draws when asked for, or as the fallback for an unresolvable helix
      if(psO || (psH && spo < 12)){
        // the closed path itself — also the honest fallback when the sampling
        // cannot resolve the orbit and no accurate helix is drawable
        gl.uniform3f(U.trOrg, 0,0,0);
        gl.uniform3f(U.trCol, c[0],c[1],c[2]);
        gl.uniform1f(U.trA, 0.4*orbitAlpha*(1+starGain*0.9));
        gl.uniform1f(U.trFlat, 1.0);
        gl.bindVertexArray(ringVaos[i]);
        gl.drawArrays(gl.LINE_LOOP, 0, RING_N);
        gl.uniform1f(U.trFlat, 0.0);
        gl.uniform3f(U.trOrg, aox, aoy, aoz);
      }
      if(!psH || spo < 12) continue;
      // the accurate helix: the swept absolute path, no styling — Mercury winds
      // tightly, the giants barely wave, because that is how it actually is
      gl.uniform3f(U.trCol, c[0],c[1],c[2]);
      gl.uniform1f(U.trA, 0.55*trailAlpha*(1+starGain*0.9));
      gl.bindVertexArray(trailVaos[i]);
      gl.drawArrays(gl.LINE_STRIP, TRAIL_N-Math.min(TRAIL_N, Math.round(200*spo)), Math.min(TRAIL_N, Math.round(200*spo)));
      continue;
    }
    if(!psH) continue;   // the Sun's arc is a swept trail: it follows the helix switch
    gl.uniform3f(U.trCol,c[0],c[1],c[2]);
    // lift with the star gain, or a brightened field washes the thin line out
    gl.uniform1f(U.trA, 0.9*trailAlpha*(1+starGain*0.9));
    gl.bindVertexArray(trailVaos[i]);
    gl.drawArrays(gl.LINE_STRIP, 0, TRAIL_N);
  }
}
