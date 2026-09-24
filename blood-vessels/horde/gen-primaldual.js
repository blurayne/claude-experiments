/* ============================================================================
   HORDE — 'primaldual' map style ("Organ lobe")
   ----------------------------------------------------------------------------
   A flow-optimal arterial fan with veins sliding in between its branches,
   drained by a marginal vein. BV.GENERATORS.primaldual(seed, {width, height})
   returns { bounds, nodes, edges, meta } (µm, y down; see net.js).

   1. Mesh: a convex ring plus Poisson-disc points (1150 µm) -> Delaunay. Primal
      edges carry arteries; dual edges (centroid -> edge midpoint -> centroid)
      carry veins. A primal edge and its dual edge cross, so at most one of each
      pair is used: the network is planar by construction.
   2. Terminals: Poisson-spaced interior vertices, short recurrent twigs into the
      corners beside the inlet, and a void filler that probes the mesh-level
      network for its largest tissue gaps and adds a terminal there.
   3. Arterial tree: branched transport (iteratively re-weighted shortest-path
      tree, marginal cost L*((F+1)^0.55 - F^0.55)) from the inlet stem, with
      radial-growth and turn penalties (no hairpins), a degree limit (every
      junction a bifurcation), terminals kept as leaves (connectors leave
      terminal vessels) and no branch heading back next to the root.
   4. Venous tree: the same on the dual graph from the outlet stem to one
      centroid beside every terminal (the AV connector), with artery-clearance,
      boundary and turn penalties and a preference for draining on in the
      connector's direction. A conflict round lets strong venous corridors push
      arterial branches aside. Veins that must reach terminals near the inlet
      wrap around the fan: the marginal vein.
   5. Radii by Murray's cube law from terminal counts (arterial trunk 700,
      venous <= 800, terminals ~220-240); connectors narrow to 112 mid-way.
   6. Relaxation of the embedding (typed-array phases): r^2 tension, Murray-angle
      steering, clearance repulsion mirroring the metric's adjacency exemption,
      junction spacing, soft terminal anchors, a gentle meander, Hermite-curved
      connectors, stem pins, and a planarity guard that reverts crossing moves.
   7. Output: Chaikin smoothing + resampling, a self-check mirroring the SPEC
      metrics, local repairs, one re-relaxation, and one deterministic retry:
      sparser terminals if a defect survives, denser ones if the largest tissue
      void exceeds 3.2 mm.
   ========================================================================== */
(function(){
'use strict';

const TAU = Math.PI*2;
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const smoothstep = u => u<=0?0:u>=1?1:u*u*(3-2*u);

// ------------------------------------------------------------------ Poisson disc (Bridson)
function poissonDisc(rng, x0,y0,x1,y1, d, fixed, fixR){
  const cs = d/Math.SQRT2, gw = Math.ceil((x1-x0)/cs)+1, gh = Math.ceil((y1-y0)/cs)+1;
  const grid = new Int32Array(gw*gh).fill(-1), pts = [], active = [];
  const d2 = d*d, fr2 = fixR*fixR;
  function ok(x,y){
    if(x<x0||x>x1||y<y0||y>y1) return false;
    const gx=Math.floor((x-x0)/cs), gy=Math.floor((y-y0)/cs);
    for(let j=Math.max(0,gy-2); j<=Math.min(gh-1,gy+2); j++) for(let i=Math.max(0,gx-2); i<=Math.min(gw-1,gx+2); i++){
      const k=grid[j*gw+i]; if(k>=0){ const p=pts[k], dx=p[0]-x, dy=p[1]-y; if(dx*dx+dy*dy<d2) return false; } }
    for(const f of fixed){ const dx=f[0]-x, dy=f[1]-y; if(dx*dx+dy*dy<fr2) return false; }
    return true;
  }
  function add(x,y){ const k=pts.length; pts.push([x,y]); active.push(k); grid[Math.floor((y-y0)/cs)*gw+Math.floor((x-x0)/cs)]=k; }
  for(let t=0;t<100 && !pts.length;t++){ const x=x0+rng()*(x1-x0), y=y0+rng()*(y1-y0); if(ok(x,y)) add(x,y); }
  while(active.length){
    const ai = Math.floor(rng()*active.length), p = pts[active[ai]];
    let found=false;
    for(let t=0;t<24;t++){ const a=rng()*TAU, rr=d*(1+rng()); const x=p[0]+Math.cos(a)*rr, y=p[1]+Math.sin(a)*rr; if(ok(x,y)){ add(x,y); found=true; break; } }
    if(!found){ active[ai]=active[active.length-1]; active.pop(); }
  }
  return pts;
}

// ------------------------------------------------------------------ Delaunay (Bowyer-Watson)
function delaunay(P){
  const n = P.length;
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
  for(const p of P){ if(p[0]<minx)minx=p[0]; if(p[0]>maxx)maxx=p[0]; if(p[1]<miny)miny=p[1]; if(p[1]>maxy)maxy=p[1]; }
  const X = new Float64Array(n+3), Y = new Float64Array(n+3);
  for(let i=0;i<n;i++){ X[i]=P[i][0]; Y[i]=P[i][1]; }
  const dm = Math.max(maxx-minx, maxy-miny)*40, mx=(minx+maxx)/2, my=(miny+maxy)/2;
  X[n]=mx-dm; Y[n]=my-dm; X[n+1]=mx+dm; Y[n+1]=my-dm; X[n+2]=mx; Y[n+2]=my+dm;
  function mk(a,b,c){
    const ax=X[a],ay=Y[a],bx=X[b]-ax,by=Y[b]-ay,cx=X[c]-ax,cy=Y[c]-ay;
    const dd = 2*(bx*cy-by*cx);
    const b2=bx*bx+by*by, c2=cx*cx+cy*cy;
    const ux=(cy*b2-by*c2)/dd, uy=(bx*c2-cx*b2)/dd;
    return {a,b,c,x:ux+ax,y:uy+ay,r2:ux*ux+uy*uy};
  }
  let T = [mk(n,n+1,n+2)];
  const M = n+3;
  for(let i=0;i<n;i++){
    const x=X[i], y=Y[i];
    const keep=[], em=new Map();
    for(const t of T){
      const dx=x-t.x, dy=y-t.y;
      if(dx*dx+dy*dy < t.r2*(1-1e-12)){
        for(const [u,v] of [[t.a,t.b],[t.b,t.c],[t.c,t.a]]){ const k = u<v ? u*M+v : v*M+u; if(em.has(k)) em.set(k,null); else em.set(k,[u,v]); }
      } else keep.push(t);
    }
    for(const e of em.values()) if(e) keep.push(mk(e[0],e[1],i));
    T = keep;
  }
  return T.filter(t=>t.a<n&&t.b<n&&t.c<n).map(t=>[t.a,t.b,t.c]);
}

// ------------------------------------------------------------------ geometry helpers
function segCross(ax,ay,bx,by,cx,cy,dx,dy){
  const o1=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax), o2=(bx-ax)*(dy-ay)-(by-ay)*(dx-ax);
  const o3=(dx-cx)*(ay-cy)-(dy-cy)*(ax-cx), o4=(dx-cx)*(by-cy)-(dy-cy)*(bx-cx);
  return o1*o2<0 && o3*o4<0;
}
function ptSeg(px,py,ax,ay,bx,by){
  const vx=bx-ax, vy=by-ay, L2=vx*vx+vy*vy; let t = L2>0 ? ((px-ax)*vx+(py-ay)*vy)/L2 : 0; t=t<0?0:t>1?1:t;
  const dx=px-ax-vx*t, dy=py-ay-vy*t; return Math.sqrt(dx*dx+dy*dy);
}
function segSeg(ax,ay,bx,by,cx,cy,dx,dy){
  if(segCross(ax,ay,bx,by,cx,cy,dx,dy)) return 0;
  return Math.min(ptSeg(ax,ay,cx,cy,dx,dy), ptSeg(bx,by,cx,cy,dx,dy), ptSeg(cx,cy,ax,ay,bx,by), ptSeg(dx,dy,ax,ay,bx,by));
}

// ------------------------------------------------------------------ Dijkstra (binary heap)
// relay[v]: cost multiplier for leaving v (terminals are passed through only when nothing else reaches on).
// turn {X, Y, k, cmin}: the cost of leaving u is scaled by 1 + k*(1 - cos) of the angle between the two-step
// chords (grandparent -> u) and (parent -> w), and turns with cos < cmin (hairpins) are not allowed;
// two-step chords ignore the inherent zig-zag of mesh paths.
// turn.AX/AY (optional): a preferred direction of leaving w toward the root (a connector's direction), weight ka.
function dijkstra(nV, adj, EU, EV, cost, root, pen0, pen1, relay, turn){
  const dist = new Float64Array(nV).fill(Infinity), pe = new Int32Array(nV).fill(-1);
  let cap = 4*nV+16, HV = new Int32Array(cap), HD = new Float64Array(cap), n = 0;   // binary heap, lazy deletion
  const push = (v, d) => {
    if(n===cap){ cap*=2; const a=new Int32Array(cap), b=new Float64Array(cap); a.set(HV); b.set(HD); HV=a; HD=b; }
    let i=n++; while(i>0){ const q=(i-1)>>1; if(HD[q]<=d) break; HV[i]=HV[q]; HD[i]=HD[q]; i=q; } HV[i]=v; HD[i]=d; };
  const other = (e, v) => EU[e]===v ? EV[e] : EU[e];
  dist[root]=0; push(root,0);
  while(n){
    const u=HV[0], d=HD[0]; n--;
    if(n){ const lv=HV[n], ld=HD[n]; let i=0; for(;;){ const l=2*i+1; if(l>=n) break; const m = l+1<n && HD[l+1]<HD[l] ? l+1 : l; if(HD[m]>=ld) break; HV[i]=HV[m]; HD[i]=HD[m]; i=m; } HV[i]=lv; HD[i]=ld; }
    if(d>dist[u]) continue;
    const ru = relay && u!==root ? relay[u] : 1;
    let p=-1, ix=0, iy=0, jx=0, jy=0;
    if(turn && pe[u]>=0){ p=other(pe[u],u); const q = pe[p]>=0 ? other(pe[p],p) : p; ix=turn.X[u]-turn.X[q]; iy=turn.Y[u]-turn.Y[q]; const il=Math.hypot(ix,iy); if(il>0){ ix/=il; iy/=il; } else p=-1;
      if(ru>1){ jx=turn.X[u]-turn.X[p]; jy=turn.Y[u]-turn.Y[p]; const jl=Math.hypot(jx,jy)||1; jx/=jl; jy/=jl; } }
    const au = adj[u];
    for(let z=0; z<au.length; z++){ const e=au[z]; let c=cost[e]*ru; if(!(c<Infinity)) continue; const fw = EU[e]===u, w = fw?EV[e]:EU[e]; if(pen0) c *= fw ? pen0[e] : pen1[e];
      if(ru>1 && p>=0){ const ox=turn.X[w]-turn.X[u], oy=turn.Y[w]-turn.Y[u]; if(jx*ox+jy*oy < 0.5*Math.hypot(ox,oy)) continue; } // relay straight on only
      if(p>=0){ const ox=turn.X[w]-turn.X[p], oy=turn.Y[w]-turn.Y[p], ol=Math.hypot(ox,oy); if(ol>0){ const co=(ix*ox+iy*oy)/ol; if(co<turn.cmin) continue; c *= 1 + turn.k*(1-co); } }
      if(turn && turn.AX && (turn.AX[w]!==0 || turn.AY[w]!==0)){ const ox=turn.X[u]-turn.X[w], oy=turn.Y[u]-turn.Y[w], ol=Math.hypot(ox,oy); if(ol>0) c *= 1 + turn.ka*(1-(turn.AX[w]*ox+turn.AY[w]*oy)/ol); }
      const nd=d+c; if(nd<dist[w]){ dist[w]=nd; pe[w]=e; push(w,nd); } }
  }
  return {dist, pe};
}
// radial-growth penalty: traversing an edge back toward the root costs more (no recurrent branches)
function radialPen(EU, EV, PX, PY, rx, ry, beta){
  const nE=EU.length, p0=new Float64Array(nE), p1=new Float64Array(nE);
  for(let e=0;e<nE;e++){ const ax=PX[EU[e]], ay=PY[EU[e]], bx=PX[EV[e]], by=PY[EV[e]];
    let dx=bx-ax, dy=by-ay; const dl=Math.hypot(dx,dy)||1; dx/=dl; dy/=dl;
    let mx=(ax+bx)/2-rx, my=(ay+by)/2-ry; const ml=Math.hypot(mx,my)||1; mx/=ml; my/=ml;
    const c = dx*mx+dy*my; p0[e] = 1 + beta*Math.max(0,-c); p1[e] = 1 + beta*Math.max(0,c); }
  return [p0, p1];
}
// Branched transport: an iteratively re-weighted shortest-path tree (cost ~ sum L * mult * Q^alpha, i.e. shared
// flow is cheap, so paths merge into a hierarchy). Returns the parent edge of every vertex and the flow Q.
// Degree limit: kids[v] = max children of v in the flow tree. Whenever a vertex has more, the child edge
// carrying the least flow is banned for good and the tree is re-solved, so that branch re-attaches
// through a sibling: every junction becomes a true bifurcation (no starbursts, no trifurcations).
// Terminals (leafSinks) are passed through only as a last resort and then by one branch, so AV connectors
// leave terminal vessels.
function branchedTree(nV, adj, EU, EV, len, multFn, root, sinks, alpha, iters, pen, kids, turn, leafSinks){
  const nE = EU.length, F = new Float64Array(nE), Fn = new Float64Array(nE), cost = new Float64Array(nE), ban = new Uint8Array(nE);
  const relay = new Float64Array(nV).fill(1), nch = new Int32Array(nV); kids = Int32Array.from(kids);
  if(leafSinks) for(const s of sinks){ relay[s]=8; kids[s]=1; }
  let res = null, bad = 0;
  for(let it=0; it<iters+60; it++){
    for(let e=0;e<nE;e++){ const m = ban[e] ? Infinity : multFn(e, F[e]); cost[e] = m===Infinity ? Infinity : len[e]*m*(Math.pow(F[e]+1,alpha)-Math.pow(F[e],alpha)); }
    res = dijkstra(nV, adj, EU, EV, cost, root, pen && pen[0], pen && pen[1], relay, turn);
    Fn.fill(0);
    for(const s of sinks){ if(!(res.dist[s]<Infinity)) continue; let v=s, guard=0; while(v!==root && guard++<nV){ const e=res.pe[v]; Fn[e]+=1; v = EU[e]===v?EV[e]:EU[e]; } }
    if(it===0) F.set(Fn); else for(let e=0;e<nE;e++) F[e]=0.5*F[e]+0.5*Fn[e];
    nch.fill(0); bad = 0;
    for(let v=0; v<nV; v++){ const e=res.pe[v]; if(e>=0 && Fn[e]>0) nch[EU[e]===v?EV[e]:EU[e]]++; }
    for(let v=0; v<nV; v++){ if(nch[v] <= kids[v]) continue;
      // candidate child edges by increasing flow; a ban that would cut a terminal off is not made
      const ch = []; for(const e of adj[v]){ const w = EU[e]===v?EV[e]:EU[e]; if(res.pe[w]===e && Fn[e]>0) ch.push(e); }
      ch.sort((a,b)=>Fn[a]-Fn[b]);
      let done=false;
      for(const e of ch){ ban[e]=1; if(reachAll()){ done=true; break; } ban[e]=0; }
      if(done) bad++; else kids[v]=nch[v];   // unavoidable here: accept it
    }
    if(it>=iters-1 && !bad) break;
  }
  function reachAll(){ // every terminal still reachable from the root over unbanned usable edges?
    const seen = new Uint8Array(nV), st=[root]; seen[root]=1;
    while(st.length){ const u=st.pop();
      for(const e of adj[u]){ if(ban[e] || cost[e]===Infinity) continue; const w = EU[e]===u?EV[e]:EU[e]; if(!seen[w]){ seen[w]=1; st.push(w); } } }
    for(const s of sinks) if(res.dist[s]<Infinity && !seen[s]) return false;
    return true;
  }
  return { pe: res.pe, dist: res.dist, Q: Fn, bad };   // Q: flow (terminal count) through each edge
}

// ------------------------------------------------------------------ polyline helpers
function arcLen(pts){ const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])); return cum; }
function resamplePoly(pts, nSeg){
  const cum = arcLen(pts), L = cum[cum.length-1], out=[[pts[0][0],pts[0][1]]];
  let j=0;
  for(let k=1;k<nSeg;k++){ const s=L*k/nSeg; while(j<pts.length-2 && cum[j+1]<s) j++; const seg=cum[j+1]-cum[j]; const t = seg>1e-9 ? (s-cum[j])/seg : 0; out.push([pts[j][0]+(pts[j+1][0]-pts[j][0])*t, pts[j][1]+(pts[j+1][1]-pts[j][1])*t]); }
  out.push([pts[pts.length-1][0], pts[pts.length-1][1]]);
  return out;
}
function chaikin(pts, iters){
  let P = pts;
  for(let k=0;k<iters;k++){
    if(P.length<3) return P;
    const Q=[P[0]]; const n=P.length;
    for(let i=0;i<n-1;i++){ const a=P[i], b=P[i+1];
      if(i>0) Q.push([0.75*a[0]+0.25*b[0], 0.75*a[1]+0.25*b[1]]);
      if(i<n-2) Q.push([0.25*a[0]+0.75*b[0], 0.25*a[1]+0.75*b[1]]);
    }
    Q.push(P[n-1]); P=Q;
  }
  return P;
}

