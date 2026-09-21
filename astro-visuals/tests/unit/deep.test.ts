import { describe, it, expect } from 'vitest'
import { parseDeep, deepFade, DEEP_NAMED } from '../../src/astro/deep'
import { DEEP_CLUSTERS, DEEP_N } from '../../src/astro/deep-data'
import { MPC2U } from '../../src/astro/supercluster'
import { galToSG } from '../../src/astro/supergalactic'
import { sceneToGalLB } from '../../src/astro/gc'

/** The deep field's binary and its names: the layout the tool writes, read back exactly. */
describe('the deep field', () => {
  it('reads the tool’s binary and refuses anything else', () => {
    const n = 3, buf = new ArrayBuffer(8 + n*6), dv = new DataView(buf)
    ;[0x32, 0x4d, 0x52, 0x53].forEach((c, i) => dv.setUint8(i, c))   // '2MRS'
    dv.setUint32(4, n, true)
    const rows = [[102.88, -2.30, 1176], [0, 0, 7460], [270, 45, 15000]]
    rows.forEach(([l, b, cz], i) => { const o = 8 + i*6; dv.setUint16(o, Math.round(l*100), true); dv.setInt16(o+2, Math.round(b*100), true); dv.setUint16(o+4, cz, true) })
    const d = parseDeep(buf)!
    expect(d.n).toBe(3)
    for (let i=0;i<3;i++) {
      const p = [d.pos[i*3], d.pos[i*3+1], d.pos[i*3+2]], len = Math.hypot(p[0], p[1], p[2])
      expect(len/MPC2U).toBeCloseTo(rows[i][2]/74.6, 3)
      const lb = sceneToGalLB([p[0]/len, p[1]/len, p[2]/len]), sg = galToSG(lb.l, lb.b)
      expect(sg.sgl % 360).toBeCloseTo(rows[i][0] % 360, 1); expect(sg.sgb).toBeCloseTo(rows[i][1], 1)
    }
    expect(parseDeep(new ArrayBuffer(4))).toBeNull()
    const bad = new ArrayBuffer(8 + 6); new DataView(bad).setUint32(4, 1, true)
    expect(parseDeep(bad)).toBeNull()                   // no magic
    const short = new ArrayBuffer(8); const sdv = new DataView(short); [0x32, 0x4d, 0x52, 0x53].forEach((c, i) => sdv.setUint8(i, c)); sdv.setUint32(4, 5, true)
    expect(parseDeep(short)).toBeNull()                 // count past the end
  })
  it('names only clusters the tool checked against the survey', () => {
    expect(DEEP_NAMED.length).toBe(DEEP_CLUSTERS.length)
    for (const c of DEEP_CLUSTERS) { expect(c[4]).toBeGreaterThanOrEqual(8); expect(c[3]).toBeLessThan(65000); expect(c[5].length).toBeGreaterThan(5) }
    expect(DEEP_N === 0 || DEEP_N > 40000).toBe(true)
  })
  it('fades in past the supercluster views', () => {
    expect(deepFade(9.5e6)).toBe(0); expect(deepFade(2.6e7)).toBe(1); expect(deepFade(1.8e7)).toBeGreaterThan(0.3)
  })
})
