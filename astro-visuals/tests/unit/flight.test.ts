import { describe, it, expect } from 'vitest'
import { clockFactor, fullSpeed, forwardWant, sideWant, leverThrottle, LEVER_ZERO, FLY_BOOST, FLY_VIEW_PER_S, quatFromBasis, basisFromQuat, levelFromQuat, flight, flightLook, flightRoll, flightOrientFromYawPitch } from '../../src/render/flight'

describe('the flight pace', () => {
  it('scales with the view: a fixed fraction of the view height a second', () => {
    expect(fullSpeed(150, 1, false)/150).toBeCloseTo(1.1547*FLY_VIEW_PER_S, 4)
    expect(FLY_VIEW_PER_S).toBeCloseTo(0.9*1.3, 9)          // v3.23.0: thirty percent more than the first cut
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
  it('idles as a quiet hum, a faint whine, slow pulses, no burst voice', () => {
    const k = engineTargets(0, false, false)
    expect(k.humG).toBeGreaterThan(0)
    expect(k.whineG).toBeGreaterThan(0)
    expect(k.whineG).toBeLessThan(0.06)
    expect(k.pulseHz).toBeLessThan(10)
    expect(k.burstG).toBe(0)
  })
  it('climbs in whine pitch and level, pulse rate, and motor brightness with the throttle', () => {
    const a = engineTargets(0.3, false, false), b = engineTargets(1, false, false)
    expect(b.whineF).toBeGreaterThan(a.whineF)
    expect(b.whineG).toBeGreaterThan(a.whineG)
    expect(b.pulseHz).toBeGreaterThan(a.pulseHz)
    expect(b.lpF).toBeGreaterThan(a.lpF)
  })
  it('keeps the whine where a phone can play it: above 200 Hz', () => {
    expect(engineTargets(0, false, false).whineF).toBeGreaterThan(200)
  })
  it('sounds the burst voice only while the burst is held', () => {
    expect(engineTargets(1, true, true).burstG).toBeGreaterThan(0)
    expect(engineTargets(1, false, true).burstG).toBe(0)
  })
  it('clamps the throttle it is given', () => {
    expect(engineTargets(5, false, false)).toEqual(engineTargets(1, false, false))
    expect(engineTargets(-2, false, false)).toEqual(engineTargets(0, false, false))
  })
})

describe('the free orientation in flight', () => {
  const near = (a: number[], b: number[], eps = 1e-9) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 9 - Math.round(Math.log10(1/eps)) + 9))
  it('round-trips a basis through its quaternion', () => {
    for (const [yaw, pitch] of [[0, 0], [0.9, 0.32], [-2.5, -1.2], [3.0, 1.4]]) {
      const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw)
      const r = [cy, 0, -sy], u = [-sp*sy, cp, -sp*cy], d = [cp*sy, sp, cp*cy]
      const [R, U, D] = basisFromQuat(quatFromBasis(r, u, d))
      near(R, r); near(U, u); near(D, d)
    }
  })
  it('turns like a level camera for small drags, the same signs', () => {
    flightOrientFromYawPitch(0.4, 0.1)
    flightLook(0.05, 0.03)
    const { yaw, pitch } = levelFromQuat(flight.q)
    expect(yaw).toBeCloseTo(0.45, 2)
    expect(pitch).toBeCloseTo(0.13, 2)
  })
  it('does not stop at the pole: a long drag carries the view over the top', () => {
    flightOrientFromYawPitch(0, 0)
    for (let i = 0; i < 100; i++) flightLook(0, Math.PI/100)     // half a turn in pitch
    const [, U, D] = basisFromQuat(flight.q)
    expect(D[2]).toBeCloseTo(-1, 6)        // looking the other way
    expect(U[1]).toBeCloseTo(-1, 6)        // and upside down: over the top, not stopped at 83°
  })
  it('lands level: yaw and pitch that look where the ship looked, pitch within the level camera\'s range', () => {
    flightOrientFromYawPitch(1.2, 0.5)
    flightLook(0, 1.5)                                            // past the level camera's limit
    const { pitch } = levelFromQuat(flight.q)
    expect(Math.abs(pitch)).toBeLessThanOrEqual(1.45)
  })
})

describe('the thumb stick', () => {
  it('sums with the keys sideways and up, clamped', () => {
    expect(sideWant(0, 0.5)).toBeCloseTo(0.5, 9)
    expect(sideWant(1, 0.5)).toBe(1)
    expect(sideWant(-1, 1)).toBe(0)
    expect(sideWant(0, -2)).toBe(-1)
  })
})

describe('the roll', () => {
  it('turns about the line of sight only: where the ship looks does not change', () => {
    flightOrientFromYawPitch(0.7, 0.2)
    const before = basisFromQuat(flight.q)
    flightRoll(0.6)
    const after = basisFromQuat(flight.q)
    after[2].forEach((v, i) => expect(v).toBeCloseTo(before[2][i], 9))       // the sight line stays
    const cosA = after[1].reduce((s, v, i) => s + v*before[1][i], 0)
    expect(cosA).toBeCloseTo(Math.cos(0.6), 9)                               // up turned by the roll
  })
  it('undoes itself', () => {
    flightOrientFromYawPitch(-1.1, 0.4)
    const q0 = flight.q.slice()
    flightRoll(0.9); flightRoll(-0.9)
    flight.q.forEach((v, i) => expect(Math.abs(v)).toBeCloseTo(Math.abs(q0[i]), 9))
  })
})

describe('the throttle lever', () => {
  it('is zero a quarter of the way up, and round it (the detent)', () => {
    expect(LEVER_ZERO).toBe(0.25)
    expect(leverThrottle(0.25)).toBe(0)
    expect(leverThrottle(0.27)).toBe(0)
    expect(leverThrottle(0.23)).toBe(0)
  })
  it('is full ahead at the head and full reverse at the foot', () => {
    expect(leverThrottle(1)).toBeCloseTo(1, 9)
    expect(leverThrottle(0)).toBeCloseTo(-1, 9)
  })
  it('gives little in the middle of the forward travel: a curve, not a line', () => {
    const mid = leverThrottle(0.25 + 0.75/2)
    expect(mid).toBeGreaterThan(0.1)
    expect(mid).toBeLessThan(0.25)
  })
  it('rises all the way up', () => {
    let prev = 0
    for (let p = 0.3; p <= 1.0001; p += 0.05) { const t = leverThrottle(p); expect(t).toBeGreaterThan(prev); prev = t }
  })
})

import { warpStrength, WARP_FULL } from '../../src/render/warp'
describe('the streaks', () => {
  it('are nothing at rest and full from a third of the view a second', () => {
    expect(warpStrength(0)).toBe(0)
    expect(warpStrength(WARP_FULL)).toBe(1)
    expect(warpStrength(10)).toBe(1)
    expect(warpStrength(WARP_FULL/2)).toBeCloseTo(0.5, 9)
  })
})
