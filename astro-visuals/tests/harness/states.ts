/**
 * The states the parity gate photographs.
 *
 * These are not hand-placed cameras. Every one of them is a scenario the page already
 * ships in its `#jump` selector, applied through the selector and its GO button — the
 * flow a visitor uses. AGENTS.md is explicit about this ("test each event in the real
 * flow, not with the camera placed by hand"), and it matters here for a second reason:
 * a scenario sets the clock, the camera, the view target, the pace and the trails
 * together, so one option exercises a whole slice of the wiring the refactor is moving.
 *
 * Between them the fourteen states reach every draw pass in the piece: the galaxy from
 * inside the disk and from outside it, the globe lit and averaged, the Moon, both
 * galaxies through the merger, the red giant, the planetary nebula, the belts, the
 * trails, the labels and the HUD.
 */

export interface ParityState {
  /** File-safe name; the baseline PNG is `<id>.png`. */
  id: string
  /** The `#jump` option value, or null for the page's own opening view. */
  scenario: string | null
  /** Why this state is in the set — which passes or code paths it is here to cover. */
  covers: string
  /** Viewport. Most states use the desktop one; a couple check the phone layout. */
  viewport?: { width: number; height: number }
  /** Extra DOM driving applied after the scenario has settled, before the shot. */
  after?: readonly string[]
}

export const DESKTOP = { width: 1280, height: 800 } as const
export const PHONE = { width: 420, height: 800 } as const

export const STATES: readonly ParityState[] = [
  {
    id: 'opening-helix',
    scenario: 'helix',
    covers: 'the boot composition: bodies, both trail kinds, orbit rings, belts, the disk from inside',
  },
  {
    id: 'present-day',
    scenario: '',
    covers: 'the present-day default; the Sun at 1 L, no staged camera',
  },
  {
    id: 'theia-impact',
    scenario: '0.058',
    covers: 'the globe before the Moon exists — the follow-target fallback added in v2.78.0',
  },
  {
    id: 'young-earth',
    scenario: '0.768',
    covers: 'the globe shader early: noise surface, faint young Sun, no rock record',
  },
  {
    id: 'great-oxidation',
    scenario: '2.068',
    covers: 'the globe mid-Archean; atmosphere and climate terms in environment()',
  },
  {
    id: 'pangaea',
    scenario: '4.318p',
    covers: 'the plate lookup at a staged aim, lit face, ice from the rock record',
  },
  {
    id: 'plate-tectonics',
    scenario: '4.318',
    covers: 'the averaged-light path (uAvg) at ten million years a second, spin lock on',
  },
  {
    id: 'gliese-710',
    scenario: '4.5692567',
    covers: 'the Oort shell, the real-sky star pass, a named passing star',
  },
  {
    id: 'pangaea-proxima',
    scenario: '4.818x',
    covers: 'the plate model run forward past today',
  },
  {
    id: 'oceans-boil',
    scenario: '5.6v',
    covers: 'uSeaLevel and uDry at their extremes; the Sun brightening',
  },
  {
    id: 'andromeda-first-pass',
    scenario: '8.36149',
    covers: 'both galaxies drawn at once, M31_ORBIT control points, true-scale separation',
  },
  {
    id: 'galaxies-merge',
    scenario: '11.25',
    covers: 'uMerge relaxing both disks, damped spins, the tone-map knee under heavy additive stacking',
  },
  {
    id: 'sun-swallows-earth',
    scenario: '11.3586',
    covers: 'sunState at the red-giant tip, the engulfment flares, the Earth panel retitling',
  },
  {
    id: 'anthropic-nebula',
    scenario: '12.35',
    covers: 'the staged planetary-nebula shader (PN_FS) and the remnant pass',
  },
  {
    id: 'after-the-merger',
    scenario: '13.5',
    covers: 'the settled spheroid; the HUD stat swapped to distance-from-centre',
  },
  {
    id: 'phone-panels',
    scenario: 'helix',
    viewport: PHONE,
    covers: 'the phone layout: panel docking, the wrapped status bar, the held bar width',
    after: ['#simPanel', '#envPanel'],
  },
]
