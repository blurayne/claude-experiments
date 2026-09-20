import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import RADIO_VS from '../../shaders/gcradio.vert?raw'
import RADIO_FS from '../../shaders/gcradio.frag?raw'
import { RADIO_GEOM } from '../../astro/gc'
import type { RadioKind } from '../../astro/gc-radio-data'

/**
 * The radio sky round the Centre: the objects of the wide-field 90-cm VLA map (LaRosa et al.
 * 2000), each a quad in its own sky plane at Sagittarius A*'s distance, drawn in the
 * Centre's frame with the Centre's view. Additive, through the map's heat ramp — see the
 * shader's header for what is data here (the forms, the positions, the sizes) and what is
 * not (the texture inside them).
 *
 * The field is a thing of the middle distances: from far out it is a speck in the bulge,
 * and from the S-star framing every object is off screen and larger than the screen. It
 * fades in as the eye comes within ~900 units (27,000 light years — the Sun's own distance
 * is 900) and out again inside three, where Sgr A's glow alone would be the whole view.
 */
const pR = prog(RADIO_VS, RADIO_FS)
const UR = {
  proj: gl.getUniformLocation(pR, 'uProj'), view: gl.getUniformLocation(pR, 'uView'),
  c: gl.getUniformLocation(pR, 'uC'), A: gl.getUniformLocation(pR, 'uA'), B: gl.getUniformLocation(pR, 'uB'),
  margin: gl.getUniformLocation(pR, 'uMargin'), kind: gl.getUniformLocation(pR, 'uKind'),
  bend: gl.getUniformLocation(pR, 'uBend'), core: gl.getUniformLocation(pR, 'uCore'),
  aspect: gl.getUniformLocation(pR, 'uAspect'), gain: gl.getUniformLocation(pR, 'uGain'),
  seed: gl.getUniformLocation(pR, 'uSeed'), fade: gl.getUniformLocation(pR, 'uFade'),
  size: gl.getUniformLocation(pR, 'uSize'), strands: gl.getUniformLocation(pR, 'uStrands'),
}
const vaoEmpty = gl.createVertexArray()!

const KIND_ID: Record<RadioKind, number> = { hii: 0, snr: 1, ntf: 2, pwn: 3, cluster: 4, galaxy: 5, core: 6, ridge: 7 }
const KIND_GAIN: Record<RadioKind, number> = { hii: 1.0, snr: 0.9, ntf: 0.7, pwn: 1.0, cluster: 0.5, galaxy: 1.0, core: 1.0, ridge: 0.5 }

const smooth = (a: number, b: number, x: number): number => { const t = Math.min(1, Math.max(0, (x - a)/(b - a))); return t*t*(3 - 2*t) }

/** How much of the field shows at this distance from the Centre: 0 far out, 0 close in. */
export function radioFade(distGC: number): number {
  return smooth(900, 300, distGC)*smooth(0.6, 3.0, distGC)
}

/**
 * Draw the field. `pxScale` and `distGC` set a floor on every outline's short axis — a
 * filament an arcminute wide is a pixel wide at the map's own framing, and less than one
 * from further out; below a pixel and a half it is widened and dimmed in proportion, so it
 * stays a line and not a flicker. Returns the fade the caller's labels follow.
 */
export function drawRadioField(proj: Float32Array, viewGC: Float32Array, distGC: number, pxScale: number): number {
  const fade = radioFade(distGC)
  if(fade < 0.002) return 0
  gl.useProgram(pR)
  gl.uniformMatrix4fv(UR.proj, false, proj)
  gl.uniformMatrix4fv(UR.view, false, viewGC)
  gl.uniform1f(UR.margin, 2.2)
  gl.bindVertexArray(vaoEmpty)
  const pxPerU = pxScale/distGC
  for(let k=0;k<RADIO_GEOM.length;k++){
    const g = RADIO_GEOM[k], o = g.obj
    // the short axis's floor, in pixels; the flux stays the same as the line widens
    const bPx = g.b*pxPerU, aPx = g.a*pxPerU
    const wb = Math.max(1, 1.5/Math.max(bPx, 1e-9)), wa = Math.max(1, 1.5/Math.max(aPx, 1e-9))
    const dim = 1/(wa*wb)
    // nothing smaller than a pixel across is worth a quad
    if(aPx*2 < 0.7) continue
    gl.uniform3f(UR.c, g.c[0], g.c[1], g.c[2])
    gl.uniform3f(UR.A, g.A[0]*wa, g.A[1]*wa, g.A[2]*wa)
    gl.uniform3f(UR.B, g.B[0]*wb, g.B[1]*wb, g.B[2]*wb)
    gl.uniform1f(UR.kind, KIND_ID[o.kind])
    gl.uniform1f(UR.bend, o.bend ?? 0)
    gl.uniform1f(UR.core, o.core ? 1 : 0)
    gl.uniform1f(UR.aspect, (g.a*wa)/(g.b*wb))
    gl.uniform1f(UR.gain, KIND_GAIN[o.kind]*(o.gain ?? 1)*dim)
    gl.uniform1f(UR.size, g.a*wa)
    gl.uniform1f(UR.strands, o.strands ?? 1)
    gl.uniform1f(UR.seed, k*1.37 + 0.5)
    gl.uniform1f(UR.fade, fade)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  gl.bindVertexArray(null)
  return fade
}
