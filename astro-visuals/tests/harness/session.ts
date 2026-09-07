import { chromium } from '@playwright/test'
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
 * Frames run after the state is set — two seconds of virtual time.
 *
 * Every wall-time easing in the piece is comfortably inside that: avgLight moves 0.2 of the
 * remaining distance per frame and is 99% converged in twenty-three, the hazard colour ramp
 * behaves the same way, and holdBarWidth releases after exactly one second. Frames are not
 * free, so buy what the easings need and no more: this was six seconds, then three, and the
 * globe states — the heaviest fragment load here, about a frame a second under a software
 * rasteriser, and now photographed twice per test — were still timing out at three.
 *
 * Changing this number is cheap precisely because there are no stored baselines. Both shots
 * move together, so a harness parameter cannot silently invalidate a reference.
 */
export const SETTLE_FRAMES = 40

/** Frames after the `after` clicks — enough to lay out and draw, not enough to time anything out. */
export const POST_ACTION_FRAMES = 3

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
  // The page sees a clock that ticks exactly one step per frame and then stops dead at a cap.
  // Two details make it actually deterministic, and both were learned by watching the gate
  // fail on a different state each run:
  //
  //  - The tick counts REAL ANIMATION FRAMES, not requestAnimationFrame calls. The page
  //    registers rAF from three places, one of them a nested pair in drawTourLines
  //    (main.ts:3624), and Playwright's own stabilisation registers more. Counting calls made
  //    the clock run at a rate that depended on how much the tour had redrawn, which showed
  //    up as the entire Milky Way twinkling out of phase while the solar system in front of
  //    it stayed pixel-identical. De-duplicating on the underlying timestamp gives every
  //    callback in one frame the same virtual time, and advances it once.
  //
  //  - The clock starts STOPPED (cap 0), not free-running. Whatever happens between page load
  //    and the first __arm — network, worker scheduling, the tour's own timers — must not
  //    advance anything, or the wall-time accumulators start from a value that depends on how
  //    busy the machine was.
  //
  // __arm(k) then restarts the count at zero, so the clock jumps backwards once. That is
  // deliberate: the simulation clock is paused, so the single negative dt lands only on the
  // wall-time accumulators and lands on them exactly hard enough to cancel what they picked
  // up earlier. After k more steps shimT is k*step ms in every run, on any machine.
  let n = 0
  let cap = 0
  let lastRealFrame = -1
  const realRaf = globalThis.requestAnimationFrame.bind(globalThis)
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    realRaf((t) => {
      if (t !== lastRealFrame) {
        lastRealFrame = t
        n++
      }
      cb(Math.min(n, cap) * step)
    })
  performance.now = () => Math.min(n, cap) * step
  globalThis.__arm = (k: number) => {
    n = 0
    cap = k
    // Forget which real frame was last counted, or the budget can come up one short.
    // The page registers two rAF callbacks within a single frame in places (drawTourLines
    // nests a pair), and if such a pair straddles this call, the one that runs after it sees
    // a timestamp equal to lastRealFrame and does not advance the count. That makes the
    // budget k or k−1 depending on timing — a DISCRETE difference, which is what a state
    // producing exactly two possible renderings looks like, and it produced exactly the same
    // differing-pixel count across runs weeks of debugging apart.
    lastRealFrame = -1
  }
  globalThis.__frames = () => ({ n, cap, done: n > cap })

  // The (i) tooltip hides itself eight seconds after it opens — on a real timer, not the
  // frame clock, so it is the one thing the virtual clock cannot hold still. Under a software
  // rasteriser the settle and the screenshot together can outrun it, which would make the
  // tooltip state pass or fail on how busy the machine was. `setTimeout(hideTip, 8000)` at
  // main.ts:3450 is the only 8000 ms timer in the page, so it can be suppressed by its delay
  // alone, identically for both builds. Nothing else in the page uses that delay.
  const realSetTimeout = globalThis.setTimeout.bind(globalThis)
  globalThis.setTimeout = ((fn: TimerHandler, ms?: number, ...rest: unknown[]) =>
    ms === 8000 ? 0 : realSetTimeout(fn, ms, ...rest)) as typeof globalThis.setTimeout
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
  /** The page's own __gt readout, when the build under test publishes one. */
  debug: Record<string, unknown> | null
}

