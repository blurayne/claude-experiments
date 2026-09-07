/**
 * Andromeda's approach, the passages, and the merger.
 *
 * The control points are Gaia-era: 765 kpc today closing at about 110 km/s, first passage
 * near 95 kpc at +4.5 Gyr, coalescence around +8.8. Sawala et al. 2025 puts the odds of a
 * merger within 10 Gyr at only about even; what is drawn is the median of the merging half,
 * and the info panel says so rather than presenting one track as the answer.
 *
 * Everything here is a pure function of age or of the simulation clock. That is deliberate
 * and about to be useful: rebuilding this against the current simulations — M33 and the LMC
 * included — is its own project, and a module with no state and its own tests is where that
 * work can happen without touching anything that draws.
 */
import type { Vec3 } from '../core/mat4'
import { AGE0, YR_PER_SIM, V_GAL } from './constants'

// The orbit follows the Gaia-era picture (van der Marel et al.; Sawala et al., Nature
// Astronomy 2025): a first passage ~4.5 Gyr from now at ~95 kpc — the disks never touch,
// they trade bridges — then dynamical friction bites, the passages shrink, and the pair
// coalesces about 8.8 Gyr from now. The 2025 ensemble gives only ~50% odds of merging
// within 10 Gyr at all; what is drawn is the median of the merging half, and the info
// panel says so. Andromeda approaches from its true direction (l=121.2°, b=−21.6°).
export const M31_DIR: Vec3 = [0.7957, -0.3677, 0.4814];   // toward M31 today, scene coordinates
export const M31_E2: Vec3 = [0.3037, -0.4454, -0.8422];  // second axis of the orbital plane
// M31's disk frame in scene coordinates, from its measured PA 38°, inclination 77°,
// near side NW, NE side approaching — the spin pole lands at galactic (242°, −30°),
// matching published values. Local y is minus the spin axis so a positive shader spin
// turns it its real way, the same convention the Milky Way is drawn with.
export const M31_ROT = new Float32Array([
  -0.0926, 0.7115, 0.6965,     // local x: the major axis
   0.7623, 0.5007,-0.4102,     // local y
  -0.6406, 0.4930,-0.5887]);   // local z
export const KPC2U = 1000*3.2616/30;  // scene units per kpc (true scale)
// (age Gyr, u kpc, v kpc) in the orbital plane; Hermite-interpolated below
export const M31_ORBIT = [
  [ 3.0,   942,  -14],
  [ 4.568, 765,    0],   // today: 765 kpc, closing ~110 km/s, small tangential drift
  [ 6.6,   555,   18],
  [ 8.1,   305,   48],
  [ 8.85,  128,   78],
  [ 9.07,   18,   93],   // first passage, ~95 kpc
  [ 9.55, -172,   62],
  [10.35, -290,  -18],   // out to first apocentre
  [11.0,  -168,  -82],
  [11.45,   -8,  -40],   // second passage, ~41 kpc: bridges and tails
  [11.8,    68,   30],
  [12.0,    77,    8],   // second rebound, already shrunk by friction
  [12.3,     4,  -13],   // third passage: the disks interpenetrate
  [12.55,  -20,   -4],
  [12.8,    -7,    4],
  [13.05,    3,    1],
  [13.35,    0,    0],   // one remnant
  [20.0,     0,    0]];
export function orbitUV(a: number): [number, number] {
  const O = M31_ORBIT, n = O.length;
  let i = 0;
  while(i < n-2 && a > O[i+1][0]) i++;
  const a0 = O[i][0], a1 = O[i+1][0], h = a1 - a0;
  const s = Math.min(1, Math.max(0, (a - a0)/h)), s2 = s*s, s3 = s2*s;
  const P0 = O[i], P1 = O[i+1], Pm = O[Math.max(0,i-1)], Pp = O[Math.min(n-1,i+2)];
  const out: [number, number] = [0, 0];
  for(let k=1;k<=2;k++){
    const m0 = (P1[k]-Pm[k])/(a1-Pm[0])*h, m1 = (Pp[k]-P0[k])/(Pp[0]-a0)*h;
    out[k-1] = (2*s3-3*s2+1)*P0[k] + (s3-2*s2+s)*m0 + (-2*s3+3*s2)*P1[k] + (s3-s2)*m1;
  }
  return out;
}
// Separations are drawn at true scale out to ~83 kpc — every passage, honestly spaced —
// and log-compressed beyond, so today's 765 kpc looms at the edge of the drawn sky
// instead of 25 disk-diameters offstage. The info panel discloses the compression.
export function sepScene(kpc: number): number {
  return kpc <= 82.8 ? kpc*KPC2U
       : 9000 + 4000*Math.log(kpc/82.8)/Math.log(765/82.8);
}
// Violent relaxation builds through the close passages rather than switching on: by the
// third pass the rings are already coming apart, as they would be. Everything that stops
// being true when the disks stop being disks reads this.
export const MERGE_A0 = 11.7, MERGE_A1 = 13.4;   // Gyr: relaxation begins, remnant settled
export const mergeAt = (a: number): number => Math.min(1, Math.max(0, (a - MERGE_A0)/(MERGE_A1 - MERGE_A0)));
// The disk's accumulated rotation. The rate is the flat-curve speed, dying away as the
// merger scrambles the ordered disk into a spheroid — so this is the integral of
// V_GAL·(1 − mergeAt), linear before the merger, a parabola through it, constant after.
// An earlier build scaled the accumulated *angle* by (1 − merge) instead, which is not
// the same thing at all: with thirty laps already on the clock, that ran the whole disk
// backwards at four times its speed the moment relaxation began (galactic year ~51.7).
export const MERGE_T0 = (MERGE_A0 - AGE0)*1e9/YR_PER_SIM, MERGE_T1 = (MERGE_A1 - AGE0)*1e9/YR_PER_SIM;
export function diskSpin(ts: number): number {
  if(ts <= MERGE_T0) return ts*V_GAL;
  const w = MERGE_T1 - MERGE_T0, x = Math.min(ts, MERGE_T1) - MERGE_T0;
  return (MERGE_T0 + x - x*x/(2*w))*V_GAL;
}
