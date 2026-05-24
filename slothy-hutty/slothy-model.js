// Procedural geometry for "Slothy" — a fat, seated Jabba/slug sloth creature.
// Pure data, no DOM. The chubby fused body (torso, head, jowls, arms, feet,
// tail) is one organic mesh built from a metaball signed-distance field via
// naive Surface Nets; facial features, cap and apron are placed on top.
// Frame: +Y up, +Z toward the viewer (face), tail trails to -Z, ground at y=0.

export const FACE_STATES = ['closed', 'drool', 'laugh'];
export const FACE_LABELS = { closed: 'Smug', drool: 'Sleepy', laugh: 'Laughing' };

// ----------------------------------------------------------------------------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function hash3(i, j, k) {
  let n = (i * 374761393 + j * 668265263 + k * 1274126177) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const L = (a, b, t) => a + (b - a) * t;
  return L(
    L(L(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), L(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    L(L(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), L(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w);
}

// ----------------------------------------------------------------------------
// part helpers
function emptyPart(name, region, opts = {}) {
  return {
    name, region, texMix: opts.texMix || 0, blend: !!opts.blend,
    exportable: opts.exportable !== false, unlit: !!opts.unlit,
    positions: [], normals: [], uvs: [], colors: [], indices: [],
  };
}
function finalize(part) {
  part.positions = part.positions instanceof Float32Array ? part.positions : new Float32Array(part.positions);
  part.normals = part.normals instanceof Float32Array ? part.normals : new Float32Array(part.normals);
  part.uvs = part.uvs instanceof Float32Array ? part.uvs : new Float32Array(part.uvs);
  part.colors = part.colors instanceof Float32Array ? part.colors : new Float32Array(part.colors);
  part.indices = part.indices instanceof Uint32Array ? part.indices : new Uint32Array(part.indices);
  return part;
}
function recomputeNormals(part) {
  const p = part.positions, idx = part.indices, n = new Array(p.length).fill(0);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const o of [a, b, c]) { n[o] += nx; n[o + 1] += ny; n[o + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  part.normals = n;
}
function addEllipsoid(part, cx, cy, cz, rx, ry, rz, segU, segV, color, opts = {}) {
  const base = part.positions.length / 3;
  for (let i = 0; i <= segV; i++) {
    const phi = (i / segV) * Math.PI;
    for (let j = 0; j <= segU; j++) {
      const th = (j / segU) * Math.PI * 2;
      let x = rx * Math.sin(phi) * Math.cos(th), y = ry * Math.cos(phi), z = rz * Math.sin(phi) * Math.sin(th);
      if (opts.flatBottom && y < 0) y *= opts.flatBottom;
      part.positions.push(cx + x, cy + y, cz + z);
      part.uvs.push(j / segU, i / segV);
      const c = typeof color === 'function' ? color([cx + x, cy + y, cz + z]) : color;
      part.colors.push(c[0], c[1], c[2]);
    }
  }
  const W = segU + 1;
  for (let i = 0; i < segV; i++) for (let j = 0; j < segU; j++) {
    const a = base + i * W + j, b = base + i * W + j + 1, c = base + (i + 1) * W + j, d = base + (i + 1) * W + j + 1;
    part.indices.push(a, c, b, b, c, d);
  }
  return base;
}
function addRings(part, rings, M, opts = {}) {
  const base = part.positions.length / 3, ringCount = rings.length;
  for (let i = 0; i < ringCount; i++) for (let j = 0; j < M; j++) {
    const pnt = rings[i][j];
    part.positions.push(pnt[0], pnt[1], pnt[2]);
    part.uvs.push(j / M, i / (ringCount - 1));
    const c = opts.color || [1, 1, 1];
    part.colors.push(c[0], c[1], c[2]);
  }
  for (let i = 0; i < ringCount - 1; i++) for (let j = 0; j < M; j++) {
    const a = base + i * M + j, b = base + i * M + ((j + 1) % M);
    const c = base + (i + 1) * M + j, d = base + (i + 1) * M + ((j + 1) % M);
    part.indices.push(a, c, b, b, c, d);
  }
  return base;
}

// ----------------------------------------------------------------------------
// metaball SDF (negative inside) + naive Surface Nets polygonizer
function sdEllipsoid(px, py, pz, c) {
  const dx = (px - c[0]) / c[3], dy = (py - c[1]) / c[4], dz = (pz - c[2]) / c[5];
  const k0 = Math.hypot(dx, dy, dz);
  const k1 = Math.hypot(dx / c[3], dy / c[4], dz / c[5]);
  return k1 > 0 ? k0 * (k0 - 1.0) / k1 : k0 - 1.0;
}
function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }

// [cx,cy,cz, rx,ry,rz]
const BLOBS = [
  [0.00, 1.06, 0.12, 1.20, 1.00, 0.86],   // torso (mass shifted forward)
  [0.00, 0.54, 0.30, 1.02, 0.70, 0.82],   // lower belly (sit)
  [0.00, 0.86, 0.56, 0.95, 0.80, 0.55],   // belly bulge (front)
  [0.00, 1.82, 0.34, 0.82, 0.62, 0.64],   // head
  [0.00, 2.04, 0.46, 0.62, 0.27, 0.38],   // heavy brow / forehead
  [0.00, 1.58, 0.66, 0.42, 0.22, 0.34],   // snout / muzzle (broad, flat)
  [0.62, 1.50, 0.42, 0.46, 0.50, 0.42],   // jowl L
  [-0.62, 1.50, 0.42, 0.46, 0.50, 0.42],  // jowl R
  [1.00, 1.30, 0.18, 0.46, 0.50, 0.46],   // shoulder L
  [-1.00, 1.30, 0.18, 0.46, 0.50, 0.46],  // shoulder R
  [0.70, 0.74, 0.92, 0.34, 0.36, 0.36],   // arm/hand on belly L
  [-0.70, 0.74, 0.92, 0.34, 0.36, 0.36],  // arm/hand on belly R
  [0.42, 0.13, 0.96, 0.34, 0.18, 0.40],   // foot L
  [-0.42, 0.13, 0.96, 0.34, 0.18, 0.40],  // foot R
  [0.00, 0.74, -0.92, 0.66, 0.60, 0.62],  // tail 1
  [0.00, 0.52, -1.52, 0.50, 0.44, 0.52],  // tail 2
  [0.00, 0.40, -2.05, 0.36, 0.32, 0.42],  // tail 3
  [0.00, 0.30, -2.50, 0.24, 0.22, 0.30],  // tail 4 (tip on ground)
];
const SMIN_K = 0.4;

function bodySDF(x, y, z) {
  let d = 1e9;
  for (let i = 0; i < BLOBS.length; i++) d = smin(d, sdEllipsoid(x, y, z, BLOBS[i]), SMIN_K);
  // surface wobble for a soft, hand-drawn skin
  d += (vnoise(x * 2.0 + 7, y * 2.0, z * 2.0 - 3) - 0.5) * 0.05;
  return Math.max(d, -(y - 0.0)); // flat-cut the base at y=0 so it sits
}

// naive surface nets -> { positions:Float32Array, indices:Uint32Array }
function surfaceNets(fn, bounds, cell) {
  const [x0, y0, z0, x1, y1, z1] = bounds;
  const nx = Math.ceil((x1 - x0) / cell) + 1;
  const ny = Math.ceil((y1 - y0) / cell) + 1;
  const nz = Math.ceil((z1 - z0) / cell) + 1;
  const field = new Float32Array(nx * ny * nz);
  const gi = (ix, iy, iz) => (iz * ny + iy) * nx + ix;
  for (let iz = 0; iz < nz; iz++) for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++)
    field[gi(ix, iy, iz)] = fn(x0 + ix * cell, y0 + iy * cell, z0 + iz * cell);

  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const vbuf = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const ci = (ix, iy, iz) => (iz * (ny - 1) + iy) * (nx - 1) + ix;
  const positions = [];
  for (let iz = 0; iz < nz - 1; iz++) for (let iy = 0; iy < ny - 1; iy++) for (let ix = 0; ix < nx - 1; ix++) {
    const v = new Array(8);
    let mask = 0;
    for (let c = 0; c < 8; c++) {
      const val = field[gi(ix + corners[c][0], iy + corners[c][1], iz + corners[c][2])];
      v[c] = val; if (val < 0) mask |= 1 << c;
    }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [a, b] of edges) {
      if ((mask >> a & 1) === (mask >> b & 1)) continue;
      const t = v[a] / (v[a] - v[b]);
      sx += corners[a][0] + t * (corners[b][0] - corners[a][0]);
      sy += corners[a][1] + t * (corners[b][1] - corners[a][1]);
      sz += corners[a][2] + t * (corners[b][2] - corners[a][2]);
      cnt++;
    }
    vbuf[ci(ix, iy, iz)] = positions.length / 3;
    positions.push(x0 + (ix + sx / cnt) * cell, y0 + (iy + sy / cnt) * cell, z0 + (iz + sz / cnt) * cell);
  }
  const indices = [];
  const quad = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) indices.push(a, b, c, a, c, d); else indices.push(a, c, b, a, d, c);
  };
  for (let iz = 1; iz < nz - 1; iz++) for (let iy = 1; iy < ny - 1; iy++) for (let ix = 1; ix < nx - 1; ix++) {
    const v0 = field[gi(ix, iy, iz)] < 0;
    // x-edge
    if (v0 !== (field[gi(ix + 1, iy, iz)] < 0))
      quad(vbuf[ci(ix, iy - 1, iz - 1)], vbuf[ci(ix, iy, iz - 1)], vbuf[ci(ix, iy, iz)], vbuf[ci(ix, iy - 1, iz)], v0);
    // y-edge
    if (v0 !== (field[gi(ix, iy + 1, iz)] < 0))
      quad(vbuf[ci(ix - 1, iy, iz - 1)], vbuf[ci(ix, iy, iz - 1)], vbuf[ci(ix, iy, iz)], vbuf[ci(ix - 1, iy, iz)], !v0);
    // z-edge
    if (v0 !== (field[gi(ix, iy, iz + 1)] < 0))
      quad(vbuf[ci(ix - 1, iy - 1, iz)], vbuf[ci(ix, iy - 1, iz)], vbuf[ci(ix, iy, iz)], vbuf[ci(ix - 1, iy, iz)], v0);
  }
  return { positions, indices };
}

