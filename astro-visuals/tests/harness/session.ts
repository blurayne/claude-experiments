import type { Browser, Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ParityState } from './states'

const HERE = dirname(fileURLToPath(import.meta.url))

export const SETTINGS_KEY = 'galactic-transit.settings.v1'
export const SEED = 0x9e3779b9
/** Frozen instant: 2026-06-15T12:00:00Z. Mid-year, midday, no DST edge, no leap second. */
export const FROZEN_NOW = Date.UTC(2026, 5, 15, 12, 0, 0)

/**
 * One virtual frame. 50 ms exactly, because `frame()` clamps dt to 0.05 (galactic-transit
 * .html:5244) — the largest step that survives unclamped, so `shimT` ends up being exactly
 * the number of steps taken, and the camera eases as fast as the page will allow.
 */
export const STEP_MS = 50

/**
 * Frames run after the state is set. Three seconds of virtual time, which clears every
 * wall-time easing in the piece by a wide margin — avgLight converges in about a second, the
 * hazard colour ramp likewise, and holdBarWidth releases after exactly one. It was six
 * seconds until the dive states, which are the heaviest fragment load here, spent more than
 * three minutes on them under a software rasteriser. Frames are not free; buy only what the
 * easings actually need.
 */
export const SETTLE_FRAMES = 60

/**
 * The data files the page fetches. Serialised in this order for every run, because
 * loadGalaxyMap() and loadM31Map() each call setGalaxy() from their .then(), so whichever
 * resolves first decides where the seeded PRNG stands when the galaxy is generated. Left to
 * the network that is a race; here it is a queue.
 */
export const DATA_FILES = [
  'stars-gaia.bin',
  'stars-gaia-deep.bin',
  'galaxy-map.webp',
  'm31-map.webp',
  'earth-map.webp',
] as const

export const CHROMIUM_ARGS = [
  '--enable-unsafe-swiftshader',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--disable-lcd-text',
  '--force-device-scale-factor=1',
  '--hide-scrollbars',
  '--mute-audio',
]

export function settingsFixture(): unknown {
  return JSON.parse(readFileSync(resolve(HERE, 'settings.fixture.json'), 'utf8'))
}

interface InitArgs {
  seed: number
  now: number
  settings: unknown
  key: string
  step: number
}

/**
 * Installed before the page's own script. Pins the five things that otherwise differ between
 * two runs of the same build — see the commit that introduced this file for how each was
 * found, and scripts/smoke.mjs for the standalone proof that the result is byte-identical.
 */
function pinEverything({ seed, now, settings, key, step }: InitArgs): void {
  // A fresh profile runs the first-launch performance probe, which measures the machine and
  // picks a detail tier from the result. Booting with settings saved is what makes the star
  // count a constant rather than a benchmark score.
  if (settings) {
    try {
      localStorage.setItem(key, JSON.stringify(settings))
    } catch {
      /* storage disabled — the run will fall through to the probe and differ, loudly */
    }
  }

  // mulberry32. Determinism is the only requirement; statistical quality is not.
  let a = seed >>> 0
  Math.random = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const RealDate = Date
  class FrozenDate extends RealDate {
    constructor(...args: unknown[]) {
      // `new Date()` is frozen; `new Date(x)` is not, because the page parses its own build
      // stamp with the one-argument form.
      if (args.length === 0) super(now)
      else super(...(args as [number]))
    }
    static override now(): number {
      return now
    }
  }
  ;(globalThis as { Date: unknown }).Date = FrozenDate

  // The frame clock. Only the TIMESTAMP is replaced, never the loop: Playwright's screenshot
  // stabilisation waits on rAF too, and the canvas has no preserveDrawingBuffer, so
  // intercepting the loop deadlocks the shot and empties the drawing buffer.
  //
  // The page sees a clock ticking exactly one step per frame that stops dead at a cap.
  // __arm(k) restarts the count at zero, so the clock jumps backwards once — deliberately.
  // The simulation clock is paused, so that single negative dt lands only on the wall-time
  // accumulators (shimT above all), and it lands on them exactly hard enough to cancel what
  // they picked up during boot. After k more steps shimT is k*step ms in every run.
  let n = 0
  let cap = Infinity
  const realRaf = globalThis.requestAnimationFrame.bind(globalThis)
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    realRaf(() => cb(Math.min(n++, cap) * step))
  performance.now = () => Math.min(n, cap) * step
  ;(globalThis as Record<string, unknown>).__arm = (k: number) => {
    n = 0
    cap = k
  }
  ;(globalThis as Record<string, unknown>).__frames = () => ({ n, cap, done: n > cap })
}

