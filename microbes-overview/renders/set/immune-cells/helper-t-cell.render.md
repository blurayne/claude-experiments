# Helper T cell (CD4) — render log

**Set:** `immune-cells` · **Microbe key:** `helper-t-cell`
**Short description:** Conductor of the immune response: a small, round agranulocyte with a huge heterochromatic nucleus and a thin rim of ribosome-rich cytoplasm; recognises antigen fragments on MHC class II via its TCR-CD4 complex and releases cytokines that switch on B cells, CD8 killer cells and macrophages.

Metadata sidecar: [`helper-t-cell.render.meta.json`](helper-t-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The helper T cell (T<sub>H</sub>, CD4<sup>+</sup> T lymphocyte) is a small (~7–10 µm resting, up to ~15 µm activated) agranulocyte of the adaptive immune system. Under light and electron microscopy a resting lymphocyte is dominated by its nucleus: a single, round to slightly indented nucleus fills most of the cell volume, with chromatin heavily condensed into dark-staining **heterochromatin** clumped at the nuclear periphery and around a small, often inconspicuous **nucleolus** (nucleoli become more prominent once the cell is activated and starts transcribing heavily). This leaves only a **thin rim of basophilic cytoplasm** around the nucleus — basophilic because it is packed with **free ribosomes and polyribosomes** rather than membrane-bound rough ER; resting T cells have comparatively little rough ER and few Golgi cisternae, growing both once activated and secreting cytokines. A handful of small, ellipsoidal **mitochondria**, a compact **Golgi apparatus**, and a pair of **centrioles** (the microtubule-organizing centre, MTOC) sit near a slight nuclear indentation. The **plasma membrane** is studded with short **microvilli**, giving the cell surface a subtly ruffled/villous texture in SEM images, and displays the defining surface complex: the **T-cell receptor (TCR) bound to CD3** together with the **CD4 co-receptor**, which together recognise short peptide antigens presented on MHC class II molecules by antigen-presenting cells (dendritic cells, macrophages, B cells). A cortical **actin cytoskeleton** underlies the membrane and remodels dramatically during antigen recognition, forming the organised "immunological synapse" where TCR-CD4 complexes cluster against the antigen-presenting cell, and during migration, where the cell polarises into an actin-rich leading edge (lamellipodia) and a trailing uropod with the organelles concentrated toward the rear. Once activated by antigen recognition plus co-stimulation, the helper T cell proliferates and differentiates into effector subsets (T<sub>H</sub>1, T<sub>H</sub>2, T<sub>H</sub>17, T<sub>FH</sub>, T<sub>reg</sub>, etc.) that secrete distinct cytokine cocktails (e.g. IL-2, IFN-γ, IL-4, IL-17) to marshal B cells, cytotoxic CD8 T cells and macrophages — hence its role as "conductor" of the adaptive immune response.

Important caveat for the reference image: light microscopy and standard EM **cannot distinguish a CD4 helper T cell from a CD8 cytotoxic T cell or a B lymphocyte** by morphology alone — all small lymphocytes look essentially identical (large dense nucleus, thin rim of cytoplasm); the CD4/CD8/CD19 identity is a surface-marker (flow-cytometry) distinction, not a shape distinction. Textbook/atlas images captioned "T lymphocyte" (as used here) are the standard, honest way to depict this cell.

Sources: [Kenhub — Lymphocytes: Histology and function](https://www.kenhub.com/en/library/anatomy/lymphocytes), [NCBI Bookshelf — StatPearls, Histology, T-Cell Lymphocyte](https://www.ncbi.nlm.nih.gov/books/NBK535433/), [NCBI Bookshelf — StatPearls, Histology, Cytotoxic T Cells](https://www.ncbi.nlm.nih.gov/books/NBK559279/), [Wikipedia — T cell](https://en.wikipedia.org/wiki/T_cell), [A History and Atlas of the Human CD4+ T Helper Cell, MDPI Biology 2023 (PMC10604283)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10604283/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; huge relative to cell size | fills most of the cell, slightly off-centre | core |
| `heterochromatin` | heterochromatin | Heterochromatin (condensed, dense-staining) | Heterochromatin (dicht gepackt) | tightly packed, transcriptionally quiet DNA; gives the nucleus its dark, dense look | clumped at the nuclear rim/periphery | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly; small at rest, grows when activated | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries surface receptors | outermost | core |
| `tcr_cd4` | receptor cellulae T cum co-receptore CD4 | T-cell receptor (TCR-CD3) with CD4 co-receptor | T-Zell-Rezeptor (TCR-CD3) mit CD4-Korezeptor | recognises antigen peptide on MHC class II presented by other cells | studding the plasma membrane | core |
| `microvilli` | microvilli | Surface microvilli | Oberflächen-Mikrovilli | short membrane projections; give the surface a ruffled texture, aid contact with other cells | over the whole surface | core |
| `cytoplasm` | cytoplasma | Cytoplasm (thin rim) | Zytoplasma (schmaler Saum) | thin band housing organelles; scant compared to the nucleus | narrow ring around the nucleus | core |
| `ribosomes` | ribosomata libera | Free ribosomes / polyribosomes | Freie Ribosomen / Polyribosomen | protein synthesis; abundant, make the cytoplasm basophilic | scattered through the cytoplasm | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production via oxidative phosphorylation | a few, dispersed in the cytoplasmic rim | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/modifies proteins, incl. cytokines once activated | small, near the nuclear indentation | core |
| `centriole` | centriolum | Centriole / MTOC | Zentriol / MTOC | organizes microtubules; orients toward the antigen-presenting cell during synapse formation | near the Golgi, at the nuclear indentation | core |
| `cytoskeleton` | cytoskeleton actini | Cortical actin cytoskeleton | Kortikales Aktin-Zytoskelett | shape, motility, forms the immunological synapse | just under the plasma membrane | core |

### Do NOT draw (scientifically misleading)
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is a eukaryotic human cell, not a prokaryote.
- **No chloroplasts or large central vacuole** — not a plant cell.
- **Not a biconcave disc and not anucleate** — unlike a red blood cell, the helper T cell keeps its (very large) nucleus its whole life; do not draw it without a nucleus.
- **Not granular** — unlike neutrophils/eosinophils/basophils (granulocytes), lymphocytes are agranulocytes: no visible cytoplasmic granules, no multi-lobed nucleus.
- **Sparse rough ER, not a plasma-cell "cartwheel" nucleus** — a resting T cell has only modest RER/Golgi (mostly free ribosomes) and a smooth, evenly dense nucleus, unlike the abundant perinuclear RER and clock-face chromatin of a plasma cell.
- **No cilia or flagella for locomotion** — T cells move by amoeboid crawling (actin-driven lamellipodia/uropod), not by beating appendages.
- **Cytoplasm must stay a thin rim** — the defining look of a lymphocyte is "mostly nucleus"; do not draw a large, roomy cytoplasm dwarfing the nucleus.
- A single specimen, not a dense cluster of lymphocytes — individual morphology must stay readable.
- General: no baked-in text/letters/numbers/scale bars/watermarks, no black border/frame/vignette/letterbox, no "sheet lying on a surface" for the watercolor style.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "T Lymphocyte.jpg"**, a NIAID colorized scanning electron micrograph of a single human T lymphocyte from a healthy donor, showing the round cell body with a subtly ruffled, microvillus-covered surface — a standard, widely used public-health-agency image for "T cell" (see caveat above re: CD4 vs CD8 not being visually distinguishable).
- file: https://upload.wikimedia.org/wikipedia/commons/1/18/T_Lymphocyte.jpg
- page: https://commons.wikimedia.org/wiki/File:T_Lymphocyte.jpg · License: **CC BY 2.0** · Attribution: NIAID (National Institute of Allergy and Infectious Diseases), via Flickr

AI visual verification result: **PASS (2026-08-14).** Confirmed single, isolated, round lymphocyte-sized cell densely covered in fine ruffled microvilli/membrane folds, the well-known NIAID false-colour SEM plate of a human T lymphocyte; clean dark background, no baked-in text, scale bar or watermark, no dense clump obscuring surface detail — used as-is for display (no cleaning edit needed beyond the standard normalisation `fetch_reference.py` already applies). Caveat per §1: this modality cannot distinguish CD4 from CD8 by shape alone; captioned honestly as "T lymphocyte".

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Helper T Cell — the conductor of your body's immune orchestra! She doesn't fight germs herself; instead she drifts through your lymph nodes waiting for a tip-off. Scout cells called dendritic cells and macrophages come running up to show her little pieces of anything suspicious they've found, held up on a tray called MHC-II. The moment she recognises a piece as trouble, she springs into action: she shouts out chemical messages called cytokines that tell the B cells to start making antibodies, wake up the CD8 killer cells to go deal with infected cells, and rally even more helpers to the scene. She never lands a hit herself — she's the one calling the shots, making sure every other player in the immune orchestra comes in at exactly the right moment.  
🇩🇪 Das ist die T-Helferzelle — die Dirigentin im Orchester deines Immunsystems! Sie kämpft nicht selbst gegen Keime, sondern schwebt durch deine Lymphknoten und wartet auf einen Hinweis. Kundschafter-Zellen wie dendritische Zellen und Makrophagen kommen zu ihr gerannt und zeigen ihr kleine Häppchen von allem Verdächtigen, das sie gefunden haben, präsentiert auf einem Tablett namens MHC-II. Erkennt sie so ein Häppchen als Ärger, legt sie los: Sie ruft mit chemischen Botenstoffen, den Zytokinen, den B-Zellen zu, dass sie Antikörper bauen sollen, weckt die CD8-Killerzellen, damit sie sich um infizierte Zellen kümmern, und trommelt noch mehr Helfer herbei. Selbst zuschlagen tut sie nie — sie gibt nur den Ton an und sorgt dafür, dass jeder andere Spieler im Immunorchester genau im richtigen Moment einsetzt.

**Adults (popular science, health).**  
🇬🇧 The helper T cell (T_H, CD4+ T lymphocyte) is the coordinator of the adaptive immune response rather than a direct attacker. It patrols lymph nodes and other lymphoid tissue, and is activated only when an antigen-presenting cell — a dendritic cell, macrophage or B cell — physically shows it a small fragment of a pathogen protein on an MHC class II molecule. Once that recognition happens (backed up by co-stimulatory signals confirming genuine danger), the helper T cell proliferates and starts secreting cytokines, chemical messengers that switch on other immune cells: they prompt B cells to mature into antibody factories, license CD8 killer T cells to go after infected cells, and recruit macrophages to clean up debris. Different subsets of helper T cells (T_H1, T_H2, T_H17, T_FH and others) specialise in coordinating different kinds of threats, from viruses to parasites to extracellular bacteria — which is exactly why HIV, which specifically destroys CD4 cells, is so devastating: it silences the conductor and the whole immune orchestra falls out of sync.  
🇩🇪 Die T-Helferzelle (T_H-Zelle, CD4+-T-Lymphozyt) ist nicht selbst ein Angreifer, sondern die Koordinatorin der erworbenen Immunantwort. Sie patrouilliert durch Lymphknoten und anderes lymphatisches Gewebe und wird erst aktiv, wenn eine antigenpräsentierende Zelle — eine dendritische Zelle, ein Makrophage oder eine B-Zelle — ihr ein winziges Stück eines Krankheitserreger-Proteins auf einem MHC-Klasse-II-Molekül zeigt. Sobald diese Erkennung stattfindet (bestätigt durch zusätzliche Signale, die echte Gefahr anzeigen), vermehrt sich die T-Helferzelle und schüttet Zytokine aus, chemische Botenstoffe, die andere Immunzellen einschalten: Sie bringen B-Zellen dazu, zu Antikörperfabriken heranzureifen, geben CD8-Killerzellen grünes Licht, infizierte Zellen anzugreifen, und rufen Makrophagen zum Aufräumen herbei. Verschiedene Untergruppen von T-Helferzellen (T_H1, T_H2, T_H17, T_FH und andere) sind auf die Koordination unterschiedlicher Bedrohungen spezialisiert, von Viren über Parasiten bis zu extrazellulären Bakterien — genau deshalb ist HIV, das gezielt CD4-Zellen zerstört, so verheerend: Es bringt die Dirigentin zum Schweigen, und das ganze Immunorchester gerät aus dem Takt.

**Scientific.**  
🇬🇧 The CD4+ helper T lymphocyte is a small (~7-10 µm resting) agranulocyte with a large heterochromatic nucleus and a thin rim of ribosome-rich cytoplasm, activated when its clonally distributed alpha-beta T-cell receptor (TCR), in complex with CD3 and the CD4 co-receptor, engages a peptide-MHC class II complex on a professional antigen-presenting cell (dendritic cell, macrophage or B cell), together with co-stimulatory signals (e.g. CD28-CD80/86). Productive activation drives clonal proliferation and differentiation into effector subsets — T_H1, T_H2, T_H17, T_FH, and induced regulatory (iT_reg) — each defined by a characteristic cytokine secretion profile (e.g. IFN-gamma, IL-4/IL-5/IL-13, IL-17, IL-21) driven by distinct master transcription factors (T-bet, GATA3, RORgammat, Bcl-6). Through cytokine secretion and cognate CD40L-CD40 interaction, helper T cells license B-cell antibody class-switching and germinal-centre formation, provide 'help' required for optimal CD8+ cytotoxic T-cell priming and memory formation, and activate macrophage microbicidal function. A subset persists as long-lived central and effector memory cells after antigen clearance. CD4+ T cells are the principal target of HIV, whose progressive depletion of this population underlies the immunodeficiency of AIDS.  
🇩🇪 Der CD4+-T-Helferlymphozyt ist ein kleiner (im Ruhezustand ca. 7-10 µm) Agranulozyt mit großem, heterochromatinreichem Zellkern und einem schmalen, ribosomenreichen Zytoplasmasaum. Er wird aktiviert, wenn sein klonal verteilter Alpha-Beta-T-Zell-Rezeptor (TCR) im Komplex mit CD3 und dem CD4-Korezeptor einen Peptid-MHC-Klasse-II-Komplex auf einer professionellen antigenpräsentierenden Zelle (dendritische Zelle, Makrophage oder B-Zelle) erkennt, zusammen mit ko-stimulatorischen Signalen (z. B. CD28-CD80/86). Eine produktive Aktivierung führt zu klonaler Proliferation und Differenzierung in Effektor-Subpopulationen — T_H1, T_H2, T_H17, T_FH und induzierte regulatorische T-Zellen (iT_reg) —, die jeweils durch ein charakteristisches Zytokinsekretionsprofil (z. B. IFN-gamma, IL-4/IL-5/IL-13, IL-17, IL-21) definiert sind, gesteuert von unterschiedlichen Schlüssel-Transkriptionsfaktoren (T-bet, GATA3, RORgammat, Bcl-6). Über Zytokinsekretion und die CD40L-CD40-Interaktion ermöglichen T-Helferzellen den Antikörper-Klassenwechsel und die Keimzentrumsbildung der B-Zellen, liefern die für eine optimale Prägung und Gedächtnisbildung der CD8+-zytotoxischen T-Zellen nötige 'Hilfe' und aktivieren die mikrobizide Funktion von Makrophagen. Ein Teil der Zellen persistiert nach Antigen-Clearance als langlebige zentrale und Effektor-Gedächtniszellen. CD4+-T-Zellen sind das Hauptziel von HIV, dessen fortschreitende Dezimierung dieser Population der Immunschwäche bei AIDS zugrunde liegt.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human helper T cell (CD4+ T lymphocyte), a small round agranulocyte of the adaptive immune system, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is small and round, its plasma membrane fringed with short microvilli. A neat quarter cut-away reveals the interior: an enormous round nucleus filling most of the cell volume with dark, dense clumps of heterochromatin concentrated at the nuclear periphery and a small pale nucleolus inside, leaving only a very thin rim of cytoplasm around it. In that thin cytoplasmic rim show fine stippled free ribosomes/polyribosomes, a couple of small oval mitochondria, a compact small Golgi apparatus near a slight nuclear indentation, and a tiny centriole pair (MTOC) beside the Golgi. Just under the plasma membrane, a faint cortical mesh suggests the actin cytoskeleton. On the outer membrane, a few small paired receptor-stub shapes (representing the TCR-CD3 complex with its CD4 co-receptor) stud the surface. Anatomically faithful eukaryotic immune cell. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, cytoplasmic granules, a multi-lobed nucleus, a biconcave disc shape, a whip-like flagellum, or beating cilia; this is NOT a bacterium, NOT a plant cell, NOT a granulocyte and NOT a red blood cell. The cytoplasm must stay a thin rim — do not draw a large, roomy cytoplasm dwarfing the nucleus. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human helper T cell (T lymphocyte), centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a small round body densely covered in fine, short ruffled microvilli and membrane folds giving a subtly shaggy, wrinkled surface texture. Render true 3D surface texture with crisp fine detail on every microvillus, shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm orange-to-gold cell surface with brighter yellow highlights on the raised microvilli ridges, deep red-brown in the recessed folds, set on a completely empty near-black background (no substrate texture needed). SEM shows the outer surface only, so render NO internal organelles, no nucleus. Anatomically faithful, single specimen only, no other cells nearby. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human helper T cell (CD4+ T lymphocyte), a small round agranulocyte of the adaptive immune system, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane, whose surface is fringed with fine short microvilli. The cell is small and round. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so the structures are clearly distinguishable: an enormous round nucleus filling most of the cell body with visibly dense, dark clumped heterochromatin at its periphery and a small glowing nucleolus, leaving only a thin glassy rim of cytoplasm around it. Within that thin rim show fine speckled free ribosomes, a couple of small oval mitochondria with faint inner cristae, a small Golgi stack near a slight nuclear indentation, and a tiny centriole pair beside it, with a faint cortical mesh just under the membrane suggesting the actin cytoskeleton. On the outer membrane, a scatter of small paired receptor-stub shapes (TCR-CD3 with CD4 co-receptor) are visible. Natural biological colours (soft warm cytoplasm, deep violet-blue nucleus), not near-monochrome and not neon. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, cytoplasmic granules, a multi-lobed nucleus, a biconcave disc, a whip-like flagellum, or beating cilia; this is a small agranulocyte lymphocyte, not a bacterium, not a plant cell, not a granulocyte and not a red blood cell. The cytoplasm must stay a thin rim around the dominant nucleus. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human helper T cell (CD4+ T lymphocyte) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is small and round, its outline fringed with delicate ink-drawn microvilli. A delicate painterly cut-away reveals the interior: a very large round nucleus dominating the cell, painted with a deep wash and fine ink stippling/hatching for dense clumped heterochromatin at its rim and a small pale nucleolus inside, leaving only a thin painted rim of cytoplasm around it. In that thin rim, fine ink dots suggest free ribosomes, with a small oval mitochondrion or two, a tiny curved Golgi stack near the nucleus, and a small centriole pair beside it, plus a fine ink line suggesting the cortical cytoskeleton just under the membrane. A few small paired receptor-stub marks on the outer membrane suggest the TCR-CD4 complex. Single specimen, anatomically faithful eukaryotic immune cell. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, cytoplasmic granules, a multi-lobed nucleus, a biconcave disc, a whip-like flagellum, or beating cilia. The cytoplasm must stay a thin rim, not a roomy body dwarfing the nucleus. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1721 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 25.3s — pass (gemini-2.5-flash-image; muted desaturated educational palette, thin clean outlines, correct cutaway showing dominant nucleus with peripheral heterochromatin clumps, small nucleolus, thin cytoplasmic rim with free-ribosome stipple, mitochondria, Golgi, centriole pair, cortical cytoskeleton hint and paired TCR-CD3/CD4 receptor stubs on the microvillus-fringed membrane; matches cocci/rod-bacterium house look, no border, single specimen)
  ![textbook 1](theme/textbook/helper-t-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/helper-t-cell.textbook.svg)
[interactive SVG](theme/textbook/helper-t-cell.textbook.svg) · [HTML](theme/textbook/helper-t-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1521 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.6s — pass (gemini-2.5-flash-image; single round cell densely covered in fine ruffled microvilli/membrane folds, warm orange-gold false colour with brighter ridge highlights, crisp 3D surface texture, clean near-black background, no internal structures shown as expected for SEM, no text/border, matches the real T-lymphocyte SEM reference closely)
  ![sem 1](theme/sem/helper-t-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1695 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 21.4s — pass (gemini-2.5-flash-image; natural warm translucent cytoplasm and deep violet-blue nucleus, soft global illumination and rim light, subsurface scattering on the microvillus-fringed membrane, visible heterochromatin clumps, nucleolus, mitochondria, Golgi, centriole pair and cortical mesh, clean dark studio background, no border, not neon/monochrome)
  ![3d 1](theme/3d/helper-t-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/helper-t-cell.3d.svg)
[interactive SVG](theme/3d/helper-t-cell.3d.svg) · [HTML](theme/3d/helper-t-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1689 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.6s — pass (gemini-2.5-flash-image; warm aged paper fills the entire frame edge-to-edge with a soft darker wash halo directly on the paper (no mat/frame/sheet-on-surface), fine ink linework, dominant nucleus with heterochromatin stippling and pale nucleolus, thin cytoplasmic rim with mitochondria/centrioles/receptor stubs, delicate ink microvilli fringe, matches cocci/rod-bacterium watercolor house look)
  ![watercolor 1](theme/watercolor/helper-t-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/helper-t-cell.watercolor.svg)
[interactive SVG](theme/watercolor/helper-t-cell.watercolor.svg) · [HTML](theme/watercolor/helper-t-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · CC BY 2.0 · NIAID (National Institute of Allergy and Infectious Diseases), via Flickr — pass (Wikimedia Commons 'T_Lymphocyte.jpg', NIAID CC BY 2.0 colorized SEM of a single human T lymphocyte; densely ruffled microvillus surface, clean background, no baked-in text/scale bar, used as-is; caveat noted in render.md that light/EM cannot distinguish CD4 from CD8 by shape alone)
  ![reference](theme/sem/helper-t-cell.attempts/real-01__SEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | use as final; accurate cutaway lymphocyte matching exemplar palette/line style |
| sem | pass | 1 | use as final; accurate microvillus-covered surface, correct false-colour SEM rendering, matches real reference |
| 3d | pass | 1 | use as final; correct internal layering and natural biological tints |
| watercolor | pass | 1 | use as final; full-bleed aged-paper composition with correct structures |
