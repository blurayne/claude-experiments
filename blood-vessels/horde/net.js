/* ============================================================================
   HORDE — runtime vessel network
   ----------------------------------------------------------------------------
   Turns a generator's graph ({bounds, nodes, edges:[{a,b,type,pts:[[x,y,r]]}]},
   µm, y down) into everything the renderer and the simulation read:

   1. FLOW       Poiseuille solve on the graph (g = 1/Σ ℓ/r⁴, p = 1 at inlets,
                 0 at outlets). Edges are re-oriented along the solved flow and
                 carry Q; the mean speed is Q/(πr²), scaled so the inlet trunk
                 runs at CONST.V_INLET. Every point also carries its pressure
                 (chain.P, bezier.p0/p2): the pulse wave rides on it.
   2. CHAINS     Edges are joined into render chains: at every junction the
                 straightest in→out pair continues as one chain, the other
                 vessel starts (or ends) there as a side branch. Joining the
                 continuation is what keeps the smooth union free of bulges: the
                 blend only ever happens where a side branch leaves a wall.
   3. BÉZIERS    Each chain is re-sampled adaptively and turned into a C¹
                 quadratic B-spline (one quadratic Bézier per control vertex),
                 so walls are exactly smooth at any zoom.
   4. GRID       A uniform grid bins every Bézier (inflated by its shading
                 reach) into per-cell lists sorted by chain. The fragment shader
                 and the CPU field evaluate the same lists with the same maths,
                 so what you see is what the cells collide with.
   5. FIELD      evalAt(x,y) — exact merged field: normalized distance N
                 (−1 on the axis, 0 on the wall, >0 in tissue), blend radius,
                 outward gradient, flow direction × speed, oxygenation, kind.
                 sample(x,y) — the same, bilinear from lazily built tiles, for
                 the thousands of per-frame physics queries.
   ========================================================================== */
(function(){
'use strict';
const BV = window.BV = window.BV || {};

const CONST = BV.CONST = Object.assign(BV.CONST || {}, {
  WBC_R: 6,            // neutrophil radius (µm)
  RBC_R: 3.75,         // red cell radius (µm)
  MAX_ZOOM: 64/12,     // css px per µm at max zoom (a WBC ≈ 64 px across)
  V_INLET: 260,        // mean speed in the inlet trunk (µm/s, game time)
  K_SMIN: 0.22,        // smooth-union width, in units of the local radius
  WALL: [0.13, 0.06, 0.085], // wall thickness as a fraction of r: art, cap, ven
  CELL: 256,           // grid cell size (µm)
  TILE_N: 48,          // physics tile: samples per side
  TILE_H: 16,          // physics tile: sample spacing (µm)
});

// ---------------------------------------------------------------------------
// shading reach of a vessel beyond its wall (contact shadow / tissue AO). The
// renderer must not rely on a vessel's field further out than this.
const reach = r => 0.6*r + 160;
BV.vesselReach = reach;

// heart beat: systolic spike + dicrotic notch, ~0..1
BV.heart = function(t, bpm){
  const ph = (t*(bpm||66)/60) % 1;
  const sys = Math.exp(-Math.pow((ph-0.10)/0.055, 2));
  const dic = 0.32*Math.exp(-Math.pow((ph-0.36)/0.07, 2));
  return Math.min(1, sys + dic);
};

// ============================================================================
//  1. FLOW
// ============================================================================
function solveFlow(nodes, edges){
  const N = nodes.length, idx = new Map(nodes.map((n,i)=>[n.id,i]));
  const g = new Float64Array(edges.length);
  edges.forEach((e,k)=>{
    let R = 0; const P = e.pts;
    for(let i=1;i<P.length;i++){
      const r = 0.5*(P[i][2]+P[i-1][2]);
      R += Math.hypot(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]) / (r*r*r*r);
    }
    g[k] = R > 0 ? 1/R : 1e-12;
  });
  const fixed = new Float64Array(N).fill(NaN);
  for(const n of nodes){ if(n.type==='inlet') fixed[idx.get(n.id)] = 1; else if(n.type==='outlet') fixed[idx.get(n.id)] = 0; }
  // Laplacian (free nodes only) — Jacobi-preconditioned conjugate gradient
  const free = [], fi = new Int32Array(N).fill(-1);
  for(let i=0;i<N;i++) if(isNaN(fixed[i])){ fi[i] = free.length; free.push(i); }
  const M = free.length, diag = new Float64Array(M), rhs = new Float64Array(M);
  const adj = Array.from({length:M}, ()=>[]);
  edges.forEach((e,k)=>{
    const i = idx.get(e.a), j = idx.get(e.b), a = fi[i], b = fi[j];
    if(a>=0) diag[a] += g[k]; if(b>=0) diag[b] += g[k];
    if(a>=0 && b>=0){ adj[a].push(b, g[k]); adj[b].push(a, g[k]); }
    else if(a>=0 && b<0) rhs[a] += g[k]*fixed[j];
    else if(b>=0 && a<0) rhs[b] += g[k]*fixed[i];
  });
  const mul = (x, out) => { for(let a=0;a<M;a++){ let s = diag[a]*x[a]; const L = adj[a]; for(let q=0;q<L.length;q+=2) s -= L[q+1]*x[L[q]]; out[a] = s; } };
  const x = new Float64Array(M).fill(0.5), r = new Float64Array(M), z = new Float64Array(M), p = new Float64Array(M), Ap = new Float64Array(M);
  mul(x, Ap); for(let a=0;a<M;a++){ r[a] = rhs[a]-Ap[a]; z[a] = r[a]/(diag[a]||1); p[a] = z[a]; }
  let rz = 0; for(let a=0;a<M;a++) rz += r[a]*z[a];
  const r0 = Math.sqrt(rhs.reduce((s,v)=>s+v*v,0)) || 1;
  for(let it=0; it<4*M+50; it++){
    mul(p, Ap); let pAp = 0; for(let a=0;a<M;a++) pAp += p[a]*Ap[a];
    if(Math.abs(pAp) < 1e-300) break;
    const al = rz/pAp; let rn = 0;
    for(let a=0;a<M;a++){ x[a] += al*p[a]; r[a] -= al*Ap[a]; rn += r[a]*r[a]; }
    if(Math.sqrt(rn) < 1e-11*r0) break;
    let rz2 = 0; for(let a=0;a<M;a++){ z[a] = r[a]/(diag[a]||1); rz2 += r[a]*z[a]; }
    const be = rz2/rz; rz = rz2; for(let a=0;a<M;a++) p[a] = z[a] + be*p[a];
  }
  const pres = new Float64Array(N);
  for(let i=0;i<N;i++) pres[i] = isNaN(fixed[i]) ? x[fi[i]] : fixed[i];
  const Q = edges.map((e,k)=> g[k]*(pres[idx.get(e.a)] - pres[idx.get(e.b)]));
  return { Q, pres, idx };
}

// ============================================================================
//  helpers
// ============================================================================
function cumArc(P){ const c = new Float64Array(P.length); for(let i=1;i<P.length;i++) c[i] = c[i-1] + Math.hypot(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]); return c; }
function tangentAt(P, fromEnd){
  // direction of travel at the start (fromEnd=false) or end of a polyline, looking ~1.5 r in
  const n = P.length;
  if(!fromEnd){ const r = P[0][2]; let k=1; while(k<n-1 && Math.hypot(P[k][0]-P[0][0],P[k][1]-P[0][1]) < 1.5*r) k++;
    const dx=P[k][0]-P[0][0], dy=P[k][1]-P[0][1], L=Math.hypot(dx,dy)||1; return [dx/L, dy/L]; }
  const m = n-1, r = P[m][2]; let k=m-1; while(k>0 && Math.hypot(P[k][0]-P[m][0],P[k][1]-P[m][1]) < 1.5*r) k--;
  const dx=P[m][0]-P[k][0], dy=P[m][1]-P[k][1], L=Math.hypot(dx,dy)||1; return [dx/L, dy/L];
}
const KIND = { art:0, cap:1, ven:2 };

