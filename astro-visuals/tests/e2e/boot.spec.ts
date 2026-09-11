import { test, expect } from '@playwright/test'
import { PNG } from 'pngjs'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOOT_IDS, MARKUP_ONLY_IDS } from '../harness/boot-ids'
import { settingsFixture, SETTINGS_KEY } from '../harness/session'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')

/**
 * The layer a parse check cannot reach.
 *
 * Three releases died here. v2.60.0 moved markup and an id the script set a property on
 * stopped existing — the page parses fine, and dies at boot. v2.62.0 shipped a `let` moved
 * inside an `else` while a line below still read it: a ReferenceError every frame, and the
 * clock simply never advanced. Two more shipped a service worker with two `const V` lines,
 * which the page's own parse check never sees because the worker is a separate file, and a
 * syntax error there fails the install silently: the page runs, offline and caching do not.
 *
 * These tests run before the parity project, because there is no point photographing a page
 * that is already broken.
 */

test.describe('boot', () => {
  test('the page boots with no errors of any kind', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    await page.waitForTimeout(2000) // let the async loaders and the first frames run

    expect(errors, errors.join('\n')).toEqual([])
  })

  test('every id the script addresses resolves', async ({ page }) => {
    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))

    const missing = await page.evaluate(
      (ids) => ids.filter((id) => !document.getElementById(id)),
      [...BOOT_IDS, ...MARKUP_ONLY_IDS],
    )
    expect(missing, `ids addressed by the script but absent from the DOM: ${missing.join(', ')}`).toEqual([])
  })

  /**
   * The same question asked the other way round, and it is not the same test.
   *
   * BOOT_IDS is curated on purpose — a list derived from the file it is testing proves
   * nothing about drift in the markup. But it cannot see an id the script has just STARTED
   * asking for, and a mechanical rename can invent one: `$('hudHz')` became `$('hud.hudHz')`
   * when a flag called `hudHz` moved onto an object, because a regex over identifiers does not
   * know it is inside a string. tsc saw nothing, check-names saw nothing, and the page died on
   * a null at boot with no clue as to which id.
   *
   * So: pull every id literal out of the built page and check each one resolves.
   */
  test('every id literal in the built page resolves', async ({ page }) => {
    const html = readFileSync(resolve(ROOT, 'galactic-transit.html'), 'utf8')
    const ids = new Set<string>()
    // The id is whatever is between the quotes, NOT a pattern of what an id may look like.
    // The first version of this required [A-Za-z][\w-]*, which quietly skipped
    // `$('hud.hudHz')` — the exact call it was written to catch, because a dot is not in
    // that class. A guard that cannot see the bug that motivated it is decoration.
    for (const m of html.matchAll(/(?:\$|getElementById)\(\s*['"]([^'"]+)['"]\s*\)/g)) ids.add(m[1])
    expect(ids.size, 'no id literals found — the extraction pattern has gone stale').toBeGreaterThan(100)

    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    // #tip is created at runtime by ui/tooltips, so it is not in the markup.
    const missing = await page.evaluate((list) => list.filter((id) => !document.getElementById(id)), [...ids])
    expect(missing, `the script asks for ids that do not exist: ${missing.join(', ')}`).toEqual([])
  })

  test('no id is declared twice', async ({ page }) => {
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    const dupes = await page.evaluate(() => {
      const seen = new Map<string, number>()
      for (const el of document.querySelectorAll('[id]')) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id)
    })
    expect(dupes, `duplicate ids: ${dupes.join(', ')}`).toEqual([])
  })

  test('every stepper points at a slider that exists', async ({ page }) => {
    // `data-step` is a third copy of every slider id, alongside the markup and S_SLD. A
    // stepper whose target was renamed throws inside the shared handler, and a `.stepb`
    // without `data-step` threw for real in v2.62.0.
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll('.stepb')]
        .map((b) => (b as HTMLElement).dataset.step)
        .filter((s): s is string => !!s)
        .map((s) => s.split(':')[0]!)
        .filter((id) => !document.getElementById(id)),
    )
    expect(broken, `steppers pointing at missing sliders: ${broken.join(', ')}`).toEqual([])
  })

  test('the settings fixture is actually restored, not silently dropped', async ({ page }) => {
    // 00-PLAN.md ranks this the highest-risk failure mode in the file: restoreSettings()
    // replays saved state through synthetic input/change/click events, so if any listener is
    // not yet registered the page boots clean, throws nothing, logs nothing — and renders
    // with defaults. Every parity screenshot boots from this fixture, so if the replay breaks
    // the whole gate silently changes meaning. Assert it directly as well.
    const fixture = settingsFixture() as { t: Record<string, boolean>; s: Record<string, string>; dens: number }

    await page.addInitScript(
      ({ settings, key }) => localStorage.setItem(key, JSON.stringify(settings)),
      { settings: fixture, key: SETTINGS_KEY },
    )
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    await page.waitForTimeout(1500)

    const sliders = await page.evaluate(
      (ids) => Object.fromEntries(ids.map((id) => [id, (document.getElementById(id) as HTMLInputElement)?.value])),
      Object.keys(fixture.s),
    )
    expect(sliders, 'sliders did not take the saved values').toMatchObject(fixture.s)

    // S_TOG is not one kind of control. Some entries are <button> toggles carrying an `on`
    // class, others are real checkboxes — the page reads both through one `isOn()` helper,
    // and `toggle()` exists precisely so call sites never have to care which. A test that
    // assumed the class form reported every checkbox as off.
    const toggles = await page.evaluate(
      (ids) =>
        Object.fromEntries(
          ids.map((id) => {
            const el = document.getElementById(id)
            return [id, el instanceof HTMLInputElement ? el.checked : !!el?.classList.contains('on')]
          }),
        ),
      Object.keys(fixture.t),
    )
    expect(toggles, 'toggles did not take the saved values').toMatchObject(fixture.t)
  })

  test('the service worker parses, and declares its cache name exactly once', async () => {
    const sw = readFileSync(resolve(ROOT, 'sw.js'), 'utf8')

    // Two releases shipped a worker with two `const V` lines — a rebase's keep-both
    // resolution of the version line. The page's own parse check cannot see it, and the
    // install fails silently: the page runs, offline and caching do not.
    const versionLines = sw.match(/^const V = /gm) ?? []
    expect(versionLines.length, `sw.js declares its cache name ${versionLines.length} times`).toBe(1)

    expect(() => new Function(sw), 'sw.js does not parse').not.toThrow()
  })
})

