"""SVG shape templates for cells, pathogens and stem-cell derivatives.

Each builder returns three inline SVGs (microscope / kurzgesagt / cute) sized 220x220.
The microscope view simulates an H&E-stained look inside a circular vignette,
the kurzgesagt view is flat & geometric, and the cute view adds a face to the
same shape. We don't claim photorealism — these are recognisable stylisations.
"""
from __future__ import annotations

SIZE = 220
CX = CY = 110


def _frame_microscope(inner: str, tint: str = "#f4d9e6") -> str:
    return f"""
<svg viewBox="0 0 {SIZE} {SIZE}" xmlns="http://www.w3.org/2000/svg" class="img micro">
  <defs>
    <radialGradient id="vig" cx="50%" cy="50%" r="55%">
      <stop offset="60%" stop-color="{tint}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#1a0a14" stop-opacity="1"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0"/>
      <feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>
  <circle cx="{CX}" cy="{CY}" r="105" fill="url(#vig)"/>
  <g>{inner}</g>
  <circle cx="{CX}" cy="{CY}" r="105" fill="none" stroke="#000" stroke-width="6"/>
  <circle cx="{CX}" cy="{CY}" r="105" fill="none" stroke="#888" stroke-width="1"/>
</svg>"""


def _frame_flat(inner: str, bg: str = "#1d3557") -> str:
    return f"""
<svg viewBox="0 0 {SIZE} {SIZE}" xmlns="http://www.w3.org/2000/svg" class="img flat">
  <rect width="{SIZE}" height="{SIZE}" rx="14" fill="{bg}"/>
  <g>{inner}</g>
</svg>"""


def _frame_cute(inner: str, bg: str = "#fff8e1") -> str:
    return f"""
<svg viewBox="0 0 {SIZE} {SIZE}" xmlns="http://www.w3.org/2000/svg" class="img cute">
  <rect width="{SIZE}" height="{SIZE}" rx="14" fill="{bg}"/>
  <g>{inner}</g>
</svg>"""


def _face(cx: int, cy: int, scale: float = 1.0, mouth: str = "smile") -> str:
    s = scale
    ex = int(8 * s)
    ey = int(10 * s)
    sx1 = cx - int(12 * s)
    sx2 = cx + int(12 * s)
    mouth_path = {
        "smile": f"M {cx - 12 * s} {cy + 8 * s} Q {cx} {cy + 20 * s} {cx + 12 * s} {cy + 8 * s}",
        "grin": f"M {cx - 14 * s} {cy + 8 * s} Q {cx} {cy + 22 * s} {cx + 14 * s} {cy + 8 * s}",
        "o": "",
    }[mouth]
    extra = ""
    if mouth == "o":
        extra = f'<ellipse cx="{cx}" cy="{cy + 12 * s}" rx="{6 * s}" ry="{8 * s}" fill="#3a1f1f"/>'
    return (
        f'<ellipse cx="{sx1}" cy="{cy - 4 * s}" rx="{ex}" ry="{ey}" fill="white" stroke="#222" stroke-width="2"/>'
        f'<ellipse cx="{sx2}" cy="{cy - 4 * s}" rx="{ex}" ry="{ey}" fill="white" stroke="#222" stroke-width="2"/>'
        f'<circle cx="{sx1}" cy="{cy - 2 * s}" r="{4 * s}" fill="#222"/>'
        f'<circle cx="{sx2}" cy="{cy - 2 * s}" r="{4 * s}" fill="#222"/>'
        f'<circle cx="{sx1 + 2}" cy="{cy - 4 * s}" r="{1.4 * s}" fill="white"/>'
        f'<circle cx="{sx2 + 2}" cy="{cy - 4 * s}" r="{1.4 * s}" fill="white"/>'
        + (f'<path d="{mouth_path}" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/>' if mouth_path else extra)
    )


# -----------------------------------------------------------------------------
# SHAPE BUILDERS
# Each returns a tuple of three SVG strings: (microscope, kurzgesagt, cute).
# -----------------------------------------------------------------------------

def round_with_nucleus(palette: dict) -> tuple[str, str, str]:
    """Generic mononuclear cell — used for lymphocytes/monocytes/macrophages."""
    cyto = palette.get("cyto", "#f0a8c0")
    nuc = palette.get("nuc", "#5a2a64")
    flat_cyto = palette.get("flat", "#7fb3e3")
    flat_nuc = palette.get("flat_nuc", "#27496d")
    radius = palette.get("r", 70)
    nuc_r = palette.get("nr", 42)
    nuc_off = palette.get("noff", (-6, -4))

    micro_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="{radius}" fill="{cyto}" stroke="#6a224a" stroke-width="2"/>'
        f'<circle cx="{CX + nuc_off[0]}" cy="{CY + nuc_off[1]}" r="{nuc_r}" fill="{nuc}" opacity="0.85"/>'
        f'<circle cx="{CX - 10}" cy="{CY - 10}" r="20" fill="#9b4a82" opacity="0.4"/>'
    )
    flat_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="{radius}" fill="{flat_cyto}" stroke="#0e2a47" stroke-width="4"/>'
        f'<circle cx="{CX + nuc_off[0]}" cy="{CY + nuc_off[1]}" r="{nuc_r}" fill="{flat_nuc}" stroke="#0e2a47" stroke-width="3"/>'
        f'<circle cx="{CX + nuc_off[0] - 8}" cy="{CY + nuc_off[1] - 8}" r="6" fill="#fff" opacity="0.5"/>'
    )
    cute_inner = (
        f'<circle cx="{CX}" cy="{CY + 8}" r="{radius}" fill="{flat_cyto}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY - 4, 1.1)
        + f'<path d="M {CX - 28} {CY + 38} Q {CX} {CY + 48} {CX + 28} {CY + 38}" stroke="#222" stroke-width="2" fill="none"/>'
    )
    return _frame_microscope(micro_inner), _frame_flat(flat_inner), _frame_cute(cute_inner)


