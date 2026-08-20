# Enveloped virus particle (virion archetype) — render log

**Set:** `pathogens-generic` · **Microbe key:** `virus`
**Short description:** Idealized enveloped virion (~80–120 nm) used to teach viral anatomy — a host-derived lipid envelope studded with glycoprotein spikes over a matrix layer, a capsid, and a single nucleic-acid genome; not a named species. Non-enveloped ("naked") viruses also exist; the archetype drawn here is enveloped.

Metadata sidecar: [`virus.render.meta.json`](virus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

A virus is not really alive: it is genetic material inside a protein shell. The enveloped archetype is a roughly spherical particle about 80–120 nm across — 10 to 100 times smaller than a bacterium. Built up in layers from the outside in: a host-derived lipid-bilayer **envelope** whose surface is covered in evenly spaced **glycoprotein spikes (peplomers)**; a thin **matrix protein** layer lining the inside of the envelope that gives the particle its shape and bridges to the core; and inside, the **capsid** — a protein shell with either helical or icosahedral symmetry — enclosing the **nucleic-acid genome** (RNA *or* DNA, never both). Capsid plus genome together form the **nucleocapsid**. The spikes bind host-cell receptors, drive membrane fusion/entry, and are the principal antigens that antibodies recognise on free virus particles. Non-enveloped (naked) viruses skip the envelope, matrix and spikes and present the bare capsid — worth mentioning, but the drawn archetype is enveloped.

Sources: [ViralZone / Expasy — Virion structures & enveloped viruses](https://viralzone.expasy.org/), [NCBI *Medical Microbiology* 4th ed., Ch. 41 "Structure and Classification of Viruses"](https://www.ncbi.nlm.nih.gov/books/NBK8174/), [Britannica — Virus: Structure and characteristics](https://www.britannica.com/science/virus/The-structure-of-viruses), [CDC PHIL #10073 — colorized TEM of a single influenza virion](https://phil.cdc.gov/Details.aspx?pid=10073).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `envelope` | involucrum virale (bilayer lipidicum) | Envelope | Virushülle | host-derived lipid bilayer; outer coat, sheds/fuses on entry | outermost layer | enveloped viruses only |
| `spike` | peplomerum (glycoproteinum) | Glycoprotein spike (peplomer) | Glykoprotein-Spike (Peplomer) | binds host receptor, drives entry; main antibody target | studded over the envelope | core (enveloped) |
| `matrix` | proteinum matricis (M) | Matrix protein | Matrixprotein | lines inner envelope, sets shape, bridges to core | just inside envelope | family-dependent |
| `capsid` | capsida | Capsid | Kapsid | protein shell (helical or icosahedral) enclosing the genome | inner shell | core |
| `nucleocapsid` | nucleocapsida | Nucleocapsid | Nukleokapsid | capsid + genome packaged together as the core unit | central core | core |
| `genome` | genoma virale (acidum nucleicum) | Nucleic-acid genome (RNA or DNA) | Nukleinsäure-Genom (RNA oder DNA) | the genetic instructions; hijacks the cell to copy the virus | innermost, within capsid | RNA *or* DNA, one only |

### Do NOT draw (scientifically misleading)
- **No face, eyes, mouth or expression** — a virion is a particle, not a creature.
- **No cell nucleus, mitochondria, ER, Golgi or any organelles** — a virion has none.
- **No cytoplasm or living cell membrane enclosing a cell interior** — it is not a cell.
- **Do not mix DNA and RNA** in one particle — draw a single genome type only.
- **Do not draw it as large as / comparable to a bacterium** — a virion is ~80–120 nm, 10–100× smaller.
- **No ribosomes, no metabolic machinery** inside — viruses carry none.
- **Spikes are short, evenly spaced club-shaped glycoproteins**, not flagella, tails or random bristles.
- **Do not present a naked capsid (no envelope + spikes) as the archetype** — the archetype here is enveloped (note that naked viruses exist).

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #10073** digitally colorized negative-stain TEM of a **single** influenza virion — envelope stippling and glycoprotein spikes clearly visible around one isolated ~80–120 nm particle. Public domain, single specimen.
- file: https://upload.wikimedia.org/wikipedia/commons/3/3a/Influenza_virus_particle_color.jpg
- page: https://commons.wikimedia.org/wiki/File:Influenza_virus_particle_color.jpg · License: **Public Domain (PD-USGov-HHS-CDC, PHIL #10073)** · CDC / Dr. Erskine L. Palmer; Dr. M. L. Martin (photo: Cynthia Goldsmith)
- backups:
  - **CDC PHIL #8160** — B/W negative-stain TEM of recreated 1918 influenza virions with visible surface spikes. file: https://upload.wikimedia.org/wikipedia/commons/a/a4/EM_of_influenza_virus.jpg · page: https://commons.wikimedia.org/wiki/File:EM_of_influenza_virus.jpg · License: **Public Domain (PD-USGov-HHS-CDC, PHIL #8160)** · CDC / Dr. Terrence Tumpey (photo: Cynthia Goldsmith)
  - **NIH / ICTV** — negative-stain TEM of influenza A/Hong Kong/1/68 virions showing surface projections (~×70,000). file: https://upload.wikimedia.org/wikipedia/commons/d/dc/Influenza_virus.png · page: https://commons.wikimedia.org/wiki/File:Influenza_virus.png · License: **Public Domain Mark 1.0** · F. A. Murphy, UC Davis School of Veterinary Medicine
AI visual verification result: **PENDING** — to be confirmed after fetch.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Say hello to a virus, the tiniest troublemaker of them all! It isn't really alive like a bacterium; it's just a scrap of genetic code zipped up inside a protein shell, sometimes with a bubbly outer coat covered in sticky spikes. On its own it can do absolutely nothing, so it sneaks into one of your cells and tricks it into building hundreds of brand-new copies. Most of the time your body clears the intruder in a few days with rest, warm soup and lots of fluids, and for some viruses a vaccine teaches your body to slam the door before they even get in.  
🇩🇪 Sag Hallo zum Virus, dem allerkleinsten Störenfried! Es ist nicht wirklich lebendig wie ein Bakterium; es ist nur ein Fetzchen Erbinformation, eingepackt in eine Eiweißhülle, manchmal mit einem blasigen Mantel voller klebriger Stacheln. Ganz allein kann es rein gar nichts, deshalb schleicht es sich in eine deiner Zellen und überredet sie, hunderte funkelnagelneue Kopien zu bauen. Meistens wird dein Körper den Eindringling nach ein paar Tagen mit Ruhe, warmer Suppe und viel Trinken wieder los, und gegen manche Viren bringt eine Impfung deinem Körper bei, die Tür zuzuschlagen, bevor sie überhaupt hereinkommen.

**Adults (popular science, health).**  
🇬🇧 A virus sits right at the fuzzy border between chemistry and life: outside a host it is an inert particle, just a genome wrapped in a protein coat, often with a lipid envelope studded with spike proteins. It can only reproduce by entering one of your cells and redirecting that cell's own machinery to churn out fresh virus particles, which is why the familiar culprits behind colds, flu and COVID spread so efficiently. Antibiotics do nothing against them because those drugs target bacterial structures a virus simply doesn't have, so treatment usually means rest and fluids while your body does the work. For many viral illnesses, vaccines are the real game-changer, priming your defences to recognise the spikes and shut an infection down before it takes hold.  
🇩🇪 Ein Virus sitzt genau an der unscharfen Grenze zwischen Chemie und Leben: außerhalb eines Wirts ist es ein regloses Teilchen, nur ein Genom in einer Eiweißhülle, oft mit einer Lipidhülle voller Spike-Proteine. Vermehren kann es sich ausschließlich, indem es in eine deiner Zellen eindringt und deren eigene Maschinerie umlenkt, um frische Viruspartikel zu produzieren – deshalb verbreiten sich die bekannten Verursacher von Erkältung, Grippe und COVID so wirkungsvoll. Antibiotika richten nichts gegen sie aus, weil diese Medikamente auf bakterielle Strukturen zielen, die ein Virus schlicht nicht besitzt; die Behandlung heißt daher meist Ruhe und viel Trinken, während der Körper die Arbeit erledigt. Bei vielen Viruserkrankungen sind Impfungen der eigentliche Wendepunkt, denn sie trainieren die Abwehr, die Spikes zu erkennen und eine Infektion zu stoppen, bevor sie sich festsetzt.

**Scientific.**  
🇬🇧 A virus is an obligate intracellular parasite: a submicroscopic particle, typically 80–120 nm in the enveloped archetype, that carries no metabolism or ribosomes and cannot replicate outside a host cell. Its architecture runs from the outside in — a host-derived lipid-bilayer envelope bearing glycoprotein spikes (peplomers) that mediate receptor binding and entry, an optional matrix layer, and a capsid of helical or icosahedral symmetry enclosing a single nucleic-acid genome, RNA or DNA but never both, together forming the nucleocapsid. Replication proceeds through attachment, entry and uncoating, genome expression and replication using host machinery, assembly, and release by budding or lysis. Host range and cell tropism are dictated largely by the match between viral spike proteins and specific host-cell receptors, and the spikes are the principal antigens recognised by neutralising antibodies.  
🇩🇪 Ein Virus ist ein obligat intrazellulärer Parasit: ein submikroskopisches Teilchen, im behüllten Archetyp typischerweise 80–120 nm groß, das keinen eigenen Stoffwechsel und keine Ribosomen besitzt und sich außerhalb einer Wirtszelle nicht vermehren kann. Sein Aufbau verläuft von außen nach innen – eine vom Wirt stammende Lipiddoppelschicht-Hülle mit Glykoprotein-Spikes (Peplomeren), die Rezeptorbindung und Eintritt vermitteln, eine optionale Matrixschicht sowie ein Kapsid mit helikaler oder ikosaedrischer Symmetrie, das ein einzelnes Nukleinsäure-Genom umschließt, RNA oder DNA, aber niemals beides; Kapsid und Genom bilden zusammen das Nukleokapsid. Die Replikation läuft über Anheftung, Eintritt und Enthüllung, Genexpression und Genomvervielfältigung mithilfe der Wirtsmaschinerie, Zusammenbau und Freisetzung durch Knospung oder Lyse. Wirtsspektrum und Zelltropismus werden weitgehend durch die Passung zwischen viralen Spike-Proteinen und spezifischen Wirtszellrezeptoren bestimmt, und die Spikes sind die wichtigsten von neutralisierenden Antikörpern erkannten Antigene.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway in the EXACT house style of the plates rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (NEVER bright primary or cartoon colours), THIN clean outlines (NOT heavy black cartoon strokes), gentle soft shading with subtle dimensionality, and a distinct soft colour fill for each structure. Refined and elegant, NOT a bold-outlined flat cartoon. Subject: one spherical enveloped virus particle whose lipid envelope is studded with short club-shaped glycoprotein spikes; a quarter cut-away reveals a thin matrix layer, an icosahedral capsid, and a single coiled nucleic-acid genome. Not a cell — no organelles. No face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark charcoal uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color SEM of a single roughly spherical virion, warm false-color on a dark charcoal substrate, shallow depth of field. Surface shows only the dense even carpet of short glycoprotein spikes over a stippled envelope — surface only, no internal structures, no organelles, no face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical still of one enveloped virion, soft global illumination, subsurface scattering on the translucent envelope, a gentle cut-away showing the matrix layer, an icosahedral capsid and a coiled genome inside. Natural believable biological tints — translucent envelope, distinct spikes, matrix, capsid, genome — not neon, not monochrome. No face, no organelles. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: one enveloped virus particle whose lipid envelope is ringed with short club-shaped glycoprotein spikes; a gentle painterly cut-away reveals a thin matrix layer, an icosahedral capsid and a single coiled nucleic-acid genome. No face, not a cell. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 2980 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 10.5s — ✅ PASS — enveloped virion cutaway: spiked envelope, matrix, icosahedral capsid, single coiled genome; no text/border/face/organelles.
  ![textbook 1](theme/textbook/virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 7.7s — ✅ PASS — re-rendered in the refined rod-bacterium/parasite textbook style: muted desaturated palette, thin outlines, soft shading.
  ![textbook 2](theme/textbook/virus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/virus.textbook.svg)
[interactive SVG](theme/textbook/virus.textbook.svg) · [HTML](theme/textbook/virus.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1430 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 11.2s — ✅ PASS — single spherical virion, surface glycoprotein spikes only; no cutaway, no text/border.
  ![sem 1](theme/sem/virus.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1445 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 13.1s — ✅ PASS — cutaway with spiked envelope, matrix layer, capsid and a single coiled genome; natural tints.
  ![3d 1](theme/3d/virus.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/virus.3d.svg)
[interactive SVG](theme/3d/virus.3d.svg) · [HTML](theme/3d/virus.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3019 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 10.0s — ✅ PASS — painterly virion cutaway: spike fringe, matrix, capsid, single wavy genome; clean plate.
  ![watercolor 1](theme/watercolor/virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 10.9s — ✅ PASS — re-rendered full-bleed on aged paper (no sheet/border), cocci/rod style; spike fringe, matrix, capsid, single coiled genome.
  ![watercolor 2](theme/watercolor/virus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/virus.watercolor.svg)
[interactive SVG](theme/watercolor/virus.watercolor.svg) · [HTML](theme/watercolor/virus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public Domain (CDC PHIL #10073) · CDC / E. L. Palmer; M. L. Martin (Cynthia Goldsmith) — ✅ PASS — colorized negative-stain TEM of a single influenza virion (CDC PHIL #10073, Public Domain); spiked envelope clearly visible; no baked-in text.
  ![reference](../reference-microscopy/theme/tem/virus.attempts/real-01__TEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 2 | refined colour cutaway (rod/parasite style) |
| sem | ✅ teaching-ready | 1 | surface spikes |
| 3d | ✅ teaching-ready | 1 | natural tints |
| watercolor | ✅ teaching-ready | 2 | full-bleed paper (re-rendered) |
| reference TEM | ✅ verified | 1 | influenza, PD |
