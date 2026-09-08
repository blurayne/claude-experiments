import { $ } from '../core/dom'
import { view } from '../render/state'

/**
 * The QR overlay: the page's whole state as a code on screen, so a phone can be photographed
 * by a laptop and the scene reproduced exactly. It is the debug door's most useful tool and
 * the reason the encoder is here at all.
 *
 * `qrEncode` is a complete QR encoder — byte mode, EC level L, versions 1–40, standard masking
 * by penalty — and it is self-contained, with no tables beyond the version capacity / EC block
 * list, which is the spec's Table 9 for level L. It is pure, and the only thing in the ui/
 * tree that could be unit-tested without a DOM.
 *
 * What it encodes is injected. This module must not import ui/debug, because ui/debug drives
 * this one: it calls qrRedraw whenever the door opens or closes.
 */

let exportState: () => Record<string, unknown> = () => ({})
let isDebug: () => boolean = () => false
let saveSettings: () => void = () => {}

// Where the overlay sits, as fractions of the free space rather than pixels: (1,1) is the
// bottom right corner at any screen size or module scale, so a place chosen by hand survives
// a rotation, a change of scale and a reload.
let qrPos = { x: 1, y: 1 }, qrHeld = false;
export const qrSnapshot = (): { x: number; y: number } => qrPos
export function qrApply(p: { x?: unknown; y?: unknown } | undefined): void {
  if(p && typeof p.x === 'number' && typeof p.y === 'number') qrPos = { x: p.x, y: p.y };
}

