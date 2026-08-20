#!/usr/bin/env python3
"""
Download one real microscope image per cell / pathogen type.

Sources tried in order per cell type:
  1. Cell Image Library (CIL)  – https://www.cellimagelibrary.org
  2. Human Protein Atlas (HPA) – https://www.proteinatlas.org
  3. Wikimedia Commons          – https://commons.wikimedia.org

All downloads are resized / centre-cropped to 512×512 by ImageMagick.
Provenance is written to images/images.txt.

Usage:
    python fetch_images.py            # skip existing files
    python fetch_images.py --force    # re-download everything
"""
from __future__ import annotations
import json, os, ssl, subprocess, sys, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

# ── paths ────────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE, "images")
LOG_FILE   = os.path.join(IMAGES_DIR, "images.txt")
os.makedirs(IMAGES_DIR, exist_ok=True)

UA = "MicrobesPosterFetcher/2.0 (educational project)"
RASTER = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}

# SSL context that ignores cert errors (needed for CIL)
NO_VERIFY = ssl.create_default_context()
NO_VERIFY.check_hostname = False
NO_VERIFY.verify_mode    = ssl.CERT_NONE

# ── log helper ───────────────────────────────────────────────────────────────
LOG: dict[str, dict] = {}   # key → {source, page_url, image_url, license, attribution}

def load_log():
    if not os.path.exists(LOG_FILE):
        return
    with open(LOG_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) >= 6:
                key = parts[0]
                LOG[key] = {
                    "source":      parts[1],
                    "page_url":    parts[2],
                    "image_url":   parts[3],
                    "license":     parts[4],
                    "attribution": parts[5],
                }

def save_log():
    with open(LOG_FILE, "w") as f:
        f.write("# key\tsource\tpage_url\timage_url\tlicense\tattribution\n")
        for key, d in sorted(LOG.items()):
            f.write("\t".join([
                key,
                d.get("source",""),
                d.get("page_url",""),
                d.get("image_url",""),
                d.get("license",""),
                d.get("attribution",""),
            ]) + "\n")

# ── HTTP helpers ─────────────────────────────────────────────────────────────
def _get(url: str, ctx=None, timeout=20, retries=3, base_delay=4.0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    delay = base_delay
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"      [429] rate-limit, wait {delay:.0f}s…")
                time.sleep(delay); delay *= 2
            else:
                raise
    raise RuntimeError(f"GET failed after {retries} retries: {url}")

def download_file(url: str, dest: str, ctx=None) -> bool:
    try:
        data = _get(url, ctx=ctx, timeout=40)
        with open(dest, "wb") as f: f.write(data)
        return True
    except Exception as e:
        print(f"      download error: {e}")
        return False

def to_512(src: str, dst: str) -> bool:
    r = subprocess.run(
        ["convert", src, "-resize", "512x512^",
         "-gravity", "Center", "-extent", "512x512", dst],
        capture_output=True, text=True)
    if r.returncode != 0:
        print(f"      convert error: {r.stderr.strip()}")
        return False
    return True

def try_download(key: str, img_url: str, out_path: str, ctx=None) -> bool:
    ext = os.path.splitext(img_url.split("?")[0])[1].lower() or ".jpg"
    if ext not in RASTER: return False
    tmp = os.path.join(IMAGES_DIR, key + "_tmp" + ext)
    print(f"      dl {img_url[:90]}…")
    if not download_file(img_url, tmp, ctx=ctx): return False
    ok = to_512(tmp, out_path)
    try: os.remove(tmp)
    except OSError: pass
    return ok

# ══════════════════════════════════════════════════════════════════════════════
# Source 1 – Cell Image Library
# ══════════════════════════════════════════════════════════════════════════════
CIL_BASE   = "https://www.cellimagelibrary.org"
CIL_THUMB  = "https://cildata.crbs.ucsd.edu/media/thumbnail_display/{id}/{id}_thumbnailx512.jpg"

def cil_search(query: str, size: int = 10) -> list[dict]:
    url = (CIL_BASE + "/rest/public_documents?"
           + urllib.parse.urlencode({"search": query, "from": 0, "size": size}))
    try:
        raw = _get(url, ctx=NO_VERIFY)
        data = json.loads(raw)
    except Exception as e:
        print(f"      CIL search error: {e}")
        return []
    hits = data.get("hits", {}).get("hits", [])
    return hits

