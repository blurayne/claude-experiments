import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import { dynVAO, trackVAOBuffers } from '../../gpu/buffers'
import SUN_VS from '../../shaders/sun.vert?raw'
import BH_FS from '../../shaders/bh.frag?raw'
import { pPt, pTr, U } from './points'
import { drawRings } from './rings'
import { drawRadioField } from './gcradio'
import {
  SSTARS, SGRA, BH1_INFO, sstarPos, sstarOrbitPoint, sstarA, bh1Relative, bh1OrbitPoint, yearOf,
} from '../../astro/gc'
import type { Vec3 } from '../../core/mat4'
import { AU2U } from '../../astro/constants'

/**
 * The Galactic Centre, and the nearest black hole.
 *
 * Both are drawn in their OWN frames. Everything else in the piece is Sun-relative, and the
 * Sun is 900 units from the Centre: a float32 there is good to about a hundred AU, which is
 * the whole pericentre of S2. So the frame hands this pass a view matrix built (in doubles)
 * with the eye relative to Sagittarius A* — and another relative to Gaia BH1's barycentre —
 * and every position uploaded here is relative to that same point. Small numbers, exact.
 *
 * What is drawn: the fourteen S-stars as points on their published ellipses, the hole as a
 * findable dot from afar and as the ray-marched shadow-and-disc once its true size is more
 * than a few pixels; and Gaia BH1's star round its dark companion the same way, both bodies
 * swinging about their common centre by their masses.
 */

const N_S = SSTARS.length
const RING_SEGS = 240

// ---------- the S-stars' orbits, as static line loops ----------
const orbitVAO = gl.createVertexArray()!
{
  const pts = new Float32Array((N_S + 1)*RING_SEGS*3)   // the S-stars, then BH1's star
  const tmp = new Float64Array(3)
  let o = 0
  for(let k=0;k<N_S;k++) for(let j=0;j<RING_SEGS;j++){
    sstarOrbitPoint(k, j/RING_SEGS*2*Math.PI, tmp)
    pts[o++] = tmp[0]; pts[o++] = tmp[1]; pts[o++] = tmp[2]
  }
  for(let j=0;j<RING_SEGS;j++){        // the star's orbit round the hole: the relative orbit itself
    bh1OrbitPoint(j/RING_SEGS*2*Math.PI, tmp)
    pts[o++] = tmp[0]; pts[o++] = tmp[1]; pts[o++] = tmp[2]
  }
  gl.bindVertexArray(orbitVAO)
  const b = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)
  trackVAOBuffers(orbitVAO, [b])
}
const I_BH1_STAR = N_S

// ---------- the moving points ----------
const starsGL = dynVAO(N_S + 3)
const sPos = new Float32Array((N_S + 3)*3), sSize = new Float32Array(N_S + 3), sCol = new Float32Array((N_S + 3)*3), sW = new Float32Array(N_S + 3)
/** the S-stars' positions this frame, relative to Sgr A* — the labels read them */
export const sstarRel = new Float32Array(N_S*3)
/** Gaia BH1's star this frame, relative to the hole */
export const bh1StarRel = new Float32Array(3)
const tmpD = new Float64Array(3)
const ORIGIN = new Float32Array(3)

// ---------- the S-stars' swept tails ----------
// A short ring of recent positions behind each star, faded toward its head, so the swing
// through pericentre reads as the speed it is. Each tail spans an eighth of its own star's
// period, resampled per frame as the clock advances; a jump or a change of direction
// refills it from the current position, exactly as the planets' trails do.
const TAIL_N = 96
const tailPos = new Float32Array(N_S*TAIL_N*3)
const tailAt = new Float64Array(N_S)          // the year of each star's newest sample
let tailYear = NaN                            // the year the tails were last advanced to
const tailGL = (()=>{ const v=gl.createVertexArray()!; gl.bindVertexArray(v);
  const b=gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER, tailPos.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); trackVAOBuffers(v, [b]); return { vao: v, buf: b }; })()