// QR encoder: byte mode, EC level L, versions 1–40, standard masking by penalty. Returns
// {n, m} with m a Uint8Array of n*n modules (1 = dark). Self-contained; no tables beyond
// the version capacity/EC block list, which is the spec's Table 9 for level L.
export function qrEncode(text: string, forceMask?: number): { n: number; m: Uint8Array; version: number; mask: number } {
  const bytes = new TextEncoder().encode(text);
  // [total codewords, ec codewords per block, blocks group1, data cw group1, blocks group2, data cw group2] for level L
  // Index 0 is a hole: QR versions are 1-based, and keeping the table that way means every
  // lookup reads as the spec does. `v` is clamped to 1..40 above, so T[v] is never the hole.
  const T: (number[] | null)[] = [null,
    [26,7,1,19,0,0],[44,10,1,34,0,0],[70,15,1,55,0,0],[100,20,1,80,0,0],[134,26,1,108,0,0],[172,18,2,68,0,0],[196,20,2,78,0,0],[242,24,2,97,0,0],[292,30,2,116,0,0],[346,18,2,68,2,69],
    [404,20,4,81,0,0],[466,24,2,92,2,93],[532,26,4,107,0,0],[581,30,3,115,1,116],[655,22,5,87,1,88],[733,24,5,98,1,99],[815,28,1,107,5,108],[901,30,5,120,1,121],[991,28,3,113,4,114],[1085,28,3,107,5,108],
    [1156,28,4,116,4,117],[1258,28,2,111,7,112],[1364,30,4,121,5,122],[1474,30,6,117,4,118],[1588,26,8,106,4,107],[1706,28,10,114,2,115],[1828,30,8,122,4,123],[1921,30,3,117,10,118],[2051,30,7,116,7,117],[2185,30,5,115,10,116],
    [2323,30,13,115,3,116],[2465,30,17,115,0,0],[2611,30,17,115,1,116],[2761,30,13,115,6,116],[2876,30,12,121,7,122],[3034,30,6,121,14,122],[3196,30,17,122,4,123],[3362,30,4,122,18,123],[3532,30,20,117,4,118],[3706,30,19,118,6,119]];
  const ALIGN: (number[] | null)[] = [null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],
    [6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]];
  // version: the first whose data capacity holds mode(4) + count(8|16) + bytes
  let v = 1;
  for(; v <= 40; v++){ const t = T[v]!, dataCW = t[2]*t[3] + t[4]*t[5]; const cnt = v <= 9 ? 8 : 16;
    if(4 + cnt + bytes.length*8 <= dataCW*8) break; }
  if(v > 40) throw new Error('too long for a QR code');
  const t = T[v]!, dataCW = t[2]*t[3] + t[4]*t[5], cnt = v <= 9 ? 8 : 16;
  // data bit stream
  const bits: number[] = []; const put = (val: number, n: number): void => { for(let i=n-1;i>=0;i--) bits.push((val>>i)&1); };
  put(4,4); put(bytes.length, cnt); for(const b of bytes) put(b,8);
  const cap = dataCW*8; for(let i=0;i<4 && bits.length<cap;i++) bits.push(0);
  while(bits.length%8) bits.push(0);
  const data = []; for(let i=0;i<bits.length;i+=8){ let x=0; for(let j=0;j<8;j++) x=(x<<1)|bits[i+j]; data.push(x); }
  for(let k=0; data.length<dataCW; k++) data.push(k%2 ? 0x11 : 0xEC);
  // GF(256) Reed–Solomon
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for(let i=0,x=1;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&256) x^=0x11d; }
  for(let i=255;i<512;i++) EXP[i]=EXP[i-255];
  const mul = (a: number, b: number): number => (a&&b) ? EXP[LOG[a]+LOG[b]] : 0;
  const ecN = t[1]; let gen = [1];
  for(let i=0;i<ecN;i++){ const ng = new Array(gen.length+1).fill(0);
    for(let j=0;j<gen.length;j++){ ng[j] ^= gen[j]; ng[j+1] ^= mul(gen[j], EXP[i]); } gen = ng; }
  const ecOf = (blk: number[]): number[] => { const r = blk.slice().concat(new Array(ecN).fill(0));
    for(let i=0;i<blk.length;i++){ const c = r[i]; if(!c) continue; for(let j=1;j<gen.length;j++) r[i+j] ^= mul(gen[j], c); }
    return r.slice(blk.length); };
  const blocks = [], ecs = []; let p = 0;
  for(let g=0; g<2; g++){ const nb = t[2+2*g], len = t[3+2*g]; for(let b=0;b<nb;b++){ const blk = data.slice(p, p+len); p += len; blocks.push(blk); ecs.push(ecOf(blk)); } }
  const out: number[] = []; const maxLen = Math.max(...blocks.map((b: number[])=>b.length));
  for(let i=0;i<maxLen;i++) for(const b of blocks) if(i<b.length) out.push(b[i]);
  for(let i=0;i<ecN;i++) for(const e of ecs) out.push(e[i]);
  // the matrix
  const n = 17 + 4*v, m = new Uint8Array(n*n), fixed = new Uint8Array(n*n);
  const set = (x: number, y: number, val: number): void => { m[y*n+x] = val; fixed[y*n+x] = 1; };
  const finder = (x0: number, y0: number): void => { for(let dy=-1;dy<=7;dy++) for(let dx=-1;dx<=7;dx++){ const x=x0+dx, y=y0+dy; if(x<0||y<0||x>=n||y>=n) continue;
    const on = (dx>=0&&dx<=6&&dy>=0&&dy<=6) && (dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4)); set(x,y,on?1:0); } };
  finder(0,0); finder(n-7,0); finder(0,n-7);
  for(let i=8;i<n-8;i++){ set(i,6,i%2===0?1:0); set(6,i,i%2===0?1:0); }
  const al = ALIGN[v]!;
  // omitted only where one would overlap a finder — the ones on the timing lines are drawn
  for(const cy of al) for(const cx of al){ if((cx<9&&cy<9)||(cx>n-10&&cy<9)||(cx<9&&cy>n-10)) continue;
    for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) set(cx+dx, cy+dy, (Math.max(Math.abs(dx),Math.abs(dy))!==1)?1:0); }
  set(8, n-8, 1);   // the dark module
  // reserve format (and version) areas
  for(let i=0;i<9;i++){ if(i!==6){ fixed[8*n+i]=1; fixed[i*n+8]=1; } }
  for(let i=0;i<8;i++){ fixed[8*n+(n-1-i)]=1; fixed[(n-1-i)*n+8]=1; }
  if(v>=7){ for(let i=0;i<6;i++) for(let j=0;j<3;j++){ fixed[i*n+(n-11+j)]=1; fixed[(n-11+j)*n+i]=1; } }
  let bi = 0; const total = out.length*8; const bitAt = (k: number): number => (out[k>>3] >> (7-(k&7))) & 1;
  // codewords into the matrix: column pairs from the right, direction alternating, starting upward
  { let up = true;
    for(let x=n-1; x>0; x-=2){ if(x===6) x--;
      for(let k=0;k<n;k++){ const y = up ? n-1-k : k;
        for(let dx=0; dx<2; dx++){ const xx = x-dx; if(fixed[y*n+xx]) continue;
          m[y*n+xx] = bi < total ? bitAt(bi) : 0; bi++; } }
      up = !up; } }
  // masks
  const MASK: ((x: number, y: number) => boolean)[] = [ (x,y)=>(x+y)%2===0, (x,y)=>y%2===0, (x,y)=>x%3===0, (x,y)=>(x+y)%3===0,
    (x,y)=>((y>>1)+Math.floor(x/3))%2===0, (x,y)=>(x*y)%2+(x*y)%3===0, (x,y)=>((x*y)%2+(x*y)%3)%2===0, (x,y)=>((x+y)%2+(x*y)%3)%2===0 ];
  const applyMask = (mk: number, src: Uint8Array): Uint8Array => { const r = new Uint8Array(src); for(let y=0;y<n;y++) for(let x=0;x<n;x++) if(!fixed[y*n+x] && MASK[mk](x,y)) r[y*n+x]^=1; return r; };
  const formatBits = (mk: number): number => { const d = (1<<3)|mk;   // level L = 01 -> value 1 in the two EC bits... (L=01)
    let f = d<<10; const G = 0x537; for(let i=14;i>=10;i--) if((f>>i)&1) f ^= G<<(i-10); return ((d<<10)|f) ^ 0x5412; };
  const writeFormat = (mat: Uint8Array, mk: number): void => { const f = formatBits(mk); const b = (i: number): number => (f>>i)&1;
    const pos1 = [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]];   // (x,y) for bits 14..0
    for(let i=0;i<15;i++){ const [x,y] = pos1[i]; mat[y*n+x] = b(14-i); }
    for(let i=0;i<8;i++) mat[8*n+(n-1-i)] = b(i);                 // bits 0..7 along the top-right row? spec: right of row 8
    for(let i=0;i<7;i++) mat[(n-1-i)*n+8] = b(14-i);              // bits 14..8 down the bottom-left column
  };
  const writeVersion = (mat: Uint8Array): void => { if(v<7) return; let f = v<<12; const G = 0x1f25; for(let i=17;i>=12;i--) if((f>>i)&1) f ^= G<<(i-12); const val = (v<<12)|f;
    for(let i=0;i<18;i++){ const bit = (val>>i)&1; const a = Math.floor(i/3), b = i%3; mat[(n-11+b)*n + a] = bit; mat[a*n + (n-11+b)] = bit; } };
  const penalty = (mat: Uint8Array): number => { let s=0;
    for(let y=0;y<n;y++){ let run=1; for(let x=1;x<n;x++){ if(mat[y*n+x]===mat[y*n+x-1]){ run++; if(run===5) s+=3; else if(run>5) s++; } else run=1; } }
    for(let x=0;x<n;x++){ let run=1; for(let y=1;y<n;y++){ if(mat[y*n+x]===mat[(y-1)*n+x]){ run++; if(run===5) s+=3; else if(run>5) s++; } else run=1; } }
    for(let y=0;y<n-1;y++) for(let x=0;x<n-1;x++){ const a=mat[y*n+x]; if(a===mat[y*n+x+1]&&a===mat[(y+1)*n+x]&&a===mat[(y+1)*n+x+1]) s+=3; }
    const P = [1,0,1,1,1,0,1,0,0,0,0], Q = [0,0,0,0,1,0,1,1,1,0,1];
    const chk = (get: (i: number) => number): void => { for(let i=0;i<=n-11;i++){ let okP=true, okQ=true; for(let k=0;k<11;k++){ const val=get(i+k); if(val!==P[k]) okP=false; if(val!==Q[k]) okQ=false; } if(okP) s+=40; if(okQ) s+=40; } };
    for(let y=0;y<n;y++) chk((i: number)=>mat[y*n+i]); for(let x=0;x<n;x++) chk((i: number)=>mat[i*n+x]);
    let dark=0; for(let i=0;i<n*n;i++) dark+=mat[i]; const pct = dark*100/(n*n); s += Math.floor(Math.abs(pct-50)/5)*10; return s; };
  let best: Uint8Array = m, bestS=Infinity, bestMk=0;
  const tryMasks = forceMask===undefined ? [0,1,2,3,4,5,6,7] : [forceMask];
  for(const mk of tryMasks){ const mat = applyMask(mk, m); writeFormat(mat, mk); writeVersion(mat); const sc = penalty(mat); if(sc<bestS){ bestS=sc; best=mat; bestMk=mk; } }
  return { n, m: best, version: v, mask: bestMk };
}

