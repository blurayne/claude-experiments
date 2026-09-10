import { $, $v } from '../core/dom'
import { BUILD, VERSION, BUILD_LINE } from '../core/build'
import { DBGKEY, setDebugMode, isDebugMode } from './debug'
import { refillTrails, TRAIL_N } from '../render/trails'

/** the control an event came from, typed. Every listener here is bound to one. */
const $v0 = (e: Event): HTMLInputElement & HTMLSelectElement =>
  e.target as HTMLInputElement & HTMLSelectElement
import { fmtCount, fmtYears as fmtYearsIn, sup, type UnitMode } from '../core/format'
import { AGE0, GAL_PERIOD, YR_PER_SIM, REAL_MODE, AU2U, RC_BAR, SUN_BORN_T } from '../astro/constants'
import { sunR, sunPhase, sunState, SUN_AGB, EARTH_ORBIT_RSUN, type PnState } from '../astro/sun'
import { ratesIntegral } from '../astro/environment'
import { mergeAt, diskSpin } from '../astro/merger'
import { cam, gfx, readout, simClock, view } from '../render/state'
import { spinFrame, moonSpinFrame } from '../render/frame'
import { N_PLANETS, I_P9 } from '../astro/bodies'
import { events, puffs } from '../render/lifecycle'
import { armEls, labelEls, setLabelSteady } from '../render/labels'
import { tempColour, setStateColour } from './theme'
import { layoutPanels } from './panels'

/**
 * What the interface has been set to.
 *
 * These are the viewer's choices, and the frame reads every one of them: which populations are
 * drawn, how bright the faint stars carry, how far the swept paths reach, whether the clock's
 * variability runs. They were two dozen top-level `let`s in main.ts, which worked only because
 * everything shared one scope.
 *
 * One object rather than two dozen exports, because a `let` cannot be re-exported live: an
 * importer would get a copy of its value at import time and never see it change. A field on a
 * shared object is read at the moment it is read, which is what the frame needs.
 *
 * `00-PLAN.md` is explicit that these belong to `ui/`, not to `render/state`: they are what a
 * person asked for, not what the renderer worked out.
 */
export const hud = {
  /** what is drawn */
  showTrails: true,
  showLabels: true,
  showStats: true,
  /** the hot circumgalactic halo — eROSITA's million-degree gas, off by default */
  haloOn: false,
  showDwarfs: true,
  showBelt: true,
  showKuiper: true,
  showOort: true,
  /** Planet Nine is hypothetical, and has its own switch */
  showP9: true,
  showFps: false,
  dustOn: true,
  /** the arm and galaxy names */
  armsOn: true,
  /** the variability clock — wall time, so it runs even while paused */
  varOn: true,

  /** how often the readouts are redrawn; the frame counter is counted every frame regardless */
  hudHz: 8,

  /**
   * One slider, two effects, because they are the same intent: make the faint stars carry. It
   * lifts a floor under their colour and widens the smallest sprites, which is where most of
   * the lost light actually goes. `starGain` is the slider; the other two are what it means.
   */
  minBright: 0.05*0.38,
  minSprite: 1.3 + 0.05*2.1,
  starGain: 0.05,

  /**
   * How much headroom the bright cores get before they saturate. 1 ("off", the default) is the
   * old behaviour: no compression, and a merging pair of cores reads as one white blob. Left
   * off by default because it is a corrective for that one situation, not something every
   * scene should pay a render pass for.
   */
  coreKnee: 1,

  /** each slider is its own switch: invisibility is off, and psH/psO are what that means */
  trailAlpha: 1,
  orbitAlpha: 1,
  psH: true,
  psO: true,
  trailPct: 300,

  /** supernovae and births are opt-in; lifeOn is the two of them together */
  lifeOn: false,
  evSN: false,
  evBirth: false,

  /** the calendar's own two choices */
  calMode: 'ad',
  unitMode: 'words' as UnitMode,
  /** retired control; the rate view lives in the calendar options */
  liveCount: false,
}

// ============================================================================
// The readouts
// ============================================================================
//
// Everything below draws NUMBERS, not pixels: the status bar, the Earth panel, the Sun's
// phase, the two counters. It runs at `hud.hudHz`, not once a frame — a layout per frame for
// text that changes twice a second is most of a frame's budget spent on nothing.
//
// It lives with the settings it reads rather than in render/frame, because none of it is
// rendering: `updateHud` touches no GL at all.

