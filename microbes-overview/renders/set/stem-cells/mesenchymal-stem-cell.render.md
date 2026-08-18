# Mesenchymal stem cell (MSC) — render log

**Set:** `stem-cells` · **Microbe key:** `mesenchymal-stem-cell`
**Short description:** Multipotent adult stromal cell with a spindle-shaped, fibroblast-like body and tapering cytoplasmic processes; a large oval nucleus with 1–2 nucleoli, rich rough ER and Golgi. Resides in bone marrow, fat and umbilical cord and can differentiate into bone, cartilage, muscle, fat or connective-tissue cells.

Metadata sidecar: [`mesenchymal-stem-cell.render.meta.json`](mesenchymal-stem-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

A mesenchymal stem/stromal cell (MSC) is an adherent, fibroblast-like connective-tissue cell isolated from bone marrow, adipose tissue, umbilical-cord (Wharton's jelly) and other stromal niches. In culture and in tissue it has a spindle (bipolar, elongated) shape with slender tapering cytoplasmic processes, quite unlike a round blood cell or a cuboidal epithelial cell. It has a single large oval/euchromatic nucleus, usually with one or two prominent nucleoli, abundant rough endoplasmic reticulum and a well-developed Golgi apparatus (reflecting high secretory/matrix-protein output), numerous mitochondria, and a prominent actin-based cytoskeleton (stress fibres) that gives the cell its shape and lets it adhere/migrate on a substrate. By the 2006 ISCT minimal-criteria definition, MSCs are plastic-adherent under standard culture, express CD73/CD90/CD105 while lacking haematopoietic markers (CD34, CD45, CD14/CD11b, CD19/CD79α, HLA-DR), and can differentiate in vitro into osteoblasts (bone), chondrocytes (cartilage) and adipocytes (fat); they are also considered a source of myogenic and general connective-tissue lineages. MSCs are not a single morphologically fixed cell — the fine detail (process length, granularity) varies with tissue source and culture state — but the spindle/fibroblastoid body, oval nucleus with visible nucleolus/nucleoli, and rich rough-ER/Golgi are the consistent, teachable features.

Sources: [Wikipedia — Mesenchymal stem cell](https://en.wikipedia.org/wiki/Mesenchymal_stem_cell), [Dominici et al. 2006, ISCT minimal criteria for defining multipotent mesenchymal stromal cells (PubMed)](https://pubmed.ncbi.nlm.nih.gov/16923606/), [Ullah, Subbarao & Rho 2015, Human mesenchymal stem cells — current trends and future prospective (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5764194/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; large & euchromatic, reflecting active transcription | central, offset toward the cell's wide midsection | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly; prominent, 1–2 per cell | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; adhesion receptors (e.g. CD73/CD90/CD105) sit here | outermost | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel matrix housing the organelles | interior | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | folds/secretes matrix & signalling proteins; abundant in MSCs | around the nucleus | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/modifies secreted proteins for export | near the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production via oxidative phosphorylation | dispersed in cytoplasm, several | core |
| `cytoskeleton` | cytoskeleton (filamenta actini) | Cytoskeleton (actin stress fibres) | Zytoskelett (Aktin-Stressfasern) | shape, adhesion, migration along the elongated axis | spans the cell body | core |
| `cell_process` | processus cytoplasmaticus | Cytoplasmic process (filopodium) | Zellfortsatz (Filopodium) | thin tapering extensions used for substrate adhesion/migration | both poles of the spindle | core |

### Do NOT draw (scientifically misleading)
- **No cell wall** — this is an animal cell, not a plant cell or bacterium.
- **No nucleoid, plasmids or bacterial flagella** — not a prokaryote.
- **No chloroplasts** — not a plant cell.
- **No large central vacuole** — that is a plant-cell feature; MSCs have only small scattered vesicles.
- **Not round like a red blood cell or a lymphocyte** — the defining shape is an elongated, tapering, fibroblast-like spindle, not a sphere or biconcave disc.
- **No cilia/flagella for locomotion** — MSCs move by crawling (actin-driven), not by beating appendages.
- A single specimen, not a dense confluent monolayer — individual morphology must stay readable.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Dental pulp stem cells. SEM-BSE.jpg"**, a colorized SEM (backscatter) of cultured human dental-pulp-derived mesenchymal stem cells (a well-accepted MSC source tissue) spread on a substrate, showing the flattened, spindle/stellate fibroblast-like body with tapering processes typical of MSCs in culture.
- file: https://upload.wikimedia.org/wikipedia/commons/4/4d/Dental_pulp_stem_cells._SEM-BSE.jpg
- page: https://commons.wikimedia.org/wiki/File:Dental_pulp_stem_cells._SEM-BSE.jpg · License: **CC BY-SA 4.0** · Attribution: Ivan A. Novikov, A. M. Subbot, I. V. Vakhrushev (Research Institute of Eye Diseases, Russia)
AI visual verification result: **PASS (2026-08-13).** Single dominant spindle-shaped cell with clearly visible large oval nucleus (speckled nucleolar detail), fine actin-mesh cytoplasm and tapering cytoplasmic processes at both poles — matches MSC morphology well. Caveat: the raw download is greyscale and carries a baked-in institute label + instrument data bar (WD/EHT/Signal A/Date) at the bottom, with a second smaller cell fragment overlapping at the lower edge. A **cleaned, text-free, warm false-colour version recomposed around the single main cell** was produced with `edit_image.py` and is used for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Mesenchymal Stem Cell — the body's handy fix-it helper! It lives in cosy hideouts like your bone marrow, your squishy body fat, and even the umbilical cord you had as a tiny baby. Whenever your bones, cartilage or muscles need a new part, this stretchy, long-shaped cell can turn itself into exactly what's needed. It can grow up to become a bone-builder, a cartilage-cushioner, or a fluffy fat cell. Doctors and scientists study it closely because it is so good at helping the body repair itself.  
🇩🇪 Das ist die Mesenchymale Stammzelle — die geschickte Reparatur-Helferin deines Körpers! Sie wohnt an gemütlichen Orten wie deinem Knochenmark, deinem weichen Körperfett und sogar in der Nabelschnur, die du als winziges Baby hattest. Immer wenn deine Knochen, Knorpel oder Muskeln ein neues Teil brauchen, kann sich diese lang gestreckte, dehnbare Zelle in genau das verwandeln, was gebraucht wird. Sie kann zu einer Knochenbauerin, einer Knorpel-Polsterin oder einer flauschigen Fettzelle heranwachsen. Ärzte und Forscher untersuchen sie ganz genau, weil sie dem Körper so gut beim Selbst-Reparieren hilft.

**Adults (popular science, health).**  
🇬🇧 The mesenchymal stem cell (MSC) is one of the body's key repair specialists, residing quietly in bone marrow, fatty tissue and the umbilical cord until it is needed. Spindle-shaped and fibroblast-like, it can differentiate into bone-forming osteoblasts, cartilage-forming chondrocytes, fat cells, or other connective-tissue cells, making it central to how tissues maintain and heal themselves. Because of this versatility, MSCs are widely studied in regenerative medicine, from cartilage and bone repair to calming inflammation in joint and autoimmune conditions. They are not immune cells themselves, but they release signalling molecules that support nearby tissue repair and dampen excess inflammation.  
🇩🇪 Die mesenchymale Stammzelle (MSC) ist eine der wichtigsten Reparaturspezialistinnen des Körpers und wartet still im Knochenmark, im Fettgewebe und in der Nabelschnur, bis sie gebraucht wird. Spindelförmig und fibroblastenähnlich kann sie sich zu knochenbildenden Osteoblasten, knorpelbildenden Chondrozyten, Fettzellen oder anderen Bindegewebszellen entwickeln, was sie für die Erhaltung und Heilung von Gewebe zentral macht. Wegen dieser Vielseitigkeit wird die MSC in der regenerativen Medizin intensiv erforscht, von der Knorpel- und Knochenreparatur bis zur Dämpfung von Entzündungen bei Gelenk- und Autoimmunerkrankungen. Sie ist selbst keine Immunzelle, gibt aber Botenstoffe ab, die die Gewebereparatur in der Umgebung unterstützen und überschießende Entzündungen bremsen.

**Scientific.**  
🇬🇧 The mesenchymal stem/stromal cell (MSC) is a multipotent, plastic-adherent stromal cell defined by the ISCT minimal criteria as CD73+/CD90+/CD105+ while lacking haematopoietic markers (CD34, CD45, CD14/CD11b, CD19/CD79α, HLA-DR), with trilineage differentiation into osteoblasts, chondrocytes and adipocytes in vitro. Morphologically it is an elongated, bipolar, fibroblast-like cell with a large euchromatic nucleus and prominent nucleolus, extensive rough endoplasmic reticulum and a well-developed Golgi apparatus reflecting high secretory activity, and actin stress fibres that mediate substrate adhesion and migration. MSCs reside in perivascular niches across many tissues (bone-marrow stroma, adipose tissue, umbilical-cord Wharton's jelly) and act largely through paracrine secretion of cytokines, growth factors and extracellular vesicles rather than direct engraftment, conferring immunomodulatory and trophic support functions. Their multipotency and secretome make them a major focus of cell-therapy research for orthopaedic, immunological and regenerative applications.  
🇩🇪 Die mesenchymale Stamm-/Stromazelle (MSC) ist eine multipotente, plastikadhärente Stromazelle, die nach den ISCT-Mindestkriterien CD73+/CD90+/CD105+ ist und keine hämatopoetischen Marker (CD34, CD45, CD14/CD11b, CD19/CD79α, HLA-DR) trägt, mit trilinearer Differenzierung in vitro zu Osteoblasten, Chondrozyten und Adipozyten. Morphologisch ist sie eine langgestreckte, bipolare, fibroblastenähnliche Zelle mit großem euchromatischem Zellkern und deutlichem Nukleolus, ausgedehntem rauem endoplasmatischem Retikulum und einem gut entwickelten Golgi-Apparat, was ihre hohe Sekretionsaktivität widerspiegelt, sowie Aktin-Stressfasern, die Substrathaftung und Migration vermitteln. MSCs sitzen in perivaskulären Nischen zahlreicher Gewebe (Knochenmarkstroma, Fettgewebe, Whartonsulze der Nabelschnur) und wirken überwiegend parakrin durch die Sekretion von Zytokinen, Wachstumsfaktoren und extrazellulären Vesikeln statt durch direkte Engraftment, was ihnen immunmodulatorische und trophische Unterstützungsfunktionen verleiht. Ihre Multipotenz und ihr Sekretom machen sie zu einem zentralen Forschungsschwerpunkt der Zelltherapie für orthopädische, immunologische und regenerative Anwendungen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human mesenchymal stem cell (MSC), a spindle-shaped fibroblast-like adherent animal cell, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is elongated and bipolar, tapering into slender cytoplasmic processes at both ends (fibroblast-like), about 3 to 4 times longer than wide. A neat quarter cut-away reveals the interior: a large central oval nucleus containing one or two prominent nucleoli, pale cytoplasm, abundant folded rough endoplasmic reticulum sheets studded with tiny ribosome dots wrapping around the nucleus, a curved stack of Golgi apparatus cisternae, several elongated oval mitochondria with faint inner cristae, and fine actin stress fibres running lengthwise as a cytoskeleton. Anatomically faithful animal cell. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia; this is NOT a bacterium and NOT a round red blood cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human mesenchymal stem cell (MSC) spreading on a substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a flattened spindle-shaped, fibroblast-like body tapering into several long slender cytoplasmic processes and fine filopodia that anchor to a subtly textured neutral substrate. Render true 3D surface texture: a gently domed nuclear bulge, delicate membrane ruffles and ridges, and thread-like filopodia reaching outward. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm sandy-beige to soft bronze cell against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human mesenchymal stem cell (MSC), a spindle-shaped fibroblast-like animal cell, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is elongated and bipolar with slender tapering cytoplasmic processes and a few filopodia. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: a large translucent oval nucleus with one or two nucleoli, warm cytoplasm, folded rough endoplasmic reticulum around the nucleus, a curved Golgi stack, several elongated mitochondria with inner cristae, and fine actin cytoskeletal fibres. Natural colours, not near-monochrome and not neon. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia; this is an animal cell, not a bacterium. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human mesenchymal stem cell (MSC) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is a spindle-shaped, fibroblast-like body tapering into slender cytoplasmic processes at both ends, about 3 to 4 times longer than wide. A delicate painterly cut-away reveals the interior: a large central oval nucleus with one or two nucleoli, washed cytoplasm, folded rough endoplasmic reticulum wrapping the nucleus, a curved Golgi stack, several elongated mitochondria, and fine actin cytoskeletal fibres running lengthwise. Single specimen, anatomically faithful animal cell. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1599 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 19.8s — PASS (gemini-2.5-flash-image) — fibroblast-like spindle cell with nucleus + 2 nucleoli, rough ER, Golgi, mitochondria, cytoskeleton (actin stress fibres), cytoplasmic processes; correct eukaryotic organelles, no bacterial features.
  ![textbook 1](theme/textbook/mesenchymal-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/mesenchymal-stem-cell.textbook.svg)
[interactive SVG](theme/textbook/mesenchymal-stem-cell.textbook.svg) · [HTML](theme/textbook/mesenchymal-stem-cell.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3111 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 21.4s — PASS — spindle-shaped adherent cell with cytoplasmic processes, false-colour, surface only.
  ![sem 1](theme/sem/mesenchymal-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 41.5s — —
  ![sem 2](theme/sem/mesenchymal-stem-cell.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1539 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.0s — PASS — natural-tint cutaway, all organelles correctly labelled, clean leader lines.
  ![3d 1](theme/3d/mesenchymal-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/mesenchymal-stem-cell.3d.svg)
[interactive SVG](theme/3d/mesenchymal-stem-cell.3d.svg) · [HTML](theme/3d/mesenchymal-stem-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1573 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 13.9s — PASS — full-bleed aged paper, correct eukaryotic anatomy, clean leader lines.
  ![watercolor 1](theme/watercolor/mesenchymal-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/mesenchymal-stem-cell.watercolor.svg)
[interactive SVG](theme/watercolor/mesenchymal-stem-cell.watercolor.svg) · [HTML](theme/watercolor/mesenchymal-stem-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · CC BY-SA 4.0 · Ivan A. Novikov, A. M. Subbot, I. V. Vakhrushev (Research Institute of Eye Diseases, Russia) — none (no free micrograph specific to MSC morphology) — per render.md §2.
  ![reference](theme/sem/mesenchymal-stem-cell.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | correct eukaryotic anatomy |
| sem | pass | 1 | spindle morphology |
| 3d | pass | 1 | correct anatomy, clean labels |
| watercolor | pass | 1 | full-bleed, correct anatomy |
