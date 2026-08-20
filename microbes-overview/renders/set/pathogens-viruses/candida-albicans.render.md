# Candida albicans — render log

**Set:** `pathogens-viruses` · **Microbe key:** `candida-albicans`
**Short description:** Dimorphic yeast (~3–6 µm ovoid) that lives harmlessly in the mouth, gut and genital tract; when immunity weakens or after antibiotics it switches to invasive hyphae and can cause thrush or serious bloodstream infection. Kept in check by Th17 cells, neutrophils and the mucosal microbiome.

Metadata sidecar: [`candida-albicans.render.meta.json`](candida-albicans.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Candida albicans* is a **polymorphic eukaryotic fungus**. Its baseline form is a single **ovoid-to-round budding yeast (blastospore)**, roughly **3–6 µm** across — clearly larger and rounder than a bacterium — that reproduces by **budding**: a smaller daughter cell balloons from the mother at a constricted **bud neck** and leaves a circular **bud scar** on the mother wall after separation. As a **eukaryote** the archetype must show a membrane-bound **nucleus** (with a nuclear envelope) plus other organelles — one or more **mitochondria**, a large **vacuole**, and **endoplasmic reticulum** studded with **ribosomes (80S)** — all enclosed by the **plasma membrane**. The boundary is a layered **cell wall**: an inner **chitin** skeleton, a **β-1,3/β-1,6-glucan** middle layer, and an outer fibrillar coat of **mannoproteins** (adhesins that mediate attachment and immune recognition) — chemistry with no counterpart in human cells and **no peptidoglycan**.

The trait that defines *C. albicans* clinically is **dimorphism**: under host cues (37 °C, neutral pH, serum, CO₂) the yeast projects a **germ tube** that extends into a true **hypha** — a narrow, parallel-sided filament with a roughly constant width and internal cross-walls (**septa**), no constriction at its origin. Elongated chains of budded cells that stay attached and are pinched at the septa are **pseudohyphae**. The reference plate should show a yeast cell with a daughter bud plus one short germ tube / young hypha to signal this switch; the yeast–hypha transition is the core virulence feature (tissue invasion, biofilm scaffolding).

Sources: [StatPearls *Candidiasis* (NCBI Bookshelf, NBK560624)](https://www.ncbi.nlm.nih.gov/books/NBK560624/), [Gow & Hube, *Importance of the Candida albicans cell wall* (Curr Opin Microbiol, PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3722498/), [Sudbery et al., *The distinct morphogenic states of Candida albicans* (Trends in Microbiology)](https://www.sciencedirect.com/science/article/abs/pii/S0966842X04001180), [CDC — *Candida* / candidiasis](https://www.cdc.gov/candidiasis/about/index.html).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `cell_wall` | paries cellularis (chitina, β-glucanum, mannoproteina) | Cell wall (chitin/β-glucan) | Zellwand (Chitin/β-Glucan) | rigid layered shell: shape, strength, adhesion & immune target; NOT peptidoglycan | outer boundary | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Plasmamembran | controls transport; ergosterol-rich (antifungal target) | just inside the wall | core |
| `nucleus` | nucleus (involucrum nucleare) | Nucleus (nuclear envelope) | Zellkern (Kernhülle) | membrane-bound genome; defines eukaryote | central, one per cell | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | aerobic energy (ATP) generation | cytoplasm | core |
| `vacuole` | vacuolum | Vacuole | Vakuole | storage, pH/ion balance, degradation | large, often single | core |
| `er_ribosomes` | reticulum endoplasmicum · ribosoma (80S) | ER & ribosomes (80S) | ER & Ribosomen (80S) | protein/lipid synthesis; 80S ribosomes | around nucleus / dispersed | core |
| `bud` | gemma (cellula filialis) | Bud (daughter cell) | Knospe (Tochterzelle) | new yeast cell budding off at a constricted neck | on the mother surface | core |
| `germ_tube` | tubus germinalis / hypha | Germ tube / hypha | Keimschlauch / Hyphe | narrow parallel-sided filament: invasive dimorphic form | evaginating from the cell | variable |
| `bud_scar` | cicatrix gemmalis | Bud scar | Knospennarbe | chitin-rich ring left after a bud separates | mother wall, prior sites | optional |

### Do NOT draw (scientifically misleading)
- **No peptidoglycan wall, no nucleoid, no plasmids, no flagellum** — those are bacterial; this is a eukaryote.
- **Do not omit the nucleus** — the membrane-bound nucleus is the whole point; keep mitochondria + vacuole (real organelles, not artifacts).
- **Not prokaryotic** — no 70S ribosomes, no Gram envelope; ribosomes here are 80S.
- **No thick polysaccharide capsule** — a prominent capsule belongs to *Cryptococcus*, not *Candida*; omit.
- **Do not size it like a bacterium** — yeasts are ~3–6 µm, several times bigger and rounder than a rod.
- The **bud** attaches by a constricted neck (not a detached floating sphere); the **germ tube / hypha** is a narrow parallel-sided tube of roughly constant width, NOT a chain of round cells and NOT constricted at its base.
- No face, no anthropomorphism.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **Wikimedia Commons — *Candida albicans* bright-field light micrograph** by Y tambe — budding *C. albicans* yeast cells (ATCC 10231, 600×), clearly showing the ovoid yeast form and budding, single species, freely licensed.
- file: https://upload.wikimedia.org/wikipedia/commons/6/65/C_albicans_budding1.jpg
- page: https://commons.wikimedia.org/wiki/File:C_albicans_budding1.jpg · License: **CC BY-SA 3.0 / GFDL** · Y tambe
- backups:
  - **CDC PHIL #3192** — Gomori methenamine silver–stained *C. albicans* showing yeast plus pseudohyphae/hyphae, **Public Domain** (CDC / Dr. Godfrey): page https://commons.wikimedia.org/wiki/File:Candida_albicans_PHIL_3192_lores.jpg · file https://upload.wikimedia.org/wikipedia/commons/2/2d/Candida_albicans_PHIL_3192_lores.jpg
  - **CDC PHIL #291** — fluorescent-antibody-stained oval budding *C. albicans* yeast cells, **Public Domain** (CDC / Maxine Jalbert, Dr. Leo Kaufman).
AI visual verification result: see §2 verdict after fetch (below).
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Hi, I'm Candida — a round, squishy yeast, not a bacterium! I usually live quietly in your mouth, tummy, and other cozy warm spots, minding my own business and even helping keep things balanced. I make new yeast babies by budding: a little bump grows on my side and pops off as a brand-new me! But if you take strong medicine that clears out my neighbours, or your body's defences are having a tough week, I can grow long stringy arms called hyphae and get pushy, causing an itchy rash called thrush. A dab of antifungal cream from the pharmacy usually sends me back to behaving myself.  
🇩🇪 Hallo, ich bin Candida — eine runde, weiche Hefe, kein Bakterium! Normalerweise wohne ich ganz ruhig in deinem Mund, deinem Bauch und anderen warmen, gemütlichen Ecken und mische mich nicht ein, ich helfe sogar, das Gleichgewicht zu halten. Neue Hefe-Babys mache ich durch Knospung: An meiner Seite wächst ein kleines Beulchen und ploppt als brandneues Ich ab! Aber wenn starke Medikamente meine Nachbarn wegputzen oder die Abwehrkräfte mal eine schwache Woche haben, kann ich lange fädige Arme, Hyphen genannt, wachsen lassen und frech werden — das nennt man dann Soor, ein juckender Ausschlag. Eine Salbe aus der Apotheke schickt mich meistens wieder zurück ins brave Verhalten.

**Adults (popular science, health).**  
🇬🇧 Candida albicans is a yeast that lives as a normal, usually harmless resident of the mouth, gut, skin and vaginal microbiome in most healthy people. Problems start when the balance tips: antibiotics wiping out competing bacteria, a weakened immune system, diabetes, or simply warm, moist skin can let it overgrow and switch from its round budding-yeast form into invasive, thread-like hyphae. The result ranges from a mildly annoying case of oral or vaginal thrush to, in severely immunocompromised patients, a dangerous bloodstream infection. Topical or oral antifungal medication clears most infections, and simple measures — keeping skin dry, treating underlying conditions, avoiding unnecessary antibiotics — go a long way toward keeping Candida in its usual, well-behaved state.  
🇩🇪 Candida albicans ist eine Hefe, die bei den meisten gesunden Menschen ganz normal und meist harmlos im Mund, Darm, auf der Haut und in der Vaginalflora lebt. Probleme entstehen, wenn das Gleichgewicht kippt: Antibiotika, die konkurrierende Bakterien wegräumen, ein geschwächtes Immunsystem, Diabetes oder einfach warme, feuchte Haut können ihr übermäßiges Wachstum begünstigen, wobei sie von der runden, knospenden Hefeform in fadenförmige, invasive Hyphen wechselt. Das Ergebnis reicht von einem leicht lästigen Mund- oder Vaginalsoor bis hin, bei stark immungeschwächten Patienten, zu einer gefährlichen Blutbahninfektion. Lokale oder orale antimykotische Medikamente heilen die meisten Infektionen, und einfache Maßnahmen — die Haut trocken halten, Grunderkrankungen behandeln, unnötige Antibiotika vermeiden — helfen sehr, Candida in ihrem gewohnten, gutartigen Zustand zu halten.

**Scientific.**  
🇬🇧 Candida albicans is a polymorphic, diploid ascomycetous fungus and the most common cause of human candidiasis. Its commensal blastospore form is an ovoid budding yeast (~3-6 µm) enclosed by a chitin-β-glucan-mannoprotein cell wall; under host-derived cues (37 °C, neutral pH, serum, CO2, N-acetylglucosamine) it undergoes a morphogenetic switch to true septate hyphae via germ-tube formation, a transition governed by cAMP-PKA and MAPK signalling (Cph1, Efg1) and central to tissue invasion and biofilm formation. Mucosal homeostasis is maintained chiefly by Th17-driven IL-17/IL-22 responses, neutrophil and macrophage phagocytosis via Dectin-1 and TLR recognition of wall β-glucans and mannans, and competitive exclusion by the resident bacterial microbiota. Disruption of any of these — antibiotic-induced dysbiosis, neutropenia, HIV/AIDS-associated Th17 depletion, or breached mucosal/epithelial barriers (central venous catheters) — permits overgrowth and hyphal invasion, ranging from superficial mucocutaneous candidiasis to life-threatening candidemia and disseminated disease.  
🇩🇪 Candida albicans ist ein polymorpher, diploider Schlauchpilz (Ascomycet) und der häufigste Erreger humaner Candidosen. Seine kommensale Blastosporenform ist eine ovoide, knospende Hefezelle (ca. 3-6 µm), umgeben von einer Chitin-β-Glucan-Mannoprotein-Zellwand; unter wirtsabhängigen Signalen (37 °C, neutraler pH, Serum, CO2, N-Acetylglucosamin) vollzieht sie über die Bildung eines Keimschlauchs einen morphogenetischen Wechsel zu echten septierten Hyphen, gesteuert durch cAMP-PKA- und MAPK-Signalwege (Cph1, Efg1) und zentral für Gewebeinvasion und Biofilmbildung. Die Homöostase der Schleimhäute wird vor allem durch Th17-vermittelte IL-17/IL-22-Antworten, Phagozytose durch Neutrophile und Makrophagen über Dectin-1 und TLR-Erkennung von Wand-β-Glucanen und Mannanen sowie durch kompetitive Verdrängung durch die residente Bakterienflora aufrechterhalten. Wird eines dieser Systeme gestört — antibiotikabedingte Dysbiose, Neutropenie, HIV/AIDS-assoziierter Th17-Verlust oder durchbrochene Schleimhaut-/Epithelbarrieren (zentralvenöse Katheter) — kann es zu Überwucherung und Hyphen-Invasion kommen, von oberflächlicher mukokutaner Candidose bis zu lebensbedrohlicher Candidämie und disseminierter Erkrankung.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway in the EXACT house style of the plates rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (NEVER bright primary or cartoon colours), THIN clean outlines (NOT heavy black cartoon strokes), gentle soft shading with subtle dimensionality, and a distinct soft colour fill for each structure. Refined and elegant, NOT a bold-outlined flat cartoon. Subject: one ovoid eukaryotic budding yeast cell of Candida albicans with a smaller daughter bud at a narrow constricted neck and one short narrow parallel-sided germ tube / young hypha (constant width, NOT a chain of round cells, not constricted at its base) extending from the cell. Quarter cut-away revealing a thin layered cell wall, a plasma-membrane line just inside it, a central round nucleus with a nuclear envelope, two or three small oval mitochondria, one large pale vacuole, and endoplasmic reticulum stippled with tiny ribosome dots. Eukaryotic only — no peptidoglycan, no nucleoid, no plasmids, no flagellum, no thick capsule. No face, no anthropomorphism. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars and NOT drawn as a sheet on a surface. Neutral dark charcoal uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph of a single ovoid Candida albicans budding yeast cell (~3-6 um) with a smaller daughter bud at a constricted neck and a faint circular bud scar; smooth turgid slightly wrinkled surface, plus one short parallel-sided germ tube / young hypha emerging from the cell body. Crisp 3D surface texture, cool studio microscopy lighting, shallow depth of field so the far side falls softly out of focus, specimen resting on a subtly textured neutral substrate; warm amber-to-bronze cell on a dark charcoal background. Surface only, render NO internal structures. Single specimen. Square 1:1, 1080x1080, centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a single Candida albicans budding yeast with a gentle translucency / cut-away: a warm translucent ovoid cell body with distinct natural tints for the layered cell wall, a blue-tinted round nucleus with a nuclear envelope, two or three red-brown mitochondria, one pale large vacuole, and endoplasmic reticulum with fine ribosome speckles; a rounded daughter bud at a constricted neck and one short narrow parallel-sided germ tube / young hypha. Soft global illumination, subsurface scattering on the membranes, gentle rim light, clean seamless dark studio background. Natural believable biological tones, not neon, not near-monochrome. Eukaryotic organelles only — no bacterial features, no capsule, no face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: one ovoid Candida albicans budding yeast with a smaller daughter bud at a constricted neck and one short narrow parallel-sided germ tube / young hypha; a painterly cut-away reveals the layered cell wall, a plasma-membrane line, a central round nucleus, one large vacuole, a few small mitochondria and lightly stippled ribosomes. Eukaryotic, no bacterial features, no capsule, no face. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 3 attempt(s), 5077 tok, $0.116
- attempt 1 · `gemini-2.5-flash-image` · 22.4s — PARTIAL - correct budding yeast + germ tube, but ribosome/ER structure crowded and mitochondria placement slightly asymmetric
  ![textbook 1](theme/textbook/candida-albicans.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 23.3s — PARTIAL - similar composition, palette still a touch flat in places
  ![textbook 2](theme/textbook/candida-albicans.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 10.4s — PASS - refined muted educational palette matching rod-bacterium/parasite house style; thin clean outlines; distinct soft fills for wall, membrane, nucleus (with nucleolus-like layering), 2 mitochondria, vacuole, ER/ribosome dots; bud at constricted neck; narrow parallel-sided germ tube; no text; fills frame edge-to-edge on dark charcoal background. Chosen as label base.
  ![textbook 3](theme/textbook/candida-albicans.attempts/gen-03__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/candida-albicans.textbook.svg)
[interactive SVG](theme/textbook/candida-albicans.textbook.svg) · [HTML](theme/textbook/candida-albicans.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1484 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 13.7s — PASS - photorealistic false-colour amber SEM, single ovoid cell with smoothly rounded surface, bud at constricted neck, faint bud-scar dot, narrow germ tube emerging from the body, shallow depth of field with soft out-of-focus specks in background reading as neighbouring cells, no internal structures (correct for SEM), no text/border.
  ![sem 1](theme/sem/candida-albicans.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1511 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 17.9s — PASS - natural warm golden translucent cell body with distinct believable tints: blue nucleus, pale vacuole, red-brown mitochondria, fine ribosome speckles/ER, bud at constricted neck, narrow parallel-sided germ tube; soft studio lighting, dark seamless background, no neon/monochrome, no text.
  ![3d 1](theme/3d/candida-albicans.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/candida-albicans.3d.svg)
[interactive SVG](theme/3d/candida-albicans.3d.svg) · [HTML](theme/3d/candida-albicans.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1614 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 20.7s — PASS - warm aged paper fills the entire frame edge-to-edge with a soft darker wash halo directly on the paper (no mat/sheet-on-surface), matching cocci/rod-bacterium house style; single specimen with bud at constricted neck and narrow germ tube; painterly cutaway shows wall, membrane line, nucleus, small mitochondria-like ovals, stippled ribosomes; no text.
  ![watercolor 1](theme/watercolor/candida-albicans.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/candida-albicans.watercolor.svg)
[interactive SVG](theme/watercolor/candida-albicans.watercolor.svg) · [HTML](theme/watercolor/candida-albicans.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · CC BY-SA 3.0 / GFDL · Y tambe, Wikimedia Commons — PASS - Wikimedia (Y tambe, CC BY-SA 3.0) bright-field LM of budding C. albicans, ovoid cells with visible internal droplets/vacuoles and a clear budding neck; AI-cleaned (edit_image.py, real-02) to remove caption/border while keeping the original greyscale photographic character - genuine light micrograph, not re-illustrated.
  ![reference](../reference-microscopy/theme/lm/candida-albicans.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | teaching-ready (label base) | 3 | muted refined cutaway; correct dimorphic morphology (yeast + bud + germ tube); best for full labelling |
| sem | teaching-ready | 1 | realistic false-colour surface-only SEM; single specimen; no border |
| 3d | teaching-ready | 1 | natural biological tints; organelles inside, bud + germ tube correct |
| watercolor | teaching-ready | 1 | full-bleed aged-paper naturalist plate; bud + germ tube + cutaway organelles |
| reference LM | verified + cleaned | 2 | Wikimedia CC BY-SA budding yeast pair, cleaned of caption/border |
