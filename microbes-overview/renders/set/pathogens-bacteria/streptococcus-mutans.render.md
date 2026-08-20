# Streptococcus mutans (tooth decay) — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `streptococcus-mutans`
**Short description:** Chain-forming Gram-positive coccus of dental plaque that turns sucrose into a sticky glucan biofilm and lactic acid, dissolving tooth enamel.

Metadata sidecar: [`streptococcus-mutans.render.meta.json`](streptococcus-mutans.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Streptococcus mutans* is a Gram-positive, non-motile, non-sporing coccus of the human mouth, about **0.5–0.75 µm** across. The individual cells are **spherical to slightly oval (ovoid)** and divide in a single plane, so they stay attached end-to-end in **chains** — typically short chains of four to a dozen cells that bend and curve, not the grape-like clusters of staphylococci. Clarke, who first isolated it from carious lesions in 1924, named it *mutans* because in broth culture the cells often stretch into a short, almost **rod-like ("mutant") form**; on solid surfaces and in plaque they are plainly coccal. In a Gram film the chains are deep violet, beaded strings of dots.

The envelope is the standard Gram-positive one: a **plasma membrane** wrapped in a single **thick peptidoglycan cell wall** (no outer membrane, no LPS), threaded with **lipoteichoic acid** whose lipid tail is anchored in the membrane, and carrying a serotype-defining **rhamnose–glucose polysaccharide**. *S. mutans* does **not** build a thick antiphagocytic polysaccharide capsule like the pneumococcus. Its defining external structure is instead something the cell manufactures on the outside of its wall: an **extracellular glucan matrix**.

That matrix is what makes this organism the classic caries pathogen. Cell-wall-anchored **glucosyltransferases (GtfB, GtfC, GtfD)** split dietary **sucrose** into glucose and fructose and polymerise the glucose into long, water-insoluble α(1→3)- and α(1→6)-linked **glucans**. The glucans are extruded as a sticky, glue-like extracellular polysaccharide (EPS) scaffold that cements the chains to the tooth's salivary pellicle and to each other, producing the dense, diffusion-limited **dental plaque biofilm**. Attachment also works without sucrose, through the cell-wall adhesin **P1 (SpaP / antigen I/II)** binding salivary glycoproteins, and is reinforced by **glucan-binding proteins (GbpA–D)** that hook the cell back onto its own matrix. Free enzyme also adsorbs to enamel and to neighbouring species, so glucan gets laid down even where *S. mutans* itself is sparse.

Inside, the cell is an ordinary bacterium: cytoplasm, a **diffuse nucleoid** (not a tidy free ring), and small, numerous, randomly scattered **70S ribosomes**. Its metabolism is what matters: it is strongly **acidogenic** — fermenting sugars to **lactic acid** by homolactic glycolysis — and unusually **aciduric**, keeping its membrane proton-pumping ATPase working at pH values that shut its neighbours down. Under the glucan cap the acid cannot diffuse away; local pH falls below the critical ~5.5 and calcium and phosphate leach out of the enamel hydroxyapatite. Repeated sugar exposures tip that demineralisation past what saliva and fluoride can repair, and a cavity forms. Occasionally the same organism enters the bloodstream after dental procedures and seeds **subacute bacterial endocarditis**; strains carrying the collagen-binding protein Cnm are over-represented there.

**Colour note.** *S. mutans* makes no pigment; colonies are white to translucent, hard and adherent (the blue of the classic mitis-salivarius–bacitracin plate is a dye in the medium, not the cell). Any colour on our renders is therefore a **teaching convention**, per `reference/colors.md`. House legend for this microbe: cell wall = warm ochre/orange, plasma membrane = teal, cytoplasm = pale cream-translucent, nucleoid = blue-violet tangle, ribosomes = teal dots, glucan matrix = pale translucent honey-amber, Gtf enzymes = small muted rose knobs on the wall, adhesins = fine dusty-violet stubs.

Sources: [Lemos et al. 2019, *Microbiol Spectr* — The Biology of *Streptococcus mutans* (PMC6615571)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6615571/), [Bowen & Koo 2011, *Caries Res* — Biology of *S. mutans*-derived glucosyltransferases (PMC3068567)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3068567/), [Krzyściak et al. — Role of *S. mutans* surface proteins for biofilm formation (PMC5884221)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5884221/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `glucan_matrix` | glucanum extracellulare | Extracellular glucan matrix | Extrazelluläre Glucan-Matrix | sticky sucrose-derived EPS scaffold; glues the chain to enamel, traps acid | outside the wall, webbing the whole chain | core (in sucrose) |
| `glucosyltransferase` | glucosyltransferasis (Gtf) | Glucosyltransferase (Gtf) | Glucosyltransferase (Gtf) | GtfB/C/D split sucrose and polymerise glucans | anchored on the cell-wall surface | core |
| `adhesin_p1` | adhesinum P1 (antigenum I/II) | Adhesin P1 (antigen I/II) | Adhäsin P1 (Antigen I/II) | sucrose-independent binding to the salivary pellicle | short fibrils on the wall | core |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall | Zellwand | single thick Gram-positive peptidoglycan layer; shape and rigidity | outer boundary | core |
| `lipoteichoic_acid` | acidum lipoteichoicum | Lipoteichoic acid | Lipoteichonsäure | membrane-anchored polymer through the wall; adhesion, surface charge | spanning wall to membrane | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | transport; carries the F-ATPase that pumps out protons (acid tolerance) | innermost boundary | core |
| `division_septum` | septum divisionale | Division septum | Trennwand (Septum) | single-plane cross-wall — the reason cells stay in chains | between neighbouring cells | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | glycolysis to lactic acid happens here | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nucleoid | circular chromosome, diffuse | central | core |
| `ribosome` | ribosoma (70S) | Ribosome | Ribosom | protein synthesis | dispersed dots | core |

### Do NOT draw (scientifically misleading)
- **Flagella** — *S. mutans* is non-motile; no whips, no tails, ever.
- **Endospores** — streptococci do not sporulate.
- **An outer membrane / LPS** — Gram-positive: one thick peptidoglycan wall only, never a second membrane.
- **A thick smooth polysaccharide capsule** — that is the pneumococcus. Here the external coat is a *stringy, sticky glucan matrix* the cell secretes from sucrose; draw it as webbing/strands and blobs of gel between cells, not as a clean glassy halo hugging each cell.
- **Grape-like clusters** — clustering is *Staphylococcus*. *S. mutans* divides in one plane → chains.
- **Long straight rods** — despite the name, plaque cells are coccal/ovoid; at most slightly elongated, never bacillary.
- **A tidy circular DNA loop floating in the middle** — the nucleoid is an irregular, diffuse tangle.
- **Mesosome** — a fixation artefact, not a real organelle.
- **Pili / long fimbrial bundles** — *S. mutans* has short cell-wall-anchored adhesins, not the long pilus fibres of some other streptococci.
- **Teeth, enamel slabs, toothbrushes, cavities or any scene props in the four teaching styles** — those belong on the coloring page; the render shows the organism itself (a short chain with its matrix), single specimen group, clean background.
- **Baked-in text, scale bars, arrows** — labels are added later as SVG layers.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: a **Gram-stained light micrograph of *Streptococcus mutans* ATCC 25175 (×1000)** by Y tambe on Wikimedia Commons — crisp violet chains of cocci on a pale cream field.
- file: https://upload.wikimedia.org/wikipedia/commons/4/4d/Streptococcus_mutans_Gram.jpg
- page: https://commons.wikimedia.org/wiki/File:Streptococcus_mutans_Gram.jpg · License: **CC BY-SA 3.0** · Y tambe (own work)
AI visual verification result: **PASS (2026-08-20).** Viewed before download: the field shows numerous curving, beaded **chains of small violet-stained cocci** of uniform size on a cream background — exactly the single-plane-division chain morphology described in §1, with no rods, clusters or contaminating morphotypes. The raw file carries a baked-in **10 µm scale bar**, so a cleaned version was produced with `edit_image.py` (scale bar removed, one chain brought forward and centred, Gram-violet colorization kept) and is used for display — see §5.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Streptococcus mutans, the sweet tooth of the microbe world! It lives on your teeth, holding hands with its friends in long wobbly chains. Its favourite food is sugar - and whenever you eat something sweet, it spins the sugar into a sticky glue and builds a slimy fort called plaque right on your tooth. Safe inside its fort, it burps out acid, and that acid nibbles tiny holes into the hard white enamel until a cavity appears. Luckily this one is easy to beat, and you do it yourself: brush twice a day so the fort gets scrubbed away, slide floss between your teeth where the brush cannot reach, use a fluoride toothpaste that makes your enamel tough as armour, and keep the sugary snacks to mealtimes so the chain gang never gets a feast.  
🇩🇪 Das ist Streptococcus mutans, die Naschkatze unter den Mikroben! Er wohnt auf deinen Zähnen und hält sich mit seinen Freunden an den Händen - als lange, wackelige Kette. Am liebsten frisst er Zucker: Immer wenn du etwas Süßes isst, spinnt er daraus einen klebrigen Kleber und baut sich damit eine schleimige Burg auf dem Zahn, den Zahnbelag. Sicher in seiner Burg rülpst er Säure aus, und die knabbert winzige Löcher in den harten weißen Zahnschmelz, bis ein Loch im Zahn entsteht. Zum Glück kannst du ihn ganz leicht besiegen, und zwar selbst: zweimal am Tag putzen, damit die Burg weggeschrubbt wird, mit Zahnseide zwischen die Zähne fahren, wo die Bürste nicht hinkommt, eine Zahnpasta mit Fluorid benutzen, die den Zahnschmelz panzerhart macht, und Süßigkeiten nur zu den Mahlzeiten essen, damit die Kettenbande nie ein Festmahl bekommt.

**Adults (popular science, health).**  
🇬🇧 Streptococcus mutans is a small Gram-positive coccus that grows in chains and is one of the best-studied residents of dental plaque. What makes it special is a set of enzymes called glucosyltransferases: they grab dietary sucrose, split it, and weave the glucose into long sticky glucan chains. That glue cements the bacteria onto the tooth's protein film and to one another, building the dense biofilm we scrape off every morning. Under that cap, the bacteria ferment sugar into lactic acid, and because the biofilm slows diffusion the acid stays put and pulls calcium and phosphate out of the enamel. S. mutans also tolerates acid far better than most of its neighbours, so a mouth bathed in sugar gradually selects for it. Nothing here needs an antibiotic: mechanical removal of the biofilm by brushing and flossing, fluoride to make enamel more resistant and to help it remineralise, and limiting how often sugar arrives are what keep it in check. Rarely, after dental work, the same species enters the bloodstream and can settle on a damaged heart valve.  
🇩🇪 Streptococcus mutans ist ein kleiner grampositiver Kokkus, der in Ketten wächst und zu den bestuntersuchten Bewohnern des Zahnbelags gehört. Das Besondere sind seine Glucosyltransferasen: Diese Enzyme greifen sich den Haushaltszucker aus der Nahrung, spalten ihn und verweben den Glucose-Anteil zu langen, klebrigen Glucan-Ketten. Dieser Kleber zementiert die Bakterien auf dem Eiweißfilm des Zahns und aneinander fest und baut so den dichten Biofilm, den wir jeden Morgen wegputzen. Unter dieser Decke vergären die Bakterien Zucker zu Milchsäure, und weil der Biofilm den Austausch bremst, bleibt die Säure liegen und löst Calcium und Phosphat aus dem Zahnschmelz heraus. S. mutans verträgt Säure zudem deutlich besser als die meisten Nachbarn, sodass ein dauernd zuckriger Mund ihn nach und nach begünstigt. Antibiotika braucht es dafür nicht: Der Biofilm wird mechanisch entfernt - Zähneputzen und Zahnseide -, Fluorid macht den Schmelz widerstandsfähiger und unterstützt die Remineralisation, und entscheidend ist, wie oft Zucker nachkommt. Selten gelangt dieselbe Art nach zahnärztlichen Eingriffen ins Blut und kann sich dort auf einer vorgeschädigten Herzklappe festsetzen.

**Scientific.**  
🇬🇧 Streptococcus mutans is a non-motile, non-sporulating, facultatively anaerobic Gram-positive coccus, 0.5-0.75 µm in diameter, that divides in a single plane and therefore grows in chains; its envelope comprises a plasma membrane, a single thick peptidoglycan layer threaded with lipoteichoic acid, and a serotype-defining rhamnose-glucose polysaccharide, but no antiphagocytic capsule. Its cariogenicity rests on three linked traits: sucrose-dependent adherence, in which cell-wall-anchored glucosyltransferases GtfB, GtfC and GtfD polymerise the glucosyl moiety of sucrose into water-insoluble alpha(1-3)- and alpha(1-6)-linked glucans that form the extracellular polysaccharide matrix of dental plaque and are re-bound by glucan-binding proteins GbpA-D; sucrose-independent adherence to the acquired salivary pellicle via the antigen I/II adhesin P1 (SpaP); and a homolactic, strongly acidogenic metabolism coupled to marked aciduricity, sustained largely by an acid-tolerant F1Fo-ATPase that maintains delta-pH across the membrane. Within the diffusion-limited biofilm the resulting drop below the critical pH of about 5.5 drives net demineralisation of enamel hydroxyapatite. Control is ecological and mechanical rather than antimicrobial - biofilm disruption, fluoride-assisted remineralisation and reduced frequency of fermentable carbohydrate - while Cnm-positive strains are additionally associated with infective endocarditis after bacteraemia.  
🇩🇪 Streptococcus mutans ist ein unbeweglicher, nicht sporenbildender, fakultativ anaerober grampositiver Kokkus von 0,5-0,75 µm Durchmesser, der sich in nur einer Ebene teilt und deshalb in Ketten wächst; seine Hülle besteht aus Zytoplasmamembran, einer einzelnen dicken Peptidoglycanschicht mit eingelagerter Lipoteichonsäure und einem serotypbestimmenden Rhamnose-Glucose-Polysaccharid, jedoch ohne antiphagozytäre Kapsel. Seine Kariogenität beruht auf drei verknüpften Eigenschaften: der saccharoseabhängigen Adhärenz, bei der die zellwandverankerten Glucosyltransferasen GtfB, GtfC und GtfD den Glucoseanteil der Saccharose zu wasserunlöslichen alpha(1-3)- und alpha(1-6)-verknüpften Glucanen polymerisieren, die die extrazelluläre Polysaccharidmatrix des Zahnbelags bilden und über die Glucan-bindenden Proteine GbpA-D wieder gebunden werden; der saccharoseunabhängigen Anheftung an die erworbene Speichelpellikel über das Antigen-I/II-Adhäsin P1 (SpaP); sowie einem homolaktischen, stark acidogenen Stoffwechsel in Verbindung mit ausgeprägter Aciduritität, die vor allem durch eine säuretolerante F1Fo-ATPase zur Aufrechterhaltung des Protonengradienten getragen wird. Im diffusionsbegrenzten Biofilm führt der Abfall unter den kritischen pH-Wert von etwa 5,5 zur Netto-Demineralisation des Schmelz-Hydroxylapatits. Die Kontrolle erfolgt ökologisch und mechanisch statt antimikrobiell - Biofilmentfernung, fluoridgestützte Remineralisation und seltenere Zufuhr fermentierbarer Kohlenhydrate -, während Cnm-positive Stämme zusätzlich mit infektiöser Endokarditis nach Bakteriämie in Verbindung gebracht werden.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of Streptococcus mutans, a SINGLE gently curving chain of about six round-to-slightly-oval Gram-positive cocci joined end to end (single-plane division, so a beaded string, never a grape-like cluster), running diagonally across a square 1:1 1080x1080 frame, centered, with lots of empty negative space around the chain for later labels. Semi-flat vector-style shading, thin clean outlines (never heavy black cartoon strokes), gentle soft shading, and a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (never bright primary or cartoon colours), on a neutral dark-charcoal uncluttered background. Around and between the cells, draw the sticky EXTRACELLULAR GLUCAN MATRIX as translucent pale honey-amber strands, threads and soft gel blobs that web the chain together and trail off - stringy and sticky, NOT a smooth glassy capsule hugging each cell. Small muted rose knob-shaped glucosyltransferase enzymes sit anchored on the cell-wall surface where the glucan strands emerge, and a few fine dusty-violet adhesin stubs dot the wall. A neat quarter cut-away on the front-most cell reveals: a thick single-layer warm-ochre Gram-positive peptidoglycan cell wall with fine lipoteichoic-acid threads running through it down into the membrane, an inner teal plasma membrane, pale cream translucent cytoplasm, a diffuse blue-violet nucleoid drawn as a soft irregular tangle (NOT a tidy free-floating DNA ring), and tiny numerous randomly dispersed teal ribosome dots. Flat division septa are visible where neighbouring cells meet. Do NOT draw flagella, an outer membrane, endospores, a thick smooth polysaccharide capsule, long pili, a mesosome, teeth or any scene props. Anatomically faithful, one chain only. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks in the image. Fill the whole square edge-to-edge: no border, frame, vignette or letterbox bars.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of Streptococcus mutans: a SINGLE short curving chain of about six plump, round-to-slightly-oval cocci joined end to end, centered in a square 1:1 1080x1080 frame with generous empty margin. Each coccus has a finely granular, faintly wrinkled surface texture and is gently flattened where it meets its neighbour, with a shallow groove at each division septum. Fine sticky strands and thin sheets of extracellular glucan matrix stretch between the cells and tether the chain to the substrate like dried glue threads. Render true 3D surface texture, shallow depth of field so the far end of the chain falls softly out of focus, cool studio microscopy lighting, and a subtly textured neutral substrate beneath. False-color palette: soft mint-teal cocci against a warm amber-bronze substrate. SEM shows surface only, so render NO internal structures and no cutaway. Do NOT render flagella, pili, endospores or a smooth capsule. A single chain only, no dense clumps. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere. Fill the whole square edge-to-edge: no border, frame, vignette or letterbox bars.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of Streptococcus mutans: a SINGLE gently curving chain of about six round-to-slightly-oval Gram-positive cocci joined end to end, arranged diagonally and centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, subsurface scattering in the membranes, gentle rim light, clean seamless dark studio background. Colorize with natural, believable biological tones so every structure reads clearly: warm ochre-orange peptidoglycan cell wall, teal plasma membrane just beneath it, pale cream translucent cytoplasm, a diffuse blue-violet nucleoid as an irregular tangle (NOT a tidy DNA ring), and tiny numerous scattered teal ribosome dots, revealed through a partial cut-away and gentle translucency on the front cell. Around and between the cells, translucent pale honey-amber extracellular glucan matrix stretches as sticky strands, threads and soft gel blobs that web the chain together - stringy glue, NOT a smooth glassy capsule around each cell. Small rose-tinted glucosyltransferase enzyme knobs stud the wall surface where the glucan strands originate, plus a few short fine adhesin stubs. Flat division septa are visible between neighbouring cells, and fine lipoteichoic-acid threads run through the wall. Do NOT render flagella, an outer membrane, endospores, a thick capsule, long pili, a mesosome or any scene props such as teeth. Anatomically faithful, one chain only. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks. Fill the whole square edge-to-edge: no border, frame, vignette or letterbox bars.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of Streptococcus mutans in the style of a 19th-century atlas but anatomically modern and correct. EXTREMELY IMPORTANT FRAMING RULE: the image IS a close-up of the painted paper itself. The warm aged cream paper texture must fill the ENTIRE square edge-to-edge and corner-to-corner, bleeding off all four edges. Do NOT depict a sheet of paper, a card, a page, a torn-edged leaf or a plate lying on a table or any surface; there must be NO paper edges, NO torn or deckled borders, NO drop shadow, NO white or grey surround, NO mat, frame, border or vignette anywhere. Zoom in so the painting is cropped by the frame. Subject: a SINGLE gently curving chain of about six round-to-slightly-oval Gram-positive cocci joined end to end, large, centred and running diagonally across the square with generous margin. Soft translucent watercolour washes with fine ink linework. A soft darker wash halo sits directly on the paper behind the chain. Muted dusty tints: warm ochre cell walls, a teal membrane line, pale cream cytoplasm, a diffuse blue-violet nucleoid tangle (NOT a tidy DNA loop), tiny dispersed ribosome specks. Loose translucent honey-amber washes and fine ink threads show the sticky extracellular glucan matrix webbing the cells together and trailing off the chain - stringy and sticky, not a smooth glassy capsule. Only the front-most cell is opened by a soft painterly quarter cut-away showing the thick single cell wall with fine lipoteichoic-acid threads, the membrane, cytoplasm, nucleoid and ribosomes; the other cells stay closed and solid. Faint septum lines mark where the cells divided; small stippled enzyme knobs and short adhesin stubs dot the walls. Do NOT paint flagella, an outer membrane, endospores, a capsule, long pili, a mesosome, teeth or any scene props. One chain only, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 2497 tok, $0.050
- attempt 1 · `gemini-3-pro-image` · 21.4s — pass (gemini-3-pro-image; muted educational palette with thin clean outlines on dark charcoal, correct chain of ovoid cocci joined end to end, sticky glucan strands webbing the chain instead of a smooth capsule, quarter cut-away showing wall / membrane / cytoplasm / diffuse nucleoid / scattered ribosomes, Gtf knobs and adhesin stubs on the wall, no flagella, no text, no border)
  ![textbook 1](theme/textbook/streptococcus-mutans.attempts/gen-01__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/streptococcus-mutans.textbook.svg)
[interactive SVG](theme/textbook/streptococcus-mutans.textbook.svg) · [HTML](theme/textbook/streptococcus-mutans.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1885 tok, $0.042
- attempt 1 · `gemini-3-pro-image` · 18.9s — pass (gemini-3-pro-image; false-colour surface-only micrograph of a single short chain, granular surface texture with septal grooves, glucan glue strands tethering the chain to the substrate, mint-teal on amber, no internal structures, no text, no border)
  ![sem 1](theme/sem/streptococcus-mutans.attempts/gen-01__gemini-3-pro-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 2175 tok, $0.046
- attempt 1 · `gemini-3-pro-image` · 19.0s — pass (gemini-3-pro-image; natural biological tints - ochre wall, teal membrane, cream cytoplasm, blue-violet nucleoid tangle, teal ribosomes - single chain with honey-amber glucan webbing and Gtf knobs, clean dark studio background, no flagella, no text, no border)
  ![3d 1](theme/3d/streptococcus-mutans.attempts/gen-01__gemini-3-pro-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/streptococcus-mutans.3d.svg)
[interactive SVG](theme/3d/streptococcus-mutans.3d.svg) · [HTML](theme/3d/streptococcus-mutans.3d.html)

### Watercolor plate (`watercolor`) — 5 attempt(s), 11657 tok, $0.236
- attempt 1 · `gemini-3-pro-image` · 22.3s — fail (gemini-3-pro-image; painted as a separate torn-edged sheet of paper lying on a white surface with a drop shadow - the aged paper must fill the frame edge to edge; also every cell drawn opened instead of one cut-away)
  ![watercolor 1](theme/watercolor/streptococcus-mutans.attempts/gen-01__gemini-3-pro-image.avif)
- attempt 2 · `gemini-3-pro-image` · 20.8s — fail (gemini-3-pro-image; full-bleed paper fixed and composition good, but several long wavy ink filaments radiate from the front cell and read as flagella, which this non-motile bacterium does not have)
  ![watercolor 2](theme/watercolor/streptococcus-mutans.attempts/gen-02__gemini-3-pro-image.avif)
- attempt 3 · `gemini-3-pro-image` · 22.7s — fail (gemini-3-pro-image; subject cropped by all four edges with no margin left for labels, two cells opened, hair-like filaments still present)
  ![watercolor 3](theme/watercolor/streptococcus-mutans.attempts/gen-03__gemini-3-pro-image.avif)
- attempt 4 · `gemini-3-pro-image` · 19.9s — fail (gemini-3-pro-image; margins fixed, but every cell in the chain is drawn transparent with its own nucleoid, so the plate reads as a row of coins rather than a chain with one cut-away)
  ![watercolor 4](theme/watercolor/streptococcus-mutans.attempts/gen-04__gemini-3-pro-image.avif)
- attempt 5 · `gemini-3-pro-image` · 22.0s — pass (gemini-3-pro-image; warm aged paper fills the frame edge to edge with a soft wash halo, one chain of six cocci, exactly one front cell cut away, the others opaque, honey-amber glucan strands webbing the chain, no flagella, no text, no sheet/frame)
  ![watercolor 5](theme/watercolor/streptococcus-mutans.attempts/gen-05__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/streptococcus-mutans.watercolor.svg)
[interactive SVG](theme/watercolor/streptococcus-mutans.watercolor.svg) · [HTML](theme/watercolor/streptococcus-mutans.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · CC BY-SA 3.0 · Y tambe, Wikimedia Commons (S. mutans ATCC 25175, Gram stain x1000) — pass (Gram-stained light micrograph of S. mutans ATCC 25175 by Y tambe, CC BY-SA 3.0; the raw field shows the characteristic curving chains of small violet cocci - a cleaned, scale-bar-free version with one chain brought forward is used for display)
  ![reference](../reference-microscopy/theme/lm/streptococcus-mutans.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | use as final and as the primary labelled figure; all ten reference structures are separable enough for leader lines |
| sem | pass | 1 | use as final; correct surface-only false-colour view of a chain with its glucan glue |
| 3d | pass | 1 | use as final; labelled figure built - natural tints, clear envelope layering |
| watercolor | pass | 5 | use as final after four re-renders: attempt 1 was a sheet-on-a-surface, 2 and 3 added flagella-like ink filaments, 4 opened every cell; attempt 5 satisfies the full-bleed paper rule and the single-cut-away composition |
