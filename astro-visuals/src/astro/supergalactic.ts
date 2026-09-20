import type { Vec3 } from '../core/mat4'

/**
 * The supergalactic frame: the plane the nearby Universe's galaxies lie in — the Virgo
 * cluster, the Local Group, the Ursa Major and Coma clouds all sit near it, which is why de
 * Vaucouleurs named it. The classic supercluster chart stands its cylinder on this plane.
 *
 * Definition (de Vaucouleurs 1976; IAU): the supergalactic north pole is at galactic
 * l = 47.37°, b = +6.32°, and the zero of supergalactic longitude is at l = 137.37°, b = 0°.
 * Everything here derives from those two directions: no other numbers are quoted.
 */
const SG_POLE_L = 47.37, SG_POLE_B = 6.32, SG_ORIGIN_L = 137.37, SG_ORIGIN_B = 0

const galVec = (lDeg: number, bDeg: number): Vec3 => {
  const l = lDeg*Math.PI/180, b = bDeg*Math.PI/180
  return [Math.cos(b)*Math.cos(l), Math.cos(b)*Math.sin(l), Math.sin(b)]
}
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
const dot = (a: Vec3, b: Vec3): number => a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

/** the frame's axes in galactic coordinates: X toward SGL = 0, Z the pole, Y = Z × X */
export const SG_X: Vec3 = galVec(SG_ORIGIN_L, SG_ORIGIN_B)
export const SG_Z: Vec3 = galVec(SG_POLE_L, SG_POLE_B)
export const SG_Y: Vec3 = cross(SG_Z, SG_X)

/** galactic (x toward the Centre, y toward l=90°, z north) -> scene (l=90° on +x, north +y, Centre −z) */
const galToScene = (g: Vec3): Vec3 => [g[1], g[2], -g[0]]

/** the supergalactic axes as scene directions: the chart's cylinder stands on SG_Z */
export const SG_SCENE = { X: galToScene(SG_X), Y: galToScene(SG_Y), Z: galToScene(SG_Z) }

/** supergalactic longitude and latitude, degrees, of a galactic direction */
export function galToSG(lDeg: number, bDeg: number): { sgl: number; sgb: number } {
  const v = galVec(lDeg, bDeg)
  const x = dot(v, SG_X), y = dot(v, SG_Y), z = dot(v, SG_Z)
  return { sgl: (Math.atan2(y, x)*180/Math.PI + 360) % 360, sgb: Math.asin(Math.max(-1, Math.min(1, z)))*180/Math.PI }
}

/** a supergalactic direction as a scene unit vector */
export function sgDir(sglDeg: number, sgbDeg: number): Vec3 {
  const l = sglDeg*Math.PI/180, b = sgbDeg*Math.PI/180
  const cx = Math.cos(b)*Math.cos(l), cy = Math.cos(b)*Math.sin(l), cz = Math.sin(b)
  return galToScene([SG_X[0]*cx + SG_Y[0]*cy + SG_Z[0]*cz, SG_X[1]*cx + SG_Y[1]*cy + SG_Z[1]*cz, SG_X[2]*cx + SG_Y[2]*cy + SG_Z[2]*cz])
}
