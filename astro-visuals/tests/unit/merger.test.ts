import { describe, it, expect } from 'vitest'
import {
  M31_ORBIT, KPC2U, MERGE_A0, MERGE_A1, MERGE_T0, MERGE_T1,
  orbitUV, sepScene, mergeAt, diskSpin,
} from '../../src/astro/merger'
import { AGE0, YR_PER_SIM, V_GAL } from '../../src/astro/constants'

/**
 * The Andromeda encounter.
 *
 * These tests are written to outlive the numbers they check. Redoing this against the
 * current simulations — with M33 and the LMC, and a spread of outcomes rather than one
 * median track — is a project of its own, and when the control points change most of what
 * is asserted here should still hold: the curve must still pass through its own control
 * points, the separation must still be monotone in the compression, the disk must still
 * never spin backwards. Only the astronomy fixtures below should need revisiting, and they
 * are grouped so it is obvious which ones they are.
 */

const tsAt = (ageGyr: number): number => ((ageGyr - AGE0) * 1e9) / YR_PER_SIM
const sepKpc = (age: number): number => Math.hypot(...orbitUV(age))

describe('orbitUV — the interpolated track', () => {
  it('passes exactly through every control point', () => {
    // A Hermite spline must interpolate, not approximate. If this drifts, the published
    // passage distances the info panel quotes stop being what is drawn.
    for (const [age, u, v] of M31_ORBIT) {
      const [gu, gv] = orbitUV(age!)
      expect(gu, `u at ${age} Gyr`).toBeCloseTo(u!, 6)
      expect(gv, `v at ${age} Gyr`).toBeCloseTo(v!, 6)
    }
  })

  it('is continuous across every knot', () => {
    for (const [age] of M31_ORBIT.slice(1, -1)) {
      const before = orbitUV(age! - 1e-6)
      const after = orbitUV(age! + 1e-6)
      expect(Math.hypot(after[0] - before[0], after[1] - before[1])).toBeLessThan(0.01)
    }
  })

  it('holds still once the remnant has settled, and does not extrapolate off the end', () => {
    expect(sepKpc(13.35)).toBeCloseTo(0, 6)
    expect(sepKpc(20)).toBeCloseTo(0, 6)
    expect(sepKpc(1e4)).toBeCloseTo(0, 6)
  })

  it('clamps before the first control point instead of running away', () => {
    const [u, v] = orbitUV(0)
    expect(Number.isFinite(u)).toBe(true)
    expect(Number.isFinite(v)).toBe(true)
    expect(Math.hypot(u, v)).toBeLessThan(2000)
  })
})

describe('the astronomy — the fixtures the science work will revisit', () => {
  it('has Andromeda at 765 kpc today', () => {
    expect(sepKpc(AGE0)).toBeCloseTo(765, 0)
  })

  it('brings it to about 95 kpc at the first passage, +4.5 Gyr from now', () => {
    expect(sepKpc(9.07)).toBeCloseTo(95, 0)
    expect(9.07 - AGE0).toBeCloseTo(4.5, 1)
  })

  it('brings it to about 41 kpc at the second, where the bridges and tails form', () => {
    expect(sepKpc(11.45)).toBeCloseTo(41, 0)
  })

  it('coalesces about 8.8 Gyr from now', () => {
    expect(13.35 - AGE0).toBeCloseTo(8.8, 1)
  })

  it('closes monotonically from today to the first passage', () => {
    let previous = Infinity
    for (let age = AGE0; age <= 9.07; age += 0.05) {
      const s = sepKpc(age)
      expect(s).toBeLessThan(previous + 1e-9)
      previous = s
    }
  })

  it('rebounds less far after each passage, as dynamical friction requires', () => {
    const apo = (from: number, to: number): number => {
      let best = 0
      for (let a = from; a <= to; a += 0.01) best = Math.max(best, sepKpc(a))
      return best
    }
    const first = apo(9.1, 11.4)
    const second = apo(11.5, 12.2)
    const third = apo(12.35, 13.0)
    expect(first).toBeGreaterThan(second)
    expect(second).toBeGreaterThan(third)
  })
})

