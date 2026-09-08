import { describe, expect, it } from 'vitest'
import { qrEncode } from '../../src/ui/qr'

/**
 * The QR encoder is how a phone's state reaches a laptop: the whole scene — clock, camera,
 * settings — as a code on screen, photographed and pasted back. Nothing tested it, and it is
 * the only part of the ui/ tree that can be tested without a DOM, so it gets tests now that it
 * is a module rather than a hundred lines in the middle of main.ts.
 *
 * These check the structure the spec fixes, not a golden bitmap: a golden would pin the
 * masking choice, and the mask is chosen by penalty and is allowed to change if the payload
 * does. What must not change is the geometry.
 */
describe('qrEncode', () => {
  it('sizes the symbol by version: n = 17 + 4v', () => {
    for (const text of ['x', 'hello world', 'x'.repeat(200), 'y'.repeat(1000)]) {
      const q = qrEncode(text)
      expect(q.n, `version ${q.version} for ${text.length} bytes`).toBe(17 + 4 * q.version)
      expect(q.m.length).toBe(q.n * q.n)
    }
  })

  it('picks the smallest version that holds the payload', () => {
    // Version 1 at level L holds 17 bytes in byte mode; 18 must step up.
    expect(qrEncode('x'.repeat(17)).version).toBe(1)
    expect(qrEncode('x'.repeat(18)).version).toBe(2)
  })

  it('draws all three finder patterns', () => {
    const q = qrEncode('galactic-transit')
    const at = (x: number, y: number) => q.m[y * q.n + x]
    // A finder is a 7×7 ring: dark border, light gap, 3×3 dark core.
    for (const [ox, oy] of [[0, 0], [q.n - 7, 0], [0, q.n - 7]]) {
      expect(at(ox + 0, oy + 0), 'outer corner').toBe(1)
      expect(at(ox + 1, oy + 1), 'the light ring').toBe(0)
      expect(at(ox + 3, oy + 3), 'the dark core').toBe(1)
      expect(at(ox + 6, oy + 6), 'outer corner').toBe(1)
    }
  })

  it('draws the timing patterns as alternating runs', () => {
    const q = qrEncode('timing')
    for (let i = 8; i < q.n - 8; i++) {
      expect(q.m[6 * q.n + i], `horizontal timing at ${i}`).toBe(i % 2 === 0 ? 1 : 0)
      expect(q.m[i * q.n + 6], `vertical timing at ${i}`).toBe(i % 2 === 0 ? 1 : 0)
    }
  })

  it('is deterministic — the same payload gives the same code', () => {
    const a = qrEncode('galactic-transit v3'), b = qrEncode('galactic-transit v3')
    expect(a.mask).toBe(b.mask)
    expect([...a.m]).toEqual([...b.m])
  })

  it('honours a forced mask, and the chosen mask is one of the eight', () => {
    const q = qrEncode('mask me')
    expect(q.mask).toBeGreaterThanOrEqual(0)
    expect(q.mask).toBeLessThanOrEqual(7)
    for (let mk = 0; mk < 8; mk++) expect(qrEncode('mask me', mk).mask).toBe(mk)
  })

  it('refuses a payload no version can hold', () => {
    // Version 40 at level L holds 2,953 bytes.
    expect(() => qrEncode('x'.repeat(4000))).toThrow(/too long/)
  })
})
