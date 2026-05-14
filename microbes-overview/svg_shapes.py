"""SVG shape library for the microbes-overview poster.

Architecture
------------
Each cell type defines ONE *geometry* — a body silhouette plus optional
nucleus / accents — using a 100x100 viewBox. That single geometry is then
rendered three times by the wrappers below, sharing the exact same body so
all three views read as the same cell:

* ``_frame_micro``  — rose H&E "pathology slide" with ghost context cells
  and granular speckling.
* ``_frame_flat``   — dark navy "Kurzgesagt"-style infographic with corner
  sparkles and a soft white highlight on the body.
* ``_frame_kids``   — cream / peach panel with cartoon eyes + smile stamped
  over the body centroid.

Public functions keep the original names imported by ``cells_data.py`` so the
data file does not need to change.
"""
from __future__ import annotations
import math
import random


# --------------------------------------------------------------------------- #
# Style palettes
# --------------------------------------------------------------------------- #
# Three style "atmospheres" × two kinds (immune cell vs pathogen).
# Each palette gives the colours that geometry functions plug into the body /
# nucleus / accent slots so the same shape can be re-coloured per style.
PALETTES = {
    "micro": {
        "cell":     {"body": "#c2b2cc", "nucleus": "#6a4a7a", "accent1": "#e8702a",
                     "accent2": "#9c8aa8", "outline": "#8a6a92"},
        "pathogen": {"body": "#88a4b0", "nucleus": "#5d7a86", "accent1": "#6f8f9c",
                     "accent2": "#a8b8c0", "outline": "#5d7a86"},
    },
    "flat": {
        "cell":     {"body": "#3d8fd4", "nucleus": "#1f5f9c", "accent1": "#ff8a3d",
                     "accent2": "#bfe0ff", "outline": "#1f5f9c"},
        "pathogen": {"body": "#e0413a", "nucleus": "#9c241d", "accent1": "#ff6b5e",
                     "accent2": "#ffd0cc", "outline": "#9c241d"},
    },
    "kids": {
        "cell":     {"body": "#8fc4ee", "nucleus": "#5b9bd0", "accent1": "#5fc4bc",
                     "accent2": "#cfe6f8", "outline": "#33323a"},
        "pathogen": {"body": "#ee8e86", "nucleus": "#c46862", "accent1": "#f3b6b0",
                     "accent2": "#fcd9d6", "outline": "#33323a"},
    },
}


# --------------------------------------------------------------------------- #
# Frame wrappers (style-specific backdrop + ambience)
# --------------------------------------------------------------------------- #
_seed_counter = [0]


def _next_seed() -> int:
    _seed_counter[0] += 1
    return _seed_counter[0]


def _frame_micro(inner: str, seed: int) -> str:
    """Pink H&E pathology slide with out-of-focus context cells and speckling."""
    rng = random.Random(seed)
    ghosts = []
    # 4 ghost context cells in the corners (avoid centre area where focus cell lives)
    for cx, cy in [(rng.uniform(8, 28), rng.uniform(10, 35)),
                   (rng.uniform(72, 92), rng.uniform(8, 30)),
                   (rng.uniform(8, 30), rng.uniform(70, 92)),
                   (rng.uniform(70, 92), rng.uniform(72, 92))]:
        r = rng.uniform(8, 13)
        ghosts.append(
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#d98a93" opacity="0.30"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r * 0.55:.1f}" fill="#e7d3df" opacity="0.55"/>'
        )
    # ~50 fine speckles scattered everywhere
    speckles = []
    for _ in range(55):
        sx, sy = rng.uniform(2, 98), rng.uniform(2, 98)
        sr = rng.uniform(0.7, 1.5)
        speckles.append(
            f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{sr:.1f}" fill="#e7a9b6" opacity="0.55"/>'
        )
    return (
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" '
        'preserveAspectRatio="xMidYMid meet">'
        f'<defs><radialGradient id="rb{seed}" cx="50%" cy="45%" r="70%">'
        '<stop offset="0%" stop-color="#f7eef2"/>'
        '<stop offset="100%" stop-color="#e7d3df"/>'
        '</radialGradient></defs>'
        f'<rect width="100" height="100" fill="url(#rb{seed})"/>'
        + "".join(ghosts) + "".join(speckles) + inner +
        '</svg>'
    )