function refillTails(year: number): void {
  for(let k=0;k<N_S;k++){
    const o = k*TAIL_N*3
    for(let j=0;j<TAIL_N;j++){ tailPos[o+j*3] = sstarRel[k*3]; tailPos[o+j*3+1] = sstarRel[k*3+1]; tailPos[o+j*3+2] = sstarRel[k*3+2] }
    tailAt[k] = year
  }
  tailYear = year
}
function advanceTails(year: number): void {
  // a leap of more than a decade, or the clock running the other way, is a new tail
  if(!(Math.abs(year - tailYear) < 10) || (year - tailYear)*(tailYear - tailAt[0]) < 0 && Math.abs(year - tailYear) > 1e-6){ refillTails(year); return }
  const dir = year >= tailYear ? 1 : -1
  for(let k=0;k<N_S;k++){
    // sampled by the clock, not by the frame: a tail is an eighth of the orbit whatever the
    // frame rate, so a slow machine fills in the samples a fast one drew one per frame
    const step = SSTARS[k].P/8/TAIL_N
    let pushed = 0
    while(Math.abs(year - tailAt[k]) >= step && pushed < 400){
      tailAt[k] += dir*step
      sstarPos(k, tailAt[k], tmpD)
      const o = k*TAIL_N*3
      tailPos.copyWithin(o, o + 3, o + TAIL_N*3)                  // drop the oldest, the head is last
      tailPos[o+(TAIL_N-1)*3] = tmpD[0]; tailPos[o+(TAIL_N-1)*3+1] = tmpD[1]; tailPos[o+(TAIL_N-1)*3+2] = tmpD[2]
      pushed++
    }
    if(pushed >= 400) tailAt[k] = year                             // a leap too far to fill: catch up
  }
  tailYear = year
}
function drawTails(proj: Float32Array, view: Float32Array, alpha: number): void {
  gl.useProgram(pTr)
  gl.uniformMatrix4fv(U.trProj, false, proj)
  gl.uniformMatrix4fv(U.trView, false, view)
  gl.uniform3f(U.trOrg, 0, 0, 0)
  gl.uniform1f(U.trLen, TAIL_N); gl.uniform1f(U.trFlat, 0.0)
  gl.uniform3f(U.trCol, 0.55, 0.72, 1.0)
  gl.uniform1f(U.trA, alpha)
  gl.bindBuffer(gl.ARRAY_BUFFER, tailGL.buf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, tailPos)
  gl.bindVertexArray(tailGL.vao)
  for(let k=0;k<N_S;k++) gl.drawArrays(gl.LINE_STRIP, k*TAIL_N, TAIL_N)
}

// ---------- the hole itself ----------
const pBH = prog(SUN_VS, BH_FS)
const UB = {
  proj: gl.getUniformLocation(pBH,'uProj'), view: gl.getUniformLocation(pBH,'uView'),
  sz: gl.getUniformLocation(pBH,'uSz'), rs: gl.getUniformLocation(pBH,'uRs'), mirror: gl.getUniformLocation(pBH,'uMirror'),
  discN: gl.getUniformLocation(pBH,'uDiscN'), disc: gl.getUniformLocation(pBH,'uDisc'), discOut: gl.getUniformLocation(pBH,'uDiscOut'),
  spin: gl.getUniformLocation(pBH,'uSpin'), time: gl.getUniformLocation(pBH,'uTime'), fade: gl.getUniformLocation(pBH,'uFade'),
}
const vaoOne = (()=>{ const v=gl.createVertexArray()!; gl.bindVertexArray(v);
  const b=gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(3),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return v; })()

/** the sprite reaches this many Schwarzschild radii from the hole: the disc, and room round it */
const SPRITE_RS = 15
/** the modelled flow round Sgr A* runs out to here, in Schwarzschild radii */
const SGRA_DISC_OUT = 12

/** Sgr A*'s modelled disc normal in scene coordinates: tilted `discIncDeg` from the line of sight toward the sky's north */
const SGRA_DISC_N: Vec3 = (()=>{
  const { N, Z } = SGRA.basis, c = Math.cos(SGRA.discIncDeg*Math.PI/180), s = Math.sin(SGRA.discIncDeg*Math.PI/180)
  return [-Z[0]*c + N[0]*s, -Z[1]*c + N[1]*s, -Z[2]*c + N[2]*s]
})()