function chainR(c, t){
  if(c.type!=='cap') return c.r0 + (c.r1-c.r0)*t;
  if(t<0.36) return c.rm + (c.r0-c.rm)*smoothstep(1-t/0.36);
  if(t>0.64) return c.rm + (c.r1-c.rm)*smoothstep((t-0.64)/0.36);
  return c.rm;
}

// ------------------------------------------------------------------ relaxation
// State lives in flat typed arrays: indices 0..N-1 are the nodes, then each chain's interior control
// points (base[c] .. base[c]+cnt[c]-1). Each phase is a small top-level function so the JIT optimises
// them independently (one huge function took >150 ms to OSR-compile and kept deoptimising).
function chainRst(st, c, t){
  const r0=st.CR0[c], r1=st.CR1[c];
  if(st.CT[c]!==2) return r0 + (r1-r0)*t;
  const rm=st.CRM[c];
  if(t<0.36) return rm + (r0-rm)*smoothstep(1-t/0.36);
  if(t>0.64) return rm + (r1-rm)*smoothstep((t-0.64)/0.36);
  return rm;
}
function rxAlloc(st, K){
  if(K <= st.cap) return;
  const cap = Math.ceil(K*1.6)+64, old = st.cap;
  const grow = (a, T) => { const b = new T(cap); if(a && a.length) b.set(a.subarray(0, Math.min(old, cap, a.length))); return b; };
  st.X=grow(st.X,Float64Array); st.Y=grow(st.Y,Float64Array);
  st.R=new Float64Array(cap); st.S=new Float64Array(cap); st.TX=new Float64Array(cap); st.TY=new Float64Array(cap);
  st.DX=new Float64Array(cap); st.DY=new Float64Array(cap); st.CH=new Int32Array(cap); st.CELL=new Int32Array(cap); st.ORD=new Int32Array(cap);
  st.BX=new Float64Array(cap); st.BY=new Float64Array(cap);
  st.cap = cap;
}
const OPT_KEYS = ['angLateFade','sc','scCoarse','coarseIters','iters','kRep','margin0','margin1','marginF','exf','lam','lam2','curvSafety','mu','ka','kAng','stemDepth','capLen','capMax','capBend','maxStep','bmargin','bsoft','lateMin'];
function normOpt(o){ const r={}; for(const k of OPT_KEYS) r[k] = 0.5; for(const k of OPT_KEYS) r[k] = +(o[k]||0); return r; } // one hidden class (double fields) for every call
function relaxInit(nodes, chains, W, H, opt0){
  const N=nodes.length, C=chains.length, opt=normOpt(opt0), F0=()=>new Float64Array(0), I0=()=>new Int32Array(0);
  const CS=620, gw=Math.ceil(W/CS)+1, gh=Math.ceil(H/CS)+1;
  const st = { N, C, W, H, opt, it:0, late:0.5, cap:0, K:N,
    X:F0(), Y:F0(), R:F0(), S:F0(), TX:F0(), TY:F0(), DX:F0(), DY:F0(), CH:I0(), CELL:I0(), ORD:I0(), BX:F0(), BY:F0(),
    NFIX:new Uint8Array(N), NAX:new Float64Array(N), NAY:new Float64Array(N), NAW:new Float64Array(N), PINX:new Float64Array(N), PINY:new Float64Array(N), PINL:new Float64Array(N),
    CA:new Int32Array(C), CB:new Int32Array(C), CT:new Uint8Array(C), CR0:new Float64Array(C), CR1:new Float64Array(C), CRM:new Float64Array(C),
    CMK:new Float64Array(C), CMLAM:new Float64Array(C), CMPH:new Float64Array(C), CA2:new Uint8Array(C), CB2:new Uint8Array(C),
    base:new Int32Array(C), cnt:new Int32Array(C), Lc:new Float64Array(C), nodeR:new Float64Array(N),
    incS:new Int32Array(N+1), incL:new Int32Array(2*C), J:I0(), link:new Map(),
    BN:I0(), BP:I0(), B1:I0(), B2:I0(), T1:F0(), T2:F0(), MN:I0(), MP:I0(), STEMN:new Int32Array(N).fill(-1), stemDepth:0.5,
    scF:opt.sc, scC:opt.scCoarse||opt.sc, nCoarse:opt.coarseIters, sc:0.5,
    CS, gw, gh, cstart:new Int32Array(gw*gh+1), GRM:new Float64Array(gw*gh), PL:new Int32Array(1<<15), NPL:0, TMPX:new Float64Array(4096), TMPY:new Float64Array(4096), TMPC:new Float64Array(4096),
    OX:F0(), OY:F0(), GA:new Int32Array(64), GB:new Int32Array(64), EXC:new Int8Array(0), CAPA:I0(), CAPV:I0() };
  st.stemDepth = opt.stemDepth; st.late = 0;
  st.sc = st.nCoarse>0 ? st.scC : st.scF;
  for(let n=0;n<N;n++){ const nd=nodes[n]; st.NFIX[n]=nd.fixed?1:0; st.NAX[n]=nd.ax!==undefined?nd.ax:NaN; st.NAY[n]=nd.ay!==undefined?nd.ay:NaN; st.NAW[n]=nd.aw||0;
    if(nd.pin){ st.PINX[n]=nd.pin[0]; st.PINY[n]=nd.pin[1]; st.PINL[n]=nd.pinLen; } }
  const deg = new Int32Array(N);
  for(let c=0;c<C;c++){ const ch=chains[c]; st.CA[c]=ch.a; st.CB[c]=ch.b; st.CT[c]= ch.type==='art'?0: ch.type==='ven'?1:2;
    st.CR0[c]=ch.r0; st.CR1[c]=ch.r1; st.CRM[c]=ch.rm||0; st.CMK[c]=ch.mk||0; st.CMLAM[c]=ch.mlam||1; st.CMPH[c]=ch.mph||0; deg[ch.a]++; deg[ch.b]++; }
  for(let n=0;n<N;n++) st.incS[n+1]=st.incS[n]+deg[n];
  { const f=st.incS.slice(0,N); for(let c=0;c<C;c++){ st.incL[f[st.CA[c]]++]=c; st.incL[f[st.CB[c]]++]=c; } }
  for(let c=0;c<C;c++){ const ra=st.CR0[c], rb=st.CR1[c]; if(ra>st.nodeR[st.CA[c]]) st.nodeR[st.CA[c]]=ra; if(rb>st.nodeR[st.CB[c]]) st.nodeR[st.CB[c]]=rb;
    st.CA2[c] = deg[st.CA[c]]===2?1:0; st.CB2[c] = deg[st.CB[c]]===2?1:0;
    for(const k of [st.CA[c]*65536+st.CB[c], st.CB[c]*65536+st.CA[c]]){ let a=st.link.get(k); if(!a){ a=[]; st.link.set(k,a); } a.push(c); } }
  const J=[]; for(let n=0;n<N;n++) if(deg[n]>=3) J.push(n); st.J = Int32Array.from(J);
  // each connector's arterial feeder (the vessel ending at its tip) and venous drain (the vessel leaving its end)
  st.CAPA = new Int32Array(C).fill(-1); st.CAPV = new Int32Array(C).fill(-1);
  for(let c=0;c<C;c++){ if(st.CT[c]!==2) continue; const a=st.CA[c], b=st.CB[c];
    for(let p=st.incS[a]; p<st.incS[a+1]; p++){ const d=st.incL[p]; if(st.CT[d]===0 && st.CB[d]===a) st.CAPA[c]=d; }
    for(let p=st.incS[b]; p<st.incS[b+1]; p++){ const d=st.incL[p]; if(st.CT[d]===1 && st.CA[d]===b) st.CAPV[c]=d; } }
  // the first node inside an inlet/outlet stem keeps a minimum depth (no branching right at the map edge)
  for(let c=0;c<C;c++){ const a=st.CA[c], b=st.CB[c]; if(st.PINL[a]>0 && st.PINL[b]===0) st.STEMN[b]=a; if(st.PINL[b]>0 && st.PINL[a]===0) st.STEMN[a]=b; }

  // bifurcations: parent = thickest chain at the node; Murray-optimal child deflections
  // cos(th1) = (r0^4 + r1^4 - r2^4) / (2 r0^2 r1^2)
  const BN=[], BP=[], B1=[], B2=[], T1=[], T2=[];
  for(const n of J){ if(deg[n]!==3) continue; const cs=[]; for(let p=st.incS[n]; p<st.incS[n+1]; p++){ const c=st.incL[p]; cs.push([c, st.CA[c]===n?st.CR0[c]:st.CR1[c]]); }
    cs.sort((a,b)=>b[1]-a[1]); const r0=cs[0][1], r1=cs[1][1], r2=cs[2][1];
    const th = (ra,rb) => Math.acos(Math.max(-1, Math.min(1, (r0**4 + ra**4 - rb**4)/(2*r0*r0*ra*ra))));
    BN.push(n); BP.push(cs[0][0]); B1.push(cs[1][0]); B2.push(cs[2][0]); T1.push(Math.max(0.28, th(r1,r2))); T2.push(Math.max(0.28, th(r2,r1))); }
  st.BN=Int32Array.from(BN); st.BP=Int32Array.from(BP); st.B1=Int32Array.from(B1); st.B2=Int32Array.from(B2); st.T1=Float64Array.from(T1); st.T2=Float64Array.from(T2);
  // multi-way junctions (degree >= 4): parent = thickest, children are only kept from turning backwards
  const MN=[], MP=[];
  for(const n of J){ if(deg[n]<4) continue; let best=-1, br=-1; for(let p=st.incS[n]; p<st.incS[n+1]; p++){ const c=st.incL[p], r=st.CA[c]===n?st.CR0[c]:st.CR1[c]; if(r>br){ br=r; best=c; } } MN.push(n); MP.push(best); }
  st.MN=Int32Array.from(MN); st.MP=Int32Array.from(MP);
  // initial control points: keep every given polyline vertex (no corner cutting -> stays planar) and
  // subdivide long segments to the current spacing
  const polys = chains.map(ch=>{ const p=ch.pts.map(q=>[q[0],q[1]]); p[0]=[nodes[ch.a].x,nodes[ch.a].y]; p[p.length-1]=[nodes[ch.b].x,nodes[ch.b].y];
    const out=[p[0]]; for(let q=1;q<p.length;q++){ const L=Math.hypot(p[q][0]-p[q-1][0], p[q][1]-p[q-1][1]), n=Math.max(1, Math.round(L/st.sc));
      for(let k=1;k<=n;k++) out.push([p[q-1][0]+(p[q][0]-p[q-1][0])*k/n, p[q-1][1]+(p[q][1]-p[q-1][1])*k/n]); }
    if(out.length<3) out.splice(1,0,[(out[0][0]+out[1][0])/2,(out[0][1]+out[1][1])/2]);
    return out; });
  let K=N; for(const p of polys) K += p.length-2;
  rxAlloc(st, K);
  for(let n=0;n<N;n++){ st.X[n]=nodes[n].x; st.Y[n]=nodes[n].y; }
  K=N;
  for(let c=0;c<C;c++){ const r=polys[c]; st.base[c]=K; st.cnt[c]=r.length-2; for(let q=1;q<r.length-1;q++){ st.X[K]=r[q][0]; st.Y[K]=r[q][1]; K++; } }
  st.K=K;
  return st;
}
function rxArcs(st){
  const {N, C, X, Y, R, S, TX, TY, CH, CA, CB, base, cnt, Lc, nodeR} = st;
  for(let n=0;n<N;n++){ R[n]=nodeR[n]; S[n]=0; CH[n]=-1; TX[n]=0; TY[n]=0; }
  for(let c=0;c<C;c++){ const b=base[c], m=cnt[c], a=CA[c], e=CB[c];
    let px=X[a], py=Y[a], s=0;
    for(let q=0;q<m;q++){ const k=b+q; s+=Math.hypot(X[k]-px, Y[k]-py); S[k]=s; CH[k]=c; px=X[k]; py=Y[k]; }
    s+=Math.hypot(X[e]-px, Y[e]-py); Lc[c]=s;
    const isCap = st.CT[c]===2, dt = 0.5*st.sc/s;
    for(let q=0;q<m;q++){ const k=b+q, t=S[k]/s; R[k]=chainRst(st, c, t);
      if(isCap){ const r1=chainRst(st, c, Math.max(0,t-dt)), r2=chainRst(st, c, Math.min(1,t+dt)); if(r1>R[k]) R[k]=r1; if(r2>R[k]) R[k]=r2; }
      const pk = q===0 ? a : k-1, nk = q===m-1 ? e : k+1;
      const tx=X[nk]-X[pk], ty=Y[nk]-Y[pk], tl=Math.hypot(tx,ty)+1e-9; TX[k]=tx/tl; TY[k]=ty/tl; }
  }
}
function rxGrid(st){
  const {K, X, Y, R, CELL, ORD, cstart, GRM, CS, gw, gh} = st;
  cstart.fill(0); GRM.fill(0);
  for(let k=0;k<K;k++){ let gx=Math.floor(X[k]/CS), gy=Math.floor(Y[k]/CS); gx=gx<0?0:gx>=gw?gw-1:gx; gy=gy<0?0:gy>=gh?gh-1:gy; const c=gy*gw+gx; CELL[k]=c; cstart[c+1]++; if(R[k]>GRM[c]) GRM[c]=R[k]; }
  for(let c=0;c<gw*gh;c++) cstart[c+1]+=cstart[c];
  const fill = cstart.slice(0, gw*gh); for(let k=0;k<K;k++) ORD[fill[CELL[k]]++]=k;
}
const FWD = [1,0, 2,0, -2,1,-1,1,0,1,1,1,2,1, -2,2,-1,2,0,2,1,2,2,2];
const RSMALL = 300, SKIN = 160;
function rxPush(st, i, j){ if(st.NPL+2>st.PL.length){ const t=new Int32Array(st.PL.length*2); t.set(st.PL); st.PL=t; } st.PL[st.NPL++]=i; st.PL[st.NPL++]=j; }
function rxCollect(st){
  const {K, X, Y, R, ORD, cstart, GRM, CS, gw, gh, opt} = st;
  const late=st.late, m0 = opt.margin0 + (opt.margin1-opt.margin0)*late, mf = opt.marginF, hs = 0.55*st.sc;
  st.NPL = 0;
  const near = (i,j) => { const dx=X[j]-X[i], dy=Y[j]-Y[i], ri=R[i], rj=R[j], rr=ri+rj;
    const Ds = rr + (ri<rj ? (ri>250?0.6*ri:150) : (rj>250?0.6*rj:150)) + m0 + mf*rr + hs + SKIN; return dx*dx+dy*dy < Ds*Ds; };
  // small-small pairs: forward sweep over cells (2 cells >= max small reach)
  for(let cy=0; cy<gh; cy++) for(let cx=0; cx<gw; cx++){
    const c0=cy*gw+cx, s0=cstart[c0], e0=cstart[c0+1]; if(s0===e0) continue;
    for(let p=s0;p<e0;p++){ const i=ORD[p]; if(R[i]>RSMALL) continue; for(let q=p+1;q<e0;q++){ const j=ORD[q]; if(R[j]<=RSMALL && near(i,j)) rxPush(st,i,j); } }
    for(let f=0; f<12; f++){ const nx=cx+FWD[2*f], ny=cy+FWD[2*f+1]; if(nx<0||nx>=gw||ny>=gh) continue;
      const c1=ny*gw+nx, s1=cstart[c1], e1=cstart[c1+1]; if(s1===e1) continue;
      for(let p=s0;p<e0;p++){ const i=ORD[p]; if(R[i]>RSMALL) continue; for(let q=s1;q<e1;q++){ const j=ORD[q]; if(R[j]<=RSMALL && near(i,j)) rxPush(st,i,j); } } }
  }
  // pairs with at least one big point: scan that point's reach, pruning cells by their max radius
  let Rmax=0; for(let k=0;k<K;k++) if(R[k]>Rmax) Rmax=R[k];
  for(let i=0;i<K;i++){ const ri=R[i]; if(ri<=RSMALL) continue;
    const reach = ri+Rmax+0.6*Math.min(ri,Rmax)+m0+mf*(ri+Rmax)+hs+SKIN, nc=Math.ceil(reach/CS);
    const gx=Math.min(gw-1,Math.max(0,Math.floor(X[i]/CS))), gy=Math.min(gh-1,Math.max(0,Math.floor(Y[i]/CS)));
    const y0=Math.max(0,gy-nc), y1=Math.min(gh-1,gy+nc), x0=Math.max(0,gx-nc), x1=Math.min(gw-1,gx+nc);
    const xi=X[i], yi=Y[i];
    for(let yy=y0; yy<=y1; yy++){ const dy = yi<yy*CS ? yy*CS-yi : yi>(yy+1)*CS ? yi-(yy+1)*CS : 0;
      for(let xx=x0; xx<=x1; xx++){ const cc=yy*gw+xx; if(cstart[cc]===cstart[cc+1]) continue;
        const dx = xi<xx*CS ? xx*CS-xi : xi>(xx+1)*CS ? xi-(xx+1)*CS : 0, cr=GRM[cc];
        const lim = ri+cr+0.6*(ri<cr?ri:cr)+m0+mf*(ri+cr)+hs+SKIN; if(dx*dx+dy*dy > lim*lim) continue;
        for(let q=cstart[cc]; q<cstart[cc+1]; q++){ const j=ORD[q]; if(j===i || (R[j]>RSMALL && j<i)) continue; if(near(i,j)) rxPush(st,i,j); } } }
  }
}
// exemption mirrors metrics.js nearAdjacent(): 1-hop via a shared node, 2-hop via one connecting chain.
// A point carries two (node, arc-distance) anchors; a node point stands for the end of every incident
// chain and is exempt only if it is exempt for all of them. Result: 0 = not exempt, 1 = hard (both
// points in the junction core), 2 = soft (exempt from the tissue gap, but still kept from crossing).
function ex1(st, na, da, nb, db){
  const nodeR=st.nodeR, EXF=st.opt.exf;
  if(na===nb){ const E=3*nodeR[na]*EXF; if(!(da<E && db<E)) return 0; const core=1.3*nodeR[na]+150; return (da<core && db<core) ? 1 : 2; }
  const l = st.link.get(na*65536+nb); if(!l) return 0;
  const E=3*(nodeR[na]>nodeR[nb]?nodeR[na]:nodeR[nb])*EXF;
  for(let k=0;k<l.length;k++) if(da+st.Lc[l[k]]+db < 2*E) return 2;
  return 0;
}
function pairEx(st, a0,d0,a1,d1, b0,e0,b1,e1){
  const r1=ex1(st,a0,d0,b0,e0); if(r1===1) return 1; const r2=ex1(st,a0,d0,b1,e1); if(r2===1) return 1;
  const r3=ex1(st,a1,d1,b0,e0); if(r3===1) return 1; const r4=ex1(st,a1,d1,b1,e1); if(r4===1) return 1;
  return (r1|r2|r3|r4) ? 2 : 0;
}
function exempt(st, i, j){
  const N=st.N, incS=st.incS, incL=st.incL, CA=st.CA, CB=st.CB, Lc=st.Lc;
  let res=1;
  if(i<N && j<N){
    for(let p=incS[i]; p<incS[i+1]; p++){ const ci=incL[p], oi=CA[ci]===i?CB[ci]:CA[ci];
      for(let q=incS[j]; q<incS[j+1]; q++){ const cj=incL[q], oj=CA[cj]===j?CB[cj]:CA[cj];
        const r=pairEx(st, i,0,oi,Lc[ci], j,0,oj,Lc[cj]); if(!r) return 0; if(r===2) res=2; } }
    return res;
  }
  if(i<N){ const t=i; i=j; j=t; }
  const c=st.CH[i], s=st.S[i], L=Lc[c];
  if(j<N){
    for(let q=incS[j]; q<incS[j+1]; q++){ const cj=incL[q], oj=CA[cj]===j?CB[cj]:CA[cj];
      const r=pairEx(st, CA[c],s,CB[c],L-s, j,0,oj,Lc[cj]); if(!r) return 0; if(r===2) res=2; }
    return res;
  }
  const e=st.CH[j], t=st.S[j];
  return pairEx(st, CA[c],s,CB[c],L-s, CA[e],t,CB[e],Lc[e]-t);
}
function rxRepel(st){
  const {N, X, Y, R, S, TX, TY, CH, DX, DY, PL, opt} = st, NPL=st.NPL, late=st.late;
  const kRep = opt.kRep*(1+0.6*late), m0 = opt.margin0 + (opt.margin1-opt.margin0)*late, mf = opt.marginF, hs = 0.55*st.sc;
  for(let k=0;k<NPL;k+=2){ const i=PL[k], j=PL[k+1];
    const dx=X[j]-X[i], dy=Y[j]-Y[i], ri=R[i], rj=R[j], rr=ri+rj;
    const Dq = rr + (ri<rj ? (ri>250?0.6*ri:150) : (rj>250?0.6*rj:150)) + m0 + mf*rr;
    const d2=dx*dx+dy*dy, Dp=Dq+hs; if(d2>=Dp*Dp) continue;
    const ci=CH[i]; if(ci>=0 && ci===CH[j] && Math.abs(S[i]-S[j]) < 4.3*(ri>rj?ri:rj)) continue;
    // tangent-aware distance: point vs the local chord through the other point
    let d=Math.sqrt(d2)+1e-6, ux=dx/d, uy=dy/d;
    let t=TX[j], u=TY[j];
    if(t!==0 || u!==0){ const al=-(dx*t+dy*u); if(al<hs && al>-hs){ const px=dx+al*t, py=dy+al*u, pd=Math.hypot(px,py)+1e-6; if(pd<d){ d=pd; ux=px/pd; uy=py/pd; } } }
    t=TX[i]; u=TY[i];
    if(t!==0 || u!==0){ const al=dx*t+dy*u; if(al<hs && al>-hs){ const px=dx-al*t, py=dy-al*u, pd=Math.hypot(px,py)+1e-6; if(pd<d){ d=pd; ux=px/pd; uy=py/pd; } } }
    if(d>=Dq) continue;
    let ex = st.EXC[k>>1]; if(ex<0){ ex = exempt(st,i,j); st.EXC[k>>1] = ex; } let o;
    if(ex===0) o=(Dq-d)*kRep*0.5;
    else if(ex===2){ const Ds=0.62*rr+60; if(d>=Ds) continue; o=(Ds-d)*kRep*0.6; }
    else continue;
    const wi = i<N ? 0.5 : 1, wj = j<N ? 0.5 : 1;
    DX[i]-=ux*o*wi; DY[i]-=uy*o*wi; DX[j]+=ux*o*wj; DY[j]+=uy*o*wj;
  }
}
function rxSpread(st){ // spread the repulsion push along each chain (a vessel bends gently instead of kinking)
  const {C, DX, DY, base, cnt} = st;
  for(let c=0;c<C;c++){ const m=cnt[c]; if(m<3) continue; const b=base[c];
    let px=DX[b], py=DY[b];
    for(let q=0;q<m;q++){ const k=b+q, cx=DX[k], cy=DY[k], nx=q<m-1?DX[k+1]:cx, ny=q<m-1?DY[k+1]:cy;
      DX[k]=0.5*cx+0.25*(px+nx); DY[k]=0.5*cy+0.25*(py+ny); px=cx; py=cy; } }
}
function rxSmooth(st){ // Laplacian + curvature limiter + prescribed gentle meander
  const {C, X, Y, R, S, DX, DY, CA, CB, CA2, CB2, CR0, CR1, CMK, CMLAM, CMPH, base, cnt, Lc, opt} = st;
  const lam=opt.lam, lam2=opt.lam2, cs0=opt.curvSafety;
  for(let c=0;c<C;c++){ if(st.CT[c]===2 && st.CAPA[c]>=0) continue; // connectors are shaped by rxCapShape
    const m=cnt[c], b=base[c], L=Lc[c], r0=CR0[c], r1=CR1[c], mk=CMK[c];
    const e0=1.5*r0+300, e1=1.5*r1+300;
    for(let q=0;q<m;q++){ const k=b+q, pk = q===0 ? CA[c] : k-1, nk = q===m-1 ? CB[c] : k+1;
      const px=X[pk], py=Y[pk], nx=X[nk], ny=Y[nk];
      let l = lam;
      const ax=X[k]-px, ay=Y[k]-py, bx=nx-X[k], by=ny-Y[k], la=Math.hypot(ax,ay), lb=Math.hypot(bx,by);
      if(la>1e-6 && lb>1e-6 && (S[k]>1.5*r0 || CA2[c]) && (L-S[k]>1.5*r1 || CB2[c])){
        const co=(ax*bx+ay*by)/(la*lb), phi=Math.acos(co<-1?-1:co>1?1:co);
        const phiMax = 0.5*(la+lb)/(1.5*R[k]*cs0);
        if(phi>phiMax) l += lam2*Math.min(1, phi/phiMax-1);
      }
      let ox=0, oy=0;
      if(mk!==0){ const s=S[k];
        const w = smoothstep((s-e0*0.6)/(e0*0.8)) * smoothstep((L-s-e1*0.6)/(e1*0.8));
        if(w>0){ const kap = mk*w*Math.sin(TAU*s/CMLAM[c] + CMPH[c]); const tx=nx-px, ty=ny-py, tl=Math.hypot(tx,ty)+1e-9; const off=kap*la*lb/2; ox=-ty/tl*off; oy=tx/tl*off; } }
      DX[k]+=l*((px+nx)/2+ox-X[k]); DY[k]+=l*((py+ny)/2+oy-Y[k]);
    }
  }
}
// AV connectors: pull toward a cubic Hermite curve that leaves the arterial tip along its tangent and enters
// the vein turned toward the vein's own flow (curved, tangent-continuous connectors instead of straight sticks)
function rxCapShape(st){
  const {C, X, Y, S, DX, DY, CA, CB, CT, CAPA, CAPV, base, cnt, Lc, opt} = st, kb=opt.capBend;
  for(let c=0;c<C;c++){ if(CT[c]!==2 || CAPA[c]<0) continue;
    const a=CA[c], b=CB[c], L=Lc[c], m=cnt[c];
    const pa = rxAngPt(st, a, CAPA[c], 2); let tax=X[a]-X[pa], tay=Y[a]-Y[pa]; const tal=Math.hypot(tax,tay)||1; tax/=tal; tay/=tal;
    let cx=X[b]-X[a], cy=Y[b]-Y[a]; const cl=Math.hypot(cx,cy)||1; cx/=cl; cy/=cl;
    let tbx=cx, tby=cy;
    if(CAPV[c]>=0){ const pb = rxAngPt(st, b, CAPV[c], 2); let vx=X[pb]-X[b], vy=Y[pb]-Y[b]; const vl=Math.hypot(vx,vy)||1; tbx=cx+vx/vl; tby=cy+vy/vl; const tl=Math.hypot(tbx,tby)||1; tbx/=tl; tby/=tl; }
    const m0=0.55*L, m1=0.55*L;
    for(let q=0;q<m;q++){ const k=base[c]+q, u=S[k]/L, u2=u*u, u3=u2*u;
      const h00=2*u3-3*u2+1, h10=u3-2*u2+u, h01=-2*u3+3*u2, h11=u3-u2;
      const hx=h00*X[a]+h10*m0*tax+h01*X[b]+h11*m1*tbx, hy=h00*Y[a]+h10*m0*tay+h01*Y[b]+h11*m1*tby;
      DX[k]+=kb*(hx-X[k]); DY[k]+=kb*(hy-Y[k]); }
  }
}
function rxPt(st, c, q){ // index of polyline point q (0..cnt+1) of chain c
  const m=st.cnt[c]; return q<=0 ? st.CA[c] : q>=m+1 ? st.CB[c] : st.base[c]+q-1;
}
function rxNodes(st){ // node tension (Murray: tension ~ r^2), anchors, smooth pass-through joints
  const {N, X, Y, DX, DY, NFIX, NAX, NAY, incS, incL, CA, CR0, CR1, cnt, nodeR, opt} = st, late=st.late, sc=st.sc;
  const mu = opt.mu*(1-0.8*late), ka = opt.ka*(1-0.5*late);
  for(let n=0;n<N;n++){ if(NFIX[n]) continue;
    let fx=0, fy=0, ts=0; const x=X[n], y=Y[n];
    const off = 1+Math.ceil(1.2*nodeR[n]/sc);
    for(let p=incS[n]; p<incS[n+1]; p++){ const c=incL[p], m=cnt[c]+2, fromA = CA[c]===n;
      const r = fromA?CR0[c]:CR1[c], T=r*r, o=Math.min(m-1, off), k = rxPt(st, c, fromA ? o : m-1-o);
      const dx=X[k]-x, dy=Y[k]-y, dl=Math.hypot(dx,dy)+1e-6; fx+=T*dx/dl; fy+=T*dy/dl; ts+=T; }
    if(ts>0){ DX[n]+=mu*fx/ts; DY[n]+=mu*fy/ts; }
    if(NAX[n]===NAX[n]){ const k=ka*st.NAW[n]; DX[n]+=k*(NAX[n]-x); DY[n]+=k*(NAY[n]-y); }
    if(incS[n+1]-incS[n]===2){
      let mx=0, my=0; for(let p=incS[n]; p<incS[n+1]; p++){ const c=incL[p], m=cnt[c]+2, k=rxPt(st, c, CA[c]===n ? 1 : m-2); mx+=X[k]/2; my+=Y[k]/2; }
      DX[n]+=opt.lam*(mx-x); DY[n]+=opt.lam*(my-y);
    }
  }
}
function rxAngPt(st, n, c, q){ return rxPt(st, c, st.CA[c]===n ? q : st.cnt[c]+1-q); }
function rxRotate(st, n, c, Q, d, k0){
  const X=st.X, Y=st.Y, DX=st.DX, DY=st.DY, x=X[n], y=Y[n], Qc=Math.min(Q, st.cnt[c]);
  for(let q=1;q<=Qc;q++){ const k=rxAngPt(st,n,c,q), rot = k0*d*(q<Qc ? 1 : 0.5), co=Math.cos(rot), si=Math.sin(rot);
    const rx=X[k]-x, ry=Y[k]-y; DX[k]+= (co*rx - si*ry) - rx; DY[k]+= (si*rx + co*ry) - ry; }
}
function rxAngles(st){ // steer children toward Murray-optimal bifurcation angles (rotate their first stretch about the node)
  const {X, Y, BN, BP, B1, B2, T1, T2, cnt, nodeR, opt} = st, sc=st.sc, k0 = opt.kAng*(1-st.opt.angLateFade*st.late);
  if(!(k0>0)) return;
  for(let b=0;b<BN.length;b++){ const n=BN[b], x=X[n], y=Y[n], Q = 1+Math.ceil(1.5*nodeR[n]/sc);
    const pp = rxAngPt(st, n, BP[b], Math.min(Q, cnt[BP[b]]+1));
    let ux=x-X[pp], uy=y-Y[pp]; const ul=Math.hypot(ux,uy); if(ul<1e-6) continue; ux/=ul; uy/=ul;
    const c1=B1[b], c2=B2[b], p1=rxAngPt(st, n, c1, Math.min(Q, cnt[c1]+1)), p2=rxAngPt(st, n, c2, Math.min(Q, cnt[c2]+1));
    const a1=Math.atan2(ux*(Y[p1]-y)-uy*(X[p1]-x), ux*(X[p1]-x)+uy*(Y[p1]-y));
    const a2=Math.atan2(ux*(Y[p2]-y)-uy*(X[p2]-x), ux*(X[p2]-x)+uy*(Y[p2]-y));
    let s1 = a1>=0?1:-1, s2 = a2>=0?1:-1;
    if(s1===s2){ if(Math.abs(a1)>Math.abs(a2)) s2=-s1; else s1=-s2; }
    rxRotate(st, n, c1, Q, s1*T1[b]-a1, k0);
    rxRotate(st, n, c2, Q, s2*T2[b]-a2, k0);
  }
  const MN=st.MN, MP=st.MP, AMAX=1.4;
  for(let b=0;b<MN.length;b++){ const n=MN[b], x=X[n], y=Y[n], Q = 1+Math.ceil(1.5*nodeR[n]/sc);
    const pp = rxAngPt(st, n, MP[b], Math.min(Q, cnt[MP[b]]+1));
    let ux=x-X[pp], uy=y-Y[pp]; const ul=Math.hypot(ux,uy); if(ul<1e-6) continue; ux/=ul; uy/=ul;
    for(let p=st.incS[n]; p<st.incS[n+1]; p++){ const c=st.incL[p]; if(c===MP[b]) continue;
      const pc=rxAngPt(st, n, c, Math.min(Q, cnt[c]+1)), a=Math.atan2(ux*(Y[pc]-y)-uy*(X[pc]-x), ux*(X[pc]-x)+uy*(Y[pc]-y));
      if(Math.abs(a)>AMAX) rxRotate(st, n, c, Q, (a>0?AMAX:-AMAX)-a, k0); }
  }
}
function rxCaps(st){ // AV connectors keep their length within [capLen, capMax] (uniform, visible chokepoints)
  const {C, X, Y, DX, DY, CA, CB, CT, Lc, opt} = st, capLen=opt.capLen, capMax=opt.capMax;
  for(let c=0;c<C;c++){ if(CT[c]!==2 || (Lc[c]>=capLen && Lc[c]<=capMax)) continue;
    const a=CA[c], b=CB[c], dx=X[b]-X[a], dy=Y[b]-Y[a], dl=Math.hypot(dx,dy)+1e-6, o=((Lc[c]<capLen ? capLen : capMax)-Lc[c])*0.2/dl;
    DX[a]-=dx*o; DY[a]-=dy*o; DX[b]+=dx*o; DY[b]+=dy*o; }
}
function rxJunctions(st){
  const {J, X, Y, DX, DY, nodeR} = st;
  for(let a=0;a<J.length;a++) for(let b=a+1;b<J.length;b++){
    const i=J[a], j=J[b], dx=X[j]-X[i], dy=Y[j]-Y[i], need=2.5*Math.max(nodeR[i],nodeR[j])*1.12+60;
    const d2=dx*dx+dy*dy; if(d2>=need*need) continue;
    const d=Math.sqrt(d2)+1e-6, o=(need-d)*0.25/d;
    DX[i]-=dx*o; DY[i]-=dy*o; DX[j]+=dx*o; DY[j]+=dy*o;
  }
}
// planarity guard: any control segment that now properly crosses another one gets its endpoints reverted
function rxSegs(st, k, out){ // segments (as start-point indices along chains) touching flat point k -> pairs [p0,p1]
  let m=0;
  if(k<st.N){ for(let p=st.incS[k]; p<st.incS[k+1]; p++){ const c=st.incL[p]; const q = st.CA[c]===k ? 0 : st.cnt[c]; out[m++]=rxPt(st,c,q); out[m++]=rxPt(st,c,q+1); } }
  else { const c=st.CH[k], q=k-st.base[c]+1; out[m++]=rxPt(st,c,q-1); out[m++]=k; out[m++]=k; out[m++]=rxPt(st,c,q+1); }
  return m;
}
function segX(X, Y, a, b, c, d){
  if(a===c||a===d||b===c||b===d) return false;
  const ax=X[a],ay=Y[a],bx=X[b],by=Y[b],cx=X[c],cy=Y[c],dx=X[d],dy=Y[d];
  const o1=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax), o2=(bx-ax)*(dy-ay)-(by-ay)*(dx-ax);
  if(o1*o2>=0) return false;
  const o3=(dx-cx)*(ay-cy)-(dy-cy)*(ax-cx), o4=(dx-cx)*(by-cy)-(dy-cy)*(bx-cx);
  return o3*o4<0;
}
function rxGuard(st){
  const {X, Y, OX, OY, PL, NFIX, N} = st, NPL=st.NPL, A=st.GA, B=st.GB;
  for(let pass=0; pass<3; pass++){ let rev=0;
    const lim = 2.4*st.sc + 6*st.opt.maxStep, lim2 = lim*lim;
    for(let k=0;k<NPL;k+=2){ const i=PL[k], j=PL[k+1];
      const ci=st.CH[i], cj=st.CH[j]; if(ci>=0 && ci===cj) continue;
      const ddx=X[i]-X[j], ddy=Y[i]-Y[j]; if(ddx*ddx+ddy*ddy > lim2) continue; // segments this far apart cannot touch
      const ni=rxSegs(st,i,A), nj=rxSegs(st,j,B);
      for(let p=0;p<ni;p+=2) for(let q=0;q<nj;q+=2){
        if(!segX(X,Y,A[p],A[p+1],B[q],B[q+1])) continue;
        for(let z=0;z<4;z++){ const v = z===0?A[p]:z===1?A[p+1]:z===2?B[q]:B[q+1]; if(v<N && NFIX[v]) continue; X[v]=OX[v]; Y[v]=OY[v]; }
        rev++;
      } }
    if(!rev) break;
  }
}
function rxApply(st){
  const {N, C, K, W, H, X, Y, R, S, DX, DY, NFIX, PINX, PINY, PINL, CA, CB, base, cnt, Lc, opt} = st;
  const it3 = st.it%3, guard = it3===2 || st.it===opt.iters-1;   // the planarity guard runs once per resample cycle
  if(it3===0){ if(st.OX.length<K){ st.OX=new Float64Array(st.cap); st.OY=new Float64Array(st.cap); } st.OX.set(X.subarray(0,K)); st.OY.set(Y.subarray(0,K)); }
  const ms = opt.maxStep, bs = opt.bsoft, bm = opt.bmargin;
  if(st.stemDepth>0) for(let n=0;n<N;n++){ const sp=st.STEMN[n]; if(sp<0) continue; // keep the first junction off the map edge
    const dep=(X[n]-X[sp])*PINX[sp]+(Y[n]-Y[sp])*PINY[sp]; if(dep<st.stemDepth){ const f=Math.min(ms, 0.5*(st.stemDepth-dep)); DX[n]+=PINX[sp]*f*2; DY[n]+=PINY[sp]*f*2; } }
  for(let k=0;k<K;k++){
    if(k<N && NFIX[k]) continue;
    const m=R[k]+bs, x=X[k], y=Y[k]; // soft boundary zone (hard clamp below is only a backstop)
    if(x<m) DX[k]+=0.25*(m-x); else if(x>W-m) DX[k]-=0.25*(x-W+m);
    if(y<m) DY[k]+=0.25*(m-y); else if(y>H-m) DY[k]-=0.25*(y-H+m);
    let dx=DX[k], dy=DY[k]; const dl=Math.hypot(dx,dy); if(dl>ms){ dx*=ms/dl; dy*=ms/dl; }
    X[k]+=dx; Y[k]+=dy;
  }
  for(let c=0;c<C;c++){ const a=CA[c], b=CB[c], L=Lc[c];
    for(let q=0;q<cnt[c];q++){ const k=base[c]+q; let pinned=false;
      if(PINL[a]>0 && S[k]<PINL[a]){ const t=Math.max(0,(X[k]-X[a])*PINX[a]+(Y[k]-Y[a])*PINY[a]); X[k]=X[a]+PINX[a]*t; Y[k]=Y[a]+PINY[a]*t; pinned=true; }
      if(PINL[b]>0 && L-S[k]<PINL[b]){ const t=Math.max(0,(X[k]-X[b])*PINX[b]+(Y[k]-Y[b])*PINY[b]); X[k]=X[b]+PINX[b]*t; Y[k]=Y[b]+PINY[b]*t; pinned=true; }
      if(!pinned){ const mg=R[k]+bm; X[k]=Math.min(W-mg, Math.max(mg, X[k])); Y[k]=Math.min(H-mg, Math.max(mg, Y[k])); }
    } }
  for(let n=0;n<N;n++){ if(NFIX[n]) continue; const mg=R[n]+bm; X[n]=Math.min(W-mg, Math.max(mg, X[n])); Y[n]=Math.min(H-mg, Math.max(mg, Y[n]));
  }
  if(guard) rxGuard(st);
}
function rxResample(st){ // re-space every chain's control points at the current spacing st.sc
  const {N, C, X, Y, CA, CB, base, cnt} = st, sc=st.sc;
  // new counts from current lengths
  let K=N; const nseg = new Int32Array(C);
  for(let c=0;c<C;c++){ let L=0, px=X[CA[c]], py=Y[CA[c]]; const b=base[c], m=cnt[c];
    for(let q=0;q<=m;q++){ const k = q<m ? b+q : CB[c]; L+=Math.hypot(X[k]-px, Y[k]-py); px=X[k]; py=Y[k]; }
    nseg[c]=Math.max(2, Math.round(L/sc)); K += nseg[c]-1; }
  rxAlloc(st, K);
  const X2=st.X, Y2=st.Y, BX=st.BX, BY=st.BY;
  let o=N;
  for(let c=0;c<C;c++){ const b=base[c], m=cnt[c]+2;
    if(st.TMPX.length<m){ st.TMPX=new Float64Array(m*2); st.TMPY=new Float64Array(m*2); st.TMPC=new Float64Array(m*2); }
    const PX=st.TMPX, PY=st.TMPY, CU=st.TMPC;
    for(let q=0;q<m;q++){ const k = q===0 ? CA[c] : q===m-1 ? CB[c] : b+q-1; PX[q]=X2[k]; PY[q]=Y2[k]; CU[q] = q ? CU[q-1]+Math.hypot(PX[q]-PX[q-1], PY[q]-PY[q-1]) : 0; }
    const L=CU[m-1], ns=nseg[c]; let j=0;
    for(let s2=1;s2<ns;s2++){ const s=L*s2/ns; while(j<m-2 && CU[j+1]<s) j++; const seg=CU[j+1]-CU[j], t = seg>1e-9 ? (s-CU[j])/seg : 0;
      BX[o]=PX[j]+(PX[j+1]-PX[j])*t; BY[o]=PY[j]+(PY[j+1]-PY[j])*t; o++; }
  }
  // commit
  o=N; for(let c=0;c<C;c++){ base[c]=o; cnt[c]=nseg[c]-1; o+=cnt[c]; }
  for(let k=N;k<K;k++){ X2[k]=BX[k]; Y2[k]=BY[k]; }
  st.K=K;
}
function relax(nodes, chains, W, H, opt){
  const st = relaxInit(nodes, chains, W, H, opt), iters = st.opt.iters;
  for(let it=0; it<iters; it++){
    st.it = it; st.late = Math.max(st.opt.lateMin, smoothstep((it/iters-0.55)/0.3));
    rxArcs(st);
    st.DX.fill(0,0,st.K); st.DY.fill(0,0,st.K);
    if(it%3===0){ rxGrid(st); rxCollect(st); if(st.EXC.length < st.NPL>>1) st.EXC = new Int8Array(st.PL.length>>1); st.EXC.fill(-1, 0, st.NPL>>1); }
    rxRepel(st);
    rxSpread(st);
    rxSmooth(st);
    rxCapShape(st);
    rxNodes(st);
    rxAngles(st);
    rxCaps(st);
    rxJunctions(st);
    rxApply(st);
    if(it%3===2 || it===iters-1){ st.sc = it+1 < st.nCoarse ? st.scC : st.scF; rxResample(st); }
  }
  // write back
  for(let n=0;n<st.N;n++){ nodes[n].x=st.X[n]; nodes[n].y=st.Y[n]; }
  for(let c=0;c<st.C;c++){ const p=[[st.X[st.CA[c]], st.Y[st.CA[c]]]]; for(let q=0;q<st.cnt[c];q++) p.push([st.X[st.base[c]+q], st.Y[st.base[c]+q]]); p.push([st.X[st.CB[c]], st.Y[st.CB[c]]]); chains[c].pts=p; }
  return st;
}

