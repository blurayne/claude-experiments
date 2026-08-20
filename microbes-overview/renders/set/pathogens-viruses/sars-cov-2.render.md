# SARS-CoV-2 (COVID-19) virion — render log

**Set:** `pathogens-viruses` · **Microbe key:** `sars-cov-2`
**Short description:** Enveloped +ssRNA betacoronavirus that causes COVID-19 — a ~80–120 nm sphere whose lipid envelope is studded with club-shaped Spike (S) trimers that form the crown/"corona" and bind the host ACE2 receptor; inside, a helical Nucleocapsid packs a ~30 kb single-stranded +RNA genome. (Rendered fresh into the `pathogens-viruses` set, reusing the SARS-CoV-2 science from `pathogens-generic/coronavirus`.)

Metadata sidecar: [`sars-cov-2.render.meta.json`](sars-cov-2.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

SARS-CoV-2 is the enveloped betacoronavirus that causes COVID-19. The virion is a roughly spherical, pleomorphic particle about 80–120 nm across (commonly cited ~100 nm), 10 to 100 times smaller than a bacterium. Its defining feature is the crown, or **corona**, that gives the family its name: club- or lollipop-shaped **Spike (S) glycoprotein** trimers protrude all over the surface — on average about 26 per virion (measured 24 ± 9 to 26 ± 15 by cryo-electron tomography, so roughly 24–40), heavily glycosylated and randomly but sparsely distributed rather than packed into a dense fur. Each S trimer binds the host **ACE2 receptor** on cells of the airway and then springs open to fuse the viral and cell membranes; S is also the principal antigen that antibodies and vaccines target. The particle is bounded by a host-derived lipid-bilayer **envelope** carrying two further transmembrane proteins: the **Membrane (M) protein**, the most abundant structural protein, which curves and shapes the envelope and organises assembly; and the small **Envelope (E) protein**, present in only a few copies, an ion-channel (viroporin) that assists assembly and budding. Inside, the **Nucleocapsid (N) protein** coats and condenses the genome into a **helical** ribonucleoprotein (not an icosahedral shell) — visible in cryo-ET as beads-on-a-string RNPs, ~26–35 per virion. The genome itself is a single **positive-sense single-stranded RNA (+ssRNA)** of ~30 kb (27–32 kb) — the largest of any RNA virus, capped and polyadenylated, and directly translatable by host ribosomes on entry. Four structural proteins in all: S, E, M, N. SARS-CoV-2 spreads mainly through aerosols and respiratory droplets; mRNA and vector vaccines present the Spike so the immune system builds antibodies and T cells against it.

Sources: [ViralZone / Expasy — Betacoronavirus / SARS-CoV-2 virion](https://viralzone.expasy.org/764), [Ke et al. 2020, *Nature* — "Structures and distributions of SARS-CoV-2 spike proteins on intact virions" (24 ± 9 S trimers)](https://www.nature.com/articles/s41586-020-2665-2), [Yao et al. 2020, *Cell* — "Molecular Architecture of the SARS-CoV-2 Virus" (26 ± 15 S trimers, ~26–35 RNPs)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7474903/), [CDC PHIL #23354 — TEM of SARS-CoV-2 (Bullock & Tamin, first U.S. case)](https://phil.cdc.gov/details.aspx?pid=23354).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `spike_s` | peplomerum, glycoproteinum spicatum (S) | Spike glycoprotein (S) | Spike-Glykoprotein (S) | club-shaped trimer; binds ACE2 & drives fusion/entry; forms the corona; main antibody/vaccine target | studded over the envelope (the "crown") | core (defining feature) |
| `envelope` | involucrum lipidicum (bilayer) | Lipid envelope | Lipidhülle | host-derived lipid bilayer; outer coat that fuses with the host membrane on entry | outermost boundary | core (enveloped) |
| `membrane_m` | proteinum membranae (M) | Membrane protein (M) | Membranprotein (M) | most abundant protein; shapes/curves the envelope and organises assembly | embedded throughout the envelope | core |
| `envelope_e` | proteinum involucri (E) | Envelope protein (E) | Hüllprotein (E) | small, few copies; ion-channel (viroporin), aids assembly & budding | sparse, embedded in the envelope | core (minor) |
| `nucleocapsid_n` | proteinum nucleocapsidis (N) | Nucleocapsid protein (N) | Nukleokapsidprotein (N) | binds & condenses the RNA into a helical ribonucleoprotein | inside the envelope, coating the genome | core |
| `genome` | genoma virale, (+)ssRNA | Positive-sense ssRNA genome | (+)-Einzelstrang-RNA-Genom | ~30 kb single RNA strand; genetic instructions, translated directly by host ribosomes | innermost, coiled within the N proteins | RNA only (never DNA) |

### Do NOT draw (scientifically misleading)
- **No face, eyes, mouth or expression** — a virion is a particle, not a creature.
- **Not a cell** — no nucleus, mitochondria, ER, Golgi, cytoplasm or ribosomes; the virion carries none.
- **No DNA and no double helix** — the genome is a single strand of **RNA (+ssRNA)**; draw one strand, never a double helix or DNA.
- **Spikes are club/lollipop-shaped trimers forming an even crown** — not flagella, tails, hairs, bristles or fimbriae; they are sparse (~24–40), evenly scattered, not a dense fur.
- **Do not confuse with influenza** — coronaviruses have **one** dominant Spike (S) defining the corona; do NOT draw two separate spike types (no HA/NA pair).
- **No icosahedral / geometric polyhedral capsid** — the nucleocapsid is **helical** (RNA wound with N protein), shown as coiled beads/ribbon, not a faceted shell.
- **Do not draw it bacterium-sized** — it is ~80–120 nm, 10–100× smaller than a bacterium.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **NIAID-RML colorized TEM** of SARS-CoV-2 virions — the iconic image showing each spherical particle ringed by its unmistakable **Spike corona** (yellow/blue fringe) around a red RNP-packed core, on a dark field. Ideal for teaching the crown. CC BY 2.0 (attribution required).
- file: https://upload.wikimedia.org/wikipedia/commons/3/33/Novel_Coronavirus_SARS-CoV-2_%28cropped%29.jpg
- page: https://commons.wikimedia.org/wiki/File:Novel_Coronavirus_SARS-CoV-2_(cropped).jpg · License: **CC BY 2.0** · NIAID-RML (Rocky Mountain Laboratories); via https://www.flickr.com/photos/niaid/49534865371/ · modality: colorized TEM · shows several virions with corona clearly resolved (not a single specimen).
- backups:
  - **CDC PHIL #23354** — TEM of SARS-CoV-2 isolated from the first U.S. COVID-19 case; blue-colorized spherical particles with the RNA genome visible as black cross-section dots. file: https://upload.wikimedia.org/wikipedia/commons/e/e1/SARS-CoV-2_PHIL23354.png · page: https://commons.wikimedia.org/wiki/File:SARS-CoV-2_PHIL23354.png · License: **Public Domain (PD-USGov-HHS-CDC, PHIL #23354)** · CDC / Hannah A. Bullock & Azaibi Tamin · modality: TEM.
  - **CDC PHIL #23640** — negative-stain TEM of a **single** isolated SARS-CoV-2 virion with faint surface projections. file: https://upload.wikimedia.org/wikipedia/commons/6/65/SARS-CoV-2_PHIL23640.png · page: https://commons.wikimedia.org/wiki/File:SARS-CoV-2_PHIL23640.png · License: **Public Domain (PD-USGov-HHS-CDC, PHIL #23640)** · CDC / Cynthia S. Goldsmith & A. Tamin · modality: TEM.
AI visual verification result: **PENDING** — to be confirmed after fetch.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 This is SARS-CoV-2, the coronavirus that gave the whole world COVID-19. It is a teeny-tiny spiky ball wearing a crown of little clubs called spikes, and it uses them to grab onto your cells and sneak inside to make loads of copies that can leave you coughing and sniffly. Most of the time you get better with rest and plenty of drinks over a week or two. Fresh air and masks stop it drifting from person to person, and a vaccine shows your body that spiky crown ahead of time so it is ready.  
🇩🇪 Das ist SARS-CoV-2, das Coronavirus, das der ganzen Welt COVID-19 gebracht hat. Es ist ein winziger stacheliger Ball mit einer Krone aus kleinen Keulen, die man Spikes nennt, und damit hakt es sich an deine Zellen und schleicht sich hinein, um viele Kopien zu bauen, die dich husten und schniefen lassen. Meistens wirst du mit Ruhe und viel Trinken nach ein bis zwei Wochen wieder gesund. Frische Luft und Masken halten es davon ab, von Mensch zu Mensch zu wandern, und eine Impfung zeigt deinem Körper die stachelige Krone schon vorher, damit er bereit ist.

**Adults (popular science, health).**  
🇬🇧 SARS-CoV-2 is the coronavirus behind COVID-19, an enveloped particle roughly 100 nm across that spreads mainly through the air in respiratory droplets and fine aerosols. Its club-shaped Spike (S) proteins form the tell-tale crown and latch onto the ACE2 receptor on cells in our airways before fusing in and hijacking them to make copies. Because Spike is the key that opens the door, it is the main target of antibodies and of the mRNA and vector vaccines, which train the immune system to recognise it. New variants keep tweaking Spike to dodge that recognition, which is why boosters get updated. For people at higher risk, antiviral drugs such as nirmatrelvir/ritonavir can blunt the infection if started early.  
🇩🇪 SARS-CoV-2 ist das Coronavirus hinter COVID-19, ein behülltes Partikel von rund 100 nm Größe, das sich vor allem über die Luft in Atemtröpfchen und feinen Aerosolen verbreitet. Seine keulenförmigen Spike-Proteine (S) bilden die verräterische Krone und docken am ACE2-Rezeptor der Zellen unserer Atemwege an, bevor das Virus mit ihnen verschmilzt und sie zur Kopienproduktion zwingt. Weil das Spike der Schlüssel zur Zelltür ist, ist es das Hauptziel von Antikörpern sowie der mRNA- und Vektorimpfstoffe, die das Immunsystem darauf trainieren. Neue Varianten verändern das Spike immer wieder, um dieser Erkennung zu entgehen, weshalb Auffrischimpfungen angepasst werden. Für Risikogruppen können antivirale Medikamente wie Nirmatrelvir/Ritonavir die Infektion abschwächen, wenn man früh damit beginnt.

**Scientific.**  
🇬🇧 SARS-CoV-2 is an enveloped, positive-sense single-stranded RNA betacoronavirus whose ~30 kb genome is the largest known among RNA viruses, capped and polyadenylated so it is translated directly by host ribosomes on entry. Four structural proteins build the ~80–120 nm virion: the Spike (S) trimer, which binds the ACE2 receptor and mediates membrane fusion and is the dominant antigen; the Membrane (M) and Envelope (E) proteins embedded in the host-derived lipid bilayer; and the Nucleocapsid (N) protein, which condenses the genome into a helical ribonucleoprotein rather than an icosahedral capsid. After ACE2-mediated entry, replication proceeds entirely in the cytoplasm, where the RNA-dependent RNA polymerase (RdRp) of the replicase complex transcribes genomic and subgenomic RNAs on virus-induced double-membrane vesicles. Progeny assemble at the ER–Golgi intermediate compartment and are released by exocytosis.  
🇩🇪 SARS-CoV-2 ist ein behülltes Betacoronavirus mit positivsträngiger Einzelstrang-RNA, dessen ~30 kb großes Genom das größte bekannte RNA-Virusgenom ist; es trägt Cap und Poly-A-Schwanz und wird nach dem Eintritt direkt von den Ribosomen des Wirts translatiert. Vier Strukturproteine bauen das 80–120 nm große Virion auf: das Spike-Trimer (S), das den ACE2-Rezeptor bindet, die Membranfusion vermittelt und das dominante Antigen ist; die Proteine Membran (M) und Hülle (E), eingebettet in die wirtseigene Lipiddoppelschicht; sowie das Nukleokapsidprotein (N), das das Genom zu einem helikalen Ribonukleoprotein und nicht zu einem ikosaedrischen Kapsid verdichtet. Nach ACE2-vermitteltem Eintritt läuft die Replikation vollständig im Zytoplasma ab, wo die RNA-abhängige RNA-Polymerase (RdRp) des Replikasekomplexes an virusinduzierten Doppelmembranvesikeln genomische und subgenomische RNAs transkribiert. Die Nachkommen-Virionen werden im ER-Golgi-Zwischenkompartiment zusammengebaut und durch Exozytose freigesetzt.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway in the EXACT house style of the plates rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (NEVER bright primary or cartoon colours), THIN clean outlines (NOT heavy black cartoon strokes), gentle soft shading with subtle dimensionality, and a distinct soft colour fill for each structure. Refined and elegant, NOT a bold-outlined flat cartoon. Subject: one spherical SARS-CoV-2 (COVID-19) coronavirus virion whose lipid envelope carries sparse, evenly-spaced club-shaped Spike (S) trimers forming the crown, with small Membrane (M) and Envelope (E) protein dots in the envelope; a quarter cut-away reveals a helical nucleocapsid — beaded Nucleocapsid (N) protein wound with a single coiled positive-sense RNA strand (NOT an icosahedral shell). Not a cell. No face, no eyes, no mouth. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Neutral dark charcoal uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning-electron-micrograph surface view of a single roughly spherical SARS-CoV-2 (COVID-19) coronavirus virion, warm amber-to-bronze false-color on a dark charcoal field, crisp 3D surface texture and shallow depth of field. The surface shows the sparse, even crown of club-shaped Spike proteins over a smooth lipid envelope — surface only, no internal structures, no face, no dense fur. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical still of one SARS-CoV-2 (COVID-19) virion, soft global illumination, subsurface scattering on the translucent grey-blue lipid envelope, sparse evenly-spaced red club-shaped Spike trimers forming the corona, and a gentle cut-away revealing the interior helical nucleocapsid — golden N protein coiled with a single RNA strand. Natural believable biological tints (translucent envelope, red spikes, gold RNP), not neon, not monochrome. No face, no eyes, not a cell. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist plate of a single SARS-CoV-2 (COVID-19) coronavirus virion, soft translucent watercolour washes and fine ink outlines. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background, with a soft darker wash halo directly on the paper behind the subject. A painterly cut-away hints at the spike crown, the lipid envelope with M and E protein dots, and the inner coiled ribonucleoprotein (N protein + a single RNA strand). One specimen, large and centred, anatomically correct, no face, not a cell. Do NOT render the artwork as a separate sheet, card, mat, border, frame or drop-shadow on a table or surface. Square 1:1, 1080x1080. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 2 attempt(s), 3228 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 13.6s — —
  ![textbook 1](theme/textbook/sars-cov-2.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 32.5s — PASS (gemini-2.5-flash-image) — refined cutaway: Spike, lipid envelope, Membrane (M) and Envelope (E) proteins, Nucleocapsid (N) protein + ssRNA genome; matches rod-bacterium/parasite palette.
  ![textbook 2](theme/textbook/sars-cov-2.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/sars-cov-2.textbook.svg)
[interactive SVG](theme/textbook/sars-cov-2.textbook.svg) · [HTML](theme/textbook/sars-cov-2.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1477 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 14.8s — PASS — single virion, false-colour spike corona, surface only, no border/text.
  ![sem 1](theme/sem/sars-cov-2.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1492 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 21.8s — PASS — iconic look: translucent envelope, red spike trimers, gold M/E dots, cutaway with golden helical nucleocapsid; all labels correct.
  ![3d 1](theme/3d/sars-cov-2.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/sars-cov-2.3d.svg)
[interactive SVG](theme/3d/sars-cov-2.3d.svg) · [HTML](theme/3d/sars-cov-2.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1492 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 16.4s — PASS — full-bleed aged paper; spike/envelope/M/E/N/RNA all correctly labelled.
  ![watercolor 1](theme/watercolor/sars-cov-2.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/sars-cov-2.watercolor.svg)
[interactive SVG](theme/watercolor/sars-cov-2.watercolor.svg) · [HTML](theme/watercolor/sars-cov-2.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · CC BY 2.0 · NIAID-RML (Rocky Mountain Laboratories) — PASS — real SARS-CoV-2 TEM/SEM reference per render.md §2.
  ![reference](../reference-microscopy/theme/tem/sars-cov-2.attempts/real-01__TEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 2 | refined style, correct anatomy |
| sem | pass | 1 | surface spike corona |
| 3d | pass | 1 | iconic, correct anatomy |
| watercolor | pass | 1 | full-bleed, correct anatomy |
