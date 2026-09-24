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
 * where it is put, and the burst, which is full ahead at boost while held. Sideways and
 * up are the keys and the thumb stick, which springs back to the centre. `on` is the
 * controls being live; `anchored` is the camera riding the ship, which outlives the
 * controls — switching flight off stops the ship where it is rather than snapping the
 * view back to the Sun — until a view, a scenario or an import re-seeds the camera and
 * calls `flightRelease`.
 */
export const FLY_YPS_REF = 1          // a year a second: the clock rate the flight is paced at
export const FLY_VIEW_PER_S = 1.17    // view heights a second at full throttle, before the clock and the boost (0.9 until v3.23.0: +30%)
export const FLY_BOOST = 4

export const flight = {
  on: false,
  anchored: false,
  /**
   * The ship's orientation while the controls are live, a unit quaternion [x, y, z, w]
   * taking the ship's own axes — x right, y up, z backward (the eye's direction from the
   * point ahead) — to the world. In flight the view turns freely: no pitch limit, over
   * the top and upside down. Out of flight the camera is yaw and pitch again, level.
   */
  q: [0, 0, 0, 1] as number[],
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
  /** the thumb stick: [sideways, up], each −1..1, back to zero when let go */
  stick: [0, 0] as number[],
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
/** a side hand (strafe or rise): the keys and the thumb stick summed, and clamped */
export function sideWant(keys: number, stick: number): number {
  return Math.max(-1, Math.min(1, keys + stick))
}
/** the forward hand: keys, lever and burst summed, and clamped — the burst is always full ahead */
export function forwardWant(keys: number, throttle: number, burst: boolean): number {
  return Math.max(-1, Math.min(1, keys + throttle + (burst ? 1 : 0)))
}

// ---------- the free orientation ----------
type Q4 = number[]
const qMul = (a: Q4, b: Q4): Q4 => [
  a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1],
  a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
  a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3],
  a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2]]
const qAxis = (ax: number, ay: number, az: number, t: number): Q4 => { const h = Math.sin(t/2); return [ax*h, ay*h, az*h, Math.cos(t/2)] }
const qNorm = (a: Q4): Q4 => { const n = Math.hypot(a[0], a[1], a[2], a[3]) || 1; return [a[0]/n, a[1]/n, a[2]/n, a[3]/n] }
/** the quaternion whose rotation has columns r, u, d (an orthonormal right-handed basis) */
export function quatFromBasis(r: readonly number[], u: readonly number[], d: readonly number[]): Q4 {
  const m00 = r[0], m11 = u[1], m22 = d[2], tr = m00 + m11 + m22
  let q: Q4
  if(tr > 0){ const S = Math.sqrt(tr + 1)*2; q = [(u[2] - d[1])/S, (d[0] - r[2])/S, (r[1] - u[0])/S, 0.25*S] }
  else if(m00 > m11 && m00 > m22){ const S = Math.sqrt(1 + m00 - m11 - m22)*2; q = [0.25*S, (u[0] + r[1])/S, (d[0] + r[2])/S, (u[2] - d[1])/S] }
  else if(m11 > m22){ const S = Math.sqrt(1 + m11 - m00 - m22)*2; q = [(u[0] + r[1])/S, 0.25*S, (d[1] + u[2])/S, (d[0] - r[2])/S] }
  else { const S = Math.sqrt(1 + m22 - m00 - m11)*2; q = [(d[0] + r[2])/S, (d[1] + u[2])/S, 0.25*S, (r[1] - u[0])/S] }
  return qNorm(q)
}
/** the ship's right, up and backward axes in the world, from its quaternion */
export function basisFromQuat(q: readonly number[]): [number[], number[], number[]] {
  const [x, y, z, w] = q
  return [
    [1 - 2*(y*y + z*z), 2*(x*y + w*z), 2*(x*z - w*y)],
    [2*(x*y - w*z), 1 - 2*(x*x + z*z), 2*(y*z + w*x)],
    [2*(x*z + w*y), 2*(y*z - w*x), 1 - 2*(x*x + y*y)]]
}
/**
 * A look round in flight, in the drag's own terms: `dYaw` turns about the ship's own up,
 * `dPitch` about its own right, with the same signs a level camera's yaw and pitch have —
 * so a drag feels the same as out of flight, but nothing stops it at the poles.
 */
export function flightLook(dYaw: number, dPitch: number): void {
  flight.q = qNorm(qMul(qMul(flight.q, qAxis(0, 1, 0, dYaw)), qAxis(1, 0, 0, -dPitch)))
}
/** the ship's orientation from a level camera's yaw and pitch (world frame) — for a state import */
export function flightOrientFromYawPitch(yaw: number, pitch: number): void {
  const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw)
  flight.q = quatFromBasis([cy, 0, -sy], [-sp*sy, cp, -sp*cy], [cp*sy, sp, cp*cy])
}
/** landing: the level camera's yaw and pitch that look where the ship looks (roll is let go) */
export function levelFromQuat(q: readonly number[]): { yaw: number; pitch: number } {
  const d = basisFromQuat(q)[2]
  return { yaw: Math.atan2(d[0], d[2]), pitch: Math.max(-1.45, Math.min(1.45, Math.asin(Math.max(-1, Math.min(1, d[1]))))) }
}

let lastDist = -1
/** take off from where the view is: the eye itself, with any pan folded in, becomes the ship */
export function flightStart(): void {
  const pv = 1.1547*cam.dist, pdx = -cam.panF[0]*pv*SKY_MIRROR, pdy = cam.panF[1]*pv
  for(let i=0;i<3;i++) flight.pos[i] = cam.smoothTarget[i] + basis.r[i]*pdx + basis.u[i]*pdy + basis.d[i]*cam.dist
  cam.panF[0] = cam.panF[1] = 0
  flight.on = flight.anchored = true
  flight.q = quatFromBasis(basis.r, basis.u, basis.d)   // the view as it is, whatever frame it was in
  flight.want[0] = flight.want[1] = flight.want[2] = 0; flight.axis[0] = flight.axis[1] = flight.axis[2] = 0; flight.stick[0] = flight.stick[1] = 0
  flight.throttle = 0; flight.burst = false; lastDist = cam.dist
  flight.factor = 1; flight.speedU = fullSpeed(cam.dist, 1, false)   // the readout has a pace before the first step
  cam.reseedFollow = true; cam.firstFrame = true    // the frame's target smoothing must not chase the hand-over
}
/** landing: the camera levels — yaw and pitch that look where the ship looked, roll let go */
export function flightLevel(): void {
  const { yaw, pitch } = levelFromQuat(flight.q)
  cam.yaw = yaw; cam.pitch = pitch
}
/** the controls go off; the ship stays where it stopped */
export function flightStop(): void {
  flight.on = false; flight.boost = false; flight.burst = false; flight.throttle = 0
  flight.want[0] = flight.want[1] = flight.want[2] = 0; flight.stick[0] = flight.stick[1] = 0
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
  for(let i=1;i<3;i++) flight.axis[i] += (sideWant(flight.want[i], flight.stick[i - 1]) - flight.axis[i])*k
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
