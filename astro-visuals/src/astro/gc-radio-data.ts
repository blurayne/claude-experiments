/**
 * The Galactic Centre's radio sky: the named objects of the wide-field 90-cm VLA image
 * (LaRosa, Kassim, Lazio & Hyman 2000, AJ 119, 207), the picture that shows the inner
 * four degrees of the Galaxy as a radio telescope sees them — the thermal HII complexes
 * Sgr A to Sgr E along the plane, the supernova remnants, and the nonthermal filaments
 * (the Arc, the Snake, the threads, the Pelican) that run across the plane and exist
 * nowhere else in the Galaxy.
 *
 * Every row is a catalogue position: galactic longitude and latitude in degrees, read
 * from the object's designation (the G-name encodes l and b to a hundredth of a degree),
 * with the sizes from Green's catalogue of supernova remnants (2019, the VII/284 VizieR
 * copy) and the papers named in `src`. Two objects the image names have no designation
 * this table could quote — "the Cane" and the background galaxy — and their positions
 * were measured off the annotated image against the objects that do have one; they are
 * flagged `fromImage`, disclosed in the article, and `tools/fetch_gc_radio.py` on GitHub's
 * runner (where VizieR is reachable) checks the table against J/AJ/119/207 and Green's
 * catalogue and rewrites what it can verify. The sandbox that wrote this could reach
 * neither, so — as with the S-stars — these are the papers' values as transcribed, and
 * the runner is what checks them.
 *
 * All of it is placed at Sagittarius A*'s distance, in the plane of the sky through it.
 * The depths are not known to the precision the drawing would need (Sgr B2 is some 130 pc
 * nearer than Sgr A*, Reid et al. 2009; the rest are inferred from absorption at best), so
 * the field is drawn as the map shows it: a sky. The article says so.
 */

export type RadioKind =
  /** a thermal HII complex: a soft glow */
  | 'hii'
  /** a supernova remnant: a limb-brightened shell */
  | 'snr'
  /** a nonthermal filament: a thin bright line, usually across the plane */
  | 'ntf'
  /** a pulsar wind nebula in flight: a bright head and a tail behind it */
  | 'pwn'
  /** a cluster of compact HII regions */
  | 'cluster'
  /** a background radio galaxy: a compact double, nothing to do with the Centre */
  | 'galaxy'
  /** Sagittarius A itself: the East shell, West and the halo, one bright knot */
  | 'core'
  /** the diffuse emission of the plane between Sgr B and Sgr C — a model, see below */
  | 'ridge'

export interface RadioObject {
  /** the name the image uses */
  name: string
  /** the catalogue designation, where there is one */
  g: string
  kind: RadioKind
  /** galactic longitude and latitude, degrees */
  l: number
  b: number
  /** the long and short axes, arcminutes (a filament's length and width) */
  maj: number
  min: number
  /** the long axis's position angle in the galactic frame: 0 along +b (across the plane), 90 along +l */
  pa: number
  /** a filament's gentle bend, as a fraction of its length (the Snake's kink) */
  bend?: number
  /** a composite remnant's bright core (G0.9+0.1's pulsar wind nebula) */
  core?: boolean
  /** a filament bundle: this many parallel strands across its width (the Arc) */
  strands?: number
  /** relative brightness on the map, 1 for a typical object of its kind */
  gain?: number
  /** where the numbers come from */
  src: string
  /** position measured off the annotated image, not a catalogue's — see the header */
  fromImage?: boolean
}

