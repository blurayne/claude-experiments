import { sound, initAudio } from './index'
import { engineTargets, type EngineTargets } from './engine-map'

/**
 * The ship's sound, synthesised — no files. Three voices on their own gain, straight into
 * the compressor, so the flight is heard whether or not the effects are on:
 *
 *  - the hum: two detuned saws at 70 Hz and a sine an octave up, through a low-pass that
 *    never closes below 420 Hz — small speakers play nothing under ~150 Hz, so the hum
 *    lives in its harmonics, as the drone's does. Idle, it is a quiet murmur that says the
 *    engine is lit; with the throttle its pitch climbs by up to sixty percent and the
 *    filter opens, so a harder push sounds harder.
 *  - the air: a looped noise through a band-pass whose centre rises with the speed — the
 *    rush of going somewhere. Silent at rest, it swells as the throttle to the power one
 *    and a half, so a nudge is barely there and full ahead is.
 *  - the burst: on the press a thump (a sine falling from 110 to 38 Hz in a quarter of a
 *    second, felt more than heard) and a whoosh (the noise swept up through a band-pass);
 *    while held, a roar a band above the air, loud enough to stand clear of full throttle.
 *
 * The volume slider is the switch, as music's and the effects' are: zero reads "off" and
 * silences it. Its level rides `engine.vol`; the whole voice fades out when flight lands.
 * The graph is the page's one AudioContext, built here on the take-off click if nothing
 * built it before — a click is the gesture the browser wants.
 */
export const engine = { vol: 0.4 }

interface Voices {
  out: GainNode
  o1: OscillatorNode; o2: OscillatorNode; sub: OscillatorNode
  lp: BiquadFilterNode; hum: GainNode
  air: GainNode; airBp: BiquadFilterNode
  roar: GainNode; roarBp: BiquadFilterNode
  noise: AudioBuffer
}
let v: Voices | null = null
function build(): Voices | null {
  const g = sound.graph; if(!g) return null
  const { ctx, comp } = g
  const out = ctx.createGain(); out.gain.value = 0; out.connect(comp)
  const hum = ctx.createGain(); hum.gain.value = 0; hum.connect(out)
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.9; lp.connect(hum)
  const mk = (type: OscillatorType, f: number, gain: number): OscillatorNode => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f
    const og = ctx.createGain(); og.gain.value = gain; o.connect(og); og.connect(lp); o.start(); return o }
  const o1 = mk('sawtooth', 70, 0.35), o2 = mk('sawtooth', 70, 0.35), sub = mk('sine', 140, 0.35)   // 'sub' is the octave above: body a small speaker can play
  o2.detune.value = 9
  // one second of noise, looped, for the air and the roar
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), nd = noise.getChannelData(0)
  for(let i=0;i<nd.length;i++) nd[i] = Math.random()*2 - 1
  const src = (): AudioBufferSourceNode => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; s.start(); return s }
  const air = ctx.createGain(); air.gain.value = 0; air.connect(out)
  const airBp = ctx.createBiquadFilter(); airBp.type = 'bandpass'; airBp.frequency.value = 320; airBp.Q.value = 0.8; airBp.connect(air)
  src().connect(airBp)
  const roar = ctx.createGain(); roar.gain.value = 0; roar.connect(out)
  const roarBp = ctx.createBiquadFilter(); roarBp.type = 'bandpass'; roarBp.frequency.value = 1400; roarBp.Q.value = 0.6; roarBp.connect(roar)
  src().connect(roarBp)
  return { out, o1, o2, sub, lp, hum, air, airBp, roar, roarBp, noise }
}

/** the take-off click: build the graph if nothing has, and wake the context */
export function engineWake(): void {
  if(engine.vol <= 0) return
  if(!sound.graph) sound.graph = initAudio()
  if(sound.graph) sound.graph.ctx.resume().catch(()=>{})
}

/** the burst's attack: a falling thump and a whoosh swept up */
function kick(): void {
  if(!v || !sound.graph) return
  const { ctx } = sound.graph, t = ctx.currentTime
  const o = ctx.createOscillator(); o.type = 'sine'
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25)
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
  o.connect(g); g.connect(v.out); o.start(t); o.stop(t + 0.36)
  const s = ctx.createBufferSource(); s.buffer = v.noise
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2
  bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 0.45)
  const wg = ctx.createGain(); wg.gain.setValueAtTime(0.0001, t); wg.gain.exponentialRampToValueAtTime(0.45, t + 0.08); wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
  s.connect(bp); bp.connect(wg); wg.connect(v.out); s.start(t); s.stop(t + 0.62)
  // and the roar opens from its low end, not already bright
  v.roarBp.frequency.cancelScheduledValues(t); v.roarBp.frequency.setValueAtTime(600, t); v.roarBp.frequency.setTargetAtTime(1800, t, 0.25)
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
  const k = engineTargets(m, burst, boost || burst)
  if(!last || moved(k.humF, last.humF, 0.004)){ v.o1.frequency.setTargetAtTime(k.humF, t, 0.12); v.o2.frequency.setTargetAtTime(k.humF, t, 0.12); v.sub.frequency.setTargetAtTime(k.humF*2, t, 0.12) }
  if(!last || moved(k.lpF, last.lpF, 0.01)) v.lp.frequency.setTargetAtTime(k.lpF, t, 0.12)
  if(!last || moved(k.humG, last.humG, 0.01)) v.hum.gain.setTargetAtTime(k.humG, t, 0.12)
  if(!last || moved(k.airG, last.airG, 0.02) || (k.airG === 0) !== (last.airG === 0)) v.air.gain.setTargetAtTime(k.airG, t, 0.18)
  if(!last || moved(k.airF, last.airF, 0.01)) v.airBp.frequency.setTargetAtTime(k.airF, t, 0.18)
  if(!last || k.roarG !== last.roarG) v.roar.gain.setTargetAtTime(k.roarG, t, k.roarG > 0 ? 0.08 : 0.35)
  last = k
}
