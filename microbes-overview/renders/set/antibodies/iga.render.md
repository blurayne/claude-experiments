# Immunoglobulin A (IgA) — render log

**Set:** `antibodies` · **Microbe key:** `iga`
**Short description:** Secretory IgA — two Y-shaped IgA monomers joined tail-to-tail at their Fc stems by a J-chain, wrapped in a protective secretory component picked up while crossing the mucosal epithelium; the guardian antibody of saliva, tears, gut and breast milk.

Metadata sidecar: [`iga.render.meta.json`](iga.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

IgA is not a cell or an organism — it is a Y-shaped glycoprotein made by plasma cells (differentiated B cells). Every antibody is built from **heavy chains** and **light chains** linked by disulfide bonds: two identical heavy chains form the backbone, and two identical light chains each pair with one heavy chain. Each chain has a **variable domain** at its tip (the part that differs between antibodies and does the actual antigen recognition) and one or more **constant domains** that form the rest of the structure. The two arms that end in variable domains are the **Fab regions** ("fragment, antigen-binding") — each Fab tip is one antigen-binding site. The stalk where the two heavy chains join is the **Fc region** ("fragment, crystallizable") — it does not bind antigen; it is the "business end" recognized by immune-cell receptors and, in secretory IgA, by the secretory component.

Human IgA comes in two forms. **Serum IgA** (mostly in blood) is a simple monomer — one Y, like a small IgG — and is not the form drawn here. **Secretory IgA (sIgA)**, the form on mucosal surfaces (saliva, tears, breast milk, gut and airway lining) and the one to draw, is built from **two complete IgA monomers joined tail-to-tail at their Fc stems**, giving **4 Fab arms in total** (2 arms per monomer × 2 monomers) radiating outward, with the two Fc stems bound together in the middle. The two monomers are held together by a small connector polypeptide, the **J-chain (joining chain)**, threaded between the two Fc stems roughly where they meet; short heavy-chain tailpiece extensions from all four heavy chains and the J-chain interlock into a small β-sheet-like patch that locks the dimer together. Wrapped around/draped over this joined Fc-J-chain core is the **secretory component (SC)** — a much larger, elongated multi-domain protein (the cleaved ectodomain of the polymeric immunoglobulin receptor, pIgR) that the dimeric IgA picks up while being ferried across the mucosal epithelial cell by transcytosis; SC stays bound after release into the mucus and both protects sIgA from digestive/bacterial proteases and helps it anchor in the mucus layer. Recent cryo-EM structures (2020, PDB 6UE7 and related) confirmed this asymmetric "two Y's joined by a J-chain hinge with an SC wrap on one face" architecture, and also revealed that IgA can polymerize further into IgA tetramers/pentamers using the same J-chain templating principle (rarer; the dimer is the standard teaching form).

Because it needs to survive in mucus and digestive secretions without triggering inflammation, secretory IgA neutralizes pathogens mainly by **immune exclusion**: agglutinating microbes and trapping them in mucus so they're swept away, rather than activating complement or recruiting inflammatory cells the way IgG or IgM do.

### Parts to label (Latin / scientific term · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `heavy_chain` | catena gravis (immunoglobulin heavy chain) | Heavy chain | Schwere Kette | larger of the two paired polypeptides; forms the backbone of each Y arm and stem | 2 per IgA monomer, 4 per dimer | constant part of each monomer |
| `light_chain` | catena levis (immunoglobulin light chain) | Light chain | Leichte Kette | smaller polypeptide paired with each heavy chain; contributes to each Fab's antigen site | 2 per monomer, 4 per dimer, at the arm tips | constant part of each monomer |
| `fab_arm` | Fragmentum antigen-ligans (Fab) | Fab arm (antigen-binding fragment) | Fab-Arm (antigenbindendes Fragment) | the tip of each arm; binds one specific antigen via its variable domains | 4 total, radiating outward from the joined core | the actual binding site sequence is unique per antibody clone |
| `fc_region` | Fragmentum crystallizabile (Fc) | Fc region | Fc-Region | the paired heavy-chain stem of each monomer; recognized by immune-cell receptors; here the two Fc stems join tail-to-tail | 2 stems, fused in the centre | constant per isotype |
| `j_chain` | catena iungens (J-chain) | J-chain (joining chain) | J-Kette | small polypeptide that clips the two Fc stems together and templates the dimer | threaded between the two Fc stems, centre of the molecule | present in all secretory/polymeric Ig, absent in monomeric serum IgA |
| `secretory_component` | componens secretorium (ectodomain of pIgR) | Secretory component | Sekretkomponente | large multi-domain protein wrap picked up crossing the mucosal epithelium; shields sIgA from enzymatic digestion and helps it stick in mucus | drapes over/around the joined Fc-J-chain core, on one face | present only in secretory IgA (and secretory IgM), not in serum IgA |

### Do NOT draw (scientifically misleading)
- **No cell membrane enclosing the whole thing** — this is a free protein complex, not a cell; nothing should look like it has an outer plasma membrane sealing it in.
- **No nucleus, mitochondria, ribosomes, ER, Golgi or any organelles** — it is a protein, not a cell.
- **No amorphous blob/cloud shape** — the topology must be exact and recognizable: two complete Y-shaped monomers joined tail-to-tail, 4 Fab arms total, with a small J-chain connector between the stems and one larger secretory-component wrap over the joined core. Do not merge the two Y's into a single Y, and do not draw fewer or more than 4 arm tips.
- **No anthropomorphic face, eyes or expression** anywhere on the molecule.
- **Do not draw it as a pentamer/star** (that is IgM) **or as a single plain Y with no J-chain/secretory component** (that is serum IgA or IgG) — the secretory dimer form specifically must be shown.
- **No baked-in disulfide-bond diagrams, chemical formulas, or amino-acid sequence text.**
- **No membrane anchor patch** (that only applies to IgD/IgM as B-cell receptors) — free secretory IgA is not membrane-bound.

Sources: [NCBI Bookshelf — *Janeway's Immunobiology*, "The structure of a typical antibody molecule"](https://www.ncbi.nlm.nih.gov/books/NBK27144/), [NCBI Bookshelf — *Molecular Biology of the Cell*, Ch. 24, immunoglobulin structure](https://www.ncbi.nlm.nih.gov/books/NBK26884/), [Wikipedia — Immunoglobulin A](https://en.wikipedia.org/wiki/Immunoglobulin_A), [Wikipedia — Secretory component](https://en.wikipedia.org/wiki/Secretory_component), [Kumar, Wang, et al. *Structure of the secretory immunoglobulin A core*, Science 367(6481), 2020 (PDB 6UE7)](https://www.science.org/doi/10.1126/science.aaz5807), [Wang et al., *Structural insights into secretory immunoglobulin A and its interaction with a pneumococcal adhesin*, Cell Research 2020 (PDB 6LX3)](https://www.nature.com/articles/s41422-020-0336-3), [RCSB PDB-101 Molecule of the Month #272 — Secretory Antibodies](https://pdb101.rcsb.org/motm/272).

---

## 2. Real microscopy reference (own set `reference-microscopy`)

Antibodies (~150 kDa monomer, secretory IgA dimer ~385 kDa incl. J-chain + SC) are far too small to resolve by light microscopy; the genuine structural evidence comes from X-ray crystallography and cryo-EM. Chosen: the **RCSB PDB-101 "Molecule of the Month" #272 illustration "Secretory Antibodies"** (article by Lauryn Brooks, Carolina Colón-Colón, Aayushi Patel and Asya Polat), a molecular-surface rendering that combines the 2020 cryo-EM core structure of dimeric secretory IgA (**PDB 6UE7**, Kumar et al., *Science*) with a low-resolution Fab structure (**PDB 3CHN**) — i.e. it is built directly from real deposited atomic-resolution/cryo-EM coordinates, not an artist's free invention. It clearly shows the real topology this render must match: **4 coral-colored Fab blobs** radiating from a central **orange Fc surface** formed by two joined stems, a **magenta J-chain** threaded at the join, and a **purple secretory-component wrap** draped over one face (plus a small yellow β-sheet patch where the heavy-chain tailpieces and J-chain interlock).

- file (original, with the source's own labels): `theme/structure/iga.attempts/real-01__structure.png` — downloaded from `https://cdn.rcsb.org/pdb101/motm/272/3chn_6ue7.jpg`
- page: https://pdb101.rcsb.org/motm/272 · **License: CC BY 4.0** · Attribution: Lauryn Brooks, Carolina Colón-Colón, Aayushi Patel, Asya Polat / RCSB PDB-101 Molecule of the Month #272 ("Secretory Antibodies"), based on PDB 6UE7 (Kumar et al., *Science* 2020) + PDB 3CHN.
- cleaned display version (text/labels removed, recomposed centered on plain background, structure/colours/positions unchanged): `theme/structure/iga.attempts/real-02__edit-gemini-2.5-flash-image.png`

AI visual verification result: **✅ PASS** — the cleaned image shows exactly the topology described in §1: two Y-shaped monomers joined tail-to-tail (orange Fc surfaces fused in the centre), 4 Fab arms total (coral blobs at the tips), a J-chain at the join (magenta) and a secretory-component wrap over one face (purple), with the small β-sheet interlock (yellow) visible between them. No baked-in text remains after cleaning; single specimen, centered, clean background.

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet IgA, the coast guard of your body's mucus coastlines! Your body doesn't just build one plain Y — for the wet, busy borders like your mouth, nose, gut and tears, it welds TWO Y-shaped helpers together tail-to-tail with a tiny clip called the J-chain, so IgA ends up with four sticky grabbing hands instead of two. Then it wraps the join in a tough little raincoat (the secretory component) so digestive juices and germ enzymes can't chew it apart. IgA patrols your saliva, your tears, the lining of your gut, and even your mom's breast milk, grabbing onto germs and clumping them together so they get swept away in mucus before they can dig in — no alarm bells needed, just a quiet, constant coastal patrol.  
🇩🇪 Das ist IgA, die Küstenwache der schleimigen Grenzen deines Körpers! Dein Körper baut hier nicht nur ein einzelnes Y — für die feuchten, viel besuchten Grenzposten wie Mund, Nase, Darm und Augen verschweißt er ZWEI Y-förmige Helfer Schwanz an Schwanz mit einer winzigen Klammer, der J-Kette, sodass IgA am Ende vier klebrige Greifhände statt zwei hat. Dann wickelt er die Verbindungsstelle noch in einen robusten kleinen Regenmantel (die Sekretkomponente), damit Verdauungssäfte und Keim-Enzyme sie nicht zerlegen können. IgA patrouilliert in deinem Speichel, deinen Tränen, der Darmschleimhaut und sogar in der Muttermilch, schnappt sich Keime und verklumpt sie, damit sie mit dem Schleim weggespült werden, bevor sie sich festsetzen können — ganz ohne Alarmglocken, einfach eine ruhige, ständige Küstenpatrouille.

**Adults (popular science, health).**  
🇬🇧 IgA is the antibody your body stations along its wet, high-traffic borders rather than in the bloodstream. Where IgG is built to fight inside tissue and blood, secretory IgA is engineered for a rougher neighbourhood: two IgA units are fused tail-to-tail by a small J-chain into a four-armed dimer, and a large secretory-component protein is bolted onto the join as the antibody is ferried out through the gut, airway or salivary lining — that wrap is what lets IgA survive being bathed in digestive enzymes and bacterial proteases that would shred an ordinary antibody. Rather than triggering inflammation, IgA mostly works by "immune exclusion": clumping bacteria and viruses together in mucus so they're carried away or blocked from ever reaching the cells underneath. It's the dominant antibody in saliva, tears, gut lining and breast milk, which is also how a nursing mother passes some of her own mucosal immunity on to her baby.  
🇩🇪 IgA ist der Antikörper, den der Körper vor allem an seinen feuchten, stark frequentierten Grenzflächen postiert statt im Blut. Während IgG darauf ausgelegt ist, in Gewebe und Blut zu kämpfen, ist sekretorisches IgA für eine raueres Umfeld gebaut: Zwei IgA-Einheiten werden über eine kleine J-Kette Schwanz an Schwanz zu einem vierarmigen Dimer verschmolzen, und beim Transport durch die Darm-, Atemwegs- oder Speicheldrüsenschleimhaut wird an der Verbindungsstelle noch ein großes Sekretkomponenten-Protein angebracht — dieser Schutzmantel lässt IgA das Bad in Verdauungsenzymen und bakteriellen Proteasen überstehen, das einen gewöhnlichen Antikörper zerlegen würde. Statt Entzündungen auszulösen, wirkt IgA meist durch "Immunausschluss": Es verklumpt Bakterien und Viren im Schleim, sodass sie fortgespült werden oder gar nicht erst die darunterliegenden Zellen erreichen. Es ist der vorherrschende Antikörper in Speichel, Tränenflüssigkeit, Darmschleimhaut und Muttermilch — so gibt eine stillende Mutter auch einen Teil ihrer eigenen Schleimhautimmunität an ihr Baby weiter.

**Scientific.**  
🇬🇧 Secretory IgA (sIgA) is the dominant immunoglobulin of the mucosal immune system. Two IgA monomers (each two heavy + two light chains, four Fab arms folding to two per monomer) are covalently joined tail-to-tail at their Fc regions by a single J-chain, which templates dimerization and interlocks with the heavy-chain tailpieces in a small β-sheet motif, yielding a divalent-per-monomer, tetravalent dimer overall. During transcytosis across mucosal epithelial cells, the dimeric IgA-J-chain complex binds the polymeric immunoglobulin receptor (pIgR); on the luminal side the receptor's extracellular portion is proteolytically cleaved and remains covalently/non-covalently associated as the secretory component (SC), conferring resistance to proteolytic and microbial enzymatic degradation in mucosal secretions. Unlike IgG or IgM, sIgA does not efficiently activate complement via the classical pathway and instead functions largely through immune exclusion — agglutination and steric neutralization of pathogens and toxins at mucosal surfaces, and cross-linking of antigen within the mucus layer for clearance by mucociliary or peristaltic action. sIgA is present in saliva, tears, colostrum/breast milk, and intestinal and respiratory secretions, and maternal sIgA transferred via breastfeeding provides passive mucosal immunity to the neonate.  
🇩🇪 Sekretorisches IgA (sIgA) ist das dominierende Immunglobulin des mukosalen Immunsystems. Zwei IgA-Monomere (je zwei schwere und zwei leichte Ketten, vier Fab-Arme, zwei pro Monomer) werden über ihre Fc-Regionen kovalent Schwanz an Schwanz durch eine einzelne J-Kette verbunden, die die Dimerisierung templiert und mit den Tailpiece-Fortsätzen der schweren Ketten in einem kleinen β-Faltblatt-Motiv verzahnt, wodurch ein pro Monomer divalentes, insgesamt tetravalentes Dimer entsteht. Beim transzytotischen Transport durch mukosale Epithelzellen bindet der IgA-J-Ketten-Komplex den polymeren Immunglobulinrezeptor (pIgR); auf der luminalen Seite wird der extrazelluläre Rezeptoranteil proteolytisch abgespalten und bleibt als Sekretkomponente (SC) assoziiert, was Resistenz gegenüber proteolytischem und mikrobiellem Enzymabbau in mukosalen Sekreten verleiht. Anders als IgG oder IgM aktiviert sIgA den klassischen Komplementweg nur ineffizient und wirkt stattdessen überwiegend durch Immunausschluss — Agglutination und sterische Neutralisierung von Erregern und Toxinen an Schleimhautoberflächen sowie Vernetzung von Antigen im Schleim zur Beseitigung durch mukoziliäre oder peristaltische Bewegung. sIgA findet sich in Speichel, Tränenflüssigkeit, Kolostrum/Muttermilch sowie Darm- und Atemwegssekreten, und mütterliches sIgA, das über das Stillen übertragen wird, verleiht dem Neugeborenen passive mukosale Immunität.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway in the EXACT house style of the plates rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (NEVER bright primary or cartoon colours), THIN clean outlines (NOT heavy black cartoon strokes), gentle soft shading with subtle dimensionality, and a distinct soft colour fill for each structure. Refined and elegant, NOT a bold-outlined flat cartoon. Subject: secretory Immunoglobulin A (sIgA), a protein complex made of TWO complete Y-shaped antibody monomers joined tail-to-tail at their stems, so there are exactly FOUR Y-arm tips (Fab arms, antigen-binding) total radiating outward from a central joined trunk (Fc region) — each Y clearly built from paired heavy chains (larger, dusty amber) and light chains (smaller, soft cream, nestled against the arm tips). Where the two Fc stems meet in the centre, show a small connector shape, the J-chain, in a distinct dusty rose/magenta tint, and drape a larger, elongated multi-lobed wrap, the secretory component, in a distinct muted violet tint over one face of the joined stems. This is a free-floating protein complex, NOT a cell: no membrane capsule enclosing it, no nucleus, no organelles, no face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark charcoal uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

IMPORTANT CONTEXT: a real scanning electron microscope cannot resolve a single antibody molecule (SEM images whole cells/surfaces, not individual proteins). Render this instead as a STYLISED false-colour MOLECULAR-SURFACE rendering (in the visual language of a cryo-EM surface/density map, like the PDB structural-biology reference images) — NOT a literal SEM micrograph, and it should not be mistaken for one. Subject: secretory Immunoglobulin A (sIgA) rendered as a bumpy, granular protein-surface model (the characteristic lumpy Van-der-Waals surface look of molecular graphics), photorealistic false-colour shading, crisp studio lighting, shallow depth of field, floating on a subtly textured neutral substrate. Show the exact topology: two Y-shaped monomers joined tail-to-tail giving FOUR Fab-arm blobs total radiating outward in coral/salmon, the joined Fc trunk in amber/gold at the centre, a small magenta J-chain connector at the join, and a larger violet secretory-component wrap draped over one face. Surface texture only (this is a molecular surface render, not a cutaway) — no interior visible, no cell, no organelles, no face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of secretory Immunoglobulin A (sIgA), soft global illumination, subsurface scattering on the protein surfaces, clean seamless studio background, gentle rim light, scientific-animation look. Show the precise topology: TWO complete Y-shaped antibody monomers fused tail-to-tail at their stems, so FOUR Fab arms (antigen-binding tips, built from paired heavy and light chains) radiate outward from the joined centre; the joined Fc stems form the central trunk; a compact J-chain sits at the join between the two stems; a larger, elongated secretory-component protein wraps around/over one face of the joined trunk, clearly a separate, bigger structure than the J-chain. Natural, believable biological material tones so every structure is clearly distinguishable — warm coral/salmon Fab arms, amber/gold Fc trunk, magenta J-chain, violet secretory component — not neon, not monochrome. This is a floating protein assembly, NOT a cell: no membrane capsule, no organelles, no face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: secretory Immunoglobulin A (sIgA) — two complete Y-shaped antibody monomers painted joined tail-to-tail at their stems, so exactly FOUR Fab arm tips radiate outward in warm coral/salmon washes, meeting at a joined Fc trunk in amber/gold; a small rose/magenta J-chain connector sits at the join between the two stems; a larger violet secretory-component shape is painted wrapped over one face of the joined trunk. A free-floating protein structure, NOT a cell or creature: no membrane outline enclosing it, no organelles, no face. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3433 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 14.1s — fail (gemini-2.5-flash-image; each of the 4 arms forked into 2 sub-tips, giving 8 outer tips total - misleading topology, superseded)
  ![textbook 1](theme/textbook/iga.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 9.5s — pass (gemini-2.5-flash-image; exactly 4 Fab arms fused at a central Fc trunk with distinct J-chain and secretory-component wrap, matches rod-bacterium/parasite textbook palette and line style)
  ![textbook 2](theme/textbook/iga.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/iga.textbook.svg)
[interactive SVG](theme/textbook/iga.textbook.svg) · [HTML](theme/textbook/iga.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3358 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 6.9s — fail (gemini-2.5-flash-image; each of the 4 lobes forked into 2 sub-lobes, giving 8 outer tips total - misleading topology, superseded)
  ![sem 1](theme/sem/iga.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 9.5s — pass (gemini-2.5-flash-image; false-colour molecular-surface rendering with exactly 4 Fab lobes, central Fc/J-chain/secretory-component hub, correctly framed as stylised surface render not literal SEM)
  ![sem 2](theme/sem/iga.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3299 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 7.8s — fail (gemini-2.5-flash-image; rendered as an abstract alpha-helix/coiled-coil bundle with no recognizable Fab-arm/Fc-trunk topology, superseded)
  ![3d 1](theme/3d/iga.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.4s — pass (gemini-2.5-flash-image; smooth sculpted 4-arm topology with clear amber Fc hub, magenta J-chain, violet secretory-component wrap, natural biological tints)
  ![3d 2](theme/3d/iga.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/iga.3d.svg)
[interactive SVG](theme/3d/iga.3d.svg) · [HTML](theme/3d/iga.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1644 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 10.8s — pass (gemini-2.5-flash-image; exactly 4 Fab arms converging on a shared Fc/J-chain/secretory-component core, full-bleed aged paper matching cocci/rod-bacterium exemplar)
  ![watercolor 1](theme/watercolor/iga.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/iga.watercolor.svg)
[interactive SVG](theme/watercolor/iga.watercolor.svg) · [HTML](theme/watercolor/iga.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `structure` · CC BY 4.0 · Lauryn Brooks, Carolina Colón-Colón, Aayushi Patel, Asya Polat / RCSB PDB-101 Molecule of the Month #272 (Secretory Antibodies), based on PDB 6UE7 + 3CHN — pass (RCSB PDB-101 Molecule of the Month #272 illustration, CC BY 4.0, based on cryo-EM structure PDB 6UE7 + PDB 3CHN; cleaned version with baked-in labels removed shows the same 2-monomer/4-Fab/J-chain/secretory-component topology described in §1)
  ![reference](theme/structure/iga.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | use as final; correct 4-arm secretory-dimer topology after fixing the doubled-tip fail in attempt 1 |
| sem | pass | 2 | use as final; stylised false-colour molecular-surface rendering (explicitly not a literal SEM) with correct topology after fixing the doubled-lobe fail in attempt 1 |
| 3d | pass | 2 | use as final; correct topology after replacing the non-representational helix-bundle look of attempt 1 with sculpted Fab/Fc/J-chain/SC lobes |
| watercolor | pass | 1 | use as final; correct topology and full-bleed paper on first attempt |
