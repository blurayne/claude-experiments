# Influenza virus (flu) — render log

**Set:** `pathogens-viruses` · **Microbe key:** `influenza-virus`
**Short description:** Enveloped, pleomorphic respiratory RNA virus (~80–120 nm) of the Orthomyxoviridae, studded with hemagglutinin and neuraminidase spikes and carrying a segmented (8-piece) negative-sense RNA genome; its constant mutation drives seasonal flu and pandemics.

Metadata sidecar: [`influenza-virus.render.meta.json`](influenza-virus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

Influenza A/B virions are **enveloped and pleomorphic**: most are roughly spherical, ~80–120 nm across, though many field strains form long filaments. The outer boundary is a **lipid-bilayer envelope** stolen from the host cell membrane. Two kinds of glycoprotein **spikes** cover the surface and give it a fuzzy, corona-like fringe in EM: **hemagglutinin (HA)**, a slender rod-shaped trimer that makes up ~80% of spikes and binds sialic-acid receptors, and **neuraminidase (NA)**, a mushroom/knob-shaped tetramer (~20%) that cleaves sialic acid so new virions can escape. A few sparse **M2 proton-channel** proteins also pierce the envelope. Just under the membrane sits a shell of **matrix protein (M1)**. Inside, the genome is **segmented into 8 separate negative-sense ssRNA pieces**, each coiled with **nucleoprotein (NP)** and a **trimeric RNA polymerase (PB1/PB2/PA)** into a helical **ribonucleoprotein (vRNP)**. There is **no rigid icosahedral capsid** — the interior is a loose bundle of RNP rods, not a geometric shell.

Sources: [ViralZone / Expasy — Influenza A virus](https://viralzone.expasy.org/6), [NCBI Bookshelf — Baron's *Medical Microbiology*, Orthomyxoviruses](https://www.ncbi.nlm.nih.gov/books/NBK8611/), [CDC — How Flu Viruses Can Change](https://www.cdc.gov/flu/php/viruses/change.html).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where |
|---|---|---|---|---|---|
| `envelope` | membrana viri (bistratum lipidicum) | Lipid envelope | Lipidhülle | host-derived bilayer forming the outer boundary | outer boundary |
| `hemagglutinin` | haemagglutininum (HA) | Hemagglutinin (HA) spike | Hämagglutinin (HA) | rod-shaped trimer; binds sialic-acid receptors, mediates entry | surface, most numerous |
| `neuraminidase` | neuraminidasum (NA) | Neuraminidase (NA) spike | Neuraminidase (NA) | mushroom-shaped tetramer; cleaves sialic acid to release new virions | surface, fewer |
| `m2_channel` | canalis ionicus M2 | M2 ion channel | M2-Ionenkanal | proton channel; acidifies interior for uncoating | surface, sparse |
| `matrix` | proteinum matricis (M1) | Matrix protein (M1) | Matrixprotein (M1) | inner protein shell beneath the envelope; structure & assembly | just inside envelope |
| `rnp` | ribonucleoproteinum (vRNP) | Ribonucleoprotein (RNA segment) | Ribonukleoprotein (RNA-Segment) | one of 8 NP-coated ssRNA segments = the genome | interior |
| `polymerase` | complexus polymerasi (PB1·PB2·PA) | RNA polymerase complex | RNA-Polymerase-Komplex | copies/transcribes the RNA; sits at the end of each vRNP | on each RNP |

### Do NOT draw (scientifically misleading)
- **A rigid icosahedral / geometric capsid** — influenza has no regular capsid; the interior is a loose bundle of helical RNP rods.
- **A single continuous genome strand** — the genome is **segmented into 8 separate pieces**; show several distinct RNP rods, not one loop.
- **DNA / a double helix** — it is negative-sense **RNA**.
- **One uniform spike type or a smooth SARS-CoV-2-style club crown only** — must show **two distinct spike shapes** (slender HA rods + knobby NA mushrooms).
- **A bacteriophage tail, legs, or head-and-tail body** — influenza is a spiky enveloped sphere/filament.
- **A face / eyes / anthropomorphism**, text, letters, numbers, scale bars.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL negative-stain TEM of influenza virions** — public domain.
- file: https://upload.wikimedia.org/wikipedia/commons/a/a4/EM_of_influenza_virus.jpg
- page: https://commons.wikimedia.org/wiki/File:EM_of_influenza_virus.jpg · License: **Public Domain (CDC / Dr. F. A. Murphy)** · CDC Public Health Image Library
- backup: https://upload.wikimedia.org/wikipedia/commons/d/dc/Influenza_virus.png ([page](https://commons.wikimedia.org/wiki/File:Influenza_virus.png), CDC, Public Domain)
AI visual verification result: see §5 — negative-stain TEM showing several roughly spherical influenza virions fringed by the characteristic fuzzy spike coat; readable envelope + surface-spike features. A group image, but the pleomorphic shape and spike fringe are clear, so it is an acceptable teaching reference.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the flu virus, a tiny prickly ball covered in fuzzy spikes like a microscopic burr! It floats through the air in the little droplets you sneeze and cough out, then lands in someone's nose or throat and sneaks inside to make copies of itself. That is why you feel achy, hot and tired for a few days. The flu is a quick-change artist: it swaps its spikes around so often that last year's version looks different this year. Cozy rest, plenty of water, and a yearly flu jab that teaches your body the newest spikes are the best ways to send it packing.  
🇩🇪 Das ist das Grippevirus, eine winzige stachelige Kugel voller flauschiger Spikes, wie eine Mini-Klette! Es schwebt in den kleinen Tröpfchen durch die Luft, die du beim Niesen und Husten ausstößt, landet in Nase oder Hals und schleicht sich hinein, um Kopien von sich zu bauen. Deshalb fühlst du dich ein paar Tage lang schlapp, heiß und müde. Die Grippe ist ein Verwandlungskünstler: Sie tauscht ihre Spikes so oft aus, dass die Version von letztem Jahr dieses Jahr schon anders aussieht. Ausruhen, viel trinken und die jährliche Grippeimpfung, die deinem Körper die neuesten Spikes zeigt, helfen am besten, sie loszuwerden.

**Adults (popular science, health).**  
🇬🇧 Influenza is an enveloped RNA virus of the Orthomyxoviridae, spread mostly by respiratory droplets and close contact. Its surface carries two key proteins: hemagglutinin (H), which locks onto cells in the airway, and neuraminidase (N), which frees new virus copies — the H and N types are what names like H1N1 or H3N2 refer to. Because its genome comes in eight separate RNA pieces that mutate quickly (antigenic drift) and can be reshuffled when two strains meet (antigenic shift), the virus reinvents its coat every year, causing seasonal waves and occasional pandemics. That constant change is why the vaccine is updated annually, and antiviral drugs such as oseltamivir target the neuraminidase to blunt an infection.  
🇩🇪 Influenza ist ein behülltes RNA-Virus aus der Familie der Orthomyxoviridae und wird vor allem über Tröpfchen und engen Kontakt übertragen. Auf seiner Oberfläche sitzen zwei Schlüsselproteine: Hämagglutinin (H), das an Zellen der Atemwege andockt, und Neuraminidase (N), die neue Viruskopien freisetzt — die H- und N-Typen stecken in Namen wie H1N1 oder H3N2. Weil sein Erbgut aus acht getrennten RNA-Stücken besteht, die schnell mutieren (Antigendrift) und beim Zusammentreffen zweier Stämme neu gemischt werden können (Antigenshift), erneuert das Virus seine Hülle Jahr für Jahr und verursacht saisonale Wellen und gelegentlich Pandemien. Wegen dieses ständigen Wandels wird der Impfstoff jährlich angepasst, und Virostatika wie Oseltamivir hemmen die Neuraminidase, um eine Infektion abzuschwächen.

**Scientific.**  
🇬🇧 Influenza A and B viruses (Orthomyxoviridae) are enveloped, pleomorphic virions ~80-120 nm in diameter with prominent filamentous forms. The host-derived lipid envelope bears two glycoproteins: trimeric hemagglutinin (HA), which binds sialic-acid receptors and drives receptor-mediated endocytosis and low-pH membrane fusion, and tetrameric neuraminidase (NA), a sialidase that releases progeny virions. Sparse M2 proton channels acidify the interior to trigger uncoating, and a matrix (M1) layer underlies the envelope. The genome is segmented into eight negative-sense single-stranded RNA molecules, each packaged with nucleoprotein and the heterotrimeric RNA-dependent RNA polymerase (PB1, PB2, PA) as a helical ribonucleoprotein; there is no icosahedral capsid. Segmentation permits reassortment (antigenic shift), while an error-prone polymerase produces antigenic drift, together underpinning immune escape, annual vaccine reformulation, and pandemic potential.  
🇩🇪 Influenza-A- und -B-Viren (Orthomyxoviridae) sind behüllte, pleomorphe Virionen mit ~80-120 nm Durchmesser und ausgeprägten filamentösen Formen. Die vom Wirt stammende Lipidhülle trägt zwei Glykoproteine: das trimere Hämagglutinin (HA), das an Sialinsäure-Rezeptoren bindet und die rezeptorvermittelte Endozytose sowie die Membranfusion bei niedrigem pH antreibt, und die tetramere Neuraminidase (NA), eine Sialidase, die Nachkommenvirionen freisetzt. Vereinzelte M2-Protonenkanäle säuern das Innere an und lösen das Uncoating aus, und eine Matrixschicht (M1) kleidet die Hülle von innen aus. Das Genom ist in acht negativsträngige einzelsträngige RNA-Moleküle segmentiert, die jeweils mit Nukleoprotein und der heterotrimeren RNA-abhängigen RNA-Polymerase (PB1, PB2, PA) als helikales Ribonukleoprotein verpackt sind; ein ikosaedrisches Kapsid fehlt. Die Segmentierung erlaubt Reassortment (Antigenshift), während eine fehleranfällige Polymerase Antigendrift erzeugt — zusammen die Grundlage für Immunflucht, jährliche Impfstoffanpassung und Pandemiepotenzial.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE influenza virus particle (Orthomyxovirus), centered in a square 1:1 1080x1080 frame with lots of empty negative space around it for later labels. Semi-flat vector-style shading with THIN clean outlines (not heavy black cartoon strokes) and a MUTED, desaturated educational palette of soft dusty tints, on a neutral dark charcoal uncluttered background. The virion is a roughly spherical, slightly irregular ENVELOPED particle about as wide as it is tall. Its surface is densely covered by TWO clearly different kinds of protein spikes: many slender rod-shaped hemagglutinin (HA) spikes, and fewer scattered mushroom / knob-shaped neuraminidase (NA) spikes, plus a few tiny sparse M2 ion-channel proteins. A neat quarter cut-away reveals the interior: a thin lipid-bilayer envelope, a distinct inner matrix-protein (M1) layer lining it, and inside a loose bundle of about EIGHT separate helical ribonucleoprotein (RNP) rods — each a coiled RNA segment coated in nucleoprotein with a small polymerase knob at one end. Do NOT draw a rigid geometric icosahedral capsid, no single continuous DNA loop, no double helix, no bacteriophage tail or legs, no face. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE influenza virus particle, centered in a square 1:1 1080x1080 frame with generous empty margin, filling the frame edge-to-edge with no border. The virion is a roughly spherical, slightly pleomorphic enveloped particle resting on a subtly textured neutral substrate, with crisp 3D surface texture and shallow depth of field. Its entire surface is densely studded with a fuzzy corona-like coat of protein spikes showing two subtly different shapes: numerous slender rod-like hemagglutinin spikes and fewer knobby mushroom-shaped neuraminidase spikes. False-color palette: a warm salmon-to-gold virus body against a cool muted teal-grey background. SEM shows the outer surface only, so render NO internal structures. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE influenza virus particle, centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, subsurface scattering on the membrane, and a clean seamless dark studio background filling the frame edge-to-edge. The virion is an idealized-for-clarity but believable roughly spherical enveloped particle. Its surface is densely covered by TWO distinct spike types in natural translucent biological tones: many slender rod-shaped hemagglutinin (HA) spikes and fewer mushroom-shaped neuraminidase (NA) spikes, with a few tiny M2 channels. Use a gentle cut-away or partial translucency to reveal the interior: a warm translucent lipid envelope, a distinct inner matrix (M1) layer, and a loose bundle of about eight separate helical ribonucleoprotein (RNP) rods, each a coiled RNA segment with a small polymerase knob. Colorize with natural believable tints so each structure is distinguishable — warm membrane, blue-grey spikes, coppery RNP rods — not near-monochrome and not neon. Do NOT render a rigid icosahedral capsid, no single DNA loop, no double helix, no phage tail, no face. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific watercolour plate of a SINGLE influenza virus particle in the style of a 19th-century atlas, yet anatomically modern and correct. Square 1:1 1080x1080. The warm aged cream paper MUST FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background; do NOT draw a separate sheet, card, mat, border, frame or drop shadow. Single large specimen centered, with a soft darker wash halo painted directly on the paper behind it. Soft translucent watercolour washes with fine ink linework. The virion is a roughly spherical enveloped particle whose surface is fringed with TWO distinct kinds of protein spikes: many slender rod-shaped hemagglutinin spikes and fewer mushroom-shaped neuraminidase spikes. A soft painterly cut-away hints at the interior: a thin lipid envelope, an inner matrix layer, and a loose bundle of about eight separate coiled ribonucleoprotein (RNA) segments, each with a tiny polymerase knob. Do NOT paint a rigid icosahedral capsid, no single DNA loop, no double helix, no phage tail, no face. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3820 tok, $0.087
- attempt 1 · `gemini-2.5-flash-image` · 12.0s — ⚠️ PARTIAL (gemini-2.5-flash-image) — near-monochrome grey/mauve palette, all spikes the same dumbbell shape (no HA-vs-NA distinction), and an odd butterfly-wing cutaway rather than a clean quarter-wedge.
  ![textbook 1](theme/textbook/influenza-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-3-pro-image` · 44.3s — ✅ PASS (gemini-3-pro-image) — clean cutaway matching rod-bacterium/parasite style: two distinct spike shapes (HA rods, NA mushrooms), sparse M2 channels, matrix layer, 8 separate coiled RNP rods with polymerase knobs, muted palette, thin outlines, dark charcoal background, no text/border/face. Chosen as label base.
  ![textbook 2](theme/textbook/influenza-virus.attempts/gen-02__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/influenza-virus.textbook.svg)
[interactive SVG](theme/textbook/influenza-virus.textbook.svg) · [HTML](theme/textbook/influenza-virus.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3330 tok, $0.079
- attempt 1 · `gemini-2.5-flash-image` · 17.3s — ⚠️ PARTIAL (gemini-2.5-flash-image) — good false-colour sphere but spike shapes too uniform.
  ![sem 1](theme/sem/influenza-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-3-pro-image` · 32.2s — ✅ PASS (gemini-3-pro-image) — photorealistic false-colour SEM, single pleomorphic virion, two visibly different spike shapes (slender rods + mushroom knobs), warm salmon body on cool teal substrate, fills frame edge-to-edge, no text/border.
  ![sem 2](theme/sem/influenza-virus.attempts/gen-02__gemini-3-pro-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3723 tok, $0.082
- attempt 1 · `gemini-2.5-flash-image` · 21.4s — ⚠️ PARTIAL (gemini-2.5-flash-image) — natural tints but interior RNP bundle too sparse/geometric.
  ![3d 1](theme/3d/influenza-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-3-pro-image` · 35.7s — ✅ PASS (gemini-3-pro-image) — believable 3D medical-illustration virion, translucent membrane with soft rim light, cutaway reveals coppery helical RNP bundle (~8 rods) with polymerase beads, natural biological tints throughout, dark studio background, no text/border/face.
  ![3d 2](theme/3d/influenza-virus.attempts/gen-02__gemini-3-pro-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/influenza-virus.3d.svg)
[interactive SVG](theme/3d/influenza-virus.3d.svg) · [HTML](theme/3d/influenza-virus.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3582 tok, $0.081
- attempt 1 · `gemini-2.5-flash-image` · 16.1s — ⚠️ PARTIAL (gemini-2.5-flash-image) — full-bleed paper was fine, but all spikes were one uniform dumbbell shape (no HA-vs-NA distinction) and the genome was a single continuous ribbon rather than 8 separate RNP segments.
  ![watercolor 1](theme/watercolor/influenza-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-3-pro-image` · 30.1s — ✅ PASS (gemini-3-pro-image) — full-bleed warm aged paper matching cocci/rod exemplars, soft dark halo behind specimen, two distinct spike shapes (reddish HA rods, gold/blue-grey NA and M2 knobs), painterly cutaway with beaded coiled RNP strands, no sheet/mat/border, no text.
  ![watercolor 2](theme/watercolor/influenza-virus.attempts/gen-02__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/influenza-virus.watercolor.svg)
[interactive SVG](theme/watercolor/influenza-virus.watercolor.svg) · [HTML](theme/watercolor/influenza-virus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public Domain (CDC / Dr. F. A. Murphy) · CDC Public Health Image Library / Dr. F. A. Murphy — ✅ PASS — CDC PHIL negative-stain TEM (public domain, Dr. F. A. Murphy): several roughly spherical influenza virions with the characteristic fuzzy spike-coat fringe clearly visible; a group image but individual virion shape/spikes are readable, acceptable as teaching reference.
  ![reference](../reference-microscopy/theme/tem/influenza-virus.attempts/real-01__TEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 2 | gemini-3-pro-image; best structural clarity for labelling |
| sem | ✅ teaching-ready | 2 | gemini-3-pro-image; realistic false-colour surface, two spike shapes |
| 3d | ✅ teaching-ready | 2 | gemini-3-pro-image; natural tints, believable cutaway with RNP bundle |
| watercolor | ✅ teaching-ready | 2 | gemini-3-pro-image; full-bleed paper, correct morphology |
| reference TEM | ✅ verified (group image, acceptable) | 1 | CDC PHIL public domain negative-stain TEM |
