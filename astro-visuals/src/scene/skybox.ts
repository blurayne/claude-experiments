import { gl } from '../gpu/context'
import { prog } from '../gpu/program'
import SKY_VS from '../shaders/sky.vert?raw'
import SKY_FS from '../shaders/sky.frag?raw'
import { makeBuf, pointVAO, trackVAOBuffers } from '../gpu/buffers'

/**
 * The extragalactic sky: the brightest real galaxies we see from here, at their true
 * J2000 positions. The three big ones — the two Magellanic Clouds and Triangulum — are
 * their photographs on billboards; the rest are tinted points sized by apparent
 * diameter. All of it rides the Sun like the backdrop does, and none of it rotates
 * with the disk: the background universe holds still while the Milky Way turns.
 *
 * Positions go through the same equatorial→galactic→scene chain as the star-catalogue
 * builder (tools/build_athyg_stars.py), which the orientation tests verify end to end.
 * One disclosed simplification: everything sits on one far sphere (R_SKY), so the
 * Clouds — really at 50–60 kpc — are drawn as sky, not as neighbours; they do not
 * move through the merger. Photo credits live in the info panel's what's-real ledger.
 */

// equatorial -> galactic, J2000 — the catalogue builder's matrix
const R = [
  [-0.05487556, -0.87343709, -0.48383502],
  [ 0.49410943, -0.44482963,  0.74698225],
  [-0.86766615, -0.19807637,  0.45598378],
] as const
type V3 = [number, number, number]
const eqToScene = ([x, y, z]: V3): V3 => {
  const Xg = R[0][0]*x + R[0][1]*y + R[0][2]*z
  const Yg = R[1][0]*x + R[1][1]*y + R[1][2]*z
  const Zg = R[2][0]*x + R[2][1]*y + R[2][2]*z
  return [Yg, Zg, -Xg]                       // scene: l=90 on +x, north on +y, GC on −z
}
const dirOf = (raDeg: number, decDeg: number): V3 => {
  const ra = raDeg*Math.PI/180, dec = decDeg*Math.PI/180
  return eqToScene([Math.cos(dec)*Math.cos(ra), Math.cos(dec)*Math.sin(ra), Math.sin(dec)])
}
const cross = (a: V3, b: V3): V3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
const norm = (v: V3): V3 => { const l = Math.hypot(...v) || 1; return [v[0]/l, v[1]/l, v[2]/l] }

export const R_SKY = 17000;   // beyond Andromeda's farthest drawn separation, inside the far plane

// name, RA°, Dec°, major axis arcmin, position angle °, and a display tint from the
// galaxy's dominant colour (yellow ellipticals, blue-white face-on spirals, dusty warms)
const DOTS: readonly (readonly [string, number, number, number, number, readonly [number, number, number]])[] = [
  ['M81',      148.89,  69.07, 27, 157, [1.00, 0.92, 0.78]],
  ['M82',      148.97,  69.68, 11,  65, [1.00, 0.84, 0.62]],
  ['Centaurus A', 201.37, -43.02, 26, 35, [0.95, 0.88, 0.80]],
  ['M83',      204.25, -29.87, 13,  45, [0.85, 0.92, 1.00]],
  ['M101',     210.80,  54.35, 29,   0, [0.82, 0.90, 1.00]],
  ['M51',      202.47,  47.20, 11, 163, [0.85, 0.92, 1.00]],
  ['NGC 253',   11.89, -25.29, 27,  52, [1.00, 0.88, 0.70]],
  ['M104',     190.00, -11.62,  9,  89, [1.00, 0.93, 0.80]],
  ['M87',      187.71,  12.39,  8,   0, [1.00, 0.95, 0.82]],
  ['M64',      194.18,  21.68, 10, 115, [0.95, 0.90, 0.82]],
  ['M94',      192.72,  41.12, 11, 120, [0.95, 0.93, 0.85]],
  ['M106',     184.74,  47.30, 19, 150, [0.88, 0.92, 1.00]],
  ['NGC 300',   13.72, -37.68, 22, 111, [0.85, 0.92, 1.00]],
  ['NGC 55',     3.79, -39.20, 32, 108, [0.88, 0.92, 1.00]],
  ['M49',      187.44,   8.00, 10,   0, [1.00, 0.94, 0.80]],
  ['IC 342',    56.70,  68.10, 21,   0, [0.90, 0.92, 1.00]],
];

// the three photographed ones: file, RA°, Dec°, apparent size ° (drawn edge to edge),
// and the rotation of the image's vertical onto the sky, eyeballed against the real frames
const IMAGES: readonly (readonly [string, number, number, number, number])[] = [
  ['img/sky/lmc.webp', 80.89, -69.76, 9.0,  10],
  ['img/sky/smc.webp', 13.19, -72.83, 5.0,  35],
  ['img/sky/m33.webp', 23.46,  30.66, 1.6,  50],
];

// The name labels render/labels places over the photographed three — the nearest
// galaxies a viewer will actually recognise. Sun-relative positions, like the quads.
export const SKY_LABELS: readonly { name: string; p: V3 }[] = [
  { name: 'Large Magellanic Cloud', p: dirOf(80.89, -69.76).map(c => c*R_SKY) as V3 },
  { name: 'Small Magellanic Cloud', p: dirOf(13.19, -72.83).map(c => c*R_SKY) as V3 },
  { name: 'Triangulum (M33)',       p: dirOf(23.46,  30.66).map(c => c*R_SKY) as V3 },
];

