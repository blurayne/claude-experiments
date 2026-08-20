# HIV — Human Immunodeficiency Virus (HI-Virus) — render log

**Set:** `pathogens-viruses` · **Microbe key:** `hiv`
**Short description:** Enveloped retrovirus (~120 nm) whose Env spikes dock onto CD4 T-helper cells; its conical capsid delivers two RNA copies plus reverse transcriptase, and the provirus integrates into human DNA — untreated it drives AIDS, while antiretroviral therapy (ART) keeps it suppressed.

Metadata sidecar: [`hiv.render.meta.json`](hiv.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

HIV-1 is a roughly **spherical enveloped retrovirus**, about **100–120 nm** in diameter — some 60× smaller than the bacteria in the generic set. The outermost layer is a **host-derived lipid bilayer envelope** (stolen from the plasma membrane as the virion buds off). Studding that envelope is a **sparse** scatter of **envelope glycoprotein spikes** — on a real virion only ~7–14 trimers, each a trimer of **gp120** (the receptor-binding surface subunit) sitting on **gp41** (the transmembrane stalk); this is the machinery that grabs CD4 and a co-receptor (CCR5/CXCR4). Just inside the envelope is a thin shell of **matrix protein (p17)**. The interior is dominated by the diagnostic **conical capsid (core), built of p24** — a distinctive **cone/bullet shape**, wide at one end and narrow at the other, NOT a geometric icosahedron and NOT a sphere. Packed inside the cone are **two identical copies of (+)-sense single-stranded RNA** coated by **nucleocapsid protein (p7)**, together with the virion enzymes **reverse transcriptase**, **integrase**, and **protease**. This mature, cone-cored morphology is what a virology diagram must show.

Sources: [ViralZone / SIB — Lentivirus / HIV-1 virion](https://viralzone.expasy.org/5061), [NIH HIVinfo — The HIV Life Cycle](https://hivinfo.nih.gov/understanding-hiv/fact-sheets/hiv-life-cycle), [NCBI Bookshelf — *Medical Microbiology* 4e, Ch. 62 (Retroviruses/HIV)](https://www.ncbi.nlm.nih.gov/books/NBK8685/), [PDB-101 (RCSB) — HIV capsid & structure](https://pdb101.rcsb.org/motm/141).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `envelope` | membrana viri (bilamina lipidica) | Lipid envelope | Lipidhülle | host-derived lipid bilayer coat | outer boundary | core |
| `env_spike` | glycoproteina superficiei (gp120/gp41) | Envelope glycoprotein spike (gp120/gp41) | Hüllprotein-Spike (gp120/gp41) | trimeric spike; binds CD4 + co-receptor | on envelope, sparse | core |
| `matrix` | matrix (p17) | Matrix (p17) | Matrix (p17) | protein shell lining the envelope | inside envelope | core |
| `capsid` | capsid conicum (p24) | Conical capsid / core (p24) | Konisches Kapsid / Core (p24) | cone-shaped p24 shell enclosing the genome | central | core |
| `rna` | genoma RNA (duo fila) | RNA genome (two strands) | RNA-Genom (zwei Stränge) | two (+)ssRNA copies; the genetic material | inside capsid | core |
| `nucleocapsid` | nucleocapsid (p7) | Nucleocapsid (p7) | Nukleokapsid (p7) | protein coating the RNA | inside capsid | core |
| `reverse_transcriptase` | transcriptasa reversa | Reverse transcriptase | Reverse Transkriptase | copies RNA into DNA | inside capsid | core |
| `integrase` | integrasa | Integrase | Integrase | splices viral DNA into host genome | inside capsid | optional |

### Do NOT draw (scientifically misleading)
- **Icosahedral / geometric-ball capsid** — HIV's core is a **cone (bullet)**, wide-to-narrow, not a soccer-ball icosahedron.
- **Bacteriophage tail / legs / lander** — HIV has no tail, no injection needle, no legs.
- **Dense carpet of spikes** — Env spikes are FEW and sparse (~10), not a fuzzy corona covering the whole surface.
- **Bacterial anatomy** — no cell wall, no peptidoglycan, no nucleoid, no ribosomes, no flagella/pili.
- **DNA double helix inside the virion** — the packaged genome is **RNA**; DNA only appears after reverse transcription inside the host.
- **A face, eyes, or any anthropomorphism.**
- **Perfectly centered single big spike** — show the whole particle, cutaway on one side to reveal the cone.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL colorized SEM of HIV-1 virions budding from a cultured lymphocyte** (C. Goldsmith / CDC), public domain. Numerous small green particles (mature and budding HIV-1 virions) stud the pink/red lymphocyte surface and the surrounding blue substrate — features are readable even though it is a group scene. As a single-isolated specimen is essentially unobtainable for a ~120 nm human virus (below optical/most SEM crops' individual-resolving power at this framing), a well-known field with clearly countable virion particles is acceptable per the rubric.
- file: https://upload.wikimedia.org/wikipedia/commons/1/1a/HIV-budding-Color.jpg
- page: https://commons.wikimedia.org/wiki/File:HIV-budding-Color.jpg · License: **Public Domain (CDC PHIL)** · CDC/ C. Goldsmith, P. Feorino, E. L. Palmer, W. R. McManus
- backup: [NIAID HIV SEM, CC BY 2.0](https://www.flickr.com/photos/niaid/) (HIV budding from an infected T cell)

AI visual verification result: **PASS (2026-08-13).** Confirmed scanning electron micrograph (not TEM as originally logged — corrected) of a lymphocyte (pink/red, false-colour) with many small green HIV-1 virions budding off its surface and scattered on the substrate; no baked-in text, caption or border present, used as-is for display.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet HIV, a tiny spiky ball of a virus that plays a very sneaky trick. It uses its little grappling-hook spikes to grab onto special helper cells that act like the captains of your body's defence team. Then it slips inside and hides its instructions right in the cell's own diary, so it is really hard to find. Doctors have clever daily pills that pin HIV down and stop it from making copies, so people who take them can stay healthy and strong for a whole lifetime.  
🇩🇪 Das ist HIV, ein winziger, stacheliger Virus-Ball mit einem hinterlistigen Trick. Mit seinen kleinen Enterhaken-Spikes klammert es sich an besondere Helferzellen, die wie die Kapitäne der Abwehrmannschaft deines Körpers sind. Dann schlüpft es hinein und versteckt seine Bauanleitung mitten im Tagebuch der Zelle, sodass man es kaum noch findet. Ärztinnen und Ärzte haben schlaue Tabletten für jeden Tag, die HIV festhalten und das Kopieren stoppen - wer sie nimmt, bleibt ein ganzes Leben lang gesund und munter.

**Adults (popular science, health).**  
🇬🇧 HIV (human immunodeficiency virus) is a retrovirus that targets CD4-positive helper T cells, the coordinators of the immune response. Its envelope spikes (gp120/gp41) dock onto CD4 and a co-receptor, the virus fuses with the cell, and its enzyme reverse transcriptase copies its RNA into DNA that integrase then stitches permanently into the host genome. Left untreated, the slow loss of helper T cells eventually leads to AIDS, when the immune system can no longer fend off ordinary infections. Modern antiretroviral therapy (ART) blocks these steps so effectively that the virus becomes undetectable in the blood; people on treatment live long, healthy lives and cannot pass HIV on sexually (undetectable = untransmittable).  
🇩🇪 HIV (humanes Immundefizienz-Virus) ist ein Retrovirus, das gezielt CD4-positive Helfer-T-Zellen befällt, die Dirigenten der Immunabwehr. Seine Hüllproteine (gp120/gp41) docken an CD4 und einen Korezeptor an, das Virus verschmilzt mit der Zelle, und sein Enzym Reverse Transkriptase schreibt die RNA in DNA um, die die Integrase dann dauerhaft ins menschliche Erbgut einbaut. Unbehandelt führt der langsame Verlust der Helfer-T-Zellen schließlich zu AIDS, wenn die Immunabwehr auch harmlose Erreger nicht mehr abwehren kann. Moderne antiretrovirale Therapie (ART) blockiert diese Schritte so wirksam, dass das Virus im Blut nicht mehr nachweisbar ist; Behandelte leben lange und gesund und können HIV sexuell nicht weitergeben (nicht nachweisbar = nicht übertragbar).

**Scientific.**  
🇬🇧 HIV-1 is an enveloped lentivirus (family Retroviridae) about 100–120 nm across. Each virion carries roughly 7–14 trimeric envelope glycoprotein spikes (surface gp120 non-covalently bound to transmembrane gp41) in a host-derived lipid bilayer, a matrix (p17) shell, and a distinctive conical p24 capsid enclosing two copies of positive-sense single-stranded RNA coated by nucleocapsid p7, together with reverse transcriptase, integrase and protease. Entry proceeds by gp120 binding CD4 and a chemokine co-receptor (CCR5 or CXCR4), gp41-mediated membrane fusion, reverse transcription, nuclear import and integrase-catalysed integration to form a provirus. High reverse-transcriptase error rates and rapid replication drive the sequence diversity underlying immune escape and drug resistance; combination ART targeting reverse transcriptase, integrase, protease and entry achieves durable virological suppression.  
🇩🇪 HIV-1 ist ein behülltes Lentivirus (Familie Retroviridae) von etwa 100–120 nm Größe. Jedes Virion trägt rund 7–14 trimere Hüllprotein-Spikes (oberflächliches gp120, nicht-kovalent an das transmembranäre gp41 gebunden) in einer wirtseigenen Lipiddoppelschicht, eine Matrixhülle (p17) sowie ein charakteristisches konisches p24-Kapsid, das zwei Kopien positivsträngiger Einzelstrang-RNA umschließt, die vom Nukleokapsid p7 ummantelt sind, zusammen mit Reverser Transkriptase, Integrase und Protease. Der Eintritt erfolgt über die Bindung von gp120 an CD4 und einen Chemokin-Korezeptor (CCR5 oder CXCR4), gp41-vermittelte Membranfusion, reverse Transkription, Kernimport und Integrase-katalysierte Integration zum Provirus. Hohe Fehlerraten der Reversen Transkriptase und schnelle Replikation erzeugen die Sequenzvielfalt, die Immunflucht und Resistenz zugrunde liegt; eine Kombinations-ART gegen Reverse Transkriptase, Integrase, Protease und Eintritt erreicht eine dauerhafte virologische Suppression.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE mature HIV virus particle (human immunodeficiency virus), centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Semi-flat vector-style shading with crisp thin clean outlines and a MUTED, desaturated educational palette (soft dusty tints, never bright cartoon colours) on a neutral dark charcoal uncluttered background. The virion is roughly spherical. A neat quarter cut-away reveals the interior. Show, distinctly: an outer host-derived lipid bilayer envelope; a SPARSE scatter of only about ten mushroom-shaped envelope glycoprotein spikes (gp120 knob on a gp41 stalk) poking out of the envelope, NOT a dense fuzzy corona; a thin matrix protein layer lining the inside of the envelope; and, at the centre, the diagnostic CONICAL capsid core made of p24 — a distinct cone/bullet shape, wide at one end and narrow at the other. Inside the cone show two thin coiled single-stranded RNA strands and a few small reverse-transcriptase enzyme dots. Each structure its own soft distinct colour fill. Do NOT draw an icosahedral or geometric-ball capsid, no bacteriophage tail or legs, no DNA double helix, no bacterial cell wall, and absolutely no face or eyes. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image, and fill the frame edge-to-edge with no border or frame.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE mature HIV virus particle (human immunodeficiency virus), centered in a square 1:1 1080x1080 frame with generous empty margin. The virion is a roughly spherical particle with a subtly bumpy surface, resting on a faintly textured neutral substrate, shallow depth of field so the edges fall softly out of focus. Show only real surface detail: a SPARSE scatter of small mushroom-like knob spikes (envelope glycoproteins) studding the otherwise smooth spherical envelope — NOT a dense hairy corona. False-color palette: warm amber-to-bronze particle against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal structures and NO cutaway. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere, and fill the frame edge-to-edge with no black border, frame, vignette or letterbox.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE mature HIV virus particle (human immunodeficiency virus), centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, subsurface scattering on the membrane, and a clean seamless dark studio background. The virion is roughly spherical with a translucent host-derived lipid envelope; a gentle cut-away or partial translucency reveals the interior. Colorize with natural, believable biological tones so structures are clearly distinguishable: a translucent bluish envelope, warm reddish mushroom-shaped envelope glycoprotein spikes (gp120/gp41) sparsely dotting the surface (only about ten, not a dense corona), a thin pale matrix layer lining the envelope, and at the centre the diagnostic CONICAL capsid core (p24) as a distinct cone/bullet shape wide at one end and narrow at the other, containing two thin coiled RNA strands and a few reverse-transcriptase enzyme specks. Do NOT model an icosahedral geometric-ball capsid, no bacteriophage tail or legs, no DNA double helix, no bacterial wall, and absolutely no face or anthropomorphism. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks, and fill the frame edge-to-edge with no border.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE mature HIV virus particle (human immunodeficiency virus) in the style of a 19th-century atlas, centered in a square 1:1 1080x1080 frame, yet anatomically modern and correct. Soft translucent watercolour washes with fine ink outlines. The warm aged paper texture MUST FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background; do NOT paint a separate sheet, card, mat, border, frame or drop-shadow. A soft darker wash halo sits directly on the paper behind the large centred virion. The particle is roughly spherical with a soft painterly cut-away revealing the interior: an outer lipid envelope; a SPARSE scatter of about ten mushroom-shaped envelope glycoprotein spikes (gp120/gp41) poking out, NOT a dense corona; a thin matrix layer lining the envelope; and at the centre the diagnostic CONICAL capsid core (p24), a distinct cone/bullet shape wide at one end and narrow at the other, holding two thin coiled RNA strands and a few reverse-transcriptase specks. Do NOT paint an icosahedral geometric-ball capsid, no bacteriophage tail or legs, no DNA double helix, no bacterial wall, and absolutely no face. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1606 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 19.0s — PASS - refined muted educational cutaway matching rod-bacterium/cocci house style; thin clean outlines; distinct soft fills for lipid envelope, sparse (~14) mushroom-shaped gp120/gp41 spikes, thin matrix lining, and the diagnostic wide-to-narrow CONICAL p24 capsid (not icosahedral) revealed by a quarter cutaway, with two coiled RNA strands and reverse-transcriptase dots inside; no text/border/vignette; fills frame edge-to-edge on dark charcoal background. Chosen as label base.
  ![textbook 1](theme/textbook/hiv.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/hiv.textbook.svg)
[interactive SVG](theme/textbook/hiv.textbook.svg) · [HTML](theme/textbook/hiv.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1494 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 11.7s — PASS - photorealistic false-colour amber/bronze SEM, single roughly spherical virion with subtly bumpy surface and a sparse ring of small mushroom-like knob spikes (not a dense fuzzy corona); shallow depth of field, dark uncluttered background, no internal structures (correct for SEM), no baked text/scale bar/border.
  ![sem 1](theme/sem/hiv.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1571 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 35.1s — PASS - natural believable biological tints: translucent bluish lipid envelope, warm reddish sparse gp120/gp41 spikes, pale matrix lining, tan CONICAL p24 core with green coiled RNA and reverse-transcriptase specks; soft studio lighting, dark seamless background, no neon/monochrome, no text.
  ![3d 1](theme/3d/hiv.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/hiv.3d.svg)
[interactive SVG](theme/3d/hiv.3d.svg) · [HTML](theme/3d/hiv.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1590 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 23.3s — PASS - warm aged paper fills the entire frame edge-to-edge with a soft darker wash halo directly on the paper (no mat/sheet-on-surface), matching cocci/rod-bacterium house style; single virion with sparse mushroom-shaped spikes and a painterly cutaway revealing the CONICAL p24 core, RNA strands and reverse-transcriptase specks; fine ink outlines, no text.
  ![watercolor 1](theme/watercolor/hiv.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/hiv.watercolor.svg)
[interactive SVG](theme/watercolor/hiv.watercolor.svg) · [HTML](theme/watercolor/hiv.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public Domain (CDC PHIL, C. Goldsmith) · CDC/ C. Goldsmith, P. Feorino, E. L. Palmer, W. R. McManus — PASS - CDC PHIL colorized SEM (C. Goldsmith et al., public domain) of HIV-1 virions budding from a cultured lymphocyte; numerous small green virions clearly visible on the pink/red cell surface and blue substrate, no baked caption/border. A single-isolated ~120 nm virion micrograph is essentially unobtainable, so this well-known, clearly countable field is used as the reference.
  ![reference](../reference-microscopy/theme/sem/hiv.attempts/real-01__SEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | teaching-ready (label base) | 1 | muted refined cutaway; correct conical-capsid morphology; sparse spikes; best for full labelling |
| sem | teaching-ready | 1 | realistic false-colour surface-only SEM; single specimen; sparse spikes; no border |
| 3d | teaching-ready | 1 | natural biological tints; conical core with RNA + enzymes visible; sparse spikes |
| watercolor | teaching-ready | 1 | full-bleed aged-paper naturalist plate; conical core cutaway; sparse spikes |
| reference SEM | verified as-is | 1 | CDC PHIL public-domain SEM of budding HIV-1 virions on a lymphocyte, used unedited |
