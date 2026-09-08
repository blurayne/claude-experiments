/**
 * The only matrix maths in the piece: a perspective projection, a look-at, and a multiply.
 * Column-major, to match what WebGL expects, and Float32Array because that is what is handed
 * to uniformMatrix4fv without a copy.
 *
 * `mul` shares its name with a GF(256) multiply inside qrEncode, which is function-local and
 * must stay that way — an editor that helpfully auto-imports this one over it corrupts the
 * QR error-correction bytes, and the code still runs.
 */

export type Vec3 = readonly [number, number, number]
export type Mat4 = Float32Array

/**
 * The identity, as a 3×3. Four passes carry a galaxy rotation — points, nebula, dust and the
 * boot-time push that sets all three — and each of them turns Andromeda into her own frame
 * and then puts this back, because a program keeps its uniforms and the Milky Way's next draw
 * would otherwise inherit hers. One shared constant, never written to.
 */
export const MAT3_ID = new Float32Array([1,0,0, 0,1,0, 0,0,1])

export function perspective(fov: number, asp: number, n: number, f: number): Mat4 {
  const t = 1 / Math.tan(fov / 2), m = new Float32Array(16)
  m[0]=t/asp; m[5]=t; m[10]=(f+n)/(n-f); m[11]=-1; m[14]=2*f*n/(n-f);
  return m
}

export function lookAt(eye: Vec3, at: Vec3, up: Vec3): Mat4 {
  const zx=eye[0]-at[0], zy=eye[1]-at[1], zz=eye[2]-at[2];
  let zl=Math.hypot(zx,zy,zz)||1; const Z: [number,number,number]=[zx/zl,zy/zl,zz/zl];
  const X: [number,number,number]=[up[1]*Z[2]-up[2]*Z[1], up[2]*Z[0]-up[0]*Z[2], up[0]*Z[1]-up[1]*Z[0]];
  let xl=Math.hypot(X[0],X[1],X[2])||1; X[0]/=xl;X[1]/=xl;X[2]/=xl;
  const Y: [number,number,number]=[Z[1]*X[2]-Z[2]*X[1], Z[2]*X[0]-Z[0]*X[2], Z[0]*X[1]-Z[1]*X[0]];
  return new Float32Array([
    X[0],Y[0],Z[0],0, X[1],Y[1],Z[1],0, X[2],Y[2],Z[2],0,
    -(X[0]*eye[0]+X[1]*eye[1]+X[2]*eye[2]),
    -(Y[0]*eye[0]+Y[1]*eye[1]+Y[2]*eye[2]),
    -(Z[0]*eye[0]+Z[1]*eye[1]+Z[2]*eye[2]),1])
}

/** a*b, column-major. */
export function mul(a: Mat4, b: Mat4): Mat4 {
  const o=new Float32Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++){
    o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
  } return o
}
