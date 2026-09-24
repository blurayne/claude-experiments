/* ============================================================================
   HORDE — app shell
   ----------------------------------------------------------------------------
   Boot, game loop, camera, input, overlay, minimap, HUD, settings, help and the
   game-over card. It talks to the other tracks only through the HORDE_SPEC API:

     gen = BV.generate(seed, opts)      net = BV.buildNet(gen)
     R   = BV.createRenderer(canvas, net, opts)   R.resize / render / setQuality
     S   = BV.createSim(net, {seed, difficulty})  S.update / select* / command

   Optional extras are feature-detected, never required: R.setNet (new map on
   the same canvas), R.stats().gpuMs, S.hoverAt, S.orders, S.tracePath,
   S.selectionCenter, S.home, S.prewarm, S.setDifficulty, S.tune.

   LOOP     rAF. The simulation advances in whole fixed steps of 1/120 s
            (accumulator, at most 6 steps = 50 ms per frame, the rest is
            dropped, so a slow frame means slow motion, not a spiral); all due
            steps go into one S.update call. When no step is due but the
            camera moved, S.update(0) refreshes the view-local red cells.
            rbcLOD = smoothstep(2.5, 6, 2·RBC_R·z) (0 when red cells are off).
   CAMERA   {x, y, z}: world point at the screen centre, css px per µm. Zoom
            eases exponentially in log space around an anchor (the cursor),
            clamped to [fit-map, MAX_ZOOM]; drag pans with inertia; WASD /
            arrows / screen edges pan; long jumps fly on a van Wijk–Nuij
            smooth zoom-and-pan path. The centre is clamped to the map (plus a
            margin so edge vessels can be pulled out from under the HUD).
   INPUT    mouse: left-drag box, click select horde, double-click select all
            visible, right-click order, wheel zoom, middle/space-drag pan.
            touch: drag pan, pinch zoom, tap unit = select horde, tap elsewhere
            = order (when something is selected), long-press + drag = box.
   QUALITY  Auto = dynamic render scale 1 → 0.5 on a frame-time EMA with
            hysteresis; High / Medium / Low are fixed (scale + DPR cap).
   ========================================================================== */
