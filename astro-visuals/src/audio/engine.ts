import { sound, initAudio } from './index'
import { engineTargets, type EngineTargets } from './engine-map'

/**
 * The ship's sound, synthesised — no files, and no noise: an ion drive, the way an electric
 * vehicle sounds rather than a rocket. Its own gain, straight into the compressor, so the
 * flight is heard whether or not the effects are on:
 *
 *  - the motor: two detuned saws at 70 Hz through a low-pass that never closes below
 *    380 Hz — small speakers play nothing under ~150 Hz, so it lives in its harmonics.
 *  - the whine: a sine with its second and third partials, from 240 Hz at rest to some
 *    1,300 Hz at full, faint when idle — the electric vehicle's rising tone — times the
 *    visitor's octave (`engine.octave`, the "flight pitch" setting; one octave down by
 *    default, so 120 to 670 Hz).
 *  - the pulse: the whine goes through a gate opened and closed by a soft square wave,
 *    6 pulses a second at rest and 40 at full — the ion drive's beat.
 *  - the burst: on the press a thump (a sine falling from 110 to 38 Hz) and a charge (a
 *    sine swept from 220 to 1,760 Hz); while held, a second, brighter ion voice a fifth
 *    above the whine, pulsing twice as fast.
 *
 * The volume slider is the switch, as music's and the effects' are: zero reads "off" and
 * silences it. Its level rides `engine.vol`; the whole voice fades out when flight lands.
 * The graph is the page's one AudioContext, built here on the take-off click if nothing
 * built it before — a click is the gesture the browser wants.
 */
/** `vol` the flight slider; `octave` the pitch setting, −2..+1 octaves on the whine and the burst (default −1: lower than v3.26's) */
export const engine = { vol: 0.4, octave: -1 }

interface Voices {
  out: GainNode
  o1: OscillatorNode; o2: OscillatorNode; sub: OscillatorNode
  lp: BiquadFilterNode; hum: GainNode
  w1: OscillatorNode; w2: OscillatorNode; w3: OscillatorNode; whine: GainNode
  lfo: OscillatorNode; lfoLp: BiquadFilterNode
  b1: OscillatorNode; bBp: BiquadFilterNode; burst: GainNode; lfo2: OscillatorNode
}
let v: Voices | null = null
function build(): Voices | null {
  const g = sound.graph; if(!g) return null
  const { ctx, comp } = g
  const out = ctx.createGain(); out.gain.value = 0; out.connect(comp)
  // the motor
  const hum = ctx.createGain(); hum.gain.value = 0; hum.connect(out)
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 0.9; lp.connect(hum)
  const mk = (type: OscillatorType, f: number, gain: number, to: AudioNode): OscillatorNode => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f
    const og = ctx.createGain(); og.gain.value = gain; o.connect(og); og.connect(to); o.start(); return o }
  const o1 = mk('sawtooth', 70, 0.35, lp), o2 = mk('sawtooth', 70, 0.35, lp), sub = mk('sine', 140, 0.35, lp)
  o2.detune.value = 9
  // a gate: base gain, plus a soft square wave on its gain — the ion pulse
  const gate = (to: AudioNode, hz: number): { in: GainNode; lfo: OscillatorNode; lfoLp: BiquadFilterNode } => {
    const gIn = ctx.createGain(); gIn.gain.value = 0.45; gIn.connect(to)
    const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = hz
    const lfoLp = ctx.createBiquadFilter(); lfoLp.type = 'lowpass'; lfoLp.frequency.value = hz*4
    const depth = ctx.createGain(); depth.gain.value = 0.45
    lfo.connect(lfoLp); lfoLp.connect(depth); depth.connect(gIn.gain); lfo.start()
    return { in: gIn, lfo, lfoLp }
  }
  const whine = ctx.createGain(); whine.gain.value = 0; whine.connect(out)
  const wg = gate(whine, 6)
  const w1 = mk('sine', 240, 0.6, wg.in), w2 = mk('triangle', 480, 0.22, wg.in), w3 = mk('sine', 722, 0.08, wg.in)
  // the burst voice
  const burst = ctx.createGain(); burst.gain.value = 0; burst.connect(out)
  const bg = gate(burst, 12)
  const bBp = ctx.createBiquadFilter(); bBp.type = 'bandpass'; bBp.frequency.value = 800; bBp.Q.value = 3; bBp.connect(bg.in)
  const b1 = mk('sawtooth', 360, 0.5, bBp)
  return { out, o1, o2, sub, lp, hum, w1, w2, w3, whine, lfo: wg.lfo, lfoLp: wg.lfoLp, b1, bBp, burst, lfo2: bg.lfo }
}

