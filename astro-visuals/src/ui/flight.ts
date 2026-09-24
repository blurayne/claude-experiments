import { $ } from '../core/dom'
import { flight, flightStart, flightStop } from '../render/flight'

/**
 * The flight's controls: the dock button that switches it on, the keys on a desktop, the
 * two thumb pads on a touch screen, and the readout beside the scale bar.
 *
 * Keys: W/S or ↑/↓ forward and back, A/D or ←/→ sideways, R and F (or E and Q) up and
 * down, shift the boost, escape lands. On a touch screen: the lever on the left is the
 * throttle, and stays where it is put; the button on the right is a burst, full ahead at
 * boost while held; a finger anywhere else turns the ship, and in flight that turn is
 * about the ship itself and does not hold the clock. The lever and the button are their
 * own elements over the canvas, so a thumb on one never orbits the view. The readout says
 * the pace in real units, the lever's setting, and the clock's share.
 */
const KEYS: Record<string, [number, number]> = {   // axis index, sign
  KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1],
  KeyD: [1, 1], ArrowRight: [1, 1], KeyA: [1, -1], ArrowLeft: [1, -1],
  KeyR: [2, 1], KeyE: [2, 1], KeyF: [2, -1], KeyQ: [2, -1],
}
const down = new Set<string>()
function keysToWant(): void {
  const w = [0, 0, 0]
  for(const c of down){ const k = KEYS[c]; if(k) w[k[0]] += k[1] }
  for(let i=0;i<3;i++) flight.want[i] = Math.max(-1, Math.min(1, w[i]))
}
const typing = (e: KeyboardEvent): boolean => { const t = e.target as HTMLElement | null; return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) }

let onChange: () => void = () => {}
export function setFlight(on: boolean, keep?: boolean): void {
  if(on === flight.on) return
  if(on){ if(keep) flight.on = true; else flightStart() } else { flightStop(); down.clear() }
  leverShow(0)   // the lever rests at take-off and at landing
  $('tFly').classList.toggle('on', on)
  document.body.classList.toggle('flying', on)
  $('tFly').setAttribute('aria-pressed', on ? 'true' : 'false')
  onChange()
}

/**
 * The throttle: a vertical lever. The knob follows the thumb and STAYS where it is left,
 * −100% at the foot, +100% at the head, with a detent at the middle (a release within a
 * few percent of it is zero). A tap sets it where the tap is.
 */
function lever(id: string, apply: (t: number) => void): void {
  const el = $(id), knob = el.querySelector('.knob') as HTMLElement; let pid = -1
  const show = (t: number): void => { knob.style.setProperty('--ky', (-t*(el.clientHeight/2 - 22)).toFixed(1) + 'px'); el.classList.toggle('rev', t < 0) }
  const read = (e: PointerEvent): number => {
    const r = el.getBoundingClientRect(), half = r.height/2 - 22
    return Math.max(-1, Math.min(1, -(e.clientY - (r.top + r.height/2))/half))
  }
  const set = (t: number): void => { apply(t); show(t) }
  el.addEventListener('pointerdown', e => { pid = e.pointerId; try{ el.setPointerCapture(e.pointerId) }catch(err){} el.classList.add('held'); set(read(e)); e.preventDefault(); e.stopPropagation() })
  el.addEventListener('pointermove', e => { if(e.pointerId !== pid) return; set(read(e)); e.stopPropagation() })
  const drop = (e: PointerEvent): void => { if(e.pointerId !== pid) return; pid = -1; el.classList.remove('held')
    const t = read(e); set(Math.abs(t) < 0.08 ? 0 : t); e.stopPropagation() }
  el.addEventListener('pointerup', drop); el.addEventListener('pointercancel', drop)
  el.addEventListener('contextmenu', e => e.preventDefault())
  leverShow = show
}
let leverShow: (t: number) => void = () => {}

/** the burst: full ahead at boost while the button is held */
function holdButton(id: string, apply: (down: boolean) => void): void {
  const el = $(id); let pid = -1
  el.addEventListener('pointerdown', e => { pid = e.pointerId; try{ el.setPointerCapture(e.pointerId) }catch(err){} el.classList.add('held'); apply(true); e.preventDefault(); e.stopPropagation() })
  const drop = (e: PointerEvent): void => { if(e.pointerId !== pid) return; pid = -1; el.classList.remove('held'); apply(false); e.stopPropagation() }
  el.addEventListener('pointerup', drop); el.addEventListener('pointercancel', drop)
  el.addEventListener('contextmenu', e => e.preventDefault())
}

/** the pace in real units a second: one unit is 30 light years */
export function fmtPace(unitsPerS: number): string {
  const ly = unitsPerS*30, au = ly*63241
  if(ly >= 1e6) return (ly/1e6).toFixed(ly < 1e7 ? 2 : 1) + ' Mly/s'
  if(ly >= 1000) return (ly/1000).toFixed(1) + ' kly/s'
  if(ly >= 0.05) return ly.toFixed(ly < 10 ? 2 : 0) + ' ly/s'
  if(au >= 0.5) return au.toFixed(au < 10 ? 1 : 0) + ' AU/s'
  const km = au*1.496e8
  if(km >= 1e6) return (km/1e6).toFixed(2) + ' Mkm/s'
  if(km >= 1) return Math.round(km).toLocaleString('en-US') + ' km/s'
  return (km*1000).toFixed(0) + ' m/s'
}
/** the readout beside the scale bar; called by the HUD's own tick */
export function updateFlightReadout(): void {
  const el = $('sFly')
  if(!flight.on){ el.style.display = 'none'; return }
  el.style.display = ''
  const f = flight.factor, t = flight.throttle
  $('sPace').textContent = fmtPace(flight.speedU)
  $('sClockShare').textContent = (flight.burst ? ' · burst' : t !== 0 ? ' · throttle ' + Math.round(t*100) + '%' : '')
                               + (f > 1.05 ? ' · clock ×' + (f < 10 ? f.toFixed(1) : '10') : '')
}

export function initFlightUI(deps: { onChange: () => void }): void {
  onChange = deps.onChange
  $('tFly').addEventListener('click', () => setFlight(!flight.on))
  addEventListener('keydown', e => {
    if(typing(e)) return
    if(e.code === 'Escape' && flight.on){ setFlight(false); return }
    if(!flight.on) return
    if(e.code === 'ShiftLeft' || e.code === 'ShiftRight'){ flight.boost = true; return }
    if(!KEYS[e.code]) return
    down.add(e.code); keysToWant(); e.preventDefault()
  })
  addEventListener('keyup', e => {
    if(e.code === 'ShiftLeft' || e.code === 'ShiftRight'){ flight.boost = false; return }
    if(down.delete(e.code)) keysToWant()
  })
  addEventListener('blur', () => { down.clear(); keysToWant(); flight.boost = false })   // a key released in another window
  lever('padL', t => { flight.throttle = t })
  holdButton('padR', down => { flight.burst = down })
}
