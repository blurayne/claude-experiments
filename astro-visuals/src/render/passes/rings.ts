import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import RING_VS from '../../shaders/ring.vert?raw'
import RING_FS from '../../shaders/ring.frag?raw'

/**
 * One circle, drawn anywhere. The vertex buffer is a unit circle in two dimensions and the
 * shader puts it in space: a centre, a radius, and two orthogonal unit vectors spanning the
 * plane it lies in. Everything circular in the piece that is not a body's swept path is this
 * — the three great circles that suggest the Oort cloud's shell, and the Moon's orbit.
 *
 * It is its own module because it is shared. `passes/belts` needed it and could not have it:
 * the shell's wireframe had to stay behind in main.ts because splitting one program across
 * two modules would have been worse than leaving one `if(showOort)` in two adjacent halves.
 * With the program here, both halves are in `passes/belts` where they belong.
 */

const RING_SEGS = 160;
const ringCS = new Float32Array(RING_SEGS*2);
for(let i=0;i<RING_SEGS;i++){ const a=i/RING_SEGS*6.28318530718; ringCS[i*2]=Math.cos(a); ringCS[i*2+1]=Math.sin(a); }

const pRing = prog(RING_VS, RING_FS);
const UR: Record<string, WebGLUniformLocation | null> = {}; for(const k of ['uProj','uView','uSun','uA','uB','uR','uColor']) UR[k]=gl.getUniformLocation(pRing,k);
const vaoRing = gl.createVertexArray()!; gl.bindVertexArray(vaoRing);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!); gl.bufferData(gl.ARRAY_BUFFER,ringCS,gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
gl.bindVertexArray(null);

/** A great circle's plane: two orthogonal unit vectors that span it. */
export type RingPlane = readonly [readonly number[], readonly number[]]

export interface RingInputs {
  projMat: Float32Array
  viewMat: Float32Array
  /** the centre, Sun-relative like everything else drawn */
  centre: readonly number[]
  radius: number
  colour: readonly number[]
  /**
   * The planes to draw, sharing the centre, radius and colour. An empty list is meaningful
   * and not a mistake: the caller has decided none of them is worth drawing from here, and
   * the program and its uniforms are still left set exactly as they were before.
   */
  planes: readonly RingPlane[]
}

export function drawRings({ projMat, viewMat, centre, radius, colour, planes }: RingInputs): void {
  gl.useProgram(pRing);
  gl.uniformMatrix4fv(UR.uProj,false,projMat);
  gl.uniformMatrix4fv(UR.uView,false,viewMat);
  gl.uniform3f(UR.uSun, centre[0], centre[1], centre[2]);
  gl.uniform1f(UR.uR, radius);
  gl.uniform3f(UR.uColor, colour[0], colour[1], colour[2]);
  gl.bindVertexArray(vaoRing);
  for(const [A,B] of planes){
    gl.uniform3f(UR.uA,A[0],A[1],A[2]);
    gl.uniform3f(UR.uB,B[0],B[1],B[2]);
    gl.drawArrays(gl.LINE_LOOP,0,RING_SEGS);
  }
}
