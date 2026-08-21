# Rabies virus (`rabies-virus`)

## 1. Scientific reference

**Taxonomy:** Rabies lyssavirus, family Rhabdoviridae, genus *Lyssavirus*.

**Gross morphology:** Bullet-shaped — the single most important, checkable fact for
every render. Roughly 180 nm long by 75 nm across (~2.4:1 length:width). One end is
hemispherically **rounded** (conical); the other end is **flat**, or slightly
concave (planar). A spherical, icosahedral, or symmetric-capsule (rounded-at-both-ends)
virion is a hard fail — the bullet asymmetry *is* the identity of a rhabdovirus plate.

**Layers, outside to inside:**

| Layer | Latin | English | Deutsch |
|---|---|---|---|
| Envelope | involucrum lipidicum | Lipid envelope | Lipidhülle |
| Spikes | glycoproteina G (peplomera trimerica) | G (glycoprotein) spikes — absent from the flat base | G-Glykoprotein-Spikes — fehlen an der flachen Basis |
| Matrix layer | protein matricis (M), involucro subiacens | M (matrix) protein layer lining the envelope | M-(Matrix-)Proteinschicht unter der Hülle |
| Core | ribonucleoproteinum helicale (nucleocapsis) | Helical ribonucleoprotein — coiled, striated nucleocapsid of negative-sense RNA wound with N protein | Helikales Ribonukleoprotein — aufgewickeltes, gestreiftes Nukleokapsid aus Negativstrang-RNA mit N-Protein |

- **Envelope**: host-derived lipid bilayer, follows the bullet outline exactly.
- **G spikes**: short (5–10 nm), blunt, trimeric peplomers in a dense honeycomb
  pattern. Cover the rounded end and the full length of the curved sides. **Absent
  from the flat/planar base** — confirmed by ICTV's Rhabdoviridae report and
  standard virology texts (NCBI Bookshelf ch. 61). Never draw as long stalks or rays.
- **M protein**: thin lining directly under the envelope; links envelope to the
  ribonucleoprotein and condenses it into a tight, largely inextensible helical coil.
  Responsible for the coil's cross-striated ("herringbone") look and drives budding
  even without G.
- **Ribonucleoprotein (RNP) / nucleocapsid**: the ~12 kb negative-sense
  single-stranded RNA genome, continuously encapsidated by N protein along with the
  L (RNA-dependent RNA polymerase) and P (phosphoprotein) proteins. Helically coiled,
  filling the interior, forming a conical tip at the rounded end. Must show visible
  cross-striation/herringbone texture in cutaway styles — a smooth, featureless core
  reads as a generic cartoon bullet, not a real rhabdovirus.

**Do NOT draw:** spherical/icosahedral virion; rounded at both ends; spikes on the
flat base; long/rayed spikes; a smooth featureless interior; dsDNA genome or bare
free RNA outside the coil; bacterial wall/flagellum/nucleoid; icosahedral capsid or
tegument (that's the herpesvirus/varicella-zoster-virus plan, already used
elsewhere in this atlas); any dog/bat/fox/human in the four science styles; a
distressed or foaming animal anywhere, including the coloring page; baked-in text;
borders/frames/vignettes.

**Sources:**
- ICTV 9th Report, *Rhabdoviridae* chapter — bullet shape, dimensions, G-protein
  peplomer coverage pattern (bare planar end). https://ictv.global/report_9th/RNAneg/Mononegavirales/Rhabdoviridae
- NCBI Bookshelf, *Medical Microbiology* 4th ed., ch. 61 "Rhabdoviruses: Rabies
  Virus" — 75×180 nm, one end conical/other planar (concave). https://www.ncbi.nlm.nih.gov/books/NBK8618/
- "Cryo-EM structure of the rabies virus ribonucleoprotein complex", *Scientific
  Reports* 9:11667 (2019) — M protein role, RNP helical/cross-striated structure.
  https://www.nature.com/articles/s41598-019-46126-7
- PMC254266, "Dissociation of Rabies Virus Matrix Protein Functions..." — M protein
  condensing RNP into a helical skeleton.

## 2. Real-microscopy reference

