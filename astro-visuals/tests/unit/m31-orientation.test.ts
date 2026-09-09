import { describe, it, expect } from 'vitest'
import { M31_DIR, M31_ROT, sepScene } from '../../src/astro/merger'
import { R_GAL, V_GAL } from '../../src/astro/constants'
import { bodyPos } from '../../src/astro/bodies'

/**
 * The rotation of both galaxies, checked against the sky rather than against the scene.
 *
 * The scene frame is LEFT-handed (the l=90/north/anti-centre basis has determinant −1, and
 * SKY_MIRROR mirrors the projection back), so any orientation check made in raw scene
 * coordinates can silently read backwards. These tests therefore convert everything to the
 * right-handed EQUATORIAL frame through the same J2000 rotation the star-catalogue builder
 * uses, and only then ask the physical questions — with a self-check first: the chain must
 * reproduce M31's real RA/Dec before its verdict on anything else is worth trusting.
 *
 * They exist because of a real mistake: v3.1.0 shipped with the info panel claiming M31's
 * NORTH-EASTERN half approaches us. The constants were right — the drawn disk approaches on
 * the south-west, as HI maps (Chemin et al. 2009), planetary-nebula spectra and Gaia DR2
 * proper motions (van der Marel et al. 2019) all measure — but the prose had the limbs
 * swapped, and nothing checked the Doppler sign of a limb until this file.
 */

// equatorial -> galactic, J2000 — the same matrix as tools/build_athyg_stars.py
const R = [
  [-0.05487556, -0.87343709, -0.48383502],
  [ 0.49410943, -0.44482963,  0.74698225],
  [-0.86766615, -0.19807637,  0.45598378],
] as const

type V3 = [number, number, number]
const s2g = ([x, y, z]: V3): V3 => [-z, x, y]           // scene stores (Yg, Zg, −Xg)
const g2e = ([X, Y, Z]: V3): V3 => [
  R[0][0]*X + R[1][0]*Y + R[2][0]*Z,
  R[0][1]*X + R[1][1]*Y + R[2][1]*Z,
  R[0][2]*X + R[1][2]*Y + R[2][2]*Z,
]
const s2e = (v: V3): V3 => g2e(s2g(v))
const norm = (v: V3): V3 => { const l = Math.hypot(...v); return [v[0]/l, v[1]/l, v[2]/l] }
const cross = (a: V3, b: V3): V3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
const dot = (a: V3, b: V3): number => a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
const deg = (r: number): number => r*180/Math.PI

// the line of sight from the Sun to M31 today, and the sky basis around it
const sun: V3 = [0, 0, R_GAL]
const m31: V3 = [M31_DIR[0]*sepScene(765), M31_DIR[1]*sepScene(765), M31_DIR[2]*sepScene(765)]
const u = norm(s2e([m31[0]-sun[0], m31[1]-sun[1], m31[2]-sun[2]]))
const east = norm(cross([0, 0, 1], u))
const north = norm(cross(u, east))
const paOf = (v: V3): number => (deg(Math.atan2(dot(v, east), dot(v, north))) + 360) % 360

// M31's disk axes as drawn (column-major upload: the first three floats are local x)
const exE = s2e([M31_ROT[0]!, M31_ROT[1]!, M31_ROT[2]!])
const eyE = s2e([M31_ROT[3]!, M31_ROT[4]!, M31_ROT[5]!])
const ezE = s2e([M31_ROT[6]!, M31_ROT[7]!, M31_ROT[8]!])

/** rim point and its velocity at disk azimuth ph — the shader's sense: positive spin takes z to x */
const rim = (ph: number): { p: V3; v: V3 } => ({
  p: [exE[0]*Math.sin(ph)+ezE[0]*Math.cos(ph), exE[1]*Math.sin(ph)+ezE[1]*Math.cos(ph), exE[2]*Math.sin(ph)+ezE[2]*Math.cos(ph)],
  v: [exE[0]*Math.cos(ph)-ezE[0]*Math.sin(ph), exE[1]*Math.cos(ph)-ezE[1]*Math.sin(ph), exE[2]*Math.cos(ph)-ezE[2]*Math.sin(ph)],
})

