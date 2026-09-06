# GIANTmicrobes vs. our atlas

A side-by-side of every plush "microbe" GIANTmicrobes sells (or used to sell), against what this atlas actually catalogues, grouped by biological type rather than by product line. Source data: [`../giant-microbes/merged_catalog.json`](../giant-microbes/merged_catalog.json) (782 items, both storefronts merged) and this atlas's own [`microbe_giant.py`](microbe_giant.py), whose `GIANT` dict is the single source of truth for "we have it" — a product is only ✅ there when it depicts the *exact* species or cell, not a relative, precursor or same-genus stand-in (see that file's docstring for the individual rulings). ✅ means the atlas already links that plush; — means it doesn't, whether because the subject isn't catalogued at all or because it's catalogued but no plush was linked (noted inline).

This is a hand-built snapshot, not a generated report like [`OVERVIEW.md`](OVERVIEW.md) — re-check it after either catalogue changes meaningfully (new GIANTmicrobes releases, or new atlas chapters), since nothing here re-runs automatically.

**Variant products** (Keychain, Gigantic, Petri Dish, Mini, Ornament, Scarf, ...) of an organism already listed are folded into that organism's row and not counted separately — a Nucleus Key Chain, a Gigantic Stem Cell and a plain Stem Cell plush are all one row.

## Cell organelles & genetic material

| GIANTmicrobes product | Species / subject | In our atlas? |
| --- | --- | --- |
| Golgi Apparatus | — | ✅ `golgi-apparatus` |
| Mitochondria | — | ✅ `mitochondrion` |
| Nucleus Key Chain | — | ✅ `nucleus` (keychain only — no full-size nucleus plush exists) |
| DNA (Deoxyribonucleic acid) | — | ✅ `dna` |
| RNA – Genetic Messenger | — | ✅ `rna` |
| Chromosome – Genetic Blueprint | — | ✅ `chromosome` |

No plush exists for the ribosome, lysosome, endoplasmic reticulum, cell membrane, centriole, peroxisome or vacuole — the six above are the entire organelle/genetics line, and we already have every one of them.

## Human body cells

| GIANTmicrobes product | Cell | In our atlas? |
| --- | --- | --- |
| Stem Cell – Building Block | haematopoietic stem cell | ✅ `hematopoietic-stem-cell` |
| Skin Cell (Keratinocyte) | keratinocyte | ✅ `keratinocyte` |
| Leberzelle / Liver Cell | hepatocyte | ✅ `hepatocyte` |
| Kidney Cell (Podocyte) | podocyte | ✅ `podocyte` |
| Magenzelle (parietal cell) | gastric parietal cell | ✅ `parietal-cell` |
| Nerve Cell / Brain Cell (Neuron) | neuron | ✅ `neuron` |
| Glial Cell – Brain Support | generic glia | — catalogued (astrocyte/oligodendrocyte/microglia/Schwann cell) but deliberately unlinked; the plush is generic and depicts none of them specifically |
| Heart Cell (Cardiomyocyte) | cardiomyocyte | ✅ `cardiomyocyte` |
| Muscle Cell (Myocyte) | skeletal myocyte | — not catalogued as a generic myocyte (we do have type I / type IIa fibres, but no plush matches either specifically) |
| Sperm Cell (Spermatozoon) | spermatozoon | ✅ `spermatozoon` |
| Egg Cell (Human ovum) | ovum | ✅ `oocyte` |
| Bone Cell (Osteocyte) | osteocyte | ✅ `osteocyte` |
| Obesity (Fat Cell) | white adipocyte | ✅ `white-adipocyte` |
| Red Blood Cell (Erythrocyte) | erythrocyte | ✅ `erythrocyte` |
| Platelet (Thrombocyte) | thrombocyte | ✅ `thrombocyte` |
| Sickle Cell | sickle erythrocyte | ✅ `sickle-cell` |
| Killer T Cell | cytotoxic T cell | ✅ `cytotoxic-t-cell` |
| Macrophage | macrophage | ✅ `macrophage` |
| White Blood Cell (Leukocyte) | generic leukocyte | ✅ `white-blood-cell` |
| Diabetes Beta Cell with Insulin (β cell) | pancreatic β cell | ✅ `beta-cell` |
| Animal Cell | generic whole cell | ✅ `animal-cell` (closes the organelles set) |
| Plant Cell | generic whole cell | ✅ `plant-cell` (closes the organelles set) |
| Plasma (Blood plasma) | blood plasma — a fluid, not a cell | ✅ `blood-plasma` (in the red-blood set) |

