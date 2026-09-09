import { $ } from '../core/dom'
import { mul } from '../core/mat4'
import { AU2U, REAL_MODE, RC_BAR, RC_ARMS } from '../astro/constants'
import { BODIES, NB, N_PLANETS, I_P9 } from '../astro/bodies'
import { M31_ROT } from '../astro/merger'
import { SKY_LABELS } from '../scene/skybox'
import { gfx, readout, view } from './state'
import { bodyPosArr } from './passes/bodies'
import { moonRel } from '../astro/earth'

/**
 * Every name on the screen. They are DOM, not GL: HTML text over the canvas, positioned each
 * frame from the same projection the renderer used.
 *
 * Six pools, built once at boot and then only moved and hidden — the bodies, the Moon, the
 * solar system's structures, the Milky Way's arms, Andromeda and her companions, and the
 * merged remnant. Gliese 710 has one of her own. Creating and destroying elements per frame
 * would be the obvious alternative and it thrashes layout.
 */

const labelWrap = $('labels');

export const labelEls = BODIES.map(b=>{
  // display:none like every other label group — without it a body label that has never
  // been shown carries an empty inline display, which is VISIBLE, and placeLabel's hide
  // could not clear it because it only acted on labels it had itself turned on.
  const d=document.createElement('div'); d.className='lbl'; d.textContent=b[0] as string;
  d.style.display='none'; labelWrap.appendChild(d); return d;
});
export const moonEl = (()=>{ const d=document.createElement('div'); d.className='lbl'; d.textContent='Moon'; d.style.display='none'; d.style.opacity='0.65'; labelWrap.appendChild(d); return d; })();
// The solar system's own structures, labelled at their real radii. Each label sits on
// its ring at the Sun's side, appears only while its structure is switched on and its
// ring is actually resolvable on screen, and hides again when it would be a dot.
// The switches themselves belong to the interface, so they arrive as `structOn`.
const STRUCTS: readonly (readonly [string, number])[] = [   // name, ring radius in AU
  ['asteroid belt', 2.7],
  ['Kuiper belt',   44],
  ['Oort cloud',    63241],       // one light year, mid-shell
];
const structEls = STRUCTS.map(s=>{
  const d=document.createElement('div'); d.className='lbl'; d.textContent=s[0];
  d.style.display='none'; d.style.opacity='0.55'; labelWrap.appendChild(d); return d;
});
// Spiral-arm names, placed on this map's measured bright ridges and named by their
// radial order from the Sun, after the canonical face-on annotation. Each rides ITS OWN
// pattern, exactly as the structure it names does in the shader: the bar-driven arms the
// fast pattern (RC_BAR), the Orion Spur the slow near-corotation one (RC_ARMS) — so the
// spur's name stays with the Sun's neighbourhood while the arm names sweep past.
// The four bar-pattern anchors sit ON their armAngle loci (checked by tests/unit/winding):
// with the map's winding fixed, the drawn ridges and the analytic skeleton finally agree,
// so a label can be computed instead of eyeballed. Sagittarius–Carina inside the Sun's
// radius, Perseus just outside, the Outer Arm far out — the real radial order from home.
const ARM_LBLS: readonly (readonly [string, number, number, number])[] = [
  ['Orion Spur',          150,  830, RC_ARMS],
  ['Sagittarius–Carina',  129,  749, RC_BAR],
  ['Perseus',             168, 1067, RC_BAR],
  ['Scutum–Centaurus',   -600,  360, RC_BAR],
  ['Outer Arm',           563, 1336, RC_BAR],
  ['Galactic bar',         30,   40, RC_BAR],
];
export const armEls = ARM_LBLS.map(a=>{
  const d=document.createElement('div'); d.className='armlbl'; d.textContent=a[0];
  d.style.display='none'; labelWrap.appendChild(d); return d;
});
// Andromeda and company, positioned in its own disk frame and carried on its orbit.
// The named structure joined in v3.3: the 10-kpc star-forming ring (Baade's N4/S4 arm
// segments are largely pieces of it), the smaller inner dust ring the M32 plunge left
// off-centre, and NGC 206, the brightest star cloud in M31 — placed at its real side of
// the sky (southwest, on the ring; disk azimuth solved from the orientation chain, see
// tests/unit/m31-orientation). The rings are circles, so their labels are free to sit
// at whatever azimuth reads clearly. The three disk features ride the disk's own wave
// rotation, unlike the satellites, which sit still in her frame.
const M31_LBLS: readonly (readonly [string, number, number, number])[] = [
  ['Andromeda (M31)', 0, 60, 0],
  ['M32', -150, -80, 530],
  ['M110', 760, 240, -420],
  ['Giant Southern Stream', 1030, -1330, -2420],
  ['10-kpc ring', 545, 0, -944],
  ['inner ring', 126, 0, 134],
  ['NGC 206', -1053, 0, 282],
];
/** the entries that are disk material rather than companions: they turn with the disk */
const M31_DISK_FROM = 4;
const m31Els = M31_LBLS.map(a=>{
  const d=document.createElement('div'); d.className='armlbl'; d.textContent=a[0];
  d.style.display='none'; labelWrap.appendChild(d); return d;
});
// One galaxy, one name: once the two disks have become a single blob the remnant is
// Milkomeda (Cox & Loeb 2008), and every other galaxy name has already stepped down.
// the nearest galaxies beyond our pair, named over their skybox photographs; they are
// extragalactic, so unlike everything else these labels survive the merger
const skyEls = SKY_LABELS.map(a=>{
  const d=document.createElement('div'); d.className='armlbl'; d.textContent=a.name;
  d.style.display='none'; labelWrap.appendChild(d); return d;
});
const mergedEl = (()=>{ const d=document.createElement('div'); d.className='armlbl'; d.textContent='Milkomeda';
  d.style.display='none'; labelWrap.appendChild(d); return d; })();
