# Streptococcus pneumoniae — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `streptococcus-pneumoniae`
**Short description:** Lancet-shaped Gram-positive coccus in pairs and short chains, wrapped in a thick polysaccharide capsule; leading cause of pneumonia, otitis media and meningitis.

Metadata sidecar: [`streptococcus-pneumoniae.render.meta.json`](streptococcus-pneumoniae.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Streptococcus pneumoniae* (the pneumococcus) is a Gram-positive coccus, but not a tidy sphere: individual cells are ovoid to lancet- (flame-) shaped, roughly 0.5–1.25 µm across. They divide in one plane and typically stay attached in **pairs (diplococci)**, flattened against each other at the shared pole, or in **short chains**, rather than the grape-like clusters of staphylococci or the long chains of other streptococci. The cell is non-motile (no flagella) and forms no endospores. Like other Gram-positives it has a single thick peptidoglycan cell wall (no outer membrane), decorated with **teichoic acid** — including a choline-containing form unique to pneumococci that anchors choline-binding surface proteins and autolysin. Outside the wall sits the single most important virulence determinant: a thick **polysaccharide capsule**, present in over 100 chemically distinct serotypes, which physically shields the bacterium from phagocytosis until serotype-specific antibodies and complement opsonise it. A subset of clinical strains also carries thin proteinaceous **pili** used for adhesion to host epithelium. Internally it has the standard bacterial layout: cytoplasm, a diffuse nucleoid (not a neat loop), and dense, randomly scattered ribosomes.

Sources: [CDC — Pneumococcal Disease: Clinical Overview](https://www.cdc.gov/pneumococcal/hcp/clinical-overview/index.html), [NCBI StatPearls — *Streptococcus pneumoniae*](https://www.ncbi.nlm.nih.gov/books/NBK470539/), [Kadioglu et al. 2008, *Nat Rev Microbiol* — pneumococcal virulence factors (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC2504403/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `capsule` | capsula polysaccharidica | Capsule | Kapsel | antiphagocytic shield; >100 serotypes; main vaccine target | outermost, enveloping the pair | core (virulent strains) |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall | Zellwand | single thick Gram-positive peptidoglycan layer: shape, rigidity | outer boundary | core |
| `teichoic_acid` | acidum teichoicum | Teichoic acid | Teichonsäure | choline-bearing polymer threaded through the wall; anchors surface proteins/autolysin | within/on the cell wall | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | transport, energy/respiration | innermost boundary | core |
| `division_septum` | septum divisionale | Division septum | Trennwand (Septum) | cross-wall where the two paired cells last divided | between the diplococcus pair | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nucleoid | circular chromosome; essential genes | central, diffuse | core |
| `ribosome` | ribosoma (70S) | Ribosome | Ribosom | protein synthesis | dispersed dots | core |
| `pilus` | pilus adhesivus | Pilus | Pilus | adhesion to host epithelium | surface, few, thin | variable (subset of strains) |

### Do NOT draw (scientifically misleading)
- **Flagella** — the pneumococcus is non-motile; never draw whip-like appendages.
- **Endospores** — it does not sporulate.
- **An outer membrane / LPS** — this is a Gram-positive cell (single peptidoglycan wall only), not Gram-negative; no second membrane.
- **Perfectly round spheres** — real cells are ovoid/lancet-shaped and visibly flattened where paired; a row of plain circles is wrong.
- **Mesosome** — EM fixation artifact, not real.
- **Capsule omitted** — unlike optional appendages, the capsule is the organism's defining feature and should always be visible (except in SEM, which cannot resolve it).
- **Long chains like other streptococci** — pneumococci are typically pairs or short (2–4 cell) chains, not long beaded strands.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #262**, a scanning electron micrograph showing a diplococcus pair plus a second small pair/chain of *Streptococcus pneumoniae* — public domain.
- file: https://upload.wikimedia.org/wikipedia/commons/2/20/Streptococcus_pneumoniae.jpg
- page: https://commons.wikimedia.org/wiki/File:Streptococcus_pneumoniae.jpg · License: **Public Domain (CDC PHIL #262)** · CDC/Janice Carr; content provider CDC/Dr. Richard Facklam
AI visual verification result: **PASS (2026-08-13).** Shows two clearly readable groupings of ovoid, granular-surfaced cocci — a tight diplococcus pair with a small satellite cell, and a second pair/chain start — an accurate single-field teaching reference for pneumococcal morphology. Caveat: the raw download is greyscale with no baked-in text/scale bar. A **cleaned, false-colorized version** was produced with `edit_image.py` (natural violet-blue cocci on a warm amber substrate) and is used for display — see §5.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Pneumococcus, a tiny round buddy that never travels alone - it always comes paired up with a twin, sometimes lined up in a short little train! It wraps itself in a squishy, slippery coat so it can hide from the body's patrol cells. Most of the time it just naps quietly in someone's nose without causing any trouble. But if it sneaks down into the lungs or ears, it can make someone cough a lot or get an achy earache. The good news: doctors have a special vaccine that teaches your body to spot its slippery coat early, so it never gets the chance to cause a fuss.  
🇩🇪 Das ist der Pneumokokkus, ein winziger runder Kumpel, der nie allein unterwegs ist - er reist immer mit seinem Zwilling, manchmal sogar als kleine Perlenkette! Er hüllt sich in einen glitschigen, schleimigen Mantel, damit ihn die Wachzellen des Körpers nicht so leicht erwischen. Meistens döst er einfach ganz ruhig in jemandes Nase, ohne Ärger zu machen. Wenn er sich aber in die Lunge oder ins Ohr schleicht, kann er starken Husten oder ein pochendes Ohrweh auslösen. Die gute Nachricht: Es gibt eine besondere Impfung, die dem Körper beibringt, den glitschigen Mantel früh zu erkennen, damit er gar nicht erst Unfug treiben kann.

**Adults (popular science, health).**  
🇬🇧 Streptococcus pneumoniae, the pneumococcus, is a lancet-shaped bacterium that typically sits in pairs or short chains and quietly colonises the nose and throat of many healthy people without ever causing harm. Its defining feature is a thick polysaccharide capsule, built in over ninety different chemical varieties, that shields it from being engulfed by immune cells. Trouble starts only if it spreads from its usual perch into the lungs, middle ear, sinuses or bloodstream, where it is a leading cause of pneumonia, ear infections and, more rarely, meningitis. Because the capsule is also what the immune system learns to recognise, pneumococcal vaccines that target its most common serotypes have dramatically cut severe disease in children and older adults.  
🇩🇪 Streptococcus pneumoniae, der Pneumokokkus, ist ein lanzettförmiges Bakterium, das meist paarweise oder in kurzen Ketten auftritt und bei vielen gesunden Menschen still in Nase und Rachen siedelt, ohne jemals Schaden anzurichten. Sein Erkennungsmerkmal ist eine dicke Polysaccharidkapsel in über neunzig chemisch unterschiedlichen Varianten, die es vor dem Verschlungenwerden durch Immunzellen schützt. Probleme entstehen erst, wenn es von seinem gewohnten Platz aus in die Lunge, das Mittelohr, die Nasennebenhöhlen oder die Blutbahn vordringt - dort zählt es zu den häufigsten Ursachen von Lungenentzündung, Ohrenentzündungen und, seltener, Hirnhautentzündung. Weil gerade die Kapsel das ist, was das Immunsystem erkennen lernt, haben Impfstoffe gegen die häufigsten Serotypen schwere Erkrankungen bei Kindern und älteren Menschen deutlich zurückgedrängt.

**Scientific.**  
🇬🇧 Streptococcus pneumoniae is a Gram-positive, alpha-haemolytic, non-motile diplococcus with a characteristic lancet or ovoid morphology, arranged in pairs or short chains rather than the long chains typical of other streptococci. Its cell wall carries choline-decorated teichoic acid that anchors a family of choline-binding surface proteins, including the autolysin LytA, and its dominant virulence determinant is a capsular polysaccharide expressed in more than ninety serotypes that impedes complement deposition and phagocytic uptake until opsonised by serotype-specific antibody. Additional factors, including pneumolysin, pilus adhesins and IgA1 protease, contribute to colonisation of the nasopharyngeal mucosa and, upon dissemination, to invasive disease such as pneumonia, otitis media, sinusitis, bacteraemia and meningitis. Capsule-based conjugate and polysaccharide vaccines, together with naturally acquired and vaccine-induced anticapsular antibody, remain the principal correlates of protection against pneumococcal disease.  
🇩🇪 Streptococcus pneumoniae ist ein grampositiver, alpha-hämolysierender, unbeweglicher Diplokokkus mit charakteristisch lanzett- bis eiförmiger Morphologie, der paarweise oder in kurzen Ketten auftritt und nicht in den langen Ketten anderer Streptokokken. Seine Zellwand trägt cholinhaltige Teichonsäure, die eine Familie cholinbindender Oberflächenproteine verankert, darunter das Autolysin LytA; sein wichtigster Virulenzfaktor ist eine Kapselpolysaccharidhülle in mehr als neunzig Serotypen, die die Komplementablagerung und Phagozytose behindert, bis serotypspezifische Antikörper opsonisieren. Weitere Faktoren wie Pneumolysin, Pilus-Adhäsine und IgA1-Protease tragen zur Besiedlung der Nasen-Rachen-Schleimhaut und, bei Streuung, zu invasiven Erkrankungen wie Pneumonie, Otitis media, Sinusitis, Bakteriämie und Meningitis bei. Kapselbasierte Konjugat- und Polysaccharidimpfstoffe bleiben zusammen mit natürlich erworbenen und impfinduzierten Antikapsel-Antikörpern die wichtigsten Schutzkorrelate gegen Pneumokokkenerkrankungen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of Streptococcus pneumoniae, a SINGLE diplococcus pair (two lancet/flame-shaped, slightly oval Gram-positive cocci flattened against each other at their shared pole, forming a short chain of 3-4 similar cells trailing off softly), centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Semi-flat vector-style shading with crisp clean boundaries and a MUTED, sophisticated, slightly desaturated educational palette (soft dusty tints, never bright cartoon colours), thin clean outlines, gentle soft shading, on a neutral dark-charcoal uncluttered background. A thick translucent polysaccharide capsule envelopes the whole chain as a soft glassy halo. A neat quarter cut-away on the front-most cell reveals: the thick single-layer Gram-positive peptidoglycan cell wall with fine teichoic-acid fibrils threaded through it, an inner plasma membrane, pale cytoplasm, a diffuse condensed nucleoid shown as a soft irregular tangle (NOT a tidy free-floating DNA loop), and tiny numerous randomly dispersed ribosomes (not oversized or orderly). A visible flat division septum sits at the junction between the two paired cells. A few short fine pili dot the capsule surface. Do NOT draw flagella, an outer membrane, endospores, or a mesosome. Anatomically faithful, no perfectly round spheres (cells are ovoid/lancet-shaped). Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of Streptococcus pneumoniae, a small cluster of 3-4 lancet/oval Gram-positive cocci arranged as a diplococcus pair plus a short chain, centered in a square 1:1 1080x1080 frame with generous empty margin around it. Each coccus is a plump, slightly ovoid ball with a finely granular, bumpy surface texture, gently flattened where it touches its neighbour. Render true 3D surface texture, shallow depth of field so out-of-frame cells fall softly out of focus, and a subtly textured neutral substrate beneath it with a few small pores. False-color palette: soft violet-blue cocci against a warm amber-bronze background. SEM shows surface only, so render NO internal structures and no visible capsule (capsule is not resolved by SEM). Anatomically faithful, single small grouping only, no dense clumps obscuring individual cells. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of Streptococcus pneumoniae, a SINGLE diplococcus pair of lancet/flame-shaped, slightly oval Gram-positive cocci flattened against each other, with a short chain of a couple more cells trailing softly away, centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, and a clean seamless dark studio background. Colorize with natural, believable biological tones so structures are clearly distinguishable: a warm translucent cytoplasm, a thick glassy pale-gold capsule enveloping the chain like a soft gel halo, a distinct violet-tinted peptidoglycan cell wall with fine teichoic-acid threads, and a pale membrane layer. Use a partial cut-away or gentle translucency on the front cell to hint at the interior: soft cytoplasm, a diffuse condensed nucleoid as an irregular blue tangle (NOT a tidy DNA ring), and tiny numerous randomly scattered ribosome dots. A visible flat division septum sits between the two paired cells. A few fine pili stipple the capsule surface. Do NOT render flagella, an outer membrane, endospores, or a mesosome. Anatomically faithful, no perfectly round spheres (ovoid/lancet-shaped cells). Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of Streptococcus pneumoniae in the style of a 19th-century atlas, a SINGLE diplococcus pair of lancet/oval Gram-positive cocci flattened against one another with a short chain of a couple more cells trailing off, centered in a square 1:1 1080x1080 frame with generous margin, anatomically modern and correct. Soft translucent watercolor washes with fine ink outlines, warm aged-paper texture that fills the entire frame edge-to-edge as the background itself (no sheet, mat, frame or table under the paper). A soft darker wash halo sits directly on the paper behind the specimen. The cells are gently ovoid, not perfectly round, with a thin painted capsule halo surrounding the pair like a pale glassy wash. A soft painterly cut-away on the front cell hints at the interior: washed cytoplasm, a diffuse condensed nucleoid painted as a loose irregular tangle (NOT a tidy DNA loop), fine teichoic-acid threads within the thick single cell wall layer, and tiny numerous randomly dispersed ribosome specks. A faint division septum line sits between the paired cells. A few delicate pili fringe the capsule. Do NOT paint flagella, an outer membrane, endospores, or a mesosome. Single diplococcus grouping, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 3 attempt(s), 5720 tok, $0.126
- attempt 1 · `gemini-2.5-flash-image` · 24.0s — fail (flash-image, wrong flat cartoon composition, superseded)
  ![textbook 1](theme/textbook/streptococcus-pneumoniae.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-3-pro-image` · 25.4s — fail (gemini-3-pro-image, minor composition issues, superseded)
  ![textbook 2](theme/textbook/streptococcus-pneumoniae.attempts/gen-02__gemini-3-pro-image.avif)
- attempt 3 · `gemini-3-pro-image` · 26.9s — pass (gemini-3-pro-image; accurate diplococcus cutaway matching cocci/rod-bacterium exemplar palette and line style)
  ![textbook 3](theme/textbook/streptococcus-pneumoniae.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/streptococcus-pneumoniae.textbook.svg)
[interactive SVG](theme/textbook/streptococcus-pneumoniae.textbook.svg) · [HTML](theme/textbook/streptococcus-pneumoniae.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1509 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 15.8s — pass (gemini-2.5-flash-image; sharp lancet-shaped diplococcus + short-chain grouping, granular surface texture, violet-blue false colour on warm substrate, matches sem exemplar)
  ![sem 1](theme/sem/streptococcus-pneumoniae.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3157 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 16.9s — fail (gemini-2.5-flash-image, weaker composition, superseded)
  ![3d 1](theme/3d/streptococcus-pneumoniae.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 28.9s — pass (gemini-2.5-flash-image; short chain of touching cells with clear capsule/cell-wall/membrane/cytoplasm/nucleoid/ribosome layers, natural biological tints, no border)
  ![3d 2](theme/3d/streptococcus-pneumoniae.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/streptococcus-pneumoniae.3d.svg)
[interactive SVG](theme/3d/streptococcus-pneumoniae.3d.svg) · [HTML](theme/3d/streptococcus-pneumoniae.3d.html)

### Watercolor plate (`watercolor`) — 3 attempt(s), 5297 tok, $0.119
- attempt 1 · `gemini-2.5-flash-image` · 22.3s — fail (gemini-2.5-flash-image, unclear composition, superseded)
  ![watercolor 1](theme/watercolor/streptococcus-pneumoniae.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 21.0s — fail (gemini-2.5-flash-image; satellite cells connected by a thin stalk/tube instead of touching at a shared pole - misleading, reads as a stalked organism not a diplococcus)
  ![watercolor 2](theme/watercolor/streptococcus-pneumoniae.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 32.6s — pass (gemini-3-pro-image; cells now directly touching at a flattened shared pole, full-bleed aged paper matching cocci/rod-bacterium exemplar, all core structures visible)
  ![watercolor 3](theme/watercolor/streptococcus-pneumoniae.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/streptococcus-pneumoniae.watercolor.svg)
[interactive SVG](theme/watercolor/streptococcus-pneumoniae.watercolor.svg) · [HTML](theme/watercolor/streptococcus-pneumoniae.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public Domain (CDC PHIL #262) · CDC/Janice Carr; content provider CDC/Dr. Richard Facklam (PHIL #262) — pass (CDC PHIL #262 SEM, public domain; cleaned/false-colorized version used for display - clearly shows diplococcus pairs and a short chain)
  ![reference](../reference-microscopy/theme/sem/streptococcus-pneumoniae.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 3 | use as final; accurate cutaway diplococcus + short chain, matches exemplar palette/line style |
| sem | pass | 1 | use as final; accurate lancet-shaped diplococcus grouping, correct false-colour surface-only rendering |
| 3d | pass | 2 | use as final; short touching chain with correct internal layering and natural tints |
| watercolor | pass | 3 | use as final after one re-render to fix a misleading stalk-like connection between cells in attempt 2 |
