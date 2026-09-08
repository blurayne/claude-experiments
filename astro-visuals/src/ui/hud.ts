import type { UnitMode } from '../core/format'

/**
 * What the interface has been set to.
 *
 * These are the viewer's choices, and the frame reads every one of them: which populations are
 * drawn, how bright the faint stars carry, how far the swept paths reach, whether the clock's
 * variability runs. They were two dozen top-level `let`s in main.ts, which worked only because
 * everything shared one scope.
 *
 * One object rather than two dozen exports, because a `let` cannot be re-exported live: an
 * importer would get a copy of its value at import time and never see it change. A field on a
 * shared object is read at the moment it is read, which is what the frame needs.
 *
 * `00-PLAN.md` is explicit that these belong to `ui/`, not to `render/state`: they are what a
 * person asked for, not what the renderer worked out.
 */
export const hud = {
  /** what is drawn */
  showTrails: true,
  showLabels: true,
  showStats: true,
  showDwarfs: true,
  showBelt: true,
  showKuiper: true,
  showOort: true,
  /** Planet Nine is hypothetical, and has its own switch */
  showP9: true,
  showFps: false,
  dustOn: true,
  /** the arm and galaxy names */
  armsOn: true,
  /** the variability clock — wall time, so it runs even while paused */
  varOn: true,

  /** how often the readouts are redrawn; the frame counter is counted every frame regardless */
  hudHz: 8,

  /**
   * One slider, two effects, because they are the same intent: make the faint stars carry. It
   * lifts a floor under their colour and widens the smallest sprites, which is where most of
   * the lost light actually goes. `starGain` is the slider; the other two are what it means.
   */
  minBright: 0.05*0.38,
  minSprite: 1.3 + 0.05*2.1,
  starGain: 0.05,

  /**
   * How much headroom the bright cores get before they saturate. 1 ("off", the default) is the
   * old behaviour: no compression, and a merging pair of cores reads as one white blob. Left
   * off by default because it is a corrective for that one situation, not something every
   * scene should pay a render pass for.
   */
  coreKnee: 1,

  /** each slider is its own switch: invisibility is off, and psH/psO are what that means */
  trailAlpha: 1,
  orbitAlpha: 1,
  psH: true,
  psO: true,
  trailPct: 300,

  /** supernovae and births are opt-in; lifeOn is the two of them together */
  lifeOn: false,
  evSN: false,
  evBirth: false,

  /** the calendar's own two choices */
  calMode: 'ad',
  unitMode: 'words' as UnitMode,
  /** retired control; the rate view lives in the calendar options */
  liveCount: false,
}
