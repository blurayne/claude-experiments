import { $ } from '../core/dom'

/**
 * Fullscreen and screen orientation.
 *
 * All of it is listener registration, which is why it is an `init` rather than a set of
 * exported functions: nothing else in the piece calls into fullscreen, and the browser's own
 * events are the only thing that drives it.
 *
 * The awkward part is that a browser grants fullscreen only while a gesture is still being
 * handled. Turning the device to landscape is not a gesture, so the request is ARMED on
 * rotation and fires on the next touch instead of fighting the permission model — and it
 * never forces you back in after you deliberately left fullscreen in landscape.
 */

const isFs = (): boolean => !!(document.fullscreenElement || (document as { webkitFullscreenElement?: Element }).webkitFullscreenElement);

function reqFs(): Promise<void> {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
  const f = el.requestFullscreen || el.webkitRequestFullscreen;
  return f ? Promise.resolve(f.call(el)).catch(()=>{}) : Promise.reject();
}
function exitFs(): void {
  const d = document as Document & { webkitExitFullscreen?: () => void };
  const f = d.exitFullscreen || d.webkitExitFullscreen; if(f) f.call(document);
}
export const toggleFs = (): void | Promise<void> => isFs() ? exitFs() : reqFs();

let autoFsArmed = false, leftFsInLandscape = false;
const landscape = (): boolean => matchMedia('(orientation: landscape)').matches;

function armAutoFs(): void {
  if(!landscape() || isFs() || autoFsArmed) return;
  autoFsArmed = true;
  const go = ()=>{
    removeEventListener('pointerup', go); removeEventListener('touchend', go);
    autoFsArmed = false;
    if(landscape() && !isFs() && !leftFsInLandscape) reqFs();
  };
  addEventListener('pointerup', go, {once:false}); addEventListener('touchend', go, {once:false});
}

// Rotation cycles auto -> landscape -> portrait. Locking requires fullscreen and is
// mobile-only; where the API refuses, the button falls back to auto rather than lying.
const ROT = ['auto','landscape','portrait'] as const;
let rotIx = 0;

export function initFullscreen(): void {
  $('tFull').addEventListener('click', toggleFs);
  document.addEventListener('fullscreenchange', ()=> $('tFull').classList.toggle('on', isFs()));
  document.addEventListener('fullscreenchange', ()=>{ if(!isFs() && landscape()) leftFsInLandscape = true; });
  matchMedia('(orientation: landscape)').addEventListener('change', e=>{
    if(e.matches){ leftFsInLandscape = false; reqFs().catch(()=>armAutoFs()); armAutoFs(); }
  });
  $('tRotate').addEventListener('click', async ()=>{
    rotIx = (rotIx+1) % ROT.length;
    const mode = ROT[rotIx];
    const setLabel = (m: string) => { $('tRotate').textContent = '⟳ '+m; $('tRotate').classList.toggle('on', m!=='auto'); };
    setLabel(mode);
    try{
      if(mode==='auto'){ screen.orientation.unlock(); return; }
      if(!isFs()) await reqFs();
      await (screen.orientation as ScreenOrientation & { lock(o: string): Promise<void> }).lock(mode);
    }catch(err){ rotIx = 0; setLabel('auto'); }
  });
  // Launched as an installed app: the manifest asks for fullscreen, and this catches
  // the platforms that don't honour it. Orientation is deliberately left unlocked, so
  // the app opens in whatever rotation the screen is already in.
  if(matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches
     || (navigator as Navigator & { standalone?: boolean }).standalone === true){
    const once = ()=>{ removeEventListener('pointerdown', once); removeEventListener('keydown', once); if(!isFs()) reqFs(); };
    addEventListener('pointerdown', once); addEventListener('keydown', once);
  }
}

/**
 * Register the service worker. It lives here because it is the same kind of thing — a browser
 * capability the page asks for once at boot and never speaks to again — and because the http
 * guard matters: opened from a file:// URL there is no worker, and no error either.
 */
export function registerServiceWorker(): void {
  if(location.protocol.startsWith('http') && 'serviceWorker' in navigator){
    addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{}));
  }
}
