/* ============================================================================
   HORDE — WebGL2 renderer
   ----------------------------------------------------------------------------
   const R = BV.createRenderer(canvas, net, opts)   // throws without WebGL2
   R.resize(cssW, cssH, dpr)   R.render(frame)   R.setQuality({scale, dof, fgCells, debug})
   R.stats() → {gpuMs?, drawCalls, instances, fgCells, scale, listEntries, maxList}   R.destroy()
   extras: R.setNet(net) (new map, same canvas), R.measure(frame, w?, h?) → per-pixel Bézier work
   (debug read-back), R.gl. debug views: 1 work counters, 2 field (N / arc / wall), 3 grid + evals,
   4 lumen-edge check (r: physics lumen drawn as wall, depth / wall thickness × 2; g: wall drawn as
   lumen, / wall thickness; b: physics lumen). opts.bpm: heart rate for times frame.pulse has not
   covered yet (default 66, as the simulation).

   Per frame:
   1. WORLD  one full-screen pass (optionally at a reduced resolution, then
             upsampled). Per pixel: world position → bin-grid cell → that
             cell's Bézier list → per chain the closest point on each quadratic
             Bézier (the analytic cubic solve of net.js evalAt, plus a Newton
             polish and a straight-span fallback that are safe in fp32) →
             n_c = (|p − B(t*)| − r(t*)) / r(t*) → exp smooth union across chains
             (k = CONST.K_SMIN) with blended radius / gradient / flow / oxy /
             kind. The two heaviest chains keep their own arc length s and
             signed lateral offset, so arc-based textures are evaluated per
             chain and cross-faded, never blended as coordinates.
             WOBBLE: the merged field N is offset before shading, so the wall
             band, lining, cut edge, contact shadow and tissue berm move
             together: (a) a slow undulation travelling along each vessel (arc
             in local radii, own phase per chain, different on its two sides,
             from the two heaviest chains only), (b) the arterial pulse wave:
             the wall's low-passed response to frame.pulse (recorded per
             frame, BV.heart before that), delayed by the pressure drop from
             the inlet (net.js chain.P / bezier.p0,p2), so arteries near the
             heart dilate first (~5.8 % of r), connectors a little, veins
             barely. The lumen scales about the axis; the rendered lumen edge
             only moves outward of the physics lumen (N < −wall), or inward by
             at most 0.1 of the wall thickness (debug view 4 measures it).
             Shading: wet tissue (lobules, flesh bumps, fibres along vessels,
             raised lit berms, contact shadow, deep pockets), the cut-open
             vessel (a thick muscular rim: pillow-profiled media with wavy
             muscle layers, bright lining, a lamina groove, and an adventitia
             coat drawn over the tissue just outside the wall; a half-pipe lumen
             seen through luminous plasma: folded fibrous far wall lit from the
             top-left and fogged toward the deep axis, the rim's shadow on the
             floor, endothelial mosaic, advected plasma streaks and blood
             clouds with a parabolic profile, drifting bokeh specks, red-cell
             haze), and the glossy raised-tube look used when a vessel is only a
             few dozen px wide, throbbing as the pulse wave passes. Every
             texture fades by pixel footprint.
   2. RBC    instanced biconcave impostors, far → near (bucket-sorted by depth),
             tumble, a gentle parachute flex (own beat per cell), glossy torus
             rim + crisp specular + subsurface edge glow, depth of field, × rbcLOD.
   3. UNITS  instanced, in five sweeps over the same buffer: soft shadows →
             infection sites → selection rings → cells / pathogens / antibodies → FX
             (rings under all bodies, so a packed selected horde is outlined, not meshed).
   4. FG     optional sparse big soft out-of-focus red cells in front, faded out
             around units so they never cover a face.

   Instance fields as the renderer reads them (HORDE_SPEC layouts; extras as sim.js packs them):
     RBC  (8)  x y r depth(0 near…1 far) angle(travel) tumble(0 face-on…1 edge-on) oxy alpha
               drawn × rbcLOD; depth → size, blur (DOF), sink toward plasma; the nearest band
               (depth ≲ 0.06) is cross-faded into the big blurred foreground layer.
     UNIT (16) x y r type angle phase flags hp lookX lookY stretch tint e0 e1 e2 e3
       common  flags 1 selected (cyan ring; pathogens: red ring), 2 eating ("O" mouth), 4 hit
               flash, 8 dying (fades by e0 = fade-out progress 0…1), 16 adhered (tighter,
               darker shadow), 32 hovered (white ring); e3 = fade-in alpha 0…1 (spawn).
               e0 without flag 8 = WBC jiggle amplitude 0…1 (a decaying impulse from the sim).
               Min on-screen radius: WBC 2.5 css px, pathogens 2, sites 9; icon below ~9 px,
               faces above ~13–19 px (WBC) / ~9–14 px (pathogens).
       0 WBC   soft body: angle heading, stretch 0.85…1.35 along it (> 1 elongates, < 1
               squashes; volume-preserving), e0 jiggle → fast quadrupole wobble + scale
               bounce whose amplitude follows it, the nucleus and granules slosh behind
               the membrane, the face (never deformed) bobs; e2 swim activity (pseudopod),
               e1 prey being digested (0 none, 1 virus, 2 bacterium) shrinking with hp,
               look → eyes, tint → nucleus orientation / granules, phase → ripples, blink.
       1 virus angle = spin of the spikes; the capsid pulses, every spike waggles and
               throbs on its own beat; look → eyes; face stays upright.
       2 bact. r = rod half-width, stretch = half-length / r (2.2…3), angle body axis,
               e1 division progress (waist pinches); the rod flexes (banana bend + a wave
               down its length), flagella undulate from the flexing tail.
       3 site  angle wall tangent, stretch elongates along it, hp → HP ring, e2 emission
               pulse; the lesion breathes and its pus dome bulges on every throb.
       4 antibody Y along angle.   5 FX burst: hp life 1 → 0, tint < .33 cyan / < .66 green / orange.
     frame.marks is not drawn here (main.js draws overlays on its 2D canvas).

   Per-list acceleration data built here (the net.js payload is used as is):
   a second list texture, parallel to net.gpu.listData, holds for every entry
   the Bézier's bounding circle and max radius, and flags the first entry of
   each chain group; inside a cell the chain groups and the Béziers within a
   group are re-ordered nearest-first (the per-chain min and the smooth union
   are order independent), so most entries are rejected by one fetch and a
   distance test. A vessel's field is faded out smoothly at its shading reach
   (BV.vesselReach), which makes the result independent of how far a cell's
   list happens to extend — no seams at grid-cell borders.
   ========================================================================== */
