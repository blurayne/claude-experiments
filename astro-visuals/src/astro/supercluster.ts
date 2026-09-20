import type { Vec3 } from '../core/mat4'
import { skyBasis } from './gc'
import { KPC2U } from './merger'
import { sgDir, SG_SCENE } from './supergalactic'
import { SC_GROUPS_N, SC_GROUPS_PACKED, SC_NAMED, SC_GALAXIES } from './sc-data'

/**
 * Beyond the Local Group, to scale: the 8,826 groups of Kourkchi & Tully 2017 out to
 * 3,500 km/s (the Virgo Supercluster and the nearer cosmic web — Virgo, Fornax, Hydra,
 * Centaurus, the Local Void between) and the 869 galaxies of the Updated Nearby Galaxy
 * Catalog within ~11 Mpc, placed from their catalogue coordinates through the same frames
 * everything else uses. A group with a Cosmicflows distance sits at it; one without sits
 * at its Local-Sheet velocity over H0, which is a model of distance and is flagged as
 * such (`byVel`). The chart's cylinder stands on the supergalactic plane.
 */

export const MPC2U = 1000*KPC2U

/** the groups, unpacked: Sun-relative positions (scene units), luminosities, sizes */
export const SC = (() => {
  const bin = atob(SC_GROUPS_PACKED)
  const bytes = new Uint8Array(bin.length)
  for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i)
  const dv = new DataView(bytes.buffer)
  const n = SC_GROUPS_N
  const pos = new Float32Array(n*3), dMpc = new Float32Array(n), logK = new Float32Array(n), mem = new Uint16Array(n)
  const byVel = new Uint8Array(n), sgl = new Float32Array(n), sgb = new Float32Array(n)
  for(let i=0;i<n;i++){
    const o = i*10
    const l = dv.getUint16(o, true)/100, b = dv.getInt16(o+2, true)/100
    const dRaw = dv.getUint16(o+4, true)
    const d = (dRaw & 0x7fff)/100
    byVel[i] = dRaw >> 15
    logK[i] = dv.getInt16(o+6, true)/100
    mem[i] = dv.getUint16(o+8, true)
    sgl[i] = l; sgb[i] = b; dMpc[i] = d
    const v = sgDir(l, b)
    pos[i*3] = v[0]*d*MPC2U; pos[i*3+1] = v[1]*d*MPC2U; pos[i*3+2] = v[2]*d*MPC2U
  }
  return { n, pos, dMpc, logK, mem, byVel, sgl, sgb }
})()

/** a group's turnaround radius, Mpc, from its luminosity (Kourkchi & Tully 2017 eq. 6, R ∝ M^1/3; Virgo's 12.74 gives 1.55) */
export const groupRadiusMpc = (logK: number): number => 0.19*Math.cbrt(Math.pow(10, logK - 10))

export interface ScNamedGroup {
  i: number
  name: string
  kind: 'group' | 'cluster'
  check: string
  pos: Vec3
  dMpc: number
  ly: number
  rMpc: number
}
export const SC_GROUPS_NAMED: readonly ScNamedGroup[] = SC_NAMED.map(([i, name, kind, check]) => ({
  i, name, kind, check, pos: [SC.pos[i*3], SC.pos[i*3+1], SC.pos[i*3+2]], dMpc: SC.dMpc[i], ly: SC.dMpc[i]*3.26156e6, rMpc: groupRadiusMpc(SC.logK[i]),
}))

export interface ScGalaxy { name: string; pos: Vec3; dMpc: number; ly: number; k: number; kind: string; major: boolean }
/** the nearby galaxies: everything the catalogue names, the bright ones flagged for labels */
export const SC_GALS: readonly ScGalaxy[] = SC_GALAXIES.map(([name, ra, dec, d, k, kind]) => {
  const Z = skyBasis(ra, dec).Z
  const kk = k ?? 14
  return { name, pos: [Z[0]*d*MPC2U, Z[1]*d*MPC2U, Z[2]*d*MPC2U], dMpc: d, ly: d*3.26156e6, k: kk, kind, major: kk < 6.5 || kind === 'dark' }
})

/** the chart's cylinder: on the supergalactic plane, centred on us, 22 Mpc round, 12 Mpc up and down — Fornax and Eridanus sit at its floor */
export const SC_BOX = { centre: [0, 0, 0] as Vec3, radius: 22*MPC2U, halfH: 12*MPC2U, U: SG_SCENE.X, V: SG_SCENE.Y, W: SG_SCENE.Z }

/** how much of the supercluster shows: nothing at the Local Group's view (330,000), all from 2 million out */
export function scFade(camDist: number): number {
  const t = Math.min(1, Math.max(0, (camDist - 700000)/(2000000 - 700000)))
  return t*t*(3 - 2*t)
}
