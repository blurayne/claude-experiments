/* ============================================================================
   HORDE — 'dualcco' map style ("Interlocking combs")
   ----------------------------------------------------------------------------
   generate(seed, opts) → { bounds, nodes, edges, meta } in µm, y down (see net.js);
   opts.width / opts.height (default 22000 × 14000); opts.layout 'horizontal' |
   'vertical' forces the orientation (otherwise chosen by seed).

   Coupled dual-tree Constrained Constructive Optimization (CCO) on a comb:
   1. Skeleton. The map is cut into tilted, gently bowed stripes 2.9-4.2 mm
      apart (4-5 across a landscape map, 6-7 in the seed-chosen vertical
      layout) that alternate arterial / venous. Each trunk enters at a seed-
      chosen point perpendicular to its own edge and forks in a Y whose arms
      curve into a spine along that edge; the spine sends a finger along each
      of its stripes towards the far side.
      Where the outermost stripe belongs to the other tree, the spine ends in
      a corner arc that meets that tree's edge finger through an AV connector,
      so all four corners are held.
   2. Partners. Every other finger tip gets a short branch of the facing tree
      (a CCO splice) and a connector that continues the finger's heading.
   3. Capillary units: arterial tip + connector + venous tip, grown one at a
      time. Sites are "bridges" (two free junction slots on facing arterial and
      venous segments, largest pocket first), then the largest empty circles
      of a wall-distance field, then random probes. Each tip splices the least-
      cost segment of its own tree at the weighted Fermat–Weber point of the
      three limbs (Weiszfeld, weights flow^(2/γ) = minimum Σ r² l under
      Murray's law), with fallbacks along the segment's free stretch. A splice
      must keep the tissue gap to both trees and the connectors (capsules with
      anticipated final radii and the metric's one- and two-hop junction
      exemptions), junction spacing, limb lengths, physiological angles, bend
      its host by at most 40°, and run artery → connector → vein without a
      hook or U-turn. If the map is still sparse, a second pass relaxes the
      bend limits a little.
   4. Tips left without a connector try once more to grow a partner, else they
      are pruned back (their junction stays as a pass-through node).
   5. Geometry: Murray radii (γ 2.7) from terminal targets 198 / 226 µm, the
      root edge tapering from the trunk radius 700 / 800. Cubic Hermite edges:
      the parent arrives along the flow-weighted mean of its children and the
      larger child is pulled towards it, so the thinner child deflects more.
      Gentle meander, connectors pinched to 104-134 µm, arc-length resampling.
   6. A self-check mirroring the SPEC metric repairs the map: straighten
      violating edges towards their validated chords, thin the whole bed a
      little, and only then prune a unit (never a corner connector first).
   If the map misses the quality bar (largest void, connector count), up to
   two more deterministic attempts are made and the best one is kept.
   ========================================================================== */
(function(){
'use strict';

function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
const hyp = (x, y) => Math.sqrt(x*x + y*y), PI = Math.PI;

// ------------------------------------------------------------------ 2D helpers
function psd(px,py,x0,y0,x1,y1){ const vx=x1-x0, vy=y1-y0, L2=vx*vx+vy*vy; let t=L2>0?((px-x0)*vx+(py-y0)*vy)/L2:0; t=t<0?0:t>1?1:t; return hyp(px-x0-vx*t, py-y0-vy*t); }
function orient(ax,ay,bx,by,cx,cy){ return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax); }
function segCross(ax,ay,bx,by,cx,cy,dx,dy){ const d1=orient(ax,ay,bx,by,cx,cy), d2=orient(ax,ay,bx,by,dx,dy), d3=orient(cx,cy,dx,dy,ax,ay), d4=orient(cx,cy,dx,dy,bx,by);
  return ((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0)); }
function ssd(ax,ay,bx,by,cx,cy,dx,dy){ if(segCross(ax,ay,bx,by,cx,cy,dx,dy)) return 0;
  return Math.min(psd(ax,ay,cx,cy,dx,dy), psd(bx,by,cx,cy,dx,dy), psd(cx,cy,ax,ay,bx,by), psd(dx,dy,ax,ay,bx,by)); }
const gapReq = (ra, rb) => Math.max(150, 0.6*Math.min(ra, rb));
function unit(x, y){ const l = hyp(x,y)||1; return [x/l, y/l]; }
function slerp2(a, b, t){ return unit(a[0]*(1-t)+b[0]*t, a[1]*(1-t)+b[1]*t); }
function angBetween(a, b){ return Math.acos(Math.max(-1, Math.min(1, a[0]*b[0]+a[1]*b[1]))); }
const turn = (a, b) => Math.atan2(a[0]*b[1] - a[1]*b[0], a[0]*b[0] + a[1]*b[1]);   // signed angle from a to b
function smooth(t){ return t*t*(3-2*t); }

// largest distance from any point of the map to a vessel wall (140 µm vector-propagation EDT, sampled like the metric)
function maxVoid(net, W, H){
  const C = 140, NX = Math.ceil(W/C), NY = Math.ceil(H/C), N = NX*NY, BIG = 1e6;
  const vx = new Float32Array(N).fill(BIG), vy = new Float32Array(N).fill(BIG);
  for(const e of net.edges) for(const pt of e.pts){ const x = pt[0], y = pt[1], r = pt[2];
    const i0 = Math.max(0, Math.ceil((x-r)/C - 0.5)), i1 = Math.min(NX-1, Math.floor((x+r)/C - 0.5));
    const j0 = Math.max(0, Math.ceil((y-r)/C - 0.5)), j1 = Math.min(NY-1, Math.floor((y+r)/C - 0.5));
    for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){ const dx = (i+0.5)*C-x, dy = (j+0.5)*C-y; if(dx*dx+dy*dy <= r*r){ vx[j*NX+i] = 0; vy[j*NX+i] = 0; } } }
  const d2 = k => vx[k]*vx[k] + vy[k]*vy[k];
  const tryN = (k, n, ox, oy) => { const ax = vx[n]+ox, ay = vy[n]+oy; if(ax*ax+ay*ay < d2(k)){ vx[k] = ax; vy[k] = ay; } };
  for(let j=0;j<NY;j++){
    for(let i=0;i<NX;i++){ const k = j*NX+i; if(i) tryN(k, k-1, 1, 0); if(j){ tryN(k, k-NX, 0, 1); if(i) tryN(k, k-NX-1, 1, 1); if(i<NX-1) tryN(k, k-NX+1, 1, 1); } }
    for(let i=NX-2;i>=0;i--) tryN(j*NX+i, j*NX+i+1, 1, 0); }
  for(let j=NY-1;j>=0;j--){
    for(let i=NX-1;i>=0;i--){ const k = j*NX+i; if(i<NX-1) tryN(k, k+1, 1, 0); if(j<NY-1){ tryN(k, k+NX, 0, 1); if(i<NX-1) tryN(k, k+NX+1, 1, 1); if(i) tryN(k, k+NX-1, 1, 1); } }
    for(let i=1;i<NX;i++) tryN(j*NX+i, j*NX+i-1, 1, 0); }
  let m = 0;   // sampled like the SPEC metric: a 110-column grid of cell centres
  const GX = 110, GY = Math.max(10, Math.round(GX*H/W));
  for(let j=0;j<GY;j++) for(let i=0;i<GX;i++){
    const k = Math.min(NY-1, Math.floor((j+0.5)*H/GY/C))*NX + Math.min(NX-1, Math.floor((i+0.5)*W/GX/C)), d = d2(k); if(d > m) m = d; }
  return Math.sqrt(m)*C;
}

