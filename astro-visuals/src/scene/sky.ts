/**
 * The real sky: the local stars, as measured.
 * The 100,000 brightest stars from AT-HYG 3.2 (Tycho-2 merged with Gaia DR3): 98.7%
 * carry Gaia DR3 parallax distances, Hipparcos covers the bright ones Gaia saturates
 * on. Rotated from equatorial into galactic coordinates and placed relative to the Sun,
 * with galactic l=90 on +x — the direction the Sun orbits — which an earlier build had
 * mirrored. Colours come from each star's measured colour index, sizes from apparent
 * magnitude. This is the local sky only: Gaia sees the Galaxy from inside, and the far
 * side of the disk is hidden behind dust, so the large-scale structure stays modelled.
 *
 *
 * Returns arrays rather than a vertex array, so this file needs no GL context — the loaders
 * that fetch the catalogues do the uploading.
 */

export interface StarCatalogue {
  n: number
  pos: Float32Array
  size: Float32Array
  col: Float32Array
  /** Proper motions, present only in the 'GSK2' layout; the older 16-byte one has none. */
  vel: Float32Array | null
}


export function parseStarBin(buf: ArrayBuffer): StarCatalogue {
  // 'GSK2': 20-byte records with a velocity; the old 16-byte layout still parses
  const v2 = buf.byteLength >= 4 && new DataView(buf).getUint32(0) === 0x47534B32;
  const off = v2 ? 4 : 0, rec = v2 ? 20 : 16;
  const n = Math.floor((buf.byteLength - off)/rec);
  const dv = new DataView(buf);
  const pos = new Float32Array(n*3), size = new Float32Array(n), col = new Float32Array(n*3);
  const vel = v2 ? new Float32Array(n*3) : null;
  for(let i=0;i<n;i++){
    const o = off + i*rec;
    pos[i*3]   = dv.getFloat32(o,   true);
    pos[i*3+1] = dv.getFloat32(o+4, true);
    pos[i*3+2] = dv.getFloat32(o+8, true);
    // the file stores hue and apparent magnitude; brightness and sprite size come
    // from the magnitude here, scaled to sit alongside the modelled star field
    const mag  = -2 + dv.getUint8(o+15)/255*14;
    const flux = Math.pow(2.512, (2 - mag)/2.5);
    const b    = Math.min(0.55, 0.042*flux);
    col[i*3]   = dv.getUint8(o+12)/255*b;
    col[i*3+1] = dv.getUint8(o+13)/255*b;
    col[i*3+2] = dv.getUint8(o+14)/255*b;
    size[i]    = Math.min(3.4, 0.72 + 0.9*Math.log10(1 + flux*4));
    if(vel){
      vel[i*3]   = dv.getInt8(o+16);
      vel[i*3+1] = dv.getInt8(o+17);
      vel[i*3+2] = dv.getInt8(o+18);
    }
  }
  return { n, pos, size, col, vel };
}
