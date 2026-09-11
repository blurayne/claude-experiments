# Debug Hold Gesture Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "tap the about button three times, hold the third for 5s" debug-mode gesture with a plain 3-second press-and-hold, and make debug mode enter as a closed panel (button only) on touch devices, for every entry door.

**Architecture:** Two independent, sequential changes in the existing `astro-visuals` (galactic-transit) TypeScript source: (1) rewrite the pointer-event state machine on the `#tInfo` ("?") button in `src/ui/hud.ts`, dropping its tap-counter and re-timing its two `setTimeout`s; (2) gate the one line in `src/ui/debug.ts` that auto-opens `dbgPanel` on entry behind `!TOUCH_DEV`, so all three entry doors (hold, the "debug mode" switch under Other, `?debug` boot) share the new behavior through the single `setDebugUI` function they already funnel through.

**Tech Stack:** TypeScript, Vite (single-file build), Playwright (`tests/e2e/boot.spec.ts`) for the pointer/timer-driven e2e assertions, Vitest is not applicable here (no pure-function unit under test).

## Global Constraints

- Repo convention: `TODO.md` already carries this request as an unchecked box (added and committed as `c804cd3`, 2026-09-11 section) — tick it and name the version when the work ships, per `AGENTS.md`'s "Release discipline" section.
- Do not touch `src/ui/tooltips.ts`, the `#env .info` selector, or `tests/harness/states.ts` — those are a separate, pre-existing, unrelated bug (`tooltip-open` parity state) that was flagged to the owner and is explicitly out of scope for this plan.
- Do not run the full `npm run verify` / full parity e2e gate for this change — it touches no rendering path (no canvas, no `src/astro`/`src/scene`/`src/render` file), so the 40-scenario screenshot-diff gate (~55 minutes) has nothing to catch here. Verify with `npm run check`, `npm run test`, `npm run build`, and `npx playwright test --project=boot` only.
- Keep the tap-to-toggle-the-About-dialog behavior (click → 340ms debounce → `#infoModal` open/close) working exactly as it does today; only the hold path changes.
- `TOUCH_DEV` (from `src/core/errorlog.ts`) is this codebase's existing signal for "mobile" — reuse it, do not invent a second one.

---

### Task 1: The plain 3-second hold gesture

