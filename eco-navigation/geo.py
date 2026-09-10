#!/usr/bin/env python3
"""
geo.py — shared geodesy / GPX helpers for the eco-navigation experiment.

Pure standard library. Imported by build.py, fetch_real_data.py and
fetch_routes.py so all three agree on distance, bearing and resampling.
"""
import math
import os
import xml.etree.ElementTree as ET

R_EARTH = 6371000.0
GPX_NS = "http://www.topografix.com/GPX/1/1"


def hav(a, b):
    """Great-circle distance in metres between (lat,lon) tuples."""
    la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    h = (math.sin((la2 - la1) / 2) ** 2
         + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2)
    return 2 * R_EARTH * math.asin(math.sqrt(h))


def bearing(a, b):
    """Initial bearing a->b in degrees (0..360)."""
    la1, la2 = math.radians(a[0]), math.radians(b[0])
    dlo = math.radians(b[1] - a[1])
    x = math.sin(dlo) * math.cos(la2)
    y = math.cos(la1) * math.sin(la2) - math.sin(la1) * math.cos(la2) * math.cos(dlo)
    return math.degrees(math.atan2(x, y)) % 360


def angdiff(a, b):
    """Signed smallest angle from bearing a to bearing b, in degrees."""
    return (b - a + 180) % 360 - 180


def path_length(pts):
    return sum(hav(pts[i - 1], pts[i]) for i in range(1, len(pts)))


def resample(pts, step=25.0):
    """Resample a polyline to a uniform step.

    Returns (points, total_length_m) where points are (lat, lon, cum_dist_m).
    """
    out = [(pts[0][0], pts[0][1], 0.0)]
    target = step
    acc = 0.0
    for i in range(1, len(pts)):
        a, b = pts[i - 1], pts[i]
        seg = hav(a, b)
        if seg == 0:
            continue
        while acc + seg >= target:
            f = (target - acc) / seg
            out.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, target))
            target += step
        acc += seg
    total = path_length(pts)
    if out[-1][2] < total - 1:
        out.append((pts[-1][0], pts[-1][1], total))
    return out, total


def smooth(seq, win):
    """Centred moving average with shrinking window at the edges."""
    n = len(seq)
    out = [0.0] * n
    h = win // 2
    for i in range(n):
        lo, hi = max(0, i - h), min(n, i + h + 1)
        out[i] = sum(seq[lo:hi]) / (hi - lo)
    return out


def median(seq):
    s = sorted(seq)
    n = len(s)
    if not n:
        return None
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2.0


# ----------------------------------------------------------------- GPX I/O
def read_gpx(path):
    """Return [(lat, lon)] — and [(lat, lon, ele)] is available via read_gpx_ele."""
    root = ET.parse(path).getroot()
    return [(float(p.get("lat")), float(p.get("lon")))
            for p in root.iter("{%s}trkpt" % GPX_NS)]


def read_gpx_ele(path):
    """Return [(lat, lon, ele_or_None)] for tracks that may carry <ele>."""
    root = ET.parse(path).getroot()
    out = []
    for p in root.iter("{%s}trkpt" % GPX_NS):
        e = p.find("{%s}ele" % GPX_NS)
        out.append((float(p.get("lat")), float(p.get("lon")),
                    float(e.text) if e is not None and e.text else None))
    return out


def write_gpx(path, pts, name="route", elevations=None):
    """Write a minimal GPX 1.1 track. pts=[(lat,lon)], elevations optional."""
    ET.register_namespace("", GPX_NS)
    gpx = ET.Element("{%s}gpx" % GPX_NS, {"version": "1.1", "creator": "eco-navigation"})
    trk = ET.SubElement(gpx, "{%s}trk" % GPX_NS)
    ET.SubElement(trk, "{%s}name" % GPX_NS).text = name
    seg = ET.SubElement(trk, "{%s}trkseg" % GPX_NS)
    for i, p in enumerate(pts):
        tp = ET.SubElement(seg, "{%s}trkpt" % GPX_NS,
                           {"lat": f"{p[0]:.6f}", "lon": f"{p[1]:.6f}"})
        if elevations is not None:
            ET.SubElement(tp, "{%s}ele" % GPX_NS).text = f"{elevations[i]:.1f}"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    ET.ElementTree(gpx).write(path, encoding="utf-8", xml_declaration=True)