/**
 * The first visit, which the parity gate deliberately does not photograph.
 *
 * A fresh profile runs the performance probe, and the probe MEASURES THE MACHINE: it draws
 * the galaxy's star pass into a hidden framebuffer for thirty milliseconds and picks a detail
 * tier from how far it got. Photographing that twice runs the benchmark twice and can
 * legitimately get two answers — it came back 35% of the frame different at max Δ254, which
 * is not a rendering difference but a different number of stars. So this path is asserted for
 * what it should actually guarantee: that it runs, picks a tier, saves it, and stages the
 * opening without throwing.
 *
 * 00-PLAN.md wants this covered (R4, R16, R22): the !hadSaved branch of restoreSettings, the
 * detail default at boot that decides the star count, and the probe firing on frame three.
 */
test.describe('the first visit', () => {
  test('runs the probe, picks a tier, and stages the opening without error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

    // No addInitScript writing settings: this is the point of the test.
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))

    // The tour is shown only when nothing is saved, on a 400 ms timer — so its appearance is
    // itself evidence that the page took the first-visit branch.
    await page.waitForSelector('#tourGo', { state: 'visible', timeout: 30_000 })
    await page.locator('#tourGo').click()

    // The probe runs on the third rendered frame and writes its result to probeInfo.
    await page.waitForFunction(
      () => {
        const g = (globalThis as Record<string, unknown>).__gt as { probeInfo?: unknown } | undefined
        return !!g?.probeInfo
      },
      undefined,
      { timeout: 60_000 },
    )

    const probe = await page.evaluate(() => {
      const g = (globalThis as Record<string, unknown>).__gt as { probeInfo?: Record<string, unknown>; curD?: number }
      return { info: g.probeInfo, curD: g.curD }
    })

    // DETAIL_D — the tier ladder. The probe is documented never to pick above medium, because
    // the heavy tiers fetch and build for seconds and that is a choice, not a default.
    expect([1, 5, 20, 40, 80, 160]).toContain(probe.curD)
    expect(probe.curD!, 'the probe picked a tier above medium as a first-launch default').toBeLessThanOrEqual(20)
    expect(probe.info).toBeTruthy()

    // And it saved what it decided, so it never runs twice.
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), SETTINGS_KEY)
    expect(saved, 'the first visit saved no settings, so the probe would run again').toBeTruthy()
    expect([1, 5, 20, 40, 80, 160]).toContain(saved.dens)

    expect(errors, errors.join('\n')).toEqual([])
  })
})

