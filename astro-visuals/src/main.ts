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
import { perspective, lookAt, mul, MAT3_ID } from './core/mat4'
import { gauss, expR } from './core/rng'
import { $ } from './core/dom'
import { sup, fmtCount, fmtYears as fmtYearsIn, type UnitMode } from './core/format'
import { hud, updateHud, initHudReadouts, updateBar, syncCal } from './ui/hud'
import { hideTip } from './ui/tooltips'
import { tempColour, setStateColour } from './ui/theme'
import { initFullscreen, registerServiceWorker } from './ui/fullscreen'
import { initPanels, setPanelOpen, layoutPanels, PANELS, panelSnapshot, panelApply, panelIsOpen } from './ui/panels'
import { initTour, showTour, TOURKEY } from './ui/tour'
import { initSections, applySecs, seg, sectionSnapshot, sectionApply, closeSection } from './ui/sections'
import {
  SKEY, saveSettings, saveSettingsNow, registerSnapshot, registerApply,
  restoreSettings as restoreSettingsIn,
} from './ui/persist'
import { initQr, qrSnapshot, qrApply } from './ui/qr'
import { initDebug, isDebugMode, exportState, renderLog, DEBUG, DBGKEY, setDebugUI } from './ui/debug'
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
  PLATE_MODEL, plateAngle, MOON_DIA, MOON_BORN, moonPos,
  MOON_D0, moonW, moonRel,
  EARTH_AXIS, EARTH_P0, SIDEREAL, earthPrime as earthPrimeAt, earthEra,
} from './astro/earth'
import { simClock, cam, gfx, view, readout, lifeAcc, SKY_MIRROR } from './render/state'
import { buildStarfield, N_STAR } from './scene/starfield'
import { genGalaxy, genGalaxyMap, mapPick, mapXZ, MAP_SCALE } from './scene/galaxy'
import {
  genAndromeda, genAndromedaMap, mapXZ31,
  R_A, M31_MAP_SCALE, M32_C, M110_C, GSS_DIR, M31_ARM_K,
} from './scene/andromeda'
import { buildBelts, AB_N, KB_N, OO_N } from './scene/belts'
import { initBelts, drawBelts } from './render/passes/belts'
import { makeHDR, resolveTone, bindHDR } from './render/passes/tone'
import { drawShed, drawSunDisc } from './render/passes/sun'
import { drawRings } from './render/passes/rings'
import { drawGlobe, loadEarthMap } from './render/passes/globe'
import { pPt, pTr, U } from './render/passes/points'
import { drawNebula, pNeb, UN, type CloudFrame, type Which } from './render/passes/nebula'
import { drawDust, pDust, UD } from './render/passes/dust'
import {
  drawBodies, bodyPosArr, bodyCol, dispSizes, realSizes,
  setBodySizes as setBodySizesTo, uploadBodySize, uploadSunColour, uploadBodyPositions,
} from './render/passes/bodies'
import { drawG710 } from './render/passes/g710'
import { drawEatFlash } from './render/passes/eatflash'
import { runFirstLaunchProbe } from './render/probe'
import { initCamera, zoomStep, minDist } from './render/camera'
import { startFrameLoop, setHolding, skyProjection, spinFrame, org } from './render/frame'
import { drawLabels, setLabelSteady, labelEls, armEls } from './render/labels'
import {
  initTrails, initOrbitRings, drawTrails, pushTrail, refillTrails, uploadTrails,
  trailAnchor, TRAIL_N,
} from './render/trails'
import { lifeStep, drawEvents, drawRemnants, events, puffs, setLifeSfx } from './render/lifecycle'
import { pSN, USN } from './render/passes/supernova'
import { pRem, UREM } from './render/passes/remnant'
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
import { makeBuf, pointVAO, deleteVAO, trackVAOBuffers, dynVAO } from './gpu/buffers'

installErrorCollector()
// A thunk, so this does not depend on where renderLog ends up living.
setLogRenderer(() => renderLog())