/** the take-off click: build the graph if nothing has, and wake the context */
export function engineWake(): void {
  if(engine.vol <= 0) return
  if(!sound.graph) sound.graph = initAudio()
  if(sound.graph) sound.graph.ctx.resume().catch(()=>{})
}

/** the burst's attack: a falling thump and a rising charge */
function kick(): void {
  if(!v || !sound.graph) return
  const { ctx } = sound.graph, t = ctx.currentTime
  const env = (peak: number, attack: number, decay: number): GainNode => {
    const gn = ctx.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(peak, t + attack); gn.gain.exponentialRampToValueAtTime(0.0001, t + decay); gn.connect(v!.out); return gn }
  const o = ctx.createOscillator(); o.type = 'sine'
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25)
  o.connect(env(0.6, 0.012, 0.34)); o.start(t); o.stop(t + 0.36)
  const c = ctx.createOscillator(); c.type = 'sine'
  const oc = Math.pow(2, engine.octave)   // the charge sits in the same octave as the whine
  c.frequency.setValueAtTime(220*oc, t); c.frequency.exponentialRampToValueAtTime(1760*oc, t + 0.35)
  c.connect(env(0.28, 0.03, 0.45)); c.start(t); c.stop(t + 0.47)
}

// the last targets sent, so a frame that changes nothing schedules nothing
let last: EngineTargets | null = null, lastOut = -1, lastBurst = false
const moved = (a: number, b: number, rel: number): boolean => Math.abs(a - b) > rel*Math.max(1e-3, Math.abs(b))

/**
 * Once a frame from the frame: `flying` the controls being live, `m` the throttle in effect
 * (0..1), `burst` the button held, `boost` the keyboard's. Silent, and cheap, until the first
 * flight builds the voices.
 */
export function engineUpdate(flying: boolean, m: number, burst: boolean, boost: boolean): void {
  const g = sound.graph
  if(!g){ return }
  if(!v){ if(!flying || engine.vol <= 0) return; v = build(); if(!v) return }
  const t = g.ctx.currentTime
  const outT = flying ? engine.vol*0.9 : 0
  if(Math.abs(outT - lastOut) > 1e-3){ v.out.gain.cancelScheduledValues(t); v.out.gain.setTargetAtTime(outT, t, flying ? 0.15 : 0.35); lastOut = outT }
  if(flying && burst && !lastBurst) kick()
  lastBurst = flying && burst
  if(!flying) return
  const k = engineTargets(m, burst, boost || burst, engine.octave)
  if(!last || moved(k.humF, last.humF, 0.004)){ v.o1.frequency.setTargetAtTime(k.humF, t, 0.12); v.o2.frequency.setTargetAtTime(k.humF, t, 0.12); v.sub.frequency.setTargetAtTime(k.humF*2, t, 0.12) }
  if(!last || moved(k.lpF, last.lpF, 0.01)) v.lp.frequency.setTargetAtTime(k.lpF, t, 0.12)
  if(!last || moved(k.humG, last.humG, 0.01)) v.hum.gain.setTargetAtTime(k.humG, t, 0.12)
  if(!last || moved(k.whineF, last.whineF, 0.004)){
    v.w1.frequency.setTargetAtTime(k.whineF, t, 0.15); v.w2.frequency.setTargetAtTime(k.whineF*2, t, 0.15); v.w3.frequency.setTargetAtTime(k.whineF*3.01, t, 0.15)
    v.b1.frequency.setTargetAtTime(k.whineF*1.5, t, 0.1); v.bBp.frequency.setTargetAtTime(k.whineF*2.2, t, 0.1) }
  if(!last || moved(k.whineG, last.whineG, 0.01)) v.whine.gain.setTargetAtTime(k.whineG, t, 0.15)
  if(!last || moved(k.pulseHz, last.pulseHz, 0.01)){
    v.lfo.frequency.setTargetAtTime(k.pulseHz, t, 0.15); v.lfoLp.frequency.setTargetAtTime(k.pulseHz*4, t, 0.15)
    v.lfo2.frequency.setTargetAtTime(k.pulseHz*2, t, 0.15) }
  if(!last || k.burstG !== last.burstG) v.burst.gain.setTargetAtTime(k.burstG, t, k.burstG > 0 ? 0.06 : 0.3)
  last = k
}
