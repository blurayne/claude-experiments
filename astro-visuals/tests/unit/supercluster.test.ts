import { describe, it, expect } from 'vitest'
import { SC, SC_GROUPS_NAMED, SC_GALS, SC_BOX, MPC2U, groupRadiusMpc, scFade } from '../../src/astro/supercluster'
import { galToSG } from '../../src/astro/supergalactic'
import { sceneToGalLB } from '../../src/astro/gc'
import { KPC2U } from '../../src/astro/merger'

/**
 * The supercluster's data, checked against the catalogue values the research verified
 * verbatim: Virgo (PGC 41220) at SGL 102.88°, SGB −2.30°, 15.76 Mpc with 714 members;
 * M81's group at 3.65 Mpc; the Local Group's row at 0.75 Mpc; and the packing round-trip.
 */
const len = (a: ArrayLike<number>): number => Math.hypot(a[0], a[1], a[2])
const named = (n: string) => { const g = SC_GROUPS_NAMED.find(x => x.name === n); if(!g) throw new Error(n); return g }

describe('the packed group table', () => {
  it('holds every group of Kourkchi & Tully 2017, with Virgo the richest', () => {
    expect(SC.n).toBe(8826)
    let richest = 0
    for (let i=0;i<SC.n;i++) if (SC.mem[i] > SC.mem[richest]) richest = i
    expect(SC.mem[richest]).toBe(714)
    expect(SC.sgl[richest]).toBeCloseTo(102.88, 1); expect(SC.sgb[richest]).toBeCloseTo(-2.30, 1)
    expect(SC.dMpc[richest]).toBeCloseTo(15.76, 2); expect(SC.logK[richest]).toBeCloseTo(12.74, 2)
    expect(SC.byVel[richest]).toBe(0)
    expect(named('Virgo Cluster').i).toBe(richest)
  })
  it('places each group on its supergalactic direction at its distance', () => {
    for (const i of [0, 100, 5000, SC.n - 1, named('Virgo Cluster').i]) {
      const p = [SC.pos[i*3], SC.pos[i*3+1], SC.pos[i*3+2]]
      expect(len(p)/MPC2U).toBeCloseTo(SC.dMpc[i], 3)
      const lb = sceneToGalLB(p.map(v => v/len(p)) as [number, number, number]), sg = galToSG(lb.l, lb.b)
      expect(sg.sgl).toBeCloseTo(SC.sgl[i], 1); expect(sg.sgb).toBeCloseTo(SC.sgb[i], 1)
    }
    expect(MPC2U).toBe(1000*KPC2U)
  })
  it('flags the velocity-placed groups and keeps the measured ones', () => {
    let vel = 0; for (let i=0;i<SC.n;i++) vel += SC.byVel[i]
    expect(vel).toBeGreaterThan(6000); expect(SC.n - vel).toBeGreaterThan(1900)
    expect(SC.byVel[named('M81 Group').i]).toBe(0)
  })
  it('names the chart’s groups where the catalogue puts them', () => {
    expect(named('Local Group').dMpc).toBeCloseTo(0.75, 2)
    expect(named('M81 Group').dMpc).toBeCloseTo(3.65, 2)
    expect(named('Fornax Cluster').dMpc).toBeCloseTo(18.09, 2)
    for (const g of SC_GROUPS_NAMED) expect(g.check).not.toBe('MISMATCH')
    expect(SC_GROUPS_NAMED.filter(g => g.check === 'ungc').length).toBeGreaterThanOrEqual(15)
  })
  it('sizes the clusters from their light: Virgo’s turnaround radius comes out near the catalogue’s 1.65 Mpc', () => {
    expect(groupRadiusMpc(12.74)).toBeCloseTo(1.55, 1)
    expect(groupRadiusMpc(10.98)).toBeCloseTo(0.40, 1)
  })
})

describe('the nearby galaxies', () => {
  it('are the Updated Nearby Galaxy Catalog plus Cloud-9, brightest first', () => {
    expect(SC_GALS.length).toBe(870)
    expect(SC_GALS[0].name).toBe('Large Magellanic Cloud'.slice(0, 0) + 'LMC')
    const m81 = SC_GALS.find(g => g.name === 'M81')!, c9 = SC_GALS.find(g => g.kind === 'dark')!
    expect(m81.dMpc).toBeCloseTo(3.63, 2); expect(m81.major).toBe(true)
    expect(c9.name).toContain('Cloud-9'); expect(c9.dMpc).toBeCloseTo(4.4, 1)
    // Cloud-9 is 51′ from M94 on the sky, at the same distance
    const m94 = SC_GALS.find(g => g.name === 'NGC 4736')!
    const cosA = (c9.pos[0]*m94.pos[0] + c9.pos[1]*m94.pos[1] + c9.pos[2]*m94.pos[2])/len(c9.pos)/len(m94.pos)
    expect(Math.acos(Math.min(1, cosA))*60*180/Math.PI).toBeCloseTo(51, 0)
  })
  it('boxes the supercluster on the supergalactic plane and fades in past the Local Group', () => {
    expect(SC_BOX.radius).toBe(22*MPC2U)
    expect(scFade(330000)).toBe(0); expect(scFade(2e6)).toBe(1)
  })
})
