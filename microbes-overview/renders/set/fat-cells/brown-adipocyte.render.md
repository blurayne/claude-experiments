# Brown adipocyte — render log

**Set:** `fat-cells` · **Microbe key:** `brown-adipocyte`
**Short description:** Body heater: a smaller, densely packed fat cell with many small lipid droplets (multilocular) and unusually many large mitochondria. Burns fat directly into heat via UCP1 rather than making ATP. Abundant in babies; in adults found mainly around the neck and collarbone; activated by cold.

Metadata sidecar: [`brown-adipocyte.render.meta.json`](brown-adipocyte.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The brown adipocyte (brown fat cell) is a specialised, highly vascularised and densely innervated animal cell whose job is non-shivering thermogenesis — burning fatty acids and glucose to produce heat rather than ATP. Compared with a white adipocyte it is smaller (roughly 15–60 µm, commonly cited ~25–40 µm vs. 50–150 µm for white fat) and morphologically very different: instead of one giant lipid droplet that squashes the nucleus flat against the rim, the brown adipocyte is **multilocular** — its cytoplasm holds **many small, round lipid droplets of varying size** scattered throughout the cell, giving the cytoplasm a foamy/frothy look in stained sections. The **nucleus stays round and roughly central** (not peripherally flattened as in white fat), reflecting the fact that no single droplet dominates the cell volume. Packed between and around the lipid droplets are **very numerous, unusually large mitochondria** with densely packed, well-developed cristae (often running the full width of the organelle) — it is this dense mitochondrial packing (rich in iron-containing cytochromes) plus the tissue's rich capillary network that gives brown fat its characteristic brown colour, in contrast to the pale, sparsely-vascularised, mitochondria-poor white fat. The defining molecular feature is **UCP1 (uncoupling protein 1, thermogenin)**, embedded in the **inner mitochondrial membrane**, which opens a proton leak across the inner membrane so that the proton-motive gradient built by the electron transport chain is dissipated as heat instead of driving ATP synthase — this is why brown fat "burns fat directly into heat." Brown adipocytes also carry modest rough ER and a Golgi apparatus (secretory/synthetic machinery, though far less prominent than in a professional secretory cell), a fine cortical cytoskeleton, and are surrounded in the tissue by a dense capillary bed and sympathetic (noradrenergic) nerve endings that trigger thermogenesis on cold exposure by releasing noradrenaline onto β3-adrenergic receptors on the cell surface. Developmentally, brown (and beige) adipocytes share a myogenic (Myf5+) precursor lineage distinct from most white adipocytes. Brown fat is abundant relative to body mass in human infants (interscapular and around major vessels, helping newborns — who cannot yet shiver effectively — keep warm) and persists in adults mainly as smaller, cold-activatable depots around the neck, supraclavicular region and along the spine/mediastinum.

Sources: [Wikipedia — Brown adipose tissue](https://en.wikipedia.org/wiki/Brown_adipose_tissue), [Wikipedia — Adipocyte](https://en.wikipedia.org/wiki/Adipocyte), [Cannon & Nedergaard 2004, Brown adipose tissue: function and physiological significance, Physiological Reviews (PubMed)](https://pubmed.ncbi.nlm.nih.gov/14715917/), [Pathology Outlines — Histology, brown and white adipose tissue](https://www.pathologyoutlines.com/topic/softtissueadiposewhitefat.html), [Kenhub — Brown adipose tissue: Anatomy and histology](https://www.kenhub.com/en/library/anatomy/brown-adipose-tissue).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; stays round & central (not flattened) because no single droplet dominates | central | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries β3-adrenergic receptors that sense noradrenaline | outermost | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel matrix packed with droplets and mitochondria, giving a foamy look | interior | core |
| `lipid_droplet` | guttula adiposa (multilocularis) | Lipid droplet (multilocular) | Lipidtropfen (multilokulär) | many small fat stores scattered through the cell; substrate for burning, not bulk storage | scattered throughout cytoplasm, many | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | unusually numerous & large, densely packed cristae; site of UCP1-driven heat production; gives the cell/tissue its brown colour | densely packed between the lipid droplets | core |
| `ucp1` | proteinum discinctivum 1 (thermogeninum) | UCP1 (thermogenin) | UCP1 (Thermogenin) | inner-mitochondrial-membrane protein that short-circuits the proton gradient into heat instead of ATP | inner mitochondrial membrane | core |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | modest protein synthesis machinery | near the nucleus | minor |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | modest packaging/secretory machinery | near the nucleus | minor |
| `capillary` | vas capillare | Capillary | Kapillare | dense surrounding blood supply delivers substrate/oxygen and carries heat away | adjacent to the cell, in the tissue | context (do not draw inside the cell) |

### Do NOT draw (scientifically misleading)
- **No single giant lipid droplet with the nucleus squashed flat at the rim** — that is the signature of a *white* adipocyte, not brown fat; the defining feature here is **many small droplets** and a **round, central** nucleus.
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is an animal cell, not a prokaryote.
- **No chloroplasts, no large central vacuole** — plant-cell features, not present here.
- **Not sparse/scanty mitochondria** — the opposite of the real biology; mitochondria must be depicted as numerous and large, densely filling the spaces between droplets, with visible internal cristae in cutaway styles.
- **No cilia/flagella for locomotion** — adipocytes are stationary tissue cells.
- **Capillaries/nerve endings, if shown at all, stay OUTSIDE the cell body** (context in the surrounding tissue), never inside the cytoplasm.
- A single specimen (or, for tissue-context styles, a small readable cluster) — not a dense, unreadable confluent sheet where individual multilocular droplets/mitochondria can't be told apart.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Tecido adiposo multilocular brown adipose tissue.gif"**, a genuine light micrograph of a histological section of human brown (multilocular) adipose tissue, stained (trichrome-type stain), showing a field of adipocytes each containing multiple round lipid vacuoles of varying size (the "multilocular" pattern) packed against dense, granular (mitochondria-rich) cytoplasm, with capillaries running between the cells — classic, textbook-recognisable brown-fat histology.
- file: https://upload.wikimedia.org/wikipedia/commons/1/16/Tecido_adiposo_multilocular_brown_adipose_tissue.gif
- page: https://commons.wikimedia.org/wiki/File:Tecido_adiposo_multilocular_brown_adipose_tissue.gif · License: **Public domain** (US federal-government work, Title 17 §105) · Attribution: none required (US Govt work); uploader Lucasmcorso, Wikimedia Commons
AI visual verification result: **PASS (2026-08-15).** Real light micrograph (not an illustration/diagram) of a tissue field showing numerous adipocytes each with several-to-many small round unstained lipid vacuoles per cell and dense granular pink/red cytoplasm between them (mitochondria-rich), thin pale-blue collagenous septa and small vessel profiles between cells — matches the multilocular brown-fat pattern well, individual cells and their multiple droplets are clearly readable in several fields of view. Caveat: it is a tissue field (many cells), not a single isolated cell, which is appropriate/expected for adipose histology (the tissue-level packing is itself diagnostic); no baked-in scale bar or caption text is present in the frame itself. A cleaned, backgroundnormalised version is produced with `edit_image.py` for display — see §5.

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Brown Adipocyte — your body's own tiny furnace! While most fat cells are lazy energy piggy banks, this one loves to work: it's stuffed with hundreds of little fat droplets and packed wall-to-wall with mitochondria, its personal power plants. When your skin feels a chill, nerves send it a wake-up signal and it fires up all those mitochondria at once — but instead of making fuel for other cells, it burns the fat right there and lets the energy escape as cozy warmth, like a built-in heating pad. Babies are born with lots of these heaters (they can't shiver yet, so they need the help), and grown-ups still keep a stash around the neck and collarbones for extra-cold days.  
🇩🇪 Das ist der Braune Adipozyt — der körpereigene Mini-Ofen! Während die meisten Fettzellen faule Energiesparbüchsen sind, ist diese hier ein echter Arbeiter: Sie steckt voller Hunderter winziger Fetttröpfchen und ist bis obenhin mit Mitochondrien gefüllt, ihren persönlichen Kraftwerken. Wenn deine Haut Kälte spürt, schicken die Nerven ihr ein Wecksignal, und sie schaltet alle Mitochondrien gleichzeitig ein — aber statt daraus Treibstoff für andere Zellen zu machen, verbrennt sie das Fett direkt an Ort und Stelle und lässt die Energie als wohlige Wärme entweichen, wie ein eingebautes Heizkissen. Babys kommen mit vielen dieser Heizungen zur Welt (sie können ja noch nicht zittern, also brauchen sie die Hilfe), und Erwachsene behalten sich noch einen Vorrat am Hals und an den Schlüsselbeinen für besonders kalte Tage.

**Adults (popular science, health).**  
🇬🇧 The brown adipocyte is a specialised fat cell built for heat production rather than energy storage. Unlike the single large fat globule of a white fat cell, it holds many small lipid droplets and an unusually dense population of large mitochondria, which give brown fat its characteristic colour. These mitochondria carry a unique protein, UCP1, that short-circuits their normal fuel-burning process so that the energy is released directly as heat instead of being packaged into ATP - a process called non-shivering thermogenesis. Newborns rely heavily on brown fat because they cannot yet shiver effectively; adults retain smaller, cold-activatable depots mainly around the neck and collarbones, and interest in reactivating this tissue is a growing area of metabolic research linked to weight and blood-sugar regulation.  
🇩🇪 Der braune Adipozyt ist eine spezialisierte Fettzelle, die auf Wärmeproduktion statt auf Energiespeicherung ausgelegt ist. Anders als die eine große Fettkugel einer weißen Fettzelle enthält sie viele kleine Lipidtropfen und eine ungewöhnlich dichte Ansammlung großer Mitochondrien, die dem braunen Fett seine charakteristische Farbe verleihen. Diese Mitochondrien tragen ein besonderes Protein namens UCP1, das ihren normalen Verbrennungsprozess kurzschließt, sodass die Energie direkt als Wärme freigesetzt wird, statt in ATP verpackt zu werden - ein Vorgang, der als zitterfreie Thermogenese bezeichnet wird. Neugeborene sind stark auf braunes Fett angewiesen, weil sie noch nicht effektiv zittern können; Erwachsene behalten kleinere, durch Kälte aktivierbare Depots vor allem am Hals und an den Schlüsselbeinen, und die Reaktivierung dieses Gewebes ist ein wachsendes Forschungsfeld der Stoffwechselforschung im Zusammenhang mit Gewicht und Blutzuckerregulation.

**Scientific.**  
🇬🇧 The brown adipocyte is a myogenic-lineage (Myf5+)-derived thermogenic cell characterised by a multilocular distribution of small lipid droplets, a round, centrally located nucleus, and an unusually high density of large mitochondria with tightly packed cristae, densely vascularised and richly innervated by sympathetic (noradrenergic) fibres. Cold exposure triggers noradrenaline release onto β3-adrenergic receptors, activating lipolysis and fatty-acid oxidation; the resulting proton-motive force is dissipated as heat rather than driving ATP synthase because uncoupling protein 1 (UCP1), embedded in the inner mitochondrial membrane, provides an alternative proton-leak pathway - non-shivering thermogenesis. Brown adipose tissue depots are proportionally large in human infants (interscapular, perirenal, periadrenal) and persist in smaller, cold-inducible form in adults (supraclavicular, cervical, paravertebral), detectable by 18F-FDG PET-CT under cold stimulation; their mitochondrial density and vascularity also account for the tissue's characteristic brown colour, distinguishing it from mitochondria-poor, sparsely vascularised white adipose tissue.  
🇩🇪 Der braune Adipozyt ist eine aus der myogenen Linie (Myf5+) hervorgehende thermogene Zelle, gekennzeichnet durch eine multilokuläre Verteilung kleiner Lipidtropfen, einen runden, zentral gelegenen Zellkern und eine ungewöhnlich hohe Dichte großer Mitochondrien mit eng gepackten Cristae, stark vaskularisiert und reich innerviert durch sympathische (noradrenerge) Fasern. Kälteexposition löst die Freisetzung von Noradrenalin an β3-Adrenorezeptoren aus, was Lipolyse und Fettsäureoxidation aktiviert; die dabei entstehende protonenmotorische Kraft wird als Wärme abgegeben statt die ATP-Synthase anzutreiben, da das Entkopplerprotein 1 (UCP1) in der inneren Mitochondrienmembran einen alternativen Protonenleckweg bereitstellt - die zitterfreie Thermogenese. Braune-Fett-Depots sind bei menschlichen Säuglingen anteilig groß (interskapulär, perirenal, periadrenal) und bleiben bei Erwachsenen in kleinerer, kälteinduzierbarer Form bestehen (supraklavikulär, zervikal, paravertebral), nachweisbar durch 18F-FDG-PET-CT unter Kältestimulation; ihre Mitochondriendichte und Vaskularisierung erklären zudem die charakteristische braune Farbe des Gewebes im Unterschied zum mitochondrienarmen, spärlich vaskularisierten weißen Fettgewebe.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human brown adipocyte (brown fat cell), a round-to-polygonal animal cell, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. A neat quarter cut-away reveals the interior: MANY small round pale cream/ivory lipid droplets of varying size scattered through the cytoplasm (this is a MULTILOCULAR fat cell, never one giant droplet), densely packed between and around them a very large number of warm reddish-brown/rust oval mitochondria with visible parallel internal cristae (mitochondria must dominate the cytoplasm, packed tightly, not sparse), tiny darker stipples along some mitochondrial inner membranes representing UCP1 protein studding the cristae, a round, centrally-located soft blue-violet nucleus (NOT flattened, NOT pushed to the rim), a small patch of pale lavender folded rough endoplasmic reticulum sheets near the nucleus, and a small teal-green stacked Golgi apparatus beside the nucleus. Thin plasma membrane outline. Anatomically faithful animal cell. Do NOT draw a single giant lipid droplet with the nucleus squashed flat at the rim (that is a white fat cell, not this one); do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SMALL cluster of two to three human brown adipocytes (brown fat cells) in tissue, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. Each cell is rounded/polygonal with a bumpy, faintly lobed surface texture (subtle domed bulges from the many internal lipid droplets pressing against the membrane from within), fractured/freeze-fracture-style tissue view, with a couple of small smooth capillary vessel profiles running in the connective tissue between the cells for context. Render true 3D surface texture with shallow depth of field so far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm rust-brown to reddish-bronze cell surfaces (evoking brown fat's real mitochondria-rich colour) against a darker charcoal-brown connective tissue background. SEM shows the outer surface only, so render NO internal organelles, only external cell shape and surface texture. Anatomically faithful, small readable cluster only (not a dense unreadable sheet). Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human brown adipocyte (brown fat cell), a round-to-polygonal animal cell, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: MANY small round pale cream/ivory translucent lipid droplets of varying size scattered through the cytoplasm (multilocular - never one giant droplet), a very dense packing of warm reddish-brown oval mitochondria with visible parallel cristae filling the spaces between the droplets (mitochondria must be numerous and prominent, not sparse), tiny fine studding on some mitochondrial cristae representing UCP1 protein, a round centrally-located soft blue-violet translucent nucleus (not flattened, not pushed to the rim), a small patch of pale lavender folded rough endoplasmic reticulum near the nucleus, and a small teal-green Golgi stack beside the nucleus. Natural colours, not near-monochrome and not neon. Do NOT render a single giant lipid droplet with a flattened peripheral nucleus (that is a white fat cell); do NOT render a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia; this is an animal cell, not a bacterium. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human brown adipocyte (brown fat cell) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is round-to-polygonal. A delicate painterly cut-away reveals the interior: MANY small round pale cream lipid droplets of varying size scattered through the cytoplasm (multilocular - never a single giant droplet), densely painted warm reddish-brown/rust oval mitochondria with fine cristae lines packed tightly between the droplets, a round centrally-placed soft violet-blue nucleus (not flattened, not at the rim), a small wash of pale lavender folded rough endoplasmic reticulum near the nucleus, and a small teal-green Golgi stack beside it. Single specimen, anatomically faithful animal cell. Do NOT paint a single giant lipid droplet with a flattened peripheral nucleus, a cell wall, nucleoid, plasmids, chloroplasts, a large central vacuole, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 5 attempt(s), 9191 tok, $0.202
- attempt 1 · `gemini-2.5-flash-image` · 13.8s — fail (gemini-2.5-flash-image; baked-in gibberish digit text hidden inside the cytoplasm background, e.g. a legible "2890"-like numeral)
  ![textbook 1](theme/textbook/brown-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 8.6s — fail (gemini-2.5-flash-image, re-render with stronger no-text wording; still had a stray hook/arrow-like glitch mark near one mitochondrion)
  ![textbook 2](theme/textbook/brown-adipocyte.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 5.6s — fail (gemini-2.5-flash-image; naming the protein "UCP1" in the prompt caused the model to render the literal letters "UCP1" as baked text on several mitochondria)
  ![textbook 3](theme/textbook/brown-adipocyte.attempts/gen-03__gemini-2.5-flash-image.avif)
- attempt 4 · `gemini-2.5-flash-image` · 5.8s — fail (gemini-2.5-flash-image, UCP1 acronym removed from prompt but cristae stippling still degenerated into small digit/letter-like glyphs (a '2', 'N', 'P') scattered across multiple mitochondria)
  ![textbook 4](theme/textbook/brown-adipocyte.attempts/gen-04__gemini-2.5-flash-image.avif)
- attempt 5 · `gemini-3-pro-image` · 32.2s — pass (gemini-3-pro-image, escalated after repeated flash text/glyph glitches; cristae rewritten as plain straight parallel bars only - clean quarter cut-away, many small multilocular lipid droplets, dense large mitochondria with correct zigzag cristae and no lettering, round central nucleus, rough ER + Golgi near nucleus, fills frame edge-to-edge, no border)
  ![textbook 5](theme/textbook/brown-adipocyte.attempts/gen-05__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/brown-adipocyte.textbook.svg)
[interactive SVG](theme/textbook/brown-adipocyte.textbook.svg) · [HTML](theme/textbook/brown-adipocyte.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1557 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 13.4s — pass (gemini-2.5-flash-image; small readable cluster of 2-3 bumpy-surfaced brown adipocytes, warm rust-bronze false colour, two small capillary profiles in the surrounding connective tissue for context, surface-only as expected for SEM, no text, no border)
  ![sem 1](theme/sem/brown-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1661 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 6.7s — pass (gemini-2.5-flash-image; natural biological tints, many small multilocular lipid droplets, dense large mitochondria with fibrous cristae texture packed between them, round central translucent nucleus, rough ER + Golgi beside it, soft studio lighting, no text, fills frame edge-to-edge, no border)
  ![3d 1](theme/3d/brown-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/brown-adipocyte.3d.svg)
[interactive SVG](theme/3d/brown-adipocyte.3d.svg) · [HTML](theme/3d/brown-adipocyte.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3330 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 12.0s — fail (gemini-2.5-flash-image; mitochondrial cristae rendered as cursive handwriting-like squiggles that read as illegible baked-in text)
  ![watercolor 1](theme/watercolor/brown-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 21.3s — pass (gemini-2.5-flash-image, re-rendered with cristae restricted to plain straight hash-mark lines only; warm aged paper fills the frame edge-to-edge with a soft wash halo, no mat/frame, many small multilocular droplets, dense mitochondria, round central nucleus, rough ER + Golgi, no text)
  ![watercolor 2](theme/watercolor/brown-adipocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/brown-adipocyte.watercolor.svg)
[interactive SVG](theme/watercolor/brown-adipocyte.watercolor.svg) · [HTML](theme/watercolor/brown-adipocyte.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `light micrograph (multilocular brown adipose tissue, histological stain)` · Public domain (US federal government work, Title 17 §105) · US Government (via Wikimedia Commons, uploader Lucasmcorso) — pass (Wikimedia Commons "Tecido adiposo multilocular brown adipose tissue.gif", public domain US federal-government work; genuine light micrograph of human brown adipose tissue showing numerous multilocular adipocytes with dense granular mitochondria-rich cytoplasm)
  ![reference](theme/real/brown-adipocyte.attempts/real-01__light micrograph (multilocular brown adipose tissue, histological stain).avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 5 | use as final; escalated to gemini-3-pro-image after 4 flash attempts kept producing baked-in text/glyph glitches inside the cristae texture - clean once cristae were constrained to plain bars and the UCP1 acronym was removed from the prompt |
| sem | pass | 1 | use as final; correct false-colour surface-only rendering of a small readable cluster with tissue context |
| 3d | pass | 1 | use as final; correct natural-tint composition with all core organelles distinguishable |
| watercolor | pass | 2 | use as final after one re-render to remove cursive-squiggle cristae artifacts that read as illegible text |
