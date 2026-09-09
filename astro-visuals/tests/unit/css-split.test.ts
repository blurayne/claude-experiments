import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * The stylesheet is four source files whose concatenation order IS the cascade. Splitting
 * CSS was the migration's risk; keeping the cascade honest is the live one: the order is
 * positional, so a rule that used to lose can start winning purely because it moved into a
 * file that loads later. Three such conflicts exist in this page and every one is invisible
 * on a desktop screenshot. These assertions take milliseconds and say which rule moved.
 *
 * The migration-era half of this file — proving the split lost no rule of v2.78's single
 * block — retired when the gate was repinned to v3.1.0 (the sources are live now, and the
 * old pin's <style> block is history, provable from git any time). What ships is asserted
 * against the SOURCES instead: the artifact must carry exactly their rules in their order.
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

describe('the CSS split', () => {
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

  it('is one inline <style>, and holds exactly the source files\' rules in their order', () => {
    // The bundler decides what actually ships; the sources being right proves nothing about
    // the artifact. Line for line, in order — a hoisted, merged or reformatted rule fails here.
    const built = shipped('galactic-transit.html')
    const fromSources = FILES.flatMap((name) =>
      readFileSync(resolve(ROOT, `src/styles/${name}.css`), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    )
    expect(built).toEqual(fromSources)
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
