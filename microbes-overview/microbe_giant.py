"""Mapping from our microbe key to a matching GIANTmicrobes plush toy,
for the optional "giant microbes" quick-preview button (see viewer.template.html).

img: path to the copied plush photo (renders/set/<set>/giant/<key>.<ext>),
     relative to this file's directory — filled in at build time by
     build_viewer.py, not stored here.
name: the matched GIANTmicrobes product name, for reference/alt text.
url: product page — riesenmikroben.de (DE) whenever that URL string
     exists at all (even if the listing itself shows retired/out of
     stock — the store page still resolves), else giantmicrobes.com
     (US). None when no matching product listing was found.

ONLY EXACT MATCHES. A plush is linked only when it depicts *this* cell or
*this* species, judged against the `species` field of
/home/markusg/Private/claude-experiments/giant-microbes/merged_catalog.json —
not merely a relative, a precursor, or the same family. A microbe with no
true counterpart simply gets no plush button. Notably NOT linked, and why:

  - embryonic / iPS / mesenchymal / neural stem cell — GIANTmicrobes' one
    "Stem Cell" plush is species `hämatopoetische Stammzelle`, so it maps to
    the haematopoietic stem cell alone.
  - astrocyte, oligodendrocyte, microglia, Schwann cell — their "Glial Cell"
    plush is generic (no species) and depicts no one of them in particular.
  - motor neuron — "Nerve Cell" is species `neuron`, the generic cell.
  - osteoblast, osteoclast — "Bone Cell" is species `osteozyt` (osteocyte).
  - brown/beige adipocyte, preadipocyte, lipoblast, adipogenic progenitor —
    "Obesity (Fat Cell)" is species `adipozyt`, the mature white fat cell.
  - reticulocyte, erythroblast — "Red Blood Cell" is species `erythrozyt`.
  - neutrophil — "White Blood Cell" is species `leukozyt`, a generic leukocyte.
  - IgA / IgD / IgE / IgM — "Antibody" is species `immunglobuline` and is
    modelled on the plain Y-shaped monomer; only IgG (the archetypal, most
    abundant serum immunoglobulin, and that exact shape) is linked.
  - rod-shaped bacterium — the only rod plush is the specific E. coli.
  - hepatitis B virus — their "Hepatitis" plush is species `hepatitis C virus`.
  - cocci, generic fungus, generic virus — GIANTmicrobes has no generic-shape
    plush for these, only named species.
"""

# Photos whose only available source carried a marketing overlay printed across
# the toy. Cleaned with scripts/edit_image.py (gemini-2.5-flash-image), which
# removed the lettering and continued the toy's own shape/colour/texture behind
# it. Surfaced in the viewer so the picture is never passed off as an untouched
# product shot. Every other plush photo here is the vendor's original.
AI_CLEANED = {
    'hematopoietic-stem-cell',   # "GIGANTIC!microbes" logo covered half the toy
}

# key -> (giantmicrobes product name, product url)
GIANT = {
    # --- stem cells ---
    'hematopoietic-stem-cell': ('Stem Cell Gigantic 14"', 'https://www.riesenmikroben.de/products/gig_stammzelle?locale=de'),
    # --- epithelial ---
    'keratinocyte': ('Skin Cell (Keratinocyte)', 'https://www.riesenmikroben.de/products/hautzelle?locale=de'),
    # --- nerve cells ---
    'neuron': ('Nerve Cell (Neuron)', 'https://www.riesenmikroben.de/products/nervenzelle?locale=de'),
    # --- reproductive ---
    'spermatozoon': ('Sperm Cell (Spermatozoon)', 'https://www.riesenmikroben.de/products/spermium?locale=de'),
    'oocyte': ('Egg Cell (Human ovum)', 'https://www.riesenmikroben.de/products/eizelle?locale=de'),
    # --- bone cells ---
    'osteocyte': ('Bone Cell (Osteocyte)', 'https://www.riesenmikroben.de/products/knochenzelle?locale=de'),
    # --- fat cells ---
    'white-adipocyte': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    # --- red blood ---
    'erythrocyte': ('Red Blood Cell (Erythrocyte)', 'https://www.riesenmikroben.de/products/rotes_blutkoerperchen?locale=de'),
    'thrombocyte': ('Platelet (Thrombocyte)', 'https://www.riesenmikroben.de/products/blutplaettchen?locale=de'),
    'sickle-cell': ('Sickle Cell - Blood Health Plush', 'https://www.riesenmikroben.de/products/sichelzellkrankheit?locale=de'),
    # --- immune cells ---
    'cytotoxic-t-cell': ('Killer T Cell - Immune Defender Plush', 'https://www.giantmicrobes.com/us/products/killer-t-cell.html'),
    'macrophage': ('Macrophage - Immune System Plush', 'https://www.riesenmikroben.de/products/makrophage?locale=de'),
    # --- antibodies ---
    'igg': ('Antibody (Immunoglobulin)', 'https://www.riesenmikroben.de/products/antikoerper?locale=de'),
    # --- pathogens (generic set) ---
    'parasite': ('Sleeping Sickness (Trypanosoma brucei)', 'https://www.riesenmikroben.de/products/schlafkrankheit?locale=de'),
    'prion': ('Mad Cow (Bovine Spongiform Encephalopathy)', 'https://www.riesenmikroben.de/products/bse?locale=de'),
    'coronavirus': ('Coronavirus COVID-19 (SARS-CoV-2)', 'https://www.riesenmikroben.de/products/covid-19?locale=de'),
    # --- well-known bacteria ---
    'mycobacterium-tuberculosis': ('TB (Tuberculosis)', 'https://www.riesenmikroben.de/products/tuberkulose?locale=de'),
    'staphylococcus-aureus': ('Staph (Staphylococcus aureus)', 'https://www.riesenmikroben.de/products/staphylokokke?locale=de'),
    'streptococcus-pneumoniae': ('Pneumonia (Streptococcus pneumonia)', 'https://www.riesenmikroben.de/products/lungenentzuendung?locale=de'),
    'escherichia-coli': ('E. coli (Escherichia coli)', 'https://www.riesenmikroben.de/products/e_coli?locale=de'),
    'salmonella-enterica': ('Salmonella (Salmonella typhimurium)', 'https://www.riesenmikroben.de/products/salmonelle?locale=de'),
    'helicobacter-pylori': ('Ulcer (Helicobacter pylori)', 'https://www.riesenmikroben.de/products/magengeschwuer?locale=de'),
    # --- well-known viruses & other pathogens ---
    'influenza-virus': ('Flu (Orthomyxovirus)', 'https://www.riesenmikroben.de/products/grippe?locale=de'),
    'sars-cov-2': ('Coronavirus COVID-19 (SARS-CoV-2)', 'https://www.riesenmikroben.de/products/covid-19?locale=de'),
    'hiv': ('HIV (Human Immunodeficiency Virus)', 'https://www.riesenmikroben.de/products/hiv?locale=de'),
    'plasmodium': ('Malaria (Plasmodium falciparum)', 'https://www.riesenmikroben.de/products/malaria?locale=de'),
    'candida-albicans': ('Candida fungus', 'https://www.riesenmikroben.de/products/candida?locale=de'),
}
