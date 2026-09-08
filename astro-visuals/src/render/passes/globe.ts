import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import GLOBE_VS from '../../shaders/globe.vert?raw'
import GLOBE_FS from '../../shaders/globe.frag?raw'
import { AGE0 } from '../../astro/constants'
import {
  EARTH_AXIS, MOON_BORN, MOON_DIA, MOON_M1, MOON_M2,
  moonDist, moonPos, moonW, moonRel, plateMats, fillPlateMats, type EarthEra,
} from '../../astro/earth'
import { gfx } from '../state'
import { drawRings } from './rings'

/**
 * Earth as a globe, and the Moon, once either is more than a dot.
 *
 * A point sprite whose fragment builds the sphere: the normal from the sprite coordinate, the
 * lighting from the Sun's direction in view space, the surface from 3-D noise on the unit
 * vector in the planet's own frame (spin axis, prime meridian), so the planet turns under its
 * map and the map holds still. The Earth's surface is a MODEL of an era, not a map of the real
 * continents: coastlines are noise, drifting slowly with the age.
 *
 * The largest uniform table in the piece, and all of it is one draw call issued twice — once
 * for Earth, once for the Moon with three uniforms changed. Which is why the Moon is here
 * rather than in a pass of her own: she is this program with `uMoon` set to 1.
 */

const pGlobe = prog(GLOBE_VS, GLOBE_FS);
const UG: Record<string, WebGLUniformLocation | null> = {};
for(const k of ['uProj','uView','uPos','uSz','uSunV','uAxisV','uPrimeV','uAvg','uMirror','uDisc','uTime','uMoon',
  'uMolten','uOcean','uSea','uHaze','uVeg','uIceLat','uCloud','uLights','uDrift','uMap','uHasMap','uDry','uSeaLevel']) UG[k]=gl.getUniformLocation(pGlobe,k);
// Hand-written, and not folded into the loop above: an array uniform is addressed by its
// first element, and the name in the shader is not the name in the table.
UG.uPlate = gl.getUniformLocation(pGlobe,'uPlate[0]');

// The real map: today's land from GSHHG (tools/build_earth_map.py), R land, G plate id,
// B continentality. Loaded like the galaxy maps; without it the globe falls back to noise.
export function loadEarthMap(): void {
  fetch('earth-map.webp').then(r => r.ok ? r.blob() : Promise.reject())
    .then(b => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }))
    .then(bm => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bm);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null); gfx.earthTex = t;
    }).catch(()=>{});
}

const vaoGlobe = (()=>{ const v=gl.createVertexArray(); gl.bindVertexArray(v); gl.bindVertexArray(null); return v; })();
// A direction carried into view space, and normalised. The shader wants the Sun, the spin
// axis and the prime meridian as unit vectors in the eye's frame; nothing else needs these,
// so they stay here rather than joining core/mat4.
const vecV = (m: Float32Array, v: readonly number[]): number[] =>
  [m[0]*v[0]+m[4]*v[1]+m[8]*v[2], m[1]*v[0]+m[5]*v[1]+m[9]*v[2], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]];
const norm3 = (v: readonly number[]): number[] => { const l = Math.hypot(v[0],v[1],v[2]) || 1; return [v[0]/l, v[1]/l, v[2]/l]; };

export interface GlobeInputs {
  projMat: Float32Array
  viewMat: Float32Array
  /** Earth's age in Gyr — the plate reconstruction and the Moon's distance both read it */
  ageGyr: number
  /** what the surface looks like at that age, from astro/earth. The clock stays in main.ts */
  era: EarthEra
  /** Earth's position, Sun-relative, and her prime meridian: both already computed this frame */
  earthPos: readonly number[]
  prime: readonly number[]
  /** screen right is world right mirrored */
  mirror: number
  /** the variability clock — clouds drift on wall time, not simulated time */
  shimT: number
  simT: number
  /** how much of a day the frame can still resolve; below 1 the globe is lit on average */
  avgLight: number
  /** Earth's diameter in device pixels, and the camera's distance, for the Moon's own size */
  globePx: number
  camDist: number
  pxScale: number
  viewH: number
  dpr: number
  /** the rendering origin, so the Moon's world position can be made Sun-relative */
  org: Float64Array
}

/** What the pass computed that the rest of the frame needs back. */
export interface GlobeResult {
  /** the Moon's diameter in device pixels; 0 when she is not drawn */
  moonPx: number
  /** the three view-space directions and the era, for the debug door */
  earthDbg: { sunV: number[]; axV: number[]; prV: number[]; era: EarthEra }
}

