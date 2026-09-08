import { gauss } from '../core/rng'

/**
 * The asteroid belt, the Kuiper belt and the Oort cloud — populations too numerous to place
 * by name and too structured to scatter uniformly.
 *
 * All three are static: generated once at boot and then carried round the Sun by the vertex
 * shader from a radius, an angle and a Kepler period, rather than re-integrated per frame.
 *
 * The asteroid belt is the reason nothing here may be reordered. Its rejection loop over the
 * Kirkwood gaps draws an UNBOUNDED number of times per body — it keeps sampling until a
 * radius survives the resonance test — so the number of values it consumes is data-dependent.
 * Any shift in the seeded stream above it does not move the belt slightly; it moves
 * everything below it too, unrecoverably. This is the fourth of the seven eval-time
 * consumers, and its position is part of the picture.
 */

export interface Belts {
  /** Asteroids: real radii and angles, plus a second remapped set for the compressed layout. */
  abRT: Float32Array; abRTd: Float32Array
  abH: Float32Array; abHd: Float32Array
  abSz: Float32Array
  /** True Kepler period in years, used in both scale modes. */
  abP: Float32Array
  kbRT: Float32Array; kbH: Float32Array; kbSz: Float32Array
  ooOff: Float32Array; ooSz: Float32Array
}

export function buildBelts(): Belts {
  // main asteroid belt: real 2.1-3.3 AU radii with Kirkwood gaps; a second, remapped
  // radius set places it between Mars and Jupiter in the compressed display layout
  const abRT=new Float32Array(AB_N*2), abRTd=new Float32Array(AB_N*2);
  const abH=new Float32Array(AB_N), abHd=new Float32Array(AB_N);
  const abSz=new Float32Array(AB_N), abP=new Float32Array(AB_N);
  {
    const GAPS=[2.502,2.825,2.958]; // Kirkwood gaps: Jupiter's 3:1, 5:2, 7:3 resonances
    for(let i=0;i<AB_N;i++){
      let r;
      for(;;){ r=2.08+Math.pow(Math.random(),0.9)*1.19;
        let ok=true;
        for(const g of GAPS){ const d=Math.abs(r-g); if(d<0.045 && Math.random()>d/0.045){ ok=false; break; } }
        if(ok) break; }
      const th=Math.random()*6.28318;
      abRT[i*2]=r; abRT[i*2+1]=th;
      abRTd[i*2]=14+(r-1.524)/(5.203-1.524)*6; abRTd[i*2+1]=th; // Mars(14)..Jupiter(20); Ceres lands on its display 16
      abH[i]=gauss()*r*0.09; abHd[i]=gauss()*abRTd[i*2]*0.045;
      abSz[i]=0.22+Math.random()*0.34;
      abP[i]=Math.pow(r,1.5); // true Kepler period in years, used in both scale modes
    }
  }
  const kbRT=new Float32Array(KB_N*2), kbH=new Float32Array(KB_N), kbSz=new Float32Array(KB_N);
  for(let i=0;i<KB_N;i++){
    let r,h;
    if(Math.random()<0.7){ r=42+Math.random()*8;  h=gauss()*r*0.07; }  // classical belt (30–50 AU)
    else { r=44+Math.pow(Math.random(),0.7)*22;   h=gauss()*r*0.17; }  // scattered disk
    kbRT[i*2]=r; kbRT[i*2+1]=Math.random()*6.28318; kbH[i]=h; kbSz[i]=0.32+Math.random()*0.38;
  }
  const ooOff=new Float32Array(OO_N*3), ooSz=new Float32Array(OO_N);
  for(let i=0;i<OO_N;i++){
    const r=90+Math.pow(Math.random(),0.6)*85;
    const th=Math.random()*6.28318, ph=Math.acos(2*Math.random()-1);
    ooOff[i*3]=r*Math.sin(ph)*Math.cos(th); ooOff[i*3+1]=r*Math.cos(ph); ooOff[i*3+2]=r*Math.sin(ph)*Math.sin(th);
    ooSz[i]=0.6+Math.random()*0.6;
  }
  return { abRT, abRTd, abH, abHd, abSz, abP, kbRT, kbH, kbSz, ooOff, ooSz }
}

export const AB_N = 1500;
export const KB_N = 1600;
export const OO_N = 2400; // Oort cloud: symbolically close — really 2,000–100,000+ AU out