/**
 * Boot the page, drive it to one state, and photograph it reproducibly.
 *
 * Each capture gets a browser process of its own rather than sharing Playwright's
 * worker-scoped one. That is not tidiness: the same state photographed as one test of
 * twenty-four came out 16% of pixels different from the same state photographed alone, with
 * the same numbers every time in each mode — reproducible within a mode, different between
 * them. A software rasteriser accumulating state across two dozen WebGL contexts in one
 * process is exactly the sort of thing that does that, and a gate whose answer depends on how
 * many tests preceded it is not a gate. A process per capture costs about a second against a
 * minute of rendering.
 *
 * Everything here is ordered, and the order is the point:
 *   fetches land before any frame runs, so the PRNG is in the same place;
 *   the tour is dismissed before the clock is stopped, because dismissing it starts the clock;
 *   the camera is landed exactly on its goal rather than however close the easing got;
 *   only then is the frame budget armed, so the wall-time accumulators start from zero.
 */
export async function capture(url: string, state: ParityState): Promise<CaptureResult> {
  const browser = await chromium.launch({ args: CHROMIUM_ARGS })
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
    await page.evaluate((v) => globalThis.__arm(v), k)
    await page.waitForFunction(
      () => globalThis.__frames().done,
      undefined,
      { timeout: 600_000, polling: 100 },
    )
  }

  // The first-run tour appears ONLY when nothing is saved — `!hadSaved && !TOURKEY`, on a
  // 400 ms real timer (main.ts:4317). So it is waited for on exactly the state that gets one
  // and never looked for on the rest, rather than sampled with an isVisible() that answers
  // "not yet" as confidently as "never".
  if (state.freshProfile) {
    await page.waitForSelector('#tourGo', { state: 'visible', timeout: 30_000 })
    await page.locator('#tourGo').click()
  }

  // `toggle($('tPause'), on => paused = !on)`: the button carries class `on` while RUNNING.
  // Dismissing the tour starts the clock, so this comes after it.
  //
  // Stopped BEFORE any frames are armed, and that ordering is the fix for a real flake. On
  // `motion-allowed` the piece is permitted to run its own clock, so simT advanced during the
  // first frame budget — and boot schedules refillTrails on a 90 ms real timer, which then
  // sampled the trails at whatever clock reading it happened to land on. 22% of the frame,
  // differing run to run. With the clock stopped first, simT is a constant in every state and
  // no real-time debounce can reach it. The branch R24 cares about is still exercised: the
  // reduced-motion check at boot is what did not fire, and that is what the state is for.
  const stopClock = async (): Promise<void> => {
    if (await page.evaluate(() => document.getElementById('tPause')!.classList.contains('on')))
      await page.evaluate(() => document.getElementById('tPause')!.click())
  }
  await stopClock()

  await runFrames(20)

  if (state.scenario !== null) {
    if (!(await page.locator('#jump').isVisible().catch(() => false))) await page.click('#simPlus')
    await page.selectOption('#jump', state.scenario)
    await page.click('#jumpGo')
    await stopClock()
  }

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

  // Anything that has to be *open* in the photograph is clicked here, not before the settle:
  // the tooltip hides itself eight real seconds after it opens, and settling takes longer
  // than that on a software rasteriser. Guarded so that states without `after` run exactly
  // the frame sequence they always have, and their baselines stay valid.
  if (state.after?.length) {
    for (const selector of state.after) await page.locator(selector).first().click()
    await runFrames(POST_ACTION_FRAMES)
  }

  const png = await page.screenshot({ type: 'png', animations: 'disabled' })

  // Asked before the export click, like the flags: this is what the frame that was just
  // photographed was drawn from.
  const debug = await page.evaluate(() => {
    const g = (globalThis as Record<string, unknown>).__gt as Record<string, unknown> | undefined
    if (!g) return null
    return { shimT: g.shimT, simT: g.simT, curD: g.curD, galaxyKeys: g.galaxyKeys }
  })

  const flags = await page.evaluate(() => ({
    ice: document.body.classList.contains('ice') ||
         getComputedStyle(document.body).getPropertyValue('--iceA').trim() > '0',
    // offsetParent is null for position:fixed, which the panels and the tip all are, so it
    // reports every one of them hidden. checkVisibility() asks the layout engine instead.
    tip: document.getElementById('tip')?.checkVisibility() ?? false,
    panels: ['hud', 'env', 'simPanel'].filter((id) =>
      document.getElementById(id)?.checkVisibility() ?? false,
    ).length,
  }))

  // Read the state out only now. Exporting means clicking #dbgExport, and the tooltip hides
  // on the next click anywhere — so asking the page what it looks like has to come first, or
  // the answer is about a page the click has already changed.
  await page.evaluate(() => document.getElementById('dbgExport')!.click())
  const reported = JSON.parse(await page.inputValue('#dbgText'))

  await browser.close()
  return { png, errors, simT: reported.time?.simT, camera: reported.camera, flags, debug }
}
