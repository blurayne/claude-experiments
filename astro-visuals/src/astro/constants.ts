/**
 * The numbers the simulation is built on, and where each comes from.
 *
 * Copied across verbatim, including the ones that look redundant. V_GAL writes 900 rather
 * than R_GAL, and zoomStep clamps to 9500 while the wheel clamps to 7500; unifying either
 * would be a behaviour change wearing a tidy-up's clothes, and this refactor is not allowed
 * to make behaviour changes. Where two constants ought to agree and do not, that is a
 * question for the science work, not for the move.
 *
 * The arm geometry lives here rather than with the galaxy that draws it, because
 * environment() reads ARMS and armAngle to decide when the Sun crosses a spiral arm — and
 * astro must not depend on scene.
 */
import type { Vec3 } from '../core/mat4'

export const R_GAL = 900;            // scene units: Sun's distance from galactic core
export const V_GAL = 2*Math.PI*900/225e6;  // scene units per Earth year: one lap in 225 Myr, exactly
export const GAL_PERIOD = 2*Math.PI*R_GAL/V_GAL; // sim "galactic year" in Earth-years (display only)
// Real years in one simulated year. The arithmetic cancels to exactly 1: GAL_PERIOD is
// 2*pi*R_GAL/V_GAL and V_GAL is 2*pi*900/225e6, so with R_GAL = 900 this is 225e6/225e6.
// The comment here used to claim ~1.19e6, left over from a design that did compress time.
// One simulated year IS one Earth year, which is what AGENTS.md's "one clock" rule requires,
// and tests/unit/earth.test.ts pins it.
export const YR_PER_SIM = (225/GAL_PERIOD)*1e6;
export const AGE0 = 4.568;                       // Gyr: age of the solar system at simT = 0
export const AND_AGE = 9.07;                     // Gyr: Andromeda's first passage, ~4.5 Gyr from now
// The merger scatters the Sun outward. N-body work on this encounter (Cox & Loeb 2008)
// finds a median final distance near 30 kpc against today's 8 — roughly 3.75x out — with
// about a 12% chance of the tidal tails beyond that and 3% of ending up bound to
// Andromeda instead. This follows the median outcome.
export const SCATTER_AGE = 11.45;   // Gyr: the second passage, where the scatter begins
export const SR_A = 3.75, SR_B = 2.75, SR_K = 1/0.9;   // sunR/R_GAL = SR_A - SR_B·e^(-SR_K·u)

// ecliptic tilted 60.2° to the galactic plane; orientation is inertially fixed
export const TILT = 60.2*Math.PI/180;
export const E1: Vec3 = [1,0,0];
export const E2: Vec3 = [0, Math.sin(TILT), -Math.cos(TILT)];

// real scale: 1 unit ~ 30 ly, 1 ly = 63,241 AU -> units per AU
export const AU2U = 1/(63241*30);
/**
 * True proportions, always. The magnified display mode is gone, and this was a `let` whose
 * only assignment in the whole file was its own declaration. A const, so astro/ stops
 * depending on a mutable the renderer owns.
 */
export const REAL_MODE = true

export const OO_REAL = 3.0e-4; // real mode: maps the symbolic Oort shell onto its true ~1.6 ly outer edge

// two fainter arms (Sagittarius, Norma/Outer), and the Local (Orion) Spur at the Sun.
export const PITCH = Math.tan(12.5*Math.PI/180);   // Milky Way arm pitch angle ≈ 12–13°
export const BAR_L = 500;                          // bar half-length
export const BAR_A = 28*Math.PI/180;               // bar angle to the Sun–center line (+z)
// trailing log-spirals: going outward, arms sweep backward against the rotation
export const armAngle = (r: number, off: number) => off - Math.log(r/BAR_L)/PITCH;
export const ARMS = [
  [BAR_A,             1.00],  // Scutum–Centaurus (near bar tip)
  [BAR_A+Math.PI,     1.00],  // Perseus (far bar tip)
  [BAR_A+Math.PI/2,   0.50],  // Sagittarius
  [BAR_A+3*Math.PI/2, 0.50],  // Norma / Outer
];
export const sA = Math.sin(BAR_A), cA = Math.cos(BAR_A);

