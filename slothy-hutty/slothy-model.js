// Procedural geometry for "Slothy" — a Jabba/slug-like sloth creature.
// Pure data, no DOM. Returns grouped mesh "parts"; each part:
//   { name, region, texMix, blend, exportable, positions[], normals[], uvs[], colors[], indices[] }
// Colors are per-vertex RGB in 0..1. Coordinate frame: +Y up, +Z toward the
// viewer (the face), body tapers along -Z to the tail, ground at y=0.
//
// Also exposes paintApron(painter) which draws the apron art using a small
// painter interface (implemented for both <canvas> and a Node pixel buffer in
// slothy-export.js), so the live texture and the baked OBJ texture match.

export const FACE_STATES = ['closed', 'drool', 'laugh'];
export const FACE_LABELS = { closed: 'Smug', drool: 'Sleepy', laugh: 'Laughing' };

// ----------------------------------------------------------------------------
// small math + noise helpers
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

function hash3(i, j, k) {
  let n = (i * 374761393 + j * 668265263 + k * 1274126177) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const lerp = (a, b, t) => a + (b - a) * t;
  const c000 = hash3(xi, yi, zi), c100 = hash3(xi + 1, yi, zi);
  const c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1);
  const c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
  return lerp(
    lerp(lerp(c000, c100, u), lerp(c010, c110, u), v),
    lerp(lerp(c001, c101, u), lerp(c011, c111, u), v),
    w
  );
}

// ----------------------------------------------------------------------------
// part building helpers
function emptyPart(name, region, opts = {}) {
  return {
    name, region,
    texMix: opts.texMix || 0,
    blend: !!opts.blend,
    exportable: opts.exportable !== false,
    unlit: !!opts.unlit,
    positions: [], normals: [], uvs: [], colors: [], indices: [],
  };
}