// ============================================================================
//  BUILD
// ============================================================================
BV.buildNet = function(gen){
  const t0 = performance.now();
  const bounds = gen.bounds;
  const nodes = gen.nodes.map(n=>({ id:n.id, x:n.x, y:n.y, type:n.type, ins:[], outs:[] }));
  const nodeById = new Map(nodes.map(n=>[n.id,n]));
  const edges = gen.edges.map(e=>({ id:e.id, a:e.a, b:e.b, type:e.type, kind:KIND[e.type] ?? 0, pts:e.pts.map(p=>[p[0],p[1],p[2]]) }));

  // ---- 1. flow ------------------------------------------------------------
  const F = solveFlow(nodes, edges);
  let qIn = 0;
  edges.forEach((e,k)=>{
    let q = F.Q[k];
    if(q < 0){ const t = e.a; e.a = e.b; e.b = t; e.pts.reverse(); q = -q; }
    e.Q = q;
    e.pA = F.pres[F.idx.get(e.a)]; e.pB = F.pres[F.idx.get(e.b)];
  });
  for(const e of edges){ nodeById.get(e.a).outs.push(e); nodeById.get(e.b).ins.push(e); }
  for(const n of nodes) if(n.type==='inlet') for(const e of n.outs) qIn += e.Q;
  qIn = qIn || 1;
  // speed scale: the widest inlet runs at V_INLET
  let inR = 0; for(const n of nodes) if(n.type==='inlet') for(const e of n.outs) inR = Math.max(inR, e.pts[0][2]);
  let inQ = 0; for(const n of nodes) if(n.type==='inlet') for(const e of n.outs) if(e.pts[0][2] === inR) inQ = e.Q;
  const vScale = CONST.V_INLET * Math.PI*inR*inR / (inQ || qIn);
  for(const e of edges){
    e.cum = cumArc(e.pts); e.len = e.cum[e.pts.length-1];
    e.qn = e.Q / qIn;
    // per-point attributes: mean speed, oxygenation, kind
    const n = e.pts.length;
    e.spd = new Float64Array(n); e.oxy = new Float64Array(n); e.prs = new Float64Array(n);
    // pressure falls along the vessel in proportion to the Poiseuille resistance Σ ℓ/r⁴
    { let Rt = 0; const cr = new Float64Array(n);
      for(let i=1;i<n;i++){ const r = 0.5*(e.pts[i][2]+e.pts[i-1][2]); Rt += (e.cum[i]-e.cum[i-1])/(r*r*r*r); cr[i] = Rt; }
      for(let i=0;i<n;i++) e.prs[i] = e.pA + (e.pB - e.pA)*(Rt > 0 ? cr[i]/Rt : i/(n-1||1)); }
    for(let i=0;i<n;i++){
      const r = e.pts[i][2];
      e.spd[i] = Math.min(CONST.V_INLET*1.6, e.Q*vScale/(Math.PI*r*r));
      const f = e.len > 0 ? e.cum[i]/e.len : 0;
      e.oxy[i] = e.type==='art' ? 1 : e.type==='ven' ? 0 : 1 - f;
    }
  }

  // ---- 2. chains ----------------------------------------------------------
  const next = new Map(), prev = new Map();
  for(const n of nodes){
    if(n.type==='inlet' || n.type==='outlet') continue;
    const ins = n.ins.slice(), outs = n.outs.slice();
    if(ins.length===1 && outs.length===1){ next.set(ins[0], outs[0]); prev.set(outs[0], ins[0]); continue; }
    while(ins.length && outs.length){
      let best = -9, bi = -1, bo = -1;
      for(let i=0;i<ins.length;i++) for(let o=0;o<outs.length;o++){
        const ti = tangentAt(ins[i].pts, true), to = tangentAt(outs[o].pts, false);
        const ri = ins[i].pts[ins[i].pts.length-1][2], ro = outs[o].pts[0][2];
        const s = ti[0]*to[0]+ti[1]*to[1] + 0.35*Math.min(ri,ro)/Math.max(ri,ro);
        if(s > best){ best = s; bi = i; bo = o; }
      }
      if(best < 0.15) break;           // no straight-enough continuation: all of them are side branches
      next.set(ins[bi], outs[bo]); prev.set(outs[bo], ins[bi]);
      ins.splice(bi,1); outs.splice(bo,1);
    }
  }
  const chains = [], seen = new Set();
  function walk(start){
    const list = []; let e = start;
    while(e && !seen.has(e)){ seen.add(e); list.push(e); e = next.get(e); }
    return list;
  }
  for(const e of edges) if(!prev.has(e) && !seen.has(e)) chains.push(walk(e));
  for(const e of edges) if(!seen.has(e)) chains.push(walk(e));   // pure cycles

  const C = chains.map((list, ci)=>{
    const X=[], Y=[], R=[], O=[], S=[], K=[], E=[], EA=[], P=[], joints=[];
    list.forEach((e, li)=>{
      e.chain = ci;
      const n = e.pts.length;
      for(let i = li ? 1 : 0; i<n; i++){
        X.push(e.pts[i][0]); Y.push(e.pts[i][1]); R.push(e.pts[i][2]);
        O.push(e.oxy[i]); S.push(e.spd[i]); K.push(e.kind); E.push(e.id); EA.push(e.cum[i]); P.push(e.prs[i]);
      }
      if(li < list.length-1) joints.push(X.length-1);
    });
    // round off the kink where a continuation pair meets (Laplacian, local)
    for(const j of joints){
      const rj = R[j];
      let lo = j, hi = j, acc = 0;
      while(lo>1 && acc < 1.6*rj){ acc += Math.hypot(X[lo]-X[lo-1], Y[lo]-Y[lo-1]); lo--; }
      acc = 0; while(hi<X.length-2 && acc < 1.6*rj){ acc += Math.hypot(X[hi+1]-X[hi], Y[hi+1]-Y[hi]); hi++; }
      for(let it=0; it<8; it++) for(let i=lo+1;i<hi;i++){
        X[i] += 0.5*((X[i-1]+X[i+1])*0.5 - X[i]); Y[i] += 0.5*((Y[i-1]+Y[i+1])*0.5 - Y[i]);
      }
    }
    // a vessel that continues into a thinner one (e.g. a terminal into its AV
    // connector) may step in radius at the joint; a step reads as a notch or a
    // bulb in the smooth union, so ramp it over ~1.5 r on either side
    for(const j of joints){
      if(j+1 >= R.length) continue;
      const ra = R[j], rb = R[j+1];
      if(Math.abs(ra-rb) < 0.04*Math.max(ra,rb)) continue;
      const w = 1.5*Math.max(ra, rb);
      let lo = j, hi = j+1, acc = 0;
      while(lo>0 && acc < w){ acc += Math.hypot(X[lo]-X[lo-1], Y[lo]-Y[lo-1]); lo--; }
      acc = 0; while(hi<X.length-1 && acc < w){ acc += Math.hypot(X[hi+1]-X[hi], Y[hi+1]-Y[hi]); hi++; }
      const r0 = R[lo], r1 = R[hi]; let tot = 0;
      for(let i=lo+1;i<=hi;i++) tot += Math.hypot(X[i]-X[i-1], Y[i]-Y[i-1]);
      acc = 0;
      for(let i=lo+1;i<hi;i++){
        acc += Math.hypot(X[i]-X[i-1], Y[i]-Y[i-1]);
        const f = tot > 0 ? acc/tot : 0.5;
        R[i] = r0 + (r1-r0)*f*f*(3-2*f);
      }
    }
    const cum = new Float64Array(X.length);
    for(let i=1;i<X.length;i++) cum[i] = cum[i-1] + Math.hypot(X[i]-X[i-1], Y[i]-Y[i-1]);
    return { id:ci, edges:list.map(e=>e.id), X, Y, R, O, S, K, E, EA, P, cum, len:cum[X.length-1] };
  });

  // ---- 3. Béziers (quadratic B-spline per chain) --------------------------
  const beziers = [];     // {ax,ay,bx,by,cx,cy, r0,r2, s0,s2, o0,o2, v0,v2, k0,k2, chain}
  const attrAt = (ch, s) => {   // interpolate chain attributes at arc position s
    const c = ch.cum; let lo = 0, hi = c.length-1;
    if(s <= 0) lo = hi = 0; else if(s >= ch.len) lo = hi = c.length-1;
    else { while(hi-lo > 1){ const m = (lo+hi)>>1; if(c[m] <= s) lo = m; else hi = m; } }
    const t = hi>lo ? (s-c[lo])/(c[hi]-c[lo]) : 0, L = (A)=>A[lo]+(A[hi]-A[lo])*t;
    return { x:L(ch.X), y:L(ch.Y), r:L(ch.R), o:L(ch.O), v:L(ch.S), k:L(ch.K), p:L(ch.P) };
  };
  for(const ch of C){
    // adaptive control vertices: spacing ~0.9 r, and never more than ~20° of turning per span
    const n = ch.X.length, V = [0];
    let acc = 0, turn = 0;
    for(let i=1;i<n;i++){
      acc = ch.cum[i] - ch.cum[V[V.length-1]];
      if(i < n-1){
        const ax = ch.X[i]-ch.X[i-1], ay = ch.Y[i]-ch.Y[i-1], bx = ch.X[i+1]-ch.X[i], by = ch.Y[i+1]-ch.Y[i];
        const la = Math.hypot(ax,ay), lb = Math.hypot(bx,by);
        if(la>1e-6 && lb>1e-6) turn += Math.acos(Math.max(-1,Math.min(1,(ax*bx+ay*by)/(la*lb))));
      }
      const step = Math.max(60, Math.min(450, 0.9*ch.R[i]));
      if(i === n-1 || acc >= step || turn > 0.36){ V.push(i); turn = 0; }
    }
    if(V[V.length-1] !== n-1) V.push(n-1);
    const m = V.length-1;
    const Q = V.map(i=>[ch.X[i], ch.Y[i], ch.cum[i]]);
    const emit = (A, B, Cc) => {
      const a0 = attrAt(ch, A[2]), a2 = attrAt(ch, Cc[2]);
      beziers.push({ ax:A[0], ay:A[1], bx:B[0], by:B[1], cx:Cc[0], cy:Cc[1],
        r0:a0.r, r2:a2.r, s0:A[2], s2:Cc[2], o0:a0.o, o2:a2.o, v0:a0.v, v2:a2.v, k0:a0.k, k2:a2.k, p0:a0.p, p2:a2.p, chain:ch.id });
    };
    const mid = (p,q)=>[(p[0]+q[0])/2, (p[1]+q[1])/2, (p[2]+q[2])/2];
    if(m === 1){ emit(Q[0], mid(Q[0],Q[1]), Q[1]); }
    else for(let i=1;i<m;i++){
      const A = i===1 ? Q[0] : mid(Q[i-1], Q[i]);
      const Cc = i===m-1 ? Q[m] : mid(Q[i], Q[i+1]);
      emit(A, Q[i], Cc);
    }
    ch.bz0 = beziers.length; // (end index; start filled below)
  }
  { let s = 0; for(const ch of C){ const e = ch.bz0; ch.bzStart = s; ch.bzEnd = e; s = e; } }

  // ---- 4. grid ------------------------------------------------------------
  const CS = CONST.CELL;
  const ox = bounds.x0 - 2*CS, oy = bounds.y0 - 2*CS;
  const GW = Math.ceil((bounds.x1 - bounds.x0)/CS) + 4, GH = Math.ceil((bounds.y1 - bounds.y0)/CS) + 4;
  const cells = Array.from({length: GW*GH}, ()=>[]);
  const half = CS*Math.SQRT1_2;
  beziers.forEach((b, bi)=>{
    const rmax = Math.max(b.r0, b.r2), R = rmax + reach(rmax) + half;
    const minx = Math.min(b.ax,b.bx,b.cx) - R, maxx = Math.max(b.ax,b.bx,b.cx) + R;
    const miny = Math.min(b.ay,b.by,b.cy) - R, maxy = Math.max(b.ay,b.by,b.cy) + R;
    const gx0 = Math.max(0, Math.floor((minx-ox)/CS)), gx1 = Math.min(GW-1, Math.floor((maxx-ox)/CS));
    const gy0 = Math.max(0, Math.floor((miny-oy)/CS)), gy1 = Math.min(GH-1, Math.floor((maxy-oy)/CS));
    for(let gy=gy0; gy<=gy1; gy++) for(let gx=gx0; gx<=gx1; gx++){
      const px = ox + (gx+0.5)*CS, py = oy + (gy+0.5)*CS;
      if(hullDist(px,py,b) <= R) cells[gy*GW+gx].push(bi);
    }
  });
  let maxList = 0, total = 0;
  for(const L of cells){ L.sort((p,q)=> beziers[p].chain - beziers[q].chain || p - q); maxList = Math.max(maxList, L.length); total += L.length; }

  // ---- GPU payload --------------------------------------------------------
  // segData: 4 texels (RGBA32F) per Bézier
  //  T0 = (A.x, A.y, B.x, B.y)   T1 = (C.x, C.y, r0, r2)
  //  T2 = (s0, s2, chain, round(4·k0)·16 + round(4·k2))   T3 = (oxy0, oxy2, v0, v2)
  const SEG_W = 1024;  // texture width in texels (256 Béziers per row)
  const segRows = Math.max(1, Math.ceil(beziers.length*4/SEG_W));
  const segData = new Float32Array(SEG_W*segRows*4);
  beziers.forEach((b,i)=>{
    const o = i*16;
    // kind (0 art … 1 cap … 2 ven) quantised to quarters: packed = round(4·k0)·16 + round(4·k2)
    segData.set([b.ax,b.ay,b.bx,b.by, b.cx,b.cy,b.r0,b.r2, b.s0,b.s2,b.chain, Math.round(4*b.k0)*16 + Math.round(4*b.k2), b.o0,b.o2,b.v0,b.v2], o);
  });
  const cellData = new Float32Array(GW*GH*2);
  const LIST_W = 2048;
  const listRows = Math.max(1, Math.ceil(total/LIST_W));
  const listData = new Float32Array(LIST_W*listRows);
  { let off = 0; cells.forEach((L, c)=>{ cellData[c*2] = off; cellData[c*2+1] = L.length; for(const v of L) listData[off++] = v; }); }

  const net = {
    bounds, nodes, edges, nodeById, chains: C, beziers,
    grid: { ox, oy, cs: CS, w: GW, h: GH, cells, maxList },
    gpu: { segData, segW: SEG_W, segRows, segCount: beziers.length,
           cellData, gridW: GW, gridH: GH, cellSize: CS, originX: ox, originY: oy,
           listData, listW: LIST_W, listRows, maxList },
    flow: { qIn, vScale },
    inlets: nodes.filter(n=>n.type==='inlet'), outlets: nodes.filter(n=>n.type==='outlet'),
    buildMs: 0,
  };
  net.evalAt = (x, y, out) => evalAt(net, x, y, out || {});
  net.sample = makeSampler(net);
  net.buildMs = performance.now() - t0;
  return net;
};

