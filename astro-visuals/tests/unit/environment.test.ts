import { describe, it, expect } from 'vitest'
import {
  sunState, pnState, sunTint,
  SUN_MS_END, SUN_RGB_TIP, SUN_HB, SUN_AGB, SUN_WD, SUN_EAT_AGE, EAT_AGES, EARTH_ORBIT_RSUN,
} from '../../src/astro/sun'
import { ageAt, environment, lifeState, sfrFactor } from '../../src/astro/environment'
import { AGE0, YR_PER_SIM } from '../../src/astro/constants'
import { MERGE_A1 } from '../../src/astro/merger'

/**
 * The Sun's life and Earth's climate — the two models the science work will revisit, so like
 * the merger these are tested for the properties that should survive a rewrite, with the
 * numbers that may not grouped separately and labelled.
 *
 * The climate model is a hypothesis the piece draws honestly rather than a result. The
 * cosmic-ray/cloud coupling is contested; the ~140 Myr glaciation spacing follows from a
 * corotation radius that is not the measured one. None of that is asserted as true here —
 * what is asserted is that the model is self-consistent, continuous, and says today is today.
 */

const tsAt = (ageGyr: number): number => ((ageGyr - AGE0) * 1e9) / YR_PER_SIM
const TODAY = AGE0

describe('sunState — the standard track', () => {
  it('says today is today', () => {
    const now = sunState(TODAY)
    expect(now.L).toBeCloseTo(1, 2)
    expect(now.R).toBeCloseTo(1, 1)
    expect(now.T).toBeCloseTo(5772, -2)
    expect(now.phase).toBe('main sequence')
    expect(now.eaten).toBe(false)
    expect(now.gone).toBe(false)
  })

  it('starts faint, as Gough 1981 has it', () => {
    // ~70% of today's output at formation — the faint young Sun, and the reason the model's
    // early Earth is below freezing and the globe follows the rock record instead.
    expect(sunState(0).L).toBeCloseTo(0.71, 1)
    expect(sunState(0).L).toBeLessThan(sunState(TODAY).L)
  })

  it('brightens monotonically along the main sequence', () => {
    let previous = 0
    for (let a = 0; a < SUN_MS_END; a += 0.05) {
      const L = sunState(a).L
      expect(L).toBeGreaterThan(previous)
      previous = L
    }
  })

  it('is continuous across the three boundaries that are', () => {
    // Six piecewise branches. A discontinuity in R is a star that jumps size on screen; one
    // in L is a climate — and a brightness — that steps.
    for (const edge of [SUN_RGB_TIP, SUN_HB, SUN_AGB]) {
      const before = sunState(edge - 1e-9)
      const after = sunState(edge + 1e-9)
      expect(after.L / before.L, `L jumps at ${edge} Gyr`).toBeCloseTo(1, 3)
      expect(after.R / before.R, `R jumps at ${edge} Gyr`).toBeCloseTo(1, 3)
    }
  })

  // Two boundaries do NOT join up, and these tests pin them as they are rather than fixing
  // them. They are pre-existing — found by writing these tests, present in every shipped
  // version — and closing either gap would change what is drawn, which this refactor is not
  // allowed to do. They are recorded in TODO.md for the Sun's-expansion project instead.
  it('steps where it leaves the main sequence, by 1.9% in L and 10% in R', () => {
    // The main-sequence relation reaches L = 2.2424, R = 1.7801 at 10.9 Gyr; the red-giant
    // branch starts from a flat L = 2.2, R = 1.6. The radius step is the visible one: the
    // drawn disc shrinks by a tenth in an instant, at the age the scenario list calls
    // "leaving the main sequence".
    const before = sunState(SUN_MS_END - 1e-9)
    const after = sunState(SUN_MS_END + 1e-9)
    expect(before.L).toBeCloseTo(2.2424, 3)
    expect(after.L).toBeCloseTo(2.2, 6)
    expect(after.L / before.L).toBeCloseTo(0.9811, 3)

    expect(before.R).toBeCloseTo(1.7801, 3)
    expect(after.R).toBeCloseTo(1.6, 6)
    expect(after.R / before.R).toBeCloseTo(0.8988, 3)
  })

  it('drops a factor of five in luminosity when the white dwarf begins', () => {
    // The planetary-nebula branch ends at L = 0.5 and the white-dwarf branch starts at 0.1 —
    // "a fresh white dwarf is a tenth of today's Sun", which does not meet what the previous
    // branch was leaving. An instantaneous five-fold dimming at 12.44 Gyr.
    const before = sunState(SUN_WD - 1e-9)
    const after = sunState(SUN_WD + 1e-9)
    expect(before.L).toBeCloseTo(0.5, 6)
    expect(after.L).toBeCloseTo(0.1, 6)
    expect(after.L / before.L).toBeCloseTo(0.2, 6)
    expect(after.R / before.R, 'the radius, at least, is continuous here').toBeCloseTo(1, 6)
  })

  it('names each phase in order and ends as a white dwarf', () => {
    // The order is MS → red giant → helium flash → asymptotic giant → planetary nebula →
    // white dwarf, and the constants are the UPPER bound of each: SUN_RGB_TIP ends the red
    // giant, SUN_HB ends the flash, and so on.
    expect(sunState(11.5).phase).toBe('red giant')
    expect(sunState(SUN_RGB_TIP - 0.01).phase).toBe('red giant')
    expect(sunState(SUN_HB - 0.01).phase).toBe('helium flash')
    expect(sunState(SUN_AGB - 0.01).phase).toBe('asymptotic giant')
    expect(sunState(SUN_WD - 0.01).phase).toBe('planetary nebula')
    expect(sunState(13).phase).toBe('white dwarf')
    expect(sunState(30).phase).toBe('white dwarf')
  })

  it('swells past Earth\'s orbit at the red-giant tip', () => {
    expect(sunState(SUN_RGB_TIP).R).toBeCloseTo(256, 0)
    expect(sunState(SUN_RGB_TIP).R).toBeGreaterThan(EARTH_ORBIT_RSUN)
  })

  it('never un-eats the Earth', () => {
    // The Sun contracts again after the tip, so a test against the CURRENT radius would let
    // the planet come back. Engulfment is latched against an age instead, and this is the
    // assertion that says so: eaten must be monotone, for ever.
    expect(sunState(SUN_EAT_AGE - 0.01).eaten).toBe(false)
    let seen = false
    for (let a = SUN_EAT_AGE - 0.1; a < 30; a += 0.01) {
      const eaten = sunState(a).eaten
      if (seen) expect(eaten, `the Earth came back at ${a.toFixed(2)} Gyr`).toBe(true)
      seen ||= eaten
    }
    expect(seen).toBe(true)
    // And the Sun is contracting by then, which is what makes the latch necessary.
    expect(sunState(SUN_HB).R).toBeLessThan(sunState(SUN_RGB_TIP).R)
  })

  it('eats the inner planets in order, and spares Mars', () => {
    // Mercury, Venus, Earth at indices 1–3. Mars sits at 327 R☉, outside the 256 the giant
    // reaches, and survives — as it does in the literature.
    expect(EAT_AGES[1]!).toBeLessThan(EAT_AGES[2]!)
    expect(EAT_AGES[2]!).toBeLessThan(EAT_AGES[3]!)
    expect(EAT_AGES[3]!).toBeCloseTo(SUN_EAT_AGE, 6)
    expect(EAT_AGES).toHaveLength(4)
  })

  it('keeps luminosity, radius and temperature mutually consistent', () => {
    // T is derived from L and R by Stefan–Boltzmann, so this is really a check that no branch
    // sets one without the others.
    for (const a of [1, 5, 10, 11, 12.2, 12.35, 12.5, 20]) {
      const s = sunState(a)
      expect(s.T).toBeCloseTo((5772 * s.L ** 0.25) / Math.sqrt(s.R), 6)
      expect(s.L).toBeGreaterThan(0)
      expect(s.R).toBeGreaterThan(0)
    }
  })
})

