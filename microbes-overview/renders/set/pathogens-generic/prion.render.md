# Prion (misfolded-protein archetype) — render log

**Set:** `pathogens-generic` · **Microbe key:** `prion`
**Short description:** Not a cell and not a virus — an infectious misfolded protein (PrP^Sc) that templates the conversion of normal α-helical PrP^C into β-sheet-rich copies, which stack into amyloid fibrils. Causes Creutzfeldt-Jakob disease and BSE.

Metadata sidecar: [`prion.render.meta.json`](prion.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

A prion is **not a living organism, not a cell and not a virus** — it is a single **misfolded protein**. The normal cellular prion protein **PrP^C** is a GPI-anchored cell-surface protein whose folded core is **rich in α-helices** (three α-helices plus a short two-strand β-sheet) and is **protease-sensitive**. The disease form **PrP^Sc** has the *same* amino-acid sequence but a radically different fold: it is **β-sheet-rich** (roughly 43–61% β-sheet), **protease-resistant** and **aggregation-prone**. PrP^Sc acts as a **template (seeded conversion)**: it binds a normal PrP^C molecule and coerces it into the misfolded PrP^Sc shape, so one misfolded protein begets two, and so on. The misfolded copies **stack into amyloid fibrils / plaques** that accumulate in the brain. There is no nucleic acid involved at any step.

The teaching image must show the **CONVERSION concept**: an α-helix-rich PrP^C protein (left) being converted, on contact with existing PrP^Sc, into a β-sheet-rich PrP^Sc protein, and PrP^Sc monomers stacking into a growing **amyloid fibril**. Labels are protein-structure concepts, not cell parts.

Sources: [RCSB PDB-101 *Molecule of the Month: Prions*](https://pdb101.rcsb.org/motm/101), [Baskakov et al., *The Structure of PrP^Sc Prions* (PMC5874746)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5874746/), [Wang et al., *Cryo-EM structure of an amyloid fibril formed by full-length human prion protein*, Nat. Struct. Mol. Biol. 2020 (PDB 6LNI)](https://www.nature.com/articles/s41594-020-0441-5), [Wikipedia: *Prion*](https://en.wikipedia.org/wiki/Prion).

### Parts / concepts to label (Latin · English · German)

| key | Latin / scientific | English | German | function / meaning | where | variable? |
|---|---|---|---|---|---|---|
| `prp_c` | PrP^C (proteina prionica cellularis) | PrP^C (normal prion protein) | PrP^C (normales Prionprotein) | healthy, α-helix-rich, protease-sensitive fold; the raw material that gets converted | left / incoming protein | core |
| `prp_sc` | PrP^Sc (proteina prionica "scrapie") | PrP^Sc (misfolded prion protein) | PrP^Sc (fehlgefaltetes Prionprotein) | infectious β-sheet-rich, protease-resistant fold; the template | right / converted protein & fibril | core |
| `alpha_helix` | helix alpha | α-helix | α-Helix | coiled ribbon segment dominating the *normal* PrP^C fold | inside PrP^C | core |
| `beta_sheet` | lamina beta (plicata) | β-sheet | β-Faltblatt | flat pleated arrows dominating the *misfolded* PrP^Sc fold | inside PrP^Sc | core |
| `templated_conversion` | conversio exemplata (nucleatio seminata) | Templated conversion (seeding) | Template-Umfaltung (Keimbildung) | PrP^Sc contacts PrP^C and forces it into the misfolded shape — the self-propagation step | contact point / arrow between the two | core |
| `amyloid_fibril` | fibrilla amyloidea | Amyloid fibril | Amyloidfibrille | stacked, ordered aggregate of many PrP^Sc molecules — the growing infectious rod/plaque | right, elongating stack | core |

### Do NOT draw (scientifically misleading)
- **It is NOT a cell** — no plasma membrane, no cell wall, no nucleus, no cytoplasm, no organelles, no ribosomes.
- **It is NOT a virus** — no capsid, no envelope, no spikes, no viral particle shape.
- **No DNA or RNA anywhere** — a prion carries no nucleic acid genome of any kind.
- **No face, no eyes, no anthropomorphism** — it is a molecule, not a creature; do not make it "cute/alive".
- Do not depict it as a free-swimming living organism with flagella/cilia/pili.
- Do not draw PrP^C and PrP^Sc as *different* molecules with different sequences — they are the **same protein in two folds**; the only difference to show is α-helix-rich vs β-sheet-rich shape.
- Do not show the amyloid fibril as a random blob — it is an **ordered, repetitive stack** of β-sheet layers.

---

## 2. Real microscopy reference (own set `reference-microscopy`)

Chosen: **`File:PDB_6DU9.png`** — a **CC0 / public-domain** PyMOL ribbon diagram of the **human prion protein (residues 90–231, PDB 6DU9)**, clearly showing the α-helix-rich globular fold of the normal cellular PrP. This is a molecular-structure reference (not an EM micrograph): it depicts the **PrP^C-type α-helical fold** that the render's "normal protein" must match. Single molecule, clean background.
- file: https://upload.wikimedia.org/wikipedia/commons/4/4c/PDB_6DU9.png
- page: https://commons.wikimedia.org/wiki/File:PDB_6DU9.png · License: **CC0 1.0 (public-domain dedication)** · Boghog (PyMOL, PDB 6DU9)
- AI visual verification result: **PENDING** — to be confirmed after fetch.

Backups:
- **`File:Scrapie_prions.jpg`** — real photomicrograph of **PrP^Sc (red immunostain) accumulating between neurons** in scrapie-infected mouse brain tissue; shows actual prion pathology in situ (a field of tissue, not a single molecule).
  - file: https://upload.wikimedia.org/wikipedia/commons/a/a1/Scrapie_prions.jpg
  - page: https://commons.wikimedia.org/wiki/File:Scrapie_prions.jpg · License: **Public Domain (US federal government work)** · NIAID
  - AI visual verification result: **PENDING** — to be confirmed after fetch.
- **`File:Priony.png`** — ribbon model of the prion protein highlighting the **E200K mutation** linked to familial Creutzfeldt-Jakob disease; a second view of the PrP fold.
  - file: https://upload.wikimedia.org/wikipedia/commons/8/84/Priony.png
  - page: https://commons.wikimedia.org/wiki/File:Priony.png · License: **CC BY-SA 3.0 / GFDL** (attribution required) · Filip em
  - AI visual verification result: **PENDING** — to be confirmed after fetch.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 A prion isn't alive at all — it's just one of your own body's proteins that got folded into the wrong shape, like a piece of origami crumpled the wrong way. The tricky part is that when this wrongly-folded protein bumps into a normal one, it forces the normal one to crumple up exactly the same way, and then those force the next ones — so the wrong shape keeps spreading. Your body can't really fight it: there's nothing alive to catch, and it's so small your defences don't notice it. Luckily prions are extremely rare, and people mostly stay safe just by not eating infected meat and by super-carefully cleaning doctors' tools.  
🇩🇪 Ein Prion lebt überhaupt nicht — es ist einfach eines der Eiweiße aus deinem eigenen Körper, das sich in die falsche Form gefaltet hat, wie ein Origami, das falsch geknickt wurde. Das Fiese daran: Wenn dieses falsch gefaltete Eiweiß auf ein normales trifft, zwingt es das normale in genau dieselbe falsche Form, und diese knicken dann die nächsten um — so breitet sich die falsche Form immer weiter aus. Dein Körper kann sich kaum wehren: Es gibt nichts Lebendiges zum Fangen, und es ist so winzig, dass deine Abwehr es gar nicht bemerkt. Zum Glück sind Prionen sehr selten, und man bleibt sicher, indem man kein infiziertes Fleisch isst und Arztwerkzeuge ganz besonders gründlich reinigt.

**Adults (popular science, health).**  
🇬🇧 A prion breaks the usual rules of infection: it carries no DNA or RNA and isn't even alive — it is a single misfolded protein, the "protein-only" agent proposed by Stanley Prusiner. A normal harmless protein already sitting in your cells (PrP) can flip into a rogue fold that then acts as a template, forcing neighbouring copies of the same protein to misfold too, so the damage self-propagates and clumps into deposits that slowly destroy brain tissue. Prions cause Creutzfeldt-Jakob disease in people, BSE ("mad cow disease") in cattle, and kuru, once spread by ritual cannibalism. Because there's no organism and no genetic material, the misfolded protein shrugs off ordinary cooking heat, radiation and most disinfectants that would kill bacteria or viruses. There is no cure yet, so the whole game is prevention: keeping infected tissue out of the food chain and rigorously sterilising surgical instruments.  
🇩🇪 Ein Prion bricht die üblichen Regeln der Infektion: Es trägt keine DNA oder RNA und lebt nicht einmal — es ist ein einzelnes fehlgefaltetes Eiweiß, der von Stanley Prusiner vorgeschlagene "Nur-Protein"-Erreger. Ein normales, harmloses Eiweiß, das ohnehin in deinen Zellen sitzt (PrP), kann in eine bösartige Faltung umkippen, die dann als Vorlage wirkt und benachbarte Kopien desselben Eiweißes zwingt, sich ebenfalls falsch zu falten — so vermehrt sich der Schaden von selbst und lagert sich zu Ablagerungen zusammen, die langsam das Hirngewebe zerstören. Prionen verursachen beim Menschen die Creutzfeldt-Jakob-Krankheit, beim Rind BSE ("Rinderwahn") und Kuru, das einst durch rituellen Kannibalismus übertragen wurde. Weil es weder einen Organismus noch Erbmaterial gibt, übersteht das fehlgefaltete Eiweiß normale Kochhitze, Strahlung und die meisten Desinfektionsmittel, die Bakterien oder Viren töten würden. Eine Heilung gibt es bisher nicht, deshalb zählt allein die Vorbeugung: infiziertes Gewebe aus der Nahrungskette fernhalten und chirurgische Instrumente streng sterilisieren.

**Scientific.**  
🇬🇧 A prion is an infectious agent composed solely of protein, containing no nucleic acid genome. The normal cellular isoform PrP^C is a GPI-anchored, α-helix-rich and protease-sensitive protein; the pathogenic isoform PrP^Sc shares the identical amino-acid sequence but adopts a β-sheet-rich, protease-resistant and aggregation-prone conformation. PrP^Sc propagates by seeded (templated) conversion: it binds PrP^C and catalyses its refolding into the PrP^Sc conformation, and the accumulating monomers stack into ordered amyloid fibrils and plaques. This self-templating aggregation underlies the transmissible spongiform encephalopathies — including Creutzfeldt-Jakob disease, variant CJD, kuru, and bovine spongiform encephalopathy — which are characterised by neuronal loss and spongiform vacuolation. The absence of any nucleic acid and the extreme conformational stability of PrP^Sc explain its resistance to conventional heat, irradiation and chemical decontamination.  
🇩🇪 Ein Prion ist ein Infektionserreger, der ausschließlich aus Protein besteht und kein Nukleinsäure-Genom enthält. Die normale zelluläre Isoform PrP^C ist ein GPI-verankertes, α-Helix-reiches und protease-empfindliches Protein; die pathogene Isoform PrP^Sc besitzt dieselbe Aminosäuresequenz, nimmt aber eine β-Faltblatt-reiche, protease-resistente und aggregationsanfällige Konformation an. PrP^Sc vermehrt sich durch keimvermittelte (templatgesteuerte) Umfaltung: Es bindet PrP^C und katalysiert dessen Umfaltung in die PrP^Sc-Konformation, und die sich anhäufenden Monomere lagern sich zu geordneten Amyloidfibrillen und Plaques zusammen. Diese selbsttemplatierende Aggregation liegt den übertragbaren spongiformen Enzephalopathien zugrunde — darunter die Creutzfeldt-Jakob-Krankheit, die Variante CJK, Kuru und die bovine spongiforme Enzephalopathie (BSE) —, die durch Neuronenverlust und schwammartige Vakuolisierung gekennzeichnet sind. Das Fehlen jeglicher Nukleinsäure und die extreme Konformationsstabilität von PrP^Sc erklären seine Resistenz gegenüber üblicher Hitze, Bestrahlung und chemischer Dekontamination.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean textbook illustration on a dark uncluttered background: LEFT a normal PrP^C protein dominated by coiled α-helix ribbons (warm tint), RIGHT a misfolded PrP^Sc dominated by flat pleated β-sheet arrows (cool/red tint), a bold arrow of templated conversion between them, and several PrP^Sc units stacking into an ordered amyloid fibril on the right. Semi-flat vector shading, crisp boundaries. NOT a cell and NOT a virus — no membrane, capsid, DNA/RNA, face or organelles. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color SEM of prion amyloid fibrils: fine, elongated, slightly twisted intertwining protein filaments on a subtly textured substrate, shallow depth of field, warm amber fibrils on dark charcoal. Only fibrillar protein aggregate — no cell, no membrane, no capsid, no organelles, no nucleic acid. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D molecular render on a clean dark studio background: a warm translucent α-helical PrP^C on the left, a distinctly red/cool β-sheet-rich PrP^Sc on the right, a clear conversion arrow showing seeding, and PrP^Sc monomers snapping into a neat elongating amyloid-fibril stack. Subsurface scattering, gentle rim light, natural tints that separate α-helix from β-sheet. NOT a cell or virus — no membrane, capsid, genome or face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: on the LEFT a globular protein of coiled alpha-helix ribbons (normal PrP-C), a painted arrow pointing right, and on the RIGHT the same protein refolded into flat pleated beta-sheet ribbons stacking into an ordered amyloid fibril (misfolded PrP-Sc). NOT a cell and NOT a virus — no membrane, organelles, capsid, DNA or RNA double helix, or face. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1479 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 8.6s — ✅ PASS — α-helix PrP^C → arrow → β-sheet PrP^Sc → ordered amyloid fibril; protein structure only, no text/cell/virus/DNA.
  ![textbook 1](theme/textbook/prion.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/prion.textbook.svg)
[interactive SVG](theme/textbook/prion.textbook.svg) · [HTML](theme/textbook/prion.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1431 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 11.4s — ✅ PASS — fine elongated twisted amyloid fibrils only; no cell/capsid/text.
  ![sem 1](theme/sem/prion.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1478 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 9.3s — ✅ PASS — α-helical PrP^C converting via an arrow into a stacked β-sheet amyloid fibril; protein structure only.
  ![3d 1](theme/3d/prion.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/prion.3d.svg)
[interactive SVG](theme/3d/prion.3d.svg) · [HTML](theme/3d/prion.3d.html)

### Watercolor plate (`watercolor`) — 4 attempt(s), 6098 tok, $0.155
- attempt 1 · `gemini-2.5-flash-image` · 11.2s — ❌ FAIL — baked-in 'PrPC/PrPsc' text + a DNA-like double helix.
  ![watercolor 1](theme/watercolor/prion.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 11.1s — ⚠️ content correct (α-helix → β-sheet stack) but a dark mat/frame around the paper.
  ![watercolor 2](theme/watercolor/prion.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 9.2s — ✅ PASS — cream paper fills the frame (no mat); α-helix PrP^C → arrow → stacked β-sheet amyloid fibril; no text/DNA.
  ![watercolor 3](theme/watercolor/prion.attempts/gen-03__gemini-2.5-flash-image.avif)
- attempt 4 · `gemini-2.5-flash-image` · 10.5s — ✅ PASS — re-rendered full-bleed on aged paper (no sheet/mat), cocci/rod style; α-helix PrP^C → arrow → stacked β-sheet amyloid fibril; no text/DNA.
  ![watercolor 4](theme/watercolor/prion.attempts/gen-04__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/prion.watercolor.svg)
[interactive SVG](theme/watercolor/prion.watercolor.svg) · [HTML](theme/watercolor/prion.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `EM` · CC BY 2.0 · NIAID / Roger Moore, Rocky Mountain Laboratories — ✅ PASS — genuine NIAID negative-stain TEM of purified PrP amyloid fibrils (the aggregated misfolded prion protein), CC BY 2.0; colorized (warm amber fibrils on cool blue) for teaching consistency while preserving all fibril detail — no text/border/reinvented structures.
  ![reference](theme/em/prion.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | conversion concept |
| sem | ✅ teaching-ready | 1 | amyloid fibrils |
| 3d | ✅ teaching-ready | 1 | conversion + stacking |
| watercolor | ✅ teaching-ready | 4 | full-bleed paper (re-rendered) |
| reference EM | ✅ verified · real micrograph | 1 | NIAID PrP amyloid fibrils TEM, CC BY 2.0 |
