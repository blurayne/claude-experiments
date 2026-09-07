/**
 * Earth's galactic environment, and what it does to the climate.
 *
 * Everything here is a pure function of the clock, where it used to read `simT` directly.
 * That is not tidiness: this is the model the science work will revisit — the arm-crossing
 * cadence, the corotation radius, whether the cosmic-ray coupling belongs at all — and a
 * function you can call at an arbitrary time is one you can plot, tabulate and test.
 *
 * The cosmic-ray/cloud coupling is drawn as a HYPOTHESIS, not a result, and the info panel
 * says so: Shaviv and Svensmark proposed it and it remains contested. The ~140 Myr glaciation
 * spacing it produces is a consequence of the corotation radius this piece uses, which is not
 * the measured one. Moving it to the measured value ends the glacial epochs — a decision
 * about what the piece claims, not a bug fix, and one recorded in TODO.md rather than taken
 * here.
 */
import { AGE0, YR_PER_SIM, V_GAL, R_GAL, ARMS, armAngle } from './constants'
import { WOB_T } from './bodies'
import { mergeAt } from './merger'
import { sunState } from './sun'

export interface Environment { cr: number; mean: number; min: number; max: number; star: number; ice: boolean }
export interface LifeState { h: number; why: string; label: string }

// ---------- star-formation history ----------
// The Galaxy's star formation is winding down: the gas reservoir is being consumed
// faster than it is replenished, so the rate decays with an e-folding time of order
// 6 Gyr. Ahead lies the Andromeda encounter, which shock-compresses the remaining gas
// into a starburst and then quenches it — the merged, gas-poor remnant forms almost
// nothing. Normalised so the present day is exactly 1.
/** Age of the solar system, in Gyr, at a given reading of the simulation clock. */
export const ageAt = (ts: number): number => AGE0 + ts*YR_PER_SIM/1e9;
export function sfrFactor(a: number): number {
  let f = Math.exp(-(a-AGE0)/6);                              // gas runs down
  f += 2.5*Math.exp(-Math.pow((a-11.45)/0.30,2));             // starburst at the second passage
  f += 8*Math.exp(-Math.pow((a-12.35)/0.40,2));               // and the big one at coalescence
  const q = 1/(1+Math.exp((a-12.95)/0.35));                   // then quenched for good
  return Math.max(0.02, f*(0.05+0.95*q));
}
export function ratesIntegral(a: number): number { // factor-weighted years between simT=0 and the shown epoch
  const N=360, h=(a-AGE0)/N; let s=0;
  for(let i=0;i<N;i++) s += sfrFactor(AGE0+h*(i+0.5))*h;
  return Math.abs(s)*1e9;
}

// ---------- Earth's galactic environment ----------
// Earth's temperature is set by the Sun, not by where the Sun sits in the Galaxy. What
// galactic position plausibly does change is the cosmic-ray flux: crossing a spiral arm
// means more nearby supernovae, and passing through the dense mid-plane adds more again.
// Shaviv and Svensmark proposed that this modulates low cloud cover and so the climate,
// matching the ~140 Myr spacing of the great ice ages. It remains contested, and it is
// drawn here as a hypothesis, not a result.
function rawCR(ts: number): { cr: number; armProx: number } {
  const rel = ts*V_GAL*(1/R_GAL - 1/640);        // Sun's angle within the spiral pattern
  let best = 9;
  for(const a of ARMS){
    let d = rel - armAngle(R_GAL, a[0]);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    best = Math.min(best, Math.abs(d));
  }
  const armProx = Math.exp(-Math.pow(best/0.45,2));
  const planeProx = 1 - Math.abs(Math.sin(2*Math.PI*ts/WOB_T + 2.1));
  return { cr: 1 + 2.2*armProx + 0.5*planeProx, armProx };
}
const CR0 = rawCR(0).cr;                          // normalise: today is 1.00x
export function environment(ts: number): Environment {
  const r = rawCR(ts);
  // An elliptical has no spiral arms to cross. The arm term — and with it the ~140 Myr
  // glaciation spacing that the whole cosmic-ray/cloud argument rests on — fades out as
  // the remnant relaxes, rather than ticking on forever over a galaxy that no longer has
  // arms. What is left is a quenched galaxy's quieter cosmic-ray background.
  const spiral = 1 - mergeAt(ageAt(ts));
  const cr = (1 + (r.cr - 1)*spiral)/CR0;
  const dT = -5.5*(cr-1)/1.5;                     // the contested cloud coupling
  // What the Sun is doing dominates everything else once you look far enough ahead: the
  // equilibrium temperature goes as the fourth root of its output, so the cloud term above
  // only decides the climate while that output is near today's. Scaling the absolute
  // temperature keeps today exact (L = 1) and still reports a molten surface under a red
  // giant instead of a pleasant 10 degrees. The spread narrows the same way — a world with
  // no oceans and no ice cap has far less to separate its poles from its deserts.
  const L4 = Math.pow(sunState(ageAt(ts)).L, 0.25);
  const mean = (288.15 + dT)*L4 - 273.15;
  const spread = 1/Math.max(1, L4);
  return { cr, mean, min: mean - 104*spread, max: mean + 42*spread,
           star: 1 + 2.0*r.armProx*spiral, ice: mean < 11.2 };
}

export function lifeState(a: number, e: Environment): LifeState {
  let h = 0, why = 'stable';
  if(a < 0.65){ h = 1; why = 'magma ocean'; }                       // the Hadean
  const solar = Math.min(1, Math.max(0, (a - 5.35)/0.95));
  if(solar > h){ h = solar; why = a > 6.0 ? 'oceans boiled off' : 'the Sun is brightening'; }
  const rad = Math.min(1, Math.max(0, (sfrFactor(a)*e.cr - 1.8)/3.6));
  if(rad > h){ h = rad; why = 'supernovae & cosmic rays'; }
  return { h, why, label: h > 0.75 ? 'uninhabitable' : h > 0.33 ? 'endangered'
                        : h > 0.05 ? 'habitable' : 'excellent' };
}
