import { $ } from '../core/dom'
import { T_BIG_BANG } from '../astro/constants'
import { BUILD } from '../core/build'
import { errLog, TOUCH_DEV } from '../core/errorlog'
import { cam, simClock } from '../render/state'
import { refillTrails } from '../render/trails'
import { events, puffs } from '../render/lifecycle'
import { SKEY, saveSettingsNow } from './persist'
import { applySecs } from './sections'
import { setPanelOpen, setPanelsDebug } from './panels'
import { qrRedraw } from './qr'

/**
 * The debug door: opened by `?debug` in the URL or ten taps on refresh, and remembered.
 *
 * Behind it are the error log (collected on touch devices, which have no console to open),
 * the state export and import, and the QR overlay. It drives ui/qr rather than the other way
 * round, which is why the encoder takes its payload as an injection.
 *
 * `exportState` and `applyState` are the pair that makes a scene reproducible somewhere else:
 * the clock, the camera, the viewport and the whole settings record, in and out as JSON.
 */

let restoreSettings: (register: boolean) => void = () => {}
let fitPanels: () => void = () => {}
export const DBGKEY = 'galactic-transit.debug';
// Whether debug was already on BEFORE this load: a ?debug boot is only "entering" the
// mode the first time. It used to count every reload as an entry, so anyone living with
// ?debug in the URL found the settings panel hijacked by the log tab on every visit —
// which read as "the accordions are broken", because they were a tab away.
let wasAlreadyOn = false;
export const DEBUG: boolean = (()=>{ try{
  wasAlreadyOn = localStorage.getItem(DBGKEY) === '1';
  const v = new URLSearchParams(location.search).get('debug');
  if(v !== null){
    const on = !['0','false','off'].includes(v.toLowerCase());
    try{ localStorage.setItem(DBGKEY, on ? '1' : '0'); }catch(e){}
    return on;
  }
  return wasAlreadyOn;
}catch(e){ return false; } })();
let debugMode = false;
export const isDebugMode = (): boolean => debugMode
// ---------- the settings / log tabs ----------
const ESC: Record<string, string> = {'&':'&amp;','<':'&lt;','>':'&gt;'};
const esc = (t: unknown): string => String(t).replace(/[&<>]/g, c => ESC[c]);
const clock = (t: number): string => new Date(t).toTimeString().slice(0,8);
export function renderLog(): void {
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
/**
 * The debug panel's three collapsibles — app state, settings, log.
 *
 * Its own machinery rather than ui/sections', deliberately: that one enforces
 * one-section-at-a-time across the settings panel, and folding away the state box
 * because somebody opened the log would be the wrong answer here.
 */
const DSECS = ['state','set','log'] as const;
const dsecBody: Record<string, string> = { state:'dsecState', set:'dsecSet', log:'dsecLog' };
function initDebugSections(): void {
  for(const h of document.querySelectorAll('.sect[data-dsec]')){
    h.addEventListener('click', ()=>{
      const k = (h as HTMLElement).dataset.dsec!;
      const closing = !$(dsecBody[k]!).classList.contains('closed');
      $(dsecBody[k]!).classList.toggle('closed', closing);
      h.classList.toggle('closed', closing);
      if(k === 'log' && !closing) renderLog();
      fitPanels();
    });
  }
}
/** Open the log section and show its contents — what entering debug mode lands on. */
function openLogSection(): void {
  for(const k of DSECS){
    const open = k === 'log';
    $(dsecBody[k]!).classList.toggle('closed', !open);
    document.querySelector('.sect[data-dsec="'+k+'"]')!.classList.toggle('closed', !open);
  }
  renderLog(); fitPanels();
}
/**
 * The one entry to the mode: flips the UI and persists the flag. The gesture on the "?"
 * and the "debug mode" checkbox under Other both land here, so they cannot disagree.
 */
export function setDebugMode(on: boolean, entering: boolean): void {
  setDebugUI(on, entering);
  try{ localStorage.setItem(DBGKEY, on ? '1' : '0'); }catch(e){}
}
export function setDebugUI(on: boolean, entering: boolean): void {
  debugMode = on;
  // the checkbox under Other mirrors the mode, whichever door it was entered by
  ($('tDebug') as HTMLInputElement).checked = on;
  $('rowHudHz').style.display = on ? '' : 'none';
  $('rowGain').style.display = on ? '' : 'none';
  // the log is what debug mode is usually entered for, so entering opens on it
  if(on && entering) openLogSection();
  // The state box, the QR switches and a second frame-rate box are a panel of their own
  // now rather than a modal behind a button — it opens with the door and closes with it,
  // and can be moved, docked and dismissed like any other panel while it is open.
  setPanelsDebug(on);
  // Touch devices get the button, not the dialog: dbgPlus (its reopen dot) already shows
  // the instant setPanelsDebug(on) makes the panel available, so nothing here is silently
  // hidden — the panel is one tap away, not fully hidden.
  if(on && entering && !TOUCH_DEV) setPanelOpen('dbgPanel', true);
  if(!on) setPanelOpen('dbgPanel', false);
  // entering debug mode switches the QR on; a plain boot in debug mode leaves the choice alone
  if(on && entering && !($('qrOn') as HTMLInputElement).checked){ ($('qrOn') as HTMLInputElement).checked = true; $('qrOn').dispatchEvent(new Event('change')); }
  qrRedraw(true);
}
export function exportState(): Record<string, any> {
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
export function applyState(o: any): void {
  if(!o || o.app !== 'galactic-transit') throw new Error('not a galactic-transit state');
  if(o.settings){ localStorage.setItem(SKEY, JSON.stringify(o.settings)); restoreSettings(false); }
  if(o.time && typeof o.time.simT === 'number'){
    simClock.simT = Math.max(T_BIG_BANG, o.time.simT);   // imports cannot precede the universe either
    simClock.nextSample = simClock.simT + simClock.dtSample;
    events.length = 0; puffs.length = 0; refillTrails();
    if(typeof o.time.paused === 'boolean' && simClock.paused !== o.time.paused) $('tPause').click();
  }
  if(o.camera){ const c = o.camera;
    for(const k of ['yaw','pitch','dist','distGoal'] as const) if(typeof c[k] === 'number') cam[k] = c[k];
    if(typeof c.follow === 'boolean') cam.follow = c.follow;
    cam.coreLock = !!c.coreLock;
    $('tDive').classList.toggle('on', !!c.dive);
    cam.reseedFollow = true; cam.panF[0]=cam.panF[1]=0;
  }
}

export function initDebug(deps: {
  restoreSettings: (register: boolean) => void
  fitPanels: () => void
}): void {
  restoreSettings = deps.restoreSettings; fitPanels = deps.fitPanels;
  initDebugSections();
  // The switch under Other. Not in persist's id lists: the mode rides its own flag, which
  // deliberately survives a settings reset. Switching it ON is entering — the panel and
  // the log open exactly as they do for the hold gesture.
  $('tDebug').addEventListener('change', ()=>{
    const on = ($('tDebug') as HTMLInputElement).checked;
    setDebugMode(on, on);
  });
  $('logClear').addEventListener('click', ()=>{ errLog.length = 0; renderLog(); });
  $('logCopy').addEventListener('click', ()=>{
    const txt = 'galactic-transit ' + BUILD.version + ' · ' + navigator.userAgent + '\n'
      + errLog.map(e => clock(e.t) + ' ' + e.kind + (e.n>1 ? ' x'+e.n : '') + (e.where ? ' (' + e.where + ')' : '') + ': ' + e.msg).join('\n');
    try{ navigator.clipboard.writeText(txt); $('logCopy').textContent = 'copied'; setTimeout(()=> $('logCopy').textContent = 'copy', 1200); }catch(e){}
  });
  const dbgSay = (m: string): void => { $('dbgMsg').textContent = m; };
  // the panel opens on the current state, ready to copy — export is one keypress saved
  ($('dbgText') as HTMLTextAreaElement).value = JSON.stringify(exportState(), null, 2);
  $('dbgExport').addEventListener('click', ()=>{
    ($('dbgText') as HTMLTextAreaElement).value = JSON.stringify(exportState(), null, 2); dbgSay('state exported'); });
  $('dbgImport').addEventListener('click', ()=>{
    try{ applyState(JSON.parse(($('dbgText') as HTMLTextAreaElement).value)); dbgSay('state imported'); }
    catch(e){ dbgSay('import failed: '+(e as Error).message); } });
  $('dbgCopy').addEventListener('click', ()=>{
    navigator.clipboard.writeText(($('dbgText') as HTMLTextAreaElement).value)
      .then(()=>dbgSay('copied'), ()=>dbgSay('clipboard refused — select and copy by hand')); });
  $('dbgPaste').addEventListener('click', ()=>{
    navigator.clipboard.readText()
      .then(v=>{ ($('dbgText') as HTMLTextAreaElement).value=v; dbgSay('pasted'); },
            ()=>dbgSay('clipboard refused — paste into the box by hand')); });
  if(DEBUG) setDebugUI(true, !wasAlreadyOn);
}