function hullDist(px, py, b){
  // distance from p to the triangle hull(A,B,C) (0 inside) — a lower bound on the distance to the curve
  const s = (ax,ay,bx,by)=>{ const vx=bx-ax, vy=by-ay, L2=vx*vx+vy*vy; let t = L2>0 ? ((px-ax)*vx+(py-ay)*vy)/L2 : 0; t = t<0?0:t>1?1:t; return Math.hypot(px-ax-vx*t, py-ay-vy*t); };
  const cr = (ax,ay,bx,by)=> (bx-ax)*(py-ay)-(by-ay)*(px-ax);
  const d1 = cr(b.ax,b.ay,b.bx,b.by), d2 = cr(b.bx,b.by,b.cx,b.cy), d3 = cr(b.cx,b.cy,b.ax,b.ay);
  const inside = (d1>=0&&d2>=0&&d3>=0) || (d1<=0&&d2<=0&&d3<=0);
  if(inside) return 0;
  return Math.min(s(b.ax,b.ay,b.bx,b.by), s(b.bx,b.by,b.cx,b.cy), s(b.cx,b.cy,b.ax,b.ay));
}

// ============================================================================
//  closest point on a quadratic Bézier (Inigo Quilez's analytic solve).
//  Writes t and the squared distance into BZ; straight spans fall back to a line.
// ============================================================================
const BZ = { t:0, d2:0 };
function bezierClosest(px, py, ax, ay, bx, by, cx, cy){
  const Ax = bx-ax, Ay = by-ay, Bx = ax-2*bx+cx, By = ay-2*by+cy;
  const bb = Bx*Bx + By*By;
  const Dx = ax-px, Dy = ay-py;
  const chx = cx-ax, chy = cy-ay, ch2 = chx*chx + chy*chy;
  if(bb < 1e-7*ch2 || bb < 1e-9){
    let t = ch2 > 0 ? -(Dx*chx + Dy*chy)/ch2 : 0; t = t<0?0:t>1?1:t;
    const qx = Dx + chx*t, qy = Dy + chy*t; BZ.t = t; BZ.d2 = qx*qx+qy*qy; return;
  }
  const kk = 1/bb;
  const kx = kk*(Ax*Bx + Ay*By);
  const ky = kk*(2*(Ax*Ax+Ay*Ay) + (Dx*Bx+Dy*By))/3;
  const kz = kk*(Dx*Ax + Dy*Ay);
  const p = ky - kx*kx, p3 = p*p*p;
  const q = kx*(2*kx*kx - 3*ky) + kz;
  const h = q*q + 4*p3;
  // |B(t) − p|² = |D + (2A + B·t)·t|², written out inline: a closure here would
  // allocate on every call (this runs millions of times while physics tiles build)
  if(h >= 0){
    const hs = Math.sqrt(h);
    const x0 = (hs - q)/2, x1 = (-hs - q)/2;
    const u = Math.cbrt(x0), v = Math.cbrt(x1);
    let t = u + v - kx; t = t<0?0:t>1?1:t;
    const qx = Dx + (2*Ax + Bx*t)*t, qy = Dy + (2*Ay + By*t)*t;
    BZ.t = t; BZ.d2 = qx*qx + qy*qy;
  } else {
    const z = Math.sqrt(-p);
    const vv = Math.acos(Math.max(-1, Math.min(1, q/(p*z*2))))/3;
    const m = Math.cos(vv), nn = Math.sin(vv)*1.732050808;
    let t1 = (m+m)*z - kx, t2 = (-nn-m)*z - kx;
    t1 = t1<0?0:t1>1?1:t1; t2 = t2<0?0:t2>1?1:t2;
    const q1x = Dx + (2*Ax + Bx*t1)*t1, q1y = Dy + (2*Ay + By*t1)*t1;
    const q2x = Dx + (2*Ax + Bx*t2)*t2, q2y = Dy + (2*Ay + By*t2)*t2;
    const d1 = q1x*q1x + q1y*q1y, d2 = q2x*q2x + q2y*q2y;
    if(d1 < d2){ BZ.t = t1; BZ.d2 = d1; } else { BZ.t = t2; BZ.d2 = d2; }
  }
}
BV.bezierClosest = (px,py,ax,ay,bx,by,cx,cy) => { bezierClosest(px,py,ax,ay,bx,by,cx,cy); return { t:BZ.t, d:Math.sqrt(BZ.d2) }; };