describe('pnState — the shed envelope', () => {
  it('does not exist before the star sheds it', () => {
    expect(pnState(TODAY)).toBeNull()
    expect(pnState(SUN_AGB - 0.01)).toBeNull()
  })

  it('appears through the planetary-nebula phase and then fades away', () => {
    const mid = pnState((SUN_AGB + SUN_WD) / 2)
    expect(mid).not.toBeNull()
    expect(mid!.alpha).toBeGreaterThan(0)
    expect(pnState(SUN_WD + 1)).toBeNull()
  })

  it('only ever expands', () => {
    let previous = 0
    for (let a = SUN_AGB; a < SUN_WD + 0.29; a += 0.005) {
      const pn = pnState(a)
      if (!pn) continue
      expect(pn.rAU).toBeGreaterThanOrEqual(previous)
      previous = pn.rAU
    }
    // Out to about a light-year and a half, which is the point of drawing it at true scale.
    expect(previous).toBeGreaterThan(60000)
  })
})

describe('sunTint — the photosphere by temperature', () => {
  it('leaves today\'s Sun exactly as it was', () => {
    // 5772 K is an anchor, so the present look is unchanged by construction.
    const t = sunTint(5772)
    expect(t.b[0]).toBeCloseTo(1.0, 6)
    expect(t.b[1]).toBeCloseTo(0.93, 6)
    expect(t.b[2]).toBeCloseTo(0.62, 6)
  })

  it('reddens when cool and blues when hot, and clamps outside its anchors', () => {
    const cool = sunTint(2400)
    const hot = sunTint(60000)
    expect(cool.b[0]! - cool.b[2]!).toBeGreaterThan(0) // red-dominant
    expect(hot.b[2]! - hot.b[0]!).toBeGreaterThan(0) // blue-dominant
    expect(sunTint(100)).toEqual(cool)
    expect(sunTint(1e6)).toEqual(hot)
  })
})

