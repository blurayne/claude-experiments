# *Escherichia coli* — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `escherichia-coli`
**Short description:** Gram-negative enteric rod (~0.5 × 2 µm). Most strains are harmless gut commensals; some (e.g. EHEC/O157:H7) produce Shiga toxin and cause severe, sometimes bloody diarrhoea.

Metadata sidecar: [`escherichia-coli.render.meta.json`](escherichia-coli.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Escherichia coli* is a Gram-negative, facultatively anaerobic, non-spore-forming bacillus. A single cell is a straight cylinder with smoothly rounded poles, roughly 0.25–1 µm in diameter and 1–3 µm long (a typical cell is about 0.5 × 2 µm, so ~2–4× longer than wide) — usually seen as a lone rod or in short chains, never in dense grape-like clusters. The **Gram-negative envelope** has three concentric layers: an inner cytoplasmic (plasma) membrane, a thin peptidoglycan cell wall sitting in the periplasmic space, and an outer membrane studded with lipopolysaccharide (LPS, the O-antigen and endotoxin). Many strains bear a thin polysaccharide **capsule / glycocalyx** (K antigen). Motile strains swim with **peritrichous flagella** (H antigen) inserted all around the cell; the surface also carries numerous short **type-1 fimbriae** (adhesion to gut epithelium) and occasionally a single long **F (sex) pilus** for conjugation. Inside, the pale cytoplasm holds a single circular chromosome condensed into an irregular, diffuse **nucleoid** (~4.6 Mbp, no nuclear membrane), small circular **plasmids** (often carrying resistance or virulence genes), and tiny, numerous **70S ribosomes** dispersed as fine granules. Pathogenic lineages differ mainly by acquired virulence factors, not gross shape: EHEC/STEC (e.g. O157:H7) carry prophage-encoded **Shiga toxin (Stx1/Stx2)** and form attaching-and-effacing lesions; ETEC, EPEC, EIEC, EAEC and UPEC are other pathotypes. Spread is faecal–oral; in the healthy gut *E. coli* is held in check by secretory **IgA**, the **mucus layer**, and competition from the wider microbiota.

Sources: [NCBI *Medical Microbiology* 4th ed., ch. 25 *Escherichia*](https://www.ncbi.nlm.nih.gov/books/NBK7627/) · [CDC — *E. coli* (General Information)](https://www.cdc.gov/ecoli/general/index.html) · [NCBI Bookshelf — *Escherichia coli* (StatPearls)](https://www.ncbi.nlm.nih.gov/books/NBK564298/) · [Todar's Online Textbook of Bacteriology — *E. coli*](http://textbookofbacteriology.net/e.coli.html)

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `capsule` | capsula (glycocalyx, antigenum K) | Capsule | Kapsel | polysaccharide coat: adhesion, resists drying & immune attack | outermost | optional |
| `outer_membrane` | membrana externa (LPS) | Outer membrane | äußere Membran | LPS/endotoxin bilayer, extra Gram-negative barrier | outside wall | core (Gram-neg) |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall | Zellwand | thin peptidoglycan in periplasm: shape, resists turgor | between the membranes | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | transport, respiration/energy | innermost boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nucleoid | single circular chromosome; diffuse, no membrane | central, irregular | core |
| `plasmid` | plasmidum | Plasmid | Plasmid | accessory genes (resistance, virulence) | cytoplasm | optional |
| `ribosome` | ribosoma (70S) | Ribosome | Ribosom | protein synthesis | dispersed granules | core |
| `flagellum` | flagellum (peritrichum) | Flagellum | Geißel | rotary propeller for swimming (H antigen) | all around cell | variable |
| `fimbria` | fimbria (typus 1) | Fimbriae | Fimbrien | short bristles: adhesion to gut lining | surface, many, short | common |
| `pilus` | pilus sexualis (pilus F) | Sex pilus | Sexpilus/F-Pilus | DNA transfer (conjugation) | surface, one, long | optional |

### Do NOT draw (scientifically misleading)
- **Mesosome** — an EM fixation artifact, not a real organelle.
- **Endospore** — *E. coli* does **not** form spores; no spore inside the rod.
- Nucleoid as a tidy free-floating DNA ring — it is a **diffuse, condensed, irregular tangle**.
- A thick Gram-positive wall or a mixed Gram-pos/Gram-neg envelope — *E. coli* is **Gram-negative** (thin wall between two membranes).
- Over-large or orderly ribosomes — they are **tiny, numerous, random** granules.
- Any membrane-bound organelles (no nucleus, mitochondria, ER or Golgi).
- Dense grape-like clusters of cells — show a single rod (or at most a short chain).
- Capsule / flagella / F-pilus as universal — all **variable**; mark "if present".

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #9995** — colorized TEM of a **single** *Escherichia coli* O157:H7 rod displaying peritrichous **flagella**. Public domain (US CDC), single specimen, features clearly readable.
- file: https://upload.wikimedia.org/wikipedia/commons/e/eb/Escherichia_coli_flagella_TEM.png
- page: https://commons.wikimedia.org/wiki/File:Escherichia_coli_flagella_TEM.png · License: **Public Domain (CDC PHIL #9995)** · CDC / E. H. White; Peggy S. Hayes
- backups: [CDC PHIL #7138](https://commons.wikimedia.org/wiki/File:E_coli_at_10000x,_original.jpg) (USDA/ARS SEM, PD, but a cluster) · [NIAID *E. coli* SEM](https://www.flickr.com/photos/niaid/) (CC BY 2.0, cluster)

AI visual verification result: _see §5 after fetch/clean._
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Say hello to E. coli, a tiny sausage-shaped bacterium with wiggly tails for swimming! Billions of the friendly kind live in your gut right now, helping you digest dinner and even making vitamin K for you. But a few naughty relatives sneak in on undercooked burgers or unwashed veggies and give you a very sore, runny tummy. The best trick against them is simple: wash your hands and cook your food well, and most tummy troubles pass on their own with plenty of rest and water.  
🇩🇪 Sag Hallo zu E. coli, einem winzigen wurstförmigen Bakterium mit wackeligen Schwänzchen zum Schwimmen! Milliarden der freundlichen Sorte wohnen gerade jetzt in deinem Darm, helfen beim Verdauen und stellen sogar Vitamin K für dich her. Doch ein paar freche Verwandte schleichen sich auf halb durchgebratenen Burgern oder ungewaschenem Gemüse ein und machen dir einen ganz fiesen, flauschigen Bauch. Der beste Trick gegen sie ist einfach: Hände waschen und Essen gut durchgaren, dann geht der Bauchgrummel meist mit viel Ruhe und Trinken von allein wieder weg.

**Adults (popular science, health).**  
🇬🇧 Escherichia coli is the best-studied bacterium on Earth and a normal resident of the human large intestine, where harmless strains aid digestion, crowd out invaders and supply vitamin K. Trouble comes from a handful of pathogenic pathotypes: enterohaemorrhagic E. coli (EHEC, such as O157:H7) produces Shiga toxin and can cause bloody diarrhoea and, rarely, kidney-damaging haemolytic uraemic syndrome, while other strains cause travellers' diarrhoea or urinary-tract infections. Infection is faecal-oral, typically from undercooked meat, contaminated produce or water. Most gut infections are self-limiting and treated with fluids rather than antibiotics, which for EHEC can even worsen toxin release; thorough cooking, hand hygiene and safe water remain the mainstays of prevention.  
🇩🇪 Escherichia coli ist das am besten untersuchte Bakterium der Welt und ein normaler Bewohner des menschlichen Dickdarms, wo harmlose Stämme die Verdauung unterstützen, Eindringlinge verdrängen und Vitamin K liefern. Probleme bereiten nur wenige krankmachende Pathotypen: enterohämorrhagische E. coli (EHEC, etwa O157:H7) bilden Shiga-Toxin und können blutigen Durchfall und selten das nierenschädigende hämolytisch-urämische Syndrom auslösen, während andere Stämme Reisedurchfall oder Harnwegsinfekte verursachen. Die Ansteckung erfolgt fäkal-oral, meist über nicht durchgegartes Fleisch, verunreinigte Lebensmittel oder Wasser. Die meisten Darminfektionen heilen von selbst und werden mit Flüssigkeit statt Antibiotika behandelt, die bei EHEC die Toxinfreisetzung sogar verschlimmern können; gründliches Garen, Handhygiene und sauberes Wasser bleiben der wichtigste Schutz.

**Scientific.**  
🇬🇧 Escherichia coli is a Gram-negative, facultatively anaerobic, non-spore-forming bacillus (~0.5 x 2 um) of the family Enterobacteriaceae. Its envelope comprises an inner cytoplasmic membrane, a thin periplasmic peptidoglycan layer, and an outer membrane bearing lipopolysaccharide (O-antigen/endotoxin); motile strains are peritrichously flagellated (H-antigen) and bear type-1 fimbriae, with some carrying an F pilus for conjugation. The ~4.6 Mbp circular chromosome forms a membraneless nucleoid supplemented by plasmids that disseminate resistance and virulence genes via horizontal gene transfer. Pathotypes are defined by acquired factors rather than morphology: STEC/EHEC carry prophage-encoded Shiga toxins and a locus of enterocyte effacement, whereas ETEC, EPEC, EIEC, EAEC and UPEC deploy distinct adhesins and toxins. In the healthy gut, commensal E. coli is constrained by secretory IgA, the mucus barrier and colonisation resistance from the resident microbiota.  
🇩🇪 Escherichia coli ist ein gramnegatives, fakultativ anaerobes, nicht sporenbildendes Stäbchen (~0,5 x 2 um) aus der Familie der Enterobacteriaceae. Seine Hülle besteht aus einer inneren Zytoplasmamembran, einer dünnen periplasmatischen Peptidoglykanschicht und einer äußeren Membran mit Lipopolysaccharid (O-Antigen/Endotoxin); bewegliche Stämme sind peritrich begeißelt (H-Antigen) und tragen Typ-1-Fimbrien, manche zusätzlich einen F-Pilus zur Konjugation. Das etwa 4,6 Mbp große zirkuläre Chromosom bildet einen membranlosen Nukleoid, ergänzt durch Plasmide, die Resistenz- und Virulenzgene über horizontalen Gentransfer verbreiten. Pathotypen werden durch erworbene Faktoren und nicht durch die Morphologie definiert: STEC/EHEC tragen prophagenkodierte Shiga-Toxine und einen Locus of Enterocyte Effacement, während ETEC, EPEC, EIEC, EAEC und UPEC eigene Adhäsine und Toxine einsetzen. Im gesunden Darm wird kommensale E. coli durch sekretorisches IgA, die Schleimbarriere und die Kolonisationsresistenz der Mikrobiota in Schach gehalten.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE Escherichia coli cell, a Gram-negative enteric rod, centered in a square 1:1 1080x1080 frame with lots of negative space around the cell for later labels. MATCH THIS HOUSE STYLE EXACTLY: a muted, sophisticated, slightly desaturated educational palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading with subtle dimensionality, each structure its own distinct soft colour fill, on a neutral dark charcoal background that fills the whole square edge to edge. The rod is a straight cylinder with smoothly rounded poles, about 2 to 4 times longer than wide, lying at a gentle diagonal. A neat lengthwise quarter cut-away reveals the interior: pale blue-grey cytoplasm, a diffuse condensed nucleoid drawn as a soft irregular tangle of thread (NOT a tidy free-floating DNA ring), one or two small circular plasmids, and tiny numerous randomly dispersed ribosome dots (not oversized or orderly). The Gram-negative envelope shows three distinct concentric layers, each a different soft tint: an inner plasma membrane, a thin peptidoglycan cell wall, and an outer LPS membrane, with a faint pale slime capsule outside. Many fine short type-1 fimbriae dust the whole surface, a few long whip-like peritrichous flagella trail from the cell, and one longer single sex pilus. Do NOT draw a mesosome, an endospore, any membrane-bound organelles, or a thick Gram-positive wall. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE Escherichia coli cell, a Gram-negative enteric rod, centered in a square 1:1 1080x1080 frame with a generous empty margin, filling the frame edge to edge with NO border, frame or vignette. The rod is a clean cylinder with smoothly rounded poles, roughly 2 to 4 times longer than it is wide, lying at a gentle three-quarter angle. Render true 3D surface texture with fine wrinkles and turgid curvature, shallow depth of field so the poles fall softly out of focus, and a subtly textured neutral substrate beneath it. False-color palette: a warm amber-to-bronze cell against a dark uncluttered charcoal background. Show only real surface appendages: many fine hair-like type-1 fimbriae dusting the surface, several long whip-like peritrichous flagella trailing off, and one longer single pilus. SEM shows the surface only, so render NO internal structures. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE Escherichia coli cell, a Gram-negative enteric rod, centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, and a clean seamless dark studio background that fills the frame edge to edge. The rod is an idealized-for-clarity but believable cylinder with rounded poles, about 2 to 4 times longer than wide, its membranes rendered with subtle subsurface scattering and a faint translucent slime capsule. Use a partial cut-away or gentle translucency to reveal the interior: soft warm cytoplasm, a diffuse condensed nucleoid as an irregular tangle (NOT a tidy DNA ring), one or two small circular plasmids INSIDE the cell, and tiny numerous randomly scattered ribosome granules. Colorize with natural, believable biological tones so structures are distinguishable: a warm translucent cell body, distinct tints for the outer LPS membrane, the thin peptidoglycan wall and the inner plasma membrane, a cooler nucleoid, green plasmids and pale ribosomes. Fine type-1 fimbriae stipple the surface with several peritrichous flagella and one single pilus. Do NOT render a mesosome, an endospore, or any membrane-bound organelles, and keep all plasmids inside the cell. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE Escherichia coli cell, a Gram-negative enteric rod, in the style of a 19th-century atlas, centered in a square 1:1 1080x1080 frame, yet anatomically modern and correct. Soft translucent watercolour washes with fine ink outlines. THE WARM AGED PAPER MUST FILL THE ENTIRE FRAME EDGE-TO-EDGE AND CORNER-TO-CORNER as the background, with a soft darker wash halo directly on the paper behind the cell; do NOT render the artwork as a separate sheet or card lying on a surface, and NO mat, border, frame, drop-shadow or dark panel around a paper sheet. The rod has gently rounded poles and is about 2 to 4 times longer than wide, lying at a gentle diagonal. A soft painterly lengthwise cut-away hints at the interior: washed cytoplasm, a diffuse condensed nucleoid painted as a loose irregular tangle (NOT a tidy DNA loop), one or two small circular plasmids, and tiny numerous randomly dispersed ribosome specks. The Gram-negative envelope shows three distinct concentric layers: an inner plasma membrane, a thin peptidoglycan cell wall, and an outer LPS membrane, with a faint slime capsule. Delicate type-1 fimbriae fringe the whole surface, several peritrichous flagella trail off, and one longer single sex pilus. Do NOT paint a mesosome, an endospore, or any membrane-bound organelles. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3332 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 14.4s — —
  ![textbook 1](theme/textbook/escherichia-coli.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 15.8s — PASS (gemini-2.5-flash-image) — correct Gram-negative rod: capsule, outer membrane, cell wall, plasma membrane, cytoplasm, nucleoid, plasmid, ribosomes, flagella, fimbriae; refined muted palette matching rod-bacterium exemplar.
  ![textbook 2](theme/textbook/escherichia-coli.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/escherichia-coli.textbook.svg)
[interactive SVG](theme/textbook/escherichia-coli.textbook.svg) · [HTML](theme/textbook/escherichia-coli.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3106 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 14.0s — PASS — single rod, peritrichous flagella and fimbriae visible on the surface, false-colour, no border/text.
  ![sem 1](theme/sem/escherichia-coli.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 25.9s — —
  ![sem 2](theme/sem/escherichia-coli.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1588 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 20.4s — PASS — natural-tint cutaway with all core structures present; label leader lines are a little busy/crossing on the left cluster (nucleoid/plasmid/ribosome/cytoplasm) but each anchor lands correctly.
  ![3d 1](theme/3d/escherichia-coli.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/escherichia-coli.3d.svg)
[interactive SVG](theme/3d/escherichia-coli.3d.svg) · [HTML](theme/3d/escherichia-coli.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1629 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 22.7s — PASS — full-bleed aged paper matching cocci/rod-bacterium exemplar; all core structures correctly labelled.
  ![watercolor 1](theme/watercolor/escherichia-coli.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/escherichia-coli.watercolor.svg)
[interactive SVG](theme/watercolor/escherichia-coli.watercolor.svg) · [HTML](theme/watercolor/escherichia-coli.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public Domain (CDC PHIL #9995) · CDC / E. H. White; Peggy S. Hayes (PHIL #9995) — PASS — real E. coli micrograph, public domain/CC source per render.md §2.
  ![reference](../reference-microscopy/theme/tem/escherichia-coli.attempts/real-01__TEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | refined style, correct anatomy |
| sem | pass | 1 | surface flagella/fimbriae |
| 3d | pass | 1 | correct anatomy, busy leader lines |
| watercolor | pass | 1 | full-bleed, correct anatomy |
