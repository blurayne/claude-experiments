/**
 * The states the parity gate photographs.
 *
 * Most are not hand-placed cameras but scenarios the page already ships in its `#jump`
 * selector, applied through the selector and its GO button — the flow a visitor uses.
 * AGENTS.md is explicit about this ("test each event in the real flow, not with the camera
 * placed by hand"), and it matters twice over here: one option sets the clock, the camera,
 * the view target, the pace and the trails together, so it exercises a whole slice of the
 * wiring the refactor is moving.
 *
 * The rest exist because 00-PLAN.md §5.2 lists nine things today's harness cannot see. Three
 * of the CSS hazards and three of the boot hazards pass a screenshot gate that photographs
 * only the desktop viewport, only a returning visitor, and only one timezone — so they are
 * photographed here instead.
 */

export interface ParityState {
  /** File-safe name; the baseline PNG is `<id>.png`. */
  id: string
  /** The `#jump` option value; `''` is "present day"; `null` leaves the opening view alone. */
  scenario: string | null
  /** Why this state is in the set — which passes or code paths it is here to cover. */
  covers: string
  viewport?: { width: number; height: number }
  /** Boot without saved settings, so the first-launch path and the perf probe run. */
  freshProfile?: boolean
  /** Default 'reduce', which is what keeps the clock stopped at boot. */
  reducedMotion?: 'reduce' | 'no-preference'
  /** Default UTC. A second timezone proves the build stamp is not baked into the pixels. */
  timezone?: string
  /** Extra selectors clicked after the scenario has been applied, before the shot. */
  after?: readonly string[]
}

export const DESKTOP = { width: 960, height: 600 } as const
export const PHONE = { width: 420, height: 800 } as const

