/**
 * The engine sound's mapping, kept apart from the voices so it can be tested without a
 * page: what the motor hum, the ion whine, its pulse and the burst voice should be at a
 * throttle magnitude (0..1), with the burst held or not and the boost on or not. See
 * audio/engine.
 */
export interface EngineTargets {
  humF: number; humG: number; lpF: number
  whineF: number; whineG: number
  pulseHz: number
  burstG: number
}
/** what the voices should be at this throttle magnitude (0..1), burst held or not */
export function engineTargets(m: number, burst: boolean, boost: boolean): EngineTargets {
  m = Math.max(0, Math.min(1, m))
  const push = boost ? 1.25 : 1
  return {
    // the motor: a low hum, its energy in harmonics a small speaker can play
    humF: 70*(1 + 0.5*m*push),
    humG: 0.045 + 0.05*m,
    lpF:  380 + 900*m*push,
    // the ion drive: an electric vehicle's whine, climbing with the speed, faint at rest —
    // the character of the sound, so it stands above the motor
    whineF: 240 + 1100*m*push,
    whineG: 0.05 + 0.34*m,
    // pulsed: slow ticks at rest, a fast flutter at full
    pulseHz: 6 + 34*m*push,
    // the burst: a second, brighter ion voice on top
    burstG: burst ? 0.32 : 0,
  }
}