def cil_license(hit: dict) -> tuple[str, str]:
    """Return (license_str, attribution_str) from a CIL hit."""
    src = hit.get("_source", {})
    rights = (src.get("CIL_CCDB", {})
                 .get("CIL", {})
                 .get("Rights", {}) or {})
    lic   = rights.get("License", "") or rights.get("copyright_statement","")
    attr  = rights.get("CopyrightStatement", "") or rights.get("attribution","")
    if not lic:
        lic = "see CIL page"
    return lic, attr

def fetch_from_cil(key: str, query: str, out_path: str) -> bool:
    hits = cil_search(query)
    for hit in hits:
        cil_id = hit.get("_id", "")
        if not cil_id:
            continue
        # Skip videos
        src = hit.get("_source", {})
        if src.get("CIL_CCDB", {}).get("CIL", {}).get("Image", {}).get("Video", False):
            continue
        thumb_url = CIL_THUMB.format(id=cil_id)
        page_url  = f"{CIL_BASE}/images/{cil_id.replace('CIL_','')}"
        lic, attr = cil_license(hit)
        print(f"      CIL hit {cil_id}: {thumb_url[:60]}…")
        if try_download(key, thumb_url, out_path, ctx=NO_VERIFY):
            LOG[key] = {
                "source":      "Cell Image Library",
                "page_url":    page_url,
                "image_url":   thumb_url,
                "license":     lic,
                "attribution": attr or f"CIL {cil_id}",
            }
            return True
        time.sleep(1)
    return False

# ══════════════════════════════════════════════════════════════════════════════
# Source 2 – Human Protein Atlas
# ══════════════════════════════════════════════════════════════════════════════
HPA_BASE = "https://www.proteinatlas.org"
HPA_IMG  = "https://images.proteinatlas.org"