// ============================================================================
//  5. FIELD — exact evaluation (mirrors the fragment shader)
// ============================================================================
//  per chain: n_c = (|p − B(t*)| − r(t*)) / r(t*), min over the chain's Béziers
//  merged:    N = −k·log2( Σ_c 2^(−n_c/k) )          (associative smooth union)
//  attrs:     Σ w_c·attr_c / Σ w_c,  w_c = 2^(−n_c/k)
function evalAt(net, x, y, out){
  // Mirrors the world pass of render.js exactly (keep them in sync):
  //  • each Bézier's contribution fades out at its shading reach (0.6 r + 160 µm):
  //    fade = 1 − smoothstep(0.7·reach, reach, dist − r), weight 2^(−n/k)·fade;
  //  • per chain, the weight comes from the smallest faded normalised distance,
  //    the attributes (radius, gradient, tangent, flow, oxy, kind) from the
  //    Euclidean-closest centreline point, which stays continuous across joints;
  //  • kind is read at the GPU's quarter quantisation.
  // So the physics lumen is the drawn lumen.
  const G = net.grid, B = net.beziers, k = CONST.K_SMIN;
  const gx = Math.floor((x - G.ox)/G.cs), gy = Math.floor((y - G.oy)/G.cs);
  out.N = 1e3; out.d = 1e5; out.rB = 100; out.gx = 0; out.gy = 0; out.fx = 0; out.fy = 0;
  out.oxy = 0.5; out.kind = 0; out.chain = -1; out.s = 0; out.wall = CONST.WALL[0]; out.dmin = 1e5;
  if(gx < 0 || gy < 0 || gx >= G.w || gy >= G.h) return out;
  const L = G.cells[gy*G.w + gx];
  if(!L.length) return out;
  let acc = 0, aR = 0, aGx = 0, aGy = 0, aFx = 0, aFy = 0, aO = 0, aK = 0, dmin = 1e9;
  let bestN = 1e9, bestChain = -1, bestS = 0;
  // cn: weight pick (min faded n); e*: coordinate pick (Euclidean-closest point)
  let cur = -1, cn = 1e9, ed = 1e9, er = 0, egx = 0, egy = 0, etx = 0, ety = 0, ev = 0, eo = 0, ek = 0, es = 0, cd = 1e9;
  // The per-chain flush is written out twice (on a chain change, and after the
  // loop) rather than as a closure: a closure capturing these mutable doubles
  // moves them into a heap context and boxes every write (~1.8 KB per call).
  for(let i=0;i<L.length;i++){
    const b = B[L[i]];
    if(b.chain !== cur){
      if(cur >= 0 && cn < 1e8 && ed < 1e8){   // flush the previous chain
        const w = Math.pow(2, -cn/k);
        acc += w; aR += w*er; aGx += w*egx; aGy += w*egy; aFx += w*etx*ev; aFy += w*ety*ev; aO += w*eo; aK += w*ek;
        if(cd < dmin) dmin = cd;
        if(cn < bestN){ bestN = cn; bestChain = cur; bestS = es; }
      }
      cur = b.chain; cn = 1e9; ed = 1e9; cd = 1e9;
    }
    bezierClosest(x, y, b.ax, b.ay, b.bx, b.by, b.cx, b.cy);
    const t = BZ.t, dist = Math.sqrt(BZ.d2);
    const r = b.r0 + (b.r2-b.r0)*t;
    const reach = 0.6*r + 160, e0 = 0.7*reach, xr = dist - r;
    let fade = 1;
    if(xr >= reach) continue;
    if(xr > e0){ const f = (xr - e0)/(reach - e0); fade = 1 - f*f*(3 - 2*f); if(fade <= 0) continue; }
    if(xr < cd) cd = xr;
    if(dist < ed){
      ed = dist; er = r;
      const u = 1-t;
      const qx = u*u*b.ax + 2*u*t*b.bx + t*t*b.cx, qy = u*u*b.ay + 2*u*t*b.by + t*t*b.cy;
      let tx = 2*(u*(b.bx-b.ax) + t*(b.cx-b.bx)), ty = 2*(u*(b.by-b.ay) + t*(b.cy-b.by));
      const tl = Math.sqrt(tx*tx + ty*ty);
      if(tl > 1e-6){ tx /= tl; ty /= tl; } else { tx = 1; ty = 0; }
      let ux = x - qx, uy = y - qy; const ul = Math.sqrt(ux*ux + uy*uy);
      if(ul > 1e-3){ ux /= ul; uy /= ul; } else { ux = -ty; uy = tx; }
      egx = ux; egy = uy; etx = tx; ety = ty;
      ev = b.v0 + (b.v2-b.v0)*t; eo = b.o0 + (b.o2-b.o0)*t;
      const k0 = Math.round(4*b.k0), k2 = Math.round(4*b.k2);
      ek = (k0 + (k2-k0)*t)*0.25;
      es = b.s0 + (b.s2-b.s0)*t;
    }
    const nf = (dist - r)/r - k*Math.log2(fade);
    if(nf < cn) cn = nf;
  }
  if(cur >= 0 && cn < 1e8 && ed < 1e8){   // flush the last chain
    const w = Math.pow(2, -cn/k);
    acc += w; aR += w*er; aGx += w*egx; aGy += w*egy; aFx += w*etx*ev; aFy += w*ety*ev; aO += w*eo; aK += w*ek;
    if(cd < dmin) dmin = cd;
    if(cn < bestN){ bestN = cn; bestChain = cur; bestS = es; }
  }
  if(!(acc > 1e-30)) return out;          // everything faded: far tissue
  const N = Math.min(-k*Math.log2(acc), 6);   // the shader clamps at NFAR = 6
  const rB = aR/acc;
  let gxx = aGx/acc, gyy = aGy/acc; const gl = Math.sqrt(gxx*gxx + gyy*gyy) || 1;
  out.N = N; out.rB = rB; out.d = N*rB; out.dmin = dmin;
  out.gx = gxx/gl; out.gy = gyy/gl;
  out.fx = aFx/acc; out.fy = aFy/acc;
  out.oxy = aO/acc; out.kind = aK/acc;
  const kk = out.kind, W = CONST.WALL;
  out.wall = kk <= 1 ? W[0] + (W[1]-W[0])*kk : W[1] + (W[2]-W[1])*(kk-1);
  out.chain = bestChain; out.s = bestS;
  return out;
}

