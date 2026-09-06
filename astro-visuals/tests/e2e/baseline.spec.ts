import { test } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { capture } from '../harness/session'
import { STATES } from '../harness/states'
import { BASELINE_PAGE } from '../harness/pin'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../baselines')

/**
 * Photograph the pinned pre-refactor build. This is not a test of anything — it is the
 * reference the whole refactor is judged against, so it runs before any code moves and is
 * never regenerated from a working tree that has been touched.
 */
test.describe('baseline', () => {
  test.beforeAll(() => mkdirSync(OUT, { recursive: true }))

  for (const state of STATES) {
    test(state.id, async ({}, testInfo) => {
      const shot = await capture(`/${BASELINE_PAGE}`, state)

      writeFileSync(resolve(OUT, `${state.id}.png`), shot.png)
      writeFileSync(
        resolve(OUT, `${state.id}.json`),
        JSON.stringify({ simT: shot.simT, camera: shot.camera, flags: shot.flags, errors: shot.errors }, null, 2) + '\n',
      )

      // Attached rather than asserted: the baseline records what the old build did, including
      // anything it did wrong. The parity run is where a difference becomes a failure.
      testInfo.annotations.push(
        { type: 'covers', description: state.covers },
        { type: 'flags', description: JSON.stringify(shot.flags) },
        { type: 'errors', description: String(shot.errors.length) },
      )
    })
  }
})
