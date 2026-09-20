import type { Vec3 } from '../core/mat4'
import { AU2U, R_GAL, V_GAL } from './constants'
import { SSTARS, SGRA_MASS_MSUN, SGRA_R0_PC, SGRA_RA, SGRA_DEC, BH1, type SStar } from './gc-data'

/**
 * The Galactic Centre, and the nearest black hole: where the S-stars are round Sagittarius A*
 * and where Gaia BH1's star is round its dark companion, as pure functions of the clock.
 *
 * Both are Keplerian orbits published in the observer's frame — the plane of the sky and
 * the line of sight from Earth — so the first job is to say what that frame is in scene
 * coordinates. `skyBasis` derives it rather than quoting it: the tangent directions of
 * celestial north and east at a given RA/Dec, turned into galactic coordinates by the same
 * J2000 matrix `tools/build_athyg_stars.py` places the real stars with, and then into the
 * scene's own left-handed frame (l=90° on +x, north on +y, the Centre on −z). Every sky
 * direction in the piece goes through that one mapping, which is what keeps a drawn orbit
 * consistent with the drawn sky it sits in.
 *
 * The depth convention is pinned to a measurement. Astrometry alone cannot tell an orbit from
 * its mirror image about the sky plane; the radial velocity can. With z counted AWAY from the
 * observer as `r·sin(ω+ν)·sin i`, S2 recedes at up to +4,000 km/s in the months before its
 * 2018 pericentre and approaches at −1,900 afterwards, which is the curve GRAVITY measured
 * (2018, A&A 615, L15, Fig. 2) — the unit test holds it there.
 *
 * Nothing here relativistic: the Schwarzschild precession of S2 (12′ per orbit, GRAVITY 2020)
 * is a fraction of a degree per lap and is left out and disclosed, not faked.
 */

/** decimal year on the piece's clock: simT counts Earth years from 2026.0 */
export const yearOf = (simT: number): number => 2026 + simT

// equatorial (J2000) -> galactic, the rotation the star builders use
const EQ2GAL = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [ 0.4941094279, -0.4448296300,  0.7469822445],
  [-0.8676661490, -0.1980763734,  0.4559837762],
] as const

/** galactic (x toward the Centre, y toward l=90°, z north) -> scene (l=90° on +x, north +y, Centre −z) */
const galToScene = (g: readonly number[]): Vec3 => [g[1], g[2], -g[0]]

export interface SkyBasis {
  /** celestial north's tangent direction at that point, scene units */
  N: Vec3
  /** east's */
  E: Vec3
  /** the line of sight from the Sun, away from the observer */
  Z: Vec3
}

/** The observer's frame at a sky position, in scene coordinates. */
export function skyBasis(raDeg: number, decDeg: number): SkyBasis {
  const a = raDeg*Math.PI/180, d = decDeg*Math.PI/180
  const sa = Math.sin(a), ca = Math.cos(a), sd = Math.sin(d), cd = Math.cos(d)
  const eq = {
    Z: [cd*ca, cd*sa, sd],
    N: [-sd*ca, -sd*sa, cd],
    E: [-sa, ca, 0],
  }
  const toScene = (v: readonly number[]): Vec3 =>
    galToScene(EQ2GAL.map(row => row[0]*v[0] + row[1]*v[1] + row[2]*v[2]))
  return { N: toScene(eq.N), E: toScene(eq.E), Z: toScene(eq.Z) }
}

/** Kepler's equation, solved by Newton's method from a starting point that also holds at e ≈ 0.98. */
export function eccentricAnomaly(M: number, e: number): number {
  let m = M % (2*Math.PI); if(m > Math.PI) m -= 2*Math.PI; if(m < -Math.PI) m += 2*Math.PI
  let E = e > 0.8 ? (m < 0 ? -Math.PI : Math.PI) : m + e*Math.sin(m)
  for(let k=0;k<50;k++){
    const f = E - e*Math.sin(E) - m, fp = 1 - e*Math.cos(E)
    const dE = f/fp; E -= dE
    if(Math.abs(dE) < 1e-13) break
  }
  return E
}