(function(){
'use strict';
const BV = window.BV = window.BV || {};
const CONST = BV.CONST || {};
const MAX_ZOOM = CONST.MAX_ZOOM || 64/12;
const RBC_R = CONST.RBC_R || 3.75;
const WBC_R = CONST.WBC_R || 6;

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const smoothstep = (a, b, x) => { const t = clamp((x - a)/(b - a), 0, 1); return t*t*(3 - 2*t); };
const now = () => performance.now();
const TAU = Math.PI*2;
const FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace';

// ============================================================================
//  settings (per viewer; localStorage is best effort) + URL overrides
// ============================================================================
const QS = new URLSearchParams(location.search);
const PDB = QS.has('pdb');                       // preserveDrawingBuffer, for screenshots
const SKEY = 'bv-horde-settings-v1';
const DEF = { quality:'auto', rbc:true, dof:true, fg:true, edge:true, difficulty:'normal', gen:'' };
// only what the viewer chose is stored (validated on read: an old or hand-edited value
// must not break boot); the URL overrides below apply to this page load only
const stored = (()=>{
  const o = {};
  try {
    const s = JSON.parse(localStorage.getItem(SKEY) || 'null');
    if(!s || typeof s !== 'object' || Array.isArray(s)) return o;
    if(typeof s.quality === 'string' && /^(auto|high|medium|low)$/.test(s.quality)) o.quality = s.quality;
    for(const k of ['rbc', 'dof', 'fg', 'edge']) if(typeof s[k] === 'boolean') o[k] = s[k];
    if(typeof s.difficulty === 'string' && /^(easy|normal|hard)$/.test(s.difficulty)) o.difficulty = s.difficulty;
    if(typeof s.gen === 'string') o.gen = s.gen;
  } catch(e){}
  return o;
})();
const settings = Object.assign({}, DEF, stored);
function saveSettings(){ try { localStorage.setItem(SKEY, JSON.stringify(stored)); } catch(e){} }
function setSetting(k, v){ settings[k] = v; stored[k] = v; saveSettings(); }
{
  const q = QS.get('q'); if(q && /^(auto|high|medium|low)$/.test(q)) settings.quality = q;
  const flag = k => { const v = QS.get(k); return v == null ? null : !/^(0|off|false|no)$/i.test(v); };
  for(const k of ['rbc', 'dof', 'fg', 'edge']){ const v = flag(k); if(v != null) settings[k] = v; }
  const d = QS.get('diff'); if(d && /^(easy|normal|hard)$/.test(d)) settings.difficulty = d;
  if(QS.get('gen')) settings.gen = QS.get('gen');
}
const randomSeed = () => 1 + Math.floor(Math.random()*999999);
function parseSeed(s){
  s = String(s == null ? '' : s).trim();
  if(!s) return randomSeed();
  if(/^-?\d+$/.test(s)) return Math.abs(parseInt(s, 10)) % 2147483647 || 1;
  let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 999999 + 1;
}

// ============================================================================
//  state
// ============================================================================
const G = {
  net:null, R:null, S:null, seed:0,
  ready:false, loading:false, dead:false,
  userPaused:false, modalPaused:false, hiddenPaused:false, held:false,
  get paused(){ return this.userPaused || this.modalPaused || this.hiddenPaused || this.held; },
  time:0, acc:0, simDirty:true, endShown:null, frames:0, ticks:0, errors:0,
  infWarn:{}, dangerQ:-1, critical:false,          // near-defeat warnings (updateHud)
};
const glc = $('gl'), ov = $('ov'), octx = ov.getContext('2d');
const mm = $('mm'), mctx = mm.getContext('2d');
const V = { w:1, h:1, dpr:1, odpr:1 };              // css viewport, GL dpr, overlay dpr

const cam = { x:0, y:0, z:0.1 };
let lzGoal = Math.log(0.1), anchor = null, fly = null, zMin = 0.05;
// after the fly-in the idle horde still drifts to the vessel wall and settles there;
// the camera keeps it framed until then unless the player takes the camera
let introFollow = null;
const vel = { x:0, y:0 };                            // inertia (µm/s)
const keyV = { x:0, y:0 };                           // keyboard / edge pan (css px/s)
const lastCam = { x:NaN, y:NaN, z:NaN };
let animT = 0;                                       // UI clock (runs while paused)

const EMPTY_RBC = { data: new Float32Array(8), count: 0 };
let renderDirty = true;
const frameObj = { cam, time:0, pulse:0, rbcLOD:0, rbc:EMPTY_RBC, units:null, marks:[] };
const simCtx = { time:0, view:{ x0:0, y0:0, x1:0, y1:0 }, z:1, rbcLOD:0 };

const toWX = sx => cam.x + (sx - V.w/2)/cam.z;
const toWY = sy => cam.y + (sy - V.h/2)/cam.z;
const toSX = wx => (wx - cam.x)*cam.z + V.w/2;
const toSY = wy => (wy - cam.y)*cam.z + V.h/2;

// ============================================================================
//  quality / dynamic render scale
// ============================================================================
const LEVELS = [1, 0.85, 0.72, 0.6, 0.5];
const PRESETS = { auto:{ dpr:2, scale:null }, high:{ dpr:2, scale:1 }, medium:{ dpr:1.5, scale:0.75 }, low:{ dpr:1, scale:0.5 } };
const perf = { ema:16.7, fps:0, fc:0, ft:0, lvl:0, bad:0, good:0, blockUp:0, lastUp:-99, grace:0, gpuMs:undefined, statT:0, clock:0 };
function renderScale(){ const p = PRESETS[settings.quality] || PRESETS.auto; return p.scale != null ? p.scale : LEVELS[perf.lvl]; }
function applyQuality(){
  document.body.classList.toggle('noblur', settings.quality === 'low');
  if(G.R) G.R.setQuality({ scale: renderScale(), dof: !!settings.dof, fgCells: !!settings.fg });
  renderDirty = true;
}
function perfTick(dt){
  if(dt <= 0) return;
  const T = perf.clock += dt;                     // real time (grace / hysteresis must not stretch at low fps)
  const ms = dt*1000;
  // an isolated spike (a tile build, a GC) is capped relative to the EMA so it cannot
  // dominate it; a real move to a slower steady state still converges (the cap doubles)
  perf.ema += (Math.min(ms, 120, Math.max(33, 2*perf.ema)) - perf.ema)*0.08;
  perf.fc++; perf.ft += dt;
  if(perf.ft >= 0.5){ perf.fps = perf.fc/perf.ft; perf.fc = 0; perf.ft = 0; }
  if(settings.quality !== 'auto' || !G.ready || T < perf.grace || G.hiddenPaused) return;
  // frame time is the main signal; GPU time (when the renderer can measure it) catches a
  // GPU-bound frame that the rAF cadence hides for a moment, and tells a CPU-bound slow
  // phase (which a lower render scale cannot fix) from a GPU-bound one
  const gpuExplains = perf.gpuMs == null || perf.gpuMs > 0.6*perf.ema;
  if((perf.ema > 21.5 && gpuExplains) || perf.gpuMs > 19){ perf.bad += dt; perf.good = 0; }
  else if(perf.ema < 17.8 && !(perf.gpuMs > 12)){ perf.good += dt; perf.bad = Math.max(0, perf.bad - dt); }
  else { perf.bad = Math.max(0, perf.bad - 0.5*dt); perf.good = 0; }
  if(perf.bad > 0.9 && perf.lvl < LEVELS.length - 1){
    perf.lvl++; perf.bad = 0; perf.good = 0;
    // an upgrade that did not hold blocks further upgrades for a long while
    perf.blockUp = T + (T - perf.lastUp < 4 ? 45 : 6);
    applyQuality(); perf.grace = T + 0.6;
  } else if(perf.good > 5 && perf.lvl > 0 && T > perf.blockUp){
    perf.lvl--; perf.good = 0; perf.lastUp = T; applyQuality(); perf.grace = T + 0.6;
  }
}
function initialLevel(){
  // start big screens at a scale that keeps the world pass near 1080p
  const px = V.w*V.h*V.dpr*V.dpr, target = 2.3e6;
  let l = 0; while(l < LEVELS.length - 1 && px*LEVELS[l]*LEVELS[l] > target) l++;
  return l;
}

// ============================================================================
//  viewport
// ============================================================================
function resize(){
  const w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
  const h = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
  const dev = window.devicePixelRatio || 1;
  const P = PRESETS[settings.quality] || PRESETS.auto;
  V.w = w; V.h = h; V.dpr = Math.min(dev, P.dpr); V.odpr = Math.min(dev, 2);
  for(const c of [glc, ov]){ c.style.width = w + 'px'; c.style.height = h + 'px'; }
  const ow = Math.round(w*V.odpr), oh = Math.round(h*V.odpr);
  if(ov.width !== ow) ov.width = ow;
  if(ov.height !== oh) ov.height = oh;
  if(G.R) G.R.resize(w, h, V.dpr);
  if(G.net){
    // the minimap first: its height is part of the HUD band that computeZMin measures
    if(mmState.cssW !== (mm.clientWidth || 0) || mmState.dpr !== Math.min(window.devicePixelRatio || 1, 2)) buildMinimap();
    computeZMin();
    lzGoal = clamp(lzGoal, Math.log(zMin), Math.log(MAX_ZOOM));
    cam.z = clamp(cam.z, zMin, MAX_ZOOM);
    clampCam();
  }
  G.simDirty = true; renderDirty = true;
  panelRectsT = -1;
}
// the free vertical band between the top and the bottom row of HUD panels (css px);
// on layouts where the panels would leave almost no room the whole window is used
let hud = { t:0, b:0 };
function hudInsets(){
  refreshPanelRects();
  let t = 0, b = 0;
  for(const r of panelRects){ if(r.b < V.h*0.5) t = Math.max(t, r.b); else if(r.t > V.h*0.5) b = Math.max(b, V.h - r.t); }
  if(t + b > V.h*0.6){ t = b = 0; }
  return { t, b };
}
// world y offset of the free band's centre from the window centre at zoom z
const hudOffY = z => -(hud.t - hud.b)/(2*z);
function computeZMin(){
  const b = G.net.bounds;
  hud = hudInsets();
  zMin = Math.min(MAX_ZOOM, 0.98*Math.min(V.w/Math.max(1, b.x1 - b.x0), (V.h - hud.t - hud.b)/Math.max(1, b.y1 - b.y0)));
}

// ============================================================================
//  camera
// ============================================================================
// per axis: a view larger than the map is centred; a smaller one may show up to
// 15 % of a screen beyond the map edge (fading to 0 as the view nears the map
// size, so the whole-map view cannot be dragged away). `off` shifts the centred
// position (y: centre the map in the band between the HUD rows); the clamp range
// always admits it, so zooming in from the whole-map view does not jump.
function axisClamp(v, a0, a1, h, off){
  const L = Math.max(1, a1 - a0), r = 2*h/L, c = 0.5*(a0 + a1) + (off || 0);
  if(r >= 1) return c;
  const pad = 0.3*h*clamp((1 - r)/0.5, 0, 1);
  return clamp(v, Math.min(a0 + h - pad, c), Math.max(a1 - h + pad, c));
}
function clampCam(){
  if(!G.net) return;
  const b = G.net.bounds;
  const nx = axisClamp(cam.x, b.x0, b.x1, V.w/(2*cam.z), 0);
  const ny = axisClamp(cam.y, b.y0, b.y1, V.h/(2*cam.z), hudOffY(cam.z));
  if(nx !== cam.x){ vel.x = 0; cam.x = nx; }
  if(ny !== cam.y){ vel.y = 0; cam.y = ny; }
}
function zoomAt(sx, sy, dlz){
  if(!G.net) return;
  fly = null;
  lzGoal = clamp(lzGoal + clamp(dlz, -0.8, 0.8), Math.log(zMin), Math.log(MAX_ZOOM));
  anchor = { sx, sy, wx: toWX(sx), wy: toWY(sy) };
}
// wheel → log-zoom step; a trackpad pinch arrives as ctrl+wheel with small deltas
const wheelZoom = e => { let dy = e.deltaY; if(e.deltaMode === 1) dy *= 16; else if(e.deltaMode === 2) dy *= V.h; return -dy*(e.ctrlKey ? 0.011 : 0.0019); };
// van Wijk & Nuij "smooth and efficient zooming and panning" (the d3 formula)
function flyTo(x, y, z, maxT){
  z = clamp(z, zMin, MAX_ZOOM);
  const size = Math.max(V.w, V.h), rho = 1.3, rho2 = rho*rho, rho4 = rho2*rho2;
  const w0 = size/cam.z, w1 = size/z, x0 = cam.x, y0 = cam.y, dx = x - x0, dy = y - y0, d2 = dx*dx + dy*dy, d1 = Math.sqrt(d2);
  let S, at;
  if(d1 < 1e-3*Math.min(w0, w1)){
    const k = Math.log(w1/w0); S = Math.abs(k)/rho;
    at = s => ({ u: S > 0 ? s/S : 1, w: w0*Math.exp(S > 0 ? k*s/S : 0) });
  } else {
    const b0 = (w1*w1 - w0*w0 + rho4*d2)/(2*w0*rho2*d1), b1 = (w1*w1 - w0*w0 - rho4*d2)/(2*w1*rho2*d1);
    const r0 = Math.log(Math.sqrt(b0*b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1*b1 + 1) - b1);
    S = (r1 - r0)/rho;
    const c0 = Math.cosh(r0), s0 = Math.sinh(r0);
    at = s => ({ u: w0/(rho2*d1)*(c0*Math.tanh(rho*s + r0) - s0), w: w0*c0/Math.cosh(rho*s + r0) });
  }
  if(!(S > 1e-4)){ cam.x = x; cam.y = y; cam.z = z; lzGoal = Math.log(z); clampCam(); return; }
  fly = { t:0, T: clamp(0.62*S, 0.45, maxT || 2.4), S, at, x0, y0, dx, dy, size, z1: z };
  anchor = null; vel.x = vel.y = 0;
}
function stepCamera(dt){
  const c0x = cam.x, c0y = cam.y;
  if(fly){
    fly.t += dt;
    const f = clamp(fly.t/fly.T, 0, 1), e = f < 0.5 ? 4*f*f*f : 1 - Math.pow(-2*f + 2, 3)/2;
    const p = fly.at(e*fly.S);
    cam.x = fly.x0 + p.u*fly.dx; cam.y = fly.y0 + p.u*fly.dy; cam.z = clamp(fly.size/p.w, zMin, MAX_ZOOM);
    if(f >= 1){ cam.z = fly.z1; fly = null; }
    lzGoal = Math.log(cam.z);
  } else {
    const lz = Math.log(cam.z);
    if(Math.abs(lz - lzGoal) > 1e-4){
      const nl = lz + (lzGoal - lz)*(1 - Math.exp(-dt*13));
      cam.z = Math.exp(Math.abs(nl - lzGoal) < 1e-4 ? lzGoal : nl);
      if(anchor){ cam.x = anchor.wx - (anchor.sx - V.w/2)/cam.z; cam.y = anchor.wy - (anchor.sy - V.h/2)/cam.z; }
    } else { cam.z = Math.exp(lzGoal); anchor = null; }
    // inertia
    if(!gesture || gesture.kind !== 'pan' && gesture.kind !== 'pinch'){
      if(vel.x || vel.y){
        cam.x += vel.x*dt; cam.y += vel.y*dt;
        const k = Math.exp(-dt*4.2); vel.x *= k; vel.y *= k;
        if(Math.hypot(vel.x, vel.y)*cam.z < 4){ vel.x = 0; vel.y = 0; }
      }
    }
  }
  // keyboard + screen-edge pan (css px/s, eased)
  let kx = 0, ky = 0;
  if(!modalOpen()){
    if(keys.has('l')) kx -= 1; if(keys.has('r')) kx += 1; if(keys.has('u')) ky -= 1; if(keys.has('d')) ky += 1;
    if(settings.edge && mouse.inWorld && mouse.moved && mouse.type === 'mouse' && !gesture && !mouse.buttons && document.hasFocus()){
      const E = 9; let ex = 0, ey = 0;
      if(mouse.x < E) ex = -1; else if(mouse.x > V.w - E) ex = 1;
      if(mouse.y < E) ey = -1; else if(mouse.y > V.h - E) ey = 1;
      if(ex || ey){ mouse.edgeT += dt; if(mouse.edgeT > 0.28){ kx += ex; ky += ey; } } else mouse.edgeT = 0;
    } else mouse.edgeT = 0;
  }
  const kl = Math.hypot(kx, ky), sp = keys.has('shift') ? 1900 : 950;
  const tx = kl ? kx/kl*sp : 0, ty = kl ? ky/kl*sp : 0, ke = 1 - Math.exp(-dt*(kl ? 9 : 12));
  keyV.x += (tx - keyV.x)*ke; keyV.y += (ty - keyV.y)*ke;
  if(Math.abs(keyV.x) < 2 && !kl) keyV.x = 0;
  if(Math.abs(keyV.y) < 2 && !kl) keyV.y = 0;
  if(keyV.x || keyV.y){
    if(kl) fly = null;
    cam.x += keyV.x*dt/cam.z; cam.y += keyV.y*dt/cam.z;
    if(anchor){ anchor.wx += keyV.x*dt/cam.z; anchor.wy += keyV.y*dt/cam.z; }
  }
  clampCam();
  if(anchor && (cam.x !== c0x || cam.y !== c0y) && Math.abs(Math.log(cam.z) - lzGoal) <= 1e-4) anchor = null;
}
function camMoved(){
  const m = cam.x !== lastCam.x || cam.y !== lastCam.y || cam.z !== lastCam.z;
  lastCam.x = cam.x; lastCam.y = cam.y; lastCam.z = cam.z;
  return m;
}
function comfortZoom(x, y){
  let rB = 300;
  try { const o = G.net.evalAt(x, y, {}); if(o && o.N < 1 && o.rB > 20) rB = o.rB; } catch(e){}
  const span = Math.sqrt(V.w*V.h);
  const zUnit = 12/WBC_R;           // a white cell ≈ 12 css px in radius: the full glassy cell with its face (past the icon blend)
  return clamp(Math.max(0.95*span/(2*rB), zUnit), Math.min(zMin*1.5, MAX_ZOOM), MAX_ZOOM*0.5);
}
// the fly-in zoom: the comfortable unit zoom, but wide enough that a settling horde
// (a clump ~160 µm in radius on the wall) stays inside the band between the HUD rows
function startZoom(c){
  const band = Math.max(120, Math.min(V.w, V.h - hud.t - hud.b));
  return clamp(Math.min(comfortZoom(c.x, c.y), 0.5*band/160), Math.min(zMin*1.5, MAX_ZOOM), MAX_ZOOM);
}
function stepIntroFollow(dt){
  const f = introFollow;
  if(!f) return;
  // the player took the camera (zoom, drag, pinch, keys, a jump elsewhere) or time is up
  if(f.net !== G.net || animT > f.until || anchor || gesture || keyV.x || keyV.y || vel.x || vel.y || (fly && !fly.intro)){ introFollow = null; return; }
  if(fly) return;                                   // still flying in
  if(animT >= f.next){ f.next = animT + 0.25; f.c = hordeCenter(false); }
  if(!f.c) return;
  const k = 1 - Math.exp(-dt*2.2), ty = f.c.y + hudOffY(cam.z);
  cam.x += (f.c.x - cam.x)*k; cam.y += (ty - cam.y)*k;
}
function overview(){ const b = G.net.bounds; flyTo(0.5*(b.x0 + b.x1), 0.5*(b.y0 + b.y1) + hudOffY(zMin), zMin); }

// ============================================================================
//  units buffer helpers (instance layout from the spec: 16 floats)
// ============================================================================
const U_TYPE = 3, U_FLAGS = 6;
const F_SEL = 1, F_DIE = 8;
function unitsBuf(){ const u = G.S && G.S.units; return u && u.data && u.count > 0 ? u : null; }
// the densest cluster of (selected) white cells: 240 µm bins, then the centroid around the best bin
function hordeCenter(selOnly){
  const U = unitsBuf();
  if(!U){ const h = G.S && G.S.home; return h && isFinite(h.x) ? { x:h.x, y:h.y, n:0 } : null; }
  const d = U.data, n = U.count, cs = 240, cnt = new Map();
  let bk = 0, bc = 0, tot = 0;
  for(let i=0;i<n;i++){
    const o = i*16; if(d[o + U_TYPE] !== 0) continue;
    const f = d[o + U_FLAGS]; if(f & F_DIE) continue; if(selOnly && !(f & F_SEL)) continue;
    const k = Math.floor(d[o]/cs)*100003 + Math.floor(d[o+1]/cs);
    const c = (cnt.get(k) || 0) + 1; cnt.set(k, c); tot++;
    if(c > bc){ bc = c; bk = k; }
  }
  if(!tot){ if(selOnly) return null; const h = G.S && G.S.home; return h && isFinite(h.x) ? { x:h.x, y:h.y, n:0 } : null; }
  let gx = Math.round(bk/100003), gy = bk - gx*100003;
  if(gy > 50000){ gx++; gy -= 100003; } else if(gy < -50000){ gx--; gy += 100003; }
  const cx = (gx + 0.5)*cs, cy = (gy + 0.5)*cs;
  let sx = 0, sy = 0, m = 0;
  for(let i=0;i<n;i++){
    const o = i*16; if(d[o + U_TYPE] !== 0) continue;
    const f = d[o + U_FLAGS]; if(f & F_DIE) continue; if(selOnly && !(f & F_SEL)) continue;
    if(Math.abs(d[o] - cx) < 2*cs && Math.abs(d[o+1] - cy) < 2*cs){ sx += d[o]; sy += d[o+1]; m++; }
  }
  return m ? { x: sx/m, y: sy/m, n: tot } : { x:cx, y:cy, n: tot };
}
function unitNear(wx, wy, rad){
  const U = unitsBuf(); if(!U) return false;
  const d = U.data;
  for(let i=0;i<U.count;i++){
    const o = i*16; if(d[o + U_TYPE] !== 0 || (d[o + U_FLAGS] & F_DIE)) continue;
    const dx = d[o] - wx, dy = d[o+1] - wy, rr = rad + d[o+2];
    if(dx*dx + dy*dy < rr*rr) return true;
  }
  return false;
}
function countInRect(x0, y0, x1, y1){
  const U = unitsBuf(); if(!U) return 0;
  const d = U.data, ax = Math.min(x0, x1), bx = Math.max(x0, x1), ay = Math.min(y0, y1), by = Math.max(y0, y1);
  let n = 0;
  for(let i=0;i<U.count;i++){
    const o = i*16; if(d[o + U_TYPE] !== 0 || (d[o + U_FLAGS] & F_DIE)) continue;
    if(d[o] >= ax && d[o] <= bx && d[o+1] >= ay && d[o+1] <= by) n++;
  }
  return n;
}
const selCount = () => (G.S && G.S.stats && G.S.stats.selected) | 0;

// ============================================================================
//  game actions
// ============================================================================
const markers = [], popups = [], pings = [];
let pathPrev = null;
function pushLimited(arr, item, max){ arr.push(item); if(arr.length > max) arr.splice(0, arr.length - max); }
function giveOrder(wx, wy){
  const S = G.S; if(!S) return;
  const had = selCount(), ser0 = maxOrderSerial();
  let r;
  try { r = S.command(wx, wy) || { ok:false, x:wx, y:wy }; } catch(e){ r = { ok:false, x:wx, y:wy }; console.error(e); }
  const x = isFinite(r.x) ? r.x : wx, y = isFinite(r.y) ? r.y : wy;
  pushLimited(markers, { x, y, t0: animT, ok: !!r.ok, attack: !!r.attack }, 12);
  if(!r.ok){
    if(!had) toast('Select white cells first', 'info', 'nosel', 4);
    else toast('No way through to there', 'warn', 'noreach', 3);
    return false;
  }
  G.simDirty = true;
  startPathPreview(r, ser0);
  return true;
}
// the newest order: [slot, serial] (serials only grow), or [-1, -1]
function newestOrder(){
  const O = G.S && G.S.orders; let slot = -1, ser = -1;
  if(Array.isArray(O)) O.forEach((o, i) => { if(o && o.serial > ser){ ser = o.serial; slot = i; } });
  return [slot, ser];
}
const maxOrderSerial = () => newestOrder()[1];
// r: what S.command returned. When it names the order ({slot, serial}) the preview uses
// it; otherwise the preview waits for the first order newer than ser0 (the newest serial
// before the command) — S.orders may only publish it on the next S.update.
function startPathPreview(r, ser0){
  const S = G.S;
  pathPrev = null;
  if(!S || typeof S.tracePath !== 'function' || !Array.isArray(S.orders)) return;
  let slot = -1, ser = -1;
  if(r && Number.isInteger(r.slot) && r.serial > 0){ slot = r.slot; ser = r.serial; }
  pathPrev = { slot, serial: ser, after: ser0 == null ? -1 : ser0, t0: animT, calcT: -1, pts: new Float32Array(2*240), n: 0 };
  adoptPathOrder(pathPrev);
}
function adoptPathOrder(P){
  if(P.slot >= 0) return true;
  const [slot, ser] = newestOrder();
  if(slot < 0 || ser <= P.after) return false;
  P.slot = slot; P.serial = ser;
  return true;
}
let lastAll = -1;          // selection count right after "select all" (a second press clears)
function selectAll(){
  const S = G.S; if(!S) return;
  if(lastAll > 0 && selCount() === lastAll){ S.clearSelection(); lastAll = -1; }
  else { const n = S.selectAll(); lastAll = typeof n === 'number' ? n : -2; }
  G.simDirty = true;
}
function selectVisible(additive){
  const S = G.S; if(!S) return;
  S.selectInRect(toWX(0), toWY(0), toWX(V.w), toWY(V.h), !!additive);
  G.simDirty = true;
}
function goHome(){
  if(!G.S || !G.net) return;
  const c = hordeCenter(true) || hordeCenter(false);
  if(!c){ overview(); return; }
  const z = comfortZoom(c.x, c.y);
  const near = Math.hypot(cam.x - c.x, cam.y - c.y)*cam.z < 60 && Math.abs(Math.log(cam.z/z)) < 0.25;
  if(near) overview(); else flyTo(c.x, c.y, z);
}
function setUserPause(p){ G.userPaused = !!p; updatePauseUi(); }
function restart(){
  closeModals();
  G.endShown = null; resetDanger();
  if(G.S){
    if(settings.difficulty !== G.S._difficultyFromMain && typeof G.S.setDifficulty !== 'function'){
      G.S = BV.createSim(G.net, { seed: G.seed, difficulty: settings.difficulty });
      G.S._difficultyFromMain = settings.difficulty;
    } else G.S.reset(G.seed);
  }
  G.acc = 0; G.time = 0; G.simDirty = true;
  markers.length = 0; popups.length = 0; pings.length = 0; pathPrev = null;
  setUserPause(false);
  hudCache.clear();
  G.S.update(0, fillSimCtx());
  const c = hordeCenter(false);
  if(c) flyTo(c.x, c.y, comfortZoom(c.x, c.y));
  toast('Restarted — ' + simName(G.seed), 'info');
}

// ============================================================================
//  boot / map loading
// ============================================================================
const paint = () => new Promise(res => {
  if(document.hidden) setTimeout(res, 0);
  else requestAnimationFrame(() => setTimeout(res, 0));
});
function setLoad(msg){ $('load-s').textContent = msg; }
function showLoading(msg){ const L = $('loading'); L.classList.remove('hide'); L.style.display = ''; setLoad(msg); }
function hideLoading(){ const L = $('loading'); L.classList.add('hide'); setTimeout(() => { if(L.classList.contains('hide')) L.style.display = 'none'; }, 700); }
function showError(title, msg, err){
  G.dead = true; G.ready = false;
  $('loading').style.display = 'none';
  $('err-t').textContent = title;
  if(msg) $('err-p').textContent = msg;
  const pre = $('err-pre');
  if(err){ pre.hidden = false; pre.textContent = String(err && err.stack ? err.message + '\n' + err.stack.split('\n').slice(1, 5).join('\n') : err); }
  $('error').classList.add('show');
  if(err) console.error(err);
}
function webgl2Available(){
  if(typeof WebGL2RenderingContext === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if(!gl) return false;
    const ext = gl.getExtension('WEBGL_lose_context'); if(ext) ext.loseContext();
    return true;
  } catch(e){ return false; }
}
function genOpts(){
  const o = {};
  const gens = BV.GENERATORS || {};
  if(settings.gen && gens[settings.gen]) o.generator = settings.gen;
  return o;
}
async function loadMap(seed, first){
  if(G.loading) return;
  G.loading = true; G.ready = false;
  introFollow = null;
  clearOverlay();
  closeModals();
  showLoading(first ? 'growing the vessel network…' : 'growing a new vessel network…');
  await paint();
  let net;
  const t0 = now();
  try {
    const gen = BV.generate(seed, genOpts());
    setLoad('solving blood flow…'); await paint();
    net = BV.buildNet(gen);
  } catch(err){
    G.loading = false;
    // a new map that fails to grow leaves the running one untouched: go back to it
    if(!first && G.net && G.R && G.S){
      console.error(err);
      G.ready = true; lastTs = 0; hideLoading();
      toast('Seed ' + seed + ' failed to grow — try another', 'bad');
      return;
    }
    return showError('The map could not be generated', 'The vessel generator failed for seed ' + seed + '. Reload to try another seed.', err);
  }
  const tGen = now() - t0;
  setLoad('warming up the renderer…'); await paint();
  try {
    if(!G.R) G.R = BV.createRenderer(glc, net, { preserveDrawingBuffer: PDB });
    else if(typeof G.R.setNet === 'function') G.R.setNet(net);
    else { G.R.destroy(); G.R = BV.createRenderer(glc, net, { preserveDrawingBuffer: PDB }); }
  } catch(err){ G.loading = false; return showError('The renderer could not start', 'WebGL2 is present but the vessel renderer failed to initialise on this GPU.', err); }
  setLoad('culturing neutrophils…'); await paint();
  try {
    G.S = BV.createSim(net, { seed, difficulty: settings.difficulty });
    G.S._difficultyFromMain = settings.difficulty;
  } catch(err){ G.loading = false; return showError('The simulation could not start', 'The white-cell simulation failed to initialise.', err); }
  try {
    G.net = net; G.seed = seed; G.time = 0; G.acc = 0; G.endShown = null; G.simDirty = true; tilesDone = false; pwNext = 0;
    markers.length = 0; popups.length = 0; pings.length = 0; pathPrev = null;
    hudCache.clear(); resetDanger();
    resize();
    if(first) perf.lvl = settings.quality === 'auto' ? initialLevel() : 0;
    applyQuality();
    // let the nav grid / physics tiles build before the first frame (bounded)
    setLoad('charting the currents…');
    const tEnd = now() + 2200;
    while(now() < tEnd){
      let done = true;
      try { if(typeof G.S.prewarm === 'function') done = !!G.S.prewarm(28); } catch(e){ done = true; }
      try { if(net.sample && net.sample.prewarm) net.sample.prewarm(6); } catch(e){}
      if(done) break;
      await paint();
    }
    buildMinimap(); computeZMin();      // the new map's minimap height changes the HUD band
    // camera: whole map (centred in the band between the HUD rows), then fly into the horde
    const b = net.bounds;
    cam.x = 0.5*(b.x0 + b.x1); cam.y = 0.5*(b.y0 + b.y1) + hudOffY(zMin); cam.z = zMin; lzGoal = Math.log(zMin);
    anchor = null; fly = null; vel.x = vel.y = 0;
    G.S.update(0, fillSimCtx());
    const c = hordeCenter(false);
    $('h-mapname').textContent = '#' + seed;
    $('s-seed').value = String(seed);
    try { const u = new URL(location.href); u.searchParams.set('seed', seed); if(settings.gen) u.searchParams.set('gen', settings.gen); else u.searchParams.delete('gen'); history.replaceState(null, '', u.href); } catch(e){}
    G.ready = true; G.loading = false; lastTs = 0;
    clearOverlay();
    perf.grace = perf.clock + 1.5;
    hideLoading();
    console.info('[horde] map', seed, 'generated + built in', tGen.toFixed(0), 'ms,', net.chains.length, 'chains,', net.beziers.length, 'Béziers');
    if(c) setTimeout(() => {
      if(G.net !== net || fly || gesture) return;
      flyTo(c.x, c.y + hudOffY(startZoom(c)), startZoom(c), 2.6);
      if(fly) fly.intro = true;
      introFollow = { net, until: animT + 9, next: 0 };
    }, 350);
    setTimeout(() => {
      if(G.net !== net) return;
      toast(touchUi ? 'Tap a white cell to select its horde · tap to send it' : 'Drag to select white cells · right-click to send them · wheel to zoom', 'info', 'hint', 60, 5200);
    }, first ? 2600 : 1500);
  } catch(err){
    G.loading = false;
    return showError('The map could not be started', 'The map was generated but could not be prepared. Try another seed.', err);
  }
}
async function newMap(seed){
  if(G.loading) return;
  await loadMap(seed == null ? randomSeed() : seed, false);
}

// ============================================================================
//  main loop
// ============================================================================
let raf = 0, lastTs = 0;
const SIM_H = 1/120, SIM_MAXN = 6;
function fillSimCtx(){
  const vx0 = toWX(0), vy0 = toWY(0), vx1 = toWX(V.w), vy1 = toWY(V.h);
  const m = Math.max(12, 0.06*Math.max(vx1 - vx0, vy1 - vy0));
  simCtx.view.x0 = vx0 - m; simCtx.view.y0 = vy0 - m; simCtx.view.x1 = vx1 + m; simCtx.view.y1 = vy1 + m;
  simCtx.z = cam.z; simCtx.rbcLOD = rbcLOD(); simCtx.time = G.time;
  return simCtx;
}
const rbcLOD = () => settings.rbc ? smoothstep(2.5, 6, 2*RBC_R*cam.z) : 0;
function tick(ts){
  if(G.dead){ raf = 0; return; }
  raf = requestAnimationFrame(tick);
  const t = ts/1000;
  let dt = lastTs ? t - lastTs : 1/60; lastTs = t;
  // the quality monitor sees the real frame time (capped); only multi-second stalls
  // (debugger, a frozen tab) are ignored - tab switches reset the clock anyway
  if(dt > 0 && dt < 3) perfTick(Math.min(dt, 0.5));
  if(!(dt > 0)) dt = 0; if(dt > 0.1) dt = 0.1;
  animT += dt; G.ticks++;
  if(!G.ready || G.dead) return;
  try {
    stepCamera(dt);
    stepIntroFollow(dt);
    const moved = camMoved();
    // ---- simulation: whole fixed steps ----------------------------------
    let simDt = 0;
    if(!G.paused){
      G.acc += dt;
      let n = Math.floor(G.acc/SIM_H);
      if(n > SIM_MAXN){ n = SIM_MAXN; G.acc = 0; } else G.acc -= n*SIM_H;
      simDt = n*SIM_H;
    }
    let updated = false;
    if(simDt > 0 || moved || G.simDirty){
      fillSimCtx(); simCtx.time = G.time + simDt;
      G.S.update(simDt, simCtx);
      G.time += simDt; G.simDirty = false; updated = true;
      if(simDt > 0 || moved) hoverDirty = true;
    }
    drainEvents();
    if(hoverDirty && animT - hoverT > 0.06) doHover();
    // ---- render (skipped while paused with a still camera) --------------
    const lod = rbcLOD();
    if(updated || renderDirty || !G.paused){
      frameObj.time = G.time;
      frameObj.pulse = G.S.pulse != null ? G.S.pulse : (BV.heart ? BV.heart(G.time, 66) : 0);
      frameObj.rbcLOD = lod;
      frameObj.rbc = lod > 0 && G.S.rbc ? G.S.rbc : EMPTY_RBC;
      frameObj.units = G.S.units || null;
      G.R.render(frameObj);
      renderDirty = false;
      G.frames++;
    }
    drawOverlay();
    if(animT - mmState.t > 1/12){ mmState.t = animT; drawMinimap(); }
    if(animT - hudT > 0.2){ hudT = animT; updateHud(); }
    if(perf.clock - perf.statT > 0.5){ perf.statT = perf.clock; try { const s = G.R.stats && G.R.stats(); perf.gpuMs = s && s.gpuMs; if(dbgEl) updateDebug(s); } catch(e){} }
    // idle time: finish the physics tiles, a small budget every frame (scaled by headroom,
    // so slow devices still make progress). A sampler that can only build whole tiles
    // overshoots the budget: the calls are then spaced so the average stays near it.
    if(!tilesDone && G.ticks >= pwNext && G.net.sample && G.net.sample.prewarm){
      const bud = perf.ema < 12 ? 1.5 : perf.ema < 17 ? 0.75 : 0.3, p0 = now();
      if(!G.net.sample.prewarm(bud)) tilesDone = true;
      const over = now() - p0 - bud;
      pwNext = G.ticks + (over > 1 ? Math.min(30, Math.ceil(over/bud)) : 0);
    }
    G.errors = 0;
  } catch(err){
    G.errors++;
    console.error(err);
    if(G.errors === 1) toast('Error: ' + (err && err.message || err), 'bad', 'err', 5);
    if(G.errors > 30){ cancelAnimationFrame(raf); raf = 0; showError('Something went wrong', 'The game loop stopped after repeated errors.', err); }
  }
}
let hudT = 0, tilesDone = false, pwNext = 0;

// ============================================================================
//  events → toasts, pop-ups, pings
// ============================================================================
let deathAcc = 0, deathT = 0;
function drainEvents(){
  const E = G.S.events;
  if(!E || !E.length) return;
  for(let i=0;i<E.length;i++) handleEvent(E[i]);
  E.length = 0;
}
function handleEvent(e){
  if(!e) return;
  switch(e.type){
    case 'capture':
      pushLimited(popups, { x:e.x, y:e.y, t0:animT, text:'+' + (e.score != null ? e.score : 10), col: e.kind === 'bacterium' ? '#b5ff7a' : '#ffae63' }, 40);
      break;
    case 'siteDown':
      pushLimited(popups, { x:e.x, y:e.y, t0:animT, text:'+' + (e.score != null ? e.score : 250), col:'#eaff7a', big:true }, 40);
      toast('Infection site destroyed' + (e.score ? '  +' + e.score : ''), 'good');
      break;
    case 'siteUp':
      pushLimited(pings, { x:e.x, y:e.y, t0:animT, col:'#e1f25a', n:3 }, 16);
      toast('New infection site' + (e.kind ? ' (' + e.kind + ')' : ''), 'warn', 'siteUp', 2.5);
      break;
    case 'wave':
      toast('Wave ' + (e.wave != null ? e.wave : '') + (e.sites ? ' — ' + e.sites + ' new infection site' + (e.sites === 1 ? '' : 's') : ''), 'warn', 'wave', 1);
      break;
    case 'spawn':
      pushLimited(pings, { x:e.x, y:e.y, t0:animT, col:'#7ff0ff', n:2 }, 16);
      toast('Reinforcements' + (e.n ? ': +' + e.n + ' neutrophils' : ''), 'info', 'spawn', 12);
      break;
    case 'escape':
      toast('A ' + (e.kind || 'pathogen') + ' escaped into the circulation', 'bad', 'escape', 6);
      break;
    case 'death':
      deathAcc++;
      if(animT - deathT > 6){ deathT = animT; toast(deathAcc + ' neutrophil' + (deathAcc === 1 ? '' : 's') + ' exhausted', 'warn', null); deathAcc = 0; }
      break;
    case 'over': case 'won':
      showEnd(e.type, e.score);
      break;
  }
}

// ============================================================================
//  toasts
// ============================================================================
const toastBox = $('toasts'), toastLast = new Map();
function toast(msg, cls, key, minGap, dur){
  if(key){ const t = toastLast.get(key); if(t != null && animT - t < (minGap || 3)) return false; toastLast.set(key, animT); }
  const el = document.createElement('div');
  el.className = 'toast ' + (cls || '');
  el.textContent = msg;
  toastBox.appendChild(el);
  while(toastBox.children.length > 4) toastBox.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 520); }, dur || 3200);
  return true;
}

