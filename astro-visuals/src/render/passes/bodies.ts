import { gl } from '../../gpu/context'
import { AU2U } from '../../astro/constants'
import { BODIES, NB, N_PLANETS, I_P9 } from '../../astro/bodies'
import { pPt, U } from './points'

/**
 * The Sun, the planets and the dwarfs, as points.
 *
 * Positions are uploaded Sun-relative and already include the bodies' motion, so this pass
 * turns off the wave rotation, the variability and the star field's brightness floor: a
 * planet is not part of the galaxy and must not be lifted with it.
 *
 * Three buffers, one static-looking and two not. Sizes change when the piece switches between
 * the drawn scale and the real one, and again as the Sun swells and each inner planet is
 * swallowed. Colours change because the Sun's follows its temperature. The CPU-side arrays
 * are exported because the frame fills them and the labels read them — they are the model of
 * where the bodies are, not this pass's private state.
 */

// BODIES is a table of mixed columns — name, period, radii, colour, axis — so each column is
// read through the type it actually holds. main.ts got this for free under @ts-nocheck.
const spriteSize = (b: (typeof BODIES)[number]): number => b[3] as number
const realRadiusKm = (b: (typeof BODIES)[number]): number => b[6] as number
const colour = (b: (typeof BODIES)[number]): number[] => b[4] as number[]

export const bodyPosArr = new Float32Array(NB*3);
export const dispSizes = new Float32Array(BODIES.map(spriteSize));
/** true diameters in scene units */
export const realSizes = new Float32Array(BODIES.map(b=>2*(realRadiusKm(b)/1.496e8)*AU2U));
export const bodyCol = new Float32Array(NB*3);
BODIES.forEach((b,i)=>{ const c = colour(b); bodyCol[i*3]=c[0]; bodyCol[i*3+1]=c[1]; bodyCol[i*3+2]=c[2]; });

const vaoBodies = gl.createVertexArray()!; gl.bindVertexArray(vaoBodies);
const bufBodyPos = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyPos); gl.bufferData(gl.ARRAY_BUFFER,bodyPosArr,gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
const bufBodySize = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, bufBodySize); gl.bufferData(gl.ARRAY_BUFFER,dispSizes,gl.STATIC_DRAW);
gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
// colours are dynamic too: the Sun's follows its temperature, and a planet being
// swallowed flares white for a moment
const bufBodyCol = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, bufBodyCol); gl.bufferData(gl.ARRAY_BUFFER,bodyCol,gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,3,gl.FLOAT,false,0,0);
gl.bindVertexArray(null);

/** Swap the whole size buffer: the drawn scale, or the true diameters. */
export function setBodySizes(real: boolean): void {
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize);
  gl.bufferData(gl.ARRAY_BUFFER, real?realSizes:dispSizes, gl.STATIC_DRAW);
}

/**
 * Write one body's size in place. `index` is the body, not a byte offset — the Sun swelling
 * and a planet being swallowed each touch exactly one float, every frame.
 */
export function uploadBodySize(index: number, size: Float32Array): void {
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize); gl.bufferSubData(gl.ARRAY_BUFFER,index*4,size);
}

/** The Sun's colour, which is the only one that moves. */
export function uploadSunColour(): void {
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyCol); gl.bufferSubData(gl.ARRAY_BUFFER,0,bodyCol,0,3);
}

export function uploadBodyPositions(): void {
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyPos);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,bodyPosArr);
}

export interface BodyInputs {
  showDwarfs: boolean
  /** Planet Nine is drawn separately: it is hypothetical, and its own switch */
  showP9: boolean
}

export function drawBodies({ showDwarfs, showP9 }: BodyInputs): void {
  gl.useProgram(pPt);
  gl.uniform1f(U.ptSpin, 0.0); // body positions already include their motion
  gl.uniform1f(U.ptVM, 0.0);
  gl.uniform1f(U.ptMinB, 0.0);   // the planets are not part of the star field
  gl.uniform1f(U.ptMinSz, 1.3);
  gl.uniform1f(U.ptCap, 110.0);
  gl.uniform3f(U.ptOrg, 0,0,0); // bodies are uploaded Sun-relative already
  gl.bindVertexArray(vaoBodies);
  gl.drawArrays(gl.POINTS, 0, showDwarfs ? I_P9 : N_PLANETS);
  if(showP9) gl.drawArrays(gl.POINTS, I_P9, 1);
}
