#version 300 es
precision mediump float;
in vec3 vColor; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  float d = 1.0-r;
  float corona = pow(d, 6.0);
  float core   = pow(d, 20.0);
  float a = corona*0.85 + core*1.35;
  vec3 col = vColor*a + vColor.g*core*0.9;   // the white-core lift, scaled by luminance
  o = vec4(col, a);
}