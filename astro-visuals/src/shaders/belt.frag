#version 300 es
precision mediump float; uniform vec3 uColor; uniform float uAlpha; out vec4 o;
void main(){ vec2 q=gl_PointCoord*2.0-1.0; float r=length(q); if(r>1.0) discard;
  float a=smoothstep(1.0,0.0,r)*uAlpha; o=vec4(uColor*a,a); }