(function(){
'use strict';
const BV = window.BV = window.BV || {};

// ---------------------------------------------------------------------------
//  GLSL: shared helpers
// ---------------------------------------------------------------------------
const GLSL_COMMON = `
const vec3 LDIR = vec3(-0.4859, -0.6027, 0.6329);   // light from the top-left (x right, y down, z to viewer)
const vec3 HDIR = vec3(-0.2649, -0.3285, 0.9066);   // half vector with the view (0,0,1)
const vec2 SDIR = vec2(0.6275, 0.7786);             // shadows fall toward the bottom-right
uint hsh(uint x){ x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }
// one integer-hash round on a combined key (the noise hot path: 4 per value-noise sample)
float h21(ivec2 i){ uvec2 u = uvec2(i + 262144); return float(hsh(u.x*1597334677u ^ u.y*3812015801u) >> 8)*(1.0/16777215.0); }
vec2 h22(ivec2 i){ uvec2 u = uvec2(i + 262144); uint a = hsh(u.x*1597334677u ^ u.y*3812015801u); uint b = hsh(a ^ 0x68bc21ebu);
  return vec2(float(a >> 8), float(b >> 8))*(1.0/16777215.0); }
float vnoise(vec2 x){
  vec2 i = floor(x), f = x - i; vec2 u = f*f*(3.0 - 2.0*f); ivec2 k = ivec2(i);
  return mix(mix(h21(k), h21(k + ivec2(1,0)), u.x), mix(h21(k + ivec2(0,1)), h21(k + ivec2(1,1)), u.x), u.y);
}
// value noise in [-1,1] with its analytic gradient (quintic fade)
vec3 vnoised(vec2 x){
  vec2 i = floor(x), f = x - i; ivec2 k = ivec2(i);
  vec2 u = f*f*f*(f*(f*6.0 - 15.0) + 10.0), du = 30.0*f*f*(f*(f - 2.0) + 1.0);
  float a = h21(k), b = h21(k + ivec2(1,0)), c = h21(k + ivec2(0,1)), d = h21(k + ivec2(1,1));
  float k1 = b - a, k2 = c - a, k4 = a - b - c + d;
  return vec3(2.0*(a + k1*u.x + k2*u.y + k4*u.x*u.y) - 1.0, 2.0*du*vec2(k1 + k4*u.y, k2 + k4*u.x));
}
// Voronoi: F1, F2 (cell units), vectors to the two nearest feature points, id of the nearest
void voronoi(vec2 x, out float F1, out float F2, out vec2 v1, out vec2 v2, out float id){
  vec2 n = floor(x), f = x - n; ivec2 kn = ivec2(n);
  F1 = 64.0; F2 = 64.0; v1 = vec2(1.0); v2 = vec2(1.0); id = 0.0;
  for(int j = -1; j <= 1; j++) for(int i = -1; i <= 1; i++){
    ivec2 c = kn + ivec2(i, j);
    vec2 o = vec2(i, j) + 0.12 + 0.76*h22(c) - f;
    float d = dot(o, o);
    if(d < F1){ F2 = F1; v2 = v1; F1 = d; v1 = o; id = h21(c + ivec2(71, 13)); }
    else if(d < F2){ F2 = d; v2 = o; }
  }
  F1 = sqrt(F1); F2 = sqrt(F2);
}
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0); return length(pa - ba*h); }
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b - a)/k, 0.0, 1.0); return mix(b, a, h) - k*h*(1.0 - h); }
vec4 over(vec4 top, vec4 bot){ return top + bot*(1.0 - top.a); }
vec4 pm(vec3 c, float a){ return vec4(c*a, a); }
float fill(float sd, float aw){ return 1.0 - smoothstep(-aw, aw, sd); }
vec2 rot(vec2 p, float a){ float c = cos(a), s = sin(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
`;

// ---------------------------------------------------------------------------
//  WORLD pass
// ---------------------------------------------------------------------------
const WORLD_VS = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p*2.0 - 1.0, 0.0, 1.0); }`;

const WORLD_FS = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
#define MAXL __MAXL__
#define SEGW __SEGW__
#define LISTW __LISTW__
#define PTN __PTN__
const float K = __K__;
const vec3 WALLS = vec3(__W0__, __W1__, __W2__);
const float CUT = 3.1;          // chains whose lower bound is this far above the best so far weigh < 2^-14
const float NFAR = 6.0;
uniform sampler2D uSeg, uCell, uList, uLidx, uSegX;
uniform ivec2 uGridN; uniform vec2 uGridO; uniform float uCellSize;
uniform vec2 uCam, uRes, uPPU;      // world centre, pass size (px), pass px per µm
uniform float uZ, uTime, uPulse, uLOD, uTauP;
uniform vec2 uWave;                 // pulse wave: (1 / (1 − p at the arterial ends), table steps per unit of wave delay)
uniform float uPT[PTN];             // wall dilation response (0..1) at wave delays 0 … 1.6 (in units of PT_DELAY s)
uniform vec4 uBounds;
uniform int uDebug;
out vec4 outColor;
${GLSL_COMMON}

// ---- field evaluation state -------------------------------------------------
float gAcc, gR, gO, gK, gProx, gBest; vec2 gG, gF, gGN;
float wS0, wS1, wS2; vec4 sA0, sA1, sB0, sB1;      // top-2 chains: (s, lat, r, v), (tan.x, tan.y, kind, oxy)
vec2 sC0, sC1;                                     // top-2 chains: (Bézier index, t*) — wobble data is fetched for these only
float cN, cNr, cT, cR, cDist, cFade; int cIdx; vec2 cQ, cTan;
int nFull, nVisit;

float wallOf(float k){ return k <= 1.0 ? mix(WALLS.x, WALLS.y, k) : mix(WALLS.y, WALLS.z, k - 1.0); }

float newtonT(float t, vec2 a, vec2 b, vec2 d){
  vec2 q = d + (2.0*a + b*t)*t, dq = 2.0*(a + b*t);
  float f = dot(q, dq), fp = dot(dq, dq) + 2.0*dot(q, b);
  return fp > 1e-9 ? clamp(t - f/fp, 0.0, 1.0) : t;
}
// closest-point parameter on B(t) = A + 2a t + b t² (d = A − p): the cubic solve of net.js,
// Newton-polished; nearly straight spans (where the cubic loses fp32 precision) use the chord
// projection + two Newton steps on the true curve.
float bezT(vec2 a, vec2 b, vec2 d, vec2 ch){
  float ch2 = dot(ch, ch), bb = dot(b, b), t;
  if(bb < 1e-4*ch2 || bb < 1e-6){
    t = ch2 > 0.0 ? clamp(-dot(d, ch)/ch2, 0.0, 1.0) : 0.0;
    return newtonT(newtonT(t, a, b, d), a, b, d);
  }
  float kk = 1.0/bb;
  float kx = kk*dot(a, b);
  float ky = kk*(2.0*dot(a, a) + dot(d, b))/3.0;
  float kz = kk*dot(d, a);
  float pp = ky - kx*kx, p3 = pp*pp*pp;
  float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
  float h = q*q + 4.0*p3;
  if(h >= 0.0){
    float hs = sqrt(h);
    vec2 x = (vec2(hs, -hs) - q)*0.5;
    vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
    t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
  } else {
    float z = sqrt(-pp);
    float v = acos(clamp(q/(pp*z*2.0), -1.0, 1.0))/3.0;
    float m = cos(v), n = sin(v)*1.732050808;
    float t1 = clamp((m + m)*z - kx, 0.0, 1.0), t2 = clamp((-n - m)*z - kx, 0.0, 1.0);
    vec2 q1 = d + (2.0*a + b*t1)*t1, q2 = d + (2.0*a + b*t2)*t2;
    t = dot(q1, q1) < dot(q2, q2) ? t1 : t2;
  }
  return newtonT(t, a, b, d);
}

void evalBez(vec2 p, int bi){
  int i4 = bi*4; ivec2 tc = ivec2(i4 % SEGW, i4 / SEGW);
  vec4 T0 = texelFetch(uSeg, tc, 0), T1 = texelFetch(uSeg, tc + ivec2(1, 0), 0);
  vec2 A = T0.xy, a = T0.zw - A, b = A - 2.0*T0.zw + T1.xy, d = A - p;
  float t = bezT(a, b, d, T1.xy - A);
  vec2 q = A + (2.0*a + b*t)*t;
  float dist = length(p - q);
  float r = mix(T1.z, T1.w, t);
  float n = (dist - r)/r;
  float reach = 0.6*r + 160.0;
  float fade = 1.0 - smoothstep(0.7*reach, reach, dist - r);
  nFull++;
  if(fade <= 0.0) return;
  float nf = n - K*log2(fade);           // faded contribution: w = 2^(−n/k)·fade
  if(nf < cN){
    cN = nf; cNr = n; cFade = fade; cIdx = bi; cT = t; cQ = q; cDist = dist; cR = r;
    vec2 tg = a + b*t; float tl = length(tg);
    cTan = tl > 1e-6 ? tg/tl : vec2(1.0, 0.0);
  }
}

void flushChain(vec2 p){
  if(cIdx < 0) return;
  int i4 = cIdx*4; ivec2 tc = ivec2(i4 % SEGW, i4 / SEGW);
  vec4 T2 = texelFetch(uSeg, tc + ivec2(2, 0), 0), T3 = texelFetch(uSeg, tc + ivec2(3, 0), 0);
  float t = cT;
  float kq0 = floor((T2.w + 0.5)/16.0), kq2 = T2.w - 16.0*kq0;
  float kind = mix(kq0, kq2, t)*0.25;
  float oxy = mix(T3.x, T3.y, t), v = mix(T3.z, T3.w, t);
  float w = exp2(-cN/K);
  vec2 nr = vec2(-cTan.y, cTan.x);
  vec2 g = cDist > 1e-3 ? (p - cQ)/cDist : nr;
  gAcc += w; gR += w*cR; gG += w*g; gF += w*cTan*v; gO += w*oxy; gK += w*kind; gGN += w*g/cR;
  gProx += cFade*exp2(-max(cNr*cR, 0.0)/(0.12*cR + 45.0));
  // arc position extrapolated along the tangent: exact for an interior t*, continuous across the
  // end caps (where a tapering chain's thicker cap wins over the next span and t* sticks at 0/1)
  vec4 A = vec4(mix(T2.x, T2.y, t) + dot(p - cQ, cTan), dot(p - cQ, nr), cR, v), B = vec4(cTan, kind, oxy);
  vec2 C = vec2(float(cIdx), t);
  if(w > wS0){ wS2 = wS1; wS1 = wS0; sA1 = sA0; sB1 = sB0; sC1 = sC0; wS0 = w; sA0 = A; sB0 = B; sC0 = C; }
  else if(w > wS1){ wS2 = wS1; wS1 = w; sA1 = A; sB1 = B; sC1 = C; }
  else wS2 = max(wS2, w);
  gBest = min(gBest, cN);
}

void evalField(vec2 p){
  gAcc = 0.0; gR = 0.0; gO = 0.0; gK = 0.0; gProx = 0.0; gBest = 1e9; gG = vec2(0.0); gF = vec2(0.0); gGN = vec2(0.0);
  wS0 = 0.0; wS1 = 0.0; wS2 = 0.0; sA0 = vec4(0.0); sA1 = vec4(0.0); sB0 = vec4(1.0, 0.0, 0.0, 0.5); sB1 = sB0; sC0 = vec2(0.0); sC1 = sC0;
  cIdx = -1; cN = 1e9; nFull = 0; nVisit = 0;
  ivec2 gi = ivec2(floor((p - uGridO)/uCellSize));
  if(gi.x < 0 || gi.y < 0 || gi.x >= uGridN.x || gi.y >= uGridN.y) return;
  vec2 cd = texelFetch(uCell, gi, 0).rg;
  int off = int(cd.x + 0.5), cnt = int(cd.y + 0.5);
  for(int i = 0; i < MAXL; i++){
    if(i >= cnt) break;
    int e = off + i; ivec2 lc = ivec2(e % LISTW, e / LISTW);
    vec4 L = texelFetch(uList, lc, 0);       // bounding circle (x, y, R), ±rmax (− = first of a chain)
    nVisit++;
    if(L.w < 0.0){ flushChain(p); cIdx = -1; cN = 1e9; }
    float rmax = abs(L.w);
    float dlow = max(length(p - L.xy) - L.z, 0.0);
    if(dlow >= 1.6*rmax + 160.0) continue;                       // beyond the reach for any radius
    float nlow = dlow/rmax - 1.0;
    if(nlow >= cN || nlow > min(gBest, cN) + CUT) continue;      // cannot win / cannot matter
    evalBez(p, int(texelFetch(uLidx, lc, 0).r + 0.5));
  }
  flushChain(p);
}

// ---- textures in chain coordinates -----------------------------------------
float tauOf(float kind){      // flow clock incl. the pulse surge (arteries surge most)
  vec2 c = kind <= 1.0 ? mix(vec2(0.72, 0.56), vec2(0.9, 0.2), kind) : mix(vec2(0.9, 0.2), vec2(0.96, 0.08), kind - 1.0);
  return c.x*uTime + c.y*uTauP;
}
float streakSet(float s, float lat, float rl, float v, float tau, float W, float L, float off){
  float xl = lat/W + off, li = floor(xl), fx = xl - li;
  float ac = clamp((li + 0.5 - off)*W/rl, -1.0, 1.0);
  float sp = v*1.6*(1.0 - ac*ac);                 // Poiseuille lane speed
  float n = vnoise(vec2((s - sp*tau)/L, li + off*200.0));
  float pr = sin(3.14159*fx);
  return (2.0*n - 1.0)*pr*pr;
}
vec2 hazeLayer(float s, float lat, float rl, float v, float tau, float fp, float lay){
  const float W = 8.6, SP = 10.5;
  float xl = lat/W + 0.5*lay, li = floor(xl), fx = xl - li;
  float ac = clamp((li + 0.5 - 0.5*lay)*W/rl, -1.0, 1.0);
  float sp = v*1.6*(1.0 - ac*ac)*(1.0 - 0.25*lay);
  int ili = int(li);
  float sx = (s - sp*tau)/SP + h21(ivec2(ili, 91 + int(lay)*17))*37.0;
  float si = floor(sx), fs = sx - si;
  ivec2 id = ivec2(int(si), ili*3 + int(lay)*7919);
  float hA = h21(id), hB = h21(id + ivec2(5003, 71));
  vec2 c = vec2(0.5 + (hB - 0.5)*0.3, 0.5 + (hA - 0.5)*0.24);
  vec2 d = vec2((fs - c.x)*SP*mix(1.0, 1.9, hB*hB), (fx - c.y)*W);   // some cells seen edge-on
  float rr = 3.6*(0.92 + 0.16*hA);
  float dd = length(d), aa = max(fp, 0.35);
  float cov = step(0.42, hA)*(1.0 - smoothstep(rr - aa, rr + aa, dd));
  float sh = 0.78 + 0.32*smoothstep(0.25*rr, 0.8*rr, dd) - 0.12*smoothstep(0.8*rr, rr, dd) - 0.1*(d.x + d.y)/rr;
  return vec2(cov, sh);
}
// T = (fold height −1..1, mosaic −1..1, streak −1..1, wall fibre −1..1)
// G = (fold gradient in world xy (1/µm·relief), fibre slope across the band, blood density −1..1)
// H = haze (coverage, shade)
// F = far-wall fibres (height −1..0.6, world gradient xy per µm), E = (unused, bokeh 0..1)
void slotTex(vec4 A, vec4 B, float fp, float am, bool lumen, bool band, out vec4 T, out vec4 G, out vec2 H, out vec3 F, out vec2 E){
  float s = A.x, lat = A.y, r = A.z, v = A.w, kind = B.z;
  vec2 tg = B.xy, nr = vec2(-B.y, B.x);
  float rl = r*(1.0 - wallOf(kind));
  float ppu = 1.0/fp;
  T = vec4(0.0); G = vec4(0.0); H = vec2(0.46, 0.92); F = vec3(0.0); E = vec2(0.0);
  if(lumen){
    // am: merged lumen coordinate (0 axis … 1 lumen edge), continuous across chains; drives the
    // foreshortening used for footprint fades. val: this chain's own lumen actually covers the pixel
    // (it does not in union fillets or where a side branch's end cap pokes into its parent) —
    // outside it, chain-space textures would smear into straight stripes, so they fade out.
    float x = clamp(lat/rl, -0.995, 0.995), cl = sqrt(1.0 - x*x), la = rl*asin(x);
    float comp = sqrt(max(1.0 - am*am, 0.0)) + 0.02;
    float val = 1.0 - smoothstep(0.9, 1.04, abs(lat)/rl);
    // folds of the far inner wall, elongated along the flow (foreshortened toward the sides)
    float fF = smoothstep(2.5, 7.0, 30.0*ppu*comp), fF2 = smoothstep(4.0, 10.0, 12.0*ppu*comp);
    vec3 f1 = vnoised(vec2(s/170.0, la/34.0)), f2 = vnoised(vec2(s/66.0, la/13.0) + 5.3);
    fF *= val; fF2 *= val;
    T.x = 0.75*f1.x*fF + 0.25*f2.x*fF2;
    vec2 dsl = vec2(0.75*fF*f1.y/170.0 + 0.25*fF2*f2.y/66.0, (0.75*fF*f1.z/34.0 + 0.2*fF2*f2.z/13.0)/max(cl, 0.2));
    G.xy = (dsl.x*tg + dsl.y*nr)*10.0;
    // fibrous far wall: fine wavy ridges running with the flow (rounded ridges of stretched noise),
    // faded in only once resolved (foreshortened toward the sides of the half-pipe)
    float fb1 = smoothstep(3.0, 8.0, 3.4*ppu*comp)*val;
    if(fb1 > 0.0){
      float wq = sin(s/97.0 + 2.1*sin(la/31.0 + s/260.0));                        // the fibres meander
      vec3 r1 = vnoised(vec2(s/60.0, la/3.4 + 2.4*wq) + 17.0);
      F.x = fb1*(0.6 - 1.6*r1.x*r1.x);
      vec2 dF = -fb1*3.2*r1.x*r1.yz*vec2(1.0/60.0, 1.0/(3.4*max(cl, 0.2)));
      F.yz = dF.x*tg + dF.y*nr;
    }
    // endothelial mosaic: flat cells stretched along the flow with a bulging nucleus (faint)
    float mF = smoothstep(3.0, 8.0, 10.0*ppu*comp)*val;
    if(mF > 0.0){
      vec2 mq = vec2(s/40.0, la/11.0); float row = floor(mq.y); mq.x += 0.5*mod(row, 2.0) + 0.3*sin(row*1.7);
      vec2 cell = floor(mq), cf = fract(mq) - 0.5; float id = h21(ivec2(cell) + ivec2(3, 9));
      vec2 be = abs(cf)*vec2(40.0, 11.0) - vec2(18.5, 4.6);                        // rounded cell border (µm)
      float edge = length(max(be, 0.0)) + min(max(be.x, be.y), 0.0);
      float nuc = length((cf - vec2(0.1*(id - 0.5), 0.0))*vec2(40.0/9.0, 11.0/3.0)) - 1.0;
      T.y = mF*(0.55*(1.0 - smoothstep(-0.2, 0.3, nuc)) - 0.45*smoothstep(-1.4, 0.2, edge) + 0.35*(id - 0.5));
    }
    // advected plasma streaks (two lane scales, two staggered lane sets each)
    float tau = tauOf(kind);
    float sf = smoothstep(2.0, 6.0, 5.0*ppu)*val, sc = smoothstep(4.0, 14.0, 26.0*ppu)*val;
    if(sf > 0.0) T.z += sf*0.5*(streakSet(s, lat, rl, v, tau, 5.0, 46.0, 0.0) + streakSet(s, lat, rl, v, tau, 5.0, 46.0, 0.5));
    if(sc > 0.0) T.z += sc*0.5*(streakSet(s, lat, rl, v, tau, 26.0, 240.0, 0.0) + streakSet(s, lat, rl, v, tau, 26.0, 240.0, 0.5));
    // coarse blood-density clouds drifting with the flow (reads at mid zoom)
    float gq = (s - v*1.1*tau)/170.0;
    G.w = (2.0*vnoise(vec2(gq, la/38.0 + 0.35*sin(1.7*gq)) + 2.2) - 1.0)*smoothstep(4.0, 12.0, 38.0*ppu*comp)*val;
    // out-of-focus specks drifting in front of the far wall (bokeh), only when big on screen
    float bkF = smoothstep(5.0, 10.0, 4.0*ppu)*val;
    if(bkF > 0.0){
      vec2 bq = vec2((s - v*0.9*tau)/38.0, la/38.0);
      ivec2 bi = ivec2(floor(bq)); vec2 bf = fract(bq);
      vec2 bc = 0.25 + 0.5*h22(bi + ivec2(301, 17));
      float br = 0.07 + 0.09*h21(bi + ivec2(7, 401));
      float bd = length(bf - bc)/br;
      E.y = bkF*step(0.8, h21(bi + ivec2(55, 9)))*(1.0 - smoothstep(0.55, 1.0, bd))*(0.75 + 0.25*smoothstep(0.5, 0.9, bd));
    }
    // red-cell haze (procedural suspension below the zoom where particles are drawn)
    float hc = smoothstep(3.0, 7.0, 7.4*ppu)*val;           // cell-sized blobs only once they are ~5+ px
    if(uLOD < 1.0 && hc > 0.0){
      vec2 a0 = hazeLayer(s, lat, rl, v, tau, fp, 0.0), a1 = hazeLayer(s, lat, rl, v, tau, fp, 1.0);
      float cov = 1.0 - (1.0 - a0.x)*(1.0 - 0.8*a1.x);
      float sh = a0.x > 0.01 ? mix(a1.y*0.8, a0.y, a0.x) : a1.y*0.8;
      H = mix(H, vec2(cov, sh), hc);
    }
  }
  if(band){
    // wavy muscle fibres (three octaves), faded in only once each is resolved
    float dm = abs(lat) - rl;
    float bF = smoothstep(3.0, 8.0, 2.6*ppu), bM = smoothstep(3.0, 8.0, 6.0*ppu), bC = smoothstep(3.0, 9.0, 14.0*ppu);
    float wv = dm + 3.0*sin(s/37.0 + 0.8*sin(s/91.0));
    vec3 b1 = vnoised(vec2(s/70.0, wv/2.6)), b2 = vnoised(vec2(s/140.0, wv/6.0) + 7.0), b3 = vnoised(vec2(s/300.0, dm/14.0) + 11.0);
    T.w = 0.3*bF*b1.x + 0.3*bM*b2.x + 0.3*bC*b3.x;
    G.z = (0.3*bF*b1.z/2.6 + 0.3*bM*b2.z/6.0 + 0.25*bC*b3.z/14.0)*1.4;
    // coarse muscle bundles, a few across the wall (read at mid zoom)
    float bW = 0.045*r + 4.0, bK = smoothstep(3.0, 9.0, bW*ppu);
    if(bK > 0.0){                                                                    // wavy muscle layers
      float lay = 6.2831853*(dm/bW + 0.3*sin(s/(4.0*bW) + 1.3*sin(s/(11.0*bW))) + 0.2*sin(s/(1.7*bW) + dm/bW));
      float sl = sin(lay);
      T.w += bK*0.45*sl; G.z += bK*0.45*6.2831853*cos(lay)/bW*1.2;
    }
    // smooth-muscle nuclei: small elongated light spots in the wall (only when resolved)
    float nF = smoothstep(3.0, 7.0, 1.6*ppu);
    if(nF > 0.0 && dm > -2.0){
      vec2 mq = vec2(s/22.0, wv/5.0); vec2 mi = floor(mq); vec2 mh = h22(ivec2(mi) + ivec2(17, 3));
      vec2 md = (fract(mq) - 0.25 - 0.5*mh)*vec2(22.0/5.0, 5.0/1.1);
      T.w += nF*0.35*step(0.5, h21(ivec2(mi) + 11))*(1.0 - smoothstep(0.5, 1.0, length(md)));
    }
  }
}

// ---- looks ------------------------------------------------------------------
vec3 tissue(vec2 p, float dW, vec2 g, float rB, float fp){
  float ppu = 1.0/fp;
  vec2 gh = vec2(0.0);
  // domain-warped flesh: big soft lobes, medium bumps, wet micro-relief
  vec2 wq = p/1100.0;
  vec2 pw = p + (vec2(vnoise(wq), vnoise(wq + 7.7)) - 0.5)*650.0;
  float fA = smoothstep(1.0, 4.0, 600.0*ppu), fB = smoothstep(8.0, 26.0, 170.0*ppu), fC = smoothstep(10.0, 24.0, 45.0*ppu);
  vec3 n1 = vnoised(pw/600.0);            gh += n1.yz*(70.0/600.0)*fA;
  vec2 ghF = vec2(0.0);
  if(fB > 0.0){ vec3 n2 = vnoised(pw/170.0 + 3.1); gh += n2.yz*(22.0/170.0)*fB; }
  if(fC > 0.0){ vec3 n3 = vnoised(pw/45.0 + 9.4); ghF = n3.yz*(2.6/45.0)*fC; }
  // strands: ridged, meandering with the warp
  float fR = smoothstep(8.0, 20.0, 60.0*ppu), strand = 0.0;
  if(fR > 0.0){
    vec3 r1 = vnoised(pw/210.0 + 1.3);
    strand = pow(1.0 - abs(r1.x), 2.0)*fR;
    gh -= sign(r1.x)*r1.yz/210.0*4.0*fR*(1.0 - abs(r1.x));
  }
  // packed tissue cells when zoomed in: soft rounded cells, nuclei, faint gaps
  float fine = smoothstep(3.0, 8.0, 20.0*ppu), cellG = 0.0, cellN = 0.0;
  if(fine > 0.0){
    float G1, G2, gid; vec2 u1, u2;
    voronoi(pw/20.0 + 3.7, G1, G2, u1, u2, gid);
    cellG = fine*(1.0 - smoothstep(0.0, 0.35, G2 - G1))*(0.6 + 0.4*gid);
    cellN = fine*(1.0 - smoothstep(0.1, 0.2, G1))*step(0.35, gid);
    ghF += fine*(u1/max(G1, 1e-3))*(1.0 - smoothstep(0.0, 0.5, G1))*0.1;
  }
  // fibres wrapped along the nearest vessels (chain coordinates of the two heaviest chains)
  float fib = 0.0, fF = smoothstep(4.0, 10.0, 16.0*ppu);
  if(fF > 0.0 && wS0 > 0.0){
    float f0 = 1.0 - abs(2.0*vnoise(vec2(sA0.x/190.0, abs(sA0.y)/16.0)) - 1.0);
    float e0 = wS0 - wS2, e1 = wS1 - wS2;
    float f1 = e1 > 0.02*e0 ? 1.0 - abs(2.0*vnoise(vec2(sA1.x/190.0, abs(sA1.y)/16.0)) - 1.0) : f0;
    fib = fF*mix(f0, f1, smoothstep(0.25, 0.75, e1/max(e0 + e1, 1e-20)))*exp(-dW/(0.35*rB + 90.0));
    fib = fib*fib;
  }
  // raised berm along the vessels (lit on the side facing the light)
  float wb = 0.2*rB + 22.0, xb = dW/wb, eb = exp(-xb*xb);
  gh += g*(-0.8*xb*eb);
  vec3 nrm0 = normalize(vec3(-gh, 1.0));
  vec3 nrm = normalize(vec3(-gh - ghF, 1.0));
  float dif = max(dot(nrm, LDIR), 0.0);
  vec3 base = vec3(0.44, 0.13, 0.145)*(0.9 + 0.2*n1.x);
  base = mix(base, vec3(0.50, 0.18, 0.19), 0.16*strand + 0.3*fib);
  base *= (1.0 - 0.10*cellG + 0.05*cellN)*(1.0 + fine*0.08*(h21(ivec2(floor(pw/20.0 + 3.7)) + 5) - 0.5));
  base = mix(base, vec3(0.50, 0.19, 0.20), 0.3*eb);
  vec3 c = base*(0.34 + 0.84*dif);
  c += vec3(0.95, 0.62, 0.6)*pow(max(dot(nrm0, HDIR), 0.0), 40.0)*0.14*(0.5 + 0.5*fB);   // wet sheen
  // deep pockets away from the vessels (complete well inside the shading reach)
  c *= mix(0.56, 1.0, smoothstep(0.0, 0.75, gProx));
  float ao = exp(-dW/(0.05*rB + 7.0));
  float sh = exp(-dW/(0.26*rB + 18.0))*smoothstep(-0.35, 0.85, dot(g, SDIR));
  c *= (1.0 - 0.36*ao)*(1.0 - 0.55*sh);
  return c;
}

vec3 tubeLook(float N, vec2 g, float oxy, float Dcss, float pl){
  float ao = clamp(1.0 + N, 0.0, 1.0), hz = sqrt(max(1.0 - ao*ao, 0.0));
  vec3 n = normalize(vec3(g*ao, hz + 0.02));
  vec3 base = mix(vec3(0.40, 0.06, 0.17), vec3(0.84, 0.09, 0.11), oxy);
  float dif = max(dot(n, LDIR), 0.0);
  float sp = pow(max(dot(n, HDIR), 0.0), mix(6.0, 38.0, smoothstep(4.0, 30.0, Dcss)));
  vec3 c = base*(0.30 + 0.9*dif);
  c += vec3(1.0, 0.72, 0.72)*sp*mix(0.25, 0.5, smoothstep(4.0, 20.0, Dcss));
  c *= 1.0 - 0.4*pow(ao, 5.0);
  c *= 1.0 + 0.3*pl;                                                   // the pulse wave: a throb running down the tree
  c += vec3(0.5, 0.06, 0.05)*pl*0.35*(1.0 - ao*ao);
  return c;
}

// cut-open vessel. N: field (0 at the wall's outer physics edge); adv: the adventitia, an outer
// layer drawn over the tissue beyond N = 0 (thick on arteries), so the rim reads muscular.
vec3 cutLook(float N, float rB, vec2 g, float oxy, float kind, float wall, float adv, float fp, float aaN, float gN, float pl){
  vec4 T, T1, G, G1; vec2 Hz, H1, E, E1; vec3 F, F1;
  float inL = 1.0 - smoothstep(-aaN, aaN, N + wall);
  bool needL = inL > 0.0, needB = inL < 1.0;
  float a = clamp((1.0 + N)/(1.0 - wall), 0.0, 1.0);
  slotTex(sA0, sB0, fp, a, needL, needB, T, G, Hz, F, E);
  float e0 = wS0 - wS2, e1 = wS1 - wS2;          // blend weights that vanish when a third chain swaps in
  if(e1 > 0.02*e0){
    slotTex(sA1, sB1, fp, a, needL, needB, T1, G1, H1, F1, E1);
    float f = smoothstep(0.25, 0.75, e1/(e0 + e1));    // a soft stitch line where two chains meet, no plaid
    T = mix(T, T1, f); G = mix(G, G1, f); Hz = mix(Hz, H1, f); F = mix(F, F1, f); E = mix(E, E1, f);
  }
  vec3 lum = vec3(0.0), wal = vec3(0.0);
  float Lxy = length(LDIR.xy);
  if(inL > 0.0){
    // half-pipe: the far inner wall, seen through luminous plasma; axis deepest (and softest),
    // the sides curve up toward the viewer, sharp and glossy
    float zd = sqrt(max(1.0 - a*a, 0.0)), near = 1.0 - zd;
    float focus = 1.0 - 0.5*zd;
    vec3 nI = normalize(vec3(-g*a, zd + 0.06));
    float fr = mix(0.6, 3.2, smoothstep(0.6, 2.5, 1.0/fp))*(0.35 + 0.65*zd);          // fold relief: calm at mid zoom
    vec3 n = normalize(nI + vec3(-G.xy*fr - F.yz*(0.7*focus), 0.0));
    vec3 farW = mix(vec3(0.30, 0.05, 0.10), vec3(0.52, 0.085, 0.075), oxy);
    float ndl = dot(n, LDIR), dif = max(ndl, 0.0), wrap = max(ndl + 0.5, 0.0)/1.5;
    vec3 c = farW*(0.26 + 0.52*dif + 0.3*wrap)*(1.0 + 0.10*T.y)*(1.0 + 0.3*F.x*focus)*(1.0 + 0.22*T.x);
    c += vec3(0.55, 0.10, 0.04)*(1.0 - wrap)*(1.0 - wrap)*0.12;                         // warm light bleeding through
    float sp = pow(max(dot(n, HDIR), 0.0), mix(14.0, 44.0, near));
    c += vec3(1.0, 0.58, 0.5)*sp*mix(0.05, 0.16, near)*(0.6 + 0.4*focus);         // wet glints on the folds
    // the rim facing away from the light shades the floor next to it (reads as depth at mid zoom)
    float rimSh = smoothstep(0.5, 0.97, a)*clamp(1.4*dot(g, LDIR.xy)/Lxy, 0.0, 1.0);
    c *= 1.0 - mix(0.38, 0.2, smoothstep(1.0, 4.0, 1.0/fp))*rimSh;
    // luminous plasma: warm, scattering, thickest (and brightest) over the deep axis; clouds drift
    vec3 plasma = mix(vec3(0.25, 0.035, 0.075), vec3(0.44, 0.07, 0.05), oxy)*(0.92 + 0.22*G.w + 0.04*T.z);
    c = mix(c, plasma, 0.58*pow(zd, 0.7));
    c *= 1.0 + 0.06*T.z*(0.4 + 0.6*zd);
    c += vec3(0.18, 0.05, 0.05)*pow(a, 5.0)*(1.0 - rimSh);
    // red-cell suspension at lower zooms (particles take over as rbcLOD → 1)
    vec3 rbc = mix(vec3(0.52, 0.045, 0.11), vec3(0.86, 0.11, 0.09), oxy);
    Hz = mix(Hz, vec2(0.46, 0.92), 0.5*uLOD);                                     // hand-over: particles carry the detail
    float hw = (1.0 - uLOD)*clamp(Hz.x*(1.0 + 0.3*G.w + 0.06*T.z), 0.0, 1.0);
    hw *= mix(0.55, 1.0, zd)*(1.0 - 0.6*smoothstep(0.82, 1.0, a));        // thinner blood + cell-free sleeve at the wall
    c = mix(c, rbc*Hz.y*(1.08 - 0.22*zd)*(1.0 + 0.05*T.z + 0.07*G.w)*(1.0 - 0.3*rimSh), hw);
    c += vec3(1.0, 0.62, 0.52)*0.07*E.y;                                         // bokeh
    c *= 1.0 + 0.1*pl;
    lum = c;
  }
  if(inL < 1.0){
    // wall: media (glossy, muscular, pink-red) + adventitia (darker fibrous outer coat), one rounded
    // rim; bright lining at the lumen, a groove between the coats, dark cut edge outside
    float wt = wall + adv;
    float u = clamp((N + wall)/wt, 0.0, 1.0), um = wall/wt;
    vec3 wc = kind <= 1.0 ? mix(vec3(0.72, 0.29, 0.30), vec3(0.64, 0.27, 0.32), kind) : mix(vec3(0.64, 0.27, 0.32), vec3(0.40, 0.17, 0.28), kind - 1.0);
    vec3 ac = wc*vec3(0.72, 0.62, 0.66);
    // a pillow profile: flat cut face, rounded shoulders at the lumen and at the outer edge
    float dh = 2.6*(1.0 - smoothstep(0.0, 0.3, u)) - 2.6*smoothstep(0.7, 1.0, u) + 0.35*cos(3.14159*u);
    float gr = clamp(gN*rB, 0.25, 1.5);                   // < 1 where the union widens the band (fillets)
    vec3 nW = normalize(vec3(-g*(0.7*dh*gr + G.z), 1.0));
    float dfw = max(dot(nW, LDIR), 0.0);
    vec3 c = mix(wc, ac, smoothstep(um - 0.06, um + 0.06, u))*(0.34 + 0.86*dfw);
    c *= 1.0 + 0.3*T.w;
    c += vec3(1.0, 0.8, 0.78)*pow(max(dot(nW, HDIR), 0.0), 40.0)*0.42*(1.0 - 0.5*smoothstep(um, 1.0, u));
    c += vec3(0.6, 0.12, 0.1)*0.08*pl*(1.0 - u);                                   // flushes on the beat
    float dIn = (N + wall)/gN, dOut = (adv - N)/gN;       // true µm to the lumen edge / to the outer edge
    float lw = max(0.07*wall*rB, 1.2*fp);
    c += vec3(0.50, 0.30, 0.30)*exp(-dIn/lw);
    float gw = max(0.035*wall*rB, 1.1*fp), dG = abs(N)/gN;
    c *= 1.0 - 0.16*exp(-dG*dG/(gw*gw))*step(0.001, adv);                           // external lamina groove
    float ow = max(0.06*wall*rB, 0.9*fp);
    c *= mix(1.0, 0.62, smoothstep(0.5, 1.0, u))*(1.0 - 0.7*exp(-dOut/ow));
    wal = c;
  }
  return mix(wal, lum, inL);
}

// wall wobble of one chain slot → (displacement in r, + = outward; pressure). The wall undulates
// slowly: waves travel along the chain (arc measured in local radii, so every vessel gets the same
// number of waves per diameter), differently on its two sides, biased outward — the rendered wall
// moves between −0.1 and +0.3 of its thickness.
vec2 slotWobble(vec4 A, vec4 B, vec2 C){
  int bi = int(C.x + 0.5); float t = C.y;
  vec4 X = texelFetch(uSegX, ivec2(bi % SEGW, bi / SEGW), 0);       // (arc/r at the ends, pressure at the ends)
  float wl = wallOf(B.z), u = 0.1*wl, px = 0.3*wl*A.z*uPPU.x;       // undulation amplitude on screen (px)
  if(px > 0.25){                                                     // skipped while it moves < ¼ px
    int i4 = bi*4;
    vec4 T2 = texelFetch(uSeg, ivec2(i4 % SEGW, i4 / SEGW) + ivec2(2, 0), 0);
    float ph = T2.z*2.3999632, ax = mix(X.x, X.y, t) + (A.x - mix(T2.x, T2.y, t))/A.z, xs = clamp(A.y/A.z, -1.0, 1.0);
    vec4 wv = sin(6.2831853*(vec4(0.31, 0.53, 0.43, 0.71)*ax + vec4(-0.19, 0.12, -0.15, 0.22)*uTime) + vec4(1.0, 2.1, 1.3, 2.9)*ph);
    u += 0.1*wl*smoothstep(0.25, 0.5, px)*(0.6*wv.x + 0.4*wv.y + xs*(0.6*wv.z + 0.4*wv.w));   // |·| ≤ 2
  }
  return vec2(u, mix(X.z, X.w, t));
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 p = uCam + vec2(fc.x - 0.5*uRes.x, 0.5*uRes.y - fc.y)/uPPU;
  float fp = 1.0/uPPU.x;
  evalField(p);
  if(uDebug == 1){ outColor = vec4(float(nFull)/255.0, float(nVisit)/255.0, 0.0, 1.0); return; }
  float acc = gAcc, inv = acc > 1e-30 ? 1.0/acc : 0.0;
  float N = -K*log2(max(acc, exp2(-NFAR/K)));
  float rB = acc > 1e-30 ? gR*inv : 200.0;
  vec2 g = dot(gG, gG) > 1e-20 ? normalize(gG) : vec2(0.0);
  float oxy = acc > 1e-30 ? gO*inv : 0.5, kind = acc > 1e-30 ? gK*inv : 0.0;
  float wall = wallOf(kind);
  float gN = acc > 1e-30 ? max(length(gGN)*inv, 1e-5) : 1.0/200.0;   // |∇N| (1/µm)
  float aaN = max(1.2*gN*fp, 1e-5);          // analytic |∇N| per pixel: smooth, immune to the reach fade
  // ---- wobble: the wall undulation + the arterial pulse wave, as an offset of the merged field.
  // The pulse reaches a point after a delay that grows as the pressure falls (the heart end
  // dilates first); arteries dilate most, connectors a little, veins barely.
  float e0 = wS0 - wS2, e1 = wS1 - wS2;          // slot blend weights that vanish when a third chain swaps in
  float sf = e1 > 0.02*e0 ? smoothstep(0.25, 0.75, e1/(e0 + e1)) : 0.0;
  vec2 wb = vec2(0.0);
  if(wS0 > 0.0){ wb = slotWobble(sA0, sB0, sC0); if(sf > 0.0) wb = mix(wb, slotWobble(sA1, sB1, sC1), sf); }
  float prs = wb.y;
  float wd = clamp((1.0 - prs)*uWave.x, 0.0, 1.6)*uWave.y, wi = min(floor(wd), float(PTN - 2));
  float dil = mix(uPT[int(wi)], uPT[int(wi) + 1], clamp(wd - wi, 0.0, 1.0));
  float kF = kind <= 1.0 ? mix(1.0, 0.5, kind) : mix(0.5, 0.1, kind - 1.0);
  float pls = dil*kF*(0.45 + 0.55*clamp(prs, 0.0, 1.0));                // 0..1: the local pulse
  float uD = wb.x + 0.058*pls;                                          // wall displacement (in r; + = outward)
  // profile: the lumen scales about the axis, the wall band moves as a whole, the tissue follows
  // elastically (berm and contact shadow move with the wall, far tissue stays put)
  float Np = N - uD*(N < -wall ? max(1.0 + N, 0.0)/(1.0 - wall) : N < 0.0 ? 1.0 : exp(-2.0*N*N));
  // debug views: 1 = work counters (read back by R.measure), 2 = field (N, arc s, wall band), 3 = grid cells + full evaluations,
  // 4 = lumen-edge check: r = physics lumen drawn as wall (depth in wall thicknesses / 0.5), g = wall drawn as lumen (/ 1), b = physics lumen
  if(uDebug == 2){ outColor = vec4(0.5 + 0.5*clamp(-N, -1.0, 1.0), fract(sA0.x/200.0), step(-wall, N)*0.5, 1.0); return; }
  if(uDebug == 3){ ivec2 gi = ivec2(floor((p - uGridO)/uCellSize)); outColor = vec4(float(nFull)/8.0, float(gi.x % 2)*0.5, float(gi.y % 2)*0.5, 1.0); return; }
  if(uDebug == 4){
    float inPh = step(N, -wall), inR = step(Np, -wall);
    outColor = vec4(inPh*(1.0 - inR)*clamp((-wall - N)/wall/0.5, 0.0, 1.0), inR*(1.0 - inPh)*clamp((N + wall)/wall, 0.0, 1.0), inPh, 1.0); return;
  }
  N = Np;
  float ls = 1.0/(1.0 + uD/(1.0 - wall));                                // chain-space lumen textures scale with the wall
  sA0.y *= ls; sA1.y *= ls;
  // tube ↔ cut-open by on-screen width; near a junction the bigger vessel decides (continuous
  // across slot swaps), so a thin branch switches look along its own length, not in the fillet
  float rCo = max(max(rB, sA0.z), sA1.z*smoothstep(0.0, 0.3, e1/max(e0 + e1, 1e-20)));
  float co = smoothstep(44.0, 140.0, 2.0*uZ*(0.4*rCo + 240.0));   // mostly zoom-driven: neighbours share a look
  // adventitia: drawn over the tissue just outside the wall (arteries thick, veins thin), cut-open look only
  float adv = co*wall*(kind <= 1.0 ? mix(0.85, 0.5, kind) : mix(0.5, 0.35, kind - 1.0));
  float cover = 1.0 - smoothstep(-aaN, aaN, N - adv);
  vec3 col = vec3(0.0);
  if(cover < 1.0) col = tissue(p, max(N - adv, 0.0)*rB, g, rB, fp);
  if(cover > 0.0){
    float Dcss = 2.0*rB*uZ;
    vec3 v = vec3(0.0);
    if(co < 1.0) v = tubeLook(N, g, oxy, Dcss, pls);
    if(co > 0.0) v = mix(v, cutLook(N, rB, g, oxy, kind, wall, adv, fp, aaN, gN, pls), co);
    col = mix(col, v, cover);
  }
  // outside the map: fade into darkness
  vec2 ob = max(max(uBounds.xy - p, p - uBounds.zw), 0.0);
  col *= 1.0 - 0.9*smoothstep(0.0, 480.0, length(ob));
  col += (h21(ivec2(fc)) - 0.5)*(1.5/255.0);          // dither against banding
  outColor = vec4(max(col, 0.0), 1.0);
}`;