// ============================================================================
//  input
// ============================================================================
const touchUi = (navigator.maxTouchPoints || 0) > 0 && matchMedia('(pointer: coarse)').matches;
document.body.classList.toggle('touch', touchUi);
const keys = new Set();
const mouse = { x:-1, y:-1, inWorld:false, type:'mouse', buttons:0, edgeT:0, moved:false };
const ptrs = new Map();
let gesture = null, lpTimer = 0, lastClick = null, spaceDown = false, hoverDirty = false, hoverT = 0, hoverOn = false;
const LP_MS = 430, TAP_SLOP = 10, CLICK_SLOP = 5;

function setCursor(){
  ov.classList.toggle('grab', spaceDown && !(gesture && gesture.kind === 'pan'));
  ov.classList.toggle('grabbing', !!(gesture && gesture.kind === 'pan' && gesture.mouse));
  ov.classList.toggle('pick', hoverOn && !gesture && !spaceDown);
}
function trackVel(p, t){
  p.hist.push(t, p.x, p.y);
  while(p.hist.length > 3 && t - p.hist[0] > 110) p.hist.splice(0, 3);
}
function releaseVel(p){
  const H = p.hist, t = now();
  if(H.length < 6 || t - H[H.length - 3] > 70) return;
  const dt = (H[H.length - 3] - H[0])/1000; if(dt < 0.012) return;
  const vx = (H[H.length - 2] - H[1])/dt, vy = (H[H.length - 1] - H[2])/dt;
  const sp = Math.hypot(vx, vy), cap = 4000, k = sp > cap ? cap/sp : 1;
  vel.x = -vx*k/cam.z; vel.y = -vy*k/cam.z;
}
function panBy(dx, dy){
  cam.x -= dx/cam.z; cam.y -= dy/cam.z;
  if(anchor){ anchor.wx -= dx/cam.z; anchor.wy -= dy/cam.z; }
  fly = null;
}
function onDown(e){
  if(!G.ready) return;
  e.preventDefault();
  try { ov.focus({ preventScroll:true }); } catch(_){}
  try { ov.setPointerCapture(e.pointerId); } catch(_){}
  const t = now();
  const p = { id:e.pointerId, x:e.clientX, y:e.clientY, x0:e.clientX, y0:e.clientY, t0:t, ts0:e.timeStamp, hist:[] };
  ptrs.set(e.pointerId, p);
  trackVel(p, t);
  fly = null;
  const isMouse = e.pointerType === 'mouse';
  mouse.type = e.pointerType;
  if(!isMouse){
    if(ptrs.size === 1){
      vel.x = vel.y = 0;
      gesture = { kind:'tpend', p };
      clearTimeout(lpTimer);
      lpTimer = setTimeout(() => {
        if(gesture && gesture.kind === 'tpend' && gesture.p === p){
          gesture = { kind:'tbox', p, sx:p.x0, sy:p.y0, wx:toWX(p.x0), wy:toWY(p.y0), ex:p.x, ey:p.y, t0:animT };
          try { navigator.vibrate && navigator.vibrate(12); } catch(_){}
        }
      }, LP_MS);
    } else if(ptrs.size === 2) startPinch();
    return;
  }
  // mouse
  if(e.button === 0 && !spaceDown){
    gesture = { kind:'mpend', p, shift:e.shiftKey, mouse:true };
  } else if(e.button === 1 || (e.button === 0 && spaceDown)){
    vel.x = vel.y = 0;
    gesture = { kind:'pan', p, mouse:true };
  } else if(e.button === 2){
    ptrs.delete(e.pointerId);
    giveOrder(toWX(e.clientX), toWY(e.clientY));
  }
  setCursor();
}
function startPinch(){
  clearTimeout(lpTimer);
  const it = ptrs.values(), a = it.next().value, b = it.next().value;
  const mx = 0.5*(a.x + b.x), my = 0.5*(a.y + b.y);
  gesture = { kind:'pinch', a, b, d0: Math.max(12, Math.hypot(a.x - b.x, a.y - b.y)), z0: cam.z, wx: toWX(mx), wy: toWY(my), hist:[], x:mx, y:my };
  anchor = null; fly = null; vel.x = vel.y = 0;
  trackVel(gesture, now());
}
function onMove(e){
  if(e.pointerType === 'mouse'){ mouse.x = e.clientX; mouse.y = e.clientY; mouse.inWorld = true; mouse.type = 'mouse'; mouse.buttons = e.buttons; mouse.moved = true; hoverDirty = true; }
  const p = ptrs.get(e.pointerId);
  if(!p || !gesture) return;
  e.preventDefault();
  const px = p.x, py = p.y, t = now();
  p.x = e.clientX; p.y = e.clientY;
  trackVel(p, t);
  const g = gesture;
  switch(g.kind){
    case 'mpend':
      if(Math.hypot(p.x - p.x0, p.y - p.y0) > CLICK_SLOP){ gesture = { kind:'box', p, sx:p.x0, sy:p.y0, wx:toWX(p.x0), wy:toWY(p.y0), ex:p.x, ey:p.y, shift:g.shift, mouse:true }; hoverAt(null); }
      break;
    case 'tbox':
      // moves are delivered frame-aligned: on a slow frame the long-press timer can fire
      // before a drag that had already started reaches us. Judge by the event time.
      if(!g.moved && e.timeStamp - p.ts0 < LP_MS && Math.hypot(p.x - p.x0, p.y - p.y0) > TAP_SLOP){
        gesture = { kind:'pan', p };
        panBy(p.x - p.x0, p.y - p.y0);
        break;
      }
      g.moved = true; g.ex = p.x; g.ey = p.y;
      break;
    case 'box':
      g.ex = p.x; g.ey = p.y;
      break;
    case 'pan':
      panBy(p.x - px, p.y - py);
      break;
    case 'tpend':
      if(Math.hypot(p.x - p.x0, p.y - p.y0) > TAP_SLOP){
        clearTimeout(lpTimer);
        gesture = { kind:'pan', p };
        panBy(p.x - p.x0, p.y - p.y0);
      }
      break;
    case 'pinch': {
      if(p !== g.a && p !== g.b) break;
      const a = g.a, b = g.b, d = Math.max(12, Math.hypot(a.x - b.x, a.y - b.y));
      const mx = 0.5*(a.x + b.x), my = 0.5*(a.y + b.y);
      const z = clamp(g.z0*d/g.d0, zMin, MAX_ZOOM);
      cam.z = z; lzGoal = Math.log(z);
      cam.x = g.wx - (mx - V.w/2)/z; cam.y = g.wy - (my - V.h/2)/z;
      clampCam();
      g.x = mx; g.y = my; trackVel(g, t);
      break;
    }
  }
  setCursor();
}
function onUp(e, cancelled){
  const p = ptrs.get(e.pointerId);
  if(!p) return;
  ptrs.delete(e.pointerId);
  const g = gesture;
  if(!g){ return; }
  if(g.kind === 'pinch'){
    if(ptrs.size === 1){
      // the remaining finger keeps panning (never taps)
      const q = ptrs.values().next().value;
      q.x0 = q.x; q.y0 = q.y; q.hist.length = 0; trackVel(q, now());
      gesture = { kind:'pan', p:q };
    } else if(ptrs.size === 0){ releaseVel(g); gesture = null; }
    else if(p === g.a || p === g.b) startPinch();       // a third finger was down: pinch with the remaining pair
    setCursor();
    return;
  }
  if(g.p !== p){ return; }
  clearTimeout(lpTimer);
  if(!cancelled){
    switch(g.kind){
      case 'mpend': mouseClick(p, g.shift); break;
      case 'box': finishBox(g, g.shift); break;
      case 'tbox':
        // released before the long-press time (the timer only won the race on a busy frame): a tap
        if(!g.moved && e.timeStamp - p.ts0 < LP_MS) tap(p); else finishBox(g, false, true);
        break;
      case 'tpend':
        if(e.timeStamp - p.ts0 >= LP_MS){ G.S.clearSelection(); toast('Selection cleared', 'info', 'clr', 1.5); G.simDirty = true; }
        else tap(p);
        break;
      case 'pan': releaseVel(p); break;
    }
  }
  gesture = ptrs.size ? gesture : null;
  if(gesture && gesture.p === p) gesture = null;
  setCursor();
}
function mouseClick(p, shift){
  const S = G.S; if(!S) return;
  const t = now();
  if(lastClick && t - lastClick.t < 340 && Math.hypot(p.x - lastClick.x, p.y - lastClick.y) < 8){
    lastClick = null; selectVisible(shift); return;
  }
  lastClick = { t, x:p.x, y:p.y };
  const wx = toWX(p.x), wy = toWY(p.y);
  const n = S.selectAt(wx, wy, 10/cam.z, shift);
  if(!n && !shift) S.clearSelection();
  if(n) pushLimited(markers, { x:wx, y:wy, t0:animT, sel:true }, 12);
  G.simDirty = true;
}
function tap(p){
  const S = G.S; if(!S) return;
  const wx = toWX(p.x), wy = toWY(p.y), pr = 22/cam.z;
  // a unit under the finger selects its horde; otherwise the tap is an order
  if(unitNear(wx, wy, pr) || !selCount()){
    const n = S.selectAt(wx, wy, pr, false);
    if(n){ pushLimited(markers, { x:wx, y:wy, t0:animT, sel:true }, 12); G.simDirty = true; return; }
    if(!selCount()){ toast('Tap a white cell to select its horde', 'info', 'taphint', 8); return; }
  }
  giveOrder(wx, wy);
}
function finishBox(g, additive, touch){
  const S = G.S; if(!S) return;
  const small = Math.abs(g.ex - g.sx) < 8 && Math.abs(g.ey - g.sy) < 8;
  if(small){
    if(touch){ S.clearSelection(); toast('Selection cleared', 'info', 'clr', 1.5); G.simDirty = true; }
    return;
  }
  S.selectInRect(g.wx, g.wy, toWX(g.ex), toWY(g.ey), !!additive);
  G.simDirty = true;
}
function hoverAt(wx, wy){
  const S = G.S;
  if(!S || typeof S.hoverAt !== 'function') return 0;
  try { return wx == null ? S.hoverAt(null) : S.hoverAt(wx, wy, 10/cam.z); } catch(e){ return 0; }
}
function doHover(){
  hoverDirty = false; hoverT = animT;
  let n = 0;
  if(mouse.type === 'mouse' && mouse.inWorld && !gesture && !modalOpen()) n = hoverAt(toWX(mouse.x), toWY(mouse.y));
  else if(hoverOn) hoverAt(null);
  const on = n > 0;
  if(on !== hoverOn){ hoverOn = on; setCursor(); }
}

