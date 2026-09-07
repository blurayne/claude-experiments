/**
 * The error collector, and the first thing main.ts imports.
 *
 * It has NO imports of its own, deliberately. It has to be installed before anything else
 * can throw — gpu/context can fail at boot on a machine without WebGL2 — and an ES binding
 * that is imported but not yet initialised throws on `typeof`, inside the global error
 * handler, which is the one place that must never throw. Zero imports, zero risk.
 *
 * Do not add `sideEffects: false` to package.json: installing the handlers IS the point, and
 * tree-shaking would take them.
 */

interface LogEntry { kind: string; msg: string; where: string; t: number; n: number }

/** Set by ui/debug once it exists. See the note in logErr for why this is not an import. */
let renderer: (() => void) | null = null
export function setLogRenderer(fn: () => void): void { renderer = fn }

// ---------- the error log ----------
// A phone has no console to open, so on a touch device every error the page can see is
// kept and shown in the settings dialog's log tab. On a desktop nothing is collected:
// the browser's own console is better than anything this could render.
export const TOUCH_DEV = (matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints|0) > 1)
                  && !matchMedia('(pointer: fine)').matches;
export const errLog: LogEntry[] = []
const ERR_MAX = 120
export function logErr(kind: string, msg: unknown, where?: string): void {
  if(!TOUCH_DEV || !msg) return;
  const top = errLog[0];
  if(top && top.kind === kind && top.msg === msg && top.where === where){ top.n++; top.t = Date.now(); }
  else { errLog.unshift({ kind, msg: String(msg).slice(0, 400), where: where || '', t: Date.now(), n: 1 });
         if(errLog.length > ERR_MAX) errLog.pop(); }
  // The renderer is injected, not imported. ui/debug owns the DOM this writes into and
  // itself needs logErr, so importing it here would be a cycle — and a collector that fails
  // while reporting a failure is worse than no collector, which is why the call stays wrapped.
  if(renderer) try{ renderer(); }catch(e){}
}
export function installErrorCollector(){
 if(TOUCH_DEV){
  addEventListener('error', e => {
    // A failed <img>/<script>/<link> reports itself through the element, not the window.
    const t = e.target as (HTMLElement & { src?: string; href?: string }) | null;
    if(t && (t as unknown) !== window && (t.src || t.href)) logErr('load', 'failed to load ' + String(t.src || t.href).split('/').pop(), t.tagName.toLowerCase());
    else logErr('error', e.message || String(e.error || 'error'), (e.filename||'').split('/').pop() + (e.lineno ? ':' + e.lineno : ''));
  }, true);   // capture: a failed <img> or <script> does not bubble
  addEventListener('unhandledrejection', e => {
    const r = e.reason; logErr('promise', (r && (r.message || r)) || 'promise rejected', '');
  });
  for(const k of ['error','warn'] as const){
    const orig = console[k].bind(console);
    console[k] = (...a: unknown[]) => {
      try{ logErr(k, a.map((x: unknown) => x instanceof Error ? (x.message || String(x))
                                : (x && typeof x === 'object') ? JSON.stringify(x).slice(0,200) : String(x)).join(' '), ''); }catch(e){}
      orig(...a);
    };
  }
}
}