def multi_lobed_nucleus(palette: dict) -> tuple[str, str, str]:
    """Polymorphonuclear leukocyte (neutrophil, with adjustable granule colour)."""
    cyto = palette.get("cyto", "#f8c8c8")
    nuc = palette.get("nuc", "#3a155a")
    grain = palette.get("grain", "#c75a8a")
    flat_cyto = palette.get("flat", "#f5cb5c")
    flat_nuc = palette.get("flat_nuc", "#5a2c75")
    lobes = palette.get("lobes", 3)

    # Connected lobes arranged horizontally
    lobe_positions = {
        2: [(-22, 0), (22, 0)],
        3: [(-30, 8), (0, -12), (30, 8)],
        4: [(-36, 6), (-12, -14), (14, -14), (36, 6)],
    }[lobes]

    nuc_micro = "".join(
        f'<circle cx="{CX + dx}" cy="{CY + dy}" r="20" fill="{nuc}" opacity="0.85"/>'
        for dx, dy in lobe_positions
    )
    nuc_micro += "".join(
        f'<line x1="{CX + lobe_positions[i][0]}" y1="{CY + lobe_positions[i][1]}" '
        f'x2="{CX + lobe_positions[i+1][0]}" y2="{CY + lobe_positions[i+1][1]}" '
        f'stroke="{nuc}" stroke-width="8" opacity="0.7"/>'
        for i in range(len(lobe_positions) - 1)
    )
    granules_micro = "".join(
        f'<circle cx="{CX + (i * 17) % 100 - 50}" cy="{CY + (i * 23) % 100 - 50}" r="3" fill="{grain}" opacity="0.55"/>'
        for i in range(28)
    )

    micro_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="78" fill="{cyto}" stroke="#6a224a" stroke-width="2"/>'
        + granules_micro + nuc_micro
    )

    nuc_flat = "".join(
        f'<circle cx="{CX + dx}" cy="{CY + dy}" r="20" fill="{flat_nuc}" stroke="#0e2a47" stroke-width="3"/>'
        for dx, dy in lobe_positions
    )
    nuc_flat += "".join(
        f'<line x1="{CX + lobe_positions[i][0]}" y1="{CY + lobe_positions[i][1]}" '
        f'x2="{CX + lobe_positions[i+1][0]}" y2="{CY + lobe_positions[i+1][1]}" '
        f'stroke="{flat_nuc}" stroke-width="14" stroke-linecap="round"/>'
        for i in range(len(lobe_positions) - 1)
    )
    granules_flat = "".join(
        f'<circle cx="{CX + (i * 17) % 100 - 50}" cy="{CY + (i * 31) % 110 - 55}" r="4" fill="{palette.get("flat_grain", "#e76f51")}"/>'
        for i in range(18)
    )
    flat_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="78" fill="{flat_cyto}" stroke="#0e2a47" stroke-width="4"/>'
        + granules_flat + nuc_flat
    )

    cute_inner = (
        f'<circle cx="{CX}" cy="{CY + 8}" r="78" fill="{flat_cyto}" stroke="#222" stroke-width="3"/>'
        + "".join(f'<circle cx="{CX + (i * 19) % 120 - 60}" cy="{CY + 30 + (i * 11) % 30}" r="4" fill="{palette.get("flat_grain", "#e76f51")}"/>' for i in range(8))
        + _face(CX, CY - 14, 1.0, mouth="grin")
    )
    return _frame_microscope(micro_inner), _frame_flat(flat_inner), _frame_cute(cute_inner)