// ------------------------------------------------------------------ self-check (mirrors metrics.js)
function checkNet(nodes, edges){
  const inc = new Map(); for(const n of nodes) inc.set(n.id, []);
  for(const e of edges){ inc.get(e.a).push(e); inc.get(e.b).push(e); }
  for(const e of edges){ const P=e.pts, cum=new Float64Array(P.length); for(let i=1;i<P.length;i++) cum[i]=cum[i-1]+Math.hypot(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]); e._cum=cum; e._len=cum[P.length-1]; }
  const nodeR = new Map();
  for(const n of nodes){ let m=0; for(const e of inc.get(n.id)){ const p = e.a===n.id ? e.pts[0] : e.pts[e.pts.length-1]; if(p[2]>m) m=p[2]; } nodeR.set(n.id, m); }
  const curv = [], gap = []; let cross = 0, jbad = 0;
  const T12 = 12*Math.PI/180;
  for(const e of edges){ const P=e.pts, cum=e._cum, L=e._len, exA=1.5*P[0][2], exB=1.5*P[P.length-1][2];
    for(let i=1;i<P.length-1;i++){
      if(cum[i]<exA || L-cum[i]<exB) continue;
      const ax=P[i][0]-P[i-1][0], ay=P[i][1]-P[i-1][1], bx=P[i+1][0]-P[i][0], by=P[i+1][1]-P[i][1], la=Math.hypot(ax,ay), lb=Math.hypot(bx,by);
      if(la<1e-6||lb<1e-6) continue;
      const c=Math.max(-1,Math.min(1,(ax*bx+ay*by)/(la*lb))), th=Math.acos(c);
      if(th>T12*0.97 || (th>1e-4 && 0.5*(la+lb)/th < 1.5*P[i][2]*1.03)) curv.push({e:e.id, i});
    } }
  const J = nodes.filter(n=>inc.get(n.id).length>=3);
  for(let i=0;i<J.length;i++) for(let k=i+1;k<J.length;k++){ const d=Math.hypot(J[i].x-J[k].x, J[i].y-J[k].y); const need=2.5*Math.max(nodeR.get(J[i].id), nodeR.get(J[k].id)); if(d < need*1.01){ jbad++; gap.push({junc:[J[i].id,J[k].id], jdef: need*1.03+20-d}); } }
  // segments
  let nS=0; for(const e of edges) nS+=e.pts.length-1;
  const X0=new Float64Array(nS), Y0=new Float64Array(nS), X1=new Float64Array(nS), Y1=new Float64Array(nS), R0=new Float64Array(nS), R1=new Float64Array(nS), S0=new Float64Array(nS), S1=new Float64Array(nS);
  const BX0=new Float64Array(nS), BY0=new Float64Array(nS), BX1=new Float64Array(nS), BY1=new Float64Array(nS), SE=new Array(nS);
  let k=0;
  for(const e of edges){ const P=e.pts; for(let i=0;i<P.length-1;i++,k++){ X0[k]=P[i][0]; Y0[k]=P[i][1]; X1[k]=P[i+1][0]; Y1[k]=P[i+1][1]; R0[k]=P[i][2]; R1[k]=P[i+1][2]; S0[k]=e._cum[i]; S1[k]=e._cum[i+1]; SE[k]=e;
    const rr=Math.max(R0[k],R1[k]), pad=rr+Math.max(150,0.6*rr)/2+1;
    BX0[k]=Math.min(X0[k],X1[k])-pad; BX1[k]=Math.max(X0[k],X1[k])+pad; BY0[k]=Math.min(Y0[k],Y1[k])-pad; BY1[k]=Math.max(Y0[k],Y1[k])+pad; } }
  const CS=600; let gx0=Infinity, gy0=Infinity, gx1=-Infinity, gy1=-Infinity;
  for(let i=0;i<nS;i++){ if(BX0[i]<gx0)gx0=BX0[i]; if(BY0[i]<gy0)gy0=BY0[i]; if(BX1[i]>gx1)gx1=BX1[i]; if(BY1[i]>gy1)gy1=BY1[i]; }
  const gw=Math.floor((gx1-gx0)/CS)+1, gh=Math.floor((gy1-gy0)/CS)+1;
  const cnt=new Int32Array(gw*gh+1), CX0=new Int32Array(nS), CX1=new Int32Array(nS), CY0=new Int32Array(nS), CY1=new Int32Array(nS);
  for(let i=0;i<nS;i++){ CX0[i]=Math.floor((BX0[i]-gx0)/CS); CX1[i]=Math.floor((BX1[i]-gx0)/CS); CY0[i]=Math.floor((BY0[i]-gy0)/CS); CY1[i]=Math.floor((BY1[i]-gy0)/CS);
    for(let y=CY0[i]; y<=CY1[i]; y++) for(let x=CX0[i]; x<=CX1[i]; x++) cnt[y*gw+x+1]++; }
  for(let c=0;c<gw*gh;c++) cnt[c+1]+=cnt[c];
  const fill=cnt.slice(0,gw*gh), lst=new Int32Array(cnt[gw*gh]);
  for(let i=0;i<nS;i++) for(let y=CY0[i]; y<=CY1[i]; y++) for(let x=CX0[i]; x<=CX1[i]; x++) lst[fill[y*gw+x]++]=i;
  const endArc=(e,s,n)=> (e.a===n && e.b===n) ? Math.min(s, e._len-s) : (e.a===n ? s : e._len-s);
  function adj1(ea, tA, eb, tB, na, nb){
    const E = 3*Math.max(nodeR.get(na), nodeR.get(nb));
    if(na===nb) return endArc(ea,tA,na)<E && endArc(eb,tB,nb)<E;
    const l=inc.get(na);
    for(let k=0;k<l.length;k++){ const c=l[k]; if((c.a===na&&c.b===nb)||(c.b===na&&c.a===nb)){ if(endArc(ea,tA,na)+c._len+endArc(eb,tB,nb) < 2*E) return true; } }
    return false;
  }
  function nearAdj(ea, tA, eb, tB){
    return adj1(ea,tA,eb,tB,ea.a,eb.a) || adj1(ea,tA,eb,tB,ea.a,eb.b) || adj1(ea,tA,eb,tB,ea.b,eb.a) || adj1(ea,tA,eb,tB,ea.b,eb.b);
  }
  for(let c=0;c<gw*gh;c++){ const s0=cnt[c], e0=cnt[c+1]; if(e0-s0<2) continue; const ccx=c%gw, ccy=(c-ccx)/gw;
    for(let p=s0;p<e0;p++){ const a=lst[p];
      for(let q=p+1;q<e0;q++){ const b=lst[q];
        const ea=SE[a], eb=SE[b];
        if(ea===eb && Math.abs(S0[a]-S0[b]) < 4*Math.max(R0[a],R0[b])) continue;   // neighbours along one vessel
        if(BX0[a]>BX1[b]||BX0[b]>BX1[a]||BY0[a]>BY1[b]||BY0[b]>BY1[a]) continue;
        if((CX0[a]>CX0[b]?CX0[a]:CX0[b])!==ccx || (CY0[a]>CY0[b]?CY0[a]:CY0[b])!==ccy) continue;   // each pair once: in its first shared cell
        // closest points
        const d1x=X1[a]-X0[a], d1y=Y1[a]-Y0[a], d2x=X1[b]-X0[b], d2y=Y1[b]-Y0[b], rx=X0[a]-X0[b], ry=Y0[a]-Y0[b];
        const A=d1x*d1x+d1y*d1y, E=d2x*d2x+d2y*d2y, F=d2x*rx+d2y*ry; let ss, tt;
        if(A<1e-9&&E<1e-9){ss=0;tt=0;} else if(A<1e-9){ss=0;tt=Math.max(0,Math.min(1,F/E));}
        else { const C=d1x*rx+d1y*ry; if(E<1e-9){tt=0;ss=Math.max(0,Math.min(1,-C/A));} else { const Bv=d1x*d2x+d1y*d2y, den=A*E-Bv*Bv; ss=den>1e-12?Math.max(0,Math.min(1,(Bv*F-C*E)/den)):0; tt=(Bv*ss+F)/E; if(tt<0){tt=0;ss=Math.max(0,Math.min(1,-C/A));} else if(tt>1){tt=1;ss=Math.max(0,Math.min(1,(Bv-C)/A));} } }
        const px=X0[a]+d1x*ss, py=Y0[a]+d1y*ss, qx=X0[b]+d2x*tt, qy=Y0[b]+d2y*tt, d=Math.hypot(px-qx,py-qy);
        const ra=R0[a]+(R1[a]-R0[a])*ss, rb=R0[b]+(R1[b]-R0[b])*tt, need=Math.max(150,0.6*Math.min(ra,rb));
        if(d-ra-rb >= need*1.02+8) continue;
        const tA=S0[a]+(S1[a]-S0[a])*ss, tB=S0[b]+(S1[b]-S0[b])*tt;
        if(ea!==eb && nearAdj(ea,tA,eb,tB)) continue;
        let ux=px-qx, uy=py-qy; const ul=Math.hypot(ux,uy); if(ul>1e-6){ux/=ul;uy/=ul;} else { const l=Math.sqrt(A)||1; ux=-d1y/l; uy=d1x/l; }
        gap.push({ea:ea.id, eb:eb.id, tA, tB, deficit: need*1.02+8-(d-ra-rb), ux, uy});
      } } }
  return { curv, gap, jbad, n: curv.length + gap.length };
}

