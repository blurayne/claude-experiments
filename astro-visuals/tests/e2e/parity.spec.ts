import { test, expect } from '@playwright/test'
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { capture } from '../harness/session'
import { STATES, TOLERANT } from '../harness/states'

const HERE = dirname(fileURLToPath(import.meta.url))
const BASELINES = resolve(HERE, '../baselines')
const FAILURES = resolve(HERE, '../../test-results/parity')

interface Diff {
  differing: number
  total: number
  maxDelta: number
  meanDelta: number
  vis: Buffer
}

function compare(a: Buffer, b: Buffer): Diff {
  const x = PNG.sync.read(a)
  const y = PNG.sync.read(b)
  if (x.width !== y.width || x.height !== y.height)
    throw new Error(`size differs: ${x.width}×${x.height} vs ${y.width}×${y.height}`)

  const total = x.width * y.height
  const vis = new PNG({ width: x.width, height: x.height })
  let differing = 0
  let maxDelta = 0
  let sum = 0

  for (let i = 0; i < total; i++) {
    const j = i * 4
    const d = Math.max(
      Math.abs(x.data[j]! - y.data[j]!),
      Math.abs(x.data[j + 1]! - y.data[j + 1]!),
      Math.abs(x.data[j + 2]! - y.data[j + 2]!),
    )
    if (d > 0) {
      differing++
      sum += d
      if (d > maxDelta) maxDelta = d
    }
    vis.data[j] = d > 0 ? 255 : x.data[j]! >> 2
    vis.data[j + 1] = d > 0 ? 0 : x.data[j + 1]! >> 2
    vis.data[j + 2] = d > 0 ? 0 : x.data[j + 2]! >> 2
    vis.data[j + 3] = 255
  }

  return { differing, total, maxDelta, meanDelta: differing ? sum / differing : 0, vis: PNG.sync.write(vis) }
}

/**
 * The gate.
 *
 * Exact, not approximate: scripts/smoke.mjs established that two runs of the same build
 * produce byte-identical pixels once the seed, the clock, the settings, the fetch order and
 * the frame budget are pinned. So any difference at all is a difference the refactor made,
 * and the right response is to revert the step rather than widen the threshold.
 *
 * The one exception is `fresh-profile`, whose content depends on the first-launch
 * performance probe measuring the machine — that one is allowed a small tolerance, and says
 * so out loud.
 */
test.describe('parity against the pre-refactor build', () => {
  test.beforeAll(() => mkdirSync(FAILURES, { recursive: true }))

  for (const state of STATES) {
    test(state.id, async ({ browser }, testInfo) => {
      const reference = resolve(BASELINES, `${state.id}.png`)
      test.skip(!existsSync(reference), 'no baseline yet — run `npm run baseline` first')

      const shot = await capture(browser, '/galactic-transit.html', state)

      expect(shot.errors, `${state.id} logged errors:\n${shot.errors.join('\n')}`).toEqual([])

      const diff = compare(readFileSync(reference), shot.png)
      const percent = (diff.differing / diff.total) * 100

      if (diff.differing > 0) {
        writeFileSync(resolve(FAILURES, `${state.id}.actual.png`), shot.png)
        writeFileSync(resolve(FAILURES, `${state.id}.diff.png`), diff.vis)
        await testInfo.attach(`${state.id}.diff.png`, { body: diff.vis, contentType: 'image/png' })
        await testInfo.attach(`${state.id}.actual.png`, { body: shot.png, contentType: 'image/png' })
      }

      const detail = `${diff.differing}/${diff.total} px (${percent.toFixed(3)}%), max Δ${diff.maxDelta}, mean Δ${diff.meanDelta.toFixed(2)} — ${state.covers}`

      if (TOLERANT.has(state.id)) {
        // The probe measures the machine, so this one can legitimately pick a different
        // detail tier. Anything past a tenth of a percent is not the probe, it is the move.
        expect(percent, detail).toBeLessThan(0.1)
      } else {
        expect(diff.differing, detail).toBe(0)
      }
    })
  }
})
