/**
 * The (i) tooltips: one floating box, shown by a tap, gone on the next.
 *
 * One element for all of them, created here rather than in the markup, and positioned from
 * its own offsetWidth the instant it is shown — so the stylesheet that sizes it must already
 * apply. That is why the four stylesheets are render-blocking <link>s in <head> and never
 * JS-injected: a tooltip measured before its CSS lands is placed wrong, and nothing throws.
 *
 * `type="button"` on the icon matters, and is in the markup: an interactive child inside a
 * <label> does not forward the click to the input, so asking about a checkbox does not
 * toggle it.
 */

const tipEl = document.createElement('div'); tipEl.id = 'tip'; document.body.appendChild(tipEl);
let tipFor: HTMLElement | null = null, tipTimer = 0;
export function hideTip(): void { tipEl.style.display = 'none'; if(tipFor) tipFor.classList.remove('on'); tipFor = null; clearTimeout(tipTimer); }
function showTip(btn: HTMLElement): void {
  if(tipFor === btn){ hideTip(); return; }
  hideTip(); tipFor = btn; btn.classList.add('on');
  tipEl.textContent = btn.dataset.tip ?? null; tipEl.style.display = 'block';
  const r = btn.getBoundingClientRect(), tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  const x = Math.min(innerWidth - tw - 6, Math.max(6, r.left + r.width/2 - tw/2));
  const y = r.bottom + th + 6 > innerHeight - 6 ? r.top - th - 6 : r.bottom + 6;
  tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
  // window.setTimeout, not the bare one: the project pulls in @types/node for the scripts
  // and tests, and node's setTimeout returns a Timeout object rather than a number.
  tipTimer = window.setTimeout(hideTip, 8000);
}
document.addEventListener('click', e=>{
  const b = (e.target as Element | null)?.closest('.info') as HTMLElement | null;
  if(b){ e.preventDefault(); e.stopPropagation(); showTip(b); } else if(tipFor) hideTip();
}, true);
addEventListener('scroll', ()=>{ if(tipFor) hideTip(); }, true);
addEventListener('resize', ()=>{ if(tipFor) hideTip(); });