function bindInput(){
  ov.addEventListener('pointerdown', onDown);
  ov.addEventListener('pointermove', onMove);
  ov.addEventListener('pointerup', e => onUp(e, false));
  ov.addEventListener('pointercancel', e => onUp(e, true));
  ov.addEventListener('lostpointercapture', e => { if(ptrs.has(e.pointerId)) onUp(e, true); });
  ov.addEventListener('pointerleave', e => { if(e.pointerType === 'mouse'){ mouse.inWorld = false; hoverDirty = true; } });
  ov.addEventListener('pointerenter', e => { if(e.pointerType === 'mouse'){ mouse.x = e.clientX; mouse.y = e.clientY; mouse.inWorld = true; } });
  ov.addEventListener('contextmenu', e => e.preventDefault());
  ov.addEventListener('wheel', e => {
    e.preventDefault();
    if(!G.ready) return;
    zoomAt(e.clientX, e.clientY, wheelZoom(e));
  }, { passive:false });
  // WebKit (macOS Safari) reports a trackpad pinch as gesture events, not ctrl+wheel
  let gScale = 1, lastCtrlWheel = -1e9;
  document.addEventListener('gesturestart', e => { e.preventDefault(); gScale = 1; });
  document.addEventListener('gesturechange', e => {
    e.preventDefault();
    const s = e.scale || 1, prev = gScale; gScale = s;
    if(!G.ready || modalOpen() || ptrs.size || !(s > 0) || !(prev > 0)) return;   // touch pinch: the pointer handlers own it
    if(now() - lastCtrlWheel < 250) return;                                      // the engine also sent ctrl+wheel: no double zoom
    const onWorld = e.target === ov; if(!onWorld && e.target !== mm) return;
    zoomAt(onWorld ? e.clientX : V.w/2, onWorld ? e.clientY : V.h/2, Math.log(s/prev));
  });
  document.addEventListener('gestureend', e => e.preventDefault());
  document.addEventListener('wheel', e => { if(e.ctrlKey){ e.preventDefault(); lastCtrlWheel = now(); } }, { passive:false });   // no page zoom over the HUD
  ov.addEventListener('mousedown', e => { if(e.button === 1) e.preventDefault(); });                   // no middle-click autoscroll
  ov.addEventListener('auxclick', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', e => {
    const k = keyName(e); if(k) keys.delete(k);
    if(e.key === 'Shift') keys.delete('shift');
    if(e.code === 'Space'){ spaceDown = false; setCursor(); }
  });
  window.addEventListener('blur', () => { keys.clear(); spaceDown = false; mouse.inWorld = false; setCursor(); });
}
function keyName(e){
  switch(e.code){
    case 'KeyW': case 'ArrowUp': return 'u';
    case 'KeyS': case 'ArrowDown': return 'd';
    case 'KeyA': case 'ArrowLeft': return 'l';
    case 'KeyD': case 'ArrowRight': return 'r';
  }
  return null;
}
// Ctrl/Cmd+A by position (QWERTY) or by character (the key labelled A on AZERTY)
const isSelAllKey = e => e.code === 'KeyA' || e.key === 'a' || e.key === 'A';
function onKey(e){
  // keep Tab inside an open dialog (also from its seed input)
  if(e.key === 'Tab' && modalOpen()){
    const card = document.querySelector('.modal.show');
    const f = card ? [...card.querySelectorAll('button, input, select, a[href]')].filter(el => !el.hidden && el.offsetParent !== null) : [];
    if(f.length){
      const i = f.indexOf(document.activeElement);
      const n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
      e.preventDefault(); f[n].focus();
    }
    return;
  }
  const tag = e.target && e.target.tagName;
  if(tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA'){ if(e.key === 'Escape') e.target.blur(); return; }
  const mod = e.ctrlKey || e.metaKey;
  const ctl = e.target && e.target.closest ? e.target.closest('button, a, [role="button"]') : null;   // a keyboard-focused control
  // auto-repeat: only the held keys (pan, Space-pan, Shift, zoom) repeat; toggles fire once per
  // press (a Space held into a newly focused button, e.g. the end card's, must not press it)
  if(e.repeat && e.key !== 'Tab' && (e.code !== 'Space' || ctl) && e.key !== 'Shift' && !/^[-+=_]$/.test(e.key) && (mod ? isSelAllKey(e) : !keyName(e))){ e.preventDefault(); return; }
  if(e.key === 'Escape'){ if(modalOpen()){ if(!$('m-end').classList.contains('show')) closeModals(); } else if(G.S){ G.S.clearSelection(); G.simDirty = true; } return; }
  if(e.key === '?' || e.key === 'F1'){ e.preventDefault(); toggleModal('m-help'); return; }   // not over the end card (toggleModal)
  if(modalOpen() || !G.ready) return;
  if(e.key === 'Shift') keys.add('shift');
  if(mod && isSelAllKey(e)){ e.preventDefault(); const n = G.S.selectAll(); lastAll = typeof n === 'number' ? n : -2; G.simDirty = true; return; }
  if(mod || e.altKey) return;
  const k = keyName(e);
  if(k){ keys.add(k); e.preventDefault(); return; }
  // let a keyboard-focused control take Space as its native activation
  if(e.code === 'Space' && ctl) return;
  if(e.code === 'Space'){ e.preventDefault(); if(!spaceDown){ spaceDown = true; setCursor(); } return; }
  const zx = mouse.inWorld ? mouse.x : V.w/2, zy = mouse.inWorld ? mouse.y : V.h/2;
  switch(e.key){
    case 'q': case 'Q': selectAll(); break;
    case 'p': case 'P': case 'Pause': setUserPause(!G.userPaused); break;
    case 'h': case 'H': case 'Home': goHome(); break;
    case '0': overview(); break;
    case '+': case '=': zoomAt(zx, zy, 0.45); break;
    case '-': case '_': zoomAt(zx, zy, -0.45); break;
    case '`': toggleDebug(); break;
    case 'F8': if(dbgEl && G.R){ dbgView = (dbgView + 1) % 4; G.R.setQuality({ debug: dbgView }); } break;
    default: return;
  }
  e.preventDefault();
}

// ============================================================================
//  overlay (2D canvas above the world)
// ============================================================================
let ovHadContent = true;
const panelRects = []; let panelRectsT = -1;
function refreshPanelRects(){
  panelRects.length = 0;
  for(const id of ['p-status', 'p-map', 'p-stats', 'p-ctrl']){
    const el = $(id); if(!el) continue;
    const r = el.getBoundingClientRect(); if(r.width > 0 && r.height > 0) panelRects.push({ l:r.left, t:r.top, r:r.right, b:r.bottom });
  }
  panelRectsT = animT;
  // toasts sit top-centre, below any top panel they would overlap
  const tw = Math.min(440, V.w - 24), tl = (V.w - tw)/2, tr = tl + tw;
  let top = 14;
  for(const r of panelRects) if(r.t < V.h*0.3 && r.l < tr && r.r > tl) top = Math.max(top, r.b + 8);
  const ts = Math.round(top) + 'px';
  if(toastBox.style.top !== ts) toastBox.style.top = ts;
}
function clearOverlay(){
  try { octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, octx.canvas.width, octx.canvas.height); } catch(e){}
  ovHadContent = true;
}
function drawOverlay(){
  const c = octx, W = V.w, H = V.h;
  if(panelRectsT < 0 || animT - panelRectsT > 2) refreshPanelRects();
  c.setTransform(V.odpr, 0, 0, V.odpr, 0, 0);
  if(ovHadContent) c.clearRect(0, 0, W, H);
  let drew = false;
  drew = drawOrderTargets(c) || drew;
  drew = drawPathPreview(c) || drew;
  drew = drawMarkers(c) || drew;
  drew = drawPings(c) || drew;
  drew = drawPopups(c) || drew;
  drew = drawIndicators(c) || drew;
  drew = drawBoxAndPress(c) || drew;
  ovHadContent = drew;
}
function onScreen(sx, sy, m){ return sx > -m && sy > -m && sx < V.w + m && sy < V.h + m; }
function drawOrderTargets(c){
  const S = G.S; if(!S || !Array.isArray(S.orders)) return false;
  let drew = false;
  for(const o of S.orders){
    if(!o || !o.active || o.done || !(o.n > 0)) continue;
    const sx = toSX(o.x), sy = toSY(o.y); if(!onScreen(sx, sy, 20)) continue;
    const ph = (animT*1.4) % 1, r = 7 + 3*Math.sin(animT*4);
    c.save();
    c.strokeStyle = 'rgba(127,240,255,0.75)'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(sx, sy, r, 0, TAU); c.stroke();
    c.globalAlpha = 1 - ph; c.beginPath(); c.arc(sx, sy, r + 16*ph, 0, TAU); c.stroke();
    c.globalAlpha = 0.9; c.fillStyle = '#7ff0ff'; c.font = '600 10px ' + FONT; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(String(o.n), sx + r + 5, sy - r);
    c.restore();
    drew = true;
  }
  return drew;
}
function drawPathPreview(c){
  const P = pathPrev, S = G.S;
  if(!P || !S) return false;
  const age = animT - P.t0;
  if(!adoptPathOrder(P)){ if(age > 1) pathPrev = null; return false; }     // not published yet
  const o = S.orders && S.orders[P.slot];
  if(age > 4.5 || !o || o.serial !== P.serial || !o.active){ pathPrev = null; return false; }
  if(P.calcT < 0 || animT - P.calcT > 0.35){
    P.calcT = animT; P.n = 0;
    const sc = typeof S.selectionCenter === 'function' ? S.selectionCenter() : hordeCenter(true);
    if(sc){ try { P.n = S.tracePath(sc.x, sc.y, P.slot, 240, P.pts) | 0; } catch(e){ P.n = 0; } }
  }
  if(P.n < 2) return false;
  const a = age < 3.3 ? 1 : 1 - (age - 3.3)/1.2;
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath();
  for(let i=0;i<P.n;i++){ const x = toSX(P.pts[2*i]), y = toSY(P.pts[2*i + 1]); if(i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.strokeStyle = 'rgba(0,20,30,' + (0.35*a) + ')'; c.lineWidth = 5; c.setLineDash([]); c.stroke();
  c.strokeStyle = 'rgba(127,240,255,' + (0.85*a) + ')'; c.lineWidth = 2.5; c.setLineDash([1, 9]); c.lineDashOffset = -animT*40; c.stroke();
  c.restore();
  return true;
}
function drawMarkers(c){
  let drew = false;
  for(let i=markers.length - 1;i>=0;i--){
    const m = markers[i], age = animT - m.t0;
    const dur = m.sel ? 0.5 : m.ok ? 1.5 : 0.9;
    if(age > dur){ markers.splice(i, 1); continue; }
    const sx = toSX(m.x), sy = toSY(m.y);
    if(!onScreen(sx, sy, 60)) continue;
    drew = true;
    c.save();
    if(m.sel){
      const f = age/dur;
      c.strokeStyle = 'rgba(127,240,255,' + (1 - f) + ')'; c.lineWidth = 2;
      c.beginPath(); c.arc(sx, sy, 8 + 26*f, 0, TAU); c.stroke();
    } else if(m.ok){
      const col = m.attack ? '255,120,70' : '127,240,255';
      for(let k=0;k<3;k++){
        const f = age*2.3 - k*0.2; if(f <= 0 || f >= 1) continue;
        const e = 1 - Math.pow(1 - f, 2);
        c.strokeStyle = 'rgba(' + col + ',' + (0.95*(1 - f)) + ')'; c.lineWidth = 2;
        c.beginPath(); c.arc(sx, sy, 34 - 26*e, 0, TAU); c.stroke();
      }
      const fa = age < 1 ? 1 : 1 - (age - 1)/(dur - 1);
      c.globalAlpha = fa; c.strokeStyle = 'rgb(' + col + ')'; c.fillStyle = 'rgba(' + col + ',0.25)'; c.lineWidth = 2;
      if(m.attack){
        c.translate(sx, sy); c.rotate(age*2);
        c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.stroke();
        for(let k=0;k<4;k++){ c.rotate(Math.PI/2); c.beginPath(); c.moveTo(6, 0); c.lineTo(17, 0); c.stroke(); }
      } else {
        const s = 6 + 2*Math.sin(age*9);
        c.beginPath(); c.moveTo(sx, sy - s); c.lineTo(sx + s, sy); c.lineTo(sx, sy + s); c.lineTo(sx - s, sy); c.closePath(); c.fill(); c.stroke();
      }
    } else {
      const f = age/dur, sh = Math.sin(age*40)*3*(1 - f);
      c.globalAlpha = 1 - f; c.strokeStyle = '#ff5566'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sx - 7 + sh, sy - 7); c.lineTo(sx + 7 + sh, sy + 7); c.moveTo(sx + 7 + sh, sy - 7); c.lineTo(sx - 7 + sh, sy + 7); c.stroke();
    }
    c.restore();
  }
  return drew;
}
function drawPings(c){
  let drew = false;
  for(let i=pings.length - 1;i>=0;i--){
    const p = pings[i], age = animT - p.t0, dur = 0.9*p.n;
    if(age > dur){ pings.splice(i, 1); continue; }
    const sx = toSX(p.x), sy = toSY(p.y);
    if(!onScreen(sx, sy, 80)) continue;
    drew = true;
    const f = (age % 0.9)/0.9;
    c.save(); c.strokeStyle = p.col; c.globalAlpha = (1 - f)*0.9; c.lineWidth = 2.5;
    c.beginPath(); c.arc(sx, sy, 10 + 60*f, 0, TAU); c.stroke(); c.restore();
  }
  return drew;
}
function drawPopups(c){
  if(!popups.length) return false;
  let drew = false;
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  for(let i=popups.length - 1;i>=0;i--){
    const p = popups[i], age = animT - p.t0, dur = p.big ? 1.8 : 1.1;
    if(age > dur){ popups.splice(i, 1); continue; }
    const sx = toSX(p.x), sy = toSY(p.y) - 12 - 30*(age/dur);
    if(!onScreen(sx, sy, 40)) continue;
    drew = true;
    c.globalAlpha = age < 0.12 ? age/0.12 : 1 - smoothstep(dur*0.55, dur, age);
    c.font = (p.big ? '700 16px ' : '700 11px ') + FONT;
    c.lineWidth = 3; c.strokeStyle = 'rgba(20,4,6,0.8)'; c.strokeText(p.text, sx, sy);
    c.fillStyle = p.col; c.fillText(p.text, sx, sy);
  }
  c.restore();
  return drew;
}
// ---- off-screen indicators ------------------------------------------------
const NB = 24, binV = new Int32Array(NB), binB = new Int32Array(NB), binX = new Float64Array(NB), binY = new Float64Array(NB), binD = new Float64Array(NB);
const offSites = [];
function edgePoint(dx, dy, pad, clr){
  const cx = V.w/2, cy = V.h/2;
  const tx = dx > 1e-9 ? (V.w - pad - cx)/dx : dx < -1e-9 ? (pad - cx)/dx : Infinity;
  const ty = dy > 1e-9 ? (V.h - pad - cy)/dy : dy < -1e-9 ? (pad - cy)/dy : Infinity;
  const t = Math.min(tx, ty);
  let x = cx + dx*t, y = cy + dy*t;
  return clearOfPanels(x, y, pad, clr);
}
// the nearest spot outside every HUD panel (inflated by a margin) that stays on screen
function clearOfPanels(x, y, pad, clr){
  const m = clr || 14, inside = (px, py) => { for(const r of panelRects) if(px > r.l - m && px < r.r + m && py > r.t - m && py < r.b + m) return true; return false; };
  if(!inside(x, y)) return [x, y];
  let best = null, bd = Infinity;
  for(const r of panelRects){
    const C = [[r.l - m - 2, y], [r.r + m + 2, y], [x, r.t - m - 2], [x, r.b + m + 2]];
    for(const [cx, cy] of C){
      if(cx < 0.5*pad || cx > V.w - 0.5*pad || cy < 0.5*pad || cy > V.h - 0.5*pad || inside(cx, cy)) continue;
      const d = Math.abs(cx - x) + Math.abs(cy - y);
      if(d < bd){ bd = d; best = [cx, cy]; }
    }
  }
  return best || [x, y];
}
// indicators already placed this frame: a new one slides along its screen edge until it is clear
const placed = [];
function placeClear(p, pad, clr){
  const [x0, y0] = p;
  const vert = Math.min(Math.abs(x0 - pad), Math.abs(V.w - pad - x0)) < Math.min(Math.abs(y0 - pad), Math.abs(V.h - pad - y0));
  for(let k=0;k<9;k++){
    const off = (k & 1 ? 1 : -1)*Math.ceil(k/2)*26;
    const x = vert ? x0 : clamp(x0 + off, pad, V.w - pad), y = vert ? clamp(y0 + off, pad, V.h - pad) : y0;
    const cp = k > 0 ? clearOfPanels(x, y, pad, clr) : null;
    let hit = !!cp && (cp[0] !== x || cp[1] !== y);
    for(let i=0;i<placed.length && !hit;i+=2) if(Math.abs(placed[i] - x) < 24 && Math.abs(placed[i+1] - y) < 24) hit = true;
    if(!hit){ placed.push(x, y); return [x, y]; }
  }
  placed.push(x0, y0); return [x0, y0];
}
function arrow(c, x, y, ang, size, col, glow){
  c.save(); c.translate(x, y); c.rotate(ang);
  c.beginPath(); c.moveTo(size, 0); c.lineTo(-0.75*size, 0.8*size); c.lineTo(-0.35*size, 0); c.lineTo(-0.75*size, -0.8*size); c.closePath();
  if(glow){ c.shadowColor = col; c.shadowBlur = glow; }
  c.fillStyle = col; c.fill();
  c.shadowBlur = 0; c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.stroke();
  c.restore();
}
function fmtDist(d){ return d >= 1000 ? (d/1000).toFixed(1) + ' mm' : Math.round(d) + ' µm'; }
function drawIndicators(c){
  const U = unitsBuf(); if(!U) return false;
  const d = U.data, n = U.count, W = V.w, H = V.h, cx = W/2, cy = H/2;
  binV.fill(0); binB.fill(0); binX.fill(0); binY.fill(0); binD.fill(Infinity);
  offSites.length = 0;
  let selN = 0, selOn = 0, sx = 0, sy = 0;
  for(let i=0;i<n;i++){
    const o = i*16, ty = d[o + U_TYPE], f = d[o + U_FLAGS];
    if(ty === 0){
      if(!(f & F_SEL) || (f & F_DIE)) continue;
      selN++;
      const px = toSX(d[o]), py = toSY(d[o+1]);
      if(px >= 0 && py >= 0 && px <= W && py <= H) selOn++; else { sx += d[o]; sy += d[o+1]; }
      continue;
    }
    if(ty !== 1 && ty !== 2 && ty !== 3) continue;
    if(f & F_DIE) continue;
    const px = toSX(d[o]), py = toSY(d[o+1]);
    if(px >= -4 && py >= -4 && px <= W + 4 && py <= H + 4) continue;
    const dx = px - cx, dy = py - cy;
    if(ty === 3){ offSites.push(d[o], d[o+1], dx, dy); continue; }
    const a = Math.atan2(dy, dx), b = ((Math.round(a/TAU*NB) % NB) + NB) % NB, L = Math.hypot(dx, dy);
    if(ty === 1) binV[b]++; else binB[b]++;
    binX[b] += dx/L; binY[b] += dy/L;
    const wd = L/cam.z; if(wd < binD[b]) binD[b] = wd;
  }
  let drew = false;
  placed.length = 0;
  c.save();
  c.font = '600 11px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = 'rgba(12,2,4,0.85)';      // label outline: legible over the busy lumen
  // the selected horde first, then sites, then pathogens (placement priority)
  if(selN > 0 && selOn === 0){
    const m = selN - selOn, wx = sx/m, wy = sy/m, dx = toSX(wx) - cx, dy = toSY(wy) - cy, L = Math.hypot(dx, dy) || 1;
    const [x, y] = placeClear(edgePoint(dx/L, dy/L, 26, 18), 26, 18);
    arrow(c, x, y, Math.atan2(dy, dx), 11, '#7ff0ff', 10);
    const s = String(selN), lx = x - dx/L*20, ly = y - dy/L*20;
    c.strokeText(s, lx, ly); c.fillStyle = '#bff8ff'; c.fillText(s, lx, ly);
    drew = true;
  }
  // infection sites (each)
  const pulse = 0.5 + 0.5*Math.sin(animT*5);
  for(let i=0;i<offSites.length;i+=4){
    const dx = offSites[i+2], dy = offSites[i+3], L = Math.hypot(dx, dy) || 1, ux = dx/L, uy = dy/L;
    const [x, y] = placeClear(edgePoint(ux, uy, 30, 24), 30, 24);
    c.save();
    c.globalAlpha = 0.35 + 0.35*pulse; c.strokeStyle = '#e1f25a'; c.lineWidth = 2;
    c.beginPath(); c.arc(x - ux*3, y - uy*3, 12 + 4*pulse, 0, TAU); c.stroke();
    c.restore();
    arrow(c, x, y, Math.atan2(uy, ux), 10, '#e1f25a', 10);
    const s = fmtDist(Math.hypot(offSites[i] - cam.x, offSites[i+1] - cam.y)), lx = x - ux*30, ly = y - uy*30;
    c.strokeText(s, lx, ly); c.fillStyle = '#eef6a0'; c.fillText(s, lx, ly);
    drew = true;
  }
  // pathogens (binned by direction)
  for(let b=0;b<NB;b++){
    const nv = binV[b], nb = binB[b]; if(!nv && !nb) continue;
    const L = Math.hypot(binX[b], binY[b]) || 1, ux = binX[b]/L, uy = binY[b]/L;
    const [x, y] = placeClear(edgePoint(ux, uy, 22, 14), 22, 14);
    const col = nv >= nb ? '#ff8c3a' : '#9df06a';
    const near = clamp(1 - binD[b]/(12*Math.max(W, H)/cam.z), 0, 1);
    arrow(c, x, y, Math.atan2(uy, ux), 7 + 3*near, col, 6);
    const k = nv + nb;
    if(k > 1){ c.strokeText(String(k), x - ux*16, y - uy*16); c.fillStyle = col; c.fillText(String(k), x - ux*16, y - uy*16); }
    drew = true;
  }
  c.restore();
  return drew;
}
function drawBoxAndPress(c){
  const g = gesture; if(!g) return false;
  if(g.kind === 'box' || g.kind === 'tbox'){
    const x0 = toSX(g.wx), y0 = toSY(g.wy), x1 = g.ex, y1 = g.ey;
    const x = Math.min(x0, x1), y = Math.min(y0, y1), w = Math.abs(x1 - x0), h = Math.abs(y1 - y0);
    c.save();
    c.fillStyle = 'rgba(127,240,255,0.08)'; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(127,240,255,0.85)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w, h);
    const t = Math.min(10, w/2, h/2); c.lineWidth = 2.5; c.strokeStyle = '#7ff0ff';
    c.beginPath();
    c.moveTo(x, y + t); c.lineTo(x, y); c.lineTo(x + t, y);
    c.moveTo(x + w - t, y); c.lineTo(x + w, y); c.lineTo(x + w, y + t);
    c.moveTo(x + w, y + h - t); c.lineTo(x + w, y + h); c.lineTo(x + w - t, y + h);
    c.moveTo(x + t, y + h); c.lineTo(x, y + h); c.lineTo(x, y + h - t);
    c.stroke();
    if(w > 8 || h > 8){
      const k = countInRect(g.wx, g.wy, toWX(x1), toWY(y1));
      c.font = '600 11px ' + FONT; c.textAlign = 'left'; c.textBaseline = 'bottom';
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.6)'; c.strokeText(String(k), x1 + 8, y1 - 6);
      c.fillStyle = '#bff8ff'; c.fillText(String(k), x1 + 8, y1 - 6);
    } else if(g.kind === 'tbox'){
      const f = clamp((animT - g.t0)/0.25, 0, 1);
      c.strokeStyle = 'rgba(127,240,255,0.9)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.lineDashOffset = -animT*20;
      c.beginPath(); c.arc(x0, y0, 30 - 8*f, 0, TAU); c.stroke();
    }
    c.restore();
    return true;
  }
  if(g.kind === 'tpend'){
    const age = now() - g.p.t0; if(age < 130) return false;
    const f = clamp((age - 130)/(LP_MS - 130), 0, 1);
    c.save(); c.lineWidth = 3; c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(g.p.x, g.p.y, 30, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(127,240,255,0.95)'; c.beginPath(); c.arc(g.p.x, g.p.y, 30, -Math.PI/2, -Math.PI/2 + TAU*f); c.stroke();
    c.restore();
    return true;
  }
  return false;
}

