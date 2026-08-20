#!/usr/bin/env python3
"""
Targeted fix for the 8 images that failed in the main run.
Uses specific known-good Wikimedia Commons filenames + HPA fallbacks.
"""
from __future__ import annotations
import json, os, ssl, subprocess, sys, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

BASE       = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE, "images")
LOG_FILE   = os.path.join(IMAGES_DIR, "images.txt")
UA         = "MicrobesPosterFetcher/2.0 (educational project)"
RASTER     = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
COMMONS    = "https://commons.wikimedia.org/w/api.php"

NO_VERIFY = ssl.create_default_context()
NO_VERIFY.check_hostname = False
NO_VERIFY.verify_mode    = ssl.CERT_NONE

# ── Known-good Commons filenames for failures ────────────────────────────────
TARGETS = {
    "fungus":              "File:Aspergillus niger SEM.jpg",
    "prion":               "File:CWD.JPG",
    "escherichia_coli":    "File:Escherichia coli (SEM).jpg",
    "helicobacter_pylori": "File:Helicobacter sp 01.jpg",
    "influenza_virus":     "File:Influenza A virus - negative stain image TEM.JPG",
    "sars_cov_2":          "File:2019-nCoV-CDC-23312.png",
    "hiv":                 "File:HIV-budding-Color.jpg",
    # alveolar_cell_type_ii → HPA SFTPB gene
}
# HPA fallback for alveolar_cell_type_ii
HPA_FALLBACK = {
    "alveolar_cell_type_ii": ("ENSG00000168878", "SFTPB"),
}

def _get(url, ctx=None, timeout=30, retries=3, base_delay=5.0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    delay = base_delay
    for _ in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"  [429] wait {delay:.0f}s…")
                time.sleep(delay); delay *= 2
            else:
                raise
    raise RuntimeError(f"Failed: {url}")

def download(url, dest, ctx=None) -> bool:
    try:
        data = _get(url, ctx=ctx, timeout=40)
        with open(dest, "wb") as f: f.write(data)
        return True
    except Exception as e:
        print(f"  dl error: {e}"); return False

def to_512(src, dst) -> bool:
    r = subprocess.run(
        ["convert", src, "-resize", "512x512^",
         "-gravity", "Center", "-extent", "512x512", dst],
        capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  convert error: {r.stderr.strip()}"); return False
    return True

def commons_thumb_and_meta(file_title, width=512):
    import re
    params = {
        "action": "query", "titles": file_title,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": str(width),
        "format": "json",
    }
    url = COMMONS + "?" + urllib.parse.urlencode(params)
    data = json.loads(_get(url))
    for page in data.get("query",{}).get("pages",{}).values():
        info = (page.get("imageinfo") or [{}])[0]
        mt = info.get("mediatype", "BITMAP")
        if mt not in ("BITMAP", ""): return None
        thumb = info.get("thumburl") or info.get("url","")
        if not thumb: return None
        meta  = info.get("extmetadata", {})
        lic   = (meta.get("LicenseShortName",{}).get("value","")
                 or meta.get("License",{}).get("value","") or "Public Domain / see Commons")
        attr  = (meta.get("Attribution",{}).get("value","")
                 or meta.get("Artist",{}).get("value","")
                 or meta.get("Credit",{}).get("value","") or file_title)
        attr = re.sub(r"<[^>]+>", "", attr).strip()
        return thumb, lic, attr
    return None

def fetch_commons(key, file_title, out_path) -> bool:
    print(f"  Commons: {file_title}")
    result = commons_thumb_and_meta(file_title)
    if not result:
        print("  no result"); return False
    thumb_url, lic, attr = result
    ext = os.path.splitext(thumb_url.split("?")[0])[1].lower() or ".jpg"
    if ext not in RASTER: return False
    tmp = os.path.join(IMAGES_DIR, key + "_tmp" + ext)
    print(f"  dl {thumb_url[:90]}…")
    if not download(thumb_url, tmp): return False
    ok = to_512(tmp, out_path)
    try: os.remove(tmp)
    except OSError: pass
    if ok:
        page_url = "https://commons.wikimedia.org/wiki/" + file_title.replace(" ","_")
        log_entry(key, "Wikimedia Commons", page_url, thumb_url, lic, attr)
    return ok

def fetch_hpa(key, ensg, gene, out_path) -> bool:
    xml_url = f"https://www.proteinatlas.org/{ensg}.xml"
    print(f"  HPA {gene} ({ensg})…")
    try:
        raw = _get(xml_url, timeout=30)
        root = ET.fromstring(raw)
    except Exception as e:
        print(f"  HPA error: {e}"); return False
    urls = [e.text.strip() for e in root.iter("imageUrl") if e.text and e.text.strip()]
    if not urls:
        print("  no imageUrl in XML"); return False
    img_url = urls[0]
    ext = os.path.splitext(img_url)[1].lower() or ".jpg"
    tmp = os.path.join(IMAGES_DIR, key + "_tmp" + ext)
    print(f"  dl {img_url[:90]}…")
    if not download(img_url, tmp): return False
    ok = to_512(tmp, out_path)
    try: os.remove(tmp)
    except OSError: pass
    if ok:
        log_entry(key, "Human Protein Atlas",
                  f"https://www.proteinatlas.org/{ensg}/tissue",
                  img_url, "CC BY-SA 3.0",
                  f"Human Protein Atlas – {gene} ({ensg}), CC BY-SA 3.0")
    return ok

LOG_ENTRIES = {}

def load_log():
    if not os.path.exists(LOG_FILE): return
    with open(LOG_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"): continue
            parts = line.split("\t")
            if len(parts) >= 6:
                LOG_ENTRIES[parts[0]] = parts[1:]

def save_log():
    with open(LOG_FILE, "w") as f:
        f.write("# key\tsource\tpage_url\timage_url\tlicense\tattribution\n")
        for key, vals in sorted(LOG_ENTRIES.items()):
            f.write(key + "\t" + "\t".join(vals) + "\n")

def log_entry(key, source, page_url, img_url, lic, attr):
    LOG_ENTRIES[key] = [source, page_url, img_url, lic, attr]

def main():
    load_log()
    force = "--force" in sys.argv
    ok = 0

    # Commons targets
    for key, file_title in TARGETS.items():
        out_path = os.path.join(IMAGES_DIR, key + ".jpg")
        if os.path.exists(out_path) and not force:
            print(f"[skip] {key}")
            ok += 1; continue
        print(f"\n─── {key} ───")
        if fetch_commons(key, file_title, out_path):
            print(f"[OK] {key}")
            ok += 1
        else:
            print(f"[FAIL] {key}")
        time.sleep(2)

    # HPA fallbacks
    for key, (ensg, gene) in HPA_FALLBACK.items():
        out_path = os.path.join(IMAGES_DIR, key + ".jpg")
        if os.path.exists(out_path) and not force:
            print(f"[skip] {key}")
            ok += 1; continue
        print(f"\n─── {key} (HPA fallback) ───")
        if fetch_hpa(key, ensg, gene, out_path):
            print(f"[OK] {key}")
            ok += 1
        else:
            print(f"[FAIL] {key}")
        time.sleep(2)

    save_log()
    total = len(TARGETS) + len(HPA_FALLBACK)
    print(f"\nDone: {ok}/{total}")
    imgs = [f for f in os.listdir(IMAGES_DIR) if f.endswith(".jpg")]
    print(f"Total images in folder: {len(imgs)}")

if __name__ == "__main__":
    main()
