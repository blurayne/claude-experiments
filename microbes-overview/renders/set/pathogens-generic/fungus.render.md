# Fungus (budding-yeast archetype) — render log

**Set:** `pathogens-generic` · **Microbe key:** `fungus`
**Short description:** Textbook eukaryotic budding yeast (Candida-type, ~3–5 µm ovoid) with a daughter bud and a short emerging germ tube/hypha — used to teach fungal anatomy: a membrane-bound nucleus and organelles inside a chitin/β-glucan/mannoprotein cell wall, not a named clinical isolate.

Metadata sidecar: [`fungus.render.meta.json`](fungus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

A single ovoid-to-round yeast cell, roughly 3–5 µm across — clearly larger and rounder than a bacterium — reproducing by **budding**: a smaller daughter cell (bud) balloons from the mother, joined at a constricted bud neck, and leaves a circular **bud scar** on the mother wall after separation. Fungi are **eukaryotes**: the archetype must show a membrane-bound **nucleus** (with a nuclear envelope) plus other organelles — one or more **mitochondria**, a large **vacuole**, **endoplasmic reticulum** studded with **ribosomes (80S)** — all inside the **plasma membrane**. The boundary is a layered **cell wall** made of an inner **chitin** skeleton, a middle layer of **β-1,3/β-1,6-glucan**, and an outer fibrillar coat of **mannoproteins** (measured composition ≈ 3% chitin, 54% β-glucan, 43% protein/mannan) — chemistry with no counterpart in human cells and no peptidoglycan. To signal the dimorphic filamentous form, a short **germ tube / hypha** (a narrow, parallel-sided tube) evaginates from the cell; elongated constricted chains of cells are pseudohyphae.

Sources: [StatPearls *Candidiasis* (NCBI Bookshelf, NBK560624)](https://www.ncbi.nlm.nih.gov/books/NBK560624/), [Gow et al., *Molecular organization of the cell wall of Candida albicans* (FEMS Yeast Research)](https://academic.oup.com/femsyr/article/6/1/14/547856), [Sudbery et al., *The distinct morphogenic states of Candida albicans* (Trends in Microbiology)](https://www.sciencedirect.com/science/article/abs/pii/S0966842X04001180), [Britannica *Yeast*](https://www.britannica.com/science/yeast-fungus).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `cell_wall` | paries cellularis (chitina, β-glucanum, mannoproteina) | Cell wall (chitin/β-glucan) | Zellwand (Chitin/β-Glucan) | rigid layered shell: shape, strength, immune target; NOT peptidoglycan | outer boundary | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Plasmamembran | controls transport; ergosterol-rich (antifungal target) | just inside the wall | core |
| `nucleus` | nucleus (involucrum nucleare) | Nucleus (nuclear envelope) | Zellkern (Kernhülle) | membrane-bound genome; defines eukaryote | central, one per cell | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | aerobic energy (ATP) generation | cytoplasm | core |
| `vacuole` | vacuolum | Vacuole | Vakuole | storage, pH/ion balance, degradation | large, often single | core |
| `er_ribosomes` | reticulum endoplasmicum · ribosoma (80S) | ER & ribosomes | ER & Ribosomen (80S) | protein/lipid synthesis; 80S ribosomes | around nucleus / dispersed | core |
| `bud` | gemma (cellula filialis) | Bud (daughter cell) | Knospe (Tochterzelle) | new cell budding off at a constricted neck | on the mother surface | core |
| `bud_scar` | cicatrix gemmalis | Bud scar | Knospennarbe | chitin-rich ring left after a bud separates | mother wall, prior sites | optional |
| `hypha` | hypha / tubus germinalis | Hypha / germ tube | Hyphe / Keimschlauch | narrow filament: dimorphic invasive form | evaginating from cell | variable |

### Do NOT draw (scientifically misleading)
- **No peptidoglycan wall, no nucleoid, no plasmids** — those are bacterial; this is a eukaryote.
- **Do not omit the nucleus** — the membrane-bound nucleus is the whole point; also keep mitochondria + vacuole (real organelles, not artifacts).
- **Not prokaryotic** — no 70S ribosomes label, no Gram envelope; ribosomes here are 80S.
- **Capsule is species-specific** — a thick polysaccharide capsule belongs to *Cryptococcus*, not Candida-type yeast; mark optional/omit.
- **Do not size it like a bacterium** — yeasts are ~3–5 µm, several times bigger and rounder than a rod.
- Bud attached by a **constricted neck**, not a detached floating sphere; hypha is a **narrow parallel-sided tube**, not another round cell.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **Wikimedia Commons — *Saccharomyces cerevisiae* SEM** by Mogana Das Murtey & Patchamuthu Ramasamy — a scanning electron micrograph of budding yeast cells (ovoid cells with daughter buds and bud scars), clear surface detail, freely licensed.
- file: https://upload.wikimedia.org/wikipedia/commons/9/95/Saccharomyces_cerevisiae_SEM.jpg
- page: https://commons.wikimedia.org/wiki/File:Saccharomyces_cerevisiae_SEM.jpg · License: **CC BY 3.0** · Mogana Das Murtey and Patchamuthu Ramasamy
- backups:
  - **CDC PHIL #291** — fluorescent-antibody-stained oval **budding** *Candida albicans* yeast cells, **Public Domain** (CDC / Maxine Jalbert, Dr. Leo Kaufman): https://phil.cdc.gov/Details.aspx?pid=291 (light micrograph, single-species, clearly budding).
  - ***C. albicans* budding light micrograph** by Y tambe — bright-field, 600×, ATCC 10231 budding cells, **CC BY-SA 3.0 / GFDL**: page https://commons.wikimedia.org/wiki/File:C_albicans_budding1.jpg · file https://upload.wikimedia.org/wikipedia/commons/6/65/C_albicans_budding1.jpg
AI visual verification result: **PENDING** — to be confirmed after fetch.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the yeast — a tiny living blob much bigger and rounder than a bacterium, with a real control room (a nucleus) tucked inside. Instead of splitting in half, a yeast grows a little bump called a bud that swells up and pops off as a brand-new cell. Loads of yeasts live quietly on your skin and in your body and never bother you at all. But sometimes one type throws a party and causes an itchy patch of thrush or athlete's foot. A dab of antifungal cream, keeping the skin cool and dry, and your other friendly microbes crowding it back out usually settle things down.  
🇩🇪 Das ist die Hefe — ein winziger lebendiger Klecks, viel größer und runder als ein Bakterium, mit einer echten Schaltzentrale (einem Zellkern) darin. Statt sich einfach zu teilen, lässt eine Hefe eine kleine Beule wachsen, eine Knospe, die praller wird und als ganz neue Zelle abplatzt. Ganz viele Hefen leben still auf deiner Haut und in deinem Körper und stören überhaupt nicht. Doch manchmal feiert eine Sorte zu wild und macht einen juckenden Fleck wie Soor oder Fußpilz. Eine Antipilz-Creme, kühle und trockene Haut und deine anderen freundlichen Mikroben, die sie zurückdrängen, bringen alles meist wieder ins Lot.

**Adults (popular science, health).**  
🇬🇧 Fungi like Candida are eukaryotic microbes — full cells with a nucleus and organelles — that usually live as harmless commensals in the mouth, gut, and on the skin. Trouble starts when the balance shifts: after antibiotics, with a suppressed immune system, or in warm moist folds, the yeast can overgrow and turn opportunistic, causing oral or vaginal thrush or skin infections. Because a fungal cell is biochemically quite different from a bacterium, it needs antifungal drugs (such as azole or polyene agents) rather than antibiotics. For most healthy people these infections are a nuisance rather than a danger, but in immunocompromised patients invasive fungal disease — including deep Aspergillus infections of the lungs — can be serious and needs prompt treatment.  
🇩🇪 Pilze wie Candida sind eukaryotische Mikroben — vollwertige Zellen mit Kern und Organellen —, die meist als harmlose Kommensalen im Mund, im Darm und auf der Haut leben. Probleme beginnen, wenn das Gleichgewicht kippt: nach einer Antibiotikakur, bei geschwächtem Immunsystem oder in warmen, feuchten Hautfalten kann die Hefe überwuchern und opportunistisch werden — als Mundsoor, Scheidenpilz oder Hautinfektion. Weil eine Pilzzelle biochemisch ganz anders gebaut ist als ein Bakterium, braucht sie Antimykotika (etwa Azole oder Polyene) statt Antibiotika. Für gesunde Menschen sind solche Infektionen eher lästig als gefährlich, doch bei immungeschwächten Patienten können invasive Pilzerkrankungen — bis hin zu tiefen Aspergillus-Infektionen der Lunge — ernst werden und müssen rasch behandelt werden.

**Scientific.**  
🇬🇧 This is the archetypal budding yeast, a eukaryotic fungus (e.g. Candida albicans) with a membrane-bound nucleus, mitochondria, a large vacuole, endoplasmic reticulum and 80S ribosomes. Its boundary is a layered cell wall of an inner chitin skeleton, a β-1,3/β-1,6-glucan middle layer and an outer fibrillar coat of mannoproteins — with no peptidoglycan and no counterpart in human cells. The plasma membrane is rich in ergosterol, the target of azole (ergosterol-synthesis inhibitors) and polyene (ergosterol-binding) antifungals. It reproduces by budding, a daughter cell ballooning from a constricted neck and leaving a chitin-rich bud scar, and is dimorphic, switching between the yeast form and invasive hyphae or pseudohyphae. Related moulds such as Aspergillus grow as branching septate hyphae rather than as single yeast cells.  
🇩🇪 Dies ist die archetypische Sprosshefe, ein eukaryotischer Pilz (z. B. Candida albicans) mit membranumhülltem Zellkern, Mitochondrien, einer großen Vakuole, endoplasmatischem Retikulum und 80S-Ribosomen. Ihre Grenze ist eine geschichtete Zellwand aus einem inneren Chitingerüst, einer mittleren Schicht aus β-1,3/β-1,6-Glucan und einer äußeren fibrillären Hülle aus Mannoproteinen — ohne Peptidoglycan und ohne Entsprechung in menschlichen Zellen. Die Plasmamembran ist reich an Ergosterol, dem Angriffspunkt von Azol- (Hemmung der Ergosterol-Synthese) und Polyen-Antimykotika (Ergosterol-Bindung). Sie vermehrt sich durch Knospung, wobei eine Tochterzelle aus einem eingeschnürten Hals hervorquillt und eine chitinreiche Knospennarbe hinterlässt, und ist dimorph, wechselt also zwischen Hefeform und invasiven Hyphen oder Pseudohyphen. Verwandte Schimmelpilze wie Aspergillus wachsen als verzweigte, septierte Hyphen statt als einzelne Hefezellen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway in the EXACT house style of the plates rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (NEVER bright primary or cartoon colours), THIN clean outlines (NOT heavy black cartoon strokes), gentle soft shading with subtle dimensionality, and a distinct soft colour fill for each structure. Refined and elegant, NOT a bold-outlined flat cartoon. Subject: one ovoid eukaryotic budding yeast with a daughter bud at a narrow constricted neck and one short narrow germ tube. Quarter cut-away revealing a thin layered cell wall, a plasma-membrane line, a central nucleus with a nuclear envelope, two or three small mitochondria, one large vacuole, and endoplasmic reticulum stippled with ribosome dots. Eukaryotic only — no peptidoglycan, no nucleoid, no plasmids. No face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark charcoal uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color SEM of a single ovoid budding yeast (~3–5 µm) with a daughter bud at a constricted neck and a circular bud scar; smooth turgid slightly wrinkled surface, an optional short emerging germ tube; warm amber cell on a dark charcoal substrate, shallow depth of field, surface only, no internal structures. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical still with a gentle translucency/cut-away: a warm translucent yeast body with distinct tints for the layered wall, a blue-tinted nucleus with envelope, red-brown mitochondria, a pale large vacuole, and ER with ribosome speckles; a budding daughter at a constricted neck and a short hypha. Natural believable tones, not neon, not monochrome. Eukaryotic organelles only. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: one ovoid budding yeast with a daughter bud at a constricted neck and a short germ tube; a painterly cut-away reveals the layered cell wall, a central nucleus, one large vacuole, a few mitochondria and lightly stippled ribosomes. Eukaryotic, no bacterial features. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 4 attempt(s), 6103 tok, $0.155
- attempt 1 · `gemini-2.5-flash-image` · 10.5s — ❌ FAIL — correct anatomy but the whole cutaway was plastered with baked-in, misspelled text labels.
  ![textbook 1](theme/textbook/fungus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.6s — ✅ PASS — clean line-art cutaway: layered wall, membrane-bound nucleus, mitochondria, vacuole, ER+ribosomes, bud at a constricted neck, germ tube; no text.
  ![textbook 2](theme/textbook/fungus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 8.5s — ✅ PASS — re-rendered in colour: golden cell body, cyan membrane line, blue nucleus, teal vacuole, red-orange mitochondria, purple ER/ribosomes, bud at a constricted neck, germ tube. Matches the coloured house textbook style.
  ![textbook 3](theme/textbook/fungus.attempts/gen-03__gemini-2.5-flash-image.avif)
- attempt 4 · `gemini-2.5-flash-image` · 9.7s — ✅ PASS — re-rendered in the refined rod-bacterium/parasite textbook style: muted desaturated palette, thin outlines, soft shading.
  ![textbook 4](theme/textbook/fungus.attempts/gen-04__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/fungus.textbook.svg)
[interactive SVG](theme/textbook/fungus.textbook.svg) · [HTML](theme/textbook/fungus.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1440 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 9.6s — ✅ PASS — single ovoid budding yeast, daughter bud at a constricted neck, circular bud scar, short germ tube; surface only.
  ![sem 1](theme/sem/fungus.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1457 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 11.2s — ✅ PASS — cutaway with layered wall, membrane-bound nucleus, vacuole, mitochondria, ER+ribosomes; bud at a neck + germ tube.
  ![3d 1](theme/3d/fungus.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/fungus.3d.svg)
[interactive SVG](theme/3d/fungus.3d.svg) · [HTML](theme/3d/fungus.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3024 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 13.3s — ✅ PASS — watercolor cutaway: nucleus with nucleolus, large vacuole, mitochondria, ribosome dots, layered wall; bud + germ tube.
  ![watercolor 1](theme/watercolor/fungus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 9.6s — ✅ PASS — re-rendered full-bleed on warm aged paper (no sheet/mat/border), cocci/rod style; layered wall, nucleus, vacuole, mitochondria, bud + germ tube.
  ![watercolor 2](theme/watercolor/fungus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/fungus.watercolor.svg)
[interactive SVG](theme/watercolor/fungus.watercolor.svg) · [HTML](theme/watercolor/fungus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · CC BY 3.0 · Mogana Das Murtey and Patchamuthu Ramasamy — ✅ PASS — SEM field of budding yeast with clear daughter buds and bud scars (S. cerevisiae, CC BY 3.0); AI-cleaned to remove the scale bar and apply a natural warm false-color.
  ![reference](../reference-microscopy/theme/sem/fungus.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 4 | refined colour cutaway (rod/parasite style) |
| sem | ✅ teaching-ready | 1 | budding + bud scar |
| 3d | ✅ teaching-ready | 1 | eukaryotic interior |
| watercolor | ✅ teaching-ready | 2 | full-bleed paper (re-rendered) |
| reference SEM | ✅ verified + cleaned | 2 | S. cerevisiae, CC BY 3.0, cleaned |
