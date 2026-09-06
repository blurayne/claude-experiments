# Slice 10 — the `<style>` block (galactic-transit.html lines 17–386)

Source: `/home/markusg/Private/claude-experiments.ts-refactor/astro-visuals/galactic-transit.html`, lines 17–386 inclusive (`<style>` … `</style>`).

Size: 230 top-level entities — 216 rule blocks (235 individual selectors after comma expansion) plus 14 at-rule blocks (2 `@font-face`, 3 `@keyframes`, 9 `@media`).

Three lines are gigantic base64 payloads and must be moved verbatim, byte for byte:

| line | bytes | what |
| --- | --- | --- |
| 21 | 15 789 | `Orbitron` variable woff2 data URI |
| 23 | 54 581 | `Exo 2` variable woff2 data URI |
| 188 | 70 723 | frost texture `data:image/webp` — the **third** background-image layer of the `::before` frost rule |

Line 188 is *not* a font. It sits inside the `.hud::before, .env::before, .gamebar::before, .note::before, .info-card::before` rule and is the third entry of a three-layer `background-image`, paired with `background-size` (189) and `background-repeat` (190) lists that are positional. Splitting 182–190 across files, or reordering the three layers, changes the composite.

---

## 1. Every selector, grouped by what it styles

### 1.1 Tokens, fonts, reset (18–36)

| lines | selector | notes |
| --- | --- | --- |
| 18–19 | comment | why the fonts are embedded |
| 20–21 | `@font-face` `Orbitron` | weight 400–900, `font-display:swap` |
| 22–23 | `@font-face` `Exo 2` | weight 100–900, `font-display:swap` |
| 24–31 | `:root` | all 11 custom properties (§4) |
| 32 | `*` | margin/padding reset, `box-sizing:border-box` |
| 33–34 | `html,body` | `overflow:hidden`, background `#030610`, `color:var(--ink)`, `'Exo 2'` stack |
| 35 | `canvas#gl` | fixed inset-0, `touch-action:none`, `cursor:grab` |
| 36 | `canvas#gl.dragging` | `cursor:grabbing` (class toggled in JS at 3522 / 3545) |

### 1.2 The settings panel `.hud` and its chrome (38–53, 61–73, 75–83, 91, 96–102)

| lines | selector |
| --- | --- |
| 38–42 | `.hud` |
| 43 | comment |
| 44–45 | `.hud .body` |
| 46 | `.hud .body::-webkit-scrollbar` |
| 47 | `.hud .body::-webkit-scrollbar-thumb` |
| 48 | `.hud .body::-webkit-scrollbar-track` |
| 49–50 | comment |
| 51 | `.hud h1` |
| 52 | `.ver` |
| 53 | `.hud .sub` |
| 61 | `.toggles` |
| 62–64 | `.hudfoot` |
| 65–67 | `.hudlink` |
| 68 | `.hudlink:hover` |
| 69 | `@keyframes hudflash3` |
| 70 | `@keyframes hudflash10` |
| 71–72 | `.stepb` |
| 73 | `.stepb:hover` |
| 75–77 | `.sect` |
| 78 | `.sect:hover` |
| 79 | `.sect .arw` |
| 80 | `.sect.closed .arw` |
| 81–82 | `.sbody` |
| 83 | `.sbody.closed` |
| 91 | `.actsep` |
| 96 | `.seg` |
| 97–98 | `.seg button` |
| 99 | `.seg button + button` |
| 100 | `.seg button.on` |
| 101 | `.hud.flash3` |
| 102 | `.hud.flash10` |

### 1.3 Generic form primitives, used by every panel (54–60, 74)

| lines | selector |
| --- | --- |
| 54 | `.row` |
| 55 | `.row label` |
| 56 | `input[type=range]` |
| 57 | `input[type=range]::-webkit-slider-thumb` |
| 58 | `input[type=range]::-moz-range-thumb` |
| 59–60 | `select` |
| 74 | `.ico` |

### 1.4 Buttons (103–128)

| lines | selector | lives in |
| --- | --- | --- |
| 103–104 | `#dbgBtn` | `.hudfoot` (markup line 501) |
| 105–107 | `.dbg-b` | `#dbgCard` debug dialog (markup 1061–1064) |
| 108 | `.dbg-b:hover` | ditto |
| 109–111 | `.hudfoot button` | `.hudfoot` |
| 112 | `.hudfoot button:hover` | `.hudfoot` |
| 113–116 | `.rowbtn` | rows in `.hud` / `#simPanel` |
| 117 | `.rowbtn:hover` | |
| 118 | `.mults` | |
| 119–121 | `.mults button` | |
| 122 | `.mults button.on` | |
| 123–124 | `.tg` | toggle pills |
| 125 | `.tg.on` | |
| 126 | `.tg:focus-visible` | |
| 127 | `.stats` | |
| 128 | `.stats b` | |

### 1.5 Animation primitives (84–90)

| lines | selector |
| --- | --- |
| 84 | `@keyframes panelIn` |
| 85 | `.alertbox, #dbgCard` → `animation:panelIn .22s ease both` |
| 86 | `.pop` → `animation:panelIn .22s ease` |
| 87–90 | `@media (prefers-reduced-motion: reduce)` → `.sbody{transition:none}` and `.alertbox, #dbgCard, .pop{animation:none}` |

