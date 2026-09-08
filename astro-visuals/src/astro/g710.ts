import type { Vec3 } from '../core/mat4'

/**
 * Gliese 710's passage.
 *
 * A pure function of the clock, like everything else in astro/. The star moves in a straight
 * line at constant speed — which is the right model at this range and over this interval, and
 * is not a placeholder for something better.
 */

export interface G710Position { x: number; y: number; z: number; d: number }

// A K7 dwarf, presently ~62 light years off and closing at 14.4 km/s. Gaia's astrometry
// (Bailer-Jones et al. 2018) puts its closest approach 1.29 Myr from now at 0.0676 pc —
// 13,944 AU, well inside the Oort cloud, and the closest stellar encounter known either
// side of the present. It is expected to shake comets loose for a few million years
// afterwards, a modest shower rather than a bombardment.
export const G710_AT   = 1.29e6;              // years from now
export const G710_PERI = 0.2204;              // light years at perihelion
export const G710_V    = 4.804e-5;            // light years per year, from 14.4 km/s
/** Unit vector along the track, from the measured proper motion and radial velocity. */
export const G710_DIR: Vec3 = (() => {
  const v = [0.62, -0.34, 0.71], n = Math.hypot(...v)
  return [v[0]! / n, v[1]! / n, v[2]! / n]
})()
/** The perihelion offset: the component of "up" perpendicular to the track, normalised. */
export const G710_OFF: Vec3 = (() => {
  const a = [0, 1, 0], d = G710_DIR
  const dot = a[0]! * d[0] + a[1]! * d[1] + a[2]! * d[2]
  const v = [a[0]! - dot * d[0], a[1]! - dot * d[1], a[2]! - dot * d[2]]
  const n = Math.hypot(...v)
  return [v[0]! / n, v[1]! / n, v[2]! / n]
})()
export function g710(ts: number): G710Position {                        // position relative to the Sun, in light years
  const s = (ts - G710_AT)*G710_V;
  const x = G710_OFF[0]*G710_PERI + G710_DIR[0]*s;
  const y = G710_OFF[1]*G710_PERI + G710_DIR[1]*s;
  const z = G710_OFF[2]*G710_PERI + G710_DIR[2]*s;
  return { x, y, z, d: Math.hypot(x,y,z) };
}
