import { $, $v } from '../core/dom'
import { AGE0, REAL_MODE, YR_PER_SIM } from '../astro/constants'
import { MOON_BORN, MOON_DIA } from '../astro/earth'
import { MERGE_T0 } from '../astro/merger'
import { cam, gfx, lifeAcc, simClock, view } from '../render/state'
import { minDist } from '../render/camera'
import { realSizes } from '../render/passes/bodies'
import { refillTrails } from '../render/trails'
import { events, puffs } from '../render/lifecycle'
import { hud } from './hud'
import { panelIsOpen, setPanelOpen } from './panels'

/**
 * The staged views and the epoch jumps: everything the two selectors do.
 *
 * Both work by driving the page's own controls rather than by setting state directly — a
 * scenario clicks `#tDive` and `#tView` and dispatches `input` on the sliders, exactly as a
 * visitor would. That is deliberate and it is fragile in one specific way: **the order of the
 * synthetic clicks is load-bearing.** Both toggles reset the follow target to the Sun as a
 * side effect of turning themselves on, so `followTarget` is set AFTER them, never before.
 * 06-camera-panels H5 records what that cost the first time.
 *
 * The clock is part of a staged view, not a preference. The helix is only legible at a year a
 * second, the Gliese pass at a thousand, the Andromeda approach at a hundred million — so a
 * scenario sets its own pace even at boot, where a returning visitor's other settings are
 * left alone.
 */

let ageGyr: () => number = () => 0
let saveSettings: () => void = () => {}
let speedRungOf: (yrs: number) => number = () => 0
let setMultExp: (x: number) => void = () => {}
let setBodySizes: () => void = () => {}
let applyTrailWindow: () => void = () => {}
let setShuttle: (v: number) => void = () => {}

/** set only while the opening scenario stages itself */
let keepSaved = false;
export const setKeepSaved = (v: boolean): void => { keepSaved = v }

// The Earth view fills the viewport: the globe's diameter at 80% of the shorter side,
// whatever the screen. The projection's field is vertical (see pxScale in the draw),
// so the distance is the planet's true diameter over that many pixels.
function earthViewDist(): number { return bodyViewDist(realSizes[3]); }
function moonViewDist(): number { return bodyViewDist(MOON_DIA); }
function bodyViewDist(dia: number): number {        // the distance at which a body of this diameter fills 80% of the shorter side
  const h = innerHeight, px = 0.8*Math.min(innerWidth, h);
  return Math.max(minDist(), dia*(h/(2*Math.tan(Math.PI/6)))/px);
}
export function applyFocusView(): void {
  const v = ($('focusSel') as HTMLSelectElement).value;
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
    // Face-on from the NORTH galactic pole, not the old 16-degrees-above-the-plane slant. From
    // near the plane the far half of the disk sweeps one way across the screen and the near
    // half the other, and the rotation's sense cannot be read at all — which is exactly the
    // complaint that led here. From the pole it reads plainly: clockwise, as measured. +y is
    // north (tools/build_athyg_stars.py fixes the frame), so positive pitch is the north side;
    // 1.38 rad leaves a little depth so the warp and the dust stay three-dimensional.
    cam.yaw = 0; cam.pitch = 1.38;
  }
  saveSettings();
}

