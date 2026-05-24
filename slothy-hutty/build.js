// Regenerates the committed 3D-print artifacts from the procedural model.
// Single source of truth: imports the same modules the browser engines use.
//   node build.js
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCharacter } from './slothy-model.js';
import {
  exportSTLBinary, export3MF, exportOBJ, bakeApronPNG,
} from './slothy-export.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = (name) => join(here, name);

// Closed/smug pose is the canonical printable pose.
const { parts } = buildCharacter({ face: 'closed' });

const stl = exportSTLBinary(parts, { colored: false });
const stlColor = exportSTLBinary(parts, { colored: true });
const mf = export3MF(parts);
const { obj, mtl, png } = exportOBJ(parts);
const apronPng = bakeApronPNG(512);

writeFileSync(out('slothy-hutty.stl'), stl);
writeFileSync(out('slothy-hutty-color.stl'), stlColor);
writeFileSync(out('slothy-hutty.3mf'), mf);
writeFileSync(out('slothy-hutty.obj'), obj);
writeFileSync(out('slothy-hutty.mtl'), mtl);
writeFileSync(out('slothy-hutty.png'), png);
// the OBJ texture and standalone apron texture are identical art
if (png.length !== apronPng.length) writeFileSync(out('slothy-hutty.png'), apronPng);

// sanity / summary
const triCount = (stl.length - 84) / 50;
const totalTris = parts.filter(p => p.exportable !== false)
  .reduce((s, p) => s + p.indices.length / 3, 0);
console.log('Slothy-Hutty artifacts written:');
console.log(`  slothy-hutty.stl        ${stl.length} bytes, ${triCount} triangles`);
console.log(`  slothy-hutty-color.stl  ${stlColor.length} bytes`);
console.log(`  slothy-hutty.3mf        ${mf.length} bytes`);
console.log(`  slothy-hutty.obj/.mtl   ${obj.length}/${mtl.length} bytes`);
console.log(`  slothy-hutty.png        ${png.length} bytes`);
if (triCount !== totalTris) {
  console.error(`! triangle mismatch: STL ${triCount} vs parts ${totalTris}`);
  process.exit(1);
}
if (png[0] !== 137 || png[1] !== 80) { console.error('! bad PNG header'); process.exit(1); }
if (mf[0] !== 0x50 || mf[1] !== 0x4b) { console.error('! bad ZIP/3MF header'); process.exit(1); }
console.log('OK');