### 1.6 On-canvas readouts and labels (92–95, 129–136)

| lines | selector |
| --- | --- |
| 92 | comment |
| 93–95 | `#fpsBox` |
| 129–130 | `.note` (the "view … across" scale note, markup 1069) |
| 131 | `.note em` |
| 132–134 | `.armlbl` (spiral-arm labels) |
| 135–136 | `.lbl` (body labels) |

### 1.7 The Earth panel `.env` (137–149)

| lines | selector |
| --- | --- |
| 137–141 | `.env` |
| 142 | `.envsep` |
| 143 | `#env select` |
| 144–145 | `.env h2` |
| 146–147 | `.env .er` |
| 148–149 | `.env .er b` |

### 1.8 Global utility (150)

| lines | selector |
| --- | --- |
| 150 | `.crowded{display:none !important}` |

### 1.9 Alert boxes (151–158)

| lines | selector |
| --- | --- |
| 151–154 | `.alertbox` (`display:none` by default) |
| 155 | `#iceBox` |
| 156 | `#g710Box` |
| 157 | `body.ice #iceBox{display:block}` |
| 158 | `body.g710 #g710Box{display:block}` |

### 1.10 The state-colour / frost theme layer (159–194)

| lines | selector |
| --- | --- |
| 159–164 | comment (claims this block overrides the panel rules — only partly true, see §3.1) |
| 165–175 | `.hud, .env, .gamebar, .note, .info-card` — three-layer `background`, `border-color`, `border-top-color`, `box-shadow` all driven by `--iceA` / `--stateRGB` / `--stateA` |
| 176–181 | comment |
| 182–190 | `.hud::before, .env::before, .gamebar::before, .note::before, .info-card::before` — frost overlay; `opacity:calc(var(--iceA) * .269)`, `mix-blend-mode:screen`, three-layer `background-image` (line 188 = webp data URI), `background-size` (189) and `background-repeat` (190) lists |
| 191 | `.tg.on{border-color:…}` — second declaration, overrides line 125 |
| 192 | `.mults button.on{border-color:…}` — second declaration, overrides line 122 |
| 193–194 | `#eLife` |

### 1.11 Small-screen panel tuning (195–200)

| lines | selector |
| --- | --- |
| 195–200 | `@media (max-width:640px)` → `.env` (196), `.env h2, .hud h1` (197), `.env .er` (198), `.env .er b` (199) |

### 1.12 The tour overlay (201–243)

| lines | selector |
| --- | --- |
| 201–202 | `#infoModal` |
| 203–204 | `#tour` |
| 205 | `#tourHints` |
| 206–208 | `.hint` |
| 209–210 | `.hint b` |
| 211 | `#tourSvg` |
| 212–215 | `#tourCard` |
| 216–217 | `#tourCard h2` |
| 218–220 | comment |
| 221–222 | `#tourLogo` |
| 223–225 | `#tourGo` |
| 226 | `#tourGo:hover` |
| 227–228 | `#tourBuild` |
| 229 | `.intro` |
| 230 | `#tourCard .short{display:none}` |
| 231–234 | `@media (max-width:760px), (max-height:820px)` → `#tourCard .long{display:none}` (232), `#tourCard .short{display:block}` (233) |
| 235–240 | `@media (max-width:620px)` → `.hint` (236), `#tourCard` (237), `#tourCard .intro` (238), `#tourLogo` (239) |
| 241–242 | comment |
| 243 | `@media (max-height:790px)` → `#tourCard{max-height:44vh}` and `#tourLogo{width:96px;height:96px}` |

### 1.13 The info dialog and the evolution table/chart (244–289)

| lines | selector |
| --- | --- |
| 244–247 | `.info-card` |
| 248 | `.info-body` |
| 249 | comment |
| 250–251 | `.info-sub` |
| 252 | `.info-card h2` |
| 253 | `.info-card h3` |
| 254 | `.info-card b` |
| 255 | `.info-card ul` |
| 256 | `.info-card li` |
| 257 | `.evo-wrap` |
| 258 | `.evo-table` |
| 259 | `.evo-table th, .evo-table td` |
| 260–261 | `.evo-table th` |
| 262 | `.evo-table td:first-child` |
| 263 | `.evo-table td:last-child` |
| 264 | `.evo-table tr:last-child td` |
| 265 | `.evo-table tr:nth-child(even) td` |
| 266 | `.evo-age` |
| 267 | `.evo-chart-wrap` |
| 268–269 | `.evo-chart` |
| 270 | `@media (min-width:760px)` → `.evo-chart{width:100%}` |
| 271 | `.evo-title` |
| 272 | `.evo-grid` |
| 273 | `.evo-frame` |
| 274 | `.evo-axis` |
| 275 | `.evo-max` |
| 276 | `.evo-min` |
| 277 | `.evo-avg` |
| 278 | `.evo-today` |
| 279 | `.evo-today-lbl` |
| 280 | `.evo-whisker` |
| 281 | `.evo-whisker-lbl` |
| 282 | `.evo-lead` |
| 283 | `.evo-mk` |
| 284 | `.evo-lbl` |
| 285 | `.evo-legend rect` |
| 286 | `.evo-legend text` |
| 287–288 | `#infoClose` |
| 289 | `#infoClose:hover` |