describe('environment — the climate model', () => {
  it('normalises the cosmic-ray flux so today reads exactly 1', () => {
    expect(environment(0).cr).toBeCloseTo(1, 9)
  })

  it('puts today at 15 °C, which is the number the panel shows', () => {
    const now = environment(0)
    expect(now.mean).toBeCloseTo(15, 1)
    expect(now.ice).toBe(false)
  })

  it('keeps the extremes either side of the mean, always', () => {
    for (let ts = -3e6; ts < 6e6; ts += 1e5) {
      const e = environment(ts)
      expect(e.min).toBeLessThan(e.mean)
      expect(e.max).toBeGreaterThan(e.mean)
    }
  })

  it('narrows the spread as the Sun brightens', () => {
    // A world with no oceans and no ice cap has less to separate its poles from its deserts.
    const now = environment(0)
    const late = environment(tsAt(11.9))
    expect(late.mean).toBeGreaterThan(now.mean)
    expect(late.max - late.min).toBeLessThan(now.max - now.min)
  })

  it('stops crossing arms once there are no arms to cross', () => {
    // An elliptical has no spiral structure, so the arm term — and with it the whole
    // cosmic-ray/cloud argument — fades out with the merger rather than ticking on for ever
    // over a galaxy that no longer has arms.
    const during = environment(tsAt(12.0))
    const after = environment(tsAt(MERGE_A1 + 1))
    const later = environment(tsAt(MERGE_A1 + 3))
    expect(after.star).toBeCloseTo(1, 6)
    expect(after.cr).toBeCloseTo(later.cr, 6)
    expect(during.star).toBeGreaterThanOrEqual(1)
  })

  it('heats the Earth without pause, and boils it long before the Sun reaches it', () => {
    // Deliberately not asserting a date for the oceans going: that is a model output, and
    // the point of these tests is the shape rather than the schedule. What must hold is that
    // the temperature only ever rises from here, and that the red-giant tip is molten.
    // Not monotone, and it must not be: the arm-crossing term rides on top of the solar
    // brightening, and those dips ARE the glacial epochs. Writing this as a monotonicity
    // check was wrong, and the test said so. The trend is what rises.
    // Two gigayears apart, which is many arm crossings — enough that the oscillation cannot
    // outvote the trend. At half a gigayear it can, and does: that is the model working.
    for (let a = AGE0; a < SUN_MS_END - 2; a += 0.5) {
      const here = environment(tsAt(a)).mean
      const later = environment(tsAt(a + 2)).mean
      expect(later, `the trend fell between ${a.toFixed(1)} and ${(a + 2).toFixed(1)} Gyr`)
        .toBeGreaterThan(here)
    }
    expect(environment(tsAt(SUN_RGB_TIP)).mean).toBeGreaterThan(1000)

    // For the record: this model does not reach 100 °C until about 10.95 Gyr — just AFTER the
    // Sun leaves the main sequence, and some five gigayears later than the "oceans boil away"
    // scenario, which sits at +1 to +2 Gyr from now.
    //
    // That is not a contradiction, and it is worth knowing before the science work starts.
    // The globe's retreating seas are driven by earthEra's uSeaLevel and uDry, a staged
    // reconstruction; environment() is the separate continuous model behind the Earth panel's
    // readouts. AGENTS.md already discloses that the piece carries more than one account of
    // deep time and does not pretend they are the same claim. This pins where each one sits.
    let boils = 0
    for (let a = AGE0; a < SUN_RGB_TIP && !boils; a += 0.01)
      if (environment(tsAt(a)).mean > 100) boils = a
    expect(boils, 'the oceans never boil').toBeGreaterThan(AGE0)
    expect(boils, `the model boils the oceans at ${boils.toFixed(2)} Gyr`).toBeCloseTo(10.95, 1)
    expect(boils).toBeLessThan(SUN_RGB_TIP)
  })
})

