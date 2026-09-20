#version 300 es
// galaxies and groups as points: a position, a size in pixels at unit distance, a colour
layout(location=0) in vec3 aPos;
layout(location=1) in float aSize;
layout(location=2) in vec3 aCol;
uniform mat4 uProj, uView;
uniform float uPx;      // pixels per unit at unit distance
uniform float uFade;
uniform float uMinPx, uMaxPx;
out vec3 vColor;
void main(){
  vec4 e = uView*vec4(aPos, 1.0);
  gl_Position = uProj*e;
  float d = max(length(e.xyz), 1.0);
  gl_PointSize = clamp(aSize*uPx/d, uMinPx, uMaxPx);
  vColor = aCol*uFade;
}
