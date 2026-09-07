import { describe, it, expect } from 'vitest'
import { BODIES, NB, N_PLANETS, I_P9, PHASE, BU, BV, bodyPos, WOB_T } from '../../src/astro/bodies'
import { AU2U, R_GAL, TILT } from '../../src/astro/constants'
import { sunR, sunPhase } from '../../src/astro/sun'

/**
 * Where the bodies are.
 *
 * bodyPos is the only position function in the piece — the sprites, the orbit rings and both
 * kinds of trail all go through it — so an error here is an error in everything drawn inside
 * the solar system at once. It is also the function most exposed to the scale the piece works
 * at: the origin is the Sun, Earth is 1 AU out, and the whole system is a sub-pixel speck
 * against a galaxy 900 units across.
 */

const out = (): Float64Array => new Float64Array(3)
const at = (i: number, t: number): number[] => [...bodyPos(i, t, out())]
const dist = (a: number[], b: number[]): number =>
  Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!)

const EARTH = BODIES.findIndex((b) => b[0] === 'Earth')
const NEPTUNE = BODIES.findIndex((b) => b[0] === 'Neptune')

describe('the table', () => {
  it('leads with the Sun and ends with the hypothetical ninth', () => {
    expect(BODIES[0]![0]).toBe('Sun')
    expect(BODIES[I_P9]![0]).toBe('Planet 9?')
    expect(NB).toBe(BODIES.length)
  })

  it('counts the Sun plus eight planets before the dwarfs', () => {
    expect(N_PLANETS).toBe(9)
    expect(BODIES[N_PLANETS - 1]![0]).toBe('Neptune')
    expect(BODIES[N_PLANETS]![0]).toBe('Ceres')
  })

  it('has a plane for every body and a phase for every body', () => {
    expect(BU).toHaveLength(NB)
    expect(BV).toHaveLength(NB)
    expect(PHASE).toHaveLength(NB)
  })

  it('gives the planets the ecliptic and the dwarfs their own inclinations', () => {
    // The first nine share E1/E2 by identity, not by value — that is how the code says
    // "these are all in the ecliptic".
    for (let i = 1; i < N_PLANETS; i++) expect(BU[i]).toBe(BU[1])
    // Pluto's orbit is inclined 17°, so its plane must not be the ecliptic.
    const pluto = BODIES.findIndex((b) => b[0] === 'Pluto')
    expect(BU[pluto]).not.toBe(BU[1])
  })

  it('agrees with the real semi-major axes it claims to use', () => {
    // Sanity against the astronomy, not against the previous build: these are the numbers a
    // reader would check the piece against.
    const a = (name: string): number => BODIES.find((b) => b[0] === name)![5] as number
    expect(a('Earth')).toBeCloseTo(1.0, 3)
    expect(a('Jupiter')).toBeCloseTo(5.203, 3)
    expect(a('Neptune')).toBeCloseTo(30.07, 2)
    // And Kepler's third law, which none of these were fitted to.
    for (const name of ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']) {
      const b = BODIES.find((x) => x[0] === name)!
      const period = b[1] as number
      const axis = b[5] as number
      expect(period ** 2 / axis ** 3, `${name} does not satisfy P² = a³`).toBeCloseTo(1, 1)
    }
  })
})

describe('bodyPos', () => {
  it('writes into the array it is given and returns it', () => {
    const target = out()
    expect(bodyPos(3, 0, target)).toBe(target)
    expect(target.some((v) => v !== 0)).toBe(true)
  })

  it('puts the Sun on its galactic orbit, and everything else near the Sun', () => {
    const t = 1e6
    const sun = at(0, t)
    expect(Math.hypot(sun[0]!, sun[2]!)).toBeCloseTo(sunR(t), 6)

    // At true scale the whole solar system is a speck: Neptune is 30 AU out, which is under
    // a thousandth of the Sun's distance from the galactic centre.
    expect(dist(at(NEPTUNE, t), sun) / R_GAL).toBeLessThan(1e-3)
  })

  it('orbits each planet at its own period', () => {
    // A full period returns a body to where it started, relative to the Sun.
    for (const name of ['Mercury', 'Earth', 'Jupiter']) {
      const i = BODIES.findIndex((b) => b[0] === name)
      const period = BODIES[i]![1] as number
      const start = dist(at(i, 0), at(0, 0))
      const half = dist(at(i, period / 2), at(0, period / 2))
      const full = at(i, period)
      const sunFull = at(0, period)

      // Circular orbits here, so the distance is constant; the position must come back.
      expect(half).toBeCloseTo(start, 9)
      const offset0 = at(i, 0).map((v, k) => v - at(0, 0)[k]!)
      const offsetP = full.map((v, k) => v - sunFull[k]!)
      for (let k = 0; k < 3; k++) expect(offsetP[k]!).toBeCloseTo(offset0[k]!, 9)
    }
  })

  it('places Earth one astronomical unit from the Sun', () => {
    const t = 12345
    expect(dist(at(EARTH, t), at(0, t))).toBeCloseTo(AU2U, 12)
  })

  it('bobs the Sun through the disk plane on its ~90 Myr period', () => {
    // Real amplitude, not the exaggerated one: REAL_MODE is on for good.
    const ys: number[] = []
    for (let k = 0; k <= 40; k++) ys.push(at(0, (k / 40) * WOB_T)[1]!)
    expect(Math.max(...ys)).toBeCloseTo(8.3, 1)
    expect(Math.min(...ys)).toBeCloseTo(-8.3, 1)
    // One period later it is back.
    expect(at(0, WOB_T)[1]!).toBeCloseTo(at(0, 0)[1]!, 6)
  })

  it('tilts the ecliptic to the galactic plane, not into it', () => {
    // The ecliptic is inclined 60.2°, so a planet's offset from the Sun must have a vertical
    // component — a solar system drawn flat in the disk would be a rendering that agrees with
    // every screenshot and disagrees with the sky.
    const t = 0.25 // a quarter of Earth's year, where the tilt shows most
    const offset = at(EARTH, t).map((v, k) => v - at(0, t)[k]!)
    const inclination = Math.asin(Math.abs(offset[1]!) / Math.hypot(...offset))
    expect(inclination).toBeGreaterThan(0)
    expect(inclination).toBeLessThanOrEqual(TILT + 1e-9)
  })

  it('runs backwards as happily as forwards', () => {
    // The clock is scrubbable and the trails are recomputed from any time, so negative t is
    // an ordinary input rather than an edge case.
    for (const i of [0, EARTH, I_P9]) {
      const p = at(i, -1e8)
      expect(p.every(Number.isFinite)).toBe(true)
    }
    expect(sunPhase(-1e6)).toBeLessThan(0)
  })

  it('stays finite deep into the merger, where the orbit is still widening', () => {
    const late = 1e10
    for (let i = 0; i < NB; i++) expect(at(i, late).every(Number.isFinite)).toBe(true)
  })
})
