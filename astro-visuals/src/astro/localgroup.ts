import type { Vec3 } from '../core/mat4'
import { skyBasis } from './gc'
import { sepScene, M31_DIR, KPC2U } from './merger'
import { LG_ROWS, type LgKind, type LgRow } from './lg-data'

/**
 * The Local Group, placed. Every member of `lg-data.ts` is put in its true direction from
 * the Sun — through the same J2000 chain the star catalogue, the black holes and the skybox
 * use — and, once the Group is in view, at its TRUE distance: Andromeda 765 kpc out, the
 * field dwarfs a megaparsec and more. That is not where the merger model draws Andromeda.
 * The model log-compresses separations beyond 83 kpc (`sepScene`), so that she looms at the
 * edge of the drawn sky instead of twenty-five disk diameters offstage, and the piece keeps
 * that for the views it was made for. The Group's layer therefore fades in only far outside
 * those views (`lgFade`), and as it fades in its members slide from the compressed depth to
 * the true one while the model's Andromeda fades out — so the two pictures never both
 * claim to be Andromeda, and the Group, once shown, is to scale. The article says all this.
 *
 * Sizes keep their ANGLE: each galaxy's half-light radius is drawn at the angular size it
 * has from the Sun, at whatever depth it is drawn, so from here the sky is right.
 * Brightness is not photometric — most of these are far below what any eye would see, and
 * they are drawn as markers of uniform visibility, brighter for the luminous ones, so the
 * Group can be seen at all. That, too, the article says.
 */

export interface LgMember {
  row: LgRow
  name: string
  kind: LgKind
  /** true distance, kpc and light years */
  kpc: number
  ly: number
  /** the direction from the Sun, unit */
  dir: Vec3
  /** drawn depth at the compressed rule and at true scale, scene units */
  dComp: number
  dTrue: number
  /** the outline's half-axes per unit of depth (tangents of the angles), and their directions */
  tanA: number
  tanB: number
  dirA: Vec3
  dirB: Vec3
  /** absolute V magnitude (a faint placeholder where unmeasured) and a display gain from it */
  Mv: number
  gain: number
  confirmed: boolean
  /** the chart's major names: the two spirals, the Clouds, the classical dwarfs — M_V ≤ −11 */
  major: boolean
  /** this frame's placement: filled by lgUpdate */
  pos: Float32Array
  A: Float32Array
  B: Float32Array
  a: number
  b: number
}

const LY_PER_KPC = 3261.56

export const LG: readonly LgMember[] = LG_ROWS.map(row => {
  const [name, ra, dec, kpc, rh, Mv0, pa, ell, kind, , confirmed] = row
  const { N, E, Z } = skyBasis(ra, dec)
  // the half-light radius at its angular size from the Sun; a minute of arc where unmeasured
  const tanA = Math.tan((rh > 0 ? rh : 1)/60*Math.PI/180)
  const tanB = tanA*(1 - Math.min(0.95, Math.max(0, ell)))
  const p = pa*Math.PI/180, cp = Math.cos(p), sp = Math.sin(p)
  const dirA: Vec3 = [N[0]*cp + E[0]*sp, N[1]*cp + E[1]*sp, N[2]*cp + E[2]*sp]
  const dirB: Vec3 = [E[0]*cp - N[0]*sp, E[1]*cp - N[1]*sp, E[2]*cp - N[2]*sp]
  const Mv = Mv0 ?? -1
  // a marker gain: the luminous ones brighter, the ultra-faints still there
  const gain = 0.35 + 0.65*Math.min(1, Math.max(0, (-Mv - 1)/17))
  return { row, name, kind, kpc, ly: kpc*LY_PER_KPC, dir: Z, dComp: sepScene(kpc), dTrue: kpc*KPC2U, tanA, tanB, dirA, dirB,
    Mv, gain, confirmed: confirmed === 1, major: Mv <= -11, pos: new Float32Array(3), A: new Float32Array(3), B: new Float32Array(3), a: 0, b: 0 }
})

/** Place every member for a blend `t` from the compressed depth (0) to true scale (1). */
export function lgUpdate(t: number): void {
  for(const m of LG){
    const d = m.dComp + (m.dTrue - m.dComp)*t
    m.pos[0] = m.dir[0]*d; m.pos[1] = m.dir[1]*d; m.pos[2] = m.dir[2]*d
    m.a = m.tanA*d; m.b = m.tanB*d
    for(let i=0;i<3;i++){ m.A[i] = m.dirA[i]*m.a; m.B[i] = m.dirB[i]*m.b }
  }
}
lgUpdate(1)

/** the members in the order the labels claim space: the luminous first */
export const LG_BY_LIGHT: readonly number[] = LG.map((_, i) => i).sort((i, j) => LG[i].Mv - LG[j].Mv)

/**
 * The box: a cylinder on the Galaxy's axis round the whole Group at true scale, as the
 * classic chart draws it — centred between the Milky Way and Andromeda, wide and tall enough
 * for every member with a little air.
 */
export const LG_BOX = (() => {
  const m31 = 765*KPC2U
  const centre: Vec3 = [M31_DIR[0]*m31*0.5, M31_DIR[1]*m31*0.5, M31_DIR[2]*m31*0.5]
  let r = 0, h = 0
  for(const m of LG){
    r = Math.max(r, Math.hypot(m.dir[0]*m.dTrue - centre[0], m.dir[2]*m.dTrue - centre[2]))
    h = Math.max(h, Math.abs(m.dir[1]*m.dTrue - centre[1]))
  }
  r = Math.max(r, Math.hypot(centre[0], centre[2]))*1.08   // the Milky Way itself is a member
  h = Math.max(h, Math.abs(centre[1]))*1.15
  return { centre, radius: r, halfH: h }
})()

/** true light years, written the way the charts write them */
export function lyLabel(ly: number): string {
  return ly >= 1e7 ? `${(ly/1e6).toFixed(1)} Mly` : ly >= 1e6 ? `${(ly/1e6).toFixed(2)} Mly` : `${Math.round(ly/1e3)} kly`
}

/**
 * How much of the Group shows at this camera distance: nothing within the Galaxy's own
 * views and the merger's (the Andromeda view sits at 9,500), all of it from 64,000 out.
 */
export function lgFade(camDist: number): number {
  const t = Math.min(1, Math.max(0, (camDist - 24000)/(64000 - 24000)))
  return t*t*(3 - 2*t)
}
