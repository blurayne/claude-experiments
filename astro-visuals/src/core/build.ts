/**
 * Which build this is.
 *
 * The three placeholders are substituted by .github/scripts/build_site.py on the copy under
 * _site/, so a working copy opened straight from disk keeps them and reports itself as a dev
 * build. They must survive the bundler as literal text — scripts/check-build.mjs asserts it.
 *
 * localBuildStamp() reads Intl and getTimezoneOffset at module evaluation, so its result is a
 * property of the machine that loaded the page. The parity harness pins TZ for that reason.
 */

export const BUILD = { version: '3.7.0', date: '__BUILD_DATE__', time: '__BUILD_TIME__', sha: '__BUILD_SHA__' };
export const VERSION = 'v' + BUILD.version;
// The stamp is written in UTC; show it in whatever zone the browser is in, and always
// name the offset — "+00:00" is information too, not an absence of it.
export function localBuildStamp(): string {
  const d = new Date(BUILD.date + 'T' + BUILD.time + 'Z');
  if(isNaN(d.getTime())) return BUILD.date + ' ' + BUILD.time + ' +00:00';
  const pad = (n: number) => String(n).padStart(2, '0');
  // Prefer the zone's own abbreviation (CEST, PDT, IST...). Some locales only offer a
  // "GMT+2" style name; those fall through to a numeric UTC offset — and a zone at zero
  // says UTC±0 outright, because a zero offset is a fact, not a blank.
  let zone = '';
  try{
    const part = new Intl.DateTimeFormat(undefined, {timeZoneName:'short'})
      .formatToParts(d).find(q => q.type === 'timeZoneName');
    if(part && !/^(GMT|UTC)([+-−]|$)/.test(part.value)) zone = part.value;
  }catch(err){}
  if(!zone){
    const off = -d.getTimezoneOffset();
    zone = off === 0 ? 'UTC±0'
         : 'UTC' + (off < 0 ? '−' : '+') +
           pad(Math.floor(Math.abs(off)/60)) + ':' + pad(Math.abs(off)%60);
  }
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${zone}`;
}
export const BUILD_LINE = BUILD.date.indexOf('__') === 0
  ? 'dev build'
  : localBuildStamp() + ' · ' + BUILD.sha;