// ----------------------------------------------------------------------------
// palette
const COL = {
  oliveTop: [0.33, 0.39, 0.20], oliveDark: [0.22, 0.27, 0.13], oliveMid: [0.40, 0.45, 0.26],
  cream: [0.85, 0.81, 0.63], tan: [0.80, 0.73, 0.54], faceTan: [0.82, 0.76, 0.57],
  patch: [0.16, 0.13, 0.11], eye: [0.10, 0.08, 0.07], white: [0.94, 0.93, 0.86],
  mouthDark: [0.16, 0.07, 0.08], mouthRed: [0.52, 0.18, 0.20], tongue: [0.74, 0.34, 0.38],
  capCream: [0.88, 0.86, 0.78], capRed: [0.58, 0.27, 0.22], nose: [0.60, 0.54, 0.41],
  drool: [0.82, 0.87, 0.84], wrinkle: [0.50, 0.50, 0.34],
};

const EYE_X = 0.30, EYE_Y = 1.86;
const eyeCenters = [[EYE_X, EYE_Y], [-EYE_X, EYE_Y]];

// large slanted almond patch around each eye
function patchMask(x, y, z) {
  if (z < 0.2) return 0;
  let m = 0;
  for (let s = 0; s < 2; s++) {
    const ex = eyeCenters[s][0], ey = eyeCenters[s][1];
    const dx = x - ex, dy = y - ey;
    const slant = (ex >= 0 ? 1 : -1) * 0.5; // outer-down tilt
    const rx = slant * dx + (1) * 0 + dx * 0; // keep simple: rotate
    const cosA = Math.cos((ex >= 0 ? -0.5 : 0.5)), sinA = Math.sin((ex >= 0 ? -0.5 : 0.5));
    const u = (dx * cosA - dy * sinA) / 0.42;
    const v = (dx * sinA + dy * cosA) / 0.26;
    const d = Math.hypot(u, v);
    m = Math.max(m, 1 - smoothstep(0.7, 1.05, d));
  }
  return m * smoothstep(0.2, 0.6, z);
}

