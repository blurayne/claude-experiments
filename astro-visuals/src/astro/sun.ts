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

// ---------------------------------------------------------------------------------------
// The Sun's own life. sunState is the single source for its luminosity, radius and phase,
// and three things read it: the drawn disc, so a red giant is rendered at the size the model
// gives it rather than as a fixed dot; the climate in environment(), which scales absolute
// temperature by L^0.25 and so keeps today exact at L = 1; and the Earth panel.
//
// Engulfment is latched against SUN_EAT_AGE, never against the current radius. The Sun
// contracts again after the red-giant tip; the Earth does not come back.

export interface SunState { L: number; R: number; T: number; phase: string; eaten: boolean; gone: boolean }
export interface PnState { rAU: number; alpha: number; age: number }
export interface SunTint { d: number[]; b: number[]; dot: number[] }

// The Sun's own life, on the standard track. On the main sequence luminosity follows
// the classic faint-young-Sun relation (Gough 1981): 70% of today's at formation,
// rising as the core contracts. It leaves the main sequence at ~10.9 Gyr, swells up
// the red giant branch to ~256 solar radii — past Earth's orbit — at ~12.17 Gyr, and
// after the helium flash and a second climb ends as a white dwarf at ~12.4 Gyr
// (Schröder & Smith 2008). Percentages are of the Sun as it is now.
export const SUN_MS_END = 10.9, SUN_RGB_TIP = 12.17, SUN_HB = 12.30, SUN_AGB = 12.37, SUN_WD = 12.44;
export const EARTH_ORBIT_RSUN = 215.0;    // 1 AU in solar radii
// The age at which the swelling surface first reaches Earth's orbit. Engulfment is a
// thing that happens once: the Sun contracts again after the tip, but the Earth does
// not come back, so the test is against this age rather than against today's radius.
export const SUN_EAT_AGE = SUN_MS_END + (Math.log(EARTH_ORBIT_RSUN/1.6)/Math.log(256/1.6))*(SUN_RGB_TIP - SUN_MS_END);
export function sunState(a: number): SunState {
  let L: number, R: number, phase: string;
  if(a < SUN_MS_END){
    L = 1/(1 + 0.4*(1 - a/4.57));
    R = 0.87 + 0.13*(a/4.57) + 0.6*Math.pow(Math.max(0,a-8)/2.9, 3);
    phase = a < 9.5 ? 'main sequence' : 'leaving the main sequence';
  } else if(a < SUN_RGB_TIP){
    const u = (a - SUN_MS_END)/(SUN_RGB_TIP - SUN_MS_END);
    R = 1.6*Math.exp(u*Math.log(256/1.6));
    L = 2.2*Math.exp(u*Math.log(2730/2.2));
    phase = 'red giant';
  } else if(a < SUN_HB){
    const u = (a - SUN_RGB_TIP)/(SUN_HB - SUN_RGB_TIP);
    R = 256*Math.exp(u*Math.log(10/256));
    L = 2730*Math.exp(u*Math.log(50/2730));
    phase = 'helium flash';
  } else if(a < SUN_AGB){
    const u = (a - SUN_HB)/(SUN_AGB - SUN_HB);
    R = 10*Math.exp(u*Math.log(180/10));
    L = 50*Math.exp(u*Math.log(3000/50));
    phase = 'asymptotic giant';
  } else if(a < SUN_WD){
    const u = (a - SUN_AGB)/(SUN_WD - SUN_AGB);
    R = 180*Math.exp(u*Math.log(0.0092/180));
    L = 3000*Math.exp(u*Math.log(0.5/3000));
    phase = 'planetary nebula';
  } else {
    R = 0.0092;
    // a fresh white dwarf is a tenth of today's Sun and fades from there
    L = Math.max(1e-6, 0.1*Math.exp(-(a - SUN_WD)/1.5));
    phase = 'white dwarf';
  }
  // Effective temperature from the two numbers the model already has: L = 4πR²σT⁴, so
  // T/T☉ = L^¼/√R. Nothing is tabulated for colour — the red of the giant, the orange of
  // the horizontal branch and the blue-white of the nebula's central star all fall out.
  const T = 5772*Math.pow(L, 0.25)/Math.sqrt(R);
  return { L, R, T, phase, eaten: a >= SUN_EAT_AGE, gone: a >= SUN_AGB };
}
// The age at which the swelling surface reaches a given radius on the first climb —
// the rule SUN_EAT_AGE follows, opened up so each inner planet gets its own moment.
const eatAge = (rSun: number): number => SUN_MS_END + (Math.log(rSun/1.6)/Math.log(256/1.6))*(SUN_RGB_TIP - SUN_MS_END);
// Mercury, Venus, Earth (body indices 1-3), by orbit in solar radii. Mars at 327 R☉ is
// outside the 256 the giant reaches, and survives — as it does in the literature.
export const EAT_AGES = [0, eatAge(0.387*EARTH_ORBIT_RSUN), eatAge(0.723*EARTH_ORBIT_RSUN), eatAge(EARTH_ORBIT_RSUN)];
// The photosphere's palette by temperature: dark and bright tones for the disc shader
// and the far dot's colour, interpolated in log T between anchors. The 5772 K anchor is
// today's Sun exactly, so nothing about the present look changes.
export const SUN_ANCHORS = [
  [ 2400, [0.62,0.05,0.01], [1.00,0.28,0.08], [1.00,0.36,0.14]],
  [ 3300, [0.85,0.14,0.02], [1.00,0.46,0.16], [1.00,0.52,0.24]],
  [ 4700, [1.00,0.33,0.06], [1.00,0.74,0.40], [1.00,0.70,0.38]],
  [ 5772, [1.00,0.45,0.10], [1.00,0.93,0.62], [1.00,0.86,0.55]],
  [ 8000, [0.92,0.66,0.42], [1.00,0.97,0.88], [1.00,0.96,0.86]],
  [15000, [0.62,0.72,1.00], [0.88,0.94,1.00], [0.80,0.88,1.00]],
  [60000, [0.55,0.65,1.00], [0.85,0.92,1.00], [0.72,0.82,1.00]],
];
export function sunTint(T: number): SunTint {
  const A = SUN_ANCHORS, lt = Math.log(Math.min(60000, Math.max(2400, T)));
  let i = 0; while(i < A.length-2 && lt > Math.log(A[i+1]![0] as number)) i++;
  const f = (lt - Math.log(A[i]![0] as number))/(Math.log(A[i+1]![0] as number) - Math.log(A[i]![0] as number));
  const mix = (k: number): number[] => (A[i]![k] as number[]).map((v, c) => v + ((A[i+1]![k] as number[])[c]! - v)*f);
  return { d: mix(1), b: mix(2), dot: mix(3) };
}
// The planetary nebula: the shed envelope, drawn at its true size and stretched in time
// like every other death here. It grows through the phase from the giant's own radius
// to about half a light-year, then keeps spreading and fading into the white-dwarf era.
// A real one is gone in twenty thousand years; this lasts a third of a gigayear.
export function pnState(a: number): PnState | null {
  if(a < SUN_AGB) return null;
  const u = Math.min(1, (a - SUN_AGB)/(SUN_WD - SUN_AGB));          // 0..1 through the phase
  const after = Math.max(0, a - SUN_WD);
  const rAU = 1 + 30000*u + 60000*Math.min(1, after/0.3);          // AU: ~0.5 ly, then ~1.4 ly
  const alpha = Math.min(1, u*3) * Math.max(0, 1 - after/0.3);
  if(alpha <= 0) return null;
  return { rAU, alpha, age: Math.min(1, 0.6*u + 0.4*Math.min(1, after/0.3)) };
}