export const STATES: readonly ParityState[] = [
  // ---- the scenarios: between them these reach every draw pass in the piece ----
  { id: 'opening-helix', scenario: 'helix',
    covers: 'the boot composition: bodies, both trail kinds, orbit rings, belts, the disk from inside' },
  { id: 'present-day', scenario: '',
    covers: 'the present-day default; the Sun at 1 L, no staged camera' },
  { id: 'theia-impact', scenario: '0.058',
    covers: 'the globe before the Moon exists — the follow-target fallback added in v2.78.0' },
  { id: 'young-earth', scenario: '0.768',
    covers: 'the globe shader early: noise surface, faint young Sun, no rock record' },
  { id: 'great-oxidation', scenario: '2.068',
    covers: 'the globe mid-Archean; the atmosphere and climate terms in environment()' },
  { id: 'pangaea', scenario: '4.318p',
    covers: 'the plate lookup at a staged aim, lit face, ice from the rock record' },
  { id: 'plate-tectonics', scenario: '4.318',
    covers: 'the averaged-light path (uAvg) at ten million years a second, spin lock on' },
  { id: 'gliese-710', scenario: '4.5692567',
    covers: 'the Oort shell, the real-sky star pass, a named passing star' },
  { id: 'pangaea-proxima', scenario: '4.818x',
    covers: 'the plate model run forward past today' },
  { id: 'oceans-boil', scenario: '5.6v',
    covers: 'uSeaLevel and uDry at their extremes; the Sun brightening' },
  { id: 'andromeda-first-pass', scenario: '8.36149',
    covers: 'both galaxies at once, the M31_ORBIT control points, true-scale separation' },
  { id: 'galaxies-merge', scenario: '11.25',
    covers: 'uMerge relaxing both disks, damped spins, the tone-map knee under heavy additive stacking' },
  { id: 'sun-swallows-earth', scenario: '11.3586',
    covers: 'sunState at the red-giant tip, the engulfment flares, the Earth panel retitling' },
  { id: 'anthropic-nebula', scenario: '12.35',
    covers: 'the staged planetary-nebula shader (PN_FS) and the remnant pass' },
  { id: 'after-the-merger', scenario: '13.5',
    covers: 'the settled spheroid; the HUD stat swapped to distance-from-centre' },

  // ---- 00-PLAN.md §5.2: coverage the scenario list alone does not give ----

  // R7(b,c). `.gamebar .stat b` @380 is unconditional and beats the @820px media query, and
  // #tourLogo is 96px rather than 88px purely because one rule follows another. Splitting the
  // stylesheet can reorder both without any desktop screenshot noticing.
  { id: 'viewport-610', scenario: 'helix', viewport: { width: 610, height: 800 },
    covers: 'CSS band 601–620' },
  { id: 'viewport-700', scenario: 'helix', viewport: { width: 700, height: 800 },
    covers: 'CSS band 621–820' },
  { id: 'viewport-900', scenario: 'helix', viewport: { width: 900, height: 800 },
    covers: 'CSS band ≥821' },
  { id: 'viewport-600x760', scenario: 'helix', viewport: { width: 600, height: 760 },
    covers: 'CSS: ≤620 wide AND ≤790 tall, the only rule keyed on both' },
  { id: 'phone-panels', scenario: 'helix', viewport: PHONE, after: ['#simPlus'],
    covers: 'the phone layout: panel docking, crowd eviction, the wrapped status bar' },

  // NOTE: there is no `fresh-profile` state here, and that is a decision rather than an
  // oversight. The first-visit path runs the performance probe, which MEASURES THE MACHINE
  // and picks a detail tier from the result — so photographing it twice runs the benchmark
  // twice and can legitimately get two answers. It came back 35% different with a max delta
  // of 254: not a rendering difference, a different number of stars. A benchmark cannot be
  // compared pixel-wise, so that path is asserted in tests/e2e/boot.spec.ts instead, where
  // what matters is that it runs, picks a tier, and stages the opening without error.

  // R24. The reduced-motion click at 4721 flips `paused` before restoreSettings and before
  // the opening scenario; jumpToEpoch re-checks the same query in six places. Both branches
  // need photographing, and only one of them has been.
  { id: 'motion-allowed', scenario: 'helix', reducedMotion: 'no-preference',
    covers: 'the branch where the piece is allowed to start its own clock' },

  // R23. localBuildStamp() reads Intl and getTimezoneOffset at eval time and the result is
  // written into #buildStamp and #tourBuild. Two zones must give the same pixels, or the
  // gate is photographing the host rather than the build.
  { id: 'timezone-tokyo', scenario: 'helix', timezone: 'Asia/Tokyo',
    covers: 'the build stamp under a second timezone' },

  // R25, R30. #tip is created by JS, styled by hud.css, and positioned from offsetWidth read
  // immediately after display:block. If the stylesheet is applied late the tooltip lands in
  // the wrong place — and nothing else in the suite opens one.
  // The Settings panel is hidden by default, so its (i) icons have no layout and cannot be
  // clicked. The Earth panel is open from boot and carries the spin-lock tip, which goes
  // through the identical path: one #tip element, created by JS, positioned from offsetWidth.
  { id: 'tooltip-open', scenario: 'helix', after: ['#env .info'],
    covers: 'the (i) tooltip: created at runtime, measured against a stylesheet that must already apply' },
]

/**
 * States whose content is machine-dependent by design. Empty now that the probe-driven one
 * has moved to the boot suite; kept because the next such state should land here rather than
 * quietly widening the threshold for everybody.
 */
export const TOLERANT = new Set<string>()

/**
 * A cheaper subset for per-step checking. Between them these five reach the galaxy from
 * inside and outside, both globes, the merger, the belts, both trail kinds and the tone-map
 * knee — the passes a structural move is most likely to disturb. The full set still runs at
 * every phase boundary and before any merge; this is for keeping a twenty-step migration
 * moving, not a replacement for it.
 */
export const FAST_STATES = new Set([
  'opening-helix',
  'galaxies-merge',
  'pangaea',
  'anthropic-nebula',
  'phone-panels',
])

/** `PARITY_SCOPE=fast` selects the subset above. Anything else runs all of them. */
export const SELECTED: readonly ParityState[] =
  process.env.PARITY_SCOPE === 'fast' ? STATES.filter((s) => FAST_STATES.has(s.id)) : STATES
