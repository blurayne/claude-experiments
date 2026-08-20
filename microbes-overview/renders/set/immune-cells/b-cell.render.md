# B cell — render log

**Set:** `immune-cells` · **Microbe key:** `b-cell`
**Short description:** Antibody factory: a small round agranulocyte that recognises antigen with its B-cell receptor (surface IgM/IgD) and, usually with CD4 T-cell help, matures into plasma cells that pump out tailored antibodies against free bacteria, virus particles and toxins in blood and tissue.

Metadata sidecar: [`b-cell.render.meta.json`](b-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The B lymphocyte (B cell) is a small (~6–10 µm resting, up to ~15 µm once activated) agranulocyte of the adaptive immune system, produced and initially selected in the bone marrow (hence "B"). Like all resting lymphocytes, under light and electron microscopy it is dominated by its **nucleus**: a single, round to slightly indented nucleus fills most of the cell volume, with chromatin condensed into dark-staining **heterochromatin** clumped mainly at the nuclear periphery around a small, often inconspicuous **nucleolus**. This leaves only a **thin rim of basophilic cytoplasm**, basophilic because it is packed with **free ribosomes and polyribosomes** rather than membrane-bound rough ER — a resting B cell has only a modest amount of rough endoplasmic reticulum and a compact Golgi, both of which expand dramatically once the cell differentiates into an antibody-secreting plasma cell. A handful of small, ellipsoidal **mitochondria**, a small **Golgi apparatus**, and a pair of **centrioles** (the microtubule-organizing centre, MTOC) sit near a slight nuclear indentation. The **plasma membrane** carries short **microvilli**, giving the surface a subtly ruffled texture in SEM images, and displays the defining surface complex: the **B-cell receptor (BCR)** — a membrane-bound immunoglobulin, usually **IgM or IgD**, paired with the signal-transducing **Igα/Igβ (CD79a/CD79b)** heterodimer — together with co-receptors (CD19/CD21/CD81) that lower the activation threshold. B cells also express abundant **MHC class II** on their surface, letting them act as antigen-presenting cells that show processed antigen fragments to helper T cells. A cortical **actin cytoskeleton** underlies the membrane and reorganizes during antigen capture and during formation of the immunological synapse with a helper T cell.

When its BCR binds a matching antigen — and, for most protein antigens, when it also receives cytokine and CD40-ligand signals from a cognate CD4⁺ helper T cell — the B cell proliferates in a germinal centre, undergoes class-switching and affinity maturation, and differentiates either into a long-lived **memory B cell** or into a **plasma cell**: a terminally differentiated antibody factory with an eccentric nucleus (often a "clock-face"/"cartwheel" heterochromatin pattern), a cytoplasm packed with dilated rough ER cisternae producing immunoglobulin, and a large, well-developed perinuclear Golgi. This render depicts the **circulating/resting B lymphocyte** stage (the form shown in blood and lymph-node micrographs and the stage most teaching material calls "a B cell"), not the fully differentiated plasma cell.

Important caveat for the reference image: light microscopy and standard EM **cannot distinguish a B lymphocyte from a T lymphocyte** by morphology alone — all small resting lymphocytes look essentially identical (large dense nucleus, thin rim of cytoplasm, similarly villous surface in SEM). The B-vs-T identity is a surface-marker (flow-cytometry: CD19/CD20 vs CD3/CD4/CD8) distinction, not a shape distinction. Textbook/atlas images captioned "B lymphocyte" (as used here) are the standard, honest way to depict this cell.

Sources: [Kenhub — Lymphocytes: Histology and function](https://www.kenhub.com/en/library/anatomy/lymphocytes), [NCBI Bookshelf — StatPearls, Histology, B Cell Lymphocyte](https://www.ncbi.nlm.nih.gov/books/NBK560905/), [NCBI Bookshelf — StatPearls, Histology, Plasma Cells](https://www.ncbi.nlm.nih.gov/books/NBK556082/), [Wikipedia — B cell](https://en.wikipedia.org/wiki/B_cell), [Kenhub — Plasma cells: Anatomy and function](https://www.kenhub.com/en/library/anatomy/plasma-cells), [Kirk et al. 2010, Biogenesis of secretory organelles during B cell differentiation, J. Leukocyte Biology (Wiley)](https://jlb.onlinelibrary.wiley.com/doi/10.1189/jlb.1208774).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; huge relative to cell size | fills most of the cell, slightly off-centre | core |
| `heterochromatin` | heterochromatin | Heterochromatin (condensed, dense-staining) | Heterochromatin (dicht gepackt) | tightly packed, transcriptionally quiet DNA; gives the nucleus its dark, dense look | clumped at the nuclear rim/periphery | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly; small at rest | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries surface receptors | outermost | core |
| `bcr` | receptor cellulae B (IgM/IgD) | B-cell receptor (surface IgM/IgD + Igα/Igβ) | B-Zell-Rezeptor (Oberflächen-IgM/IgD + Igα/Igβ) | binds antigen directly (unlike the TCR, no MHC needed); triggers activation signalling | studding the plasma membrane | core |
| `mhc_ii` | MHC classis II | MHC class II (antigen presentation) | MHC-Klasse-II (Antigenpräsentation) | displays processed antigen fragments to CD4 helper T cells for licensing | on the plasma membrane | core |
| `microvilli` | microvilli | Surface microvilli | Oberflächen-Mikrovilli | short membrane projections; give the surface a ruffled texture | over the whole surface | core |
| `cytoplasm` | cytoplasma | Cytoplasm (thin rim) | Zytoplasma (schmaler Saum) | thin band housing organelles; scant compared to the nucleus | narrow ring around the nucleus | core |
| `ribosomes` | ribosomata libera | Free ribosomes / polyribosomes | Freie Ribosomen / Polyribosomen | protein synthesis; abundant, make the cytoplasm basophilic | scattered through the cytoplasm | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum (modest, ready to expand) | Raues endoplasmatisches Retikulum (mäßig, bereit zu wachsen) | folds/secretes protein; still modest at rest, expands massively once the cell becomes a plasma cell | a few cisternae near the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production via oxidative phosphorylation | a few, dispersed in the cytoplasmic rim | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/modifies proteins, incl. antibody once the cell differentiates | small, near the nuclear indentation | core |
| `centriole` | centriolum | Centriole / MTOC | Zentriol / MTOC | organizes microtubules | near the Golgi, at the nuclear indentation | core |
| `cytoskeleton` | cytoskeleton actini | Cortical actin cytoskeleton | Kortikales Aktin-Zytoskelett | shape, antigen capture, forms the immunological synapse with a helper T cell | just under the plasma membrane | core |

### Do NOT draw (scientifically misleading)
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is a eukaryotic human cell, not a prokaryote.
- **No chloroplasts or large central vacuole** — not a plant cell.
- **Not a biconcave disc and not anucleate** — unlike a red blood cell, the B cell keeps its (very large) nucleus its whole life.
- **Not granular** — unlike neutrophils/eosinophils/basophils (granulocytes), lymphocytes are agranulocytes: no visible cytoplasmic granules, no multi-lobed nucleus.
- **No "clock-face"/"cartwheel" nucleus and no massive perinuclear rough-ER stack** — that dramatic look belongs to the fully differentiated **plasma cell**, the B cell's activated descendant, not to the circulating B lymphocyte depicted here; keep the nucleus fairly round/central and the rough ER modest.
- **No cilia or flagella for locomotion** — B cells move by amoeboid crawling (actin-driven), not by beating appendages.
- **Cytoplasm must stay a thin rim** — the defining look of a lymphocyte is "mostly nucleus"; do not draw a large, roomy cytoplasm dwarfing the nucleus.
- A single specimen, not a dense cluster of lymphocytes — individual morphology must stay readable.
- General: no baked-in text/letters/numbers/scale bars/watermarks, no black border/frame/vignette/letterbox, no "sheet lying on a surface" for the watercolor style.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Human B Lymphocyte - NIAID.jpg"**, a NIAID colorized scanning electron micrograph of a single human B lymphocyte from a healthy donor, showing the round cell body with a ruffled, microvillus-covered surface — a standard, widely used public-health-agency image for "B cell" (see caveat above re: B vs T not being visually distinguishable).
- file: https://upload.wikimedia.org/wikipedia/commons/4/46/Human_B_Lymphocyte_-_NIAID.jpg
- page: https://commons.wikimedia.org/wiki/File:Human_B_Lymphocyte_-_NIAID.jpg · License: **CC BY 2.0** · Attribution: NIAID (National Institute of Allergy and Infectious Diseases), via Flickr

AI visual verification result: **PASS (2026-08-16).** Confirmed single, isolated, round lymphocyte-sized cell densely covered in fine ruffled microvilli, the well-known NIAID false-colour SEM plate of a human B lymphocyte; clean near-black background, no baked-in text, scale bar or watermark, no dense clump obscuring surface detail — used as-is for display (no cleaning edit needed beyond the standard normalisation `fetch_reference.py` already applies). Caveat per §1: this modality cannot distinguish a B cell from a T cell by shape alone; captioned honestly as "B lymphocyte" per the source file's own title.

---

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Say hello to the B Cell — the body's antibody factory! She spends her days cruising through your blood and hanging out in your lymph nodes, on the lookout for germs. The moment she spots one that matches her special sticky receptor, she gets to work: she grows a huge internal factory floor and starts churning out thousands of tiny Y-shaped antibodies, each one custom-built to grab that exact germ and stick a "get rid of me" tag on it. She usually waits for a nod from her friend the Helper T cell before switching into full factory mode — teamwork makes her antibodies stronger and longer-lasting. Some of her sisters become memory cells that remember the germ for years, so next time it shows up, the body is ready in a flash.  
🇩🇪 Das ist die B-Zelle — die Antikörper-Fabrik deines Körpers! Sie flitzt durch dein Blut und hält sich gern in deinen Lymphknoten auf, immer auf der Suche nach Keimen. Sobald sie einen entdeckt, der zu ihrem besonderen, klebrigen Rezeptor passt, legt sie los: Sie baut sich eine riesige Fabrikhalle in ihrem Inneren und produziert Tausende winziger Y-förmiger Antikörper, jeder maßgeschneidert, um genau diesen Keim zu packen und mit einem "Entsorgen!"-Etikett zu versehen. Meistens wartet sie erst auf ein Okay von ihrer Freundin, der Helferzelle, bevor sie auf volle Fabrikleistung schaltet — Teamarbeit macht ihre Antikörper stärker und langlebiger. Manche ihrer Schwestern werden zu Gedächtniszellen, die sich jahrelang an den Keim erinnern, damit der Körper beim nächsten Mal blitzschnell bereit ist.

**Adults (popular science, health).**  
🇬🇧 The B cell is the immune system's antibody manufacturer. Each B cell carries a unique receptor on its surface — essentially a preview copy of one specific antibody — and when that receptor binds a matching antigen on a bacterium, virus or toxin, the cell is set on a path to mass-produce that antibody. Full activation usually requires a second signal from a CD4 helper T cell, a checkpoint that helps ensure antibodies are made against real threats rather than the body's own tissues. Once licensed, some B cells differentiate into plasma cells, dedicating almost their entire internal machinery to churning out antibodies, while others become long-lived memory B cells that give repeat infections, and vaccines, a faster and stronger response the second time around.  
🇩🇪 Die B-Zelle ist die Antikörper-Herstellerin des Immunsystems. Jede B-Zelle trägt einen einzigartigen Rezeptor auf ihrer Oberfläche — quasi eine Vorschau eines ganz bestimmten Antikörpers — und wenn dieser Rezeptor auf ein passendes Antigen eines Bakteriums, Virus oder Toxins trifft, wird die Zelle auf den Weg zur Massenproduktion dieses Antikörpers gebracht. Die volle Aktivierung braucht meist ein zweites Signal von einer CD4-Helferzelle, eine Kontrollstufe, die dafür sorgt, dass Antikörper eher gegen echte Bedrohungen als gegen körpereigenes Gewebe gebildet werden. Nach dieser "Freigabe" verwandeln sich manche B-Zellen in Plasmazellen und widmen fast ihre gesamte innere Maschinerie der Antikörperproduktion, während andere zu langlebigen Gedächtnis-B-Zellen werden, die bei einer erneuten Infektion — oder nach einer Impfung — für eine schnellere und stärkere Reaktion sorgen.

**Scientific.**  
🇬🇧 The B lymphocyte is an adaptive-immune cell that undergoes antigen-independent development and negative selection in the bone marrow before circulating as a naive, resting cell displaying a clonally unique B-cell receptor (BCR): a membrane-bound immunoglobulin (IgM, co-expressed with IgD) non-covalently associated with the signal-transducing Igα/Igβ (CD79a/CD79b) heterodimer, together with the CD19/CD21/CD81 co-receptor complex that lowers the activation threshold. BCR crosslinking by cognate antigen, combined for most T-dependent antigens with CD40–CD40L engagement and cytokine signals from a cognate CD4⁺ T follicular helper cell, drives clonal expansion, germinal-centre reactions (somatic hypermutation, affinity maturation, class-switch recombination) and terminal differentiation into either long-lived memory B cells or antibody-secreting plasma cells. Ultrastructurally the resting B cell is a small agranulocyte with a large, mildly heterochromatic nucleus, a thin rim of ribosome-rich basophilic cytoplasm, modest rough ER and Golgi, and MHC class II for antigen presentation to helper T cells — a phenotype that expands dramatically in rough ER and Golgi volume upon plasma-cell differentiation.  
🇩🇪 Der B-Lymphozyt ist eine Zelle der adaptiven Immunabwehr, die eine antigenunabhängige Entwicklung und negative Selektion im Knochenmark durchläuft, bevor sie als naive, ruhende Zelle mit einem klonal einzigartigen B-Zell-Rezeptor (BCR) zirkuliert: einem membrangebundenen Immunglobulin (IgM, gemeinsam mit IgD exprimiert), das nichtkovalent mit dem signalübertragenden Igα/Igβ-Heterodimer (CD79a/CD79b) sowie dem CD19/CD21/CD81-Korezeptorkomplex assoziiert ist, der die Aktivierungsschwelle senkt. Die Quervernetzung des BCR durch passendes Antigen treibt zusammen mit — bei den meisten T-Zell-abhängigen Antigenen — CD40–CD40L-Interaktion und Zytokinsignalen einer follikulären CD4⁺-T-Helferzelle die klonale Expansion, Keimzentrumsreaktionen (somatische Hypermutation, Affinitätsreifung, Klassenwechsel-Rekombination) und die terminale Differenzierung zu langlebigen Gedächtnis-B-Zellen oder antikörpersezernierenden Plasmazellen voran. Ultrastrukturell ist die ruhende B-Zelle ein kleiner Agranulozyt mit großem, leicht heterochromatischem Zellkern, einem schmalen Saum ribosomenreichen basophilen Zytoplasmas, mäßigem rauem ER und Golgi-Apparat sowie MHC-Klasse-II zur Antigenpräsentation gegenüber Helferzellen — ein Phänotyp, dessen raues ER und Golgi-Volumen sich bei der Plasmazell-Differenzierung dramatisch vergrößern.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human B lymphocyte (B cell), a small round agranulocyte of the adaptive immune system, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is a small round sphere dominated by a huge round nucleus that fills most of the cell volume, with dense heterochromatin clumped at the nuclear periphery around one small nucleolus, leaving only a thin rim of cytoplasm. A neat quarter cut-away reveals the interior: the thin ribosome-dotted cytoplasmic rim, a few small oval mitochondria, a compact Golgi apparatus and a pair of centrioles near a slight nuclear indentation, and a modest patch of rough endoplasmic reticulum (a few short folded sheets, NOT a large stack). The cell surface bears fine short microvilli and small membrane-embedded Y-shaped B-cell receptor (BCR) proteins with a few flatter MHC class II molecules nearby. Anatomically faithful human lymphocyte. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia, cytoplasmic granules, or a multi-lobed nucleus; this is NOT a bacterium, NOT a granulocyte, and NOT a red blood cell. Do NOT give it a "clock-face" eccentric nucleus or a large stack of rough ER filling the cytoplasm — that dramatic look belongs to a fully differentiated plasma cell, not this resting B cell; keep the nucleus round/central and cytoplasm a thin rim. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human B lymphocyte, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a small round sphere with a surface covered in fine short ruffled microvilli, giving it a subtly fuzzy, textured look. Render true 3D surface texture: gentle membrane ruffles and a dense coat of short microvilli across the whole visible surface. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm coral to soft rose-gold cell against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only, round lymphocyte shape (not elongated, not spindle-shaped). Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human B lymphocyte (B cell), centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is a small round sphere dominated by a large round nucleus filling most of the interior, with heterochromatin patches near the nuclear rim around a small nucleolus, leaving only a thin rim of cytoplasm. Use a gentle cut-away with rich, warm, saturated, natural biological tones (like a warm peachy-tan to amber translucent cell body, a dusty rose-purple nucleus, golden-orange mitochondria, lavender Golgi) so the structures are clearly and vividly distinguishable — this must NOT read as pale white, icy blue-white, or glassy/glowing monochrome; every structure needs its own warm, saturated, believable colour, similar to a warm-lit anatomical model, not neon. fine ribosome specks in the cytoplasm, a couple of small oval mitochondria with inner cristae, a compact Golgi stack, a small patch of rough endoplasmic reticulum, and short surface microvilli with tiny Y-shaped B-cell receptor proteins studding the membrane. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, cilia, cytoplasmic granules or a multi-lobed nucleus; this is a round human lymphocyte, not a bacterium and not a granulocyte. Do NOT give it an eccentric "clock-face" nucleus or a large mass of rough ER — that belongs to a differentiated plasma cell, not this resting B cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human B lymphocyte (B cell) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is a small round lymphocyte dominated by a large round nucleus with heterochromatin washed darker at the rim around a small nucleolus, leaving a thin ring of cytoplasm. A delicate painterly cut-away reveals the interior: fine ribosome speckles, a couple of small mitochondria, a compact Golgi, and a modest patch of rough endoplasmic reticulum near the nucleus; the surface shows fine short microvilli. Single specimen, anatomically faithful round human lymphocyte, not elongated. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, cilia or cytoplasmic granules. Do NOT paint an eccentric "clock-face" nucleus or a large mass of rough ER — that belongs to a plasma cell, not this B cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1705 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 20.3s — pass (gemini-2.5-flash-image; muted desaturated educational palette, thin clean outlines, correct cutaway showing dominant round nucleus with peripheral heterochromatin clumps around a small nucleolus, thin cytoplasmic rim with mitochondria, compact Golgi, centriole pair and a modest rough-ER patch, microvilli-fringed membrane with Y-shaped BCR + MHC-II stubs; matches helper-t-cell/cocci house look, no border, single specimen, not a plasma-cell clock-face nucleus)
  ![textbook 1](theme/textbook/b-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/b-cell.textbook.svg)
[interactive SVG](theme/textbook/b-cell.textbook.svg) · [HTML](theme/textbook/b-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1501 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 10.4s — pass (gemini-2.5-flash-image; single round cell densely covered in fine ruffled microvilli giving the characteristic shaggy lymphocyte surface, warm coral/rose-gold false colour, crisp 3D surface texture, clean dark uncluttered background, no internal structures shown as expected for SEM, no text/border, matches the real B-lymphocyte SEM reference closely)
  ![sem 1](theme/sem/b-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3279 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 10.9s — fail (gemini-2.5-flash-image; nucleus and cytoplasm read as pale icy white/blue and near-monochrome, violating the 'not pale white, not glassy/glowing monochrome' rule — superseded)
  ![3d 1](theme/3d/b-cell.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 10.2s — pass (gemini-2.5-flash-image; warm peachy-orange translucent cytoplasm, dusty-rose nucleus with visible heterochromatin patches and nucleolus, golden BCR stubs, striped mitochondria, lavender Golgi cluster — natural saturated biological tones, soft rim light, no border, not neon/monochrome)
  ![3d 2](theme/3d/b-cell.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/b-cell.3d.svg)
[interactive SVG](theme/3d/b-cell.3d.svg) · [HTML](theme/3d/b-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1609 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 20.5s — pass (gemini-2.5-flash-image; warm aged paper fills the entire frame edge-to-edge with a soft darker wash halo directly on the paper (no mat/frame/sheet-on-surface), fine ink linework, dominant nucleus with heterochromatin stippling and small nucleolus, thin cytoplasmic rim with mitochondria and a comma-shaped rough-ER/Golgi patch, delicate ink microvilli fringe, matches cocci/rod-bacterium watercolor house look)
  ![watercolor 1](theme/watercolor/b-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/b-cell.watercolor.svg)
[interactive SVG](theme/watercolor/b-cell.watercolor.svg) · [HTML](theme/watercolor/b-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · CC BY 2.0 · NIAID (National Institute of Allergy and Infectious Diseases), via Flickr — pass (Wikimedia Commons 'Human_B_Lymphocyte_-_NIAID.jpg', NIAID CC BY 2.0 colorized SEM of a single human B lymphocyte; densely ruffled microvillus surface, clean near-black background, no baked-in text/scale bar, used as-is; caveat noted in render.md that light/EM cannot distinguish B from T lymphocytes by shape alone)
  ![reference](../reference-microscopy/theme/real/b-cell.attempts/real-01__SEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | use as final; accurate cutaway lymphocyte matching exemplar palette/line style, correctly avoids the plasma-cell clock-face look |
| sem | pass | 1 | use as final; accurate microvillus-covered surface, correct false-colour SEM rendering, matches real reference |
| 3d | pass | 2 | use as final after one re-render to fix a pale/icy-monochrome colour failure in attempt 1; natural warm biological tints and correct internal layering |
| watercolor | pass | 1 | use as final; full-bleed aged-paper composition with correct eukaryotic anatomy |