const BLIT_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uRes;
out vec4 o;
void main(){ o = texture(uTex, gl_FragCoord.xy/uRes); }`;

// ---------------------------------------------------------------------------
//  RED CELLS
// ---------------------------------------------------------------------------
const RBC_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aC;
layout(location=1) in vec4 iA;     // x, y, r, depth
layout(location=2) in vec4 iB;     // angle, tumble, oxy, alpha
uniform vec2 uCam, uRes; uniform float uPPU, uLOD, uDof, uFG;
out vec2 vP; flat out vec4 vI; flat out vec4 vJ; flat out float vS;
void main(){
  float depth = clamp(iA.w, 0.0, 1.0);
  float r = iA.z*mix(1.0, 0.8, depth)*(uFG > 0.5 ? 2.6 : 1.0);
  float rpx = r*uPPU;
  float blur = uFG > 0.5 ? 0.36*rpx*uDof + 1.0 : uDof*(0.02 + 0.5*smoothstep(0.35, 1.0, depth))*rpx;
  float ext = 1.08 + (blur + 1.5)/max(rpx, 0.5);
  vS = fract(iA.z*7.31 + iA.w*97.13);           // stable per cell (radius and depth never change)
  float c = cos(iB.x), s = sin(iB.x);
  vec2 lc = aC*ext;
  vec2 w = iA.xy + vec2(c*lc.x - s*lc.y, s*lc.x + c*lc.y)*r;
  vec2 sp = (w - uCam)*uPPU;
  gl_Position = vec4(sp.x*2.0/uRes.x, -sp.y*2.0/uRes.y, 0.0, 1.0);
  vP = lc;
  vI = vec4(rpx, blur, depth, clamp(iB.y, 0.0, 1.0));
  // foreground cells stay out of the middle of the screen (where the action is), like a lens vignette
  float edge = uFG > 0.5 ? 0.7*smoothstep(0.25, 0.85, length((iA.xy - uCam)*uPPU*2.0/uRes)) : 1.0;
  vJ = vec4(iB.z, iB.w*uLOD*edge, c, s);
}`;

