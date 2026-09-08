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
import { $, $v } from './core/dom'
import { sup, fmtCount, fmtYears as fmtYearsIn, type UnitMode } from './core/format'
import {
  hud, updateHud, initHudReadouts, initHudControls, updateBar, syncCal,
  speedRungOf, setMultExp, speedLabel, applyTrailWindow, setShuttle, toggle, bustAndGo, legacySpeed,
} from './ui/hud'
import { initScenarioViews, applyFocusView, jumpToEpoch, setKeepSaved } from './ui/scenarios'
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
import {
  setGalaxy, loadGalaxyMap, loadM31Map, loadGaiaStars, galaxyKeys,
} from './scene/cache'
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
const vaoStars = pointVAO(starPos, starSize, starCol);

// ---------- the photographic density map, and the density tiers ----------
// The maps, the cache and setGalaxy are scene/cache. It is handed the two loaders' kick from
// here, below, so the fetch order stays where it is: which map wins the race decides where
// the seeded PRNG stands when the galaxy is generated.
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
// The Gaia catalogues load through scene/cache too — same shape, same race.
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
// Every control in the settings panel and on the dock — the speed ladder, the shuttle, the
// toggles, the sliders, the sound and the refresh button — is ui/hud's initHudControls. It is
// one call because the ORDER the listeners are registered in is the thing that matters: the
// settings replay dispatches synthetic events, and a control whose listener is not yet there
// silently keeps its default (00-PLAN.md R1).
initHudControls({
  seg, fitPanels: () => fitPanels(), layoutPanels, saveSettings: () => saveSettings(),
  setGalaxy, applyFocusView, zoomStep, ageGyr, updateBar, syncCal,
});
initScenarioViews({
  ageGyr, saveSettings: () => saveSettings(), speedRungOf, setMultExp,
  setBodySizes: () => setBodySizes(), applyTrailWindow, setShuttle,
});
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

const restoreSettings = (register?: boolean) => restoreSettingsIn(register, legacySpeed);
toggle($('tOort'), on=> hud.showOort=on);
const setSegUnits = initHudReadouts({
  seg, fitPanels: () => fitPanels(),
  ageGyr, environment, lifeState, g710,
});

// Replaying matters here: an event like the Gliese 710 pass is over in a second or two,
// and re-picking the same entry fires no change event, so there would be no way back to
// it short of reloading.
const setBodySizes = () => setBodySizesTo(REAL_MODE);
setBodySizes();   // real proportions from the first frame
toggle($('tView'), on=>{ cam.followTarget='sun'; cam.follow=!on; cam.distGoal = on? 4300 : 150; cam.reseedFollow=true; cam.panF[0]=cam.panF[1]=0; });
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
setKeepSaved(hadSaved);
$v('jump').value = 'helix';
$('jump').dispatchEvent(new Event('change'));
setKeepSaved(false);
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
  get galaxyKeys(){ return galaxyKeys(); },
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