const g710Lbl = (()=>{ const d=document.createElement('div'); d.className='lbl'; d.textContent='Gliese 710';
  d.style.color='rgba(255,190,140,.9)'; labelWrap.appendChild(d); return d; })();

/** The easing state a steady label carries, parked on the element itself. */
interface LabelState { x: number; y: number; on: boolean; hid: number; leaps: number; calm: number; spin: boolean }
type Label = HTMLElement & { _lb?: LabelState }

/**
 * Steady labels, and the switch that turns the steadying off.
 *
 * A label follows its target by easing (a short time constant, so it never visibly lags),
 * holds still through a single leap (a scenario jump, a reappearance — a label should land,
 * not fly across the screen), and steps aside while its target leaps frame after frame: a
 * planet sweeping round its orbit several times a second is motion no label can follow, and
 * one that tries just spins. It comes back once the motion has been calm for a dozen frames.
 * Hiding is debounced too, so a target flickering across a visibility threshold does not
 * blink its name. Off, it is the old direct placement.
 */
let labelSteady = true;
export const setLabelSteady = (on: boolean): void => { labelSteady = on };

export function placeLabel(el: Label, x: number, y: number, show: boolean): void {
  if(!labelSteady){
    if(show){ el.style.display='block'; el.style.left=x+'px'; el.style.top=y+'px'; }
    else el.style.display='none';
    return;
  }
  const s = el._lb || (el._lb = { x, y, on:false, hid:0, leaps:0, calm:99, spin:false });
  if(!show){
    s.hid += readout.frameDt; s.x = x; s.y = y;
    // written against the ELEMENT's state, not this module's memory of it: a label the
    // page put on screen some other way must still be able to go away.
    if(s.hid > 0.18 && el.style.display !== 'none'){ el.style.display='none'; s.on=false; }
    return;
  }
  s.hid = 0;
  const leap = Math.hypot(x - s.x, y - s.y) > 90;
  if(leap){ s.leaps = Math.min(6, s.leaps + 2); s.calm = 0; } else { s.leaps = Math.max(0, s.leaps - 1); s.calm++; }
  if(s.spin){                                  // stepped aside: wait for calm
    s.x = x; s.y = y;
    if(s.calm < 12) return;
    s.spin = false;
  } else if(s.leaps >= 4){                     // leaping every frame: whirling
    s.spin = true; s.x = x; s.y = y;
    if(s.on){ el.style.display='none'; s.on=false; }
    return;
  }
  if(!s.on || leap){ s.x = x; s.y = y; }        // land; never fly
  else { const k = 1 - Math.exp(-readout.frameDt/0.06); s.x += (x - s.x)*k; s.y += (y - s.y)*k; }
  s.on = true;
  el.style.display='block'; el.style.left=s.x+'px'; el.style.top=s.y+'px';
}

