"""Approximate size (µm, characteristic diameter/length) and mass per particle
for every microbe key, used to draw the little scale meter under each card
title. These are representative textbook-level ballpark figures for teaching
purposes (real cells vary a lot even within one type) — not measurements of
any specific rendered specimen.

weight_unit is whatever's the natural convention for that kind of particle:
cells/organelles in fg/pg/ng (mass), antibodies in kDa (molecular weight,
since a single antibody is a molecule, not a cell). build_viewer.py converts
everything to an equivalent-picogram figure just to bucket into a weight
class for color-coding (weights span ~15 orders of magnitude across this
dataset, from a prion protein to a human egg cell, so a linear/second bar
would be useless — see viewer.template.html's scale meter for how the class
maps to a color).

size_um max reference: human oocyte (egg cell) ~120 µm is the largest human
cell here and doubles as the fixed scale-bar ceiling in the viewer.
"""

# key -> (size_um, weight_val, weight_unit)
SCALE = {
    # -- stem-cells --------------------------------------------------------
    "embryonic-stem-cell": (15, 1, "ng"),
    "induced-pluripotent-stem-cell": (15, 1, "ng"),
    "hematopoietic-stem-cell": (8, 0.3, "ng"),
    "mesenchymal-stem-cell": (20, 2, "ng"),
    "neural-stem-cell": (12, 1, "ng"),
    "endothelial-progenitor-cell": (15, 1, "ng"),
    # -- epithelial ----------------------------------------------------
    "keratinocyte": (25, 4, "ng"),
    "enterocyte": (20, 3, "ng"),
    "goblet-cell": (20, 3, "ng"),
    "paneth-cell": (15, 2, "ng"),
    "alveolar-cell-type-ii": (10, 1, "ng"),
    "urothelial-cell": (100, 15, "ng"),
    # -- nerve-cells ---------------------------------------------------
    "neuron": (20, 2, "ng"),
    "motor-neuron": (80, 20, "ng"),
    "astrocyte": (15, 1.5, "ng"),
    "oligodendrocyte": (15, 1.5, "ng"),
    "microglia": (10, 0.5, "ng"),
    "schwann-cell": (15, 1.5, "ng"),
    # -- reproductive ----------------------------------------------------
    "spermatozoon": (5, 5, "pg"),
    "oocyte": (120, 900, "ng"),
    "sertoli-cell": (50, 10, "ng"),
    "leydig-cell": (18, 1.5, "ng"),
    "granulosa-cell": (13, 1.2, "ng"),
    "theca-cell": (13, 1.2, "ng"),
    # -- bone-cells ------------------------------------------------------
    "osteoblast": (25, 3, "ng"),
    "osteoclast": (80, 15, "ng"),
    "osteocyte": (10, 1, "ng"),
    "chondrocyte": (15, 2, "ng"),
    "tenocyte": (30, 3, "ng"),
    "fibroblast": (25, 3, "ng"),
    # -- fat-cells -------------------------------------------------------
    "white-adipocyte": (100, 470, "ng"),
    "brown-adipocyte": (25, 3, "ng"),
    "beige-adipocyte": (25, 3, "ng"),
    "preadipocyte": (15, 1.5, "ng"),
    "lipoblast": (12, 1, "ng"),
    "adipogenic-progenitor": (12, 1.2, "ng"),
    # -- red-blood -------------------------------------------------------
    "erythrocyte": (7.5, 27, "pg"),
    "reticulocyte": (8.5, 30, "pg"),
    "erythroblast": (14, 35, "pg"),
    "megakaryocyte": (80, 15, "ng"),
    "thrombocyte": (2.5, 7, "pg"),
    "sickle-cell": (8, 25, "pg"),
    # -- immune-cells ------------------------------------------------------
    "helper-t-cell": (8, 200, "pg"),
    "cytotoxic-t-cell": (8, 200, "pg"),
    "b-cell": (8, 220, "pg"),
    "natural-killer-cell": (12, 350, "pg"),
    "macrophage": (30, 6, "ng"),
    "neutrophil": (11, 300, "pg"),
    # -- antibodies (molecules, not cells — weight in kDa) ----------------
    "igg": (0.01, 150, "kDa"),
    "iga": (0.02, 385, "kDa"),
    "igm": (0.035, 950, "kDa"),
    "igd": (0.01, 180, "kDa"),
    "ige": (0.01, 190, "kDa"),
    # -- pathogens (generic exemplars) ------------------------------------
    "cocci": (1, 0.5, "pg"),
    "virus": (0.1, 1, "fg"),
    "fungus": (5, 40, "pg"),
    "parasite": (20, 20, "pg"),
    "prion": (0.005, 35, "kDa"),
    "coronavirus": (0.12, 1.2, "fg"),
    "rod-bacterium": (3, 1, "pg"),
    # -- pathogens-bacteria ------------------------------------------------
    "mycobacterium-tuberculosis": (3, 0.5, "pg"),
    "staphylococcus-aureus": (1, 0.3, "pg"),
    "streptococcus-pneumoniae": (1, 0.3, "pg"),
    "escherichia-coli": (2, 1, "pg"),
    "salmonella-enterica": (2.5, 1, "pg"),
    "helicobacter-pylori": (3, 0.5, "pg"),
    # -- pathogens-viruses ---------------------------------------------------
    "influenza-virus": (0.1, 1, "fg"),
    "sars-cov-2": (0.12, 1, "fg"),
    "hiv": (0.13, 1.5, "fg"),
    "hepatitis-b-virus": (0.042, 0.3, "fg"),
    "plasmodium": (2, 1, "pg"),
    "candida-albicans": (5, 40, "pg"),

    # --- heart cells -------------------------------------------------------
    'pacemaker-cell': (25, 1.5, 'ng'),
    'purkinje-fibre': (80, 15, 'ng'),
    'cardiomyocyte': (100, 60, 'ng'),
    'cardiac-macrophage': (25, 5, 'ng'),
    'intracardiac-neuron': (30, 3, 'ng'),
    # --- helpful microbes --------------------------------------------------
    'saccharomyces-cerevisiae': (5, 60, 'pg'),
    'penicillium-chrysogenum': (3.5, 20, 'pg'),
    'bifidobacterium-longum': (3, 1.5, 'pg'),
    # --- added bacteria ----------------------------------------------------
    'streptococcus-mutans': (0.8, 1, 'pg'),
    'borrelia-burgdorferi': (20, 0.3, 'pg'),
    'clostridioides-difficile': (5, 3, 'pg'),
    'listeria-monocytogenes': (2, 1, 'pg'),
    # --- added viruses & eukaryotes ----------------------------------------
    'rhinovirus': (0.03, 0.3, 'fg'),
    'zika-virus': (0.045, 0.8, 'fg'),
    'measles-virus': (0.2, 8, 'fg'),
    'rotavirus': (0.075, 1.5, 'fg'),
    'norovirus': (0.038, 0.5, 'fg'),
    'varicella-zoster-virus': (0.18, 6, 'fg'),
    'giardia-lamblia': (12, 1, 'ng'),
    # Amoeba proteus is the one entry that overshoots the 120 µm bar ceiling
    # (it is visible to the naked eye); the bar pins to full and the printed
    # figure carries the real size.
    'amoeba-proteus': (400, 30_000, 'ng'),
    # --- organelles & added cells -------------------------------------------
    'golgi-apparatus': (2, 2, 'pg'),
    'hepatocyte': (25, 15, 'ng'),
    # A generic figure: "cancer cell" spans every tissue, so this is a typical
    # carcinoma cell, larger than the epithelium it came from as the nucleus
    # swells and the nucleus-to-cytoplasm ratio shifts.
    'cancer-cell': (20, 4, 'ng'),
    # The umbrella entry sits between the small lymphocyte (~7 µm) and the
    # monocyte (~20 µm) it covers.
    'white-blood-cell': (12, 500, 'pg'),
    # The atlas's only animal, and by far its largest subject: an unfed adult
    # Ixodes is a few millimetres, so like amoeba-proteus it pins the bar to
    # full and the printed figure carries the real size. Engorged females reach
    # 10 mm and several hundred mg.
    'tick': (3000, 3, 'mg'),
}

# grams-per-unit, for converting to a common picogram scale for color-coding
_UNIT_TO_PG = {
    "fg": 1e-3,
    "pg": 1.0,
    "ng": 1e3,
    "µg": 1e6,
    "mg": 1e9,   # the tick is the only subject heavy enough to need this
    "kDa": 1.6605e-9,  # 1 Da = 1.6605e-24 g = 1.6605e-12 pg -> *1000 for kDa
}


def weight_pg(val: float, unit: str) -> float:
    return val * _UNIT_TO_PG[unit]


def weight_class(pg: float) -> int:
    """1 (lightest, molecular) .. 5 (heaviest, egg cell) — thresholds chosen so
    the fixed dataset above spreads across all five buckets meaningfully."""
    if pg < 1:
        return 1
    if pg < 10:
        return 2
    if pg < 5_000:
        return 3
    if pg < 50_000:
        return 4
    return 5
