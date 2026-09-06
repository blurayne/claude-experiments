// The whole of galactic-transit.html's script, moved here verbatim and not yet split.
//
// Step 1 of the migration (docs/refactor/inventory/00-PLAN.md §4) changes exactly one thing:
// a classic <script> at the end of <body> becomes a deferred ES module. Nothing is
// reordered, renamed or reformatted, so that if the parity gate reddens here it can only be
// the module semantics — top-level scope no longer being global, and the script running
// after parsing rather than at its position in the document. That is the single largest
// risk in the migration and it gets a commit to itself.
//
// @ts-nocheck is temporary and shrinks with every extraction: as each module moves out into
// src/core, src/astro, src/gpu and the rest it is typed properly, and this file gets smaller
// until the directive can go. It is not a licence to leave anything untyped — it is the
// scaffolding that lets the move happen in reviewable steps instead of one unreadable diff.
// @ts-nocheck
// Semantic version: minor for a feature set, patch for fixes. The date and commit are
// stamped in at build time by .github/scripts/build_site.py; opened straight from the
// working copy the placeholders survive and it reports itself as a dev build.
// ---------- the error log ----------
// A phone has no console to open, so on a touch device every error the page can see is
// kept and shown in the settings dialog's log tab. On a desktop nothing is collected:
// the browser's own console is better than anything this could render.
const TOUCH_DEV = (matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints|0) > 1)
                  && !matchMedia('(pointer: fine)').matches;
const errLog = [], ERR_MAX = 120;
function logErr(kind, msg, where){
  if(!TOUCH_DEV || !msg) return;
  const top = errLog[0];
  if(top && top.kind === kind && top.msg === msg && top.where === where){ top.n++; top.t = Date.now(); }
  else { errLog.unshift({ kind, msg: String(msg).slice(0, 400), where: where || '', t: Date.now(), n: 1 });
         if(errLog.length > ERR_MAX) errLog.pop(); }
  if(typeof renderLog === 'function') try{ renderLog(); }catch(e){}
}
if(TOUCH_DEV){
  addEventListener('error', e => {
    const t = e.target;
    if(t && t !== window && (t.src || t.href)) logErr('load', 'failed to load ' + String(t.src || t.href).split('/').pop(), t.tagName.toLowerCase());
    else logErr('error', e.message || String(e.error || 'error'), (e.filename||'').split('/').pop() + (e.lineno ? ':' + e.lineno : ''));
  }, true);   // capture: a failed <img> or <script> does not bubble
  addEventListener('unhandledrejection', e => {
    const r = e.reason; logErr('promise', (r && (r.message || r)) || 'promise rejected', '');
  });
  for(const k of ['error','warn']){
    const orig = console[k].bind(console);
    console[k] = (...a) => {
      try{ logErr(k, a.map(x => x instanceof Error ? (x.message || String(x))
                                : (x && typeof x === 'object') ? JSON.stringify(x).slice(0,200) : String(x)).join(' '), ''); }catch(e){}
      orig(...a);
    };
  }
}
const BUILD = { version: '2.78.0', date: '__BUILD_DATE__', time: '__BUILD_TIME__', sha: '__BUILD_SHA__' };
const VERSION = 'v' + BUILD.version;
// The stamp is written in UTC; show it in whatever zone the browser is in, and always
// name the offset — "+00:00" is information too, not an absence of it.
function localBuildStamp(){
  const d = new Date(BUILD.date + 'T' + BUILD.time + 'Z');
  if(isNaN(d.getTime())) return BUILD.date + ' ' + BUILD.time + ' +00:00';
  const pad = n => String(n).padStart(2, '0');
  // Prefer the zone's own abbreviation (CEST, PDT, IST...). Some locales only offer a
  // "GMT+2" style name; those fall through to a numeric UTC offset — and a zone at zero
  // says UTC±0 outright, because a zero offset is a fact, not a blank.
  let zone = '';
  try{
    const part = new Intl.DateTimeFormat(undefined, {timeZoneName:'short'})
      .formatToParts(d).find(q => q.type === 'timeZoneName');
    if(part && !/^(GMT|UTC)([+-−]|$)/.test(part.value)) zone = part.value;
  }catch(err){}
  if(!zone){
    const off = -d.getTimezoneOffset();
    zone = off === 0 ? 'UTC±0'
         : 'UTC' + (off < 0 ? '−' : '+') +
           pad(Math.floor(Math.abs(off)/60)) + ':' + pad(Math.abs(off)%60);
  }
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${zone}`;
}
const BUILD_LINE = BUILD.date.indexOf('__') === 0
  ? 'dev build'
  : localBuildStamp() + ' · ' + BUILD.sha;
// ---------- tiny mat4 ----------
function perspective(fov, asp, n, f){
  const t = 1/Math.tan(fov/2), m = new Float32Array(16);
  m[0]=t/asp; m[5]=t; m[10]=(f+n)/(n-f); m[11]=-1; m[14]=2*f*n/(n-f);
  return m;
}
function lookAt(eye, at, up){
  const zx=eye[0]-at[0], zy=eye[1]-at[1], zz=eye[2]-at[2];
  let zl=Math.hypot(zx,zy,zz)||1; const Z=[zx/zl,zy/zl,zz/zl];
  const X=[up[1]*Z[2]-up[2]*Z[1], up[2]*Z[0]-up[0]*Z[2], up[0]*Z[1]-up[1]*Z[0]];
  let xl=Math.hypot(...X)||1; X[0]/=xl;X[1]/=xl;X[2]/=xl;
  const Y=[Z[1]*X[2]-Z[2]*X[1], Z[2]*X[0]-Z[0]*X[2], Z[0]*X[1]-Z[1]*X[0]];
  return new Float32Array([
    X[0],Y[0],Z[0],0, X[1],Y[1],Z[1],0, X[2],Y[2],Z[2],0,
    -(X[0]*eye[0]+X[1]*eye[1]+X[2]*eye[2]),
    -(Y[0]*eye[0]+Y[1]*eye[1]+Y[2]*eye[2]),
    -(Z[0]*eye[0]+Z[1]*eye[1]+Z[2]*eye[2]),1]);
}
function mul(a,b){ // a*b, column-major
  const o=new Float32Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++){
    o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
  } return o;
}

// ---------- GL setup ----------
const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl2', {antialias:true, alpha:false});
if(!gl){ document.body.innerHTML = '<p style="padding:2em">WebGL2 is not available in this browser.</p>'; throw new Error('no webgl2'); }

function sh(type, src){
  const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function prog(vs,fs){
  const p=gl.createProgram();
  gl.attachShader(p,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

// glowing point sprites (stars, galaxy, bodies)
const PT_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aSize;
layout(location=2) in vec3 aColor;
layout(location=3) in float aWave; // 1: point rides the spiral density-wave pattern
layout(location=4) in vec3 aVel;   // heliocentric space velocity, km/s (real stars only)
uniform float uVelT;               // km/s -> scene displacement for the elapsed years
uniform mat4 uProj, uView;
uniform float uPx;
uniform float uSpin; // distance travelled at the flat-curve speed; 0 = no rotation
uniform float uWarp; // precession phase of the disk warp
uniform vec3 uSunPos; // center of the clearance bubble around the magnified solar system
uniform float uCap;   // sprite size ceiling (smaller at deep zoom: near stars stay point-like)
uniform float uWaveAll; // 1: treat every point in this draw as wave-riding (nebulae, dust)
uniform float uTime;    // wall-clock seconds for the variability animation
uniform float uVarMode; // 0 off | 1 stars (a few % pulse, reddening at minimum) | 2 nebulae (all breathe)
uniform vec3 uAnd;      // Andromeda's centre, galactic coordinates
uniform float uTide;    // 0 far apart .. 1 at contact
uniform float uWarpAmp; // how strongly this draw takes the disk warp
uniform float uMinB;    // brightness floor: lift the faintest stars to at least this
uniform float uMinSz;   // sprite floor in pixels: how small a star is allowed to get
uniform float uFadeOut; // 0 draws normally, 1 hides: used where a layer stops being true
uniform vec3 uOrg;    // rendering origin (the Sun) — keeps deep real-scale zooms float-precise
uniform float uGal;   // 1: this draw is a whole galaxy, placed by uGRot/uGOff
uniform mat3 uGRot;   // the galaxy's disk frame in scene coordinates (identity for ours)
uniform vec3 uGOff;   // the galaxy's centre (zero for ours)
uniform float uMerge; // 0 two galaxies .. 1 one relaxed remnant
out vec3 vColor;
void main(){
  vec3 p = aPos + aVel*uVelT;
  float fade = 1.0;
  if(uSpin != 0.0){
    float r = length(p.xz);
    // material stars: flat rotation curve, so they shear differentially. Wave-flagged
    // points (bar, arms, spur, gas, young stars) rigidly follow one pattern speed
    // instead — corotation at r=640 (~19 kly) — so stars stream through the arms
    // and the pattern never winds up: density-wave theory's answer to the winding problem.
    float w = max(aWave, uWaveAll);
    float d = mix(uSpin / max(r, 520.0), uSpin/640.0, w);
    float c = cos(d), s = sin(d);
    p = vec3(p.x*c + p.z*s, p.y, p.z*c - p.x*s);
    // Gaia-style warp: outer disk bends up on one side, down on the other,
    // and the whole pattern precesses retrograde (uWarp) like a wobbling top
    float wr = max(0.0, r - 950.0);
    p.y += uWarpAmp*(wr*0.13*sin(atan(p.x,p.z) - uWarp)  // integral-sign warp, growing outward
         + 4.0*sin(r*0.021));                            // faint corrugation ripples in the disk
    // the planetary system is drawn ~10-million-fold magnified; clear its space
    fade = smoothstep(80.0, 240.0, distance(p, uSunPos));
  }
  // Whole-galaxy draws: place the cloud in the world — identity for the Milky Way,
  // Andromeda's measured orientation and moving centre for its own — then the mutual
  // tide, then, while the remnant relaxes, the slide into a single spheroid.
  if(uGal > 0.5){
    float rL = length(aPos.xz);      // radius in the galaxy's own disk, pre-transform
    p = uGRot*p + uGOff;
    // Tidal pull toward the companion. A real encounter is an N-body problem; this is
    // the leading effect only — the differential pull grows with disk radius, so the
    // outer disk reaches into a bridge while the core barely moves. Softened and
    // capped: a bare inverse square tears passing stars into a streak.
    if(uTide > 0.001){
      vec3 dv = uAnd - p;
      float dd = length(dv);
      float pull = uTide * (rL/900.0) * 480.0 / (1.0 + (dd*dd)/(2600.0*2600.0));
      p += normalize(dv) * min(pull, 560.0);
    }
    // Coalescence: violent relaxation scrambles both disks into one elliptical.
    // Each star slides to a stable pseudo-random spot on a de-Vaucouleurs-ish
    // spheroid, mildly flattened, its radius loosely keeping the star's rank.
    if(uMerge > 0.001){
      float h1 = fract(sin(dot(aPos.xy, vec2(127.1,311.7)))*43758.5453);
      float h2 = fract(sin(dot(aPos.yz, vec2(269.5,183.3)))*43758.5453);
      float cz = h2*2.0-1.0, sz = sqrt(max(0.0, 1.0-cz*cz)), ph = 6.28318*h1;
      vec3 tgt = vec3(sz*cos(ph), cz*0.72, sz*sin(ph))
               * (90.0 + 200.0*pow(0.5*(h1+h2), 1.6)*3.0 + length(aPos)*0.34);
      p = mix(p, tgt, uMerge*uMerge);
    }
  }
  vec4 mv = uView * vec4(p - uOrg,1.0);
  gl_Position = uProj * mv;
  float dd = max(1e-9, -mv.z); // no floor of 1: real-scale zooms get much closer than that
  float s0 = aSize * uPx / dd;
  gl_PointSize = clamp(s0, max(uMinSz, 0.7), uCap);
  // a star smaller than a pixel keeps its flux, not its size: clamped points dim by
  // the area they were denied, so the far field stops shimmering at full brightness.
  // Referenced against the fixed floor, so the min-size slider still brightens.
  float sub = clamp(s0/0.7, 0.0, 1.0);
  float fluxKeep = mix(1.0, sub*sub, 0.62);
  vec3 col = aColor;
  if(uVarMode > 0.5){
    float h = fract(sin(dot(aPos.xz, vec2(12.9898,78.233)))*43758.5453);
    if(uVarMode < 1.5){
      // variable stars: ~4-5% of points pulse Mira/Cepheid-style — dimmer AND redder
      // at minimum light, because the star is coolest there
      if(h > 0.955){
        float w = 2.0 + 10.0*fract(h*97.0);
        float dim = 0.5 + 0.5*sin(uTime*w + h*6283.0);
        col *= 0.45 + 0.75*dim;
        col.g *= 0.85 + 0.15*dim;
        col.b *= 0.70 + 0.30*dim;
      }
    } else {
      // nebulae: every puff breathes gently and drifts in hue (ionization flicker)
      float ph = h*6283.0;
      float s1 = sin(uTime*0.5 + ph), s2 = sin(uTime*0.23 + ph*1.7);
      col *= 0.82 + 0.18*s1;
      col.r *= 1.0 + 0.10*s2;
      col.b *= 1.0 - 0.08*s2;
    }
  }
  // A floor rather than a gain: anything already brighter than it is left alone, so
  // raising it reveals the faint disk without blowing out the arms and the core.
  if(uMinB > 0.0){
    float lum = max(max(col.r, col.g), col.b);
    if(lum > 0.0002 && lum < uMinB) col *= uMinB/lum;
  }
  vColor = col * fade * fluxKeep * (1.0 - uFadeOut);
}`;
// Star profile after Gaia Sky (MPL-2.0, assets/shader/lib/star.glsl): a wide soft
// corona with a tight hot core, and the core lifts the colour toward white — a bright
// star reads as luminous rather than as a tinted disc. Reimplemented, not copied.
const PT_FS = `#version 300 es
precision mediump float;
in vec3 vColor; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  float d = 1.0-r;
  float corona = pow(d, 6.0);
  float core   = pow(d, 20.0);
  float a = corona*0.85 + core*1.35;
  vec3 col = vColor*a + vColor.g*core*0.9;   // the white-core lift, scaled by luminance
  o = vec4(col, a);
}`;

// trails, faded by vertex index
const TR_VS = `#version 300 es
layout(location=0) in vec3 aPos;
uniform mat4 uProj,uView;
uniform float uLen;
uniform vec3 uOrg;
out float vF;
void main(){
  gl_Position = uProj*uView*vec4(aPos-uOrg,1.0);
  vF = float(gl_VertexID)/uLen;
}`;
const TR_FS = `#version 300 es
precision mediump float;
in float vF; uniform vec3 uColor; uniform float uAlpha; uniform float uFlat; out vec4 o;
void main(){ float f = mix(pow(vF,1.7), 1.0, uFlat)*uAlpha; o = vec4(uColor*f, f); }`;

const pPt = prog(PT_VS,PT_FS), pTr = prog(TR_VS,TR_FS);
const U = {
  ptProj: gl.getUniformLocation(pPt,'uProj'), ptView: gl.getUniformLocation(pPt,'uView'), ptPx: gl.getUniformLocation(pPt,'uPx'),
  ptSpin: gl.getUniformLocation(pPt,'uSpin'), ptWarp: gl.getUniformLocation(pPt,'uWarp'), ptSun: gl.getUniformLocation(pPt,'uSunPos'),
  ptOrg: gl.getUniformLocation(pPt,'uOrg'), trOrg: gl.getUniformLocation(pTr,'uOrg'),
  velT: gl.getUniformLocation(pPt,'uVelT'),
  ptCap: gl.getUniformLocation(pPt,'uCap'), ptWA: gl.getUniformLocation(pPt,'uWaveAll'),
  ptTime: gl.getUniformLocation(pPt,'uTime'), ptVM: gl.getUniformLocation(pPt,'uVarMode'),
  ptAnd: gl.getUniformLocation(pPt,'uAnd'), ptTide: gl.getUniformLocation(pPt,'uTide'),
  ptWarpAmp: gl.getUniformLocation(pPt,'uWarpAmp'), ptMinB: gl.getUniformLocation(pPt,'uMinB'),
  ptMinSz: gl.getUniformLocation(pPt,'uMinSz'), ptFade: gl.getUniformLocation(pPt,'uFadeOut'),
  ptGal: gl.getUniformLocation(pPt,'uGal'), ptGRot: gl.getUniformLocation(pPt,'uGRot'),
  ptGOff: gl.getUniformLocation(pPt,'uGOff'), ptMerge: gl.getUniformLocation(pPt,'uMerge'),
  trProj: gl.getUniformLocation(pTr,'uProj'), trView: gl.getUniformLocation(pTr,'uView'),
  trLen: gl.getUniformLocation(pTr,'uLen'), trCol: gl.getUniformLocation(pTr,'uColor'), trA: gl.getUniformLocation(pTr,'uAlpha'),
  trFlat: gl.getUniformLocation(pTr,'uFlat')
};

// ---------- the supernova blast ----------
// A collapse is not a big round star, and drawing it with the star sprite made it one:
// a white disc that only grew. This is its own pass. The transform is the wave-riding
// branch of PT_VS, copied rather than shared so the flash sits exactly where its
// progenitor stood — every supernova here descends from a red supergiant on an arm,
// so aWave is always 1 and uGal always 0, and the rest of that shader's work
// (velocities, variability, tides, the merge scramble) has nothing to do here.
const SN_VS = `#version 300 es
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
    float d = uSpin/640.0;                       // the arms' pattern speed: these are arm stars
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
}`;
// Four things stacked, all keyed to how far the blast has run: the photosphere, the
// light thrown off it, the shock front leaving it, and the spikes any bright point
// grows in an optical system. The colour follows the real thing — blue-white at peak,
// reddening as the ejecta expand and cool — so the flash reads as an event with a
// direction in time rather than a lamp being turned up and down.
const SN_FS = `#version 300 es
precision mediump float;
in vec3 vColor; in float vPhase; in float vSeed; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r > 1.0) discard;
  float ang = atan(q.y, q.x) + vSeed*6.2831;
  float d = 1.0 - r;

  // the photosphere: a hard white core, at its tightest right at the collapse
  float core = pow(d, mix(26.0, 9.0, vPhase));
  // the light around it, spreading and softening as the blast runs
  float glow = pow(d, mix(7.0, 3.2, vPhase));

  // Radiating spikes. Two sets at different counts and angles, each a narrow lobe in
  // angle and a slow falloff in radius, so they reach well past the glow. They lead the
  // flash and are gone before it is: the blast is brightest first and blurs outward.
  float lead = exp(-vPhase*2.6);
  float s1 = pow(abs(cos(ang*3.0)), 34.0);
  float s2 = pow(abs(cos(ang*2.0 + 0.9)), 22.0);
  float spikes = (s1*0.85 + s2*0.5) * pow(d, 1.7) * lead;

  // The shock front: a shell overtaking the glow and thinning as it goes. Nothing
  // explodes into a perfect circle, so the radius is bent a little with angle — enough
  // that the front reads as ejecta rather than as a drawn ring.
  // Ejecta are not evenly bright around the rim. Modulating brightness rather than
  // radius is what keeps this: bending the radius with angle only turns the circle into
  // a polygon, while an uneven rim on a round front reads as clumps.
  float sh = clamp(vPhase*1.35, 0.0, 1.0);
  float clumps = 0.68 + 0.32*sin(ang*5.0 + vSeed*17.0)*sin(ang*2.0 - vSeed*9.0);
  float ring = exp(-pow((r - sh)/mix(0.07, 0.19, vPhase), 2.0)) * (1.0 - vPhase)*0.85 * clumps;

  // cooling: blue-white through the peak, then into the ejecta's red
  vec3 hot  = vec3(0.86, 0.92, 1.0);
  vec3 cool = vec3(1.0, 0.52, 0.26);
  vec3 tint = mix(hot, cool, smoothstep(0.15, 1.0, vPhase));

  float a = core*1.5 + glow*0.9 + spikes*0.8 + ring*0.7;
  vec3 col = vColor * tint * (glow*0.9 + spikes*0.8 + ring*0.7)
           + vColor * core * 1.5;              // the core stays white, whatever the tint
  o = vec4(col, a);
}`;
const pSN = prog(SN_VS, SN_FS);
const USN = {
  proj: gl.getUniformLocation(pSN,'uProj'), view: gl.getUniformLocation(pSN,'uView'),
  px: gl.getUniformLocation(pSN,'uPx'), spin: gl.getUniformLocation(pSN,'uSpin'),
  warp: gl.getUniformLocation(pSN,'uWarp'), cap: gl.getUniformLocation(pSN,'uCap'),
  sun: gl.getUniformLocation(pSN,'uSunPos'), org: gl.getUniformLocation(pSN,'uOrg')
};

// ---------- what a death leaves behind ----------
// Supernova remnants and planetary nebulae were soft blobs. A remnant is a hollow
// shell, and a hollow shell is brightest at its rim, where the line of sight runs
// longest through it — the Veil, the Crab's edges, Cas A all read that way — and it is
// ragged, because the ejecta are. Same transform as the point pass, both branches:
// remnants sit in the arms (wave-riding) and planetaries anywhere in the disk (material).
// The fourth attribute packs the frame flag and the phase: wave in the twos, phase in
// the fraction, so the shell can thicken and fray as it runs without a fifth buffer.
const REM_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aSize;
layout(location=2) in vec3 aColor;
layout(location=3) in float aPack;   // wave*2 + phase
uniform mat4 uProj, uView;
uniform float uPx, uSpin, uWarp, uCap;
uniform vec3 uSunPos, uOrg;
out vec3 vColor; out float vPhase; out float vSeed;
void main(){
  float w = floor(aPack*0.5 + 0.25), ph = aPack - 2.0*w;
  vec3 p = aPos;
  float fade = 1.0;
  if(uSpin != 0.0){
    float r = length(p.xz);
    float d = mix(uSpin / max(r, 520.0), uSpin/640.0, w);
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
  vPhase = ph;
  vSeed  = fract(sin(dot(aPos.xz, vec2(73.1, 157.9)))*43758.5453);
}`;
const REM_FS = `#version 300 es
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
}`;
const pRem = prog(REM_VS, REM_FS);
const UREM = {
  proj: gl.getUniformLocation(pRem,'uProj'), view: gl.getUniformLocation(pRem,'uView'),
  px: gl.getUniformLocation(pRem,'uPx'), spin: gl.getUniformLocation(pRem,'uSpin'),
  warp: gl.getUniformLocation(pRem,'uWarp'), cap: gl.getUniformLocation(pRem,'uCap'),
  sun: gl.getUniformLocation(pRem,'uSunPos'), org: gl.getUniformLocation(pRem,'uOrg')
};

// ---------- the physics (compressed but honest) ----------
const R_GAL = 900;            // scene units: Sun's distance from galactic core
const V_GAL = 2*Math.PI*900/225e6;  // scene units per Earth year: one lap in 225 Myr, exactly
const GAL_PERIOD = 2*Math.PI*R_GAL/V_GAL; // sim "galactic year" in Earth-years (display only)
const YR_PER_SIM = (225/GAL_PERIOD)*1e6;  // real years in one simulated year (~1.19e6)
const AGE0 = 4.568;                       // Gyr: age of the solar system at simT = 0
const AND_AGE = 9.07;                     // Gyr: Andromeda's first passage, ~4.5 Gyr from now
// The merger scatters the Sun outward. N-body work on this encounter (Cox & Loeb 2008)
// finds a median final distance near 30 kpc against today's 8 — roughly 3.75x out — with
// about a 12% chance of the tidal tails beyond that and 3% of ending up bound to
// Andromeda instead. This follows the median outcome.
const SCATTER_AGE = 11.45;   // Gyr: the second passage, where the scatter begins
const SR_A = 3.75, SR_B = 2.75, SR_K = 1/0.9;   // sunR/R_GAL = SR_A - SR_B·e^(-SR_K·u)
function sunR(ts){
  // the scatter builds through the later passages, not the distant first one
  const d = AGE0 + ts*YR_PER_SIM/1e9 - SCATTER_AGE;
  return d <= 0 ? R_GAL : R_GAL*(SR_A - SR_B*Math.exp(-SR_K*d));
}
// How far round the galaxy the Sun has travelled. The rotation curve is flat, so the
// orbital *speed* stays near 230 km/s and the angular rate is v/R: as the merger widens
// the orbit the laps lengthen, out to 3.75× today's period. Turning the widening radius
// alone while holding the angular rate fixed — which is what an earlier build drew —
// would have carried the Sun round at 860 km/s, well above escape speed out there.
// This is the exact integral of that rate, so the galactic-year counter genuinely slows.
function sunPhase(ts){
  const u = AGE0 + ts*YR_PER_SIM/1e9 - SCATTER_AGE;
  if(u <= 0) return ts*V_GAL/R_GAL;
  const tPre = (SCATTER_AGE - AGE0)*1e9/YR_PER_SIM;
  const dU = Math.log(SR_A*Math.exp(SR_K*u) - SR_B)/(SR_K*SR_A);   // in Gyr
  return (tPre + dU*1e9/YR_PER_SIM)*V_GAL/R_GAL;
}
// ecliptic tilted 60.2° to the galactic plane; orientation is inertially fixed
const TILT = 60.2*Math.PI/180;
const E1 = [1,0,0];
const E2 = [0, Math.sin(TILT), -Math.cos(TILT)];

// name, real period (yr), display orbit radius, sprite size, color
const BODIES = [ // name, period yr, display radius, sprite size, color, real semi-major axis (AU), real radius (km)
  ['Sun',     0,      0,   5.2, [1.0,0.86,0.55], 0, 696000],
  ['Mercury', 0.241,  6.0, 0.85,[0.66,0.64,0.62], 0.387, 2440],
  ['Venus',   0.615,  8.5, 1.15,[0.93,0.82,0.58], 0.723, 6052],
  ['Earth',   1.000, 11.0, 1.2, [0.35,0.58,1.0],  1.000, 6371],
  ['Mars',    1.881, 14.0, 1.0, [0.92,0.44,0.26], 1.524, 3390],
  ['Jupiter',11.862, 20.0, 2.6, [0.85,0.66,0.42], 5.203, 69911],
  ['Saturn', 29.457, 26.0, 2.3, [0.90,0.79,0.53], 9.537, 58232],
  ['Uranus', 84.02,  32.5, 1.7, [0.52,0.83,0.86], 19.19, 25362],
  ['Neptune',164.8,  38.5, 1.7, [0.30,0.42,0.90], 30.07, 24622],
  // IAU dwarf planets (drawn smaller; note their strongly inclined orbits)
  ['Ceres',    4.60, 16.0, 0.55,[0.62,0.60,0.56], 2.766, 470],
  ['Pluto',  248.0,  43.0, 0.60,[0.80,0.69,0.58], 39.48, 1188],
  ['Haumea', 285.0,  44.5, 0.50,[0.82,0.82,0.85], 43.1, 816],
  ['Makemake',306.0, 46.0, 0.50,[0.76,0.56,0.43], 45.4, 715],
  ['Eris',   558.0,  52.5, 0.55,[0.83,0.83,0.90], 67.7, 1163],
  // Hypothetical, and drawn as such: the orbit that would explain the clustering of
  // the far Kuiper objects. ~400 AU and ~6 Earth masses, after Brown & Batygin.
  ['Planet 9?', 8000.0, 78.0, 0.62,[0.36,0.66,0.77], 400.0, 19100],
];
// real scale: 1 unit ~ 30 ly, 1 ly = 63,241 AU -> units per AU
const AU2U = 1/(63241*30);
const OO_REAL = 3.0e-4; // real mode: maps the symbolic Oort shell onto its true ~1.6 ly outer edge
let realMode = true;   // true proportions, always — the magnified display mode is gone
let curD = 1; // active galaxy density (set by setGalaxy, read by the life-cycle rates)
const NB = BODIES.length;
const N_PLANETS = 9;         // Sun + 8 planets; dwarfs follow
const I_P9 = NB - 1;         // the hypothetical one, last in the table
let showP9 = true;
const PHASE = BODIES.map((_,i)=> i*2.399963); // golden-angle spread

// per-body orbital plane: planets share the ecliptic; dwarfs are tilted [inclination°, node°]
const EN = [0, Math.cos(TILT), Math.sin(TILT)]; // ecliptic normal
const DTILT = { Ceres:[10.6,80], Pluto:[17.2,110], Haumea:[28.2,122], Makemake:[29.0,79], Eris:[44.0,36],
  // the candidate's orbit is tilted too, by about 16 degrees in the current estimates
  'Planet 9?':[16.0,95] };
const BU=[], BV=[];
BODIES.forEach((b,i)=>{
  if(i<N_PLANETS){ BU.push(E1); BV.push(E2); return; }
  const [inc,node]=DTILT[b[0]];
  const ci=Math.cos(inc*Math.PI/180), si=Math.sin(inc*Math.PI/180);
  const cn=Math.cos(node*Math.PI/180), sn=Math.sin(node*Math.PI/180);
  const u=[cn*E1[0]+sn*E2[0], cn*E1[1]+sn*E2[1], cn*E1[2]+sn*E2[2]];
  const w=[-sn*E1[0]+cn*E2[0], -sn*E1[1]+cn*E2[1], -sn*E1[2]+cn*E2[2]];
  BU.push(u); BV.push([w[0]*ci+EN[0]*si, w[1]*ci+EN[1]*si, w[2]*ci+EN[2]*si]);
});

// Sun's vertical bob through the disk plane: real period ~90 Myr, amplitude ~±250 ly.
// Amplitude shown ~3× exaggerated so it reads at this zoom.
const WOB_A = 24, WOB_T = 90e6; // scene units, and the real ~90 Myr vertical period

const tmp = new Float64Array(3), tmpSun = new Float64Array(3), earthW = new Float64Array(3);
function bodyPos(i, t, out){
  const phi = sunPhase(t);                       // galactic anomaly, slowing as R grows
  const R = sunR(t);                             // constant until the merger flings it out
  const sx = R*Math.sin(phi), sz = R*Math.cos(phi);
  const sy = (realMode?8.3:WOB_A)*Math.sin(2*Math.PI*t/WOB_T + 2.1);
  if(i===0){ out[0]=sx; out[1]=sy; out[2]=sz; return out; }
  const b = BODIES[i];
  const th = 2*Math.PI*t/b[1] + PHASE[i];
  const rr = realMode ? b[5]*AU2U : b[2]; // true proportions: the whole system is sub-pixel
  const c = Math.cos(th)*rr, s = Math.sin(th)*rr;
  const u=BU[i], v=BV[i];
  out[0] = sx + c*u[0] + s*v[0];
  out[1] = sy + c*u[1] + s*v[1];
  out[2] = sz + c*u[2] + s*v[2];
  return out;
}

// ---------- static geometry: starfield + galaxy ----------
function makeBuf(data, loc, comps){
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  return b;
}
function gauss(){ let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function expR(a,b,Rd){ // radius in [a,b] from an exponential disk profile ~exp(-r/Rd)
  const ea=Math.exp(-a/Rd), eb=Math.exp(-b/Rd);
  return -Rd*Math.log(ea-(ea-eb)*Math.random());
}

// distant stars
const N_STAR = 3200;
{ var starPos=new Float32Array(N_STAR*3), starSize=new Float32Array(N_STAR), starCol=new Float32Array(N_STAR*3);
  for(let i=0;i<N_STAR;i++){
    const th=Math.random()*2*Math.PI, ph=Math.acos(2*Math.random()-1), r=7500;
    starPos[i*3]=r*Math.sin(ph)*Math.cos(th); starPos[i*3+1]=r*Math.cos(ph); starPos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
    starSize[i]= 6 + Math.random()*9;
    const w = .35+Math.random()*.5, warm=Math.random()*.15;
    starCol[i*3]=w+warm; starCol[i*3+1]=w+warm*.5; starCol[i*3+2]=w+Math.random()*.2;
  }
}
// Milky Way, roughly to scale: 1 unit ≈ 30 ly, Sun at 900 ≈ 26,700 ly from the core.
// Barred core (half-length ~500 ≈ 15,000 ly, tilted 28° to the Sun–center line),
// two major arms (Scutum–Centaurus, Perseus) springing from the bar tips,
// two fainter arms (Sagittarius, Norma/Outer), and the Local (Orion) Spur at the Sun.
const PITCH = Math.tan(12.5*Math.PI/180);   // Milky Way arm pitch angle ≈ 12–13°
const BAR_L = 500;                          // bar half-length
const BAR_A = 28*Math.PI/180;               // bar angle to the Sun–center line (+z)
// trailing log-spirals: going outward, arms sweep backward against the rotation
const armAngle = (r,off) => off - Math.log(r/BAR_L)/PITCH;
const ARMS = [
  [BAR_A,             1.00],  // Scutum–Centaurus (near bar tip)
  [BAR_A+Math.PI,     1.00],  // Perseus (far bar tip)
  [BAR_A+Math.PI/2,   0.50],  // Sagittarius
  [BAR_A+3*Math.PI/2, 0.50],  // Norma / Outer
];
const sA=Math.sin(BAR_A), cA=Math.cos(BAR_A);
let N_GXY, NEB_N, DUST_N;
let N_AND = 0, vaoAnd = null;   // declared here: setGalaxy builds Andromeda too, and runs earlier
let N_ANDN = 0, N_ANDD = 0, vaoAndNeb = null, vaoAndDust = null, m31Map = null;
// The nebula buffers hold three runs in order — HII pink, the diffuse haze, the core —
// and the frame draws them in two halves around the dust: the haze goes down first and
// the dark clouds darken it, then the stars, the HII and the core go over both, so a
// cloud sits within the star field instead of on top of it. These are the run lengths.
let NEB_PINK = 0, NEB_GLOW = 0, AND_PINK = 0, AND_GLOW = 0;
// The galaxy star buffer's nuclear run — the ~200 pc nuclear disc and the 4 pc cluster
// around Sgr A* — as an index range [NUC0, NUC1). From inside the disk those stars are
// not drawn: at 8 kpc they collapse onto one pixel, add up to a hard spot, and are drawn
// after the dust that, from Earth, hides them behind ~30 magnitudes. Only these; the
// bulge proper still draws, as the Sagittarius star clouds do. 0,0 when there is none.
let NUC0 = 0, NUC1 = 0, hideNucleus = true;
let gxyPos,gxySize,gxyCol,gxyWave, nebPos,nebSize,nebCol, dustPos,dustSize,dustStr;
function genGalaxy(D){ // D = density multiplier (hi-fi galaxy mode)
  N_GXY = Math.round(92000*D);
  NUC0 = NUC1 = 0;
  const BS = 1/Math.sqrt(D);      // per-star brightness comp: more stars, finer grain
  const SS = Math.pow(D,-0.12);   // slightly smaller sprites when dense
  const NBS = Math.max(Math.pow(D,-0.7), 0.25), DS = 1/D; // floor: nebulae must survive ultra
  gxyPos=new Float32Array(N_GXY*3); gxySize=new Float32Array(N_GXY); gxyCol=new Float32Array(N_GXY*3); gxyWave=new Float32Array(N_GXY);
  for(let i=0;i<N_GXY;i++){
    let x,y,z,cr,cg,cb,s,wv=0;
    if(i<3200*D){ // nuclear bulge — old, dense, warm
      const r=Math.abs(gauss())*80, th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*60;
      const b=.34+Math.random()*.36;
      cr=b*1.2; cg=b*.9; cb=b*.58; s=2.8+Math.random()*2.4;
    } else if(i<12000*D){ // the bar: boxy/peanut, vertical flare toward the tips
      const u=(Math.random()+Math.random()+Math.random()-1.5)/1.5*BAR_L;
      const v=gauss()*95*(1-0.45*Math.abs(u)/BAR_L);
      y=gauss()*(50+42*Math.abs(u)/BAR_L);
      x=u*sA+v*cA; z=u*cA-v*sA;
      const b=.28+Math.random()*.30;
      cr=b*1.18; cg=b*.87; cb=b*.54; s=2.5+Math.random()*2.2; wv=1; // old, yellow-red stars; the bar is its own rigid pattern
    } else if(i<20500*D){ // inter-arm thin disk: exponential profile, Rd ~2.6 kpc (Gaia-era value), mild outer flare
      const r=expR(360,1780,283), th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*(11+Math.max(0,r-1100)*0.012);
      const b=.055+Math.random()*.075;
      cr=b*.85; cg=b*.9; cb=b*1.1; s=1.5+Math.random()*1.5;
    } else if(i<22000*D){ // thick disk: older and yellower, ~3x the scale height, shorter scale length
      const r=expR(300,1600,220), th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*52;
      const b=.045+Math.random()*.06;
      cr=b*1.02; cg=b*.9; cb=b*.78; s=1.5+Math.random()*1.4;
    } else if(i<24600*D){ // Local (Orion) Spur — the short arm segment the Sun lives in
      const r=900+(Math.random()*2-1)*170+gauss()*26;
      const th=-(r-900)/(900*PITCH)+0.02+gauss()*0.05;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*7; wv=1;
      const roll=Math.random();
      if(roll<0.05){ cr=.8; cg=.46; cb=.55; s=3.2+Math.random()*2.2; }
      else if(roll<0.16){ cr=.5; cg=.62; cb=.9; s=2.8+Math.random()*2.4; }
      else { const b=.11+Math.random()*.13; cr=b*.85; cg=b*.95; cb=b*1.15; s=1.6+Math.random()*1.7; }
    } else if(i<28600*D){ // sparse old stellar halo enveloping the disk
      const rr=150+Math.abs(gauss())*1000, th=Math.random()*2*Math.PI, ph=Math.acos(2*Math.random()-1);
      x=rr*Math.sin(ph)*Math.cos(th); z=rr*Math.sin(ph)*Math.sin(th); y=rr*Math.cos(ph)*0.72;
      const b=.05+Math.random()*.06;
      cr=b*1.05; cg=b*.95; cb=b*.85; s=1.6+Math.random()*1.4;
    } else if(i<28600*D+80){ // globular clusters (a fixed ~80: the Milky Way has ~150, not 400) scattered through the halo
      const rr=250+Math.abs(gauss())*1000, th=Math.random()*2*Math.PI, ph=Math.acos(2*Math.random()-1);
      x=rr*Math.sin(ph)*Math.cos(th); z=rr*Math.sin(ph)*Math.sin(th); y=rr*Math.cos(ph)*0.8;
      const b=.35+Math.random()*.25;
      cr=b*1.1; cg=b*1.0; cb=b*.85; s=3.4+Math.random()*2.0;
    } else if(i<42000*D){ // faint extended outer disk (measured to ~2× the classic radius), flaring outward
      const r=1700+Math.pow(Math.random(),1.6)*1250, th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*(6+(r-1700)*0.012);
      const b=.035+Math.random()*.055;
      cr=b*.9; cg=b*.92; cb=b*1.05; s=1.5+Math.random()*1.5;
    } else { // the four arms, growing out of the bar tips
      const arm = Math.random()<0.68 ? ARMS[i%2] : ARMS[2+(i%2)];
      const r=BAR_L+Math.pow(Math.random(),1.1)*1600;
      const spread=0.055+r*0.00006;
      const th=armAngle(r,arm[0])+gauss()*spread;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*(8-r*0.003);
      wv=1;
      const w=arm[1]*(1-0.45*(r-BAR_L)/1600), roll=Math.random();
      if(roll<0.045){ cr=.95*w; cg=.55*w; cb=.65*w; s=3.0+Math.random()*2.2; }      // pink HII star-forming knots
      else if(roll<0.14){ cr=.65*w; cg=.78*w; cb=1.05*w; s=2.6+Math.random()*2.2; } // young blue clusters
      else { const b=(.13+Math.random()*.17)*w; cr=b*.85; cg=b*.95; cb=b*1.15; s=1.5+Math.random()*1.7; }
    }
    gxyPos[i*3]=x; gxyPos[i*3+1]=y; gxyPos[i*3+2]=z; gxyWave[i]=wv;
    gxySize[i]=s*SS; gxyCol[i*3]=cr*BS; gxyCol[i*3+1]=cg*BS; gxyCol[i*3+2]=cb*BS;
  }

  // ~420 emission nebulae: along the arms, at the bar tips, and in the Local Spur
  NEB_N = Math.round(2600*D);
  NEB_PINK = 0; NEB_GLOW = NEB_N;   // no runs in the schematic galaxy: all of it is haze
  nebPos=new Float32Array(NEB_N*3); nebSize=new Float32Array(NEB_N); nebCol=new Float32Array(NEB_N*3);
  {
    const TYPES=[[.058,.018,.030],[.016,.044,.050],[.030,.020,.060],[.052,.033,.014]]; // Hα pink, OIII teal, violet dust-glow, amber
    const TW=[.38,.28,.22,.12];
    let p=0;
    while(p<NEB_N){
      let r, th, str=1, core=false;
      const kind=Math.random();
      if(kind<0.05){ // soft warm glow enveloping the nucleus
        r=Math.abs(gauss())*70; th=Math.random()*2*Math.PI; str=1.6; core=true;
      } else if(kind<0.14){ // starburst knots at the bar tips — a real feature of barred galaxies
        th=(Math.random()<0.5?BAR_A:BAR_A+Math.PI)+gauss()*0.06;
        r=BAR_L*(0.95+Math.random()*0.15);
      } else if(kind<0.27){ // Local Spur, around the Sun
        r=900+(Math.random()*2-1)*150;
        th=-(r-900)/(900*PITCH)+0.02+gauss()*0.04; str=0.8;
      } else { // spiral arms
        const arm = Math.random()<0.72 ? ARMS[(Math.random()*2)|0] : ARMS[2+((Math.random()*2)|0)];
        r=BAR_L+40+Math.pow(Math.random(),0.95)*1150;
        th=armAngle(r,arm[0])+gauss()*0.045; str=arm[1];
      }
      const ax=r*Math.sin(th), az=r*Math.cos(th), ay=gauss()*5;
      let roll=Math.random(), ti=0, acc=0;
      for(let k=0;k<4;k++){ acc+=TW[k]; if(roll<acc){ ti=k; break; } }
      if(core) ti=3; // nucleus glows amber
      const col=TYPES[ti], scale=(22+Math.random()*46)*str;
      const puffs=Math.min(NEB_N-p, 5+((Math.random()*4)|0));
      for(let q=0;q<puffs;q++,p++){
        nebPos[p*3]  =ax+gauss()*scale*0.45;
        nebPos[p*3+1]=ay+gauss()*scale*0.18;
        nebPos[p*3+2]=az+gauss()*scale*0.45;
        nebSize[p]=scale*(0.6+Math.random()*0.8);
        const j=0.7+Math.random()*0.6;
        nebCol[p*3]=col[0]*j*NBS; nebCol[p*3+1]=col[1]*j*NBS; nebCol[p*3+2]=col[2]*j*NBS;
      }
    }
  }

  // dark dust lanes — the light-blocking clouds that define real spiral photos:
  // streaks along the inner (concave) edge of each arm, plus the bar's twin lanes
  const XD = D>1 ? Math.round(9000*D) : 0; // hi-fi only: extra discrete dark clouds (Dunkelwolken)
  DUST_N = Math.round(3400*D) + XD;
  const LANE_N = DUST_N - XD;
  dustPos=new Float32Array(DUST_N*3); dustSize=new Float32Array(DUST_N); dustStr=new Float32Array(DUST_N*3);
  {
    let p=0;
    while(p<Math.round(420*D)){ // the bar's point-symmetric leading-edge lanes
      const u=(Math.random()*2-1)*BAR_L*0.92, v=(u>0?1:-1)*(34+gauss()*10);
      dustPos[p*3]=u*sA+v*cA; dustPos[p*3+1]=gauss()*8; dustPos[p*3+2]=u*cA-v*sA;
      dustSize[p]=16+Math.random()*22; dustStr[p*3]=(.30+Math.random()*.25)*DS; p++;
    }
    while(p<LANE_N){ // streaks following each arm's inner edge
      const arm = Math.random()<0.7 ? ARMS[(Math.random()*2)|0] : ARMS[2+((Math.random()*2)|0)];
      const r0=BAR_L+30+Math.pow(Math.random(),0.9)*1150;
      const seg=Math.min(LANE_N-p, 4+((Math.random()*4)|0));
      for(let q=0;q<seg;q++,p++){
        const r=r0+q*16+gauss()*6-26;
        const th=armAngle(r,arm[0])+0.030+gauss()*0.016;
        dustPos[p*3]=r*Math.sin(th); dustPos[p*3+1]=gauss()*5; dustPos[p*3+2]=r*Math.cos(th);
        dustSize[p]=18+Math.random()*26;
        dustStr[p*3]=(.22+Math.random()*.28)*arm[1]*DS;
      }
    }
    while(p<DUST_N){ // Dunkelwolken: discrete dark molecular clouds, arm-hugging but also scattered
      const arm = ARMS[(Math.random()*4)|0];
      let r, th;
      if(Math.random()<0.62){ r=BAR_L+Math.pow(Math.random(),1.05)*1500; th=armAngle(r,arm[0])+gauss()*0.10; }
      else { r=300+Math.pow(Math.random(),0.8)*1650; th=Math.random()*6.28318; }
      const cx=r*Math.sin(th), cz=r*Math.cos(th), cy=gauss()*7;
      const sc=7+Math.random()*26, str=.16+Math.random()*.30;
      const puffs=Math.min(DUST_N-p, 3+((Math.random()*5)|0));
      for(let q=0;q<puffs;q++,p++){
        dustPos[p*3]=cx+gauss()*sc*.6; dustPos[p*3+1]=cy+gauss()*sc*.22; dustPos[p*3+2]=cz+gauss()*sc*.6;
        dustSize[p]=sc*(.5+Math.random()*.9);
        dustStr[p*3]=str*(.6+Math.random()*.7);
      }
    }
  }
}

// Buffers are tracked alongside their VAO so a density can be released again: deleting
// a vertex array does not free what it references, and the big densities are hundreds
// of megabytes apiece.
const vaoBufs = new WeakMap();
// Drop every cached galaxy build. The Andromeda entry is an { a, an, ad } bundle, and
// both map loaders race each other here — this must never throw mid-flush, or the
// loser leaves the scene pointing at deleted vertex arrays.
function flushGxyCache(){
  for(const k of Object.keys(gxyCache)){ const o = gxyCache[k];
    deleteVAO(o.g); deleteVAO(o.nb); deleteVAO(o.d);
    deleteVAO(o.a.a); if(o.a.an) deleteVAO(o.a.an); if(o.a.ad) deleteVAO(o.a.ad);
    delete gxyCache[k]; }
}
function deleteVAO(vao){
  const bufs = vaoBufs.get(vao);
  if(bufs) bufs.forEach(b => gl.deleteBuffer(b));
  gl.deleteVertexArray(vao);
}
function pointVAO(pos, size, col, wave, vel){
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const bufs=[];
  const attach=(data,loc,comps)=>{ const b=gl.createBuffer(); bufs.push(b);
    gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,comps,gl.FLOAT,false,0,0); };
  attach(pos,0,3); attach(size,1,1); attach(col,2,3);
  if(wave) attach(wave,3,1);
  if(vel) attach(vel,4,3);   // populations without one read a constant zero
  gl.bindVertexArray(null); vaoBufs.set(vao,bufs); return vao;
}
const vaoStars = pointVAO(starPos, starSize, starCol);
let vaoGxy, vaoNeb, vaoDust;
const gxyCache = {}; // both densities kept once generated, so toggling back is instant
// ---------- the photographic density map ----------
// The classic face-on Milky Way illustration is used as a probability map: stars are
// placed where the picture is bright, with colours taken from its pixels; dust where its
// lanes are dark; HII nebulae where it is pink. The shipped copy is mirrored so the arms
// trail the pattern's rotation, and rotated so its bar sits at the scene's 28 degrees —
// both measured, not guessed. The procedural generator remains the fallback offline.
let galaxyMap = null;
const MAP_SCALE = 2100/188.6;   // scene units per map pixel: the disk edge lands at 2100
function loadGalaxyMap(){
  fetch('galaxy-map.webp').then(r => r.ok ? r.blob() : Promise.reject())
    .then(b => createImageBitmap(b))
    .then(bm => {
      const n = 448, cv = document.createElement('canvas');
      cv.width = cv.height = n;
      const cx2 = cv.getContext('2d');
      cx2.drawImage(bm, 0, 0, n, n);
      const px = cx2.getImageData(0, 0, n, n).data;
      const lum = new Float32Array(n*n);
      for(let i=0;i<n*n;i++) lum[i] = (px[i*4]+px[i*4+1]+px[i*4+2])/765;
      // small separable blur: the smooth background, for lane-darkness and structuredness
      const blur = new Float32Array(lum), tb = new Float32Array(n*n);
      for(let pass=0; pass<3; pass++){
        for(let y=0;y<n;y++) for(let x=0;x<n;x++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=x+k; if(q>=0&&q<n){ s+=blur[y*n+q]; c++; } }
          tb[y*n+x]=s/c;
        }
        for(let x=0;x<n;x++) for(let y=0;y<n;y++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=y+k; if(q>=0&&q<n){ s+=tb[q*n+x]; c++; } }
          blur[y*n+x]=s/c;
        }
      }
      const c0 = (n-1)/2, R = 188.6;
      const star = new Float32Array(n*n), neb = new Float32Array(n*n), dust = new Float32Array(n*n);
      for(let i=0;i<n*n;i++){
        const x=i%n, y=(i/n)|0, r=Math.hypot(x-c0, y-c0);
        if(r > R*1.06) continue;
        const l = lum[i];
        star[i] = Math.pow(Math.max(0, l-0.012), 1.55);
        const pink = Math.max(0, px[i*4]/255 - (px[i*4+1]+px[i*4+2])/510);
        neb[i]  = pink*l;
        dust[i] = r>40 ? Math.max(0, blur[i]-l)*Math.min(1, l*4+0.2) : 0;
      }
      const cum = a => { const c=new Float32Array(a.length); let s=0;
        for(let i=0;i<a.length;i++){ s+=a[i]; c[i]=s; } return c; };
      galaxyMap = { n, px, lum, blur, starC:cum(star), nebC:cum(neb), dustC:cum(dust) };
      // whatever is cached was built procedurally: rebuild the active density from the map
      flushGxyCache();
      setGalaxy(curD);
    })
    .catch(()=>{});   // opened from disk: the procedural galaxy stands in
}
function mapPick(cdf){
  const total = cdf[cdf.length-1], t = Math.random()*total;
  let lo=0, hi=cdf.length-1;
  while(lo<hi){ const mid=(lo+hi)>>1; if(cdf[mid]<t) lo=mid+1; else hi=mid; }
  return lo;
}
function mapXZ(i, spread){
  const n=galaxyMap.n, c0=(n-1)/2;
  const u=(i%n)+Math.random()-0.5+gauss()*spread, v=((i/n)|0)+Math.random()-0.5+gauss()*spread;
  return [ (u-c0)*MAP_SCALE, -(v-c0)*MAP_SCALE ];
}
function genGalaxyMap(D){
  N_GXY = Math.round(92000*D);
  const BS = 1/Math.sqrt(D), SS = Math.pow(D,-0.12);
  const NBS = Math.max(Math.pow(D,-0.7), 0.25), DS = 1/D;
  gxyPos=new Float32Array(N_GXY*3); gxySize=new Float32Array(N_GXY);
  gxyCol=new Float32Array(N_GXY*3); gxyWave=new Float32Array(N_GXY);
  const m = galaxyMap, pxd = m.px;
  const HALO = Math.round(N_GXY*0.045);   // the picture is flat; the 3D halo stays procedural
  // The innermost parsecs, below the picture's resolution: a nuclear stellar disc of
  // ~200 pc and, inside it, the compact nuclear star cluster around Sgr A* — linked
  // structures that grow together, fed by gas the bar drives inward (Sormani et al.,
  // A&A 2025; AIP: "How central galactic structures grow together").
  const NSD = Math.round(N_GXY*0.022), NSC = Math.round(N_GXY*0.004);
  NUC0 = HALO; NUC1 = HALO + NSD + NSC;
  for(let i=0;i<N_GXY;i++){
    let X,Y,Z,cr,cg,cb,s,wv=0;
    if(i<HALO){
      const rr=150+Math.abs(gauss())*1000, th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
      X=rr*Math.sin(ph)*Math.cos(th); Z=rr*Math.sin(ph)*Math.sin(th); Y=rr*Math.cos(ph)*0.72;
      const b=.05+Math.random()*.06; cr=b*1.05; cg=b*.95; cb=b*.85; s=1.6+Math.random()*1.4;
    } else if(i < HALO+NSD){
      const rr=Math.abs(gauss())*9.5, th=Math.random()*6.28318;   // ~200 pc disc
      X=rr*Math.sin(th); Z=rr*Math.cos(th); Y=gauss()*1.7;
      const b=.10+Math.random()*.14; cr=b*1.12; cg=b*.88; cb=b*.58; s=1.5+Math.random()*1.1; wv=1;
    } else if(i < HALO+NSD+NSC){
      const rr=Math.abs(gauss())*0.42, th=Math.random()*6.28318,  // ~4 pc cluster
            ph=Math.acos(2*Math.random()-1);
      X=rr*Math.sin(ph)*Math.cos(th); Z=rr*Math.sin(ph)*Math.sin(th); Y=rr*Math.cos(ph);
      const b=.30+Math.random()*.45; cr=b*1.05; cg=b*.92; cb=b*.72; s=1.8+Math.random()*1.4; wv=1;
    } else {
      const pI = mapPick(m.starC);
      const w = mapXZ(pI, 0.35); X=w[0]; Z=w[1];
      const l = m.lum[pI], rw = Math.hypot(X,Z);
      const bulge = l*Math.exp(-(rw*rw)/(230*230));      // the yellow centre puffs into 3D
      Y = gauss()*(9 + Math.max(0,rw-1100)*0.012 + 90*bulge);
      const gain = (0.16 + 0.95*Math.pow(l, 1.1)) * (Math.random()<0.03 ? 2.2 : 1);
      cr = pxd[pI*4]/255*gain*0.97; cg = pxd[pI*4+1]/255*gain; cb = pxd[pI*4+2]/255*gain*1.10;
      s = 1.4 + Math.random()*1.8 + (l>0.72 ? Math.random()*1.2 : 0);
      // bright structure and the bar ride the density wave; the smooth background shears
      wv = (l > m.blur[pI]*1.10 || rw < 560) ? 1 : 0;
    }
    gxyPos[i*3]=X; gxyPos[i*3+1]=Y; gxyPos[i*3+2]=Z; gxyWave[i]=wv;
    gxySize[i]=s*SS; gxyCol[i*3]=cr*BS; gxyCol[i*3+1]=cg*BS; gxyCol[i*3+2]=cb*BS;
  }
  const Dg = Math.min(D, 8);
  const PINK_N = Math.round(2600*D), GLOW_N = Math.round(3800*Dg), CORE_N = Math.round(900*Dg);
  NEB_N = PINK_N + GLOW_N + CORE_N;
  NEB_PINK = PINK_N; NEB_GLOW = GLOW_N;
  nebPos=new Float32Array(NEB_N*3); nebSize=new Float32Array(NEB_N); nebCol=new Float32Array(NEB_N*3);
  for(let q=0;q<PINK_N;q++){
    const pI = mapPick(m.nebC);
    const w = mapXZ(pI, 0.8);
    nebPos[q*3]=w[0]; nebPos[q*3+1]=gauss()*5; nebPos[q*3+2]=w[1];
    nebSize[q]=16+Math.random()*40;
    const j=(0.7+Math.random()*0.6)*NBS;
    nebCol[q*3]=.16*j; nebCol[q*3+1]=.05*j; nebCol[q*3+2]=.065*j;   // Hα: red-pink, not magenta
  }
  // The haze has to be haze-sized: at galaxy view a 60-unit sprite is a dozen pixels,
  // so these run to 190 units and overlap heavily, which is what unresolved light is.
  const gGain = 0.19/Dg;  // per-puff share of a constant total, whatever the density
  for(let q=PINK_N;q<PINK_N+GLOW_N;q++){
    const pI = mapPick(m.starC);
    const w = mapXZ(pI, 1.1);
    const l = m.lum[pI], rw = Math.hypot(w[0], w[1]);
    nebPos[q*3]=w[0];
    nebPos[q*3+1]=gauss()*(6 + 40*l*Math.exp(-(rw*rw)/(230*230)));
    nebPos[q*3+2]=w[1];
    nebSize[q]=60+Math.random()*130;
    const j=(0.7+Math.random()*0.6)*gGain*(0.4+l);
    // a touch bluer than the pixels: additive stacking over the warm core greys the arms
    nebCol[q*3]=m.px[pI*4]/255*j*0.97; nebCol[q*3+1]=m.px[pI*4+1]/255*j; nebCol[q*3+2]=m.px[pI*4+2]/255*j*1.12;
  }
  // and the golden centre, which the picture renders far brighter than any arm
  { // elongated along the bar at 28 degrees, like the picture's, not a round flare
    const sA=Math.sin(28*Math.PI/180), cA=Math.cos(28*Math.PI/180);
    for(let q=PINK_N+GLOW_N;q<NEB_N;q++){
      const u=gauss()*165, v=gauss()*80;
      nebPos[q*3]=u*sA+v*cA; nebPos[q*3+1]=gauss()*Math.max(10,42-Math.abs(u)*0.16); nebPos[q*3+2]=u*cA-v*sA;
      nebSize[q]=40+Math.random()*95;
      const j=(0.7+Math.random()*0.6)*0.30/Dg;
      nebCol[q*3]=1.00*j; nebCol[q*3+1]=0.80*j; nebCol[q*3+2]=0.50*j;
    }
  }
  const XD = D>1 ? Math.round(9000*D) : 0;
  DUST_N = Math.round(3400*D)+XD;
  dustPos=new Float32Array(DUST_N*3); dustSize=new Float32Array(DUST_N); dustStr=new Float32Array(DUST_N*3);
  for(let q=0;q<DUST_N;q++){
    const pI = mapPick(m.dustC);
    const w = mapXZ(pI, 0.5);
    dustPos[q*3]=w[0]; dustPos[q*3+1]=gauss()*5; dustPos[q*3+2]=w[1];
    dustSize[q]=16+Math.random()*28;
    const dk = Math.max(0, m.blur[pI]-m.lum[pI]);
    dustStr[q*3]=(0.35+4.5*dk)*DS*(0.7+Math.random()*0.6);
  }
}
function setGalaxy(D){
  const key = (galaxyMap ? 'm' : 'p') + (m31Map ? 'M' : 'q') + D;
  if(!gxyCache[key]){
    (galaxyMap ? genGalaxyMap : genGalaxy)(D);
    const gv = pointVAO(gxyPos,gxySize,gxyCol,gxyWave);
    const nv = pointVAO(nebPos,nebSize,nebCol), dv = pointVAO(dustPos,dustSize,dustStr);
    const av = (m31Map ? genAndromedaMap : genAndromeda)(D);
    gxyCache[key] = { D, n:[N_GXY,NEB_N,DUST_N], seg:[NEB_PINK,NEB_GLOW,AND_PINK,AND_GLOW], nuc:[NUC0,NUC1], g:gv, nb:nv, d:dv, a:av };
    gxyPos=gxySize=gxyCol=gxyWave=nebPos=nebSize=nebCol=dustPos=dustSize=dustStr=null; // uploaded; free the JS copies
  }
  // the cheap densities stay cached; only one heavy one is kept at a time
  for(const k of Object.keys(gxyCache)){
    if(gxyCache[k].D >= 12 && k !== key){
      const old = gxyCache[k];
      deleteVAO(old.g); deleteVAO(old.nb); deleteVAO(old.d);
      deleteVAO(old.a.a); if(old.a.an) deleteVAO(old.a.an); if(old.a.ad) deleteVAO(old.a.ad);
      delete gxyCache[k];
    }
  }
  const c=gxyCache[key];
  N_GXY=c.n[0]; NEB_N=c.n[1]; DUST_N=c.n[2];
  [NEB_PINK, NEB_GLOW, AND_PINK, AND_GLOW] = c.seg;
  [NUC0, NUC1] = c.nuc || [0, 0];
  N_AND=c.a.n[0]; N_ANDN=c.a.n[1]; N_ANDD=c.a.n[2];
  vaoGxy=c.g; vaoNeb=c.nb; vaoDust=c.d; curD=D;
  vaoAnd=c.a.a; vaoAndNeb=c.a.an; vaoAndDust=c.a.ad;
  if(D >= 5) loadGaiaDeep();
}

// nebulae: same vertex logic but a much larger sprite cap, and a coreless glow falloff
const NEB_FS = `#version 300 es
precision mediump float;
uniform float uGFade;  // galaxy-haze pass only: dies away when the camera is in close
in vec3 vColor; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  float a = pow(1.0-r, 2.1)*uGFade;
  o = vec4(vColor*a, a);
}`;
const pNeb = prog(PT_VS, NEB_FS);
const UN = {
  minSz: gl.getUniformLocation(pNeb,'uMinSz'),
  gal: gl.getUniformLocation(pNeb,'uGal'), grot: gl.getUniformLocation(pNeb,'uGRot'),
  goff: gl.getUniformLocation(pNeb,'uGOff'), merge: gl.getUniformLocation(pNeb,'uMerge'),
  and: gl.getUniformLocation(pNeb,'uAnd'), tide: gl.getUniformLocation(pNeb,'uTide'),
  warpAmp: gl.getUniformLocation(pNeb,'uWarpAmp'),
  time: gl.getUniformLocation(pNeb,'uTime'), vm: gl.getUniformLocation(pNeb,'uVarMode'),
  wa:   gl.getUniformLocation(pNeb,'uWaveAll'),
  cap:  gl.getUniformLocation(pNeb,'uCap'),
  org:  gl.getUniformLocation(pNeb,'uOrg'),
  proj: gl.getUniformLocation(pNeb,'uProj'),
  view: gl.getUniformLocation(pNeb,'uView'),
  px:   gl.getUniformLocation(pNeb,'uPx'),
  spin: gl.getUniformLocation(pNeb,'uSpin'),
  warp: gl.getUniformLocation(pNeb,'uWarp'),
  sun:  gl.getUniformLocation(pNeb,'uSunPos'),
  gf:   gl.getUniformLocation(pNeb,'uGFade')
};

// dust: soft sprites that darken instead of glow (drawn with a multiplying blend)
const DUST_FS = `#version 300 es
precision mediump float;
in vec3 vColor; out vec4 o;
void main(){
  vec2 q = gl_PointCoord*2.0-1.0;
  float r = length(q);
  if(r>1.0) discard;
  // never opaque at the centre: a cloud thins the haze behind it, it does not punch
  // a black hole in it (that is what the old profile did, reaching alpha 1 and past)
  // interstellar dust reddens: the blend multiplies what is behind by 1 − rgb, and the
  // extinction runs A_R : A_V : A_B ≈ 0.82 : 1 : 1.32 (R_V = 3.1), so blue goes first
  float a = min(0.72, pow(1.0-r, 2.4)*vColor.r);
  o = vec4(a*vec3(0.62, 0.76, 1.0), a);
}`;
const pDust = prog(PT_VS, DUST_FS);
// Sprite ceiling for the dust when the camera is in close. Measured, not reasoned: with
// the backdrop drawn beneath the dust (see insideDisk) 40 px carves a dark lane along the
// band and across the core and leaves the HII glow standing above it — the Rift as seen
// from inside. 120 and 220 were tried and crush the whole band to a scatter of stars: the
// multiply compounds, and larger discs overlap everywhere.
let DUST_DEEP_CAP = 40.0;
const UD = {
  minSz: gl.getUniformLocation(pDust,'uMinSz'),
  gal: gl.getUniformLocation(pDust,'uGal'), grot: gl.getUniformLocation(pDust,'uGRot'),
  goff: gl.getUniformLocation(pDust,'uGOff'), merge: gl.getUniformLocation(pDust,'uMerge'),
  and: gl.getUniformLocation(pDust,'uAnd'), tide: gl.getUniformLocation(pDust,'uTide'),
  warpAmp: gl.getUniformLocation(pDust,'uWarpAmp'),
  wa:   gl.getUniformLocation(pDust,'uWaveAll'),
  cap:  gl.getUniformLocation(pDust,'uCap'),
  org:  gl.getUniformLocation(pDust,'uOrg'),
  proj: gl.getUniformLocation(pDust,'uProj'),
  view: gl.getUniformLocation(pDust,'uView'),
  px:   gl.getUniformLocation(pDust,'uPx'),
  spin: gl.getUniformLocation(pDust,'uSpin'),
  warp: gl.getUniformLocation(pDust,'uWarp'),
  sun:  gl.getUniformLocation(pDust,'uSunPos')
};
// setGalaxy(1) is called after the Andromeda section below: its constants
// (R_A, the satellite offsets) are const bindings the generator needs live.

// ---------- Andromeda ----------
// M31 drawn the way the Milky Way is: from a photographic probability map. m31-map.webp
// is the Hubble PHAT+PHAST panorama (heic2501a, ~200 million resolved stars) deprojected
// to face-on by tools/build_m31_map.py — stars sampled from its luminance, dust from its
// dark lanes, HII regions from its blue excess (the mosaic's filter palette codes them
// blue-white; they are drawn in Hα pink like our own). Only sky-plane positions are
// measured: the third dimension — disk thickness, bulge, halo — is modelled, and the
// info panel says so. Positions are generated in M31's own flat disk frame; its real
// orientation (uGRot) and moving centre (uGOff) are applied in the shader.
const R_A = 2245;                        // M31's R25, 20.6 kpc, at true scale
const M31_MAP_SCALE = R_A/188.6;         // scene units per map pixel
function mapXZ31(i, spread){
  const n=m31Map.n, c0=(n-1)/2;
  const u=(i%n)+Math.random()-0.5+gauss()*spread, v=((i/n)|0)+Math.random()-0.5+gauss()*spread;
  return [ (u-c0)*M31_MAP_SCALE, -(v-c0)*M31_MAP_SCALE ];
}
// satellites and debris, at their measured sky offsets; depths are modelled
const M32_C  = [-150, -80, 530];         // compact elliptical, ~5 kpc off the nucleus
const M110_C = [760, 240, -420];         // NGC 205, ~8.5 kpc the other side
const GSS_DIR = [0.355, -0.457, -0.833]; // the Giant Southern Stream's plume
function genAndromeda(D){                // fallback when the map has not loaded
  N_AND = Math.round(52000*D); N_ANDN = 0; N_ANDD = 0; AND_PINK = 0; AND_GLOW = 0;
  const BS = 1/Math.sqrt(D);
  const pos=new Float32Array(N_AND*3), size=new Float32Array(N_AND), col=new Float32Array(N_AND*3);
  const PITCH_A = Math.tan(14*Math.PI/180);
  for(let i=0;i<N_AND;i++){
    let x,y,z,b,s;
    if(i<0.155*N_AND){                            // M31's large classical bulge
      const r=Math.abs(gauss())*120, th=Math.random()*6.28318;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*85;
      b=.30+Math.random()*.34; s=2.6+Math.random()*2.2;
      col[i*3]=b*1.2; col[i*3+1]=b*.92; col[i*3+2]=b*.6;
    } else if(i<0.367*N_AND){                     // its smooth inner disk
      const r=expR(220,R_A,340), th=Math.random()*6.28318;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*13;
      b=.07+Math.random()*.09; s=1.5+Math.random()*1.4;
      col[i*3]=b*.9; col[i*3+1]=b*.93; col[i*3+2]=b*1.08;
    } else {                                      // the famous ring-like arms
      const arm = (i%2)*Math.PI;
      const r = 480+Math.pow(Math.random(),0.85)*(R_A-480);
      const th = arm - Math.log(r/480)/PITCH_A + gauss()*0.075;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*9;
      const roll=Math.random();
      if(roll<0.05){ col[i*3]=.9; col[i*3+1]=.5; col[i*3+2]=.6; s=2.8+Math.random()*2.0; }
      else if(roll<0.16){ col[i*3]=.55; col[i*3+1]=.68; col[i*3+2]=.98; s=2.5+Math.random()*2.0; }
      else { b=.16+Math.random()*.19; col[i*3]=b*.85; col[i*3+1]=b*.95; col[i*3+2]=b*1.15; s=1.6+Math.random()*1.7; }
    }
    col[i*3]*=BS; col[i*3+1]*=BS; col[i*3+2]*=BS;
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;       // flat: uGRot orients the disk
    size[i]=s*Math.pow(D,-0.12);
  }
  return { a: pointVAO(pos, size, col), an: null, ad: null, n: [N_AND, 0, 0] };
}
function genAndromedaMap(D){
  N_AND = Math.round(58000*D);
  const BS = 1/Math.sqrt(D), SS = Math.pow(D,-0.12);
  const NBS = Math.max(Math.pow(D,-0.7), 0.25), DS = 1/D, Dg = Math.min(D, 8);
  const m = m31Map, pxd = m.px;
  const pos=new Float32Array(N_AND*3), size=new Float32Array(N_AND);
  const col=new Float32Array(N_AND*3), wav=new Float32Array(N_AND);
  const HALO = Math.round(N_AND*0.05);     // M31's halo is bigger than ours
  const GSS  = Math.round(N_AND*0.015);    // the Giant Southern Stream
  const M32N = Math.round(N_AND*0.008), M110N = Math.round(N_AND*0.011);
  for(let i=0;i<N_AND;i++){
    let X,Y,Z,cr,cg,cb,s,wv=0;
    if(i<HALO){
      const rr=160+Math.abs(gauss())*1350, th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
      X=rr*Math.sin(ph)*Math.cos(th); Z=rr*Math.sin(ph)*Math.sin(th); Y=rr*Math.cos(ph)*0.8;
      const b=.05+Math.random()*.06; cr=b*1.05; cg=b*.95; cb=b*.85; s=1.6+Math.random()*1.4;
    } else if(i<HALO+GSS){
      // metal-rich debris of a shredded satellite, arcing far past the disk edge
      const u=Math.pow(Math.random(),0.7), d=500+5200*u, w=(230+260*u);
      X=GSS_DIR[0]*d+gauss()*w; Y=GSS_DIR[1]*d+gauss()*w*0.6; Z=GSS_DIR[2]*d+gauss()*w;
      const b=.05+Math.random()*.05; cr=b*1.06; cg=b*.9; cb=b*.72; s=1.5+Math.random()*1.2;
    } else if(i<HALO+GSS+M32N){
      const r=Math.pow(Math.abs(gauss()),1.6)*15;
      const th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
      X=M32_C[0]+r*Math.sin(ph)*Math.cos(th); Y=M32_C[1]+r*Math.cos(ph); Z=M32_C[2]+r*Math.sin(ph)*Math.sin(th);
      const b=.22+Math.random()*.34; cr=b*1.1; cg=b*.95; cb=b*.72; s=1.7+Math.random()*1.5;
    } else if(i<HALO+GSS+M32N+M110N){
      X=M110_C[0]+gauss()*115; Y=M110_C[1]+gauss()*62; Z=M110_C[2]+gauss()*115;
      const b=.06+Math.random()*.08; cr=b*1.0; cg=b*.95; cb=b*.88; s=1.5+Math.random()*1.2;
    } else {
      const pI = mapPick(m.starC);
      const w = mapXZ31(pI, 0.35); X=w[0]; Z=w[1];
      const l = m.lum[pI], rw = Math.hypot(X,Z);
      const bulge = l*Math.exp(-(rw*rw)/(300*300));    // its big classical bulge, puffed to 3D
      Y = gauss()*(11 + Math.max(0,rw-1350)*0.014 + 95*bulge);
      const gain = (0.15 + 0.9*Math.pow(l, 1.1)) * (Math.random()<0.03 ? 2.2 : 1)
                 * (1 + 0.25*M31_ARM_K*m.ridge[pI]);     // an arm's stars are the bright young ones
      cr = pxd[pI*4]/255*gain*0.99; cg = pxd[pI*4+1]/255*gain; cb = pxd[pI*4+2]/255*gain*1.06;
      s = 1.4 + Math.random()*1.8 + (l>0.72 ? Math.random()*1.2 : 0);
      wv = (l > m.blur[pI]*1.10 || rw < 500) ? 1 : 0;
    }
    pos[i*3]=X; pos[i*3+1]=Y; pos[i*3+2]=Z; wav[i]=wv;
    size[i]=s*SS; col[i*3]=cr*BS; col[i*3+1]=cg*BS; col[i*3+2]=cb*BS;
  }
  const av = pointVAO(pos, size, col, wav);
  // HII in Hα pink, the star-forming ring first; then the unresolved haze; then the core
  const PINK_N = Math.round(2200*D), GLOW_N = Math.round(3200*Dg), CORE_N = Math.round(800*Dg);
  N_ANDN = PINK_N + GLOW_N + CORE_N;
  AND_PINK = PINK_N; AND_GLOW = GLOW_N;
  const nPos=new Float32Array(N_ANDN*3), nSize=new Float32Array(N_ANDN), nCol=new Float32Array(N_ANDN*3);
  for(let q=0;q<PINK_N;q++){
    const pI = mapPick(m.nebC);
    const w = mapXZ31(pI, 0.8);
    nPos[q*3]=w[0]; nPos[q*3+1]=gauss()*5; nPos[q*3+2]=w[1];
    nSize[q]=16+Math.random()*40;
    const j=(0.7+Math.random()*0.6)*NBS;
    nCol[q*3]=.16*j; nCol[q*3+1]=.055*j; nCol[q*3+2]=.09*j;
  }
  const gGain = 0.19/Dg;
  for(let q=PINK_N;q<PINK_N+GLOW_N;q++){
    const pI = mapPick(m.hazeC || m.starC);
    const w = mapXZ31(pI, 1.1);
    const l = m.lum[pI], rw = Math.hypot(w[0], w[1]);
    nPos[q*3]=w[0];
    nPos[q*3+1]=gauss()*(6 + 44*l*Math.exp(-(rw*rw)/(300*300)));
    nPos[q*3+2]=w[1];
    nSize[q]=60+Math.random()*130;
    const j=(0.7+Math.random()*0.6)*gGain*(0.4+l);
    nCol[q*3]=m.px[pI*4]/255*j*0.99; nCol[q*3+1]=m.px[pI*4+1]/255*j; nCol[q*3+2]=m.px[pI*4+2]/255*j*1.06;
  }
  for(let q=PINK_N+GLOW_N;q<N_ANDN;q++){
    const u=gauss()*180, v=gauss()*140;    // rounder than our barred centre
    nPos[q*3]=u; nPos[q*3+1]=gauss()*Math.max(12,46-Math.hypot(u,v)*0.14); nPos[q*3+2]=v;
    nSize[q]=40+Math.random()*95;
    const j=(0.7+Math.random()*0.6)*0.30/Dg;
    nCol[q*3]=1.00*j; nCol[q*3+1]=0.80*j; nCol[q*3+2]=0.52*j;
  }
  const anv = pointVAO(nPos, nSize, nCol);
  N_ANDD = Math.round(3000*D);
  const dPos=new Float32Array(N_ANDD*3), dSize=new Float32Array(N_ANDD), dStr=new Float32Array(N_ANDD*3);
  for(let q=0;q<N_ANDD;q++){
    const pI = mapPick(m.dustC);
    const w = mapXZ31(pI, 0.5);
    dPos[q*3]=w[0]; dPos[q*3+1]=gauss()*5; dPos[q*3+2]=w[1];
    dSize[q]=16+Math.random()*28;
    const dk = Math.max(0, m.blur[pI]-m.lum[pI]);
    dStr[q*3]=(0.35+4.5*dk)*DS*(0.7+Math.random()*0.6);
  }
  const adv = pointVAO(dPos, dSize, dStr);
  return { a: av, an: anv, ad: adv, n: [N_AND, N_ANDN, N_ANDD] };
}
// How much the arms are favoured when Andromeda is drawn from its map: the star and HII
// density on a ridge is (1 + M31_ARM_K × ridge), the haze 60% of that, each star's light
// (1 + a quarter of that). The map's ridges are only ~0.08 high on average (clamped at
// 0.3), so 3 did nothing measurable and 12 little; at the screen's own scale 24 lifts the
// star layer's arm-to-interarm contrast from ~1.5 to ~2 — the picture holds no more
// (sweep in the working notes).
const M31_ARM_K = 24.0;
function loadM31Map(){
  fetch('m31-map.webp').then(r => r.ok ? r.blob() : Promise.reject())
    .then(b => createImageBitmap(b))
    .then(bm => {
      const n = 448, cv = document.createElement('canvas');
      cv.width = cv.height = n;
      const cx2 = cv.getContext('2d');
      cx2.drawImage(bm, 0, 0, n, n);
      const px = cx2.getImageData(0, 0, n, n).data;
      const lum = new Float32Array(n*n);
      for(let i=0;i<n*n;i++) lum[i] = (px[i*4]+px[i*4+1]+px[i*4+2])/765;
      const blur = new Float32Array(lum), tb = new Float32Array(n*n);
      for(let pass=0; pass<3; pass++){
        for(let y=0;y<n;y++) for(let x=0;x<n;x++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=x+k; if(q>=0&&q<n){ s+=blur[y*n+q]; c++; } }
          tb[y*n+x]=s/c;
        }
        for(let x=0;x<n;x++) for(let y=0;y<n;y++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=y+k; if(q>=0&&q<n){ s+=tb[q*n+x]; c++; } }
          blur[y*n+x]=s/c;
        }
      }
      // A second, wider blur for the arms only (box 9, four passes, ~20 px): the arms are
      // 15–25 px wide in this map, and a ridge is only as tall as the blur it is measured
      // against. The 5-px blur above stays as it is — the dust lanes and the wave flag read it.
      const wide = new Float32Array(lum);
      for(let pass=0; pass<4; pass++){
        for(let y=0;y<n;y++) for(let x=0;x<n;x++){
          let s=0,c=0; for(let k=-4;k<=4;k++){ const q=x+k; if(q>=0&&q<n){ s+=wide[y*n+q]; c++; } }
          tb[y*n+x]=s/c;
        }
        for(let x=0;x<n;x++) for(let y=0;y<n;y++){
          let s=0,c=0; for(let k=-4;k<=4;k++){ const q=y+k; if(q>=0&&q<n){ s+=tb[q*n+x]; c++; } }
          wide[y*n+x]=s/c;
        }
      }
      const c0 = (n-1)/2, R = 188.6;
      const star = new Float32Array(n*n), neb = new Float32Array(n*n), dust = new Float32Array(n*n);
      const haze = new Float32Array(n*n), ridge = new Float32Array(n*n);
      for(let i=0;i<n*n;i++){
        const x=i%n, y=(i/n)|0, r=Math.hypot(x-c0, y-c0);
        if(r > R*1.06) continue;
        const l = lum[i];
        // The arms are ridges: brighter than their own neighbourhood, by a fraction that the
        // picture carries at only 10–20% over most of the disk. Raising the luminance to a
        // power favours the bulge, not the arms; so the stars are weighted by how far a
        // pixel rises above its blur — zero on the smooth disk and in the bulge's centre,
        // where nothing rises above anything — and the haze keeps the unboosted weight, so
        // the unresolved light between the arms stays the smooth thing it is.
        // clamped: a handful of pixels rise 2× above their surroundings (single clumps),
        // and without the clamp they alone would carry a tenth of the disk's stars
        ridge[i] = Math.min(0.3, Math.max(0, l - wide[i]) / (wide[i] + 0.04));
        const base = Math.pow(Math.max(0, l-0.012), 1.5);
        star[i] = base * (1 + M31_ARM_K*ridge[i]);
        haze[i] = base * (1 + 0.6*M31_ARM_K*ridge[i]);   // the unresolved light follows the arms too
        // the Hubble palette codes HII and young stars blue-white: read the blue excess
        const be = Math.max(0, px[i*4+2]/255 - (px[i*4]+px[i*4+1])/510 - 0.02);
        neb[i]  = be*l*(1 + M31_ARM_K*ridge[i]);   // the HII knots are what trace an arm in any photograph
        dust[i] = r>28 ? Math.max(0, blur[i]-l)*Math.min(1, l*4+0.2) : 0;
      }
      const cum = a => { const c=new Float32Array(a.length); let s=0;
        for(let i=0;i<a.length;i++){ s+=a[i]; c[i]=s; } return c; };
      m31Map = { n, px, lum, blur, ridge, starC:cum(star), hazeC:cum(haze), nebC:cum(neb), dustC:cum(dust) };
      flushGxyCache();
      setGalaxy(curD);
    })
    .catch(()=>{});   // opened from disk: the schematic Andromeda stands in
}
const MAT3_ID = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
for(const [pr, gr] of [[pPt,U.ptGRot],[pNeb,UN.grot],[pDust,UD.grot]]){
  gl.useProgram(pr); gl.uniformMatrix3fv(gr, false, MAT3_ID);
}
setGalaxy(1);   // real default ("low") applied after full init, below — see hadSaved
// The orbit follows the Gaia-era picture (van der Marel et al.; Sawala et al., Nature
// Astronomy 2025): a first passage ~4.5 Gyr from now at ~95 kpc — the disks never touch,
// they trade bridges — then dynamical friction bites, the passages shrink, and the pair
// coalesces about 8.8 Gyr from now. The 2025 ensemble gives only ~50% odds of merging
// within 10 Gyr at all; what is drawn is the median of the merging half, and the info
// panel says so. Andromeda approaches from its true direction (l=121.2°, b=−21.6°).
const M31_DIR = [0.7957, -0.3677, 0.4814];   // toward M31 today, scene coordinates
const M31_E2  = [0.3037, -0.4454, -0.8422];  // second axis of the orbital plane
// M31's disk frame in scene coordinates, from its measured PA 38°, inclination 77°,
// near side NW, NE side approaching — the spin pole lands at galactic (242°, −30°),
// matching published values. Local y is minus the spin axis so a positive shader spin
// turns it its real way, the same convention the Milky Way is drawn with.
const M31_ROT = new Float32Array([
  -0.0926, 0.7115, 0.6965,     // local x: the major axis
   0.7623, 0.5007,-0.4102,     // local y
  -0.6406, 0.4930,-0.5887]);   // local z
const KPC2U = 1000*3.2616/30;  // scene units per kpc (true scale)
// (age Gyr, u kpc, v kpc) in the orbital plane; Hermite-interpolated below
const M31_ORBIT = [
  [ 3.0,   942,  -14],
  [ 4.568, 765,    0],   // today: 765 kpc, closing ~110 km/s, small tangential drift
  [ 6.6,   555,   18],
  [ 8.1,   305,   48],
  [ 8.85,  128,   78],
  [ 9.07,   18,   93],   // first passage, ~95 kpc
  [ 9.55, -172,   62],
  [10.35, -290,  -18],   // out to first apocentre
  [11.0,  -168,  -82],
  [11.45,   -8,  -40],   // second passage, ~41 kpc: bridges and tails
  [11.8,    68,   30],
  [12.0,    77,    8],   // second rebound, already shrunk by friction
  [12.3,     4,  -13],   // third passage: the disks interpenetrate
  [12.55,  -20,   -4],
  [12.8,    -7,    4],
  [13.05,    3,    1],
  [13.35,    0,    0],   // one remnant
  [20.0,     0,    0]];
function orbitUV(a){
  const O = M31_ORBIT, n = O.length;
  let i = 0;
  while(i < n-2 && a > O[i+1][0]) i++;
  const a0 = O[i][0], a1 = O[i+1][0], h = a1 - a0;
  const s = Math.min(1, Math.max(0, (a - a0)/h)), s2 = s*s, s3 = s2*s;
  const P0 = O[i], P1 = O[i+1], Pm = O[Math.max(0,i-1)], Pp = O[Math.min(n-1,i+2)];
  const out = [0,0];
  for(let k=1;k<=2;k++){
    const m0 = (P1[k]-Pm[k])/(a1-Pm[0])*h, m1 = (Pp[k]-P0[k])/(Pp[0]-a0)*h;
    out[k-1] = (2*s3-3*s2+1)*P0[k] + (s3-2*s2+s)*m0 + (-2*s3+3*s2)*P1[k] + (s3-s2)*m1;
  }
  return out;
}
// Separations are drawn at true scale out to ~83 kpc — every passage, honestly spaced —
// and log-compressed beyond, so today's 765 kpc looms at the edge of the drawn sky
// instead of 25 disk-diameters offstage. The info panel discloses the compression.
function sepScene(kpc){
  return kpc <= 82.8 ? kpc*KPC2U
       : 9000 + 4000*Math.log(kpc/82.8)/Math.log(765/82.8);
}
// Violent relaxation builds through the close passages rather than switching on: by the
// third pass the rings are already coming apart, as they would be. Everything that stops
// being true when the disks stop being disks reads this.
const MERGE_A0 = 11.7, MERGE_A1 = 13.4;   // Gyr: relaxation begins, remnant settled
const mergeAt = a => Math.min(1, Math.max(0, (a - MERGE_A0)/(MERGE_A1 - MERGE_A0)));
// The disk's accumulated rotation. The rate is the flat-curve speed, dying away as the
// merger scrambles the ordered disk into a spheroid — so this is the integral of
// V_GAL·(1 − mergeAt), linear before the merger, a parabola through it, constant after.
// An earlier build scaled the accumulated *angle* by (1 − merge) instead, which is not
// the same thing at all: with thirty laps already on the clock, that ran the whole disk
// backwards at four times its speed the moment relaxation began (galactic year ~51.7).
const MERGE_T0 = (MERGE_A0 - AGE0)*1e9/YR_PER_SIM, MERGE_T1 = (MERGE_A1 - AGE0)*1e9/YR_PER_SIM;
function diskSpin(ts){
  if(ts <= MERGE_T0) return ts*V_GAL;
  const w = MERGE_T1 - MERGE_T0, x = Math.min(ts, MERGE_T1) - MERGE_T0;
  return (MERGE_T0 + x - x*x/(2*w))*V_GAL;
}
const andPos = new Float32Array(3);
function updateAnd(){
  const a = ageGyr();
  const [u,v] = orbitUV(a);
  const kpc = Math.hypot(u, v);
  const sep = sepScene(Math.max(kpc, 1e-4));
  const s = sep/Math.max(kpc, 1e-6)/KPC2U;         // plane kpc -> scene, compression included
  for(let k=0;k<3;k++) andPos[k] = (u*M31_DIR[k] + v*M31_E2[k])*KPC2U*s;
  const tide = Math.min(1, Math.max(0, 1 - kpc/260));
  return { sep, kpc, tide, merge: mergeAt(a) };
}

// ---------- Kuiper belt & Oort cloud (follow the Sun) ----------
// main asteroid belt: real 2.1-3.3 AU radii with Kirkwood gaps; a second, remapped
// radius set places it between Mars and Jupiter in the compressed display layout
const AB_N = 1500;
var abRT=new Float32Array(AB_N*2), abRTd=new Float32Array(AB_N*2);
var abH=new Float32Array(AB_N), abHd=new Float32Array(AB_N);
var abSz=new Float32Array(AB_N), abP=new Float32Array(AB_N);
{
  const GAPS=[2.502,2.825,2.958]; // Kirkwood gaps: Jupiter's 3:1, 5:2, 7:3 resonances
  for(let i=0;i<AB_N;i++){
    let r;
    for(;;){ r=2.08+Math.pow(Math.random(),0.9)*1.19;
      let ok=true;
      for(const g of GAPS){ const d=Math.abs(r-g); if(d<0.045 && Math.random()>d/0.045){ ok=false; break; } }
      if(ok) break; }
    const th=Math.random()*6.28318;
    abRT[i*2]=r; abRT[i*2+1]=th;
    abRTd[i*2]=14+(r-1.524)/(5.203-1.524)*6; abRTd[i*2+1]=th; // Mars(14)..Jupiter(20); Ceres lands on its display 16
    abH[i]=gauss()*r*0.09; abHd[i]=gauss()*abRTd[i*2]*0.045;
    abSz[i]=0.22+Math.random()*0.34;
    abP[i]=Math.pow(r,1.5); // true Kepler period in years, used in both scale modes
  }
}
const KB_N = 1600;
var kbRT=new Float32Array(KB_N*2), kbH=new Float32Array(KB_N), kbSz=new Float32Array(KB_N);
for(let i=0;i<KB_N;i++){
  let r,h;
  if(Math.random()<0.7){ r=42+Math.random()*8;  h=gauss()*r*0.07; }  // classical belt (30–50 AU)
  else { r=44+Math.pow(Math.random(),0.7)*22;   h=gauss()*r*0.17; }  // scattered disk
  kbRT[i*2]=r; kbRT[i*2+1]=Math.random()*6.28318; kbH[i]=h; kbSz[i]=0.32+Math.random()*0.38;
}
const OO_N = 2400; // Oort cloud: symbolically close — really 2,000–100,000+ AU out
var ooOff=new Float32Array(OO_N*3), ooSz=new Float32Array(OO_N);
for(let i=0;i<OO_N;i++){
  const r=90+Math.pow(Math.random(),0.6)*85;
  const th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
  ooOff[i*3]=r*Math.sin(ph)*Math.cos(th); ooOff[i*3+1]=r*Math.cos(ph); ooOff[i*3+2]=r*Math.sin(ph)*Math.sin(th);
  ooSz[i]=0.6+Math.random()*0.6;
}
const KB_VS = `#version 300 es
layout(location=0) in vec2 aRT;  // orbit radius, initial angle
layout(location=1) in float aH;  // offset along the ecliptic normal
layout(location=2) in float aSz;
uniform mat4 uProj,uView; uniform float uPx,uT,uS;
uniform vec3 uSun,uE1,uE2,uEN;
void main(){
  float a = aRT.y + uT*6.28318/(165.0*pow(aRT.x/38.5,1.5)); // Kepler-scaled periods vs Neptune
  vec3 p = uSun + (cos(a)*aRT.x*uS)*uE1 + (sin(a)*aRT.x*uS)*uE2 + aH*uS*uEN;
  vec4 mv=uView*vec4(p,1.0); gl_Position=uProj*mv;
  gl_PointSize=clamp(aSz*uS*uPx/max(1e-9,-mv.z),1.0,9.0);
}`;
const AB_VS = `#version 300 es
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
}`;
const OO_VS = `#version 300 es
layout(location=0) in vec3 aOff;
layout(location=1) in float aSz;
uniform mat4 uProj,uView; uniform float uPx,uS; uniform vec3 uSun;
void main(){
  vec4 mv=uView*vec4(uSun+aOff*uS,1.0); gl_Position=uProj*mv;
  gl_PointSize=clamp(aSz*uS*uPx/max(1e-9,-mv.z),1.0,6.0);
}`;
const BELT_FS = `#version 300 es
precision mediump float; uniform vec3 uColor; uniform float uAlpha; out vec4 o;
void main(){ vec2 q=gl_PointCoord*2.0-1.0; float r=length(q); if(r>1.0) discard;
  float a=smoothstep(1.0,0.0,r)*uAlpha; o=vec4(uColor*a,a); }`;
const pKB = prog(KB_VS, BELT_FS), pOO = prog(OO_VS, BELT_FS), pAB = prog(AB_VS, BELT_FS);
const UA = {}; for(const k of ['uProj','uView','uPx','uT','uS','uSun','uE1','uE2','uEN','uColor','uAlpha']) UA[k]=gl.getUniformLocation(pAB,k);
const UK = {}; for(const k of ['uProj','uView','uPx','uT','uS','uSun','uE1','uE2','uEN','uColor','uAlpha']) UK[k]=gl.getUniformLocation(pKB,k);
const UO = {}; for(const k of ['uProj','uView','uPx','uS','uSun','uColor','uAlpha']) UO[k]=gl.getUniformLocation(pOO,k);
const vaoKB = gl.createVertexArray(); gl.bindVertexArray(vaoKB);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,kbRT,gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,kbH,gl.STATIC_DRAW);
gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,kbSz,gl.STATIC_DRAW);
gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,1,gl.FLOAT,false,0,0);
gl.bindVertexArray(null);
const bufAbSz=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufAbSz); gl.bufferData(gl.ARRAY_BUFFER,abSz,gl.STATIC_DRAW);
const bufAbP =gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufAbP);  gl.bufferData(gl.ARRAY_BUFFER,abP,gl.STATIC_DRAW);
function beltVAO(rt,h){
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,rt,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,h,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,bufAbSz); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,1,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,bufAbP);  gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3,1,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return vao;
}
const vaoABr = beltVAO(abRT, abH), vaoABd = beltVAO(abRTd, abHd);
const vaoOO = gl.createVertexArray(); gl.bindVertexArray(vaoOO);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,ooOff,gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,ooSz,gl.STATIC_DRAW);
gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
gl.bindVertexArray(null);

// Oort boundary: three great circles suggesting the spherical shell
const RING_SEGS=160;
var ringCS=new Float32Array(RING_SEGS*2);
for(let i=0;i<RING_SEGS;i++){ const a=i/RING_SEGS*6.28318530718; ringCS[i*2]=Math.cos(a); ringCS[i*2+1]=Math.sin(a); }
const RING_VS = `#version 300 es
layout(location=0) in vec2 aCS;
uniform mat4 uProj,uView; uniform vec3 uSun,uA,uB; uniform float uR;
void main(){ gl_Position = uProj*uView*vec4(uSun + uR*(aCS.x*uA + aCS.y*uB), 1.0); }`;
const RING_FS = `#version 300 es
precision mediump float; uniform vec3 uColor; out vec4 o;
void main(){ o=vec4(uColor,1.0); }`;
const pRing = prog(RING_VS, RING_FS);

// ---------- Earth and the Moon: spheres shaded in the fragment, as everything here ----------
// A point sprite whose fragment builds the sphere: the normal from the sprite coordinate,
// the lighting from the Sun's direction in view space, the surface from 3-D noise on the
// unit vector in the planet's own frame (spin axis, prime meridian), so the planet turns
// under its map and the map holds still. The Earth's surface is a MODEL of an era, not a
// map of the real continents: coastlines are noise, drifting slowly with the age.
const GLOBE_VS = `#version 300 es
uniform mat4 uProj,uView; uniform vec3 uPos; uniform float uSz;
void main(){ gl_Position = uProj*uView*vec4(uPos,1.0); gl_PointSize = uSz; }`;
const GLOBE_FS = `#version 300 es
precision highp float;
uniform vec3 uSunV, uAxisV, uPrimeV;     // view space: toward the Sun; the spin axis; the prime meridian on the equator
uniform float uAvg;                      // 1: the clock outruns the day — light is the daily mean by latitude
uniform float uMirror, uDisc, uTime, uMoon;
uniform float uMolten, uOcean, uSea, uHaze, uVeg, uIceLat, uCloud, uLights, uDrift;
uniform sampler2D uMap; uniform float uHasMap, uDry, uSeaLevel; uniform mat3 uPlate[7];
out vec4 o;
// today's real land and its plate, looked up for a planet-frame direction
vec3 mapAt(vec3 v){ float lat = asin(clamp(v.z,-1.0,1.0)), lon = atan(v.y, v.x);
  return texture(uMap, vec2(lon/6.2831853+0.5, 0.5-lat/3.14159265)).rgb; }
float h31(vec3 p){ p=fract(p*0.3183099+vec3(0.71,0.113,0.419)); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x), mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x), mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm3(vec3 p){ float a=0.5,s=0.0; for(int i=0;i<4;i++){ s+=a*vn3(p); p=p*2.07+vec3(1.3,2.1,0.7); a*=0.5; } return s; }
void main(){
  vec2 q = gl_PointCoord*2.0-1.0; q.y = -q.y; q.x *= uMirror;   // sprite space -> view space
  float rr = length(q)/uDisc;
  if(rr > 1.09) discard;
  if(rr > 1.0){                                                 // the atmosphere, beyond the limb
    if(uMoon > 0.5 || uMolten > 0.99) discard;
    float t = (rr-1.0)/0.09, glow = exp(-t*2.6)*(1.0-t);
    vec3 atm = mix(vec3(0.38,0.62,1.0), vec3(1.0,0.58,0.28), uHaze);
    vec2 d = q/max(length(q),1e-4);
    float side = smoothstep(-0.45, 0.45, dot(vec3(d,0.0), uSunV) + 0.35*uSunV.z);
    o = vec4(atm*glow*0.6*side*(0.35+0.65*uOcean), 0.0); return;   // additive
  }
  vec3 n = vec3(q/uDisc, sqrt(max(0.0, 1.0-rr*rr)));
  float lit = dot(n, uSunV);
  vec3 Q = cross(uAxisV, uPrimeV);
  vec3 p = vec3(dot(n,uPrimeV), dot(n,Q), dot(n,uAxisV));       // the planet's own frame; p.z = sin(latitude)
  // when a frame spans days the terminator would land somewhere new each time and strobe;
  // the light becomes the day's mean instead — brightest at the equator, dim at the poles
  lit = mix(lit, 0.18 + 0.62*pow(sqrt(max(0.0, 1.0 - p.z*p.z)), 0.7), uAvg);
  float day = smoothstep(-0.10, 0.18, lit), dif = max(lit, 0.0);
  float lat = abs(asin(clamp(p.z,-1.0,1.0)))*57.2958;
  vec3 col;
  if(uMoon > 0.5){
    // grey regolith, dark maria in the lowest of the low-frequency noise, and a pass of
    // fine crater texture; no atmosphere, so the terminator is hard
    float m = fbm3(p*2.4+vec3(4.0)), c = fbm3(p*13.0);
    float maria = smoothstep(0.66, 0.74, m);
    col = mix(vec3(0.56,0.55,0.53), vec3(0.28,0.28,0.30), maria) * (0.82+0.36*(c-0.5));
    col *= 0.04 + 0.96*pow(dif, 0.85);
    o = vec4(col, 1.0); return;
  }
  vec3 dr = vec3(uDrift, uDrift*0.7, -uDrift*0.4);
  float land, shallow, cont = 0.0;
  if(uHasMap > 0.5){
    // the real map: each plate carried by its own rotation. Every plate is asked, and
    // land wins over water: a plate's polygon carries ocean too, and where two moved
    // polygons overlap that ocean must not punch a hole in the other plate's land.
    // Between the plates, where none claims the point, there is sea.
    land = 0.0; shallow = 0.0;
    for(int k=0;k<7;k++){
      vec3 q = uPlate[k]*p; vec3 m = mapAt(q);
      if(int(floor(m.g*255.0/32.0+0.5)) == k){
        if(m.r > land){ land = m.r; cont = m.b; }
        else if(land <= 0.0) cont = max(cont, m.b);
      }
    }
    // the oceans retreat to their deepest basins as they go — the map has no depths, so
    // the continentality field stands in, inverted
    float water = (1.0-land) * smoothstep(uSeaLevel+0.04, uSeaLevel-0.04, cont);
    land = 1.0 - water;
    shallow = (1.0-land) * smoothstep(0.12, 0.45, cont);   // from 0.12: open water inside a plate's polygon reads as the water outside it, so no seams where a plate has moved
  } else {
    float h = fbm3(p*2.6 + dr) + 0.35*fbm3(p*7.0 + 1.7*dr) - 0.17;
    land = smoothstep(uSea-0.025, uSea+0.025, h);
    shallow = smoothstep(uSea-0.10, uSea, h);
    cont = land*0.5;
  }
  // the land: bare rock, greened by vegetation where it is not desert, whitened by ice.
  // Deserts: the subtropical belts, and the interiors far from any coast — the more so
  // in the dry periods, a supercontinent's heart most of all
  float dry = max(exp(-pow((lat-24.0)/11.0, 2.0)), pow(cont, 1.4)*(0.55 + 0.7*uDry));
  dry = min(1.0, dry*(0.8 + 0.5*uDry));
  float detail = fbm3(p*5.0+dr*2.0);                              // one texture, shared below
  vec3 rock = mix(vec3(0.42,0.32,0.22), vec3(0.62,0.52,0.36), detail);
  vec3 green = mix(vec3(0.15,0.30,0.09), vec3(0.28,0.42,0.14), fract(detail*1.7+0.3));
  vec3 landCol = mix(rock, green, uVeg*(1.0-dry*0.85));
  vec3 sea = mix(vec3(0.02,0.10,0.32), vec3(0.05,0.28,0.42), shallow*0.6);
  sea = mix(sea, vec3(0.06,0.14,0.18), uHaze*0.6);                // a dimmer, greener sea under the haze
  col = mix(sea, landCol, land);
  col = mix(col, vec3(0.42,0.34,0.24), (1.0-uOcean)*(1.0-land));  // a sea floor bared as the oceans go
  float ice = smoothstep(uIceLat-6.0, uIceLat+6.0, lat + 4.0*(detail-0.5)) * (1.0-uMolten);
  col = mix(col, vec3(1.0,1.0,1.0), ice);
  // clouds, drifting, and their shadows a little sunward of them on the ground
  vec3 cq = p*4.2 + vec3(uTime*0.012, 0.0, -uTime*0.007) + dr*0.3;
  float cl = fbm3(cq);
  float cloud = smoothstep(0.50 + 0.22*(1.0-uCloud), 0.74, cl) * min(1.0, uCloud*1.4);
  vec3 sunP = vec3(dot(uSunV,uPrimeV), dot(uSunV,Q), dot(uSunV,uAxisV));   // the Sun in the planet frame
  float clS = fbm3(cq + sunP*0.09*(1.0-uAvg));   // the shadow offset would jump with the Sun's phase
  float shadow = smoothstep(0.50 + 0.22*(1.0-uCloud), 0.74, clS) * min(1.0, uCloud*1.4);
  col *= 1.0 - 0.35*shadow*(1.0-cloud);
  col = mix(col, vec3(0.96,0.97,0.99), cloud*0.92);
  // the haze: an orange cast, thicker toward the limb
  col = mix(col, col*vec3(1.05,0.72,0.42)+vec3(0.10,0.05,0.0), uHaze*(0.45+0.45*(1.0-n.z)));
  // sunlight: snow and cloud scatter forward, so they hold their brightness under a low
  // sun; the terminator is softened by the air, and reddened in it
  float difS = mix(dif, pow(dif, 0.6), max(ice, cloud));
  float dusk = exp(-pow(lit/0.16, 2.0)) * uOcean;                               // the band around the terminator
  vec3 R = reflect(-uSunV, n);
  float spec = pow(max(R.z,0.0), 180.0) * (1.0-land) * (1.0-cloud) * uOcean * (1.0-uHaze*0.7) * (1.0-uAvg);
  col = col*(0.012 + 0.988*difS) + vec3(0.9,0.9,0.8)*spec*0.35;
  col += vec3(0.9,0.45,0.18) * dusk * 0.10 * (1.0-uHaze);
  // the air itself: Rayleigh blue over the day side, strongest where the view grazes it
  float fres = pow(1.0 - n.z, 2.2);
  vec3 air = mix(vec3(0.30,0.55,1.0), vec3(1.0,0.6,0.3), uHaze);
  col += air * fres * (0.10 + 0.45*day) * (0.4 + 0.6*uOcean) * (1.0-uMolten);
  // molten: the crust dark, cracked with lava, glowing on its own — only when it is
  if(uMolten > 0.001){
    float cracks = smoothstep(0.55, 0.78, fbm3(p*9.0+vec3(uTime*0.02)));
    vec3 lava = vec3(0.05,0.03,0.03)*(0.3+0.7*dif) + vec3(1.0,0.32,0.04)*(0.25+cracks*1.2);
    col = mix(col, lava, uMolten);
  }
  // the night side: cities, in the one era that has them, crossfading out through the dusk
  if(uLights > 0.001){
    float city = smoothstep(0.72, 0.9, vn3(p*70.0)) * land * (1.0-ice) * (1.0-dry*0.5);
    col += vec3(1.0,0.80,0.45) * city * uLights * smoothstep(0.12, -0.20, lit) * (1.0-cloud*0.7) * 0.9;
  }
  o = vec4(col, 1.0);
}`;
const pGlobe = prog(GLOBE_VS, GLOBE_FS);
const UG = {}; for(const k of ['uProj','uView','uPos','uSz','uSunV','uAxisV','uPrimeV','uAvg','uMirror','uDisc','uTime','uMoon',
  'uMolten','uOcean','uSea','uHaze','uVeg','uIceLat','uCloud','uLights','uDrift','uMap','uHasMap','uDry','uSeaLevel']) UG[k]=gl.getUniformLocation(pGlobe,k);
UG.uPlate = gl.getUniformLocation(pGlobe,'uPlate[0]');
// The real map: today's land from GSHHG (tools/build_earth_map.py), R land, G plate id,
// B continentality. Loaded like the galaxy maps; without it the globe falls back to noise.
let earthTex = null;
function loadEarthMap(){
  fetch('earth-map.webp').then(r => r.ok ? r.blob() : Promise.reject())
    .then(b => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }))
    .then(bm => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bm);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null); earthTex = t;
    }).catch(()=>{});
}
loadEarthMap();
// The plates: each carried by a rotation about a fixed pole, its angle keyed by time in
// Myr from today (negative past), interpolated between keys. A SCHEMATIC of the published
// reconstructions — the Atlantic opening from Pangaea, India's run north, Australia's,
// then the Atlantic closing and the continents gathering again into Pangaea Proxima —
// with the poles and angles chosen by hand to land the continents where the maps put
// them, not a plate model. Africa is the near-fixed reference. Order matches the map's ids.
const PLATE_MODEL = [
  { name:'Antarctica', pole:[5.0,-5.8], keys:[[-250,10.4], [-100,5.2], [0,0.0], [250,-22.9]] },
  { name:'India', pole:[-17.7,160.6], keys:[[-250,54.8], [-130,50.4], [-60,21.9], [-40,6.6], [0,0.0], [250,-5.5]] },
  { name:'Australia', pole:[-11.4,-129.6], keys:[[-250,36.5], [-60,32.9], [0,0.0], [250,-23.7]] },
  { name:'S. America', pole:[70.0,-17.4], keys:[[-250,43.1], [-130,43.1], [0,0.0], [100,-6.5], [250,32.3]] },
  { name:'N. America', pole:[45.0,80.5], keys:[[-250,40.0], [-180,40.0], [0,0.0], [100,-6.0], [250,32.0]] },
  { name:'Africa', pole:[0,110], keys:[[0,0], [250,-8]] },
  { name:'Eurasia', pole:[30,90], keys:[[-250,10], [0,0], [250,-4]] }
];
const plateMats = new Float32Array(63);
function plateAngle(keys, tMyr){
  if(tMyr <= keys[0][0]) return keys[0][1];
  for(let i=1;i<keys.length;i++) if(tMyr <= keys[i][0]){ const [t0,a0]=keys[i-1], [t1,a1]=keys[i]; return a0 + (a1-a0)*(tMyr-t0)/(t1-t0); }
  return keys[keys.length-1][1];
}
function fillPlateMats(tMyr){
  for(let k=0;k<7;k++){
    const m = PLATE_MODEL[k], la = m.pole[0]*Math.PI/180, lo = m.pole[1]*Math.PI/180;
    const ax = Math.cos(la)*Math.cos(lo), ay = Math.cos(la)*Math.sin(lo), az = Math.sin(la);
    const th = -plateAngle(m.keys, tMyr)*Math.PI/180;          // the inverse: from now back to then
    const c = Math.cos(th), sn = Math.sin(th), C = 1-c;
    const M = [ c+ax*ax*C, ax*ay*C-az*sn, ax*az*C+ay*sn,
                ay*ax*C+az*sn, c+ay*ay*C, ay*az*C-ax*sn,
                az*ax*C-ay*sn, az*ay*C+ax*sn, c+az*az*C ];       // rows
    const o = k*9;                                              // column-major for GLSL
    plateMats[o]=M[0]; plateMats[o+1]=M[3]; plateMats[o+2]=M[6];
    plateMats[o+3]=M[1]; plateMats[o+4]=M[4]; plateMats[o+5]=M[7];
    plateMats[o+6]=M[2]; plateMats[o+7]=M[5]; plateMats[o+8]=M[8];
  }
}
const vaoGlobe = (()=>{ const v=gl.createVertexArray(); gl.bindVertexArray(v); gl.bindVertexArray(null); return v; })();
// The Moon's orbit: its distance today, receding as it always has (3.8 cm/yr now, far faster
// when it was young) — a power law fitted to formation ~4.5 Gyr ago at a few Earth radii,
// not a dynamical model; Kepler's third law sets the period from the distance.
const MOON_D0 = 384400/1.496e8*AU2U, MOON_INC = 5.145*Math.PI/180, MOON_P0 = 27.3217/365.25;
const MOON_M1 = E1, MOON_M2 = [E2[0]*Math.cos(MOON_INC)+EN[0]*Math.sin(MOON_INC), E2[1]*Math.cos(MOON_INC)+EN[1]*Math.sin(MOON_INC), E2[2]*Math.cos(MOON_INC)+EN[2]*Math.sin(MOON_INC)];
const MOON_BORN = 0.06;                                  // Gyr: the Theia impact, as the scenario has it
const MOON_DIA = 2*(1737/1.496e8)*AU2U;                  // scene units, her true diameter
function moonDist(a){ return MOON_D0*Math.pow(Math.max(0.02, Math.min(3, (a - 0.05)/4.518)), 0.45); }
const moonW = new Float64Array(3), moonRel = new Float32Array(3);
function moonPos(t, out){                                // world position, doubles
  const a = AGE0 + t*YR_PER_SIM/1e9, d = moonDist(a), P = MOON_P0*Math.pow(d/MOON_D0, 1.5);
  const th = 2*Math.PI*t/P + 1.3;
  bodyPos(3, t, out);
  for(let k=0;k<3;k++) out[k] += d*(Math.cos(th)*MOON_M1[k] + Math.sin(th)*MOON_M2[k]);
  return out;
}
// Earth's spin axis: 23.44° from the ecliptic normal, tilted toward the direction that
// makes northern summer fall on the calendar's June — the piece's year phase is Jan 1.
const OBLIQ = 23.44*Math.PI/180;
const EARTH_AXIS = (()=>{ const psi = PHASE[3] + 2*Math.PI*0.471 + Math.PI, c=Math.cos(psi), s=Math.sin(psi);
  const e=[c*E1[0]+s*E2[0], c*E1[1]+s*E2[1], c*E1[2]+s*E2[2]];
  return [Math.cos(OBLIQ)*EN[0]+Math.sin(OBLIQ)*e[0], Math.cos(OBLIQ)*EN[1]+Math.sin(OBLIQ)*e[1], Math.cos(OBLIQ)*EN[2]+Math.sin(OBLIQ)*e[2]]; })();
const EARTH_P0 = (()=>{ const A=EARTH_AXIS, d=E1[0]*A[0]+E1[1]*A[1]+E1[2]*A[2]; const v=[E1[0]-d*A[0],E1[1]-d*A[1],E1[2]-d*A[2]];
  const l=Math.hypot(...v); return [v[0]/l,v[1]/l,v[2]/l]; })();
const SIDEREAL = 366.2422;                                 // rotations per year
let earthPhi0 = null;                                     // set once: Greenwich noon on 2026-01-01
function earthPrime(t, out){                              // the prime meridian's direction on the equator at t
  const A = EARTH_AXIS, P0 = EARTH_P0, Q0 = [A[1]*P0[2]-A[2]*P0[1], A[2]*P0[0]-A[0]*P0[2], A[0]*P0[1]-A[1]*P0[0]];
  if(earthPhi0 === null){
    // solve the spin phase so that the Sun stands over the prime meridian at that noon
    const tn = 0.5/365.25, e = new Float64Array(3); bodyPos(3, tn, e);
    const sx=-e[0]+org[0], sy=-e[1]+org[1], sz=-e[2]+org[2];   // toward the Sun, from Earth (org is the Sun now)
    const lam = Math.atan2(sx*Q0[0]+sy*Q0[1]+sz*Q0[2], sx*P0[0]+sy*P0[1]+sz*P0[2]);
    earthPhi0 = lam - 2*Math.PI*SIDEREAL*tn;
  }
  const w = 2*Math.PI*SIDEREAL*t + earthPhi0, c=Math.cos(w), sn=Math.sin(w);
  for(let k=0;k<3;k++) out[k] = c*P0[k] + sn*Q0[k];
  return out;
}
// The era: what the planet looks like at a given age, from the piece's own timeline and
// its climate model. Every number here is a model choice, disclosed in the info panel.
const clamp01 = x => Math.max(0, Math.min(1, x));
function earthEra(a, meanC){
  const molten = Math.max(clamp01((0.16 - a)/0.09), clamp01((a - 11.15)/0.12));          // Hadean, and under the giant
  const ocean  = clamp01((a - 0.15)/0.10) * clamp01((6.6 - a)/1.0);                       // late Hadean to the moist greenhouse
  const haze   = clamp01((2.55 - a)/0.45);                                                // methane haze until the Great Oxidation
  const veg    = clamp01((a - 4.12)/0.13) * clamp01((5.45 - a)/0.25);                     // land plants: Devonian on, starved ~0.9 Gyr ahead
  const landF  = ocean > 0 ? 0.06 + 0.23*clamp01((a - 0.3)/2.2) : 1;                      // continents grow through the Archean
  // the noise threshold that gives that land fraction: the fbm in the shader averages 0.48
  // with a spread of ~0.11, so 29% land sits 0.55σ above the mean and 6% at 1.55σ
  const sea    = ocean > 0 ? 0.485 + 0.113*(1.55 - 1.0*Math.min(1, landF/0.29)) : -1;   // ported and measured: 0.547 -> 29%, 0.660 -> 6%
  const snow   = Math.max(clamp01(1 - Math.abs(a - 2.20)/0.15), clamp01(1 - Math.abs(a - 3.885)/0.05));   // Huronian, Cryogenian
  // Ice from the climate model only in the Phanerozoic, where its greenhouse is roughly
  // right; earlier it reads the faint young Sun without the greenhouse that kept the
  // early oceans liquid, so before that the caps follow the rock record instead: none,
  // except the snowballs above and the Pongola (2.9 Ga) and Karoo (300 Ma) ice ages.
  let iceLat = a > 3.95 ? Math.max(18, Math.min(88, 90 - (18 - meanC)*5.5))                 // 15 °C -> ~74°; 11 -> ~52°; 5 -> ~18°
             : 95 - 40*clamp01(1 - Math.abs(a - 1.67)/0.06);                                // Pongola: caps to ~55° for a moment
  if(a > 4.03 && a <= AGE0 + 1e-6){
    // where there is a rock record it outranks the model: the Phanerozoic's three ice
    // ages, and no caps at all between them — the Permian–Triassic world of Pangaea and
    // the Cretaceous were hothouses. The HUD's glacial badge stays the model's own word.
    let rec = 88;
    rec = Math.min(rec, 95 - 50*clamp01(1 - Math.abs(a - 4.130)/0.010));                     // Ordovician–Silurian, 445–430 Ma
    if(a > 4.208 && a < 4.313) rec = Math.min(rec, 50 + 8*clamp01(Math.abs(a - 4.26)/0.05));  // Karoo, 360–255 Ma
    if(a >= 4.534) rec = Math.min(rec, a >= 4.565 ? 64 : 70);                                  // Antarctic ice from 34 Ma; both poles in the Pleistocene
    iceLat = rec;
  }
  if(a > 4.22 && a < 4.31) iceLat = Math.min(iceLat, 50);                                  // Karoo
  iceLat = Math.min(iceLat, 95 - 50*clamp01(1 - Math.abs(a - 4.123)/0.008));              // Ordovician (445 Ma)
  if(a > 4.44 && a < 4.51) iceLat = Math.max(iceLat, 89);                                  // the Cretaceous hothouse: no caps
  if(a > 4.75 && a < 4.85) iceLat = Math.min(iceLat, 62);                                  // Proxima: a supercontinent's caps
  iceLat = (1 - snow)*iceLat + snow*0;
  // dry periods: Pangaea's interior (Permian–Triassic), the Old Red Sandstone deserts of
  // the Devonian, and Proxima's; then the drying that ends the oceans
  const dry = Math.max(clamp01(1 - Math.abs(a - 4.32)/0.06), 0.6*clamp01(1 - Math.abs(a - 4.175)/0.03),
                       0.8*clamp01(1 - Math.abs(a - 4.80)/0.06), clamp01((a - 5.4)/0.8));
  const seaLevel = ocean >= 0.999 ? 1 : Math.pow(ocean, 0.5);
  if(ocean <= 0 || molten > 0) iceLat = 95;
  const cloud  = ocean*(0.55 + 0.35*clamp01((a - 5.3)/0.8))*(1 - molten);
  const lights = Math.abs(a - AGE0) < 2e-5 ? 1 : 0;                                       // twenty thousand years around now
  return { molten, ocean, sea: sea < 0 ? -2 : sea, haze, veg, iceLat, cloud, lights, drift: a*2.5, dry, seaLevel };
}
const vecV = (m, v) => [m[0]*v[0]+m[4]*v[1]+m[8]*v[2], m[1]*v[0]+m[5]*v[1]+m[9]*v[2], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]];
const norm3 = v => { const l = Math.hypot(v[0],v[1],v[2]) || 1; return [v[0]/l, v[1]/l, v[2]/l]; };
let globePx = 0, moonPx = 0, earthDbg = null, camSunDist = 150, avgLight = 0;
const UR = {}; for(const k of ['uProj','uView','uSun','uA','uB','uR','uColor']) UR[k]=gl.getUniformLocation(pRing,k);
const vaoRing = gl.createVertexArray(); gl.bindVertexArray(vaoRing);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,ringCS,gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
gl.bindVertexArray(null);

// bodies: dynamic positions, static size/color
const bodyPosArr = new Float32Array(NB*3);
const dispSizes = new Float32Array(BODIES.map(b=>b[3]));
const realSizes = new Float32Array(BODIES.map(b=>2*(b[6]/1.496e8)*AU2U)); // true diameters in scene units
const bodyCol = new Float32Array(NB*3);
BODIES.forEach((b,i)=>{ bodyCol[i*3]=b[4][0]; bodyCol[i*3+1]=b[4][1]; bodyCol[i*3+2]=b[4][2]; });
const vaoBodies = gl.createVertexArray(); gl.bindVertexArray(vaoBodies);
const bufBodyPos = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyPos); gl.bufferData(gl.ARRAY_BUFFER,bodyPosArr,gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
const bufBodySize = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufBodySize); gl.bufferData(gl.ARRAY_BUFFER,dispSizes,gl.STATIC_DRAW);
gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
// colours are dynamic too: the Sun's follows its temperature, and a planet being
// swallowed flares white for a moment
const bufBodyCol = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufBodyCol); gl.bufferData(gl.ARRAY_BUFFER,bodyCol,gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,3,gl.FLOAT,false,0,0);
gl.bindVertexArray(null);

// ---------- trails ----------
const TRAIL_N = 2400; let DT_SAMPLE = 0.01;  // sliding window: TRAIL_N samples, spacing set by the length slider
const trails = [], trailBufs = [], trailVaos = [];
for(let i=0;i<NB;i++){
  const a = new Float32Array(TRAIL_N*3);
  for(let k=0;k<TRAIL_N;k++){
    bodyPos(i, (k-(TRAIL_N-1))*DT_SAMPLE, tmp);
    a[k*3]=tmp[0]; a[k*3+1]=tmp[1]; a[k*3+2]=tmp[2];
  }
  trails.push(a);
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,a,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null);
  trailBufs.push(b); trailVaos.push(vao);
}
// Each planet's orbit as a closed heliocentric ring, sampled once: in this model the
// orbits neither precess nor decay, so the ring is the same at any epoch. It stands in
// for the swept trail wherever sweeping is impossible — inside the dive at high speed,
// a million orbits pass per second and no line can trace them, but the path they all
// follow is exactly this ring.
const RING_N = 96;
const ringVaos = [];
{
  const q = new Float64Array(3), s0 = new Float64Array(3);
  for(let i=0;i<NB;i++){
    if(i === 0){ ringVaos.push(null); continue; }
    const a = new Float32Array(RING_N*3);
    const P = BODIES[i][1];
    for(let k=0;k<RING_N;k++){
      const ts = k/RING_N*P;
      bodyPos(i, ts, q); bodyPos(0, ts, s0);
      a[k*3]=q[0]-s0[0]; a[k*3+1]=q[1]-s0[1]; a[k*3+2]=q[2]-s0[2];
    }
    const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
    const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null); vaoBufs.set(vao,[b]); ringVaos.push(vao);
  }
}
// In real scale everything but the Sun is stored as an offset from it.
let psH = true, psO = true;   // derived from the two transparency sliders: 0% is off
// Trails are stored as absolute positions minus a local anchor. Float32 alone cannot
// hold a position of magnitude ~900 to sub-AU precision — the error is about 7 AU,
// which at dive zoom is the whole frame — so the anchor keeps the stored numbers small
// and the draw passes (org - anchor), subtracted in double precision, as the origin.
const trailAnchor = new Float64Array(3);
function trailPos(i, ts, out){
  bodyPos(i, ts, out);
  out[0]-=trailAnchor[0]; out[1]-=trailAnchor[1]; out[2]-=trailAnchor[2];
  return out;
}
function pushTrail(i, ts){
  const a=trails[i];
  a.copyWithin(0,3);
  trailPos(i, ts, tmp);
  a[(TRAIL_N-1)*3]=tmp[0]; a[(TRAIL_N-1)*3+1]=tmp[1]; a[(TRAIL_N-1)*3+2]=tmp[2];
}

// ---------- star-formation history ----------
// The Galaxy's star formation is winding down: the gas reservoir is being consumed
// faster than it is replenished, so the rate decays with an e-folding time of order
// 6 Gyr. Ahead lies the Andromeda encounter, which shock-compresses the remaining gas
// into a starburst and then quenches it — the merged, gas-poor remnant forms almost
// nothing. Normalised so the present day is exactly 1.
const ageGyr = ()=> AGE0 + simT*YR_PER_SIM/1e9;
function sfrFactor(a){
  let f = Math.exp(-(a-AGE0)/6);                              // gas runs down
  f += 2.5*Math.exp(-Math.pow((a-11.45)/0.30,2));             // starburst at the second passage
  f += 8*Math.exp(-Math.pow((a-12.35)/0.40,2));               // and the big one at coalescence
  const q = 1/(1+Math.exp((a-12.95)/0.35));                   // then quenched for good
  return Math.max(0.02, f*(0.05+0.95*q));
}
function ratesIntegral(a){ // factor-weighted years between simT=0 and the shown epoch
  const N=360, h=(a-AGE0)/N; let s=0;
  for(let i=0;i<N;i++) s += sfrFactor(AGE0+h*(i+0.5))*h;
  return Math.abs(s)*1e9;
}

// ---------- Earth's galactic environment ----------
// Earth's temperature is set by the Sun, not by where the Sun sits in the Galaxy. What
// galactic position plausibly does change is the cosmic-ray flux: crossing a spiral arm
// means more nearby supernovae, and passing through the dense mid-plane adds more again.
// Shaviv and Svensmark proposed that this modulates low cloud cover and so the climate,
// matching the ~140 Myr spacing of the great ice ages. It remains contested, and it is
// drawn here as a hypothesis, not a result.
function rawCR(ts){
  const rel = ts*V_GAL*(1/R_GAL - 1/640);        // Sun's angle within the spiral pattern
  let best = 9;
  for(const a of ARMS){
    let d = rel - armAngle(R_GAL, a[0]);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    best = Math.min(best, Math.abs(d));
  }
  const armProx = Math.exp(-Math.pow(best/0.45,2));
  const planeProx = 1 - Math.abs(Math.sin(2*Math.PI*ts/WOB_T + 2.1));
  return { cr: 1 + 2.2*armProx + 0.5*planeProx, armProx };
}
const CR0 = rawCR(0).cr;                          // normalise: today is 1.00x
function environment(){
  const r = rawCR(simT);
  // An elliptical has no spiral arms to cross. The arm term — and with it the ~140 Myr
  // glaciation spacing that the whole cosmic-ray/cloud argument rests on — fades out as
  // the remnant relaxes, rather than ticking on forever over a galaxy that no longer has
  // arms. What is left is a quenched galaxy's quieter cosmic-ray background.
  const spiral = 1 - mergeAt(ageGyr());
  const cr = (1 + (r.cr - 1)*spiral)/CR0;
  const dT = -5.5*(cr-1)/1.5;                     // the contested cloud coupling
  // What the Sun is doing dominates everything else once you look far enough ahead: the
  // equilibrium temperature goes as the fourth root of its output, so the cloud term above
  // only decides the climate while that output is near today's. Scaling the absolute
  // temperature keeps today exact (L = 1) and still reports a molten surface under a red
  // giant instead of a pleasant 10 degrees. The spread narrows the same way — a world with
  // no oceans and no ice cap has far less to separate its poles from its deserts.
  const L4 = Math.pow(sunState(ageGyr()).L, 0.25);
  const mean = (288.15 + dT)*L4 - 273.15;
  const spread = 1/Math.max(1, L4);
  return { cr, mean, min: mean - 104*spread, max: mean + 42*spread,
           star: 1 + 2.0*r.armProx*spiral, ice: mean < 11.2 };
}

// ---------- the real sky ----------
// The 100,000 brightest stars from AT-HYG 3.2 (Tycho-2 merged with Gaia DR3): 98.7%
// carry Gaia DR3 parallax distances, Hipparcos covers the bright ones Gaia saturates
// on. Rotated from equatorial into galactic coordinates and placed relative to the Sun,
// with galactic l=90 on +x — the direction the Sun orbits — which an earlier build had
// mirrored. Colours come from each star's measured colour index, sizes from apparent
// magnitude. This is the local sky only: Gaia sees the Galaxy from inside, and the far
// side of the disk is hidden behind dust, so the large-scale structure stays modelled.
let vaoGaia = null, N_GAIA = 0, gaiaOn = true;
function parseStarBin(buf){
  // 'GSK2': 20-byte records with a velocity; the old 16-byte layout still parses
  const v2 = buf.byteLength >= 4 && new DataView(buf).getUint32(0) === 0x47534B32;
  const off = v2 ? 4 : 0, rec = v2 ? 20 : 16;
  const n = Math.floor((buf.byteLength - off)/rec);
  const dv = new DataView(buf);
  const pos = new Float32Array(n*3), size = new Float32Array(n), col = new Float32Array(n*3);
  const vel = v2 ? new Float32Array(n*3) : null;
  for(let i=0;i<n;i++){
    const o = off + i*rec;
    pos[i*3]   = dv.getFloat32(o,   true);
    pos[i*3+1] = dv.getFloat32(o+4, true);
    pos[i*3+2] = dv.getFloat32(o+8, true);
    // the file stores hue and apparent magnitude; brightness and sprite size come
    // from the magnitude here, scaled to sit alongside the modelled star field
    const mag  = -2 + dv.getUint8(o+15)/255*14;
    const flux = Math.pow(2.512, (2 - mag)/2.5);
    const b    = Math.min(0.55, 0.042*flux);
    col[i*3]   = dv.getUint8(o+12)/255*b;
    col[i*3+1] = dv.getUint8(o+13)/255*b;
    col[i*3+2] = dv.getUint8(o+14)/255*b;
    size[i]    = Math.min(3.4, 0.72 + 0.9*Math.log10(1 + flux*4));
    if(vel){
      vel[i*3]   = dv.getInt8(o+16);
      vel[i*3+1] = dv.getInt8(o+17);
      vel[i*3+2] = dv.getInt8(o+18);
    }
  }
  return { n, vao: pointVAO(pos, size, col, null, vel) };
}
function loadGaiaStars(){
  fetch('stars-gaia.bin').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(buf => { const s = parseStarBin(buf); vaoGaia = s.vao; N_GAIA = s.n; })
    .catch(()=>{});   // opened from disk, where fetch is blocked: the modelled sky stands in
}
let vaoGaiaDeep = null, N_GAIA_DEEP = 0, deepAsked = false;
function loadGaiaDeep(){
  // the next 400,000 stars, 8 MB — fetched once, the first time a heavy quality is chosen
  if(deepAsked) return; deepAsked = true;
  fetch('stars-gaia-deep.bin').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(buf => { const s = parseStarBin(buf); vaoGaiaDeep = s.vao; N_GAIA_DEEP = s.n; })
    .catch(()=>{ deepAsked = false; });
}
loadGaiaStars();
loadGalaxyMap();
loadM31Map();

// ---------- Gliese 710 ----------
// A K7 dwarf, presently ~62 light years off and closing at 14.4 km/s. Gaia's astrometry
// (Bailer-Jones et al. 2018) puts its closest approach 1.29 Myr from now at 0.0676 pc —
// 13,944 AU, well inside the Oort cloud, and the closest stellar encounter known either
// side of the present. It is expected to shake comets loose for a few million years
// afterwards, a modest shower rather than a bombardment.
const G710_AT   = 1.29e6;              // years from now
const G710_PERI = 0.2204;              // light years at perihelion
const G710_V    = 4.804e-5;            // light years per year, from 14.4 km/s
const G710_DIR  = (()=>{ const v=[0.62,-0.34,0.71], n=Math.hypot(...v); return v.map(c=>c/n); })();
const G710_OFF  = (()=>{                // perihelion offset, perpendicular to the track
  const a=[0,1,0], d=G710_DIR;
  const dot=a[0]*d[0]+a[1]*d[1]+a[2]*d[2];
  const v=[a[0]-dot*d[0], a[1]-dot*d[1], a[2]-dot*d[2]], n=Math.hypot(...v);
  return v.map(c=>c/n);
})();
function g710(){                        // position relative to the Sun, in light years
  const s = (simT - G710_AT)*G710_V;
  const x = G710_OFF[0]*G710_PERI + G710_DIR[0]*s;
  const y = G710_OFF[1]*G710_PERI + G710_DIR[1]*s;
  const z = G710_OFF[2]*G710_PERI + G710_DIR[2]*s;
  return { x, y, z, d: Math.hypot(x,y,z) };
}
// ---------- life support ----------
// What actually ends life on Earth is the Sun, not the Galaxy. Solar luminosity climbs
// about 10% per Gyr; a moist greenhouse takes the oceans roughly a billion years from
// now, long before Andromeda arrives. Galactic position contributes a second hazard: a
// supernova within ~30 ly would strip the ozone layer, and that risk tracks the star
// formation rate and the cosmic-ray background.
let lifeOn = false;   // supernovae and births are opt-in
// The Sun's own life, on the standard track. On the main sequence luminosity follows
// the classic faint-young-Sun relation (Gough 1981): 70% of today's at formation,
// rising as the core contracts. It leaves the main sequence at ~10.9 Gyr, swells up
// the red giant branch to ~256 solar radii — past Earth's orbit — at ~12.17 Gyr, and
// after the helium flash and a second climb ends as a white dwarf at ~12.4 Gyr
// (Schröder & Smith 2008). Percentages are of the Sun as it is now.
const SUN_MS_END = 10.9, SUN_RGB_TIP = 12.17, SUN_HB = 12.30, SUN_AGB = 12.37, SUN_WD = 12.44;
const EARTH_ORBIT_RSUN = 215.0;    // 1 AU in solar radii
// The age at which the swelling surface first reaches Earth's orbit. Engulfment is a
// thing that happens once: the Sun contracts again after the tip, but the Earth does
// not come back, so the test is against this age rather than against today's radius.
const SUN_EAT_AGE = SUN_MS_END + (Math.log(EARTH_ORBIT_RSUN/1.6)/Math.log(256/1.6))*(SUN_RGB_TIP - SUN_MS_END);
function sunState(a){
  let L, R, phase;
  if(a < SUN_MS_END){
    L = 1/(1 + 0.4*(1 - a/4.57));
    R = 0.87 + 0.13*(a/4.57) + 0.6*Math.pow(Math.max(0,a-8)/2.9, 3);
    phase = a < 9.5 ? 'main sequence' : 'leaving the main sequence';
  } else if(a < SUN_RGB_TIP){
    const u = (a - SUN_MS_END)/(SUN_RGB_TIP - SUN_MS_END);
    R = 1.6*Math.exp(u*Math.log(256/1.6));
    L = 2.2*Math.exp(u*Math.log(2730/2.2));
    phase = 'red giant';
  } else if(a < SUN_HB){
    const u = (a - SUN_RGB_TIP)/(SUN_HB - SUN_RGB_TIP);
    R = 256*Math.exp(u*Math.log(10/256));
    L = 2730*Math.exp(u*Math.log(50/2730));
    phase = 'helium flash';
  } else if(a < SUN_AGB){
    const u = (a - SUN_HB)/(SUN_AGB - SUN_HB);
    R = 10*Math.exp(u*Math.log(180/10));
    L = 50*Math.exp(u*Math.log(3000/50));
    phase = 'asymptotic giant';
  } else if(a < SUN_WD){
    const u = (a - SUN_AGB)/(SUN_WD - SUN_AGB);
    R = 180*Math.exp(u*Math.log(0.0092/180));
    L = 3000*Math.exp(u*Math.log(0.5/3000));
    phase = 'planetary nebula';
  } else {
    R = 0.0092;
    // a fresh white dwarf is a tenth of today's Sun and fades from there
    L = Math.max(1e-6, 0.1*Math.exp(-(a - SUN_WD)/1.5));
    phase = 'white dwarf';
  }
  // Effective temperature from the two numbers the model already has: L = 4πR²σT⁴, so
  // T/T☉ = L^¼/√R. Nothing is tabulated for colour — the red of the giant, the orange of
  // the horizontal branch and the blue-white of the nebula's central star all fall out.
  const T = 5772*Math.pow(L, 0.25)/Math.sqrt(R);
  return { L, R, T, phase, eaten: a >= SUN_EAT_AGE, gone: a >= SUN_AGB };
}
// The age at which the swelling surface reaches a given radius on the first climb —
// the rule SUN_EAT_AGE follows, opened up so each inner planet gets its own moment.
const eatAge = rSun => SUN_MS_END + (Math.log(rSun/1.6)/Math.log(256/1.6))*(SUN_RGB_TIP - SUN_MS_END);
// Mercury, Venus, Earth (body indices 1-3), by orbit in solar radii. Mars at 327 R☉ is
// outside the 256 the giant reaches, and survives — as it does in the literature.
const EAT_AGES = [0, eatAge(0.387*EARTH_ORBIT_RSUN), eatAge(0.723*EARTH_ORBIT_RSUN), eatAge(EARTH_ORBIT_RSUN)];
const wasEaten = [false,false,false,false], eatFlash = [-1,-1,-1,-1];   // -1: no flare running
// The photosphere's palette by temperature: dark and bright tones for the disc shader
// and the far dot's colour, interpolated in log T between anchors. The 5772 K anchor is
// today's Sun exactly, so nothing about the present look changes.
const SUN_ANCHORS = [
  [ 2400, [0.62,0.05,0.01], [1.00,0.28,0.08], [1.00,0.36,0.14]],
  [ 3300, [0.85,0.14,0.02], [1.00,0.46,0.16], [1.00,0.52,0.24]],
  [ 4700, [1.00,0.33,0.06], [1.00,0.74,0.40], [1.00,0.70,0.38]],
  [ 5772, [1.00,0.45,0.10], [1.00,0.93,0.62], [1.00,0.86,0.55]],
  [ 8000, [0.92,0.66,0.42], [1.00,0.97,0.88], [1.00,0.96,0.86]],
  [15000, [0.62,0.72,1.00], [0.88,0.94,1.00], [0.80,0.88,1.00]],
  [60000, [0.55,0.65,1.00], [0.85,0.92,1.00], [0.72,0.82,1.00]],
];
function sunTint(T){
  const A = SUN_ANCHORS, lt = Math.log(Math.min(60000, Math.max(2400, T)));
  let i = 0; while(i < A.length-2 && lt > Math.log(A[i+1][0])) i++;
  const f = (lt - Math.log(A[i][0]))/(Math.log(A[i+1][0]) - Math.log(A[i][0]));
  const mix = k => A[i][k].map((v,c) => v + (A[i+1][k][c]-v)*f);
  return { d: mix(1), b: mix(2), dot: mix(3) };
}
// The planetary nebula: the shed envelope, drawn at its true size and stretched in time
// like every other death here. It grows through the phase from the giant's own radius
// to about half a light-year, then keeps spreading and fading into the white-dwarf era.
// A real one is gone in twenty thousand years; this lasts a third of a gigayear.
function pnState(a){
  if(a < SUN_AGB) return null;
  const u = Math.min(1, (a - SUN_AGB)/(SUN_WD - SUN_AGB));          // 0..1 through the phase
  const after = Math.max(0, a - SUN_WD);
  const rAU = 1 + 30000*u + 60000*Math.min(1, after/0.3);          // AU: ~0.5 ly, then ~1.4 ly
  const alpha = Math.min(1, u*3) * Math.max(0, 1 - after/0.3);
  if(alpha <= 0) return null;
  return { rAU, alpha, age: Math.min(1, 0.6*u + 0.4*Math.min(1, after/0.3)) };
}
function lifeState(){
  const a = ageGyr(), e = environment();
  let h = 0, why = 'stable';
  if(a < 0.65){ h = 1; why = 'magma ocean'; }                       // the Hadean
  const solar = Math.min(1, Math.max(0, (a - 5.35)/0.95));
  if(solar > h){ h = solar; why = a > 6.0 ? 'oceans boiled off' : 'the Sun is brightening'; }
  const rad = Math.min(1, Math.max(0, (sfrFactor(a)*e.cr - 1.8)/3.6));
  if(rad > h){ h = rad; why = 'supernovae & cosmic rays'; }
  return { h, why, label: h > 0.75 ? 'uninhabitable' : h > 0.33 ? 'endangered'
                        : h > 0.05 ? 'habitable' : 'excellent' };
}

// ---------- stellar life cycle: birth, death, supernovae ----------
// Rates are anchored to current measurements (see the info panel): the Milky Way forms
// ~2 solar masses of stars a year and hosts ~2 supernovae per century. On the compressed
// galactic clock (1 sim-yr ~ 1.19 Myr) births are drawn at the real rate scaled to the
// point sampling (~2.2 per sim-yr per density unit); featured supernovae are a sampled
// fraction of the true ~24,000 per sim-yr, which would be a continuous glitter.
let varOn = true; let shimT = 0; // variability clock (wall time, runs even when paused)

// ---------- sound: everything synthesized live via Web Audio — no samples, still one file ----------
let soundOn = false, sfxVol = 0, audio = null;   // silence is the off position
const sfxLast = {};
function initAudio(){
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
  const master = ctx.createGain(); master.gain.value = soundOn?sfxVol:0; master.connect(comp);
  // Ambient drone. It needs energy above ~150 Hz or laptop and phone speakers reproduce
  // nothing at all, so the deep sines carry a set of quieter mid partials with them.
  const droneG = ctx.createGain(); droneG.gain.value = 1; droneG.connect(master);
  const padG = ctx.createGain(); padG.gain.value = 0.20; padG.connect(droneG);
  for(const [f,g0] of [[55,0.34],[55.6,0.34],[110.4,0.26],[165.3,0.15],[220.6,0.10],[330.9,0.05]]){
    const o = ctx.createOscillator(); o.type='sine'; o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = g0;
    o.connect(g); g.connect(padG); o.start();
  }
  const nbuf = ctx.createBuffer(1, ctx.sampleRate*4, ctx.sampleRate);
  const nd = nbuf.getChannelData(0); let v = 0;
  for(let i=0;i<nd.length;i++){ v = v*0.98 + (Math.random()*2-1)*0.04; nd[i] = v*6; }
  const ns = ctx.createBufferSource(); ns.buffer = nbuf; ns.loop = true;
  const nf = ctx.createBiquadFilter(); nf.type='lowpass'; nf.frequency.value = 140;
  const ng = ctx.createGain(); ng.gain.value = 0.5;
  ns.connect(nf); nf.connect(ng); ng.connect(padG); ns.start();
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
  const lg = ctx.createGain(); lg.gain.value = 0.06;
  lfo.connect(lg); lg.connect(padG.gain); lfo.start();
  return {ctx, master, comp, droneG};
}
// background music: two ambient tracks shipped alongside this page (music/*.mp3).
// Kept as separate files rather than embedded: 10 MB of base64 would bloat the HTML
// past any sane single-file limit, and this way nothing is fetched until music is on.
const TRACKS = [
  {src:'music/galactic-year-remix-1.mp3', name:'Galactic Year — Remix I'},
  {src:'music/galactic-year-1.mp3', name:'Galactic Year I'},
  {src:'music/galactic-year-2.mp3', name:'Galactic Year II'},
];
let musicOn = true, musicVol = 0.40, trackIx = 0;
const player = new Audio();
player.preload = 'none';
player.volume = musicVol;
player.addEventListener('ended', ()=> nextTrack());
player.addEventListener('error', ()=>{ $('trackName').textContent = 'track unavailable'; });
function showTrack(){ $('trackName').textContent = (trackIx+1)+'/'+TRACKS.length+' · '+TRACKS[trackIx].name; }
function playTrack(){
  if(!musicOn) return null;
  const q = player.play();
  if(q && q.catch) q.catch(()=> armUnlock()); // autoplay blocked until the first gesture
  return q;                                   // handed back so the unlock can wait on it
}
function loadTrack(i){
  trackIx = (i + TRACKS.length) % TRACKS.length;
  player.src = TRACKS[trackIx].src;
  showTrack();
  return playTrack();
}
function nextTrack(){ loadTrack(trackIx + 1); }
// Browsers refuse audio before a user gesture, so anything on by default waits for one.
// It waits for ANY of these — a phone that reports only touchend, a keyboard, a click on
// a control that swallowed the pointerdown — and it keeps waiting until the audio is
// genuinely playing. The old version stood down on the first gesture whether or not the
// play succeeded, so one refused attempt (and a refusal is ordinary: a gesture the
// browser judges too old, a media element still loading) left the music dead for the
// rest of the visit with nothing left listening to try again.
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
let unlockArmed = false;
function armUnlock(){
  if(unlockArmed) return;
  unlockArmed = true;
  const disarm = ()=>{
    if(!unlockArmed) return;
    unlockArmed = false;
    for(const t of UNLOCK_EVENTS) removeEventListener(t, go);
  };
  const go = ()=>{
    if(audio) audio.ctx.resume().catch(()=>{});
    loadBanks();                       // the samples may have been waiting on the context too
    if(!musicOn){ disarm(); return; }
    const q = player.src ? playTrack() : loadTrack(trackIx);
    if(q && q.then) q.then(disarm, ()=>{});   // still armed if it was refused: try the next gesture
    else disarm();
  };
  for(const t of UNLOCK_EVENTS) addEventListener(t, go);
}
// Recorded sample banks: five supernova blasts and four soft star ignitions, each
// picked at random with a slight detune so repeats never sound looped. Decoded through
// the audio graph where fetch is allowed, so the effects volume and compressor still
// apply; opened straight from disk (file://) fetch is blocked and plain media elements
// stand in.
const BANKS = {
  sn:    { src:[1,2,3,4,5].map(i=>'sfx/supernova-'+i+'.mp3'), gain:0.80, max:3, bufs:null, els:null, voices:0 },
  birth: { src:[1,2,3,4].map(i=>'sfx/ignition-'+i+'.mp3'),    gain:0.62, max:5, bufs:null, els:null, voices:0 },
};
// `banksTried` used to latch before the work, so a single failed or — worse — never
// settling decode killed the samples for the whole visit: the catch that installs the
// <audio> fallback only runs on a rejection, and decodeAudioData on a context the
// browser has interrupted can simply never settle either way. Now the latch is only
// held while an attempt is in flight, a timer installs the fallback if nothing has
// arrived, and every sfx() is free to ask again.
let banksLoading = false;
const banksDone = b => !!(b.bufs || b.els);
function elFallback(b){ if(!banksDone(b)) b.els = b.src.map(s=>{ const a=new Audio(s); a.preload='auto'; return a; }); }
function loadBanks(){
  if(banksLoading || !audio) return;
  const todo = Object.values(BANKS).filter(b => !banksDone(b));
  if(!todo.length) return;
  banksLoading = true;
  let left = todo.length;
  const done = ()=>{ if(--left === 0) banksLoading = false; };
  for(const b of todo){
    Promise.all(b.src.map(s => fetch(s).then(r=>r.arrayBuffer()).then(a=>audio.ctx.decodeAudioData(a))))
      .then(bs => { b.bufs = bs; }, () => elFallback(b))
      .then(done, done);
  }
  setTimeout(()=>{ banksLoading = false; todo.forEach(elFallback); }, 6000);
}
function playBank(k){
  const b = BANKS[k];
  if(!b) return false;
  const {ctx, master} = audio;
  if(b.bufs){
    if(b.voices >= b.max) return true; // already thick; skip rather than stack
    const src = ctx.createBufferSource();
    src.buffer = b.bufs[(Math.random()*b.bufs.length)|0];
    src.playbackRate.value = 0.93 + Math.random()*0.14;
    const g = ctx.createGain(); g.gain.value = b.gain;
    src.connect(g); g.connect(master); src.start(ctx.currentTime);
    b.voices++; src.onended = ()=>{ b.voices--; };
    return true;
  }
  if(b.els){
    const a = b.els[(Math.random()*b.els.length)|0].cloneNode();
    a.volume = Math.min(1, sfxVol*b.gain*1.4); a.play().catch(()=>{});
    return true;
  }
  return false; // not loaded yet
}
const fxOn = {birth:true, sn:true, pn:true, drone:true};
function sfx(kind){
  if(!soundOn || !audio || !fxOn[kind]) return;
  if(BANKS[kind] && !banksDone(BANKS[kind])) loadBanks();   // never gave up on them
  const {ctx, master} = audio, t = ctx.currentTime;
  const gap = {sn:1.4, birth:0.45, pn:0.25}[kind]; // blasts run 7.7 s: don't let them pile up
  if(sfxLast[kind] && t - sfxLast[kind] < gap) return;
  sfxLast[kind] = t;
  if(kind==='birth'){ // a soft ignition; silent until the samples are decoded
    playBank('birth');
    return;
  }
  if(kind==='sn'){ // the immense one: a recorded blast, or the synth until they load
    if(playBank('sn')) return;
    const o = ctx.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(90,t); o.frequency.exponentialRampToValueAtTime(28,t+1.6);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.5,t+0.08); g.gain.exponentialRampToValueAtTime(0.0001,t+2.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+2.7);
    const nb = ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate), nd2 = nb.getChannelData(0);
    for(let i=0;i<nd2.length;i++) nd2[i] = Math.random()*2-1;
    const s2 = ctx.createBufferSource(); s2.buffer = nb;
    const f = ctx.createBiquadFilter(); f.type='lowpass';
    f.frequency.setValueAtTime(2400,t); f.frequency.exponentialRampToValueAtTime(60,t+2.0);
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001,t);
    g2.gain.exponentialRampToValueAtTime(0.35,t+0.05); g2.gain.exponentialRampToValueAtTime(0.0001,t+2.2);
    s2.connect(f); f.connect(g2); g2.connect(master); s2.start(t); s2.stop(t+2.2);
  } else if(kind==='pn'){ // planetary nebula: an airy exhale
    const nb = ctx.createBuffer(1,ctx.sampleRate*1.4,ctx.sampleRate), nd2 = nb.getChannelData(0);
    for(let i=0;i<nd2.length;i++) nd2[i] = Math.random()*2-1;
    const s2 = ctx.createBufferSource(); s2.buffer = nb;
    const f = ctx.createBiquadFilter(); f.type='bandpass'; f.Q.value = 1.6;
    f.frequency.setValueAtTime(700,t); f.frequency.exponentialRampToValueAtTime(240,t+1.2);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(1.10,t+0.35); g.gain.exponentialRampToValueAtTime(0.0001,t+1.3);
    s2.connect(f); f.connect(g); g.connect(master); s2.start(t); s2.stop(t+1.4);
  }
}
const EV_CAP = 1024, PUFF_CAP = 512;
const evPos=new Float32Array(EV_CAP*3), evSize=new Float32Array(EV_CAP), evCol=new Float32Array(EV_CAP*3), evWave=new Float32Array(EV_CAP);
const pfPos=new Float32Array(PUFF_CAP*3), pfSize=new Float32Array(PUFF_CAP), pfCol=new Float32Array(PUFF_CAP*3), pfWave=new Float32Array(PUFF_CAP);
function dynVAO(cap){
  const o={vao:gl.createVertexArray()};
  gl.bindVertexArray(o.vao);
  o.p=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.p); gl.bufferData(gl.ARRAY_BUFFER,cap*12,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  o.s=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.s); gl.bufferData(gl.ARRAY_BUFFER,cap*4,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);
  o.c=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.c); gl.bufferData(gl.ARRAY_BUFFER,cap*12,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,3,gl.FLOAT,false,0,0);
  o.w=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.w); gl.bufferData(gl.ARRAY_BUFFER,cap*4,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3,1,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return o;
}
const evGL = dynVAO(EV_CAP), pfGL = dynVAO(PUFF_CAP);
// Blasts are drawn by their own program, so they travel in their own buffers. There are
// never many at once — a flash lasts 1.6 s — and the fourth channel carries how far the
// blast has run instead of the wave flag, which every one of them has set anyway.
const SN_CAP = 96;
const snPos=new Float32Array(SN_CAP*3), snSize=new Float32Array(SN_CAP),
      snCol=new Float32Array(SN_CAP*3), snPh=new Float32Array(SN_CAP);
const snGL = dynVAO(SN_CAP);
let evN = 0, snN = 0;   // how many of each the last fillEvents() actually wrote
const events=[], puffs=[];
function armSite(){ // where massive stars are born: an arm's inner edge, the spur, or a bar tip
  const roll=Math.random();
  let r, th;
  if(roll<0.12){ th=(Math.random()<0.5?BAR_A:BAR_A+Math.PI)+gauss()*0.05; r=BAR_L*(0.95+Math.random()*0.12); }
  else if(roll<0.30){ r=900+(Math.random()*2-1)*150; th=-(r-900)/(900*PITCH)+0.02+gauss()*0.04; }
  else { const arm=Math.random()<0.7?ARMS[(Math.random()*2)|0]:ARMS[2+((Math.random()*2)|0)];
    r=BAR_L+40+Math.pow(Math.random(),0.95)*1200; th=armAngle(r,arm[0])+0.025+gauss()*0.03; }
  return [r*Math.sin(th), gauss()*6, r*Math.cos(th)];
}
function diskSite(){ // old stars die everywhere in the disk
  const r=expR(300,1700,283), th=Math.random()*6.28318;
  return [r*Math.sin(th), gauss()*14, r*Math.cos(th)];
}
function addPuff(e, r1, dur, col){
  if(puffs.length>=PUFF_CAP) return;
  puffs.push({x:e.x,y:e.y,z:e.z,wv:e.wv,t:0,r1,dur,col});
}
let accB=0, accSN=0, accPN=0;
// event kinds: 1 OB cluster, 2 red supergiant, 3 supernova flash, 4 red giant,
//              5 cooling neutron star, 6 fading white dwarf
function lifeStep(dt, dtSim){
  const sfr = sfrFactor(ageGyr());
  // Per year now, not per compressed step. These are drawn events, a sampled fraction of
  // the real rates — the true figures are in the status bar and the info panel.
  if(evBirth) accB += dtSim*1.84e-6*curD*sfr; else accB = 0;
  if(evSN){
    accSN += dtSim*Math.max(9.2e-9*curD, 1.26e-7)*sfr;
    accPN += dtSim*1.26e-6*curD*Math.sqrt(sfr);   // low-mass deaths ride with the deaths switch
  } else accSN = accPN = 0;
  const CAP = 40;
  for(let n=0; accB>=1 && n<CAP; n++){ accB--; if(events.length<EV_CAP){ const s=armSite();
    events.push({k:1,x:s[0],y:s[1],z:s[2],wv:1,st:0,t:0,L:(3+Math.random()*6)*1e6,sn:evSN && Math.random()<0.12});
    if(Math.random()<0.5) sfx('birth'); } } // only half of them sound, or it never stops
  if(accB>1) accB = 0;
  for(let n=0; accSN>=1 && n<CAP; n++){ accSN--; if(events.length<EV_CAP){ const s=armSite();
    events.push({k:2,x:s[0],y:s[1],z:s[2],wv:1,st:0,t:0}); } }
  if(accSN>1) accSN = 0;
  for(let n=0; accPN>=1 && n<CAP; n++){ accPN--; if(events.length<EV_CAP){ const s=diskSite();
    events.push({k:4,x:s[0],y:s[1],z:s[2],wv:0,st:0,t:0}); } }
  if(accPN>1) accPN = 0;
  for(let i=events.length-1;i>=0;i--){
    const e=events[i]; e.st+=dtSim; e.t+=dt;
    if(e.k===1 && e.st>e.L){
      if(e.sn){ e.k=2; e.st=0; }                    // a massive member goes supergiant
      else if(e.st>e.L+0.8e6) events.splice(i,1);  // cluster disperses into the disk
    }
    else if(e.k===2 && e.st>1.0e6){ e.k=3; e.t=0; sfx('sn'); } // ~1 Myr as a red supergiant, then collapse
    else if(e.k===3 && e.t>1.6){ addPuff(e,7,2.8,[0.55,0.35,0.22]); e.k=5; e.t=0; }
    else if(e.k===4 && e.st>1.2e6){ addPuff(e,1.8,2.2,[0.10,0.50,0.42]); e.k=6; e.t=0; sfx('pn'); }
    else if((e.k===5||e.k===6) && e.t>2.5) events.splice(i,1);
  }
  for(let i=puffs.length-1;i>=0;i--){ const q=puffs[i]; q.t+=dt; if(q.t>q.dur) puffs.splice(i,1); }
}
function fillEvents(){
  evN = 0; snN = 0;
  for(let i=0;i<events.length;i++){
    const e=events[i]; let s=0,cr=0,cg=0,cb=0;
    if(e.k===3){
      // The blast leaves this pass entirely: its own program draws it. The sprite grows
      // through the whole flash — a fireball only expands — while the brightness peaks
      // in the first fifth of a second and falls away, so it dims as it spreads.
      if(snN < SN_CAP){
        const u = Math.min(1, e.t/1.6);
        const a = e.t<0.15 ? e.t/0.15 : Math.exp(-(e.t-0.15)/0.45);
        const j = snN++;
        snPos[j*3]=e.x; snPos[j*3+1]=e.y; snPos[j*3+2]=e.z;
        snSize[j] = 14 + 92*Math.min(1, 0.3 + u);
        snCol[j*3]=2.4*a; snCol[j*3+1]=2.3*a; snCol[j*3+2]=2.1*a;
        snPh[j] = u;
      }
      continue;
    }
    if(e.k===1){ // embedded reddish protocluster brightening into a blue OB cluster
      const u=Math.min(1,e.st/0.8e6), f=e.st>e.L?Math.max(0,1-(e.st-e.L)/0.8e6):1;
      s=(0.6+2.8*u)*f;
      cr=(0.55+0.07*u)*f; cg=(0.16+0.56*u)*f; cb=(0.10+0.95*u)*f;
      if(e.st < 0.25e6){ // the pling: a brief white twinkle, the opposite of a blast
        const w = (1 - e.st/0.25e6)*(0.55+0.45*Math.sin(shimT*9.0 + e.x*3.1));
        s += 3.2*w; cr += 1.05*w; cg += 1.05*w; cb += 1.15*w;
      }
    } else if(e.k===2){ // red supergiant: swelling, reddening
      const u=Math.min(1,e.st/1e6);
      s=3.2+2.6*u; cr=0.62+0.5*u; cg=0.72-0.34*u; cb=1.05-0.87*u;
    } else if(e.k===5){ // what remains: a cooling neutron star
      const f=Math.max(0,1-e.t/2.5); s=1.4; cr=0.35*f; cg=0.5*f; cb=0.9*f;
    } else if(e.k===4){ // a low-mass star swells into a red giant
      const u=Math.min(1,e.st/1.2e6); s=1.2+2.4*u; cr=0.9; cg=0.42-0.12*u; cb=0.16;
    } else { // white dwarf, slowly fading
      const f=Math.max(0,1-e.t/2.5); s=1.1; cr=0.8*f; cg=0.85*f; cb=1.0*f;
    }
    const j = evN++;   // compacted: the blasts that left this pass leave no gaps behind
    evPos[j*3]=e.x; evPos[j*3+1]=e.y; evPos[j*3+2]=e.z;
    evSize[j]=s; evCol[j*3]=cr; evCol[j*3+1]=cg; evCol[j*3+2]=cb; evWave[j]=e.wv;
  }
}
function fillPuffs(){
  for(let i=0;i<puffs.length;i++){
    const q=puffs[i], u=q.t/q.dur, rad=q.r1*(1-(1-u)*(1-u)), a=Math.pow(1-u,1.6);
    pfPos[i*3]=q.x; pfPos[i*3+1]=q.y; pfPos[i*3+2]=q.z;
    pfSize[i]=Math.max(0.8, rad*2);
    pfCol[i*3]=q.col[0]*a; pfCol[i*3+1]=q.col[1]*a; pfCol[i*3+2]=q.col[2]*a;
    // the fourth channel carries both the frame flag and how far the shell has run:
    // wave in the twos, phase in the fraction — the remnant shader unpacks it
    pfWave[i]=q.wv*2 + Math.min(0.999, u);
  }
}

// ---------- camera & interaction ----------
const cam = { yaw: 0.9, pitch: 0.32, dist: 150, distGoal: 150, target:[0,0,0], follow:true };
let coreLock = false;   // dive: hold the camera on the Sun-to-core line
// which absolute-frame position cam.follow tracks when true — the Sun everywhere
// except the one Andromeda view, which needs its own moving target the same way
let followTarget = 'sun';
let dragging=false, px=0, py=0;
// While a pointer or finger is down the clock holds, so the galaxy does not keep
// turning under the hand that is trying to orbit it. Released, it carries straight on.
let holding=false;
const touches = new Map();     // every pointer currently down on the canvas
// Two-finger pan. Kept as a fraction of the view's height along the camera's own right
// and up, not as a world offset: zooming then keeps the composition, and a pan made at
// galaxy scale cannot leave the Sun a thousand units off-screen once you dive. Cleared
// wherever the view is re-seeded (a scenario, a focus, the dive), like the transition.
const panF = [0, 0];
let panCX = 0, panCY = 0;      // the last two-pointer centroid
function panCentroid(){ let x=0,y=0; for(const q of touches.values()){ x+=q.clientX; y+=q.clientY; } return [x/touches.size, y/touches.size]; }
canvas.addEventListener('pointerdown', e=>{
  touches.set(e.pointerId, e);
  holding = true;
  canvas.classList.add('dragging');
  if(touches.size === 1){ dragging = true; px = e.clientX; py = e.clientY;
    // capture can be refused; a throw here would abandon the handler mid-way
    try{ canvas.setPointerCapture(e.pointerId); }catch(err){} }
  else { dragging = false; [panCX, panCY] = panCentroid(); }   // two fingers: pinch and pan, not a turn
});
canvas.addEventListener('pointermove', e=>{
  if(touches.has(e.pointerId)) touches.set(e.pointerId, e);
  if(touches.size === 2){
    // the fingers' midpoint carries the scene with it; the pinch (below) reads the spread
    const [cx, cy] = panCentroid();
    panF[0] = Math.max(-2, Math.min(2, panF[0] + (cx - panCX)/H));
    panF[1] = Math.max(-2, Math.min(2, panF[1] + (cy - panCY)/H));
    panCX = cx; panCY = cy;
    return;
  }
  if(!dragging || touches.size > 1) return;
  cam.yaw   -= (e.clientX-px)*0.005*SKY_MIRROR;
  cam.pitch  = Math.max(-1.45, Math.min(1.45, cam.pitch + (e.clientY-py)*0.005));
  px=e.clientX; py=e.clientY;
});
function endPointer(e){
  touches.delete(e.pointerId);
  if(touches.size === 0){ dragging = false; holding = false; canvas.classList.remove('dragging'); }
  else if(touches.size === 1){
    // one finger left: pick the drag up from where it actually is, or the view jumps
    const q = touches.values().next().value;
    px = q.clientX; py = q.clientY; dragging = true;
  } else if(touches.size === 2) [panCX, panCY] = panCentroid();   // three down to two: restart from here
}
addEventListener('pointerup', endPointer);
addEventListener('pointercancel', endPointer);
// the floor: ~0.04 AU across, eight solar radii; at Earth and at the Moon, a body filling
// the view. The Moon's view before she forms is Earth's view, so it keeps Earth's floor.
const minDist = ()=> followTarget === 'moon' ? (ageGyr() > MOON_BORN ? 5.5e-12 : 2e-11)
                   : followTarget === 'earth' ? 2e-11 : (realMode ? 2e-8 : 25);
// The zoom buttons step along a ladder of the objects themselves — the Sun, the planets'
// orbits, the belts, the Oort shell, the nearest stars, the arm, the Galaxy, the Local
// Group — with one rung between each pair, so two presses take you from one object to
// the next, and every press eases in log space like any other zoom. Clamped to the same
// floor and ceiling as the wheel. Distances in camera units: 1 AU across the view is
// 4.67e-7, 1 ly is 0.0288.
const ZOOM_OBJ = [1.2e-10, 3.2e-9, 2e-8, 1e-7, 3.7e-7, 9.3e-7, 1.45e-6, 4.9e-6, 8.9e-6, 2.8e-5, 4.7e-5, 9.3e-4, 0.144, 0.72, 17, 150, 4300, 9500];
const ZOOM_RUNGS = ZOOM_OBJ.flatMap((d, i) => i ? [Math.sqrt(ZOOM_OBJ[i-1]*d), d] : [d]);
function zoomStep(dir){
  const cur = cam.distGoal, lo = Math.log(cur);
  let next = null;
  if(dir < 0){ for(const r of ZOOM_RUNGS) if(Math.log(r) < lo - 0.03) next = r; }        // the largest rung below
  else       { for(const r of ZOOM_RUNGS) if(Math.log(r) > lo + 0.03){ next = r; break; } } // the smallest above
  if(next === null) return;
  cam.distGoal = Math.max(minDist(), Math.min(9500, next));
}
canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const rate = realMode ? 0.0018 : 0.0011; // faster travel across real scale's ~11 decades
  cam.distGoal = Math.max(minDist(), Math.min(7500, cam.distGoal*Math.exp(e.deltaY*rate)));
},{passive:false});
// pinch zoom
let pinchD=0;
canvas.addEventListener('touchstart', e=>{ holding=true; if(e.touches.length===2){ pinchD=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); } },{passive:true});
canvas.addEventListener('touchend', e=>{ holding = e.touches.length>0; },{passive:true});
canvas.addEventListener('touchmove', e=>{
  if(e.touches.length===2){
    const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    if(pinchD>0) cam.distGoal=Math.max(minDist(),Math.min(7500,cam.distGoal*pinchD/d));
    pinchD=d; dragging=false;   // belt and braces alongside the pointer bookkeeping
  }
},{passive:true});

// ---------- UI ----------
const $=id=>document.getElementById(id);
$('verInfo').textContent = VERSION;
$('buildStamp').textContent = BUILD_LINE;
$('tourBuild').textContent = VERSION + ' · ' + BUILD_LINE;
// the original UTC stamp stays available on hover
$('buildInfo').title = VERSION + (BUILD.date.indexOf('__') !== 0
  ? ' · built ' + BUILD.date + ' ' + BUILD.time + ' UTC' : '');
// Hard refresh: drop every cache and the service worker, then reload on a fresh URL so
// nothing between here and the server can hand back the old build.
// One button, three depths, counted in taps: one tap reloads past every cache, three
// taps also forget the saved settings, ten taps toggle debug mode. The counter shows on
// the button while tapping, and the action fires only once the tapping stops.
function bustAndGo(mutate){
  const u = new URL(location.href);
  u.searchParams.set('_', Date.now());
  if(mutate) mutate(u);
  location.replace(u.toString());
}
async function doRefresh(){
  $('tReload').textContent = '⟲ …';
  try{
    if(window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k)));
    if(navigator.serviceWorker){
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  }catch(e){}
  bustAndGo();
}
{
  const b = $('tReload');
  let taps = 0, tapTimer = null;
  const act = ()=>{
    const n = taps; taps = 0;
    if(n >= 10){
      // toggle the debug door, and remember the choice across reloads
      const on = getComputedStyle($('dbgBtn')).display === 'none';
      setDebugUI(on, true);
      try{ localStorage.setItem(DBGKEY, on ? '1' : '0'); }catch(err){}
    }
    else if(n >= 3){
      // debug mode is a mode you are in, not a setting you tuned: a reset returns the
      // app to its defaults and leaves you where you were working
      try{
        const dbg = localStorage.getItem(DBGKEY);
        localStorage.clear();
        if(dbg !== null) localStorage.setItem(DBGKEY, dbg);
      }catch(err){}
      bustAndGo();
    }
    else doRefresh();
  };
  const flash = cls => {
    const h = $('hud');
    h.classList.remove('flash3','flash10');   // restart the animation cleanly
    void h.offsetWidth;
    h.classList.add(cls);
    setTimeout(()=> h.classList.remove(cls), 450);
  };
  b.addEventListener('click', ()=>{
    taps++;
    if(taps === 3) flash('flash3');
    if(taps === 10) flash('flash10');
    clearTimeout(tapTimer);
    tapTimer = setTimeout(act, 450);   // the run of taps ends when the tapping stops
  });
}
let paused=false, showTrails=true, showLabels=true, showStats=true;
let showDwarfs=true, showBelt=true, showKuiper=true, showOort=true;
let speed = 1.5; // years per second
const WEEK_YR = 7/365.2425;                          // one week, in years
// The ladder the slider climbs, in years per second: hours, weeks, months, then whole
// years 1…10; the ×10^k slider on top carries each rung through the decades, so
// 3 yr/s × 10³ reads 3×10³ yr/s — n × 10^k, one digit and an exponent.
const HOUR_YR = 1/(24*365.2425);
const SPEED_RUNGS = [
  ...[1,2,3,4,6,8,10,12,16,20,24,32].map(h => h*HOUR_YR),
  ...[1,2,3,4].map(w => w*WEEK_YR),
  ...[1,2,4,6,8].map(m => m/12),
  ...[1,2,3,4,5,6,7,8,9,10]
];
const SPEED_YEAR = 21;                                     // the rung of one year per second
const speedFromSlider = v => SPEED_RUNGS[Math.max(0, Math.min(SPEED_RUNGS.length-1, Math.round(+v)))];
// the rung nearest a rate, in log space — for settings saved by the old continuous slider
function speedRungOf(yrs){ let b=0, e=1e9; SPEED_RUNGS.forEach((r,i)=>{ const d=Math.abs(Math.log(r/yrs)); if(d<e){ e=d; b=i; } }); return b; }
function supStr(e){ return String(e).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join(''); }
let speedMult = 1;
// the rate in the unit it is easiest to read: hours, weeks and months below a year
function speedLabel(){
  const eff = speed*speedMult, n = x => (Math.abs(x-Math.round(x)) < 0.05 ? Math.round(x) : +x.toFixed(1));
  if(eff < WEEK_YR*0.999) return n(eff/HOUR_YR)+' h/s';
  if(eff < 0.999/12)      return n(eff/WEEK_YR)+' wk/s';
  if(eff < 0.999)         return n(eff*12)+' mo/s';
  if(eff < 1000)          return n(eff)+' yr/s';
  const e = Math.floor(Math.log10(eff)), mant = eff/Math.pow(10,e);
  return (Math.abs(mant-Math.round(mant)) < 0.005 ? Math.round(mant) : mant.toFixed(2))+'×10'+supStr(e)+' yr/s';
}
function fmtSpeed(){ $('speedv').textContent = speedLabel(); }
// Whole decades on top of the slider, for crossing deep time without waiting on it.
function setMultExp(x){
  x = Math.max(0, Math.min(10, Math.round(x)));
  speedMult = Math.pow(10, x);
  $('multExp').value = x;
  $('multExpv').textContent = x === 0 ? '×1' : '×1e' + x;
  fmtSpeed(); applyTrailWindow();
}
$('multExp').addEventListener('input', e => setMultExp(+e.target.value));
// The shuttle: a signed fraction of the set speed, driven by hand. At 0 it is not engaged
// and the clock belongs to play/pause as before; off 0 it takes the clock over — forward
// or backward, paused or not — and the reset hands it back. Deliberately not persisted:
// a shuttle rests at 0 when you pick the piece up.
let shuttle = 0, shuttleLastSign = 0, trailRefillAt = 0;
function setShuttle(v){
  const before = Math.sign(shuttle);
  shuttle = Math.max(-100, Math.min(100, Math.round(v)));
  // a change of the shuttle's own sign re-sweeps the trails at once — the clock's drive
  // sign does that too, but not while paused, and a paused reverse left them leading
  if(Math.sign(shuttle) !== before){ refillTrails(); nextSample = simT + DT_SAMPLE; }
  $('shuttle').value = shuttle;
  $('shuttlev').textContent = shuttle === 0 ? 'off' : shuttle > 0 ? '+'+shuttle+'%' : shuttle+'%';
}
$('shuttle').addEventListener('input', e => setShuttle(+e.target.value));
$('shuttleReset').addEventListener('click', ()=> setShuttle(0));
document.querySelectorAll('.stepb').forEach(b => b.addEventListener('click', ()=>{
  if(!b.dataset.step) return;             // the shuttle's reset shares the look, not the job
  const [id, d] = b.dataset.step.split(':');
  const el = $(id);
  el.value = Math.max(+el.min, Math.min(+el.max, +el.value + +d));
  el.dispatchEvent(new Event('input'));
}));
$('speed').addEventListener('input', e=>{ speed = speedFromSlider(+e.target.value); fmtSpeed(); applyTrailWindow(); });
speed = speedFromSlider(SPEED_YEAR); fmtSpeed();   // one Earth year per second
// One slider, two effects, because they are the same intent: make the faint stars
// carry. It lifts a floor under their colour and widens the smallest sprites, which is
// where most of the lost light actually goes.
$('hudHz').addEventListener('input', e=>{
  hudHz = +e.target.value;
  $('hudHzv').textContent = hudHz + '×/s';
});
let minBright = 0.05*0.38, minSprite = 1.3 + 0.05*2.1, starGain = 0.05;
$('minB').addEventListener('input', e=>{
  const v = starGain = +e.target.value;
  minBright = v*0.38;
  minSprite = 1.3 + v*2.1;
  $('minBv').textContent = v ? '+'+Math.round(v*100) + '%' : 'off';
});
// How much headroom the bright cores get before they saturate. 100% ("off", the
// default) is the old behaviour: no compression, and a merging pair of cores reads
// as one white blob — left off by default since it's a corrective for that one
// situation, not something every scene needs paying the extra render pass for.
let coreKnee = 1;
$('coreB').addEventListener('input', e=>{
  coreKnee = +e.target.value;
  $('coreBv').textContent = coreKnee >= 0.999 ? 'off' : Math.round(coreKnee*100)+'%';
});
let trailAlpha = 1, orbitAlpha = 1;
// each slider is its own switch: silence for sound, invisibility for lines
$('trailA').addEventListener('input', e=>{
  trailAlpha = +e.target.value; psH = trailAlpha > 0;
  $('trailAv').textContent = psH ? Math.round(trailAlpha*100)+'%' : 'off'; });
$('orbitA').addEventListener('input', e=>{
  orbitAlpha = +e.target.value; psO = orbitAlpha > 0;
  $('orbitAv').textContent = psO ? Math.round(orbitAlpha*100)+'%' : 'off'; });
let trailPct = 300, trailRefill = 0;
function applyTrailWindow(){
  const w = (trailPct/100) * speed * speedMult;      // years covered by the whole trail
  DT_SAMPLE = Math.max(1e-9, w/TRAIL_N);
  const span = w < 1e3 ? (w<10 ? w.toFixed(w<1?2:1) : String(Math.round(w)))+' yr'
             : w < 1e6 ? (w/1e3).toFixed(w<1e4?1:0)+' kyr'
             : w < 1e9 ? (w/1e6).toFixed(w<1e7?1:0)+' Myr'
             : (w/1e9).toFixed(2)+' Gyr';
  $('trailLv').textContent = trailPct + '% · ' + span;
  // rebuilding is 34,000 samples, so coalesce the bursts a slider drag produces
  clearTimeout(trailRefill);
  trailRefill = setTimeout(()=>{ refillTrails(); nextSample = simT + DT_SAMPLE; }, 90);
}
let lastAnchor = 0;
$('trailL').addEventListener('input', e=>{ trailPct = +e.target.value; applyTrailWindow(); });

// A switch, however it is drawn: lit buttons carry their state in a class, checkboxes
// in .checked. Both report through the same callback, so every call site is identical.
const isOn = el => el.type === 'checkbox' ? el.checked : el.classList.contains('on');
function toggle(btn, fn){
  if(btn.type === 'checkbox') btn.addEventListener('change', ()=> fn(btn.checked));
  else btn.addEventListener('click', ()=>{ btn.classList.toggle('on'); fn(isOn(btn)); });
}
const ICO_PAUSE = '<svg class="ico" viewBox="0 0 10 10" aria-hidden="true"><rect x="1.4" y="1" width="2.7" height="8"/><rect x="5.9" y="1" width="2.7" height="8"/></svg>';
const ICO_PLAY  = '<svg class="ico" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1 L9 5 L2 9 Z"/></svg>';
// drawn, not typed: a glyph would be recoloured as emoji on some platforms
toggle($('tPause'), on=>{ paused=!on;
  $('tPause').innerHTML = on ? ICO_PAUSE : ICO_PLAY;
  $('tPause').setAttribute('aria-label', on ? 'pause' : 'play'); });
toggle($('tLabels'), on=>{ showLabels=on; if(!on) labelEls.forEach(l=>l.style.display='none'); });
toggle($('tArms'), on=>{ armsOn=on; if(!on) armEls.forEach(l=>l.style.display='none'); });
// steady labels: eased into place, held through a single leap, stepped aside while a
// body whirls faster than a label can follow (see placeLabel). On by default for now.
let labelSteady = true;
toggle($('tLabelSteady'), on=>{ labelSteady = on; });
// The dock's master switch mirrors these two rather than owning its own saved state:
// on whenever either is showing, off only when both are hidden. Individual settings
// checkboxes are untouched — this only adds a second listener alongside their own.
function syncLabelsMaster(){ $('tLabelsAll').classList.toggle('on', $('tLabels').checked || $('tArms').checked); }
$('tLabels').addEventListener('change', syncLabelsMaster);
$('tArms').addEventListener('change', syncLabelsMaster);
syncLabelsMaster();
toggle($('tLabelsAll'), on=>{
  if($('tLabels').checked !== on){ $('tLabels').checked = on; $('tLabels').dispatchEvent(new Event('change')); }
  if($('tArms').checked !== on){ $('tArms').checked = on; $('tArms').dispatchEvent(new Event('change')); }
  // the cascade only fires 'change', not the 'click' the checkboxes' own save binding
  // listens for — without this, a choice made through the master would not survive reload
  saveSettings();
});
toggle($('tP9'), on=>{ showP9=on; if(!on) labelEls[I_P9].style.display='none'; });
toggle($('tDwarfs'), on=>{ showDwarfs=on; if(!on) labelEls.forEach((l,i)=>{ if(i>=N_PLANETS) l.style.display='none'; }); });
toggle($('tBelt'), on=> showBelt=on);
toggle($('tKuiper'), on=> showKuiper=on);
let evSN = false, evBirth = false;
function syncLife(){
  lifeOn = evSN || evBirth;
  if(!evSN){ // drop everything supernova-or-death shaped, keep living clusters
    for(let i=events.length-1;i>=0;i--){ const k=events[i].k;
      if(k!==1) events.splice(i,1); else events[i].sn=false; }
    if(!lifeOn) puffs.length = 0;
  }
  if(!evBirth) for(let i=events.length-1;i>=0;i--) if(events[i].k===1) events.splice(i,1);
  if(!lifeOn){ events.length=0; puffs.length=0; }
}
toggle($('tEvSN'), on=>{ evSN=on; syncLife(); });
toggle($('tEvBirth'), on=>{ evBirth=on; syncLife(); });
toggle($('tVar'), on=> varOn=on);
let dustOn = true;
toggle($('tDust'), on=>{ dustOn = on; });
const syncZoomBtns = on => { for(const id of ['zoomIn','zoomOut']) $(id).classList.toggle('act', on); };
toggle($('tZoomBtns'), on=>{ syncZoomBtns(on); layoutPanels(); fitPanels(); });
// The spin lock: the camera's yaw and pitch are read in the planet's own frame (longitude
// about its axis, latitude), so the eye rides round with the spin and the same face stays
// in view however fast the clock runs — the plates drift under a still camera. Switching
// it re-expresses the current line of sight in the other frame, so the view does not jump.
let spinLock = false; const camDirW = [0,0,1], spinP = new Float64Array(3);
function spinFrame(){ const A = EARTH_AXIS, P = earthPrime(simT, spinP); return [P, A, [A[1]*P[2]-A[2]*P[1], A[2]*P[0]-A[0]*P[2], A[0]*P[1]-A[1]*P[0]]]; }
toggle($('tSpinLock'), on=>{
  const d = camDirW;
  if(on){ const [P, A, Q] = spinFrame(); const dP = d[0]*P[0]+d[1]*P[1]+d[2]*P[2], dA = d[0]*A[0]+d[1]*A[1]+d[2]*A[2], dQ = d[0]*Q[0]+d[1]*Q[1]+d[2]*Q[2];
    cam.yaw = Math.atan2(dP, -dQ); cam.pitch = Math.asin(Math.max(-1, Math.min(1, dA))); }
  else { cam.yaw = Math.atan2(d[0], d[2]); cam.pitch = Math.asin(Math.max(-1, Math.min(1, d[1]))); }
  if(coreLock){ coreLock = false; }   // the lock's own base yaw would double up
  spinLock = on; panF[0]=panF[1]=0;
  $('tSpinLock2').checked = on;        // the settings dialog's twin follows
});
$('tSpinLock2').addEventListener('change', ()=>{   // and drives the dock's box, which owns the state
  if($('tSpinLock').checked !== $('tSpinLock2').checked){ $('tSpinLock').checked = $('tSpinLock2').checked; $('tSpinLock').dispatchEvent(new Event('change')); }
});
syncZoomBtns($('tZoomBtns').checked);   // on by default: the markup says checked, and the dots follow it
$('zoomIn').addEventListener('click', ()=> zoomStep(-1));     // here, after $ exists: zoomStep is
$('zoomOut').addEventListener('click', ()=> zoomStep(+1));    // hoisted, the listeners are not
const focusSunOpt = $('focusSel').options[0];   // its name changes once the Sun is gone
// The Earth view fills the viewport: the globe's diameter at 80% of the shorter side,
// whatever the screen. The projection's field is vertical (see pxScale in the draw),
// so the distance is the planet's true diameter over that many pixels.
function earthViewDist(){ return bodyViewDist(realSizes[3]); }
function moonViewDist(){ return bodyViewDist(MOON_DIA); }
function bodyViewDist(dia){        // the distance at which a body of this diameter fills 80% of the shorter side
  const h = innerHeight, px = 0.8*Math.min(innerWidth, h);
  return Math.max(minDist(), dia*(h/(2*Math.tan(Math.PI/6)))/px);
}
function applyFocusView(){
  const v = $('focusSel').value;
  if(v === 'sun'){
    followTarget = 'sun';
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    else { cam.follow = true; coreLock = true; cam.distGoal = 3.5e-5; reseedFollow = true; panF[0]=panF[1]=0; }
  } else if(v === 'earth'){
    // the planet itself with the Moon's whole orbit in frame, following Earth. Set after
    // the toggle clicks: both handlers reset the follow target to the Sun as a side effect.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    followTarget = 'earth';
    cam.follow = true; coreLock = false; cam.distGoal = earthViewDist(); reseedFollow = true; panF[0]=panF[1]=0;
  } else if(v === 'moon'){
    // the Moon herself, filling the view. Followed like Earth: the same handlers, and the
    // same order — the toggles reset the target to the Sun as they turn themselves on.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    followTarget = 'moon';
    // before the Theia impact there is no Moon: the view holds on the world she comes
    // from, at Earth's own distance, and takes her up when she forms
    cam.follow = true; coreLock = false; reseedFollow = true; panF[0]=panF[1]=0;
    cam.distGoal = ageGyr() > MOON_BORN ? moonViewDist() : earthViewDist();
  } else if(v === 'pn'){
    // the shell's full reach, ~3.5 ly across, following what is left of the Sun; before
    // the shell exists this is simply the Sun's neighbourhood at that scale
    followTarget = 'sun';
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; coreLock = false; cam.distGoal = 0.1; reseedFollow = true; panF[0]=panF[1]=0;
  } else if(v === 'and'){
    // framed wide enough for the whole disk plus its extended halo and stream
    // (R_A=2245, halo out to ~4200, the Giant Southern Stream past 5700), at any
    // point in the encounter; continuously tracked, so the view holds through a
    // running merger scenario too. Set after the toggle clicks below: tView's own
    // handler resets followTarget to 'sun' as a side effect of turning itself on.
    if($('tDive').classList.contains('on')) $('tDive').click();
    if(!$('tView').classList.contains('on')) $('tView').click();
    followTarget = 'and';
    cam.follow = true; coreLock = false; cam.distGoal = 9500; reseedFollow = true; panF[0]=panF[1]=0;
  } else {
    followTarget = 'sun';
    if($('tDive').classList.contains('on')) $('tDive').click();
    if(!$('tView').classList.contains('on')) $('tView').click();
    else { cam.follow = false; cam.distGoal = 4300; reseedFollow = true; panF[0]=panF[1]=0; }
  }
  saveSettings();
}
$('focusSel').addEventListener('change', applyFocusView);
$('focusGo').addEventListener('click', applyFocusView);   // re-apply the current pick, e.g. after drifting off it
// the status bar slides down to a grip and back up — by click or by an actual slide
{
  const bar = $('gamebar'), grip = $('barGrip');
  let y0 = null, moved = false;
  // hiding is done on the bar itself — slide it down; the grip appears only then,
  // as the handle to bring it back
  let by0 = null;
  bar.addEventListener('pointerdown', e => { if(e.target !== grip) by0 = e.clientY; });
  bar.addEventListener('pointermove', e => {
    if(by0 === null) return;
    if(e.clientY - by0 > 26){ setSlid(true); by0 = null; }
  });
  bar.addEventListener('pointerup',   () => { by0 = null; });
  bar.addEventListener('pointercancel', () => { by0 = null; });
  const setSlid = s => {
    bar.classList.toggle('slid', s);
    // the transform is set inline as well as by the class: an inline style wins over
    // whatever else the cascade is doing, and this must work on every browser
    bar.style.transform = s ? 'translate(-50%, calc(100% + 15px))' : '';
    saveSettings();
  };
  grip.addEventListener('pointerdown', e => { y0 = e.clientY; moved = false;
    try{ grip.setPointerCapture(e.pointerId); }catch(err){} });
  grip.addEventListener('pointermove', e => {
    if(y0 === null) return;
    const dy = e.clientY - y0;
    if(dy > 22){ setSlid(true);  moved = true; y0 = null; }
    else if(dy < -22){ setSlid(false); moved = true; y0 = null; }
  });
  grip.addEventListener('pointerup', () => { y0 = null; });
  grip.addEventListener('click', () => {
    if(moved){ moved = false; return; }     // a slide already did the work
    setSlid(!bar.classList.contains('slid'));
  });
  if(bar.classList.contains('slid')) setSlid(true);   // restored state applies the style too
}
toggle($('tGaia'), on=> gaiaOn=on);
toggle($('tFps'), on=>{ showFps=on; $('fpsBox').style.display = on ? '' : 'none'; fitPanels(); });
const lifeSupOn = true;   // the reading is a fixture of the Earth panel now
function applySfxGain(){
  if(!audio) return;
  const at=audio.ctx.currentTime;
  audio.master.gain.cancelScheduledValues(at);
  audio.master.gain.setTargetAtTime(soundOn?sfxVol:0.0, at, 0.3); // fade, never a click
}
// ---------- movable panels ----------
// Four panels share two columns. Each carries a side and an open flag; the layout
// stacks the open ones first, then the dots that reopen the closed ones — down the
// screen in portrait, across it in landscape, where vertical room is the scarce thing.
// Dragging a panel inward moves it to the other column; dragging it toward its own
// edge closes it. Both gestures read the same pointer stream, so a mouse and a finger
// behave identically.
const PANELS = [
  { id:'simPanel', dot:'simPlus' },
  { id:'env',      dot:'envPlus' },
  { id:'hud',      dot:'reopen'  },
];
// Two states, kept apart on purpose. `o` is what the visitor asked for; `auto` is what
// the layout had to do about it. Only `o` is saved, so a panel hidden to make room for
// a newer one comes back the moment that one closes — the automatic state is never
// mistaken for a decision. `seq` records the order things were opened in: the newest
// panel wins an overlap and sits on top.
let openSeq = 0;
const pState = {
  env:     { s:'l', o:true,  auto:false, seq:++openSeq },
  simPanel:{ s:'r', o:false, auto:false, seq:0 },
  hud:     { s:'r', o:false, auto:false, seq:0 },
};
const panelShown = id => pState[id].o && !pState[id].auto;
function setPanelOpen(id, open){
  pState[id].o = open;
  if(open){ pState[id].seq = ++openSeq;
            const el = $(id); el.classList.remove('pop'); void el.offsetWidth;
            el.classList.add('pop'); setTimeout(()=> el.classList.remove('pop'), 260); }
  layoutPanels();
  fitPanels(); saveSettings();
}
// One pass of the layout: put every shown panel and dot where it belongs and report
// the rectangles, so the caller can judge whether the result actually fits.
function placePanels(){
  const land = innerWidth > innerHeight, pad = 14, gap = 8;
  const boxes = [];
  for(const p of PANELS){
    const shown = panelShown(p.id);
    $(p.id).style.display = shown ? '' : 'none';
    $(p.dot).style.display = (!pState[p.id].o || pState[p.id].auto) ? 'block' : 'none';
    $(p.id).style.zIndex = 5 + pState[p.id].seq;   // the newest opened sits on top
  }
  for(const side of ['l','r']){
    const mine = PANELS.filter(p => pState[p.id].s === side);
    let y = pad, dotX = 0;
    const put = (el, x) => {
      el.style.top = y + 'px';
      if(side === 'l'){ el.style.left = x + 'px'; el.style.right = 'auto'; }
      else { el.style.right = x + 'px'; el.style.left = 'auto'; }
    };
    for(const p of mine){                      // open panels first, one under the next
      if(!panelShown(p.id)) continue;
      const el = $(p.id);
      if(p.id === 'hud') el.style.maxHeight = 'calc(100vh - ' + (y + pad) + 'px)';
      put(el, pad);
      const r = el.getBoundingClientRect();
      boxes.push({ id:p.id, seq:pState[p.id].seq, top:y, bottom:y + r.height,
                   left:r.left, right:r.right });
      y += r.height + gap;
    }
    const dock = mine.map(p => $(p.dot));
    if(side === 'r') dock.push($('tLabelsAll'), $('tInfo'), $('tPause'), $('zoomIn'), $('zoomOut'));   // standing actions; zoom under play
    for(const el of dock){
      if(getComputedStyle(el).display === 'none') continue;
      put(el, pad + dotX);
      const r = el.getBoundingClientRect();
      // out of room even for the buttons: this one steps off rather than overlap
      el.style.visibility = (y + r.height > innerHeight || pad + dotX + r.width > innerWidth)
        ? 'hidden' : 'visible';
      if(land) dotX += r.width + gap; else y += r.height + gap;
    }
    if(land && dotX) y += 36 + gap;
    if(side === 'l'){                          // the bare frame rate rides below them
      const f = $('fpsBox');
      if(getComputedStyle(f).display !== 'none'){ f.style.top = y+'px'; f.style.left = pad+'px'; }
    }
  }
  return boxes;
}
// The oldest panel that either runs off the bottom or overlaps a newer one. Rectangles
// are compared rather than columns, so a panel dragged across still yields correctly.
function findCrowded(boxes){
  let worst = null;
  const note = b => { if(!worst || b.seq < worst.seq) worst = b; };
  for(const b of boxes) if(b.bottom > innerHeight - 4) note(b);
  for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++){
    const a = boxes[i], c = boxes[j];
    if(a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom)
      note(a.seq < c.seq ? a : c);
  }
  return worst && worst.id;
}
function layoutPanels(){
  for(const p of PANELS) pState[p.id].auto = false;
  for(let pass = 0; pass <= PANELS.length; pass++){
    const crowded = findCrowded(placePanels());
    if(!crowded) break;
    pState[crowded].auto = true;      // recomputed from scratch every time, so it can return
  }
}
// dragging: inward switches columns, outward closes
for(const p of PANELS){
  const el = $(p.id);
  let x0 = 0, active = false, moved = 0, pid = -1;
  el.addEventListener('pointerdown', e => {
    // never steal a gesture that belongs to a control inside the panel
    if(e.target.closest('input, button, select, textarea, a, .seg, .chk')) return;
    x0 = e.clientX; active = true; moved = 0; pid = e.pointerId;
    // Capture the pointer, or the swipe dies the moment the finger leaves the panel —
    // and on a phone the panel is ~178 px wide, so a 60 px swipe started anywhere near
    // its middle crosses its own edge before it ever reaches the threshold. That is why
    // this worked under a mouse on a 216 px panel and not under a thumb.
    try{ el.setPointerCapture(e.pointerId); }catch(err){}
  });
  el.addEventListener('pointermove', e => {
    if(!active) return;
    moved = e.clientX - x0;
    if(Math.abs(moved) < 6) return;
    el.classList.add('drag');
    el.style.transform = 'translateX(' + moved + 'px)';
  });
  const finish = () => {
    if(!active) return;
    active = false;
    try{ if(pid >= 0) el.releasePointerCapture(pid); }catch(err){}
    pid = -1;
    el.classList.remove('drag');
    el.style.transform = '';
    const side = pState[p.id].s, TH = 60;
    const outward = side === 'l' ? -TH : TH;      // toward this panel's own edge
    const inward  = side === 'l' ?  TH : -TH;
    if(Math.sign(moved) === Math.sign(outward) && Math.abs(moved) >= TH) setPanelOpen(p.id, false);
    else if(Math.sign(moved) === Math.sign(inward) && Math.abs(moved) >= TH){
      pState[p.id].s = side === 'l' ? 'r' : 'l';
      pState[p.id].seq = ++openSeq;   // moving a panel is asking to see it
      layoutPanels(); fitPanels(); saveSettings();
    }
    moved = 0;
  };
  el.addEventListener('pointerup', finish);
  el.addEventListener('pointercancel', finish);
  // deliberately not pointerleave: with the pointer captured it cannot fire until
  // release anyway, and without capture it was what killed the swipe at the edge
}
// only the dots that stand for a panel reopen one; pause and help share the dock's
// look but carry their own actions
document.querySelectorAll('.pdot[data-open]').forEach(b =>
  b.addEventListener('click', () => setPanelOpen(b.dataset.open, true)));

// ---------- collapsible sections ----------
// Each heading owns a body; the arrow turns to show which way it goes. Simulation
// starts closed: its two sliders and the scenario list are the controls a visitor is
// least likely to want on arrival, and the piece opens on a staged scenario anyway.
const SECS = ['audio','gfx','hud','other','debug'];
const SEC_BODY = { audio:'secAudio', gfx:'secGfx', hud:'secHud', other:'secOther', debug:'secDebug' };
// one at a time by default, so the panel stays a screenful; Graphics is the one that
// earns the opening slot, holding the controls a visitor reaches for most
const secOpen = { audio:false, gfx:true, hud:false, other:false, debug:false };
function applySecs(){
  for(const k of SECS){
    $(SEC_BODY[k]).classList.toggle('closed', !secOpen[k]);
    document.querySelector('.sect[data-sec="'+k+'"]').classList.toggle('closed', !secOpen[k]);
  }
  fitPanels();
}
document.querySelectorAll('.sect[data-sec]').forEach(h =>
  h.addEventListener('click', ()=>{
    const k = h.dataset.sec, opening = !secOpen[k];
    if(opening && $('secSolo').checked) for(const s of SECS) secOpen[s] = false;
    secOpen[k] = opening;
    applySecs(); saveSettings();
  }));
$('secSolo').addEventListener('change', ()=>{
  if($('secSolo').checked){   // keep the topmost open one, fold the rest away
    let kept = false;
    for(const s of SECS){ if(secOpen[s] && !kept) kept = true; else secOpen[s] = false; }
  }
  applySecs(); saveSettings();
});

// one control, several faces: a segmented button where exactly one segment is lit
function seg(id, initial, fn){
  const bs = [...$(id).children];
  const set = (v, apply)=>{ bs.forEach(b => b.classList.toggle('on', b.dataset.v === v));
    if(apply !== false) fn(v); };
  bs.forEach(b => b.addEventListener('click', ()=>{ set(b.dataset.v); saveSettings(); }));
  // only the lit segment is set at build time: the state variables carry the same
  // defaults, and calling fn this early would touch bindings not yet initialised
  set(initial, false);
  return set;
}
// The volume slider is the switch: silence is off, and the audio graph is built the
// first time it is raised, so a visitor who never asks for sound never pays for it.
function setMusicVol(v){
  musicVol = v; player.volume = v;
  $('musicVolv').textContent = v > 0 ? Math.round(v*100)+'%' : 'off';
  const want = v > 0;
  if(want === musicOn) return;
  musicOn = want;
  if(want){ if(!player.src) loadTrack(trackIx); else playTrack(); }
  else player.pause();
}
$('musicVol').addEventListener('input', e => setMusicVol(+e.target.value));
$('tNext').addEventListener('click', ()=>{
  nextTrack();
  // asking for the next track means you want music: give it back its default level
  if(!musicOn){ $('musicVol').value = 0.4; setMusicVol(0.4); saveSettings(); }
});
for(const [id,key] of [['fxBirth','birth'],['fxSn','sn'],['fxPn','pn'],['fxDrone','drone']]){
  $(id).addEventListener('change', e=>{
    fxOn[key] = e.target.checked;
    if(key==='drone' && audio){
      const at = audio.ctx.currentTime;
      audio.droneG.gain.cancelScheduledValues(at);
      audio.droneG.gain.setTargetAtTime(e.target.checked?1:0, at, 0.4);
    }
  });
}
function setSfxVol(v){
  sfxVol = v;
  $('sfxVolv').textContent = v > 0 ? Math.round(v*100)+'%' : 'off';
  if(v > 0 && !soundOn){
    soundOn = true;
    if(!audio) audio = initAudio();
    if(audio) audio.ctx.resume().catch(()=>armUnlock());
    loadBanks();
  } else if(v === 0) soundOn = false;
  applySfxGain();
}
$('sfxVol').addEventListener('input', e => setSfxVol(+e.target.value));
// music is on by default; effects wait to be switched on (their graph is built then).
// Autoplay is refused before a gesture, so queue the start behind the first one.
loadTrack(0);

// ---------- remembering the settings ----------
// Saved state is replayed through the existing handlers rather than assigned directly,
// so restoring a setting does exactly what clicking it would. Anything momentary — the
// pause, the dive, the epoch jump, the current track position — is deliberately left out.
const SKEY = 'galactic-transit.settings.v1';
const S_TOG = ['tLabels','tArms','tLabelSteady','tZoomBtns','tSpinLock','tDwarfs','tP9','tBelt','tKuiper','tOort','tDust',
               'tEvSN','tEvBirth','tVar',
               'tStatAge','tStatGyr','tStatSn','tStatBirth','tGaia','tFps'];
const S_SLD = ['speed','trailA','orbitA','trailL','musicVol','sfxVol','minB','hudHz','coreB','qrScale'];
const S_CHK = ['fxBirth','fxSn','fxPn','fxDrone','secSolo','closeOnGo','qrOn'];
// Where the QR overlay sits, as fractions of the free space rather than pixels: (1,1) is
// the bottom right corner at any screen size or module scale, so a place chosen by hand
// survives a rotation, a change of scale and a reload. Declared here, above the settings
// writer that reads it — inside the overlay's own block it was a TDZ error at boot.
let qrPos = { x: 1, y: 1 }, qrHeld = false;
function saveSettingsNow(){
  try{
    const s = { t:{}, s:{}, c:{}, cal:$('cal').value, mult:speedMult, dens:curD, dprc:dprCap,
                units:unitMode,
                fsel:$('focusSel').value, sec:secOpen,
                pan:Object.fromEntries(PANELS.map(q => [q.id, { s:pState[q.id].s, o:pState[q.id].o }])),
                bar:$('gamebar').classList.contains('slid'), qrPos,
 };
    S_TOG.forEach(id => s.t[id] = isOn($(id)));
    S_SLD.forEach(id => s.s[id] = $(id).value); s.sv = 2;   // sv 2: the speed slider is a rung index
    S_CHK.forEach(id => s.c[id] = $(id).checked);
    localStorage.setItem(SKEY, JSON.stringify(s));
  }catch(e){}   // private browsing, or storage disabled: just don't remember
}
let saveTimer = 0;
const saveSettings = ()=>{ clearTimeout(saveTimer); saveTimer = setTimeout(saveSettingsNow, 250); };
// Deferred: replaying a saved toggle runs its handler, and some of those reach for
// state declared further down the file (the label elements, the simulation clock).
// This is called at the very end of the script, once every binding exists.
function restoreSettings(register){
  let s = null;
  try{ s = JSON.parse(localStorage.getItem(SKEY) || 'null'); }catch(e){}
  if(s){
    if(s.s && !(s.sv >= 2) && s.s.speed != null) s.s.speed = String(speedRungOf(Math.pow(WEEK_YR, 1-(+s.s.speed))));   // the old continuous slider
    if(s.s) S_SLD.forEach(id=>{ const v=s.s[id];
      if(v != null && $(id).value !== v){ $(id).value = v; $(id).dispatchEvent(new Event('input')); } });
    if(s.c) S_CHK.forEach(id=>{ const v=s.c[id];
      if(v != null && $(id).checked !== v){ $(id).checked = v; $(id).dispatchEvent(new Event('change')); } });
    if(s.t) S_TOG.forEach(id=>{ const v=s.t[id];
      if(v != null && isOn($(id)) !== v) $(id).click(); });   // a checkbox click fires change
    if(s.cal && s.cal !== $('cal').value){ $('cal').value = s.cal; $('cal').dispatchEvent(new Event('change')); }
    if(s.mult > 0 && s.mult !== speedMult) setMultExp(Math.log10(s.mult));
    if(s.dprc === 1 || s.dprc === 2){ if(s.dprc !== dprCap){ dprCap = s.dprc; resize(); } }   // the probe's pixel cap, kept
    if(s.dens){ const i = DETAIL_D.indexOf(s.dens);
      if(i >= 0){ $('detail').value = i; $('detailv').textContent = DETAIL_NAMES[i];   // the slider shows the tier even when it is the boot tier
        if(s.dens !== curD) $('detail').dispatchEvent(new Event('input')); } }
    if(s.units === 'words' || s.units === 'sup' || s.units === 'e') setSegUnits(s.units);
    if(s.fsel === 'sun' || s.fsel === 'mw' || s.fsel === 'and') $('focusSel').value = s.fsel;
    if(s.pan) for(const q of PANELS){
      const v = s.pan[q.id]; if(!v) continue;
      if(v.s === 'l' || v.s === 'r') pState[q.id].s = v.s;
      if(typeof v.o === 'boolean'){ pState[q.id].o = v.o; if(v.o) pState[q.id].seq = ++openSeq; }
    }
    if(s.sec) for(const k of SECS) if(typeof s.sec[k] === 'boolean') secOpen[k] = s.sec[k];
    if(s.bar) $('gamebar').classList.add('slid');
    if(s.qrPos && typeof s.qrPos.x === 'number' && typeof s.qrPos.y === 'number') qrPos = s.qrPos;
  }
  { // the settings dialog stays shut unless a saved record says otherwise
    if(!(s && s.pan && s.pan.hud && s.pan.hud.o === true)) pState.hud.o = false;
    layoutPanels();

  }
  applySecs();
  if(register === false) return;
  // from here on, anything the user touches is remembered
  S_TOG.forEach(id => $(id).addEventListener('click', saveSettings));
  S_SLD.forEach(id => $(id).addEventListener('input', saveSettings));
  S_CHK.forEach(id => $(id).addEventListener('change', saveSettings));
  $('cal').addEventListener('change', saveSettings);
  $('collapse').addEventListener('click', saveSettings);
  $('reopen').addEventListener('click', saveSettings);
  $('multExp').addEventListener('input', saveSettings);
  $('detail').addEventListener('input', saveSettings);
  $('focusSel').addEventListener('change', saveSettings);
}
toggle($('tOort'), on=> showOort=on);
function updateBar(){
  showStats = ['sCal','sAge','sGyr','cDeath','cBirth'].some(id => $(id).style.display !== 'none');
  $('gamebar').style.display = showStats ? 'flex' : 'none';
  fitPanels();
}
function statToggle(btn, statId){ toggle(btn, on=>{ $(statId).style.display = on?'':'none'; updateBar(); }); }
statToggle($('tStatAge'), 'sAge');
statToggle($('tStatGyr'), 'sGyr');
statToggle($('tStatSn'), 'cDeath');
statToggle($('tStatBirth'), 'cBirth');
const setSegUnits = seg('segUnits', 'words', v => { unitMode = v; });
let liveCount = false;   // retired control; the rate view lives in the calendar options
let calMode='ad', unitMode='words';
function syncCal(){
  calMode = $('cal').value;
  // "none" is the off position: the cell leaves the bar entirely
  $('sCal').style.display = calMode === 'none' ? 'none' : '';
  updateBar();
  $('lCal').textContent = calMode === 'rate' ? 'years per second' : 'human year';
}
$('cal').addEventListener('change', syncCal);
// Replaying matters here: an event like the Gliese 710 pass is over in a second or two,
// and re-picking the same entry fires no change event, so there would be no way back to
// it short of reloading.
let keepSaved = false;   // set only while the opening scenario stages itself
function jumpToEpoch(){
  followTarget = 'sun';
  const sel = $('jump');
  const a = sel.value === '' ? AGE0 : parseFloat(sel.value);   // a letter after the age marks a staged event at that age
  // some epochs are over in a blink on the galactic clock; land at a speed that shows them
  const opt = sel.selectedOptions[0];
  // The clock is part of the staged view, not a preference: the helix is only legible
  // at a year a second, the Gliese pass at a thousand, the Andromeda approach at a
  // hundred million. A scenario therefore sets its own pace even at boot, where a
  // returning visitor's other settings are left alone.
  const sp = opt && opt.dataset.rate, mu = opt && opt.dataset.mult;   // the rate in years per second → its rung
  if(sp !== undefined && sp !== null){ $('speed').value = speedRungOf(+sp); $('speed').dispatchEvent(new Event('input')); }
  if(mu) setMultExp(Math.log10(+mu));
  if(sel.value === 'helix'){
    // not an epoch: a staging entry for the true helix. At one year a second the Sun
    // covers 48 AU while Earth loops once around it — visible, and actually accurate.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!keepSaved){   // the owner's exported look: full trails over half-strength rings
      $('trailA').value = 1;   $('trailA').dispatchEvent(new Event('input'));
      $('orbitA').value = 0.5; $('orbitA').dispatchEvent(new Event('input'));
      if(trailPct < 250){ $('trailL').value = 300; $('trailL').dispatchEvent(new Event('input')); }
    }
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.distGoal = 1.449e-5;                   // ~31 AU across
    cam.yaw = 0.7014; cam.pitch = 0.2757;      // the exported angle chosen by hand
    // the clock reads the real date and time: simT counts Earth's orbits from 2026.0
    simT = (Date.now() - Date.UTC(2026, 0, 1)) / (365.2425*86400e3);
    nextSample = simT + DT_SAMPLE; refillTrails();
    // never unpause someone who asked for reduced motion
    if(paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
    return;
  }
  simT = (a - AGE0)*1e9/YR_PER_SIM;
  if(sel.value === '11.3586'){
    // Lands where the Sun has swollen to ten times its size and runs to the moment its
    // surface passes Earth's orbit: 768 Myr of red giant, played out in about 35
    // seconds. The frame is two and a half AU, so the disc grows from a small circle
    // to something that fills it and takes the inner planets on the way.
    if($('tView').classList.contains('on')) $('tView').click();
    if($('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; coreLock = false;
    cam.dist = cam.distGoal = 1.14e-6;
    cam.yaw = 0.6; cam.pitch = 0.34;
    reseedFollow = true; panF[0]=panF[1]=0;
    if(paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '12.35'){
    // Lands 20 Myr short of the shell: at ten million years a second it is cast in seven
    // seconds and fades over the next thirty. The frame is ~3.5 ly, the shell's full
    // reach, the eye following what is left of the Sun.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; coreLock = false;
    cam.dist = cam.distGoal = 0.1;
    cam.yaw = 0.9; cam.pitch = 0.28;
    reseedFollow = true; panF[0]=panF[1]=0;
    if(paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '8.36149'){
    // Lands 0.7 Gyr short of the first passage — ~95,000 parsecs, drawn to scale, so
    // the disks never touch; watch the far outer disks reach for each other instead.
    // At a hundred million years a second the pass arrives in about seven.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; coreLock = true;
    // set outright, not eased: the climb from dive scale spans eleven decades and would
    // spend the whole approach travelling instead of watching it
    cam.dist = cam.distGoal = 15500;
    cam.yaw = 5.9257; cam.pitch = 0.5771;
    reseedFollow = true; panF[0]=panF[1]=0;
    if(paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '11.25'){
    // The main event: the second passage at ~30 kpc, the third at ~13, and the slide
    // into one elliptical — 2.3 Gyr in about 23 seconds. The camera stands far enough
    // back to hold both galaxies as they close.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; coreLock = true;
    cam.dist = cam.distGoal = 9200;
    cam.yaw = 5.6; cam.pitch = 0.62;
    reseedFollow = true; panF[0]=panF[1]=0;
    if(paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '4.5692567'){
    // stage the pass: the camera frames the Oort cloud with the star already in view.
    // It lands at the shell's outer edge, 1.6 ly out; at 1,900 years a second the
    // crossing — 3.2 ly at 14.4 km/s — takes almost exactly 35 seconds.
    if($('tView').classList.contains('on')) $('tView').click();
    if($('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; coreLock = false;
    cam.distGoal = 0.144;                     // ~5 ly across: the whole Oort shell
    cam.yaw = 0.72; cam.pitch = -0.31;        // faces the star's approach track
  }
  // Earth's own events are watched from Earth: the globe filling the view, followed. The
  // continental ones lock the camera to the spin and put the eye over the face that
  // matters, given as yaw = atan2(cos lat cos lon, −cos lat sin lon), pitch = lat:
  //   plates    20° N 30° W  the Atlantic, so it opens and closes in view
  //   Pangaea   15° N  0°    the supercontinent's heart, Africa still where it is
  //   Proxima   10° N 20° W  the closed Atlantic again
  //   oceans    10° N 20° W  the same face, drying
  const EARTH_AIM = { '4.318':[1.047, 0.35], '4.318p':[1.571, 0.26], '4.818x':[1.222, 0.17], '5.6v':[1.222, 0.17] };
  if(sel.value === '0.058' || sel.value === '0.768' || sel.value === '2.068' || EARTH_AIM[sel.value]){
    $('focusSel').value = 'earth'; applyFocusView();
    const aim = EARTH_AIM[sel.value];
    if(aim){
      if(!$('tSpinLock').checked){ $('tSpinLock').checked = true; $('tSpinLock').dispatchEvent(new Event('change')); }
      cam.yaw = aim[0]; cam.pitch = aim[1];
    }
    if(paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  nextSample = simT + DT_SAMPLE;
  events.length = 0; puffs.length = 0;
  accB = accSN = accPN = 0;
  refillTrails();
}
$('jump').addEventListener('change', e=>{ reseedFollow=true; panF[0]=panF[1]=0; jumpToEpoch(e); });
$('jumpGo').addEventListener('click', ()=>{
  jumpToEpoch();
  // the point of GO is to watch the scenario, so the panel steps aside — unless the
  // visitor would rather keep it open and try one scenario after another
  if($('closeOnGo').checked && pState.simPanel.o) setPanelOpen('simPanel', false);
});
const sup = e => String(e).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
function fmtYears(y){ // a duration in years → astronomer units, or ×10^x notation
  // Jumping to an epoch before an era began gives a negative span: show how far short
  // it falls rather than a raw minus sign glued to a locale string.
  if(y < 0) return '−'+fmtYears(-y);
  if(unitMode==='sup'){
    const e=Math.floor(Math.log10(Math.max(1,y)));
    return (y/Math.pow(10,e)).toFixed(4)+'×10'+sup(e)+' yr';
  }
  if(unitMode==='e'){
    const e=Math.floor(Math.log10(Math.max(1,y)));
    return (y/Math.pow(10,e)).toFixed(4)+'e'+e+' yr';
  }
  if(y>=1e9) return (y/1e9).toFixed(4)+' Gyr';
  if(y>=1e6) return (y/1e6).toFixed(4)+' Myr';
  if(y>=1e3) return (y/1e3).toFixed(3)+' kyr';
  return Math.floor(y).toLocaleString('en-US')+' yr';
}
function fmtCount(n){
  if(n>=1e15){ const e=Math.floor(Math.log10(n)); return (n/Math.pow(10,e)).toFixed(2)+'×10'+supStr(e); }
  if(n>=1e12) return (n/1e12).toFixed(2)+'T';
  if(n>=1e9)  return (n/1e9).toFixed(2)+'B';
  if(n>=1e6)  return (n/1e6).toFixed(2)+'M';
  if(n>=1e3)  return (n/1e3).toFixed(1)+'k';
  return String(Math.floor(n));
}
function humanYear(){
  // Two clocks, and each reading takes the one it actually measures. A year IS one
  // orbit of the Earth, and the Earth is drawn orbiting once per simulated year, so the
  // civil calendars advance one year per simulated year — exactly, not approximately.
  // The deep-time eras below measure elapsed galactic time instead, on the same clock
  // as the age and galactic-year stats, since that is what they are counting. The two
  // diverge by the compression factor, which is the whole subject of the piece; jump to
  // a galactic epoch and the civil year is the reading that stops meaning anything.
  const el = simT*YR_PER_SIM;      // galactic clock: real years elapsed
  const g = 2026 + simT;           // planetary clock: Earth orbits counted
  const fmt = n => Math.floor(n).toLocaleString('en-US');
  switch(calMode){
    case 'ah':   return fmt((g-621.57)*1.03069)+' A.H.'; // lunar years run ~3% faster
    case 'vs':   return fmt(g+57)+' V.S.';
    case 'saka': return fmt(g-78)+' Śaka';
    case 'am':   return fmt(g+3760)+' A.M.';
    case 'al':   return fmt(g+4000)+' A.L.';
    case 'he':   return fmt(g+10000)+' H.E.';          // Holocene calendar: +10,000 yr
    case 'her':  return fmtYears(2000000+el);        // since Homo erectus emerged (~2 Myr ago)
    case 'hom':  return fmtYears(7000000+el);        // since the chimp–human lineage split (~7 Myr ago)
    case 'mam':  return fmtYears(200000000+el);      // since the first true mammals (~200 Myr ago, Late Triassic)
    case 'hs':   return fmtYears(300000+el);         // since Homo sapiens emerged (~300 kyr ago)
    case 'land':  return fmtYears(4.70e8+el);        // plants and fungi colonise land (~470 Myr ago)
    case 'plant': return fmtYears(1.00e9+el);        // first green algae (~1 Gyr ago)
    case 'cell':  return fmtYears(3.80e9+el);        // earliest cellular life (oldest solid evidence)
    case 'amino': return fmtYears(4.40e9+el);        // prebiotic amino acids, Hadean Earth
    case 'theia': return fmtYears(4.51e9+el);        // the Moon-forming giant impact
    case 'earth': return fmtYears(4.54e9+el);        // Earth's formation — the age of the planet
    case 'rate': { // not a date at all: how much time passes per second of watching
      return speedLabel();
    }
    default:     return g>=1 ? fmt(g)+' AD' : fmt(1-g)+' BC';
  }
}
toggle($('tView'), on=>{ followTarget='sun'; cam.follow=!on; cam.distGoal = on? 4300 : 150; reseedFollow=true; panF[0]=panF[1]=0; });
function refillTrails(){
  bodyPos(0, simT, tmpSun);
  trailAnchor[0]=tmpSun[0]; trailAnchor[1]=tmpSun[1]; trailAnchor[2]=tmpSun[2];
  // The trail is the path the viewer has watched being swept: sample TRAIL_N−1 is now and
  // the brightest, sample 0 the earliest seen and the dimmest. With the clock running
  // backwards "earliest seen" is the LATER sim time, so the samples run the other way —
  // otherwise the trail pointed into the sim-past, which in reverse lies ahead of the
  // body, and it led instead of trailed.
  const dirT = shuttle < 0 ? -1 : 1;
  for(let i=0;i<NB;i++){
    const a=trails[i];
    for(let k=0;k<TRAIL_N;k++){
      trailPos(i, simT - dirT*((TRAIL_N-1)-k)*DT_SAMPLE, tmp);
      a[k*3]=tmp[0]; a[k*3+1]=tmp[1]; a[k*3+2]=tmp[2];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,trailBufs[i]);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,a);
  }
}
function setBodySizes(){ gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize); gl.bufferData(gl.ARRAY_BUFFER, realMode?realSizes:dispSizes, gl.STATIC_DRAW); }
setBodySizes();   // real proportions from the first frame
toggle($('tDive'), on=>{ panF[0]=panF[1]=0;
  reseedFollow = true; panF[0]=panF[1]=0;
  if(on){
    if($('tView').classList.contains('on')) $('tView').click();  // diving follows the Sun
    followTarget='sun'; cam.follow=true;
    coreLock=true; cam.yaw=0; cam.pitch=0;   // start looking straight down the line to the core
    cam.distGoal=3.5e-5; // ~75 AU across: the whole planetary system, Kuiper belt included
  } else { coreLock=false; cam.distGoal=150; }
});
// Star density as one row of choices rather than stacked overrides. The top settings
// are enormous — x8 is some seventeen million sprites — so a failed allocation falls
// back to what was working instead of leaving a half-built galaxy.
const DETAIL_D = [1,5,20,40,80,160];
const DETAIL_NAMES = ['lowest','low','medium','high','max','ultra'];
$('detail').addEventListener('input', e=>{
  const i = Math.max(0, Math.min(5, Math.round(+e.target.value)));
  const prev = curD;
  try{ setGalaxy(DETAIL_D[i]); }
  catch(err){ try{ setGalaxy(prev); }catch(e2){}
    const j = DETAIL_D.indexOf(curD); if(j>=0) e.target.value = j; }
  $('detailv').textContent = DETAIL_NAMES[DETAIL_D.indexOf(curD)] || DETAIL_NAMES[0];
});
// ---------- (i) tooltips: one floating box, shown by a tap, gone on the next ----------
const tipEl = document.createElement('div'); tipEl.id = 'tip'; document.body.appendChild(tipEl);
let tipFor = null, tipTimer = 0;
function hideTip(){ tipEl.style.display = 'none'; if(tipFor) tipFor.classList.remove('on'); tipFor = null; clearTimeout(tipTimer); }
function showTip(btn){
  if(tipFor === btn){ hideTip(); return; }
  hideTip(); tipFor = btn; btn.classList.add('on');
  tipEl.textContent = btn.dataset.tip; tipEl.style.display = 'block';
  const r = btn.getBoundingClientRect(), tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  const x = Math.min(innerWidth - tw - 6, Math.max(6, r.left + r.width/2 - tw/2));
  const y = r.bottom + th + 6 > innerHeight - 6 ? r.top - th - 6 : r.bottom + 6;
  tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
  tipTimer = setTimeout(hideTip, 8000);
}
document.addEventListener('click', e=>{
  const b = e.target.closest('.info');
  if(b){ e.preventDefault(); e.stopPropagation(); showTip(b); } else if(tipFor) hideTip();
}, true);
addEventListener('scroll', ()=>{ if(tipFor) hideTip(); }, true);
addEventListener('resize', ()=>{ if(tipFor) hideTip(); });
// ---------- fullscreen & screen orientation ----------
const isFs = ()=> !!(document.fullscreenElement || document.webkitFullscreenElement);
function reqFs(){
  const el = document.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen;
  return f ? Promise.resolve(f.call(el)).catch(()=>{}) : Promise.reject();
}
function exitFs(){ const f = document.exitFullscreen || document.webkitExitFullscreen; if(f) f.call(document); }
const toggleFs = ()=> isFs() ? exitFs() : reqFs();
$('tFull').addEventListener('click', toggleFs);
document.addEventListener('fullscreenchange', ()=> $('tFull').classList.toggle('on', isFs()));
// Turning the device to landscape asks for fullscreen. Browsers only grant it while a
// gesture is still being handled, so this is armed on rotation and fires on the next
// touch rather than fighting the permission model — and it never forces you back in
// after you deliberately left fullscreen in landscape.
let autoFsArmed = false, leftFsInLandscape = false;
const landscape = ()=> matchMedia('(orientation: landscape)').matches;
document.addEventListener('fullscreenchange', ()=>{ if(!isFs() && landscape()) leftFsInLandscape = true; });
function armAutoFs(){
  if(!landscape() || isFs() || autoFsArmed) return;
  autoFsArmed = true;
  const go = ()=>{
    removeEventListener('pointerup', go); removeEventListener('touchend', go);
    autoFsArmed = false;
    if(landscape() && !isFs() && !leftFsInLandscape) reqFs();
  };
  addEventListener('pointerup', go, {once:false}); addEventListener('touchend', go, {once:false});
}
matchMedia('(orientation: landscape)').addEventListener('change', e=>{
  if(e.matches){ leftFsInLandscape = false; reqFs().catch(()=>armAutoFs()); armAutoFs(); }
});
// Rotation cycles auto -> landscape -> portrait. Locking requires fullscreen and is
// mobile-only; where the API refuses, the button falls back to auto rather than lying.
const ROT = ['auto','landscape','portrait'];
let rotIx = 0;
$('tRotate').addEventListener('click', async ()=>{
  rotIx = (rotIx+1) % ROT.length;
  const mode = ROT[rotIx];
  const setLabel = m => { $('tRotate').textContent = '⟳ '+m; $('tRotate').classList.toggle('on', m!=='auto'); };
  setLabel(mode);
  try{
    if(mode==='auto'){ screen.orientation.unlock(); return; }
    if(!isFs()) await reqFs();
    await screen.orientation.lock(mode);
  }catch(err){ rotIx = 0; setLabel('auto'); }
});
// Launched as an installed app: the manifest asks for fullscreen, and this catches
// the platforms that don't honour it. Orientation is deliberately left unlocked, so
// the app opens in whatever rotation the screen is already in.
if(matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true){
  const once = ()=>{ removeEventListener('pointerdown', once); removeEventListener('keydown', once); if(!isFs()) reqFs(); };
  addEventListener('pointerdown', once); addEventListener('keydown', once);
}
if(location.protocol.startsWith('http') && 'serviceWorker' in navigator){
  addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
$('collapse').addEventListener('click', ()=> setPanelOpen('hud', false));
document.querySelectorAll('.pclose[data-close]').forEach(b =>
  b.addEventListener('click', () => setPanelOpen(b.dataset.close, false)));
// ---------- the first run ----------
// A guided look at what is on screen, drawn with a line from each line of text to the
// thing it names. It is shown once, and only to a visitor who has no saved settings —
// somebody returning has already met the interface.
const TOURKEY = 'galactic-transit.tour';
// Each hint is a small box of its own, set beside the thing it names with a short
// line between the two — the way a wizard points at an interface rather than
// describing it from a distance.
const TOUR_HINTS = [
  { t:'env',      k:'Earth',      s:"Conditions on Earth as the Galaxy carries it, and what the view is centred on." },
  { t:'simPanel', k:'Simulation', s:"The pace of the clock, and the scenarios worth watching." },
  { t:'hud',      k:'Settings',   s:"Everything else: what is drawn, the audio, the readouts." },
  { t:'tLabelsAll', k:'Labels',   s:"Every on-screen label at once — planets, galaxy arms, Andromeda and its companions." },
  { t:'tInfo',    k:'About',      s:"This text again, with the notes on what is measured and what is modelled." },
  { t:'zoomIn',   k:'Zoom',       s:"In or out, object to object: two presses take the view from one scale to the next." },
  { t:'gamebar',  k:'Readouts',   s:"Drag a panel to the other side, or off its edge to close it. This bar slides away downward." },
];
// a closed panel is represented by its dot, which is what the visitor can actually see
function tourTarget(id){
  const el = $(id);
  if(el && getComputedStyle(el).display !== 'none' && el.style.visibility !== 'hidden') return el;
  const pan = PANELS.find(q => q.id === id);
  const dot = pan && $(pan.dot);
  return (dot && getComputedStyle(dot).display !== 'none') ? dot : null;
}
function drawTourLines(){
  const svg = $('tourSvg'), host = $('tourHints');
  const card = $('tourCard').getBoundingClientRect();
  svg.innerHTML = ''; host.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg', W = innerWidth, H = innerHeight, GAP = 18;
  const placed = [card];
  const clash = r => placed.some(q => r.left < q.right+8 && q.left < r.right+8 &&
                                      r.top < q.bottom+8 && q.top < r.bottom+8);
  for(const h of TOUR_HINTS){
    const tgt = tourTarget(h.t);
    if(!tgt) continue;
    const r = tgt.getBoundingClientRect();
    if(!r.width && !r.height) continue;
    const box = document.createElement('div');
    box.className = 'hint';
    box.innerHTML = '<b>' + h.k + '</b>' + h.s;
    host.appendChild(box);
    const bw = box.offsetWidth, bh = box.offsetHeight;
    // beside the target, on the side with room; below it when it spans the width
    const wide = r.width > W*0.6;
    const onLeft = r.left + r.width/2 < W/2;
    // On a narrow screen a hint set beside its target leaves the two columns
    // overlapping, and then no two hints may share a row. Pinned to the edges they
    // clear each other, and the connector still says which is which.
    const tight = W < 620;
    let x = tight ? (onLeft ? 14 : W - bw - 14)
          : wide  ? Math.min(Math.max(r.left, 14), W-bw-14)
                  : (onLeft ? r.right + GAP : r.left - GAP - bw);
    let y = wide ? (r.top > H/2 ? r.top - GAP - bh : r.bottom + GAP)
                 : r.top + Math.min(r.height/2, 24) - bh/2;
    x = Math.min(Math.max(x, 14), W - bw - 14);
    y = Math.min(Math.max(y, 14), H - bh - 14);
    // Look over the whole column rather than stepping downward and giving up: on a
    // narrow screen the free room is in the bands above and below the card, which a
    // one-directional walk never reaches. Candidates are tried nearest-first, so a
    // hint stays beside its target when it can and travels only as far as it must.
    let cand = { left:x, top:y, right:x+bw, bottom:y+bh };
    if(clash(cand)){
      // the other flank as well as the other height: with two columns of hints on a
      // narrow screen, a free row often exists only on the side the hint did not want
      const xAlt = tight ? (onLeft ? W - bw - 14 : 14)
        : Math.min(Math.max(wide ? W - bw - 14
                    : (x > r.left ? r.left - GAP - bw : r.right + GAP), 14), W - bw - 14);
      const lo = 14, hi = Math.max(lo, H - bh - 14), slots = [];
      for(let yy = lo; yy <= hi; yy += 8) slots.push(yy);
      slots.sort((a,b)=> Math.abs(a-y) - Math.abs(b-y));
      let found = null;
      for(const xx of (xAlt === x ? [x] : [x, xAlt])){
        for(const yy of slots){
          const c2 = { left:xx, top:yy, right:xx+bw, bottom:yy+bh };
          if(!clash(c2)){ found = c2; break; }
        }
        if(found) break;
      }
      if(found) cand = found;
    }
    box.style.left = cand.left + 'px'; box.style.top = cand.top + 'px';
    placed.push(cand);
    // the connector runs from the hint's near flank to the target's
    const fromRight = cand.left > r.left;
    const x1 = fromRight ? cand.left : cand.right, y1 = cand.top + bh/2;
    const x2 = fromRight ? Math.min(r.right, x1) : Math.max(r.left, x1);
    const y2 = r.top + Math.min(r.height/2, 24);
    const mid = (x1 + x2)/2;
    const path = document.createElementNS(ns,'path');
    path.setAttribute('d', `M ${x1} ${y1} C ${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`);
    path.setAttribute('fill','none');
    path.setAttribute('stroke','rgba(95,216,255,.6)');
    path.setAttribute('stroke-width','1.2');
    svg.appendChild(path);
    const d = document.createElementNS(ns,'circle');
    d.setAttribute('cx', x2); d.setAttribute('cy', y2); d.setAttribute('r','3.5');
    d.setAttribute('fill','rgb(95,216,255)');
    svg.appendChild(d);
  }
}
let tourHeldClock = false;
function showTour(){
  $('tour').style.display = 'flex';
  // on a narrow screen the panel and the hints cannot both have the corner: the panel
  // steps aside for the tour, and the tour hands it back on the way out
  if(innerWidth < 760 || innerHeight > innerWidth) setPanelOpen('env', false);
  if(!paused){ tourHeldClock = true; $('tPause').click(); }   // nothing moves while you read
  requestAnimationFrame(()=> requestAnimationFrame(drawTourLines));
}
$('tourGo').addEventListener('click', ()=>{
  $('tour').style.display = 'none';
  setPanelOpen('env', true);                                 // the readings are the default view
  if(tourHeldClock && paused) $('tPause').click();            // and starts when you do
  tourHeldClock = false;
  try{ localStorage.setItem(TOURKEY, '1'); }catch(e){}
});
$('tourAgain').addEventListener('click', ()=>{ $('infoModal').style.display='none'; showTour(); });
addEventListener('resize', ()=>{ if($('tour').style.display === 'flex') drawTourLines(); });

$('tInfo').addEventListener('click', ()=>{ $('infoModal').style.display='flex'; });
$('infoClose').addEventListener('click', ()=>{ $('infoModal').style.display='none'; });
$('infoModal').addEventListener('click', e=>{ if(e.target.id==='infoModal') $('infoModal').style.display='none'; });
if(matchMedia('(prefers-reduced-motion: reduce)').matches){ $('tPause').click(); }

// labels
const labelWrap=$('labels');
const labelEls = BODIES.map(b=>{
  const d=document.createElement('div'); d.className='lbl'; d.textContent=b[0];
  labelWrap.appendChild(d); return d;
});
const moonEl = (()=>{ const d=document.createElement('div'); d.className='lbl'; d.textContent='Moon'; d.style.display='none'; d.style.opacity='0.65'; labelWrap.appendChild(d); return d; })();
// The solar system's own structures, labelled at their real radii. Each label sits on
// its ring at the Sun's side, appears only while its structure is switched on and its
// ring is actually resolvable on screen, and hides again when it would be a dot.
const STRUCTS = [            // name, ring radius in AU, visibility switch
  ['asteroid belt', 2.7,     () => showBelt],
  ['Kuiper belt',   44,      () => showKuiper],
  ['Oort cloud',    63241,   () => showOort],       // one light year, mid-shell
];
const structEls = STRUCTS.map(s=>{
  const d=document.createElement('div'); d.className='lbl'; d.textContent=s[0];
  d.style.display='none'; d.style.opacity='0.55'; labelWrap.appendChild(d); return d;
});
// Spiral-arm names, placed on this map's measured bright ridges and named by their
// radial order from the Sun, after the canonical face-on annotation. They ride the
// density-wave rotation, exactly as the arm pattern itself does in the shader.
let armsOn = true;
const ARM_LBLS = [
  ['Orion Spur',          150,  830],
  ['Sagittarius–Carina',  110,  580],
  ['Perseus',              70, 1010],
  ['Scutum–Centaurus',   -170, -560],
  ['Outer Arm',          -260, 1340],
  ['Galactic bar',         30,   40],
];
const armEls = ARM_LBLS.map(a=>{
  const d=document.createElement('div'); d.className='armlbl'; d.textContent=a[0];
  d.style.display='none'; labelWrap.appendChild(d); return d;
});
// Andromeda and company, positioned in its own disk frame and carried on its orbit
const M31_LBLS = [
  ['Andromeda (M31)', 0, 60, 0],
  ['M32', -150, -80, 530],
  ['M110', 760, 240, -420],
  ['Giant Southern Stream', 1030, -1330, -2420],
];
const m31Els = M31_LBLS.map(a=>{
  const d=document.createElement('div'); d.className='armlbl'; d.textContent=a[0];
  d.style.display='none'; labelWrap.appendChild(d); return d;
});
// One galaxy, one name: once the two disks have become a single blob the remnant is
// Milkomeda (Cox & Loeb 2008), and every other galaxy name has already stepped down.
const mergedEl = (()=>{ const d=document.createElement('div'); d.className='armlbl'; d.textContent='Milkomeda';
  d.style.display='none'; labelWrap.appendChild(d); return d; })();
// Steady labels. A label follows its target by easing (a short time constant, so it
// never visibly lags), holds still through a single leap (a scenario jump, a
// reappearance — a label should land, not fly across the screen), and steps aside
// while its target leaps frame after frame: a planet sweeping round its orbit several
// times a second is motion no label can follow, and one that tries just spins. It
// comes back once the motion has been calm for a dozen frames. Hiding is debounced
// too, so a target flickering across a visibility threshold does not blink its name.
// Off, it is the old direct placement. State rides on the element itself.
let frameDt = 1/60;
function placeLabel(el, x, y, show){
  if(!labelSteady){
    if(show){ el.style.display='block'; el.style.left=x+'px'; el.style.top=y+'px'; }
    else el.style.display='none';
    return;
  }
  const s = el._lb || (el._lb = { x, y, on:false, hid:0, leaps:0, calm:99, spin:false });
  if(!show){
    s.hid += frameDt; s.x = x; s.y = y;
    if(s.on && s.hid > 0.18){ el.style.display='none'; s.on=false; }
    return;
  }
  s.hid = 0;
  const leap = Math.hypot(x - s.x, y - s.y) > 90;
  if(leap){ s.leaps = Math.min(6, s.leaps + 2); s.calm = 0; } else { s.leaps = Math.max(0, s.leaps - 1); s.calm++; }
  if(s.spin){                                  // stepped aside: wait for calm
    s.x = x; s.y = y;
    if(s.calm < 12) return;
    s.spin = false;
  } else if(s.leaps >= 4){                     // leaping every frame: whirling
    s.spin = true; s.x = x; s.y = y;
    if(s.on){ el.style.display='none'; s.on=false; }
    return;
  }
  if(!s.on || leap){ s.x = x; s.y = y; }        // land; never fly
  else { const k = 1 - Math.exp(-frameDt/0.06); s.x += (x - s.x)*k; s.y += (y - s.y)*k; }
  s.on = true;
  el.style.display='block'; el.style.left=s.x+'px'; el.style.top=s.y+'px';
}
// Gliese 710's own buffer and label, here because dynVAO and the label host exist by now
const g710GL = dynVAO(1);
const g710Pos = new Float32Array(3), g710Size = new Float32Array(1), g710Col = new Float32Array(3);
const g710Lbl = (()=>{ const d=document.createElement('div'); d.className='lbl'; d.textContent='Gliese 710';
  d.style.color='rgba(255,190,140,.9)'; labelWrap.appendChild(d); return d; })();

// ---------- the interface colour follows the hazard ----------
// Blended rather than stepped, because the hazard itself varies continuously with where
// the Sun sits: cosmic rays climb as it enters a spiral arm and fall again on the way
// out, so the panels warm and cool with the crossing instead of flipping at a threshold.
// Temperature as colour, on the scale the user set: −20 is ice, +50 is extreme heat,
// +60 and beyond is the violet of a world past saving. The stops in between are chosen
// so that Earth's own comfortable range reads green rather than alarming.
const T_STOPS = [
  [-60, [120,170,255]], [-20, [ 74,168,255]], [  0, [102,216,232]],
  [ 15, [ 95,211,154]], [ 30, [255,209,102]], [ 50, [255, 90, 74]],
  [ 60, [196,107,255]], [ 90, [214,140,255]],
];
function tempColour(c){
  const s = T_STOPS;
  if(c <= s[0][0]) return 'rgb('+s[0][1].join(',')+')';
  for(let i=1;i<s.length;i++){
    if(c <= s[i][0]){
      const u = (c - s[i-1][0])/(s[i][0] - s[i-1][0]);
      const a = s[i-1][1], b = s[i][1];
      return 'rgb('+a.map((v,k)=> Math.round(v + (b[k]-v)*u)).join(',')+')';
    }
  }
  return 'rgb('+s[s.length-1][1].join(',')+')';
}
const C_SAFE = [95,216,255], C_WARN = [255,207,92], C_DEAD = [255,110,110], C_ICE = [176,232,255];
const C_LIFE = [74,214,126];   // habitable reads green, not the interface's cyan
const mix3 = (a,b,u)=> [a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u, a[2]+(b[2]-a[2])*u];
const INK_WARM = [220,232,245], DIM_WARM = [132,146,172];   // the unfrozen text colours
const rgbStr = c => 'rgb('+c.map(v=>Math.round(v)).join(',')+')';
let lastRGB = '', lastA = -1, lastIce = -1, lastWhite = -1, iceShown = 0, iceLast = performance.now();
function setStateColour(h, meanC){
  h = Math.min(1, Math.max(0, h));
  let rgb = h < 0.5 ? mix3(C_SAFE, C_WARN, h/0.5) : mix3(C_WARN, C_DEAD, (h-0.5)/0.5);
  // how cold the climate model runs, eased in over the couple of degrees around the
  // glacial threshold so the frost arrives gradually too
  const coldNow = Math.min(1, Math.max(0, (11.9 - meanC)/2.4));
  { // ease toward it over about a second, independent of frame rate
    const now = performance.now(), dt = Math.min(0.1, (now - iceLast)/1000); iceLast = now;
    iceShown += (coldNow - iceShown) * Math.min(1, dt*1.6);
  }
  const cold = iceShown;
  if(cold > 0) rgb = mix3(rgb, C_ICE, cold*(1-h)*0.85);
  const amt = Math.min(1, Math.max(h, cold*0.75));
  const life = h < 0.5 ? mix3(C_LIFE, C_WARN, h/0.5) : mix3(C_WARN, C_DEAD, (h-0.5)/0.5);
  // A frozen interface reads white. Anything already carrying a warning is left as it
  // is: the whitening fades out as the hazard rises into amber, and is gone by the time
  // it is red. The life-support word keeps its own ramp throughout — it is the one
  // reading whose colour is the message.
  // cold rarely reaches its ceiling, so the curve is steepened: a real glacial should
  // read white, not merely pale
  // The gate has to start where the colour actually turns amber, not at zero hazard: a
  // glacial epoch is caused by high cosmic rays, so it always carries some hazard of its
  // own, and ramping from zero meant a deep freeze suppressed its own whitening.
  const gate = 1 - Math.min(1, Math.max(0, (h - 0.30)/0.04));
  const whiten = Math.min(1, cold*1.6) * gate;
  rgb = mix3(rgb, [255,255,255], whiten);
  const s = rgb.map(v=>Math.round(v)).join(',');
  const a = Math.round(amt*100)/100;
  const ia = Math.round(cold*100)/100;
  if(ia !== lastIce){
    lastIce = ia;
    document.documentElement.style.setProperty('--iceA', String(ia));
  }
  const wr = Math.round(whiten*100)/100;
  if(wr !== lastWhite){
    lastWhite = wr;
    const st2 = document.documentElement.style;
    st2.setProperty('--ink', rgbStr(mix3(INK_WARM, [255,255,255], wr)));
    st2.setProperty('--dim', rgbStr(mix3(DIM_WARM, [228,242,255], wr)));
  }
  if(s === lastRGB && a === lastA) return;   // only touch styles when it actually moves
  lastRGB = s; lastA = a;
  // On the root element, not the body: --accent and --glow are declared on :root and
  // resolve their var() there, so an override further down never reaches them.
  const st = document.documentElement.style;
  st.setProperty('--stateRGB', s);
  st.setProperty('--stateA', String(a));
  st.setProperty('--lifeRGB', life.map(v=>Math.round(v)).join(','));
}

// ---------- resize ----------
let W=0,H=0,DPR=1, projMat, dprCap=2;   // dprCap: the first-launch probe lowers it on a slow device
// The settings panel gets the room it needs. On a small screen it reaches across the
// environment readout beside it, and down over the status bar and the view scale below.
// Whatever it actually overlaps steps aside until it is collapsed again — measured, not
// guessed from a breakpoint, since the panel's own height depends on how much is in it.
// the panels police their own overlaps now; these are the pieces that only ever
// have to yield to them
const CROWDABLE = ['fpsBox','scaleNote','gamebar'];
function fitPanels(){
  const hud = $('hud');
  const items = CROWDABLE.map(id => $(id));
  items.forEach(el => el.classList.remove('crowded'));
  if(hud.style.display === 'none') return;              // collapsed: everything fits
  const h = hud.getBoundingClientRect(), pad = 8;
  for(const el of items){
    if(el.style.display === 'none') continue;           // switched off by hand
    const r = el.getBoundingClientRect();
    if(!r.width && !r.height) continue;
    const clear = r.right < h.left - pad || r.left > h.right + pad
               || r.bottom < h.top - pad || r.top > h.bottom + pad;
    if(!clear) el.classList.add('crowded');
  }
}
// ---------- highlight rolloff ----------
// Everything is drawn with additive blending, so a galaxy core — thousands of sprites
// stacked on one pixel — sums far past 1.0 and the screen simply clips it to flat white.
// That is fine for one core and useless during the merger, where the whole remnant piles
// into a single blown-out disc. The scene is drawn into a half-float buffer instead,
// which holds those sums, and this pass maps them back into range: identity below the
// knee, then asymptotic, so a core keeps its gradient and its colour instead of becoming
// a white hole. The ratio is applied to all three channels together, so hues survive.
const TONE_VS = `#version 300 es
out vec2 vUV;
void main(){
  vec2 p = vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  vUV = p;
  gl_Position = vec4(p*2.0-1.0, 0.0, 1.0);
}`;
const TONE_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform float uKnee;
in vec2 vUV; out vec4 o;
void main(){
  vec3 c = texture(uTex, vUV).rgb;
  float m = max(max(c.r, c.g), c.b);
  if(m > uKnee && m > 1e-6){
    float h = max(1.0 - uKnee, 1e-4);
    c *= (uKnee + h*(1.0 - exp(-(m - uKnee)/h)))/m;
  }
  o = vec4(c, 1.0);
}`;
const pTone = prog(TONE_VS, TONE_FS);
const UT = { tex: gl.getUniformLocation(pTone,'uTex'), knee: gl.getUniformLocation(pTone,'uKnee') };
const emptyVAO = gl.createVertexArray();
const hdrExt = gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');
let hdrFB = null, hdrTex = null, hdrOK = false;
function makeHDR(){
  if(!hdrExt) return;
  if(hdrTex) gl.deleteTexture(hdrTex);
  if(hdrFB) gl.deleteFramebuffer(hdrFB);
  hdrTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, hdrTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, canvas.width, canvas.height, 0, gl.RGBA, gl.HALF_FLOAT, null);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],
                      [gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])
    gl.texParameteri(gl.TEXTURE_2D, k, v);
  hdrFB = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFB);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, hdrTex, 0);
  hdrOK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
}
// The scene frame is LEFT-handed: the star builders put the direction the Sun orbits
// (l=90°) on +x, galactic north on +y and the Galactic Centre on −z, and that triple has
// determinant −1 — every data set (the AT-HYG sky, the StarHorse cube, the galaxy and M31
// maps, M31's direction and spin) shares it, consistently, so the drawn universe was the
// mirror image of the real one: seen from galactic north it turned counter-clockwise
// where the Galaxy turns clockwise, and the constellations were flipped. Rather than
// rebuild every file, the projection reflects x once, here; everything drawn through it —
// points, trails, labels — comes out right-handed, and trailing arms stay trailing (a
// reflection flips the spin and the winding together). Only the drag control needs the
// same sign, so a drag still moves the world the way the hand moves.
const SKY_MIRROR = -1;
// the one way a projection is built: frame() rebuilds it every frame for its near plane
function skyProjection(near, far){ const m = perspective(Math.PI/3, W/H, near, far); m[0] *= SKY_MIRROR; return m; }
function resize(){
  DPR=Math.min(dprCap, devicePixelRatio||1);
  W=innerWidth; H=innerHeight;
  canvas.width=W*DPR; canvas.height=H*DPR;
  gl.viewport(0,0,canvas.width,canvas.height);
  projMat = skyProjection(0.5, 20000);
  makeHDR();
}
addEventListener('resize', ()=>{ resize(); fitPanels(); }); resize();

// Android in particular keeps a backgrounded tab's timers running, silently burning
// battery and data. The Page Visibility API is the one signal every platform reports
// reliably for this — unlike blur/focus, which also fire for things like opening a
// <select> or a devtools panel, so those are deliberately not used here.
// What is recorded is the INTENT, never what the element happened to be doing: a
// backgrounded tab has its <audio> paused and its AudioContext suspended by the browser
// itself, often before this handler runs, so `!player.paused` read false and the music
// was never given back. `musicOn` and `paused` are the piece's own state and say what
// the visitor asked for. Only what was running is restored — someone who paused by hand
// before switching away comes back to a paused scene.
let hiddenState = null;
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){
    if(hiddenState) return;             // some browsers fire it more than once
    hiddenState = { sim: !paused, music: musicOn && !!player.src, audio: !!audio };
    if(hiddenState.sim) $('tPause').click();
    if(hiddenState.music) player.pause();   // harmless if the browser got there first
    if(audio && audio.ctx.state === 'running') audio.ctx.suspend().catch(()=>{});
  } else {
    const was = hiddenState; hiddenState = null;
    if(!was) return;
    if(was.sim && paused) $('tPause').click();
    if(was.audio && audio && audio.ctx.state === 'suspended') audio.ctx.resume().catch(()=>{});
    // play() can be refused after a long background; armUnlock retries on the next touch
    if(was.music && musicOn && player.paused) player.play().catch(()=>armUnlock());
  }
});

// ---------- main loop ----------
gl.disable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE);
gl.clearColor(0.010,0.015,0.040,1);

let simT=0, nextSample=DT_SAMPLE, last=performance.now();
let showFps=false, fpsFrames=0, fpsSince=performance.now();
let hudHz=8, lastHud=0;
// The status bar is sized by its numbers, and they change length — "2,026 AD" one moment,
// "12,345,678 AD" the next — so it used to twitch in width. Growing applies at once (a
// floor never blocks widening); shrinking waits: the bar keeps its wider width until it
// has been narrower for a full second. Measured with the floor lifted, which forces one
// layout at the HUD rate and paints nothing in between.
let barHeld = 0, barNarrowSince = 0;
function holdBarWidth(now){
  const bar = $('gamebar');
  bar.style.minWidth = '';
  const w = bar.getBoundingClientRect().width;
  if(w >= barHeld){ barHeld = w; barNarrowSince = 0; }
  else {
    if(!barNarrowSince) barNarrowSince = now;
    if(now - barNarrowSince >= 1000){ barHeld = w; barNarrowSince = 0; }
  }
  bar.style.minWidth = barHeld + 'px';
}
const smoothTarget=[0,0,0]; let firstFrame=true;
// Following is exact; only transitions ease. The offset decays toward zero and never
// re-grows from the target's own motion — easing the position itself made the camera
// trail a moving Sun by up to 20% of the view, so at dive zoom the Sun slid across the
// frame every time a touch held the clock and the lag collapsed.
const smoothOfs=[0,0,0]; let reseedFollow=false;
const org=new Float64Array(3); // rendering origin: the Sun, in double precision
const sunSizeTmp=new Float32Array(1), eatSizeTmp=new Float32Array(1);
let lastAgeSeen = AGE0;   // to tell the clock running across an engulfment from a jump past it
let pnShown = false;      // the nebula is on screen this frame: the label follows it
// Once the Sun's true disc spans more than a few pixels, the point sprite hands over to
// a procedural star: limb-darkened granulation that churns, prominence arcs that rise
// and fall with a slow magnetic-storm cycle, and a streaked corona. All of it is noise
// shaped in the fragment shader — no texture, and nothing about its SIZE is stylised:
// the disc is the Sun's real diameter at the real distance.
const SUN_VS = `#version 300 es
uniform mat4 uProj,uView; uniform float uSz;
void main(){ gl_Position=uProj*uView*vec4(0.,0.,0.,1.); gl_PointSize=uSz; }`;
const SUN_FS = `#version 300 es
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
}`;
const pSunP = prog(SUN_VS, SUN_FS);
const USn = {
  proj: gl.getUniformLocation(pSunP,'uProj'), view: gl.getUniformLocation(pSunP,'uView'),
  time: gl.getUniformLocation(pSunP,'uTime'), sz: gl.getUniformLocation(pSunP,'uSz'),
  disc: gl.getUniformLocation(pSunP,'uDisc'),
  colD: gl.getUniformLocation(pSunP,'uColD'), colB: gl.getUniformLocation(pSunP,'uColB'),
};
// ---------- what is left of the Sun ----------
// The shed envelope, on the same one-point vertex shader as the disc: a limb-brightened
// shell — a hollow sphere is brightest where the line of sight runs longest through it,
// which is the rim — in the colours every planetary nebula actually shows, [O III] teal
// inside and Hα red at the edge, with filaments and a mild two-lobed tilt, since a round
// one is the exception. Additive, drawn under the central star.
const PN_FS = `#version 300 es
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
}`;
const pPN = prog(SUN_VS, PN_FS);
const UPN = {
  proj: gl.getUniformLocation(pPN,'uProj'), view: gl.getUniformLocation(pPN,'uView'),
  sz: gl.getUniformLocation(pPN,'uSz'), time: gl.getUniformLocation(pPN,'uTime'),
  age: gl.getUniformLocation(pPN,'uAge'), alpha: gl.getUniformLocation(pPN,'uAlpha'), burst: gl.getUniformLocation(pPN,'uBurst'),
};
// the engulfment flares: up to three points, drawn over the disc
const eatGL = dynVAO(4);
const eatPos = new Float32Array(12), eatSize = new Float32Array(4), eatCol = new Float32Array(12), eatW = new Float32Array(4);
const vaoSunPt = (()=>{ const v=gl.createVertexArray(); gl.bindVertexArray(v);
  const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(3),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return v; })();
let plasmaSunPx = 0;

// ---------- the first-launch performance probe ----------
// A first visit has no saved quality. Two frames in — the programs compiled, the first
// scenario's camera set — the galaxy's own star pass is drawn into a hidden framebuffer
// of the canvas's size, over and over for about thirty milliseconds, and gl.finish()
// plus a one-pixel read make the GPU account for all of it. The time one pass takes,
// on the lowest tier's ~95,000 points, sets the quality row (lowest, low or medium —
// never more: medium is already two million points and the heavier tiers are a
// choice, not a default) and caps the pixel ratio at 1 when even that pass is slow.
let probeFrames = 0, probeInfo = null;
function perfProbe(){
  const fb = gl.createFramebuffer(), tex = gl.createTexture(), pw = canvas.width, ph = canvas.height;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pw, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const px = new Uint8Array(4), sync = ()=>{ gl.finish(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); };
  let ms = -1, passes = 0;
  try{
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo');
    gl.viewport(0, 0, pw, ph); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(pPt); gl.bindVertexArray(vaoGxy);        // the uniforms as the last frame left them
    gl.drawArrays(gl.POINTS, 0, N_GXY); sync();             // warm-up: not timed
    const t0 = performance.now();
    do{ gl.drawArrays(gl.POINTS, 0, N_GXY); passes++; sync(); }
    while(performance.now() - t0 < 30 && passes < 40);
    ms = (performance.now() - t0)/passes;
  }catch(e){ ms = -1; }
  gl.bindVertexArray(null); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fb); gl.deleteTexture(tex);
  gl.viewport(0, 0, canvas.width, canvas.height);
  return { ms, passes, points: N_GXY, px: pw + '×' + ph };
}
// one pass at density D costs about ms·D/2 (denser tiers draw smaller points); with the
// rest of the frame the budget is eleven milliseconds, which keeps sixty frames a second
const pickDetail = ms => ms < 0 ? 1 : ms*20*0.5 + 3 <= 11 ? 2 : ms*5*0.5 + 3 <= 11 ? 1 : 0;
function runFirstLaunchProbe(){
  const r = perfProbe();
  r.msLow = r.ms < 0 ? -1 : r.ms * 95000 / Math.max(1, r.points);   // per pass of the lowest tier's points, whatever tier was drawn
  const d = pickDetail(r.msLow);
  if(r.msLow > 8){ dprCap = 1; resize(); }                  // a slow fill: fewer pixels first
  r.detail = DETAIL_NAMES[d]; r.dpr = DPR; probeInfo = r;
  $('detail').value = d; $('detail').dispatchEvent(new Event('input'));
  saveSettingsNow();                                         // at once: a tab closed inside the debounce would probe again
  try{ $('buildStamp').textContent += ' · probe ' + (r.ms < 0 ? 'failed' : r.msLow.toFixed(1) + ' ms/pass') + ' → ' + r.detail + (dprCap < 2 ? ', 1× pixels' : ''); }catch(e){}
}

function frame(now){
  const dt = Math.min(0.05,(now-last)/1000); last=now;
  shimT += dt; // variables keep twinkling even while the simulation is paused
  const drive = shuttle !== 0 ? shuttle/100 : (paused ? 0 : 1);   // the shuttle outranks pause
  const sign = Math.sign(drive);
  if(sign !== shuttleLastSign){           // a change of direction: the swept path is recomputed
    shuttleLastSign = sign;               // for this moment, not extended from a stale end
    if(sign !== 0){ refillTrails(); nextSample = simT + DT_SAMPLE; }
  }
  let n=0;                                // trail samples taken this frame; read below
  if(drive !== 0 && !holding){
    simT += dt*speed*speedMult*drive;
    // the clock in years a second decides whether the globe still has days (see uAvg)
    { const yps = speed*speedMult*Math.abs(drive); const want = Math.max(0, Math.min(1, (Math.log10(Math.max(1e-9, yps)) + 1.3)));
      avgLight += (want - avgLight)*Math.min(1, dt*4); }
    if(drive < 0){
      // backwards: the trail is the path swept up to now, so it retracts — recomputed
      // from the clock at ~10 Hz rather than every frame (2400 samples a body)
      if(now - trailRefillAt > 100){ trailRefillAt = now; refillTrails(); }
      nextSample = simT + DT_SAMPLE;
    } else {
    while(nextSample<=simT && n<400){
      for(let i=0;i<NB;i++) pushTrail(i,nextSample);
      nextSample+=DT_SAMPLE; n++;
    }
    if(nextSample<=simT) nextSample=simT+DT_SAMPLE; // skip backlog at extreme speeds
    }
    // While zoomed into the system, drift between the Sun and the trail anchor eats the
    // float precision that the anchor exists to protect. Re-anchor once it passes a
    // third of a unit, at most once a second — a rebuild is a few milliseconds.
    if(cam.dist < 0.13 && now - lastAnchor > 1000){
      const dx=org[0]-trailAnchor[0], dy=org[1]-trailAnchor[1], dz=org[2]-trailAnchor[2];
      if(dx*dx+dy*dy+dz*dz > 0.09){ lastAnchor = now; refillTrails(); nextSample = simT + DT_SAMPLE; }
    }
    if(n>0){
      for(let i=0;i<NB;i++){
        gl.bindBuffer(gl.ARRAY_BUFFER,trailBufs[i]);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,trails[i]);
      }
    }
    if(lifeOn) lifeStep(dt, dt*speed*speedMult);
  }

  // body positions, stored relative to the Sun (the rendering origin) — exact in doubles,
  // so a real-scale zoom to sub-AU distances is free of float32 jitter
  bodyPos(0,simT,org);
  for(let i=0;i<NB;i++){
    bodyPos(i,simT,tmp);
    bodyPosArr[i*3]=tmp[0]-org[0]; bodyPosArr[i*3+1]=tmp[1]-org[1]; bodyPosArr[i*3+2]=tmp[2]-org[2];
  }
  if(realMode){ // the Sun's sprite: true diameter once close enough, else a small findable dot
    // realSizes[0] is the Sun's diameter today; the model scales it, so a red giant is
    // drawn at the size the model says it has rather than at a fixed dot
    const sunDia = realSizes[0]*sunState(ageGyr()).R;
    plasmaSunPx = sunDia*((H*DPR)/(2*Math.tan(Math.PI/6)))/camSunDist;   // the camera's distance to the SUN: from Earth it is an AU
    globePx = realSizes[3]*((H*DPR)/(2*Math.tan(Math.PI/6)))/cam.dist;
    // the findable dot stands down once the true disc takes over
    sunSizeTmp[0] = plasmaSunPx > 7 ? 0.0 : Math.max(sunDia, camSunDist*0.0075);
    gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize); gl.bufferSubData(gl.ARRAY_BUFFER,0,sunSizeTmp);
  }
  // The Sun's colour, and the inner planets' fate. Both read the same model.
  const ssNow = sunState(ageGyr()), tint = sunTint(ssNow.T);
  bodyCol[0]=tint.dot[0]; bodyCol[1]=tint.dot[1]; bodyCol[2]=tint.dot[2];
  {
    // Engulfment latches on age, never on the current radius (the Sun shrinks again
    // after the tip; the planet does not come back). A flare starts only when the clock
    // runs across the moment — a jump that lands past it finds the planet already gone.
    const a = ageGyr(), jumped = Math.abs(a - lastAgeSeen) > 0.05;
    for(let i=1;i<=3;i++){
      const now = a >= EAT_AGES[i];
      if(now && !wasEaten[i] && !jumped) eatFlash[i] = 0;
      if(!now) eatFlash[i] = -1;
      wasEaten[i] = now;
      if(eatFlash[i] >= 0){ eatFlash[i] += dt; if(eatFlash[i] > 1.6) eatFlash[i] = -1; }
      // hidden for good once inside; the flare is its own pass over the disc — and Earth's
      // dot stands down while the globe is drawn in its place
      eatSizeTmp[0] = now ? 0 : (i === 3 && globePx > 4) ? 0 : realSizes[i];
      gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize); gl.bufferSubData(gl.ARRAY_BUFFER,i*4,eatSizeTmp);
    }
    lastAgeSeen = a;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyCol); gl.bufferSubData(gl.ARRAY_BUFFER,0,bodyCol,0,3);
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyPos);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,bodyPosArr);

  // camera — the view matrix is built Sun-relative for the same precision reason
  // Earth's world position in doubles: the follow target when the view is hers
  bodyPos(3, simT, earthW);
  const moonHere = followTarget === 'moon' && !wasEaten[3] && ageGyr() > MOON_BORN;
  if(moonHere) moonPos(simT, moonW);                                  // the camera needs her before the draw does
  const followPos = followTarget === 'and' ? andPos
                  : moonHere ? moonW
                  : ((followTarget === 'earth' || followTarget === 'moon') && !wasEaten[3]) ? earthW : org;
  const goal = cam.follow ? [followPos[0],followPos[1],followPos[2]] : [0,0,0];
  if(reseedFollow){ for(let i=0;i<3;i++) smoothOfs[i] = smoothTarget[i]-goal[i]; reseedFollow=false; }
  const k = firstFrame?1:Math.min(1,dt*4);
  for(let i=0;i<3;i++) smoothOfs[i] *= 1-k;
  { // cap the transition offset at 20% of the view distance, so deep zooms never lose the Sun
    const lag=Math.hypot(smoothOfs[0],smoothOfs[1],smoothOfs[2]), maxLag=cam.dist*0.2;
    if(lag>maxLag){ const f=maxLag/lag; smoothOfs[0]*=f; smoothOfs[1]*=f; smoothOfs[2]*=f; }
  }
  for(let i=0;i<3;i++) smoothTarget[i] = goal[i]+smoothOfs[i];
  // log-space zoom smoothing: uniform speed per decade across 11 orders of magnitude
  cam.dist = Math.exp(Math.log(cam.dist)+(Math.log(cam.distGoal)-Math.log(cam.dist))*Math.min(1,dt*4));
  firstFrame=false;
  let baseYaw = 0, basePitch = 0;
  if(coreLock){
    // the direction from the core out to the Sun: put the eye further along it, so the
    // line of sight runs eye -> Sun -> galactic centre
    const r = Math.hypot(org[0], org[1], org[2]) || 1;
    baseYaw = Math.atan2(org[0], org[2]);
    basePitch = Math.asin(Math.max(-1, Math.min(1, org[1]/r)));
  }
  const yawE = cam.yaw + baseYaw;
  const pitchE = Math.max(-1.45, Math.min(1.45, cam.pitch + basePitch));
  const cp=Math.cos(pitchE), sp=Math.sin(pitchE);
  // the pan: a screen-space offset, so it rides the camera's right and up at this distance.
  // Screen right is world right mirrored (SKY_MIRROR), and dragging the scene right means
  // the target goes left, hence the signs. tan(30°)·2 = the view's height over its distance.
  const sy = Math.sin(yawE), cy = Math.cos(yawE);
  let rx = cy, ry = 0, rz = -sy;                                        // right, in the plane
  let ux = -sp*sy, uy = cp, uz = -sp*cy;                                // up, tilted with the pitch
  let dx = cp*sy, dy = sp, dz = cp*cy, upV = [0,1,0];                   // the eye's direction from the target
  const spinOn = spinLock && cam.follow && followTarget === 'earth' && !wasEaten[3];
  if(spinOn){
    // the same three vectors, but in the planet's frame: x → prime meridian P, y → axis A,
    // z → −Q (so the frame keeps the world's handedness); the frame turns with the spin
    const [P, A, Q] = spinFrame();
    rx = cy*P[0]+sy*Q[0]; ry = cy*P[1]+sy*Q[1]; rz = cy*P[2]+sy*Q[2];
    ux = -sp*sy*P[0]+cp*A[0]+sp*cy*Q[0]; uy = -sp*sy*P[1]+cp*A[1]+sp*cy*Q[1]; uz = -sp*sy*P[2]+cp*A[2]+sp*cy*Q[2];
    dx = cp*sy*P[0]+sp*A[0]-cp*cy*Q[0]; dy = cp*sy*P[1]+sp*A[1]-cp*cy*Q[1]; dz = cp*sy*P[2]+sp*A[2]-cp*cy*Q[2];
    upV = A;
  }
  camDirW[0] = dx; camDirW[1] = dy; camDirW[2] = dz;                     // read by the spin lock's switch
  const pv = 1.1547*cam.dist, pdx = -panF[0]*pv*SKY_MIRROR, pdy = panF[1]*pv;
  const tgx=smoothTarget[0]-org[0] + rx*pdx + ux*pdy,
        tgy=smoothTarget[1]-org[1] + ry*pdx + uy*pdy,
        tgz=smoothTarget[2]-org[2] + rz*pdx + uz*pdy;
  const eye=[ tgx+cam.dist*dx, tgy+cam.dist*dy, tgz+cam.dist*dz ];
  camSunDist = Math.hypot(eye[0], eye[1], eye[2]) || cam.dist;   // Sun-relative eye: how far the Sun is
  const viewMat = lookAt(eye, [tgx,tgy,tgz], upV);
  // near plane tracks the zoom so sub-AU views don't clip
  projMat = skyProjection(Math.min(0.5, Math.max(1e-13, cam.dist*0.04)), 25000);   // no depth buffer: a tiny near plane costs nothing, and Earth needs it
  const pxScale = (H*DPR)/(2*Math.tan(Math.PI/6));

  // at 100% nothing is compressed, so the old direct path is kept exactly
  const toneOn = hdrOK && coreKnee < 0.999;
  if(toneOn) gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFB);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // points: stars, galaxy, bodies
  gl.useProgram(pPt);
  gl.uniformMatrix4fv(U.ptProj,false,projMat);
  gl.uniformMatrix4fv(U.ptView,false,viewMat);
  const and = updateAnd();
  const gl710 = g710();   // read by the Oort brightening before the star is drawn
  const deep = realMode && cam.dist<1.0; // inside ~30 ly: keep the backdrop point-like
  // Inside the disk the band's light — haze, HII regions, the core — all lies BEHIND
  // the local dust: that is the Great Rift. So from in here the whole backdrop goes
  // down first and the dust over it; from outside the arms' HII knots sit on top of
  // the lanes and are drawn after (v2.56.1). Same zone as the haze fade's.
  const insideDisk = cam.dist < 45;
  // every disk star travels at the same flat-curve speed as the Sun, and an elliptical
  // does not rotate coherently: the rate dies away as the remnant relaxes. diskSpin()
  // is that rate's integral, so the angle only ever grows (never zero either — uSpin==0.0
  // is the shader's "not a galaxy" gate).
  const spin = diskSpin(simT);
  const warp = -2*Math.PI*simT/650e6; // warp precession: retrograde, ~650 Myr per turn
  const spinMW  = spin;
  const spinM31 = spin*1.07;   // M31's flat curve runs ~7% faster
  const sunX=org[0], sunY=org[1], sunZ=org[2];
  const bubY = realMode ? sunY+1e8 : sunY; // real scale: nothing is magnified, so no clearance bubble
  gl.uniform1f(U.ptPx,pxScale);
  gl.uniform1f(U.ptWA, 0.0);
  gl.uniform1f(U.ptTime, shimT);
  gl.uniform3f(U.ptAnd, andPos[0], andPos[1], andPos[2]);
  gl.uniform1f(U.ptTide, and.tide);
  gl.uniform1f(U.ptVM, varOn?1.0:0.0);
  gl.uniform1f(U.ptCap, deep?26.0:110.0);
  gl.uniform1f(U.ptWarpAmp, 1.0);
  gl.uniform1f(U.ptMinB, minBright);
  gl.uniform1f(U.ptMinSz, minSprite);
  gl.uniform3f(U.ptOrg, org[0],org[1],org[2]);
  gl.uniform1f(U.ptSpin, 0.0);
  gl.uniform1f(U.velT, 0.0);
  // The nebula buffers run HII pink, then the diffuse haze, then the core. The haze is
  // laid down first and the dark clouds darken it — that is all a dust lane is, less
  // haze — and then the stars, the HII and the core are drawn over both, so a cloud
  // sits within the star field. Drawn after everything, as they used to be, the clouds
  // multiplied the stars and the core down to black discs on top of the picture.
  const nebulaPass = (haze, which = 'both') => {   // which: 'mw' | 'and' | 'both'
    gl.useProgram(pNeb);
  gl.useProgram(pNeb);
  gl.uniformMatrix4fv(UN.proj,false,projMat);
  gl.uniformMatrix4fv(UN.view,false,viewMat);
  gl.uniform1f(UN.px,pxScale);
  // The haze must dim as the camera closes in, whatever the mode: nearby sprites
  // project enormous and stack into a whiteout. From inside the system the Milky Way
  // stays visible as a band — a quarter strength — rather than vanishing outright.
  gl.uniform1f(UN.gf, Math.min(1, Math.max(0.25, cam.dist/45)));
  gl.uniform1f(UN.time, shimT);
  gl.uniform1f(UN.vm, varOn?2.0:0.0);
  gl.uniform1f(UN.wa, 1.0); // HII regions trace the wave
  gl.uniform1f(UN.cap, deep?60.0:560.0);
  gl.uniform1f(UN.minSz, 1.3);
  gl.uniform3f(UN.and, andPos[0], andPos[1], andPos[2]); gl.uniform1f(UN.tide, and.tide);
  gl.uniform1f(UN.warpAmp, 1.0);
  gl.uniform3f(UN.org, org[0],org[1],org[2]);
  gl.uniform1f(UN.spin, spinMW);
  gl.uniform1f(UN.warp, warp);
  gl.uniform3f(UN.sun, sunX, bubY, sunZ);
  gl.uniform1f(UN.gal, 1.0);
  gl.uniform1f(UN.merge, and.merge);
    const seg = (pink, glow, n) => {
      if(haze){ if(glow) gl.drawArrays(gl.POINTS, pink, glow); }
      else { if(pink) gl.drawArrays(gl.POINTS, 0, pink);
             if(n - pink - glow > 0) gl.drawArrays(gl.POINTS, pink + glow, n - pink - glow); }
    };
    if(which !== 'and'){ gl.bindVertexArray(vaoNeb); seg(NEB_PINK, NEB_GLOW, NEB_N); }
    if(vaoAndNeb && which !== 'mw'){
    gl.uniformMatrix3fv(UN.grot, false, M31_ROT);
    gl.uniform3f(UN.goff, andPos[0], andPos[1], andPos[2]);
    gl.uniform1f(UN.spin, spinM31);
    gl.uniform1f(UN.warpAmp, 0.35);
    gl.uniform3f(UN.and, 0, 0, 0);
    gl.uniform3f(UN.sun, sunX, sunY+1e8, sunZ);
      gl.bindVertexArray(vaoAndNeb); seg(AND_PINK, AND_GLOW, N_ANDN);
    gl.uniformMatrix3fv(UN.grot, false, MAT3_ID);
    gl.uniform3f(UN.goff, 0, 0, 0);
    gl.uniform1f(UN.spin, spinMW);
    gl.uniform1f(UN.warpAmp, 1.0);
    gl.uniform3f(UN.and, andPos[0], andPos[1], andPos[2]);
    gl.uniform3f(UN.sun, sunX, bubY, sunZ);
    }
    gl.uniform1f(UN.gal, 0.0);
  };
  const dustPass = (which = 'both') => {
  // multiply what is behind them — by now only the haze — down toward black
  if(dustOn){
    // dust lanes: multiply what's behind them down, blue first (see DUST_FS)
    gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
    gl.useProgram(pDust);
    gl.uniformMatrix4fv(UD.proj,false,projMat);
    gl.uniformMatrix4fv(UD.view,false,viewMat);
    gl.uniform1f(UD.px,pxScale);
    gl.uniform1f(UD.wa, 1.0); // dust lanes trace the wave
    // The ceiling is in device pixels, so on a narrow canvas one disc covers far more
    // sky and the multiply compounds faster than the additive haze — the band went black
    // on a 400 px phone at the desktop's 40. Scaled by canvas width, 900 being the width
    // it was judged at. Between the dive and the wider views the eye is still in the
    // disk with the backdrop beneath the dust, so the ceiling stays moderate there too.
    gl.uniform1f(UD.cap, deep ? DUST_DEEP_CAP * Math.min(1.5, Math.max(0.45, canvas.width/900))
                        : insideDisk ? 200.0 : 560.0);
    gl.uniform1f(UD.minSz, 1.3);
    gl.uniform3f(UD.and, andPos[0], andPos[1], andPos[2]); gl.uniform1f(UD.tide, and.tide);
    gl.uniform1f(UD.warpAmp, 1.0);
    gl.uniform3f(UD.org, org[0],org[1],org[2]);
    gl.uniform1f(UD.spin, spinMW);
    gl.uniform1f(UD.warp, warp);
    gl.uniform3f(UD.sun, sunX, bubY, sunZ);
    gl.uniform1f(UD.gal, 1.0);
    gl.uniform1f(UD.merge, and.merge);
    if(which !== 'and'){ gl.bindVertexArray(vaoDust); gl.drawArrays(gl.POINTS,0,DUST_N); }
    if(vaoAndDust && which !== 'mw'){
      gl.uniformMatrix3fv(UD.grot, false, M31_ROT);
      gl.uniform3f(UD.goff, andPos[0], andPos[1], andPos[2]);
      gl.uniform1f(UD.spin, spinM31);
      gl.uniform1f(UD.warpAmp, 0.35);
      gl.uniform3f(UD.and, 0, 0, 0);
      gl.uniform3f(UD.sun, sunX, sunY+1e8, sunZ);
      gl.bindVertexArray(vaoAndDust); gl.drawArrays(gl.POINTS,0,N_ANDD);
      gl.uniformMatrix3fv(UD.grot, false, MAT3_ID);
      gl.uniform3f(UD.goff, 0, 0, 0);
      gl.uniform1f(UD.spin, spinMW);
      gl.uniform1f(UD.warpAmp, 1.0);
      gl.uniform3f(UD.and, andPos[0], andPos[1], andPos[2]);
      gl.uniform3f(UD.sun, sunX, bubY, sunZ);
    }
    gl.uniform1f(UD.gal, 0.0);
    gl.blendFunc(gl.ONE, gl.ONE);
  }
  };
  // Multiply blending knows nothing of depth: a cloud of the galaxy BEHIND would darken
  // the one in front. So the farther galaxy goes down whole — haze, then its dust — and
  // the nearer one over it; a galaxy's clouds can only ever thin its own light. The
  // eye is Sun-relative here, like everything drawn.
  const dMW  = Math.hypot(eye[0] + org[0], eye[1] + org[1], eye[2] + org[2]);
  const dAnd = Math.hypot(eye[0] - (andPos[0] - org[0]), eye[1] - (andPos[1] - org[1]), eye[2] - (andPos[2] - org[2]));
  for(const g of (dAnd > dMW ? ['and', 'mw'] : ['mw', 'and'])){ nebulaPass(true, g); if(insideDisk) nebulaPass(false, g); dustPass(g); }
  gl.useProgram(pPt);   // back to the points; their uniforms persist on the program
  gl.bindVertexArray(vaoStars); gl.drawArrays(gl.POINTS,0,N_STAR);
  // Real stars, carried along with the Sun. They are stored at the galaxy's scale — a
  // 108-unit bubble against a 900-unit galactic radius, which is the true proportion —
  // but the compressed view magnifies the solar system some ten million fold on top of
  // that, so zoomed in there every real star falls inside the planets: Alpha Centauri
  // lands at 0.14 units against Mercury's drawn orbit of 6. There is no scale that suits
  // both at once, so they fade out as the magnified solar system takes over the view and
  // return once it is small enough for the proportion to read. Real scale keeps them
  // throughout, where nothing is magnified and they are simply correct.
  const gaiaFade = realMode ? 0 : 1 - Math.min(1, Math.max(0, (cam.dist - 210)/280));
  if(gaiaOn && vaoGaia && gaiaFade < 0.999){
    gl.uniform1f(U.ptFade, gaiaFade);
    gl.uniform3f(U.ptOrg, 0,0,0);
    // Real Gaia DR3 space velocities: each star drifts along its measured track. A
    // straight line is only honest for so long, so the extrapolation stops at +-20 Myr —
    // beyond that the local sky simply holds its furthest computed shape.
    gl.uniform1f(U.velT, Math.max(-2e7, Math.min(2e7, simT)) * 1.1119e-7);
    // The bubble rides the Sun's orbital frame. Its coordinates are Sun-relative, so the
    // wave-rotation path — a rigid turn about the origin — turns it about the Sun by the
    // Sun's own orbital angle: the side that faces the galactic centre keeps facing it
    // (over 20 Myr the Sun turns through 32 degrees, which is anything but negligible).
    gl.uniform1f(U.ptWA, 1.0);
    gl.uniform1f(U.ptSpin, (simT*V_GAL/900) * 640);
    gl.bindVertexArray(vaoGaia); gl.drawArrays(gl.POINTS,0,N_GAIA);
    if(vaoGaiaDeep && curD >= 5){ gl.bindVertexArray(vaoGaiaDeep); gl.drawArrays(gl.POINTS,0,N_GAIA_DEEP); }
    gl.uniform1f(U.velT, 0.0);
    gl.uniform1f(U.ptWA, 0.0);
    gl.uniform1f(U.ptSpin, 0.0);
    gl.uniform3f(U.ptOrg, org[0],org[1],org[2]);
    gl.uniform1f(U.ptFade, 0.0);
  }
  gl.uniform1f(U.ptSpin, spinMW);
  gl.uniform1f(U.ptWarp, warp);
  gl.uniform3f(U.ptSun, sunX, bubY, sunZ);
  gl.uniform1f(U.ptGal, 1.0);
  gl.uniform1f(U.ptMerge, and.merge);
  gl.bindVertexArray(vaoGxy);
  if(insideDisk && hideNucleus && NUC1 > NUC0){   // the centre's own stars stay behind the dust
    if(NUC0 > 0) gl.drawArrays(gl.POINTS, 0, NUC0);
    if(N_GXY > NUC1) gl.drawArrays(gl.POINTS, NUC1, N_GXY - NUC1);
  } else gl.drawArrays(gl.POINTS,0,N_GXY);

  // Andromeda: generated flat in its own disk frame; uGRot turns it to its measured
  // orientation — the two disks stand 120° apart, nowhere near parallel — and uGOff
  // carries it along its orbit. It spins its real way, ~7% faster than we do, and its
  // tide pulls toward the Milky Way: the bridge is mutual, both disks reaching.
  if(vaoAnd){
    gl.uniformMatrix3fv(U.ptGRot, false, M31_ROT);
    gl.uniform3f(U.ptGOff, andPos[0], andPos[1], andPos[2]);
    gl.uniform1f(U.ptSpin, spinM31);
    gl.uniform1f(U.ptWarpAmp, 0.35);
    gl.uniform3f(U.ptSun, sunX, sunY+1e8, sunZ);   // no clearance bubble in its frame
    gl.uniform3f(U.ptAnd, 0, 0, 0);
    gl.uniform1f(U.ptVM, 0.0);
    gl.bindVertexArray(vaoAnd); gl.drawArrays(gl.POINTS,0,N_AND);
    gl.uniformMatrix3fv(U.ptGRot, false, MAT3_ID);
    gl.uniform3f(U.ptGOff, 0, 0, 0);
    gl.uniform3f(U.ptSun, sunX, bubY, sunZ);
    gl.uniform3f(U.ptAnd, andPos[0], andPos[1], andPos[2]);
    gl.uniform1f(U.ptWarpAmp, 1.0);
    gl.uniform1f(U.ptSpin, spinMW);
    gl.uniform1f(U.ptVM, varOn?1.0:0.0);
  }
  gl.uniform1f(U.ptGal, 0.0);

  // life-cycle events (OB clusters, supergiants, supernova flashes, remnant cores)
  if(lifeOn && events.length){
    fillEvents();
    gl.uniform1f(U.ptVM, 0.0); // events animate themselves
    gl.uniform1f(U.ptTide, 0.0);
    gl.uniform1f(U.ptMinB, 0.0);
    gl.uniform1f(U.ptMinSz, 1.3);   // events keep their own scale
    gl.uniform1f(U.ptCap, deep?36.0:110.0); // a supernova blooms, within reason
    if(evN){
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,evPos.subarray(0,evN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,evSize.subarray(0,evN));
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,evCol.subarray(0,evN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,evWave.subarray(0,evN));
      gl.bindVertexArray(evGL.vao); gl.drawArrays(gl.POINTS,0,evN);
    }
    // the blasts, in their own pass, on top of everything the flash lights up
    if(snN){
      gl.useProgram(pSN);
      gl.uniformMatrix4fv(USN.proj,false,projMat);
      gl.uniformMatrix4fv(USN.view,false,viewMat);
      gl.uniform1f(USN.px, pxScale);
      gl.uniform1f(USN.spin, spinMW);
      gl.uniform1f(USN.warp, warp);
      gl.uniform1f(USN.cap, deep?36.0:110.0);
      gl.uniform3f(USN.sun, sunX, bubY, sunZ);
      gl.uniform3f(USN.org, org[0], org[1], org[2]);
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,snPos.subarray(0,snN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,snSize.subarray(0,snN));
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,snCol.subarray(0,snN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,snPh.subarray(0,snN));
      gl.bindVertexArray(snGL.vao); gl.drawArrays(gl.POINTS,0,snN);
      gl.useProgram(pPt);   // the restores below belong to the point program
    }
    gl.uniform1f(U.ptMinB, minBright);
    gl.uniform1f(U.ptMinSz, minSprite);
    gl.uniform1f(U.ptTide, and.tide);
    gl.uniform1f(U.ptVM, varOn?1.0:0.0);
    gl.uniform1f(U.ptCap, deep?26.0:110.0);
  }


  if(!insideDisk) nebulaPass(false);   // the HII regions and the core, over the stars
  // expanding shells: supernova remnants and planetary nebulae, on their own program
  // (sizes exaggerated — see info). After the dust on purpose: a remnant next door is
  // not something the backdrop's lanes should darken.
  if(lifeOn && puffs.length){
    fillPuffs();
    gl.useProgram(pRem);
    gl.uniformMatrix4fv(UREM.proj,false,projMat);
    gl.uniformMatrix4fv(UREM.view,false,viewMat);
    gl.uniform1f(UREM.px, pxScale);
    gl.uniform1f(UREM.spin, spinMW);
    gl.uniform1f(UREM.warp, warp);
    gl.uniform1f(UREM.cap, deep?60.0:560.0);
    gl.uniform3f(UREM.sun, sunX, bubY, sunZ);
    gl.uniform3f(UREM.org, org[0], org[1], org[2]);
    gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfPos.subarray(0,puffs.length*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfSize.subarray(0,puffs.length));
    gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfCol.subarray(0,puffs.length*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfWave.subarray(0,puffs.length));
    gl.bindVertexArray(pfGL.vao); gl.drawArrays(gl.POINTS,0,puffs.length);
  }

  // trails
  // Trail buffers hold absolute positions, and at the Sun's radius a float32 step is
  // 6.1e-5 scene units — a quarter pixel around cam.dist 0.17. Fade across that
  // boundary rather than cutting, so leaving real scale doesn't drop them abruptly.
  // Planets are drawable only while their points stand apart from the Sun's: Neptune's
  // orbit spans about six pixels at 0.13 units of camera distance, and beyond that the
  // whole system is inside one point — only the Sun's own trail means anything there.
  const solarClose = cam.dist < 0.13;
  if(showTrails && trailPct > 0){
    gl.useProgram(pTr);
    gl.uniformMatrix4fv(U.trProj,false,projMat);
    gl.uniformMatrix4fv(U.trView,false,viewMat);
    gl.uniform1f(U.trLen,TRAIL_N);
    const last = (showP9 ? NB : I_P9)-1;
    // the origin for anchored buffers, subtracted in double precision
    const aox = org[0]-trailAnchor[0], aoy = org[1]-trailAnchor[1], aoz = org[2]-trailAnchor[2];
    gl.uniform3f(U.trOrg, aox, aoy, aoz);
    for(let i=last;i>=0;i--){
      const c=BODIES[i][4];
      if(i === I_P9 && !showP9) continue;
      if(i >= N_PLANETS && i < I_P9 && !showDwarfs) continue;
      if(i <= 3 && i > 0 && wasEaten[i]) continue;   // no path for a planet that is gone
      if(globePx > 40) continue;   // zoomed onto the globe, every orbit and helix is a line across the sky
      if(i > 0){
        if(!solarClose) continue;                    // collapsed into the Sun's point
        const spo = BODIES[i][1]/DT_SAMPLE;
        // the ring draws when asked for, or as the fallback for an unresolvable helix
        if(psO || (psH && spo < 12)){
          // the closed path itself — also the honest fallback when the sampling
          // cannot resolve the orbit and no accurate helix is drawable
          gl.uniform3f(U.trOrg, 0,0,0);
          gl.uniform3f(U.trCol, c[0],c[1],c[2]);
          gl.uniform1f(U.trA, 0.4*orbitAlpha*(1+starGain*0.9));
          gl.uniform1f(U.trFlat, 1.0);
          gl.bindVertexArray(ringVaos[i]);
          gl.drawArrays(gl.LINE_LOOP, 0, RING_N);
          gl.uniform1f(U.trFlat, 0.0);
          gl.uniform3f(U.trOrg, aox, aoy, aoz);
        }
        if(!psH || spo < 12) continue;
        // the accurate helix: the swept absolute path, no styling — Mercury winds
        // tightly, the giants barely wave, because that is how it actually is
        gl.uniform3f(U.trCol, c[0],c[1],c[2]);
        gl.uniform1f(U.trA, 0.55*trailAlpha*(1+starGain*0.9));
        gl.bindVertexArray(trailVaos[i]);
        gl.drawArrays(gl.LINE_STRIP, TRAIL_N-Math.min(TRAIL_N, Math.round(200*spo)), Math.min(TRAIL_N, Math.round(200*spo)));
        continue;
      }
      if(!psH) continue;   // the Sun's arc is a swept trail: it follows the helix switch
      gl.uniform3f(U.trCol,c[0],c[1],c[2]);
      // lift with the star gain, or a brightened field washes the thin line out
      gl.uniform1f(U.trA, 0.9*trailAlpha*(1+starGain*0.9));
      gl.bindVertexArray(trailVaos[i]);
      gl.drawArrays(gl.LINE_STRIP, 0, TRAIL_N);
    }
  }

  // asteroid belt, Kuiper belt & Oort cloud, riding along with the Sun.
  // Each fades out while its ring is too small on screen to resolve — otherwise its
  // points would pile up additively into a false bright blob on the Sun's pixel.
  const beltFade = rw => Math.max(0, Math.min(1, (rw/cam.dist*pxScale - 24)/50));
  const abA = beltFade(realMode ? 2.7*AU2U : 16.6);
  const kbA = beltFade(realMode ? 45*AU2U : 45);
  const ooA = beltFade(realMode ? 130*OO_REAL : 130);
  if(showBelt && abA>0){
    gl.useProgram(pAB);
    gl.uniformMatrix4fv(UA.uProj,false,projMat);
    gl.uniformMatrix4fv(UA.uView,false,viewMat);
    // simT in float32 quantises the phase after ~1e5 years and the ring collapses
    // into spokes; wrapped time (exact in f64, small in f32) keeps every phase clean.
    // Anonymous specks reshuffling once per 65,536 years is invisible in a uniform ring.
    gl.uniform1f(UA.uPx,pxScale); gl.uniform1f(UA.uT, simT % 65536);
    gl.uniform1f(UA.uS, realMode?AU2U:1.0);
    gl.uniform3f(UA.uSun,0,0,0);
    gl.uniform3f(UA.uE1,E1[0],E1[1],E1[2]);
    gl.uniform3f(UA.uE2,E2[0],E2[1],E2[2]);
    gl.uniform3f(UA.uEN,EN[0],EN[1],EN[2]);
    gl.uniform3f(UA.uColor,0.15,0.13,0.11); gl.uniform1f(UA.uAlpha,abA);
    gl.bindVertexArray(realMode?vaoABr:vaoABd); gl.drawArrays(gl.POINTS,0,AB_N);
  }
  if(showKuiper && kbA>0){
    gl.useProgram(pKB);
    gl.uniformMatrix4fv(UK.uProj,false,projMat);
    gl.uniformMatrix4fv(UK.uView,false,viewMat);
    gl.uniform1f(UK.uPx,pxScale); gl.uniform1f(UK.uT, simT % 65536);
    gl.uniform1f(UK.uS, realMode?AU2U:1.0); // real mode: the belt radii are AU
    gl.uniform3f(UK.uSun,0,0,0);
    gl.uniform3f(UK.uE1,E1[0],E1[1],E1[2]);
    gl.uniform3f(UK.uE2,E2[0],E2[1],E2[2]);
    gl.uniform3f(UK.uEN,EN[0],EN[1],EN[2]);
    gl.uniform3f(UK.uColor,0.10,0.11,0.14); gl.uniform1f(UK.uAlpha,kbA);
    gl.bindVertexArray(vaoKB); gl.drawArrays(gl.POINTS,0,KB_N);
  }
  if(showOort){ // rings always (they locate the shell); points fade via ooA
    gl.useProgram(pOO);
    gl.uniformMatrix4fv(UO.uProj,false,projMat);
    gl.uniformMatrix4fv(UO.uView,false,viewMat);
    gl.uniform1f(UO.uPx,pxScale);
    gl.uniform1f(UO.uS, realMode?OO_REAL:1.0);
    gl.uniform3f(UO.uSun,0,0,0);
    // a passing star stirs the cloud: brighten it while Gliese 710 is inside
    const stir = Math.min(1, Math.max(0, (1.9-gl710.d)/1.9));
    gl.uniform3f(UO.uColor, 0.11+0.30*stir, 0.12+0.20*stir, 0.15+0.10*stir);
    gl.uniform1f(UO.uAlpha,ooA);
    gl.bindVertexArray(vaoOO); gl.drawArrays(gl.POINTS,0,OO_N);
    // boundary: wireframe-sphere hint of the shell
    gl.useProgram(pRing);
    gl.uniformMatrix4fv(UR.uProj,false,projMat);
    gl.uniformMatrix4fv(UR.uView,false,viewMat);
    gl.uniform3f(UR.uSun,0,0,0);
    gl.uniform1f(UR.uR, realMode?178.0*OO_REAL:178.0);
    gl.uniform3f(UR.uColor,0.10,0.13,0.19);
    gl.bindVertexArray(vaoRing);
    if(globePx <= 40) for(const [A,B] of [[E1,E2],[E1,EN],[E2,EN]]){   // from a globe's zoom the shell is lines across the sky
      gl.uniform3f(UR.uA,A[0],A[1],A[2]);
      gl.uniform3f(UR.uB,B[0],B[1],B[2]);
      gl.drawArrays(gl.LINE_LOOP,0,RING_SEGS);
    }
  }

  gl.useProgram(pPt);
  gl.uniform1f(U.ptSpin, 0.0); // body positions already include their motion
  gl.uniform1f(U.ptVM, 0.0);
  gl.uniform1f(U.ptMinB, 0.0);   // the planets are not part of the star field
  gl.uniform1f(U.ptMinSz, 1.3);
  gl.uniform1f(U.ptCap, 110.0);
  gl.uniform3f(U.ptOrg, 0,0,0); // bodies are uploaded Sun-relative already
  gl.bindVertexArray(vaoBodies);
  gl.drawArrays(gl.POINTS, 0, showDwarfs ? I_P9 : N_PLANETS);
  if(showP9) gl.drawArrays(gl.POINTS, I_P9, 1);

  // Earth as a globe, and the Moon, once they are more than a dot. Opaque discs, so the
  // same blend as the Sun's disc; the atmosphere adds over what is behind it.
  moonPx = 0;
  // the pass opens on Earth's size, or on the Moon's when she is the one being followed
  if((globePx > 4 || followTarget === 'moon') && !wasEaten[3]){
    const a = ageGyr(), era = earthEra(a, environment().mean);
    const ex = bodyPosArr[9], ey = bodyPosArr[10], ez = bodyPosArr[11];
    const sunV = norm3(vecV(viewMat, [-ex, -ey, -ez]));
    const axV = norm3(vecV(viewMat, EARTH_AXIS));
    const prime = earthPrime(simT, tmp); const prV = norm3(vecV(viewMat, [prime[0],prime[1],prime[2]]));
    earthDbg = { sunV, axV, prV, era };   // read by the debug tooling
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(pGlobe);
    gl.uniformMatrix4fv(UG.uProj,false,projMat); gl.uniformMatrix4fv(UG.uView,false,viewMat);
    gl.uniform1f(UG.uMirror, SKY_MIRROR); gl.uniform1f(UG.uTime, shimT);
    gl.uniform3f(UG.uSunV, sunV[0],sunV[1],sunV[2]); gl.uniform3f(UG.uAxisV, axV[0],axV[1],axV[2]); gl.uniform3f(UG.uPrimeV, prV[0],prV[1],prV[2]);
    gl.uniform1f(UG.uAvg, avgLight);
    gl.uniform1f(UG.uMolten, era.molten); gl.uniform1f(UG.uOcean, era.ocean); gl.uniform1f(UG.uSea, era.sea); gl.uniform1f(UG.uHaze, era.haze);
    gl.uniform1f(UG.uVeg, era.veg); gl.uniform1f(UG.uIceLat, era.iceLat); gl.uniform1f(UG.uCloud, era.cloud); gl.uniform1f(UG.uLights, era.lights); gl.uniform1f(UG.uDrift, era.drift);
    gl.uniform1f(UG.uDry, era.dry); gl.uniform1f(UG.uSeaLevel, era.seaLevel);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, earthTex); gl.uniform1i(UG.uMap, 0);
    gl.uniform1f(UG.uHasMap, earthTex ? 1.0 : 0.0);
    fillPlateMats((a - AGE0)*1000); gl.uniformMatrix3fv(UG.uPlate, false, plateMats);
    const disc = 1/1.09, sz = Math.min(2400, globePx/disc);
    gl.uniform1f(UG.uMoon, 0.0); gl.uniform1f(UG.uDisc, disc); gl.uniform1f(UG.uSz, sz);
    gl.uniform3f(UG.uPos, ex, ey, ez);
    gl.bindVertexArray(vaoGlobe); gl.drawArrays(gl.POINTS, 0, 1);
    if(a > MOON_BORN){
      moonPos(simT, moonW);
      moonRel[0] = moonW[0]-org[0]; moonRel[1] = moonW[1]-org[1]; moonRel[2] = moonW[2]-org[2];
      moonPx = MOON_DIA*((H*DPR)/(2*Math.tan(Math.PI/6)))/cam.dist;
      if(moonPx > 1.5){
        const msunV = norm3(vecV(viewMat, [-moonRel[0], -moonRel[1], -moonRel[2]]));
        gl.uniform3f(UG.uSunV, msunV[0],msunV[1],msunV[2]);
        gl.uniform1f(UG.uMoon, 1.0); gl.uniform1f(UG.uDisc, 1.0); gl.uniform1f(UG.uSz, Math.min(2400, moonPx));
        gl.uniform3f(UG.uPos, moonRel[0], moonRel[1], moonRel[2]);
        gl.drawArrays(gl.POINTS, 0, 1);
      }
    }
    gl.blendFunc(gl.ONE, gl.ONE);
    // the Moon's orbit, once it spans more than a few pixels
    const d = moonDist(a), ringPx = 2*d*((H*DPR)/(2*Math.tan(Math.PI/6)))/cam.dist;
    if(a > MOON_BORN && ringPx > 14 && ringPx < 3*H*DPR){   // and not once it dwarfs the view
      gl.useProgram(pRing);
      gl.uniformMatrix4fv(UR.uProj,false,projMat); gl.uniformMatrix4fv(UR.uView,false,viewMat);
      gl.uniform3f(UR.uSun, ex, ey, ez); gl.uniform1f(UR.uR, d);
      gl.uniform3f(UR.uColor, 0.16, 0.20, 0.30);
      gl.uniform3f(UR.uA, MOON_M1[0],MOON_M1[1],MOON_M1[2]); gl.uniform3f(UR.uB, MOON_M2[0],MOON_M2[1],MOON_M2[2]);
      gl.bindVertexArray(vaoRing); gl.drawArrays(gl.LINE_LOOP, 0, RING_SEGS);
    }
  }

  // Gliese 710, on the same symbolic scale as the Oort cloud in the compressed view and
  // at its true separation in real scale, so it passes where the cloud actually is.
  if(gl710.d < 60){
    const k = realMode ? 1/30 : 178/1.6;      // scene units per light year
    g710Pos[0]=gl710.x*k; g710Pos[1]=gl710.y*k; g710Pos[2]=gl710.z*k;
    g710Size[0] = realMode ? Math.max(0.9, cam.dist*0.006) : 2.6;
    const near = Math.min(1, Math.max(0, (6-gl710.d)/6));
    g710Col[0]=0.55+0.75*near; g710Col[1]=0.34+0.34*near; g710Col[2]=0.20+0.18*near;
    gl.uniform1f(U.ptSpin, 0.0); gl.uniform1f(U.ptVM, 0.0); gl.uniform1f(U.ptTide, 0.0);
    gl.uniform1f(U.ptMinB, 0.0); gl.uniform1f(U.ptMinSz, 1.3);
    gl.uniform3f(U.ptOrg, 0,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,g710GL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,g710Pos);
    gl.bindBuffer(gl.ARRAY_BUFFER,g710GL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,g710Size);
    gl.bindBuffer(gl.ARRAY_BUFFER,g710GL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,g710Col);
    gl.bindVertexArray(g710GL.vao); gl.drawArrays(gl.POINTS,0,1);
  }
  // What the Sun sheds: under the star, additive, only from outside it — a billboard
  // cannot show a hollow shell from within, and from inside a real one there is
  // nothing to see but a faint sky glow anyway.
  const pn = pnState(ageGyr());
  pnShown = false;
  if(pn){
    const rScene = pn.rAU*AU2U, px = (2*rScene/0.74)*pxScale/camSunDist;
    const outside = Math.min(1, Math.max(0, (camSunDist/rScene - 1.15)/0.6));
    const alpha = pn.alpha*outside;
    if(alpha > 0.004 && px > 3){
      pnShown = true;
      gl.useProgram(pPN);
      gl.uniformMatrix4fv(UPN.proj,false,projMat);
      gl.uniformMatrix4fv(UPN.view,false,viewMat);
      gl.uniform1f(UPN.time, shimT);
      gl.uniform1f(UPN.age, pn.age);
      gl.uniform1f(UPN.alpha, alpha);
      const burst = Math.exp(-Math.pow((pn.age - 0.07)/0.06, 2));   // the casting itself
      gl.uniform1f(UPN.burst, burst);
      gl.uniform1f(UPN.sz, Math.min(1800, px*(1 + 2.5*burst)));
      gl.bindVertexArray(vaoSunPt); gl.drawArrays(gl.POINTS,0,1);
    }
  }
  if(plasmaSunPx > 7){
    // Drawn last, and not additively: the photosphere is opaque, so the disc must
    // occlude the sky behind it, with only the corona and arcs blending over it.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(pSunP);
    gl.uniformMatrix4fv(USn.proj,false,projMat);
    gl.uniformMatrix4fv(USn.view,false,viewMat);
    gl.uniform1f(USn.time, shimT);
    gl.uniform3f(USn.colD, tint.d[0], tint.d[1], tint.d[2]);
    gl.uniform3f(USn.colB, tint.b[0], tint.b[1], tint.b[2]);
    const sz = Math.min(1000, plasmaSunPx*2.7);
    gl.uniform1f(USn.sz, sz);
    gl.uniform1f(USn.disc, plasmaSunPx/sz);
    gl.bindVertexArray(vaoSunPt); gl.drawArrays(gl.POINTS,0,1);
    gl.blendFunc(gl.ONE, gl.ONE);
  }
  // The flares: a planet the surface has just reached, a white point over the limb for
  // a moment. Over the disc on purpose — at that instant the planet is at the surface,
  // and a disc drawn opaque would otherwise hide the one thing worth seeing.
  {
    let n = 0;
    for(let i=1;i<=3;i++){
      const t = eatFlash[i];
      if(t < 0 || cam.dist >= 0.13) continue;
      const env = t < 0.12 ? t/0.12 : Math.exp(-(t-0.12)/0.5);
      eatPos[n*3]=bodyPosArr[i*3]; eatPos[n*3+1]=bodyPosArr[i*3+1]; eatPos[n*3+2]=bodyPosArr[i*3+2];
      eatSize[n] = cam.dist*0.032*(0.6+0.4*env);
      eatCol[n*3]=2.4*env; eatCol[n*3+1]=2.4*env; eatCol[n*3+2]=2.6*env;
      eatW[n] = 0; n++;
    }
    if(n){
      gl.useProgram(pPt);
      gl.uniform1f(U.ptSpin, 0.0); gl.uniform1f(U.ptVM, 0.0); gl.uniform1f(U.ptTide, 0.0);
      gl.uniform1f(U.ptMinB, 0.0); gl.uniform1f(U.ptMinSz, 1.3); gl.uniform1f(U.ptCap, 110.0);
      gl.uniform3f(U.ptOrg, 0,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatPos.subarray(0,n*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatSize.subarray(0,n));
      gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatCol.subarray(0,n*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,eatGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,eatW.subarray(0,n));
      gl.bindVertexArray(eatGL.vao); gl.drawArrays(gl.POINTS,0,n);
    }
  }

  if(toneOn){   // resolve the half-float scene to the screen through the rolloff curve
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.BLEND);
    gl.useProgram(pTone);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, hdrTex);
    gl.uniform1i(UT.tex, 0);
    gl.uniform1f(UT.knee, coreKnee);
    gl.bindVertexArray(emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
  }

  // labels
  frameDt = dt;
  if(showLabels){
    const pv = mul(projMat, viewMat);
    const proj = (x, y, z) => { const cw = pv[3]*x+pv[7]*y+pv[11]*z+pv[15];
      return [cw, ((pv[0]*x+pv[4]*y+pv[8]*z+pv[12])/cw*0.5+0.5)*W, (-(pv[1]*x+pv[5]*y+pv[9]*z+pv[13])/cw*0.5+0.5)*H]; };
    let sunSX=0, sunSY=0;
    for(let i=0;i<NB;i++){
      const l=labelEls[i];
      if(i === I_P9 ? !showP9 : (i >= N_PLANETS && !showDwarfs)){ placeLabel(l, 0, 0, false); continue; }
      if(i > 0 && i <= 3 && wasEaten[i]){ placeLabel(l, 0, 0, false); continue; }   // swallowed
      if(globePx > 40 && i > 0){ placeLabel(l, 0, 0, false); continue; }          // zoomed onto Earth: only the Sun's place in the sky
      if(i === 0) l.textContent = pnShown ? 'Anthropic Nebula' : 'Sun';
      const [cw, lsx, lsy] = proj(bodyPosArr[i*3], bodyPosArr[i*3+1], bodyPosArr[i*3+2]);
      if(cw<=Math.max(1e-9,cam.dist*0.01) || cam.dist>900){ placeLabel(l, 0, 0, false); continue; }
      if(i===0){ sunSX=lsx; sunSY=lsy; }
      else if(realMode && Math.hypot(lsx-sunSX,lsy-sunSY)<14){ placeLabel(l, 0, 0, false); continue; }
      placeLabel(l, lsx, lsy, true);
      l.style.opacity = i===0?0.9:0.65;
    }
    // the Moon: labelled while it is drawn as a disc and stands clear of Earth's label
    if(moonPx > 1.5){
      const [cw, mx, my] = proj(moonRel[0], moonRel[1], moonRel[2]);
      const [ , ex, ey] = proj(bodyPosArr[9], bodyPosArr[10], bodyPosArr[11]);
      placeLabel(moonEl, mx, my, cw > 0 && Math.hypot(mx-ex, my-ey) > 16);
    } else placeLabel(moonEl, 0, 0, false);
    // structure labels: a point on each ring, Sun-relative like the rings themselves
    for(let s=0;s<STRUCTS.length;s++){
      const el = structEls[s];
      if(!STRUCTS[s][2]()){ placeLabel(el, 0, 0, false); continue; }
      const rU = STRUCTS[s][1]*AU2U;
      const rpx = rU*pxScale/cam.dist;
      if(globePx > 40){ el.style.display = 'none'; if(el._lb) el._lb.on = false; continue; }   // at once, not debounced
      if(rpx < 46 || rpx > 2600){ placeLabel(el, 0, 0, false); continue; }
      const [cw, sx, sy] = proj(rU*0.71, 0, rU*0.71);    // 45 degrees round the ring
      placeLabel(el, sx, sy, cw > 1e-9);
    }
    const galaxyNames = armsOn && cam.dist > 600;
    // arm names: world coordinates rotated with the wave, then projected like the rest
    // (once the remnant starts to relax there are no arms left to name)
    if(galaxyNames && and.merge < 0.35){
      const d = spinMW/640, cD = Math.cos(d), sD = Math.sin(d);
      for(let a=0;a<ARM_LBLS.length;a++){
        const wx = ARM_LBLS[a][1]*cD + ARM_LBLS[a][2]*sD, wz = ARM_LBLS[a][2]*cD - ARM_LBLS[a][1]*sD;
        const [cw, sx, sy] = proj(wx-org[0], -org[1], wz-org[2]);
        placeLabel(armEls[a], sx, sy, cw > 1);
      }
    } else armEls.forEach(l=>placeLabel(l, 0, 0, false));
    // named together, retired together: past this point the two disks already render as
    // one blob, so naming only "Andromeda" there would mislabel the Milky Way's own remnant
    if(galaxyNames && and.merge < 0.35){
      for(let a=0;a<M31_LBLS.length;a++){
        // the satellites and the stream exist only in the map-built Andromeda
        if(a > 0 && !m31Map){ placeLabel(m31Els[a], 0, 0, false); continue; }
        const L = M31_LBLS[a];
        const wx = M31_ROT[0]*L[1]+M31_ROT[3]*L[2]+M31_ROT[6]*L[3]+andPos[0];
        const wy = M31_ROT[1]*L[1]+M31_ROT[4]*L[2]+M31_ROT[7]*L[3]+andPos[1];
        const wz = M31_ROT[2]*L[1]+M31_ROT[5]*L[2]+M31_ROT[8]*L[3]+andPos[2];
        const [cw, sx, sy] = proj(wx-org[0], wy-org[1], wz-org[2]);
        // the small companions only earn a name once Andromeda fills some of the view
        placeLabel(m31Els[a], sx, sy, !(cw <= 1 || (a > 0 && and.sep > 0.9*cam.dist + 4000)));
      }
    } else m31Els.forEach(l=>placeLabel(l, 0, 0, false));
    // one galaxy, one name: from the moment the disks are one blob, the remnant's centre
    { const [cw, sx, sy] = proj(-org[0], -org[1], -org[2]);
      placeLabel(mergedEl, sx, sy, galaxyNames && and.merge >= 0.35 && cw > 1); }
    if(gl710.d < 40){
      const k = realMode ? 1/30 : 178/1.6;
      const [cw, sx, sy] = proj(gl710.x*k, gl710.y*k, gl710.z*k);
      placeLabel(g710Lbl, sx, sy, cw > Math.max(1e-9,cam.dist*0.01) && cam.dist <= 900);
    } else placeLabel(g710Lbl, 0, 0, false);
  } else placeLabel(g710Lbl, 0, 0, false);
  

  if(showFps) fpsFrames++;      // counted every frame; only the display is paced
  if(now - lastHud >= 1000/hudHz){
  lastHud = now;
  holdBarWidth(now);
  if(liveCount){
    // What is happening in this moment: the drawn events actually in progress, so the
    // numbers step up as stars ignite or begin dying and back down as each one ends.
    let dying=0, forming=0;
    for(const e of events){
      if(e.k===2 || e.k===3) dying++;        // red supergiant, then the blast itself
      else if(e.k===1) forming++;            // a cluster still lighting up
    }
    $('nDeath').textContent = '−'+dying;
    $('nBirth').textContent = '+'+forming;
  } else {
    // Running totals at the real rates: ~2 supernovae per century, and a ~2 solar-mass
    // per year formation rate which at a ~0.5 solar-mass mean is roughly 4 stars a year.
    const w = ratesIntegral(ageGyr());   // integrates the declining rate, not a flat one
    $('nDeath').textContent = '−'+fmtCount(w*0.02);
    $('nBirth').textContent = '+'+fmtCount(w*4);
  }

  { const e = environment();
    // a glacial epoch is marked on the reading itself rather than in a banner below it
    let lost = false;
    { // Earth's readings mean nothing once there is no Earth: the panel turns to the Sun
      const ss = sunState(ageGyr());
      lost = ss.eaten || ss.gone;
      // "Solar System" stops being the right name once there is no Sun left to orbit —
      // ss.gone is the same age latch (a >= SUN_AGB) the panel above already uses, so the
      // dropdown and the panel turn at the same moment, and scrubbing the clock backward
      // (a scenario, a jump) correctly turns it back rather than leaving a stale name.
      // Written only on an actual change: a <select>'s open popup watches its <option>
      // nodes, and rewriting one every rendered frame — even to the same string — made
      // the dropdown flicker and refuse to register a pick at all.
      const sunOptWant = ss.gone ? 'Anthropic Nebula core' : 'Solar System';
      if(focusSunOpt.textContent !== sunOptWant) focusSunOpt.textContent = sunOptWant;
      for(const id of ['eSunPhaseRow','eSunSizeRow']) $(id).style.display = lost ? '' : 'none';
      for(const id of ['eRangeRow','eCRRow','eSLRow','eLifeRow']) $(id).style.display = lost ? 'none' : '';
      $('env').querySelector('h2').textContent = lost ? 'The Sun' : 'Earth';
      const pc = ss.L*100;
      $('eSun').textContent = pc >= 1e4 ? Math.round(pc).toLocaleString('en-US')+'%'
                            : pc >= 10  ? pc.toFixed(0)+'%' : pc.toFixed(1)+'%';
      $('eSun').style.color = tempColour(-20 + Math.min(1, Math.log10(Math.max(pc,1))/3.2)*80);
      if(lost){
        // The drawn nebula outlasts sunState()'s own 'planetary nebula' phase — it keeps
        // fading for 0.3 Gyr after the star is technically a white dwarf inside it — so
        // the reading follows the nebula (pn, non-null exactly that long), not the phase
        // name alone, or it would call it a white dwarf while the shell is still on screen.
        const phaseNow = pn ? 'planetary nebula' : ss.phase;
        $('eSunPhase').textContent = ss.R >= EARTH_ORBIT_RSUN ? 'engulfing the Earth'
                                   : ss.eaten && !ss.gone ? phaseNow + ' · Earth gone' : phaseNow;
        $('eSunSize').textContent = ss.R >= 1 ? ss.R.toFixed(ss.R<10?2:0)+' R☉'
                                              : (ss.R*109.2).toFixed(2)+' R⊕';
        $('eMeanRow').style.display = 'none';
      } else $('eMeanRow').style.display = '';
    }
    $('eMean').textContent  = (e.ice ? '❄ ' : '') + e.mean.toFixed(1)+' °C';
    $('eMin').textContent   = e.min.toFixed(0);
    $('eMax').textContent   = e.max.toFixed(0);
    // an ice age is a statement about the world, not about the thermometer: the mean
    // reads glacial blue then, whatever number the average happens to land on
    $('eMean').style.color = e.ice ? 'rgb(168,224,255)' : tempColour(e.mean);
    $('eMin').style.color  = tempColour(e.min);
    $('eMax').style.color  = tempColour(e.max);
    $('eCR').textContent    = e.cr.toFixed(2)+'× today';
    $('eSL').textContent    = e.star.toFixed(2)+'×';
    const ls = lifeSupOn ? lifeState() : null;
    if(ls) $('eLife').textContent = ls.label;
    // and neither does an ice age: the frost stays off once there is no Earth to freeze
    document.body.classList.toggle('ice', e.ice && !lost);
    const gd = g710().d;
    document.body.classList.toggle('g710', gd < 1.9);
    layoutPanels();
    { // the alert boxes ride on top of the status bar, matching its width; with the
      // bar slid away or hidden they anchor to the bottom edge instead
      const bar = $('gamebar');
      const barUp = getComputedStyle(bar).display !== 'none' && !bar.classList.contains('slid');
      let left, width, bottom;
      if(barUp){
        const r = bar.getBoundingClientRect();
        left = r.left; width = r.width; bottom = r.top - 8;
      } else {
        width = Math.min(innerWidth - 28, 560);
        left = (innerWidth - width)/2; bottom = innerHeight - 14;
      }
      for(const id of ['iceBox','g710Box']){
        const b = $(id);
        if(getComputedStyle(b).display !== 'none'){
          b.style.left = left + 'px';
          b.style.width = width + 'px';
          const h = b.getBoundingClientRect().height;
          b.style.top = (bottom - h) + 'px';
          bottom -= h + 8;
        }
      }
    }
    if(gd < 1.9) $('eG710d').textContent = gd < 0.995
      ? Math.round(gd*63241).toLocaleString('en-US')+' AU' : gd.toFixed(2)+' ly';
    setStateColour(ls ? ls.h : 0, e.mean); }

  // stats
  $('yrs').textContent = fmtYears(Math.abs(simT));
  $('pct').textContent = (simT/GAL_PERIOD*100).toFixed(3);
  if(showFps){
    if(now - fpsSince >= 500){
      $('fpsVal').textContent = (fpsFrames*1000/(now - fpsSince)).toFixed(0);
      fpsFrames = 0; fpsSince = now;
    }
  }
  { const wLy = 1.155*cam.dist*30, wAU = wLy*63241; // view height in ly / AU (60° fov)
    $('sScale').textContent = wLy>=1000 ? (wLy/1000).toFixed(1)+' kly'
      : wLy>=0.05 ? wLy.toFixed(wLy<10?2:0)+' ly'
      : wAU >= 0.5 ? wAU.toFixed(wAU<10?1:0)+' AU'
      : wAU*1.496e8 >= 1e6 ? (wAU*1.496e8/1e6).toFixed(2)+' Mkm'
      : wAU*1.496e8 >= 1 ? Math.round(wAU*1.496e8).toLocaleString('en-US')+' km'
      : (wAU*215).toFixed(1)+' R☉'; }   // below half an AU, solar radii say it better
  if(showStats){
    $('gCal').textContent = humanYear();
    // real elapsed time: one sim lap ≡ one real galactic year of 225 Myr
    const myr = simT*(225/GAL_PERIOD);                       // real megayears elapsed
    $('gAge').textContent = fmtYears(4.568e9 + myr*1e6);
    // Once the remnant has relaxed there are no laps left to count: the Sun's ordered
    // circular orbit has been scattered into a random one inside an elliptical, so the
    // readout turns to the thing that still means something — how far out it now sits.
    if(mergeAt(AGE0 + myr/1e3) > 0.9){
      $('lGyr').textContent = 'distance from centre';
      $('gGyr').textContent = (sunR(simT)*30/3261.6).toFixed(1)+' kpc';
    } else {
      $('lGyr').textContent = 'galactic years';
      $('gGyr').textContent = (4568/225 + sunPhase(simT)/(2*Math.PI)).toFixed(3);
    }
  }
  }

  if(probeFrames >= 0 && ++probeFrames === 3){ probeFrames = -1; if(!hadSaved) runFirstLaunchProbe(); }
  requestAnimationFrame(frame);
}
// Whether this visitor has been here before decides how much the opening scenario may
// touch: the camera always, their saved sliders never.
const hadSaved = (()=>{ try{ return !!localStorage.getItem(SKEY); }catch(e){ return false; } })();
restoreSettings();
// the initial synchronous build above is deliberately "lowest" (D=1) to dodge a
// load-order trap: setGalaxy(D>=5) reaches for loadGaiaDeep(), which touches a `let`
// declared later in the file — safe here because the whole script has finished
// evaluating, exactly like restoreSettings()'s own dens correction above.
if(!hadSaved){ $('detail').value = 1; $('detail').dispatchEvent(new Event('input')); }
applyTrailWindow();
// The piece opens on its signature view. A first-time visitor gets the whole staging;
// a returning one gets the camera and keeps every setting they chose, because a
// remembered setting is a decision and the opening is only a default.
keepSaved = hadSaved;
$('jump').value = 'helix';
$('jump').dispatchEvent(new Event('change'));
keepSaved = false;
try{ if(!hadSaved && !localStorage.getItem(TOURKEY)) setTimeout(showTour, 400); }catch(e){}
// ---------- the debug door: opened by ?debug in the URL or ten taps on refresh ----------
// QR encoder: byte mode, EC level L, versions 1–40, standard masking by penalty. Returns
// {n, m} with m a Uint8Array of n*n modules (1 = dark). Self-contained; no tables beyond
// the version capacity/EC block list, which is the spec's Table 9 for level L.
function qrEncode(text, forceMask){
  const bytes = new TextEncoder().encode(text);
  // [total codewords, ec codewords per block, blocks group1, data cw group1, blocks group2, data cw group2] for level L
  const T = [null,
    [26,7,1,19,0,0],[44,10,1,34,0,0],[70,15,1,55,0,0],[100,20,1,80,0,0],[134,26,1,108,0,0],[172,18,2,68,0,0],[196,20,2,78,0,0],[242,24,2,97,0,0],[292,30,2,116,0,0],[346,18,2,68,2,69],
    [404,20,4,81,0,0],[466,24,2,92,2,93],[532,26,4,107,0,0],[581,30,3,115,1,116],[655,22,5,87,1,88],[733,24,5,98,1,99],[815,28,1,107,5,108],[901,30,5,120,1,121],[991,28,3,113,4,114],[1085,28,3,107,5,108],
    [1156,28,4,116,4,117],[1258,28,2,111,7,112],[1364,30,4,121,5,122],[1474,30,6,117,4,118],[1588,26,8,106,4,107],[1706,28,10,114,2,115],[1828,30,8,122,4,123],[1921,30,3,117,10,118],[2051,30,7,116,7,117],[2185,30,5,115,10,116],
    [2323,30,13,115,3,116],[2465,30,17,115,0,0],[2611,30,17,115,1,116],[2761,30,13,115,6,116],[2876,30,12,121,7,122],[3034,30,6,121,14,122],[3196,30,17,122,4,123],[3362,30,4,122,18,123],[3532,30,20,117,4,118],[3706,30,19,118,6,119]];
  const ALIGN = [null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],
    [6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]];
  // version: the first whose data capacity holds mode(4) + count(8|16) + bytes
  let v = 1;
  for(; v <= 40; v++){ const t = T[v], dataCW = t[2]*t[3] + t[4]*t[5]; const cnt = v <= 9 ? 8 : 16;
    if(4 + cnt + bytes.length*8 <= dataCW*8) break; }
  if(v > 40) throw new Error('too long for a QR code');
  const t = T[v], dataCW = t[2]*t[3] + t[4]*t[5], cnt = v <= 9 ? 8 : 16;
  // data bit stream
  const bits = []; const put = (val, n) => { for(let i=n-1;i>=0;i--) bits.push((val>>i)&1); };
  put(4,4); put(bytes.length, cnt); for(const b of bytes) put(b,8);
  const cap = dataCW*8; for(let i=0;i<4 && bits.length<cap;i++) bits.push(0);
  while(bits.length%8) bits.push(0);
  const data = []; for(let i=0;i<bits.length;i+=8){ let x=0; for(let j=0;j<8;j++) x=(x<<1)|bits[i+j]; data.push(x); }
  for(let k=0; data.length<dataCW; k++) data.push(k%2 ? 0x11 : 0xEC);
  // GF(256) Reed–Solomon
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for(let i=0,x=1;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&256) x^=0x11d; }
  for(let i=255;i<512;i++) EXP[i]=EXP[i-255];
  const mul = (a,b) => (a&&b) ? EXP[LOG[a]+LOG[b]] : 0;
  const ecN = t[1]; let gen = [1];
  for(let i=0;i<ecN;i++){ const ng = new Array(gen.length+1).fill(0);
    for(let j=0;j<gen.length;j++){ ng[j] ^= gen[j]; ng[j+1] ^= mul(gen[j], EXP[i]); } gen = ng; }
  const ecOf = blk => { const r = blk.slice().concat(new Array(ecN).fill(0));
    for(let i=0;i<blk.length;i++){ const c = r[i]; if(!c) continue; for(let j=1;j<gen.length;j++) r[i+j] ^= mul(gen[j], c); }
    return r.slice(blk.length); };
  const blocks = [], ecs = []; let p = 0;
  for(let g=0; g<2; g++){ const nb = t[2+2*g], len = t[3+2*g]; for(let b=0;b<nb;b++){ const blk = data.slice(p, p+len); p += len; blocks.push(blk); ecs.push(ecOf(blk)); } }
  const out = []; const maxLen = Math.max(...blocks.map(b=>b.length));
  for(let i=0;i<maxLen;i++) for(const b of blocks) if(i<b.length) out.push(b[i]);
  for(let i=0;i<ecN;i++) for(const e of ecs) out.push(e[i]);
  // the matrix
  const n = 17 + 4*v, m = new Uint8Array(n*n), fixed = new Uint8Array(n*n);
  const set = (x,y,val) => { m[y*n+x] = val; fixed[y*n+x] = 1; };
  const finder = (x0,y0) => { for(let dy=-1;dy<=7;dy++) for(let dx=-1;dx<=7;dx++){ const x=x0+dx, y=y0+dy; if(x<0||y<0||x>=n||y>=n) continue;
    const on = (dx>=0&&dx<=6&&dy>=0&&dy<=6) && (dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4)); set(x,y,on?1:0); } };
  finder(0,0); finder(n-7,0); finder(0,n-7);
  for(let i=8;i<n-8;i++){ set(i,6,i%2===0?1:0); set(6,i,i%2===0?1:0); }
  const al = ALIGN[v];
  // omitted only where one would overlap a finder — the ones on the timing lines are drawn
  for(const cy of al) for(const cx of al){ if((cx<9&&cy<9)||(cx>n-10&&cy<9)||(cx<9&&cy>n-10)) continue;
    for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) set(cx+dx, cy+dy, (Math.max(Math.abs(dx),Math.abs(dy))!==1)?1:0); }
  set(8, n-8, 1);   // the dark module
  // reserve format (and version) areas
  for(let i=0;i<9;i++){ if(i!==6){ fixed[8*n+i]=1; fixed[i*n+8]=1; } }
  for(let i=0;i<8;i++){ fixed[8*n+(n-1-i)]=1; fixed[(n-1-i)*n+8]=1; }
  if(v>=7){ for(let i=0;i<6;i++) for(let j=0;j<3;j++){ fixed[i*n+(n-11+j)]=1; fixed[(n-11+j)*n+i]=1; } }
  let bi = 0; const total = out.length*8; const bitAt = k => (out[k>>3] >> (7-(k&7))) & 1;
  // codewords into the matrix: column pairs from the right, direction alternating, starting upward
  { let up = true;
    for(let x=n-1; x>0; x-=2){ if(x===6) x--;
      for(let k=0;k<n;k++){ const y = up ? n-1-k : k;
        for(let dx=0; dx<2; dx++){ const xx = x-dx; if(fixed[y*n+xx]) continue;
          m[y*n+xx] = bi < total ? bitAt(bi) : 0; bi++; } }
      up = !up; } }
  // masks
  const MASK = [ (x,y)=>(x+y)%2===0, (x,y)=>y%2===0, (x,y)=>x%3===0, (x,y)=>(x+y)%3===0,
    (x,y)=>((y>>1)+Math.floor(x/3))%2===0, (x,y)=>(x*y)%2+(x*y)%3===0, (x,y)=>((x*y)%2+(x*y)%3)%2===0, (x,y)=>((x+y)%2+(x*y)%3)%2===0 ];
  const applyMask = (mk, src) => { const r = new Uint8Array(src); for(let y=0;y<n;y++) for(let x=0;x<n;x++) if(!fixed[y*n+x] && MASK[mk](x,y)) r[y*n+x]^=1; return r; };
  const formatBits = mk => { const d = (1<<3)|mk;   // level L = 01 -> value 1 in the two EC bits... (L=01)
    let f = d<<10; const G = 0x537; for(let i=14;i>=10;i--) if((f>>i)&1) f ^= G<<(i-10); return ((d<<10)|f) ^ 0x5412; };
  const writeFormat = (mat, mk) => { const f = formatBits(mk); const b = i => (f>>i)&1;
    const pos1 = [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]];   // (x,y) for bits 14..0
    for(let i=0;i<15;i++){ const [x,y] = pos1[i]; mat[y*n+x] = b(14-i); }
    for(let i=0;i<8;i++) mat[8*n+(n-1-i)] = b(i);                 // bits 0..7 along the top-right row? spec: right of row 8
    for(let i=0;i<7;i++) mat[(n-1-i)*n+8] = b(14-i);              // bits 14..8 down the bottom-left column
  };
  const writeVersion = mat => { if(v<7) return; let f = v<<12; const G = 0x1f25; for(let i=17;i>=12;i--) if((f>>i)&1) f ^= G<<(i-12); const val = (v<<12)|f;
    for(let i=0;i<18;i++){ const bit = (val>>i)&1; const a = Math.floor(i/3), b = i%3; mat[(n-11+b)*n + a] = bit; mat[a*n + (n-11+b)] = bit; } };
  const penalty = mat => { let s=0;
    for(let y=0;y<n;y++){ let run=1; for(let x=1;x<n;x++){ if(mat[y*n+x]===mat[y*n+x-1]){ run++; if(run===5) s+=3; else if(run>5) s++; } else run=1; } }
    for(let x=0;x<n;x++){ let run=1; for(let y=1;y<n;y++){ if(mat[y*n+x]===mat[(y-1)*n+x]){ run++; if(run===5) s+=3; else if(run>5) s++; } else run=1; } }
    for(let y=0;y<n-1;y++) for(let x=0;x<n-1;x++){ const a=mat[y*n+x]; if(a===mat[y*n+x+1]&&a===mat[(y+1)*n+x]&&a===mat[(y+1)*n+x+1]) s+=3; }
    const P = [1,0,1,1,1,0,1,0,0,0,0], Q = [0,0,0,0,1,0,1,1,1,0,1];
    const chk = (get) => { for(let i=0;i<=n-11;i++){ let okP=true, okQ=true; for(let k=0;k<11;k++){ const val=get(i+k); if(val!==P[k]) okP=false; if(val!==Q[k]) okQ=false; } if(okP) s+=40; if(okQ) s+=40; } };
    for(let y=0;y<n;y++) chk(i=>mat[y*n+i]); for(let x=0;x<n;x++) chk(i=>mat[i*n+x]);
    let dark=0; for(let i=0;i<n*n;i++) dark+=mat[i]; const pct = dark*100/(n*n); s += Math.floor(Math.abs(pct-50)/5)*10; return s; };
  let best=null, bestS=Infinity, bestMk=0;
  const tryMasks = forceMask===undefined ? [0,1,2,3,4,5,6,7] : [forceMask];
  for(const mk of tryMasks){ const mat = applyMask(mk, m); writeFormat(mat, mk); writeVersion(mat); const sc = penalty(mat); if(sc<bestS){ bestS=sc; best=mat; bestMk=mk; } }
  return { n, m: best, version: v, mask: bestMk };
}

// The overlay: the exported state (settings, clock, camera — the timestamp left out, so
// the code holds still while nothing changes) as a QR code, redrawn once a second when
// it differs, at 1, 2 or 4 device pixels a module with a four-module quiet zone. Debug
// only; nothing below reaches it when debug mode is off.
const QR_SCALES = [1, 2, 4]; let qrLast = '';
function qrPlace(){
  const cv = $('qrOverlay'), w = cv.offsetWidth, h = cv.offsetHeight;
  const gap = 8, fx = Math.max(0, innerWidth - w - gap), fy = Math.max(0, innerHeight - h - gap);
  cv.style.left = (gap/2 + fx*Math.min(1, Math.max(0, qrPos.x))) + 'px';
  cv.style.top  = (gap/2 + fy*Math.min(1, Math.max(0, qrPos.y))) + 'px';
}
function qrRedraw(force){
  const cv = $('qrOverlay');
  if(!debugMode || !$('qrOn').checked){ cv.style.display = 'none'; qrLast = ''; return; }
  const st = exportState(); delete st.exported;
  const payload = JSON.stringify(st);
  if(!force && payload === qrLast) return;
  qrLast = payload;
  let q; try{ q = qrEncode(payload); }catch(e){ cv.style.display = 'none'; return; }
  const sc = QR_SCALES[+$('qrScale').value] || 2, quiet = 4, size = (q.n + 2*quiet)*sc;
  cv.width = size; cv.height = size;
  cv.style.width = (size/DPR) + 'px'; cv.style.height = (size/DPR) + 'px';   // sc DEVICE pixels a module
  const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); g.fillStyle = '#000';
  for(let y=0;y<q.n;y++) for(let x=0;x<q.n;x++) if(q.m[y*q.n+x]) g.fillRect((x+quiet)*sc, (y+quiet)*sc, sc, sc);
  cv.style.display = 'block';
  if(!qrHeld) qrPlace();   // the canvas has just changed size: keep its corner
}
$('qrOn').addEventListener('change', ()=> qrRedraw(true));
// Movable by finger or mouse, and the canvas below never sees the gesture. A drag ends by
// recording the corner it was dropped nearest, in the same free-space fractions; a double
// tap that did not drag switches the overlay off.
{ const cv = $('qrOverlay'); let dx = 0, dy = 0, sx = 0, sy = 0, held = false, moved = false, lastTap = 0;
  const record = ()=>{
    const gap = 8, w = cv.offsetWidth, h = cv.offsetHeight;
    const fx = Math.max(1, innerWidth - w - gap), fy = Math.max(1, innerHeight - h - gap);
    qrPos = { x: Math.min(1, Math.max(0, (parseFloat(cv.style.left) - gap/2)/fx)),
              y: Math.min(1, Math.max(0, (parseFloat(cv.style.top)  - gap/2)/fy)) };
    saveSettings();
  };
  cv.addEventListener('pointerdown', e=>{ held = qrHeld = true; moved = false; sx = e.clientX; sy = e.clientY;
    const r = cv.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top;
    try{ cv.setPointerCapture(e.pointerId); }catch(err){} e.stopPropagation(); e.preventDefault(); });
  cv.addEventListener('pointermove', e=>{ if(!held) return;
    if(Math.hypot(e.clientX - sx, e.clientY - sy) > 6) moved = true;
    cv.style.left = Math.max(0, Math.min(innerWidth - cv.offsetWidth, e.clientX - dx)) + 'px';
    cv.style.top  = Math.max(0, Math.min(innerHeight - cv.offsetHeight, e.clientY - dy)) + 'px'; e.stopPropagation(); });
  const drop = e=>{
    if(!held) return;
    held = qrHeld = false; e.stopPropagation();
    if(moved){ record(); lastTap = 0; return; }
    const now = performance.now();
    if(now - lastTap < 400){ lastTap = 0; $('qrOn').checked = false; $('qrOn').dispatchEvent(new Event('change')); saveSettings(); }
    else lastTap = now;
  };
  cv.addEventListener('pointerup', drop); cv.addEventListener('pointercancel', drop);
  addEventListener('resize', ()=>{ if(cv.style.display !== 'none') qrPlace(); }); }
$('qrScale').addEventListener('input', e=>{ $('qrScalev').textContent = QR_SCALES[+e.target.value] + '×'; qrRedraw(true); });
setInterval(()=> qrRedraw(false), 1000);
const DBGKEY = 'galactic-transit.debug';
const DEBUG = (()=>{ try{
  const v = new URLSearchParams(location.search).get('debug');
  if(v !== null){
    const on = !['0','false','off'].includes(v.toLowerCase());
    try{ localStorage.setItem(DBGKEY, on ? '1' : '0'); }catch(e){}
    return on;
  }
  return localStorage.getItem(DBGKEY) === '1';
}catch(e){ return false; } })();
let debugMode = false;
// ---------- the settings / log tabs ----------
const esc = t => String(t).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const clock = t => new Date(t).toTimeString().slice(0,8);
function renderLog(){
  const total = errLog.reduce((n,e)=>n+e.n, 0);
  $('logCount').textContent = total ? ' ' + total : '';
  if($('logBody').style.display === 'none') return;      // counted always, drawn only when open
  $('logNote').textContent = TOUCH_DEV ? BUILD.version + ' · since load' : 'desktop: use the browser console';
  $('logList').innerHTML = errLog.length
    ? errLog.map(e => '<div class="logrow ' + e.kind + '"><div class="meta">' + clock(e.t) + ' · ' + e.kind
        + (e.n > 1 ? ' ×' + e.n : '') + (e.where ? ' · ' + esc(e.where) : '') + '</div>' + esc(e.msg) + '</div>').join('')
    : '<div class="logempty">' + (TOUCH_DEV ? 'Nothing has gone wrong since this page loaded.'
        : 'Errors are collected on phones and tablets only, where there is no console to open. This device has one — use it.') + '</div>';
}
function setHudTab(t){
  $('hudBody').style.display = t === 'log' ? 'none' : '';
  $('logBody').style.display = t === 'log' ? '' : 'none';
  for(const b of document.querySelectorAll('#hudTabs .tab')) b.classList.toggle('on', b.dataset.tab === t);
  renderLog(); fitPanels();
}
for(const b of document.querySelectorAll('#hudTabs .tab')) b.addEventListener('click', ()=> setHudTab(b.dataset.tab));
$('logClear').addEventListener('click', ()=>{ errLog.length = 0; renderLog(); });
$('logCopy').addEventListener('click', ()=>{
  const txt = 'galactic-transit ' + BUILD.version + ' · ' + navigator.userAgent + '\n'
    + errLog.map(e => clock(e.t) + ' ' + e.kind + (e.n>1 ? ' x'+e.n : '') + (e.where ? ' (' + e.where + ')' : '') + ': ' + e.msg).join('\n');
  try{ navigator.clipboard.writeText(txt); $('logCopy').textContent = 'copied'; setTimeout(()=> $('logCopy').textContent = 'copy', 1200); }catch(e){}
});
function setDebugUI(on, entering){
  debugMode = on;
  $('dbgBtn').style.display = on ? '' : 'none';
  $('rowHudHz').style.display = on ? '' : 'none';
  $('rowGain').style.display = on ? '' : 'none';
  $('secDebugHead').style.display = on ? '' : 'none';
  $('hudTabs').style.display = on ? '' : 'none';
  // the log is what debug mode is entered for, so it opens on it; leaving takes the
  // settings back, since without the strip there is no way back to them
  setHudTab(on && entering ? 'log' : 'set');
  if(!on){ secOpen.debug = false; applySecs(); }       // folded away with its heading; opens as any section
  // entering debug mode switches the QR on; a plain boot in debug mode leaves the choice alone
  if(on && entering && !$('qrOn').checked){ $('qrOn').checked = true; $('qrOn').dispatchEvent(new Event('change')); }
  qrRedraw(true);
}
if(DEBUG) setDebugUI(true, new URLSearchParams(location.search).get('debug') !== null);
function exportState(){
  saveSettingsNow();
  let settings = null; try{ settings = JSON.parse(localStorage.getItem(SKEY)||'null'); }catch(e){}
  return {
    app: 'galactic-transit', version: BUILD.version, exported: new Date().toISOString(),
    time: { simT, paused },
    camera: { yaw:cam.yaw, pitch:cam.pitch, dist:cam.dist, distGoal:cam.distGoal,
              follow:cam.follow, coreLock, dive:$('tDive').classList.contains('on') },
    viewport: { w:innerWidth, h:innerHeight, dpr:devicePixelRatio },
    settings,
  };
}
function applyState(o){
  if(!o || o.app !== 'galactic-transit') throw new Error('not a galactic-transit state');
  if(o.settings){ localStorage.setItem(SKEY, JSON.stringify(o.settings)); restoreSettings(false); }
  if(o.time && typeof o.time.simT === 'number'){
    simT = o.time.simT; nextSample = simT + DT_SAMPLE;
    events.length = 0; puffs.length = 0; refillTrails();
    if(typeof o.time.paused === 'boolean' && paused !== o.time.paused) $('tPause').click();
  }
  if(o.camera){ const c = o.camera;
    for(const k of ['yaw','pitch','dist','distGoal']) if(typeof c[k] === 'number') cam[k] = c[k];
    if(typeof c.follow === 'boolean') cam.follow = c.follow;
    coreLock = !!c.coreLock;
    $('tDive').classList.toggle('on', !!c.dive);
    reseedFollow = true; panF[0]=panF[1]=0;
  }
}
const dbgSay = m => { $('dbgMsg').textContent = m; };
$('dbgBtn').addEventListener('click', ()=>{
  $('dbgCard').style.display='';
  // open on the current state, ready to copy — export is one keypress saved
  $('dbgText').value = JSON.stringify(exportState(), null, 2);
  dbgSay('current state');
});
$('dbgClose').addEventListener('click', ()=>{ $('dbgCard').style.display='none'; });
$('dbgExport').addEventListener('click', ()=>{
  $('dbgText').value = JSON.stringify(exportState(), null, 2); dbgSay('state exported'); });
$('dbgImport').addEventListener('click', ()=>{
  try{ applyState(JSON.parse($('dbgText').value)); dbgSay('state imported'); }
  catch(e){ dbgSay('import failed: '+e.message); } });
$('dbgCopy').addEventListener('click', ()=>{
  navigator.clipboard.writeText($('dbgText').value)
    .then(()=>dbgSay('copied'), ()=>dbgSay('clipboard refused — select and copy by hand')); });
$('dbgPaste').addEventListener('click', ()=>{
  navigator.clipboard.readText()
    .then(v=>{ $('dbgText').value=v; dbgSay('pasted'); },
          ()=>dbgSay('clipboard refused — paste into the box by hand')); });
fitPanels();
requestAnimationFrame(frame);