/**
 * The clock wrappers and the speed label are main.ts's — they close over the simulation clock,
 * and the readouts only read them. Injected rather than imported so that this module stays
 * downstream of the model rather than reaching into it.
 */
let ageGyr: () => number = () => 0
let environment: () => any = () => ({})
let lifeState: () => any = () => null
let g710: () => { d: number } = () => ({ d: Infinity })
let focusSunOpt: HTMLOptionElement
const lifeSupOn = true;   // the reading is a fixture of the Earth panel now

let seg: (id: string, initial: string, fn: (v: string) => void) => (v: string, apply?: boolean) => void = () => () => {}
let fitPanels: () => void = () => {}

let fpsFrames=0, fpsSince=performance.now();
let lastHud=0;
// The status bar is sized by its numbers, and they change length — "2,026 AD" one moment,
// "12,345,678 AD" the next — so it used to twitch in width. Growing applies at once (a
// floor never blocks widening); shrinking waits: the bar keeps its wider width until it
// has been narrower for a full second. Measured with the floor lifted, which forces one
// layout at the HUD rate and paints nothing in between.
let barHeld = 0, barNarrowSince = 0;
function holdBarWidth(now: number): void {
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

/**
 * The scale bar's arithmetic: which unit, which round number, how many pixels.
 *
 * Astronomical units only, and light years rather than parsecs — a parsec is a working
 * astronomer's unit, a light year is everyone's. Solar radii carry the deepest zoom,
 * where an AU is already too big to say anything about a star's surface.
 */
const SCALE_U: readonly (readonly [number, string])[] = [
  [1.0570e-13, 'km'], [7.3544e-8, 'R☉'], [1.58125e-5, 'AU'], [1, 'ly'], [1e3, 'kly'], [1e6, 'Mly'],
];
const trim = (v: number): string => (v < 1 ? v.toFixed(v < 0.1 ? 2 : 1) : v.toLocaleString('en-US'));
export function scaleBar(lyPerPx: number, maxPx: number): { px: number; half: string; full: string; unit: string } {
  const raw = Math.max(1e-30, maxPx*lyPerPx);
  let u = SCALE_U[0]!;
  for(const c of SCALE_U) if(raw/c[0] >= 1) u = c;
  const v = raw/u[0], p = Math.pow(10, Math.floor(Math.log10(v))), m = v/p;
  const nice = (m >= 5 ? 5 : m >= 2 ? 2 : 1)*p;
  return { px: nice*u[0]/lyPerPx, half: trim(nice/2), full: trim(nice), unit: u[1]! };
}

export function updateBar(): void {
  hud.showStats = ['sCal','sAge','sGyr','cDeath','cBirth'].some(id => $(id).style.display !== 'none');
  $('gamebar').style.display = hud.showStats ? 'flex' : 'none';
  fitPanels();
}
const statToggle = (btn: HTMLElement, statId: string): void => { toggle(btn, on=>{ $(statId).style.display = on?'':'none'; updateBar(); }); }
/**
 * Built inside initHudReadouts, not here: `seg` is injected, and a module-scope call would
 * run before the injection. Declared here because the settings replay needs to reach it.
 */
let setSegUnits: (v: string, apply?: boolean) => void = () => {}
const fmtYears = (y: number) => fmtYearsIn(y, hud.unitMode);
export function syncCal(): void {
  hud.calMode = ($('cal') as HTMLSelectElement).value;
  // "none" is the off position: the cell leaves the bar entirely
  $('sCal').style.display = hud.calMode === 'none' ? 'none' : '';
  updateBar();
  $('lCal').textContent = hud.calMode === 'rate' ? 'years per second' : 'human year';
}

function humanYear(): string {
  // Two clocks, and each reading takes the one it actually measures. A year IS one
  // orbit of the Earth, and the Earth is drawn orbiting once per simulated year, so the
  // civil calendars advance one year per simulated year — exactly, not approximately.
  // The deep-time eras below measure elapsed galactic time instead, on the same clock
  // as the age and galactic-year stats, since that is what they are counting. The two
  // diverge by the compression factor, which is the whole subject of the piece; jump to
  // a galactic epoch and the civil year is the reading that stops meaning anything.
  const el = simClock.simT*YR_PER_SIM;      // galactic clock: real years elapsed
  const g = 2026 + simClock.simT;           // planetary clock: Earth orbits counted
  const fmt = (n: number) => Math.floor(n).toLocaleString('en-US');
  switch(hud.calMode){
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

/**
 * The paced half of the frame.
 *
 * @param now the frame's timestamp, so the pacing and the bar's width hold use one clock
 * @param pn what the Sun has shed, if anything. The phase reading follows the shell's
 * existence rather than sunState()'s phase name: the drawn nebula outlasts it by 0.3 Gyr.
 */
export function updateHud(now: number, pn: PnState | null): void {
  if(hud.showFps) fpsFrames++;      // counted every frame; only the display is paced
  if(now - lastHud >= 1000/hud.hudHz){
  lastHud = now;
  holdBarWidth(now);
  if(hud.liveCount){
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
    // Before the Sun formed there are no readings to take: the panel says so once, in
    // dashes, rather than reporting a climate for a planet that will not exist for
    // another few billion years.
    const unborn = simClock.simT < SUN_BORN_T;
    $('env').classList.toggle('unborn', unborn);
    if(unborn){
      $('env').querySelector('h2')!.textContent = 'Earth';
      for(const id of ['eMean','eMin','eMax','eCR','eSL','eSun','eLife']){
        $(id).textContent = '—'; $(id).style.color = 'var(--dim)';
      }
      for(const id of ['eSunPhaseRow','eSunSizeRow']) $(id).style.display = 'none';
      for(const id of ['eMeanRow','eRangeRow','eCRRow','eSLRow','eLifeRow']) $(id).style.display = '';
      setStateColour(0, 15);
    } else {
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
      $('env').querySelector('h2')!.textContent = lost ? 'The Sun' : 'Earth';
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
    setStateColour(ls ? ls.h : 0, e.mean); } }

  // stats
  $('yrs').textContent = fmtYears(Math.abs(simClock.simT));   // signed by the label beside it
  $('pct').textContent = (simClock.simT/GAL_PERIOD*100).toFixed(3);
  if(hud.showFps){
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
      : (wAU*215).toFixed(1)+' R☉';    // below half an AU, solar radii say it better
    // and the bar itself: the largest round number of a sensible unit that fits 132 px
    const s = scaleBar(wLy/Math.max(1, view.H), 132);
    $('sFill').style.width = s.px.toFixed(1)+'px';
    $('sTkMid').style.left = (s.px/2).toFixed(1)+'px';
    $('sTkEnd').style.left = s.px.toFixed(1)+'px';
    $('sHalf').style.left = (s.px/2).toFixed(1)+'px'; $('sHalf').textContent = s.half;
    $('sEnd').style.left = s.px.toFixed(1)+'px';      $('sEnd').textContent = s.full;
    $('sUnit').style.left = (s.px+16).toFixed(1)+'px'; $('sUnit').textContent = s.unit; }
  if(hud.showStats){
    $('gCal').textContent = humanYear();
    // real elapsed time: one sim lap ≡ one real galactic year of 225 Myr
    const myr = simClock.simT*(225/GAL_PERIOD);                       // real megayears elapsed
    // Before the Sun formed there is no age to report, and a negative one is nonsense
    // rather than information — every such readout says so with a dash instead.
    const ageYr = 4.568e9 + myr*1e6;
    $('gAge').textContent = ageYr < 0 ? '—' : fmtYears(ageYr);
    // Once the remnant has relaxed there are no laps left to count: the Sun's ordered
    // circular orbit has been scattered into a random one inside an elliptical, so the
    // readout turns to the thing that still means something — how far out it now sits.
    if(mergeAt(AGE0 + myr/1e3) > 0.9){
      $('lGyr').textContent = 'distance from centre';
      $('gGyr').textContent = (sunR(simClock.simT)*30/3261.6).toFixed(1)+' kpc';
    } else {
      $('lGyr').textContent = 'galactic years';
      const laps = 4568/225 + sunPhase(simClock.simT)/(2*Math.PI);
      $('gGyr').textContent = laps < 0 ? '—' : laps.toFixed(3);
    }
  }
  }
}

/** Register the readout controls: the four bar toggles, the units segment, the calendar. */
export function initHudReadouts(deps: {
  seg: (id: string, initial: string, fn: (v: string) => void) => (v: string, apply?: boolean) => void
  fitPanels: () => void
  ageGyr: () => number
  environment: () => any
  lifeState: () => any
  g710: () => { d: number }
}): (v: string, apply?: boolean) => void {
  seg = deps.seg; fitPanels = deps.fitPanels;
  ageGyr = deps.ageGyr; environment = deps.environment; lifeState = deps.lifeState;
  g710 = deps.g710;
  focusSunOpt = ($('focusSel') as HTMLSelectElement).options[0];   // its name changes once the Sun is gone
  setSegUnits = seg('segUnits', 'words', v => { hud.unitMode = v as UnitMode; });
  statToggle($('tStatAge'), 'sAge');
  statToggle($('tStatGyr'), 'sGyr');
  statToggle($('tStatSn'), 'cDeath');
  statToggle($('tStatBirth'), 'cBirth');
  $('cal').addEventListener('change', syncCal);
  return setSegUnits;
}


// ============================================================================
// The controls
// ============================================================================
//
// Every control in the settings panel and on the dock: the speed ladder, the shuttle, the
// toggles, the sliders, the sound, the refresh button, the zoom pair.
//
// It is ONE function, and the whole block is inside it, because the order the listeners are
// registered in is the thing that matters. The settings replay dispatches synthetic
// input/change/click events, and a control whose listener has not been registered yet keeps
// its default without complaining — the page boots clean and renders with default settings,
// which looks exactly like a working page. That is 00-PLAN.md's R1, ranked the highest-risk
// failure mode in the file, and the way to not lose it is to not reorder anything.
//
// Function declarations inside a function are hoisted within it, so the interleaving of
// declarations and registrations is exactly as it was. What the rest of the piece needs is
// published through the `let`s below, assigned as the block runs.

/** the rung nearest a rate, in log space */
export let speedRungOf: (yrs: number) => number = () => 0
/**
 * The pre-v2 speed slider was continuous; this is the rung nearest what a saved value meant.
 * It lives with the ladder rather than with ui/persist, because the ladder is what changed.
 */
export let legacySpeed: (v: number) => number = () => 0
/** whole decades on top of the slider — the scenarios and the settings replay both set it */
export let setMultExp: (x: number) => void = () => {}
/** the rate in the unit it is easiest to read; the status bar prints it */
export let speedLabel: () => string = () => ''
/** the swept window, recomputed when the speed or the length slider moves */
export let applyTrailWindow: () => void = () => {}
/** the shuttle: a signed fraction of the set speed, driven by hand */
export let setShuttle: (v: number) => void = () => {}
/** a button that lights when it is on, and calls back with the new state */
export let toggle: (btn: HTMLElement, fn: (on: boolean) => void) => void = () => {}
/** drop every cache and the service worker, then reload on a fresh URL */
export let bustAndGo: (mutate?: (u: URL) => void) => void = () => {}

export function initHudControls(deps: {
  seg: (id: string, initial: string, fn: (v: string) => void) => (v: string, apply?: boolean) => void
  fitPanels: () => void
  layoutPanels: () => void
  saveSettings: () => void
  setGalaxy: (d: number) => void
  applyFocusView: () => void
  zoomStep: (dir: number) => void
  ageGyr: () => number
  updateBar: () => void
  syncCal: () => void
}): void {
  const { seg, fitPanels, layoutPanels, saveSettings, setGalaxy, applyFocusView, zoomStep,
          ageGyr, updateBar, syncCal } = deps;
  $('verInfo').textContent = VERSION;
  $('buildStamp').textContent = BUILD_LINE;
  $('tourBuild').textContent = VERSION + ' · ' + BUILD_LINE;
  // the original UTC stamp stays available on hover
  $('buildInfo').title = VERSION + (BUILD.date.indexOf('__') !== 0
    ? ' · built ' + BUILD.date + ' ' + BUILD.time + ' UTC' : '');
  // Hard refresh: drop every cache and the service worker, then reload on a fresh URL so
  // nothing between here and the server can hand back the old build.
  // Refresh reloads past every cache. Reset is its own button beside it — forgetting your
  // settings should not be something you discover by tapping three times — and the debug
  // door moved to ten taps on the "?", where a curious finger is more likely to find it
  // than on a button whose job is already done in one press.
  function bustAndGoLocal(mutate?: (u: URL) => void): void {
    const u = new URL(location.href);
    u.searchParams.set('_', String(Date.now()));
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
    bustAndGoLocal();
  }
  const flash = (cls: string) => {
    const h = $('hud');
    h.classList.remove('flash3','flash10');   // restart the animation cleanly
    void h.offsetWidth;
    h.classList.add(cls);
    setTimeout(()=> h.classList.remove(cls), 450);
  };
  $('tReload').addEventListener('click', ()=>{ doRefresh(); });
  $('tReset').addEventListener('click', ()=>{
    // Debug mode is a mode you are IN, not a setting you tuned, so a reset keeps it —
    // and carries it through the reload in the URL as well as in storage, so the page
    // that comes back is the one you were debugging.
    let dbg: string | null = null;
    try{ dbg = localStorage.getItem(DBGKEY); localStorage.clear(); }catch(err){}
    flash('flash3');
    setTimeout(()=> bustAndGoLocal(u => {
      if(dbg === '1'){ try{ localStorage.setItem(DBGKEY, '1'); }catch(err){} u.searchParams.set('debug', '1'); }
      else u.searchParams.delete('debug');
    }), 260);
  });
  {
    // One button, two meanings, told apart by patience. Tap it and the About dialog
    // toggles — after a beat, because the beat is what lets the other meaning exist.
    // Tap twice more and HOLD the third for five seconds and the debug door opens:
    // long enough that nobody finds it by accident, and it announces itself while you
    // wait, glowing from the third second in warning yellow so you know something is
    // going to happen and can let go if you did not mean it.
    const b = $('tInfo');
    let taps = 0, tapTimer: ReturnType<typeof setTimeout> | null = null;
    let holdT: ReturnType<typeof setTimeout> | null = null;
    let warnT: ReturnType<typeof setTimeout> | null = null;
    let fired = false;
    const endHold = (): void => {
      if(holdT !== null){ clearTimeout(holdT); holdT = null; }
      if(warnT !== null){ clearTimeout(warnT); warnT = null; }
      b.classList.remove('holding','holdWarn');
    };
    b.addEventListener('pointerdown', ()=>{
      fired = false;
      if(taps < 2) return;                    // only the third press in a run may be held
      // Hold the pending dialog back. Let it open and it covers the button, the browser
      // fires pointerleave on a control it can no longer see, and the hold cancels itself
      // three seconds in — which is exactly how this failed the first time it was tried.
      if(tapTimer !== null){ clearTimeout(tapTimer); tapTimer = null; }
      b.classList.add('holding');
      warnT = setTimeout(()=> b.classList.add('holdWarn'), 3000);
      holdT = setTimeout(()=>{
        fired = true; endHold(); taps = 0;
        if(tapTimer !== null){ clearTimeout(tapTimer); tapTimer = null; }
        flash('flash10');
        setDebugMode(!isDebugMode(), true);
      }, 5000);
    });
    for(const ev of ['pointerup','pointercancel','pointerleave']) b.addEventListener(ev, endHold);
    b.addEventListener('click', ()=>{
      if(fired){ fired = false; return; }     // the hold already spoke; the click is its echo
      taps++;
      if(tapTimer !== null) clearTimeout(tapTimer);
      tapTimer = setTimeout(()=>{
        taps = 0;
        const m = $('infoModal');
        m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
      }, 340);
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
  const speedFromSlider = (v: number|string): number => SPEED_RUNGS[Math.max(0, Math.min(SPEED_RUNGS.length-1, Math.round(+v)))];
  // the rung nearest a rate, in log space — for settings saved by the old continuous slider
  function speedRungOfLocal(yrs: number): number { let b=0, e=1e9; SPEED_RUNGS.forEach((r,i)=>{ const d=Math.abs(Math.log(r/yrs)); if(d<e){ e=d; b=i; } }); return b; }

  // the rate in the unit it is easiest to read: hours, weeks and months below a year
  function speedLabelLocal(): string {
    const eff = simClock.speed*simClock.speedMult, n = (x: number) => (Math.abs(x-Math.round(x)) < 0.05 ? Math.round(x) : +x.toFixed(1));
    if(eff < WEEK_YR*0.999) return n(eff/HOUR_YR)+' h/s';
    if(eff < 0.999/12)      return n(eff/WEEK_YR)+' wk/s';
    if(eff < 0.999)         return n(eff*12)+' mo/s';
    if(eff < 1000)          return n(eff)+' yr/s';
    const e = Math.floor(Math.log10(eff)), mant = eff/Math.pow(10,e);
    return (Math.abs(mant-Math.round(mant)) < 0.005 ? Math.round(mant) : mant.toFixed(2))+'×10'+sup(e)+' yr/s';
  }
  function fmtSpeed(){ $('speedv').textContent = speedLabelLocal(); }
  // Whole decades on top of the slider, for crossing deep time without waiting on it.
  function setMultExpLocal(x: number): void {
    x = Math.max(0, Math.min(10, Math.round(x)));
    simClock.speedMult = Math.pow(10, x);
    $v('multExp').value = String(x);
    $('multExpv').textContent = x === 0 ? '×1' : '×1e' + x;
    fmtSpeed(); applyTrailWindowLocal();
  }
  $('multExp').addEventListener('input', e => setMultExpLocal(+($v0(e)).value));
  // The shuttle: a signed fraction of the set speed, driven by hand. At 0 it is not engaged
  // and the clock belongs to play/pause as before; off 0 it takes the clock over — forward
  // or backward, paused or not — and the reset hands it back. Deliberately not persisted:
  // a shuttle rests at 0 when you pick the piece up.

  function setShuttleLocal(v: number): void {
    const before = Math.sign(simClock.shuttle);
    simClock.shuttle = Math.max(-100, Math.min(100, Math.round(v)));
    // a change of the shuttle's own sign re-sweeps the trails at once — the clock's drive
    // sign does that too, but not while paused, and a paused reverse left them leading
    if(Math.sign(simClock.shuttle) !== before){ refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }
    $v('shuttle').value = String(simClock.shuttle);
    $('shuttlev').textContent = simClock.shuttle === 0 ? 'off' : simClock.shuttle > 0 ? '+'+simClock.shuttle+'%' : simClock.shuttle+'%';
  }
  $('shuttle').addEventListener('input', e => setShuttleLocal(+($v0(e)).value));
  $('shuttleReset').addEventListener('click', ()=> setShuttleLocal(0));
  document.querySelectorAll('.stepb').forEach(btn => btn.addEventListener('click', ()=>{
    const b = btn as HTMLElement;
    if(!b.dataset.step) return;             // the shuttle's reset shares the look, not the job
    const [id, d] = b.dataset.step.split(':');
    const el = $v(id);
    el.value = String(Math.max(+el.min, Math.min(+el.max, +el.value + +d)));
    el.dispatchEvent(new Event('input'));
  }));
  $('speed').addEventListener('input', e=>{ simClock.speed = speedFromSlider(+($v0(e)).value); fmtSpeed(); applyTrailWindowLocal(); });
  simClock.speed = speedFromSlider(SPEED_YEAR); fmtSpeed();   // one Earth year per second
  // One slider, two effects, because they are the same intent: make the faint stars
  // carry. It lifts a floor under their colour and widens the smallest sprites, which is
  // where most of the lost light actually goes.
  $('hudHz').addEventListener('input', e=>{
    hud.hudHz = +($v0(e)).value;
    $('hudHzv').textContent = hud.hudHz + '×/s';
  });
  $('minB').addEventListener('input', e=>{
    const v = hud.starGain = +($v0(e)).value;
    hud.minBright = v*0.38;
    hud.minSprite = 1.3 + v*2.1;
    $('minBv').textContent = v ? '+'+Math.round(v*100) + '%' : 'off';
  });
  // How much headroom the bright cores get before they saturate. 100% ("off", the
  // default) is the old behaviour: no compression, and a merging pair of cores reads
  // as one white blob — left off by default since it's a corrective for that one
  // situation, not something every scene needs paying the extra render pass for.
  $('coreB').addEventListener('input', e=>{
    hud.coreKnee = +($v0(e)).value;
    $('coreBv').textContent = hud.coreKnee >= 0.999 ? 'off' : Math.round(hud.coreKnee*100)+'%';
  });
  // each slider is its own switch: silence for sound, invisibility for lines
  $('trailA').addEventListener('input', e=>{
    hud.trailAlpha = +($v0(e)).value; hud.psH = hud.trailAlpha > 0;
    $('trailAv').textContent = hud.psH ? Math.round(hud.trailAlpha*100)+'%' : 'off'; });
  $('orbitA').addEventListener('input', e=>{
    hud.orbitAlpha = +($v0(e)).value; hud.psO = hud.orbitAlpha > 0;
    $('orbitAv').textContent = hud.psO ? Math.round(hud.orbitAlpha*100)+'%' : 'off'; });
  let trailRefill: ReturnType<typeof setTimeout> | 0 = 0;
  function applyTrailWindowLocal(): void {
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

  $('trailL').addEventListener('input', e=>{ hud.trailPct = +($v0(e)).value; applyTrailWindowLocal(); });

  // A switch, however it is drawn: lit buttons carry their state in a class, checkboxes
  // in .checked. Both report through the same callback, so every call site is identical.
  const isOn = (el: HTMLElement): boolean =>
    (el as HTMLInputElement).type === 'checkbox' ? (el as HTMLInputElement).checked : el.classList.contains('on');
  function toggleLocal(btn: HTMLElement, fn: (on: boolean) => void): void {
    const box = btn as HTMLInputElement;
    if(box.type === 'checkbox') box.addEventListener('change', ()=> fn(box.checked));
    else btn.addEventListener('click', ()=>{ btn.classList.toggle('on'); fn(isOn(btn)); });
  }
  const ICO_PAUSE = '<svg class="ico" viewBox="0 0 10 10" aria-hidden="true"><rect x="1.4" y="1" width="2.7" height="8"/><rect x="5.9" y="1" width="2.7" height="8"/></svg>';
  const ICO_PLAY  = '<svg class="ico" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1 L9 5 L2 9 Z"/></svg>';
  // drawn, not typed: a glyph would be recoloured as emoji on some platforms
  toggleLocal($('tPause'), on=>{ simClock.paused=!on;
    $('tPause').innerHTML = on ? ICO_PAUSE : ICO_PLAY;
    $('tPause').setAttribute('aria-label', on ? 'pause' : 'play'); });
  toggleLocal($('tLabels'), on=>{ hud.showLabels=on; if(!on) labelEls.forEach(l=>l.style.display='none'); });
  toggleLocal($('tArms'), on=>{ hud.armsOn=on; if(!on) armEls.forEach(l=>l.style.display='none'); });
  // steady labels: eased into place, held through a single leap, stepped aside while a
  // body whirls faster than a label can follow (see placeLabel). On by default for now.
  toggleLocal($('tLabelSteady'), on=>{ setLabelSteady(on); });
  // The dock's master switch mirrors these two rather than owning its own saved state:
  // on whenever either is showing, off only when both are hidden. Individual settings
  // checkboxes are untouched — this only adds a second listener alongside their own.
  function syncLabelsMaster(): void { $('tLabelsAll').classList.toggle('on', $v('tLabels').checked || $v('tArms').checked); }
  $('tLabels').addEventListener('change', syncLabelsMaster);
  $('tArms').addEventListener('change', syncLabelsMaster);
  syncLabelsMaster();
  toggleLocal($('tLabelsAll'), on=>{
    if($v('tLabels').checked !== on){ $v('tLabels').checked = on; $('tLabels').dispatchEvent(new Event('change')); }
    if($v('tArms').checked !== on){ $v('tArms').checked = on; $('tArms').dispatchEvent(new Event('change')); }
    // the cascade only fires 'change', not the 'click' the checkboxes' own save binding
    // listens for — without this, a choice made through the master would not survive reload
    saveSettings();
  });
  toggleLocal($('tP9'), on=>{ hud.showP9=on; if(!on) labelEls[I_P9].style.display='none'; });
  toggleLocal($('tDwarfs'), on=>{ hud.showDwarfs=on; if(!on) labelEls.forEach((l,i)=>{ if(i>=N_PLANETS) l.style.display='none'; }); });
  toggleLocal($('tBelt'), on=> hud.showBelt=on);
  toggleLocal($('tKuiper'), on=> hud.showKuiper=on);
  function syncLife(): void {
    hud.lifeOn = hud.evSN || hud.evBirth;
    if(!hud.evSN){ // drop everything supernova-or-death shaped, keep living clusters
      for(let i=events.length-1;i>=0;i--){ const k=events[i].k;
        if(k!==1) events.splice(i,1); else events[i].sn=false; }
      if(!hud.lifeOn) puffs.length = 0;
    }
    if(!hud.evBirth) for(let i=events.length-1;i>=0;i--) if(events[i].k===1) events.splice(i,1);
    if(!hud.lifeOn){ events.length=0; puffs.length=0; }
  }
  toggleLocal($('tEvSN'), on=>{ hud.evSN=on; syncLife(); });
  toggleLocal($('tEvBirth'), on=>{ hud.evBirth=on; syncLife(); });
  toggleLocal($('tVar'), on=> hud.varOn=on);
  toggleLocal($('tDust'), on=>{ hud.dustOn = on; });
  const syncZoomBtns = (on: boolean) => { for(const id of ['zoomIn','zoomOut']) $(id).classList.toggle('act', on); };
  toggleLocal($('tZoomBtns'), on=>{ syncZoomBtns(on); layoutPanels(); fitPanels(); });
  // The spin lock: the camera's yaw and pitch are read in the planet's own frame (longitude
  // about its axis, latitude), so the eye rides round with the spin and the same face stays
  // in view however fast the clock runs — the plates drift under a still camera. Switching
  // it re-expresses the current line of sight in the other frame, so the view does not jump.


  toggleLocal($('tSpinLock'), on=>{
    if(!cam.follow){
      // The galaxy overview: the lock adds the arm pattern's accumulated angle to the yaw
      // (render/frame's galLockA). Re-express the yaw so the flip leaves the view exactly
      // where it is — written against the CURRENT lock state, so a redundant re-dispatch
      // (the boot restore fires one) changes nothing.
      const A = diskSpin(simClock.simT)/RC_BAR;
      cam.yaw = cam.yaw + (cam.spinLock ? A : 0) - (on ? A : 0);
      cam.spinLock = on; cam.panF[0]=cam.panF[1]=0;
      $v('tSpinLock2').checked = on;
      return;
    }
    const d = cam.dirW;
    const frame = cam.followTarget === 'moon' ? moonSpinFrame : spinFrame;
    if(on){ const [P, A, Q] = frame(); const dP = d[0]*P[0]+d[1]*P[1]+d[2]*P[2], dA = d[0]*A[0]+d[1]*A[1]+d[2]*A[2], dQ = d[0]*Q[0]+d[1]*Q[1]+d[2]*Q[2];
      cam.yaw = Math.atan2(dP, -dQ); cam.pitch = Math.asin(Math.max(-1, Math.min(1, dA))); }
    else { cam.yaw = Math.atan2(d[0], d[2]); cam.pitch = Math.asin(Math.max(-1, Math.min(1, d[1]))); }
    if(cam.coreLock){ cam.coreLock = false; }   // the lock's own base yaw would double up
    cam.spinLock = on; cam.panF[0]=cam.panF[1]=0;
    $v('tSpinLock2').checked = on;        // the settings dialog's twin follows
  });
  $('tSpinLock2').addEventListener('change', ()=>{   // and drives the dock's box, which owns the state
    if($v('tSpinLock').checked !== $v('tSpinLock2').checked){ $v('tSpinLock').checked = $v('tSpinLock2').checked; $('tSpinLock').dispatchEvent(new Event('change')); }
  });
  syncZoomBtns($v('tZoomBtns').checked);   // on by default: the markup says checked, and the dots follow it
  $('zoomIn').addEventListener('click', ()=> zoomStep(-1));     // here, after $ exists: zoomStep is
  $('zoomOut').addEventListener('click', ()=> zoomStep(+1));    // hoisted, the listeners are not
  // publish what the rest of the piece reaches for
  speedRungOf = speedRungOfLocal; setMultExp = setMultExpLocal; speedLabel = speedLabelLocal;
  applyTrailWindow = applyTrailWindowLocal; setShuttle = setShuttleLocal;
  toggle = toggleLocal; bustAndGo = bustAndGoLocal;
  legacySpeed = v => speedRungOfLocal(Math.pow(WEEK_YR, 1-v));
}
