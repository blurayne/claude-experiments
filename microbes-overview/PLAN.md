# Plan & open items

Running checklist for the atlas. Tick items off as they land; add new ones at the
bottom of their section. `OVERVIEW.md` is generated and reports the *data* state —
this file tracks the *work*, including things no script can detect.

## Open

### In flight — the muscle-cells set (2026-08)
The atlas's 19th set and its first new chapter prose. Four fibre subjects, of which
two are finished and two are still moving. Recorded here because a session limit
killed the first batch mid-flight and the state is not obvious from the files alone.

- [x] `type-i-fibre` — **complete.** All four styles rendered on the pro tier and
      visually verified by the orchestrator: transverse A/I banding with Z-lines
      *and* lengthwise myofibrils underneath (both at once is the correct anatomy),
      fibre running out of frame at both ends, deep red with a dense mitochondria
      and capillary bed. Flash never got the framing right (capped "stubby capsule"
      every time); the pro tier fixed it. Anchor-checking the three labelled SVGs
      against the raw renders found **6 of 10 anchors wrong on 3d** (myofibril in
      the black background, "capillary" pointing at a nucleus, a_band on a
      neighbouring satellite cell) and 2 of 10 on watercolor — all relocated and
      re-verified. The nucleus-vs-satellite-cell question was resolved on the
      evidence rather than conveniently: the teal outline is the edge of the
      *cutaway window*, not the sarcolemma, so the blue-grey myonuclei are correctly
      peripheral, and the separate pale teardrop cells at the true outer edge are
      genuine satellite cells — both were already labelled distinctly.
