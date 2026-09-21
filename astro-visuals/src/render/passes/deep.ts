import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import { pointVAO } from '../../gpu/buffers'
import GX_VS from '../../shaders/gx.vert?raw'
import GX_FS from '../../shaders/gx.frag?raw'
import { parseDeep, deepFade, DEEP_NAMED } from '../../astro/deep'
import { MPC2U } from '../../astro/supercluster'

/**
 * The deep field: 2MRS as points, fetched once the eye is far enough out to want it and
 * never before (the page stays a page; the survey is a separate file the deploy carries).
 * A missing file — the runner has not produced it yet, or the site is offline — simply
 * draws nothing. Sun-relative, additive, on the same point program as the nearer web.
 */
const pGx = prog(GX_VS, GX_FS)
const UX = { proj: gl.getUniformLocation(pGx, 'uProj'), view: gl.getUniformLocation(pGx, 'uView'), px: gl.getUniformLocation(pGx, 'uPx'),
  fade: gl.getUniformLocation(pGx, 'uFade'), minPx: gl.getUniformLocation(pGx, 'uMinPx'), maxPx: gl.getUniformLocation(pGx, 'uMaxPx') }
let vao: WebGLVertexArrayObject | null = null
let n = 0
let state: 'idle' | 'loading' | 'ready' | 'absent' = 'idle'

function load(): void {
  state = 'loading'
  fetch('data/2mrs.bin').then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status))))
    .then(buf => {
      const d = parseDeep(buf)
      if(!d){ state = 'absent'; return }
      const size = new Float32Array(d.n), col = new Float32Array(d.n*3)
      for(let i=0;i<d.n;i++){
        // a fixed size in space, so the near ones are the larger points, as they would be
        size[i] = 0.9*MPC2U
        col[i*3] = 0.62; col[i*3+1] = 0.68; col[i*3+2] = 0.9
      }
      vao = pointVAO(d.pos, size, col); n = d.n; state = 'ready'
    })
    .catch(() => { state = 'absent' })
}

export interface DeepInputs { projMat: Float32Array; viewMat: Float32Array; camDist: number; pxScale: number }

/** Draw the deep field. Returns its fade (0 when nothing is drawn), which the labels follow. */
export function drawDeep(inp: DeepInputs): number {
  const { projMat, viewMat, camDist, pxScale } = inp
  if(camDist > 6e6 && state === 'idle') load()
  const fade = deepFade(camDist)
  if(fade < 0.002 || state !== 'ready' || !vao) return 0
  gl.useProgram(pGx)
  gl.uniformMatrix4fv(UX.proj, false, projMat)
  gl.uniformMatrix4fv(UX.view, false, viewMat)
  gl.uniform1f(UX.px, pxScale)
  gl.uniform1f(UX.fade, fade*0.85)
  gl.uniform1f(UX.minPx, 1.4); gl.uniform1f(UX.maxPx, 5)
  gl.bindVertexArray(vao); gl.drawArrays(gl.POINTS, 0, n)
  gl.bindVertexArray(null)
  return fade
}

export const deepNamed = DEEP_NAMED