def dendritic_shape(palette: dict) -> tuple[str, str, str]:
    """Branched cell (dendritic cell, microglia, astrocyte, neuron-lite)."""
    cyto = palette.get("cyto", "#e9b8c9")
    nuc = palette.get("nuc", "#4a1f4a")
    flat = palette.get("flat", "#8ecae6")
    flat_nuc = palette.get("flat_nuc", "#023047")
    arms = palette.get("arms", 8)
    import math
    branches_micro = ""
    branches_flat = ""
    branches_cute = ""
    for i in range(arms):
        ang = i * (360 / arms)
        rad = math.radians(ang)
        x1 = CX + 40 * math.cos(rad)
        y1 = CY + 40 * math.sin(rad)
        x2 = CX + 95 * math.cos(rad)
        y2 = CY + 95 * math.sin(rad)
        # small fork
        x3 = x2 + 12 * math.cos(rad + 0.6)
        y3 = y2 + 12 * math.sin(rad + 0.6)
        x4 = x2 + 12 * math.cos(rad - 0.6)
        y4 = y2 + 12 * math.sin(rad - 0.6)
        branches_micro += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{cyto}" stroke-width="9" stroke-linecap="round"/>'
        branches_micro += f'<line x1="{x2:.1f}" y1="{y2:.1f}" x2="{x3:.1f}" y2="{y3:.1f}" stroke="{cyto}" stroke-width="5" stroke-linecap="round"/>'
        branches_micro += f'<line x1="{x2:.1f}" y1="{y2:.1f}" x2="{x4:.1f}" y2="{y4:.1f}" stroke="{cyto}" stroke-width="5" stroke-linecap="round"/>'
        branches_flat += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{flat}" stroke-width="11" stroke-linecap="round"/>'
        branches_flat += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#0e2a47" stroke-width="13" stroke-linecap="round" opacity="0.0"/>'
        branches_flat += f'<line x1="{x2:.1f}" y1="{y2:.1f}" x2="{x3:.1f}" y2="{y3:.1f}" stroke="{flat}" stroke-width="6" stroke-linecap="round"/>'
        branches_flat += f'<line x1="{x2:.1f}" y1="{y2:.1f}" x2="{x4:.1f}" y2="{y4:.1f}" stroke="{flat}" stroke-width="6" stroke-linecap="round"/>'
        branches_cute += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{flat}" stroke-width="11" stroke-linecap="round"/>'

    micro_inner = (
        branches_micro
        + f'<circle cx="{CX}" cy="{CY}" r="42" fill="{cyto}" stroke="#6a224a" stroke-width="2"/>'
        + f'<circle cx="{CX - 6}" cy="{CY - 4}" r="24" fill="{nuc}" opacity="0.85"/>'
    )
    flat_inner = (
        branches_flat
        + f'<circle cx="{CX}" cy="{CY}" r="42" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        + f'<circle cx="{CX - 6}" cy="{CY - 4}" r="22" fill="{flat_nuc}"/>'
    )
    cute_inner = (
        branches_cute
        + f'<circle cx="{CX}" cy="{CY + 5}" r="50" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY - 2, 0.9)
    )
    return _frame_microscope(micro_inner), _frame_flat(flat_inner), _frame_cute(cute_inner)


def ameboid_shape(palette: dict) -> tuple[str, str, str]:
    """Macrophage with pseudopods."""
    cyto = palette.get("cyto", "#e8b3c5")
    nuc = palette.get("nuc", "#3a1845")
    flat = palette.get("flat", "#a8dadc")
    flat_nuc = palette.get("flat_nuc", "#1d3557")
    path = "M 60 110 Q 40 70, 80 50 Q 110 30, 150 55 Q 195 70, 175 110 Q 195 150, 155 165 Q 110 195, 75 165 Q 30 150, 60 110 Z"
    micro_inner = (
        f'<path d="{path}" fill="{cyto}" stroke="#6a224a" stroke-width="2"/>'
        f'<ellipse cx="{CX - 6}" cy="{CY + 4}" rx="36" ry="30" fill="{nuc}" opacity="0.85"/>'
        f'<circle cx="80" cy="80" r="6" fill="#8b3c6a" opacity="0.6"/>'
        f'<circle cx="150" cy="140" r="5" fill="#8b3c6a" opacity="0.6"/>'
        f'<circle cx="100" cy="150" r="4" fill="#8b3c6a" opacity="0.6"/>'
    )
    flat_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<ellipse cx="{CX - 6}" cy="{CY + 4}" rx="36" ry="30" fill="{flat_nuc}"/>'
        f'<circle cx="80" cy="80" r="6" fill="#f1faee" opacity="0.7"/>'
        f'<circle cx="150" cy="140" r="5" fill="#f1faee" opacity="0.7"/>'
    )
    cute_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY - 6, 1.1, mouth="grin")
    )
    return _frame_microscope(micro_inner), _frame_flat(flat_inner), _frame_cute(cute_inner)