function bodyColor(p, n) {
  const x = p[0], y = p[1], z = p[2];
  const up = clamp(n[1], 0, 1);
  const heightT = clamp((y - 0.3) / 1.9, 0, 1);
  const upMetric = clamp(heightT * 0.65 + up * 0.5, 0, 1);
  let col = mix(COL.cream, COL.oliveTop, smoothstep(0.4, 0.95, upMetric));
  // mottled darker blotches on upper/back
  const noise = vnoise(x * 2.4 + 5, y * 2.4, z * 2.4 - 3);
  col = mix(col, COL.oliveDark, smoothstep(0.55, 0.78, noise) * smoothstep(0.35, 0.85, upMetric) * 0.7);
  // lighter face/belly on the front
  const faceLight = smoothstep(0.15, 0.7, z) * smoothstep(2.2, 0.4, y);
  col = mix(col, COL.faceTan, 0.7 * faceLight);
  // dark eye patches
  col = mix(col, COL.patch, patchMask(x, y, z));
  return col;
}

function makeFrontZAt(pos) {
  return (x, y) => {
    let best = -1e9;
    for (let i = 0; i < pos.length; i += 3) {
      const bz = pos[i + 2]; if (bz <= 0) continue;
      const dx = pos[i] - x, dy = pos[i + 1] - y;
      if (dx * dx + dy * dy < 0.02 && bz > best) best = bz;
    }
    return best > -1e9 ? best : 0.8;
  };
}

