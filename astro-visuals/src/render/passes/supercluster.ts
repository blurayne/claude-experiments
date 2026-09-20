import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import { pointVAO } from '../../gpu/buffers'
import GX_VS from '../../shaders/gx.vert?raw'
import GX_FS from '../../shaders/gx.frag?raw'
import QUAD_VS from '../../shaders/gcradio.vert?raw'
import GAL_FS from '../../shaders/galaxy.frag?raw'
import { drawBox } from './box'
import { SC, SC_GROUPS_NAMED, SC_GALS, SC_BOX, MPC2U, scFade } from '../../astro/supercluster'

/**
 * The Virgo Supercluster and the nearer cosmic web, as points: every group of Kourkchi &
 * Tully 2017 out to 3,500 km/s (8,826 of them, sized by luminosity — a rich cluster is a
 * bright knot, a lone galaxy a faint speck) and every galaxy of the Updated Nearby Galaxy
 * Catalog within ~11 Mpc, coloured by type. The named clusters get a glow the size of
 * their turnaround radius. With the labels on, the chart's cylinder on the supergalactic
 * plane, with a drop-line from each named group. Sun-relative; additive.
 */
const pGx = prog(GX_VS, GX_FS)
const UX = { proj: gl.getUniformLocation(pGx, 'uProj'), view: gl.getUniformLocation(pGx, 'uView'), px: gl.getUniformLocation(pGx, 'uPx'),
  fade: gl.getUniformLocation(pGx, 'uFade'), minPx: gl.getUniformLocation(pGx, 'uMinPx'), maxPx: gl.getUniformLocation(pGx, 'uMaxPx') }
const pG = prog(QUAD_VS, GAL_FS)
const UG = { proj: gl.getUniformLocation(pG, 'uProj'), view: gl.getUniformLocation(pG, 'uView'), c: gl.getUniformLocation(pG, 'uC'),
  A: gl.getUniformLocation(pG, 'uA'), B: gl.getUniformLocation(pG, 'uB'), margin: gl.getUniformLocation(pG, 'uMargin'), kind: gl.getUniformLocation(pG, 'uKind'),
  col: gl.getUniformLocation(pG, 'uCol'), gain: gl.getUniformLocation(pG, 'uGain'), seed: gl.getUniformLocation(pG, 'uSeed'), fade: gl.getUniformLocation(pG, 'uFade') }
const vaoEmpty = gl.createVertexArray()!

// ---------- the groups ----------
const groupsVAO = (()=>{
  const n = SC.n, size = new Float32Array(n), col = new Float32Array(n*3)
  for(let i=0;i<n;i++){
    const L = SC.logK[i]
    // size in scene units: a lone galaxy ~0.16 Mpc, Virgo ~1 Mpc — pixels at the view follow from the distance
    size[i] = MPC2U*(0.05 + 0.25*Math.pow(10, 0.35*(L - 11)))
    // the luminous knots white-gold, the faint specks a dim blue-grey; velocity-placed ones a touch bluer
    const t = Math.min(1, Math.max(0, (L - 9.5)/3.2)), v = SC.byVel[i] ? 0.85 : 1
    col[i*3] = (0.7 + 0.9*t)*v; col[i*3+1] = (0.75 + 0.75*t)*v; col[i*3+2] = (1.05 + 0.35*t)*v
  }
  return pointVAO(SC.pos, size, col)
})()
// ---------- the nearby galaxies ----------
const galsVAO = (()=>{
  const n = SC_GALS.length, pos = new Float32Array(n*3), size = new Float32Array(n), col = new Float32Array(n*3)
  SC_GALS.forEach((g, i) => {
    pos[i*3] = g.pos[0]; pos[i*3+1] = g.pos[1]; pos[i*3+2] = g.pos[2]
    size[i] = MPC2U*0.12*Math.pow(10, -0.2*(g.k - 6))
    const c = g.kind === 'E' ? [1.0, 0.9, 0.72] : g.kind === 'I' ? [0.7, 0.82, 1.0] : g.kind === 'S' ? [0.85, 0.9, 1.0] : g.kind === 'dark' ? [0.62, 0.58, 0.85] : [0.8, 0.8, 0.85]
    col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2]
  })
  return pointVAO(pos, size, col)
})()
const dropPos = new Float32Array(SC_GROUPS_NAMED.length*3)