function recomputeNormals(part) {
  const p = part.positions, idx = part.indices;
  const n = new Array(p.length).fill(0);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const o of [a, b, c]) { n[o] += nx; n[o + 1] += ny; n[o + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  part.normals = n;
}

// Build a grid surface from rings (array of rings, each ring = array of [x,y,z]
// of equal length M). Optionally close as a tube with cap apexes.
function addRings(part, rings, M, opts = {}) {
  const base = part.positions.length / 3;
  const colorFn = opts.colorFn;
  const closed = opts.closed !== false; // wrap around M
  const ringCount = rings.length;
  for (let i = 0; i < ringCount; i++) {
    for (let j = 0; j < M; j++) {
      const pnt = rings[i][j];
      part.positions.push(pnt[0], pnt[1], pnt[2]);
      part.uvs.push(j / M, i / (ringCount - 1));
      const c = colorFn ? colorFn(pnt, i / (ringCount - 1)) : (opts.color || [1, 1, 1]);
      part.colors.push(c[0], c[1], c[2]);
    }
  }
  const wrap = closed ? M : M - 1;
  for (let i = 0; i < ringCount - 1; i++) {
    for (let j = 0; j < wrap; j++) {
      const a = base + i * M + j;
      const b = base + i * M + ((j + 1) % M);
      const c = base + (i + 1) * M + j;
      const d = base + (i + 1) * M + ((j + 1) % M);
      part.indices.push(a, c, b, b, c, d);
    }
  }
  return base;
}

function addEllipsoid(part, cx, cy, cz, rx, ry, rz, segU, segV, color, opts = {}) {
  const base = part.positions.length / 3;
  const sx = opts.sx || 0, sy = opts.sy || 0, sz = opts.sz || 0; // shear unused
  for (let i = 0; i <= segV; i++) {
    const phi = (i / segV) * Math.PI; // 0..PI lat
    for (let j = 0; j <= segU; j++) {
      const th = (j / segU) * Math.PI * 2;
      let x = rx * Math.sin(phi) * Math.cos(th);
      let y = ry * Math.cos(phi);
      let z = rz * Math.sin(phi) * Math.sin(th);
      // optional vertical squash factor for lower hemisphere
      if (opts.flatBottom && y < 0) y *= opts.flatBottom;
      part.positions.push(cx + x, cy + y, cz + z);
      part.uvs.push(j / segU, i / segV);
      const c = typeof color === 'function'
        ? color([cx + x, cy + y, cz + z], [x, y, z]) : color;
      part.colors.push(c[0], c[1], c[2]);
    }
  }
  const W = segU + 1;
  for (let i = 0; i < segV; i++) {
    for (let j = 0; j < segU; j++) {
      const a = base + i * W + j, b = base + i * W + j + 1;
      const c = base + (i + 1) * W + j, d = base + (i + 1) * W + j + 1;
      part.indices.push(a, c, b, b, c, d);
    }
  }
  return base;
}

// ----------------------------------------------------------------------------
// body profile: smooth (cosine) interpolation through control stations.
// columns: [u, a (half-width X), b (half-height Y), zc (center Z)]
const BODY_CTRL = [
  [0.00, 0.020, 0.020, 1.32],
  [0.045, 0.50, 0.58, 1.16],
  [0.12, 0.92, 0.99, 0.82],
  [0.22, 1.04, 0.95, 0.46],
  [0.36, 1.02, 0.87, 0.02],
  [0.52, 0.90, 0.74, -0.50],
  [0.66, 0.68, 0.57, -0.98],
  [0.80, 0.44, 0.39, -1.40],
  [0.91, 0.24, 0.22, -1.68],
  [1.00, 0.015, 0.02, -1.90],
];
const GROUND_OFF = 0.05, BOTTOM_FLAT = 0.6;

function bodyProfile(u) {
  let lo = BODY_CTRL[0], hi = BODY_CTRL[BODY_CTRL.length - 1];
  for (let i = 0; i < BODY_CTRL.length - 1; i++) {
    if (u >= BODY_CTRL[i][0] && u <= BODY_CTRL[i + 1][0]) { lo = BODY_CTRL[i]; hi = BODY_CTRL[i + 1]; break; }
  }
  const span = hi[0] - lo[0] || 1e-6;
  const t = (u - lo[0]) / span;
  const s = t * t * (3 - 2 * t); // smooth
  const a = lo[1] + (hi[1] - lo[1]) * s;
  const b = lo[2] + (hi[2] - lo[2]) * s;
  const zc = lo[3] + (hi[3] - lo[3]) * s;
  const yc = GROUND_OFF + b * BOTTOM_FLAT;
  return { a, b, zc, yc };
}

// ----------------------------------------------------------------------------
// palette
const COL = {
  oliveTop: [0.34, 0.40, 0.19],
  oliveDark: [0.24, 0.29, 0.13],
  oliveMid: [0.42, 0.47, 0.26],
  cream: [0.87, 0.83, 0.66],
  tan: [0.82, 0.76, 0.57],
  faceTan: [0.85, 0.79, 0.61],
  patch: [0.13, 0.11, 0.10],
  eye: [0.10, 0.09, 0.09],
  white: [0.95, 0.95, 0.92],
  mouthDark: [0.18, 0.08, 0.09],
  mouthRed: [0.50, 0.16, 0.18],
  tongue: [0.74, 0.34, 0.38],
  capCream: [0.90, 0.88, 0.80],
  capRed: [0.62, 0.26, 0.22],
  nose: [0.66, 0.60, 0.46],
  drool: [0.80, 0.86, 0.86],
};

const EYE_Y = 1.06, EYE_X = 0.34;
const eyeCenters = [[EYE_X, EYE_Y], [-EYE_X, EYE_Y]];

function patchMask(p) {
  let m = 0;
  for (const e of eyeCenters) {
    const dx = (p[0] - e[0]) / 0.34;
    const dy = (p[1] - e[1]) / 0.42;
    const d = Math.hypot(dx, dy);
    const front = smoothstep(0.2, 0.65, p[2]);
    m = Math.max(m, front * (1 - smoothstep(0.6, 1.0, d)));
  }
  return m;
}

// Front-most surface Z near a face point (x,y); used to seat features on the
// actual body so nothing sinks inside the head dome.
function makeFrontZAt(pos) {
  return (x, y) => {
    let best = -1e9;
    for (let i = 0; i < pos.length; i += 3) {
      const bz = pos[i + 2];
      if (bz <= 0) continue;
      const dx = pos[i] - x, dy = pos[i + 1] - y;
      if (dx * dx + dy * dy < 0.013 && bz > best) best = bz;
    }
    return best > -1e9 ? best : 0.7;
  };
}

function bodyColor(p, n) {
  const up = clamp(n[1], 0, 1);
  const heightT = clamp((p[1] - 0.18) / 1.25, 0, 1);
  const upMetric = clamp(heightT * 0.7 + up * 0.55, 0, 1);
  let col = mix(COL.cream, COL.oliveTop, smoothstep(0.42, 0.95, upMetric));
  // mottled darker olive blotches on the upper/back surface
  const noise = vnoise(p[0] * 2.6 + 5, p[1] * 2.6, p[2] * 2.6 - 3);
  const blotch = smoothstep(0.55, 0.75, noise) * smoothstep(0.4, 0.8, upMetric);
  col = mix(col, COL.oliveDark, blotch * 0.7);
  // lighter face on the front
  const faceLight = smoothstep(0.3, 0.8, p[2]) * smoothstep(1.45, 0.5, p[1]);
  col = mix(col, COL.faceTan, 0.75 * faceLight);
  // dark eye patches
  col = mix(col, COL.patch, patchMask(p));
  return col;
}

// ----------------------------------------------------------------------------
function buildBody(parts) {
  const part = emptyPart('body', 'skin');
  const M = 56, N = 80;
  const rings = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const pr = bodyProfile(u);
    const ring = [];
    for (let j = 0; j < M; j++) {
      const th = (j / M) * Math.PI * 2; // 0 at +X
      const cs = Math.cos(th), sn = Math.sin(th);
      let yoff = pr.b * (sn >= 0 ? sn : sn * BOTTOM_FLAT);
      const x = pr.a * cs;
      const y = pr.yc + yoff;
      ring.push([x, y, pr.zc]);
    }
    rings.push(ring);
  }
  addRings(part, rings, M, { closed: true });
  recomputeNormals(part);
  // assign colors using final smooth normals
  for (let v = 0; v < part.positions.length / 3; v++) {
    const p = [part.positions[v * 3], part.positions[v * 3 + 1], part.positions[v * 3 + 2]];
    const n = [part.normals[v * 3], part.normals[v * 3 + 1], part.normals[v * 3 + 2]];
    const c = bodyColor(p, n);
    part.colors[v * 3] = c[0]; part.colors[v * 3 + 1] = c[1]; part.colors[v * 3 + 2] = c[2];
  }
  parts.push(part);
}

