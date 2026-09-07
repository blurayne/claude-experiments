#version 300 es
precision mediump float;
in vec3 vColor; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  // never opaque at the centre: a cloud thins the haze behind it, it does not punch
  // a black hole in it (that is what the old profile did, reaching alpha 1 and past)
  // interstellar dust reddens: the blend multiplies what is behind by 1 − rgb, and the
  // extinction runs A_R : A_V : A_B ≈ 0.82 : 1 : 1.32 (R_V = 3.1), so blue goes first
  float a = min(0.72, pow(1.0-r, 2.4)*vColor.r);
  o = vec4(a*vec3(0.62, 0.76, 1.0), a);
}