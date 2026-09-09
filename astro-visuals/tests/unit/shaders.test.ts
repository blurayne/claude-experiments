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

const KIND = { VS: 'vert', FS: 'frag' } as const

/** Every `const NAME_VS = \`…\`` in the pinned page, by filename. */
function literalsFromPinnedPage(): Map<string, string> {
  const src = readFileSync(resolve(ROOT, 'baseline-page.html'), 'utf8')
  const out = new Map<string, string>()
  const re = /^const ([A-Z0-9_]+)_(VS|FS) = `/gm

  for (let m = re.exec(src); m; m = re.exec(src)) {
    const [, stem, kind] = m
    const start = m.index + m[0].length
    const end = src.indexOf('`', start)
    out.set(`${stem!.toLowerCase()}.${KIND[kind as 'VS' | 'FS']}`, src.slice(start, end))
  }
  return out
}

describe('the extracted shaders', () => {
  const pinned = literalsFromPinnedPage()
  const files = readdirSync(resolve(ROOT, 'src/shaders')).sort()

  it('found the shaders in the pinned page at all', () => {
    // Guards the guard: a regex that silently matches nothing would make every assertion
    // below vacuously pass.
    expect(pinned.size).toBe(23)
  })

  it('extracted every one of them and invented none', () => {
    expect(files).toEqual([...pinned.keys()].sort())
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
