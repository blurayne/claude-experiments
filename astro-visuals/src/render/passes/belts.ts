import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import AB_VS from '../../shaders/ab.vert?raw'
import KB_VS from '../../shaders/kb.vert?raw'
import OO_VS from '../../shaders/oo.vert?raw'
import BELT_FS from '../../shaders/belt.frag?raw'
import { E1, E2, AU2U, OO_REAL, REAL_MODE } from '../../astro/constants'
import { EN } from '../../astro/bodies'
import { AB_N, KB_N, OO_N, type Belts } from '../../scene/belts'
import { drawRings, type RingPlane } from './rings'

/**
 * The three populations that follow the Sun: the asteroid belt, the Kuiper belt and the Oort
 * cloud. Static geometry, carried round by the vertex shader from a radius, an angle and a
 * Kepler period rather than re-integrated every frame.
 *
 * They fade as the camera pulls out, and that is not decoration. Past the point where a whole
 * belt spans a couple of dozen pixels its points pile up additively into a false bright blob
 * sitting on the Sun's own pixel.
 *
 * Programs, uniform tables, vertex arrays and the draw all live together — the shape the rest
 * of the passes will take. The three tables stay hand-written: they genuinely differ, since
 * the Oort cloud has neither an orbital plane nor a time, and a generic harvester would union
 * the key lists and hand the shaders defaults they were never written to receive.
 */

const pKB = prog(KB_VS, BELT_FS), pOO = prog(OO_VS, BELT_FS), pAB = prog(AB_VS, BELT_FS);
const UA: Record<string, WebGLUniformLocation | null> = {}; for(const k of ['uProj','uView','uPx','uT','uS','uSun','uE1','uE2','uEN','uColor','uAlpha']) UA[k]=gl.getUniformLocation(pAB,k);
const UK: Record<string, WebGLUniformLocation | null> = {}; for(const k of ['uProj','uView','uPx','uT','uS','uSun','uE1','uE2','uEN','uColor','uAlpha']) UK[k]=gl.getUniformLocation(pKB,k);
const UO: Record<string, WebGLUniformLocation | null> = {}; for(const k of ['uProj','uView','uPx','uS','uSun','uColor','uAlpha']) UO[k]=gl.getUniformLocation(pOO,k);

let vaoKB: WebGLVertexArrayObject
let vaoOO: WebGLVertexArrayObject
let vaoABr: WebGLVertexArrayObject
let vaoABd: WebGLVertexArrayObject

/**
 * Upload the belts. Called from main.ts rather than run at import: buildBelts() is the fourth
 * of the seven things that consume randomness at boot, and generating here would move it in
 * that sequence, which the seeded parity stream would notice immediately.
 */
export function initBelts(b: Belts): void {
  const { abRT, abRTd, abH, abHd, abSz, abP, kbRT, kbH, kbSz, ooOff, ooSz } = b
  vaoKB = gl.createVertexArray()!; gl.bindVertexArray(vaoKB);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,kbRT,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,kbH,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,kbSz,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,1,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null);
  const bufAbSz=gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,bufAbSz); gl.bufferData(gl.ARRAY_BUFFER,abSz,gl.STATIC_DRAW);
  const bufAbP =gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,bufAbP);  gl.bufferData(gl.ARRAY_BUFFER,abP,gl.STATIC_DRAW);
  function beltVAO(rt: Float32Array, h: Float32Array): WebGLVertexArrayObject {
    const vao=gl.createVertexArray()!; gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,rt,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,h,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bufAbSz); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,1,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bufAbP);  gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3,1,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null); return vao;
  }
  vaoABr = beltVAO(abRT, abH); vaoABd = beltVAO(abRTd, abHd);
  vaoOO = gl.createVertexArray()!; gl.bindVertexArray(vaoOO);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,ooOff,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,ooSz,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null);
}

export interface BeltInputs {
  projMat: Float32Array
  viewMat: Float32Array
  pxScale: number
  camDist: number
  simT: number
  /** Gliese 710's distance in light years: a passing star stirs the cloud, and it brightens. */
  g710Dist: number
  showBelt: boolean
  showKuiper: boolean
  showOort: boolean
  /** Earth's diameter on screen: past 40 px the shell's circles are lines across the sky. */
  globePx: number
}

/** The three great circles that suggest the Oort cloud's spherical boundary. */
const SHELL: readonly RingPlane[] = [[E1,E2],[E1,EN],[E2,EN]];

