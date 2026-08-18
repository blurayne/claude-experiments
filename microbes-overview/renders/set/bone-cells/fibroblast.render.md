# Fibroblast — render log

**Set:** `bone-cells` · **Microbe key:** `fibroblast`
**Short description:** Connective-tissue all-rounder: makes collagen and other fibres, keeps skin and organs in shape and closes wounds.

Metadata sidecar: [`fibroblast.render.meta.json`](fibroblast.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The fibroblast is the most abundant resident cell of connective tissue proper (dermis, tendon, ligament, fascia, the stroma of most organs) and the principal builder and maintainer of the extracellular matrix (ECM). It arises from mesenchyme and has a flattened, elongated spindle or star-shaped (stellate) body with several tapering cytoplasmic processes; in loose (areolar) tissue in vivo it is thin and branching, while in culture on a flat substrate it typically flattens into a bipolar fusiform (spindle) shape. The nucleus is large, ovoid, euchromatic (pale, open chromatin) and usually contains one or two visible nucleoli, reflecting a transcriptionally very active cell. Because its main job is manufacturing and secreting structural proteins, the cytoplasm is dominated by an extensive network of rough endoplasmic reticulum (rER) — often visibly dilated/cisternal in active cells — where procollagen α-chains are synthesized and undergo initial post-translational modification (proline/lysine hydroxylation, glycosylation). A large, well-developed Golgi apparatus sits near the nucleus, further processing and packaging procollagen and other secretory cargo (fibronectin, glycosaminoglycans, proteoglycans, elastin precursors, matrix metalloproteinases) into secretory vesicles for exocytosis. Numerous mitochondria supply the substantial ATP needed for this biosynthetic workload, and an actin-rich cytoskeleton (with vimentin intermediate filaments, the mesenchymal-cell marker) shapes the cell, drives its slow crawling migration through the matrix, and — in the activated "myofibroblast" state seen during wound healing — bundles into contractile actin stress fibres containing α-smooth-muscle actin that let the cell pull wound edges together. Outside the cell, the fibroblast's own product — bundles of collagen fibrils (mainly type I and III) and other matrix fibres it has secreted — is often visible immediately around the cell body, since the cell is normally shown embedded in the matrix it built. Quiescent fibroblasts (sometimes called fibrocytes) are less active, with a smaller Golgi and less rER, and become reactivated by injury signals.

Sources: [NCBI Bookshelf — StatPearls, "Histology, Fibroblast"](https://www.ncbi.nlm.nih.gov/books/NBK541065/), [NCBI Bookshelf — StatPearls, "Biochemistry, Collagen Synthesis"](https://www.ncbi.nlm.nih.gov/books/NBK507709/), [Kenhub — Fibroblast: Histological structure and function](https://www.kenhub.com/en/library/anatomy/fibroblast), [Wikipedia — Fibroblast](https://en.wikipedia.org/wiki/Fibroblast), [PMC — Heterogeneous response to TGF-β1/3 isoforms in fibroblasts: implications for wound healing](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10700238/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; large, euchromatic (active transcription) | central, offset toward the wide midsection | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly; 1–2 prominent nucleoli | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; integrin receptors anchor the cell to the matrix | outermost | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | matrix housing the organelles | interior | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | synthesizes & hydroxylates procollagen chains; very abundant, often cisternal | fills much of the cytoplasm around the nucleus | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages procollagen & matrix proteins for secretion; large & well-developed | near the nucleus | core |
| `secretory_vesicle` | vesicula secretoria | Secretory vesicle | Sekretvesikel | carries finished procollagen/matrix proteins to the membrane for exocytosis | between Golgi and membrane | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP for the heavy biosynthetic workload | dispersed in cytoplasm, several | core |
| `cytoskeleton` | cytoskeleton (filamenta actini et vimentini) | Cytoskeleton (actin & vimentin filaments) | Zytoskelett (Aktin- und Vimentinfilamente) | shape, adhesion, crawling migration; bundles into contractile stress fibres when activated | spans the cell body | core |
| `cell_process` | processus cytoplasmaticus | Cytoplasmic process | Zellfortsatz | thin tapering extensions that contact and remodel the surrounding matrix | poles/branches of the spindle or stellate body | core |
| `collagen_fibril` | fibrilla collagenica | Collagen fibril (secreted, extracellular) | Kollagenfibrille (sezerniert, extrazellulär) | the structural ECM protein the fibroblast itself builds; shown just outside the cell | immediately surrounding the cell | core |

### Do NOT draw (scientifically misleading)
- **No cell wall** — this is an animal cell, not a plant cell or bacterium.
- **No nucleoid, plasmids, capsule or bacterial flagella** — not a prokaryote.
- **No chloroplasts or large central vacuole** — plant-cell features, not present here.
- **Not round like a red blood cell or a lymphocyte** — the defining shape is a flattened, elongated, branching spindle/stellate body, not a sphere or biconcave disc.
- **No multilobed nucleus and no granule-packed cytoplasm** — that is a neutrophil/granulocyte, not a fibroblast.
- **No phagocytosed debris or engulfed particles inside vacuoles** — that is a macrophage; the fibroblast is a builder, not primarily a "cell-eater."
- **No cilia, flagella, or brush-border microvilli** — fibroblasts are not ciliated or motile by beating appendages, and are not an absorptive epithelial cell.
- **No melanin granules/melanosomes** — that is a melanocyte.
- **No cross-striations** — that is a muscle cell; only show the contractile actin stress fibres as thin parallel fibres, not sarcomere banding.
- A single specimen, embedded in a modest amount of its own secreted collagen matrix, not a dense confluent monolayer — individual morphology must stay readable.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Human fibroblast undergoing cytokinesis.jpg"**, a real scanning electron micrograph of a cultured human fibroblast captured mid-cytokinesis (the two daughter cells still joined by a thin intercellular bridge), clearly showing the flattened, elongated, process-bearing fibroblast body and fine surface ruffles/filopodia typical of this cell type in culture.
- file: https://upload.wikimedia.org/wikipedia/commons/f/f9/Human_fibroblast_undergoing_cytokinesis.jpg
- page: https://commons.wikimedia.org/wiki/File:Human_fibroblast_undergoing_cytokinesis.jpg · License: **CC BY 4.0** · Attribution: Reneferretti1 (Wikimedia Commons)
- Note: the raw download carries a baked-in ~10 µm scale bar and is monochrome (native SEM greyscale); cleaned via `edit_image.py` (scale bar/text removed, natural false-colour applied, recomposed to fill the frame) for display use — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Fibroblast — the body's tireless master builder and seamstress! It lives quietly inside your skin, tendons and pretty much every organ, spinning out tough little collagen threads that hold everything together, like an endless ball of yarn it never runs out of. Most days it just potters along, keeping your skin stretchy and your joints strong. But the moment you get a scrape or a cut, alarm signals (called TGF-β and PDGF) go off, and the fibroblast rushes to the scene, rolls up its sleeves, and starts weaving a patch of fresh fibres to close the wound. It doesn't work alone — it teams up with the macrophage, the body's clean-up helper, which tidies away the mess so the fibroblast has a clear space to build on. Builder and cleaner, side by side, until the wound is sewn shut!  
🇩🇪 Das ist der Fibroblast — der unermüdliche Baumeister und Schneider deines Körpers! Er wohnt still und leise in deiner Haut, in Sehnen und eigentlich in fast jedem Organ und spinnt dort feste kleine Kollagenfäden, die alles zusammenhalten, wie ein Wollknäuel, das ihm nie ausgeht. Meistens werkelt er einfach vor sich hin und hält deine Haut dehnbar und deine Gelenke stark. Doch sobald du dich schneidest oder aufschürfst, gehen Alarmsignale los (sie heißen TGF-β und PDGF), und der Fibroblast eilt herbei, krempelt die Ärmel hoch und beginnt, einen Flicken aus frischen Fasern zu weben, um die Wunde zu schließen. Er arbeitet nicht allein — er tut sich mit dem Makrophagen zusammen, dem Aufräum-Helfer des Körpers, der das Chaos wegräumt, damit der Fibroblast freie Bahn zum Bauen hat. Baumeister und Aufräumer, Seite an Seite, bis die Wunde vernäht ist!

**Adults (popular science, health).**  
🇬🇧 The fibroblast is the workhorse cell of connective tissue — found in skin, tendons, ligaments and the stroma of most organs — and it is responsible for producing and maintaining the collagen and other fibres that give tissues their structure and elasticity. Quietly active for most of its life, it ramps up dramatically after an injury: growth factors released at a wound site, especially TGF-β and PDGF, switch it into a more contractile, matrix-producing state (the "myofibroblast"), in which it lays down new collagen and helps pull the wound edges together. It works closely alongside macrophages, which clear debris and coordinate the healing signals the fibroblast responds to. This same biology has a flip side worth knowing: fibroblast activity gradually slows with age (a factor in thinner, less elastic skin and slower healing), while overactive fibroblast signalling is what drives excess scarring, keloids, and fibrotic diseases of the lung, liver or heart.  
🇩🇪 Der Fibroblast ist die Arbeitszelle des Bindegewebes — zu finden in Haut, Sehnen, Bändern und im Stützgewebe fast aller Organe — und dafür zuständig, das Kollagen und die anderen Fasern zu produzieren und zu erhalten, die Geweben ihre Struktur und Elastizität geben. Meist arbeitet er ruhig im Hintergrund, doch nach einer Verletzung fährt er seine Aktivität deutlich hoch: Wachstumsfaktoren, die am Wundort freigesetzt werden, vor allem TGF-β und PDGF, schalten ihn in einen kontraktileren, matrixproduzierenden Zustand (den „Myofibroblasten“), in dem er neues Kollagen bildet und hilft, die Wundränder zusammenzuziehen. Dabei arbeitet er eng mit Makrophagen zusammen, die Zelltrümmer beseitigen und die Heilungssignale koordinieren, auf die der Fibroblast reagiert. Diese Biologie hat auch eine Kehrseite: Mit zunehmendem Alter lässt die Fibroblasten-Aktivität nach (ein Grund für dünnere, weniger elastische Haut und langsamere Wundheilung), während eine überschießende Fibroblasten-Aktivität übermäßiger Narbenbildung, Keloiden und fibrotischen Erkrankungen von Lunge, Leber oder Herz zugrunde liegt.

**Scientific.**  
🇬🇧 The fibroblast is the principal mesenchymally derived cell of connective tissue proper, characterized by a flattened, spindle-to-stellate morphology, a large euchromatic nucleus with prominent nucleolus/nucleoli, extensive rough endoplasmic reticulum and a well-developed Golgi apparatus reflecting its role as the dominant biosynthetic source of extracellular matrix (ECM) components: type I/III collagen, fibronectin, elastin precursors, glycosaminoglycans and matrix metalloproteinases. Quiescent fibroblasts (fibrocytes) are activated at sites of injury by growth factors released from degranulating platelets and inflammatory macrophages — principally platelet-derived growth factor (PDGF) and transforming growth factor-β (TGF-β) — which drive proliferation, chemotaxis into the provisional fibrin matrix, and differentiation into the contractile α-smooth-muscle-actin-expressing myofibroblast phenotype responsible for wound-edge contraction. This fibroblast–macrophage crosstalk (macrophage-derived TGF-β1 promoting a profibrotic, matrix-depositing program) is central to normal proliferative-phase wound repair, and its dysregulation underlies pathological fibrosis and hypertrophic/keloid scarring.  
🇩🇪 Der Fibroblast ist die wichtigste mesenchymal abstammende Zelle des Bindegewebes, gekennzeichnet durch eine abgeflachte, spindel- bis sternförmige Morphologie, einen großen euchromatischen Zellkern mit deutlichem Nukleolus bzw. Nukleoli, ein ausgedehntes raues endoplasmatisches Retikulum und einen gut entwickelten Golgi-Apparat, die seine Rolle als dominante biosynthetische Quelle der extrazellulären Matrix (EZM) widerspiegeln: Kollagen Typ I/III, Fibronektin, Elastin-Vorstufen, Glykosaminoglykane und Matrix-Metalloproteinasen. Ruhende Fibroblasten (Fibrozyten) werden an Verletzungsstellen durch Wachstumsfaktoren aktiviert, die aus degranulierenden Thrombozyten und entzündlichen Makrophagen freigesetzt werden — vor allem Platelet-derived Growth Factor (PDGF) und Transforming Growth Factor-β (TGF-β) —, welche Proliferation, Chemotaxis in die provisorische Fibrinmatrix und die Differenzierung zum kontraktilen, α-Glattmuskelaktin-exprimierenden Myofibroblasten-Phänotyp antreiben, der für die Kontraktion der Wundränder verantwortlich ist. Diese Fibroblast-Makrophagen-Kommunikation (von Makrophagen stammendes TGF-β1 fördert ein profibrotisches, matrixablagerndes Programm) ist zentral für die normale proliferative Phase der Wundheilung, und ihre Fehlregulation liegt der pathologischen Fibrose sowie hypertrophen Narben und Keloiden zugrunde.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human fibroblast, a flattened spindle-to-stellate connective-tissue cell, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell body is elongated and tapering into a few slender branching cytoplasmic processes at its poles, about 3 to 4 times longer than wide. A neat quarter cut-away reveals the interior: a large central oval nucleus containing one or two prominent nucleoli, pale cytoplasm dominated by an extensive network of folded rough endoplasmic reticulum sheets studded with tiny ribosome dots (this cell is a heavy protein-secreting cell so the rER should look abundant and prominent), a large curved stack of Golgi apparatus cisternae near the nucleus with a few small secretory vesicles budding toward the membrane, several elongated oval mitochondria with faint inner cristae, and fine actin/vimentin cytoskeletal fibres running lengthwise through the cell. Just outside the plasma membrane, show a modest scattering of wavy collagen fibril bundles the cell has secreted into the surrounding matrix. Anatomically faithful animal cell. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella, cilia, a multilobed nucleus, or packed cytoplasmic granules; this is NOT a bacterium, NOT a plant cell, and NOT a granulocyte. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human fibroblast spreading on a substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a flattened, elongated spindle-to-stellate body tapering into several long slender branching cytoplasmic processes and fine filopodia that anchor to a subtly textured neutral substrate. Render true 3D surface texture: a gently domed nuclear bulge, delicate membrane ruffles and folds, fine granular surface detail, and thread-like filopodia reaching outward across the substrate. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm sandy-beige to soft bronze cell against a dark uncluttered charcoal-grey substrate. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human fibroblast, a flattened spindle-to-stellate connective-tissue cell, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell body is elongated with a few slender tapering branching cytoplasmic processes. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: a large translucent oval nucleus with one or two nucleoli, warm cytoplasm filled with an extensive, clearly visible network of folded rough endoplasmic reticulum sheets, a large curved Golgi stack near the nucleus with small secretory vesicles, several elongated mitochondria with inner cristae, and fine cytoskeletal fibres. Just outside the membrane, a few soft translucent wavy collagen fibril bundles drift in the surrounding space, showing the matrix this cell secretes. Natural colours, not near-monochrome and not neon. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, cilia, or a multilobed nucleus; this is an animal cell, not a bacterium and not a granulocyte. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human fibroblast in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is a flattened, elongated spindle-to-stellate body tapering into a few slender branching cytoplasmic processes, about 3 to 4 times longer than wide. A delicate painterly cut-away reveals the interior: a large central oval nucleus with one or two nucleoli, washed cytoplasm crossed by an abundant network of folded rough endoplasmic reticulum, a curved Golgi stack near the nucleus, several elongated mitochondria, and fine cytoskeletal fibres running lengthwise. Just outside the cell, paint a few soft wavy collagen fibril bundles resting on the paper around it. Single specimen, anatomically faithful animal cell. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, cilia, or a multilobed nucleus. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1672 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 24.4s — pass (gemini-2.5-flash-image; single flattened spindle-to-stellate fibroblast, ~3-4x longer than wide, tapering into several slender branching cytoplasmic processes; muted dusty educational palette with thin clean outlines matching house style; quarter cut-away shows large oval nucleus with two nucleoli, an extensive folded teal rough-ER network filling much of the cytoplasm, a large curved green Golgi stack with small secretory vesicles, several yellow mitochondria (cristae drawn as a stylised squiggle pattern, the same house convention already accepted in mesenchymal-stem-cell), and fine cytoskeletal fibres running lengthwise; a modest scattering of wavy collagen-fibril bundles sits just outside the membrane in the surrounding matrix; single specimen, dark charcoal background fills edge-to-edge, no border, no baked text)
  ![textbook 1](theme/textbook/fibroblast.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/fibroblast.textbook.svg)
[interactive SVG](theme/textbook/fibroblast.textbook.svg) · [HTML](theme/textbook/fibroblast.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1515 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 17.0s — pass (gemini-2.5-flash-image; single flattened, elongated spindle-to-stellate fibroblast spreading on a substrate, tapering into many long slender branching cytoplasmic processes and fine filopodia; true 3D surface texture with a gently domed nuclear bulge and delicate membrane ruffles; warm sandy-bronze false-colour cell against a clean dark charcoal substrate; correct surface-only SEM detail (no interior organelles); single specimen, no text or border)
  ![sem 1](theme/sem/fibroblast.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 3 attempt(s), 5362 tok, $0.118
- attempt 1 · `gemini-2.5-flash-image` · 25.4s — fail (gemini-2.5-flash-image; correct translucent cutaway cell body with nucleus/rER/Golgi/mitochondria in natural tones, BUT several solid rod/oval shapes (looking like free-floating mitochondria or bacteria) were rendered loose in the empty background outside the plasma membrane, violating the 'nothing floats outside the cell' rule)
  ![3d 1](theme/3d/fibroblast.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.1s — fail (gemini-2.5-flash-image, re-rendered with an explicit instruction restricting outside space to thin collagen threads only and forbidding solid shapes outside the membrane; model still placed a solid double-lobed blob and a striated rod outside the cell in the background)
  ![3d 2](theme/3d/fibroblast.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 19.3s — pass (escalated to gemini-3-pro-image with an even more explicit 'background must be completely empty, every organelle strictly inside the membrane' instruction; single translucent elongated spindle fibroblast with forked tapering processes at both poles, soft global illumination and subsurface scattering, cutaway reveals a large nucleus with two nucleoli, a clearly visible folded rough-ER ring around the nucleus, a curved organ-pipe Golgi stack with small vesicles, several mitochondria with cristae, and fine lengthwise cytoskeletal fibres, all natural warm biological tones (not neon/monochrome); background is completely clean dark studio with nothing floating outside the cell; no border, no baked text)
  ![3d 3](theme/3d/fibroblast.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/fibroblast.3d.svg)
[interactive SVG](theme/3d/fibroblast.3d.svg) · [HTML](theme/3d/fibroblast.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1601 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 20.9s — pass (gemini-2.5-flash-image; hand-painted naturalist plate, aged paper fills the frame edge-to-edge with a soft dark-red wash halo directly behind the subject (no separate sheet/mat/border), small flattened cell body radiating many fine ink-lined tapering processes; a delicate cut-away shows a blue-grey washed nucleus with a visible nucleolus and a second small vesicle, alternating tan (rough ER) and grey-green (mitochondria) dashes ringing the nucleus, a wavy grey-green Golgi band at the top of the ring; fine wavy collagen-fibril bundles painted on the paper just outside the membrane on the right; no baked text)
  ![watercolor 1](theme/watercolor/fibroblast.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/fibroblast.watercolor.svg)
[interactive SVG](theme/watercolor/fibroblast.watercolor.svg) · [HTML](theme/watercolor/fibroblast.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · CC BY 4.0 · Reneferretti1 (Wikimedia Commons) — pass (Wikimedia Commons 'Human fibroblast undergoing cytokinesis.jpg', CC BY 4.0, attribution Reneferretti1; genuine SEM of a cultured human fibroblast captured mid-cytokinesis - two daughter cell bodies still joined by a thin intercellular bridge, both clearly showing the flattened, elongated, process-bearing fibroblast morphology with fine surface ruffles/filopodia typical of this cell type in culture; this is one dividing specimen rather than a dense unrelated clump, so individual morphology stays readable; raw download had a baked-in scale bar in the bottom-right corner, cropped out; a false-colourised warm sandy-tan version was produced with edit_image.py for display, recomposed to fill the frame)
  ![reference](theme/real/fibroblast.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | use gen-01 as final; correct spindle-to-stellate morphology, all core organelles present and distinguishable, collagen fibrils outside the membrane, no border |
| sem | pass | 1 | use as final; correct surface-only false-colour rendering of a single spreading fibroblast with branching processes and filopodia |
| 3d | pass | 3 | use gen-03 (gemini-3-pro-image) as final; attempts 1-2 on gemini-2.5-flash-image repeatedly placed free-floating organelle-like shapes outside the cell membrane despite explicit anti-floating instructions, escalated per the 2-fail rule and the Pro model produced a clean result with nothing outside the cell |
| watercolor | pass | 1 | use as final; full-bleed aged-paper naturalist plate matching the exemplar composition, all core organelles distinguishable by colour/shape |
