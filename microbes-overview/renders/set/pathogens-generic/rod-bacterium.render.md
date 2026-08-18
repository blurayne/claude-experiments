# Rod-shaped bacterium (bacillus archetype) — render log

**Set:** `pathogens-generic` · **Microbe key:** `rod-bacterium`
**Short description:** Textbook Gram-negative-style motile rod (~1 × 2–4 µm) used to teach bacterial anatomy — an idealized *E. coli*/*Salmonella*-type cell, not a named species.

Metadata sidecar: [`rod-bacterium.render.meta.json`](rod-bacterium.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

Straight cylinder with rounded poles, several times longer than wide; ~0.5–1 µm diameter, 2–5 µm long. Usually a lone cell. Gram-negative envelope in the archetype (outer membrane + thin peptidoglycan + inner membrane).

Sources: [NCBI *Medical Microbiology* (Structure)](https://www.ncbi.nlm.nih.gov/books/NBK8477/), [SUNY/Lumen *Microbiology*](https://courses.lumenlearning.com/suny-microbiology/chapter/unique-characteristics-of-prokaryotic-cells/), [Biology LibreTexts](https://bio.libretexts.org/Bookshelves/Botany/Botany_(Ha_Morrow_and_Algiers)/02:_Biodiversity_(Organismal_Groups)/2.02:_Prokaryotes_and_Viruses/2.2.01:_Prokaryotes/2.2.1.01:_Cell_Structure).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `capsule` | capsula (glycocalyx) | Capsule | Kapsel | sticky coat: attachment, resists drying & immune attack | outermost | optional |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall | Zellwand | peptidoglycan mesh: shape, resists turgor | outer boundary | core |
| `outer_membrane` | membrana externa | Outer membrane | äußere Membran | LPS membrane, extra barrier (Gram-neg only) | outside wall | Gram-neg only |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | controls transport, energy/respiration | innermost boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nucleoid | circular chromosome; essential genes | central, diffuse | core |
| `plasmid` | plasmidum | Plasmid | Plasmid | accessory genes (resistance, virulence) | cytoplasm | optional |
| `ribosome` | ribosoma (70S) | Ribosome | Ribosom | protein synthesis | dispersed dots | core |
| `flagellum` | flagellum | Flagellum | Geißel | rotary propeller for swimming | pole(s)/all over | variable |
| `pilus` | pilus (sex pilus) | Pilus | Pilus/Sexpilus | attachment; DNA transfer (conjugation) | surface, few, long | variable |
| `fimbria` | fimbria | Fimbriae | Fimbrien | short bristles: adhesion | surface, many, short | variable |

### Do NOT draw (scientifically misleading)
- **Mesosome** — EM fixation artifact, not real.
- Nucleoid as a tidy free-floating loop — it's a **diffuse condensed tangle**.
- Over-large / too-orderly ribosomes — they're tiny, numerous, random.
- Capsule/flagella/pili/plasmid as universal — all **variable**; mark "if present".
- Any membrane-bound organelles (no nucleus/mitochondria/ER/Golgi).
- Gram-neg + Gram-pos envelope mixed — pick one (archetype = Gram-negative).

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #9995** colorized TEM of a **single** *E. coli* O157 rod with peritrichous **flagella** — public domain, single specimen.
- file: https://upload.wikimedia.org/wikipedia/commons/e/eb/Escherichia_coli_flagella_TEM.png
- page: https://commons.wikimedia.org/wiki/File:Escherichia_coli_flagella_TEM.png · License: **Public Domain (CDC PHIL #9995)** · CDC / E. H. White; Peggy S. Hayes
- backups: PHIL #7138 (single rod, SEM, PD), NIAID SEM field (CC BY 2.0)
AI visual verification result: **PASS (2026-08-13).** A single isolated rod with rounded poles and clearly readable peritrichous flagella streaming off the cell — the ideal single-specimen teaching reference. Caveat: the raw download has a small baked-in "E. coli 0157" caption. A **cleaned, text- and border-free version (colorization kept)** was produced with `edit_image.py` and is used for display — see §5.

---

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the rod-shaped bacterium: a tiny stick-shaped cell, like a soft, squishy jellybean too small to see. Some of these rods are your buddies! They live in your gut, help you digest food, and even make vitamin K to keep your blood healthy. But watch out, some rod cousins (like Salmonella) sneak in on dirty food and try to make you sick. When they do, drinking plenty of water flushes the nasty rods back out - and for the really stubborn ones the doctor has medicine that finishes the job!  
🇩🇪 Das ist das Stäbchen-Bakterium: eine winzige, stabförmige Zelle, weich und wabbelig wie ein Mini-Gummibärchen, viel zu klein zum Sehen. Manche Stäbchen sind deine Freunde! Sie wohnen in deinem Bauch, helfen beim Verdauen und stellen sogar Vitamin K her, damit dein Blut gesund bleibt. Aber Achtung: Ein paar Verwandte (wie Salmonellen) schleichen sich mit schmutzigem Essen ein und wollen dich krank machen. Dann spült viel Trinken die fiesen Stäbchen wieder hinaus - und bei den ganz hartnäckigen hilft eine Medizin vom Arzt!

**Adults (popular science, health).**  
🇬🇧 The rod-shaped bacterium is the workhorse of your microbiome. Trillions of these stick-like cells, such as most E. coli strains, line your gut, where they help break down food, crowd out invaders, and synthesise vitamin K and other nutrients. Their relatives can turn hostile: Salmonella and certain E. coli strains cause food poisoning and infections. Antibiotics remain our main defence, but overuse drives antibiotic resistance, and these rods readily swap resistance genes with one another. Keeping the balance, through good hygiene, sensible antibiotic use and a varied diet, matters far more than simply labelling them good or bad.  
🇩🇪 Das Stäbchen-Bakterium ist das Arbeitstier deines Mikrobioms. Billionen dieser stabförmigen Zellen, etwa die meisten E.-coli-Stämme, besiedeln deinen Darm, wo sie beim Abbau der Nahrung helfen, Eindringlinge verdrängen und Vitamin K sowie andere Nährstoffe herstellen. Ihre Verwandten können gefährlich werden: Salmonellen und bestimmte E.-coli-Stämme verursachen Lebensmittelvergiftungen und Infektionen. Antibiotika sind unsere wichtigste Waffe, doch ihr übermäßiger Einsatz fördert Antibiotikaresistenzen, und diese Stäbchen tauschen Resistenzgene bereitwillig untereinander aus. Das Gleichgewicht zu halten, durch Hygiene, umsichtigen Antibiotikaeinsatz und abwechslungsreiche Ernährung, zählt weit mehr als die simple Einteilung in gut und böse.

**Scientific.**  
🇬🇧 The Gram-negative bacillus is a cylindrical rod, roughly 1 to 3 micrometres long. Its defining feature is a thin peptidoglycan layer sandwiched between an inner cytoplasmic membrane and an outer membrane bearing lipopolysaccharide (endotoxin). Many rods are motile, driven by peritrichous flagella and sensing gradients via chemotaxis. The genome sits in a compact nucleoid, supplemented by plasmids that carry virulence and resistance genes spread through horizontal gene transfer (conjugation, transformation, transduction). The elongated shape optimises surface area, nutrient uptake, motility and surface attachment. Ecologically these rods range from gut commensals to pathogens; their envelope structures underlie both antibiotic targets and immune recognition.  
🇩🇪 Das gramnegative Stäbchen ist eine zylindrische Zelle von etwa 1 bis 3 Mikrometern Länge. Sein Kennzeichen ist eine dünne Peptidoglykanschicht zwischen einer inneren Zytoplasmamembran und einer äußeren Membran mit Lipopolysaccharid (Endotoxin). Viele Stäbchen sind durch peritriche Flagellen beweglich und orientieren sich per Chemotaxis an Gradienten. Das Genom liegt in einem kompakten Nukleoid, ergänzt durch Plasmide, die Virulenz- und Resistenzgene tragen und ueber horizontalen Gentransfer (Konjugation, Transformation, Transduktion) verbreiten. Die längliche Form optimiert Oberfläche, Naehrstoffaufnahme, Beweglichkeit und Anheftung. Oekologisch reichen diese Stäbchen von Darmkommensalen bis zu Pathogenen; ihre Hüllstrukturen sind zugleich Angriffspunkt für Antibiotika und Ziel der Immunerkennung.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE generic rod-shaped Gram-negative bacillus, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Semi-flat vector-style shading with crisp clean boundaries and a muted educational palette on a dark, uncluttered background. The rod has rounded poles and is about 3 to 4 times longer than wide. A neat quarter cut-away reveals the interior: pale cytoplasm, a diffuse condensed nucleoid shown as a soft irregular tangle (NOT a tidy free-floating DNA loop), one or two small circular plasmids, and tiny numerous randomly dispersed ribosomes (not oversized or orderly). The envelope shows three distinct correct layers for Gram-negative: outer membrane, thin peptidoglycan cell wall, and inner plasma membrane, with an optional faint slime capsule outside. A few fimbriae/pili and one or two flagella on the surface. Do NOT draw a mesosome or any membrane-bound organelles. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE generic rod-shaped Gram-negative bacillus, centered in a square 1:1 1080x1080 frame with generous empty margin around it. The rod is a clean cylinder with smoothly rounded poles, roughly 3 to 4 times longer than it is wide, lying at a gentle three-quarter angle. Render true 3D surface texture with fine wrinkles and turgid curvature, shallow depth of field so the poles fall softly out of focus, and a subtly textured neutral substrate beneath it. False-color palette: warm amber-to-bronze cell against a dark, uncluttered charcoal background. Show only real surface appendages: many fine hair-like fimbriae/pili dusting the surface and one to three long whip-like flagella trailing off. SEM shows surface only, so render NO internal structures. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE generic rod-shaped Gram-negative bacillus, centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, and a clean seamless dark studio background. The rod is an idealized-for-clarity but believable cylinder with rounded poles, about 3 to 4 times longer than wide, its membranes rendered with subtle subsurface scattering and a faint translucent slime capsule. Use a partial cut-away or gentle translucency to hint at the interior: soft cytoplasm, a diffuse condensed nucleoid as an irregular tangle (NOT a tidy DNA ring), one or two small circular plasmids, and tiny numerous randomly scattered ribosomes. The Gram-negative envelope reads as three distinct layers: outer membrane, thin peptidoglycan wall, inner plasma membrane. Fine fimbriae/pili stipple the surface with one to a few flagella. Do NOT render a mesosome or any membrane-bound organelles. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE generic rod-shaped Gram-negative bacillus in the style of a 19th-century atlas, centered in a square 1:1 1080x1080 frame with generous margin, yet anatomically modern and correct. Soft translucent watercolor washes with fine ink outlines, warm aged-paper texture kept dark and uncluttered so later labels read clearly. The rod has gently rounded poles and is about 3 to 4 times longer than wide. A soft painterly cut-away hints at the interior: washed cytoplasm, a diffuse condensed nucleoid painted as a loose irregular tangle (NOT a tidy DNA loop), one or two small circular plasmids, and tiny numerous randomly dispersed ribosome specks. The envelope shows three distinct Gram-negative layers: outer membrane, thin peptidoglycan wall, inner plasma membrane, with a faint slime capsule. Delicate fimbriae/pili fringe the surface and one or a few flagella trail off. Do NOT paint a mesosome or any membrane-bound organelles. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1530 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 7.5s — ✅ PASS — correct rod, cutaway, 3 envelope layers, diffuse nucleoid, plasmids, ribosome dots, fimbriae + flagella; no text/mesosome. Chosen as label base.
  ![textbook 1](theme/textbook/rod-bacterium.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/rod-bacterium.textbook.svg)
[interactive SVG](theme/textbook/rod-bacterium.textbook.svg) · [HTML](theme/textbook/rod-bacterium.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3051 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 8.5s — ⚠️ had a dark frame around the image.
  ![sem 1](theme/sem/rod-bacterium.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 11.4s — ✅ PASS — realistic false-colour SEM, rounded poles, surface fimbriae, polar flagella, fills the frame edge-to-edge (no border).
  ![sem 2](theme/sem/rod-bacterium.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 5 attempt(s), 7950 tok, $0.194
- attempt 1 · `gemini-2.5-flash-image` · 8.4s — ❌ FAIL — plasmids drawn as spheres OUTSIDE the cell.
  ![3d 1](theme/3d/rod-bacterium.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 9.0s — ⚠️ PARTIAL — one plasmid inside, two still floating outside.
  ![3d 2](theme/3d/rod-bacterium.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 8.1s — ✅ PASS (near-monochrome) — single plasmid inside, empty background.
  ![3d 3](theme/3d/rod-bacterium.attempts/gen-03__gemini-2.5-flash-image.avif)
- attempt 4 · `gemini-2.5-flash-image` · 8.5s — ✅ PASS — recolorized with natural tones: warm gold cell, distinct envelope layers, blue nucleoid, green plasmids inside, ribosome dots. Chosen final.
  ![3d 4](theme/3d/rod-bacterium.attempts/gen-04__gemini-2.5-flash-image.avif)
- attempt 5 · `gemini-2.5-flash-image` · 9.4s — —
  ![3d 5](theme/3d/rod-bacterium.attempts/gen-05__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/rod-bacterium.3d.svg)
[interactive SVG](theme/3d/rod-bacterium.3d.svg) · [HTML](theme/3d/rod-bacterium.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1537 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 9.2s — ✅ PASS — naturalist plate, cutaway, 3 layers, diffuse nucleoid, plasmids inside, polar flagellum; no text.
  ![watercolor 1](theme/watercolor/rod-bacterium.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/rod-bacterium.watercolor.svg)
[interactive SVG](theme/watercolor/rod-bacterium.watercolor.svg) · [HTML](theme/watercolor/rod-bacterium.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public Domain (CDC PHIL #9995) · CDC / E. H. White; Peggy S. Hayes (PHIL #9995) — ✅ PASS (2026-08-13) — single isolated E. coli rod with clearly visible flagella (CDC #9995 TEM, public domain), AI-cleaned to remove the baked-in caption and black borders while keeping the green/red colorization.
  ![reference](theme/tem/rod-bacterium.attempts/real-04__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | best for full labelling |
| sem | ✅ teaching-ready | 2 | re-rendered without the border |
| 3d | ✅ teaching-ready | 4 | colorized natural tones; plasmids inside |
| watercolor | ✅ teaching-ready | 1 | most attractive; plasmids correct |
| reference TEM | ✅ verified + cleaned | 3 | CDC #9995 single rod + flagella, PD |
