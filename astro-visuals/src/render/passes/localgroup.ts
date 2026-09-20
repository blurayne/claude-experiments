import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import QUAD_VS from '../../shaders/gcradio.vert?raw'
import GAL_FS from '../../shaders/galaxy.frag?raw'
import { pTr, U } from './points'
import { drawRings } from './rings'
import { LG, LG_BOX, lgFade, lgUpdate } from '../../astro/localgroup'
import { KPC2U } from '../../astro/merger'
import type { LgKind } from '../../astro/lg-data'

/**
 * The Local Group: its galaxies as glows on their half-light ellipses at the drawn depth
 * (see astro/localgroup for what "drawn depth" means and why), and — with the labels on —
 * the chart's box: a cylinder on the Galaxy's axis round the whole Group, its mid-plane
 * ellipse, the silhouette edges toward the eye, and a drop-line from every galaxy to the
 * mid-plane, so height above and below the Galactic plane can be read. Sun-relative,
 * additive, in the main view.
 */
const pG = prog(QUAD_VS, GAL_FS)
const UG = {
  proj: gl.getUniformLocation(pG, 'uProj'), view: gl.getUniformLocation(pG, 'uView'),
  c: gl.getUniformLocation(pG, 'uC'), A: gl.getUniformLocation(pG, 'uA'), B: gl.getUniformLocation(pG, 'uB'),
  margin: gl.getUniformLocation(pG, 'uMargin'), kind: gl.getUniformLocation(pG, 'uKind'),
  col: gl.getUniformLocation(pG, 'uCol'), gain: gl.getUniformLocation(pG, 'uGain'),
  seed: gl.getUniformLocation(pG, 'uSeed'), fade: gl.getUniformLocation(pG, 'uFade'),
}
const vaoEmpty = gl.createVertexArray()!
const KIND_ID: Record<LgKind, number> = { dSph: 0, dIrr: 1, dE: 2, cE: 2, spiral: 3, dark: 4 }
const KIND_COL: Record<LgKind, readonly [number, number, number]> = {
  dSph: [1.0, 0.90, 0.72], dIrr: [0.78, 0.86, 1.0], dE: [1.0, 0.88, 0.70], cE: [1.0, 0.90, 0.74],
  spiral: [0.82, 0.88, 1.0], dark: [0.62, 0.58, 0.85],
}

// the drop-lines and the two silhouette edges: one dynamic buffer, refilled per frame
const N_LINES = LG.length + 2
const linePos = new Float32Array(N_LINES*2*3)
const lineGL = (()=>{ const v=gl.createVertexArray()!; gl.bindVertexArray(v);
  const b=gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER, linePos.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return { vao: v, buf: b } })()

export interface LgInputs {
  projMat: Float32Array
  viewMat: Float32Array
  /** the eye, Sun-relative: the silhouette edges face it */
  eye: readonly number[]
  camDist: number
  pxScale: number
  showLabels: boolean
}

