# Plasmodium (malaria) — render log

**Set:** `pathogens-viruses` · **Microbe key:** `plasmodium`
**Short description:** Single-celled apicomplexan parasite that causes malaria, spread by *Anopheles* mosquitoes. Shown here as the invasive **merozoite** (~1–1.5 µm): a small egg-shaped eukaryotic cell whose pointed apical complex (rhoptries, micronemes) lets it force its way into red blood cells; one nucleus, a single mitochondrion and a relict apicoplast. Not a worm, not a bacterium.

Metadata sidecar: [`plasmodium.render.meta.json`](plasmodium.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

*Plasmodium* is a single-celled **apicomplexan** parasite (phylum Apicomplexa) — a true eukaryote, not a bacterium and not a worm. Its life cycle alternates between a female *Anopheles* mosquito and a vertebrate. The recognisable disease stages are the **ring-stage trophozoite** inside a red blood cell (the classic Giemsa blood-smear view) and the **merozoite**, the tiny invasive form that bursts out of one red cell to invade the next. This diagram illustrates a single **merozoite**, because it carries the full, richly labelable apicomplexan tool-kit.

The merozoite is a compact **egg-shaped / ovoid** cell, roughly 1–1.5 µm long, with a **pointed apical (front) end** and a rounded base. Its defining feature is the **apical complex**: apical polar rings (with a conoid-like tip) plus two secretory organelle types — a pair of elongated **club-shaped rhoptries** whose necks converge on the tip, and a cluster of small rod-shaped **micronemes** beside them; scattered **dense granules** complete the invasion machinery. Their sequential secretion drives gliding motility and forced entry into the host red blood cell. Inside are a single **nucleus**, one large tubular **mitochondrion**, and an **apicoplast** — a non-photosynthetic *relict plastid* (secondary-endosymbiotic origin, an essential drug target; it is **not** green and **not** a chloroplast). The cell is bounded by a **pellicle**: the plasma membrane over an inner membrane complex with subpellicular microtubules. Being a zoite, the merozoite has **no flagellum and no cilia** (only the male microgamete is flagellated).

Sources: [CDC DPDx — Malaria (biology & life cycle)](https://www.cdc.gov/dpdx/malaria/index.html), [Wikipedia — *Plasmodium*](https://en.wikipedia.org/wiki/Plasmodium), [Cowman et al. 2016, "Malaria: Biology and Disease", *Cell* 167(3):610–624](https://doi.org/10.1016/j.cell.2016.07.055), [NCBI Bookshelf — *Medical Microbiology* (Baron), ch. 83 Malaria](https://www.ncbi.nlm.nih.gov/books/NBK8584/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where |
|---|---|---|---|---|---|
| `apical_complex` | complexus apicalis (anulus polaris, conoideum) | Apical complex | Apikalkomplex | invasion apparatus at the front tip | pointed apical end |
| `rhoptry` | rhoptria | Rhoptries | Rhoptrien | paired club-shaped secretory organelles; host-cell entry | apex, necks to tip |
| `microneme` | micronema | Micronemes | Mikronemen | small secretory organelles; adhesion & gliding | apical, clustered |
| `dense_granule` | granulum densum | Dense granules | Dichte Granula | late secretion; remodels the host cell | cytoplasm |
| `nucleus` | nucleus | Nucleus | Zellkern | single true nucleus (eukaryote) | lower half |
| `apicoplast` | apicoplastus (plastidium relictum) | Apicoplast | Apikoplast | relict non-photosynthetic plastid; isoprenoids; drug target | near mitochondrion |
| `mitochondrion` | mitochondrion (singulare) | Mitochondrion | Mitochondrium | single large tubular mitochondrion | mid/lower body |
| `pellicle` | pellicula (membrana plasmatica + complexus membranae internae) | Pellicle (plasma membrane + inner membrane complex) | Pellikula (Zellmembran + innerer Membrankomplex) | outer envelope + subpellicular microtubules | boundary |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism happens | interior |

### Do NOT draw (scientifically misleading)
- **No flagellum, no undulating membrane** — a merozoite is not a trypanosome; only the male microgamete is flagellated.
- **No cilia / bristly fringe** — the surface is a smooth pellicle.
- **No bacterial cell wall, no nucleoid, no plasmids** — it is a eukaryote with a true membrane-bound nucleus.
- **Exactly ONE nucleus** in a merozoite (multi-nucleate is the schizont, a different stage).
- **Apicoplast is NOT green / not a chloroplast** — it is a colourless relict plastid.
- Do **not** draw it as a ring inside a red blood cell (that is the trophozoite microscopy view, kept for the reference image), and **not** as a worm.
- No membrane-bound organelle drawn *outside* the cell; the surrounding space is empty background.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #5856** — a Giemsa-stained **thin blood film** of *Plasmodium falciparum* showing **ring-stage trophozoites** (and gametocytes) inside red blood cells: the canonical malaria diagnostic view, giving true scale against the erythrocytes. Public domain.
- file: https://commons.wikimedia.org/wiki/Special:FilePath/Plasmodium.jpg
- page: https://commons.wikimedia.org/wiki/File:Plasmodium.jpg · License: **Public Domain (CDC PHIL #5856)** · CDC Public Health Image Library (uploader TimVickers)
- backup: CDC PHIL #2704 (P. falciparum gametocytes, PD) — https://commons.wikimedia.org/wiki/File:Plasmodium_falciparum_01.png

AI visual verification: see §5 (verdicts). A Giemsa thin film clearly showing ring-forms among red blood cells is the standard teaching micrograph for malaria; the illustration stages (merozoite) differ from this blood-smear stage on purpose, so the two complement each other.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Plasmodium, the tiny troublemaker behind malaria! It is just one single cell, shaped a bit like a pointy egg, and it is far too small to see. A mosquito carries it: when the mosquito bites, Plasmodium sneaks into your blood, hides in your liver, then bursts into your red blood cells and makes you feel hot and shivery in waves. The pointed end is a special tool-kit it uses to drill its way inside a blood cell. The best trick to stop it is not letting the mosquito bite you at all — sleeping under a bed net keeps the little pests away. If someone does catch malaria, doctors have strong anti-malaria medicine, and clever new vaccines are now helping to shield kids too.  
🇩🇪 Das ist Plasmodium, der winzige Störenfried hinter der Malaria! Es ist nur eine einzige Zelle, geformt wie ein spitzes Ei, und viel zu klein zum Sehen. Eine Mücke trägt es mit sich: Wenn die Mücke sticht, schleicht sich Plasmodium in dein Blut, versteckt sich in deiner Leber und platzt dann in deine roten Blutkörperchen — davon wird dir in Wellen heiß und kalt. Mit seinem spitzen Ende bohrt es sich in ein Blutkörperchen hinein. Der beste Trick ist, die Mücke gar nicht erst stechen zu lassen — unter einem Moskitonetz zu schlafen hält die kleinen Plagegeister fern. Und wenn doch jemand Malaria bekommt, haben Ärzte starke Malaria-Medizin, und clevere neue Impfstoffe schützen jetzt auch Kinder.

**Adults (popular science, health).**  
🇬🇧 Plasmodium is a single-celled apicomplexan parasite and the cause of malaria, one of the world's deadliest infectious diseases. It is transmitted by the bite of female Anopheles mosquitoes, which inject slender sporozoites that first multiply silently in the liver before pouring into the bloodstream. There the parasite invades red blood cells as a merozoite — the egg-shaped stage shown here — using a specialised apical complex to force its way in, then multiplies inside and bursts out in synchronised waves that produce malaria's classic recurring fevers and chills. Five species infect humans, with Plasmodium falciparum causing the most severe, sometimes fatal disease. Because it hides inside liver and blood cells and constantly varies its surface proteins, malaria has been extremely hard to control. Prevention still rests heavily on insecticide-treated bed nets and mosquito control, treatment relies on antimalarial drugs such as artemisinin-based combinations, and the first malaria vaccines (RTS,S and R21) are now being rolled out to children in high-burden regions.  
🇩🇪 Plasmodium ist ein einzelliger Apicomplexa-Parasit und der Erreger der Malaria, einer der tödlichsten Infektionskrankheiten der Welt. Übertragen wird er durch den Stich weiblicher Anopheles-Mücken, die schlanke Sporozoiten einspritzen, welche sich zunächst unbemerkt in der Leber vermehren, bevor sie in die Blutbahn strömen. Dort befällt der Parasit als Merozoit — das hier gezeigte eiförmige Stadium — die roten Blutkörperchen und dringt mit einem spezialisierten Apikalkomplex gewaltsam in sie ein; im Inneren vermehrt er sich und platzt in synchronen Wellen heraus, was die typischen wiederkehrenden Fieberschübe und Schüttelfröste der Malaria auslöst. Fünf Arten befallen den Menschen, wobei Plasmodium falciparum die schwersten, mitunter tödlichen Verläufe verursacht. Weil er sich in Leber- und Blutzellen versteckt und seine Oberflächenproteine ständig verändert, ist Malaria äußerst schwer zu bekämpfen. Vorbeugung beruht weiterhin stark auf insektizidbehandelten Moskitonetzen und Mückenbekämpfung, die Behandlung stützt sich auf Malariamittel wie Artemisinin-Kombinationstherapien, und die ersten Malaria-Impfstoffe (RTS,S und R21) werden nun an Kinder in stark betroffenen Regionen verteilt.

**Scientific.**  
🇬🇧 Plasmodium is a genus of obligate intracellular apicomplexan protozoa (phylum Apicomplexa) with a complex two-host life cycle alternating between an Anopheles mosquito definitive host and a vertebrate intermediate host. The invasive stages — sporozoite, merozoite and ookinete — are polarised zoites defined by the apical complex: apical polar rings, secretory rhoptries and micronemes, and dense granules whose sequential release drives gliding motility and host-cell invasion. The merozoite depicted here (~1–1.5 µm) is a compact eukaryotic cell bounded by a pellicle of plasma membrane over an inner membrane complex with subpellicular microtubules; it contains a single nucleus, one large tubular mitochondrion, and an apicoplast, a non-photosynthetic relict plastid of secondary endosymbiotic origin that is essential for isoprenoid biosynthesis and a validated drug target. After erythrocyte invasion the parasite develops through ring, trophozoite and schizont stages, consuming haemoglobin and detoxifying haem into inert haemozoin, then lyses the cell to release fresh merozoites in a roughly 48-hour synchronous cycle (P. falciparum). Antigenic variation of surface proteins such as PfEMP1, and cytoadherence of infected erythrocytes, underlie immune evasion and severe falciparum pathology.  
🇩🇪 Plasmodium ist eine Gattung obligat intrazellulärer Apicomplexa-Protozoen (Stamm Apicomplexa) mit einem komplexen Zwei-Wirt-Lebenszyklus, der zwischen der Anopheles-Mücke als Endwirt und einem Wirbeltier als Zwischenwirt wechselt. Die invasiven Stadien — Sporozoit, Merozoit und Ookinet — sind polarisierte Zoiten, definiert durch den Apikalkomplex: apikale Polringe, sekretorische Rhoptrien und Mikronemen sowie dichte Granula, deren gestaffelte Freisetzung die Gleitbewegung und das Eindringen in die Wirtszelle antreibt. Der hier dargestellte Merozoit (~1–1,5 µm) ist eine kompakte eukaryotische Zelle, umgeben von einer Pellikula aus Zellmembran über einem inneren Membrankomplex mit subpellikulären Mikrotubuli; er besitzt einen einzelnen Zellkern, ein großes tubuläres Mitochondrium und einen Apikoplasten, ein nicht-photosynthetisches Relikt-Plastid sekundär-endosymbiotischen Ursprungs, das für die Isoprenoid-Biosynthese unentbehrlich und ein validiertes Wirkstoffziel ist. Nach dem Eindringen in den Erythrozyten durchläuft der Parasit Ring-, Trophozoiten- und Schizontenstadien, verbraucht Hämoglobin und wandelt Häm in inertes Hämozoin um, bevor er die Zelle lysiert und in einem etwa 48-stündigen synchronen Zyklus (P. falciparum) neue Merozoiten freisetzt. Antigenvariation von Oberflächenproteinen wie PfEMP1 und die Zytoadhärenz infizierter Erythrozyten liegen der Immunevasion und der schweren Falciparum-Pathologie zugrunde.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE Plasmodium malaria merozoite — the invasive apicomplexan cell. Egg-shaped / ovoid body, roughly 1.5 to 2 times longer than wide, with a distinctly POINTED apical (top) end and a rounded basal (bottom) end. A neat quarter cut-away reveals the interior with each organelle a distinct muted colour fill: at the pointed apical end an apical complex (a small ring/cone of polar rings) with a pair of elongated club-shaped rhoptries whose necks converge to the tip, and a cluster of tiny rod-shaped micronemes beside them; a few small dense granules in the cytoplasm; a single large rounded nucleus in the lower half; one curved tubular mitochondrion; one small oval apicoplast (a relict plastid, NOT green, NOT a chloroplast) near the mitochondrion; pale cytoplasm; a smooth pellicle envelope (plasma membrane plus inner membrane complex) as the outer boundary. Semi-flat vector-style shading with crisp thin clean boundaries, a MUTED desaturated educational palette (soft dusty tints, never bright cartoon colours), gentle soft shading, on a neutral dark charcoal uncluttered background with generous negative space around each structure for later labels. Eukaryotic single cell: exactly ONE nucleus. Do NOT draw a flagellum, cilia, an undulating membrane, a bacterial cell wall or nucleoid; it is NOT a ring inside a red blood cell and NOT a worm. Square 1:1, 1080x1080, single specimen centered, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet on a surface. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE Plasmodium malaria merozoite, an egg-shaped apicomplexan cell with a pointed apical tip and a rounded base, roughly 1.5 to 2 times longer than wide, lying at a gentle three-quarter angle. Crisp true 3D surface texture with fine subtle ridges tracing the underlying pellicle, a slightly raised apical prominence at the pointed end, shallow depth of field so the base falls softly out of focus, on a subtly textured neutral substrate. False-color palette: a warm amber-to-rose cell against a dark charcoal uncluttered background. Surface only — render NO internal organelles. Smooth surface with no flagellum, no cilia, no appendages. Anatomically faithful, single specimen only. Square 1:1, 1080x1080, centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE Plasmodium malaria merozoite, an egg-shaped apicomplexan cell with a pointed apical end and a rounded base, about 1.5 to 2 times longer than wide, centered with generous margin. Soft global illumination, gentle rim light, subsurface scattering on the translucent pellicle, clean seamless dark studio background. A gentle cut-away or translucency reveals the interior with natural believable biological tints, each structure clearly distinguishable: at the pointed apical end an apical complex (polar rings/conoid) with a pair of club-shaped rhoptries converging to the tip and a cluster of small micronemes; a few dense granules; one large rounded nucleus in the lower half; a single curved tubular mitochondrion; one small oval apicoplast (relict plastid, NOT green, not a chloroplast); pale cytoplasm inside the smooth pellicle. Warm translucent cell body with distinct muted tints — not near-monochrome and not neon. Eukaryotic single cell: exactly ONE nucleus, no flagellum, no cilia, no undulating membrane, no bacterial wall or nucleoid; not a ring in a red blood cell, not a worm. Square 1:1, 1080x1080, single specimen centered, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: a SINGLE Plasmodium malaria merozoite — an egg-shaped apicomplexan cell with a POINTED apical top end and a rounded base. A painterly cut-away reveals the interior: at the pointed apical end an apical complex with a pair of club-shaped rhoptries converging to the tip and a cluster of tiny micronemes; a few small dense granules; one large rounded nucleus in the lower half; a single curved tubular mitochondrion; one small oval apicoplast (a relict plastid, NOT green); pale cytoplasm within a smooth pellicle. Eukaryotic single cell: exactly ONE nucleus, no flagellum, no cilia, no bacterial wall; not a ring in a red blood cell, not a worm. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 3 attempt(s), 5585 tok, $0.123
- attempt 1 · `gemini-2.5-flash-image` · 17.1s — fail (gemini-2.5-flash-image; light-grey background instead of the required dark-charcoal house background, flat shading with little dimensionality - style-consistency miss, superseded)
  ![textbook 1](theme/textbook/plasmodium.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 24.7s — fail (gemini-2.5-flash-image; near-monochrome grey/tan/white palette on the correct dark-charcoal background - reads as an uncoloured line drawing, explicit FAIL mode, superseded)
  ![textbook 2](theme/textbook/plasmodium.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 24.4s — pass (gemini-3-pro-image; dark-charcoal background matching rod-bacterium/parasite exemplars, every organelle a distinct saturated soft fill (purple nucleus, teal mitochondrion, olive apicoplast, blue micronemes, orange rhoptry), thin clean outlines with soft gradient shading, quarter cutaway, egg shape with pointed apical end, no text/border)
  ![textbook 3](theme/textbook/plasmodium.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/plasmodium.textbook.svg)
[interactive SVG](theme/textbook/plasmodium.textbook.svg) · [HTML](theme/textbook/plasmodium.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1515 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.1s — pass (gemini-2.5-flash-image; single egg-shaped specimen with a distinct pointed apical prominence, crisp true 3D surface texture, false-color warm amber/rose on a dark charcoal background, surface only (no internal structures, correctly), no text/border)
  ![sem 1](theme/sem/plasmodium.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1600 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.2s — pass (gemini-2.5-flash-image; natural warm amber translucent cell body with clearly distinguishable tinted structures - two club-shaped rhoptries converging to the apical tip, rod-shaped microneme cluster, dense granules, pink nucleus, blue-grey apicoplast, curved tubular mitochondrion; soft global illumination, dark studio background, no text/border)
  ![3d 1](theme/3d/plasmodium.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/plasmodium.3d.svg)
[interactive SVG](theme/3d/plasmodium.3d.svg) · [HTML](theme/3d/plasmodium.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1679 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.9s — pass (gemini-2.5-flash-image; warm aged paper fills the frame edge-to-edge with a soft darker wash halo directly behind the subject (no mat/frame/sheet-on-surface), egg shape with pointed apical top, paired rhoptries converging to the tip, microneme/dense-granule clusters, nucleus, curved mitochondrion, small apicoplast, black ink linework in the naturalist-plate style matching cocci/rod-bacterium exemplars, no text)
  ![watercolor 1](theme/watercolor/plasmodium.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/plasmodium.watercolor.svg)
[interactive SVG](theme/watercolor/plasmodium.watercolor.svg) · [HTML](theme/watercolor/plasmodium.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · Public Domain (CDC PHIL #5856) · CDC Public Health Image Library #5856 (Dr. Greene; Steven Glenn) — pass (CDC PHIL #5856 Giemsa thin blood film, public domain; cleaned/contrast-enhanced edit used for display - clearly shows ring-stage trophozoites (chromatin dot + cytoplasm ring) in multiple red blood cells plus one classic banana/crescent-shaped gametocyte; illustration styles intentionally show the later merozoite stage while this reference shows the ring-stage/gametocyte blood-smear view - documented in §1-2, the two stages complement each other as the standard malaria teaching pair)
  ![reference](theme/light/plasmodium.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 3 | use as final after escalating to gemini-3-pro-image; attempts 1-2 (flash) failed the style-consistency check (wrong background / near-monochrome), attempt 3 matches the exemplar palette and line style with all labelled structures present |
| sem | pass | 1 | use as final; accurate egg-shaped merozoite with pointed apical prominence, correct surface-only SEM rendering, false-colour matches house style |
| 3d | pass | 1 | use as final; correct natural biological tints, all apical-complex and organelle structures clearly distinguishable and correctly placed |
| watercolor | pass | 1 | use as final; full-bleed aged-paper plate matching the cocci/rod-bacterium exemplars, all structures present and correctly placed |