const RBC_FS = `#version 300 es
precision highp float;
in vec2 vP; flat in vec4 vI; flat in vec4 vJ; flat in float vS;
uniform float uFG, uTime;
out vec4 o;
${GLSL_COMMON}
float thick(float r){ float q = max(1.0 - r*r, 0.0), r2 = r*r; return 0.5*pow(q, 0.35)*(0.30 + 1.75*r2 - 1.05*r2*r2); }
float dthick(float r){
  float q = max(1.0 - r*r, 0.03), r2 = r*r, P = 0.30 + 1.75*r2 - 1.05*r2*r2;
  return 0.5*(-0.7*r*pow(q, -0.65)*P + pow(q, 0.35)*(3.5*r - 4.2*r*r2));
}
void main(){
  float rpx = vI.x, blur = vI.y, depth = vI.z, tum = vI.w, oxy = vJ.x, alpha = vJ.y;
  float th = tum*1.5707963, ct = cos(th), st = sin(th);
  vec2 q = vP;                                      // x along travel, y across (units of r)
  // a soft disc, not a coin: it flexes like a parachute in the flow (most visible edge-on)
  // and its outline breathes a little, each cell on its own beat
  float t = uTime + vS*37.0;
  q.x += (0.10*sin(t*(1.6 + vS)) + 0.04*sin(t*3.7 + 2.0))*(0.3 + 0.7*st)*(q.y*q.y - 0.35);
  q.y *= 1.0 + 0.035*sin(t*2.3 + 1.0);
  float ay = abs(q.y), yy = min(ay, 1.0);
  float cy = sqrt(max(1.0 - yy*yy, 0.0));
  float wy = ct*cy + st*thick(yy);                  // silhouette half-width at this row
  float f = max(abs(q.x) - wy, ay - 1.0);
  float ax = max(ct + st*0.34, 0.2);
  float fe = (length(q/vec2(ax, 1.0)) - 1.0)*ax;                  // ellipse proxy: round when defocused
  f = mix(f, fe, smoothstep(0.02, 0.2, blur/max(rpx, 1.0)));
  float soft = max(fwidth(f)*0.8, blur/max(rpx, 1.0));
  float cov = 1.0 - smoothstep(-soft, soft, f);
  if(cov <= 0.002) discard;
  float xn = wy > 1e-3 ? clamp(q.x/wy, -1.0, 1.0) : 0.0;
  float rho = sqrt(clamp(yy*yy + xn*xn*cy*cy, 0.0, 1.0));
  vec2 dir = rho > 1e-4 ? normalize(vec2(xn*cy, q.y)) : vec2(0.0);
  float dt = clamp(dthick(rho)*(rho < 0.72 ? 1.7 : 1.0), -2.5, 2.5);
  vec3 nF = normalize(vec3(-dt*dir, 1.0));
  nF = vec3(nF.x*ct + nF.z*st, nF.y, nF.z*ct - nF.x*st);          // disc tilted about its cross axis
  vec3 nE = vec3(xn, 0.3*q.y, sqrt(max(1.0 - xn*xn, 0.0)) + 0.15); // edge-on: a rounded rim
  vec3 n = normalize(mix(nF, nE, st*st));
  if(n.z < 0.05) n = normalize(vec3(n.xy, 0.05));
  vec2 dr = vJ.zw;                                   // travel direction (screen)
  vec3 L = vec3(dot(LDIR.xy, dr), dot(LDIR.xy, vec2(-dr.y, dr.x)), LDIR.z);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  vec3 base = mix(vec3(0.55, 0.03, 0.10), vec3(0.90, 0.075, 0.06), oxy);
  float ndl = dot(n, L), dif = max(ndl, 0.0);
  float rim = smoothstep(0.45, 0.75, rho)*(1.0 - smoothstep(0.88, 1.0, rho))*(1.0 - st);
  vec3 col = base*(0.26 + 0.80*dif);
  col += base*0.55*rim*(0.3 + dif);                                          // the bright torus
  col *= 1.0 - 0.3*(1.0 - st)*(1.0 - smoothstep(0.08, 0.62, rho));              // shaded dimple (face-on only)
  float nh = max(dot(n, H), 0.0);
  col += vec3(1.0, 0.70, 0.62)*(pow(nh, 70.0)*0.85 + pow(nh, 14.0)*0.16);        // crisp + broad gloss
  float ed = 1.0 - clamp(n.z, 0.0, 1.0);
  col += vec3(0.95, 0.16, 0.07)*pow(ed, 1.6)*(0.3 + 0.35*(1.0 - dif));         // subsurface glow at the edge
  col *= 1.0 - 0.22*smoothstep(0.92, 1.0, rho)*(1.0 - st);                  // thin dark outline
  float det = 1.0 - smoothstep(0.0, 0.45, blur/max(rpx, 1.0));
  // out of focus: a soft glowing disc, a little brighter toward the light, a hint of the dimple
  vec3 dfc = base*(0.5 + 0.28*clamp(0.5 - 0.5*dot(q, normalize(LDIR.xy)), 0.0, 1.0) - 0.12*(1.0 - smoothstep(0.1, 0.7, length(q)))*(1.0 - st));
  col = mix(dfc, col, det);
  vec3 plasma = mix(vec3(0.18, 0.024, 0.06), vec3(0.34, 0.045, 0.04), oxy);
  float sink = uFG > 0.5 ? 0.08 : 0.72*depth*depth + 0.08*depth;
  col = mix(col, plasma, sink);
  float a = cov*alpha*(uFG > 0.5 ? 1.0 : 1.0 - 0.25*depth);
  o = vec4(col*a, a);
}`;

