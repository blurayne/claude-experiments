# Adipogenic progenitor — render log

**Set:** `fat-cells` · **Microbe key:** `adipogenic-progenitor`
**Short description:** Mesenchymal-stem-cell-derived precursor that sits as a mural (pericyte-like) cell wrapped around small blood vessels in adipose tissue; still uncommitted, but usually differentiates into a fat cell. Compact, stellate body with several thin radiating processes, a large euchromatic nucleus, moderate rough ER/Golgi/mitochondria, and (once adipogenic signalling starts) a handful of small early lipid droplets.

Metadata sidecar: [`adipogenic-progenitor.render.meta.json`](adipogenic-progenitor.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The adipogenic progenitor (also called an adipose progenitor cell, APC, or preadipocyte) is an uncommitted, mesenchymal-stem-cell-derived precursor that resides in the perivascular ("vascular") niche of adipose tissue: it sits as a mural cell wrapped around the outside of small blood vessels and capillaries, alongside pericytes and vascular smooth-muscle cells, and is actively retained there by PDGFRβ-mediated adhesion to the vessel wall (PPARγ transcriptionally activates PDGFRβ and VEGF in the progenitor, which in turn drives niche occupancy). Bona fide adipose progenitors are identified by the surface marker PDGFRα (broadly expressed; CD34+/Sca-1+/CD29+, CD45−/CD31−/Lin− by flow cytometry), and PDGFRα+ cells contribute roughly 20-fold more to the adipocyte pool than PDGFRα− cells upon transplantation. A maturing subset also expresses mural markers (αSMA, PDGFRβ, NG2) and the preadipocyte-specific surface protein Pref-1/DLK1, an EGF-repeat transmembrane protein whose soluble, cleaved form actively blocks further commitment (it keeps the transcription factor Sox9 active, which represses C/EBPβ and C/EBPδ) — Pref-1/DLK1 is therefore the classic marker separating an uncommitted progenitor like this one from a mature adipocyte, which no longer expresses it. Morphologically, before commitment the progenitor keeps much of the same fibroblast-like character as its mesenchymal-stem-cell parent, but classic descriptions and electron-microscopy studies of preadipose cells in situ describe it as a stellate, multipolar cell with several (not just two) thin, tapering cytoplasmic processes radiating from a compact body and gripping the adjacent vessel wall — rich in rough endoplasmic reticulum, with a large euchromatic oval nucleus, a single prominent nucleolus, moderate mitochondria, a Golgi apparatus, and an actin-filament cytoskeleton that both shapes the processes and lets the cell adhere/migrate. When adipogenic signals fire (insulin/IGF-1, glucocorticoids, cAMP), Pref-1 clearance permits induction of C/EBPβ and C/EBPδ, which in turn activate PPARγ and C/EBPα — the master transcriptional switches of fat-cell identity. As this cascade engages, the earliest visible morphological sign is the appearance of several small, separate ("multilocular") lipid droplets scattered through the cytoplasm, and mitochondria begin shifting from elongated toward more rounded shapes. This is still well short of the mature, unilocular (single giant droplet) fat cell — the coalescence of droplets into one, and the accompanying squeezing of the nucleus into a thin peripheral rim, is a later step this progenitor has not yet reached.

Sources: [Wikipedia — Preadipocyte](https://en.wikipedia.org/wiki/Preadipocyte), [Wikipedia — Adipogenesis](https://en.wikipedia.org/wiki/Adipogenesis), [Marcelin et al. 2017, A PPARγ transcriptional cascade directs adipose progenitor cell-niche interaction and niche expansion, Nature Communications (PMC5490270)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5490270/), [Hudak & Sul 2013, Pref-1, a gatekeeper of adipogenesis, Frontiers in Endocrinology (PMC3699714)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3699714/), [Shin et al. 2020, Dynamic control of adipose tissue development and adult tissue homeostasis by PDGFRα, eLife (PMC7338051)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7338051/), [Napolitano 1963, The Differentiation of White Adipose Cells: An Electron Microscope Study, J Cell Biol (PubMed 14064115)](https://pubmed.ncbi.nlm.nih.gov/14064115/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; large & euchromatic, still centrally placed (not yet squeezed to the rim) | central | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly; single, prominent | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries the PDGFRα/PDGFRβ and Pref-1/DLK1 receptors that anchor the cell to the vessel wall | outermost | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel matrix housing the organelles | interior | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | synthesises secreted signalling & matrix proteins | around the nucleus | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/modifies proteins for export | near the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production; still elongated at this stage, will round up as adipogenesis proceeds | dispersed in cytoplasm, several | core |
| `cytoskeleton` | cytoskeleton (filamenta actini) | Cytoskeleton (actin filaments) | Zytoskelett (Aktinfilamente) | shapes the stellate, multi-armed body and anchors it to the vessel wall | spans the cell body and processes | core |
| `cell_process` | processus cytoplasmaticus | Cytoplasmic process | Zellfortsatz | thin, tapering, branching arms (three or more) that grip the outside of the adjacent capillary, pericyte-like | radiating from the cell body | core |
| `lipid_droplet` | gutta lipidica nascens | Nascent lipid droplet | Kleiner Lipidtropfen | a handful of small, separate early fat droplets — the first visible sign of adipogenic commitment, not yet one big droplet | scattered singly in the cytoplasm, few and small | variable (present once commitment begins) |

### Do NOT draw (scientifically misleading)
- **No single large unilocular lipid droplet filling most of the cell** — that is a MATURE fat cell, not this progenitor; if lipid droplets are shown at all they must be a FEW SMALL, separate droplets, never one dominant sphere.
- **No cell wall, nucleoid, plasmids or bacterial flagella** — not a prokaryote.
- **No chloroplasts or large central vacuole** — not a plant cell.
- **Not round/biconcave like a red blood cell**, and **not a simple two-pole spindle like a resting mesenchymal stem cell** — the defining shape here is a compact, STELLATE body with three or more thin radiating processes (mural/pericyte-like), distinguishing it from the plain bipolar fibroblast shape of an undifferentiated MSC.
- **No motile cilia or flagella for locomotion.**
- A single specimen, not a dense confluent monolayer — individual morphology must stay readable.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Used: **Wikimedia Commons — "3T3-l1 cells clone.jpg"**, a phase-contrast light micrograph of the 3T3-L1 cell line — the classic, widely-used experimental model for mouse preadipocytes/adipogenic progenitors, shown here in their pre-induction (undifferentiated) state. The original file description (Czech): "Klon adherentní buněčné linie 3T3-L1. Buňky jsou charakteristické svým protáhlým tvarem s dvěma úpony" ("Clone of the adherent 3T3-L1 cell line. The cells are characterised by their elongated shape with two extensions") — directly matching the fibroblast-like, process-bearing preadipocyte morphology described in §1.
- file: https://upload.wikimedia.org/wikipedia/commons/e/e8/3T3-l1_cells_clone.jpg
- page: https://commons.wikimedia.org/wiki/File:3T3-l1_cells_clone.jpg · License: **CC BY-SA 4.0** · Attribution: KristyPet, Wikimedia Commons
AI visual verification result: **PASS (2026-08-15).** Field of well-separated (not clumped) 3T3-L1 preadipocytes, each individually readable with a compact cell body and several thin tapering processes; small phase-bright inclusions consistent with early granules/vesicles; no lipid-filled unilocular cells (confirms pre-induction/uncommitted state). No baked-in text, scale bar or border. A cropped/cleaned, false-colour version emphasising one to two individual specimens was produced with `edit_image.py` for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Adipogenic Progenitor — the great 'still deciding' cell of your body fat! You'll find it clinging to the outside of the tiny blood vessels running through your fatty tissue, holding on with several thin little arms like a shy octopus hugging a pipe. It hasn't picked a career yet — with the right nudge it could grow into a few different kinds of cells — but most of the time, once you've eaten and your hormones give the signal, it makes up its mind: 'Today, I become a fat cell!' Then it starts tucking away tiny droplets of energy one by one, like a squirrel hiding acorns, getting ready to grow into a full-sized fat-storage cell. Think of it as the trainee quietly leaning toward becoming your body's favourite energy-savings account.  
🇩🇪 Das ist die Adipogene Vorläuferzelle — die große 'Ich überlege noch'-Zelle deines Körperfetts! Man findet sie außen an den winzigen Blutgefäßen im Fettgewebe, wo sie sich mit mehreren dünnen Ärmchen festhält, wie ein schüchterner Oktopus, der ein Rohr umarmt. Ihren Beruf hat sie noch nicht gewählt — mit dem richtigen Anstoß könnte sie zu ein paar verschiedenen Zelltypen heranwachsen — aber meistens entscheidet sie sich, sobald du gegessen hast und die Hormone das Signal geben: 'Heute werde ich eine Fettzelle!' Dann beginnt sie, kleine Energietröpfchen einzulagern, eins nach dem anderen, wie ein Eichhörnchen, das Nüsse versteckt, und bereitet sich darauf vor, zu einer vollwertigen Fettspeicherzelle heranzuwachsen. Man kann sie sich wie die Auszubildende vorstellen, die sich still und heimlich zum Lieblings-Sparkonto deines Körpers für Energie entwickelt.

**Adults (popular science, health).**  
🇬🇧 The adipogenic progenitor is an early, still-uncommitted descendant of mesenchymal stem cells that lives wrapped around the tiny blood vessels of adipose tissue — its perivascular 'home base'. Rather than floating freely, it clings to the vessel wall in a pericyte-like position, waiting for hormonal cues (insulin and related signals, often strongest after meals) before deciding its fate. Once it commits, a cascade of transcription factors switches on fat-cell genes, and the cell begins depositing small droplets of stored energy that will eventually grow and merge into the single large fat droplet of a mature adipocyte. Because this decision point can be nudged in different directions in the lab, adipogenic progenitors are of major interest for research into metabolic health, obesity and tissue engineering.  
🇩🇪 Die adipogene Vorläuferzelle ist eine frühe, noch nicht festgelegte Abkömmlingin mesenchymaler Stammzellen, die um die winzigen Blutgefäße des Fettgewebes gewickelt lebt — ihre perivaskuläre 'Heimatbasis'. Statt frei umherzuschwimmen, hält sie sich pericytenartig an der Gefäßwand fest und wartet auf hormonelle Signale (Insulin und verwandte Botenstoffe, oft am stärksten nach dem Essen), bevor sie sich für ihren weiteren Weg entscheidet. Sobald sie sich festlegt, schaltet eine Kaskade von Transkriptionsfaktoren die Fettzell-Gene an, und die Zelle beginnt, kleine Tröpfchen gespeicherter Energie einzulagern, die später zu dem einen großen Fetttropfen einer reifen Fettzelle verschmelzen. Weil dieser Entscheidungspunkt im Labor in verschiedene Richtungen gelenkt werden kann, sind adipogene Vorläuferzellen ein wichtiges Forschungsthema für Stoffwechselgesundheit, Übergewicht und Gewebezüchtung.

**Scientific.**  
🇬🇧 The adipogenic progenitor (adipose progenitor cell, APC) is a PDGFRα+ (often also PDGFRβ+/αSMA+/NG2+) mural-lineage cell that occupies the perivascular niche of adipose tissue, retained there via PPARγ-driven PDGFRβ/VEGF signalling. Prior to commitment it expresses the EGF-repeat transmembrane protein Pref-1/DLK1, whose soluble cleaved form sustains Sox9 activity and represses C/EBPβ and C/EBPδ, gatekeeping adipogenesis. Morphologically it is a stellate, multipolar, fibroblast-derived cell with a large euchromatic nucleus, a prominent nucleolus, moderate rough endoplasmic reticulum and Golgi apparatus, and an actin-based cytoskeleton supporting several radiating cytoplasmic processes that anchor it to the vessel wall. Upon adipogenic induction (insulin/IGF-1, glucocorticoids, cAMP), clearance of Pref-1 permits C/EBPβ/δ induction, which activates PPARγ and C/EBPα — the master regulators driving terminal differentiation — accompanied by the earliest morphological sign of commitment: several small, multilocular lipid droplets accumulating in the cytoplasm and a shift of mitochondrial morphology from elongated toward more rounded, well before the single, nucleus-displacing unilocular lipid droplet of the mature adipocyte forms.  
🇩🇪 Die adipogene Vorläuferzelle (adipose progenitor cell, APC) ist eine PDGFRα-positive (oft auch PDGFRβ+/αSMA+/NG2+) Zelle der Mural-Linie, die die perivaskuläre Nische des Fettgewebes besetzt und dort durch PPARγ-gesteuerte PDGFRβ/VEGF-Signalgebung gehalten wird. Vor der Festlegung exprimiert sie das EGF-Repeat-Transmembranprotein Pref-1/DLK1, dessen lösliche, abgespaltene Form die Sox9-Aktivität aufrechterhält und C/EBPβ sowie C/EBPδ unterdrückt und so die Adipogenese kontrolliert blockiert. Morphologisch ist sie eine sternförmige, multipolare, von Fibroblasten abstammende Zelle mit großem euchromatischem Zellkern, deutlichem Nukleolus, mäßig ausgeprägtem rauem endoplasmatischem Retikulum und Golgi-Apparat sowie einem Aktin-Zytoskelett, das mehrere strahlenförmig abgehende Zellfortsätze stützt, mit denen sie sich an der Gefäßwand verankert. Nach adipogener Induktion (Insulin/IGF-1, Glukokortikoide, cAMP) ermöglicht der Abbau von Pref-1 die Induktion von C/EBPβ/δ, die wiederum PPARγ und C/EBPα aktivieren — die zentralen Regulatoren der terminalen Differenzierung — begleitet vom frühesten morphologischen Zeichen der Festlegung: mehreren kleinen, multilokulären Lipidtropfen im Zytoplasma und einer Verschiebung der Mitochondrienform von länglich zu eher rundlich, lange bevor sich der einzelne, den Zellkern verdrängende unilokuläre Lipidtropfen der reifen Fettzelle bildet.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human adipogenic progenitor cell (an early, still-uncommitted mesenchymal-derived preadipocyte), a compact mural cell with a STELLATE, multipolar body, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell body is compact and roughly polygonal, with THREE OR MORE thin, tapering, branching cytoplasmic processes radiating outward in different directions (pericyte-like), clearly NOT a simple two-pole spindle. A neat quarter cut-away reveals the interior: a large central oval nucleus with a single prominent nucleolus, pale cytoplasm, moderately folded rough endoplasmic reticulum studded with tiny ribosome dots, a small curved Golgi stack, several elongated oval mitochondria with faint inner cristae, fine actin filaments running through the body and processes, and a HANDFUL of SMALL, SEPARATE, round lipid droplets (no more than 5-6, clearly small and scattered, never merged into one big droplet) marking the start of fat storage. Anatomically faithful animal cell. Do NOT draw a single large lipid droplet filling most of the cell (that is a mature fat cell, not this progenitor); do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia; this is NOT a bacterium and NOT a round red blood cell, and NOT a simple bipolar spindle. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human adipogenic progenitor cell (a preadipocyte) spread on a substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell has a compact, roughly polygonal, STELLATE body with three or more long, thin, tapering, branching cytoplasmic processes fanning out in different directions and gripping the substrate surface, pericyte-like and clearly not a simple two-pole spindle. Render true 3D surface texture: a gently domed nuclear bulge, delicate membrane ruffles and ridges, and thread-like processes reaching outward with fine terminal filopodia. Shallow depth of field so far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm sandy-beige to soft bronze cell against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles and NO lipid droplets. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human adipogenic progenitor cell, a compact mural (pericyte-like) cell with a STELLATE, multipolar body, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell body is compact with three or more thin, tapering, branching cytoplasmic processes radiating outward, clearly not a simple two-pole spindle. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so structures are clearly distinguishable: a large translucent oval nucleus with one prominent nucleolus, warm cytoplasm, moderately folded rough endoplasmic reticulum around the nucleus, a small curved Golgi stack, several elongated mitochondria with inner cristae, fine actin cytoskeletal filaments, and a handful of small, separate, softly glowing round lipid droplets (no more than 5-6, small and scattered, never merged into one big droplet). Natural colours, not near-monochrome and not neon. Do NOT render a single large lipid droplet filling most of the cell (that is a mature fat cell, not this progenitor); do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia; this is an animal cell, not a bacterium, and not a simple bipolar spindle. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human adipogenic progenitor cell in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell body is compact and STELLATE, with three or more thin, tapering, branching cytoplasmic processes radiating outward in different directions, pericyte-like and clearly not a simple two-pole spindle. A delicate painterly cut-away reveals the interior: a large central oval nucleus with a single prominent nucleolus, washed cytoplasm, moderately folded rough endoplasmic reticulum wrapping the nucleus, a small curved Golgi stack, several elongated mitochondria, fine actin cytoskeletal filaments, and a handful of small, separate round lipid droplets (no more than 5-6, small and scattered, never merged into one big droplet). Single specimen, anatomically faithful animal cell. Do NOT paint a single large lipid droplet filling most of the cell, a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, cilia, or a simple bipolar spindle shape. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3432 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 14.2s — fail (gemini-2.5-flash-image; baked-in handwritten text labels ('MITEM'/'HISTONE'-like scrawls) on the mitochondria/Golgi-like structures - violates no-baked-text rule, superseded)
  ![textbook 1](theme/textbook/adipogenic-progenitor.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.8s — pass (gemini-2.5-flash-image; fills frame edge-to-edge on charcoal background, compact stellate body with 4+ thin branching processes, correct nucleus/nucleolus, moderate rough ER, small Golgi stack, elongated mitochondria with cristae, actin filaments through the body, only a handful of small separate lipid droplets, no baked text)
  ![textbook 2](theme/textbook/adipogenic-progenitor.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/adipogenic-progenitor.textbook.svg)
[interactive SVG](theme/textbook/adipogenic-progenitor.textbook.svg) · [HTML](theme/textbook/adipogenic-progenitor.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3120 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 11.7s — fail (gemini-2.5-flash-image; solid black border frames the whole square - violates no-border rule, superseded)
  ![sem 1](theme/sem/adipogenic-progenitor.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 7.4s — pass (gemini-2.5-flash-image; stellate body with domed nuclear bulge and long tapering branching filopodia at multiple poles, false-colour sandy/bronze surface only, no internal organelles or lipid bulge as expected for SEM, no border, clean dark background)
  ![sem 2](theme/sem/adipogenic-progenitor.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3301 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 23.0s — fail (gemini-2.5-flash-image; small lipid-droplet-like spheres and fine cytoskeletal-looking filaments rendered floating OUTSIDE the plasma membrane instead of inside the cytoplasm, misleading placement, superseded)
  ![3d 1](theme/3d/adipogenic-progenitor.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 7.2s — pass (gemini-2.5-flash-image; translucent compact stellate body, all lipid droplets and filaments correctly contained within the cytoplasm, correct nucleus/nucleolus, rough ER, Golgi stack, elongated mitochondria, natural warm tints, no border, no text)
  ![3d 2](theme/3d/adipogenic-progenitor.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/adipogenic-progenitor.3d.svg)
[interactive SVG](theme/3d/adipogenic-progenitor.3d.svg) · [HTML](theme/3d/adipogenic-progenitor.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1628 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.4s — pass (gemini-2.5-flash-image; full-bleed aged paper background, ink-outline stellate body with 4 thin tapering branching processes, nucleus with nucleolus, folded rough ER, mitochondria, a couple of small separate lipid droplets, no baked text, matches cocci/rod-bacterium watercolor exemplar)
  ![watercolor 1](theme/watercolor/adipogenic-progenitor.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/adipogenic-progenitor.watercolor.svg)
[interactive SVG](theme/watercolor/adipogenic-progenitor.watercolor.svg) · [HTML](theme/watercolor/adipogenic-progenitor.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `phase-contrast light micrograph` · CC BY-SA 4.0 · KristyPet, Wikimedia Commons — pass (Wikimedia Commons '3T3-l1 cells clone.jpg', 3T3-L1 preadipocyte cell line phase-contrast light micrograph, CC BY-SA 4.0, KristyPet; well-separated cells with compact bodies and several thin tapering processes, small phase-bright inclusions consistent with early vesicles/granules, no unilocular lipid-filled cells confirming the pre-induction/uncommitted state; mouse cell line used as the closest freely-licensed substitute for human adipogenic-progenitor morphology, flagged in the log; cleaned/cropped false-colour version used for display)
  ![reference](theme/light/adipogenic-progenitor.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | use as final after one re-render to remove baked-in handwritten text labels from attempt 1 |
| sem | pass | 2 | use as final after one re-render to remove the black border frame from attempt 1 |
| 3d | pass | 2 | use as final after one re-render to move lipid droplets/filaments from outside the membrane into the cytoplasm |
| watercolor | pass | 1 | use as final; correct stellate anatomy, full-bleed paper, no text |
