// Derisking script, not part of the suite. It answers one question: can this page be frozen
// hard enough that two runs produce byte-identical pixels? If not, the parity gate the whole
// refactor is gated on cannot exist, and that has to be known before any code moves.
//
// The answer is yes, on all three states tried, exactly — no tolerance needed.
//
// What has to be pinned, each learned the hard way:
//   Math.random   — the galaxy, nebulae, dust and belts are all sampled.
//   Date          — the opening simT is the elapsed fraction of a year since 2026-01-01.
//   the settings  — a fresh profile runs the first-launch performance probe, which measures
//                   the machine and picks a detail tier from it. Boot with settings saved.
//   the tour      — it covers the screen, and dismissing it starts the clock.
//   the clock     — `tPause` carries class `on` while RUNNING, not while paused.
//   the rAF clock — `shimT += dt` twinkles the stars on real elapsed time "even while the
//                   simulation is paused" (galactic-transit.html:5245). With the sim clock
//                   stopped and the frame clock running, 13% of the pixels still changed
//                   every frame. Both clocks have to stop.
//   the map race  — loadGalaxyMap() and loadM31Map() each call setGalaxy() from .then(), so
//                   which fetch wins decides where the PRNG stands when the galaxy is built.

import { chromium } from '@playwright/test'
import { createHash } from 'node:crypto'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'

const URL = process.argv[2] ?? 'http://localhost:4322/galactic-transit.html'
const SETTINGS_KEY = 'galactic-transit.settings.v1'
const FIXTURE = new globalThis.URL('../tests/harness/settings.fixture.json', import.meta.url).pathname
const MAKE_FIXTURE = process.argv.includes('--make-fixture')
const SEED = 0x9e3779b9
const FROZEN_NOW = Date.UTC(2026, 5, 15, 12, 0, 0)
const VIEWPORT = { width: 960, height: 600 }

const ARGS = [
  '--enable-unsafe-swiftshader',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--disable-lcd-text',
  '--force-device-scale-factor=1',
  '--hide-scrollbars',
  '--mute-audio',
]

const sha = (b) => createHash('sha256').update(b).digest('hex')

