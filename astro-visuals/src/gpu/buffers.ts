/**
 * Vertex buffers and the vertex arrays that reference them.
 *
 * Deleting a vertex array does not free the buffers it points at, and at the heavy densities
 * those run to hundreds of megabytes — so every VAO's buffers are tracked beside it and
 * released together. That bookkeeping is the whole reason this is a module rather than three
 * loose helpers.
 *
 * flushGxyCache stays with the galaxy cache that owns the entries: it must never throw
 * mid-flush, because both map loaders race each other into it and the loser would be left
 * pointing at deleted vertex arrays.
 */
import { gl } from './context'

export function makeBuf(data: BufferSource): WebGLBuffer {
  const b = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  return b;
}

// Buffers are tracked alongside their VAO so a density can be released again: deleting
// a vertex array does not free what it references, and the big densities are hundreds
// of megabytes apiece.
const vaoBufs = new WeakMap<WebGLVertexArrayObject, WebGLBuffer[]>();

/**
 * Register a vertex array's buffers for release, for callers that build their own VAO.
 * The orbit rings do: one buffer, laid out by hand. Exposed as a function rather than by
 * exporting the map, so there is one owner of the bookkeeping and no way to end up with two
 * copies of it — deleting a VAO whose buffers were tracked in the other map leaks them, and
 * nothing reports it.
 */
export function trackVAOBuffers(vao: WebGLVertexArrayObject, bufs: WebGLBuffer[]): void {
  vaoBufs.set(vao, bufs)
}
export function deleteVAO(vao: WebGLVertexArrayObject): void {
  const bufs = vaoBufs.get(vao);
  if(bufs) bufs.forEach(b => gl.deleteBuffer(b));
  gl.deleteVertexArray(vao);
}
export function pointVAO(pos: Float32Array, size: Float32Array, col: Float32Array, wave?: Float32Array, vel?: Float32Array): WebGLVertexArrayObject {
  const vao=gl.createVertexArray()!; gl.bindVertexArray(vao);
  const bufs: WebGLBuffer[]=[];
  const attach=(data: Float32Array,loc: number,comps: number)=>{ const b=gl.createBuffer()!; bufs.push(b);
    gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,comps,gl.FLOAT,false,0,0); };
  attach(pos,0,3); attach(size,1,1); attach(col,2,3);
  if(wave) attach(wave,3,1);
  if(vel) attach(vel,4,3);   // populations without one read a constant zero
  gl.bindVertexArray(null); vaoBufs.set(vao,bufs); return vao;
}
