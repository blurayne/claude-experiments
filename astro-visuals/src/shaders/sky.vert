#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aUV;
uniform mat4 uProj, uView;
uniform vec3 uOrg;
out vec2 vUV;
// The extragalactic skybox: textured quads pinned to the far sky. Sun-relative like
// everything drawn (uOrg), and deliberately NOT wave-rotated: the background universe
// does not turn with our disk, so over deep time the Milky Way visibly rotates against
// the fixed field of the bright galaxies — which is the whole point of drawing them.
void main(){
  vUV = aUV;
  gl_Position = uProj * uView * vec4(aPos - uOrg, 1.0);
}