### 1.14 Panel open/close chrome and the dock dots (290–308)

| lines | selector |
| --- | --- |
| 290 | `#collapse` |
| 291 | `#envMin` |
| 292–294 | `#envPlus, .pdot` (`display:none` default) |
| 295 | `.pdot.act{display:block}` |
| 296 | `.pdot .ico` |
| 297 | `.pdot.act .ico` |
| 298 | `.pdot.act.on` |
| 299–300 | `.pclose` |
| 301 | comment |
| 302 | `.pnl.drag, .hud.drag` |
| 303 | `.simPanelWide` |
| 304–305 | comment |
| 306 | `#simPanel .row > span{min-width:44px !important;font-size:10px}` |
| 307 | `#simPanel .row > label` |
| 308 | `#simPanel select` |

### 1.15 The bottom status bar `.gamebar` (309–321, 357–380, 384)

| lines | selector |
| --- | --- |
| 309–310 | `.gamebar` — position, `display:flex`, `gap:28px`, `transition:transform .28s ease` |
| 311 | `.gamebar.slid` |
| 312–314 | `#barGrip` |
| 315 | `.gamebar.slid #barGrip` |
| 316 | `.gamebar{touch-action:none}` — third `.gamebar` block |
| 317 | `#barGrip span` |
| 318–320 | `.gamebar` — background, border, box-shadow, backdrop-filter, z-index, white-space |
| 321 | `.gamebar .stat` |
| 357 | `.gamebar .cnt` |
| 358–359 | `.gamebar .cnt b` |
| 360 | `.gamebar .cnt.death b` |
| 361 | `.gamebar .cnt.birth b` |
| 362–364 | comment |
| 365–369 | `@media (max-width:820px)` → `.gamebar` (366), `.gamebar .stat, .gamebar .cnt` (367), `.gamebar .stat b, .gamebar .cnt b` (368) |
| 370 | `.gamebar .brk{display:none}` |
| 371–379 | `@media (max-width:620px)` → `.gamebar` (372–373), `#cDeath`/`#cBirth` (376), `.gamebar .brk` (377), `#sCal`/`#sAge`/`#sGyr` (378) |
| 380 | `.gamebar .stat b` |
| 384 | `@media (max-width:600px)` → `.note`, `.hud`, `.gamebar`, `.gamebar .stat b` |

### 1.16 Checkboxes and the (i) affordance (322–341)

| lines | selector |
| --- | --- |
| 322 | `.chks` |
| 323 | `.chks.indent` |
| 324–325 | `.chk` |
| 326 | comment |
| 327–328 | `.chk input` |
| 329–330 | `.chk input::before` |
| 331 | `.chk input:checked` |
| 332 | `.chk input:checked::before` |
| 333 | `.chk:has(input:checked)` |
| 334 | `#hud .chk` |
| 335 | `.chk.plain` |
| 336 | comment |
| 337–339 | `.info` |
| 340 | `.info:hover, .info.on` |
| 341 | `.chk .info` |

### 1.17 Debug tabs and the error log (342–353)

| lines | selector |
| --- | --- |
| 342 | comment |
| 343 | `.tabs` |
| 344–345 | `.tabs .tab` |
| 346 | `.tabs .tab.on` |
| 347 | `.tabs .tab b` |
| 348 | `#logList` |
| 349–350 | `.logrow` |
| 351 | `.logrow.error` / `.logrow.warn` / `.logrow.load` (three rules on one line) |
| 352 | `.logrow .meta` |
| 353 | `.logempty` |

### 1.18 Tooltip and reopen dot (354–356, 381–383, 385)

| lines | selector |
| --- | --- |
| 354–356 | `#tip` — the element does **not** exist in markup; JS creates it at line 4521 |
| 381–383 | `#reopen` |
| 385 | `@media (prefers-reduced-motion: reduce){}` — empty, comment only ("handled in JS") |

---

## 2. Proposed split

**Concatenation order is part of the contract: `base.css` → `panels.css` → `dialogs.css` → `hud.css`.** Within each file, blocks must appear in ascending original line order. Every move below has been checked against §3; the ordering constraints in §3 are only satisfied by this file order.

### `styles/base.css`

| original lines | contents |
| --- | --- |
| 18–19 | font comment |
| 20–21 | `@font-face` Orbitron (line 21 = base64, verbatim) |
| 22–23 | `@font-face` Exo 2 (line 23 = base64, verbatim) |
| 24–31 | `:root` tokens |
| 32 | `*` reset |
| 33–34 | `html, body` |
| 35–36 | `canvas#gl`, `canvas#gl.dragging` |
| 54–55 | `.row`, `.row label` |
| 56–58 | `input[type=range]` + both thumb pseudo-elements |
| 59–60 | `select` |
| 74 | `.ico` |
| 150 | `.crowded` |

Moves: 54–60, 74 and 150 move *earlier* (ahead of `.hud`). Safe — see §3.7, §3.8, §3.9.

### `styles/panels.css`