# cell-type key → (ENSG ID, human-readable gene name, tissue keyword to prefer)
HPA_GENES: dict[str, tuple[str, str, str]] = {
    "helper_t_cell":         ("ENSG00000198851", "CD3E",   "lymph node"),
    "cytotoxic_t_cell":      ("ENSG00000153563", "CD8A",   "lymph node"),
    "b_cell":                ("ENSG00000156738", "MS4A1",  "lymph node"),
    "plasma_cell":           ("ENSG00000115884", "SDC1",   "tonsil"),
    "nk_cell":               ("ENSG00000149294", "NCAM1",  "spleen"),
    "treg_cell":             ("ENSG00000049249", "TNFRSF9","lymph node"),
    "macrophage":            ("ENSG00000129226", "CD68",   "spleen"),
    "dendritic_cell":        ("ENSG00000158477", "CD1A",   "skin"),
    "neutrophil":            ("ENSG00000005381", "MPO",    "bone marrow"),
    "eosinophil":            ("ENSG00000121649", "EPX",    "appendix"),
    "basophil":              ("ENSG00000140287", "HDC",    ""),
    "mast_cell":             ("ENSG00000157404", "KIT",    "small intestine"),
    "hematopoietic_stem_cell":("ENSG00000117091","CD48",   "bone marrow"),
    "erythrocyte":           ("ENSG00000244734", "HBB",    "bone marrow"),
    "megakaryocyte":         ("ENSG00000005961", "ITGA2B", "bone marrow"),
    "thrombocyte":           ("ENSG00000005961", "ITGA2B", ""),
    "monocyte":              ("ENSG00000170458", "CD14",   "spleen"),
    "lymphocyte":            ("ENSG00000198851", "CD3E",   "lymph node"),
    "mesenchymal_stem_cell": ("ENSG00000026025", "VIM",    ""),
    "osteoblast":            ("ENSG00000181577", "BGLAP",  "bone"),
    "chondrocyte":           ("ENSG00000139219", "COL2A1", "cartilage"),
    "myocyte":               ("ENSG00000175084", "DES",    "skeletal muscle"),
    "adipocyte":             ("ENSG00000181092", "ADIPOQ", "adipose tissue"),
    "fibroblast":            ("ENSG00000026025", "VIM",    "breast"),
    "neural_stem_cell":      ("ENSG00000102882", "MAPK3",  ""),
    "neuron":                ("ENSG00000078018", "MAP2",   "cerebral cortex"),
    "astrocyte":             ("ENSG00000131095", "GFAP",   "cerebral cortex"),
    "oligodendrocyte":       ("ENSG00000197971", "MBP",    "white matter"),
    "microglia":             ("ENSG00000168329", "CX3CR1", "cerebral cortex"),
    "schwann_cell":          ("ENSG00000158887", "MPZ",    "peripheral nerve"),
    "keratinocyte":          ("ENSG00000186832", "KRT14",  "skin"),
    "enterocyte":            ("ENSG00000163347", "CDHR1",  "small intestine"),
    "goblet_cell":           ("ENSG00000169255", "MUC2",   "colon"),
    "paneth_cell":           ("ENSG00000100714", "DEFA5",  "small intestine"),
    "alveolar_cell_type_ii": ("ENSG00000197488", "ABCA3",  "lung"),
    "urothelial_cell":       ("ENSG00000143546", "S100A8", "urinary bladder"),
    "endothelial_progenitor":("ENSG00000110799", "VWF",    ""),
    "endothelial_cell":      ("ENSG00000110799", "VWF",    "liver"),
    "fenestrated_endothelium":("ENSG00000110799","VWF",    "kidney"),
    "sinusoidal_endothelium":("ENSG00000110799", "VWF",    "liver"),
    "lymphatic_endothelium": ("ENSG00000183690", "PROX1",  "lymph node"),
    "bbb_endothelium":       ("ENSG00000110799", "VWF",    "cerebral cortex"),
    "ips_cell":              ("ENSG00000181449", "SOX2",   ""),
    "cardiomyocyte":         ("ENSG00000197616", "MYH6",   "heart muscle"),
    "hepatocyte":            ("ENSG00000163631", "ALB",    "liver"),
    "beta_cell":             ("ENSG00000254647", "INS",    "pancreas"),
    "retinal_pigment_epithelium":("ENSG00000116745","RPE65","retina"),
    "dopaminergic_neuron":   ("ENSG00000180176", "TH",     "substantia nigra"),
}

def fetch_from_hpa(key: str, out_path: str) -> bool:
    if key not in HPA_GENES:
        return False
    ensg, gene, tissue_kw = HPA_GENES[key]
    xml_url = f"{HPA_BASE}/{ensg}.xml"
    print(f"      HPA {gene} ({ensg}) xml…")
    try:
        raw = _get(xml_url, timeout=30)
    except Exception as e:
        print(f"      HPA XML error: {e}")
        return False
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as e:
        print(f"      HPA XML parse error: {e}")
        return False

    # Collect imageUrl elements, optionally preferring a tissue keyword
    ns = ""
    image_urls = []
    for elem in root.iter("imageUrl"):
        img_url = (elem.text or "").strip()
        if img_url:
            image_urls.append(img_url)

    if not image_urls:
        print(f"      HPA: no imageUrl found")
        return False

    # Prefer URL that matches tissue keyword
    preferred = image_urls
    if tissue_kw:
        kw = tissue_kw.lower().replace(" ", "_")
        preferred = [u for u in image_urls if kw in u.lower()] or image_urls

    img_url = preferred[0]
    page_url = f"{HPA_BASE}/{ensg}/tissue"
    if try_download(key, img_url, out_path):
        LOG[key] = {
            "source":      "Human Protein Atlas",
            "page_url":    page_url,
            "image_url":   img_url,
            "license":     "CC BY-SA 3.0",
            "attribution": f"Human Protein Atlas – {gene} ({ensg}), CC BY-SA 3.0",
        }
        return True
    return False

# ══════════════════════════════════════════════════════════════════════════════
# Source 3 – Wikimedia Commons (thumbnail API)
# ══════════════════════════════════════════════════════════════════════════════
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

def _commons_api(params: dict) -> dict:
    url = COMMONS_API + "?" + urllib.parse.urlencode(params)
    raw = _get(url)
    return json.loads(raw)

