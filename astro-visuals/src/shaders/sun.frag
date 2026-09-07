#version 300 es
precision highp float;
uniform float uTime, uDisc;
uniform vec3 uColD, uColB;   // the photosphere's dark and bright tones, set by its temperature
out vec4 o;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.13; a*=.5; } return s; }
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  float ang = atan(q.y,q.x);
  float R = uDisc;
  vec3 col = vec3(0.0); float lum = 0.0;
  float t = uTime;
  if(r < R){
    float rr = r/R;
    float limb = sqrt(max(0.0, 1.0-rr*rr));
    float g  = fbm(q/R*7.0  + vec2(t*0.030,-t*0.021));
    float g2 = fbm(q/R*17.0 - vec2(t*0.050, t*0.033));
    float b = 0.55 + 0.50*limb + 0.35*(g-0.5) + 0.22*(g2-0.5);
    col = mix(uColD, uColB, clamp(b,0.,1.));
    col += mix(uColD, uColB, 0.8)*pow(limb,3.0)*0.35;
    lum = 1.0;
  }
  float storm = 0.55 + 0.45*sin(t*0.23 + 2.0*sin(t*0.11));   // the slow magnetic cycle
  float rim = (r-R)/R;
  if(rim > -0.05){
    float p1 = fbm(vec2(ang*2.2 + t*0.07, rim*5.0 - t*0.16));
    float arcs = smoothstep(0.60, 0.95, p1) * exp(-max(rim,0.0)*3.2) * (0.45+storm);
    // prominences run a shade redder than the surface, the corona a shade brighter —
    // the same offsets today's fixed colours had, now riding the temperature
    col += uColD*vec3(1.0,0.78,1.2)*arcs*1.6;
    float st = 0.75 + 0.25*fbm(vec2(ang*3.5, t*0.05));
    float cor = exp(-max(rim,0.0)*2.6)*0.35*st;
    col += uColB*vec3(1.0,0.86,0.81)*cor;
    lum = max(lum, max(arcs, cor));
  }
  float aDisc = smoothstep(R, R-0.015, r);
  float a = max(aDisc, min(0.95, lum*0.85));
  o = vec4(col*max(lum, aDisc), a);
}