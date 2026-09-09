import { gl } from '../gpu/context'
import { deleteVAO, pointVAO } from '../gpu/buffers'
import { parseStarBin } from './sky'
import { genGalaxy, genGalaxyMap, mapPick, mapXZ, MAP_SCALE } from './galaxy'
import {
  genAndromeda, genAndromedaMap, mapXZ31,
  R_A, M31_MAP_SCALE, M32_C, M110_C, GSS_DIR, M31_ARM_K,
} from './andromeda'
import { gfx } from '../render/state'

/** both densities kept once generated, so toggling back is instant */
const gxyCache: Record<string, any> = {};
/** the debug door lists them; nothing else looks inside */
export const galaxyKeys = (): string[] => Object.keys(gxyCache)

/**
 * What is on the GPU for the two galaxies, and how it got there.
 *
 * Three things live together here because they are one mechanism. The photographic density
 * MAPS turn a picture into a probability field; the GENERATORS sample it; and the CACHE keeps
 * the result per density tier, because regenerating two million points to go back to a tier
 * you were on a moment ago is a visible stall for no reason.
 *
 * The classic face-on Milky Way illustration is used as a probability map: stars are placed
 * where the picture is bright, with colours taken from its pixels; dust where its lanes are
 * dark; HII nebulae where it is pink. The shipped copy is mirrored so the arms trail the
 * pattern's rotation, and rotated so its bar sits at the scene's 28 degrees — both measured,
 * not guessed. The procedural generator remains the fallback offline, which is why every
 * loader ends in `.catch(()=>{})`: no network, no map, and the piece still runs.
 *
 * **The fetches are kicked from main.ts, not here.** Both map loaders call setGalaxy() from
 * their `.then()`, so whichever wins the race decides where the seeded PRNG stands when the
 * galaxy is generated — and the parity gate compares a seeded stream. Where the kick happens
 * is part of the picture.
 */

export function flushGxyCache(): void {
  for(const k of Object.keys(gxyCache)){ const o = gxyCache[k];
    deleteVAO(o.g); deleteVAO(o.nb); deleteVAO(o.d);
    deleteVAO(o.a.a); if(o.a.an) deleteVAO(o.a.an); if(o.a.ad) deleteVAO(o.a.ad);
    delete gxyCache[k]; }
}

// The classic face-on Milky Way illustration is used as a probability map: stars are
// placed where the picture is bright, with colours taken from its pixels; dust where its
// lanes are dark; HII nebulae where it is pink. The shipped copy is rotated so its bar
// sits at the scene's 28 degrees, but — despite what an earlier comment here claimed to
// have measured — it is NOT mirrored: its spiral winds outward-clockwise, which on the
// north-pole view would read as leading arms. mapXZ (scene/galaxy) therefore reflects
// every sample about the bar axis on ingest; the winding is pinned by pixel measurement
// in boot.spec ('the arms trail'). The procedural generator remains the fallback offline.