def biconcave_disc(palette: dict) -> tuple[str, str, str]:
    """Erythrocyte — biconcave red disc."""
    flat = palette.get("flat", "#e63946")
    micro_inner = (
        f'<ellipse cx="{CX}" cy="{CY}" rx="80" ry="70" fill="#d04a4a" stroke="#7a1f1f" stroke-width="2"/>'
        f'<ellipse cx="{CX}" cy="{CY}" rx="36" ry="30" fill="#a83a3a" opacity="0.7"/>'
        f'<ellipse cx="{CX - 20}" cy="{CY - 20}" rx="14" ry="10" fill="#f4a6a6" opacity="0.6"/>'
    )
    flat_inner = (
        f'<ellipse cx="{CX}" cy="{CY}" rx="80" ry="70" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<ellipse cx="{CX}" cy="{CY}" rx="32" ry="28" fill="#b22a37"/>'
        f'<ellipse cx="{CX - 24}" cy="{CY - 22}" rx="12" ry="8" fill="#fff" opacity="0.5"/>'
    )
    cute_inner = (
        f'<ellipse cx="{CX}" cy="{CY + 8}" rx="80" ry="70" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY - 4, 1.0)
    )
    return _frame_microscope(micro_inner, "#f2c2c2"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def platelet_shape(palette: dict) -> tuple[str, str, str]:
    """Thrombocyte — small irregular fragment with granules."""
    flat = palette.get("flat", "#bc4749")
    path = "M 80 110 Q 70 80 110 70 Q 155 70 160 110 Q 165 150 110 155 Q 70 150 80 110 Z"
    micro_inner = (
        f'<path d="{path}" fill="#c66a6a" stroke="#7a1f1f" stroke-width="2"/>'
        f'<circle cx="100" cy="100" r="4" fill="#5a1f3a"/>'
        f'<circle cx="130" cy="115" r="3" fill="#5a1f3a"/>'
        f'<circle cx="115" cy="135" r="4" fill="#5a1f3a"/>'
        f'<circle cx="95" cy="125" r="3" fill="#5a1f3a"/>'
    )
    flat_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<circle cx="100" cy="100" r="5" fill="#fff" opacity="0.8"/>'
        f'<circle cx="130" cy="115" r="4" fill="#fff" opacity="0.8"/>'
        f'<circle cx="115" cy="135" r="5" fill="#fff" opacity="0.8"/>'
    )
    cute_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX + 8, CY + 4, 0.7)
    )
    return _frame_microscope(micro_inner, "#f2c2c2"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def neuron_shape(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#ffb703")
    flat_nuc = palette.get("flat_nuc", "#6a4500")
    dendrites = [
        "M 110 80 L 60 30",
        "M 110 80 L 110 20",
        "M 110 80 L 160 30",
        "M 90 95 L 30 70",
        "M 130 95 L 190 70",
    ]
    axon = "M 110 140 C 110 170, 170 180, 200 200"
    terminals = [(195, 200), (200, 185), (210, 195)]
    micro = (
        "".join(f'<path d="{d}" stroke="#c98aa7" stroke-width="6" fill="none" stroke-linecap="round"/>' for d in dendrites)
        + f'<circle cx="{CX}" cy="{CY}" r="36" fill="#d09abf" stroke="#6a224a" stroke-width="2"/>'
        + f'<circle cx="{CX - 4}" cy="{CY - 2}" r="18" fill="#5a2a64"/>'
        + f'<path d="{axon}" stroke="#c98aa7" stroke-width="6" fill="none" stroke-linecap="round"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="#c98aa7"/>' for x, y in terminals)
    )
    flat_inner = (
        "".join(f'<path d="{d}" stroke="{flat}" stroke-width="8" fill="none" stroke-linecap="round"/>' for d in dendrites)
        + f'<circle cx="{CX}" cy="{CY}" r="40" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        + f'<circle cx="{CX - 4}" cy="{CY - 2}" r="18" fill="{flat_nuc}"/>'
        + f'<path d="{axon}" stroke="{flat}" stroke-width="8" fill="none" stroke-linecap="round"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="7" fill="{flat}"/>' for x, y in terminals)
    )
    cute_inner = (
        "".join(f'<path d="{d}" stroke="{flat}" stroke-width="8" fill="none" stroke-linecap="round"/>' for d in dendrites)
        + f'<circle cx="{CX}" cy="{CY + 5}" r="44" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY, 0.9)
        + f'<path d="{axon}" stroke="{flat}" stroke-width="8" fill="none" stroke-linecap="round"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="7" fill="{flat}" stroke="#222" stroke-width="2"/>' for x, y in terminals)
    )
    return _frame_microscope(micro), _frame_flat(flat_inner), _frame_cute(cute_inner)


