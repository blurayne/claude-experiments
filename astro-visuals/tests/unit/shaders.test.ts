import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * The 23 GLSL programs used to be template literals in the page and are now files.
 *
 * A shader is compiled by the driver from exactly the bytes it is handed, and nothing else in
 * this project will tell you if those bytes changed: there is no type checker for GLSL, the
 * compile happens at runtime, and a shader that still compiles but computes something
 * slightly different fails silently and looks like a rendering bug months later. So the
 * extraction is asserted to be byte-exact against the pre-refactor page, character for
 * character, including the indentation and the comments.
 *
 * `?raw` is used precisely so this can be true — no plugin reformats, minifies or
 * comment-strips on the way through.
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

  it.each([...pinned.keys()].sort())('%s is byte-identical to the original literal', (name) => {
    const onDisk = readFileSync(resolve(ROOT, 'src/shaders', name), 'utf8')
    expect(onDisk).toBe(pinned.get(name))
  })

  it('reaches the shipped page unaltered', () => {
    // The build inlines the modules, so each shader ends up as a JS string literal. Checking
    // a distinctive slice of each is enough to catch a plugin that reformatted them: the
    // version directive plus the first real line is unique per shader and would not survive
    // reindentation or comment stripping.
    const built = readFileSync(resolve(ROOT, 'galactic-transit.html'), 'utf8')
    for (const [name, source] of pinned) {
      const firstLines = source.split('\n').slice(0, 2).join('\n')
      const escaped = JSON.stringify(firstLines).slice(1, -1)
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
