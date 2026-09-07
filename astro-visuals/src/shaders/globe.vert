#version 300 es
uniform mat4 uProj,uView; uniform vec3 uPos; uniform float uSz;
void main(){ gl_Position = uProj*uView*vec4(uPos,1.0); gl_PointSize = uSz; }