// The GLSL is gone from here entirely: every program now lives in the pass that draws with
// it, and each pass imports its own shaders. The rule they follow is still the one this file
// used to state — Vite's `?raw`, so what reaches the driver is the file's bytes, nothing
// reformatted or comment-stripped on the way, and consumed synchronously by prog() where it
// stands. A runtime fetch would make program creation asynchronous and change first-frame
// timing. `pt.vert` is deliberately shared by the points, the nebulae and the dust.
// Semantic version: minor for a feature set, patch for fixes. The date and commit are
// stamped in at build time by .github/scripts/build_site.py; opened straight from the
// working copy the placeholders survive and it reports itself as a dev build.

// glowing point sprites (stars, galaxy, bodies)

// Star profile after Gaia Sky (MPL-2.0, assets/shader/lib/star.glsl): a wide soft
// corona with a tight hot core, and the core lifts the colour toward white — a bright
// star reads as luminous rather than as a tinted disc. Reimplemented, not copied.


// trails, faded by vertex index



// The point and trail programs are render/passes/points, the blast is passes/supernova and
// the shells are passes/remnant. Only the programs and their uniform tables have moved:
// their draws are still in frame() below, because six passes write through `U` and each of
// them reads a dozen values off the frame. They follow when render/frame exists to hand
// those over — 00-PLAN.md step 10, then step 21.

// ---------- the physics (compressed but honest) ----------

 // active galaxy density (set by setGalaxy, read by the life-cycle rates)

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

// The clouds — the nebulae and the dust lanes — are render/passes/nebula and passes/dust.
// They are always drawn as a pair, in the same order, from the same values, which is what
// their shared CloudFrame is: the per-frame context, discovered rather than designed.
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
for(const [pr, gr] of [[pPt,U.ptGRot],[pNeb,UN.grot],[pDust,UD.grot]]){
  gl.useProgram(pr); gl.uniformMatrix3fv(gr, false, MAT3_ID);
}
setGalaxy(1);   // real default ("low") applied after full init, below — see hadSaved

// ---------- Kuiper belt & Oort cloud (follow the Sun) ----------
// The belts, built here because this is the fourth of the seven things that consume
// randomness at boot and the seeded parity stream depends on the order.
const { abRT, abRTd, abH, abHd, abSz, abP, kbRT, kbH, kbSz, ooOff, ooSz } = buildBelts();
initBelts({ abRT, abRTd, abH, abHd, abSz, abP, kbRT, kbH, kbSz, ooOff, ooSz });
// The Oort boundary's three great circles, and the Moon's orbit, are drawn by
// render/passes/rings — one unit circle placed in space by the shader.

// Earth and the Moon — the globe program, its map and its draw — are render/passes/globe.
// The fetch is kicked from here, in its place among the others, because when it starts is
// part of what makes a run reproducible.
loadEarthMap();

// The bodies' buffers, their CPU-side arrays and their draw are render/passes/bodies.
// ---------- trails ----------
// The swept paths, the closed orbit rings and the anchor they are stored against are
// render/trails. The two builders are called here, in their place in the boot's RNG order.
initTrails();
initOrbitRings();
// In real scale everything but the Sun is stored as an offset from it.


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


// ---------- stellar life cycle: birth, death, supernovae ----------
// Rates are anchored to current measurements (see the info panel): the Milky Way forms
// ~2 solar masses of stars a year and hosts ~2 supernovae per century. On the compressed
// galactic clock (1 sim-yr ~ 1.19 Myr) births are drawn at the real rate scaled to the
// point sampling (~2.2 per sim-yr per density unit); featured supernovae are a sampled
// fraction of the true ~24,000 per sim-yr, which would be a continuous glitter.

