# Motor neuron (Motoneuron) — render log

**Set:** `nerve-cells` · **Microbe key:** `motor-neuron`
**Short description:** Large multipolar nerve cell of the brainstem/spinal-cord anterior horn, with a star-shaped soma full of Nissl bodies, many branching dendrites and a single long myelinated axon that can reach a meter in length, ending at the motor end plate on a skeletal-muscle fibre.

Metadata sidecar: [`motor-neuron.render.meta.json`](motor-neuron.render.meta.json) · aggregated into [`../../../RENDER-STATUS.md`](../../../RENDER-STATUS.md).

---

## 1. Scientific reference (the yardstick for verification)

A (somatic, α-) motor neuron is a large multipolar nerve cell whose cell body (soma/perikaryon) sits in the anterior (ventral) horn of the spinal-cord grey matter or in a cranial-nerve motor nucleus of the brainstem, and whose axon leaves the CNS to innervate skeletal (extrafusal) muscle fibres. The soma is one of the largest cell bodies in the human body (roughly 25–135 µm across) and is classically star/pyramid-shaped, with several thick, tapering, profusely branching **dendrites** radiating outward that receive thousands of synaptic inputs from upper motor neurons, interneurons and sensory afferents. The cytoplasm is packed with coarse, deeply basophilic clumps called **Nissl bodies** (Nissl substance) — stacks of rough endoplasmic reticulum studded with free ribosomes — reflecting the very high rate of protein synthesis needed to maintain such a long axon; Nissl substance fills the soma and extends into the proximal dendrites but is conspicuously **absent from the axon hillock and the axon itself**. The **axon hillock** is the cone-shaped, Nissl-free region of the soma where the axon originates and where synaptic potentials are summed and, if threshold is reached, an action potential is generated. A single axon then runs a variable but sometimes very long path — for the motor neurons that control the toes it can be roughly a metre — usually wrapped in a **myelin sheath** laid down by a chain of individual Schwann cells (peripheral nervous system), with small unmyelinated gaps called **nodes of Ranvier** between successive Schwann cells that allow fast saltatory conduction. A large oval, euchromatic **nucleus** sits centrally in the soma with a single prominent, dark **nucleolus** — a classic diagnostic feature of a healthy motor neuron on Nissl-stained sections. Other standard organelles are present: a **Golgi apparatus** near the nucleus, and abundant **mitochondria** distributed through the soma, dendrites, axon and especially concentrated at the nodes of Ranvier and the axon terminal, where ATP demand for ion pumping and neurotransmitter cycling is highest. Neurofilaments and microtubules form the axonal cytoskeleton and the tracks for fast anterograde/retrograde axonal transport of vesicles and organelles over that entire length. At its far end the axon arborises into fine terminal branches ending in **axon terminals (synaptic boutons)** packed with acetylcholine-filled synaptic vesicles; each bouton sits over a specialised, highly folded patch of the muscle-fibre membrane called the **motor end plate** (the neuromuscular junction), where acetylcholine release triggers muscle-fibre depolarisation and contraction. Motor neurons are, notably, the specific cell population that degenerates in amyotrophic lateral sclerosis (ALS) and spinal muscular atrophy.