export function drawBelts(
  { projMat, viewMat, pxScale, camDist, simT, g710Dist, showBelt, showKuiper, showOort, globePx }: BeltInputs,
): void {
  // points would pile up additively into a false bright blob on the Sun's pixel.
  const beltFade = (rw: number) => Math.max(0, Math.min(1, (rw/camDist*pxScale - 24)/50));
  const abA = beltFade(REAL_MODE ? 2.7*AU2U : 16.6);
  const kbA = beltFade(REAL_MODE ? 45*AU2U : 45);
  const ooA = beltFade(REAL_MODE ? 130*OO_REAL : 130);
  if(showBelt && abA>0){
    gl.useProgram(pAB);
    gl.uniformMatrix4fv(UA.uProj,false,projMat);
    gl.uniformMatrix4fv(UA.uView,false,viewMat);
    // simT in float32 quantises the phase after ~1e5 years and the ring collapses
    // into spokes; wrapped time (exact in f64, small in f32) keeps every phase clean.
    // Anonymous specks reshuffling once per 65,536 years is invisible in a uniform ring.
    gl.uniform1f(UA.uPx,pxScale); gl.uniform1f(UA.uT, simT % 65536);
    gl.uniform1f(UA.uS, REAL_MODE?AU2U:1.0);
    gl.uniform3f(UA.uSun,0,0,0);
    gl.uniform3f(UA.uE1,E1[0],E1[1],E1[2]);
    gl.uniform3f(UA.uE2,E2[0],E2[1],E2[2]);
    gl.uniform3f(UA.uEN,EN[0],EN[1],EN[2]);
    gl.uniform3f(UA.uColor,0.15,0.13,0.11); gl.uniform1f(UA.uAlpha,abA);
    gl.bindVertexArray(REAL_MODE?vaoABr:vaoABd); gl.drawArrays(gl.POINTS,0,AB_N);
  }
  if(showKuiper && kbA>0){
    gl.useProgram(pKB);
    gl.uniformMatrix4fv(UK.uProj,false,projMat);
    gl.uniformMatrix4fv(UK.uView,false,viewMat);
    gl.uniform1f(UK.uPx,pxScale); gl.uniform1f(UK.uT, simT % 65536);
    gl.uniform1f(UK.uS, REAL_MODE?AU2U:1.0); // real mode: the belt radii are AU
    gl.uniform3f(UK.uSun,0,0,0);
    gl.uniform3f(UK.uE1,E1[0],E1[1],E1[2]);
    gl.uniform3f(UK.uE2,E2[0],E2[1],E2[2]);
    gl.uniform3f(UK.uEN,EN[0],EN[1],EN[2]);
    gl.uniform3f(UK.uColor,0.10,0.11,0.14); gl.uniform1f(UK.uAlpha,kbA);
    gl.bindVertexArray(vaoKB); gl.drawArrays(gl.POINTS,0,KB_N);
  }
  if(showOort){ // rings always (they locate the shell); points fade via ooA
    gl.useProgram(pOO);
    gl.uniformMatrix4fv(UO.uProj,false,projMat);
    gl.uniformMatrix4fv(UO.uView,false,viewMat);
    gl.uniform1f(UO.uPx,pxScale);
    gl.uniform1f(UO.uS, REAL_MODE?OO_REAL:1.0);
    gl.uniform3f(UO.uSun,0,0,0);
    // a passing star stirs the cloud: brighten it while Gliese 710 is inside
    const stir = Math.min(1, Math.max(0, (1.9-g710Dist)/1.9));
    gl.uniform3f(UO.uColor, 0.11+0.30*stir, 0.12+0.20*stir, 0.15+0.10*stir);
    gl.uniform1f(UO.uAlpha,ooA);
    gl.bindVertexArray(vaoOO); gl.drawArrays(gl.POINTS,0,OO_N);
    // and the boundary itself: a wireframe hint of where the shell stands. Its points fade
    // with ooA, these circles do not — they are what locates the cloud once it is too far
    // out to resolve. Zoomed onto a globe they would be three lines across the sky, so the
    // planes are withheld there and the program is left set exactly as it would have been.
    drawRings({
      projMat, viewMat, centre: [0,0,0],
      radius: REAL_MODE?178.0*OO_REAL:178.0,
      colour: [0.10,0.13,0.19],
      planes: globePx <= 40 ? SHELL : [],
    });
  }
}
