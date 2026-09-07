import { AGE0 } from '../astro/constants'

/**
 * The state the renderer and the interface share.
 *
 * In one long script every one of these was a top-level `let` that anything could assign. An
 * imported binding cannot be assigned, so they gather into singleton objects instead — the
 * same mutability, but with one owner per field and a name that says where it lives.
 *
 * Plain data only. Nothing here touches gl, the DOM or Math.random, so it can be imported
 * from anywhere without dragging a context along.
 */

/**
 * The clock, and everything that moves with it.
 *
 * `simT` is the elapsed Earth years the whole piece counts — one simulated year is one Earth
 * year, and every readout is derived from this one number. `shimT` is the other clock: wall
 * time, which keeps the variable stars twinkling even while the simulation is paused, and
 * which is why the parity harness has to stop both.
 */
export const simClock = {
  /** Elapsed Earth years. Every readout in the piece counts this. */
  simT: 0,
  /** Wall-clock seconds, for the variability phase. Runs even while paused. */
  shimT: 0,
  /** Years per second at the slider's rung; multiplied by speedMult for the effective rate. */
  speed: 1.5,
  speedMult: 1,
  /** −100..100. Zero means "not engaged", so play/pause keeps the clock; off zero it outranks pause. */
  shuttle: 0,
  shuttleLastSign: 0,
  paused: false,
  /** Trail sampling: the next simT to sample at, and the spacing the length slider sets. */
  nextSample: 0.01,
  dtSample: 0.01,
  /** Wall-clock guards for the trail rebuild and the anchor rebase. */
  trailRefillAt: 0,
  lastAnchor: 0,
  /** The previous frame's rAF timestamp, for dt. */
  last: 0,
  /** Tells the clock running across an engulfment from a jump straight past it. */
  lastAgeSeen: AGE0,
}

/**
 * Where the camera is, and what it is following.
 *
 * `yaw` and `pitch` are in the world frame normally and in the PLANET's frame when spinLock
 * is on — that is what keeps the same face in view at any clock rate, and why switching the
 * lock re-expresses the current line of sight rather than jumping. `dirW` is the line of
 * sight in world coordinates, written every frame, so the two frames can be reconciled.
 *
 * `panF` is a fraction of the view's height, not a world offset: a pan has to survive a zoom,
 * and a world offset made at galaxy scale would strand the Sun a thousand units away after a
 * dive.
 */
export const cam = {
  yaw: 0.9,
  pitch: 0.32,
  dist: 150,
  distGoal: 150,
  target: [0, 0, 0],
  follow: true,
  /** Dive: hold the camera on the Sun-to-core line. */
  coreLock: false,
  /** Which absolute-frame position the camera tracks: 'sun' | 'earth' | 'moon' | 'and'. */
  followTarget: 'sun',
  /** The camera turns with the planet, so the same face stays in view while the clock runs. */
  spinLock: false,
  /** Set wherever the view is re-seeded; the frame consumes it and clears it. */
  reseedFollow: false,
  firstFrame: true,
  /** Two-finger pan, as a fraction of the view height along the camera's right and up. */
  panF: [0, 0],
  smoothTarget: [0, 0, 0],
  /** Decays toward zero and never re-grows from the target's own motion. */
  smoothOfs: [0, 0, 0],
  /** The line of sight in world coordinates, written every frame. */
  dirW: [0, 0, 1],
  spinP: new Float64Array(3),
}
