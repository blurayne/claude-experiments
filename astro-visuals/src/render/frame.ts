import { $ } from '../core/dom'
import { lookAt, mul, perspective, MAT3_ID, type Vec3 } from '../core/mat4'
import {
  R_GAL, V_GAL, AGE0, AU2U, REAL_MODE, TILT, E1, E2, RC_BAR, ARM_EVO_AMP, T_BIG_BANG, asmAt, chaosAt,
} from '../astro/constants'
import { BODIES, NB, N_PLANETS, I_P9, bodyPos, tmp, earthW } from '../astro/bodies'
import { EAT_AGES, sunState, sunTint, pnState, type PnState } from '../astro/sun'
import {
  M31_DIR, M31_E2, M31_ROT, KPC2U, MERGE_T0, M31_RING, orbitUV, sepScene, mergeAt, diskSpin,
} from '../astro/merger'
import {
  EARTH_AXIS, MOON_BORN, MOON_DIA, moonPos, moonW, moonRel, earthEra,
} from '../astro/earth'
import { canvas, gl } from '../gpu/context'
import { cam, gfx, lifeAcc, readout, simClock, view, SKY_MIRROR } from './state'
import { hud, updateHud } from '../ui/hud'
import { N_STAR } from '../scene/starfield'
import { drawNebula, type CloudFrame, type Which } from './passes/nebula'
import { drawSkyImages, N_SKYDOTS, skyDotVAO } from '../scene/skybox'
import { drawDust } from './passes/dust'
import { pPt, U } from './passes/points'
import { drawBelts } from './passes/belts'
import { drawBodies, bodyPosArr, bodyCol, realSizes, uploadBodySize, uploadSunColour, uploadBodyPositions } from './passes/bodies'
import { drawGlobe } from './passes/globe'
import { drawG710 } from './passes/g710'
import { drawShed, drawSunDisc } from './passes/sun'
import { drawEatFlash } from './passes/eatflash'
import { bindHDR, resolveTone } from './passes/tone'
import { drawTrails, pushTrail, refillTrails, uploadTrails, trailAnchor, TRAIL_N } from './trails'
import { drawLabels } from './labels'
import { drawEvents, drawRemnants, events, puffs, lifeStep } from './lifecycle'

/**
 * The frame.
 *
 * Everything that happens between one screen refresh and the next: advance the clock, take the
 * trail samples, move the bodies, build the camera, then issue one call per pass in the order
 * the picture requires. Nothing here draws anything itself any more — every `draw*` is a
 * module, and what is left is the sequence and the arithmetic that decides it.
 *
 * Two per-frame context objects are built here and handed to the passes that need them. They
 * were discovered from what those passes actually read rather than designed up front, which is
 * why `CloudFrame` has exactly fifteen fields and not a general-purpose bag.
 *
 * The clock wrappers are injected. They close over the simulation clock and belong to the
 * model; this module sequences drawing.
 */

let ageGyr: () => number = () => 0
let environment: () => { mean: number } = () => ({ mean: 0 })
let earthPrime: (t: number, out: Float64Array) => Float64Array = (_t, out) => out
let g710: () => { x: number; y: number; z: number; d: number } = () => ({ x:0, y:0, z:0, d: Infinity })
let onProbeReady: () => void = () => {}
/**
 * The star field's vertex array. It is built in main.ts because it is the FIRST of the seven
 * things that consume randomness at boot, and where that happens is fixed; the frame only
 * draws it.
 */
let vaoStars: WebGLVertexArrayObject

/** while a pointer is down the clock holds — render/camera reports it */
let holding = false
export const setHolding = (h: boolean): void => { holding = h }

/** the rendering origin: the Sun, in double precision */
export const org=new Float64Array(3); // rendering origin: the Sun, in double precision
const sunSizeTmp=new Float32Array(1), eatSizeTmp=new Float32Array(1);
const andPos = new Float32Array(3);
function updateAnd(){
  const a = ageGyr();
  const [u,v] = orbitUV(a);
  const kpc = Math.hypot(u, v);
  const sep = sepScene(Math.max(kpc, 1e-4));
  const s = sep/Math.max(kpc, 1e-6)/KPC2U;         // plane kpc -> scene, compression included
  for(let k=0;k<3;k++) andPos[k] = (u*M31_DIR[k] + v*M31_E2[k])*KPC2U*s;
  const tide = Math.min(1, Math.max(0, 1 - kpc/260));
  return { sep, kpc, tide, merge: mergeAt(a) };
}

