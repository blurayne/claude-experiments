#version 300 es
precision mediump float;
uniform float uGFade;  // galaxy-haze pass only: dies away when the camera is in close
in vec3 vColor; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  float a = pow(1.0-r, 2.1)*uGFade;
  o = vec4(vColor*a, a);
}