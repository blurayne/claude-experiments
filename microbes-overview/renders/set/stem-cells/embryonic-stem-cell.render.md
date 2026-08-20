# Embryonic stem cell (ESC) — render log

**Set:** `stem-cells` · **Microbe key:** `embryonic-stem-cell`
**Short description:** Pluripotent cell from the inner cell mass of the early blastocyst — small, with a very large nucleus, a prominent nucleolus and only a thin rim of cytoplasm; can differentiate into any of the body's 200+ cell types.

Metadata sidecar: [`embryonic-stem-cell.render.meta.json`](embryonic-stem-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The embryonic stem cell (ESC) is derived from the inner cell mass (ICM) of a pre-implantation blastocyst. It is a **small, roughly round animal cell (~10–15 µm)** with a strikingly **high nucleus-to-cytoplasm ratio**: a very large, round-to-ovoid nucleus fills most of the cell, surrounded by only a **thin rim of cytoplasm**. The nucleus contains **one or more prominent nucleoli** (reflecting intense ribosome biogenesis) and **loosely packed, open euchromatin** (little dense heterochromatin), which is the ultrastructural correlate of pluripotency. The cytoplasm is comparatively **organelle-poor and immature**: a few **small, rounded mitochondria with sparse, poorly developed cristae** (ESCs rely heavily on glycolysis), scant **endoplasmic reticulum**, a **small Golgi apparatus**, free **ribosomes** and scattered **glycogen**. In culture ESCs grow as **tightly packed, dome-shaped colonies with sharp borders**, individual cells joined by **cell–cell junctions**; each cell has scant cytoplasm so the colony looks like a cobblestone sheet of nuclei. Pluripotency is defined molecularly (transcription factors OCT4/POU5F1, SOX2, NANOG in the nucleus; surface markers SSEA-3/4, TRA-1-60/81) — these are not drawable structures and must not be invented as visible bodies.

Sources: [NIH Stem Cell Information — Stem Cell Basics](https://stemcells.nih.gov/info/basics), [StemBook / NCBI Bookshelf — *Human embryonic stem cells*](https://www.ncbi.nlm.nih.gov/books/NBK27050/), [Wikipedia — Embryonic stem cell](https://en.wikipedia.org/wiki/Embryonic_stem_cell), [Wikipedia — Inner cell mass](https://en.wikipedia.org/wiki/Inner_cell_mass).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | selective boundary; carries pluripotency surface markers | outer boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | thin, organelle-poor gel rim | between membrane and nucleus | core |
| `nucleus` | nucleus | Nucleus | Zellkern | large; holds the genome and pluripotency factors | central, dominant | core |
| `nucleolus` | nucleolus | Nucleolus | Kernkörperchen | ribosome factory; prominent in ESCs | inside nucleus, 1–2 | core |
| `nuclear_envelope` | involucrum nucleare | Nuclear envelope | Kernhülle | double membrane with pores around the nucleus | nucleus boundary | core |
| `euchromatin` | euchromatinum | Euchromatin (open chromatin) | Euchromatin | loose, active DNA — the pluripotent state | filling the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | few, small, immature (sparse cristae) | cytoplasm rim | core |
| `endoplasmic_reticulum` | reticulum endoplasmicum | Endoplasmic reticulum | Endoplasmatisches Retikulum | sparse membrane network | cytoplasm rim | core |
| `golgi` | apparatus golgiensis | Golgi apparatus | Golgi-Apparat | small; processes/sorts proteins | cytoplasm rim | core |
| `ribosome` | ribosoma | Ribosomes | Ribosomen | protein synthesis; tiny dispersed dots | cytoplasm | core |

### Do NOT draw (scientifically misleading)
- **No cell wall** — this is an animal cell; only a plasma membrane (no bacterial/plant wall).
- **No chloroplasts, no large central vacuole** — those are plant-cell features.
- **No bacterial features** — no nucleoid, plasmids, capsule, pili or flagellum.
- **No cilium / flagellum / long processes** and **no signs of differentiation** (no neuron dendrites, no muscle striations) — ESCs are undifferentiated.
- **Not organelle-rich** — do NOT fill the cytoplasm with abundant mature mitochondria/ER; ESC cytoplasm is scant and immature with a HIGH nucleus-to-cytoplasm ratio.
- **No embryo, fetus, sperm/egg or anthropomorphic face** — draw only the single cell (or a small colony), never a developing baby.
- Nucleolus is a **dense body inside the nucleus**, not a second nucleus and not outside the nuclear envelope.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **Wikimedia Commons "Human embryonic stem cells"** — a phase-contrast micrograph of a living **hESC colony** (tightly packed small cells with high N:C ratio, sharp colony border) on a feeder layer.
- file: https://upload.wikimedia.org/wikipedia/commons/e/e3/Human_embryonic_stem_cells.png
- page: https://commons.wikimedia.org/wiki/File:Human_embryonic_stem_cells.png · License: **CC BY 2.5** · Attribution: **Nissim Benvenisty (PLoS Biology, 2005)**, via Wikimedia Commons
- backup: https://commons.wikimedia.org/wiki/File:Human_embryonic_stem_cell_colony_phase.jpg (NIH, Public Domain)
- Note: this is a **colony** (group), not a single isolated cell, and it is a light/phase-contrast image, so individual organelles (nucleolus, mitochondria) are not resolvable — it documents the real colony morphology and high nucleus-to-cytoplasm ratio, complementing the labelled single-cell renders. AI-verification verdict is recorded in §5.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the embryonic stem cell: a tiny, round "blank" cell that hasn't decided what to be yet! It comes from the very early ball of cells that forms a few days after an egg is fertilised. This little cell is a superstar shapeshifter, it can grow up to become skin, muscle, brain, blood, bone, almost any of the 200-plus kinds of cell in your body. It is mostly one big round nucleus (its instruction library) with just a thin ring of jelly around it. Scientists give these cells special signals in the lab to gently nudge them into becoming exactly the cell type they want to study or repair.  
🇩🇪 Das ist die embryonale Stammzelle: eine winzige, runde "Blanko"-Zelle, die sich noch nicht entschieden hat, was sie werden möchte! Sie stammt aus dem allerersten Zellklümpchen, das wenige Tage nach der Befruchtung einer Eizelle entsteht. Diese kleine Zelle ist ein echter Verwandlungskünstler: Aus ihr können Haut, Muskeln, Gehirn, Blut oder Knochen werden, fast jede der über 200 Zellarten in deinem Körper. Sie besteht fast nur aus einem großen runden Zellkern (ihrer Anleitungs-Bibliothek) mit einem dünnen Gelee-Ring drumherum. Im Labor geben Forschende diesen Zellen bestimmte Signale, die sie sanft in genau den Zelltyp verwandeln, den sie untersuchen oder reparieren möchten.

**Adults (popular science, health).**  
🇬🇧 Embryonic stem cells (ESCs) are pluripotent cells taken from the inner cell mass of a very early embryo (the blastocyst). "Pluripotent" means they can still become any of the roughly 200 cell types in the body, a flexibility that ordinary body cells lose as they specialise. Under the microscope an ESC is small and unremarkable: a dominant round nucleus with a bold nucleolus and only a sliver of cytoplasm, and in culture the cells pile into tight, sharp-edged colonies. Their promise lies in regenerative medicine, using lab-guided differentiation to grow replacement neurons, heart muscle or insulin-making cells, and in modelling disease and testing drugs. Because deriving classic ESC lines involves human embryos, the field is also governed by careful ethical and legal rules, and much current work uses induced pluripotent stem cells (iPSCs) that sidestep that concern.  
🇩🇪 Embryonale Stammzellen (ESCs) sind pluripotente Zellen aus der inneren Zellmasse eines sehr frühen Embryos (der Blastozyste). "Pluripotent" heißt, dass sie noch zu jedem der rund 200 Zelltypen des Körpers werden können, eine Wandelbarkeit, die gewöhnliche Körperzellen mit ihrer Spezialisierung verlieren. Unter dem Mikroskop wirkt eine ESC klein und unscheinbar: ein beherrschender runder Zellkern mit kräftigem Kernkörperchen und nur einem schmalen Saum Zytoplasma; in Kultur wachsen die Zellen zu dicht gepackten, scharf begrenzten Kolonien zusammen. Ihr Potenzial liegt in der regenerativen Medizin, indem man sie im Labor gezielt zu Ersatz-Nervenzellen, Herzmuskel oder insulinbildenden Zellen ausdifferenzieren lässt, sowie in der Krankheitsmodellierung und Wirkstoffprüfung. Da die Gewinnung klassischer ESC-Linien menschliche Embryonen betrifft, gelten strenge ethische und rechtliche Regeln, und viele Arbeiten nutzen heute induzierte pluripotente Stammzellen (iPSCs), die dieses Problem umgehen.

**Scientific.**  
🇬🇧 Embryonic stem cells are pluripotent cells derived from the inner cell mass of the pre-implantation blastocyst. They self-renew indefinitely while retaining the capacity to differentiate into derivatives of all three germ layers (ectoderm, mesoderm, endoderm). Pluripotency is maintained by a core transcription-factor network, OCT4 (POU5F1), SOX2 and NANOG, and is marked by surface antigens SSEA-3/4 and TRA-1-60/81. Ultrastructurally the cells show a high nucleus-to-cytoplasm ratio, a prominent nucleolus, predominantly open euchromatin and few immature mitochondria, consistent with a largely glycolytic metabolism. Directed differentiation is achieved in vitro by modulating signalling pathways (e.g. BMP, Wnt, FGF, Nodal/Activin) with defined growth factors and small molecules. ESCs underpin regenerative-medicine strategies, developmental and disease modelling and drug screening; ethical constraints on human-embryo use motivated the development of induced pluripotent stem cells (iPSCs), which reprogram somatic cells to an ESC-like state.  
🇩🇪 Embryonale Stammzellen sind pluripotente Zellen aus der inneren Zellmasse der Blastozyste vor der Einnistung. Sie erneuern sich unbegrenzt selbst und behalten zugleich die Fähigkeit, sich in Abkömmlinge aller drei Keimblätter (Ektoderm, Mesoderm, Entoderm) zu differenzieren. Die Pluripotenz wird durch ein zentrales Transkriptionsfaktor-Netzwerk aus OCT4 (POU5F1), SOX2 und NANOG aufrechterhalten und ist durch die Oberflächenantigene SSEA-3/4 sowie TRA-1-60/81 gekennzeichnet. Ultrastrukturell zeigen die Zellen ein hohes Kern-Plasma-Verhältnis, ein prominentes Kernkörperchen, überwiegend offenes Euchromatin und wenige unreife Mitochondrien, passend zu einem vorwiegend glykolytischen Stoffwechsel. Die gerichtete Differenzierung gelingt in vitro durch Modulation von Signalwegen (etwa BMP, Wnt, FGF, Nodal/Activin) mit definierten Wachstumsfaktoren und kleinen Molekülen. ESCs sind Grundlage regenerativer Therapieansätze, der Entwicklungs- und Krankheitsmodellierung sowie des Wirkstoff-Screenings; die ethischen Einschränkungen beim Einsatz menschlicher Embryonen führten zur Entwicklung induzierter pluripotenter Stammzellen (iPSCs), die somatische Zellen in einen ESC-ähnlichen Zustand zurückprogrammieren.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE embryonic stem cell (a small round undifferentiated animal cell from the blastocyst inner cell mass), centered in a square 1:1 1080x1080 frame with generous negative space around structures for later labels. Semi-flat vector-style shading with crisp thin clean outlines (NOT heavy black cartoon strokes) and a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints, each structure its own distinct soft colour fill, on a neutral dark charcoal uncluttered background. Match the refined house look of a muted labelled cell diagram. The cell is roughly round with a VERY HIGH nucleus-to-cytoplasm ratio: one very large round nucleus filling most of the cell, wrapped by a double nuclear envelope, containing loose open pale euchromatin (fine dispersed texture, NOT dense clumps) and ONE prominent darker nucleolus. Only a THIN rim of cytoplasm surrounds the nucleus, holding just a FEW small rounded immature mitochondria, a small Golgi apparatus, a little endoplasmic reticulum and tiny scattered ribosome dots. A quarter cut-away reveals this interior. Only a plasma membrane as the outer boundary. Do NOT draw a cell wall, chloroplasts, a large vacuole, cilia, flagella, any bacterial features, any embryo/fetus/face, or an organelle-crowded cytoplasm. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere in the image; fill the whole square edge-to-edge with no border, frame, vignette or paper sheet.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SMALL CLUSTER of a few embryonic stem cells (undifferentiated blastocyst inner-cell-mass cells) packed together into a rounded dome-shaped colony, centered in a square 1:1 1080x1080 frame with generous empty margin. Each cell is a small smooth rounded sphere with a plump turgid surface and subtle microvilli-like ruffles, cells tightly abutting with clear cell-cell junction grooves between them (a cobblestone mound). Crisp 3D surface texture, shallow depth of field so the rear cells fall softly out of focus, subtly textured neutral substrate beneath. False-color palette: soft warm cream-to-peach cells against a dark uncluttered charcoal background. SEM shows the outer surface ONLY, so render NO internal structures, NO nucleus, NO cutaway. No cilia, no flagella, no long processes, no differentiation. Anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere; fill the whole square edge-to-edge with no border, frame, vignette or letterbox.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE embryonic stem cell (a small round undifferentiated animal cell from the blastocyst inner cell mass), centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, subsurface scattering on the membranes, clean seamless dark studio background. Colorize with natural believable biological tones so structures are clearly distinguishable: a translucent pale cell body, a large lilac-blue nucleus, a warmer nucleolus, soft-toned organelles. The cell is roughly round with a VERY HIGH nucleus-to-cytoplasm ratio: one very large round nucleus filling most of the cell, bounded by a double nuclear envelope, containing loose open euchromatin and ONE prominent nucleolus. Only a THIN rim of cytoplasm surrounds it, holding just a FEW small rounded immature mitochondria, a small Golgi apparatus, a little endoplasmic reticulum and tiny scattered ribosomes. Use a gentle cut-away or soft translucency to reveal this interior. Only a plasma membrane as the outer boundary. Do NOT render a cell wall, chloroplasts, a large vacuole, cilia, flagella, any bacterial features, any embryo/fetus/face, or a crowded organelle-rich cytoplasm. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks; fill the whole square edge-to-edge with no border, frame, vignette or letterbox.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE embryonic stem cell (a small round undifferentiated animal cell from the blastocyst inner cell mass) in the style of a 19th-century atlas, yet anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. Soft translucent watercolour washes with fine ink outlines. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner (the paper IS the background), with a soft darker wash halo painted directly on the paper behind the cell; do NOT render a separate sheet, card, mat, border, frame or drop-shadow. The cell is roughly round with a VERY HIGH nucleus-to-cytoplasm ratio: one very large round nucleus filling most of the cell, wrapped by a double nuclear envelope, painted with loose open euchromatin and ONE prominent nucleolus. Only a THIN rim of cytoplasm surrounds the nucleus, holding just a FEW small rounded immature mitochondria, a small Golgi apparatus, a little endoplasmic reticulum and tiny dispersed ribosome specks. A soft painterly cut-away hints at this interior. Only a plasma membrane as the outer boundary. Do NOT paint a cell wall, chloroplasts, a large vacuole, cilia, flagella, any bacterial features, any embryo/fetus/face, or an organelle-crowded cytoplasm. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1614 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 19.6s — ✅ PASS — round animal cell, very high nucleus:cytoplasm ratio, one prominent nucleolus, thin cytoplasm rim with a few small mitochondria, Golgi and ER, muted desaturated palette with thin outlines matching the rod-bacterium/cocci house look, fills frame edge-to-edge on a neutral dark background, no text/wall/embryo. Chosen as label base.
  ![textbook 1](theme/textbook/embryonic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/embryonic-stem-cell.textbook.svg)
[interactive SVG](theme/textbook/embryonic-stem-cell.textbook.svg) · [HTML](theme/textbook/embryonic-stem-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1526 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 23.4s — ✅ PASS — small dome-shaped colony of a few smooth, plump, rounded cells with visible cell-cell junction grooves (cobblestone look), false-colour cream/peach surface only (correctly no internal structures), fills the frame with no border/vignette; realistic SEM look matching the rod-bacterium/cocci exemplars.
  ![sem 1](theme/sem/embryonic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1592 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.0s — ✅ PASS — single round cell, natural believable biological tints (warm translucent cytoplasm, lilac nucleus, warm nucleolus), very high N:C ratio, thin organelle-poor cytoplasm rim with a few small mitochondria/ER/Golgi/ribosomes, soft global illumination and rim light on a clean dark studio background, no text/wall/embryo.
  ![3d 1](theme/3d/embryonic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/embryonic-stem-cell.3d.svg)
[interactive SVG](theme/3d/embryonic-stem-cell.3d.svg) · [HTML](theme/3d/embryonic-stem-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1609 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 27.3s — ✅ PASS — naturalist plate, warm aged paper fills the entire frame edge-to-edge with a soft wash halo behind the cell (no sheet-on-a-surface), correct high N:C ratio with thin cytoplasm rim holding a few mitochondria/Golgi/ER, single nucleolus, no text; matches the cocci/rod-bacterium watercolor house look.
  ![watercolor 1](theme/watercolor/embryonic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/embryonic-stem-cell.watercolor.svg)
[interactive SVG](theme/watercolor/embryonic-stem-cell.watercolor.svg) · [HTML](theme/watercolor/embryonic-stem-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · CC BY 2.5 · Nissim Benvenisty (PLoS Biology, 2005), via Wikimedia Commons — ✅ PASS (2026-08-13) — Wikimedia/PLoS Biology (Benvenisty 2005) CC BY 2.5 phase-contrast micrograph of a real hESC colony: tightly packed small cells, sharp colony border, characteristic cobblestone morphology; AI-cleaned to crop out the second (unrelated neuron) panel and the baked-in 'B' caption, keeping the original teal false-colour phase-contrast processing.
  ![reference](../reference-microscopy/theme/light/embryonic-stem-cell.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | best for full labelling; muted refined palette matches house style |
| sem | ✅ teaching-ready | 1 | small colony correctly shows only surface/cell junctions, no internal structures |
| 3d | ✅ teaching-ready | 1 | natural biological tints, correct organelle-poor high N:C morphology |
| watercolor | ✅ teaching-ready | 1 | full-bleed aged paper, correct morphology, most attractive plate |
| reference LM | ✅ verified + cleaned | 2 | Benvenisty 2005 hESC colony phase-contrast, CC BY 2.5, cropped to single panel + caption removed |