describe('sepScene — true scale near, compressed far', () => {
  it('is exactly true scale inside the compression radius', () => {
    expect(sepScene(1)).toBeCloseTo(KPC2U, 9)
    expect(sepScene(82.8)).toBeCloseTo(82.8 * KPC2U, 6)
  })

  it('is very nearly continuous at the handover', () => {
    // Not exactly: 82.8·KPC2U is about 9002 where the far branch starts at 9000, a 0.02%
    // step. Invisible on screen, and carried across verbatim rather than "fixed" — tightening
    // it is a change to what is drawn, which belongs to the science work.
    const below = sepScene(82.8 - 1e-9)
    const above = sepScene(82.8 + 1e-9)
    expect(Math.abs(above - below) / below).toBeLessThan(3e-4)
  })

  it('is monotone everywhere, so nothing ever appears to move the wrong way', () => {
    let previous = -Infinity
    for (let kpc = 0.1; kpc < 900; kpc *= 1.02) {
      const s = sepScene(kpc)
      expect(s).toBeGreaterThan(previous)
      previous = s
    }
  })

  it('puts today\'s 765 kpc at the edge of the drawn sky rather than offstage', () => {
    expect(sepScene(765)).toBeCloseTo(13000, -2)
    // Uncompressed it would be eight times further out and nothing would be visible.
    expect(765 * KPC2U / sepScene(765)).toBeGreaterThan(6)
  })
})

describe('mergeAt — how far the relaxation has run', () => {
  it('is zero before it starts and one once the remnant has settled', () => {
    expect(mergeAt(0)).toBe(0)
    expect(mergeAt(MERGE_A0)).toBe(0)
    expect(mergeAt(MERGE_A1)).toBe(1)
    expect(mergeAt(100)).toBe(1)
  })

  it('rises linearly in between, and is clamped at both ends', () => {
    expect(mergeAt((MERGE_A0 + MERGE_A1) / 2)).toBeCloseTo(0.5, 9)
    for (let a = 0; a < 20; a += 0.1) {
      expect(mergeAt(a)).toBeGreaterThanOrEqual(0)
      expect(mergeAt(a)).toBeLessThanOrEqual(1)
    }
  })
})

describe('diskSpin — the v2.53.1 regression', () => {
  // An earlier build scaled the ACCUMULATED ANGLE by (1 − merge) rather than integrating a
  // fading rate. With thirty laps already on the clock that ran the entire galaxy backwards
  // at four times its speed the moment relaxation began, at galactic year ~51.7.
  const rate = (ts: number): number => (diskSpin(ts + 1e3) - diskSpin(ts - 1e3)) / 2e3

  it('never runs backwards', () => {
    let previous = -Infinity
    for (let age = AGE0; age <= 25; age += 0.02) {
      const s = diskSpin(tsAt(age))
      expect(s, `disk spin went backwards at ${age.toFixed(2)} Gyr`).toBeGreaterThanOrEqual(previous)
      previous = s
    }
  })

  it('turns at the flat-curve rate until the relaxation begins', () => {
    expect(diskSpin(MERGE_T0)).toBeCloseTo(MERGE_T0 * V_GAL, 6)
    expect(rate(MERGE_T0 * 0.5) / V_GAL).toBeCloseTo(1, 6)
  })

  it('fades the rate to a standstill, rather than the angle to zero', () => {
    expect(rate(MERGE_T0 + (MERGE_T1 - MERGE_T0) * 0.5) / V_GAL).toBeCloseTo(0.5, 3)
    expect(rate(MERGE_T1 * 1.5) / V_GAL).toBeCloseTo(0, 6)
  })

  it('never exceeds the flat-curve rate, let alone four times it', () => {
    for (let age = AGE0; age <= 25; age += 0.02) {
      expect(rate(tsAt(age)) / V_GAL).toBeLessThanOrEqual(1 + 1e-9)
    }
  })

  it('holds a constant angle once the disk is no longer a disk', () => {
    const settled = diskSpin(MERGE_T1)
    expect(diskSpin(MERGE_T1 * 2)).toBeCloseTo(settled, 6)
    expect(diskSpin(MERGE_T1 * 100)).toBeCloseTo(settled, 6)
  })
})
