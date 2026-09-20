#version 300 es
precision highp float;
// The radio sky of the Galactic Centre, one object per quad. What a 90-cm map shows is
// synchrotron and free-free emission that no eye could see, so this is drawn the way radio
// maps are printed — intensity through a heat ramp, black through red and orange to white —
// and the article says so. The forms are the catalogue's (a shell, a filament, a glow); the
// texture inside each form is noise, a model of clumpiness, not data.
uniform float uKind;     // 0 glow, 1 shell, 2 filament, 3 cometary, 4 cluster, 5 double, 6 core, 7 ridge
uniform float uBend;     // a filament's bend, fraction of its length
uniform float uCore;     // a shell with a bright centre (composite remnant)
uniform float uAspect;   // long axis over short: the filament's width profile needs it
uniform float uSize;     // the long half-axis, scene units: the texture's cells are a fixed size on the sky
uniform float uStrands;  // a filament bundle's strand count
uniform float uGain;     // overall brightness
uniform float uSeed;
uniform float uFade;
in vec2 vUv;
out vec4 o;

float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int k=0;k<4;k++){ s+=a*vnoise(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return s; }

// the printed map's ramp: black, deep red, orange, yellow, white
vec3 heat(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(vec3(0.0), vec3(0.55,0.05,0.02), smoothstep(0.0, 0.25, t));
  c = mix(c, vec3(1.0,0.42,0.08), smoothstep(0.2, 0.55, t));
  c = mix(c, vec3(1.0,0.85,0.35), smoothstep(0.5, 0.8, t));
  c = mix(c, vec3(1.0,0.97,0.9), smoothstep(0.78, 1.0, t));
  return c;
}
float gauss(float x, float w){ return exp(-x*x/(w*w)); }

void main(){
  vec2 p = vUv;                       // 1 = the outline's half-axis, either way
  float r = length(p);
  int kind = int(uKind + 0.5);
  float I = 0.0;
  vec2 np = vec2(p.x, p.y/uAspect)*uSize*2.5 + uSeed*7.1;   // noise coordinates, isotropic on the sky: cells ~12 ly
  float tex = 0.6 + 0.8*fbm(np*2.0);
  if(kind == 0){                                   // an HII complex: a soft glow, clumpy
    I = gauss(r, 0.62)*tex + 0.45*gauss(r, 0.28);
  } else if(kind == 1){                            // a supernova remnant: a limb-brightened shell
    float rim = gauss(r - 0.92, 0.09)*(0.25 + 1.3*fbm(np*1.5 + 3.0));
    float fill = 0.16*smoothstep(1.0, 0.7, r)*tex;
    I = rim + fill + uCore*(0.9*gauss(r, 0.2) + 0.5*gauss(r, 0.08));
  } else if(kind == 2){                            // a nonthermal filament: a thin bright line
    // the line runs along x, y is across it in units of the (half-)width; a gentle bend
    float y = p.y - uBend*uAspect*sin(p.x*3.14159)*1.0;
    float taper = smoothstep(1.0, 0.85, abs(p.x));
    float along = 0.55 + 0.7*fbm(vec2(p.x*uSize*1.5 + uSeed, 0.3));
    float n = max(uStrands, 1.0);
    if(n < 1.5) I = gauss(y, 0.55)*taper*along*1.6;
    else for(int k=0;k<8;k++){                     // a bundle: thin strands spread across the width
      if(float(k) >= n) break;
      float yk = (float(k) + 0.5)/n*2.0 - 1.0;
      float bright = 0.5 + 0.8*h21(vec2(float(k), uSeed));
      float along_k = 0.5 + 0.8*fbm(vec2(p.x*uSize*1.5 + float(k)*3.7, 0.3));
      I += gauss(y - yk*0.85, 0.09*2.0/n*3.0)*taper*along_k*bright*1.2;
    }
  } else if(kind == 3){                            // a pulsar wind nebula in flight: head, then tail
    float xh = -0.8;
    float head = 1.6*gauss(length(vec2((p.x - xh)*uAspect*0.5, p.y)), 0.45) + 1.2*gauss(length(vec2((p.x - xh)*uAspect, p.y)), 0.25);
    float t = clamp((p.x - xh)/(1.0 - xh), 0.0, 1.0);
    float tail = exp(-t*2.2)*gauss(p.y, 0.55 + 0.35*t)*step(xh, p.x)*(0.6 + 0.6*fbm(vec2(p.x*5.0, 0.7)));
    I = head + tail*0.8;
  } else if(kind == 4){                            // a cluster of compact HII regions
    for(int k=0;k<9;k++){
      float fk = float(k);
      vec2 c = vec2(h21(vec2(fk, uSeed))*1.7 - 0.85, (h21(vec2(uSeed, fk))*1.5 - 0.75));
      c.x *= 1.0 - 0.3*abs(c.y);
      float s = 0.06 + 0.06*h21(vec2(fk*3.1, 2.0));
      I += (0.5 + 0.6*h21(vec2(fk, 5.0)))*gauss(length((p - c)*vec2(1.0, uAspect))/uAspect, s*uAspect);
    }
    I += 0.08*gauss(r, 0.7);
  } else if(kind == 5){                            // a background radio galaxy: a compact double
    I = 1.2*gauss(length(p - vec2(0.55, 0.0)), 0.3) + 1.2*gauss(length(p + vec2(0.55, 0.0)), 0.3) + 0.3*gauss(r, 0.7);
  } else if(kind == 6){                            // Sgr A: East's shell, West's knot, the halo
    I = 2.2*gauss(r, 0.16) + 1.1*gauss(r, 0.38)*tex + 0.6*gauss(r - 0.32, 0.08) + 0.35*gauss(r, 0.75);
  } else {                                         // the plane's diffuse emission: soft, mottled, with dark lanes
    float m = fbm(np*1.2 + 11.0);
    I = gauss(r, 0.8)*(0.45 + 0.8*m)*smoothstep(0.0, 0.3, 1.0 - r);
    I *= 0.55 + 0.45*smoothstep(0.25, 0.6, m);     // the dark clouds: where the noise is low, little shows
  }
  I *= uGain*uFade;
  if(I < 0.002) discard;
  o = vec4(heat(I), 1.0);
}