/**
 * Sound, which the parity gate cannot see.
 *
 * Everything else in this refactor is guarded by comparing pixels, and audio moves none. A
 * broken graph, a track that never loads, a volume slider wired to nothing — all of them look
 * exactly like a working page in a screenshot. So the audio module gets its own assertions
 * before it is extracted, and they are black-box: drive the controls a visitor drives, and
 * check what a visitor would notice.
 *
 * Headless Chromium is started with --mute-audio, so nothing is heard; the graph is still
 * built and the elements still update, which is what these check.
 */
test.describe('sound', () => {
  test('names a track, advances to the next, and raises no errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))

    // Everything is driven through evaluate rather than by clicking. The audio controls live
    // in a panel that opens folded, inside a section that starts closed, and none of that is
    // what this test is about — a click waiting on visibility took fifteen minutes and then
    // failed on the one control that happened to be off-screen.
    const named = async (): Promise<string> =>
      (await page.evaluate(() => document.getElementById('trackName')!.textContent)) ?? ''

    // "1/3 · <title>" as soon as a track is loaded.
    await page.waitForFunction(() => /^\d+\/\d+ · .+/.test(document.getElementById('trackName')!.textContent ?? ''),
      undefined, { timeout: 60_000 })
    const first = await named()

    await page.evaluate(() => document.getElementById('tNext')!.click())
    await page.waitForFunction((was) => document.getElementById('trackName')!.textContent !== was,
      first, { timeout: 60_000 })

    // Volume zero reads "off" and IS the switch — there is no separate toggle, which is a
    // deliberate design rule and the kind of thing a refactor can quietly undo.
    const setSlider = (id: string, v: string) =>
      page.evaluate(({ id, v }) => {
        const el = document.getElementById(id) as HTMLInputElement
        el.value = v
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }, { id, v })

    await setSlider('musicVol', '0')
    expect(await page.evaluate(() => document.getElementById('musicVolv')!.textContent)).toBe('off')

    await setSlider('sfxVol', '0.5')
    expect(await page.evaluate(() => document.getElementById('sfxVolv')!.textContent)).toBe('50%')

    await setSlider('sfxVol', '0')
    expect(await page.evaluate(() => document.getElementById('sfxVolv')!.textContent)).toBe('off')

    expect(errors, errors.join('\n')).toEqual([])
  })
})

