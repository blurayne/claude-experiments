/**
 * The Earth: which way it is facing, where the Moon is, and what the surface looks like at a
 * given age.
 *
 * The plate motion is a SCHEMATIC of the published reconstructions, not a plate model — the
 * poles and angles were chosen by hand to land the continents where the maps put them, and
 * the info panel says so, because a reader with a geology textbook would otherwise be right
 * to call it wrong.
 *
 * earthPrime carries a trap worth knowing about. Its spin phase is calibrated once, lazily,
 * on the first call, so that the Sun stands over Greenwich at noon on 2026-01-01 — and the
 * calibration reads the rendering origin. That origin used to be picked out of the renderer's
 * scope, which made the answer depend on WHEN the globe pass first ran rather than only on
 * the arguments; at a scenario that jumps the clock before the globe is ever drawn, the
 * calibration is against a Sun in the wrong place. It is a parameter now: the arithmetic is
 * unchanged and so is the result at the existing call site, but the dependency is in the
 * signature where it can be seen. Still lazy, and still not to be hoisted to module
 * evaluation.
 */
import type { Vec3 } from '../core/mat4'
import { E1, E2, AU2U, AGE0, YR_PER_SIM } from './constants'
import { PHASE, EN, bodyPos } from './bodies'

export interface EarthEra {
  molten: number
  ocean: number
  /** −2 means "no ocean at all", which the shader reads as a distinct case rather than a depth. */
  sea: number
  haze: number
  veg: number
  iceLat: number
  cloud: number
  lights: number
  drift: number
  dry: number
  seaLevel: number
}

// The plates: each carried by a rotation about a fixed pole, its angle keyed by time in
// Myr from today (negative past), interpolated between keys. A SCHEMATIC of the published
// reconstructions — the Atlantic opening from Pangaea, India's run north, Australia's,
// then the Atlantic closing and the continents gathering again into Pangaea Proxima —
// with the poles and angles chosen by hand to land the continents where the maps put
// them, not a plate model. Africa is the near-fixed reference. Order matches the map's ids.
export const PLATE_MODEL = [
  { name:'Antarctica', pole:[5.0,-5.8], keys:[[-250,10.4], [-100,5.2], [0,0.0], [250,-22.9]] },
  { name:'India', pole:[-17.7,160.6], keys:[[-250,54.8], [-130,50.4], [-60,21.9], [-40,6.6], [0,0.0], [250,-5.5]] },
  { name:'Australia', pole:[-11.4,-129.6], keys:[[-250,36.5], [-60,32.9], [0,0.0], [250,-23.7]] },
  { name:'S. America', pole:[70.0,-17.4], keys:[[-250,43.1], [-130,43.1], [0,0.0], [100,-6.5], [250,32.3]] },
  { name:'N. America', pole:[45.0,80.5], keys:[[-250,40.0], [-180,40.0], [0,0.0], [100,-6.0], [250,32.0]] },
  { name:'Africa', pole:[0,110], keys:[[0,0], [250,-8]] },
  { name:'Eurasia', pole:[30,90], keys:[[-250,10], [0,0], [250,-4]] }
];
export const plateMats = new Float32Array(63);
export function plateAngle(keys: readonly (readonly number[])[], tMyr: number): number {
  if(tMyr <= keys[0]![0]!) return keys[0]![1]!;
  for(let i=1;i<keys.length;i++) if(tMyr <= keys[i][0]){ const [t0,a0]=keys[i-1]!, [t1,a1]=keys[i]!; return a0 + (a1-a0)*(tMyr-t0)/(t1-t0); }
  return keys[keys.length-1]![1]!;
}
export function fillPlateMats(tMyr: number): void {
  for(let k=0;k<7;k++){
    const m = PLATE_MODEL[k]!, la = m.pole[0]*Math.PI/180, lo = m.pole[1]*Math.PI/180;
    const ax = Math.cos(la)*Math.cos(lo), ay = Math.cos(la)*Math.sin(lo), az = Math.sin(la);
    const th = -plateAngle(m.keys, tMyr)*Math.PI/180;          // the inverse: from now back to then
    const c = Math.cos(th), sn = Math.sin(th), C = 1-c;
    const M = [ c+ax*ax*C, ax*ay*C-az*sn, ax*az*C+ay*sn,
                ay*ax*C+az*sn, c+ay*ay*C, ay*az*C-ax*sn,
                az*ax*C-ay*sn, az*ay*C+ax*sn, c+az*az*C ];       // rows
    const o = k*9;                                              // column-major for GLSL
    plateMats[o]=M[0]; plateMats[o+1]=M[3]; plateMats[o+2]=M[6];
    plateMats[o+3]=M[1]; plateMats[o+4]=M[4]; plateMats[o+5]=M[7];
    plateMats[o+6]=M[2]; plateMats[o+7]=M[5]; plateMats[o+8]=M[8];
  }
}
// The Moon's orbit: its distance today, receding as it always has (3.8 cm/yr now, far faster
// when it was young) — a power law fitted to formation ~4.5 Gyr ago at a few Earth radii,
// not a dynamical model; Kepler's third law sets the period from the distance.
export const MOON_D0 = 384400/1.496e8*AU2U, MOON_INC = 5.145*Math.PI/180, MOON_P0 = 27.3217/365.25;
export const MOON_M1 = E1, MOON_M2 = [E2[0]*Math.cos(MOON_INC)+EN[0]*Math.sin(MOON_INC), E2[1]*Math.cos(MOON_INC)+EN[1]*Math.sin(MOON_INC), E2[2]*Math.cos(MOON_INC)+EN[2]*Math.sin(MOON_INC)];
export const MOON_BORN = 0.06;                                  // Gyr: the Theia impact, as the scenario has it
export const MOON_DIA = 2*(1737/1.496e8)*AU2U;                  // scene units, her true diameter
export function moonDist(a: number): number { return MOON_D0*Math.pow(Math.max(0.02, Math.min(3, (a - 0.05)/4.518)), 0.45); }
export const moonW = new Float64Array(3), moonRel = new Float32Array(3);
export function moonPos(t: number, out: Float64Array): Float64Array {                                // world position, doubles
  const a = AGE0 + t*YR_PER_SIM/1e9, d = moonDist(a), P = MOON_P0*Math.pow(d/MOON_D0, 1.5);
  const th = 2*Math.PI*t/P + 1.3;
  bodyPos(3, t, out);
  for(let k=0;k<3;k++) out[k] += d*(Math.cos(th)*MOON_M1[k] + Math.sin(th)*MOON_M2[k]);
  return out;
}
// Earth's spin axis: 23.44° from the ecliptic normal, tilted toward the direction that
// makes northern summer fall on the calendar's June — the piece's year phase is Jan 1.
const OBLIQ = 23.44*Math.PI/180;
export const EARTH_AXIS = (()=>{ const psi = PHASE[3] + 2*Math.PI*0.471 + Math.PI, c=Math.cos(psi), s=Math.sin(psi);
  const e=[c*E1[0]+s*E2[0], c*E1[1]+s*E2[1], c*E1[2]+s*E2[2]];
  return [Math.cos(OBLIQ)*EN[0]+Math.sin(OBLIQ)*e[0], Math.cos(OBLIQ)*EN[1]+Math.sin(OBLIQ)*e[1], Math.cos(OBLIQ)*EN[2]+Math.sin(OBLIQ)*e[2]]; })();
