# Colour: real vs convention

**A single bacterial cell is essentially colourless / transparent.** The purples and
pinks of stained slides are dye; the vivid colours of SEM/TEM images are artificial
false-colour added in software (electron microscopes image in greyscale). So on a
single-cell render, colour is a **teaching convention**, not the organism's colour.
Real colour only appears when cells pile into a **colony**, and only for species that
make a pigment. Sources: OpenStax Microbiology 2.4 (staining), general EM false-colour.

## Per-microbe colour research step
Before choosing a palette, a colour subagent answers: *does this species have a known
pigment/real colour?* Use it only if yes; otherwise render neutral/translucent and say
in the log that colour is convention.

- **Pigmented → use the real colour:** *S. aureus* → **golden** (staphyloxanthin;
  *aureus* = golden), *Serratia marcescens* → **red** (prodigiosin), *Pseudomonas
  aeruginosa* → **blue-green** (pyocyanin) / yellow-green (pyoverdine), *Micrococcus
  luteus* → **yellow**, *Chromobacterium violaceum* → **violet** (violacein), most
  **fungi/moulds** → strongly pigmented spores.
- **Effectively colourless → neutral/translucent, colour = convention:** *E. coli* and
  most Gram-negative rods (colonies cream/greyish, `#E7E0D3`), *Mycobacterium*, most
  streptococci, *S. epidermidis*. (Plate colours on EMB/MacConkey/blood agar are
  medium indicators or haemolysis, not the cell.)

## Consistency rule
When colour is involved, **keep the colour legend consistent across a microbe's
themes**: pick one structure→colour mapping (e.g. nucleoid = blue-purple, plasmid =
green, cell wall = orange, outer/plasma membrane = teal/blue, ribosomes = teal dots,
cell body = the species' real colour or a neutral translucent tone) and state it in the
prompts for **all** of that microbe's styles so textbook / 3d / watercolor match.
