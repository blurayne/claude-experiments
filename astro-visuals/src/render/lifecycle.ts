import { gl } from '../gpu/context'
import { dynVAO } from '../gpu/buffers'
import { gauss, expR } from '../core/rng'
import { PITCH, BAR_L, BAR_A, armAngle, ARMS } from '../astro/constants'
import { sfrFactor } from '../astro/environment'
import { pPt, U } from './passes/points'
import { pSN, USN } from './passes/supernova'
import { pRem, UREM } from './passes/remnant'
import { gfx, lifeAcc, readout, simClock } from './state'

/**
 * Stellar life cycle: birth, death, supernovae — the model and the three draws it feeds.
 *
 * Rates are anchored to current measurements (see the info panel): the Milky Way forms ~2
 * solar masses of stars a year and hosts ~2 supernovae per century. On the compressed
 * galactic clock (1 sim-yr ~ 1.19 Myr) births are drawn at the real rate scaled to the point
 * sampling (~2.2 per sim-yr per density unit); featured supernovae are a sampled fraction of
 * the true ~24,000 per sim-yr, which would be a continuous glitter.
 *
 * Event kinds: 1 OB cluster, 2 red supergiant, 3 supernova flash, 4 red giant,
 * 5 cooling neutron star, 6 fading white dwarf.
 *
 * The sound is injected rather than imported: a birth plings, a collapse cracks, a planetary
 * nebula sighs, and this module should not depend on the audio graph to say so.
 */

export interface LifeEvent {
  k: number; x: number; y: number; z: number; wv: number
  st: number; t: number
  L?: number; sn?: boolean
}
interface Puff { x: number; y: number; z: number; wv: number; t: number; r1: number; dur: number; col: number[] }

const EV_CAP = 1024, PUFF_CAP = 512;
const evPos=new Float32Array(EV_CAP*3), evSize=new Float32Array(EV_CAP), evCol=new Float32Array(EV_CAP*3), evWave=new Float32Array(EV_CAP);
const pfPos=new Float32Array(PUFF_CAP*3), pfSize=new Float32Array(PUFF_CAP), pfCol=new Float32Array(PUFF_CAP*3), pfWave=new Float32Array(PUFF_CAP);

const evGL = dynVAO(EV_CAP), pfGL = dynVAO(PUFF_CAP);
// Blasts are drawn by their own program, so they travel in their own buffers. There are
// never many at once — a flash lasts 1.6 s — and the fourth channel carries how far the
// blast has run instead of the wave flag, which every one of them has set anyway.
const SN_CAP = 96;
const snPos=new Float32Array(SN_CAP*3), snSize=new Float32Array(SN_CAP),
      snCol=new Float32Array(SN_CAP*3), snPh=new Float32Array(SN_CAP);
const snGL = dynVAO(SN_CAP);

export const events: LifeEvent[] = [], puffs: Puff[] = [];

/** The sound effects, handed in at boot so this module does not import the audio graph. */
let sfx: (name: string) => void = () => {}
export const setLifeSfx = (fn: (name: string) => void): void => { sfx = fn }

function armSite(): number[] { // where massive stars are born: an arm's inner edge, the spur, or a bar tip
  const roll=Math.random();
  let r, th;
  if(roll<0.12){ th=(Math.random()<0.5?BAR_A:BAR_A+Math.PI)+gauss()*0.05; r=BAR_L*(0.95+Math.random()*0.12); }
  else if(roll<0.30){ r=900+(Math.random()*2-1)*150; th=-(r-900)/(900*PITCH)+0.02+gauss()*0.04; }
  else { const arm=Math.random()<0.7?ARMS[(Math.random()*2)|0]:ARMS[2+((Math.random()*2)|0)];
    r=BAR_L+40+Math.pow(Math.random(),0.95)*1200; th=armAngle(r,arm[0])+0.025+gauss()*0.03; }
  return [r*Math.sin(th), gauss()*6, r*Math.cos(th)];
}
function diskSite(): number[] { // old stars die everywhere in the disk
  const r=expR(300,1700,283), th=Math.random()*6.28318;
  return [r*Math.sin(th), gauss()*14, r*Math.cos(th)];
}
function addPuff(e: LifeEvent, r1: number, dur: number, col: number[]): void {
  if(puffs.length>=PUFF_CAP) return;
  puffs.push({x:e.x,y:e.y,z:e.z,wv:e.wv,t:0,r1,dur,col});
}