/** Angles of an orbit, precomputed: cos/sin of Ω, ω and i, plus the sky basis it sits in. */
interface OrbitFrame { cO: number; sO: number; ci: number; si: number; w: number; basis: SkyBasis }
const orbitFrame = (i: number, om: number, w: number, basis: SkyBasis): OrbitFrame => ({
  cO: Math.cos(om*Math.PI/180), sO: Math.sin(om*Math.PI/180),
  ci: Math.cos(i*Math.PI/180), si: Math.sin(i*Math.PI/180), w: w*Math.PI/180, basis,
})

/**
 * The relative position at eccentric anomaly E, in scene units, for an orbit of semi-major
 * axis `aU` (scene units) placed in the given frame. Sky frame first — north, east, and depth
 * away from the observer — then into the scene through the basis.
 */
function orbitPoint(aU: number, e: number, E: number, f: OrbitFrame, out: Float64Array): Float64Array {
  const r = aU*(1 - e*Math.cos(E))
  const nu = 2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2), Math.sqrt(1-e)*Math.cos(E/2))
  const u = f.w + nu, cu = Math.cos(u), su = Math.sin(u)
  const xN = r*(f.cO*cu - f.sO*su*f.ci)
  const yE = r*(f.sO*cu + f.cO*su*f.ci)
  const zA = r*su*f.si
  const { N, E: Ev, Z } = f.basis
  out[0] = xN*N[0] + yE*Ev[0] + zA*Z[0]
  out[1] = xN*N[1] + yE*Ev[1] + zA*Z[1]
  out[2] = xN*N[2] + yE*Ev[2] + zA*Z[2]
  return out
}

// ---------------------------------------------------------------------------------------
// Sagittarius A*

/** the Schwarzschild radius of one solar mass, km: 2GM☉/c² */
const RS_SUN_KM = 2.9532
const AU_KM = 1.495978707e8
/** an arcsecond at one parsec is an astronomical unit: mas at R0 → AU */
const masToAU = (mas: number): number => mas/1000*SGRA_R0_PC

export const SGRA = {
  massMsun: SGRA_MASS_MSUN,
  /** Schwarzschild radius, AU and scene units */
  rsAU: RS_SUN_KM*SGRA_MASS_MSUN/AU_KM,
  rsU: RS_SUN_KM*SGRA_MASS_MSUN/AU_KM*AU2U,
  /** the shadow's radius in Schwarzschild radii: 3√3/2, the photon capture radius */
  shadowRs: 3*Math.sqrt(3)/2,
  /** the modelled accretion flow's inclination to the line of sight, degrees: inside the EHT's
   *  bound of 50°, and tilted enough for the bending of the far side to show — see the docs */
  discIncDeg: 45,
  basis: skyBasis(SGRA_RA, SGRA_DEC),
}

/** The shadow's angular diameter as seen from Earth, microarcseconds — the EHT's number to compare with. */
export const sgraShadowUas = (): number => 2*SGRA.shadowRs*SGRA.rsAU/SGRA_R0_PC*1e6

const sFrames = SSTARS.map(s => orbitFrame(s.i, s.om, s.w, SGRA.basis))
const sAU = SSTARS.map(s => masToAU(s.aMas))

/** the star's semi-major axis in AU and scene units */
export const sstarA = (k: number): { au: number; u: number } => ({ au: sAU[k], u: sAU[k]*AU2U })

/** Where S-star `k` is at decimal year `year`, relative to Sagittarius A*, scene units. */
export function sstarPos(k: number, year: number, out: Float64Array): Float64Array {
  const s = SSTARS[k]
  const E = eccentricAnomaly(2*Math.PI*(year - s.t0)/s.P, s.e)
  return orbitPoint(sAU[k]*AU2U, s.e, E, sFrames[k], out)
}

