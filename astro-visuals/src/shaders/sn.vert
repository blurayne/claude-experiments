#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aSize;
layout(location=2) in vec3 aColor;
layout(location=3) in float aPhase;  // 0 at collapse .. 1 at the end of the drawn flash
uniform mat4 uProj, uView;
uniform float uPx, uSpin, uWarp, uCap;
uniform vec3 uSunPos, uOrg;
out vec3 vColor; out float vPhase; out float vSeed;
void main(){
  vec3 p = aPos;
  float fade = 1.0;
  if(uSpin != 0.0){
    float r = length(p.xz);
    float d = uSpin/650.0;                       // the bar-driven arms' pattern speed: these are arm stars
    float c = cos(d), s = sin(d);
    p = vec3(p.x*c + p.z*s, p.y, p.z*c - p.x*s);
    float wr = max(0.0, r - 950.0);
    p.y += wr*0.13*sin(atan(p.x,p.z) - uWarp) + 4.0*sin(r*0.021);
    fade = smoothstep(80.0, 240.0, distance(p, uSunPos));
  }
  vec4 mv = uView * vec4(p - uOrg, 1.0);
  gl_Position = uProj * mv;
  gl_PointSize = clamp(aSize * uPx / max(1e-9, -mv.z), 1.0, uCap);
  vColor = aColor * fade;
  vPhase = aPhase;
  vSeed  = fract(sin(dot(aPos.xz, vec2(41.7, 289.3)))*43758.5453);
}