Body-cell products we're deliberately *not* missing anything for: their one "Bone Cell" plush is an osteocyte (not osteoblast/osteoclast), their "Obesity" plush is the mature white adipocyte (not brown/beige fat, preadipocyte or lipoblast), their "White Blood Cell" is a generic leukocyte (not specifically the neutrophil we also catalogue), and Cells at Work!-branded reissues of the Killer T Cell / Platelet / Red Blood Cell / White Blood Cell are the same organisms already counted above, just a different merch line.

## Antibodies

| GIANTmicrobes product | Subject | In our atlas? |
| --- | --- | --- |
| Antibody (Immunoglobulin) | IgG-shaped monomer | ✅ `igg` |

GIANTmicrobes sells only the one antibody shape; our IgA/IgD/IgE/IgM entries have nothing to link to.

## Cancer

| GIANTmicrobes product | Subject | In our atlas? |
| --- | --- | --- |
| Cancer (Malignant neoplasm) | generic malignant neoplasm | ✅ `cancer-cell` |
| Bladder / Breast / Colorectal / Kidney / Leukemia / Lung / Lymphoma / Melanoma / Prostate Cancer | same species, body-site variants | — not linked individually (all 9 are the same "malignant neoplasm" concept the generic plush already covers) |

## Bacteria

| GIANTmicrobes product | Species | In our atlas? |
| --- | --- | --- |
| TB (Tuberculosis) | *Mycobacterium tuberculosis* | ✅ `mycobacterium-tuberculosis` |
| Staph | *Staphylococcus aureus* | ✅ `staphylococcus-aureus` |
| Pneumonia / Ear Ache | *Streptococcus pneumoniae* | ✅ `streptococcus-pneumoniae` |
| E. coli | *Escherichia coli* | ✅ `escherichia-coli` |
| Salmonella | *Salmonella typhimurium* | ✅ `salmonella-enterica` |
| Ulcer | *Helicobacter pylori* | ✅ `helicobacter-pylori` |
| Lyme Disease | *Borrelia burgdorferi* | ✅ `borrelia-burgdorferi` |
| C. Diff | *Clostridioides difficile* | ✅ `clostridioides-difficile` |
| Listeria | *Listeria monocytogenes* | ✅ `listeria-monocytogenes` |
| Cavity | *Streptococcus mutans* | ✅ `streptococcus-mutans` |
| Bifido *(helpful)* | *Bifidobacterium longum* | ✅ `bifidobacterium-longum` |
| Anthrax | *Bacillus anthracis* | — not catalogued |
| Bad Breath | *Porphyromonas gingivalis* | — not catalogued |
| Botulism | *Clostridium botulinum* | — not catalogued |
| Chlamydia | *Chlamydia trachomatis* | — we catalogue *Chlamydia felis* (a cat pathogen); different species in the same genus, so deliberately not linked |
| Cholera | *Vibrio cholerae* | — not catalogued |
| Clap / Gonorrhea | *Neisseria gonorrhoeae* | — not catalogued |
| Cough | *Bordetella pertussis* | — not catalogued |
| Diarrhea | *Campylobacter jejuni* | — not catalogued |
| Flesh Eating | *Streptococcus pyogenes* | — not catalogued |
| Food Poisoning | *Bacillus cereus* | — not catalogued |
| Gangrene | *Clostridium perfringens* | — not catalogued |
| Legionnaires' Disease | *Legionella pneumophila* | — not catalogued |
| Leprosy | *Mycobacterium leprae* | — not catalogued |
| Meningitis | *Neisseria meningitidis* | — not catalogued |
| Mycoplasma | *Mycoplasma genitalium* | — not catalogued |
| Pimple | *Propionibacterium acnes* | — not catalogued |
| Pseudomonas aeruginosa | *Pseudomonas aeruginosa* | — not catalogued |
| Sore Throat (DE-only, "Halsschmerzen") | *Streptococcus* sp. | — not catalogued |
| Stomach Ache (DE-only, "Magenschmerzen") | *Shigella* sp. | — not catalogued |
| Tetanus | *Clostridium tetani* | — not catalogued |
| Typhoid Fever | *Salmonella typhi* | — different species from our *S. typhimurium* entry, not linked |
| Acidophilus *(helpful)* | *Lactobacillus acidophilus* | — not catalogued |
| Yogurt *(helpful)* | *Lactobacillus bulgaricus* | — not catalogued |
| M. smithii *(helpful)* | *Methanobrevibacter smithii* (archaeon) | — not catalogued |
| Vibrio Fischeri *(helpful)* | *Vibrio fischeri* | — not catalogued |
| Geo, the Electric Microbe *(helpful)* | *Geobacter sulfurreducens* | — not catalogued |

## Viruses