export interface LifeStepInputs {
  /** wall seconds and simulated years since the last frame */
  dt: number
  dtSim: number
  ageGyr: number
  /** the two switches: births, and deaths (which carries the planetary nebulae with it) */
  evBirth: boolean
  evSN: boolean
}

export function lifeStep({ dt, dtSim, ageGyr, evBirth, evSN }: LifeStepInputs): void {
  const sfr = sfrFactor(ageGyr);
  // Per year now, not per compressed step. These are drawn events, a sampled fraction of
  // the real rates — the true figures are in the status bar and the info panel.
  if(evBirth) lifeAcc.accB += dtSim*1.84e-6*gfx.curD*sfr; else lifeAcc.accB = 0;
  if(evSN){
    lifeAcc.accSN += dtSim*Math.max(9.2e-9*gfx.curD, 1.26e-7)*sfr;
    lifeAcc.accPN += dtSim*1.26e-6*gfx.curD*Math.sqrt(sfr);   // low-mass deaths ride with the deaths switch
  } else lifeAcc.accSN = lifeAcc.accPN = 0;
  const CAP = 40;
  for(let n=0; lifeAcc.accB>=1 && n<CAP; n++){ lifeAcc.accB--; if(events.length<EV_CAP){ const s=armSite();
    events.push({k:1,x:s[0],y:s[1],z:s[2],wv:1,st:0,t:0,L:(3+Math.random()*6)*1e6,sn:evSN && Math.random()<0.12});
    if(Math.random()<0.5) sfx('birth'); } } // only half of them sound, or it never stops
  if(lifeAcc.accB>1) lifeAcc.accB = 0;
  for(let n=0; lifeAcc.accSN>=1 && n<CAP; n++){ lifeAcc.accSN--; if(events.length<EV_CAP){ const s=armSite();
    events.push({k:2,x:s[0],y:s[1],z:s[2],wv:1,st:0,t:0}); } }
  if(lifeAcc.accSN>1) lifeAcc.accSN = 0;
  for(let n=0; lifeAcc.accPN>=1 && n<CAP; n++){ lifeAcc.accPN--; if(events.length<EV_CAP){ const s=diskSite();
    events.push({k:4,x:s[0],y:s[1],z:s[2],wv:0,st:0,t:0}); } }
  if(lifeAcc.accPN>1) lifeAcc.accPN = 0;
  for(let i=events.length-1;i>=0;i--){
    const e=events[i]; e.st+=dtSim; e.t+=dt;
    if(e.k===1 && e.st>e.L!){
      if(e.sn){ e.k=2; e.st=0; }                    // a massive member goes supergiant
      else if(e.st>e.L!+0.8e6) events.splice(i,1);  // cluster disperses into the disk
    }
    else if(e.k===2 && e.st>1.0e6){ e.k=3; e.t=0; sfx('sn'); } // ~1 Myr as a red supergiant, then collapse
    else if(e.k===3 && e.t>1.6){ addPuff(e,7,2.8,[0.55,0.35,0.22]); e.k=5; e.t=0; }
    else if(e.k===4 && e.st>1.2e6){ addPuff(e,1.8,2.2,[0.10,0.50,0.42]); e.k=6; e.t=0; sfx('pn'); }
    else if((e.k===5||e.k===6) && e.t>2.5) events.splice(i,1);
  }
  for(let i=puffs.length-1;i>=0;i--){ const q=puffs[i]; q.t+=dt; if(q.t>q.dur) puffs.splice(i,1); }
}

