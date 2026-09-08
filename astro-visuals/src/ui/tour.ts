import { $ } from '../core/dom'
import { simClock, view } from '../render/state'
import { PANELS, setPanelOpen } from './panels'

/**
 * The first run: a guided look at what is on screen, drawn with a line from each line of text
 * to the thing it names. It is shown once, and only to a visitor who has no saved settings —
 * somebody returning has already met the interface.
 *
 * The placement is the whole of it. Each hint is a small box set beside the thing it names,
 * and no two may overlap: on a narrow screen the free room is in the bands above and below
 * the card, which a one-directional walk never reaches, so candidates are tried nearest-first
 * over the whole column and on both flanks. A hint stays beside its target when it can and
 * travels only as far as it must.
 */

/** A rectangle in the placement search — the card, or a hint already placed. */
interface Box { left: number; top: number; right: number; bottom: number }

// A guided look at what is on screen, drawn with a line from each line of text to the
// thing it names. It is shown once, and only to a visitor who has no saved settings —
// somebody returning has already met the interface.
export const TOURKEY = 'galactic-transit.tour';
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
function tourTarget(id: string): HTMLElement | null {
  const el = $(id);
  if(el && getComputedStyle(el).display !== 'none' && el.style.visibility !== 'hidden') return el;
  const pan = PANELS.find(q => q.id === id);
  const dot = pan && $(pan.dot);
  return (dot && getComputedStyle(dot).display !== 'none') ? dot : null;
}
function drawTourLines(): void {
  const svg = $('tourSvg'), host = $('tourHints');
  const card = $('tourCard').getBoundingClientRect();
  svg.innerHTML = ''; host.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg', W = innerWidth, H = innerHeight, GAP = 18;
  const placed: Box[] = [card];
  const clash = (r: Box): boolean => placed.some(q => r.left < q.right+8 && q.left < r.right+8 &&
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
    d.setAttribute('cx', String(x2)); d.setAttribute('cy', String(y2)); d.setAttribute('r','3.5');
    d.setAttribute('fill','rgb(95,216,255)');
    svg.appendChild(d);
  }
}
let tourHeldClock = false;
export function showTour(): void {
  $('tour').style.display = 'flex';
  // on a narrow screen the panel and the hints cannot both have the corner: the panel
  // steps aside for the tour, and the tour hands it back on the way out
  if(innerWidth < 760 || innerHeight > innerWidth) setPanelOpen('env', false);
  if(!simClock.paused){ tourHeldClock = true; $('tPause').click(); }   // nothing moves while you read
  requestAnimationFrame(()=> requestAnimationFrame(drawTourLines));
}

export function initTour(): void {
  $('tourGo').addEventListener('click', ()=>{
    $('tour').style.display = 'none';
    setPanelOpen('env', true);                                 // the readings are the default view
    if(tourHeldClock && simClock.paused) $('tPause').click();            // and starts when you do
    tourHeldClock = false;
    try{ localStorage.setItem(TOURKEY, '1'); }catch(e){}
  });
  $('tourAgain').addEventListener('click', ()=>{ $('infoModal').style.display='none'; showTour(); });
  addEventListener('resize', ()=>{ if($('tour').style.display === 'flex') drawTourLines(); });
}