def virus_icosahedral(palette: dict) -> tuple[str, str, str]:
    color = palette.get("flat", "#7209b7")
    spikes = palette.get("spikes", True)
    # hexagon-ish capsid (icosahedral projected)
    pts = "110,40 170,72 170,148 110,180 50,148 50,72"
    micro_inner = f'<polygon points="{pts}" fill="#8d4f9e" stroke="#3a1546" stroke-width="2"/>'
    micro_inner += '<polygon points="110,40 170,72 110,104 50,72" fill="#a674b8" opacity="0.6"/>'
    flat_inner = f'<polygon points="{pts}" fill="{color}" stroke="#0e2a47" stroke-width="4"/>'
    flat_inner += '<polygon points="110,40 170,72 110,104 50,72" fill="#fff" opacity="0.18"/>'
    if spikes:
        import math
        for i in range(12):
            ang = i * 30
            rad = math.radians(ang)
            x1, y1 = CX + 78 * math.cos(rad), CY + 78 * math.sin(rad)
            x2, y2 = CX + 100 * math.cos(rad), CY + 100 * math.sin(rad)
            micro_inner = f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#8d4f9e" stroke-width="3"/>' + micro_inner
            flat_inner = f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="5" stroke-linecap="round"/>' + flat_inner
            flat_inner += f'<circle cx="{x2:.1f}" cy="{y2:.1f}" r="6" fill="{color}"/>'
    cute_inner = f'<polygon points="{pts}" fill="{color}" stroke="#222" stroke-width="3"/>' + _face(CX, CY - 8, 1.0, mouth="grin")
    cute_inner += f'<path d="M 80 150 Q 110 170 140 150" stroke="#222" stroke-width="2" fill="none"/>'
    return _frame_microscope(micro_inner, "#e8d5e0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def bacteria_cocci(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#2a9d8f")
    # cluster of small circles
    positions = [(80, 80), (110, 70), (140, 80), (75, 110), (105, 100), (135, 110), (90, 140), (120, 135)]
    micro_inner = "".join(
        f'<circle cx="{x}" cy="{y}" r="14" fill="#5a8acc" stroke="#1d3557" stroke-width="1.5"/>'
        for x, y in positions
    )
    flat_inner = "".join(
        f'<circle cx="{x}" cy="{y}" r="16" fill="{flat}" stroke="#0e2a47" stroke-width="3"/>'
        f'<circle cx="{x - 4}" cy="{y - 4}" r="4" fill="#fff" opacity="0.5"/>'
        for x, y in positions
    )
    cute_inner = "".join(
        f'<circle cx="{x}" cy="{y}" r="20" fill="{flat}" stroke="#222" stroke-width="3"/>'
        for x, y in [(80, 90), (140, 90), (110, 140)]
    )
    cute_inner += _face(80, 90, 0.4) + _face(140, 90, 0.4) + _face(110, 140, 0.4)
    return _frame_microscope(micro_inner, "#d9e2ec"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def bacteria_rod(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#e63946")
    rods = [(45, 80, 130, 60), (60, 120, 130, 60), (40, 160, 90, 50)]  # x,y,w,h
    micro_inner = "".join(
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h // 2}" fill="#a85a5a" stroke="#5a1818" stroke-width="2"/>'
        for x, y, w, h in rods
    )
    flat_inner = "".join(
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h // 2}" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<rect x="{x + 8}" y="{y + 8}" width="{w - 20}" height="6" rx="3" fill="#fff" opacity="0.4"/>'
        for x, y, w, h in rods
    )
    cute_inner = (
        f'<rect x="40" y="80" width="140" height="60" rx="30" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(85, 110, 1.0, mouth="grin")
        + f'<rect x="50" y="155" width="100" height="35" rx="18" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(85, 172, 0.5)
    )
    return _frame_microscope(micro_inner, "#f2e1d0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def fungus_hyphae(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#9c6644")
    paths = [
        "M 30 60 Q 80 80 130 70 Q 180 60 200 110",
        "M 30 130 Q 90 120 130 150 Q 180 180 200 160",
        "M 110 30 Q 100 90 140 110 Q 170 130 130 200",
    ]
    buds = [(70, 75), (130, 73), (90, 120), (135, 150), (110, 95)]
    micro_inner = "".join(f'<path d="{p}" stroke="#8a6a4a" stroke-width="9" fill="none" stroke-linecap="round"/>' for p in paths)
    micro_inner += "".join(f'<circle cx="{x}" cy="{y}" r="10" fill="#c19a7a" stroke="#5a3a1f" stroke-width="1.5"/>' for x, y in buds)
    flat_inner = "".join(f'<path d="{p}" stroke="{flat}" stroke-width="12" fill="none" stroke-linecap="round"/>' for p in paths)
    flat_inner += "".join(f'<circle cx="{x}" cy="{y}" r="12" fill="#d4a373" stroke="#0e2a47" stroke-width="3"/>' for x, y in buds)
    cute_inner = (
        f'<path d="M 30 130 Q 90 120 130 150 Q 180 180 200 160" stroke="{flat}" stroke-width="14" fill="none" stroke-linecap="round"/>'
        f'<circle cx="110" cy="100" r="40" fill="#d4a373" stroke="#222" stroke-width="3"/>'
        + _face(110, 95, 0.9)
    )
    return _frame_microscope(micro_inner, "#e6d4b8"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def parasite_blob(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#6a994e")
    path = "M 60 110 Q 50 60 100 50 Q 160 40 170 90 Q 195 130 160 165 Q 120 195 80 170 Q 40 150 60 110 Z"
    micro_inner = (
        f'<path d="{path}" fill="#a3b18a" stroke="#3a5a1f" stroke-width="2"/>'
        f'<circle cx="100" cy="100" r="14" fill="#3a5a1f" opacity="0.8"/>'
        f'<circle cx="140" cy="130" r="10" fill="#3a5a1f" opacity="0.7"/>'
    )
    flat_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<circle cx="100" cy="100" r="14" fill="#0e2a47"/>'
        f'<circle cx="140" cy="130" r="10" fill="#0e2a47"/>'
        f'<circle cx="100 - 5" cy="95" r="4" fill="#fff" opacity="0.5"/>'
    )
    cute_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(115, 110, 1.1, mouth="grin")
    )
    return _frame_microscope(micro_inner, "#dde5b7"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def prion_shape(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#f4a261")
    # tangled "fibrils"
    paths = [
        "M 30 110 Q 60 60 100 90 Q 140 120 180 80",
        "M 40 150 Q 80 110 120 140 Q 160 170 200 130",
        "M 60 60 Q 100 90 80 130 Q 60 170 110 180",
    ]
    micro_inner = "".join(f'<path d="{p}" stroke="#b07a4a" stroke-width="6" fill="none" stroke-linecap="round"/>' for p in paths)
    micro_inner += "".join(f'<path d="{p}" stroke="#8a5a2a" stroke-width="2" fill="none" opacity="0.5"/>' for p in paths)
    flat_inner = "".join(f'<path d="{p}" stroke="{flat}" stroke-width="10" fill="none" stroke-linecap="round"/>' for p in paths)
    flat_inner += "".join(f'<path d="{p}" stroke="#fff" stroke-width="3" fill="none" opacity="0.3"/>' for p in paths)
    cute_inner = (
        f'<path d="M 40 110 Q 80 60 130 90 Q 180 120 180 160 Q 130 200 60 170 Q 20 140 40 110 Z" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(110, 120, 1.0, mouth="o")
    )
    return _frame_microscope(micro_inner, "#f1e0c0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def elongated_shape(palette: dict) -> tuple[str, str, str]:
    """Long fiber-like cell — muscle/fibroblast/myocyte."""
    flat = palette.get("flat", "#bc4749")
    flat_nuc = palette.get("flat_nuc", "#3a1f3a")
    striated = palette.get("striated", False)
    # long pill shape
    micro_inner = (
        f'<rect x="20" y="80" width="180" height="60" rx="30" fill="#c79a8a" stroke="#5a2a1f" stroke-width="2"/>'
        f'<ellipse cx="{CX}" cy="{CY}" rx="14" ry="9" fill="#3a1845"/>'
    )
    if striated:
        micro_inner += "".join(f'<line x1="{30 + i * 12}" y1="85" x2="{30 + i * 12}" y2="135" stroke="#7a3a2a" stroke-width="1.5" opacity="0.7"/>' for i in range(14))
    flat_inner = (
        f'<rect x="20" y="80" width="180" height="60" rx="30" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<ellipse cx="{CX}" cy="{CY}" rx="14" ry="9" fill="{flat_nuc}"/>'
    )
    if striated:
        flat_inner += "".join(f'<line x1="{30 + i * 14}" y1="85" x2="{30 + i * 14}" y2="135" stroke="#fff" stroke-width="2" opacity="0.45"/>' for i in range(12))
    cute_inner = (
        f'<rect x="20" y="80" width="180" height="60" rx="30" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(70, 110, 0.9, mouth="grin")
    )
    if striated:
        cute_inner += "".join(f'<line x1="{120 + i * 10}" y1="88" x2="{120 + i * 10}" y2="132" stroke="#222" stroke-width="2" opacity="0.4"/>' for i in range(7))
    return _frame_microscope(micro_inner, "#f2d6c2"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def columnar_shape(palette: dict) -> tuple[str, str, str]:
    """Tall epithelial cell."""
    flat = palette.get("flat", "#f4a261")
    flat_nuc = palette.get("flat_nuc", "#3a1f3a")
    brush_border = palette.get("brush", True)
    micro_inner = (
        f'<rect x="60" y="40" width="100" height="160" rx="10" fill="#d6a78a" stroke="#5a2a1f" stroke-width="2"/>'
        f'<ellipse cx="{CX}" cy="160" rx="22" ry="18" fill="#3a1845"/>'
    )
    if brush_border:
        micro_inner += "".join(f'<line x1="{65 + i * 9}" y1="40" x2="{65 + i * 9}" y2="20" stroke="#7a3a2a" stroke-width="1.5"/>' for i in range(11))
    flat_inner = (
        f'<rect x="60" y="40" width="100" height="160" rx="10" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<ellipse cx="{CX}" cy="160" rx="22" ry="18" fill="{flat_nuc}"/>'
    )
    if brush_border:
        flat_inner += "".join(f'<line x1="{65 + i * 9}" y1="40" x2="{65 + i * 9}" y2="15" stroke="{flat}" stroke-width="3" stroke-linecap="round"/>' for i in range(11))
    cute_inner = (
        f'<rect x="60" y="40" width="100" height="160" rx="10" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, 100, 1.0)
    )
    if brush_border:
        cute_inner += "".join(f'<line x1="{65 + i * 9}" y1="40" x2="{65 + i * 9}" y2="15" stroke="{flat}" stroke-width="3" stroke-linecap="round"/>' for i in range(11))
    return _frame_microscope(micro_inner, "#f1e0c0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def goblet_shape(palette: dict) -> tuple[str, str, str]:
    """Goblet cell — flask shape full of mucus granules."""
    flat = palette.get("flat", "#a8dadc")
    path = "M 60 30 L 160 30 L 150 110 Q 165 140 130 180 L 90 180 Q 55 140 70 110 Z"
    micro_inner = (
        f'<path d="{path}" fill="#b8d8db" stroke="#3a5a6a" stroke-width="2"/>'
        + "".join(f'<circle cx="{80 + (i % 4) * 18}" cy="{50 + (i // 4) * 22}" r="6" fill="#5a8a9a" opacity="0.6"/>' for i in range(12))
        + f'<ellipse cx="{CX}" cy="170" rx="22" ry="12" fill="#3a1845"/>'
    )
    flat_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        + "".join(f'<circle cx="{80 + (i % 4) * 18}" cy="{50 + (i // 4) * 22}" r="7" fill="#fff" opacity="0.7"/>' for i in range(12))
        + f'<ellipse cx="{CX}" cy="170" rx="22" ry="12" fill="#1d3557"/>'
    )
    cute_inner = (
        f'<path d="{path}" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, 145, 0.9)
        + "".join(f'<circle cx="{80 + (i % 4) * 18}" cy="{45 + (i // 4) * 12}" r="5" fill="#fff" stroke="#222" stroke-width="1"/>' for i in range(6))
    )
    return _frame_microscope(micro_inner, "#d4e3e5"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def squamous_shape(palette: dict) -> tuple[str, str, str]:
    """Flat keratinocyte / endothelial — wide and flat."""
    flat = palette.get("flat", "#f4a261")
    flat_nuc = palette.get("flat_nuc", "#3a1f3a")
    micro_inner = (
        f'<polygon points="30,90 50,70 110,60 170,72 195,90 180,130 130,150 80,145 35,130" fill="#e6c2a8" stroke="#5a2a1f" stroke-width="2"/>'
        f'<ellipse cx="{CX}" cy="{CY}" rx="22" ry="14" fill="#3a1845" opacity="0.85"/>'
    )
    flat_inner = (
        f'<polygon points="30,90 50,70 110,60 170,72 195,90 180,130 130,150 80,145 35,130" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<ellipse cx="{CX}" cy="{CY}" rx="22" ry="14" fill="{flat_nuc}"/>'
    )
    cute_inner = (
        f'<polygon points="30,90 50,70 110,60 170,72 195,90 180,130 130,150 80,145 35,130" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY - 5, 0.9)
    )
    return _frame_microscope(micro_inner, "#f1e0c0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def lacuna_shape(palette: dict) -> tuple[str, str, str]:
    """Chondrocyte in lacuna — round cell in a clear space inside matrix."""
    flat = palette.get("flat", "#cdb4db")
    matrix = palette.get("matrix", "#7fb069")
    matrix_flat = palette.get("matrix_flat", "#a8dadc")
    micro_inner = (
        f'<rect x="0" y="0" width="220" height="220" fill="#c2d5a8" opacity="0.6"/>'
        f'<circle cx="{CX}" cy="{CY}" r="62" fill="#f5e6f1"/>'
        f'<circle cx="{CX}" cy="{CY}" r="40" fill="#d5a8c5" stroke="#5a2a4a" stroke-width="2"/>'
        f'<circle cx="{CX - 4}" cy="{CY - 4}" r="18" fill="#3a1845"/>'
    )
    flat_inner = (
        f'<rect x="0" y="0" width="220" height="220" fill="{matrix_flat}" opacity="0.5"/>'
        f'<circle cx="{CX}" cy="{CY}" r="62" fill="#fff" opacity="0.7"/>'
        f'<circle cx="{CX}" cy="{CY}" r="44" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<circle cx="{CX - 4}" cy="{CY - 4}" r="18" fill="#5a2a64"/>'
    )
    cute_inner = (
        f'<rect x="0" y="0" width="220" height="220" fill="{matrix_flat}" opacity="0.5"/>'
        f'<circle cx="{CX}" cy="{CY}" r="62" fill="#fff" stroke="#222" stroke-width="2" stroke-dasharray="4 3"/>'
        f'<circle cx="{CX}" cy="{CY + 4}" r="44" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY, 0.9)
    )
    return _frame_microscope(micro_inner, "#dbe5c0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def osteoblast_shape(palette: dict) -> tuple[str, str, str]:
    """Cuboidal cell on a bone surface."""
    flat = palette.get("flat", "#ffe066")
    micro_inner = (
        f'<rect x="20" y="160" width="180" height="40" fill="#e3c47a"/>'
        f'<rect x="60" y="100" width="100" height="60" rx="10" fill="#d4a373" stroke="#5a2a1f" stroke-width="2"/>'
        f'<circle cx="{CX}" cy="130" r="14" fill="#3a1845"/>'
    )
    flat_inner = (
        f'<rect x="20" y="160" width="180" height="40" fill="#d4a373"/>'
        f'<rect x="60" y="100" width="100" height="60" rx="10" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<circle cx="{CX}" cy="130" r="14" fill="#5a2a64"/>'
    )
    cute_inner = (
        f'<rect x="20" y="160" width="180" height="40" fill="#d4a373"/>'
        f'<rect x="50" y="80" width="120" height="80" rx="12" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, 115, 1.0)
    )
    return _frame_microscope(micro_inner, "#f1e0c0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def adipocyte_shape(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#ffd166")
    micro_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="90" fill="#e6d5a8" stroke="#5a2a1f" stroke-width="2"/>'
        f'<circle cx="{CX}" cy="{CY}" r="75" fill="#f5edd0"/>'
        f'<ellipse cx="40" cy="110" rx="14" ry="8" fill="#5a2a64"/>'
    )
    flat_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="90" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<circle cx="{CX}" cy="{CY}" r="72" fill="#fff" opacity="0.7"/>'
        f'<ellipse cx="40" cy="110" rx="14" ry="8" fill="#5a2a64"/>'
    )
    cute_inner = (
        f'<circle cx="{CX}" cy="{CY + 5}" r="90" fill="{flat}" stroke="#222" stroke-width="3"/>'
        f'<circle cx="{CX}" cy="{CY + 8}" r="68" fill="#fff" opacity="0.7" stroke="#222" stroke-width="2" stroke-dasharray="3 3"/>'
        + _face(CX, CY, 1.1)
    )
    return _frame_microscope(micro_inner, "#f1e0c0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def endothelial_shape(palette: dict) -> tuple[str, str, str]:
    flat = palette.get("flat", "#a8dadc")
    fenestrae = palette.get("fenestrae", False)
    lumen = palette.get("lumen", True)
    micro_inner = ""
    if lumen:
        micro_inner += f'<rect x="0" y="80" width="220" height="60" fill="#e8b3c5" opacity="0.45"/>'
    micro_inner += f'<rect x="0" y="60" width="220" height="20" fill="#d6a78a"/>'
    micro_inner += f'<rect x="0" y="140" width="220" height="20" fill="#d6a78a"/>'
    micro_inner += '<ellipse cx="60" cy="70" rx="14" ry="6" fill="#3a1845"/>'
    micro_inner += '<ellipse cx="140" cy="70" rx="14" ry="6" fill="#3a1845"/>'
    micro_inner += '<ellipse cx="80" cy="150" rx="14" ry="6" fill="#3a1845"/>'
    micro_inner += '<ellipse cx="160" cy="150" rx="14" ry="6" fill="#3a1845"/>'
    if fenestrae:
        for i in range(8):
            micro_inner += f'<circle cx="{20 + i * 24}" cy="70" r="3" fill="#fff" opacity="0.7"/>'
            micro_inner += f'<circle cx="{20 + i * 24}" cy="150" r="3" fill="#fff" opacity="0.7"/>'
    flat_inner = ""
    if lumen:
        flat_inner += f'<rect x="0" y="80" width="220" height="60" fill="#e63946" opacity="0.4"/>'
    flat_inner += f'<rect x="0" y="60" width="220" height="20" fill="{flat}" stroke="#0e2a47" stroke-width="2"/>'
    flat_inner += f'<rect x="0" y="140" width="220" height="20" fill="{flat}" stroke="#0e2a47" stroke-width="2"/>'
    for cx, cy in [(60, 70), (140, 70), (80, 150), (160, 150)]:
        flat_inner += f'<ellipse cx="{cx}" cy="{cy}" rx="12" ry="5" fill="#1d3557"/>'
    if fenestrae:
        for i in range(8):
            flat_inner += f'<circle cx="{20 + i * 24}" cy="70" r="4" fill="#fff" opacity="0.9"/>'
            flat_inner += f'<circle cx="{20 + i * 24}" cy="150" r="4" fill="#fff" opacity="0.9"/>'
    cute_inner = (
        f'<rect x="20" y="60" width="180" height="100" rx="20" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + (f'<rect x="30" y="95" width="160" height="30" rx="14" fill="#e63946" opacity="0.5"/>' if lumen else '')
        + _face(CX, 110, 1.0)
    )
    return _frame_microscope(micro_inner, "#f2d6c2"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def stem_cell_shape(palette: dict) -> tuple[str, str, str]:
    """Generic small undifferentiated cell with a glow."""
    flat = palette.get("flat", "#90e0ef")
    micro_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="55" fill="#c2dfe3" stroke="#3a5a6a" stroke-width="2"/>'
        f'<circle cx="{CX - 4}" cy="{CY - 4}" r="38" fill="#5a2a64" opacity="0.85"/>'
        f'<circle cx="{CX - 14}" cy="{CY - 12}" r="6" fill="#fff" opacity="0.5"/>'
    )
    flat_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="80" fill="#caf0f8" opacity="0.4"/>'
        f'<circle cx="{CX}" cy="{CY}" r="55" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        f'<circle cx="{CX - 4}" cy="{CY - 4}" r="36" fill="#0077b6"/>'
        + "".join(f'<circle cx="{CX - 60 + (i * 30) % 130}" cy="{CY - 70 + (i * 23) % 140}" r="3" fill="#fff" opacity="0.8"/>' for i in range(10))
    )
    cute_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="85" fill="#caf0f8" opacity="0.5"/>'
        + "".join(f'<polygon points="{CX + 80 * __import__("math").cos(__import__("math").radians(a)):.0f},{CY + 80 * __import__("math").sin(__import__("math").radians(a)):.0f} {CX + 90 * __import__("math").cos(__import__("math").radians(a - 4)):.0f},{CY + 90 * __import__("math").sin(__import__("math").radians(a - 4)):.0f} {CX + 95 * __import__("math").cos(__import__("math").radians(a)):.0f},{CY + 95 * __import__("math").sin(__import__("math").radians(a)):.0f} {CX + 90 * __import__("math").cos(__import__("math").radians(a + 4)):.0f},{CY + 90 * __import__("math").sin(__import__("math").radians(a + 4)):.0f}" fill="#ffd166"/>' for a in range(0, 360, 45))
        + f'<circle cx="{CX}" cy="{CY + 5}" r="60" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY - 2, 1.1)
    )
    return _frame_microscope(micro_inner, "#e0eef0"), _frame_flat(flat_inner), _frame_cute(cute_inner)


def megakaryocyte_shape(palette: dict) -> tuple[str, str, str]:
    """Huge multilobed nucleus."""
    flat = palette.get("flat", "#ffb4a2")
    micro_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="92" fill="#e6c2cf" stroke="#5a2a4a" stroke-width="2"/>'
        + "".join(f'<circle cx="{CX + 38 * __import__("math").cos(__import__("math").radians(a)):.0f}" cy="{CY + 38 * __import__("math").sin(__import__("math").radians(a)):.0f}" r="28" fill="#3a1845" opacity="0.85"/>' for a in range(0, 360, 60))
    )
    flat_inner = (
        f'<circle cx="{CX}" cy="{CY}" r="92" fill="{flat}" stroke="#0e2a47" stroke-width="4"/>'
        + "".join(f'<circle cx="{CX + 38 * __import__("math").cos(__import__("math").radians(a)):.0f}" cy="{CY + 38 * __import__("math").sin(__import__("math").radians(a)):.0f}" r="28" fill="#5a2a64" stroke="#0e2a47" stroke-width="2"/>' for a in range(0, 360, 60))
    )
    cute_inner = (
        f'<circle cx="{CX}" cy="{CY + 5}" r="92" fill="{flat}" stroke="#222" stroke-width="3"/>'
        + _face(CX, CY - 8, 1.2)
    )
    return _frame_microscope(micro_inner, "#f2d6e0"), _frame_flat(flat_inner), _frame_cute(cute_inner)
