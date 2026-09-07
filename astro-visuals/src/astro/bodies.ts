/**
 * The Sun, the planets, the dwarfs, the hypothetical ninth — and where each of them is.
 *
 * bodyPos is the only position function in the piece, and everything drawn in the solar
 * system goes through it: the sprites, the orbit rings, both kinds of trail. It writes into a
 * caller-supplied Float64Array rather than allocating, because at a million years a second
 * the trails resample thousands of positions per frame.
 *
 * Doubles, not floats, deliberately. The origin stays at the Sun and Earth is 1 AU out, where
 * float32 rounds a position to about 9 km — under a pixel on a 6,371 km globe at any zoom the
 * view uses, but only because the arithmetic is done in double first.
 */
import type { Vec3 } from '../core/mat4'
import { TILT, E1, E2, AU2U, REAL_MODE } from './constants'
import { sunR, sunPhase } from './sun'

// name, real period (yr), display orbit radius, sprite size, color
export const BODIES = [ // name, period yr, display radius, sprite size, color, real semi-major axis (AU), real radius (km)
  ['Sun',     0,      0,   5.2, [1.0,0.86,0.55], 0, 696000],
  ['Mercury', 0.241,  6.0, 0.85,[0.66,0.64,0.62], 0.387, 2440],
  ['Venus',   0.615,  8.5, 1.15,[0.93,0.82,0.58], 0.723, 6052],
  ['Earth',   1.000, 11.0, 1.2, [0.35,0.58,1.0],  1.000, 6371],
  ['Mars',    1.881, 14.0, 1.0, [0.92,0.44,0.26], 1.524, 3390],
  ['Jupiter',11.862, 20.0, 2.6, [0.85,0.66,0.42], 5.203, 69911],
  ['Saturn', 29.457, 26.0, 2.3, [0.90,0.79,0.53], 9.537, 58232],
  ['Uranus', 84.02,  32.5, 1.7, [0.52,0.83,0.86], 19.19, 25362],
  ['Neptune',164.8,  38.5, 1.7, [0.30,0.42,0.90], 30.07, 24622],
  // IAU dwarf planets (drawn smaller; note their strongly inclined orbits)
  ['Ceres',    4.60, 16.0, 0.55,[0.62,0.60,0.56], 2.766, 470],
  ['Pluto',  248.0,  43.0, 0.60,[0.80,0.69,0.58], 39.48, 1188],
  ['Haumea', 285.0,  44.5, 0.50,[0.82,0.82,0.85], 43.1, 816],
  ['Makemake',306.0, 46.0, 0.50,[0.76,0.56,0.43], 45.4, 715],
  ['Eris',   558.0,  52.5, 0.55,[0.83,0.83,0.90], 67.7, 1163],
  // Hypothetical, and drawn as such: the orbit that would explain the clustering of
  // the far Kuiper objects. ~400 AU and ~6 Earth masses, after Brown & Batygin.
  ['Planet 9?', 8000.0, 78.0, 0.62,[0.36,0.66,0.77], 400.0, 19100],
];
export const NB = BODIES.length;
export const N_PLANETS = 9;         // Sun + 8 planets; dwarfs follow
export const I_P9 = NB - 1;         // the hypothetical one, last in the table
export const PHASE = BODIES.map((_,i)=> i*2.399963); // golden-angle spread

// per-body orbital plane: planets share the ecliptic; dwarfs are tilted [inclination°, node°]
export const EN: Vec3 = [0, Math.cos(TILT), Math.sin(TILT)]; // ecliptic normal
export const DTILT = { Ceres:[10.6,80], Pluto:[17.2,110], Haumea:[28.2,122], Makemake:[29.0,79], Eris:[44.0,36],
  // the candidate's orbit is tilted too, by about 16 degrees in the current estimates
  'Planet 9?':[16.0,95] };
export const BU: Vec3[]=[], BV: Vec3[]=[];
BODIES.forEach((b,i)=>{
  if(i<N_PLANETS){ BU.push(E1); BV.push(E2); return; }
  const [inc,node]=DTILT[b[0] as keyof typeof DTILT];
  const ci=Math.cos(inc*Math.PI/180), si=Math.sin(inc*Math.PI/180);
  const cn=Math.cos(node*Math.PI/180), sn=Math.sin(node*Math.PI/180);
  const u: Vec3=[cn*E1[0]+sn*E2[0], cn*E1[1]+sn*E2[1], cn*E1[2]+sn*E2[2]];
  const w=[-sn*E1[0]+cn*E2[0], -sn*E1[1]+cn*E2[1], -sn*E1[2]+cn*E2[2]];
  BU.push(u); BV.push([w[0]*ci+EN[0]*si, w[1]*ci+EN[1]*si, w[2]*ci+EN[2]*si] as Vec3);
});

// Sun's vertical bob through the disk plane: real period ~90 Myr, amplitude ~±250 ly.
// Amplitude shown ~3× exaggerated so it reads at this zoom.
export const WOB_A = 24, WOB_T = 90e6; // scene units, and the real ~90 Myr vertical period

export const tmp = new Float64Array(3), tmpSun = new Float64Array(3), earthW = new Float64Array(3);
export function bodyPos(i: number, t: number, out: Float64Array): Float64Array {
  const phi = sunPhase(t);                       // galactic anomaly, slowing as R grows
  const R = sunR(t);                             // constant until the merger flings it out
  const sx = R*Math.sin(phi), sz = R*Math.cos(phi);
  const sy = (REAL_MODE?8.3:WOB_A)*Math.sin(2*Math.PI*t/WOB_T + 2.1);
  if(i===0){ out[0]=sx; out[1]=sy; out[2]=sz; return out; }
  const b = BODIES[i];
  const th = 2*Math.PI*t/(b[1] as number) + PHASE[i];
  const rr = REAL_MODE ? (b[5] as number)*AU2U : (b[2] as number); // true proportions: the whole system is sub-pixel
  const c = Math.cos(th)*rr, s = Math.sin(th)*rr;
  const u=BU[i], v=BV[i];
  out[0] = sx + c*u[0] + s*v[0];
  out[1] = sy + c*u[1] + s*v[1];
  out[2] = sz + c*u[2] + s*v[2];
  return out;
}