// ------------------------------------------------------------------ generator
function generateOnce(seed, W, H, variant){
  const rng = mulberry32((((seed|0)*2654435761) ^ 0x5bd1e995 ^ Math.imul(variant, 0x27d4eb2d))|0);
  const P = { dMesh:1150, ringC:450, ringM:150, sinkSpacing:2000, alphaA:0.55, alphaV:0.55, iters:6,
    rTrunkA:700, rTrunkV:800, rTermMaxV:240, rCapMin:112, capLen:1250, sinkDepth:2100, radialBeta:1.2, kAng:0.12, angFade:1,
    stemI:2500, stemO:2300, stemDepth:2300, twigLat:2400, turnV:1.2, turnA:1, turnMin:0.1, stemClr:1450, rootClr:2800, fillMax:6, voidTarget:2700, cornerBias:800, capCos:0.1, capTurn:1.5, capMax:1600, venAnchor:0.3 };
  if(variant===1) P.sinkSpacing *= 1.07;                                  // retry after a crowding defect: sparser
  if(variant===2){ P.sinkSpacing *= 0.94; P.voidTarget -= 400; }         // retry after a void: denser

  // --- layouts: arterial inlet on the left edge; venous outlet on the right edge, or low on the top/bottom edge near the right
  const yI = H*(0.3+0.4*rng()), lay = rng()<0.6 ? 0 : rng()<0.5 ? 1 : 2;
  const I = [0, yI], nI = [1,0];
  let O, nO;
  if(lay===0){ O=[W, H*(0.3+0.4*rng())]; nO=[-1,0]; }
  else if(lay===1){ O=[W*(0.72+0.12*rng()), H]; nO=[0,-1]; }
  else { O=[W*(0.72+0.12*rng()), 0]; nO=[0,1]; }

  // --- mesh points: convex ring + Poisson interior
  const ring = [];
  { const C=P.ringC, B=P.ringC-P.ringM;
    const sides = [[C,C,W-C,C,0,-1],[W-C,C,W-C,H-C,1,0],[W-C,H-C,C,H-C,0,1],[C,H-C,C,C,-1,0]];
    for(const [x0,y0,x1,y1,nx,ny] of sides){ const L=Math.hypot(x1-x0,y1-y0), n=Math.max(2,Math.round(L/P.dMesh));
      for(let k=0;k<n;k++){ const u=k/n, w=2*u-1, b=B*(1-w*w); ring.push([x0+(x1-x0)*u+nx*b, y0+(y1-y0)*u+ny*b]); } } }
  const inner = poissonDisc(rng, P.ringM+200, P.ringM+200, W-P.ringM-200, H-P.ringM-200, P.dMesh, ring, P.dMesh*0.85);
  const pts = ring.concat(inner), NR = ring.length, NP = pts.length;
  const tris = delaunay(pts), NT = tris.length;
  const cen = tris.map(t=>[(pts[t[0]][0]+pts[t[1]][0]+pts[t[2]][0])/3, (pts[t[0]][1]+pts[t[1]][1]+pts[t[2]][1])/3]);
  const emap = new Map(), EU=[], EV=[], ET1=[], ET2=[];
  tris.forEach((t,ti)=>{ for(const [u,v] of [[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]]){ const a=Math.min(u,v), b=Math.max(u,v), k=a*NP+b; let e=emap.get(k); if(e===undefined){ e=EU.length; emap.set(k,e); EU.push(a); EV.push(b); ET1.push(ti); ET2.push(-1); } else ET2[e]=ti; } });
  const NE = EU.length;
  const elen = EU.map((u,e)=>Math.hypot(pts[u][0]-pts[EV[e]][0], pts[u][1]-pts[EV[e]][1]));
  const emid = EU.map((u,e)=>[(pts[u][0]+pts[EV[e]][0])/2, (pts[u][1]+pts[EV[e]][1])/2]);
  const adjP = Array.from({length:NP}, ()=>[]);
  for(let e=0;e<NE;e++){ adjP[EU[e]].push(e); adjP[EV[e]].push(e); }
  const vertTris = Array.from({length:NP}, ()=>[]);
  tris.forEach((t,ti)=>{ for(const v of t) vertTris[v].push(ti); });
  const isRing = v => v < NR;
  const bdist = (x,y) => Math.min(x, W-x, y, H-y);

  // --- stems
  let vI=-1, bd=Infinity;
  for(let v=NR; v<NP; v++){ const d=Math.hypot(pts[v][0]-(I[0]+nI[0]*P.stemI), pts[v][1]-(I[1]+nI[1]*P.stemI)); if(d<bd){bd=d; vI=v;} }
  let tO=-1; bd=Infinity;
  for(let t=0;t<NT;t++){ if(tris[t].includes(vI)) continue; const d=Math.hypot(cen[t][0]-(O[0]+nO[0]*P.stemO), cen[t][1]-(O[1]+nO[1]*P.stemO)); if(d<bd){bd=d; tO=t;} }
  // slide inlet and outlet along their edges so both stems leave the boundary straight
  I[1] = pts[vI][1];
  if(nO[0]) O[1] = cen[tO][1]; else O[0] = cen[tO][0];

  // --- arterial graph
  // no arterial edge on the ring (the dual stays connected around the tree), near the outlet, or running
  // back alongside the inlet stem (recurrent twigs must first leave the stem sideways)
  const artOK = new Uint8Array(NE), depVI = (pts[vI][0]-I[0])*nI[0]+(pts[vI][1]-I[1])*nI[1];
  const sx1 = pts[vI][0]-nI[0]*400, sy1 = pts[vI][1]-nI[1]*400;
  for(let e=0;e<NE;e++){
    const u=EU[e], v=EV[e];
    if(isRing(u)||isRing(v)) continue;
    const [ax,ay]=pts[u], [bx,by]=pts[v];
    if(segCross(ax,ay,bx,by, cen[tO][0],cen[tO][1], O[0],O[1])) continue;
    if(ptSeg(O[0],O[1],ax,ay,bx,by) < 2600 || ptSeg(cen[tO][0],cen[tO][1],ax,ay,bx,by) < 1700) continue;
    if(segSeg(ax,ay,bx,by, I[0],I[1],sx1,sy1) < P.stemClr){ const w = u===vI ? v : v===vI ? u : -1;
      if(w<0 || (pts[w][0]-I[0])*nI[0]+(pts[w][1]-I[1])*nI[1] < depVI-250) continue; }
    artOK[e]=1;
  }
  // terminals: Poisson subset of interior vertices. Behind the inlet stem only the far corners qualify
  // (short recurrent twigs that keep the corners beside the inlet from staying empty).
  const cand = [];
  for(let v=NR; v<NP; v++){ const [x,y]=pts[v]; if(bdist(x,y)<700 || Math.hypot(x-O[0],y-O[1])<3400 || v===vI) continue;
    const depI=(x-I[0])*nI[0]+(y-I[1])*nI[1], latI=Math.abs((x-I[0])*nI[1]-(y-I[1])*nI[0]), depO=(x-O[0])*nO[0]+(y-O[1])*nO[1];
    if(depO<P.sinkDepth*0.8) continue;
    if((depI<P.sinkDepth || Math.hypot(x-I[0],y-I[1])<3200 || Math.hypot(x-pts[vI][0], y-pts[vI][1])<1500) && latI<P.twigLat) continue;
    cand.push(v); }
  for(let i=cand.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [cand[i],cand[j]]=[cand[j],cand[i]]; }
  let sinks = [];
  for(const v of cand){ let ok=true; for(const s of sinks) if(Math.hypot(pts[v][0]-pts[s][0], pts[v][1]-pts[s][1]) < P.sinkSpacing){ ok=false; break; } if(ok) sinks.push(v); }

  const kidsA = new Int32Array(NP).fill(2);
  const artMult = (e)=> artOK[e] ? 1 : Infinity;
  const artPen = radialPen(EU, EV, pts.map(p=>p[0]), pts.map(p=>p[1]), pts[vI][0], pts[vI][1], P.radialBeta);
  // near the root no branch may head back toward the inlet edge (recurrent twigs leave from further out)
  for(let e=0;e<NE;e++){ const [ax,ay]=pts[EU[e]], [bx,by]=pts[EV[e]];
    if(Math.min(Math.hypot(ax-pts[vI][0], ay-pts[vI][1]), Math.hypot(bx-pts[vI][0], by-pts[vI][1])) > P.rootClr) continue;
    const g = ((bx-ax)*nI[0]+(by-ay)*nI[1])/elen[e];
    if(g < -0.3) artPen[0][e] *= 6; else if(g > 0.3) artPen[1][e] *= 6; }
  const artTurn = { X:pts.map(p=>p[0]), Y:pts.map(p=>p[1]), k:P.turnA, cmin:P.turnMin };
  const artTree = (mult, sk, leaf) => branchedTree(NP, adjP, EU, EV, elen, mult, vI, sk, P.alphaA, P.iters, artPen, kidsA, artTurn, leaf!==false);
  const art1 = artTree(artMult, sinks);
  sinks = sinks.filter(s=>art1.dist[s]<Infinity);
  let nS = sinks.length;
  let rtA = P.rTrunkA/Math.cbrt(nS), rtV = Math.min(P.rTermMaxV, P.rTrunkV/Math.cbrt(nS));
  const rA = Q => Math.min(800, Math.max(90, rtA*Math.cbrt(Q)));
  const rV = Q => Math.min(950, Math.max(90, rtV*Math.cbrt(Q)));

  // --- venous graph: dual edges (interior primal edges); a dual edge is unusable where its primal edge is arterial
  const dEdges = []; for(let e=0;e<NE;e++) if(ET2[e]>=0) dEdges.push(e);
  const DU = dEdges.map(e=>ET1[e]), DV = dEdges.map(e=>ET2[e]);
  const dlen = dEdges.map(e=>Math.hypot(cen[ET1[e]][0]-emid[e][0], cen[ET1[e]][1]-emid[e][1]) + Math.hypot(cen[ET2[e]][0]-emid[e][0], cen[ET2[e]][1]-emid[e][1]));
  const adjD = Array.from({length:NT}, ()=>[]);
  dEdges.forEach((e,k)=>{ adjD[DU[k]].push(k); adjD[DV[k]].push(k); });
  const dStem = new Uint8Array(dEdges.length), dBnd = new Float64Array(dEdges.length);
  dEdges.forEach((e,k)=>{ const c1=cen[ET1[e]], c2=cen[ET2[e]], m=emid[e];
    for(const [sx,sy,tx,ty] of [[I[0],I[1],pts[vI][0],pts[vI][1]], [cen[tO][0],cen[tO][1],O[0],O[1]]]) // neither stem may be crossed
      if(segCross(c1[0],c1[1],m[0],m[1], sx,sy,tx,ty) || segCross(m[0],m[1],c2[0],c2[1], sx,sy,tx,ty)) dStem[k]=1;
    dBnd[k]=Math.min(bdist(c1[0],c1[1]), bdist(c2[0],c2[1])); });
  const cenX = cen.map(p=>p[0]), cenY = cen.map(p=>p[1]);
  const venPen = radialPen(DU, DV, cenX, cenY, cen[tO][0], cen[tO][1], P.radialBeta);
  // one venous pass against a given arterial tree (null = unconstrained, used for the conflict round)
  function venPass(art, sinks, dirTree){
    const artEdge = new Uint8Array(NE), dBlocked = new Uint8Array(dEdges.length), dClr = new Float64Array(dEdges.length).fill(Infinity);
    if(art){ for(let e=0;e<NE;e++) if(art.Q[e]>0) artEdge[e]=1;
      const artSegs = [];
      for(let e=0;e<NE;e++) if(artEdge[e]) artSegs.push([pts[EU[e]][0],pts[EU[e]][1],pts[EV[e]][0],pts[EV[e]][1], rA(art.Q[e])]);
      artSegs.push([I[0],I[1],pts[vI][0],pts[vI][1], rA(nS)]);
      // clearance of each dual edge from the arteries (only values below ~1.5 mm matter: bounding-box reject)
      dEdges.forEach((e,k)=>{ if(artEdge[e] || dStem[k]){ dBlocked[k]=1; return; }
        const c1=cen[ET1[e]], c2=cen[ET2[e]], m=emid[e]; let clr=Infinity;
        const x0=Math.min(c1[0],c2[0],m[0])-2400, x1=Math.max(c1[0],c2[0],m[0])+2400, y0=Math.min(c1[1],c2[1],m[1])-2400, y1=Math.max(c1[1],c2[1],m[1])+2400;
        for(const s of artSegs){ if(Math.max(s[0],s[2])<x0 || Math.min(s[0],s[2])>x1 || Math.max(s[1],s[3])<y0 || Math.min(s[1],s[3])>y1) continue;
          const d = Math.min(segSeg(c1[0],c1[1],m[0],m[1], s[0],s[1],s[2],s[3]), segSeg(m[0],m[1],c2[0],c2[1], s[0],s[1],s[2],s[3])) - s[4]; if(d<clr) clr=d; }
        dClr[k]=clr; });
    } else dEdges.forEach((e,k)=>{ if(dStem[k]) dBlocked[k]=1; });
    const venMult = (k, F) => {
      if(dBlocked[k]) return Infinity;
      let m = 1;
      const need = rV(Math.max(1,F)) + 330;
      if(dClr[k] < need) m *= 1 + 14*Math.pow(Math.min(1.5,(need-dClr[k])/need), 2);
      if(dBnd[k] < 900) m *= 2.2;
      return m;
    };
    // venous distance field (for choosing each terminal's cap triangle)
    const vcost0 = new Float64Array(dEdges.length); for(let k=0;k<dEdges.length;k++){ const m=venMult(k,1); vcost0[k] = m===Infinity?Infinity:dlen[k]*m; }
    const vd = dijkstra(NT, adjD, DU, DV, vcost0, tO);
    const capT = new Map(), usedT = new Set(), kept = [];
    for(const s of sinks){
      const pe = dirTree.pe[s]; const u = EU[pe]===s?EV[pe]:EU[pe];
      const dx = pts[s][0]-pts[u][0], dy = pts[s][1]-pts[u][1], dl=Math.hypot(dx,dy);
      let best=-1, bc=Infinity;
      for(const t of vertTris[s]){ if(usedT.has(t) || !(vd.dist[t]<Infinity) || t===tO) continue;
        const [sx,sy]=pts[s], [gx,gy]=cen[t]; // the connector must not cut either stem
        if(segCross(sx,sy,gx,gy, cen[tO][0],cen[tO][1],O[0],O[1]) || segCross(sx,sy,gx,gy, I[0],I[1],pts[vI][0],pts[vI][1])) continue;
        const cx=gx-sx, cy=gy-sy, cl=Math.hypot(cx,cy);
        const co = (dx*cx+dy*cy)/(dl*cl); if(co < P.capCos) continue;   // no connector doubling back (hook)
        const c = vd.dist[t] + 2500*(1-co);
        if(c<bc){ bc=c; best=t; } }
      if(best<0) continue;
      capT.set(s,best); usedT.add(best); kept.push(s);
    }
    const kidsV = new Int32Array(NT).fill(2), AX = new Float64Array(NT), AY = new Float64Array(NT);
    for(const s of kept){ const t=capT.get(s), dx=cen[t][0]-pts[s][0], dy=cen[t][1]-pts[s][1], dl=Math.hypot(dx,dy);
      kidsV[t] = 1;     // a connector joins a vein that has at most one tributary there
      AX[t]=dx/dl; AY[t]=dy/dl; } // ... and the vein carries on in the connector's direction (no hairpin)
    const ven = branchedTree(NT, adjD, DU, DV, dlen, venMult, tO, kept.map(s=>capT.get(s)), P.alphaV, P.iters, venPen, kidsV, {X:cenX, Y:cenY, k:P.turnV, cmin:P.turnMin, AX, AY, ka:P.capTurn}, false);
    return { capT, kept: kept.filter(s=>ven.dist[capT.get(s)]<Infinity), ven };
  }
  let artM = artMult;
  { // primal/dual conflict round: grow the venous tree unconstrained, then keep the stronger of each crossing pair
    const V0 = venPass(null, sinks, art1);
    const venOn = new Float64Array(NE); dEdges.forEach((e,k)=>{ venOn[e]=V0.ven.Q[k]; });
    const artQ = art1.Q;
    artM = e => artOK[e] ? (venOn[e] > 4*artQ[e]+3 ? 4 : 1) : Infinity;
  }
  // both trees for a terminal set; terminals the venous tree cannot drain are dropped and the trees re-grown
  // (a terminal that the tree had to pass through keeps its connector only while it feeds <= 2 others)
  function grow(sk){
    { // a terminal on the natural course of a larger vessel would force that vessel into a detour: move it aside
      const a0 = artTree(artM, sk, false), taken = new Set(sk), out = [];
      for(const s of sk){ const e0=a0.pe[s]; if(!(a0.dist[s]<Infinity) || a0.Q[e0]<=3){ out.push(s); continue; }
        let bw=-1, bc=Infinity;
        for(const e of adjP[s]){ const w = EU[e]===s?EV[e]:EU[e]; if(taken.has(w) || isRing(w) || w===vI || !artOK[e]) continue;
          let used=false; for(const f of adjP[w]) if(a0.Q[f]>0){ used=true; break; } if(used) continue;
          let near=false; for(const q of taken) if(q!==s && Math.hypot(pts[w][0]-pts[q][0], pts[w][1]-pts[q][1]) < 0.55*P.sinkSpacing){ near=true; break; } if(near) continue;
          const c = Math.hypot(pts[w][0]-pts[s][0], pts[w][1]-pts[s][1]); if(c<bc){ bc=c; bw=w; } }
        if(bw>=0){ out.push(bw); taken.add(bw); } }
      sk = out;
    }
    let a = artTree(artM, sk);
    const relayOK = s => a.dist[s]<Infinity && a.Q[a.pe[s]] <= 3;
    if(!sk.every(relayOK)){ sk = sk.filter(relayOK); a = artTree(artM, sk); }
    sk = sk.filter(s=>a.dist[s]<Infinity);
    let vp = venPass(a, sk, a);
    for(let k=0; k<4 && vp.kept.length !== sk.length; k++){ sk = vp.kept; a = artTree(artM, sk); sk = sk.filter(s=>a.dist[s]<Infinity); vp = venPass(a, sk, a); }
    return { art:a, VP:vp, sinks:vp.kept };
  }
  let G = grow(sinks);
  // void filler: find the largest tissue gaps of the mesh-level network (centerline distance, since the
  // relaxation pulls vessels inward) and add a terminal in each, kept only if it really closes that gap
  const segsOf = g => {
    const S = [], aQ = g.art.Q, vn = g.VP.ven;
    for(let v=0; v<NP; v++){ const e=g.art.pe[v]; if(e<0 || !(aQ[e]>0)) continue; const u=EU[e]===v?EV[e]:EU[e]; S.push(pts[u][0],pts[u][1],pts[v][0],pts[v][1]); }
    S.push(I[0],I[1],pts[vI][0],pts[vI][1], cen[tO][0],cen[tO][1],O[0],O[1]);
    for(let t=0; t<NT; t++){ const k=vn.pe[t]; if(k<0 || !(vn.Q[k]>0)) continue; const q=DU[k]===t?DV[k]:DU[k], m=emid[dEdges[k]];
      S.push(cen[t][0],cen[t][1],m[0],m[1], m[0],m[1],cen[q][0],cen[q][1]); }
    for(const s of g.sinks){ const t=g.VP.capT.get(s); S.push(pts[s][0],pts[s][1],cen[t][0],cen[t][1]); }
    return S;
  };
  const distAt = (S, x, y, lo) => { let d=Infinity; for(let i=0;i<S.length;i+=4){ const q=ptSeg(x,y,S[i],S[i+1],S[i+2],S[i+3]); if(q<d){ d=q; if(d<=lo) return d; } } return d; };
  let S = segsOf(G);
  const isSink = new Uint8Array(NP); for(const s of G.sinks) isSink[s]=1;
  const tried = [];
  for(let k=0; k<P.fillMax; k++){
    let dv=P.voidTarget, vx=-1, vy=-1; const GS=500;
    for(let y=GS/2; y<H; y+=GS) for(let x=GS/2; x<W; x+=GS){ if(tried.some(t=>Math.hypot(t[0]-x, t[1]-y)<2500)) continue;
      // the corners beside the inlet get emptier than the mesh suggests (twigs there retract when relaxed)
      const bias = x < 3000 && (y < 3000 || y > H-3000) ? P.cornerBias : 0, d = distAt(S,x,y,dv-bias) + bias;
      if(d>dv){ dv=d; vx=x; vy=y; } }
    if(vx<0) break;
    tried.push([vx,vy]);
    const aQ = G.art.Q;
    let bv=-1, bdd=Infinity;
    for(let v=NR; v<NP; v++){ if(isSink[v] || v===vI) continue; const [x,y]=pts[v];
      if(bdist(x,y)<600 || Math.hypot(x-O[0],y-O[1])<3000) continue;
      const depI=(x-I[0])*nI[0]+(y-I[1])*nI[1], latI=Math.abs((x-I[0])*nI[1]-(y-I[1])*nI[0]);
      if(depI<depVI+400 && latI<P.twigLat-500) continue;
      let ok=true; for(const e of adjP[v]) if(aQ[e]>3){ ok=false; break; }
      for(const s of G.sinks) if(Math.hypot(x-pts[s][0], y-pts[s][1]) < 0.55*P.sinkSpacing){ ok=false; break; }
      if(!ok) continue;
      const d=Math.hypot(x-vx, y-vy); if(d<bdd){ bdd=d; bv=v; } }
    if(bv<0 || bdd>dv) continue;
    isSink[bv]=1;
    const G2 = grow(G.sinks.concat([bv])), S2 = segsOf(G2), ok = G2.sinks.length >= G.sinks.length-1 && distAt(S2, vx, vy, -1) < dv-400;
    if(ok){ G = G2; S = S2; }
  }
  let art = G.art; const VP = G.VP; sinks = G.sinks;
  const capT = VP.capT, ven = VP.ven;
  if(sinks.length !== nS){ nS = sinks.length; rtA = P.rTrunkA/Math.cbrt(nS); rtV = Math.min(P.rTermMaxV, P.rTrunkV/Math.cbrt(nS)); }

  // --- assemble combined graph (mesh level)
  const gN=[], gKey=new Map(), gE=[];
  const gnode = (key,x,y) => { let i=gKey.get(key); if(i===undefined){ i=gN.length; gN.push({x,y}); gKey.set(key,i);} return i; };
  const giI = gnode('I', I[0], I[1]), giO = gnode('O', O[0], O[1]);
  gE.push({a:giI, b:gnode('p'+vI, pts[vI][0], pts[vI][1]), type:'art', Q:nS, mid:null});
  for(let v=0; v<NP; v++){ const e=art.pe[v]; if(e<0 || !(art.Q[e]>0)) continue; const u = EU[e]===v?EV[e]:EU[e];
    gE.push({a:gnode('p'+u, pts[u][0], pts[u][1]), b:gnode('p'+v, pts[v][0], pts[v][1]), type:'art', Q:art.Q[e], mid:null}); }
  for(let t=0; t<NT; t++){ const k=ven.pe[t]; if(k<0 || !(ven.Q[k]>0)) continue; const q = DU[k]===t?DV[k]:DU[k];
    gE.push({a:gnode('t'+t, cen[t][0], cen[t][1]), b:gnode('t'+q, cen[q][0], cen[q][1]), type:'ven', Q:ven.Q[k], mid:emid[dEdges[k]]}); }
  gE.push({a:gnode('t'+tO, cen[tO][0], cen[tO][1]), b:giO, type:'ven', Q:nS, mid:null});
  const anchorNodes = new Set();
  for(const s of sinks){ const t=capT.get(s); const a=gnode('p'+s, pts[s][0], pts[s][1]), b=gnode('t'+t, cen[t][0], cen[t][1]);
    gE.push({a, b, type:'cap', Q:1, mid:null}); anchorNodes.add(a); anchorNodes.add(b); }
  const gin = gN.map(()=>[]), gout = gN.map(()=>[]);
  gE.forEach((e,i)=>{ gout[e.a].push(i); gin[e.b].push(i); });
  const isKey = gN.map((n,i)=> i===giI || i===giO || gin[i].length!==1 || gout[i].length!==1 || gE[gin[i][0]].type!==gE[gout[i][0]].type || anchorNodes.has(i));
  // chains between key nodes
  const nodes = [], nodeOf = new Map();
  const knode = i => { let k=nodeOf.get(i); if(k===undefined){ k=nodes.length; nodes.push({x:gN[i].x, y:gN[i].y}); nodeOf.set(i,k);} return k; };
  const chains = [];
  for(let i=0;i<gN.length;i++){ if(!isKey[i]) continue;
    for(const ei of gout[i]){ let e=gE[ei]; const ptsC=[[gN[i].x,gN[i].y]]; const type=e.type, Q=e.Q;
      let cur;
      for(;;){ if(e.mid) ptsC.push([e.mid[0],e.mid[1]]); cur=e.b; ptsC.push([gN[cur].x,gN[cur].y]); if(isKey[cur]) break; e=gE[gout[cur][0]]; }
      chains.push({a:knode(i), b:knode(cur), type, Q, pts:ptsC});
    } }
  const kI = nodeOf.get(giI), kO = nodeOf.get(giO);
  nodes[kI].fixed=true; nodes[kO].fixed=true;
  nodes[kI].pin=nI; nodes[kO].pin=nO;
  // arterial terminals are softly anchored where the mesh put them (keeps the fan spread into the corners)
  for(const c of chains) if(c.type==='cap'){ const A=nodes[c.a], B=nodes[c.b]; A.ax=A.x; A.ay=A.y; A.aw=1; B.ax=B.x; B.ay=B.y; B.aw=P.venAnchor; }
  // radii (Murray, cube law) and a gentle prescribed meander per vessel
  for(const c of chains){
    if(c.type==='art'){ c.r0=c.r1=rA(c.Q); }
    else if(c.type==='ven'){ c.r0=c.r1=rV(c.Q); }
    else { c.r0=rA(1); c.r1=rV(1); c.rm=P.rCapMin; }
    const rmax = Math.max(c.r0,c.r1);
    c.mk = c.type==='cap' ? 0 : (0.5+0.5*rng())*Math.min(1/1500, 1/(1.5*rmax*2.6)); c.mlam = 3200+3000*rng(); c.mph = rng()*TAU;
  }
  nodes[kI].pinLen = 1.7*rA(nS); nodes[kO].pinLen = 1.7*rV(nS);

  // --- relax the embedding
  relax(nodes, chains, W, H, { sc:340, scCoarse:520, coarseIters:45, iters:80, kRep:0.45, margin0:60, margin1:105, marginF:0.05, exf:0.85, lam:0.3, lam2:0.5, curvSafety:1.6, mu:60, ka:0.25, kAng:P.kAng, angLateFade:P.angFade, stemDepth:P.stemDepth, capLen:P.capLen, capMax:P.capMax, capBend:0.3, maxStep:75, bmargin:150, bsoft:300 });

  // --- output (+ self-check / repair rounds)
  const outNodes = nodes.map((n,i)=>({id:i, x:n.x, y:n.y, type: i===kI?'inlet': i===kO?'outlet':'junction'}));
  const build = () => chains.map((c,ci)=>{
    let p = c.pts.map(q=>[q[0],q[1]]);
    p[0]=[nodes[c.a].x,nodes[c.a].y]; p[p.length-1]=[nodes[c.b].x,nodes[c.b].y];
    p = chaikin(p, 3);
    const L = arcLen(p).pop();
    const rmin = c.type==='cap' ? c.rm : Math.min(c.r0,c.r1);
    const h = Math.min(0.45*rmin, 140)*0.95;
    const ns = Math.max(2, Math.ceil(L/h));
    const rs = resamplePoly(p, ns);
    return {id:ci, a:c.a, b:c.b, type:c.type, pts: rs.map((q,k)=>[q[0], q[1], chainR(c, k/ns)])};
  });
  let outEdges = build(), rounds = 0, lastV = null, polish = 0, best = null, polishRound = -9;
  const snap = V => ({ n:V.n, edges: outEdges.map(e=>({id:e.id, a:e.a, b:e.b, type:e.type, pts:e.pts.map(q=>q.slice())})), nodes: nodes.map(n=>[n.x,n.y]) });
  for(; rounds<6; rounds++){
    outNodes.forEach((o,i)=>{ o.x=nodes[i].x; o.y=nodes[i].y; });
    let V = checkNet(outNodes, outEdges); lastV = V;
    if(polishRound===rounds-1 && best && V.n > best.n){ // the re-relaxation made it worse: go back and fix locally
      outEdges = best.edges.map(e=>({id:e.id, a:e.a, b:e.b, type:e.type, pts:e.pts.map(q=>q.slice())})); best.nodes.forEach((p,i)=>{ nodes[i].x=p[0]; nodes[i].y=p[1]; });
      outNodes.forEach((o,i)=>{ o.x=nodes[i].x; o.y=nodes[i].y; }); V = checkNet(outNodes, outEdges); lastV = V; }
    if(!V.n) break;
    if(!best || V.n < best.n) best = snap(V);
    // one entry per edge pair (the worst), so repeated segment pairs do not stack their pushes
    const worst = new Map(), juncs = [];
    for(const g of V.gap){ if(g.junc){ juncs.push(g); continue; } const k = Math.min(g.ea,g.eb)*100000+Math.max(g.ea,g.eb); const o=worst.get(k); if(!o || g.deficit>o.deficit) worst.set(k,g); }
    const gaps = [...worst.values()];
    let maxDef = juncs.length ? 1e9 : 0; for(const g of gaps) maxDef = Math.max(maxDef, g.deficit);
    if((polish < 1 && (juncs.length || maxDef > 60 || gaps.length > 6)) || (polish < 2 && rounds === 3)){
      // structural defects: continue the relaxation (same end-state forces) for a few more iterations
      polish++; polishRound = rounds;
      relax(nodes, chains, W, H, { sc:340, iters:30, kRep:0.45, margin0:108, margin1:108, marginF:0.05, exf:0.85, lam:0.3, lam2:0.5, curvSafety:1.4, mu:60, ka:0.09, kAng:0, stemDepth:P.stemDepth, capLen:P.capLen, capMax:P.capMax, capBend:0.3, maxStep:40, bmargin:150, bsoft:300, lateMin:1 });
      outEdges = build();
      continue;
    }
    // small defects: fix the sampled centerlines directly
    const bump = (e, t, fx, fy) => { const Pp=e.pts, n=Pp.length; let s=0; const r=Pp[Math.min(n-1,Math.max(0,Math.round(n/2)))][2];
      const sig = 1.6*r+250, L=arcLen(Pp).pop();
      for(let i=1;i<n-1;i++){ s+=Math.hypot(Pp[i][0]-Pp[i-1][0], Pp[i][1]-Pp[i-1][1]);
        const u=(s-t)/sig; if(u*u>9) continue; const w=Math.exp(-u*u)*smoothstep(s/(0.8*sig))*smoothstep((L-s)/(0.8*sig));
        Pp[i][0]+=fx*w; Pp[i][1]+=fy*w; } };
    const touched = new Set();
    // junctions too close: slide both nodes apart and drag the adjacent stretch of every incident centerline along
    for(const g of juncs){ const [ia, ib] = g.junc, A=nodes[ia], B=nodes[ib]; let ux=A.x-B.x, uy=A.y-B.y; const ul=Math.hypot(ux,uy)||1; ux/=ul; uy/=ul;
      const m = Math.min(250, 0.5*g.jdef);
      for(const [id, sx] of [[ia, 1], [ib, -1]]){ const nd=nodes[id]; if(nd.fixed) continue; const fx=ux*m*sx, fy=uy*m*sx;
        nd.x+=fx; nd.y+=fy;
        for(const e of outEdges){ if(e.a!==id && e.b!==id) continue; const Pp = e.a===id ? e.pts : e.pts.slice().reverse();
          const Le = arcLen(Pp).pop(), sig = Math.min(3*Pp[0][2]+400, 0.6*Le); let sArc=0;
          for(let i=0;i<Pp.length-1;i++){ if(i) sArc+=Math.hypot(Pp[i][0]-Pp[i-1][0], Pp[i][1]-Pp[i-1][1]); const w = i===0 ? 1 : smoothstep(1-sArc/sig); if(w<=0) break; Pp[i][0]+=fx*w; Pp[i][1]+=fy*w; }
          if(e.b===id) e.pts = Pp.reverse();
          touched.add(e.id); } } }
    for(const g of gaps){ if(g.deficit>90) continue; const m=Math.min(60, g.deficit*0.5+12+10*rounds); bump(outEdges[g.ea], g.tA, g.ux*m, g.uy*m); bump(outEdges[g.eb], g.tB, -g.ux*m, -g.uy*m); touched.add(g.ea); touched.add(g.eb); }
    for(const cv of V.curv){ const Pp=outEdges[cv.e].pts, n=Pp.length, sp=Math.hypot(Pp[1][0]-Pp[0][0], Pp[1][1]-Pp[0][1])||1, wn=Math.max(7, Math.ceil(2.8*Pp[cv.i][2]/sp));
      for(let pass=0; pass<10; pass++) for(let i=Math.max(1,cv.i-wn); i<=Math.min(n-2,cv.i+wn); i++){ const a=Pp[i-1], b=Pp[i+1]; Pp[i][0]+=0.5*((a[0]+b[0])/2-Pp[i][0]); Pp[i][1]+=0.5*((a[1]+b[1])/2-Pp[i][1]); }
      touched.add(cv.e); }
    for(const ci of touched){ const c=chains[ci], e=outEdges[ci]; const L=arcLen(e.pts).pop(); const rmin = c.type==='cap' ? c.rm : Math.min(c.r0,c.r1);
      if(!(L<1e6)) continue; const ns=Math.max(2, Math.ceil(L/(Math.min(0.45*rmin,140)*0.95))); const rs=resamplePoly(e.pts, ns); e.pts = rs.map((q,k)=>[q[0], q[1], chainR(c, k/ns)]); }
  }
  if(lastV && lastV.n){ outNodes.forEach((o,i)=>{ o.x=nodes[i].x; o.y=nodes[i].y; }); lastV = checkNet(outNodes, outEdges); }
  if(best && lastV && lastV.n > best.n){ outEdges = best.edges; best.nodes.forEach((p,i)=>{ nodes[i].x=p[0]; nodes[i].y=p[1]; }); lastV = { n: best.n }; }
  outNodes.forEach((o,i)=>{ o.x=nodes[i].x; o.y=nodes[i].y; });
  const meta = { name:'primaldual', residual: lastV ? lastV.n : -1, notes:`primal-dual mesh: ${NP} pts, ${NT} tris; layout ${lay}; ${nS} AV connectors; repair rounds ${rounds}` };
  return { bounds:{x0:0,y0:0,x1:W,y1:H}, nodes:outNodes, edges:outEdges, meta };
}