def commons_search(query: str, n: int = 8) -> list[str]:
    data = _commons_api({
        "action": "query", "list": "search",
        "srsearch": query, "srnamespace": "6",
        "srlimit": str(n), "format": "json",
    })
    titles = [h["title"] for h in data.get("query",{}).get("search",[])]
    return [t for t in titles
            if os.path.splitext(t.lower())[1] in RASTER]

def commons_thumb_and_license(file_title: str, width: int = 512) -> tuple[str,str,str] | None:
    """Return (thumb_url, license, attribution) or None."""
    data = _commons_api({
        "action": "query", "titles": file_title,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": str(width),
        "format": "json",
    })
    for page in data.get("query",{}).get("pages",{}).values():
        info = (page.get("imageinfo") or [{}])[0]
        mt = info.get("mediatype", "BITMAP")
        if mt not in ("BITMAP", ""): return None
        thumb = info.get("thumburl") or info.get("url","")
        if not thumb: return None
        meta  = info.get("extmetadata", {})
        lic   = (meta.get("LicenseShortName",{}).get("value","")
                 or meta.get("License",{}).get("value","") or "see Commons page")
        attr  = (meta.get("Attribution",{}).get("value","")
                 or meta.get("Artist",{}).get("value","")
                 or meta.get("Credit",{}).get("value","") or file_title)
        # Strip any HTML tags from attr
        import re
        attr = re.sub(r"<[^>]+>", "", attr).strip()
        return thumb, lic, attr
    return None

def fetch_from_commons(key: str, query: str, out_path: str) -> bool:
    titles = commons_search(query)
    for file_title in titles:
        result = commons_thumb_and_license(file_title)
        if not result:
            time.sleep(0.5)
            continue
        thumb_url, lic, attr = result
        page_url = ("https://commons.wikimedia.org/wiki/"
                    + file_title.replace(" ", "_"))
        if try_download(key, thumb_url, out_path):
            LOG[key] = {
                "source":      "Wikimedia Commons",
                "page_url":    page_url,
                "image_url":   thumb_url,
                "license":     lic,
                "attribution": attr,
            }
            return True
        time.sleep(1)
    return False

