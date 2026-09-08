import { canvas, gl } from '../gpu/context'
import { $ } from '../core/dom'
import { pPt } from './passes/points'
import { gfx, readout, view } from './state'

/**
 * The first-launch performance probe.
 *
 * A first visit has no saved quality. Two frames in — the programs compiled, the first
 * scenario's camera set — the galaxy's own star pass is drawn into a hidden framebuffer of the
 * canvas's size, over and over for about thirty milliseconds, and gl.finish() plus a one-pixel
 * read make the GPU account for all of it. The time one pass takes, on the lowest tier's
 * ~95,000 points, sets the quality row (lowest, low or medium — never more: medium is already
 * two million points and the heavier tiers are a choice, not a default) and caps the pixel
 * ratio at 1 when even that pass is slow.
 *
 * This is why the parity gate does not photograph a first visit. The probe MEASURES THE
 * MACHINE, so running it twice can honestly return two different answers, and the two shots
 * then draw a different number of stars. It came back 35% of the frame different at max Δ254,
 * which is a different picture rather than a different rendering of the same one. The boot
 * suite asserts it instead: that it runs, picks a tier no heavier than medium, saves it, and
 * stages the opening without throwing.
 */

export interface ProbeResult {
  ms: number
  passes: number
  points: number
  px: string
  msLow?: number
  detail?: string
  dpr?: number
}

export function perfProbe(): ProbeResult {
  const fb = gl.createFramebuffer(), tex = gl.createTexture(), pw = canvas.width, ph = canvas.height;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pw, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const px = new Uint8Array(4), sync = ()=>{ gl.finish(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); };
  let ms = -1, passes = 0;
  try{
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo');
    gl.viewport(0, 0, pw, ph); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(pPt); gl.bindVertexArray(gfx.vaoGxy);        // the uniforms as the last frame left them
    gl.drawArrays(gl.POINTS, 0, gfx.N_GXY); sync();             // warm-up: not timed
    const t0 = performance.now();
    do{ gl.drawArrays(gl.POINTS, 0, gfx.N_GXY); passes++; sync(); }
    while(performance.now() - t0 < 30 && passes < 40);
    ms = (performance.now() - t0)/passes;
  }catch(e){ ms = -1; }
  gl.bindVertexArray(null); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fb); gl.deleteTexture(tex);
  gl.viewport(0, 0, canvas.width, canvas.height);
  return { ms, passes, points: gfx.N_GXY, px: pw + '×' + ph };
}

// one pass at density D costs about ms·D/2 (denser tiers draw smaller points); with the
// rest of the frame the budget is eleven milliseconds, which keeps sixty frames a second
const pickDetail = (ms: number): number => ms < 0 ? 1 : ms*20*0.5 + 3 <= 11 ? 2 : ms*5*0.5 + 3 <= 11 ? 1 : 0;

export interface ProbeDeps {
  /** the quality row's labels, for the stamp */
  detailNames: readonly string[]
  /** dropping the pixel cap needs the canvas resized to match */
  resize: () => void
  /** written at once, not debounced: a tab closed inside the debounce would probe again */
  saveSettingsNow: () => void
}

export function runFirstLaunchProbe({ detailNames, resize, saveSettingsNow }: ProbeDeps): void {
  const r = perfProbe();
  r.msLow = r.ms < 0 ? -1 : r.ms * 95000 / Math.max(1, r.points);   // per pass of the lowest tier's points, whatever tier was drawn
  const d = pickDetail(r.msLow);
  if(r.msLow > 8){ view.dprCap = 1; resize(); }                  // a slow fill: fewer pixels first
  r.detail = detailNames[d]; r.dpr = view.DPR; readout.probeInfo = r;
  const detail = $('detail') as HTMLInputElement;
  detail.value = String(d); detail.dispatchEvent(new Event('input'));
  saveSettingsNow();
  try{ $('buildStamp').textContent += ' · probe ' + (r.ms < 0 ? 'failed' : r.msLow.toFixed(1) + ' ms/pass') + ' → ' + r.detail + (view.dprCap < 2 ? ', 1× pixels' : ''); }catch(e){}
}
