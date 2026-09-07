#version 300 es
uniform mat4 uProj,uView; uniform float uSz;
void main(){ gl_Position=uProj*uView*vec4(0.,0.,0.,1.); gl_PointSize=uSz; }