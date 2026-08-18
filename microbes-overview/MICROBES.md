# Microbes / cells — render coverage

Cross-check of every entry in `cells_data.py` (the poster source of truth) against what
has actually been rendered, verified and annotated under `renders/set/`. Regenerate this
by hand after render batches until it's worth scripting.

Legend: ✅ done (4 styles + real reference all pass verification) · ⚠️ partial (some
artifacts exist but not all styles verified) · ❌ not started (no render folder yet).

## Pathogens / microbes — 18/18 done

| page (`cells_data.py` id) | entry (`name_en`) | render key | set | status |
| --- | --- | --- | --- | --- |
| pathogens | Cocci (round bacteria) | `cocci` | pathogens-generic | ✅ [log](renders/set/pathogens-generic/cocci.render.md) |
| pathogens | Rod bacteria | `rod-bacterium` | pathogens-generic | ✅ [log](renders/set/pathogens-generic/rod-bacterium.render.md) |
| pathogens | Virus | `virus` | pathogens-generic | ✅ [log](renders/set/pathogens-generic/virus.render.md) |
| pathogens | Fungus | `fungus` | pathogens-generic | ✅ [log](renders/set/pathogens-generic/fungus.render.md) |
| pathogens | Parasite | `parasite` | pathogens-generic | ✅ [log](renders/set/pathogens-generic/parasite.render.md) |
| pathogens | Prion | `prion` | pathogens-generic | ✅ [log](renders/set/pathogens-generic/prion.render.md) |
| pathogens-bacteria | Mycobacterium tuberculosis (TB) | `mycobacterium-tuberculosis` | pathogens-bacteria | ✅ [log](renders/set/pathogens-bacteria/mycobacterium-tuberculosis.render.md) |
| pathogens-bacteria | Staphylococcus aureus (MRSA) | `staphylococcus-aureus` | pathogens-bacteria | ✅ [log](renders/set/pathogens-bacteria/staphylococcus-aureus.render.md) |
| pathogens-bacteria | Streptococcus pneumoniae | `streptococcus-pneumoniae` | pathogens-bacteria | ✅ [log](renders/set/pathogens-bacteria/streptococcus-pneumoniae.render.md) |
| pathogens-bacteria | Escherichia coli | `escherichia-coli` | pathogens-bacteria | ✅ [log](renders/set/pathogens-bacteria/escherichia-coli.render.md) |
| pathogens-bacteria | Salmonella enterica | `salmonella-enterica` | pathogens-bacteria | ✅ [log](renders/set/pathogens-bacteria/salmonella-enterica.render.md) |
| pathogens-bacteria | Helicobacter pylori | `helicobacter-pylori` | pathogens-bacteria | ✅ [log](renders/set/pathogens-bacteria/helicobacter-pylori.render.md) |
| pathogens-viruses | Influenza virus (flu) | `influenza-virus` | pathogens-viruses | ✅ [log](renders/set/pathogens-viruses/influenza-virus.render.md) |
| pathogens-viruses | SARS-CoV-2 (COVID-19) | `sars-cov-2` | pathogens-viruses | ✅ [log](renders/set/pathogens-viruses/sars-cov-2.render.md) |
| pathogens-viruses | HIV | `hiv` | pathogens-viruses | ✅ [log](renders/set/pathogens-viruses/hiv.render.md) |
| pathogens-viruses | Hepatitis B virus (HBV) | `hepatitis-b-virus` | pathogens-viruses | ✅ [log](renders/set/pathogens-viruses/hepatitis-b-virus.render.md) |
| pathogens-viruses | Plasmodium (malaria) | `plasmodium` | pathogens-viruses | ✅ [log](renders/set/pathogens-viruses/plasmodium.render.md) |
| pathogens-viruses | Candida albicans | `candida-albicans` | pathogens-viruses | ✅ [log](renders/set/pathogens-viruses/candida-albicans.render.md) |

Extra (not in current `cells_data.py`): `renders/set/pathogens-generic/coronavirus.render.md` — ✅ done, but leftover from an earlier revision of the "pathogens" page; the current page has "Cocci/Rod/Virus/Fungus/Parasite/Prion" generic archetypes instead, and SARS-CoV-2 lives under `pathogens-viruses`.

## Body cells (non-microbe pages) — 2/48 done, 1 partial

Only the stem-cells page has been piloted; the other 7 body-cell pages (42 entries) have
no render folder yet at all.

