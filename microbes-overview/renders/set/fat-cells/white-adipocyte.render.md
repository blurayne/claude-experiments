# White adipocyte — render log

**Set:** `fat-cells` · **Microbe key:** `white-adipocyte`
**Short description:** Classic fat cell: a single huge lipid droplet pushes the nucleus and cytoplasm to the rim. Stores energy for lean times. Stimulated by insulin to take up fat. Releases leptin, which tells the brain about energy stores.

Metadata sidecar: [`white-adipocyte.render.meta.json`](white-adipocyte.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The white adipocyte (white fat cell) is the classic energy-storage cell of adipose tissue: a large, round-to-polygonal animal cell, typically 50–150 µm in diameter (commonly cited up to ~100 µm), dominated by a **single, huge, unilocular lipid droplet** that can occupy roughly 85–90% of the cell's volume. Because this one droplet balloons to fill almost the whole cell, it squeezes the nucleus and nearly all the cytoplasm into a **thin peripheral rim**, flattening the nucleus into a crescent sandwiched between the droplet and the plasma membrane — the classic "signet-ring" appearance seen in histology sections (where the lipid itself is dissolved out during standard paraffin processing, leaving the cell looking empty/white). Unlike a conventional membrane-bound organelle, the lipid droplet is not wrapped in a phospholipid bilayer but by a **phospholipid monolayer** (~5 nm thick, derived from the ER membrane), coated by a layer of **perilipin 1**, the signature lipid-droplet surface protein that shields stored triglyceride from lipases at rest and, when phosphorylated by protein kinase A after catecholamine/β-adrenergic stimulation, opens the droplet to lipolytic enzymes (hormone-sensitive lipase, adipose triglyceride lipase). The droplet–cytoplasm interface is reinforced by a network of **vimentin intermediate filaments**. The thin submembranous cytoplasmic rim contains a comparatively **small number of small, elongated mitochondria** with sparse, randomly oriented cristae (far fewer and smaller than in a brown adipocyte), a small **Golgi apparatus** and a modest amount of **rough endoplasmic reticulum** clustered near the nucleus, plus free polyribosomes and scattered smooth ER. The **plasma membrane** is rich in **caveolae** — flask-shaped invaginations that mediate cholesterol traffic (fat depots store roughly a quarter of the body's cholesterol, much of it in the lipid-droplet membrane) and endocytic/insulin-signalling activity, including surface trafficking of the insulin-responsive glucose transporter **GLUT4** that lets the cell take up glucose (for glycerol-3-phosphate/triglyceride synthesis) after an insulin pulse. Each individual adipocyte is wrapped in its own thin **basal (external) lamina**, and in tissue, white adipocytes sit adjacent to a capillary network that delivers substrate/oxygen and carries away secreted hormones. Functionally, the white adipocyte is both the body's principal energy reservoir (storing surplus calories as triglyceride and releasing free fatty acids/glycerol during fasting) and an active endocrine cell: it secretes **leptin**, which signals the hypothalamus about the size of the body's fat stores and suppresses appetite, along with adiponectin, resistin and other adipokines that influence whole-body insulin sensitivity and inflammation.

