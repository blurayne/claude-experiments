import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import REM_VS from '../../shaders/rem.vert?raw'
import REM_FS from '../../shaders/rem.frag?raw'

/**
 * What a death leaves behind.
 *
 * Supernova remnants and planetary nebulae were soft blobs. A remnant is a hollow shell, and a
 * hollow shell is brightest at its rim, where the line of sight runs longest through it — the
 * Veil, the Crab's edges, Cas A all read that way — and it is ragged, because the ejecta are.
 * Same transform as the point pass, both branches: remnants sit in the arms (wave-riding) and
 * planetaries anywhere in the disk (material). The fourth attribute packs the frame flag and
 * the phase: wave in the twos, phase in the fraction, so the shell can thicken and fray as it
 * runs without a fifth buffer.
 *
 * Program and table only; the draw is still in `frame()`. Step 10.
 */

export const pRem = prog(REM_VS, REM_FS);
export const UREM = {
  proj: gl.getUniformLocation(pRem,'uProj'), view: gl.getUniformLocation(pRem,'uView'),
  px: gl.getUniformLocation(pRem,'uPx'), spin: gl.getUniformLocation(pRem,'uSpin'),
  warp: gl.getUniformLocation(pRem,'uWarp'), cap: gl.getUniformLocation(pRem,'uCap'),
  sun: gl.getUniformLocation(pRem,'uSunPos'), org: gl.getUniformLocation(pRem,'uOrg')
};
