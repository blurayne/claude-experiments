// The whole of galactic-transit.html's script, moved here verbatim and not yet split.
//
// Step 1 of the migration (docs/refactor/inventory/00-PLAN.md §4) changes exactly one thing:
// a classic <script> at the end of <body> becomes a deferred ES module. Nothing is
// reordered, renamed or reformatted, so that if the parity gate reddens here it can only be
// the module semantics — top-level scope no longer being global, and the script running
// after parsing rather than at its position in the document. That is the single largest
// risk in the migration and it gets a commit to itself.
//
// The ts-nocheck directive below is temporary and shrinks with every extraction: as each
// module moves out into
// src/core, src/astro, src/gpu and the rest it is typed properly, and this file gets smaller
// until it can go. It is not a licence to leave anything untyped — it is the scaffolding that
// lets the move happen in reviewable steps instead of one unreadable diff.
//
// It does silence "Cannot find name", which is the likeliest mistake when moving code out, so
// scripts/check-names.mjs type-checks a copy with the directive removed and reports only that.
// @ts-nocheck

// core/errorlog is FIRST and bare on purpose: it installs the global error handlers, and it
// has to be in place before any later import can throw.
import { installErrorCollector, setLogRenderer, logErr, errLog, TOUCH_DEV } from './core/errorlog'
import { BUILD, VERSION, BUILD_LINE, localBuildStamp } from './core/build'
import { perspective, lookAt, mul } from './core/mat4'
import { gauss, expR } from './core/rng'
import { $ } from './core/dom'
import { sup, fmtCount, fmtYears as fmtYearsIn, type UnitMode } from './core/format'
import { hideTip } from './ui/tooltips'
import {
  R_GAL, V_GAL, GAL_PERIOD, YR_PER_SIM, AGE0, AND_AGE, SCATTER_AGE, SR_A, SR_B, SR_K,
  TILT, E1, E2, AU2U, OO_REAL, REAL_MODE, PITCH, BAR_L, BAR_A, armAngle, ARMS, sA, cA,
} from './astro/constants'
import { sunR, sunPhase } from './astro/sun'
import {
  M31_DIR, M31_E2, M31_ROT, KPC2U, M31_ORBIT, MERGE_A0, MERGE_A1, MERGE_T0, MERGE_T1,
  orbitUV, sepScene, mergeAt, diskSpin,
} from './astro/merger'
import {
  BODIES, NB, N_PLANETS, I_P9, PHASE, EN, DTILT, BU, BV, WOB_A, WOB_T,
  tmp, tmpSun, earthW, bodyPos,
} from './astro/bodies'
import {
  SUN_MS_END, SUN_RGB_TIP, SUN_HB, SUN_AGB, SUN_WD, EARTH_ORBIT_RSUN, SUN_EAT_AGE, EAT_AGES,
  sunState, pnState, sunTint,
} from './astro/sun'
import {
  ageAt, sfrFactor, ratesIntegral,
  environment as environmentAt, lifeState as lifeStateAt,
} from './astro/environment'
import {
  PLATE_MODEL, plateMats, plateAngle, fillPlateMats, MOON_DIA, MOON_BORN, moonPos,
  MOON_D0, MOON_M1, MOON_M2, moonDist, moonW, moonRel,
  EARTH_AXIS, EARTH_P0, SIDEREAL, earthPrime as earthPrimeAt, earthEra,
} from './astro/earth'
import { simClock, cam, gfx, view, readout, lifeAcc } from './render/state'
import { buildStarfield, N_STAR } from './scene/starfield'
import { genGalaxy, genGalaxyMap, mapPick, mapXZ, MAP_SCALE } from './scene/galaxy'
import {
  genAndromeda, genAndromedaMap, mapXZ31,
  R_A, M31_MAP_SCALE, M32_C, M110_C, GSS_DIR, M31_ARM_K,
} from './scene/andromeda'
import { buildBelts, AB_N, KB_N, OO_N } from './scene/belts'
import { initBelts, drawBelts } from './render/passes/belts'
import { makeHDR, resolveTone, bindHDR } from './render/passes/tone'
import { parseStarBin } from './scene/sky'
import {
  sound, fxOn, TRACKS, initAudio, showTrack, playTrack, loadTrack, nextTrack,
  armUnlock, loadBanks, playBank, sfx, applySfxGain, player,
} from './audio/index'
import { g710 as g710At, G710_AT, G710_PERI, G710_V, G710_DIR, G710_OFF } from './astro/g710'

// The clock lives here; the encounter does not.
const g710 = () => g710At(simClock.simT)

// earthPrime calibrates itself against the rendering origin on its first call, and `org` is
// the renderer's — so it is handed in here rather than reached for from inside astro/.
const earthPrime = (t: number, out: Float64Array) => earthPrimeAt(t, out, org)

// Thin wrappers over the pure functions, so the twenty-odd call sites below read as they
// always did. The clock lives here; the model does not.
const ageGyr = () => ageAt(simClock.simT)
const environment = () => environmentAt(simClock.simT)
const lifeState = () => lifeStateAt(ageGyr(), environment())
import { canvas, gl } from './gpu/context'
import { prog } from './gpu/program'
import { makeBuf, pointVAO, deleteVAO, trackVAOBuffers } from './gpu/buffers'

installErrorCollector()
// A thunk, so this does not depend on where renderLog ends up living.
setLogRenderer(() => renderLog())

// The GLSL, moved out to src/shaders/ as files a syntax highlighter can read. Imported with
// Vite's `?raw`, so what reaches the driver is the file's bytes and nothing has been
// reformatted, reindented or comment-stripped on the way. They stay ordinary module-scope
// bindings, consumed synchronously by prog() exactly where they were: a runtime fetch would
// make program creation asynchronous and change first-frame timing.
//
// PT_VS is deliberately shared by several programs. Names match the consts they replaced —
// PT points, TR trails, SN supernova, REM remnant, NEB nebula, KB Kuiper belt, AB asteroid
// belt, OO Oort, PN planetary nebula — so a diff against the pre-refactor page still lines up.
import PT_VS from './shaders/pt.vert?raw'
import PT_FS from './shaders/pt.frag?raw'
import TR_VS from './shaders/tr.vert?raw'
import TR_FS from './shaders/tr.frag?raw'
import SN_VS from './shaders/sn.vert?raw'
import SN_FS from './shaders/sn.frag?raw'
import REM_VS from './shaders/rem.vert?raw'
import REM_FS from './shaders/rem.frag?raw'
import NEB_FS from './shaders/neb.frag?raw'
import DUST_FS from './shaders/dust.frag?raw'
import KB_VS from './shaders/kb.vert?raw'
import AB_VS from './shaders/ab.vert?raw'
import OO_VS from './shaders/oo.vert?raw'
import BELT_FS from './shaders/belt.frag?raw'
import RING_VS from './shaders/ring.vert?raw'
import RING_FS from './shaders/ring.frag?raw'
import GLOBE_VS from './shaders/globe.vert?raw'
import GLOBE_FS from './shaders/globe.frag?raw'
import TONE_VS from './shaders/tone.vert?raw'
import TONE_FS from './shaders/tone.frag?raw'
import SUN_VS from './shaders/sun.vert?raw'
import SUN_FS from './shaders/sun.frag?raw'
import PN_FS from './shaders/pn.frag?raw'
// Semantic version: minor for a feature set, patch for fixes. The date and commit are
// stamped in at build time by .github/scripts/build_site.py; opened straight from the
// working copy the placeholders survive and it reports itself as a dev build.

// glowing point sprites (stars, galaxy, bodies)

// Star profile after Gaia Sky (MPL-2.0, assets/shader/lib/star.glsl): a wide soft
// corona with a tight hot core, and the core lifts the colour toward white — a bright
// star reads as luminous rather than as a tinted disc. Reimplemented, not copied.


// trails, faded by vertex index



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

// Four things stacked, all keyed to how far the blast has run: the photosphere, the
// light thrown off it, the shock front leaving it, and the spikes any bright point
// grows in an optical system. The colour follows the real thing — blue-white at peak,
// reddening as the ejecta expand and cool — so the flash reads as an event with a
// direction in time rather than a lamp being turned up and down.

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


const pRem = prog(REM_VS, REM_FS);
const UREM = {
  proj: gl.getUniformLocation(pRem,'uProj'), view: gl.getUniformLocation(pRem,'uView'),
  px: gl.getUniformLocation(pRem,'uPx'), spin: gl.getUniformLocation(pRem,'uSpin'),
  warp: gl.getUniformLocation(pRem,'uWarp'), cap: gl.getUniformLocation(pRem,'uCap'),
  sun: gl.getUniformLocation(pRem,'uSunPos'), org: gl.getUniformLocation(pRem,'uOrg')
};

// ---------- the physics (compressed but honest) ----------

 // active galaxy density (set by setGalaxy, read by the life-cycle rates)
let showP9 = true;

// ---------- static geometry: starfield + galaxy ----------

// The backdrop starfield. Built here, and here specifically: it is the first of the seven
// things that consume randomness at boot, and the seeded parity stream depends on the order.
const { pos: starPos, size: starSize, col: starCol } = buildStarfield();

// Drop every cached galaxy build. The Andromeda entry is an { a, an, ad } bundle, and
// both map loaders race each other here — this must never throw mid-flush, or the
// loser leaves the scene pointing at deleted vertex arrays.
function flushGxyCache(){
  for(const k of Object.keys(gxyCache)){ const o = gxyCache[k];
    deleteVAO(o.g); deleteVAO(o.nb); deleteVAO(o.d);
    deleteVAO(o.a.a); if(o.a.an) deleteVAO(o.a.an); if(o.a.ad) deleteVAO(o.a.ad);
    delete gxyCache[k]; }
}
const vaoStars = pointVAO(starPos, starSize, starCol);