// ----------------------------------------------------------------------------
const BODY_BOUNDS = [-1.8, -0.1, -3.2, 1.8, 2.7, 1.5];
function buildBody(cell) {
  const part = emptyPart('body', 'skin');
  const { positions, indices } = surfaceNets(bodySDF, BODY_BOUNDS, cell);
  part.positions = positions; part.indices = indices;
  // normals from SDF gradient (smooth, winding-independent)
  const e = cell * 0.6, normals = new Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    const gx = bodySDF(x + e, y, z) - bodySDF(x - e, y, z);
    const gy = bodySDF(x, y + e, z) - bodySDF(x, y - e, z);
    const gz = bodySDF(x, y, z + e) - bodySDF(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1;
    normals[i] = gx / l; normals[i + 1] = gy / l; normals[i + 2] = gz / l;
  }
  part.normals = normals;
  const colors = new Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const c = bodyColor([positions[i], positions[i + 1], positions[i + 2]], [normals[i], normals[i + 1], normals[i + 2]]);
    colors[i] = c[0]; colors[i + 1] = c[1]; colors[i + 2] = c[2];
  }
  part.colors = colors;
  part.uvs = new Array((positions.length / 3) * 2).fill(0);
  return finalize(part);
}

// --- facial features --------------------------------------------------------
function buildEyes(parts, frontZAt) {
  const eyes = emptyPart('eyes', 'eye'), lids = emptyPart('lids', 'skin');
  for (const [ex, ey] of eyeCenters) {
    const sz = frontZAt(ex, ey);
    // narrow dark eye (half-lidded slit)
    addEllipsoid(eyes, ex, ey - 0.03, sz + 0.02, 0.15, 0.09, 0.08, 16, 10, COL.eye);
    addEllipsoid(eyes, ex + 0.03, ey + 0.0, sz + 0.10, 0.03, 0.03, 0.025, 8, 6, COL.white);
    // heavy hooded upper lid
    const base = addEllipsoid(lids, ex, ey + 0.10, sz + 0.0, 0.24, 0.17, 0.16, 18, 12, COL.faceTan);
    const cnt = lids.positions.length / 3;
    for (let vv = base; vv < cnt; vv++) { const yy = lids.positions[vv * 3 + 1]; if (yy < ey + 0.05) lids.positions[vv * 3 + 1] = ey + 0.05 + (yy - (ey + 0.05)) * 0.1; }
  }
  recomputeNormals(eyes); recomputeNormals(lids);
  parts.push(finalize(eyes), finalize(lids));
}
function buildSnout(parts, frontZAt) {
  const part = emptyPart('snout', 'skin');
  const y = 1.62, sz = frontZAt(0, y);
  addEllipsoid(part, 0, y, sz - 0.02, 0.30, 0.20, 0.18, 18, 12, COL.faceTan); // raised muzzle
  addEllipsoid(part, 0.075, y + 0.03, sz + 0.10, 0.03, 0.035, 0.03, 8, 6, COL.patch); // nostrils
  addEllipsoid(part, -0.075, y + 0.03, sz + 0.10, 0.03, 0.035, 0.03, 8, 6, COL.patch);
  recomputeNormals(part); parts.push(finalize(part));
}
function buildBrow(parts, frontZAt) {
  const part = emptyPart('brow', 'skin');
  const y = 2.0, sz = frontZAt(0, y);
  addEllipsoid(part, 0, y, sz - 0.04, 0.5, 0.12, 0.16, 20, 8, COL.faceTan);
  recomputeNormals(part); parts.push(finalize(part));
}