function fillEvents(): void {
  readout.evN = 0; readout.snN = 0;
  for(let i=0;i<events.length;i++){
    const e=events[i]; let s=0,cr=0,cg=0,cb=0;
    if(e.k===3){
      // The blast leaves this pass entirely: its own program draws it. The sprite grows
      // through the whole flash — a fireball only expands — while the brightness peaks
      // in the first fifth of a second and falls away, so it dims as it spreads.
      if(readout.snN < SN_CAP){
        const u = Math.min(1, e.t/1.6);
        const a = e.t<0.15 ? e.t/0.15 : Math.exp(-(e.t-0.15)/0.45);
        const j = readout.snN++;
        snPos[j*3]=e.x; snPos[j*3+1]=e.y; snPos[j*3+2]=e.z;
        snSize[j] = 14 + 92*Math.min(1, 0.3 + u);
        snCol[j*3]=2.4*a; snCol[j*3+1]=2.3*a; snCol[j*3+2]=2.1*a;
        snPh[j] = u;
      }
      continue;
    }
    if(e.k===1){ // embedded reddish protocluster brightening into a blue OB cluster
      const u=Math.min(1,e.st/0.8e6), f=e.st>e.L!?Math.max(0,1-(e.st-e.L!)/0.8e6):1;
      s=(0.6+2.8*u)*f;
      cr=(0.55+0.07*u)*f; cg=(0.16+0.56*u)*f; cb=(0.10+0.95*u)*f;
      if(e.st < 0.25e6){ // the pling: a brief white twinkle, the opposite of a blast
        const w = (1 - e.st/0.25e6)*(0.55+0.45*Math.sin(simClock.shimT*9.0 + e.x*3.1));
        s += 3.2*w; cr += 1.05*w; cg += 1.05*w; cb += 1.15*w;
      }
    } else if(e.k===2){ // red supergiant: swelling, reddening
      const u=Math.min(1,e.st/1e6);
      s=3.2+2.6*u; cr=0.62+0.5*u; cg=0.72-0.34*u; cb=1.05-0.87*u;
    } else if(e.k===5){ // what remains: a cooling neutron star
      const f=Math.max(0,1-e.t/2.5); s=1.4; cr=0.35*f; cg=0.5*f; cb=0.9*f;
    } else if(e.k===4){ // a low-mass star swells into a red giant
      const u=Math.min(1,e.st/1.2e6); s=1.2+2.4*u; cr=0.9; cg=0.42-0.12*u; cb=0.16;
    } else { // white dwarf, slowly fading
      const f=Math.max(0,1-e.t/2.5); s=1.1; cr=0.8*f; cg=0.85*f; cb=1.0*f;
    }
    const j = readout.evN++;   // compacted: the blasts that left this pass leave no gaps behind
    evPos[j*3]=e.x; evPos[j*3+1]=e.y; evPos[j*3+2]=e.z;
    evSize[j]=s; evCol[j*3]=cr; evCol[j*3+1]=cg; evCol[j*3+2]=cb; evWave[j]=e.wv;
  }
}

function fillPuffs(): void {
  for(let i=0;i<puffs.length;i++){
    const q=puffs[i], u=q.t/q.dur, rad=q.r1*(1-(1-u)*(1-u)), a=Math.pow(1-u,1.6);
    pfPos[i*3]=q.x; pfPos[i*3+1]=q.y; pfPos[i*3+2]=q.z;
    pfSize[i]=Math.max(0.8, rad*2);
    pfCol[i*3]=q.col[0]*a; pfCol[i*3+1]=q.col[1]*a; pfCol[i*3+2]=q.col[2]*a;
    // the fourth channel carries both the frame flag and how far the shell has run:
    // wave in the twos, phase in the fraction — the remnant shader unpacks it
    pfWave[i]=q.wv*2 + Math.min(0.999, u);
  }
}

export interface LifeDrawInputs {
  projMat: Float32Array
  viewMat: Float32Array
  pxScale: number
  deep: boolean
  spinMW: number
  warp: number
  sunX: number
  bubY: number
  sunZ: number
  org: Float64Array
  /** the point program's own values, restored after the events borrow it */
  minBright: number
  minSprite: number
  tide: number
  varOn: boolean
}

/**
 * The events, then the blasts on top of everything their flash lights up.
 *
 * The events borrow the point program and hand it back: they animate themselves, keep their
 * own scale and are not part of the star field, so four of its uniforms are set and then set
 * back to what the star passes left. Getting that restore wrong dims or inflates every star
 * drawn after this in the frame.
 */
