#version 300 es
precision highp float;
uniform float uTime, uAge, uAlpha, uBurst;   // uAge 0..1 through the nebula's life; uBurst 0..1 at the casting
out vec4 o;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.13; a*=.5; } return s; }
// The interacting-winds picture, in stages over uAge. The envelope goes first: dense,
// dusty, lit warm by the still-cool star, thrown off in a burst. Then the exposed core
// heats and its ionisation front sweeps outward through the ejecta — teal [OIII] inside
// the front, warm dust still beyond it — while the fast wind hollows a cavity, so the
// shell becomes the limb-brightened, filamentary thing with Hα at its rim that a
// planetary nebula is, with radial cometary knots where the front passed and a faint
// outer halo of the earlier, slower wind. Then it thins and dissolves.
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float rg = length(q);                              // in the sprite, which the burst enlarges
  if(rg>1.0) discard;
  // During the casting the sprite is drawn up to 3.5× the shell, so the star's light
  // scattered off the fresh dust — a reflection halo, not a shock — has room beyond it;
  // everything that belongs to the shell is measured in r, the shell's own scale.
  float grow = 1.0 + 2.5*uBurst;
  float r = min(1.0, rg*grow);
  float ang = atan(q.y,q.x), a = uAge;
  float eject = smoothstep(0.0, 0.18, a);            // the envelope is off
  float ion   = smoothstep(0.15, 0.55, a);           // the front has swept out
  float old   = smoothstep(0.72, 1.0, a);            // dissolving
  float R = mix(0.52, 0.76, a);                      // the shell in the sprite (the sprite itself grows)
  float w = mix(0.24, 0.075, ion) + 0.14*old;        // thick envelope -> thin shell -> frayed
  float n1 = fbm(vec2(ang*3.0 + 3.0, r*6.0 - a*1.5));
  float knots = fbm(vec2(ang*11.0 + uTime*0.005, r*1.6));      // streaks along r: cometary knots
  float clump = fbm(q*5.0 + 7.0);
  float fil = 0.40 + 0.70*n1 + 0.55*(knots-0.5)*ion + 0.30*(clump-0.5);
  float env = exp(-pow((r-R)/w, 2.0));
  float cavity = smoothstep(R*0.25, R*0.92, r);      // the fast wind empties the middle
  float body = env * max(fil, 0.0) * mix(1.0, cavity, ion) * (0.82 + 0.18*cos(2.0*ang + 0.8));
  float dust = smoothstep(R+0.12, 0.0, r) * (0.22 + 0.30*clump) * (1.0-ion) * eject;
  float rIon = mix(0.0, 1.08, ion);                  // where the ionisation front stands
  float inFront = smoothstep(rIon+0.07, rIon-0.07, r);
  vec3 warm = vec3(1.00, 0.56, 0.30);
  vec3 oiii = vec3(0.32, 0.92, 0.78);
  vec3 ha   = vec3(1.00, 0.34, 0.26);
  vec3 shellCol = mix(oiii, ha, smoothstep(R-0.03, R+0.10, r));
  vec3 col = body * mix(warm, shellCol, inFront) * 0.95 + dust * warm;
  col += oiii * exp(-pow((r-rIon)/0.05, 2.0)) * 0.55 * ion * (1.0-old) * step(rIon, 1.0) * (0.7+0.6*n1);   // the front itself
  col += oiii * smoothstep(R, 0.0, r) * 0.08 * inFront * (1.0-old);                                          // the interior's glow
  col += ha * exp(-pow((r-0.95)/0.05, 2.0)) * 0.14 * ion * (1.0-old) * (0.5+0.5*n1);                        // the old wind's halo
  float flash = uBurst;                              // the casting: a burst of light, not a shock
  col *= 1.0 + 1.3*flash;
  col += warm * exp(-pow(rg/0.45, 2.0)) * 0.9 * flash * (0.75+0.5*fbm(q*4.0+2.0));   // scattered off the fresh dust
  col += vec3(1.0,0.85,0.6) * exp(-pow(rg/0.12, 2.0)) * 1.4 * flash;                 // and the star, glaring through
  col *= 1.0 - 0.65*old;
  o = vec4(col*uAlpha, 0.0);
}