# Measles virus (Morbillivirus) — render log

**Set:** `pathogens-viruses` · **Microbe key:** `measles-virus`
**Short description:** Enveloped, pleomorphic negative-sense RNA virus of the Paramyxoviridae (genus Morbillivirus), ~100-300 nm, studded with hemagglutinin (H) and fusion (F) spikes but carrying NO neuraminidase, its single non-segmented genome wound into a herringbone-like helical nucleocapsid; the most contagious human virus, prevented by the MMR vaccine.

Metadata sidecar: [`measles-virus.render.meta.json`](measles-virus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

Measles virus (*Morbillivirus hominis*, genus *Morbillivirus*, family **Paramyxoviridae**, order Mononegavirales) is an **enveloped, pleomorphic** particle — roughly spherical but irregular and soft-edged, commonly quoted as **100–300 nm** across (ViralZone gives 150–300 nm for the genus; the CDC micrograph of a single virion is labelled 100–200 nm). Filamentous forms occur. The outer boundary is a **host-derived lipid-bilayer envelope** carrying exactly **two kinds of glycoprotein spike**, both short and closely spaced, giving the particle a finely bristled rather than a long-spiked corona look:

- **Hemagglutinin (H)** — the *attachment* protein, a tetramer built from two dimers, seen as a **globular/mushroom head on a short stalk**. It binds the host receptors **SLAMF1/CD150** (immune cells) and **nectin-4/PVRL4** (airway epithelium); laboratory/vaccine strains also use CD46.
- **Fusion (F)** — a trimer forming a **narrower, cone-/triangle-shaped spike** that fuses the envelope with the host plasma membrane at **neutral pH** (no endosomal acidification needed) and drives the formation of multinucleate **syncytia** (Warthin–Finkeldey giant cells) in infected tissue.

A thin layer of **matrix protein (M)** coats the inner leaflet of the envelope and organises assembly and budding; cryo-electron tomography shows M forming a helical coat directly on the ribonucleocapsid inside intact virions (Liljeroos et al., PNAS 2011).

Inside sits the defining structure: a **helical nucleocapsid**, a flexible tube roughly **12–21 nm wide**, made of thousands of copies of **nucleoprotein (N)** wrapped around **one single, continuous, linear, non-segmented negative-sense ssRNA genome of 15 894 nucleotides**. In negative-stain EM this coiled, cross-ridged tube shows the classic **"herringbone" pattern**. Bound to it is the polymerase machine: the **phosphoprotein (P)** plus the **large protein (L)**, the RNA-dependent RNA polymerase. Inside the virion the nucleocapsid is loosely and irregularly coiled — it fills the particle like a bundled telephone cord, not like a geometric shell.

Two facts define the genus and matter for the drawing: morbilliviruses have **no neuraminidase** (unlike mumps/parainfluenza, which carry a combined HN protein), and the genome is **one piece**, not segmented (unlike influenza). Measles is also **serologically monotypic** — one single serotype worldwide despite 24 genotypes — which is why a single successful immunisation protects for life and why the vaccine has not needed reformulation.

Sources: [ViralZone / Expasy — *Morbillivirus*](https://viralzone.expasy.org/by_species/86), [NCBI Bookshelf — Baron's *Medical Microbiology*, Paramyxoviruses](https://www.ncbi.nlm.nih.gov/books/NBK8461/), [Liljeroos et al., *PNAS* 2011 — cryo-ET of measles virions](https://www.pnas.org/doi/10.1073/pnas.1105770108), [CDC — Measles (Pinkbook)](https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-13-measles.html), [WHO — Measles fact sheet](https://www.who.int/news-room/fact-sheets/detail/measles).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where |
|---|---|---|---|---|---|
| `envelope` | membrana viri (bistratum lipidicum) | Lipid envelope | Lipidhülle | host-derived lipid bilayer forming the outer boundary | outer boundary |
| `hemagglutinin` | haemagglutininum (H) | Hemagglutinin (H) spike | Hämagglutinin (H) | globular head on a short stalk; binds SLAMF1/CD150 and nectin-4 | surface |
| `fusion` | proteinum fusionis (F) | Fusion (F) protein spike | Fusionsprotein (F) | narrow cone-shaped trimer; fuses membranes at neutral pH, makes syncytia | surface |
| `matrix` | proteinum matricis (M) | Matrix protein (M) | Matrixprotein (M) | thin inner protein layer lining the envelope; assembly and budding | just inside the envelope |
| `nucleocapsid` | nucleocapsidum helicoideum (N) | Helical nucleocapsid (N) | Helikales Nukleokapsid (N) | 12–21 nm N-protein tube with herringbone ridging, loosely coiled inside | interior |
| `genome` | genoma RNA singulare, non segmentatum | Non-segmented (-)RNA genome | Unsegmentiertes (-)RNA-Genom | ONE continuous 15 894-nt negative-sense ssRNA strand inside the N tube | inside the nucleocapsid |
| `polymerase` | complexus polymerasi (P·L) | RNA polymerase complex (P·L) | RNA-Polymerase-Komplex (P·L) | P + L RNA-dependent RNA polymerase riding on the nucleocapsid | on the nucleocapsid |

### Do NOT draw (scientifically misleading)

- **Neuraminidase spikes / a second mushroom "NA" knob type of the influenza kind** — morbilliviruses have **no neuraminidase**. Only H (globular head on a stalk) and F (narrow cone) spikes exist.
- **A segmented genome (8 pieces, influenza-style)** — measles carries **exactly ONE continuous, linear RNA strand**; never several separate rods.
- **A rigid icosahedral or geometric capsid shell** — the interior is a *helical*, flexible, loosely coiled nucleocapsid tube.
- **DNA or a double helix** — the genome is **single-stranded negative-sense RNA**.
- **A naked, bare RNA loop or a tidy circle of RNA** — the genome is linear and completely sheathed in N protein; show the coiled tube, not a bare ribbon ring.
- **Long club-shaped SARS-CoV-2-style corona spikes as the only surface feature** — measles spikes are short and densely packed.
- **A perfectly smooth, perfectly round, crystalline particle** — it is pleomorphic, soft-edged and irregular.
- **A bacteriophage head-and-tail body, tail fibres or legs.**
- **Red spots / a rash / skin painted onto the virion** — the rash is on the patient, not on the particle.
- **A face, eyes or any anthropomorphism**, and no text, letters, numbers, arrows, scale bars or watermarks.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #8429 — TEM of a single measles virion** — public domain.
- file: https://upload.wikimedia.org/wikipedia/commons/6/62/Measles_virus.JPG
- page: https://commons.wikimedia.org/wiki/File:Measles_virus.JPG · License: **Public Domain (PD-USGov-HHS-CDC)** · CDC Public Health Image Library #8429 / Cynthia S. Goldsmith, content provider CDC/William Bellini, Ph.D.
- backup: https://upload.wikimedia.org/wikipedia/commons/1/1e/Measlesvirus.jpg ([page](https://commons.wikimedia.org/wiki/File:Measlesvirus.jpg), CDC, Public Domain)
AI visual verification result: see §5 — a **single isolated virion**, exactly the preferred case: a roughly spherical, slightly irregular enveloped particle with a fine bristly spike fringe and the internal nucleocapsid visible as a coiled, granular mass. Ideal teaching reference.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the measles virus, a soft fuzzy little ball with one enormous talent: floating. When somebody coughs, it sails off into the air and can still be drifting around the room two hours later, which makes it the long-distance champion of the whole virus world - one single sneeze can reach an entire classroom. Inside its bristly coat it keeps one long thread of instructions, coiled up like a tiny telephone cord. Here is the clever part: once measles is inside somebody, no medicine can simply switch it off, so people win this race before it even starts. Two small jabs of the MMR vaccine hand your body the complete measles building plan years ahead of time, and after that the great floating champion has nowhere left to land.  
🇩🇪 Das ist das Masernvirus, ein weiches, flauschiges Kügelchen mit einem riesigen Talent: Schweben. Wenn jemand hustet, segelt es durch die Luft und schwebt manchmal noch zwei Stunden später im Zimmer herum - damit ist es der Weitflug-Weltmeister unter allen Viren, denn ein einziges Niesen erreicht eine ganze Schulklasse. Unter seinem borstigen Mantel bewahrt es einen einzigen langen Faden mit seiner Bauanleitung auf, aufgewickelt wie ein winziges Telefonkabel. Und jetzt kommt der Trick: Ist das Masernvirus erst einmal drin, kann kein Medikament es einfach abschalten - deshalb gewinnt man dieses Rennen, bevor es überhaupt losgeht. Zwei kleine Piks mit der MMR-Impfung geben deinem Körper den kompletten Masern-Bauplan schon Jahre im Voraus. Danach findet der große Weitflug-Weltmeister einfach keinen Landeplatz mehr.

**Adults (popular science, health).**  
🇬🇧 Measles is the most contagious virus known in humans: one infected person infects an average of 12 to 18 susceptible contacts, and the aerosol they leave behind stays infectious in a room for up to two hours. After roughly ten days of incubation come high fever, cough, runny nose and red eyes, the tiny white Koplik spots inside the cheeks, and then the familiar rash spreading from the face downwards. The real problem is what travels with it: ear infections and pneumonia are common, about one case in a thousand develops encephalitis, and years later the rare but invariably fatal brain disease SSPE can follow. Measles also wipes out part of the immune memory a person had already built up against other germs - so-called immune amnesia - leaving children more vulnerable to unrelated infections for months or even years afterwards. No drug attacks the virus itself; care is supportive, and vitamin A is given to children because it measurably reduces deaths. What does work is prevention. Two doses of the MMR vaccine are about 97% effective, and because measles exists as only one serotype worldwide, that protection generally lasts a lifetime. Around 95% coverage in a community is needed to stop the virus circulating at all.  
🇩🇪 Masern sind das ansteckendste bekannte Virus des Menschen: Eine infizierte Person steckt im Schnitt 12 bis 18 empfängliche Kontaktpersonen an, und das zurückgelassene Aerosol bleibt bis zu zwei Stunden lang im Raum infektiös. Nach etwa zehn Tagen Inkubationszeit folgen hohes Fieber, Husten, Schnupfen und gerötete Augen, die winzigen weißen Koplik-Flecken an der Wangenschleimhaut und schließlich der bekannte Ausschlag, der sich vom Gesicht abwärts ausbreitet. Das eigentliche Problem sind die Begleiter: Mittelohrentzündungen und Lungenentzündungen sind häufig, etwa einer von tausend Fällen entwickelt eine Gehirnentzündung, und Jahre später kann die seltene, immer tödliche Hirnerkrankung SSPE auftreten. Masern löschen zudem einen Teil des bereits aufgebauten Immungedächtnisses gegen andere Erreger - die sogenannte Immunamnesie - und lassen Kinder noch Monate bis Jahre danach anfälliger für ganz andere Infektionen zurück. Gegen das Virus selbst gibt es kein Medikament; behandelt werden nur die Beschwerden, und Kinder erhalten Vitamin A, weil es die Sterblichkeit nachweislich senkt. Wirksam ist die Vorbeugung: Zwei Dosen der MMR-Impfung schützen zu etwa 97%, und da Masern weltweit nur in einem einzigen Serotyp vorkommen, hält dieser Schutz in aller Regel lebenslang. Rund 95% Durchimpfung in der Bevölkerung sind nötig, damit das Virus gar nicht mehr zirkuliert.

**Scientific.**  
🇬🇧 Measles virus (Morbillivirus hominis, genus Morbillivirus, family Paramyxoviridae, order Mononegavirales) is an enveloped, pleomorphic virion of roughly 100-300 nm. The host-derived lipid envelope carries two glycoproteins and, unlike the respiroviruses and rubulaviruses, no neuraminidase: the tetrameric hemagglutinin (H), a globular head on a short stalk that binds SLAMF1/CD150 on immune cells and nectin-4 on airway epithelium (CD46 for laboratory-adapted and vaccine strains), and the trimeric fusion protein (F), which mediates pH-independent fusion at the plasma membrane and drives syncytium formation. A matrix (M) layer coats the inner leaflet of the envelope and, as shown by cryo-electron tomography, forms a helical coat directly on the ribonucleocapsid. The genome is a single, linear, non-segmented negative-sense ssRNA of 15,894 nucleotides, encapsidated along its full length by nucleoprotein (N) into a 12-21 nm helical nucleocapsid with the classic herringbone appearance, associated with the phosphoprotein (P) and the large protein (L) that together constitute the RNA-dependent RNA polymerase. Replication follows the mononegavirus start-stop transcription gradient in the cytoplasm; V and C proteins antagonise interferon signalling. Infection of SLAM-positive memory lymphocytes depletes pre-existing humoral memory (immune amnesia), and persistent CNS infection can produce subacute sclerosing panencephalitis. Measles is antigenically monotypic, which underpins the durable protection of the live attenuated vaccine despite 24 circulating genotypes.  
🇩🇪 Das Masernvirus (Morbillivirus hominis, Gattung Morbillivirus, Familie Paramyxoviridae, Ordnung Mononegavirales) ist ein behülltes, pleomorphes Virion von etwa 100-300 nm. Die wirtseigene Lipidhülle trägt zwei Glykoproteine und - anders als bei Respiro- und Rubulaviren - keine Neuraminidase: das tetramere Hämagglutinin (H), ein kugeliger Kopf auf kurzem Stiel, der an SLAMF1/CD150 auf Immunzellen und an Nectin-4 auf dem Atemwegsepithel bindet (CD46 bei labor-adaptierten und Impfstämmen), sowie das trimere Fusionsprotein (F), das die pH-unabhängige Fusion an der Plasmamembran vermittelt und die Bildung von Synzytien antreibt. Eine Matrixschicht (M) kleidet die Hülle von innen aus und legt sich, wie die Kryo-Elektronentomographie zeigt, als helikaler Mantel direkt auf das Ribonukleokapsid. Das Genom ist eine einzelne, lineare, unsegmentierte negativsträngige ssRNA von 15.894 Nukleotiden, die über ihre gesamte Länge vom Nukleoprotein (N) zu einem 12-21 nm dicken helikalen Nukleokapsid mit dem klassischen Fischgrätmuster verpackt wird und mit dem Phosphoprotein (P) und dem Large-Protein (L) assoziiert ist, die zusammen die RNA-abhängige RNA-Polymerase bilden. Die Replikation folgt im Zytoplasma dem Start-Stopp-Transkriptionsgradienten der Mononegaviren; die V- und C-Proteine hemmen die Interferonantwort. Die Infektion SLAM-positiver Gedächtnislymphozyten löscht vorbestehendes humorales Immungedächtnis (Immunamnesie), und eine persistierende ZNS-Infektion kann zur subakuten sklerosierenden Panenzephalitis führen. Masern sind antigenisch monotypisch - darauf beruht der dauerhafte Schutz des attenuierten Lebendimpfstoffs trotz 24 zirkulierender Genotypen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE measles virus particle (Morbillivirus, family Paramyxoviridae), centered in a square 1:1 1080x1080 frame with lots of empty negative space around it for later labels. Semi-flat vector-style shading with THIN clean outlines (never heavy black cartoon strokes) and a MUTED, desaturated educational palette of soft dusty tints, on a neutral dark charcoal uncluttered background that fills the frame edge-to-edge with no border, frame or vignette. The virion is a roughly spherical but clearly PLEOMORPHIC, slightly irregular soft-edged ENVELOPED particle. Its surface is densely covered by SHORT, closely-spaced protein spikes of exactly TWO kinds: many hemagglutinin (H) attachment spikes drawn as small globular mushroom-like heads on very short stalks in muted slate-blue, and many fusion (F) protein spikes drawn as narrower cone-shaped / triangular spikes in soft ochre-gold. There is NO neuraminidase and no third spike type. A neat quarter cut-away reveals the interior: a thin warm dusty-coral lipid-bilayer envelope, a thin pale sage-green matrix-protein (M) layer lining it from inside, and filling the interior ONE single long continuous helical nucleocapsid - a coppery-amber flexible tube with fine regular cross-ridges (a herringbone texture) that is loosely and irregularly coiled and folded back on itself like a bundled telephone cord, with a few small deep-plum polymerase (P and L) beads riding on it. Show exactly ONE continuous coiled tube, never several separate rods or segments. Do NOT draw a rigid geometric icosahedral capsid, no segmented genome, no DNA double helix, no bare naked RNA loop or ring, no long club-shaped coronavirus spikes, no bacteriophage tail or legs, no face, no rash or red spots. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE measles virus particle, centered in a square 1:1 1080x1080 frame with generous empty margin, filling the frame edge-to-edge with no border, frame or vignette. The virion is a roughly spherical but distinctly PLEOMORPHIC, slightly lumpy and irregular enveloped particle resting on a subtly textured neutral substrate, with crisp 3D surface texture, fine grain and shallow depth of field. Its entire surface is densely studded with SHORT, closely packed protein spikes giving a fine bristly, velvety fringe rather than long spikes: numerous small globular knob-headed hemagglutinin (H) spikes on very short stalks mixed with slightly narrower cone-shaped fusion (F) spikes. The spikes are short and dense - do not render long club-shaped coronavirus-style spikes. False-color palette: a warm salmon-to-amber virion body against a cool muted teal-grey background. SEM shows the outer surface only, so render NO internal structures at all. Anatomically faithful, single specimen only, no duplicate particles. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE measles virus particle (Morbillivirus), centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, subsurface scattering on the membrane, and a clean seamless dark studio background filling the frame edge-to-edge with no border or vignette. The virion is an idealized-for-clarity but believable, softly irregular PLEOMORPHIC enveloped sphere. Its surface is densely covered by SHORT, closely-spaced spikes of exactly TWO types in natural translucent biological tones: many small globular mushroom-headed hemagglutinin (H) spikes on short stalks in muted slate-blue, and many narrower cone-shaped fusion (F) spikes in soft ochre-gold. No neuraminidase, no third spike type, no long coronavirus clubs. Use a gentle cut-away or partial translucency to reveal the interior: a warm dusty-coral translucent lipid envelope, a thin pale sage-green matrix (M) layer lining it, and filling the inside ONE single long continuous helical nucleocapsid modelled as a coppery-amber flexible tube with fine regular cross-ridges, loosely and irregularly coiled and folded back on itself like a bundled telephone cord, carrying a few small deep-plum polymerase (P and L) beads. Exactly ONE continuous coiled tube - never several separate rods, never a segmented genome. Colorize with natural, believable biological tints so every structure is clearly distinguishable, not near-monochrome and not neon. Do NOT render a rigid icosahedral capsid, no DNA double helix, no bare RNA loop, no phage tail, no face, no rash or red spots. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific watercolour plate of a SINGLE measles virus particle (Morbillivirus) in the style of a 19th-century atlas, yet anatomically modern and correct. Square 1:1 1080x1080. The warm aged cream paper MUST FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner - the paper IS the background; do NOT paint a separate sheet, card, page, mat, border, frame, panel or drop shadow, and no surface or table underneath. Single large specimen centred, with a soft darker wash halo painted directly onto the paper behind it. Soft translucent watercolour washes with fine ink linework. The virion is a softly irregular, pleomorphic enveloped sphere whose whole rim is fringed with SHORT, densely packed protein spikes of two kinds: small globular mushroom-headed hemagglutinin (H) spikes on short stalks in muted slate-blue, and narrower cone-shaped fusion (F) spikes in soft ochre-gold. No neuraminidase, no long club-shaped coronavirus spikes. A soft painterly cut-away hints at the interior: a thin dusty-coral lipid envelope, a pale sage-green matrix layer lining it, and ONE single long continuous coppery-amber helical nucleocapsid tube with fine cross-ridging, loosely coiled and folded back on itself like a bundled telephone cord, with a few tiny deep-plum polymerase beads on it. Exactly ONE continuous coiled tube, never several separate segments. Do NOT paint a rigid icosahedral capsid, no DNA double helix, no bare RNA ring, no phage tail, no face, no rash or red spots. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 2525 tok, $0.048
- attempt 1 · `gemini-3-pro-image` · 23.6s — ✅ PASS (gemini-3-pro-image) — muted dusty educational palette with thin clean outlines on a neutral dark charcoal background, filling the frame edge-to-edge. Clean quarter cut-away shows the coral lipid envelope, the pale sage matrix (M) lining, and ONE continuous coppery cross-ridged nucleocapsid tube loosely coiled like a bundled cord with three plum P·L polymerase beads. Exactly two spike types (slate-blue globular H heads on short stalks, ochre-gold cone-shaped F spikes), no neuraminidase, no icosahedral capsid, no segments, no text/border/face. Chosen as label base.
  ![textbook 1](theme/textbook/measles-virus.attempts/gen-01__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/measles-virus.textbook.svg)
[interactive SVG](theme/textbook/measles-virus.textbook.svg) · [HTML](theme/textbook/measles-virus.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1834 tok, $0.040
- attempt 1 · `gemini-3-pro-image` · 18.3s — ✅ PASS (gemini-3-pro-image) — photorealistic false-colour SEM of a single, distinctly pleomorphic and lumpy enveloped virion on a textured substrate, densely covered by SHORT bristly spikes (no long coronavirus clubs). Warm salmon-to-amber body on a cool teal-grey background, fills the frame edge-to-edge, surface only, no internal structures, no text/border.
  ![sem 1](theme/sem/measles-virus.attempts/gen-01__gemini-3-pro-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 2086 tok, $0.042
- attempt 1 · `gemini-3-pro-image` · 17.6s — ✅ PASS (gemini-3-pro-image) — believable 3D medical-illustration virion with soft global illumination and rim light on a dark studio background. Natural biological tints throughout: translucent coral envelope, sage matrix layer, one continuous coppery helical nucleocapsid coiled inside with plum polymerase beads. Two distinct short spike types (slate-blue H knobs, ochre F cones), no neuraminidase, no segmented genome, no text/border/face.
  ![3d 1](theme/3d/measles-virus.attempts/gen-01__gemini-3-pro-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/measles-virus.3d.svg)
[interactive SVG](theme/3d/measles-virus.3d.svg) · [HTML](theme/3d/measles-virus.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 2227 tok, $0.047
- attempt 1 · `gemini-3-pro-image` · 22.8s — ✅ PASS (gemini-3-pro-image) — warm aged cream paper fills the entire frame corner-to-corner with a soft darker wash halo painted directly on it; no sheet, mat, frame or drop shadow. Fine ink linework over translucent washes, single large centred specimen, two distinct spike types, painterly cut-away with the sage matrix band and ONE continuous coiled coppery nucleocapsid with polymerase beads. No text, no border.
  ![watercolor 1](theme/watercolor/measles-virus.attempts/gen-01__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/measles-virus.watercolor.svg)
[interactive SVG](theme/watercolor/measles-virus.watercolor.svg) · [HTML](theme/watercolor/measles-virus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public Domain (PD-USGov-HHS-CDC) · CDC Public Health Image Library #8429 / Cynthia S. Goldsmith, content provider CDC/William Bellini, Ph.D. — ✅ PASS — CDC PHIL #8429 (public domain, Cynthia S. Goldsmith): a SINGLE isolated measles virion, exactly the preferred case. The slightly irregular pleomorphic envelope with its fine granular spike fringe and the loosely coiled internal nucleocapsid strands are clearly readable. Cleaned with edit_image.py: cropped to the one complete virion, neighbouring partial particles suppressed, and a natural false-colour applied (warm salmon virion body on a cool teal-grey background); no text, scale bar or border remains.
  ![reference](theme/tem/measles-virus.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | gemini-3-pro-image; best structural clarity for labelling, all seven structures separable |
| sem | ✅ teaching-ready | 1 | gemini-3-pro-image; realistic false-colour surface, correct short dense spike fringe |
| 3d | ✅ teaching-ready | 1 | gemini-3-pro-image; natural tints, believable cut-away with a single coiled nucleocapsid |
| watercolor | ✅ teaching-ready | 1 | gemini-3-pro-image; full-bleed aged paper, correct morphology, black-on-paper labels |
| reference TEM | ✅ verified (single isolated virion) | 2 | CDC PHIL #8429 public domain, cleaned + false-coloured |
