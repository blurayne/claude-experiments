# Mycobacterium tuberculosis (TB) — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `mycobacterium-tuberculosis`
**Short description:** Slender, waxy-coated acid-fast rod (~0.2–0.5 × 2–4 µm) that hides inside macrophages and can lurk in the lungs for years; the cause of tuberculosis.

Metadata sidecar: [`mycobacterium-tuberculosis.render.meta.json`](mycobacterium-tuberculosis.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Mycobacterium tuberculosis* is a slender, straight or slightly curved rod (bacillus), roughly 2–4 µm long and only 0.2–0.5 µm wide — noticeably thinner and more delicate than a typical *E. coli* rod. It is a non-motile, non-spore-forming, obligate aerobe. Its defining feature is an unusually thick, waxy, lipid-rich cell envelope. From the inside out the envelope is: the plasma membrane; a peptidoglycan layer; a covalently-linked arabinogalactan layer; and then the **mycomembrane** — an outer membrane built largely of very long-chain **mycolic acids** (the "wax") — all wrapped in an outermost loose **capsule-like layer** of glucan, proteins and lipids. This waxy wall makes the cell acid-fast (it retains carbol-fuchsin in Ziehl–Neelsen staining) and lets it survive inside macrophages. The cytoplasm holds a diffuse nucleoid (single circular chromosome, condensed and irregular — not a tidy loop), many tiny ribosomes, and often round **lipid inclusion bodies** used for energy storage. On a smear the cells frequently line up side-by-side into serpentine **cords** (an effect of the surface lipid "cord factor", trehalose dimycolate), and stain unevenly, giving a beaded appearance.

Sources: [NCBI *Medical Microbiology* ch.33 — Mycobacteria](https://www.ncbi.nlm.nih.gov/books/NBK8611/), [StatPearls — *Mycobacterium tuberculosis* (NBK559067)](https://www.ncbi.nlm.nih.gov/books/NBK559067/), [Mycobacterial cell envelope review, PMC2995648](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2995648/), [CDC PHIL #9997/#8438 caption (morphometrics)](https://phil.cdc.gov/Details.aspx?pid=9997).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `capsule` | capsula | Capsule (outer layer) | Kapsel (äußere Schicht) | loose glucan/protein/lipid coat; immune evasion | outermost | core |
| `mycolic_acid` | acida mycolica (mycomembrana) | Mycolic-acid layer | Mykolsäure-Schicht | waxy outer membrane; acid-fastness, impermeability | outer envelope | core (defining) |
| `arabinogalactan` | stratum arabinogalactani | Arabinogalactan layer | Arabinogalaktan-Schicht | sugar layer linking wax to peptidoglycan | mid envelope | core |
| `peptidoglycan` | paries peptidoglycani | Peptidoglycan cell wall | Peptidoglykan-Zellwand | mesh giving shape and strength | inner envelope | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | transport, energy/respiration | innermost boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nukleoid | circular chromosome, diffuse tangle | central | core |
| `ribosome` | ribosoma (70S) | Ribosome | Ribosom | protein synthesis | dispersed dots | core |
| `lipid_body` | inclusio lipidica | Lipid inclusion body | Lipideinschluss | energy/lipid storage | cytoplasm, few | common |

### Do NOT draw (scientifically misleading)
- **Flagella** — *M. tuberculosis* is **non-motile**; no whip-like tails.
- **Pili / fimbriae** — do not fringe it with conspicuous hair-like appendages.
- **Endospores** — it does **not** form spores (not a *Bacillus*/*Clostridium*).
- **Mesosome** — an EM fixation artifact, not real.
- A **single thin Gram-negative-style outer membrane** — the envelope must read as a **thick, waxy, multilayered** wall, not a thin double line.
- Nucleoid as a tidy free-floating DNA loop — it is a **diffuse condensed tangle**.
- Any membrane-bound organelles (no nucleus, mitochondria, ER, Golgi).
- Fat, sausage-shaped *E. coli* proportions — TB is **slender** (length ≈ 8–12× the width).

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #8438** scanning electron micrograph of *Mycobacterium tuberculosis* — public domain (CDC / Dr. Ray Butler; Janice Carr, 2006). Shows the characteristic slender, ridged rods, several lying in a loose cord.
- file (direct): https://upload.wikimedia.org/wikipedia/commons/c/cb/Mycobacterium_tuberculosis.jpg
- page: https://commons.wikimedia.org/wiki/File:Mycobacterium_tuberculosis.jpg · License: **Public Domain (PD-USGov-HHS-CDC, PHIL #8438)** · CDC / Dr. Ray Butler; Janice Carr
- colorized counterpart: PHIL #9997 (same field, digitally colorized) — also public domain.
- AI visual verification: see §5. The raw file is a **greyscale** SEM; a cleaned version with a tasteful natural false-colour (and any baked text/scale cropped) is produced with `edit_image.py` for display.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Mycobacterium tuberculosis, a slim little rod wrapped in a thick, waxy coat like a tiny raincoat that nothing can get through. That waxy armor lets it hide inside the very cells that are supposed to gobble it up, curling into a snug hideout deep in the lungs, sometimes for years without anyone noticing. It spreads through the air when someone coughs, so covering your mouth really matters. If it does wake up and cause trouble, doctors have special long-course medicines that can clear it out for good.  
🇩🇪 Das ist Mycobacterium tuberculosis, ein schlankes Stäbchen in einem dicken, wachsigen Mantel wie ein winziger Regenschutz, durch den nichts hindurchkommt. Dieser wachsige Panzer lässt es sich sogar in den Zellen verstecken, die es eigentlich auffressen sollen, tief in der Lunge, manchmal jahrelang, ohne dass es jemand merkt. Es verbreitet sich durch die Luft, wenn jemand hustet, darum ist Husten in die Armbeuge so wichtig. Wacht es doch auf und macht Ärger, gibt es beim Arzt eine spezielle Kur mit mehreren Medikamenten, die es dauerhaft vertreibt.

**Adults (popular science, health).**  
🇬🇧 Mycobacterium tuberculosis is the bacterium behind tuberculosis, one of humanity's oldest and most persistent infectious diseases. Its unusually thick, lipid-rich cell wall makes it slow-growing but remarkably tough, letting it survive for years inside the very immune cells sent to destroy it, walled off in dormant lung lesions with no symptoms at all. Only about one in ten latent infections ever progresses to active disease, usually when the immune system is weakened by age, illness or malnutrition, at which point it causes the classic cough, weight loss and night sweats. TB spreads through airborne droplets from a cough, and treatment requires a demanding multi-drug antibiotic course lasting several months, since cutting it short breeds drug-resistant strains.  
🇩🇪 Mycobacterium tuberculosis ist der Erreger der Tuberkulose, einer der ältesten und hartnäckigsten Infektionskrankheiten der Menschheit. Seine ungewöhnlich dicke, fettreiche Zellwand macht es langsam wachsend, aber erstaunlich widerstandsfähig: Es kann jahrelang in genau jenen Immunzellen überleben, die es eigentlich zerstören sollen, eingekapselt in ruhenden Lungenherden ganz ohne Symptome. Nur etwa jede zehnte latente Infektion entwickelt sich je zur aktiven Erkrankung, meist wenn das Immunsystem durch Alter, Krankheit oder Mangelernährung geschwächt ist; dann folgen der typische Husten, Gewichtsverlust und Nachtschweiß. TB verbreitet sich über Tröpfchen beim Husten, und die Behandlung erfordert eine anspruchsvolle Mehrfach-Antibiotikatherapie über mehrere Monate, denn ein zu früher Abbruch züchtet resistente Stämme heran.

**Scientific.**  
🇬🇧 Mycobacterium tuberculosis is a slow-growing, obligate aerobic, non-motile, acid-fast bacillus (~0.2-0.5 x 2-4 um) whose defining feature is a mycolic-acid-rich mycomembrane sitting outside an arabinogalactan-peptidoglycan complex, conferring low permeability, acid-fastness and resistance to desiccation and many antibiotics. Following inhalation, bacilli are phagocytosed by alveolar macrophages but arrest phagosome maturation via lipoarabinomannan and other cell-wall lipids, allowing intracellular persistence and replication. Recruited macrophages, dendritic cells and T lymphocytes organize into a granuloma that contains but rarely sterilizes the infection, producing a latent state maintained largely by CD4+ Th1 cells secreting IFN-gamma; reactivation occurs when this containment fails. Cell-wall lipids such as trehalose dimycolate (cord factor) also promote the serpentine cording seen on smear and contribute to virulence and immune modulation.  
🇩🇪 Mycobacterium tuberculosis ist ein langsam wachsendes, obligat aerobes, unbewegliches, säurefestes Stäbchenbakterium (ca. 0,2-0,5 x 2-4 um), dessen Kennzeichen eine mykolsäurereiche Mykomembran außerhalb eines Arabinogalaktan-Peptidoglykan-Komplexes ist, die geringe Permeabilität, Säurefestigkeit sowie Resistenz gegen Austrocknung und viele Antibiotika verleiht. Nach Inhalation werden die Bazillen von Alveolarmakrophagen phagozytiert, blockieren jedoch mittels Lipoarabinomannan und anderer Zellwandlipide die Phagosomenreifung, was intrazelluläres Überleben und Vermehrung ermöglicht. Rekrutierte Makrophagen, dendritische Zellen und T-Lymphozyten formen ein Granulom, das die Infektion eindämmt, aber selten vollständig eliminiert; der latente Zustand wird vor allem durch IFN-gamma-sezernierende CD4+-Th1-Zellen aufrechterhalten, und eine Reaktivierung erfolgt, wenn diese Kontrolle versagt. Zellwandlipide wie Trehalose-Dimycolat (Cord-Faktor) fördern zudem die im Ausstrich sichtbare schlangenartige Verklumpung und tragen zur Virulenz und Immunmodulation bei.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE Mycobacterium tuberculosis bacterium, centered in a square 1:1 1080x1080 frame that is filled edge-to-edge with a neutral dark charcoal background (NO border, frame, vignette, letterbox, and NOT a paper sheet on a surface). Refined, elegant educational style matching a muted, sophisticated, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours); THIN clean outlines (never heavy black strokes); gentle soft shading with subtle dimensionality; each structure its own distinct soft colour fill; generous negative space around structures for later labels. Morphology: a SLENDER, straight or gently curved rod with rounded ends, distinctly thin and delicate (length about 8 to 12 times the width), NOT a fat sausage. A quarter cut-away reveals the interior: pale cytoplasm, a diffuse condensed nucleoid drawn as a soft irregular tangle (NOT a tidy DNA loop), tiny numerous randomly scattered ribosome dots, and one or two small round lipid inclusion bodies. The signature THICK, WAXY, MULTILAYERED envelope reads as clearly distinct concentric layers: an innermost plasma membrane, then a peptidoglycan wall, then an arabinogalactan layer, then a prominent waxy mycolic-acid outer layer (the mycomembrane), all wrapped in a soft outer capsule-like halo. Do NOT draw flagella, pili, fimbriae, endospores, a mesosome, or any membrane-bound organelles; the envelope must look thick and waxy, not a thin double Gram-negative line. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of Mycobacterium tuberculosis, filling the square 1:1 1080x1080 frame edge-to-edge (NO black border, frame, vignette or letterbox). One or two SLENDER, straight or slightly curved rod-shaped bacteria with smoothly rounded ends and a subtly ridged, waxy surface texture, lying at a gentle three-quarter angle on a subtly textured neutral substrate, shallow depth of field so the ends fall softly out of focus. The rods are distinctly thin and delicate (length roughly 8 to 12 times the width), not fat. False-color palette: warm amber-to-orange bacteria against a dark, uncluttered charcoal-grey background, cool studio microscopy lighting. Show only the true smooth-to-slightly-wrinkled surface; NO flagella, NO pili or hair-like appendages, NO spores. SEM shows surface only, so render NO internal structures. Looks like a real SEM plate. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Stylized semi-realistic 3D medical-illustration still of a SINGLE Mycobacterium tuberculosis bacterium, centered in a square 1:1 1080x1080 frame filled edge-to-edge with a clean seamless dark studio background (NO border, frame, vignette or letterbox, NOT a sheet on a surface). Soft global illumination, gentle rim light, subsurface scattering on the membranes. Morphology: a SLENDER, gently curved rod with rounded ends, idealized-for-clarity but believable, distinctly thin (length about 8 to 12 times the width). Colorize with natural, believable biological tones so structures are clearly distinguishable, not neon and not near-monochrome: a warm translucent cell body; the thick waxy envelope shown as distinct concentric layers - inner plasma membrane, peptidoglycan wall, arabinogalactan layer, and a prominent glossy waxy mycolic-acid outer layer - wrapped in a faint translucent outer capsule. A gentle cut-away or translucency hints at the interior: soft cytoplasm, a diffuse condensed nucleoid as an irregular tangle (NOT a tidy DNA ring), tiny numerous scattered ribosomes, and one or two round lipid inclusion bodies. Do NOT render flagella, pili, fimbriae, endospores, a mesosome, or any membrane-bound organelles. Scientific-animation look, anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted watercolour naturalist scientific plate of a SINGLE Mycobacterium tuberculosis bacterium in the style of a 19th-century atlas, anatomically modern and correct. The warm aged paper FILLS THE ENTIRE FRAME edge-to-edge and corner-to-corner - the cream paper IS the background; do NOT render a separate sheet, card, mat, border, frame, drop-shadow or panel. Single specimen large and centred with a soft darker wash halo painted directly on the paper behind it. Soft translucent washes with fine ink linework for outlines, rich but muted tints. Morphology: a SLENDER, gently curved rod with rounded ends, distinctly thin and delicate (length about 8 to 12 times the width), NOT a fat sausage. A soft painterly cut-away hints at the interior: washed cytoplasm, a diffuse condensed nucleoid painted as a loose irregular tangle (NOT a tidy loop), tiny numerous randomly dispersed ribosome specks, and one or two small round lipid inclusion bodies. The thick waxy envelope shows distinct layers: inner plasma membrane, peptidoglycan wall, arabinogalactan layer, and a prominent waxy mycolic-acid outer layer, wrapped in a faint outer capsule. Do NOT paint flagella, pili, fimbriae, endospores, a mesosome, or any membrane-bound organelles. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1651 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 10.8s — PASS — slender rod (~8–12x longer than wide, not a fat E. coli sausage), quarter cutaway with clearly distinct concentric envelope layers (plasma membrane, peptidoglycan, arabinogalactan, waxy mycolic-acid mycomembrane, outer capsule halo), diffuse irregular nucleoid tangle, scattered ribosome dots, two round lipid inclusion bodies; no flagella/pili/spores/mesosome; muted refined palette matching the rod-bacterium/parasite textbook house look; dark charcoal background fills the frame edge-to-edge; no baked text. Chosen as label base.
  ![textbook 1](theme/textbook/mycobacterium-tuberculosis.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/mycobacterium-tuberculosis.textbook.svg)
[interactive SVG](theme/textbook/mycobacterium-tuberculosis.textbook.svg) · [HTML](theme/textbook/mycobacterium-tuberculosis.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1519 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.0s — PASS — photorealistic false-colour SEM, one or two slender ridged rods (thin, not fat), warm amber-orange colour against a dark uncluttered charcoal background filling the frame edge-to-edge, no appendages, no text, no border.
  ![sem 1](theme/sem/mycobacterium-tuberculosis.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1597 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.8s — PASS — natural warm amber/gold cell body with clearly distinguishable concentric envelope layers (rose/green/blue tints) plus a translucent waxy mycomembrane, diffuse nucleoid tangle rendered with subsurface glow, magenta ribosome dots, two lipid inclusion bodies, slender rod proportions, clean dark studio background edge-to-edge, no text.
  ![3d 1](theme/3d/mycobacterium-tuberculosis.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/mycobacterium-tuberculosis.3d.svg)
[interactive SVG](theme/3d/mycobacterium-tuberculosis.3d.svg) · [HTML](theme/3d/mycobacterium-tuberculosis.3d.html)

### Watercolor plate (`watercolor`) — 3 attempt(s), 4927 tok, $0.116
- attempt 1 · `gemini-2.5-flash-image` · 59.4s — FAIL — letters/text-like glyphs are baked into the nucleoid tangle (looks like embossed lettering), unacceptable per no-baked-text rule.
  ![watercolor 1](theme/watercolor/mycobacterium-tuberculosis.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 34.8s — FAIL — morphology broken: one pole balloons into an odd round pink-mottled head instead of a slender rounded rod end; wash halo is patchy rather than a clean full-bleed paper background.
  ![watercolor 2](theme/watercolor/mycobacterium-tuberculosis.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 15.3s — PASS — slender rod with gently rounded ends, warm aged paper fills the frame edge-to-edge with a soft darker wash halo directly behind the specimen (no sheet-on-surface/mat), fine ink linework, distinct concentric envelope layers (capsule/mycolic-acid/arabinogalactan visible as separate washes), diffuse nucleoid tangle, ribosome specks, two lipid inclusion bodies, no text. Chosen as label base.
  ![watercolor 3](theme/watercolor/mycobacterium-tuberculosis.attempts/gen-03__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/mycobacterium-tuberculosis.watercolor.svg)
[interactive SVG](theme/watercolor/mycobacterium-tuberculosis.watercolor.svg) · [HTML](theme/watercolor/mycobacterium-tuberculosis.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public Domain (PD-USGov-HHS-CDC, PHIL #8438) · CDC / Dr. Ray Butler; Janice Carr (2006) — PASS — CDC PHIL #8438 SEM (public domain), cleaned with edit_image.py to remove the baked caption/scale and apply a natural warm false-colour; shows a loose cluster of slender, ridged, waxy rods lying in a cord — individually readable and scientifically apt (cord factor produces this serpentine clumping), so a group image is acceptable here.
  ![reference](../reference-microscopy/theme/sem/mycobacterium-tuberculosis.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | clean concentric-layer cutaway, refined muted palette, matches house style |
| sem | ✅ teaching-ready | 1 | slender ridged false-colour rod, no border, no text |
| 3d | ✅ teaching-ready (label base) | 1 | natural biological tints, layered envelope, plasmids/lipid bodies inside |
| watercolor | ✅ teaching-ready (label base) | 3 | re-rendered twice: attempt 1 had baked-in lettering in the nucleoid, attempt 2 had a broken balloon-shaped pole; attempt 3 is a clean full-bleed naturalist plate |
| reference SEM | ✅ verified + cleaned | 2 | CDC PHIL #8438, public domain, cording rods, cleaned of caption/scale and false-coloured |