Sources: [Wikipedia — Motor neuron](https://en.wikipedia.org/wiki/Motor_neuron), [StatPearls / NCBI Bookshelf — Neuroanatomy, Motor Neuron](https://www.ncbi.nlm.nih.gov/books/NBK554616/), [StatPearls / NCBI Bookshelf — Histology, Axon](https://www.ncbi.nlm.nih.gov/books/NBK554388/), [Histology at SIU — Motor neuron / axon hillock](https://histology.siu.edu/ssb/motoneur.htm), [Wikipedia — Axon hillock](https://en.wikipedia.org/wiki/Axon_hillock), [Wikipedia — Nissl body](https://en.wikipedia.org/wiki/Nissl_body), [OpenStax Anatomy & Physiology 2e §13.2 — The Central Nervous System (anterior horn motor neurons, LM ×40 anterior-horn figure)](https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system).

### Parts to label (Latin · English · German)

| key | Latin / scientific | English | German | function | where | variable? |
|---|---|---|---|---|---|---|
| `soma` | perikaryon (soma neuroni) | Cell body (soma) | Zellkörper (Soma) | metabolic/synthetic centre; large, star-shaped, packed with Nissl bodies | central, the widest part of the cell | core |
| `nucleus` | nucleus | Nucleus | Zellkern | holds the genome; large, round, euchromatic | central within the soma | core |
| `nucleolus` | nucleolus | Nucleolus | Nukleolus | ribosome assembly; single prominent nucleolus | inside the nucleus | core |
| `nissl_bodies` | corpora Nissli (substantia chromidialis) | Nissl bodies (rough ER) | Nissl-Schollen (raues ER) | coarse basophilic clumps of rough ER + free ribosomes; heavy protein synthesis for the long axon | throughout soma and proximal dendrites, NOT in the axon or hillock | core |
| `dendrites` | dendrita | Dendrites | Dendriten | receive synaptic input from thousands of other neurons | multiple, branching outward from the soma | core |
| `axon_hillock` | colliculus axonicus | Axon hillock | Axonhügel | Nissl-free trigger zone where action potentials are generated | where the axon leaves the soma | core |
| `axon` | axon (neuritum) | Axon | Axon | carries the action potential away from the soma toward the muscle, up to ~1 m long | single, long, uniform-diameter fibre | core |
| `myelin_sheath` | vagina myelini | Myelin sheath | Myelinscheide | insulates the axon, formed by successive Schwann cells, enables saltatory conduction | wraps the axon in segments | core |
| `node_of_ranvier` | nodus Ranvieri | Node of Ranvier | Ranvier-Schnürring | short unmyelinated gap between Schwann cells; site of fast ion exchange | periodic gaps along the axon | core |
| `axon_terminal` | terminatio axonis (bouton synapticus) | Axon terminal (synaptic bouton) | Axonendknöpfchen (synaptischer Endkolben) | releases acetylcholine onto the muscle fibre | at the very end of the axon branches | core |
| `motor_end_plate` | placenta motorica (iunctio neuromuscularis) | Motor end plate (neuromuscular junction) | Motorische Endplatte (neuromuskuläre Synapse) | the folded postsynaptic membrane on the muscle fibre that receives the signal | on the target skeletal-muscle fibre | core |
| `mitochondrion` | mitochondrion | Mitochondrion | Mitochondrium | ATP production; concentrated at nodes of Ranvier and the terminal | dispersed through soma, axon and terminal | core |

### Do NOT draw (scientifically misleading)
- **No cell wall, nucleoid, plasmids or bacterial flagella** — this is a human nerve cell, not a bacterium.
- **No chloroplasts or large central vacuole** — not a plant cell.
- **Not round like a red blood cell or a lymphocyte** — the defining shape is a large, star-shaped, multipolar soma with several branching dendrites plus exactly **one** long axon, never a sphere or disc.
- **Only ONE axon per neuron** — many dendrites is correct, but never draw more than a single axon leaving the soma.
- **Nissl bodies must stay out of the axon hillock and the axon** — the hillock and axon shaft must read visibly clearer/paler than the Nissl-packed soma; do not paint Nissl clumps continuously all the way down the axon.
- **The myelin sheath must be segmented, not a single unbroken tube** — show periodic nodes of Ranvier (gaps) between myelin segments; a smooth continuous sheath with no nodes is misleading.
- **The axon is a smooth, non-motile cable**, not a beating flagellum or a ciliary axoneme — do not give it a whip-like undulating motion or a 9+2 microtubule cross-section.
- **Not a pseudounipolar sensory-neuron shape** (a single stem splitting in a T) — this is a multipolar motor neuron with several separate dendrites entering the soma at different points.
- A single specimen (one neuron with, at most, the small patch of muscle fibre its terminal contacts for the motor-end-plate structure) — not a dense tangled network of many neurons.

---

## 2. Real microscopy reference (own set `reference-microscopy`)
Proposed: **Wikimedia Commons — "Nissl bodies in neurons of the spinal cord.jpg"**, a real light-microscope photomicrograph of a cresyl-violet (Nissl) and luxol-fast-blue stained section of the spinal-cord anterior horn, showing large multipolar motor-neuron cell bodies with textbook Nissl substance clumping around a pale nucleus/nucleolus, plus surrounding neuropil and myelinated (blue) fibres.
- file: https://upload.wikimedia.org/wikipedia/commons/5/51/Nissl_bodies_in_neurons_of_the_spinal_cord.jpg
- page: https://commons.wikimedia.org/wiki/File:Nissl_bodies_in_neurons_of_the_spinal_cord.jpg · License: **CC BY-SA 4.0** · Attribution: Tulemo (Wikimedia Commons)
AI visual verification result: **PASS (2026-08-15).** Shows two large, clearly readable multipolar motor-neuron cell bodies (each with a large pale nucleus, dark central nucleolus, and coarse purple Nissl-body clumping in the surrounding cytoplasm) among smaller glial nuclei and a mesh of blue-stained myelinated fibres — an accurate, textbook Nissl-stain view of anterior-horn motor neurons. Caveat: the raw download carries two overlaid pointer arrows and a baked-in black scale bar (bottom right). A **cleaned, text/arrow-free version recomposed to foreground the single largest motor-neuron cell body** was produced with `edit_image.py` and is used for display — see §5.

---
## 3. Audience descriptions (EN + DE)

**Kids (GiantMicrobes-style).**  
🇬🇧 Meet the Motor Neuron — the body's longest-distance messenger! It sits snugly in your spinal cord with a big starry body and lots of little arms (dendrites) listening for signals from your brain. The moment it hears "move!", it fires a tiny electric spark down its super-long cable, the axon — sometimes almost as long as your whole leg! At the very end, it taps a muscle on the shoulder with a puff of a chemical messenger called acetylcholine, and — twitch! — your muscle jumps into action. Wiggling your toes, waving hello, blinking an eye: every single one of those moves starts with a motor neuron shouting "go!" all the way down its long wire.  
🇩🇪 Das ist das Motoneuron — der Langstrecken-Bote deines Körpers! Es sitzt gemütlich in deinem Rückenmark, hat einen großen sternförmigen Körper und viele kleine Ärmchen (Dendriten), die auf Signale aus deinem Gehirn lauschen. Sobald es "Bewegung!" hört, schickt es einen winzigen elektrischen Funken durch sein superlanges Kabel, das Axon — manchmal fast so lang wie dein ganzes Bein! Ganz am Ende tippt es einem Muskel mit einem chemischen Botenstoff namens Acetylcholin auf die Schulter, und zack — dein Muskel zuckt los. Zehen wackeln, winken, mit den Augen blinzeln: Jede einzelne dieser Bewegungen beginnt damit, dass ein Motoneuron "los!" durch sein langes Kabel ruft.

**Adults (popular science, health).**  
🇬🇧 The motor neuron is the final relay in every voluntary movement you make: a large, multipolar nerve cell whose cell body sits in the spinal cord or brainstem and whose single axon can run nearly a metre to reach a specific skeletal muscle. When it fires, an electrical impulse races down the myelin-insulated axon and triggers the release of acetylcholine at the motor end plate, the specialised junction where nerve meets muscle — this is the last step that turns a thought or reflex into an actual contraction. Because each motor neuron has to keep such a long axon supplied with proteins and energy, its cell body is unusually large and packed with visible protein-making machinery (Nissl bodies). Motor neurons are also of direct medical importance: they are the cells that progressively die in amyotrophic lateral sclerosis (ALS) and spinal muscular atrophy, which is why understanding and protecting them is a major focus of neurodegenerative-disease research.  
🇩🇪 Das Motoneuron ist das letzte Glied in der Kette jeder willkürlichen Bewegung: eine große, vielarmige Nervenzelle, deren Zellkörper im Rückenmark oder Hirnstamm sitzt und deren einzelnes Axon fast einen Meter lang sein kann, um einen bestimmten Skelettmuskel zu erreichen. Feuert sie, rast ein elektrischer Impuls durch das myelinisolierte Axon und löst an der motorischen Endplatte — der speziellen Kontaktstelle zwischen Nerv und Muskel — die Freisetzung von Acetylcholin aus. Das ist der letzte Schritt, der einen Gedanken oder Reflex in eine tatsächliche Muskelkontraktion verwandelt. Weil jedes Motoneuron ein so langes Axon ständig mit Proteinen und Energie versorgen muss, ist sein Zellkörper ungewöhnlich groß und voller sichtbarer Proteinfabriken (Nissl-Schollen). Motoneuronen sind auch medizinisch von direkter Bedeutung: Sie sind genau die Zellen, die bei Amyotropher Lateralsklerose (ALS) und spinaler Muskelatrophie fortschreitend absterben, weshalb ihr Schutz ein zentrales Forschungsfeld der Neurodegenerationsforschung ist.

**Scientific.**  
🇬🇧 The somatic (α-) motor neuron is a large multipolar neuron with its soma located in the anterior horn of the spinal-cord grey matter or in a cranial-nerve motor nucleus of the brainstem. Its soma is characterised by abundant Nissl substance (rough endoplasmic reticulum with free ribosomes), a large euchromatic nucleus with a prominent nucleolus, and multiple profusely branching dendrites that integrate thousands of afferent synaptic inputs. A single axon originates at the Nissl-free axon hillock, the site of action-potential initiation, and projects — via peripheral nerve, often over distances approaching a metre — to extrafusal skeletal-muscle fibres, myelinated in segments by successive Schwann cells with intervening nodes of Ranvier that support saltatory conduction. At the axon terminal, acetylcholine released from synaptic vesicles acts on nicotinic acetylcholine receptors clustered on the highly folded postsynaptic membrane of the motor end plate, producing an end-plate potential that triggers muscle-fibre depolarisation and excitation-contraction coupling. Motor neurons are the selectively vulnerable cell population in amyotrophic lateral sclerosis and spinal muscular atrophy, making their axonal-transport and protein-homeostasis biology a central object of neurodegeneration research.  
🇩🇪 Das somatische (α-) Motoneuron ist eine große, vielpolige Nervenzelle, deren Soma im Vorderhorn der Rückenmarks-grauen Substanz oder in einem motorischen Hirnnervenkern des Hirnstamms liegt. Sein Soma ist gekennzeichnet durch reichlich Nissl-Substanz (raues endoplasmatisches Retikulum mit freien Ribosomen), einen großen euchromatischen Zellkern mit deutlichem Nukleolus sowie mehrere stark verzweigte Dendriten, die tausende afferente synaptische Eingänge integrieren. Ein einzelnes Axon entspringt am Nissl-freien Axonhügel, dem Ort der Aktionspotential-Auslösung, und projiziert über einen peripheren Nerv — oft über Strecken von nahezu einem Meter — zu extrafusalen Skelettmuskelfasern; es wird abschnittsweise von aufeinanderfolgenden Schwann-Zellen myelinisiert, mit dazwischenliegenden Ranvier-Schnürringen, die die saltatorische Erregungsleitung ermöglichen. An der Axonendigung wirkt aus synaptischen Vesikeln freigesetztes Acetylcholin auf nikotinische Acetylcholinrezeptoren, die auf der stark gefalteten postsynaptischen Membran der motorischen Endplatte konzentriert sind, und erzeugt ein Endplattenpotential, das die Depolarisation der Muskelfaser und die Erregungs-Kontraktions-Kopplung auslöst. Motoneuronen sind die selektiv vulnerable Zellpopulation bei Amyotropher Lateralsklerose und spinaler Muskelatrophie, weshalb ihre Axontransport- und Proteinhomöostase-Biologie ein zentraler Gegenstand der Neurodegenerationsforschung ist.

## 4. Prompts per style (sent to Nano Banana)

<details><summary>Textbook illustration (<code>textbook</code>)</summary>

Clean cutaway textbook illustration of a SINGLE human motor neuron (a large multipolar nerve cell from the spinal-cord anterior horn), centered in a square 1:1 1080x1080 frame with lots of negative space around structures for later labels. Fill the whole square edge-to-edge on a neutral dark charcoal background with NO border, frame, vignette or letterbox. Match the exact house look of a refined educational plate: a MUTED, slightly desaturated palette (soft dusty tints, never bright primary or cartoon colours), THIN clean outlines (not heavy black strokes), gentle soft shading, each structure its own distinct soft colour fill. The cell has a large star-shaped, multipolar soma with several thick branching dendrites radiating outward, and exactly ONE long thin axon leaving from a narrow axon hillock, coursing across the frame and tapering into fine terminal branches (axon terminals / synaptic boutons) that end on a small stylised patch of skeletal-muscle fibre forming the motor end plate. A neat cutaway of the soma reveals the interior: a large central oval nucleus with a single dark nucleolus, coarse purple-violet Nissl bodies (rough ER clumps) filling the cytoplasm of the soma and the base of the dendrites but clearly ABSENT from the pale axon hillock and the axon itself, a small Golgi apparatus near the nucleus, and a few oval mitochondria. The axon is wrapped in a segmented myelin sheath (pale sausage-like segments) with clearly visible small gaps (nodes of Ranvier) between segments. Anatomically faithful human neuron. Do NOT draw a cell wall, nucleoid, plasmids, chloroplasts or a central vacuole; do NOT draw more than one axon; do NOT let Nissl bodies extend into the axon; do NOT draw an unbroken continuous myelin sheath with no nodes. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>SEM micrograph (<code>sem</code>)</summary>

Photorealistic false-color scanning electron micrograph (SEM) of a SINGLE human motor neuron growing on a culture substrate, centered in a square 1:1 1080x1080 frame with generous empty margin. Fill the whole square edge-to-edge with NO border, frame or letterbox. The cell has a large rounded multipolar soma with several thick tapering dendrites and one long thin axon trailing off across the frame, all resting on a subtly textured neutral substrate. Render true 3D surface texture: a smooth domed soma surface, fine membrane ruffles, and thread-like filopodia reaching from the dendrite tips. Shallow depth of field so the far edges (end of the axon) fall softly out of focus, cool studio microscopy lighting. False-color palette: warm amber to soft coral cell against a dark uncluttered charcoal background. SEM shows the outer surface only, so render NO internal organelles (no visible Nissl bodies, nucleus etc - surface only). Anatomically faithful, single specimen only. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks anywhere in the image.

</details>

<details><summary>3D medical render (<code>3d</code>)</summary>

Semi-realistic 3D medical-illustration still of a SINGLE human motor neuron, a large multipolar nerve cell, centered in a square 1:1 1080x1080 frame with generous margin on a clean seamless dark studio background, filling the frame edge-to-edge with NO border or letterbox. Soft global illumination, gentle rim light, subsurface scattering on the translucent plasma membrane. The cell has a large star-shaped soma with several branching dendrites and exactly one long axon that curves gracefully across the frame, tapering into fine terminal branches that end on a small stylised segment of skeletal-muscle fibre (the motor end plate). Use a gentle cut-away and soft translucency to reveal the interior with natural, believable biological tones so the structures are clearly distinguishable: a large translucent oval nucleus with a single dark nucleolus, coarse violet Nissl-body clumps (rough ER) filling the soma but fading out at the pale axon hillock and staying out of the axon, a small Golgi stack, a few oval mitochondria glowing warm orange, and a segmented myelin sheath (pale, sausage-like) around the axon with visible small gaps at the nodes of Ranvier. Natural colours, not near-monochrome and not neon. Do NOT render a cell wall, nucleoid, plasmids, chloroplasts or a central vacuole; do NOT draw more than one axon; this is a human nerve cell, not a bacterium or plant cell. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

<details><summary>Watercolor plate (<code>watercolor</code>)</summary>

Hand-painted naturalist scientific plate of a SINGLE human motor neuron in the style of a 19th-century atlas (reminiscent of classic neuron anatomical drawings), but anatomically modern and correct, centered in a square 1:1 1080x1080 frame with generous margin. The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner: the paper IS the background. Do NOT render the artwork as a separate sheet, card or page lying on a surface, and NO mat, border, frame, drop-shadow or grey panel. Soft translucent watercolour washes with fine ink outlines and a soft darker wash halo directly on the paper behind the cell. The cell has a large star-shaped, multipolar soma with several branching dendrites radiating outward and exactly ONE long thin axon that winds gracefully across the paper, tapering into fine terminal branches ending on a small painterly patch of muscle fibre (the motor end plate). A delicate painterly cutaway reveals the interior: a large central oval nucleus with a single nucleolus, coarse violet-washed Nissl bodies filling the soma and dendrite bases but absent from the pale axon hillock and axon, a small Golgi stack, and a few oval mitochondria. The axon carries a gently segmented myelin sheath with visible small gaps (nodes of Ranvier). Single specimen, anatomically faithful human neuron. Do NOT paint a cell wall, nucleoid, plasmids, chloroplasts or a central vacuole; do NOT paint more than one axon. Absolutely NO text, letters, numbers, labels, scale bars, arrows, or watermarks in the image.

</details>

## 5. Every picture (renders + reference) with verdicts

### Textbook illustration (`textbook`) — 1 attempt(s), 1684 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 21.1s — PASS (gemini-2.5-flash-image) — star-shaped multipolar soma with branching dendrites, single axon leaving a pale Nissl-free axon hillock, nucleus + single nucleolus, coarse purple Nissl-body clumps confined to soma, segmented myelin sheath with visible nodes of Ranvier, axon terminal ending on a small muscle-fibre patch (motor end plate); muted educational palette matching house look, no border, no text.
  ![textbook 1](theme/textbook/motor-neuron.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (textbook, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/textbook/motor-neuron.textbook.svg)
[interactive SVG](theme/textbook/motor-neuron.textbook.svg) · [HTML](theme/textbook/motor-neuron.textbook.html)

### SEM micrograph (`sem`) — 1 attempt(s), 1524 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 31.0s — PASS (gemini-2.5-flash-image) — false-colour amber/coral surface-only render of a single multipolar soma with tapering dendrites and one trailing axon, smooth domed surface texture, shallow depth of field, dark uncluttered background, no internal organelles (correct for SEM), no text/scale bar.
  ![sem 1](theme/sem/motor-neuron.attempts/gen-01__gemini-2.5-flash-image.avif)

### 3D medical render (`3d`) — 1 attempt(s), 1609 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 24.3s — PASS (gemini-2.5-flash-image) — natural biological tints, translucent soma with nucleus/nucleolus, Nissl clumps fading out at the hillock, segmented myelin with nodes of Ranvier, single axon ending in a small motor-end-plate flag; clean dark studio background, no border.
  ![3d 1](theme/3d/motor-neuron.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (3d, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/3d/motor-neuron.3d.svg)
[interactive SVG](theme/3d/motor-neuron.3d.svg) · [HTML](theme/3d/motor-neuron.3d.html)

### Watercolor plate (`watercolor`) — 1 attempt(s), 1626 tok, $0.039
- attempt 1 · `gemini-2.5-flash-image` · 13.1s — PASS (gemini-2.5-flash-image) — warm aged paper fills the frame edge-to-edge with a soft wash halo, single multipolar soma with fine ink linework, nucleus + nucleolus, violet Nissl-body dots, segmented myelin with nodes, terminal axon fraying into fine boutons; no mat/frame/sheet-on-surface, no text.
  ![watercolor 1](theme/watercolor/motor-neuron.attempts/gen-01__gemini-2.5-flash-image.avif)

**Labelled figure (watercolor, English default; Latin/German toggle in the SVG/HTML):**
![labelled](theme/watercolor/motor-neuron.watercolor.svg)
[interactive SVG](theme/watercolor/motor-neuron.watercolor.svg) · [HTML](theme/watercolor/motor-neuron.watercolor.html)

### Real microscopy reference (`reference-microscopy`)
- `LM` · CC BY-SA 4.0 · Tulemo (Wikimedia Commons) — PASS (2026-08-15) — Wikimedia Commons Nissl/luxol-fast-blue LM section, CC BY-SA 4.0, Tulemo. Two large, clearly readable multipolar motor-neuron cell bodies with pale nucleus, dark nucleolus and coarse purple Nissl-body clumping. Cleaned with edit_image.py to remove baked-in pointer arrows and scale bar and recompose around the single largest cell body.
  ![reference](../reference-microscopy/theme/lm/motor-neuron.attempts/real-02__edit-gemini-2.5-flash-image.avif)

## 6. Teaching-use decision

| style | verdict | attempts | note |
|---|---|---|---|
| textbook | pass | 1 | correct multipolar anatomy, Nissl confined to soma, segmented myelin with nodes, matches house palette/line style |
| sem | pass | 1 | correct surface-only false-colour rendering of soma + dendrites + axon |
| 3d | pass | 1 | natural tints, correct anatomy, clean labels |
| watercolor | pass | 1 | full-bleed aged paper, correct anatomy, clean labels |
