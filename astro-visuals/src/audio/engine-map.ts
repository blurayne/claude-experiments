/**
 * The engine sound's mapping, kept apart from the voices so it can be tested without a
 * page: what the hum, the air and the roar should be at a throttle magnitude (0..1), with
 * the burst held or not and the boost on or not. See audio/engine.
 */
export interface EngineTargets { humF: number; humG: number; lpF: number; airG: number; airF: number; roarG: number }
/** what the voices should be at this throttle magnitude (0..1), burst held or not */
export function engineTargets(m: number, burst: boolean, boost: boolean): EngineTargets {
  m = Math.max(0, Math.min(1, m))
  const push = boost ? 1.25 : 1
  // the fundamental sits at 70 Hz and the filter never closes below 420: small speakers
  // reproduce nothing under ~150 Hz, so the hum lives in its harmonics, as the drone's does
  return {
    humF: 70*(1 + 0.6*m*push),
    humG: 0.10 + 0.18*m,
    lpF:  420 + 1500*m*push,
    airG: 0.30*Math.pow(m, 1.5)*push,
    airF: 380 + 1600*m*push,
    // the burst stands clear of the throttle: a roar as loud as full ahead's air and hum
    // together, on top of them, a band higher
    roarG: burst ? 0.75 : 0,
  }
}
