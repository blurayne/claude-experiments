import { describe, it, expect } from 'vitest'
import { sunR, sunPhase } from '../../src/astro/sun'
import { R_GAL, V_GAL, AGE0, YR_PER_SIM, SCATTER_AGE, SR_A } from '../../src/astro/constants'

/**
 * Where the Sun is, and how fast it is going.
 *
 * The headline assertion here is the orbital speed. AGENTS.md records that an earlier build
 * advanced the galactic anomaly at a fixed angular rate while letting the merger widen the
 * orbit — which carried the Sun round at 860 km/s, comfortably above escape speed at 31 kpc.
 * Nothing on screen looked wrong; the galactic-year counter simply ran too fast. That is the
 * kind of error a screenshot cannot catch and a derivative can.
 */

/** Simulation clock for a given age of the solar system, in Gyr. */
const tsAt = (ageGyr: number): number => ((ageGyr - AGE0) * 1e9) / YR_PER_SIM

/** Orbital speed in scene units per year: R times the angular rate, by central difference. */
function speedAt(ts: number): number {
  const h = 1e4 // years of sim clock; small against the Gyr timescales, large against float noise
  const dphi = (sunPhase(ts + h) - sunPhase(ts - h)) / (2 * h)
  return sunR(ts) * dphi
}

describe('sunR — how far out the Sun orbits', () => {
  it('sits at the present radius until the scatter begins', () => {
    expect(sunR(0)).toBe(R_GAL)
    expect(sunR(tsAt(6))).toBe(R_GAL)
    expect(sunR(tsAt(SCATTER_AGE - 0.001))).toBe(R_GAL)
  })

  it('is continuous across the moment the scatter starts, kink and all', () => {
    // Continuous in value, not in slope: the radius is pinned before the scatter and then
    // starts climbing at 2,750 scene units per Gyr, so the derivative jumps. Asserting a
    // fixed tolerance over a fixed window would just be measuring that slope. Continuity is
    // the gap shrinking in proportion to the window.
    expect(sunR(tsAt(SCATTER_AGE))).toBe(R_GAL)

    const gap = (h: number): number =>
      Math.abs(sunR(tsAt(SCATTER_AGE + h)) - sunR(tsAt(SCATTER_AGE - h)))
    expect(gap(1e-4) / gap(1e-5)).toBeCloseTo(10, 1)
    expect(gap(1e-6) / R_GAL).toBeLessThan(1e-5)
  })

  it('widens monotonically after it, and never contracts', () => {
    let previous = 0
    for (let age = SCATTER_AGE; age <= 20; age += 0.1) {
      const r = sunR(tsAt(age))
      expect(r).toBeGreaterThanOrEqual(previous)
      previous = r
    }
  })

  it('approaches the published median outcome of about 3.75 times today', () => {
    // Cox & Loeb 2008: a median final distance near 30 kpc against today's 8.
    expect(sunR(tsAt(40)) / R_GAL).toBeCloseTo(SR_A, 2)
    expect(sunR(tsAt(1e3)) / R_GAL).toBeLessThanOrEqual(SR_A)
  })
})

describe('sunPhase — how far round it has travelled', () => {
  it('starts at zero and only ever increases', () => {
    expect(sunPhase(0)).toBe(0)
    let previous = -Infinity
    for (let age = AGE0; age <= 25; age += 0.05) {
      const phi = sunPhase(tsAt(age))
      expect(phi).toBeGreaterThan(previous)
      previous = phi
    }
  })

  it('is continuous across the moment the scatter starts', () => {
    const before = sunPhase(tsAt(SCATTER_AGE - 1e-6))
    const after = sunPhase(tsAt(SCATTER_AGE + 1e-6))
    expect(after / before).toBeCloseTo(1, 6)
  })

  it('turns at the flat-curve rate while the orbit is unchanged', () => {
    // Before the scatter the radius is fixed, so the anomaly is simply t·v/R.
    const ts = tsAt(8)
    expect(sunPhase(ts)).toBeCloseTo((ts * V_GAL) / R_GAL, 6)
  })
})

describe('the rotation curve is flat — the v2.53.1 regression', () => {
  it('keeps the orbital speed constant as the merger widens the orbit', () => {
    // This is the assertion. The speed must stay at V_GAL — around 230 km/s — at every age,
    // including well past the scatter where the radius has nearly quadrupled. Advancing the
    // anomaly at a fixed ANGULAR rate instead would show up here as a speed rising with R.
    for (const age of [5, 9, 11, 11.5, 12, 13, 15, 20]) {
      const v = speedAt(tsAt(age))
      expect(v / V_GAL, `orbital speed at ${age} Gyr is ${(v / V_GAL).toFixed(3)}× the flat-curve value`)
        .toBeCloseTo(1, 3)
    }
  })

  it('lengthens the laps in proportion to the radius', () => {
    // A flat curve means period ∝ R. At the far end the orbit is 3.75× wider, so a lap must
    // take 3.75× as long — that is what makes the galactic-year counter visibly slow down.
    const rateNow = 1 / speedAt(tsAt(6)) // 1/v is time per unit arc
    const lapNow = (2 * Math.PI * sunR(tsAt(6))) * rateNow
    const lapLate = (2 * Math.PI * sunR(tsAt(30))) / speedAt(tsAt(30))
    expect(lapLate / lapNow).toBeCloseTo(SR_A, 1)
  })

  it('never exceeds escape speed, which is what the old bug did', () => {
    // Loosely: the old build ran ~3.75× too fast at the far end. Anything above 1.5× the
    // flat-curve speed is unphysical here, so bound it well below the failure.
    for (let age = AGE0; age <= 30; age += 0.25) {
      expect(speedAt(tsAt(age)) / V_GAL).toBeLessThan(1.5)
    }
  })
})
