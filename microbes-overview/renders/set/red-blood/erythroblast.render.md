# Erythroblast — render log

**Set:** `red-blood` · **Microbe key:** `erythroblast`
**Short description:** Nucleated red-blood-cell precursor in bone marrow; a round cell with an eccentric, densely condensed "clock-face" nucleus, actively synthesising haemoglobin. Matures through four sub-stages (proerythroblast → basophilic → polychromatic → orthochromatic erythroblast) and finally ejects its nucleus to become a reticulocyte.

Metadata sidecar: [`erythroblast.render.meta.json`](erythroblast.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

An erythroblast (also called a normoblast) is the nucleated precursor stage of the red blood cell lineage in the bone marrow, sitting between the earlier proerythroblast and the anucleate reticulocyte/erythrocyte. Erythropoiesis proceeds through four morphologically defined erythroblast sub-stages, all round cells that progressively shrink and accumulate haemoglobin while their nucleus condenses: the proerythroblast (large, open lacy chromatin, 1-2 visible nucleoli, deeply basophilic cytoplasm, no haemoglobin yet); the basophilic erythroblast (smaller, coarser chromatin, nucleolus fading/gone, cytoplasm still strongly basophilic from a very high density of free polyribosomes making globin chains); the polychromatic (polychromatophilic) erythroblast (nucleus further condensed and often eccentric, cytoplasm now a mixed blue-grey/pink "polychromatic" colour because haemoglobin, which stains pink/eosinophilic, is accumulating alongside the still-abundant ribosomal RNA, which stains blue/basophilic); and the orthochromatic erythroblast (normoblast sensu stricto: small, densely pyknotic nucleus, cytoplasm now mostly pink/eosinophilic like a mature red cell because haemoglobin dominates and ribosome content has fallen). Across all stages the defining nuclear feature is progressive heterochromatin condensation into a coarse, radially-clumped "clock-face" or "cartwheel" pattern — alternating dark heterochromatin blocks and paler euchromatin gaps radiating from the centre — which is a classic bone-marrow-cytology teaching landmark, distinct from the smooth, dense, featureless pyknotic nucleus of the final orthochromatic stage. The cell is round (not disc-shaped like the mature erythrocyte it will become) and has a high nucleus-to-cytoplasm ratio that decreases stage by stage.

Internally it carries the ordinary organelle set needed to mass-produce haemoglobin: abundant free polyribosomes and some rough endoplasmic reticulum (translating globin mRNA), a modest Golgi apparatus, and mitochondria (which import iron via the transferrin-receptor/endosome pathway and carry out the first and last steps of haem synthesis). As haemoglobin accumulates, ribosomes and other organelles are progressively degraded, foreshadowing the near-total organelle clearance that will occur after nuclear extrusion. At the final orthochromatic-erythroblast step the cell polarises its pyknotic nucleus to one edge of the cell and extrudes it, surrounded by a thin rim of plasma membrane and cytoskeleton, in a process resembling asymmetric cytokinesis; the expelled nucleus is engulfed by a bone-marrow macrophage, and the remaining anucleate cell is now a reticulocyte. Erythroblasts develop attached to and surrounded by these central bone-marrow macrophages in structures called erythroblastic islands, which supply iron and support the maturation sequence; production of the whole lineage is driven by erythropoietin (EPO) from the kidney acting on earlier progenitors.

The representative teaching image for this page is the **polychromatic erythroblast**: round, with an eccentric, coarsely condensed "clock-face" nucleus, and cytoplasm reading as a mixed blue-grey/pink tone.

Sources: [Wikipedia — Erythroblast](https://en.wikipedia.org/wiki/Erythroblast), [Wikipedia — Erythropoiesis](https://en.wikipedia.org/wiki/Erythropoiesis), [Wikipedia — Erythroblastic island](https://en.wikipedia.org/wiki/Erythroblastic_island), [NCBI Bookshelf / StatPearls — Histology, Bone Marrow](https://www.ncbi.nlm.nih.gov/books/NBK534210/), [NCBI Bookshelf / StatPearls — Physiology, Erythropoiesis](https://www.ncbi.nlm.nih.gov/books/NBK500001/), Junqueira's Basic Histology, ch. 12 (Blood) — erythroblast maturation series and staining, [Palis J. 2014, "Primitive and definitive erythropoiesis in mammals", Frontiers in Physiology (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3958666/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus (condensed "clock-face" chromatin) | Zellkern (kondensiertes "Uhrblatt"-Chromatin) | holds the genome; coarse, radially-clumped heterochromatin pattern, eccentric | offset toward one side of the cell | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary of the round cell | outermost | core |
| `polychromatic_cytoplasm` | cytoplasma polychromaticum | Polychromatic cytoplasm (haemoglobin pink + ribosomal RNA blue) | Polychromatisches Zytoplasma (Hämoglobin-Rosa + ribosomale-RNA-Blau) | mixed staining reflects accumulating haemoglobin (pink/eosinophilic) alongside abundant ribosomal RNA (blue/basophilic) | fills the cell around the nucleus | core |
| `polyribosomes` | polyribosomata libera | Free polyribosomes (translating globin mRNA) | Freie Polyribosomen (übersetzen Globin-mRNA) | mass-produce globin chains for haemoglobin | dispersed through the cytoplasm | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | folds/processes some of the newly made globin protein | perinuclear region | core |
| `mitochondrion` | mitochondrion | Mitochondrion (iron import, haem synthesis) | Mitochondrium (Eisenaufnahme, Häm-Synthese) | imports iron via transferrin-receptor/endosome pathway; first and last steps of haem synthesis | dispersed in the cytoplasm, several | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/modifies proteins | near the nucleus | core |

### Do NOT draw (scientifically misleading)
- **No biconcave disc shape** — the erythroblast is round/spherical, not yet flattened into the mature erythrocyte's disc.
- **Do NOT draw it as anucleate** — unlike the mature erythrocyte or even the reticulocyte, the erythroblast still has a nucleus; that nucleus is the whole teaching point.
- **The nucleus must look condensed and coarse** (radiating clumped heterochromatin, "clock-face"/"cartwheel" pattern), NOT a large open lacy nucleus with a prominent nucleolus — that describes the earlier proerythroblast stage, one step before the erythroblast proper.
- **No cytoplasmic granules of any kind** (no azurophilic/primary or specific/secondary granules) — those belong to granulocyte precursors (myeloblasts/promyelocytes), not the erythroid line.
- **Do not make the cytoplasm uniformly deep blue** (that is the earlier basophilic-erythroblast look) **or uniformly plain red like a mature erythrocyte** — the representative teaching image is the polychromatic stage, so the cytoplasm should read as a mixed blue-grey and pink/salmon tone.
- **No cell wall, flagella or cilia** — this is a nucleated animal bone-marrow cell, not a bacterium or motile cell.
- **Not a dense sheet/rosette of many touching cells** — draw a single specimen (optionally with faint suggestion of a marrow macrophage nearby is acceptable but not required) so the internal structures stay individually readable.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed and used: **Wikimedia Commons — "Hem1PolychromaticErythroblast.jpg"**, an authentic light-microscopy photograph of a Wright/Giemsa-stained blood smear showing a single polychromatic erythroblast (normoblast) surrounded by mature erythrocytes — exactly the representative teaching stage described in §1.
- file: https://upload.wikimedia.org/wikipedia/commons/d/d0/Hem1PolychromaticErythroblast.jpg
- page: https://commons.wikimedia.org/wiki/File:Hem1PolychromaticErythroblast.jpg · License: **CC BY-SA 3.0** · Attribution: El*Falaf (Wikimedia Commons, own work)
AI visual verification result: **PASS (2026-08-14).** Single, clearly isolated nucleated cell centred in the frame with a dense, dark, irregularly-clumped nucleus (patchy lighter chromatin gaps consistent with the coarse "clock-face" condensation pattern) and a thin rim of blue-grey/lavender cytoplasm, surrounded by ordinary pink biconcave erythrocytes for scale — matches the polychromatic-erythroblast description well. Caveat: the original download is a small (360×363 px) crop, soft when upscaled to 1080². A **cleaned, recomposed, enlarged version** (erythroblast centred and filling more of the frame, clean uniform pale-pink background, no text/border) was produced with `edit_image.py` and is used for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Erythroblast — a busy little cell in your bone marrow's blood factory! Right now it still carries its own control-room nucleus, and it's using it to run one big project: packing itself full of haemoglobin, the special red stuff that will carry oxygen all around your body. The Erythroblast goes through several growing-up stages, changing colour a bit each time as it fills up. When the job is finally done, it does something no other cell in your body does — it pushes its own nucleus right out! A marrow helper cell scoops up the leftover nucleus, and what's left floats off as a fresh young reticulocyte, almost ready to become a full red blood cell.  
🇩🇪 Das ist der Erythroblast — eine fleißige kleine Zelle in der Blutfabrik deines Knochenmarks! Im Moment trägt er noch seinen eigenen Kontrollraum, den Zellkern, und nutzt ihn für ein großes Projekt: sich randvoll mit Hämoglobin zu füllen, dem besonderen roten Stoff, der später überall im Körper Sauerstoff transportiert. Der Erythroblast durchläuft dabei mehrere Wachstumsstufen und verändert dabei jedes Mal ein bisschen seine Farbe. Wenn die Arbeit endlich fertig ist, macht er etwas, das keine andere Zelle in deinem Körper tut — er stößt seinen eigenen Zellkern einfach aus! Eine Helferzelle im Knochenmark schnappt sich den übrig gebliebenen Kern, und was übrig bleibt, schwebt als frischer junger Retikulozyt davon, fast bereit, ein vollwertiges rotes Blutkörperchen zu werden.

**Adults (popular science, health).**  
🇬🇧 The erythroblast is the nucleated stage of red blood cell production, living out its short career inside the bone marrow rather than the bloodstream. Over several sub-stages it steadily fills itself with haemoglobin while its nucleus shrinks down into a dense, tightly packed clump — a distinctive look that lets lab scientists identify exactly which stage of maturation a given cell is at under the microscope. In the final step, the erythroblast physically ejects its own nucleus, an unusual feat among human cells, and the nucleus is cleared away by a resident marrow macrophage. What remains becomes a reticulocyte and, a day or two later, a fully mature red blood cell. The whole process is driven by erythropoietin, a hormone the kidneys release whenever the body senses it needs more oxygen-carrying capacity — which is also why erythropoietin levels and counts of these precursor cells are useful clues in diagnosing anaemia and other blood disorders.  
🇩🇪 Der Erythroblast ist das kernhaltige Stadium der Entstehung roter Blutkörperchen und verbringt seine kurze Karriere im Knochenmark statt im Blutkreislauf. Über mehrere Zwischenstufen füllt er sich stetig mit Hämoglobin, während sein Zellkern zu einem dichten, fest gepackten Klumpen zusammenschrumpft — ein charakteristisches Erscheinungsbild, an dem Laborfachleute unter dem Mikroskop genau erkennen können, in welcher Reifestufe sich eine bestimmte Zelle gerade befindet. Im letzten Schritt stößt der Erythroblast seinen eigenen Zellkern tatsächlich aus, eine unter menschlichen Zellen ungewöhnliche Leistung, und der Kern wird von einem ortsansässigen Makrophagen im Knochenmark entsorgt. Was übrig bleibt, wird zum Retikulozyten und ein bis zwei Tage später zu einem vollständig ausgereiften roten Blutkörperchen. Der gesamte Prozess wird durch Erythropoetin angetrieben, ein Hormon, das die Nieren immer dann ausschütten, wenn der Körper mehr Sauerstoff-Transportkapazität benötigt — weshalb Erythropoetin-Spiegel und die Zahl dieser Vorläuferzellen auch wichtige Hinweise bei der Diagnose von Anämien und anderen Bluterkrankungen liefern.

**Scientific.**  
🇬🇧 The erythroblast (normoblast) is the nucleated intermediate of the erythroid lineage, progressing through proerythroblast → basophilic → polychromatic → orthochromatic sub-stages within bone-marrow erythroblastic islands, typically anchored to a central macrophage. Maturation is marked by progressive haemoglobinisation, a falling nucleus-to-cytoplasm ratio, and stepwise heterochromatin condensation into the characteristic coarse, radially clumped ('clock-face') pattern, culminating at the orthochromatic stage in a small pyknotic nucleus. Cytoplasmic basophilia (from dense free polyribosomes translating globin mRNA on abundant rough ER) is progressively replaced by eosinophilia as haemoglobin accumulates, producing the diagnostic 'polychromatic' mixed staining at the intermediate stage. Mitochondria mediate transferrin-receptor-dependent iron uptake and the terminal step of haem biosynthesis (ferrochelatase). Terminal maturation culminates in enucleation: an asymmetric, actin-dependent extrusion of the condensed nucleus enclosed in a thin rim of plasma membrane, yielding a pyrenocyte that is phagocytosed by the niche macrophage, and a reticulocyte that subsequently clears residual organelles via autophagy. The lineage is regulated by erythropoietin (EPO) acting via the EPO receptor on earlier progenitors (BFU-E/CFU-E), with the erythroblast stage itself being largely EPO-independent but highly dependent on macrophage-supplied iron and adhesive signalling within the erythroblastic island niche.  
🇩🇪 Der Erythroblast (Normoblast) ist die kernhaltige Zwischenstufe der erythroiden Linie und durchläuft innerhalb erythroblastischer Inseln des Knochenmarks, meist an einen zentralen Makrophagen angeheftet, die Teilstadien Proerythroblast → basophiler → polychromatischer → orthochromatischer Erythroblast. Die Reifung ist gekennzeichnet durch fortschreitende Hämoglobinisierung, ein sinkendes Kern-Plasma-Verhältnis und eine stufenweise Kondensation des Heterochromatins zum charakteristischen groben, radiär geklumpten ('Uhrblatt'-)Muster, das im orthochromatischen Stadium in einem kleinen pyknotischen Kern gipfelt. Die zytoplasmatische Basophilie (durch dichte freie Polyribosomen, die Globin-mRNA am reichlich vorhandenen rauen ER translatieren) wird mit zunehmender Hämoglobinanreicherung schrittweise durch Eosinophilie ersetzt, was im mittleren Stadium die diagnostisch typische 'polychromatische' Mischfärbung ergibt. Mitochondrien vermitteln die transferrinrezeptor-abhängige Eisenaufnahme sowie den letzten Schritt der Häm-Biosynthese (Ferrochelatase). Die terminale Reifung mündet in die Enukleation: eine asymmetrische, aktinabhängige Ausstoßung des kondensierten Kerns, umhüllt von einem dünnen Plasmamembransaum, wodurch ein Pyrenozyt entsteht, der vom Nischen-Makrophagen phagozytiert wird, sowie ein Retikulozyt, der anschließend verbliebene Organellen durch Autophagie abbaut. Die Linie wird durch Erythropoetin (EPO) reguliert, das über den EPO-Rezeptor an früheren Vorläuferzellen (BFU-E/CFU-E) wirkt, während das Erythroblasten-Stadium selbst weitgehend EPO-unabhängig, aber stark auf die vom Makrophagen bereitgestellte Eisenversorgung und adhäsive Signale innerhalb der Nische der erythroblastischen Insel angewiesen ist.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human polychromatic erythroblast (normoblast), a round nucleated bone-marrow blood-cell precursor, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is perfectly round (NOT a biconcave disc), with a high nucleus-to-cytoplasm ratio. A neat quarter cut-away reveals the interior: a large, somewhat eccentric (offset to one side) round nucleus with a coarse, dark, radially-clumped 'clock-face' chromatin pattern (alternating dense dark heterochromatin blocks and paler gaps, NOT a smooth featureless nucleus and NOT a large open lacy nucleus with a nucleolus), surrounded by cytoplasm rendered in a mixed dusty blue-grey and salmon-pink tone (polychromatic staining) studded with tiny teal dots representing free polyribosomes, a small patch of folded rough endoplasmic reticulum near the nucleus, a compact curved Golgi stack, and a couple of small oval mitochondria. Anatomically faithful. Do NOT draw a biconcave disc shape, do NOT draw the cell as anucleate, do NOT give it a large open nucleus with a prominent nucleolus, do NOT add cytoplasmic granules, do NOT draw a cell wall, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE round human erythroblast (nucleated bone-marrow blood-cell precursor) resting among a few ordinary red blood cells on a subtly textured substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The erythroblast is a smooth-surfaced round cell, noticeably larger and more spherical than the neighbouring biconcave-disc red blood cells, with a gently domed bulge on one side hinting at the underlying eccentric nucleus. Render true 3D surface texture: soft rounded topology, subtle membrane texture, shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm rose to soft violet for the erythroblast, muted salmon-pink for the surrounding mature red blood cells, dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles or nucleus detail — just the round cell's smooth outer surface and its larger size/shape versus the flatter red blood cells. Anatomically faithful, single erythroblast specimen as the clear subject. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human polychromatic erythroblast, a round nucleated bone-marrow blood-cell precursor, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is perfectly spherical (not a biconcave disc), with a high nucleus-to-cytoplasm ratio. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so the structures are clearly distinguishable: a large, eccentric (offset) round nucleus rendered with a coarse, dark, radially-clumped 'clock-face' chromatin texture (alternating dense dark patches and paler gaps radiating from the centre), surrounded by cytoplasm in a soft mixed blue-grey and salmon-pink translucent tone, with tiny teal-dot free polyribosomes scattered through it, a small ribbon of rough endoplasmic reticulum near the nucleus, a compact Golgi stack, and a couple of small oval mitochondria with faint inner cristae. Natural colours, not near-monochrome and not neon. Do NOT render a biconcave disc shape, do NOT render the cell as anucleate, do NOT give it a large open lacy nucleus with a nucleolus, do NOT add cytoplasmic granules, do NOT render a cell wall, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human polychromatic erythroblast, a round nucleated bone-marrow blood-cell precursor, in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell; optionally a couple of small ordinary red blood cells nearby for scale. The cell is perfectly round (not a biconcave disc), with a high nucleus-to-cytoplasm ratio. A delicate painterly cut-away reveals the interior: a large, eccentric round nucleus painted with a coarse, dark, radially-clumped 'clock-face' chromatin pattern (dense ink-dark clumps separated by paler washed gaps, NOT a smooth uniform nucleus and NOT a large open nucleus with a prominent nucleolus), cytoplasm washed in a mixed dusty blue-grey and salmon-pink tone, fine teal dot stippling for free polyribosomes, a small ribbon of rough endoplasmic reticulum near the nucleus, a compact Golgi stack, and a couple of small oval mitochondria. Single specimen, anatomically faithful. Do NOT paint a biconcave disc shape, do NOT paint the cell as anucleate, do NOT add cytoplasmic granules, do NOT paint a cell wall, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3381 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 13.6s — fail (gemini-2.5-flash-image, baked-in gibberish text labels on the rough ER and Golgi structures - violates no-baked-text rule, superseded)
  ![textbook 1](theme/textbook/erythroblast.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 21.9s — pass (gemini-2.5-flash-image; clean cutaway, eccentric round nucleus with coarse radially-clumped "clock-face" chromatin, mixed blue-grey/salmon polychromatic cytoplasm, free polyribosomes, rough ER, Golgi, mitochondria, no text, matches exemplar palette/line style)
  ![textbook 2](theme/textbook/erythroblast.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/erythroblast.textbook.svg)
[interactive SVG](theme/textbook/erythroblast.textbook.svg) · [HTML](theme/textbook/erythroblast.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1563 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.9s — pass (gemini-2.5-flash-image; single smooth-surfaced round cell distinctly larger than neighbouring biconcave erythrocytes, false-colour rose/violet vs salmon-pink RBCs, surface-only detail (no internal organelles, correct for SEM), no text, no border)
  ![sem 1](theme/sem/erythroblast.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3390 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 17.6s — fail (gemini-2.5-flash-image, baked-in gibberish text labels on mitochondria/RER structures - violates no-baked-text rule, superseded)
  ![3d 1](theme/3d/erythroblast.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 19.3s — pass (gemini-2.5-flash-image; spherical translucent cell, eccentric nucleus with clock-face chromatin texture, natural biological tints, polyribosomes/RER/Golgi/mitochondria with cristae visible, no text, no border)
  ![3d 2](theme/3d/erythroblast.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/erythroblast.3d.svg)
[interactive SVG](theme/3d/erythroblast.3d.svg) · [HTML](theme/3d/erythroblast.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1665 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.4s — pass (gemini-2.5-flash-image; full-bleed aged paper background, hand-painted single round cell with ink-dark clock-face nucleus, mixed blue/pink washes, RER/Golgi/mitochondria/polyribosome dots, two erythrocytes for scale, no border/frame)
  ![watercolor 1](theme/watercolor/erythroblast.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/erythroblast.watercolor.svg)
[interactive SVG](theme/watercolor/erythroblast.watercolor.svg) · [HTML](theme/watercolor/erythroblast.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `Light microscopy (blood smear, Wright-Giemsa stain)` · CC BY-SA 3.0 · El*Falaf (Wikimedia Commons) — pass (Wikimedia Commons "Hem1PolychromaticErythroblast.jpg", CC BY-SA 3.0, El*Falaf; light micrograph of Wright/Giemsa-stained blood smear showing a single polychromatic erythroblast with dense irregularly-clumped nucleus and thin blue-grey/lavender cytoplasm rim, surrounded by mature erythrocytes - matches representative teaching stage. Cleaned/recomposed/enlarged version used for display)
  ![reference](../reference-microscopy/theme/real/erythroblast.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | use as final; accurate cutaway with clock-face nucleus and polychromatic cytoplasm, matches exemplar palette/line style, no baked text after re-render |
| sem | pass | 1 | use as final; correct false-colour surface-only rendering, size/shape distinction vs neighbouring erythrocytes |
| 3d | pass | 2 | use as final; correct internal layering and natural tints, no baked text after re-render |
| watercolor | pass | 1 | use as final; full-bleed aged-paper composition with all core structures visible |
