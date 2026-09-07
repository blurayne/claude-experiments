/**
 * The one WebGL2 context, and the one place that gives up if there is not one.
 *
 * Asking for a second context on the same canvas does NOT create one — the browser returns
 * the existing context and silently ignores the attributes, so a second call with different
 * antialias or alpha would appear to work and quietly do nothing. One module, one call;
 * scripts/check-build.mjs asserts the emitted page contains exactly one getContext.
 *
 * The failure path replaces the whole body and throws. In a module that abort propagates to
 * main.ts, which imports this first, so nothing downstream runs against a null context —
 * which is what used to happen by accident when this was one long script.
 */

const canvasEl = document.getElementById('gl') as HTMLCanvasElement
const glCtx = canvasEl.getContext('webgl2', {antialias:true, alpha:false});
if(!glCtx){ document.body.innerHTML = '<p style="padding:2em">WebGL2 is not available in this browser.</p>'; throw new Error('no webgl2'); }

export const canvas = canvasEl
export const gl: WebGL2RenderingContext = glCtx
