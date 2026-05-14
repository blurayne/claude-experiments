#!/usr/bin/env bash
# Download microscope photographs for the microbes-overview poster.
#
# Sources are Wikimedia Commons (which mirrors CDC PHIL, NIAID, etc.).
# We use the Special:FilePath redirect endpoint so we don't have to know
# the MD5-prefixed upload URL.
#
# Usage:
#   ./fetch_images.sh                # download everything that's missing
#   FORCE=1 ./fetch_images.sh        # re-download even if local file exists
#   SHRINK=0 ./fetch_images.sh       # skip imagemagick downscale
#   PACK=0 ./fetch_images.sh         # skip tarball packaging
#
# Failures are tolerated: the build (build.py) falls back to a placeholder
# for any missing image. After running, commit microbes-overview/images/*
# and push; the workflow will rebuild the posters with the new photos.

set -uo pipefail
cd "$(dirname "$0")"

OUT_DIR="images"
mkdir -p "$OUT_DIR"

UA="microbes-overview-fetch/1.0 (https://github.com/blurayne/claude-experiments)"

# Format per line: "<local-filename>|<Wikimedia File:name>"
# Spaces in the Wikimedia filename are OK — they'll be URL-encoded.
# License/credit metadata lives in cells_data.py (image_credit, image_license).
ENTRIES=(
  # -- Immune cells (lymphocytes) --
  "immune-lymph__t-cell.jpg|Healthy Human T Cell.jpg"
  "immune-lymph__b-cell.jpg|B lymphocyte.jpg"
  "immune-lymph__nk-cell.jpg|NK cell.jpg"
  "immune-lymph__plasma-cell.jpg|Plasma cell.jpg"

  # -- Immune cells (myeloid) --
  "immune-myeloid__macrophage.jpg|Macrophage.jpg"
  "immune-myeloid__dendritic.jpg|Dendritic cell revealed.jpg"
  "immune-myeloid__neutrophil.jpg|Neutrophil with anthrax copy.jpg"
  "immune-myeloid__eosinophil.jpg|Eosinophil 2.jpg"
  "immune-myeloid__basophil.jpg|Basophil.jpg"
  "immune-myeloid__mast-cell.jpg|Mast cell.jpg"

  # -- Bacteria --
  "bacteria__tb.jpg|Mycobacterium tuberculosis Ziehl-Neelsen stain 02.jpg"
  "bacteria__mrsa.jpg|Staphylococcus aureus VISA 2.jpg"
  "bacteria__pneumoniae.jpg|Streptococcus pneumoniae.jpg"
  "bacteria__ecoli.jpg|EscherichiaColi NIAID.jpg"
  "bacteria__salmonella.jpg|SalmonellaNIAID.jpg"
  "bacteria__helicobacter.jpg|Helicobacter pylori 01.jpg"
  "bacteria__cocci.jpg|Streptococcus pneumoniae.jpg"
  "bacteria__rod.jpg|EscherichiaColi NIAID.jpg"
  "bacteria__pseudomonas.jpg|Pseudomonas aeruginosa SEM.jpg"
  "bacteria__vibrio.jpg|Vibrio cholerae.jpg"
  "bacteria__cdiff.jpg|Clostridium difficile 01.png"
  "bacteria__borrelia.jpg|Borrelia burgdorferi (CDC-PHIL -6631) lores.jpg"

  # -- Viruses & other pathogens --
  "viruses__influenza.jpg|EM of influenza virus.png"
  "viruses__sars-cov-2.jpg|Novel Coronavirus SARS-CoV-2 (49531042482).jpg"
  "viruses__hiv.jpg|HIV-budding-Color.jpg"
  "viruses__hbv.jpg|Hepatitis B virus 01.jpg"
  "viruses__plasmodium.jpg|Plasmodium falciparum 01.png"
  "viruses__candida.jpg|Candida albicans PHIL 3192 lores.jpg"
  "viruses__ebola.jpg|Ebola virus virion.jpg"
  "viruses__rabies.jpg|Rabies Virus EM PHIL 1876.JPG"
  "viruses__rotavirus.jpg|Rotavirus Reconstruction.jpg"
  "viruses__measles.jpg|Measles virus.JPG"
  "viruses__bacteriophage.jpg|Phage.jpg"
  "viruses__toxoplasma.jpg|Toxoplasma gondii.jpg"
  "viruses__giardia.jpg|Giardia lamblia SEM 8698 lores.jpg"

  # -- Hematopoietic --
  "hematopoietic__rbc.jpg|Red blood cells.jpg"
  "hematopoietic__platelet.jpg|Platelets2.JPG"
  "hematopoietic__megakaryocyte.jpg|Megakaryocyte (40x).jpg"
  "hematopoietic__monocyte.jpg|Monocyte.jpg"

  # -- Mesenchymal --
  "mesenchymal__osteoblast.jpg|Osteoblast.jpg"
  "mesenchymal__adipocyte.jpg|Adipocyte.jpg"
  "mesenchymal__fibroblast.jpg|NIH 3T3.jpg"
  "mesenchymal__chondrocyte.jpg|Chondrocyte.jpg"
  "mesenchymal__myocyte.jpg|Skeletal muscle.jpg"

  # -- Neural --
  "neural__neuron.jpg|GFP Neuron.jpg"
  "neural__astrocyte.jpg|Astrocyte5.jpg"
  "neural__oligodendrocyte.jpg|Oligodendrocyte.jpg"
  "neural__microglia.jpg|Microglia and neurons.jpg"
  "neural__schwann.jpg|Schwann cell.jpg"

  # -- Epithelial --
  "epithelial__keratinocyte.jpg|Keratinocytes in culture.jpg"
  "epithelial__enterocyte.jpg|Small intestinal villi.jpg"
  "epithelial__goblet.jpg|Goblet cell 1.jpg"
  "epithelial__alveolar.jpg|Alveolus diagram.svg"

  # -- Endothelial --
  "endothelial__huvec.jpg|HUVEC.jpg"

  # -- iPS / specialized --
  "ips__cardiomyocyte.jpg|Cardiac muscle.jpg"
  "ips__hepatocyte.jpg|Hepatocyte.jpg"
  "ips__beta-cell.jpg|Islets of Langerhans.jpg"
  "ips__dopaminergic.jpg|Substantia nigra TH.jpg"
)

