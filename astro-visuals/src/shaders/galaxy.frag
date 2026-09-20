#version 300 es
precision highp float;
// A Local Group galaxy on its half-light ellipse (the quad from gcradio.vert, uv = 1 at
// the half-light radius, margin beyond). Profiles by kind: the spheroidals and irregulars
// exponential, the compact ellipticals steeper, the one spiral an exponential disk with a
// two-armed modulation; the dark galaxy is an outline and nothing inside it, which is what
// there is to see. Brightness is a marker's, not a photometer's — see astro/localgroup.
uniform float uKind;     // 0 dSph, 1 dIrr, 2 dE/cE, 3 spiral, 4 dark
uniform vec3  uCol;
uniform float uGain;
uniform float uSeed;
uniform float uFade;
in vec2 vUv;
out vec4 o;

float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float gauss(float x, float w){ return exp(-x*x/(w*w)); }

void main(){
  vec2 p = vUv;
  float r = length(p);
  int kind = int(uKind + 0.5);
  float I = 0.0;
  vec3 col = uCol;
  if(kind == 4){
    // a dark galaxy: nothing shines; a dashed outline at the HI disc's edge says "here"
    float th = atan(p.y, p.x);
    float dash = step(0.5, fract(th*2.2));
    I = gauss(r - 1.0, 0.07)*dash*0.9 + 0.05*smoothstep(1.0, 0.6, r);
  } else if(kind == 3){
    // an exponential disk with two arms wound round it
    float th = atan(p.y, p.x);
    float arms = 1.0 + 0.55*cos(2.0*th - 3.2*log(max(r, 0.05)) + uSeed)*smoothstep(0.15, 0.5, r);
    I = exp(-1.68*r)*arms*(0.85 + 0.3*vnoise(p*9.0 + uSeed)) + 0.6*gauss(r, 0.12);
    col = mix(uCol, vec3(1.0,0.9,0.72), gauss(r, 0.25));
  } else if(kind == 2){
    I = exp(-3.0*pow(r, 0.55)) + 0.5*gauss(r, 0.15);
  } else if(kind == 1){
    // an irregular: an exponential body with bright knots of star formation on it
    float n = vnoise(p*7.0 + uSeed*3.0);
    float knots = smoothstep(0.62, 0.9, n)*exp(-1.2*r);
    I = exp(-1.68*r)*(0.8 + 0.4*vnoise(p*3.5 + uSeed)) + 1.4*knots;
    col = mix(uCol, vec3(0.65,0.8,1.0), knots*2.0);
  } else {
    I = exp(-1.68*r)*(0.9 + 0.2*vnoise(p*4.0 + uSeed));
  }
  I *= uGain*uFade;
  if(I < 0.002) discard;
  o = vec4(col*I, 1.0);
}
