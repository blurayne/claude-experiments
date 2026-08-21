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
