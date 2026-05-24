// Dependency-free exporters + painters shared by the engines and build.js.
// - Painters (CanvasPainter for browser, BufferPainter for Node) implement the
//   interface that slothy-model.paintApron() draws through.
// - PNG encoder (zlib "stored" deflate) and a store-only ZIP writer let Node and
//   the browser emit identical assets.
// - Serializers: STL (plain + Materialise-colored), 3MF (colored), OBJ+MTL.

import { paintApron } from './slothy-model.js';

// ===========================================================================
// CRC32 / Adler32
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes, crc = 0xffffffff) {
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return crc >>> 0;
}
function adler32(bytes) {
  let a = 1, b = 0;
  for (let i = 0; i < bytes.length; i++) { a = (a + bytes[i]) % 65521; b = (b + a) % 65521; }
  return ((b << 16) | a) >>> 0;
}

// ===========================================================================
// zlib stored deflate + PNG encoder (RGBA8)
function deflateStore(data) {
  const blocks = [];
  let pos = 0;
  while (pos < data.length || data.length === 0) {
    const len = Math.min(65535, data.length - pos);
    const final = pos + len >= data.length ? 1 : 0;
    const header = new Uint8Array(5);
    header[0] = final;
    header[1] = len & 0xff; header[2] = (len >>> 8) & 0xff;
    header[3] = ~len & 0xff; header[4] = (~len >>> 8) & 0xff;
    blocks.push(header, data.subarray(pos, pos + len));
    pos += len;
    if (data.length === 0) break;
  }
  const adler = adler32(data);
  const head = new Uint8Array([0x78, 0x01]);
  const tail = new Uint8Array([(adler >>> 24) & 0xff, (adler >>> 16) & 0xff, (adler >>> 8) & 0xff, adler & 0xff]);
  return concatBytes([head, ...blocks, tail]);
}

function concatBytes(arrays) {
  let total = 0;
  for (const a of arrays) total += a.length;
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrays) { out.set(a, o); o += a.length; }
  return out;
}

export function encodePNG(rgba, width, height) {
  // filtered scanlines (filter byte 0 per row)
  const raw = new Uint8Array((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);
  }
  const idatData = deflateStore(raw);
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const chunk = (type, data) => {
    const len = data.length;
    const out = new Uint8Array(12 + len);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, len);
    out[4] = type.charCodeAt(0); out[5] = type.charCodeAt(1);
    out[6] = type.charCodeAt(2); out[7] = type.charCodeAt(3);
    out.set(data, 8);
    dv.setUint32(8 + len, crc32(out.subarray(4, 8 + len)));
    return out;
  };
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width); dv.setUint32(4, height);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  return concatBytes([sig, chunk('IHDR', ihdr), chunk('IDAT', idatData), chunk('IEND', new Uint8Array(0))]);
}

// ===========================================================================
// store-only ZIP
export function makeZip(files) {
  // files: [{ name, data: Uint8Array }]
  const enc = new TextEncoder();
  const locals = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;
    const local = new Uint8Array(30 + nameBytes.length + size);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);       // version
    dv.setUint16(6, 0, true);        // flags
    dv.setUint16(8, 0, true);        // method store
    dv.setUint16(10, 0, true); dv.setUint16(12, 0, true); // time/date
    dv.setUint32(14, crc, true);
    dv.setUint32(18, size, true);
    dv.setUint32(22, size, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    local.set(f.data, 30 + nameBytes.length);
    locals.push(local);

    const cen = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true); cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true); cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true); cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    cen.set(nameBytes, 46);
    central.push(cen);
    offset += local.length;
  }
  const centralBytes = concatBytes(central);
  const localBytes = concatBytes(locals);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralBytes.length, true);
  ev.setUint32(16, localBytes.length, true);
  return concatBytes([localBytes, centralBytes, eocd]);
}