export function drawEvents(
  { projMat, viewMat, pxScale, deep, spinMW, warp, sunX, bubY, sunZ, org,
    minBright, minSprite, tide, varOn }: LifeDrawInputs,
): void {
  fillEvents();
  gl.uniform1f(U.ptVM, 0.0); // events animate themselves
  gl.uniform1f(U.ptTide, 0.0);
  gl.uniform1f(U.ptMinB, 0.0);
  gl.uniform1f(U.ptMinSz, 1.3);   // events keep their own scale
  gl.uniform1f(U.ptCap, deep?36.0:110.0); // a supernova blooms, within reason
  if(readout.evN){
    gl.bindBuffer(gl.ARRAY_BUFFER,evGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,evPos.subarray(0,readout.evN*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,evGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,evSize.subarray(0,readout.evN));
    gl.bindBuffer(gl.ARRAY_BUFFER,evGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,evCol.subarray(0,readout.evN*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,evGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,evWave.subarray(0,readout.evN));
    gl.bindVertexArray(evGL.vao); gl.drawArrays(gl.POINTS,0,readout.evN);
  }
  // the blasts, in their own pass, on top of everything the flash lights up
  if(readout.snN){
    gl.useProgram(pSN);
    gl.uniformMatrix4fv(USN.proj,false,projMat);
    gl.uniformMatrix4fv(USN.view,false,viewMat);
    gl.uniform1f(USN.px, pxScale);
    gl.uniform1f(USN.spin, spinMW);
    gl.uniform1f(USN.warp, warp);
    gl.uniform1f(USN.cap, deep?36.0:110.0);
    gl.uniform3f(USN.sun, sunX, bubY, sunZ);
    gl.uniform3f(USN.org, org[0], org[1], org[2]);
    gl.bindBuffer(gl.ARRAY_BUFFER,snGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,snPos.subarray(0,readout.snN*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,snGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,snSize.subarray(0,readout.snN));
    gl.bindBuffer(gl.ARRAY_BUFFER,snGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,snCol.subarray(0,readout.snN*3));
    gl.bindBuffer(gl.ARRAY_BUFFER,snGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,snPh.subarray(0,readout.snN));
    gl.bindVertexArray(snGL.vao); gl.drawArrays(gl.POINTS,0,readout.snN);
    gl.useProgram(pPt);   // the restores below belong to the point program
  }
  gl.uniform1f(U.ptMinB, minBright);
  gl.uniform1f(U.ptMinSz, minSprite);
  gl.uniform1f(U.ptTide, tide);
  gl.uniform1f(U.ptVM, varOn?1.0:0.0);
  gl.uniform1f(U.ptCap, deep?26.0:110.0);
}

/**
 * Expanding shells: supernova remnants and planetary nebulae, on their own program (sizes
 * exaggerated — see info). After the dust on purpose: a remnant next door is not something
 * the backdrop's lanes should darken.
 */
export function drawRemnants(
  { projMat, viewMat, pxScale, deep, spinMW, warp, sunX, bubY, sunZ, org }: LifeDrawInputs,
): void {
  fillPuffs();
  gl.useProgram(pRem);
  gl.uniformMatrix4fv(UREM.proj,false,projMat);
  gl.uniformMatrix4fv(UREM.view,false,viewMat);
  gl.uniform1f(UREM.px, pxScale);
  gl.uniform1f(UREM.spin, spinMW);
  gl.uniform1f(UREM.warp, warp);
  gl.uniform1f(UREM.cap, deep?60.0:560.0);
  gl.uniform3f(UREM.sun, sunX, bubY, sunZ);
  gl.uniform3f(UREM.org, org[0], org[1], org[2]);
  gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.p); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfPos.subarray(0,puffs.length*3));
  gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.s); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfSize.subarray(0,puffs.length));
  gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.c); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfCol.subarray(0,puffs.length*3));
  gl.bindBuffer(gl.ARRAY_BUFFER,pfGL.w); gl.bufferSubData(gl.ARRAY_BUFFER,0,pfWave.subarray(0,puffs.length));
  gl.bindVertexArray(pfGL.vao); gl.drawArrays(gl.POINTS,0,puffs.length);
}