// ---------------------------------------------------------------------------
//  UNITS  (WBC, virus, bacterium, infection site, antibody, FX)
// ---------------------------------------------------------------------------
const UNIT_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aC;
layout(location=1) in vec4 iA;   // x, y, r, type
layout(location=2) in vec4 iB;   // angle, phase, flags, hp
layout(location=3) in vec4 iC;   // lookX, lookY, stretch, tint
layout(location=4) in vec4 iD;   // extra0..3
uniform vec2 uCam, uRes; uniform float uPPU, uDpr; uniform int uPass;
out vec2 vP;
flat out vec4 vA; flat out vec4 vB; flat out vec4 vC; flat out vec4 vD;
void main(){
  int type = int(iA.w + 0.5);
  int fl = int(iB.z + 0.5);
  bool ok = uPass == 0 ? (type <= 2) : uPass == 1 ? (type == 3) : uPass == 2 ? (type <= 2 && (fl & 33) != 0)
          : uPass == 3 ? (type <= 2 || type == 4) : (type == 5);
  if(!ok){ gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  float z = uPPU/uDpr;                                        // css px per µm
  float minPx = type == 0 ? 2.5 : type == 3 ? 9.0 : type == 5 ? 0.0 : 2.0;
  float rc = max(iA.z*z, minPx);                              // css px radius as drawn
  float rW = rc/z;                                            // µm radius as drawn
  // WBC stretch 0.85 … 1.35 (< 1 squashes along the heading); rods and sites use it as a length ≥ 1
  float st = type == 0 ? clamp(iC.z, 0.8, 1.6) : max(iC.z, 1.0);
  float icon = 1.0 - smoothstep(7.0, 11.0, rc);
  vec2 ext = type == 0 ? vec2(1.72*max(st, 1.0) + 0.16, 1.72*inversesqrt(min(st, 1.0)) + 0.1) : type == 1 ? vec2(1.45) : type == 2 ? vec2(st + 2.7, 2.1)
           : type == 3 ? vec2(1.55*st, 1.55) : type == 4 ? vec2(1.2) : vec2(2.3);
  if(uPass == 0) ext = type == 2 ? vec2(st + 0.6, 1.6) : vec2(1.45*st, 1.45*inversesqrt(min(st, 1.0)));
  if(icon > 0.0 && uPass != 0) ext = max(ext, vec2(2.6));
  if(uPass == 2) ext += vec2(0.4);
  vec2 lc = aC*ext;
  float ang = iB.x, c = cos(ang), s = sin(ang);
  vec2 off = uPass == 0 ? vec2(0.26, 0.34)*((int(iB.z + 0.5) & 16) != 0 ? 0.45 : 1.0)*rW : vec2(0.0);
  vec2 w = iA.xy + off + vec2(c*lc.x - s*lc.y, s*lc.x + c*lc.y)*rW;
  vec2 sp = (w - uCam)*uPPU;
  gl_Position = vec4(sp.x*2.0/uRes.x, -sp.y*2.0/uRes.y, 0.0, 1.0);
  vP = lc;
  vA = vec4(rc*uDpr, rc, float(type), iB.z);
  vB = vec4(ang, iB.y, iB.w, st);
  vC = vec4(iC.xy, iC.w, icon);
  vD = iD;
}`;

const UNIT_FS = `#version 300 es
precision highp float; precision highp int;
in vec2 vP;
flat in vec4 vA; flat in vec4 vB; flat in vec4 vC; flat in vec4 vD;
uniform float uTime; uniform int uPass;
out vec4 o;
${GLSL_COMMON}
const vec3 INK = vec3(0.10, 0.035, 0.07);

float ellip(vec2 p, vec2 r){ return (length(p/r) - 1.0)*min(r.x, r.y); }

// ---- faces: mood 0 cute (WBC), 1 angry (virus), 2 grumpy (bacterium) --------
vec4 face(vec2 p, float aw, int mood, vec2 look, float blink, float eat, float sc, vec3 skin){
  vec4 res = vec4(0.0);
  p /= sc; aw /= sc;
  vec2 lk = look*(mood == 0 ? 0.05 : 0.035);
  // cheeks
  if(mood == 0){
    for(int k = 0; k < 2; k++){
      float e = k == 0 ? -1.0 : 1.0;
      float d = length((p - vec2(0.34*e, 0.13))*vec2(1.0, 1.35));
      res = over(pm(vec3(1.0, 0.45, 0.55), 0.26*(1.0 - smoothstep(0.02, 0.1, d))), res);
    }
  }
  // eyes
  for(int k = 0; k < 2; k++){
    float e = k == 0 ? -1.0 : 1.0;
    vec2 ec = mood == 0 ? vec2(0.205*e, -0.07) : mood == 1 ? vec2(0.185*e, -0.03) : vec2(0.16*e, -0.045);
    vec2 er = mood == 0 ? vec2(0.148, 0.165) : mood == 1 ? vec2(0.115, 0.1) : vec2(0.1, 0.095);
    vec2 d = p - ec;
    float bl = mood == 0 ? mix(1.0, 0.08, blink) : 1.0;
    d.y /= bl;
    float sdE = ellip(d, er);
    // lid line: angry = slanted down toward the centre, grumpy = flat, half-closed
    float lid = mood == 1 ? dot(p - ec - vec2(0.0, -0.012), normalize(vec2(-0.55*e, -1.0))) : mood == 2 ? (ec.y - 0.005) - p.y : -1.0;
    float sdW = max(sdE, lid);
    float white = fill(sdW, aw);
    float line = fill(abs(sdE) - 0.022, aw)*(1.0 - smoothstep(0.0, aw*2.0, lid));
    if(mood == 0 && blink > 0.6) line = fill(abs(d.y*bl) - 0.024, aw)*fill(abs(d.x) - er.x, aw);
    vec2 pc = ec + lk + vec2(0.0, mood == 0 ? 0.015 : 0.01);
    float pr = mood == 0 ? 0.088 : mood == 1 ? 0.052 : 0.047;
    float pup = fill(length(p - pc) - pr, aw)*white;
    float cl = fill(length(p - pc - vec2(-0.03, -0.035)*pr/0.088) - 0.028*pr/0.088, aw)*pup;
    float cl2 = fill(length(p - pc - vec2(0.032, 0.03)*pr/0.088) - 0.012*pr/0.088, aw)*pup;
    res = over(pm(vec3(0.98, 0.97, 1.0), white), res);
    res = over(pm(INK, pup), res);
    res = over(pm(vec3(1.0), max(cl, cl2*0.8)), res);
    res = over(pm(INK*1.4, line*0.9), res);
    if(mood == 1){      // thick brow along the lid
      float bw = sdSeg(p, ec + vec2(0.13*e, -0.13), ec + vec2(-0.07*e, -0.02)) - 0.03;
      res = over(pm(INK*1.3, fill(bw, aw)), res);
    }
    if(mood == 2){      // heavy upper lid
      float lidA = fill(max(sdE, -lid), aw);
      res = over(pm(skin*0.62, lidA), res);
      res = over(pm(INK*1.2, fill(abs(lid) - 0.016, aw)*fill(sdE - 0.01, aw)), res);
    }
  }
  // mouth
  if(mood == 0){
    if(eat > 0.0){
      float o = 0.8 + 0.2*sin(uTime*11.0);
      vec2 mp = p - vec2(0.0, 0.2);
      float sdM = ellip(mp, vec2(0.075, 0.09*o));
      res = over(pm(vec3(0.36, 0.04, 0.10), fill(sdM, aw)), res);
      res = over(pm(vec3(0.95, 0.45, 0.55), fill(ellip(mp - vec2(0.0, 0.05*o), vec2(0.05, 0.03)), aw)*fill(sdM, aw)), res);
      res = over(pm(INK, fill(abs(sdM) - 0.016, aw)), res);
    } else {
      vec2 mp = p - vec2(0.0, 0.07);
      float sdM = max(length(mp*vec2(1.0, 1.25)) - 0.12, -(mp.y - 0.015));        // D-shaped open smile
      float mo = fill(sdM, aw);
      res = over(pm(vec3(0.38, 0.04, 0.12), mo), res);
      res = over(pm(vec3(0.98, 0.48, 0.58), mo*fill(length((mp - vec2(0.0, 0.1))*vec2(1.0, 1.4)) - 0.07, aw)), res);
      res = over(pm(INK, fill(abs(sdM) - 0.018, aw)), res);
    }
  } else if(mood == 1){
    vec2 mp = p - vec2(0.0, 0.2);
    float y = 0.9*mp.x*mp.x - 0.012 + 0.018*(abs(fract(mp.x*14.0) - 0.5)*2.0 - 0.5);
    float m = max(abs(mp.y + y) - 0.024, abs(mp.x) - 0.14);
    res = over(pm(INK*1.4, fill(m, aw)), res);
  } else {
    vec2 mp = p - vec2(0.0, 0.16);
    float y = -1.1*mp.x*mp.x;
    float m = max(abs(mp.y + y) - 0.018, abs(mp.x) - 0.1);
    res = over(pm(INK*1.3, fill(m, aw)), res);
  }
  return res;
}

// small spiky orange virus used for icons of engulfed prey
vec4 miniVirus(vec2 p, float aw, float t){
  float rho = length(p), phi = atan(p.y, p.x) + t;
  float R = 0.72 + 0.14*pow(abs(sin(phi*7.0)), 3.0);
  float cov = fill(rho - R, aw);
  vec3 c = mix(vec3(1.0, 0.62, 0.2), vec3(0.72, 0.26, 0.05), smoothstep(0.1, 0.9, length(p - vec2(-0.25, -0.3))));
  return pm(c, cov);
}

// Soft-body white cell. pb (body frame, x along the heading) → q, the cell's own material
// coordinates: squash & stretch along the heading (volume-preserving: the cross axes shrink by
// 1/√stretch), a jelly bounce of the whole cell and a quadrupole wobble, both driven by the
// jiggle impulse jig (e0, decays in the sim) — a fast oscillation whose amplitude follows it.
// R: the rippling membrane (a few low harmonics, own phase per cell) + pseudopod when moving.
void wbcShape(vec2 pb, float st, float ph, int flags, float act, float jig, out vec2 q, out float rho, out float R){
  float t = uTime + ph;
  float bo = 1.0 + jig*(0.075*sin(t*27.0) + 0.02) + 0.012*sin(t*1.3);          // bounce + slow breathing
  q = vec2(pb.x/st, pb.y*sqrt(st))/bo;
  rho = length(q); float phi = atan(q.y, q.x);
  float mv = clamp(max((st - 1.0)*3.0, act), 0.0, 1.0);
  float jA = 0.6 + 0.4*sin(t*0.37);                                               // ripples wax and wane
  R = 0.93 + jA*(0.042*sin(3.0*phi + 2.6*t) + 0.028*sin(5.0*phi - 3.4*t + 1.3)) + 0.022*sin(2.0*phi + 1.7*t + 2.1)
    + 0.012*sin(7.0*phi + 4.3*t + 0.7*ph)
    + mv*(0.16*pow(max(cos(phi), 0.0), 6.0) - 0.035)
    + jig*(0.10*sin(t*23.0 + 1.0)*cos(2.0*phi - 1.3*ph) + 0.045*sin(3.0*phi - t*31.0));
  if((flags & 2) != 0) R += 0.03*sin(uTime*9.0 + ph);
}
vec4 drawWBC(vec2 pb, float ang, float aw, float st, float ph, int flags, float hp, vec2 look, float tint, float prey, float faceMix, float act, float jig){
  float t = uTime + ph;
  vec2 q; float rho, R; wbcShape(pb, st, ph, flags, act, jig, q, rho, R);
  vec2 ps = rot(q, ang);                          // material coordinates, screen-oriented (light, face)
  vec2 hd = vec2(cos(ang), sin(ang));
  float sd = rho - R;
  float cov = fill(sd, aw*1.1);
  float s = clamp(rho/R, 0.0, 1.0), hz = sqrt(1.0 - s*s);
  float lp = length(ps);
  vec2 dir = lp > 1e-4 ? ps/lp : vec2(0.0);
  vec3 n = normalize(vec3(dir*s, hz));
  float F = pow(1.0 - hz, 1.8);
  float dif = max(dot(n, LDIR), 0.0);
  float mv = clamp(max((st - 1.0)*3.0, act), 0.0, 1.0);
  // the heavy insides lag behind the membrane: they trail when the cell swims and slosh after a jolt
  vec2 slosh = -hd*0.07*mv + jig*0.075*vec2(sin(t*23.0 - 1.4), cos(t*19.0 - 0.9)) + 0.018*vec2(sin(t*0.9), cos(t*1.13));
  vec4 res = vec4(0.0);
  // soft white glow around the cell
  res += vec4(vec3(0.9, 0.86, 1.0)*0.34*exp(-max(sd, 0.0)*6.5)*(1.0 - cov), 0.0);
  // engulfed prey being digested
  if(prey > 0.5){
    vec2 pp = (ps - 0.6*slosh - vec2(0.1, 0.42))/(0.36*(1.0 - 0.55*clamp(hp, 0.0, 1.0)));
    vec4 v = prey < 1.5 ? miniVirus(pp, aw*2.8, uTime*0.7) : pm(vec3(0.3, 0.8, 0.45), fill(sdSeg(pp, vec2(-0.5, 0.0), vec2(0.5, 0.0)) - 0.4, aw*2.8));
    res = over(v*cov, res);
  }
  // nucleus: a compact kidney of two-three lobes curling around the top-left, seen through the jelly
  float ra = (tint - 0.5)*1.3 + 0.1*sin(t*0.4);
  vec2 np = rot(ps - slosh, -ra);
  float sN = length((np - vec2(-0.28, -0.30))*vec2(1.0, 1.2)) - 0.25;
  sN = smin(sN, length((np - vec2(0.08, -0.44))*vec2(1.15, 1.0)) - 0.19, 0.12);
  sN = smin(sN, length(np - vec2(-0.47, 0.04)) - 0.16, 0.12);
  float nuc = (1.0 - smoothstep(-0.05, 0.03, sN))*cov;
  vec3 nc = mix(vec3(0.95, 0.58, 0.68), vec3(0.74, 0.36, 0.54), smoothstep(-0.22, 0.02, sN));
  nc *= 0.82 + 0.3*dif;
  res = over(pm(nc, 0.84*nuc), res);
  // cytoplasm: milky glass, thin in the middle, thick and bright at the Fresnel rim
  vec3 cy = mix(vec3(0.86, 0.84, 0.93), vec3(1.0, 0.99, 1.0), F)*(0.84 + 0.26*dif);
  res = over(pm(cy, (0.40 + 0.56*F)*cov), res);
  res.rgb += vec3(0.10, 0.08, 0.11)*cov;                                  // light scattered inside the jelly
  // granules (swirl a little with the sloshing cytoplasm)
  float gF = smoothstep(0.5, 1.2, 0.045/aw);
  if(gF > 0.0){
    vec2 gq = rot(ps - 0.5*slosh, 0.3*sin(t*0.3))/0.17 + tint*9.0;
    vec2 gi = floor(gq); vec2 gh = h22(ivec2(gi) + 40);
    float gd = length(fract(gq) - 0.25 - 0.5*gh) - 0.2;
    float gr = gF*step(0.7, h21(ivec2(gi) + 7))*fill(gd*0.17, aw)*(1.0 - smoothstep(0.72, 0.9, s));
    res = over(pm(vec3(1.0, 0.70, 0.36), 0.8*gr), res);
  }
  // face: rigid (never deformed), carried by the body and bobbing gently a beat behind it
  if(faceMix > 0.0){
    float bt = fract((uTime + ph*3.7)/3.9);
    float blink = smoothstep(0.0, 0.025, bt)*(1.0 - smoothstep(0.035, 0.065, bt));
    vec2 bob = vec2(0.012*sin(t*2.3), 0.02*sin(t*3.1 + 1.0)) + jig*0.035*vec2(sin(t*23.0 - 0.8), cos(t*27.0 - 0.6));
    vec2 fp = rot(pb, ang) - look*0.07 - vec2(0.02, 0.02) - bob;
    vec4 f = face(fp, aw, 0, look, blink, (flags & 2) != 0 ? 1.0 : 0.0, 1.38, cy);
    res = over(f*(faceMix*cov), res);
  }
  // speculars + rim light
  vec2 bq = (ps - vec2(-0.36, -0.44))*vec2(1.0, 1.7);
  float big = exp(-dot(bq, bq)/0.03);
  float small = fill(length(ps - vec2(-0.52, -0.46)) - 0.045, aw);
  res.rgb += vec3(1.0)*(0.30*big + 0.8*small)*cov;
  res.rgb += vec3(1.0, 0.97, 1.0)*0.5*smoothstep(0.8, 1.0, s)*fill(sd, aw)*(0.35 + 0.65*max(dot(dir, -SDIR), 0.0));
  res.rgb += vec3(1.0, 0.72, 0.82)*0.2*smoothstep(0.72, 1.0, s)*cov*max(dot(dir, SDIR), 0.0);
  if((flags & 4) != 0) res.rgb += vec3(0.7, 0.35, 0.35)*cov*(0.6 + 0.4*sin(uTime*40.0));
  return res;
}

// selection (cyan) / hover (white) rings, drawn in their own pass beneath every body
vec4 drawRing(int type, vec2 pb, float aw, float st, float ph, int flags, float act, float jig){
  float d;
  if(type == 0){ vec2 q; float rho, R; wbcShape(pb, st, ph, flags, act, jig, q, rho, R); d = rho - R - 0.2; }
  else if(type == 1) d = length(pb) - 1.08;
  else d = sdSeg(pb, vec2(-max(st - 1.0, 0.0), 0.0), vec2(max(st - 1.0, 0.0), 0.0)) - 1.3;
  if((flags & 1) != 0){
    vec3 c = type == 0 ? vec3(0.35, 0.95, 1.0) : vec3(1.0, 0.4, 0.3);
    vec4 res = vec4(c*0.5*exp(-abs(d)*12.0), 0.0);
    return over(pm(c, fill(abs(d) - 0.035, aw)), res);
  }
  return pm(vec3(1.0), 0.55*fill(abs(d + 0.02) - 0.02, aw));
}

vec4 drawVirus(vec2 pb, vec2 ps, float aw, float ph, vec2 look, float faceMix, int flags){
  float t = uTime + ph;
  float pul = 1.0 + 0.035*sin(t*4.1) + 0.018*sin(t*6.7 + 1.3);       // the capsid pulses
  vec2 pr = pb/pul;                               // spikes turn with the instance angle (spin)
  float rho = length(pr), phi = atan(pr.y, pr.x);
  const float NS = 18.0;
  float sec = 6.2831853/NS;
  float k = floor(phi/sec + 0.5);
  float pa = phi - k*sec;
  vec2 lp = rho*vec2(cos(pa), sin(pa));
  float hk = h21(ivec2(int(k) + 40, 3));
  // every spike waggles on its own beat and throbs in length; a knob at the tip
  float wag = 0.15*sin(t*(4.0 + 3.0*hk) + hk*6.2831853);
  float sl = (0.96 + 0.05*(hk - 0.5))*(1.0 + 0.045*sin(t*(2.6 + 1.5*hk) + 9.0*hk));
  vec2 sb = vec2(0.64, 0.0), sdir = vec2(cos(wag), sin(wag)), tip = sb + sdir*(sl - 0.64);
  float body = rho - 0.74;
  float spike = sdSeg(lp, sb, tip) - mix(0.085, 0.022, clamp(dot(lp - sb, sdir)/(sl - 0.64), 0.0, 1.0));
  spike = smin(spike, length(lp - tip) - 0.048, 0.02);
  float sd = smin(body, spike, 0.04);
  float cov = fill(sd, aw);
  float s = clamp(rho/0.75, 0.0, 1.0), hz = sqrt(max(1.0 - s*s, 0.0));
  vec3 n = normalize(vec3(ps/max(length(ps), 1e-4)*s, hz));
  float dif = max(dot(n, LDIR), 0.0);
  vec3 c = mix(vec3(0.66, 0.22, 0.04), vec3(1.0, 0.60, 0.18), 0.2 + 0.8*dif);
  c = mix(c, vec3(0.90, 0.40, 0.08), smoothstep(0.7, 0.82, rho));
  vec2 sq = pr/0.2; vec2 si = floor(sq);
  float spot = fill(length(fract(sq) - 0.5 - 0.3*(h22(ivec2(si)) - 0.5)) - 0.12, 0.08)*step(0.55, h21(ivec2(si) + 3));
  c *= 1.0 - 0.14*spot*(1.0 - smoothstep(0.55, 0.7, rho));
  c += vec3(1.0, 0.88, 0.65)*pow(max(dot(n, HDIR), 0.0), 16.0)*0.32*(1.0 - smoothstep(0.64, 0.74, rho));
  c *= 1.0 - 0.3*smoothstep(0.6, 0.74, rho)*max(dot(n.xy, SDIR), 0.0);
  vec4 res = vec4(vec3(1.0, 0.45, 0.1)*0.22*exp(-max(sd, 0.0)*8.0)*(1.0 - cov), 0.0);
  res = over(pm(c, cov), res);
  if(faceMix > 0.0) res = over(face((ps - look*0.04 + vec2(0.0, 0.03))/pul, aw/pul, 1, look, 0.0, 0.0, 1.4, c)*(faceMix*cov), res);
  if((flags & 4) != 0) res.rgb += vec3(0.6)*cov;
  return res;
}

vec4 drawBacterium(vec2 pb, vec2 ps, float aw, float ph, vec2 look, float faceMix, int flags, float ang, float st, float div){
  // local units: r = the rod's half-width; stretch = half-length / r (sim: 2.2 … 3, grows before dividing)
  float t = uTime + ph;
  float HL = max(st - 1.0, 0.0);
  // the rod flexes: a slow banana bend plus a wave running down its length
  float kb = 0.085*sin(t*1.7) + 0.035*sin(t*2.9 + 1.0);
  float yb = kb*(HL*HL/3.0 - pb.x*pb.x) - 0.075*sin(pb.x*1.6 - t*4.6);     // (zero mean along the rod)
  vec2 q = pb; q.y += yb;
  float pinch = 0.42*smoothstep(0.35, 1.0, div)*exp(-q.x*q.x/0.5);      // waist forming before division
  float sd = sdSeg(q, vec2(-HL, 0.0), vec2(HL, 0.0)) - (1.0 - pinch);
  float cov = fill(sd, aw);
  // flagella trailing from the back (their root rides on the flexing tail)
  float fl = 0.0;
  vec2 pf = vec2(pb.x, pb.y - kb*HL*HL*2.0/3.0 + 0.075*sin(HL*1.6 + t*4.6));
  for(int k = 0; k < 2; k++){
    float fk = float(k);
    float x = pf.x + HL + 0.7;
    float y0 = (fk - 0.5)*0.7;
    float amp = 0.15 + 0.26*clamp(-x, 0.0, 2.5);
    float ph2 = 2.6*x + t*8.0 + fk*2.4;
    float y = y0*(1.0 + 0.45*clamp(-x, 0.0, 3.0)) + amp*sin(ph2);
    float dy = 0.45*y0*step(x, 0.0) - 0.26*sin(ph2)*step(x, 0.0) + amp*2.6*cos(ph2);
    float d = abs(pf.y - y)/sqrt(1.0 + dy*dy) - mix(0.11, 0.05, clamp(-x/3.2, 0.0, 1.0));
    d = max(d, max(x, -x - 3.2));
    fl = max(fl, fill(d, aw)*(1.0 - smoothstep(2.4, 3.2, -x)));
  }
  float s = clamp(abs(sdSeg(q, vec2(-HL, 0.0), vec2(HL, 0.0)))/(1.0 - pinch), 0.0, 1.0);
  vec2 nd = q - vec2(clamp(q.x, -HL, HL), 0.0);
  vec2 ns = rot(nd/max(length(nd), 1e-4), ang);
  vec3 n = normalize(vec3(ns*s, sqrt(max(1.0 - s*s, 0.0))));
  float dif = max(dot(n, LDIR), 0.0);
  vec3 c = mix(vec3(0.06, 0.38, 0.32), vec3(0.45, 0.90, 0.50), 0.2 + 0.8*dif);
  vec2 sq = q/0.38; vec2 si = floor(sq);
  float spot = fill(length(fract(sq) - 0.5 - 0.3*(h22(ivec2(si)) - 0.5)) - 0.13, 0.08)*step(0.6, h21(ivec2(si) + 9));
  c *= 1.0 - 0.16*spot;
  c += vec3(0.8, 1.0, 0.8)*pow(max(dot(n, HDIR), 0.0), 18.0)*0.35;
  c *= 1.0 - 0.4*smoothstep(0.78, 1.0, s);
  vec4 res = vec4(vec3(0.3, 1.0, 0.5)*0.16*exp(-max(sd, 0.0)*3.5)*(1.0 - cov), 0.0);
  res = over(pm(vec3(0.30, 0.62, 0.42), fl*0.8), res);
  res = over(pm(c, cov), res);
  if(faceMix > 0.0) res = over(face(ps + rot(vec2(0.0, kb*HL*HL/3.0 + 0.075*sin(t*4.6)), ang) - look*0.07, aw, 2, look, 0.0, 0.0, 2.3, c)*(faceMix*cov), res);
  if((flags & 4) != 0) res.rgb += vec3(0.6)*cov;
  return res;
}

vec4 drawSite(vec2 pb, float aw, float ph, float hp, int flags, float st, float emit, float ang){
  // elongated along the wall tangent (angle) by stretch; e2 = emission pulse
  float t = uTime + ph;
  float pulse = max(0.5 + 0.5*sin(t*3.2), clamp(emit, 0.0, 1.0));
  float br = 1.0 + 0.04*sin(t*1.6) + 0.018*sin(t*2.7 + 1.0) + 0.03*pulse;       // the lesion breathes and swells
  vec2 ps = rot(vec2(pb.x/st, pb.y), ang)/br;
  float rho = length(ps), phi = atan(ps.y, ps.x);
  float R = 1.0 + 0.06*sin(5.0*phi + ph*3.0 + 0.5*sin(t*0.7)) + 0.045*sin(9.0*phi + ph*5.0 + t*0.4) + 0.02*sin(17.0*phi + ph - t*0.9);
  float x = rho/R;
  float cov = 1.0 - smoothstep(0.86, 1.02, x);
  vec2 dir = ps/max(rho, 1e-4);
  // height profile: swollen inflamed ring (peak ~0.78), crater lip, pus dome in the middle
  float Rp = 0.52*(1.0 + 0.11*pulse);                                   // the pus dome bulges on each throb
  float xp = rho/Rp;
  float ring = exp(-pow((x - 0.8)/0.2, 2.0));
  float dring = -2.0*(x - 0.8)/0.04*ring;
  float dome = sqrt(max(1.0 - xp*xp, 0.0));
  vec2 slope = dir*(0.35*dring/R);
  if(xp < 1.0) slope = dir*xp/max(dome, 0.12)*(0.75 + 0.35*pulse);
  vec3 n = normalize(vec3(-slope, 1.0));
  float dif = max(dot(n, LDIR), 0.0);
  vec3 swell = mix(vec3(0.34, 0.06, 0.12), vec3(0.72, 0.24, 0.26), ring);
  vec3 c = swell;
  float lip = smoothstep(0.62, 0.7, x/Rp*0.52/0.52*Rp/R*R) ;
  float pusM = fill(xp - 1.0, aw*1.5/Rp);
  vec3 pus = mix(vec3(0.55, 0.70, 0.12), vec3(0.90, 1.0, 0.45), 0.3 + 0.7*dif);
  vec2 bq = ps/0.13 + vec2(0.0, -t*0.2); vec2 bi = floor(bq);
  float bub = fill(length(fract(bq) - 0.5 - 0.3*(h22(ivec2(bi)) - 0.5)) - 0.18 - 0.1*sin(t*2.0 + h21(ivec2(bi))*6.0), 0.06)*step(0.55, h21(ivec2(bi) + 5));
  pus = mix(pus, vec3(0.98, 1.0, 0.7), 0.35*bub);
  c = c*(0.35 + 0.85*dif);
  // crusty yellow lip around the pus
  float lipM = exp(-pow((xp - 1.08)/0.12, 2.0));
  c = mix(c, vec3(0.86, 0.70, 0.40)*(0.5 + 0.7*dif), 0.8*lipM);
  c = mix(c, pus, pusM);
  c += vec3(1.0, 1.0, 0.85)*pow(max(dot(n, HDIR), 0.0), 30.0)*0.5*(0.4 + 0.6*pusM);
  c *= 1.0 - 0.45*smoothstep(0.85, 1.0, x);
  vec4 res = vec4(vec3(0.7, 1.0, 0.25)*(0.14 + 0.2*pulse)*exp(-max(x - 1.0, 0.0)*4.0)*(1.0 - cov), 0.0);
  res = over(pm(c, cov), res);
  res.rgb += vec3(0.6, 1.0, 0.25)*0.22*pulse*pusM;
  // HP ring
  float a = atan(ps.x, -ps.y);
  float u = fract(a/6.2831853 + 1.0);
  float rg = fill(abs(rho - 1.3) - 0.045, aw);
  vec3 hc = mix(vec3(1.0, 0.28, 0.15), vec3(0.78, 1.0, 0.25), clamp(hp, 0.0, 1.0));
  res = over(pm(vec3(0.06, 0.02, 0.03), 0.6*fill(abs(rho - 1.3) - 0.065, aw)), res);
  res = over(pm(hc, rg*step(u, clamp(hp, 0.0, 1.0))), res);
  if((flags & 33) != 0) res = over(pm(vec3(1.0), 0.6*fill(abs(rho - 1.45) - 0.02, aw)), res);
  return res;
}

vec4 drawAntibody(vec2 pb, float aw){
  float d = sdSeg(pb, vec2(-0.7, 0.0), vec2(0.0, 0.0));
  d = min(d, sdSeg(pb, vec2(0.0, 0.0), vec2(0.55, -0.42)));
  d = min(d, sdSeg(pb, vec2(0.0, 0.0), vec2(0.55, 0.42)));
  d -= 0.1;
  vec4 res = vec4(vec3(0.8, 0.85, 1.0)*0.4*exp(-max(d, 0.0)*9.0), 0.0);
  return over(pm(vec3(0.95, 0.93, 1.0), fill(d, aw)*0.95), res);
}

vec4 drawFX(vec2 ps, float aw, float life, float tint){
  float k = 1.0 - clamp(life, 0.0, 1.0);
  vec3 c = tint < 0.33 ? vec3(0.6, 0.95, 1.0) : tint < 0.66 ? vec3(0.7, 1.0, 0.4) : vec3(1.0, 0.65, 0.2);
  float rr = 0.35 + 1.5*k;
  float ring = exp(-abs(length(ps) - rr)*mix(14.0, 5.0, k));
  float phi = atan(ps.y, ps.x);
  float spark = pow(max(cos(phi*8.0), 0.0), 16.0)*exp(-abs(length(ps) - rr*1.2)*6.0);
  float a = (ring + spark)*life;
  return vec4(c*a, a*0.3);
}

vec4 drawIcon(int type, int flags, vec2 ps, float aw, float ph){
  vec3 c = type == 0 ? ((flags & 1) != 0 ? vec3(0.35, 0.95, 1.0) : vec3(0.93, 0.9, 1.0))
         : type == 1 ? vec3(1.0, 0.55, 0.12) : type == 2 ? vec3(0.35, 0.92, 0.45)
         : type == 3 ? vec3(0.75, 1.0, 0.25) : vec3(0.95);
  float d = length(ps);
  if(type == 3){
    float pulse = 0.5 + 0.5*sin(uTime*3.2 + ph);
    float ring = fill(abs(d - 0.8) - 0.12, aw);
    return vec4(c*(ring + 0.4*(0.5 + pulse)*exp(-abs(d - 0.8)*3.0)), ring);
  }
  float rad = 0.8;
  float core = fill(d - rad, aw);
  vec3 col = mix(c, vec3(1.0), 0.45*(1.0 - smoothstep(0.0, rad, d)));
  vec4 res = vec4(c*0.32*exp(-max(d - rad, 0.0)*1.9)*(1.0 - core), 0.0);
  return over(pm(col, core), res);
}

void main(){
  float rpx = vA.x, rcss = vA.y;
  int type = int(vA.z + 0.5), flags = int(vA.w + 0.5);
  float ang = vB.x, ph = vB.y, hp = vB.z, st = vB.w;
  vec2 look = vC.xy; float tint = vC.z, icon = vC.w;
  vec2 pb = vP, ps = rot(pb, ang);
  float aw = 1.0/max(rpx, 1.0);
  float jig = (flags & 8) != 0 ? 0.0 : clamp(vD.x, 0.0, 1.0);      // e0: jiggle impulse (fade-out progress while dying)
  vec4 res = vec4(0.0);
  if(uPass == 0){
    // soft contact shadow on the back wall
    vec2 q = type == 2 ? vec2(max(abs(pb.x) - max(st - 1.0, 0.0), 0.0), pb.y) : vec2(pb.x/st, pb.y*(type == 0 ? sqrt(st) : 1.0));
    float d = length(q) - (type == 2 ? 0.95 : 0.8);
    float a = (1.0 - smoothstep(-0.25, 0.55, d))*((flags & 16) != 0 ? 0.42 : 0.3)*(1.0 - icon);
    res = vec4(0.0, 0.0, 0.0, a);
  } else if(uPass == 2){
    res = drawRing(type, pb, aw, st, ph, flags, vD.z, jig)*(1.0 - icon);
  } else {
    float faceMix = type == 0 ? smoothstep(13.0, 19.0, rcss) : smoothstep(9.0, 14.0, rcss);
    if(icon < 1.0){
      if(type == 0) res = drawWBC(pb, ang, aw, st, ph, flags, hp, look, tint, vD.y, faceMix, vD.z, jig);
      else if(type == 1) res = drawVirus(pb, ps, aw, ph, look, faceMix, flags);
      else if(type == 2) res = drawBacterium(pb, ps, aw, ph, look, faceMix, flags, ang, st, vD.y);
      else if(type == 3) res = drawSite(pb, aw, ph, hp, flags, st, vD.z, ang);
      else if(type == 4) res = drawAntibody(pb, aw);
      else res = drawFX(ps, aw, hp, tint);
    }
    if(icon > 0.0 && type != 5) res = mix(res, drawIcon(type, flags, ps, aw, ph), icon);
  }
  if((flags & 8) != 0) res *= clamp(1.0 - vD.x, 0.0, 1.0)*0.85;   // e0: fade-out while dying
  res *= clamp(vD.w, 0.0, 1.0);                                        // e3: fade-in alpha (spawn)
  o = res;
}`;

// ---------------------------------------------------------------------------
//  helpers
// ---------------------------------------------------------------------------
// arterial pulse wave: the world shader looks the wall's dilation up in a table of PT_N delays
// spanning 0 … 1.6 × PT_DELAY s (PT_DELAY = the time the wave needs to cross the arterial tree)
const PT_N = 32, PT_DELAY = 0.34;
const PT_TAU = 0.1, PT_DT = 1/60, PT_K = 30;          // wall recoil time constant; response filter step, taps
const PT_M = Math.ceil(1.6*PT_DELAY/PT_DT) + PT_K + 2;
function compile(gl, type, src, name){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src); gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
    const log = gl.getShaderInfoLog(sh);
    const lines = src.split('\n').map((l,i)=>(i+1)+': '+l).join('\n');
    gl.deleteShader(sh);
    throw new Error('[render] '+name+' shader: '+log+'\n'+lines);
  }
  return sh;
}
function program(gl, vs, fs, name){
  const p = gl.createProgram();
  const a = compile(gl, gl.VERTEX_SHADER, vs, name+'.vs'), b = compile(gl, gl.FRAGMENT_SHADER, fs, name+'.fs');
  gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p);
  gl.deleteShader(a); gl.deleteShader(b);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('[render] '+name+' link: '+gl.getProgramInfoLog(p));
  const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for(let i=0;i<n;i++){ const info = gl.getActiveUniform(p, i); u[info.name.replace(/\[0\]$/,'')] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}
function floatTex(gl, w, h, ifmt, fmt, data){
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, gl.FLOAT, data);
  return t;
}

// bounding circle of a quadratic Bézier (centre of its exact AABB, radius from samples + margin)
function bezBound(b){
  const ext = (a, c, e) => {        // extrema of a quadratic in one coordinate
    let lo = Math.min(a, e), hi = Math.max(a, e);
    const den = a - 2*c + e;
    if(Math.abs(den) > 1e-9){ const t = (a - c)/den; if(t > 0 && t < 1){ const u = 1-t, v = u*u*a + 2*u*t*c + t*t*e; lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    return [lo, hi];
  };
  const X = ext(b.ax, b.bx, b.cx), Y = ext(b.ay, b.by, b.cy);
  const cx = (X[0]+X[1])/2, cy = (Y[0]+Y[1])/2;
  let R = 0;
  for(let i=0;i<=32;i++){
    const t = i/32, u = 1-t;
    const x = u*u*b.ax + 2*u*t*b.bx + t*t*b.cx, y = u*u*b.ay + 2*u*t*b.by + t*t*b.cy;
    R = Math.max(R, Math.hypot(x-cx, y-cy));
  }
  const chord = Math.hypot(b.cx-b.ax, b.cy-b.ay) + Math.hypot(b.bx-b.ax, b.by-b.ay);
  return [cx, cy, R + 0.004*chord + 0.5];
}

// per-entry acceleration lists, parallel to net.gpu.listData (same offsets and counts)
function buildLists(net){
  const G = net.grid, B = net.beziers, gpu = net.gpu;
  const LW = gpu.listW, rows = gpu.listRows;
  const bound = B.map(bezBound);
  const L4 = new Float32Array(LW*rows*4), LI = new Float32Array(LW*rows);
  let off = 0, total = 0;
  for(let c=0;c<G.cells.length;c++){
    const list = G.cells[c];
    const gx = c % G.w, gy = (c / G.w) | 0;
    const px = G.ox + (gx+0.5)*G.cs, py = G.oy + (gy+0.5)*G.cs;
    // group by chain, order Béziers nearest-first inside a group and groups nearest-first
    const groups = new Map();
    for(const bi of list){
      const ch = B[bi].chain, bb = bound[bi];
      const d = Math.max(0, Math.hypot(bb[0]-px, bb[1]-py) - bb[2]) / Math.max(B[bi].r0, B[bi].r2);
      if(!groups.has(ch)) groups.set(ch, []);
      groups.get(ch).push([d, bi]);
    }
    const ordered = [...groups.values()].map(g=>{ g.sort((p,q)=>p[0]-q[0] || p[1]-q[1]); return g; });
    ordered.sort((p,q)=>p[0][0]-q[0][0] || p[0][1]-q[0][1]);
    const o0 = gpu.cellData[c*2];
    if(o0 !== off) off = o0;          // (always equal: same packing order as net.js)
    for(const g of ordered){
      g.forEach(([d, bi], k)=>{
        const b = B[bi], bb = bound[bi], rmax = Math.max(b.r0, b.r2);
        L4[off*4] = bb[0]; L4[off*4+1] = bb[1]; L4[off*4+2] = bb[2]; L4[off*4+3] = k === 0 ? -rmax : rmax;
        LI[off] = bi; off++; total++;
      });
    }
  }
  return { L4, LI, LW, rows, total };
}

// per-Bézier wobble data, parallel to net.gpu.segData (1 texel per Bézier, same width):
// (arc in local radii at both ends, pressure at both ends). Arc in radii (∫ ds / r along the
// chain) gives every vessel the same number of wall waves per diameter, however it tapers.
function buildSegX(net){
  const B = net.beziers, W = net.gpu.segW, rows = Math.max(1, Math.ceil(B.length/W));
  const X = new Float32Array(W*rows*4);
  const phiOf = new Map();
  for(const ch of net.chains){
    const n = ch.X.length, F = new Float64Array(n);
    for(let i=1;i<n;i++) F[i] = F[i-1] + (ch.cum[i] - ch.cum[i-1])/Math.max(1, 0.5*(ch.R[i] + ch.R[i-1]));
    phiOf.set(ch.id, s => {
      const c = ch.cum; if(s <= 0) return F[0] + s/ch.R[0]; if(s >= ch.len) return F[n-1] + (s - ch.len)/ch.R[n-1];
      let lo = 0, hi = n-1; while(hi-lo > 1){ const m = (lo+hi)>>1; if(c[m] <= s) lo = m; else hi = m; }
      return F[lo] + (F[hi] - F[lo])*(s - c[lo])/Math.max(1e-9, c[hi] - c[lo]);
    });
  }
  // pressure: net.js (bezier.p0/p2); a net without it falls back to the vessel kind
  let pArt = 1;
  B.forEach((b, i)=>{
    const f = phiOf.get(b.chain);
    const p0 = b.p0 != null ? b.p0 : 1 - 0.5*b.k0, p2 = b.p2 != null ? b.p2 : 1 - 0.5*b.k2;
    X[i*4] = f ? f(b.s0) : b.s0/Math.max(1, b.r0); X[i*4+1] = f ? f(b.s2) : b.s2/Math.max(1, b.r2);
    X[i*4+2] = p0; X[i*4+3] = p2;
    if(b.k0 < 0.5 && b.k2 < 0.5) pArt = Math.min(pArt, p0, p2);
  });
  return { X, W, rows, pArt: Math.min(0.9, pArt) };
}

// ---------------------------------------------------------------------------
//  createRenderer
// ---------------------------------------------------------------------------
BV.createRenderer = function(canvas, net, opts){
  opts = opts || {};
  const gl = canvas.getContext('webgl2', { alpha:false, antialias:false, depth:false, stencil:false,
    premultipliedAlpha:false, preserveDrawingBuffer: !!opts.preserveDrawingBuffer, powerPreference:'high-performance' });
  if(!gl) throw new Error('WebGL2 is not available');
  const CONST = BV.CONST;
  const quality = { scale: 1, dof: true, fgCells: true, debug: 0 };
  let dpr = 1;
  let lastT = null, tauP = 0;
  const st = { drawCalls: 0, instances: 0, gpuMs: undefined, fgCells: 0 };

  // ---- GPU resources (re-created after a lost context) ---------------------
  let quad, emptyVAO, rbcBuf, fgBuf, unitBuf, rbcVAO, fgVAO, unitVAO, rbcProg, unitProg, blitProg;
  let W = null;                     // world pass: program + network textures
  let lists = null;                 // CPU-side acceleration lists for the current net
  let segX = null;                  // per-Bézier wobble data for the current net
  let fbo = null, fboTex = null, fboW = 0, fboH = 0;
  let tq = null, queries = [];
  let lost = false;

  const bufCap = new Map();
  function upload(buf, arr){                 // orphan-free streaming: grow rarely, sub-update every frame
    const bytes = arr.byteLength, cap = bufCap.get(buf) || 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    if(bytes > cap){ const nc = Math.max(bytes, Math.ceil(cap*1.5), 65536); gl.bufferData(gl.ARRAY_BUFFER, nc, gl.DYNAMIC_DRAW); bufCap.set(buf, nc); }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, arr);
  }
  function instVAO(buf, stride, nAttr){
    const v = gl.createVertexArray();
    gl.bindVertexArray(v);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    for(let i=0;i<nAttr;i++){
      gl.enableVertexAttribArray(1+i); gl.vertexAttribPointer(1+i, 4, gl.FLOAT, false, stride, i*16); gl.vertexAttribDivisor(1+i, 1);
    }
    gl.bindVertexArray(null);
    return v;
  }
  function uploadNet(){
    const g = net.gpu;
    if(W && W.tex) for(const t of W.tex) gl.deleteTexture(t);
    const maxl = Math.min(1024, Math.max(16, Math.ceil(g.maxList/16)*16));
    if(g.maxList > 1024) console.warn('[render] a grid cell lists '+g.maxList+' Béziers; only the first 1024 are evaluated');
    const tex = [
      floatTex(gl, g.segW, g.segRows, gl.RGBA32F, gl.RGBA, g.segData),
      floatTex(gl, g.gridW, g.gridH, gl.RG32F, gl.RG, g.cellData),
      floatTex(gl, lists.LW, lists.rows, gl.RGBA32F, gl.RGBA, lists.L4),
      floatTex(gl, lists.LW, lists.rows, gl.R32F, gl.RED, lists.LI),
      floatTex(gl, segX.W, segX.rows, gl.RGBA32F, gl.RGBA, segX.X),
    ];
    if(!W || !W.prog || W.maxl !== maxl){
      if(W && W.prog) gl.deleteProgram(W.prog.p);
      const src = WORLD_FS.replace('__PTN__', String(PT_N)).replace('__MAXL__', String(maxl)).replace('__SEGW__', String(g.segW)).replace('__LISTW__', String(lists.LW))
        .replace('__K__', CONST.K_SMIN.toFixed(6)).replace('__W0__', CONST.WALL[0].toFixed(6)).replace('__W1__', CONST.WALL[1].toFixed(6)).replace('__W2__', CONST.WALL[2].toFixed(6));
      W = { prog: program(gl, WORLD_VS, src, 'world'), maxl };
    }
    W.tex = tex; W.listEntries = lists.total;
  }
  function initGL(){
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    emptyVAO = gl.createVertexArray();
    rbcBuf = gl.createBuffer(); fgBuf = gl.createBuffer(); unitBuf = gl.createBuffer(); bufCap.clear();
    rbcVAO = instVAO(rbcBuf, 32, 2); fgVAO = instVAO(fgBuf, 32, 2); unitVAO = instVAO(unitBuf, 64, 4);
    rbcProg = program(gl, RBC_VS, RBC_FS, 'rbc');
    unitProg = program(gl, UNIT_VS, UNIT_FS, 'unit');
    blitProg = program(gl, WORLD_VS, BLIT_FS, 'blit');
    W = null; fbo = null; fboTex = null; fboW = fboH = 0;
    tq = gl.getExtension('EXT_disjoint_timer_query_webgl2'); queries = [];
    uploadNet();
  }
  function setNet(n){
    net = n;
    lists = buildLists(net); segX = buildSegX(net);
    if(!lost) uploadNet();
  }
  lists = buildLists(net); segX = buildSegX(net);
  initGL();
  const onLost = e => { e.preventDefault(); lost = true; };
  const onRestored = () => { lost = false; initGL(); };
  canvas.addEventListener('webglcontextlost', onLost, false);
  canvas.addEventListener('webglcontextrestored', onRestored, false);

  // ---- offscreen target for reduced-resolution world rendering -------------
  function ensureFbo(w, h){
    if(fbo && fboW === w && fboH === h) return;
    if(!fbo){ fbo = gl.createFramebuffer(); fboTex = gl.createTexture(); }
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
    fboW = w; fboH = h;
  }

  // ---- GPU timer (optional; EXT_disjoint_timer_query_webgl2) ---------------
  function pollQueries(){
    while(queries.length){
      const q = queries[0];
      if(!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break;
      if(!gl.getParameter(tq.GPU_DISJOINT_EXT)) st.gpuMs = gl.getQueryParameter(q, gl.QUERY_RESULT)/1e6;
      gl.deleteQuery(q); queries.shift();
    }
  }

  // ---- arterial pulse wave -------------------------------------------------
  // The wall's dilation follows the heart low-passed (fast rise, slower recoil). frame.pulse is
  // recorded per frame; times the record does not cover (the first frames, single test frames,
  // a jump in time) use BV.heart at CONST.BPM / opts.bpm (66 by default, as the simulation).
  const bpm = opts.bpm || CONST.BPM || 66;
  const HN = 512, hT = new Float64Array(HN), hP = new Float32Array(HN);
  let hN = 0, hHead = 0;
  const hIdx = j => (hHead - 1 - j + 2*HN) % HN;       // j steps back from the newest entry
  const heart = t => BV.heart ? BV.heart(t, bpm) : 0;
  const ptU = new Float32Array(PT_M + 1), ptab = new Float32Array(PT_N);
  const ptW = new Float32Array(PT_K); let ptWs = 0;
  for(let k=0;k<PT_K;k++){ ptW[k] = Math.exp(-k*PT_DT/PT_TAU); ptWs += ptW[k]; }
  let ptNorm = 1;
  { // normalise the response to peak at 1 over a beat of the analytic heart
    let mx = 1e-6; const per = 60/bpm;
    for(let i=0;i<120;i++){ const t = 5*per + i*per/120; let a = 0; for(let k=0;k<PT_K;k++) a += ptW[k]*heart(t - k*PT_DT); mx = Math.max(mx, a/ptWs); }
    ptNorm = 1/mx;
  }
  function pulseTable(t, pulse){
    if(pulse != null && isFinite(pulse)){
      const last = hN ? hT[hIdx(0)] : -1e9;
      if(hN && t < last - 1e-6) hN = 0;                      // time went back (new map / reset)
      if(hN && Math.abs(t - last) < 1e-6) hP[hIdx(0)] = pulse;
      else { hT[hHead] = t; hP[hHead] = pulse; hHead = (hHead + 1) % HN; hN = Math.min(HN, hN + 1); }
    }
    // resample the pulse at t, t − dt, t − 2dt, …
    let j = 0;
    for(let m=0;m<=PT_M;m++){
      const tau = t - m*PT_DT;
      while(j < hN - 1 && hT[hIdx(j)] > tau) j++;
      let v = null;
      if(hN && hT[hIdx(j)] <= tau + 1e-9){
        if(j === 0) v = hP[hIdx(0)];
        else { const a = hIdx(j), b = hIdx(j - 1), ta = hT[a], tb = hT[b];
          if(tb - ta < 0.07) v = hP[a] + (hP[b] - hP[a])*(tau - ta)/Math.max(1e-9, tb - ta); }
      }
      ptU[m] = v == null ? heart(tau) : v;
    }
    for(let i=0;i<PT_N;i++){
      const d = i*1.6*PT_DELAY/(PT_N - 1)/PT_DT;              // delay in resample steps
      const d0 = Math.floor(d), f = d - d0;
      let a = 0;
      for(let k=0;k<PT_K;k++){ const m = d0 + k; a += ptW[k]*(ptU[m] + (ptU[m + 1] - ptU[m])*f); }
      ptab[i] = Math.min(1.2, a/ptWs*ptNorm);
    }
  }

  // ---- world pass ----------------------------------------------------------
  function drawWorld(frame, rw, rh, ppuX, ppuY, debug){
    const P = W.prog, u = P.u, g = net.gpu, cam = frame.cam;
    gl.useProgram(P.p);
    gl.bindVertexArray(emptyVAO);
    for(let i=0;i<5;i++){ gl.activeTexture(gl.TEXTURE0+i); gl.bindTexture(gl.TEXTURE_2D, W.tex[i]); }
    gl.uniform1i(u.uSeg, 0); gl.uniform1i(u.uCell, 1); gl.uniform1i(u.uList, 2); gl.uniform1i(u.uLidx, 3); gl.uniform1i(u.uSegX, 4);
    gl.uniform2f(u.uWave, 1/(1 - segX.pArt), (PT_N - 1)/1.6);
    gl.uniform1fv(u.uPT, ptab);
    gl.uniform2i(u.uGridN, g.gridW, g.gridH);
    gl.uniform2f(u.uGridO, g.originX, g.originY);
    gl.uniform1f(u.uCellSize, g.cellSize);
    gl.uniform2f(u.uCam, cam.x, cam.y);
    gl.uniform2f(u.uRes, rw, rh);
    gl.uniform2f(u.uPPU, ppuX, ppuY);
    gl.uniform1f(u.uZ, cam.z);
    gl.uniform1f(u.uTime, frame.time || 0);
    gl.uniform1f(u.uPulse, frame.pulse || 0);
    gl.uniform1f(u.uLOD, frame.rbcLOD == null ? 1 : frame.rbcLOD);
    gl.uniform1f(u.uTauP, tauP);
    const b = net.bounds;
    gl.uniform4f(u.uBounds, b.x0, b.y0, b.x1, b.y1);
    gl.uniform1i(u.uDebug, debug|0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    st.drawCalls++;
  }

  // ---- red cells: depth bucket sort (far first) + foreground split ---------
  let sortBuf = new Float32Array(0), fgArr = new Float32Array(0);
  const bucketN = 16, counts = new Int32Array(bucketN), starts = new Int32Array(bucketN);
  // Far cells are bucket-sorted by depth (far → near). The nearest cells (depth band below ~0.06:
  // about 1.5 % of a uniform 0..1 spread) are also drawn as the sparse foreground layer. The choice
  // depends on depth only (stable per cell, whatever the buffer order) and is cross-faded, so no pop.
  const fgW = d => 1 - Math.min(1, Math.max(0, (d - 0.055)/0.013));
  function prepRBC(src, n, fgOn, units){
    if(sortBuf.length < n*8) sortBuf = new Float32Array(Math.ceil(n*1.25)*8);
    if(fgArr.length < 64*8) fgArr = new Float32Array(64*8);
    counts.fill(0);
    const bucketOf = d => bucketN - 1 - Math.min(bucketN-1, Math.max(0, (d*bucketN)|0));
    for(let i=0;i<n;i++) counts[bucketOf(src[i*8+3])]++;
    let acc = 0; for(let k=0;k<bucketN;k++){ starts[k] = acc; acc += counts[k]; }
    let nfg = 0;
    for(let i=0;i<n;i++){
      const s = i*8, d = src[s+3];
      const o = (starts[bucketOf(d)]++)*8;
      for(let j=0;j<8;j++) sortBuf[o+j] = src[s+j];
      const w = fgOn ? fgW(d) : 0;
      if(w <= 0.001) continue;
      sortBuf[o+7] *= 1 - w;                      // far copy fades out as the foreground copy fades in
      if(nfg >= 64) continue;
      // foreground copy, faded out near any unit (never over a face)
      const x = src[s], y = src[s+1], r = src[s+2]*2.6*1.5;
      let a = w;
      if(units && units.count){
        const U = units.data;
        for(let k=0;k<units.count;k++){
          const q = k*16, ur = U[q+2]*1.9;
          const dd = Math.hypot(U[q]-x, U[q+1]-y) - ur - r;
          if(dd < r){ a = Math.min(a, w*Math.max(0, dd/r)); if(a <= 0) break; }
        }
      }
      if(a <= 0.01) continue;
      for(let j=0;j<8;j++) fgArr[nfg*8+j] = src[s+j];
      fgArr[nfg*8+7] *= a; nfg++;
    }
    return { n: acc, nfg };
  }

  function drawRBC(vao, buf, data, n, frame, fg){
    const P = rbcProg, u = P.u, cam = frame.cam;
    upload(buf, data.subarray(0, n*8));
    gl.useProgram(P.p);
    gl.bindVertexArray(vao);
    gl.uniform2f(u.uCam, cam.x, cam.y);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uPPU, cam.z*dpr);
    gl.uniform1f(u.uLOD, frame.rbcLOD == null ? 1 : frame.rbcLOD);
    gl.uniform1f(u.uDof, quality.dof ? 1 : 0);
    gl.uniform1f(u.uFG, fg ? 1 : 0);
    gl.uniform1f(u.uTime, frame.time || 0);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    st.drawCalls++; st.instances += n;
  }

  function drawUnits(frame){
    const units = frame.units, P = unitProg, u = P.u, cam = frame.cam;
    upload(unitBuf, units.data.subarray(0, units.count*16));
    gl.useProgram(P.p);
    gl.bindVertexArray(unitVAO);
    gl.uniform2f(u.uCam, cam.x, cam.y);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uPPU, cam.z*dpr);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform1f(u.uTime, frame.time || 0);
    for(let pass=0; pass<5; pass++){      // shadows, sites, selection rings, bodies, FX
      gl.uniform1i(u.uPass, pass);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, units.count);
      st.drawCalls++;
    }
    st.instances += units.count;
  }

  // ---- public API ----------------------------------------------------------
  function resize(w, h, d){
    dpr = d || 1;
    const pw = Math.max(1, Math.round(w*dpr)), ph = Math.max(1, Math.round(h*dpr));
    if(canvas.width !== pw) canvas.width = pw;
    if(canvas.height !== ph) canvas.height = ph;
  }

  function render(frame){
    if(lost || gl.isContextLost()) return;
    const Wd = canvas.width, Hd = canvas.height, cam = frame.cam;
    const t = frame.time || 0;
    if(lastT === null) lastT = t;
    let dt = t - lastT; if(!(dt >= 0 && dt < 0.25)) dt = 0; lastT = t;
    tauP += dt*(frame.pulse || 0);
    pulseTable(t, frame.pulse);
    st.drawCalls = 0; st.instances = 0;
    if(tq){ pollQueries(); }
    let q = null;
    if(tq && queries.length < 4){ q = gl.createQuery(); gl.beginQuery(tq.TIME_ELAPSED_EXT, q); }

    gl.disable(gl.BLEND);
    const ppu = cam.z*dpr, sc = Math.max(0.25, Math.min(1, quality.scale));
    if(sc < 0.999){
      const w = Math.max(1, Math.round(Wd*sc)), h = Math.max(1, Math.round(Hd*sc));
      ensureFbo(w, h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, w, h);
      drawWorld(frame, w, h, ppu*w/Wd, ppu*h/Hd, quality.debug);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, Wd, Hd);
      gl.useProgram(blitProg.p);
      gl.bindVertexArray(emptyVAO);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboTex);
      gl.uniform1i(blitProg.u.uTex, 0); gl.uniform2f(blitProg.u.uRes, Wd, Hd);
      gl.drawArrays(gl.TRIANGLES, 0, 3); st.drawCalls++;
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, Wd, Hd);
      drawWorld(frame, Wd, Hd, ppu, ppu, quality.debug);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const lod = frame.rbcLOD == null ? 1 : frame.rbcLOD;
    let fgN = 0;
    if(frame.rbc && frame.rbc.count > 0 && lod > 0){
      const fgOn = quality.fgCells && cam.z > 0.55*CONST.MAX_ZOOM;
      const r = prepRBC(frame.rbc.data, frame.rbc.count, fgOn, frame.units);
      if(r.n) drawRBC(rbcVAO, rbcBuf, sortBuf, r.n, frame, false);
      fgN = r.nfg;
      st.fgCells = fgN;
    }
    if(frame.units && frame.units.count > 0) drawUnits(frame);
    if(fgN) drawRBC(fgVAO, fgBuf, fgArr, fgN, frame, true);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
    if(q){ gl.endQuery(tq.TIME_ELAPSED_EXT); queries.push(q); }
  }

  // debug: average number of Béziers fully evaluated / list entries visited per pixel
  function measure(frame, w, h){
    w = w || Math.min(canvas.width, 800); h = h || Math.round(w*canvas.height/canvas.width);
    const f = gl.createFramebuffer(), t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.viewport(0, 0, w, h);
    gl.disable(gl.BLEND);
    const ppu = frame.cam.z*dpr*w/canvas.width;
    drawWorld(frame, w, h, ppu, ppu, 1);
    const px = new Uint8Array(w*h*4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(f); gl.deleteTexture(t);
    let sF = 0, sV = 0, mF = 0, mV = 0; const hist = new Int32Array(64);
    for(let i=0;i<w*h;i++){ const a = px[i*4], b = px[i*4+1]; sF += a; sV += b; mF = Math.max(mF, a); mV = Math.max(mV, b); hist[Math.min(63, a)]++; }
    let c = 0, p95 = 0; for(let k=0;k<64;k++){ c += hist[k]; if(c >= 0.95*w*h){ p95 = k; break; } }
    return { avgFull: sF/(w*h), avgVisited: sV/(w*h), maxFull: mF, maxVisited: mV, p95Full: p95, pixels: w*h };
  }

  return {
    gl,
    resize, render, measure, setNet,
    setQuality(q){ if(!q) return; if(q.scale != null) quality.scale = +q.scale; if(q.dof != null) quality.dof = !!q.dof; if(q.fgCells != null) quality.fgCells = !!q.fgCells; if(q.debug != null) quality.debug = q.debug|0; },
    stats(){ return { gpuMs: st.gpuMs, drawCalls: st.drawCalls, instances: st.instances, fgCells: st.fgCells, scale: quality.scale, listEntries: W.listEntries, maxList: net.gpu.maxList }; },
    destroy(){
      canvas.removeEventListener('webglcontextlost', onLost, false);
      canvas.removeEventListener('webglcontextrestored', onRestored, false);
      if(lost || gl.isContextLost()) return;
      for(const t of W.tex) gl.deleteTexture(t);
      gl.deleteProgram(W.prog.p); gl.deleteProgram(rbcProg.p); gl.deleteProgram(unitProg.p); gl.deleteProgram(blitProg.p);
      for(const b of [quad, rbcBuf, fgBuf, unitBuf]) gl.deleteBuffer(b);
      for(const v of [emptyVAO, rbcVAO, fgVAO, unitVAO]) gl.deleteVertexArray(v);
      if(fbo){ gl.deleteFramebuffer(fbo); gl.deleteTexture(fboTex); }
      for(const q of queries) gl.deleteQuery(q);
    },
  };
};
})();
