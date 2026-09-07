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
export const YR_PER_SIM = (225/GAL_PERIOD)*1e6;  // real years in one simulated year (~1.19e6)
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