def _frame_flat(inner: str, seed: int, highlight=(38, 40, 4.0)) -> str:
    """Dark navy infographic with corner sparkles and an off-centre highlight."""
    hx, hy, hr = highlight
    return (
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" '
        'preserveAspectRatio="xMidYMid meet">'
        f'<defs><radialGradient id="kb{seed}" cx="50%" cy="42%" r="75%">'
        '<stop offset="0%" stop-color="#24405c"/>'
        '<stop offset="100%" stop-color="#101d2e"/>'
        '</radialGradient></defs>'
        f'<rect width="100" height="100" fill="url(#kb{seed})"/>'
        '<circle cx="16" cy="18" r="0.9" fill="#fff" opacity="0.7"/>'
        '<circle cx="83" cy="14" r="0.7" fill="#fff" opacity="0.6"/>'
        '<circle cx="88" cy="78" r="0.8" fill="#fff" opacity="0.6"/>'
        '<circle cx="12" cy="83" r="0.7" fill="#fff" opacity="0.5"/>'
        + inner +
        f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="#fff" opacity="0.30"/>'
        '</svg>'
    )


def _frame_kids(inner: str, seed: int, face=(50, 50, 1.0), no_face=False) -> str:
    """Cream/peach kids style with cartoon face stamped over the body."""
    fx, fy, fs = face
    face_svg = "" if no_face else _face(fx, fy, fs)
    return (
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" '
        'preserveAspectRatio="xMidYMid meet">'
        f'<defs><linearGradient id="kd{seed}" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0%" stop-color="#fff9ec"/>'
        '<stop offset="100%" stop-color="#ffe9cf"/>'
        '</linearGradient></defs>'
        f'<rect width="100" height="100" fill="url(#kd{seed})"/>'
        + inner + face_svg +
        '</svg>'
    )


def _face(cx: float, cy: float, scale: float = 1.0) -> str:
    """Big cartoon eyes (white sclera + dark pupil + catchlight) and a smile."""
    s = scale
    eye_r = 5.5 * s
    pupil_r = 2.9 * s
    spark_r = 1.0 * s
    eye_off = 8 * s
    eye_y = cy - 2 * s
    return (
        f'<circle cx="{cx - eye_off:.2f}" cy="{eye_y:.2f}" r="{eye_r:.2f}" '
        f'fill="#fff" stroke="#33323a" stroke-width="0.9"/>'
        f'<circle cx="{cx - eye_off + 0.5:.2f}" cy="{eye_y + 0.6:.2f}" '
        f'r="{pupil_r:.2f}" fill="#33323a"/>'
        f'<circle cx="{cx - eye_off - 0.6:.2f}" cy="{eye_y - 0.5:.2f}" '
        f'r="{spark_r:.2f}" fill="#fff"/>'
        f'<circle cx="{cx + eye_off:.2f}" cy="{eye_y:.2f}" r="{eye_r:.2f}" '
        f'fill="#fff" stroke="#33323a" stroke-width="0.9"/>'
        f'<circle cx="{cx + eye_off + 0.5:.2f}" cy="{eye_y + 0.6:.2f}" '
        f'r="{pupil_r:.2f}" fill="#33323a"/>'
        f'<circle cx="{cx + eye_off - 0.6:.2f}" cy="{eye_y - 0.5:.2f}" '
        f'r="{spark_r:.2f}" fill="#fff"/>'
        f'<path d="M {cx - 5 * s:.2f} {cy + 7 * s:.2f} '
        f'Q {cx:.2f} {cy + 12 * s:.2f} {cx + 5 * s:.2f} {cy + 7 * s:.2f}" '
        f'stroke="#33323a" stroke-width="1" fill="none" stroke-linecap="round"/>'
    )


# --------------------------------------------------------------------------- #
# Master render helper
# --------------------------------------------------------------------------- #

