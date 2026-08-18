# Coccus / spherical bacterium (cocci archetype) — render log

**Set:** `pathogens-generic` · **Microbe key:** `cocci`
**Short description:** Textbook Gram-positive spherical bacterium (~1 µm), *Staphylococcus*/*Streptococcus*-type — not a named species.

Metadata sidecar: [`cocci.render.meta.json`](cocci.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

Smooth sphere to ovoid, ~0.5–1.5 µm (classic ~1 µm). Arrangement follows the division planes: single cocci, **diplococci** (pairs), **streptococci** (chains), **staphylococci** (grape-like clusters), tetrads, sarcinae. Archetype is **Gram-positive**: a **single plasma membrane** wrapped by a **thick peptidoglycan wall (~20–80 nm)**, no outer membrane; typically **non-motile (no flagella)**, usually drawn without fimbriae.

Sources: [StatPearls (NCBI NBK470553)](https://www.ncbi.nlm.nih.gov/books/NBK470553/), [CCBC OER Microbiology](https://cwoer.ccbcmd.edu/science/microbiology/lecture/unit1/shape/shape.html), [microbiologyinfo.com](https://microbiologyinfo.com/different-size-shape-and-arrangement-of-bacterial-cells/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `capsule` | capsula (glycocalyx) | Capsule | Kapsel | protective slime coat: adhesion, resists drying & phagocytosis | outermost | optional |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall (thick peptidoglycan) | Zellwand (dicke Mureinschicht) | rigid mesh: shape, resists turgor | outermost solid layer | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | selective transport; respiration/energy | inside the wall | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | interior where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nukleoid | circular chromosome; no nuclear membrane | central, diffuse | core |
| `plasmid` | plasmidum | Plasmid | Plasmid | accessory genes (resistance, virulence) | cytoplasm | optional |
| `ribosome` | ribosomata (70S) | Ribosomes (70S) | Ribosomen (70S) | protein synthesis | dispersed dots | core |
| `pili_fimbriae` | pili / fimbriae | Pili / fimbriae | Pili / Fimbrien | adhesion | surface | optional |

### Do NOT draw (scientifically misleading)
- **Outer membrane** — that's Gram-negative; the archetype coccus is Gram-positive (single membrane + thick wall).
- **Flagella** — cocci are typically non-motile.
- **Mesosome** — EM fixation artifact, not real.
- Nucleoid as a tidy loop — it's a **diffuse, irregular** region.
- Over-formalised cluster geometry; membrane-bound organelles (none in bacteria).

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **S. aureus VISA** false-color SEM (~20,000×), well-separated smooth spheres — public domain.
- file: https://upload.wikimedia.org/wikipedia/commons/d/d3/Staphylococcus_aureus_VISA_2.jpg
- page: https://commons.wikimedia.org/wiki/File:Staphylococcus_aureus_VISA_2.jpg · License: **Public Domain (CDC)** · CDC / M. J. Arduino; Janice Haney Carr
- backups: NIAID *S. aureus* SEM (PD), USDA *S. aureus* TEM 50,000× showing capsule (PD)
AI visual verification result: **PASS (2026-08-13).** SEM at 20,000× clearly shows spherical cocci (*Staphylococcus aureus*) in the typical grape-like clusters; individual spheres are cleanly readable. Caveat: the raw download has a baked-in SEM data/scale bar. A **cleaned, text- and border-free version (colorization kept)** was produced with `edit_image.py` and is used for display — see §5.

---

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Say hello to a coccus - a teeny tiny round ball, way too small to see! Cocci love to hang out together: some bunch up like little grape clusters, others line up in chains like beads on a string. Lots of them live happily on your skin and never bother you. But a few troublemakers can give you a sore throat or a red, sore spot on your skin. When that happens, clean hands, a bit of rest and sometimes a little medicine from the doctor soon chase the round troublemakers away!  
🇩🇪 Sag Hallo zu einem Kokkus - einer winzig kleinen runden Kugel, viel zu klein zum Sehen! Kokken sind gern zusammen: Manche kleben aneinander wie kleine Weintrauben, andere reihen sich auf wie Perlen an einer Schnur. Viele von ihnen leben ganz friedlich auf deiner Haut und stören dich überhaupt nicht. Aber ein paar Störenfriede können dir Halsschmerzen machen oder eine rote, wunde Stelle auf der Haut. Dann helfen saubere Hände, etwas Ruhe und manchmal eine kleine Medizin vom Arzt, bis die runden Störenfriede wieder verschwinden!

**Adults (popular science, health).**  
🇬🇧 Cocci are spherical bacteria, and they are constant companions of the human body. Many species are peaceful residents of the skin and throat, part of the microbiome that helps keep more aggressive microbes in check. Others, though, cause real disease: Staphylococcus aureus leads to skin, wound and bloodstream infections, while streptococci cause strep throat and pneumonia. Because staph and strep spread easily, antibiotic resistance is a growing concern - MRSA is a well-known resistant strain. Good hygiene, careful antibiotic use, and vaccines such as the pneumococcal shot are our main tools for keeping these round bacteria in balance.  
🇩🇪 Kokken sind kugelförmige Bakterien und ständige Begleiter des menschlichen Körpers. Viele Arten sind friedliche Bewohner von Haut und Rachen, ein Teil des Mikrobioms, das aggressivere Keime in Schach hält. Andere jedoch verursachen echte Erkrankungen: Staphylococcus aureus führt zu Haut-, Wund- und Blutstrominfektionen, Streptokokken lösen Halsentzündungen und Lungenentzündung aus. Da sich Staphylokokken und Streptokokken leicht verbreiten, wird Antibiotikaresistenz zunehmend zum Problem - MRSA ist ein bekannter resistenter Stamm. Gute Hygiene, umsichtiger Einsatz von Antibiotika und Impfungen wie die gegen Pneumokokken sind unsere wichtigsten Mittel, um diese runden Bakterien im Gleichgewicht zu halten.

**Scientific.**  
🇬🇧 Cocci are spherical bacteria, typically 0.5-1.5 µm across, defined by their cell shape and division pattern. Depending on the planes of division they form pairs (diplococci), chains (streptococci) or grape-like clusters (staphylococci). Most medically important cocci are Gram-positive, with a single cytoplasmic membrane wrapped in a thick peptidoglycan wall studded with teichoic and lipoteichoic acids; they are generally non-motile and lack flagella. Their genome sits in a nucleoid, often accompanied by plasmids that carry virulence and antibiotic-resistance genes spread by horizontal gene transfer. Ecologically they range from commensal skin and mucosal flora to major human pathogens.  
🇩🇪 Kokken sind kugelförmige Bakterien, typischerweise 0,5-1,5 µm groß, definiert über Zellform und Teilungsmuster. Je nach Teilungsebenen bilden sie Paare (Diplokokken), Ketten (Streptokokken) oder traubenartige Haufen (Staphylokokken). Die meisten medizinisch bedeutsamen Kokken sind grampositiv: Sie besitzen eine einzelne Zytoplasmamembran, umgeben von einer dicken Peptidoglykanschicht mit eingelagerten Teichon- und Lipoteichonsäuren; in der Regel sind sie unbeweglich und ohne Flagellen. Ihr Genom liegt als Nukleoid vor, häufig ergänzt durch Plasmide, die Virulenz- und Antibiotikaresistenzgene tragen und über horizontalen Gentransfer verbreitet werden. Ökologisch reichen sie von kommensaler Haut- und Schleimhautflora bis zu bedeutenden Krankheitserregern des Menschen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a generic Gram-positive coccus, a single smooth sphere about one micron, centered in a square 1:1 1080x1080 frame with a neutral dark uncluttered background and lots of negative space for later labels. Semi-flat vector-like shading with crisp boundaries and a muted educational palette. A wedge cut-away reveals the interior: pale cytoplasm, a diffuse irregular nucleoid region (not a tidy loop), one or two small circular plasmids, and dispersed 70S ribosome dots. The envelope shows a single thin plasma membrane wrapped by a distinctly THICK peptidoglycan cell wall, plus an optional faint slime capsule. Do NOT draw an outer membrane, flagella, mesosome, or membrane-bound organelles. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph of a generic spherical bacterium, a Gram-positive coccus archetype, rendered as a teaching image. Show a small clear cluster of a few well-separated smooth spheres, each about one micron, centered with generous margin in a square 1:1 1080x1080 frame. Depict only the outer 3D surface with realistic microtexture, a faint enveloping capsule sheen, shallow depth of field, and soft false-color tinting resting on a subtly textured neutral substrate. Absolutely no internal structures (correct for SEM), and no outer membrane, flagella, or mesosome. Neutral, dark, uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a generic Gram-positive coccus, one idealized-for-clarity sphere about one micron, centered in a square 1:1 1080x1080 frame on a clean seamless dark studio background with generous margin. Soft global illumination, gentle subsurface scattering, and a partial cut-away with subtle translucency hinting at the interior: cytoplasm, a diffuse irregular nucleoid, one or two small plasmids, and dispersed 70S ribosomes. Render a clearly THICK peptidoglycan cell wall over a single plasma membrane, and an optional soft capsule glow. Do NOT show an outer membrane, flagella, mesosome, or any membrane-bound organelles. Keep the background neutral and uncluttered so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a generic Gram-positive coccus in a 19th-century atlas style but anatomically modern and correct, on aged-paper warmth. A single soft sphere about one micron, centered in a square 1:1 1080x1080 frame with generous margin and a muted, uncluttered darker wash background so labels read well. Soft translucent watercolor washes with fine ink outlines and a gentle cut-away revealing cytoplasm, a diffuse irregular nucleoid (not a neat loop), one or two small plasmids, and lightly stippled 70S ribosomes. Show a THICK peptidoglycan cell wall over a single plasma membrane, with an optional faint capsule. Do NOT paint an outer membrane, flagella, mesosome, or membrane-bound organelles. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1473 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 8.2s — ✅ PASS — sphere with cutaway, THICK peptidoglycan wall + single membrane (Gram-positive, no outer membrane), diffuse nucleoid, plasmids inside, ribosome dots; no flagella/text. Chosen as label base.
  ![textbook 1](theme/textbook/cocci.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/cocci.textbook.svg)
[interactive SVG](theme/textbook/cocci.textbook.svg) · [HTML](theme/textbook/cocci.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1453 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 10.3s — ✅ PASS — realistic false-colour SEM cluster of smooth spheres with surface microtexture; matches the staph reference; surface-only; no border.
  ![sem 1](theme/sem/cocci.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3030 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 8.0s — ✅ PASS (pale) — sphere cutaway, thick wall, diffuse nucleoid, plasmids inside, ribosomes; no flagella.
  ![3d 1](theme/3d/cocci.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 9.9s — ✅ PASS — recolorized with natural tones: warm gold cell, distinct thick wall + single membrane, blue nucleoid, plasmids inside. Chosen final.
  ![3d 2](theme/3d/cocci.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/cocci.3d.svg)
[interactive SVG](theme/3d/cocci.3d.svg) · [HTML](theme/3d/cocci.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1480 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 9.7s — ✅ PASS — naturalist plate; cross-hatched band conveys the thick peptidoglycan wall; diffuse nucleoid, plasmid inside; no flagella.
  ![watercolor 1](theme/watercolor/cocci.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/cocci.watercolor.svg)
[interactive SVG](theme/watercolor/cocci.watercolor.svg) · [HTML](theme/watercolor/cocci.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public Domain (CDC) · CDC / M. J. Arduino; Janice Haney Carr — ✅ PASS (2026-08-13) — Staphylococcus aureus SEM (public domain), AI-cleaned to remove the data/scale bar and any borders while keeping the purple/green colorization; cocci fill the frame.
  ![reference](theme/sem/cocci.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | best for full labelling |
| sem | ✅ teaching-ready | 1 | cluster; surface features; no border |
| 3d | ✅ teaching-ready | 2 | colorized natural tones; plasmids inside |
| watercolor | ✅ teaching-ready | 1 | hatched wall = thick peptidoglycan |
| reference SEM | ✅ verified + cleaned | 2 | S. aureus, PD, cleaned |
