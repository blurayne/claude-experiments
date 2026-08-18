# Verification rubric

A verify-subagent (or, for a one-off prototype, the main agent) VIEWS each render and
scores it against the microbe's science reference. Output per image: **PASS /
PARTIAL / FAIL**, a one-line reason, and — if not PASS — a concrete **fix-prompt** to
feed the next render. Iterate up to **5×/style**, then decide teaching-readiness.

## Check every render for
1. **Gross morphology** — correct overall shape and proportions (e.g. rod ~3–4× longer
   than wide, rounded poles).
2. **Required structures present & correct** — only the structures the reference lists,
   each in the right place, size, and count. Interior structures only where the medium
   would show them (SEM = surface only; that's correct, not a miss).
3. **No scientifically-misleading features** — none of the reference's "do NOT draw"
   items (e.g. mesosome; nucleoid as a tidy loop; plasmids/organelles outside the cell;
   mixed Gram envelopes).
4. **No baked-in text/artifacts** — no letters, numbers, labels, scale bars, watermarks,
   duplicated specimens, extra floating objects, or AI glitches.
5. **Label-ability** — structures are separated enough that leader lines can attach.
6. **Framing** — single specimen, centered, enough margin, background clean.

## Transient vs bad-result (drives escalation)
- **Transient** (DNS, HTTP 5xx, timeout) → just retry the same model; does not count
  toward escalation.
- **Bad result** (verify PARTIAL/FAIL) → refine the prompt and re-render. After ~2 bad
  results on a style, escalate the model (Nano Banana → Nano Banana Pro → *ask user* →
  Imagen). See `models.md`.

## Common fix-prompts that work
- "Structure X must be INSIDE the cytoplasm, never floating outside the cell body; the
  space around the cell must be completely empty background."
- "Exactly ONE of X" / "make X tiny and numerous, randomly dispersed."
- "Remove all text, letters and scale bars."
- "Draw a single specimen only; no duplicates."

## Real-microscopy reference
The downloaded micrograph gets the SAME visual check ("does it actually show the
microbe?") and a licence note. **Prefer a SINGLE isolated specimen; if only a group
is available, it must clearly show the microbe's features** (shape, poles, surface
appendages) — reject dense clumps where individual cells and their structures are not
readable. Watch for baked-in instrument data/scale bars — fine for a comparison image,
but crop them before using the micrograph as an SVG label base.
