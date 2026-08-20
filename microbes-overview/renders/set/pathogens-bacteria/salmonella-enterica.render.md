# Salmonella enterica — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `salmonella-enterica`
**Short description:** Gram-negative, peritrichously flagellated enteric rod (~0.7–1.5 × 2–5 µm) spread by contaminated eggs and poultry; causes gastroenteritis or, for the typhoidal serovars, typhoid fever.

Metadata sidecar: [`salmonella-enterica.render.meta.json`](salmonella-enterica.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Salmonella enterica* is a Gram-negative, facultatively anaerobic, rod-shaped bacterium of the family *Enterobacteriaceae*. The cell is a straight cylinder with rounded poles, roughly 0.7–1.5 µm wide and 2–5 µm long (about 3–4× longer than wide). It is typically **motile by peritrichous flagella** — long wavy filaments emerging from all around the cell body (not a single polar tuft) — which carry the H-antigen. The Gram-negative envelope has three layers: an **outer membrane** studded with lipopolysaccharide (LPS) whose polysaccharide side-chains form the **O-antigen**, a **thin peptidoglycan cell wall** in the periplasm, and an inner **plasma membrane**. Short **fimbriae/adhesins** (e.g. type-1 and Saf/Fim fimbriae) dot the surface for attachment to gut epithelium. The genome sits in a diffuse **nucleoid**; many serovars also carry a **virulence plasmid** (e.g. pSLT in *S.* Typhimurium). Ribosomes (70S) are tiny, numerous and randomly dispersed. The typhoidal serovar *S.* Typhi additionally expresses a **Vi polysaccharide capsule** (most non-typhoidal serovars have no prominent capsule). *Salmonella* is a facultative intracellular pathogen: it uses Type III secretion systems (SPI-1/SPI-2 injectisomes, sub-microscopic) to invade enterocytes and survive inside macrophages.

Sources: [NCBI *Medical Microbiology* ch. 21 — *Salmonella* (Giannella)](https://www.ncbi.nlm.nih.gov/books/NBK8435/), [StatPearls — *Salmonella* (NCBI Bookshelf)](https://www.ncbi.nlm.nih.gov/books/NBK555892/), [CDC — *Salmonella* / Salmonellosis](https://www.cdc.gov/salmonella/index.html), [WHO — Salmonella (non-typhoidal) fact sheet](https://www.who.int/news-room/fact-sheets/detail/salmonella-(non-typhoidal)).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `capsule` | antigenum Vi (capsula) | Vi capsule (S. Typhi) | Vi-Kapsel (S. Typhi) | polysaccharide coat; masks LPS, resists complement/phagocytosis | outermost | typhoidal serovars only |
| `outer_membrane` | membrana externa (LPS, antigenum O) | Outer membrane (O-antigen LPS) | Äußere Membran (O-Antigen-LPS) | LPS/endotoxin barrier; O-antigen defines serotype | outside wall | core (Gram-neg) |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall (peptidoglycan) | Zellwand (Peptidoglykan) | thin peptidoglycan mesh: shape, resists turgor | periplasm | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | transport, energy/respiration | innermost boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nukleoid | circular chromosome; essential genes | central, diffuse | core |
| `plasmid` | plasmidum virulentiae | Virulence plasmid | Virulenzplasmid | accessory virulence/resistance genes (e.g. pSLT) | cytoplasm | frequent |
| `ribosome` | ribosoma (70S) | Ribosome | Ribosom | protein synthesis | dispersed dots | core |
| `flagellum` | flagellum (peritrichum, antigenum H) | Flagellum (peritrichous, H-antigen) | Geißel (peritrich, H-Antigen) | rotary propellers for swimming; H-antigen | all over surface | usual (motile) |
| `fimbria` | fimbria | Fimbriae | Fimbrien | short bristles: adhesion to gut epithelium | surface, many, short | usual |

### Do NOT draw (scientifically misleading)
- **Mesosome** — EM fixation artifact, not a real structure.
- **Single polar flagellum / one tuft** — *Salmonella* is **peritrichous** (flagella all around).
- **Gram-positive thick wall** — it is Gram-negative (thin peptidoglycan between two membranes); do not mix envelope types.
- Nucleoid as a tidy free-floating loop — it's a **diffuse condensed tangle**.
- Over-large / too-orderly ribosomes — they're tiny, numerous, random.
- Plasmids/organelles **outside** the cell body — keep them in the cytoplasm.
- Any membrane-bound organelles (no nucleus/mitochondria/ER/Golgi).
- A prominent capsule on a generic cell — the Vi capsule is **S. Typhi only** (optional).
- Any **face**/eyes/anthropomorphism.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **NIAID/RML color-enhanced SEM** of *Salmonella* Typhimurium (red rods) — public domain, features clearly readable.
- file: https://upload.wikimedia.org/wikipedia/commons/9/9d/SalmonellaNIAID.jpg
- page: https://commons.wikimedia.org/wiki/File:SalmonellaNIAID.jpg · License: **Public Domain (NIAID / Rocky Mountain Laboratories)** · NIAID RML, National Institutes of Health
- modality: **SEM** (false-colour). Backups: Wikimedia *Salmonella typhimurium* TEM (PD), CDC PHIL *Salmonella* plates (PD).
AI visual verification result: see §5 (populated after fetch + view). The classic NIAID plate shows a group of salmon-red rods with rounded poles on cultured cells — a group, but the rod morphology and rounded poles are clearly readable, satisfying the reference rule.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Salmonella, a tiny sausage-shaped germ with a bunch of wiggly tails it uses to swim like a little propeller. It loves to hitch a ride on raw eggs and undercooked chicken, and if it sneaks into your tummy it can throw a nasty party that gives you a tummy ache and lots of trips to the toilet. The good news: cooking eggs and chicken until they are piping hot roasts these germs before they ever reach your plate. And if one does slip through, plenty of rest and sipping water while your body clears it usually does the trick.  
🇩🇪 Das ist Salmonella, ein winziger würstchenförmiger Keim mit mehreren zappelnden Schwänzchen, mit denen er wie ein kleiner Propeller schwimmt. Am liebsten reist er auf rohen Eiern und halbgarem Hühnchen mit, und wenn er sich in deinen Bauch schleicht, feiert er eine fiese Party, die dir Bauchweh und viele Klogänge beschert. Die gute Nachricht: Wenn man Eier und Hühnchen richtig heiß durchgart, werden diese Keime schon vor dem Teller geröstet. Und rutscht doch mal einer durch, helfen meist viel Ruhe und Wasser trinken, während dein Körper ihn wieder loswird.

**Adults (popular science, health).**  
🇬🇧 Salmonella enterica is one of the most common causes of food poisoning worldwide. Most infections come from non-typhoidal serovars carried on contaminated poultry, eggs, and other animal products; they invade the gut lining and trigger the cramps, fever, and diarrhoea of salmonellosis, which is usually self-limiting and managed with fluids and rest. A few specialised serovars, Typhi and Paratyphi, are adapted to humans and cause typhoid fever, a serious bloodstream infection that needs antibiotics. Thorough cooking, hand-washing, and keeping raw meat away from ready-to-eat food are the practical defences, and vaccines exist against typhoid for travellers to high-risk regions.  
🇩🇪 Salmonella enterica gehört zu den häufigsten Erregern von Lebensmittelvergiftungen weltweit. Die meisten Infektionen gehen auf nicht-typhöse Serovare zurück, die auf verunreinigtem Geflügel, Eiern und anderen tierischen Produkten sitzen; sie dringen in die Darmschleimhaut ein und lösen die Krämpfe, das Fieber und den Durchfall der Salmonellose aus, die meist von selbst abklingt und mit Flüssigkeit und Ruhe behandelt wird. Einige spezialisierte Serovare, Typhi und Paratyphi, sind an den Menschen angepasst und verursachen Typhus, eine ernste Blutstrominfektion, die Antibiotika erfordert. Gründliches Durchgaren, Händewaschen und das Fernhalten von rohem Fleisch von verzehrfertigen Speisen sind die praktischen Schutzmaßnahmen, und gegen Typhus gibt es Impfstoffe für Reisende in Risikogebiete.

**Scientific.**  
🇬🇧 Salmonella enterica is a Gram-negative, facultatively anaerobic bacillus of the Enterobacteriaceae, ~0.7–1.5 × 2–5 µm, typically motile by peritrichous flagella (H-antigen). Its outer membrane carries lipopolysaccharide whose O-polysaccharide, together with the H flagellar and Vi capsular antigens, defines the >2,600 serovars of the Kauffmann–White scheme. It is a facultative intracellular pathogen: SPI-1 and SPI-2 type III secretion systems inject effectors that drive membrane ruffling and enterocyte invasion, then remodel the Salmonella-containing vacuole for survival within macrophages. Non-typhoidal serovars (e.g. Typhimurium, Enteritidis) cause localised inflammatory gastroenteritis, while human-restricted Typhi/Paratyphi cause systemic enteric fever. Clearance depends on neutrophils, macrophages, and gut epithelium with central Th1 (IFN-γ/IL-12) responses; many isolates carry virulence and antimicrobial-resistance plasmids spread by horizontal gene transfer.  
🇩🇪 Salmonella enterica ist ein gramnegatives, fakultativ anaerobes Stäbchen der Enterobacteriaceae, ~0,7–1,5 × 2–5 µm, meist durch peritriche Flagellen (H-Antigen) beweglich. Die äußere Membran trägt Lipopolysaccharid, dessen O-Polysaccharid zusammen mit dem H-Flagellen- und dem Vi-Kapselantigen die über 2600 Serovare des Kauffmann-White-Schemas definiert. Sie ist ein fakultativ intrazellulärer Erreger: Die Typ-III-Sekretionssysteme SPI-1 und SPI-2 injizieren Effektoren, die Membranaufwerfungen und das Eindringen in Enterozyten auslösen und anschließend die Salmonellen-haltige Vakuole für das Überleben in Makrophagen umbauen. Nicht-typhöse Serovare (z. B. Typhimurium, Enteritidis) verursachen eine lokale entzündliche Gastroenteritis, während die an den Menschen angepassten Serovare Typhi/Paratyphi das systemische enterische Fieber auslösen. Die Elimination hängt von Neutrophilen, Makrophagen und dem Darmepithel mit zentralen Th1-Antworten (IFN-γ/IL-12) ab; viele Isolate tragen Virulenz- und Antibiotikaresistenzplasmide, die über horizontalen Gentransfer verbreitet werden.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE Salmonella enterica bacterium, a Gram-negative enteric rod, centered in a square 1:1 1080x1080 frame that fills edge-to-edge with a neutral dark-charcoal background and NO border, frame, vignette, letterbox, mat or paper-sheet-on-a-surface. Match the exact refined house look of a muted educational textbook plate: a sophisticated slightly-desaturated palette of soft dusty tints, each structure its own distinct soft fill, THIN clean outlines (never heavy black cartoon strokes), gentle soft shading with subtle dimensionality. The rod is a straight cylinder with smoothly rounded poles, about 3 to 4 times longer than wide, with generous negative space around it for later labels. A neat quarter cut-away reveals the interior: pale cytoplasm, a diffuse condensed nucleoid shown as a soft irregular tangle (NOT a tidy free-floating DNA loop), one or two small circular virulence plasmids, and tiny numerous randomly dispersed ribosome dots (not oversized or orderly). The Gram-negative envelope shows three distinct correct layers: an outer membrane bearing a subtle bristly O-antigen lipopolysaccharide fringe, a thin peptidoglycan cell wall, and an inner plasma membrane. Show numerous peritrichous flagella (long wavy whip-like tails emerging all around the cell body, not just one pole) and a dusting of short fine fimbriae on the surface. Do NOT draw a mesosome, a Gram-positive thick wall, membrane-bound organelles, or a face. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE Salmonella enterica bacterium, a Gram-negative enteric rod, centered in a square 1:1 1080x1080 frame that fills edge-to-edge with a subtly textured neutral substrate and NO border, frame, vignette or letterbox. The rod is a clean plump cylinder with smoothly rounded poles, roughly 3 to 4 times longer than it is wide, lying at a gentle three-quarter angle. Render true 3D surface texture with fine turgid curvature and a slightly wrinkled skin, shallow depth of field so the far pole falls softly out of focus, cool studio microscopy lighting. False-color palette: a warm reddish-orange to salmon-pink cell against a dark, uncluttered charcoal-grey background. Show only real surface appendages: numerous long peritrichous flagella (wavy whip-like filaments emerging from all around the body) and a fine dusting of short hair-like fimbriae. SEM shows surface only, so render NO internal structures. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE Salmonella enterica bacterium, a Gram-negative enteric rod, centered in a square 1:1 1080x1080 frame that fills edge-to-edge with a clean seamless dark studio background and NO border, frame, vignette or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the membranes. The rod is an idealized-for-clarity but believable cylinder with rounded poles, about 3 to 4 times longer than wide. Colorize with natural believable biological tones so structures are clearly distinguishable: a warm translucent amber cell body, distinct tints for the outer membrane, thin peptidoglycan wall and inner plasma membrane, a bluish diffuse nucleoid, greenish small circular plasmids, and pale ribosome speckles. Use a partial cut-away or gentle translucency to hint at the interior: soft cytoplasm, a diffuse condensed nucleoid as an irregular tangle (NOT a tidy DNA ring), one or two small circular virulence plasmids inside the cell body (never floating outside), and tiny numerous randomly scattered ribosomes. The Gram-negative envelope reads as three distinct layers. Numerous peritrichous flagella (long wavy filaments) trail from all around the cell and fine fimbriae stipple the surface. Do NOT render a mesosome, a Gram-positive thick wall, membrane-bound organelles, or a face. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE Salmonella enterica bacterium, a Gram-negative enteric rod, in the style of a 19th-century scientific atlas yet anatomically modern and correct, centered in a square 1:1 1080x1080 frame. The warm aged paper MUST FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner as the background, with a soft darker wash halo directly on the paper behind the specimen; do NOT render the artwork as a separate sheet, card or page lying on a table or surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolor washes with fine ink outlines, subject large and centred with generous margin for later labels. The rod has gently rounded poles and is about 3 to 4 times longer than wide. A soft painterly cut-away hints at the interior: washed cytoplasm, a diffuse condensed nucleoid painted as a loose irregular tangle (NOT a tidy DNA loop), one or two small circular virulence plasmids, and tiny numerous randomly dispersed ribosome specks. The Gram-negative envelope shows three distinct layers: outer membrane with a faint bristly O-antigen fringe, thin peptidoglycan wall, and inner plasma membrane. Numerous peritrichous flagella (long wavy filaments) trail from all around the body and delicate fimbriae fringe the surface. Do NOT paint a mesosome, a Gram-positive thick wall, membrane-bound organelles, or a face. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3283 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 12.7s — fail (gemini-2.5-flash-image; full longitudinal cross-section split open lengthwise and a flat symmetric horizontal pose, not the angled quarter cut-away of the house exemplar - superseded)
  ![textbook 1](theme/textbook/salmonella-enterica.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 17.2s — pass (gemini-2.5-flash-image; angled quarter cut-away matching rod-bacterium/parasite exemplar palette and line style, correct peritrichous flagella, fimbriae, nucleoid tangle, plasmids, ribosomes, three-layer Gram-negative envelope)
  ![textbook 2](theme/textbook/salmonella-enterica.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/salmonella-enterica.textbook.svg)
[interactive SVG](theme/textbook/salmonella-enterica.textbook.svg) · [HTML](theme/textbook/salmonella-enterica.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3083 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 13.7s — fail (gemini-2.5-flash-image; solid black border/frame around the full edge of the image - violates no-border rule, superseded)
  ![sem 1](theme/sem/salmonella-enterica.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 18.7s — pass (gemini-2.5-flash-image; fills edge-to-edge with no border, plump rounded-pole rod, numerous peritrichous flagella, fine fimbriae texture, warm reddish-orange false colour on dark charcoal substrate)
  ![sem 2](theme/sem/salmonella-enterica.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1605 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 27.2s — pass (gemini-2.5-flash-image; natural biological tints - warm amber cytoplasm, bluish nucleoid tangle, green plasmids, distinct envelope layers, peritrichous flagella and fimbriae, clean dark studio background, no border)
  ![3d 1](theme/3d/salmonella-enterica.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/salmonella-enterica.3d.svg)
[interactive SVG](theme/3d/salmonella-enterica.3d.svg) · [HTML](theme/3d/salmonella-enterica.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1629 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 23.9s — pass (gemini-2.5-flash-image; warm aged paper fills the entire frame edge-to-edge with a soft wash halo, no mat/frame/sheet-on-surface, correct rounded-pole rod with quarter cut-away showing diffuse nucleoid tangle, two plasmid rings, ribosome dots and three envelope layers, peritrichous flagella and fimbriae)
  ![watercolor 1](theme/watercolor/salmonella-enterica.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/salmonella-enterica.watercolor.svg)
[interactive SVG](theme/watercolor/salmonella-enterica.watercolor.svg) · [HTML](theme/watercolor/salmonella-enterica.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public Domain (NIAID / RML) · NIAID Rocky Mountain Laboratories (RML), National Institutes of Health — pass (NIAID/RML colour SEM, public domain; cleaned via edit_image.py to crop to a single isolated rod with clearly readable peritrichous flagella and rounded poles, all text/borders removed, false colour preserved)
  ![reference](../reference-microscopy/theme/sem/salmonella-enterica.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | use as final; accurate angled quarter cut-away matching exemplar palette/line style after one re-render fixed the composition |
| sem | pass | 2 | use as final; accurate false-colour surface-only rod after one re-render removed a baked-in black border |
| 3d | pass | 1 | use as final; correct internal layering and natural biological tints on first attempt |
| watercolor | pass | 1 | use as final; correct anatomy and full-bleed aged-paper composition on first attempt |