// ===========================================================================
// 5x7 stencil font (only the glyphs the apron needs; undefined -> blank)
const FONT = {
  'S': [14, 17, 16, 14, 1, 17, 14], 'L': [16, 16, 16, 16, 16, 16, 31],
  'O': [14, 17, 17, 17, 17, 17, 14], 'T': [31, 4, 4, 4, 4, 4, 4],
  'H': [17, 17, 17, 31, 17, 17, 17], 'Y': [17, 17, 10, 4, 4, 4, 4],
  'E': [31, 16, 16, 30, 16, 16, 31], 'U': [17, 17, 17, 17, 17, 17, 14],
  'G': [14, 17, 16, 23, 17, 17, 15], "'": [4, 4, 4, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 6, 6], ' ': [0, 0, 0, 0, 0, 0, 0],
};

// ===========================================================================
// Painters
export class CanvasPainter {
  constructor(ctx, width, height) {
    this.ctx = ctx; this.width = width; this.height = height;
  }
  _c(rgb) { return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`; }
  bg(rgb) { this.ctx.fillStyle = this._c(rgb); this.ctx.fillRect(0, 0, this.width, this.height); }
  rect(x, y, w, h, rgb) { this.ctx.fillStyle = this._c(rgb); this.ctx.fillRect(x, y, w, h); }
  circle(cx, cy, r, rgb) { this.ellipse(cx, cy, r, r, rgb); }
  ellipse(cx, cy, rx, ry, rgb) {
    const c = this.ctx;
    c.fillStyle = this._c(rgb); c.beginPath();
    c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();
  }
  line(x0, y0, x1, y1, w, rgb) {
    const c = this.ctx;
    c.strokeStyle = this._c(rgb); c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  text(str, cx, y, size, rgb) {
    const c = this.ctx;
    c.fillStyle = this._c(rgb);
    c.font = `bold ${Math.round(size)}px Georgia, 'Times New Roman', serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(str, cx, y);
  }
}

export class BufferPainter {
  constructor(width, height) {
    this.width = width; this.height = height;
    this.px = new Uint8Array(width * height * 4);
  }
  _set(x, y, rgb) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const o = (y * this.width + x) * 4;
    this.px[o] = rgb[0]; this.px[o + 1] = rgb[1]; this.px[o + 2] = rgb[2]; this.px[o + 3] = 255;
  }
  bg(rgb) { for (let i = 0; i < this.width * this.height; i++) { const o = i * 4; this.px[o] = rgb[0]; this.px[o + 1] = rgb[1]; this.px[o + 2] = rgb[2]; this.px[o + 3] = 255; } }
  rect(x, y, w, h, rgb) {
    for (let yy = Math.floor(y); yy < y + h; yy++)
      for (let xx = Math.floor(x); xx < x + w; xx++) this._set(xx, yy, rgb);
  }
  circle(cx, cy, r, rgb) { this.ellipse(cx, cy, r, r, rgb); }
  ellipse(cx, cy, rx, ry, rgb) {
    for (let yy = Math.floor(cy - ry); yy <= cy + ry; yy++)
      for (let xx = Math.floor(cx - rx); xx <= cx + rx; xx++) {
        const dx = (xx - cx) / (rx || 1), dy = (yy - cy) / (ry || 1);
        if (dx * dx + dy * dy <= 1) this._set(xx, yy, rgb);
      }
  }
  line(x0, y0, x1, y1, w, rgb) {
    const minx = Math.floor(Math.min(x0, x1) - w), maxx = Math.ceil(Math.max(x0, x1) + w);
    const miny = Math.floor(Math.min(y0, y1) - w), maxy = Math.ceil(Math.max(y0, y1) + w);
    const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy || 1;
    const hw = w / 2;
    for (let yy = miny; yy <= maxy; yy++)
      for (let xx = minx; xx <= maxx; xx++) {
        let t = ((xx - x0) * dx + (yy - y0) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        const px = x0 + t * dx, py = y0 + t * dy;
        if ((xx - px) ** 2 + (yy - py) ** 2 <= hw * hw) this._set(xx, yy, rgb);
      }
  }
  text(str, cx, y, size, rgb) {
    const scale = Math.max(1, size / 7);
    const gw = 5 * scale, gap = scale;
    const total = str.length * gw + (str.length - 1) * gap;
    let x = cx - total / 2;
    const top = y - (7 * scale) / 2;
    for (const ch of str.toUpperCase()) {
      const glyph = FONT[ch] || FONT[' '];
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 5; c++)
          if (glyph[r] & (1 << (4 - c)))
            this.rect(x + c * scale, top + r * scale, scale, scale, rgb);
      x += gw + gap;
    }
  }
}

