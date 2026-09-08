import { $ } from '../core/dom'
import { fmtCount, fmtYears as fmtYearsIn, sup, type UnitMode } from '../core/format'
import { AGE0, GAL_PERIOD, YR_PER_SIM } from '../astro/constants'
import { sunR, sunPhase, sunState, SUN_AGB, EARTH_ORBIT_RSUN, type PnState } from '../astro/sun'
import { ratesIntegral } from '../astro/environment'
import { mergeAt } from '../astro/merger'
import { cam, gfx, readout, simClock, view } from '../render/state'
import { events } from '../render/lifecycle'
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
let speedLabel: () => string = () => ''
let focusSunOpt: HTMLOptionElement
const lifeSupOn = true;   // the reading is a fixture of the Earth panel now

let seg: (id: string, initial: string, fn: (v: string) => void) => (v: string, apply?: boolean) => void = () => () => {}
let toggle: (btn: HTMLElement, fn: (on: boolean) => void) => void = () => {}
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
toggle($('tView'), on=>{ cam.followTarget='sun'; cam.follow=!on; cam.distGoal = on? 4300 : 150; cam.reseedFollow=true; cam.panF[0]=cam.panF[1]=0; });

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
    setStateColour(ls ? ls.h : 0, e.mean); }

  // stats
  $('yrs').textContent = fmtYears(Math.abs(simClock.simT));
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
      : (wAU*215).toFixed(1)+' R☉'; }   // below half an AU, solar radii say it better
  if(hud.showStats){
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
}

/** Register the readout controls: the four bar toggles, the units segment, the calendar. */
export function initHudReadouts(deps: {
  seg: (id: string, initial: string, fn: (v: string) => void) => (v: string, apply?: boolean) => void
  toggle: (btn: HTMLElement, fn: (on: boolean) => void) => void
  fitPanels: () => void
  ageGyr: () => number
  environment: () => any
  lifeState: () => any
  g710: () => { d: number }
  speedLabel: () => string
}): (v: string, apply?: boolean) => void {
  seg = deps.seg; toggle = deps.toggle; fitPanels = deps.fitPanels;
  ageGyr = deps.ageGyr; environment = deps.environment; lifeState = deps.lifeState;
  g710 = deps.g710; speedLabel = deps.speedLabel;
  focusSunOpt = ($('focusSel') as HTMLSelectElement).options[0];   // its name changes once the Sun is gone
  setSegUnits = seg('segUnits', 'words', v => { hud.unitMode = v as UnitMode; });
  statToggle($('tStatAge'), 'sAge');
  statToggle($('tStatGyr'), 'sGyr');
  statToggle($('tStatSn'), 'cDeath');
  statToggle($('tStatBirth'), 'cBirth');
  $('cal').addEventListener('change', syncCal);
  return setSegUnits;
}
