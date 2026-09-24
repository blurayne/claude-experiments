import { describe, it, expect } from 'vitest'
import { clockFactor, fullSpeed, FLY_BOOST } from '../../src/render/flight'

describe('the flight pace', () => {
  it('scales with the view: a fixed fraction of the view height a second', () => {
    expect(fullSpeed(150, 1, false)/150).toBeCloseTo(1.1547*0.9, 4)
    expect(fullSpeed(1.5e6, 1, false)/fullSpeed(150, 1, false)).toBeCloseTo(1e4, 6)
  })
  it('boosts by a fixed factor', () => {
    expect(fullSpeed(1000, 1, true)/fullSpeed(1000, 1, false)).toBeCloseTo(FLY_BOOST, 9)
  })
  it('rides the clock by the square root of its rate over a year a second, 1 to 10', () => {
    expect(clockFactor(1, true)).toBe(1)
    expect(clockFactor(100, true)).toBeCloseTo(10, 9)
    expect(clockFactor(1e6, true)).toBe(10)
    expect(clockFactor(0.01, true)).toBe(1)        // never slower than the walking pace
    expect(clockFactor(1e6, false)).toBe(1)        // a paused clock is the walking pace
    expect(clockFactor(NaN, true)).toBe(1)
  })
})
