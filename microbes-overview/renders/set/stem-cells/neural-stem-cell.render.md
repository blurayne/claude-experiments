# Neural stem cell (NSC) — render log

**Set:** `stem-cells` · **Microbe key:** `neural-stem-cell`
**Short description:** Precursor of all neural cell types (neurons, astrocytes, oligodendrocytes); a radial-glia-like cell with a single apical primary cilium and a long basal process, high nucleus-to-cytoplasm ratio and a nestin/GFAP intermediate-filament cytoskeleton. In the adult brain only active in a few niches (e.g. the hippocampus and subventricular zone).

Metadata sidecar: [`neural-stem-cell.render.meta.json`](neural-stem-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

A neural stem cell (NSC) is the multipotent precursor of the central nervous system, giving rise to neurons, astrocytes and oligodendrocytes. In the embryo, NSCs are the neuroepithelial and radial glial cells that build the whole brain and spinal cord. In the adult mammalian brain, NSCs persist in only two well-characterised neurogenic niches: the subventricular zone (SVZ) lining the lateral ventricles, and the subgranular zone (SGZ) of the hippocampal dentate gyrus. Adult NSCs are morphologically and molecularly "astrocyte-like" radial glia (called type B cells in the SVZ, or radial glia-like cells in the SGZ): a relatively small, glia-like cell body with a compact, non-elaborated shape, most of them relatively quiescent rather than rapidly dividing. A defining structural feature is their bipolar/radial architecture: a short **apical process** ending in a single **non-motile primary cilium** that pokes through the ependymal cell layer to touch the cerebrospinal fluid in the ventricle (SVZ) or contacts the local vasculature, and a long, thin **basal process** that contacts the local blood-vessel (capillary) network — this vascular contact is thought to deliver niche signals (e.g. growth factors) to the stem cell. NSCs have a large, euchromatin-rich nucleus with a high nucleus-to-cytoplasm ratio (typical of a stem/progenitor cell that has not yet invested in differentiated machinery), a modest amount of rough endoplasmic reticulum and a small Golgi apparatus (far less elaborated than in a secretory cell), free ribosomes/polysomes supporting active protein synthesis for proliferation, a moderate number of mitochondria, and — most diagnostically — a dense network of **intermediate filaments** built from nestin (the classical NSC marker) together with vimentin and, in these astrocyte-like adult NSCs, GFAP (glial fibrillary acidic protein), which scaffolds the cell body and processes. NSCs respond to niche growth factors (EGF, FGF-2) and can be expanded in vitro either as free-floating clonal clusters ("neurospheres") or as adherent monolayers, where they typically show a smaller, simpler bipolar-to-multipolar shape with short fine processes rather than the fully elaborated in vivo radial-glia morphology.

Sources: [Wikipedia — Neural stem cell](https://en.wikipedia.org/wiki/Neural_stem_cell), [Wikipedia — Subventricular zone](https://en.wikipedia.org/wiki/Subventricular_zone), [Doetsch, Caillé, Lim, García-Verdugo & Alvarez-Buylla 1999, "Subventricular Zone Astrocytes Are Neural Stem Cells in the Adult Mammalian Brain" (Cell)](https://www.cell.com/fulltext/S0092-8674(00)80783-7), [Kriegstein & Alvarez-Buylla 2009, "The Glial Nature of Embryonic and Adult Neural Stem Cells" (Annu. Rev. Neurosci., PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2919181/), [Obernier & Alvarez-Buylla 2019, "Neural stem cells: origin, heterogeneity and regulation in the adult mammalian brain" (Development, PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6398449/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; large, euchromatic, high nucleus:cytoplasm ratio | central, occupying most of the cell body | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly, reflecting active protein synthesis | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries niche receptors (e.g. EGFR, FGFR) | outermost | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | thin rim of cytosol housing the organelles | surrounding nucleus | core |
| `intermediate_filaments` | filamenta intermedia (nestin, GFAP, vimentin) | Intermediate filaments (nestin/GFAP) | Intermediärfilamente (Nestin/GFAP) | cytoskeletal scaffold; nestin is the classic NSC marker | throughout cell body and processes | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | modest protein synthesis (less elaborated than a secretory cell) | around the nucleus | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | small, protein packaging | near the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production; moderate number | dispersed in cytoplasm | core |
| `ribosomes` | ribosoma libera / polysomata | Free ribosomes / polysomes | freie Ribosomen / Polysomen | active protein synthesis for proliferation | scattered in cytoplasm | core |
| `apical_process_cilium` | processus apicalis cum cilio primario | Apical process with primary cilium | Apikaler Fortsatz mit primärem Zilium | single non-motile sensory cilium contacting the ventricle/CSF (niche signalling) | short process at one pole | core |
| `basal_process` | processus basalis | Basal (vascular) process | Basaler (vaskulärer) Fortsatz | long thin process contacting a nearby blood vessel for niche cues | opposite pole, elongated | core |

### Do NOT draw (scientifically misleading)
- **No cell wall** — this is an animal cell, not a plant cell or bacterium.
- **No nucleoid, plasmids or bacterial flagella** — not a prokaryote.
- **No chloroplasts** — not a plant cell.
- **No large central vacuole** — that is a plant-cell feature; NSCs have only small scattered vesicles.
- **Not round like a red blood cell or a lymphocyte** — the defining shape is polarized/bipolar with two distinct thin processes (apical + basal), not a sphere or biconcave disc.
- **Not a fully mature, elaborately branched neuron** — do NOT draw dendritic spines, an axon with synaptic terminals/vesicles, or myelin; this is an undifferentiated precursor, not a differentiated neuron.
- **Only ONE primary cilium, non-motile** — do NOT draw multiple beating cilia (that is the ependymal cell lining the ventricle, a different cell type) or a flagellum-like beating tail (like a sperm tail).
- **No dense secretory-granule content** — rough ER/Golgi should look modest, not like a gland cell packed with secretory vesicles.
- A single specimen, not a dense confluent monolayer — individual morphology must stay readable.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Neural_Stem_Cells.jpg"** (Wellcome Collection), a genuine fluorescence micrograph of mouse neural stem cells growing in culture, immunostained for an intermediate-filament/cytoskeletal marker (green) with DAPI-stained nuclei (blue) — showing the small, bipolar-to-multipolar cell bodies with thin radiating processes that are the hallmark NSC morphology in culture.
- file: https://upload.wikimedia.org/wikipedia/commons/c/cc/Neural_Stem_Cells.jpg
- page: https://commons.wikimedia.org/wiki/File:Neural_Stem_Cells.jpg · License: **CC BY-SA 4.0** · Attribution: Wellcome Collection

AI visual verification result: **PASS (2026-08-14).** Genuine fluorescence photomicrograph (not a diagram) of cultured mouse neural stem cells: numerous small, bipolar/multipolar green-stained cell bodies with fine, elongated processes radiating between blue DAPI nuclei — matches the described in-vitro NSC morphology (thin processes, high nucleus:cytoplasm ratio, no dense secretory look). Caveat: the field is dense with many overlapping cells rather than one isolated specimen; a cleaned, recomposed version emphasizing one or two clearly bipolar cells was produced with `edit_image.py` and is used for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Neural Stem Cell — the quiet dreamer tucked away inside your brain! Long ago, an army of cells just like this one built your entire brain and spinal cord, neuron by neuron. These days, most of that building work is done, so the Neural Stem Cell mostly rests in a couple of cosy corners — like the hippocampus, your brain's memory workshop. It keeps one thin arm stretched out to sniff the fluid around it for signals, and another long arm reaching toward a blood vessel for supplies, just in case it's ever called into action. When it does get the signal, it can transform into a brand-new neuron or a helper glial cell. It's not the loudest or busiest cell in the brain, but it's the one holding onto the recipe for making more.  
🇩🇪 Das ist die Neuronale Stammzelle — die stille Träumerin tief in deinem Gehirn! Vor langer Zeit hat eine ganze Armee von Zellen wie sie dein gesamtes Gehirn und Rückenmark aufgebaut, Nervenzelle für Nervenzelle. Heute ist der große Bau fast fertig, deshalb ruht sich die Neuronale Stammzelle meistens in ein paar gemütlichen Ecken aus — zum Beispiel im Hippocampus, der Erinnerungswerkstatt deines Gehirns. Sie streckt einen dünnen Arm aus, um die Flüssigkeit um sich herum nach Signalen abzutasten, und einen langen Arm zu einem Blutgefäß, um versorgt zu werden, falls sie gebraucht wird. Bekommt sie das Signal, kann sie sich in eine ganz neue Nervenzelle oder eine helfende Gliazelle verwandeln. Sie ist nicht die lauteste oder geschäftigste Zelle im Gehirn, aber sie bewahrt das Rezept, um neue Zellen herzustellen.

**Adults (popular science, health).**  
🇬🇧 The neural stem cell (NSC) is the precursor from which the entire nervous system is built, generating neurons, astrocytes and oligodendrocytes during development. In the adult human brain, active NSCs are largely restricted to two small niches: the subventricular zone lining the brain's ventricles and the subgranular zone of the hippocampus, a region central to learning and memory. There they sit as radial-glia-like cells, one thin process sensing the cerebrospinal fluid and another contacting a nearby blood vessel, staying mostly quiescent until local growth factors such as EGF and FGF prompt them to divide. This slow-trickle adult neurogenesis is thought to support memory formation and mood regulation, and it declines with age, which is why NSC biology is a major focus of research into brain repair and neurodegenerative disease.  
🇩🇪 Die neuronale Stammzelle (NSC) ist der Vorläufer, aus dem das gesamte Nervensystem aufgebaut wird — während der Entwicklung entstehen aus ihr Neuronen, Astrozyten und Oligodendrozyten. Im erwachsenen menschlichen Gehirn sind aktive NSCs weitgehend auf zwei kleine Nischen beschränkt: die subventrikuläre Zone entlang der Hirnventrikel und die subgranuläre Zone des Hippocampus, einer für Lernen und Gedächtnis zentralen Region. Dort sitzen sie als radialglia-ähnliche Zellen, mit einem dünnen Fortsatz, der die Gehirn-Rückenmarks-Flüssigkeit abtastet, und einem weiteren, der ein nahes Blutgefäß kontaktiert, meist in Ruhe, bis lokale Wachstumsfaktoren wie EGF und FGF sie zur Teilung anregen. Diese langsame, lebenslange Neubildung von Nervenzellen im Erwachsenenalter unterstützt vermutlich Gedächtnisbildung und Stimmungsregulation und nimmt mit dem Alter ab, weshalb die NSC-Biologie ein zentraler Forschungsschwerpunkt für Hirnreparatur und neurodegenerative Erkrankungen ist.

**Scientific.**  
🇬🇧 The neural stem cell (NSC) is a multipotent, self-renewing precursor of the central nervous system that generates neurons, astrocytes and oligodendrocytes. In the adult mammalian brain, NSCs persist as morphologically astrocyte-like radial glia (SVZ type B cells; SGZ radial glia-like cells), retaining a polarized architecture with an apical process bearing a single primary cilium that contacts the cerebrospinal fluid and a basal process contacting the local vasculature, positioning the cell to integrate niche cues. NSCs express nestin, Sox2, vimentin and (in their adult astrocyte-like state) GFAP as intermediate-filament/transcription-factor markers, maintain a high nucleus-to-cytoplasm ratio with modest rough-ER/Golgi content consistent with an undifferentiated state, and respond to EGF and FGF-2 signalling governing quiescence-to-proliferation transitions. NSCs can be propagated in vitro as clonal neurospheres or adherent monolayer cultures and, upon activation, produce transit-amplifying progenitors that generate neuroblasts (SVZ, migrating via the rostral migratory stream to the olfactory bulb in rodents) or granule neurons (SGZ), underlying adult neurogenesis and its roles in olfaction, learning and memory, and its relevance to neural-repair and glioma-origin research.  
🇩🇪 Die neuronale Stammzelle (NSC) ist ein multipotenter, sich selbst erneuernder Vorläufer des zentralen Nervensystems, aus dem Neuronen, Astrozyten und Oligodendrozyten hervorgehen. Im erwachsenen Säugetiergehirn persistieren NSCs als morphologisch astrozytenähnliche Radialglia (Typ-B-Zellen der SVZ; radialglia-ähnliche Zellen der SGZ) mit einer polarisierten Architektur: ein apikaler Fortsatz mit einem einzelnen primären Zilium, das die Zerebrospinalflüssigkeit kontaktiert, und ein basaler Fortsatz, der die lokale Gefäßversorgung berührt, sodass die Zelle Nischensignale integrieren kann. NSCs exprimieren Nestin, Sox2, Vimentin und, in ihrem adulten astrozytenähnlichen Zustand, GFAP als Intermediärfilament-/Transkriptionsfaktor-Marker, weisen ein hohes Kern-Plasma-Verhältnis mit mäßigem rauem ER/Golgi-Gehalt auf, was einem undifferenzierten Zustand entspricht, und reagieren auf EGF- und FGF-2-Signale, die den Übergang von Ruhe zu Proliferation steuern. NSCs lassen sich in vitro als klonale Neurosphären oder adhärente Monolayer-Kulturen vermehren und erzeugen nach Aktivierung transit-amplifizierende Vorläuferzellen, aus denen Neuroblasten (SVZ, die über den rostralen migratorischen Strom zum Bulbus olfactorius wandern) oder Körnerzellneurone (SGZ) hervorgehen — die Grundlage der adulten Neurogenese mit Bedeutung für Geruchssinn, Lernen und Gedächtnis sowie für die Forschung zu Hirnreparatur und zum Ursprung von Gliomen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human/mammalian neural stem cell (NSC), a radial-glia-like animal cell, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED but clearly COLOURED, slightly desaturated palette — every organelle its own distinct soft pastel fill (e.g. pale warm-yellow nucleus, dusty rose-brown mitochondria, sage-green Golgi stack, soft powder-blue endoplasmic reticulum, small magenta ribosome dots, teal-grey cell body) — this must NOT read as a monochrome, sepia, or greyscale line drawing; THIN clean outlines (not heavy black strokes), gentle soft shading. The cell is polarized and bipolar: a compact, simple cell body with ONE short apical process ending in a single fine non-motile primary cilium at one pole, and ONE long thin basal process trailing off toward the opposite corner of the frame and simply fading into the empty background — no elaborate branching, no dendritic spines, no synaptic terminals, no myelin (this is an undifferentiated precursor, not a mature neuron). There are EXACTLY TWO appendages total on the cell body — the short apical process with its cilium, and the long basal process — and NOTHING else: no third stalk, no extra short stub sprouting from the cell body or from partway along either process, no separate blood-vessel shape anywhere in the frame. The long basal process must be a SINGLE unbranched tapering line that ends in a bare point with no shape, bud, or oval blob at its tip — it must NOT fork or split into two branches. A neat quarter cut-away reveals the interior: a very large, round, pale euchromatic nucleus with one nucleolus that fills most of the cell body (high nucleus-to-cytoplasm ratio), a thin rim of cytoplasm, a fine dense mesh of intermediate filaments (nestin/GFAP) running through the cell body and both processes as a scaffold, modest folded rough endoplasmic reticulum near the nucleus, a small Golgi stack, a few small oval mitochondria, and scattered tiny free ribosome dots. Anatomically faithful animal cell. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, multiple beating cilia, or a flagellum; this is NOT a bacterium and NOT a mature branched neuron. Absolutely NO text, letters, words, captions, numbers, labels, scale bars, arrows, or watermarks anywhere in the image, no matter how small.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE mammalian neural stem cell (NSC) in culture, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a small, smooth, polarized cell body with ONE short apical process tipped by a single thin non-motile primary cilium, and ONE long slender basal process trailing away to the opposite side; simple bipolar shape, no elaborate branching, no dendritic spines. Render true 3D surface texture: a gently domed cell body, a fine hair-like single cilium clearly distinct from the thicker trailing process, subtle membrane texture. Shallow depth of field so the far background falls softly out of focus, cool studio microscopy lighting. False-color palette: cool blue-teal to soft violet cell body against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only, do not draw multiple beating cilia (that would be a different cell type). Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE mammalian neural stem cell (NSC), a radial-glia-like animal cell, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is polarized and bipolar: a compact cell body with one short apical process ending in a single fine primary cilium, and one long thin basal process trailing off toward the opposite corner of the frame and simply fading into the empty dark background; simple shape, no elaborate branching or synaptic terminals. There are EXACTLY TWO appendages total on the cell body — the short apical process with its cilium, and the long basal process — and NOTHING else: no third stalk, no extra short stub sprouting from the cell body or from partway along either process, no separate blood-vessel shape or any other object anywhere in the frame. The long basal process must be a SINGLE unbranched tapering line that ends in a bare point with no shape, bud, or oval blob at its tip — it must NOT fork or split into two branches. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so the structures are clearly distinguishable: a very large translucent round nucleus with one nucleolus filling most of the cell body, a thin rim of cytoplasm, a fine mesh of intermediate filaments (nestin/GFAP) running through the body and both processes rendered as smooth flowing curved lines (never dashed, dotted, or clustered in a way that could resemble text, handwriting, or a scribbled caption), modest rough endoplasmic reticulum near the nucleus drawn as a few simple looping ribbons (not a dense dashed/dotted band), a small Golgi stack, a few small mitochondria with inner cristae. Natural colours, not near-monochrome and not neon. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, multiple beating cilia, or dendritic spines/synapses; this is an undifferentiated precursor animal cell, not a bacterium and not a mature neuron. Absolutely NO text, letters, words, captions, numbers, labels, scale bars, arrows, watermarks, or any fine dashed/dotted pattern that could be mistaken for illegible text, anywhere in the image, no matter how small.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE mammalian neural stem cell (NSC) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is polarized and bipolar: a compact cell body with one short apical process ending in a single fine primary cilium at one pole, and one long thin basal process trailing to the opposite pole; simple shape, no elaborate branching, no synaptic terminals, no myelin. A delicate painterly cut-away reveals the interior: a very large round nucleus with one nucleolus filling most of the cell body, washed thin cytoplasm, a fine mesh of intermediate filaments running lengthwise through the cell body and processes, modest folded rough endoplasmic reticulum near the nucleus, a small Golgi stack, and a few small mitochondria. Single specimen, anatomically faithful animal cell. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, multiple beating cilia, or dendritic spines. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 4 attempt(s), 7632 tok, $0.162
- attempt 1 · `gemini-2.5-flash-image` · 7.4s — FAIL (gemini-2.5-flash-image) — a THIRD stray appendage present: a separate short pink oval blob-on-a-stalk at the apical pole plus an extra reddish tipped process on the right, violating the exactly-two-appendages rule.
  ![textbook 1](theme/textbook/neural-stem-cell.attempts/gen-01__gemini-2.5-flash-image.png)
- attempt 2 · `gemini-2.5-flash-image` · 9.0s — FAIL (gemini-2.5-flash-image) — near-monochrome/sepia uncoloured line drawing (fails the textbook 'must be COLOURED' rule) and a separate floating 'blood vessel' object drawn outside the cell body.
  ![textbook 2](theme/textbook/neural-stem-cell.attempts/gen-02__gemini-2.5-flash-image.png)
- attempt 3 · `gemini-2.5-flash-image` · 8.8s — FAIL (gemini-2.5-flash-image) — both processes rendered as identical sharp needle-spikes crossing through the cell body (no distinguishable short apical cilium vs long basal process); malformed bowtie/X silhouette.
  ![textbook 3](theme/textbook/neural-stem-cell.attempts/gen-03__gemini-2.5-flash-image.png)
- attempt 4 · `gemini-3-pro-image` · 27.1s — PASS (gemini-3-pro-image) — correct polarized bipolar shape: one short apical process with a fine cilium, one long unbranched basal process; coloured muted-pastel cutaway with nucleus+nucleolus, rough ER, Golgi, mitochondria, intermediate-filament mesh, free ribosome dots; matches the house textbook palette; no text/border.
  ![textbook 4](theme/textbook/neural-stem-cell.attempts/gen-04__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/neural-stem-cell.textbook.svg)
[interactive SVG](theme/textbook/neural-stem-cell.textbook.svg) · [HTML](theme/textbook/neural-stem-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1546 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.2s — PASS (gemini-2.5-flash-image) — photorealistic false-colour (blue-teal) SEM surface only, correct bipolar shape with a short apical knob bearing a fine single non-motile cilium and one long tapering basal process, true 3D surface texture, single specimen, no internal organelles (correct for SEM), no text.
  ![sem 1](theme/sem/neural-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 5 attempt(s), 9152 tok, $0.197
- attempt 1 · `gemini-2.5-flash-image` · 17.2s — FAIL (gemini-2.5-flash-image) — basal process tip forks into two thin branches, violating the single-unbranched-tail rule.
  ![3d 1](theme/3d/neural-stem-cell.attempts/gen-01__gemini-2.5-flash-image.png)
- attempt 2 · `gemini-2.5-flash-image` · 11.0s — FAIL (gemini-2.5-flash-image) — basal process ends in an oval bud/blob shape at its tip instead of tapering to a bare point.
  ![3d 2](theme/3d/neural-stem-cell.attempts/gen-02__gemini-2.5-flash-image.png)
- attempt 3 · `gemini-2.5-flash-image` · 10.4s — FAIL (gemini-2.5-flash-image) — faint baked-in illegible text/letterforms visible around the nucleus rim.
  ![3d 3](theme/3d/neural-stem-cell.attempts/gen-03__gemini-2.5-flash-image.png)
- attempt 4 · `gemini-2.5-flash-image` · 10.6s — FAIL (gemini-2.5-flash-image) — anatomy/appendages correct (no fork, no blob, no text) but the render is near-monochrome pale cream/white, failing the '3d must use natural, not near-monochrome, biological tones' rule.
  ![3d 4](theme/3d/neural-stem-cell.attempts/gen-04__gemini-2.5-flash-image.png)
- attempt 5 · `gemini-3-pro-image` · 51.2s — PASS (gemini-3-pro-image) — natural biological tints (warm translucent peach/rose body, tan nucleus, pink mitochondria, sage Golgi), correct bipolar shape with exactly one short apical cilium process and one long unbranched tapering basal process, soft global illumination/subsurface scattering, no text.
  ![3d 5](theme/3d/neural-stem-cell.attempts/gen-05__gemini-3-pro-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/neural-stem-cell.3d.svg)
[interactive SVG](theme/3d/neural-stem-cell.3d.svg) · [HTML](theme/3d/neural-stem-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1613 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.2s — PASS (gemini-2.5-flash-image) — full-bleed aged-paper background (paper IS the background, no mat/frame), correct bipolar shape (one short apical process with cilium tip, one long unbranched basal process), pencil/sepia-wash cutaway with nucleus+nucleolus, mitochondria, a folded rough-ER ribbon, fine intermediate-filament linework; no distinct Golgi stack or separate free-ribosome dots rendered (only the ER-like ribbon + 4 mitochondria are visibly distinguishable in this attempt) so those two keys are left unlabelled on this style rather than mislabelled; no text.
  ![watercolor 1](theme/watercolor/neural-stem-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/neural-stem-cell.watercolor.svg)
[interactive SVG](theme/watercolor/neural-stem-cell.watercolor.svg) · [HTML](theme/watercolor/neural-stem-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `fluorescence` · CC BY-SA 4.0 · Wellcome Collection — PASS (2026-08-14). Genuine fluorescence photomicrograph (not a diagram) of cultured mouse neural stem cells, Wellcome Collection via Wikimedia Commons (CC BY-SA 4.0): numerous small, bipolar/multipolar green-stained cell bodies with fine, elongated processes radiating between blue DAPI-stained nuclei — matches the described in-vitro NSC morphology (thin processes, high nucleus:cytoplasm ratio). The raw download shows a dense field of many overlapping cells rather than one isolated specimen; a cleaned/recomposed edit (edit_image.py) emphasizing two clearly bipolar cells and removing stray artifacts was produced and is used as the display image.
  ![reference](../reference-microscopy/theme/real/neural-stem-cell.attempts/real-02__edit-gemini-2.5-flash-image.png)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 4 | escalated to gemini-3-pro-image after 3 Nano-Banana fails (extra appendage; uncoloured+floating object; malformed spikes); correct anatomy + house palette |
| sem | pass | 1 | correct bipolar surface morphology, false-colour, single specimen |
| 3d | pass | 5 | escalated to gemini-3-pro-image after 4 Nano-Banana fails (forked tail; blob tip; baked text; near-monochrome); correct anatomy + natural tints |
| watercolor | pass | 1 | full-bleed paper, correct bipolar anatomy; Golgi/free-ribosome labels omitted as not visually distinct in this attempt |