def _render(geom, kind="cell", face=(50, 50, 1.0), no_face=False,
            highlight=None, **kwargs):
    """Render the same geometry through all three style frames.

    ``geom`` is a callable ``(palette_dict, style_name, **kwargs) -> svg_str``.
    """
    seed = _next_seed()
    if highlight is None:
        # default: small white blob upper-left of the face point
        highlight = (face[0] - 12, face[1] - 10, 3.5 * face[2])
    micro_inner = geom(PALETTES["micro"][kind], "micro", **kwargs)
    flat_inner  = geom(PALETTES["flat"][kind],  "flat",  **kwargs)
    kids_inner  = geom(PALETTES["kids"][kind],  "kids",  **kwargs)
    return (
        _frame_micro(micro_inner, seed),
        _frame_flat(flat_inner, seed, highlight=highlight),
        _frame_kids(kids_inner, seed, face=face, no_face=no_face),
    )


# --------------------------------------------------------------------------- #
# Per-cell geometries + public wrappers (names match those imported by
# cells_data.py, so the data module does not need to change).
# --------------------------------------------------------------------------- #

# ----- generic round mononuclear cell --------------------------------------
def _g_round(p, style, radius=30, nucleus_r=22, nucleus_off=(-2, -1)):
    nx, ny = 50 + nucleus_off[0], 50 + nucleus_off[1]
    return (
        f'<circle cx="50" cy="50" r="{radius}" fill="{p["body"]}"/>'
        f'<circle cx="{nx:.1f}" cy="{ny:.1f}" r="{nucleus_r}" fill="{p["nucleus"]}"/>'
    )


def round_with_nucleus(palette):
    """Lymphocyte-style cell with a single large round nucleus."""
    nucleus_r = palette.get("nr", 22)
    # support old absolute units (220 viewBox) → new (100 viewBox) by scaling
    if nucleus_r > 30:
        nucleus_r = int(nucleus_r * 100 / 220)
    radius = palette.get("r", 30)
    if radius > 35:
        radius = int(radius * 100 / 220)
    nucleus_off = palette.get("noff", (-2, -1))
    if abs(nucleus_off[0]) > 6 or abs(nucleus_off[1]) > 6:
        nucleus_off = (nucleus_off[0] * 100 // 220, nucleus_off[1] * 100 // 220)
    return _render(_g_round, "cell",
                   face=(50, 50, 0.95),
                   radius=radius, nucleus_r=nucleus_r, nucleus_off=nucleus_off)


# ----- multi-lobed nucleus (granulocyte) -----------------------------------
def _g_granulocyte(p, style, lobes=3, granule_color=None):
    layouts = {
        2: [(40, 50), (60, 50)],
        3: [(36, 56), (50, 38), (64, 56)],
        4: [(34, 56), (44, 38), (56, 38), (66, 56)],
    }
    pts = layouts.get(lobes, layouts[3])
    parts = [f'<circle cx="50" cy="50" r="30" fill="{p["body"]}"/>']
    # connecting strands between lobes
    for i in range(len(pts) - 1):
        x1, y1 = pts[i]
        x2, y2 = pts[i + 1]
        parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{p["nucleus"]}" stroke-width="6" stroke-linecap="round"/>'
        )
    # lobes themselves
    for x, y in pts:
        parts.append(
            f'<ellipse cx="{x}" cy="{y}" rx="9" ry="7" fill="{p["nucleus"]}"/>'
        )
    # granules
    g = granule_color or p["accent1"]
    rng = random.Random(lobes * 17 + (1 if style == "kids" else 0))
    n_grain = 0 if style == "kids" else 18
    for _ in range(n_grain):
        ang = rng.uniform(0, 2 * math.pi)
        rad = rng.uniform(8, 26)
        gx = 50 + rad * math.cos(ang)
        gy = 50 + rad * math.sin(ang)
        parts.append(
            f'<circle cx="{gx:.1f}" cy="{gy:.1f}" r="1.4" fill="{g}" opacity="0.85"/>'
        )
    return "".join(parts)


def multi_lobed_nucleus(palette):
    lobes = palette.get("lobes", 3)
    granule = palette.get("flat_grain")  # legacy hint to color the granules
    return _render(_g_granulocyte, "cell",
                   face=(50, 50, 0.85),
                   lobes=lobes, granule_color=None)