| original lines | contents |
| --- | --- |
| 38–53 | `.hud`, `.hud .body` + 3 scrollbar pseudo-elements, `.hud h1`, `.ver`, `.hud .sub` |
| 61–68 | `.toggles`, `.hudfoot`, `.hudlink`, `.hudlink:hover` |
| 69–73 | `@keyframes hudflash3`, `@keyframes hudflash10`, `.stepb`, `.stepb:hover` |
| 75–83 | `.sect` family, `.sbody`, `.sbody.closed` |
| 84–90 | `@keyframes panelIn`, `.alertbox, #dbgCard` animation, `.pop`, the `prefers-reduced-motion` reset block |
| 91 | `.actsep` |
| 96–102 | `.seg` family, `.hud.flash3`, `.hud.flash10` |
| 103–104 | `#dbgBtn` |
| 109–112 | `.hudfoot button`, `:hover` |
| 113–128 | `.rowbtn`, `.mults`, `.tg`, `.stats` families |
| 129–131 | `.note`, `.note em` |
| 137–149 | `.env` family |
| 159–194 | state-colour block, frost `::before` block (line 188 base64 verbatim), `.tg.on` and `.mults button.on` overrides, `#eLife` |
| 195–200 | `@media (max-width:640px)` |
| 290–303 | `#collapse`, `#envMin`, `#envPlus, .pdot` family, `.pclose`, `.pnl.drag/.hud.drag`, `.simPanelWide` |
| 304–308 | `#simPanel` row overrides |
| 322–341 | `.chks` / `.chk` / `.info` families |
| 342–353 | `.tabs`, `#logList`, `.logrow`, `.logempty` |
| 381–383 | `#reopen` |

Note the deliberate exclusions: `.note`'s **layout** rule (129–131) stays here, because it must precede the state-colour block at 165–175 for `.note` to be tinted (§3.1). `.alertbox`'s animation (85) stays here while its layout (151–158) goes to `hud.css`; they share no property.

### `styles/dialogs.css`

| original lines | contents |
| --- | --- |
| 105–108 | `.dbg-b`, `.dbg-b:hover` (buttons inside `#dbgCard`) |
| 201–243 | `#infoModal`, `#tour`, `#tourHints`, `.hint` family, `#tourSvg`, `#tourCard` family, `#tourLogo`, `#tourGo`, `#tourBuild`, `.intro`, and the three tour media queries (231–234, 235–240, 243) — **keep in this exact order** |
| 244–256 | `.info-card` family |
| 257–270 | `.evo-wrap`, `.evo-table` family, `.evo-age`, `.evo-chart-wrap`, `.evo-chart`, `@media (min-width:760px)` |
| 271–286 | `.evo-*` SVG rules |
| 287–289 | `#infoClose`, `:hover` |

Moves: 105–108 moves *later* (after all of `panels.css`). Safe — see §3.10.

### `styles/hud.css`

| original lines | contents |
| --- | --- |
| 92–95 | `#fpsBox` (with its comment) |
| 132–136 | `.armlbl`, `.lbl` |
| 151–158 | `.alertbox`, `#iceBox`, `#g710Box`, `body.ice #iceBox`, `body.g710 #g710Box` |
| 309–321 | `.gamebar` (all three blocks), `.gamebar.slid`, `#barGrip` family, `.gamebar .stat` |
| 354–356 | `#tip` |
| 357–361 | `.gamebar .cnt` family |
| 362–380 | comment, `@media (max-width:820px)`, `.gamebar .brk`, `@media (max-width:620px)`, `.gamebar .stat b` — **keep in this exact order, it is load-bearing (§3.3)** |
| 384 | `@media (max-width:600px)` |
| 385 | empty `@media (prefers-reduced-motion: reduce)` |

Moves: 92–95, 132–136 and 151–158 move *later* (after panels and dialogs). Safe — see §3.11.

### Delivery note

Whatever the build does, the four files must reach the document as four render-blocking stylesheets in `<head>` in the order above, before the body parses. Do **not** let a bundler turn them into JS-injected `<style>` tags: §5 lists seven synchronous `getComputedStyle(...).display` reads and one `offsetWidth` read that run during boot and would see unstyled elements.

---

## 3. Cascade-order dependencies — the exhaustive list

Two `!important` declarations exist in the whole block: line 150 and line 306. Everything else is decided by specificity and source order.

### 3.1 The state-colour block only reaches three of its five selectors — CRITICAL

Lines 165–175 apply `background`, `border-color`, `border-top-color`, `box-shadow` to `.hud, .env, .gamebar, .note, .info-card`. The comment at 163–164 asserts this "overrides their own background, border and shadow". That is true for `.hud` (38–42), `.env` (137–141) and `.note` (129–130), which are all declared *before* line 165.

It is **false** for two of them:

- `.gamebar` re-declares `background:var(--panel)`, `border:1px solid var(--line)` (a shorthand, so it resets `border-color` and `border-top-color`) and `box-shadow` at **lines 318–320**, after 165–175, at equal specificity `(0,1,0)`. Later wins → **the status bar never receives the ice/state tint on its own box.**
- `.info-card` re-declares the same three properties at **lines 245–247**, also after 165–175, equal specificity. Later wins → **the info dialog never receives the tint either.**