// ===========================================================================
export function bakeApronPNG(size = 512) {
  const p = new BufferPainter(size, size);
  paintApron(p);
  return encodePNG(p.px, size, size);
}

// ===========================================================================
// flatten exportable parts into print space (Z-up, millimetres, on the bed)
const TARGET_MM = 110;
export function flattenForExport(parts) {
  const verts = []; // [x,y,z] world (Y-up)
  const cols = [];  // [r,g,b] 0..1
  const uvs = [];
  const tris = [];  // {a,b,c,textured}
  for (const part of parts) {
    if (part.exportable === false) continue;
    const base = verts.length;
    const vc = part.positions.length / 3;
    for (let i = 0; i < vc; i++) {
      verts.push([part.positions[i * 3], part.positions[i * 3 + 1], part.positions[i * 3 + 2]]);
      cols.push([part.colors[i * 3], part.colors[i * 3 + 1], part.colors[i * 3 + 2]]);
      uvs.push([part.uvs[i * 2], part.uvs[i * 2 + 1]]);
    }
    for (let t = 0; t < part.indices.length; t += 3)
      tris.push({ a: base + part.indices[t], b: base + part.indices[t + 1], c: base + part.indices[t + 2], textured: part.texMix > 0.5 });
  }
  // bounds in Y-up
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const v of verts) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], v[k]); mx[k] = Math.max(mx[k], v[k]); }
  const dim = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
  const scale = TARGET_MM / Math.max(dim[0], dim[1], dim[2]);
  const cxm = (mn[0] + mx[0]) / 2, czm = (mn[2] + mx[2]) / 2;
  // Y-up -> Z-up: (x,y,z) -> (x, z, y); reverse winding to keep outward normals
  const pverts = verts.map(v => [(v[0] - cxm) * scale, (v[2] - czm) * scale, (v[1] - mn[1]) * scale]);
  const ptris = tris.map(t => ({ a: t.a, b: t.c, c: t.b, textured: t.textured }));
  return { verts: pverts, cols, uvs, tris: ptris };
}

function triColor255(d, t) {
  const a = d.cols[t.a], b = d.cols[t.b], c = d.cols[t.c];
  return [
    Math.round((a[0] + b[0] + c[0]) / 3 * 255),
    Math.round((a[1] + b[1] + c[1]) / 3 * 255),
    Math.round((a[2] + b[2] + c[2]) / 3 * 255),
  ];
}
function facetNormal(d, t) {
  const A = d.verts[t.a], B = d.verts[t.b], C = d.verts[t.c];
  const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2];
  const vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

// ---- STL -------------------------------------------------------------------
export function exportSTLBinary(parts, { colored = false } = {}) {
  const d = flattenForExport(parts);
  const n = d.tris.length;
  const buf = new Uint8Array(84 + n * 50);
  const dv = new DataView(buf.buffer);
  dv.setUint32(80, n, true);
  let o = 84;
  for (const t of d.tris) {
    const nrm = facetNormal(d, t);
    dv.setFloat32(o, nrm[0], true); dv.setFloat32(o + 4, nrm[1], true); dv.setFloat32(o + 8, nrm[2], true);
    o += 12;
    for (const vi of [t.a, t.b, t.c]) {
      const v = d.verts[vi];
      dv.setFloat32(o, v[0], true); dv.setFloat32(o + 4, v[1], true); dv.setFloat32(o + 8, v[2], true);
      o += 12;
    }
    let attr = 0;
    if (colored) {
      const c = triColor255(d, t);
      attr = 0x8000 | ((c[0] >> 3) << 10) | ((c[1] >> 3) << 5) | (c[2] >> 3);
    }
    dv.setUint16(o, attr, true); o += 2;
  }
  // signature header so colored STLs are recognized by Materialise-aware tools
  const sig = new TextEncoder().encode(colored ? 'COLOR= Slothy-Hutty colored STL' : 'Slothy-Hutty STL');
  buf.set(sig.subarray(0, 80), 0);
  return buf;
}