ok=0
fail=0
failed_list=()

for row in "${ENTRIES[@]}"; do
  out="${row%%|*}"
  src="${row##*|}"
  dest="$OUT_DIR/$out"

  if [[ -s "$dest" && "${FORCE:-0}" != "1" ]]; then
    echo "✓ $out (already present)"
    ok=$((ok + 1))
    continue
  fi

  # URL-encode spaces, parens, commas in the filename
  enc_src=$(python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))" "$src")
  url="https://commons.wikimedia.org/wiki/Special:FilePath/${enc_src}"

  printf "→ %s\n   %s\n" "$out" "$src"
  if curl -fsSL --max-time 60 -A "$UA" -o "$dest.tmp" "$url"; then
    if [[ -s "$dest.tmp" ]]; then
      mv "$dest.tmp" "$dest"
      size=$(du -h "$dest" | cut -f1)
      echo "   ok ($size)"
      ok=$((ok + 1))
    else
      echo "   FAILED (empty response)"
      rm -f "$dest.tmp"
      fail=$((fail + 1))
      failed_list+=("$out  ←  $src")
    fi
  else
    echo "   FAILED (HTTP error)"
    rm -f "$dest.tmp"
    fail=$((fail + 1))
    failed_list+=("$out  ←  $src")
  fi
done

echo
echo "================================================================"
echo " Downloaded: $ok / $((ok + fail))"
echo "================================================================"

if (( fail > 0 )); then
  echo
  echo "Failed downloads — source these manually from Wikimedia Commons,"
  echo "CDC PHIL (https://phil.cdc.gov), or NIAID Flickr and drop them"
  echo "into $OUT_DIR/ under the listed filename:"
  for line in "${failed_list[@]}"; do
    echo "  - $line"
  done
fi

# Optional downscale + JPEG re-encode to keep the repo lean.
if [[ "${SHRINK:-1}" == "1" ]]; then
  if command -v mogrify >/dev/null 2>&1; then
    echo
    echo "Shrinking images to <= 900px and JPEG quality 82…"
    mogrify -resize '900x900>' -quality 82 -strip "$OUT_DIR"/*.jpg 2>/dev/null || true
    mogrify -resize '900x900>' -quality 82 -strip "$OUT_DIR"/*.JPG 2>/dev/null || true
    mogrify -resize '900x900>' -strip       "$OUT_DIR"/*.png 2>/dev/null || true
  else
    echo
    echo "(install imagemagick for automatic downscale — skipping)"
  fi
fi

# Optional packaging.
if [[ "${PACK:-1}" == "1" ]]; then
  tar -czf images.tar.gz "$OUT_DIR"
  size=$(du -h images.tar.gz | cut -f1)
  echo
  echo "Packaged → images.tar.gz ($size)"
fi