export function loadGalaxyMap(): void {
  fetch('galaxy-map.webp').then(r => r.ok ? r.blob() : Promise.reject())
    .then(b => createImageBitmap(b))
    .then(bm => {
      const n = 448, cv = document.createElement('canvas');
      cv.width = cv.height = n;
      const cx2 = cv.getContext('2d')!;
      cx2.drawImage(bm, 0, 0, n, n);
      const px = cx2.getImageData(0, 0, n, n).data;
      const lum = new Float32Array(n*n);
      for(let i=0;i<n*n;i++) lum[i] = (px[i*4]+px[i*4+1]+px[i*4+2])/765;
      // small separable blur: the smooth background, for lane-darkness and structuredness
      const blur = new Float32Array(lum), tb = new Float32Array(n*n);
      for(let pass=0; pass<3; pass++){
        for(let y=0;y<n;y++) for(let x=0;x<n;x++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=x+k; if(q>=0&&q<n){ s+=blur[y*n+q]; c++; } }
          tb[y*n+x]=s/c;
        }
        for(let x=0;x<n;x++) for(let y=0;y<n;y++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=y+k; if(q>=0&&q<n){ s+=tb[q*n+x]; c++; } }
          blur[y*n+x]=s/c;
        }
      }
      const c0 = (n-1)/2, R = 188.6;
      const star = new Float32Array(n*n), neb = new Float32Array(n*n), dust = new Float32Array(n*n);
      for(let i=0;i<n*n;i++){
        const x=i%n, y=(i/n)|0, r=Math.hypot(x-c0, y-c0);
        if(r > R*1.06) continue;
        const l = lum[i];
        star[i] = Math.pow(Math.max(0, l-0.012), 1.55);
        const pink = Math.max(0, px[i*4]/255 - (px[i*4+1]+px[i*4+2])/510);
        neb[i]  = pink*l;
        dust[i] = r>40 ? Math.max(0, blur[i]-l)*Math.min(1, l*4+0.2) : 0;
      }
      const cum = (a: Float32Array) => { const c=new Float32Array(a.length); let s=0;
        for(let i=0;i<a.length;i++){ s+=a[i]; c[i]=s; } return c; };
      gfx.galaxyMap = { n, px, lum, blur, starC:cum(star), nebC:cum(neb), dustC:cum(dust) };
      // whatever is cached was built procedurally: rebuild the active density from the map
      flushGxyCache();
      setGalaxy(gfx.curD);
    })
    .catch(()=>{});   // opened from disk: the procedural galaxy stands in
}
export function setGalaxy(D: number): void {
  const key = (gfx.galaxyMap ? 'm' : 'p') + (gfx.m31Map ? 'M' : 'q') + D;
  if(!gxyCache[key]){
    const b = (gfx.galaxyMap ? genGalaxyMap : genGalaxy)(D);
    const gv = pointVAO(b.star.pos, b.star.size, b.star.col, b.star.wave);
    const nv = pointVAO(b.neb.pos, b.neb.size, b.neb.col, b.neb.wave);   // spur puffs carry the slow-pattern flag
    const dv = pointVAO(b.dust.pos, b.dust.size, b.dust.str);
    // Andromeda's buffers come back unuploaded now, so the three VAOs are built here — the
    // only place that knows both what was generated and how to put it on the GPU.
    const ab = (gfx.m31Map ? genAndromedaMap : genAndromeda)(D);
    const av = {
      a: pointVAO(ab.star.pos, ab.star.size, ab.star.col, ab.star.wav),
      an: ab.neb ? pointVAO(ab.neb.pos, ab.neb.size, ab.neb.col) : null,
      ad: ab.dust ? pointVAO(ab.dust.pos, ab.dust.size, ab.dust.str) : null,
      // The procedural fallback draws no nebulae or dust, and says so with zeros rather than
      // leaving whatever a previous map-based build left in gfx.
      n: ab.neb ? [gfx.N_AND, gfx.N_ANDN, gfx.N_ANDD] : [gfx.N_AND, 0, 0],
    };
    gxyCache[key] = { D, n:[gfx.N_GXY,gfx.NEB_N,gfx.DUST_N], seg:[gfx.NEB_PINK,gfx.NEB_GLOW,gfx.AND_PINK,gfx.AND_GLOW], nuc:[gfx.NUC0,gfx.NUC1], g:gv, nb:nv, d:dv, a:av };
    // uploaded; the CPU copies go out of scope with the record the generator returned
  }
  // the cheap densities stay cached; only one heavy one is kept at a time
  for(const k of Object.keys(gxyCache)){
    if(gxyCache[k].D >= 12 && k !== key){
      const old = gxyCache[k];
      deleteVAO(old.g); deleteVAO(old.nb); deleteVAO(old.d);
      deleteVAO(old.a.a); if(old.a.an) deleteVAO(old.a.an); if(old.a.ad) deleteVAO(old.a.ad);
      delete gxyCache[k];
    }
  }
  const c=gxyCache[key];
  gfx.N_GXY=c.n[0]; gfx.NEB_N=c.n[1]; gfx.DUST_N=c.n[2];
  [gfx.NEB_PINK, gfx.NEB_GLOW, gfx.AND_PINK, gfx.AND_GLOW] = c.seg;
  [gfx.NUC0, gfx.NUC1] = c.nuc || [0, 0];
  gfx.N_AND=c.a.n[0]; gfx.N_ANDN=c.a.n[1]; gfx.N_ANDD=c.a.n[2];
  gfx.vaoGxy=c.g; gfx.vaoNeb=c.nb; gfx.vaoDust=c.d; gfx.curD=D;
  gfx.vaoAnd=c.a.a; gfx.vaoAndNeb=c.a.an; gfx.vaoAndDust=c.a.ad;
  if(D >= 5) loadGaiaDeep();
}

// The clouds — the nebulae and the dust lanes — are render/passes/nebula and passes/dust.
// They are always drawn as a pair, in the same order, from the same values, which is what
// their shared CloudFrame is: the per-frame context, discovered rather than designed.
// setGalaxy(1) is called after the Andromeda section below: its constants
// (R_A, the satellite offsets) are const bindings the generator needs live.