/**
 * The two pattern speeds, both anchored to measurements (v3.1, the rotation work).
 *
 * Each is the corotation radius in scene units — the radius where a star's own angular
 * speed matches the pattern's, which with the flat curve V_GAL fixes the pattern speed as
 * V_GAL/rc. The Sun sits at R_GAL = 900 = 8.2 kpc, so 900 units/8.2 kpc converts.
 *
 * RC_BAR: the bar and the four arms it drives. 650 units = 5.9 kpc corotation, pattern
 * speed 230/5.9 ≈ 39 km/s/kpc — the published bar speed (35–40 across the Gaia-era
 * fits). The Sun lies OUTSIDE this corotation, so these arms overtake the Sun: one
 * sweeps past about every 146 Myr, which is the cadence the glacial epochs ride on and
 * within errors the ~140 Myr the deep-time table quotes. (The pre-3.1 single pattern
 * used 640; the bar measurement lands within two percent of it.)
 *
 * RC_ARMS: the Local (Orion) Spur. 933 units = 8.5 kpc, the measured spiral-arm
 * corotation, just outside the Sun's 8.2 — so the Sun runs slightly FASTER than its
 * spur, creeping deeper into it and eventually leaving out the front, exactly as the
 * kinematics have it. One relative lap takes ~6 Gyr: the spur is our neighbourhood for
 * the rest of the disk's life.
 */
/**
 * How the galaxy ASSEMBLED (v3.6, after the VINTERGATAN storyline — Agertz, Renaud
 * et al. 2021: a cosmological zoom of a Milky Way-mass galaxy).
 *
 * asmAt(ts) is the disk's settledness, exactly 1 today so the present picture is
 * untouched: 0 in the protogalactic dark, rising as the disk grows and thins, settled
 * once the thin disk is in place (~6 Gyr after the Big Bang — the bar and today's
 * pattern belong to this era). chaosAt(ts) is the merger turbulence on top: high
 * through the chaotic early accretion, spiking at the Gaia-Enceladus merger ~10 Gyr
 * ago (the event that built the inner halo and puffed the thick disk), and dying to
 * zero well before today. Both feed the vertex shader as uniforms, where going back in
 * time contracts the disk, puffs and scrambles it, and turns it blue and clumpy.
 */
export const asmAt = (ts: number): number => {
  const u = (13.787e9 + ts)/1e9;               // Gyr after the Big Bang
  if(u <= 0.45) return 0;
  const x = Math.min(1, (u - 0.45)/5.6);
  return x*x*(3 - 2*x);
};
export const chaosAt = (ts: number): number => {
  const u = (13.787e9 + ts)/1e9;
  if(u <= 0) return 0;
  const enceladus = Math.exp(-Math.pow((u - 3.8)/0.9, 2));   // the big one, ~10 Gyr ago
  const c = Math.min(1, (1 - asmAt(ts))*0.8 + enceladus*0.9);
  return c < 1e-6 ? 0 : c;   // exactly zero today — e^-123 is not a number to ship a wobble on
};

/** When the Sun and its planets condensed, on the sim clock: before this there is no
 * solar system to draw, and no age of one to report. */
export const SUN_BORN_T = -AGE0*1e9/YR_PER_SIM;

/** The Big Bang, on this page's clock (real years from today): the universe is ~13.787 Gyr
 * old, and the clock refuses to scrub before it — there is nothing there to draw. */
export const T_BIG_BANG = -13.787e9;

export const RC_BAR = 650;
export const RC_ARMS = 933;

/**
 * The arms evolve: the two patterns beat (v3.1).
 *
 * "Computer simulations rarely produce a single long-lived wave… a typical spiral probably
 * hosts two or more overlapping waves moving at different speeds, which beat against each
 * other and make arms come and go" — the ingested explainer, and the modern literature
 * behind it (swing amplification; Sellwood & Carlberg's transient recurrent spirals). With
 * static point sets the geometry cannot re-form, but its BRIGHTNESS can carry the beat: each
 * arm waxes and wanes as the two patterns' relative phase du(t) sweeps an m=2 mode across
 * it. The two strong arms fade while the weak pair brightens and back — the disk oscillates
 * between a two-armed and a four-armed appearance, which is literally the state of the
 * observational debate — with a full cycle of 2π/(2·Δω) ≈ 268 Myr.
 *
 * At ts = 0 the beat is identically 1 everywhere, so the present-day picture is exact.
 */
export const ARM_EVO_AMP = 0.30;
/** the two patterns' relative phase at a given clock reading, in radians */
export const patternPhase = (ts: number): number => ts*V_GAL*(1/RC_BAR - 1/RC_ARMS);
/**
 * How bright an arm anchored at pattern-frame azimuth `off` runs at clock ts, ≥ 0.05.
 * The same formula the vertex shader applies per point; keep the two in step.
 */
export const armBeat = (ts: number, off: number): number => {
  const du = patternPhase(ts);
  return Math.max(0.05, 1 + ARM_EVO_AMP*(Math.cos(2*off - 2*du) - Math.cos(2*off)));
};
