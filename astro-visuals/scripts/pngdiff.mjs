// How different are two frames, and how? "Not identical" is not a diagnosis: a different
// galaxy and a rasteriser that rounds one subpixel differently both fail a hash check, and
// they call for opposite responses.
//
//   node scripts/pngdiff.mjs a.png b.png [out.png]

import { PNG } from 'pngjs'
import { readFileSync, writeFileSync } from 'node:fs'

const a = PNG.sync.read(readFileSync(process.argv[2]))
const b = PNG.sync.read(readFileSync(process.argv[3]))
const out = process.argv[4]

if (a.width !== b.width || a.height !== b.height) {
  console.log('size differs', a.width, a.height, 'vs', b.width, b.height)
  process.exit(1)
}

const total = a.width * a.height
let differing = 0
let maxDelta = 0
let sumDelta = 0
const hist = new Map() // delta magnitude -> count
const vis = new PNG({ width: a.width, height: a.height })

for (let i = 0; i < total; i++) {
  const j = i * 4
  const dr = Math.abs(a.data[j] - b.data[j])
  const dg = Math.abs(a.data[j + 1] - b.data[j + 1])
  const db = Math.abs(a.data[j + 2] - b.data[j + 2])
  const d = Math.max(dr, dg, db)
  if (d > 0) {
    differing++
    sumDelta += d
    if (d > maxDelta) maxDelta = d
    const bucket = d === 1 ? '1' : d <= 2 ? '2' : d <= 4 ? '3-4' : d <= 8 ? '5-8' : d <= 32 ? '9-32' : d <= 128 ? '33-128' : '>128'
    hist.set(bucket, (hist.get(bucket) ?? 0) + 1)
  }
  // red where they differ, the original dimmed elsewhere
  vis.data[j] = d > 0 ? 255 : a.data[j] >> 2
  vis.data[j + 1] = d > 0 ? 0 : a.data[j + 1] >> 2
  vis.data[j + 2] = d > 0 ? 0 : a.data[j + 2] >> 2
  vis.data[j + 3] = 255
}

console.log(`differing: ${differing}/${total} (${((differing / total) * 100).toFixed(3)}%)`)
if (differing) {
  console.log(`max channel delta: ${maxDelta}, mean over differing: ${(sumDelta / differing).toFixed(2)}`)
  console.log('delta histogram:', Object.fromEntries([...hist].sort()))
}
if (out) { writeFileSync(out, PNG.sync.write(vis)); console.log('wrote', out) }
