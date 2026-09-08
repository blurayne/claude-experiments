import { test, expect } from '@playwright/test'
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
