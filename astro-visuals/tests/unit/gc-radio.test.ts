import { describe, it, expect } from 'vitest'
import { RADIO, RADIO_GEOM, SGRA, SGRA_R0_U, galDir, sceneToGalLB, planePA } from '../../src/astro/gc'
import type { Vec3 } from '../../src/core/mat4'

/**
 * The radio sky round the Centre, checked against what is known of it: the map's objects
 * (LaRosa et al. 2000) are placed by galactic coordinates on the sphere of Sagittarius A*'s
 * distance, so the whole chain — galactic direction, the J2000 rotation behind the sky basis,
 * the scene's left-handed frame — is tested by one number that was measured independently:
 * Reid & Brunthaler 2004 give the position angle of the Galactic plane at Sgr A* as 31.40°
 * east of north, from the proper motion of the black hole itself.
 */

const dot = (u: ArrayLike<number>, v: ArrayLike<number>): number => u[0]*v[0] + u[1]*v[1] + u[2]*v[2]
const len = (v: ArrayLike<number>): number => Math.hypot(v[0], v[1], v[2])
const geom = (name: string) => { const g = RADIO_GEOM.find(x => x.obj.name === name); if(!g) throw new Error(name); return g }

describe('the galactic frame at the Centre', () => {
  it('round-trips a direction through galactic coordinates', () => {
    for (const [l, b] of [[0, 0], [359.94, -0.05], [1.13, -0.11], [90, 45], [200, -60]]) {
      const lb = sceneToGalLB(galDir(l, b))
      expect(lb.l).toBeCloseTo(l, 9); expect(lb.b).toBeCloseTo(b, 9)
    }
  })
  it('puts Sagittarius A* where its J2000 position says, l = 359.944°, b = −0.046°', () => {
    const lb = sceneToGalLB(SGRA.basis.Z)
    expect(lb.l).toBeCloseTo(359.944, 2)
    expect(lb.b).toBeCloseTo(-0.046, 2)
  })
  it('has the plane at position angle 31.4° east of north at Sgr A* (Reid & Brunthaler 2004)', () => {
    // the whole sky basis is tested here: a wrong sign in the J2000 rotation or the
    // left-handed scene frame would put the plane at −31°, or 149°, or 211°
    expect(planePA()).toBeCloseTo(31.4, 0)
    expect(Math.abs(planePA() - 31.4)).toBeLessThan(0.3)
  })
})

describe('the radio objects', () => {
  it('every row has finite numbers, a kind, a source, and at most 0.1° of image-read position', () => {
    for (const o of RADIO) {
      for (const v of [o.l, o.b, o.maj, o.min, o.pa]) expect(Number.isFinite(v)).toBe(true)
      expect(o.src.length).toBeGreaterThan(8)
      expect(o.maj).toBeGreaterThanOrEqual(o.min)
    }
    // only the two the image names without a designation are read off the image
    expect(RADIO.filter(o => o.fromImage).map(o => o.name).sort()).toEqual(['background galaxy', 'the Cane'])
    // and every designation encodes the row's own coordinates
    for (const o of RADIO) if (o.g) {
      const m = /^G(\d+\.\d+)([+-]\d+\.\d+)$/.exec(o.g)!
      const dl = Math.abs(Number(m[1]) - o.l)
      expect(Math.min(dl, 360 - dl)).toBeLessThan(0.06)
      expect(Math.abs(Number(m[2]) - o.b)).toBeLessThan(0.06)
    }
  })
  it('sits on the sphere of the Centre’s distance, Sgr A itself at the origin', () => {
    const Z = SGRA.basis.Z
    for (const g of RADIO_GEOM) {
      const sun = [g.c[0] + Z[0]*SGRA_R0_U, g.c[1] + Z[1]*SGRA_R0_U, g.c[2] + Z[2]*SGRA_R0_U]
      // (the Mouse's quad slides along its tangent plane to put the head on the designation:
      // a hundredth of a parsec off the sphere, hence the looser tolerance)
      expect(len(sun)).toBeCloseTo(SGRA_R0_U, 2)
      // the outline is in the local sky plane: both axes at right angles to the line of sight
      expect(dot(g.A, sun)/len(g.A)/len(sun)).toBeCloseTo(0, 2)
      expect(dot(g.B, sun)/len(g.B)/len(sun)).toBeCloseTo(0, 2)
      expect(dot(g.A, g.B)).toBeCloseTo(0, 9)
    }
    expect(len(geom('Sgr A').c)).toBeLessThan(0.03)      // a thousandth of a degree
  })
  it('has the sky the right way round: Sgr B2 north-east of Sgr A*, the Pelican south-west, the Mouse south-east', () => {
    const { N, E } = SGRA.basis
    const b2 = geom('Sgr B2').c, pel = geom('the Pelican').c, mouse = geom('the Mouse').c
    expect(dot(b2, N)).toBeGreaterThan(0); expect(dot(b2, E)).toBeGreaterThan(0)
    // the plane runs NE–SW on the sky, so a degree of longitude behind Sgr A* is well south
    expect(dot(pel, N)).toBeLessThan(0); expect(dot(pel, E)).toBeLessThan(0)
    expect(dot(mouse, N)).toBeLessThan(0); expect(dot(mouse, E)).toBeGreaterThan(0)
    // Sgr B2 is at l = 0.67°, and Sgr A* itself at 359.944°: 0.726° apart, 105 pc at 8,277 pc
    expect(len(b2)/SGRA_R0_U*180/Math.PI).toBeCloseTo(Math.hypot(0.67 + 360 - 359.944, -0.04 + 0.046), 3)
  })
  it('turns the outlines the way the map does: filaments across the plane, the Pelican along it', () => {
    const along = (name: string): number => {     // |cos| between the long axis and the +l direction
      const g = geom(name), lb = sceneToGalLB([g.c[0]/SGRA_R0_U + SGRA.basis.Z[0], g.c[1]/SGRA_R0_U + SGRA.basis.Z[1], g.c[2]/SGRA_R0_U + SGRA.basis.Z[2]] as Vec3)
      const l = lb.l*Math.PI/180
      const uL = galDir(lb.l + 1e-3, lb.b), d0 = galDir(lb.l, lb.b)
      const t = [uL[0]-d0[0], uL[1]-d0[1], uL[2]-d0[2]]
      void l
      return Math.abs(dot(g.A, t))/len(g.A)/len(t)
    }
    expect(along('the Snake')).toBeLessThan(0.2)
    expect(along('the Arc')).toBeLessThan(0.05)
    expect(along('the Pelican')).toBeGreaterThan(0.99)
    expect(along('Sgr B1')).toBeGreaterThan(0.99)
  })
  it('scales sizes as the distance says: a 24′ remnant is 58 pc across', () => {
    const g = geom('SNR 359.1−0.5')
    expect(2*g.a*30/3.26156).toBeCloseTo(57.8, 0)
  })
})