**CDC PHIL ID 1876** — CDC/Dr. Fred Murphy, 1975. Thin-section transmission electron
microscopy (TEM), greyscale, of infected tissue. Public domain ("None — This image
is in the public domain and thus free of any copyright restrictions.").

Caption: "This transmission electron microscopic (TEM) image, reveals some of the
ultrastructural features exhibited by numerous bullet-shaped, rabies virus
particles, as well as cellular inclusions known as Negri bodies."

- lores JPEG: https://phil.cdc.gov/PHIL_Images/1876/1876_lores.jpg — 700×912 px,
  232,625 bytes, verified HTTP 200 (via the phil.cdc.gov → wwwn.cdc.gov redirect).
- hi-res TIFF: https://phil.cdc.gov/PHIL_Images/1876/1876.tif — 1835×2392 px,
  5,623,116 bytes, verified HTTP 200.
- Page: https://phil.cdc.gov/Details.aspx?pid=1876

**Verification**: direct pixel-level inspection of a magnified crop of the hi-res
TIFF (roughly the left-third-to-center, upper-to-middle band of the frame) shows a
dense granular cytoplasmic matrix (a Negri body) containing numerous elongated
particles with visibly rounded and flatter ends — consistent with bullet-shaped
rabies virions in thin section. At full-frame thumbnail scale the plate reads as a
diffuse granular field; the bullet shapes are only clearly legible zoomed in. This is
a **field of many virions** within a Negri body, not a single isolated specimen —
the atlas's stated preference — but the caption and the magnified crop both confirm
the microbe's diagnostic bullet shape is clearly readable, satisfying the fallback
"group acceptable if features are clearly readable" rule. Not previously used
elsewhere in this atlas (existing PHIL IDs in use across the atlas: 1878, 10708,
20538, 2172, 8698 — no overlap).

**Fetched**: `fetch_reference.py --microbe rabies-virus --theme tem` against the
`1876_lores.jpg` URL, producing a naive centered-square crop (0,106)-(700,806) of the
700×912 source, upscaled to 1080×1080. Inspecting a manual zoomed crop of the hi-res
TIFF confirmed the individual bullet/rod-shaped virions embedded in the Negri body are
clearly visible when zoomed, but small at the full-frame 1080×1080 scale — a known,
accepted compromise (the whole-Negri-body view is the more truthful representation of
what this classic plate actually shows, matching the PHIL caption verbatim, rather
than a tighter crop that would misrepresent the plate as showing large single
virions). `edit_image.py` was intentionally skipped — no baked-in text or scale bar to
remove, and cleaning risked re-illustrating the granular texture.
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the rabies virus — shaped like a tiny bullet, rounded at one end and flat at the other, with short knobby studs poking out almost everywhere except that flat end. It cannot travel through the air like a cold; it only gets into a body through a bite or a scratch from an animal that is carrying it, usually a dog, fox, raccoon or bat. Once inside, it does something clever and sneaky: instead of swimming around in the blood where your body's defences would spot it easily, it creeps quietly along the body's own nerve wires, like a tiny hiker following a cable, all the way up to the brain — which is exactly why doctors need to act fast. The good news is that rabies is one of the easiest dangerous germs to stop completely, as long as people act in time. Dogs and cats get a vaccination at the vet so they never carry it in the first place. And if a wild or strange-acting animal ever bites or scratches you, the most important thing is simple: tell a grown-up straight away, right then, not later. Doctors have a treatment — a short course of injections — that works extremely well if it is started soon after a bite, because the virus travels slowly enough along the nerves to give it time to work. One more good rule: it is best to admire wild animals from a distance and never touch one that is acting strangely, tame, or wobbly, even if it looks friendly.  
🇩🇪 Das ist das Tollwutvirus — geformt wie eine winzige Gewehrkugel, an einem Ende rund und am anderen flach, mit kurzen knubbeligen Noppen, die fast überall herausragen, nur nicht an diesem flachen Ende. Es kann nicht wie eine Erkältung durch die Luft fliegen; es gelangt nur durch einen Biss oder Kratzer eines Tieres in den Körper, das das Virus in sich trägt — meist ein Hund, Fuchs, Waschbär oder eine Fledermaus. Einmal drin, macht es etwas Schlaues und Heimliches: Anstatt im Blut herumzuschwimmen, wo die Abwehrkräfte des Körpers es leicht entdecken würden, schleicht es sich still über die körpereigenen Nervenleitungen entlang, wie ein winziger Wanderer, der einem Kabel folgt, bis hinauf zum Gehirn — genau deshalb müssen Ärztinnen und Ärzte schnell handeln. Die gute Nachricht: Tollwut lässt sich besonders gut vollständig verhindern, wenn Menschen rechtzeitig handeln. Hunde und Katzen bekommen beim Tierarzt eine Impfung, damit sie das Virus gar nicht erst in sich tragen. Und wenn dich jemals ein wildes oder seltsam wirkendes Tier beißt oder kratzt, ist das Wichtigste ganz einfach: Sag sofort einem Erwachsenen Bescheid, gleich und nicht erst später. Ärztinnen und Ärzte haben eine Behandlung — eine kurze Reihe von Spritzen —, die sehr gut wirkt, wenn sie bald nach dem Biss beginnt, weil das Virus langsam genug über die Nerven wandert, damit die Behandlung noch rechtzeitig greifen kann. Noch eine gute Regel: Wilde Tiere bewundert man am besten aus der Ferne und fasst niemals eines an, das sich seltsam, zahm oder wackelig verhält, auch wenn es freundlich wirkt. In Deutschland gibt es übrigens seit 2008 keine klassische Tollwut bei Wildtieren mehr — auch das ist ein Erfolg solcher Impfungen.

**Adults (popular science, health).**  
🇬🇧 Rabies virus belongs to the rhabdoviruses, and its distinctive bullet shape — rounded at one end, flat at the other, with an envelope of short glycoprotein spikes — packages a helical, negative-sense RNA genome. Two things about it are unusual among human pathogens. First, it barely engages the bloodstream: instead of circulating and triggering an antibody response the way most infections do, rabies virus travels within nerve cells themselves, hitching a ride on the cell's own internal transport machinery to move step by step from the site of a bite, up peripheral nerves, into the spinal cord and eventually the brain. That neuron-to-neuron route is largely invisible to circulating immune defences, which is the main reason the disease is so serious once symptoms begin — by then the virus is already established in the central nervous system. Second, and much more reassuringly, that same slow neural journey is what makes rabies one of the most preventable serious infections known: because it typically takes days to weeks (sometimes longer) to reach the brain, a course of vaccination and, if needed, rabies immunoglobulin given after a bite — before symptoms start — is extremely effective at stopping it. Pre-exposure vaccination of dogs and cats, required in most places, has eliminated the disease from the pet population across large parts of the world; in Germany specifically, classic terrestrial rabies (carried by foxes and other land mammals) has been eradicated since 2008, thanks to a sustained programme of oral vaccination of wild foxes. Any mammal can be infected, and any bite or scratch from an unfamiliar or wild animal — bats included, even without an obvious bite mark — is worth medical assessment without delay.  
🇩🇪 Das Tollwutvirus gehört zu den Rhabdoviren, und seine unverwechselbare Gewehrkugel-Form – an einem Ende rund, am anderen flach, mit einer Hülle aus kurzen Glykoprotein-Spikes – verpackt ein helikales, einzelsträngiges RNA-Genom in Negativstrang-Orientierung. Zwei Dinge sind bei diesem Erreger im Vergleich zu den meisten menschlichen Krankheitserregern ungewöhnlich. Erstens hält es sich kaum im Blut auf: Statt zu zirkulieren und wie die meisten Infektionen eine Antikörperantwort auszulösen, wandert das Tollwutvirus innerhalb der Nervenzellen selbst und nutzt deren eigene Transportmaschinerie, um sich Schritt für Schritt von der Bissstelle über periphere Nerven ins Rückenmark und schließlich ins Gehirn zu bewegen. Dieser Weg von Nervenzelle zu Nervenzelle bleibt für die im Blut zirkulierende Immunabwehr weitgehend unsichtbar – der Hauptgrund, warum die Erkrankung so ernst ist, sobald Symptome auftreten: Zu diesem Zeitpunkt hat sich das Virus bereits im zentralen Nervensystem festgesetzt. Zweitens, und das ist die deutlich beruhigendere Seite: Genau diese langsame Reise entlang der Nerven macht Tollwut zu einer der am besten vorbeugbaren schweren Infektionen überhaupt. Weil der Weg zum Gehirn typischerweise Tage bis Wochen dauert (manchmal auch länger), wirkt eine nach einem Biss – aber noch vor Symptombeginn – begonnene Impfserie, bei Bedarf ergänzt um Tollwut-Immunglobulin, außerordentlich zuverlässig. Die vorbeugende Impfung von Hunden und Katzen, in den meisten Ländern vorgeschrieben, hat die Krankheit in weiten Teilen der Welt aus der Haustierpopulation getilgt; in Deutschland ist die klassische, von Füchsen und anderen Landsäugetieren übertragene Tollwut dank eines langjährigen Programms zur oralen Immunisierung wildlebender Füchse seit 2008 ausgerottet. Grundsätzlich kann jedes Säugetier infiziert werden, und jeder Biss oder Kratzer eines unbekannten oder wilden Tieres – auch von Fledermäusen, selbst ohne sichtbare Bissspur – sollte unverzüglich ärztlich abgeklärt werden.

**Scientific.**  
🇬🇧 Rabies virus (Rabies lyssavirus, family Rhabdoviridae) is a bullet-shaped, enveloped, negative-sense single-stranded RNA virus, ~180 x 75 nm, with a hemispherical rounded end and a planar (flat) end; trimeric G-glycoprotein peplomers cover the envelope except over the planar base. Its genome is ~12 kb, encoding five proteins in the order N-P-M-G-L, encapsidated end-to-end by nucleoprotein (N) together with the phosphoprotein (P) and the large RNA-dependent RNA polymerase (L) to form a helical ribonucleoprotein (RNP); the matrix protein (M) lines the inner envelope and condenses the RNP into a tightly coiled, transcriptionally silent skeleton for packaging and budding. Following inoculation into muscle by a bite, the virus replicates locally to a variable degree, then binds receptors including the nicotinic acetylcholine receptor at the neuromuscular junction and enters peripheral motor and sensory axons. It is transported retrogradely along microtubules via the dynein motor complex to the dorsal root ganglia and spinal cord, then ascends transsynaptically to the brain — a process that keeps the virus largely sequestered from extracellular antigen presentation and circulating antibody, and is the principal mechanistic reason it produces essentially no adaptive immune response until very late. Incubation is typically 3-12 weeks post-exposure but varies with inoculum size and bite-site-to-CNS distance. CNS infection produces either an encephalitic ('furious') presentation with hydrophobia and autonomic hyperactivity, or a less common paralytic ('dumb') form, and centrifugal spread to the salivary glands enables transmission via saliva - the behavioural changes seen in the furious form (aggression, biting) plausibly increase transmission opportunity. Once clinical signs appear, the disease is almost universally fatal; only a small number of survivals have been documented, none reliably attributable to a specific treatment protocol. Post-exposure prophylaxis - immediate wound washing, passive immunisation with rabies immunoglobulin infiltrated around the wound, and an active vaccine series - is highly effective when begun before symptom onset, exploiting the long axonal transit time. Pre-exposure vaccination of reservoir hosts (oral bait vaccination of foxes; parenteral vaccination of dogs) has eliminated classic terrestrial rabies from large areas, including Germany since 2008, though bat-associated lyssaviruses remain endemic in many regions.  
🇩🇪 Das Tollwutvirus (Rabies lyssavirus, Familie Rhabdoviridae) ist ein kugelig-langgestrecktes, behülltes Einzelstrang-RNA-Virus mit Negativstrang-Genom, etwa 180 x 75 nm groß, mit einem halbkugelig gerundeten und einem planaren (flachen) Ende; trimere G-Glykoprotein-Peplomere bedecken die Hülle mit Ausnahme der planaren Basis. Das rund 12 kb große Genom kodiert fünf Proteine in der Reihenfolge N-P-M-G-L; sie werden durchgehend vom Nukleoprotein (N) zusammen mit dem Phosphoprotein (P) und der großen RNA-abhängigen RNA-Polymerase (L) zu einem helikalen Ribonukleoprotein (RNP) verpackt. Das Matrixprotein (M) kleidet die Innenseite der Hülle aus und kondensiert das RNP zu einem eng gewundenen, transkriptionell stillen Gerüst für Verpackung und Knospung. Nach der Inokulation ins Muskelgewebe durch einen Biss repliziert sich das Virus zunächst lokal in unterschiedlichem Ausmaß, bindet dann unter anderem an den nikotinischen Acetylcholinrezeptor der motorischen Endplatte und dringt in periphere motorische und sensorische Axone ein. Entlang der Mikrotubuli wird es retrograd über den Dynein-Motorkomplex zu den Spinalganglien und ins Rückenmark transportiert und steigt anschließend transsynaptisch bis ins Gehirn auf – ein Vorgang, der das Virus weitgehend von der extrazellulären Antigenpräsentation und zirkulierenden Antikörpern abschirmt und der Hauptgrund dafür ist, dass bis sehr spät praktisch keine adaptive Immunantwort entsteht. Die Inkubationszeit beträgt typischerweise drei bis zwölf Wochen nach Exposition, abhängig von der Inokulumsmenge und der Entfernung der Bissstelle zum zentralen Nervensystem. Die ZNS-Infektion äußert sich entweder als enzephalitische ('rasende') Form mit Hydrophobie und autonomer Übererregbarkeit oder als seltenere paralytische ('stille') Form; die zentrifugale Ausbreitung in die Speicheldrüsen ermöglicht die Übertragung über den Speichel – die bei der rasenden Form auftretenden Verhaltensänderungen (Aggressivität, Beißen) erhöhen plausibel die Übertragungsgelegenheit. Sobald klinische Symptome auftreten, verläuft die Erkrankung nahezu ausnahmslos tödlich; nur wenige dokumentierte Überlebende sind bekannt, keiner davon zuverlässig einem bestimmten Behandlungsprotokoll zuzuschreiben. Die Postexpositionsprophylaxe – sofortige Wundreinigung, passive Immunisierung mit um die Wunde infiltriertem Tollwut-Immunglobulin und eine aktive Impfserie – wirkt sehr zuverlässig, wenn sie vor Symptombeginn eingeleitet wird, da sie die lange axonale Transportzeit ausnutzt. Die präventive Impfung von Reservoirwirten (orale Ködervakzine bei Füchsen, parenterale Impfung von Hunden) hat die klassische, terrestrisch übertragene Tollwut in weiten Teilen der Welt getilgt, so auch in Deutschland seit 2008, während fledermausassoziierte Lyssaviren in vielen Regionen weiterhin endemisch sind.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean semi-flat medical-illustration cutaway of a SINGLE rabies virus virion, in the EXACT house style of rod-bacterium__textbook and parasite__textbook: a MUTED, sophisticated, slightly desaturated educational palette of soft dusty tints (never bright primary or cartoon colours), THIN clean outlines (not heavy black cartoon strokes), gentle soft shading with subtle dimensionality, a distinct soft colour fill for each structure, refined and elegant — not a bold-outlined flat cartoon. CRITICAL SILHOUETTE: the virion is BULLET-SHAPED, not a sphere, not a capsule rounded at both ends, not a cylinder with two rounded poles — it is a stubby elongated body about 2.4 times longer than wide, with ONE end a smooth hemispherical dome and the OTHER end distinctly FLAT (a slight concave dish is fine, but it must read as flat, never rounded); lying roughly horizontal so the rounded and flat ends are both clearly visible. A neat longitudinal quarter cut-away — as if a lengthwise wedge were removed along the top third of the body — reveals THREE concentric layers in cross-section from outside to centre: (1) an outer soft translucent grey-lilac lipid ENVELOPE, its outline following the bullet shape exactly; short blunt rose/pink glycoprotein studs cover the envelope over the rounded end and the full curved sides in a honeycomb pattern, but the flat end is bare smooth envelope with NO studs — this contrast (studded sides and rounded end vs. bare flat base) is the single most important teaching point and must not be omitted; (2) directly beneath the envelope, a thin warm amber/tan MATRIX (M) PROTEIN lining, hugging the inside of the bullet shape; (3) filling the interior, a coppery-gold coiled HELICAL RIBONUCLEOPROTEIN core that must show visible cross-striations — draw it as a tightly wound spring or ladder-like coil with distinct rungs/turns, NOT a smooth solid fill — forming a slightly conical taper toward the rounded end. Not a cell, no face, no eyes, no mouth, no animal, no host anywhere in the image. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Neutral dark charcoal uncluttered background. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph of a SINGLE rabies virus virion, centered in a square 1:1 1080x1080 frame with generous empty margin, filling the frame edge-to-edge with NO black border, frame, vignette or letterbox bars. CRITICAL SILHOUETTE: the virion is BULLET-SHAPED, not a sphere or capsule — a stubby cylinder about 2.4 times longer than it is wide, with ONE end a smooth hemispherical dome (rounded) and the OTHER end distinctly FLAT, almost like it was sliced off square (a slight concave dish is fine, but it must read as flat, never rounded). Lying at a gentle three-quarter angle so both the rounded end and the flat end are visible in the same frame. Surface texture: the rounded end and the entire length of the curved sides are densely and evenly covered in short, blunt, stubby glycoprotein studs in a fine honeycomb pattern (false-color rose/pink against a cool blue-grey lilac envelope) — SHORT BUMPS only, never long spikes, never rays, never a starburst. The flat end is CRITICAL: it must be visibly BARE smooth envelope with NO studs at all, a clean contrast to the studded sides — this bare flat base is the single most important, checkable detail of the image. Crisp 3D surface texture, shallow depth of field, single specimen resting on a subtly textured substrate. SEM shows surface only — render NO internal structures, that is correct for this modality. Neutral dark charcoal uncluttered background. Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image. NOT drawn as a paper sheet or card on a surface.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE rabies virus virion, soft global illumination, subsurface scattering on the translucent envelope, gentle rim light, clean seamless dark studio background. CRITICAL SILHOUETTE: the virion is BULLET-SHAPED — a stubby elongated body about 2.4 times longer than wide, with ONE end a smooth hemispherical dome and the OTHER end distinctly FLAT (a slight concave dish is acceptable, but it must read as flat, never rounded, never symmetric) — never a sphere, never a capsule rounded at both ends. A cut-away along roughly a quarter of its length reveals THREE layers modeled with believable material but slightly idealized for clarity, from outside to centre: (1) the outer translucent grey-lilac lipid envelope, densely studded with short blunt rose/pink glycoprotein bumps (honeycomb pattern, short and stubby, never long spikes or rays) over the rounded end and the curved sides ONLY — the flat end must clearly show bare, unstudded envelope, a deliberate visual contrast that is CRITICAL and not optional; (2) a thin warm amber/tan matrix (M) protein layer lining the inside of the envelope; (3) a coppery-gold helical ribonucleoprotein core filling the interior, rendered with visible coiled cross-striation (like a tightly wound, ladder-like spring), tapering slightly toward the rounded end — NOT a smooth or featureless fill. Colorize with natural, believable biological tones — warm amber matrix layer, cool blue-grey/lilac envelope, coppery-gold coiled core — not neon, not monochrome. No face, no eyes, not a cell, no animal, no host anywhere in the image. Square 1:1, 1080x1080, single specimen centered with generous margin, filling the whole frame edge-to-edge with NO black border, frame, vignette or letterbox bars, and NOT drawn as a paper sheet or card on a surface. Absolutely NO text, letters, numbers, labels, scale bars, arrows or watermarks baked into the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted 19th-century naturalist plate of a SINGLE rabies virus virion, soft translucent watercolour washes and fine ink outlines. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner — the paper IS the background, with a soft darker wash halo directly on the paper behind the subject; do NOT render the artwork as a separate sheet, card, mat, border, frame or drop-shadow on a table or surface. CRITICAL SILHOUETTE: paint the virion as a BULLET shape, never a sphere, never a capsule rounded at both ends — a stubby elongated body about 2.4 times longer than wide, with ONE end a smooth rounded dome and the OTHER end painted distinctly FLAT (a slight concave dish is acceptable, but it must clearly read as flat). A painterly cut-away along roughly a quarter of its length shows THREE layers from outside to centre: (1) a pale lilac-grey lipid envelope with a gently hand-drawn wobble to its outline, studded with short, blunt, stubby ink-and-wash bumps over the rounded end and curved sides ONLY — short closed bumps, never long spike lines or rays radiating outward — while the flat end is left deliberately bare and smooth, with no studs painted there at all, a clear and important visual contrast; (2) a thin warm amber/tan painted band directly under the envelope for the matrix protein layer, with visible brushed texture, not a thin outline; (3) at the centre, a coppery-orange coiled shape for the helical ribonucleoprotein, painted with fine ink hatching or a tightly wound spiral linework to suggest cross-striation — a plain smooth swirl with no internal texture is wrong. One specimen, large and centred, anatomically correct, no face, not a cell, no animal, no host anywhere in the image. Square 1:1, 1080x1080. This is a pure painting with brushstrokes and ink linework only — ABSOLUTELY NO text, letters, numbers, words, captions, labels, scale bars, arrows or watermarks of any kind rendered anywhere in the image; do not letter or caption any structure, do not write any words near the coiled core.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 4 attempt(s), 7821 tok, $0.155
- attempt 1 · `gemini-2.5-flash-image` · 6.3s — ❌ FAIL — silhouette reads as a stadium/pill/capsule shape: both ends rounded domes (confirmed via 2x-zoomed crop of the right end — a clean hemispherical bulge, no flat cut at all). Hard fail per spec (both-ends-rounded is explicitly listed as unacceptable).
  ![textbook 1](theme/textbook/rabies-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 7.1s — ❌ FAIL — added an explicit 'rifle-cartridge-base, not a pill-capsule' correction; shape still came back with a rounded right end (same capsule silhouette), though slightly more elongated overall.
  ![textbook 2](theme/textbook/rabies-virus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 7.7s — ⚠️ PARTIAL — added a much more forceful correction ('AA battery flat end / cut cucumber' analogy, explicit 'if you can see any bulge, redraw it flat'). Shape corrected: left end a rounded studded dome, right end now a genuine flat disc with a crisp circular rim (verified by zoomed crop). However the flat disc rendered in the AMBER/TAN interior-matrix colour rather than the grey-lilac envelope colour used on the visible dome — a labelling-relevant colour inconsistency (the flat base is intact outer envelope, not an interior cross-section).
  ![textbook 3](theme/textbook/rabies-virus.attempts/gen-03__gemini-2.5-flash-image.avif)
- attempt 4 · `gemini-2.5-flash-image` · 6.6s — ✅ PASS (gemini-2.5-flash-image) — added a colour-only correction telling the model the flat base disc must match the dome's grey-lilac envelope colour, not the amber matrix colour. Verified by zoomed crop: flat disc is grey-lilac, bare of studs, crisp rim, matching the dome's envelope colour exactly. Silhouette confirmed: rounded studded dome one end, flat bare grey disc the other end, ~2.4:1-reading elongated body. No baked-in text, no border.
  ![textbook 4](theme/textbook/rabies-virus.attempts/gen-04__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/rabies-virus.textbook.svg)
[interactive SVG](theme/textbook/rabies-virus.textbook.svg) · [HTML](theme/textbook/rabies-virus.textbook.html)

### SEM micrograph (`sem`) — 2 attempt(s), 3506 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 7.3s — ❌ FAIL — measured bullet aspect ratio only ~1.4:1 (PCA-based long/short axis measurement), too stubby vs. the ~2.4:1 target; more importantly, the hemispherically rounded end was rendered completely bare of glycoprotein studs (all studs sat on the cylindrical mid-body only) while the flat end was correctly bare — spikes were on the wrong region.
  ![sem 1](theme/sem/rabies-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.8s — ✅ PASS (gemini-2.5-flash-image) — corrected prompt explicitly required stud coverage running continuously from the flat base's rim, over the full curved side wall, up and over the apex of the rounded dome. Verified by 2x-zoomed crop of both ends: rounded end (top-right of frame) densely and evenly studded to the apex; flat end (bottom-left) a clean bare grey disc with a visible rim, zero studs. Silhouette check: one hemispherical dome + one flat/slightly-concave disc, clearly asymmetric — not a sphere, not a capsule. No baked-in text, no border.
  ![sem 2](theme/sem/rabies-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 2 attempt(s), 3558 tok, $0.077
- attempt 1 · `gemini-2.5-flash-image` · 7.0s — ❌ FAIL — same capsule/pill silhouette as textbook attempt 1: both ends read as rounded domes when the right end was cropped and zoomed (a smooth rounded bulge, no flat cut).
  ![3d 1](theme/3d/rabies-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.6s — ✅ PASS (gemini-2.5-flash-image) — with the rifle-cartridge-base correction applied. Verified by 2x-zoomed crop of the right end: a genuine flat elliptical disc, light blue-grey (matching envelope colour), crisp rim, completely bare of studs. Left end (also crop-verified): rounded dome, densely studded to the apex, natural biological colour tones (blue-grey envelope, coppery-gold coiled core, amber matrix band) — not monochrome, not neon. No border, no baked-in text.
  ![3d 2](theme/3d/rabies-virus.attempts/gen-02__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/rabies-virus.3d.svg)
[interactive SVG](theme/3d/rabies-virus.3d.svg) · [HTML](theme/3d/rabies-virus.3d.html)

### Watercolor plate (`watercolor`) — 3 attempt(s), 5611 tok, $0.116
- attempt 1 · `gemini-2.5-flash-image` · 8.7s — ❌ FAIL (two issues) — capsule/pill silhouette, right end a rounded dome not a flat cut (zoomed-crop confirmed); separately, the ink-hatched studs on the dome were drawn as small hooked/comma-shaped marks that read as scattered handwritten glyphs (visually similar to lowercase b/g/q/6/9 at different rotations) rather than plain circular bumps — a baked-in-text-adjacent failure caught by a magnified crop, per the pipeline's documented lesson about molecular-subject lettering.
  ![watercolor 1](theme/watercolor/rabies-virus.attempts/gen-01__gemini-2.5-flash-image.avif)
- attempt 2 · `gemini-2.5-flash-image` · 6.6s — ⚠️ PARTIAL — flat-end correction applied; right end now a clean flat oval disc (pass). Stud shape improved (closed circles with a small highlight dash, no more open hooked/comma glyphs) but not re-verified as final pick because the shape fix alone made this the natural next base to refine.
  ![watercolor 2](theme/watercolor/rabies-virus.attempts/gen-02__gemini-2.5-flash-image.avif)
- attempt 3 · `gemini-2.5-flash-image` · 7.9s — ✅ PASS (gemini-2.5-flash-image) — combined flat-end + stud-shape correction ('plain closed circle or filled oval blob only, no comma-tail/hook/loop that could read as a letter'). Verified by 2x-zoomed crops of both ends: left, a rounded dome with plain closed-circle studs and generic short texture dashes (no letter-like glyphs); right, a clean bare cream/off-white flat disc with a crisp rim. Full-bleed aged paper, soft wash halo, no mat/frame/sheet-on-surface look. Colour note: the flat disc reads pale cream rather than a visibly lilac-grey tone (unlike textbook/3d) — a minor, accepted stylistic softness of the watercolour medium, not a shape or spike-placement error.
  ![watercolor 3](theme/watercolor/rabies-virus.attempts/gen-03__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/rabies-virus.watercolor.svg)
[interactive SVG](theme/watercolor/rabies-virus.watercolor.svg) · [HTML](theme/watercolor/rabies-virus.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `TEM` · Public domain - CDC Public Health Image Library states 'None - This image is in the public domain and thus free of any copyright restrictions.' · CDC/Dr. Fred Murphy, PHIL ID 1876 (1975) — Not re-verified this session (pre-existing, produced by the interrupted prior agent) — CDC PHIL 1876 (Dr. Fred Murphy, 1975), public domain TEM. Sidecar's 'verified' field is null; inspected visually as intact and correctly filed under reference-microscopy/theme/tem/rabies-virus.attempts/ with png/avif/heic + json sidecar. Flagged rather than silently accepted since this session did not run its own AI visual-check subagent on it. ORCHESTRATOR VERIFICATION (added after the render agent flagged this as not re-done): the plate was viewed directly, at full frame and again at ~1.6x on a dense particle field. At full 1080x1080 the virions read only as small dark rods and dots and the diagnostic bullet silhouette is NOT resolvable — so the plate corroborates 'many virions massed inside a Negri body', which is what its CDC caption claims, rather than 'bullet-shaped'. Zoomed, individual particles do show the rhabdovirus profile: elongated dark bodies with one rounded and one flatter end, alongside circular transverse sections where virions were cut across. Consistent with rabies-infected tissue and with PHIL 1876's own description. PASS, with the resolution limitation stated rather than implied.
  ![reference](../reference-microscopy/theme/tem/rabies-virus.attempts/real-01__TEM.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| sem | ✅ teaching-ready | 2 | attempt 1 rejected for bare rounded end + stubby ratio; attempt 2 fixed stud coverage on the dome, flat end correctly bare, verified by zoomed crop of both ends |
| textbook | ✅ teaching-ready | 4 | attempts 1-2 rejected for capsule/pill (both-ends-rounded) silhouette; attempt 3 fixed the shape but flat cap was wrong colour (amber matrix instead of grey envelope); attempt 4 fixed the colour, verified by zoomed crop |
| 3d | ✅ teaching-ready | 2 | attempt 1 rejected for capsule/pill silhouette; attempt 2 fixed it — flat disc + studded dome verified by zoomed crop, natural biological tones |
| watercolor | ✅ teaching-ready | 3 | attempt 1 rejected for capsule silhouette AND letter-like glyph studs; attempt 2 fixed the silhouette; attempt 3 fixed the stud shape too, verified by zoomed crop of both ends |
| reference photo | ⚠️ carried over, not re-verified | 1 | CDC PHIL 1876 public-domain TEM, produced by the prior interrupted agent; visually inspected as intact this session but not re-run through an AI verify subagent |
| coloring page | ✅ teaching-ready (cropped) | 3 | attempt 1 had a forbidden black border frame; attempt 2 dropped the border but left a soft 30-90px margin (touched only the left edge); attempt 3 was only marginally tighter. Per the pipeline's crop-don't-reroll rule, attempt 3's raw PNG was measured and cropped (content bbox rows 58-959 / cols 0-984, 5px buffer) and re-traced via coloring.py's own to_bitmap/trace_paths/build_svg — no extra API call. Pixel-verified post-crop: artwork bleeds off top/left/right edges, bottom within 6px. Dog + vaccination tag + cheering shield character + a bat waving hello from a safe distance; no needle, no blood, no distressed animal. |