export function jumpToEpoch(): void {
  cam.followTarget = 'sun';
  const sel = $v('jump');
  const a = sel.value === '' ? AGE0 : parseFloat(sel.value);   // a letter after the age marks a staged event at that age
  // some epochs are over in a blink on the galactic clock; land at a speed that shows them
  const opt = sel.selectedOptions[0];
  // The clock is part of the staged view, not a preference: the helix is only legible
  // at a year a second, the Gliese pass at a thousand, the Andromeda approach at a
  // hundred million. A scenario therefore sets its own pace even at boot, where a
  // returning visitor's other settings are left alone.
  const sp = opt && opt.dataset.rate, mu = opt && opt.dataset.mult;   // the rate in years per second → its rung
  if(sp !== undefined && sp !== null){ $v('speed').value = String(speedRungOf(+sp)); $('speed').dispatchEvent(new Event('input')); }
  if(mu) setMultExp(Math.log10(+mu));
  if(sel.value === 'helix'){
    // not an epoch: a staging entry for the true helix. At one year a second the Sun
    // covers 48 AU while Earth loops once around it — visible, and actually accurate.
    if($('tView').classList.contains('on')) $('tView').click();
    if(!keepSaved){   // the owner's exported look: full trails over half-strength rings
      $v('trailA').value = String(1);   $('trailA').dispatchEvent(new Event('input'));
      $v('orbitA').value = String(0.5); $('orbitA').dispatchEvent(new Event('input'));
      if(hud.trailPct < 250){ $v('trailL').value = String(300); $('trailL').dispatchEvent(new Event('input')); }
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
  if(sel.value === '-8.732m'){
    // How the Milky Way grew: lands ~0.5 Gyr after the Big Bang, where the shader's
    // assembly model (astro/constants asmAt/chaosAt, after VINTERGATAN) has the disk
    // compact, thick, blue and merger-scrambled, and runs to today in ~45 seconds —
    // the Gaia-Enceladus convulsion sweeping through around 10 Gyr ago, the disk
    // settling and the arms condensing out of the chaos as the pattern lock holds
    // the frame steady.
    $v('focusSel').value = 'mw'; applyFocusView();
    if(!$v('tSpinLock').checked){ $v('tSpinLock').checked = true; $('tSpinLock').dispatchEvent(new Event('change')); }
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '4.568r'){
    // Just the turning: the whole disk face-on from the north galactic pole at ten
    // million years a second — one galactic rotation every ~22 seconds — with the spin
    // lock deliberately OFF. This is the raw clockwise sweep with the arms trailing;
    // the arm-evolution scenario below is its counterpart with the pattern frozen.
    $v('focusSel').value = 'mw'; applyFocusView();
    if($v('tSpinLock').checked){ $v('tSpinLock').checked = false; $('tSpinLock').dispatchEvent(new Event('change')); }
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '2.568g'){
    // The arm evolution time-lapse: the whole disk face-on from the north pole, the camera
    // locked to the bar pattern so the four arms hold still on screen while their
    // brightness beats — two billion years to today in about 45 seconds (seven or so full
    // beat cycles), and straight onward into the future at the same pace for whoever keeps
    // watching. The lock is the point: unlocked, the pattern's own rotation smears the
    // evolution into a blur of motion.
    $v('focusSel').value = 'mw'; applyFocusView();
    if(!$v('tSpinLock').checked){ $v('tSpinLock').checked = true; $('tSpinLock').dispatchEvent(new Event('change')); }
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  if(sel.value === '5.8534w'){
    // Milky Way wobble — a view a user found and exported, staged as they had it: the
    // disk from just above the plane (pitch 0.35), the camera riding the bar pattern
    // (spin lock ON), the clock at rung 21 with the ×1e8 multiplier. From this grazing
    // angle the arms hold still and what moves is the WARP: the disk's outer rim rolls
    // through its retrograde ~650 Myr precession, the whole galaxy visibly wobbling
    // like a plate settling on a table, while the beat breathes through the frozen arms.
    $v('focusSel').value = 'mw'; applyFocusView();
    if(!$v('tSpinLock').checked){ $v('tSpinLock').checked = true; $('tSpinLock').dispatchEvent(new Event('change')); }
    cam.yaw = 0.0189; cam.pitch = 0.3538;
    cam.dist = cam.distGoal = 4300;
    $v('speed').value = '21'; $('speed').dispatchEvent(new Event('input'));
    setMultExp(8);
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  // Earth's own events are watched from Earth: the globe filling the view, followed. The
  // continental ones lock the camera to the spin and put the eye over the face that
  // matters, given as yaw = atan2(cos lat cos lon, −cos lat sin lon), pitch = lat:
  //   plates    20° N 30° W  the Atlantic, so it opens and closes in view
  //   Pangaea   15° N  0°    the supercontinent's heart, Africa still where it is
  //   Proxima   10° N 20° W  the closed Atlantic again
  //   oceans    10° N 20° W  the same face, drying
  const EARTH_AIM: Record<string, number[]> = { '4.318':[1.047, 0.35], '4.318p':[1.571, 0.26], '4.818x':[1.222, 0.17], '5.6v':[1.222, 0.17] };
  if(sel.value === '0.058' || sel.value === '0.768' || sel.value === '2.068' || EARTH_AIM[sel.value]){
    $v('focusSel').value = 'earth'; applyFocusView();
    // Every planet-watched event locks the camera to the spin, not just the continental
    // ones: without it the globe turns under the eye and the event happens on whatever
    // face the clock rate lands on. The aimed entries then point the locked camera at the
    // face that matters (set after the dispatch — the toggle re-expresses the yaw).
    if(!$v('tSpinLock').checked){ $v('tSpinLock').checked = true; $('tSpinLock').dispatchEvent(new Event('change')); }
    const aim = EARTH_AIM[sel.value];
    if(aim){ cam.yaw = aim[0]; cam.pitch = aim[1]; }
    if(simClock.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) $('tPause').click();
  }
  simClock.nextSample = simClock.simT + simClock.dtSample;
  events.length = 0; puffs.length = 0;
  lifeAcc.accB = lifeAcc.accSN = lifeAcc.accPN = 0;
  refillTrails();
}

export function initScenarioViews(deps: {
  ageGyr: () => number
  saveSettings: () => void
  speedRungOf: (yrs: number) => number
  setMultExp: (x: number) => void
  setBodySizes: () => void
  applyTrailWindow: () => void
  setShuttle: (v: number) => void
}): void {
  ageGyr = deps.ageGyr; saveSettings = deps.saveSettings; speedRungOf = deps.speedRungOf;
  setMultExp = deps.setMultExp; setBodySizes = deps.setBodySizes;
  applyTrailWindow = deps.applyTrailWindow; setShuttle = deps.setShuttle;
  $('focusSel').addEventListener('change', applyFocusView);
  $('focusGo').addEventListener('click', applyFocusView);   // re-apply the current pick, e.g. after drifting off it
  // the status bar slides down to a grip and back up — by click or by an actual slide
  {
    const bar = $('gamebar'), grip = $('barGrip');
    let y0: number | null = null, moved = false;
    // hiding is done on the bar itself — slide it down; the grip appears only then,
    // as the handle to bring it back
    let by0: number | null = null;
    bar.addEventListener('pointerdown', e => { if(e.target !== grip) by0 = e.clientY; });
    bar.addEventListener('pointermove', e => {
      if(by0 === null) return;
      if(e.clientY - by0 > 26){ setSlid(true); by0 = null; }
    });
    bar.addEventListener('pointerup',   () => { by0 = null; });
    bar.addEventListener('pointercancel', () => { by0 = null; });
    const setSlid = (s: boolean): void => {
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
  $('jump').addEventListener('change', e=>{ cam.reseedFollow=true; cam.panF[0]=cam.panF[1]=0; jumpToEpoch(); });   // the event was never read; the selector carries the pick
  $('jumpGo').addEventListener('click', ()=>{
    jumpToEpoch();
    // the point of GO is to watch the scenario, so the panel steps aside — unless the
    // visitor would rather keep it open and try one scenario after another
    if($v('closeOnGo').checked && panelIsOpen('simPanel')) setPanelOpen('simPanel', false);
  });
}
