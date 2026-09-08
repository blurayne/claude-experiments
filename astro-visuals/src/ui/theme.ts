/**
 * The interface colour follows the hazard.
 *
 * Blended rather than stepped, because the hazard itself varies continuously with where the
 * Sun sits: cosmic rays climb as it enters a spiral arm and fall again on the way out, so the
 * panels warm and cool with the crossing instead of flipping at a threshold.
 *
 * Everything it does, it does through four CSS custom properties on the root element —
 * --stateRGB, --stateA, --lifeRGB, --iceA — and two text colours. Nothing here reaches into a
 * panel: the stylesheet decides what a hazard colour means, and this decides what the hazard is.
 */

// Temperature as colour, on the scale the user set: −20 is ice, +50 is extreme heat,
// +60 and beyond is the violet of a world past saving. The stops in between are chosen
// so that Earth's own comfortable range reads green rather than alarming.
const T_STOPS: readonly (readonly [number, number[]])[] = [
  [-60, [120,170,255]], [-20, [ 74,168,255]], [  0, [102,216,232]],
  [ 15, [ 95,211,154]], [ 30, [255,209,102]], [ 50, [255, 90, 74]],
  [ 60, [196,107,255]], [ 90, [214,140,255]],
];
export function tempColour(c: number): string {
  const s = T_STOPS;
  if(c <= s[0][0]) return 'rgb('+s[0][1].join(',')+')';
  for(let i=1;i<s.length;i++){
    if(c <= s[i][0]){
      const u = (c - s[i-1][0])/(s[i][0] - s[i-1][0]);
      const a = s[i-1][1], b = s[i][1];
      return 'rgb('+a.map((v,k)=> Math.round(v + (b[k]-v)*u)).join(',')+')';
    }
  }
  return 'rgb('+s[s.length-1][1].join(',')+')';
}
const C_SAFE = [95,216,255], C_WARN = [255,207,92], C_DEAD = [255,110,110], C_ICE = [176,232,255];
const C_LIFE = [74,214,126];   // habitable reads green, not the interface's cyan
const mix3 = (a: number[], b: number[], u: number): number[] => [a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u, a[2]+(b[2]-a[2])*u];
const INK_WARM = [220,232,245], DIM_WARM = [132,146,172];   // the unfrozen text colours
const rgbStr = (c: number[]): string => 'rgb('+c.map(v=>Math.round(v)).join(',')+')';
let lastRGB = '', lastA = -1, lastIce = -1, lastWhite = -1, iceShown = 0, iceLast = performance.now();
export function setStateColour(h: number, meanC: number): void {
  h = Math.min(1, Math.max(0, h));
  let rgb = h < 0.5 ? mix3(C_SAFE, C_WARN, h/0.5) : mix3(C_WARN, C_DEAD, (h-0.5)/0.5);
  // how cold the climate model runs, eased in over the couple of degrees around the
  // glacial threshold so the frost arrives gradually too
  const coldNow = Math.min(1, Math.max(0, (11.9 - meanC)/2.4));
  { // ease toward it over about a second, independent of frame rate
    const now = performance.now(), dt = Math.min(0.1, (now - iceLast)/1000); iceLast = now;
    iceShown += (coldNow - iceShown) * Math.min(1, dt*1.6);
  }
  const cold = iceShown;
  if(cold > 0) rgb = mix3(rgb, C_ICE, cold*(1-h)*0.85);
  const amt = Math.min(1, Math.max(h, cold*0.75));
  const life = h < 0.5 ? mix3(C_LIFE, C_WARN, h/0.5) : mix3(C_WARN, C_DEAD, (h-0.5)/0.5);
  // A frozen interface reads white. Anything already carrying a warning is left as it
  // is: the whitening fades out as the hazard rises into amber, and is gone by the time
  // it is red. The life-support word keeps its own ramp throughout — it is the one
  // reading whose colour is the message.
  // cold rarely reaches its ceiling, so the curve is steepened: a real glacial should
  // read white, not merely pale
  // The gate has to start where the colour actually turns amber, not at zero hazard: a
  // glacial epoch is caused by high cosmic rays, so it always carries some hazard of its
  // own, and ramping from zero meant a deep freeze suppressed its own whitening.
  const gate = 1 - Math.min(1, Math.max(0, (h - 0.30)/0.04));
  const whiten = Math.min(1, cold*1.6) * gate;
  rgb = mix3(rgb, [255,255,255], whiten);
  const s = rgb.map(v=>Math.round(v)).join(',');
  const a = Math.round(amt*100)/100;
  const ia = Math.round(cold*100)/100;
  if(ia !== lastIce){
    lastIce = ia;
    document.documentElement.style.setProperty('--iceA', String(ia));
  }
  const wr = Math.round(whiten*100)/100;
  if(wr !== lastWhite){
    lastWhite = wr;
    const st2 = document.documentElement.style;
    st2.setProperty('--ink', rgbStr(mix3(INK_WARM, [255,255,255], wr)));
    st2.setProperty('--dim', rgbStr(mix3(DIM_WARM, [228,242,255], wr)));
  }
  if(s === lastRGB && a === lastA) return;   // only touch styles when it actually moves
  lastRGB = s; lastA = a;
  // On the root element, not the body: --accent and --glow are declared on :root and
  // resolve their var() there, so an override further down never reaches them.
  const st = document.documentElement.style;
  st.setProperty('--stateRGB', s);
  st.setProperty('--stateA', String(a));
  st.setProperty('--lifeRGB', life.map(v=>Math.round(v)).join(','));
}
