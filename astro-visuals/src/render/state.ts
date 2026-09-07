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

/**
 * Everything the GPU is currently holding, and how much of it there is.
 *
 * Flat, with the original names, rather than nested by population. The plan sketched
 * `gfx.gxy.vao` and friends, which reads better — but nesting is a second change riding on a
 * rename across a hundred and thirty call sites, and every rename in this migration has found
 * at least one place where a bare identifier was not a variable reference. The shape can be
 * improved once the draw passes exist and there is something to shape it around.
 *
 * The counts are not decoration: several draw calls are `drawArrays(POINTS, first, count)`
 * over segments of one buffer, so NUC0/NUC1 and the PINK/GLOW pairs are the difference
 * between drawing the nuclear star cluster and drawing the whole galaxy.
 */
export const gfx = {
  /** Active galaxy density. setGalaxy writes it; the life-cycle rates read it. */
  curD: 1,

  // Milky Way: stars, nebulae, dust.
  N_GXY: 0, NEB_N: 0, DUST_N: 0,
  vaoGxy: null as WebGLVertexArrayObject | null,
  vaoNeb: null as WebGLVertexArrayObject | null,
  vaoDust: null as WebGLVertexArrayObject | null,
  /**
   * Segment boundaries inside the nebula buffer, which holds three runs in order: Halpha
   * pink, the diffuse haze, then the core. The frame draws them in two halves around the
   * dust — the haze goes down first and the dark clouds darken it, then the stars, the HII
   * and the core go over both — so a cloud sits within the star field rather than on top of
   * it. These are the run lengths that split it.
   */
  NEB_PINK: 0, NEB_GLOW: 0,
  /**
   * The galaxy star buffer's nuclear run — the ~200 pc nuclear disc and the 4 pc cluster
   * around Sgr A* — as an index range [NUC0, NUC1). From inside the disk those stars are not
   * drawn: at 8 kpc they collapse onto one pixel, add up to a hard bright spot, and sit
   * behind ~30 magnitudes of extinction that the dust pass cannot reproduce. Only these; the
   * bulge proper still draws, as the Sagittarius star clouds do. 0,0 when there is none.
   */
  NUC0: 0, NUC1: 0,
  hideNucleus: true,

  // Andromeda, built by the same machinery.
  N_AND: 0, N_ANDN: 0, N_ANDD: 0,
  vaoAnd: null as WebGLVertexArrayObject | null,
  vaoAndNeb: null as WebGLVertexArrayObject | null,
  vaoAndDust: null as WebGLVertexArrayObject | null,
  AND_PINK: 0, AND_GLOW: 0,

  // The real sky, from AT-HYG and Gaia DR3.
  vaoGaia: null as WebGLVertexArrayObject | null,
  N_GAIA: 0,
  gaiaOn: true,
  vaoGaiaDeep: null as WebGLVertexArrayObject | null,
  N_GAIA_DEEP: 0,
  deepAsked: false,

  /** The probability maps and the Earth texture, once their fetches land. */
  galaxyMap: null as unknown,
  m31Map: null as unknown,
  earthTex: null as WebGLTexture | null,

  /** How deep into the dust the deep-Gaia stars are still drawn. */
  DUST_DEEP_CAP: 40.0,
}

/** The drawing surface, and the framebuffer the scene resolves through. */
export const view = {
  W: 0, H: 0, DPR: 1,
  /** Rebuilt every frame, because the near plane tracks the camera distance. */
  projMat: null as Float32Array | null,
  /** The first-launch probe lowers this on a slow device, and it is saved. */
  dprCap: 2,
  /**
   * The RGBA16F target the scene renders into before the tone-map resolve. Without it,
   * additive stacking clips galaxy cores to flat white — 0.59% of the frame at the merger,
   * which is where all the structure went. `ok` is false when EXT_color_buffer_float is
   * missing, and the direct-to-screen path is used unchanged.
   */
  hdrFB: null as WebGLFramebuffer | null,
  hdrTex: null as WebGLTexture | null,
  hdrOK: false,
}

/**
 * What the last frame worked out. Written by the draw, read by the HUD and the panels — and
 * in two cases by nothing at all inside the page.
 *
 * `earthDbg` and `probeInfo` have no in-file readers: a classic script put them on the global
 * object by accident, and a module does not, so they are published deliberately through
 * `__gt` or they become unreachable and then tree-shaken.
 */
export const readout = {
  /** The globe's and the Moon's apparent size. Labels and structure names hide above 40 px. */
  globePx: 0,
  moonPx: 0,
  /** Distance to the SUN, not to the followed body — the Sun's disc and the nebula size on it. */
  camSunDist: 150,
  /** Eased 0..1: past a few weeks a second a frame spans days, so the globe is lit by the daily mean. */
  avgLight: 0,
  plasmaSunPx: 0,
  /** The planetary nebula is on screen this frame, so its label follows it. */
  pnShown: false,
  /** How many births and supernovae the last fillEvents() actually wrote. */
  evN: 0,
  snN: 0,
  frameDt: 1 / 60,
  earthDbg: null as unknown,
  probeInfo: null as unknown,
}

/**
 * Fractional accumulators for the stellar life cycle: births, supernovae, planetary nebulae.
 *
 * Named `lifeAcc`, not `life`, because setStateColour already has a local `life` — an array
 * of RGB values — and a singleton that only works because a local happens to shadow it is a
 * trap for whoever edits that function next.
 */
export const lifeAcc = { accB: 0, accSN: 0, accPN: 0 }
