import { $ } from '../core/dom'
import { flight, flightStart, flightStop, flightLevel, leverThrottle, LEVER_ZERO } from '../render/flight'
import { warp, initWarp } from '../render/warp'
import { PANELS, panelIsOpen, panelSeq, setPanelOpen, type PanelId } from './panels'
import { engine, engineWake } from '../audio/engine'

/**
 * The flight's controls: the dock button that switches it on, the keys on a desktop, the
 * two thumb pads on a touch screen, and the readout beside the scale bar.
 *
 * Keys: W/S or ↑/↓ forward and back, A/D or ←/→ sideways, R and F (or E and Q) up and
 * down, shift the boost, escape lands. On a touch screen: the lever on the left is the
 * throttle, and stays where it is put; the button on the right is a burst, full ahead at
 * boost while held, and the thumb stick above it strafes and rises, springing back when
 * let go; a finger anywhere else turns the ship, and in flight that turn is
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
// The status bar slides away while flying, as the swipe-down does, and comes back on landing
// if it was up before. What the visitor chose is kept apart, so a save in flight does not
// record the flight's own slide as theirs.
let barWasSlid = false
function slideBar(on: boolean): void {
  const bar = $('gamebar')
  if(on){ barWasSlid = bar.classList.contains('slid'); bar.classList.add('slid'); bar.style.transform = 'translate(-50%, calc(100% + 15px))' }
  else if(!barWasSlid){ bar.classList.remove('slid'); bar.style.transform = '' }
}
/** the status bar's state as the visitor left it, for the saved settings */
export const barUserSlid = (): boolean => flight.on ? barWasSlid : $('gamebar').classList.contains('slid')
// The dialogs step aside too: every panel open at take-off is minimised, and exactly those
// come back on landing (one opened by hand in flight stays as it is). The saved layout is
// the one from before the flight, so a reload mid-flight does not lose the visitor's panels.
let closedByFlight: PanelId[] = []
function minimisePanels(on: boolean): void {
  if(on){
    // oldest first, so reopening them in this order leaves the newest on top again — on a
    // phone that is the one the crowded layout shows
    closedByFlight = PANELS.map(p => p.id).filter(id => panelIsOpen(id)).sort((a, b) => panelSeq(a) - panelSeq(b))
    for(const id of closedByFlight) setPanelOpen(id, false)
  } else {
    const ids = closedByFlight; closedByFlight = []   // cleared first: the saves below record the real state
    for(const id of ids) setPanelOpen(id, true)
  }
}
/** the saved panel layout as the visitor left it: the flight's own minimising undone */
export function flightPanelSnapshot<T extends Record<string, { o: boolean }>>(snap: T): T {
  for(const id of closedByFlight) if(snap[id]) snap[id].o = true
  return snap
}
export function setFlight(on: boolean, keep?: boolean): void {
  if(on === flight.on) return
  // landing by hand levels the camera where the ship looked; an import (keep) sets its own
  if(on){ if(keep) flight.on = true; else flightStart(); engineWake() } else { if(!keep) flightLevel(); flightStop(); down.clear() }
  leverShow(LEVER_ZERO)   // the lever rests at take-off and at landing
  slideBar(on)            // the status bar steps aside while flying
  minimisePanels(on)      // and so do the dialogs; landing restores both as they were
  $('tFly').classList.toggle('on', on)
  document.body.classList.toggle('flying', on)
  $('tFly').setAttribute('aria-pressed', on ? 'true' : 'false')
  onChange()
}

/**
 * The throttle: a vertical lever. Its zero sits a quarter of the way up (LEVER_ZERO): above
 * it is forward, and the knob stays where it is left; below it is reverse, which holds only
 * while the finger does — let go there and the lever springs back to zero. A tap sets it
 * where the tap is. The position-to-throttle curve is `leverThrottle` (render/flight).
 */
function lever(id: string, apply: (t: number) => void): void {
  const el = $(id), knob = el.querySelector('.knob') as HTMLElement; let pid = -1
  const half = (): number => (el.clientHeight || 150)/2 - 22
  const show = (p: number): void => { knob.style.setProperty('--ky', ((0.5 - p)*2*half()).toFixed(1) + 'px'); el.classList.toggle('rev', leverThrottle(p) < 0) }
  const read = (e: PointerEvent): number => {
    const r = el.getBoundingClientRect(), h = r.height/2 - 22
    return Math.max(0, Math.min(1, 0.5 - (e.clientY - (r.top + r.height/2))/(2*h)))
  }
  const set = (p: number): void => { apply(leverThrottle(p)); show(p) }
  el.addEventListener('pointerdown', e => { pid = e.pointerId; try{ el.setPointerCapture(e.pointerId) }catch(err){} el.classList.add('held'); set(read(e)); e.preventDefault(); e.stopPropagation() })
  el.addEventListener('pointermove', e => { if(e.pointerId !== pid) return; set(read(e)); e.stopPropagation() })
  const drop = (e: PointerEvent): void => { if(e.pointerId !== pid) return; pid = -1; el.classList.remove('held')
    const p = read(e); set(leverThrottle(p) > 0 ? p : LEVER_ZERO); e.stopPropagation() }   // reverse and the detent spring back to zero
  el.addEventListener('pointerup', drop); el.addEventListener('pointercancel', drop)
  el.addEventListener('contextmenu', e => e.preventDefault())
  leverShow = show
}
let leverShow: (p: number) => void = () => {}

