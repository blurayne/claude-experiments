// Why does the frame never settle? Guessing is expensive here — a boot under SwiftShader is
// minutes — so this asks the page directly: stop the clock, take frames a second apart, and
// report WHERE they differ and what the page says about itself between shots.
//
//   node scripts/diag.mjs [url] [backend]      backend: swiftshader (default) | gpu

import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import { writeFileSync } from 'node:fs'

const URL = process.argv[2] ?? 'http://localhost:4322/galactic-transit.html'
const BACKEND = process.argv[3] ?? 'swiftshader'
const FROZEN_NOW = Date.UTC(2026, 5, 15, 12, 0, 0)

const ARGS = BACKEND === 'gpu'
  ? ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization',
     '--disable-lcd-text', '--force-device-scale-factor=1', '--hide-scrollbars', '--mute-audio']
  : ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
     '--disable-lcd-text', '--force-device-scale-factor=1', '--hide-scrollbars', '--mute-audio']

/** Bounding box and count of differing pixels, plus which regions they fall in. */
function diff(aBuf, bBuf) {
  const a = PNG.sync.read(aBuf), b = PNG.sync.read(bBuf)
  if (a.width !== b.width || a.height !== b.height) return { error: 'size changed' }
  let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * 4
      if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) {
        n++
        if (x < x0) x0 = x
        if (y < y0) y0 = y
        if (x > x1) x1 = x
        if (y > y1) y1 = y
      }
    }
  }
  return n === 0
    ? { differing: 0 }
    : { differing: n, percent: ((n / (a.width * a.height)) * 100).toFixed(3) + '%', box: { x0, y0, x1, y1 } }
}

const browser = await chromium.launch({ args: ARGS })
const page = await browser.newPage({
  viewport: { width: 960, height: 600 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})

const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

await page.addInitScript(({ now }) => {
  let a = 0x9e3779b9
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
  // Count rAF callbacks, so "is the loop even running" is answerable.
  globalThis.__frames = 0
  const raf = globalThis.requestAnimationFrame.bind(globalThis)
  globalThis.requestAnimationFrame = (cb) => raf((t) => { globalThis.__frames++; return cb(t) })
}, { now: FROZEN_NOW })

const probe = () => page.evaluate(() => {
  const running = document.getElementById('tPause')?.classList.contains('on')
  const bar = document.getElementById('gamebar')?.innerText.replace(/\s+/g, ' ').trim()
  const env = document.getElementById('env')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 160)
  return { running, frames: globalThis.__frames, bar, env, ready: document.readyState }
})

const t0 = Date.now()
await page.goto(URL, { waitUntil: 'load' })
const gl = await page.evaluate(() => {
  const c = document.getElementById('gl')?.getContext('webgl2')
  return c ? { renderer: c.getParameter(c.RENDERER), vendor: c.getParameter(c.VENDOR) } : null
})
console.log(`backend=${BACKEND} renderer=${gl?.renderer} load=${((Date.now() - t0) / 1000).toFixed(1)}s`)

console.log('after load:      ', JSON.stringify(await probe()))

const tourVisible = await page.locator('#tourGo').isVisible().catch(() => false)
console.log('tour visible:    ', tourVisible)
if (tourVisible) await page.locator('#tourGo').click()
console.log('after tour:      ', JSON.stringify(await probe()))

// The tour "holds the clock while it is up and starts it on the way out" — so pausing has to
// happen after the dismissal, and after whatever the dismissal schedules.
await page.waitForTimeout(2000)
console.log('2s after tour:   ', JSON.stringify(await probe()))

if (await page.evaluate(() => document.getElementById('tPause').classList.contains('on'))) {
  await page.evaluate(() => document.getElementById('tPause').click())
}
console.log('after pause:     ', JSON.stringify(await probe()))

const shots = []
for (let i = 0; i < 4; i++) {
  const t = Date.now()
  shots.push(await page.screenshot({ type: 'png' }))
  const secs = ((Date.now() - t) / 1000).toFixed(1)
  console.log(`shot ${i} (${secs}s):   `, JSON.stringify(await probe()))
  if (i < 3) await page.waitForTimeout(1500)
}

for (let i = 1; i < shots.length; i++) {
  console.log(`diff ${i - 1}->${i}:`, JSON.stringify(diff(shots[i - 1], shots[i])))
}
writeFileSync('/tmp/diag-last.png', shots.at(-1))
console.log('errors:', errors)
console.log(`total ${((Date.now() - t0) / 1000).toFixed(1)}s`)

await browser.close()