// largest distance from a tissue sample (the SPEC metric's 110-column grid) to the nearest vessel wall
function maxVoid(W, H, edges){
  const CS=1000, gw=Math.ceil(W/CS)+1, gh=Math.ceil(H/CS)+1, cells=Array.from({length:gw*gh}, ()=>[]), S=[];
  for(const e of edges) for(let i=0;i<e.pts.length-1;i++){ const p=e.pts[i], q=e.pts[i+1], k=S.length;
    S.push([p[0],p[1],q[0],q[1],p[2],q[2]]);
    const gx=Math.min(gw-1,Math.max(0,Math.floor((p[0]+q[0])/2/CS))), gy=Math.min(gh-1,Math.max(0,Math.floor((p[1]+q[1])/2/CS))); cells[gy*gw+gx].push(k); }
  const GX=110, GY=Math.max(10, Math.round(GX*H/W)); let worst=0;
  for(let j=0;j<GY;j++) for(let i=0;i<GX;i++){ const x=(i+0.5)*W/GX, y=(j+0.5)*H/GY, cx=Math.floor(x/CS), cy=Math.floor(y/CS); let best=Infinity;
    for(let r=0; r<=Math.max(gw,gh) && best > (r-1.5)*CS; r++){
      for(let yy=cy-r; yy<=cy+r; yy++) for(let xx=cx-r; xx<=cx+r; xx++){ if(Math.max(Math.abs(xx-cx),Math.abs(yy-cy))!==r || xx<0||yy<0||xx>=gw||yy>=gh) continue;
        for(const k of cells[yy*gw+xx]){ const s=S[k], vx=s[2]-s[0], vy=s[3]-s[1], L2=vx*vx+vy*vy; let t = L2>0 ? ((x-s[0])*vx+(y-s[1])*vy)/L2 : 0; t=t<0?0:t>1?1:t;
          const d=Math.hypot(x-s[0]-vx*t, y-s[1]-vy*t)-(s[4]+(s[5]-s[4])*t); if(d<best) best=d; } }
      if(best<=worst) break; }
    if(best>worst) worst=best; }
  return worst;
}

