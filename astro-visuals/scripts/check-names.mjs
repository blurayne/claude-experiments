// Find identifiers main.ts uses but no longer has.
//
// main.ts carries `@ts-nocheck` while the migration runs — 4,000 lines of untyped code cannot
// be typed in one step, and the directive shrinks with every extraction. But it also silences
// TS2304, "Cannot find name", which is the single most likely mistake when moving code out:
// take a helper and leave a caller behind, and nothing complains until the page hits that
// line at runtime. `moonW is not defined` cost a twelve-minute gate run to find, and only
// because one parity state happens to draw the Moon.
//
// So: type-check main.ts with the directive stripped and report ONLY the missing names.
// Everything else tsc says about that file is noise until it is typed for real.

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, rmSync, cpSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scratch = mkdtempSync(join(tmpdir(), 'gt-names-'))

try {
  cpSync(join(ROOT, 'src'), join(scratch, 'src'), { recursive: true })
  const main = join(scratch, 'src/main.ts')
  // Every occurrence, not just the directive: TypeScript honours `@ts-nocheck` anywhere in a
  // leading comment, so a line of PROSE beginning with it keeps the file unchecked. That is
  // exactly what happened the first time this script ran and cheerfully reported nothing.
  writeFileSync(main, readFileSync(main, 'utf8').replace(/@ts-nocheck/g, 'ts-nocheck-disabled'))
  writeFileSync(
    join(scratch, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        types: [],
        noEmit: true,
        allowJs: true,
        checkJs: false,
        skipLibCheck: true,
        // Everything off except the one thing we are asking about.
        strict: false,
        noImplicitAny: false,
      },
      include: ['src'],
    }),
  )

  let output = ''
  try {
    // tsc reports on stdout and exits non-zero, so the errors arrive through the throw.
    // stdio must be piped explicitly or execFileSync inherits and e.stdout comes back null.
    output = execFileSync(join(ROOT, 'node_modules/.bin/tsc'), ['-p', scratch, '--noEmit'], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (e) {
    output = String(e.stdout ?? '') + String(e.stderr ?? '')
  }
  if (!output.trim() && process.env.CHECK_NAMES_DEBUG) console.error('(tsc said nothing)')

  // TS2304: Cannot find name 'x'.   TS2552: Cannot find name 'x'. Did you mean 'y'?
  const missing = [...output.matchAll(/error TS(?:2304|2552): Cannot find name '([^']+)'/g)].map((m) => m[1])
  const unique = [...new Set(missing)].sort()

  // `?debug` publishes these on globalThis, and a handful of browser globals the minimal lib
  // does not carry. Anything genuinely missing is a symbol that moved out without its callers.
  const KNOWN = new Set(['__gt'])
  const real = unique.filter((n) => !KNOWN.has(n))

  if (real.length) {
    console.error(`check-names: ${real.length} identifier(s) used but not declared or imported:`)
    for (const n of real) console.error('  ✘ ' + n)
    process.exit(1)
  }
  console.log(`check-names: every identifier resolves (${unique.length} known globals allowed)`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
