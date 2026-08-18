# Osteoclast — render log

**Set:** `bone-cells` · **Microbe key:** `osteoclast`
**Short description:** Multi-nucleated giant cell that resorbs bone. Secretes acid and enzymes that dissolve calcium and matrix.

Metadata sidecar: [`osteoclast.render.meta.json`](osteoclast.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The osteoclast is a large, terminally differentiated, multinucleated giant cell responsible for bone resorption. It arises from mononuclear precursors of the monocyte/macrophage lineage (haematopoietic stem cell → myeloid progenitor → monocyte-lineage preosteoclast), which fuse together under the control of RANKL (receptor activator of NF-κB ligand, produced by osteoblasts/osteocytes) and M-CSF to form a single giant cell containing anywhere from a couple to over a hundred nuclei — most teaching micrographs and diagrams show roughly 5–20 clustered nuclei in a mass of pale, foamy (vacuolated) cytoplasm. Osteoclasts sit directly on the mineralized bone surface, typically inside a self-dug resorption pit called Howship's lacuna.

When actively resorbing, the osteoclast polarizes and forms several distinct membrane domains. An actin-rich **sealing zone** (an attachment ring built from podosomes) clamps the cell's rim tightly to the bone matrix, sealing off an acidic microenvironment underneath the cell. Inside that sealed compartment, the plasma membrane facing the bone becomes enormously infolded into the **ruffled border** — a brush-like zone of membrane folds through which vacuolar H⁺-ATPase pumps and ClC-7 chloride channels acidify the sealed space to roughly pH 4–5, dissolving the mineral (hydroxyapatite), while lysosomal enzymes — chiefly **cathepsin K** (a collagenase that degrades type I collagen) together with matrix metalloproteinases and tartrate-resistant acid phosphatase (TRAP) — are secreted through the ruffled border to digest the exposed organic matrix. Degraded bone products are then transcytosed across the cell and released at the opposite, smooth **functional secretory domain**. Powering this acid/enzyme secretion requires a very large number of **mitochondria**, and a well-developed **Golgi apparatus** and abundant lysosomes/secretory vesicles synthesize and package the resorptive enzymes. On routine light microscopy (e.g. H&E), osteoclasts are recognisable as unusually large cells with a cluster of nuclei and a granular/foamy, often slightly acidophilic cytoplasm, typically abutting the bony trabecular surface; histochemically they stain strongly positive for TRAP. Osteoclast activity is balanced against bone-forming osteoblasts as part of continuous bone remodelling; when the two are out of balance (e.g. excess RANKL signalling with age or oestrogen loss), osteoclast resorption outpaces osteoblast formation, causing net bone loss as in osteoporosis.

Sources: [NCBI Bookshelf/StatPearls — Histology, Osteoclasts](https://www.ncbi.nlm.nih.gov/books/NBK554489/), [Wikipedia — Osteoclast](https://en.wikipedia.org/wiki/Osteoclast), [Teitelbaum 2000, "Bone Resorption by Osteoclasts", Science 289:1504-1508 (PubMed)](https://pubmed.ncbi.nlm.nih.gov/10968780/), [Boyle, Simonet & Lacey 2003, "Osteoclast differentiation and activation", Nature 423:337-342 (PubMed)](https://pubmed.ncbi.nlm.nih.gov/12748652/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nuclei` | nuclei multiplices | Nuclei (multiple) | Zellkerne (mehrere) | genome copies from fused precursor monocytes; hallmark of the cell | clustered centrally in the cytoplasm | core (count 5–20+ typical) |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; specialised into ruffled border + sealing zone when resorbing | outermost | core |
| `cytoplasm` | cytoplasma vacuolatum | Cytoplasm (foamy, vacuolated) | Zytoplasma (schaumig, vakuolisiert) | contains transport vesicles carrying digested bone products | fills the cell body | core |
| `ruffled_border` | margo plicatus | Ruffled border | Faltensaum (Ruffled Border) | deeply infolded resorptive membrane; site of acid/enzyme secretion into the sealed compartment | facing the bone surface, inside the sealing zone | core |
| `sealing_zone` | zona clausurae (anulus actinicus) | Sealing zone (actin ring) | Dichtungszone (Aktinring) | actin/podosome ring that clamps the cell to bone, sealing the resorption compartment | rim of the cell contacting bone | core |
| `mitochondrion` | mitochondrion | Mitochondria (numerous) | Mitochondrien (zahlreich) | ATP for the proton pumps that acidify the resorption space | dispersed through the cytoplasm | core |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages lysosomal/secretory enzymes (e.g. cathepsin K) for export | near the nuclei | core |
| `secretory_vesicle` | vesiculae secretoriae (cathepsina K) | Secretory vesicles / lysosomes (cathepsin K, TRAP) | Sekretorische Vesikel / Lysosomen (Cathepsin K, TRAP) | carry cathepsin K, MMPs and TRAP to the ruffled border; also transcytose degraded matrix | cytoplasm, concentrated toward the ruffled border | core |
| `bone_matrix` | matrix ossea | Bone matrix (mineralized surface) | Knochenmatrix (mineralisierte Oberfläche) | the mineralized hydroxyapatite/collagen substrate being resorbed (context, not part of the cell) | beneath/adjacent to the cell | core context |
| `howship_lacuna` | lacuna Howshipii | Resorption pit (Howship's lacuna) | Resorptionslakune (Howship-Lakune) | shallow pit the cell excavates into the bone surface as it resorbs (context) | in the bone surface under the cell | contextual |

### Do NOT draw (scientifically misleading)
- **Never a single nucleus** — the defining feature is MULTIPLE nuclei (several, clustered) fused from precursor monocytes; a mononuclear cell is not an osteoclast.
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is a human (eukaryotic) cell, not a prokaryote.
- **No chloroplasts or large central plant vacuole.**
- **Do not draw it free-floating with no bone surface** — the ruffled border and sealing zone only make sense sitting on/against a mineralized bone surface; always show at least a hint of the bone substrate the cell is resorbing.
- **Do not confuse with the osteoblast** (small, plump, single-nucleus, cuboidal, bone-building cell lining the surface) or the **osteocyte** (small star-shaped cell with dendritic processes, entombed alone inside its own lacuna within the matrix) — the osteoclast is the odd one out: much larger, irregular, and always multinucleated.
- **No cilia or flagella for locomotion** — osteoclasts move/spread by actin-driven membrane ruffling and podosome remodelling, not beating appendages.
- A single specimen (one giant cell on its patch of bone), not a dense sheet of many separate osteoclasts.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Osteoclast.jpg"**, a public-domain light micrograph of a genuine human osteoclast, showing the textbook-classic distinguishing features: a single large cell with a tight cluster of multiple nuclei and pale, foamy (vacuolated) cytoplasm, lying beneath a scattering of red blood cells and directly against a band of underlying bone/connective tissue matrix.
- file: https://upload.wikimedia.org/wikipedia/commons/1/1a/Osteoclast.jpg
- page: https://commons.wikimedia.org/wiki/File:Osteoclast.jpg · License: **Public domain** · Attribution: Robert M. Hunt (English Wikipedia)
- AI visual verification result: **PASS (2026-08-15).** Single dominant multinucleated cell clearly visible with ~10+ clustered dark-staining nuclei embedded in lighter, foamy cytoplasm, sitting directly against a darker matrix band (bone) at the lower edge of the frame, with red blood cells above for scale — unambiguously matches classic osteoclast histology. The raw download has no baked-in text/scale bar but is greyscale; a cleaned, false-colorized version is produced with `edit_image.py` for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Osteoclast — the biggest cell on the whole construction site of your skeleton! While most cells have just one nucleus, this giant is made of several monocyte cells that teamed up and melted together, so it ends up with a whole cluster of nuclei packed inside one huge body. Its job is to be the demolition crew: it clamps itself onto a patch of old or worn-out bone, seals the edges shut like a tiny diving bell, and then pumps out acid and special enzymes that dissolve the old bone away, crumb by crumb. That makes room for its teammate the osteoblast to build shiny new bone right behind it. Your skeleton is being quietly renewed like this your whole life — old bone out, new bone in — and the osteoclast is the one swinging the wrecking ball.  
🇩🇪 Das ist der Osteoklast — die größte Zelle auf der ganzen Baustelle deines Skeletts! Die meisten Zellen haben nur einen Zellkern, aber dieser Riese entsteht, weil sich mehrere Monozyten-Zellen zusammentun und miteinander verschmelzen — am Ende hat er also einen ganzen Haufen Zellkerne in einem einzigen riesigen Körper. Seine Aufgabe ist die Abrissmannschaft: Er klemmt sich an ein Stück altes, abgenutztes Knochengewebe, dichtet die Ränder ab wie eine winzige Taucherglocke und pumpt dann Säure und besondere Enzyme heraus, die den alten Knochen Krümel für Krümel auflösen. So entsteht Platz, damit sein Teamkollege, der Osteoblast, direkt dahinter frischen, glänzenden Knochen aufbauen kann. Dein Skelett wird dein ganzes Leben lang auf diese Weise leise erneuert — alter Knochen raus, neuer rein — und der Osteoklast ist derjenige mit der Abrissbirne.

**Adults (popular science, health).**  
🇬🇧 The osteoclast is the body's dedicated bone-demolition cell — a giant, multinucleated cell formed when several monocyte-lineage precursors fuse together, giving it a cluster of nuclei instead of the usual one. It anchors itself to a patch of bone, seals off the space underneath with a tight ring of actin filaments, and then floods that sealed pocket with acid and enzymes (notably cathepsin K) through a heavily folded 'ruffled border' membrane, dissolving both the mineral and the collagen scaffold of old or damaged bone. This is not destruction for its own sake: bone is a living tissue under constant renovation, and osteoclast resorption is normally matched, step for step, by bone-building osteoblasts. That balance is what keeps a skeleton strong yet responsive to load, injury and calcium demand throughout life. When the balance tips — for instance after menopause, when oestrogen no longer restrains osteoclast activity — resorption outpaces rebuilding and bone gradually thins, which is the underlying mechanism of osteoporosis.  
🇩🇪 Der Osteoklast ist die spezialisierte Abrisszelle des Körpers für Knochengewebe — eine riesige, vielkernige Zelle, die entsteht, wenn mehrere Vorläuferzellen aus der Monozyten-Linie miteinander verschmelzen, sodass sie statt eines einzelnen Zellkerns gleich einen ganzen Cluster besitzt. Er verankert sich an einem Stück Knochen, dichtet den Raum darunter mit einem engen Ring aus Aktinfilamenten ab und flutet diese abgedichtete Tasche dann über eine stark gefaltete 'Ruffled-Border'-Membran mit Säure und Enzymen (allen voran Cathepsin K), wodurch sowohl das Mineral als auch das Kollagen-Gerüst von altem oder beschädigtem Knochen aufgelöst werden. Das ist kein Selbstzweck: Knochen ist lebendiges Gewebe, das ständig umgebaut wird, und der Abbau durch Osteoklasten wird normalerweise Schritt für Schritt vom Knochenaufbau der Osteoblasten ausgeglichen. Dieses Gleichgewicht hält das Skelett stabil und trotzdem anpassungsfähig an Belastung, Verletzungen und den Kalziumbedarf ein Leben lang. Kippt das Gleichgewicht — etwa nach den Wechseljahren, wenn Östrogen die Osteoklasten-Aktivität nicht mehr bremst — überholt der Abbau den Aufbau, und der Knochen wird allmählich dünner; das ist der zugrunde liegende Mechanismus der Osteoporose.

**Scientific.**  
🇬🇧 The osteoclast is a terminally differentiated, multinucleated giant cell of monocyte/macrophage lineage, formed by RANKL- and M-CSF-driven fusion of mononuclear precursors. Upon attachment to mineralized bone matrix, it polarizes into distinct membrane domains: an actin-rich sealing zone (a podosome-based attachment ring) isolates an extracellular resorption compartment beneath the cell, within which the plasma membrane elaborates into a highly infolded ruffled border. Vacuolar H+-ATPases and ClC-7 chloride channels acidify this sealed lacuna (Howship's lacuna) to roughly pH 4-5, dissolving hydroxyapatite, while lysosomally derived cathepsin K, matrix metalloproteinases and tartrate-resistant acid phosphatase (TRAP) are secreted through the ruffled border to degrade the exposed type I collagen matrix; degraded products are transcytosed and released at the opposing functional secretory domain. The high metabolic demand of proton pumping is reflected in abundant mitochondria, and a well-developed Golgi apparatus and dense secretory-vesicle population support continuous enzyme trafficking. Osteoclastic resorption is normally coupled to osteoblastic bone formation as part of physiological bone remodelling; dysregulated RANKL/OPG signalling that favours osteoclastogenesis (e.g. oestrogen deficiency) uncouples this balance and underlies osteoporosis and related metabolic bone diseases.  
🇩🇪 Der Osteoklast ist eine terminal differenzierte, vielkernige Riesenzelle der Monozyten-/Makrophagen-Linie, die durch RANKL- und M-CSF-vermittelte Fusion mononukleärer Vorläuferzellen entsteht. Nach der Anheftung an mineralisierte Knochenmatrix polarisiert er in distinkte Membrandomänen: Eine aktinreiche Dichtungszone (ein podosomenbasierter Haftring) grenzt ein extrazelluläres Resorptionskompartiment unter der Zelle ab, in dem sich die Plasmamembran zu einem stark gefalteten Ruffled Border ausbildet. Vakuoläre H+-ATPasen und ClC-7-Chloridkanäle senken den pH-Wert dieser abgedichteten Lakune (Howship-Lakune) auf etwa 4-5 und lösen so das Hydroxylapatit, während lysosomales Cathepsin K, Matrix-Metalloproteinasen und tartratresistente saure Phosphatase (TRAP) über den Ruffled Border sezerniert werden, um die freigelegte Typ-I-Kollagenmatrix abzubauen; abgebaute Produkte werden transzytiert und an der gegenüberliegenden funktionellen Sekretionsdomäne freigesetzt. Der hohe Energiebedarf der Protonenpumpen spiegelt sich in zahlreichen Mitochondrien wider, und ein gut entwickelter Golgi-Apparat sowie eine dichte Population sekretorischer Vesikel unterstützen den kontinuierlichen Enzymtransport. Die osteoklastäre Resorption ist im physiologischen Knochenumbau normalerweise eng mit der osteoblastären Knochenbildung gekoppelt; eine gestörte RANKL/OPG-Signalgebung zugunsten der Osteoklastogenese (z. B. bei Östrogenmangel) entkoppelt dieses Gleichgewicht und liegt der Osteoporose und verwandten metabolischen Knochenerkrankungen zugrunde.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human osteoclast, a giant multinucleated bone-resorbing cell, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is large and irregularly rounded, sitting directly on a pale cream mineralized bone surface that occupies the lower portion of the frame (a shallow resorption pit visible in the bone beneath the cell). A neat cutaway through the upper two-thirds of the cell reveals the interior: a tight central cluster of 8 to 12 rounded violet nuclei, pale pinkish foamy/vacuolated cytoplasm dotted with small round vacuoles, several orange-red oval mitochondria with faint inner cristae scattered through the cytoplasm, a green stacked Golgi apparatus near the nuclei, and numerous small teal secretory-vesicle/lysosome dots concentrated toward the base of the cell. The membrane facing the bone at the bottom of the cell is drawn as a distinctly folded, brush-like amber 'ruffled border' pressed against the bone surface, flanked at both sides by a darker maroon band of dense actin filaments forming the 'sealing zone' where the cell rim clamps onto the bone. Anatomically faithful eukaryotic cell. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia; do NOT draw only a single nucleus (this cell must clearly show MULTIPLE clustered nuclei); this is NOT a bacterium and NOT a small single-nucleus cell like an osteoblast. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE giant human osteoclast spreading on a mineralized bone surface, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a large, irregularly rounded, flattened mass with a bumpy, ruffled, cauliflower-like surface texture (reflecting several underlying nuclear bulges and the deeply folded ruffled-border membrane beneath it), spread out and adherent to a subtly rough, mineral-textured bone substrate that fills the lower part of the frame. Render true 3D surface topology: gentle domed bulges where the clustered nuclei sit beneath the membrane, fine microvillus-like ruffling in a broad zone contacting the bone, and a smoother raised rim at the edges where the cell seals onto the surface. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm coral-to-amber cell body against a cooler pale grey-beige mineral bone substrate, dark uncluttered background beyond. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only, clearly much larger than a typical single-nucleus cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE giant human osteoclast, a multinucleated bone-resorbing cell, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is large and irregularly domed, resting on a pale mineralized bone surface occupying the lower part of the frame, with a shallow resorption pit visible where the cell meets the bone. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: a tight cluster of 8 to 12 rounded violet-toned nuclei near the cell's center, warm pale pinkish foamy cytoplasm full of small vacuoles, several glowing orange-red mitochondria with visible inner cristae, a green Golgi stack near the nuclei, and small teal secretory-vesicle/lysosome granules concentrated toward the base. The lower membrane facing the bone is modeled as a deeply folded, brush-like amber ruffled border pressed into the bone surface, bordered by a dense dark-red ring of actin filaments (the sealing zone) where the cell clamps onto the bone. Natural colours, not near-monochrome and not neon. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia; do NOT render only a single nucleus — this giant cell must clearly show MULTIPLE clustered nuclei, distinguishing it from ordinary single-nucleus cells. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE giant human osteoclast in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is large and irregularly rounded, resting on a pale cream painterly band of mineralized bone across the lower part of the frame, with a shallow resorption dip visible beneath the cell. A delicate painterly cutaway through the upper part of the cell reveals the interior: a tight cluster of 8 to 12 rounded violet-washed nuclei, pale pink foamy cytoplasm with small washed vacuoles, a scatter of warm orange-red mitochondria, a soft green Golgi stack near the nuclei, and fine teal secretory-vesicle dots toward the base of the cell. The membrane facing the bone is painted as a finely folded amber ruffled border, edged by a darker maroon-red band of actin (the sealing zone) where the cell meets the bone. Single specimen, anatomically faithful eukaryotic cell, clearly showing MULTIPLE clustered nuclei (never just one). Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1710 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 17.6s — pass (gemini-2.5-flash-image; muted educational palette, thin outlines matching cocci/rod-bacterium house style, tight cluster of ~10 violet nuclei, correct ruffled-border/sealing-zone anatomy against a bone-matrix band, no baked text)
  ![textbook 1](theme/textbook/osteoclast.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/osteoclast.textbook.svg)
[interactive SVG](theme/textbook/osteoclast.textbook.svg) · [HTML](theme/textbook/osteoclast.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1581 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 17.3s — pass (gemini-2.5-flash-image; false-colour surface-only SEM, correct cauliflower-like ruffled border and domed nuclear bulges, single specimen on a textured bone substrate, no internal organelles as expected for SEM)
  ![sem 1](theme/sem/osteoclast.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1653 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.1s — pass (gemini-2.5-flash-image; natural biological tints, translucent membrane with subsurface scattering, correct internal layering (nuclei cluster, mitochondria, Golgi, secretory vesicles) and ruffled border/sealing zone against the bone slab, clean dark studio background, no border)
  ![3d 1](theme/3d/osteoclast.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/osteoclast.3d.svg)
[interactive SVG](theme/3d/osteoclast.3d.svg) · [HTML](theme/3d/osteoclast.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1649 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 28.3s — pass (gemini-2.5-flash-image; warm aged paper fills the full frame edge-to-edge with a soft wash halo, no mat/frame/sheet-on-surface, correct structures and multinucleated morphology)
  ![watercolor 1](theme/watercolor/osteoclast.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/osteoclast.watercolor.svg)
[interactive SVG](theme/watercolor/osteoclast.watercolor.svg) · [HTML](theme/watercolor/osteoclast.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `light` · Public domain · Robert M. Hunt (English Wikipedia) — pass (Wikimedia Commons "Osteoclast.jpg", public domain, Robert M. Hunt; single dominant multinucleated cell with ~10+ clustered dark-staining nuclei in foamy cytoplasm directly against a darker bone matrix band, RBCs above for scale — unambiguous classic osteoclast histology; cleaned/false-colorized version used for display)
  ![reference](theme/light/osteoclast.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | use as final; accurate cutaway multinucleated osteoclast on bone, matches exemplar palette/line style |
| sem | pass | 1 | use as final; accurate false-colour surface rendering of a giant cell with domed nuclear bulges and a fringed ruffled border |
| 3d | pass | 1 | use as final; natural tints, correct internal layering and ruffled-border/sealing-zone anatomy |
| watercolor | pass | 1 | use as final; full-bleed aged-paper plate, correct multinucleated morphology, no framing violations |