// The stellar life cycle — the events, the blasts, the expanding shells and their three
// draws — is render/lifecycle. The sound is handed to it here rather than imported there.
setLifeSfx(sfx);
// ---------- camera & interaction ----------
// The turn, the two-finger pan, the pinch, the wheel and the zoom ladder are render/camera.
// It reports `holding` back rather than keeping it: while a pointer is down the clock holds,
// and the clock is the frame's.
initCamera({ ageGyr, onHold: setHolding });

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
  hud.hudHz = +e.target.value;
  $('hudHzv').textContent = hud.hudHz + '×/s';
});
$('minB').addEventListener('input', e=>{
  const v = hud.starGain = +e.target.value;
  hud.minBright = v*0.38;
  hud.minSprite = 1.3 + v*2.1;
  $('minBv').textContent = v ? '+'+Math.round(v*100) + '%' : 'off';
});
// How much headroom the bright cores get before they saturate. 100% ("off", the
// default) is the old behaviour: no compression, and a merging pair of cores reads
// as one white blob — left off by default since it's a corrective for that one
// situation, not something every scene needs paying the extra render pass for.
$('coreB').addEventListener('input', e=>{
  hud.coreKnee = +e.target.value;
  $('coreBv').textContent = hud.coreKnee >= 0.999 ? 'off' : Math.round(hud.coreKnee*100)+'%';
});
// each slider is its own switch: silence for sound, invisibility for lines
$('trailA').addEventListener('input', e=>{
  hud.trailAlpha = +e.target.value; hud.psH = hud.trailAlpha > 0;
  $('trailAv').textContent = hud.psH ? Math.round(hud.trailAlpha*100)+'%' : 'off'; });
$('orbitA').addEventListener('input', e=>{
  hud.orbitAlpha = +e.target.value; hud.psO = hud.orbitAlpha > 0;
  $('orbitAv').textContent = hud.psO ? Math.round(hud.orbitAlpha*100)+'%' : 'off'; });
let trailRefill = 0;
function applyTrailWindow(){
  const w = (hud.trailPct/100) * simClock.speed * simClock.speedMult;      // years covered by the whole trail
  simClock.dtSample = Math.max(1e-9, w/TRAIL_N);
  const span = w < 1e3 ? (w<10 ? w.toFixed(w<1?2:1) : String(Math.round(w)))+' yr'
             : w < 1e6 ? (w/1e3).toFixed(w<1e4?1:0)+' kyr'
             : w < 1e9 ? (w/1e6).toFixed(w<1e7?1:0)+' Myr'
             : (w/1e9).toFixed(2)+' Gyr';
  $('trailLv').textContent = hud.trailPct + '% · ' + span;
  // rebuilding is 34,000 samples, so coalesce the bursts a slider drag produces
  clearTimeout(trailRefill);
  trailRefill = setTimeout(()=>{ refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }, 90);
}

