import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import SUN_VS from '../../shaders/sun.vert?raw'
import SUN_FS from '../../shaders/sun.frag?raw'
import PN_FS from '../../shaders/pn.frag?raw'
import { AU2U } from '../../astro/constants'
import type { PnState, SunTint } from '../../astro/sun'

/**
 * The Sun at close range, and what it leaves behind. Two programs over one vertex shader
 * and one point: both are billboards standing on the Sun's own position, which is the
 * rendering origin, so the vertex data is three zeroes and everything else is a uniform.
 *
 * They are drawn together and in this order — the envelope under the star — because the
 * disc is opaque and the envelope is not. Neither knows the clock: the age comes in as a
 * `PnState` and a `SunTint` that `astro/sun` computed, the same model the Sun's dot colour
 * and the engulfment ages read.
 */

// Once the Sun's true disc spans more than a few pixels, the point sprite hands over to
// a procedural star: limb-darkened granulation that churns, prominence arcs that rise
// and fall with a slow magnetic-storm cycle, and a streaked corona. All of it is noise
// shaped in the fragment shader — no texture, and nothing about its SIZE is stylised:
// the disc is the Sun's real diameter at the real distance.
const pSunP = prog(SUN_VS, SUN_FS);
const USn = {
  proj: gl.getUniformLocation(pSunP,'uProj'), view: gl.getUniformLocation(pSunP,'uView'),
  time: gl.getUniformLocation(pSunP,'uTime'), sz: gl.getUniformLocation(pSunP,'uSz'),
  disc: gl.getUniformLocation(pSunP,'uDisc'),
  colD: gl.getUniformLocation(pSunP,'uColD'), colB: gl.getUniformLocation(pSunP,'uColB'),
};
// ---------- what is left of the Sun ----------
// The shed envelope, on the same one-point vertex shader as the disc: a limb-brightened
// shell — a hollow sphere is brightest where the line of sight runs longest through it,
// which is the rim — in the colours every planetary nebula actually shows, [O III] teal
// inside and Hα red at the edge, with filaments and a mild two-lobed tilt, since a round
// one is the exception. Additive, drawn under the central star.

const pPN = prog(SUN_VS, PN_FS);
const UPN = {
  proj: gl.getUniformLocation(pPN,'uProj'), view: gl.getUniformLocation(pPN,'uView'),
  sz: gl.getUniformLocation(pPN,'uSz'), time: gl.getUniformLocation(pPN,'uTime'),
  age: gl.getUniformLocation(pPN,'uAge'), alpha: gl.getUniformLocation(pPN,'uAlpha'), burst: gl.getUniformLocation(pPN,'uBurst'),
};
const vaoSunPt = (()=>{ const v=gl.createVertexArray(); gl.bindVertexArray(v);
  const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(3),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return v; })();

export interface ShedInputs {
  projMat: Float32Array
  viewMat: Float32Array
  /** the variability clock: wall time, so the filaments keep churning while paused */
  shimT: number
  pxScale: number
  /** the eye's distance to the Sun — from Earth it is an AU, not the camera's own distance */
  camSunDist: number
  /** what `astro/sun` says has been shed by now; null before the AGB and once it has gone */
  pn: PnState | null
}

/**
 * What the Sun sheds: under the star, additive, only from outside it — a billboard cannot
 * show a hollow shell from within, and from inside a real one there is nothing to see but a
 * faint sky glow anyway.
 *
 * @returns whether it is on screen this frame. The Sun's label reads "Anthropic Nebula"
 * while it is, so the answer is the caller's, not this pass's to publish.
 */
export function drawShed({ projMat, viewMat, shimT, pxScale, camSunDist, pn }: ShedInputs): boolean {
  if(!pn) return false;
  const rScene = pn.rAU*AU2U, px = (2*rScene/0.74)*pxScale/camSunDist;
  const outside = Math.min(1, Math.max(0, (camSunDist/rScene - 1.15)/0.6));
  const alpha = pn.alpha*outside;
  if(!(alpha > 0.004 && px > 3)) return false;
  gl.useProgram(pPN);
  gl.uniformMatrix4fv(UPN.proj,false,projMat);
  gl.uniformMatrix4fv(UPN.view,false,viewMat);
  gl.uniform1f(UPN.time, shimT);
  gl.uniform1f(UPN.age, pn.age);
  gl.uniform1f(UPN.alpha, alpha);
  const burst = Math.exp(-Math.pow((pn.age - 0.07)/0.06, 2));   // the casting itself
  gl.uniform1f(UPN.burst, burst);
  gl.uniform1f(UPN.sz, Math.min(1800, px*(1 + 2.5*burst)));
  gl.bindVertexArray(vaoSunPt); gl.drawArrays(gl.POINTS,0,1);
  return true;
}

export interface SunDiscInputs {
  projMat: Float32Array
  viewMat: Float32Array
  shimT: number
  /** the photosphere's diameter in device pixels; below 7 the body pass still has the Sun */
  plasmaSunPx: number
  /** the photosphere's colour and the bright core's, both from the model's temperature */
  tint: SunTint
}

/**
 * The Sun's disc. Drawn late, and not additively: the photosphere is opaque, so it must
 * occlude the sky behind it, with only the corona and the arcs blending over it. The blend
 * is put back the way it was found, because everything else in the frame is additive.
 */
export function drawSunDisc({ projMat, viewMat, shimT, plasmaSunPx, tint }: SunDiscInputs): void {
  if(!(plasmaSunPx > 7)) return;
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(pSunP);
  gl.uniformMatrix4fv(USn.proj,false,projMat);
  gl.uniformMatrix4fv(USn.view,false,viewMat);
  gl.uniform1f(USn.time, shimT);
  gl.uniform3f(USn.colD, tint.d[0], tint.d[1], tint.d[2]);
  gl.uniform3f(USn.colB, tint.b[0], tint.b[1], tint.b[2]);
  const sz = Math.min(1000, plasmaSunPx*2.7);
  gl.uniform1f(USn.sz, sz);
  gl.uniform1f(USn.disc, plasmaSunPx/sz);
  gl.bindVertexArray(vaoSunPt); gl.drawArrays(gl.POINTS,0,1);
  gl.blendFunc(gl.ONE, gl.ONE);
}
