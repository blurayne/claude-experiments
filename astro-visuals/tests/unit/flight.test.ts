import { describe, it, expect } from 'vitest'
import { clockFactor, fullSpeed, forwardWant, FLY_BOOST } from '../../src/render/flight'

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

  it('sums the hands forward — keys, lever and burst — and the burst is always full ahead', () => {
    expect(forwardWant(0, 0.6, false)).toBeCloseTo(0.6, 9)
    expect(forwardWant(1, 0.6, false)).toBe(1)
    expect(forwardWant(0, -1, true)).toBe(0)       // full reverse on the lever, a burst: they cancel
    expect(forwardWant(0, 0, true)).toBe(1)
    expect(forwardWant(-1, 0, false)).toBe(-1)
  })
})

import { engineTargets } from '../../src/audio/engine-map'
describe('the engine sound', () => {
  it('idles as a quiet hum with no air and no roar', () => {
    const k = engineTargets(0, false, false)
    expect(k.humG).toBeGreaterThan(0)
    expect(k.airG).toBe(0)
    expect(k.roarG).toBe(0)
  })
  it('climbs in pitch, brightness and rush with the throttle', () => {
    const a = engineTargets(0.3, false, false), b = engineTargets(1, false, false)
    expect(b.humF).toBeGreaterThan(a.humF)
    expect(b.lpF).toBeGreaterThan(a.lpF)
    expect(b.airG).toBeGreaterThan(a.airG)
    expect(b.airF).toBeGreaterThan(a.airF)
  })
  it('roars only while the burst is held', () => {
    expect(engineTargets(1, true, true).roarG).toBeGreaterThan(0)
    expect(engineTargets(1, false, true).roarG).toBe(0)
  })
  it('clamps the throttle it is given', () => {
    expect(engineTargets(5, false, false)).toEqual(engineTargets(1, false, false))
    expect(engineTargets(-2, false, false)).toEqual(engineTargets(0, false, false))
  })
})
