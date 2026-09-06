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

/**
 * What gets photographed. Defaults to the built page — the thing the gate exists to check.
 *
 * Set PARITY_URL=/baseline-page.html to photograph the PINNED build against its own
 * baselines. That is the control experiment: it must come out at zero differing pixels, and
 * any state that does not is a state this harness cannot hold still, which is a defect in
 * the gate rather than evidence about the refactor. Run it before believing a failure.
 */
const TARGET = process.env.PARITY_URL ?? '/galactic-transit.html'

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
    test(state.id, async ({}, testInfo) => {
      const reference = resolve(BASELINES, `${state.id}.png`)
      test.skip(!existsSync(reference), 'no baseline yet — run `npm run baseline` first')

      const shot = await capture(TARGET, state)

      expect(shot.errors, `${state.id} logged errors:\n${shot.errors.join('\n')}`).toEqual([])

      const diff = compare(readFileSync(reference), shot.png)
      const percent = (diff.differing / diff.total) * 100

      if (diff.differing > 0) {
        writeFileSync(resolve(FAILURES, `${state.id}.actual.png`), shot.png)
        writeFileSync(resolve(FAILURES, `${state.id}.diff.png`), diff.vis)

        // When pixels differ, the first question is whether the *state* differs — a camera
        // that ended up a few ULPs away explains a shifted sky far better than a rendering
        // change does, and the two call for opposite responses. Record both sides so the
        // answer is in the artefacts rather than in a follow-up run.
        const before = JSON.parse(readFileSync(resolve(BASELINES, `${state.id}.json`), 'utf8'))
        const after = { simT: shot.simT, camera: shot.camera, flags: shot.flags }
        writeFileSync(
          resolve(FAILURES, `${state.id}.state.json`),
          JSON.stringify({ before: { simT: before.simT, camera: before.camera, flags: before.flags }, after }, null, 2) + '\n',
        )
        const drift = Object.entries(after.camera ?? {})
          .filter(([k, v]) => typeof v === 'number' && v !== before.camera?.[k])
          .map(([k, v]) => `${k}: ${before.camera?.[k]} -> ${v}`)
        testInfo.annotations.push({
          type: 'state drift',
          description: drift.length ? drift.join('; ') : `identical (simT ${before.simT === shot.simT ? 'equal' : 'DIFFERS'})`,
        })

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
