import { describe, it, expect } from 'vitest'
import { sup, fmtYears, fmtCount } from '../../src/core/format'

/**
 * The most-read text in the piece, and until now the least checked.
 *
 * Every one of these functions is a ladder of thresholds, and a ladder is where a
 * plausible-looking edit shifts a digit that nobody notices for months. The tests walk each
 * boundary from both sides.
 */

describe('sup — superscript digits', () => {
  it('maps every digit', () => {
    expect(sup(1234567890)).toBe('¹²³⁴⁵⁶⁷⁸⁹⁰')
  })

  it('takes a number or a string', () => {
    expect(sup(42)).toBe(sup('42'))
  })
})

describe('fmtYears — a duration in years', () => {
  it('names the astronomer units at their boundaries', () => {
    expect(fmtYears(999, 'words')).toBe('999 yr')
    expect(fmtYears(1e3, 'words')).toBe('1.000 kyr')
    expect(fmtYears(999_999, 'words')).toBe('999.999 kyr')
    expect(fmtYears(1e6, 'words')).toBe('1.0000 Myr')
    expect(fmtYears(1e9, 'words')).toBe('1.0000 Gyr')
    expect(fmtYears(13.8e9, 'words')).toBe('13.8000 Gyr')
  })

  it('groups plain years with thousands separators', () => {
    expect(fmtYears(0, 'words')).toBe('0 yr')
    expect(fmtYears(1, 'words')).toBe('1 yr')
    expect(fmtYears(999.9, 'words')).toBe('999 yr')
  })

  it('shows a negative span as a shortfall, not a minus glued to a locale string', () => {
    // Jumping to an epoch before an era began gives a negative span, and '−' here is the
    // typographic minus rather than a hyphen — which is the point of handling it separately.
    expect(fmtYears(-1e6, 'words')).toBe('−1.0000 Myr')
    expect(fmtYears(-500, 'words')).toBe('−500 yr')
    expect(fmtYears(-1e6, 'words').charCodeAt(0)).toBe(0x2212)
  })

  it('writes scientific notation two ways, on request', () => {
    expect(fmtYears(1.234e7, 'sup')).toBe('1.2340×10⁷ yr')
    expect(fmtYears(1.234e7, 'e')).toBe('1.2340e7 yr')
    // Below 1 the exponent is clamped, so tiny spans do not read as 10 to a negative power.
    expect(fmtYears(0.5, 'sup')).toBe('0.5000×10⁰ yr')
  })

  it('keeps four significant decimals in every scientific form', () => {
    for (const y of [1e5, 3.7e8, 9.99e12]) {
      expect(fmtYears(y, 'sup')).toMatch(/^\d\.\d{4}×10/)
      expect(fmtYears(y, 'e')).toMatch(/^\d\.\d{4}e/)
    }
  })
})

describe('fmtCount — a population', () => {
  it('steps through k, M, B and T at their boundaries', () => {
    expect(fmtCount(999)).toBe('999')
    expect(fmtCount(1e3)).toBe('1.0k')
    expect(fmtCount(1e6)).toBe('1.00M')
    expect(fmtCount(1e9)).toBe('1.00B')
    expect(fmtCount(1e12)).toBe('1.00T')
  })

  it('goes to superscript past a thousand trillion', () => {
    expect(fmtCount(1e15)).toBe('1.00×10¹⁵')
    expect(fmtCount(2.5e17)).toBe('2.50×10¹⁷')
  })

  it('truncates rather than rounds below a thousand', () => {
    expect(fmtCount(999.9)).toBe('999')
    expect(fmtCount(0)).toBe('0')
  })
})