Both still get the frost `::before` overlay (182–190), which is a different selector and unaffected.

Consequences for the split:
- `panels.css` (holding 165–175) must load **before** `dialogs.css` (holding 244–247) and **before** `hud.css` (holding 318–320). The proposed order satisfies this.
- `.hud`, `.env` and `.note` base rules must stay in `panels.css` **above** 165–175. Do not "tidy" `.note` into `hud.css` with the other on-canvas readouts: that would move it after the tint block and the scale note would stop freezing over.
- If anyone ever consolidates the state block into a `theme.css` loaded last, the gamebar and info card start icing over and every winter screenshot changes.

### 3.2 `.tg.on` and `.mults button.on` are each declared twice

- `.tg.on` at 125 (`border-color:rgba(95,216,255,.55)`) and again at **191** (`border-color:rgba(var(--stateRGB), calc(.55 + var(--stateA) * .10))`). Equal specificity `(0,2,0)`; 191 wins. Both are in `panels.css`, keep 125 before 191.
- `.mults button.on` at 122 and again at **192**, same story, specificity `(0,1,1)`.

Reordering either pair freezes the toggle borders at static cyan instead of tracking the hazard colour.

### 3.3 `.gamebar .stat b` defeats its own media query — CRITICAL and counter-intuitive

- Line **368**, inside `@media (max-width:820px)`: `.gamebar .stat b, .gamebar .cnt b{font-size:12px}`.
- Line **380**, unconditional: `.gamebar .stat b{…font-size:14px…}`.

Both are specificity `(0,2,1)`; a media query adds nothing to specificity. Line 380 is later, so **on screens ≤820 px the `.stat` numbers stay at 14 px while the `.cnt` numbers shrink to 12 px**. Line 384's `@media (max-width:600px){.gamebar .stat b{font-size:14px}}` then restates 14 px, which is redundant given 380 but harmless.

If a refactor sorts the media queries to the bottom of the file — the conventional tidy-up — line 368 starts winning and the status-bar numbers shrink at ≤820 px. Keep 365–369, 370, 371–379, 380, 384 in exactly that sequence inside `hud.css`.

### 3.4 The three `.gamebar` media queries stack, and `gap` is a shorthand

At a 600 px-wide viewport all three of `@media (max-width:820px)` (366), `@media (max-width:620px)` (372–373) and `@media (max-width:600px)` (384) match, all at specificity `(0,1,0)`. Source order alone decides:

- `gap`: 28px (310) → 15px (366) → *(620 block sets only `row-gap:6px`)* → **16px (384)**. Because line 384 uses the `gap` shorthand it also resets `row-gap` back to 16px, discarding the `row-gap:6px` set at line 372. That is current behaviour and must be preserved verbatim.
- `padding`: `9px 20px` (319) → `8px 13px` (366) → `8px 14px` (384).
- `white-space`: `nowrap` (320) → `normal` (372).

Note also that `.gamebar`'s `padding` at 319 comes *after* the position block at 309–310 but *before* the media queries — all four `.gamebar` blocks (309–310, 316, 318–320, plus the media entries) must stay in original relative order.

### 3.5 `#tourCard` / `#tourLogo`: two media queries that both match on a small phone

- `#tourCard{max-height:88vh}` (212) → `@media (max-height:790px){#tourCard{max-height:44vh}}` (243). Equal specificity `(1,0,0)`; 243 must stay later.
- `#tourCard{font-size:11.5px;padding:18px 20px}` (212–215) → `@media (max-width:620px){#tourCard{font-size:10.5px;padding:14px 15px}}` (237). 237 must stay later.
- `#tourLogo{width:132px;height:132px}` (221) → `@media (max-width:620px){width:88px}` (239) → `@media (max-height:790px){width:96px}` (243). **On a viewport that is both ≤620 px wide and ≤790 px tall — i.e. most phones in portrait — the logo is 96 px, not 88 px**, purely because 243 comes after 239. Swap the two media blocks and the tour logo changes size on every phone screenshot.

### 3.6 `#tourCard .short` / `.long` toggle

`#tourCard .short{display:none}` (230) is undone by `@media (max-width:760px), (max-height:820px){#tourCard .short{display:block}}` (233), equal specificity `(1,1,0)`. 233 must stay after 230, and 232 (`.long{display:none}`) has no unconditional counterpart. Both in `dialogs.css`, contiguous — safe.

### 3.7 `.crowded` is the only thing that can beat an inline `display`

Line 150, `.crowded{display:none !important}`. `fitPanels()` (4906–4920) adds this class to `#fpsBox`, `#scaleNote` and `#gamebar` — all three of which also carry an inline `style="display:…"` written by JS (1046, 3992-style writes, 6291). Only `!important` outranks an inline declaration, so this rule is immune to source order and can safely move to the top of `base.css`.

Guard: it stays immune only as long as no other `!important display` declaration is introduced for those elements. There is currently none.

### 3.8 `.row` / `select` / `input[type=range]` moving to `base.css`

These are element- and attribute-selector rules at specificity `(0,0,1)`/`(0,1,1)`. Everything that overrides them does so by higher specificity *and* later position today:

- `select` (59–60) → `#env select` (143, `(1,0,1)`) and `#simPanel select` (308, `(1,0,1)`).
- `.row` (54) → `#simPanel .row > span` (306) and `#simPanel .row > label` (307).
- `input[type=range]` (56) never collides with `.chk input` (327), which only matches checkboxes.

Moving them to the front of `base.css` preserves both relations.

### 3.9 `.ico` moving to `base.css`

`.ico` (74) is overridden by `.pdot .ico` (296, `(0,2,0)`) and `.pdot.act .ico` (297, `(0,3,0)`). Higher specificity, and still later in the proposed order. Safe.

### 3.10 `.dbg-b` moving to `dialogs.css`

`.dbg-b` (105–108) moves after `.hudfoot button` (109–112). This would matter if a `.dbg-b` button lived inside `.hudfoot`, because `.hudfoot button` is `(0,1,1)` and would then start losing to `.dbg-b` `(0,1,0)`… except it wouldn't, `(0,1,1)` still outranks `(0,1,0)` regardless of order. And in fact the four `.dbg-b` buttons live in `#dbgCard` (markup 1061–1064), not in `.hudfoot`, so there is no overlap at all. Safe.

### 3.11 The `hud.css` moves (`#fpsBox`, `.armlbl`, `.lbl`, `.alertbox` family)

- `#fpsBox` (93–95): unique selector, nothing else in the block targets it; only inline styles from `layoutPanels()` (4027) compete, and inline always wins. Safe to move later.
- `.armlbl` (132–134), `.lbl` (135–136): unique selectors, no other rule matches. Safe.
- `.alertbox` (151–154): moving it after `panels.css` puts it after line 85 (`.alertbox, #dbgCard{animation:panelIn}`) and after line 89 (`.alertbox … {animation:none}` under reduced motion). The 151–154 block declares no `animation` property, so nothing changes. **The 85 → 89 pair itself must stay in that order inside `panels.css`**, otherwise reduced-motion users get the panel-in animation back.
- `body.ice #iceBox` (157) is `(1,1,1)` versus `.alertbox{display:none}` `(0,1,0)` — order-immune.

### 3.12 Specificity traps that are order-immune but easy to break by "cleanup"

These do not constrain the split, but any rewrite that touches them changes rendering:

- `.hudfoot button` `(0,1,1)` at 109–111 **outranks** `.tg` `(0,1,0)` at 123–124. The two `.tg` pills in the footer (`#tFull`, `#tRotate`, markup 498–499) therefore render with `font-family:inherit` (Exo 2, *not* Orbitron), `font-size:8px`, `letter-spacing:.11em` and `padding:4px 8px` — the `.tg` values are all losing. `.tg.on` `(0,2,0)` does win, so the "on" colour and glow still apply.
- `#dbgBtn` `(1,0,0)` at 103–104 outranks both `.hudfoot button` and `.hudfoot button:hover` `(0,2,1)`, which is why the debug button keeps its amber `#ffb066` even on hover.
- `#collapse` `(1,0,0)` at 290 (`top:10px;right:10px`) outranks `.pclose` `(0,1,0)` at 299–300 (`top:6px;right:8px`), and the collapse button carries both (markup 392). The 10/10 offsets win.
- `#hud .chk` `(1,1,0)` at 334 outranks `.chk.plain` `(0,2,0)` at 335, so `.plain` is inert inside the settings panel.
- `.chk .info{margin-left:-3px}` `(0,2,0)` at 341 outranks `.info{margin-left:2px}` `(0,1,0)` at 338.
- `#envPlus` and `#reopen` are `(1,0,0)` in the `display:none` rules at 292 and 381, so **`.pdot.act{display:block}` `(0,2,0)` at 295 can never reveal them**. They are shown only by the inline write at line 3992. `#reopen` also carries `class="pdot"` (markup 1012), which means it receives `left:14px` from 292 *and* `right:14px` from 381 — an over-constrained fixed box that resolves to `left` in LTR; in practice `layoutPanels()` overwrites `left`/`top` inline anyway.
- `#simPanel .row > span{min-width:44px !important}` (306): the `!important` exists because those spans carry inline `style="min-width:64px"` / `"44px"` (markup 1022–1024). Removing the `!important` widens the readout column and shortens every slider in the simulation panel.

### 3.13 Rules whose position is otherwise pinned

