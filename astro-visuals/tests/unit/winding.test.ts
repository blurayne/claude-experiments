import { describe, it, expect } from 'vitest'
import { PITCH, BAR_A, BAR_L, ARMS, armAngle, asmAt, chaosAt } from '../../src/astro/constants'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * The winding: which way the arms curl, against which way the disk turns.
 *
 * Real spirals TRAIL — each arm's outer tip lags the rotation, the whirlpool geometry —
 * and this page's rotation sense is pinned clockwise-from-north by boot.spec. Trailing
 * under that sense means azimuth must DECREASE going outward along an arm. This file pins
 * the analytic side of that; boot.spec's 'the arms trail' pins the drawn pixels.
 *
 * It exists because of a real regression a user caught by eye: the shipped illustration
 * winds outward-clockwise (leading), an ingest comment claimed the opposite had been
 * "measured", and the analytic skeleton silently disagreed with every drawn ridge until
 * mapXZ learned to reflect the map about the bar axis.
 */

describe('the arms trail', () => {
  it('armAngle strictly unwinds: azimuth decreases as radius grows, for every arm', () => {
    for (const a of ARMS) {
      for (let r = 520; r < 1600; r += 40) {
        expect(armAngle(r + 40, a[0]!)).toBeLessThan(armAngle(r, a[0]!))
      }
    }
  })

  it('carries the measured ~12.5° pitch, and the shader carries the same constant', () => {
    expect(PITCH).toBeCloseTo(Math.tan(12.5 * Math.PI / 180), 10)
    // pt.vert's beat term computes the pattern-frame azimuth with an inlined 1/PITCH;
    // if either side changes alone, the beat stops sitting on the arms.
    const vert = readFileSync(resolve(ROOT, 'src/shaders/pt.vert'), 'utf8')
    expect(vert).toContain('/0.221695')
    expect(PITCH).toBeCloseTo(0.221695, 5)
  })

  it('puts the arms at their real radii on the Sun–centre line', () => {
    // Where each arm crosses azimuth 0 (the Sun sits at r≈891): Sagittarius–Carina must
    // cross INSIDE the Sun's radius, Perseus just outside, Norma/Outer far outside —
    // the radial order every map of the neighbourhood shows.
    const crossR = (off: number): number => BAR_L * Math.exp(off * PITCH)
    expect(crossR(BAR_A + Math.PI / 2)).toBeGreaterThan(700)      // Sagittarius–Carina
    expect(crossR(BAR_A + Math.PI / 2)).toBeLessThan(891)
    expect(crossR(BAR_A + Math.PI)).toBeGreaterThan(950)          // Perseus
    expect(crossR(BAR_A + Math.PI)).toBeLessThan(1300)
    expect(crossR(BAR_A + 1.5 * Math.PI)).toBeGreaterThan(1400)   // Norma / Outer
  })

  it('anchors each bar-pattern arm label on its own locus', () => {
    // The labels were once eyeballed onto the (then mirror-wound) map and sat 60° off
    // the skeleton. Now they are computed onto it, and this keeps them there.
    const src = readFileSync(resolve(ROOT, 'src/render/labels.ts'), 'utf8')
    const block = src.slice(src.indexOf('ARM_LBLS'), src.indexOf('armEls'))
    const offs: Record<string, number> = {
      'Sagittarius–Carina': BAR_A + Math.PI / 2,
      'Perseus': BAR_A + Math.PI,
      'Scutum–Centaurus': BAR_A,
      'Outer Arm': BAR_A + 1.5 * Math.PI,
    }
    let checked = 0
    for (const m of block.matchAll(/\['([^']+)',\s*(-?\d+),\s*(-?\d+),\s*RC_BAR\]/g)) {
      const off = offs[m[1]!]
      if (off === undefined) continue
      const x = Number(m[2]), z = Number(m[3])
      const r = Math.hypot(x, z)
      let d = Math.atan2(x, z) - armAngle(r, off)
      d = Math.atan2(Math.sin(d), Math.cos(d))
      expect(Math.abs(d), `${m[1]} sits ${(d * 180 / Math.PI).toFixed(1)}° off its arm`).toBeLessThan(0.12)
      checked++
    }
    expect(checked).toBe(4)
  })
})

describe('the assembly model', () => {
  it('is exactly the identity today: asm 1, chaos 0 — the present picture untouched', () => {
    expect(asmAt(0)).toBe(1)
    expect(chaosAt(0)).toBe(0)
  })
  it('un-forms going back: compact and chaotic in the deep past, convulsing at Gaia-Enceladus', () => {
    expect(asmAt(-13.0e9)).toBeLessThan(0.05)
    expect(chaosAt(-13.0e9)).toBeGreaterThan(0.5)
    expect(asmAt(-6e9)).toBeGreaterThan(0.9)
    // the ~10 Gyr-ago merger stands above its surroundings
    expect(chaosAt(-10.0e9)).toBeGreaterThan(chaosAt(-7.5e9) + 0.3)
    expect(chaosAt(-2e9)).toBeLessThan(0.02)
    expect(asmAt(-13.6e9)).toBe(0)
  })
})
