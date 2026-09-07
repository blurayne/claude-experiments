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
