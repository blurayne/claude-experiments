import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import PT_VS from '../../shaders/pt.vert?raw'
import NEB_FS from '../../shaders/neb.frag?raw'
import { MAT3_ID } from '../../core/mat4'
import { M31_ROT } from '../../astro/merger'
import { gfx } from '../state'

/**
 * The nebulae: same vertex logic as the points, but a much larger sprite cap and a coreless
 * glow falloff.
 *
 * One buffer holds three populations in order — HII pink, then the diffuse haze, then the
 * core — and this pass draws either the haze alone or everything except it. That is what
 * `haze` selects, and it is why the pass runs more than once a frame: the haze is laid down
 * first, the dark clouds darken it (that is all a dust lane is, less haze), and then the
 * stars, the HII knots and the core are drawn over both, so a cloud sits WITHIN the star
 * field. Drawn after everything, as they used to be, the clouds multiplied the stars and the
 * core down to black discs on top of the picture.
 *
 * `which` picks a galaxy, because multiply blending knows nothing of depth: the farther of
 * the two goes down whole and the nearer over it. The caller decides which is farther.
 */

// Exported only for the boot-time identity push in main.ts, which sets uGRot on all three
// programs that carry a galaxy rotation, in one loop, before anything is drawn. That loop
// goes when render/frame does.
export const pNeb = prog(PT_VS, NEB_FS);
export const UN = {
  minSz: gl.getUniformLocation(pNeb,'uMinSz'),
  gal: gl.getUniformLocation(pNeb,'uGal'), grot: gl.getUniformLocation(pNeb,'uGRot'),
  goff: gl.getUniformLocation(pNeb,'uGOff'), merge: gl.getUniformLocation(pNeb,'uMerge'),
  and: gl.getUniformLocation(pNeb,'uAnd'), tide: gl.getUniformLocation(pNeb,'uTide'),
  warpAmp: gl.getUniformLocation(pNeb,'uWarpAmp'),
  time: gl.getUniformLocation(pNeb,'uTime'), vm: gl.getUniformLocation(pNeb,'uVarMode'),
  wa:   gl.getUniformLocation(pNeb,'uWaveAll'),
  cap:  gl.getUniformLocation(pNeb,'uCap'),
  org:  gl.getUniformLocation(pNeb,'uOrg'),
  proj: gl.getUniformLocation(pNeb,'uProj'),
  view: gl.getUniformLocation(pNeb,'uView'),
  px:   gl.getUniformLocation(pNeb,'uPx'),
  spin: gl.getUniformLocation(pNeb,'uSpin'),
  warp: gl.getUniformLocation(pNeb,'uWarp'),
  sun:  gl.getUniformLocation(pNeb,'uSunPos'),
  gf:   gl.getUniformLocation(pNeb,'uGFade')
};

/** Which galaxy's clouds to draw. */
export type Which = 'mw' | 'and' | 'both'

/**
 * Everything about the frame that both cloud passes read. It is deliberately one object
 * rather than fifteen arguments: the pass is called four times a frame and the values do not
 * change between the calls. `render/frame` will build this once, at step 21.
 */
export interface CloudFrame {
  projMat: Float32Array
  viewMat: Float32Array
  pxScale: number
  camDist: number
  /** the variability clock — wall time, so the clouds shimmer while paused */
  shimT: number
  varOn: boolean
  /** inside ~30 ly: the backdrop is kept point-like, and every sprite cap comes down */
  deep: boolean
  /** the eye is inside the disk, so the band's light lies behind the local dust */
  insideDisk: boolean
  /** Andromeda's position, her tidal reach, and how far the merger has run */
  andPos: Float32Array
  tide: number
  merge: number
  /** the wave rotation of each disk, and the warp's precession */
  spinMW: number
  spinM31: number
  warp: number
  /** the Sun's position, and its clearance-bubble variant on the y axis */
  sunX: number
  sunY: number
  bubY: number
  sunZ: number
  /** the rendering origin */
  org: Float64Array
}

export function drawNebula(
  { projMat, viewMat, pxScale, camDist, shimT, varOn, deep,
    andPos, tide, merge, spinMW, spinM31, warp, sunX, sunY, bubY, sunZ, org }: CloudFrame,
  haze: boolean,
  which: Which = 'both',
): void {
  gl.useProgram(pNeb);
  gl.uniformMatrix4fv(UN.proj,false,projMat);
  gl.uniformMatrix4fv(UN.view,false,viewMat);
  gl.uniform1f(UN.px,pxScale);
  // The haze must dim as the camera closes in, whatever the mode: nearby sprites
  // project enormous and stack into a whiteout. From inside the system the Milky Way
  // stays visible as a band — a quarter strength — rather than vanishing outright.
  gl.uniform1f(UN.gf, Math.min(1, Math.max(0.25, camDist/45)));
  gl.uniform1f(UN.time, shimT);
  gl.uniform1f(UN.vm, varOn?2.0:0.0);
  gl.uniform1f(UN.wa, 1.0); // HII regions trace the wave
  gl.uniform1f(UN.cap, deep?60.0:560.0);
  gl.uniform1f(UN.minSz, 1.3);
  gl.uniform3f(UN.and, andPos[0], andPos[1], andPos[2]); gl.uniform1f(UN.tide, tide);
  gl.uniform1f(UN.warpAmp, 1.0);
  gl.uniform3f(UN.org, org[0],org[1],org[2]);
  gl.uniform1f(UN.spin, spinMW);
  gl.uniform1f(UN.warp, warp);
  gl.uniform3f(UN.sun, sunX, bubY, sunZ);
  gl.uniform1f(UN.gal, 1.0);
  gl.uniform1f(UN.merge, merge);
  const seg = (pink: number, glow: number, n: number) => {
    if(haze){ if(glow) gl.drawArrays(gl.POINTS, pink, glow); }
    else { if(pink) gl.drawArrays(gl.POINTS, 0, pink);
           if(n - pink - glow > 0) gl.drawArrays(gl.POINTS, pink + glow, n - pink - glow); }
  };
  if(which !== 'and'){ gl.bindVertexArray(gfx.vaoNeb); seg(gfx.NEB_PINK, gfx.NEB_GLOW, gfx.NEB_N); }
  if(gfx.vaoAndNeb && which !== 'mw'){
    // Andromeda is generated flat in her own disk frame: uGRot turns her to her measured
    // orientation and uGOff carries her along her orbit. Set, drawn, and set back — the
    // program keeps its uniforms, and the Milky Way's next pass would inherit hers.
    gl.uniformMatrix3fv(UN.grot, false, M31_ROT);
    gl.uniform3f(UN.goff, andPos[0], andPos[1], andPos[2]);
    gl.uniform1f(UN.spin, spinM31);
    gl.uniform1f(UN.warpAmp, 0.35);
    gl.uniform3f(UN.and, 0, 0, 0);
    gl.uniform3f(UN.sun, sunX, sunY+1e8, sunZ);
    gl.bindVertexArray(gfx.vaoAndNeb); seg(gfx.AND_PINK, gfx.AND_GLOW, gfx.N_ANDN);
    gl.uniformMatrix3fv(UN.grot, false, MAT3_ID);
    gl.uniform3f(UN.goff, 0, 0, 0);
    gl.uniform1f(UN.spin, spinMW);
    gl.uniform1f(UN.warpAmp, 1.0);
    gl.uniform3f(UN.and, andPos[0], andPos[1], andPos[2]);
    gl.uniform3f(UN.sun, sunX, bubY, sunZ);
  }
  gl.uniform1f(UN.gal, 0.0);
}
