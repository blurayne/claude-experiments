# Plan & open items

Running checklist for the atlas. Tick items off as they land; add new ones at the
bottom of their section. `OVERVIEW.md` is generated and reports the *data* state —
this file tracks the *work*, including things no script can detect.

## Open

### Review
- [ ] **Systematic visual review of all 112 subjects.** Every render, labelled
      diagram and coloring page has been checked by the agent that made it, and
      spot-checked by the orchestrator where something was flagged. Nobody has sat
      down and looked at all 112 in a row. Expect to find: labels that overlap art
      at some viewport sizes, coloring pages whose bleed is imperfect at the last
      edge, and the odd style that reads oddly next to its siblings.
      *Owner: user. Note findings below as sub-items.*

### Known imperfections, recorded rather than fixed
These are all flagged in the per-subject `verdicts.json` too. None is wrong, each is
a compromise someone chose deliberately — listed so a later pass can revisit them.

- [ ] `chromosome` — the centromere reads as an insert of roughly equal width in
      textbook/3d/watercolor rather than a true narrower constriction. Four prompt
      rounds did not fix it on flash and the pro tier was quota-exhausted. Only the
      SEM plate got a genuine constriction. **Retry when pro quota is free.**
- [ ] `dna` — major/minor groove asymmetry stays subtle rather than clearly
      alternating in all four finals. Same cause: the fourth attempt was blocked by
      the pro-model daily quota. **Retry when pro quota is free.**
- [ ] `rna` — the 3d style never got a pro-tier attempt (quota), and the tRNA's
      amino-acid tail is drawn as a fifth appendage off the hub rather than a
      continuation of the acceptor stem.
- [ ] `cancer-cell` — the coloring page still has imperfect bleed on two edges after
      three attempts. Kept because the rules that matter held (no starburst, no
      frame) and a fourth roll risked a worse page.
- [ ] `tick` — the coloring page lost its intended tweezers character (it became a
      grass-blade character). Not re-rolled because the leg count was finally right.
- [ ] `rotavirus` — no render shows countable eleven dsRNA segments; the label says
      eleven and the images approximate.
- [x] `giardia` — **corrected.** This previously read "the eight flagella overlap in
      every render, so the count cannot be confirmed pixel by pixel", which was wrong
      and came from a verdict file that claimed "~eight flagella" for renders that
      actually had 10–16. A re-check counted them and re-rendered all four styles on
      the pro model: textbook, SEM and watercolor now show exactly eight, in four
      recognisable pairs, on a bilaterally symmetric body. Only the 3D render still
      falls short (see next line). The reference micrograph genuinely does have
      overlapping flagella — that part was true, and it is what made the false claim
      about the renders plausible.
- [ ] `giardia` — the 3D render shows six free flagella; the ventral pair is drawn as
      internal axonemes. Two pro retries failed to fix it, so the ventral-flagella
      callout was omitted from the 3D labels rather than pointing a leader at
      something not visibly drawn.
- [ ] `varicella-zoster-virus` — envelope drawn as a fairly regular circle in sem and
      3d where real virions are noticeably pleomorphic.
- [ ] `golgi-apparatus` — cisternae drawn far plumper than their real 10–20 nm lumen
      (unavoidable at 1080 px); textbook and 3d are more bilaterally symmetric than a
      real stack.
- [ ] `clostridioides-difficile` — the textbook cell is stubbier than the real rod;
      proportion was traded for a correctly subterminal endospore.
- [ ] `leukocyte` — the SEM plate cannot show a nucleus at all (the modality images
      surfaces), so it makes the white/red distinction by texture instead.
- [ ] `heartworm` — the coloring page keeps a white margin rather than bleeding to
      the edges. Its render arrived with a solid black frame; that was cropped off
      deterministically and re-traced (no second API call), which fixes the
      unrecoverable failure but cannot recompose the scene tighter.
- [ ] `heartworm` — the right-ventricle and pulmonary-artery locations are drawn
      correctly in the textbook plate but not individually labelled; only the five
      core morphology labels are annotated.
- [ ] `heartworm` — microfilariae, the ~300 µm larval stage a mosquito actually
      carries, appear only in the real micrograph. Putting them in the same frame as
      a 27 cm adult is not practical at one scale.
- [x] `feline-immunodeficiency-virus` — **no real micrograph, and none exists.**
      Wikimedia's FIV category holds only diagrams, a test-kit photo and a photo of a
      sick cat; CDC PHIL has no FIV entry (its lentivirus plates are all HIV-1); the
      one paper with genuine FIV TEM figures is ASM copyright. The agent reported the
      gap rather than passing off an HIV plate, which is the right call and the reason
      this subject shows 4/5 pictures instead of 5/5. Not a defect to fix — recorded
      so nobody "corrects" it later by substituting a relative's photograph.