Sources: [Wikipedia — Adipocyte](https://en.wikipedia.org/wiki/Adipocyte), [Wikipedia — White adipose tissue](https://en.wikipedia.org/wiki/White_adipose_tissue), [Cinti 2012, The adipose organ at a glance, Disease Models & Mechanisms (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3424455/), [Pathology Outlines — Histology, brown and white adipose tissue](https://www.pathologyoutlines.com/topic/softtissueadiposewhitefat.html), [Kenhub — Adipose tissue: Definition, location, function](https://www.kenhub.com/en/library/anatomy/adipose-tissue).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; flattened into a thin crescent by the droplet | pushed to the periphery, sandwiched between droplet and membrane | core |
| `lipid_droplet` | gutta adiposa (unilocularis) | Lipid droplet (unilocular) | Lipidtropfen (unilokulär) | single giant triglyceride store, ~85–90% of cell volume; monolayer-bounded, not a true organelle | fills almost the whole cell | core |
| `perilipin_coat` | tunica perilipinica | Perilipin coat | Perilipin-Hülle | protein coat on the droplet surface; gatekeeps lipase access, regulates lipolysis | wrapping the lipid droplet | core |
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | outer boundary; carries insulin-responsive GLUT4 glucose transporter | outermost | core |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | thin rim housing the remaining organelles | thin peripheral rim around droplet & nucleus | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production; few, small, sparse cristae (unlike the many large mitochondria of brown fat) | scattered in the thin cytoplasmic rim | core |
| `caveolae` | caveolae | Caveolae | Caveolen | membrane pits for cholesterol traffic and insulin/GLUT4 signalling | dotted along the plasma membrane | minor |
| `golgi` | apparatus Golgiensis | Golgi apparatus | Golgi-Apparat | packages secreted proteins (e.g. adipokines) | near the nucleus | minor |
| `rough_er` | reticulum endoplasmaticum granulosum | Rough endoplasmic reticulum | Raues endoplasmatisches Retikulum | modest protein-synthesis machinery | near the nucleus | minor |
| `basal_lamina` | lamina externa (basalis) | Basal lamina | Basallamina | thin external sheath wrapping each individual adipocyte | just outside the plasma membrane | minor |
| `capillary` | vas capillare | Capillary | Kapillare | delivers substrate/oxygen, carries off secreted leptin/adipokines | adjacent to the cell, in the tissue | context (do not draw inside the cell) |

### Do NOT draw (scientifically misleading)
- **No multiple small lipid droplets (multilocular foam)** — that is the signature of *brown/beige* fat; the defining feature of white fat is **one single giant droplet**.
- **No round, central nucleus** — it must be flattened into a thin crescent and pushed to the cell's rim by the droplet, not sitting in the middle.
- **No abundant large mitochondria packed with dense cristae** — that is a brown-fat feature; white-fat mitochondria are few, small and sparse.
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is an animal cell, not a prokaryote.
- **No chloroplasts, no true membrane-bound central vacuole** — plant-cell features; the lipid droplet is monolayer-bounded, not a vacuole.
- **No thick, generously proportioned cytoplasm** — it must read as a thin peripheral rim, since the droplet dominates the cell.
- **No cilia or flagella for locomotion** — adipocytes are stationary tissue cells.
- **Capillaries, if shown at all, stay OUTSIDE the cell body** (context in the surrounding tissue), never inside the cytoplasm.
- A single specimen (or, for tissue-context styles, a small readable cluster) — not a dense, unreadable confluent sheet where the signet-ring shape of individual cells can't be told apart.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Yellow adipose tissue in paraffin section - lipids washed out.jpg"**, a genuine light micrograph (H&E-type paraffin section) of human white/yellow adipose tissue, showing the classic polygonal "chicken-wire" field of adipocytes: each cell's dissolved-out lipid droplet leaves an empty-looking polygon bounded by a thin cell membrane/wall, with thin fibrous connective-tissue septa and small vessel profiles running between the cells — the textbook signet-ring/chicken-wire pattern of white adipose histology.
- file: https://upload.wikimedia.org/wikipedia/commons/2/27/Yellow_adipose_tissue_in_paraffin_section_-_lipids_washed_out.jpg
- page: https://commons.wikimedia.org/wiki/File:Yellow_adipose_tissue_in_paraffin_section_-_lipids_washed_out.jpg · License: **CC BY-SA 3.0** (also GFDL) · Attribution: Department of Histology, Jagiellonian University Medical College (Wikimedia Commons category confirms "Human histology"); uploader-attributed
AI visual verification result: **PASS (2026-08-15).** Real light micrograph (not an illustration/diagram) of a tissue field showing tightly packed polygonal adipocytes with the lipid dissolved out (pale/empty interiors) and thin pink-purple cell membranes forming the classic "chicken-wire" mesh, with a fibrous connective-tissue septum and small vessel/capillary profiles running diagonally through the field — matches white-adipose-tissue histology well; individual cell borders are clearly readable throughout. Caveat: individual nuclei are not obvious at this magnification/focal plane (common for this classic low-power view; the diagnostic feature here is the empty polygonal "chicken-wire" cell outlines themselves, which are the standard teaching view for white fat) and it is a tissue field of many cells rather than one isolated cell, which is normal/expected for adipose histology since white adipocytes are always densely packed in vivo. No baked-in scale bar or caption text is present in the frame itself. A cleaned, colour-enhanced version is produced with `edit_image.py` for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the White Adipocyte, the coziest storage cell in your body! Picture a fluffy round warehouse who always says "sure, I've got room for that" and then blows up one single giant balloon of stored fuel right in the middle of itself — so big that it squishes its own nucleus and the rest of its insides into a thin ring around the edge, like the jam squashed to the rim of a jelly donut. Whenever you eat a bit more than you need right now, insulin comes knocking, and the White Adipocyte happily tucks the extra energy away for later — ready for a rainy day or a long hike. And it isn't just a silent storage room, it's also a chatty pen pal: it writes little chemical letters called leptin and sends them all the way up to your brain to say "don't worry, we've got plenty saved up here," which helps your brain know when you're full.  
🇩🇪 Das ist der Weiße Adipozyt, die gemütlichste Vorratszelle deines Körpers! Stell dir ein rundes, flauschiges Lager vor, das immer sagt: „Klar, dafür ist noch Platz!“, und dann einen einzigen riesigen Ballon voller gespeicherter Energie mitten in sich aufbläst - so groß, dass er seinen eigenen Zellkern und den Rest seines Inneren zu einem dünnen Ring an den Rand quetscht, so wie die Marmelade eines Berliners an den Rand gedrückt wird. Wenn du mal ein bisschen mehr isst, als du gerade brauchst, klopft das Insulin an, und der Weiße Adipozyt verstaut die zusätzliche Energie gern für später - bereit für einen Regentag oder eine lange Wanderung. Und er ist nicht nur ein stiller Lagerraum, er ist auch ein plauderfreudiger Brieffreund: Er schreibt kleine chemische Briefe namens Leptin und schickt sie bis hinauf zu deinem Gehirn, um zu sagen: „Keine Sorge, hier ist noch reichlich gespeichert“ - das hilft deinem Gehirn zu wissen, wann du satt bist.

**Adults (popular science, health).**  
🇬🇧 The white adipocyte is the body's principal long-term energy reservoir: a single fat cell that can swell to store nearly all of its volume as one large droplet of triglyceride, leaving only a thin rim of cytoplasm and a flattened nucleus at its edge. Far from being an inert storage sac, white fat is now recognised as an active endocrine organ. It responds to insulin by pulling glucose and fatty acids in for storage after a meal, and during fasting or exercise it releases free fatty acids back into the bloodstream as fuel. It also secretes hormones of its own, most notably leptin, which travels to the brain to report how much energy is in reserve and helps regulate appetite and metabolism. How much white fat a person carries, and where it is distributed in the body, is closely tied to overall metabolic health, which is why researchers study adipocyte biology so closely in the context of diabetes and obesity.  
🇩🇪 Der weiße Adipozyt ist der wichtigste Langzeit-Energiespeicher des Körpers: eine einzelne Fettzelle, die anschwellen kann, bis sie fast ihr gesamtes Volumen als einen einzigen großen Tropfen Triglycerid speichert, sodass nur ein dünner Zytoplasmasaum und ein abgeflachter Zellkern am Rand übrig bleiben. Weit davon entfernt, ein reiner Vorratsbeutel zu sein, gilt weißes Fett heute als aktives Hormonorgan. Es reagiert auf Insulin, indem es nach einer Mahlzeit Glukose und Fettsäuren zur Speicherung aufnimmt, und beim Fasten oder bei Bewegung gibt es freie Fettsäuren wieder als Brennstoff ins Blut ab. Außerdem schüttet es eigene Hormone aus, allen voran Leptin, das zum Gehirn wandert und meldet, wie viel Energie noch in Reserve ist, und so Appetit und Stoffwechsel mitreguliert. Wie viel weißes Fett jemand hat und wo im Körper es verteilt ist, hängt eng mit der allgemeinen Stoffwechselgesundheit zusammen, weshalb die Adipozytenbiologie in der Diabetes- und Adipositasforschung so intensiv untersucht wird.

**Scientific.**  
🇬🇧 The white adipocyte is a large (~50–150 µm), unilocular lipid-storing cell whose single triglyceride droplet, bounded by a phospholipid monolayer and coated with perilipin 1, occupies up to ~90% of cell volume and displaces the nucleus and remaining organelles into a thin peripheral rim. Insulin signalling through the insulin receptor drives translocation of GLUT4 to the plasma membrane, promoting glucose uptake for glycerol-3-phosphate synthesis and triglyceride esterification (lipogenesis), while fasting/catecholamine signalling activates protein kinase A, which phosphorylates perilipin 1 and hormone-sensitive lipase to trigger lipolysis and release free fatty acids and glycerol. Beyond substrate storage, the white adipocyte functions as a major endocrine cell, secreting adipokines including leptin (which signals energy sufficiency to hypothalamic centres regulating appetite and energy expenditure), adiponectin (which enhances insulin sensitivity), and other cytokines that link adipose mass to systemic metabolic and inflammatory state. Plasma-membrane caveolae, rich in caveolin, mediate cholesterol trafficking and contribute to insulin-receptor and GLUT4 signalling at the cell surface.  
🇩🇪 Der weiße Adipozyt ist eine große (~50-150 µm), unilokuläre lipidspeichernde Zelle, deren einzelner Triglycerid-Tropfen - begrenzt von einer Phospholipid-Monoschicht und mit Perilipin 1 überzogen - bis zu ~90% des Zellvolumens einnimmt und den Zellkern sowie die übrigen Organellen in einen dünnen Randsaum verdrängt. Die Insulinsignalgebung über den Insulinrezeptor treibt die Translokation von GLUT4 an die Plasmamembran an und fördert so die Glukoseaufnahme für die Glycerin-3-phosphat-Synthese und die Triglycerid-Veresterung (Lipogenese), während beim Fasten oder unter Katecholaminwirkung die Proteinkinase A aktiviert wird, die Perilipin 1 und die hormonsensitive Lipase phosphoryliert und so die Lipolyse mit Freisetzung von freien Fettsäuren und Glycerin auslöst. Über die reine Substratspeicherung hinaus fungiert der weiße Adipozyt als bedeutende endokrine Zelle, die Adipokine wie Leptin (meldet Energiesuffizienz an hypothalamische Zentren, die Appetit und Energieverbrauch regulieren), Adiponectin (verbessert die Insulinsensitivität) und weitere Zytokine ausschüttet, die die Fettmasse mit dem systemischen Stoffwechsel- und Entzündungszustand verknüpfen. Caveolin-reiche Caveolen der Plasmamembran vermitteln den Cholesterintransport und tragen zur Insulinrezeptor- und GLUT4-Signalgebung an der Zelloberfläche bei.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human white adipocyte (fat cell), a large round-to-polygonal animal cell, centered in a square 1:1 1080x1080 frame with generous negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell's defining feature is a SINGLE HUGE pale creamy-yellow lipid droplet filling roughly 90% of the cell, pushing the nucleus and all other organelles into a very thin peripheral rim — the classic 'signet ring' shape. A neat quarter cut-away reveals: the giant unilocular lipid droplet (pale cream/yellow fill, with a thin darker perilipin coat line on its surface), a thin flattened crescent-shaped nucleus squeezed against the plasma membrane, a few small elongated mitochondria scattered in the thin cytoplasmic rim, a tiny Golgi apparatus and a small patch of rough endoplasmic reticulum near the nucleus, small caveolae pits dotting the inside of the plasma membrane, and a delicate basal lamina line just outside the plasma membrane. Anatomically faithful animal cell. Do NOT draw multiple small lipid droplets (that is brown fat, not white fat), do NOT draw a round central nucleus, do NOT draw abundant large mitochondria, do NOT draw a cell wall, nucleoid, plasmids, chloroplasts, a true membrane-bound central vacuole, flagella or cilia; this is NOT a bacterium and NOT a plant cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human white adipocyte (fat cell) sitting on a subtly textured substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell is a large, smoothly rounded, taut sphere-to-polygon shape, its surface gently bulging and stretched tight over the single giant lipid droplet packed inside — a smooth, softly domed, minimally-textured membrane surface (unlike a rough or spiky cell), with only faint shallow dimples where caveolae sit and a very fine surrounding halo suggesting the thin basal lamina. Shallow depth of field so the far edges fall softly out of focus, cool studio microscopy lighting. False-color palette: warm sandy-beige to soft peach cell against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles, NO visible lipid droplet interior. Anatomically faithful, single specimen only, large and smoothly rounded (do not draw surface ruffles, spikes or filopodia — the surface should read taut and gently domed, stretched by the fat stored inside). Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human white adipocyte (fat cell), centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell is large and round, dominated by ONE single huge translucent pale golden-yellow lipid droplet that fills roughly 90% of the cell volume, pushing a thin flattened crescent-shaped nucleus and a very thin rim of cytoplasm out to the edge against the membrane — the classic 'signet ring' shape. Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tints so the structures are clearly distinguishable: the giant lipid droplet (warm translucent gold, with a fine perilipin coat visible as a delicate membrane skin on its surface), the thin flattened nucleus pressed at the rim, a few small elongated mitochondria in the narrow cytoplasmic rim, a small Golgi stack and a little rough endoplasmic reticulum near the nucleus, tiny caveolae pits along the inner face of the plasma membrane, and a delicate basal lamina sheath just outside the cell. Natural colours, not near-monochrome and not neon. Do NOT render multiple small lipid droplets, a round central nucleus, abundant large mitochondria, a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia; this is an animal cell, not a bacterium. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human white adipocyte (fat cell) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is large and round, its defining feature a SINGLE HUGE pale creamy-yellow lipid droplet occupying almost the whole cell, squeezing a thin flattened crescent nucleus and a very thin rim of cytoplasm to the edge — the classic 'signet ring' shape. A delicate painterly cut-away reveals the interior: the giant lipid droplet washed in soft cream/straw yellow with a fine ink line suggesting its perilipin coat, the thin flattened nucleus pressed against the membrane, a few small mitochondria and a small Golgi apparatus with a touch of rough endoplasmic reticulum near the nucleus in the narrow cytoplasmic rim, small caveolae dimples along the membrane, and a fine ink line for the basal lamina just outside the cell. Single specimen, anatomically faithful animal cell. Do NOT paint multiple small lipid droplets, a round central nucleus, abundant large mitochondria, a cell wall, nucleoid, plasmids, chloroplasts, a large vacuole, flagella or cilia. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1677 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 24.3s — PASS (gemini-2.5-flash-image) — coloured cutaway, muted educational palette, thin outlines; single giant unilocular lipid droplet fills ~90% of the cell, flattened crescent nucleus pushed to the rim (signet-ring shape), few small mitochondria, small Golgi stack, patch of rough ER near nucleus, thin basal-lamina line outside the membrane; no baked text.
  ![textbook 1](theme/textbook/white-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/white-adipocyte.textbook.svg)
[interactive SVG](theme/textbook/white-adipocyte.textbook.svg) · [HTML](theme/textbook/white-adipocyte.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1563 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 24.7s — PASS (gemini-2.5-flash-image) — false-colour SEM, single smoothly rounded taut specimen (surface stretched tight over the stored fat, no ruffles/spikes), surface only (no interior organelles, correct for SEM), clean dark background, no baked text.
  ![sem 1](theme/sem/white-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1629 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 19.2s — PASS (gemini-2.5-flash-image) — natural warm-gold translucent lipid droplet dominating the cell, thin cutaway wedge showing the flattened nucleus, small mitochondria, Golgi stack and rough-ER dot cluster pressed into the rim; natural biological tints, no baked text.
  ![3d 1](theme/3d/white-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/white-adipocyte.3d.svg)
[interactive SVG](theme/3d/white-adipocyte.3d.svg) · [HTML](theme/3d/white-adipocyte.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3357 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 23.6s — FAIL — baked-in gibberish cursive pseudo-text visible along the cytoplasmic rim near the mitochondria (violates no-baked-text rule); otherwise correct anatomy and full-bleed aged-paper background.
  ![watercolor 1](theme/watercolor/white-adipocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 32.1s — PASS (gemini-2.5-flash-image) — full-bleed aged-paper watercolour, single huge pale-cream lipid droplet, flattened nucleus and organelles confined to a thin painted rim, delicate ink linework, no baked text (the dashed marks on one mitochondrion are cristae texture, confirmed on close inspection, not lettering).
  ![watercolor 2](theme/watercolor/white-adipocyte.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/white-adipocyte.watercolor.svg)
[interactive SVG](theme/watercolor/white-adipocyte.watercolor.svg) · [HTML](theme/watercolor/white-adipocyte.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · CC BY-SA 3.0 (also GFDL) · Department of Histology, Jagiellonian University Medical College — light microscopy (H&E-type paraffin section), CC BY-SA 3.0 (also GFDL), Department of Histology, Jagiellonian University Medical College — per render.md §2.
  ![reference](theme/light-micrograph/white-adipocyte.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | correct signet-ring anatomy, clean labels |
| sem | pass | 1 | smooth taut single specimen, surface only |
| 3d | pass | 1 | natural tints, correct anatomy, clean labels |
| watercolor | pass | 2 | attempt 1 rejected for baked text; attempt 2 full-bleed, correct anatomy |