# ----- dendritic / branched (DC, astrocyte, oligo, microglia) --------------
def _g_dendritic(p, style, arms=8):
    parts = []
    for i in range(arms):
        ang = i * (2 * math.pi / arms)
        x1, y1 = 50 + 18 * math.cos(ang), 50 + 18 * math.sin(ang)
        x2, y2 = 50 + 44 * math.cos(ang), 50 + 44 * math.sin(ang)
        parts.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{p["body"]}" stroke-width="4.5" stroke-linecap="round"/>'
        )
        # forks
        x3 = x2 + 5 * math.cos(ang + 0.6)
        y3 = y2 + 5 * math.sin(ang + 0.6)
        x4 = x2 + 5 * math.cos(ang - 0.6)
        y4 = y2 + 5 * math.sin(ang - 0.6)
        parts.append(
            f'<line x1="{x2:.1f}" y1="{y2:.1f}" x2="{x3:.1f}" y2="{y3:.1f}" '
            f'stroke="{p["body"]}" stroke-width="2.5" stroke-linecap="round"/>'
            f'<line x1="{x2:.1f}" y1="{y2:.1f}" x2="{x4:.1f}" y2="{y4:.1f}" '
            f'stroke="{p["body"]}" stroke-width="2.5" stroke-linecap="round"/>'
        )
    parts.append(f'<circle cx="50" cy="50" r="18" fill="{p["body"]}"/>')
    parts.append(f'<circle cx="48" cy="49" r="11" fill="{p["nucleus"]}"/>')
    return "".join(parts)


def dendritic_shape(palette):
    arms = palette.get("arms", 8)
    return _render(_g_dendritic, "cell",
                   face=(50, 50, 0.8), arms=arms)


# ----- ameboid (macrophage with pseudopods) --------------------------------
_AMEBOID_PATH = (
    "M50 16 Q60 20 58 30 Q70 24 76 33 Q82 42 72 48 Q84 54 78 64 Q72 75 62 70 "
    "Q60 82 50 80 Q40 84 36 73 Q26 78 22 67 Q16 57 26 51 Q14 45 20 35 "
    "Q26 24 38 29 Q40 17 50 16 Z"
)
_AMEBOID_NUCLEUS = (
    "M40 40 Q54 32 62 42 Q70 52 60 58 Q50 52 44 58 Q37 52 40 40 Z"
)


def _g_ameboid(p, style):
    parts = [
        f'<path d="{_AMEBOID_PATH}" fill="{p["body"]}"/>',
        f'<path d="{_AMEBOID_NUCLEUS}" fill="{p["nucleus"]}"/>',
        f'<circle cx="60" cy="62" r="5" fill="{p["accent2"]}" opacity="0.7"/>',
        f'<circle cx="40" cy="60" r="3.4" fill="{p["accent2"]}" opacity="0.7"/>',
    ]
    if style != "kids":
        parts.append(f'<circle cx="62" cy="46" r="2.6" fill="{p["accent1"]}"/>')
    return "".join(parts)


def ameboid_shape(palette):
    return _render(_g_ameboid, "cell", face=(48, 50, 0.85))


# ----- biconcave disc (erythrocyte) ----------------------------------------
def _g_biconcave(p, style):
    return (
        f'<ellipse cx="50" cy="50" rx="34" ry="29" fill="{p["body"]}"/>'
        f'<ellipse cx="50" cy="50" rx="14" ry="11" fill="{p["nucleus"]}" opacity="0.6"/>'
    )


def biconcave_disc(palette):
    return _render(_g_biconcave, "cell", face=(50, 50, 0.9),
                   highlight=(38, 40, 5))


# ----- platelet ------------------------------------------------------------
def _g_platelet(p, style):
    path = "M30 50 Q28 36 50 32 Q72 36 70 50 Q72 64 50 68 Q28 64 30 50 Z"
    parts = [f'<path d="{path}" fill="{p["body"]}"/>']
    if style != "kids":
        for x, y in [(42, 45), (54, 50), (48, 58), (40, 53)]:
            parts.append(f'<circle cx="{x}" cy="{y}" r="2" fill="{p["nucleus"]}" opacity="0.7"/>')
    return "".join(parts)


