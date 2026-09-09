import { $ } from '../core/dom'

/**
 * Four panels share two columns. Each carries a side and an open flag; the layout stacks the
 * open ones first, then the dots that reopen the closed ones — down the screen in portrait,
 * across it in landscape, where vertical room is the scarce thing. Dragging a panel inward
 * moves it to the other column; dragging it toward its own edge closes it. Both gestures read
 * the same pointer stream, so a mouse and a finger behave identically.
 *
 * Two things are injected rather than imported. `fitPanels` belongs to the resize logic and
 * `saveSettings` to ui/persist, and persist must not depend on this module — a panel's
 * position is something the settings record, not something the settings own.
 */

export type PanelId = 'env' | 'simPanel' | 'hud'
/** `s` side, `o` what the visitor asked for, `auto` what the layout had to do, `seq` recency */
interface PanelState { s: 'l' | 'r'; o: boolean; auto: boolean; seq: number }
/** a laid-out rectangle, for the crowding test */
interface Box { id: PanelId; seq: number; left: number; top: number; right: number; bottom: number }

let fitPanels: () => void = () => {}
let saveSettings: () => void = () => {}

// Four panels share two columns. Each carries a side and an open flag; the layout
// stacks the open ones first, then the dots that reopen the closed ones — down the
// screen in portrait, across it in landscape, where vertical room is the scarce thing.
// Dragging a panel inward moves it to the other column; dragging it toward its own
// edge closes it. Both gestures read the same pointer stream, so a mouse and a finger
// behave identically.
export const PANELS: readonly { id: PanelId; dot: string }[] = [
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
const pState: Record<PanelId, PanelState> = {
  env:     { s:'l', o:true,  auto:false, seq:++openSeq },
  simPanel:{ s:'r', o:false, auto:false, seq:0 },
  hud:     { s:'r', o:false, auto:false, seq:0 },
};
const panelShown = (id: PanelId): boolean => pState[id].o && !pState[id].auto;
export function setPanelOpen(id: PanelId, open: boolean): void {
  pState[id].o = open;
  if(open){ pState[id].seq = ++openSeq;
            const el = $(id); el.classList.remove('pop'); void el.offsetWidth;
            el.classList.add('pop'); setTimeout(()=> el.classList.remove('pop'), 260); }
  layoutPanels();
  fitPanels(); saveSettings();
}
// One pass of the layout: put every shown panel and dot where it belongs and report
// the rectangles, so the caller can judge whether the result actually fits.
function placePanels(): Box[] {
  const land = innerWidth > innerHeight, pad = 14, gap = 8;
  const boxes = [];
  for(const p of PANELS){
    const shown = panelShown(p.id);
    $(p.id).style.display = shown ? '' : 'none';
    $(p.dot).style.display = (!pState[p.id].o || pState[p.id].auto) ? 'block' : 'none';
    $(p.id).style.zIndex = String(5 + pState[p.id].seq);   // the newest opened sits on top
  }
  for(const side of ['l','r']){
    const mine = PANELS.filter(p => pState[p.id].s === side);
    let y = pad, dotX = 0;
    const put = (el: HTMLElement, x: number): void => {
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
function findCrowded(boxes: Box[]): PanelId | null {
  let worst: Box | null = null;
  const note = (b: Box): void => { if(!worst || b.seq < worst.seq) worst = b; };
  for(const b of boxes) if(b.bottom > innerHeight - 4) note(b);
  for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++){
    const a = boxes[i], c = boxes[j];
    if(a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom)
      note(a.seq < c.seq ? a : c);
  }
  // The cast is TypeScript's narrowing, not a doubt about the value: `worst` is only ever
  // assigned inside `note`, and control-flow analysis cannot see through the closure, so it
  // still believes the initialiser here.
  return (worst as Box | null)?.id ?? null;
}
export function layoutPanels(): void {
  for(const p of PANELS) pState[p.id].auto = false;
  for(let pass = 0; pass <= PANELS.length; pass++){
    const crowded = findCrowded(placePanels());
    if(!crowded) break;
    pState[crowded].auto = true;      // recomputed from scratch every time, so it can return
  }
}

/**
 * Register the drag gestures and the reopen dots, and hand over the two things this module
 * cannot import. Called from main.ts at the point the listeners used to be registered.
 */
export function initPanels(deps: { fitPanels: () => void; saveSettings: () => void }): void {
  fitPanels = deps.fitPanels; saveSettings = deps.saveSettings;
  // dragging: inward switches columns, outward closes
  for(const p of PANELS){
    const el = $(p.id);
    let x0 = 0, active = false, moved = 0, pid = -1;
    el.addEventListener('pointerdown', e => {
      // never steal a gesture that belongs to a control inside the panel
      // .sect and .tab are plain divs that act as buttons: if the swipe capture starts
      // on them, the pointer capture retargets the eventual click to the PANEL and the
      // header's own listener never fires — the accordions read as broken. Every
      // clickable thing in a panel must be listed here, not just the form controls.
      if((e.target as HTMLElement | null)?.closest('input, button, select, textarea, a, .seg, .chk, .sect, .tab')) return;
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
    b.addEventListener('click', () => setPanelOpen((b as HTMLElement).dataset.open as PanelId, true)));
}

/** The settings own what a visitor chose; this owns what the layout did about it. */
export function panelSnapshot(): Record<string, { s: string; o: boolean }> {
  const out: Record<string, { s: string; o: boolean }> = {};
  for(const p of PANELS) out[p.id] = { s: pState[p.id].s, o: pState[p.id].o };
  return out;
}
export function panelApply(saved: Record<string, { s?: string; o?: boolean }> | undefined): void {
  if(saved) for(const p of PANELS){
    const v = saved[p.id]; if(!v) continue;
    if(v.s === 'l' || v.s === 'r') pState[p.id].s = v.s;
    if(typeof v.o === 'boolean'){ pState[p.id].o = v.o; if(v.o) pState[p.id].seq = ++openSeq; }
  }
  // The settings dialog stays shut unless a saved record explicitly says otherwise. It is
  // the one panel that is a dialog rather than a reading, and opening on boot because it
  // happened to be open when the tab closed is not what a visitor means by "remember".
  if(!(saved && saved.hud && saved.hud.o === true)) pState.hud.o = false;
  layoutPanels();
}

/** Whether a panel is open as the visitor asked, ignoring what the layout did about it. */
export const panelIsOpen = (id: PanelId): boolean => pState[id].o
