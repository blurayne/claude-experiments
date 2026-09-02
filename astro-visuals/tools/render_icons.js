#!/usr/bin/env node
// Rasterise icon.svg to the PNG icons the page and the manifest reference.
//
//   node tools/render_icons.js [outDir]
//
// Chromium does the rendering, so the Orbitron face embedded in the SVG is used
// exactly as a browser would use it and the output matches what the <link rel=icon>
// SVG shows. Run it whenever icon.svg changes — the PNGs are derived files and must
// never be edited by hand.
//
// Needs playwright-core and a Chromium binary; point CHROMIUM at one if it is not in
// the usual places (the sandbox ships /opt/pw-browsers/chromium-*/chrome-linux/chrome).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const SRC = path.join(__dirname, '..', 'icon.svg');
const OUT = process.argv[2] || path.join(__dirname, '..');

// The transparent icons are the whole 512-unit artboard, straight.
const PLAIN = [['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['icon-180.png', 180],
               ['icon-192.png', 192], ['icon-512.png', 512]];
// The maskable one is opaque and inset, so Android's mask cannot crop the emblem:
// 388 of 512 leaves the artwork inside the safe circle whatever shape is applied.
const MASK = { file: 'icon-maskable-512.png', size: 512, inner: 388, bg: '#1c273b' };

function chromiumPath() {
  if (process.env.CHROMIUM) return process.env.CHROMIUM;
  const globs = ['/opt/pw-browsers', process.env.PLAYWRIGHT_BROWSERS_PATH].filter(Boolean);
  for (const dir of globs) {
    if (!fs.existsSync(dir)) continue;
    for (const d of fs.readdirSync(dir).filter(d => d.startsWith('chromium-')).sort().reverse()) {
      const p = path.join(dir, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined;  // let playwright find its own
}

(async () => {
  const svg = 'data:image/svg+xml;base64,' + fs.readFileSync(SRC).toString('base64');
  const browser = await chromium.launch({ executablePath: chromiumPath(), args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
  const settle = async () => {
    await page.waitForFunction(() => { const i = document.images[0]; return i && i.complete && i.naturalWidth > 0; });
    await page.waitForTimeout(150);
  };

  for (const [file, n] of PLAIN) {
    await page.setContent(`<style>html,body{margin:0;background:transparent}
      img{display:block;width:${n}px;height:${n}px}</style><img src="${svg}">`);
    await settle();
    await page.locator('img').screenshot({ path: path.join(OUT, file), omitBackground: true });
    console.log('wrote', file);
  }

  await page.setContent(`<style>html,body{margin:0}
    .m{width:${MASK.size}px;height:${MASK.size}px;background:${MASK.bg};
       display:flex;align-items:center;justify-content:center}
    img{display:block;width:${MASK.inner}px;height:${MASK.inner}px}</style>
    <div class="m"><img src="${svg}"></div>`);
  await settle();
  await page.locator('.m').screenshot({ path: path.join(OUT, MASK.file) });
  console.log('wrote', MASK.file);

  await browser.close();
})();
