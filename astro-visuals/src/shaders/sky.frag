#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex;
uniform float uGain;
out vec4 o;
// Additive, like every sprite here: the photographs are vignetted to black at their
// edges during ingest, so black adds nothing and no alpha channel is needed.
void main(){
  o = vec4(texture(uTex, vUV).rgb * uGain, 1.0);
}
