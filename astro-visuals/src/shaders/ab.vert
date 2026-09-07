#version 300 es
layout(location=0) in vec2 aRT;  // orbit radius, initial angle
layout(location=1) in float aH;  // offset along the ecliptic normal
layout(location=2) in float aSz;
layout(location=3) in float aP;  // real orbital period, years
uniform mat4 uProj,uView; uniform float uPx,uT,uS;
uniform vec3 uSun,uE1,uE2,uEN;
void main(){
  float a = aRT.y + uT*6.28318/aP;
  vec3 p = uSun + (cos(a)*aRT.x*uS)*uE1 + (sin(a)*aRT.x*uS)*uE2 + aH*uS*uEN;
  vec4 mv=uView*vec4(p,1.0); gl_Position=uProj*mv;
  gl_PointSize=clamp(aSz*uS*uPx/max(1e-9,-mv.z),1.0,6.0);
}