/** A point on S-star `k`'s orbit at eccentric anomaly E — uniform in E puts the samples where the curve bends. */
export function sstarOrbitPoint(k: number, E: number, out: Float64Array): Float64Array {
  return orbitPoint(sAU[k]*AU2U, SSTARS[k].e, E, sFrames[k], out)
}

/** The star's radial velocity, km/s, positive receding: K·[cos(ω+ν) + e·cos ω]. */
export function sstarRV(k: number, year: number): number {
  const s = SSTARS[k], f = sFrames[k]
  const E = eccentricAnomaly(2*Math.PI*(year - s.t0)/s.P, s.e)
  const nu = 2*Math.atan2(Math.sqrt(1+s.e)*Math.sin(E/2), Math.sqrt(1-s.e)*Math.cos(E/2))
  const K = 2*Math.PI*sAU[k]*f.si/(s.P*Math.sqrt(1 - s.e*s.e))      // AU per year
  return K*(Math.cos(f.w + nu) + s.e*Math.cos(f.w))*AU_KM/3.15576e7
}

export { SSTARS, type SStar }

// ---------------------------------------------------------------------------------------
// Gaia BH1

const LY_PER_PC = 3.26156
export const BH1_INFO = {
  ...BH1,
  distLy: BH1.distPc*LY_PER_PC,
  /** the black hole's Schwarzschild radius, km and scene units */
  rsKm: RS_SUN_KM*BH1.massBH,
  rsU: RS_SUN_KM*BH1.massBH/AU_KM*AU2U,
  Pyr: BH1.Pdays/365.25,
  /** the two bodies' shares of the relative orbit: each swings round the barycentre */
  fStar: BH1.massBH/(BH1.massBH + BH1.massStar),
  fBH: BH1.massStar/(BH1.massBH + BH1.massStar),
  basis: skyBasis(BH1.ra, BH1.dec),
}
const bh1Frame = orbitFrame(BH1.i, BH1.om, BH1.w, BH1_INFO.basis)

/**
 * The black hole itself relative to the Sun at scene time `simT`, scene units, in doubles: the
 * system's barycentre 480 pc along the line of sight, less the hole's own small swing about
 * it. The local sky rides the Sun's orbital frame, so the vector turns with the Sun's phase
 * exactly as the Gaia bubble does in the shader. The hole is the frame everything of the
 * system is drawn in — its star's orbit round it IS the relative orbit — because the view
 * that shows the hole's 146-km shadow is thirty thousand frames wide of the barycentre.
 */
export function bh1Centre(simT: number, out: Float64Array): Float64Array {
  const d = BH1.distPc*LY_PER_PC/30
  const Z = BH1_INFO.basis.Z
  bh1Relative(yearOf(simT), tmpRel)
  const f = -BH1_INFO.fBH
  const x = Z[0]*d + tmpRel[0]*f, y = Z[1]*d + tmpRel[1]*f, z = Z[2]*d + tmpRel[2]*f
  const th = simT*V_GAL/R_GAL, c = Math.cos(th), s = Math.sin(th)
  out[0] = x*c + z*s; out[1] = y; out[2] = z*c - x*s
  return out
}
const tmpRel = new Float64Array(3)

/** Star minus black hole, scene units, at decimal year `year`. */
export function bh1Relative(year: number, out: Float64Array): Float64Array {
  const E = eccentricAnomaly(2*Math.PI*(year - BH1.t0)/BH1_INFO.Pyr, BH1.e)
  return orbitPoint(BH1.aAU*AU2U, BH1.e, E, bh1Frame, out)
}

/** A point on the relative orbit at eccentric anomaly E. */
export function bh1OrbitPoint(E: number, out: Float64Array): Float64Array {
  return orbitPoint(BH1.aAU*AU2U, BH1.e, E, bh1Frame, out)
}