// ------------------------------------------------------------------ one deterministic attempt
function attempt(seed, att, W, H, opts){
  const rnd = mulberry32((seed|0)*2654435761 + 977 + att*40503);
  const GAM = 2.7;                              // Murray exponent
  const R_ART = 700, R_VEN = 800;               // trunk radii (SPEC)
  const RT_A = 198, RT_V = 226;                 // terminal radius targets (SPEC ~160-240)
  const AREA_F = W*H/(22000*14000);
  const NP = Math.round(19*AREA_F) + Math.floor(rnd()*3);   // nominal final tip count (drives the radius estimates)
  const NMAX = Math.round(32*AREA_F);           // cap on tips per tree
  const MARG = 100;                             // clearance margin for straight-capsule checks
  const EM = 700;                               // keep new tips this far inside the map
  const STEM = 900;                             // straight inflow/outflow stem, perpendicular to the edge
  const K23 = new Float64Array(NMAX+64); for(let k=0;k<K23.length;k++) K23[k] = Math.pow(k, 2/GAM);
  const CAPS_OK = Math.round(18*AREA_F);        // below this many connectors the unit growth runs a relaxed second pass
  let relax = false;

  // ---------------- layout: u runs from the arterial edge to the venous edge, v across; w = distance from a tree's own edge
  const lay = opts && opts.layout;
  const vert = lay === 'vertical' ? true : lay === 'horizontal' ? false : (W >= H ? rnd() < 0.3 : rnd() < 0.7);
  const U = vert ? H : W, V = vert ? W : H;
  const flipU = rnd() < 0.5;
  const PU = (u, v) => { const uu = flipU ? U - u : u; return vert ? [v, uu] : [uu, v]; };
  const EDGE = 1250, Vav = V - 2*EDGE;
  // stripe spacing ~2.9-4.2 mm: narrower bands starve of units, wider ones leave long unbranched fingers
  const S = Math.max(3, Math.min(Math.floor(Vav/2800) + 1, Math.round(Vav/(2900 + 1300*rnd())) + 1));
  const sp = Vav/(S-1);
  let stripes = [];
  const vAt = (s, u) => { const st = stripes[s]; return st.v + st.tilt*(u/U - 0.5) + st.bow*Math.sin(PI*u/U); };
  for(let tries=0, amp=1; tries<8; tries++, amp*=0.6){   // tilted, bowed stripes; every band stays 0.72-1.35 spacings wide
    stripes = [];
    for(let s=0;s<S;s++){ const inner = s > 0 && s < S-1;
      stripes.push({ v: EDGE + sp*s + (inner ? (rnd()-0.5)*0.22*sp*amp : (rnd()-0.5)*260),
        tilt: (rnd()-0.5)*amp*(inner ? 0.36*sp : 500), bow: amp*(inner ? (rnd()-0.5)*0.36*sp : (s ? -1 : 1)*rnd()*500) }); }
    let ok = true;
    for(let q=0;q<=12 && ok;q++){ const u = q/12*U;
      for(let s=0;s<S-1;s++){ const b = vAt(s+1,u) - vAt(s,u); if(b < Math.max(0.72*sp, 2500) || b > 1.35*sp) ok = false; }
      const e0 = vAt(0,u), e1 = V - vAt(S-1,u); if(Math.min(e0, e1) < 950 || Math.max(e0, e1) > 1850) ok = false; }
    if(ok) break;
  }
  const par0 = rnd() < 0.5 ? 0 : 1, own = s => (s % 2 === par0) ? 'art' : 'ven';
  const uGap = vert ? 2000 : 2600, LCAP = 1050;          // free space in front of a facing spine; corner connector length
  const P = {};
  for(const k of ['art', 'ven']) P[k] = { wJ: 1250 + rnd()*150, wSp: 2150 + rnd()*250, arc: 650 + rnd()*250 };
  function pickIn(kind){   // inlet v: in front of a foreign stripe (both spine arms are then plain), or mid-band in a wide band
    const uE = kind === 'art' ? 0 : U, c = [];
    for(let s=1;s<S-1;s++) if(own(s) !== kind) c.push(vAt(s, uE));
    for(let s=0;s<S-1;s++){ const a = vAt(s, uE), b = vAt(s+1, uE); if(b - a > 4400) c.push((a+b)/2); }
    let tot = 0; const wt = c.map(v => { const x = Math.exp(-Math.pow((v - V/2)/(0.28*V), 2)); tot += x; return x; });
    let r = rnd()*tot; for(let i=0;i<c.length;i++){ r -= wt[i]; if(r <= 0) return c[i]; }
    return c[c.length-1];
  }

  // ---------------- trees: node 0 = boundary inlet/outlet, node 1 = end of the stem; segment i = par[i] -> i
  function Tree(kind, rTrunk){
    const vIn = pickIn(kind), u0 = kind === 'art' ? 0 : U, u1 = kind === 'art' ? STEM : U - STEM, a = PU(u0, vIn), b = PU(u1, vIn);
    this.kind = kind; this.rTrunk = rTrunk; this.base = kind==='art' ? 0 : 100000; this.vIn = vIn;
    this.x = [a[0], b[0]]; this.y = [a[1], b[1]];
    this.par = [-1, 0]; this.kids = [[1], []]; this.k = [0, 0]; this.alive = [true, true]; this.caps = [[], []];
    const d = unit(b[0]-a[0], b[1]-a[1]); this.nx = d[0]; this.ny = d[1]; this.nT = 0; this.tipOf = {}; this.corner = {}; this.nh = {};
  }
  const TA = new Tree('art', R_ART), TV = new Tree('ven', R_VEN);
  const other = T => T === TA ? TV : TA;
  const caps = [];   // AV connectors { a: arterial tip, v: venous tip, alive, keep (corner), rm (pinch radius) }

  // radius estimates.  rEst: expected FINAL radius (subtrees grow ~proportionally towards NP tips), used for
  // clearance, spacing and the two-hop zones; nodeRc: current radius, for the exempt zone around a shared junction
  const RTE_A = Math.min(RT_A, R_ART/Math.pow(NP, 1/GAM)), RTE_V = Math.min(RT_V, R_VEN/Math.pow(NP, 1/GAM));
  const rTermEst = T => T === TA ? RTE_A : RTE_V;
  function rEst(T, k){
    if(T.rtN !== T.nT){ T.rtN = T.nT; T.rt = new Float64Array(NMAX+64).fill(-1); }
    if(k < T.rt.length && T.rt[k] >= 0) return T.rt[k];
    const ke = Math.max(1, k*Math.max(1, NP/Math.max(1, T.nT))), r = Math.min(T.rTrunk, rTermEst(T)*Math.pow(ke, 1/GAM));
    if(k < T.rt.length) T.rt[k] = r; return r; }
  const nodeRc = (T, i) => i <= 1 ? T.rTrunk : Math.min(T.rTrunk, rTermEst(T)*Math.pow(Math.max(1, T.k[i]), 1/GAM));
  const nodeR = (T, i) => i <= 1 ? T.rTrunk : (T.kids[i].length ? rEst(T, T.k[i]) : rTermEst(T));
  const isJunction = (T, i) => i >= 2 && T.kids[i].length >= 2;
  const R_CAP = 0.8*RTE_V;

  function recomputeK(T){
    const order = [], st = [1];
    while(st.length){ const u = st.pop(); order.push(u); for(const c of T.kids[u]) st.push(c); }
    for(let q=order.length-1;q>=0;q--){ const u = order[q]; let k = (T.kids[u].length || u <= 1) ? 0 : 1; for(const c of T.kids[u]) k += T.k[c]; T.k[u] = k; }
    T.nT = T.k[1];
  }

  // ---------------- collision world: straight capsules for both trees + connectors, in a uniform grid
  let world = [], JX = [], JY = [], JR = [];
  const GC = 1800, GNX = Math.ceil(W/GC)+2, GNY = Math.ceil(H/GC)+2;
  let grid = null, stamp = null, stampN = 0;
  const gcl = (v, n) => Math.max(0, Math.min(n-1, Math.floor(v/GC)+1));
  function segCapsule(T, i){ const p = T.par[i];
    const c = { x0:T.x[p], y0:T.y[p], x1:T.x[i], y1:T.y[i], r:nodeR(T, i), rc:nodeRc(T, i), n0:T.base+p, n1:T.base+i, e0:3*nodeRc(T,p), e1:3*nodeRc(T,i), T, i };
    if(i === 1 && T.kids[1].length) c.n2 = T.base + T.kids[1][0];   // the stem belongs to the root edge: it also touches the first junction
    return c; }
  function capCapsule(ci){ const c = caps[ci];
    return { x0:TA.x[c.a], y0:TA.y[c.a], x1:TV.x[c.v], y1:TV.y[c.v], r:R_CAP, n0:c.a, n1:TV.base+c.v, e0:3*RTE_V, e1:3*RTE_V, ci }; }
  function rebuildWorld(){
    world = [];
    for(const T of [TA, TV]) for(let i=1;i<T.x.length;i++) if(T.alive[i]) world.push(segCapsule(T, i));
    caps.forEach((c, ci) => { if(c.alive) world.push(capCapsule(ci)); });
    JX = []; JY = []; JR = [];
    for(const T of [TA, TV]) for(let j=2;j<T.x.length;j++) if(T.alive[j] && T.kids[j].length >= 2){ JX.push(T.x[j]); JY.push(T.y[j]); JR.push(nodeR(T, j)); }
    grid = Array.from({length: GNX*GNY}, () => []); stamp = new Int32Array(world.length); stampN = 0;
    world.forEach((c, k) => { const e = c.r;
      for(let gx=gcl(Math.min(c.x0,c.x1)-e, GNX); gx<=gcl(Math.max(c.x0,c.x1)+e, GNX); gx++)
        for(let gy=gcl(Math.min(c.y0,c.y1)-e, GNY); gy<=gcl(Math.max(c.y0,c.y1)+e, GNY); gy++) grid[gx*GNY+gy].push(k); });
  }
  const TQ = new Float64Array(4), TC = new Float64Array(4);
  function trim(s, end, E, o){            // capsule s without its first E µm from end `end` into o; false if nothing is left
    const L = hyp(s.x1-s.x0, s.y1-s.y0); if(L <= E) return false;
    const f = E/L;
    if(end === 0){ o[0] = s.x0+(s.x1-s.x0)*f; o[1] = s.y0+(s.y1-s.y0)*f; o[2] = s.x1; o[3] = s.y1; }
    else { o[0] = s.x0; o[1] = s.y0; o[2] = s.x1+(s.x0-s.x1)*f; o[3] = s.y1+(s.y0-s.y1)*f; }
    return true;
  }
  // clearance of capsule q against capsule c (mirrors the tissue-gap rule; shared nodes get the exempt zone)
  function capOK(q, c){
    const need = q.r + c.r + gapReq(q.r, c.r) + MARG;
    if(Math.max(c.x0,c.x1) < Math.min(q.x0,q.x1)-need || Math.min(c.x0,c.x1) > Math.max(q.x0,q.x1)+need ||
       Math.max(c.y0,c.y1) < Math.min(q.y0,q.y1)-need || Math.min(c.y0,c.y1) > Math.max(q.y0,q.y1)+need) return true;
    let sq = -1, sc = -1, E = 0;
    if(q.n0 === c.n0){ sq=0; sc=0; E=Math.max(q.e0,c.e0); } else if(q.n0 === c.n1){ sq=0; sc=1; E=Math.max(q.e0,c.e1); }
    else if(q.n1 === c.n0){ sq=1; sc=0; E=Math.max(q.e1,c.e0); } else if(q.n1 === c.n1){ sq=1; sc=1; E=Math.max(q.e1,c.e1); }
    else if(c.n2 !== undefined && (q.n0 === c.n2 || q.n1 === c.n2)){ sq = q.n0 === c.n2 ? 0 : 1; sc = 1; E = Math.max(sq ? q.e1 : q.e0, c.e1) + hyp(c.x1 - (sq ? q.x1 : q.x0), c.y1 - (sq ? q.y1 : q.y0)); }
    if(sq < 0) return ssd(q.x0,q.y0,q.x1,q.y1,c.x0,c.y0,c.x1,c.y1) >= need || twoHopOK(q, c, need);
    if(!trim(q, sq, E, TQ) || !trim(c, sc, E, TC)){ // a limb lies inside the exempt zone: require a minimum opening angle instead
      const uq = sq === 0 ? unit(q.x1-q.x0, q.y1-q.y0) : unit(q.x0-q.x1, q.y0-q.y1);
      const uc = sc === 0 ? unit(c.x1-c.x0, c.y1-c.y0) : unit(c.x0-c.x1, c.y0-c.y1);
      return angBetween(uq, uc) > 0.75; }
    const qr = q.rc || q.r, cr = c.rc || c.r;   // near a shared node: current radii, consistent with the exempt length
    return ssd(TQ[0],TQ[1],TQ[2],TQ[3],TC[0],TC[1],TC[2],TC[3]) >= qr + cr + gapReq(qr,cr) + 40;
  }
  // two capsules joined by one short tree edge (a -> b): like the metric, points within the junction
  // neighbourhoods of that edge are exempt (arc to a + edge + arc to b < 2E); everything else keeps the gap
  // node ids: arterial i, venous 100000 + i; 90000 / 90001 (+ base) are placeholders for a splice under test
  const treeOf = n => n >= 100000 ? (n < 190000 ? TV : null) : (n < 90000 ? TA : null);
  function twoHopOK(q, c, need){
    const test = (qe, ce, Lab, E) => { const tz = E - Lab/2; if(tz <= 0) return false;
      return (!trim(q, qe, tz, TQ) || ssd(TQ[0],TQ[1],TQ[2],TQ[3],c.x0,c.y0,c.x1,c.y1) >= need) &&
             (!trim(c, ce, tz, TC) || ssd(q.x0,q.y0,q.x1,q.y1,TC[0],TC[1],TC[2],TC[3]) >= need); };
    for(let qe=0; qe<2; qe++) for(let ce=0; ce<3; ce++){
      const cn = ce === 2 ? c.n2 : ce ? c.n1 : c.n0; if(cn === undefined) continue;
      const qn = qe ? q.n1 : q.n0, TB = treeOf(cn), b = cn % 100000, cEnd = ce ? 1 : 0;
      // ce 2: the stem is part of the root edge, so it also reaches the first junction
      const extra = ce === 2 ? hyp(c.x1 - TB.x[b], c.y1 - TB.y[b]) : 0;
      if(q.hop) for(const [he, nb, nx, ny, E] of q.hop) if(he === qe && nb === cn && test(qe, cEnd, hyp((qe ? q.x1 : q.x0)-nx, (qe ? q.y1 : q.y0)-ny) + extra, E)) return true;
      const T = treeOf(qn), a = qn % 100000;
      if(!T || T !== TB || (T.par[a] !== b && T.par[b] !== a)) continue;
      if(test(qe, cEnd, hyp(T.x[a]-T.x[b], T.y[a]-T.y[b]) + extra, 3*Math.max(nodeR(T, a), nodeR(T, b)))) return true;
    }
    return false;
  }
  // all new capsules qs against the world (minus `skip`, the segment being replaced) and against `extra`
  function allOK(qs, extra, skip){
    for(const q of qs){
      const e = q.r + 480 + MARG + 2; stampN++;
      const gx0 = gcl(Math.min(q.x0,q.x1)-e, GNX), gx1 = gcl(Math.max(q.x0,q.x1)+e, GNX), gy0 = gcl(Math.min(q.y0,q.y1)-e, GNY), gy1 = gcl(Math.max(q.y0,q.y1)+e, GNY);
      for(let gx=gx0; gx<=gx1; gx++) for(let gy=gy0; gy<=gy1; gy++) for(const k of grid[gx*GNY+gy]){
        if(stamp[k] === stampN) continue; stamp[k] = stampN; const c = world[k];
        if(skip && skip(c)) continue; if(!capOK(q, c)) return false; }
      for(const c of extra){ if(c !== q && !capOK(q, c)) return false; }
    }
    return true;
  }
  function nearestOn(x, y, T){ let m = Infinity, b = null;
    for(const c of world){ if(c.T !== T || c.i < 2) continue; const vx = c.x1-c.x0, vy = c.y1-c.y0, l2 = vx*vx+vy*vy; let t = l2 > 0 ? ((x-c.x0)*vx+(y-c.y0)*vy)/l2 : 0; t = t<0?0:t>1?1:t;
      const qx = c.x0+vx*t, qy = c.y0+vy*t, d = hyp(qx-x, qy-y) - c.r; if(d < m){ m = d; b = [qx, qy]; } }
    return b; }
  function junctionOK(bx, by, rb, extraJ){
    for(let j=0;j<JX.length;j++){ const need = 2.5*Math.max(rb, JR[j])*1.04 + 25, dx = JX[j]-bx, dy = JY[j]-by; if(dx*dx + dy*dy < need*need) return false; }
    if(extraJ) for(const [x,y,r] of extraJ) if(hyp(x-bx, y-by) < 2.5*Math.max(rb, r)*1.04 + 25) return false;
    return true;
  }

  // ---------------- CCO splice: new tip t joins segment par(i) -> i at bifurcation b
  function ancestorCost(T, p){ let c = 0; for(let j=p; j>=2; j=T.par[j]){ const l = hyp(T.x[j]-T.x[T.par[j]], T.y[j]-T.y[T.par[j]]); c += (K23[T.k[j]+1]-K23[T.k[j]])*l; } return c; }
  function spliceCost(T, p, i, bx, by, tx, ty){ const ku = T.k[i];   // increase of sum r^2 l (units of r_term^2)
    return K23[ku+1]*hyp(bx-T.x[p],by-T.y[p]) + K23[ku]*hyp(bx-T.x[i],by-T.y[i]) + hyp(bx-tx,by-ty) - K23[ku]*hyp(T.x[p]-T.x[i],T.y[p]-T.y[i]) + ancestorCost(T,p); }
  function evalSplice(T, i, tx, ty){     // weighted Fermat–Weber point of the three limbs (Weiszfeld)
    const p = T.par[i], px=T.x[p], py=T.y[p], ux=T.x[i], uy=T.y[i], ku = T.k[i];
    const wP = K23[ku+1], wU = K23[ku], wT = 1;
    let bx = (wP*px+wU*ux+wT*tx)/(wP+wU+wT), by = (wP*py+wU*uy+wT*ty)/(wP+wU+wT);
    for(let it=0; it<16; it++){
      let dx = bx-px, dy = by-py; const a = wP/(Math.sqrt(dx*dx+dy*dy)+1e-3);
      dx = bx-ux; dy = by-uy; const b = wU/(Math.sqrt(dx*dx+dy*dy)+1e-3);
      dx = bx-tx; dy = by-ty; const c = wT/(Math.sqrt(dx*dx+dy*dy)+1e-3), s = a+b+c;
      const nx = (a*px+b*ux+c*tx)/s, ny = (a*py+b*uy+c*ty)/s;
      const moved = Math.abs(nx-bx)+Math.abs(ny-by); bx=nx; by=ny; if(moved < 3) break;
    }
    return { T, i, p, bx, by, tx, ty, cost: 0 };
  }
  function fixLimbs(s){                  // minimum limb lengths / junction spacing to both ends of the host and to the tip
    const T = s.T, p = s.p, i = s.i, ku = T.k[i];
    const rb = rEst(T, ku+1), rt = rTermEst(T);
    const X0 = T.x[p], Y0 = T.y[p], M0 = endGap(T, p, rb), X1 = T.x[i], Y1 = T.y[i], M1 = endGap(T, i, rb);
    const X2 = s.tx, Y2 = s.ty, M2 = Math.max(650, 3.2*rt);
    for(let pass=0; pass<3; pass++){
      let ok = true;
      for(let k=0;k<3;k++){
        const vx = k === 0 ? X0 : k === 1 ? X1 : X2, vy = k === 0 ? Y0 : k === 1 ? Y1 : Y2, m = k === 0 ? M0 : k === 1 ? M1 : M2;
        let dx = s.bx-vx, dy = s.by-vy, d = hyp(dx,dy);
        if(d >= m) continue; ok = false;
        if(d < 1){ dx = (X0+X1+X2-vx)/2 - vx; dy = (Y0+Y1+Y2-vy)/2 - vy; d = hyp(dx,dy)||1; }
        s.bx = vx + dx/d*m; s.by = vy + dy/d*m; }
      if(ok) break;
    }
    if(hyp(s.bx-X0, s.by-Y0) < M0-1 || hyp(s.bx-X1, s.by-Y1) < M1-1 || hyp(s.bx-X2, s.by-Y2) < M2-1) return false;
    return s.bx > EM*0.5 && s.bx < W-EM*0.5 && s.by > EM*0.5 && s.by < H-EM*0.5;
  }
  function anglesOK(s){                  // physiological branching, a smooth host, no reversal at the proximal node
    const T = s.T, bx = s.bx, by = s.by;
    let ux = T.x[s.p]-bx, uy = T.y[s.p]-by, dx = T.x[s.i]-bx, dy = T.y[s.i]-by, tx = s.tx-bx, ty = s.ty-by;
    const lu = hyp(ux,uy)||1, ld = hyp(dx,dy)||1, lt = hyp(tx,ty)||1; ux/=lu; uy/=lu; dx/=ld; dy/=ld; tx/=lt; ty/=lt;
    if(dx*tx+dy*ty > 0.697 || ux*tx+uy*ty > 0.170) return false;                            // cos 0.8, cos 1.4
    if(ux*dx+uy*dy > (T.k[s.i] >= 2 && !relax ? -0.765 : -0.54)) return false;               // the host bends <= 40° (<= 57° if terminal or relaxed)
    if(s.p >= 2){ const pp = T.par[s.p]; let ix = T.x[s.p]-T.x[pp], iy = T.y[s.p]-T.y[pp]; const li = hyp(ix,iy)||1;
      if(-(ix*ux+iy*uy)/li < -0.505) return false; }                                             // cos 2.1
    return true;
  }
  function spliceCaps(s){
    const T = s.T, ku = T.k[s.i], rb = rEst(T, ku+1), ru = nodeR(T, s.i), rt = rTermEst(T);
    const nb = s.p === 1 ? T.base + 1 : T.base + 90000, nt = T.base + 90001;  // placeholder ids (b on the root limb aliases the stem node)
    const eb = 3*Math.min(T.rTrunk, rt*Math.pow(ku+1, 1/GAM)), eu = 3*nodeRc(T, s.i);
    const ep = 3*nodeRc(T,s.p), P = [T.base+s.p, T.x[s.p], T.y[s.p]], I = [T.base+s.i, T.x[s.i], T.y[s.i]];
    // hop: neighbours of the new junction b reached through one of the new limbs (two-hop exemption, final radii)
    const hp = 3*Math.max(rb, nodeR(T, s.p)), hi = 3*Math.max(rb, ru);
    return [
      { x0:T.x[s.p], y0:T.y[s.p], x1:s.bx, y1:s.by, r:rb, rc:eb/3, n0:T.base+s.p, n1:nb, e0:ep, e1:eb, hop:[[1, ...I, hi]] },
      { x0:s.bx, y0:s.by, x1:T.x[s.i], y1:T.y[s.i], r:ru, rc:eu/3, n0:nb, n1:T.base+s.i, e0:eb, e1:eu, hop:[[0, ...P, hp]] },
      { x0:s.bx, y0:s.by, x1:s.tx, y1:s.ty, r:rt, n0:nb, n1:nt, e0:eb, e1:3*rt, hop:[[0, ...P, hp], [0, ...I, hi]] },
    ];
  }
  // how close a new junction on segment par(i) -> i may come to each end: junction spacing at a junction, a limb
  // long enough for a smooth curve at a pass-through node, room for the connector bend at a tip
  const endGap = (T, j, rb) => j === 1 ? 1000 : isJunction(T, j) ? 2.5*Math.max(rb, nodeR(T, j))*1.05 + 25 : T.kids[j].length ? Math.max(500, 1.2*nodeR(T, j)) : Math.max(650, 3.2*nodeR(T, j));
  function freeStretch(T, i){            // fractions [f0, f1] of segment par(i) -> i where a new junction may sit
    const p = T.par[i], L = hyp(T.x[i]-T.x[p], T.y[i]-T.y[p]) || 1, rb = rEst(T, T.k[i]+1), m0 = endGap(T, p, rb), m1 = endGap(T, i, rb);
    return m0 + m1 < L - 100 ? [m0/L, 1 - m1/L] : null;
  }
  function bestSplice(T, tx, ty, extra, maxChecks, extraJ){
    const near = [];                      // the 9 segments nearest to the new tip (insertion into a short sorted list)
    for(let i=2;i<T.x.length;i++){ if(!T.alive[i] || T.nh[i]) continue; const p = T.par[i], d = psd(tx, ty, T.x[p], T.y[p], T.x[i], T.y[i]);
      if(near.length < 9 || d < near[near.length-1][0]){ let k = near.length; while(k > 0 && near[k-1][0] > d) k--; near.splice(k, 0, [d, i]); if(near.length > 9) near.pop(); } }
    const cands = near.map(n => evalSplice(T, n[1], tx, ty));
    // constrained fallback: bifurcation points along the nearest segments (when the optimum is blocked)
    for(let k=0;k<Math.min(4, near.length);k++){ const i = near[k][1], p = T.par[i], fr = freeStretch(T, i); if(!fr) continue;
      for(const g of [0.1, 0.4, 0.7, 1]){ const f = fr[0] + (fr[1]-fr[0])*g; cands.push({ T, i, p, bx: T.x[p] + (T.x[i]-T.x[p])*f, by: T.y[p] + (T.y[i]-T.y[p])*f, tx, ty, cost: 0 }); } }
    const ok = [];
    for(const s of cands){
      if(!fixLimbs(s) || !anglesOK(s) || !junctionOK(s.bx, s.by, rEst(T, T.k[s.i]+1), extraJ)) continue;
      s.cost = spliceCost(T, s.p, s.i, s.bx, s.by, tx, ty); ok.push(s);
    }
    ok.sort((a,b)=>a.cost-b.cost);
    for(let n=0; n<Math.min(maxChecks, ok.length); n++){
      const s = ok[n], qs = spliceCaps(s);
      if(allOK(qs, extra, c => c.T === T && c.i === s.i)){ s.qs = qs; return s; }
    }
    return null;
  }
  function commitSplice(s){
    const T = s.T, p = s.p, i = s.i, b = T.x.length, t = b+1;
    T.x.push(s.bx, s.tx); T.y.push(s.by, s.ty); T.par.push(p, b); T.kids.push([i, t], []); T.k.push(T.k[i]+1, 1); T.alive.push(true, true); T.caps.push([], []);
    const ks = T.kids[p]; ks[ks.indexOf(i)] = b; T.par[i] = b;
    for(let j=p; j>=1; j=T.par[j]) T.k[j]++;
    T.nT++;
    return t;
  }
  function addCap(a, v, keep){ caps.push({ a, v, alive:true, keep }); TA.caps[a].push(caps.length-1); TV.caps[v].push(caps.length-1); }
  const inDomain = (x, y, m) => x > m && x < W-m && y > m && y < H-m;

  // ================================================================ 1. comb skeleton
  const uOf = (T, w) => T === TA ? w : U - w;
  function addNode(T, w, v, p){ const q = PU(uOf(T, w), v), i = T.x.length; T.x.push(q[0]); T.y.push(q[1]); T.par.push(p); T.kids.push([]); T.k.push(0); T.alive.push(true); T.caps.push([]); T.kids[p].push(i); return i; }
  const onStripe = (T, s, w) => vAt(s, uOf(T, w));
  function addFinger(T, s, C, w0, wTip){      // finger along stripe s, with pass-through nodes that follow its bow
    const L = wTip - w0, n = L > 11000 ? 2 : L > 5500 ? 1 : 0;
    let prev = C;
    for(let q=1;q<=n;q++){ const w = w0 + L*q/(n+1) + (rnd()-0.5)*600; prev = addNode(T, w, onStripe(T, s, w), prev); }
    T.tipOf[s] = addNode(T, wTip, onStripe(T, s, wTip) + (rnd()-0.5)*0.06*sp, prev);
  }
  function buildComb(T){
    const O = other(T), p = P[T.kind], po = P[O.kind];
    const J = addNode(T, p.wJ, T.vIn, 1);
    for(const sg of [-1, 1]){
      const eS = sg < 0 ? 0 : S-1;
      const list = [];
      for(let s=0;s<S;s++) if(own(s) === T.kind && sg*(onStripe(T, s, p.wSp) - T.vIn) > 0) list.push(s);
      list.sort((a,b) => sg*(onStripe(T, a, p.wSp) - onStripe(T, b, p.wSp)));
      if(own(eS) !== T.kind) list.push(eS);          // foreign edge stripe: the spine ends in a corner arc
      // Y shoulder: the arm leaves the fork at ~40° and curves into the spine
      let vPrev = T.vIn + sg*(900 + rnd()*150), prev = addNode(T, p.wJ + 800 + rnd()*200, vPrev, J);
      const spineTo = vT => {      // pass-through nodes keep long spine stretches along the edge
        const n = Math.floor(Math.abs(vT - vPrev)/3000);
        for(let q=1;q<=n;q++) prev = addNode(T, p.wSp + (rnd()-0.5)*300, vPrev + (vT - vPrev)*q/(n+1), prev);
        vPrev = vT; };
      for(const s of list){
        const vS = onStripe(T, s, p.wSp);
        if(s === eS){               // corner: elbow on the spine, then an arc into the edge stripe (both kept free of units)
          const vE = vS - sg*1150; spineTo(vE); prev = addNode(T, p.wSp, vE, prev);
          const w = p.wSp + p.arc, C = addNode(T, w, onStripe(T, s, w), prev); T.nh[prev] = T.nh[C] = true;
          if(own(s) === T.kind) addFinger(T, s, C, w, U - (po.wSp + po.arc + LCAP)); else T.corner[sg] = C;
          break;
        }
        spineTo(vS);
        const w = p.wSp + (rnd()-0.5)*400, C = addNode(T, w, vS, prev);
        addFinger(T, s, C, w, U - po.wSp - uGap - rnd()*0.04*U);
        prev = C;
      }
    }
    recomputeK(T);
  }
  buildComb(TA); buildComb(TV);
  for(const e of [0, S-1]){          // corner connectors: a spine's corner arc meets the other tree's edge finger
    const Ow = own(e) === 'art' ? TA : TV, f = Ow.tipOf[e], c = other(Ow).corner[e ? 1 : -1];
    if(f !== undefined && c !== undefined){ if(Ow === TA) addCap(f, c, true); else addCap(c, f, true); }
  }

  // ================================================================ 2. AV partners for finger tips
  function growPartner(T, t){
    const O = other(T), p = T.par[t], d0 = unit(T.x[t]-T.x[p], T.y[t]-T.y[p]);
    let best = null;
    for(let o=0;o<9;o++){
      const th = Math.atan2(d0[1], d0[0]) + (o%2 ? 1 : -1)*Math.ceil(o/2)*0.22, L = 900 + 150*(o%3);
      const sx = T.x[t] + Math.cos(th)*L, sy = T.y[t] + Math.sin(th)*L, dc = [Math.cos(th), Math.sin(th)];
      if(!inDomain(sx, sy, EM)) continue;
      const capQ = T === TA ? { x0:T.x[t], y0:T.y[t], x1:sx, y1:sy, r:R_CAP, n0:t, n1:TV.base+90001, e0:3*RTE_A, e1:3*RTE_V }
                            : { x0:sx, y0:sy, x1:T.x[t], y1:T.y[t], r:R_CAP, n0:90001, n1:TV.base+t, e0:3*RTE_A, e1:3*RTE_V };
      if(!allOK([capQ], [], null)) continue;
      const sp2 = bestSplice(O, sx, sy, [capQ], 8); if(!sp2) continue;
      // finger -> connector -> partner limb, in flow order: no sharp bend and no U-turn
      const dl = unit(sp2.bx-sx, sp2.by-sy), F = T === TA ? [d0, dc, dl] : [[-dl[0], -dl[1]], [-dc[0], -dc[1]], [-d0[0], -d0[1]]];
      const k1 = turn(F[0], F[1]), k2 = turn(F[1], F[2]);
      if(Math.abs(k2) > (relax ? 1.2 : 1.0) || Math.abs(k1 + k2) > (relax ? 1.2 : 1.0)) continue;
      const cost = sp2.cost + 1400*(k1*k1 + k2*k2);
      if(!best || cost < best.cost) best = { sp: sp2, cost };
    }
    if(!best) return false;
    const nt = commitSplice(best.sp);
    if(T === TA) addCap(t, nt); else addCap(nt, t);
    return true;
  }
  const capless = () => { const out = []; for(const T of [TA, TV]) for(let t=2;t<T.x.length;t++) if(T.alive[t] && !T.kids[t].length && !T.caps[t].length) out.push([T, t]); return out; };
  for(const [T, t] of capless()){ rebuildWorld(); growPartner(T, t); }

  // ================================================================ 3. paired capillary units (coupled CCO)
  const FC = 500, FNX = Math.ceil(W/FC), FNY = Math.ceil(H/FC), FD = new Float32Array(FNX*FNY).fill(1e9);
  const fieldAdd = (cs, reach) => { for(const c of cs){     // lower the field by capsules c (only cells within `reach` of them)
    const i0 = Math.max(0, Math.floor((Math.min(c.x0,c.x1)-reach)/FC)), i1 = Math.min(FNX-1, Math.floor((Math.max(c.x0,c.x1)+reach)/FC));
    const j0 = Math.max(0, Math.floor((Math.min(c.y0,c.y1)-reach)/FC)), j1 = Math.min(FNY-1, Math.floor((Math.max(c.y0,c.y1)+reach)/FC));
    for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){ const k = j*FNX+i, d = psd((i+0.5)*FC, (j+0.5)*FC, c.x0, c.y0, c.x1, c.y1) - c.r; if(d < FD[k]) FD[k] = d; } } };
  const pocket = (x, y) => {      // size of the pocket around (x, y): the largest wall distance within 1.5 mm
    const ci = Math.floor(x/FC), cj = Math.floor(y/FC); let m = 0;
    for(let j=Math.max(0,cj-3); j<=Math.min(FNY-1,cj+3); j++) for(let i=Math.max(0,ci-3); i<=Math.min(FNX-1,ci+3); i++) if(FD[j*FNX+i] > m) m = FD[j*FNX+i];
    return m; };
  const fieldAt = (x, y) => FD[Math.min(FNY-1, Math.max(0, Math.floor(y/FC)))*FNX + Math.min(FNX-1, Math.max(0, Math.floor(x/FC)))];
  function tryUnit(cx, cy, ths, L){          // first connector direction (in order of preference) that yields a valid unit
    for(const th of ths){
      const ux = Math.cos(th), uy = Math.sin(th);
      const ax = cx - ux*L/2, ay = cy - uy*L/2, vx = cx + ux*L/2, vy = cy + uy*L/2;
      if(!inDomain(ax, ay, EM) || !inDomain(vx, vy, EM) || fieldAt(ax, ay) < 300 || fieldAt(vx, vy) < 300) continue;
      const capQ = { x0:ax, y0:ay, x1:vx, y1:vy, r:R_CAP, n0:90001, n1:TV.base+90001, e0:3*RTE_V, e1:3*RTE_V };
      if(!allOK([capQ], [], null)) continue;
      let sA, sV;
      if(TA.nT % 2 === 0){ sA = bestSplice(TA, ax, ay, [capQ], 10); if(!sA) continue; sV = bestSplice(TV, vx, vy, [capQ, ...sA.qs], 10, [[sA.bx, sA.by, sA.qs[0].r]]); if(!sV) continue; }
      else { sV = bestSplice(TV, vx, vy, [capQ], 10); if(!sV) continue; sA = bestSplice(TA, ax, ay, [capQ, ...sV.qs], 10, [[sV.bx, sV.by, sV.qs[0].r]]); if(!sA) continue; }
      // art -> connector -> vein: each bend <= 63°, and the heading changes by <= 57° overall (no U-turn)
      const dA = unit(ax-sA.bx, ay-sA.by), dV = unit(sV.bx-vx, sV.by-vy);
      const tA = turn(dA, [ux, uy]), tV = turn([ux, uy], dV);
      const bl = relax ? 1.3 : 1.1;
      if(Math.abs(tA) > bl || Math.abs(tV) > bl || Math.abs(tA + tV) > bl - 0.1) continue;
      return { sA, sV, capQ };
    }
    return null;
  }
  const strikes = [];                        // sites that failed: two strikes nearby and a site is skipped
  const struck = (x, y) => { let n = 0; for(const f of strikes) if(hyp(f[0]-x, f[1]-y) < 450 && ++n >= 2) return true; return false; };
  rebuildWorld(); fieldAdd(world, W + H);
  let dcrit = 0.55*Math.sqrt(W*H/(TA.nT+2)), voidBudget = 20, randBudget = 20, brOff = 0, idle = 0, guard = 0;
  // a second, relaxed pass (sharper rung bends, stronger host kinks) only runs when the strict pass left the map sparse
  const tryRelax = () => { if(relax || caps.filter(c => c.alive).length >= CAPS_OK) return false;
    relax = true; idle = 0; voidBudget = 12; randBudget = 12; brOff = 0; strikes.length = 0; return true; };
  while(TA.nT < NMAX && guard++ < 260){
    if(idle >= 10 && !tryRelax()) break;
    dcrit = Math.min(dcrit, 0.62*Math.sqrt(W*H/(TA.nT+2)));
    const sites = [];
    // (a) bridges: pairs of free junction slots (centres of the free stretches) of an arterial and a venous
    //     segment facing each other across a pocket; the connector axis runs artery -> vein
    { const br = [], slots = [[], []];
      for(const c of world){ if(!c.T || c.i < 2 || c.T.nh[c.i]) continue; const fr = freeStretch(c.T, c.i); if(!fr) continue;
        const len = hyp(c.x1-c.x0, c.y1-c.y0), n = Math.max(1, Math.floor((fr[1]-fr[0])*len/1000)), d = unit(c.x1-c.x0, c.y1-c.y0);
        for(let j=0;j<n;j++){ const f = fr[0] + (fr[1]-fr[0])*(j+0.5)/n; slots[c.T === TA ? 0 : 1].push([c.x0+(c.x1-c.x0)*f, c.y0+(c.y1-c.y0)*f, c.r, d]); } }
      for(const a of slots[0]) for(const v of slots[1]){
        const dx = v[0]-a[0], dy = v[1]-a[1], D = hyp(dx, dy), bd = D - a[2] - v[2];
        if(bd < 1700 || bd > 5200) continue;
        const ux = dx/D, uy = dy/D;
        if(Math.abs(ux*a[3][0]+uy*a[3][1]) > 0.72 || Math.abs(ux*v[3][0]+uy*v[3][1]) > 0.72) continue;   // roughly across both hosts
        const mx = a[0] + ux*(a[2] + bd/2), my = a[1] + uy*(a[2] + bd/2), wd = fieldAt(mx, my);
        if(wd >= 0.3*bd && !struck(mx, my)) br.push([pocket(mx, my), mx, my, Math.atan2(uy, ux)]); }
      br.sort((a,b)=>b[0]-a[0]);
      if(brOff >= br.length) brOff = 0;
      sites.push(...br.slice(brOff, brOff + 6)); }   // after a failed round, look further down the list
    // (b) the largest empty circles: greedy non-maximum suppression over the wall-distance field
    if(voidBudget > 0){ const cand = [];
      for(let j=0;j<FNY;j++) for(let i=0;i<FNX;i++){ const d = FD[j*FNX+i], x = (i+0.5)*FC, y = (j+0.5)*FC;
        if(d >= 1100 && inDomain(x, y, EM + 400)) cand.push([d, x, y]); }
      cand.sort((a,b)=>b[0]-a[0]);
      let n = 0; for(const c of cand){ if(n >= 3) break; if(!struck(c[1], c[2]) && !sites.some(q => hyp(q[1]-c[1], q[2]-c[2]) < 1300)){ sites.push(c); n++; } } }
    // (c) when nothing else is left: random sites with clearance >= dcrit (shrinks after failed rounds), any direction
    if(!sites.length){ if(randBudget <= 0){ if(tryRelax()) continue; break; } const rs = [];
      for(let q=0;q<40 && rs.length < 10;q++){ const x = EM + rnd()*(W-2*EM), y = EM + rnd()*(H-2*EM), wd = fieldAt(x, y); if(wd >= dcrit) rs.push([wd, x, y, null]); }
      rs.sort((a,b)=>b[0]-a[0]); sites.push(...rs.slice(0, 3)); }
    let got = null;
    for(let k=0; k<Math.min(10, sites.length) && !got; k++){
      const [wd, cx, cy, thB] = sites[k];
      let ths, t0 = thB;
      if(thB === undefined || thB === null){   // the site must lie between an artery and a vein
        const na = nearestOn(cx, cy, TA), nv = nearestOn(cx, cy, TV);
        if(!na || !nv || angBetween(unit(na[0]-cx, na[1]-cy), unit(nv[0]-cx, nv[1]-cy)) < 1.9){ strikes.push([cx, cy], [cx, cy]); continue; }
        if(thB === undefined) t0 = Math.atan2(nv[1]-na[1], nv[0]-na[0]); }   // void site: axis from the nearest artery to the nearest vein
      if(thB === null){ t0 = rnd()*2*PI; ths = [0, 1, 2, 3, 4, 5, 6].map(o => t0 + o*2*PI/7); }
      else ths = [t0, t0+0.3, t0-0.3, t0+0.65, t0-0.65, t0+1.0, t0-1.0];
      if(thB === null) randBudget--; else if(thB === undefined) voidBudget--;
      got = tryUnit(cx, cy, ths, 780 + 320*rnd());
      if(got) got.at = [cx, cy]; else strikes.push([cx, cy]);
    }
    if(!got){ dcrit *= 0.84; brOff += 6; idle++; continue; }
    idle = 0;
    const ta = commitSplice(got.sA), tv = commitSplice(got.sV); addCap(ta, tv); brOff = 0;
    for(let k=strikes.length-1;k>=0;k--) if(hyp(strikes[k][0]-got.at[0], strikes[k][1]-got.at[1]) < 3000) strikes.splice(k, 1);
    rebuildWorld(); fieldAdd([got.capQ, ...got.sA.qs, ...got.sV.qs], 4000);
  }

  // ================================================================ 4. last partners, prune the rest
  function pruneTip(T, t){      // the parent junction stays as a pass-through node, so no surviving vessel moves
    const b = T.par[t]; if(b <= 1) return false;
    T.alive[t] = false;
    T.kids[b] = T.kids[b].filter(x => x !== t);
    if(!T.kids[b].length && !T.caps[b].length){ recomputeK(T); return pruneTip(T, b); }
    recomputeK(T);
    return true;
  }
  function pruneCap(ci){
    const c = caps[ci]; if(!c.alive) return false;
    c.alive = false;
    for(const [T, n] of [[TA, c.a], [TV, c.v]]){
      T.caps[n] = T.caps[n].filter(x => x !== ci);
      if(!T.caps[n].length && !T.kids[n].length) pruneTip(T, n);
    }
    return true;
  }
  relax = true;
  for(const [T, t] of capless()){ rebuildWorld(); if(!growPartner(T, t)) pruneTip(T, t); }
  recomputeK(TA); recomputeK(TV);

  // ================================================================ 5. geometry
  const soft = new Map();   // edge key -> tangent softening (0 = physiological tangents, 1 = straight chord)
  let rsc = 1;              // global radius scale, lowered by the repair loop before any unit is pruned
  const wig = new Map();
  function meander(poly, key, r){     // gentle tortuosity, vanishing at both ends and when the edge is softened
    const n = poly.length; if(n < 4) return poly;
    const cum = [0]; for(let i=1;i<n;i++) cum.push(cum[i-1] + hyp(poly[i][0]-poly[i-1][0], poly[i][1]-poly[i-1][1]));
    const L = cum[n-1]; if(L < 2400) return poly;
    if(!wig.has(key)) wig.set(key, [0.55 + 0.45*rnd(), rnd()*2*PI, rnd() < 0.5 ? 1 : -1]);
    const [amp, ph, sg] = wig.get(key), f = soft.get(key) || 0;
    const A = sg*amp*Math.min(180, 0.04*L, 0.8*r)*(1 - f); if(Math.abs(A) < 5) return poly;
    const m = Math.round(L/3800), out = [];      // short vessels bow (C), longer ones get 1-2 waves
    for(let i=0;i<n;i++){
      const a = poly[Math.max(0,i-1)], b = poly[Math.min(n-1,i+1)], t = unit(b[0]-a[0], b[1]-a[1]), u = cum[i]/L;
      const sn = Math.sin(PI*u), o = m ? A*sn*sn*Math.sin(2*PI*m*u + ph) : 0.8*A*sn*sn;
      out.push([poly[i][0] - t[1]*o, poly[i][1] + t[0]*o]);
    }
    return out;
  }
  function hermite(ctrl, t0, t1, midT, k0){
    const n = ctrl.length, tg = new Array(n); tg[0] = t0; tg[n-1] = t1;
    for(let i=1;i<n-1;i++) tg[i] = midT || unit(ctrl[i+1][0]-ctrl[i-1][0], ctrl[i+1][1]-ctrl[i-1][1]);
    const out = [[ctrl[0][0], ctrl[0][1]]];
    for(let i=0;i<n-1;i++){
      const P0 = ctrl[i], P1 = ctrl[i+1], L = hyp(P1[0]-P0[0], P1[1]-P0[1]), a0 = i === 0 && k0 ? k0 : 1;
      const m0x = tg[i][0]*L*a0, m0y = tg[i][1]*L*a0, m1x = tg[i+1][0]*L, m1y = tg[i+1][1]*L;
      const steps = Math.max(8, Math.ceil(L/40));
      for(let s=1;s<=steps;s++){ const t = s/steps, t2 = t*t, t3 = t2*t;
        const h00 = 2*t3-3*t2+1, h10 = t3-2*t2+t, h01 = -2*t3+3*t2, h11 = t3-t2;
        out.push([h00*P0[0]+h10*m0x+h01*P1[0]+h11*m1x, h00*P0[1]+h10*m0y+h01*P1[1]+h11*m1y]); }
    }
    return out;
  }
  function resample(poly, rFun, relU){   // arc-length resampling, spacing <= min(0.42 r, 135 um)
    const n = poly.length, cum = new Float64Array(n);
    for(let i=1;i<n;i++) cum[i] = cum[i-1] + hyp(poly[i][0]-poly[i-1][0], poly[i][1]-poly[i-1][1]);
    const L = cum[n-1], rAt = s => rFun(relU ? s/L : s, L);
    const M = Math.max(16, Math.ceil(L/15)), Uw = new Float64Array(M+1);
    for(let j=1;j<=M;j++){ const s = (j-0.5)/M*L; Uw[j] = Uw[j-1] + (L/M)/Math.min(0.42*rAt(s), 135); }
    const np = Math.max(2, Math.ceil(Uw[M]) + 1), out = [];
    let k = 0, seg = 1;
    for(let q=0;q<np;q++){
      const u = q/(np-1)*Uw[M];
      while(k < M-1 && Uw[k+1] < u) k++;
      const f = Uw[k+1] > Uw[k] ? (u-Uw[k])/(Uw[k+1]-Uw[k]) : 0, s = Math.min(L, (k+f)/M*L);
      while(seg < n-1 && cum[seg] < s) seg++;
      const g = cum[seg] > cum[seg-1] ? (s-cum[seg-1])/(cum[seg]-cum[seg-1]) : 0;
      out.push([poly[seg-1][0]+(poly[seg][0]-poly[seg-1][0])*g, poly[seg-1][1]+(poly[seg][1]-poly[seg-1][1])*g, rAt(s)]);
    }
    out[0][0] = poly[0][0]; out[0][1] = poly[0][1]; out[np-1][0] = poly[n-1][0]; out[np-1][1] = poly[n-1][1];
    return out;
  }
  function build(){
    const rtA = rsc*Math.min(RT_A, R_ART/Math.pow(Math.max(1,TA.nT), 1/GAM)), rtV = rsc*Math.min(RT_V, R_VEN/Math.pow(Math.max(1,TV.nT), 1/GAM));
    const rOf = (T, i) => (T === TA ? rtA : rtV)*Math.pow(Math.max(1, T.k[i]), 1/GAM);
    const nodes = [], edges = [], idOf = new Map();
    const nid = (T, i, type) => { const key = T.base + i; if(idOf.has(key)) return idOf.get(key);
      const id = nodes.length; nodes.push({ id, x:T.x[i], y:T.y[i], type }); idOf.set(key, id); return id; };
    const tang = T => {      // tangents in tree orientation (away from the root)
      const dep = new Map(), arr = new Map();
      for(let i=1;i<T.x.length;i++){
        if(!T.alive[i]) continue;
        const ks = T.kids[i], p = T.par[i];
        if(i === 1){ const c = ks[0], d = unit(T.x[c]-T.x[1], T.y[c]-T.y[1]); arr.set(1, unit(T.nx*1.2 + d[0], T.ny*1.2 + d[1])); dep.set(c, arr.get(1)); continue; }
        const din = unit(T.x[i]-T.x[p], T.y[i]-T.y[p]);
        if(ks.length === 1){ const c = ks[0], dout = unit(T.x[c]-T.x[i], T.y[c]-T.y[i]), m = unit(din[0]+dout[0], din[1]+dout[1]); arr.set(i, m); dep.set(c, m); continue; }
        if(ks.length >= 2){  // parent arrives along the flow-weighted mean; the larger child is pulled towards it
          let sx = 0, sy = 0; const ds = [];
          for(const c of ks){ const d = unit(T.x[c]-T.x[i], T.y[c]-T.y[i]), w = Math.pow(rOf(T,c), 2); sx += w*d[0]; sy += w*d[1]; ds.push([c,d]); }
          const sl = hyp(sx, sy) || 1, Tm = unit(sx/sl + 0.6*din[0], sy/sl + 0.6*din[1]), rp = rOf(T, i);
          arr.set(i, Tm);
          for(const [c,d] of ds){ const f = soft.get(T.base*10+c) || 0, q = rOf(T, c)/rp; dep.set(c, slerp2(slerp2(d, Tm, 0.3*q*q), d, f)); }
        } else {             // tip: pass straight through into its AV connector
          let sx = 0, sy = 0;
          for(const ci of T.caps[i]){ const cp = caps[ci], o = T === TA ? [TV.x[cp.v], TV.y[cp.v]] : [TA.x[cp.a], TA.y[cp.a]], dc = unit(o[0]-T.x[i], o[1]-T.y[i]); sx += dc[0]; sy += dc[1]; }
          const dc = unit(sx, sy); arr.set(i, unit(din[0]+dc[0], din[1]+dc[1]));
        }
      }
      return { dep, arr };
    };
    const tgA = tang(TA), tgV = tang(TV);
    for(const T of [TA, TV]){
      const tg = T === TA ? tgA : tgV;
      for(let i=2;i<T.x.length;i++){
        if(!T.alive[i]) continue;
        const p = T.par[i], r = rOf(T, i), f = soft.get(T.base*10+i) || 0;
        let t1 = tg.arr.get(i), poly;
        if(p === 1) poly = hermite([[T.x[0],T.y[0]], [T.x[1],T.y[1]], [T.x[i],T.y[i]]], [T.nx, T.ny], t1, tg.arr.get(1), 1);
        else { if(f > 0) t1 = slerp2(t1, unit(T.x[i]-T.x[p], T.y[i]-T.y[p]), f);
          poly = meander(hermite([[T.x[p],T.y[p]], [T.x[i],T.y[i]]], tg.dep.get(i), t1, null, 0.8), T.base*10+i, r); }
        const R0 = T.rTrunk, rf = p === 1 ? (s, L) => R0 + (r - R0)*smooth(Math.min(1, 1.15*s/Math.max(1, L))) : () => r;
        const pts = resample(poly, rf);
        const ia = p === 1 ? nid(T, 0, T === TA ? 'inlet' : 'outlet') : nid(T, p, 'junction'), ib = nid(T, i, 'junction');
        if(T === TA) edges.push({ id: edges.length, a: ia, b: ib, type: 'art', pts, key: T.base*10+i });
        else { pts.reverse(); edges.push({ id: edges.length, a: ib, b: ia, type: 'ven', pts, key: T.base*10+i }); }
      }
    }
    caps.forEach((c, ci) => {
      if(!c.alive) return;
      const ch = unit(TV.x[c.v]-TA.x[c.a], TV.y[c.v]-TA.y[c.a]), f = soft.get(-1-ci) || 0;
      const t0 = tgA.arr.get(c.a), tv = tgV.arr.get(c.v), t1 = [-tv[0], -tv[1]];
      const poly = hermite([[TA.x[c.a],TA.y[c.a]], [TV.x[c.v],TV.y[c.v]]], slerp2(t0,ch,f), slerp2(t1,ch,f));
      const rm = c.rm || (c.rm = 104 + 30*rnd());   // chokepoint radius
      const prof = u => u < 0.5 ? rtA + (rm-rtA)*smooth(Math.min(1, u/0.42)) : rtV + (rm-rtV)*smooth(Math.min(1, (1-u)/0.42));
      edges.push({ id: edges.length, a: nid(TA, c.a, 'junction'), b: nid(TV, c.v, 'junction'), type: 'cap', pts: resample(poly, prof, true), key: -1-ci });
    });
    return { nodes, edges };
  }

  // ---------------- self-check (mirrors metrics.js: curvature/turn, junction spacing, tissue gap / crossings)
  const SSD = { d: 0, s: 0, t: 0 };        // result of segSegDistP (reused)
  function segSegDistP(a, b){
    const d1x=a.x1-a.x0, d1y=a.y1-a.y0, d2x=b.x1-b.x0, d2y=b.y1-b.y0, rx=a.x0-b.x0, ry=a.y0-b.y0;
    const A=d1x*d1x+d1y*d1y, E=d2x*d2x+d2y*d2y, F=d2x*rx+d2y*ry; let s, t;
    if(A<1e-9 && E<1e-9){ s=0; t=0; } else if(A<1e-9){ s=0; t=Math.max(0,Math.min(1,F/E)); }
    else { const C=d1x*rx+d1y*ry;
      if(E<1e-9){ t=0; s=Math.max(0,Math.min(1,-C/A)); }
      else { const Bv=d1x*d2x+d1y*d2y, den=A*E-Bv*Bv; s = den>1e-12 ? Math.max(0,Math.min(1,(Bv*F-C*E)/den)) : 0; t = (Bv*s+F)/E;
        if(t<0){ t=0; s=Math.max(0,Math.min(1,-C/A)); } else if(t>1){ t=1; s=Math.max(0,Math.min(1,(Bv-C)/A)); } } }
    let d = hyp(a.x0+d1x*s-b.x0-d2x*t, a.y0+d1y*s-b.y0-d2y*t);
    if(segCross(a.x0,a.y0,a.x1,a.y1,b.x0,b.y0,b.x1,b.y1)) d = 0;
    SSD.d = d; SSD.s = s; SSD.t = t; return SSD;
  }
  function check(net){
    const inc = new Map(); for(const n of net.nodes) inc.set(n.id, []);
    for(const e of net.edges){ inc.get(e.a).push(e); inc.get(e.b).push(e);
      const P = e.pts, cum = [0]; let L = 0; for(let i=1;i<P.length;i++){ L += hyp(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]); cum.push(L); } e._cum = cum; e._len = L; }
    const nodeRmax = new Map();
    for(const n of net.nodes){ let m = 0; for(const e of inc.get(n.id)){ const p = e.a===n.id ? e.pts[0] : e.pts[e.pts.length-1]; if(p[2] > m) m = p[2]; } nodeRmax.set(n.id, m); }
    const badCurve = new Set();
    for(const e of net.edges){ const P = e.pts, cum = e._cum, L = e._len, exA = 1.5*P[0][2], exB = 1.5*P[P.length-1][2];
      for(let i=1;i<P.length-1;i++){ if(cum[i] < exA || L-cum[i] < exB) continue;
        const ax = P[i][0]-P[i-1][0], ay = P[i][1]-P[i-1][1], bx = P[i+1][0]-P[i][0], by = P[i+1][1]-P[i][1];
        const la = hyp(ax,ay), lb = hyp(bx,by); if(la < 1e-6 || lb < 1e-6) continue;
        const th = Math.acos(Math.max(-1, Math.min(1, (ax*bx+ay*by)/(la*lb))));
        if(th > 11.5*PI/180 || (th > 1e-4 && 0.5*(la+lb)/th < 1.55*P[i][2])){ badCurve.add(e); break; } } }
    const J = net.nodes.filter(n => inc.get(n.id).length >= 3), badJ = [];
    for(let i=0;i<J.length;i++) for(let k=i+1;k<J.length;k++)
      if(hyp(J[i].x-J[k].x, J[i].y-J[k].y) < 2.5*Math.max(nodeRmax.get(J[i].id), nodeRmax.get(J[k].id)) + 5) badJ.push([J[i], J[k]]);
    // tissue gap / crossings on the resampled polylines. Segments live in typed arrays and are grouped in chunks of
    // up to 4 (a capsule around the chunk's chord, widened by its deviation); only chunk pairs that could hold a
    // violation are compared segment by segment.
    let NS = 0, NCH = 0; for(const e of net.edges){ NS += e.pts.length - 1; NCH += Math.ceil((e.pts.length - 1)/4); }
    const SX0 = new Float64Array(NS), SY0 = new Float64Array(NS), SX1 = new Float64Array(NS), SY1 = new Float64Array(NS);
    const SR0 = new Float64Array(NS), SR1 = new Float64Array(NS), SS0 = new Float64Array(NS), SS1 = new Float64Array(NS), SE = new Int32Array(NS);
    const CH0 = new Int32Array(NCH), CH1 = new Int32Array(NCH), CR = new Float64Array(NCH), CD = new Float64Array(NCH);
    const CS = 800, CX = Math.ceil(W/CS) + 6, CY = Math.ceil(H/CS) + 6, cell = Array.from({length: CX*CY}, () => []);
    const cl = (v, n) => Math.max(0, Math.min(n-1, Math.floor(v/CS) + 3));
    { let id = 0, ch = 0;
      for(let ei=0; ei<net.edges.length; ei++){ const e = net.edges[ei], P = e.pts;
        for(let i=0;i<P.length-1;i++, id++){
          SX0[id] = P[i][0]; SY0[id] = P[i][1]; SX1[id] = P[i+1][0]; SY1[id] = P[i+1][1]; SR0[id] = P[i][2]; SR1[id] = P[i+1][2]; SS0[id] = e._cum[i]; SS1[id] = e._cum[i+1]; SE[id] = ei; }
        for(let i=0;i<P.length-1;i+=4, ch++){
          const i1 = Math.min(P.length-1, i+4), a = P[i], b = P[i1]; let rm = 0, dv = 0;
          for(let k=i;k<=i1;k++){ if(P[k][2] > rm) rm = P[k][2]; const d = psd(P[k][0], P[k][1], a[0], a[1], b[0], b[1]); if(d > dv) dv = d; }
          CH0[ch] = id - (P.length-1) + i; CH1[ch] = id - (P.length-1) + i1; CR[ch] = rm; CD[ch] = dv;
          const pad = rm + dv + Math.max(150, 0.6*rm)/2 + 5;
          for(let gx=cl(Math.min(a[0],b[0])-pad, CX); gx<=cl(Math.max(a[0],b[0])+pad, CX); gx++)
            for(let gy=cl(Math.min(a[1],b[1])-pad, CY); gy<=cl(Math.max(a[1],b[1])+pad, CY); gy++) cell[gx*CY+gy].push(ch); } } }
    const chx0 = c => SX0[CH0[c]], chy0 = c => SY0[CH0[c]], chx1 = c => SX1[CH1[c]-1], chy1 = c => SY1[CH1[c]-1];
    const endArc = (e, s, nId) => (e.a === nId && e.b === nId) ? Math.min(s, e._len-s) : (e.a === nId ? s : e._len - s);
    function nearAdj(ea, tA, eb, tB){
      for(const na of [ea.a, ea.b]) for(const nb of [eb.a, eb.b]){
        const E = 3*Math.max(nodeRmax.get(na), nodeRmax.get(nb));
        if(na === nb){ if(endArc(ea,tA,na) < E && endArc(eb,tB,nb) < E) return true; }
        else for(const c of inc.get(na)) if((c.a===na && c.b===nb) || (c.b===na && c.a===nb)){ if(endArc(ea,tA,na) + c._len + endArc(eb,tB,nb) < 2*E) return true; }
      }
      return false;
    }
    const bad = new Map(), mark = new Int32Array(NCH).fill(-1), A = {}, B = {};
    function pairSeg(ia, ib){
      if(SE[ia] === SE[ib] && Math.abs(SS0[ia]-SS0[ib]) < 4*Math.max(SR0[ia],SR0[ib])) return;
      A.x0 = SX0[ia]; A.y0 = SY0[ia]; A.x1 = SX1[ia]; A.y1 = SY1[ia]; B.x0 = SX0[ib]; B.y0 = SY0[ib]; B.x1 = SX1[ib]; B.y1 = SY1[ib];
      const q = segSegDistP(A, B), ra = SR0[ia]+(SR1[ia]-SR0[ia])*q.s, rb = SR0[ib]+(SR1[ib]-SR0[ib])*q.t;
      if(q.d - ra - rb >= Math.max(150, 0.6*Math.min(ra, rb)) + 8) return;
      const ea = net.edges[SE[ia]], eb = net.edges[SE[ib]];
      if(ea !== eb && nearAdj(ea, SS0[ia]+(SS1[ia]-SS0[ia])*q.s, eb, SS0[ib]+(SS1[ib]-SS0[ib])*q.t)) return;
      const pkey = ea.id < eb.id ? ea.id*100000+eb.id : eb.id*100000+ea.id;
      if(!bad.has(pkey)) bad.set(pkey, { ea, eb });
    }
    for(let ca=0; ca<NCH; ca++){
      const ax0 = chx0(ca), ay0 = chy0(ca), ax1 = chx1(ca), ay1 = chy1(ca), pad = CR[ca] + CD[ca] + Math.max(150, 0.6*CR[ca])/2 + 5;
      for(let gx=cl(Math.min(ax0,ax1)-pad, CX); gx<=cl(Math.max(ax0,ax1)+pad, CX); gx++) for(let gy=cl(Math.min(ay0,ay1)-pad, CY); gy<=cl(Math.max(ay0,ay1)+pad, CY); gy++){
        for(const cb of cell[gx*CY+gy]){
          if(cb < ca || mark[cb] === ca) continue; mark[cb] = ca;
          if(cb !== ca){   // chunk capsules too far apart for any violation
            const d = ssd(ax0, ay0, ax1, ay1, chx0(cb), chy0(cb), chx1(cb), chy1(cb)) - CD[ca] - CD[cb];
            if(d - CR[ca] - CR[cb] >= Math.max(150, 0.6*Math.min(CR[ca], CR[cb])) + 8 + 1) continue;
            for(let ia=CH0[ca]; ia<CH1[ca]; ia++) for(let ib=CH0[cb]; ib<CH1[cb]; ib++) pairSeg(ia < ib ? ia : ib, ia < ib ? ib : ia);
          } else for(let ia=CH0[ca]; ia<CH1[ca]; ia++) for(let ib=ia+1; ib<CH1[ca]; ib++) pairSeg(ia, ib);
        } } }
    return { badCurve, badJ, bad: [...bad.values()], inc };
  }

  // ---------------- repair: straighten first (the CCO validated the chords), prune a unit only as a last resort
  const treeOfKey = key => key >= 1000000 ? [TV, key - 1000000] : [TA, key];
  function capOfEdge(e){           // a connector below the lightest subtree of edge e
    if(e.key < 0) return -1-e.key;
    let [T, j] = treeOfKey(e.key), g = 0;
    while(g++ < 200){ if(T.caps[j].length) return T.caps[j][0]; const ks = T.kids[j]; if(!ks.length) return -1; j = ks.length === 1 ? ks[0] : (T.k[ks[0]] <= T.k[ks[1]] ? ks[0] : ks[1]); }
    return -1;
  }
  // prune the lightest subtree first; the corner connectors hold the corners and go only when nothing else can
  const edgeWeight = e => { const u = capOfEdge(e); if(e.key < 0) return (caps[u].keep ? 1000 : 0) + 0.5;
    const [T, i] = treeOfKey(e.key); return (u >= 0 && caps[u].keep ? 1000 : 0) + T.k[i]; };
  let net, rounds;
  for(rounds=0; rounds<20; rounds++){
    net = build(); const rep = check(net);
    if(!rep.badCurve.size && !rep.badJ.length && !rep.bad.length) break;
    const late = rounds >= 12, kill = new Set();
    for(const e of rep.badCurve){ const f = soft.get(e.key)||0; if(f < 1) soft.set(e.key, Math.min(1, f + 0.34)); else if(late){ const u = capOfEdge(e); if(u >= 0) kill.add(u); } }
    // spacing / gap conflicts: first let the whole bed run slightly thinner (terminals stay >= 170 µm)
    if((rep.badJ.length || rep.bad.length) && rsc > 0.87){ rsc -= 0.045; continue; }
    for(const v of rep.bad){
      const sa = soft.get(v.ea.key)||0, sb = soft.get(v.eb.key)||0;
      if(Math.min(sa, sb) < 0.99 && !late){ soft.set(v.ea.key, Math.min(1, sa+0.5)); soft.set(v.eb.key, Math.min(1, sb+0.5)); continue; }
      const u = capOfEdge(edgeWeight(v.ea) <= edgeWeight(v.eb) ? v.ea : v.eb); if(u >= 0) kill.add(u);
    }
    for(const [j1, j2] of rep.badJ){
      let bestE = null; for(const n of [j1, j2]) for(const e of rep.inc.get(n.id)) if(!bestE || edgeWeight(e) < edgeWeight(bestE)) bestE = e;
      if(bestE){ const u = capOfEdge(bestE); if(u >= 0) kill.add(u); }
    }
    for(const u of kill) pruneCap(u);
  }
  for(const e of net.edges){ delete e._cum; delete e._len; delete e.key; }
  const nCaps = caps.filter(c => c.alive).length;
  return { net, nCaps, rounds, layout: `${vert ? 'vertical' : 'horizontal'}, ${S} stripes` };
}