const gxyCache = {}; // both densities kept once generated, so toggling back is instant
// ---------- the photographic density map ----------
// The classic face-on Milky Way illustration is used as a probability map: stars are
// placed where the picture is bright, with colours taken from its pixels; dust where its
// lanes are dark; HII nebulae where it is pink. The shipped copy is mirrored so the arms
// trail the pattern's rotation, and rotated so its bar sits at the scene's 28 degrees —
// both measured, not guessed. The procedural generator remains the fallback offline.

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
      gfx.galaxyMap = { n, px, lum, blur, starC:cum(star), nebC:cum(neb), dustC:cum(dust) };
      // whatever is cached was built procedurally: rebuild the active density from the map
      flushGxyCache();
      setGalaxy(gfx.curD);
    })
    .catch(()=>{});   // opened from disk: the procedural galaxy stands in
}
function setGalaxy(D){
  const key = (gfx.galaxyMap ? 'm' : 'p') + (gfx.m31Map ? 'M' : 'q') + D;
  if(!gxyCache[key]){
    const b = (gfx.galaxyMap ? genGalaxyMap : genGalaxy)(D);
    const gv = pointVAO(b.star.pos, b.star.size, b.star.col, b.star.wave);
    const nv = pointVAO(b.neb.pos, b.neb.size, b.neb.col);
    const dv = pointVAO(b.dust.pos, b.dust.size, b.dust.str);
    // Andromeda's buffers come back unuploaded now, so the three VAOs are built here — the
    // only place that knows both what was generated and how to put it on the GPU.
    const ab = (gfx.m31Map ? genAndromedaMap : genAndromeda)(D);
    const av = {
      a: pointVAO(ab.star.pos, ab.star.size, ab.star.col, ab.star.wav),
      an: ab.neb ? pointVAO(ab.neb.pos, ab.neb.size, ab.neb.col) : null,
      ad: ab.dust ? pointVAO(ab.dust.pos, ab.dust.size, ab.dust.str) : null,
      // The procedural fallback draws no nebulae or dust, and says so with zeros rather than
      // leaving whatever a previous map-based build left in gfx.
      n: ab.neb ? [gfx.N_AND, gfx.N_ANDN, gfx.N_ANDD] : [gfx.N_AND, 0, 0],
    };
    gxyCache[key] = { D, n:[gfx.N_GXY,gfx.NEB_N,gfx.DUST_N], seg:[gfx.NEB_PINK,gfx.NEB_GLOW,gfx.AND_PINK,gfx.AND_GLOW], nuc:[gfx.NUC0,gfx.NUC1], g:gv, nb:nv, d:dv, a:av };
    // uploaded; the CPU copies go out of scope with the record the generator returned
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
  gfx.N_GXY=c.n[0]; gfx.NEB_N=c.n[1]; gfx.DUST_N=c.n[2];
  [gfx.NEB_PINK, gfx.NEB_GLOW, gfx.AND_PINK, gfx.AND_GLOW] = c.seg;
  [gfx.NUC0, gfx.NUC1] = c.nuc || [0, 0];
  gfx.N_AND=c.a.n[0]; gfx.N_ANDN=c.a.n[1]; gfx.N_ANDD=c.a.n[2];
  gfx.vaoGxy=c.g; gfx.vaoNeb=c.nb; gfx.vaoDust=c.d; gfx.curD=D;
  gfx.vaoAnd=c.a.a; gfx.vaoAndNeb=c.a.an; gfx.vaoAndDust=c.a.ad;
  if(D >= 5) loadGaiaDeep();
}

// nebulae: same vertex logic but a much larger sprite cap, and a coreless glow falloff

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

const pDust = prog(PT_VS, DUST_FS);
// Sprite ceiling for the dust when the camera is in close. Measured, not reasoned: with
// the backdrop drawn beneath the dust (see insideDisk) 40 px carves a dark lane along the
// band and across the core and leaves the HII glow standing above it — the Rift as seen
// from inside. 120 and 220 were tried and crush the whole band to a scatter of stars: the
// multiply compounds, and larger discs overlap everywhere.

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
      gfx.m31Map = { n, px, lum, blur, ridge, starC:cum(star), hazeC:cum(haze), nebC:cum(neb), dustC:cum(dust) };
      flushGxyCache();
      setGalaxy(gfx.curD);
    })
    .catch(()=>{});   // opened from disk: the schematic Andromeda stands in
}
const MAT3_ID = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
for(const [pr, gr] of [[pPt,U.ptGRot],[pNeb,UN.grot],[pDust,UD.grot]]){
  gl.useProgram(pr); gl.uniformMatrix3fv(gr, false, MAT3_ID);
}
setGalaxy(1);   // real default ("low") applied after full init, below — see hadSaved
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
// The belts, built here because this is the fourth of the seven things that consume
// randomness at boot and the seeded parity stream depends on the order.
const { abRT, abRTd, abH, abHd, abSz, abP, kbRT, kbH, kbSz, ooOff, ooSz } = buildBelts();
initBelts({ abRT, abRTd, abH, abHd, abSz, abP, kbRT, kbH, kbSz, ooOff, ooSz });
// Oort boundary: three great circles suggesting the spherical shell
const RING_SEGS=160;
var ringCS=new Float32Array(RING_SEGS*2);
for(let i=0;i<RING_SEGS;i++){ const a=i/RING_SEGS*6.28318530718; ringCS[i*2]=Math.cos(a); ringCS[i*2+1]=Math.sin(a); }


const pRing = prog(RING_VS, RING_FS);

// ---------- Earth and the Moon: spheres shaded in the fragment, as everything here ----------
// A point sprite whose fragment builds the sphere: the normal from the sprite coordinate,
// the lighting from the Sun's direction in view space, the surface from 3-D noise on the
// unit vector in the planet's own frame (spin axis, prime meridian), so the planet turns
// under its map and the map holds still. The Earth's surface is a MODEL of an era, not a
// map of the real continents: coastlines are noise, drifting slowly with the age.


const pGlobe = prog(GLOBE_VS, GLOBE_FS);
const UG = {}; for(const k of ['uProj','uView','uPos','uSz','uSunV','uAxisV','uPrimeV','uAvg','uMirror','uDisc','uTime','uMoon',
  'uMolten','uOcean','uSea','uHaze','uVeg','uIceLat','uCloud','uLights','uDrift','uMap','uHasMap','uDry','uSeaLevel']) UG[k]=gl.getUniformLocation(pGlobe,k);
UG.uPlate = gl.getUniformLocation(pGlobe,'uPlate[0]');
// The real map: today's land from GSHHG (tools/build_earth_map.py), R land, G plate id,
// B continentality. Loaded like the galaxy maps; without it the globe falls back to noise.