function buildMouthClosed(parts, frontZAt) {
  const part = emptyPart('mouth-closed', 'dark');
  const seg = 26, halfW = 0.34, cy = 1.40, cz = frontZAt(0, cy);
  const rings = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, x = (t * 2 - 1) * halfW;
    const yc = cy - (t * 2 - 1) * (t * 2 - 1) * 0.06; // gentle downturn
    const ring = [];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; ring.push([x, yc + Math.sin(a) * 0.022, cz + 0.04 + Math.cos(a) * 0.014]); }
    rings.push(ring);
  }
  addRings(part, rings, 8, { color: COL.mouthDark });
  recomputeNormals(part); parts.push(finalize(part));
}
function buildMouthDrool(parts, frontZAt) {
  const part = emptyPart('mouth-drool', 'dark');
  const cy = 1.40, cz = frontZAt(0, cy);
  addEllipsoid(part, 0, cy, cz + 0.01, 0.22, 0.10, 0.06, 20, 12, COL.mouthDark);
  addEllipsoid(part, 0.02, cy + 0.01, cz - 0.04, 0.12, 0.05, 0.05, 16, 10, COL.mouthRed);
  recomputeNormals(part); parts.push(finalize(part));
  const drip = emptyPart('drool', 'drool', { blend: true, exportable: false });
  addEllipsoid(drip, 0.0, cy - 0.12, cz + 0.05, 0.03, 0.11, 0.03, 12, 10, COL.drool);
  addEllipsoid(drip, 0.0, cy - 0.26, cz + 0.05, 0.045, 0.055, 0.045, 12, 10, COL.drool);
  recomputeNormals(drip); parts.push(finalize(drip));
}
function buildMouthLaugh(parts, frontZAt) {
  const part = emptyPart('mouth-laugh', 'dark');
  const cy = 1.36, cz = frontZAt(0, cy);
  addEllipsoid(part, 0, cy, cz + 0.0, 0.30, 0.24, 0.14, 26, 18, COL.mouthDark);
  addEllipsoid(part, 0, cy - 0.04, cz - 0.10, 0.20, 0.15, 0.10, 22, 14, COL.mouthRed);
  recomputeNormals(part); parts.push(finalize(part));
  const teeth = emptyPart('teeth', 'white'); // two upper fangs like the sheet
  for (const sgn of [1, -1]) addEllipsoid(teeth, sgn * 0.10, cy + 0.16, cz + 0.05, 0.05, 0.07, 0.04, 8, 8, COL.white);
  recomputeNormals(teeth); parts.push(finalize(teeth));
  const tongue = emptyPart('tongue', 'tongue');
  addEllipsoid(tongue, 0, cy - 0.13, cz + 0.02, 0.14, 0.06, 0.10, 16, 12, COL.tongue);
  recomputeNormals(tongue); parts.push(finalize(tongue));
}