export interface LabelInputs {
  projMat: Float32Array
  viewMat: Float32Array
  pxScale: number
  camDist: number
  /** the rendering origin, and Andromeda's place */
  org: Float64Array
  andPos: Float32Array
  /** how far the merger has run, and how far apart the two still are */
  merge: number
  sep: number
  /** the Milky Way's accumulated wave rotation — the arm names ride it */
  spinMW: number
  spinM31: number
  /** false before the solar system formed: no Sun, no planets, no names for them */
  bornYet: boolean
  /** the disk's settledness: arm names only exist once there are arms to name */
  asm: number
  /** where Gliese 710 is, in light years */
  star: { x: number; y: number; z: number; d: number }
  /** which bodies are drawn at all, and which have been swallowed */
  showP9: boolean
  showDwarfs: boolean
  wasEaten: readonly boolean[]
  /** the three structure switches, in STRUCTS order */
  structOn: readonly boolean[]
  /** the arm and galaxy names are a switch of their own */
  armsOn: boolean
}

/**
 * Place every label for this frame. `showLabels` off still runs one call — Gliese 710's name
 * has to be taken down, and it is the only label placed outside the main block.
 */
export function drawLabels(showLabels: boolean, inputs: LabelInputs): void {
  if(!showLabels){ placeLabel(g710Lbl, 0, 0, false); return }
  const { projMat, viewMat, pxScale, camDist, org, andPos, merge, sep, spinMW, spinM31, asm, bornYet, star,
          showP9, showDwarfs, wasEaten, structOn, armsOn } = inputs;
  const pv = mul(projMat, viewMat);
  const proj = (x: number, y: number, z: number): number[] => { const cw = pv[3]*x+pv[7]*y+pv[11]*z+pv[15];
    return [cw, ((pv[0]*x+pv[4]*y+pv[8]*z+pv[12])/cw*0.5+0.5)*view.W, (-(pv[1]*x+pv[5]*y+pv[9]*z+pv[13])/cw*0.5+0.5)*view.H]; };
  let sunSX=0, sunSY=0;
  for(let i=0;i<NB;i++){
    const l=labelEls[i] as Label;
    if(!bornYet){ placeLabel(l, 0, 0, false); continue; }   // nothing here has formed yet
    if(i === I_P9 ? !showP9 : (i >= N_PLANETS && !showDwarfs)){ placeLabel(l, 0, 0, false); continue; }
    if(i > 0 && i <= 3 && wasEaten[i]){ placeLabel(l, 0, 0, false); continue; }   // swallowed
    if(readout.globePx > 40 && i > 0){ placeLabel(l, 0, 0, false); continue; }          // zoomed onto Earth: only the Sun's place in the sky
    if(i === 0) l.textContent = readout.pnShown ? 'Anthropic Nebula' : 'Sun';
    const [cw, lsx, lsy] = proj(bodyPosArr[i*3], bodyPosArr[i*3+1], bodyPosArr[i*3+2]);
    if(cw<=Math.max(1e-9,camDist*0.01) || camDist>900){ placeLabel(l, 0, 0, false); continue; }
    if(i===0){ sunSX=lsx; sunSY=lsy; }
    else if(REAL_MODE && Math.hypot(lsx-sunSX,lsy-sunSY)<14){ placeLabel(l, 0, 0, false); continue; }
    placeLabel(l, lsx, lsy, true);
    l.style.opacity = i===0?'0.9':'0.65';
  }
  // the Moon: labelled while it is drawn as a disc and stands clear of Earth's label
  if(readout.moonPx > 1.5){
    const [cw, mx, my] = proj(moonRel[0], moonRel[1], moonRel[2]);
    const [ , ex, ey] = proj(bodyPosArr[9], bodyPosArr[10], bodyPosArr[11]);
    placeLabel(moonEl, mx, my, cw > 0 && Math.hypot(mx-ex, my-ey) > 16);
  } else placeLabel(moonEl, 0, 0, false);
  // structure labels: a point on each ring, Sun-relative like the rings themselves
  for(let s=0;s<STRUCTS.length;s++){
    const el = structEls[s] as Label;
    if(!structOn[s] || !bornYet){ placeLabel(el, 0, 0, false); continue; }   // the belts form with the Sun
    const rU = STRUCTS[s][1]*AU2U;
    const rpx = rU*pxScale/camDist;
    if(readout.globePx > 40){ el.style.display = 'none'; if(el._lb) el._lb.on = false; continue; }   // at once, not debounced
    if(rpx < 46 || rpx > 2600){ placeLabel(el, 0, 0, false); continue; }
    const [cw, sx, sy] = proj(rU*0.71, 0, rU*0.71);    // 45 degrees round the ring
    placeLabel(el, sx, sy, cw > 1e-9);
  }
  const galaxyNames = armsOn && camDist > 600;
  // arm names: world coordinates rotated with the wave, then projected like the rest
  // (once the remnant starts to relax there are no arms left to name)
  if(galaxyNames && merge < 0.35 && asm > 0.85){   // no arms before the disk settles, no names either
    for(let a=0;a<ARM_LBLS.length;a++){
      const d = spinMW/ARM_LBLS[a][3], cD = Math.cos(d), sD = Math.sin(d);
      const wx = ARM_LBLS[a][1]*cD + ARM_LBLS[a][2]*sD, wz = ARM_LBLS[a][2]*cD - ARM_LBLS[a][1]*sD;
      const [cw, sx, sy] = proj(wx-org[0], -org[1], wz-org[2]);
      placeLabel(armEls[a] as Label, sx, sy, cw > 1);
    }
  } else armEls.forEach(l=>placeLabel(l as Label, 0, 0, false));
  // named together, retired together: past this point the two disks already render as
  // one blob, so naming only "Andromeda" there would mislabel the Milky Way's own remnant
  if(galaxyNames && merge < 0.35){
    const cD = Math.cos(spinM31/650), sD = Math.sin(spinM31/650);   // her wave rotation, as the shader turns it
    let m31CW = 1e9;
    for(let a=0;a<M31_LBLS.length;a++){
      // the satellites and the stream exist only in the map-built Andromeda
      if(a > 0 && !gfx.m31Map){ placeLabel(m31Els[a] as Label, 0, 0, false); continue; }
      const L = M31_LBLS[a];
      // the ring and star-cloud labels ride the disk like the points they name
      const lx = a >= M31_DISK_FROM ? L[1]*cD + L[3]*sD : L[1];
      const lz = a >= M31_DISK_FROM ? L[3]*cD - L[1]*sD : L[3];
      const wx = M31_ROT[0]*lx+M31_ROT[3]*L[2]+M31_ROT[6]*lz+andPos[0];
      const wy = M31_ROT[1]*lx+M31_ROT[4]*L[2]+M31_ROT[7]*lz+andPos[1];
      const wz = M31_ROT[2]*lx+M31_ROT[5]*L[2]+M31_ROT[8]*lz+andPos[2];
      const [cw, sx, sy] = proj(wx-org[0], wy-org[1], wz-org[2]);
      if(a === 0) m31CW = cw;   // the nucleus's view distance: how large the disk projects
      // the small companions only earn a name once Andromeda fills some of the view; the
      // ring and star-cloud names need more still — a disk spanning a few hundred pixels —
      // or they pile up on a thumbnail-sized galaxy
      const show = cw > 1 && (a === 0
        || (a < M31_DISK_FROM ? sep <= 0.9*camDist + 4000 : pxScale*2245/Math.max(m31CW, 1) > 240));
      placeLabel(m31Els[a] as Label, sx, sy, show);
    }
  } else m31Els.forEach(l=>placeLabel(l as Label, 0, 0, false));
  // the skybox names: pinned to the far sphere, Sun-relative like their images, shown
  // whenever the view is wide enough to be looking at sky at all
  for(let a=0;a<SKY_LABELS.length;a++){
    const L = SKY_LABELS[a].p;
    const [cw, sx, sy] = proj(L[0], L[1], L[2]);
    placeLabel(skyEls[a] as Label, sx, sy + 12, galaxyNames && cw > 1);
  }
  // one galaxy, one name: from the moment the disks are one blob, the remnant's centre
  { const [cw, sx, sy] = proj(-org[0], -org[1], -org[2]);
    placeLabel(mergedEl, sx, sy, galaxyNames && merge >= 0.35 && cw > 1); }
  if(star.d < 40){
    const k = REAL_MODE ? 1/30 : 178/1.6;
    const [cw, sx, sy] = proj(star.x*k, star.y*k, star.z*k);
    placeLabel(g710Lbl, sx, sy, cw > Math.max(1e-9,camDist*0.01) && camDist <= 900);
  } else placeLabel(g710Lbl, 0, 0, false);
}
