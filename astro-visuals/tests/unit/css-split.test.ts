import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * The stylesheet was one 368-line block and is now four files. Splitting CSS is the kind of
 * change that looks safe and is not: the cascade is positional, so a rule that used to lose
 * can start winning purely because it moved into a file that loads later. Three such
 * conflicts exist in this page and every one of them is invisible on a desktop screenshot.
 *
 * The parity gate photographs four viewport bands and a glacial frame partly to catch this,
 * but a screenshot takes two minutes and says only "different". These assertions take
 * milliseconds and say which rule moved.
 */

const FILES = ['base', 'panels', 'dialogs', 'hud'] as const

/** The concatenation the browser sees, in the order <head> links them. */
function concatenated(): string[] {
  return FILES.flatMap((name) => {
    const text = readFileSync(resolve(ROOT, `src/styles/${name}.css`), 'utf8')
    const body = text.slice(text.indexOf('*/') + 2) // drop the banner
    return body.split('\n').filter((l) => l.trim())
  })
}

/** The stylesheet as it was before the split, read from the pinned pre-refactor page. */
function original(): string[] {
  const html = readFileSync(resolve(ROOT, 'baseline-page.html'), 'utf8').split('\n')
  const open = html.findIndex((l) => l.trim() === '<style>')
  const close = html.findIndex((l) => l.trim() === '</style>')
  expect(open, 'no <style> in the pinned page').toBeGreaterThan(-1)
  return html.slice(open + 1, close).filter((l) => l.trim())
}

describe('the CSS split', () => {
  it('loses no rule and invents none', () => {
    const before = original()
    const after = concatenated()
    expect(after).toHaveLength(before.length)
    expect([...after].sort()).toEqual([...before].sort())
  })

  // The other half of the contract: within a file, blocks keep their original relative order.
  // Between files the order is chosen (that is what the split is for); inside one it is not,
  // and a block that drifted upward past a sibling is a cascade change disguised as tidying.
  //
  // Checked as a subsequence rather than by line number so that it survives duplicates —
  // `@media (max-width:620px){` genuinely occurs twice in the original, once for the tour and
  // once for the status bar, which is also why "no rule appears in two files" is the wrong
  // assertion to make here. The multiset check above already proves nothing was duplicated.
  it.each(FILES)('keeps %s.css in ascending original order', (name) => {
    const before = original()
    const text = readFileSync(resolve(ROOT, `src/styles/${name}.css`), 'utf8')
    const mine = text
      .slice(text.indexOf('*/') + 2)
      .split('\n')
      .filter((l) => l.trim())

    let cursor = 0
    for (const line of mine) {
      const found = before.indexOf(line, cursor)
      expect(found, `"${line.trim().slice(0, 60)}" is out of order in ${name}.css`).toBeGreaterThan(-1)
      cursor = found + 1
    }
  })

  describe('the cascade conflicts the split could silently resolve the other way', () => {
    const order = concatenated()
    const at = (needle: string): number => {
      const i = order.findIndex((l) => l.includes(needle))
      expect(i, `selector not found: ${needle}`).toBeGreaterThan(-1)
      return i
    }

    // The state-colour block resets background/border/shadow on the panel chrome as the
    // hazard level rises. `.gamebar` and `.info-card` re-declare those properties AFTER it,
    // which is the only reason the status bar and the info card do not change colour along
    // with everything else. Put panels.css after either of them and both start tinting.
    it('tints the panels but not the status bar', () => {
      expect(at('--iceA')).toBeLessThan(at('.gamebar{'))
    })

    it('tints the panels but not the info card', () => {
      expect(at('--iceA')).toBeLessThan(at('.info-card{'))
    })

    // `.gamebar .stat b` carries no media query and sits after the max-width:820px block, so
    // it beats it. Sorting the media queries to the bottom — the tidy-looking thing to do —
    // shrinks the numerals on a narrow screen.
    it('lets the unconditional stat rule beat the narrow-screen media query', () => {
      expect(at('@media (max-width:820px)')).toBeLessThan(at('.gamebar .stat b'))
    })
  })

  it('styles #tip, which exists only in CSS and is measured the instant JS shows it', () => {
    // #tip is the one id with no counterpart in the markup: ui/tooltips creates it, sets
    // display:block and reads offsetWidth on the next line. A stylesheet that is not applied
    // by then puts the tooltip in the wrong place, and nothing throws.
    const hud = readFileSync(resolve(ROOT, 'src/styles/hud.css'), 'utf8')
    expect(hud).toMatch(/#tip\s*\{/)
  })
})

/**
 * The same guarantees, asserted against the FILE THAT SHIPS rather than against the sources.
 *
 * The source concatenation being right does not make the artifact right: the bundler decides
 * the final order, and a `<link>` that Vite chose to hoist, defer or merge differently would
 * change the cascade with nothing in `src/` to show for it. This nearly went unnoticed once
 * already — the first check reported the 820px ordering broken, which turned out to be the
 * checker matching a documentation comment that quoted both selectors. Comments are stripped
 * here for that reason.
 */
describe('the stylesheet that ships', () => {
  const shipped = (path: string): string[] => {
    const html = readFileSync(resolve(ROOT, path), 'utf8')
    // The built page inlines its JS before its CSS, and that script contains the characters
    // `<style` in more than one string — so the block is found from the end, not the start.
    const end = html.lastIndexOf('</style>')
    const open = html.lastIndexOf('<style', end)
    const body = html.slice(html.indexOf('>', open) + 1, end)
    return body
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  }

  it('is one inline <style>, and holds exactly the rules the original did', () => {
    const built = shipped('galactic-transit.html')
    const before = shipped('baseline-page.html')
    expect(built).toHaveLength(before.length)
    expect([...built].sort()).toEqual([...before].sort())
  })

  it.each([
    ['tints the panels but not the status bar', '--iceA', '.gamebar{'],
    ['tints the panels but not the info card', '--iceA', '.info-card{'],
    ['lets the unconditional stat rule win', '@media (max-width:820px)', '.gamebar .stat b{'],
  ])('%s', (_label, first, second) => {
    const built = shipped('galactic-transit.html')
    const at = (needle: string): number => {
      const i = built.findIndex((l) => l.includes(needle))
      expect(i, `not found in the shipped stylesheet: ${needle}`).toBeGreaterThan(-1)
      return i
    }
    expect(at(first)).toBeLessThan(at(second))
  })
})
