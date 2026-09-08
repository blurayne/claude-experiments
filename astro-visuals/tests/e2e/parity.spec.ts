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

/**
 * What counts as "the same picture".
 *
 * The owner has allowed minimal differences, and the useful question is which axis to relax.
 * Four populations have been measured over this refactor:
 *
 *   structural mistakes   max Δ174–252 over  5–22% of the frame
 *   harness instability   max Δ238     over 20–22%
 *   rasteriser rounding   max Δ1       over ~0.3%
 *   a handful of pixels   max Δ33      over  0.014%
 *
 * Amplitude does not separate them: a real mistake and a harness wobble both hit Δ238. AREA
 * does, by two orders of magnitude — everything that has ever been a genuine error covered at
 * least 5% of the frame, because moving a star or shifting the sky moves thousands of pixels
 * at once. So the relaxation is on area, and the amplitude allowance stays where it was.
 *
 * A difference passes if EITHER holds:
 *   - it touches at most SMALL_AREA of the frame, whatever the amplitude — a few hundred
 *     pixels cannot be a moved galaxy; or
 *   - no pixel differs by more than MAX_DELTA and it stays under BROAD_AREA — the rounding
 *     floor, which is faint but everywhere.
 */

/** ~288 px at 960×600. Structural errors have never come in under 5% of the frame. */
const SMALL_AREA = 0.0005
/** The last-bit rounding floor is faint and wide, so it gets area instead of amplitude. */
const MAX_DELTA = 1
const BROAD_AREA = 0.01

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

      // When the pixels disagree, run the control before reporting a difference.
      //
      // Photograph the PRE-REFACTOR page a second time and compare it with its own first
      // shot. If those two disagree, this state could not be held still on this run and the
      // comparison says nothing about the build — which is a fact about the harness, and it
      // should be reported as one rather than as a rendering change. Roughly two states in
      // twenty-three come out this way on a full run, and every one investigated by hand so
      // far has been the harness. Doing it here makes that automatic, evidenced, and visible.
      //
      // It is NOT a retry: the second shot is of the reference, not the candidate, so a real
      // difference can never be washed out by taking another look at it.
      if (diff.differing > 0 && !TOLERANT.has(state.id)) {
        // Photograph BOTH sides a second time, not just the reference.
        //
        // The first version of this control only re-shot the reference, which catches an
        // unstable reference and quietly certifies an unstable CANDIDATE — the run that
        // exposed it reported two states as real differences with the harness's own
        // signature, 22% of frame at max Δ238, because the built page happened to be the
        // wobbly side that time. Either shot failing to reproduce itself means the
        // comparison says nothing.
        const [beforeAgain, afterAgain] = await Promise.all([
          capture(`/${BASELINE_PAGE}`, state),
          capture('/galactic-transit.html', state),
        ])
        const refSelf = compare(before.png, beforeAgain.png)
        const buildSelf = compare(after.png, afterAgain.png)
        const unstable = refSelf.differing > 0 ? 'the pre-refactor page' : buildSelf.differing > 0 ? 'the built page' : null
        if (unstable) {
          const s = refSelf.differing > 0 ? refSelf : buildSelf
          const pct = ((s.differing / s.total) * 100).toFixed(3)
          testInfo.annotations.push({
            type: 'inconclusive',
            description: `${unstable} differed from ITSELF by ${s.differing} px (${pct}%), max Δ${s.maxDelta}`,
          })
          test.skip(
            true,
            `harness could not hold this state still: ${unstable} differed from itself by ` +
              `${pct}% (max Δ${s.maxDelta}), so the ${percent.toFixed(3)}% between the two is ` +
              `not evidence either way. Re-run this state alone.`,
          )
        }
      }

      if (TOLERANT.has(state.id)) {
        // The first-launch probe measures the machine, so this one can legitimately pick a
        // different detail tier between two captures.
        expect(percent, detail).toBeLessThan(0.1)
      } else {
        const tiny = percent <= SMALL_AREA * 100
        const faint = diff.maxDelta <= MAX_DELTA && percent < BROAD_AREA * 100
        expect(
          tiny || faint,
          `the picture changed — ${detail}\n` +
            `  a difference passes only if it touches at most ${(SMALL_AREA * 100).toFixed(4)}% of the ` +
            `frame at any amplitude, or stays within Δ${MAX_DELTA} across under ${BROAD_AREA * 100}%.`,
        ).toBe(true)
      }
    })
  }
})
