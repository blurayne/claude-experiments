#version 300 es
precision highp float;
// A black hole, ray-marched. One billboard, and every fragment of it traces a light ray
// backward from the eye through the Schwarzschild geometry: the rays that fall in paint the
// shadow, the ones that bend round and strike the accretion disc paint the disc — including
// the far side, lifted over and under the hole by the bending, and the thin photon ring
// where rays have circled the hole before landing. Nothing about the shape is drawn; it all
// falls out of the geodesic equation, and the shadow comes out 2.6 Schwarzschild radii wide
// because that is where the photon capture cross-section is.
//
// Units: the Schwarzschild radius is 1. The null geodesic in these units, in a Cartesian
// embedding, is d²x/dλ² = −(3/2)·h²·x/r⁵ with h the conserved |x × v| — the form every
// real-time black-hole renderer integrates. Leapfrog steps, adaptive with the radius.
//
// The disc is a thin Shakura–Sunyaev sheet from the innermost stable orbit (3 r_s) out to
// uDiscOut, temperature falling as r^(-3/4) and flux as r^(-3), Doppler-beamed by the
// orbital speed sqrt(1/2r) and reddened by the gravitational redshift. It is a MODEL of an
// accretion flow, drawn where a flow is known to exist; where none is (uDisc = 0) only the
// shadow and a faint ring of lensed skylight are drawn.
uniform float uSz;       // sprite width, pixels
uniform float uRs;       // one Schwarzschild radius as a fraction of the sprite's half-width
uniform float uMirror;   // the projection reflects x; the sprite does not
uniform vec3  uDiscN;    // the disc's normal, in the sprite's own frame (x right, y up, z toward the eye)
uniform float uDisc;     // 1: draw the accretion disc; 0: shadow and lensed sky only
uniform float uDiscOut;  // the disc's outer edge, Schwarzschild radii
uniform float uSpin;     // +1 / −1: which way the disc turns about its normal
uniform float uTime;
uniform float uFade;     // overall alpha
out vec4 o;

float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }

// a thermal ramp: the hot inner rim runs white-blue, the cool rim deep orange-red
vec3 thermal(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(vec3(0.50,0.10,0.02), vec3(1.0,0.50,0.14), smoothstep(0.0,0.35,t));
  c = mix(c, vec3(1.0,0.84,0.58), smoothstep(0.3,0.7,t));
  c = mix(c, vec3(0.90,0.94,1.0), smoothstep(0.65,1.0,t));
  return c;
}

// The sheet's texture: streaks that shear round with the Keplerian flow. Built from the
// in-plane coordinates turned by the local orbital angle, so it is periodic round the disc
// by construction — an angle-based lookup would leave a seam where atan wraps.
float sheet(vec3 xc, vec3 n, float rc, float t){
  vec3 u = normalize(cross(n, abs(n.y) < 0.9 ? vec3(0,1,0) : vec3(1,0,0)));
  vec3 w = cross(n, u);
  float omega = 0.35*uSpin/pow(rc, 1.5);          // Keplerian: the inner sheet laps faster
  float ph = omega*t;
  float c = cos(ph), s = sin(ph);
  vec2 q = vec2(dot(xc,u), dot(xc,w));
  q = vec2(q.x*c - q.y*s, q.x*s + q.y*c);
  // stretched along the azimuth: cells long round the ring, short across it
  float ang = atan(q.y, q.x);
  vec2 pc = vec2(rc*2.2, 0.0);
  float a1 = 0.5 + 0.5*vnoise(vec2(rc*2.4 + 1.7*cos(ang) , 1.7*sin(ang) + rc*0.3));
  float a2 = 0.5 + 0.5*vnoise(vec2(rc*4.8 + 3.1*cos(ang + 0.7), 3.1*sin(ang + 0.7)));
  return 0.55 + 0.45*(0.65*a1 + 0.35*a2);
}

