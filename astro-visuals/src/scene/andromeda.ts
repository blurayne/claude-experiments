import { gauss, expR } from '../core/rng'
import { gfx } from '../render/state'
import { mapPick } from './galaxy'

/**
 * Andromeda's point cloud, in M31's own flat disk frame.
 *
 * Positions stay local: the measured orientation — spin pole at galactic 242 deg, -30 — and
 * the orbit are applied per draw through uGal/uGRot/uGOff. Never bake an inclination into
 * generated positions; the shader places whole galaxies, and a pre-rotated one could not be
 * relaxed into the merger remnant.
 *
 * The procedural version is the fallback for when the Hubble map has not loaded. Both return
 * buffers rather than uploading them, so nothing here needs a GL context — the same shape as
 * scene/galaxy, and what a WASM port would have to provide.
 */

export interface AndromedaBuffers {
  star: { pos: Float32Array; size: Float32Array; col: Float32Array; wav?: Float32Array }
  neb: { pos: Float32Array; size: Float32Array; col: Float32Array } | null
  dust: { pos: Float32Array; size: Float32Array; str: Float32Array } | null
}

export const R_A = 2245;                        // M31's R25, 20.6 kpc, at true scale
export const M31_MAP_SCALE = R_A/188.6;         // scene units per map pixel
export function mapXZ31(i: number, spread: number): [number, number] {
  const n=gfx.m31Map!.n, c0=(n-1)/2;
  const u=(i%n)+Math.random()-0.5+gauss()*spread, v=((i/n)|0)+Math.random()-0.5+gauss()*spread;
  return [ (u-c0)*M31_MAP_SCALE, -(v-c0)*M31_MAP_SCALE ];
}
// satellites and debris, at their measured sky offsets; depths are modelled
export const M32_C  = [-150, -80, 530];         // compact elliptical, ~5 kpc off the nucleus
export const M110_C = [760, 240, -420];         // NGC 205, ~8.5 kpc the other side
export const GSS_DIR = [0.355, -0.457, -0.833]; // the Giant Southern Stream's plume
export function genAndromeda(D: number): AndromedaBuffers {                // fallback when the map has not loaded
  gfx.N_AND = Math.round(52000*D); gfx.N_ANDN = 0; gfx.N_ANDD = 0; gfx.AND_PINK = 0; gfx.AND_GLOW = 0;
  const BS = 1/Math.sqrt(D);
  const pos=new Float32Array(gfx.N_AND*3), size=new Float32Array(gfx.N_AND), col=new Float32Array(gfx.N_AND*3);
  const PITCH_A = Math.tan(14*Math.PI/180);
  for(let i=0;i<gfx.N_AND;i++){
    let x,y,z,b,s;
    if(i<0.155*gfx.N_AND){                            // M31's large classical bulge
      const r=Math.abs(gauss())*120, th=Math.random()*6.28318;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*85;
      b=.30+Math.random()*.34; s=2.6+Math.random()*2.2;
      col[i*3]=b*1.2; col[i*3+1]=b*.92; col[i*3+2]=b*.6;
    } else if(i<0.367*gfx.N_AND){                     // its smooth inner disk
      const r=expR(220,R_A,340), th=Math.random()*6.28318;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*13;
      b=.07+Math.random()*.09; s=1.5+Math.random()*1.4;
      col[i*3]=b*.9; col[i*3+1]=b*.93; col[i*3+2]=b*1.08;
    } else {                                      // the famous ring-like arms
      const arm = (i%2)*Math.PI;
      const r = 480+Math.pow(Math.random(),0.85)*(R_A-480);
      const th = arm - Math.log(r/480)/PITCH_A + gauss()*0.075;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*9;
      const roll=Math.random();
      if(roll<0.05){ col[i*3]=.9; col[i*3+1]=.5; col[i*3+2]=.6; s=2.8+Math.random()*2.0; }
      else if(roll<0.16){ col[i*3]=.55; col[i*3+1]=.68; col[i*3+2]=.98; s=2.5+Math.random()*2.0; }
      else { b=.16+Math.random()*.19; col[i*3]=b*.85; col[i*3+1]=b*.95; col[i*3+2]=b*1.15; s=1.6+Math.random()*1.7; }
    }
    col[i*3]*=BS; col[i*3+1]*=BS; col[i*3+2]*=BS;
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;       // flat: uGRot orients the disk
    size[i]=s*Math.pow(D,-0.12);
  }
  return { star: { pos, size, col }, neb: null, dust: null };
}
export function genAndromedaMap(D: number): AndromedaBuffers {
  gfx.N_AND = Math.round(58000*D);
  const BS = 1/Math.sqrt(D), SS = Math.pow(D,-0.12);
  const NBS = Math.max(Math.pow(D,-0.7), 0.25), DS = 1/D, Dg = Math.min(D, 8);
  // Only reached when the map has loaded; setGalaxy picks the generator on exactly that.
  const m = gfx.m31Map!, pxd = m.px;
  // Andromeda's map always carries these two; the Milky Way's does not, which is why they are
  // optional on the shared type. loadM31Map builds both alongside the distributions.
  const ridge = m.ridge!, hazeC = m.hazeC ?? m.starC;
  const pos=new Float32Array(gfx.N_AND*3), size=new Float32Array(gfx.N_AND);
  const col=new Float32Array(gfx.N_AND*3), wav=new Float32Array(gfx.N_AND);
  const HALO = Math.round(gfx.N_AND*0.05);     // M31's halo is bigger than ours
  const GSS  = Math.round(gfx.N_AND*0.015);    // the Giant Southern Stream
  const M32N = Math.round(gfx.N_AND*0.008), M110N = Math.round(gfx.N_AND*0.011);
  for(let i=0;i<gfx.N_AND;i++){
    let X,Y,Z,cr,cg,cb,s,wv=0;
    if(i<HALO){
      const rr=160+Math.abs(gauss())*1350, th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
      X=rr*Math.sin(ph)*Math.cos(th); Z=rr*Math.sin(ph)*Math.sin(th); Y=rr*Math.cos(ph)*0.8;
      const b=.05+Math.random()*.06; cr=b*1.05; cg=b*.95; cb=b*.85; s=1.6+Math.random()*1.4;
    } else if(i<HALO+GSS){
      // metal-rich debris of a shredded satellite, arcing far past the disk edge
      const u=Math.pow(Math.random(),0.7), d=500+5200*u, w=(230+260*u);
      X=GSS_DIR[0]*d+gauss()*w; Y=GSS_DIR[1]*d+gauss()*w*0.6; Z=GSS_DIR[2]*d+gauss()*w;
      const b=.05+Math.random()*.05; cr=b*1.06; cg=b*.9; cb=b*.72; s=1.5+Math.random()*1.2;
    } else if(i<HALO+GSS+M32N){
      const r=Math.pow(Math.abs(gauss()),1.6)*15;
      const th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
      X=M32_C[0]+r*Math.sin(ph)*Math.cos(th); Y=M32_C[1]+r*Math.cos(ph); Z=M32_C[2]+r*Math.sin(ph)*Math.sin(th);
      const b=.22+Math.random()*.34; cr=b*1.1; cg=b*.95; cb=b*.72; s=1.7+Math.random()*1.5;
    } else if(i<HALO+GSS+M32N+M110N){
      X=M110_C[0]+gauss()*115; Y=M110_C[1]+gauss()*62; Z=M110_C[2]+gauss()*115;
      const b=.06+Math.random()*.08; cr=b*1.0; cg=b*.95; cb=b*.88; s=1.5+Math.random()*1.2;
    } else {
      const pI = mapPick(m.starC);
      const w = mapXZ31(pI, 0.35); X=w[0]; Z=w[1];
      const l = m.lum[pI], rw = Math.hypot(X,Z);
      const bulge = l*Math.exp(-(rw*rw)/(300*300));    // its big classical bulge, puffed to 3D
      Y = gauss()*(11 + Math.max(0,rw-1350)*0.014 + 95*bulge);
      const gain = (0.15 + 0.9*Math.pow(l, 1.1)) * (Math.random()<0.03 ? 2.2 : 1)
                 * (1 + 0.25*M31_ARM_K*ridge[pI]);     // an arm's stars are the bright young ones
      cr = pxd[pI*4]/255*gain*0.99; cg = pxd[pI*4+1]/255*gain; cb = pxd[pI*4+2]/255*gain*1.06;
      s = 1.4 + Math.random()*1.8 + (l>0.72 ? Math.random()*1.2 : 0);
      wv = (l > m.blur[pI]*1.10 || rw < 500) ? 1 : 0;
    }
    pos[i*3]=X; pos[i*3+1]=Y; pos[i*3+2]=Z; wav[i]=wv;
    size[i]=s*SS; col[i*3]=cr*BS; col[i*3+1]=cg*BS; col[i*3+2]=cb*BS;
  }
  // HII in Hα pink, the star-forming ring first; then the unresolved haze; then the core
  const PINK_N = Math.round(2200*D), GLOW_N = Math.round(3200*Dg), CORE_N = Math.round(800*Dg);
  gfx.N_ANDN = PINK_N + GLOW_N + CORE_N;
  gfx.AND_PINK = PINK_N; gfx.AND_GLOW = GLOW_N;
  const nPos=new Float32Array(gfx.N_ANDN*3), nSize=new Float32Array(gfx.N_ANDN), nCol=new Float32Array(gfx.N_ANDN*3);
  for(let q=0;q<PINK_N;q++){
    const pI = mapPick(m.nebC);
    const w = mapXZ31(pI, 0.8);
    nPos[q*3]=w[0]; nPos[q*3+1]=gauss()*5; nPos[q*3+2]=w[1];
    nSize[q]=16+Math.random()*40;
    const j=(0.7+Math.random()*0.6)*NBS;
    nCol[q*3]=.16*j; nCol[q*3+1]=.055*j; nCol[q*3+2]=.09*j;
  }
  const gGain = 0.19/Dg;
  for(let q=PINK_N;q<PINK_N+GLOW_N;q++){
    const pI = mapPick(hazeC);
    const w = mapXZ31(pI, 1.1);
    const l = m.lum[pI], rw = Math.hypot(w[0], w[1]);
    nPos[q*3]=w[0];
    nPos[q*3+1]=gauss()*(6 + 44*l*Math.exp(-(rw*rw)/(300*300)));
    nPos[q*3+2]=w[1];
    nSize[q]=60+Math.random()*130;
    const j=(0.7+Math.random()*0.6)*gGain*(0.4+l);
    nCol[q*3]=m.px[pI*4]/255*j*0.99; nCol[q*3+1]=m.px[pI*4+1]/255*j; nCol[q*3+2]=m.px[pI*4+2]/255*j*1.06;
  }
  for(let q=PINK_N+GLOW_N;q<gfx.N_ANDN;q++){
    const u=gauss()*180, v=gauss()*140;    // rounder than our barred centre
    nPos[q*3]=u; nPos[q*3+1]=gauss()*Math.max(12,46-Math.hypot(u,v)*0.14); nPos[q*3+2]=v;
    nSize[q]=40+Math.random()*95;
    const j=(0.7+Math.random()*0.6)*0.30/Dg;
    nCol[q*3]=1.00*j; nCol[q*3+1]=0.80*j; nCol[q*3+2]=0.52*j;
  }
  gfx.N_ANDD = Math.round(3000*D);
  const dPos=new Float32Array(gfx.N_ANDD*3), dSize=new Float32Array(gfx.N_ANDD), dStr=new Float32Array(gfx.N_ANDD*3);
  for(let q=0;q<gfx.N_ANDD;q++){
    const pI = mapPick(m.dustC);
    const w = mapXZ31(pI, 0.5);
    dPos[q*3]=w[0]; dPos[q*3+1]=gauss()*5; dPos[q*3+2]=w[1];
    dSize[q]=16+Math.random()*28;
    const dk = Math.max(0, m.blur[pI]-m.lum[pI]);
    dStr[q*3]=(0.35+4.5*dk)*DS*(0.7+Math.random()*0.6);
  }
  return { star: { pos, size, col, wav },
           neb:  { pos: nPos, size: nSize, col: nCol },
           dust: { pos: dPos, size: dSize, str: dStr } };
}

// How much the arms are favoured when Andromeda is drawn from its map: the star and HII
// density on a ridge is (1 + M31_ARM_K × ridge), the haze 60% of that, each star's light
// (1 + a quarter of that). The map's ridges are only ~0.08 high on average (clamped at
// 0.3), so 3 did nothing measurable and 12 little; at the screen's own scale 24 lifts the
// star layer's arm-to-interarm contrast from ~1.5 to ~2 — the picture holds no more
// (sweep in the working notes).
export const M31_ARM_K = 24.0;
