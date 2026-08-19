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

Several of our cell types map to the same GIANTmicrobes product where the
brand only makes one generic plush for a whole category (e.g. every stem
cell subtype shares their single "Stem Cell" plush; every antibody isotype
shares their single "Antibody" plush). The 5 stem-cell entries specifically
use the Gigantic-size product listing, not the standard one — the standard
listing's only local photo was a 60x50 fallback thumbnail, while the
Gigantic version has a proper full-size product photo. Sourced from
/home/markusg/Private/claude-experiments/giant-microbes/merged_catalog.json.
"""

# key -> (giantmicrobes product name, product url)
GIANT = {
    'embryonic-stem-cell': ('Stem Cell Gigantic 14"', 'https://www.riesenmikroben.de/products/gig_stammzelle?locale=de'),
    'induced-pluripotent-stem-cell': ('Stem Cell Gigantic 14"', 'https://www.riesenmikroben.de/products/gig_stammzelle?locale=de'),
    'hematopoietic-stem-cell': ('Stem Cell Gigantic 14"', 'https://www.riesenmikroben.de/products/gig_stammzelle?locale=de'),
    'mesenchymal-stem-cell': ('Stem Cell Gigantic 14"', 'https://www.riesenmikroben.de/products/gig_stammzelle?locale=de'),
    'neural-stem-cell': ('Stem Cell Gigantic 14"', 'https://www.riesenmikroben.de/products/gig_stammzelle?locale=de'),
    'keratinocyte': ('Skin Cell (Keratinocyte)', 'https://www.riesenmikroben.de/products/hautzelle?locale=de'),
    'neuron': ('Nerve Cell (Neuron)', 'https://www.riesenmikroben.de/products/nervenzelle?locale=de'),
    'motor-neuron': ('Nerve Cell (Neuron)', 'https://www.riesenmikroben.de/products/nervenzelle?locale=de'),
    'astrocyte': ('Glial Cell – Brain Support Plush', 'https://www.giantmicrobes.com/us/products/glial-cell.html'),
    'oligodendrocyte': ('Glial Cell – Brain Support Plush', 'https://www.giantmicrobes.com/us/products/glial-cell.html'),
    'microglia': ('Glial Cell – Brain Support Plush', 'https://www.giantmicrobes.com/us/products/glial-cell.html'),
    'schwann-cell': ('Glial Cell – Brain Support Plush', 'https://www.giantmicrobes.com/us/products/glial-cell.html'),
    'spermatozoon': ('Sperm Cell (Spermatozoon)', 'https://www.riesenmikroben.de/products/spermium?locale=de'),
    'oocyte': ('Egg Cell (Human ovum)', 'https://www.riesenmikroben.de/products/eizelle?locale=de'),
    'osteoblast': ('Bone Cell (Osteocyte)', 'https://www.riesenmikroben.de/products/knochenzelle?locale=de'),
    'osteoclast': ('Bone Cell (Osteocyte)', 'https://www.riesenmikroben.de/products/knochenzelle?locale=de'),
    'osteocyte': ('Bone Cell (Osteocyte)', 'https://www.riesenmikroben.de/products/knochenzelle?locale=de'),
    'white-adipocyte': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    'brown-adipocyte': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    'beige-adipocyte': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    'preadipocyte': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    'lipoblast': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    'adipogenic-progenitor': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    'erythrocyte': ('Red Blood Cell (Erythrocyte)', 'https://www.riesenmikroben.de/products/rotes_blutkoerperchen?locale=de'),
    'reticulocyte': ('Red Blood Cell (Erythrocyte)', 'https://www.riesenmikroben.de/products/rotes_blutkoerperchen?locale=de'),
    'erythroblast': ('Red Blood Cell (Erythrocyte)', 'https://www.riesenmikroben.de/products/rotes_blutkoerperchen?locale=de'),
    'thrombocyte': ('Platelet (Thrombocyte)', 'https://www.riesenmikroben.de/products/blutplaettchen?locale=de'),
    'sickle-cell': ('Sickle Cell - Blood Health Plush', 'https://www.riesenmikroben.de/products/sichelzellkrankheit?locale=de'),
    'cytotoxic-t-cell': ('Killer T Cell - Immune Defender Plush', 'https://www.giantmicrobes.com/us/products/killer-t-cell.html'),
    'macrophage': ('Macrophage - Immune System Plush', 'https://www.riesenmikroben.de/products/makrophage?locale=de'),
    'neutrophil': ('White Blood Cell (Leukocyte)', 'https://www.riesenmikroben.de/products/weisses_blutkoerperchen?locale=de'),
    'igg': ('Antibody (Immunoglobulin)', 'https://www.riesenmikroben.de/products/antikoerper?locale=de'),
    'iga': ('Antibody (Immunoglobulin)', 'https://www.riesenmikroben.de/products/antikoerper?locale=de'),
    'igm': ('Antibody (Immunoglobulin)', 'https://www.riesenmikroben.de/products/antikoerper?locale=de'),
    'igd': ('Antibody (Immunoglobulin)', 'https://www.riesenmikroben.de/products/antikoerper?locale=de'),
    'ige': ('Antibody (Immunoglobulin)', 'https://www.riesenmikroben.de/products/antikoerper?locale=de'),
    'parasite': ('Sleeping Sickness (Trypanosoma brucei)', 'https://www.riesenmikroben.de/products/schlafkrankheit?locale=de'),
    'prion': ('Mad Cow (Bovine Spongiform Encephalopathy)', 'https://www.riesenmikroben.de/products/bse?locale=de'),
    'coronavirus': ('Coronavirus COVID-19 (SARS-CoV-2)', 'https://www.riesenmikroben.de/products/covid-19?locale=de'),
    'rod-bacterium': ('E. coli (Escherichia coli)', 'https://www.riesenmikroben.de/products/e_coli?locale=de'),
    'mycobacterium-tuberculosis': ('TB (Tuberculosis)', 'https://www.riesenmikroben.de/products/tuberkulose?locale=de'),
    'staphylococcus-aureus': ('Staph (Staphylococcus aureus)', 'https://www.riesenmikroben.de/products/staphylokokke?locale=de'),
    'streptococcus-pneumoniae': ('Pneumonia (Streptococcus pneumonia)', 'https://www.riesenmikroben.de/products/lungenentzuendung?locale=de'),
    'escherichia-coli': ('E. coli (Escherichia coli)', 'https://www.riesenmikroben.de/products/e_coli?locale=de'),
    'salmonella-enterica': ('Salmonella (Salmonella typhimurium)', 'https://www.riesenmikroben.de/products/salmonelle?locale=de'),
    'helicobacter-pylori': ('Ulcer (Helicobacter pylori)', 'https://www.riesenmikroben.de/products/magengeschwuer?locale=de'),
    'influenza-virus': ('Flu (Orthomyxovirus)', 'https://www.riesenmikroben.de/products/grippe?locale=de'),
    'sars-cov-2': ('Coronavirus COVID-19 (SARS-CoV-2)', 'https://www.riesenmikroben.de/products/covid-19?locale=de'),
    'hiv': ('HIV (Human Immunodeficiency Virus)', 'https://www.riesenmikroben.de/products/hiv?locale=de'),
    'hepatitis-b-virus': ('Hepatitis (Hepatitis virus)', 'https://www.riesenmikroben.de/products/hepatitis?locale=de'),
    'plasmodium': ('Malaria (Plasmodium falciparum)', 'https://www.riesenmikroben.de/products/malaria?locale=de'),
    'candida-albicans': ('Candida fungus', 'https://www.riesenmikroben.de/products/candida?locale=de'),
}
