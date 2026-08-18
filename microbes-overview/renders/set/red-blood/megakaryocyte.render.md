# Megakaryocyte (Megakaryozyt) — render log

**Set:** `red-blood` · **Microbe key:** `megakaryocyte`
**Short description:** Giant bone-marrow cell with a multi-lobed polyploid nucleus and an internal demarcation membrane system; sheds thousands of platelets from long proplatelet extensions — a cousin of the erythrocyte lineage, sharing the MEP precursor.

Metadata sidecar: [`megakaryocyte.render.meta.json`](megakaryocyte.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The megakaryocyte is the largest cell resident in human bone marrow — typically 50–100 µm in diameter, roughly 10–15 times the diameter of a red blood cell — and its sole job is to manufacture platelets (thrombocytes). It arises from the megakaryocyte-erythroid progenitor (MEP), the same bipotent progenitor that also gives rise to the erythroid lineage, under the control of the transcription factors GATA-1 and FOG-1 (shared with erythropoiesis) plus the megakaryocyte-specific factor NF-E2. Maturation is driven almost entirely by **thrombopoietin (TPO)**, a hormone produced constitutively by the liver (and, to a lesser extent, the kidney and bone-marrow stroma) that binds the c-Mpl (CD110) receptor on megakaryocyte progenitors and drives their proliferation, polyploidisation and cytoplasmic maturation.

Unlike almost any other human cell, the megakaryocyte grows by **endomitosis**: repeated rounds of DNA synthesis and mitosis up to (but not including) cytokinesis, so the cell accumulates a single, highly polyploid nucleus (commonly 8N–64N, i.e. 4–32 times the normal diploid content) without ever dividing into daughter cells. As the DNA content rises the nucleus does not stay round — it becomes deeply infolded and **multi-lobed** (typically producing a cluster of several connected lobes), which under a light microscope can look like multiple separate nuclei but is in fact one continuous, lobulated nucleus. This huge genome supports a correspondingly huge, granular, densely packed cytoplasm.

As the megakaryocyte matures it builds an extensive internal membrane reservoir called the **demarcation membrane system (DMS)**: invaginations of the plasma membrane that ramify throughout the cytoplasm as a network of flattened cisternae and tubules, physically continuous with the cell surface. The DMS is not a set of pre-formed platelet outlines — it is the folded membrane stockpile that gets unfurled to build the surface of the long, thin **proplatelet extensions** the cell later pushes into bone-marrow sinusoidal blood vessels; platelets are released from the tips/shafts of these proplatelets by shear force in the bloodstream (increasingly understood to be completed largely in the lung microvasculature), not by simple "pinching off" bubbles inside the cell body. The cytoplasm is also packed with **α-granules** (containing von Willebrand factor, fibrinogen, platelet-derived growth factor and other clotting/repair proteins) and smaller, denser **δ-granules/dense granules** (ADP, ATP, serotonin, calcium) — both are trafficked to the eventual platelets via multivesicular bodies. Abundant rough endoplasmic reticulum and a prominent Golgi apparatus around the nucleus synthesise and package these granule cargoes and the membrane needed for the DMS; numerous mitochondria supply the ATP for this heavy biosynthetic and cytoskeletal workload. A dense **cytoskeleton** of microtubules (bundled into coils that form the shaft of each proplatelet) and cortical actin drives the elongation of proplatelet processes and controls their branching.

A single megakaryocyte can release on the order of 2,000–5,000 platelets over its lifetime, then undergoes apoptosis once its cytoplasm is exhausted. Megakaryocytes normally sit adjacent to bone-marrow sinusoidal vessels so their proplatelets can extend directly into the vascular lumen; a smaller population also resides in and releases platelets from the lung microvasculature.

Sources: [Wikipedia — Megakaryocyte](https://en.wikipedia.org/wiki/Megakaryocyte), [Machlus & Italiano 2013, "The incredible journey: From megakaryocyte development to platelet formation", J Cell Biol (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3639401/), [Eckly et al. 2014, "Biogenesis of the demarcation membrane system (DMS) in megakaryocytes", Blood](https://ashpublications.org/blood/article/123/6/921/32602/Biogenesis-of-the-demarcation-membrane-system-DMS), [NCBI Bookshelf / StatPearls — Physiology, Thrombopoietin](https://www.ncbi.nlm.nih.gov/books/NBK557424/), [Deutsch & Tomer 2006, "Megakaryocyte development and platelet production", Br J Haematol (PubMed)](https://pubmed.ncbi.nlm.nih.gov/16856888/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus polyploideus lobatus | Multi-lobed polyploid nucleus | Vielfach gelappter, polyploider Zellkern | single, highly polyploid (8N–64N) nucleus produced by endomitosis; deeply infolded into connected lobes | large, central/eccentric | core |
| `demarcation_membrane_system` | systema membranarum demarcantium | Demarcation membrane system (DMS) | Demarkationsmembransystem (DMS) | folded membrane reservoir, continuous with the plasma membrane, later unfurled to build proplatelet surface | ramifies through the cytoplasm | core |
| `alpha_granules` | granula alpha | α-granules | Alpha-Granula | store von Willebrand factor, fibrinogen, growth factors for platelet release | scattered through cytoplasm | core |
| `dense_granules` | granula densa (delta) | Dense (δ) granules | Dichte (Delta-)Granula | store ADP/ATP, serotonin, calcium; smaller and fewer than α-granules | scattered through cytoplasm | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | synthesises granule and membrane proteins | around the nucleus | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages granule cargo and membrane for the DMS | near the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP supply for biosynthesis and cytoskeletal remodelling | dispersed in cytoplasm, numerous | core |
| `proplatelet_extension` | processus proplatelettarius | Proplatelet extension | Proplättchen-Fortsatz | long beaded cytoplasmic process, microtubule-cored, that buds into a marrow sinusoid and sheds platelets | extending from the cell periphery | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary, continuous with the DMS | outermost | core |

### Do NOT draw (scientifically misleading)
- **Not anucleate** — unlike the erythrocyte or the platelets it produces, the megakaryocyte itself has a large nucleus; do not draw it as a bare cytoplasm with no nucleus at all.
- **Single continuous multi-lobed nucleus, not several separate discrete round nuclei** — the polyploid nucleus is one lobulated structure, not a true multinucleate cell (avoid drawing 4–8 completely separate ball-shaped nuclei scattered in the cytoplasm).
- **Not small/round like a lymphocyte or red blood cell** — this is the giant cell of the marrow, roughly 10–15× the diameter of a red cell; draw it visibly huge with an irregular, lobed outline where proplatelets extend.
- **Do not draw finished, free-floating disc-shaped platelets already loose inside the cell body** — show the demarcation membrane system and elongating proplatelet extensions instead; platelets are released from the tips/shafts of these extensions, not pre-assembled and rattling around inside the cytoplasm.
- **No cell wall, capsule, nucleoid, plasmid, flagella or pili** — this is a human bone-marrow cell, not a bacterium.
- **No chloroplasts or central vacuole** — not a plant cell.
- **No biconcave-disc shape** — that is the mature erythrocyte's shape, a different cell in this set.
- Single specimen (or its immediate proplatelet extensions), not a dense sheet of marrow cells crowding it out.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Used: **Wikimedia Commons — "Megakaryocyte in bone marrow.jpg"**, a Wright-Giemsa-stained bone-marrow aspirate smear light micrograph showing a single, well-isolated megakaryocyte with a large multi-lobed nucleus and granular cytoplasm, surrounded by red blood cells, by Animalculist (Wikimedia Commons).
- file: https://upload.wikimedia.org/wikipedia/commons/2/22/Megakaryocyte_in_bone_marrow.jpg
- page: https://commons.wikimedia.org/wiki/File:Megakaryocyte_in_bone_marrow.jpg · License: **CC BY-SA 4.0** · Attribution: Animalculist, via Wikimedia Commons
- Verification: **PASS** — a single, clearly isolated megakaryocyte fills the frame, unambiguously showing the giant size (~10x an RBC), the dense multi-lobed purple-staining nucleus, and pale granular cytoplasm with small budding proplatelet-like fragments at the periphery, exactly matching the §1 description; no baked text/scale bar/arrows in the plain original. A second candidate (`WVSOM_Megakaryocytes.JPG`, a denser H&E marrow section with two megakaryocytes crowded among many other marrow cells) was also fetched but rejected in favour of this cleaner, single-specimen image per the "prefer a single isolated specimen" rule.
- Cleaning: `edit_image.py` produced `real-02__edit-gemini-2.5-flash-image.png` — background red cells rendered as crisp, evenly pink discs with pale centers, the megakaryocyte kept as the clear visual focus, no text/scale bar added; this cleaned version is the display image.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Megakaryocyte — the biggest cell living in your bone marrow, and by far the strangest-shaped! While most cells split in two to make more of themselves, this giant just keeps growing bigger and bigger, packing its one enormous nucleus with copy after copy of DNA until it looks like a cluster of lobes all stuck together. Its real job is factory work: it grows long, beaded arms called proplatelets and pushes them right into a tiny blood vessel, where the flowing blood tugs off thousands of tiny platelets — the patches that rush in to seal up any scrape or cut. A single megakaryocyte can hand out several thousand platelets before its work is done. It gets its 'grow bigger, not more' orders from a hormone called thrombopoietin, sent all the way from the liver.  
🇩🇪 Das ist der Megakaryozyt — die größte Zelle in deinem Knochenmark und dazu die mit der seltsamsten Form! Während sich die meisten Zellen einfach teilen, um mehr von sich selbst zu machen, wird dieser Riese einfach immer größer und packt seinen einen riesigen Zellkern mit Kopie um Kopie seiner DNA voll, bis er aussieht wie ein Bündel zusammenhängender Lappen. Sein eigentlicher Job ist Fabrikarbeit: Er lässt lange, perlenschnurartige Arme wachsen, die Proplättchen genannt werden, und schiebt sie direkt in ein winziges Blutgefäß. Dort zieht der fließende Blutstrom Tausende winzige Blutplättchen ab — die kleinen Flicken, die sofort einspringen, um jede Schramme oder jeden Schnitt zu verschließen. Ein einziger Megakaryozyt kann mehrere Tausend Blutplättchen abgeben, bevor seine Arbeit getan ist. Seinen Befehl 'wachse größer, nicht mehr' bekommt er von einem Hormon namens Thrombopoietin, das extra aus der Leber zu ihm geschickt wird.

**Adults (popular science, health).**  
🇬🇧 The megakaryocyte is the largest cell in human bone marrow — some ten to fifteen times the diameter of a red blood cell — and its entire purpose is to manufacture platelets, the cell fragments responsible for stopping bleeding. Rather than dividing like most cells, it grows through repeated rounds of DNA replication without cell division (endomitosis), ending up with a single, highly polyploid, multi-lobed nucleus. As it matures it builds an internal reservoir of folded membrane, the demarcation membrane system, which later unfurls into long, beaded proplatelet extensions that push into the bloodstream; platelets are sheared off these extensions by the flow of blood, with much of this final step now thought to occur as blood passes through the lungs. Its development is governed almost entirely by thrombopoietin, a hormone made continuously by the liver, and it shares its immediate precursor cell with the red blood cell lineage. A shortage of megakaryocytes, or of thrombopoietin signalling, is a common underlying cause of low platelet counts and the easy bruising or bleeding that comes with it.  
🇩🇪 Der Megakaryozyt ist die größte Zelle im menschlichen Knochenmark — etwa zehn- bis fünfzehnmal so groß wie ein rotes Blutkörperchen — und seine gesamte Aufgabe besteht darin, Blutplättchen herzustellen, jene Zellfragmente, die Blutungen stillen. Statt sich wie die meisten Zellen zu teilen, wächst er durch wiederholte Runden der DNA-Verdopplung ohne Zellteilung (Endomitose) und besitzt am Ende einen einzigen, stark polyploiden, vielfach gelappten Zellkern. Während seiner Reifung baut er ein inneres Vorratssystem aus gefalteter Membran auf, das Demarkationsmembransystem, das sich später zu langen, perlenschnurartigen Proplättchen-Fortsätzen entfaltet, die in den Blutstrom hineinreichen; Blutplättchen werden durch die Strömung von diesen Fortsätzen abgeschert, wobei ein Großteil dieses letzten Schritts heute in den Lungengefäßen vermutet wird. Seine Entwicklung wird fast vollständig vom Thrombopoietin gesteuert, einem Hormon, das kontinuierlich von der Leber gebildet wird, und er teilt sich seine unmittelbare Vorläuferzelle mit der Linie der roten Blutkörperchen. Ein Mangel an Megakaryozyten oder eine gestörte Thrombopoietin-Signalgebung ist eine häufige Ursache für niedrige Blutplättchenzahlen und die damit verbundene erhöhte Blutungs- und Blutergussneigung.

**Scientific.**  
🇬🇧 The megakaryocyte arises from the bipotent megakaryocyte-erythroid progenitor (MEP) under GATA-1/FOG-1 and NF-E2-driven transcriptional programs, and matures under the control of thrombopoietin (TPO) signalling through its receptor c-Mpl (CD110). Uniquely among mature human cells, it undergoes endomitosis — repeated S- and M-phase cycles arrested before cytokinesis — yielding a single polyploid nucleus (commonly 8N–64N) that becomes progressively multi-lobed as ploidy increases. Cytoplasmic maturation is marked by expansion of the demarcation membrane system (DMS), an invagination of the plasma membrane that serves as the membrane reservoir for proplatelet formation; biogenesis of α-granules (vWF, fibrinogen, PDGF and other cargo) and dense δ-granules (ADP/ATP, serotonin, Ca2+) proceeds via the secretory pathway (rough ER, Golgi, multivesicular bodies). Platelet production occurs through elongation of microtubule-cored proplatelet processes into marrow sinusoids, with terminal platelet fission driven largely by vascular shear forces, a process substantially completed in the pulmonary microvasculature. A single megakaryocyte yields on the order of 2,000-5,000 platelets before undergoing apoptosis.  
🇩🇪 Der Megakaryozyt entsteht aus dem bipotenten Megakaryozyten-Erythrozyten-Vorläufer (MEP) unter der Kontrolle der Transkriptionsfaktoren GATA-1/FOG-1 sowie NF-E2 und reift unter dem Einfluss der Thrombopoietin(TPO)-Signalgebung über seinen Rezeptor c-Mpl (CD110). Einzigartig unter reifen menschlichen Zellen durchläuft er eine Endomitose — wiederholte S- und M-Phasen-Zyklen, die vor der Zytokinese arretiert werden — und erhält so einen einzigen polyploiden Zellkern (üblicherweise 8N–64N), der mit zunehmender Ploidie zunehmend vielfach gelappt wird. Die zytoplasmatische Reifung zeigt sich in der Ausdehnung des Demarkationsmembransystems (DMS), einer Einstülpung der Plasmamembran, die als Membranvorrat für die Proplättchenbildung dient; die Biogenese der Alpha-Granula (von-Willebrand-Faktor, Fibrinogen, PDGF und weitere Fracht) und der dichten Delta-Granula (ADP/ATP, Serotonin, Ca2+) erfolgt über den sekretorischen Weg (raues ER, Golgi-Apparat, multivesikuläre Körper). Die Plättchenbildung erfolgt durch Verlängerung mikrotubulusgestützter Proplättchen-Fortsätze in Knochenmarksinusoide hinein, wobei die endgültige Abtrennung der Plättchen überwiegend durch vaskuläre Scherkräfte erfolgt — ein Prozess, der wesentlich in den Lungenkapillaren abgeschlossen wird. Ein einzelner Megakaryozyt liefert in der Größenordnung von 2.000 bis 5.000 Blutplättchen, bevor er in die Apoptose übergeht.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE giant human megakaryocyte, the huge bone-marrow cell that manufactures platelets, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell body is enormous and rounded but irregular, visibly far larger than any surrounding blood cell would be, with several long beaded proplatelet extensions trailing off one side of the cell toward the frame edge. A neat quarter cut-away reveals the interior: one single continuous, deeply multi-lobed polyploid nucleus (several connected lobes, NOT separate round nuclei) filling much of the cell, a fine web-like demarcation membrane system of flattened membrane channels ramifying through the cytoplasm, many small round pale alpha-granules and fewer, smaller, darker dense granules scattered through the cytoplasm, folded rough endoplasmic reticulum sheets with tiny ribosome dots near the nucleus, a curved Golgi apparatus stack, and several small oval mitochondria with faint inner cristae. Anatomically faithful human cell. Do NOT draw finished free disc-shaped platelets loose inside the cell body; do NOT draw several completely separate ball-shaped nuclei; do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or a biconcave-disc shape. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE giant human megakaryocyte from bone marrow, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is an enormous rounded but irregular body, clearly dwarfing the scale of any ordinary blood cell, with its surface pushing out several long, thin, beaded proplatelet extensions that trail toward the substrate. Render true 3D surface texture: a gently domed cell body, subtle surface ruffles and blebs, and thread-like beaded proplatelet processes reaching outward, resting on a subtly textured neutral substrate. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm rose to soft violet cell body against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE giant human megakaryocyte, the bone-marrow cell that produces platelets, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell body is huge and rounded but irregular, with several long beaded proplatelet extensions trailing from one side toward the frame edge. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: one single continuous, deeply multi-lobed polyploid nucleus (connected lobes, not separate nuclei) filling much of the cell, a fine translucent membranous demarcation membrane system threading through the cytoplasm, small round pale alpha-granules and fewer darker dense granules scattered through the cytoplasm, folded rough endoplasmic reticulum near the nucleus, a curved Golgi stack, and several small oval mitochondria with visible cristae. Natural colours, not near-monochrome and not neon. Do NOT render finished free platelets loose inside the cell, separate ball-shaped nuclei, a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, or a biconcave-disc shape. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE giant human megakaryocyte in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell body is enormous, rounded but irregular, with several long beaded proplatelet extensions trailing from one side across the paper. A delicate painterly cut-away reveals the interior: one single continuous, deeply multi-lobed polyploid nucleus (connected lobes, not separate round nuclei) filling much of the cell, a fine web of demarcation membrane channels through the cytoplasm, small pale alpha-granules and fewer darker dense granules scattered through the cytoplasm, folded rough endoplasmic reticulum near the nucleus, a curved Golgi stack, and a few small oval mitochondria. Single specimen, anatomically faithful. Do NOT paint finished free platelets loose in the cell, several separate round nuclei, a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, or a biconcave-disc shape. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3403 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 11.7s — fail (gemini-2.5-flash-image, faint baked-in gibberish text inside the mitochondria ovals - violates no-baked-text rule, superseded)
  ![textbook 1](theme/textbook/megakaryocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 8.8s — pass (gemini-2.5-flash-image; clean cutaway, single continuous multi-lobed nucleus, demarcation membrane system network, rough ER, Golgi, alpha/dense granules, several beaded proplatelet extensions, muted educational palette matching exemplar house look, no text)
  ![textbook 2](theme/textbook/megakaryocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/megakaryocyte.textbook.svg)
[interactive SVG](theme/textbook/megakaryocyte.textbook.svg) · [HTML](theme/textbook/megakaryocyte.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1524 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.5s — pass (gemini-2.5-flash-image; single enormous rounded cell with subtle surface texture and several long thin beaded proplatelet extensions trailing toward the substrate, false-colour rose/violet palette on dark charcoal background, surface-only detail correct for SEM, no text, no border)
  ![sem 1](theme/sem/megakaryocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3273 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 16.6s — fail (gemini-2.5-flash-image, rendered near-monochrome in a single pink/mauve/cream palette with organelles barely distinguishable by colour - violates the '3d must use natural, clearly distinguishable biological tones, not near-monochrome' style rule, superseded)
  ![3d 1](theme/3d/megakaryocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 12.2s — pass (gemini-2.5-flash-image; distinct natural tints per structure - purple multi-lobed nucleus, blue-grey DMS network, green mitochondria, yellow Golgi, tan/maroon granules, beaded proplatelet extensions - not monochrome, not neon, no text, no border)
  ![3d 2](theme/3d/megakaryocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/megakaryocyte.3d.svg)
[interactive SVG](theme/3d/megakaryocyte.3d.svg) · [HTML](theme/3d/megakaryocyte.3d.html)

### Watercolor plate (`watercolor`) — 4 attempt(s), 7401 tok, $0.162
- attempt 1 · `gemini-2.5-flash-image` · 18.8s — fail (gemini-2.5-flash-image, baked-in faux cursive/handwritten caption text visible inside the cell body - violates no-baked-text rule, superseded)
  ![watercolor 1](theme/watercolor/megakaryocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 11.5s — fail (gemini-2.5-flash-image, faint illegible cursive-like scribble marks ringing the inner boundary read as baked pseudo-text rather than clean granule dots - superseded out of caution)
  ![watercolor 2](theme/watercolor/megakaryocyte.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 21.4s — fail (gemini-3-pro-image, tiny illegible baked-in text inside several mitochondria ovals plus a heavier vignette toward the page edges - violates no-baked-text rule, superseded)
  ![watercolor 3](theme/watercolor/megakaryocyte.attempts/gen-03__gemini-3-pro-image.avif)
- attempt 4 · `gemini-3-pro-image` · 27.5s — pass (gemini-3-pro-image; full-bleed aged paper background with a soft wash halo (not a hard frame/mat), single specimen, purple multi-lobed nucleus, blue-grey DMS network, yellow Golgi, tan mitochondria, pink/maroon granules, beaded branching proplatelet extensions with platelet-bud tips, no baked text)
  ![watercolor 4](theme/watercolor/megakaryocyte.attempts/gen-04__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/megakaryocyte.watercolor.svg)
[interactive SVG](theme/watercolor/megakaryocyte.watercolor.svg) · [HTML](theme/watercolor/megakaryocyte.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `Light microscopy (bone marrow aspirate smear, Wright-Giemsa stain)` · CC BY-SA 4.0 · Animalculist (Wikimedia Commons) — pass (Wikimedia Commons "Megakaryocyte_in_bone_marrow.jpg", CC BY-SA 4.0, Animalculist; light micrograph of Wright-Giemsa-stained bone-marrow aspirate smear showing a single, clearly isolated giant megakaryocyte roughly 10x the diameter of the surrounding erythrocytes, with a dense multi-lobed purple-staining nucleus and pale granular cytoplasm - matches the representative teaching description. Cleaned/recomposed version (edit_image.py) used for display, background red cells rendered as crisp evenly pink discs, no text/scale bar)
  ![reference](theme/blood-smear/megakaryocyte.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | use as final; accurate cutaway with single continuous multi-lobed nucleus, DMS network, rough ER, Golgi, granules and proplatelet extensions, matches exemplar palette/line style, no baked text after re-render |
| sem | pass | 1 | use as final; correct false-colour surface-only rendering of the giant cell with beaded proplatelet extensions, no internal detail (correct for SEM) |
| 3d | pass | 2 | use as final; natural distinguishable biological tints per structure after re-render, correct internal layering |
| watercolor | pass | 4 | use as final; full-bleed aged-paper composition with all core structures visible and no baked text, reached after escalating to gemini-3-pro-image following two flash fails |