// ============================================================================
//  lazily built physics tiles, bilinear lookup
//  per sample: N, rB, gx, gy, fx, fy, oxy, kind   (8 floats)
// ============================================================================
function makeSampler(net){
  const TN = CONST.TILE_N, TH = CONST.TILE_H, TS = TN*TH, STR = 8;
  const b = net.bounds, x0 = b.x0 - TS, y0 = b.y0 - TS;
  const TW = Math.ceil((b.x1 - x0 + TS)/TS), THt = Math.ceil((b.y1 - y0 + TS)/TS);
  const tiles = new Array(TW*THt).fill(null);
  const FAR = new Float32Array(0);
  const tmp = {};
  let built = 0;
  function build(ti){
    const tx = ti % TW, ty = (ti / TW) | 0;
    const bx = x0 + tx*TS, by = y0 + ty*TS;
    // empty if every grid cell under the tile (plus a sample of margin) is empty
    const G = net.grid;
    const gx0 = Math.max(0, Math.floor((bx - TH - G.ox)/G.cs)), gx1 = Math.min(G.w-1, Math.floor((bx + TS + TH - G.ox)/G.cs));
    const gy0 = Math.max(0, Math.floor((by - TH - G.oy)/G.cs)), gy1 = Math.min(G.h-1, Math.floor((by + TS + TH - G.oy)/G.cs));
    let any = false;
    for(let gy=gy0; gy<=gy1 && !any; gy++) for(let gx=gx0; gx<=gx1; gx++) if(G.cells[gy*G.w+gx].length){ any = true; break; }
    if(!any){ tiles[ti] = FAR; return FAR; }
    const n1 = TN + 1;
    const D = new Float32Array(n1*n1*STR);
    for(let j=0;j<n1;j++) for(let i=0;i<n1;i++){
      evalAt(net, bx + i*TH, by + j*TH, tmp);
      const o = (j*n1 + i)*STR;
      D[o] = tmp.N; D[o+1] = tmp.rB; D[o+2] = tmp.gx; D[o+3] = tmp.gy; D[o+4] = tmp.fx; D[o+5] = tmp.fy; D[o+6] = tmp.oxy; D[o+7] = tmp.kind;
    }
    tiles[ti] = D; built++;
    return D;
  }
  const setFar = out => { out.N = 1e3; out.rB = 100; out.d = 1e5; out.gx = 0; out.gy = 0; out.fx = 0; out.fy = 0; out.oxy = 0.5; out.kind = 0; out.wall = CONST.WALL[0]; return out; };
  const W0 = CONST.WALL[0], W1 = CONST.WALL[1], W2 = CONST.WALL[2];
  const sample = function(x, y, out){
    out = out || {};
    const fx = (x - x0)/TS, fy = (y - y0)/TS;
    const tx = Math.floor(fx), ty = Math.floor(fy);
    if(tx < 0 || ty < 0 || tx >= TW || ty >= THt) return setFar(out);
    const ti = ty*TW + tx;
    const D = tiles[ti] || build(ti);
    if(D === FAR) return setFar(out);
    const u = (fx - tx)*TN, v = (fy - ty)*TN;
    let i = u|0, j = v|0; if(i >= TN) i = TN-1; if(j >= TN) j = TN-1;
    const a = u - i, c = v - j, n1 = TN + 1;
    const o00 = (j*n1 + i)*STR, o10 = o00 + STR, o01 = o00 + n1*STR, o11 = o01 + STR;
    const w00 = (1-a)*(1-c), w10 = a*(1-c), w01 = (1-a)*c, w11 = a*c;
    const N = D[o00]*w00 + D[o10]*w10 + D[o01]*w01 + D[o11]*w11;
    const rB = D[o00+1]*w00 + D[o10+1]*w10 + D[o01+1]*w01 + D[o11+1]*w11;
    let gx = D[o00+2]*w00 + D[o10+2]*w10 + D[o01+2]*w01 + D[o11+2]*w11;
    let gy = D[o00+3]*w00 + D[o10+3]*w10 + D[o01+3]*w01 + D[o11+3]*w11;
    const gl = Math.sqrt(gx*gx + gy*gy) || 1;
    const kk = D[o00+7]*w00 + D[o10+7]*w10 + D[o01+7]*w01 + D[o11+7]*w11;
    out.N = N; out.rB = rB; out.d = N*rB; out.gx = gx/gl; out.gy = gy/gl;
    out.fx = D[o00+4]*w00 + D[o10+4]*w10 + D[o01+4]*w01 + D[o11+4]*w11;
    out.fy = D[o00+5]*w00 + D[o10+5]*w10 + D[o01+5]*w01 + D[o11+5]*w11;
    out.oxy = D[o00+6]*w00 + D[o10+6]*w10 + D[o01+6]*w01 + D[o11+6]*w11;
    out.kind = kk;
    out.wall = kk <= 1 ? W0 + (W1-W0)*kk : W1 + (W2-W1)*(kk-1);
    return out;
  };
  // Allocation-free twin of sample() for hot loops (added for sim.js), same
  // maths. The point goes in and the result comes out through one Float64Array
  // (io[10] = x, io[11] = y → io[0..9] = N, rB, d, gx, gy, fx, fy, oxy, kind,
  // wall): V8 boxes every double passed as an argument to, or stored into an
  // object field by, a call it does not inline (~70 B per sample() call).
  sample.f = function(out){
    const x = out[10], y = out[11];
    const fx = (x - x0)/TS, fy = (y - y0)/TS;
    const tx = Math.floor(fx), ty = Math.floor(fy);
    const ti = ty*TW + tx;
    const D = (tx < 0 || ty < 0 || tx >= TW || ty >= THt) ? FAR : (tiles[ti] || build(ti));
    if(D === FAR){ out[0] = 1e3; out[1] = 100; out[2] = 1e5; out[3] = 0; out[4] = 0; out[5] = 0; out[6] = 0; out[7] = 0.5; out[8] = 0; out[9] = W0; return out; }
    const u = (fx - tx)*TN, v = (fy - ty)*TN;
    let i = u|0, j = v|0; if(i >= TN) i = TN-1; if(j >= TN) j = TN-1;
    const a = u - i, c = v - j, n1 = TN + 1;
    const o00 = (j*n1 + i)*STR, o10 = o00 + STR, o01 = o00 + n1*STR, o11 = o01 + STR;
    const w00 = (1-a)*(1-c), w10 = a*(1-c), w01 = (1-a)*c, w11 = a*c;
    const N = D[o00]*w00 + D[o10]*w10 + D[o01]*w01 + D[o11]*w11;
    const rB = D[o00+1]*w00 + D[o10+1]*w10 + D[o01+1]*w01 + D[o11+1]*w11;
    const gx = D[o00+2]*w00 + D[o10+2]*w10 + D[o01+2]*w01 + D[o11+2]*w11;
    const gy = D[o00+3]*w00 + D[o10+3]*w10 + D[o01+3]*w01 + D[o11+3]*w11;
    const gl = Math.sqrt(gx*gx + gy*gy) || 1;
    const kk = D[o00+7]*w00 + D[o10+7]*w10 + D[o01+7]*w01 + D[o11+7]*w11;
    out[0] = N; out[1] = rB; out[2] = N*rB; out[3] = gx/gl; out[4] = gy/gl;
    out[5] = D[o00+4]*w00 + D[o10+4]*w10 + D[o01+4]*w01 + D[o11+4]*w11;
    out[6] = D[o00+5]*w00 + D[o10+5]*w10 + D[o01+5]*w01 + D[o11+5]*w11;
    out[7] = D[o00+6]*w00 + D[o10+6]*w10 + D[o01+6]*w01 + D[o11+6]*w11;
    out[8] = kk;
    out[9] = kk <= 1 ? W0 + (W1-W0)*kk : W1 + (W2-W1)*(kk-1);
    return out;
  };
  // warm tiles in idle time so the first frames in a region don't stall
  sample.prewarm = function(budgetMs){
    const t0 = performance.now(); let k = 0;
    for(let ti=0; ti<tiles.length; ti++){ if(tiles[ti]) continue; build(ti); k++; if(performance.now() - t0 > budgetMs) break; }
    return k;
  };
  // Warm the tiles under a rect (µm), nearest its centre first, until budgetMs
  // runs out (at least one tile per call). Tiles are otherwise built on the
  // first sample, synchronously, and a view full of new tiles stalls a frame.
  // Returns how many tiles under the rect are still missing.
  sample.prewarmRect = function(ax0, ay0, ax1, ay1, budgetMs){
    const t0 = performance.now();
    const tx0 = Math.max(0, Math.floor((Math.min(ax0, ax1) - x0)/TS)), tx1 = Math.min(TW-1, Math.floor((Math.max(ax0, ax1) - x0)/TS));
    const ty0 = Math.max(0, Math.floor((Math.min(ay0, ay1) - y0)/TS)), ty1 = Math.min(THt-1, Math.floor((Math.max(ay0, ay1) - y0)/TS));
    let mx = 0.5*(ax0 + ax1), my = 0.5*(ay0 + ay1);
    if(!isFinite(mx)) mx = x0 + 0.5*(tx0 + tx1 + 1)*TS;
    if(!isFinite(my)) my = y0 + 0.5*(ty0 + ty1 + 1)*TS;
    for(let k=0;; k++){
      let best = -1, bd = Infinity, missing = 0;
      for(let ty=ty0; ty<=ty1; ty++) for(let tx=tx0; tx<=tx1; tx++){
        const ti = ty*TW + tx;
        if(tiles[ti]) continue;
        missing++;
        const dx = x0 + (tx + 0.5)*TS - mx, dy = y0 + (ty + 0.5)*TS - my, d = dx*dx + dy*dy;
        if(d < bd){ bd = d; best = ti; }
      }
      if(best < 0 || (k > 0 && performance.now() - t0 > budgetMs)) return missing;
      build(best);
    }
  };
  // true when sampling (x, y) will not have to build a tile first
  sample.isBuilt = function(x, y){
    const tx = Math.floor((x - x0)/TS), ty = Math.floor((y - y0)/TS);
    return tx < 0 || ty < 0 || tx >= TW || ty >= THt || !!tiles[ty*TW + tx];
  };
  sample.stats = () => ({ built, total: tiles.length });
  return sample;
}

})();
