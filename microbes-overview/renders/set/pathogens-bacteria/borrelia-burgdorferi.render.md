# Borrelia burgdorferi (Lyme disease) — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `borrelia-burgdorferi`
**Short description:** Long, thin, flat-wave spirochaete carried by *Ixodes* ticks; it swims with 7–11 flagella hidden inside its own periplasm and corkscrews through skin, joints, nerves and heart to cause Lyme disease.

Metadata sidecar: [`borrelia-burgdorferi.render.meta.json`](borrelia-burgdorferi.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Borrelia burgdorferi* is a **spirochaete** — the first one in this atlas, and its body plan is unlike anything else in the collection. The cell is extraordinarily long and thin: roughly **10–30 µm from end to end but only 0.2–0.33 µm wide**, i.e. something like fifty to a hundred times longer than it is wide, so it reads as a hair or a thread rather than as a rod. It is not a rigid corkscrew. Freeze-fracture and cryo-electron-tomography work established that the resting shape is a **flat wave** (a "flat-wave" or planar sine-like undulation, wavelength ≈ 2.8 µm, amplitude ≈ 0.8 µm) — loose, irregular, gently serpentine, closer to a wet noodle laid on a table than to a spring.

The defining feature is **where the motor sits**. *B. burgdorferi* carries **7–11 flagella inserted subterminally at each pole** (7–11 per end in most strains), and these flagella never leave the cell. They run **inside the periplasmic space**, the compartment between the **inner (cytoplasmic) membrane + thin peptidoglycan wall** and the loosely attached **outer membrane / outer sheath**. The two polar bundles wrap around the protoplasmic cylinder as a ribbon and overlap near the middle of the cell. Because they are enclosed, they are called **periplasmic flagella** or **endoflagella**. When the motors turn, the flagellar ribbon rotates *inside* the sheath and the whole cell body is driven into a travelling wave — the organism literally corkscrews itself forward. This is why it moves *better* in viscous, gel-like media (skin, connective tissue, joint fluid) where ordinary externally-flagellated bacteria stall. The flagella also *make* the shape: mutants that cannot build them are straight rods.

The envelope has a second oddity. Although the architecture is Gram-negative-like, the outer membrane is **unusually poor in lipopolysaccharide** — *B. burgdorferi* lacks classical LPS and instead studs its surface with abundant **surface lipoproteins**. It **swaps that coat as it changes host**: **OspA** dominates while the spirochaete sits in the midgut of an unfed *Ixodes* tick, and expression shifts towards **OspC** (and later VlsE, whose variable cassettes are shuffled to dodge antibodies) as the tick feeds and the bacteria move into the mammal. That coat switch is a large part of why transmission takes time — the tick usually has to stay attached for many hours before the spirochaetes are ready to cross over — and it is exactly why removing a tick early works so well.

Inside, the cytoplasm is a thin thread containing 70S ribosomes and a genome that is itself unusual for a bacterium: a **linear chromosome** of about 900 kb plus a large collection of **linear and circular plasmids** (around twenty), which carry most of the surface-lipoprotein genes. Metabolically it is minimal — no TCA cycle, no respiratory chain, no iron requirement (it uses manganese instead) — so it must scavenge nutrients from its host.

Sources: [Charon et al., *The Unique Paradigm of Spirochete Motility and Chemotaxis*, Annu Rev Microbiol (PMC3771638)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3771638/), [Radolf et al., *Of ticks, mice and men: understanding the dual-host lifestyle of Lyme disease spirochaetes*, Nat Rev Microbiol (PMC3313462)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3313462/), [StatPearls — *Lyme Disease*](https://www.ncbi.nlm.nih.gov/books/NBK431066/), [NCBI *Medical Microbiology* (Baron), Ch. 36 — *Borrelia*](https://www.ncbi.nlm.nih.gov/books/NBK8451/), [Wikipedia — *Borrelia burgdorferi*](https://en.wikipedia.org/wiki/Borrelia_burgdorferi).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `flat_wave_body` | corpus undulatum planum | Flat-wave cell body | Flachwelliger Zellkörper | loose planar undulation, ~10–30 µm × 0.2–0.3 µm; the swimming waveform itself | whole cell | core (diagnostic) |
| `outer_membrane` | membrana externa (vagina externa) | Outer membrane (outer sheath) | Äußere Membran (Außenhülle) | loose sleeve enclosing the flagella; LPS-poor, lipoprotein-rich | outermost layer | core (diagnostic) |
| `surface_lipoproteins` | lipoproteina superficialia (OspA/OspC) | Surface lipoproteins (OspA/OspC) | Oberflächen-Lipoproteine (OspA/OspC) | host-adaptation coat: OspA in the tick gut, OspC on entering the mammal | studded on the outer sheath | core (diagnostic) |
| `periplasmic_space` | spatium periplasmaticum | Periplasmic space | Periplasmatischer Raum | the gap between inner and outer membrane where the flagella live | between the two membranes | core |
| `periplasmic_flagella` | flagella periplasmatica (endoflagella) | Periplasmic flagella (endoflagella) | Periplasmatische Geißeln (Endoflagellen) | 7–11 per pole; rotate INSIDE the cell and drive the corkscrew wave | in the periplasm, wrapped round the protoplasmic cylinder, overlapping mid-cell | core (diagnostic) |
| `flagellar_motor` | corpus basale flagelli | Flagellar motor (basal body) | Geißelmotor (Basalkörper) | rotary motor anchored in the inner membrane near each pole | subterminal, both poles | core |
| `cell_wall` | paries cellularis (peptidoglycanum) | Peptidoglycan cell wall | Peptidoglykan-Zellwand | thin mesh bonded to the inner membrane; forms the protoplasmic cylinder | just outside the inner membrane | core |
| `inner_membrane` | membrana interna (plasmatica) | Inner (plasma) membrane | Innere Membran (Zytoplasmamembran) | transport and energy; anchors the flagellar motors | innermost boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | thin thread of cytoplasm where metabolism happens | interior | core |
| `nucleoid` | nucleoides (chromosoma lineare) | Nucleoid (linear chromosome) | Nukleoid (lineares Chromosom) | ~900 kb **linear** chromosome — rare among bacteria | drawn out along the cell | core |
| `plasmids` | plasmida (linearia et circularia) | Plasmids (linear and circular) | Plasmide (linear und ringförmig) | ~20 linear + circular plasmids carrying the Osp surface-lipoprotein genes | scattered in the cytoplasm | core (distinctive) |
| `ribosome` | ribosoma (70S) | Ribosomes | Ribosomen | protein synthesis | tiny, numerous, dispersed | core |

### Do NOT draw (scientifically misleading)
- **External whip-like flagella on the outside of the cell** — this is the single most common error. Every flagellum is **inside the periplasmic space**, under the outer sheath. Nothing propulsive sticks out.
- **A rigid, tightly-wound corkscrew spring / stiff helix** — the body is a **loose, irregular flat wave**, not a coiled spring.
- **A short comma or gull-wing curve like *Campylobacter* or *Helicobacter*** — those are curved rods, an entirely different body plan.
- **A plain straight rod**, or any short, fat cell — it must read as extremely long and thin.
- **A capsule** or thick polysaccharide halo — there is none.
- A shaggy classical **LPS / O-antigen fringe** — the outer membrane is unusually **LPS-poor**; the surface carries lipoproteins instead.
- **Mesosome** — fixation artefact, not real.
- The nucleoid as a tidy **circular** DNA loop — the main chromosome is **linear**.
- Any **membrane-bound organelles** (no nucleus, mitochondria, ER or Golgi).
- Ticks, blades of grass, skin or other scene props in the four science styles (they belong on the coloring page, not here).

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #13177**, a digitally colorized **scanning electron micrograph** of *Borrelia burgdorferi* from pure culture (CDC / Claudia Molins).
- file: https://upload.wikimedia.org/wikipedia/commons/1/1d/Lyme_disease_parasite_Borrelia_burgdorferi.jpg
- page: https://commons.wikimedia.org/wiki/File:Lyme_disease_parasite_Borrelia_burgdorferi.jpg · License: **Public Domain (PD-USGov-HHS-CDC)** · CDC / Claudia Molins (CDC PHIL #13177)
- The download (`real-01`) shows three salmon-coloured spirochaetes crossing a blue substrate; each is a long, hair-thin filament with the loose, irregular **flat-wave** undulation the reference calls for, and — correctly — **no external flagella** anywhere. A `edit_image.py` clean-up pass (`real-02`) recomposed it to a single isolated specimen with both ends inside the frame, tidied the substrate debris and kept the original salmon-on-blue false colour. Verdict in §5.
- Backups considered: `Borrelia burgdorferi (CDC-PHIL -6631) lores.jpg` and `Borrelia burgdorferi-cropped.jpg` (both CDC PHIL #6631, PD, 400× darkfield light micrographs — good on waveform, no surface detail); `Borrelia dark field.jpg`. Higher-resolution SEMs of this species exist but only on commercial stock libraries (Science Photo Library, Alamy, Getty), which are outside the PD/CC0/CC-BY/CC-BY-SA whitelist, so the 700 × 475 CDC original is the best properly-licensed source available — it is genuinely low-resolution, and that is the honest caveat on this reference.