- [ ] `feline-immunodeficiency-virus` — in the 3d style the matrix (p15) label points
      at the envelope/capsid transition rather than a visually distinct band, because
      that render does not separate the layer the way textbook does.
- [ ] `feline-immunodeficiency-virus` — the textbook background reads medium grey
      rather than the house deep charcoal.
- [ ] `rabies-virus` — its reference (CDC PHIL 1876) shows virions massed in a Negri
      body, not an isolated particle. At full frame the bullet silhouette is not
      resolvable; it becomes readable at ~1.6× zoom. Verified by the orchestrator
      after the render agent flagged that it had inherited the plate without
      re-checking it, and the resolution limit is now stated in the log.
- [ ] `rabies-virus` — the watercolor's flat end reads pale cream rather than the
      lilac-grey envelope tone that textbook and 3d match exactly.
- [ ] `rabies-virus` — the coloring page reaches full bleed on three edges and comes
      within 6px on the bottom, via the crop-and-retrace hatch rather than a natively
      edge-bleeding render.
- [ ] `feline-leukaemia-virus` — its reference is a dense multi-particle negative-stain
      plate rather than the single isolated virion this atlas prefers. Accepted because
      individual round C-type particles are clearly resolvable in it.
- [ ] `chlamydia-felis` — its reference micrograph shows **Chlamydia trachomatis**,
      not C. felis: no freely-licensed micrograph of the cat species exists. The
      developmental forms are identical in both, so it illustrates the EB/RB cycle
      truthfully, and the species swap is disclosed in the caption the viewer shows —
      not only in the log. Recorded so nobody later assumes it is C. felis.

### Worth knowing for future renders
- The house SEM style is **a single specimen on a substrate**, not a budding vignette.
  A FeLV SEM attempt composed as budding-from-a-membrane read as skin blisters and
  cost a re-render. Gammaretroviruses do bud characteristically, so the temptation is
  real — put the budding figure in textbook or 3d instead.

### Ideas not yet decided
- [ ] More cancer subjects — the set currently holds one generic entry. Leukaemia,
      melanoma and a metastasis sequence would each stand on their own.
- [ ] Sub-cellular subjects still missing: centriole, peroxisome, nucleolus as its
      own entry, cilium/flagellum of a human cell.
- [ ] A "how a cell divides" sequence (mitosis stages) — would tie chromosome,
      cytoskeleton and nucleus together.

## Done

- [x] **All 112 catalogued subjects rendered**, 18 sets. Every one carries 5 picture
      styles, 3 labelled diagrams, an A4 coloring page, EN+DE narration and
      size/weight data. `OVERVIEW.md` reports 0 unrendered.
- [x] **No subject depends on the slug fallback.** All 112 render `meta.name` values
      match their catalogue `name_en` byte-exactly, so nothing can vanish silently.
- [x] **Audience-aware names.** Optional `name_kids_en/de`; one `N()` helper feeds
      card titles, nav tree, search results, lightbox and alt text so they cannot
      disagree. Coloring pages always take the kids wording.
- [x] **Every reference has a recorded source.** The reticulocyte's sidecar pointed
      at a superseded first pick while its log named the image actually used; re-
      fetched so data and log agree.
- [x] **The cat-and-dog pathogen set**, the one chapter not about the human body:
      heartworm, FIV, FeLV, Chlamydia felis and rabies. Two of them bridge back —
      rabies crosses into any mammal, heartworm rides the mosquitoes that bite us.
- [x] **Clickable cross-references.** 48 "See also" links across 34 subjects,
      declared once per pair and written both ways so none can be one-directional.
- [x] **No NonCommercial licences.** The cytoskeleton's CC BY-NC-SA plate was the
      only one among 100+; replaced with a public-domain equivalent showing the same
      three channels, at the cost of resolution (512 px upscaled ~2.1×, stated).
- [x] **46 plush links**, each an exact species/cell match; the deliberate non-links
      are documented in `microbe_giant.py`.
- [x] `.env` ignored at the repo root — it was untracked but unignored, and `main` is
      served publicly.
- [x] Search results and filter panel no longer clipped by the mobile top bar.
- [x] Repeat taps on prev/next no longer swallowed.
- [x] Picture chooser's open list follows the theme.
- [x] App icon: SVG favicon, apple-touch-icon, web app manifest, top-bar logo that
      doubles as its own download link.
- [x] Page zoom disabled; the lightbox gained wheel/pinch zoom with drag panning.
- [x] `SKILL.md` carries the run's findings so the next agent inherits them.