function generate(seed, opts){
  const W = (opts && opts.width) || 22000, H = (opts && opts.height) || 14000;
  const minCaps = Math.round(16*W*H/(22000*14000));
  let best = null;
  for(let att=0; att<3; att++){
    const r = attempt(seed, att, W, H, opts);
    r.void = maxVoid(r.net, W, H); r.att = att;
    r.bad = (r.void > 3200 ? 1 : 0) + (r.nCaps < minCaps ? 1 : 0);
    if(!best || r.bad < best.bad || (r.bad === best.bad && r.void - 40*r.nCaps < best.void - 40*best.nCaps)) best = r;
    if(!best.bad) break;
  }
  const net = best.net;
  return { bounds: { x0:0, y0:0, x1:W, y1:H }, nodes: net.nodes, edges: net.edges,
    meta: { name: 'dualcco', notes: `interlocking combs (${best.layout}); ${best.nCaps} AV connectors, largest void ${Math.round(best.void)} µm, repair rounds ${best.rounds}, attempt ${best.att + 1}` } };
}

const BV = window.BV = window.BV || {};
const GEN = BV.GENERATORS = BV.GENERATORS || {}; const INFO = BV.GENERATOR_INFO = BV.GENERATOR_INFO || {};
GEN['dualcco'] = generate; INFO['dualcco'] = { label: 'Interlocking combs', blurb: 'arterial and venous fingers interlock from opposite sides, joined by short capillary rungs' };
if (window.GENERATORS) window.GENERATORS['dualcco'] = generate;   // prototype harness
})();
