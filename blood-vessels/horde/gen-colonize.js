/* ============================================================================
   HORDE — 'colonize' map style ("Hub and arcade")
   ----------------------------------------------------------------------------
   generate(seed, opts) → { bounds, nodes, edges, meta } in µm, y down (see net.js);
   opts.width / opts.height (default 22000 × 14000).

   1. Layout. The inlet sits on a short or a long edge (seeded, then mirrored);
      the outlet on the opposite edge or the far half of an adjacent one. The
      arterial trunk runs from the inlet to a hub near (but off) the centre.
   2. Territories. Arterial wedges fan out from the hub (the two beside the
      trunk sweep back towards the inlet-side corners); everything else inside a
      venous frame along the map edge is venous. A Perlin warp keeps the
      boundaries organic; an exact distance transform gives each point its
      clearance to the other territory.
   3. Pre-laid frame. Trunk, a binary hub (junctions spaced for their expected
      calibre), the two recurrent fingers, and the venous arcade: two arms from
      the outlet round the map that turn in beside the trunk, each end facing a
      recurrent finger's tip across a kept-clear corridor.
   4. Growth. Two-species space colonization (Runions 2007) fills both
      territories at once: a step is refused when it leaves its territory or
      comes too close to the other tree or to a non-adjacent branch of its own;
      splits spread to physiological angles and side branches lean ~60° with
      the flow (a Y, not a T). Short twigs and hooks are pruned, then the
      skeleton is smoothed.
   5. Connectors. Arterial tips pair with venous tips or the sides of thin
      veins, venous tips with thin arteries; rungs between parallel vessels,
      bridges across deep tissue and fans add loops. A connector path is
      ≤ 1.75 mm; a longer one keeps a ~1 mm pinched capillary and becomes
      arteriole + connector + venule, which is also how it joins a vessel too
      thick to host one (trunk, hub and thick veins never do): the arcade
      gains inward-reaching venous tributaries.
      Paths that would hook, twin another connector or clip a vessel are
      refused; unserved twigs are cut and the plan redone.
   6. Second exit (some seeds). The longer arcade arm is re-rooted: from a
      watershed node about half-way to the outlet, its far part drains through
      a narrower stem to the edge it runs along (undone if it would crowd a
      junction). The arcade stays continuous; the watershed is shared.
   7. Radii. Murray's cube law from connector flows, terminals ~185–215 µm,
      veins 1.14× their arteries; stems taper from the inlet / outlet calibre;
      radii taper across side attachments; junctions that would sit closer
      than 2.5 r narrow slightly instead.
   8. Geometry and repair. Catmull-Rom centrelines, curvature fairing, a
      clearance repair that pushes vessels apart (else drops the connector),
      and connectors that fence in a sliver of tissue are dropped.
   9. Quality gate. Largest void, connector / loop counts, connector length and
      host calibre, and the hard geometric rules are checked; a map that misses
      the bar is regrown from a derived seed (up to four attempts, best kept).
   ========================================================================== */