/**
 * The thumb stick: the offset from its centre, over its radius, is the two axes it drives —
 * sideways and up — with a small dead zone, and it springs back to the centre when let go.
 */
function stick(id: string, apply: (x: number, y: number) => void): void {
  const el = $(id); let pid = -1
  const show = (x: number, y: number): void => { const reach = el.clientWidth/2 - 17
    el.style.setProperty('--kx', (x*reach).toFixed(1) + 'px'); el.style.setProperty('--ky', (-y*reach).toFixed(1) + 'px') }
  const read = (e: PointerEvent): void => {
    const r = el.getBoundingClientRect(), rad = r.width/2 - 17
    let x = (e.clientX - (r.left + r.width/2))/rad, y = -(e.clientY - (r.top + r.height/2))/rad
    const m = Math.hypot(x, y); if(m > 1){ x /= m; y /= m }
    const dead = 0.12, g = (v: number): number => Math.abs(v) < dead ? 0 : Math.sign(v)*(Math.abs(v) - dead)/(1 - dead)
    apply(g(x), g(y)); show(x, y)
  }
  el.addEventListener('pointerdown', e => { pid = e.pointerId; try{ el.setPointerCapture(e.pointerId) }catch(err){} el.classList.add('held'); read(e); e.preventDefault(); e.stopPropagation() })
  el.addEventListener('pointermove', e => { if(e.pointerId !== pid) return; read(e); e.stopPropagation() })
  const drop = (e: PointerEvent): void => { if(e.pointerId !== pid) return; pid = -1; el.classList.remove('held'); apply(0, 0); show(0, 0); e.stopPropagation() }
  el.addEventListener('pointerup', drop); el.addEventListener('pointercancel', drop)
  el.addEventListener('contextmenu', e => e.preventDefault())
}

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
/**
 * The flight's readout, bottom centre where the status bar was: the speed the ship is
 * actually making — not the full-throttle pace — and under it the lever, the burst, reverse
 * and the clock's share. Its own element: the scale note it used to ride in is hidden by
 * the "scale text" setting. Called by the HUD's own tick.
 */
export function updateFlightReadout(): void {
  if(!flight.on) return
  const a = flight.axis, now = flight.speedU*Math.min(1, Math.hypot(a[0], a[1], a[2]))
  const f = flight.factor, t = flight.throttle
  $('flySpeedV').textContent = now < flight.speedU*0.004 ? 'at rest' : fmtPace(now)
  $('flySpeedS').textContent = [
    flight.burst ? 'burst' : t < 0 ? 'reverse ' + Math.round(-t*100) + '%' : t > 0 ? 'throttle ' + Math.round(t*100) + '%' : '',
    f > 1.05 ? 'clock ×' + (f < 10 ? f.toFixed(1) : '10') : '',
  ].filter(Boolean).join(' · ') || 'lever to the top: ahead'
}

/** the flight's volume: the slider is the switch, as music's and the effects' are */
export function setFlightVol(x: number): void {
  engine.vol = Math.max(0, Math.min(1, x))
  $('flightVolv').textContent = engine.vol > 0 ? Math.round(engine.vol*100) + '%' : 'off'
  if(engine.vol > 0 && flight.on) engineWake()
}

/** the flight's pitch: whole octaves, −2..+1, on the whine and the burst */
export function setFlightOct(x: number): void {
  engine.octave = Math.max(-2, Math.min(1, Math.round(x)))
  $('flightOctv').textContent = engine.octave === 0 ? '0' : (engine.octave > 0 ? '+' : '−') + Math.abs(engine.octave) + ' oct'
}

export function initFlightUI(deps: { onChange: () => void }): void {
  onChange = deps.onChange
  $('flightVol').addEventListener('input', e => setFlightVol(+(e.target as HTMLInputElement).value))
  $('flightOct').addEventListener('input', e => setFlightOct(+(e.target as HTMLInputElement).value))
  setFlightOct(+($('flightOct') as HTMLInputElement).value)
  initWarp()
  const tw = $('tWarp') as HTMLInputElement
  warp.on = tw.checked
  tw.addEventListener('change', () => { warp.on = tw.checked })
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
  stick('padS', (x, y) => { flight.stick[0] = x; flight.stick[1] = y })
}
