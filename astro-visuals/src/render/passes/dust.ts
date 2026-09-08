import { canvas, gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import PT_VS from '../../shaders/pt.vert?raw'
import DUST_FS from '../../shaders/dust.frag?raw'
import { MAT3_ID } from '../../core/mat4'
import { M31_ROT } from '../../astro/merger'
import { gfx } from '../state'
import type { CloudFrame, Which } from './nebula'

/**
 * The dust lanes: soft sprites that darken instead of glow, drawn with a multiplying blend.
 * A lane is not a dark thing added to the picture — it is less haze — so these multiply what
 * is behind them, by this point only the haze, down toward black.
 *
 * It shares `CloudFrame` with the nebulae because the two are always drawn as a pair, in the
 * same order, from the same values. It does not share a program: the falloff and the blend
 * are different, and the sprite ceiling is measured separately.
 */

export const pDust = prog(PT_VS, DUST_FS);
// Sprite ceiling for the dust when the camera is in close. Measured, not reasoned: with
// the backdrop drawn beneath the dust (see insideDisk) 40 px carves a dark lane along the
// band and across the core and leaves the HII glow standing above it — the Rift as seen
// from inside. 120 and 220 were tried and crush the whole band to a scatter of stars: the
// multiply compounds, and larger discs overlap everywhere. The number itself lives on
// `gfx`, because the debug door can turn it.

export const UD = {
  minSz: gl.getUniformLocation(pDust,'uMinSz'),
  gal: gl.getUniformLocation(pDust,'uGal'), grot: gl.getUniformLocation(pDust,'uGRot'),
  goff: gl.getUniformLocation(pDust,'uGOff'), merge: gl.getUniformLocation(pDust,'uMerge'),
  and: gl.getUniformLocation(pDust,'uAnd'), tide: gl.getUniformLocation(pDust,'uTide'),
  warpAmp: gl.getUniformLocation(pDust,'uWarpAmp'),
  wa:   gl.getUniformLocation(pDust,'uWaveAll'),
  cap:  gl.getUniformLocation(pDust,'uCap'),
  org:  gl.getUniformLocation(pDust,'uOrg'),
  proj: gl.getUniformLocation(pDust,'uProj'),
  view: gl.getUniformLocation(pDust,'uView'),
  px:   gl.getUniformLocation(pDust,'uPx'),
  spin: gl.getUniformLocation(pDust,'uSpin'),
  warp: gl.getUniformLocation(pDust,'uWarp'),
  sun:  gl.getUniformLocation(pDust,'uSunPos')
};

/**
 * Draw one galaxy's dust, or both. `dustOn` is the viewer's switch and is checked here
 * rather than at the call site, because the pass is called inside a loop over the two
 * galaxies and the test would otherwise be written twice.
 */
export function drawDust(
  { projMat, viewMat, pxScale, deep, insideDisk,
    andPos, tide, merge, spinMW, spinM31, warp, sunX, sunY, bubY, sunZ, org }: CloudFrame,
  dustOn: boolean,
  which: Which = 'both',
): void {
  if(dustOn){
    // dust lanes: multiply what's behind them down, blue first (see DUST_FS)
    gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
    gl.useProgram(pDust);
    gl.uniformMatrix4fv(UD.proj,false,projMat);
    gl.uniformMatrix4fv(UD.view,false,viewMat);
    gl.uniform1f(UD.px,pxScale);
    gl.uniform1f(UD.wa, 1.0); // dust lanes trace the wave
    // The ceiling is in device pixels, so on a narrow canvas one disc covers far more
    // sky and the multiply compounds faster than the additive haze — the band went black
    // on a 400 px phone at the desktop's 40. Scaled by canvas width, 900 being the width
    // it was judged at. Between the dive and the wider views the eye is still in the
    // disk with the backdrop beneath the dust, so the ceiling stays moderate there too.
    gl.uniform1f(UD.cap, deep ? gfx.DUST_DEEP_CAP * Math.min(1.5, Math.max(0.45, canvas.width/900))
                        : insideDisk ? 200.0 : 560.0);
    gl.uniform1f(UD.minSz, 1.3);
    gl.uniform3f(UD.and, andPos[0], andPos[1], andPos[2]); gl.uniform1f(UD.tide, tide);
    gl.uniform1f(UD.warpAmp, 1.0);
    gl.uniform3f(UD.org, org[0],org[1],org[2]);
    gl.uniform1f(UD.spin, spinMW);
    gl.uniform1f(UD.warp, warp);
    gl.uniform3f(UD.sun, sunX, bubY, sunZ);
    gl.uniform1f(UD.gal, 1.0);
    gl.uniform1f(UD.merge, merge);
    if(which !== 'and'){ gl.bindVertexArray(gfx.vaoDust); gl.drawArrays(gl.POINTS,0,gfx.DUST_N); }
    if(gfx.vaoAndDust && which !== 'mw'){
      gl.uniformMatrix3fv(UD.grot, false, M31_ROT);
      gl.uniform3f(UD.goff, andPos[0], andPos[1], andPos[2]);
      gl.uniform1f(UD.spin, spinM31);
      gl.uniform1f(UD.warpAmp, 0.35);
      gl.uniform3f(UD.and, 0, 0, 0);
      gl.uniform3f(UD.sun, sunX, sunY+1e8, sunZ);
      gl.bindVertexArray(gfx.vaoAndDust); gl.drawArrays(gl.POINTS,0,gfx.N_ANDD);
      gl.uniformMatrix3fv(UD.grot, false, MAT3_ID);
      gl.uniform3f(UD.goff, 0, 0, 0);
      gl.uniform1f(UD.spin, spinMW);
      gl.uniform1f(UD.warpAmp, 1.0);
      gl.uniform3f(UD.and, andPos[0], andPos[1], andPos[2]);
      gl.uniform3f(UD.sun, sunX, bubY, sunZ);
    }
    gl.uniform1f(UD.gal, 0.0);
    gl.blendFunc(gl.ONE, gl.ONE);
  }
}
