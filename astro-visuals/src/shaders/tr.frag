#version 300 es
precision mediump float;
in float vF; uniform vec3 uColor; uniform float uAlpha; uniform float uFlat; out vec4 o;
void main(){ float f = mix(pow(vF,1.7), 1.0, uFlat)*uAlpha; o = vec4(uColor*f, f); }