export interface CaptureResult {
  png: Buffer
  errors: string[]
  simT: number
  camera: Record<string, number | boolean>
  /**
   * What the state actually turned out to exercise. Reported rather than assumed: which
   * scenario lands inside a glacial epoch is a property of the climate model, not something
   * worth guessing at, and the plan requires at least one frame with the ice styling live.
   */
  flags: { ice: boolean; tip: boolean; panels: number }
}

/**
 * Boot the page, drive it to one state, and photograph it reproducibly.
 *
 * Everything here is ordered, and the order is the point:
 *   fetches land before any frame runs, so the PRNG is in the same place;
 *   the tour is dismissed before the clock is stopped, because dismissing it starts the clock;
 *   the camera is landed exactly on its goal rather than however close the easing got;
 *   only then is the frame budget armed, so the wall-time accumulators start from zero.
 */
export async function capture(browser: Browser, url: string, state: ParityState): Promise<CaptureResult> {
  const page = await browser.newPage({
    viewport: state.viewport ?? { width: 960, height: 600 },
    deviceScaleFactor: 1,
    reducedMotion: state.reducedMotion ?? 'reduce',
    timezoneId: state.timezone ?? 'UTC',
    locale: 'en-GB',
  })

  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })

  let chain: Promise<void> = Promise.resolve()
  for (const name of DATA_FILES) {
    await page.route(`**/${name}`, async (route) => {
      const mine = chain
      let release!: () => void
      chain = new Promise<void>((r) => (release = r))
      await mine
      await route.continue()
      release()
    })
  }

  await page.addInitScript(pinEverything, {
    seed: SEED,
    now: FROZEN_NOW,
    settings: state.freshProfile ? null : settingsFixture(),
    key: SETTINGS_KEY,
    step: STEP_MS,
  })

  await page.goto(url, { waitUntil: 'load' })
  await page.waitForLoadState('networkidle')

  const runFrames = async (k: number): Promise<void> => {
    await page.evaluate((v) => (globalThis as Record<string, (n: number) => void>).__arm!(v), k)
    await page.waitForFunction(
      () => (globalThis as Record<string, () => { done: boolean }>).__frames!().done,
      undefined,
      { timeout: 600_000, polling: 100 },
    )
  }

  await runFrames(20)

  if (await page.locator('#tourGo').isVisible().catch(() => false)) await page.locator('#tourGo').click()

  // `toggle($('tPause'), on => paused = !on)`: the button carries class `on` while RUNNING.
  const stopClock = async (): Promise<void> => {
    if (await page.evaluate(() => document.getElementById('tPause')!.classList.contains('on')))
      await page.evaluate(() => document.getElementById('tPause')!.click())
  }
  await stopClock()

  if (state.scenario !== null) {
    if (!(await page.locator('#jump').isVisible().catch(() => false))) await page.click('#simPlus')
    await page.selectOption('#jump', state.scenario)
    await page.click('#jumpGo')
    await stopClock()
  }

  for (const selector of state.after ?? []) await page.locator(selector).first().click()

  // Land the camera exactly on its goal, so its last digits are a constant rather than
  // wherever an asymptotic ease happened to stop.
  await page.evaluate(() => {
    document.getElementById('dbgExport')!.click()
    const box = document.getElementById('dbgText') as HTMLTextAreaElement
    const s = JSON.parse(box.value)
    s.camera.dist = s.camera.distGoal
    box.value = JSON.stringify(s)
    document.getElementById('dbgImport')!.click()
  })

  await runFrames(SETTLE_FRAMES)

  const png = await page.screenshot({ type: 'png', animations: 'disabled' })

  await page.evaluate(() => document.getElementById('dbgExport')!.click())
  const reported = JSON.parse(await page.inputValue('#dbgText'))

  const flags = await page.evaluate(() => ({
    ice: document.body.classList.contains('ice') ||
         getComputedStyle(document.body).getPropertyValue('--iceA').trim() > '0',
    tip: (document.getElementById('tip')?.offsetParent ?? null) !== null,
    panels: document.querySelectorAll('.panel:not([style*="display: none"])').length,
  }))

  await page.close()
  return { png, errors, simT: reported.time?.simT, camera: reported.camera, flags }
}
