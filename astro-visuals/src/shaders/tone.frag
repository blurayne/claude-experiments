#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform float uKnee;
in vec2 vUV; out vec4 o;
void main(){
  vec3 c = texture(uTex, vUV).rgb;
  float m = max(max(c.r, c.g), c.b);
  if(m > uKnee && m > 1e-6){
    float h = max(1.0 - uKnee, 1e-4);
    c *= (uKnee + h*(1.0 - exp(-(m - uKnee)/h)))/m;
  }
  o = vec4(c, 1.0);
}