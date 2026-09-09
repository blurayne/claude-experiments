import { gauss, expR } from '../core/rng'
import { PITCH, BAR_L, BAR_A, ARMS, armAngle, sA, cA } from '../astro/constants'
import { gfx } from '../render/state'

/**
 * The Milky Way's point cloud: stars, nebulae and dust, either from the procedural model or
 * sampled from the photographic probability map.
 *
 * The two generators are interchangeable — same outputs, same counts, same segment
 * boundaries — because setGalaxy picks between them on whether the map has loaded yet, and
 * caches the result under a key that records which was used.
 *
 * They return their buffers now instead of writing module-level scratch that setGalaxy read
 * back. That scratch was three files' worth of shared mutable state in waiting; the counts
 * still land in `gfx`, which is the next thing to tidy and a larger change than a move.
 *
 * Both consume randomness heavily and neither may be reordered, memoised or batched: the
 * parity gate compares a seeded stream, so the draw ORDER is part of the picture. gauss() is
 * a rejection sampler with no fixed draw count, which makes any upstream shift unrecoverable
 * rather than merely wrong.
 */

export interface GalaxyBuffers {
  star: { pos: Float32Array; size: Float32Array; col: Float32Array; wave: Float32Array }
  /** wave: 2 marks Local Spur puffs, which ride the slow near-corotation pattern (v3.1) */
  neb: { pos: Float32Array; size: Float32Array; col: Float32Array; wave?: Float32Array }
  dust: { pos: Float32Array; size: Float32Array; str: Float32Array }
}

