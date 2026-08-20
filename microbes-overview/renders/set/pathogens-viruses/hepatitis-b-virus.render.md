# Hepatitis B virus (HBV) — render log

**Set:** `pathogens-viruses` · **Microbe key:** `hepatitis-b-virus`
**Short description:** Enveloped, partially double-stranded DNA hepadnavirus (the ~42 nm "Dane particle") that infects liver cells and can persist as chronic infection; the leading viral cause of cirrhosis and hepatocellular carcinoma worldwide. Spreads via blood, sexual contact and mother-to-child transmission; prevented by a highly effective vaccine.

Metadata sidecar: [`hepatitis-b-virus.render.meta.json`](hepatitis-b-virus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

Hepatitis B virus (HBV, family *Hepadnaviridae*, genus *Orthohepadnavirus*) is a small enveloped DNA virus. The complete, infectious virion — the **Dane particle** — is a sphere about **42 nm** in diameter, one of the smallest enveloped animal viruses. Its outer **lipid envelope** is host-derived (from the infected hepatocyte's ER/Golgi membrane) and is studded with the **Hepatitis B surface antigen (HBsAg)**, present as three related transmembrane proteins of increasing length — **small (S), middle (M) and large (L)** — that form short, sparse, blunt knob-like projections over the envelope (not long club-shaped spikes like coronavirus, not a dense fur). Inside the envelope sits an **icosahedral nucleocapsid** (core, T=3 or T=4), built from many copies of the **core protein (HBcAg)**, about 27 nm across. The nucleocapsid encloses the genome: a small, **relaxed-circular, partially double-stranded DNA (rcDNA)** of only about 3.2 kb — the smallest genome of any known DNA virus that infects animals — with a complete minus strand and an incomplete, variable-length plus strand. A single molecule of the viral **polymerase (P protein)**, which has reverse-transcriptase activity, stays covalently attached to the 5′ end of the minus strand inside the core. Vastly more numerous than complete Dane particles are non-infectious **subviral particles** — 22 nm spheres and filaments made only of envelope lipid and HBsAg, with no capsid or genome inside — which the liver secretes in huge excess and which form the basis of HBsAg blood tests and the HBV vaccine antigen; they are a real and important part of HBV biology but are not the main teaching specimen here (draw the complete Dane particle).

Sources: [ViralZone / Expasy — Hepatitis B virus](https://viralzone.expasy.org/1280), [Wikipedia — Hepatitis B virus (structure, Dane particle, HBsAg S/M/L, rcDNA genome)](https://en.wikipedia.org/wiki/Hepatitis_B_virus), [WHO — Hepatitis B fact sheet (transmission, chronic infection, cirrhosis/liver cancer, vaccine)](https://www.who.int/news-room/fact-sheets/detail/hepatitis-b), [MedlinePlus — Hepatitis B (transmission, vaccination)](https://medlineplus.gov/hepatitisb.html).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `envelope` | involucrum lipidicum (bilayer) | Lipid envelope | Lipidhülle | host-derived lipid bilayer; outer coat carrying HBsAg, mediates attachment | outermost boundary | core (enveloped) |
| `hbsag` | antigenum superficiale (HBsAg, S/M/L) | Surface antigen (HBsAg) | Oberflächenantigen (HBsAg) | short blunt envelope proteins (S, M, L forms); mediates receptor binding; main antibody/vaccine target | studded sparsely over the envelope | core (defining feature) |
| `nucleocapsid` | nucleocapsis (HBcAg), icosahedralis | Nucleocapsid / core (HBcAg) | Nukleokapsid/Core (HBcAg) | icosahedral protein shell that packages and protects the genome | inside the envelope, ~27 nm | core |
| `genome` | DNA circulare relaxatum, partim duplex | Relaxed-circular partially double-stranded DNA | Teilweise doppelsträngige, relaxiert-zirkuläre DNA | ~3.2 kb genome; smallest known animal-infecting DNA-virus genome | coiled inside the nucleocapsid | core (DNA only, never RNA) |
| `polymerase` | polymerasa viralis (proteinum P) | Polymerase (P protein) | Polymerase (P-Protein) | reverse transcriptase; covalently attached to the DNA minus strand; replicates the genome | attached to the genome inside the core | core |

### Do NOT draw (scientifically misleading)
- **No face, eyes, mouth or expression** — a virion is a particle, not a creature.
- **Not a cell** — no nucleus, mitochondria, ER, Golgi, cytoplasm or ribosomes; the virion itself carries none of these.
- **No RNA, no single strand, no double helix rendered as RNA** — the genome is **DNA**, relaxed-circular and only *partially* double-stranded; show a coiled/looped double-stranded ring with a short single-stranded gap, never a classic straight double helix and never RNA.
- **HBsAg knobs are short and blunt, sparse and irregular** — not long club/lollipop-shaped trimers (that is coronavirus Spike), not flagella, tails, hairs or bristles, and not a dense uniform fur.
- **The nucleocapsid is icosahedral (a compact geometric shell), not helical** — do not draw a coiled beads-on-a-string ribonucleoprotein (that is the coronavirus/influenza nucleocapsid style).
- **Do not draw only the empty 22 nm subviral spheres/filaments as the main specimen** — the teaching subject is the complete Dane particle (envelope + nucleocapsid + genome + polymerase); subviral particles may appear tiny and few in the background at most, never as the labelled subject.
- **Do not draw it bacterium-sized** — at ~42 nm it is far smaller than any bacterium; keep it a compact, simple sphere, not an elaborate structure.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #10755** — colorized transmission electron micrograph of Hepatitis B virus Dane particles (orange), public domain.
- file: https://upload.wikimedia.org/wikipedia/commons/6/65/10755_lores.jpg
- page: https://commons.wikimedia.org/wiki/File:10755_lores.jpg · License: **Public Domain (PD-USGov-HHS-CDC, PHIL #10755)** · CDC / Dr. Erskine Palmer · modality: TEM (colorized)
- backup: **CDC PHIL #5631** — grayscale TEM of Dane particles with visible ~27 nm cores. file: https://upload.wikimedia.org/wikipedia/commons/1/12/Hepatitis-B_virions.jpg · page: https://commons.wikimedia.org/wiki/File:Hepatitis-B_virions.jpg · License: **Public Domain (PD-USGov-HHS-CDC, PHIL #5631)** · CDC
AI visual verification result: **PASS (2026-08-13).** Four orange-colorized Dane particles (~42 nm, roughly spherical, textured/knobby envelope surface consistent with sparse HBsAg projections) on a dark navy TEM field — genuinely HBV, not a look-alike. A small cluster rather than a single isolated particle, but each specimen's rounded envelope and granular surface texture are individually readable, satisfying the "clearly shows the microbe's features" bar. The raw download (real-01) had no baked text but needed recomposition; two clean passes (real-02, real-03) removed nothing extra but left a light/white margin around the dark field, which a third clean pass (real-04) fixed by extending the dark background edge-to-edge. **real-04 is used for display.**
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet Hepatitis B: a tiny, tiny ball, much smaller than almost any germ you've heard of, so small it could hide inside a single one of your liver cells. It wears a soft round coat covered in little bumps, and inside it carries a coiled loop of its own DNA instructions. Hepatitis B likes to sneak in through blood or from a parent to a baby, and once inside it tries to move into your liver and stay there quietly for a long time. The best trick against it isn't a fight at all: a simple vaccine given as a baby teaches your body to recognise it instantly, so most people who are vaccinated never let it in the door in the first place.  
🇩🇪 Das ist Hepatitis B: eine winzig kleine Kugel, viel kleiner als fast jeder Keim, von dem du je gehört hast, so klein, dass sie sich in einer einzigen deiner Leberzellen verstecken könnte. Sie trägt einen weichen runden Mantel voller kleiner Beulen, und im Inneren trägt sie eine aufgerollte Schleife ihrer eigenen DNA-Bauanleitung. Hepatitis B schleicht sich gern über Blut oder von einem Elternteil aufs Baby ein, und drinnen versucht sie, in deine Leber zu ziehen und dort lange still zu bleiben. Der beste Trick gegen sie ist gar kein Kampf: Eine einfache Impfung im Babyalter bringt deinem Körper bei, sie sofort zu erkennen, sodass die meisten geimpften Menschen sie gar nicht erst hereinlassen.

**Adults (popular science, health).**  
🇬🇧 Hepatitis B virus is one of the smallest viruses that infects humans, a roughly 42-nanometre sphere wrapped in a lipid envelope studded with its signature surface protein, HBsAg. It spreads through blood, sexual contact and from mother to child during birth, and it specifically targets liver cells, where it can either clear within months or settle into a lifelong chronic infection carried by an estimated 250 million people worldwide. Chronic infection is the quiet danger: it can slowly scar the liver into cirrhosis and, over decades, raise the risk of liver cancer, often without symptoms until damage is advanced. The good news is that HBV is one of the great vaccine success stories in medicine; a safe, highly effective vaccine given in infancy has already prevented millions of chronic infections, and antiviral drugs can control the virus in people who are already living with it.  
🇩🇪 Das Hepatitis-B-Virus ist eines der kleinsten Viren, die Menschen infizieren, eine etwa 42 Nanometer große Kugel, umhüllt von einer Lipidhülle mit ihrem charakteristischen Oberflächenprotein HBsAg. Es wird über Blut, Sexualkontakt und von der Mutter auf das Kind bei der Geburt übertragen und befällt gezielt Leberzellen, wo es entweder innerhalb weniger Monate abklingt oder zu einer lebenslangen chronischen Infektion wird, von der weltweit schätzungsweise 250 Millionen Menschen betroffen sind. Die chronische Infektion ist die stille Gefahr: Sie kann die Leber langsam vernarben lassen, bis hin zur Zirrhose, und über Jahrzehnte das Risiko für Leberkrebs erhöhen, oft ohne Symptome, bis der Schaden schon fortgeschritten ist. Die gute Nachricht: HBV ist eine der großen Erfolgsgeschichten der Impfmedizin; eine sichere, hochwirksame Impfung im Säuglingsalter hat bereits Millionen chronischer Infektionen verhindert, und antivirale Medikamente können das Virus bei bereits Infizierten gut in Schach halten.

**Scientific.**  
🇬🇧 Hepatitis B virus (Hepadnaviridae, Orthohepadnavirus) forms an infectious 42 nm virion, the Dane particle, comprising a host-derived lipid envelope studded with small, middle and large surface proteins (HBsAg) surrounding an icosahedral nucleocapsid built from HBcAg. The nucleocapsid encloses a 3.2 kb relaxed-circular, partially double-stranded DNA genome with the polymerase (P protein, reverse transcriptase) covalently bound to the minus strand. After receptor-mediated entry via NTCP on hepatocytes, the genome is repaired to covalently closed circular DNA (cccDNA) in the nucleus, which serves as the template for pregenomic RNA and is the principal reservoir underlying chronic infection. Replication proceeds by reverse transcription of the pregenomic RNA within cytoplasmic capsids, a strategy unique among DNA viruses. Persistent cccDNA, HBx-mediated modulation of host gene expression, and chronic immune-mediated liver injury together drive progression to cirrhosis and hepatocellular carcinoma, making cccDNA the key target of curative research.  
🇩🇪 Das Hepatitis-B-Virus (Hepadnaviridae, Orthohepadnavirus) bildet ein infektiöses 42 nm großes Virion, das Dane-Partikel, bestehend aus einer wirtseigenen Lipidhülle mit kleinen, mittleren und großen Oberflächenproteinen (HBsAg), die ein aus HBcAg aufgebautes ikosaedrisches Nukleokapsid umgeben. Das Nukleokapsid umschließt ein 3,2 kb großes, relaxiert-zirkuläres, teilweise doppelsträngiges DNA-Genom, an dessen Minusstrang die Polymerase (P-Protein, Reverse Transkriptase) kovalent gebunden ist. Nach rezeptorvermittelter Aufnahme über NTCP an Hepatozyten wird das Genom im Zellkern zu kovalent geschlossener zirkulärer DNA (cccDNA) repariert, die als Matrize für die prägenomische RNA dient und das zentrale Reservoir der chronischen Infektion darstellt. Die Replikation erfolgt durch reverse Transkription der prägenomischen RNA in zytoplasmatischen Kapsiden, eine unter DNA-Viren einzigartige Strategie. Persistierende cccDNA, die durch HBx vermittelte Modulation der Wirtsgenexpression und die chronische immunvermittelte Leberschädigung treiben gemeinsam die Progression zu Zirrhose und hepatozellulärem Karzinom voran, weshalb cccDNA das zentrale Ziel kurativer Forschung ist.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway in the EXACT house style of the plates rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (NEVER bright primary or cartoon colours), THIN clean outlines (NOT heavy black cartoon strokes), gentle soft shading with subtle dimensionality, and a distinct soft colour fill for each structure. Refined and elegant, NOT a bold-outlined flat cartoon. Subject: one small spherical Hepatitis B virus (HBV) Dane particle. CRITICAL — this is NOT a coronavirus and must NOT be drawn like one: the envelope surface is MOSTLY SMOOTH, almost featureless, interrupted by only a few tiny, low, blunt, irregularly-scattered bumps (the surface antigen, HBsAg) — do NOT cover the sphere with radiating rod-like, club-shaped, lollipop-shaped or petal-shaped spikes, do NOT draw a dense ring/crown of uniform projections all around the equator, do NOT make it look like a spiky pom-pom or a classic 'coronavirus ball' illustration. Keep the outer silhouette a clean, gently-bumped circle, not a gear/cog shape. A quarter cut-away reveals a small icosahedral nucleocapsid (core) inside, and within that a tightly coiled relaxed-circular, partially double-stranded DNA genome shown as a compact looped ring with a short single-strand gap (NOT a straight double helix, NOT RNA), with a single small polymerase protein attached to the DNA. Not a cell, no face, no eyes, no mouth. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Neutral dark charcoal uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning-electron-micrograph surface view of a single small roughly spherical Hepatitis B virus (HBV) Dane particle, warm amber-to-bronze false-color on a dark charcoal field, crisp 3D surface texture and shallow depth of field. CRITICAL — this is NOT a coronavirus and must NOT be drawn like one: render a mostly SMOOTH, gently textured spherical surface with only a few small, low, blunt, irregular bumps scattered sparsely (the surface antigen, HBsAg) — do NOT cover the sphere with a dense field of rod-like, club-shaped or petal-shaped spikes, do NOT make the silhouette look spiky, jagged or gear-like; the outline should read as a soft, nearly smooth circle. Surface only, no internal structures visible, no face. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical still of one small spherical Hepatitis B virus (HBV) Dane particle, soft global illumination, subsurface scattering on the translucent grey-blue lipid envelope, and a gentle cut-away revealing the interior: a small icosahedral golden nucleocapsid (core) containing a compact coiled loop of relaxed-circular partially double-stranded DNA (a looped double strand with a short single-stranded gap, not RNA, not a straight helix) with one tiny polymerase protein attached. CRITICAL — this is NOT a coronavirus and must NOT be drawn like one: the envelope surface is MOSTLY SMOOTH and rounded, with only a handful of small, low, blunt, irregularly-placed surface-antigen (HBsAg) bumps — do NOT stud the whole sphere with a dense, uniform ring of rod-like, club-shaped, mushroom-shaped or trefoil-shaped spikes, do NOT give it a spiky/gear-like silhouette like a classic coronavirus or influenza illustration; the outer shape must read as a smooth, gently-bumped ball. Natural believable biological tints (translucent envelope, warm surface bumps, golden core), not neon, not monochrome. No face, no eyes, not a cell. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist plate of a single small spherical Hepatitis B virus (HBV) Dane particle, soft translucent watercolour washes and fine ink outlines. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background, with a soft darker wash halo directly on the paper behind the subject. CRITICAL — this is NOT a coronavirus and must NOT be painted like one: the envelope's outline is a soft, mostly SMOOTH circle with only a few tiny, low, blunt, sparse bumps painted on the surface (the surface antigen, HBsAg) — do NOT paint a dense ring of long rod-like, club-shaped or lollipop-shaped spikes all around the sphere, do NOT give it a spiky, star-like or gear-like silhouette. A painterly cut-away hints at the inner icosahedral nucleocapsid (core) with a compact coiled ring of relaxed-circular, partially double-stranded DNA (not a straight double helix, not RNA) and one small polymerase protein attached. One specimen, large and centred, anatomically correct, no face, not a cell. Do NOT render the artwork as a separate sheet, card, mat, border, frame or drop-shadow on a table or surface. Square 1:1, 1080x1080. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3311 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 21.2s — FAIL - envelope studded with a dense uniform ring of cylindrical peg-like projections all around, reading as a classic coronavirus ball rather than HBV's mostly-smooth envelope; violates the Do-NOT-draw rule. Superseded by attempt 2.
  ![textbook 1](theme/textbook/hepatitis-b-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 15.8s — PASS - refined muted educational cutaway matching rod-bacterium/HIV house style; thin clean outlines; distinct soft fills for the smooth, mostly-featureless lipid envelope with only a few small blunt bumps (HBsAg, not coronavirus-style spikes); quarter cutaway reveals a hexagonal (icosahedral) HBcAg nucleocapsid containing a compact coiled relaxed-circular DNA ring with a visible gap and a small polymerase dot; no text/border/vignette; fills frame edge-to-edge on dark charcoal background. Chosen as label base.
  ![textbook 2](theme/textbook/hepatitis-b-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/hepatitis-b-virus.textbook.svg)
[interactive SVG](theme/textbook/hepatitis-b-virus.textbook.svg) · [HTML](theme/textbook/hepatitis-b-virus.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3032 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 15.4s — FAIL - dense uniform crown of club-shaped spikes covering the whole sphere, an unmistakable coronavirus/SARS-CoV-2 SEM look, not HBV's sparse blunt HBsAg bumps; violates the Do-NOT-draw rule. Superseded by attempt 2.
  ![sem 1](theme/sem/hepatitis-b-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 14.7s — PASS - photorealistic false-colour amber/bronze SEM of a single roughly spherical Dane particle with a mostly smooth, gently textured surface and only a handful of small blunt bumps (HBsAg) - not a dense spiky corona; shallow depth of field, dark uncluttered background, no internal structures (correct for SEM), no baked text/scale bar/border.
  ![sem 2](theme/sem/hepatitis-b-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3169 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 15.0s — FAIL - dense ring of reddish mushroom-shaped spikes covering the whole envelope, again reading as coronavirus rather than HBV; violates the Do-NOT-draw rule. Superseded by attempt 2.
  ![3d 1](theme/3d/hepatitis-b-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 12.7s — PASS - natural believable biological tints: translucent pale grey-blue lipid envelope, sparse warm reddish-brown HBsAg bumps (blunt, not spiky), golden icosahedral HBcAg nucleocapsid wireframe with a coiled orange DNA strand and a small reddish polymerase blob inside; soft studio lighting, dark seamless background, no neon/monochrome, no text.
  ![3d 2](theme/3d/hepatitis-b-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/hepatitis-b-virus.3d.svg)
[interactive SVG](theme/3d/hepatitis-b-virus.3d.svg) · [HTML](theme/3d/hepatitis-b-virus.3d.html)

### Watercolor plate (`watercolor`) — 2 attempt(s), 3121 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 10.7s — FAIL - painted with a dense ring of uniform peg-like projections around the whole sphere, coronavirus-like rather than HBV's sparse blunt HBsAg bumps; violates the Do-NOT-draw rule. Superseded by attempt 2.
  ![watercolor 1](theme/watercolor/hepatitis-b-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 13.2s — PASS - warm aged paper fills the entire frame edge-to-edge with a soft darker wash halo directly on the paper (no mat/sheet-on-surface), matching cocci/rod-bacterium house style; single Dane particle with a smooth, sparsely-bumped envelope and a painterly circular cutaway revealing the hexagonal nucleocapsid, an intertwined red/blue relaxed-circular DNA ring and a small dark polymerase blob; fine ink outlines, no text.
  ![watercolor 2](theme/watercolor/hepatitis-b-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/hepatitis-b-virus.watercolor.svg)
[interactive SVG](theme/watercolor/hepatitis-b-virus.watercolor.svg) · [HTML](theme/watercolor/hepatitis-b-virus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public Domain (PD-USGov-HHS-CDC, PHIL #10755) · CDC / Dr. Erskine Palmer — PASS - CDC PHIL #10755 colorized TEM (Dr. Erskine Palmer, public domain) of Hepatitis B Dane particles; four orange-colorized ~42 nm particles with textured/knobby envelope surface clearly visible on a dark navy field. Recomposed to fill the frame edge-to-edge (real-04) after cleanup passes removed light margins left by earlier crops.
  ![reference](../reference-microscopy/theme/tem/hepatitis-b-virus.attempts/real-04__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | teaching-ready (label base) | 2 | muted refined cutaway; correct mostly-smooth envelope with sparse HBsAg bumps (not coronavirus-style); icosahedral core with rcDNA ring and polymerase visible; best for full labelling |
| sem | teaching-ready | 2 | realistic false-colour surface-only SEM; single specimen; smooth surface with sparse blunt bumps; no border |
| 3d | teaching-ready | 2 | natural biological tints; icosahedral core with coiled DNA + polymerase visible; sparse blunt bumps, not spikes |
| watercolor | teaching-ready | 2 | full-bleed aged-paper naturalist plate; hexagonal core cutaway with rcDNA ring; sparse blunt bumps |
| reference TEM | verified, cleaned | 4 | CDC PHIL #10755 public-domain colorized TEM of Dane particles; recomposed edge-to-edge, no baked text/border |
