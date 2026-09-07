#version 300 es
layout(location=0) in vec2 aCS;
uniform mat4 uProj,uView; uniform vec3 uSun,uA,uB; uniform float uR;
void main(){ gl_Position = uProj*uView*vec4(uSun + uR*(aCS.x*uA + aCS.y*uB), 1.0); }