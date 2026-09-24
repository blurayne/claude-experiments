import { cam, SKY_MIRROR } from './state'

/**
 * Free flight: the eye as a ship.
 *
 * The camera stays what it is — an eye a distance `cam.dist` behind a target, turned by
 * yaw and pitch — and in flight the SHIP IS THE EYE: `flight.pos` is where the eye sits,
 * in absolute world coordinates (doubles, like `org`), and the frame puts the target a
 * zoom's distance ahead of it along the line of sight. So a drag turns the view round the
 * ship, the way a pilot looks round, rather than swinging the ship round a point ahead;
 * and a zoom, which keeps the point ahead and moves the eye along the line of sight,
 * is travel toward or away from it. Everything downstream keeps working unchanged: the
 * zoom, the ladder, the labels, the layers' fades, all keyed on `cam.dist`, which in
 * flight is the SCALE of the view. That is what sets the pace: at full throttle the ship
 * crosses a fraction of the view's own height each second, so zoomed in on a planet it
 * creeps and zoomed out to the supercluster it leaps — the same thumb on the same lever.
 *
 * The clock joins in. When the simulation runs faster than a year a second, the flight
 * runs faster by the square root of that ratio (capped at ten): a fast clock is a fast
 * ship, and a paused clock is the walking pace, never slower.
 *
 * Forward is the sum of three hands: the keys (`want[0]`), the throttle lever, which stays
 * where it is put, and the burst, which is full ahead at boost while held. `on` is the
 * controls being live; `anchored` is the camera riding the ship, which outlives the
 * controls — switching flight off stops the ship where it is rather than snapping the
 * view back to the Sun — until a view, a scenario or an import re-seeds the camera and
 * calls `flightRelease`.
 */
export const FLY_YPS_REF = 1          // a year a second: the clock rate the flight is paced at
export const FLY_VIEW_PER_S = 0.9     // view heights a second at full throttle, before the clock and the boost
export const FLY_BOOST = 4

export const flight = {
  on: false,
  anchored: false,
  /** the ship, which is the eye: absolute world coordinates */
  pos: new Float64Array(3),
  /** what the keys ask for — forward, right, up — each −1..1 */
  want: [0, 0, 0],
  /** the throttle in effect on each axis: the hands' sum, eased, so a key press does not jolt */
  axis: [0, 0, 0],
  /** the lever: −1..1, and it stays where it is put */
  throttle: 0,
  /** the burst button: full ahead at boost while held */
  burst: false,
  /** the keyboard's boost (shift) */
  boost: false,
  /** units a second at full throttle this frame — the readout */
  speedU: 0,
  /** the clock's contribution, for the readout */
  factor: 1,
}

/** how much the running clock speeds the ship: √(rate / a year a second), 1 to 10; 1 while it stands */
export function clockFactor(yps: number, running: boolean): number {
  if(!running || !(yps > 0)) return 1
  return Math.max(1, Math.min(10, Math.sqrt(yps/FLY_YPS_REF)))
}
/** units a second at full throttle: a fraction of the view's height (1.1547·dist at 60°), times the clock and the boost */
export function fullSpeed(dist: number, factor: number, boost: boolean): number {
  return 1.1547*dist*FLY_VIEW_PER_S*factor*(boost ? FLY_BOOST : 1)
}

// the eye's frame as the frame last built it: right and up on screen, and the eye's own
// direction from the target (so forward is −d). The frame sets it before it places the
// target, so the target this frame is a zoom's distance ahead along the CURRENT line of
// sight; only the flight's own movement uses it a frame late, which nobody can see.
const basis = { r: [1, 0, 0], u: [0, 1, 0], d: [0, 0, 1] }
export function setFlightBasis(r: readonly number[], u: readonly number[], d: readonly number[]): void {
  for(let i=0;i<3;i++){ basis.r[i] = r[i]; basis.u[i] = u[i]; basis.d[i] = d[i] }
}
/** the point the eye looks at: a zoom's distance ahead of the ship — the frame's target while anchored */
export function flightTarget(out: number[]): number[] {
  for(let i=0;i<3;i++) out[i] = flight.pos[i] - basis.d[i]*cam.dist
  return out
}
/** the forward hand: keys, lever and burst summed, and clamped — the burst is always full ahead */
export function forwardWant(keys: number, throttle: number, burst: boolean): number {
  return Math.max(-1, Math.min(1, keys + throttle + (burst ? 1 : 0)))
}

let lastDist = -1
/** take off from where the view is: the eye itself, with any pan folded in, becomes the ship */
export function flightStart(): void {
  const pv = 1.1547*cam.dist, pdx = -cam.panF[0]*pv*SKY_MIRROR, pdy = cam.panF[1]*pv
  for(let i=0;i<3;i++) flight.pos[i] = cam.smoothTarget[i] + basis.r[i]*pdx + basis.u[i]*pdy + basis.d[i]*cam.dist
  cam.panF[0] = cam.panF[1] = 0
  flight.on = flight.anchored = true
  flight.want[0] = flight.want[1] = flight.want[2] = 0; flight.axis[0] = flight.axis[1] = flight.axis[2] = 0
  flight.throttle = 0; flight.burst = false; lastDist = cam.dist
  flight.factor = 1; flight.speedU = fullSpeed(cam.dist, 1, false)   // the readout has a pace before the first step
  cam.reseedFollow = true; cam.firstFrame = true    // the frame's target smoothing must not chase the hand-over
}
/** the controls go off; the ship stays where it stopped */
export function flightStop(): void {
  flight.on = false; flight.boost = false; flight.burst = false; flight.throttle = 0
  flight.want[0] = flight.want[1] = flight.want[2] = 0
}
/** a view, a scenario or an import has re-seeded the camera: it is theirs again */
export function flightRelease(): void {
  flightStop(); flight.anchored = false
}

/**
 * One frame of flight: ease the throttle, set this frame's pace, move the ship along the
 * eye's own axes, and carry a zoom as travel along the line of sight (the point ahead
 * stays; the eye moves). `yps` is the clock's rate in years a second and `running`
 * whether it is advancing this frame. Returns whether the ship moved.
 */
export function flightStep(dt: number, yps: number, running: boolean): boolean {
  if(!flight.anchored){ lastDist = -1; return false }
  // a zoom since last frame: the eye follows the target's distance along the line of sight
  if(lastDist > 0 && cam.dist !== lastDist){ const dz = cam.dist - lastDist; for(let i=0;i<3;i++) flight.pos[i] += basis.d[i]*dz }
  lastDist = cam.dist
  if(!flight.on){ flight.axis[0] = flight.axis[1] = flight.axis[2] = 0; return false }
  const k = 1 - Math.exp(-dt/0.12)
  const wantF = forwardWant(flight.want[0], flight.throttle, flight.burst)
  flight.axis[0] += (wantF - flight.axis[0])*k
  for(let i=1;i<3;i++) flight.axis[i] += (flight.want[i] - flight.axis[i])*k
  flight.factor = clockFactor(yps, running)
  flight.speedU = fullSpeed(cam.dist, flight.factor, flight.boost || flight.burst)
  const [f, s, u] = flight.axis
  if(Math.abs(f) < 1e-4 && Math.abs(s) < 1e-4 && Math.abs(u) < 1e-4) return false
  const v = flight.speedU*dt
  // forward is toward the target (−d); screen-right is the world's right mirrored, as the
  // projection mirrors x (SKY_MIRROR); up is the view's up
  for(let i=0;i<3;i++) flight.pos[i] += (-basis.d[i]*f + basis.r[i]*SKY_MIRROR*s + basis.u[i]*u)*v
  return true
}