function buildEyes(parts, frontZAt) {
  const part = emptyPart('eyes', 'eye');
  for (const e of eyeCenters) {
    const sz = frontZAt(e[0], e[1]);
    addEllipsoid(part, e[0], e[1] - 0.01, sz + 0.02, 0.18, 0.15, 0.12, 20, 16, COL.eye);
    addEllipsoid(part, e[0] + 0.05, e[1] + 0.05, sz + 0.15, 0.035, 0.035, 0.03, 8, 6, COL.white);
  }
  recomputeNormals(part);
  parts.push(part);
  // droopy upper lids (skin colored), flattened caps over the eyes
  const lid = emptyPart('lids', 'skin');
  for (const e of eyeCenters) {
    const sz = frontZAt(e[0], e[1]);
    const base = addEllipsoid(lid, e[0], e[1] + 0.08, sz + 0.02, 0.23, 0.17, 0.15, 18, 12, COL.faceTan);
    const cnt = lid.positions.length / 3;
    for (let v = base; v < cnt; v++) {
      const yy = lid.positions[v * 3 + 1];
      if (yy < e[1] + 0.06) lid.positions[v * 3 + 1] = e[1] + 0.06 + (yy - (e[1] + 0.06)) * 0.12;
    }
  }
  recomputeNormals(lid);
  parts.push(lid);
}

function buildNose(parts, frontZAt) {
  const part = emptyPart('nose', 'skin');
  const y = 0.90, sz = frontZAt(0, y);
  addEllipsoid(part, 0, y, sz + 0.02, 0.17, 0.12, 0.13, 16, 12, COL.nose);
  addEllipsoid(part, 0.06, y - 0.02, sz + 0.11, 0.025, 0.03, 0.03, 8, 6, COL.patch);
  addEllipsoid(part, -0.06, y - 0.02, sz + 0.11, 0.025, 0.03, 0.03, 8, 6, COL.patch);
  recomputeNormals(part);
  parts.push(part);
}