| page | entry (`name_en`) | render key | status |
| --- | --- | --- | --- |
| stem-cells | Embryonic stem cell (ESC) | `embryonic-stem-cell` | ✅ [log](renders/set/stem-cells/embryonic-stem-cell.render.md) |
| stem-cells | Mesenchymal stem cell (MSC) | `mesenchymal-stem-cell` | ✅ [log](renders/set/stem-cells/mesenchymal-stem-cell.render.md) |
| stem-cells | Induced pluripotent stem cell (iPS) | — | ❌ not started |
| stem-cells | Hematopoietic stem cell (HSC) | `hematopoietic-stem-cell` | ⚠️ partial — textbook style rendered + annotated; sem/3d/watercolor only have unverified attempts; no verdicts.json/render.meta.json yet ([log](renders/set/stem-cells/hematopoietic-stem-cell.render.md)) |
| stem-cells | Neural stem cell (NSC) | — | ❌ not started |
| stem-cells | Endothelial progenitor cell (EPC) | — | ❌ not started |
| epithelial | Keratinocyte (skin cell) | — | ❌ not started |
| epithelial | Enterocyte (gut cell) | — | ❌ not started |
| epithelial | Goblet cell | — | ❌ not started |
| epithelial | Paneth cell | — | ❌ not started |
| epithelial | Alveolar cell type II | — | ❌ not started |
| epithelial | Urothelial cell | — | ❌ not started |
| nerve-cells | Neuron | — | ❌ not started |
| nerve-cells | Motor neuron | — | ❌ not started |
| nerve-cells | Astrocyte | — | ❌ not started |
| nerve-cells | Oligodendrocyte | — | ❌ not started |
| nerve-cells | Microglia | — | ❌ not started |
| nerve-cells | Schwann cell | — | ❌ not started |
| reproductive | Spermatozoon (sperm) | — | ❌ not started |
| reproductive | Oocyte (egg cell) | — | ❌ not started |
| reproductive | Sertoli cell | — | ❌ not started |
| reproductive | Leydig cell | — | ❌ not started |
| reproductive | Granulosa cell | — | ❌ not started |
| reproductive | Theca cell | — | ❌ not started |
| bone-cells | Osteoblast (bone builder) | — | ❌ not started |
| bone-cells | Osteoclast | — | ❌ not started |
| bone-cells | Osteocyte | — | ❌ not started |
| bone-cells | Chondrocyte (cartilage cell) | — | ❌ not started |
| bone-cells | Tenocyte (tendon cell) | — | ❌ not started |
| bone-cells | Fibroblast | — | ❌ not started |
| fat-cells | White adipocyte | — | ❌ not started |
| fat-cells | Brown adipocyte | — | ❌ not started |
| fat-cells | Beige adipocyte | — | ❌ not started |
| fat-cells | Preadipocyte | — | ❌ not started |
| fat-cells | Lipoblast | — | ❌ not started |
| fat-cells | Adipogenic progenitor | — | ❌ not started |
| red-blood | Erythrocyte (red blood cell) | — | ❌ not started |
| red-blood | Reticulocyte | — | ❌ not started |
| red-blood | Erythroblast | — | ❌ not started |
| red-blood | Megakaryocyte | — | ❌ not started |
| red-blood | Thrombocyte (platelet) | — | ❌ not started |
| red-blood | Sickle cell (deformed erythrocyte) | — | ❌ not started |
| immune-cells | Helper T cell (CD4) | — | ❌ not started |
| immune-cells | Cytotoxic T cell (CD8) | — | ❌ not started |
| immune-cells | B cell | — | ❌ not started |
| immune-cells | Natural killer cell (NK) | — | ❌ not started |
| immune-cells | Macrophage | — | ❌ not started |
| immune-cells | Neutrophil | — | ❌ not started |

## Summary

- **66** total entries in `cells_data.py` across 11 pages.
- **20/66** rendered + fully verified (all 4 styles + real reference pass).
- **1** extra verified render (`coronavirus`) with no current matching entry.
- **1/66** partial (`hematopoietic-stem-cell` — textbook only).
- **45/66** not started: 3 remaining stem cells + all 42 entries across epithelial, nerve-cells, reproductive, bone-cells, fat-cells, red-blood and immune-cells.
- All **18/18 pathogen/microbe entries** (the three `pathogens*` pages) are done — this was the scope of the most recent render batch.

Per-microbe token/cost detail lives in [`RENDER-STATUS.md`](RENDER-STATUS.md); per-set
galleries in each `renders/set/<SET>/OVERVIEW.md`; the full labelled-image gallery in
[`renders/OVERVIEW.md`](renders/OVERVIEW.md).