# ══════════════════════════════════════════════════════════════════════════════
# Per-cell source strategy
# ══════════════════════════════════════════════════════════════════════════════
# Each entry: (primary_source, cil_query_or_None, commons_query_or_None)
# primary_source: "cil" | "hpa" | "commons"
STRATEGY: dict[str, tuple[str, str|None, str|None]] = {
    # Immune – lymphocytes
    "helper_t_cell":         ("cil",     "helper T cell CD4 microscopy",         "CD4 T lymphocyte microscopy"),
    "cytotoxic_t_cell":      ("cil",     "cytotoxic T cell CD8 microscopy",      "CD8 T cell electron microscopy"),
    "b_cell":                ("cil",     "B lymphocyte microscopy",               "B cell lymphocyte microscopy"),
    "plasma_cell":           ("hpa",     "plasma cell histology",                 "plasma cell histology"),
    "nk_cell":               ("cil",     "natural killer cell microscopy",        "natural killer cell microscopy"),
    "treg_cell":             ("hpa",     "regulatory T cell microscopy",          "regulatory T cell lymphocyte"),
    # Immune – myeloid
    "macrophage":            ("cil",     "macrophage electron microscopy",        "macrophage electron microscopy"),
    "dendritic_cell":        ("cil",     "dendritic cell electron microscopy",    "dendritic cell electron microscopy"),
    "neutrophil":            ("cil",     "neutrophil granulocyte microscopy",     "neutrophil granulocyte blood smear"),
    "eosinophil":            ("cil",     "eosinophil granulocyte blood smear",    "eosinophil blood smear"),
    "basophil":              ("commons", "basophil blood smear",                  "basophil granulocyte blood smear"),
    "mast_cell":             ("cil",     "mast cell histology",                   "mast cell tissue histology"),
    # Pathogens – generic
    "cocci_bacteria":        ("commons", None,                                    "Streptococcus SEM electron microscopy"),
    "rod_bacteria":          ("commons", None,                                    "rod bacteria SEM electron microscopy Bacillus"),
    "virus_particle":        ("commons", None,                                    "virus TEM electron microscopy bacteriophage"),
    "fungus":                ("commons", None,                                    "Aspergillus hyphae SEM microscopy"),
    "parasite":              ("commons", None,                                    "Plasmodium falciparum blood film malaria"),
    "prion":                 ("commons", None,                                    "prion disease CJD brain histology"),
    # Pathogens – named bacteria
    "mycobacterium_tuberculosis": ("commons", None, "Mycobacterium tuberculosis SEM electron"),
    "staphylococcus_aureus":      ("commons", None, "Staphylococcus aureus SEM electron"),
    "streptococcus_pneumoniae":   ("commons", None, "Streptococcus pneumoniae SEM electron"),
    "escherichia_coli":           ("commons", None, "Escherichia coli SEM electron microscopy"),
    "salmonella_enterica":        ("commons", None, "Salmonella enterica SEM electron"),
    "helicobacter_pylori":        ("commons", None, "Helicobacter pylori SEM electron microscopy"),
    # Pathogens – named viruses / other
    "influenza_virus":       ("commons", None, "Influenza virus TEM electron microscopy"),
    "sars_cov_2":            ("commons", None, "SARS-CoV-2 coronavirus TEM electron microscopy"),
    "hiv":                   ("commons", None, "HIV electron microscopy TEM"),
    "hepatitis_b_virus":     ("commons", None, "Hepatitis B virus TEM electron"),
    "plasmodium_malaria":    ("commons", None, "Plasmodium falciparum blood film"),
    "candida_albicans":      ("commons", None, "Candida albicans microscopy SEM"),
    # Blood / bone marrow
    "hematopoietic_stem_cell": ("cil",   "hematopoietic stem cell bone marrow",  "hematopoietic stem cell bone marrow"),
    "erythrocyte":           ("cil",     "erythrocyte red blood cell SEM",        "erythrocyte red blood cell SEM"),
    "megakaryocyte":         ("cil",     "megakaryocyte bone marrow histology",   "megakaryocyte bone marrow histology"),
    "thrombocyte":           ("cil",     "platelet thrombocyte SEM",              "platelet SEM electron microscopy"),
    "monocyte":              ("cil",     "monocyte blood smear microscopy",       "monocyte blood smear histology"),
    "lymphocyte":            ("cil",     "lymphocyte blood smear microscopy",     "lymphocyte blood smear histology"),
    # Connective / mesenchymal
    "mesenchymal_stem_cell": ("cil",     "mesenchymal stem cell culture",         "mesenchymal stem cell microscopy"),
    "osteoblast":            ("cil",     "osteoblast bone histology",             "osteoblast bone histology"),
    "chondrocyte":           ("cil",     "chondrocyte cartilage histology",       "chondrocyte cartilage histology"),
    "myocyte":               ("cil",     "muscle cell myocyte microscopy",        "skeletal muscle cell histology"),
    "adipocyte":             ("cil",     "adipocyte fat cell histology",          "adipocyte fat cell histology"),
    "fibroblast":            ("cil",     "fibroblast cell culture microscopy",    "fibroblast histology microscopy"),
    # Neural
    "neural_stem_cell":      ("cil",     "neural stem cell neurosphere",          "neural stem cell microscopy"),
    "neuron":                ("cil",     "neuron microscopy Golgi stain",         "neuron Purkinje cell histology Golgi"),
    "astrocyte":             ("cil",     "astrocyte GFAP brain",                  "astrocyte GFAP brain microscopy"),
    "oligodendrocyte":       ("cil",     "oligodendrocyte myelin",                "oligodendrocyte myelin histology"),
    "microglia":             ("cil",     "microglia brain microscopy",            "microglia brain histology"),
    "schwann_cell":          ("cil",     "Schwann cell peripheral nerve",         "Schwann cell nerve histology"),
    # Epithelial
    "keratinocyte":          ("cil",     "keratinocyte skin cell microscopy",     "keratinocyte skin epidermis histology"),
    "enterocyte":            ("cil",     "enterocyte intestine villi",            "enterocyte small intestine villi histology"),
    "goblet_cell":           ("cil",     "goblet cell intestine mucus",           "goblet cell intestine mucus"),
    "paneth_cell":           ("cil",     "Paneth cell intestine crypt",           "Paneth cell intestine crypt histology"),
    "alveolar_cell_type_ii": ("cil",     "alveolar type II cell lung",            "alveolar type II cell lung TEM"),
    "urothelial_cell":       ("cil",     "urothelial cell bladder",               "urothelium bladder histology"),
    # Endothelial
    "endothelial_progenitor":("cil",     "endothelial progenitor cell",           "endothelial progenitor cell microscopy"),
    "endothelial_cell":      ("cil",     "endothelial cell vessel microscopy",    "endothelial cell TEM electron"),
    "fenestrated_endothelium":("cil",    "fenestrated endothelium capillary",     "fenestrated endothelium TEM"),
    "sinusoidal_endothelium":("cil",     "liver sinusoidal endothelial cell",     "liver sinusoid electron microscopy"),
    "lymphatic_endothelium": ("cil",     "lymphatic endothelium vessel",          "lymphatic endothelium histology"),
    "bbb_endothelium":       ("cil",     "blood brain barrier endothelium",       "blood brain barrier TEM endothelium"),
    # Specialised
    "ips_cell":              ("cil",     "induced pluripotent stem cell iPSC",    "iPS cell induced pluripotent microscopy"),
    "cardiomyocyte":         ("cil",     "cardiomyocyte heart muscle cell",       "cardiomyocyte cardiac muscle histology"),
    "hepatocyte":            ("hpa",     "hepatocyte liver cell histology",       "hepatocyte liver histology"),
    "beta_cell":             ("hpa",     "islet Langerhans pancreas beta cell",   "islet Langerhans histology beta cell"),
    "retinal_pigment_epithelium":("cil", "retinal pigment epithelium RPE",        "retinal pigment epithelium RPE microscopy"),
    "dopaminergic_neuron":   ("cil",     "dopaminergic neuron dopamine",          "dopaminergic neuron substantia nigra histology"),
}