function buildCap(parts) {
  const part = emptyPart('cap', 'cap');
  const cx = 0, cy = 2.34, cz = 0.30;
  const base = addEllipsoid(part, cx, cy, cz, 0.50, 0.30, 0.50, 28, 16, COL.capCream);
  const cnt = part.positions.length / 3;
  for (let v = base; v < cnt; v++) if (part.positions[v * 3 + 1] < cy) part.positions[v * 3 + 1] = cy;
  recomputeNormals(part); parts.push(finalize(part));
  const band = emptyPart('cap-band', 'red');
  const M = 30, segs = 4, rings = [];
  for (let i = 0; i <= segs; i++) { const ty = i / segs, ring = []; for (let j = 0; j < M; j++) { const a = (j / M) * Math.PI * 2, rr = 0.51 - ty * 0.02; ring.push([cx + Math.cos(a) * rr, cy + 0.005 + ty * 0.08, cz + Math.sin(a) * rr]); } rings.push(ring); }
  addRings(band, rings, M, { color: COL.capRed });
  recomputeNormals(band); parts.push(finalize(band));
}

function buildApron(parts, body) {
  const part = emptyPart('apron', 'apron', { texMix: 1 });
  const pos = body.positions, nor = body.normals;
  const yTop = 1.45, yBot = 0.42;
  const halfW = (y) => 0.42 + 0.46 * smoothstep(1.45, 0.6, y);
  const inBib = (x, y, nz) => nz > 0.05 && y <= yTop && y >= yBot && Math.abs(x) <= halfW(y);
  const map = new Map();
  const remap = (vi) => {
    if (map.has(vi)) return map.get(vi);
    const x = pos[vi * 3], y = pos[vi * 3 + 1], z = pos[vi * 3 + 2];
    const nx = nor[vi * 3], ny = nor[vi * 3 + 1], nz = nor[vi * 3 + 2];
    const ni = part.positions.length / 3;
    part.positions.push(x + nx * 0.04, y + ny * 0.04, z + nz * 0.04);
    part.uvs.push(clamp(0.5 + x / (2 * halfW(y)), 0, 1), clamp((yTop - y) / (yTop - yBot), 0, 1));
    part.colors.push(COL.capCream[0], COL.capCream[1], COL.capCream[2]);
    map.set(vi, ni); return ni;
  };
  for (let t = 0; t < body.indices.length; t += 3) {
    const tri = [body.indices[t], body.indices[t + 1], body.indices[t + 2]];
    if (!tri.every((vi) => pos[vi * 3 + 2] > 0.35 && inBib(pos[vi * 3], pos[vi * 3 + 1], nor[vi * 3 + 2]))) continue;
    part.indices.push(remap(tri[0]), remap(tri[1]), remap(tri[2]));
  }
  recomputeNormals(part);
  for (let v = 0; v < part.positions.length / 3; v++) if (part.normals[v * 3 + 2] < 0) { part.normals[v * 3] *= -1; part.normals[v * 3 + 1] *= -1; part.normals[v * 3 + 2] *= -1; }
  parts.push(finalize(part));
}