// ---- 3MF -------------------------------------------------------------------
export function export3MF(parts) {
  const d = flattenForExport(parts);
  // quantize tri colors -> base material palette
  const palette = []; const key2idx = new Map();
  const triMat = d.tris.map(t => {
    const c = triColor255(d, t);
    const key = (c[0] >> 3) + ',' + (c[1] >> 3) + ',' + (c[2] >> 3);
    if (!key2idx.has(key)) { key2idx.set(key, palette.length); palette.push(c); }
    return key2idx.get(key);
  });
  const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('') + 'FF';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n';
  xml += ' <resources>\n  <basematerials id="1">\n';
  for (const c of palette) xml += `   <base name="c" displaycolor="${hex(c)}"/>\n`;
  xml += '  </basematerials>\n';
  xml += '  <object id="2" type="model" pid="1" pindex="0">\n   <mesh>\n    <vertices>\n';
  for (const v of d.verts) xml += `     <vertex x="${v[0].toFixed(4)}" y="${v[1].toFixed(4)}" z="${v[2].toFixed(4)}"/>\n`;
  xml += '    </vertices>\n    <triangles>\n';
  d.tris.forEach((t, i) => {
    xml += `     <triangle v1="${t.a}" v2="${t.b}" v3="${t.c}" pid="1" p1="${triMat[i]}"/>\n`;
  });
  xml += '    </triangles>\n   </mesh>\n  </object>\n </resources>\n';
  xml += ' <build><item objectid="2"/></build>\n</model>\n';

  const enc = new TextEncoder();
  const contentTypes = '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n</Types>\n';
  const rels = '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n';
  return makeZip([
    { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
    { name: '_rels/.rels', data: enc.encode(rels) },
    { name: '3D/3dmodel.model', data: enc.encode(xml) },
  ]);
}

// ---- OBJ + MTL -------------------------------------------------------------
export function exportOBJ(parts, { pngName = 'slothy-hutty.png' } = {}) {
  const d = flattenForExport(parts);
  // build flat-color materials from quantized tri colors + one textured material
  const palette = []; const key2idx = new Map();
  const matOf = d.tris.map(t => {
    if (t.textured) return 'apron';
    const c = triColor255(d, t);
    const key = (c[0] >> 4) + '_' + (c[1] >> 4) + '_' + (c[2] >> 4);
    if (!key2idx.has(key)) { key2idx.set(key, palette.length); palette.push({ name: 'm' + palette.length, c }); }
    return palette[key2idx.get(key)].name;
  });
  let mtl = '# Slothy-Hutty materials\n';
  for (const m of palette) mtl += `newmtl ${m.name}\nKd ${(m.c[0] / 255).toFixed(4)} ${(m.c[1] / 255).toFixed(4)} ${(m.c[2] / 255).toFixed(4)}\n`;
  mtl += `newmtl apron\nKd 1 1 1\nmap_Kd ${pngName}\n`;

  let obj = '# Slothy-Hutty\nmtllib slothy-hutty.mtl\n';
  for (const v of d.verts) obj += `v ${v[0].toFixed(4)} ${v[1].toFixed(4)} ${v[2].toFixed(4)}\n`;
  for (const t of d.uvs) obj += `vt ${t[0].toFixed(4)} ${(1 - t[1]).toFixed(4)}\n`;
  // group faces by material to minimize usemtl switches
  const byMat = new Map();
  d.tris.forEach((t, i) => {
    const m = matOf[i];
    if (!byMat.has(m)) byMat.set(m, []);
    byMat.get(m).push(t);
  });
  for (const [m, ts] of byMat) {
    obj += `usemtl ${m}\n`;
    for (const t of ts) {
      const f = (vi) => `${vi + 1}/${vi + 1}`;
      obj += `f ${f(t.a)} ${f(t.b)} ${f(t.c)}\n`;
    }
  }
  return { obj, mtl, png: bakeApronPNG(512), pngName };
}