/**
 * The stellar life cycle, covered before it is moved.
 *
 * The parity gate cannot see any of this. Its settings fixture has `tEvSN` and `tEvBirth`
 * off in all twenty-three states, which is the honest default — the events are opt-in — and
 * it means the birth of a cluster, the collapse of a supergiant, the blast, the expanding
 * remnant and the fading white dwarf are drawn by code no screenshot ever exercises. Moving
 * that code out of main.ts with only "it still compiles" behind it is exactly the bargain
 * this project does not take, so the switches get driven here instead.
 *
 * Black-box, like the sound tests: turn on what a visitor turns on, wind the clock the way
 * the speed controls wind it, and check that events actually appear and nothing throws.
 */
test.describe('the life cycle', () => {
  test('births and deaths accumulate, and draw without error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))

    // The tour covers the screen, and dismissing it is also what starts the clock.
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()

    // A million years a second: below that the rates are drawn from so little simulated time
    // that nothing is born inside a test's patience. This is the multiplier the galactic
    // scenarios use, driven through its own control.
    await page.evaluate(() => {
      const mult = document.getElementById('multExp') as HTMLInputElement
      mult.value = '6'
      mult.dispatchEvent(new Event('input', { bubbles: true }))
      document.getElementById('tEvSN')!.click()
      document.getElementById('tEvBirth')!.click()
    })

    // Something must be alive within a few seconds of galactic time.
    await page.waitForFunction(() => (globalThis as { __gt?: { lifeCounts: { events: number } } })
      .__gt!.lifeCounts.events > 0, undefined, { timeout: 60_000 })

    // And the shells too: a supergiant takes ~1 Myr of simulated time to collapse, the blast
    // runs 1.6 s of wall time, and only then is a remnant pushed. Give it room; if nothing
    // ever arrives, the chain from birth to remnant is broken somewhere.
    await page.waitForFunction(() => (globalThis as { __gt?: { lifeCounts: { puffs: number } } })
      .__gt!.lifeCounts.puffs > 0, undefined, { timeout: 120_000 })

    expect(errors, errors.join('\n')).toEqual([])
  })
})

/**
 * The rotation's sense, pinned.
 *
 * Seen from the north galactic pole the Milky Way turns CLOCKWISE — Oort's 1927 velocity
 * pattern, the reflex motion of Sgr A*, and Gaia's proper motions all say so, and the
 * explainer shipped at docs/how-the-milky-way-turns.html walks through the evidence. This
 * scene's frame puts north on +y (tools/build_athyg_stars.py), so a camera at positive pitch
 * looks down from the north side.
 *
 * The question was raised once as "the rotation is wrong", and answering it took a day of
 * measurement, because the scene STORES a mirrored universe (the l=90/north/−centre frame has
 * determinant −1) and SKY_MIRROR mirrors the projection back — any check made in scene
 * coordinates alone reads backwards. So the sense is pinned here at the only level that
 * cannot deceive: what a viewer actually sees. The arm labels ride the pattern through the
 * page's own projection; over 40 Myr each must sweep clockwise about the screen centre.
 */
test.describe('the panels obey the pointer', () => {
  test('settings accordions answer real clicks', async ({ page }) => {
    // The panel swipe handler used to capture the pointer on the plain-div section
    // headers, retargeting their clicks to the panel itself — so the accordions read as
    // dead. Synthetic .click() calls bypass hit-testing, so only REAL pointer clicks
    // catch it. (The log tab this once also guarded is gone: in v3.9 the log moved into
    // the debug panel, and the settings panel has no tab strip left to hijack.)
    await page.setViewportSize({ width: 1400, height: 1000 })
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()
    await page.evaluate(() => document.getElementById('reopen')?.click())
    await page.waitForTimeout(500)
    for (const sec of ['audio', 'hud'] as const) {
      await page.locator(`.sect[data-sec="${sec}"]`).click()
      await page.waitForTimeout(250)
      expect(await page.evaluate((k) => !document.getElementById(k)!.classList.contains('closed'),
        sec === 'audio' ? 'secAudio' : 'secHud'), `${sec} section did not open`).toBe(true)
    }
  })
})

