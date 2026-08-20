# Erythrocyte (red blood cell) — render log

**Set:** `red-blood` · **Microbe key:** `erythrocyte`
**Short description:** Anucleate, biconcave-disc blood cell packed with haemoglobin; carries oxygen from the lungs to every tissue and CO₂ back, living about 120 days while squeezing through the entire capillary network millions of times.

Metadata sidecar: [`erythrocyte.render.meta.json`](erythrocyte.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The mature human erythrocyte (red blood cell, RBC) is the most abundant cell in the body (~4.5–5.5 million/µL of blood) and is built for one job: bulk O₂/CO₂ transport. During its final maturation step in the bone marrow (orthochromatic erythroblast → reticulocyte) it expels its nucleus and, over the following one to two days, degrades its mitochondria, ribosomes and endoplasmic reticulum/Golgi via autophagy — the mature circulating cell has **no nucleus and no organelles at all**. The freed-up interior is filled almost entirely with haemoglobin (roughly 270 million molecules per cell), a tetrameric iron-containing protein that reversibly binds O₂ in the lungs and releases it in peripheral tissue, and also carries a portion of CO₂ and buffers pH. Because it retains no organelles and no protein-synthesis machinery, the mature RBC cannot repair or renew itself; it survives on anaerobic glycolysis alone (no mitochondria means no oxidative phosphorylation) and is removed by the spleen/liver after roughly 120 days.

Its defining shape is a **biconcave disc**: a flattened cell about 7.5–8.7 µm in diameter, ~2–2.5 µm thick at the rim and thinning to well under 1 µm in the centre, giving both faces a shallow dimple. This shape (rather than a sphere) maximises the surface-area-to-volume ratio for gas exchange and — critically — gives the cell a large membrane reserve relative to its volume, which is what allows it to fold and deform. That deformability comes from a dense, elastic meshwork just under the plasma membrane: the **spectrin-actin membrane skeleton**, a hexagonal lattice of spectrin tetramers cross-linked at "junctional complexes" of short actin filaments and bound to the lipid bilayer via ankyrin/band 3 and protein 4.1R. This skeleton is what lets the cell repeatedly squeeze through splenic slits and capillaries narrower than its own resting diameter and then spring back to its biconcave shape. The plasma membrane itself carries surface glycoproteins — glycophorin A/C and the band 3 anion-exchanger — that display the ABO/Rh blood-group antigens and handle the chloride/bicarbonate exchange (the "chloride shift") that helps transport CO₂ as bicarbonate.

Production (erythropoiesis) happens continuously in red bone marrow and is driven by **erythropoietin (EPO)**, a hormone made mainly by the kidney in response to low tissue oxygen — the direct link to this page's poster context.

Sources: [Wikipedia — Red blood cell](https://en.wikipedia.org/wiki/Red_blood_cell), [NCBI Bookshelf / StatPearls — Histology, Red Blood Cell](https://www.ncbi.nlm.nih.gov/books/NBK539702/), [OpenStax Anatomy & Physiology 2e, §18.3 Erythrocytes](https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes), [Mohandas & Gallagher 2008, "Red cell membrane: past, present, and future", Blood (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2234139/).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `plasma_membrane` | membrana plasmatica | Plasma membrane | Zellmembran | flexible lipid bilayer studded with glycophorin A/C and band 3 anion-exchanger proteins (carry ABO/Rh blood-group antigens; handle CO₂/bicarbonate exchange) | outermost boundary | core |
| `membrane_skeleton` | cytoskeleton spectrinicum | Spectrin-actin membrane skeleton | Spektrin-Aktin-Membranskelett | hexagonal lattice of spectrin tetramers + actin junctional complexes anchored via ankyrin/band 3/protein 4.1R; gives elasticity, lets the cell deform and spring back | just beneath the plasma membrane, all around | core |
| `hemoglobin_cytoplasm` | cytoplasma haemoglobino repletum | Haemoglobin-filled cytoplasm | Hämoglobin-gefülltes Zytoplasma | ~270 million haemoglobin tetramers dissolved in the cytosol, each binding up to 4 O₂ molecules | fills the entire cell interior (no organelles) | core |
| `biconcave_shape` | discus biconcavus | Biconcave disc shape | Bikonkave Scheibenform | ~7.5–8.7 µm diameter, ~2–2.5 µm thick at the rim, dimpled to <1 µm at the centre on both faces; maximises surface area for gas exchange and lets the cell fold through narrow capillaries | overall cell outline/profile | core |

### Do NOT draw (scientifically misleading)
- **No nucleus** — the mature human erythrocyte is anucleate; the nucleus is ejected during bone-marrow maturation (this is what distinguishes it from its precursor, the erythroblast).
- **No mitochondria, ribosomes, rough/smooth ER or Golgi** — all are degraded during maturation; the mature cell has zero organelles and runs on anaerobic glycolysis only.
- **Not a perfect sphere and not a flat, uniform disc** — the defining profile is a shallow dimple (biconcavity) on BOTH faces, thicker at the rim, thin at the centre.
- **Not stiff/rigid-looking** — deformability via the spectrin-actin skeleton is a defining functional trait; avoid a hard, plastic-looking disc.
- **No cytoplasmic granules** — granules belong to platelets/leukocytes, not erythrocytes.
- **No crescent/sickle shape** — that is the pathological sickle-cell entry elsewhere in this set, a distinct (related) microbe, not the normal erythrocyte.
- **No cell wall, flagella or cilia** — this is an anucleate animal-blood cell, not a plant cell, bacterium or motile cell.
- **Single specimen (or a small, non-clumped handful)** — not a dense stack/rouleaux that hides the individual biconcave profile.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "SEM blood cells.jpg"**, an authentic false-colour scanning electron micrograph of normal circulating human blood (National Cancer Institute, photographers Bruce Wetzel & Harry Schaefer, Feb 1982) showing numerous biconcave-disc red blood cells alongside a lymphocyte, a monocyte/neutrophil and platelets.
- file: https://upload.wikimedia.org/wikipedia/commons/8/82/SEM_blood_cells.jpg
- page: https://commons.wikimedia.org/wiki/File:SEM_blood_cells.jpg · License: **Public domain** (US federal government work, NCI) · Attribution: Bruce Wetzel & Harry Schaefer, National Cancer Institute (visualsonline.cancer.gov)
AI visual verification result: see §5 (cleaned/recomposed display version cropped onto a readable group of red blood cells; original mixed-cell-type frame kept for provenance).

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Erythrocyte — the tireless delivery driver of your bloodstream! It gave up almost everything to be great at its one job: no nucleus, no factories inside, not even a proper 'brain' — just packed edge to edge with a red cargo protein called haemoglobin that grabs oxygen. Shaped like a squishy little doughnut with the hole pinched shut, it's flexible enough to fold itself in half and squeeze through capillaries even skinnier than it is. Born in your bone marrow, it spends about 120 days looping through your entire body again and again — lungs to toes to brain and back — dropping off fresh oxygen everywhere and picking up the leftover carbon dioxide on the way home. By the time it wears out, it has made that trip so many times nobody bothers counting anymore; the marrow just quietly builds a fresh one to take its place.  
🇩🇪 Das ist der Erythrozyt — der unermüdliche Lieferbote in deinem Blut! Er hat fast alles aufgegeben, um in seinem einen Job richtig gut zu sein: keinen Zellkern, keine Fabriken im Inneren, nicht mal ein richtiges 'Gehirn' — er ist einfach randvoll mit einem roten Transportprotein namens Hämoglobin, das Sauerstoff greift. Geformt wie ein weicher kleiner Donut mit fast geschlossenem Loch ist er biegsam genug, sich zusammenzufalten und durch Kapillaren zu zwängen, die sogar enger sind als er selbst. Geboren in deinem Knochenmark, saust er rund 120 Tage lang immer wieder durch deinen ganzen Körper — von der Lunge bis zu den Zehen und zum Gehirn und zurück — liefert überall frischen Sauerstoff und nimmt auf dem Rückweg das übrig gebliebene Kohlendioxid mit. Wenn er irgendwann verbraucht ist, hat er diese Reise so oft gemacht, dass niemand mehr mitzählt — das Knochenmark baut einfach still und leise einen frischen nach.

**Adults (popular science, health).**  
🇬🇧 The erythrocyte is the body's dedicated oxygen carrier, and its structure reflects that single-mindedly: during maturation it ejects its nucleus and degrades every organelle, so the mature cell is essentially a flexible sac of haemoglobin — around 270 million molecules of it, each capable of binding up to four oxygen molecules. Its biconcave-disc shape, held in place by an elastic mesh of spectrin and actin just under the membrane, packs in a large surface area for gas exchange while letting the cell fold and squeeze through capillaries and splenic slits narrower than its own diameter, then spring back into shape. Made continuously in the bone marrow under the control of erythropoietin — a hormone released by the kidney when it senses low oxygen — a red blood cell circulates for about 120 days, travelling the entire vascular network millions of times before it is finally recycled by the spleen and liver. It cannot repair itself once damaged, since it has no ribosomes left to make new protein, which is part of why its lifespan is finite.  
🇩🇪 Der Erythrozyt ist der spezialisierte Sauerstoff-Transporter des Körpers, und sein Aufbau spiegelt genau das wider: Während der Reifung stößt er seinen Zellkern ab und baut jedes Organell ab, sodass die reife Zelle im Grunde ein flexibler Sack voller Hämoglobin ist — rund 270 Millionen Moleküle davon, jedes fähig, bis zu vier Sauerstoffmoleküle zu binden. Seine bikonkave Scheibenform, gehalten von einem elastischen Netz aus Spektrin und Aktin direkt unter der Membran, bietet eine große Oberfläche für den Gasaustausch und erlaubt der Zelle gleichzeitig, sich zu falten und durch Kapillaren und Milzspalten zu zwängen, die enger sind als ihr eigener Durchmesser, um danach wieder in Form zu schnellen. Ständig im Knochenmark neu gebildet und dabei vom Hormon Erythropoietin gesteuert — das die Niere freisetzt, wenn sie einen Sauerstoffmangel registriert —, zirkuliert ein rotes Blutkörperchen etwa 120 Tage lang und durchläuft dabei das gesamte Gefäßnetz millionenfach, bevor es schließlich von Milz und Leber recycelt wird. Reparieren kann es sich nicht mehr, sobald es beschädigt ist, denn ihm fehlen die Ribosomen, um neues Protein herzustellen — mit ein Grund für seine begrenzte Lebensdauer.

**Scientific.**  
🇬🇧 The mature human erythrocyte is a terminally differentiated, anucleate cell that has extruded its nucleus and degraded all cytoplasmic organelles (mitochondria, ribosomes, rough/smooth endoplasmic reticulum, Golgi apparatus) via autophagy during the reticulocyte-to-erythrocyte transition, leaving a cytoplasm essentially saturated with haemoglobin (~27 pg/cell, ~270 million tetramers) and dependent entirely on anaerobic glycolysis (the Embden-Meyerhof pathway) for ATP, since the absence of mitochondria precludes oxidative phosphorylation. Its characteristic biconcave-disc morphology (7.5–8.7 µm diameter, 2–2.5 µm rim thickness, <1 µm central thickness) optimises the surface-area-to-volume ratio for gas diffusion and provides substantial excess membrane surface area relative to enclosed volume, a prerequisite for the large, reversible deformations required to traverse capillaries and interendothelial splenic slits narrower than the cell's resting diameter. This deformability is conferred by the spectrin-based membrane skeleton: (α/β)-spectrin tetramers cross-linked into a hexagonal lattice at short actin-protofilament junctional complexes (stabilised by protein 4.1R, adducin and dematin), tethered to the lipid bilayer via ankyrin-band 3 and protein 4.1R-glycophorin C vertical linkages. Integral membrane proteins glycophorin A/B/C and the band 3 anion exchanger (AE1/SLC4A1) mediate the chloride-bicarbonate exchange central to CO₂ transport and display the major ABO and Rh blood-group antigens. Erythropoiesis is regulated primarily by erythropoietin secreted by renal peritubular interstitial fibroblasts in response to hypoxia; the resulting erythrocyte has a circulatory lifespan of approximately 120 days before senescence markers trigger phagocytic clearance by splenic and hepatic macrophages.  
🇩🇪 Der reife menschliche Erythrozyt ist eine terminal differenzierte, kernlose Zelle, die während des Übergangs vom Retikulozyten zum Erythrozyten ihren Zellkern ausgestoßen und sämtliche Zytoplasmaorganellen (Mitochondrien, Ribosomen, raues/glattes endoplasmatisches Retikulum, Golgi-Apparat) durch Autophagie abgebaut hat, sodass das Zytoplasma im Wesentlichen mit Hämoglobin gesättigt ist (~27 pg/Zelle, ~270 Millionen Tetramere) und für die ATP-Gewinnung vollständig auf anaerobe Glykolyse (Embden-Meyerhof-Weg) angewiesen ist, da das Fehlen von Mitochondrien eine oxidative Phosphorylierung ausschließt. Seine charakteristische bikonkave Scheibenmorphologie (7,5–8,7 µm Durchmesser, 2–2,5 µm Randdicke, <1 µm Dicke im Zentrum) optimiert das Verhältnis von Oberfläche zu Volumen für die Gasdiffusion und liefert eine erhebliche Membran-Überschussfläche relativ zum eingeschlossenen Volumen — Voraussetzung für die großen, reversiblen Verformungen, die zum Durchqueren von Kapillaren und interendothelialen Milzspalten nötig sind, die enger als der Ruhedurchmesser der Zelle sind. Diese Verformbarkeit wird durch das spektrinbasierte Membranskelett vermittelt: (α/β)-Spektrin-Tetramere, vernetzt zu einem hexagonalen Gitter an kurzen Aktin-Protofilament-Knotenkomplexen (stabilisiert durch Protein 4.1R, Adducin und Dematin), verankert an der Lipiddoppelschicht über Ankyrin-Bande-3- und Protein-4.1R-Glykophorin-C-Vertikalverbindungen. Die integralen Membranproteine Glykophorin A/B/C und der Bande-3-Anionenaustauscher (AE1/SLC4A1) vermitteln den für den CO₂-Transport zentralen Chlorid-Bicarbonat-Austausch und tragen die wichtigsten ABO- und Rhesus-Blutgruppenantigene. Die Erythropoese wird primär durch Erythropoietin reguliert, das von peritubulären interstitiellen Fibroblasten der Niere als Reaktion auf Hypoxie ausgeschüttet wird; der entstehende Erythrozyt zirkuliert etwa 120 Tage, bevor Seneszenzmarker die phagozytäre Entfernung durch Milz- und Lebermakrophagen auslösen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human erythrocyte (mature red blood cell), a BICONCAVE DISC shape — a smooth round disc that is thicker at the rounded rim and pinches down to a shallow, thinner dimple in the very centre on both the front and back face (like a soft, flattened doughnut where the hole never quite opens all the way through) — centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell body itself is coloured a soft, natural translucent red-crimson (its real haemoglobin colour, not an arbitrary convention). A neat quarter cut-away wedge reveals the interior: a thin, smooth plasma membrane outline; directly beneath it a fine, delicate hexagonal mesh pattern representing the spectrin-actin membrane skeleton hugging the inside of the membrane; and the entire rest of the interior filled with a uniform, granular, deep-red cytoplasm representing dense haemoglobin packing — with NO nucleus and NO other organelles of any kind inside (completely homogeneous red interior, no dots or shapes representing mitochondria, ribosomes, ER or Golgi). Anatomically faithful, single specimen, gently flexible-looking rather than rigid. Do NOT draw a nucleus, mitochondria, ribosomes, endoplasmic reticulum, Golgi apparatus, a cell wall, granules, flagella, or a crescent/sickle shape; this is a normal disc-shaped anucleate blood cell, not a bacterium, not a granulocyte, and not a sickle cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human erythrocyte (mature red blood cell), viewed at a three-quarter angle so its true BICONCAVE DISC shape is unmistakable: a smooth, rounded, doughnut-like disc, plump and rounded at the outer rim, sinking into a shallow, gently sloping central dimple on the visible face, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. Render true 3D surface texture: a perfectly smooth, taut membrane surface with no ridges, spikes or blebs, softly reflecting the studio lighting across the curved rim and into the central depression. Shallow depth of field so the far background falls softly out of focus, cool studio microscopy lighting. False-color palette: warm crimson-red to deep rose tones across the cell (echoing the cell's real haemoglobin colour), gently darker in the central dimple where the cell is thinnest, against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles, no cutaway. Single specimen, anatomically faithful, smooth and gently flexible-looking, not rigid or crumpled, not sickle-shaped, no visible pores or granules on the surface. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human erythrocyte (mature red blood cell), a BICONCAVE DISC shape — plump and rounded at the rim, sinking into a shallow central dimple on both faces like a soft flattened doughnut — centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light tracing the rounded rim, subsurface scattering on the translucent plasma membrane giving it a soft glassy sheen. Colour the cell a natural, believable crimson-red (its real haemoglobin colour, not an arbitrary false colour), richer at the thicker rim and slightly more translucent at the thin central dimple. Use a gentle wedge cut-away on one side to reveal the interior with natural, believable detail: a thin glossy plasma membrane, a fine hexagonal mesh of the spectrin-actin membrane skeleton pressed just beneath the membrane, and a uniform, dense, glossy deep-red cytoplasm packed with haemoglobin filling the rest of the interior — with NO nucleus and NO other organelles visible (fully homogeneous interior). Natural colours, not near-monochrome and not neon, gently flexible-looking rather than rigid or glassy-brittle. Do NOT render a nucleus, mitochondria, ribosomes, endoplasmic reticulum, Golgi apparatus, a cell wall, granules, flagella, or a crescent/sickle shape; this is a normal disc-shaped anucleate blood cell, not a bacterium, granulocyte or sickle cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human erythrocyte (mature red blood cell) in the style of a 19th-century atlas, but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell is painted as a true BICONCAVE DISC: plump and rounded at the outer rim, with a soft, gently shaded circular dimple in the very centre on both faces (like a flattened doughnut), rendered in natural crimson-red and rose washes (its real haemoglobin colour). A delicate painterly wedge cut-away on one side reveals the interior: a fine ink line for the plasma membrane, a faint hexagonal mesh wash just inside it suggesting the spectrin-actin membrane skeleton, and the rest of the interior washed as a uniform, dense red representing haemoglobin-filled cytoplasm, with absolutely no nucleus, dots or shapes suggesting other organelles. Single specimen, anatomically faithful, softly rounded and gently flexible-looking rather than rigid. Do NOT paint a nucleus, mitochondria, ribosomes, endoplasmic reticulum, Golgi apparatus, a cell wall, granules, flagella, or a crescent/sickle shape. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 4 attempt(s), 7388 tok, $0.155
- attempt 1 · `gemini-2.5-flash-image` · 13.2s — fail (gemini-2.5-flash-image; flat top-down view with a hard-edged dark central circle that reads as a nucleus rather than a shallow biconcave dimple, superseded)
  ![textbook 1](theme/textbook/erythrocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 12.0s — fail (gemini-2.5-flash-image; cutaway confined to a thin sliver at the rim, central oval still reads ambiguous/nucleus-like, superseded)
  ![textbook 2](theme/textbook/erythrocyte.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 15.6s — fail (gemini-2.5-flash-image; rim too thick/tall relative to diameter, reads as a hollow bowl or napkin-ring rather than a true biconcave disc, superseded)
  ![textbook 3](theme/textbook/erythrocyte.attempts/gen-03__gemini-2.5-flash-image.avif)
- attempt 4 · `gemini-2.5-flash-image` · 12.5s — pass (gemini-2.5-flash-image; convincing biconcave disc thinning to a shallow dimple on both faces, quarter cutaway clearly shows thin membrane + hexagonal spectrin-actin mesh + homogeneous haemoglobin cytoplasm with no organelles, muted textbook palette, no border)
  ![textbook 4](theme/textbook/erythrocyte.attempts/gen-04__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/erythrocyte.textbook.svg)
[interactive SVG](theme/textbook/erythrocyte.textbook.svg) · [HTML](theme/textbook/erythrocyte.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1588 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 21.9s — pass (gemini-2.5-flash-image; single false-colour crimson biconcave disc at three-quarter angle, clear rounded rim sinking into a shallow central dimple, granular surface texture, dark uncluttered background, no text/border, no internal structures shown as expected for SEM)
  ![sem 1](theme/sem/erythrocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1635 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 17.5s — pass (gemini-2.5-flash-image; glossy natural-crimson biconcave disc with visible central dimple on the front face, wedge cutaway reveals thin membrane + hexagonal spectrin-actin mesh + uniform dense haemoglobin cytoplasm, no organelles, no border)
  ![3d 1](theme/3d/erythrocyte.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/erythrocyte.3d.svg)
[interactive SVG](theme/3d/erythrocyte.3d.svg) · [HTML](theme/3d/erythrocyte.3d.html)

### Watercolor plate (`watercolor`) — 3 attempt(s), 5205 tok, $0.116
- attempt 1 · `gemini-2.5-flash-image` · 24.9s — fail (gemini-2.5-flash-image; central dimple rendered as a raised glossy ball that reads like a nucleus rather than a shallow depression, superseded)
  ![watercolor 1](theme/watercolor/erythrocyte.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 27.0s — fail (gemini-2.5-flash-image; dark central sphere again reads as a nucleus-like ball sitting in the dimple, misleading, superseded)
  ![watercolor 2](theme/watercolor/erythrocyte.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 13.5s — pass (gemini-2.5-flash-image; true biconcave-disc profile with a softly shaded circular dimple on both faces, full-bleed aged-paper background, wedge cutaway shows ink-line membrane + faint hexagonal mesh + uniform red cytoplasm wash, no nucleus/organelles, no sheet-on-surface artifact)
  ![watercolor 3](theme/watercolor/erythrocyte.attempts/gen-03__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/erythrocyte.watercolor.svg)
[interactive SVG](theme/watercolor/erythrocyte.watercolor.svg) · [HTML](theme/watercolor/erythrocyte.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `SEM` · Public domain (US federal government work) · Bruce Wetzel & Harry Schaefer, National Cancer Institute (visualsonline.cancer.gov) — pass (Wikimedia Commons "SEM blood cells.jpg", NCI/Wetzel & Schaefer, public domain; cropped + cleaned/false-colorized display version clearly shows three biconcave-disc red blood cells with visible central dimples, no text or scale bar)
  ![reference](../reference-microscopy/theme/sem/erythrocyte.attempts/real-04__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 4 | use as final; accurate biconcave-disc cutaway with membrane skeleton mesh and homogeneous haemoglobin cytoplasm after 3 earlier attempts read as nucleus-like or bowl-shaped |
| sem | pass | 1 | use as final; convincing false-colour surface-only biconcave disc, correct shape and texture on first attempt |
| 3d | pass | 1 | use as final; natural-tint glossy biconcave disc with correct interior cutaway on first attempt |
| watercolor | pass | 3 | use as final after 2 re-renders to fix a misleading nucleus-like central ball; final attempt shows a true shallow dimple |
