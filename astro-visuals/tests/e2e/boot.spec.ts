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
