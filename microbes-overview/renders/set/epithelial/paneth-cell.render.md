# Paneth cell — render log

**Set:** `epithelial` · **Microbe key:** `paneth-cell`
**Short description:** Pyramidal secretory epithelial cell at the base of small-intestinal crypts, packed with large apical eosinophilic secretory granules; releases antimicrobial defensins and lysozyme to protect the neighbouring intestinal stem-cell niche.

Metadata sidecar: [`paneth-cell.render.meta.json`](paneth-cell.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The Paneth cell is a terminally differentiated secretory epithelial cell of the small intestine, sitting intercalated among the Lgr5+ intestinal stem cells at the very base of the crypts of Lieberkühn. Unlike the columnar absorptive enterocytes and goblet cells that migrate upward and slough off, Paneth cells stay put at the crypt base and are long-lived (turnover on the order of weeks). Morphologically the cell is markedly pyramidal (wedge-shaped): a wide base resting on the basal lamina, narrowing to a small apex that opens into the crypt lumen and carries a short fringe of apical microvilli. The nucleus sits in the basal third of the cell. Above it, the cytoplasm shows the classic architecture of a professional protein-secreting cell: extensive stacked sheets of rough endoplasmic reticulum in the basal cytoplasm (feeding a high rate of protein synthesis), a prominent, curved supranuclear Golgi apparatus that packages the secretory product, and numerous mitochondria supplying the ATP for this secretory workload. The single most distinctive, diagnostic feature is the apical third of the cell being packed with large, round, densely eosinophilic secretory (zymogen) granules — on H&E stain these stain a strong pink/red, distinguishing Paneth cells at a glance from the neighbouring goblet cells (pale, mucus-filled) and stem/progenitor cells. These granules are discharged by regulated apical exocytosis into the crypt lumen and contain a broad antimicrobial arsenal: alpha-defensins (called cryptdins in mice; human alpha-defensin 5/6 the major human constituent), lysozyme C, secretory phospholipase A2, RegIIIγ/RegIIIα C-type lectins and angiogenin-4. Neighbouring epithelial cells are joined near the apex by a junctional complex (tight junction/zonula occludens plus adherens junction) that seals the crypt lumen from the underlying tissue. Beyond direct antimicrobial defence, Paneth cells are a core structural and signalling component of the crypt-base stem-cell niche: they express Wnt3, EGF, Dll4/Dll1 (Notch ligands) and TGF-α, providing juxtacrine/paracrine support required for stem-cell maintenance.

Sources: [Wikipedia — Paneth cell](https://en.wikipedia.org/wiki/Paneth_cell), [Clevers & Bevins 2013, "Paneth cells: maestros of the small intestinal crypts", *Annu Rev Physiol* 75:289–311 (PubMed)](https://pubmed.ncbi.nlm.nih.gov/23398152/), [Ouellette 2010, "Paneth cells and innate mucosal immunity", *Curr Opin Gastroenterol* (PubMed)](https://pubmed.ncbi.nlm.nih.gov/20844398/), [Clevers 2013, "The intestinal crypt, a prototype stem cell compartment", *Cell* (PubMed)](https://pubmed.ncbi.nlm.nih.gov/23684607/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `secretory_granules` | granula secretoria | Secretory granules (defensins, lysozyme) | Sekretgranula (Defensine, Lysozym) | store & release antimicrobial peptides (α-defensins, lysozyme, sPLA2) by apical exocytosis; the defining feature of the cell | packed into the apical third | core |
| `nucleus` | nucleus | Nucleus (basal) | Zellkern (basal) | holds the genome | basal third of the cell | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | synthesises the granule proteins; extensive, reflecting high secretory output | basal cytoplasm, around/below the nucleus | core |
| `golgi` | apparatus Golgiensis (supranuclearis) | Golgi apparatus (supranuclear) | Golgi-Apparat (supranukleär) | packages and concentrates secretory proteins into granules | just above the nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP supply for the secretory workload | scattered through the cytoplasm | core |
| `microvilli` | microvilli | Apical microvilli | Apikale Mikrovilli | short brush border facing the crypt lumen | apical surface | core |
| `junctional_complex` | complexus iunctionalis | Junctional complex (tight junction) | Schlussleistenkomplex (Tight Junction) | seals the crypt lumen from underlying tissue; anchors neighbouring cells | lateral membrane near the apex | core |
| `basal_lamina` | lamina basalis | Basal lamina | Basallamina | thin extracellular sheet the cell rests on | outer basal boundary | core |
| `crypt_lumen` | lumen cryptae | Crypt lumen | Kryptenlumen | the space the granule contents are secreted into | above the apical surface | core |

### Do NOT draw (scientifically misleading)
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is an animal epithelial cell, not a bacterium.
- **No chloroplasts or a large central plant-style vacuole.**
- **No beating motile cilium** — the apex carries short, non-motile microvilli (a brush border), not a single large cilium.
- **Granules must not be drawn as tiny dust-like specks scattered everywhere** — they are large, round, tightly packed and confined to the apical third; that packed apical granule cluster is the single most diagnostic feature and must dominate the image.
- **Not a goblet-cell "balloon"** — do not draw one giant pale mucus-filled apical bubble; Paneth granules are numerous, round, individually distinct and eosinophilic (pink/red/orange), not a single pale mucous mass.
- **Not a full multi-cell crypt cross-section** — a single specimen, with neighbouring cells/junctions only faintly implied at the very apical edges.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
**Wikimedia Commons — "Histology of paneth cells, original.jpg"**, an H&E-stained light micrograph of a small-intestinal crypt section showing Paneth cells at the crypt base with their characteristic strongly eosinophilic (pink/red) apical granules, alongside neighbouring goblet cells (pale, mucus-filled) and columnar cells with basal nuclei.
- file: https://upload.wikimedia.org/wikipedia/commons/9/94/Histology_of_paneth_cells%2C_original.jpg
- page: https://commons.wikimedia.org/wiki/File:Histology_of_paneth_cells,_original.jpg · License: **CC0 1.0 (public domain)** · Attribution: Mikael Häggström, M.D.
- modality: H&E light micrograph

AI visual verification result: **PASS.** Genuine H&E-stained crypt section: elongated crypt profiles cut in cross/oblique section, columnar epithelial cells with basally located, deeply basophilic (dark purple) nuclei lining the crypts, and clusters of pale, foamy/vacuolated apical zones from goblet cells interspersed among them; cells at crypt bases show denser, more granular pink/red-tinged apical cytoplasm consistent with Paneth-cell granules. Real photomicrograph of intestinal tissue (not an illustration), correctly sourced and licensed for teaching use. No baked-in scale bar or caption in the frame.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Paneth Cell — the tiny gatekeeper guarding the very bottom of your gut's crypts (deep little pits in the lining of your small intestine)! It stands right next to your precious intestinal stem cells, like a bodyguard at their front door. Whenever a germ gets too close, the Paneth Cell fires off tiny chemical weapons called defensins and lysozyme — think of them as its own custom-made spray that keeps the neighbourhood safe. It never wanders off; it just stays at its post, packed to the brim with these ready-to-fire granules, making sure the stem cells next door can keep doing their very important job of building fresh gut lining every single day.  
🇩🇪 Das ist die Paneth-Zelle — die kleine Torwächterin ganz unten in den Krypten deines Darms (das sind winzige Vertiefungen in der Darmschleimhaut)! Sie steht direkt neben deinen kostbaren Darm-Stammzellen, wie eine Leibwächterin vor deren Haustür. Kommt ein Keim zu nah, feuert die Paneth-Zelle winzige chemische Waffen ab, die Defensine und Lysozym heißen — eine Art selbstgemachtes Spray, das die Nachbarschaft sauber hält. Sie wandert nie weg, sondern bleibt einfach auf ihrem Posten, randvoll mit einsatzbereiten Körnchen, damit die Stammzellen nebenan jeden Tag in Ruhe neue Darmschleimhaut bauen können.

**Adults (popular science, health).**  
🇬🇧 The Paneth cell sits at the very base of the crypts of Lieberkühn in the small intestine, right beside the intestinal stem cells that continuously regenerate the gut lining. Its cytoplasm is crammed with large granules containing antimicrobial molecules — alpha-defensins, lysozyme, phospholipase A2 — which it releases into the crypt in response to bacteria and their molecular signatures. This keeps the microbial population near the stem-cell niche in check without triggering a full inflammatory response, and it supplies growth factors that help maintain the stem cells themselves. Because of this dual role, Paneth cell dysfunction is closely linked to inflammatory bowel diseases such as Crohn's disease.  
🇩🇪 Die Paneth-Zelle sitzt ganz am Grund der Lieberkühn-Krypten im Dünndarm, direkt neben den Darm-Stammzellen, die die Darmschleimhaut ständig erneuern. Ihr Zytoplasma ist vollgepackt mit großen Granula voller antimikrobieller Moleküle — Alpha-Defensine, Lysozym, Phospholipase A2 —, die sie als Reaktion auf Bakterien und deren molekulare Signale in die Krypte abgibt. So wird die Keimzahl in der Nähe der Stammzell-Nische in Schach gehalten, ohne eine ausgeprägte Entzündungsreaktion auszulösen, und gleichzeitig liefert sie Wachstumsfaktoren, die die Stammzellen selbst unterstützen. Wegen dieser Doppelrolle steht eine gestörte Paneth-Zell-Funktion in engem Zusammenhang mit chronisch-entzündlichen Darmerkrankungen wie Morbus Crohn.

**Scientific.**  
🇬🇧 Paneth cells are terminally differentiated, long-lived (~30–60 day turnover) secretory epithelial cells positioned at the base of the small-intestinal crypts of Lieberkühn, intercalated among Lgr5+ intestinal stem cells. Morphologically they are pyramidal, with a basal nucleus, hyperplastic rough endoplasmic reticulum and a prominent supranuclear Golgi apparatus reflecting a classic serous secretory phenotype, and are dominated apically by large electron-dense secretory (zymogen) granules discharged by regulated apical exocytosis. These granules contain a broad antimicrobial arsenal — α-defensins (cryptdins in mice; human α-defensin 5/6 the major constituent in humans), lysozyme C, secretory phospholipase A2, RegIIIγ/RegIIIα C-type lectins and angiogenin-4 — released in response to cholinergic, bacterial (TLR/NOD2, MyD88-dependent) and Ca2+-mediated stimuli. Beyond direct antimicrobial defence, Paneth cells are a core structural and signalling component of the crypt-base stem-cell niche: they express Wnt3, EGF, Dll4/Dll1 (Notch ligands) and TGF-α, providing juxtacrine and paracrine support that is required for Lgr5+ stem-cell maintenance in vitro (organoid co-culture) and contributes to it in vivo. NOD2 mutations that impair Paneth cell granule composition are a major genetic risk factor for ileal Crohn's disease.  
🇩🇪 Paneth-Zellen sind terminal differenzierte, langlebige (Umsatz ca. 30–60 Tage) sekretorische Epithelzellen am Grund der Lieberkühn-Krypten des Dünndarms, eingestreut zwischen Lgr5-positiven Darmstammzellen. Morphologisch sind sie pyramidenförmig mit basalem Zellkern, hyperplastischem rauem endoplasmatischem Retikulum und einem ausgeprägten supranukleären Golgi-Apparat, was den klassischen serösen Sekretionsphänotyp widerspiegelt; apikal dominieren große elektronendichte Sekretgranula (Zymogengranula), die durch regulierte apikale Exozytose freigesetzt werden. Diese Granula enthalten ein breites antimikrobielles Arsenal — Alpha-Defensine (bei Mäusen Cryptdine; beim Menschen humanes Alpha-Defensin 5/6 als Hauptbestandteil), Lysozym C, sekretorische Phospholipase A2, die C-Typ-Lektine RegIIIγ/RegIIIα und Angiogenin-4 —, das als Reaktion auf cholinerge, bakterielle (TLR/NOD2, MyD88-abhängige) und Ca2+-vermittelte Reize ausgeschüttet wird. Über die direkte antimikrobielle Abwehr hinaus sind Paneth-Zellen ein zentraler struktureller und signalgebender Bestandteil der Stammzell-Nische am Kryptengrund: Sie exprimieren Wnt3, EGF, Dll4/Dll1 (Notch-Liganden) und TGF-α und liefern damit juxtakrine und parakrine Unterstützung, die für den Erhalt der Lgr5-Stammzellen in vitro (Organoid-Kokultur) notwendig ist und in vivo dazu beiträgt. NOD2-Mutationen, die die Granula-Zusammensetzung der Paneth-Zellen beeinträchtigen, gehören zu den wichtigsten genetischen Risikofaktoren für den ilealen Morbus Crohn.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human Paneth cell, a pyramidal secretory epithelial cell from the base of a small-intestinal crypt, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is pyramidal/wedge-shaped, wide base at the bottom (resting on a thin basal lamina) narrowing toward a small apex that opens into the crypt lumen at the top. A neat quarter cut-away reveals the interior: a round nucleus pushed toward the basal third of the cell, dense basal cytoplasm packed with stacked sheets of rough endoplasmic reticulum studded with tiny ribosome dots, a prominent curved Golgi apparatus sitting just above the nucleus (supranuclear), several oval mitochondria with faint inner cristae scattered through the cytoplasm, and the defining feature: a cluster of large, round, densely packed eosinophilic secretory granules filling the apical third of the cell just beneath a short fringe of apical microvilli facing the crypt lumen. Neighbouring cell membranes with a tight junctional complex are faintly indicated only at the very apical corners, not as full extra cells. Anatomically faithful animal epithelial cell. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella, or a beating cilium; this is NOT a bacterium and NOT a ciliated cell. Do NOT draw the granules as tiny dust-like specks — they must read as large, round, tightly packed dense granules, the single most prominent structure in the cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human Paneth cell exposed at the base of a fractured small-intestinal crypt, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is pyramidal, wide at its base and narrowing toward a small apical surface studded with short stubby microvilli that opens into the crypt lumen; the fractured cut surface reveals the rounded contours of numerous large, tightly packed secretory granules bulging just under the apical membrane, giving the cell a distinctive bumpy, grape-cluster apical profile compared to the smoother neighbouring absorptive cells. Render true 3D surface texture with shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm amber to soft coral-pink cell body against a cooler bluish-grey crypt wall and dark uncluttered background. SEM shows the outer/fractured surface only, so keep the deep interior implied by rounded granule bulges rather than drawn as flat internal cutaway detail. Anatomically faithful, single specimen emphasized, only its immediate crypt-base neighbours faintly implied at the edges. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human Paneth cell, a pyramidal secretory epithelial cell from the base of an intestinal crypt, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is wedge/pyramid-shaped, wide base at the bottom, narrow apex with short microvilli at the top facing an implied crypt lumen. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so the structures are clearly distinguishable: a round nucleus in the basal third, dense folded rough endoplasmic reticulum sheets below it, a curved supranuclear Golgi apparatus, a few oval mitochondria with visible inner cristae, and — the dominant, unmistakable feature — a tightly packed cluster of large, round, glossy secretory granules filling the apical third of the cell with a warm orange-to-red translucent glassy material, like a cluster of grapes just under the apical membrane. Natural colours, not near-monochrome and not neon; the granules should be the visually loudest structure in the cell. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, or a motile cilium; this is a secretory animal epithelial cell, not a bacterium. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human Paneth cell in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is pyramidal, wide base at the bottom tapering to a narrow apex with a short fringe of microvilli at the top. A delicate painterly cut-away reveals the interior: a round basal nucleus, washed folded rough endoplasmic reticulum in the lower cytoplasm, a curved Golgi apparatus just above the nucleus, a few oval mitochondria, and a bold cluster of large round secretory granules painted in a rich warm red-orange wash filling the apical third of the cell, clustered like grapes beneath the microvilli — this granule cluster should be the most visually striking, saturated part of the painting. Single specimen, anatomically faithful secretory epithelial cell. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella, or a motile cilium. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1706 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.8s — PASS (gemini-2.5-flash-image) — pyramidal cell on a basal lamina, basal nucleus (blue), extensive stacked rough ER with ribosome dots below/around it, curved supranuclear Golgi apparatus, scattered oval mitochondria, and the diagnostic apical third densely packed with large round eosinophilic (pink) secretory granules beneath a short microvillar fringe at the small apex; muted desaturated palette, thin clean outlines, no border/text, matches house textbook look.
  ![textbook 1](theme/textbook/paneth-cell.attempts/gen-01__gemini-2.5-flash-image.png)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/paneth-cell.textbook.svg)
[interactive SVG](theme/textbook/paneth-cell.textbook.svg) · [HTML](theme/textbook/paneth-cell.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1567 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 28.1s — PASS (gemini-2.5-flash-image) — pyramidal cell fractured open at a crypt base, wide base narrowing to a small apex studded with short stubby microvilli, fractured surface reveals rounded bulging secretory granules packed tightly giving a grape-cluster apical profile; warm amber-coral false colour against cooler bluish-grey neighbouring crypt wall on dark background, shallow depth of field, single specimen emphasised, no border/text.
  ![sem 1](theme/sem/paneth-cell.attempts/gen-01__gemini-2.5-flash-image.png)

### 3D medical render (`3d`) — 1 attempt(s), 1615 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 20.5s — PASS (gemini-2.5-flash-image) — wedge/pyramid-shaped cell with soft global illumination and rim light on dark studio background; translucent basal nucleus, folded rough ER sheets, curved supranuclear Golgi, oval mitochondria with cristae, and the dominant tightly packed cluster of large glossy orange-to-red translucent secretory granules filling the apical third beneath short microvilli; natural biological tones (not neon/monochrome), no border/text.
  ![3d 1](theme/3d/paneth-cell.attempts/gen-01__gemini-2.5-flash-image.png)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/paneth-cell.3d.svg)
[interactive SVG](theme/3d/paneth-cell.3d.svg) · [HTML](theme/3d/paneth-cell.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1610 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 17.8s — PASS (gemini-2.5-flash-image) — aged paper fills the full frame edge-to-edge (no separate sheet/mat/border/drop-shadow), fine ink outlines with soft watercolour washes; pyramidal cell with basal blue-washed nucleus, pale ER striations, small olive Golgi shape, a few reddish mitochondria ovals, and a bold saturated cluster of large round red-orange secretory granules filling the apical third beneath a short microvillar fringe — the most visually striking part of the painting as required; single specimen, no text.
  ![watercolor 1](theme/watercolor/paneth-cell.attempts/gen-01__gemini-2.5-flash-image.png)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/paneth-cell.watercolor.svg)
[interactive SVG](theme/watercolor/paneth-cell.watercolor.svg) · [HTML](theme/watercolor/paneth-cell.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `H&E light micrograph` · CC0 1.0 (public domain) · Mikael Häggström, M.D. — PASS — Wikimedia Commons "Histology of paneth cells, original.jpg" (CC0 1.0 public domain, Mikael Häggström, M.D.). Genuine H&E light photomicrograph of small-intestinal crypt sections: columnar epithelial cells with basally located, deeply basophilic (dark purple) nuclei lining elongated crypt profiles, pale foamy goblet-cell apical zones interspersed, and denser pink/red-tinged granular apical cytoplasm at the crypt bases consistent with Paneth-cell granules; already free of scale bars/captions/borders so no cleaning pass was needed, original crop used as-is for display.
  ![reference](theme/real/paneth-cell.attempts/real-01__H&E light micrograph.png)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | use as final; pyramidal shape, correct organelle set, diagnostic packed apical eosinophilic granule cluster dominant, matches exemplar palette/line style |
| sem | pass | 1 | use as final; false-colour fractured-surface rendering with bulging granule cluster and correct pyramidal silhouette, surface-only as required |
| 3d | pass | 1 | use as final; natural-tint cutaway, correct organelle set, granule cluster is the visually loudest structure as required |
| watercolor | pass | 1 | use as final; full-bleed aged paper, correct pyramidal anatomy, granule cluster reads as the most saturated/striking feature |