describe('the glacial epochs — the model\'s headline claim', () => {
  // This is what the cosmic-ray coupling exists to produce, and it is the thing the science
  // work will change: the spacing follows from the corotation radius the piece uses, which is
  // not the measured one. Asserted here so that when that radius moves, the consequence shows
  // up as a failing test with a number in it rather than as a quietly different piece.
  const iceEpochs = (fromGyr: number, toGyr: number): number[] => {
    const onsets: number[] = []
    let wasIce = false
    for (let a = fromGyr; a < toGyr; a += 0.002) {
      const ice = environment(tsAt(a)).ice
      if (ice && !wasIce) onsets.push(a)
      wasIce = ice
    }
    return onsets
  }

  it('produces recurring glaciations rather than one long freeze', () => {
    const onsets = iceEpochs(AGE0 - 1, AGE0 + 1)
    expect(onsets.length, 'no glacial epochs at all').toBeGreaterThan(5)
  })

  it('spaces them at the arm-crossing cadence, about 140 Myr', () => {
    const onsets = iceEpochs(AGE0 - 1, AGE0 + 1)
    const gaps = onsets.slice(1).map((a, i) => (a - onsets[i]!) * 1000) // Myr
    const mean = gaps.reduce((x, y) => x + y, 0) / gaps.length
    expect(mean, `mean spacing is ${mean.toFixed(0)} Myr`).toBeGreaterThan(100)
    expect(mean).toBeLessThan(200)
  })

  it('says today is not one', () => {
    expect(environment(0).ice).toBe(false)
  })
})

describe('lifeState — how habitable it is', () => {
  const at = (a: number) => lifeState(a, environment(tsAt(a)))

  it('calls today excellent', () => {
    expect(at(TODAY).label).toBe('excellent')
    expect(at(TODAY).h).toBeLessThan(0.05)
  })

  it('calls the Hadean a magma ocean', () => {
    expect(at(0.2).why).toBe('magma ocean')
    expect(at(0.2).label).toBe('uninhabitable')
  })

  it('ends habitability as the Sun brightens, and never recovers it', () => {
    expect(at(6.5).label).toBe('uninhabitable')
    let worst = 0
    for (let a = 5.35; a < 12; a += 0.05) {
      const h = at(a).h
      expect(h).toBeGreaterThanOrEqual(worst - 1e-9)
      worst = Math.max(worst, h)
    }
  })

  it('keeps the hazard bounded to 0..1 across the whole history', () => {
    for (let a = 0; a < 20; a += 0.1) {
      const { h } = at(a)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(1)
    }
  })
})

describe('sfrFactor — the Galaxy\'s star formation', () => {
  it('is normalised so today is 1', () => {
    expect(sfrFactor(AGE0)).toBeCloseTo(1, 1)
  })

  it('bursts at the passages and is quenched afterwards', () => {
    expect(sfrFactor(11.45)).toBeGreaterThan(sfrFactor(AGE0))
    expect(sfrFactor(12.35)).toBeGreaterThan(sfrFactor(11.45))
    expect(sfrFactor(14)).toBeLessThan(0.2)
  })

  it('never reaches zero, so nothing downstream divides by it', () => {
    for (let a = 0; a < 30; a += 0.1) expect(sfrFactor(a)).toBeGreaterThanOrEqual(0.02)
  })
})
