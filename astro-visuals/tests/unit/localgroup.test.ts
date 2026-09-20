import { describe, it, expect } from 'vitest'
import { LG, LG_BOX, lgFade, lyLabel, lgUpdate } from '../../src/astro/localgroup'
import { LG_ROWS } from '../../src/astro/lg-data'
import { M31_DIR, sepScene, KPC2U } from '../../src/astro/merger'
import { skyBasis } from '../../src/astro/gc'

/**
 * The Local Group, checked against the things that are already in the piece: Andromeda's
 * direction (merger.ts quotes it from l = 121.2°, b = −21.6°), the skybox's Clouds and
 * Triangulum (placed through the same J2000 chain), and the drawn-depth rule itself.
 */
const dot = (a: ArrayLike<number>, b: ArrayLike<number>): number => a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
const len = (a: ArrayLike<number>): number => Math.hypot(a[0], a[1], a[2])
const member = (name: string) => { const m = LG.find(x => x.name === name || (name.endsWith('*') && x.name.startsWith(name.slice(0, -1)))); if(!m) throw new Error(name); return m }

describe('the table', () => {
  it('is the Local Volume Database within 1.25 Mpc, plus Andromeda, Triangulum and the dark galaxy, every row complete', () => {
    expect(LG_ROWS.length).toBeGreaterThan(120)
    for (const r of LG_ROWS) {
      expect(r[0].length).toBeGreaterThan(2)
      for (const v of [r[1], r[2], r[3], r[4], r[6], r[7]]) expect(Number.isFinite(v)).toBe(true)
      expect(r[3]).toBeLessThanOrEqual(1250)
      expect(['dSph', 'dIrr', 'dE', 'cE', 'spiral', 'dark']).toContain(r[8])
      expect(r[11].length).toBeGreaterThan(5)
    }
    expect(member('Triangulum (M33)').kind).toBe('spiral')
    expect(member('Andromeda Galaxy (M31)').kpc).toBe(765)
    expect(member('AC G185.0*').kind).toBe('dark')
    expect(member('Large Magellanic Cloud').kpc).toBeCloseTo(49.6, 0)
    expect(member('Andromeda I').kpc).toBeGreaterThan(700)
  })
})

describe('the placement', () => {
  it('puts the Andromeda satellites in Andromeda’s direction, and Triangulum 15° from it', () => {
    const a1 = member('Andromeda I'), m33 = member('Triangulum (M33)')
    const cosA = dot(a1.pos, M31_DIR)/len(a1.pos)
    expect(Math.acos(cosA)*180/Math.PI).toBeLessThan(4)
    const cosT = dot(m33.pos, M31_DIR)/len(m33.pos)
    expect(Math.acos(cosT)*180/Math.PI).toBeCloseTo(14.8, 0)
  })
  it('agrees with the skybox\u2019s positions for the Clouds and Triangulum (scene/skybox quotes these RA/Decs)', () => {
    for (const [ra, dec, key] of [[80.89, -69.76, 'Large Magellanic Cloud'], [13.19, -72.83, 'Small Magellanic Cloud'], [23.46, 30.66, 'Triangulum (M33)']] as const) {
      const sky = skyBasis(ra, dec).Z, m = member(key)
      // the database's centres differ from the skybox's photo centres by up to a degree
      expect(dot(sky, m.pos)/len(sky)/len(m.pos)).toBeGreaterThan(Math.cos(1.5*Math.PI/180))
    }
  })
  it('slides from the merger\u2019s compressed depth to true scale as the Group fades in', () => {
    const lmc = member('Large Magellanic Cloud'), a1 = member('Andromeda I'), m31 = member('Andromeda Galaxy (M31)')
    lgUpdate(0)
    expect(len(lmc.pos)).toBeCloseTo(49.6*KPC2U, 0)              // inside 83 kpc both rules agree
    expect(len(a1.pos)).toBeCloseTo(sepScene(a1.kpc), 1)
    expect(len(m31.pos)).toBeCloseTo(13000, 0)                    // where the merger model draws her today
    lgUpdate(1)
    expect(len(a1.pos)).toBeCloseTo(a1.kpc*KPC2U, 1)
    expect(len(m31.pos)).toBeCloseTo(765*KPC2U, 1)
    expect(len(m31.pos)).toBeGreaterThan(80000)
  })
  it('keeps each galaxy’s angular size from the Sun', () => {
    const lmc = member('Large Magellanic Cloud')     // half-light radius 193′ at 49.6 kpc
    expect(Math.atan(lmc.a/len(lmc.pos))*180/Math.PI*60).toBeCloseTo(192.9, 0)
    expect(dot(lmc.A, lmc.pos)/len(lmc.A)/len(lmc.pos)).toBeCloseTo(0, 4)
    expect(dot(lmc.A, lmc.B)/len(lmc.A)/len(lmc.B)).toBeCloseTo(0, 4)
  })
  it('boxes every member, and stands the box on the Galaxy’s axis between us and Andromeda', () => {
    const { centre, radius, halfH } = LG_BOX
    lgUpdate(1)
    for (const m of LG) {
      expect(Math.hypot(m.pos[0] - centre[0], m.pos[2] - centre[2])).toBeLessThanOrEqual(radius)
      expect(Math.abs(m.pos[1] - centre[1])).toBeLessThanOrEqual(halfH)
    }
    expect(Math.hypot(centre[0], centre[2])).toBeLessThanOrEqual(radius)   // the Milky Way is inside too
    expect(dot(centre, M31_DIR)/len(centre)).toBeCloseTo(1, 3)
    expect(len(centre)).toBeCloseTo(765*KPC2U/2, -1)   // M31_DIR is quoted to four places
  })
  it('fades in past the Galaxy’s own views and writes distances the chart’s way', () => {
    expect(lgFade(9500)).toBe(0); expect(lgFade(22500)).toBe(0); expect(lgFade(64000)).toBe(1); expect(lgFade(44000)).toBeGreaterThan(0.3)
    expect(lyLabel(2.54e6)).toBe('2.54 Mly'); expect(lyLabel(163000)).toBe('163 kly')
  })
})
