# Thrombocyte (platelet) — render log

**Set:** `red-blood` · **Microbe key:** `thrombocyte`
**Short description:** Tiny anucleate, disc-shaped cell fragment pinched off from megakaryocytes; carries a marginal microtubule band, alpha- and dense granules, and an open canalicular system. Plugs wounds, forms the first clot and triggers the coagulation cascade.

Metadata sidecar: [`thrombocyte.render.meta.json`](thrombocyte.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

Platelets (thrombocytes) are anucleate, discoid cytoplasmic fragments roughly 2–4 µm in diameter (about a third to a quarter the diameter of a red blood cell), budded off in the thousands from the cytoplasm of bone-marrow megakaryocytes via long proplatelet extensions into marrow sinusoids, at a rate of roughly 10^11 platelets per day, regulated by thrombopoietin. Structurally, at rest they are smooth, flattened, biconvex discs — never spherical, never nucleated. A peripheral zone carries the plasma membrane and glycocalyx studded with adhesion/aggregation surface glycoprotein receptors, chiefly GPIb-IX-V (binds von Willebrand factor) and integrin αIIbβ3/GPIIb-IIIa (binds fibrinogen for aggregation). Just beneath the membrane, a **marginal band of ~8–12 circumferentially coiled microtubules** rings the disc's equator and maintains its flattened resting shape; a submembranous **actin/myosin cytoskeleton** supports it and drives the dramatic shape change on activation. The organelle zone holds **alpha granules** (the most numerous granule type; store adhesive/coagulation proteins such as von Willebrand factor, fibrinogen, platelet factor 4, PDGF, P-selectin), smaller and denser **dense (delta) granules** (store ADP, ATP, serotonin, Ca²⁺), a few small **mitochondria**, scattered **glycogen** granules for local energy, and two distinct membrane-reticular systems: the surface-connected **open canalicular system (OCS)**, a sponge-like network of channels that reaches from the surface into the interior and serves as a membrane reservoir and secretion conduit, and the **dense tubular system (DTS)**, a compact cluster of narrow tubules derived from smooth ER that stores Ca²⁺ and synthesises thromboxane A2. On vessel injury, exposed subendothelial collagen and von Willebrand factor trigger platelets to adhere, flatten and spread into a spiky, pseudopod-bearing shape, and to release their granule contents, recruiting further platelets into a soft **platelet plug** (primary haemostasis) within seconds, while newly exposed anionic phospholipids on the activated membrane provide the catalytic surface that couples this plug to the fibrin-forming coagulation cascade.

Sources: [OpenStax Anatomy & Physiology 18.3 — Formed Elements of the Blood](https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-formed-elements-of-the-blood), [NCBI Bookshelf — Molecular Biology of the Cell, Platelets](https://www.ncbi.nlm.nih.gov/books/NBK26928/), [Michelson (ed.), *Platelets*, 4th ed. — platelet ultrastructure (ScienceDirect chapter overview)](https://www.sciencedirect.com/book/9780128134566/platelets), [Wikipedia — Platelet](https://en.wikipedia.org/wiki/Platelet).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries the glycocalyx | outermost | core |
| `surface_receptors` | glycoproteina superficialis (GPIb-IX-V, GPIIb/IIIa) | Surface glycoprotein receptors (GPIb, GPIIb/IIIa) | Oberflächen-Glykoproteinrezeptoren (GPIb, GPIIb/IIIa) | adhesion (von Willebrand factor) and aggregation (fibrinogen) | studding the outer membrane | core |
| `marginal_band` | anulus microtubularis marginalis | Marginal microtubule band (coil) | Marginales Mikrotubuli-Band (Spule) | ring of coiled microtubules that keeps the resting disc shape | just under the membrane, around the equator | core |
| `actin_cytoskeleton` | cytoskeleton actini | Actin cytoskeleton | Aktin-Zytoskelett | submembranous scaffold; drives the activation shape change | throughout the cytoplasm | core |
| `alpha_granules` | granula alpha | Alpha granules | Alpha-Granula | store adhesive/coagulation proteins (vWF, fibrinogen, PDGF, P-selectin); most numerous granule | scattered in the organelle zone | core |
| `dense_granules` | granula densa (delta) | Dense granules (delta granules) | Dichte Granula (Delta-Granula) | store ADP, ATP, serotonin, Ca²⁺; fewer and smaller/denser than alpha granules | scattered in the organelle zone | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | local ATP production | one or two, in the cytoplasm | core |
| `open_canalicular_system` | systema canaliculare apertum | Open canalicular system (OCS) | Offenes kanalikuläres System (OCS) | membrane reservoir + secretion conduit; connects surface to interior | network of channels through the cell body | core |
| `dense_tubular_system` | systema tubulare densum | Dense tubular system (DTS) | Dichtes tubuläres System (DTS) | smooth-ER-derived Ca²⁺ store; site of thromboxane A2 synthesis | compact tubule cluster, separate from the OCS | core |
| `glycogen` | glycogenum | Glycogen granules | Glykogengranula | local energy reserve | fine granule clusters in the cytoplasm | core |

### Do NOT draw (scientifically misleading)
- **No nucleus, nucleolus or chromatin** — the mature platelet is anucleate; it is a cell *fragment*, not a whole cell. This is the single most important rule for this cell.
- **No rough endoplasmic reticulum sheets or Golgi stack** — the mature circulating platelet has neither; it no longer makes proteins de novo the way a nucleated cell does (the DTS is smooth-ER-derived, not RER).
- **Not a perfect sphere** — the resting platelet is a smooth, flattened, biconvex disc, roughly a third to a quarter the diameter of a red blood cell; do not draw it round like an erythrocyte or lymphocyte.
- **No cell wall, capsule, flagella, pili or any prokaryotic structure** — this is a human cell fragment, not a bacterium.
- **Do not confuse OCS and DTS** — the OCS is an open, surface-connected channel network (secretion/membrane reservoir); the DTS is a closed, compact tubule cluster (Ca²⁺ store). They are two distinct systems, not one.
- A single specimen at rest (smooth disc), not a dense clump of many platelets — individual structures must stay readable.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **"Giant Platelet, Peripheral Blood Smear"**, a Wright-stained light-micrograph of a human peripheral blood smear showing a single platelet (an unusually large/"giant" one, more easily resolved at this magnification than a typical 2–4 µm platelet) surrounded by red blood cells — CC BY 2.0.
- file: https://upload.wikimedia.org/wikipedia/commons/2/26/Giant_Platelet%2C_Peripheral_Blood_Smear_%286032662354%29.jpg
- page: https://commons.wikimedia.org/wiki/File:Giant_Platelet,_Peripheral_Blood_Smear_(6032662354).jpg · License: **CC BY 2.0** · Ed Uthman (Houston, TX, USA), via Flickr, transferred to Wikimedia Commons by CFCF
AI visual verification result: **PASS (2026-08-15).** A single, clearly isolated purple/violet-staining, irregularly granular cell body sits at the centre of the field among numerous pink, biconcave-disc-shaped red blood cells, with no baked-in text, scale bar or border — an accurate, readable single-specimen reference for platelet colour and cytoplasmic granularity. Caveat: this specific platelet is a "giant platelet" (megathrombocyte), larger than the typical 2–4 µm resting platelet (roughly a third to a quarter of an RBC's diameter) — normal-sized platelets are frequently too small to resolve clearly as isolated specimens in a standard-magnification smear photograph, which is why teaching material commonly uses a giant/reactive platelet for a legible single-cell reference; the size caveat is noted here rather than left implicit. The download already carries natural stain colour and has no text/border to strip, so no `edit_image.py` cleaning pass was needed; the original download is used directly for display.

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Thrombocyte, also called a platelet — the tiniest crew member in your blood, and also the fastest to react! It doesn't even have a nucleus of its own; it's really a little fragment that broke off from a giant cell called a megakaryocyte, like confetti pinched off a balloon. But don't let the size fool you: the second you get a scrape, hundreds of platelets rush to the spot, stick together, and change shape to grow sticky little arms that grab onto the edges of the cut. Within seconds they've built a plug to stop the bleeding, and they call in the coagulation factors to weave a tougher net called fibrin around the plug. Platelets are the body's emergency patch crew — small, speedy, and always first on the scene.  
🇩🇪 Das ist der Thrombozyt, auch Blutplättchen genannt — das kleinste Mitglied deiner Blutmannschaft, aber das schnellste, wenn es drauf ankommt! Es hat nicht einmal einen eigenen Zellkern; eigentlich ist es nur ein kleines Bruchstück, das von einer Riesenzelle namens Megakaryozyt abgeschnürt wurde, so wie Konfetti von einem Luftballon. Aber lass dich von der Größe nicht täuschen: Sobald du dich schneidest, eilen Hunderte Blutplättchen zur Stelle, kleben zusammen und bilden klebrige kleine Arme, mit denen sie sich an den Wundrändern festhalten. Innerhalb von Sekunden haben sie einen Pfropfen gebaut, der die Blutung stoppt, und rufen die Gerinnungsfaktoren herbei, die ein stabileres Netz aus Fibrin um den Pfropfen weben. Blutplättchen sind die Notfall-Flickmannschaft des Körpers — klein, blitzschnell und immer als Erste am Ort des Geschehens.

**Adults (popular science, health).**  
🇬🇧 Platelets (thrombocytes) are anucleate cell fragments, roughly 2-4 micrometres across, budded off in their thousands from the cytoplasm of bone-marrow megakaryocytes. Despite lacking a nucleus, they are far from inert: when a blood vessel wall is breached, exposed collagen and von Willebrand factor trigger platelets to adhere, change from a smooth disc into a spiky, spread-out shape, and release the contents of their alpha- and dense granules. This recruits and activates more platelets, building a soft platelet plug within seconds — primary haemostasis — while surface phospholipids and released factors kick off the coagulation cascade that reinforces the plug with a fibrin mesh. A healthy adult carries roughly 150,000 to 450,000 platelets per microlitre of blood, each circulating for about 8 to 10 days before being cleared by the spleen and liver.  
🇩🇪 Thrombozyten (Blutplättchen) sind kernlose Zellfragmente von etwa 2 bis 4 Mikrometern Durchmesser, die zu Tausenden vom Zytoplasma der Megakaryozyten im Knochenmark abgeschnürt werden. Obwohl ihnen ein Zellkern fehlt, sind sie alles andere als untätig: Wird die Wand eines Blutgefäßes verletzt, lösen freigelegtes Kollagen und der von-Willebrand-Faktor aus, dass Thrombozyten anhaften, sich von einer glatten Scheibe in eine stachelige, ausgebreitete Form verwandeln und den Inhalt ihrer Alpha- und dichten Granula freisetzen. Das lockt und aktiviert weitere Thrombozyten, sodass sich innerhalb von Sekunden ein weicher Thrombozytenpfropf bildet — die primäre Hämostase —, während Oberflächen-Phospholipide und freigesetzte Faktoren die Gerinnungskaskade in Gang setzen, die den Pfropf mit einem Fibrinnetz verstärkt. Ein gesunder Erwachsener hat etwa 150.000 bis 450.000 Thrombozyten pro Mikroliter Blut, jedes zirkuliert rund 8 bis 10 Tage, bevor es in Milz und Leber abgebaut wird.

**Scientific.**  
🇬🇧 Platelets are anucleate, discoid cytoplasmic fragments (~2-4 µm diameter, ~7-11 fL volume) released from bone-marrow megakaryocytes via proplatelet extension into marrow sinusoids, at a rate of roughly 10^11 platelets per day, regulated by thrombopoietin. Structurally they retain a peripheral zone (glycocalyx and plasma membrane studded with adhesion/aggregation receptors GPIb-IX-V and integrin αIIbβ3/GPIIb-IIIa), a marginal band of ~8-12 circumferentially coiled microtubules that maintains the discoid resting shape, a submembranous actin/myosin cytoskeleton, and an organelle zone containing alpha-granules (adhesive and coagulation proteins: von Willebrand factor, fibrinogen, platelet factor 4, PDGF, P-selectin), dense (delta) granules (ADP, ATP, serotonin, Ca2+), mitochondria, glycogen, and two membrane-reticular systems — the surface-connected open canalicular system (OCS), which serves as a reservoir for membrane expansion and receptor externalisation, and the dense tubular system (DTS), a smooth-ER-derived calcium store and site of thromboxane A2 synthesis. Upon exposure of subendothelial collagen and von Willebrand factor, platelets undergo adhesion, shape change (marginal-band and cytoskeletal remodelling into a spread, pseudopod-bearing form), granule secretion and integrin activation, driving aggregation into a primary haemostatic plug; exposed anionic phospholipids (phosphatidylserine) on the activated membrane then provide the catalytic surface for the tenase and prothrombinase complexes of the coagulation cascade, coupling platelet plug formation to fibrin generation.  
🇩🇪 Thrombozyten sind kernlose, scheibenförmige Zytoplasmafragmente (Durchmesser ca. 2-4 µm, Volumen ca. 7-11 fL), die von Megakaryozyten im Knochenmark durch Proplättchenbildung in die Marksinusoide freigesetzt werden, mit einer Rate von etwa 10^11 Thrombozyten pro Tag, reguliert durch Thrombopoetin. Strukturell besitzen sie eine periphere Zone (Glykokalyx und Plasmamembran mit den Adhäsions-/Aggregationsrezeptoren GPIb-IX-V und Integrin αIIbβ3/GPIIb-IIIa), ein marginales Band aus etwa 8-12 ringförmig angeordneten Mikrotubuli, das die scheibenförmige Ruheform aufrechterhält, ein submembranäres Aktin-Myosin-Zytoskelett sowie eine Organellzone mit Alpha-Granula (adhäsive und Gerinnungsproteine: von-Willebrand-Faktor, Fibrinogen, Plättchenfaktor 4, PDGF, P-Selektin), dichten (Delta-)Granula (ADP, ATP, Serotonin, Ca2+), Mitochondrien, Glykogen sowie zwei membranösen Retikulärsystemen — dem oberflächenverbundenen offenen kanalikulären System (OCS), das als Reservoir für Membranexpansion und Rezeptor-Externalisierung dient, und dem dichten tubulären System (DTS), einem vom glatten ER abgeleiteten Kalziumspeicher und Syntheseort von Thromboxan A2. Bei Freilegung von subendothelialem Kollagen und von-Willebrand-Faktor durchlaufen Thrombozyten Adhäsion, Formveränderung (Umbau von marginalem Band und Zytoskelett zu einer ausgebreiteten, pseudopodientragenden Form), Granulasekretion und Integrinaktivierung, was zur Aggregation zu einem primären Hämostase-Pfropf führt; freigelegte anionische Phospholipide (Phosphatidylserin) auf der aktivierten Membran liefern anschließend die katalytische Oberfläche für die Tenase- und Prothrombinase-Komplexe der Gerinnungskaskade und koppeln so die Plättchenpfropfbildung an die Fibrinbildung.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human thrombocyte (platelet), a tiny anucleate, disc-shaped blood-cell fragment, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell is a smooth, flattened, biconvex disc (NOT a perfect sphere, NOT round like a red blood cell) roughly a third the diameter of a red blood cell, with no nucleus anywhere. A neat quarter cut-away reveals the interior: a ring of several parallel microtubules coiled just under the membrane around the disc's equator (the marginal microtubule band), a fine mesh of actin cytoskeletal filaments, scattered small round alpha granules (the most numerous granule type), a few smaller, denser dark dense (delta) granules, one or two small mitochondria, fine glycogen granule clusters, and a network of thin membrane-lined channels reaching from the surface into the interior (the open canalicular system) plus a separate cluster of narrow tubules (the dense tubular system). Numerous tiny glycoprotein receptor bumps stud the outer membrane. Anatomically faithful. Do NOT draw a nucleus, nucleolus, rough endoplasmic reticulum sheets, or a Golgi stack — the mature platelet has none of these. Do NOT draw a cell wall, bacterial flagella, or any prokaryotic structure. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human thrombocyte (platelet), an activated cell showing its characteristic irregular, spread-out shape with several short spiky pseudopod extensions radiating from a flattened central body, resting on a subtly textured substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. Render true 3D surface texture: a smooth-to-slightly-ruffled central membrane dome with fine granular surface texture and several thin, tapering spiky projections reaching outward, much smaller than a nearby-scale red blood cell would be. Shallow depth of field so far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm golden-tan to soft coral body against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human thrombocyte (platelet), a tiny anucleate, flattened biconvex disc-shaped blood-cell fragment, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is a smooth disc with no nucleus. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so structures are clearly distinguishable: a coiled ring of pale microtubules running just beneath the membrane around the equator (marginal band), fine actin filaments, numerous small round pale-tan alpha granules, a few darker, denser delta (dense) granules, one or two small mitochondria with faint inner cristae, scattered glycogen granule clusters, and a network of thin canal-like membrane channels connecting to the surface (open canalicular system) alongside a compact cluster of narrow tubules (dense tubular system). Tiny glycoprotein receptor studs cover the outer membrane. Natural colours, not near-monochrome and not neon. Do NOT render a nucleus, nucleolus, rough endoplasmic reticulum, or Golgi apparatus; this mature cell fragment has none. Do NOT render a cell wall or any bacterial structure. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human thrombocyte (platelet) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is a small, smooth, flattened biconvex disc with no nucleus, much smaller than a red blood cell. A delicate painterly cut-away reveals the interior: a fine ring of coiled microtubules just under the membrane around the equator (marginal band), soft washed cytoplasm with fine actin filament texture, small round alpha granules scattered through the cytoplasm, a few smaller darker dense (delta) granules, one or two tiny mitochondria, faint glycogen speckling, and delicate thin channels linking the surface to the interior (open canalicular system) with a small separate tubule cluster (dense tubular system). Single specimen, anatomically faithful. Do NOT paint a nucleus, nucleolus, rough endoplasmic reticulum or Golgi apparatus, a cell wall, or any bacterial structure. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3370 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 12.7s — fail (gemini-2.5-flash-image; rendered as a round circle rather than a flattened biconvex disc, and framed as a grey square with a white margin around it - not edge-to-edge, superseded)
  ![textbook 1](theme/textbook/thrombocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 12.3s — pass (gemini-2.5-flash-image; correct flattened elongated biconvex disc shape, quarter cutaway clearly shows marginal microtubule band, alpha and dense granules, mitochondrion, glycogen, OCS and DTS, muted textbook palette matching house style, no nucleus, no border)
  ![textbook 2](theme/textbook/thrombocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/thrombocyte.textbook.svg)
[interactive SVG](theme/textbook/thrombocyte.textbook.svg) · [HTML](theme/textbook/thrombocyte.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1519 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 12.0s — pass (gemini-2.5-flash-image; single activated platelet with characteristic spread central body and radiating spiky pseudopod extensions, granular surface texture, warm false-colour palette on dark background, correctly surface-only with no internal structures shown, no text/border)
  ![sem 1](theme/sem/thrombocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3303 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 11.8s — fail (gemini-2.5-flash-image; rendered as a round sphere rather than a flattened biconvex disc, superseded)
  ![3d 1](theme/3d/thrombocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 18.5s — pass (gemini-2.5-flash-image; correct flattened elongated biconvex disc shape, gentle cutaway with natural biological tints reveals coiled marginal microtubule band, alpha/dense granules, mitochondrion, glycogen clusters, OCS channel network and DTS tubule cluster, no nucleus, no border)
  ![3d 2](theme/3d/thrombocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/thrombocyte.3d.svg)
[interactive SVG](theme/3d/thrombocyte.3d.svg) · [HTML](theme/3d/thrombocyte.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3366 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 16.6s — fail (gemini-2.5-flash-image; round rather than flattened-disc shape, subject too small with excess empty paper margin, and a central rosette structure reads misleadingly nucleus-like, superseded)
  ![watercolor 1](theme/watercolor/thrombocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 20.4s — pass (gemini-2.5-flash-image; correct flattened elongated biconvex disc shape, large and centred, full-bleed aged paper filling the frame, ink-and-wash cutaway shows marginal band, granules, mitochondrion, OCS/DTS, no nucleus, no sheet-on-surface artifact)
  ![watercolor 2](theme/watercolor/thrombocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/thrombocyte.watercolor.svg)
[interactive SVG](theme/watercolor/thrombocyte.watercolor.svg) · [HTML](theme/watercolor/thrombocyte.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM (Wright-stained peripheral blood smear)` · CC BY 2.0 · Ed Uthman (Houston, TX, USA), via Flickr, transferred to Wikimedia Commons by CFCF — pass (Wikimedia Commons "Giant Platelet, Peripheral Blood Smear", Ed Uthman via Flickr, CC BY 2.0: authentic Wright-stained light micrograph showing a single clearly isolated giant/reactive platelet among red blood cells; no baked-in text or scale bar. Used directly without edit_image.py cleaning since it already had natural stain colour and no text/border to strip. Size caveat noted in the render log: this is a giant/reactive platelet, larger than a typical resting 2-4 µm platelet.)
  ![reference](../reference-microscopy/theme/blood-smear/thrombocyte.attempts/real-01__LM%20%28Wright-stained%20peripheral%20blood%20smear%29.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | correct flattened biconvex disc after 1 re-render to fix a round/sphere-shaped, non-edge-to-edge first attempt; all core organelles present and labellable |
| sem | pass | 1 | convincing false-colour activated platelet with spiky pseudopods and correct surface-only rendering on first attempt |
| 3d | pass | 2 | correct flattened biconvex disc with natural-tint cutaway after 1 re-render to fix a spherical first attempt |
| watercolor | pass | 2 | correct flattened, large, centred disc on full-bleed aged paper after 1 re-render to fix a small round shape with a misleading nucleus-like central rosette |