// ============================================================================
//  minimap
// ============================================================================
const mmState = { cssW:0, cssH:0, dpr:1, s:1, ox:0, oy:0, img:null, t:-1, drag:false };
function buildMinimap(){
  const net = G.net; if(!net) return;
  const b = net.bounds, bw = Math.max(1, b.x1 - b.x0), bh = Math.max(1, b.y1 - b.y0);
  mm.style.height = '';
  const w = mm.clientWidth || 240;
  const aspect = clamp(bh/bw, 0.35, 1.25);
  const h = Math.round(w*aspect);
  mm.style.height = h + 'px';
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  mmState.cssW = w; mmState.cssH = h; mmState.dpr = dpr;
  mm.width = Math.round(w*dpr); mm.height = Math.round(h*dpr);
  const pad = 3, s = Math.min((w - 2*pad)/bw, (h - 2*pad)/bh);
  mmState.s = s; mmState.ox = (w - bw*s)/2 - b.x0*s; mmState.oy = (h - bh*s)/2 - b.y0*s;
  // pre-render the network once
  const img = document.createElement('canvas');
  img.width = mm.width; img.height = mm.height;
  const c = img.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const grd = c.createRadialGradient(w*0.45, h*0.4, 0, w*0.5, h*0.5, Math.max(w, h)*0.7);
  grd.addColorStop(0, 'rgba(92,26,34,0.92)'); grd.addColorStop(1, 'rgba(38,10,15,0.92)');
  c.fillStyle = grd; c.fillRect(0, 0, w, h);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const col = (o, L) => { const r = 118 + (226 - 118)*o, g = 42 + (58 - 42)*o, bl = 112 + (62 - 112)*o; return 'rgb(' + Math.round(r*L) + ',' + Math.round(g*L) + ',' + Math.round(bl*L) + ')'; };
  const strokeChains = (widthOf, styleOf, dx, dy) => {
    for(const ch of net.chains){
      const X = ch.X, Y = ch.Y, R = ch.R, O = ch.O, n = X.length; if(n < 2) continue;
      let i0 = 0;
      while(i0 < n - 1){
        const wq = Math.round(widthOf(R[i0])*2)/2, oq = Math.round((O ? O[i0] : 0.5)*6)/6;
        c.beginPath(); c.moveTo(X[i0]*s + mmState.ox + dx, Y[i0]*s + mmState.oy + dy);
        let i = i0 + 1;
        for(; i<n; i++){
          c.lineTo(X[i]*s + mmState.ox + dx, Y[i]*s + mmState.oy + dy);
          if(i < n - 1 && (Math.round(widthOf(R[i])*2)/2 !== wq || Math.round((O ? O[i] : 0.5)*6)/6 !== oq)) break;
        }
        c.lineWidth = Math.max(0.6, wq); c.strokeStyle = styleOf(oq); c.stroke();
        i0 = Math.min(i, n - 1);
        if(i >= n) break;
      }
    }
  };
  strokeChains(r => 2*r*s + 1.6, () => 'rgba(10,2,4,0.6)', 0.4, 0.6);
  strokeChains(r => 2*r*s, o => col(o, 1), 0, 0);
  strokeChains(r => 0.55*r*s, o => col(o, 1.35), -0.3, -0.3);
  mmState.img = img;
  mmState.t = -1;
}
function mmToWorld(px, py){ return [(px - mmState.ox)/mmState.s, (py - mmState.oy)/mmState.s]; }
function drawMinimap(){
  if(!mmState.img || !G.S) return;
  const c = mctx, s = mmState.s, ox = mmState.ox, oy = mmState.oy, w = mmState.cssW, h = mmState.cssH;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, mm.width, mm.height);
  c.drawImage(mmState.img, 0, 0);
  c.setTransform(mmState.dpr, 0, 0, mmState.dpr, 0, 0);
  const U = unitsBuf();
  if(U){
    const d = U.data, n = U.count;
    const sites = [];
    const pass = (test, col, r) => {
      c.beginPath(); let any = false;
      for(let i=0;i<n;i++){ const o = i*16; if(!test(d[o + U_TYPE], d[o + U_FLAGS])) continue; any = true; c.rect(d[o]*s + ox - r, d[o+1]*s + oy - r, 2*r, 2*r); }
      if(any){ c.fillStyle = col; c.fill(); }
    };
    pass((t, f) => t === 0 && !(f & F_SEL) && !(f & F_DIE), 'rgba(236,232,255,0.9)', 0.9);
    pass((t, f) => t === 0 && (f & F_SEL) && !(f & F_DIE), '#7ff0ff', 1.1);
    pass((t) => t === 1, '#ff8c3a', 1.2);
    pass((t) => t === 2, '#9df06a', 1.2);
    for(let i=0;i<n;i++){ const o = i*16; if(d[o + U_TYPE] === 3 && !(d[o + U_FLAGS] & F_DIE)) sites.push(d[o]*s + ox, d[o+1]*s + oy); }
    if(sites.length){
      const p = 0.5 + 0.5*Math.sin(animT*5);
      c.strokeStyle = '#e1f25a'; c.lineWidth = 1.5;
      for(let i=0;i<sites.length;i+=2){ c.globalAlpha = 0.55 + 0.45*p; c.beginPath(); c.arc(sites[i], sites[i+1], 3 + 1.5*p, 0, TAU); c.stroke(); }
      c.globalAlpha = 1;
    }
  }
  // pings
  for(const p of pings){ const f = ((animT - p.t0) % 0.9)/0.9; c.globalAlpha = 1 - f; c.strokeStyle = p.col; c.lineWidth = 1.2; c.beginPath(); c.arc(p.x*s + ox, p.y*s + oy, 3 + 10*f, 0, TAU); c.stroke(); }
  c.globalAlpha = 1;
  // camera rect
  const x0 = toWX(0)*s + ox, y0 = toWY(0)*s + oy, x1 = toWX(V.w)*s + ox, y1 = toWY(V.h)*s + oy;
  const rw = x1 - x0, rh = y1 - y0;
  c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(x0, y0, rw, rh);
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1; c.strokeRect(x0 + 0.5, y0 + 0.5, Math.max(1, rw - 1), Math.max(1, rh - 1));
  if(rw < 7 || rh < 7){
    const mx = 0.5*(x0 + x1), my = 0.5*(y0 + y1);
    c.beginPath(); c.moveTo(mx - 6, my); c.lineTo(mx - 2.5, my); c.moveTo(mx + 2.5, my); c.lineTo(mx + 6, my);
    c.moveTo(mx, my - 6); c.lineTo(mx, my - 2.5); c.moveTo(mx, my + 2.5); c.lineTo(mx, my + 6); c.stroke();
  }
}
function bindMinimap(){
  const jump = e => {
    const r = mm.getBoundingClientRect();
    const [wx, wy] = mmToWorld(e.clientX - r.left, e.clientY - r.top);
    fly = null; anchor = null; vel.x = vel.y = 0;
    cam.x = wx; cam.y = wy; clampCam();
  };
  mm.addEventListener('pointerdown', e => {
    if(!G.ready) return;
    e.preventDefault(); e.stopPropagation();
    if(e.button === 2){           // RTS convention: right-click on the minimap sends the selection there
      const r = mm.getBoundingClientRect();
      const [wx, wy] = mmToWorld(e.clientX - r.left, e.clientY - r.top);
      if(giveOrder(wx, wy)) pushLimited(pings, { x:wx, y:wy, t0:animT, col:'#7ff0ff', n:1 }, 16);
      return;
    }
    if(e.button !== 0) return;    // middle button: nothing on the minimap
    try { mm.setPointerCapture(e.pointerId); } catch(_){}
    mmState.drag = true; jump(e);
  });
  mm.addEventListener('pointermove', e => { if(mmState.drag){ e.preventDefault(); jump(e); } });
  const end = () => { mmState.drag = false; };
  mm.addEventListener('pointerup', end); mm.addEventListener('pointercancel', end);
  mm.addEventListener('wheel', e => { e.preventDefault(); if(G.ready) zoomAt(V.w/2, V.h/2, wheelZoom(e)); }, { passive:false });
  mm.addEventListener('contextmenu', e => e.preventDefault());
}

