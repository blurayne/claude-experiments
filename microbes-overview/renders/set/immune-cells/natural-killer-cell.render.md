# Natural killer cell (NK) — render log

**Set:** `immune-cells` · **Microbe key:** `natural-killer-cell`
**Short description:** Innate-immune bouncer: kills cells that have lost their MHC-I 'ID badge' — typical for virus infection or cancer. Revved up by interferons and IL-12. Kills virus-infected and tumour cells without prior priming.

Metadata sidecar: [`natural-killer-cell.render.meta.json`](natural-killer-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The natural killer (NK) cell is a cytotoxic lymphocyte of the innate immune system, classically described morphologically as a **large granular lymphocyte (LGL)**: larger than a typical resting T or B lymphocyte (roughly 10–15 µm diameter), with a round-to-kidney-shaped nucleus that sits somewhat eccentrically in the cell and shows dense, condensed chromatin (low transcriptional activity relative to a proliferating cell), and a comparatively abundant basophilic cytoplasm. The single defining cytoplasmic feature is a population of **azurophilic cytolytic granules** — specialised secretory lysosomes, 50–800 nm across, with an electron-dense core surrounded by a less-dense halo under EM — that store **perforin** and a family of serine proteases called **granzymes**. On contact with a target cell that has lost or down-regulated its MHC class I ("self" ID badge, as happens in many virus infections and cancers) or that displays stress ligands, the NK cell forms an immunological synapse, polarises its microtubule-organising centre (MTOC) and granules toward the contact point, and releases the granule contents: perforin punches pores in the target membrane, letting granzymes enter and trigger apoptosis. NK cells also carry **surface receptors** central to this "missing-self" surveillance and to antibody-dependent cytotoxicity — inhibitory killer-cell immunoglobulin-like receptors (KIRs) that read MHC-I, activating receptors such as NKG2D that read stress ligands, and the low-affinity Fc receptor **CD16 (FcγRIII)** that lets the cell also kill antibody-coated targets (ADCC). Ultrastructurally the plasma membrane is thrown into numerous short **microvilli/surface folds** (visible as a "shaggy" texture on SEM), the cell has several large mitochondria (fuelling the energetically costly degranulation and crawling) and a well-developed Golgi apparatus that helps traffic newly made granule proteins. NK cells arise from a common lymphoid/NK-T progenitor, mature in bone marrow and secondary lymphoid tissue, and — unlike T and B cells — need no prior antigen priming to kill; they are "revved up" (primed to higher cytotoxicity and proliferation) by cytokines, chiefly type-I/II interferons and IL-12/IL-15/IL-18 released by other innate cells during infection.

Sources: [StatPearls / NCBI Bookshelf — Histology, Natural Killer Cells (Rahman & Bordoni, 2023)](https://www.ncbi.nlm.nih.gov/books/NBK565844/), [Wikipedia — Natural killer cell](https://en.wikipedia.org/wiki/Natural_killer_cell), [Frontiers in Immunology — Human NK cell lytic granules and regulation of their exocytosis (Krzewski & Coligan, 2012)](https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2012.00335/full), [ScienceDirect — Historical overview on the morphological characterization of large granular lymphocytes/NK cells](https://www.sciencedirect.com/science/article/abs/pii/S0165247817302985).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | genome; round-to-kidney-shaped, dense condensed chromatin | eccentric, offset toward one side | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries surface receptors | outermost | core |
| `cytolytic_granules` | granula azurophila (lysosomata secretoria) | Azurophilic granules (cytolytic granules) | Azurophile Granula (zytolytische Granula) | store perforin & granzymes; the LGL's defining feature | scattered in cytoplasm, polarised toward MTOC | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/traffics granule proteins | near the nucleus/MTOC | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP for degranulation & migration | dispersed in cytoplasm, several | core |
| `mtoc` | centrosoma (centrum organisatorium microtubulorum) | Centrosome / MTOC | Centrosom (Mikrotubuli-Organisationszentrum) | polarises granules toward the immune synapse | near the nucleus | core |
| `surface_receptor` | receptores superficiales (KIR, NKG2D, CD16) | Surface receptors (KIR, NKG2D, CD16) | Oberflächenrezeptoren (KIR, NKG2D, CD16) | read MHC-I "self" signal / stress ligands / antibody-coated targets | studding the plasma membrane | core |
| `microvilli` | microvilli | Microvilli / surface folds | Mikrovilli / Membranfalten | short membrane projections giving the "shaggy" EM surface texture | over the whole cell surface | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | basophilic matrix housing the organelles | interior | core |

### Do NOT draw (scientifically misleading)
- **No cell wall** — this is an animal cell, not a plant cell or bacterium.
- **No nucleoid, plasmids or bacterial flagella** — not a prokaryote.
- **No chloroplasts, no large central vacuole** — not a plant cell.
- **Not a smooth, agranular small lymphocyte** — the defining feature is the large size and the visible azurophilic (cytolytic) granules in the cytoplasm; a plain round nucleus-filled cell with almost no cytoplasm (typical small resting T/B-cell look) is wrong for an NK cell.
- **No phagocytosed particles / phagosomes with engulfed bacteria** — NK cells kill by directed granule release at a synapse, they do not phagocytose targets like a macrophage or neutrophil.
- **No long whip-like flagellum or beating cilia for locomotion** — NK cells crawl by amoeboid movement; only short surface microvilli/membrane folds, not organised motile cilia.
- **Single specimen, not a dense cluster** — the granularity and receptor detail must stay individually readable; a target cell may be omitted (this is a portrait of the NK cell itself, not the immune synapse scene).

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Selected: **Wikimedia Commons — "Human Natural Killer Cell.jpg"**, a colorized scanning electron micrograph of a single human NK cell (NIAID/NIH; imaged by Dave Dorward), showing the characteristic "shaggy" microvillus-covered surface and long thin membrane projections/filopodia radiating outward, on a clean black background.
- file: https://upload.wikimedia.org/wikipedia/commons/7/7d/Human_Natural_Killer_Cell.jpg
- page: https://commons.wikimedia.org/wiki/File:Human_Natural_Killer_Cell.jpg · License: **CC BY 2.0** · Attribution: NIAID / Dave Dorward (Flickr, NIH)

AI visual verification result: **PASS (2026-08-14).** Single, isolated, round-to-ovoid lymphocyte-sized cell densely covered in short spiky microvilli plus several long, thin radiating membrane extensions, exactly the well-known NIAID SEM plate of a human NK cell; clean black background, no baked-in text, scale bar or watermark, no dense cell clump obscuring the surface detail — used as-is for display (no cleaning edit needed beyond the standard normalisation `fetch_reference.py` already applies).

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Natural Killer Cell — the body's ever-watchful bouncer! She cruises through your blood and tissues, stopping by every cell she passes for a quick ID check: a little tag called MHC-I. Flash the badge, get a friendly nod and she moves on. But if a cell has been hijacked by a virus or gone rogue and turned cancerous, its badge often goes missing — no warning needed, no training required, she just knows. That's her cue: she pops open her granule pouches like a spy's gadget belt, releasing perforin to punch a tiny doorway and granzymes to deliver the message that it's time for that cell to quietly shut down. She works closely with messenger proteins called interferons, which shout 'something's wrong here!' and rev her up to react even faster. No ID, no entry — that's the natural killer cell's whole job, and she never clocks off.  
🇩🇪 Das ist die Natürliche Killerzelle — die immer wachsame Türsteherin deines Körpers! Sie zieht durch dein Blut und deine Gewebe und hält bei jeder Zelle kurz an, um den Ausweis zu prüfen: ein kleines Erkennungsmerkmal namens MHC-I. Wird der Ausweis gezeigt, nickt sie freundlich und zieht weiter. Wurde eine Zelle aber von einem Virus gekapert oder ist zur Krebszelle geworden, fehlt oft genau dieser Ausweis — und das merkt sie sofort, ganz ohne Vorwarnung oder Training. Das ist ihr Stichwort: Sie öffnet ihre Granula wie den Gürtel eines Geheimagenten, setzt Perforin frei, das eine winzige Tür in die Zellhülle bohrt, und schickt Granzyme hindurch, die der Zelle sagen, dass sie sich jetzt still abschalten soll. Dabei arbeitet sie eng mit Botenstoffen namens Interferonen zusammen, die rufen 'hier stimmt was nicht!' und sie noch schneller machen. Kein Ausweis, kein Einlass — das ist der ganze Job der Natürlichen Killerzelle, und Feierabend kennt sie nicht.

**Adults (popular science, health).**  
🇬🇧 The natural killer (NK) cell is one of the immune system's fastest-acting cytotoxic cells, patrolling blood and tissue and killing virus-infected or cancerous cells without needing to be pre-sensitised to a specific target the way T cells do. Its surveillance strategy is elegantly simple: healthy cells display MHC class I molecules as a kind of self-ID, and NK cells carry inhibitory receptors that read this badge and hold their fire. Many viruses and tumours downregulate MHC-I specifically to dodge T cells — but that very trick unmasks them to NK cells, a strategy immunologists call 'missing-self' recognition. Once triggered, the NK cell releases perforin and granzymes from its cytolytic granules to induce the target's controlled self-destruction, and it can also destroy antibody-tagged cells via its CD16 receptor. Messenger molecules such as interferons and IL-12 rev NK cells up, making them a key early responder in viral infections and part of the body's ongoing tumour surveillance.  
🇩🇪 Die Natürliche Killerzelle (NK-Zelle) gehört zu den schnellsten zytotoxischen Zellen des Immunsystems: Sie patrouilliert durch Blut und Gewebe und tötet virusinfizierte oder entartete Zellen, ohne — anders als T-Zellen — vorher auf ein bestimmtes Ziel sensibilisiert werden zu müssen. Ihre Überwachungsstrategie ist elegant einfach: Gesunde Zellen zeigen MHC-Klasse-I-Moleküle als eine Art Personalausweis, und NK-Zellen tragen hemmende Rezeptoren, die diesen Ausweis lesen und dann Ruhe geben. Viele Viren und Tumoren drosseln gezielt MHC-I, um T-Zellen zu entgehen — doch genau dieser Trick macht sie für NK-Zellen sichtbar, eine Strategie, die Immunologen 'Missing-Self-Erkennung' nennen. Ist die NK-Zelle einmal aktiviert, schüttet sie Perforin und Granzyme aus ihren zytolytischen Granula aus und bringt die Zielzelle so zur kontrollierten Selbstzerstörung; über ihren CD16-Rezeptor kann sie außerdem antikörperbeladene Zellen zerstören. Botenstoffe wie Interferone und IL-12 fahren die NK-Zelle hoch und machen sie zu einer wichtigen frühen Reaktion bei Virusinfektionen und zu einem festen Bestandteil der körpereigenen Tumorüberwachung.

**Scientific.**  
🇬🇧 NK cells are innate lymphoid cells with large-granular-lymphocyte (LGL) morphology: an eccentric nucleus with condensed chromatin and abundant cytoplasm containing azurophilic secretory lysosomes (cytolytic granules) that store perforin and granzymes. Target recognition integrates signals from germline-encoded inhibitory receptors — killer-cell immunoglobulin-like receptors (KIRs) and CD94/NKG2A — that engage MHC class I, and activating receptors such as NKG2D and the natural cytotoxicity receptors that engage stress-induced ligands, implementing 'missing-self' and 'induced-self' recognition without prior antigen priming or clonal selection. Net-activating signal integration polarises the microtubule-organising centre and cytolytic granules toward the immunological synapse, releasing perforin (which forms membrane pores) and granzymes (serine proteases that trigger caspase-dependent apoptosis) into the target cell. NK cells also mediate antibody-dependent cellular cytotoxicity (ADCC) via the low-affinity Fc receptor CD16 (FcγRIIIA). Their cytotoxic and IFN-γ-producing functions are potentiated by IL-12, IL-15, IL-18 and type I interferons from other innate cells, positioning NK cells as an early, non-antigen-specific defence against virus-infected and malignant cells that also cross-talks with and primes the adaptive immune response.  
🇩🇪 NK-Zellen sind angeborene lymphatische Zellen mit der Morphologie eines großen granulären Lymphozyten (LGL): ein exzentrischer Zellkern mit kondensiertem Chromatin und reichlich Zytoplasma mit azurophilen sekretorischen Lysosomen (zytolytischen Granula), die Perforin und Granzyme speichern. Die Zielerkennung integriert Signale keimbahnkodierter, hemmender Rezeptoren — Killerzell-Immunglobulin-ähnliche Rezeptoren (KIRs) und CD94/NKG2A —, die MHC-Klasse-I binden, sowie aktivierender Rezeptoren wie NKG2D und der natürlichen Zytotoxizitätsrezeptoren, die stressinduzierte Liganden binden; so wird 'Missing-Self'- und 'Induced-Self'-Erkennung ohne vorherige Antigenprägung oder klonale Selektion umgesetzt. Überwiegt das aktivierende Signal, polarisiert die Zelle ihr Mikrotubuli-Organisationszentrum und ihre zytolytischen Granula zur immunologischen Synapse und schüttet Perforin (bildet Membranporen) und Granzyme (Serinproteasen, die Caspase-abhängige Apoptose auslösen) in die Zielzelle aus. Über den niedrigaffinen Fc-Rezeptor CD16 (FcγRIIIA) vermitteln NK-Zellen zudem antikörperabhängige zelluläre Zytotoxizität (ADCC). Ihre zytotoxische und IFN-γ-produzierende Funktion wird durch IL-12, IL-15, IL-18 und Typ-I-Interferone anderer angeborener Zellen verstärkt, wodurch NK-Zellen eine frühe, nicht antigenspezifische Abwehr gegen virusinfizierte und entartete Zellen darstellen und zugleich die adaptive Immunantwort mit anstoßen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human natural killer (NK) cell, a large granular lymphocyte of the innate immune system, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is round to slightly kidney-shaped overall, noticeably larger and more cytoplasm-rich than a small plain lymphocyte, its plasma membrane fringed with short microvilli / membrane folds. A neat quarter cut-away reveals the interior: an eccentric, off-center round-to-kidney-shaped nucleus with dense condensed chromatin, abundant cytoplasm scattered with numerous small round azurophilic cytolytic granules (secretory lysosomes, rendered as a distinct dense-cored dot cluster, some polarised toward one side of the cell), a compact Golgi apparatus of curved stacked cisternae near the nucleus, several oval mitochondria with faint inner cristae, and a small centrosome (MTOC) near the nucleus with a few short microtubule lines radiating toward the granules. On the outer membrane, sparse small receptor-stub shapes (representing surface receptors) stud the surface. Anatomically faithful eukaryotic immune cell. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, a long whip-like flagellum, beating cilia, or any engulfed/phagocytosed particles; this is NOT a bacterium, NOT a plant cell, and NOT a phagocytosing macrophage. Do not draw it as a plain smooth agranular lymphocyte — the azurophilic granules must be clearly visible. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human natural killer (NK) cell, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a round-to-ovoid lymphocyte-sized body densely covered in short spiky microvilli and membrane ruffles giving a 'shaggy' surface texture, with a few longer thin filopodia-like membrane projections radiating outward from the cell body. Render true 3D surface texture with crisp fine detail on every microvillus, shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: violet-blue to lilac cell surface with warm pale-gold highlights on the raised microvilli tips, set on a completely empty black background (no substrate texture needed). SEM shows the outer surface only, so render NO internal organelles, no nucleus, no granules. Anatomically faithful, single specimen only, no target cell nearby. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human natural killer (NK) cell, a large granular lymphocyte of the innate immune system, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane, whose surface is fringed with short microvilli. The cell is round to slightly kidney-shaped, larger and more cytoplasm-rich than a small resting lymphocyte. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: an eccentric round-to-kidney-shaped nucleus with visibly dense, condensed chromatin, warm cytoplasm scattered with many small glowing dense-cored azurophilic cytolytic granules (some clustered and polarised toward one pole of the cell, as if aimed at an unseen target), a Golgi stack near the nucleus, several oval mitochondria with inner cristae, a small centrosome with a few microtubule lines reaching toward the polarised granules, and a scatter of small receptor-stub shapes on the outer membrane. Natural colours, not near-monochrome and not neon. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, a whip-like flagellum, beating cilia, or engulfed particles; this is an eukaryotic immune cell, not a bacterium and not a phagocytosing macrophage. The azurophilic granules must be clearly visible, not a smooth agranular cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human natural killer (NK) cell in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is round to slightly kidney-shaped, its outline fringed with small ink-drawn microvilli/membrane folds, noticeably larger and more cytoplasm-rich than a plain small lymphocyte. A delicate painterly cut-away reveals the interior: an eccentric round-to-kidney-shaped nucleus with fine ink hatching suggesting dense condensed chromatin, washed cytoplasm dotted with many small dense-cored azurophilic granules rendered as tiny dark-centred ink-and-wash dots (some clustered toward one side), a curved Golgi stack near the nucleus, a few oval mitochondria, and a small centrosome with a couple of fine radiating lines toward the granules. Single specimen, anatomically faithful eukaryotic immune cell. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, a whip-like flagellum, beating cilia, or engulfed particles. The azurophilic granules must be clearly visible, not a smooth agranular cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3466 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 12.0s — fail (gemini-2.5-flash-image; baked-in illegible text labels on the mitochondria, violates no-text rule, superseded)
  ![textbook 1](theme/textbook/natural-killer-cell.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 14.7s — pass (gemini-2.5-flash-image; kidney-shaped eccentric nucleus, visible azurophilic granules, Golgi, MTOC pair, mitochondria and surface microvilli all present and separated, no baked-in text; muted soft-fill educational palette matching rod-bacterium/parasite exemplar, thin clean outlines, dark-charcoal background, no border)
  ![textbook 2](theme/textbook/natural-killer-cell.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/natural-killer-cell.textbook.svg)
[interactive SVG](theme/textbook/natural-killer-cell.textbook.svg) · [HTML](theme/textbook/natural-killer-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1539 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.2s — pass (gemini-2.5-flash-image; single round lymphocyte densely covered in short spiky microvilli plus several long radiating filopodia, false-colour lavender/gold surface-only rendering on clean black background, closely matches the real NIAID SEM reference; no text/scale bar/border)
  ![sem 1](theme/sem/natural-killer-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1648 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.9s — pass (gemini-2.5-flash-image; natural biological tints — warm pink cytoplasm, violet nucleus, brown mitochondria, orange-red granules polarised toward a green MTOC with visible microtubule fan, yellow Golgi stack, spiky microvilli — clean dark studio background, no border/text, structures individually readable for labelling)
  ![3d 1](theme/3d/natural-killer-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/natural-killer-cell.3d.svg)
[interactive SVG](theme/3d/natural-killer-cell.3d.svg) · [HTML](theme/3d/natural-killer-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1650 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 19.0s — pass (gemini-2.5-flash-image; hand-painted naturalist-plate look, warm aged paper fills the frame edge-to-edge with a soft darker wash halo behind the subject, single centred specimen, kidney nucleus / Golgi / granules / mitochondria / microvilli all rendered and individually labellable, fine ink linework, no text/mat/frame)
  ![watercolor 1](theme/watercolor/natural-killer-cell.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/natural-killer-cell.watercolor.svg)
[interactive SVG](theme/watercolor/natural-killer-cell.watercolor.svg) · [HTML](theme/watercolor/natural-killer-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `sem` · CC BY 2.0 · NIAID / Dave Dorward (Flickr, NIH) — pass (Wikimedia Commons "Human Natural Killer Cell.jpg", NIAID/Dave Dorward, CC BY 2.0 — colorized SEM of a single isolated human NK cell showing the characteristic shaggy microvillus surface and radiating filopodia; clean background, no baked text/scale bar; used as-is, no cleaning edit needed)
  ![reference](../reference-microscopy/theme/sem/natural-killer-cell.attempts/real-01__sem.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | use as final; accurate cutaway with all core organelles distinct and correctly coloured, matches house textbook palette |
| sem | pass | 1 | use as final; matches the real reference micrograph's shaggy microvillus surface texture almost exactly |
| 3d | pass | 1 | use as final; natural biological tints, all structures readable and correctly placed |
| watercolor | pass | 1 | use as final; full-bleed aged-paper plate with soft wash halo, single centred specimen, all structures present |