export interface GcInputs {
  projMat: Float32Array
  /** the view with the eye relative to Sagittarius A*, and the one relative to Gaia BH1's barycentre */
  viewGC: Float32Array
  viewBH1: Float32Array
  /** the eye's distance to each, scene units */
  distGC: number
  distBH1: number
  pxScale: number
  /** the view's height in device pixels: the orbits fade as they outgrow it */
  viewH: number
  simT: number
  shimT: number
  /** the projection's x reflection, for the billboard's frame */
  mirror: number
  /** the orbit rings' opacity: the same slider that governs the planets' */
  orbitAlpha: number
  showOrbits: boolean
  /** the swept tails' opacity: the helix slider, which is its own switch at zero */
  trailAlpha: number
  showTails: boolean
  /** the Sun-relative view and origin, put back on the point program when this pass is done */
  viewMat: Float32Array
  org: Float64Array
}

export interface GcResult {
  /** whether anything of the Centre, or of BH1, was drawn — the labels follow */
  gcOn: boolean
  bh1On: boolean
  /** the holes' apparent sizes, in pixels: below a few, the findable dot stands in */
  sgraPx: number
  bh1Px: number
  /** how much of the radio field is showing (0 when none of it is drawn) — its labels follow */
  radioA: number
}

/**
 * A reticle: a thin screen-facing circle round a point, on the ring program. The overdriven
 * sprite alone was not enough to tell an S-star from the nuclear cluster's crowd — a point
 * is a point — so each is circled, the way a finder chart marks the star it means.
 */
function drawReticles(proj: Float32Array, view: Float32Array, pts: Float32Array, n: number, px: number, dist: number, pxScale: number, colour: readonly number[]): void {
  const right = [view[0], view[4], view[8]], up = [view[1], view[5], view[9]]
  const r = px*dist/pxScale
  for(let k=0;k<n;k++) drawRings({ projMat: proj, viewMat: view, centre: [pts[k*3], pts[k*3+1], pts[k*3+2]], radius: r, colour, planes: [[right, up]] })
}

/** a fixed size on screen, expressed as the world size the point shader wants at this distance */
const pxWorld = (px: number, dist: number, pxScale: number): number => px*dist/pxScale

/** the ray-marched hole, as a billboard on its own point */
function drawHole(proj: Float32Array, view: Float32Array, spritePx: number, rsPx: number, discN: Vec3 | null, shimT: number, mirror: number, fade: number): void {
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.useProgram(pBH)
  gl.uniformMatrix4fv(UB.proj, false, proj)
  gl.uniformMatrix4fv(UB.view, false, view)
  gl.uniform1f(UB.sz, spritePx)
  gl.uniform1f(UB.rs, rsPx/(spritePx*0.5))
  gl.uniform1f(UB.mirror, mirror)
  if(discN){
    // the normal in the sprite's frame: the view's rotation, then the screen's x reflection
    const nx = view[0]*discN[0] + view[4]*discN[1] + view[8]*discN[2]
    const ny = view[1]*discN[0] + view[5]*discN[1] + view[9]*discN[2]
    const nz = view[2]*discN[0] + view[6]*discN[1] + view[10]*discN[2]
    gl.uniform3f(UB.discN, nx*mirror, ny, nz)
    gl.uniform1f(UB.disc, 1.0)
  } else {
    gl.uniform3f(UB.discN, 0, 0, 1)
    gl.uniform1f(UB.disc, 0.0)
  }
  gl.uniform1f(UB.discOut, SGRA_DISC_OUT)
  gl.uniform1f(UB.spin, 1.0)
  gl.uniform1f(UB.time, shimT)
  gl.uniform1f(UB.fade, fade)
  gl.bindVertexArray(vaoOne); gl.drawArrays(gl.POINTS, 0, 1)
  gl.blendFunc(gl.ONE, gl.ONE)
}

function drawOrbits(proj: Float32Array, view: Float32Array, first: number, count: number, alpha: number, colour: readonly number[]): void {
  gl.useProgram(pTr)
  gl.uniformMatrix4fv(U.trProj, false, proj)
  gl.uniformMatrix4fv(U.trView, false, view)
  gl.uniform3f(U.trOrg, 0, 0, 0)
  gl.uniform1f(U.trLen, 1e9); gl.uniform1f(U.trFlat, 1.0)
  gl.uniform3f(U.trCol, colour[0], colour[1], colour[2])
  gl.uniform1f(U.trA, alpha)
  gl.bindVertexArray(orbitVAO)
  for(let k=first;k<first+count;k++) gl.drawArrays(gl.LINE_LOOP, k*RING_SEGS, RING_SEGS)
}