export function genGalaxy(D: number): GalaxyBuffers {
  let gxyPos, gxySize, gxyCol, gxyWave, nebPos, nebSize, nebCol, dustPos, dustSize, dustStr;
 // D = density multiplier (hi-fi galaxy mode)
  gfx.N_GXY = Math.round(92000*D);
  gfx.NUC0 = gfx.NUC1 = 0;
  const BS = 1/Math.sqrt(D);      // per-star brightness comp: more stars, finer grain
  const SS = Math.pow(D,-0.12);   // slightly smaller sprites when dense
  const NBS = Math.max(Math.pow(D,-0.7), 0.25), DS = 1/D; // floor: nebulae must survive ultra
  gxyPos=new Float32Array(gfx.N_GXY*3); gxySize=new Float32Array(gfx.N_GXY); gxyCol=new Float32Array(gfx.N_GXY*3); gxyWave=new Float32Array(gfx.N_GXY);
  for(let i=0;i<gfx.N_GXY;i++){
    let x,y,z,cr,cg,cb,s,wv=0;
    if(i<3200*D){ // nuclear bulge — old, dense, warm
      const r=Math.abs(gauss())*80, th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*60;
      const b=.34+Math.random()*.36;
      cr=b*1.2; cg=b*.9; cb=b*.58; s=2.8+Math.random()*2.4;
    } else if(i<12000*D){ // the bar: boxy/peanut, vertical flare toward the tips
      const u=(Math.random()+Math.random()+Math.random()-1.5)/1.5*BAR_L;
      const v=gauss()*95*(1-0.45*Math.abs(u)/BAR_L);
      y=gauss()*(50+42*Math.abs(u)/BAR_L);
      x=u*sA+v*cA; z=u*cA-v*sA;
      const b=.28+Math.random()*.30;
      cr=b*1.18; cg=b*.87; cb=b*.54; s=2.5+Math.random()*2.2; wv=1; // old, yellow-red stars; the bar is its own rigid pattern
    } else if(i<20500*D){ // inter-arm thin disk: exponential profile, Rd ~2.6 kpc (Gaia-era value), mild outer flare
      const r=expR(360,1780,283), th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*(11+Math.max(0,r-1100)*0.012);
      const b=.055+Math.random()*.075;
      cr=b*.85; cg=b*.9; cb=b*1.1; s=1.5+Math.random()*1.5;
    } else if(i<22000*D){ // thick disk: older and yellower, ~3x the scale height, shorter scale length
      const r=expR(300,1600,220), th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*52;
      const b=.045+Math.random()*.06;
      cr=b*1.02; cg=b*.9; cb=b*.78; s=1.5+Math.random()*1.4;
    } else if(i<24600*D){ // Local (Orion) Spur — the short arm segment the Sun lives in
      const r=900+(Math.random()*2-1)*170+gauss()*26;
      const th=-(r-900)/(900*PITCH)+0.02+gauss()*0.05;
      // wv=2: the spur rides the slow, near-corotation pattern and stays the Sun's home
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*7; wv=2;
      const roll=Math.random();
      if(roll<0.05){ cr=.8; cg=.46; cb=.55; s=3.2+Math.random()*2.2; }
      else if(roll<0.16){ cr=.5; cg=.62; cb=.9; s=2.8+Math.random()*2.4; }
      else { const b=.11+Math.random()*.13; cr=b*.85; cg=b*.95; cb=b*1.15; s=1.6+Math.random()*1.7; }
    } else if(i<28600*D){ // sparse old stellar halo enveloping the disk
      const rr=150+Math.abs(gauss())*1000, th=Math.random()*2*Math.PI, ph=Math.acos(2*Math.random()-1);
      x=rr*Math.sin(ph)*Math.cos(th); z=rr*Math.sin(ph)*Math.sin(th); y=rr*Math.cos(ph)*0.72;
      const b=.05+Math.random()*.06;
      cr=b*1.05; cg=b*.95; cb=b*.85; s=1.6+Math.random()*1.4;
    } else if(i<28600*D+80){ // globular clusters (a fixed ~80: the Milky Way has ~150, not 400) scattered through the halo
      const rr=250+Math.abs(gauss())*1000, th=Math.random()*2*Math.PI, ph=Math.acos(2*Math.random()-1);
      x=rr*Math.sin(ph)*Math.cos(th); z=rr*Math.sin(ph)*Math.sin(th); y=rr*Math.cos(ph)*0.8;
      const b=.35+Math.random()*.25;
      cr=b*1.1; cg=b*1.0; cb=b*.85; s=3.4+Math.random()*2.0;
    } else if(i<42000*D){ // faint extended outer disk (measured to ~2× the classic radius), flaring outward
      const r=1700+Math.pow(Math.random(),1.6)*1250, th=Math.random()*2*Math.PI;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*(6+(r-1700)*0.012);
      const b=.035+Math.random()*.055;
      cr=b*.9; cg=b*.92; cb=b*1.05; s=1.5+Math.random()*1.5;
    } else { // the four arms, growing out of the bar tips
      const arm = Math.random()<0.68 ? ARMS[i%2] : ARMS[2+(i%2)];
      const r=BAR_L+Math.pow(Math.random(),1.1)*1600;
      const spread=0.055+r*0.00006;
      const th=armAngle(r,arm[0])+gauss()*spread;
      x=r*Math.sin(th); z=r*Math.cos(th); y=gauss()*(8-r*0.003);
      wv=1;
      const w=arm[1]*(1-0.45*(r-BAR_L)/1600), roll=Math.random();
      if(roll<0.045){ cr=.95*w; cg=.55*w; cb=.65*w; s=3.0+Math.random()*2.2; }      // pink HII star-forming knots
      else if(roll<0.14){ cr=.65*w; cg=.78*w; cb=1.05*w; s=2.6+Math.random()*2.2; } // young blue clusters
      else { const b=(.13+Math.random()*.17)*w; cr=b*.85; cg=b*.95; cb=b*1.15; s=1.5+Math.random()*1.7; }
    }
    gxyPos[i*3]=x; gxyPos[i*3+1]=y; gxyPos[i*3+2]=z; gxyWave[i]=wv;
    gxySize[i]=s*SS; gxyCol[i*3]=cr*BS; gxyCol[i*3+1]=cg*BS; gxyCol[i*3+2]=cb*BS;
  }

  // ~420 emission nebulae: along the arms, at the bar tips, and in the Local Spur
  gfx.NEB_N = Math.round(2600*D);
  gfx.NEB_PINK = 0; gfx.NEB_GLOW = gfx.NEB_N; gfx.NEB_HALO = 0;   // no runs in the schematic galaxy: all of it is haze
  nebPos=new Float32Array(gfx.NEB_N*3); nebSize=new Float32Array(gfx.NEB_N); nebCol=new Float32Array(gfx.NEB_N*3);
  const nebWave=new Float32Array(gfx.NEB_N);
  {
    const TYPES=[[.058,.018,.030],[.016,.044,.050],[.030,.020,.060],[.052,.033,.014]]; // Hα pink, OIII teal, violet dust-glow, amber
    const TW=[.38,.28,.22,.12];
    let p=0;
    while(p<gfx.NEB_N){
      let r, th, str=1, core=false, nwv=0;
      const kind=Math.random();
      if(kind<0.05){ // soft warm glow enveloping the nucleus
        r=Math.abs(gauss())*70; th=Math.random()*2*Math.PI; str=1.6; core=true;
      } else if(kind<0.14){ // starburst knots at the bar tips — a real feature of barred galaxies
        th=(Math.random()<0.5?BAR_A:BAR_A+Math.PI)+gauss()*0.06;
        r=BAR_L*(0.95+Math.random()*0.15);
      } else if(kind<0.27){ // Local Spur, around the Sun — rides the slow pattern with its stars
        r=900+(Math.random()*2-1)*150;
        th=-(r-900)/(900*PITCH)+0.02+gauss()*0.04; str=0.8; nwv=2;
      } else { // spiral arms
        const arm = Math.random()<0.72 ? ARMS[(Math.random()*2)|0] : ARMS[2+((Math.random()*2)|0)];
        r=BAR_L+40+Math.pow(Math.random(),0.95)*1150;
        th=armAngle(r,arm[0])+gauss()*0.045; str=arm[1];
      }
      const ax=r*Math.sin(th), az=r*Math.cos(th), ay=gauss()*5;
      let roll=Math.random(), ti=0, acc=0;
      for(let k=0;k<4;k++){ acc+=TW[k]; if(roll<acc){ ti=k; break; } }
      if(core) ti=3; // nucleus glows amber
      const col=TYPES[ti], scale=(22+Math.random()*46)*str;
      const puffs=Math.min(gfx.NEB_N-p, 5+((Math.random()*4)|0));
      for(let q=0;q<puffs;q++,p++){
        nebPos[p*3]  =ax+gauss()*scale*0.45;
        nebPos[p*3+1]=ay+gauss()*scale*0.18;
        nebPos[p*3+2]=az+gauss()*scale*0.45;
        nebSize[p]=scale*(0.6+Math.random()*0.8);
        const j=0.7+Math.random()*0.6;
        nebCol[p*3]=col[0]*j*NBS; nebCol[p*3+1]=col[1]*j*NBS; nebCol[p*3+2]=col[2]*j*NBS;
        nebWave[p]=nwv;
      }
    }
  }

  // dark dust lanes — the light-blocking clouds that define real spiral photos:
  // streaks along the inner (concave) edge of each arm, plus the bar's twin lanes
  const XD = D>1 ? Math.round(9000*D) : 0; // hi-fi only: extra discrete dark clouds (Dunkelwolken)
  gfx.DUST_N = Math.round(3400*D) + XD;
  const LANE_N = gfx.DUST_N - XD;
  dustPos=new Float32Array(gfx.DUST_N*3); dustSize=new Float32Array(gfx.DUST_N); dustStr=new Float32Array(gfx.DUST_N*3);
  {
    let p=0;
    while(p<Math.round(420*D)){ // the bar's point-symmetric leading-edge lanes
      const u=(Math.random()*2-1)*BAR_L*0.92, v=(u>0?1:-1)*(34+gauss()*10);
      dustPos[p*3]=u*sA+v*cA; dustPos[p*3+1]=gauss()*8; dustPos[p*3+2]=u*cA-v*sA;
      dustSize[p]=16+Math.random()*22; dustStr[p*3]=(.30+Math.random()*.25)*DS; p++;
    }
    while(p<LANE_N){ // streaks following each arm's inner edge
      const arm = Math.random()<0.7 ? ARMS[(Math.random()*2)|0] : ARMS[2+((Math.random()*2)|0)];
      const r0=BAR_L+30+Math.pow(Math.random(),0.9)*1150;
      const seg=Math.min(LANE_N-p, 4+((Math.random()*4)|0));
      for(let q=0;q<seg;q++,p++){
        const r=r0+q*16+gauss()*6-26;
        const th=armAngle(r,arm[0])+0.030+gauss()*0.016;
        dustPos[p*3]=r*Math.sin(th); dustPos[p*3+1]=gauss()*5; dustPos[p*3+2]=r*Math.cos(th);
        dustSize[p]=18+Math.random()*26;
        dustStr[p*3]=(.22+Math.random()*.28)*arm[1]*DS;
      }
    }
    while(p<gfx.DUST_N){ // Dunkelwolken: discrete dark molecular clouds, arm-hugging but also scattered
      const arm = ARMS[(Math.random()*4)|0];
      let r, th;
      if(Math.random()<0.62){ r=BAR_L+Math.pow(Math.random(),1.05)*1500; th=armAngle(r,arm[0])+gauss()*0.10; }
      else { r=300+Math.pow(Math.random(),0.8)*1650; th=Math.random()*6.28318; }
      const cx=r*Math.sin(th), cz=r*Math.cos(th), cy=gauss()*7;
      const sc=7+Math.random()*26, str=.16+Math.random()*.30;
      const puffs=Math.min(gfx.DUST_N-p, 3+((Math.random()*5)|0));
      for(let q=0;q<puffs;q++,p++){
        dustPos[p*3]=cx+gauss()*sc*.6; dustPos[p*3+1]=cy+gauss()*sc*.22; dustPos[p*3+2]=cz+gauss()*sc*.6;
        dustSize[p]=sc*(.5+Math.random()*.9);
        dustStr[p*3]=str*(.6+Math.random()*.7);
      }
    }
  }
  return { star: { pos: gxyPos!, size: gxySize!, col: gxyCol!, wave: gxyWave! },
           neb:  { pos: nebPos!,  size: nebSize!,  col: nebCol!, wave: nebWave },
           dust: { pos: dustPos!, size: dustSize!, str: dustStr! } };
}

