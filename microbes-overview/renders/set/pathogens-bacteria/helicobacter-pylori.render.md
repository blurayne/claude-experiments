# Helicobacter pylori — render log

**Set:** `pathogens-bacteria` · **Microbe key:** `helicobacter-pylori`
**Short description:** Spiral, flagellated Gram-negative bacterium that colonises the stomach mucus layer; survives gastric acid via urease and causes gastritis, peptic ulcers and raises stomach-cancer risk.

Metadata sidecar: [`helicobacter-pylori.render.meta.json`](helicobacter-pylori.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Helicobacter pylori* is a small helical (spiral / corkscrew) Gram-negative bacterium, roughly 2.5–5 µm long and 0.5–1 µm wide, usually showing two to three gentle helical turns with rounded ends. Its defining locomotor feature is a **unipolar (lophotrichous) tuft of 2–7 sheathed flagella** at one pole: each flagellum is wrapped in a membrane sheath continuous with the outer membrane and tipped by a small terminal bulb, an unusual arrangement that protects the flagellar motor in acid. The corkscrew shape plus these flagella let it drill through the viscous gastric mucus to reach the epithelial surface. Like other Gram-negatives it has a three-layer envelope (outer membrane with lipopolysaccharide, a thin peptidoglycan cell wall, and an inner plasma membrane) enclosing cytoplasm, a diffuse condensed nucleoid and abundant 70S ribosomes. It secretes copious **urease**, which splits urea into ammonia to buffer the acid in its microenvironment — a function, not a drawable organelle. Under stress the spiral cell can round up into a dormant **coccoid** form, but the teaching form is the motile spiral.

Sources: [NCBI *Medical Microbiology* (Baron), Ch. 23 — *Helicobacter*](https://www.ncbi.nlm.nih.gov/books/NBK8571/), [StatPearls — *Helicobacter Pylori*](https://www.ncbi.nlm.nih.gov/books/NBK534233/), [Kusters et al., *Pathogenesis of Helicobacter pylori Infection*, Clin Microbiol Rev (PMC1592694)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1592694/), [Wikipedia — *Helicobacter pylori*](https://en.wikipedia.org/wiki/Helicobacter_pylori).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `helical_body` | corpus helicoidale | Helical cell body | Spiralförmiger Zellkörper | corkscrew shape drills through gastric mucus | whole cell | core |
| `outer_membrane` | membrana externa | Outer membrane | Äußere Membran | LPS membrane, extra Gram-negative barrier | outside wall | core (Gram-neg) |
| `cell_wall` | paries cellularis (peptidoglycanum) | Cell wall | Zellwand | thin peptidoglycan mesh: shape, resists turgor | outer boundary | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zytoplasmamembran | transport, energy/respiration | innermost boundary | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior | core |
| `nucleoid` | nucleoides | Nucleoid | Nukleoid | circular chromosome; essential genes | central, diffuse | core |
| `ribosome` | ribosoma (70S) | Ribosomes | Ribosomen | protein synthesis | dispersed dots | core |
| `flagellum` | flagellum | Flagellum | Geißel | rotary propeller for swimming through mucus | ONE pole only, tuft of 2–7 | core |
| `flagellar_sheath` | vagina flagellaris | Flagellar sheath | Geißelscheide | membrane sleeve over each flagellum, protects motor in acid | on the flagella | core (distinctive) |

### Do NOT draw (scientifically misleading)
- **Straight rod** — *H. pylori* is helical/spiral; a straight bacillus is wrong.
- **Peritrichous flagella** all over the body — flagella are a **single unipolar tuft** only.
- **Bare unsheathed flagella** — each flagellum carries a **membrane sheath** with a terminal bulb.
- **Mesosome** — EM fixation artifact, not real.
- Nucleoid as a tidy free-floating loop — it is a **diffuse condensed tangle**.
- Over-large / too-orderly ribosomes — they are tiny, numerous, random.
- Any **membrane-bound organelles** (no nucleus/mitochondria/ER/Golgi).
- **Gram-positive thick wall** or mixed envelope — it is Gram-negative (thin wall, outer membrane).
- Prominent thick capsule — glycocalyx is thin; keep it subtle/optional, not a bold halo.
- The **coccoid** ball form — use the motile spiral teaching form.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL public-domain SEM** (Photo Credit Janice Carr; CDC / Dr. Patricia Fields, Dr. Collette Fitzgerald) of a grouping of spiral, flagellated *Helicobacter*-genus bacteria.
- file: https://upload.wikimedia.org/wikipedia/commons/e/e4/Hpylori.jpg
- page: https://commons.wikimedia.org/wiki/File:Hpylori.jpg · License: **Public Domain (CDC PHIL)** · CDC / Dr. Patricia Fields, Dr. Collette Fitzgerald; photo credit Janice Carr
- backups: `HelicobacterPylori2.jpg` (same CDC SEM, PD); `Helicobacter pylori.jpg` (Warthin–Starry light micrograph, PD, low-res 138×200); `Histopathology of helicobacter pylori (annotated).jpg` (CC0 H&E, has baked annotation). NB: the best true-species EM (`EMpylori.jpg`, Tsutsumi) is tagged "Copyrighted free use", which is outside the PD/CC0/CC-BY/CC-BY-SA whitelist, so it was not used.
- Caveat: CDC catalogues this SEM under *Helicobacter pylori*, though the specimen was originally labelled the provisional "*Flexispira rappini*", a close *Helicobacter*-genus relative. It clearly shows the teaching-relevant morphology — the helical/spiral cell shape and polar flagella — so it serves as a faithful spiral-*Helicobacter* reference. See §5 for the AI-verification verdict.

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Helicobacter pylori, a wiggly little spring-shaped germ that does something amazing: it lives in your stomach, where the acid is strong enough to dissolve food! It wears a tiny bundle of whip-like tails at one end and spins them like a drill to burrow into the slimy mucus lining. To survive the acid it puffs out a cloud of ammonia that fizzes the acid away, like a bubble of protection. Trouble is, this troublemaker can make your tummy sore and give you ulcers. The good news: a doctor can clear it out with a short course of antibiotics teamed up with a pill that turns the stomach acid down.  
🇩🇪 Das ist Helicobacter pylori, ein zappeliger, spiralförmiger Keim, der etwas Erstaunliches kann: Er lebt in deinem Magen, wo die Säure stark genug ist, um Essen aufzulösen! An einem Ende trägt er ein Büschel peitschenartiger Schwänzchen und dreht sie wie einen Bohrer, um sich in die schleimige Magenwand zu wühlen. Gegen die Säure pustet er eine Wolke aus Ammoniak aus, die die Säure wegblubbert, wie eine Schutzblase. Blöd nur: Dieser Störenfried kann deinen Bauch wehtun lassen und Geschwüre machen. Die gute Nachricht: Ein Arzt kann ihn mit einer kurzen Antibiotika-Kur loswerden, zusammen mit einer Tablette, die die Magensäure herunterdreht.

**Adults (popular science, health).**  
🇬🇧 Helicobacter pylori is one of humanity's most common chronic infections, quietly colonising the stomach lining of roughly half the world's population, usually acquired in childhood. Most carriers never notice it, but in a sizeable minority it drives chronic gastritis, peptic ulcers of the stomach and duodenum, and over decades it is a leading risk factor for stomach cancer and a rare lymphoma called MALT lymphoma. Its trick is survival in acid: a corkscrew body and sheathed polar flagella let it swim into the protective mucus, while the enzyme urease neutralises acid in its immediate surroundings. Diagnosis is straightforward via a breath test, stool antigen or biopsy, and standard treatment pairs two or three antibiotics with an acid-suppressing proton-pump inhibitor for one to two weeks, though rising antibiotic resistance increasingly guides tailored regimens.  
🇩🇪 Helicobacter pylori zählt zu den häufigsten chronischen Infektionen des Menschen und besiedelt still die Magenschleimhaut von rund der Hälfte der Weltbevölkerung, meist bereits in der Kindheit erworben. Die meisten Träger merken nichts davon, doch bei einer beträchtlichen Minderheit löst er eine chronische Gastritis sowie Magen- und Zwölffingerdarmgeschwüre aus und ist über Jahrzehnte ein führender Risikofaktor für Magenkrebs und ein seltenes Lymphom, das MALT-Lymphom. Sein Kunststück ist das Überleben in Säure: Ein korkenzieherförmiger Körper und ummantelte polare Geißeln lassen ihn in den schützenden Schleim schwimmen, während das Enzym Urease die Säure in seiner unmittelbaren Umgebung neutralisiert. Die Diagnose gelingt einfach per Atemtest, Stuhlantigen oder Biopsie, und die Standardbehandlung kombiniert zwei bis drei Antibiotika mit einem säurehemmenden Protonenpumpenhemmer über ein bis zwei Wochen, wobei zunehmende Antibiotikaresistenzen immer öfter maßgeschneiderte Therapien nötig machen.

**Scientific.**  
🇬🇧 Helicobacter pylori is a microaerophilic, Gram-negative, spiral bacterium of the Epsilonproteobacteria, typically 2.5–5 µm long with two to three helical turns and a unipolar tuft of two to seven sheathed flagella. Colonisation of the gastric mucosa depends on motility through mucus and on urease, which hydrolyses urea to ammonia and carbon dioxide to buffer periplasmic and local pH; adhesins such as BabA and SabA anchor the cell to gastric epithelium. Pathogenicity is strongly modulated by the cag pathogenicity island, whose type IV secretion system injects the effector protein CagA, and by the vacuolating cytotoxin VacA, driving inflammation, epithelial damage and, in a subset, carcinogenesis (WHO Group 1 carcinogen). The organism can convert to a viable-but-nonculturable coccoid form under stress. Clinical eradication uses combination antibiotic regimens with a proton-pump inhibitor, increasingly guided by clarithromycin-resistance testing.  
🇩🇪 Helicobacter pylori ist ein mikroaerophiles, gramnegatives, spiralförmiges Bakterium aus der Klasse der Epsilonproteobakterien, typischerweise 2,5–5 µm lang mit zwei bis drei Windungen und einem unipolaren Büschel aus zwei bis sieben ummantelten Geißeln. Die Besiedlung der Magenschleimhaut beruht auf der Beweglichkeit durch den Schleim und auf der Urease, die Harnstoff zu Ammoniak und Kohlendioxid spaltet und so den periplasmatischen und lokalen pH-Wert puffert; Adhäsine wie BabA und SabA verankern die Zelle am Magenepithel. Die Pathogenität wird stark durch die cag-Pathogenitätsinsel bestimmt, deren Typ-IV-Sekretionssystem das Effektorprotein CagA einschleust, sowie durch das vakuolisierende Zytotoxin VacA, was Entzündung, Epithelschäden und in einem Teil der Fälle Karzinogenese antreibt (WHO-Gruppe-1-Karzinogen). Unter Stress kann der Erreger in eine lebende, aber nicht kultivierbare kokkoide Form übergehen. Die klinische Eradikation erfolgt mit Antibiotika-Kombinationen plus einem Protonenpumpenhemmer, zunehmend gesteuert durch Testung auf Clarithromycin-Resistenz.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE Helicobacter pylori bacterium, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Semi-flat vector-style shading with crisp clean boundaries, a MUTED desaturated educational palette (soft dusty tints, thin clean outlines, gentle soft shading, subtle dimensionality) on a neutral dark charcoal background; never bright primary/cartoon colours and never heavy black strokes. The cell body is a distinct HELICAL, spiral corkscrew shape with 2 to 3 gentle turns and rounded ends, several times longer than wide. At ONE pole only, a tuft of 3 to 5 sheathed flagella (lophotrichous), each flagellum wrapped in a smooth membrane sheath ending in a small terminal bulb. A neat quarter cut-away reveals the interior: pale cytoplasm, a diffuse condensed nucleoid drawn as a soft irregular tangle (NOT a tidy free-floating DNA loop), and tiny numerous randomly dispersed ribosome dots. The Gram-negative envelope shows three distinct thin layers: an outer membrane, a thin peptidoglycan cell wall, and an inner plasma membrane, each its own soft colour fill. Do NOT draw a mesosome, no membrane-bound organelles, no straight rod shape, and no flagella scattered over the body (only the single polar tuft). Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image, and fill the whole square edge-to-edge with no border, frame or vignette.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE Helicobacter pylori bacterium, centered in a square 1:1 1080x1080 frame with generous empty margin around it. The cell is a smooth HELICAL, spiral corkscrew rod with 2 to 3 turns and gently rounded ends, lying at a relaxed three-quarter angle, rendered with true 3D surface texture, fine turgid curvature and shallow depth of field over a subtly textured neutral substrate. At ONE pole only, a tuft of 3 to 5 long whip-like sheathed flagella streaming off. False-color palette: a warm salmon-to-orange bacterial cell against a dark, uncluttered charcoal background. SEM shows the surface only, so render NO internal structures, and NO flagella scattered over the body (only the polar tuft). Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image, and fill the whole square edge-to-edge with no border, frame or vignette.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE Helicobacter pylori bacterium, centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, subsurface scattering on the membranes, and a clean seamless dark studio background. The cell body is a believable, idealized-for-clarity HELICAL, spiral corkscrew shape with 2 to 3 turns and rounded ends. At ONE pole only, a tuft of 3 to 5 sheathed flagella, each wrapped in a smooth membrane sheath ending in a small terminal bulb. Use a gentle cut-away or partial translucency to hint at the interior: soft cytoplasm, a diffuse condensed nucleoid as an irregular tangle (NOT a tidy DNA ring), and tiny numerous randomly scattered ribosomes. The Gram-negative envelope reads as three distinct layers: outer membrane, thin peptidoglycan wall, inner plasma membrane. Colorize with natural, believable biological tones so the structures are clearly distinguishable: a warm translucent teal-to-jade cell body with distinct tints for the wall, membrane and nucleoid, not near-monochrome and not neon. Do NOT render a mesosome or membrane-bound organelles, no straight rod, and no flagella scattered over the body. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image, and fill the whole square edge-to-edge with no border, frame or vignette.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist watercolour scientific plate of a SINGLE Helicobacter pylori bacterium in the style of a 19th-century atlas, anatomically modern and correct, the subject large and centered in a square 1:1 1080x1080 frame. Soft translucent watercolour washes with fine ink linework for the outlines. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT paint the artwork as a separate sheet, card or page lying on a table or surface, and NO mat, border, frame, drop-shadow or grey/dark panel around a sheet. A soft darker wash halo sits directly on the paper behind the subject. The cell body is a HELICAL, spiral corkscrew shape with 2 to 3 gentle turns and rounded ends. At ONE pole only, a tuft of 3 to 5 sheathed flagella trailing off. A soft painterly cut-away hints at the interior: washed cytoplasm, a diffuse condensed nucleoid painted as a loose irregular tangle (NOT a tidy loop), and tiny scattered ribosome specks. The envelope shows three distinct Gram-negative layers: outer membrane, thin peptidoglycan wall, inner plasma membrane. Do NOT paint a mesosome or membrane-bound organelles, no straight rod, and no flagella scattered over the body. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 5 attempt(s), 9912 tok, $0.214
- attempt 1 · `gemini-2.5-flash-image` · 13.9s — reject: correct spiral shape and polar flagella tuft, but flat cartoon-ish shading, thicker outlines and simpler palette than rod-bacterium exemplar
  ![textbook 1](theme/textbook/helicobacter-pylori.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 11.0s — reject: improved but still a bit flat/cartoonish, envelope layers not clearly separated
  ![textbook 2](theme/textbook/helicobacter-pylori.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 24.2s — reject: good structure but colour palette too warm/orange, envelope layering not crisp
  ![textbook 3](theme/textbook/helicobacter-pylori.attempts/gen-03__gemini-3-pro-image.avif)
- attempt 4 · `gemini-3-pro-image` · 35.8s — reject: strong render, but nucleoid drawn slightly too tidy/loop-like and palette a touch saturated
  ![textbook 4](theme/textbook/helicobacter-pylori.attempts/gen-04__gemini-3-pro-image.avif)
- attempt 5 · `gemini-3-pro-image` · 25.4s — accept: refined muted cutaway matching rod-bacterium/parasite look, correct helical body, unipolar sheathed flagellar tuft with terminal bulbs, three distinct Gram-negative envelope layers, diffuse tangled nucleoid, scattered ribosome dots, no text/border/vignette
  ![textbook 5](theme/textbook/helicobacter-pylori.attempts/gen-05__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/helicobacter-pylori.textbook.svg)
[interactive SVG](theme/textbook/helicobacter-pylori.textbook.svg) · [HTML](theme/textbook/helicobacter-pylori.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1518 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 19.8s — accept: photorealistic false-colour salmon/orange helical rod with 2-3 turns and rounded ends, unipolar tuft of whip-like flagella, surface-only detail (no interior), dark uncluttered background, no text/scale bar/border
  ![sem 1](theme/sem/helicobacter-pylori.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1601 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.0s — accept: believable teal/orange 3D medical-illustration style, correct helical corkscrew body with 2-3 turns, unipolar tuft of sheathed flagella with terminal bulbs, gentle cutaway showing translucent cytoplasm, tangled nucleoid and scattered ribosomes, no text/border/vignette, full-bleed dark studio background
  ![3d 1](theme/3d/helicobacter-pylori.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/helicobacter-pylori.3d.svg)
[interactive SVG](theme/3d/helicobacter-pylori.3d.svg) · [HTML](theme/3d/helicobacter-pylori.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 4057 tok, $0.083
- attempt 1 · `gemini-3-pro-image` · 38.1s — reject: nice hand-painted look and correct helical anatomy, but the coil reads slightly too tight/ring-like and the cutaway window is small
  ![watercolor 1](theme/watercolor/helicobacter-pylori.attempts/gen-01__gemini-3-pro-image.avif)
- attempt 2 · `gemini-3-pro-image` · 51.4s — accept: full-bleed warm aged paper matching cocci/rod exemplars (paper fills frame, no sheet-on-surface), correct helical corkscrew body with 2-3 turns, unipolar sheathed flagellar tuft trailing off, soft painterly cutaway revealing washed cytoplasm, loose irregular nucleoid tangle and scattered ribosome specks, three envelope layers visible, no text/border
  ![watercolor 2](theme/watercolor/helicobacter-pylori.attempts/gen-02__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/helicobacter-pylori.watercolor.svg)
[interactive SVG](theme/watercolor/helicobacter-pylori.watercolor.svg) · [HTML](theme/watercolor/helicobacter-pylori.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public Domain (CDC PHIL) · CDC / Dr. Patricia Fields, Dr. Collette Fitzgerald; photo credit Janice Carr — accept: CDC PHIL public-domain SEM of a grouping of spiral, flagellated Helicobacter-genus bacteria (real-01); cleaned of any residual artefacts via edit pass (real-02) — clear helical morphology and polar flagella, no baked text/scale bar/border, greyscale converted to false-colour salmon/orange
  ![reference](theme/sem/helicobacter-pylori.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | accept | 5 | gen-05__gemini-3-pro-image — refined muted cutaway, matches rod-bacterium/parasite exemplar style; used as base for labels.json and RENDER-STATUS svg_theme |
| 3d | accept | 1 | gen-01__gemini-2.5-flash-image — first attempt already natural, anatomically faithful, no re-render needed |
| sem | accept | 1 | gen-01__gemini-2.5-flash-image — first attempt already photorealistic false-colour surface-only SEM, no re-render needed |
| watercolor | accept | 2 | gen-02__gemini-3-pro-image — full-bleed aged-paper look with clearer cutaway than attempt 1 |