/** Draw the Group. Returns its fade, which the labels follow. */
export function drawLocalGroup(inp: LgInputs): number {
  const { projMat, viewMat, eye, camDist, pxScale, showLabels } = inp
  const fade = lgFade(camDist)
  if(fade < 0.002) return 0
  lgUpdate(fade)                      // the slide from the merger's compressed depth to true scale
  gl.useProgram(pG)
  gl.uniformMatrix4fv(UG.proj, false, projMat)
  gl.uniformMatrix4fv(UG.view, false, viewMat)
  gl.uniform1f(UG.margin, 3.0)
  gl.bindVertexArray(vaoEmpty)
  for(let k=0;k<LG.length;k++){
    const m = LG[k]
    const dist = Math.hypot(m.pos[0] - eye[0], m.pos[1] - eye[1], m.pos[2] - eye[2])
    const pxPerU = pxScale/Math.max(dist, 1e-6)
    // a marker floor: nothing smaller than a few pixels, and the flux is not conserved —
    // these are markers, and a dwarf at its true faintness would simply be absent
    const aPx = m.a*pxPerU, bPx = m.b*pxPerU
    const floor = m.kind === 'spiral' ? 26 : m.Mv < -15 ? 12 : m.Mv < -9 ? 7 : 5
    const wa = Math.max(1, floor/Math.max(aPx, 1e-9)), wb = Math.max(1, floor*0.7/Math.max(bPx, 1e-9))
    // the two big spirals are drawn by their own models until the Group takes over
    const own = m.kind === 'spiral' && m.name.startsWith('Andromeda') ? fade : 1
    const c = KIND_COL[m.kind]
    gl.uniform3f(UG.c, m.pos[0], m.pos[1], m.pos[2])
    gl.uniform3f(UG.A, m.A[0]*wa, m.A[1]*wa, m.A[2]*wa)
    gl.uniform3f(UG.B, m.B[0]*wb, m.B[1]*wb, m.B[2]*wb)
    gl.uniform1f(UG.kind, KIND_ID[m.kind])
    gl.uniform3f(UG.col, c[0], c[1], c[2])
    gl.uniform1f(UG.gain, 2.2*m.gain*(m.confirmed ? 1 : 0.55))
    gl.uniform1f(UG.seed, k*0.731)
    gl.uniform1f(UG.fade, fade*own)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  // the Milky Way herself: the model's points are dust at this distance, so the Group's own
  // marker takes over — a spiral glow the disk's true 15-kpc radius, in the disk's plane
  { const R = 15*KPC2U, dist = Math.hypot(eye[0], eye[1], eye[2]), rPx = R*pxScale/Math.max(dist, 1e-6)
    const w = Math.max(1, 26/Math.max(rPx, 1e-9))
    gl.uniform3f(UG.c, 0, 0, 0)
    gl.uniform3f(UG.A, R*w, 0, 0)
    gl.uniform3f(UG.B, 0, 0, R*w)
    gl.uniform1f(UG.kind, KIND_ID.spiral)
    gl.uniform3f(UG.col, 0.86, 0.9, 1.0)
    gl.uniform1f(UG.gain, 2.4)
    gl.uniform1f(UG.seed, 2.0)
    gl.uniform1f(UG.fade, fade)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) }
  gl.bindVertexArray(null)
  if(!showLabels || fade < 0.98) return fade
  // ---------- the box: only once the Group is at true scale ----------
  const { centre, radius, halfH } = LG_BOX
  const col = [0.30*fade, 0.46*fade, 0.66*fade] as const
  const X = [1, 0, 0], Zp = [0, 0, 1]
  drawRings({ projMat, viewMat, centre: [centre[0], centre[1] + halfH, centre[2]], radius, colour: col, planes: [[X, Zp]] })
  drawRings({ projMat, viewMat, centre: [centre[0], centre[1] - halfH, centre[2]], radius, colour: col, planes: [[X, Zp]] })
  drawRings({ projMat, viewMat, centre, radius, colour: [col[0]*0.6, col[1]*0.6, col[2]*0.6], planes: [[X, Zp]] })
  // the silhouette edges: where the cylinder's side is tangent to the line of sight
  const ex = eye[0] - centre[0], ez = eye[2] - centre[2], el = Math.hypot(ex, ez) || 1
  const px = -ez/el*radius, pz = ex/el*radius
  let o = 0
  const line = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void => {
    linePos[o++] = x0; linePos[o++] = y0; linePos[o++] = z0; linePos[o++] = x1; linePos[o++] = y1; linePos[o++] = z1
  }
  line(centre[0] + px, centre[1] - halfH, centre[2] + pz, centre[0] + px, centre[1] + halfH, centre[2] + pz)
  line(centre[0] - px, centre[1] - halfH, centre[2] - pz, centre[0] - px, centre[1] + halfH, centre[2] - pz)
  let n = 2
  for(const m of LG){ line(m.pos[0], m.pos[1], m.pos[2], m.pos[0], centre[1], m.pos[2]); n++ }
  gl.useProgram(pTr)
  gl.uniformMatrix4fv(U.trProj, false, projMat)
  gl.uniformMatrix4fv(U.trView, false, viewMat)
  gl.uniform3f(U.trOrg, 0, 0, 0)
  gl.uniform1f(U.trLen, 1e9); gl.uniform1f(U.trFlat, 1.0)
  gl.bindBuffer(gl.ARRAY_BUFFER, lineGL.buf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, linePos.subarray(0, n*6))
  gl.bindVertexArray(lineGL.vao)
  gl.uniform3f(U.trCol, col[0], col[1], col[2]); gl.uniform1f(U.trA, 0.9)
  gl.drawArrays(gl.LINES, 0, 4)
  gl.uniform3f(U.trCol, 0.55, 0.62, 0.78); gl.uniform1f(U.trA, 0.22*fade)
  gl.drawArrays(gl.LINES, 4, (n - 2)*2)
  gl.bindVertexArray(null)
  return fade
}