const pSky = prog(SKY_VS, SKY_FS);
const US = {
  proj: gl.getUniformLocation(pSky, 'uProj'),
  view: gl.getUniformLocation(pSky, 'uView'),
  org:  gl.getUniformLocation(pSky, 'uOrg'),
  tex:  gl.getUniformLocation(pSky, 'uTex'),
  gain: gl.getUniformLocation(pSky, 'uGain'),
};

let dotVAO: WebGLVertexArrayObject | null = null;
let quadVAOs: { vao: WebGLVertexArrayObject; tex: WebGLTexture }[] = [];
export let N_SKYDOTS = 0;

export function initSkybox(): void {
  // the dots, through the same point pipeline as everything else
  N_SKYDOTS = DOTS.length;
  const pos = new Float32Array(N_SKYDOTS*3), size = new Float32Array(N_SKYDOTS), col = new Float32Array(N_SKYDOTS*3);
  DOTS.forEach(([, ra, dec, arcmin, , tint], i) => {
    const d = dirOf(ra, dec);
    pos[i*3] = d[0]*R_SKY; pos[i*3+1] = d[1]*R_SKY; pos[i*3+2] = d[2]*R_SKY;
    // aSize is divided by the view distance in the shader; at R_SKY this lands 3–9 px,
    // scaled with apparent diameter and floored so the small ones survive
    size[i] = Math.min(340, Math.max(95, arcmin*8));
    const b = 0.8;
    col[i*3] = tint[0]*b; col[i*3+1] = tint[1]*b; col[i*3+2] = tint[2]*b;
  });
  dotVAO = pointVAO(pos, size, col);

  // the photographed three: one quad each, corners set on the sky's north/east tangents
  // at the true position angle. The photos are vignetted to black, so additive blending
  // needs no alpha and no sorting.
  for (const [file, ra, dec, sizeDeg, rot] of IMAGES) {
    const d = dirOf(ra, dec);
    // celestial north's tangent at this point, and east's — polar vectors, safe to
    // transform one by one through the left-handed scene map
    const nPole = eqToScene([0, 0, 1]);
    const nT = norm([nPole[0] - (nPole[0]*d[0]+nPole[1]*d[1]+nPole[2]*d[2])*d[0],
                     nPole[1] - (nPole[0]*d[0]+nPole[1]*d[1]+nPole[2]*d[2])*d[1],
                     nPole[2] - (nPole[0]*d[0]+nPole[1]*d[1]+nPole[2]*d[2])*d[2]])
    const eT = norm(cross(d, nT))
    const a = rot*Math.PI/180
    const up: V3 = [nT[0]*Math.cos(a)+eT[0]*Math.sin(a), nT[1]*Math.cos(a)+eT[1]*Math.sin(a), nT[2]*Math.cos(a)+eT[2]*Math.sin(a)]
    const rt: V3 = [eT[0]*Math.cos(a)-nT[0]*Math.sin(a), eT[1]*Math.cos(a)-nT[1]*Math.sin(a), eT[2]*Math.cos(a)-nT[2]*Math.sin(a)]
    const h = R_SKY*Math.tan(sizeDeg*Math.PI/360)
    const c: V3 = [d[0]*R_SKY, d[1]*R_SKY, d[2]*R_SKY]
    const corner = (su: number, sv: number): number[] =>
      [c[0]+rt[0]*h*su+up[0]*h*sv, c[1]+rt[1]*h*su+up[1]*h*sv, c[2]+rt[2]*h*su+up[2]*h*sv]
    const v = new Float32Array([
      ...corner(-1,-1), 0,1,  ...corner(1,-1), 1,1,  ...corner(1,1), 1,0,
      ...corner(-1,-1), 0,1,  ...corner(1,1), 1,0,   ...corner(-1,1), 0,0,
    ])
    const vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)
    const buf = makeBuf(v)
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0)
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12)
    gl.bindVertexArray(null)
    trackVAOBuffers(vao, [buf])
    const tex = gl.createTexture()!
    quadVAOs.push({ vao, tex })
    fetch(file).then(r => r.ok ? r.blob() : Promise.reject())
      .then(b => createImageBitmap(b))
      .then(bm => {
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bm)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        loaded.add(tex)
      })
      .catch(() => {})   // offline: the dots still carry the sky
  }
}
const loaded = new Set<WebGLTexture>();

/** The image quads. The dots draw through the point pipeline in render/frame instead. */
export function drawSkyImages(projMat: Float32Array, viewMat: Float32Array, org: Float64Array): void {
  if (!quadVAOs.some(q => loaded.has(q.tex))) return
  gl.useProgram(pSky)
  gl.uniformMatrix4fv(US.proj, false, projMat)
  gl.uniformMatrix4fv(US.view, false, viewMat)
  gl.uniform3f(US.org, org[0], org[1], org[2])
  gl.uniform1i(US.tex, 0)
  gl.uniform1f(US.gain, 0.85)
  gl.activeTexture(gl.TEXTURE0)
  for (const q of quadVAOs) {
    if (!loaded.has(q.tex)) continue
    gl.bindTexture(gl.TEXTURE_2D, q.tex)
    gl.bindVertexArray(q.vao)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
  gl.bindVertexArray(null)
}

export const skyDotVAO = (): WebGLVertexArrayObject | null => dotVAO