/**
 * Draw Earth, then the Moon, then her orbit. Whether the planet is close enough to be worth
 * drawing at all is the frame's decision, not this one's — the caller guards the call.
 *
 * Opaque discs, so the same blend as the Sun's: the globe must occlude the sky behind it and
 * only the atmosphere adds over what is behind. The blend goes back to additive before the
 * orbit ring, exactly where it did before.
 */
export function drawGlobe(
  { projMat, viewMat, ageGyr, era, earthPos, prime, mirror, shimT, simT,
    avgLight, globePx, camDist, pxScale, viewH, dpr, org }: GlobeInputs,
): GlobeResult {
  const a = ageGyr;
  const ex = earthPos[0], ey = earthPos[1], ez = earthPos[2];
  const sunV = norm3(vecV(viewMat, [-ex, -ey, -ez]));
  const axV = norm3(vecV(viewMat, EARTH_AXIS));
  const prV = norm3(vecV(viewMat, [prime[0],prime[1],prime[2]]));
  const earthDbg = { sunV, axV, prV, era };   // read by the debug tooling
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(pGlobe);
  gl.uniformMatrix4fv(UG.uProj,false,projMat); gl.uniformMatrix4fv(UG.uView,false,viewMat);
  gl.uniform1f(UG.uMirror, mirror); gl.uniform1f(UG.uTime, shimT);
  gl.uniform3f(UG.uSunV, sunV[0],sunV[1],sunV[2]); gl.uniform3f(UG.uAxisV, axV[0],axV[1],axV[2]); gl.uniform3f(UG.uPrimeV, prV[0],prV[1],prV[2]);
  gl.uniform1f(UG.uAvg, avgLight);
  gl.uniform1f(UG.uMolten, era.molten); gl.uniform1f(UG.uOcean, era.ocean); gl.uniform1f(UG.uSea, era.sea); gl.uniform1f(UG.uHaze, era.haze);
  gl.uniform1f(UG.uVeg, era.veg); gl.uniform1f(UG.uIceLat, era.iceLat); gl.uniform1f(UG.uCloud, era.cloud); gl.uniform1f(UG.uLights, era.lights); gl.uniform1f(UG.uDrift, era.drift);
  gl.uniform1f(UG.uDry, era.dry); gl.uniform1f(UG.uSeaLevel, era.seaLevel);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, gfx.earthTex); gl.uniform1i(UG.uMap, 0);
  gl.uniform1f(UG.uHasMap, gfx.earthTex ? 1.0 : 0.0);
  fillPlateMats((a - AGE0)*1000); gl.uniformMatrix3fv(UG.uPlate, false, plateMats);
  const disc = 1/1.09, sz = Math.min(2400, globePx/disc);
  gl.uniform1f(UG.uMoon, 0.0); gl.uniform1f(UG.uDisc, disc); gl.uniform1f(UG.uSz, sz);
  gl.uniform3f(UG.uPos, ex, ey, ez);
  gl.bindVertexArray(vaoGlobe); gl.drawArrays(gl.POINTS, 0, 1);
  let moonPx = 0;
  if(a > MOON_BORN){
    // moonW and moonRel are astro/earth's own scratch buffers, and moonRel is an output:
    // the label pass reads the Moon's Sun-relative position from it later in the frame.
    moonPos(simT, moonW);
    moonRel[0] = moonW[0]-org[0]; moonRel[1] = moonW[1]-org[1]; moonRel[2] = moonW[2]-org[2];
    moonPx = MOON_DIA*pxScale/camDist;
    if(moonPx > 1.5){
      const msunV = norm3(vecV(viewMat, [-moonRel[0], -moonRel[1], -moonRel[2]]));
      gl.uniform3f(UG.uSunV, msunV[0],msunV[1],msunV[2]);
      gl.uniform1f(UG.uMoon, 1.0); gl.uniform1f(UG.uDisc, 1.0); gl.uniform1f(UG.uSz, Math.min(2400, moonPx));
      gl.uniform3f(UG.uPos, moonRel[0], moonRel[1], moonRel[2]);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }
  gl.blendFunc(gl.ONE, gl.ONE);
  // the Moon's orbit, once it spans more than a few pixels
  const d = moonDist(a), ringPx = 2*d*pxScale/camDist;
  if(a > MOON_BORN && ringPx > 14 && ringPx < 3*viewH*dpr){   // and not once it dwarfs the view
    drawRings({
      projMat, viewMat, centre: [ex, ey, ez], radius: d,
      colour: [0.16, 0.20, 0.30], planes: [[MOON_M1, MOON_M2]],
    });
  }
  return { moonPx, earthDbg };
}