function buildShadow(parts) {
  const part = emptyPart('shadow', 'shadow', { blend: true, unlit: true, exportable: false });
  const M = 44, cx = 0, cz = -0.5, rx = 1.45, rz = 2.4, base = 0;
  part.positions.push(cx, 0.002, cz); part.uvs.push(0.5, 0.5); part.colors.push(0.05, 0.05, 0.06);
  for (let j = 0; j <= M; j++) { const a = (j / M) * Math.PI * 2; part.positions.push(cx + Math.cos(a) * rx, 0.002, cz + Math.sin(a) * rz); part.uvs.push(0, 0); part.colors.push(0.05, 0.05, 0.06); }
  for (let j = 0; j < M; j++) part.indices.push(base, base + 1 + j, base + 1 + ((j + 1) % (M + 1)));
  part.normals = new Array(part.positions.length).fill(0);
  for (let v = 0; v < part.positions.length / 3; v++) part.normals[v * 3 + 1] = 1;
  parts.push(finalize(part));
}

// ----------------------------------------------------------------------------
let _staticCache = null, _staticCell = 0;
function buildStatic(cell) {
  if (_staticCache && _staticCell === cell) return _staticCache;
  const parts = [];
  buildShadow(parts);
  const body = buildBody(cell);
  parts.push(body);
  const frontZAt = makeFrontZAt(body.positions);
  buildBrow(parts, frontZAt);
  buildEyes(parts, frontZAt);
  buildSnout(parts, frontZAt);
  buildCap(parts);
  buildApron(parts, body);
  _staticCache = { parts, frontZAt }; _staticCell = cell;
  return _staticCache;
}

export function buildCharacter({ face = 'closed', cell = 0.05 } = {}) {
  const { parts: staticParts, frontZAt } = buildStatic(cell);
  const mouth = [];
  if (face === 'closed') buildMouthClosed(mouth, frontZAt);
  else if (face === 'drool') buildMouthDrool(mouth, frontZAt);
  else buildMouthLaugh(mouth, frontZAt);
  return { parts: [...staticParts, ...mouth] };
}

// ----------------------------------------------------------------------------
// Apron art (pixel coords, 0..255 colors) — drawn through a painter interface.
export function paintApron(p) {
  const W = p.width, H = p.height;
  const cream = [228, 222, 198], stitch = [150, 120, 80], brown = [92, 60, 36];
  p.bg(cream);
  p.rect(W * 0.06, H * 0.06, W * 0.88, H * 0.012, stitch);
  p.rect(W * 0.06, H * 0.92, W * 0.88, H * 0.012, stitch);
  p.rect(W * 0.06, H * 0.06, W * 0.012, H * 0.86, stitch);
  p.rect(W * 0.93, H * 0.06, W * 0.012, H * 0.86, stitch);
  p.text("SLOTHY'S", W * 0.5, H * 0.22, H * 0.12, brown);
  const bx = W * 0.5, by = H * 0.62, bw = W * 0.46;
  p.ellipse(bx, by - bw * 0.20, bw * 0.5, bw * 0.26, [196, 138, 70]);
  p.circle(bx - bw * 0.16, by - bw * 0.24, bw * 0.018, [240, 232, 205]);
  p.circle(bx + bw * 0.10, by - bw * 0.26, bw * 0.018, [240, 232, 205]);
  p.circle(bx + bw * 0.0, by - bw * 0.18, bw * 0.018, [240, 232, 205]);
  p.ellipse(bx, by - bw * 0.02, bw * 0.52, bw * 0.10, [110, 170, 80]);
  p.ellipse(bx, by + bw * 0.10, bw * 0.50, bw * 0.13, [120, 64, 44]);
  p.ellipse(bx, by + bw * 0.24, bw * 0.50, bw * 0.12, [196, 138, 70]);
  p.text("EST. SLUG ST.", W * 0.5, H * 0.86, H * 0.05, stitch);
}
