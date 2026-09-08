import { gl } from '../../gpu/context'
import { dynVAO } from '../../gpu/buffers'
import { REAL_MODE } from '../../astro/constants'
import { U } from './points'
import type { G710Position } from '../../astro/g710'

/**
 * Gliese 710's passage: one point, on the same symbolic scale as the Oort cloud in the
 * compressed view and at its true separation in real scale, so it passes where the cloud
 * actually is. It reddens and brightens as it closes.
 *
 * It draws on the point program, whose uniforms the passes before it have been setting and
 * unsetting all frame, so this one sets the six it depends on rather than trusting them.
 */

const g710GL = dynVAO(1);
const g710Pos = new Float32Array(3), g710Size = new Float32Array(1), g710Col = new Float32Array(3);

export interface G710Inputs {
  /** where the star is and how far away, from astro/g710 */
  star: G710Position
  camDist: number
}

export function drawG710({ star, camDist }: G710Inputs): void {
  if(star.d < 60){
    const k = REAL_MODE ? 1/30 : 178/1.6;      // scene units per light year
    g710Pos[0]=star.x*k; g710Pos[1]=star.y*k; g710Pos[2]=star.z*k;
    g710Size[0] = REAL_MODE ? Math.max(0.9, camDist*0.006) : 2.6;
    const near = Math.min(1, Math.max(0, (6-star.d)/6));
    g710Col[0]=0.55+0.75*near; g710Col[1]=0.34+0.34*near; g710Col[2]=0.20+0.18*near;
    gl.uniform1f(U.ptSpin, 0.0); gl.uniform1f(U.ptVM, 0.0); gl.uniform1f(U.ptTide, 0.0);
    gl.uniform1f(U.ptMinB, 0.0); gl.uniform1f(U.ptMinSz, 1.3);
    gl.uniform3f(U.ptOrg, 0,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,g710GL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,g710Pos);
    gl.bindBuffer(gl.ARRAY_BUFFER,g710GL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,g710Size);
    gl.bindBuffer(gl.ARRAY_BUFFER,g710GL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,g710Col);
    gl.bindVertexArray(g710GL.vao); gl.drawArrays(gl.POINTS,0,1);
  }
}