$('trailL').addEventListener('input', e=>{ hud.trailPct = +e.target.value; applyTrailWindow(); });

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
toggle($('tLabels'), on=>{ hud.showLabels=on; if(!on) labelEls.forEach(l=>l.style.display='none'); });
toggle($('tArms'), on=>{ hud.armsOn=on; if(!on) armEls.forEach(l=>l.style.display='none'); });
// steady labels: eased into place, held through a single leap, stepped aside while a
// body whirls faster than a label can follow (see placeLabel). On by default for now.
toggle($('tLabelSteady'), on=>{ setLabelSteady(on); });
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
toggle($('tP9'), on=>{ hud.showP9=on; if(!on) labelEls[I_P9].style.display='none'; });
toggle($('tDwarfs'), on=>{ hud.showDwarfs=on; if(!on) labelEls.forEach((l,i)=>{ if(i>=N_PLANETS) l.style.display='none'; }); });
toggle($('tBelt'), on=> hud.showBelt=on);
toggle($('tKuiper'), on=> hud.showKuiper=on);
function syncLife(){
  hud.lifeOn = hud.evSN || hud.evBirth;
  if(!hud.evSN){ // drop everything supernova-or-death shaped, keep living clusters
    for(let i=events.length-1;i>=0;i--){ const k=events[i].k;
      if(k!==1) events.splice(i,1); else events[i].sn=false; }
    if(!hud.lifeOn) puffs.length = 0;
  }
  if(!hud.evBirth) for(let i=events.length-1;i>=0;i--) if(events[i].k===1) events.splice(i,1);
  if(!hud.lifeOn){ events.length=0; puffs.length=0; }
}
toggle($('tEvSN'), on=>{ hud.evSN=on; syncLife(); });
toggle($('tEvBirth'), on=>{ hud.evBirth=on; syncLife(); });
toggle($('tVar'), on=> hud.varOn=on);
toggle($('tDust'), on=>{ hud.dustOn = on; });
const syncZoomBtns = on => { for(const id of ['zoomIn','zoomOut']) $(id).classList.toggle('act', on); };
toggle($('tZoomBtns'), on=>{ syncZoomBtns(on); layoutPanels(); fitPanels(); });
// The spin lock: the camera's yaw and pitch are read in the planet's own frame (longitude
// about its axis, latitude), so the eye rides round with the spin and the same face stays
// in view however fast the clock runs — the plates drift under a still camera. Switching
// it re-expresses the current line of sight in the other frame, so the view does not jump.


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
toggle($('tFps'), on=>{ hud.showFps=on; $('fpsBox').style.display = on ? '' : 'none'; fitPanels(); });
const lifeSupOn = true;   // the reading is a fixture of the Earth panel now
// ---------- movable panels ----------
// The three panels, their two columns, the crowding pass and the drag gestures are ui/panels.
// It is handed the two things it must not import: the resize logic's fitPanels, and
// ui/persist's saveSettings — a panel's position is something the settings record, not
// something the settings own.
// Both are read through a thunk, not passed by value. `saveSettings` is a `const` declared
// 265 lines below this call, and handing it over here reaches into its temporal dead zone —
// which the boot suite caught as "Cannot access 'saveSettings' before initialization", the
// whole page dead on the first frame. 00-PLAN.md's R6 wants it hoisted at step 16; until
// then, deferring the read to call time is the smaller change.
initPanels({ fitPanels: () => fitPanels(), saveSettings: () => saveSettings() });
// ---------- collapsible sections ----------
// The headings, their bodies, the solo rule and the segmented buttons are ui/sections.
initSections({ fitPanels: () => fitPanels(), saveSettings: () => saveSettings() });

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
// The mechanics are ui/persist: the three id lists, the debounce, and the replay through the
// page's own handlers. What is saved BEYOND those lists is contributed from here, through the
// registry — persist must not import the modules whose state it records.

registerSnapshot(() => ({
  cal:$('cal').value, mult:simClock.speedMult, dens:gfx.curD, dprc:view.dprCap,
  units:hud.unitMode,
  fsel:$('focusSel').value, sec:sectionSnapshot(),
  pan:panelSnapshot(),
  bar:$('gamebar').classList.contains('slid'), qrPos:qrSnapshot(),
}));

// Registration order is replay order. These three run after persist's own id lists, in
// exactly the sequence the single restoreSettings() used to run them in.
registerApply(s => {
  if(!s) return;
  if(s.cal && s.cal !== $('cal').value){ $('cal').value = s.cal; $('cal').dispatchEvent(new Event('change')); }
  if(s.mult > 0 && s.mult !== simClock.speedMult) setMultExp(Math.log10(s.mult));
  if(s.dprc === 1 || s.dprc === 2){ if(s.dprc !== view.dprCap){ view.dprCap = s.dprc; resize(); } }   // the probe's pixel cap, kept
  if(s.dens){ const i = DETAIL_D.indexOf(s.dens);
    if(i >= 0){ $('detail').value = i; $('detailv').textContent = DETAIL_NAMES[i];   // the slider shows the tier even when it is the boot tier
      if(s.dens !== gfx.curD) $('detail').dispatchEvent(new Event('input')); } }
  if(s.units === 'words' || s.units === 'sup' || s.units === 'e') setSegUnits(s.units);
  if(s.fsel === 'sun' || s.fsel === 'mw' || s.fsel === 'and') $('focusSel').value = s.fsel;
  sectionApply(s.sec);
  if(s.bar) $('gamebar').classList.add('slid');
  qrApply(s.qrPos);
});
registerApply(s => panelApply(s && s.pan));   // sides and open flags, then the layout
registerApply(() => applySecs());

