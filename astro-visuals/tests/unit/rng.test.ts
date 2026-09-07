import { describe, it, expect, afterEach } from 'vitest'
import { gauss, expR } from '../../src/core/rng'

/**
 * The two samplers every generator draws through — and the reason the parity gate can exist
 * at all, since seeding Math.random is what makes the galaxy reproducible.
 *
 * The draw-count behaviour is tested as carefully as the distribution. 00-PLAN.md ranks
 * "the eval-time random stream reorders" as the second-worst risk in the migration: the
 * generators are called in a fixed order and consume a fixed prefix of the stream, so
 * anything that changes how many values a sampler takes moves every star, every nebula and
 * every dust cloud downstream of it — with nothing thrown and nothing logged.
 */

const original = Math.random
afterEach(() => { Math.random = original })

/** mulberry32, the same one the parity harness injects. */
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Wrap a source so we can count how many values something consumed. */
function counting(source: () => number): { draws: () => number } {
  let n = 0
  Math.random = () => { n++; return source() }
  return { draws: () => n }
}

describe('gauss', () => {
  it('is a standard normal', () => {
    Math.random = seeded(1)
    const N = 20000
    const xs = Array.from({ length: N }, gauss)
    const mean = xs.reduce((a, b) => a + b, 0) / N
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / N)

    expect(Math.abs(mean)).toBeLessThan(0.03)
    expect(sd).toBeCloseTo(1, 1)
    // Roughly two thirds within one sigma, and essentially everything within four.
    expect(xs.filter((x) => Math.abs(x) < 1).length / N).toBeCloseTo(0.68, 1)
    expect(xs.every((x) => Math.abs(x) < 6)).toBe(true)
  })

  it('is reproducible from a seed, which is what the parity gate rests on', () => {
    Math.random = seeded(42)
    const a = Array.from({ length: 50 }, gauss)
    Math.random = seeded(42)
    const b = Array.from({ length: 50 }, gauss)
    expect(a).toEqual(b)
  })

  it('never returns NaN, however unlucky the draws', () => {
    // It rejects zeros precisely because log(0) is -Infinity: `while(!u) u = Math.random()`.
    // A source that keeps returning 0 for a while must not produce NaN, only more draws.
    let calls = 0
    Math.random = () => (++calls <= 6 ? 0 : 0.5)
    expect(Number.isFinite(gauss())).toBe(true)
  })

  it('takes a variable number of draws — so nothing downstream may assume a fixed count', () => {
    // Two draws normally; more whenever a zero comes up. This is why gauss must never be
    // memoised or batched: doing so would silently re-align the whole stream.
    const plain = counting(seeded(7))
    gauss()
    expect(plain.draws()).toBe(2)

    let calls = 0
    const withZeros = counting(() => (++calls === 1 || calls === 3 ? 0 : 0.5))
    gauss()
    expect(withZeros.draws()).toBeGreaterThan(2)
  })
})

describe('expR', () => {
  it('stays inside the radii it was given', () => {
    Math.random = seeded(3)
    for (let i = 0; i < 5000; i++) {
      const r = expR(360, 1780, 283)
      expect(r).toBeGreaterThanOrEqual(360)
      expect(r).toBeLessThanOrEqual(1780)
    }
  })

  it('follows an exponential disk: nearer radii are commoner', () => {
    Math.random = seeded(4)
    const N = 20000
    const rs = Array.from({ length: N }, () => expR(0, 1000, 200))
    const inner = rs.filter((r) => r < 200).length
    const outer = rs.filter((r) => r >= 200 && r < 400).length
    // One scale length apart, so the outer bin should hold about 1/e of the inner one.
    expect(inner).toBeGreaterThan(outer)
    expect(outer / inner).toBeCloseTo(Math.exp(-1), 1)
  })

  it('takes exactly one draw', () => {
    const c = counting(seeded(9))
    expR(1, 2, 1)
    expect(c.draws()).toBe(1)
  })

  it('handles a scale length much larger than the range without degenerating', () => {
    // Rd >> b makes the profile almost flat; the arithmetic goes through exp of a tiny
    // number and must not collapse to a constant or an out-of-range value.
    Math.random = seeded(5)
    const rs = Array.from({ length: 1000 }, () => expR(10, 20, 1e6))
    expect(rs.every((r) => r >= 10 && r <= 20)).toBe(true)
    expect(new Set(rs.map((r) => r.toFixed(3))).size).toBeGreaterThan(500)
  })
})
