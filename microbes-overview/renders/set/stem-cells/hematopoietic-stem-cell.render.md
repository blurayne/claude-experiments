# Hematopoietic stem cell (HSC) — render log

**Set:** `stem-cells` · **Microbe key:** `hematopoietic-stem-cell`
**Short description:** Rare bone-marrow stem cell (~7–10 µm), the mother of all blood cells — a small round agranular cell with a large euchromatic nucleus and a thin cytoplasmic rim, that self-renews and gives rise to every blood lineage.

Metadata sidecar: [`hematopoietic-stem-cell.render.meta.json`](hematopoietic-stem-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The hematopoietic stem cell (HSC) is a small, round-to-oval animal cell, roughly 7–10 µm across — about the size of a small lymphocyte and morphologically almost indistinguishable from one under a normal microscope (HSCs are defined by surface markers such as CD34, not by shape). It has a **high nucleus-to-cytoplasm ratio**: a large, round or gently indented **nucleus** fills most of the cell and carries mostly **dispersed, pale euchromatin** (a sign of an active, transcriptionally poised cell) with usually one small **nucleolus**. Around it lies only a **thin rim of agranular, basophilic cytoplasm** that contains a **few mitochondria** (quiescent HSCs rely largely on glycolysis and keep a low mitochondrial mass), scattered **free ribosomes and polysomes**, a small **Golgi apparatus** and a little endoplasmic reticulum. The **plasma membrane** carries characteristic **surface glycoproteins/receptors** (e.g. CD34, KIT/CD117 for the growth factor SCF, CXCR4 for the niche chemokine CXCL12) and often small **microvilli or membrane ruffles/filopodia** used to sense and anchor into the bone-marrow niche. HSCs are anchoring, largely non-motile cells that divide rarely; when they do, they can self-renew or commit to a blood lineage.

Sources: [Wikipedia — Hematopoietic stem cell](https://en.wikipedia.org/wiki/Hematopoietic_stem_cell), [Wikipedia — Haematopoiesis](https://en.wikipedia.org/wiki/Haematopoiesis), [Morrison SJ & Scadden DT, "The bone marrow niche for haematopoietic stem cells", *Nature* 505, 327–334 (2014)](https://www.nature.com/articles/nature12984).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | lipid bilayer boundary; carries stem-cell receptors | outer boundary | core |
| `surface_markers` | glycoproteina superficialia (CD34, KIT/CD117, CXCR4) | Surface markers (CD34, KIT) | Oberflächenmarker (CD34, KIT) | receptors that read niche signals & define the HSC | on the membrane | core |
| `microvilli` | microvilli / filopodia | Microvilli / filopodia | Mikrovilli / Filopodien | sense & anchor the cell into the niche | surface projections | variable |
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; dominates the cell (high N:C ratio) | central, large | core |
| `euchromatin` | euchromatinum | Euchromatin (dispersed) | Euchromatin (aufgelockert) | open, active chromatin — poised for many fates | filling the nucleus | core |
| `nucleolus` | nucleolus | Nucleolus | Nucleolus | ribosome assembly; sign of an active cell | inside nucleus | core |
| `nuclear_envelope` | involucrum nucleare | Nuclear envelope | Kernhülle | double membrane enclosing the nucleus | around nucleus | core |
| `cytoplasm` | cytoplasma (agranulare) | Cytoplasm (thin, agranular) | Zytoplasma (schmaler Saum) | thin basophilic rim; few organelles | around nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | energy; kept low & few in quiescent HSCs | in cytoplasm | core |
| `ribosomes` | ribosoma (80S) / polysomata | Free ribosomes / polysomes | freie Ribosomen / Polysomen | protein synthesis | dispersed in cytoplasm | core |
| `golgi_apparatus` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | processes & sorts proteins | near nucleus | core |

### Do NOT draw (scientifically misleading)
- **No cell wall** — this is an animal cell (no bacterial/plant/fungal wall, no peptidoglycan).
- **No cytoplasmic granules** — HSCs are AGRANULAR; do not draw the specific granules of a neutrophil/eosinophil/basophil.
- **No multilobed or segmented nucleus** — the nucleus is round or gently indented (not the lobed nucleus of a granulocyte).
- **No lineage-specific features** — no haemoglobin/red colour of an erythrocyte, no big phagocytic vacuoles of a macrophage, no antibodies; the HSC is undifferentiated.
- **Not a large or amoeboid cell** — keep it small with a HIGH nucleus-to-cytoplasm ratio (thin cytoplasm rim), not a big spread-out crawling cell.
- **No face, eyes or anthropomorphism.**
- Do not draw obvious daughter cells / a mitotic spindle — show a single resting cell.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Hematopoietic stem cells cannot be identified by morphology alone (they look like small lymphocytes and are defined by surface markers/flow cytometry such as CD34), so no authenticated, openly-licensed micrograph labelled specifically as an *isolated HSC* exists. Following the skill's guidance to accept the **HSC niche** instead, we use a genuine bone-marrow histology micrograph showing the marrow environment where HSCs reside among the differentiating cells of all three lineages.

Chosen: **Wikimedia Commons — "Trilineage hematopoiesis (original).jpg"**, an H&E-stained bone-marrow aspirate/biopsy smear showing representative cells of the myeloid, erythroid and megakaryocytic lineages (including a large multilobed megakaryocyte) packed into the marrow space — the tissue niche HSCs occupy, alongside numerous small, round, densely-staining agranular cells consistent with early progenitor/lymphocyte-like morphology (the closest visual analogue to an HSC's high-N:C-ratio appearance, though individual HSCs cannot be pointed out without a CD34 stain).
- file: https://upload.wikimedia.org/wikipedia/commons/8/85/Trilineage_hematopoiesis_%28original%29.jpg
- page: https://commons.wikimedia.org/wiki/File:Trilineage_hematopoiesis_(original).jpg · License: **CC0 1.0 (Public Domain)** · Attribution: Mikael Häggström, M.D., Wikimedia Commons

AI visual verification result: **PASS with caveat (2026-08-15).** Genuine H&E bone-marrow histology (not a diagram): a densely cellular marrow field with a clearly readable central megakaryocyte and numerous individually resolvable myeloid/erythroid precursors and small round lymphocyte-like cells, no baked-in text/scale bar/border. This documents the real bone-marrow niche and general small-round-agranular-cell morphology class HSCs belong to; it is a **dense mixed-lineage field, not an isolated identified HSC** (none exists as a public micrograph — HSCs are ~1 in 10⁴–10⁵ marrow cells and are only identifiable by flow cytometry/marker staining, not by light-microscope morphology). A cropped, text/border-free, recomposed version was produced with `edit_image.py` and is used for display — see §5.

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Say hello to the hematopoietic stem cell — the great-grandmother of your blood! She is a tiny round cell who lives deep inside your bones, in a cosy spot called the marrow. She is a bit lazy and rests most of the time, but every now and then she wakes up and makes a brand-new blood cell: red ones to carry oxygen, white ones to fight germs, and sticky platelets to patch up cuts. All day long her helper neighbours whisper 'stay here, we need you!' and feed her special growth signals so she never runs out. Thanks to her, your blood is always being topped up.  
🇩🇪 Sag Hallo zur hämatopoetischen Stammzelle — der Urgroßmutter deines Blutes! Sie ist eine winzige runde Zelle und wohnt tief in deinen Knochen, an einem gemütlichen Ort namens Knochenmark. Meistens ruht sie gemütlich, doch ab und zu wacht sie auf und macht eine ganz neue Blutzelle: rote, die Sauerstoff tragen, weiße, die Keime bekämpfen, und klebrige Blutplättchen, die Wunden flicken. Den ganzen Tag flüstern ihr die Nachbarzellen zu 'bleib hier, wir brauchen dich!' und füttern sie mit besonderen Wachstumssignalen, damit sie nie ausgeht. Dank ihr wird dein Blut immer wieder aufgefüllt.

**Adults (popular science, health).**  
🇬🇧 The hematopoietic stem cell (HSC) sits at the very top of the blood family tree. A few thousand of these rare cells live in the bone marrow and, over a lifetime, replace the hundreds of billions of red cells, white cells and platelets we use up every single day. They manage this with two tricks: self-renewal (making a copy of themselves) and differentiation (committing to a blood lineage). HSCs are famously home-bodies — they depend on a supportive 'niche' of marrow cells and growth factors, and mostly stay quiet, dividing rarely to protect their genome. Medically they are the cells transferred in a bone-marrow or stem-cell transplant, a curative therapy for leukaemia and several blood and immune disorders.  
🇩🇪 Die hämatopoetische Stammzelle (HSC) steht an der Spitze des Blut-Stammbaums. Nur einige Tausend dieser seltenen Zellen leben im Knochenmark und ersetzen im Lauf des Lebens die hunderte Milliarden roten und weißen Blutkörperchen und Blutplättchen, die wir Tag für Tag verbrauchen. Das gelingt ihnen mit zwei Kunststücken: Selbsterneuerung (eine Kopie ihrer selbst herstellen) und Differenzierung (sich auf eine Blutzelllinie festlegen). HSCs sind ausgesprochene Stubenhocker — sie brauchen eine schützende 'Nische' aus Knochenmarkzellen und Wachstumsfaktoren und bleiben meist ruhig, teilen sich nur selten, um ihr Erbgut zu schonen. Medizinisch sind sie die Zellen, die bei einer Knochenmark- oder Stammzelltransplantation übertragen werden — eine heilende Therapie bei Leukämie und mehreren Blut- und Immunkrankheiten.

**Scientific.**  
🇬🇧 Hematopoietic stem cells (HSCs) are multipotent, self-renewing cells that reside chiefly in adult bone marrow and sustain lifelong haematopoiesis, giving rise to all myeloid and lymphoid lineages. Morphologically they are unremarkable — small (~7–10 µm), round, agranular cells with a high nucleus-to-cytoplasm ratio, dispersed euchromatin and a thin basophilic cytoplasmic rim — and are instead identified immunophenotypically (in humans classically Lin− CD34+ CD38− CD90+ CD45RA−). Most HSCs are quiescent (G0), rely largely on glycolysis with low mitochondrial output, and divide infrequently, a strategy that limits replicative and oxidative DNA damage. Their fate is governed by a specialised perivascular/endosteal niche whose stromal and endothelial cells supply anchoring signals and cytokines such as stem cell factor (SCF/KIT ligand), CXCL12 (via CXCR4) and thrombopoietin. This niche dependence underpins HSC mobilisation, homing and engraftment in clinical stem-cell transplantation.  
🇩🇪 Hämatopoetische Stammzellen (HSCs) sind multipotente, selbsterneuernde Zellen, die vor allem im adulten Knochenmark liegen und die lebenslange Hämatopoese aufrechterhalten, also alle myeloischen und lymphatischen Linien hervorbringen. Morphologisch sind sie unauffällig — kleine (~7–10 µm), runde, granulafreie Zellen mit hohem Kern-Plasma-Verhältnis, aufgelockertem Euchromatin und einem schmalen basophilen Zytoplasmasaum — und werden stattdessen immunphänotypisch identifiziert (beim Menschen klassisch Lin− CD34+ CD38− CD90+ CD45RA−). Die meisten HSCs sind ruhend (G0), decken ihren Energiebedarf überwiegend glykolytisch bei geringer mitochondrialer Aktivität und teilen sich selten — eine Strategie, die replikative und oxidative DNA-Schäden begrenzt. Ihr Schicksal steuert eine spezialisierte perivaskuläre/endostale Nische, deren Stroma- und Endothelzellen Halte-Signale und Zytokine wie Stammzellfaktor (SCF/KIT-Ligand), CXCL12 (über CXCR4) und Thrombopoietin liefern. Diese Nischenabhängigkeit erklärt Mobilisierung, Homing und Anwachsen der HSCs bei der klinischen Stammzelltransplantation.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway in the EXACT house style of the plates rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (NEVER bright primary or cartoon colours), THIN clean outlines (NOT heavy black cartoon strokes), gentle soft shading with subtle dimensionality, and a distinct soft colour fill for each structure. Refined and elegant, NOT a bold-outlined flat cartoon. Subject: ONE small round hematopoietic stem cell (an animal cell, like a small lymphocyte) with a HIGH nucleus-to-cytoplasm ratio — a very large round, gently indented nucleus filling most of the cell, surrounded by only a thin rim of agranular cytoplasm. Quarter cut-away revealing: the large nucleus with pale dispersed euchromatin and one small round nucleolus, a fine double nuclear envelope, and in the thin cytoplasm rim a few small mitochondria, a small Golgi apparatus, and tiny scattered free ribosome dots. The plasma membrane bears small microvilli / filopodia and subtle surface receptor markers. Animal cell only — NO cell wall, NO cytoplasmic granules, NO multilobed nucleus, NO red haemoglobin, no lineage-specific features. No face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark charcoal uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph of a SINGLE small round hematopoietic stem cell (~7–10 µm), a spherical animal cell resting on a subtly textured substrate. Smooth turgid surface densely covered with fine short microvilli and gentle membrane ruffles / a few filopodia anchoring it, conveying true cell scale. Cool studio microscopy lighting, shallow depth of field, warm amber-to-bronze false-color cell against a dark charcoal background. Surface only — NO internal structures, NO cell wall, agranular smooth sphere, no lineage features. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE small round hematopoietic stem cell with a gentle translucency and a soft cut-away. Natural believable biological tones, not neon, not monochrome: a warm translucent cell body with a distinct large blue-tinted round nucleus (high nucleus-to-cytoplasm ratio) showing pale dispersed euchromatin and one small nucleolus, wrapped in a fine nuclear envelope; in the thin cytoplasm rim a few red-brown mitochondria, a small pale Golgi apparatus and faint ribosome speckles. The plasma membrane carries fine microvilli/filopodia and subtle surface receptors. Soft global illumination, subsurface scattering on the membrane, gentle rim light, clean seamless dark studio background. Animal cell only — NO cell wall, NO granules, NO lobed nucleus, no lineage colours. No face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: ONE small round hematopoietic stem cell with a HIGH nucleus-to-cytoplasm ratio — a large round gently indented nucleus filling most of the cell with a small nucleolus and pale dispersed chromatin, and only a thin rim of agranular cytoplasm around it. A painterly cut-away reveals a few small mitochondria, a small Golgi and lightly stippled ribosomes; the membrane shows delicate microvilli/filopodia. Animal cell, no bacterial or plant features, no granules, no lobed nucleus. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3355 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 16.2s — FAIL (gemini-2.5-flash-image) — monochrome/uncoloured line drawing (greyscale outlines only, no distinct structure fills); house style requires a coloured muted-palette plate.
  ![textbook 1](theme/textbook/hematopoietic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 19.3s — PASS (gemini-2.5-flash-image) — muted desaturated palette, thin clean outlines, distinct soft-colour fill per structure (lavender nucleus with dispersed chromatin dashes, magenta nucleolus, reddish-brown mitochondria, green Golgi stack, teal ribosome dots, orange membrane rim with microvilli); correct high N:C ratio, agranular cytoplasm, no cell wall/lobed nucleus.
  ![textbook 2](theme/textbook/hematopoietic-stem-cell.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/hematopoietic-stem-cell.textbook.svg)
[interactive SVG](theme/textbook/hematopoietic-stem-cell.textbook.svg) · [HTML](theme/textbook/hematopoietic-stem-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1484 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 11.7s — PASS (gemini-2.5-flash-image) — single round false-colour cell, dense fine microvilli/fuzz over the whole surface, warm amber-bronze palette, surface only (no interior), clean dark background, a couple of anchoring filopodia to the substrate; no text/border.
  ![sem 1](theme/sem/hematopoietic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3166 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 17.2s — PARTIAL (gemini-2.5-flash-image) — correct organelle set (nucleus, nucleolus, mitochondria, Golgi stack, ribosome speckles, microvilli) and natural tints, but nucleus is off-centre/asymmetric and the branching surface-receptor linework reads slightly busy; superseded by attempt 2.
  ![3d 1](theme/3d/hematopoietic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 16.8s — PASS (gemini-2.5-flash-image) — large centred translucent blue-tinted nucleus (high N:C ratio) with visible nucleolus, thin cytoplasm rim with reddish-brown mitochondria, pale Golgi stack, faint ribosome speckles, fine microvilli on the membrane; natural biological tones, no cell wall/granules/lobed nucleus, clean dark studio background.
  ![3d 2](theme/3d/hematopoietic-stem-cell.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/hematopoietic-stem-cell.3d.svg)
[interactive SVG](theme/3d/hematopoietic-stem-cell.3d.svg) · [HTML](theme/3d/hematopoietic-stem-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1631 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 69.9s — PASS (gemini-2.5-flash-image) — warm aged paper fills the frame edge-to-edge (no mat/frame/sheet-on-surface), fine ink linework, single centred cell with large indented nucleus + small nucleolus, thin agranular cytoplasm rim with a few mitochondria and a striped Golgi stack, delicate microvilli hairs at the perimeter; anatomically correct animal-cell cutaway.
  ![watercolor 1](theme/watercolor/hematopoietic-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/hematopoietic-stem-cell.watercolor.svg)
[interactive SVG](theme/watercolor/hematopoietic-stem-cell.watercolor.svg) · [HTML](theme/watercolor/hematopoietic-stem-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · CC0 1.0 (Public Domain) · Mikael Häggström, M.D., Wikimedia Commons — PASS with caveat — genuine CC0 H&E bone-marrow histology (Trilineage hematopoiesis, Mikael Häggström) showing the HSC niche among differentiating myeloid/erythroid/megakaryocytic cells; a dense but individually-readable marrow field, not an isolated identified HSC (none exists publicly — HSCs are only identifiable by CD34/marker flow cytometry, not light-microscope morphology). Cleaned/recomposed with edit_image.py (real-02) for display.
  ![reference](../reference-microscopy/theme/light/hematopoietic-stem-cell.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | coloured muted plate, correct eukaryotic anatomy, high N:C ratio |
| sem | pass | 1 | false-colour surface with dense microvilli, correct scale/shape |
| 3d | pass | 2 | natural tints, centred nucleus, correct organelle set |
| watercolor | pass | 1 | full-bleed aged paper, correct anatomy |
