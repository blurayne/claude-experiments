# Feline immunodeficiency virus (FIV) — render log

**Set:** `pet-pathogens` · **Microbe key:** `feline-immunodeficiency-virus`
**Short description:** An enveloped lentivirus (~100-125 nm) and the cat's own counterpart to HIV — closely related in architecture (envelope, matrix, conical capsid, two RNA copies, reverse transcriptase, integrase) but not infectious to people. Its Env spikes are notably SHORTER and sparser than HIV's, and its Gag proteins carry FIV-specific names (MA p15, CA p24, NC p13) rather than HIV's (p17/p24/p7) — related, not identical.

Metadata sidecar: [`feline-immunodeficiency-virus.render.meta.json`](feline-immunodeficiency-virus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

FIV (Feline Immunodeficiency Virus) is an **enveloped *Lentivirus*** (family *Retroviridae*, genus *Lentivirus* — the same genus as HIV), and is the cat's own counterpart to human HIV: it targets helper T cells, integrates permanently into the host genome, and wears the immune system down over years. It is **not infectious to people**. It is unrelated beyond both being feline retroviruses to FeLV (a *Gammaretrovirus*, also in this set), which has a different genome, morphology and transmission route.

**Size and gross shape.** The virion is **roughly spherical to ellipsoid, ~100-125 nm across** (this atlas uses 0.11 µm / 110 nm, already in `microbe_scale.py`) — close to HIV's ~100-120 nm, and clearly distinct from rabies (also in this set), which is bullet-shaped with one flat and one rounded end. FIV is emphatically **not** bullet-shaped.

**Three-layer architecture, outside in:**
1. **Lipid envelope** — a host-cell-derived bilayer picked up during budding, studded with **Env glycoprotein spikes**. Each spike is a heterodimer of a surface subunit (**SU, gp95**) and a transmembrane subunit (**TM, gp41/gp40**), non-covalently associated — the same SU/TM logic as HIV's gp120/gp41, but FIV-specific proteins and numbering. **The checkable difference from HIV**: FIV's spikes are described in current virology literature as **notably short**, and — per this atlas's HIV render, which already shows HIV's own spikes as sparse rather than a dense corona — FIV's must read as **shorter and even sparser still**: short blunt studs, never tall mushroom-on-a-stalk shapes, and never a dense fuzzy corona.
2. **Matrix (MA, p15)** — a protein layer lining the inner face of the envelope. (FIV's matrix protein is named p15; HIV's equivalent is p17 — different mass, same structural role, a genuine FIV-vs-HIV numbering difference worth stating in the scientific text.)
3. **Capsid / core (CA, p24)** — the single most important, single most checkable feature: a **distinct CONE or truncated-cone shape**, wide at one end and narrower at the other (never a sphere, never an icosahedral/geometric ball). This is the defining lentivirus core shape, confirmed for FIV both by thin-section TEM of mature virions (condensed conical cores, vs. the hollow spherical cores of immature/budding particles) and by the first solved crystal structure of full-length FIV capsid protein, which shows the same two-domain, alpha-helical CA fold as HIV-1 and EIAV, assembling via hexamer/pentamer lattices into a cone. Inside the cone: **two copies of positive-sense single-stranded RNA**, coated by **nucleocapsid protein (NC, p13** — HIV's equivalent is p7, again a different FIV-specific mass), plus the enzymes **reverse transcriptase, integrase and protease**.

**FIV-vs-HIV as the teaching point.** The brief for this subject is explicit: FIV should read as recognisably related to HIV (same genus, same envelope → matrix → conical-capsid → 2×RNA architecture) without being a copy-paste of the HIV render. The two checkable, drawable differences are (a) **shorter, sparser Env spikes** than HIV's already-modest ones, and (b) implicitly, the overall proportions (FIV runs slightly smaller/more ellipsoid than HIV's more perfectly spherical ~120 nm). The Gag/Pol protein-naming differences (p15/p24/p13 vs. p17/p24/p7; FIV's unique dUTPase gene, absent from primate lentiviruses like HIV) are real but not drawable — they belong in the scientific-register text, not the image.

Sources (full list with URLs in [`feline-immunodeficiency-virus.research.json`](feline-immunodeficiency-virus.research.json)): PMC5977254 (Properties and Functions of FIV Gag Domains in Virion Assembly and Budding — virion size, conical core by TEM), PMC5707542 (Crystal Structure of the Full-Length FIV Capsid Protein), Viruses 2019 11(8):689 (FIV Pr50Gag processing — p15/p24/p13), PMC2546885 (FIV Env SU/TM), Bioguardlabs FIV virology review (short Env spikes), PMC3230847 (Molecular Biology of FIV — genome, dUTPase), Veterian Key FIV overview (2× RNA + RT/IN/PR packaging), ICTV Lentivirus genus report (cross-check protein sizes).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `envelope` | membrana viri (bilamina lipidica ex hospite) | Lipid envelope (host-derived) | Lipidhülle (wirtseigen) | outer bilayer picked up during budding; carries the Env spikes | outermost layer | core |
| `env_spike` | glycoproteina superficiei, brevis et sparsa (SU gp95 / TM gp40) | Env glycoprotein spike — short and sparse (SU gp95 / TM gp40) | Hüllprotein-Spike — kurz und spärlich (SU gp95 / TM gp40) | mediates attachment/entry; SHORTER and sparser than HIV's spikes — the key FIV-vs-HIV difference | studding the envelope, sparse | core |
| `matrix` | matrix (p15) | Matrix (p15) | Matrix (p15) | protein layer lining the inner envelope face | just inside the envelope | core |
| `capsid` | capsid conicum (p24) | Conical capsid / core (p24) | Konisches Kapsid / Core (p24) | the defining lentivirus core shape — a cone/truncated cone, never a sphere or icosahedron | centre of the virion | core |
| `rna` | genoma RNA (duo fila, sensus positivus) | RNA genome (two copies, positive-sense) | RNA-Genom (zwei Kopien, positivsträngig) | the packaged genetic material — NOT double-stranded DNA | inside the conical capsid | core |
| `nucleocapsid` | nucleocapsid (p13) | Nucleocapsid (p13) | Nukleokapsid (p13) | coats the RNA strands inside the capsid | wrapping the RNA | core |
| `reverse_transcriptase` | transcriptasa reversa | Reverse transcriptase | Reverse Transkriptase | copies the RNA genome into DNA after entry | inside the capsid | core |
| `integrase` | integrasa | Integrase | Integrase | later stitches the resulting DNA permanently into the host genome | inside the capsid | core |

### Do NOT draw (scientifically misleading)
- **A non-enveloped / naked particle** — FIV is always enveloped.
- **An icosahedral or geometric-ball capsid** — the mature core is a distinct CONE / truncated cone. This is the single most checkable feature; a spherical core is an automatic fail.
- **A double-stranded DNA genome inside the virion** — the packaged genome is RNA (two copies, positive-sense); it only becomes DNA after reverse transcription inside the host cell.
- **Long, prominent, mushroom-on-a-stalk spikes or a dense fuzzy corona copied from an HIV render** — FIV's spikes are notably SHORTER and SPARSER than HIV's own already-sparse spikes: short blunt studs on the rim, not tall clubs, not a hairy halo.
- **A bullet silhouette with one flat and one rounded end** — that is rabies (also in this set, a rhabdovirus with a helical core), not FIV. FIV is roughly spherical/ellipsoid.
- **A cat, a person, or any animal figure** in the four science styles — this is a molecule-scale render of the virion alone.
- **Anything implying human infectivity** — FIV cannot infect people.

---

## 2. Real microscopy reference (own set `reference-microscopy`)

**No freely-licensed FIV micrograph was found — this step is skipped, and the gap is reported rather than papered over.**

Searched: Wikimedia Commons `Category:Feline immunodeficiency virus` (14 files — all genome-map diagrams, an `FIV.svg` schematic illustration, a rapid-test-kit product photo, and a photo of a symptomatic cat; **no electron micrograph** of virions or budding particles). CDC PHIL (Public Health Image Library) has **no FIV entries at all** — its lentivirus EM plates (e.g. #282, #10860, #18142/#18143) are consistently HIV-1, not FIV; NIAID's public-domain EM gallery likewise turned up nothing FIV-specific. The one paper located that does contain FIV virion/budding TEM figures — *Molecular Characterization of Feline Immunodeficiency Virus Budding* (J. Virol., PMC2258934) — is Copyright © American Society for Microbiology, **not** openly licensed. Open-access (CC BY) FIV papers found (PLOS ONE, Veterinary World) cover diagnostics and molecular epidemiology, not EM plates.

Per pipeline policy ("a missing reference honestly reported beats a wrong one"), **no HIV micrograph is substituted and labelled as FIV**. The four science-style renders below (sem/textbook/3d/watercolor) are the only imagery for this subject; the `sem` style stands in for what a real micrograph would show, built strictly from the sourced morphology in §1.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 This is FIV, a tiny germ that only bothers cats — it cannot make people sick at all. It spreads when two cats fight and bite each other, so cats who stay friends (or stay safely indoors) almost never meet it. A cat with FIV can still play, nap in sunny spots and live a long, happy life for many, many years, especially with a vet keeping an eye on things. The best way to keep cats well is simple: keep the peace, so there is nothing to fight about.  
🇩🇪 Das ist FIV, ein winziger Keim, der nur Katzen etwas angeht — Menschen können sich damit gar nicht anstecken. Es verbreitet sich, wenn zwei Katzen sich streiten und beißen, deshalb treffen Katzen, die Freunde bleiben (oder sicher drinnen wohnen), fast nie darauf. Eine Katze mit FIV kann trotzdem spielen, in der Sonne dösen und noch viele, viele Jahre glücklich leben, besonders wenn eine Tierärztin oder ein Tierarzt ein Auge darauf hat. Am besten hält man Katzen gesund, indem man für Frieden sorgt — dann gibt es nichts, worüber sie streiten müssten.

**Adults (popular science, health).**  
🇬🇧 FIV is a lentivirus — the same family as HIV, and built the same way, but it is a cat-only infection with no risk to people. It spreads almost entirely through deep bite wounds from fighting, which is why unneutered outdoor toms carry by far the highest risk; grooming, shared bowls and casual contact essentially do not transmit it. Once inside a cat, FIV settles into helper T cells and writes its genome into theirs, so the infection cannot be cleared — but it also does not act like a death sentence. Many FIV-positive cats live full, comfortable lives for years with nothing more than routine care: neutering, staying mostly indoors, regular vet check-ups and prompt treatment of any infection that comes along. A positive test is a reason to adjust how a cat is looked after, not a reason to panic.  
🇩🇪 FIV ist ein Lentivirus — dieselbe Familie wie HIV und genauso aufgebaut, aber eine reine Katzeninfektion ohne jedes Risiko für Menschen. Es überträgt sich fast ausschließlich durch tiefe Bisswunden bei Revierkämpfen, weshalb unkastrierte Freigänger-Kater das mit Abstand höchste Risiko tragen; gegenseitiges Putzen, gemeinsame Näpfe und normaler Kontakt übertragen es praktisch nicht. Einmal in der Katze angekommen, nistet sich FIV in T-Helferzellen ein und schreibt sein Erbgut in ihres — heilbar ist die Infektion deshalb nicht, aber sie ist auch kein Todesurteil. Viele FIV-positive Katzen leben jahrelang rundum normal, mit nicht mehr als üblicher Fürsorge: Kastration, überwiegend drinnen leben, regelmäßige Tierarztkontrollen und eine zügige Behandlung jeder Infektion, die dazukommt. Ein positiver Test ist ein Grund, die Pflege anzupassen — kein Grund zur Panik.

**Scientific.**  
🇬🇧 FIV is an enveloped lentivirus (family Retroviridae) of ~100-125 nm, structurally paralleling HIV: a host-derived lipid envelope studded with short, sparse Env glycoprotein spikes (SU gp95 / TM gp41-40, non-covalently associated), a matrix layer (MA, p15) lining the envelope, and a truncated-cone capsid (CA, p24) enclosing two copies of positive-sense single-stranded RNA coated by nucleocapsid protein (NC, p13), together with reverse transcriptase, integrase and protease. FIV's ~9.4 kb genome additionally encodes a dUTPase absent from primate lentiviruses. Infection targets CD4-equivalent helper T lymphocytes (and other leukocytes); reverse transcriptase generates a DNA copy that integrase inserts into the host genome as a provirus, establishing lifelong infection. Transmission is overwhelmingly parenteral, via bite wounds during territorial aggression, rather than through casual contact. Disease progresses over years through an asymptomatic latent phase toward progressive immune dysfunction, at which point opportunistic and secondary infections become the dominant clinical problem — closely paralleling the pathogenesis of HIV/AIDS, which is why FIV serves as a valuable naturally-occurring animal model for lentivirus research. FIV does not infect humans.  
🇩🇪 FIV ist ein behülltes Lentivirus (Familie Retroviridae) von ca. 100-125 nm, strukturell ein Gegenstück zu HIV: eine wirtseigene Lipidhülle mit kurzen, spärlichen Hüllprotein-Spikes (SU gp95 / TM gp41-40, nicht-kovalent assoziiert), eine Matrixschicht (MA, p15) an der Innenseite der Hülle sowie ein kegelstumpfförmiges Kapsid (CA, p24), das zwei Kopien positivsträngiger Einzelstrang-RNA umschließt, ummantelt vom Nukleokapsidprotein (NC, p13), zusammen mit Reverser Transkriptase, Integrase und Protease. Das rund 9,4 kb große FIV-Genom kodiert zusätzlich eine dUTPase, die den primaten-lentiviralen Genomen (HIV) fehlt. Die Infektion befällt CD4-äquivalente T-Helferzellen (und weitere Leukozyten); die Reverse Transkriptase erstellt eine DNA-Kopie, die die Integrase als Provirus dauerhaft ins Wirtsgenom einbaut und so eine lebenslange Infektion etabliert. Die Übertragung erfolgt ganz überwiegend parenteral über Bisswunden bei Revierkämpfen, nicht über beiläufigen Kontakt. Die Erkrankung verläuft über Jahre von einer symptomlosen Latenzphase hin zu einer fortschreitenden Immundysfunktion, in der opportunistische und sekundäre Infektionen zum bestimmenden klinischen Problem werden — eine enge Parallele zur Pathogenese von HIV/AIDS, weshalb FIV als wertvolles natürliches Tiermodell für die Lentivirus-Forschung dient. FIV infiziert keine Menschen.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE mature feline immunodeficiency virus (FIV) particle, a cat lentivirus closely related to HIV, centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Semi-flat vector-style shading with crisp thin clean outlines and a MUTED, desaturated educational palette (soft dusty tints, never bright cartoon colours) on a neutral dark charcoal uncluttered background. The virion is roughly spherical to slightly ellipsoid, somewhat smaller and more compact than a typical HIV illustration. A neat quarter cut-away reveals the interior. Show, distinctly, using a consistent colour legend: a soft translucent teal-blue outer lipid envelope; only about SIX to EIGHT very SHORT, BLUNT, stubby glycoprotein spikes (rounded knob shapes on barely-there stalks) poking just slightly out of the envelope, sparsely and irregularly spaced — these spikes must read as visibly SHORTER and SPARSER than a textbook HIV spike, never tall mushroom-on-a-stalk shapes and never a dense corona; a thin pale-cream matrix protein layer lining the inside of the envelope; and at the centre the diagnostic CONICAL capsid core — a distinct cone or truncated-cone shape, wide at one end and narrower at the other, in a warm amber-gold fill. Inside the cone show two thin coiled magenta-pink single-stranded RNA strands and a few small teal reverse-transcriptase/integrase enzyme dots. Each structure its own soft distinct colour fill. Do NOT draw an icosahedral or geometric-ball capsid, no bullet-shaped silhouette, no bacteriophage tail or legs, no DNA double helix, no bacterial cell wall, no cat or any animal, and absolutely no face or eyes. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image, and fill the frame edge-to-edge with no border or frame.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE mature feline immunodeficiency virus (FIV) particle, a cat lentivirus, centered in a square 1:1 1080x1080 frame with generous empty margin. The virion is a roughly spherical to slightly ellipsoid particle with a subtly bumpy surface, resting on a faintly textured neutral substrate, shallow depth of field so the edges fall softly out of focus. Show only real surface detail: a SPARSE scatter of only a handful of very short, low, blunt knob-like bumps (envelope glycoprotein spikes) barely rising off the otherwise smooth spherical envelope — these must look visibly shorter and sparser than a typical HIV SEM rendering, definitely NOT a dense hairy or spiky corona and NOT tall stalked knobs. False-color palette: warm rose-to-coral particle against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal structures and NO cutaway. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere, and fill the frame edge-to-edge with no black border, frame, vignette or letterbox.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE mature feline immunodeficiency virus (FIV) particle, a cat lentivirus closely related to HIV, centered in a square 1:1 1080x1080 frame with generous margin. Soft global illumination, gentle rim light, subsurface scattering on the membrane, and a clean seamless dark studio background. The virion is roughly spherical to slightly ellipsoid, a touch more compact than a typical HIV render, with a translucent teal-blue host-derived lipid envelope; a gentle cut-away or partial translucency reveals the interior. Colorize with natural, believable biological tones so structures are clearly distinguishable, using this legend: translucent teal-blue envelope; only about SIX to EIGHT very SHORT, blunt, rounded coral-pink glycoprotein knobs sitting almost flush against the envelope, sparsely and irregularly placed — visibly shorter and sparser than HIV's already-modest spikes, never a tall mushroom-on-a-stalk shape and never a dense corona; a thin pale matrix layer lining the envelope; and at the centre the diagnostic CONICAL capsid core (amber-gold) as a distinct cone/truncated-cone shape, wide at one end and narrow at the other, containing two thin coiled magenta RNA strands and a few small teal reverse-transcriptase/integrase specks. Do NOT model an icosahedral geometric-ball capsid, no bullet-shaped silhouette, no bacteriophage tail or legs, no DNA double helix, no bacterial wall, no cat or any animal, and absolutely no face or anthropomorphism. Anatomically faithful, single specimen. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks, and fill the frame edge-to-edge with no border.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE mature feline immunodeficiency virus (FIV) particle, a cat lentivirus, in the style of a 19th-century atlas, centered in a square 1:1 1080x1080 frame, yet anatomically modern and correct. Soft translucent watercolour washes with fine ink outlines. The warm aged paper texture MUST FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background; do NOT paint a separate sheet, card, mat, border, frame or drop-shadow. A soft darker wash halo sits directly on the paper behind the large centred virion. The particle is roughly spherical to slightly ellipsoid, a little more compact than a typical HIV plate, with a soft painterly cut-away revealing the interior: a pale teal-washed outer lipid envelope; only a SPARSE handful (about six to eight) of very SHORT, blunt, stubby glycoprotein knobs painted just barely proud of the envelope, irregularly spaced — visibly shorter and sparser than HIV's spikes, never tall stalked clubs, never a dense corona; a thin pale matrix wash lining the envelope; and at the centre the diagnostic CONICAL capsid core in warm ochre-gold, a distinct cone/truncated-cone shape wide at one end and narrow at the other, holding two thin coiled magenta-rose RNA strands and a few small teal enzyme specks. Do NOT paint an icosahedral geometric-ball capsid, no bullet-shaped silhouette, no bacteriophage tail or legs, no DNA double helix, no bacterial wall, no cat or any animal, and absolutely no face. Single specimen, anatomically faithful. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1697 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 8.3s — ✅ PASS (gemini-2.5-flash-image) — clean quarter cut-away: distinct CONICAL capsid (wide-to-narrow cone, confirmed by direct view, not spherical/icosahedral); envelope studded with ~10 short, blunt, T-shaped spike studs, sparse and irregular, visibly shorter than this atlas's own HIV spikes; cream matrix ring clearly distinct from the amber capsid; two magenta RNA strands verified by magnified crop to be plain parallel wavy lines with no letter-like shapes; muted educational palette on a neutral charcoal-grey background; no baked-in text, no border.
  ![textbook 1](theme/textbook/feline-immunodeficiency-virus.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/feline-immunodeficiency-virus.textbook.svg)
[interactive SVG](theme/textbook/feline-immunodeficiency-virus.textbook.svg) · [HTML](theme/textbook/feline-immunodeficiency-virus.textbook.html)

### SEM micrograph (`sem`) — 3 attempt(s), 4754 tok, $0.116
- attempt 1 · `gemini-2.5-flash-image` · 6.8s — ❌ FAIL — spikes rendered as ~20 evenly-spaced pointed conical bumps forming a near-continuous ring around the whole rim, reading as a dense spiky corona/pollen-grain silhouette rather than the required sparse, short, blunt studs; re-prompted with an explicit 'basketball not sea urchin' description and an exact count (six to eight).
  ![sem 1](theme/sem/feline-immunodeficiency-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.6s — ❌ FAIL — spike density/bluntness fixed (now sparse rounded dome bumps, clearly improved), but the render came back with a ~12px solid BLACK BORDER on all four edges (confirmed by pixel sampling: (0,0)-(0,10) = pure black), violating the no-frame rule; re-prompted with an explicit edge-to-edge fill instruction.
  ![sem 2](theme/sem/feline-immunodeficiency-virus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 7.1s — ✅ PASS (gemini-2.5-flash-image) — sparse (~10-14) low rounded dome bumps on an otherwise smooth spherical surface, correctly reading as short and blunt rather than spiky/pointed; confirmed via pixel sampling that the background reaches all four edges with no border (edge pixels ~RGB(45-52,45-52,45-52), matching the interior charcoal tone, no black band); false-colour rose-coral palette, no baked-in text.
  ![sem 3](theme/sem/feline-immunodeficiency-virus.attempts/gen-03__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3437 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 7.2s — ❌ FAIL — magnified crop of the two 'coiled RNA strands' revealed they form a clearly legible cursive shape resembling the letters 'faa'/'loa' — a baked-in-text-adjacent failure per the skill's dominant-failure-mode warning; capsid cone shape itself was correct. Re-prompted to describe the RNA explicitly as two plain, non-crossing, non-looping parallel wavy lines ('like two strands of spaghetti'), with an explicit instruction to check that no interior shape could read as a letter.
  ![3d 1](theme/3d/feline-immunodeficiency-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 9.5s — ✅ PASS (gemini-2.5-flash-image) — RNA now two clean parallel magenta wavy lines with no letter-like crossings (re-checked by magnified crop); conical capsid clear and distinct; envelope spikes reduced to ~10 short blunt coral dome knobs sitting nearly flush against the membrane, sparse and irregular, visibly shorter than HIV's; natural biological tones (translucent teal envelope, amber cone), no border, no baked text remaining anywhere in the frame.
  ![3d 2](theme/3d/feline-immunodeficiency-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/feline-immunodeficiency-virus.3d.svg)
[interactive SVG](theme/3d/feline-immunodeficiency-virus.3d.svg) · [HTML](theme/3d/feline-immunodeficiency-virus.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1656 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 8.0s — ✅ PASS (gemini-2.5-flash-image) — warm aged paper fills the frame edge-to-edge and into all four corners (confirmed by corner pixel sampling: all four corners read as tan paper tones, e.g. RGB≈(220,200,165), not white/blank); a tapered kite/cone-shaped capsid core wide at one end and narrower at the other; sparse short blunt cylinder-peg spikes (~14, clearly shorter/stubbier than a typical HIV plate) around the shell; two magenta RNA strands read as plain loops, no letters; soft darker wash halo directly on the paper behind the virion, no separate mat/frame/sheet-on-surface look, matching the cocci/rod-bacterium house style.
  ![watercolor 1](theme/watercolor/feline-immunodeficiency-virus.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/feline-immunodeficiency-virus.watercolor.svg)
[interactive SVG](theme/watercolor/feline-immunodeficiency-virus.watercolor.svg) · [HTML](theme/watercolor/feline-immunodeficiency-virus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | conical capsid, short sparse spikes and clean RNA strands correct on the first attempt; no re-render needed |
| sem | ✅ teaching-ready | 3 | attempt 1 rejected for a dense spiky-corona spike pattern; attempt 2 fixed spike density/bluntness but introduced a black border; attempt 3 fixed both — sparse blunt domes, true edge-to-edge fill, verified by pixel sampling |
| 3d | ✅ teaching-ready | 2 | attempt 1 rejected because the RNA strands formed a legible cursive letter-like shape under magnification (baked-in-text-adjacent failure); attempt 2 fixed it with plain parallel wavy lines and kept the improved sparse short spikes |
| watercolor | ✅ teaching-ready | 1 | tapered cone core, sparse short blunt studs and full paper bleed correct on the first attempt; no re-render needed |
| reference photo | ⚠️ none available | 0 | no freely-licensed (PD/CC0/CC BY/CC BY-SA) FIV micrograph or photograph could be located after an extensive search (Wikimedia Commons, CDC PHIL, NIAID, open-access journals); reported plainly rather than substituting an HIV plate mislabelled as FIV — this is a known gap, not an oversight |
| coloring page | ✅ teaching-ready | 3 | attempts 1-2 had correct content (two cat friends grooming, tails forming a heart, a small round FIV character with blunt studs waiting outside a closed heart-stickered cat-flap) but left visible white margins on multiple edges (not a border — never a black frame, just insufficient zoom); attempt 3's 'macro close-up, cropped by every edge' framing instruction fixed it directly — no crop-and-re-trace escape hatch was needed since the failure mode was insufficient bleed, not a border to measure and remove |