// The overlay: the exported state (settings, clock, camera — the timestamp left out, so
// the code holds still while nothing changes) as a QR code, redrawn once a second when
// it differs, at 1, 2 or 4 device pixels a module with a four-module quiet zone. Debug

// only; nothing below reaches it when debug mode is off.
const QR_SCALES = [1, 2, 4]; let qrLast = '';
function qrPlace(): void {
  const cv = $('qrOverlay') as HTMLCanvasElement, w = cv.offsetWidth, h = cv.offsetHeight;
  const gap = 8, fx = Math.max(0, innerWidth - w - gap), fy = Math.max(0, innerHeight - h - gap);
  cv.style.left = (gap/2 + fx*Math.min(1, Math.max(0, qrPos.x))) + 'px';
  cv.style.top  = (gap/2 + fy*Math.min(1, Math.max(0, qrPos.y))) + 'px';
}
export function qrRedraw(force?: boolean): void {
  const cv = $('qrOverlay') as HTMLCanvasElement;
  if(!isDebug() || !($('qrOn') as HTMLInputElement).checked){ cv.style.display = 'none'; qrLast = ''; return; }
  const st = exportState(); delete st.exported;
  const payload = JSON.stringify(st);
  if(!force && payload === qrLast) return;
  qrLast = payload;
  let q; try{ q = qrEncode(payload); }catch(e){ cv.style.display = 'none'; return; }
  const sc = QR_SCALES[+($('qrScale') as HTMLInputElement).value] || 2, quiet = 4, size = (q.n + 2*quiet)*sc;
  cv.width = size; cv.height = size;
  cv.style.width = (size/view.DPR) + 'px'; cv.style.height = (size/view.DPR) + 'px';   // sc DEVICE pixels a module
  const g = (cv as HTMLCanvasElement).getContext('2d')!;
  g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); g.fillStyle = '#000';
  for(let y=0;y<q.n;y++) for(let x=0;x<q.n;x++) if(q.m[y*q.n+x]) g.fillRect((x+quiet)*sc, (y+quiet)*sc, sc, sc);
  cv.style.display = 'block';
  if(!qrHeld) qrPlace();   // the canvas has just changed size: keep its corner
}

