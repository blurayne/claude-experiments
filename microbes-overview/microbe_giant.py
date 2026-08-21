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
  - Chlamydia felis — their "Chlamydia" plush is species `chlamydia trachomatis`,
    a different species in the same genus. Same genus is not the same organism,
    and the cat one causes conjunctivitis while the human one is an STI.
  - FIV and FeLV — no feline retrovirus plush exists.
  - enterocyte — their "Celiac Disease" plush is species `enterozyt`, but the
    photo depicts finger-like villi and a zipped-shut mouth (the disease
    concept, gut lining zipped closed by gluten intolerance), not a single
    gut cell. A disease/tissue-level toy is not a cell portrait, so it stays
    unlinked even though the species field matches.
A few 2026-08 additions are worth a word:
  - nucleus — GIANTmicrobes sells no full-size nucleus plush, only a "Nucleus
    Key Chain". It is linked anyway, because the little toy does depict this
    very structure (nucleolus and chromatin are both modelled), but it is
    listed in KEYCHAIN below so the viewer calls it a keychain rather than
    quietly passing it off as a plush. That distinction is the reason the
    exception is safe to make.
  - dna, rna, chromosome, mitochondrion — the vendor listing carries no
    `species` string for these (it's blank), so the match is on the product
    name itself, which *is* the subject's exact name/common noun (DNA, RNA,
    Chromosome, Mitochondria) — verified against the product photo, not text
    alone, per the "exact match" rule above.