function buildBrow(parts, frontZAt) {
  const part = emptyPart('brow', 'skin');
  const y = 1.27, sz = frontZAt(0, y);
  addEllipsoid(part, 0, y, sz - 0.02, 0.46, 0.10, 0.15, 20, 8, COL.faceTan);
  recomputeNormals(part);
  parts.push(part);
}

// --- mouth variants ---------------------------------------------------------
function buildMouthClosed(parts, frontZAt) {
  const part = emptyPart('mouth-closed', 'dark');
  const seg = 22, halfW = 0.30, cy = 0.70;
  const cz = frontZAt(0, cy);
  const rings = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const x = (t * 2 - 1) * halfW;
    const lift = (t * 2 - 1) * (t * 2 - 1) * 0.10; // corners up (smug)
    const yc = cy + lift;
    const ring = [];
    const r = 0.024;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      ring.push([x, yc + Math.sin(a) * r, cz + 0.05 + Math.cos(a) * r * 0.6]);
    }
    rings.push(ring);
  }
  addRings(part, rings, 8, { closed: true, color: COL.mouthDark });
  recomputeNormals(part);
  parts.push(part);
}

function buildMouthDrool(parts, frontZAt) {
  const part = emptyPart('mouth-drool', 'dark');
  const cy = 0.68, cz = frontZAt(0, cy);
  addEllipsoid(part, 0, cy, cz + 0.01, 0.21, 0.12, 0.07, 20, 12, COL.mouthDark);
  addEllipsoid(part, 0, cy - 0.09, cz + 0.05, 0.21, 0.04, 0.06, 18, 8, COL.faceTan);
  recomputeNormals(part);
  parts.push(part);
  const drip = emptyPart('drool', 'drool', { blend: true, exportable: false });
  addEllipsoid(drip, -0.17, cy - 0.14, cz + 0.06, 0.035, 0.10, 0.035, 12, 10, COL.drool);
  addEllipsoid(drip, -0.17, cy - 0.26, cz + 0.06, 0.05, 0.06, 0.05, 12, 10, COL.drool);
  recomputeNormals(drip);
  parts.push(drip);
}

function buildMouthLaugh(parts, frontZAt) {
  const part = emptyPart('mouth-laugh', 'dark');
  const cy = 0.66, cz = frontZAt(0, cy);
  addEllipsoid(part, 0, cy, cz + 0.0, 0.33, 0.25, 0.15, 26, 18, COL.mouthDark);
  addEllipsoid(part, 0, cy - 0.03, cz - 0.12, 0.24, 0.17, 0.12, 22, 14, COL.mouthRed);
  recomputeNormals(part);
  parts.push(part);
  const teeth = emptyPart('teeth', 'white');
  const n = 5;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1) - 0.5) * 0.40;
    addEllipsoid(teeth, x, cy + 0.18, cz + 0.06, 0.045, 0.05, 0.04, 8, 6, COL.white);
  }
  recomputeNormals(teeth);
  parts.push(teeth);
  const tongue = emptyPart('tongue', 'tongue');
  addEllipsoid(tongue, 0, cy - 0.14, cz + 0.02, 0.16, 0.07, 0.12, 16, 12, COL.tongue);
  recomputeNormals(tongue);
  parts.push(tongue);
}

// --- cap --------------------------------------------------------------------
function buildCap(parts) {
  const part = emptyPart('cap', 'cap');
  const cx = 0, cy = 1.52, cz = 0.58;
  // squashed dome (upper hemisphere only)
  const base = addEllipsoid(part, cx, cy, cz, 0.46, 0.28, 0.46, 28, 16, COL.capCream);
  const cnt = part.positions.length / 3;
  for (let v = base; v < cnt; v++) {
    if (part.positions[v * 3 + 1] < cy) part.positions[v * 3 + 1] = cy; // flatten bottom to base plane
  }
  recomputeNormals(part);
  parts.push(part);
  // red band (a thin ring just above the dome base)
  const band = emptyPart('cap-band', 'red');
  const M = 30, segs = 4, rings = [];
  for (let i = 0; i <= segs; i++) {
    const ty = i / segs;
    const ring = [];
    for (let j = 0; j < M; j++) {
      const a = (j / M) * Math.PI * 2;
      const rr = 0.47 - ty * 0.02;
      ring.push([cx + Math.cos(a) * rr, cy + 0.005 + ty * 0.07, cz + Math.sin(a) * rr]);
    }
    rings.push(ring);
  }
  addRings(band, rings, M, { closed: true, color: COL.capRed });
  recomputeNormals(band);
  parts.push(band);
}

