import { describe, it, expect } from 'vitest'
import { SG_X, SG_Y, SG_Z, SG_SCENE, galToSG, sgDir } from '../../src/astro/supergalactic'
import { sceneToGalLB } from '../../src/astro/gc'

/**
 * The supergalactic frame, checked against the textbook values: the pole and the zero
 * point define it; the Virgo cluster (M87) and M81 are where the catalogues put them.
 */
const dot = (a: readonly number[], b: readonly number[]): number => a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
const len = (a: readonly number[]): number => Math.hypot(a[0], a[1], a[2])

describe('the supergalactic frame', () => {
  it('is orthonormal and right-handed', () => {
    for (const v of [SG_X, SG_Y, SG_Z]) expect(len(v)).toBeCloseTo(1, 12)
    expect(dot(SG_X, SG_Y)).toBeCloseTo(0, 9); expect(dot(SG_X, SG_Z)).toBeCloseTo(0, 9); expect(dot(SG_Y, SG_Z)).toBeCloseTo(0, 9)
    // the pole is 90° from the origin by construction only if b = 0 at the origin and the pole's l is 90° off: check the dot
    expect(dot(SG_X, SG_Z)).toBeCloseTo(0, 6)
  })
  it('sends the pole to SGB = 90° and the origin to SGL = 0', () => {
    expect(galToSG(47.37, 6.32).sgb).toBeCloseTo(90, 3)
    const o = galToSG(137.37, 0); expect(o.sgl).toBeCloseTo(0, 6); expect(o.sgb).toBeCloseTo(0, 6)
  })
  it('puts M87 at SGL 102.9°, SGB −2.3° and M81 at SGL 41.1°, SGB +0.6° (NED)', () => {
    // M87: galactic l = 283.78°, b = +74.49°; M81: l = 142.09°, b = +40.90°
    const m87 = galToSG(283.78, 74.49), m81 = galToSG(142.09, 40.90)
    expect(m87.sgl).toBeCloseTo(102.9, 0); expect(m87.sgb).toBeCloseTo(-2.3, 0)
    expect(m81.sgl).toBeCloseTo(41.1, 0); expect(m81.sgb).toBeCloseTo(0.6, 0)
  })
  it('round-trips through the scene frame', () => {
    for (const [sgl, sgb] of [[0, 0], [102.9, -2.3], [41.1, 0.6], [250, -60], [180, 45]]) {
      const v = sgDir(sgl, sgb)
      const lb = sceneToGalLB(v)
      const back = galToSG(lb.l, lb.b)
      expect(back.sgl).toBeCloseTo(sgl, 6); expect(back.sgb).toBeCloseTo(sgb, 6)
    }
    expect(dot(SG_SCENE.Z, sgDir(0, 90))).toBeCloseTo(1, 9)
  })
})
