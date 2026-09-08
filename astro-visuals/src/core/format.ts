/**
 * The numbers as the HUD writes them.
 *
 * Pure, and taking the unit mode as an argument rather than reading it from module scope —
 * which is what makes them testable, and these are worth testing: they are the most-read text
 * in the piece, and every one of their boundaries is a place where a plausible-looking change
 * shifts a digit nobody notices for months.
 */

/** Which of the three unit styles the visitor picked: words, superscript, or e-notation. */
export type UnitMode = 'words' | 'sup' | 'e'

export const sup = (e: number | string): string => String(e).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
export function fmtYears(y: number, unitMode: UnitMode): string { // a duration in years → astronomer units, or ×10^x notation
  // Jumping to an epoch before an era began gives a negative span: show how far short
  // it falls rather than a raw minus sign glued to a locale string.
  if(y < 0) return '−'+fmtYears(-y, unitMode);
  if(unitMode==='sup'){
    const e=Math.floor(Math.log10(Math.max(1,y)));
    return (y/Math.pow(10,e)).toFixed(4)+'×10'+sup(e)+' yr';
  }
  if(unitMode==='e'){
    const e=Math.floor(Math.log10(Math.max(1,y)));
    return (y/Math.pow(10,e)).toFixed(4)+'e'+e+' yr';
  }
  if(y>=1e9) return (y/1e9).toFixed(4)+' Gyr';
  if(y>=1e6) return (y/1e6).toFixed(4)+' Myr';
  if(y>=1e3) return (y/1e3).toFixed(3)+' kyr';
  return Math.floor(y).toLocaleString('en-US')+' yr';
}
export function fmtCount(n: number): string {
  if(n>=1e15){ const e=Math.floor(Math.log10(n)); return (n/Math.pow(10,e)).toFixed(2)+'×10'+sup(e); }
  if(n>=1e12) return (n/1e12).toFixed(2)+'T';
  if(n>=1e9)  return (n/1e9).toFixed(2)+'B';
  if(n>=1e6)  return (n/1e6).toFixed(2)+'M';
  if(n>=1e3)  return (n/1e3).toFixed(1)+'k';
  return String(Math.floor(n));
}