// ============================================================================
//  HUD
// ============================================================================
const hudCache = new Map();
function setText(id, s){ if(hudCache.get(id) === s) return; hudCache.set(id, s); const el = $(id); if(el) el.textContent = s; }
function setBar(id, f){ const v = Math.round(clamp(f, 0, 1)*400)/4; const k = id + ':w'; if(hudCache.get(k) === v) return; hudCache.set(k, v); $(id).firstElementChild.style.width = v + '%'; }
function setClass(el, cls, on){ const k = el.id + ':' + cls; if(hudCache.get(k) === on) return; hudCache.set(k, on); el.classList.toggle(cls, on); }
const ADJ = ['GLACIAL','CRIMSON','SILENT','FERAL','VELVET','HOLLOW','AMBER','RAPID','LUCID','SCARLET','COBALT','FEVERED','MOLTEN','QUIET','ARDENT','SABLE','LIMPID','RESTLESS','TIDAL','VIVID','BRAZEN','GENTLE','ROGUE','SOLEMN'];
const NOUN = ['FLAGELLUM','CAPSID','LYSOSOME','VENULE','ARTERIOLE','PLATELET','CYTOKINE','MACROPHAGE','ENDOTHELIUM','PSEUDOPOD','GRANULE','PLASMA','RIBOSOME','VESICLE','COMPLEMENT','ANTIGEN','INTEGRIN','SELECTIN','CHEMOKINE','LEUKOCYTE','HISTAMINE','FIBRIN','PERICYTE','MONOCYTE'];
function simName(seed){
  let h = (seed|0) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d); h = Math.imul(h ^ (h >>> 12), 0x297a2d39); h ^= h >>> 15;
  return ADJ[(h >>> 0) % ADJ.length] + '-' + NOUN[((h >>> 8) >>> 0) % NOUN.length];
}
const fmtTime = t => { t = Math.max(0, t|0); return String(Math.floor(t/60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') + ' MIN'; };
function updateHud(){
  const S = G.S; if(!S) return;
  const st = S.stats || {};
  const wbc = st.wbc | 0, sel = st.selected | 0;
  setText('h-id', '[' + simName(G.seed) + ']');
  const waves = S.tune && S.tune.WAVES;
  const state = st.state || 'play';
  setText('h-wave', state === 'over' ? 'LOST' : state === 'won' ? 'CLEARED' : '#' + (st.wave | 0) + (waves ? ' / ' + waves : ''));
  const narrow = V.w < 480, ns = st.sites | 0;
  setText('h-threat', narrow ? (st.viruses | 0) + 'V · ' + (st.bacteria | 0) + 'B · ' + ns + ' SITE' + (ns === 1 ? '' : 'S')
                             : (st.viruses | 0) + ' VIR · ' + (st.bacteria | 0) + ' BAC · ' + ns + ' SITE' + (ns === 1 ? '' : 'S'));
  const sc = renderScale(), ph = Math.round(V.h*V.dpr*sc);
  setText('h-feed', (narrow ? 'gl2 ' : 'webgl2-') + ph + 'p · ' + Math.round(perf.fps) + (narrow ? 'fps' : ' fps'));
  setText('h-sel', sel + '/' + wbc);
  const inf = clamp(+st.infection || 0, 0, 1), imm = clamp(+st.immunity || 0, 0, 1);
  setText('h-inf', Math.round(inf*100) + '%'); setBar('bar-inf', inf);
  setText('h-imm', Math.round(imm*100) + '%'); setBar('bar-imm', imm);
  setClass($('bar-inf'), 'alarm', inf > 0.75);
  setClass($('h-inf'), 'hot', inf > 0.5);
  // near defeat: a red screen vignette (horde.html, body::after) and one-shot warnings
  const danger = state === 'play' ? clamp((inf - 0.5)/0.5, 0, 1) : 0;
  const dq = Math.round(danger*20)/20;             // quantised: the style is not rewritten every frame
  if(dq !== G.dangerQ){ G.dangerQ = dq; document.body.style.setProperty('--danger', String(dq*0.9)); }
  const crit = state === 'play' && inf > 0.75;
  if(crit !== G.critical){ G.critical = crit; document.body.classList.toggle('critical', crit); }
  // infection decays, so a warning re-arms once the level drops 10 points below its threshold
  for(const [th, msg] of INF_WARN){
    if(state === 'play' && inf >= th && !G.infWarn[th]){ G.infWarn[th] = true; toast(msg, 'bad', null, 0, 4200); }
    else if(inf < th - 0.1) G.infWarn[th] = false;
  }
  setText('h-pop', String(wbc));
  setText('h-time', fmtTime(st.time != null ? st.time : G.time));
  setText('h-score', Math.round(st.score || 0).toLocaleString('en-US'));
  if(lastAll === -2 && sel > 0) lastAll = sel;
  setClass($('b-all'), 'on', lastAll > 0 && sel === lastAll);
  if((state === 'over' || state === 'won') && !G.endShown) showEnd(state, st.score);
}
const INF_WARN = [[0.5, 'Infection 50 % — clear the infection sites'], [0.75, 'Infection 75 % — hunt the escaping pathogens'], [0.9, 'Infection 90 % — the tissue is about to be lost']];
function resetDanger(){
  G.infWarn = {}; G.dangerQ = -1; G.critical = false;
  document.body.style.removeProperty('--danger');
  document.body.classList.remove('critical');
}
function updatePauseUi(){
  const p = G.userPaused;
  document.body.classList.toggle('paused', p);
  $('b-pause').classList.toggle('paused', p);
  $('b-pause').setAttribute('aria-pressed', p ? 'true' : 'false');
  $('b-pause-l').textContent = p ? 'Resume' : 'Pause';
  renderDirty = true;
}

// ============================================================================
//  modals: settings, help, game over
// ============================================================================
const MODALS = ['m-set', 'm-help', 'm-end'];
let modalOpener = null;                 // focus returns here when the dialogs close
const modalOpen = () => MODALS.some(id => $(id).classList.contains('show'));
function openModal(id){
  if(!modalOpen()) modalOpener = document.activeElement;
  for(const m of MODALS) if(m !== id) $(m).classList.remove('show');
  $(id).classList.add('show');
  const f = $(id).querySelector('.x, button, input, select');
  try { if(f) f.focus({ preventScroll:true }); } catch(_){}
  // settings / help pause the game; the end card does not (the world keeps living behind it)
  if(id === 'm-end'){ if(G.modalPaused){ G.modalPaused = false; lastTs = 0; } }
  else if(!G.paused) G.modalPaused = true;
  keys.clear();
  if(id === 'm-set') syncSettingsUi();
  renderDirty = true;
}
function closeModals(){
  for(const m of MODALS) $(m).classList.remove('show');
  if(G.modalPaused){ G.modalPaused = false; lastTs = 0; }
  const o = modalOpener; modalOpener = null;
  try { (o && o !== document.body && document.contains(o) && !o.closest('.modal') ? o : ov).focus({ preventScroll:true }); } catch(_){}
}
// help / settings never replace the game-over card (its score and buttons would be lost)
function toggleModal(id){
  if(id !== 'm-end' && $('m-end').classList.contains('show')) return;
  if($(id).classList.contains('show')) closeModals(); else openModal(id);
}
function showEnd(state, score){
  if(G.endShown) return;
  G.endShown = state;
  const S = G.S, st = (S && S.stats) || {};
  const M = $('m-end');
  M.classList.toggle('won', state === 'won'); M.classList.toggle('over', state !== 'won');
  $('end-title').textContent = state === 'won' ? 'Infection cleared' : 'Tissue overrun';
  $('end-sub').textContent = state === 'won' ? 'every wave repelled — the vessels are safe' : 'the infection reached 100 %';
  $('end-score').textContent = Math.round(score != null ? score : st.score || 0).toLocaleString('en-US');
  const rows = [['Time', fmtTime(st.time != null ? st.time : G.time).replace(' MIN', '')], ['Wave', String(st.wave | 0)]];
  if(st.captured != null) rows.push(['Pathogens eaten', String(st.captured)]);
  if(st.sitesDown != null) rows.push(['Sites destroyed', String(st.sitesDown)]);
  if(st.deaths != null) rows.push(['Cells lost', String(st.deaths)]);
  rows.push(['Cells left', String(st.wbc | 0)]);
  const box = $('end-stats'); box.textContent = '';
  for(const [k, v] of rows){ const a = document.createElement('span'); a.textContent = k; const b = document.createElement('b'); b.textContent = v; box.append(a, b); }
  openModal('m-end');
}
function segBind(id, key, conv, after){
  const el = $(id);
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    setSetting(key, conv(b.dataset.v)); syncSettingsUi(); if(after) after();
  });
}
function syncSettingsUi(){
  const mark = (id, v) => { for(const b of $(id).querySelectorAll('button')){ const on = b.dataset.v === String(v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); } };
  mark('s-quality', settings.quality);
  mark('s-rbc', settings.rbc ? 1 : 0); mark('s-dof', settings.dof ? 1 : 0); mark('s-fg', settings.fg ? 1 : 0); mark('s-edge', settings.edge ? 1 : 0);
  mark('s-diff', settings.difficulty);
  $('s-quality-hint').textContent = settings.quality === 'auto'
    ? 'Auto lowers the render resolution when frames get slow (now ' + Math.round(renderScale()*100) + ' %).'
    : 'Fixed render resolution: ' + Math.round(renderScale()*100) + ' % at up to ' + (PRESETS[settings.quality] || PRESETS.auto).dpr + '× pixel density.';
  // map styles: every registered generator with a label; debug layouts stay out of the list
  const INFO = BV.GENERATOR_INFO || {}, sel = $('s-gen');
  const gens = Object.keys(BV.GENERATORS || {}).filter(g => INFO[g] && !INFO[g].hidden);
  const def = BV.GEN_DEFAULT;
  if(sel.options.length !== gens.length){
    sel.textContent = '';
    for(const g of gens){
      const o = document.createElement('option'); o.value = g;
      o.textContent = INFO[g].label + (g === def ? ' (default)' : '');
      sel.appendChild(o);
    }
  }
  const cur = settings.gen && BV.GENERATORS[settings.gen] ? settings.gen : def;
  if(gens.includes(cur)) sel.value = cur;
  const hint = $('s-gen-hint'), info = INFO[sel.value];
  if(hint) hint.textContent = info && info.blurb ? info.blurb.charAt(0).toUpperCase() + info.blurb.slice(1) + '.' : '';
}
function bindUi(){
  $('b-all').addEventListener('click', () => G.ready && selectAll());
  $('b-zin').addEventListener('click', () => G.ready && zoomAt(V.w/2, V.h/2, 0.5));
  $('b-zout').addEventListener('click', () => G.ready && zoomAt(V.w/2, V.h/2, -0.5));
  $('b-home').addEventListener('click', () => G.ready && goHome());
  $('b-pause').addEventListener('click', () => G.ready && setUserPause(!G.userPaused));
  $('b-new').addEventListener('click', () => newMap());
  $('b-set').addEventListener('click', () => toggleModal('m-set'));
  $('b-help').addEventListener('click', () => toggleModal('m-help'));
  for(const b of document.querySelectorAll('.cb')) b.addEventListener('pointerup', () => b.blur());
  for(const m of MODALS){
    const el = $(m);
    el.addEventListener('pointerdown', e => { if(e.target === el && m !== 'm-end') closeModals(); });
    for(const x of el.querySelectorAll('[data-close]')) x.addEventListener('click', closeModals);
  }
  segBind('s-quality', 'quality', v => v, () => { resize(); perf.lvl = settings.quality === 'auto' ? initialLevel() : 0; perf.bad = perf.good = 0; perf.grace = perf.clock + 1; applyQuality(); syncSettingsUi(); });
  segBind('s-rbc', 'rbc', v => v === '1', () => { G.simDirty = true; renderDirty = true; });
  segBind('s-dof', 'dof', v => v === '1', applyQuality);
  segBind('s-fg', 'fg', v => v === '1', applyQuality);
  segBind('s-edge', 'edge', v => v === '1');
  segBind('s-diff', 'difficulty', v => v, () => {
    if(G.S && typeof G.S.setDifficulty === 'function'){ G.S.setDifficulty(settings.difficulty); G.S._difficultyFromMain = settings.difficulty; toast('Difficulty: ' + settings.difficulty, 'info', 'diff', 0.5); }
    else toast('Difficulty applies on restart', 'info', 'diff', 1);
  });
  // a new map style grows at once (with the seed in the field), like "Grow this map"
  $('s-gen').addEventListener('change', e => { setSetting('gen', e.target.value); syncSettingsUi(); newMap(parseSeed($('s-seed').value)); });
  $('s-dice').addEventListener('click', () => { $('s-seed').value = String(randomSeed()); });
  $('s-go').addEventListener('click', () => newMap(parseSeed($('s-seed').value)));
  $('s-seed').addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); newMap(parseSeed($('s-seed').value)); } });
  $('s-restart').addEventListener('click', () => G.ready && restart());
  $('e-restart').addEventListener('click', () => restart());
  $('e-new').addEventListener('click', () => { closeModals(); newMap(); });
  $('e-look').addEventListener('click', () => { closeModals(); toast('Restart from Settings or grow a new map', 'info', 'look', 2); });
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));
  if(window.visualViewport) window.visualViewport.addEventListener('resize', resize);
  // a devicePixelRatio change at the same css size (window moved to another monitor) fires
  // no resize event: watch the current ratio, re-armed with the new one on every change
  const watchDpr = () => {
    if(!window.matchMedia) return;
    const mq = matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
    const on = () => { resize(); watchDpr(); };
    if(mq.addEventListener) mq.addEventListener('change', on, { once:true });
    else if(mq.addListener) mq.addListener(function h(){ mq.removeListener(h); on(); });
  };
  watchDpr();
  // the renderer re-initialises on a restored context; repaint even while paused
  glc.addEventListener('webglcontextrestored', () => { renderDirty = true; }, false);
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){
      G.hiddenPaused = true; keys.clear();
      if(raf){ cancelAnimationFrame(raf); raf = 0; }
    } else {
      G.hiddenPaused = false; lastTs = 0; perf.grace = perf.clock + 1;
      if(!raf && !G.dead) raf = requestAnimationFrame(tick);
    }
  });
}

