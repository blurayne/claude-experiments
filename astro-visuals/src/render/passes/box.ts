import { gl } from '../../gpu/context'
import { pTr, U } from './points'
import { drawRings } from './rings'
import type { Vec3 } from '../../core/mat4'

/**
 * The chart's box: a cylinder on an axis, drawn as its top and bottom rings, its mid-plane
 * ring, the two silhouette edges toward the eye, and a drop-line from each given point to
 * the mid-plane — so height above and below the plane can be read. Sun-relative, on the
 * ring and trail programs. Used by the Local Group and the supercluster.
 */
let linePos = new Float32Array(0)
const lineGL = (()=>{ const v=gl.createVertexArray()!; gl.bindVertexArray(v);
  const b=gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER, 4*3*2*2048, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return { vao: v, buf: b, cap: 2048 } })()

export interface BoxInputs {
  projMat: Float32Array
  viewMat: Float32Array
  /** the eye, Sun-relative: the silhouette edges face it */
  eye: readonly number[]
  centre: Vec3
  /** the ring plane's two unit vectors and the axis */
  U: Vec3
  V: Vec3
  W: Vec3
  radius: number
  halfH: number
  /** the frame's fade, 0–1 */
  fade: number
  /** points to drop a line from, Sun-relative xyz triples, and how many */
  drops: Float32Array
  nDrops: number
}

export function drawBox(inp: BoxInputs): void {
  const { projMat, viewMat, eye, centre, U: Uv, V, W, radius, halfH, fade, drops, nDrops } = inp
  const col = [0.30*fade, 0.46*fade, 0.66*fade] as const
  const at = (h: number): number[] => [centre[0] + W[0]*h, centre[1] + W[1]*h, centre[2] + W[2]*h]
  drawRings({ projMat, viewMat, centre: at(halfH), radius, colour: col, planes: [[Uv, V]] })
  drawRings({ projMat, viewMat, centre: at(-halfH), radius, colour: col, planes: [[Uv, V]] })
  drawRings({ projMat, viewMat, centre, radius, colour: [col[0]*0.6, col[1]*0.6, col[2]*0.6], planes: [[Uv, V]] })
  // the silhouette edges: the eye's direction projected into the ring plane, turned 90°
  const ex = eye[0] - centre[0], ey = eye[1] - centre[1], ez = eye[2] - centre[2]
  const eu = ex*Uv[0] + ey*Uv[1] + ez*Uv[2], ev = ex*V[0] + ey*V[1] + ez*V[2], el = Math.hypot(eu, ev) || 1
  const pu = -ev/el*radius, pv = eu/el*radius
  const n = Math.min(nDrops, lineGL.cap - 2)
  if(linePos.length < (n + 2)*6) linePos = new Float32Array((n + 2)*6)
  let o = 0
  const line = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void => {
    linePos[o++] = x0; linePos[o++] = y0; linePos[o++] = z0; linePos[o++] = x1; linePos[o++] = y1; linePos[o++] = z1
  }
  for(const s of [1, -1]){
    const px = centre[0] + (Uv[0]*pu + V[0]*pv)*s, py = centre[1] + (Uv[1]*pu + V[1]*pv)*s, pz = centre[2] + (Uv[2]*pu + V[2]*pv)*s
    line(px - W[0]*halfH, py - W[1]*halfH, pz - W[2]*halfH, px + W[0]*halfH, py + W[1]*halfH, pz + W[2]*halfH)
  }
  for(let k=0;k<n;k++){
    const x = drops[k*3], y = drops[k*3+1], z = drops[k*3+2]
    // the point's height above the plane, along the axis; the foot is the point less that
    const h = (x - centre[0])*W[0] + (y - centre[1])*W[1] + (z - centre[2])*W[2]
    line(x, y, z, x - W[0]*h, y - W[1]*h, z - W[2]*h)
  }
  gl.useProgram(pTr)
  gl.uniformMatrix4fv(U.trProj, false, projMat)
  gl.uniformMatrix4fv(U.trView, false, viewMat)
  gl.uniform3f(U.trOrg, 0, 0, 0)
  gl.uniform1f(U.trLen, 1e9); gl.uniform1f(U.trFlat, 1.0)
  gl.bindBuffer(gl.ARRAY_BUFFER, lineGL.buf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, linePos.subarray(0, (n + 2)*6))
  gl.bindVertexArray(lineGL.vao)
  gl.uniform3f(U.trCol, col[0], col[1], col[2]); gl.uniform1f(U.trA, 0.9)
  gl.drawArrays(gl.LINES, 0, 4)
  if(n > 0){
    gl.uniform3f(U.trCol, 0.55, 0.62, 0.78); gl.uniform1f(U.trA, 0.22*fade)
    gl.drawArrays(gl.LINES, 4, n*2)
  }
  gl.bindVertexArray(null)
}