- The two `@font-face` blocks must stay first in `base.css`: they are what the `font-family:'Exo 2'` on `html,body` (34) resolves against. Their relative order does not matter (different families), but they must load in the same render-blocking way they do now, or first-paint text metrics change and `getBoundingClientRect()` measurements taken during boot shift.
- `@keyframes hudflash3` (69), `hudflash10` (70), `panelIn` (84): keyframe rules are resolved by name, and only a later `@keyframes` with the *same* name overrides. All three names are unique, so these three are order-immune — but they must end up in a file that loads before or with their consumers (`.hud.flash3`/`.flash10` at 101–102, `.alertbox/#dbgCard/.pop` at 85–86), which the proposal satisfies by keeping them together in `panels.css`.
- `@media (min-width:760px){.evo-chart{width:100%}}` (270) must stay after `.evo-chart{width:680px}` (268), equal specificity. Both in `dialogs.css`, contiguous.
- `@media (max-width:640px){.env h2, .hud h1{font-size:7.5px}}` (197) must stay after `.hud h1` (51) and `.env h2` (144). All three in `panels.css`, in that order.
- `@media (max-width:600px){.hud{width:min(366px,…)}}` (384, in `hud.css`) must stay after `.hud{width:min(478px,…)}` (38, in `panels.css`). The proposed file order preserves this.
- `.gamebar .brk{display:none}` (370) must stay before `@media (max-width:620px){.gamebar .brk{display:block…}}` (377).
- `.sbody{transition:…}` (81) before `@media (prefers-reduced-motion){.sbody{transition:none}}` (88).
- `.evo-table tr:last-child td{border-bottom:0}` (264) and `.evo-table th, .evo-table td{border-bottom:1px …}` (259): `(0,2,1)` vs `(0,1,1)`; specificity decides, order-immune. Same for `.evo-table tr:nth-child(even) td` (265).
- The three-value lists in the frost rule (`background-image` 185–188, `background-size` 189, `background-repeat` 190) are positionally coupled. Treat 182–190 as one atom.

---

## 4. Custom properties

All 11 are declared once, in `:root` (lines 24–31). None is declared anywhere else in CSS.

| property | declared | value | read from CSS (line numbers) | written from JS |
| --- | --- | --- | --- | --- |
| `--ink` | 25 | `#dce8f5` | 33, 59, 106, 128, 148, 207, 254, 262, 271, 278, 279, 284, 347, 350, 355 (15 in-block) + inline `style=` attributes at 401, 403, 413–418, 470, 485, 1022–1024, 1058 | **yes** — `documentElement.style.setProperty('--ink', …)` at **4885**… (4884), from `INK_WARM` |
| `--dim` | 25 | `#8492ac` | 52, 53, 55, 64, 66, 72, 77, 98, 110, 115, 120, 124, 127, 129, 147, 215, 228, 229, 247, 251, 266, 274, 280, 281, 286, 287, 290, 291, 299, 317, 321, 324, 328, 337, 338, 345, 349, 352, 353, 357 (40 in-block) + inline at 402, 492, 1055, 1066 | **yes** — line **4885**, from `DIM_WARM` |
| `--line` | 25 | `rgba(120,190,255,.20)` | 40, 56, 59, 63, 72, 77, 91, 96, 99, 104, 106, 110, 115, 120, 123, 127, 130, 139, 142, 213, 246, 257, 259, 269, 272, 273, 285, 293, 313, 319, 345, 382 (32) + inline at 1052, 1058 | no |
| `--panel` | 26 | `rgba(4,9,19,.74)` | 38, 130, 137, 171, 206, 213, 245, 260, 293, 313, 319, 382 (12) + inline at 1052 | no |
| `--accent2` | 26 | `#a78bfa` | 253, 260, 277, 283 | no |
| `--stateRGB` | 27 | `95,216,255` | 30 (twice, to derive `--accent`/`--glow`), 66, 68, 117, 171, 172, 173, 174, 175, 191, 192 | **yes** — line **4892** |
| `--stateA` | 27 | `0` | 171, 172, 173, 174, 175, 191, 192 | **yes** — line **4893** |
| `--iceA` | 28 | `0` | 169 (×2), 170 (×2), 184 | **yes** — line **4878** |
| `--lifeRGB` | 29 | `74,214,126` | 193, 194 | **yes** — line **4894** |
| `--accent` | 30 | `rgb(var(--stateRGB))` | 51, 57, 58, 68, 73, 78, 94, 100, 108 (×2), 112, 117, 122, 125, 126, 131, 145, 210, 217, 225, 252, 289, 293, 298, 329, 331, 333, 340 (×2), 346 (×2), 355, 380, 382 (32 lines) + inline at 1056 | no — derived |
| `--glow` | 30 | `rgba(var(--stateRGB), .45)` | 51, 57, 58, 95, 100, 122, 125, 131, 145, 217, 252, 380 | no — derived |

### Things the split must not disturb

1. **`--accent` and `--glow` are derived on `:root`.** `var()` substitution happens on the element that declares the property, i.e. `html`. JS writes `--stateRGB` on `document.documentElement` (4892), which is the same element, so the derived values track. The comment at 4889–4890 records this explicitly. If `:root` ever moves to a `body`-scoped selector, or if `--accent` is re-declared further down the tree, the JS writes stop reaching it and the whole interface freezes at static cyan.
2. **`--ink` and `--dim` are duplicated in JS.** `const INK_WARM = [220,232,245], DIM_WARM = [132,146,172];` at line 4844 are byte-identical to the CSS values `#dce8f5` and `#8492ac` at line 25. After the first `setColour()` frame the CSS values are dead — they only govern the very first paint. Once the tokens live in `styles/base.css`, this duplication is invisible from the JS side; leave a cross-reference comment at both ends.
3. Every JS write is on `document.documentElement.style`, i.e. an inline declaration on `html`, so it outranks any stylesheet declaration no matter which file wins the cascade. The split cannot change this.
4. All five JS writes are guarded by change detection (`lastIce`, `lastWhite`, `lastRGB`, `lastA` at 4876/4881/4887) — the properties are only touched when the value actually moves. Do not "simplify" that away; it is a per-frame hot path.

