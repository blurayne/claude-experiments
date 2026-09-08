import { gl } from '../../gpu/context'
import { dynVAO } from '../../gpu/buffers'
import { pPt, U } from './points'

/**
 * The flares: a planet the Sun's surface has just reached, a white point over the limb for a
 * moment.
 *
 * Over the disc on purpose — at that instant the planet IS at the surface, and a disc drawn
 * opaque would otherwise hide the one thing worth seeing. Which is why this is the last thing
 * drawn before the tone map: three points at most, and they have to be on top.
 *
 * The timers live in the frame, not here. Engulfment latches on age and a flare only starts
 * when the clock runs across the moment, so a jump that lands past it finds the planet
 * already gone — that is a statement about the model, and it stays with the model.
 */

const eatGL = dynVAO(4);
const eatPos = new Float32Array(12), eatSize = new Float32Array(4), eatCol = new Float32Array(12), eatW = new Float32Array(4);

export interface EatFlashInputs {
  /** how far each of the three inner planets is through its flare, or < 0 for none */
  eatFlash: Float32Array | number[]
  /** the bodies' positions, Sun-relative — the flare stands where the planet did */
  bodyPosArr: Float32Array
  camDist: number
}

export function drawEatFlash({ eatFlash, bodyPosArr, camDist }: EatFlashInputs): void {
  let n = 0;
  for(let i=1;i<=3;i++){
    const t = eatFlash[i];
    if(t < 0 || camDist >= 0.13) continue;
    const env = t < 0.12 ? t/0.12 : Math.exp(-(t-0.12)/0.5);
    eatPos[n*3]=bodyPosArr[i*3]; eatPos[n*3+1]=bodyPosArr[i*3+1]; eatPos[n*3+2]=bodyPosArr[i*3+2];
    eatSize[n] = camDist*0.032*(0.6+0.4*env);
    eatCol[n*3]=2.4*env; eatCol[n*3+1]=2.4*env; eatCol[n*3+2]=2.6*env;
    eatW[n] = 0; n++;
  }
  if(n){
    gl.useProgram(pPt);
    gl.uniform1f(U.ptSpin, 0.0); gl.uniform1f(U.ptVM, 0.0); gl.uniform1f(U.ptTide, 0.0);
    gl.uniform1f(U.ptMinB, 0.0); gl.uniform1f(U.ptMinSz, 1.3); gl.uniform1f(U.ptCap, 110.0);
    gl.uniform3f(U.ptOrg, 0,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatPos.subarray(0,n*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatSize.subarray(0,n));
    gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatCol.subarray(0,n*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatW.subarray(0,n));
    gl.bindVertexArray(eatGL.vao); gl.drawArrays(gl.POINTS,0,n);
  }
}
