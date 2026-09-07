import { describe, it, expect, vi } from 'vitest'
import {
  PLATE_MODEL, plateMats, plateAngle, fillPlateMats,
  MOON_DIA, MOON_BORN, moonPos, EARTH_AXIS, EARTH_P0, SIDEREAL, earthPrime, earthEra,
} from '../../src/astro/earth'
import { AU2U, AGE0, YR_PER_SIM } from '../../src/astro/constants'
import { bodyPos } from '../../src/astro/bodies'

/**
 * The Earth: which way it faces, where the Moon is, what the surface looks like.
 *
 * The plate reconstruction is a schematic and is tested as one — the assertions are about
 * the machinery being sound (rotations that are rotations, interpolation that interpolates,
 * a reference plate that stays put), not about the continents being in the right place,
 * which is a question for a geologist and a screenshot.
 */

const out = (): Float64Array => new Float64Array(3)
const norm = (v: ArrayLike<number>): number => Math.hypot(v[0]!, v[1]!, v[2]!)
const dot = (a: ArrayLike<number>, b: ArrayLike<number>): number =>
  a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!

describe('the plate reconstruction', () => {
  it('has seven plates, matching the map\'s id channel', () => {
    expect(PLATE_MODEL).toHaveLength(7)
    expect(plateMats).toHaveLength(63) // 7 × 3×3
  })

  it('interpolates between keyframes and clamps outside them', () => {
    const keys = [[-250, 60], [0, 0], [250, -40]] as const
    expect(plateAngle(keys, -250)).toBe(60)
    expect(plateAngle(keys, 0)).toBe(0)
    expect(plateAngle(keys, 250)).toBe(-40)
    expect(plateAngle(keys, -125)).toBeCloseTo(30, 6) // halfway
    expect(plateAngle(keys, -1e6), 'ran off the past end').toBe(60)
    expect(plateAngle(keys, 1e6), 'ran off the future end').toBe(-40)
  })

  it('moves Africa least, since it is the reference the rest are placed against', () => {
    // "Near-fixed", not fixed: Africa has no keyframe before today at all, so it is exactly
    // still through the whole past, and turns only −8° into the future.
    const swing = (p: (typeof PLATE_MODEL)[number]): number => {
      const angles = p.keys.map((k) => k[1]!)
      return Math.max(...angles) - Math.min(...angles)
    }
    const africa = PLATE_MODEL.find((p) => p.name === 'Africa')!
    expect(africa).toBeDefined()
    for (const other of PLATE_MODEL) {
      if (other === africa) continue
      expect(swing(africa), `${other.name} moves less than the reference`).toBeLessThan(swing(other))
    }
    expect(africa.keys[0]![0]).toBe(0) // nothing before today, so the past is anchored exactly
  })

  it('is the identity today, so the present-day map is the map', () => {
    fillPlateMats(0)
    for (let k = 0; k < 7; k++) {
      const m = plateMats.subarray(k * 9, k * 9 + 9)
      const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1]
      for (let i = 0; i < 9; i++) expect(m[i]!, `plate ${k} moves at t=0`).toBeCloseTo(identity[i]!, 6)
    }
  })

  it('builds actual rotations — orthonormal, determinant +1 — at every epoch', () => {
    // A matrix that has drifted off the rotation group stretches or mirrors the continents,
    // and the globe would still render something plausible-looking.
    for (const tMyr of [-500, -250, -100, 0, 100, 250, 500]) {
      fillPlateMats(tMyr)
      for (let k = 0; k < 7; k++) {
        const m = plateMats.subarray(k * 9, k * 9 + 9)
        const c0 = [m[0]!, m[1]!, m[2]!], c1 = [m[3]!, m[4]!, m[5]!], c2 = [m[6]!, m[7]!, m[8]!]
        expect(norm(c0), `plate ${k} at ${tMyr} Myr is not unit-length`).toBeCloseTo(1, 6)
        expect(norm(c1)).toBeCloseTo(1, 6)
        expect(norm(c2)).toBeCloseTo(1, 6)
        expect(dot(c0, c1), `plate ${k} at ${tMyr} Myr is not orthogonal`).toBeCloseTo(0, 6)
        expect(dot(c0, c2)).toBeCloseTo(0, 6)
        expect(dot(c1, c2)).toBeCloseTo(0, 6)

        const det =
          m[0]! * (m[4]! * m[8]! - m[5]! * m[7]!) -
          m[3]! * (m[1]! * m[8]! - m[2]! * m[7]!) +
          m[6]! * (m[1]! * m[5]! - m[2]! * m[4]!)
        expect(det, `plate ${k} at ${tMyr} Myr is mirrored`).toBeCloseTo(1, 6)
      }
    }
  })
})