void main(){
  vec2 qq = gl_PointCoord*2.0-1.0;
  if(dot(qq,qq) > 1.0) discard;
  // the sprite frame: x to the right on screen (the projection mirrors x), y up, z toward the eye
  vec2 p2 = vec2(qq.x*uMirror, -qq.y)/uRs;         // in Schwarzschild radii
  float Rmax = 1.0/uRs;                            // the sprite's half-width, r_s
  // an orthographic ray: the hole is a speck at any distance the eye can reach; start it on
  // the sprite's far bounding sphere and march it toward −z
  float b2 = dot(p2,p2);
  float z0 = sqrt(max(Rmax*Rmax - b2, 0.0)) + 0.5;
  vec3 x = vec3(p2, z0);
  vec3 v = vec3(0.0, 0.0, -1.0);
  vec3 hv = cross(x, v);
  float h2 = dot(hv, hv);
  vec3 n = normalize(uDiscN);
  float side = dot(x, n);
  vec3 col = vec3(0.0); float a = 0.0; bool done = false;
  float rmin = 1e9;                                // the closest the ray comes: the shadow's soft edge
  float r = length(x);
  for(int i=0;i<300;i++){
    r = length(x);
    rmin = min(rmin, r);
    if(r < 1.0){ col = vec3(0.0); a = 1.0; done = true; break; }        // in
    if(r > Rmax + 1.0 && dot(x,v) > 0.0){ break; }                        // out, and leaving
    float dt = clamp(0.045*r, 0.035, 0.4);
    // leapfrog: half kick, drift, half kick
    vec3 acc = -1.5*h2*x/pow(r, 5.0);
    v += acc*dt*0.5;
    vec3 xprev = x;
    x += v*dt;
    float r2 = length(x);
    acc = -1.5*h2*x/pow(r2, 5.0);
    v += acc*dt*0.5;
    v = normalize(v);
    float s2 = dot(x, n);
    if(uDisc > 0.5 && side*s2 < 0.0){
      // crossed the disc's plane between the two points: where, and is it on the sheet
      float f = side/(side - s2);
      vec3 xc = mix(xprev, x, f);
      float rc = length(xc);
      if(rc >= 3.0 && rc <= uDiscOut){
        // orbital velocity of the gas, in c: sqrt(r_s/2r); its direction round the normal
        vec3 tang = normalize(cross(n, xc))*uSpin;
        float vk = sqrt(0.5/rc);
        // the photon is marching AWAY from the eye, so the direction to the eye is −v
        float cosang = dot(tang, -v);
        float gam = 1.0/sqrt(max(1.0 - vk*vk, 1e-4));
        float dop = 1.0/(gam*(1.0 - vk*cosang));       // Doppler factor
        float gz = sqrt(max(1.0 - 1.0/rc, 0.0));        // gravitational redshift
        float g = dop*gz;
        float temp = pow(3.0/rc, 0.75);                 // T ∝ r^(-3/4), 1 at the ISCO
        float flux = pow(3.0/rc, 1.7);                  // the thin sheet's emission falls off outward
        float tex = sheet(xc, n, rc, uTime);
        float edge = smoothstep(3.0, 3.25, rc)*(1.0 - smoothstep(uDiscOut*0.8, uDiscOut, rc));
        float bright = pow(g, 3.0)*flux*tex*edge;
        col = thermal(clamp(temp*g*0.8, 0.0, 1.0))*bright*2.4;
        a = clamp(bright*2.2, 0.0, 1.0);
        done = true; break;
      }
    }
    side = s2;
  }
  // A ray that has spent every step circling the photon sphere without leaving is part of the
  // shadow's rim — its impact parameter sits within a hair of the critical one — and one
  // that grazed the sphere and escaped is blended toward the shadow by how close it came,
  // which softens the rim against the pixel grid.
  if(!done && r < 3.0){ col = vec3(0.0); a = 1.0; done = true; }
  if(!done && rmin < 1.12){ float k = smoothstep(1.12, 1.0, rmin); col *= 1.0 - k; a = max(a, k); }
  if(!done && uDisc < 0.5){
    // no flow to light it: what a real one shows against the sky is the sky itself, bent
    // into a ring at the photon sphere — hinted at, faintly, as a mean skylight
    float b = sqrt(b2);
    float ring = exp(-pow((b - 2.6)/0.3, 2.0))*0.4 + exp(-pow((b - 3.6)/1.8, 2.0))*0.05;
    col = vec3(0.55,0.62,0.75)*ring; a = ring*0.9;
  }
  o = vec4(col*uFade, a*uFade);
}
