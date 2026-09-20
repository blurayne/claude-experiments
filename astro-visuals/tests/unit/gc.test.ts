import { describe, it, expect } from 'vitest'
import {
  SSTARS, SGRA, BH1_INFO, skyBasis, eccentricAnomaly, sstarPos, sstarA, sstarRV, sgraShadowUas,
  bh1Centre, bh1Relative, yearOf,
} from '../../src/astro/gc'
import { AU2U } from '../../src/astro/constants'

/**
 * The Galactic Centre, checked against the measurements.
 *
 * GRAVITY 2020 (A&A 636, L5) for S2's orbit and 2022 (A&A 657, L12) for the black hole's
 * mass and distance; Gillessen et al. 2017 (ApJ 837, 30) for the other S-stars; the Event
 * Horizon Telescope 2022 (ApJL 930, L12) for the shadow; Reid & Brunthaler 2004 for the
 * orientation of the Galactic plane on the sky at Sgr A*; El-Badry et al. 2023 (MNRAS 518,
 * 1057) for Gaia BH1.
 */

const S2 = SSTARS.findIndex(s => s.name === 'S2')
const dot = (a: readonly number[], b: readonly number[]): number => a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
const len = (a: ArrayLike<number>): number => Math.hypot(a[0], a[1], a[2])
const tmp = new Float64Array(3)

describe('the observer frame at a sky position', () => {
  it('is orthonormal, and its line of sight is the direction from the Sun', () => {
    for (const [ra, dec] of [[266.4168, -29.0078], [262.1712, -0.5811], [0, 0], [90, 60]]) {
      const b = skyBasis(ra, dec)
      // to the ten digits the J2000 rotation is quoted to
      for (const v of [b.N, b.E, b.Z]) expect(len(v)).toBeCloseTo(1, 9)
      expect(dot(b.N, b.E)).toBeCloseTo(0, 9)
      expect(dot(b.N, b.Z)).toBeCloseTo(0, 9)
      expect(dot(b.E, b.Z)).toBeCloseTo(0, 9)
    }
    // the Galactic Centre lies on −z from the Sun, north is +y
    const gc = skyBasis(266.4168, -29.0078)
    expect(gc.Z[2]).toBeCloseTo(-1, 4)
    expect(Math.abs(gc.Z[0])).toBeLessThan(2e-3)
  })

  it('puts the Galactic plane at position angle 31.4° east of north at Sgr A*', () => {
    // Reid & Brunthaler 2004: the plane's PA at Sgr A* is 31.40°. Galactic north (+y in the
    // scene) is 90° from it, toward the north-west of the sky.
    const b = SGRA.basis
    const north: readonly number[] = [0, 1, 0]
    const paNorth = Math.atan2(dot(north, b.E), dot(north, b.N))*180/Math.PI
    expect(paNorth).toBeCloseTo(31.40 - 90, 0)
    expect(Math.abs(paNorth - (31.40 - 90))).toBeLessThan(0.3)
  })
})

describe("Kepler's equation", () => {
  it('is solved to machine precision, at the eccentricity of S14', () => {
    for (const e of [0, 0.3, 0.8846, 0.9761, 0.995]) {
      for (let k = 0; k < 40; k++) {
        const M = (k/40 - 0.5)*4*Math.PI
        const E = eccentricAnomaly(M, e)
        // compared on the circle, so M = ±π is not a disagreement about the wrap
        const d = E - e*Math.sin(E) - M
        expect(Math.abs(Math.sin(d/2))).toBeLessThan(1e-10)
      }
    }
  })
})

describe('Sagittarius A*', () => {
  it('has the Schwarzschild radius of 4.3 million Suns: 0.085 AU', () => {
    expect(SGRA.rsAU).toBeCloseTo(0.0848, 3)
    expect(SGRA.rsU/AU2U).toBeCloseTo(SGRA.rsAU, 12)
  })

  it("casts a shadow the size the Event Horizon Telescope measured", () => {
    // 51.8 ± 2.3 μas across; a Schwarzschild shadow at this mass and distance is ~53
    expect(sgraShadowUas()).toBeGreaterThan(51.8 - 2.3)
    expect(sgraShadowUas()).toBeLessThan(51.8 + 2.3)
  })
})

