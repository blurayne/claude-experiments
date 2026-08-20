# Preadipocyte — render log

**Set:** `fat-cells` · **Microbe key:** `preadipocyte`
**Short description:** Direct precursor of the fat cell. Waits as a spindle-shaped cell in adipose tissue and matures into an adipocyte on demand. Responds to hormonal cues (insulin, glucocorticoids, PPARγ); provides new fat cells during weight gain.

Metadata sidecar: [`preadipocyte.render.meta.json`](preadipocyte.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The preadipocyte is the committed, not-yet-lipid-laden precursor of the mature fat cell (adipocyte). Unlike the round, droplet-dominated adipocyte it will become, the preadipocyte still looks like an ordinary fibroblast: a flattened, elongated, spindle-to-stellate cell body, typically bipolar with two (sometimes several) slender tapering cytoplasmic processes that anchor it into the connective-tissue stroma of adipose depots, most densely in the perivascular/stromal-vascular niche adjacent to small capillaries. It carries a single oval, euchromatic nucleus with a visible nucleolus, moderate rough endoplasmic reticulum and a well-formed Golgi apparatus (reflecting active secretion of pericellular matrix proteins — fibronectin, collagen I, tenascin-C — that it deposits around itself), and a modest, unremarkable population of elongated mitochondria dispersed through the cytoplasm. Its shape and adhesion/migration are maintained by an actin stress-fibre and vimentin intermediate-filament cytoskeleton, exactly as in a generic fibroblast. Committed adipose progenitors/preadipocytes are identified in tissue by a defined surface-marker signature — PDGFRα, together with Sca-1, CD34 and (in the most committed subset) CD38, while lacking haematopoietic (CD45) and endothelial (CD31) markers — and, distinctively, by **Pref-1/DLK1**, an EGF-repeat transmembrane glycoprotein that studs the plasma membrane and acts as a molecular "gatekeeper": it actively holds the cell in the undifferentiated preadipocyte state and blocks premature adipogenesis (it is cleaved to a soluble paracrine form and is switched off once differentiation begins). The single most important distinguishing feature of the preadipocyte is a **negative** one: it has **not yet accumulated a lipid droplet** — no small multilocular droplets (that stage is the *lipoblast*) and certainly no single dominant droplet (that is the mature *adipocyte*). Only once hormonal cues arrive — insulin/IGF-1 signalling, glucocorticoids, and activation of the master adipogenic transcription factor **PPARγ** together with C/EBPα — does the cell exit this holding pattern, round up, switch on lipogenic genes, and begin filling with fat.

Sources: [Wikipedia — Preadipocyte](https://en.wikipedia.org/wiki/Preadipocyte), [ScienceDirect Topics — Preadipocyte](https://www.sciencedirect.com/topics/biochemistry-genetics-and-molecular-biology/preadipocyte), [Hudak & Sul 2013, Pref-1, a Gatekeeper of Adipogenesis (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3699714/), [Berry & Rodeheffer et al. — PDGFRα/Sca-1/CD34 adipocyte-precursor marker signature, summarized in Development 2017](https://journals.biologists.com/dev/article/144/1/83/47925/PDGFR-controls-the-balance-of-stromal-and), [Spencer et al. 2010, Macrophage-secreted factors promote a profibrotic phenotype in human preadipocytes, Mol Endocrinol (PubMed)](https://pubmed.ncbi.nlm.nih.gov/18945811/), [Cinti 2012, The adipose organ at a glance, Disease Models & Mechanisms (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3424455/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; oval and euchromatic, reflecting the cell's proliferative/pre-differentiation state | central within the widest part of the cell body | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries the PDGFRα/Sca-1/CD34 marker signature | outermost | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | matrix housing the organelles; fills the body and its tapering processes | interior, including the extensions | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | synthesizes secreted matrix proteins (fibronectin, collagen I, tenascin-C) | around the nucleus | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/modifies secreted matrix proteins for export | near the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production; modest number, unremarkable elongated shape (not yet the dense clusters of brown fat or the sparse rim of white fat) | scattered through the cytoplasm | core |
| `cytoskeleton` | cytoskeleton (filamenta actini et vimentini) | Cytoskeleton (actin stress fibres & vimentin) | Zytoskelett (Aktin-Stressfasern & Vimentin) | shape, adhesion and migration along the spindle axis | spans the cell body | core |
| `cell_process` | processus cytoplasmaticus | Cytoplasmic process (filopodium) | Zellfortsatz (Filopodium) | thin tapering extensions anchoring the cell into the stroma, typically at both poles | poles of the spindle | core |
| `pref1_marker` | Pref-1 / Dlk1 (glycoproteinum transmembranaceum) | Pref-1/DLK1 marker protein | Pref-1/DLK1-Markerprotein | transmembrane "gatekeeper" that actively blocks premature adipocyte differentiation — the classic molecular marker of the preadipocyte state | studded across the plasma membrane | minor |
| `pericellular_matrix` | matrix pericellularis (fibronectinum) | Pericellular matrix (fibronectin network) | Perizelluläre Matrix (Fibronektin-Netzwerk) | secreted ECM meshwork that supports adhesion and modulates the differentiation decision | just outside the plasma membrane | minor |

### Do NOT draw (scientifically misleading)
- **No lipid droplets at all** — neither a single giant droplet (mature *white/brown adipocyte*) nor scattered small multilocular droplets (*lipoblast*). The defining feature of a preadipocyte is that it has **not yet** started storing fat; if it looks fat-laden, it is the wrong cell type.
- **No round or polygonal cell body** — it must read as an elongated, tapering, fibroblast-like spindle (bipolar, occasionally stellate with more processes), not a sphere.
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is an animal cell, not a prokaryote.
- **No chloroplasts, no large central vacuole** — plant-cell features, not present here.
- **No cilia or flagella for locomotion** — preadipocytes move by actin-driven crawling along the matrix, like a fibroblast, not by beating appendages.
- **No abundant/large clustered mitochondria** — that dense mitochondrial packing is a *brown-fat* feature; the preadipocyte's mitochondria are unremarkable in number and size, like an ordinary connective-tissue cell.
- A single specimen, or a modest, clearly readable small group — not a dense confluent monolayer where individual spindle shapes can no longer be told apart.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "3T3-l1 cells clone.jpg"**, a genuine phase-contrast light micrograph of a live, adherent culture of the 3T3-L1 preadipocyte cell line, showing multiple well-spread, stellate/bipolar fibroblast-like cells with clearly visible thin tapering cytoplasmic processes, granular cytoplasm and faint nuclear outlines on a culture-dish substrate — the textbook "before" morphology used throughout adipogenesis research (cells round up and fill with lipid only after differentiation is induced).
- file: https://upload.wikimedia.org/wikipedia/commons/e/e8/3T3-l1_cells_clone.jpg
- page: https://commons.wikimedia.org/wiki/File:3T3-l1_cells_clone.jpg · License: **CC BY-SA 4.0** · Attribution: KristyPet (Wikimedia Commons, own work)
- **Species note:** 3T3-L1 is a mouse cell line — it is the standard, most extensively used model of preadipocyte biology in the literature, and no freely-licensed micrograph specific to human preadipocytes in situ could be located. Preadipocyte morphology and the fibroblast-like spindle phenotype are conserved between mouse and human, so this is used as the closest faithful substitute; flagged here for transparency.

AI visual verification result: **PASS (2026-08-15).** Real phase-contrast light micrograph (not an illustration/diagram) of a live cell culture. Multiple individual cells are clearly readable and well-spread (not a dense confluent clump): each shows the diagnostic elongated/stellate fibroblast-like body with thin tapering cytoplasmic processes reaching in two-plus directions, faint granular cytoplasm, and no visible lipid droplets — consistent with undifferentiated preadipocytes. No baked-in scale bar or caption text in the frame. A cleaned, colour-enhanced version is produced with `edit_image.py` for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Preadipocyte, the patient understudy of the fat-cell world! It looks nothing like a plump, round fat cell just yet — it's long, thin and stretchy, with skinny little arms reaching out in two directions, tucked away quietly among the fibers of your body's fat tissue. Think of it as an actor waiting backstage in a fibroblast costume, totally ready to go on but not performing yet. It spends its days holding its spot, listening for a cue from hormones like insulin. The moment your body says "we need more storage space," the Preadipocyte springs into action, rounds itself up, and transforms step by step into a brand-new, fully-grown fat cell ready to store energy.  
🇩🇪 Das ist der Präadipozyt, der geduldige Ersatzspieler der Fettzellen-Welt! Er sieht noch gar nicht aus wie eine pralle, runde Fettzelle - er ist lang, dünn und dehnbar, mit schmalen Ärmchen, die in zwei Richtungen ausgestreckt sind, und versteckt sich still zwischen den Fasern des Fettgewebes in deinem Körper. Stell ihn dir vor wie einen Schauspieler, der backstage in einem Fibroblasten-Kostüm wartet, startbereit, aber noch nicht auf der Bühne. Er verbringt seine Tage damit, seinen Platz zu halten und auf ein Signal von Hormonen wie Insulin zu lauschen. Sobald dein Körper sagt „wir brauchen mehr Stauraum“, legt der Präadipozyt los, rundet sich ab und verwandelt sich Schritt für Schritt in eine brandneue, ausgewachsene Fettzelle, bereit, Energie zu speichern.

**Adults (popular science, health).**  
🇬🇧 The preadipocyte is the body's on-call reserve for fat storage: a spindle-shaped, fibroblast-like cell that lives quietly within adipose tissue, indistinguishable at first glance from an ordinary connective-tissue cell, until it's needed. It doesn't yet hold any stored fat — that's precisely what marks it out from a mature adipocyte. Instead, it waits in a poised, undifferentiated state, held there by its own internal brake (a protein called Pref-1), while producing a supportive scaffold of matrix proteins around itself. When hormonal signals line up — insulin, cortisol-family hormones, and activation of the master fat-cell switch PPARγ — the brake releases, and the preadipocyte commits to becoming a full adipocyte, rounding up and beginning to accumulate lipid. This reserve of preadipocytes is a big part of how the body expands its fat stores during weight gain, by making genuinely new fat cells rather than only enlarging existing ones.  
🇩🇪 Der Präadipozyt ist die Einsatzreserve des Körpers für die Fettspeicherung: eine spindelförmige, fibroblastenähnliche Zelle, die still im Fettgewebe lebt und auf den ersten Blick von einer gewöhnlichen Bindegewebszelle kaum zu unterscheiden ist, bis sie gebraucht wird. Sie enthält noch kein gespeichertes Fett - genau das unterscheidet sie von einer reifen Fettzelle. Stattdessen wartet sie in einem bereitstehenden, undifferenzierten Zustand, gehalten durch eine eigene innere Bremse (ein Protein namens Pref-1), während sie um sich herum ein stützendes Gerüst aus Matrixproteinen produziert. Wenn hormonelle Signale zusammenkommen - Insulin, Hormone der Cortisonfamilie und die Aktivierung des zentralen Fettzell-Schalters PPARγ -, löst sich die Bremse, und der Präadipozyt entwickelt sich zu einer vollwertigen Fettzelle, rundet sich ab und beginnt, Lipide einzulagern. Diese Reserve an Präadipozyten trägt wesentlich dazu bei, dass der Körper seine Fettdepots bei Gewichtszunahme erweitert, indem er tatsächlich neue Fettzellen bildet und nicht nur bestehende vergrößert.

**Scientific.**  
🇬🇧 The preadipocyte is the committed, mitotically-competent precursor of the adipocyte, morphologically a fibroblast-like spindle cell with tapering cytoplasmic processes, an oval euchromatic nucleus, moderate rough endoplasmic reticulum/Golgi and an actin/vimentin cytoskeleton, residing predominantly in the perivascular stromal-vascular fraction of adipose depots. It is identified by a defined surface signature (PDGFRα+, Sca-1+, CD34+, CD45−, CD31−, with CD38 marking the most committed subset) and, distinctively, by Pref-1/DLK1, an EGF-repeat transmembrane protein that maintains the undifferentiated state and is proteolytically shed as a soluble adipogenesis inhibitor. Adipogenic commitment and terminal differentiation are driven by a transcriptional cascade — C/EBPβ/δ induction followed by PPARγ and C/EBPα activation — triggered physiologically by insulin/IGF-1 and glucocorticoid signalling, which switches on lipogenic and lipid-droplet-associated gene programs (e.g. perilipin 1) and drives the morphological transition from spindle-shaped preadipocyte to lipid-laden adipocyte. Expansion of the preadipocyte pool via proliferation and recruitment (hyperplasia) is a major mechanism, alongside adipocyte hypertrophy, by which adipose tissue mass increases during positive energy balance.  
🇩🇪 Der Präadipozyt ist der determinierte, mitotisch kompetente Vorläufer des Adipozyten - morphologisch eine fibroblastenähnliche Spindelzelle mit spitz zulaufenden Zytoplasmafortsätzen, einem ovalen euchromatischen Zellkern, mäßig ausgeprägtem rauem endoplasmatischem Retikulum/Golgi-Apparat und einem Aktin-/Vimentin-Zytoskelett, die überwiegend in der perivaskulären stromal-vaskulären Fraktion der Fettdepots liegt. Sie wird anhand eines definierten Oberflächenmusters identifiziert (PDGFRα+, Sca-1+, CD34+, CD45−, CD31−, wobei CD38 die am stärksten determinierte Subpopulation kennzeichnet) und charakteristisch durch Pref-1/DLK1, ein EGF-Repeat-Transmembranprotein, das den undifferenzierten Zustand aufrechterhält und proteolytisch als löslicher Adipogenese-Inhibitor abgespalten wird. Die adipogene Determinierung und terminale Differenzierung werden durch eine Transkriptionskaskade gesteuert - Induktion von C/EBPβ/δ, gefolgt von Aktivierung von PPARγ und C/EBPα -, physiologisch ausgelöst durch Insulin-/IGF-1- und Glukokortikoid-Signalgebung, die lipogene und lipidtropfen-assoziierte Genprogramme (z. B. Perilipin 1) anschaltet und den morphologischen Übergang von der spindelförmigen Präadipozyte zum lipidbeladenen Adipozyten antreibt. Die Expansion des Präadipozyten-Pools durch Proliferation und Rekrutierung (Hyperplasie) ist neben der Hypertrophie bestehender Adipozyten ein zentraler Mechanismus, über den die Fettgewebsmasse bei positiver Energiebilanz zunimmt.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human preadipocyte, a spindle-shaped fibroblast-like animal cell (the not-yet-differentiated precursor of a fat cell), centered in a square 1:1 1080x1080 frame with generous negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is elongated and bipolar, tapering into two (or a few) slender cytoplasmic processes, about 3 to 4 times longer than wide — it must look like an ordinary spindle-shaped fibroblast, NOT round or plump. A neat quarter cut-away reveals the interior: a central oval nucleus with a visible nucleolus, pale cytoplasm filling the body and its tapering processes, a modest patch of folded rough endoplasmic reticulum near the nucleus, a small Golgi apparatus, a few small elongated mitochondria scattered through the cytoplasm (modest in number, not clustered), and fine actin/vimentin cytoskeletal fibres running lengthwise. On the plasma membrane, show small studded receptor-like dots representing the Pref-1/DLK1 marker protein, and a thin translucent fibrous halo just outside the membrane representing the secreted pericellular fibronectin matrix. Anatomically faithful animal cell. Do NOT draw ANY lipid droplets (neither one giant droplet nor several small ones — this cell has not yet started storing fat), do NOT draw a round or polygonal cell body, do NOT draw abundant clustered large mitochondria, do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia; this is NOT a bacterium and NOT a mature fat cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human preadipocyte spreading on a substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a flattened, elongated, spindle-to-stellate fibroblast-like body tapering into several long slender cytoplasmic processes and fine filopodia that anchor to a subtly textured neutral substrate — NOT round or plump, and its surface must look smooth/taut with no bulging droplet shape underneath, since it stores no fat yet. Render true 3D surface texture: a gently domed nuclear bulge, delicate membrane ruffles and ridges along the body, and thread-like filopodia reaching outward at both poles. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm sandy-beige to soft bronze cell against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles and NO visible lipid droplets. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human preadipocyte, a spindle-shaped fibroblast-like animal cell (the precursor of a fat cell, not yet storing lipid), centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is elongated and bipolar with slender tapering cytoplasmic processes at both ends and a few filopodia — a flattened spindle shape, NOT round or plump. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: a central oval translucent nucleus with a visible nucleolus, warm pale cytoplasm filling the body and its processes, a modest patch of folded rough endoplasmic reticulum near the nucleus, a small Golgi stack, a few small elongated mitochondria scattered through the cytoplasm (modest in number, not clustered or dense), and fine actin/vimentin cytoskeletal fibres running lengthwise along the spindle. On the plasma membrane, show small studded receptor-like proteins representing the Pref-1/DLK1 marker, and a delicate translucent fibrous sheath just outside the membrane representing the secreted pericellular fibronectin matrix. Natural colours, not near-monochrome and not neon. Do NOT render ANY lipid droplets (this cell has not yet started storing fat), a round or polygonal cell body, abundant clustered large mitochondria, a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia; this is an animal cell, not a bacterium, and not yet a mature fat cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human preadipocyte in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is a spindle-shaped, fibroblast-like body tapering into slender cytoplasmic processes at both ends, about 3 to 4 times longer than wide — an elongated shape, NOT round or plump. A delicate painterly cut-away reveals the interior: a central oval nucleus with a visible nucleolus, washed pale cytoplasm filling the body and its processes, a modest patch of folded rough endoplasmic reticulum near the nucleus, a small Golgi apparatus, a few small elongated mitochondria in the cytoplasm (modest in number), and fine actin/vimentin cytoskeletal fibres running lengthwise. Along the membrane, add small fine dots suggesting the Pref-1/DLK1 marker protein, and a soft translucent ink-washed halo just outside the cell suggesting the secreted pericellular fibronectin matrix. Single specimen, anatomically faithful animal cell. Do NOT paint ANY lipid droplets (this cell has not yet started storing fat), a round or polygonal cell body, abundant clustered mitochondria, a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3491 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 17.1s — fail (gemini-2.5-flash-image; image does not fill the frame - a white letterbox border surrounds the charcoal square and the cell renders tiny/under-detailed inside it, violates no-border rule, superseded)
  ![textbook 1](theme/textbook/preadipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 13.5s — pass (gemini-2.5-flash-image; fills frame edge-to-edge, elongated bipolar spindle with tapering processes, correct nucleus/nucleolus/rough ER/Golgi/mitochondria, membrane Pref-1 dots, fibrous pericellular halo, no lipid droplets)
  ![textbook 2](theme/textbook/preadipocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/preadipocyte.textbook.svg)
[interactive SVG](theme/textbook/preadipocyte.textbook.svg) · [HTML](theme/textbook/preadipocyte.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1549 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.8s — pass (gemini-2.5-flash-image; stellate fibroblast-like body with domed nuclear bulge and long tapering filopodia at multiple poles, false-colour sandy surface only, no lipid bulge, clean dark background)
  ![sem 1](theme/sem/preadipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1667 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 11.4s — pass (gemini-2.5-flash-image; translucent bipolar spindle with subsurface scattering, correct organelle set including Pref-1 membrane dots and fibronectin halo, natural warm tints, no lipid droplets)
  ![3d 1](theme/3d/preadipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/preadipocyte.3d.svg)
[interactive SVG](theme/3d/preadipocyte.3d.svg) · [HTML](theme/3d/preadipocyte.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3357 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 11.4s — fail (gemini-2.5-flash-image; baked-in handwritten text labels 'Pref-1/DLK1' and 'mitochondrion' on the paper - violates no-baked-text rule, superseded)
  ![watercolor 1](theme/watercolor/preadipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 31.5s — pass (gemini-2.5-flash-image; full-bleed aged paper, correct spindle anatomy with all organelles, no text, matches cocci/rod-bacterium watercolor exemplar)
  ![watercolor 2](theme/watercolor/preadipocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/preadipocyte.watercolor.svg)
[interactive SVG](theme/watercolor/preadipocyte.watercolor.svg) · [HTML](theme/watercolor/preadipocyte.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `phase-contrast-LM` · CC BY-SA 4.0 · KristyPet (Wikimedia Commons, own work) — pass (Wikimedia Commons 3T3-L1 preadipocyte culture, phase-contrast LM, CC BY-SA 4.0; well-spread individual stellate/bipolar cells with clearly readable tapering processes, no lipid droplets; mouse cell line used as the closest freely-licensed substitute for human preadipocyte morphology, flagged in the log; cleaned/contrast-enhanced version used for display)
  ![reference](../reference-microscopy/theme/phase-contrast/preadipocyte.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | use as final; correct elongated spindle morphology and organelle set, clean leader lines |
| sem | pass | 1 | use as final; correct stellate fibroblast-like surface morphology, false-colour, no baked text |
| 3d | pass | 1 | use as final; correct translucent spindle anatomy, natural tints, clean labels |
| watercolor | pass | 2 | use as final after one re-render to remove baked-in handwritten labels from attempt 1 |