"""

# Photos we had to repair, all with scripts/edit_image.py (gemini-2.5-flash-image).
# Surfaced in the viewer so such a picture is never passed off as an untouched
# product shot. Every other plush photo here is the vendor's original.
#
# The vendor publishes some of these product shots only as soft, upscaled,
# heavily-compressed files — measured by edge sharpness, not by file size, since
# a background-removed AVIF compresses small no matter how good it is. The
# restore pass denoises and re-sharpens without redrawing.
#
# NOT restored, deliberately: candida-albicans and parasite. Two attempts each,
# the second with an explicit pixel-for-pixel instruction, and both times the
# model re-framed and cropped the toy instead of merely cleaning it. A soft but
# truthful product photo beats a sharp but altered one, so those keep the
# vendor original.
AI_CLEANED = {
    'hematopoietic-stem-cell',   # "GIGANTIC!microbes" logo covered half the toy
    'macrophage',                # sharpness 1.6 -> 7.6
    'cytotoxic-t-cell',          # 1.9 -> 17.3
    'sickle-cell',               # 2.0 -> 9.9
    'prion',                     # 2.3 -> 5.6
    'keratinocyte',              # 2.4 -> 6.9
    'influenza-virus',           # 2.9 -> 2.9, denoised only
    'cardiomyocyte',             # vendor publishes it only at 200x200; upscaled
}

# Products that are a plush KEYCHAIN rather than a full-size plush toy. Every
# other entry in GIANT is a full plush, so the viewer would otherwise label a
# keychain "Plush toy" — a small untruth this atlas has no reason to tell.
# Listed here, `build_viewer.py` flags it and the card says "Keychain".
KEYCHAIN = {
    'nucleus',                   # no full-size nucleus plush is sold at all
}

# hepatocyte is the third case, alongside candida-albicans and parasite, where the
# repair was tried and thrown away. riesenmikroben.de publishes the Leberzelle photo
# only at 200x200 and has no larger original, so it is the same starting point as
# cardiomyocyte — but the upscale came back with a rounded silhouette where the real
# toy peaks triangularly, and the eyes had shifted. Framing was preserved, so it was
# closer than the candida attempt, yet a plush toy's outline IS the product. Kept the
# vendor's 200x200 original: small and soft, but actually the thing they sell.

# key -> (giantmicrobes product name, product url)
GIANT = {
    # --- organelles ---
    'golgi-apparatus': ('Golgi Apparatus', 'https://www.riesenmikroben.de/products/golgi_apparat?locale=de'),
    'mitochondrion': ('Mitochondria', 'https://www.riesenmikroben.de/products/mitochondrien?locale=de'),
    # the one keychain in this table (see KEYCHAIN above); riesenmikroben.de
    # does not carry it, so this is the only US-only link among the organelles
    'nucleus': ('Nucleus Key Chain - Cell Science Gift', 'https://www.giantmicrobes.com/us/products/nucleus-key-chain.html'),
    # --- stem cells ---
    'hematopoietic-stem-cell': ('Stem Cell Gigantic 14"', 'https://www.riesenmikroben.de/products/gig_stammzelle?locale=de'),
    # --- epithelial ---
    'keratinocyte': ('Skin Cell (Keratinocyte)', 'https://www.riesenmikroben.de/products/hautzelle?locale=de'),
    'hepatocyte': ('Leberzelle (Liver Cell)', 'https://www.riesenmikroben.de/products/leberzelle?locale=de'),
    # --- nerve cells ---
    'neuron': ('Nerve Cell (Neuron)', 'https://www.riesenmikroben.de/products/nervenzelle?locale=de'),
    # --- reproductive ---
    'spermatozoon': ('Sperm Cell (Spermatozoon)', 'https://www.riesenmikroben.de/products/spermium?locale=de'),
    'oocyte': ('Egg Cell (Human ovum)', 'https://www.riesenmikroben.de/products/eizelle?locale=de'),
    # --- bone cells ---
    'osteocyte': ('Bone Cell (Osteocyte)', 'https://www.riesenmikroben.de/products/knochenzelle?locale=de'),
    # --- fat cells ---
    'white-adipocyte': ('Obesity (Fat Cell)', 'https://www.riesenmikroben.de/products/fettzelle?locale=de'),
    # --- heart cells ---
    'cardiomyocyte': ('Heart Cell (Cardiomyocyte)', 'https://www.riesenmikroben.de/products/herzzelle?locale=de'),
    # --- red blood ---
    'erythrocyte': ('Red Blood Cell (Erythrocyte)', 'https://www.riesenmikroben.de/products/rotes_blutkoerperchen?locale=de'),
    'thrombocyte': ('Platelet (Thrombocyte)', 'https://www.riesenmikroben.de/products/blutplaettchen?locale=de'),
    'sickle-cell': ('Sickle Cell - Blood Health Plush', 'https://www.riesenmikroben.de/products/sichelzellkrankheit?locale=de'),
    # --- immune cells ---
    'cytotoxic-t-cell': ('Killer T Cell - Immune Defender Plush', 'https://www.giantmicrobes.com/us/products/killer-t-cell.html'),
    'macrophage': ('Macrophage - Immune System Plush', 'https://www.riesenmikroben.de/products/makrophage?locale=de'),
    # the generic "White Blood Cell" plush is species `leukozyt`; it was
    # deliberately withheld from neutrophil for being generic, and now that the
    # atlas carries a generic leukocyte entry it finally has an exact home
    'white-blood-cell': ('White Blood Cell (Leukocyte)', 'https://www.riesenmikroben.de/products/weisses_blutkoerperchen?locale=de'),
    # --- cancer cells ---
    'cancer-cell': ('Cancer (Malignant neoplasm)', 'https://www.riesenmikroben.de/products/krebszelle?locale=de'),
    # --- antibodies ---
    'igg': ('Antibody (Immunoglobulin)', 'https://www.riesenmikroben.de/products/antikoerper?locale=de'),
    # --- pathogens (generic set) ---
    'parasite': ('Sleeping Sickness (Trypanosoma brucei)', 'https://www.riesenmikroben.de/products/schlafkrankheit?locale=de'),
    'prion': ('Mad Cow (Bovine Spongiform Encephalopathy)', 'https://www.riesenmikroben.de/products/bse?locale=de'),
    'amoeba-proteus': ('Amoeba (Amoeba proteus)', 'https://www.riesenmikroben.de/products/amoebe_blau?locale=de'),
    'tick': ('Tick (Ixodes scapularis)', 'https://www.riesenmikroben.de/products/zecke?locale=de'),
    'coronavirus': ('Coronavirus COVID-19 (SARS-CoV-2)', 'https://www.riesenmikroben.de/products/covid-19?locale=de'),
    # --- well-known bacteria ---
    'mycobacterium-tuberculosis': ('TB (Tuberculosis)', 'https://www.riesenmikroben.de/products/tuberkulose?locale=de'),
    'staphylococcus-aureus': ('Staph (Staphylococcus aureus)', 'https://www.riesenmikroben.de/products/staphylokokke?locale=de'),
    'streptococcus-pneumoniae': ('Pneumonia (Streptococcus pneumonia)', 'https://www.riesenmikroben.de/products/lungenentzuendung?locale=de'),
    'escherichia-coli': ('E. coli (Escherichia coli)', 'https://www.riesenmikroben.de/products/e_coli?locale=de'),
    'salmonella-enterica': ('Salmonella (Salmonella typhimurium)', 'https://www.riesenmikroben.de/products/salmonelle?locale=de'),
    'helicobacter-pylori': ('Ulcer (Helicobacter pylori)', 'https://www.riesenmikroben.de/products/magengeschwuer?locale=de'),
    'borrelia-burgdorferi': ('Lyme Disease (Borrelia burgdorferi)', 'https://www.riesenmikroben.de/products/lyme-borreliose?locale=de'),
    # species reads `clostridium difficile` — the pre-2016 genus name for the same organism
    'clostridioides-difficile': ('C. Diff (Clostridioides difficile)', 'https://www.riesenmikroben.de/products/cdiff?locale=de'),
    'listeria-monocytogenes': ('Listeria (Listeria monocytogenes)', 'https://www.riesenmikroben.de/products/listeria?locale=de'),
    'streptococcus-mutans': ('Cavity (Streptococcus mutans)', 'https://www.riesenmikroben.de/products/karies?locale=de'),
    # --- well-known viruses & other pathogens ---
    'influenza-virus': ('Flu (Orthomyxovirus)', 'https://www.riesenmikroben.de/products/grippe?locale=de'),
    'sars-cov-2': ('Coronavirus COVID-19 (SARS-CoV-2)', 'https://www.riesenmikroben.de/products/covid-19?locale=de'),
    'hiv': ('HIV (Human Immunodeficiency Virus)', 'https://www.riesenmikroben.de/products/hiv?locale=de'),
    'plasmodium': ('Malaria (Plasmodium falciparum)', 'https://www.riesenmikroben.de/products/malaria?locale=de'),
    'candida-albicans': ('Candida fungus', 'https://www.riesenmikroben.de/products/candida?locale=de'),
    'measles-virus': ('Measles (Morbillivirus)', 'https://www.riesenmikroben.de/products/masern?locale=de'),
    'rotavirus': ('Rotavirus (Rotavirus)', 'https://www.riesenmikroben.de/products/rotavirus?locale=de'),
    'rhinovirus': ('Common Cold (Rhinovirus)', 'https://www.riesenmikroben.de/products/erkaeltung?locale=de'),
    'zika-virus': ('Zika (Zika virus)', 'https://www.riesenmikroben.de/products/zika?locale=de'),
    'norovirus': ('Norovirus - Stomach Bug Plush', 'https://www.riesenmikroben.de/products/norovirus?locale=de'),
    # riesenmikroben.de has no /products/chickenpox?locale=de listing under that
    # slug, but /windpocken (its actual DE slug) resolves and is the same product
    'varicella-zoster-virus': ('Chickenpox (Varicella-Zoster virus)', 'https://www.riesenmikroben.de/products/windpocken?locale=de'),
    'giardia-lamblia': ('Giardia (Giardia lamblia)', 'https://www.riesenmikroben.de/products/giardia?locale=de'),
    # --- helpful microbes ---
    'penicillium-chrysogenum': ('Penicillin (Penicillium chrysogenum)', 'https://www.riesenmikroben.de/products/penicillin?locale=de'),
    # --- pathogens of cats and dogs ---
    'heartworm': ('Heartworm (Dirofilaria immitis)', 'https://www.riesenmikroben.de/products/herzwurm?locale=de'),
    # the vendor publishes this one only at 200x200; kept at that size rather than
    # upscaled, for the same reason as the Leberzelle (see the note above AI_CLEANED).
    # Its white studio backdrop was made transparent by a plain flood fill — a
    # mechanical edit that leaves the toy itself untouched.
    'rabies-virus': ('Rabies - Deadly Virus Plush', 'https://www.riesenmikroben.de/products/tollwut?locale=de'),
    'saccharomyces-cerevisiae': ('Beer & Bread (Saccharomyces cerevisiae)', 'https://www.riesenmikroben.de/products/bierhefe?locale=de'),
    'bifidobacterium-longum': ('Bifido (Bifidobacterium longum)', 'https://www.riesenmikroben.de/products/bifido-bakterium?locale=de'),
    # --- genetics ---
    # no `species` field on these three (it's blank); matched on the product
    # name itself, which is the exact subject name, and confirmed against the
    # photo (double helix / single strand with base pairs / X-shaped pair)
    'dna': ('DNA (Deoxyribonucleic acid)', 'https://www.riesenmikroben.de/products/dns?locale=de'),
    'rna': ('RNA - Genetic Messenger Plush', 'https://www.riesenmikroben.de/products/rns?locale=de'),
    'chromosome': ('Chromosome - Genetic Blueprint Plush', 'https://www.riesenmikroben.de/products/chromosom?locale=de'),
}
