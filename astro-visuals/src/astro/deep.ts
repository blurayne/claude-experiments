import type { Vec3 } from '../core/mat4'
import { sgDir } from './supergalactic'
import { MPC2U } from './supercluster'
import { DEEP_CLUSTERS, DEEP_H0 } from './deep-data'
export { DEEP_H0 }

/**
 * The deep field: the 2MASS Redshift Survey (Huchra et al. 2012), read from data/2mrs.bin
 * when the eye goes far enough out to need it — 43,000-odd galaxies to ~650 million light
 * years, every one placed at its heliocentric cz over H0 = 74.6, which is a MODEL of distance
 * (the galaxy's own motion is in its velocity; the article says so). The binary's layout is
 * the tool's: an 8-byte header, then 6 bytes a galaxy. The great clusters are named from
 * `deep-data.ts`, each checked against the survey by the tool.
 */

export const DEEP_CZ_MAX = 15000

/** parse the binary into Sun-relative positions (scene units); null if it is not the tool's file */
export function parseDeep(buf: ArrayBuffer): { n: number; pos: Float32Array; cz: Float32Array } | null {
  if(buf.byteLength < 8) return null
  const dv = new DataView(buf)
  if(String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== '2MRS') return null
  const n = dv.getUint32(4, true)
  if(buf.byteLength < 8 + n*6) return null
  const pos = new Float32Array(n*3), cz = new Float32Array(n)
  for(let i=0;i<n;i++){
    const o = 8 + i*6
    const l = dv.getUint16(o, true)/100, b = dv.getInt16(o+2, true)/100, v = dv.getUint16(o+4, true)
    const d = v/DEEP_H0*MPC2U
    const u = sgDir(l, b)
    pos[i*3] = u[0]*d; pos[i*3+1] = u[1]*d; pos[i*3+2] = u[2]*d
    cz[i] = v
  }
  return { n, pos, cz }
}

export interface DeepCluster { name: string; pos: Vec3; ly: number; count: number; src: string }
export const DEEP_NAMED: readonly DeepCluster[] = DEEP_CLUSTERS.map(([name, sgl, sgb, cz, count, src]) => {
  const d = cz/DEEP_H0, u = sgDir(sgl, sgb)
  return { name, pos: [u[0]*d*MPC2U, u[1]*d*MPC2U, u[2]*d*MPC2U], ly: d*3.26156e6, count, src }
})

/** how much of the deep field shows: nothing at the supercluster's own view (5.2 million), all from 30 million out */
export function deepFade(camDist: number): number {
  const t = Math.min(1, Math.max(0, (camDist - 1.0e7)/(2.6e7 - 1.0e7)))
  return t*t*(3 - 2*t)
}