def platelet_shape(palette):
    return _render(_g_platelet, "cell", face=(50, 50, 0.7))


# ----- neuron --------------------------------------------------------------
def _g_neuron(p, style):
    dendrites = [
        "M 50 36 L 30 14",
        "M 50 36 L 50 8",
        "M 50 36 L 70 14",
        "M 42 42 L 16 30",
        "M 58 42 L 84 30",
    ]
    axon = "M 50 64 C 50 78, 76 84, 92 92"
    terminals = [(89, 92), (93, 86), (94, 94)]
    parts = []
    for d in dendrites:
        parts.append(
            f'<path d="{d}" stroke="{p["body"]}" stroke-width="3.5" '
            f'fill="none" stroke-linecap="round"/>'
        )
    parts.append(f'<circle cx="50" cy="50" r="16" fill="{p["body"]}"/>')
    parts.append(f'<circle cx="49" cy="49" r="7" fill="{p["nucleus"]}"/>')
    parts.append(
        f'<path d="{axon}" stroke="{p["body"]}" stroke-width="3.5" '
        f'fill="none" stroke-linecap="round"/>'
    )
    for x, y in terminals:
        parts.append(f'<circle cx="{x}" cy="{y}" r="2.4" fill="{p["body"]}"/>')
    return "".join(parts)


def neuron_shape(palette):
    return _render(_g_neuron, "cell", face=(50, 50, 0.7))


# ----- icosahedral virus ---------------------------------------------------
def _g_virus(p, style):
    spike_color = "#b83229" if style == "flat" else (
        "#ef9a93" if style == "kids" else p["accent1"]
    )
    spike_tip = p["accent1"]
    parts = []
    for i in range(12):
        ang = i * (2 * math.pi / 12)
        x1 = 50 + 22 * math.cos(ang)
        y1 = 50 + 22 * math.sin(ang)
        x2 = 50 + 32 * math.cos(ang)
        y2 = 50 + 32 * math.sin(ang)
        sw = 3.0 if style == "flat" else 2.4
        if style == "kids":
            sw = 3.2
        parts.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{spike_color}" stroke-width="{sw}" stroke-linecap="round"/>'
        )
        if style != "micro":
            parts.append(f'<circle cx="{x2:.1f}" cy="{y2:.1f}" r="3" fill="{spike_tip}"/>')
        else:
            parts.append(f'<circle cx="{x2:.1f}" cy="{y2:.1f}" r="2.5" fill="{p["nucleus"]}"/>')
    parts.append(f'<circle cx="50" cy="50" r="22" fill="{p["body"]}"/>')
    if style == "flat":
        parts.append(f'<circle cx="50" cy="50" r="10" fill="{p["nucleus"]}"/>')
    elif style == "micro":
        # genome speckles
        rng = random.Random(7)
        for _ in range(12):
            sx = 50 + rng.uniform(-15, 15)
            sy = 50 + rng.uniform(-15, 15)
            parts.append(
                f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="1.8" '
                f'fill="{p["nucleus"]}" opacity="0.6"/>'
            )
    return "".join(parts)


def virus_icosahedral(palette):
    return _render(_g_virus, "pathogen", face=(50, 52, 0.7))


# ----- cocci ---------------------------------------------------------------
def _g_cocci(p, style):
    pos = [(36, 36), (52, 30), (66, 38), (32, 54), (50, 50),
           (66, 56), (40, 70), (58, 66)]
    if style == "kids":
        # only three big ones in kids view, others tucked behind
        pos = [(35, 38), (62, 38), (50, 62)]
    parts = []
    for x, y in pos:
        parts.append(f'<circle cx="{x}" cy="{y}" r="9" fill="{p["body"]}"/>')
        if style == "flat":
            parts.append(f'<circle cx="{x - 2}" cy="{y - 2}" r="2.5" fill="{p["accent2"]}" opacity="0.6"/>')
    return "".join(parts)


def bacteria_cocci(palette):
    # Kids face: pick the bottom centre coccus to host the face
    return _render(_g_cocci, "pathogen", face=(50, 62, 0.55),
                   highlight=(33, 33, 3))


