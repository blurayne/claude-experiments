# Protozoan parasite (Trypanosoma trypomastigote archetype) — render log

**Set:** `pathogens-generic` · **Microbe key:** `parasite`
**Short description:** Textbook single-celled eukaryotic (protozoan) parasite — an idealized *Trypanosoma brucei* bloodstream trypomastigote (~20–30 µm long, slender) used to teach protozoan anatomy: a true nucleus, a single long flagellum, an undulating membrane and a kinetoplast. Not a named subspecies, and NOT a worm.

Metadata sidecar: [`parasite.render.meta.json`](parasite.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

The chosen archetype is a **flagellated protozoan trophozoite: a *Trypanosoma brucei* bloodstream trypomastigote** — the most visually iconic single-celled parasite, with clearly labelable eukaryotic organelles. It is a slender, spindle-shaped extracellular hemoflagellate, roughly 17–30 µm long and 1.5–3.5 µm wide, tapering to a sharp posterior tip. A **single flagellum** arises near the posterior end (from a flagellar pocket), runs forward along the body attached by an **undulating membrane** (a raised fold of the cell surface), and emerges as a free flagellum at the anterior end. The body is wrapped in a **pellicle**: the plasma membrane reinforced underneath by a corset of subpellicular microtubules that gives the cell its fixed, flexible shape. It has one **central, true (membrane-bound) nucleus**; a **single large tubular mitochondrion** running the length of the cell; and, within that mitochondrion near the flagellar base, a **kinetoplast** — a dense disc of concatenated mitochondrial DNA (mini- and maxicircles) that is the hallmark of kinetoplastids. In the *T. brucei* complex the kinetoplast is small and posterior to the nucleus (a "trypomastigote"), which distinguishes it from *T. cruzi*'s much larger kinetoplast.

Because this set teaches single-celled microbes, only the protozoan is drawn. Note that "parasite" in the broadest sense also includes **multicellular worms** (helminths such as tapeworms, flukes and roundworms) and, at the single-celled end, apicomplexans like *Plasmodium* (malaria) and *Giardia* — but a worm is deliberately **not drawn here**; one clear protozoan archetype is kept.

Sources: [CDC DPDx — African Trypanosomiasis (trypomastigote morphology, PD figures)](https://www.cdc.gov/dpdx/trypanosomiasisafrican/index.html), [Matthews et al. 2013, *Front. Cell. Infect. Microbiol.* — "More than meets the eye: understanding *T. brucei* morphology" (single-copy organelles, corset, kinetoplast at flagellar base)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3826061/), [Ogbadoyi/kinetoplast & TAC — *T. brucei* mitochondrion/kinetoplast ultrastructure (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC1974780/), [Britannica — *Trypanosoma*](https://www.britannica.com/science/Trypanosoma).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `pellicle` | pellicula (membrana plasmatica + microtubuli subpelliculares) | Plasma membrane / pellicle | Zellmembran / Pellikula | outer boundary; microtubule corset under the membrane sets the fixed spindle shape | whole cell surface | core |
| `nucleus` | nucleus | Nucleus | Zellkern | true membrane-bound nucleus; holds the chromosomes (eukaryotic) | central | core |
| `kinetoplast` | kinetoplastus (kDNA) | Kinetoplast | Kinetoplast | dense disc of mitochondrial DNA (mini/maxicircles); hallmark of kinetoplastids | in mitochondrion, near flagellar base, posterior to nucleus | core |
| `mitochondrion` | mitochondrion (singulare) | Mitochondrion | Mitochondrium | single large tubular mitochondrion; energy metabolism | runs full length of cell | core |
| `flagellum` | flagellum | Flagellum | Geißel | single whip for propulsion; runs along body, free at anterior | posterior origin → anterior tip | core |
| `undulating_membrane` | membrana undulans | Undulating membrane | undulierende Membran | fin-like fold where the flagellum attaches to the body; aids swimming | along one side of the body | core |
| `flagellar_pocket` | sinus flagellaris | Flagellar pocket | Geißeltasche | invagination where flagellum emerges; sole site of endo-/exocytosis | posterior region | optional |
| `cytoplasm` | cytoplasma | Cytoplasm | Zytoplasma | gel where metabolism and organelles sit | interior | core |

### Do NOT draw (scientifically misleading)
- **No worm / no multicellular body** — this is one single eukaryotic cell, not a helminth.
- **No bacterial features** — no nucleoid (it has a *true nucleus*), no peptidoglycan cell wall, no Gram envelope.
- **No large terminal kinetoplast** — that is *T. cruzi*; the *T. brucei* archetype has a **small kinetoplast posterior to the nucleus**.
- Do not scatter **many** flagella or many mitochondria — it has **one** flagellum and **one** (single, branched-tubular) mitochondrion; the kinetoplast is a single disc.
- Kinetoplast is **inside the mitochondrion at the flagellar base**, not a free-floating second nucleus.
- Don't draw a rigid cell wall or a cellulose theca — the shape comes from the internal microtubule corset under a soft membrane.
- Keep one clear archetype: don't mix in *Plasmodium* ring forms or *Giardia* discs.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Chosen: **CDC PHIL #613** Giemsa-stained light micrograph of ***Trypanosoma* forms in a blood smear** from a patient with African trypanosomiasis — public domain, shows the slender trypomastigotes with flagellum + undulating membrane among red blood cells (classic teaching view of scale-against-RBCs).
- file: https://upload.wikimedia.org/wikipedia/commons/2/23/Trypanosoma_sp._PHIL_613_lores.jpg
- page: https://commons.wikimedia.org/wiki/File:Trypanosoma_sp._PHIL_613_lores.jpg · License: **Public Domain (CDC PHIL #613)** · CDC / Dr. Myron G. Schultz (1970)
- AI visual verification result: **PENDING** — to be confirmed after fetch.

Backup 1: **Zephyris false-color SEM** of a single *Trypanosoma brucei* procyclic trypomastigote — cell body in orange, flagellum in red along the undulating membrane; best single-specimen 3D surface view of the elongated shape + attached flagellum.
- file: https://upload.wikimedia.org/wikipedia/commons/3/33/TrypanosomaBrucei_ProcyclicTrypomastigote_SEM.jpg
- page: https://commons.wikimedia.org/wiki/File:TrypanosomaBrucei_ProcyclicTrypomastigote_SEM.jpg · License: **CC BY-SA 3.0 / GFDL** · Zephyris (2010) — attribution + share-alike required
- AI visual verification result: **PENDING** — to be confirmed after fetch.

Backup 2: **CDC DPDx** Giemsa-stained thin-smear figures of *T. brucei* trypomastigotes (Figures A–F) — public domain, show small posterior kinetoplast, central nucleus, undulating membrane and anterior free flagellum for a clean single-cell diagnostic view.
- file/page: https://www.cdc.gov/dpdx/trypanosomiasisafrican/index.html · License: **Public Domain (CDC / DPDx)** · CDC Division of Parasitic Diseases and Malaria
- AI visual verification result: **PENDING** — to be confirmed after fetch.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 This sneaky little critter is a parasite, and it's just ONE cell with a long whippy tail called a flagellum that it uses to swim through your blood. It doesn't build a home or make its own food — it just moves into your body and lives off you, which is what parasites do. Parasites come in lots of sizes, from tiny single cells like this one all the way up to long wiggly worms, but this fellow is just one cell. It usually sneaks in through the bite of a tsetse fly, so bug nets and staying away from bites keep it out. And if one does get in, doctors have special medicines that hunt it down and clear it away.  
🇩🇪 Dieser hinterhältige kleine Kerl ist ein Parasit, und er besteht aus nur EINER Zelle mit einem langen Peitschenschwanz, den man Geißel nennt und mit dem er durch dein Blut schwimmt. Er baut kein Zuhause und macht sich kein eigenes Futter — er zieht einfach in deinen Körper und lebt von dir, genau das machen Parasiten. Parasiten gibt es in vielen Größen, von winzigen Einzellern wie diesem bis hin zu langen Schlängelwürmern, aber dieser hier ist nur eine einzige Zelle. Meistens schleicht er sich durch den Stich einer Tsetsefliege ein, deshalb helfen Moskitonetze und das Vermeiden von Stichen. Und wenn doch einer reinkommt, haben Ärzte besondere Medikamente, die ihn aufspüren und wegräumen.

**Adults (popular science, health).**  
🇬🇧 This is a single-celled protozoan parasite — the archetype shown here is a Trypanosoma brucei bloodstream form, the microbe behind African sleeping sickness. Unlike bacteria, it is a full eukaryotic cell with a true nucleus, and it swims through the bloodstream using a single flagellum attached along an undulating membrane. Vector-borne protozoa like this cause some of the world's heaviest disease burdens: trypanosomes ride in on the bite of the tsetse fly, while the malaria parasite Plasmodium arrives via mosquitoes. What makes them so hard to vaccinate against is antigenic variation — the trypanosome constantly swaps the protein coat on its surface, so the immune system is always chasing a target that has already changed disguise. Prevention leans heavily on controlling the insect vectors (nets, repellents, bite avoidance), and infections are treated with specific antiparasitic drugs rather than antibiotics.  
🇩🇪 Dies ist ein einzelliger Protozoen-Parasit — der hier gezeigte Archetyp ist eine Blutform von Trypanosoma brucei, dem Erreger der Afrikanischen Schlafkrankheit. Anders als Bakterien ist er eine vollständige eukaryotische Zelle mit einem echten Zellkern, und er schwimmt mithilfe einer einzelnen Geißel durch die Blutbahn, die entlang einer undulierenden Membran verläuft. Von Insekten übertragene Protozoen wie dieses verursachen einige der schwersten Krankheitslasten weltweit: Trypanosomen gelangen über den Stich der Tsetsefliege in den Körper, während der Malaria-Parasit Plasmodium von Mücken übertragen wird. Besonders schwer gegen sie zu impfen ist wegen der Antigenvariation — der Trypanosom tauscht ständig die Eiweißhülle auf seiner Oberfläche aus, sodass das Immunsystem einem Ziel hinterherjagt, das seine Verkleidung längst gewechselt hat. Vorbeugung setzt vor allem auf die Bekämpfung der Insektenüberträger (Netze, Repellents, Stichvermeidung), und Infektionen werden mit gezielten Antiparasitika behandelt, nicht mit Antibiotika.

**Scientific.**  
🇬🇧 Trypanosoma brucei is a flagellated eukaryotic protozoan of the order Kinetoplastida, shown here as the slender bloodstream trypomastigote (~17–30 µm long). A single flagellum arises from a posterior flagellar pocket and runs forward attached to the cell body by an undulating membrane, emerging free at the anterior end; the fixed spindle shape is maintained by a corset of subpellicular microtubules beneath the plasma membrane. It carries one central membrane-bound nucleus and a single large tubular mitochondrion that spans the length of the cell, within which — near the flagellar base and posterior to the nucleus — sits the kinetoplast, a dense disc of concatenated mitochondrial DNA (kDNA mini- and maxicircles) diagnostic of kinetoplastids. Its hallmark immune-evasion strategy is antigenic variation of a dense variant surface glycoprotein (VSG) coat, switched from a large genomic repertoire to stay ahead of host antibodies. The life cycle is vector-borne, alternating between the mammalian bloodstream and the tsetse fly (Glossina) as biological vector.  
🇩🇪 Trypanosoma brucei ist ein begeißelter eukaryotischer Protozoon aus der Ordnung Kinetoplastida, hier als schlanke Blutform (Trypomastigot, ~17–30 µm lang) dargestellt. Eine einzelne Geißel entspringt einer posterioren Geißeltasche, verläuft nach vorne und ist über eine undulierende Membran mit dem Zellkörper verbunden, bevor sie am Vorderende frei austritt; die feste Spindelform wird durch ein Korsett subpellikulärer Mikrotubuli unter der Zellmembran gehalten. Die Zelle besitzt einen zentralen, membranumhüllten Zellkern und ein einziges großes tubuläres Mitochondrium, das sich über die gesamte Zelllänge erstreckt und in dem — nahe der Geißelbasis und posterior zum Kern — der Kinetoplast liegt, eine dichte Scheibe aus verketteter mitochondrialer DNA (kDNA-Mini- und -Maxicircles), die für Kinetoplastiden kennzeichnend ist. Sein charakteristischer Immunausweich-Trick ist die Antigenvariation einer dichten Hülle aus variablem Oberflächenglykoprotein (VSG), die aus einem großen Genrepertoire umgeschaltet wird, um den Antikörpern des Wirts stets voraus zu sein. Der Lebenszyklus ist vektorübertragen und wechselt zwischen der Blutbahn des Säugetiers und der Tsetsefliege (Glossina) als biologischem Überträger.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a single slender spindle-shaped Trypanosoma trypomastigote: a central true nucleus, a single tubular mitochondrion running the length, a small dense kinetoplast disc near the posterior flagellar base, one flagellum running forward along a fin-like undulating membrane and free at the anterior tip; a pellicle with faint subpellicular microtubule striations. Semi-flat vector shading, muted educational palette. One flagellum, one mitochondrion, one kinetoplast — eukaryotic, no nucleoid. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color SEM of one elongated tapering trypanosome, warm amber body on a dark charcoal substrate; the single flagellum runs the length as a raised ridge forming the undulating membrane and trails free at the anterior end; smooth pellicle surface, shallow depth of field, surface only, no internal organelles. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical still of one translucent spindle-shaped trypanosome with subsurface scattering; distinct natural tints for the nucleus, the single tubular mitochondrion, a small kinetoplast disc at the flagellar base, and the flagellum plus undulating-membrane fold; soft studio light. Anatomically faithful single specimen, natural tones, not neon. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars. Neutral dark uncluttered background so overlay labels read well. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist scientific atlas plate, anatomically modern and correct, painted directly onto warm cream aged paper whose texture FILLS THE ENTIRE SQUARE from edge to edge and corner to corner — the paper IS the whole background. Do NOT depict the painting as a separate sheet, card or page lying on a table or surface; NO mat, NO border, NO frame, NO drop shadow, NO grey or dark panel around a paper sheet. Rich soft translucent watercolour washes with fine ink outlines, and a soft muted darker wash halo directly on the paper behind the subject so labels read well, in the style of the plates cocci__watercolor and rod-bacterium__watercolor. Subject, large and centred: one slender spindle-shaped trypanosome with a single flagellum running along a fin-like undulating membrane and free at the anterior tip; a painterly cut-away reveals a central nucleus, a slim tubular mitochondrion and a small kinetoplast dot near the flagellar base. Keep the surface a smooth pellicle (no cilia, no fringe). One single cell, no worm. Square 1:1, 1080x1080, single subject centered with generous margin; the warm aged paper fills the WHOLE frame edge-to-edge and corner-to-corner (it is NOT a separate sheet on a surface — no mat, border, frame, drop-shadow or background panel). Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1478 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 8.9s — ✅ PASS — slender trypomastigote cutaway: true nucleus, tubular mitochondrion, small posterior kinetoplast, one flagellum along the undulating membrane; correct T. brucei.
  ![textbook 1](theme/textbook/parasite.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/parasite.textbook.svg)
[interactive SVG](theme/textbook/parasite.textbook.svg) · [HTML](theme/textbook/parasite.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1433 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 10.6s — ✅ PASS — single elongated cell, flagellar ridge (undulating membrane) along the body, free flagellum; surface only.
  ![sem 1](theme/sem/parasite.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1441 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 9.0s — ✅ PASS — translucent spindle cell: nucleus, kinetoplast posterior to the nucleus, single flagellum + undulating membrane.
  ![3d 1](theme/3d/parasite.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/parasite.3d.svg)
[interactive SVG](theme/3d/parasite.3d.svg) · [HTML](theme/3d/parasite.3d.html)

### Watercolor plate (`watercolor`) — 3 attempt(s), 4603 tok, $0.116
- attempt 1 · `gemini-2.5-flash-image` · 8.9s — ❌ FAIL — dark charcoal frame around the paper + a bristly ciliate-like fringe.
  ![watercolor 1](theme/watercolor/parasite.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 9.5s — ✅ PASS — no border; single spindle cell, one trailing flagellum, nucleus, small kinetoplast, undulating-membrane fold; smooth pellicle.
  ![watercolor 2](theme/watercolor/parasite.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 8.4s — ✅ PASS — re-rendered full-bleed on aged paper (no sheet/border), cocci/rod style; single spindle cell, flagellum, undulating membrane, nucleus, kinetoplast, tubular mitochondrion.
  ![watercolor 3](theme/watercolor/parasite.attempts/gen-03__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/parasite.watercolor.svg)
[interactive SVG](theme/watercolor/parasite.watercolor.svg) · [HTML](theme/watercolor/parasite.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · Public Domain (CDC PHIL #613) · CDC / Dr. Myron G. Schultz — ✅ PASS — Giemsa blood smear with several Trypanosoma trypomastigotes among red blood cells (CDC PHIL #613, Public Domain); classic scale-vs-RBC teaching view; no baked-in text.
  ![reference](../reference-microscopy/theme/light/parasite.attempts/real-01__LM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 1 | correct T. brucei |
| sem | ✅ teaching-ready | 1 | flagellar ridge |
| 3d | ✅ teaching-ready | 1 | kinetoplast placed correctly |
| watercolor | ✅ teaching-ready | 3 | full-bleed paper (re-rendered) |
| reference LM | ✅ verified | 1 | CDC #613, PD |
