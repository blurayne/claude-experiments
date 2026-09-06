// Derisking script, not part of the suite. It answers, in order:
//   1. can the page boot and render headlessly at all?           (yes: WebGL2 + float buffers)
//   2. can it be driven to a named state?                        (via the scenario selector)
//   3. can that state be frozen so a screenshot is reproducible? (pause + applyState)
//   4. do two runs with the same seed produce identical pixels?  <- the whole plan rests on this
//
// Run it against the pre-refactor build. If 4 is NO, the parity gate cannot exist in the
// form the design assumes, and that has to be known before any code moves.

import { chromium } from '@playwright/test'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'

const URL = process.argv[2] ?? 'http://localhost:4322/galactic-transit.html'
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

/** Wait until consecutive frames stop differing. Cheap frames: the canvas only, downscaled. */
async function settle(page, label, { tries = 60, interval = 200, needed = 3 } = {}) {
  let prev = '', stable = 0
  for (let i = 0; i < tries; i++) {
    await page.waitForTimeout(interval)
    const h = sha(await page.screenshot({ type: 'jpeg', quality: 40 }))
    if (h === prev) { if (++stable >= needed) return i + 1 }
    else { stable = 0; prev = h }
  }
  throw new Error(`[${label}] never settled in ${tries} attempts`)
}

async function isPaused(page) {
  return page.evaluate(() => document.getElementById('tPause')?.classList.contains('on') ?? null)
}

/** The clock must be stopped before anything is photographed, or nothing ever settles. */
async function pause(page) {
  const before = await isPaused(page)
  // `tPause` lights when the piece is RUNNING or when it is paused? Read it, act, verify.
  await page.evaluate(() => document.getElementById('tPause').click())
  const after = await isPaused(page)
  return { before, after }
}

async function run(label) {
  const browser = await chromium.launch({ args: ARGS })
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce', // the piece never unpauses a visitor who asks for reduced motion
  })

  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.addInitScript(
    ({ seed, now }) => {
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
    },
    { seed: SEED, now: FROZEN_NOW },
  )

  const timings = {}
  const mark = async (name, fn) => {
    const t = Date.now()
    const v = await fn()
    timings[name] = ((Date.now() - t) / 1000).toFixed(1) + 's'
    return v
  }

  await mark('goto', () => page.goto(URL, { waitUntil: 'load' }))

  const gl = await page.evaluate(() => {
    const ctx = document.getElementById('gl')?.getContext('webgl2')
    return ctx ? { renderer: ctx.getParameter(ctx.RENDERER), float: !!ctx.getExtension('EXT_color_buffer_float') } : null
  })

  if (await page.locator('#tourGo').isVisible().catch(() => false)) await page.locator('#tourGo').click()

  const pausedAtBoot = await isPaused(page)
  await mark('settle:boot', () => settle(page, 'boot'))
  const opening = await page.screenshot({ type: 'png' })
  writeFileSync(`/tmp/smoke-${label}-opening.png`, opening)

  // Drive to the merger — the heaviest state in the piece, and the one that runs its clock
  // at 10^8 years a second, so it is the honest test of "can this be frozen".
  if (!(await page.locator('#jump').isVisible().catch(() => false))) await page.click('#simPlus')
  await page.selectOption('#jump', '11.25')
  await page.click('#jumpGo')

  const pausedAfterGo = await isPaused(page)
  const pauseResult = pausedAfterGo === false ? await pause(page) : null

  const settledIn = await mark('settle:merger', () => settle(page, 'merger'))
  const merged = await page.screenshot({ type: 'png' })
  writeFileSync(`/tmp/smoke-${label}-merger.png`, merged)

  // The state as the page itself reports it — this is what becomes a committed fixture, so
  // that every later run reproduces this exact simT and camera instead of racing the clock.
  await page.evaluate(() => document.getElementById('dbgExport').click())
  const state = JSON.parse(await page.inputValue('#dbgText'))

  await browser.close()
  return {
    gl, errors, timings, pausedAtBoot, pausedAfterGo, pauseResult, settledIn,
    opening: sha(opening), merger: sha(merged),
    simT: state.time?.simT, paused: state.time?.paused, camera: state.camera,
  }
}

const a = await run('a')
console.log('run a:', JSON.stringify(a, null, 2))
const b = await run('b')

console.log('\nrun b:', JSON.stringify({ opening: b.opening, merger: b.merger, simT: b.simT, errors: b.errors, timings: b.timings }, null, 2))
console.log('\nDETERMINISTIC opening:', a.opening === b.opening ? 'YES' : 'NO')
console.log('DETERMINISTIC merger: ', a.merger === b.merger ? 'YES' : 'NO')
console.log('simT equal:           ', a.simT === b.simT ? 'YES' : `NO (${a.simT} vs ${b.simT})`)