/** the object list, plane first, then the remnants, then the filaments */
export const RADIO: readonly RadioObject[] = [
  { name: 'Sgr A',        g: 'G0.0+0.0',      kind: 'core',    l: 359.944, b: -0.046, maj: 12,  min: 9,  pa: 90,
    src: 'Sgr A East 3.5′×2.5′ (Green 2019) inside the ~7′ halo (Pedlar et al. 1989)' },
  { name: 'the Arc',      g: 'G0.18-0.04',    kind: 'ntf',     l: 0.18,   b: -0.04,  maj: 20,  min: 3, pa: 0, bend: 0.06, strands: 6, gain: 1.4,
    src: 'Yusef-Zadeh, Morris & Chance 1984; the straight filaments, b −0.2° to +0.1°' },
  { name: 'Sgr B2',       g: 'G0.67-0.04',    kind: 'hii',     l: 0.67,   b: -0.04,  maj: 6,   min: 5,  pa: 90,
    src: 'Mehringer et al. 1993' },
  { name: 'Sgr B1',       g: 'G0.52-0.05',    kind: 'hii',     l: 0.52,   b: -0.05,  maj: 8,   min: 5,  pa: 90,
    src: 'Mehringer et al. 1992' },
  { name: 'Sgr C',        g: 'G359.43-0.09',  kind: 'hii',     l: 359.43, b: -0.09,  maj: 5,   min: 4,  pa: 90,
    src: 'Liszt & Spiker 1995' },
  { name: 'Sgr C filament', g: 'G359.45-0.01', kind: 'ntf',   l: 359.45, b: -0.01,  maj: 12,  min: 0.5, pa: 5,
    src: 'Liszt & Spiker 1995: the filament north of the HII region, across the plane' },
  { name: 'Sgr D HII',    g: 'G1.13-0.11',    kind: 'hii',     l: 1.13,   b: -0.11,  maj: 7,   min: 6,  pa: 90,
    src: 'Liszt 1992' },
  { name: 'Sgr D SNR',    g: 'G1.0-0.1',      kind: 'snr',     l: 1.05,   b: -0.15,  maj: 8,   min: 8,  pa: 0,
    src: 'Green 2019: 8′' },
  { name: 'Sgr E',        g: 'G358.7-0.0',    kind: 'cluster', l: 358.72, b: -0.02,  maj: 24,  min: 12, pa: 90,
    src: 'Liszt 1992; Gray 1994: a dozen compact HII regions over ~0.4°' },
  { name: 'SNR 0.9+0.1',  g: 'G0.9+0.1',      kind: 'snr',     l: 0.87,   b: 0.08,   maj: 8,   min: 8,  pa: 0, core: true,
    src: 'Green 2019: 8′, composite — a pulsar wind nebula in a shell (Helfand & Becker 1987)' },
  { name: 'SNR 0.3+0.0',  g: 'G0.3+0.0',      kind: 'snr',     l: 0.33,   b: 0.04,   maj: 16,  min: 15, pa: 0, gain: 0.5,
    src: 'Green 2019: 16′×15′; first identified on this map (Kassim & Frail 1996)' },
  { name: 'SNR 359.1−0.5', g: 'G359.1-0.5',   kind: 'snr',     l: 359.1,  b: -0.5,   maj: 24,  min: 24, pa: 0,
    src: 'Green 2019: 24′' },
  { name: 'SNR 359.0−0.9', g: 'G359.0-0.9',   kind: 'snr',     l: 359.0,  b: -0.9,   maj: 23,  min: 23, pa: 0, gain: 0.6,
    src: 'Green 2019: 23′' },
  { name: 'the Tornado',  g: 'G357.7-0.1',    kind: 'snr',     l: 357.7,  b: -0.1,   maj: 8,   min: 3,  pa: 90,
    src: 'Green 2019: 8′×3′' },
  { name: 'the Mouse',    g: 'G359.23-0.82',  kind: 'pwn',     l: 359.23, b: -0.82,  maj: 12,  min: 1.0, pa: -24,
    src: 'Gaensler et al. 2004: PSR J1747−2958’s bow shock, the tail ~12′ behind it toward G359.1−0.5' },
  { name: 'the Snake',    g: 'G359.1-0.2',    kind: 'ntf',     l: 359.1,  b: -0.2,   maj: 20,  min: 0.5, pa: 8, bend: 0.12,
    src: 'Gray et al. 1995: ~20′ across the plane, kinked' },
  { name: 'Northern Thread', g: 'G0.08+0.15', kind: 'ntf',     l: 0.08,   b: 0.15,   maj: 15,  min: 0.4, pa: 20,
    src: 'Lang, Morris & Echevarria 1999' },
  { name: 'Southern Thread', g: 'G359.96+0.09', kind: 'ntf',   l: 359.96, b: 0.09,   maj: 12,  min: 0.4, pa: 15,
    src: 'Lang, Morris & Echevarria 1999' },
  { name: 'G359.79+0.17', g: 'G359.79+0.17',  kind: 'ntf',     l: 359.79, b: 0.17,   maj: 10,  min: 0.4, pa: 10,
    src: 'LaRosa et al. 2000; Yusef-Zadeh, Hewitt & Cotton 2004' },
  { name: 'the Ripple',   g: 'G359.54+0.18',  kind: 'ntf',     l: 359.54, b: 0.18,   maj: 15,  min: 0.4, pa: 12,
    src: 'LaRosa et al. 2000; Yusef-Zadeh, Hewitt & Cotton 2004' },
  { name: 'the Pelican',  g: 'G358.85+0.47',  kind: 'ntf',     l: 358.85, b: 0.47,   maj: 7,   min: 0.4, pa: 85,
    src: 'Lang et al. 1999: the one filament that runs along the plane, not across it' },
  { name: 'the Cane',     g: '',              kind: 'ntf',     l: 359.88, b: 0.47,   maj: 8,   min: 0.4, pa: 20, fromImage: true,
    src: 'LaRosa et al. 2000, named there; position read off the annotated image, ±0.1°' },
  { name: 'background galaxy', g: '',         kind: 'galaxy',  l: 359.91, b: 0.16,   maj: 1.5, min: 0.8, pa: 60, fromImage: true,
    src: 'LaRosa et al. 2000: an extragalactic double seen through the Centre; position read off the annotated image, ±0.1°' },
  // Not an object: the diffuse emission along the plane that the map shows between Sgr B
  // and Sgr C, drawn as one soft band so the named things sit in the glow they really sit
  // in. Its extent is the map's; its texture is a model.
  { name: '',             g: '',              kind: 'ridge',   l: 0.05,   b: -0.05,  maj: 110, min: 24, pa: 90, gain: 0.6,
    src: 'the map itself: the plane between Sgr B2 and Sgr C, ~1.8° by ~0.35°' },
]

/** the map's scale, for the article and the view: the field it covers, degrees */
export const RADIO_FIELD_DEG = 4
