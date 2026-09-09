import { gl } from '../../gpu/context'
import { prog } from '../../gpu/program'
import PT_VS from '../../shaders/pt.vert?raw'
import PT_FS from '../../shaders/pt.frag?raw'
import TR_VS from '../../shaders/tr.vert?raw'
import TR_FS from '../../shaders/tr.frag?raw'

/**
 * The two programs almost everything is drawn with.
 *
 * `pPt` is the glowing point sprite — stars, the galaxy, Andromeda, the bodies, the life-cycle
 * events, Gliese 710, the engulfment flares. Its star profile follows Gaia Sky (MPL-2.0,
 * assets/shader/lib/star.glsl): a wide soft corona with a tight hot core, and the core lifts
 * the colour toward white, so a bright star reads as luminous rather than as a tinted disc.
 * Reimplemented, not copied.
 *
 * `pTr` is the trails, faded by vertex index.
 *
 * Only the programs and the locations live here for now — the draws are still in `frame()`,
 * which is what `00-PLAN.md` step 10 asks for. They cannot follow yet: six separate passes
 * write through this one table, each setting a uniform and setting it back, and they read a
 * dozen values apiece off the frame. They move once `render/frame` exists to hand those over.
 *
 * `U` stays one object with both programs' locations in it, exactly as it was. Splitting the
 * `tr*` half out belongs with `render/trails` at step 13, and a table that is half-moved is
 * worse than one that has not moved at all.
 */

export const pPt = prog(PT_VS,PT_FS), pTr = prog(TR_VS,TR_FS);
export const U = {
  ptProj: gl.getUniformLocation(pPt,'uProj'), ptView: gl.getUniformLocation(pPt,'uView'), ptPx: gl.getUniformLocation(pPt,'uPx'),
  ptSpin: gl.getUniformLocation(pPt,'uSpin'), ptWarp: gl.getUniformLocation(pPt,'uWarp'), ptSun: gl.getUniformLocation(pPt,'uSunPos'),
  ptOrg: gl.getUniformLocation(pPt,'uOrg'), trOrg: gl.getUniformLocation(pTr,'uOrg'),
  velT: gl.getUniformLocation(pPt,'uVelT'),
  ptCap: gl.getUniformLocation(pPt,'uCap'), ptWA: gl.getUniformLocation(pPt,'uWaveAll'),
  ptTime: gl.getUniformLocation(pPt,'uTime'), ptVM: gl.getUniformLocation(pPt,'uVarMode'),
  ptAnd: gl.getUniformLocation(pPt,'uAnd'), ptTide: gl.getUniformLocation(pPt,'uTide'),
  ptWarpAmp: gl.getUniformLocation(pPt,'uWarpAmp'), ptMinB: gl.getUniformLocation(pPt,'uMinB'),
  ptMinSz: gl.getUniformLocation(pPt,'uMinSz'), ptFade: gl.getUniformLocation(pPt,'uFadeOut'),
  ptGal: gl.getUniformLocation(pPt,'uGal'), ptGRot: gl.getUniformLocation(pPt,'uGRot'),
  ptGOff: gl.getUniformLocation(pPt,'uGOff'), ptMerge: gl.getUniformLocation(pPt,'uMerge'),
  ptArmAmp: gl.getUniformLocation(pPt,'uArmAmp'),
  ptAsm: gl.getUniformLocation(pPt,'uAsm'), ptChaos: gl.getUniformLocation(pPt,'uChaos'),
  ptRingAmp: gl.getUniformLocation(pPt,'uRingAmp'), ptRingT: gl.getUniformLocation(pPt,'uRingT'),
  ptRingC: gl.getUniformLocation(pPt,'uRingC'),
  trProj: gl.getUniformLocation(pTr,'uProj'), trView: gl.getUniformLocation(pTr,'uView'),
  trLen: gl.getUniformLocation(pTr,'uLen'), trCol: gl.getUniformLocation(pTr,'uColor'), trA: gl.getUniformLocation(pTr,'uAlpha'),
  trFlat: gl.getUniformLocation(pTr,'uFlat')
};