export interface ScInputs {
  projMat: Float32Array
  viewMat: Float32Array
  eye: readonly number[]
  camDist: number
  pxScale: number
  showLabels: boolean
}

/** Draw the supercluster. Returns its fade, which the labels follow. */
export function drawSupercluster(inp: ScInputs): number {
  const { projMat, viewMat, eye, camDist, pxScale, showLabels } = inp
  const fade = scFade(camDist)
  if(fade < 0.002) return 0
  gl.useProgram(pGx)
  gl.uniformMatrix4fv(UX.proj, false, projMat)
  gl.uniformMatrix4fv(UX.view, false, viewMat)
  gl.uniform1f(UX.px, pxScale)
  gl.uniform1f(UX.fade, fade)
  gl.uniform1f(UX.minPx, 2.2); gl.uniform1f(UX.maxPx, 42)
  gl.bindVertexArray(groupsVAO); gl.drawArrays(gl.POINTS, 0, SC.n)
  gl.uniform1f(UX.minPx, 1.2); gl.uniform1f(UX.maxPx, 18)
  gl.bindVertexArray(galsVAO); gl.drawArrays(gl.POINTS, 0, SC_GALS.length)
  gl.bindVertexArray(null)
  // the clusters' glows: view-facing quads the size of the turnaround radius
  const right = [viewMat[0], viewMat[4], viewMat[8]], up = [viewMat[1], viewMat[5], viewMat[9]]
  gl.useProgram(pG)
  gl.uniformMatrix4fv(UG.proj, false, projMat)
  gl.uniformMatrix4fv(UG.view, false, viewMat)
  gl.uniform1f(UG.margin, 2.5)
  gl.bindVertexArray(vaoEmpty)
  for(let k=0;k<SC_GROUPS_NAMED.length;k++){
    const g = SC_GROUPS_NAMED[k]
    if(g.kind !== 'cluster') continue
    const r = g.rMpc*MPC2U*2.0
    gl.uniform3f(UG.c, g.pos[0], g.pos[1], g.pos[2])
    gl.uniform3f(UG.A, right[0]*r, right[1]*r, right[2]*r)
    gl.uniform3f(UG.B, up[0]*r, up[1]*r, up[2]*r)
    gl.uniform1f(UG.kind, 0)
    gl.uniform3f(UG.col, 0.95, 0.9, 0.8)
    gl.uniform1f(UG.gain, 0.8)
    gl.uniform1f(UG.seed, k*0.37)
    gl.uniform1f(UG.fade, fade)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  // the dark galaxy's outline: nothing to see, so an outline the marker's size
  for(const g of SC_GALS){
    if(g.kind !== 'dark') continue
    const dist = Math.hypot(g.pos[0] - eye[0], g.pos[1] - eye[1], g.pos[2] - eye[2])
    const r = 9*dist/pxScale
    gl.uniform3f(UG.c, g.pos[0], g.pos[1], g.pos[2])
    gl.uniform3f(UG.A, right[0]*r, right[1]*r, right[2]*r)
    gl.uniform3f(UG.B, up[0]*r, up[1]*r, up[2]*r)
    gl.uniform1f(UG.kind, 4)
    gl.uniform3f(UG.col, 0.62, 0.58, 0.85)
    gl.uniform1f(UG.gain, 1.2)
    gl.uniform1f(UG.fade, fade)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  gl.bindVertexArray(null)
  if(!showLabels || fade < 0.98) return fade
  let n = 0
  for(const g of SC_GROUPS_NAMED){ dropPos[n*3] = g.pos[0]; dropPos[n*3+1] = g.pos[1]; dropPos[n*3+2] = g.pos[2]; n++ }
  drawBox({ projMat, viewMat, eye, centre: SC_BOX.centre, U: SC_BOX.U, V: SC_BOX.V, W: SC_BOX.W, radius: SC_BOX.radius, halfH: SC_BOX.halfH, fade, drops: dropPos, nDrops: n })
  return fade
}
