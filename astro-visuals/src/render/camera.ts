import { canvas } from '../gpu/context'
import { REAL_MODE } from '../astro/constants'
import { MOON_BORN } from '../astro/earth'
import { cam, view, SKY_MIRROR } from './state'

/**
 * The camera: what a hand does to the view.
 *
 * One pointer turns it, two pan and pinch it, the wheel zooms, and the zoom buttons step
 * along a ladder of the objects themselves. All of it is listener registration, so the module
 * is an `initCamera()` plus the one thing the interface calls into — `zoomStep`.
 *
 * Two values are injected. `ageGyr` decides the Moon's zoom floor, and `holding` is read by
 * the frame: while a pointer or finger is down the clock holds, so the galaxy does not keep
 * turning under the hand that is trying to orbit it.
 */

let ageGyr: () => number = () => 0
let onHold: (held: boolean) => void = () => {}

// dive: hold the camera on the Sun-to-core line
// which absolute-frame position cam.follow tracks when true — the Sun everywhere
// except the one Andromeda view, which needs its own moving target the same way

let dragging=false, px=0, py=0;
// While a pointer or finger is down the clock holds, so the galaxy does not keep
// turning under the hand that is trying to orbit it. Released, it carries straight on.
// The flag itself belongs to the frame, so it is reported rather than kept.
const touches = new Map<number, PointerEvent>();     // every pointer currently down on the canvas
// Two-finger pan. Kept as a fraction of the view's height along the camera's own right
// and up, not as a world offset: zooming then keeps the composition, and a pan made at
// galaxy scale cannot leave the Sun a thousand units off-screen once you dive. Cleared
// wherever the view is re-seeded (a scenario, a focus, the dive), like the transition.

let panCX = 0, panCY = 0;      // the last two-pointer centroid
function panCentroid(): number[] { let x=0,y=0; for(const q of touches.values()){ x+=q.clientX; y+=q.clientY; } return [x/touches.size, y/touches.size]; }
// the floor: ~0.04 AU across, eight solar radii; at Earth and at the Moon, a body filling
// the view. The Moon's view before she forms is Earth's view, so it keeps Earth's floor.
export const minDist = (): number => cam.followTarget === 'moon' ? (ageGyr() > MOON_BORN ? 5.5e-12 : 2e-11)
                   : cam.followTarget === 'earth' ? 2e-11 : (REAL_MODE ? 2e-8 : 25);
// The zoom buttons step along a ladder of the objects themselves — the Sun, the planets'
// orbits, the belts, the Oort shell, the nearest stars, the arm, the Galaxy, the Local
// Group — with one rung between each pair, so two presses take you from one object to
// the next, and every press eases in log space like any other zoom. Clamped to the same
// floor and ceiling as the wheel. Distances in camera units: 1 AU across the view is
// 4.67e-7, 1 ly is 0.0288.
const ZOOM_OBJ = [1.2e-10, 3.2e-9, 2e-8, 1e-7, 3.7e-7, 9.3e-7, 1.45e-6, 4.9e-6, 8.9e-6, 2.8e-5, 4.7e-5, 9.3e-4, 0.144, 0.72, 17, 150, 4300, 9500];
const ZOOM_RUNGS = ZOOM_OBJ.flatMap((d, i) => i ? [Math.sqrt(ZOOM_OBJ[i-1]*d), d] : [d]);
export function zoomStep(dir: number): void {
  const cur = cam.distGoal, lo = Math.log(cur);
  let next = null;
  if(dir < 0){ for(const r of ZOOM_RUNGS) if(Math.log(r) < lo - 0.03) next = r; }        // the largest rung below
  else       { for(const r of ZOOM_RUNGS) if(Math.log(r) > lo + 0.03){ next = r; break; } } // the smallest above
  if(next === null) return;
  cam.distGoal = Math.max(minDist(), Math.min(9500, next));
}

export function initCamera(deps: { ageGyr: () => number; onHold: (held: boolean) => void }): void {
  ageGyr = deps.ageGyr; onHold = deps.onHold;
  canvas.addEventListener('pointerdown', e=>{
    touches.set(e.pointerId, e);
    onHold(true);
    canvas.classList.add('dragging');
    if(touches.size === 1){ dragging = true; px = e.clientX; py = e.clientY;
      // capture can be refused; a throw here would abandon the handler mid-way
      try{ canvas.setPointerCapture(e.pointerId); }catch(err){} }
    else { dragging = false; [panCX, panCY] = panCentroid(); }   // two fingers: pinch and pan, not a turn
  });
  canvas.addEventListener('pointermove', e=>{
    if(touches.has(e.pointerId)) touches.set(e.pointerId, e);
    if(touches.size === 2){
      // the fingers' midpoint carries the scene with it; the pinch (below) reads the spread
      const [cx, cy] = panCentroid();
      cam.panF[0] = Math.max(-2, Math.min(2, cam.panF[0] + (cx - panCX)/view.H));
      cam.panF[1] = Math.max(-2, Math.min(2, cam.panF[1] + (cy - panCY)/view.H));
      panCX = cx; panCY = cy;
      return;
    }
    if(!dragging || touches.size > 1) return;
    cam.yaw   -= (e.clientX-px)*0.005*SKY_MIRROR;
    cam.pitch  = Math.max(-1.45, Math.min(1.45, cam.pitch + (e.clientY-py)*0.005));
    px=e.clientX; py=e.clientY;
  });
  function endPointer(e: PointerEvent): void {
    touches.delete(e.pointerId);
    if(touches.size === 0){ dragging = false; onHold(false); canvas.classList.remove('dragging'); }
    else if(touches.size === 1){
      // one finger left: pick the drag up from where it actually is, or the view jumps
      const q = touches.values().next().value!;   // size is 1, so there is one
      px = q.clientX; py = q.clientY; dragging = true;
    } else if(touches.size === 2) [panCX, panCY] = panCentroid();   // three down to two: restart from here
  }
  addEventListener('pointerup', endPointer);
  addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', e=>{
    e.preventDefault();
    const rate = REAL_MODE ? 0.0018 : 0.0011; // faster travel across real scale's ~11 decades
    cam.distGoal = Math.max(minDist(), Math.min(7500, cam.distGoal*Math.exp(e.deltaY*rate)));
  },{passive:false});
  // pinch zoom
  let pinchD=0;
  canvas.addEventListener('touchstart', e=>{ onHold(true); if(e.touches.length===2){ pinchD=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); } },{passive:true});
  canvas.addEventListener('touchend', e=>{ onHold(e.touches.length>0); },{passive:true});
  canvas.addEventListener('touchmove', e=>{
    if(e.touches.length===2){
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      if(pinchD>0) cam.distGoal=Math.max(minDist(),Math.min(7500,cam.distGoal*pinchD/d));
      pinchD=d; dragging=false;   // belt and braces alongside the pointer bookkeeping
    }
  },{passive:true});
}