**Files:**
- Modify: `src/ui/hud.ts:511-555` (the `{ ... }` block registering `#tInfo`'s pointer/click handlers)
- Modify: `src/galactic-transit.html:229` (the `#tInfo` button's stale `title` attribute)
- Test: `tests/e2e/boot.spec.ts` (new `describe('the hold gesture', ...)` block, placed after the existing `describe('the debug switch', ...)` block, before `describe('the panels dock', ...)`)

**Interfaces:**
- Consumes: `setDebugMode` and `isDebugMode` from `./debug` (already imported in `src/ui/hud.ts`), `flash` (already defined earlier in the same `hud.ts` closure, unchanged), `$` from `../core/dom` (already imported).
- Produces: no new exports. `#tInfo` gains/keeps these DOM-observable effects, which Task 2's tests and any future test may rely on: class `holding` present from pointerdown to release-or-fire; class `holdWarn` added at 1.5s into a held-down press; `#tDebug` checkbox `checked` flips and `#dbgPanel`/`#dbgPlus` visibility updates (per Task 2) the moment a hold reaches 3.0s.

- [ ] **Step 1: Write the failing e2e test for the new timing**

Add this new `describe` block to `tests/e2e/boot.spec.ts`, immediately after the closing `})` of `test.describe('the debug switch', ...)` (currently ending around line 400) and before `test.describe('the panels dock', ...)`:

```ts
test.describe('the hold gesture', () => {
  test('a 3-second hold on "?" enters debug mode and warns from halfway; a short press does not', async ({ page }) => {
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()

    const info = page.locator('#tInfo')
    const box = (await info.boundingBox())!
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2

    // A short press does not enter debug mode. (It also schedules the About dialog to open
    // 340ms after release — the next pointerdown below cancels that pending open, the same
    // way it always has, so it never actually appears.)
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.waitForTimeout(500)
    await page.mouse.up()
    await page.waitForTimeout(100)
    expect(await page.evaluate(() => (document.getElementById('tDebug') as HTMLInputElement).checked)).toBe(false)

    // Held past 1.5s: the button glows its warning.
    await page.mouse.down()
    await page.waitForTimeout(1700)
    expect(await info.evaluate((el) => el.classList.contains('holdWarn'))).toBe(true)

    // Held to 3s: debug mode is entered, and on this non-touch context the panel opens too.
    await page.waitForTimeout(1500)
    await page.mouse.up()
    expect(await page.evaluate(() => (document.getElementById('tDebug') as HTMLInputElement).checked)).toBe(true)
    expect(await info.evaluate((el) => el.classList.contains('holding'))).toBe(false)
    expect(await page.evaluate(() => (document.getElementById('dbgPanel') as HTMLElement).style.display)).toBe('')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test --project=boot -g "a 3-second hold"`
Expected: FAIL — under the current code the hold does nothing until a third tap (`taps < 2` returns early on `pointerdown`), so `#tDebug` never gets checked and `holdWarn` never appears within the waited time.

- [ ] **Step 3: Rewrite the gesture in `src/ui/hud.ts`**

Replace the entire block currently at `src/ui/hud.ts:511-555` (from the opening `{` right after the `u.searchParams.delete('debug')` reset-button handler's closing `});`, through the matching closing `}` right before the `// years per second` comment) with:

```ts
  {
    // One button, two meanings, told apart by patience. Tap it and the About dialog
    // toggles, debounced so a rapid flurry of taps settles to one open or close rather
    // than flickering. Press and HOLD it for three seconds and the debug door opens
    // instead: long enough that nobody finds it by accident, and it warns from halfway
    // through — glowing warning yellow — so you can let go if you did not mean it.
    const b = $('tInfo');
    let tapTimer: ReturnType<typeof setTimeout> | null = null;
    let holdT: ReturnType<typeof setTimeout> | null = null;
    let warnT: ReturnType<typeof setTimeout> | null = null;
    let fired = false;
    const endHold = (): void => {
      if(holdT !== null){ clearTimeout(holdT); holdT = null; }
      if(warnT !== null){ clearTimeout(warnT); warnT = null; }
      b.classList.remove('holding','holdWarn');
    };
    b.addEventListener('pointerdown', ()=>{
      fired = false;
      // Hold the pending dialog back. Let it open and it covers the button, the browser
      // fires pointerleave on a control it can no longer see, and the hold cancels itself
      // partway in — which is exactly how this failed the first time it was tried.
      if(tapTimer !== null){ clearTimeout(tapTimer); tapTimer = null; }
      b.classList.add('holding');
      warnT = setTimeout(()=> b.classList.add('holdWarn'), 1500);
      holdT = setTimeout(()=>{
        fired = true; endHold();
        if(tapTimer !== null){ clearTimeout(tapTimer); tapTimer = null; }
        flash('flash10');
        setDebugMode(!isDebugMode(), true);
      }, 3000);
    });
    for(const ev of ['pointerup','pointercancel','pointerleave']) b.addEventListener(ev, endHold);
    b.addEventListener('click', ()=>{
      if(fired){ fired = false; return; }     // the hold already spoke; the click is its echo
      if(tapTimer !== null) clearTimeout(tapTimer);
      tapTimer = setTimeout(()=>{
        const m = $('infoModal');
        m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
      }, 340);
    });
  }
```

This drops the `taps` counter entirely (nothing reads it any more — the old `if(taps < 2) return` gate is gone, so every `pointerdown` starts a hold), keeps `tapTimer`'s 340ms debounce on the click-toggles-the-dialog path unchanged, and re-times the two hold timeouts from `3000`/`5000` to `1500`/`3000`.

- [ ] **Step 4: Update the stale title text**

In `src/galactic-transit.html:229`, change:

```html
<button class="pdot act" id="tInfo" aria-label="about" title="about · tap 10× to toggle debug mode">?</button>
```

to:

```html
<button class="pdot act" id="tInfo" aria-label="about" title="about · hold 3s to toggle debug mode">?</button>
```

- [ ] **Step 5: Rebuild and run the test to verify it passes**

Run: `npm run build && npx playwright test --project=boot -g "a 3-second hold"`
Expected: PASS. (The e2e project serves the built `galactic-transit.html` from the repo root, not `src/`, so the build step is required before every `playwright test` run in this plan — same as the existing test suite already requires.)

- [ ] **Step 6: Run the full boot project to confirm nothing else broke**

Run: `npx playwright test --project=boot`
Expected: all tests pass, including the pre-existing `the debug switch` tests (they exercise the checkbox and `?debug` doors, not the hold, and run under the default non-touch context, so they are unaffected by this task).

- [ ] **Step 7: Commit**

```bash
git add src/ui/hud.ts src/galactic-transit.html galactic-transit.html tests/e2e/boot.spec.ts
git commit -m "astro-visuals: a plain 3-second hold opens the debug door"
```

(`galactic-transit.html` at the repo root is the Vite build output committed alongside `src/`, same as every prior release in this project's history — check `git status` first; if the build step already staged it, this is a no-op include.)

---

### Task 2: Button-only debug entry on touch devices

**Files:**
- Modify: `src/ui/debug.ts:109` (the one line in `setDebugUI` that unconditionally opens `dbgPanel`)
- Test: `tests/e2e/boot.spec.ts` (extend the existing `test.describe('the debug switch', ...)` block)

**Interfaces:**
- Consumes: `TOUCH_DEV` from `../core/errorlog` (already imported in `src/ui/debug.ts:4` — no new import needed), `setPanelOpen`/`setPanelsDebug` from `./panels` (already imported).
- Produces: no new exports. Behavior change only: on a touch context, `#dbgPanel` stays `display:none` and `#dbgPlus` (its reopen dot, from `src/ui/panels.ts`'s `PANELS` table) shows `display:block` the moment any entry door sets debug mode on with `entering=true`. Non-touch contexts keep opening `#dbgPanel` (`style.display === ''`) exactly as before — this is already covered by Task 1's Step 1 test, which runs under the default non-touch context.

- [ ] **Step 1: Write the failing e2e test for touch-device entry**

Add this test inside the existing `test.describe('the debug switch', ...)` block in `tests/e2e/boot.spec.ts`, after the `a ?debug boot arrives with the box already ticked` test and before that `describe`'s closing `})`:

```ts
  test('on a touch device, every door into debug mode leaves the panel closed, button only', async ({ page }) => {
    // navigator.maxTouchPoints > 1 is one half of this codebase's own TOUCH_DEV check
    // (src/core/errorlog.ts) — forcing it directly is more reliable across Chromium
    // versions than fighting `matchMedia('(pointer: coarse)')` emulation.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5, configurable: true })
    })

    // Door 1: the "debug mode" switch under Other.
    await page.goto('/galactic-transit.html', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    const tour = page.locator('#tourGo')
    if (await tour.isVisible().catch(() => false)) await tour.click()
    await page.evaluate(() => {
      const c = document.getElementById('tDebug') as HTMLInputElement
      c.checked = true; c.dispatchEvent(new Event('change'))
    })
    expect(await page.evaluate(() => (document.getElementById('dbgPanel') as HTMLElement).style.display)).toBe('none')
    expect(await page.evaluate(() => (document.getElementById('dbgPlus') as HTMLElement).style.display)).toBe('block')

    // Door 2: a ?debug boot.
    await page.goto('/galactic-transit.html?debug', { waitUntil: 'load' })
    await page.waitForFunction(() => !!document.getElementById('gl'))
    expect(await page.evaluate(() => (document.getElementById('dbgPanel') as HTMLElement).style.display)).toBe('none')
    expect(await page.evaluate(() => (document.getElementById('dbgPlus') as HTMLElement).style.display)).toBe('block')
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test --project=boot -g "every door into debug mode"`
Expected: FAIL — under the current code, `setPanelOpen('dbgPanel', true)` runs unconditionally on entry, so `#dbgPanel` ends up `style.display === ''` (open) and the first `expect(...).toBe('none')` fails.

- [ ] **Step 3: Gate the panel-open line in `src/ui/debug.ts`**

Change line 109:

```ts
  if(on && entering) setPanelOpen('dbgPanel', true);
```

to:

```ts
  // Touch devices get the button, not the dialog: dbgPlus (its reopen dot) already shows
  // the instant setPanelsDebug(on) makes the panel available, so nothing here is silently
  // hidden — the panel is one tap away, not fully hidden.
  if(on && entering && !TOUCH_DEV) setPanelOpen('dbgPanel', true);
```

- [ ] **Step 4: Rebuild and run the test to verify it passes**

Run: `npm run build && npx playwright test --project=boot -g "every door into debug mode"`
Expected: PASS.

- [ ] **Step 5: Run the full boot project one more time**

Run: `npx playwright test --project=boot`
Expected: all tests pass, including Task 1's hold-gesture test (non-touch, so still opens the panel) and the pre-existing `the checkbox flips the mode both ways` / `a ?debug boot arrives` tests (also non-touch, unaffected).

- [ ] **Step 6: Commit**

```bash
git add src/ui/debug.ts galactic-transit.html tests/e2e/boot.spec.ts
git commit -m "astro-visuals: debug mode opens as a button only on touch, every door"
```

---

### Task 3: Ship it

**Files:**
- Modify: `src/core/build.ts:12` (`BUILD.version`)
- Modify: `sw.js:3` (the cache-name version, `const V = 'galactic-transit-3.11.0'`)
- Modify: `TODO.md` (tick the box added in commit `c804cd3`)
- Modify: `CHANGELOG.md` (regenerated, as its own commit, after the release commit)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by other tasks — this is the terminal task.

- [ ] **Step 1: Bump the version in `src/core/build.ts`**

Change line 12 from:

```ts
export const BUILD = { version: '3.11.0', date: '__BUILD_DATE__', time: '__BUILD_TIME__', sha: '__BUILD_SHA__' };
```

to:

```ts
export const BUILD = { version: '3.12.0', date: '__BUILD_DATE__', time: '__BUILD_TIME__', sha: '__BUILD_SHA__' };
```

(A minor bump on top of `3.11.0` — the last version named in `TODO.md`'s 2026-09-10 entries — matching this project's own precedent of one minor version per shipped feature set, not a breaking change.)

- [ ] **Step 2: Update the matching cache name in `sw.js`**

Change line 3 from:

```js
const V = 'galactic-transit-3.11.0';  // the app version: a new name retires the old cache
```

to:

```js
const V = 'galactic-transit-3.12.0';  // the app version: a new name retires the old cache
```

`scripts/check-build.mjs` (already run by `npm run build`) asserts `pageVersion === swVersion` by reading both files directly — so a mismatch here fails the build, not just a manual review. Additionally, per `AGENTS.md`'s release discipline, parse both files before committing: `node -e "new Function(require('fs').readFileSync('astro-visuals/sw.js','utf8'))"` run from the monorepo root (`/home/markusg/Private/claude-experiments`), and `node -e "new Function(require('fs').readFileSync('astro-visuals/galactic-transit.html','utf8'))"` — both must exit 0 with no output.

- [ ] **Step 3: Tick the TODO box**

In `TODO.md`, change the 2026-09-11 entry's `- [ ]` to `- [x]` and append the shipped version, matching the style of every other ticked entry in the file (e.g. `— v3.12.0.`).

- [ ] **Step 4: Rebuild, run the full boot project, and the fast parity subset**

Run: `npm run check && npm run test && npm run build && npx playwright test --project=boot && PARITY_SCOPE=fast npx playwright test --project=parity`
Expected: all pass. (Still not the full 40-scenario parity gate — nothing in this change touches a rendering path, and `AGENTS.md`'s own guidance is that the fast subset is for exactly this: keeping a small change moving without paying for the full gate. The full gate should still run at the next real phase boundary or merge, per that same guidance, but is not this plan's job to trigger.)

- [ ] **Step 5: Commit the release**

```bash
git add TODO.md src/core/build.ts sw.js galactic-transit.html
git commit -m "astro-visuals: v3.12.0 — a plain 3s hold for debug mode, button-only on touch"
```

- [ ] **Step 6: Regenerate the changelog as its own commit**

Run: `python3 ../.github/scripts/build_changelog.py` (per `AGENTS.md`), then:

```bash
git add CHANGELOG.md
git commit -m "astro-visuals: regenerate CHANGELOG.md for v3.12.0"
```
