#version 300 es
precision highp float;
in vec3 vColor; in float vPhase; in float vSeed; out vec4 o;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r > 1.0) discard;
  // the shell: thin and sharp while young, thick and frayed when old
  float R = mix(0.58, 0.80, vPhase);
  float w = mix(0.09, 0.22, vPhase);
  // Filaments from value noise over the sprite, not from harmonics in angle: harmonics
  // bead the rim into a string of pearls, and noise is seamless and never repeats.
  // The seed places each remnant somewhere else in the noise, so no two match.
  vec2 s = vec2(vSeed*37.0, vSeed*91.0);
  float n1 = vnoise(q*4.5 + s), n2 = vnoise(q*10.0 - s*1.7), n3 = vnoise(q*21.0 + s*0.6);
  float fil = 0.35 + 0.65*n1 + 0.40*(n2-0.5) + 0.22*(n3-0.5)*(1.0 - vPhase);
  float shell = exp(-pow((r - R)/w, 2.0)) * max(fil, 0.0);
  float fill  = smoothstep(R, 0.0, r) * 0.18;      // the thin glow of the interior
  // the rim runs warmer than the body, as shocked gas does
  vec3 col = vColor * (shell * mix(1.0, 1.35, smoothstep(R-0.05, R+0.12, r)) + fill);
  o = vec4(col, shell + fill);
}