/** the rim azimuth whose SKY position lies nearest position angle pa */
const phAtPA = (pa: number): number => {
  let best = 0, bd = 9e9
  for (let k = 0; k < 1440; k++) {
    const ph = k/1440*2*Math.PI
    const { p } = rim(ph)
    const sky: V3 = [p[0]-dot(p,u)*u[0], p[1]-dot(p,u)*u[1], p[2]-dot(p,u)*u[2]]
    const d = Math.abs(((paOf(sky) - pa + 540) % 360) - 180)
    if (d < bd) { bd = d; best = ph }
  }
  return best
}

describe("Andromeda's orientation and spin, re-derived from the shipped constants", () => {
  it('self-check: the chain reproduces M31\'s real position on the sky', () => {
    // real: RA 10.68°, Dec +41.27°. The compressed scene distance shifts the parallax a
    // few degrees; a sign error anywhere in the chain would miss by tens.
    const ra = (deg(Math.atan2(u[1], u[0])) + 360) % 360
    expect(Math.abs(ra - 10.68)).toBeLessThan(8)
    expect(Math.abs(deg(Math.asin(u[2])) - 41.27)).toBeLessThan(4)
  })

  it('shows the measured geometry: major axis PA ~38°, inclination ~77°, near side NW', () => {
    const nrm = norm(eyE)
    expect(Math.abs(deg(Math.acos(Math.abs(dot(nrm, u)))) - 77)).toBeLessThan(4)
    const paMaj = paOf(norm(cross(nrm, u))) % 180
    expect(Math.abs(paMaj - 38)).toBeLessThan(5)
    // the rim point that comes nearest to us marks the near side; NW is PA 270°..350°
    let nearPA = 0, best = -9e9
    for (let k = 0; k < 1440; k++) {
      const { p } = rim(k/1440*2*Math.PI)
      if (-dot(p, u) > best) {
        best = -dot(p, u)
        const sky: V3 = [p[0]-dot(p,u)*u[0], p[1]-dot(p,u)*u[1], p[2]-dot(p,u)*u[2]]
        nearPA = paOf(sky)
      }
    }
    expect(nearPA).toBeGreaterThan(270)
    expect(nearPA).toBeLessThan(350)
  })

  it('approaches on the SOUTH-WEST limb and recedes on the north-east, as measured', () => {
    // HI (Chemin et al. 2009), planetary nebulae, and Gaia DR2 all agree on this sign.
    // losV > 0 is receding: u points from us toward M31.
    expect(dot(rim(phAtPA(38)).v, u), 'the NE limb must recede').toBeGreaterThan(0.5)
    expect(dot(rim(phAtPA(218)).v, u), 'the SW limb must approach').toBeLessThan(-0.5)
  })

  it('spins about the published pole, leaning toward us: counterclockwise face-on from Earth', () => {
    // spin pole ≈ galactic (242°, −30°); its line-of-sight component is negative, which is
    // exactly why Gaia sees the on-sky rotation counterclockwise.
    const { p, v } = rim(0)
    const L = norm(cross(p, v))
    const Lg: V3 = [dot(L, [...R[0]] as V3), dot(L, [...R[1]] as V3), dot(L, [...R[2]] as V3)]
    expect(Math.abs(((deg(Math.atan2(Lg[1], Lg[0])) + 360) % 360) - 242)).toBeLessThan(3)
    expect(Math.abs(deg(Math.asin(Lg[2])) - (-30))).toBeLessThan(3)
    expect(dot(L, u), 'her spin axis must lean toward us').toBeLessThan(0)
  })
})

describe("the Sun's drawn orbit, against the real sky", () => {
  it('moves toward galactic l=90 — toward Cygnus — like the real Sun', () => {
    // The catalogue builder proves scene +x IS l=90 (real stars, real J2000 rotation), and
    // the real Sun's orbital motion toward Cygnus is measurement, not convention. Positions
    // and velocities are polar vectors, so this check is immune to the mirror.
    const a = new Float64Array(3), b = new Float64Array(3)
    bodyPos(0, 0, a); bodyPos(0, 1e6, b)
    const gal = s2g([b[0]-a[0], b[1]-a[1], b[2]-a[2]] as V3)
    const l = (deg(Math.atan2(gal[1], gal[0])) + 360) % 360
    expect(Math.abs(l - 90), `the Sun heads toward l=${l.toFixed(1)}, not l=90`).toBeLessThan(8)
    // and at the real speed: V_GAL scene units per year
    expect(Math.hypot(gal[0], gal[1], gal[2])/1e6).toBeCloseTo(V_GAL, 5)
  })
})