---

## 5. Hazards

Nothing in this slice consumes randomness. `Math.random` is never reachable from CSS, so lines 17–386 cannot perturb the seeded-PRNG stream. The hazards here are of the other two kinds: boot ordering, and element ids.

1. **Line 4521 — `#tip` is created by JS, styled by CSS, and measured immediately.** `const tipEl = document.createElement('div'); tipEl.id = 'tip'; document.body.appendChild(tipEl);` runs at module-evaluation time. `showTip()` sets `display:block` (4527) and reads `tipEl.offsetWidth` / `offsetHeight` on the very next line (4528) to position the tooltip. If `hud.css` (which holds `#tip` at 354–356: `max-width:250px`, `padding:7px 9px`, `font:11px/1.4 …`) is injected asynchronously or after script evaluation, the measurement is taken against an unstyled div and the tooltip lands in the wrong place. `#tip` is also the only id in the stylesheet with no counterpart in the static markup — a parse check of the HTML will not catch it going missing.

2. **Seven synchronous `getComputedStyle(el).display` reads run during boot and branch on stylesheet rules.**
   - 3627 — `getComputedStyle($('dbgBtn')).display === 'none'` decides whether the ten-tap gesture turns debug mode on or off. Depends on `#dbgBtn` (103–104) plus the inline `style="display:none"` at markup 501.
   - 4016 and 4027 — inside `layoutPanels()`, skip docked buttons and `#fpsBox` that are `display:none`. Depends on `#envPlus, .pdot{display:none}` (292), `.pdot.act{display:block}` (295), `.crowded{display:none !important}` (150) and `#fpsBox` (93–95).
   - 4618, 4621 — `tourTarget()` picks the panel or falls back to its dot based on computed `display`. Same rules.
   - 6092, 6103 — alert-box placement reads `.gamebar` and `.alertbox` computed `display`. Depends on 318–320, 151–154, 157–158, and the `@media (max-width:…)` blocks.
   These are *reads of the cascade result*, so a CSS-ordering mistake does not merely shift pixels, it takes a different code path and writes different inline `left`/`top`/`width` values.

3. **`fitPanels()` (4906) and `layoutPanels()` measure `getBoundingClientRect()` at boot.** Those measurements depend on the embedded `@font-face` faces having been applied. Today the fonts are inline data URIs inside a render-blocking `<style>` in `<head>`, so the faces are available with no network round-trip. Converting them to external `.woff2` files, or moving them out of the first stylesheet, introduces a fallback-font paint and changes every measured box — a guaranteed screenshot-parity failure. Keep the two `@font-face` rules at the very top of `base.css` and keep the base64 payloads inline.

4. **The error-log collector at markup lines 1095–1120 must still be the first script.** It registers a capturing listener (`}, true);` at 1120 — "a failed `<img>` or `<script>` does not bubble". If the CSS split moves any stylesheet reference *after* that script, a failing stylesheet load would begin to be logged where it previously was not, and `#logList` / `.logrow` counters change. Put all four `<link>` elements in `<head>` above the collector, exactly where `<style>` sits today, and keep them render-blocking.

5. **File order is the whole contract.** §3.1 and §3.3 are the two places where a plausible, well-intentioned reordering silently changes rendering: the status bar and the info dialog would start icing over, and the status-bar numerals would shrink at ≤820 px. Neither shows up in a parse check, a linter, or a diff of declarations — only in a pixel comparison, and §3.1 only in a frame where `--iceA > 0`. **The parity run must include at least one frame inside a glacial epoch (`body.ice` set, `--iceA` near 1) and at least one viewport in each of the 601–620 px, 621–820 px and ≥821 px bands, plus one that is ≤620 px wide *and* ≤790 px tall for §3.5.** Without those, the split can pass the gate and still be wrong.

6. **`#reopen` and `#envPlus` cannot be shown by their `.act` class** (§3.12). They depend on the inline write at 3992. If a later refactor "fixes" this by removing the id rules, the dots start obeying `.act` and appear at different times.

7. **`.pnl.drag` matches only `#simPanel`.** The drag handler adds `drag` to whichever panel is being dragged (4071), but `#env` (markup 1070) and `#gamebar` (markup 1003) carry no `pnl` class, so the `transition:none;animation:none` at 302 never applies to them. `.gamebar` does have `transition:transform .28s ease` (310), so dragging the bar animates against the pointer. That is current behaviour; the split must not accidentally correct it.

8. **Two selectors in the stylesheet target classes that only JS ever sets**, and are invisible to a static check: `canvas#gl.dragging` (36; set at 3522/3545), `.hud.flash3` / `.flash10` (101–102; 3646/3653/3654), `.pop` (86; 3979–3980), `.gamebar.slid` (311, 315; 3923/3940/3942/4209/4247/6093), `.sect.closed` / `.sbody.closed` (80, 83; 4114–4115), `body.ice` / `body.g710` (157–158; 6086/6088), `.crowded` (150; 4909/4918), `.pdot.act` (295; 3823). Any id or class rename in the JS slice must be mirrored here.
