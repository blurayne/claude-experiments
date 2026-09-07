/**
 * Compile and link. Both throw on failure rather than returning null, because a program that
 * failed to link draws nothing and reports nothing — the canvas is simply black, and the
 * info log is the only thing that says why.
 *
 * The uniform-location tables stay hand-written at their call sites and are NOT harvested by
 * a helper here. They are not interchangeable: UN omits uVelT/uMinB/uFadeOut, UD omits those
 * plus uTime/uVarMode, and the GL default of zero for the missing ones is load-bearing —
 * attribute location 4 (aVel) is never enabled by any VAO, so unioning the key lists would
 * give nebulae and dust a proper-motion shear they have never had.
 */
import { gl } from './context'

function sh(type: number, src: string): WebGLShader {
  const s=gl.createShader(type)!; gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader failed to compile, with no info log');
  return s;
}
export function prog(vs: string, fs: string): WebGLProgram {
  const p=gl.createProgram()!;
  gl.attachShader(p,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program failed to link, with no info log');
  return p;
}