# ----- rod bacteria --------------------------------------------------------
def _g_rod(p, style):
    rods = [(20, 35, 60, 14), (28, 56, 56, 12)]
    if style == "kids":
        rods = [(18, 38, 64, 22)]
    parts = []
    for x, y, w, h in rods:
        parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h // 2}" '
            f'fill="{p["body"]}"/>'
        )
        if style == "flat":
            parts.append(
                f'<rect x="{x + 6}" y="{y + 4}" width="{w - 14}" height="3" '
                f'rx="1.5" fill="{p["accent2"]}" opacity="0.6"/>'
            )
    return "".join(parts)


def bacteria_rod(palette):
    return _render(_g_rod, "pathogen", face=(50, 49, 0.75),
                   highlight=(33, 30, 3))


# ----- fungus (yeast + buds + hyphae) --------------------------------------
def _g_fungus(p, style):
    # main yeast cell + buds branching off
    parts = [
        f'<circle cx="38" cy="55" r="18" fill="{p["body"]}"/>',
        f'<circle cx="62" cy="38" r="12" fill="{p["body"]}"/>',
        f'<circle cx="74" cy="62" r="9" fill="{p["body"]}"/>',
        f'<line x1="38" y1="55" x2="62" y2="38" stroke="{p["body"]}" stroke-width="4"/>',
        f'<line x1="62" y1="38" x2="74" y2="62" stroke="{p["body"]}" stroke-width="3.5"/>',
    ]
    if style == "flat":
        parts.append(f'<circle cx="34" cy="50" r="3.5" fill="{p["accent2"]}" opacity="0.6"/>')
        parts.append(f'<circle cx="60" cy="35" r="2.5" fill="{p["accent2"]}" opacity="0.6"/>')
    elif style == "micro":
        parts.append(f'<circle cx="38" cy="55" r="6" fill="{p["nucleus"]}" opacity="0.6"/>')
        parts.append(f'<circle cx="62" cy="38" r="4" fill="{p["nucleus"]}" opacity="0.6"/>')
    return "".join(parts)


def fungus_hyphae(palette):
    return _render(_g_fungus, "pathogen", face=(38, 55, 0.85))


# ----- parasite (blob with internal organelles) ----------------------------
def _g_parasite(p, style):
    path = "M30 52 Q26 30 50 26 Q76 22 78 46 Q86 64 76 76 Q60 88 42 78 Q20 70 30 52 Z"
    parts = [f'<path d="{path}" fill="{p["body"]}"/>']
    if style != "kids":
        parts.append(f'<circle cx="48" cy="48" r="6" fill="{p["nucleus"]}"/>')
        parts.append(f'<circle cx="64" cy="60" r="4" fill="{p["nucleus"]}"/>')
        if style == "flat":
            parts.append(f'<circle cx="46" cy="44" r="1.6" fill="{p["accent2"]}"/>')
    return "".join(parts)


def parasite_blob(palette):
    return _render(_g_parasite, "pathogen", face=(54, 54, 0.85))


# ----- prion (tangled fibrils) ---------------------------------------------
def _g_prion(p, style):
    paths = [
        "M 18 50 Q 36 26 52 42 Q 70 58 86 36",
        "M 22 70 Q 40 50 58 64 Q 78 80 90 60",
        "M 30 28 Q 46 42 38 60 Q 30 78 54 86",
    ]
    parts = []
    for path in paths:
        parts.append(
            f'<path d="{path}" stroke="{p["body"]}" stroke-width="4" '
            f'fill="none" stroke-linecap="round"/>'
        )
    if style == "flat":
        for path in paths:
            parts.append(
                f'<path d="{path}" stroke="{p["accent2"]}" stroke-width="1.4" '
                f'fill="none" opacity="0.6"/>'
            )
    if style == "kids":
        # add a host blob so the face lands on something
        parts.append(
            f'<path d="M 22 50 Q 40 28 60 40 Q 82 56 78 72 Q 60 90 38 78 Q 16 66 22 50 Z" '
            f'fill="{p["body"]}" opacity="0.7"/>'
        )
    return "".join(parts)


def prion_shape(palette):
    return _render(_g_prion, "pathogen", face=(50, 56, 0.7))


