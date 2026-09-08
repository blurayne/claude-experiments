import { gl } from '../../gpu/context'
import { canvas } from '../../gpu/context'
import { prog } from '../../gpu/program'
import TONE_VS from '../../shaders/tone.vert?raw'
import TONE_FS from '../../shaders/tone.frag?raw'
import { view } from '../state'

// Everything is drawn with additive blending, so a galaxy core — thousands of sprites
// stacked on one pixel — sums far past 1.0 and the screen simply clips it to flat white.
// That is fine for one core and useless during the merger, where the whole remnant piles
// into a single blown-out disc. The scene is drawn into a half-float buffer instead,
// which holds those sums, and this pass maps them back into range: identity below the
// knee, then asymptotic, so a core keeps its gradient and its colour instead of becoming
// a white hole. The ratio is applied to all three channels together, so hues survive.


const pTone = prog(TONE_VS, TONE_FS);
const UT = { tex: gl.getUniformLocation(pTone,'uTex'), knee: gl.getUniformLocation(pTone,'uKnee') };
const emptyVAO = gl.createVertexArray()!;
const hdrExt = gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');

export function makeHDR(): void {
  if(!hdrExt) return;
  if(view.hdrTex) gl.deleteTexture(view.hdrTex);
  if(view.hdrFB) gl.deleteFramebuffer(view.hdrFB);
  view.hdrTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, view.hdrTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, canvas.width, canvas.height, 0, gl.RGBA, gl.HALF_FLOAT, null);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],
                      [gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])
    gl.texParameteri(gl.TEXTURE_2D, k, v);
  view.hdrFB = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, view.hdrFB);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, view.hdrTex, 0);
  view.hdrOK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Resolve the half-float scene to the screen.
 *
 * Must be the LAST thing drawn. Anything added after it lands on the tone-mapped image
 * instead of inside it, which is a different picture — and an easy mistake to make, since a
 * new draw call appended to frame() looks like it belongs at the end.
 */
export function resolveTone(coreKnee: number): void {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.disable(gl.BLEND);
  gl.useProgram(pTone);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, view.hdrTex);
  gl.uniform1i(UT.tex, 0);
  gl.uniform1f(UT.knee, coreKnee);
  gl.bindVertexArray(emptyVAO);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);
  gl.enable(gl.BLEND);
}

/** Bind the half-float target, so the scene renders into it rather than the screen. */
export function bindHDR(): void { gl.bindFramebuffer(gl.FRAMEBUFFER, view.hdrFB) }