function loadEarthMap(){
  fetch('earth-map.webp').then(r => r.ok ? r.blob() : Promise.reject())
    .then(b => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }))
    .then(bm => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bm);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null); gfx.earthTex = t;
    }).catch(()=>{});
}
loadEarthMap();
const vaoGlobe = (()=>{ const v=gl.createVertexArray(); gl.bindVertexArray(v); gl.bindVertexArray(null); return v; })();
const vecV = (m, v) => [m[0]*v[0]+m[4]*v[1]+m[8]*v[2], m[1]*v[0]+m[5]*v[1]+m[9]*v[2], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]];
const norm3 = v => { const l = Math.hypot(v[0],v[1],v[2]) || 1; return [v[0]/l, v[1]/l, v[2]/l]; };

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
const TRAIL_N = 2400;  // sliding window: TRAIL_N samples, spacing set by the length slider
const trails = [], trailBufs = [], trailVaos = [];
for(let i=0;i<NB;i++){
  const a = new Float32Array(TRAIL_N*3);
  for(let k=0;k<TRAIL_N;k++){
    bodyPos(i, (k-(TRAIL_N-1))*simClock.dtSample, tmp);
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
    gl.bindVertexArray(null); trackVAOBuffers(vao,[b]); ringVaos.push(vao);
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


// ---------- the real sky ----------
function loadGaiaStars(){
  fetch('stars-gaia.bin').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(buf => { const s = parseStarBin(buf);
      gfx.vaoGaia = pointVAO(s.pos, s.size, s.col, undefined, s.vel ?? undefined); gfx.N_GAIA = s.n; })
    .catch(()=>{});   // opened from disk, where fetch is blocked: the modelled sky stands in
}

function loadGaiaDeep(){
  // the next 400,000 stars, 8 MB — fetched once, the first time a heavy quality is chosen
  if(gfx.deepAsked) return; gfx.deepAsked = true;
  fetch('stars-gaia-deep.bin').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(buf => { const s = parseStarBin(buf);
      gfx.vaoGaiaDeep = pointVAO(s.pos, s.size, s.col, undefined, s.vel ?? undefined); gfx.N_GAIA_DEEP = s.n; })
    .catch(()=>{ gfx.deepAsked = false; });
}
loadGaiaStars();
loadGalaxyMap();
loadM31Map();

// ---------- Gliese 710 ----------
// ---------- life support ----------
// What actually ends life on Earth is the Sun, not the Galaxy. Solar luminosity climbs
// about 10% per Gyr; a moist greenhouse takes the oceans roughly a billion years from
// now, long before Andromeda arrives. Galactic position contributes a second hazard: a
// supernova within ~30 ly would strip the ozone layer, and that risk tracks the star
// formation rate and the cosmic-ray background.
let lifeOn = false;   // supernovae and births are opt-in
const wasEaten = [false,false,false,false], eatFlash = [-1,-1,-1,-1];   // -1: no flare running

// ---------- stellar life cycle: birth, death, supernovae ----------
// Rates are anchored to current measurements (see the info panel): the Milky Way forms
// ~2 solar masses of stars a year and hosts ~2 supernovae per century. On the compressed
// galactic clock (1 sim-yr ~ 1.19 Myr) births are drawn at the real rate scaled to the
// point sampling (~2.2 per sim-yr per density unit); featured supernovae are a sampled
// fraction of the true ~24,000 per sim-yr, which would be a continuous glitter.
let varOn = true; // variability clock (wall time, runs even when paused)

// ---------- sound: everything synthesized live via Web Audio — no samples, still one file ----------
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
   // how many of each the last fillEvents() actually wrote
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

// event kinds: 1 OB cluster, 2 red supergiant, 3 supernova flash, 4 red giant,
//              5 cooling neutron star, 6 fading white dwarf
function lifeStep(dt, dtSim){
  const sfr = sfrFactor(ageGyr());
  // Per year now, not per compressed step. These are drawn events, a sampled fraction of
  // the real rates — the true figures are in the status bar and the info panel.
  if(evBirth) lifeAcc.accB += dtSim*1.84e-6*gfx.curD*sfr; else lifeAcc.accB = 0;
  if(evSN){
    lifeAcc.accSN += dtSim*Math.max(9.2e-9*gfx.curD, 1.26e-7)*sfr;
    lifeAcc.accPN += dtSim*1.26e-6*gfx.curD*Math.sqrt(sfr);   // low-mass deaths ride with the deaths switch
  } else lifeAcc.accSN = lifeAcc.accPN = 0;
  const CAP = 40;
  for(let n=0; lifeAcc.accB>=1 && n<CAP; n++){ lifeAcc.accB--; if(events.length<EV_CAP){ const s=armSite();
    events.push({k:1,x:s[0],y:s[1],z:s[2],wv:1,st:0,t:0,L:(3+Math.random()*6)*1e6,sn:evSN && Math.random()<0.12});
    if(Math.random()<0.5) sfx('birth'); } } // only half of them sound, or it never stops
  if(lifeAcc.accB>1) lifeAcc.accB = 0;
  for(let n=0; lifeAcc.accSN>=1 && n<CAP; n++){ lifeAcc.accSN--; if(events.length<EV_CAP){ const s=armSite();
    events.push({k:2,x:s[0],y:s[1],z:s[2],wv:1,st:0,t:0}); } }
  if(lifeAcc.accSN>1) lifeAcc.accSN = 0;
  for(let n=0; lifeAcc.accPN>=1 && n<CAP; n++){ lifeAcc.accPN--; if(events.length<EV_CAP){ const s=diskSite();
    events.push({k:4,x:s[0],y:s[1],z:s[2],wv:0,st:0,t:0}); } }
  if(lifeAcc.accPN>1) lifeAcc.accPN = 0;
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
  readout.evN = 0; readout.snN = 0;
  for(let i=0;i<events.length;i++){
    const e=events[i]; let s=0,cr=0,cg=0,cb=0;
    if(e.k===3){
      // The blast leaves this pass entirely: its own program draws it. The sprite grows
      // through the whole flash — a fireball only expands — while the brightness peaks
      // in the first fifth of a second and falls away, so it dims as it spreads.
      if(readout.snN < SN_CAP){
        const u = Math.min(1, e.t/1.6);
        const a = e.t<0.15 ? e.t/0.15 : Math.exp(-(e.t-0.15)/0.45);
        const j = readout.snN++;
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
        const w = (1 - e.st/0.25e6)*(0.55+0.45*Math.sin(simClock.shimT*9.0 + e.x*3.1));
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
    const j = readout.evN++;   // compacted: the blasts that left this pass leave no gaps behind
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

   // dive: hold the camera on the Sun-to-core line
// which absolute-frame position cam.follow tracks when true — the Sun everywhere
// except the one Andromeda view, which needs its own moving target the same way

let dragging=false, px=0, py=0;
// While a pointer or finger is down the clock holds, so the galaxy does not keep
// turning under the hand that is trying to orbit it. Released, it carries straight on.
let holding=false;
const touches = new Map();     // every pointer currently down on the canvas
// Two-finger pan. Kept as a fraction of the view's height along the camera's own right
// and up, not as a world offset: zooming then keeps the composition, and a pan made at
// galaxy scale cannot leave the Sun a thousand units off-screen once you dive. Cleared
// wherever the view is re-seeded (a scenario, a focus, the dive), like the transition.

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
    cam.panF[0] = Math.max(-2, Math.min(2, cam.panF[0] + (cx - panCX)/view.H));
    cam.panF[1] = Math.max(-2, Math.min(2, cam.panF[1] + (cy - panCY)/view.H));
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
const minDist = ()=> cam.followTarget === 'moon' ? (ageGyr() > MOON_BORN ? 5.5e-12 : 2e-11)
                   : cam.followTarget === 'earth' ? 2e-11 : (REAL_MODE ? 2e-8 : 25);
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
  const rate = REAL_MODE ? 0.0018 : 0.0011; // faster travel across real scale's ~11 decades
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
let showTrails=true, showLabels=true, showStats=true;
let showDwarfs=true, showBelt=true, showKuiper=true, showOort=true;
 // years per second
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

// the rate in the unit it is easiest to read: hours, weeks and months below a year
function speedLabel(){
  const eff = simClock.speed*simClock.speedMult, n = x => (Math.abs(x-Math.round(x)) < 0.05 ? Math.round(x) : +x.toFixed(1));
  if(eff < WEEK_YR*0.999) return n(eff/HOUR_YR)+' h/s';
  if(eff < 0.999/12)      return n(eff/WEEK_YR)+' wk/s';
  if(eff < 0.999)         return n(eff*12)+' mo/s';
  if(eff < 1000)          return n(eff)+' yr/s';
  const e = Math.floor(Math.log10(eff)), mant = eff/Math.pow(10,e);
  return (Math.abs(mant-Math.round(mant)) < 0.005 ? Math.round(mant) : mant.toFixed(2))+'×10'+sup(e)+' yr/s';
}
function fmtSpeed(){ $('speedv').textContent = speedLabel(); }
// Whole decades on top of the slider, for crossing deep time without waiting on it.
function setMultExp(x){
  x = Math.max(0, Math.min(10, Math.round(x)));
  simClock.speedMult = Math.pow(10, x);
  $('multExp').value = x;
  $('multExpv').textContent = x === 0 ? '×1' : '×1e' + x;
  fmtSpeed(); applyTrailWindow();
}
$('multExp').addEventListener('input', e => setMultExp(+e.target.value));
// The shuttle: a signed fraction of the set speed, driven by hand. At 0 it is not engaged
// and the clock belongs to play/pause as before; off 0 it takes the clock over — forward
// or backward, paused or not — and the reset hands it back. Deliberately not persisted:
// a shuttle rests at 0 when you pick the piece up.

function setShuttle(v){
  const before = Math.sign(simClock.shuttle);
  simClock.shuttle = Math.max(-100, Math.min(100, Math.round(v)));
  // a change of the shuttle's own sign re-sweeps the trails at once — the clock's drive
  // sign does that too, but not while paused, and a paused reverse left them leading
  if(Math.sign(simClock.shuttle) !== before){ refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }
  $('shuttle').value = simClock.shuttle;
  $('shuttlev').textContent = simClock.shuttle === 0 ? 'off' : simClock.shuttle > 0 ? '+'+simClock.shuttle+'%' : simClock.shuttle+'%';
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
$('speed').addEventListener('input', e=>{ simClock.speed = speedFromSlider(+e.target.value); fmtSpeed(); applyTrailWindow(); });
simClock.speed = speedFromSlider(SPEED_YEAR); fmtSpeed();   // one Earth year per second
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
  const w = (trailPct/100) * simClock.speed * simClock.speedMult;      // years covered by the whole trail
  simClock.dtSample = Math.max(1e-9, w/TRAIL_N);
  const span = w < 1e3 ? (w<10 ? w.toFixed(w<1?2:1) : String(Math.round(w)))+' yr'
             : w < 1e6 ? (w/1e3).toFixed(w<1e4?1:0)+' kyr'
             : w < 1e9 ? (w/1e6).toFixed(w<1e7?1:0)+' Myr'
             : (w/1e9).toFixed(2)+' Gyr';
  $('trailLv').textContent = trailPct + '% · ' + span;
  // rebuilding is 34,000 samples, so coalesce the bursts a slider drag produces
  clearTimeout(trailRefill);
  trailRefill = setTimeout(()=>{ refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }, 90);
}

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
toggle($('tPause'), on=>{ simClock.paused=!on;
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

function spinFrame(){ const A = EARTH_AXIS, P = earthPrime(simClock.simT, cam.spinP); return [P, A, [A[1]*P[2]-A[2]*P[1], A[2]*P[0]-A[0]*P[2], A[0]*P[1]-A[1]*P[0]]]; }
toggle($('tSpinLock'), on=>{
  const d = cam.dirW;
  if(on){ const [P, A, Q] = spinFrame(); const dP = d[0]*P[0]+d[1]*P[1]+d[2]*P[2], dA = d[0]*A[0]+d[1]*A[1]+d[2]*A[2], dQ = d[0]*Q[0]+d[1]*Q[1]+d[2]*Q[2];
    cam.yaw = Math.atan2(dP, -dQ); cam.pitch = Math.asin(Math.max(-1, Math.min(1, dA))); }
  else { cam.yaw = Math.atan2(d[0], d[2]); cam.pitch = Math.asin(Math.max(-1, Math.min(1, d[1]))); }
  if(cam.coreLock){ cam.coreLock = false; }   // the lock's own base yaw would double up
  cam.spinLock = on; cam.panF[0]=cam.panF[1]=0;
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
    cam.followTarget = 'sun';
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    else { cam.follow = true; cam.coreLock = true; cam.distGoal = 3.5e-5; cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0; }
  } else if(v === 'earth'){
    // the planet itself with the Moon's whole orbit in frame, following Earth. Set after
    // the toggle clicks: both handlers reset the follow target to the Sun as a side effect.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.followTarget = 'earth';
    cam.follow = true; cam.coreLock = false; cam.distGoal = earthViewDist(); cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
  } else if(v === 'moon'){
    // the Moon herself, filling the view. Followed like Earth: the same handlers, and the
    // same order — the toggles reset the target to the Sun as they turn themselves on.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.followTarget = 'moon';
    // before the Theia impact there is no Moon: the view holds on the world she comes
    // from, at Earth's own distance, and takes her up when she forms
    cam.follow = true; cam.coreLock = false; cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
    cam.distGoal = ageGyr() > MOON_BORN ? moonViewDist() : earthViewDist();
  } else if(v === 'pn'){
    // the shell's full reach, ~3.5 ly across, following what is left of the Sun; before
    // the shell exists this is simply the Sun's neighbourhood at that scale
    cam.followTarget = 'sun';
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; cam.coreLock = false; cam.distGoal = 0.1; cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
  } else if(v === 'and'){
    // framed wide enough for the whole disk plus its extended halo and stream
    // (R_A=2245, halo out to ~4200, the Giant Southern Stream past 5700), at any
    // point in the encounter; continuously tracked, so the view holds through a
    // running merger scenario too. Set after the toggle clicks below: tView's own
    // handler resets followTarget to 'sun' as a side effect of turning itself on.
    if($('tDive').classList.contains('on')) $('tDive').click();
    if(!$('tView').classList.contains('on')) $('tView').click();
    cam.followTarget = 'and';
    cam.follow = true; cam.coreLock = false; cam.distGoal = 9500; cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
  } else {
    cam.followTarget = 'sun';
    if($('tDive').classList.contains('on')) $('tDive').click();
    if(!$('tView').classList.contains('on')) $('tView').click();
    else { cam.follow = false; cam.distGoal = 4300; cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0; }
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
toggle($('tGaia'), on=> gfx.gaiaOn=on);
toggle($('tFps'), on=>{ showFps=on; $('fpsBox').style.display = on ? '' : 'none'; fitPanels(); });
const lifeSupOn = true;   // the reading is a fixture of the Earth panel now
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
  sound.musicVol = v; player.volume = v;
  $('musicVolv').textContent = v > 0 ? Math.round(v*100)+'%' : 'off';
  const want = v > 0;
  if(want === sound.musicOn) return;
  sound.musicOn = want;
  if(want){ if(!player.src) loadTrack(sound.trackIx); else playTrack(); }
  else player.pause();
}
$('musicVol').addEventListener('input', e => setMusicVol(+e.target.value));
$('tNext').addEventListener('click', ()=>{
  nextTrack();
  // asking for the next track means you want music: give it back its default level
  if(!sound.musicOn){ $('musicVol').value = 0.4; setMusicVol(0.4); saveSettings(); }
});
for(const [id,key] of [['fxBirth','birth'],['fxSn','sn'],['fxPn','pn'],['fxDrone','drone']]){
  $(id).addEventListener('change', e=>{
    fxOn[key] = e.target.checked;
    if(key==='drone' && sound.graph){
      const at = sound.graph.ctx.currentTime;
      sound.graph.droneG.gain.cancelScheduledValues(at);
      sound.graph.droneG.gain.setTargetAtTime(e.target.checked?1:0, at, 0.4);
    }
  });
}
function setSfxVol(v){
  sound.sfxVol = v;
  $('sfxVolv').textContent = v > 0 ? Math.round(v*100)+'%' : 'off';
  if(v > 0 && !sound.soundOn){
    sound.soundOn = true;
    if(!sound.graph) sound.graph = initAudio();
    if(sound.graph) sound.graph.ctx.resume().catch(()=>armUnlock());
    loadBanks();
  } else if(v === 0) sound.soundOn = false;
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
    const s = { t:{}, s:{}, c:{}, cal:$('cal').value, mult:simClock.speedMult, dens:gfx.curD, dprc:view.dprCap,
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
    if(s.mult > 0 && s.mult !== simClock.speedMult) setMultExp(Math.log10(s.mult));
    if(s.dprc === 1 || s.dprc === 2){ if(s.dprc !== view.dprCap){ view.dprCap = s.dprc; resize(); } }   // the probe's pixel cap, kept
    if(s.dens){ const i = DETAIL_D.indexOf(s.dens);
      if(i >= 0){ $('detail').value = i; $('detailv').textContent = DETAIL_NAMES[i];   // the slider shows the tier even when it is the boot tier
        if(s.dens !== gfx.curD) $('detail').dispatchEvent(new Event('input')); } }
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
let calMode='ad', unitMode: UnitMode = 'words';
const fmtYears = (y: number) => fmtYearsIn(y, unitMode);
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
  cam.followTarget = 'sun';
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
    simClock.simT = (Date.now() - Date.UTC(2026, 0, 1)) / (365.2425*86400e3);
    simClock.nextSample = simClock.simT + simClock.dtSample; refillTrails();
    // never unpause someone who asked for reduced motion
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
    return;
  }
  simClock.simT = (a - AGE0)*1e9/YR_PER_SIM;
  if(sel.value === '11.3586'){
    // Lands where the Sun has swollen to ten times its size and runs to the moment its
    // surface passes Earth's orbit: 768 Myr of red giant, played out in about 35
    // seconds. The frame is two and a half AU, so the disc grows from a small circle
    // to something that fills it and takes the inner planets on the way.
    if($('tView').classList.contains('on')) $('tView').click();
    if($('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; cam.coreLock = false;
    cam.dist = cam.distGoal = 1.14e-6;
    cam.yaw = 0.6; cam.pitch = 0.34;
    cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '12.35'){
    // Lands 20 Myr short of the shell: at ten million years a second it is cast in seven
    // seconds and fades over the next thirty. The frame is ~3.5 ly, the shell's full
    // reach, the eye following what is left of the Sun.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; cam.coreLock = false;
    cam.dist = cam.distGoal = 0.1;
    cam.yaw = 0.9; cam.pitch = 0.28;
    cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '8.36149'){
    // Lands 0.7 Gyr short of the first passage — ~95,000 parsecs, drawn to scale, so
    // the disks never touch; watch the far outer disks reach for each other instead.
    // At a hundred million years a second the pass arrives in about seven.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; cam.coreLock = true;
    // set outright, not eased: the climb from dive scale spans eleven decades and would
    // spend the whole approach travelling instead of watching it
    cam.dist = cam.distGoal = 15500;
    cam.yaw = 5.9257; cam.pitch = 0.5771;
    cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '11.25'){
    // The main event: the second passage at ~30 kpc, the third at ~13, and the slide
    // into one elliptical — 2.3 Gyr in about 23 seconds. The camera stands far enough
    // back to hold both galaxies as they close.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!$('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; cam.coreLock = true;
    cam.dist = cam.distGoal = 9200;
    cam.yaw = 5.6; cam.pitch = 0.62;
    cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '4.5692567'){
    // stage the pass: the camera frames the Oort cloud with the star already in view.
    // It lands at the shell's outer edge, 1.6 ly out; at 1,900 years a second the
    // crossing — 3.2 ly at 14.4 km/s — takes almost exactly 35 seconds.
    if($('tView').classList.contains('on')) $('tView').click();
    if($('tDive').classList.contains('on')) $('tDive').click();
    cam.follow = true; cam.coreLock = false;
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
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  simClock.nextSample = simClock.simT + simClock.dtSample;
  events.length = 0; puffs.length = 0;
  lifeAcc.accB = lifeAcc.accSN = lifeAcc.accPN = 0;
  refillTrails();
}
$('jump').addEventListener('change', e=>{ cam.reseedFollow=true; cam.panF[0]=cam.panF[1]=0; jumpToEpoch(e); });
$('jumpGo').addEventListener('click', ()=>{
  jumpToEpoch();
  // the point of GO is to watch the scenario, so the panel steps aside — unless the
  // visitor would rather keep it open and try one scenario after another
  if($('closeOnGo').checked && pState.simPanel.o) setPanelOpen('simPanel', false);
});
function humanYear(){
  // Two clocks, and each reading takes the one it actually measures. A year IS one
  // orbit of the Earth, and the Earth is drawn orbiting once per simulated year, so the
  // civil calendars advance one year per simulated year — exactly, not approximately.
  // The deep-time eras below measure elapsed galactic time instead, on the same clock
  // as the age and galactic-year stats, since that is what they are counting. The two
  // diverge by the compression factor, which is the whole subject of the piece; jump to
  // a galactic epoch and the civil year is the reading that stops meaning anything.
  const el = simClock.simT*YR_PER_SIM;      // galactic clock: real years elapsed
  const g = 2026 + simClock.simT;           // planetary clock: Earth orbits counted
  const fmt = n => Math.floor(n).toLocaleString('en-US');
  switch(calMode){
    case 'ah':   return fmt((g-621.57)*1.03069)+' A.H.'; // lunar years run ~3% faster
    case 'vs':   return fmt(g+57)+' V.S.';
    case 'saka': return fmt(g-78)+' Śaka';
    case 'am':   return fmt(g+3760)+' A.M.';
    case 'al':   return fmt(g+4000)+' A.L.';
    case 'he':   return fmt(g+10000)+' view.H.E.';          // Holocene calendar: +10,000 yr
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
toggle($('tView'), on=>{ cam.followTarget='sun'; cam.follow=!on; cam.distGoal = on? 4300 : 150; cam.reseedFollow=true; cam.panF[0]=cam.panF[1]=0; });
function refillTrails(){
  bodyPos(0, simClock.simT, tmpSun);
  trailAnchor[0]=tmpSun[0]; trailAnchor[1]=tmpSun[1]; trailAnchor[2]=tmpSun[2];
  // The trail is the path the viewer has watched being swept: sample TRAIL_N−1 is now and
  // the brightest, sample 0 the earliest seen and the dimmest. With the clock running
  // backwards "earliest seen" is the LATER sim time, so the samples run the other way —
  // otherwise the trail pointed into the sim-past, which in reverse lies ahead of the
  // body, and it led instead of trailed.
  const dirT = simClock.shuttle < 0 ? -1 : 1;
  for(let i=0;i<NB;i++){
    const a=trails[i];
    for(let k=0;k<TRAIL_N;k++){
      trailPos(i, simClock.simT - dirT*((TRAIL_N-1)-k)*simClock.dtSample, tmp);
      a[k*3]=tmp[0]; a[k*3+1]=tmp[1]; a[k*3+2]=tmp[2];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,trailBufs[i]);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,a);
  }
}
function setBodySizes(){ gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize); gl.bufferData(gl.ARRAY_BUFFER, REAL_MODE?realSizes:dispSizes, gl.STATIC_DRAW); }
setBodySizes();   // real proportions from the first frame
toggle($('tDive'), on=>{ cam.panF[0]=cam.panF[1]=0;
  cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
  if(on){
    if($('tView').classList.contains('on')) $('tView').click();  // diving follows the Sun
    cam.followTarget='sun'; cam.follow=true;
    cam.coreLock=true; cam.yaw=0; cam.pitch=0;   // start looking straight down the line to the core
    cam.distGoal=3.5e-5; // ~75 AU across: the whole planetary system, Kuiper belt included
  } else { cam.coreLock=false; cam.distGoal=150; }
});
// Star density as one row of choices rather than stacked overrides. The top settings
// are enormous — x8 is some seventeen million sprites — so a failed allocation falls
// back to what was working instead of leaving a half-built galaxy.
const DETAIL_D = [1,5,20,40,80,160];
const DETAIL_NAMES = ['lowest','low','medium','high','max','ultra'];
$('detail').addEventListener('input', e=>{
  const i = Math.max(0, Math.min(5, Math.round(+e.target.value)));
  const prev = gfx.curD;
  try{ setGalaxy(DETAIL_D[i]); }
  catch(err){ try{ setGalaxy(prev); }catch(e2){}
    const j = DETAIL_D.indexOf(gfx.curD); if(j>=0) e.target.value = j; }
  $('detailv').textContent = DETAIL_NAMES[DETAIL_D.indexOf(gfx.curD)] || DETAIL_NAMES[0];
});
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
  { t:'hud',      k:'Settings',   s:"Everything else: what is drawn, the sound, the readouts." },
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
    const wide = r.width > view.W*0.6;
    const onLeft = r.left + r.width/2 < view.W/2;
    // On a narrow screen a hint set beside its target leaves the two columns
    // overlapping, and then no two hints may share a row. Pinned to the edges they
    // clear each other, and the connector still says which is which.
    const tight = view.W < 620;
    let x = tight ? (onLeft ? 14 : view.W - bw - 14)
          : wide  ? Math.min(Math.max(r.left, 14), view.W-bw-14)
                  : (onLeft ? r.right + GAP : r.left - GAP - bw);
    let y = wide ? (r.top > view.H/2 ? r.top - GAP - bh : r.bottom + GAP)
                 : r.top + Math.min(r.height/2, 24) - bh/2;
    x = Math.min(Math.max(x, 14), view.W - bw - 14);
    y = Math.min(Math.max(y, 14), view.H - bh - 14);
    // Look over the whole column rather than stepping downward and giving up: on a
    // narrow screen the free room is in the bands above and below the card, which a
    // one-directional walk never reaches. Candidates are tried nearest-first, so a
    // hint stays beside its target when it can and travels only as far as it must.
    let cand = { left:x, top:y, right:x+bw, bottom:y+bh };
    if(clash(cand)){
      // the other flank as well as the other height: with two columns of hints on a
      // narrow screen, a free row often exists only on the side the hint did not want
      const xAlt = tight ? (onLeft ? view.W - bw - 14 : 14)
        : Math.min(Math.max(wide ? view.W - bw - 14
                    : (x > r.left ? r.left - GAP - bw : r.right + GAP), 14), view.W - bw - 14);
      const lo = 14, hi = Math.max(lo, view.H - bh - 14), slots = [];
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
  if(!simClock.paused){ tourHeldClock = true; $('tPause').click(); }   // nothing moves while you read
  requestAnimationFrame(()=> requestAnimationFrame(drawTourLines));
}
$('tourGo').addEventListener('click', ()=>{
  $('tour').style.display = 'none';
  setPanelOpen('env', true);                                 // the readings are the default view
  if(tourHeldClock && simClock.paused) $('tPause').click();            // and starts when you do
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

function placeLabel(el, x, y, show){
  if(!labelSteady){
    if(show){ el.style.display='block'; el.style.left=x+'px'; el.style.top=y+'px'; }
    else el.style.display='none';
    return;
  }
  const s = el._lb || (el._lb = { x, y, on:false, hid:0, leaps:0, calm:99, spin:false });
  if(!show){
    s.hid += readout.frameDt; s.x = x; s.y = y;
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
  else { const k = 1 - Math.exp(-readout.frameDt/0.06); s.x += (x - s.x)*k; s.y += (y - s.y)*k; }
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
   // dprCap: the first-launch probe lowers it on a slow device
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
function skyProjection(near, far){ const m = perspective(Math.PI/3, view.W/view.H, near, far); m[0] *= SKY_MIRROR; return m; }
function resize(){
  view.DPR=Math.min(view.dprCap, devicePixelRatio||1);
  view.W=innerWidth; view.H=innerHeight;
  canvas.width=view.W*view.DPR; canvas.height=view.H*view.DPR;
  gl.viewport(0,0,canvas.width,canvas.height);
  view.projMat = skyProjection(0.5, 20000);
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
    hiddenState = { sim: !simClock.paused, music: sound.musicOn && !!player.src, audio: !!sound.graph };
    if(hiddenState.sim) $('tPause').click();
    if(hiddenState.music) player.pause();   // harmless if the browser got there first
    if(sound.graph && sound.graph.ctx.state === 'running') sound.graph.ctx.suspend().catch(()=>{});
  } else {
    const was = hiddenState; hiddenState = null;
    if(!was) return;
    if(was.sim && simClock.paused) $('tPause').click();
    if(was.audio && sound.graph && sound.graph.ctx.state === 'suspended') sound.graph.ctx.resume().catch(()=>{});
    // play() can be refused after a long background; armUnlock retries on the next touch
    if(was.music && sound.musicOn && player.paused) player.play().catch(()=>armUnlock());
  }
});

// ---------- main loop ----------
gl.disable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE);
gl.clearColor(0.010,0.015,0.040,1);


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

// Following is exact; only transitions ease. The offset decays toward zero and never
// re-grows from the target's own motion — easing the position itself made the camera
// trail a moving Sun by up to 20% of the view, so at dive zoom the Sun slid across the
// frame every time a touch held the clock and the lag collapsed.

const org=new Float64Array(3); // rendering origin: the Sun, in double precision
const sunSizeTmp=new Float32Array(1), eatSizeTmp=new Float32Array(1);
   // to tell the clock running across an engulfment from a jump past it
      // the nebula is on screen this frame: the label follows it
// Once the Sun's true disc spans more than a few pixels, the point sprite hands over to
// a procedural star: limb-darkened granulation that churns, prominence arcs that rise
// and fall with a slow magnetic-storm cycle, and a streaked corona. All of it is noise
// shaped in the fragment shader — no texture, and nothing about its SIZE is stylised:
// the disc is the Sun's real diameter at the real distance.


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


// ---------- the first-launch performance probe ----------
// A first visit has no saved quality. Two frames in — the programs compiled, the first
// scenario's camera set — the galaxy's own star pass is drawn into a hidden framebuffer
// of the canvas's size, over and over for about thirty milliseconds, and gl.finish()
// plus a one-pixel read make the GPU account for all of it. The time one pass takes,
// on the lowest tier's ~95,000 points, sets the quality row (lowest, low or medium —
// never more: medium is already two million points and the heavier tiers are a
// choice, not a default) and caps the pixel ratio at 1 when even that pass is slow.
let probeFrames = 0;
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
    gl.useProgram(pPt); gl.bindVertexArray(gfx.vaoGxy);        // the uniforms as the last frame left them
    gl.drawArrays(gl.POINTS, 0, gfx.N_GXY); sync();             // warm-up: not timed
    const t0 = performance.now();
    do{ gl.drawArrays(gl.POINTS, 0, gfx.N_GXY); passes++; sync(); }
    while(performance.now() - t0 < 30 && passes < 40);
    ms = (performance.now() - t0)/passes;
  }catch(e){ ms = -1; }
  gl.bindVertexArray(null); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fb); gl.deleteTexture(tex);
  gl.viewport(0, 0, canvas.width, canvas.height);
  return { ms, passes, points: gfx.N_GXY, px: pw + '×' + ph };
}
// one pass at density D costs about ms·D/2 (denser tiers draw smaller points); with the
// rest of the frame the budget is eleven milliseconds, which keeps sixty frames a second
const pickDetail = ms => ms < 0 ? 1 : ms*20*0.5 + 3 <= 11 ? 2 : ms*5*0.5 + 3 <= 11 ? 1 : 0;
function runFirstLaunchProbe(){
  const r = perfProbe();
  r.msLow = r.ms < 0 ? -1 : r.ms * 95000 / Math.max(1, r.points);   // per pass of the lowest tier's points, whatever tier was drawn
  const d = pickDetail(r.msLow);
  if(r.msLow > 8){ view.dprCap = 1; resize(); }                  // a slow fill: fewer pixels first
  r.detail = DETAIL_NAMES[d]; r.dpr = view.DPR; readout.probeInfo = r;
  $('detail').value = d; $('detail').dispatchEvent(new Event('input'));
  saveSettingsNow();                                         // at once: a tab closed inside the debounce would probe again
  try{ $('buildStamp').textContent += ' · probe ' + (r.ms < 0 ? 'failed' : r.msLow.toFixed(1) + ' ms/pass') + ' → ' + r.detail + (view.dprCap < 2 ? ', 1× pixels' : ''); }catch(e){}
}

function frame(now){
  const dt = Math.min(0.05,(now-simClock.last)/1000); simClock.last=now;
  simClock.shimT += dt; // variables keep twinkling even while the simulation is paused
  const drive = simClock.shuttle !== 0 ? simClock.shuttle/100 : (simClock.paused ? 0 : 1);   // the shuttle outranks pause
  const sign = Math.sign(drive);
  if(sign !== simClock.shuttleLastSign){           // a change of direction: the swept path is recomputed
    simClock.shuttleLastSign = sign;               // for this moment, not extended from a stale end
    if(sign !== 0){ refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }
  }
  let n=0;                                // trail samples taken this frame; read below
  if(drive !== 0 && !holding){
    simClock.simT += dt*simClock.speed*simClock.speedMult*drive;
    // the clock in years a second decides whether the globe still has days (see uAvg)
    { const yps = simClock.speed*simClock.speedMult*Math.abs(drive); const want = Math.max(0, Math.min(1, (Math.log10(Math.max(1e-9, yps)) + 1.3)));
      readout.avgLight += (want - readout.avgLight)*Math.min(1, dt*4); }
    if(drive < 0){
      // backwards: the trail is the path swept up to now, so it retracts — recomputed
      // from the clock at ~10 Hz rather than every frame (2400 samples a body)
      if(now - simClock.trailRefillAt > 100){ simClock.trailRefillAt = now; refillTrails(); }
      simClock.nextSample = simClock.simT + simClock.dtSample;
    } else {
    while(simClock.nextSample<=simClock.simT && n<400){
      for(let i=0;i<NB;i++) pushTrail(i,simClock.nextSample);
      simClock.nextSample+=simClock.dtSample; n++;
    }
    if(simClock.nextSample<=simClock.simT) simClock.nextSample=simClock.simT+simClock.dtSample; // skip backlog at extreme speeds
    }
    // While zoomed into the system, drift between the Sun and the trail anchor eats the
    // float precision that the anchor exists to protect. Re-anchor once it passes a
    // third of a unit, at most once a second — a rebuild is a few milliseconds.
    if(cam.dist < 0.13 && now - simClock.lastAnchor > 1000){
      const dx=org[0]-trailAnchor[0], dy=org[1]-trailAnchor[1], dz=org[2]-trailAnchor[2];
      if(dx*dx+dy*dy+dz*dz > 0.09){ simClock.lastAnchor = now; refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }
    }
    if(n>0){
      for(let i=0;i<NB;i++){
        gl.bindBuffer(gl.ARRAY_BUFFER,trailBufs[i]);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,trails[i]);
      }
    }
    if(lifeOn) lifeStep(dt, dt*simClock.speed*simClock.speedMult);
  }

  // body positions, stored relative to the Sun (the rendering origin) — exact in doubles,
  // so a real-scale zoom to sub-AU distances is free of float32 jitter
  bodyPos(0,simClock.simT,org);
  for(let i=0;i<NB;i++){
    bodyPos(i,simClock.simT,tmp);
    bodyPosArr[i*3]=tmp[0]-org[0]; bodyPosArr[i*3+1]=tmp[1]-org[1]; bodyPosArr[i*3+2]=tmp[2]-org[2];
  }
  if(REAL_MODE){ // the Sun's sprite: true diameter once close enough, else a small findable dot
    // realSizes[0] is the Sun's diameter today; the model scales it, so a red giant is
    // drawn at the size the model says it has rather than at a fixed dot
    const sunDia = realSizes[0]*sunState(ageGyr()).R;
    readout.plasmaSunPx = sunDia*((view.H*view.DPR)/(2*Math.tan(Math.PI/6)))/readout.camSunDist;   // the camera's distance to the SUN: from Earth it is an AU
    readout.globePx = realSizes[3]*((view.H*view.DPR)/(2*Math.tan(Math.PI/6)))/cam.dist;
    // the findable dot stands down once the true disc takes over
    sunSizeTmp[0] = readout.plasmaSunPx > 7 ? 0.0 : Math.max(sunDia, readout.camSunDist*0.0075);
    gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize); gl.bufferSubData(gl.ARRAY_BUFFER,0,sunSizeTmp);
  }
  // The Sun's colour, and the inner planets' fate. Both read the same model.
  const ssNow = sunState(ageGyr()), tint = sunTint(ssNow.T);
  bodyCol[0]=tint.dot[0]; bodyCol[1]=tint.dot[1]; bodyCol[2]=tint.dot[2];
  {
    // Engulfment latches on age, never on the current radius (the Sun shrinks again
    // after the tip; the planet does not come back). A flare starts only when the clock
    // runs across the moment — a jump that lands past it finds the planet already gone.
    const a = ageGyr(), jumped = Math.abs(a - simClock.lastAgeSeen) > 0.05;
    for(let i=1;i<=3;i++){
      const now = a >= EAT_AGES[i];
      if(now && !wasEaten[i] && !jumped) eatFlash[i] = 0;
      if(!now) eatFlash[i] = -1;
      wasEaten[i] = now;
      if(eatFlash[i] >= 0){ eatFlash[i] += dt; if(eatFlash[i] > 1.6) eatFlash[i] = -1; }
      // hidden for good once inside; the flare is its own pass over the disc — and Earth's
      // dot stands down while the globe is drawn in its place
      eatSizeTmp[0] = now ? 0 : (i === 3 && readout.globePx > 4) ? 0 : realSizes[i];
      gl.bindBuffer(gl.ARRAY_BUFFER,bufBodySize); gl.bufferSubData(gl.ARRAY_BUFFER,i*4,eatSizeTmp);
    }
    simClock.lastAgeSeen = a;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyCol); gl.bufferSubData(gl.ARRAY_BUFFER,0,bodyCol,0,3);
  gl.bindBuffer(gl.ARRAY_BUFFER,bufBodyPos);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,bodyPosArr);

  // camera — the view matrix is built Sun-relative for the same precision reason
  // Earth's world position in doubles: the follow target when the view is hers
  bodyPos(3, simClock.simT, earthW);
  const moonHere = cam.followTarget === 'moon' && !wasEaten[3] && ageGyr() > MOON_BORN;
  if(moonHere) moonPos(simClock.simT, moonW);                                  // the camera needs her before the draw does
  const followPos = cam.followTarget === 'and' ? andPos
                  : moonHere ? moonW
                  : ((cam.followTarget === 'earth' || cam.followTarget === 'moon') && !wasEaten[3]) ? earthW : org;
  const goal = cam.follow ? [followPos[0],followPos[1],followPos[2]] : [0,0,0];
  if(cam.reseedFollow){ for(let i=0;i<3;i++) cam.smoothOfs[i] = cam.smoothTarget[i]-goal[i]; cam.reseedFollow=false; }
  const k = cam.firstFrame?1:Math.min(1,dt*4);
  for(let i=0;i<3;i++) cam.smoothOfs[i] *= 1-k;
  { // cap the transition offset at 20% of the view distance, so deep zooms never lose the Sun
    const lag=Math.hypot(cam.smoothOfs[0],cam.smoothOfs[1],cam.smoothOfs[2]), maxLag=cam.dist*0.2;
    if(lag>maxLag){ const f=maxLag/lag; cam.smoothOfs[0]*=f; cam.smoothOfs[1]*=f; cam.smoothOfs[2]*=f; }
  }
  for(let i=0;i<3;i++) cam.smoothTarget[i] = goal[i]+cam.smoothOfs[i];
  // log-space zoom smoothing: uniform speed per decade across 11 orders of magnitude
  cam.dist = Math.exp(Math.log(cam.dist)+(Math.log(cam.distGoal)-Math.log(cam.dist))*Math.min(1,dt*4));
  cam.firstFrame=false;
  let baseYaw = 0, basePitch = 0;
  if(cam.coreLock){
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
  const spinOn = cam.spinLock && cam.follow && cam.followTarget === 'earth' && !wasEaten[3];
  if(spinOn){
    // the same three vectors, but in the planet's frame: x → prime meridian P, y → axis A,
    // z → −Q (so the frame keeps the world's handedness); the frame turns with the spin
    const [P, A, Q] = spinFrame();
    rx = cy*P[0]+sy*Q[0]; ry = cy*P[1]+sy*Q[1]; rz = cy*P[2]+sy*Q[2];
    ux = -sp*sy*P[0]+cp*A[0]+sp*cy*Q[0]; uy = -sp*sy*P[1]+cp*A[1]+sp*cy*Q[1]; uz = -sp*sy*P[2]+cp*A[2]+sp*cy*Q[2];
    dx = cp*sy*P[0]+sp*A[0]-cp*cy*Q[0]; dy = cp*sy*P[1]+sp*A[1]-cp*cy*Q[1]; dz = cp*sy*P[2]+sp*A[2]-cp*cy*Q[2];
    upV = A;
  }
  cam.dirW[0] = dx; cam.dirW[1] = dy; cam.dirW[2] = dz;                     // read by the spin lock's switch
  const pv = 1.1547*cam.dist, pdx = -cam.panF[0]*pv*SKY_MIRROR, pdy = cam.panF[1]*pv;
  const tgx=cam.smoothTarget[0]-org[0] + rx*pdx + ux*pdy,
        tgy=cam.smoothTarget[1]-org[1] + ry*pdx + uy*pdy,
        tgz=cam.smoothTarget[2]-org[2] + rz*pdx + uz*pdy;
  const eye=[ tgx+cam.dist*dx, tgy+cam.dist*dy, tgz+cam.dist*dz ];
  readout.camSunDist = Math.hypot(eye[0], eye[1], eye[2]) || cam.dist;   // Sun-relative eye: how far the Sun is
  const viewMat = lookAt(eye, [tgx,tgy,tgz], upV);
  // near plane tracks the zoom so sub-AU views don't clip
  view.projMat = skyProjection(Math.min(0.5, Math.max(1e-13, cam.dist*0.04)), 25000);   // no depth buffer: a tiny near plane costs nothing, and Earth needs it
  const pxScale = (view.H*view.DPR)/(2*Math.tan(Math.PI/6));

  // at 100% nothing is compressed, so the old direct path is kept exactly
  const toneOn = view.hdrOK && coreKnee < 0.999;
  if(toneOn) bindHDR();
  gl.clear(gl.COLOR_BUFFER_BIT);

  // points: stars, galaxy, bodies
  gl.useProgram(pPt);
  gl.uniformMatrix4fv(U.ptProj,false,view.projMat);
  gl.uniformMatrix4fv(U.ptView,false,viewMat);
  const and = updateAnd();
  const gl710 = g710();   // read by the Oort brightening before the star is drawn
  const deep = REAL_MODE && cam.dist<1.0; // inside ~30 ly: keep the backdrop point-like
  // Inside the disk the band's light — haze, HII regions, the core — all lies BEHIND
  // the local dust: that is the Great Rift. So from in here the whole backdrop goes
  // down first and the dust over it; from outside the arms' HII knots sit on top of
  // the lanes and are drawn after (v2.56.1). Same zone as the haze fade's.
  const insideDisk = cam.dist < 45;
  // every disk star travels at the same flat-curve speed as the Sun, and an elliptical
  // does not rotate coherently: the rate dies away as the remnant relaxes. diskSpin()
  // is that rate's integral, so the angle only ever grows (never zero either — uSpin==0.0
  // is the shader's "not a galaxy" gate).
  const spin = diskSpin(simClock.simT);
  const warp = -2*Math.PI*simClock.simT/650e6; // warp precession: retrograde, ~650 Myr per turn
  const spinMW  = spin;
  const spinM31 = spin*1.07;   // M31's flat curve runs ~7% faster
  const sunX=org[0], sunY=org[1], sunZ=org[2];
  const bubY = REAL_MODE ? sunY+1e8 : sunY; // real scale: nothing is magnified, so no clearance bubble
  gl.uniform1f(U.ptPx,pxScale);
  gl.uniform1f(U.ptWA, 0.0);
  gl.uniform1f(U.ptTime, simClock.shimT);
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
  gl.uniformMatrix4fv(UN.proj,false,view.projMat);
  gl.uniformMatrix4fv(UN.view,false,viewMat);
  gl.uniform1f(UN.px,pxScale);
  // The haze must dim as the camera closes in, whatever the mode: nearby sprites
  // project enormous and stack into a whiteout. From inside the system the Milky Way
  // stays visible as a band — a quarter strength — rather than vanishing outright.
  gl.uniform1f(UN.gf, Math.min(1, Math.max(0.25, cam.dist/45)));
  gl.uniform1f(UN.time, simClock.shimT);
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
    if(which !== 'and'){ gl.bindVertexArray(gfx.vaoNeb); seg(gfx.NEB_PINK, gfx.NEB_GLOW, gfx.NEB_N); }
    if(gfx.vaoAndNeb && which !== 'mw'){
    gl.uniformMatrix3fv(UN.grot, false, M31_ROT);
    gl.uniform3f(UN.goff, andPos[0], andPos[1], andPos[2]);
    gl.uniform1f(UN.spin, spinM31);
    gl.uniform1f(UN.warpAmp, 0.35);
    gl.uniform3f(UN.and, 0, 0, 0);
    gl.uniform3f(UN.sun, sunX, sunY+1e8, sunZ);
      gl.bindVertexArray(gfx.vaoAndNeb); seg(gfx.AND_PINK, gfx.AND_GLOW, gfx.N_ANDN);
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
    gl.uniformMatrix4fv(UD.proj,false,view.projMat);
    gl.uniformMatrix4fv(UD.view,false,viewMat);
    gl.uniform1f(UD.px,pxScale);
    gl.uniform1f(UD.wa, 1.0); // dust lanes trace the wave
    // The ceiling is in device pixels, so on a narrow canvas one disc covers far more
    // sky and the multiply compounds faster than the additive haze — the band went black
    // on a 400 px phone at the desktop's 40. Scaled by canvas width, 900 being the width
    // it was judged at. Between the dive and the wider views the eye is still in the
    // disk with the backdrop beneath the dust, so the ceiling stays moderate there too.
    gl.uniform1f(UD.cap, deep ? gfx.DUST_DEEP_CAP * Math.min(1.5, Math.max(0.45, canvas.width/900))
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
    if(which !== 'and'){ gl.bindVertexArray(gfx.vaoDust); gl.drawArrays(gl.POINTS,0,gfx.DUST_N); }
    if(gfx.vaoAndDust && which !== 'mw'){
      gl.uniformMatrix3fv(UD.grot, false, M31_ROT);
      gl.uniform3f(UD.goff, andPos[0], andPos[1], andPos[2]);
      gl.uniform1f(UD.spin, spinM31);
      gl.uniform1f(UD.warpAmp, 0.35);
      gl.uniform3f(UD.and, 0, 0, 0);
      gl.uniform3f(UD.sun, sunX, sunY+1e8, sunZ);
      gl.bindVertexArray(gfx.vaoAndDust); gl.drawArrays(gl.POINTS,0,gfx.N_ANDD);
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
  const gaiaFade = REAL_MODE ? 0 : 1 - Math.min(1, Math.max(0, (cam.dist - 210)/280));
  if(gfx.gaiaOn && gfx.vaoGaia && gaiaFade < 0.999){
    gl.uniform1f(U.ptFade, gaiaFade);
    gl.uniform3f(U.ptOrg, 0,0,0);
    // Real Gaia DR3 space velocities: each star drifts along its measured track. A
    // straight line is only honest for so long, so the extrapolation stops at +-20 Myr —
    // beyond that the local sky simply holds its furthest computed shape.
    gl.uniform1f(U.velT, Math.max(-2e7, Math.min(2e7, simClock.simT)) * 1.1119e-7);
    // The bubble rides the Sun's orbital frame. Its coordinates are Sun-relative, so the
    // wave-rotation path — a rigid turn about the origin — turns it about the Sun by the
    // Sun's own orbital angle: the side that faces the galactic centre keeps facing it
    // (over 20 Myr the Sun turns through 32 degrees, which is anything but negligible).
    gl.uniform1f(U.ptWA, 1.0);
    gl.uniform1f(U.ptSpin, (simClock.simT*V_GAL/900) * 640);
    gl.bindVertexArray(gfx.vaoGaia); gl.drawArrays(gl.POINTS,0,gfx.N_GAIA);
    if(gfx.vaoGaiaDeep && gfx.curD >= 5){ gl.bindVertexArray(gfx.vaoGaiaDeep); gl.drawArrays(gl.POINTS,0,gfx.N_GAIA_DEEP); }
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
  gl.bindVertexArray(gfx.vaoGxy);
  if(insideDisk && gfx.hideNucleus && gfx.NUC1 > gfx.NUC0){   // the centre's own stars stay behind the dust
    if(gfx.NUC0 > 0) gl.drawArrays(gl.POINTS, 0, gfx.NUC0);
    if(gfx.N_GXY > gfx.NUC1) gl.drawArrays(gl.POINTS, gfx.NUC1, gfx.N_GXY - gfx.NUC1);
  } else gl.drawArrays(gl.POINTS,0,gfx.N_GXY);

  // Andromeda: generated flat in its own disk frame; uGRot turns it to its measured
  // orientation — the two disks stand 120° apart, nowhere near parallel — and uGOff
  // carries it along its orbit. It spins its real way, ~7% faster than we do, and its
  // tide pulls toward the Milky Way: the bridge is mutual, both disks reaching.
  if(gfx.vaoAnd){
    gl.uniformMatrix3fv(U.ptGRot, false, M31_ROT);
    gl.uniform3f(U.ptGOff, andPos[0], andPos[1], andPos[2]);
    gl.uniform1f(U.ptSpin, spinM31);
    gl.uniform1f(U.ptWarpAmp, 0.35);
    gl.uniform3f(U.ptSun, sunX, sunY+1e8, sunZ);   // no clearance bubble in its frame
    gl.uniform3f(U.ptAnd, 0, 0, 0);
    gl.uniform1f(U.ptVM, 0.0);
    gl.bindVertexArray(gfx.vaoAnd); gl.drawArrays(gl.POINTS,0,gfx.N_AND);
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
    if(readout.evN){
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,evPos.subarray(0,readout.evN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,evSize.subarray(0,readout.evN));
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,evCol.subarray(0,readout.evN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,evGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,evWave.subarray(0,readout.evN));
      gl.bindVertexArray(evGL.vao); gl.drawArrays(gl.POINTS,0,readout.evN);
    }
    // the blasts, in their own pass, on top of everything the flash lights up
    if(readout.snN){
      gl.useProgram(pSN);
      gl.uniformMatrix4fv(USN.proj,false,view.projMat);
      gl.uniformMatrix4fv(USN.view,false,viewMat);
      gl.uniform1f(USN.px, pxScale);
      gl.uniform1f(USN.spin, spinMW);
      gl.uniform1f(USN.warp, warp);
      gl.uniform1f(USN.cap, deep?36.0:110.0);
      gl.uniform3f(USN.sun, sunX, bubY, sunZ);
      gl.uniform3f(USN.org, org[0], org[1], org[2]);
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,snPos.subarray(0,readout.snN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,snSize.subarray(0,readout.snN));
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,snCol.subarray(0,readout.snN*3));
      gl.bindBuffer(gl.ARRAY_BUFFER,snGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,snPh.subarray(0,readout.snN));
      gl.bindVertexArray(snGL.vao); gl.drawArrays(gl.POINTS,0,readout.snN);
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
    gl.uniformMatrix4fv(UREM.proj,false,view.projMat);
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
    gl.uniformMatrix4fv(U.trProj,false,view.projMat);
    gl.uniformMatrix4fv(U.trView,false,viewMat);
    gl.uniform1f(U.trLen,TRAIL_N);
    // A local `last`, shadowing nothing — the clock's own `last` is a property now. It was
    // a plain top-level shadow before, which is why the mechanical rename reached it.
    const last = (showP9 ? NB : I_P9)-1;
    // the origin for anchored buffers, subtracted in double precision
    const aox = org[0]-trailAnchor[0], aoy = org[1]-trailAnchor[1], aoz = org[2]-trailAnchor[2];
    gl.uniform3f(U.trOrg, aox, aoy, aoz);
    for(let i=last;i>=0;i--){
      const c=BODIES[i][4];
      if(i === I_P9 && !showP9) continue;
      if(i >= N_PLANETS && i < I_P9 && !showDwarfs) continue;
      if(i <= 3 && i > 0 && wasEaten[i]) continue;   // no path for a planet that is gone
      if(readout.globePx > 40) continue;   // zoomed onto the globe, every orbit and helix is a line across the sky
      if(i > 0){
        if(!solarClose) continue;                    // collapsed into the Sun's point
        const spo = BODIES[i][1]/simClock.dtSample;
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
  drawBelts({
    projMat: view.projMat!, viewMat, pxScale, camDist: cam.dist, simT: simClock.simT,
    g710Dist: gl710.d, showBelt, showKuiper, showOort,
  });
  if(showOort){
    // boundary: wireframe-sphere hint of the shell
    gl.useProgram(pRing);
    gl.uniformMatrix4fv(UR.uProj,false,view.projMat);
    gl.uniformMatrix4fv(UR.uView,false,viewMat);
    gl.uniform3f(UR.uSun,0,0,0);
    gl.uniform1f(UR.uR, REAL_MODE?178.0*OO_REAL:178.0);
    gl.uniform3f(UR.uColor,0.10,0.13,0.19);
    gl.bindVertexArray(vaoRing);
    if(readout.globePx <= 40) for(const [A,B] of [[E1,E2],[E1,EN],[E2,EN]]){   // from a globe's zoom the shell is lines across the sky
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
  readout.moonPx = 0;
  // the pass opens on Earth's size, or on the Moon's when she is the one being followed
  if((readout.globePx > 4 || cam.followTarget === 'moon') && !wasEaten[3]){
    const a = ageGyr(), era = earthEra(a, environment().mean);
    const ex = bodyPosArr[9], ey = bodyPosArr[10], ez = bodyPosArr[11];
    const sunV = norm3(vecV(viewMat, [-ex, -ey, -ez]));
    const axV = norm3(vecV(viewMat, EARTH_AXIS));
    const prime = earthPrime(simClock.simT, tmp); const prV = norm3(vecV(viewMat, [prime[0],prime[1],prime[2]]));
    readout.earthDbg = { sunV, axV, prV, era };   // read by the debug tooling
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(pGlobe);
    gl.uniformMatrix4fv(UG.uProj,false,view.projMat); gl.uniformMatrix4fv(UG.uView,false,viewMat);
    gl.uniform1f(UG.uMirror, SKY_MIRROR); gl.uniform1f(UG.uTime, simClock.shimT);
    gl.uniform3f(UG.uSunV, sunV[0],sunV[1],sunV[2]); gl.uniform3f(UG.uAxisV, axV[0],axV[1],axV[2]); gl.uniform3f(UG.uPrimeV, prV[0],prV[1],prV[2]);
    gl.uniform1f(UG.uAvg, readout.avgLight);
    gl.uniform1f(UG.uMolten, era.molten); gl.uniform1f(UG.uOcean, era.ocean); gl.uniform1f(UG.uSea, era.sea); gl.uniform1f(UG.uHaze, era.haze);
    gl.uniform1f(UG.uVeg, era.veg); gl.uniform1f(UG.uIceLat, era.iceLat); gl.uniform1f(UG.uCloud, era.cloud); gl.uniform1f(UG.uLights, era.lights); gl.uniform1f(UG.uDrift, era.drift);
    gl.uniform1f(UG.uDry, era.dry); gl.uniform1f(UG.uSeaLevel, era.seaLevel);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, gfx.earthTex); gl.uniform1i(UG.uMap, 0);
    gl.uniform1f(UG.uHasMap, gfx.earthTex ? 1.0 : 0.0);
    fillPlateMats((a - AGE0)*1000); gl.uniformMatrix3fv(UG.uPlate, false, plateMats);
    const disc = 1/1.09, sz = Math.min(2400, readout.globePx/disc);
    gl.uniform1f(UG.uMoon, 0.0); gl.uniform1f(UG.uDisc, disc); gl.uniform1f(UG.uSz, sz);
    gl.uniform3f(UG.uPos, ex, ey, ez);
    gl.bindVertexArray(vaoGlobe); gl.drawArrays(gl.POINTS, 0, 1);
    if(a > MOON_BORN){
      moonPos(simClock.simT, moonW);
      moonRel[0] = moonW[0]-org[0]; moonRel[1] = moonW[1]-org[1]; moonRel[2] = moonW[2]-org[2];
      readout.moonPx = MOON_DIA*((view.H*view.DPR)/(2*Math.tan(Math.PI/6)))/cam.dist;
      if(readout.moonPx > 1.5){
        const msunV = norm3(vecV(viewMat, [-moonRel[0], -moonRel[1], -moonRel[2]]));
        gl.uniform3f(UG.uSunV, msunV[0],msunV[1],msunV[2]);
        gl.uniform1f(UG.uMoon, 1.0); gl.uniform1f(UG.uDisc, 1.0); gl.uniform1f(UG.uSz, Math.min(2400, readout.moonPx));
        gl.uniform3f(UG.uPos, moonRel[0], moonRel[1], moonRel[2]);
        gl.drawArrays(gl.POINTS, 0, 1);
      }
    }
    gl.blendFunc(gl.ONE, gl.ONE);
    // the Moon's orbit, once it spans more than a few pixels
    const d = moonDist(a), ringPx = 2*d*((view.H*view.DPR)/(2*Math.tan(Math.PI/6)))/cam.dist;
    if(a > MOON_BORN && ringPx > 14 && ringPx < 3*view.H*view.DPR){   // and not once it dwarfs the view
      gl.useProgram(pRing);
      gl.uniformMatrix4fv(UR.uProj,false,view.projMat); gl.uniformMatrix4fv(UR.uView,false,viewMat);
      gl.uniform3f(UR.uSun, ex, ey, ez); gl.uniform1f(UR.uR, d);
      gl.uniform3f(UR.uColor, 0.16, 0.20, 0.30);
      gl.uniform3f(UR.uA, MOON_M1[0],MOON_M1[1],MOON_M1[2]); gl.uniform3f(UR.uB, MOON_M2[0],MOON_M2[1],MOON_M2[2]);
      gl.bindVertexArray(vaoRing); gl.drawArrays(gl.LINE_LOOP, 0, RING_SEGS);
    }
  }

  // Gliese 710, on the same symbolic scale as the Oort cloud in the compressed view and
  // at its true separation in real scale, so it passes where the cloud actually is.
  if(gl710.d < 60){
    const k = REAL_MODE ? 1/30 : 178/1.6;      // scene units per light year
    g710Pos[0]=gl710.x*k; g710Pos[1]=gl710.y*k; g710Pos[2]=gl710.z*k;
    g710Size[0] = REAL_MODE ? Math.max(0.9, cam.dist*0.006) : 2.6;
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
  readout.pnShown = false;
  if(pn){
    const rScene = pn.rAU*AU2U, px = (2*rScene/0.74)*pxScale/readout.camSunDist;
    const outside = Math.min(1, Math.max(0, (readout.camSunDist/rScene - 1.15)/0.6));
    const alpha = pn.alpha*outside;
    if(alpha > 0.004 && px > 3){
      readout.pnShown = true;
      gl.useProgram(pPN);
      gl.uniformMatrix4fv(UPN.proj,false,view.projMat);
      gl.uniformMatrix4fv(UPN.view,false,viewMat);
      gl.uniform1f(UPN.time, simClock.shimT);
      gl.uniform1f(UPN.age, pn.age);
      gl.uniform1f(UPN.alpha, alpha);
      const burst = Math.exp(-Math.pow((pn.age - 0.07)/0.06, 2));   // the casting itself
      gl.uniform1f(UPN.burst, burst);
      gl.uniform1f(UPN.sz, Math.min(1800, px*(1 + 2.5*burst)));
      gl.bindVertexArray(vaoSunPt); gl.drawArrays(gl.POINTS,0,1);
    }
  }
  if(readout.plasmaSunPx > 7){
    // Drawn last, and not additively: the photosphere is opaque, so the disc must
    // occlude the sky behind it, with only the corona and arcs blending over it.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(pSunP);
    gl.uniformMatrix4fv(USn.proj,false,view.projMat);
    gl.uniformMatrix4fv(USn.view,false,viewMat);
    gl.uniform1f(USn.time, simClock.shimT);
    gl.uniform3f(USn.colD, tint.d[0], tint.d[1], tint.d[2]);
    gl.uniform3f(USn.colB, tint.b[0], tint.b[1], tint.b[2]);
    const sz = Math.min(1000, readout.plasmaSunPx*2.7);
    gl.uniform1f(USn.sz, sz);
    gl.uniform1f(USn.disc, readout.plasmaSunPx/sz);
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
    resolveTone(coreKnee);
    gl.blendFunc(gl.ONE, gl.ONE);
  }

  // labels
  readout.frameDt = dt;
  if(showLabels){
    const pv = mul(view.projMat, viewMat);
    const proj = (x, y, z) => { const cw = pv[3]*x+pv[7]*y+pv[11]*z+pv[15];
      return [cw, ((pv[0]*x+pv[4]*y+pv[8]*z+pv[12])/cw*0.5+0.5)*view.W, (-(pv[1]*x+pv[5]*y+pv[9]*z+pv[13])/cw*0.5+0.5)*view.H]; };
    let sunSX=0, sunSY=0;
    for(let i=0;i<NB;i++){
      const l=labelEls[i];
      if(i === I_P9 ? !showP9 : (i >= N_PLANETS && !showDwarfs)){ placeLabel(l, 0, 0, false); continue; }
      if(i > 0 && i <= 3 && wasEaten[i]){ placeLabel(l, 0, 0, false); continue; }   // swallowed
      if(readout.globePx > 40 && i > 0){ placeLabel(l, 0, 0, false); continue; }          // zoomed onto Earth: only the Sun's place in the sky
      if(i === 0) l.textContent = readout.pnShown ? 'Anthropic Nebula' : 'Sun';
      const [cw, lsx, lsy] = proj(bodyPosArr[i*3], bodyPosArr[i*3+1], bodyPosArr[i*3+2]);
      if(cw<=Math.max(1e-9,cam.dist*0.01) || cam.dist>900){ placeLabel(l, 0, 0, false); continue; }
      if(i===0){ sunSX=lsx; sunSY=lsy; }
      else if(REAL_MODE && Math.hypot(lsx-sunSX,lsy-sunSY)<14){ placeLabel(l, 0, 0, false); continue; }
      placeLabel(l, lsx, lsy, true);
      l.style.opacity = i===0?0.9:0.65;
    }
    // the Moon: labelled while it is drawn as a disc and stands clear of Earth's label
    if(readout.moonPx > 1.5){
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
      if(readout.globePx > 40){ el.style.display = 'none'; if(el._lb) el._lb.on = false; continue; }   // at once, not debounced
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
        if(a > 0 && !gfx.m31Map){ placeLabel(m31Els[a], 0, 0, false); continue; }
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
      const k = REAL_MODE ? 1/30 : 178/1.6;
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
  $('yrs').textContent = fmtYears(Math.abs(simClock.simT));
  $('pct').textContent = (simClock.simT/GAL_PERIOD*100).toFixed(3);
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
    const myr = simClock.simT*(225/GAL_PERIOD);                       // real megayears elapsed
    $('gAge').textContent = fmtYears(4.568e9 + myr*1e6);
    // Once the remnant has relaxed there are no laps left to count: the Sun's ordered
    // circular orbit has been scattered into a random one inside an elliptical, so the
    // readout turns to the thing that still means something — how far out it now sits.
    if(mergeAt(AGE0 + myr/1e3) > 0.9){
      $('lGyr').textContent = 'distance from centre';
      $('gGyr').textContent = (sunR(simClock.simT)*30/3261.6).toFixed(1)+' kpc';
    } else {
      $('lGyr').textContent = 'galactic years';
      $('gGyr').textContent = (4568/225 + sunPhase(simClock.simT)/(2*Math.PI)).toFixed(3);
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
  cv.style.width = (size/view.DPR) + 'px'; cv.style.height = (size/view.DPR) + 'px';   // sc DEVICE pixels a module
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
    time: { simT: simClock.simT, paused: simClock.paused },
    camera: { yaw:cam.yaw, pitch:cam.pitch, dist:cam.dist, distGoal:cam.distGoal,
              follow:cam.follow, coreLock: cam.coreLock, dive:$('tDive').classList.contains('on') },
    viewport: { w:innerWidth, h:innerHeight, dpr:devicePixelRatio },
    settings,
  };
}
function applyState(o){
  if(!o || o.app !== 'galactic-transit') throw new Error('not a galactic-transit state');
  if(o.settings){ localStorage.setItem(SKEY, JSON.stringify(o.settings)); restoreSettings(false); }
  if(o.time && typeof o.time.simT === 'number'){
    simClock.simT = o.time.simT; simClock.nextSample = simClock.simT + simClock.dtSample;
    events.length = 0; puffs.length = 0; refillTrails();
    if(typeof o.time.paused === 'boolean' && simClock.paused !== o.time.paused) $('tPause').click();
  }
  if(o.camera){ const c = o.camera;
    for(const k of ['yaw','pitch','dist','distGoal']) if(typeof c[k] === 'number') cam[k] = c[k];
    if(typeof c.follow === 'boolean') cam.follow = c.follow;
    cam.coreLock = !!c.coreLock;
    $('tDive').classList.toggle('on', !!c.dive);
    cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
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
// Devtools readouts, and the answer to a problem the move created rather than solved: a
// classic <script> put its top-level bindings on the global object by accident, so
// `earthDbg` and `probeInfo` — which have no in-file readers at all — were reachable from a
// console. A module's scope is its own, so they have to be published deliberately or they
// become unreachable and then tree-shaken. Getters, not values, so nothing is captured at
// the wrong moment.
//
// It also gives the parity harness something to ask. `shimT` is a wall-time accumulator that
// drives every variable star's phase, and when the gate reports the whole Milky Way differing
// while the solar system in front of it is pixel-identical, "what is shimT" is the question,
// and guessing at it has already cost several runs.
Object.defineProperty(globalThis, '__gt', { value: {
  get shimT(){ return simClock.shimT; },
  get simT(){ return simClock.simT; },
  get curD(){ return gfx.curD; },
  get earthDbg(){ return readout.earthDbg; },
  get probeInfo(){ return readout.probeInfo; },
  get galaxyKeys(){ return Object.keys(gxyCache); },
} });

fitPanels();
requestAnimationFrame(frame);