# ----- elongated (myocyte / fibroblast / schwann / cardiomyocyte) ----------
def _g_elongated(p, style, striated=False):
    parts = [
        f'<rect x="10" y="40" width="80" height="20" rx="10" fill="{p["body"]}"/>',
        f'<ellipse cx="50" cy="50" rx="6" ry="4" fill="{p["nucleus"]}"/>',
    ]
    if striated and style != "kids":
        for i in range(8):
            x = 16 + i * 9
            parts.append(
                f'<line x1="{x}" y1="42" x2="{x}" y2="58" '
                f'stroke="{p["nucleus"]}" stroke-width="0.9" opacity="0.55"/>'
            )
    return "".join(parts)


def elongated_shape(palette):
    striated = palette.get("striated", False)
    return _render(_g_elongated, "cell", face=(28, 50, 0.55),
                   highlight=(20, 44, 2.5), striated=striated)


# ----- columnar epithelial (enterocyte / paneth) ---------------------------
def _g_columnar(p, style, brush=True):
    parts = [
        f'<rect x="32" y="20" width="36" height="60" rx="4" fill="{p["body"]}"/>',
        f'<ellipse cx="50" cy="68" rx="9" ry="6" fill="{p["nucleus"]}"/>',
    ]
    if brush and style != "kids":
        for i in range(7):
            x = 33 + i * 5
            parts.append(
                f'<line x1="{x}" y1="20" x2="{x}" y2="13" '
                f'stroke="{p["body"]}" stroke-width="1.6" stroke-linecap="round"/>'
            )
    return "".join(parts)


def columnar_shape(palette):
    brush = palette.get("brush", True)
    return _render(_g_columnar, "cell", face=(50, 44, 0.7),
                   highlight=(36, 28, 2.5), brush=brush)


# ----- goblet cell ---------------------------------------------------------
def _g_goblet(p, style):
    path = (
        "M 30 18 L 70 18 L 65 50 Q 76 64 60 78 L 40 78 Q 24 64 35 50 Z"
    )
    parts = [f'<path d="{path}" fill="{p["body"]}"/>']
    if style != "kids":
        for i, (x, y) in enumerate([(40, 28), (52, 30), (60, 38), (44, 40), (56, 44), (50, 36)]):
            parts.append(
                f'<circle cx="{x}" cy="{y}" r="2.5" fill="{p["accent2"]}" opacity="0.65"/>'
            )
        parts.append(f'<ellipse cx="50" cy="72" rx="9" ry="4" fill="{p["nucleus"]}"/>')
    return "".join(parts)


def goblet_shape(palette):
    return _render(_g_goblet, "cell", face=(50, 60, 0.7),
                   highlight=(36, 30, 2.5))


# ----- squamous flat cell --------------------------------------------------
def _g_squamous(p, style):
    pts = "20,42 30,32 50,28 70,32 82,42 78,62 56,68 44,68 22,62"
    return (
        f'<polygon points="{pts}" fill="{p["body"]}"/>'
        f'<ellipse cx="50" cy="48" rx="9" ry="6" fill="{p["nucleus"]}"/>'
    )


def squamous_shape(palette):
    return _render(_g_squamous, "cell", face=(50, 48, 0.6),
                   highlight=(30, 38, 2.8))


# ----- chondrocyte in lacuna -----------------------------------------------
def _g_lacuna(p, style):
    matrix = "#a3c79e" if style == "micro" else (
        "#bde0c0" if style == "flat" else "#e7f3d8"
    )
    return (
        f'<rect width="100" height="100" fill="{matrix}" opacity="0.45"/>'
        f'<circle cx="50" cy="50" r="26" fill="#fff" opacity="0.85"/>'
        f'<circle cx="50" cy="50" r="18" fill="{p["body"]}"/>'
        f'<circle cx="48" cy="48" r="9" fill="{p["nucleus"]}"/>'
    )


def lacuna_shape(palette):
    return _render(_g_lacuna, "cell", face=(50, 50, 0.7))