export const MAP_SCALE = 2100/188.6;   // scene units per map pixel: the disk edge lands at 2100

export function mapPick(cdf: Float32Array): number {
  const total = cdf[cdf.length-1], t = Math.random()*total;
  let lo=0, hi=cdf.length-1;
  while(lo<hi){ const mid=(lo+hi)>>1; if(cdf[mid]<t) lo=mid+1; else hi=mid; }
  return lo;
}
export function mapXZ(i: number, spread: number): [number, number] {
  const n=gfx.galaxyMap!.n, c0=(n-1)/2;
  const u=(i%n)+Math.random()-0.5+gauss()*spread, v=((i/n)|0)+Math.random()-0.5+gauss()*spread;
  const x0=(u-c0)*MAP_SCALE, z0=-((v-c0)*MAP_SCALE);
  // Reflected about the BAR AXIS on the way into the scene. The shipped illustration's
  // spiral winds outward-clockwise, which on this page's north-pole view (clockwise
  // rotation, both measured) would be LEADING arms — backwards; a user saw it where two
  // sessions of sign-chasing had not. Reflecting about the bar keeps the bar at its
  // measured 28° while turning the arms around it into trailing ones, so the picture,
  // the armAngle skeleton, the labels, the events and the ice ages all finally agree on
  // where an arm IS. Pinned by 'the arms trail' in boot.spec and tests/unit/winding.
  return [ z0*S2B - x0*C2B, x0*S2B + z0*C2B ];
}
const C2B = Math.cos(2*BAR_A), S2B = Math.sin(2*BAR_A);