// to tell the clock running across an engulfment from a jump past it
const wasEaten = [false,false,false,false], eatFlash = [-1,-1,-1,-1];   // -1: no flare running

// the one way a projection is built: frame() rebuilds it every frame for its near plane
export function skyProjection(near: number, far: number): Float32Array { const m = perspective(Math.PI/3, view.W/view.H, near, far); m[0] *= SKY_MIRROR; return m; }

export function spinFrame(): ArrayLike<number>[] { const A = EARTH_AXIS, P = earthPrime(simClock.simT, cam.spinP); return [P, A, [A[1]*P[2]-A[2]*P[1], A[2]*P[0]-A[0]*P[2], A[0]*P[1]-A[1]*P[0]]]; }

let probeFrames = 0;

function frame(now: number): void {
  const dt = Math.min(0.05,(now-simClock.last)/1000); simClock.last=now;
  simClock.shimT += dt; // variables keep twinkling even while the simulation is paused
  const drive = simClock.shuttle !== 0 ? simClock.shuttle/100 : (simClock.paused ? 0 : 1);   // the shuttle outranks pause
  const sign = Math.sign(drive);
  if(sign !== simClock.shuttleLastSign){           // a change of direction: the swept path is recomputed
    simClock.shuttleLastSign = sign;               // for this moment, not extended from a stale end
    if(sign !== 0){ refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }
  }
  let n=0;                                // trail samples taken this frame; read below
  if(drive !== 0 && !holding){
    simClock.simT += dt*simClock.speed*simClock.speedMult*drive;
    if(simClock.simT < T_BIG_BANG) simClock.simT = T_BIG_BANG;   // nothing to draw before the universe
    // the clock in years a second decides whether the globe still has days (see uAvg)
    { const yps = simClock.speed*simClock.speedMult*Math.abs(drive); const want = Math.max(0, Math.min(1, (Math.log10(Math.max(1e-9, yps)) + 1.3)));
      readout.avgLight += (want - readout.avgLight)*Math.min(1, dt*4); }
    if(drive < 0){
      // backwards: the trail is the path swept up to now, so it retracts — recomputed
      // from the clock at ~10 Hz rather than every frame (2400 samples a body)
      if(now - simClock.trailRefillAt > 100){ simClock.trailRefillAt = now; refillTrails(); }
      simClock.nextSample = simClock.simT + simClock.dtSample;
    } else {
    while(simClock.nextSample<=simClock.simT && n<400){
      for(let i=0;i<NB;i++) pushTrail(i,simClock.nextSample);
      simClock.nextSample+=simClock.dtSample; n++;
    }
    if(simClock.nextSample<=simClock.simT) simClock.nextSample=simClock.simT+simClock.dtSample; // skip backlog at extreme speeds
    }
    // While zoomed into the system, drift between the Sun and the trail anchor eats the
    // float precision that the anchor exists to protect. Re-anchor once it passes a
    // third of a unit, at most once a second — a rebuild is a few milliseconds.
    if(cam.dist < 0.13 && now - simClock.lastAnchor > 1000){
      const dx=org[0]-trailAnchor[0], dy=org[1]-trailAnchor[1], dz=org[2]-trailAnchor[2];
      if(dx*dx+dy*dy+dz*dz > 0.09){ simClock.lastAnchor = now; refillTrails(); simClock.nextSample = simClock.simT + simClock.dtSample; }
    }
    if(n>0) uploadTrails();
    if(hud.lifeOn) lifeStep({ dt, dtSim: dt*simClock.speed*simClock.speedMult, ageGyr: ageGyr(), evBirth: hud.evBirth, evSN: hud.evSN });
  }

  // body positions, stored relative to the Sun (the rendering origin) — exact in doubles,
  // so a real-scale zoom to sub-AU distances is free of float32 jitter
  bodyPos(0,simClock.simT,org);
  for(let i=0;i<NB;i++){
    bodyPos(i,simClock.simT,tmp);
    bodyPosArr[i*3]=tmp[0]-org[0]; bodyPosArr[i*3+1]=tmp[1]-org[1]; bodyPosArr[i*3+2]=tmp[2]-org[2];
  }
  if(REAL_MODE){ // the Sun's sprite: true diameter once close enough, else a small findable dot
    // realSizes[0] is the Sun's diameter today; the model scales it, so a red giant is
    // drawn at the size the model says it has rather than at a fixed dot
    const sunDia = realSizes[0]*sunState(ageGyr()).R;
    readout.plasmaSunPx = sunDia*((view.H*view.DPR)/(2*Math.tan(Math.PI/6)))/readout.camSunDist;   // the camera's distance to the SUN: from Earth it is an AU
    readout.globePx = realSizes[3]*((view.H*view.DPR)/(2*Math.tan(Math.PI/6)))/cam.dist;
    // the findable dot stands down once the true disc takes over
    sunSizeTmp[0] = readout.plasmaSunPx > 7 ? 0.0 : Math.max(sunDia, readout.camSunDist*0.0075);
    uploadBodySize(0, sunSizeTmp);
  }
  // The Sun's colour, and the inner planets' fate. Both read the same model.
  const ssNow = sunState(ageGyr()), tint = sunTint(ssNow.T);
  bodyCol[0]=tint.dot[0]; bodyCol[1]=tint.dot[1]; bodyCol[2]=tint.dot[2];
  {
    // Engulfment latches on age, never on the current radius (the Sun shrinks again
    // after the tip; the planet does not come back). A flare starts only when the clock
    // runs across the moment — a jump that lands past it finds the planet already gone.
    const a = ageGyr(), jumped = Math.abs(a - simClock.lastAgeSeen) > 0.05;
    for(let i=1;i<=3;i++){
      const now = a >= EAT_AGES[i];
      if(now && !wasEaten[i] && !jumped) eatFlash[i] = 0;
      if(!now) eatFlash[i] = -1;
      wasEaten[i] = now;
      if(eatFlash[i] >= 0){ eatFlash[i] += dt; if(eatFlash[i] > 1.6) eatFlash[i] = -1; }
      // hidden for good once inside; the flare is its own pass over the disc — and Earth's
      // dot stands down while the globe is drawn in its place
      eatSizeTmp[0] = now ? 0 : (i === 3 && readout.globePx > 4) ? 0 : realSizes[i];
      uploadBodySize(i, eatSizeTmp);
    }
    simClock.lastAgeSeen = a;
  }
  uploadSunColour();
  uploadBodyPositions();

  // camera — the view matrix is built Sun-relative for the same precision reason
  // Earth's world position in doubles: the follow target when the view is hers
  bodyPos(3, simClock.simT, earthW);
  const moonHere = cam.followTarget === 'moon' && !wasEaten[3] && ageGyr() > MOON_BORN;
  if(moonHere) moonPos(simClock.simT, moonW);                                  // the camera needs her before the draw does
  const followPos = cam.followTarget === 'and' ? andPos
                  : moonHere ? moonW
                  : ((cam.followTarget === 'earth' || cam.followTarget === 'moon') && !wasEaten[3]) ? earthW : org;
  const goal = cam.follow ? [followPos[0],followPos[1],followPos[2]] : [0,0,0];
  if(cam.reseedFollow){ for(let i=0;i<3;i++) cam.smoothOfs[i] = cam.smoothTarget[i]-goal[i]; cam.reseedFollow=false; }
  const k = cam.firstFrame?1:Math.min(1,dt*4);
  for(let i=0;i<3;i++) cam.smoothOfs[i] *= 1-k;
  { // cap the transition offset at 20% of the view distance, so deep zooms never lose the Sun
    const lag=Math.hypot(cam.smoothOfs[0],cam.smoothOfs[1],cam.smoothOfs[2]), maxLag=cam.dist*0.2;
    if(lag>maxLag){ const f=maxLag/lag; cam.smoothOfs[0]*=f; cam.smoothOfs[1]*=f; cam.smoothOfs[2]*=f; }
  }
  for(let i=0;i<3;i++) cam.smoothTarget[i] = goal[i]+cam.smoothOfs[i];
  // log-space zoom smoothing: uniform speed per decade across 11 orders of magnitude
  cam.dist = Math.exp(Math.log(cam.dist)+(Math.log(cam.distGoal)-Math.log(cam.dist))*Math.min(1,dt*4));
  cam.firstFrame=false;
  let baseYaw = 0, basePitch = 0;
  if(cam.coreLock){
    // the direction from the core out to the Sun: put the eye further along it, so the
    // line of sight runs eye -> Sun -> galactic centre
    const r = Math.hypot(org[0], org[1], org[2]) || 1;
    baseYaw = Math.atan2(org[0], org[2]);
    basePitch = Math.asin(Math.max(-1, Math.min(1, org[1]/r)));
  }
  // The galaxy spin lock: with nothing followed, the spin-lock checkbox rides the camera
  // on the BAR pattern — the one the four arms are driven by — so the arms hold still on
  // screen and what remains visible is the evolution itself: the beat waxing and waning,
  // material stars and star-forming events sweeping through the frozen pattern. The angle
  // is exactly the shader's own for wave points, uSpin/RC_BAR; the toggle handler in
  // ui/hud re-expresses the yaw at the flip so the view never jumps.
  const galLockA = cam.spinLock && !cam.follow ? diskSpin(simClock.simT)/RC_BAR : 0;
  const yawE = cam.yaw + baseYaw + galLockA;
  const pitchE = Math.max(-1.45, Math.min(1.45, cam.pitch + basePitch));
  const cp=Math.cos(pitchE), sp=Math.sin(pitchE);
  // the pan: a screen-space offset, so it rides the camera's right and up at this distance.
  // Screen right is world right mirrored (SKY_MIRROR), and dragging the scene right means
  // the target goes left, hence the signs. tan(30°)·2 = the view's height over its distance.
  const sy = Math.sin(yawE), cy = Math.cos(yawE);
  let rx = cy, ry = 0, rz = -sy;                                        // right, in the plane
  let ux = -sp*sy, uy = cp, uz = -sp*cy;                                // up, tilted with the pitch
  let dx = cp*sy, dy = sp, dz = cp*cy, upV: ArrayLike<number> = [0,1,0];                   // the eye's direction from the target
  const spinOn = cam.spinLock && cam.follow && cam.followTarget === 'earth' && !wasEaten[3];
  if(spinOn){
    // the same three vectors, but in the planet's frame: x → prime meridian P, y → axis A,
    // z → −Q (so the frame keeps the world's handedness); the frame turns with the spin
    const [P, A, Q] = spinFrame();
    rx = cy*P[0]+sy*Q[0]; ry = cy*P[1]+sy*Q[1]; rz = cy*P[2]+sy*Q[2];
    ux = -sp*sy*P[0]+cp*A[0]+sp*cy*Q[0]; uy = -sp*sy*P[1]+cp*A[1]+sp*cy*Q[1]; uz = -sp*sy*P[2]+cp*A[2]+sp*cy*Q[2];
    dx = cp*sy*P[0]+sp*A[0]-cp*cy*Q[0]; dy = cp*sy*P[1]+sp*A[1]-cp*cy*Q[1]; dz = cp*sy*P[2]+sp*A[2]-cp*cy*Q[2];
    upV = A;
  }
  cam.dirW[0] = dx; cam.dirW[1] = dy; cam.dirW[2] = dz;                     // read by the spin lock's switch
  const pv = 1.1547*cam.dist, pdx = -cam.panF[0]*pv*SKY_MIRROR, pdy = cam.panF[1]*pv;
  const tgx=cam.smoothTarget[0]-org[0] + rx*pdx + ux*pdy,
        tgy=cam.smoothTarget[1]-org[1] + ry*pdx + uy*pdy,
        tgz=cam.smoothTarget[2]-org[2] + rz*pdx + uz*pdy;
  const eye=[ tgx+cam.dist*dx, tgy+cam.dist*dy, tgz+cam.dist*dz ];
  readout.camSunDist = Math.hypot(eye[0], eye[1], eye[2]) || cam.dist;   // Sun-relative eye: how far the Sun is
  // lookAt wants three-component vectors; these are built as three-element literals and as
  // the planet's own axis, and TypeScript cannot see the length of either.
  const viewMat = lookAt(eye as unknown as Vec3, [tgx,tgy,tgz], upV as unknown as Vec3);
  // near plane tracks the zoom so sub-AU views don't clip
  view.projMat = skyProjection(Math.min(0.5, Math.max(1e-13, cam.dist*0.04)), 25000);   // no depth buffer: a tiny near plane costs nothing, and Earth needs it
  const pxScale = (view.H*view.DPR)/(2*Math.tan(Math.PI/6));

  // at 100% nothing is compressed, so the old direct path is kept exactly
  const toneOn = view.hdrOK && hud.coreKnee < 0.999;
  if(toneOn) bindHDR();
  gl.clear(gl.COLOR_BUFFER_BIT);

  // points: stars, galaxy, bodies
  gl.useProgram(pPt);
  gl.uniformMatrix4fv(U.ptProj,false,view.projMat);
  gl.uniformMatrix4fv(U.ptView,false,viewMat);
  const and = updateAnd();
  const gl710 = g710();   // read by the Oort brightening before the star is drawn
  const deep = REAL_MODE && cam.dist<1.0; // inside ~30 ly: keep the backdrop point-like
  // Inside the disk the band's light — haze, HII regions, the core — all lies BEHIND
  // the local dust: that is the Great Rift. So from in here the whole backdrop goes
  // down first and the dust over it; from outside the arms' HII knots sit on top of
  // the lanes and are drawn after (v2.56.1). Same zone as the haze fade's.
  const insideDisk = cam.dist < 45;
  // every disk star travels at the same flat-curve speed as the Sun, and an elliptical
  // does not rotate coherently: the rate dies away as the remnant relaxes. diskSpin()
  // is that rate's integral, so the angle only ever grows (never zero either — uSpin==0.0
  // is the shader's "not a galaxy" gate).
  const spin = diskSpin(simClock.simT);
  const warp = -2*Math.PI*simClock.simT/650e6; // warp precession: retrograde, ~650 Myr per turn
  const spinMW  = spin;
  // M31's flat curve runs ~7% faster in angular terms. Its rigid rate goes through the
  // shader's RC_BAR divisor, so the factor carries 650/640 from the v3.1 pattern-radius
  // change to keep the drawn rate exactly what it was.
  const spinM31 = spin*1.087;
  // M31's collision rings: the phase is distance-travelled SINCE TODAY, so the shader's
  // modulation is exactly zero at simT=0 and the photographic map is untouched. Scrubbed
  // backward the crests contract toward the impact point, reaching it at the plunge
  // (~210 Myr ago) and holding there for earlier times — the waves have no earlier history.
  const ringT = Math.max(simClock.simT, M31_RING.t0)*M31_RING.v;
  // the assembly state: exactly (1, 0) today, so the present frame is untouched
  const asm = asmAt(simClock.simT), chaos = chaosAt(simClock.simT);
  gl.uniform1f(U.ptAsm, asm); gl.uniform1f(U.ptChaos, chaos);
  const sunX=org[0], sunY=org[1], sunZ=org[2];
  const bubY = REAL_MODE ? sunY+1e8 : sunY; // real scale: nothing is magnified, so no clearance bubble
  gl.uniform1f(U.ptPx,pxScale);
  gl.uniform1f(U.ptWA, 0.0);
  gl.uniform1f(U.ptTime, simClock.shimT);
  gl.uniform3f(U.ptAnd, andPos[0], andPos[1], andPos[2]);
  gl.uniform1f(U.ptTide, and.tide);
  gl.uniform1f(U.ptVM, hud.varOn?1.0:0.0);
  gl.uniform1f(U.ptCap, deep?26.0:110.0);
  gl.uniform1f(U.ptWarpAmp, 1.0);
  gl.uniform1f(U.ptMinB, hud.minBright);
  gl.uniform1f(U.ptMinSz, hud.minSprite);
  gl.uniform3f(U.ptOrg, org[0],org[1],org[2]);
  gl.uniform1f(U.ptSpin, 0.0);
  gl.uniform1f(U.velT, 0.0);
  // The nebula buffers run HII pink, then the diffuse haze, then the core. The haze is
  // laid down first and the dark clouds darken it — that is all a dust lane is, less
  // haze — and then the stars, the HII and the core are drawn over both, so a cloud
  // sits within the star field. Drawn after everything, as they used to be, the clouds
  // multiplied the stars and the core down to black discs on top of the picture.
  // What both the clouds and the life cycle read off this frame. One object each, built
  // where the values are, rather than a dozen arguments repeated at four call sites.
  const lifeFrame = {
    projMat: view.projMat!, viewMat, pxScale, deep, spinMW, warp, sunX, bubY, sunZ, org,
    minBright: hud.minBright, minSprite: hud.minSprite, tide: and.tide, varOn: hud.varOn,
  };
  const clouds: CloudFrame = {
    projMat: view.projMat!, viewMat, pxScale, camDist: cam.dist, shimT: simClock.shimT,
    varOn: hud.varOn, deep, insideDisk, andPos, tide: and.tide, merge: and.merge,
    spinMW, spinM31, warp, ringT, asm, chaos, sunX, sunY, bubY, sunZ, org,
  };
  // Multiply blending and additive sprites know nothing of depth, so the galaxies are
  // painted as CLOSED LAYERS, farther one first: haze, dust lanes, stars, then HII and
  // core, per galaxy. The nearer galaxy's dark clouds then genuinely stand in front of
  // the farther one's starlight — Andromeda's lanes silhouette against the Milky Way
  // when she crosses it, and ours against her the other way about. (An earlier build
  // ordered only the CLOUDS and drew all stars afterwards, so each galaxy's light shone
  // straight through the other's dust.) The eye is Sun-relative, like everything drawn.
  const dMW  = Math.hypot(eye[0] + org[0], eye[1] + org[1], eye[2] + org[2]);
  const dAnd = Math.hypot(eye[0] - (andPos[0] - org[0]), eye[1] - (andPos[1] - org[1]), eye[2] - (andPos[2] - org[2]));
  const andFar = dAnd > dMW;
  const andLayer = (): void => {
    drawNebula(clouds, true, 'and');
    if(insideDisk) drawNebula(clouds, false, 'and');
    drawDust(clouds, hud.dustOn, 'and');
    if(gfx.vaoAnd){
      // Andromeda: generated flat in its own disk frame; uGRot turns it to its measured
      // orientation — the two disks stand 120° apart, nowhere near parallel — and uGOff
      // carries it along its orbit. It spins its real way, ~7% faster than we do, and its
      // tide pulls toward the Milky Way: the bridge is mutual, both disks reaching.
      // Every uniform this draw needs is set here rather than inherited, because the
      // layer runs before OR after the Milky Way's depending on who is nearer.
      gl.useProgram(pPt);
      gl.uniformMatrix3fv(U.ptGRot, false, M31_ROT);
      gl.uniform3f(U.ptGOff, andPos[0], andPos[1], andPos[2]);
      gl.uniform1f(U.ptSpin, spinM31);
      gl.uniform1f(U.ptWarp, warp);
      gl.uniform1f(U.ptWarpAmp, 0.35);
      gl.uniform3f(U.ptSun, sunX, sunY+1e8, sunZ);   // no clearance bubble in its frame
      gl.uniform3f(U.ptAnd, 0, 0, 0);
      gl.uniform1f(U.ptVM, 0.0);
      gl.uniform1f(U.ptGal, 1.0);
      gl.uniform1f(U.ptMerge, and.merge);
      gl.uniform1f(U.ptArmAmp, 0.0);         // Andromeda's structure is rings, not the beat
      gl.uniform1f(U.ptRingAmp, M31_RING.amp); gl.uniform1f(U.ptRingT, ringT);
      gl.uniform2f(U.ptRingC, M31_RING.cx, M31_RING.cz);
      gl.bindVertexArray(gfx.vaoAnd); gl.drawArrays(gl.POINTS,0,gfx.N_AND);
      gl.uniformMatrix3fv(U.ptGRot, false, MAT3_ID);
      gl.uniform3f(U.ptGOff, 0, 0, 0);
      gl.uniform3f(U.ptSun, sunX, bubY, sunZ);
      gl.uniform3f(U.ptAnd, andPos[0], andPos[1], andPos[2]);
      gl.uniform1f(U.ptWarpAmp, 1.0);
      gl.uniform1f(U.ptSpin, spinMW);
      gl.uniform1f(U.ptVM, hud.varOn?1.0:0.0);
      gl.uniform1f(U.ptArmAmp, ARM_EVO_AMP);
      gl.uniform1f(U.ptRingAmp, 0.0);
      gl.uniform1f(U.ptGal, 0.0);
    }
    if(!insideDisk) drawNebula(clouds, false, 'and');   // her HII ring and core, over her stars
  };
  // the extragalactic sky first: it is behind everything, and it does not turn
  drawSkyImages(view.projMat!, viewMat, org);
  { const dots = skyDotVAO();
    if(dots){ gl.useProgram(pPt); gl.bindVertexArray(dots); gl.drawArrays(gl.POINTS, 0, N_SKYDOTS); } }
  if(andFar) andLayer();
  // the Milky Way's layer: haze, lanes, then the backdrop sky and the Gaia bubble (our
  // own foreground stars — in front of Andromeda from every camera this side of her),
  // the disk's stars, the life-cycle events, and the HII regions and core over them
  drawNebula(clouds, true, 'mw');
  if(insideDisk) drawNebula(clouds, false, 'mw');
  drawDust(clouds, hud.dustOn, 'mw');
  gl.useProgram(pPt);   // back to the points; their uniforms persist on the program
  gl.bindVertexArray(vaoStars); gl.drawArrays(gl.POINTS,0,N_STAR);
  // Real stars, carried along with the Sun. They are stored at the galaxy's scale — a
  // 108-unit bubble against a 900-unit galactic radius, which is the true proportion —
  // but the compressed view magnifies the solar system some ten million fold on top of
  // that, so zoomed in there every real star falls inside the planets: Alpha Centauri
  // lands at 0.14 units against Mercury's drawn orbit of 6. There is no scale that suits
  // both at once, so they fade out as the magnified solar system takes over the view and
  // return once it is small enough for the proportion to read. Real scale keeps them
  // throughout, where nothing is magnified and they are simply correct.
  const gaiaFade = REAL_MODE ? 0 : 1 - Math.min(1, Math.max(0, (cam.dist - 210)/280));
  if(gfx.gaiaOn && gfx.vaoGaia && gaiaFade < 0.999){
    gl.uniform1f(U.ptFade, gaiaFade);
    gl.uniform3f(U.ptOrg, 0,0,0);
    // Real Gaia DR3 space velocities: each star drifts along its measured track. A
    // straight line is only honest for so long, so the extrapolation stops at +-20 Myr —
    // beyond that the local sky simply holds its furthest computed shape.
    gl.uniform1f(U.velT, Math.max(-2e7, Math.min(2e7, simClock.simT)) * 1.1119e-7);
    // The bubble rides the Sun's orbital frame. Its coordinates are Sun-relative, so the
    // wave-rotation path — a rigid turn about the origin — turns it about the Sun by the
    // Sun's own orbital angle: the side that faces the galactic centre keeps facing it
    // (over 20 Myr the Sun turns through 32 degrees, which is anything but negligible).
    gl.uniform1f(U.ptWA, 1.0);
    // pre-scaled by RC_BAR: the bubble's points carry no wave flag, so the shader divides
    // by the fast pattern's radius, and this hack must hand it the Sun's own angle
    gl.uniform1f(U.ptSpin, (simClock.simT*V_GAL/900) * RC_BAR);
    gl.bindVertexArray(gfx.vaoGaia); gl.drawArrays(gl.POINTS,0,gfx.N_GAIA);
    if(gfx.vaoGaiaDeep && gfx.curD >= 5){ gl.bindVertexArray(gfx.vaoGaiaDeep); gl.drawArrays(gl.POINTS,0,gfx.N_GAIA_DEEP); }
    gl.uniform1f(U.velT, 0.0);
    gl.uniform1f(U.ptWA, 0.0);
    gl.uniform1f(U.ptSpin, 0.0);
    gl.uniform3f(U.ptOrg, org[0],org[1],org[2]);
    gl.uniform1f(U.ptFade, 0.0);
  }
  gl.uniform1f(U.ptSpin, spinMW);
  gl.uniform1f(U.ptWarp, warp);
  gl.uniform3f(U.ptSun, sunX, bubY, sunZ);
  gl.uniform1f(U.ptGal, 1.0);
  gl.uniform1f(U.ptMerge, and.merge);
  gl.uniform1f(U.ptArmAmp, ARM_EVO_AMP);   // the Milky Way's arms wax and wane with the beat
  gl.bindVertexArray(gfx.vaoGxy);
  if(insideDisk && gfx.hideNucleus && gfx.NUC1 > gfx.NUC0){   // the centre's own stars stay behind the dust
    if(gfx.NUC0 > 0) gl.drawArrays(gl.POINTS, 0, gfx.NUC0);
    if(gfx.N_GXY > gfx.NUC1) gl.drawArrays(gl.POINTS, gfx.NUC1, gfx.N_GXY - gfx.NUC1);
  } else gl.drawArrays(gl.POINTS,0,gfx.N_GXY);
  gl.uniform1f(U.ptGal, 0.0);

  // life-cycle events (OB clusters, supergiants, supernova flashes, remnant cores)
  if(hud.lifeOn && events.length) drawEvents(lifeFrame);

  if(!insideDisk) drawNebula(clouds, false, 'mw');   // the HII regions and the core, over the stars
  if(hud.lifeOn && puffs.length) drawRemnants(lifeFrame);
  if(!andFar) andLayer();   // Andromeda nearer: her whole layer over ours, lanes and all
  // trails
  if(hud.showTrails && hud.trailPct > 0) drawTrails({
    projMat: view.projMat!, viewMat, camDist: cam.dist, org,
    trailAlpha: hud.trailAlpha, orbitAlpha: hud.orbitAlpha, starGain: hud.starGain,
    psH: hud.psH, psO: hud.psO, showP9: hud.showP9, showDwarfs: hud.showDwarfs, wasEaten,
  });

  // asteroid belt, Kuiper belt & Oort cloud, riding along with the Sun.
  // Each fades out while its ring is too small on screen to resolve — otherwise its
  drawBelts({
    projMat: view.projMat!, viewMat, pxScale, camDist: cam.dist, simT: simClock.simT,
    g710Dist: gl710.d, showBelt: hud.showBelt, showKuiper: hud.showKuiper, showOort: hud.showOort,
    globePx: readout.globePx,
  });

  drawBodies({ showDwarfs: hud.showDwarfs, showP9: hud.showP9 });

  // Earth as a globe, and the Moon, once they are more than a dot. Opaque discs, so the
  // same blend as the Sun's disc; the atmosphere adds over what is behind it.
  readout.moonPx = 0;
  // the pass opens on Earth's size, or on the Moon's when she is the one being followed
  if((readout.globePx > 4 || cam.followTarget === 'moon') && !wasEaten[3]){
    const a = ageGyr();
    const g = drawGlobe({
      projMat: view.projMat!, viewMat, ageGyr: a, era: earthEra(a, environment().mean),
      earthPos: [bodyPosArr[9], bodyPosArr[10], bodyPosArr[11]],
      prime: earthPrime(simClock.simT, tmp) as unknown as readonly number[],
      mirror: SKY_MIRROR, shimT: simClock.shimT, simT: simClock.simT,
      avgLight: readout.avgLight, globePx: readout.globePx, camDist: cam.dist,
      pxScale, viewH: view.H, dpr: view.DPR, org,
    });
    readout.moonPx = g.moonPx;
    readout.earthDbg = g.earthDbg;   // read by the debug tooling
  }

  drawG710({ star: gl710, camDist: cam.dist });
  // The Sun itself, last of the scene: the envelope it has shed, then its disc over that.
  // Whether the envelope is on screen decides what the Sun's label says, so the pass
  // reports it and the readout is set here rather than from inside the draw.
  // `pn` outlives the draw: the HUD's phase reading follows the shell's existence, which
  // runs 0.3 Gyr past sunState()'s own 'planetary nebula' phase, so it stays a frame-level
  // value rather than something the pass computes and keeps to itself.
  const pn = pnState(ageGyr());
  readout.pnShown = drawShed({
    projMat: view.projMat!, viewMat, shimT: simClock.shimT, pxScale,
    camSunDist: readout.camSunDist, pn,
  });
  drawSunDisc({
    projMat: view.projMat!, viewMat, shimT: simClock.shimT,
    plasmaSunPx: readout.plasmaSunPx, tint,
  });
  drawEatFlash({ eatFlash, bodyPosArr, camDist: cam.dist });

  if(toneOn){   // resolve the half-float scene to the screen through the rolloff curve
    resolveTone(hud.coreKnee);
    gl.blendFunc(gl.ONE, gl.ONE);
  }

  // labels
  readout.frameDt = dt;
  drawLabels(hud.showLabels, {
    projMat: view.projMat!, viewMat, pxScale, camDist: cam.dist, org, andPos,
    merge: and.merge, sep: and.sep, spinMW, spinM31, asm, star: gl710,
    showP9: hud.showP9, showDwarfs: hud.showDwarfs, wasEaten,
    structOn: [hud.showBelt, hud.showKuiper, hud.showOort], armsOn: hud.armsOn,
  });

  updateHud(now, pn);

  if(probeFrames >= 0 && ++probeFrames === 3){ probeFrames = -1; onProbeReady(); }
  requestAnimationFrame(frame);
}
// Whether this visitor has been here before decides how much the opening scenario may
// touch: the camera always, their saved sliders never.

/**
 * Start the loop, and hand over the four things that belong to the model rather than to the
 * drawing. `onProbeReady` fires on the third frame of a first visit — the programs are
 * compiled and the opening camera is set, which is the only moment the probe can measure.
 */
export function startFrameLoop(deps: {
  vaoStars: WebGLVertexArrayObject
  ageGyr: () => number
  environment: () => { mean: number }
  earthPrime: (t: number, out: Float64Array) => Float64Array
  g710: () => { x: number; y: number; z: number; d: number }
  onProbeReady: () => void
}): void {
  vaoStars = deps.vaoStars;
  ageGyr = deps.ageGyr; environment = deps.environment; earthPrime = deps.earthPrime;
  g710 = deps.g710; onProbeReady = deps.onProbeReady;
  requestAnimationFrame(frame);
}