function drawPoints(proj: Float32Array, view: Float32Array, n: number): void {
  gl.useProgram(pPt)
  gl.uniformMatrix4fv(U.ptProj, false, proj)
  gl.uniformMatrix4fv(U.ptView, false, view)
  gl.uniform1f(U.ptSpin, 0.0); gl.uniform1f(U.ptVM, 0.0); gl.uniform1f(U.ptTide, 0.0)
  gl.uniform1f(U.ptMinB, 0.0); gl.uniform1f(U.ptMinSz, 1.3); gl.uniform1f(U.ptCap, 110.0)
  gl.uniform1f(U.ptGal, 0.0); gl.uniform1f(U.ptFade, 0.0)
  gl.uniform3f(U.ptOrg, 0, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, starsGL.p); gl.bufferSubData(gl.ARRAY_BUFFER, 0, sPos.subarray(0, n*3))
  gl.bindBuffer(gl.ARRAY_BUFFER, starsGL.s); gl.bufferSubData(gl.ARRAY_BUFFER, 0, sSize.subarray(0, n))
  gl.bindBuffer(gl.ARRAY_BUFFER, starsGL.c); gl.bufferSubData(gl.ARRAY_BUFFER, 0, sCol.subarray(0, n*3))
  gl.bindBuffer(gl.ARRAY_BUFFER, starsGL.w); gl.bufferSubData(gl.ARRAY_BUFFER, 0, sW.subarray(0, n))
  gl.bindVertexArray(starsGL.vao); gl.drawArrays(gl.POINTS, 0, n)
}

/**
 * Draw the Centre and BH1 for this frame. The point program's view matrix and origin are put
 * back to the frame's own before returning, since the passes after this one inherit them.
 */