export function genGalaxyMap(D: number): GalaxyBuffers {
  let gxyPos, gxySize, gxyCol, gxyWave, nebPos, nebSize, nebCol, dustPos, dustSize, dustStr;

  gfx.N_GXY = Math.round(92000*D);
  const BS = 1/Math.sqrt(D), SS = Math.pow(D,-0.12);
  const NBS = Math.max(Math.pow(D,-0.7), 0.25), DS = 1/D;
  gxyPos=new Float32Array(gfx.N_GXY*3); gxySize=new Float32Array(gfx.N_GXY);
  gxyCol=new Float32Array(gfx.N_GXY*3); gxyWave=new Float32Array(gfx.N_GXY);
  // genGalaxyMap is only ever reached when the map has loaded — setGalaxy chooses between the
  // two generators on exactly that — so this is an invariant rather than a check that could fail.
  const m = gfx.galaxyMap!, pxd = m.px;
  const HALO = Math.round(gfx.N_GXY*0.045);   // the picture is flat; the 3D halo stays procedural
  // The innermost parsecs, below the picture's resolution: a nuclear stellar disc of
  // ~200 pc and, inside it, the compact nuclear star cluster around Sgr A* — linked
  // structures that grow together, fed by gas the bar drives inward (Sormani et al.,
  // A&A 2025; AIP: "How central galactic structures grow together").
  const NSD = Math.round(gfx.N_GXY*0.022), NSC = Math.round(gfx.N_GXY*0.004);
  gfx.NUC0 = HALO; gfx.NUC1 = HALO + NSD + NSC;
  for(let i=0;i<gfx.N_GXY;i++){
    let X,Y,Z,cr,cg,cb,s,wv=0;
    if(i<HALO){
      const rr=150+Math.abs(gauss())*1000, th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
      X=rr*Math.sin(ph)*Math.cos(th); Z=rr*Math.sin(ph)*Math.sin(th); Y=rr*Math.cos(ph)*0.72;
      const b=.05+Math.random()*.06; cr=b*1.05; cg=b*.95; cb=b*.85; s=1.6+Math.random()*1.4;
    } else if(i < HALO+NSD){
      const rr=Math.abs(gauss())*9.5, th=Math.random()*6.28318;   // ~200 pc disc
      X=rr*Math.sin(th); Z=rr*Math.cos(th); Y=gauss()*1.7;
      const b=.10+Math.random()*.14; cr=b*1.12; cg=b*.88; cb=b*.58; s=1.5+Math.random()*1.1; wv=1;
    } else if(i < HALO+NSD+NSC){
      const rr=Math.abs(gauss())*0.42, th=Math.random()*6.28318,  // ~4 pc cluster
            ph=Math.acos(2*Math.random()-1);
      X=rr*Math.sin(ph)*Math.cos(th); Z=rr*Math.sin(ph)*Math.sin(th); Y=rr*Math.cos(ph);
      const b=.30+Math.random()*.45; cr=b*1.05; cg=b*.92; cb=b*.72; s=1.8+Math.random()*1.4; wv=1;
    } else {
      const pI = mapPick(m.starC);
      const w = mapXZ(pI, 0.35); X=w[0]; Z=w[1];
      const l = m.lum[pI], rw = Math.hypot(X,Z);
      const bulge = l*Math.exp(-(rw*rw)/(230*230));      // the yellow centre puffs into 3D
      Y = gauss()*(9 + Math.max(0,rw-1100)*0.012 + 90*bulge);
      const gain = (0.16 + 0.95*Math.pow(l, 1.1)) * (Math.random()<0.03 ? 2.2 : 1);
      cr = pxd[pI*4]/255*gain*0.97; cg = pxd[pI*4+1]/255*gain; cb = pxd[pI*4+2]/255*gain*1.10;
      s = 1.4 + Math.random()*1.8 + (l>0.72 ? Math.random()*1.2 : 0);
      // bright structure and the bar ride the density wave; the smooth background shears
      wv = (l > m.blur[pI]*1.10 || rw < 560) ? 1 : 0;
      // The Local Spur rides the SLOW pattern (wv=2), co-moving with the Sun. Identified
      // geometrically — the map cannot say which arm a pixel belongs to — as bright
      // structure on the spur's own locus. Arithmetic only: the RNG stream must not move.
      if(wv === 1 && Math.abs(rw-900) < 180){
        const dth = Math.atan2(X,Z) - (-(rw-900)/(900*PITCH)+0.02);
        if(Math.abs(Math.atan2(Math.sin(dth), Math.cos(dth))) < 0.10) wv = 2;
      }
    }
    gxyPos[i*3]=X; gxyPos[i*3+1]=Y; gxyPos[i*3+2]=Z; gxyWave[i]=wv;
    gxySize[i]=s*SS; gxyCol[i*3]=cr*BS; gxyCol[i*3+1]=cg*BS; gxyCol[i*3+2]=cb*BS;
  }
  const Dg = Math.min(D, 8);
  const PINK_N = Math.round(2600*D), GLOW_N = Math.round(3800*Dg), CORE_N = Math.round(900*Dg);
  // The hot halo — the circumgalactic medium. The Milky Way sits inside a vast bubble of
  // million-degree gas reaching past 100 kpc, which XMM-Newton and Chandra absorption
  // lines found holds as much ordinary matter as every star in the disk put together.
  // It is far too faint and far too hot to look like anything in visible light, so it is
  // drawn as what it is: an enormous, barely-there X-ray-blue glow, roughly spherical,
  // denser toward the middle, added to the haze population so it needs no new pass.
  const HALO_N = Math.round(2200*Dg);
  gfx.NEB_HALO = HALO_N;
  gfx.NEB_N = PINK_N + GLOW_N + CORE_N + HALO_N;
  gfx.NEB_PINK = PINK_N; gfx.NEB_GLOW = GLOW_N;
  nebPos=new Float32Array(gfx.NEB_N*3); nebSize=new Float32Array(gfx.NEB_N); nebCol=new Float32Array(gfx.NEB_N*3);
  for(let q=0;q<PINK_N;q++){
    const pI = mapPick(m.nebC);
    const w = mapXZ(pI, 0.8);
    nebPos[q*3]=w[0]; nebPos[q*3+1]=gauss()*5; nebPos[q*3+2]=w[1];
    nebSize[q]=16+Math.random()*40;
    const j=(0.7+Math.random()*0.6)*NBS;
    nebCol[q*3]=.16*j; nebCol[q*3+1]=.05*j; nebCol[q*3+2]=.065*j;   // Hα: red-pink, not magenta
  }
  // The haze has to be haze-sized: at galaxy view a 60-unit sprite is a dozen pixels,
  // so these run to 190 units and overlap heavily, which is what unresolved light is.
  const gGain = 0.19/Dg;  // per-puff share of a constant total, whatever the density
  for(let q=PINK_N;q<PINK_N+GLOW_N;q++){
    const pI = mapPick(m.starC);
    const w = mapXZ(pI, 1.1);
    const l = m.lum[pI], rw = Math.hypot(w[0], w[1]);
    nebPos[q*3]=w[0];
    nebPos[q*3+1]=gauss()*(6 + 40*l*Math.exp(-(rw*rw)/(230*230)));
    nebPos[q*3+2]=w[1];
    nebSize[q]=60+Math.random()*130;
    const j=(0.7+Math.random()*0.6)*gGain*(0.4+l);
    // a touch bluer than the pixels: additive stacking over the warm core greys the arms
    nebCol[q*3]=m.px[pI*4]/255*j*0.97; nebCol[q*3+1]=m.px[pI*4+1]/255*j; nebCol[q*3+2]=m.px[pI*4+2]/255*j*1.12;
  }
  // and the golden centre, which the picture renders far brighter than any arm
  { // elongated along the bar at 28 degrees, like the picture's, not a round flare
    const sA=Math.sin(28*Math.PI/180), cA=Math.cos(28*Math.PI/180);
    for(let q=PINK_N+GLOW_N;q<gfx.NEB_N;q++){
      const u=gauss()*165, v=gauss()*80;
      nebPos[q*3]=u*sA+v*cA; nebPos[q*3+1]=gauss()*Math.max(10,42-Math.abs(u)*0.16); nebPos[q*3+2]=u*cA-v*sA;
      nebSize[q]=40+Math.random()*95;
      const j=(0.7+Math.random()*0.6)*0.30/Dg;
      nebCol[q*3]=1.00*j; nebCol[q*3+1]=0.80*j; nebCol[q*3+2]=0.50*j;
    }
  }
  // The hot circumgalactic medium, as eROSITA measured it (MPE, Dec 2023): TWO
  // components, not one. A roughly spherical million-degree halo reaching ~100 kpc —
  // four times the optical Galaxy, holding most of the mass — and a much brighter
  // disk-like component about 7 kpc in radius and 1 kpc thick, which is where most of
  // the observed photons come from. Both are drawn as what they are: an X-ray blue so
  // faint it reads as a presence rather than an object, in sprites large enough to
  // overlap into smooth haze rather than resolve into dots.
  { const H0 = PINK_N + GLOW_N + CORE_N, KPC = 108.72;
    const DISK_N = Math.round(HALO_N*0.34), BUB_N = Math.round(HALO_N*0.20);
    for(let q=H0;q<gfx.NEB_N;q++){
      const k = q - H0, disky = k < DISK_N, bubbly = !disky && k < DISK_N + BUB_N;
      let x, y, z, sz, j;
      if(bubbly){
        // The eROSITA BUBBLES (Predehl et al., Nature 588, 2020): an hourglass of
        // shock-bounded X-ray gas rising ~14 kpc above and below the galactic centre —
        // nearly as tall as the Galaxy is wide, and the X-ray sibling of the Fermi
        // bubbles. Drawn as two shells rooted at the centre, brightest at the rim
        // because that is where the shock is; a legacy of one enormous energy injection
        // from the centre, whether the black hole's or a starburst's.
        const up = Math.random() < 0.5 ? 1 : -1;
        const R = 7*KPC, shell = R*(0.72 + Math.random()*0.28);
        const ct = 2*Math.random() - 1, st = Math.sqrt(Math.max(0, 1 - ct*ct)), ph = Math.random()*6.28318;
        x = shell*st*Math.cos(ph); z = shell*st*Math.sin(ph);
        y = up*(R + shell*ct);                          // lobes centred a radius off the plane
        if(up*y < 0.12*KPC) y = up*0.12*KPC;            // the waist pinches at the disk
        sz = 190 + Math.random()*260;
        j = (0.6 + Math.random()*0.8)*0.016/Dg;
      } else if(disky){
        // the bright inner component: 7 kpc across, 1 kpc scale height
        const r = 7*KPC*Math.sqrt(Math.random()), th = Math.random()*6.28318;
        x = r*Math.cos(th); y = gauss()*KPC*0.5; z = r*Math.sin(th);
        sz = 150 + Math.random()*220;
        j = (0.6 + Math.random()*0.8)*0.020/Dg;
      } else {
        // the great halo: r^-1.5 out to ~100 kpc, so it thins into nothing at the edge
        const r = 2.2*KPC*Math.pow(1 - Math.random()*0.986, -1/1.5);
        const ct = 2*Math.random() - 1, st = Math.sqrt(Math.max(0, 1 - ct*ct)), ph = Math.random()*6.28318;
        x = r*st*Math.cos(ph); y = r*ct*0.85; z = r*st*Math.sin(ph);
        sz = 420 + Math.random()*900;
        j = (0.6 + Math.random()*0.8)*0.0042/Dg;
      }
      nebPos[q*3] = x; nebPos[q*3+1] = y; nebPos[q*3+2] = z;
      nebSize[q] = sz;
      // the bubbles run hotter and harder than the ambient halo, so they read whiter
      if(bubbly){ nebCol[q*3] = 0.72*j; nebCol[q*3+1] = 0.80*j; nebCol[q*3+2] = 1.00*j; }
      else { nebCol[q*3] = 0.34*j; nebCol[q*3+1] = 0.60*j; nebCol[q*3+2] = 1.00*j; }
    }
  }
  const XD = D>1 ? Math.round(9000*D) : 0;
  gfx.DUST_N = Math.round(3400*D)+XD;
  dustPos=new Float32Array(gfx.DUST_N*3); dustSize=new Float32Array(gfx.DUST_N); dustStr=new Float32Array(gfx.DUST_N*3);
  for(let q=0;q<gfx.DUST_N;q++){
    const pI = mapPick(m.dustC);
    const w = mapXZ(pI, 0.5);
    dustPos[q*3]=w[0]; dustPos[q*3+1]=gauss()*5; dustPos[q*3+2]=w[1];
    dustSize[q]=16+Math.random()*28;
    const dk = Math.max(0, m.blur[pI]-m.lum[pI]);
    dustStr[q*3]=(0.35+4.5*dk)*DS*(0.7+Math.random()*0.6);
  }
  return { star: { pos: gxyPos!, size: gxySize!, col: gxyCol!, wave: gxyWave! },
           neb:  { pos: nebPos!,  size: nebSize!,  col: nebCol! },
           dust: { pos: dustPos!, size: dustSize!, str: dustStr! } };
}