// ============================================================================
//  debug readout (` key or ?debug)
// ============================================================================
let dbgEl = null, dbgView = 0;
function toggleDebug(){
  if(dbgEl){ dbgEl.remove(); dbgEl = null; if(dbgView && G.R){ dbgView = 0; G.R.setQuality({ debug:0 }); } return; }
  dbgEl = document.createElement('pre');
  dbgEl.style.cssText = 'position:fixed;z-index:5;left:50%;bottom:8px;transform:translateX(-50%);margin:0;padding:6px 9px;border-radius:6px;background:rgba(0,0,0,.72);color:#bfe;font:10.5px/1.4 ' + FONT + ';pointer-events:none;white-space:pre';
  document.body.appendChild(dbgEl);
}
function updateDebug(s){
  const S = G.S, dbg = S && S._dbg && S._dbg.dbg;
  dbgEl.textContent =
    'fps ' + perf.fps.toFixed(0) + '  frame ' + perf.ema.toFixed(1) + ' ms' + (s && s.gpuMs != null ? '  gpu ' + (+s.gpuMs).toFixed(1) + ' ms' : '') +
    '  scale ' + renderScale().toFixed(2) + '  dpr ' + V.dpr.toFixed(2) + (dbgView ? '  view ' + dbgView : '') + '\n' +
    'z ' + cam.z.toFixed(3) + ' px/µm  lod ' + rbcLOD().toFixed(2) + '  rbc ' + ((S && S.rbc && S.rbc.count) | 0) + '  units ' + ((S && S.units && S.units.count) | 0) +
    (s ? '  draws ' + s.drawCalls + '  inst ' + s.instances : '') + (dbg && dbg.lastUpdateMs != null ? '  sim ' + dbg.lastUpdateMs.toFixed(1) + ' ms' : '');
}

