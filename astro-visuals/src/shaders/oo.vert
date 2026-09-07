#version 300 es
layout(location=0) in vec3 aOff;
layout(location=1) in float aSz;
uniform mat4 uProj,uView; uniform float uPx,uS; uniform vec3 uSun;
void main(){
  vec4 mv=uView*vec4(uSun+aOff*uS,1.0); gl_Position=uProj*mv;
  gl_PointSize=clamp(aSz*uS*uPx/max(1e-9,-mv.z),1.0,6.0);
}