# ══════════════════════════════════════════════════════════════════════════════
# Main fetch logic
# ══════════════════════════════════════════════════════════════════════════════
def fetch_cell(key: str, force: bool = False) -> bool:
    out_path = os.path.join(IMAGES_DIR, key + ".jpg")
    if os.path.exists(out_path) and not force:
        print(f"  [skip] {key}")
        return True

    primary, cil_q, commons_q = STRATEGY.get(key, ("commons", key, key))

    # Order of attempts
    attempts = []
    if primary == "cil":
        attempts = [("cil", cil_q), ("hpa", None), ("commons", commons_q)]
    elif primary == "hpa":
        attempts = [("hpa", None), ("cil", cil_q), ("commons", commons_q)]
    else:  # commons-first
        attempts = [("commons", commons_q), ("cil", cil_q), ("hpa", None)]

    for source, query in attempts:
        print(f"  trying source={source} …")
        ok = False
        try:
            if source == "cil" and query:
                ok = fetch_from_cil(key, query, out_path)
            elif source == "hpa":
                ok = fetch_from_hpa(key, out_path)
            elif source == "commons" and query:
                ok = fetch_from_commons(key, query, out_path)
        except Exception as e:
            print(f"    error ({source}): {e}")
        if ok:
            print(f"  [OK] {key} from {source}")
            save_log()
            return True
        time.sleep(1.5)

    print(f"  [FAIL] {key}")
    return False

# ══════════════════════════════════════════════════════════════════════════════
def main():
    load_log()
    force = "--force" in sys.argv
    keys  = list(STRATEGY.keys())

    ok, failed = 0, []
    for key in keys:
        print(f"\n─── {key} ───")
        if fetch_cell(key, force=force):
            ok += 1
        else:
            failed.append(key)
        time.sleep(0.5)

    save_log()
    print(f"\n{'═'*60}")
    print(f"Done: {ok}/{len(keys)} succeeded.")
    if failed:
        print("Failed:", ", ".join(failed))
    imgs = [f for f in os.listdir(IMAGES_DIR) if f.endswith(".jpg") and f != "images.txt"]
    print(f"Total images: {len(imgs)}")

if __name__ == "__main__":
    main()
