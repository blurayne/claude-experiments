# Staphylococcus aureus (MRSA) — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `staphylococcus-aureus`
**Short description:** Gram-positive grape-cluster coccus (~0.5–1.5 µm); a common skin/nose commensal that also causes wound infections, abscesses and sepsis. MRSA strains resist beta-lactam antibiotics.

Metadata sidecar: [`staphylococcus-aureus.render.meta.json`](staphylococcus-aureus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Staphylococcus aureus* is a **Gram-positive coccus**: an almost perfectly spherical cell roughly **0.5–1.5 µm** in diameter (typically ~1 µm). It divides in **multiple, irregular planes** and the daughter cells stay loosely attached, so cells pile up into characteristic **irregular grape-like clusters** (Greek *staphylē*, a bunch of grapes) — never long regular chains (those are *Streptococcus*). Clusters of a few to a few dozen cells are typical; individual cells often show a slightly flattened facet where they abut a neighbour, and a dividing cell carries a **cross-wall / septum**.

The envelope is the Gram-positive plan: a **thick peptidoglycan cell wall** (multi-layered murein sacculus, ~20–40 nm) studded with **wall teichoic acids** and anchored **cell-wall (surface) proteins** such as Protein A and the MSCRAMM adhesins (clumping factor, fibronectin-binding proteins), lying directly on the **plasma (cytoplasmic) membrane**. There is **no outer membrane and no LPS** (it is not Gram-negative). Many strains add a thin **polysaccharide capsule / slime layer** outside the wall. Inside is the **cytoplasm** with a condensed **nucleoid** (single circular chromosome), abundant tiny **ribosomes (70S)**, and often small **plasmids** that carry resistance and virulence genes. *S. aureus* is **non-motile** (no flagella), **non-spore-forming**, catalase- and coagulase-positive, a facultative anaerobe; the golden carotenoid **staphyloxanthin** gives colonies their "aureus" (golden) colour and helps resist oxidative killing.

**MRSA** (methicillin-resistant *S. aureus*) carries the **mecA** gene on a chromosomal **SCCmec** cassette, encoding an altered penicillin-binding protein (PBP2a) with low affinity for beta-lactams, so methicillin/oxacillin and most beta-lactams fail. Morphologically MRSA is identical to methicillin-sensitive *S. aureus* — the resistance is molecular, not a shape you can draw.

Sources: [NCBI Bookshelf, *Medical Microbiology* 4th ed. ch. 12 "Staphylococcus" (Kloos & Bannerman)](https://www.ncbi.nlm.nih.gov/books/NBK8448/), [StatPearls, "Staphylococcus Aureus" (NCBI Bookshelf)](https://www.ncbi.nlm.nih.gov/books/NBK441868/), [CDC — MRSA (Methicillin-resistant Staphylococcus aureus)](https://www.cdc.gov/mrsa/about/index.html), [Foster, "Staphylococcus" in *Medical Microbiology* (Univ. of Texas / NCBI)](https://www.ncbi.nlm.nih.gov/books/NBK8448/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `capsule` | capsula (glycocalyx) | Capsule / slime layer | Kapsel / Schleimhülle | polysaccharide coat: adhesion, resists phagocytosis & drying | outermost | optional |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall (peptidoglycan) | Zellwand (Peptidoglykan) | thick murein sacculus: shape, resists turgor; beta-lactam target | outer boundary | core (thick, Gram-pos) |
| `teichoic_acid` | acidum teichoicum | Wall teichoic acid | Teichonsäure | anionic polymers threading the wall: charge, adhesion, immune signalling | within wall | core |
| `surface_protein` | proteina superficialis (Protein A) | Surface protein (Protein A) | Oberflächenprotein (Protein A) | adhesins/immune evasion anchored in the wall | wall surface | typical |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | transport, energy/respiration; PBP2a (MRSA) sits here | innermost boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nucleoid | condensed circular chromosome | central, diffuse | core |
| `plasmid` | plasmidum | Plasmid | Plasmid | accessory genes (resistance, e.g. penicillinase; virulence) | cytoplasm | optional |
| `ribosome` | ribosoma (70S) | Ribosome | Ribosom | protein synthesis | dispersed dots | core |
| `septum` | septum divisionis | Division septum (cross-wall) | Teilungsseptum (Querwand) | new cross-wall of a dividing cell; multi-plane division → clusters | between paired cells | on dividing cells |

### Do NOT draw (scientifically misleading)
- **Flagella / pili / fimbriae** — *S. aureus* is **non-motile**; no swimming appendages.
- **Outer membrane / LPS / a thin Gram-negative wall** — it is **Gram-positive**: one thick peptidoglycan wall, no outer membrane.
- **Endospore** — *Staphylococcus* does **not** form spores.
- **Long regular chains or tetrad grids** — arrangement is **irregular grape-like clusters** (chains = *Streptococcus*, neat tetrads/sarcinae = other genera).
- **Mesosome** — EM fixation artifact, not real.
- Nucleoid as a tidy free-floating loop — it is a **diffuse condensed tangle**.
- Over-large / too-orderly ribosomes — they are tiny, numerous, random.
- Any membrane-bound organelles (no nucleus/mitochondria/ER/Golgi).
- A visible "MRSA" marker — resistance is molecular (mecA/PBP2a); it does not change the cell's shape.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **USDA ARS / Eric Erbe & Christopher Pooley** — low-temperature SEM of a **grape-like cluster of *S. aureus***, digitally colorized golden-yellow. Public domain (work of the U.S. federal government).
- file: https://upload.wikimedia.org/wikipedia/commons/8/80/Staphylococcus_aureus_01.jpg
- page: https://commons.wikimedia.org/wiki/File:Staphylococcus_aureus_01.jpg · License: **Public Domain (USDA ARS)** · Photo Eric Erbe, colorization Christopher Pooley, USDA ARS Electron & Confocal Microscopy Unit
- backups: [CDC PHIL #18169 SEM of MRSA (Public Domain, NIAID/CDC)](https://phil.cdc.gov/Details.aspx?pid=18169); [NIAID "MRSA" SEM set, Flickr, CC BY 2.0](https://www.flickr.com/photos/niaid/)
AI visual verification result: see §5 (verified after download).

<!-- assemble_md.py fills §3–6 below from the JSON sidecars -->
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Staph, a round little ball that never travels alone - it always piles up with its friends into a squishy bunch that looks just like a cluster of grapes! Most of the time Staph is just chilling on your skin or in your nose, being no trouble at all. But if it slips into a scrape or a cut, it can turn a wound red, puffy and sore. The good news: a clean bandage and some soap and water often send it packing, and for the stubborn clusters a doctor has a special cream or medicine that clears things right up.  
🇩🇪 Das ist Staph, eine runde kleine Kugel, die nie allein unterwegs ist - sie kuschelt sich immer mit ihren Freunden zu einem wabbeligen Haufen zusammen, der aussieht wie eine Weintraube! Meistens sitzt Staph einfach entspannt auf deiner Haut oder in deiner Nase und macht gar keinen Ärger. Rutscht es aber in eine Schürfwunde oder einen Kratzer, kann es die Stelle rot, dick und wund machen. Die gute Nachricht: Ein sauberes Pflaster und etwas Seife und Wasser schicken es oft schon wieder weg, und bei den hartnäckigen Haufen hat der Arzt eine besondere Creme oder Medizin, die alles wieder in Ordnung bringt.

**Adults (popular science, health).**  
🇬🇧 Staphylococcus aureus is one of the most common bacteria carried on human skin and in the nose, usually without causing any harm at all - roughly a third of people carry it at any given time. Trouble starts when it gets past a break in the skin: a splinter, a shaving nick, a surgical incision, and it can trigger anything from a small boil to a deep abscess or, rarely, a bloodstream infection. What makes it a public-health concern today is MRSA, a strain that has picked up resistance to the penicillin-family antibiotics doctors would normally reach for first. Good wound care, hand hygiene and, when needed, antibiotics chosen to match the resistance pattern keep it in check.  
🇩🇪 Staphylococcus aureus gehört zu den häufigsten Bakterien auf der menschlichen Haut und in der Nase und richtet dabei meist keinerlei Schaden an - etwa ein Drittel aller Menschen trägt es zu jedem Zeitpunkt in sich. Probleme entstehen, wenn es durch eine Hautverletzung eindringt, etwa einen Splitter, eine Rasurwunde oder einen chirurgischen Schnitt, und dann von einem kleinen Furunkel bis zu einem tiefen Abszess oder, selten, einer Blutbahninfektion alles auslösen kann. Zum aktuellen Gesundheitsthema wird es durch MRSA, einen Stamm, der Resistenzen gegen die sonst als erste Wahl eingesetzten Penicillin-Antibiotika entwickelt hat. Gute Wundversorgung, Händehygiene und, wenn nötig, gezielt auf das Resistenzmuster abgestimmte Antibiotika halten es in Schach.

**Scientific.**  
🇬🇧 Staphylococcus aureus is a Gram-positive, non-motile, catalase- and coagulase-positive coccus (~0.5-1.5 um) that divides in successive, irregular planes to form the characteristic grape-like clusters. Its envelope is a single thick peptidoglycan wall interwoven with wall teichoic acids and covalently anchored surface proteins (e.g. Protein A, clumping factor, fibronectin-binding proteins) that mediate adhesion and immune evasion, sitting directly on the cytoplasmic membrane with no outer membrane. The golden carotenoid staphyloxanthin confers oxidative-stress resistance and the species' namesake colour. Methicillin-resistant strains (MRSA) carry the SCCmec-borne mecA gene, encoding the low-affinity penicillin-binding protein PBP2a, which renders beta-lactam antibiotics ineffective without altering cell morphology. Clinically, S. aureus ranges from asymptomatic nasal/skin colonisation to superficial pyogenic infections (folliculitis, abscess) and, via secreted toxins and invasion, to bacteraemia, endocarditis and toxic shock syndrome.  
🇩🇪 Staphylococcus aureus ist ein grampositiver, unbeweglicher, katalase- und koagulasepositiver Kokkus (~0,5-1,5 um), der sich in aufeinanderfolgenden, unregelmäßigen Ebenen teilt und dadurch die charakteristischen traubenartigen Zellhaufen bildet. Seine Hülle besteht aus einer einzigen dicken Peptidoglykanwand, durchzogen von Teichonsäuren und kovalent verankerten Oberflächenproteinen (z. B. Protein A, Clumping-Faktor, Fibronektin-bindende Proteine), die Adhäsion und Immunevasion vermitteln, und liegt direkt der Zytoplasmamembran an, ohne äußere Membran. Das goldene Carotinoid Staphyloxanthin verleiht oxidativen Stressschutz und die namensgebende gelbe Farbe. Methicillin-resistente Stämme (MRSA) tragen das auf der SCCmec-Kassette liegende mecA-Gen, das das niedrig affine Penicillin-Bindeprotein PBP2a kodiert und Beta-Lactam-Antibiotika wirkungslos macht, ohne die Zellmorphologie zu verändern. Klinisch reicht S. aureus von symptomloser Besiedlung von Nase und Haut über eitrige Hautinfektionen (Follikulitis, Abszess) bis hin zu, durch sezernierte Toxine und Invasion, Bakteriämie, Endokarditis und toxischem Schocksyndrom.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of Staphylococcus aureus shown as a SINGLE compact IRREGULAR GRAPE-LIKE CLUSTER of about seven to twelve spherical Gram-positive cocci, centered in a square 1:1 1080x1080 frame that the artwork fills edge-to-edge on a neutral dark charcoal background, with generous negative space around the cluster for later labels. Match the exact refined house style of a muted, sophisticated, slightly desaturated educational palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading with subtle dimensionality, each structure its own distinct soft colour fill. The cells are near-perfect spheres roughly equal in size, piled together like a bunch of grapes in irregular planes (NOT a straight chain, NOT a neat grid); one or two cells show a faint cross-wall division septum where a cell is splitting. ONE prominent front cell is drawn as a neat quarter cut-away revealing the Gram-positive interior: pale cytoplasm, a diffuse condensed nucleoid shown as a soft irregular tangle (NOT a tidy DNA loop), one or two small circular plasmids, and tiny numerous randomly dispersed ribosomes. Its envelope shows just TWO correct Gram-positive layers: a single THICK peptidoglycan cell wall with fine teichoic-acid threading and a few small wall-anchored surface proteins, sitting directly on a thin inner plasma membrane, with an optional faint slime capsule outside. Absolutely NO outer membrane, NO flagella or pili, NO endospore, NO mesosome, NO membrane-bound organelles. Anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of Staphylococcus aureus as a SINGLE compact IRREGULAR GRAPE-LIKE CLUSTER of about a dozen spherical cocci, centered in a square 1:1 1080x1080 frame filled edge-to-edge with a generous empty margin, on a subtly textured neutral charcoal substrate. The cells are smooth near-perfect spheres of roughly equal size, ~1 micrometre across, heaped together like a bunch of grapes in irregular planes (NOT a straight chain, NOT a neat grid); several show a shallow division furrow / cross-wall where they are splitting, and a slightly wrinkled turgid surface. Render true 3D surface texture, shallow depth of field so the rear cocci fall softly out of focus, and cool studio microscopy lighting. False-color palette: warm golden-amber to bronze cells against the dark uncluttered background (the classic aureus gold). SEM shows the outside only, so render NO internal structures, and NO flagella, pili or spores. Looks like a real SEM plate minus any text. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Stylized semi-realistic 3D medical-illustration still of Staphylococcus aureus as a SINGLE compact IRREGULAR GRAPE-LIKE CLUSTER of about eight to ten spherical Gram-positive cocci, centered in a square 1:1 1080x1080 frame filled edge-to-edge, on a clean seamless dark studio background with soft global illumination, gentle rim light and subsurface scattering on the membranes. The cells are believable near-perfect spheres of roughly equal size, piled like a bunch of grapes in irregular planes (NOT a chain, NOT a grid); one or two show a cross-wall division furrow. ONE front cell uses a partial cut-away or gentle translucency to reveal the interior: soft cytoplasm, a diffuse condensed nucleoid as an irregular tangle (NOT a tidy DNA ring), one or two small circular plasmids, and tiny numerous randomly scattered ribosomes. The Gram-positive envelope reads as a single THICK peptidoglycan cell wall on a thin inner plasma membrane, with an optional faint translucent capsule. Colorize with natural believable biological tones so structures are clearly distinguishable: a warm translucent golden cell body, a distinct tint for the thick wall, the membrane, the bluish nucleoid, greenish plasmids and pale ribosome specks, not near-monochrome and not neon. Absolutely NO outer membrane, NO flagella or pili, NO endospore, NO mesosome, NO membrane-bound organelles. Anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted watercolour naturalist plate of Staphylococcus aureus in the style of a 19th-century scientific atlas but anatomically modern and correct, shown as a SINGLE compact IRREGULAR GRAPE-LIKE CLUSTER of about eight to twelve spherical Gram-positive cocci, large and centred. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner as the background, with a soft darker wash halo directly on the paper behind the cluster. Do NOT render the artwork as a separate sheet, card, mat, border or frame lying on any surface, and no drop-shadow around a sheet. Soft translucent watercolour washes with fine ink linework for the outlines. The cells are near-perfect spheres of roughly equal size, heaped like a bunch of grapes in irregular planes (NOT a straight chain, NOT a neat grid); one or two show a faint cross-wall division septum. ONE front cell is painted as a soft cut-away hinting at the interior: washed cytoplasm, a diffuse condensed nucleoid as a loose irregular tangle (NOT a tidy DNA loop), one or two small circular plasmids, and tiny scattered ribosome specks. Its envelope shows a single THICK Gram-positive peptidoglycan wall on a thin inner plasma membrane, with a faint slime capsule. Absolutely NO outer membrane, NO flagella or pili, NO endospore, NO mesosome, NO membrane-bound organelles. Single cluster, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1640 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 21.7s — PASS (gemini-2.5-flash-image) — grape-cluster morphology, cutaway of one cell showing thick peptidoglycan wall, plasma membrane, nucleoid, plasmid, ribosomes, division septum, surface protein (Protein A); refined muted palette.
  ![textbook 1](theme/textbook/staphylococcus-aureus.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/staphylococcus-aureus.textbook.svg)
[interactive SVG](theme/textbook/staphylococcus-aureus.textbook.svg) · [HTML](theme/textbook/staphylococcus-aureus.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1535 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 13.7s — PASS — cluster of smooth spheres, false-colour, surface only, no border/text.
  ![sem 1](theme/sem/staphylococcus-aureus.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 3 attempt(s), 5411 tok, $0.121
- attempt 1 · `gemini-2.5-flash-image` · 14.5s — PASS — cutaway with correct core structures; leader lines are a little busy/crossing but each anchor is correctly placed; 'Division septum' anchor is small/subtle.
  ![3d 1](theme/3d/staphylococcus-aureus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 14.1s — —
  ![3d 2](theme/3d/staphylococcus-aureus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 31.8s — —
  ![3d 3](theme/3d/staphylococcus-aureus.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/staphylococcus-aureus.3d.svg)
[interactive SVG](theme/3d/staphylococcus-aureus.3d.svg) · [HTML](theme/3d/staphylococcus-aureus.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1610 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 25.1s — PASS — full-bleed aged paper matching cocci exemplar; grape-cluster with cutaway showing wall/membrane/nucleoid/plasmid/ribosome.
  ![watercolor 1](theme/watercolor/staphylococcus-aureus.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/staphylococcus-aureus.watercolor.svg)
[interactive SVG](theme/watercolor/staphylococcus-aureus.watercolor.svg) · [HTML](theme/watercolor/staphylococcus-aureus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public Domain (USDA ARS) · Photo Eric Erbe, digital colorization Christopher Pooley, USDA ARS Electron & Confocal Microscopy Unit — PASS — real S. aureus micrograph per render.md §2.
  ![reference](theme/sem/staphylococcus-aureus.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | correct grape-cluster anatomy |
| sem | pass | 1 | surface cluster morphology |
| 3d | pass | 1 | correct anatomy, busy leader lines |
| watercolor | pass | 1 | full-bleed, correct anatomy |