/**
 * The debug switch under Other (v3.11.0). The hold on the "?" remains, but the mode is
 * also a checkbox now — and both doors go through setDebugMode, so the box must mirror
 * the mode whichever way it was entered, and flipping it must persist the flag that a
 * settings reset deliberately keeps.
 */
test.describe('the debug switch', () => {
  test('the checkbox flips the mode both ways and persists the flag', async ({ page }) => {
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()

    // a plain boot arrives outside the mode: box unticked, tuning rows hidden
    expect(await page.evaluate(() => (document.getElementById('tDebug') as HTMLInputElement).checked)).toBe(false)
    expect(await page.evaluate(() => document.getElementById('rowHudHz')!.style.display)).toBe('none')

    // ticking it is entering: the tuning rows appear, the debug panel opens, the flag is written
    await page.evaluate(() => {
      const c = document.getElementById('tDebug') as HTMLInputElement
      c.checked = true; c.dispatchEvent(new Event('change'))
    })
    expect(await page.evaluate(() => document.getElementById('rowHudHz')!.style.display)).toBe('')
    expect(await page.evaluate(() => localStorage.getItem('galactic-transit.debug'))).toBe('1')

    // unticking leaves the mode and remembers that too
    await page.evaluate(() => {
      const c = document.getElementById('tDebug') as HTMLInputElement
      c.checked = false; c.dispatchEvent(new Event('change'))
    })
    expect(await page.evaluate(() => document.getElementById('rowHudHz')!.style.display)).toBe('none')
    expect(await page.evaluate(() => localStorage.getItem('galactic-transit.debug'))).toBe('0')
  })

  test('a ?debug boot arrives with the box already ticked', async ({ page }) => {
    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    expect(await page.evaluate(() => (document.getElementById('tDebug') as HTMLInputElement).checked)).toBe(true)
  })
})

test.describe('the hold gesture', () => {
  test('a 3-second hold on "?" enters debug mode and warns from halfway; a short press does not', async ({ page }) => {
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()

    const info = page.locator('#tInfo')
    const box = (await info.boundingBox())!
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2

    // A short press does not enter debug mode. (It also schedules the About dialog to open
    // 340ms after release — the next pointerdown below cancels that pending open, the same
    // way it always has, so it never actually appears.)
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.waitForTimeout(500)
    await page.mouse.up()
    await page.waitForTimeout(100)
    expect(await page.evaluate(() => (document.getElementById('tDebug') as HTMLInputElement).checked)).toBe(false)

    // Held past 1.5s: the button glows its warning.
    await page.mouse.down()
    await page.waitForTimeout(1700)
    expect(await info.evaluate((el) => el.classList.contains('holdWarn'))).toBe(true)

    // Held to 3s: debug mode is entered, and on this non-touch context the panel opens too.
    await page.waitForTimeout(1500)
    await page.mouse.up()
    expect(await page.evaluate(() => (document.getElementById('tDebug') as HTMLInputElement).checked)).toBe(true)
    expect(await info.evaluate((el) => el.classList.contains('holding'))).toBe(false)
    expect(await page.evaluate(() => (document.getElementById('dbgPanel') as HTMLElement).style.display)).toBe('')
  })
})

test.describe('the panels dock', () => {
  test('a downward swipe parks a panel at the foot of its column, an upward one brings it back', async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 950 })
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()
    await page.waitForTimeout(700)
    const topOf = () => page.evaluate(() => Math.round(document.getElementById('env')!.getBoundingClientRect().top))
    const swipe = async (dy: number) => {
      const b = (await page.locator('#env').boundingBox())!
      await page.mouse.move(b.x + b.width / 2, b.y + 14)
      await page.mouse.down()
      for (let i = 1; i <= 8; i++) await page.mouse.move(b.x + b.width / 2, b.y + 14 + (dy / 8) * i)
      await page.mouse.up()
      await page.waitForTimeout(800)
    }
    const started = await topOf()
    expect(started).toBeLessThan(60)                 // begins at the head of its column
    await swipe(112)
    const docked = await topOf()
    expect(docked, 'the panel did not travel to the foot').toBeGreaterThan(600)
    // it must clear the bottom furniture: status bar, scale bar, QR
    const h = await page.evaluate(() => Math.round(document.getElementById('env')!.getBoundingClientRect().height))
    expect(docked + h).toBeLessThan(950 - 40)
    await swipe(-112)
    expect(await topOf(), 'the panel did not come back up').toBeLessThan(60)
  })
})

