# Varicella-zoster virus (chickenpox) — render log

**Set:** `pathogens-viruses` · **Microbe key:** `varicella-zoster-virus`
**Short description:** Enveloped herpesvirus (human alphaherpesvirus 3 / HHV-3; *Orthoherpesviridae*, subfamily *Alphaherpesvirinae*, genus *Varicellovirus*), ~180–200 nm and pleomorphic rather than perfectly spherical, built to the classic **four-layer** herpesvirus plan: a single linear double-stranded DNA genome of 124,884 bp packaged into a T=16 icosahedral capsid of 162 capsomeres, that capsid cushioned by the **tegument** — the granular protein layer that is the herpesvirus signature and the one illustrations usually omit — and the whole assembly wrapped in a lipid envelope carrying short blunt glycoprotein spikes. Primary airborne infection causes chickenpox; the virus then goes latent for life in sensory nerve ganglia and can reactivate decades later as shingles.

Metadata sidecar: [`varicella-zoster-virus.render.meta.json`](varicella-zoster-virus.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

Varicella-zoster virus is the textbook example of a **four-layer enveloped herpesvirus**, and getting those four layers right — in the right order, each visually distinct — is the whole job of these renders. Working from the outside in:

1. **Lipid envelope.** A host-derived membrane, acquired during secondary envelopment from cytoplasmic membranes, that fully encloses the particle. It makes the finished virion **~180–200 nm** across and, critically, **pleomorphic**: real virions are lumpy and slightly scalloped in outline, not geometric spheres. ViralZone gives the broader range 150–200 nm, "spherical to pleomorphic".
2. **Glycoprotein spikes.** The envelope is studded with **at least nine glycoproteins** — gK (ORF5), gN (ORF9A), gC (ORF14), gB (ORF31), gH (ORF37), gM (ORF50), gL (ORF60), gI (ORF67) and gE (ORF68) — several forming heterodimers, notably **gE–gI** and **gH–gL**. In electron micrographs these appear as **short (~8 nm), blunt, densely packed studs**, emphatically *not* the long stalked clubs of a coronavirus or the HA/NA spikes of influenza. gE is essential and the most abundant, governs cell-to-cell spread with gI, and is the antigen used in the recombinant zoster subunit vaccine.
3. **Tegument.** The layer that makes it a herpesvirus, and the single most commonly omitted structure in VZV illustrations. Between capsid and envelope sits an **amorphous-to-fibrillar proteinaceous compartment** — loosely associated proteins, not a membrane — which occupies substantial real volume and is characteristically **asymmetric**, so the capsid frequently sits eccentrically within the particle. It delivers preformed effectors into the newly infected cell, above all the major transactivator **IE62** (ORF62 product, the ICP4 homolog, 1,310 aa) together with IE63 and the ORF47/ORF66 protein kinases.
4. **Icosahedral capsid.** A **T=16** shell of **162 capsomeres** — 150 hexons and 12 pentons — arranged with two-, three- and five-fold symmetry, the capsomeres being hollow hexagonal and pentagonal units. Core plus capsid (the **nucleocapsid**) measures **~100 nm**. One vertex is replaced by a dodecameric portal through which the DNA is inserted and later ejected.
5. **Genome.** A **single linear double-stranded DNA molecule of 124,884 bp** with ~71 unique ORFs — the **smallest of the human herpesvirus genomes** — packed under pressure inside the capsid, so it should be drawn as a tightly spooled thread, never as segments, never as RNA, and never as a free twisted-ladder helix with drawn base-pair rungs.

**Why this matters for the atlas.** Rotavirus and norovirus, already in this set, are **non-enveloped**. VZV is the contrast case: it *is* enveloped, and it carries a layer neither of them has. A render that shows a bare capsid, or an envelope with an empty gap where the tegument should be, teaches the wrong lesson about exactly the thing this microbe is here to illustrate.

**Life cycle context.** Primary infection begins in respiratory mucosa, is amplified in tonsillar T lymphocytes that carry the virus to skin, and produces varicella (chickenpox). VZV then establishes **lifelong latency in the neurons of dorsal-root, cranial-nerve and autonomic ganglia** with highly restricted transcription. When VZV-specific cell-mediated immunity wanes with age or immunosuppression, it reactivates and travels back down a single sensory nerve to produce **dermatomal herpes zoster** (shingles). Replication is nuclear, and in culture the virus is markedly cell-associated, releasing little free infectious virus.

### Colour legend (teaching convention, held identical across all four styles)

A virion has **no pigment of its own**, and electron microscopes image in greyscale — including the real TEM plate used as this microbe's reference. Every colour below is a teaching convention (see `reference/colors.md`), chosen once and reused across textbook, SEM, 3D and watercolour so the set reads as one poster.

| Structure | Colour |
|---|---|
| Lipid envelope | soft translucent lilac-grey, irregular/scalloped outline |
| Glycoprotein spikes | short blunt dusty-rose studs |
| Tegument | warm amber/tan **granular** padding, drawn asymmetric |
| Icosahedral capsid | cool pale grey-blue, faceted, capsomere tiling visible |
| dsDNA genome | coppery gold, tightly spooled |
| Background | neutral dark charcoal (watercolour: warm aged cream paper) |

### Label reference (Latin / English / German)

| Key | Latin | English | German |
|---|---|---|---|
| `envelope` | Involucrum lipidicum, forma pleomorpha | Lipid envelope, slightly irregular (pleomorphic) outline | Lipidhülle, leicht unregelmäßiger (pleomorpher) Umriss |
| `glycoprotein_spikes` | Glycoproteina brevia involucri (gB, gE/gI, gH/gL) | Short glycoprotein spikes studding the envelope (gB, gC, gE/gI, gH/gL, gK, gM/gN) | Kurze Glykoprotein-Spikes auf der Hülle (gB, gC, gE/gI, gH/gL, gK, gM/gN) |
| `tegument` | Tegumentum proteinaceum inter capsidam et involucrum | Tegument — granular protein layer between capsid and envelope (the herpesvirus signature) | Tegument — körnige Proteinschicht zwischen Kapsid und Hülle (Kennzeichen der Herpesviren) |
| `capsid` | Capsida icosahedra (T=16, capsomera CLXII) | Icosahedral capsid — 162 capsomeres (150 hexons + 12 pentons) | Ikosaedrisches Kapsid — 162 Kapsomere (150 Hexone + 12 Pentone) |
| `capsomere` | Capsomerum cavum (hexonum vel pentonum) | Capsomere — a hollow hexagonal or pentagonal building block of the capsid | Kapsomer — hohler sechs- oder fünfeckiger Baustein des Kapsids |
| `genome` | Genoma DNA bicatenarium lineare (~125 kbp) | Linear double-stranded DNA genome (124,884 bp, ~71 ORFs) | Lineares doppelsträngiges DNA-Genom (124.884 bp, ~71 ORFs) |
| `nucleocapsid` | Nucleocapsida (~100 nm) | Nucleocapsid — capsid plus the enclosed genome core (~100 nm) | Nukleokapsid — Kapsid mit eingeschlossenem Genomkern (~100 nm) |

The labelled SVG overlays use the five structures that can be unambiguously anchored on a rendered particle — envelope, spikes, tegument, capsid, genome — with the shorter label wording; `capsomere` and `nucleocapsid` are reference-only rows.

### Do NOT draw

- A **naked capsid with no envelope** — VZV is always enveloped, unlike rotavirus and norovirus in this same set. *Fatal.*
- A **smooth envelope with no tegument** between it and the capsid — an empty gap, a thin outline or a second smooth membrane in that space. *Fatal.*
- The tegument as a lipid bilayer (it is amorphous/fibrous protein padding, not a membrane).
- A perfectly spherical, geometrically precise particle — the envelope is pleomorphic.
- A helical, rod-shaped, filamentous or bullet-shaped capsid; a bacteriophage head-and-tail body with tail fibres, collar or base plate.
- Long stalked club- or mushroom-headed spikes, a corona of clubs, or a fuzzy fringe (that is coronavirus/influenza).
- RNA of any kind, a segmented genome, or a free B-form double helix with drawn base-pair rungs outside the capsid.
- Bacterial features of any kind: cell wall, peptidoglycan, flagellum, pilus, capsule, nucleoid, ribosomes.
- A nucleus, mitochondria, cytoplasm or any other cell organelle.
- **Blisters, pustules, a rash, scratched skin or a distressed person** in the four science styles — those are clinical signs of the disease, not virus morphology.
- A face, eyes, mouth or any anthropomorphism in the four science styles (reserved for the kids' coloring page).
- More than one virion; any duplicate or extra floating object.
- Any baked-in text, letters, numbers, labels, arrows, scale bars, legends or watermarks.
- A black border, dark frame, vignette, letterbox bar, mat, drop shadow, or the artwork drawn as a sheet lying on a surface.

### Sources

- ScienceDirect Topics, ["Varicella Zoster Virus — an overview"](https://www.sciencedirect.com/topics/neuroscience/varicella-zoster-virus) — four concentric layers; ~100 nm nucleocapsid of 162 capsomeres with 2-/3-/5-fold symmetry; hollow hexagonal/pentagonal capsomeres; ~180–200 nm enveloped virion; ~8 nm glycoprotein spikes; the nine glycoproteins and the gE–gI / gH–gL heterodimers; tegument as an amorphous layer including IE62/IE63; 124,884 bp genome with ≥70 ORFs.
- ViralZone (Expasy), [*Varicellovirus*](https://viralzone.expasy.org/by_species/179) — T=16 icosahedral symmetry; spherical-to-pleomorphic enveloped particle, 150–200 nm; genus taxonomy.
- NCBI RefSeq [NC_001348](https://www.ncbi.nlm.nih.gov/nuccore/NC_001348) (Human alphaherpesvirus 3, Dumas strain) — genome length and ORF count.
- Frontiers in Immunology (2020), ["Manipulation of the Innate Immune Response by Varicella Zoster Virus"](https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2020.00001/full) — IE62/IE63 essential for replication; gE essential and most abundant; gE as the recombinant zoster vaccine antigen.

Machine-readable copy of all of the above: [`varicella-zoster-virus.research.json`](varicella-zoster-virus.research.json).

---

## 2. Real-microscopy reference

**CDC Public Health Image Library (PHIL) image #1878** — negative-stain transmission electron micrograph of a single varicella-zoster virion.

- **Source page:** https://phil.cdc.gov/Details.aspx?pid=1878
- **File fetched:** `https://phil.cdc.gov/PHIL_Images/1878/1878.tif` — HTTP 200, `image/tiff`, 3,204,474 bytes. Despite the `.tif` extension the payload is actually a **PNG**, which decodes cleanly at **1580 × 1911 px, RGBA**.
- **Licence:** Public domain — CDC PHIL states *"None — This image is in the public domain and thus free of any copyright restrictions."* (U.S. Government work.)
- **Attribution:** CDC/B.G. Partin; photo credit Dr. Erskine Palmer. CDC PHIL image #1878 (1982).
- **Modality:** TEM, negative stain, **original greyscale — no colorization applied.**

**Resolution honesty.** The full-resolution file above is what was used. A 700 × 846 px `_lores.jpg` variant of the same frame also returns HTTP 200, and an earlier interrupted pass of this pipeline had fetched *that* one — which would have meant a **1.54× upscale** onto the 1080 canvas presented as if it were native. It was replaced. The displayed reference is a **0.77× downscale** of the native file, so no pixels were invented.

**Processing — deterministic crop, no AI editing.** The displayed image `real-02__TEM-crop` is a **1400 × 1400 px region taken at (25, 335)** of the native 1580 × 1911 px file, Lanczos-resampled to 1080 × 1080. That is the whole of the processing: no generative editing, no shape changes, no false colour. `edit_image.py` was deliberately **not** run — the plate carries no text, no scale bar and no border, so there was nothing to clean, and an AI pass risked re-illustrating the negative-stain grain (exactly the failure that had to be reverted for rotavirus in this same set). The full centre-cropped frame is retained as `real-01__TEM` for provenance.

**AI verification verdict: ✅ PASS.** A **single, well-isolated virion** fills the middle of the frame — the ideal case the rubric asks for, not a clump. All three layers visible in a negative-stain preparation read clearly and corroborate the science reference: an **irregular, scalloped outer envelope** edge with a pronounced fold at the upper left (textbook pleomorphism, not a circle); a broad, dark, strongly **granular tegument** zone occupying most of the particle's area; and a lighter, rounded **capsid** sitting distinctly **off-centre** within it — the characteristic tegument asymmetry. No baked-in text, no scale bar, no instrument data, no border.

**Verified fallbacks** (download + pixel size confirmed; frame contents *not* visually inspected — check before use): PHIL [#1879](https://phil.cdc.gov/Details.aspx?pid=1879) (2305 × 2127), [#1880](https://phil.cdc.gov/Details.aspx?pid=1880) (2987 × 2240), [#2144](https://phil.cdc.gov/Details.aspx?pid=2144) (2436 × 2299), [#6493](https://phil.cdc.gov/Details.aspx?pid=6493) (2691 × 2005). PHIL #5410 returns HTTP 404.

## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet varicella-zoster virus, the one that gives people chickenpox. It belongs to a family called the herpesviruses, and they are built like a tiny parcel with four layers. Right in the middle is a long thread of DNA, the instruction manual, wound up tight like thread on a spool. Around that sits a lovely little ball made of 162 protein blocks fitted together into triangles, a bit like a miniature football; scientists call it the capsid. Then comes the layer that makes herpesviruses special and that most pictures forget: a soft, grainy padding called the tegument, stuffed with tools the virus wants to unpack the moment it arrives somewhere new. And wrapped around the whole thing is a soft, slightly floppy oily coat with hundreds of short blunt studs poking out of it, which is why a herpesvirus is never a perfectly neat sphere. The virus travels through the air, so it can drift from one person to another just by breathing. A week or two later, little itchy spots appear all over the skin. If that happens, the job is to be gentle with your skin while it heals: a cool bath, a soothing lotion dabbed on by a grown-up, soft loose clothes, fingernails cut short, and patting instead of scratching, so the spots heal away smooth. Better still, most children now get a vaccination before they ever meet the real thing, which teaches the body what that studded coat looks like in advance. And here is the strangest part. Even after the spots are long gone, the virus does not leave completely: it curls up and falls asleep deep inside a nerve near the spine and stays there quietly for decades. Much later in life it can wake up again as a painful rash called shingles, which is why grandparents are offered a different vaccination of their own.  
🇩🇪 Das ist das Varizella-Zoster-Virus, das Virus, von dem man Windpocken bekommt. Es gehört zur Familie der Herpesviren, und die sind gebaut wie ein winziges Päckchen mit vier Schichten. Ganz in der Mitte liegt ein langer DNA-Faden, die Bauanleitung, fest aufgewickelt wie Garn auf einer Spule. Darum sitzt eine hübsche kleine Kugel aus 162 Eiweißbausteinen, die zu Dreiecken zusammengesteckt sind, fast wie ein Miniatur-Fußball; die Fachleute nennen sie Kapsid. Dann kommt die Schicht, die Herpesviren besonders macht und die auf den meisten Bildern schlicht vergessen wird: eine weiche, körnige Polsterung namens Tegument, vollgepackt mit Werkzeugen, die das Virus sofort auspacken will, wenn es irgendwo ankommt. Und um das Ganze herum liegt ein weicher, etwas schlabbriger Fettmantel mit Hunderten kurzer, stumpfer Noppen darauf — deshalb ist ein Herpesvirus nie eine perfekt runde Kugel. Das Virus reist durch die Luft und kann allein beim Atmen von einem Menschen zum nächsten schweben. Ein bis zwei Wochen später erscheinen überall auf der Haut kleine juckende Pünktchen. Wenn das passiert, geht es vor allem darum, lieb zur Haut zu sein, während sie heilt: ein kühles Bad, eine beruhigende Lotion, die ein Erwachsener auftupft, weiche lockere Kleidung, kurz geschnittene Fingernägel und lieber sanft klopfen statt kratzen, damit alles glatt verheilt. Noch besser: Die meisten Kinder bekommen heute eine Impfung, bevor sie dem echten Virus überhaupt begegnen — sie zeigt dem Körper diesen genoppten Mantel schon vorher. Und jetzt das Merkwürdigste daran: Auch wenn die Pünktchen längst weg sind, verschwindet das Virus nicht ganz. Es rollt sich tief in einem Nerv nahe der Wirbelsäule zusammen, schläft dort jahrzehntelang still vor sich hin und kann viel später im Leben wieder aufwachen — als schmerzhafter Ausschlag, der Gürtelrose heißt. Genau dafür gibt es für Großeltern eine eigene, andere Impfung.

**Adults (popular science, health).**  
🇬🇧 Varicella-zoster virus (VZV, human herpesvirus 3) is one of nine herpesviruses that infect people, and it has the classic herpesvirus build: a double-stranded DNA genome inside an icosahedral capsid of 162 capsomeres, that capsid cushioned by a thick, granular protein layer called the tegument, and the whole assembly wrapped in a lipid envelope carrying short glycoprotein spikes. The envelope makes the finished virion 180-200 nm across and slightly irregular in outline rather than perfectly round, and it also makes the particle fragile outside the body. Transmission is nonetheless extremely efficient because it happens by air: VZV is one of the few genuinely airborne human viruses, and in an unvaccinated household almost everyone exposed catches it. After roughly two weeks of quiet replication the familiar itchy, crop-by-crop rash appears. What sets VZV apart from most childhood infections is what happens next. Rather than being cleared entirely, the virus travels up sensory nerve fibres and establishes lifelong latency in the neurons of the dorsal root and cranial nerve ganglia, transcribing almost nothing and making no new particles. Decades later, as cell-mediated immunity wanes with age or immunosuppression, it can reactivate, travel back down a single nerve and erupt as herpes zoster - shingles - a painful, strictly one-sided band of blisters that can be followed by months of postherpetic neuralgia. Two quite different vaccines address the two halves of that story: a live attenuated varicella vaccine given in childhood to prevent chickenpox, and a separate adjuvanted recombinant subunit vaccine given to older adults to prevent shingles. Antivirals such as aciclovir and valaciclovir shorten an attack when started early.  
🇩🇪 Das Varizella-Zoster-Virus (VZV, humanes Herpesvirus 3) ist eines von neun Herpesviren des Menschen und zeigt den klassischen Herpesvirus-Bauplan: ein doppelsträngiges DNA-Genom in einem ikosaedrischen Kapsid aus 162 Kapsomeren, dieses Kapsid gepolstert von einer dicken, körnigen Proteinschicht namens Tegument, und das Ganze eingehüllt in eine Lipidmembran mit kurzen Glykoprotein-Spikes. Die Hülle macht das fertige Virion 180-200 nm groß und in der Kontur leicht unregelmäßig statt perfekt rund - und sie macht das Teilchen außerhalb des Körpers empfindlich. Trotzdem überträgt es sich außerordentlich effizient, weil es über die Luft geschieht: VZV gehört zu den wenigen echt aerogen übertragenen Viren des Menschen, und in einem ungeimpften Haushalt steckt sich praktisch jeder Kontakt an. Nach etwa zwei Wochen stiller Vermehrung erscheint der bekannte juckende Ausschlag, der schubweise in Schüben neuer Bläschen aufblüht. Was VZV von den meisten Kinderkrankheiten unterscheidet, ist das, was danach passiert. Statt vollständig eliminiert zu werden, wandert das Virus entlang sensibler Nervenfasern nach oben und richtet sich lebenslang latent in den Neuronen der Spinal- und Hirnnervenganglien ein, transkribiert dort fast nichts und bildet keine neuen Partikel. Jahrzehnte später, wenn die zelluläre Immunität mit dem Alter oder durch Immunsuppression nachlässt, kann es reaktivieren, denselben Nerv wieder hinabwandern und als Herpes zoster - Gürtelrose - ausbrechen: ein schmerzhaftes, streng einseitiges Bläschenband, dem eine monatelange postzosterische Neuralgie folgen kann. Zwei ganz unterschiedliche Impfstoffe decken die beiden Hälften dieser Geschichte ab: ein abgeschwächter Lebendimpfstoff im Kindesalter gegen die Windpocken und ein separater adjuvantierter rekombinanter Totimpfstoff für ältere Erwachsene gegen die Gürtelrose. Virostatika wie Aciclovir und Valaciclovir verkürzen einen Ausbruch, wenn sie früh begonnen werden.

**Scientific.**  
🇬🇧 Varicella-zoster virus (VZV; human alphaherpesvirus 3) is classified in the family Orthoherpesviridae, subfamily Alphaherpesvirinae, genus Varicellovirus. The enveloped virion measures roughly 180-200 nm and is pleomorphic, with the four-layer herpesvirus architecture. Its genome is a linear double-stranded DNA molecule of about 125 kbp encoding roughly 70 open reading frames, the smallest genome among the human herpesviruses, packaged under pressure inside a T=16 icosahedral capsid built from 162 capsomeres - 150 hexons and 12 pentons - one vertex of which is replaced by the dodecameric portal through which DNA is inserted and later ejected. Between capsid and envelope lies the tegument, an amorphous to fibrillar proteinaceous compartment that is characteristically asymmetric, so the capsid is frequently eccentric within the particle; it delivers preformed effectors into the newly infected cell, notably the major transactivator IE62 (ORF62 product) and the ORF47 and ORF66 protein kinases. The envelope is derived from cytoplasmic membranes during secondary envelopment and carries at least eight glycoproteins - gB, gC, gE, gH, gI, gK, gL and gM with gN - which appear in electron micrographs as short, blunt, densely packed spikes rather than long projections; gE, essential and the most abundant, forms a heterodimer with gI that governs cell-to-cell spread, and gE is the antigen used in the recombinant zoster subunit vaccine. Primary infection begins in respiratory mucosa, is amplified in tonsillar T lymphocytes that traffic the virus to skin, and produces varicella. VZV then establishes lifelong latency in neurons of dorsal root, cranial nerve and autonomic ganglia with highly restricted transcription; reactivation on decline of VZV-specific cell-mediated immunity yields dermatomal herpes zoster. Replication is nuclear and, in culture, the virus is markedly cell-associated, with little free infectious virus released.  
🇩🇪 Das Varizella-Zoster-Virus (VZV; humanes Alphaherpesvirus 3) gehört zur Familie Orthoherpesviridae, Unterfamilie Alphaherpesvirinae, Gattung Varicellovirus. Das behüllte Virion misst etwa 180-200 nm, ist pleomorph und zeigt den vierschichtigen Herpesvirus-Aufbau. Sein Genom ist ein lineares doppelsträngiges DNA-Molekül von rund 125 kbp mit etwa 70 offenen Leserastern - das kleinste Genom unter den humanen Herpesviren - und wird unter hohem Druck in ein ikosaedrisches Kapsid der Triangulationszahl T=16 verpackt, das aus 162 Kapsomeren besteht: 150 Hexonen und 12 Pentonen. Eine Ecke ist durch das dodekamere Portal ersetzt, durch das die DNA eingefädelt und später wieder ausgestoßen wird. Zwischen Kapsid und Hülle liegt das Tegument, ein amorphes bis fibrilläres Proteinkompartiment, das charakteristischerweise asymmetrisch ist, weshalb das Kapsid im Partikel häufig exzentrisch sitzt; es liefert vorgefertigte Effektoren in die frisch infizierte Zelle, insbesondere den Haupttransaktivator IE62 (Produkt von ORF62) sowie die Proteinkinasen ORF47 und ORF66. Die Hülle entsteht bei der sekundären Umhüllung aus zytoplasmatischen Membranen und trägt mindestens acht Glykoproteine - gB, gC, gE, gH, gI, gK, gL sowie gM mit gN -, die im Elektronenmikroskop als kurze, stumpfe, dicht stehende Spikes erscheinen und nicht als lange Fortsätze. gE ist essenziell und am häufigsten, bildet mit gI ein Heterodimer, das die Zell-zu-Zell-Ausbreitung steuert, und dient als Antigen des rekombinanten Zoster-Subunit-Impfstoffs. Die Primärinfektion beginnt an der Atemwegsschleimhaut, wird in tonsillären T-Lymphozyten amplifiziert, die das Virus in die Haut tragen, und führt zur Varizellen-Erkrankung. Anschließend etabliert VZV eine lebenslange Latenz in Neuronen der Spinal-, Hirnnerven- und autonomen Ganglien mit stark eingeschränkter Transkription; die Reaktivierung bei nachlassender VZV-spezifischer zellulärer Immunität führt zum dermatomal begrenzten Herpes zoster. Die Replikation erfolgt im Zellkern; in Kultur ist das Virus ausgeprägt zellassoziiert, freies infektiöses Virus wird kaum freigesetzt.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE varicella-zoster virus particle (VZV, human herpesvirus 3 - the herpesvirus of chickenpox and shingles), centered in a square 1:1 1080x1080 frame with generous empty negative space around it so labels can be attached later. Semi-flat vector-style shading with THIN, clean, dark outlines (never heavy black cartoon strokes), gentle soft shading with subtle dimensionality, a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints - never bright primary or cartoon colours - on a neutral dark charcoal uncluttered background that fills the frame edge-to-edge.

Draw the virion as a THREE-DIMENSIONAL rounded particle seen at a slight angle (not a flat concentric-ring diagram), with a single neat wedge lifted out of the front so the interior is opened like a cut-away model and all four layers are exposed in order along the cut.

THREE CRITICAL GEOMETRY RULES - these are the errors that ruin this particular virus:

* CAPSID SHAPE. The capsid is an ICOSAHEDRON: a roughly BALL-SHAPED polyhedron with
  flat triangular and pentagonal faces, about as wide as it is tall, sitting like a
  faceted gemstone ball. It must NEVER be a cylinder, barrel, tube, drum, column,
  lens, ring or donut, and never a hexagonally-tiled tube seen end-on.

* GENOME PLACEMENT. The DNA is packed INSIDE the capsid and is visible ONLY through
  the opening where the cut-away has removed part of the capsid shell. There must be
  NO DNA anywhere in the space between the capsid and the envelope - that space
  contains ONLY the granular tegument. Draw the genome as a dense, tightly wound
  coppery-gold thread coiled round and round on itself, filling the capsid interior
  like tightly spooled cable or a ball of wound wire. Do NOT draw a classic
  twisted-ladder double helix with visible cross rungs, and do NOT draw a long free
  helix floating in the particle.

* SPIKE SHAPE. Each glycoprotein spike is a simple SMOOTH ROUNDED BUMP - a low dome
  or half-bead sitting flush on the membrane, like a pebble half-buried in the
  surface. It has NO neck, NO stem, NO waist, NO stalk, NO flared cup, NO trumpet
  mouth, NO knob or mushroom head, and is NOT a three-lobed cluster. Each is WIDER
  THAN IT IS LONG and projects only about one twentieth of the particle's diameter.
  Many of them, closely and evenly set, reading as a finely pebbled or beaded rim -
  never long clubs, never spines, never rays, never a starburst or sea-urchin.

The virion has FOUR layers, arranged strictly CONCENTRICALLY, and EVERY one must be
clearly visible and clearly distinct from its neighbours. From the OUTSIDE IN:

(1) LIPID ENVELOPE - the outermost layer, which fully encloses everything else: a soft
translucent lilac-grey membrane. Its outline is deliberately NOT a perfect circle -
it is gently IRREGULAR, slightly scalloped and a little lumpy, bulging more on one
side than the other, because a real herpesvirus is pleomorphic.

(2) GLYCOPROTEIN SPIKES - many short blunt rounded studs in dusty rose, densely and
evenly covering the whole envelope surface (see the SPIKE SHAPE rule above).

(3) TEGUMENT - the layer that makes this a herpesvirus, and the one most illustrations
wrongly leave out, so give it real prominence. The entire space between the envelope
and the capsid is filled by a THICK, SUBSTANTIAL mass of warm amber-tan GRANULAR,
slightly fibrous protein packing, with visible fine grainy stippled texture, occupying
REAL VOLUME roughly as thick as the capsid's radius. It is NEVER an empty gap, NEVER a
thin outline, and NEVER a second smooth membrane or bilayer - it is loose protein
padding. Draw it ASYMMETRICALLY, clearly thicker on one side, so the capsid inside sits
noticeably OFF-CENTRE within the envelope. Nothing else lives in this space.

(4) ICOSAHEDRAL CAPSID - cradled in the tegument, a crisply FACETED, angular, ball-shaped
polyhedral shell in cool pale grey-blue, obviously hard and geometric against the soft
granular tegument around it. Its faces are tiled with small hollow HEXAGONAL and
PENTAGONAL capsomere units (162 in reality - draw enough that the tiling clearly reads).

(5) GENOME - inside that capsid, seen through the cut-away opening, the tightly spooled
coppery-gold double-stranded DNA (see the GENOME PLACEMENT rule above). ONE continuous
molecule: not segments, not RNA.

STRICTLY FORBIDDEN - the render is rejected if any of these appear:
- A naked capsid with NO envelope, or an envelope with NO tegument between it and the
  capsid. Both are fatal errors.
- The tegument drawn as a thin line, an empty gap, or a second smooth membrane.
- DNA, a helix, or anything other than granular tegument in the space between capsid
  and envelope.
- A double helix drawn as a twisted ladder with visible base-pair rungs.
- A cylindrical, barrel, tube, drum, lens, ring or donut-shaped capsid.
- A perfectly circular, geometrically precise outline.
- Spikes with a neck, stalk, waist, flared cup, trumpet mouth or mushroom head; a
  corona of clubs; a fuzzy fringe; radiating rays; a starburst.
- A helical, rod, filamentous or bullet-shaped capsid; any bacteriophage tail, collar,
  base plate or legs.
- RNA or a segmented genome.
- Any bacterial feature: cell wall, flagellum, pilus, capsule, nucleoid, ribosomes.
  Any nucleus, mitochondria or other cell organelle.
- Skin blisters, pustules, a rash, scratched skin, or any person or body part.
- A face, eyes, mouth or any anthropomorphism.
- More than one virion, or any duplicate or extra floating object.
- ANY text, letters, numbers, labels, arrows, scale bars, legends or watermarks.
- Any black border, dark frame, vignette or letterbox bar, and never the artwork drawn as a sheet or card lying on a table or surface - the background must reach all four edges of the square.


</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

A photorealistic FALSE-COLOUR SCANNING ELECTRON MICROGRAPH plate of a SINGLE varicella-zoster virus particle (VZV, human herpesvirus 3 - the herpesvirus of chickenpox and shingles), centered in a square 1:1 1080x1080 frame with generous space around it for later labels.

IT MUST READ AS A REAL MICROGRAPH, NOT A CLEAN 3D RENDER. This is the single most important requirement. Demand genuine micrograph character: fine GRANULAR sputter-coating texture over every surface, tiny specular micro-highlights on that grain, SHALLOW DEPTH OF FIELD so the near surface is crisp and the far edge falls softly out of focus, faint DETECTOR NOISE and scan grain across the entire frame including the background, slight uneven illumination, and a soft CONTACT SHADOW where the particle rests on a subtly textured, faintly debris-flecked substrate. It must NOT look like a smooth glossy CG ball on a clean gradient. The false-colour palette is a soft lilac-grey particle with dusty rose surface studs on a cool slate-teal substrate. The image fills the square edge-to-edge.

This is a SURFACE view, so only the OUTSIDE of the enveloped virion is visible - that is correct for SEM and NO interior structures should be shown.

What must read clearly:

(1) THE ENVELOPED VIRION as a single rounded body whose silhouette is markedly PLEOMORPHIC - clearly IRREGULAR and asymmetric, softly scalloped and lumpy, noticeably wider on one side, with two or three shallow creases, dimples or soft folds in the membrane. It must NOT be a symmetrical sphere. The membrane surface looks soft, slightly draped and skin-like, not hard or shell-like.

(2) GLYCOPROTEIN SPIKES covering the whole visible surface as MANY SHORT, BLUNT, SMOOTH ROUNDED BUMPS - low domes or half-beads sitting flush in the membrane, closely and evenly set like a finely pebbled skin. Each is WIDER THAN IT IS LONG, projects only about one twentieth of the particle's diameter, and has NO neck, NO stem, NO stalk, NO flared cup, NO mushroom head, and is NOT a three-lobed cluster.

STRICTLY FORBIDDEN - the render is rejected if any of these appear:
- A smooth glossy CG-render look with no grain, no depth of field and no contact shadow.
- A hard, faceted, geometric or crystalline shell surface - the icosahedral capsid is INTERNAL and must NOT be visible from outside.
- A perfectly smooth symmetrical sphere.
- Spikes with a neck, stalk, flared cup, trumpet mouth or mushroom head; a corona of clubs; a fuzzy hairy fringe; radiating rays; a starburst; a sea-urchin silhouette.
- A helical, rod, filamentous or bullet-shaped body; any bacteriophage tail, collar, base plate or legs.
- Any bacterial feature: cell wall, flagellum, pilus, fimbriae, capsule, dividing septum.
- Skin blisters, pustules, a rash, or any person, skin surface or body part.
- A face, eyes, mouth or any anthropomorphism.
- More than one particle, or any duplicate or extra floating object.
- ANY text, letters, numbers, labels, arrows, scale bars, magnification data, instrument banner or watermark.
- Any black border, dark frame, vignette or letterbox bar, and never the artwork drawn as a sheet or card lying on a table or surface - the background must reach all four edges of the square.


</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Stylized 3D medical-illustration still of a SINGLE varicella-zoster virus particle (VZV, human herpesvirus 3 - the herpesvirus of chickenpox and shingles), centered in a square 1:1 1080x1080 frame with generous empty space around it for later labels. Scientific-animation look: soft global illumination, gentle rim light, subsurface scattering on the membrane, believable organic protein materials with a matte biological sheen, on a clean seamless dark studio background that fills the frame edge-to-edge. COLORIZE IN NATURAL, BELIEVABLE BIOLOGICAL TONES so every structure is clearly distinguishable - soft, slightly desaturated tints, never near-monochrome and never neon or candy-bright.

The particle is modelled as a rounded three-dimensional body with a generous quadrant cut away, so we look into the opened interior and can see all four layers stacked in order.

THREE CRITICAL GEOMETRY RULES - these are the errors that ruin this particular virus:

* CAPSID SHAPE. The capsid is an ICOSAHEDRON: a roughly BALL-SHAPED polyhedron with
  flat triangular and pentagonal faces, about as wide as it is tall, sitting like a
  faceted gemstone ball. It must NEVER be a cylinder, barrel, tube, drum, column,
  lens, ring or donut, and never a hexagonally-tiled tube seen end-on.

* GENOME PLACEMENT. The DNA is packed INSIDE the capsid and is visible ONLY through
  the opening where the cut-away has removed part of the capsid shell. There must be
  NO DNA anywhere in the space between the capsid and the envelope - that space
  contains ONLY the granular tegument. Draw the genome as a dense, tightly wound
  coppery-gold thread coiled round and round on itself, filling the capsid interior
  like tightly spooled cable or a ball of wound wire. Do NOT draw a classic
  twisted-ladder double helix with visible cross rungs, and do NOT draw a long free
  helix floating in the particle.

* SPIKE SHAPE. Each glycoprotein spike is a simple SMOOTH ROUNDED BUMP - a low dome
  or half-bead sitting flush on the membrane, like a pebble half-buried in the
  surface. It has NO neck, NO stem, NO waist, NO stalk, NO flared cup, NO trumpet
  mouth, NO knob or mushroom head, and is NOT a three-lobed cluster. Each is WIDER
  THAN IT IS LONG and projects only about one twentieth of the particle's diameter.
  Many of them, closely and evenly set, reading as a finely pebbled or beaded rim -
  never long clubs, never spines, never rays, never a starburst or sea-urchin.

The virion has FOUR layers, arranged strictly CONCENTRICALLY, and EVERY one must be
clearly visible and clearly distinct from its neighbours. From the OUTSIDE IN:

(1) LIPID ENVELOPE - the outermost layer, which fully encloses everything else: a soft
translucent lilac-grey membrane. Its outline is deliberately NOT a perfect circle -
it is gently IRREGULAR, slightly scalloped and a little lumpy, bulging more on one
side than the other, because a real herpesvirus is pleomorphic.

(2) GLYCOPROTEIN SPIKES - many short blunt rounded studs in dusty rose, densely and
evenly covering the whole envelope surface (see the SPIKE SHAPE rule above).

(3) TEGUMENT - the layer that makes this a herpesvirus, and the one most illustrations
wrongly leave out, so give it real prominence. The entire space between the envelope
and the capsid is filled by a THICK, SUBSTANTIAL mass of warm amber-tan GRANULAR,
slightly fibrous protein packing, with visible fine grainy stippled texture, occupying
REAL VOLUME roughly as thick as the capsid's radius. It is NEVER an empty gap, NEVER a
thin outline, and NEVER a second smooth membrane or bilayer - it is loose protein
padding. Draw it ASYMMETRICALLY, clearly thicker on one side, so the capsid inside sits
noticeably OFF-CENTRE within the envelope. Nothing else lives in this space.

(4) ICOSAHEDRAL CAPSID - cradled in the tegument, a crisply FACETED, angular, ball-shaped
polyhedral shell in cool pale grey-blue, obviously hard and geometric against the soft
granular tegument around it. Its faces are tiled with small hollow HEXAGONAL and
PENTAGONAL capsomere units (162 in reality - draw enough that the tiling clearly reads).

(5) GENOME - inside that capsid, seen through the cut-away opening, the tightly spooled
coppery-gold double-stranded DNA (see the GENOME PLACEMENT rule above). ONE continuous
molecule: not segments, not RNA.

STRICTLY FORBIDDEN - the render is rejected if any of these appear:
- A naked capsid with NO envelope, or an envelope with NO tegument between it and the
  capsid. Both are fatal errors.
- The tegument drawn as a thin line, an empty gap, or a second smooth membrane.
- DNA, a helix, or anything other than granular tegument in the space between capsid
  and envelope.
- A double helix drawn as a twisted ladder with visible base-pair rungs.
- A cylindrical, barrel, tube, drum, lens, ring or donut-shaped capsid.
- A perfectly circular, geometrically precise outline.
- Spikes with a neck, stalk, waist, flared cup, trumpet mouth or mushroom head; a
  corona of clubs; a fuzzy fringe; radiating rays; a starburst.
- A helical, rod, filamentous or bullet-shaped capsid; any bacteriophage tail, collar,
  base plate or legs.
- RNA or a segmented genome.
- Any bacterial feature: cell wall, flagellum, pilus, capsule, nucleoid, ribosomes.
  Any nucleus, mitochondria or other cell organelle.
- Skin blisters, pustules, a rash, scratched skin, or any person or body part.
- A face, eyes, mouth or any anthropomorphism.
- More than one virion, or any duplicate or extra floating object.
- ANY text, letters, numbers, labels, arrows, scale bars, legends or watermarks.
- Any black border, dark frame, vignette or letterbox bar, and never the artwork drawn as a sheet or card lying on a table or surface - the background must reach all four edges of the square.


</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

A hand-painted WATERCOLOUR naturalist scientific plate of a SINGLE varicella-zoster virus particle (VZV, human herpesvirus 3 - the herpesvirus of chickenpox and shingles), in the composition of a 19th-century scientific atlas but anatomically modern and correct. Square 1:1, 1080x1080. Soft translucent washes, fine ink linework for the outlines, granulating pigment texture.

THE PAPER IS THE BACKGROUND. Warm, aged, softly mottled cream paper with gentle foxing must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner. Do NOT paint the artwork as a separate sheet, card or page lying on a table or any other surface. There must be NO mat, NO border, NO frame, NO ruled line, NO drop shadow and NO grey or dark panel anywhere around the painting. The subject is large and centred, sitting on a soft darker wash halo painted directly onto that same paper, with generous quiet paper around it for labels.

Paint the virion as a THREE-DIMENSIONAL rounded particle seen at a slight angle, with a painterly wedge cut out of the front to open the interior. The layers must stay CONCENTRIC and nested - do not paint the tegument as a fat offset ring or donut with the envelope peeking out to one side.

THREE CRITICAL GEOMETRY RULES - these are the errors that ruin this particular virus:

* CAPSID SHAPE. The capsid is an ICOSAHEDRON: a roughly BALL-SHAPED polyhedron with
  flat triangular and pentagonal faces, about as wide as it is tall, sitting like a
  faceted gemstone ball. It must NEVER be a cylinder, barrel, tube, drum, column,
  lens, ring or donut, and never a hexagonally-tiled tube seen end-on.

* GENOME PLACEMENT. The DNA is packed INSIDE the capsid and is visible ONLY through
  the opening where the cut-away has removed part of the capsid shell. There must be
  NO DNA anywhere in the space between the capsid and the envelope - that space
  contains ONLY the granular tegument. Draw the genome as a dense, tightly wound
  coppery-gold thread coiled round and round on itself, filling the capsid interior
  like tightly spooled cable or a ball of wound wire. Do NOT draw a classic
  twisted-ladder double helix with visible cross rungs, and do NOT draw a long free
  helix floating in the particle.

* SPIKE SHAPE. Each glycoprotein spike is a simple SMOOTH ROUNDED BUMP - a low dome
  or half-bead sitting flush on the membrane, like a pebble half-buried in the
  surface. It has NO neck, NO stem, NO waist, NO stalk, NO flared cup, NO trumpet
  mouth, NO knob or mushroom head, and is NOT a three-lobed cluster. Each is WIDER
  THAN IT IS LONG and projects only about one twentieth of the particle's diameter.
  Many of them, closely and evenly set, reading as a finely pebbled or beaded rim -
  never long clubs, never spines, never rays, never a starburst or sea-urchin.

The virion has FOUR layers, arranged strictly CONCENTRICALLY, and EVERY one must be
clearly visible and clearly distinct from its neighbours. From the OUTSIDE IN:

(1) LIPID ENVELOPE - the outermost layer, which fully encloses everything else: a soft
translucent lilac-grey membrane. Its outline is deliberately NOT a perfect circle -
it is gently IRREGULAR, slightly scalloped and a little lumpy, bulging more on one
side than the other, because a real herpesvirus is pleomorphic.

(2) GLYCOPROTEIN SPIKES - many short blunt rounded studs in dusty rose, densely and
evenly covering the whole envelope surface (see the SPIKE SHAPE rule above).

(3) TEGUMENT - the layer that makes this a herpesvirus, and the one most illustrations
wrongly leave out, so give it real prominence. The entire space between the envelope
and the capsid is filled by a THICK, SUBSTANTIAL mass of warm amber-tan GRANULAR,
slightly fibrous protein packing, with visible fine grainy stippled texture, occupying
REAL VOLUME roughly as thick as the capsid's radius. It is NEVER an empty gap, NEVER a
thin outline, and NEVER a second smooth membrane or bilayer - it is loose protein
padding. Draw it ASYMMETRICALLY, clearly thicker on one side, so the capsid inside sits
noticeably OFF-CENTRE within the envelope. Nothing else lives in this space.

(4) ICOSAHEDRAL CAPSID - cradled in the tegument, a crisply FACETED, angular, ball-shaped
polyhedral shell in cool pale grey-blue, obviously hard and geometric against the soft
granular tegument around it. Its faces are tiled with small hollow HEXAGONAL and
PENTAGONAL capsomere units (162 in reality - draw enough that the tiling clearly reads).

(5) GENOME - inside that capsid, seen through the cut-away opening, the tightly spooled
coppery-gold double-stranded DNA (see the GENOME PLACEMENT rule above). ONE continuous
molecule: not segments, not RNA.

STRICTLY FORBIDDEN - the render is rejected if any of these appear:
- A naked capsid with NO envelope, or an envelope with NO tegument between it and the
  capsid. Both are fatal errors.
- The tegument drawn as a thin line, an empty gap, or a second smooth membrane.
- DNA, a helix, or anything other than granular tegument in the space between capsid
  and envelope.
- A double helix drawn as a twisted ladder with visible base-pair rungs.
- A cylindrical, barrel, tube, drum, lens, ring or donut-shaped capsid.
- A perfectly circular, geometrically precise outline.
- Spikes with a neck, stalk, waist, flared cup, trumpet mouth or mushroom head; a
  corona of clubs; a fuzzy fringe; radiating rays; a starburst.
- A helical, rod, filamentous or bullet-shaped capsid; any bacteriophage tail, collar,
  base plate or legs.
- RNA or a segmented genome.
- Any bacterial feature: cell wall, flagellum, pilus, capsule, nucleoid, ribosomes.
  Any nucleus, mitochondria or other cell organelle.
- Skin blisters, pustules, a rash, scratched skin, or any person or body part.
- A face, eyes, mouth or any anthropomorphism.
- More than one virion, or any duplicate or extra floating object.
- ANY text, letters, numbers, labels, arrows, scale bars, legends or watermarks.
- A framed, matted or bordered sheet of paper lying on a surface. The aged paper must BE the background and reach all four edges.
- Any handwriting, plate number or signature anywhere on the paper.


</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 3 attempt(s), 8472 tok, $0.126
- attempt 1 · `gemini-2.5-flash-image` · 7.3s — ⚠️ PARTIAL (gemini-2.5-flash-image) — the four layers were all present and the tegument was correctly a thick granular amber zone, but two real errors. The genome was drawn as a coiled spring sitting in the space BETWEEN the tegument and the capsid, when the DNA belongs inside the capsid and that space must contain tegument only. The glycoprotein spikes were long stalked studs with narrow necks and flared trumpet mouths — the stalked-club silhouette the reference forbids — projecting about an eighth of the diameter. Fix-prompt: state that the DNA is visible only through the cut-away opening in the capsid shell and that nothing but tegument lives between capsid and envelope; make each spike a smooth rounded dome with no neck and no flare.
  ![textbook 1](theme/textbook/varicella-zoster-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 7.3s — ✅ PASS (gemini-2.5-flash-image) — both errors fixed. The genome is now a tightly spooled coppery coil INSIDE a ball-shaped faceted capsid, the tegument is a thick, visibly granular amber layer filling the whole space between capsid and envelope, and the lilac envelope has a properly irregular pleomorphic outline. Muted dusty palette, thin outlines, dark charcoal background to all four edges, no text, no border. Not chosen only because attempt 3 reads better as an icosahedron. Minor: the studs are drawn as short hollow open-ended cylinders rather than solid domes.
  ![textbook 2](theme/textbook/varicella-zoster-virus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 20.3s — ✅ PASS (gemini-3-pro-image) — CHOSEN as the label base, and the strongest reading of the anatomy in the whole set. The capsid is an unmistakable ICOSAHEDRON with clean triangular facets and hexagonal capsomere tiling, so the T=16 geometry actually teaches; the coppery genome is correctly spooled inside it and visible only through the opened facet; the tegument is a thick, stippled, granular amber layer filling the entire space between capsid and envelope; the envelope is lilac with a clearly lumpy pleomorphic outline; and the studs are now solid rounded domes sitting flush on the membrane with no neck, no flare and no mushroom head. Dark charcoal background reaches all four edges, no baked-in text, no border, single specimen. The five structures are well separated for leader lines. Known compromise: the outlines are a touch heavier and the palette slightly more saturated than the ideal muted house style, and the capsid is drawn smaller relative to the virion than the real ~100 nm-in-180 nm proportion, which over-thickens the tegument — a deliberate-looking exaggeration that happens to serve the teaching point but is not to scale.
  ![textbook 3](theme/textbook/varicella-zoster-virus.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/varicella-zoster-virus.textbook.svg)
[interactive SVG](theme/textbook/varicella-zoster-virus.textbook.svg) · [HTML](theme/textbook/varicella-zoster-virus.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 4025 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 7.2s — ⚠️ PARTIAL (gemini-2.5-flash-image) — correct in substance (single enveloped particle, surface only, no internal structures shown, which is right for SEM; no text, no border) but it failed as a MICROGRAPH: a smooth glossy CG ball on a flat teal gradient, with no granular sputter texture, no depth of field, no detector grain and no contact shadow. The outline was also close to a perfect sphere rather than pleomorphic, and the studs were clumpy three-lobed knobs. Fix-prompt: demand genuine micrograph character — granular sputter coating, specular micro-highlights, shallow depth of field, frame-wide detector noise, a soft contact shadow on a debris-flecked substrate — plus a markedly irregular silhouette and smooth blunt half-bead studs.
  ![sem 1](theme/sem/varicella-zoster-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.1s — ✅ PASS (gemini-2.5-flash-image) — CHOSEN. Now reads as a genuine high-magnification SEM plate: fine granular surface texture, believable micro-highlights, shallow depth of field, faint grain across the whole frame including the background, small debris flecks on the substrate and a soft contact shadow. The silhouette is properly PLEOMORPHIC — lumpy and asymmetric with soft creases, not a sphere — and the surface is evenly covered with many short, blunt, rounded dusty-rose studs with no necks or stalks. Lilac-on-slate-teal false colour, single particle, fills the frame edge-to-edge, no text, no border. Note, and this is correct rather than a miss: being a surface view, this style shows the envelope and its spikes only — the tegument and capsid are internal and are deliberately not visible. The four-layer architecture is carried by the textbook, 3D and watercolour plates. Minor: the studs are spaced a little too regularly, giving a faintly polka-dot look.
  ![sem 2](theme/sem/varicella-zoster-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 3 attempt(s), 8484 tok, $0.126
- attempt 1 · `gemini-2.5-flash-image` · 6.8s — ❌ FAIL (gemini-2.5-flash-image) — two forbidden structures. The capsid was rendered as a hexagonally-tiled CYLINDER, a drum seen at an angle, rather than an icosahedron. The genome was drawn as a classic twisted-ladder double helix WITH visible base-pair rungs, floating free in the space between tegument and capsid instead of packed inside the capsid. The tegument itself was excellent — a thick, convincingly granular amber mass. Fix-prompt: the capsid is a ball-shaped polyhedron, never a cylinder or drum; the DNA is a tightly spooled thread inside the capsid, never a rung-ladder helix, and nothing but tegument sits between capsid and envelope.
  ![3d 1](theme/3d/varicella-zoster-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 7.6s — ⚠️ PARTIAL (gemini-2.5-flash-image) — capsid shape and genome placement both fixed: a ball-shaped lattice capsid with the coppery genome correctly inside it, wrapped in a thick granular amber tegument and a scalloped lilac envelope. But the spikes were still wrong for the second time — clearly stalked, with narrow necks carrying two-lobed dumbbell heads. Second bad result on this style, so the model was escalated per the ladder. Fix-prompt: each spike is a hemisphere half-sunk into the membrane whose base is its widest part, with no neck, stem, waist, pin, T-shape or dumbbell head and no gap between bump and membrane.
  ![3d 2](theme/3d/varicella-zoster-virus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 23.4s — ✅ PASS (gemini-3-pro-image) — CHOSEN. The spike geometry is finally right: smooth rounded hemispheres sitting flush in the membrane, no necks, no dumbbells. Natural, believable, desaturated biological tints (not near-monochrome, not neon) with soft global illumination and subsurface scattering on the lilac envelope, whose silhouette is properly lumpy and irregular. A generous quadrant cut-away shows the layers stacked in correct order: envelope, then a thick and convincingly GRANULAR amber tegument filling real volume, then the pale grey-blue faceted capsid with hexagonal capsomere tiling, then the coppery genome spooled tightly inside it. Clean dark studio background to all four edges, no text, no border, single specimen. Known compromise: as in the textbook plate the capsid is drawn small relative to the envelope, so the tegument is thicker than the real ~100 nm-nucleocapsid-in-a-180 nm-virion proportion; and the capsid sits centred rather than showing the characteristic tegument asymmetry that the real TEM reference displays so well.
  ![3d 3](theme/3d/varicella-zoster-virus.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/varicella-zoster-virus.3d.svg)
[interactive SVG](theme/3d/varicella-zoster-virus.3d.svg) · [HTML](theme/3d/varicella-zoster-virus.3d.html)

### Watercolor plate (`watercolor`) — 3 attempt(s), 8484 tok, $0.121
- attempt 1 · `gemini-2.5-flash-image` · 8.9s — ⚠️ PARTIAL (gemini-2.5-flash-image) — the aged paper correctly filled the frame corner-to-corner with no mat or sheet, the tegument was a good thick granular ring and the studs were acceptably short and blunt. But the genome was painted as a twisted-ladder double helix with drawn base-pair rungs, and the layers read as an offset donut — a fat tegument ring with the envelope peeking out only on one side — rather than as concentric nested shells. Fix-prompt: keep the layers concentric and nested; paint the genome as a spooled thread, never a rung ladder.
  ![watercolor 1](theme/watercolor/varicella-zoster-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 7.7s — ⚠️ PARTIAL (gemini-2.5-flash-image) — layering fixed and now properly concentric, genome acceptable as a wound spool, studs blunt. But a soft DROP SHADOW was painted under the particle, so it read as a three-dimensional model resting on the page rather than as a painted plate, and the envelope outline had become an almost perfect circle instead of pleomorphic. Second bad result, so the model was escalated. Fix-prompt: no cast, drop or contact shadow of any kind and no object-resting-on-paper look — only a soft diffuse wash halo; and make the envelope outline visibly lumpy and asymmetric.
  ![watercolor 2](theme/watercolor/varicella-zoster-virus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-3-pro-image` · 21.1s — ✅ PASS (gemini-3-pro-image) — CHOSEN. Warm aged cream paper with gentle foxing fills the entire frame corner-to-corner and the subject sits on a soft diffuse wash halo painted directly onto it: no sheet, mat, border, frame, ruled line or drop shadow anywhere, and the cast-shadow problem is gone. The envelope is clearly lumpy and pleomorphic, ringed with short blunt studs; the tegument is a thick stippled granular amber layer; the capsid is a faceted grey-blue polyhedron with hexagonal capsomere tiling; and the coppery genome is a loosely coiled thread correctly inside it. No text, no plate number, no signature. Labels on this plate use black ink on a paper-coloured halo per the house rule. Minor: the quarter cut-away is drawn with flat, slightly boxy interior walls, which makes the opened interior read a little more diagrammatic than painterly.
  ![watercolor 3](theme/watercolor/varicella-zoster-virus.attempts/gen-03__gemini-3-pro-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/varicella-zoster-virus.watercolor.svg)
[interactive SVG](theme/watercolor/varicella-zoster-virus.watercolor.svg) · [HTML](theme/watercolor/varicella-zoster-virus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public domain - CDC Public Health Image Library: 'None - This image is in the public domain and thus free of any copyright restrictions.' · CDC/B.G. Partin; photo credit Dr. Erskine Palmer. CDC PHIL image #1878 (1982). — ✅ PASS — CDC Public Health Image Library image #1878 (CDC/B.G. Partin; photo credit Dr. Erskine Palmer, 1982), a negative-stain transmission electron micrograph of varicella-zoster virus, original greyscale with no colorization; public domain, no copyright restrictions. The archival file served at .../1878.tif is in fact a PNG, native 1580 x 1911 px (HTTP 200, 3,204,474 bytes), so the 1080 square shown here is a 0.77x DOWNSCALE, not an upscale. Resolution honesty note: an earlier interrupted pass of this pipeline had fetched the 700 x 846 px '_lores.jpg' variant instead, which would have been a 1.54x upscale presented as native; it was replaced with the full-resolution file. Visual check: a SINGLE, well-isolated virion — the ideal case, not a clump — showing an irregular, scalloped outer envelope with a pronounced fold at the upper left (textbook pleomorphism), a broad dark strongly GRANULAR tegument zone, and a lighter rounded capsid sitting distinctly OFF-CENTRE within it, which is the characteristic tegument asymmetry. This is the four-layer architecture corroborated by a real micrograph. No baked-in text, no scale bar, no border. Processing: the displayed 'real-02__TEM-crop' is a purely DETERMINISTIC crop with no generative editing at all — a 1400 x 1400 px region at (25, 335) of the native file, Lanczos-resampled to 1080 x 1080. edit_image.py was deliberately NOT run: there was no text, scale bar or border to clean, and an AI pass risked re-illustrating the negative-stain grain (the failure that had to be reverted for rotavirus in this same set). Greyscale left untouched. The full frame is kept as 'real-01__TEM' for provenance.
  ![reference](../reference-microscopy/theme/tem/varicella-zoster-virus.attempts/real-02__TEM-crop.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | ✅ teaching-ready (label base) | 3 | gemini-3-pro-image; clearest icosahedral capsid, genome correctly inside it, thick granular tegument, best structure separation for leader lines |
| sem | ✅ teaching-ready | 2 | gemini-2.5-flash-image; genuine micrograph character, pleomorphic silhouette, blunt studs, surface only (tegument/capsid internal and correctly not shown) |
| 3d | ✅ teaching-ready | 3 | gemini-3-pro-image; natural tints, flush hemisphere studs, correct outside-in layer order with a convincingly granular tegument |
| watercolor | ✅ teaching-ready | 3 | gemini-3-pro-image; full-bleed aged paper, no cast shadow, pleomorphic envelope, genome spooled inside the capsid |
| reference TEM | ✅ verified (deterministic crop, no AI editing) | 2 | CDC PHIL #1878, public domain; native 1580 x 1911 px downscaled, replacing an earlier lores upscale |
| coloring page | ✅ accepted first attempt | 1 | gemini-3-pro-image; no starburst, no frame, full bleed, cosy latency-nap scene with lotion and vaccine shield |