describe('S2', () => {
  it('has a 16-year period and swings in to ~120 AU', () => {
    expect(SSTARS[S2].P).toBeCloseTo(16.05, 1)
    expect(sstarA(S2).au).toBeCloseTo(1035, -1)                 // 125 mas at 8.28 kpc
    const rp = sstarA(S2).au*(1 - SSTARS[S2].e)
    expect(rp).toBeCloseTo(119, 0)
    expect(rp/SGRA.rsAU).toBeCloseTo(1400, -2)                  // ~1,400 Schwarzschild radii
  })

  it('is closest at its 2018.38 pericentre, in the scene as in the papers', () => {
    const t0 = SSTARS[S2].t0
    const at = len(sstarPos(S2, t0, tmp))/AU2U
    expect(at).toBeCloseTo(sstarA(S2).au*(1 - SSTARS[S2].e), 6)
    expect(len(sstarPos(S2, t0 - 0.5, tmp))/AU2U).toBeGreaterThan(at)
    expect(len(sstarPos(S2, t0 + 0.5, tmp))/AU2U).toBeGreaterThan(at)
    // half a period later it is at apocentre, a(1+e)
    expect(len(sstarPos(S2, t0 + SSTARS[S2].P/2, tmp))/AU2U).toBeCloseTo(sstarA(S2).au*(1 + SSTARS[S2].e), 3)
    // and a period later back where it started
    const a = sstarPos(S2, 2010, new Float64Array(3)), b = sstarPos(S2, 2010 + SSTARS[S2].P, new Float64Array(3))
    for (let k = 0; k < 3; k++) expect(b[k]).toBeCloseTo(a[k], 12)
  })

  it('recedes before the 2018 pericentre and approaches after it — the measured curve', () => {
    // GRAVITY 2018 (A&A 615, L15), Fig. 2: the radial velocity climbs to about +4,000 km/s in
    // the months before pericentre and falls to about −2,000 afterwards. This is what pins the
    // depth sign of every orbit drawn: astrometry alone cannot tell an orbit from its mirror.
    let vmax = -Infinity, vmin = Infinity
    for (let y = 2017.0; y < 2019.5; y += 0.01) { const v = sstarRV(S2, y); vmax = Math.max(vmax, v); vmin = Math.min(vmin, v) }
    expect(vmax).toBeGreaterThan(3800); expect(vmax).toBeLessThan(4200)
    expect(vmin).toBeLessThan(-1700); expect(vmin).toBeGreaterThan(-2100)
    expect(sstarRV(S2, 2018.2)).toBeGreaterThan(0)
    expect(sstarRV(S2, 2018.6)).toBeLessThan(0)
  })
})

describe('the other S-stars', () => {
  it('all sit inside a third of a light year and all come back to where they were', () => {
    for (let k = 0; k < SSTARS.length; k++) {
      const s = SSTARS[k]
      const apo = sstarA(k).au*(1 + s.e)          // S54 reaches the furthest, ~18,800 AU
      expect(apo).toBeLessThan(63241/3)
      const a = sstarPos(k, 2026, new Float64Array(3)), b = sstarPos(k, 2026 + s.P, new Float64Array(3))
      for (let j = 0; j < 3; j++) expect(b[j]).toBeCloseTo(a[j], 10)
      expect(len(sstarPos(k, s.t0, tmp))/AU2U).toBeCloseTo(sstarA(k).au*(1 - s.e), 6)
    }
  })
  it('run shortest period first', () => {
    for (let k = 1; k < SSTARS.length; k++) expect(SSTARS[k].P).toBeGreaterThanOrEqual(SSTARS[k-1].P)
  })
})

describe('Gaia BH1', () => {
  it('is 1,575 light years away toward Ophiuchus, 18° above the plane', () => {
    expect(BH1_INFO.distLy).toBeCloseTo(483*3.26156, 0)   // Gaia DR3's parallax, as VizieR gives it
    // the frame is the hole, which swings a tenth of an AU (2e-6 ly) about the barycentre
    const c = bh1Centre(0, tmp)
    expect(len(c)*30).toBeCloseTo(BH1_INFO.distLy, 4)
    // galactic latitude from the scene: north is +y
    expect(Math.asin(c[1]/len(c))*180/Math.PI).toBeCloseTo(18.05, 1)
    // longitude 22.6°: measured from the Centre (−z) toward l=90° (+x)
    expect(Math.atan2(c[0], -c[2])*180/Math.PI).toBeCloseTo(22.63, 1)
  })

  it('rides the Sun round the Galaxy, at a fixed distance', () => {
    for (const t of [0, 1e6, 5e7, -3e7]) expect(len(bh1Centre(t, tmp))*30).toBeCloseTo(BH1_INFO.distLy, 4)
  })

  it('has a 185.6-day orbit between 0.77 and 2.03 AU', () => {
    expect(BH1_INFO.Pyr).toBeCloseTo(0.5081, 3)
    let rmin = Infinity, rmax = 0
    for (let y = 2026; y < 2026 + BH1_INFO.Pyr; y += 0.001) {
      const r = len(bh1Relative(y, tmp))/AU2U; rmin = Math.min(rmin, r); rmax = Math.max(rmax, r)
    }
    expect(rmin).toBeCloseTo(1.40*(1 - 0.451), 2)
    expect(rmax).toBeCloseTo(1.40*(1 + 0.451), 2)
  })

  it('shares the orbit by mass: the star swings ten times further than the hole', () => {
    expect(BH1_INFO.fStar/BH1_INFO.fBH).toBeCloseTo(9.62/0.93, 6)
    expect(BH1_INFO.fStar + BH1_INFO.fBH).toBeCloseTo(1, 12)
    expect(BH1_INFO.rsKm).toBeCloseTo(28.4, 0)
  })
})

describe('the clock', () => {
  it('reads 2026.0 at simT = 0, like the HUD', () => { expect(yearOf(0)).toBe(2026); expect(yearOf(-7.621)).toBeCloseTo(2018.379, 9) })
})
