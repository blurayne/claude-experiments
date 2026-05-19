#!/usr/bin/env bash
# Download cell / pathogen illustrations for the microbes-overview poster.
#
# Source: NIH BioArt (https://bioart.niaid.nih.gov) — public domain.
# Each entry below pairs a local filename (referenced from cells_data.py)
# with the direct PNG download URL of a BioArt asset.
#
# How to populate a missing URL:
#   1. Open https://bioart.niaid.nih.gov in a browser.
#   2. Search for the cell/pathogen name (e.g. "macrophage").
#   3. Click the asset, then copy the "Download → PNG" link.
#   4. Paste it as the URL part of the matching line below.
#   5. Re-run this script. It only re-downloads missing files
#      (set FORCE=1 to overwrite).
#
# Usage:
#   ./fetch_images.sh                # download everything that's missing
#   FORCE=1 ./fetch_images.sh        # re-download even if local file exists
#   SHRINK=0 ./fetch_images.sh       # skip imagemagick downscale
#   PACK=0 ./fetch_images.sh         # skip tarball packaging
#
# Failures are tolerated: the build (build.py) falls back to a placeholder
# for any missing image. After running, commit microbes-overview/images/*
# and push; the auto-rebuild workflow will then re-render the posters.

set -uo pipefail
cd "$(dirname "$0")"

OUT_DIR="images"
mkdir -p "$OUT_DIR"

UA="microbes-overview-fetch/2.0 (https://github.com/blurayne/claude-experiments)"

# Format per line: "<local-filename>|<NIH-BioArt direct download URL>"
# Leave the URL empty for entries whose BioArt asset hasn't been
# located yet — the script will log them as MISSING URL.
ENTRIES=(
  # -- Stem cells --
  "stem-cells__esc.png|"
  "stem-cells__ips.png|"
  "stem-cells__hsc.png|"
  "stem-cells__msc.png|"
  "stem-cells__nsc.png|"
  "stem-cells__epc.png|"

  # -- Epithelial cells --
  "epithelial__keratinocyte.png|"
  "epithelial__enterocyte.png|"
  "epithelial__goblet.png|"
  "epithelial__paneth.png|"
  "epithelial__alveolar.png|"
  "epithelial__urothelial.png|"

  # -- Nerve cells --
  "nerve-cells__neuron.png|"
  "nerve-cells__motor-neuron.png|"
  "nerve-cells__astrocyte.png|"
  "nerve-cells__oligodendrocyte.png|"
  "nerve-cells__microglia.png|"
  "nerve-cells__schwann.png|"

  # -- Reproductive cells --
  "reproductive__sperm.png|"
  "reproductive__oocyte.png|"
  "reproductive__sertoli.png|"
  "reproductive__leydig.png|"
  "reproductive__granulosa.png|"
  "reproductive__theca.png|"

  # -- Bone cells --
  "bone-cells__osteoblast.png|"
  "bone-cells__osteoclast.png|"
  "bone-cells__osteocyte.png|"
  "bone-cells__chondrocyte.png|"
  "bone-cells__tenocyte.png|"
  "bone-cells__fibroblast.png|"

  # -- Fat cells --
  "fat-cells__white-adipocyte.png|"
  "fat-cells__brown-adipocyte.png|"
  "fat-cells__beige-adipocyte.png|"
  "fat-cells__preadipocyte.png|"
  "fat-cells__lipoblast.png|"
  "fat-cells__adipogenic-progenitor.png|"

  # -- Red blood cells --
  "red-blood__erythrocyte.png|"
  "red-blood__reticulocyte.png|"
  "red-blood__erythroblast.png|"
  "red-blood__megakaryocyte.png|"
  "red-blood__platelet.png|"
  "red-blood__sickle-cell.png|"

  # -- Immune cells --
  "immune-cells__helper-t.png|"
  "immune-cells__cytotoxic-t.png|"
  "immune-cells__b-cell.png|"
  "immune-cells__nk-cell.png|"
  "immune-cells__macrophage.png|"
  "immune-cells__neutrophil.png|"

  # -- Pathogens (overview) --
  "pathogens__cocci.png|"
  "pathogens__rod.png|"
  "pathogens__virus.png|"
  "pathogens__fungus.png|"
  "pathogens__parasite.png|"
  "pathogens__prion.png|"

  # -- Well-known bacteria --
  "pathogens-bacteria__tb.png|"
  "pathogens-bacteria__mrsa.png|"
  "pathogens-bacteria__pneumoniae.png|"
  "pathogens-bacteria__ecoli.png|"
  "pathogens-bacteria__salmonella.png|"
  "pathogens-bacteria__helicobacter.png|"

  # -- Well-known viruses & other pathogens --
  "pathogens-viruses__influenza.png|"
  "pathogens-viruses__sars-cov-2.png|"
  "pathogens-viruses__hiv.png|"
  "pathogens-viruses__hbv.png|"
  "pathogens-viruses__plasmodium.png|"
  "pathogens-viruses__candida.png|"
)

ok=0
fail=0
missing_url=0
failed_list=()
missing_url_list=()

for row in "${ENTRIES[@]}"; do
  out="${row%%|*}"
  url="${row##*|}"
  dest="$OUT_DIR/$out"

  if [[ -z "$url" ]]; then
    echo "… $out  MISSING URL — fill in fetch_images.sh from bioart.niaid.nih.gov"
    missing_url=$((missing_url + 1))
    missing_url_list+=("$out")
    continue
  fi

  if [[ -s "$dest" && "${FORCE:-0}" != "1" ]]; then
    echo "✓ $out (already present)"
    ok=$((ok + 1))
    continue
  fi

  printf "→ %s\n   %s\n" "$out" "$url"
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
      failed_list+=("$out  ←  $url")
    fi
  else
    echo "   FAILED (HTTP error)"
    rm -f "$dest.tmp"
    fail=$((fail + 1))
    failed_list+=("$out  ←  $url")
  fi
done

total=${#ENTRIES[@]}
echo
echo "================================================================"
echo " Downloaded: $ok / $total"
echo " Missing URL: $missing_url"
echo " Download failures: $fail"
echo "================================================================"

if (( missing_url > 0 )); then
  echo
  echo "Entries without a BioArt asset URL. Find each on"
  echo "https://bioart.niaid.nih.gov, then paste the direct PNG"
  echo "download URL into fetch_images.sh:"
  for line in "${missing_url_list[@]}"; do
    echo "  - $line"
  done
fi

if (( fail > 0 )); then
  echo
  echo "Failed downloads — verify the URL on bioart.niaid.nih.gov:"
  for line in "${failed_list[@]}"; do
    echo "  - $line"
  done
fi

# Optional downscale + JPEG re-encode to keep the repo lean.
if [[ "${SHRINK:-1}" == "1" ]]; then
  if command -v mogrify >/dev/null 2>&1; then
    echo
    echo "Shrinking images to <= 900px…"
    mogrify -resize '900x900>' -strip "$OUT_DIR"/*.png 2>/dev/null || true
  else
    echo
    echo "(install imagemagick for automatic downscale — skipping)"
  fi
fi

# Optional packaging.
if [[ "${PACK:-1}" == "1" ]]; then
  if compgen -G "$OUT_DIR/*" > /dev/null; then
    tar -czf images.tar.gz "$OUT_DIR"
    size=$(du -h images.tar.gz | cut -f1)
    echo
    echo "Packaged → images.tar.gz ($size)"
  fi
fi
