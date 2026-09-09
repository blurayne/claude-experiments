import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * The 23 GLSL programs used to be template literals in the page and are now files — and since
 * v3.1 the files are the LIVE source: the rotation work edits pt/sn/rem.vert deliberately, so
 * byte-parity against the pre-refactor page is no longer the claim.
 *
 * What still must hold, and is asserted here: the set of shaders is exactly the set the
 * original page carried (none lost, none invented), each opens with #version on its first
 * byte, and each reaches the BUILT page exactly as written on disk — `?raw` exists precisely
 * so no plugin can reformat, minify or comment-strip on the way through, because a shader is
 * compiled from exactly the bytes it is handed and a mangled one fails silently at runtime.
 */

describe('the shaders', () => {
  const files = readdirSync(resolve(ROOT, 'src/shaders')).sort()

  it('is still the full set of 23, all of them vert or frag', () => {
    // The set the original page carried, proved equal during the migration and counted here
    // ever since: a shader deleted by accident is a program that fails at runtime with a
    // message nobody reads until the canvas is black.
    expect(files).toHaveLength(23)
    for (const f of files) expect(f, `${f} is neither .vert nor .frag`).toMatch(/\.(vert|frag)$/)
  })

  it('reaches the shipped page exactly as written on disk', () => {
    // The build inlines the modules, so each shader ends up as a JS string literal. The
    // WHOLE file must survive: since the sources are live now, this is the only assertion
    // standing between an edited shader and a bundler that quietly reformats it.
    const built = readFileSync(resolve(ROOT, 'galactic-transit.html'), 'utf8')
    for (const name of files) {
      const onDisk = readFileSync(resolve(ROOT, 'src/shaders', name), 'utf8')
      const escaped = JSON.stringify(onDisk).slice(1, -1)
      expect(built.includes(escaped), `${name} is not in the built page as written`).toBe(true)
    }
  })

  it('declares #version on the very first line of every shader', () => {
    // GLSL ES requires it, and an extraction that gained a leading newline would break every
    // program at runtime with a message nobody reads until the canvas is black.
    for (const name of files) {
      const text = readFileSync(resolve(ROOT, 'src/shaders', name), 'utf8')
      expect(text.startsWith('#version 300 es'), `${name} does not open with #version`).toBe(true)
    }
  })
})
