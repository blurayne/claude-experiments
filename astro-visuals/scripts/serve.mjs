// A static file server, because the page fetches `stars-gaia.bin`, the maps and the audio,
// and `file://` refuses all of it. Deliberately tiny and dependency-free: this only ever
// serves a directory of this repository to a browser running on the same machine.
//
//   node scripts/serve.mjs <dir> <port>

import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { join, resolve, extname, sep } from 'node:path'

const dir = resolve(process.argv[2] ?? '.')
const port = Number(process.argv[3] ?? 4321)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.bin': 'application/octet-stream',
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  // join() collapses any `..`; the prefix check then catches an attempt to climb out
  const path = join(dir, decodeURIComponent(url.pathname))
  if (path !== dir && !path.startsWith(dir + sep)) {
    res.writeHead(403).end('no')
    return
  }
  try {
    const st = statSync(path)
    const file = st.isDirectory() ? join(path, 'index.html') : path
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
      // Never let a stale build be photographed by the parity gate.
      'cache-control': 'no-store',
    })
    createReadStream(file).pipe(res)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(port, () => console.log(`serving ${dir} on http://localhost:${port}`))