// ---------- Andromeda ----------
// M31 drawn the way the Milky Way is: from a photographic probability map. m31-map.webp
// is the Hubble PHAT+PHAST panorama (heic2501a, ~200 million resolved stars) deprojected
// to face-on by tools/build_m31_map.py — stars sampled from its luminance, dust from its
// dark lanes, HII regions from its blue excess (the mosaic's filter palette codes them
// blue-white; they are drawn in Hα pink like our own). Only sky-plane positions are
// measured: the third dimension — disk thickness, bulge, halo — is modelled, and the
// info panel says so. Positions are generated in M31's own flat disk frame; its real
// orientation (uGRot) and moving centre (uGOff) are applied in the shader.
export function loadM31Map(): void {
  fetch('m31-map.webp').then(r => r.ok ? r.blob() : Promise.reject())
    .then(b => createImageBitmap(b))
    .then(bm => {
      const n = 448, cv = document.createElement('canvas');
      cv.width = cv.height = n;
      const cx2 = cv.getContext('2d')!;
      cx2.drawImage(bm, 0, 0, n, n);
      const px = cx2.getImageData(0, 0, n, n).data;
      const lum = new Float32Array(n*n);
      for(let i=0;i<n*n;i++) lum[i] = (px[i*4]+px[i*4+1]+px[i*4+2])/765;
      const blur = new Float32Array(lum), tb = new Float32Array(n*n);
      for(let pass=0; pass<3; pass++){
        for(let y=0;y<n;y++) for(let x=0;x<n;x++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=x+k; if(q>=0&&q<n){ s+=blur[y*n+q]; c++; } }
          tb[y*n+x]=s/c;
        }
        for(let x=0;x<n;x++) for(let y=0;y<n;y++){
          let s=0,c=0; for(let k=-2;k<=2;k++){ const q=y+k; if(q>=0&&q<n){ s+=tb[q*n+x]; c++; } }
          blur[y*n+x]=s/c;
        }
      }
      // A second, wider blur for the arms only (box 9, four passes, ~20 px): the arms are
      // 15–25 px wide in this map, and a ridge is only as tall as the blur it is measured
      // against. The 5-px blur above stays as it is — the dust lanes and the wave flag read it.
      const wide = new Float32Array(lum);
      for(let pass=0; pass<4; pass++){
        for(let y=0;y<n;y++) for(let x=0;x<n;x++){
          let s=0,c=0; for(let k=-4;k<=4;k++){ const q=x+k; if(q>=0&&q<n){ s+=wide[y*n+q]; c++; } }
          tb[y*n+x]=s/c;
        }
        for(let x=0;x<n;x++) for(let y=0;y<n;y++){
          let s=0,c=0; for(let k=-4;k<=4;k++){ const q=y+k; if(q>=0&&q<n){ s+=tb[q*n+x]; c++; } }
          wide[y*n+x]=s/c;
        }
      }
      const c0 = (n-1)/2, R = 188.6;
      const star = new Float32Array(n*n), neb = new Float32Array(n*n), dust = new Float32Array(n*n);
      const haze = new Float32Array(n*n), ridge = new Float32Array(n*n);
      for(let i=0;i<n*n;i++){
        const x=i%n, y=(i/n)|0, r=Math.hypot(x-c0, y-c0);
        if(r > R*1.06) continue;
        const l = lum[i];
        // The arms are ridges: brighter than their own neighbourhood, by a fraction that the
        // picture carries at only 10–20% over most of the disk. Raising the luminance to a
        // power favours the bulge, not the arms; so the stars are weighted by how far a
        // pixel rises above its blur — zero on the smooth disk and in the bulge's centre,
        // where nothing rises above anything — and the haze keeps the unboosted weight, so
        // the unresolved light between the arms stays the smooth thing it is.
        // clamped: a handful of pixels rise 2× above their surroundings (single clumps),
        // and without the clamp they alone would carry a tenth of the disk's stars
        ridge[i] = Math.min(0.3, Math.max(0, l - wide[i]) / (wide[i] + 0.04));
        const base = Math.pow(Math.max(0, l-0.012), 1.5);
        star[i] = base * (1 + M31_ARM_K*ridge[i]);
        haze[i] = base * (1 + 0.6*M31_ARM_K*ridge[i]);   // the unresolved light follows the arms too
        // the Hubble palette codes HII and young stars blue-white: read the blue excess
        const be = Math.max(0, px[i*4+2]/255 - (px[i*4]+px[i*4+1])/510 - 0.02);
        neb[i]  = be*l*(1 + M31_ARM_K*ridge[i]);   // the HII knots are what trace an arm in any photograph
        dust[i] = r>28 ? Math.max(0, blur[i]-l)*Math.min(1, l*4+0.2) : 0;
      }
      const cum = (a: Float32Array) => { const c=new Float32Array(a.length); let s=0;
        for(let i=0;i<a.length;i++){ s+=a[i]; c[i]=s; } return c; };
      gfx.m31Map = { n, px, lum, blur, ridge, starC:cum(star), hazeC:cum(haze), nebC:cum(neb), dustC:cum(dust) };
      flushGxyCache();
      setGalaxy(gfx.curD);
    })
    .catch(()=>{});   // opened from disk: the schematic Andromeda stands in
}

export function loadGaiaStars(): void {
  fetch('stars-gaia.bin').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(buf => { const s = parseStarBin(buf);
      gfx.vaoGaia = pointVAO(s.pos, s.size, s.col, undefined, s.vel ?? undefined); gfx.N_GAIA = s.n; })
    .catch(()=>{});   // opened from disk, where fetch is blocked: the modelled sky stands in
}

export function loadGaiaDeep(): void {
  // the next 400,000 stars, 8 MB — fetched once, the first time a heavy quality is chosen
  if(gfx.deepAsked) return; gfx.deepAsked = true;
  fetch('stars-gaia-deep.bin').then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(buf => { const s = parseStarBin(buf);
      gfx.vaoGaiaDeep = pointVAO(s.pos, s.size, s.col, undefined, s.vel ?? undefined); gfx.N_GAIA_DEEP = s.n; })
    .catch(()=>{ gfx.deepAsked = false; });
}
loadGaiaStars();
loadGalaxyMap();
loadM31Map();
