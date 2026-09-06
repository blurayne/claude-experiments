# Blood plasma — render log

**Set:** `red-blood` · **Microbe key:** `blood-plasma`
**Short description:** Not a cell — the straw-yellow liquid fraction of blood (~55 % of its volume, ~92 % water) in which every blood cell travels: dissolved albumin, antibodies, fibrinogen and a thousand other proteins, plus salts, glucose, hormones and dissolved gases, delivering nutrients everywhere and hauling waste to kidney and liver.

Metadata sidecar: [`blood-plasma.render.meta.json`](blood-plasma.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

**Blood plasma is not a cell.** It is the acellular liquid fraction of blood — a clear, straw-yellow (pale amber) fluid that makes up **about 55 % of whole-blood volume**, in which all the formed elements (erythrocytes, leukocytes, platelets) are suspended. By mass it is **~91–92 % water**; the rest is **~7 % dissolved proteins** (6–8 g/dL) plus ~1–2 % electrolytes (Na⁺ ~136–145 mM, Cl⁻, HCO₃⁻, K⁺, Ca²⁺…), glucose, lipids, hormones, vitamins and dissolved gases (CO₂ mostly as bicarbonate, a little O₂ and N₂). The yellow tint comes chiefly from bilirubin and dietary carotenoids, not from the proteins themselves.

The three headline protein classes, all of which are individually far below light-microscope resolution:

- **Albumin** (~35–50 g/L, roughly half to 60 % of plasma protein, ~66.5 kDa, a compact heart-shaped/ellipsoid molecule ~8 nm across, made by the liver). It generates most of the plasma's **colloid oncotic pressure** — the osmotic pull that holds water inside the vessels — and works as the plasma's general-purpose taxi, binding fatty acids, bilirubin, hormones, calcium and many drugs.
- **Globulins** (~35–38 % of plasma protein), including the **immunoglobulins (antibodies)** — the classic **Y-shaped** ~150 kDa IgG molecule, ~10–15 nm across, secreted by plasma cells (differentiated B cells) — plus transport globulins (transferrin, etc.) made by the liver.
- **Fibrinogen** (~2–4 g/L, ~4 % of plasma protein, 340 kDa): an **elongated, rod-like, trinodular** molecule ~45–46 nm long — three beads (two D domains flanking a central E domain) on a stick. It is the soluble precursor that thrombin converts into the insoluble **fibrin** mesh of a clot. **Serum = plasma minus fibrinogen and the other clotting factors** (what remains after blood has been allowed to clot) — the register-level caveat whenever "plasma" and "serum" get used interchangeably.

Centrifuging (or simply letting settle) anticoagulated whole blood separates it into the classic three-layer column that every textbook prints: the **straw-yellow plasma layer on top (~55 %)**, a **thin whitish "buffy coat"** of leukocytes and platelets (<1 %) in the middle, and the packed **red erythrocyte column (~45 %, the haematocrit)** at the bottom. Most plasma proteins are brewed by the liver; the antibodies are contributed by plasma cells. Donated plasma is transfused directly (fresh frozen plasma) or fractionated into albumin, clotting-factor and immunoglobulin concentrates.

**Rendering honesty note (this subject is a liquid).** A liquid has no surface an electron microscope could scan and no body a light microscope could focus on — *there is no such thing as a micrograph of blood plasma*. The honest visual options, used per style below and flagged in the verdicts, are: **(a)** the macroscopic centrifuged-column figure (textbook, watercolor-adjacent), and **(b)** a molecular-scale zoom INTO the amber fluid showing the dissolved proteins (albumin blobs, Y-antibodies, fibrinogen rods) at their true relative shapes, with any blood cells only as huge out-of-focus context shapes — an erythrocyte (~7.5 µm) is ~500× larger than a fibrinogen molecule, so at protein scale a cell can only ever be a vast blurred backdrop. The real reference in §2 is likewise a **macroscopic photograph, not microscopy**.

Sources: [Wikipedia — Blood plasma](https://en.wikipedia.org/wiki/Blood_plasma), [OpenStax Anatomy & Physiology 2e §18.1 An Overview of Blood](https://openstax.org/books/anatomy-and-physiology-2e/pages/18-1-an-overview-of-blood), [NCBI Bookshelf / StatPearls — Physiology, Serum Total Protein](https://www.ncbi.nlm.nih.gov/books/NBK540983/), [Wikipedia — Serum albumin](https://en.wikipedia.org/wiki/Serum_albumin), [Wikipedia — Fibrinogen](https://en.wikipedia.org/wiki/Fibrinogen) (trinodular ~45 nm structure), [Wikipedia — Antibody](https://en.wikipedia.org/wiki/Antibody) (Y-shaped IgG ~150 kDa).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `blood_plasma` | plasma sanguinis | Blood plasma (~55 % of blood) | Blutplasma (~55 % des Blutes) | the straw-yellow acellular fluid itself: water + salts + >1000 dissolved proteins; carries nutrients, hormones, waste | top layer of the separated column / the amber medium of the molecular views | core |
| `buffy_coat` | stratum leucocytorum | Buffy coat (white cells + platelets) | Leukozytenmanschette (Buffy Coat) | thin whitish band, <1 % of volume: leukocytes and platelets | between plasma and red column in the tube view | tube view only |
| `erythrocyte_layer` | stratum erythrocytorum | Erythrocyte layer (haematocrit, ~45 %) | Erythrozytenschicht (Hämatokrit, ~45 %) | packed red cells at the bottom after centrifugation | bottom of the tube view | tube view only |
| `albumin` | albuminum | Albumin | Albumin | dominant plasma protein; holds water in the vessels by oncotic pressure, carries cargo | small compact blobs dissolved throughout the fluid | molecular views |
| `antibody` | immunoglobulinum | Antibody (immunoglobulin) | Antikörper (Immunglobulin) | Y-shaped defence protein from plasma cells | drifting Y-shapes in the fluid | molecular views |
| `fibrinogen` | fibrinogenum | Fibrinogen | Fibrinogen | long trinodular rod; soluble clotting precursor of fibrin | elongated three-beaded rods in the fluid | molecular views |
| `water` | aqua | Water (~92 % of plasma) | Wasser (~92 % des Plasmas) | the solvent everything else is dissolved in | the amber medium itself | molecular views |

### Do NOT draw (scientifically misleading)
- **The subject is the amber fluid, never the red cells.** Compose so the straw-yellow liquid dominates every frame; any erythrocytes are passengers/context (huge, blurred, background at molecular scale; the *bottom* layer in the tube view), never the centrepiece.
- **No cells floating inside the plasma layer of the separated column** — after centrifugation the plasma layer is cell-free; that is the whole point of the figure.
- **No percent labels, graduation marks, letters or numbers on the tube** — the classic training-data tube diagram carries "55 % / 45 %" captions and ml gradations; render clean unlettered glass (baked-text danger is moderate here; check magnified crops).
- **Fibrinogen is a soluble rod, not a fibre mesh** — the branched, tangled network is fibrin, i.e. the clot, a different (activated) state. Draw discrete trinodular rods drifting free.
- **Antibodies are molecules, not cells** — small Y-shapes dissolved in the fluid, far smaller than any cell; do not draw them with nuclei, membranes or faces.
- **No ionised-gas "plasma"** — no glowing electric arcs, lightning or purple plasma-globe imagery; blood plasma is a watery liquid.
- **Do not paint the plasma red** — whole blood is red because of the cells; the plasma itself is pale straw-yellow/amber.
- **Relative protein sizes:** albumin (small compact blob, ~8 nm) < antibody (Y, ~10–15 nm) < fibrinogen (long rod, ~45 nm). Do not draw fibrinogen shorter than the antibody or albumin as the biggest thing.
- **No nucleus, organelles or membrane around anything in the fluid** — nothing in the plasma is a cell (in the molecular views the out-of-focus context cells are the only permitted cell shapes).

---

## 2. Real microscopy reference (own set `reference-microscopy`)

**No micrograph of a liquid exists — the honest real reference is macroscopic photography, not microscopy.** Chosen: **Wikimedia Commons — "Cells and plasma (44258664600).jpg"**, a real colour photograph by John Campbell of anticoagulated whole blood that has separated in an upright syringe: the straw-yellow **plasma layer clearly on top**, the dark-red **erythrocyte column below**, with the interface visible — exactly the centrifuged/settled-column composition §1 describes.
- file: https://upload.wikimedia.org/wikipedia/commons/6/67/Cells_and_plasma_%2844258664600%29.jpg
- page: https://commons.wikimedia.org/wiki/File:Cells_and_plasma_(44258664600).jpg · License: **CC0 1.0 (public-domain dedication)** · Attribution (courtesy): John Campbell, via Flickr/Wikimedia Commons
- modality: **macroscopic photograph** (settled anticoagulated blood in a syringe) — *not* microscopy; recorded as theme `photo` in the reference set.
- The original carries printed text on the syringe barrel (Cyrillic "гепарин"/heparin lettering and ml graduations), so a cleaned display version (text and gradations removed, layers untouched) is produced with `edit_image.py` and diffed against the original; the original download is kept for provenance.
AI visual verification result: see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Blood Plasma — not a cell at all, but the golden river every blood cell swims in! It looks yellow, not red: the red colour of blood comes from the passengers, not the water. Plasma is mostly water with a pinch of salt and sugar, and stirred into it float over a thousand tiny helper proteins. Albumin is the little pack-mule that keeps the water from leaking out of your vessels and gives hormones and vitamins a piggyback ride. Y-shaped antibodies drift along like tiny patrol boats. And fibrinogen is the repair kit: stretchy little rods that rush to a scrape and weave the net a scab grows on. So the next time you graze your knee and a crust forms, say a quiet thank-you to the golden river — and drink a glass of water, because that is literally what tops it back up.  
🇩🇪 Das ist das Blutplasma — gar keine Zelle, sondern der goldene Fluss, in dem alle Blutzellen schwimmen! Es ist gelb, nicht rot: Die rote Farbe des Blutes kommt von den Passagieren, nicht vom Wasser. Plasma ist fast nur Wasser mit einer Prise Salz und Zucker, und darin treiben über tausend winzige Helfer-Eiweiße. Albumin ist das kleine Packesel-Protein, das das Wasser in den Gefäßen festhält und Hormone und Vitamine huckepack trägt. Y-förmige Antikörper gleiten wie kleine Patrouillenboote vorbei. Und Fibrinogen ist der Reparaturkasten: dehnbare Stäbchen, die zu jedem Kratzer eilen und das Netz knüpfen, auf dem der Schorf wächst. Wenn sich also beim nächsten aufgeschürften Knie eine Kruste bildet, sag dem goldenen Fluss leise danke — und trink ein Glas Wasser, denn genau damit füllt er sich wieder auf.

**Adults (popular science, health).**  
🇬🇧 Strip the cells out of blood and what remains is plasma: a straw-yellow fluid that makes up slightly over half of blood's volume and is about 92 percent water. The rest is a remarkably busy cargo manifest — salts, glucose, hormones, dissolved gases and six to eight grams of protein per decilitre. Albumin, the most abundant protein, quietly does two indispensable jobs: its sheer concentration generates the osmotic pull that keeps water inside the vessels (lose too much albumin and tissues swell with oedema), and its surface binds fatty acids, bilirubin, calcium and a good share of the medicines you take. The globulin fraction includes the antibodies; fibrinogen and its fellow clotting factors circulate as inactive stand-by, ready to seal a leak within minutes. Nearly all of it is brewed by the liver, which is why liver disease shows up in a blood-protein panel. Plasma is also the one part of blood you can donate almost twice a week — the body replaces the fluid within a day or two — and a single donation can be split into albumin for burn patients, clotting factors for haemophilia and antibody concentrates for immune deficiencies.  
🇩🇪 Nimmt man dem Blut die Zellen weg, bleibt das Plasma: eine strohgelbe Flüssigkeit, die etwas mehr als die Hälfte des Blutvolumens stellt und zu rund 92 Prozent aus Wasser besteht. Der Rest ist eine erstaunlich geschäftige Frachtliste — Salze, Glukose, Hormone, gelöste Gase und sechs bis acht Gramm Eiweiß pro Deziliter. Albumin, das häufigste Protein, erledigt still zwei unverzichtbare Aufgaben: Seine schiere Konzentration erzeugt den osmotischen Sog, der das Wasser in den Gefäßen hält (fehlt Albumin, schwillt das Gewebe zum Ödem an), und an seiner Oberfläche binden Fettsäuren, Bilirubin, Kalzium und ein guter Teil der Medikamente, die man einnimmt. Zur Globulinfraktion gehören die Antikörper; Fibrinogen und die übrigen Gerinnungsfaktoren zirkulieren inaktiv in Bereitschaft und dichten ein Leck binnen Minuten ab. Fast alles davon braut die Leber — weshalb sich Lebererkrankungen im Bluteiweißbefund verraten. Plasma ist zugleich der einzige Blutbestandteil, den man fast zweimal pro Woche spenden kann — die Flüssigkeit ersetzt der Körper innerhalb von ein, zwei Tagen —, und eine einzige Spende lässt sich in Albumin für Brandverletzte, Gerinnungsfaktoren für Hämophile und Antikörperkonzentrate für Immundefekte zerlegen.

**Scientific.**  
🇬🇧 Blood plasma is the acellular aqueous phase of blood (~55 % of whole-blood volume, ~91–92 % water) obtained as the supernatant of centrifuged anticoagulated blood, above the buffy coat (leukocytes and platelets, <1 %) and the packed erythrocyte column (~45 %, the haematocrit). Total protein is 6–8 g/dL: albumin (~35–50 g/L; 66.5 kDa; hepatic synthesis) contributes ~75–80 % of the colloid oncotic pressure (~25 mmHg) governing transcapillary Starling fluxes and serves as the principal carrier for free fatty acids, unconjugated bilirubin, Ca²⁺ and many drugs; the globulin fraction comprises transport globulins and the immunoglobulins secreted by plasma cells (IgG ~150 kDa, the canonical Y-shaped heterotetramer); fibrinogen (2–4 g/L; 340 kDa; a ~45 nm elongated trinodular dimer of hexamers, D–E–D) is the soluble zymogen substrate that thrombin polymerises into the fibrin network. Plasma additionally distributes electrolytes (Na⁺ 136–145 mM as the dominant cation), glucose, lipoproteins, hormones and CO₂ (chiefly as bicarbonate), and its straw-yellow colour derives largely from bilirubin and carotenoids. The register caveat: serum is not a synonym — serum is plasma depleted of fibrinogen and the consumed clotting factors, i.e. the fluid remaining after coagulation, which is why clinical chemistry distinguishes serum tubes from anticoagulated (EDTA/heparin/citrate) plasma tubes. A second simplification to flag: plasma cannot be imaged as cells are — every 'picture of plasma' is either a macroscopic photograph of the bulk fluid or a molecular-scale structural visualisation of its solutes, never a micrograph.  
🇩🇪 Blutplasma ist die zellfreie wässrige Phase des Blutes (~55 % des Vollblutvolumens, ~91–92 % Wasser), gewonnen als Überstand zentrifugierten, antikoagulierten Blutes — oberhalb des Buffy Coat (Leukozyten und Thrombozyten, <1 %) und der gepackten Erythrozytensäule (~45 %, der Hämatokrit). Das Gesamteiweiß beträgt 6–8 g/dl: Albumin (~35–50 g/l; 66,5 kDa; hepatische Synthese) stellt ~75–80 % des kolloidosmotischen Drucks (~25 mmHg), der die transkapillären Starling-Flüsse bestimmt, und dient als Hauptträger für freie Fettsäuren, unkonjugiertes Bilirubin, Ca²⁺ und zahlreiche Pharmaka; zur Globulinfraktion gehören Transportglobuline sowie die von Plasmazellen sezernierten Immunglobuline (IgG ~150 kDa, das kanonische Y-förmige Heterotetramer); Fibrinogen (2–4 g/l; 340 kDa; ein ~45 nm langes, gestrecktes trinodulares Dimer aus Hexameren, D–E–D) ist das lösliche Zymogen-Substrat, das Thrombin zum Fibrinnetz polymerisiert. Daneben verteilt das Plasma Elektrolyte (Na⁺ 136–145 mM als dominierendes Kation), Glukose, Lipoproteine, Hormone und CO₂ (überwiegend als Bicarbonat); seine strohgelbe Farbe stammt großteils von Bilirubin und Carotinoiden. Der Register-Vorbehalt: Serum ist kein Synonym — Serum ist Plasma ohne Fibrinogen und die verbrauchten Gerinnungsfaktoren, also die nach der Gerinnung verbleibende Flüssigkeit; deshalb unterscheidet die klinische Chemie Serumröhrchen von antikoagulierten (EDTA-/Heparin-/Citrat-)Plasmaröhrchen. Eine zweite Vereinfachung gehört benannt: Plasma lässt sich nicht wie Zellen abbilden — jedes „Bild von Plasma“ ist entweder eine makroskopische Fotografie der Flüssigkeit oder eine molekulare Strukturvisualisierung ihrer gelösten Stoffe, nie eine Mikroskopaufnahme.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean textbook illustration of the classic separated-blood column: a single tall, slim, upright transparent test tube of settled blood, centered in a square 1:1 1080x1080 frame with generous empty margin left and right for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each layer its own distinct soft colour fill. The tube's glass is perfectly smooth, plain and unmarked — a clean, featureless transparent cylinder with a rounded bottom. Inside, exactly three horizontal layers: the upper 55 percent of the column is luminous, translucent STRAW-YELLOW blood plasma, clear amber liquid, completely uniform and cell-free — this golden layer is the hero of the figure, softly glowing; beneath it a very thin, crisp cream-white band (the buffy coat of white cells and platelets); and the lower 45 percent a dense, opaque, deep brick-red column of packed red cells with a flat, sharp interface. The amber plasma layer reads brighter and more luminous than everything else. Single specimen, anatomically faithful proportions (plasma slightly more than half the column). Absolutely NO text, letters, numbers, percent signs, graduation marks, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-colour molecular-surface visualization, styled like an electron-microscope plate, showing the dissolved proteins of blood plasma drifting free in open fluid, filling a square 1:1 1080x1080 frame edge-to-edge with a dark charcoal background. Crisp 3D molecular surface texture with fine granular detail, shallow depth of field, cool studio microscopy lighting, golden-amber false-colour palette over the whole scene (the amber of the straw-yellow fluid). Three kinds of molecule float dispersed and well separated, each its own false-colour tint: many SMALL, compact, smooth rounded albumin blobs (the most numerous, pale warm gold); a few Y-SHAPED antibody molecules, each a clear three-armed Y of lumpy protein domains (soft slate-blue tint), a little larger than the albumin blobs; and two or three LONG, slender fibrinogen rods, each rod built of THREE bead-like nodes in a row — a larger bead at each end and a smaller bead in the middle, connected by thin straight stalks — clearly the longest objects in view, about three times the span of an antibody (muted dusty-rose tint). All molecules drift at scattered depths, some sharply focused near the centre, others softly blurred; the empty amber-dark fluid between them dominates the frame. Every object is a bare molecule: smooth protein surfaces only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still: a molecular-scale view INSIDE blood plasma, deep in a warm, translucent, golden-amber watery fluid that fills the entire square 1:1 1080x1080 frame edge-to-edge — the luminous amber liquid itself is the subject and dominates the scene, glowing with soft volumetric light shafts from the upper left. Soft global illumination, subsurface scattering, scientific-animation look with natural believable biological tints. Drifting dissolved in the fluid, well separated with generous amber space between them: many SMALL smooth rounded albumin proteins (compact glossy blobs, pale cream-gold); several Y-SHAPED antibody molecules, each an elegant three-armed Y of soft lobed protein domains (gentle slate-blue), slightly larger than the albumin blobs; and two or three LONG slender fibrinogen molecules, each a straight rod of THREE beads — a larger bead at each end, a smaller bead in the middle, joined by thin stalks — the longest molecules in view, about three times the span of an antibody (muted dusty-rose). Far away in the deep background, two huge, heavily blurred, soft crimson disc shapes — red blood cells at their true vastly larger scale — drift out of focus as passengers in the flow, faint and atmospheric, occupying only the distant backdrop. Everything in the fluid is a bare molecule with a smooth protein surface. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted watercolour naturalist plate in the style of a 19th-century scientific atlas, anatomically modern and correct: a molecular-scale view into blood plasma. The warm aged paper FILLS THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background, with soft foxing and warm cream tone reaching every corner. Across the middle of the plate floats a large, luminous, translucent GOLDEN-AMBER watercolour wash — the straw-yellow plasma fluid itself, the hero of the plate, painted as soft layered translucent amber washes with delicate wet edges, a soft darker wash halo directly on the paper behind it. Drifting inside the amber fluid, painted with fine ink outlines and soft washes, well separated: many SMALL rounded albumin proteins (compact cream-gold blobs, the most numerous); several Y-SHAPED antibody molecules, each a dainty three-armed Y of lobed domains (muted slate-blue wash); and two or three LONG slender fibrinogen molecules, each a straight rod of THREE beads — a larger bead at each end and a smaller central bead joined by thin stalks — the longest shapes in the fluid, about three times an antibody's span (dusty-rose wash). Near one edge of the amber field, two soft, pale crimson biconcave discs — red blood cells as passengers — painted small, faint and peripheral so the golden fluid stays dominant. Rich translucent washes, fine ink linework, aged-paper warmth. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 3 attempt(s), 5268 tok, $0.121
- attempt 1 · `gemini-2.5-flash-image` · 4.6s — fail (gemini-2.5-flash-image; layer proportions inverted — plasma band measured 257 px vs red column 335 px, i.e. plasma ~43 % of the liquid instead of ~55 % — and no visible buffy coat; superseded)
  ![textbook 1](theme/textbook/blood-plasma.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.0s — fail (gemini-2.5-flash-image; buffy coat band now present but proportions still inverted — plasma 257 px vs red 335 px measured down the centre column; superseded)
  ![textbook 2](theme/textbook/blood-plasma.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 19.1s — pass (gemini-3-pro-image; measured down the centre column: plasma 428 px / buffy coat 23 px / red 281 px = plasma ~58 % of the liquid column (target ~55 %, slightly plasma-heavy but correct ordering), crisp thin cream buffy band, clean unmarked glass confirmed in a 2x magnified crop — no letters, numbers or graduation marks — edge rows uniform charcoal ~76-80 grey so no border/frame)
  ![textbook 3](theme/textbook/blood-plasma.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/blood-plasma.textbook.svg)
[interactive SVG](theme/textbook/blood-plasma.textbook.svg) · [HTML](theme/textbook/blood-plasma.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1599 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 5.4s — pass (gemini-2.5-flash-image; golden false-colour molecular scene on dark ground: 3 in-focus fibrinogen rods each verified in magnified crops to carry exactly 3 nodes (larger ends, smaller centre), ~6 antibodies all 3-armed Ys, no baked text found in 4 magnified crops. Compromises: albumin rendered as 3-4-lobed clusters — trilobed is defensible as albumin's three homologous domains, but the central cluster is 4-lobed and disproportionately large, reading almost staphylococcus-like; two far-background rods are too blurred to count nodes; and the whole image is a molecular visualization in SEM styling, since a real SEM of a liquid is impossible)
  ![sem 1](theme/sem/blood-plasma.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3238 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 6.4s — fail (gemini-2.5-flash-image; antibodies rendered as 4-armed X shapes — counted 4 arms on both large molecules — and fibrinogen as 5 beads threaded on a skewer with stick ends protruding; superseded)
  ![3d 1](theme/3d/blood-plasma.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 5.7s — pass (gemini-2.5-flash-image; counted 5 antibodies, every one a 3-armed Y; both fibrinogen rods verified in a 2x magnified crop to have exactly 3 beads (larger ends, smaller centre) with no protruding stick; amber fluid dominates the full-bleed frame with 2 heavily blurred crimson discs as background passengers; no text in crops. Compromise: the fluid reads warm orange-amber rather than pale straw-yellow)
  ![3d 2](theme/3d/blood-plasma.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/blood-plasma.3d.svg)
[interactive SVG](theme/3d/blood-plasma.3d.svg) · [HTML](theme/3d/blood-plasma.3d.html)

### Watercolor plate (`watercolor`) — 3 attempt(s), 5425 tok, $0.123
- attempt 1 · `gemini-2.5-flash-image` · 5.8s — fail (gemini-2.5-flash-image; one antibody a 4-armed X, and the fibrinogen rods carry 5 nodes (2 end beads + 3 central beads); superseded)
  ![watercolor 1](theme/watercolor/blood-plasma.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.3s — fail (gemini-2.5-flash-image; antibodies now 3-armed but both fibrinogen rods lost the central node — plain 2-bead dumbbells counted in the full frame; superseded)
  ![watercolor 2](theme/watercolor/blood-plasma.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 20.4s — pass (gemini-3-pro-image; 4 fibrinogen rods each verified at 2x magnification to carry exactly 3 nodes; 6 antibodies all classic 3-armed IgG Ys with double-stroke heavy/light-chain linework; aged paper reaches all four corners (no sheet-on-surface); amber wash dominates; 2 pale crimson biconcave discs bottom-right as small peripheral passengers; no text found in magnified crops)
  ![watercolor 3](theme/watercolor/blood-plasma.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/blood-plasma.watercolor.svg)
[interactive SVG](theme/watercolor/blood-plasma.watercolor.svg) · [HTML](theme/watercolor/blood-plasma.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `macroscopic photograph (settled blood, plasma layer on top)` · CC0 1.0 · John Campbell, via Flickr/Wikimedia Commons — pass (Wikimedia Commons 'Cells and plasma (44258664600).jpg', John Campbell, CC0 1.0 — a MACROSCOPIC PHOTOGRAPH, not microscopy (none exists for a liquid): settled anticoagulated blood in a syringe with the straw-yellow plasma layer clearly on top of the dark-red cell column, verified by viewing. Original carries printed Cyrillic 'гепарин' lettering + ml graduations, so a cleaned real-02 was produced with edit_image.py; diff vs original: global mean abs pixel diff 6.08, concentrated in the text zone (8.9) with plasma/red/wall regions at 2.6-4.4 — text removed, layers and colours preserved, no re-illustration)
  ![reference](../reference-microscopy/theme/photo/blood-plasma.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 3 | use as final; correct 55/45-ish layer ordering (measured plasma ~58 % of liquid column) with visible buffy coat only after escalation to gemini-3-pro-image; 2 flash attempts had inverted proportions |
| sem | pass | 1 | use as final with flagged compromises: honest molecular visualization in SEM styling (a liquid has no SEM), albumin as 3-4-lobed domain clusters with one oversized 4-lobed cluster |
| 3d | pass | 2 | use as final; attempt 1 had X-shaped antibodies and 5-bead fibrinogen, fixed by naming the Y geometry and the 3-bead rod positively; fluid warmer-orange than straw-yellow, accepted |
| watercolor | pass | 3 | use as final; flash twice miscounted fibrinogen nodes (5 then 2), correct trinodular rods and IgG Ys after escalation to gemini-3-pro-image |
