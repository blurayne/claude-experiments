#version 300 es
precision mediump float;
in vec3 vColor; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  float d = 1.0-r;
  float a = pow(d, 2.2)*0.9 + pow(d, 12.0)*0.8;
  o = vec4(vColor*a, a);
}