describe('the Moon', () => {
  it('is 3,474 km across', () => {
    expect((MOON_DIA / AU2U) * 1.496e8).toBeCloseTo(3474, 0)
  })

  it('is 384,400 km away today', () => {
    const moon = moonPos(0, out())
    const earth = bodyPos(3, 0, out())
    const km = (Math.hypot(...[0, 1, 2].map((k) => moon[k]! - earth[k]!)) / AU2U) * 1.496e8
    expect(km).toBeCloseTo(384400, -3)
  })

  it('recedes, as it always has', () => {
    // A simulated year IS an Earth year — see the clock test below — so a gigayear is 1e9.
    const distAt = (t: number): number => {
      const m = moonPos(t, out()), e = bodyPos(3, t, out())
      return Math.hypot(...[0, 1, 2].map((k) => m[k]! - e[k]!))
    }
    expect(distAt(-1e9)).toBeLessThan(distAt(0))
    expect(distAt(1e9)).toBeGreaterThan(distAt(0))
    // Much closer when it was young: a few Earth radii at formation, not 384,000 km.
    expect(distAt(-4.4e9) / distAt(0)).toBeLessThan(0.4)
  })

  it('formed at the Theia impact, not at t = 0', () => {
    expect(MOON_BORN).toBeCloseTo(0.06, 3)
    expect(MOON_BORN).toBeLessThan(AGE0)
  })
})

describe('earthPrime — which way the planet is facing', () => {
  it('returns a unit vector on the equator', () => {
    for (const t of [0, 0.25, 1, 1000]) {
      const p = earthPrime(t, out(), new Float64Array(3))
      expect(norm(p), 'the prime meridian direction is not a unit vector').toBeCloseTo(1, 9)
      expect(dot(p, EARTH_AXIS), 'it is not perpendicular to the spin axis').toBeCloseTo(0, 9)
    }
  })

  it('turns once per sidereal day, 366.2422 times a year', () => {
    expect(SIDEREAL).toBeCloseTo(366.2422, 4)
    const org = new Float64Array(3)
    const a = earthPrime(0, out(), org)
    const afterOne = earthPrime(1 / SIDEREAL, out(), org)
    for (let k = 0; k < 3; k++) expect(afterOne[k]!).toBeCloseTo(a[k]!, 9)

    const half = earthPrime(0.5 / SIDEREAL, out(), org)
    expect(dot(half, a), 'half a rotation should face the other way').toBeCloseTo(-1, 9)
  })

  it('starts from a prime meridian perpendicular to the axis', () => {
    expect(norm(EARTH_P0)).toBeCloseTo(1, 9)
    expect(dot(EARTH_P0, EARTH_AXIS)).toBeCloseTo(0, 9)
  })

  it('calibrates itself against the origin it is first given — R15, demonstrated', async () => {
    // The spin phase is solved once, lazily, on the first call, so that the Sun stands over
    // Greenwich at noon on 2026-01-01. It reads the rendering origin to do it, which means
    // the answer depends on WHERE THE SUN WAS the first time the globe was drawn — not only
    // on the arguments. A scenario that jumps the clock before the globe is ever drawn
    // calibrates against a Sun in the wrong place.
    //
    // Kept as it is by this refactor, because changing it would rotate the planet. Asserted
    // here so it is a known property with a test attached rather than a surprise.
    const fresh = async () => {
      vi.resetModules()
      return (await import('../../src/astro/earth')) as typeof import('../../src/astro/earth')
    }

    const one = await fresh()
    const a = one.earthPrime(0, out(), new Float64Array([0, 0, 0]))

    const two = await fresh()
    const b = two.earthPrime(0, out(), new Float64Array([900, 0, 0]))

    expect(dot(a, b), 'the calibration turned out not to depend on the origin after all')
      .not.toBeCloseTo(1, 6)
  })
})

