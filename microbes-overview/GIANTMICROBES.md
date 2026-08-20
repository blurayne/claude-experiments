# GIANTmicrobes — which plush microbes are the big ones, and which we should add

Source: `../giant-microbes/merged_catalog.json` (781 catalogue rows: 454 standard plush, 46 XL/Gigantic, 154 keychains, plus petri dishes, box sets and merch). This note answers two questions: which of their microbes are the genuinely well-known ones, and which of those are worth adding to our atlas.

## How "successful" was measured

The catalogue has no sales figures, so success is inferred from what the vendor themselves bet on. Three signals, combined into one score per microbe:

- **Spin-offs.** GIANTmicrobes only makes a keychain, a Gigantic 14" version, a petri dish or a box set of something that sells. A microbe with 3+ product variants is a proven seller; a microbe with one lone plush is not.
- **Still on sale.** `status` = `in_stock` in the US and/or the German (riesenmikroben.de) store, versus `retired`/`not_offered`. Surviving 20+ years of catalogue pruning is the strongest signal there is.
- **Two-market presence.** Carried in both the US and the German store, rather than one.

Score = variants + 3×(in stock US) + 3×(in stock DE) + 2×(has keychain) + 2×(has Gigantic).

## The bestsellers (bacteria, viruses, fungi, parasites)

| Score | Microbe | Latin | Variants | On sale | In our atlas |
|---|---|---|---|---|---|
| 16 | Staph | *Staphylococcus aureus* | 6 | US + DE | yes |
| 14 | Coronavirus COVID-19 | *SARS-CoV-2* | 7 | DE | yes |
| 11 | Common cold | *Rhinovirus* | 4 | DE | yes |
| 10 | Beer & Bread yeast | *Saccharomyces cerevisiae* | 3 | DE | yes |
| 10 | E. coli | *Escherichia coli* | 3 | DE | yes |
| 10 | Flu | *Orthomyxovirus* | 3 | DE | yes |
| 10 | HIV | *Human immunodeficiency virus* | 3 | DE | yes |
| 10 | Salmonella | *Salmonella typhimurium* | 3 | DE | yes |
| 10 | Syphilis | *Treponema pallidum* | 3 | DE | **no** |
| 9 | Amoeba | *Amoeba proteus* | 5 | — | **no** |
| 7 | Ulcer | *Helicobacter pylori* | 1 | US + DE | yes |
| 7 | Penicillin mould | *Penicillium chrysogenum* | 3 | — | **no** |
| 7 | Mono / kissing disease | *Epstein–Barr virus* | 3 | — | **no** |
| 7 | Measles | *Morbillivirus* | 1 | US + DE | yes |
| 7 | Giardia | *Giardia lamblia* | 1 | US + DE | **no** |
| 7 | Listeria | *Listeria monocytogenes* | 1 | US + DE | **no** |
| 7 | Lyme disease | *Borrelia burgdorferi* | 2 | US | **no** |
| 7 | Zika | *Zika virus* | 2 | DE | **no** |
| 7 | C. diff | *Clostridioides difficile* | 2 | DE | **no** |
| 7 | Chlamydia | *Chlamydia trachomatis* | 2 | DE | **no** |
| 7 | Gonorrhoea | *Neisseria gonorrhoeae* | 2 | DE | **no** |
| 7 | Herpes | *Herpes simplex virus 2* | 2 | DE | **no** |

Outside the pathogens, their other proven sellers are the human cells and organs we mostly already cover — *Nerve Cell* (9 variants, the single most spun-off product in the whole catalogue), *Red Blood Cell*, *Sperm Cell*, *Egg Cell*, *White Blood Cell* — plus non-microbes like the **Tardigrade / Waterbear** (3 variants, in stock DE), Uterus, Brain and Heart.

## Where we stand