async function run(label, scenario) {
  const browser = await chromium.launch({ args: ARGS })
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: 'reduce' })

  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))

  // Serialise the two probability maps. Whichever resolves first calls setGalaxy() and moves
  // the PRNG on, so their order is part of the image. Left to the network it is a race; here
  // it is a queue, and the same queue for every run and both builds.
  let chain = Promise.resolve()
  for (const name of ['stars-gaia.bin', 'stars-gaia-deep.bin', 'galaxy-map.webp', 'm31-map.webp', 'earth-map.webp']) {
    await page.route(`**/${name}`, async (route) => {
      const mine = chain
      let release
      chain = new Promise((r) => (release = r))
      await mine
      await route.continue()
      release()
    })
  }

  await page.addInitScript(
    ({ seed, now, settings, key }) => {
      // A fresh profile runs the first-launch performance probe, which measures the machine
      // and picks a detail tier from what it measures — so a fresh profile draws a different
      // number of stars on a fast run than on a slow one. Booting with settings saved is what
      // makes the star count a constant instead of a benchmark result.
      if (settings) { try { localStorage.setItem(key, JSON.stringify(settings)) } catch {} }

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
        constructor(...args) { if (args.length === 0) super(now); else super(...args) }
        static now() { return now }
      }
      globalThis.Date = FrozenDate

      // The frame loop becomes a stepper we drive.
      //
      // Freezing the clock at `performance.now()` was not enough. `shimT` (3191) accumulates
      // real elapsed time — "runs even when paused" — and feeds `U.ptTime` (5417), the star
      // shader's variability phase. Two runs that spent slightly different amounts of real
      // time before the freeze hold different `shimT`, so every variable star sits at a
      // different phase. On a sparse sky that is a few pixels; on the merged remnant it is
      // the entire galaxy, which is exactly what the diff showed.
      //
      // Queueing the page's rAF callbacks and releasing them in batches was the first attempt
      // and it deadlocked: the real animation loop has to keep running — Playwright's own
      // screenshot stabilisation
      // uses rAF, and the canvas has no preserveDrawingBuffer, so intercepting the loop
      // wholesale deadlocks the screenshot and empties the drawing buffer. Only the
      // TIMESTAMP is replaced: the page sees a clock that ticks exactly one fixed step per
      // frame and then stops dead at a cap.
      //
      // `dt` is clamped to 0.05 upstream (frame(), line 5244), so a step of exactly 50 ms is
      // the largest one that survives unclamped — which makes `shimT` exactly the number of
      // steps taken, and lets the camera ease as fast as the page will allow.
      //
      // __arm(k) restarts the count at zero and stops it after k steps. The clock jumping
      // back is harmless and deliberate: the sim clock is paused, so the one negative dt
      // lands only on the wall-time accumulators — and it lands on them exactly hard enough
      // to cancel whatever they picked up during boot. After k more steps `shimT` is k*0.05
      // seconds in every run, whatever the machine did in between.
      const STEP = 50
      let n = 0
      let cap = Infinity
      const realRaf = globalThis.requestAnimationFrame.bind(globalThis)
      globalThis.requestAnimationFrame = (cb) => realRaf(() => cb(Math.min(n++, cap) * STEP))
      performance.now = () => Math.min(n, cap) * STEP

      globalThis.__arm = (k) => { n = 0; cap = k }
      globalThis.__frames = () => ({ n, cap, done: n > cap })
    },
    { seed: SEED, now: FROZEN_NOW, settings: MAKE_FIXTURE ? null : JSON.parse(readFileSync(FIXTURE, 'utf8')), key: SETTINGS_KEY },
  )

  const t0 = Date.now()
  await page.goto(URL, { waitUntil: 'load' })

  const gl = await page.evaluate(() => {
    const c = document.getElementById('gl')?.getContext('webgl2')
    return c ? { renderer: c.getParameter(c.RENDERER), float: !!c.getExtension('EXT_color_buffer_float') } : null
  })

  // Arm the virtual clock for `k` steps and wait until the page has taken all of them.
  // Real frames drive it, so this waits on the renderer rather than on a timer.
  const runFrames = async (k) => {
    await page.evaluate((v) => globalThis.__arm(v), k)
    await page.waitForFunction(() => globalThis.__frames().done, undefined, { timeout: 180000, polling: 100 })
  }

  // The four data files resolve on real time, independently of the frame loop, and two of
  // them rebuild the galaxy from their .then(). Let all of them land before a single frame
  // runs, so the PRNG is in the same place for every run.
  await page.waitForLoadState('networkidle')
  await runFrames(20)

  if (await page.locator('#tourGo').isVisible().catch(() => false)) await page.locator('#tourGo').click()

  // Dismissing the tour starts the clock ("nothing moves while you read"), so stop it after.
  const stopClock = async () => {
    if (await page.evaluate(() => document.getElementById('tPause').classList.contains('on')))
      await page.evaluate(() => document.getElementById('tPause').click())
  }
  await stopClock()

  if (scenario !== undefined) {
    if (!(await page.locator('#jump').isVisible().catch(() => false))) await page.click('#simPlus')
    await page.selectOption('#jump', scenario)
    await page.click('#jumpGo')
    await stopClock()
    // The camera eases in log space, a fixed fraction per frame. A fixed number of frames is
    // therefore a fixed camera — no threshold, no waiting on a limit it approaches but never
    // reaches. 300 frames is five seconds of virtual time.
  }

  if (MAKE_FIXTURE) {
    // Pin the detail tier by hand rather than accepting whatever the probe measured, then
    // let the page save. What comes out is a settings blob generated by the app itself —
    // valid by construction, which a hand-written one would not be.
    await page.evaluate(() => {
      const d = document.getElementById('detail')
      d.value = '1' // DETAIL_D index 1 = D 5 = "low", the shipped default
      d.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await runFrames(20)
    await page.waitForTimeout(1500) // saveSettings is debounced on real time
    const saved = await page.evaluate((k) => localStorage.getItem(k), SETTINGS_KEY)
    writeFileSync(FIXTURE, JSON.stringify(JSON.parse(saved), null, 2) + '\n')
    console.log('wrote', FIXTURE)
    await browser.close()
    return { fixture: true }
  }

  // Land the camera exactly on its goal rather than however close the easing got, so the
  // last few digits of cam.dist are a constant too.
  await page.evaluate(() => {
    document.getElementById('dbgExport').click()
    const box = document.getElementById('dbgText')
    const s = JSON.parse(box.value)
    s.camera.dist = s.camera.distGoal
    box.value = JSON.stringify(s)
    document.getElementById('dbgImport').click()
  })
  // Everything is set; now give the page a fixed budget of frames to settle into and stop.
  // The camera is already exactly on its goal, so this is only easing the wall-time terms:
  // avgLight, the colour ramp, the held bar width. 120 steps is six seconds of virtual time.
  await runFrames(120)

  const shot = await page.screenshot({ type: 'png', animations: 'disabled' })
  writeFileSync(`/tmp/smoke-${label}.png`, shot)

  await page.evaluate(() => document.getElementById('dbgExport').click())
  const state = JSON.parse(await page.inputValue('#dbgText'))

  await browser.close()
  return { gl, errors, hash: sha(shot), simT: state.time?.simT, camera: state.camera, seconds: ((Date.now() - t0) / 1000).toFixed(1) }
}

if (MAKE_FIXTURE) {
  await run('fixture', undefined)
  process.exit(0)
}

const cases = [
  ['opening', undefined],
  ['merger', '11.25'],
  ['earth', '4.318p'],
]

for (const [name, scenario] of cases) {
  const a = await run(`${name}-a`, scenario)
  const b = await run(`${name}-b`, scenario)
  console.log(`\n=== ${name} ===`)
  console.log('renderer      ', a.gl?.renderer, 'float:', a.gl?.float)
  console.log('errors        ', a.errors.length, b.errors.length)
  console.log('seconds       ', a.seconds, b.seconds)
  console.log('simT          ', a.simT, b.simT, a.simT === b.simT ? '(equal)' : '(DIFFER)')
  console.log('cam.dist      ', a.camera?.dist, b.camera?.dist)
  console.log('IDENTICAL     ', a.hash === b.hash ? 'YES' : `NO\n  a=${a.hash}\n  b=${b.hash}`)
}