| GIANTmicrobes product | Species | In our atlas? |
| --- | --- | --- |
| Flu | Orthomyxovirus (influenza) | ✅ `influenza-virus` |
| Coronavirus COVID-19 | SARS-CoV-2 | ✅ `coronavirus` / `sars-cov-2` |
| HIV | Human Immunodeficiency Virus | ✅ `hiv` |
| Measles | Morbillivirus | ✅ `measles-virus` |
| Rotavirus | Rotavirus | ✅ `rotavirus` |
| Common Cold | Rhinovirus | ✅ `rhinovirus` |
| Zika | Zika virus | ✅ `zika-virus` |
| Norovirus | Norovirus | ✅ `norovirus` |
| Chickenpox | Varicella-Zoster virus | ✅ `varicella-zoster-virus` |
| Rabies | Rabies virus | ✅ `rabies-virus` |
| Bird Flu | H5N1 | — not catalogued |
| Cold Sore | Herpes Simplex Virus 1 | — not catalogued |
| Dengue Fever | Dengue virus | — not catalogued |
| Ebola | Ebolavirus | ✅ `ebola-virus` |
| Hepatitis | Hepatitis **C** virus | — our atlas covers hepatitis **B**; different virus, deliberately not linked |
| Herpes | Herpes Simplex Virus 2 | — not catalogued |
| HPV | Human papillomavirus | — not catalogued |
| Kissing Disease (Mono) | Epstein-Barr virus | — not catalogued |
| MERS | MERS-CoV | — not catalogued |
| Monkeypox | Mpox virus | — not catalogued |
| Omicron | SARS-CoV-2 (variant SKU) | — same species as Coronavirus COVID-19 above, already ✅ |
| Polio | Poliovirus | — not catalogued |
| RSV | Respiratory syncytial virus | — not catalogued |
| Rubella | Rubella virus | — not catalogued |
| SARS | SARS-CoV-1 | — not catalogued |
| Shingles | Herpes zoster (= Varicella-Zoster) | — same virus as Chickenpox above, already ✅ |
| Smallpox | Variola virus | — not catalogued |
| Spanish Flu | H1N1 | — same family as our generic Flu entry, different strain, not linked |
| West Nile | West Nile virus | — not catalogued |
| Yellow Fever | Yellow Fever virus | — not catalogued |
| Zombie-Virus | *Pithovirus sibericum* (real permafrost-revived virus) | — not catalogued |

## Fungi

| GIANTmicrobes product | Species | In our atlas? |
| --- | --- | --- |
| Candida fungus | *Candida albicans* | ✅ `candida-albicans` |
| Penicillin *(helpful)* | *Penicillium chrysogenum* | ✅ `penicillium-chrysogenum` |
| Beer & Bread *(helpful)* | *Saccharomyces cerevisiae* | ✅ `saccharomyces-cerevisiae` |
| Athlete's Foot | *Trichophyton mentagrophytes* | — not catalogued |
| Ringworm | dermatophyte fungus (unspecified) | — not catalogued |
| Toxic Mold | *Stachybotrys chartarum* | — not catalogued |

## Protozoa & other single-celled parasites

| GIANTmicrobes product | Species | In our atlas? |
| --- | --- | --- |
| Sleeping Sickness | *Trypanosoma brucei* | ✅ `parasite` |
| Amoeba | *Amoeba proteus* | ✅ `amoeba-proteus` |
| Malaria | *Plasmodium falciparum* | ✅ `plasmodium` |
| Giardia | *Giardia lamblia* | ✅ `giardia-lamblia` |
| Babesia | *Babesia microti* | — not catalogued |
| Chagas | *Trypanosoma cruzi* | — different species from our *T. brucei* entry, not linked |
| Leishmania | *Leishmania tropica* | — not catalogued |
| Toxoplasmosis | *Toxoplasma gondii* | — not catalogued (would fit "pathogens of cats and dogs") |
| Trichomoniasis | *Trichomonas vaginalis* | — not catalogued |

## Prions

| GIANTmicrobes product | Subject | In our atlas? |
| --- | --- | --- |
| Mad Cow (BSE) | prion | ✅ `prion` |

## Not alive at all

| GIANTmicrobes product | Subject | In our atlas? |
| --- | --- | --- |
| Leben vom Mars ("Life on Mars?") | *ALH 84001* — the claimed Martian nanofossil | ✅ `alh-84001` (closes the atlas as its own set) |

The plush depicts the segmented shape from the 1996 SEM images. Our entry links it because both are about the same object, while being explicit that every one of the four claimed biosignatures now has a non-biological explanation — the meteorite is genuine Martian rock, the evidence of life in it is not.

## Bacteriophages

| GIANTmicrobes product | Subject | In our atlas? |
| --- | --- | --- |
| T4 | T4 bacteriophage | ✅ `t4-bacteriophage` |