export function drawGalacticCentre(inp: GcInputs): GcResult {
  const { projMat, viewGC, viewBH1, distGC, distBH1, pxScale, viewH, simT, shimT, mirror, orbitAlpha, showOrbits, trailAlpha, showTails, viewMat, org } = inp
  const year = yearOf(simT)
  const res: GcResult = { gcOn: false, bh1On: false, sgraPx: 0, bh1Px: 0, radioA: 0 }

  // ---------- the radio sky: the map's objects, from the middle distances ----------
  if(distGC < 1000){
    res.radioA = drawRadioField(projMat, viewGC, distGC, pxScale)
    if(res.radioA > 0) res.gcOn = true
  }

  // ---------- Sagittarius A* and the S-stars: only from within ~1,200 light years ----------
  if(distGC < 40){
    res.gcOn = true
    // the hole's true shadow, and the sprite that holds the disc round it
    const rsPx = SGRA.rsU*pxScale/distGC
    res.sgraPx = 2*SGRA.shadowRs*rsPx
    // the S-stars: dots on their ellipses, fading in as the orbits become wider than a few pixels
    const s2px = sstarA(1).u*pxScale/distGC          // S2's semi-major axis on screen
    const fade = Math.min(1, Math.max(0, (s2px - 4)/24))
    let n = 0
    for(let k=0;k<N_S;k++){
      sstarPos(k, year, tmpD)
      sstarRel[k*3] = sPos[n*3] = tmpD[0]; sstarRel[k*3+1] = sPos[n*3+1] = tmpD[1]; sstarRel[k*3+2] = sPos[n*3+2] = tmpD[2]
      // Drawn as markers, not as stars: at any framing that shows the orbits, a B star at
      // the Centre is one white point among the nuclear cluster's thousands, so these are
      // overdriven — the sprite's corona, invisible at normal brightness, becomes a blue
      // halo round a white core, which is what tells an S-star from the crowd. S2 largest.
      sSize[n] = pxWorld(k === 1 ? 16 : 13, distGC, pxScale)
      const b = (k === 1 ? 14 : 11)*fade
      sCol[n*3] = 0.40*b; sCol[n*3+1] = 0.66*b; sCol[n*3+2] = 1.0*b; sW[n] = 0
      n++
    }
    // the hole's findable dot, until the shadow itself is more than a few pixels
    if(res.sgraPx < 5){
      sPos[n*3]=0; sPos[n*3+1]=0; sPos[n*3+2]=0
      sSize[n] = pxWorld(12, distGC, pxScale)
      sCol[n*3]=5.0; sCol[n*3+1]=4.4; sCol[n*3+2]=5.6; sW[n]=0
      n++
    }
    advanceTails(year)
    if(showTails && fade > 0.001) drawTails(projMat, viewGC, trailAlpha*0.9*fade)
    if(showOrbits && fade > 0.001) for(let k=0;k<N_S;k++){
      // an orbit that is wider than a few views is a straight line across the frame, and a
      // dozen of them are a cage: each fades out as its ellipse outgrows the screen
      const apx = sstarA(k).u*pxScale/distGC
      const wide = 1 - Math.min(1, Math.max(0, (apx - 1.6*viewH)/(2.4*viewH)))
      if(wide > 0.001) drawOrbits(projMat, viewGC, k, 1, orbitAlpha*0.42*fade*wide, [0.62, 0.70, 0.95])
    }
    drawPoints(projMat, viewGC, n)
    if(fade > 0.001) drawReticles(projMat, viewGC, sstarRel, N_S, 7, distGC, pxScale, [0.30*fade, 0.42*fade, 0.62*fade])
    if(res.sgraPx < 5) drawReticles(projMat, viewGC, ORIGIN, 1, 9, distGC, pxScale, [0.55, 0.50, 0.58])
    if(res.sgraPx >= 5){
      const spritePx = Math.min(4096, 2*SPRITE_RS*rsPx)
      drawHole(projMat, viewGC, spritePx, rsPx, SGRA_DISC_N, shimT, mirror, 1.0)
    }
  }

  // ---------- Gaia BH1: only from within ~60 light years ----------
  if(distBH1 < 2){
    res.bh1On = true
    const rsPx = BH1_INFO.rsU*pxScale/distBH1
    res.bh1Px = 2*SGRA.shadowRs*rsPx
    bh1Relative(year, tmpD)
    bh1StarRel[0] = tmpD[0]; bh1StarRel[1] = tmpD[1]; bh1StarRel[2] = tmpD[2]
    const orbitPx = BH1_INFO.aAU*AU2U*pxScale/distBH1
    const fade = Math.min(1, Math.max(0, (orbitPx - 4)/24))
    let n = 0
    // the Sun-like companion: a G dwarf, the one thing here that shines
    sPos[0]=bh1StarRel[0]; sPos[1]=bh1StarRel[1]; sPos[2]=bh1StarRel[2]
    sSize[0] = pxWorld(14, distBH1, pxScale); sCol[0]=9.0; sCol[1]=7.4; sCol[2]=4.2; sW[0]=0; n++   // overdriven like the S-stars: a warm halo
    if(res.bh1Px < 5){
      sPos[3]=0; sPos[4]=0; sPos[5]=0
      sSize[1] = pxWorld(10, distBH1, pxScale)*fade; sCol[3]=4.0; sCol[4]=3.6; sCol[5]=4.6; sW[1]=0; n++
    }
    if(showOrbits && fade > 0.001) drawOrbits(projMat, viewBH1, I_BH1_STAR, 1, orbitAlpha*0.45*fade, [1.0, 0.86, 0.55])
    drawPoints(projMat, viewBH1, n)
    if(fade > 0.001) drawReticles(projMat, viewBH1, bh1StarRel, 1, 7, distBH1, pxScale, [0.62*fade, 0.52*fade, 0.30*fade])
    if(res.bh1Px < 5) drawReticles(projMat, viewBH1, ORIGIN, 1, 9, distBH1, pxScale, [0.55, 0.50, 0.58])
    if(res.bh1Px >= 5){
      // there is no known accretion flow on Gaia BH1 — it is dark in X-rays — so no disc is drawn
      const spritePx = Math.min(4096, 2*6*rsPx)
      drawHole(projMat, viewBH1, spritePx, rsPx, null, shimT, mirror, 1.0)
    }
  }
  if(res.gcOn || res.bh1On){
    // the passes after this one draw on the point program with the frame's own view
    gl.useProgram(pPt)
    gl.uniformMatrix4fv(U.ptView, false, viewMat)
    gl.uniform3f(U.ptOrg, org[0], org[1], org[2])
  }
  return res
}