export function initQr(deps: {
  exportState: () => Record<string, unknown>
  isDebug: () => boolean
  saveSettings: () => void
}): void {
  exportState = deps.exportState; isDebug = deps.isDebug; saveSettings = deps.saveSettings;
  $('qrOn').addEventListener('change', ()=> qrRedraw(true));
  // Movable by finger or mouse, and the canvas below never sees the gesture. A drag ends by
  // recording the corner it was dropped nearest, in the same free-space fractions; a double
  // tap that did not drag switches the overlay off.
  { const cv = $('qrOverlay') as HTMLCanvasElement; let dx = 0, dy = 0, sx = 0, sy = 0, held = false, moved = false, lastTap = 0;
    const record = ()=>{
      const gap = 8, w = cv.offsetWidth, h = cv.offsetHeight;
      const fx = Math.max(1, innerWidth - w - gap), fy = Math.max(1, innerHeight - h - gap);
      qrPos = { x: Math.min(1, Math.max(0, (parseFloat(cv.style.left) - gap/2)/fx)),
                y: Math.min(1, Math.max(0, (parseFloat(cv.style.top)  - gap/2)/fy)) };
      saveSettings();
    };
    cv.addEventListener('pointerdown', e=>{ held = qrHeld = true; moved = false; sx = e.clientX; sy = e.clientY;
      const r = cv.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top;
      try{ cv.setPointerCapture(e.pointerId); }catch(err){} e.stopPropagation(); e.preventDefault(); });
    cv.addEventListener('pointermove', e=>{ if(!held) return;
      if(Math.hypot(e.clientX - sx, e.clientY - sy) > 6) moved = true;
      cv.style.left = Math.max(0, Math.min(innerWidth - cv.offsetWidth, e.clientX - dx)) + 'px';
      cv.style.top  = Math.max(0, Math.min(innerHeight - cv.offsetHeight, e.clientY - dy)) + 'px'; e.stopPropagation(); });
    const drop = (e: PointerEvent): void =>{
      if(!held) return;
      held = qrHeld = false; e.stopPropagation();
      if(moved){ record(); lastTap = 0; return; }
      const now = performance.now();
      if(now - lastTap < 400){ lastTap = 0; ($('qrOn') as HTMLInputElement).checked = false; $('qrOn').dispatchEvent(new Event('change')); saveSettings(); }
      else lastTap = now;
    };
    cv.addEventListener('pointerup', drop); cv.addEventListener('pointercancel', drop);
    addEventListener('resize', ()=>{ if(cv.style.display !== 'none') qrPlace(); }); }
  $('qrScale').addEventListener('input', (e: Event)=>{ $('qrScalev').textContent = QR_SCALES[+(e.target as HTMLInputElement).value] + '×'; qrRedraw(true); });
  setInterval(()=> qrRedraw(false), 1000);
}