T4 is the only phage GIANTmicrobes has ever sold, and we already have it — the gap here is entirely on our side (2 of our 3 catalogued phages have no render yet, see `OVERVIEW.md`), not theirs.

## Arthropods & worms (parasites of pets and people)

Ticks, mites, lice and worms GIANTmicrobes sells that overlap with our "pathogens of cats and dogs" chapter or with human parasitology:

| GIANTmicrobes product | Species | In our atlas? |
| --- | --- | --- |
| Tick | *Ixodes scapularis* | ✅ `tick` |
| Heartworm | *Dirofilaria immitis* | ✅ `heartworm` |
| Bed Bug | *Cimex lectularius* | — not catalogued |
| Crab Louse | *Pthirus pubis* | — not catalogued |
| Dust Mite | *Dermatophagoides pteronyssinus* | — not catalogued |
| Flea | *Ctenocephalides felis* | — not catalogued |
| Head Louse | *Pediculus capitis* | — not catalogued |
| Mange Mite | *Sarcoptes scabiei* | — not catalogued |
| Tapeworm | *Taenia ovis* | ✅ `tapeworm` |

## Not compared — out of scope

These GIANTmicrobes products aren't "have / don't have" candidates at all, because our atlas doesn't model this kind of subject and isn't meant to:

- **Whole organs** — Appendix, Bladder, Brain, Colon, Eye, Gallbladder, Heart, Inner Ear, Kidney, Liver, Lung, Pancreas, Placenta, Spine, Spleen, Stomach, Testicles, Thyroid, Tooth, Uterus. Our atlas catalogues *cells*, not the organs built from them.
- **Hormones & neurotransmitters** — Adrenaline, Alcohol, Caffeine, Chocolate/Theobromine, Cortisol, Dopamine, Endorphin, Estrogen, Oxytocin, Serotonin, Testosterone, THC, Vitamin C. Molecules, not organisms or cells.
- **Disease conditions with no single organism** — Acid Reflux, ADHD, Anxiety, Arthritis, Asthma, Autism, Back Pain, Bipolar, Broken Bone, Celiac Disease, Crohn's & Colitis, Depression, Endometriosis, Gallstone, Graves' Disease, Hashimoto's, Hemorrhoid, Hip/Knee Replacement, Insomnia, Irritable Bowel Syndrome, Kidney Stone, Liver Disease (Cirrhosis), Migraine, Psoriasis.
- **Bodily substances** — Booger, Earwax, Fart, Pee, Poop, Pus, Scab. (Blood plasma graduated out of this bucket into the atlas in 2026-09.)
- **Developmental stages, not cells** — Fetus, Placenta.
- **Historical-figure dolls & puppets** — Charles Darwin, Charles Darwin Candle, Curie, Da Vinci, Leeuwenhoek Glass.
- **Board games, kits & novelty prints** — Geekopoly, Healthopoly, Cytosis Biology Game, DoughLab Kit, Glo Germ Kit, Brain Dictionary Print, Face Art Print, History of Life Card/Poster, Journey Into the Body.
- **Gift bundles, seasonal ornaments & mascot novelties with no single organism** — the various Geschenkbox/gift-box sets, Vaccine Packs, Broken Heart, Feeling Good Medal, Sick Day, Wellness Medal, Football Fever, Blind Date, and similar.
- **Non-microbial wildlife & pest novelties** — Black Ant, Bookworm, C. elegans, Cockroach, Copepod, Euglena, Fruit Fly, House Fly, House Mouse, Krill, Lab Mice, Leech, Minnow, Norway Rat, Paramecium, Plankton, Termite, Trilobite, Waterbear (Tardigrade) and various algae (Anabaena, Alexandrium tamarense, Noctiluca scintillans). Real organisms, but outside a human-body-and-its-pathogens atlas.

## Summary

- **64 exact matches** between the two catalogues (the full count in `microbe_giant.py`'s `GIANT` dict; grew from 52 in 2026-09 as podocyte, parietal cell, beta cell, animal cell, plant cell, blood plasma, tapeworm and Ebola were added to the atlas).
- **69 additional named pathogens/cells** GIANTmicrobes sells that this atlas doesn't catalogue (or catalogues but can't link) at all — 26 bacteria, 18 viruses, 3 fungi, 5 protozoa, 6 arthropods/worms, 2 human cells (the generic Glial Cell and generic Muscle Cell, both deliberately unlinked from our specific entries) and 9 site-specific cancer variants — concentrated in bacteria and viruses, which is expected since GIANTmicrobes' whole catalogue is bigger than any one chapter of a teaching atlas.
- The reverse gaps (things we catalogue that GIANTmicrobes has no exact plush for) are already tracked in `microbe_giant.py`'s own exclusion notes, not repeated here.