// --- apron: a shell that conforms to the actual front belly ----------------
function buildApron(parts, body) {
  const part = emptyPart('apron', 'apron', { texMix: 1 });
  const pos = body.positions, nor = body.normals;
  const yTop = 0.66, yBot = 0.10;
  const halfW = (y) => 0.34 + 0.58 * smoothstep(0.66, 0.14, y);
  const inBib = (x, y, nz) => nz > 0.02 && y <= yTop && y >= yBot && Math.abs(x) <= halfW(y);
  const map = new Map();
  const remap = (vi) => {
    if (map.has(vi)) return map.get(vi);
    const x = pos[vi * 3], y = pos[vi * 3 + 1], z = pos[vi * 3 + 2];
    const nx = nor[vi * 3], ny = nor[vi * 3 + 1], nz = nor[vi * 3 + 2];
    const ni = part.positions.length / 3;
    part.positions.push(x + nx * 0.035, y + ny * 0.035, z + nz * 0.035);
    part.uvs.push(clamp(0.5 + x / (2 * halfW(y)), 0, 1), clamp((yTop - y) / (yTop - yBot), 0, 1));
    part.colors.push(COL.capCream[0], COL.capCream[1], COL.capCream[2]);
    map.set(vi, ni);
    return ni;
  };
  for (let t = 0; t < body.indices.length; t += 3) {
    const tri = [body.indices[t], body.indices[t + 1], body.indices[t + 2]];
    const ok = tri.every((vi) => pos[vi * 3 + 2] > 0.2 && inBib(pos[vi * 3], pos[vi * 3 + 1], nor[vi * 3 + 2]));
    if (!ok) continue;
    part.indices.push(remap(tri[0]), remap(tri[1]), remap(tri[2]));
  }
  recomputeNormals(part);
  for (let v = 0; v < part.positions.length / 3; v++) {
    if (part.normals[v * 3 + 2] < 0) {
      part.normals[v * 3] *= -1; part.normals[v * 3 + 1] *= -1; part.normals[v * 3 + 2] *= -1;
    }
  }
  parts.push(part);
}

// --- arms -------------------------------------------------------------------
function buildArms(parts) {
  const part = emptyPart('arms', 'skin');
  for (const sgn of [1, -1]) {
    // short tapered limb from shoulder forward-down to a rounded hand on belly
    const path = [
      [sgn * 0.92, 0.62, 0.30],
      [sgn * 0.86, 0.48, 0.55],
      [sgn * 0.66, 0.40, 0.78],
      [sgn * 0.44, 0.36, 0.92],
    ];
    const radii = [0.26, 0.24, 0.20, 0.18];
    const rings = [];
    const M = 14;
    for (let i = 0; i < path.length; i++) {
      const ring = [];
      for (let j = 0; j < M; j++) {
        const a = (j / M) * Math.PI * 2;
        ring.push([
          path[i][0] + Math.cos(a) * radii[i],
          path[i][1] + Math.sin(a) * radii[i],
          path[i][2],
        ]);
      }
      rings.push(ring);
    }
    addRings(part, rings, M, { closed: true, color: COL.oliveMid });
    // rounded hand
    addEllipsoid(part, sgn * 0.40, 0.34, 0.96, 0.20, 0.16, 0.18, 14, 10, COL.oliveMid);
  }
  recomputeNormals(part);
  // recolor with body palette for nice gradient
  for (let v = 0; v < part.positions.length / 3; v++) {
    const p = [part.positions[v * 3], part.positions[v * 3 + 1], part.positions[v * 3 + 2]];
    const n = [part.normals[v * 3], part.normals[v * 3 + 1], part.normals[v * 3 + 2]];
    const c = bodyColor(p, n);
    part.colors[v * 3] = c[0]; part.colors[v * 3 + 1] = c[1]; part.colors[v * 3 + 2] = c[2];
  }
  parts.push(part);
}