Our microbes carry **27 plush links**, every one an exact match (the mapping was tightened in `microbe_giant.py`: a plush is linked only when it depicts *this* cell or *this* species, checked against the catalogue's `species` field). Every photo is at the vendor's maximum published resolution of 1200 px on the long edge — there is no larger source anywhere, since this catalogue was itself scraped from their store.

Resolution is not the same as quality, though. Measuring edge sharpness (file size is useless here: a background-removed AVIF compresses small however good it is) showed that the vendor publishes several of these shots only as soft, upscaled, artefact-ridden files. Six were denoised and re-sharpened with `scripts/edit_image.py` — the killer T cell went from 1.9 to 17.3, the sickle cell from 2.0 to 9.9. Candida and the trypanosome were left as they are: two attempts each, the second explicitly demanding a pixel-for-pixel result, and both times the model re-framed and cropped the toy instead of merely cleaning it. A soft but truthful product photo beats a sharp but altered one. Every repaired photo is listed in `AI_CLEANED` and disclosed in the viewer.

Our pathogen coverage today is 7 generic shapes (cocci, rods, virus, fungus, parasite, prion, amoeba), 10 named bacteria and 12 named viruses/eukaryotes, plus the new *Helpful microbes* set.

**Progress against the list below.** Landed and live: rhinovirus, measles, *Streptococcus mutans* and baker's yeast (which opened the *Helpful microbes* set). Catalogued with descriptions and scale data but not yet rendered: *Penicillium chrysogenum*, *Bifidobacterium longum*, *Amoeba proteus*, *Borrelia burgdorferi*, rotavirus, norovirus, varicella-zoster, *Giardia lamblia*, *Clostridioides difficile* and *Listeria monocytogenes*.

## Recommended additions

Ranked by how much each one adds to the atlas, not just by plush sales. All of these have a plush we could link immediately.

**Tier 1 — add these first.** High recognition, strong teaching story, age-appropriate for the kids mode, and they fill real gaps.

1. **Rhinovirus (common cold)** → `pathogens-viruses`. The single most-experienced infection there is, and the best possible contrast to influenza, which children routinely confuse with it. Still sold in DE.
2. **Saccharomyces cerevisiae (baker's & brewer's yeast)** → new *helpful microbes* set, or `pathogens-viruses`. Our `fungus` entry already draws generic budding yeast, so this names it and turns it into the "microbes we eat with" story. Excellent counterweight to a catalogue that is otherwise all disease.
3. **Penicillium chrysogenum (the penicillin mould)** → same set. Carries the entire discovery-of-antibiotics story, and pairs directly with our existing TB, Staph and Strep entries.
4. **Streptococcus mutans (tooth decay)** → `pathogens-bacteria`. The one bacterium whose prevention a child performs twice a day; the coloring-page scenario writes itself.
5. **Measles (Morbillivirus)** → `pathogens-viruses`. Vaccine-preventable, in stock in both stores, and currently the most newsworthy childhood infection in Europe.

**Tier 2 — strong additions once tier 1 lands.**

6. **Amoeba proteus** → `pathogens` (generic). The classic classroom protist; would give the generic set a eukaryote next to `parasite`. 5 catalogue variants.
7. **Borrelia burgdorferi (Lyme)** → `pathogens-bacteria`. Highly relevant in German-speaking countries, and a spirochete — a body shape we do not illustrate anywhere yet.
8. **Rotavirus** and **Norovirus** → `pathogens-viruses`. The two everyday causes of childhood gastroenteritis; rotavirus also carries a vaccine story.
9. **Varicella-zoster (chickenpox)** → `pathogens-viruses`. Immediately recognisable to children.
10. **Bifidobacterium longum** → helpful microbes. Gut flora, pairs with our `enterocyte`/`goblet-cell`/`paneth-cell` entries, which currently have no bacterial counterpart on the good side.
11. **Tardigrade (waterbear)** → would need its own home; not a human cell or a pathogen, but one of the most popular science plush toys they sell and a guaranteed kid favourite.

**Tier 3 — defensible, but decide on framing first.** *Treponema pallidum*, *Chlamydia trachomatis*, *Neisseria gonorrhoeae*, HSV-2 and Epstein–Barr are all proven sellers and medically important, but they are sexually transmitted infections. The atlas has adult and scientist modes where they fit naturally; the kids mode and its coloring pages would need a deliberate editorial decision. *Clostridioides difficile*, *Listeria* and *Giardia* are the same call for a different reason — hospital and food-hygiene topics that are adult-facing but not sensitive.

Not recommended: *Bacillus anthracis* (anthrax) and the "Plague Inc. bio-weapon" tie-in — bioweapon framing has no place in a children's teaching atlas.

## What adding one actually involves

Everything is driven from `cells_data.py`. A new microbe is one dict appended to the `entries` list of the target page in `PAGES`, with exactly these keys:

`name_de`, `name_en`, `tier` (always `"basic"` today), `image_filename`, `image_url`, `image_credit`, `image_license`, `func_de`, `func_en`, `deps_de`, `deps_en`

The `PAGES` id maps to `renders/set/<id>` (the one exception being `pathogens` → `renders/set/pathogens-generic`). From there the pipeline is:

1. Run the `microbe-render` skill end-to-end for the new key — research, real micrograph, six audience descriptions, four rendered styles, labelled SVG overlays.
2. `scripts/coloring.py` for the kids' A4 coloring page.
3. Add its size and weight to `microbe_scale.py` so the scale meter renders.
4. Add its plush to `microbe_giant.py` and copy the photo to `renders/set/<set>/giant/<key>.avif`.
5. `scripts/overview.py`, then `uv run build_viewer.py` to regenerate `viewer-data.json` and `viewer.html`.

Steps 3–5 are minutes of work; step 1 is the expensive one (Gemini image renders plus verification passes) and step 2 costs one image call per microbe.

Tier 1 as scoped above is five new microbes — one new page (`helpful-microbes`) plus three entries spread across the existing pathogen pages.
