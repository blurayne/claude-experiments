#version 300 es
layout(location=0) in vec3 aPos;
uniform mat4 uProj,uView;
uniform float uLen;
uniform vec3 uOrg;
out float vF;
void main(){
  gl_Position = uProj*uView*vec4(aPos-uOrg,1.0);
  vF = float(gl_VertexID)/uLen;
}