# Induced pluripotent stem cell (iPS) — render log

**Set:** `stem-cells` · **Microbe key:** `induced-pluripotent-stem-cell`
**Short description:** A body cell reprogrammed by a few transcription factors (Yamanaka factors: OCT4, SOX2, KLF4, c-MYC) back into an embryonic-like pluripotent state; small, round, with a huge nucleus, prominent nucleoli and immature mitochondria — later differentiated in vitro into a target lineage.

Metadata sidecar: [`induced-pluripotent-stem-cell.render.meta.json`](induced-pluripotent-stem-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

An induced pluripotent stem cell (iPSC) is a somatic (body) cell — typically a skin fibroblast or blood cell — that has been reprogrammed to an embryonic-stem-cell-like pluripotent state by the forced expression of a small set of transcription factors (the **Yamanaka factors**: OCT3/4, SOX2, KLF4 and c-MYC). Morphologically a single iPSC is small and roughly round to polygonal (about 7–15 µm across, cell area ~40–45 µm²) and grows packed into flat, compact colonies with sharp, well-defined borders. The single most diagnostic feature is a **very high nucleus-to-cytoplasm ratio (N:C ≈ 0.9)**: an outsized nucleus fills most of the cell, leaving only a thin rim of cytoplasm. The nucleus contains **one or more large, voluminous, reticulated nucleoli** and **open, decondensed chromatin (euchromatin) with essentially no heterochromatin clumps** — the physical correlate of a broadly active, plastic genome. The cytoplasm is organelle-poor: scattered free ribosomes, small amounts of endoplasmic reticulum and a modest Golgi, some lipid droplets and glycogen, and a small number of **immature, rounded mitochondria with few, poorly developed cristae** (pluripotent cells rely largely on glycolysis, so their mitochondria look "unfinished" compared with the mature, cristae-rich mitochondria of the parent cell). The surface carries pluripotency markers (e.g. SSEA-4, TRA-1-60, TRA-1-81) used to identify true iPSCs. Given the target lineage cues, an iPSC can be differentiated in vitro into cells of all three germ layers, making it a renewable source for disease modelling and cell therapies.

Sources: [Takahashi et al., *Cell* 2007 — induction of human iPSCs](https://www.cell.com/fulltext/S0092-8674(07)01471-7) · [Chan et al., *Nat. Biotechnol.* / PLOS ONE 2012, morphologic & gene-expression criteria for iPSCs](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0048677) · [Prieto et al., ultrastructure of iPSCs (immature mitochondria, euchromatin), PMC5680563](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5680563/) · [Wakui et al., iPSC quality by morphology, PMC5668125](https://pmc.ncbi.nlm.nih.gov/articles/PMC5668125/) · [NIH National Eye Institute — patient-derived iPSC colony (image source)](https://www.flickr.com/photos/nihgov/51816035910).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; controls transport & signalling | cell surface | core |
| `pluripotency_marker` | signa superficialia pluripotentiae | Pluripotency surface markers | Pluripotenz-Oberflächenmarker | SSEA-4 / TRA-1-60: mark the true pluripotent state | on the membrane | core |
| `nucleus` | nucleus | Nucleus | Zellkern | huge, dominant; holds the reprogrammed genome | central, fills most of cell | core |
| `nucleolus` | nucleolus | Prominent nucleolus | Prominenter Nucleolus | large & reticulated; intense ribosome production | inside nucleus, 1–several | core |
| `euchromatin` | euchromatinum | Open chromatin (euchromatin) | Offenes Chromatin (Euchromatin) | decondensed, broadly active genome; no heterochromatin clumps | throughout nucleus | core |
| `yamanaka_factors` | factores reprogrammationis (Yamanaka) | Yamanaka reprogramming factors | Yamanaka-Faktoren | OCT4/SOX2/KLF4/c-MYC bind DNA and reset cell identity | bound to nuclear DNA | core (defining) |
| `cytoplasm` | cytoplasma | Scant cytoplasm | Schmales Zytoplasma | thin rim; high N:C ratio | between nucleus & membrane | core |
| `mitochondrion` | mitochondrion (immaturum) | Immature mitochondrion | Unreifes Mitochondrium | rounded, few cristae; glycolytic metabolism | in the cytoplasm rim | core |
| `ribosome` | ribosoma | Ribosomes | Ribosomen | protein synthesis; abundant free ribosomes | dispersed in cytoplasm | core |
| `endoplasmic_reticulum` | reticulum endoplasmaticum | Endoplasmic reticulum | Endoplasmatisches Retikulum | sparse membranes; protein/lipid handling | cytoplasm | supporting |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | small; packaging/secretion | near nucleus | supporting |

### Do NOT draw (scientifically misleading)
- **No cell wall** — this is an animal cell, not a bacterium or plant cell.
- **No bacterial structures** — no nucleoid, capsule, flagella, pili, fimbriae or plasmids.
- **No plant features** — no chloroplasts and no large central vacuole.
- **No mature, cristae-packed mitochondria** — iPSC mitochondria are few, rounded and *immature* with sparse cristae.
- **No dense heterochromatin clumps / condensed chromosomes** — chromatin is open (euchromatic); the cell is not shown mid-mitosis.
- **No abundant, spacious cytoplasm** — the N:C ratio is high; cytoplasm is a thin rim around a dominant nucleus.
- **No face, eyes or anthropomorphism.**
- For the illustration styles draw a **single cell** (a cutaway); a whole colony belongs only to the real micrograph.
- No text, letters, numbers, labels, scale bars or watermarks baked into the image.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **NIH / National Eye Institute** confocal fluorescence image of a **human iPSC colony** derived from an albinism (OCA1A) patient, immunostained for pluripotency markers — **OCT4 (red, a Yamanaka factor), SSEA-4 (green, a surface marker), and cell nuclei (blue)**. This directly visualises the defining biology (Yamanaka factor + pluripotency marker + nucleus-dense colony), and it is Public Domain.
- file: https://upload.wikimedia.org/wikipedia/commons/3/3e/Human_induced_pluripotent_stem_cell_colony_%2851816035910%29.jpg
- page: https://commons.wikimedia.org/wiki/File:Human_induced_pluripotent_stem_cell_colony_(51816035910).jpg · License: **Public Domain Mark 1.0** · National Institutes of Health / National Eye Institute (NIH Image Gallery, via Flickr)
- modality: confocal immunofluorescence (LM). A colony rather than a single isolated cell — appropriate here, because compact colony morphology and marker expression ARE the identifying features of iPSCs.

AI visual verification result: see §5 (verified after download).
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the iPS cell: it used to be an ordinary skin cell, until scientists gave it four special reset switches (called the Yamanaka factors) that turned back its clock! Now it is young and round again, with a giant nucleus that takes up almost the whole cell, like a balloon stuffed into a tiny room. Because it forgot what kind of cell it used to be, it can grow up all over again into almost ANY cell in the body: a brain cell, a heart cell, a skin cell, you name it. Doctors love growing colonies of these cells in dishes so they can study diseases up close and test new medicines without needing to poke anyone.  
🇩🇪 Das ist die iPS-Zelle: Früher war sie eine ganz normale Hautzelle, bis Forschende ihr vier besondere Reset-Schalter gaben (die Yamanaka-Faktoren genannt werden) und ihre Uhr zurückdrehten! Jetzt ist sie wieder jung und rund, mit einem riesigen Zellkern, der fast die ganze Zelle ausfüllt, wie ein Luftballon in einem winzigen Zimmer. Weil sie vergessen hat, was für eine Zelle sie mal war, kann sie noch einmal zu fast JEDER Zelle im Körper heranwachsen: eine Gehirnzelle, eine Herzzelle, eine Hautzelle, alles ist möglich. Forschende züchten gerne ganze Kolonien dieser Zellen in Schälchen, um Krankheiten genau zu untersuchen und neue Medikamente zu testen, ohne dass dafür jemand gepikst werden muss.

**Adults (popular science, health).**  
🇬🇧 An induced pluripotent stem cell starts life as an ordinary adult cell, often a skin or blood cell, until researchers introduce four reprogramming genes, the Yamanaka factors, that erase its specialised identity and reset it to an embryonic-like state. The result is a small, round cell dominated by an oversized nucleus with prominent nucleoli, surrounded by only a thin rim of cytoplasm holding immature, energy-frugal mitochondria. From this blank-slate state, an iPS cell can be coaxed with the right chemical cues into neurons, heart muscle, insulin-producing pancreas cells and more. That versatility, achieved without using embryos, is why iPS cells have become a mainstay for modelling disease in a dish, screening drugs on a patient's own cells, and developing personalised regenerative therapies.  
🇩🇪 Eine induzierte pluripotente Stammzelle beginnt ihr Leben als ganz gewöhnliche erwachsene Zelle, oft eine Haut- oder Blutzelle, bis Forschende vier Reprogrammierungsgene, die Yamanaka-Faktoren, einschleusen, die ihre spezialisierte Identität löschen und sie in einen embryoähnlichen Zustand zurückversetzen. Das Ergebnis ist eine kleine, runde Zelle, die von einem übergroßen Zellkern mit auffälligen Nukleoli dominiert wird, umgeben von nur einem schmalen Zytoplasmasaum mit unreifen, sparsam arbeitenden Mitochondrien. Aus diesem gleichsam unbeschriebenen Zustand lässt sich eine iPS-Zelle mit den passenden chemischen Signalen zu Nervenzellen, Herzmuskelzellen, insulinproduzierenden Bauchspeicheldrüsenzellen und vielem mehr heranreifen. Diese Vielseitigkeit, erreicht ohne Embryonen zu verwenden, macht iPS-Zellen zu einem festen Werkzeug, um Krankheiten in der Petrischale nachzustellen, Medikamente an den eigenen Zellen von Patientinnen und Patienten zu testen und personalisierte regenerative Therapien zu entwickeln.

**Scientific.**  
🇬🇧 Induced pluripotent stem cells (iPSCs) are generated by forced ectopic expression of a defined set of transcription factors, canonically OCT3/4, SOX2, KLF4 and c-MYC, in a somatic cell, which triggers a stepwise epigenetic reprogramming process that erases lineage-specific DNA methylation and chromatin marks and reactivates the endogenous pluripotency network (OCT4, SOX2, NANOG). Morphologically, iPSCs display a very high nucleus-to-cytoplasm ratio, one or more prominent, reticulated nucleoli, and globally decondensed euchromatin with minimal heterochromatin, consistent with a permissive, broadly transcribed genome. Their mitochondria remain small, rounded and cristae-poor, reflecting a predominantly glycolytic metabolic profile typical of pluripotent cells rather than the oxidative metabolism of the parental somatic cell. Cells are validated as bona fide pluripotent by surface marker expression (SSEA-4, TRA-1-60, TRA-1-81), pluripotency gene expression, and functional differentiation assays into derivatives of all three germ layers (embryoid body formation or teratoma assay). Clinically and experimentally, iPSCs underpin disease-in-a-dish modelling, high-throughput drug screening, and autologous cell-therapy strategies, since they can be derived from a patient's own cells and later directed via defined differentiation protocols into the desired target lineage.  
🇩🇪 Induzierte pluripotente Stammzellen (iPSZ) entstehen durch erzwungene ektopische Expression eines definierten Satzes von Transkriptionsfaktoren, klassischerweise OCT3/4, SOX2, KLF4 und c-MYC, in einer somatischen Zelle; dies löst einen stufenweisen epigenetischen Reprogrammierungsprozess aus, der linienspezifische DNA-Methylierungs- und Chromatinmarkierungen löscht und das endogene Pluripotenznetzwerk (OCT4, SOX2, NANOG) reaktiviert. Morphologisch zeigen iPSZ ein sehr hohes Kern-Plasma-Verhältnis, ein oder mehrere auffällige, retikulierte Nukleoli sowie global dekondensiertes Euchromatin mit minimalem Heterochromatin, was einem offenen, breit transkribierten Genom entspricht. Ihre Mitochondrien bleiben klein, rundlich und cristaearm, was ein überwiegend glykolytisches Stoffwechselprofil widerspiegelt, wie es für pluripotente Zellen typisch ist, im Gegensatz zum oxidativen Stoffwechsel der ursprünglichen somatischen Zelle. Zellen werden als echt pluripotent validiert durch Expression von Oberflächenmarkern (SSEA-4, TRA-1-60, TRA-1-81), Expression von Pluripotenzgenen sowie funktionelle Differenzierungstests in Derivate aller drei Keimblätter (Embryoidkörper-Bildung oder Teratom-Test). Klinisch und experimentell bilden iPSZ die Grundlage für Krankheitsmodellierung in der Schale, Hochdurchsatz-Wirkstoffscreening und autologe Zelltherapie-Strategien, da sie aus den eigenen Zellen einer Patientin oder eines Patienten gewonnen und anschließend über definierte Differenzierungsprotokolle in die gewünschte Ziellinie gelenkt werden können.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE induced pluripotent stem cell (iPSC), an animal/human cell, centered in a square 1:1 1080x1080 frame with generous negative space around each structure for later labels. Match this exact house look: a MUTED, sophisticated, slightly desaturated educational palette (soft dusty tints, never bright primary or cartoon colours); THIN, clean outlines (not heavy black strokes); gentle soft shading with subtle dimensionality; each structure its own distinct soft colour fill; a neutral dark charcoal uncluttered background that fills the whole square edge-to-edge. Semi-flat vector-style shading. The cell is small and roughly round to gently polygonal, with a smooth plasma membrane. Its defining feature is a VERY HIGH nucleus-to-cytoplasm ratio: one enormous central nucleus fills most of the cell, leaving only a THIN RIM of cytoplasm. A neat quarter cut-away reveals the interior. Inside the nucleus show one or two LARGE prominent rounded nucleoli, soft open decondensed chromatin (euchromatin) as a light even wash with NO dense heterochromatin clumps, and a scatter of tiny reprogramming transcription factor proteins bound to fine DNA strands (small distinct dots on threads). In the thin cytoplasm rim show a FEW small ROUNDED immature mitochondria with only a couple of faint cristae (not cristae-packed), tiny numerous free ribosomes as fine dots, a small sparse endoplasmic reticulum, and a small Golgi apparatus near the nucleus. Faint pluripotency surface markers dot the membrane. Do NOT draw a cell wall, chloroplasts, a large vacuole, or any bacterial structures (no nucleoid, flagella, pili or plasmids); do NOT draw mature cristae-rich mitochondria or condensed chromosomes; no face or eyes. Single cell only, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of induced pluripotent stem cells (iPSCs), showing ONE dominant rounded cell in the foreground (with one or two neighbours just touching it to hint at a compact colony), centered in a square 1:1 1080x1080 frame with generous empty margin, the image filling all four edges with no border. Render true 3D surface texture: a plump, roughly spherical cell with a gently folded, microvilli-dusted membrane surface and shallow depth of field so the neighbours fall softly out of focus, on a subtly textured neutral substrate. False-color palette: a warm rose-to-lilac cell against a dark charcoal background. Show only the true cell SURFACE — smooth rounded contours, fine surface ruffles and small surface protrusions (pluripotency markers implied as texture); SEM shows surface only, so render NO internal structures and NO cutaway. Cells are packed and rounded with high surface tension, the signature look of a pluripotent stem cell colony. Anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE induced pluripotent stem cell (iPSC), an animal/human cell, centered in a square 1:1 1080x1080 frame with generous margin, on a clean seamless dark studio background that fills the whole square (no border, no frame). Soft global illumination, gentle rim light, subsurface scattering on the membranes, scientific-animation look. Colorize with natural, believable biological tones so structures are clearly distinguishable: a translucent pale cell body, a large warm-tinted nucleus, distinct tints for nucleoli, mitochondria, ER and Golgi. The cell is small and roughly spherical with a smooth plasma membrane, and shows a VERY HIGH nucleus-to-cytoplasm ratio: one large central nucleus dominates, leaving a thin cytoplasm rim. Use a gentle cut-away / translucency to reveal the interior: one or two LARGE prominent rounded nucleoli, soft open euchromatin (no dense heterochromatin clumps), and fine DNA strands studded with tiny reprogramming transcription factor proteins. In the thin cytoplasm show a FEW small ROUNDED immature mitochondria with sparse cristae, numerous tiny free ribosomes, a little endoplasmic reticulum and a small Golgi. Faint pluripotency surface markers stipple the membrane. Do NOT render a cell wall, chloroplasts, a large vacuole, or any bacterial structures (no nucleoid, flagella, pili, plasmids); no mature cristae-packed mitochondria; no condensed chromosomes; no face. Single cell, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE induced pluripotent stem cell (iPSC), an animal/human cell, in the style of a 19th-century atlas but anatomically modern and correct, centered in a square 1:1 1080x1080 frame. The warm aged paper MUST FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background; do NOT paint the artwork as a separate sheet, card or page lying on a table, and NO mat, border, frame, drop-shadow or grey/dark panel around a paper sheet. Subject large and centred with a soft darker wash halo painted directly on the paper behind it. Soft translucent watercolour washes with fine ink linework for outlines. The cell is small and roughly round with a smooth membrane and a VERY HIGH nucleus-to-cytoplasm ratio: one large central nucleus fills most of the cell, leaving a thin cytoplasm rim. A soft painterly cut-away hints at the interior: one or two LARGE prominent rounded nucleoli, a light even wash of open euchromatin (NO dense heterochromatin clumps), and delicate DNA strands dotted with tiny reprogramming transcription factor proteins. In the thin cytoplasm show a FEW small ROUNDED immature mitochondria with sparse cristae, tiny dispersed free ribosome specks, a little endoplasmic reticulum and a small Golgi. Faint pluripotency surface markers fleck the membrane. Do NOT paint a cell wall, chloroplasts, a large vacuole, or any bacterial structures (no nucleoid, flagella, pili, plasmids); no mature cristae-rich mitochondria; no condensed chromosomes; no face. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 3 attempt(s), 5215 tok, $0.116
- attempt 1 · `gemini-2.5-flash-image` · 28.3s — FAIL (gemini-2.5-flash-image) — correctly coloured and anatomically reasonable, but the artwork sits inset on a dark-charcoal square with a visible pale/white margin around it (a baked-in border/frame), violating the edge-to-edge fill rule; re-rendered.
  ![textbook 1](theme/textbook/induced-pluripotent-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 27.6s — PASS (gemini-2.5-flash-image) — huge dominant nucleus with 2 nucleoli, thin cytoplasm rim, immature rounded mitochondria (sparse cristae), ER, Golgi stack, scattered ribosomes; muted dusty palette, thin clean outlines, neutral dark-charcoal background filling the frame edge-to-edge; no bacterial/plant features, no text. Chosen for the labelled SVG.
  ![textbook 2](theme/textbook/induced-pluripotent-stem-cell.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 15.8s — PARTIAL (gemini-2.5-flash-image) — fills the frame correctly but structures are washed-out/under-differentiated (mitochondria barely readable, one odd flat pale shape lower-right not matching any labelled organelle); superseded by attempt 2.
  ![textbook 3](theme/textbook/induced-pluripotent-stem-cell.attempts/gen-03__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/induced-pluripotent-stem-cell.textbook.svg)
[interactive SVG](theme/textbook/induced-pluripotent-stem-cell.textbook.svg) · [HTML](theme/textbook/induced-pluripotent-stem-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1527 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 29.6s — PASS (gemini-2.5-flash-image) — one dominant plump, rounded cell in the foreground with two neighbours just touching it (accurate cobblestone-colony morphology, consistent with the embryonic-stem-cell precedent in this set), false-colour rose/lilac surface only, fine membrane ruffles and microvilli-like surface texture, no internal structures (correct for SEM), no text, fills the frame.
  ![sem 1](theme/sem/induced-pluripotent-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1708 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 10.8s — PASS (gemini-2.5-flash-image) — translucent warm cell body with natural biological tints, dominant nucleus with 2 nucleoli, immature rounded mitochondria, ER, Golgi, scattered ribosomes, soft rim light and subsurface scattering, clean dark studio background filling the frame; no bacterial/plant features, no text.
  ![3d 1](theme/3d/induced-pluripotent-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/induced-pluripotent-stem-cell.3d.svg)
[interactive SVG](theme/3d/induced-pluripotent-stem-cell.3d.svg) · [HTML](theme/3d/induced-pluripotent-stem-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1661 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 37.4s — PASS (gemini-2.5-flash-image) — aged paper fills the entire frame edge-to-edge with a soft wash halo behind the single centred cell, fine ink linework, nucleus with 2 nucleoli, immature mitochondria, DNA strands with Yamanaka-factor dots, dispersed ribosome specks; anatomically correct, no text, no matting/frame.
  ![watercolor 1](theme/watercolor/induced-pluripotent-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/induced-pluripotent-stem-cell.watercolor.svg)
[interactive SVG](theme/watercolor/induced-pluripotent-stem-cell.watercolor.svg) · [HTML](theme/watercolor/induced-pluripotent-stem-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · Public Domain Mark 1.0 · National Institutes of Health / National Eye Institute (NIH Image Gallery) — PASS — NIH/National Eye Institute confocal immunofluorescence of a human iPSC colony (OCT4 red, SSEA-4 green, nuclei blue); Public Domain. Cleaned with edit_image.py (real-02): recomposed/centred on a clean background, no borders or scale bars, false-colour kept as-is. Directly shows the defining biology (Yamanaka factor + pluripotency marker + nucleus-dense compact colony).
  ![reference](theme/light/induced-pluripotent-stem-cell.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | correct high N:C-ratio anatomy, muted educational palette, clean leader-line targets |
| sem | pass | 1 | cobblestone colony surface morphology, false-colour, no internal structures |
| 3d | pass | 1 | natural-tint translucent cutaway, correct organelles, clean labels |
| watercolor | pass | 1 | full-bleed aged paper, correct anatomy, clean leader lines |
