import { test, expect } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { capture } from '../harness/session'
import { SELECTED, TOLERANT } from '../harness/states'
import { BASELINE_PAGE } from '../harness/pin'

const HERE = dirname(fileURLToPath(import.meta.url))
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
 * The gate: the pre-refactor page and the built page, photographed back to back, compared.
 *
 * Both shots are taken inside the same test, moments apart, on the same machine under the
 * same load — and that is the whole design. Storing reference PNGs and comparing against them
 * later looked obviously right and was the source of every unexplained failure in this
 * project. Three separate times a state came back differing by tens of thousands of pixels,
 * and three times the stored reference turned out to be the odd one out: perfectly
 * reproducible in the mode it was captured in, different in the mode it was compared in. A
 * reference photographed as one of twenty-four in a batch is not the same measurement as one
 * photographed alone, and no amount of pinning inside the page fixes an asymmetry that lives
 * outside it.
 *
 * So there is no stored reference. Nothing to regenerate, nothing to go stale, and no way for
 * "those baselines are from an older harness" to masquerade as a rendering change. It costs a
 * second capture per state and saves the separate baseline run, which is roughly a wash.
 *
 * Tolerance is measured, not assumed. Every real difference caught during this refactor came
 * in at max Δ174–252 over 5–20% of the frame; the rasteriser's own noise floor comes in at
 * max Δ1 over 0.3%. The threshold sits in a gap of two orders of magnitude, and the numbers
 * print on every state so drift toward it is visible rather than silent.
 */

/** No pixel may differ by more than this. Real changes measured 174–252. */
const MAX_DELTA = 1
/** And no more than this share may differ at all. Real changes measured 5–20%. */
const MAX_DIFFERING_FRACTION = 0.01

test.describe('the built page against the pre-refactor page', () => {
  test.beforeAll(() => mkdirSync(FAILURES, { recursive: true }))

  for (const state of SELECTED) {
    test(state.id, async ({}, testInfo) => {
      // Both shots at once, in their own browser processes, rather than one after the other.
      //
      // Sequential was fair only on an idle machine: whatever load arrived between them hit
      // one side and not the other, which is exactly how three parallel workers broke this —
      // 26 of 30 passing and four states off by tens of thousands of pixels, reproducibly.
      // Run concurrently, contention lands on both and cancels, and a test costs the longer
      // of the two captures rather than their sum.
      const [before, after] = await Promise.all([
        capture(`/${BASELINE_PAGE}`, state),
        capture('/galactic-transit.html', state),
      ])

      expect(before.errors, `the pre-refactor page logged errors:\n${before.errors.join('\n')}`).toEqual([])
      expect(after.errors, `the built page logged errors:\n${after.errors.join('\n')}`).toEqual([])

      // Same clock, same camera, same things on screen. If these differ the pixels are a
      // distraction and the state itself is the finding.
      expect(after.simT, 'the two builds are at different simulation times').toBe(before.simT)
      expect(after.camera, 'the two builds have different cameras').toEqual(before.camera)
      expect(after.flags, 'the two builds are showing different things').toEqual(before.flags)

      const diff = compare(before.png, after.png)
      const percent = (diff.differing / diff.total) * 100

      testInfo.annotations.push({
        type: 'diff',
        description: `${diff.differing} px (${percent.toFixed(3)}%), max Δ${diff.maxDelta}`,
      })
      if (after.debug) testInfo.annotations.push({ type: 'gt', description: JSON.stringify(after.debug) })

      if (diff.differing > 0) {
        writeFileSync(resolve(FAILURES, `${state.id}.before.png`), before.png)
        writeFileSync(resolve(FAILURES, `${state.id}.after.png`), after.png)
        writeFileSync(resolve(FAILURES, `${state.id}.diff.png`), diff.vis)
        writeFileSync(
          resolve(FAILURES, `${state.id}.state.json`),
          JSON.stringify(
            {
              before: { simT: before.simT, camera: before.camera, flags: before.flags, debug: before.debug },
              after: { simT: after.simT, camera: after.camera, flags: after.flags, debug: after.debug },
            },
            null,
            2,
          ) + '\n',
        )
        await testInfo.attach(`${state.id}.diff.png`, { body: diff.vis, contentType: 'image/png' })
      }

      const detail = `${diff.differing}/${diff.total} px (${percent.toFixed(3)}%), max Δ${diff.maxDelta}, mean Δ${diff.meanDelta.toFixed(2)} — ${state.covers}`

      if (TOLERANT.has(state.id)) {
        // The first-launch probe measures the machine, so this one can legitimately pick a
        // different detail tier between two captures.
        expect(percent, detail).toBeLessThan(0.1)
      } else {
        // Both conditions, so neither can be satisfied by the other: a change cannot pass by
        // being small in area if it is large in amplitude, or vice versa.
        expect(diff.maxDelta, `amplitude beyond the rasteriser's noise floor — ${detail}`)
          .toBeLessThanOrEqual(MAX_DELTA)
        expect(percent, `too much of the frame changed — ${detail}`)
          .toBeLessThan(MAX_DIFFERING_FRACTION * 100)
      }
    })
  }
})
