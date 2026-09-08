import { $ } from '../core/dom'

/**
 * Remembering the settings.
 *
 * Saved state is replayed through the existing handlers rather than assigned directly, so
 * restoring a setting does exactly what clicking it would. Anything momentary — the pause, the
 * dive, the epoch jump, the current track position — is deliberately left out.
 *
 * **This is the highest-risk code in the migration** (`00-PLAN.md` R1). The replay dispatches
 * synthetic `input`/`change`/`click` events, so every listener a saved id depends on must
 * already be registered when `restoreSettings()` runs. Get that order wrong and the page boots
 * clean, throws nothing, logs nothing, and renders with DEFAULT settings — which looks exactly
 * like a working page. `restoreSettings` is therefore exported and NOT called at import time:
 * main.ts calls it at the very end of the script, once every binding exists.
 *
 * This module owns the three id lists and the mechanics. It owns nothing else. Everything a
 * particular part of the interface wants remembered arrives through `registerSnapshot` and
 * `registerApply`, so persist never has to import the module whose state it is saving — which
 * is the rule that keeps ui/persist from depending on ui/panels, ui/hud and the rest.
 */

export const SKEY = 'galactic-transit.settings.v1';

const S_TOG = ['tLabels','tArms','tLabelSteady','tZoomBtns','tSpinLock','tDwarfs','tP9','tBelt','tKuiper','tOort','tDust',
               'tEvSN','tEvBirth','tVar',
               'tStatAge','tStatGyr','tStatSn','tStatBirth','tGaia','tFps'];
const S_SLD = ['speed','trailA','orbitA','trailL','musicVol','sfxVol','minB','hudHz','coreB','qrScale'];
const S_CHK = ['fxBirth','fxSn','fxPn','fxDrone','secSolo','closeOnGo','qrOn'];

const isOn = (el: HTMLElement): boolean =>
  (el as HTMLInputElement).type === 'checkbox' ? (el as HTMLInputElement).checked : el.classList.contains('on');

/** Whatever was written last time, or null. Deliberately untyped: it is data from a browser. */
export type Saved = Record<string, any> | null

const snapshots: (() => Record<string, unknown>)[] = [];
const applies: ((s: Saved) => void)[] = [];

/** Contribute fields to the saved record. Called on every save, merged in registration order. */
export function registerSnapshot(fn: () => Record<string, unknown>): void { snapshots.push(fn) }

/**
 * Contribute to the replay. Called with the saved record — or null when there is none, which
 * is why the callback takes it rather than being skipped: some state has to be put right on a
 * first visit too. **Registration order is replay order**, and replay order matters.
 */
export function registerApply(fn: (s: Saved) => void): void { applies.push(fn) }

export function saveSettingsNow(): void {
  try{
    const s: Record<string, any> = { t:{}, s:{}, c:{} };
    for(const fn of snapshots) Object.assign(s, fn());
    S_TOG.forEach(id => s.t[id] = isOn($(id)));
    S_SLD.forEach(id => s.s[id] = ($(id) as HTMLInputElement).value); s.sv = 2;   // sv 2: the speed slider is a rung index
    S_CHK.forEach(id => s.c[id] = ($(id) as HTMLInputElement).checked);
    localStorage.setItem(SKEY, JSON.stringify(s));
  }catch(e){}   // private browsing, or storage disabled: just don't remember
}

let saveTimer = 0;
/**
 * A hoisted `function`, not a `const` arrow. Two modules are handed this at boot from a point
 * above its own declaration, and a `const` there is a temporal dead zone — which has already
 * killed the page once. `00-PLAN.md` R6 asked for exactly this.
 */
export function saveSettings(): void {
  clearTimeout(saveTimer); saveTimer = setTimeout(saveSettingsNow, 250) as unknown as number;
}

/**
 * Replay, then start remembering.
 *
 * @param register pass `false` to replay without registering the save listeners — the opening
 * scenario stages itself that way, so that staging is not mistaken for a decision.
 * @param legacySpeed converts the pre-v2 continuous speed slider to a rung index. It lives
 * with the speed ladder, not here.
 */
export function restoreSettings(register: boolean | undefined, legacySpeed: (v: number) => number): void {
  let s: Saved = null;
  try{ s = JSON.parse(localStorage.getItem(SKEY) || 'null'); }catch(e){}
  if(s){
    if(s.s && !(s.sv >= 2) && s.s.speed != null) s.s.speed = String(legacySpeed(+s.s.speed));   // the old continuous slider
    if(s.s) S_SLD.forEach(id=>{ const v=s!.s[id];
      if(v != null && ($(id) as HTMLInputElement).value !== v){ ($(id) as HTMLInputElement).value = v; $(id).dispatchEvent(new Event('input')); } });
    if(s.c) S_CHK.forEach(id=>{ const v=s!.c[id];
      if(v != null && ($(id) as HTMLInputElement).checked !== v){ ($(id) as HTMLInputElement).checked = v; $(id).dispatchEvent(new Event('change')); } });
    if(s.t) S_TOG.forEach(id=>{ const v=s!.t[id];
      if(v != null && isOn($(id)) !== v) $(id).click(); });   // a checkbox click fires change
  }
  for(const fn of applies) fn(s);
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