- [x] `type-iix-fibre` — **corrected.** All four styles had shipped with
      longitudinal myofibril stripes only and no transverse cross-striation, while
      `verdicts.json` asserted "continuous transverse cross-striation" — the same
      class of error as the Giardia flagella count, a self-reported verdict
      asserting a checkable fact the picture did not show. A second, smaller defect:
      the verdict recorded "one end still shows a closed disc" as an accepted
      compromise, but a corner-by-corner crop check found BOTH ends closed inside
      the frame on textbook/3d/watercolor, not one. Caught by the orchestrator
      building a four-up contact sheet and magnifying one crop; confirmed here by
      cropping and magnifying all four corners of every current render before
      touching anything. Fixed by re-rendering all four styles on `gemini-3-pro-image`
      with corrected positive-direction phrasing for the striation ("bands running
      across the fibre, perpendicular to its length, like rungs on a ladder, with
      the myofibrils lengthwise underneath") and a stronger corner-fill framing
      check borrowed from the `type-i-fibre` exemplar — every style passed on the
      **first** pro-tier attempt (textbook gen-04, 3d gen-04, watercolor gen-04, sem
      gen-03). Verified per style with a magnified centre crop (not FFT/line-sample,
      per SKILL.md) showing both transverse banding and lengthwise myofibril grain
      at once, and by cropping both opposite corners to confirm the fibre body now
      fills each corner edge-to-edge with no end-cap. Labelled SVGs for
      textbook/3d/watercolor were rebuilt from scratch against the new base images;
      all 10 anchors per style (30 total) were pixel-sampled directly against the
      raw render (not the rasterised SVG, whose leader-line strokes can occlude the
      exact anchor pixel) and confirmed on-feature. `verdicts.json` was rewritten to
      mark the old "pass" entries DISPROVEN rather than delete them, and
      `assemble_md.py` was re-run. Its research, naming discussion, descriptions,
      reference and coloring page were sound and were kept untouched.
- [x] **Coloring-page bleed claims were wrong on two subjects — corrected.** The
      `type-iia-fibre` agent noticed that its own honestly-recorded non-bleed matched
      what the *finished* `type-i-fibre` and `type-iix-fibre` pages actually look
      like, while both of their verdicts claimed "runs off all 4 edges". It flagged
      this rather than copying the convenient wording. Measured (cairosvg at 800px,
      ink fraction in the outermost 6px of the top 72%, since the bottom band is
      deliberately blank): `type-i-fibre` reaches **three** edges (bottom 0.272,
      right 0.191, left 0.035, top 0.000) and `type-iix-fibre` reaches **one**
      (bottom 0.100). Both verdicts now carry a dated CORRECTED note instead of the
      false claim — kept, not deleted, so the audit trail shows what was believed and
      why it was wrong. All three pages remain usable: no starburst and no border are
      the genuinely unrecoverable failures, and both are absent everywhere.
      *Third instance in this set of a verdict asserting something the picture did
      not show (after the Giardia flagella count and the IIx striations). The
      pattern is now unmistakable: the claims that go wrong are the ones where a
      generic phrase from the brief gets echoed back as if it had been checked.*
- [x] `type-iia-fibre` — **complete.** 3d and watercolor were already correct on
      disk from the earlier session (pro tier, both patterns present, both ends
      cropped) and verified by magnified-crop checks before reuse. textbook (flash
      gen-03) failed a different way than the classic defect: transverse banding was
      confined to a small cutaway window while the outer fibre body — most of the
      visible surface, including both tips — showed longitudinal-only striping; a
      pro-tier re-roll of the same prompt fixed it in one pass. sem failed the
      classic longitudinal-only way on *both* flash (gen-01) and an unmodified
      pro-tier re-roll (gen-02) — escalating tier alone did not fix it here, unlike
      every sibling. What fixed it was rewriting the surface-relief instruction
      around a closed-loop analogy ("earthworm segments / bellows rings that return
      to their own starting point without ever moving toward either end of the
      tube") in place of the more ambiguous "transverse ridges...printed rings on a
      drinking straw" phrasing; the new wording passed on the first attempt with it
      (gen-03). All three illustrated styles' labelled SVGs were built fresh and
      every anchor was pixel-sampled against the raw base render; sampling the
      rasterised SVG composite directly at (ax,ay) turned out to read the leader
      line's own colour almost every time (the line starts exactly at the anchor
      point), so verification used a small perpendicular offset plus a direct check
      against the un-annotated base image. One anchor (3d/myofibril) was relocated
      after the composite showed a neighbouring label's text string overlapping it.
- [ ] `type-ii-fibre` — not started. It is the **umbrella** entry over IIa and IIx,
      so per SKILL.md it must be rendered as a group showing the variety rather
      than as a fifth near-duplicate sibling.
- [ ] Narration for the four fibres and the four new set/chapter intros
      (~11.9k ElevenLabs characters). Credits were topped up; run `tts.py` in the
      barrier step **after** `build_viewer.py` has seen the subjects.

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
- [ ] `type-iia-fibre` — the coloring page does not bleed off any of the four
      edges; the character sits centered with a generous white margin on all
      sides. Two attempts (the second with much stronger "crop the body at two
      edges" framing language) both came back the same way on the flash tier. Kept
      because the two unrecoverable failures (starburst, border/frame) are both
      genuinely absent — confirmed by scanning all four edge rows/columns for dark
      pixels, zero found. Note: this set's `type-i-fibre` and `type-iix-fibre`
      coloring pages show the same centered, margined composition in their actual
      PNGs despite their own `verdicts.json` entries claiming "runs off all 4
      edges" — that claim does not hold up against the archived images and should
      not be trusted or copied forward.
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

### Fixed in this pass, recorded because they were invisible
- [x] **The search box locked the browser tab.** `applySearch()` calls
      `refreshBuilt()` to re-apply `<mark>` highlighting, and `refreshBuilt()`
      calls `applySearch()` so an open results list follows a language switch.
      Both directions are wanted; together they were an unbounded cycle. It only
      bit on the *third* keystroke, because `terms()` ignores anything shorter
      than two characters, so the first real query still ran with the list closed
      — which is why it survived so long. A `reHighlighting` flag (set in a
      `try/finally`) now marks the arm you arrived through. Pre-existing on `main`.
- [x] **Two "See also" links pointed at nothing.** `mitochondrion` and `heartworm`
      referenced `contractile-cardiomyocyte` — the catalogue *name* — where the
      live render key is `cardiomyocyte`. The viewer drops a link whose target it
      cannot find, so both simply never rendered. `build_viewer.py` now warns on
      dangling and one-directional cross-references instead of swallowing them.
- [x] **`description_sci_*` was written and never read.** Three sets (`genetics`,
      `cancer-cells`, `pet-pathogens`) carried a scientific set intro that no
      reader ever saw, because the Scientist register was aliased to the generic
      description. It is now used, with the generic text as fallback.

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
