# Macrophage — render log

**Set:** `immune-cells` · **Microbe key:** `macrophage`
**Short description:** 'Big eater' of the innate immune system: a large, irregular ameboid cell with abundant cytoplasm, an eccentric kidney-shaped nucleus, dense lysosomes and phagosomes; engulfs bacteria, dead cells and debris, presents fragments to T cells and calls reinforcements with cytokines.

Metadata sidecar: [`macrophage.render.meta.json`](macrophage.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The macrophage ("big eater", from Greek *makros* + *phagein*) is a large (~15–50 µm, growing larger once activated) phagocyte of the innate immune system that differentiates from circulating blood monocytes after they migrate into tissue. Unlike the small, round, nucleus-dominated lymphocytes, a macrophage is cytoplasm-rich and morphologically irregular/ameboid: its plasma membrane is thrown into ruffles, broad sheet-like **lamellipodia** and thinner **filopodia** that constantly probe the surroundings and can wrap around a target to form a **phagocytic cup**, which closes into a **phagosome**. The single **nucleus** is comparatively small relative to the cell, oval to kidney-bean (reniform) shaped, and pushed to one side (**eccentric**) rather than filling the cell centrally as in a lymphocyte; chromatin is looser (more euchromatic) than a resting lymphocyte's, and a visible **nucleolus** reflects active protein synthesis. The abundant cytoplasm is packed with the machinery of a professional secretory/digestive cell: extensive **rough endoplasmic reticulum** and a well-developed **Golgi apparatus** (macrophages synthesise and secrete large amounts of cytokines, complement components and enzymes), numerous **mitochondria** to power motility and phagocytosis, and — the macrophage's hallmark — many **lysosomes**, dense membrane-bound vesicles loaded with hydrolytic enzymes. Ingested material (bacteria, dead/apoptotic cells, debris) sits inside a phagosome that fuses with lysosomes to form a **phagolysosome**, where it is digested; the resulting peptide fragments can be loaded onto MHC class II and displayed at the surface so the macrophage can act as an antigen-presenting cell for T cells. A dense cortical and phagocytic-cup **actin cytoskeleton** drives the membrane ruffling, crawling locomotion and engulfment. Macrophages are highly plastic and tissue-specific (e.g. Kupffer cells in the liver, alveolar macrophages in the lung, osteoclasts in bone, microglia in the brain) but share this core morphology: large size, irregular ameboid shape, eccentric reniform nucleus, abundant granular/vacuolated cytoplasm, and a ruffled surface with pseudopodia.

Sources: [NCBI Bookshelf — StatPearls, Histology, Macrophage](https://www.ncbi.nlm.nih.gov/books/NBK540980/), [Kenhub — Macrophages: Histology and function](https://www.kenhub.com/en/library/anatomy/macrophages), [Wikipedia — Macrophage](https://en.wikipedia.org/wiki/Macrophage), [Alberts et al., Molecular Biology of the Cell, 6th ed. — Innate Immunity (NCBI Bookshelf NBK26847)](https://www.ncbi.nlm.nih.gov/books/NBK26847/), [Uribe-Querol & Rosales 2020, Control of Phagocytosis by Microbial Pathogens (Front. Immunol., PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7136402/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; comparatively small, oval/kidney-shaped | eccentric, pushed to one side | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly; visible, reflects active protein synthesis | inside the nucleus | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | ruffled outer boundary carrying phagocytic and pattern-recognition receptors | outermost, irregular | core |
| `pseudopodium` | pseudopodium / lamellipodium | Pseudopodia (lamellipodia/filopodia) | Pseudopodien (Lamellipodien/Filopodien) | crawling and engulfing; wrap around targets to form the phagocytic cup | extending from the cell margin | core |
| `phagosome` | phagosoma | Phagosome | Phagosom | membrane-bound vesicle containing freshly engulfed material (e.g. a bacterium) | cytoplasm, near the surface | core |
| `lysosome` | lysosoma | Lysosome | Lysosom | small dense vesicles of digestive enzymes; numerous, hallmark of macrophages | scattered through the cytoplasm | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | synthesises secreted enzymes and cytokines | around the nucleus | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages/modifies secreted proteins (cytokines, enzymes) | near the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production powering motility and phagocytosis | numerous, dispersed in cytoplasm | core |
| `cytoskeleton` | cytoskeleton actini | Cortical/phagocytic actin cytoskeleton | Kortikales/phagozytäres Aktin-Zytoskelett | drives membrane ruffling, crawling and engulfment | just under the plasma membrane and in pseudopodia | core |

### Do NOT draw (scientifically misleading)
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is a eukaryotic human cell, not a prokaryote.
- **No chloroplasts or large central vacuole** — not a plant cell.
- **Not small and round with a nucleus filling the cell**, unlike a resting lymphocyte — the macrophage is large, irregular/ameboid, with abundant cytoplasm around a comparatively small, off-centre (eccentric) kidney-shaped nucleus.
- **No true cilia or flagella for locomotion** — the macrophage crawls by actin-driven pseudopodia (lamellipodia/filopodia), not by beating appendages.
- **Not smooth-surfaced** — the defining look is a ruffled, irregular membrane with reaching pseudopodia, not a neat sphere.
- A single specimen, not a dense sheet of confluent cells.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **Wikimedia Commons — "Macrophage (17195150690).jpg"**, a colorized scanning electron micrograph of a human macrophage, credited to NIAID (National Institute of Allergy and Infectious Diseases) via Flickr.
- file: https://upload.wikimedia.org/wikipedia/commons/e/ea/Macrophage_%2817195150690%29.jpg
- page: https://commons.wikimedia.org/wiki/File:Macrophage_(17195150690).jpg · License: **CC BY 2.0** · Attribution: NIAID
AI visual verification result: **PASS (2026-08-14).** Single dominant macrophage body (with a smaller second lobe/cell touching it at one edge) shown with its characteristic ruffled, membrane-bound surface and numerous long, thin, branching filopodia reaching outward across the substrate — a textbook depiction of a macrophage patrolling/probing its surroundings. Original is a greyscale-derived teal/brown false-colour SEM with no baked text; used directly (no scale bar, no border) as the reference image.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Say hello to the Macrophage, the biggest eater in your body's clean-up crew! Its name literally means 'big eater', and it lives up to it: it oozes around your tissues like a blob, stretching out long sticky arms to grab anything that doesn't belong — old worn-out cells, crumbs of dead tissue, dust from the air you breathe, even whole bacteria — and gulps them down whole. Once it's swallowed something interesting, it tears off a little piece and holds it up like a trophy to show the T-cells, its teammates, so they know exactly what to look out for. Then it shouts the alarm using chemical messengers, calling in backup from the rest of the immune squad. Every tissue has its own local macrophage on duty: in your lungs they're called alveolar macrophages, in your liver Kupffer cells, and they all do the same job — eat first, ask questions later, keep the neighbourhood tidy.  
🇩🇪 Das ist der Makrophage, der größte Fresser in der Aufräum-Truppe deines Körpers! Sein Name bedeutet wörtlich 'großer Fresser', und das nimmt er ernst: Er fließt wie ein Klecks durch dein Gewebe und streckt lange, klebrige Arme aus, um alles zu schnappen, was nicht dorthin gehört — alte, verbrauchte Zellen, Reste von totem Gewebe, Staub aus der Atemluft, sogar ganze Bakterien — und schluckt es einfach herunter. Hat er etwas Interessantes verschluckt, reißt er ein kleines Stückchen davon ab und hält es wie eine Trophäe hoch, damit die T-Zellen, seine Teamkolleginnen, genau wissen, wonach sie Ausschau halten müssen. Danach schlägt er mit Botenstoffen Alarm und ruft Verstärkung aus der Immun-Mannschaft herbei. In jedem Gewebe wohnt sein eigener Makrophage: in der Lunge heißen sie Alveolarmakrophagen, in der Leber Kupffer-Zellen, und alle machen denselben Job — erst essen, dann fragen, und die Nachbarschaft sauber halten.

**Adults (popular science, health).**  
🇬🇧 The macrophage is one of the body's most versatile innate-immune workhorses. Differentiating from blood monocytes once they settle into tissue, it patrols continuously, engulfing anything that looks foreign or worn out — bacteria, fungal spores, dying or damaged cells, cellular debris, even inhaled particles or early tumour cells. This phagocytosis isn't the end of the story: fragments of what it digests get displayed on its surface so T cells can recognise the threat, and it releases cytokines that recruit and activate other immune cells, turning a local encounter into a coordinated response. Different tissues host their own specialised resident populations — microglia in the brain, Kupffer cells in the liver, alveolar macrophages in the lungs, osteoclasts remodelling bone — reflecting how central this cell type is not just to fighting infection but to everyday tissue maintenance, wound healing and clearing the debris of normal cell turnover.  
🇩🇪 Der Makrophage ist einer der vielseitigsten Arbeiter des angeborenen Immunsystems. Er entwickelt sich aus Blutmonozyten, sobald diese ins Gewebe einwandern, und patrouilliert dort fortwährend, um alles zu verschlingen, was fremd oder verbraucht wirkt — Bakterien, Pilzsporen, sterbende oder geschädigte Zellen, Zelltrümmer, sogar eingeatmete Partikel oder frühe Tumorzellen. Mit dem Fressen allein ist es aber nicht getan: Bruchstücke dessen, was er verdaut, zeigt er an seiner Oberfläche, damit T-Zellen die Bedrohung erkennen können, und er schüttet Botenstoffe aus, die weitere Immunzellen anlocken und aktivieren — so wird aus einer lokalen Begegnung eine koordinierte Reaktion. Verschiedene Gewebe beherbergen ihre eigenen spezialisierten, ortsansässigen Populationen — Mikroglia im Gehirn, Kupffer-Zellen in der Leber, Alveolarmakrophagen in der Lunge, Osteoklasten beim Knochenumbau —, ein Zeichen dafür, wie zentral dieser Zelltyp nicht nur für die Infektionsabwehr, sondern auch für die alltägliche Gewebepflege, Wundheilung und das Entsorgen normaler Zellreste ist.

**Scientific.**  
🇬🇧 The macrophage is a large, terminally differentiated mononuclear phagocyte derived from circulating monocytes (or, in some tissues, from yolk-sac/fetal-liver progenitors seeded prenatally and self-renewing locally, e.g. microglia, Kupffer cells). Morphologically it is characterised by an irregular, ameboid cell body with membrane ruffling, lamellipodia and filopodia; an eccentric, oval-to-reniform nucleus with looser chromatin than a lymphocyte; abundant rough endoplasmic reticulum and a well-developed Golgi apparatus supporting high secretory output; and numerous lysosomes and phagosomes reflecting its principal function. Pattern-recognition receptors (Toll-like receptors, scavenger receptors, complement and Fc receptors) mediate recognition and internalisation of pathogens, apoptotic cells and debris via actin-driven phagocytosis; the resulting phagosome matures through fusion with lysosomes into a phagolysosome, where acid hydrolases and reactive oxygen/nitrogen species degrade the cargo. Peptide fragments can be loaded onto MHC class II for presentation to CD4+ T cells, linking innate recognition to adaptive immunity, while secreted cytokines (TNF-α, IL-1, IL-6, IL-12) and chemokines recruit and instruct additional effector cells. Macrophages further exhibit marked functional plasticity, polarising along a spectrum from pro-inflammatory (M1-like) to tissue-repair/anti-inflammatory (M2-like) phenotypes depending on the local cytokine milieu, underpinning roles in infection control, wound healing, tissue remodelling and homeostatic clearance of senescent cells.  
🇩🇪 Der Makrophage ist ein großer, terminal differenzierter mononukleärer Phagozyt, der aus zirkulierenden Monozyten hervorgeht (in manchen Geweben auch aus pränatal eingewanderten Dottersack-/Fetalleber-Vorläufern, die sich lokal selbst erneuern, z. B. Mikroglia, Kupffer-Zellen). Morphologisch zeichnet er sich durch einen unregelmäßigen, amöboiden Zellkörper mit Membranfalten, Lamellipodien und Filopodien aus, einen exzentrischen, oval- bis nierenförmigen Zellkern mit lockererem Chromatin als bei einem Lymphozyten, reichlich raues endoplasmatisches Retikulum und einen gut entwickelten Golgi-Apparat für eine hohe Sekretionsleistung sowie zahlreiche Lysosomen und Phagosomen, die seine Hauptfunktion widerspiegeln. Mustererkennungsrezeptoren (Toll-like-Rezeptoren, Scavenger-Rezeptoren, Komplement- und Fc-Rezeptoren) vermitteln die Erkennung und aktinabhängige Aufnahme von Erregern, apoptotischen Zellen und Zelltrümmern; das entstandene Phagosom reift durch Fusion mit Lysosomen zum Phagolysosom, in dem saure Hydrolasen und reaktive Sauerstoff-/Stickstoffspezies das Material abbauen. Peptidfragmente können auf MHC-Klasse-II geladen und CD4+-T-Zellen präsentiert werden, was die angeborene Erkennung mit der adaptiven Immunität verknüpft, während sezernierte Zytokine (TNF-α, IL-1, IL-6, IL-12) und Chemokine weitere Effektorzellen anlocken und instruieren. Zudem zeigen Makrophagen eine ausgeprägte funktionelle Plastizität und polarisieren je nach lokalem Zytokinmilieu entlang eines Spektrums von proinflammatorischen (M1-artigen) zu gewebereparierenden/entzündungshemmenden (M2-artigen) Phänotypen, was ihre Rolle bei Infektionsabwehr, Wundheilung, Gewebeumbau und der homöostatischen Beseitigung seneszenter Zellen begründet.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human macrophage, a large irregular ameboid immune cell, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark-charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell body is large, irregular and ameboid, with a ruffled plasma membrane extending several broad sheet-like pseudopodia (lamellipodia) and a few thin filopodia reaching outward, one of them curling into a phagocytic cup around a small bacterium being engulfed at the cell margin. A neat quarter cut-away reveals the interior: a comparatively small, oval kidney-bean-shaped nucleus pushed to one side (eccentric, not centered) with a visible nucleolus, abundant pale cytoplasm, folded rough endoplasmic reticulum sheets studded with tiny ribosome dots near the nucleus, a curved stack of Golgi apparatus cisternae, several small round mitochondria with faint inner cristae dispersed through the cytoplasm, numerous small dense round lysosomes, one or two larger phagosome vesicles (one containing a partly digested bacterium), and fine actin cytoskeleton fibres running just under the membrane and into the pseudopodia. Anatomically faithful eukaryotic cell, abundant cytoplasm dominating over the small nucleus (unlike a lymphocyte). Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, true flagella or cilia; this is NOT a bacterium and NOT a small round lymphocyte. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human macrophage spreading on a substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a large, irregular, flattened ameboid body with a ruffled, textured surface, extending broad sheet-like lamellipodia and several long thin branching filopodia that reach outward and anchor to a subtly textured neutral substrate. Render true 3D surface texture: gentle membrane ruffles and folds over the cell body, a slightly domed area over the nucleus, and thread-like filopodia tapering to fine points. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: soft teal-green to bronze cell body against a warm sandy-brown background, matching a typical colorized immune-cell SEM plate. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human macrophage, a large irregular ameboid immune cell, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent, ruffled plasma membrane. The cell body is large and irregular, extending broad pseudopodia (lamellipodia) and thin filopodia, with one pseudopodium wrapped around a small bacterium mid-engulfment at the cell margin. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so the structures are clearly distinguishable: a comparatively small, oval kidney-shaped nucleus pushed to one side with a visible nucleolus, warm translucent cytoplasm, folded rough endoplasmic reticulum near the nucleus, a curved Golgi stack, several small round mitochondria with inner cristae, numerous small dense lysosomes (rendered as tiny reddish-purple dotted vesicles), one or two phagosome vesicles containing engulfed material, and fine actin cytoskeletal fibres beneath the membrane and inside the pseudopodia. Natural colours, not near-monochrome and not neon; abundant cytoplasm clearly dominating over the small nucleus. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, true flagella or cilia; this is an ameboid immune cell, not a bacterium and not a small round lymphocyte. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human macrophage in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell body is large, irregular and ameboid, its ruffled edge extending broad pseudopodia and a few thin filopodia, one curling around a small bacterium being engulfed at the margin. A delicate painterly cut-away reveals the interior: a small, off-centre oval kidney-shaped nucleus with a visible nucleolus, washed cytoplasm, folded rough endoplasmic reticulum near the nucleus, a curved Golgi stack, a few small round mitochondria, numerous small dense lysosome dots, one or two phagosome vesicles with engulfed material inside, and fine actin cytoskeletal fibres along the membrane and pseudopodia. Single specimen, anatomically faithful, abundant cytoplasm dominating over the small nucleus. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, true flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1681 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.2s — pass (gemini-2.5-flash-image; muted desaturated educational palette, thin clean outlines, correct cutaway showing a large ameboid body with broad lamellipodia and thin filopodia, small eccentric kidney-shaped nucleus with visible nucleolus, rough ER, Golgi stack, several mitochondria, numerous small dense lysosomes, and a small rod-shaped bacterium being engulfed at the margin (phagosome); matches cocci/rod-bacterium house look, neutral dark-charcoal background, single specimen, no border)
  ![textbook 1](theme/textbook/macrophage.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/macrophage.textbook.svg)
[interactive SVG](theme/textbook/macrophage.textbook.svg) · [HTML](theme/textbook/macrophage.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1537 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.2s — pass (gemini-2.5-flash-image; single dominant ameboid cell with a ruffled, textured surface and numerous long thin branching filopodia radiating outward across a subtly textured substrate, teal-over-warm-beige false colour, crisp 3D surface texture with shallow depth of field, clean uncluttered background, surface only (no internal structures, correct for SEM), no text/border, matches the real macrophage SEM reference well)
  ![sem 1](theme/sem/macrophage.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1625 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.2s — pass (gemini-2.5-flash-image; natural warm translucent cytoplasm, soft global illumination and rim light, subsurface scattering on the ruffled membrane, small eccentric oval nucleus with visible nucleolus, rough ER, Golgi stack, mitochondria, numerous small reddish-purple lysosome dots, a bacterium mid-engulfment at the margin (phagosome), broad pseudopodia and fine filopodia radiating outward on a clean dark studio background; natural biological tones, not neon/monochrome)
  ![3d 1](theme/3d/macrophage.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/macrophage.3d.svg)
[interactive SVG](theme/3d/macrophage.3d.svg) · [HTML](theme/3d/macrophage.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1614 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 22.8s — pass (gemini-2.5-flash-image; warm aged paper fills the entire frame edge-to-edge with a soft darker wash halo directly on the paper (no mat/frame/sheet-on-surface), fine ink linework, irregular ameboid body with ruffled pseudopodial edge and thin filopodia, small off-centre kidney-shaped nucleus with nucleolus, rough ER, Golgi, mitochondria, lysosome dots, and a small elongated organism being engulfed at the margin (phagosome); matches cocci/rod-bacterium watercolor house look)
  ![watercolor 1](theme/watercolor/macrophage.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/macrophage.watercolor.svg)
[interactive SVG](theme/watercolor/macrophage.watercolor.svg) · [HTML](theme/watercolor/macrophage.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · CC BY 2.0 · NIAID, via Flickr/Wikimedia Commons — pass (Wikimedia Commons 'Macrophage (17195150690).jpg', NIAID via Flickr, CC BY 2.0 colorized SEM; single dominant macrophage body with a smaller second lobe/cell touching it at one edge, characteristic ruffled membrane-bound surface and numerous long thin branching filopodia reaching outward — a textbook depiction of a macrophage patrolling/probing its surroundings; no baked-in text/scale bar, used as-is)
  ![reference](theme/sem/macrophage.attempts/real-01__SEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | use as final; accurate ameboid morphology with correct organelle set matching exemplar palette/line style |
| sem | pass | 1 | use as final; accurate ruffled surface with radiating filopodia, correct false-colour SEM rendering, matches real reference |
| 3d | pass | 1 | use as final; correct internal layering, natural biological tints, phagocytosis clearly depicted |
| watercolor | pass | 1 | use as final; full-bleed aged-paper composition with correct ameboid anatomy |