// ============================================================================
//  boot
// ============================================================================
async function boot(){
  bindUi(); bindInput(); bindMinimap(); syncSettingsUi(); updatePauseUi();
  if(QS.has('debug')) toggleDebug();
  if(!webgl2Available()){
    return showError('WebGL2 is not available', 'This game renders the vessel network on the GPU and needs WebGL2, which this browser or device does not provide (or it is switched off).');
  }
  const missing = ['generate', 'buildNet', 'createRenderer', 'createSim'].filter(k => typeof BV[k] !== 'function');
  if(missing.length){
    return showError('Game scripts missing', 'Some of the game scripts did not load (BV.' + missing.join(', BV.') + ' is missing). Reload the page; if it persists the build is incomplete.');
  }
  resize();
  const s = QS.get('seed');
  await loadMap(s != null && s !== '' ? parseSeed(s) : randomSeed(), true);
  if(!G.dead && !raf) raf = requestAnimationFrame(tick);
}

// test / console handle (not a public API)
window.HORDE = {
  get net(){ return G.net; }, get S(){ return G.S; }, get R(){ return G.R; }, get ready(){ return G.ready; },
  get frames(){ return G.frames; }, get ticks(){ return G.ticks; }, get seed(){ return G.seed; }, get zMin(){ return zMin; }, get paused(){ return G.paused; },
  cam, V, settings, perf,
  flyTo, zoomAt, overview, goHome, newMap, restart, selectAll, giveOrder, toast,
  toWorld: (sx, sy) => [toWX(sx), toWY(sy)], toScreen: (wx, wy) => [toSX(wx), toSY(wy)],
  setCam(x, y, z){ fly = null; anchor = null; vel.x = vel.y = 0; if(z != null){ cam.z = clamp(z, zMin, MAX_ZOOM); lzGoal = Math.log(cam.z); } if(x != null) cam.x = x; if(y != null) cam.y = y; clampCam(); },
  get flying(){ return !!fly; },
  get preview(){ return pathPrev ? { slot: pathPrev.slot, serial: pathPrev.serial, n: pathPrev.n } : null; },
  get hud(){ return { t: hud.t, b: hud.b }; },
  get settled(){ return !fly && Math.abs(Math.log(cam.z) - lzGoal) < 1e-3 && !vel.x && !vel.y && !keyV.x && !keyV.y && !gesture; },
  get input(){ return { ptrs: ptrs.size, gesture: gesture && gesture.kind, mouse: Object.assign({}, mouse) }; },
  setQuality(q){ if(PRESETS[q]){ settings.quality = q; resize(); applyQuality(); } },
  pause(p){ setUserPause(p); },
  hold(on){ G.held = !!on; lastTs = 0; },   // freeze sim + rendering without any UI (screenshots)
};

const start = () => boot().catch(err => showError('Something went wrong', 'The game failed to start.', err));
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