(function(){
'use strict';
const MM = Math, D2R = MM.PI/180;
const hyp = (x,y) => MM.sqrt(x*x+y*y);
const norm = v => { const l=hyp(v[0],v[1])||1; return [v[0]/l, v[1]/l]; };
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=MM.imul(a^a>>>15,1|a); t=t+MM.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

function makePerlin(rng){
  const perm = new Uint16Array(512), p = new Uint16Array(256);
  for(let i=0;i<256;i++) p[i]=i;
  for(let i=255;i>0;i--){ const j=(rng()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; }
  for(let i=0;i<512;i++) perm[i]=p[i&255];
  const gx = new Float64Array(256), gy = new Float64Array(256);
  for(let i=0;i<256;i++){ const a=rng()*MM.PI*2; gx[i]=MM.cos(a); gy[i]=MM.sin(a); }
  return function(x,y){
    const xi=MM.floor(x), yi=MM.floor(y), xf=x-xi, yf=y-yi, X=xi&255, Y=yi&255;
    const h00=perm[perm[X]+Y], h10=perm[perm[X+1]+Y], h01=perm[perm[X]+Y+1], h11=perm[perm[X+1]+Y+1];
    const d00=gx[h00]*xf+gy[h00]*yf, d10=gx[h10]*(xf-1)+gy[h10]*yf, d01=gx[h01]*xf+gy[h01]*(yf-1), d11=gx[h11]*(xf-1)+gy[h11]*(yf-1);
    const u=xf*xf*xf*(xf*(xf*6-15)+10), v=yf*yf*yf*(yf*(yf*6-15)+10);
    const a=d00+(d10-d00)*u, b=d01+(d11-d01)*u; return a+(b-a)*v;
  };
}

// uniform bucket grid over the map for point objects {x, y}
function Grid(W,H,cs){
  const gw = MM.ceil(W/cs)+3, gh = MM.ceil(H/cs)+3, cells = new Array(gw*gh);
  for(let i=0;i<cells.length;i++) cells[i]=[];
  const ci = (x,y) => { let i=MM.floor(x/cs)+1, j=MM.floor(y/cs)+1; if(i<0)i=0; if(j<0)j=0; if(i>=gw)i=gw-1; if(j>=gh)j=gh-1; return j*gw+i; };
  return {
    add(o){ cells[ci(o.x,o.y)].push(o); },
    each(x,y,R,cb){
      let i0=MM.floor((x-R)/cs)+1, i1=MM.floor((x+R)/cs)+1, j0=MM.floor((y-R)/cs)+1, j1=MM.floor((y+R)/cs)+1;
      if(i0<0)i0=0; if(j0<0)j0=0; if(i1>=gw)i1=gw-1; if(j1>=gh)j1=gh-1;
      for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){ const c=cells[j*gw+i]; for(let k=0;k<c.length;k++) if(cb(c[k])===true) return true; }
      return false;
    }
  };
}

// exact squared Euclidean distance transform (Felzenszwalb) of a w x h grid: distance in cells from
// every cell to the nearest cell with mask[k] === 1
function edtSq(mask, w, h){
  const INF = 1e20, n = MM.max(w,h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n+1);
  function pass(len){
    let k=0; v[0]=0; z[0]=-INF; z[1]=INF;
    for(let q=1;q<len;q++){
      let s = ((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);
      while(s<=z[k]){ k--; s = ((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]); }
      k++; v[k]=q; z[k]=s; z[k+1]=INF;
    }
    k=0; for(let q=0;q<len;q++){ while(z[k+1]<q) k++; d[q]=(q-v[k])*(q-v[k])+f[v[k]]; }
  }
  const D = new Float64Array(w*h);
  for(let i=0;i<w;i++){ for(let j=0;j<h;j++) f[j] = mask[j*w+i] ? 0 : INF; pass(h); for(let j=0;j<h;j++) D[j*w+i]=d[j]; }
  for(let j=0;j<h;j++){ for(let i=0;i<w;i++) f[i] = D[j*w+i]; pass(w); for(let i=0;i<w;i++) D[j*w+i]=d[i]; }
  return D;
}

// raster of the vessels (cell cs um): mask, squared distance transform (cells) and, optionally, the
// connected pockets of tissue between vessels {area mm2, inR um (inscribed radius), edge (touches the map edge)}
function tissue(E, W, H, cs, withPockets){
  const gw = MM.ceil(W/cs), gh = MM.ceil(H/cs), mask = new Uint8Array(gw*gh);
  for(const e of E){ const P = e.pts; let lx = -1e9, ly = -1e9;
    for(let k=0;k<P.length;k++){ const p = P[k], r = p[2];
      if(k && k < P.length-1 && (p[0]-lx)*(p[0]-lx)+(p[1]-ly)*(p[1]-ly) < 0.2*r*r) continue;
      lx = p[0]; ly = p[1];
      const i0 = MM.max(0, MM.ceil((p[0]-r)/cs-0.5)), i1 = MM.min(gw-1, MM.floor((p[0]+r)/cs-0.5)), j0 = MM.max(0, MM.ceil((p[1]-r)/cs-0.5)), j1 = MM.min(gh-1, MM.floor((p[1]+r)/cs-0.5));
      for(let j=j0;j<=j1;j++){ const dy = (j+0.5)*cs-p[1]; for(let i=i0;i<=i1;i++){ const dx = (i+0.5)*cs-p[0]; if(dx*dx+dy*dy <= r*r) mask[j*gw+i] = 1; } }
    } }
  const D = edtSq(mask, gw, gh), T = { gw, gh, cs, mask, D };
  if(!withPockets) return T;
  const lab = new Int32Array(gw*gh).fill(-1), st = new Int32Array(gw*gh), pockets = [];
  for(let s0=0; s0<gw*gh; s0++){
    if(mask[s0] || lab[s0] >= 0) continue;
    const id = pockets.length; let area = 0, mx = 0, edge = false, sp = 0; st[sp++] = s0; lab[s0] = id;
    while(sp){
      const i = st[--sp], x = i % gw, y = (i/gw)|0; area++; if(D[i] > mx) mx = D[i];
      if(x===0 || y===0 || x===gw-1 || y===gh-1) edge = true;
      if(x>0 && !mask[i-1] && lab[i-1]<0){ lab[i-1]=id; st[sp++]=i-1; }
      if(x<gw-1 && !mask[i+1] && lab[i+1]<0){ lab[i+1]=id; st[sp++]=i+1; }
      if(y>0 && !mask[i-gw] && lab[i-gw]<0){ lab[i-gw]=id; st[sp++]=i-gw; }
      if(y<gh-1 && !mask[i+gw] && lab[i+gw]<0){ lab[i+gw]=id; st[sp++]=i+gw; }
    }
    pockets.push({ area: area*cs*cs/1e6, inR: MM.sqrt(mx)*cs, edge });
  }
  T.lab = lab; T.pockets = pockets;
  return T;
}
// largest distance from the harness's sample points (110 columns) to a vessel wall
function maxVoid(T, W, H){
  const GX = 110, GY = MM.max(10, MM.round(GX*H/W)); let mv = 0, at = null;
  for(let j=0;j<GY;j++) for(let i=0;i<GX;i++){
    const x = (i+0.5)*W/GX, y = (j+0.5)*H/GY, ci = MM.min(T.gw-1, MM.floor(x/T.cs)), cj = MM.min(T.gh-1, MM.floor(y/T.cs));
    const d = MM.sqrt(T.D[cj*T.gw+ci])*T.cs; if(d > mv){ mv = d; at = [x|0, y|0]; }
  }
  return [mv, at];
}

const R_ART = 700, R_VEN = 800, R_CAP = 112;

// ============================================================================ one attempt
function build(seed, W, H){
  const rng = mulberry32(seed);
  const perlin = makePerlin(rng);

  // ------------------------------------------------------------------ layout
  // canonical frame: inlet on the left or top edge, outlet on the opposite edge or on the far half
  // of an adjacent one; then mirrored by seed
  const horiz = rng() < 0.6;
  const adj = rng() < 0.4;
  const mx = rng() < 0.5, my = rng() < 0.5;
  let pIn, pOut, NIn, NOut;
  if(horiz){ pIn = [0, H*(0.38+0.24*rng())]; NIn = [1,0];
    if(adj){ pOut = [W*(0.62+0.22*rng()), 0]; NOut = [0,1]; } else { pOut = [W, H*(0.38+0.24*rng())]; NOut = [-1,0]; } }
  else { pIn = [W*(0.3+0.4*rng()), 0]; NIn = [0,1];
    if(adj){ pOut = [0, H*(0.62+0.2*rng())]; NOut = [1,0]; } else { pOut = [W*(0.3+0.4*rng()), H]; NOut = [0,-1]; } }
  const flip = q => [mx ? W-q[0] : q[0], my ? H-q[1] : q[1]], flipN = v => [mx ? -v[0] : v[0], my ? -v[1] : v[1]];
  pIn = flip(pIn); pOut = flip(pOut); NIn = flipN(NIn); NOut = flipN(NOut);
  // hub: off centre by up to ~7 % along the trunk axis and 4 % across
  const C = [W*(0.5+(horiz?0.14:0.08)*(rng()-0.5)), H*(0.5+(horiz?0.08:0.14)*(rng()-0.5))];
  const edgeDist = (x,y) => MM.min(x, W-x, y, H-y);
  const outDirOf = q => { const d=[q[1], W-q[0], H-q[1], q[0]]; let k=0; for(let i=1;i<4;i++) if(d[i]<d[k]) k=i; return [[0,-1],[1,0],[0,1],[-1,0]][k]; };

  // ------------------------------------------------------------------ territory labels + signed distance
  const TR = 200, TW = MM.ceil(W/TR)+1, TH = MM.ceil(H/TR)+1, SD = new Float32Array(TW*TH);
  const nW = rng() < 0.5 ? 5 : 6;
  const th0 = MM.atan2((pIn[1]-C[1])/(H/2), (pIn[0]-C[0])/(W/2));
  const wedges = [];
  for(let k=0;k<nW;k++){
    const jit = 0.3*(rng()-0.5);
    const w = { phi: th0 + (k+1+jit)*2*MM.PI/(nW+1), hw0: 880+120*rng(), hw1: 1350+350*rng(), gap: 650+450*rng(), bend: 0.7*(rng()-0.5) };
    // the fingers beside the trunk sweep back towards the inlet-side corners (recurrent branches)
    if(k===0 || k===nW-1){ const sg = k===0 ? 1 : -1; w.phi = th0 + sg*(62+8*jit)*D2R; w.bend = -sg*(0.65+0.3*rng()); w.rec = sg; }
    wedges.push(w);
  }
  const FRAME = 1500, CORE = 0.26, TRUNKW = 1300;
  const tvx = C[0]-pIn[0], tvy = C[1]-pIn[1], tl2 = tvx*tvx+tvy*tvy;
  const trunkDist = (x,y) => { let t=((x-pIn[0])*tvx+(y-pIn[1])*tvy)/tl2; t=MM.max(0,MM.min(1,t)); return hyp(x-pIn[0]-tvx*t, y-pIn[1]-tvy*t); };
  {
    const lab = new Uint8Array(TW*TH), AW = 380, LW = 1/3000;
    for(let j=0;j<TH;j++) for(let i=0;i<TW;i++){
      const x=i*TR, y=j*TR;
      const wx = x + AW*(perlin(x*LW, y*LW) + 0.35*perlin(x*LW*2.7+5.1, y*LW*2.7+1.7));
      const wy = y + AW*(perlin(x*LW+17.3, y*LW+9.1) + 0.35*perlin(x*LW*2.7+11.9, y*LW*2.7+3.3));
      const u = (wx-C[0])/(W/2), v = (wy-C[1])/(H/2), rho = hyp(u,v);
      let A = rho < CORE;
      const ed = edgeDist(wx,wy), outGap = 1500*MM.exp(-hyp(x-pOut[0], y-pOut[1])/2600);
      if(!A) for(const w of wedges){
        if(ed < FRAME + w.gap + outGap) continue;
        const ph = w.phi + w.bend*(rho-CORE);
        const ex = MM.cos(ph)*W/2, ey = MM.sin(ph)*H/2, el = hyp(ex,ey), px = wx-C[0], py = wy-C[1];
        const perp = MM.abs(px*ey-py*ex)/el, ahead = px*ex+py*ey > 0;
        const t = MM.max(0, MM.min(1, (rho-CORE)/0.5)), hw = w.hw0 + (w.hw1-w.hw0)*t*t*(3-2*t);
        if(ahead && perp < hw){ A = true; break; }
      }
      if(ed < FRAME + outGap) A = false;
      if(trunkDist(x,y) < TRUNKW) A = true;
      lab[j*TW+i] = A ? 1 : 0;
    }
    const inv = new Uint8Array(TW*TH); for(let k=0;k<TW*TH;k++) inv[k] = lab[k] ? 0 : 1;
    const toV = edtSq(inv, TW, TH), toA = edtSq(lab, TW, TH);
    for(let k=0;k<TW*TH;k++) SD[k] = lab[k] ? (MM.sqrt(toV[k])-0.5)*TR : -(MM.sqrt(toA[k])-0.5)*TR;
  }
  function sdAt(x,y){
    let fx=x/TR, fy=y/TR; if(fx<0)fx=0; if(fy<0)fy=0; if(fx>TW-1.001)fx=TW-1.001; if(fy>TH-1.001)fy=TH-1.001;
    const i=MM.floor(fx), j=MM.floor(fy), u=fx-i, v=fy-j, k=j*TW+i;
    return (SD[k]*(1-u)+SD[k+1]*u)*(1-v) + (SD[k+TW]*(1-u)+SD[k+TW+1]*u)*v;
  }

  // ------------------------------------------------------------------ attractors (tissue demand)
  const AM = 650, FV = 1050, RCN = 2400, ARMSTOP = 3150, CAPGAP = 1700, EXIT2 = 0.55;
  const coreRho = (x,y) => hyp((x-C[0])/(W/2), (y-C[1])/(H/2));
  const attrBase = [];
  { const cs = 600;
    for(let y=AM+cs/2; y<H-AM; y+=cs*0.866) for(let x=AM+cs/2 + ((MM.round((y-AM)/(cs*0.866))&1)?cs/2:0); x<W-AM; x+=cs){
      const px = x+(rng()-0.5)*cs*0.55, py = y+(rng()-0.5)*cs*0.5, sd = sdAt(px,py);
      if(MM.abs(sd) < 280 || MM.abs(sd) > 1350) continue;
      if(sd < 0 && edgeDist(px,py) < FV + 500) continue;
      if(trunkDist(px,py) < TRUNKW + 250 && coreRho(px,py) > CORE) continue;
      attrBase.push({x:px, y:py, s: sd>0?0:1});
    } }

  // ------------------------------------------------------------------ pre-laid trunk, hub and venous arcade
  const S0 = 250, trunkPath = [];
  {
    const L = hyp(tvx,tvy), ux = tvx/L, uy = tvy/L;
    const Lend = L - 0.45*CORE*MM.min(W,H)/2, amp = 260*(rng()<0.5?1:-1), ph = rng()*MM.PI;
    for(let d=0; d<=Lend; d+=S0){
      const w = amp*MM.sin(MM.PI*d/Lend)*MM.sin(2*MM.PI*d/7000+ph)*MM.min(1,d/1500);
      trunkPath.push([pIn[0]+ux*d-uy*w, pIn[1]+uy*d+ux*w]);
    }
  }
  const arcArms = [], outStem = []; let exit2 = null;
  {
    const x0=FV, y0=FV, x1=W-FV, y1=H-FV, rc=RCN, P=[];
    const seg=(ax,ay,bx,by)=>{ const L=hyp(bx-ax,by-ay), n=MM.ceil(L/50); for(let i=0;i<n;i++) P.push([ax+(bx-ax)*i/n, ay+(by-ay)*i/n]); };
    const arc=(cx,cy,a0)=>{ for(let i=0;i<40;i++){ const a=a0+i/40*MM.PI/2; P.push([cx+rc*MM.cos(a), cy+rc*MM.sin(a)]); } };
    seg(x0+rc,y0,x1-rc,y0); arc(x1-rc,y0+rc,-MM.PI/2); seg(x1,y0+rc,x1,y1-rc); arc(x1-rc,y1-rc,0);
    seg(x1-rc,y1,x0+rc,y1); arc(x0+rc,y1-rc,MM.PI/2); seg(x0,y1-rc,x0,y0+rc); arc(x0+rc,y0+rc,MM.PI);
    const Q = P.map(q=>{ const n = perlin(q[0]/2600+3.3, q[1]/2600+7.7)*380; const o = outDirOf(q); return [q[0]-o[0]*n, q[1]-o[1]*n]; });
    const target = [pOut[0]+NOut[0]*FV, pOut[1]+NOut[1]*FV];
    let i0 = 0, bd = Infinity; Q.forEach((q,i)=>{ const d=hyp(q[0]-target[0],q[1]-target[1]); if(d<bd){bd=d;i0=i;} });
    const jn = Q[i0], Ls = hyp(jn[0]-pOut[0],jn[1]-pOut[1]);
    for(let d=0; d<=Ls; d+=S0) outStem.push([pOut[0]+(jn[0]-pOut[0])*d/Ls, pOut[1]+(jn[1]-pOut[1])*d/Ls]);
    outStem.push(jn.slice());
    const tdir = norm([tvx, tvy]);
    for(const dir of [1,-1]){
      const arm = []; let last = jn;
      for(let k=1;k<Q.length;k++){
        const q = Q[(i0+dir*k+Q.length*4)%Q.length];
        if(hyp(q[0]-last[0], q[1]-last[1]) < S0) continue;
        if(trunkDist(q[0],q[1]) < TRUNKW + ARMSTOP) break;
        arm.push(q.slice()); last = q;
      }
      // the arcade's ends turn in beside the trunk (at most 90 deg); the recurrent fingers come back to meet them
      if(arm.length >= 2){
        let p = arm[arm.length-1], d = norm([p[0]-arm[arm.length-2][0], p[1]-arm[arm.length-2][1]]);
        for(let i=0, tot=0; i<12; i++){
          const ang = MM.atan2(d[0]*tdir[1]-d[1]*tdir[0], d[0]*tdir[0]+d[1]*tdir[1]);
          if(MM.abs(ang) < 0.05 || tot > 1.5) break;
          const a = MM.sign(ang)*MM.min(MM.abs(ang), 0.2), c = MM.cos(a), sn = MM.sin(a); tot += MM.abs(a);
          d = [d[0]*c-d[1]*sn, d[0]*sn+d[1]*c]; p = [p[0]+d[0]*S0, p[1]+d[1]*S0]; arm.push(p);
        }
        arm.end = { p, d };
      }
      arcArms.push(arm);
    }
    // optional second exit (own random stream): the longer arm's far part will drain to the edge it runs along
    if(mulberry32(seed ^ 0x3c6ef372)() < EXIT2 && arcArms.length === 2){
      const k = arcArms[0].length >= arcArms[1].length ? 0 : 1, arm = arcArms[k], n = arm.length, iK = MM.round(n*0.62), q = arm[iK];
      if(n >= 48 && hyp(q[0]-pIn[0], q[1]-pIn[1]) > 10000 && hyp(q[0]-pOut[0], q[1]-pOut[1]) > 7000 && trunkDist(q[0],q[1]) > 5000) exit2 = { k, iK };
    }
  }
  const armEnds = arcArms.filter(a=>a.end).map(a=>a.end);
  const side = q => MM.sign(tvx*(q[1]-pIn[1]) - tvy*(q[0]-pIn[0]));
  const hubPaths = [];   // {from: parent hub path (-1 = trunk end), pts, leaf}
  {
    const T = trunkPath[trunkPath.length-1], Tp = trunkPath[trunkPath.length-2];
    const tdir = norm([T[0]-Tp[0], T[1]-Tp[1]]);
    const bases = wedges.map(w=>{ const rb = CORE+0.13, ph = w.phi + w.bend*0.13; return { w, x: C[0]+MM.cos(ph)*rb*W/2, y: C[1]+MM.sin(ph)*rb*H/2, a: ((w.phi - th0) % (2*MM.PI) + 2*MM.PI) % (2*MM.PI) }; });
    bases.sort((a,b)=>a.a-b.a);
    function curve(P, dir, Q, k){ // quadratic Bezier leaving P along dir, resampled at S0
      const L = hyp(Q[0]-P[0], Q[1]-P[1]), c = [P[0]+dir[0]*L*k, P[1]+dir[1]*L*k], out=[], tmp=[];
      let len = 0, prev = P;
      for(let i=0;i<=60;i++){ const t=i/60, u=1-t; const q=[u*u*P[0]+2*u*t*c[0]+t*t*Q[0], u*u*P[1]+2*u*t*c[1]+t*t*Q[1]]; len += hyp(q[0]-prev[0],q[1]-prev[1]); prev=q; tmp.push([q,len]); }
      const n = MM.max(1, MM.round(len/S0));
      for(let j=1;j<=n;j++){ const target=len*j/n; let k2=0; while(k2<tmp.length-1 && tmp[k2][1]<target) k2++; out.push(tmp[k2][0]); }
      out[out.length-1] = Q.slice();
      return out;
    }
    function split(P, dir, group, parentIdx, depth){
      if(group.length===1){ const b = group[0], pts = curve(P, dir, [b.x,b.y], 0.4), gi = pts.length;
        const E = b.w.rec && armEnds.find(e=>side(e.p) === side([b.x,b.y]));
        if(E){   // recurrent finger: pre-laid from its base round to face the arcade's end
          const B = pts[pts.length-1], Bp = pts.length > 1 ? pts[pts.length-2] : P, d0 = norm([B[0]-Bp[0], B[1]-Bp[1]]);
          const G = [E.p[0]+E.d[0]*CAPGAP, E.p[1]+E.d[1]*CAPGAP], Lg = hyp(G[0]-B[0], G[1]-B[1]), t1 = [-E.d[0], -E.d[1]];
          const dense = []; let len = 0, prev = B;
          for(let i=1;i<=80;i++){ const t=i/80, t2=t*t, t3=t2*t, h00=2*t3-3*t2+1, h10=t3-2*t2+t, h01=-2*t3+3*t2, h11=t3-t2, m = 0.9*Lg;
            const q = [h00*B[0]+h10*m*d0[0]+h01*G[0]+h11*m*t1[0], h00*B[1]+h10*m*d0[1]+h01*G[1]+h11*m*t1[1]]; len += hyp(q[0]-prev[0], q[1]-prev[1]); prev = q; dense.push([q,len]); }
          const n = MM.max(1, MM.round(len/S0));
          for(let j=1, k2=0;j<=n;j++){ const target = len*j/n; while(k2<dense.length-1 && dense[k2][1]<target) k2++; pts.push(dense[k2][0]); }
        }
        hubPaths.push({from: parentIdx, pts, leaf:true, n:1, gi}); return; }
      const h = MM.ceil(group.length/2);
      for(const g of [group.slice(0,h), group.slice(h)]){
        if(g.length===1){ split(P, dir, g, parentIdx, depth+1); continue; }
        const cx = g.reduce((s,b)=>s+b.x,0)/g.length, cy = g.reduce((s,b)=>s+b.y,0)/g.length;
        // junction spacing: at least 2.5 r (+10 %) of the expected calibre at the parent junction
        const dd = hyp(cx-P[0], cy-P[1]), dl = MM.max(MM.min(MM.max(1850 - 250*depth, 0.5*dd), dd-900), 2.75*205*MM.cbrt(4*group.length));
        const v = norm([cx-P[0], cy-P[1]]), dv = norm([v[0]+0.6*dir[0], v[1]+0.6*dir[1]]);
        const Jp = [P[0]+dv[0]*dl, P[1]+dv[1]*dl];
        const pts = curve(P, dir, Jp, 0.35); hubPaths.push({from: parentIdx, pts, n:g.length});
        const idx = hubPaths.length-1, l = pts.length;
        const nd = l>1 ? norm([pts[l-1][0]-pts[l-2][0], pts[l-1][1]-pts[l-2][1]]) : dv;
        split(Jp, nd, g, idx, depth+1);
      }
    }
    split(T, tdir, bases, -1, 0);
  }
  // ------------------------------------------------------------------ space colonization (both species at once)
  const S = 250, RI = 2900, DK = 420, EDGE = 560, GPAD = 230, GMIN = 330, RCLS = 290, HEAD = 10, INERT = 1.3, MAXT = 0.28;
  const rField = (x,y,s,g) => s===0 ? 230+470*MM.exp(-g/7000) : 260+540*MM.exp(-g/7000);
  const sk = [], tipPairs = [], armNodes = [];
  {
    const G = Grid(W,H,600), AG = Grid(W,H,500), junc = [];
    const attrs = attrBase.map((a,i)=>({i,x:a.x,y:a.y,s:a.s,alive:true,near:null,nd:RI*RI,nb:0}));
    for(const a of attrs) AG.add(a);
    let ITER = 0;
    // clearance radius while growing: the spatial field, never larger than the parent's
    function radFor(p,x,y,kind){
      const g = p ? p.g + hyp(x-p.x,y-p.y) : 0, f = rField(x,y,p?p.s:0,g);
      if(!p) return f;
      return MM.max(170, MM.min(f, p.r*(kind==='side'?0.72:kind==='bif'?0.86:1)));
    }
    function mk(x,y,p,s,dx,dy,stem,rr){
      const g = p ? p.g + hyp(x-p.x,y-p.y) : 0;
      const n = {id:sk.length,x,y,p,s,g,dx,dy,k:[],f:0,dead:false,stem,r:rr!==undefined?rr:rField(x,y,s,g),cut:false,j:false};
      sk.push(n); if(p) p.k.push(n); G.add(n); indexNode(n);
      AG.each(x,y,RI,a=>{ if(!a.alive||a.s!==s) return; const d2=(a.x-x)*(a.x-x)+(a.y-y)*(a.y-y);
        if(d2 < DK*DK){ a.alive=false; return; }
        if(d2 < a.nd && !stem){ a.nd=d2; a.near=n; } });
      return n;
    }
    // node index for the attractors' nearest-node queries: typed arrays and per-cell linked lists
    const NC = 600, ngw = MM.ceil(W/NC)+3, ngh = MM.ceil(H/NC)+3, head = new Int32Array(ngw*ngh).fill(-1);
    let nxt = new Int32Array(4096), NX = new Float64Array(4096), NY = new Float64Array(4096), NS = new Int8Array(4096);
    const cellI = x => MM.max(0, MM.min(ngw-1, MM.floor(x/NC)+1)), cellJ = y => MM.max(0, MM.min(ngh-1, MM.floor(y/NC)+1));
    function indexNode(n){
      const id = n.id;
      if(id >= NX.length){ const g2 = a => { const b = new a.constructor(a.length*2); b.set(a); return b; }; nxt = g2(nxt); NX = g2(NX); NY = g2(NY); NS = g2(NS); }
      NX[id] = n.x; NY[id] = n.y; NS[id] = n.s; const c = cellJ(n.y)*ngw + cellI(n.x); nxt[id] = head[c]; head[c] = id;
    }
    function reassoc(a, Rmax){   // nearest eligible node within Rmax (RI), searched in growing rings (nodes are dense)
      a.near = null; a.nd = RI*RI; const ax = a.x, ay = a.y, as = a.s;
      for(const R of (Rmax ? [900, Rmax] : [900, 1800, RI])){
        const i0 = cellI(ax-R), i1 = cellI(ax+R), j0 = cellJ(ay-R), j1 = cellJ(ay+R);
        for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++) for(let id=head[j*ngw+i]; id>=0; id=nxt[id]){
          if(NS[id] !== as) continue;
          const dx = NX[id]-ax, dy = NY[id]-ay, d2 = dx*dx+dy*dy;
          if(d2 >= a.nd) continue;
          const m = sk[id]; if(m.dead || m.fix || (m.stem && !m.stemEnd) || isBanned(a, id)) continue;
          a.nd = d2; a.near = m;
        }
        if(a.near && a.nd <= R*R) return;
      }
    }
    function kill(n){ n.dead = true; AG.each(n.x,n.y,RI+10,a=>{ if(a.near===n) reassoc(a); }); }
    // a failed growth step bans its attractors from that node for a while (longer each time)
    // (kept per node: attractor index -> iteration the ban lasts until; a.nb counts the nodes that banned it)
    const isBanned = (a, id) => { const m = sk[id].bans; return m !== undefined && (m.get(a.i) || 0) > ITER; };
    function banGroup(n,L){ const m = n.bans || (n.bans = new Map());
      for(const a of L){ if(!m.has(a.i)) a.nb++; m.set(a.i, ITER + 12 + 6*(m.has(a.i) ? a.nb : a.nb-1)); reassoc(a, 1800); } }
    // same-tree pairs near their common ancestor's junction are exempt (diverging siblings only)
    function nearCommon(n,m,extra,d2){
      let a=n, b=m;
      while(a!==b){
        if(a.g >= b.g) a=a.p; else b=b.p;
        if(!a||!b) return false;
        if((n.g-a.g) > 6000 || (m.g-b.g) > 6000) return false;
      }
      const E = 2.9*MM.max(a.r, a.k.length ? a.k[0].r : 0) + 150;
      const pd = (n.g-a.g) + extra + (m.g-a.g);
      if(pd > 2.5*S && d2 < (0.33*pd)*(0.33*pd)) return false;
      return (n.g-a.g) + extra < E && (m.g-a.g) < E;
    }
    function ok(n,x,y,r){
      if(x<EDGE||x>W-EDGE||y<EDGE||y>H-EDGE) return false;
      if(sdAt(x,y)*(n.s===0?1:-1) < MM.max(GMIN, 0.75*r+GPAD)) return false;
      const R = r + 800 + MM.max(150, 0.6*r) + 80;
      return !G.each(x,y,R,m=>{
        if(m===n) return false;
        const dx=m.x-x, dy=m.y-y, d2=dx*dx+dy*dy;
        const ra = m.s===n.s ? MM.min(r, RCLS) : r, rb = m.s===n.s ? MM.min(m.r, RCLS) : m.r;
        const need = ra + rb + MM.max(150, 0.6*MM.min(ra,rb)) + 70;
        if(d2 >= need*need) return false;
        if(m.s!==n.s) return true;
        return !nearCommon(n,m,S,d2);
      });
    }
    function canBranch(n){
      if(n.stem && !n.stemEnd) return false;
      if(sdAt(n.x,n.y)*(n.s===0?1:-1) < 1.15*n.r + 260) return false;
      if(n.k.length>=2) return false;
      for(const J of junc){ const lim = 2.5*MM.max(n.r,J.r)*1.3; if((J.x-n.x)*(J.x-n.x)+(J.y-n.y)*(J.y-n.y) < lim*lim) return false; }
      return true;
    }
    function tryPlace(n,dx,dy,kind){
      const angs = kind!=='cont' ? [0, 0.2, -0.2] : [0, 0.2, -0.2, 0.35, -0.35];
      for(const da of angs){
        const c=MM.cos(da), s=MM.sin(da), ux=dx*c-dy*s, uy=dx*s+dy*c;
        const x=n.x+ux*S, y=n.y+uy*S, r=radFor(n,x,y,kind);
        if(ok(n,x,y,r)) return [x,y,ux,uy,r];
      }
      return null;
    }
    const roots = [], fixed = [];
    {
      let n = mk(trunkPath[0][0], trunkPath[0][1], null, 0, NIn[0], NIn[1], true); roots.push(n);
      for(let i=1;i<trunkPath.length;i++){ const q=trunkPath[i], dx=q[0]-n.x, dy=q[1]-n.y, l=hyp(dx,dy)||1; n = mk(q[0],q[1],n,0,dx/l,dy/l,i<trunkPath.length-1, rField(q[0],q[1],0,0)); }
      n.stemEnd = true;
      const hubEnd = [];
      for(const hp of hubPaths){
        let m = hp.from < 0 ? n : hubEnd[hp.from];
        if(m.k.length){ m.j = true; if(!junc.includes(m)) junc.push(m); }
        for(let i=0;i<hp.pts.length;i++){ const q=hp.pts[i], dx=q[0]-m.x, dy=q[1]-m.y, l=hyp(dx,dy)||1;
          if(hp.gi !== undefined && i >= hp.gi){ m = mk(q[0],q[1],m,0,dx/l,dy/l, false, radFor(m,q[0],q[1],'cont')); m.guide = true; }
          else m = mk(q[0],q[1],m,0,dx/l,dy/l, i!==hp.pts.length-1, 205*MM.cbrt(4*hp.n)); }   // expected calibre: ~4 connectors per finger
        if(m.stem){ m.stemEnd = true; m.stem = false; }
        if(hp.gi !== undefined && hp.pts.length > hp.gi) fixed.push(m);
        hubEnd.push(m);
      }
      for(const m of sk) if(m.s===0 && m.k.length>=2 && !m.j){ m.j = true; junc.push(m); }
      let v = mk(outStem[0][0], outStem[0][1], null, 1, NOut[0], NOut[1], true); roots.push(v);
      for(let i=1;i<outStem.length;i++){ const q=outStem[i], dx=q[0]-v.x, dy=q[1]-v.y, l=hyp(dx,dy)||1; v = mk(q[0],q[1],v,1,dx/l,dy/l,i<outStem.length-1, rField(q[0],q[1],1,0)); }
      v.stemEnd = true; const J = v;
      for(const arm of arcArms){
        let m = J; const f = arm.length > 3 ? 0.8 : 1, A = [];
        for(const q of arm){ const dx=q[0]-m.x, dy=q[1]-m.y, l=hyp(dx,dy)||1; m = mk(q[0],q[1],m,1,dx/l,dy/l,false, MM.min(J.r*f, rField(q[0],q[1],1,0))); m.arc = true; A.push(m); }
        armNodes.push(A);
        if(arm.end) fixed.push(m);   // the arcade's end waits for its recurrent finger: it does not grow on
      }
      if(J.k.length>=2){ J.j = true; junc.push(J); }
    }
    for(const m of fixed) m.fix = true;
    // each recurrent finger's tip and the arcade end facing it are joined by a connector later: keep
    // that corridor clear of growth (ghost nodes block both species)
    for(const a of fixed) if(a.s===1) for(const b of fixed) if(b.s===0 && side([a.x,a.y]) === side([b.x,b.y])){
      tipPairs.push([b, a]);
      const L = hyp(a.x-b.x, a.y-b.y), n = MM.ceil(L/200);
      for(let i=1;i<n;i++) G.add({x: b.x+(a.x-b.x)*i/n, y: b.y+(a.y-b.y)*i/n, s: 2, r: 260, k: [], g: 0, dead: true});
    }
    for(const a of attrs){ if(a.near && a.near.fix) reassoc(a); if(!a.alive) continue;
      for(const r of roots){ const dx=a.x-r.x, dy=a.y-r.y; if(dx*dx+dy*dy < 2600*2600){ a.alive=false; break; } }
      if(!a.alive || a.near) continue;
      G.each(a.x,a.y,RI,m=>{ if(m.s!==a.s||m.stem||m.fix) return; const d2=(a.x-m.x)*(a.x-m.x)+(a.y-m.y)*(a.y-m.y); if(d2<a.nd){a.nd=d2;a.near=m;} }); }
    let lastGrowth = 0, nPrev = 0;
    const COS36 = MM.cos(36*D2R), COS42 = MM.cos(42*D2R), COS40 = MM.cos(40*D2R), COS60 = MM.cos(64*D2R), SIDE_ANG = 64*D2R, rot = (v,a)=>[v[0]*MM.cos(a)-v[1]*MM.sin(a), v[0]*MM.sin(a)+v[1]*MM.cos(a)];
    for(let it=0; it<900; it++){
      ITER = it;
      if(sk.length !== nPrev){ nPrev = sk.length; lastGrowth = it; } else if(it - lastGrowth > 20) break;
      if(it % 6 === 0) for(const a of attrs) if(a.alive && !a.near && a.nb) reassoc(a);
      const groups = new Map();
      for(const a of attrs) if(a.alive && a.near && !a.near.dead){ let g=groups.get(a.near); if(!g){ g=[]; groups.set(a.near,g); } g.push(a); }
      for(const [n,L] of groups){
        if(n.dead) continue;
        if(n.s===1 && it < HEAD) continue;   // arterial head start: the trunk reaches the core first
        let mx=0,my=0; const U=[];
        for(const a of L){ const dx=a.x-n.x, dy=a.y-n.y, d=hyp(dx,dy)||1; U.push([dx/d,dy/d]); mx+=dx/d; my+=dy/d; }
        const ml = hyp(mx,my), mean = ml>1e-6 ? [mx/ml,my/ml] : [n.dx,n.dy];
        let split = null;
        if(U.length>=2 && ml/U.length < 0.9){
          let bi=0,bj=1,bd=2;
          for(let i=0;i<U.length;i++) for(let j=i+1;j<U.length;j++){ const d=U[i][0]*U[j][0]+U[i][1]*U[j][1]; if(d<bd){bd=d;bi=i;bj=j;} }
          let c1=U[bi].slice(), c2=U[bj].slice(), n1=0, n2=0;
          for(let rep=0;rep<4;rep++){
            let s1x=0,s1y=0,s2x=0,s2y=0; n1=0; n2=0;
            for(const u of U){ if(u[0]*c1[0]+u[1]*c1[1] >= u[0]*c2[0]+u[1]*c2[1]){ s1x+=u[0]; s1y+=u[1]; n1++; } else { s2x+=u[0]; s2y+=u[1]; n2++; } }
            const l1=hyp(s1x,s1y)||1, l2=hyp(s2x,s2y)||1; c1=[s1x/l1,s1y/l1]; c2=[s2x/l2,s2y/l2];
          }
          if(n1 && n2 && c1[0]*c2[0]+c1[1]*c2[1] < COS36){
            split = n1>=n2 ? [c1,c2] : [c2,c1];
            // spread to a physiological angle; the smaller cluster (thinner child) deflects more
            const big = split[0], sm = split[1], ang = MM.acos(MM.max(-1,MM.min(1,big[0]*sm[0]+big[1]*sm[1])));
            if(ang < 58*D2R){ const sgn = (big[0]*sm[1]-big[1]*sm[0]) > 0 ? 1 : -1, extra = 58*D2R - ang; split = [rot(big, -sgn*extra*0.3), rot(sm, sgn*extra*0.7)]; }
          }
        }
        let success = false;
        if(n.k.length===0){
          if(split && canBranch(n)){
            const r1 = tryPlace(n, split[0][0], split[0][1], 'bif');
            let a1 = null; if(r1){ a1 = mk(r1[0],r1[1],n,n.s,r1[2],r1[3],false,r1[4]); success = true; }
            const r2 = tryPlace(n, split[1][0], split[1][1], 'side');
            if(r2 && (!a1 || r2[2]*a1.dx+r2[3]*a1.dy < COS42)){ mk(r2[0],r2[1],n,n.s,r2[2],r2[3],false,r2[4]); success = true; }
          }
          if(!success){
            let dx = mean[0]+INERT*n.dx, dy = mean[1]+INERT*n.dy; const l=hyp(dx,dy)||1; dx/=l; dy/=l;
            const cr = n.dx*dy - n.dy*dx, dt = n.dx*dx + n.dy*dy, ang = MM.atan2(cr, dt);   // gentle tortuosity: bounded turn per step
            if(MM.abs(ang) > MAXT){ const a2 = MM.sign(ang)*MAXT, c=MM.cos(a2), s2=MM.sin(a2); dx = n.dx*c - n.dy*s2; dy = n.dx*s2 + n.dy*c; }
            const r = tryPlace(n,dx,dy,'cont');
            if(r){ mk(r[0],r[1],n,n.s,r[2],r[3],false,r[4]); success = true; }
          }
        } else if(n.k.length===1 && canBranch(n)){
          const c = n.k[0], cands = split ? [split[0],split[1],mean] : [mean];
          let d=null, bd=2; for(const q of cands){ const dd=q[0]*c.dx+q[1]*c.dy; if(dd<bd){bd=dd;d=q;} }
          if(bd < COS40){
            // a side branch leaves at ~60 deg, leaning along its vessel (a Y with the flow, not a T)
            if(bd < COS60){ const sg = (c.dx*d[1]-c.dy*d[0]) > 0 ? 1 : -1, cs = MM.cos(SIDE_ANG), sn = MM.sin(SIDE_ANG)*sg; d = [c.dx*cs-c.dy*sn, c.dx*sn+c.dy*cs]; }
            const r = tryPlace(n,d[0],d[1],'side'); if(r){ mk(r[0],r[1],n,n.s,r[2],r[3],false,r[4]); success = true; } }
        }
        if(success){ if(n.k.length>=2 && !n.j){ n.j = true; junc.push(n); } }
        else { banGroup(n,L); if(++n.f >= 14) kill(n); }
      }
    }
  }

  // ------------------------------------------------------------------ skeleton clean-up
  const kidsOf = n => { const r=[]; for(const c of n.k) if(!c.cut) r.push(c); return r; };
  const aliveKids = n => { let c=0; for(const k of n.k) if(!k.cut) c++; return c; };
  function prune(Lmin){   // cut twigs shorter than Lmin
    let changed = true;
    while(changed){
      changed = false;
      for(const n of sk){
        if(n.cut || !n.p || aliveKids(n)>0 || n.guide) continue;
        let m=n, L=0; const chain=[n];
        while(m.p && m.p.p && aliveKids(m.p)===1 && !m.p.stem){ L += hyp(m.x-m.p.x, m.y-m.p.y); m=m.p; chain.push(m); }
        if(m.p) L += hyp(m.x-m.p.x, m.y-m.p.y);
        if(m.p && m.p.stem && !m.p.stemEnd) continue;
        if(L < Lmin){ for(const c of chain) c.cut = true; changed = true; }
      }
    }
  }
  function pruneHooks(){   // twigs that curl back on themselves cannot reach a partner and read badly
    for(const n of sk){
      if(n.cut || !n.p || aliveKids(n)>0 || n.arc || n.guide) continue;
      // net (signed) turning from the twig's base to its tip: a hook doubles back, a meander does not
      let m = n, turn = 0, prevDir = null, worst = 0; const chain = [n];
      while(m.p && m.p.p && aliveKids(m.p)===1 && !m.p.stem && !m.p.arc){
        const d = norm([m.x-m.p.x, m.y-m.p.y]);
        if(prevDir){ turn += MM.atan2(prevDir[0]*d[1]-prevDir[1]*d[0], prevDir[0]*d[0]+prevDir[1]*d[1]); worst = MM.max(worst, MM.abs(turn)); }
        prevDir = d; m = m.p; chain.push(m);
      }
      if(worst > 1.75) for(const c of chain) c.cut = true;
    }
  }
  prune(700); pruneHooks(); prune(700);
  const SMOOTH = 16;
  function cutSub(n){ const st=[n]; while(st.length){ const m=st.pop(); m.cut=true; for(const c of m.k) if(!c.cut) st.push(c); } }
  // cut an unserved twig back to its branch point; the pre-laid arcade and recurrent fingers only retract
  function cutBranch(n){
    const pre = n.arc || n.guide, maxLen = pre ? 1600 : Infinity;
    let m = n, L = 0;
    while(m.p && m.p.p && kidsOf(m.p).length===1 && !m.p.stem && (pre || !(m.p.arc || m.p.guide)) && L + hyp(m.x-m.p.x,m.y-m.p.y) < maxLen){ L += hyp(m.x-m.p.x,m.y-m.p.y); m = m.p; }
    cutSub(m);
  }
  for(let it=0; it<SMOOTH; it++){
    for(const n of sk){ n.sx=n.x; n.sy=n.y; if(n.cut || !n.p || n.stem) continue; const ks=kidsOf(n);
      if(ks.length!==1) continue;
      n.sx = 0.5*n.x + 0.25*(n.p.x+ks[0].x); n.sy = 0.5*n.y + 0.25*(n.p.y+ks[0].y); }
    for(const n of sk){ n.x=n.sx; n.y=n.sy; }
  }

  // ------------------------------------------------------------------ AV connectors
  // A connector path runs from an arterial point P to a venous point Q. Only its middle stretch
  // (<= CAPT) is the narrow capillary connector; a longer path starts with a short arteriole
  // branching off P and/or ends with a venule joining Q. Direct attachment only on thin vessels.
  const RMAX = [R_ART, R_VEN];
  const RCAP = 4200, CAPMAX = 1750, CAPT = 1050, CAPMIN = 550, PMA = 350, PMV = 450;
  const HOOK = 95*D2R, TWIN = 2000, RUNG_GAP = 1500, RUNG_MIN = 1500, RUNG_MAX = 3800, RUNG_SP = 700, RUNG_N = 60, FAN_N = 14, FANSEP = 2600, BR_MIN = 3000, BR_MAX = 6000, BR_DEPTH = 1400;
  let caps = [], capsAt = new Map(), attach = new Set(), RT = [210, 240];
  const GAM = 3;
  const banned = new Set();
  const rOfF = (s,F) => MM.min(RMAX[s], RT[s]*MM.pow(MM.max(1, F), 1/GAM));
  const rootR = n => n.flare ? MM.min(RMAX[n.s], n.flare*rOfF(n.s, n.sub)) : RMAX[n.s];   // a second exit is sized by its flow
  const growDir = n => { const a = n.p ? n : kidsOf(n)[0], b = n.p ? n.p : n; if(!a||!b) return [1,0]; return norm([a.x-b.x, a.y-b.y]); };
  function bez(P,tP,Q,tQ,k){
    const L = hyp(Q.x-P.x,Q.y-P.y), c1=[P.x+tP[0]*L*k, P.y+tP[1]*L*k], c2=[Q.x-tQ[0]*L*k, Q.y-tQ[1]*L*k];
    const n = MM.max(10, MM.ceil(L/25)), out=[];
    for(let i=0;i<=n;i++){ const t=i/n, u=1-t;
      out.push([u*u*u*P.x+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*Q.x, u*u*u*P.y+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*Q.y]); }
    return out;
  }
  // connector radius: base blends arterial -> venous terminal radius; pinched to R_CAP mid-way. The
  // exponent keeps the stretch narrower than a horde disc (r < 125) at <= ~450 um
  function capProfile(t, ra, rv, Lc){
    t = MM.max(0, MM.min(1, t)); const b = ra+(rv-ra)*t;
    const f = MM.min(0.39, 450/MM.max(1,Lc)), k = (ra-125)/(ra-R_CAP);
    const p = MM.max(0.8, MM.log(k)/MM.log(MM.cos(MM.PI*f/2)));
    return b - (b-R_CAP)*MM.pow(MM.abs(MM.sin(MM.PI*t)), p);
  }
  function computeFlows(guess){
    for(const n of sk) n.sub = 0;
    for(let i=sk.length-1;i>=0;i--){ const n=sk[i]; if(n.cut) continue;
      if(guess){ if(!kidsOf(n).length) n.sub += 1.8; } else n.sub += capsAt.get(n)||0;
      if(n.p) n.p.sub += n.sub; }
    let Nt = 1; for(const n of sk) if(!n.cut && !n.p) Nt = MM.max(Nt, n.sub);
    // Murray's cube law; terminal radius chosen so the hub root lands near 600 um (the stems then
    // taper from the inlet / outlet calibre down to it)
    const rtA = MM.max(185, MM.min(215, 600/MM.cbrt(Nt)));
    RT = [rtA, rtA*1.14];
    for(const n of sk) if(!n.cut) n.rf = rOfF(n.s, n.sub);
    for(const n of sk) if(!n.cut) n.rc = Infinity;
    if(!guess){  // junctions closer than 2.5 r: the vessels narrow slightly there (at most 25 %) instead
      const JJ = sk.filter(n=>!n.cut && n.p && (kidsOf(n).length>=2 || attach.has(n) || n.shed));
      for(let i=0;i<JJ.length;i++) for(let j=i+1;j<JJ.length;j++){
        const a = JJ[i], b = JJ[j], lim = hyp(a.x-b.x, a.y-b.y)/(2.5*1.05);
        if(lim >= MM.max(a.rf, b.rf)) continue;
        for(const X of [a,b]) if(lim >= 0.75*X.rf && lim < X.rc) X.rc = lim;
      }
      for(const n of sk) if(!n.cut && n.rc < n.rf) n.rf = n.rc;
    }
    for(const n of sk) if(!n.cut && n.stem && n.p){ let m = n, root = n; while(m.stem && kidsOf(m).length===1) m = kidsOf(m)[0];
      while(root.p) root = root.p; const r0 = rootR(root), t = MM.min(1, n.g/MM.max(1, m.g)); n.rf = r0 + (m.rf - r0)*t*t*(3-2*t); }
  }
  // split a connector path of length L into [arteriole | capillary | venule]; returns [sA, sV] or null
  function splitPath(L, needA, needV, tipP, tipQ){
    if(!needA && !needV && L <= CAPMAX) return [0, L];
    const mA = needA ? PMA : 0, mV = needV ? PMV : 0;
    let Lc = MM.min(CAPT, L - mA - mV);
    if(Lc < CAPMIN) return null;
    let a;
    if(!needA && tipP) a = 0;                  // the arterial tip runs straight into its connector
    else if(!needV && tipQ) a = L - Lc;        // the connector runs straight into a venous tip
    else a = MM.max(mA, (L-Lc)/2);
    let v = L - Lc - a;
    if(v < mV){ v = mV; a = L - Lc - v; }
    if(a > 0 && a < PMA){ if(needA) return null; Lc += a; a = 0; }
    if(v > 0 && v < PMV){ if(needV) return null; Lc += v; v = 0; }
    if(Lc > CAPMAX || a < 0) return null;
    return [a, a + Lc];
  }
  function planCaps(){
    const live = sk.filter(n=>!n.cut);
    const GC = Grid(W,H,1100); for(const n of live) GC.add(n);
    // live-node index for the clearance test (typed arrays, per-cell lists)
    const nL = live.length, LX = new Float64Array(nL), LY = new Float64Array(nL), LR = new Float64Array(nL);
    const LC = 400, lgw = MM.ceil(W/LC)+3, lgh = MM.ceil(H/LC)+3, lhead = new Int32Array(lgw*lgh).fill(-1), lnxt = new Int32Array(nL);
    const lci = x => MM.max(0, MM.min(lgw-1, MM.floor(x/LC)+1)), lcj = y => MM.max(0, MM.min(lgh-1, MM.floor(y/LC)+1));
    for(let i=nL-1;i>=0;i--){ const n = live[i]; LX[i] = n.x; LY[i] = n.y; LR[i] = n.rf; const k = lcj(n.y)*lgw + lci(n.x); lnxt[i] = lhead[k]; lhead[k] = i; }
    const Jn = live.filter(n=>kidsOf(n).length>=2);
    caps = []; capsAt = new Map(); attach = new Set();
    const CG = Grid(W,H,400), ends = [Grid(W,H,600), Grid(W,H,600)], rends = [Grid(W,H,600), Grid(W,H,600)];
    const ra = RT[0], rv = RT[1];
    // leaf counts and terminal-chain ids (a thin arterial vessel may carry at most 3 connectors)
    for(const n of live) n.nl = 0;
    for(let i=sk.length-1;i>=0;i--){ const n=sk[i]; if(n.cut) continue; if(!kidsOf(n).length) n.nl = 1; if(n.p) n.p.nl += n.nl; }
    const chainOf = n => { let m = n; while(true){ const k = kidsOf(m); if(k.length!==1) return m; m = k[0]; } };
    const chainCnt = new Map();
    const thinA = P => !P.stem && P.nl <= 1 && P.rf <= 1.3*RT[0] && (chainCnt.get(chainOf(P))||0) < 3;
    const thinV = Q => !Q.stem && Q.nl <= 5 && Q.rf <= 1.9*RT[1];
    function junctionOK(q){
      const rq = q.rf;
      for(const J of Jn){ const need = 2.5*MM.max(rq, J.rf)*1.08; if((J.x-q.x)**2+(J.y-q.y)**2 < need*need) return false; }
      for(const a of attach){ const need = 2.5*MM.max(rq, a.rf)*1.08; if((a.x-q.x)**2+(a.y-q.y)**2 < need*need) return false; }
      return true;
    }
    const endSpacing = (q, lim) => !ends[q.s].each(q.x,q.y,lim,e=>(e.x-q.x)**2+(e.y-q.y)**2 < lim*lim);
    function capClear(pts, cum, rAt, P, Q){
      const L = cum[cum.length-1], EP = 3.1*MM.max(P.rf, ra), EQ = 3.1*MM.max(Q.rf, rv);
      for(let i=0;i<pts.length;i++){
        if(i%3 && i!==pts.length-1) continue;
        const x=pts[i][0], y=pts[i][1], arc = cum[i], rc = rAt(arc);
        if(x < rc+60 || y < rc+60 || x > W-rc-60 || y > H-rc-60) return false;
        const R = rc+1500, i0 = lci(x-R), i1 = lci(x+R), j0 = lcj(y-R), j1 = lcj(y+R);
        for(let j=j0;j<=j1;j++) for(let ii=i0;ii<=i1;ii++) for(let id=lhead[j*lgw+ii]; id>=0; id=lnxt[id]){
          const rm = LR[id], need = rc + rm + MM.max(150, 0.6*MM.min(rc,rm)) + 35, dx = LX[id]-x, dy = LY[id]-y;
          if(dx*dx+dy*dy >= need*need) continue;
          if(arc < EP && hyp(LX[id]-P.x, LY[id]-P.y) < EP) continue;
          if(L-arc < EQ && hyp(LX[id]-Q.x, LY[id]-Q.y) < EQ) continue;
          return false;
        }
        if(CG.each(x,y,rc+800,c=>{
          const need = rc + c.r + MM.max(150, 0.6*MM.min(rc,c.r)) + 40; if((c.x-x)**2+(c.y-y)**2 >= need*need) return false;
          if((c.P===P && arc < EP && c.arc < EP) || (c.Q===Q && L-arc < EQ && c.L-c.arc < EQ)) return false;
          return true;
        })) return false;
      }
      return true;
    }
    // try one connector P -> Q with end tangents tP / tQ; adds it when it fits
    function tryCap(P, Q, tP, tQ, k, kind){
      // no hooks: the path may not turn by more than ~110 deg in total between its two ends
      const ch = norm([Q.x-P.x, Q.y-P.y]), ang = (u,v) => MM.acos(MM.max(-1, MM.min(1, u[0]*v[0]+u[1]*v[1])));
      if(ang(tP, ch) + ang(ch, tQ) > HOOK) return false;
      // no twin: two connectors whose ends are both close together would fence in a sliver of tissue
      for(const c of caps) if(hyp(c.P.x-P.x, c.P.y-P.y) < TWIN && hyp(c.Q.x-Q.x, c.Q.y-Q.y) < TWIN) return false;
      const pts = bez(P,tP,Q,tQ,k), cum = [0];
      for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+hyp(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
      const L = cum[cum.length-1];
      const tipP = !kidsOf(P).length, tipQ = !kidsOf(Q).length;
      const sp = splitPath(L, !(tipP || thinA(P)), !(tipQ || thinV(Q)), tipP, tipQ);
      if(!sp) return false;
      const [sA, sV] = sp, Lc = sV - sA;
      const rAt = s => s < sA ? ra : s > sV ? rv : capProfile((s-sA)/Lc, ra, rv, Lc);
      if(!capClear(pts, cum, rAt, P, Q)) return false;
      for(let i=0;i<pts.length;i+=2) CG.add({x:pts[i][0], y:pts[i][1], r:rAt(cum[i]), P, Q, arc:cum[i], L});
      caps.push({P, Q, pts, cum, sA, sV, kind});
      capsAt.set(P,(capsAt.get(P)||0)+1); capsAt.set(Q,(capsAt.get(Q)||0)+1);
      if(P.nl<=1){ const c = chainOf(P); chainCnt.set(c, (chainCnt.get(c)||0)+1); }
      for(const X of [P,Q]){ if(kidsOf(X).length===1 && X.p) attach.add(X); ends[X.s].add({x:X.x,y:X.y}); }
      return true;
    }
    // side-attachment tangent: leave / join a vessel at ~55 deg with the flow
    const sideTan = (X, toward, sgn) => { const g = growDir(X), sx = toward.x-X.x, sy = toward.y-X.y; let nx=-g[1], ny=g[0]; if(nx*sx+ny*sy<0){nx=-nx;ny=-ny;}
      return sgn>0 ? norm([g[0]*0.55+nx*0.83, g[1]*0.55+ny*0.83]) : norm([-g[0]*0.6-nx*0.8, -g[1]*0.6-ny*0.8]); };
    const unserved = [];
    // first the designed joints: each recurrent finger's tip meets the arcade end facing it head-on
    for(const [P,Q] of tipPairs) if(!P.cut && !Q.cut && !kidsOf(P).length && !kidsOf(Q).length){ const g = growDir(Q); tryCap(P, Q, growDir(P), [-g[0],-g[1]], 0.3, 'leaf'); }
    const leavesA = live.filter(n=>n.s===0 && n.p && !kidsOf(n).length);
    const leavesV = live.filter(n=>n.s===1 && n.p && !kidsOf(n).length);
    // arterial tip -> venous tip (preferred) or the side of a vein
    for(const P of leavesA){
      if(capsAt.get(P)) continue;
      const tA = growDir(P), cands = [];
      GC.each(P.x,P.y,RCAP,Q=>{
        if(Q.s!==1 || !Q.p || Q.stem || kidsOf(Q).length>=2 || capsAt.get(Q) || banned.has(P.id+':'+Q.id)) return;
        const vx=Q.x-P.x, vy=Q.y-P.y, L=hyp(vx,vy); if(L>RCAP || L<600) return;
        const ca = (vx*tA[0]+vy*tA[1])/L; if(ca < MM.cos(105*D2R)) return;
        const leaf = !kidsOf(Q).length;
        if(!leaf && !junctionOK(Q)) return;
        let cq = 1; if(leaf){ const gq = growDir(Q); cq = -(vx*gq[0]+vy*gq[1])/L; if(cq < MM.cos(110*D2R)) return; }
        cands.push([L*(1+1.1*(1-ca)+0.6*(1-cq))*(leaf?0.7:1), Q, leaf]);
      });
      cands.sort((a,b)=>a[0]-b[0]);
      let done = false;
      for(let c=0;c<MM.min(cands.length,40) && !done;c++){
        const Q = cands[c][1], leaf = cands[c][2];
        if(!leaf && !junctionOK(Q)) continue;
        let tQ; if(leaf){ const g = growDir(Q); tQ = [-g[0],-g[1]]; } else tQ = sideTan(Q, P, -1);
        done = tryCap(P, Q, tA, tQ, 0.3, 'leaf');
      }
      if(!done) unserved.push(P);
    }
    // venous tip <- the side of an artery
    for(const Q of leavesV){
      if(capsAt.get(Q)) continue;
      const g = growDir(Q), tQ = [-g[0],-g[1]], cands = [];
      GC.each(Q.x,Q.y,RCAP,P=>{
        if(P.s!==0 || !P.p || P.stem || banned.has(P.id+':'+Q.id)) return;
        const k = kidsOf(P).length, tip = k===0;
        if(k>1 || (!tip && capsAt.get(P)) || (tip && (capsAt.get(P)||0) !== 1)) return;   // a side point, or a tip that already has one connector (fan)
        const vx=P.x-Q.x, vy=P.y-Q.y, L=hyp(vx,vy); if(L>RCAP || L<600) return;
        const ca = (vx*g[0]+vy*g[1])/L; if(ca < MM.cos(105*D2R)) return;
        if(tip){ const gp = growDir(P); if(-(vx*gp[0]+vy*gp[1])/L < MM.cos(100*D2R) || (chainCnt.get(chainOf(P))||0) >= 3) return; }
        if(!junctionOK(P)) return;
        cands.push([L*(1+1.1*(1-ca))*(tip ? 1.1 : thinA(P) ? 1 : 1.25), P]);
      });
      cands.sort((a,b)=>a[0]-b[0]);
      let done = false;
      for(let c=0;c<MM.min(cands.length,40) && !done;c++){
        const P = cands[c][1];
        if(!junctionOK(P)) continue;
        let tP; if(kidsOf(P).length) tP = sideTan(P, Q, 1); else { const gp = growDir(P), v = norm([Q.x-P.x, Q.y-P.y]); tP = norm([v[0]+0.8*gp[0], v[1]+0.8*gp[1]]); }
        done = tryCap(P, Q, tP, tQ, 0.3, 'leaf');
        if(done && !kidsOf(P).length) attach.add(P);
      }
      if(!done) unserved.push(Q);
    }
    // last resort for leftovers: wider angle, any vessel of the other kind
    if(unserved.length){
      const still = [];
      for(const X of unserved){
        if(capsAt.get(X)) continue;
        const isA = X.s===0, gX = growDir(X), cands = [];
        GC.each(X.x,X.y,5200,Y=>{
          if(Y.s===X.s || !Y.p || Y.stem || capsAt.get(Y) || banned.has((isA?X.id:Y.id)+':'+(isA?Y.id:X.id))) return;
          const k = kidsOf(Y).length; if(k>=2 || (!isA && k===0)) return;
          const vx=Y.x-X.x, vy=Y.y-X.y, L=hyp(vx,vy); if(L>5200 || L<600) return;
          const ca = (vx*gX[0]+vy*gX[1])/L; if(ca < MM.cos(135*D2R)) return;
          if(k===1 && !junctionOK(Y)) return;
          cands.push([L*(1+0.6*(1-ca)), Y]);
        });
        cands.sort((a,b)=>a[0]-b[0]);
        let done = false;
        for(let c=0;c<MM.min(cands.length,24) && !done;c++){
          const Y = cands[c][1], P = isA ? X : Y, Q = isA ? Y : X, v = norm([Q.x-P.x, Q.y-P.y]);
          const gP = growDir(P), gQ = growDir(Q);
          const tP = !kidsOf(P).length ? norm([gP[0]+v[0], gP[1]+v[1]]) : norm([v[0]+0.35*gP[0], v[1]+0.35*gP[1]]);
          const tQ = !kidsOf(Q).length ? norm([v[0]-gQ[0], v[1]-gQ[1]]) : norm([v[0]-0.35*gQ[0], v[1]-0.35*gQ[1]]);
          done = tryCap(P, Q, tP, tQ, 0.3, 'leaf');
        }
        if(!done) still.push(X);
      }
      if(still.length) return still;
    }
    // rungs: extra side-to-side connectors between neighbouring arteries and veins (loops / route choice)
    const rc = [];
    for(const P of live){
      if(P.s!==0 || !P.p || P.stem || kidsOf(P).length!==1 || capsAt.get(P)) continue;
      const dA = growDir(P);
      GC.each(P.x,P.y,RUNG_MAX,Q=>{
        if(Q.s!==1 || !Q.p || Q.stem || kidsOf(Q).length!==1 || capsAt.get(Q) || banned.has(P.id+':'+Q.id)) return;
        const vx=Q.x-P.x, vy=Q.y-P.y, L=hyp(vx,vy); if(L>RUNG_MAX || L<RUNG_MIN) return;
        const dV = growDir(Q), cA = MM.abs(vx*dA[0]+vy*dA[1])/L, cV = MM.abs(vx*dV[0]+vy*dV[1])/L;
        if(cA > 0.7 || cV > 0.75) return;
        rc.push([L + 500*(cA+cV), P, Q]);
      });
    }
    rc.sort((a,b)=>a[0]-b[0]);
    let nR = 0;
    const rsp = (q,lim) => !rends[q.s].each(q.x,q.y,lim,e=>(e.x-q.x)**2+(e.y-q.y)**2 < lim*lim);
    for(const [,P,Q] of rc){
      if(nR >= RUNG_N) break;
      if(capsAt.get(P) || capsAt.get(Q)) continue;
      if(!endSpacing(P, RUNG_SP) || !endSpacing(Q, RUNG_SP) || !rsp(P, RUNG_GAP) || !rsp(Q, RUNG_GAP)) continue;
      if(!junctionOK(P) || !junctionOK(Q)) continue;
      const v = norm([Q.x-P.x, Q.y-P.y]), dA = growDir(P), dV = growDir(Q);
      if(!tryCap(P, Q, norm([v[0]+0.35*dA[0], v[1]+0.35*dA[1]]), norm([v[0]-0.35*dV[0], v[1]-0.35*dV[1]]), 0.36, 'rung')) continue;
      nR++; rends[0].add({x:P.x,y:P.y}); rends[1].add({x:Q.x,y:Q.y});
    }
    // bridges: a long rung straight across the middle of a large pocket (arteriole + connector +
    // venule), one more loop where the tissue is widest, without fencing in a sliver
    {
      const cs = 200, gw = MM.ceil(W/cs), gh = MM.ceil(H/cs), mask = new Uint8Array(gw*gh);
      const stamp = (x,y,r) => { const i0 = MM.max(0, MM.floor((x-r)/cs)), i1 = MM.min(gw-1, MM.floor((x+r)/cs)), j0 = MM.max(0, MM.floor((y-r)/cs)), j1 = MM.min(gh-1, MM.floor((y+r)/cs));
        for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){ const dx = (i+0.5)*cs-x, dy = (j+0.5)*cs-y; if(dx*dx+dy*dy <= r*r+cs*cs/2) mask[j*gw+i] = 1; } };
      for(const n of live) stamp(n.x, n.y, n.rf);
      for(const c of caps) for(let i=0;i<c.pts.length;i+=6) stamp(c.pts[i][0], c.pts[i][1], 150);
      const D = edtSq(mask, gw, gh), depth = (x,y) => MM.sqrt(D[MM.min(gh-1, MM.max(0, MM.floor(y/cs)))*gw + MM.min(gw-1, MM.max(0, MM.floor(x/cs)))])*cs;
      const bc = [];
      for(const P of live){
        if(P.s!==0 || !P.p || P.stem || kidsOf(P).length!==1 || capsAt.get(P)) continue;
        GC.each(P.x,P.y,BR_MAX,Q=>{
          if(Q.s!==1 || !Q.p || Q.stem || kidsOf(Q).length!==1 || capsAt.get(Q) || banned.has(P.id+':'+Q.id)) return;
          const L = hyp(Q.x-P.x, Q.y-P.y); if(L < BR_MIN || L > BR_MAX) return;
          const d = depth((P.x+Q.x)/2, (P.y+Q.y)/2); if(d < BR_DEPTH) return;
          if(depth(0.75*P.x+0.25*Q.x, 0.75*P.y+0.25*Q.y) < 450 || depth(0.25*P.x+0.75*Q.x, 0.25*P.y+0.75*Q.y) < 450) return;
          bc.push([0.3*L - d, P, Q]);
        });
      }
      bc.sort((a,b)=>a[0]-b[0]);
      const mids = [];
      for(const [,P,Q] of bc){
        if(mids.length >= 3) break;
        const mx = (P.x+Q.x)/2, my = (P.y+Q.y)/2;
        if(capsAt.get(P) || capsAt.get(Q) || mids.some(m=>hyp(m[0]-mx, m[1]-my) < 4000)) continue;
        if(!endSpacing(P, RUNG_SP) || !endSpacing(Q, RUNG_SP) || !junctionOK(P) || !junctionOK(Q)) continue;
        if(tryCap(P, Q, sideTan(P, Q, 1), sideTan(Q, P, -1), 0.3, 'rung')) mids.push([mx, my]);
      }
    }
    // fans: a tip feeding / draining a second connector
    let nF = 0;
    for(const X of live){
      if(nF >= FAN_N) break;
      if(!X.p || kidsOf(X).length || capsAt.get(X)!==1 || X.arc) continue;
      if(X.s===0 && (chainCnt.get(chainOf(X))||0) >= 3) continue;
      if(!junctionOK(X)) continue;
      const isA = X.s===0, gX = growDir(X);
      const first = caps.find(c=>c.P===X||c.Q===X); if(!first) continue;
      const o = isA ? first.Q : first.P, fdir = norm([o.x-X.x, o.y-X.y]), cands = [];
      GC.each(X.x,X.y,RCAP,Y=>{
        if(Y.s===X.s || !Y.p || Y.stem || capsAt.get(Y) || hyp(Y.x-o.x, Y.y-o.y) < FANSEP) return;
        const k = kidsOf(Y).length; if(k>=2 || (!isA && k===0)) return;
        const vx=Y.x-X.x, vy=Y.y-X.y, L=hyp(vx,vy); if(L<700 || L>RCAP) return;
        const ca=(vx*gX[0]+vy*gX[1])/L; if(ca < MM.cos(95*D2R)) return;
        const cf=(vx*fdir[0]+vy*fdir[1])/L; if(cf > MM.cos(42*D2R)) return;
        if(k===1 && !junctionOK(Y)) return;
        cands.push([L*(1+0.8*(1-ca)), Y]);
      });
      cands.sort((a,b)=>a[0]-b[0]);
      for(let c=0;c<MM.min(cands.length,10);c++){
        const Y = cands[c][1], P = isA ? X : Y, Q = isA ? Y : X, v = norm([Q.x-P.x, Q.y-P.y]), gP = growDir(P), gQ = growDir(Q);
        const tP = kidsOf(P).length ? norm([v[0]+0.35*gP[0], v[1]+0.35*gP[1]]) : norm([v[0]+0.8*gP[0], v[1]+0.8*gP[1]]);
        const tQ = kidsOf(Q).length ? norm([v[0]-0.35*gQ[0], v[1]-0.35*gQ[1]]) : norm([v[0]-0.8*gQ[0], v[1]-0.8*gQ[1]]);
        if(!tryCap(P, Q, tP, tQ, 0.3, 'fan')) continue;
        attach.add(X); nF++; break;
      }
    }
    return [];
  }
  function removeCap(c){
    caps.splice(caps.indexOf(c),1);
    for(const X of [c.P,c.Q]){ const k=(capsAt.get(X)||1)-1; if(k) capsAt.set(X,k); else { capsAt.delete(X); attach.delete(X); } }
  }
  function worstJunction(){
    const JJ = sk.filter(n=>!n.cut && n.p && (kidsOf(n).length>=2 || attach.has(n) || n.shed));
    let worst=null, wq=1;
    for(let i=0;i<JJ.length;i++) for(let j=i+1;j<JJ.length;j++){
      const d=hyp(JJ[i].x-JJ[j].x, JJ[i].y-JJ[j].y), need=2.5*MM.max(JJ[i].rf,JJ[j].rf)*1.04;
      if(d<need && d/need<wq){ wq=d/need; worst=[JJ[i],JJ[j]]; }
    }
    return worst;
  }
  computeFlows(true);
  let dirty = true;
  for(let round=0; round<14; round++){
    const un = planCaps(); dirty = false;
    if(un.length){ for(const n of un) cutBranch(n); prune(700); computeFlows(true); dirty = true; continue; }
    computeFlows(false);
    let replan = false;
    for(let guard=0; guard<300; guard++){
      const w = worstJunction(); if(!w) break;
      const extra = c => c.kind==='rung' || c.kind==='fan';
      let rung = caps.find(c=>extra(c) && (c.P===w[0]||c.Q===w[0]||c.P===w[1]||c.Q===w[1]));
      if(!rung){ // a rung further down/upstream inflates these junctions: drop it
        const under = new Set(); for(const J of w){ const st=[J]; while(st.length){ const m=st.pop(); under.add(m); for(const c of m.k) if(!c.cut) st.push(c); } }
        rung = caps.find(c=>extra(c) && (under.has(c.P) || under.has(c.Q)));
      }
      if(rung){ banned.add(rung.P.id+':'+rung.Q.id); removeCap(rung); computeFlows(false); continue; }
      const lcap = caps.find(c=>(attach.has(w[0])&&(c.P===w[0]||c.Q===w[0])) || (attach.has(w[1])&&(c.P===w[1]||c.Q===w[1])));
      if(lcap){ banned.add(lcap.P.id+':'+lcap.Q.id); replan = true; break; }
      let best=null, bl=Infinity;   // two tree junctions too close: drop the smaller side subtree (never the pre-laid frame)
      for(const J of w) for(const c of kidsOf(J)) if(c.sub < bl && !c.arc && !c.guide && !c.stem){ bl=c.sub; best=c; }
      if(!best) break;   // nothing safe to remove: the quality gate decides
      cutSub(best); prune(700);
      replan = true; break;
    }
    if(!replan){   // connectors are terminal beds: direct attachment only on vessels of near-terminal calibre
      for(const c of caps){
        const L = c.cum[c.cum.length-1];
        if((c.sA === 0 && c.P.rf > 1.45*RT[0]) || (c.sV >= L-1 && c.Q.rf > 2.2*RT[1])){ banned.add(c.P.id+':'+c.Q.id); replan = true; }
      }
    }
    if(!replan) break;
    computeFlows(false); dirty = true;
  }
  if(dirty){ planCaps(); computeFlows(false); }   // settle: whatever is still unserved is pruned with the geometry
  if(exit2) secondExit(armNodes[exit2.k], exit2.iK);

  // second exit: the arm is re-rooted between a watershed (a node with its own inflow, about half-way to
  // the outlet junction) and a plain arcade node K near iK0, from which a stem runs to the edge. The
  // watershed node is shared by both venous trees in the output. Undone if it breaks junction spacing.
  function secondExit(A, iK0){
    const topo = () => { const ord = [], seen = new Set();
      for(const r of sk) if(!r.p && !r.cut){ const st = [r]; while(st.length){ const m = st.pop(); ord.push(m); seen.add(m); for(const c of m.k) if(!c.cut) st.push(c); } }
      for(const n of sk) if(!seen.has(n)) ord.push(n); sk.length = 0; for(const n of ord) sk.push(n); };
    const JJ = sk.filter(n=>!n.cut && (kidsOf(n).length>=2 || attach.has(n)));
    let iK = -1, p2 = null;
    for(let d=0; d<=16 && iK<0; d++) for(const i of [iK0+d, iK0-d]){
      const n = A[i]; if(!n || n.cut || !A[i+1] || A[i+1].cut || kidsOf(n).length!==1 || attach.has(n)) continue;
      if(JJ.some(m=>hyp(m.x-n.x, m.y-n.y) < 1650)) continue;
      const o = outDirOf([n.x,n.y]), q = o[0] ? [o[0] > 0 ? W : 0, n.y] : [n.x, o[1] > 0 ? H : 0], L = hyp(q[0]-n.x, q[1]-n.y);
      let clear = true;
      for(const m of sk){ if(m.cut || m === n) continue;
        let t = ((m.x-n.x)*(q[0]-n.x) + (m.y-n.y)*(q[1]-n.y))/(L*L); if(t < 0.05) continue; t = MM.min(1, t);   // beyond the arcade only
        if(hyp(m.x-n.x-(q[0]-n.x)*t, m.y-n.y-(q[1]-n.y)*t) < m.rf + 750){ clear = false; break; } }
      if(clear){ iK = i; p2 = q; break; }
    }
    if(iK < 0) return;
    const inflow = n => attach.has(n) || kidsOf(n).some(c=>c!==A[A.indexOf(n)+1] && c.sub > 0);
    let w = -1;
    for(let i=MM.round(iK*0.25); i<=iK-8; i++) if(!A[i].cut && inflow(A[i]) && (w < 0 || MM.abs(i-iK/2) < MM.abs(w-iK/2))) w = i;
    if(w < 0) return;
    const save = []; for(let i=w; i<=iK; i++) save.push([A[i], A[i].p, A[i].k.slice()]);
    const drop = (n, c) => { n.k = n.k.filter(x=>x!==c); };
    drop(A[w], A[w+1]);
    for(let i=w+1; i<iK; i++){ drop(A[i], A[i+1]); A[i].p = A[i+1]; A[i+1].k.push(A[i]); }
    const K = A[iK], extra = [], add = (x, y, p, stem) => { const n = {id: sk.length, x, y, p, s: 1, g: p ? p.g + hyp(x-p.x, y-p.y) : 0, dx: 0, dy: 0, k: [], f: 0, dead: false, stem, r: 0, cut: false, j: false};
      sk.push(n); if(p) p.k.push(n); extra.push(n); return n; };
    const Ws = add(A[w].x, A[w].y, A[w+1], false); Ws.alias = A[w]; Ws.arc = true;
    const L2 = hyp(K.x-p2[0], K.y-p2[1]); let v = add(p2[0], p2[1], null, true); v.flare = 1.15;
    for(let d=S0; d<L2-S0/2; d+=S0) v = add(p2[0]+(K.x-p2[0])*d/L2, p2[1]+(K.y-p2[1])*d/L2, v, true);
    K.p = v; v.k.push(K); K.g = v.g + hyp(K.x-v.x, K.y-v.y); K.stemEnd = true; A[w].shed = true;
    topo(); computeFlows(false);
    if(worstJunction()){   // undo
      for(const n of extra) n.cut = true;
      for(const [n, p, k] of save){ n.p = p; n.k = k; }
      K.stemEnd = false; A[w].shed = false;
      topo(); computeFlows(false);
    }
  }

  // ------------------------------------------------------------------ vessel geometry
  const out = { nodes: [], edges: [] };
  const live = sk.filter(n=>!n.cut);
  const isTree = n => !n.p || kidsOf(n).length!==1 || n.shed;
  const nid = new Map();
  const nodeId = n => { if(n.alias) n = n.alias; if(nid.has(n)) return nid.get(n); const id = out.nodes.length; nid.set(n,id);
    out.nodes.push({id, x:n.x, y:n.y, type: !n.p ? (n.s===0?'inlet':'outlet') : 'junction'}); return id; };
  const newNode = (x,y) => { const id = out.nodes.length; out.nodes.push({id, x, y, type:'junction'}); return id; };
  function catmull(P){ // Catmull-Rom through P, densely sampled; idx[k] = index of P[k] in the output
    const n = P.length, res = [], idx = [0];
    if(n===2){ const L=hyp(P[1][0]-P[0][0],P[1][1]-P[0][1]), k=MM.max(2,MM.ceil(L/30)); for(let i=0;i<=k;i++) res.push([P[0][0]+(P[1][0]-P[0][0])*i/k, P[0][1]+(P[1][1]-P[0][1])*i/k]); return {pts:res, idx:[0,k]}; }
    const T = P.map((p,i)=>{ const a=P[MM.max(0,i-1)], b=P[MM.min(n-1,i+1)]; const f = (i===0||i===n-1) ? 1 : 0.5; return [(b[0]-a[0])*f, (b[1]-a[1])*f]; });
    res.push(P[0].slice());
    for(let i=0;i<n-1;i++){
      const a=P[i], b=P[i+1], ta=T[i], tb=T[i+1], L=hyp(b[0]-a[0],b[1]-a[1]), k=MM.max(2,MM.ceil(L/30));
      for(let j=1;j<=k;j++){ const t=j/k, t2=t*t, t3=t2*t, h00=2*t3-3*t2+1, h10=t3-2*t2+t, h01=-2*t3+3*t2, h11=t3-t2;
        res.push([h00*a[0]+h10*ta[0]+h01*b[0]+h11*tb[0], h00*a[1]+h10*ta[1]+h01*b[1]+h11*tb[1]]); }
      idx.push(res.length-1);
    }
    return {pts:res, idx};
  }
  function resample(D, rFn){ // D dense [x,y]; rFn(t) radius at arc fraction t -> [[x,y,r]] at <= 0.4 r
    const cum=[0]; for(let i=1;i<D.length;i++) cum.push(cum[i-1]+hyp(D[i][0]-D[i-1][0],D[i][1]-D[i-1][1]));
    const L = cum[cum.length-1]; let rmin = Infinity; for(let i=0;i<=20;i++) rmin = MM.min(rmin, rFn(i/20));
    const n = MM.max(2, MM.ceil(L/MM.min(0.45*rmin, 135))), res=[]; let k=0;
    for(let i=0;i<=n;i++){ const s=L*i/n; while(k<D.length-2 && cum[k+1]<s) k++;
      const t = cum[k+1]>cum[k] ? (s-cum[k])/(cum[k+1]-cum[k]) : 0;
      res.push([D[k][0]+(D[k+1][0]-D[k][0])*t, D[k][1]+(D[k+1][1]-D[k][1])*t, rFn(s/L)]); }
    res[0][0]=D[0][0]; res[0][1]=D[0][1]; res[n][0]=D[D.length-1][0]; res[n][1]=D[D.length-1][1];
    return res;
  }
  function fairCurvature(P){ // Laplacian fairing wherever the turn / curvature limit is violated
    const n = P.length; if(n<5) return;
    for(let it=0; it<220; it++){
      let bad = 0; const cum=[0]; for(let i=1;i<n;i++) cum.push(cum[i-1]+hyp(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
      const L = cum[n-1];
      for(let i=1;i<n-1;i++){
        const ax=P[i][0]-P[i-1][0], ay=P[i][1]-P[i-1][1], bx=P[i+1][0]-P[i][0], by=P[i+1][1]-P[i][1];
        const la=hyp(ax,ay), lb=hyp(bx,by); if(la<1e-6||lb<1e-6) continue;
        const th = MM.acos(MM.max(-1,MM.min(1,(ax*bx+ay*by)/(la*lb))));
        const R = th>1e-6 ? 0.5*(la+lb)/th : Infinity;
        const near = cum[i] < 0.6*P[0][2] || L-cum[i] < 0.6*P[n-1][2];
        if(!near && (th > 9.5*D2R || R < 1.8*P[i][2])){
          bad++;
          for(let j=MM.max(1,i-1); j<=MM.min(n-2,i+1); j++){ P[j][0] = 0.5*P[j][0]+0.25*(P[j-1][0]+P[j+1][0]); P[j][1] = 0.5*P[j][1]+0.25*(P[j-1][1]+P[j+1][1]); }
        }
      }
      if(!bad) break;
    }
  }
  const smooth = t => t*t*(3-2*t);
  for(const u of live){
    if(!isTree(u)) continue;
    for(const c of kidsOf(u)){
      const chain = [u]; let m = c; while(!isTree(m)){ chain.push(m); m = kidsOf(m)[0]; } chain.push(m);
      const cr = catmull(chain.map(q=>[q.x,q.y]));
      let startK = 0, from = u;
      for(let k=1;k<chain.length;k++){
        const q = chain[k];
        if(k < chain.length-1 && !attach.has(q)) continue;
        // radius: Murray from the flow; tapered across pass-through connector attachments (no steps)
        const re = rOfF(u.s, q.sub);
        const r0 = !from.p ? rootR(from) : from !== u ? 0.5*(rOfF(u.s, from.sub) + re) : re;
        let r1 = k < chain.length-1 ? 0.5*(re + rOfF(u.s, q.sub - (capsAt.get(q)||0))) : re;
        r1 = MM.min(r1, q.rc); const r0c = MM.min(r0, from.rc);
        const rfn = t=>r0c+(r1-r0c)*smooth(t);
        const pts = resample(cr.pts.slice(cr.idx[startK], cr.idx[k]+1), rfn); fairCurvature(pts);
        const a = nodeId(from), b = nodeId(q);
        if(u.s===0) out.edges.push({id: out.edges.length, a, b, type:'art', pts, rfn});
        else { pts.reverse(); out.edges.push({id: out.edges.length, a: b, b: a, type:'ven', pts, rfn: t=>rfn(1-t)}); }
        startK = k; from = q;
      }
    }
  }
  // connector paths: [arteriole | capillary | venule]
  const cutAt = (pts, cum, s0, s1) => { // sub-polyline of pts between arc positions s0..s1
    const res = []; const L = cum[cum.length-1];
    const at = s => { let k = 0; while(k < cum.length-2 && cum[k+1] < s) k++; const t = cum[k+1]>cum[k] ? (s-cum[k])/(cum[k+1]-cum[k]) : 0; return [pts[k][0]+(pts[k+1][0]-pts[k][0])*t, pts[k][1]+(pts[k+1][1]-pts[k][1])*t]; };
    res.push(at(s0)); for(let i=0;i<pts.length;i++) if(cum[i] > s0+1 && cum[i] < s1-1) res.push(pts[i]); res.push(at(MM.min(s1,L)));
    return res;
  };
  for(const c of caps){
    const L = c.cum[c.cum.length-1], ra = RT[0], rv = RT[1];
    let a = nodeId(c.P);
    if(c.sA > 0){ const D = cutAt(c.pts, c.cum, 0, c.sA), pts = resample(D, ()=>ra); fairCurvature(pts);
      const b = newNode(D[D.length-1][0], D[D.length-1][1]); out.edges.push({id: out.edges.length, a, b, type:'art', pts, rfn: ()=>ra}); a = b; }
    const Lc = c.sV - c.sA, rfnC = t=>capProfile(t, ra, rv, Lc);
    const Dc = cutAt(c.pts, c.cum, c.sA, c.sV), ptsC = resample(Dc, rfnC); fairCurvature(ptsC);
    let b = c.sV < L-1 ? newNode(Dc[Dc.length-1][0], Dc[Dc.length-1][1]) : nodeId(c.Q);
    out.edges.push({id: out.edges.length, a, b, type:'cap', pts: ptsC, rfn: rfnC, kind: c.kind});
    if(c.sV < L-1){ const D = cutAt(c.pts, c.cum, c.sV, L), pts = resample(D, ()=>rv); fairCurvature(pts);
      out.edges.push({id: out.edges.length, a: b, b: nodeId(c.Q), type:'ven', pts, rfn: ()=>rv}); }
  }
  const pin = () => { for(const e of out.edges){ const A=out.nodes[e.a], B=out.nodes[e.b]; e.pts[0][0]=A.x; e.pts[0][1]=A.y; e.pts[e.pts.length-1][0]=B.x; e.pts[e.pts.length-1][1]=B.y; } };
  pin();

  // ------------------------------------------------------------------ clearance repair
  // (the harness's tissue-gap rule: wall gap >= max(150, 0.6 min r) unless both points lie in the
  //  junction neighbourhood of a shared node / short connecting edge)
  function gapViolations(){
    const E = out.edges, inc = new Map(); for(const n of out.nodes) inc.set(n.id, []);
    for(const e of E){ inc.get(e.a).push(e); inc.get(e.b).push(e); const P=e.pts, cum=[0]; for(let i=1;i<P.length;i++) cum.push(cum[i-1]+hyp(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1])); e._cum=cum; e._len=cum[cum.length-1]; }
    const nRmax = new Map(); for(const n of out.nodes){ let m=0; for(const e of inc.get(n.id)){ const p = e.a===n.id ? e.pts[0] : e.pts[e.pts.length-1]; if(p[2]>m) m=p[2]; } nRmax.set(n.id,m); }
    const endArc = (e,s,nid) => (e.a===nid && e.b===nid) ? MM.min(s, e._len-s) : (e.a===nid ? s : e._len-s);
    function nearAdj(ea,tA,eb,tB){
      for(const na of [ea.a, ea.b]) for(const nb2 of [eb.a, eb.b]){
        const Ex = 3*MM.max(nRmax.get(na), nRmax.get(nb2));
        if(na===nb2){ if(endArc(ea,tA,na) < Ex && endArc(eb,tB,nb2) < Ex) return true; }
        else for(const c of inc.get(na)) if((c.a===na&&c.b===nb2)||(c.b===na&&c.a===nb2)){ if(endArc(ea,tA,na)+c._len+endArc(eb,tB,nb2) < 2*Ex) return true; }
      }
      return false;
    }
    const segs = [];
    for(const e of E){ const P=e.pts; for(let i=0;i<P.length-1;i++){
      const sg = {e,i,x0:P[i][0],y0:P[i][1],x1:P[i+1][0],y1:P[i+1][1],r0:P[i][2],r1:P[i+1][2],s0:e._cum[i],s1:e._cum[i+1]};
      sg.mx=(sg.x0+sg.x1)/2; sg.my=(sg.y0+sg.y1)/2; sg.hl=hyp(sg.x1-sg.x0,sg.y1-sg.y0)/2; sg.rm=MM.max(sg.r0,sg.r1); segs.push(sg); } }
    // broad phase on typed arrays: segment midpoints in per-cell linked lists (ascending index)
    const nS = segs.length, MX = new Float64Array(nS), MY = new Float64Array(nS), HL = new Float64Array(nS), RM = new Float64Array(nS);
    const CS = 700, gw = MM.ceil(W/CS)+4, gh = MM.ceil(H/CS)+4, head = new Int32Array(gw*gh).fill(-1), nxt = new Int32Array(nS);
    const cix = x => MM.max(0, MM.min(gw-1, MM.floor(x/CS)+2)), ciy = y => MM.max(0, MM.min(gh-1, MM.floor(y/CS)+2));
    let hlMax = 0;
    for(let i=nS-1;i>=0;i--){ const sg = segs[i]; MX[i] = sg.mx; MY[i] = sg.my; HL[i] = sg.hl; RM[i] = sg.rm; if(sg.hl > hlMax) hlMax = sg.hl;
      const k = ciy(sg.my)*gw + cix(sg.mx); nxt[i] = head[k]; head[k] = i; }
    function ssd(a,b){
      const d1x=a.x1-a.x0, d1y=a.y1-a.y0, d2x=b.x1-b.x0, d2y=b.y1-b.y0, rx=a.x0-b.x0, ry=a.y0-b.y0;
      const A=d1x*d1x+d1y*d1y, Ee=d2x*d2x+d2y*d2y, F=d2x*rx+d2y*ry; let sP, tP;
      if(A<1e-9&&Ee<1e-9){ sP=0; tP=0; } else if(A<1e-9){ sP=0; tP=MM.max(0,MM.min(1,F/Ee)); }
      else { const Cc=d1x*rx+d1y*ry; if(Ee<1e-9){ tP=0; sP=MM.max(0,MM.min(1,-Cc/A)); }
        else { const Bv=d1x*d2x+d1y*d2y, den=A*Ee-Bv*Bv; sP = den>1e-12 ? MM.max(0,MM.min(1,(Bv*F-Cc*Ee)/den)) : 0; tP=(Bv*sP+F)/Ee;
          if(tP<0){ tP=0; sP=MM.max(0,MM.min(1,-Cc/A)); } else if(tP>1){ tP=1; sP=MM.max(0,MM.min(1,(Bv-Cc)/A)); } } }
      const px=a.x0+d1x*sP, py=a.y0+d1y*sP, qx=b.x0+d2x*tP, qy=b.y0+d2y*tP; return {d:hyp(px-qx,py-qy), s:sP, t:tP, px,py,qx,qy};
    }
    const V = [];
    for(let ia=0; ia<nS; ia++){
      // each pair is examined from its thicker segment, whose reach covers the thinner one
      const ram = RM[ia], ax = MX[ia], ay = MY[ia], ahl = HL[ia], cx = cix(ax), cy = ciy(ay), reach = MM.ceil((ahl + hlMax + 2*ram + MM.max(150,0.6*ram) + 60)/CS);
      for(let gy=MM.max(0,cy-reach); gy<=MM.min(gh-1,cy+reach); gy++) for(let gx=MM.max(0,cx-reach); gx<=MM.min(gw-1,cx+reach); gx++)
        for(let ib = head[gy*gw+gx]; ib >= 0; ib = nxt[ib]){
          const rbm = RM[ib]; if(rbm > ram || (rbm === ram && ib <= ia)) continue;
          const dx = ax-MX[ib], dy = ay-MY[ib], lim = ahl + HL[ib] + ram + rbm + MM.max(150, 0.6*rbm) + 12;
          if(dx*dx+dy*dy > lim*lim) continue;
          const a = segs[ia], b = segs[ib];
          if(a.e===b.e && MM.abs(a.s0-b.s0) < 4*MM.max(a.r0,b.r0)) continue;
          const q = ssd(a,b), ra=a.r0+(a.r1-a.r0)*q.s, rb=b.r0+(b.r1-b.r0)*q.t, need=MM.max(150,0.6*MM.min(ra,rb));
          if(q.d-ra-rb >= need + 12) continue;
          const tA=a.s0+(a.s1-a.s0)*q.s, tB=b.s0+(b.s1-b.s0)*q.t;
          if(a.e!==b.e && nearAdj(a.e,tA,b.e,tB)) continue;
          V.push({a, b, q, ra, rb, deficit: need + 25 - (q.d-ra-rb)});
        }
    }
    return V;
  }
  function pushApart(V){
    const disp = new Map();
    for(const v of V){
      let ux = v.q.px-v.q.qx, uy = v.q.py-v.q.qy, l = hyp(ux,uy);
      if(l < 1e-6){ const e=v.a; ux = -(e.y1-e.y0); uy = (e.x1-e.x0); l = hyp(ux,uy)||1; }
      ux/=l; uy/=l;
      const wa = v.rb/(v.ra+v.rb), wb = v.ra/(v.ra+v.rb);
      for(const [sg, sgn, w, par] of [[v.a, 1, wa, v.q.s], [v.b, -1, wb, v.q.t]]){
        const e = sg.e, P = e.pts, n = P.length; let D = disp.get(e); if(!D){ D = new Float64Array(2*n); disp.set(e,D); }
        const c = sg.i + par, sig = MM.max(2.5, 1.4*P[MM.min(n-1,sg.i)][2]/MM.max(1,(e._len/(n-1))));
        const r0 = P[0][2], r1 = P[n-1][2];
        for(let k=MM.max(1,MM.floor(c-3*sig)); k<=MM.min(n-2,MM.ceil(c+3*sig)); k++){
          const fade = MM.min(1, e._cum[k]/r0, (e._len-e._cum[k])/r1);
          const zz = (k-c)/sig, wk = MM.exp(-zz*zz)*fade*w*v.deficit*sgn;
          D[2*k] += ux*wk; D[2*k+1] += uy*wk;
        }
      }
    }
    for(const [e,D] of disp){ const P=e.pts; for(let k=1;k<P.length-1;k++){ const mx=D[2*k], my=D[2*k+1], ml=hyp(mx,my), f = ml>160 ? 160/ml : 1; P[k][0]+=mx*f; P[k][1]+=my*f; }
      fairCurvature(P);
      let bad=false; for(let k=1;k<P.length;k++) if(hyp(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]) > MM.min(0.47*MM.min(P[k][2],P[k-1][2]),140)) { bad=true; break; }
      if(bad){ const np = resample(P.map(q=>[q[0],q[1]]), e.rfn); fairCurvature(np); e.pts = np; }
    }
  }
  let viol = gapViolations(), bestN = viol.length, stall = 0;
  for(let it=0; it<12 && viol.length; it++){
    pushApart(viol); pin(); viol = gapViolations();
    if(viol.length < bestN){ bestN = viol.length; stall = 0; } else if(++stall >= 2) break;
  }
  // keep only edges on an inlet -> outlet path (following the flow)
  const pathPrune = list => { let E = list;
    for(let rep=0; rep<60; rep++){
      const fwd = new Set(), bwd = new Set(), outA = new Map(), inB = new Map();
      for(const e of E){ (outA.get(e.a)||outA.set(e.a,[]).get(e.a)).push(e); (inB.get(e.b)||inB.set(e.b,[]).get(e.b)).push(e); }
      const st1 = out.nodes.filter(n=>n.type==='inlet').map(n=>n.id); st1.forEach(i=>fwd.add(i));
      while(st1.length){ const u=st1.pop(); for(const e of (outA.get(u)||[])) if(!fwd.has(e.b)){ fwd.add(e.b); st1.push(e.b); } }
      const st2 = out.nodes.filter(n=>n.type==='outlet').map(n=>n.id); st2.forEach(i=>bwd.add(i));
      while(st2.length){ const u=st2.pop(); for(const e of (inB.get(u)||[])) if(!bwd.has(e.a)){ bwd.add(e.a); st2.push(e.a); } }
      const keep = E.filter(e=>fwd.has(e.a) && bwd.has(e.b));
      if(keep.length === E.length) break; E = keep;
    }
    return E; };
  // fallback: drop connectors that still violate, then keep only edges on an inlet -> outlet path
  if(viol.length){
    const drop = new Set();
    for(const v of viol){ const c = v.a.e.type==='cap' ? v.a.e : v.b.e.type==='cap' ? v.b.e : (v.a.e.pts[0][2] < v.b.e.pts[0][2] ? v.a.e : v.b.e); drop.add(c); }
    out.edges = out.edges.filter(e=>!drop.has(e));
  }
  out.edges = pathPrune(out.edges);
  if(viol.length) viol = gapViolations();
  // slivers: a pocket too thin or small for a horde (inscribed radius < 450 um or < 0.8 mm2) loses a
  // connector on its rim (extra loops first), as long as the map keeps its connectors and coverage
  let tis = null;   // tissue raster of the final edges, reused by the quality gate
  for(let pass=0; pass<2 && !viol.length; pass++){
    const T = tis || tissue(out.edges, W, H, 100, true), sl = new Set(); tis = T;
    T.pockets.forEach((p,i)=>{ if(!p.edge && p.area > 0.01 && (p.inR < 500 || p.area < 0.85)) sl.add(i); });
    if(!sl.size) break;
    const capE = out.edges.filter(e=>e.type==='cap'); if(capE.length <= 18) break;
    const pick = new Map();   // sliver pocket -> [rank, cap edge]
    for(const e of capE){ const P = e.pts, rank = e.kind==='rung' ? 0 : e.kind==='fan' ? 1 : 2;
      for(let k=1;k<P.length-1;k+=2){ const tx = P[k+1][0]-P[k-1][0], ty = P[k+1][1]-P[k-1][1], l = hyp(tx,ty)||1, off = P[k][2]+75;
        for(const sg of [1,-1]){ const i = MM.floor((P[k][0]-ty/l*off*sg)/T.cs), j = MM.floor((P[k][1]+tx/l*off*sg)/T.cs);
          if(i<0 || j<0 || i>=T.gw || j>=T.gh) continue; const lb = T.lab[j*T.gw+i];
          if(sl.has(lb) && (!pick.has(lb) || pick.get(lb)[0] > rank)) pick.set(lb, [rank, e]); } } }
    // a terminal's only connector goes only for a really small pocket (its twig is pruned with it);
    // extra loops first, smallest pockets first, and the map keeps at least 18 connectors
    const order = [...pick].filter(([lb, [rank]]) => rank < 2 || T.pockets[lb].area < 0.35 || T.pockets[lb].inR < 320)
      .sort((u,v)=> u[1][0]-v[1][0] || T.pockets[u[0]].area - T.pockets[v[0]].area);
    const drop = new Set(); for(const [, [, e]] of order) if(capE.length - drop.size > 18) drop.add(e);
    if(!drop.size) break;
    const E2 = pathPrune(out.edges.filter(e=>!drop.has(e)));
    if(E2.filter(e=>e.type==='cap').length < 18) break;
    const T2 = tissue(E2, W, H, 100, true);
    if(maxVoid(T2, W, H)[0] > 3150) break;
    out.edges = E2; tis = T2;
  }
  // compact ids
  const used = new Set(); for(const e of out.edges){ used.add(e.a); used.add(e.b); }
  const remap = new Map(), nodes = [];
  for(const n of out.nodes) if(used.has(n.id)){ remap.set(n.id, nodes.length); nodes.push({id: nodes.length, x:n.x, y:n.y, type:n.type}); }
  const edges = out.edges.map((e,i)=>({id:i, a:remap.get(e.a), b:remap.get(e.b), type:e.type, pts:e.pts.map(p=>[p[0],p[1],p[2]])}));
  return { tis, net: { bounds:{x0:0,y0:0,x1:W,y1:H}, nodes, edges, meta:{ name:'colonize' } }, gapLeft: viol.length };
}

// ============================================================================ quality gate
// largest tissue distance (same sampling as the harness: 110 columns), connector / loop counts,
// connector length and the hard geometric rules; an attempt that misses the bar is retried.
function assess(res, W, H){
  const net = res.net, E = net.edges, N = net.nodes;
  const q = { ok: true, why: [] };
  const fail = w => { q.ok = false; q.why.push(w); };
  if(res.gapLeft) fail('gap');
  const deg = new Map(); for(const n of N) deg.set(n.id, 0);
  for(const e of E){ deg.set(e.a, deg.get(e.a)+1); deg.set(e.b, deg.get(e.b)+1); }
  q.caps = E.filter(e=>e.type==='cap').length;
  q.loops = E.length - N.length + 1;
  const need = MM.max(8, MM.round(16*MM.min(1, W*H/(22000*14000))));   // 16 connectors on the default map, fewer on smaller ones
  if(q.caps < need) fail('caps'); if(q.loops < need-2) fail('loops');
  // geometry: spacing, turn, curvature, cap length
  const nodeR = new Map();
  let capLen = 0;
  for(const e of E){
    const P = e.pts, n = P.length, cum = [0];
    for(let i=1;i<n;i++) cum.push(cum[i-1]+hyp(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    const L = cum[n-1]; if(e.type==='cap' && L > capLen) capLen = L;
    for(let i=1;i<n;i++){ const s = cum[i]-cum[i-1]; if(s > 0.5*MM.max(P[i][2],P[i-1][2]) || s > 150){ fail('spacing'); break; } }
    for(let i=1;i<n-1;i++){
      if(cum[i] < 1.5*P[0][2] || L-cum[i] < 1.5*P[n-1][2]) continue;
      const ax=P[i][0]-P[i-1][0], ay=P[i][1]-P[i-1][1], bx=P[i+1][0]-P[i][0], by=P[i+1][1]-P[i][1], la=hyp(ax,ay), lb=hyp(bx,by);
      if(la<1e-6||lb<1e-6) continue;
      const th = MM.acos(MM.max(-1,MM.min(1,(ax*bx+ay*by)/(la*lb))));
      if(th > 11.5*D2R || (th > 1e-4 && 0.5*(la+lb)/th < 1.55*P[i][2])){ fail('curv'); break; }
    }
    for(const [id,p] of [[e.a,P[0]],[e.b,P[n-1]]]) nodeR.set(id, MM.max(nodeR.get(id)||0, p[2]));
  }
  q.capLen = capLen; if(capLen > 2100) fail('capLen');
  const J = N.filter(n=>deg.get(n.id)>=3);
  for(let i=0;i<J.length;i++) for(let k=i+1;k<J.length;k++)
    if(hyp(J[i].x-J[k].x, J[i].y-J[k].y) < 2.5*MM.max(nodeR.get(J[i].id), nodeR.get(J[k].id))*1.01) fail('jspace');
  for(const n of N) if(deg.get(n.id)===1 && n.type==='junction') fail('dead');
  // connectors are terminal beds: the vessels they leave / join stay near terminal calibre, and every
  // node of degree 4+ carries a connector
  const inc = new Map(); for(const n of N) inc.set(n.id, []);
  for(const e of E){ inc.get(e.a).push(e); inc.get(e.b).push(e); }
  const host = [[],[]];
  for(const e of E) if(e.type==='cap') for(const id of [e.a, e.b]) for(const f of inc.get(id)) if(f.type!=='cap')
    host[f.type==='art'?0:1].push(f.a===id ? f.pts[0][2] : f.pts[f.pts.length-1][2]);
  for(const [s,lim] of [[0,1.55],[1,2.4]]){ const v = host[s].slice().sort((a,b)=>a-b); if(v.length && v[v.length-1] > lim*v[v.length>>1]) fail('host'); }
  for(const n of N){ const l = inc.get(n.id); if(l.length >= 4 && !l.some(e=>e.type==='cap')) fail('deg4'); }
  // largest void (100 um raster)
  const [mv, vat] = maxVoid(res.tis || tissue(E, W, H, 100, false), W, H); q.voidAt = vat;
  q.maxVoid = mv; if(mv > 3150) fail('void');
  q.score = (q.ok ? 1e6 : 0) - q.why.length*1e4 - MM.max(0, mv-3150) + q.caps*10;
  return q;
}

function generate(seed, opts){
  opts = opts || {};
  const W = opts.width || 22000, H = opts.height || 14000;
  let best = null;
  for(let k=0; k<4; k++){
    const s = ((seed|0)*2654435761 ^ 0x5bd1e995 ^ MM.imul(k, 0x9e3779b9)) | 0;
    const res = build(s, W, H), q = assess(res, W, H);
    res.net.meta = { name: 'colonize', notes: 'arterial hub and recurrent fingers grown by two-species space colonization inside a venous arcade', attempt: k,
      quality: { ok: q.ok, connectors: q.caps, loops: q.loops, maxVoidUm: MM.round(q.maxVoid) } };
    if(q.ok) return res.net;
    if(!best || q.score > best.q.score) best = { net: res.net, q };
  }
  return best.net;
}

const BV = window.BV = window.BV || {};
const GEN = BV.GENERATORS = BV.GENERATORS || {}; const INFO = BV.GENERATOR_INFO = BV.GENERATOR_INFO || {};
GEN['colonize'] = generate; INFO['colonize'] = { label: 'Hub and arcade', blurb: 'an arterial star in the middle, ringed by a venous arcade that reaches in between its fingers' };
if (window.GENERATORS) window.GENERATORS['colonize'] = generate;   // prototype harness
})();