# ----- osteoblast on bone surface (also reused for cuboidal cells) ---------
def _g_osteoblast(p, style):
    bone_color = "#cfae7a" if style != "kids" else "#e6c69a"
    return (
        f'<rect x="6" y="68" width="88" height="20" fill="{bone_color}"/>'
        f'<rect x="30" y="38" width="40" height="32" rx="4" fill="{p["body"]}"/>'
        f'<ellipse cx="50" cy="56" rx="7" ry="5" fill="{p["nucleus"]}"/>'
    )


def osteoblast_shape(palette):
    return _render(_g_osteoblast, "cell", face=(50, 50, 0.65),
                   highlight=(36, 44, 2.8))


# ----- adipocyte (single huge lipid droplet) -------------------------------
def _g_adipocyte(p, style):
    droplet = "#fff5cf" if style != "kids" else "#fffae0"
    return (
        f'<circle cx="50" cy="50" r="38" fill="{p["body"]}"/>'
        f'<circle cx="50" cy="50" r="32" fill="{droplet}"/>'
        f'<ellipse cx="18" cy="48" rx="6" ry="3.5" fill="{p["nucleus"]}"/>'
    )


def adipocyte_shape(palette):
    return _render(_g_adipocyte, "cell", face=(50, 52, 1.0),
                   highlight=(34, 36, 4))


# ----- endothelial cell (vessel wall) --------------------------------------
def _g_endothelial(p, style, fenestrae=False, lumen=True):
    parts = []
    lumen_color = "#e6a8a8" if style == "micro" else (
        "#ff6b5e" if style == "flat" else "#f4b8b8"
    )
    if lumen:
        parts.append(
            f'<rect x="0" y="42" width="100" height="16" fill="{lumen_color}" opacity="0.55"/>'
        )
    parts.append(f'<rect x="0" y="32" width="100" height="10" fill="{p["body"]}"/>')
    parts.append(f'<rect x="0" y="58" width="100" height="10" fill="{p["body"]}"/>')
    for cx, cy in [(28, 37), (66, 37), (38, 63), (74, 63)]:
        parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="6" ry="2.5" fill="{p["nucleus"]}"/>')
    if fenestrae:
        for i in range(8):
            x = 8 + i * 12
            parts.append(f'<circle cx="{x}" cy="37" r="1.5" fill="#fff" opacity="0.6"/>')
            parts.append(f'<circle cx="{x}" cy="63" r="1.5" fill="#fff" opacity="0.6"/>')
    return "".join(parts)


def endothelial_shape(palette):
    fenestrae = palette.get("fenestrae", False)
    lumen = palette.get("lumen", True)
    return _render(_g_endothelial, "cell", face=(50, 50, 0.55),
                   highlight=(20, 36, 2.5),
                   fenestrae=fenestrae, lumen=lumen)


# ----- generic stem cell (HSC, MSC, NSC, EPC, iPS) -------------------------
def _g_stem(p, style):
    aura = "#caf0f8" if style != "flat" else "#5aa6e6"
    parts = [
        f'<circle cx="50" cy="50" r="34" fill="{aura}" opacity="0.4"/>',
        f'<circle cx="50" cy="50" r="22" fill="{p["body"]}"/>',
        f'<circle cx="49" cy="49" r="13" fill="{p["nucleus"]}"/>',
    ]
    if style == "flat":
        # twinkly bits to suggest "potency"
        for ang in range(0, 360, 60):
            rad = math.radians(ang)
            x = 50 + 30 * math.cos(rad)
            y = 50 + 30 * math.sin(rad)
            parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.6" fill="#fff" opacity="0.85"/>')
    return "".join(parts)


def stem_cell_shape(palette):
    return _render(_g_stem, "cell", face=(50, 50, 0.85))


# ----- megakaryocyte (huge multilobed nucleus) -----------------------------
def _g_megakaryocyte(p, style):
    parts = [f'<circle cx="50" cy="50" r="34" fill="{p["body"]}"/>']
    for ang in range(0, 360, 60):
        rad = math.radians(ang)
        x = 50 + 14 * math.cos(rad)
        y = 50 + 14 * math.sin(rad)
        parts.append(
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="{p["nucleus"]}"/>'
        )
    return "".join(parts)


def megakaryocyte_shape(palette):
    return _render(_g_megakaryocyte, "cell", face=(50, 50, 0.95))
