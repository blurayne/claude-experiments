/**
 * The measured orbits round Sagittarius A*, and the black hole's own numbers.
 *
 * Every row is a published Keplerian solution: semi-major axis in milliarcseconds, the
 * eccentricity, then the three angles in degrees (inclination, longitude of the ascending
 * node, argument of pericentre), the epoch of pericentre and the period in years. S2's is the
 * GRAVITY Collaboration's interferometric solution (2020, A&A 636, L5 — the Schwarzschild
 * precession paper); the rest are Gillessen et al. 2017 (ApJ 837, 30, Table 3), the
 * twenty-five-year VLT/Keck monitoring. Two famous claims are deliberately absent: S62 and
 * S4714, whose sub-ten-year orbits (Peißker et al.) the GRAVITY imaging did not reproduce.
 *
 * `tools/fetch_sstars.py` regenerates this file from VizieR's copy of the 2017 table
 * (J/ApJ/837/30) on GitHub's runner, where the astronomy hosts are reachable; the sandbox
 * that wrote the first version could not reach them, so these are the papers' values as
 * transcribed, and the runner is what checks them. Edit the tool, not this file.
 */

export interface SStar {
  name: string
  /** semi-major axis, milliarcseconds */
  aMas: number
  e: number
  /** inclination to the plane of the sky, degrees */
  i: number
  /** longitude of the ascending node, degrees east of north */
  om: number
  /** argument of pericentre, degrees */
  w: number
  /** epoch of pericentre, decimal year */
  t0: number
  /** period, years */
  P: number
}

/** shortest period first, so the stars a visitor will actually see move come first */
export const SSTARS: readonly SStar[] = [
  { name: 'S55',   aMas: 107.8,    e: 0.7209,    i: 150.1,    om: 325.5,    w: 331.5,    t0: 2009.34,   P: 12.8 },
  { name: 'S2',    aMas: 125.058,  e: 0.884649,  i: 134.567,  om: 228.171,  w: 66.263,   t0: 2018.38,   P: 16.0455 },
  { name: 'S38',   aMas: 141.6,    e: 0.8201,    i: 171.1,    om: 101.06,   w: 17.99,    t0: 2003.19,   P: 19.2 },
  { name: 'S21',   aMas: 219,      e: 0.764,     i: 58.8,     om: 259.64,   w: 166.4,    t0: 2027.4,    P: 37 },
  { name: 'S13',   aMas: 264.1,    e: 0.425,     i: 24.7,     om: 74.5,     w: 245.2,    t0: 2004.86,   P: 49 },
  { name: 'S9',    aMas: 272.4,    e: 0.644,     i: 82.41,    om: 156.6,    w: 150.6,    t0: 1976.71,   P: 51.3 },
  { name: 'S14',   aMas: 286.3,    e: 0.9761,    i: 100.59,   om: 226.38,   w: 334.59,   t0: 2000.12,   P: 55.3 },
  { name: 'S12',   aMas: 298.7,    e: 0.8883,    i: 33.56,    om: 230.1,    w: 317.9,    t0: 1995.59,   P: 58.9 },
  { name: 'S17',   aMas: 355.9,    e: 0.397,     i: 96.83,    om: 191.62,   w: 326,      t0: 1991.19,   P: 76.6 },
  { name: 'S8',    aMas: 404.7,    e: 0.8031,    i: 74.37,    om: 315.43,   w: 346.7,    t0: 1983.64,   P: 92.9 },
  { name: 'S31',   aMas: 449,      e: 0.5497,    i: 109.03,   om: 137.16,   w: 308,      t0: 2018.07,   P: 108 },
  { name: 'S1',    aMas: 595,      e: 0.556,     i: 119.14,   om: 342.04,   w: 122.3,    t0: 2001.8,    P: 166 },
  { name: 'S24',   aMas: 944,      e: 0.897,     i: 103.67,   om: 7.93,     w: 290,      t0: 2024.5,    P: 331 },
  { name: 'S54',   aMas: 1200,     e: 0.893,     i: 62.2,     om: 288.35,   w: 140.8,    t0: 2004.46,   P: 477 },
]

/**
 * Sagittarius A* itself. Mass and distance from the GRAVITY Collaboration's 2022 multi-star
 * fit (A&A 657, L12); the J2000 position is the radio source's; the shadow's size is what the
 * Event Horizon Telescope measured in 2022 (ApJL 930, L12: a ring 51.8 ± 2.3 μas across).
 */
export const SGRA_MASS_MSUN = 4.297e6
export const SGRA_R0_PC = 8277
export const SGRA_RA = 266.41683      // 17h 45m 40.04s
export const SGRA_DEC = -29.00781     // −29° 00′ 28.1″
export const EHT_RING_UAS = 51.8

/**
 * Gaia BH1: the nearest black hole known, from El-Badry et al. 2023 (MNRAS 518, 1057). A
 * Sun-like star on a 186-day orbit round an unseen 9.6-solar-mass companion, 483 parsecs away
 * toward Ophiuchus. The position is the companion star's, Gaia DR3 4373465352415301632 — the
 * source id itself encodes the sky pixel, and the coordinates were checked against it.
 * The periastron epoch is the fit's, to the day or so; at any rate the piece can show, a day
 * of phase is nothing.
 */
export const BH1 = {
  ra: 262.17121,        // Gaia DR3, via VizieR
  dec: -0.58109,
  distPc: 483,
  massBH: 9.62,        // solar masses
  massStar: 0.93,
  starTeffK: 5850,
  aAU: 1.40,           // the relative orbit's semi-major axis
  e: 0.451,
  i: 126.6,
  om: 97.8,
  w: 12.8,
  Pdays: 185.59,
  t0: 2016.04,         // JD 2457403.6, roughly
}