// The speed ladder's own business: the pre-v2 slider was continuous, and this is the rung
// nearest what it meant.
const legacySpeed = (v: number) => speedRungOf(Math.pow(WEEK_YR, 1-v));
const restoreSettings = (register?: boolean) => restoreSettingsIn(register, legacySpeed);
toggle($('tOort'), on=> hud.showOort=on);
const setSegUnits = initHudReadouts({
  seg, toggle, fitPanels: () => fitPanels(),
  ageGyr, environment, lifeState, g710, speedLabel,
});

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
      if(hud.trailPct < 250){ $('trailL').value = 300; $('trailL').dispatchEvent(new Event('input')); }
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
  if($('closeOnGo').checked && panelIsOpen('simPanel')) setPanelOpen('simPanel', false);
});
const setBodySizes = () => setBodySizesTo(REAL_MODE);
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
// All of it — the button, the rotation lock, the armed landscape request and the installed-app
// case — is ui/fullscreen. So is registering the service worker, for the same reason: both are
// browser capabilities asked for once at boot and never spoken to again.
initFullscreen();
registerServiceWorker();
$('collapse').addEventListener('click', ()=> setPanelOpen('hud', false));
document.querySelectorAll('.pclose[data-close]').forEach(b =>
  b.addEventListener('click', () => setPanelOpen(b.dataset.close, false)));
// ---------- the first run ----------
// The guided look at the interface, its hint placement and its two buttons are ui/tour.
initTour();
$('tInfo').addEventListener('click', ()=>{ $('infoModal').style.display='flex'; });
$('infoClose').addEventListener('click', ()=>{ $('infoModal').style.display='none'; });
$('infoModal').addEventListener('click', e=>{ if(e.target.id==='infoModal') $('infoModal').style.display='none'; });
if(matchMedia('(prefers-reduced-motion: reduce)').matches){ $('tPause').click(); }

// Every name on the screen is render/labels: the six element pools, the steadying, and the
// pass that places them. The switches stay here, because they are the interface's.
// The hazard colour — what the panels, the readouts and the frost are tinted by — is ui/theme.
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
// the one way a projection is built: frame() rebuilds it every frame for its near plane

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



// Following is exact; only transitions ease. The offset decays toward zero and never
// re-grows from the target's own motion — easing the position itself made the camera
// trail a moving Sun by up to 20% of the view, so at dive zoom the Sun slid across the
// frame every time a touch held the clock and the lag collapsed.


   // to tell the clock running across an engulfment from a jump past it
      // the nebula is on screen this frame: the label follows it
// The Sun's own two programs — the procedural disc and the envelope it sheds — are
// render/passes/sun now, together with the single point both of them stand on.

// the engulfment flares are render/passes/eatflash


// ---------- the first-launch performance probe ----------
// render/probe measures the machine and picks the quality row. It is handed the two things
// only main.ts can do: resize the canvas when the pixel cap drops, and write the settings at
// once rather than through the debounce.
let probeFrames = 0;
const runProbe = () => runFirstLaunchProbe({ detailNames: DETAIL_NAMES, resize, saveSettingsNow });


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
// The door itself, the error log, the state export/import and the QR overlay are ui/debug and
// ui/qr. ui/debug drives ui/qr — it decides when the code is redrawn — so the encoder takes
// its payload as an injection rather than importing the exporter.
initQr({ exportState, isDebug: isDebugMode, saveSettings: () => saveSettings() });
initDebug({ restoreSettings, fitPanels: () => fitPanels() });

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
  // The life cycle is off in every parity state, so nothing photographed can see it. The
  // boot suite drives the switches and watches these two instead.
  get lifeCounts(){ return { events: events.length, puffs: puffs.length }; },
} });

fitPanels();
startFrameLoop({
  vaoStars, ageGyr, environment, earthPrime, g710,
  // the third frame of a first visit: the programs are compiled and the opening camera is
  // set, which is the only moment the probe can honestly measure
  onProbeReady: () => { if(!hadSaved) runProbe(); },
});