function generate(seed, opts){
  opts = opts || {};
  const W = opts.width || 22000, H = opts.height || 14000, VOID = 3200;
  // rare leftovers get a deterministic retry: a defect the repair could not clear -> sparser terminals (variant 1);
  // a tissue void above ~3.2 mm -> denser terminals (variant 2). The best network (valid first, then the
  // smallest void) wins; at most three attempts.
  const attempt = variant => { const net = generateOnce(seed, W, H, variant); return { net, bad: net.meta.residual !== 0, v: net.meta.residual !== 0 ? Infinity : maxVoid(W, H, net.edges) }; };
  const better = (x, y) => x.bad !== y.bad ? !x.bad : x.bad ? x.net.meta.residual < y.net.meta.residual : x.v < y.v;
  const ok = r => !r.bad && r.v <= VOID;
  let best = attempt(0);
  if(!ok(best)){
    const order = best.bad ? [1, 2] : [2, 1];
    for(const variant of order){ const r = attempt(variant); if(better(r, best)) best = r; if(ok(best)) break; }
    best.net.meta.notes += '; retried';
  }
  return best.net;
}

const BV = window.BV = window.BV || {};
const GEN = BV.GENERATORS = BV.GENERATORS || {}; const INFO = BV.GENERATOR_INFO = BV.GENERATOR_INFO || {};
GEN['primaldual'] = generate; INFO['primaldual'] = { label: 'Organ lobe', blurb: 'a flow-optimal arterial fan with veins sliding in between its branches, drained by a marginal vein' };
if (window.GENERATORS) window.GENERATORS['primaldual'] = generate;   // prototype harness
})();