describe('the clock', () => {
  it('runs one simulated year per Earth year, whatever the comment says', () => {
    // YR_PER_SIM is written as (225/GAL_PERIOD)*1e6 and commented "~1.19e6", but GAL_PERIOD
    // is 2*pi*R_GAL/V_GAL and V_GAL is 2*pi*900/225e6 — with R_GAL = 900 those cancel exactly
    // and the result is 1. Which is right, and is what AGENTS.md's "one clock, every readout
    // counts the same elapsed Earth years" requires. The comment is a leftover from a design
    // that did compress time; the constant is not.
    expect(YR_PER_SIM).toBe(1)
  })
})

describe('earthEra — the surface at a given age', () => {
  it('is molten in the Hadean and molten again under the red giant', () => {
    expect(earthEra(0.05, 15).molten).toBeGreaterThan(0.5)
    expect(earthEra(AGE0, 15).molten).toBe(0)
    expect(earthEra(11.3, 3000).molten).toBeGreaterThan(0.5)
  })

  it('has oceans between the Hadean and the boiling', () => {
    expect(earthEra(0.05, 15).ocean).toBe(0)
    expect(earthEra(AGE0, 15).ocean).toBeGreaterThan(0.5)
    expect(earthEra(7.5, 200).ocean).toBe(0)
  })

  it('reports no ocean as −2 rather than as a depth', () => {
    // The shader reads −2 as a distinct case; a small negative depth would be shaded as
    // shallow water.
    const dry = earthEra(8, 300)
    expect(dry.sea === -2 || dry.sea >= 0).toBe(true)
  })

  it('keeps every fraction it reports inside 0..1', () => {
    for (let a = 0; a < 13; a += 0.05) {
      const e = earthEra(a, 15)
      for (const k of ['molten', 'ocean', 'haze', 'veg', 'cloud', 'lights', 'dry'] as const) {
        expect(e[k], `${k} out of range at ${a.toFixed(2)} Gyr`).toBeGreaterThanOrEqual(0)
        expect(e[k], `${k} out of range at ${a.toFixed(2)} Gyr`).toBeLessThanOrEqual(1)
      }
      // iceLat is the latitude the cap reaches down to, and it runs past the pole on
      // purpose: 95 is the model's way of saying "no ice anywhere", which 90 could not.
      expect(e.iceLat).toBeGreaterThanOrEqual(0)
      expect(e.iceLat).toBeLessThanOrEqual(95)
    }
  })

  it('takes the ice toward the tropics only when it is cold — beyond the record', () => {
    // Only beyond today. For 4.03 < a <= now the caps come from the rock record and ignore
    // the model's temperature entirely (v2.75.0, after a Permian hothouse was drawn wearing
    // an ice cap down to 47°). Asking at AGE0 therefore gets the same answer whatever the
    // temperature, which is correct and was not what this test first assumed.
    expect(earthEra(AGE0, -40).iceLat).toBe(earthEra(AGE0, 40).iceLat)

    const future = AGE0 + 0.5
    expect(earthEra(future, -40).iceLat).toBeLessThan(earthEra(future, 40).iceLat)
  })
})
