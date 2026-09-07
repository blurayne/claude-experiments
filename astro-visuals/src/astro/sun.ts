/**
 * Where the Sun is in its trip round the galaxy: how far out, and how far round.
 *
 * Both are pure functions of the simulation clock, with no state of their own — which is why
 * the clock can be scrubbed backwards, and why the trail is recomputed from any time rather
 * than kept as history.
 *
 * sunPhase is the closed-form integral of the angular rate, not the rate itself applied
 * step by step. That distinction is the whole of v2.53.1: the flat rotation curve means the
 * orbital SPEED stays near 230 km/s, so as the merger widens the orbit the angular rate must
 * fall and the laps must lengthen. An earlier build advanced the anomaly at a fixed rate
 * while letting the radius grow, which carried the Sun round at 860 km/s — well above escape
 * speed out there.
 */
import { R_GAL, V_GAL, AGE0, YR_PER_SIM, SCATTER_AGE, SR_A, SR_B, SR_K } from './constants'

export function sunR(ts: number): number {
  // the scatter builds through the later passages, not the distant first one
  const d = AGE0 + ts*YR_PER_SIM/1e9 - SCATTER_AGE;
  return d <= 0 ? R_GAL : R_GAL*(SR_A - SR_B*Math.exp(-SR_K*d));
}
// How far round the galaxy the Sun has travelled. The rotation curve is flat, so the
// orbital *speed* stays near 230 km/s and the angular rate is v/R: as the merger widens
// the orbit the laps lengthen, out to 3.75× today's period. Turning the widening radius
// alone while holding the angular rate fixed — which is what an earlier build drew —
// would have carried the Sun round at 860 km/s, well above escape speed out there.
// This is the exact integral of that rate, so the galactic-year counter genuinely slows.
export function sunPhase(ts: number): number {
  const u = AGE0 + ts*YR_PER_SIM/1e9 - SCATTER_AGE;
  if(u <= 0) return ts*V_GAL/R_GAL;
  const tPre = (SCATTER_AGE - AGE0)*1e9/YR_PER_SIM;
  const dU = Math.log(SR_A*Math.exp(SR_K*u) - SR_B)/(SR_K*SR_A);   // in Gyr
  return (tPre + dU*1e9/YR_PER_SIM)*V_GAL/R_GAL;
}