export const EARTH_P0 = (()=>{ const A=EARTH_AXIS, d=E1[0]*A[0]+E1[1]*A[1]+E1[2]*A[2]; const v=[E1[0]-d*A[0],E1[1]-d*A[1],E1[2]-d*A[2]];
  const l=Math.hypot(...v); return [v[0]/l,v[1]/l,v[2]/l]; })();
export const SIDEREAL = 366.2422;                                 // rotations per year
let earthPhi0: number | null = null;                                     // set once: Greenwich noon on 2026-01-01
export function earthPrime(t: number, out: Float64Array, org: Float64Array): Float64Array {                              // the prime meridian's direction on the equator at t
  const A = EARTH_AXIS, P0 = EARTH_P0, Q0 = [A[1]*P0[2]-A[2]*P0[1], A[2]*P0[0]-A[0]*P0[2], A[0]*P0[1]-A[1]*P0[0]];
  if(earthPhi0 === null){
    // solve the spin phase so that the Sun stands over the prime meridian at that noon
    const tn = 0.5/365.25, e = new Float64Array(3); bodyPos(3, tn, e);
    const sx=-e[0]+org[0], sy=-e[1]+org[1], sz=-e[2]+org[2];   // toward the Sun, from Earth (org is the Sun now)
    const lam = Math.atan2(sx*Q0[0]+sy*Q0[1]+sz*Q0[2], sx*P0[0]+sy*P0[1]+sz*P0[2]);
    earthPhi0 = lam - 2*Math.PI*SIDEREAL*tn;
  }
  const w = 2*Math.PI*SIDEREAL*t + earthPhi0, c=Math.cos(w), sn=Math.sin(w);
  for(let k=0;k<3;k++) out[k] = c*P0[k] + sn*Q0[k];
  return out;
}
// The era: what the planet looks like at a given age, from the piece's own timeline and
// its climate model. Every number here is a model choice, disclosed in the info panel.
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
export function earthEra(a: number, meanC: number): EarthEra {
  const molten = Math.max(clamp01((0.16 - a)/0.09), clamp01((a - 11.15)/0.12));          // Hadean, and under the giant
  const ocean  = clamp01((a - 0.15)/0.10) * clamp01((6.6 - a)/1.0);                       // late Hadean to the moist greenhouse
  const haze   = clamp01((2.55 - a)/0.45);                                                // methane haze until the Great Oxidation
  const veg    = clamp01((a - 4.12)/0.13) * clamp01((5.45 - a)/0.25);                     // land plants: Devonian on, starved ~0.9 Gyr ahead
  const landF  = ocean > 0 ? 0.06 + 0.23*clamp01((a - 0.3)/2.2) : 1;                      // continents grow through the Archean
  // the noise threshold that gives that land fraction: the fbm in the shader averages 0.48
  // with a spread of ~0.11, so 29% land sits 0.55σ above the mean and 6% at 1.55σ
  const sea    = ocean > 0 ? 0.485 + 0.113*(1.55 - 1.0*Math.min(1, landF/0.29)) : -1;   // ported and measured: 0.547 -> 29%, 0.660 -> 6%
  const snow   = Math.max(clamp01(1 - Math.abs(a - 2.20)/0.15), clamp01(1 - Math.abs(a - 3.885)/0.05));   // Huronian, Cryogenian
  // Ice from the climate model only in the Phanerozoic, where its greenhouse is roughly
  // right; earlier it reads the faint young Sun without the greenhouse that kept the
  // early oceans liquid, so before that the caps follow the rock record instead: none,
  // except the snowballs above and the Pongola (2.9 Ga) and Karoo (300 Ma) ice ages.
  let iceLat = a > 3.95 ? Math.max(18, Math.min(88, 90 - (18 - meanC)*5.5))                 // 15 °C -> ~74°; 11 -> ~52°; 5 -> ~18°
             : 95 - 40*clamp01(1 - Math.abs(a - 1.67)/0.06);                                // Pongola: caps to ~55° for a moment
  if(a > 4.03 && a <= AGE0 + 1e-6){
    // where there is a rock record it outranks the model: the Phanerozoic's three ice
    // ages, and no caps at all between them — the Permian–Triassic world of Pangaea and
    // the Cretaceous were hothouses. The HUD's glacial badge stays the model's own word.
    let rec = 88;
    rec = Math.min(rec, 95 - 50*clamp01(1 - Math.abs(a - 4.130)/0.010));                     // Ordovician–Silurian, 445–430 Ma
    if(a > 4.208 && a < 4.313) rec = Math.min(rec, 50 + 8*clamp01(Math.abs(a - 4.26)/0.05));  // Karoo, 360–255 Ma
    if(a >= 4.534) rec = Math.min(rec, a >= 4.565 ? 64 : 70);                                  // Antarctic ice from 34 Ma; both poles in the Pleistocene
    iceLat = rec;
  }
  if(a > 4.22 && a < 4.31) iceLat = Math.min(iceLat, 50);                                  // Karoo
  iceLat = Math.min(iceLat, 95 - 50*clamp01(1 - Math.abs(a - 4.123)/0.008));              // Ordovician (445 Ma)
  if(a > 4.44 && a < 4.51) iceLat = Math.max(iceLat, 89);                                  // the Cretaceous hothouse: no caps
  if(a > 4.75 && a < 4.85) iceLat = Math.min(iceLat, 62);                                  // Proxima: a supercontinent's caps
  iceLat = (1 - snow)*iceLat + snow*0;
  // dry periods: Pangaea's interior (Permian–Triassic), the Old Red Sandstone deserts of
  // the Devonian, and Proxima's; then the drying that ends the oceans
  const dry = Math.max(clamp01(1 - Math.abs(a - 4.32)/0.06), 0.6*clamp01(1 - Math.abs(a - 4.175)/0.03),
                       0.8*clamp01(1 - Math.abs(a - 4.80)/0.06), clamp01((a - 5.4)/0.8));
  const seaLevel = ocean >= 0.999 ? 1 : Math.pow(ocean, 0.5);
  if(ocean <= 0 || molten > 0) iceLat = 95;
  const cloud  = ocean*(0.55 + 0.35*clamp01((a - 5.3)/0.8))*(1 - molten);
  const lights = Math.abs(a - AGE0) < 2e-5 ? 1 : 0;                                       // twenty thousand years around now
  return { molten, ocean, sea: sea < 0 ? -2 : sea, haze, veg, iceLat, cloud, lights, drift: a*2.5, dry, seaLevel };
}