function buildShadow(parts) {
  const part = emptyPart('shadow', 'shadow', { blend: true, unlit: true, exportable: false });
  const M = 40;
  const cx = 0, cz = -0.2, rx = 1.15, rz = 1.9;
  const base = part.positions.length / 3;
  part.positions.push(cx, 0.002, cz); part.uvs.push(0.5, 0.5); part.colors.push(0.05, 0.05, 0.06);
  for (let j = 0; j <= M; j++) {
    const a = (j / M) * Math.PI * 2;
    part.positions.push(cx + Math.cos(a) * rx, 0.002, cz + Math.sin(a) * rz);
    part.uvs.push(0, 0);
    part.colors.push(0.05, 0.05, 0.06);
  }
  for (let j = 0; j < M; j++) part.indices.push(base, base + 1 + j, base + 1 + ((j + 1) % (M + 1)));
  part.normals = new Array(part.positions.length).fill(0);
  for (let v = 0; v < part.positions.length / 3; v++) part.normals[v * 3 + 1] = 1;
  parts.push(part);
}

// ----------------------------------------------------------------------------
export function buildCharacter({ face = 'closed' } = {}) {
  const parts = [];
  buildShadow(parts);
  buildBody(parts);
  const body = parts[parts.length - 1];
  const frontZAt = makeFrontZAt(body.positions);
  buildArms(parts);
  buildBrow(parts, frontZAt);
  buildEyes(parts, frontZAt);
  buildNose(parts, frontZAt);
  if (face === 'closed') buildMouthClosed(parts, frontZAt);
  else if (face === 'drool') buildMouthDrool(parts, frontZAt);
  else buildMouthLaugh(parts, frontZAt);
  buildCap(parts);
  buildApron(parts, body);
  // typed arrays for the GPU
  for (const p of parts) {
    p.positions = new Float32Array(p.positions);
    p.normals = new Float32Array(p.normals);
    p.uvs = new Float32Array(p.uvs);
    p.colors = new Float32Array(p.colors);
    p.indices = new Uint32Array(p.indices);
  }
  return { parts };
}

// ----------------------------------------------------------------------------
// Apron art, drawn through a painter interface (pixel coords, 0..255 colors).
// Painter API: bg(rgb), rect(x,y,w,h,rgb), circle(cx,cy,r,rgb),
//   ellipse(cx,cy,rx,ry,rgb), line(x0,y0,x1,y1,w,rgb), text(str,cx,y,size,rgb)
export function paintApron(p) {
  const W = p.width, H = p.height;
  const cream = [228, 222, 198], stitch = [150, 120, 80];
  const brown = [92, 60, 36];
  p.bg(cream);
  // border stitching
  p.rect(W * 0.06, H * 0.06, W * 0.88, H * 0.012, stitch);
  p.rect(W * 0.06, H * 0.92, W * 0.88, H * 0.012, stitch);
  p.rect(W * 0.06, H * 0.06, W * 0.012, H * 0.86, stitch);
  p.rect(W * 0.93, H * 0.06, W * 0.012, H * 0.86, stitch);
  // SLOTHY'S wordmark
  p.text("SLOTHY'S", W * 0.5, H * 0.20, H * 0.11, brown);
  // burger logo (stacked)
  const bx = W * 0.5, by = H * 0.62, bw = W * 0.46;
  p.ellipse(bx, by - bw * 0.20, bw * 0.5, bw * 0.26, [196, 138, 70]);  // top bun
  // sesame
  p.circle(bx - bw * 0.16, by - bw * 0.24, bw * 0.018, [240, 232, 205]);
  p.circle(bx + bw * 0.10, by - bw * 0.26, bw * 0.018, [240, 232, 205]);
  p.circle(bx + bw * 0.0, by - bw * 0.18, bw * 0.018, [240, 232, 205]);
  p.ellipse(bx, by - bw * 0.02, bw * 0.52, bw * 0.10, [110, 170, 80]);  // lettuce
  p.ellipse(bx, by + bw * 0.10, bw * 0.50, bw * 0.13, [120, 64, 44]);   // patty
  p.ellipse(bx, by + bw * 0.24, bw * 0.50, bw * 0.12, [196, 138, 70]);  // bottom bun
  // tagline
  p.text("EST. SLUG ST.", W * 0.5, H * 0.86, H * 0.05, stitch);
}