test.describe('the rotation sense', () => {
  test('from the north galactic pole, the disk turns clockwise on screen', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 })
    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()

    const armsAt = async (simT: number) => {
      await page.evaluate((t) => {
        const state = {
          app: 'galactic-transit',
          time: { simT: t, paused: true },
          camera: { yaw: 0, pitch: 1.45, dist: 3000, distGoal: 3000, follow: false, coreLock: false, dive: false },
        }
        ;(document.getElementById('dbgText') as HTMLTextAreaElement).value = JSON.stringify(state)
        document.getElementById('dbgImport')!.click()
      }, simT)
      // labels ease toward their targets; give them time to land
      await page.waitForTimeout(2500)
      return page.evaluate(() => {
        const out: Record<string, [number, number]> = {}
        for (const el of document.querySelectorAll('#labels .armlbl')) {
          const e = el as HTMLElement
          if (e.style.display === 'none' || !e.textContent) continue
          out[e.textContent] = [parseFloat(e.style.left), parseFloat(e.style.top)]
        }
        return out
      })
    }

    const a = await armsAt(0)
    const b = await armsAt(40e6)
    const cx = 450, cy = 450
    let clockwise = 0, counter = 0
    // .armlbl also dresses Andromeda, her companions and Milkomeda, whose labels move with
    // the ORBIT, not the disk — only the Milky Way's own arms may vote. The bar label sits
    // near the centre, where its lever arm is noise.
    const ARMS_ONLY = ['Orion Spur', 'Sagittarius–Carina', 'Perseus', 'Scutum–Centaurus', 'Outer Arm']
    for (const k of ARMS_ONLY) {
      if (!a[k] || !b[k]) continue
      const [x0, y0] = a[k]!, [x1, y1] = b[k]!
      // screen y grows downward, so a positive cross product is a CLOCKWISE sweep
      const cross = (x0 - cx) * (y1 - cy) - (y0 - cy) * (x1 - cx)
      if (Math.abs(cross) < 1) continue // did not move measurably; no vote
      cross > 0 ? clockwise++ : counter++
    }
    expect(clockwise, 'no arm label moved measurably — the probe has gone stale').toBeGreaterThan(0)
    expect(counter, 'an arm label swept COUNTERCLOCKWISE seen from the north pole').toBe(0)
  })

  test('the galaxy spin lock freezes the arm pattern on screen', async ({ page }) => {
    // The counterpart of the sweep test above: with the spin lock ticked in the galaxy
    // view the camera rides the bar pattern, so over the same 40 Myr that sweeps every
    // label clockwise when unlocked, each label must now hold its screen position. This
    // is what makes the arm-evolution scenario watchable at all.
    await page.setViewportSize({ width: 900, height: 900 })
    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()

    const armsAt = async (simT: number) => {
      await page.evaluate((t) => {
        const state = {
          app: 'galactic-transit',
          time: { simT: t, paused: true },
          camera: { yaw: 0, pitch: 1.45, dist: 3000, distGoal: 3000, follow: false, coreLock: false, dive: false },
        }
        ;(document.getElementById('dbgText') as HTMLTextAreaElement).value = JSON.stringify(state)
        document.getElementById('dbgImport')!.click()
      }, simT)
      await page.waitForTimeout(2500)
      return page.evaluate(() => {
        const out: Record<string, [number, number]> = {}
        for (const el of document.querySelectorAll('#labels .armlbl')) {
          const e = el as HTMLElement
          if (e.style.display === 'none' || !e.textContent) continue
          out[e.textContent] = [parseFloat(e.style.left), parseFloat(e.style.top)]
        }
        return out
      })
    }

    await armsAt(0)   // land in the galaxy view first: the lock toggle reads cam.follow
    await page.evaluate(() => {
      const c = document.getElementById('tSpinLock') as HTMLInputElement
      if (!c.checked) { c.checked = true; c.dispatchEvent(new Event('change')) }
    })
    const a = await armsAt(0)
    const b = await armsAt(40e6)
    const ARMS_ONLY = ['Sagittarius–Carina', 'Perseus', 'Scutum–Centaurus', 'Outer Arm']
    let held = 0
    for (const k of ARMS_ONLY) {
      if (!a[k] || !b[k]) continue
      const d = Math.hypot(a[k]![0] - b[k]![0], a[k]![1] - b[k]![1])
      expect(d, `${k} drifted ${d.toFixed(1)} px under the spin lock`).toBeLessThan(10)
      held++
    }
    expect(held, 'no arm label was visible in both frames — the probe has gone stale').toBeGreaterThan(1)
  })

  test('the arms trail: the drawn spiral winds against the rotation', async ({ page }) => {
    // The whole chain in one pixel measurement: map asset, ingest reflection, shader,
    // mirrored projection. Fit a two-armed logarithmic spiral of the coded pitch to the
    // rendered brightness at its best phase, once wound trailing and once leading; the
    // trailing fit must win. A user caught this backwards by eye in v3.1 — the shipped
    // illustration winds outward-clockwise and an ingest comment claimed the mirror had
    // been "measured" — so the winding is now pinned at the only level that cannot lie.
    await page.setViewportSize({ width: 900, height: 900 })
    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()
    await page.evaluate(() => {
      const state = { app: 'galactic-transit', time: { simT: 0, paused: true },
        camera: { yaw: 0, pitch: 1.45, dist: 3000, distGoal: 3000, follow: false, coreLock: false, dive: false } }
      ;(document.getElementById('dbgText') as HTMLTextAreaElement).value = JSON.stringify(state)
      document.getElementById('dbgImport')!.click()
    })
    await page.waitForTimeout(3500)
    const shot = PNG.sync.read(await page.locator('#gl').screenshot())
    const { width: W, height: H, data } = shot
    const cx = W / 2, cy = H / 2
    const kPx = (H / 1.1547) / 3000            // px per scene unit at dist 3000
    const PITCH = Math.tan(12.5 * Math.PI / 180)
    const lum = (r: number, psi: number): number | null => {
      // scene (x,z) -> screen: x mirrored to the left, +z down (north-pole view)
      const sx = Math.round(cx - kPx * r * Math.sin(psi)), sy = Math.round(cy + kPx * r * Math.cos(psi))
      if (sx < 2 || sx >= W - 2 || sy < 2 || sy >= H - 2) return null
      const i = (sy * W + sx) * 4
      return data[i]! + data[i + 1]! + data[i + 2]!
    }
    const score = (sgn: number): number => {
      let best = -1
      for (let pk = 0; pk < 72; pk++) {
        const ph = pk / 72 * 2 * Math.PI
        let tot = 0, n = 0
        for (let arm = 0; arm < 2; arm++) {
          for (let r = 600; r < 1300; r += 15) {
            const b = lum(r, ph + arm * Math.PI + sgn * Math.log(r / 500) / PITCH)
            if (b !== null) { tot += b; n++ }
          }
        }
        best = Math.max(best, tot / Math.max(n, 1))
      }
      return best
    }
    const trailing = score(-1), leading = score(+1)
    expect(trailing, `trailing fit ${trailing.toFixed(1)} vs leading ${leading.toFixed(1)} — the drawn spiral winds WITH the rotation`)
      .toBeGreaterThan(leading * 1.1)
  })
})
