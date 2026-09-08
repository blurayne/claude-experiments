import { describe, it, expect } from 'vitest'
import { g710, G710_AT, G710_PERI, G710_V, G710_DIR, G710_OFF } from '../../src/astro/g710'

/**
 * Gliese 710's passage, checked against the measurement rather than against the old build.
 *
 * Bailer-Jones et al. 2018, from Gaia's astrometry: a K7 dwarf presently about 62 light years
 * away, closing at 14.4 km/s, reaching its closest approach 1.29 Myr from now at 0.0676 pc —
 * 13,944 AU, well inside the Oort cloud, and the closest stellar encounter known on either
 * side of the present.
 */

const LY_PER_PC = 3.26156
const AU_PER_LY = 63241.1

describe('the encounter', () => {
  it('closes fastest at 1.29 Myr from now', () => {
    expect(G710_AT).toBe(1.29e6)
    const before = g710(G710_AT - 1e5).d
    const at = g710(G710_AT).d
    const after = g710(G710_AT + 1e5).d
    expect(at).toBeLessThan(before)
    expect(at).toBeLessThan(after)
  })

  it('comes within 0.0676 pc, which is 13,944 AU', () => {
    expect(g710(G710_AT).d).toBeCloseTo(G710_PERI, 9)
    expect(G710_PERI / LY_PER_PC, 'perihelion in parsecs').toBeCloseTo(0.0676, 3)
    expect(G710_PERI * AU_PER_LY, 'perihelion in AU').toBeCloseTo(13944, -2)
  })

  it('is inside the Oort cloud at closest approach', () => {
    // The cloud runs from a couple of thousand AU out past a hundred thousand.
    expect(G710_PERI * AU_PER_LY).toBeGreaterThan(2000)
    expect(G710_PERI * AU_PER_LY).toBeLessThan(100000)
  })

  it('travels at 14.4 km/s', () => {
    const KM_PER_LY = 9.4607e12
    const S_PER_YR = 3.1557e7
    expect((G710_V * KM_PER_LY) / S_PER_YR).toBeCloseTo(14.4, 1)
  })

  it('is about 62 light years away today', () => {
    expect(g710(0).d).toBeCloseTo(62, 0)
  })

  it('recedes symmetrically, because the model is a straight line at constant speed', () => {
    // Not a placeholder for something better: over this interval and at this range, a
    // straight line IS the right model, and the symmetry is the check that it is one.
    for (const dt of [1e5, 5e5, 1e6, 5e6]) {
      expect(g710(G710_AT + dt).d).toBeCloseTo(g710(G710_AT - dt).d, 9)
    }
  })

  it('separates the perihelion offset from the direction of travel', () => {
    const dot = G710_DIR[0] * G710_OFF[0] + G710_DIR[1] * G710_OFF[1] + G710_DIR[2] * G710_OFF[2]
    expect(dot, 'the offset must be perpendicular to the track').toBeCloseTo(0, 12)
    expect(Math.hypot(...G710_DIR)).toBeCloseTo(1, 12)
    expect(Math.hypot(...G710_OFF)).toBeCloseTo(1, 12)
  })

  it('grows without bound in both directions, and never returns', () => {
    expect(g710(-1e9).d).toBeGreaterThan(g710(-1e8).d)
    expect(g710(1e9).d).toBeGreaterThan(g710(1e8).d)
    expect(Number.isFinite(g710(1e12).d)).toBe(true)
  })
})
