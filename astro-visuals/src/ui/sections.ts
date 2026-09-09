import { $ } from '../core/dom'

/**
 * The settings panel's collapsible sections, and the segmented buttons inside them.
 *
 * Each heading owns a body; the arrow turns to show which way it goes. Simulation starts
 * closed: its two sliders and the scenario list are the controls a visitor is least likely to
 * want on arrival, and the piece opens on a staged scenario anyway. One section at a time by
 * default, so the panel stays a screenful — Graphics is the one that earns the opening slot,
 * holding the controls a visitor reaches for most.
 *
 * `fitPanels` and `saveSettings` are injected for the same reason as in ui/panels: one belongs
 * to the resize logic and the other to ui/persist, which must not depend on either of us.
 */

const SECS = ['audio','gfx','hud','other'] as const;
type Sec = (typeof SECS)[number]
const SEC_BODY: Record<Sec, string> = { audio:'secAudio', gfx:'secGfx', hud:'secHud', other:'secOther' };
const secOpen: Record<Sec, boolean> = { audio:false, gfx:true, hud:false, other:false };

let fitPanels: () => void = () => {}
let saveSettings: () => void = () => {}

export function applySecs(): void {
  for(const k of SECS){
    $(SEC_BODY[k]).classList.toggle('closed', !secOpen[k]);
    document.querySelector('.sect[data-sec="'+k+'"]')!.classList.toggle('closed', !secOpen[k]);
  }
  fitPanels();
}

/**
 * One control, several faces: a segmented button where exactly one segment is lit.
 *
 * Only the lit segment is set at build time — the state variables carry the same defaults,
 * and calling `fn` this early would touch bindings not yet initialised. That is a real trap
 * and not a micro-optimisation: several of these are built before the values they set exist.
 */
export function seg(id: string, initial: string, fn: (v: string) => void): (v: string, apply?: boolean) => void {
  const bs = [...$(id).children] as HTMLElement[];
  const set = (v: string, apply?: boolean): void => {
    bs.forEach(b => b.classList.toggle('on', b.dataset.v === v));
    if(apply !== false) fn(v);
  };
  bs.forEach(b => b.addEventListener('click', ()=>{ set(b.dataset.v!); saveSettings(); }));
  set(initial, false);
  return set;
}

export function initSections(deps: { fitPanels: () => void; saveSettings: () => void }): void {
  fitPanels = deps.fitPanels; saveSettings = deps.saveSettings;
  document.querySelectorAll('.sect[data-sec]').forEach(h =>
    h.addEventListener('click', ()=>{
      const k = (h as HTMLElement).dataset.sec as Sec, opening = !secOpen[k];
      if(opening && ($('secSolo') as HTMLInputElement).checked) for(const s of SECS) secOpen[s] = false;
      secOpen[k] = opening;
      applySecs(); saveSettings();
    }));
  $('secSolo').addEventListener('change', ()=>{
    if(($('secSolo') as HTMLInputElement).checked){   // keep the topmost open one, fold the rest away
      let kept = false;
      for(const s of SECS){ if(secOpen[s] && !kept) kept = true; else secOpen[s] = false; }
    }
    applySecs(); saveSettings();
  });
}

export const sectionSnapshot = (): Record<string, boolean> => ({ ...secOpen })
export function sectionApply(saved: Record<string, unknown> | undefined): void {
  if(!saved) return;
  for(const k of SECS) if(typeof saved[k] === 'boolean') secOpen[k] = saved[k] as boolean;
}

// The debug settings left the settings panel in v3.7 — they live in the debug panel now,
// beside the state box they belong with — so there is no section for the door to fold.
