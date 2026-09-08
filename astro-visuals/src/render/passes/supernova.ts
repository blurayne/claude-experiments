import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import SN_VS from '../../shaders/sn.vert?raw'
import SN_FS from '../../shaders/sn.frag?raw'

/**
 * The supernova blast.
 *
 * A collapse is not a big round star, and drawing it with the star sprite made it one: a white
 * disc that only grew. This is its own pass. The transform is the wave-riding branch of PT_VS,
 * copied rather than shared so the flash sits exactly where its progenitor stood — every
 * supernova here descends from a red supergiant on an arm, so aWave is always 1 and uGal
 * always 0, and the rest of that shader's work (velocities, variability, tides, the merge
 * scramble) has nothing to do here.
 *
 * Four things stacked, all keyed to how far the blast has run: the photosphere, the light
 * thrown off it, the shock front leaving it, and the spikes any bright point grows in an
 * optical system. The colour follows the real thing — blue-white at peak, reddening as the
 * ejecta expand and cool — so the flash reads as an event with a direction in time rather
 * than a lamp being turned up and down.
 *
 * Program and table only; the draw is still in `frame()`, interleaved with the events it
 * belongs to. Step 10.
 */

export const pSN = prog(SN_VS, SN_FS);
export const USN = {
  proj: gl.getUniformLocation(pSN,'uProj'), view: gl.getUniformLocation(pSN,'uView'),
  px: gl.getUniformLocation(pSN,'uPx'), spin: gl.getUniformLocation(pSN,'uSpin'),
  warp: gl.getUniformLocation(pSN,'uWarp'), cap: gl.getUniformLocation(pSN,'uCap'),
  sun: gl.getUniformLocation(pSN,'uSunPos'), org: gl.getUniformLocation(pSN,'uOrg')
};
