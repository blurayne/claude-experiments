/* ============================================================================
   HORDE — 'anatomic' map style (cortical surface)
   ----------------------------------------------------------------------------
   generate(seed, opts) → { bounds, nodes, edges, meta } in µm, y down (see net.js);
   opts.width / opts.height (default 22000 × 14000).

   1. Arterial tree. One trunk enters high on the left edge. The tissue domain
      is split recursively into angular territories. At each fork the parent
      arrives along the r²-weighted mean of its children's directions, so the
      thinner child deflects more and the angles follow Murray's law. Children
      do not reach back for tissue beside their parent, so branches never cross.
      Terminal branches run through their territory and end at a tip.
   2. Venous tree. Tips are drained farthest-first by routes grown on a 125 µm
      clearance grid (16-neighbour Dijkstra). A route leaves straight ahead of
      its tip, follows the ridges between arteries, keeps off other veins, never
      doubles back near its start, and joins the tree with the flow (a Y, not a
      T). Up to three secondary exits open where that is cheaper.
   3. Connectors. The first stretch of each route becomes the tip's capillary
      connector (≤ 2 mm, pinched to ~120 µm). Connectors that would hook back
      with their venule are rejected, and a tip without one tries the side of a
      nearby thin vein. Unfed venous branches are pruned.
   4. Assembly. Dead ends are pruned, radii follow Murray's law from the flows
      (veins anchored at the main outlet, at most 1.25× their arteries), forks
      and confluences are steered to Murray angles, vessels are pushed apart,
      and a self-check mirroring the SPEC constraints repairs (push apart, then
      drop the offending connector) until the network is valid.
   The map is mirrored by seed so the inlet corner varies. If a map misses the
   quality bar (largest void, loops, connectors), up to two more deterministic
   attempts are made and the best one is kept.
   ========================================================================== */
(function(){
'use strict';

// ------------------------------------------------------------------ math helpers
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const hyp = (x,y) => Math.sqrt(x*x+y*y);
const clamp = (v,a,b) => v<a ? a : v>b ? b : v;
function norm(x,y){ const l=Math.sqrt(x*x+y*y)||1; return [x/l,y/l]; }
function rot(d,a){ const c=Math.cos(a), s=Math.sin(a); return [d[0]*c-d[1]*s, d[0]*s+d[1]*c]; }
const angle = (u,v) => Math.acos(clamp(u[0]*v[0]+u[1]*v[1],-1,1));
const cross = (u,v) => u[0]*v[1]-u[1]*v[0];
const bump = t => { const u=t*(1-t); return 16*u*u; };     // zero value and slope at both ends
// Murray-optimal deflections of two children from the parent axis (cube law, minimum volume)
function murrayAngles(r0,r1,r2){
  const a=r0*r0, b=r1*r1, c=r2*r2;
  return [Math.acos(clamp((a*a+b*b-c*c)/(2*a*b),-1,1)), Math.acos(clamp((a*a+c*c-b*b)/(2*a*c),-1,1))];
}
// cubic Hermite polyline P0→P1 with unit tangents T0/T1 scaled by m0/m1
function hermite(P0,T0,P1,T1,m0,m1,n){
  const out=[];
  for(let i=0;i<=n;i++){ const t=i/n, t2=t*t, t3=t2*t;
    const h00=2*t3-3*t2+1, h10=t3-2*t2+t, h01=-2*t3+3*t2, h11=t3-t2;
    out.push([h00*P0[0]+h10*m0*T0[0]+h01*P1[0]+h11*m1*T1[0], h00*P0[1]+h10*m0*T0[1]+h01*P1[1]+h11*m1*T1[1]]); }
  return out;
}
function arcs(P){ const c=new Float64Array(P.length); for(let i=1;i<P.length;i++) c[i]=c[i-1]+hyp(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]); return c; }
const polyLen = P => { const c=arcs(P); return c[c.length-1]; };
// point at arc length s: [x, y, segment index]
function at(P,c,s){ let lo=0, hi=P.length-1; if(s<=0) return [P[0][0],P[0][1],0]; if(s>=c[hi]) return [P[hi][0],P[hi][1],hi-1];
  while(hi-lo>1){ const m=(lo+hi)>>1; if(c[m]<=s) lo=m; else hi=m; } const u=(s-c[lo])/((c[hi]-c[lo])||1);
  return [P[lo][0]+(P[hi][0]-P[lo][0])*u, P[lo][1]+(P[hi][1]-P[lo][1])*u, lo]; }
function tanAt(P,c,s){ const L=c[c.length-1]; const a=at(P,c,Math.max(0,s-120)), b=at(P,c,Math.min(L,s+120)); return norm(b[0]-a[0],b[1]-a[1]); }
// resample a [x,y,r] polyline so that every step is ≤ stepFn(local r); r interpolated along arc length
function resample(P, stepFn){
  const cum=arcs(P), L=cum[cum.length-1]; let seg=0;
  const pt=s=>{ while(seg>0 && cum[seg]>s) seg--; while(seg<P.length-2 && cum[seg+1]<s) seg++;
    const a=P[seg], b=P[seg+1], u=cum[seg+1]>cum[seg]?(s-cum[seg])/(cum[seg+1]-cum[seg]):0;
    return [a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u, a[2]+(b[2]-a[2])*u]; };
  const M=Math.max(4,Math.ceil(L/15)), U=new Float64Array(M+1);
  for(let i=1;i<=M;i++) U[i]=U[i-1]+(L/M)/stepFn(pt(L*(i-0.5)/M)[2]);
  const n=Math.max(1,Math.ceil(U[M]*1.0001)), out=[]; let j=0; seg=0;
  for(let q=0;q<=n;q++){ const u=U[M]*q/n; while(j<M-1 && U[j+1]<u) j++; const f=U[j+1]>U[j]?(u-U[j])/(U[j+1]-U[j]):0; out.push(pt(Math.min(L,(j+f)*L/M))); }
  out[0]=P[0].slice(); out[n]=P[P.length-1].slice();
  return out;
}
const withR = (P,r) => P.map(p=>[p[0],p[1],r]);
// Laplacian smoothing of a polyline (ends fixed)
function smooth(P, passes, keep){
  const k=keep||1;
  for(let pass=0;pass<passes;pass++){ const Q=P.map(p=>p.slice());
    for(let i=k;i<P.length-k;i++){ Q[i][0]=0.5*P[i][0]+0.25*(P[i-1][0]+P[i+1][0]); Q[i][1]=0.5*P[i][1]+0.25*(P[i-1][1]+P[i+1][1]); }
    P=Q; }
  return P;
}
// [net signed, total unsigned] turning of a polyline (radians)
function turning(P){ let t=0, u=0; for(let i=2;i<P.length;i++){ const a=[P[i-1][0]-P[i-2][0],P[i-1][1]-P[i-2][1]], b=[P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]];
  const th=Math.atan2(cross(a,b), a[0]*b[0]+a[1]*b[1]); t+=th; u+=Math.abs(th); } return [t,u]; }

// ------------------------------------------------------------------ arterial spacing relaxation
// G: {nodes, edges:[{a,b,P:[[x,y,r]], fixA}]}. Pushes non-local points apart to desired(p,q), Laplacian smoothing,
// domain(x,y) → push vector. Junction ends move rigidly with their node so forks keep their shape.
function relaxArteries(G, iters, desired, domain){
  const SP=220, LAM=0.22, MU=0.4, EXEMPT=1.9, CS=1000;
  for(const e of G.edges){ const A=G.nodes[e.a], B=G.nodes[e.b]; e.P[0][0]=A.x; e.P[0][1]=A.y; const l=e.P[e.P.length-1]; l[0]=B.x; l[1]=B.y; }
  for(let it=0; it<iters; it++){
    if(it%4===0) for(const e of G.edges){ const L=polyLen(e.P), n=Math.max(2,Math.round(L/SP)); if(n!==e.P.length-1) e.P=resample(e.P,()=>L/n*1.0005); }
    for(const e of G.edges){ const n=e.P.length; e.cum=arcs(e.P); e.len=e.cum[n-1]; e.dx=new Float64Array(n); e.dy=new Float64Array(n); e.dw=new Float64Array(n); }
    const hash=new Map();
    G.edges.forEach((e,ei)=>e.P.forEach((p,i)=>{ const k=((p[0]/CS)|0)*100003+((p[1]/CS)|0); let a=hash.get(k); if(!a){a=[];hash.set(k,a);} a.push(ei,i); }));
    G.edges.forEach((e,ei)=>{ const P=e.P;
      for(let i=0;i<P.length;i++){ const p=P[i], gx=(p[0]/CS)|0, gy=(p[1]/CS)|0;
        for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){ const a=hash.get((gx+dx)*100003+gy+dy); if(!a) continue;
          for(let t=0;t<a.length;t+=2){ const fj=a[t], j=a[t+1]; if(fj<ei || (fj===ei && j<=i)) continue;
            const f=G.edges[fj], q=f.P[j], vx=p[0]-q[0], vy=p[1]-q[1], d=Math.sqrt(vx*vx+vy*vy), D=desired(p,q);
            if(d>=D) continue;
            if(fj===ei){ if(Math.abs(e.cum[i]-e.cum[j])<2.2*D) continue; }
            else { let skip=false;
              for(const na of [e.a,e.b]) for(const nb of [f.a,f.b]) if(na===nb){ const sa=na===e.a?e.cum[i]:e.len-e.cum[i], sb=nb===f.a?f.cum[j]:f.len-f.cum[j]; if(sa+sb<EXEMPT*D) skip=true; }
              if(skip) continue; }
            const m=MU*(D-d)*0.5/(d||1);
            e.dx[i]+=vx*m; e.dy[i]+=vy*m; e.dw[i]+=1; f.dx[j]-=vx*m; f.dy[j]-=vy*m; f.dw[j]+=1;
          } } } });
    for(const e of G.edges){ const P=e.P, n=P.length;
      for(let i=0;i<n;i++) if(e.dw[i]>1){ const w=1/Math.sqrt(e.dw[i]); e.dx[i]*=w; e.dy[i]*=w; }
      for(let i=1;i<n-1;i++){ e.dx[i]+=LAM*((P[i-1][0]+P[i+1][0])/2-P[i][0]); e.dy[i]+=LAM*((P[i-1][1]+P[i+1][1])/2-P[i][1]); }
      for(let i=0;i<n;i++){ const g=domain(P[i][0],P[i][1]); if(g){ e.dx[i]+=g[0]; e.dy[i]+=g[1]; } } }
    moveNodesAndEdges(G, null);
  }
}
// shared by both relaxations: move nodes by the mean endpoint displacement, then interior points: those within
// 1.6 r + 150 (or rigB) of a node move rigidly with it, the rest follow both nodes (interpolated) plus their own
// forces; points within fixA / fixB µm of the ends stay put
function moveNodesAndEdges(G, nd){
  if(!nd){ nd=new Map(); for(const e of G.edges){ const n=e.P.length;
    for(const [id,i] of [[e.a,0],[e.b,n-1]]){ let s=nd.get(id); if(!s){s=[0,0,0];nd.set(id,s);} s[0]+=e.dx[i]; s[1]+=e.dy[i]; s[2]+=1; } } }
  const disp=new Map();
  for(const [id,s] of nd){ const N=G.nodes[id]; if(N.fixed){ disp.set(id,[0,0]); continue; } const dx=s[0]/s[2], dy=s[1]/s[2]; N.x+=dx; N.y+=dy; disp.set(id,[dx,dy]); }
  for(const e of G.edges){ const P=e.P, n=P.length, fa=e.fixA||0, fb=e.fixB||0;
    const rigA=1.6*P[0][2]+150, rigB=Math.max(1.6*P[n-1][2]+150,e.rigB||0), dA=disp.get(e.a)||[0,0], dB=disp.get(e.b)||[0,0], cum=arcs(P), L=cum[n-1];
    for(let i=1;i<n-1;i++){ if(cum[i]<=fa || L-cum[i]<=fb) continue;
      if(cum[i]<rigA){ P[i][0]+=dA[0]; P[i][1]+=dA[1]; } else if(L-cum[i]<rigB){ P[i][0]+=dB[0]; P[i][1]+=dB[1]; }
      else { const u=(cum[i]-rigA)/Math.max(1,L-rigA-rigB); P[i][0]+=e.dx[i]+dA[0]*(1-u)+dB[0]*u; P[i][1]+=e.dy[i]+dA[1]*(1-u)+dB[1]*u; } }
    if(G.W) for(let i=1;i<n-1;i++){ if(cum[i]<=fa || L-cum[i]<=fb) continue; const m=P[i][2]; P[i][0]=clamp(P[i][0],m,G.W-m); P[i][1]=clamp(P[i][1],m,G.H-m); }
    P[0][0]=G.nodes[e.a].x; P[0][1]=G.nodes[e.a].y; P[n-1][0]=G.nodes[e.b].x; P[n-1][1]=G.nodes[e.b].y; }
}

// ------------------------------------------------------------------ joint relaxation (all vessels)
// Pushes vessels that are not adjacent near a shared junction apart to the SPEC tissue gap + margin,
// pushes junction nodes apart to 2.5 r_max + 120, keeps points inside the map.
function relaxJoint(G, iters, margin, W, H){
  const SP=280, LAM=0.12, MU=0.7, C2=500;
  const pairE=new Map();
  G.edges.forEach((e,k)=>{ const key=Math.min(e.a,e.b)*100003+Math.max(e.a,e.b); if(!pairE.has(key)) pairE.set(key,k); });
  const relCache=new Map();
  for(let it=0; it<iters; it++){
    if(it%3===0) for(const e of G.edges){ const L=polyLen(e.P), n=Math.max(2,Math.round(L/SP)); if(n!==e.P.length-1) e.P=resample(e.P,()=>L/n*1.0005); }
    for(const e of G.edges){ const n=e.P.length; e.cum=arcs(e.P); e.len=e.cum[n-1]; e.dx=new Float64Array(n); e.dy=new Float64Array(n); e.dw=new Float64Array(n); }
    const nodeR=new Map(); for(const e of G.edges){ const r0=e.P[0][2], r1=e.P[e.P.length-1][2]; if(!(nodeR.get(e.a)>=r0)) nodeR.set(e.a,r0); if(!(nodeR.get(e.b)>=r1)) nodeR.set(e.b,r1); }
    // flat point arrays in a uniform grid (counting sort); each pair is examined from its larger-radius point
    let NP=0; for(const e of G.edges) NP+=e.P.length;
    const X=new Float64Array(NP), Y=new Float64Array(NP), RR=new Float64Array(NP), EI=new Int32Array(NP), PI=new Int32Array(NP);
    { let k=0; G.edges.forEach((e,ei)=>{ for(let i=0;i<e.P.length;i++){ const p=e.P[i]; X[k]=p[0]; Y[k]=p[1]; RR[k]=p[2]; EI[k]=ei; PI[k]=i; k++; } }); }
    const GX=Math.ceil(W/C2)+3, GY=Math.ceil(H/C2)+3;
    const cst=new Int32Array(GX*GY+1), cit=new Int32Array(NP), cc=new Int32Array(NP);
    for(let k=0;k<NP;k++){ const gx=clamp(Math.floor(X[k]/C2)+1,0,GX-1), gy=clamp(Math.floor(Y[k]/C2)+1,0,GY-1); cc[k]=gy*GX+gx; cst[cc[k]+1]++; }
    for(let c=0;c<GX*GY;c++) cst[c+1]+=cst[c];
    { const fill=cst.slice(0,GX*GY); for(let k=0;k<NP;k++) cit[fill[cc[k]]++]=k; }
    const arcTo=(e,i,n)=> n===e.a ? e.cum[i] : e.len-e.cum[i];
    for(let pk=0; pk<NP; pk++){ const rp=RR[pk], px=X[pk], py=Y[pk], reach=2*rp+Math.max(150,0.6*rp)+margin+5;
      const gx0=Math.max(0,Math.floor((px-reach)/C2)+1), gx1=Math.min(GX-1,Math.floor((px+reach)/C2)+1), gy0=Math.max(0,Math.floor((py-reach)/C2)+1), gy1=Math.min(GY-1,Math.floor((py+reach)/C2)+1);
      const ei=EI[pk], i=PI[pk], e=G.edges[ei];
      for(let gy=gy0;gy<=gy1;gy++) for(let gx=gx0;gx<=gx1;gx++){ const c=gy*GX+gx;
        for(let u=cst[c];u<cst[c+1];u++){ const qk=cit[u], rq=RR[qk]; if(rq>rp || (rq===rp && qk<=pk)) continue;
          const vx=px-X[qk], vy=py-Y[qk], d2=vx*vx+vy*vy, need=rp+rq+Math.max(150,0.6*rq)+margin; if(d2>=need*need) continue;
          const fj=EI[qk], j=PI[qk], f=G.edges[fj];
          if(fj===ei){ if(Math.abs(e.cum[i]-e.cum[j])<4*rp+2*SP) continue; }
          else { const lo=Math.min(ei,fj), hi=Math.max(ei,fj); let rel=relCache.get(lo*8192+hi);
            if(rel===undefined){ rel=[]; const A=G.edges[lo], B=G.edges[hi];
              for(const na of [A.a,A.b]) for(const nb of [B.a,B.b]){ if(na===nb) rel.push(na,nb,-1); else { const ck=pairE.get(Math.min(na,nb)*100003+Math.max(na,nb)); if(ck!==undefined && ck!==lo && ck!==hi) rel.push(na,nb,ck); } }
              relCache.set(lo*8192+hi,rel); }
            const EA=lo===ei?e:f, ia=lo===ei?i:j, EB=lo===ei?f:e, ib=lo===ei?j:i;
            let skip=false;
            for(let r=0;r<rel.length;r+=3){ const na=rel[r], nb=rel[r+1], ck=rel[r+2], Ex=3*Math.max(nodeR.get(na)||0,nodeR.get(nb)||0);
              if(ck<0){ if(arcTo(EA,ia,na)<Ex && arcTo(EB,ib,nb)<Ex){ skip=true; break; } }
              else if(arcTo(EA,ia,na)+G.edges[ck].len+arcTo(EB,ib,nb)<2*Ex){ skip=true; break; } }
            if(skip) continue; }
          const d=Math.sqrt(d2), m=MU*(need-d)*0.5/(d||1);
          e.dx[i]+=vx*m; e.dy[i]+=vy*m; e.dw[i]+=1; f.dx[j]-=vx*m; f.dy[j]-=vy*m; f.dw[j]+=1;
        } } }
    for(const e of G.edges){ const P=e.P, n=P.length;
      for(let i=0;i<n;i++) if(e.dw[i]>1){ const w=1/Math.sqrt(e.dw[i]); e.dx[i]*=w; e.dy[i]*=w; }
      for(let i=1;i<n-1;i++){ e.dx[i]+=LAM*((P[i-1][0]+P[i+1][0])/2-P[i][0]); e.dy[i]+=LAM*((P[i-1][1]+P[i+1][1])/2-P[i][1]); }
      for(let i=0;i<n;i++){ const r=P[i][2]+60, x=P[i][0], y=P[i][1];
        if(x<r) e.dx[i]+=(r-x)*0.3; if(x>W-r) e.dx[i]-=(x-(W-r))*0.3; if(y<r) e.dy[i]+=(r-y)*0.3; if(y>H-r) e.dy[i]-=(y-(H-r))*0.3; } }
    const nd=new Map();
    for(const e of G.edges){ const n=e.P.length;
      for(const [id,i] of [[e.a,0],[e.b,n-1]]){ let s=nd.get(id); if(!s){s=[0,0,0];nd.set(id,s);} s[0]+=e.dx[i]; s[1]+=e.dy[i]; s[2]+=1; } }
    { const J=[]; for(const [id,s] of nd) if(s[2]>=3) J.push(id);
      for(let a=0;a<J.length;a++) for(let b=a+1;b<J.length;b++){ const A=G.nodes[J[a]], B=G.nodes[J[b]], need=2.5*Math.max(nodeR.get(J[a]),nodeR.get(J[b]))+120;
        const vx=A.x-B.x, vy=A.y-B.y, d2=vx*vx+vy*vy; if(d2>=need*need) continue; const d=Math.sqrt(d2)||1, m=0.4*(need-d)/d;
        const sa=nd.get(J[a]), sb=nd.get(J[b]); sa[0]+=vx*m*sa[2]; sa[1]+=vy*m*sa[2]; sb[0]-=vx*m*sb[2]; sb[1]-=vy*m*sb[2]; } }
    moveNodesAndEdges(G, nd);
  }
}

// ------------------------------------------------------------------ self-check (mirrors the SPEC hard constraints)
// nodes: [{x,y}] by id; E: [{a,b,pts}]; only: optional Set of edge indices to test against everything.
// Returns [{kind:'curv'|'spacing'|'jspace'|'gap'|'cross', ea, eb, na, nb, pa, pb, deficit}]
function checkNet(nodes, E, only){
  const out=[];
  const inc=new Map(); E.forEach((e,k)=>{ for(const n of [e.a,e.b]){ if(!inc.has(n)) inc.set(n,[]); inc.get(n).push(k); } });
  for(const e of E){ e._c=arcs(e.pts); e._L=e._c[e.pts.length-1]; }
  E.forEach((e,k)=>{ if(only && !only.has(k)) return; const P=e.pts, c=e._c, L=e._L, exA=1.5*P[0][2], exB=1.5*P[P.length-1][2];
    for(let i=1;i<P.length-1;i++){ const ax=P[i][0]-P[i-1][0], ay=P[i][1]-P[i-1][1], bx=P[i+1][0]-P[i][0], by=P[i+1][1]-P[i][1];
      const la=Math.sqrt(ax*ax+ay*ay), lb=Math.sqrt(bx*bx+by*by); if(la<1e-6||lb<1e-6) continue;
      if(c[i]<exA || L-c[i]<exB) continue;
      const th=Math.acos(clamp((ax*bx+ay*by)/(la*lb),-1,1));
      if(th>12*Math.PI/180 || (th>1e-4 && 0.5*(la+lb)/th<1.5*P[i][2])){ out.push({kind:'curv',ea:k}); break; } }
    for(let i=1;i<P.length;i++){ const st=c[i]-c[i-1]; if(st>0.5*Math.max(P[i][2],P[i-1][2])+1e-6 || st>150.001){ out.push({kind:'spacing',ea:k}); break; } } });
  const nodeR=new Map(); for(const e of E){ const r0=e.pts[0][2], r1=e.pts[e.pts.length-1][2]; if(!(nodeR.get(e.a)>=r0)) nodeR.set(e.a,r0); if(!(nodeR.get(e.b)>=r1)) nodeR.set(e.b,r1); }
  const J=[...inc.keys()].filter(n=>inc.get(n).length>=3);
  for(let i=0;i<J.length;i++) for(let k=i+1;k<J.length;k++){ const A=nodes[J[i]], B=nodes[J[k]];
    if(hyp(A.x-B.x,A.y-B.y)<2.5*Math.max(nodeR.get(J[i]),nodeR.get(J[k]))) out.push({kind:'jspace',na:J[i],nb:J[k]}); }
  // gaps / crossings: segments grouped in chunks of 8 (bounding circles) on a grid; exact tests only for close chunks
  const segs=[];
  E.forEach((e,k)=>{ const P=e.pts; for(let i=0;i<P.length-1;i++){ const g={k,x0:P[i][0],y0:P[i][1],x1:P[i+1][0],y1:P[i+1][1],r0:P[i][2],r1:P[i+1][2],s0:e._c[i],s1:e._c[i+1]};
    g.mx=(g.x0+g.x1)/2; g.my=(g.y0+g.y1)/2; g.rm=Math.max(g.r0,g.r1); g.hl=hyp(g.x1-g.x0,g.y1-g.y0)/2; segs.push(g); } });
  const NS=segs.length;
  const endArc=(e,s,n)=>{ if(e.a===n&&e.b===n) return Math.min(s,e._L-s); return e.a===n?s:e._L-s; };
  function nearAdj(ka,tA,kb,tB){ const ea=E[ka], eb=E[kb];
    for(const na of [ea.a,ea.b]) for(const nb of [eb.a,eb.b]){ const Ex=3*Math.max(nodeR.get(na),nodeR.get(nb));
      if(na===nb){ if(endArc(ea,tA,na)<Ex && endArc(eb,tB,nb)<Ex) return true; }
      else for(const ck of inc.get(na)){ const c=E[ck]; if((c.a===na&&c.b===nb)||(c.b===na&&c.a===nb)){ if(endArc(ea,tA,na)+c._L+endArc(eb,tB,nb)<2*Ex) return true; } } }
    return false; }
  function ssd(a,b){ const d1x=a.x1-a.x0,d1y=a.y1-a.y0,d2x=b.x1-b.x0,d2y=b.y1-b.y0,rx=a.x0-b.x0,ry=a.y0-b.y0; const A=d1x*d1x+d1y*d1y,Ee=d2x*d2x+d2y*d2y,F=d2x*rx+d2y*ry; let s,t;
    if(A<1e-9&&Ee<1e-9){s=0;t=0;} else if(A<1e-9){s=0;t=clamp(F/Ee,0,1);} else { const C=d1x*rx+d1y*ry; if(Ee<1e-9){t=0;s=clamp(-C/A,0,1);} else { const Bv=d1x*d2x+d1y*d2y,den=A*Ee-Bv*Bv; s=den>1e-12?clamp((Bv*F-C*Ee)/den,0,1):0; t=(Bv*s+F)/Ee; if(t<0){t=0;s=clamp(-C/A,0,1);} else if(t>1){t=1;s=clamp((Bv-C)/A,0,1);} } }
    return {d:hyp(a.x0+d1x*s-b.x0-d2x*t, a.y0+d1y*s-b.y0-d2y*t), s, t}; }
  function crosses(a,b){ const o=(ax,ay,bx,by,cx,cy)=>(bx-ax)*(cy-ay)-(by-ay)*(cx-ax); const d1=o(a.x0,a.y0,a.x1,a.y1,b.x0,b.y0),d2=o(a.x0,a.y0,a.x1,a.y1,b.x1,b.y1),d3=o(b.x0,b.y0,b.x1,b.y1,a.x0,a.y0),d4=o(b.x0,b.y0,b.x1,b.y1,a.x1,a.y1); return ((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0)); }
  const pairSeen=new Set();
  function testPair(a,b){
    if(a.k===b.k && Math.abs(a.s0-b.s0)<4*Math.max(a.r0,b.r0)) return;
    const dmx=a.mx-b.mx, dmy=a.my-b.my, lim=a.hl+b.hl+a.rm+b.rm+Math.max(150,0.6*Math.min(a.rm,b.rm))+1; if(dmx*dmx+dmy*dmy>lim*lim) return;
    const q=ssd(a,b), ra=a.r0+(a.r1-a.r0)*q.s, rb=b.r0+(b.r1-b.r0)*q.t, need=Math.max(150,0.6*Math.min(ra,rb));
    if(q.d-ra-rb>=need) return;
    if(a.k!==b.k && nearAdj(a.k,a.s0+(a.s1-a.s0)*q.s,b.k,b.s0+(b.s1-b.s0)*q.t)) return;
    const key=Math.min(a.k,b.k)*100000+Math.max(a.k,b.k); if(pairSeen.has(key)) return; pairSeen.add(key);
    out.push({kind:(a.k!==b.k&&crosses(a,b))?'cross':'gap', ea:a.k, eb:b.k, pa:[a.x0+(a.x1-a.x0)*q.s, a.y0+(a.y1-a.y0)*q.s], pb:[b.x0+(b.x1-b.x0)*q.t, b.y0+(b.y1-b.y0)*q.t], deficit:need-(q.d-ra-rb)});
  }
  const CH=[]; { let q=0; while(q<NS){ const k=segs[q].k; let q2=q; while(q2<NS && segs[q2].k===k && q2-q<8) q2++;
      let cx=0,cy=0; for(let u=q;u<q2;u++){ cx+=segs[u].mx; cy+=segs[u].my; } cx/=(q2-q); cy/=(q2-q);
      let rho=0, rm=0; for(let u=q;u<q2;u++){ const g=segs[u]; rho=Math.max(rho,hyp(g.x0-cx,g.y0-cy),hyp(g.x1-cx,g.y1-cy)); rm=Math.max(rm,g.rm); }
      CH.push({q0:q,q1:q2,cx,cy,rho,rm,k}); q=q2; } }
  const NCH=CH.length, CC=800; let maxRho=0, maxRm=0, mnx=1e9, mny=1e9, mxx=-1e9, mxy=-1e9;
  for(const c of CH){ maxRho=Math.max(maxRho,c.rho); maxRm=Math.max(maxRm,c.rm); mnx=Math.min(mnx,c.cx); mny=Math.min(mny,c.cy); mxx=Math.max(mxx,c.cx); mxy=Math.max(mxy,c.cy); }
  const CGX=Math.floor((mxx-mnx)/CC)+1, CGY=Math.floor((mxy-mny)/CC)+1;
  const ccs=new Int32Array(CGX*CGY+1), cci=new Int32Array(NCH), ccc=new Int32Array(NCH);
  for(let q=0;q<NCH;q++){ ccc[q]=Math.floor((CH[q].cy-mny)/CC)*CGX+Math.floor((CH[q].cx-mnx)/CC); ccs[ccc[q]+1]++; }
  for(let c=0;c<CGX*CGY;c++) ccs[c+1]+=ccs[c];
  { const fill=ccs.slice(0,CGX*CGY); for(let q=0;q<NCH;q++) cci[fill[ccc[q]]++]=q; }
  for(let ia=0; ia<NCH; ia++){ const A=CH[ia]; if(only && !only.has(A.k)) continue;
    const reach=A.rho+maxRho+A.rm+(only?maxRm:A.rm)+Math.max(150,0.6*(only?maxRm:A.rm))+2;
    const gx0=Math.max(0,Math.floor((A.cx-reach-mnx)/CC)), gx1=Math.min(CGX-1,Math.floor((A.cx+reach-mnx)/CC)), gy0=Math.max(0,Math.floor((A.cy-reach-mny)/CC)), gy1=Math.min(CGY-1,Math.floor((A.cy+reach-mny)/CC));
    for(let gy=gy0;gy<=gy1;gy++) for(let gx=gx0;gx<=gx1;gx++){ const c=gy*CGX+gx;
      for(let u=ccs[c];u<ccs[c+1];u++){ const ib=cci[u]; if(ib===ia) continue; const B=CH[ib];
        if(only){ if(only.has(B.k) && ib<ia) continue; } else if(B.rm>A.rm || (B.rm===A.rm && ib<ia)) continue;
        const dx=A.cx-B.cx, dy=A.cy-B.cy, lim=A.rho+B.rho+A.rm+B.rm+Math.max(150,0.6*Math.min(A.rm,B.rm))+1; if(dx*dx+dy*dy>lim*lim) continue;
        for(let qa=A.q0;qa<A.q1;qa++) for(let qb=B.q0;qb<B.q1;qb++) testPair(segs[qa],segs[qb]);
      } } }
  return out;
}

// ------------------------------------------------------------------ quality of a finished map
// largest distance from any point of the map to a vessel wall (exact Euclidean distance transform on a 200 µm raster)
function edt1(f, n, d, v, z){   // Felzenszwalb 1-D squared distance transform (in place of d)
  let k=0; v[0]=0; z[0]=-Infinity; z[1]=Infinity;
  for(let q=1;q<n;q++){ let s; while(true){ const p=v[k]; s=((f[q]+q*q)-(f[p]+p*p))/(2*q-2*p); if(s<=z[k]){ k--; if(k<0) break; } else break; }
    k++; v[k]=q; z[k]=s; z[k+1]=Infinity; }
  k=0; for(let q=0;q<n;q++){ while(z[k+1]<q) k++; const p=v[k]; d[q]=(q-p)*(q-p)+f[p]; }
}
function mapQuality(net){
  const B=net.bounds, W=B.x1-B.x0, H=B.y1-B.y0, CS=200, gx=Math.ceil(W/CS), gy=Math.ceil(H/CS), BIG=1e12;
  const g=new Float64Array(gx*gy).fill(BIG);
  for(const e of net.edges) for(let i=1;i<e.pts.length;i++){ const a=e.pts[i-1], b=e.pts[i], rm=Math.max(a[2],b[2]);
    const i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-rm-B.x0)/CS)), i1=Math.min(gx-1,Math.floor((Math.max(a[0],b[0])+rm-B.x0)/CS));
    const j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-rm-B.y0)/CS)), j1=Math.min(gy-1,Math.floor((Math.max(a[1],b[1])+rm-B.y0)/CS));
    const vx=b[0]-a[0], vy=b[1]-a[1], L2=vx*vx+vy*vy;
    for(let j=j0;j<=j1;j++) for(let i2=i0;i2<=i1;i2++){ const x=B.x0+(i2+0.5)*CS, y=B.y0+(j+0.5)*CS, t=L2>0?clamp(((x-a[0])*vx+(y-a[1])*vy)/L2,0,1):0;
      if(hyp(x-a[0]-vx*t,y-a[1]-vy*t)<=a[2]+(b[2]-a[2])*t) g[j*gx+i2]=0; } }
  const n=Math.max(gx,gy), f=new Float64Array(n), d=new Float64Array(n), v=new Int32Array(n), z=new Float64Array(n+1);
  for(let i=0;i<gx;i++){ for(let j=0;j<gy;j++) f[j]=g[j*gx+i]; edt1(f,gy,d,v,z); for(let j=0;j<gy;j++) g[j*gx+i]=d[j]; }
  let m=0; for(let j=0;j<gy;j++){ for(let i=0;i<gx;i++) f[i]=g[j*gx+i]; edt1(f,gx,d,v,z); for(let i=0;i<gx;i++) if(d[i]>m) m=d[i]; }
  return { maxVoid: Math.sqrt(m)*CS-CS*0.5, loops: net.edges.length-net.nodes.length+1, caps: net.edges.filter(e=>e.type==='cap').length };
}

// a few deterministic attempts; the first one that meets the quality bar wins, otherwise the best of them
function generate(seed, opts){
  opts = opts || {};
  const A=clamp((opts.width||22000)*(opts.height||14000)/(22000*14000),0.4,2);   // the bar scales with the map area
  let best=null;
  for(let attempt=0; attempt<(A>1.4?2:3); attempt++){
    const net=build(seed, attempt, opts), q=mapQuality(net);
    q.score=(net.meta.valid?0:-1e6) - Math.max(0,q.maxVoid-3120) + 150*Math.min(0,q.loops-Math.round(15*A)) + 100*Math.min(0,q.caps-Math.round(18*A));
    net.meta.stats.attempt=attempt;
    if(q.score>=0) return net;
    if(!best || q.score>best.q.score) best={net,q};
  }
  return best.net;
}

function build(seed, attempt, opts){
  const W = opts.width || 22000, H = opts.height || 14000;
  const orient = mulberry32((seed|0)*7919 + 17), rng = mulberry32((seed|0)*9973 + 12345 + attempt*104729);
  const R = (a,b) => a+(b-a)*rng();
  const GAMMA = 2.8;
  const flipX = orient()<0.5, flipY = orient()<0.5;        // applied to the finished map
  const RA = R(670,710), RV = R(790,830);                // arterial inlet / main venous outlet radius
  // venous calibre for flow q (in drained connectors): Murray law anchored at the main outlet (≈ RV), but never more
  // than VRATIO × the arterial calibre of the same flow, so veins stay a little wider than their arteries
  const VRATIO=1.25;
  const venR=(q,Qin,Qmain)=>clamp(Math.min(RV*Math.pow(q/Qmain,1/GAMMA), VRATIO*RA*Math.pow(q/Qin,1/GAMMA)),160,RV);
  const nodes=[];
  const addNode=(x,y,type)=>{ const n={id:nodes.length,x,y,type:type||'junction'}; nodes.push(n); return n; };

  // ================================================================== 1. layout
  // canonical frame: the artery enters high on the left edge, the main vein leaves the bottom edge near the right corner
  const yin = H*R(0.10,0.15);
  const OX = W-R(1900,2600), OY = H;
  const inlet = addNode(0, yin, 'inlet');
  const UAX = norm(OX, OY-yin);                          // overall flow axis
  const proj = (x,y) => x*UAX[0]+(y-yin)*UAX[1];
  const M_T=800, M_L=1150, M_B=1250, M_R=1200;           // arterial domain margins
  const HILUM_L=4600, HILUM_W=1500;                      // corridor kept free for the venous trunk above the outlet
  const hilumHalf = y => HILUM_W*(0.55+0.45*(y-(H-HILUM_L))/HILUM_L);
  const topM=x=>M_T+700*clamp((0.55*W-x)/(0.15*W),0,1);  // top margin: wider over the left half (a drainage corridor)
  function inArtDomain(x,y){
    const mb=M_B*(0.75+0.6*x/W), mr=M_R*(0.7+0.7*y/H);
    if(y<topM(x) || y>H-mb || x>W-mr || x<M_L) return false;
    if(x<0.3*W && y<yin+300) return false;             // nothing behind/above the inlet trunk
    if(y>H-HILUM_L && Math.abs(x-OX)<hilumHalf(y)) return false;
    return true;
  }
  const TG=420, tissue=[];
  for(let y=TG/2;y<H;y+=TG) for(let x=TG/2;x<W;x+=TG){ const px=x+(rng()-0.5)*TG*0.8, py=y+(rng()-0.5)*TG*0.8; if(inArtDomain(px,py)) tissue.push([px,py]); }
  const K = Math.round(R(25,29)*clamp(W*H/(22000*14000),0.6,1.8));   // arterial terminal count
  const rOfK = k => RA*Math.pow(k/K,1/GAMMA);

  // ================================================================== 2. arterial tree (recursive territory split)
  const aEdges=[];
  // Hermite centreline with gentle tortuosity; a fork's parent ends in a straight run along its arrival direction
  function makeEdge(nA, nB, d0, d1, k, wig, tail){
    const P0=[nA.x,nA.y], P1=[nB.x,nB.y], Q=tail?[P1[0]-d1[0]*tail, P1[1]-d1[1]*tail]:P1;
    const L=hyp(Q[0]-P0[0],Q[1]-P0[1]), n=Math.max(8,Math.ceil(L/60)), ch0=norm(Q[0]-P0[0],Q[1]-P0[1]);
    const m=L*clamp(0.9-0.35*Math.max(angle(d0,ch0),angle(d1,ch0)),0.45,0.9);   // softer tangents when the ends turn a lot: no loops
    const poly=hermite(P0,d0,Q,d1,m,m,n);
    const amp=wig*L, ch=norm(Q[0]-P0[0],Q[1]-P0[1]);
    for(let i=1;i<n;i++){ const t=i/n, b=bump(t)*amp*Math.sin(Math.PI*t); poly[i][0]-=ch[1]*b; poly[i][1]+=ch[0]*b; }
    if(tail){ const m=Math.max(2,Math.ceil(tail/60)); for(let i=1;i<=m;i++) poly.push([Q[0]+(P1[0]-Q[0])*i/m, Q[1]+(P1[1]-Q[1])*i/m]); }
    const e={a:nA.id,b:nB.id,k,r:rOfK(k),poly,rigB:tail?tail+150:0}; aEdges.push(e); return e;
  }
  function sideOfSpine(spine, p){   // which side of the ancestor path a point lies on (+1/-1)
    let best=Infinity, sd=1;
    for(let i=1;i<spine.length;i++){ const a=spine[i-1], b=spine[i], vx=b[0]-a[0], vy=b[1]-a[1], L2=vx*vx+vy*vy||1;
      const t=clamp(((p[0]-a[0])*vx+(p[1]-a[1])*vy)/L2,0,1), qx=a[0]+vx*t, qy=a[1]+vy*t, d=hyp(p[0]-qx,p[1]-qy);
      if(d<best){ best=d; sd=(vx*(p[1]-qy)-vy*(p[0]-qx))>=0?1:-1; } }
    return sd;
  }
  function trimSpine(sp){ let L=0, i=sp.length-1; while(i>0 && L<9000){ L+=hyp(sp[i][0]-sp[i-1][0],sp[i][1]-sp[i-1][1]); i--; } return sp.slice(Math.max(0,i)).filter((_,j,a)=>j%3===0||j===a.length-1); }
  function grow(nodeP, d0, pts, k, rPar, spine){
    const P0=[nodeP.x,nodeP.y], r=rOfK(k);
    let cx=0, cy=0; for(const p of pts){ cx+=p[0]; cy+=p[1]; } const c=[cx/pts.length, cy/pts.length];
    if(k===1 || pts.length<6){   // terminal: run through the territory, tip a little beyond its centroid
      let T=[P0[0]+(c[0]-P0[0])*1.12, P0[1]+(c[1]-P0[1])*1.12];
      T=[clamp(T[0],M_L+r,W-M_R-r), clamp(T[1],M_T+r,H-M_B-r)];
      const Lmin=Math.max(1400, 2.5*rPar*1.1+300);
      const dd=norm(T[0]-P0[0],T[1]-P0[1]);
      if(hyp(T[0]-P0[0],T[1]-P0[1])<Lmin) T=[P0[0]+dd[0]*Lmin, P0[1]+dd[1]*Lmin];
      const tip=addNode(T[0],T[1]), d1=norm(dd[0]*0.5+d0[0]*0.3+UAX[0]*0.3, dd[1]*0.5+d0[1]*0.3+UAX[1]*0.3);   // tips lean toward the drainage
      makeEdge(nodeP, tip, d0, d1, 1, R(-0.05,0.05)); tip.aTip=true;
      return;
    }
    const dc=hyp(c[0]-P0[0],c[1]-P0[1]), toC=norm(c[0]-P0[0],c[1]-P0[1]);
    const Lmin=2.5*Math.max(rPar,r)*1.12+150;
    const dirJ=norm(d0[0]+toC[0], d0[1]+toC[1]);
    const kCand=[...new Set([1,2,3,Math.round(k/4),Math.round(k/3),Math.round(k*0.42),Math.floor(k/2)].filter(v=>v>=1&&v<=k-1))];
    const n=pts.length, spineT=trimSpine(spine);
    const ideal=m=>Math.sqrt(m*TG*TG/(2*Math.PI));
    let best=null;
    const Ls=nodeP===inlet ? [Lmin*1.5, Lmin*1.85, Lmin*2.2] : [Lmin, Lmin*1.5, Math.max(Lmin*1.2,0.3*dc)];
    // three passes, each only if the previous found nothing: gentle parent arcs; sharper ones; heading straight for the territory
    for(let pass=0; pass<3 && !best; pass++) for(const [L,rd] of pass<2 ? Ls.map(L=>[L,0]) : [[Lmin,0.6],[Lmin,-0.6],[Lmin,1.2],[Lmin,-1.2],[Lmin*1.3,0.6],[Lmin*1.3,-0.6]]) for(const rotJ of n<150?[0]:[0,-0.28,0.28]){
      const turnMax=pass?2.3:1.6, dJ0=rot(dirJ,rd), J=[P0[0]+dJ0[0]*L, P0[1]+dJ0[1]*L];
      if(pass===2 && !inArtDomain(J[0],J[1])) continue;
      let ax=norm(c[0]-J[0],c[1]-J[1]); ax=rot(norm(ax[0]*0.6+dJ0[0]*0.4, ax[1]*0.6+dJ0[1]*0.4), rotJ);   // sort axis
      const sp=spineT.concat(hermite(P0,d0,J,ax,L*0.9,L*0.9,10));
      // points sorted by angle around J (behind J: by the side of the ancestor path)
      const ang=new Float64Array(n);
      for(let i=0;i<n;i++){ const vx=pts[i][0]-J[0], vy=pts[i][1]-J[1]; let a=Math.atan2(ax[0]*vy-ax[1]*vx, ax[0]*vx+ax[1]*vy);
        if(Math.abs(a)>1.9) a=Math.abs(a)*sideOfSpine(sp,pts[i]); ang[i]=a; }
      const keys=new Float64Array(n); for(let i=0;i<n;i++) keys[i]=Math.round((ang[i]+4)*1e6)*8192+i; keys.sort();
      const idx=new Array(n); for(let i=0;i<n;i++) idx[i]=keys[i]%8192;
      const Sx=new Float64Array(n+1), Sy=new Float64Array(n+1), Sxx=new Float64Array(n+1), Sb=new Float64Array(n+1), pJ=proj(J[0],J[1]);
      for(let t=0;t<n;t++){ const p=pts[idx[t]], x=p[0]-J[0], y=p[1]-J[1]; Sx[t+1]=Sx[t]+x; Sy[t+1]=Sy[t]+y; Sxx[t+1]=Sxx[t]+x*x+y*y; Sb[t+1]=Sb[t]+(proj(p[0],p[1])<pJ-250?1:0); }
      const stat=(a,b)=>{ const m=b-a, sx=(Sx[b]-Sx[a])/m, sy=(Sy[b]-Sy[a])/m; return {x:sx+J[0], y:sy+J[1], u:norm(sx,sy), spr:Math.sqrt(Math.max((Sxx[b]-Sxx[a])/m-sx*sx-sy*sy,1)), m, beh:(Sb[b]-Sb[a])/m}; };
      for(const k1 of kCand) for(const smallFirst of [true,false]){
        const kA=smallFirst?k1:k-k1, kB=k-kA, n1=Math.round(n*kA/k); if(n1<3||n-n1<3) continue;
        const sA=stat(0,n1), sB=stat(n1,n), rA=rOfK(kA), rB=rOfK(kB);
        // the parent arrives along the r²-weighted mean of the children's directions (force balance)
        const dJ=norm(rA*rA*sA.u[0]+rB*rB*sB.u[0], rA*rA*sA.u[1]+rB*rB*sB.u[1]);
        const dfA=angle(sA.u,dJ), dfB=angle(sB.u,dJ);
        if(dfA>(pass<2?1.5:1.7) || dfB>(pass<2?1.5:1.7)) continue;                       // no retrograde child
        const turn=angle(d0,dJ), Lh=L-Math.min(0.4*L,2*r);
        if(turn>turnMax) continue;
        const bend=Math.max(0,turn*2.5*r/Lh-1);                                // the parent arc stays gentle (R ≥ 2.5 r)
        const [thA,thB]=murrayAngles(r,rA,rB);
        // a child that will fork again needs its territory beyond its own first junction
        const near=(kk,st)=>{ if(kk<2) return 0; const need=1.3*(2.5*r*1.12+150), d=hyp(st.x-J[0],st.y-J[1]); return Math.max(0,(need-d)/need); };
        const comp=(kA*sA.spr/ideal(sA.m)+kB*sB.spr/ideal(sB.m))/k;
        const cost=comp + 0.8*(Math.abs(dfA-thA)+Math.abs(dfB-thB)) + 3*Math.max(0,dfA+dfB-1.9) + 8*(Math.max(0,dfA-1.3)+Math.max(0,dfB-1.3))
          + 5*(sA.beh*kA+sB.beh*kB)/k + 0.25*Math.abs(kA-kB)/k + 0.4*Math.max(0,turn-0.7) + 2*bend + 3*(near(kA,sA)+near(kB,sB))
          + 0.08*L/Lmin + 0.12*Math.abs(rotJ) + 0.15*rng();
        if(!best || cost<best.cost) best={cost,J,dJ,ax,kA,kB,rA,rB,thA,thB,dfA,dfB,uA:sA.u,
          idx, n1, cutAng:(ang[idx[n1-1]]+ang[idx[n1]])/2};
      }
    }
    if(!best) return grow(nodeP,d0,pts,1,rPar,spine);
    best.A=best.idx.slice(0,best.n1).map(i=>pts[i]); best.B=best.idx.slice(best.n1).map(i=>pts[i]);
    // the parent arrives along dJ; where its arc allows, its last stretch runs straight along dJ
    const J=best.J, dJ=best.dJ, chd=norm(J[0]-P0[0],J[1]-P0[1]), Ltot=hyp(J[0]-P0[0],J[1]-P0[1]);
    const tail=cross(d0,chd)*cross(chd,dJ)>=0 && angle(chd,dJ)<0.6 ? Math.min(0.3*Ltot,1.5*r) : 0;
    const nJ=addNode(J[0],J[1]);
    const pe=makeEdge(nodeP,nJ,d0,dJ,k,R(-0.05,0.05),tail);
    // children leave at (mostly) Murray angles on their own side of the parent axis; the thinner one deflects more
    const dev=(kk,th,df)=>kk===1 ? clamp(0.3*th+0.7*df,0.3,1.4) : clamp(0.75*th+0.25*df,0.3,1.2);   // a terminal heads for its territory
    let defA=dev(best.kA,best.thA,best.dfA), defB=dev(best.kB,best.thB,best.dfB);
    if(best.rA<best.rB) defA=Math.max(defA,defB); else if(best.rB<best.rA) defB=Math.max(defB,defA);
    if(defA+defB>1.9){ const f=1.9/(defA+defB); defA*=f; defB*=f; }   // children at most ~110° apart
    const sgA=cross(dJ,best.uA)>=0?1:-1;
    const tA=rot(dJ,sgA*defA), tB=rot(dJ,-sgA*defB);
    // reserve a venous corridor along the cut between the two territories
    if(k>=5){ const dcut=rot(best.ax,best.cutAng), rvE=RV*Math.pow(k/K,1/GAMMA)*0.85, wMax=rvE+380, wMin=260, ramp=5200;
      const keep=p=>{ const vx=p[0]-J[0], vy=p[1]-J[1], t=vx*dcut[0]+vy*dcut[1], d=t>0?Math.abs(vx*dcut[1]-vy*dcut[0]):hyp(vx,vy); return d>=wMin+(wMax-wMin)*clamp(t/ramp,0,1); };
      const A2=best.A.filter(keep), B2=best.B.filter(keep); if(A2.length>=6) best.A=A2; if(B2.length>=6) best.B=B2; }
    // tissue right beside the parent vessel is served by it: children do not reach back for it
    { const near=p=>{ if((p[0]-J[0])*dJ[0]+(p[1]-J[1])*dJ[1]>0) return false;
        for(let i=0;i<pe.poly.length;i+=2){ const q=pe.poly[i]; if((p[0]-q[0])*(p[0]-q[0])+(p[1]-q[1])*(p[1]-q[1])<(r+500)*(r+500)) return true; } return false; };
      const A2=best.A.filter(p=>!near(p)), B2=best.B.filter(p=>!near(p)); if(A2.length>=6) best.A=A2; if(B2.length>=6) best.B=B2; }
    const spC=trimSpine(spine.concat(pe.poly));
    grow(nJ, tA, best.A, best.kA, r, spC);
    grow(nJ, tB, best.B, best.kB, r, spC);
  }
  grow(inlet, [1,0], tissue, K, 0, [[-3000,yin],[0,yin]]);

  // arterial spacing relaxation: leave room for a vein between neighbouring branches
  inlet.fixed=true;
  const GA={nodes, edges:aEdges.map(e=>({a:e.a,b:e.b,k:e.k,r:e.r,P:withR(e.poly,e.r),rigB:e.rigB,fixA:e.a===inlet.id?800:0}))};
  const veinAllow=rm=>2*Math.max(150,0.6*rm)+2.2*rm+250;
  relaxArteries(GA, 5, (p,q)=>p[2]+q[2]+veinAllow(Math.min(p[2],q[2])), (x,y)=>{ let gx=0, gy=0; const m=0.85;
    { const tp=200+topM(x); if(y<tp) gy+=(tp-y)*0.3; } if(y>H-M_B*m) gy-=(y-(H-M_B*m))*0.3; if(x>W-M_R*m) gx-=(x-(W-M_R*m))*0.3; if(x<M_L*0.6) gx+=(M_L*0.6-x)*0.3;
    if(y>H-HILUM_L){ const hw=hilumHalf(y)*0.9, dx=x-OX; if(Math.abs(dx)<hw) gx+=(dx>=0?1:-1)*(hw-Math.abs(dx))*0.3; }
    return (gx||gy)?[gx,gy]:null; });
  const art=GA.edges;
  const aIn=new Map(); for(const e of art) aIn.set(e.b,e);

  // ================================================================== 3. clearance grid (distance to arterial walls)
  const h=125, nx=Math.ceil(W/h), ny=Math.ceil(H/h), NC=nx*ny, CMAX=1800;
  const cx=c=>(c%nx+0.5)*h, cy=c=>(((c/nx)|0)+0.5)*h;
  const cellOf=(x,y)=>clamp(Math.floor(y/h),0,ny-1)*nx+clamp(Math.floor(x/h),0,nx-1);
  const fAt=(F,x,y)=>F[cellOf(x,y)];
  function stampSeg(F, ax,ay,ar,bx,by,br,maxD){
    const pad=maxD+Math.max(ar,br);
    const i0=Math.max(0,Math.floor((Math.min(ax,bx)-pad)/h)), i1=Math.min(nx-1,Math.floor((Math.max(ax,bx)+pad)/h));
    const j0=Math.max(0,Math.floor((Math.min(ay,by)-pad)/h)), j1=Math.min(ny-1,Math.floor((Math.max(ay,by)+pad)/h));
    const vx=bx-ax, vy=by-ay, L2=vx*vx+vy*vy||1e-9;
    for(let j=j0;j<=j1;j++){ const y=(j+0.5)*h; for(let i=i0;i<=i1;i++){ const x=(i+0.5)*h;
      const t=clamp(((x-ax)*vx+(y-ay)*vy)/L2,0,1), ex=x-ax-vx*t, ey=y-ay-vy*t, rr=ar+(br-ar)*t, k=j*nx+i, g=F[k]+rr, e2=ex*ex+ey*ey;
      if(e2>=g*g) continue; const d=Math.sqrt(e2)-rr; if(d<F[k]) F[k]=d; } }
  }
  function stampPoly(F,P,maxD){ const Q=resample(P,()=>300); for(let i=1;i<Q.length;i++) stampSeg(F,Q[i-1][0],Q[i-1][1],Q[i-1][2],Q[i][0],Q[i][1],Q[i][2],maxD); }
  const clr=new Float32Array(NC).fill(CMAX);
  for(const e of art) stampPoly(clr,e.P,CMAX);
  const clrAt=(x,y)=>clr[cellOf(x,y)];
  const edgeD=(x,y)=>Math.min(x,W-x,y,H-y);
  // venous routing clearance: arteries and the map edge; the confluence above the main outlet is entered from above
  const vclr=new Float32Array(NC);
  for(let c=0;c<NC;c++){ const x=cx(c), y=cy(c); vclr[c]=Math.min(clr[c], (edgeD(x,y)-60)*1.3);
    if(y>H-1550 && Math.abs(x-OX)<2200 && !(Math.abs(x-OX)<60 && y<H-1340)) vclr[c]=-1; }

  // ================================================================== 4. venous routing: a tree grown from the outlet on the grid
  const outlet=addNode(OX, OY, 'outlet');
  const dn=new Int32Array(NC).fill(-2);      // -2: not in the tree; -1: root (outlet stub / exit); else downstream cell
  const up=new Uint8Array(NC);               // upstream count
  const cnt=new Float32Array(NC);            // leaves drained
  const joinBlock=new Uint8Array(NC);
  const vNear=new Float32Array(NC).fill(1e9);
  const stubHead=cellOf(OX, OY-1400);
  dn[stubHead]=-1;
  const rV=u=>venR(u,K,0.65*K);   // routing-time estimate (the main outlet drains about 2/3 of the tips)
  function stampVein(c){ const ci=c%nx, cj=(c/nx)|0, Rr=Math.ceil(1150/h);
    for(let dj=-Rr;dj<=Rr;dj++) for(let di=-Rr;di<=Rr;di++){ const i=ci+di, j=cj+dj; if(i<0||j<0||i>=nx||j>=ny) continue; const d=Math.sqrt(di*di+dj*dj)*h, k=j*nx+i; if(d<vNear[k]) vNear[k]=d; } }
  function blockDisk(c, rad){ const ci=c%nx, cj=(c/nx)|0, Rr=Math.ceil(rad/h);
    for(let dj=-Rr;dj<=Rr;dj++) for(let di=-Rr;di<=Rr;di++){ const i=ci+di, j=cj+dj; if(i<0||j<0||i>=nx||j>=ny) continue; if(Math.sqrt(di*di+dj*dj)*h<=rad) joinBlock[j*nx+i]=1; } }
  stampVein(stubHead);
  // secondary exits: at most three, well away from the inlet, on the top, right or bottom edge
  const exits=[], MAXEXIT=3, EXITCOST=5200;
  function exitCapable(c){ const x=cx(c), y=cy(c);
    if(y<650 && x>0.4*W && x<W-1800) return [x,0,0,-1];
    if(y>H-650 && x>2500 && x<OX-5000) return [x,H,0,1];
    if(x>W-650 && y>1800 && y<H-3500) return [W,y,1,0];
    return null; }
  const farFromExits=(x,y)=>hyp(OX-x,OY-y)>=5000 && exits.every(e=>hyp(e.x-x,e.y-y)>=5500);
  // Dijkstra state
  const dist=new Float64Array(NC), prev=new Int32Array(NC), seen=new Int32Array(NC), done=new Int32Array(NC), org=new Int32Array(NC); let stamp=0;
  const sdx=new Float32Array(NC), sdy=new Float32Array(NC);   // preferred start direction of a source cell
  let heapK=new Float64Array(NC*4), heapV=new Int32Array(NC*4), hn=0;
  function hpush(k,v){ if(hn>=heapK.length){ const k2=new Float64Array(heapK.length*2), v2=new Int32Array(heapK.length*2); k2.set(heapK); v2.set(heapV); heapK=k2; heapV=v2; }
    let i=hn++; while(i>0){ const p=(i-1)>>1; if(heapK[p]<=k) break; heapK[i]=heapK[p]; heapV[i]=heapV[p]; i=p; } heapK[i]=k; heapV[i]=v; }
  function hpop(){ const v=heapV[0], k=heapK[--hn], vv=heapV[hn]; let i=0;
    while(true){ let c=2*i+1; if(c>=hn) break; if(c+1<hn && heapK[c+1]<heapK[c]) c++; if(heapK[c]>=k) break; heapK[i]=heapK[c]; heapV[i]=heapV[c]; i=c; }
    heapK[i]=k; heapV[i]=vv; return v; }
  // 16-neighbourhood; knight moves carry their two intermediate cells
  const NB=[];
  for(let di=-2;di<=2;di++) for(let dj=-2;dj<=2;dj++){ const a=Math.abs(di), b=Math.abs(dj); if(!(a+b) || a+b>3 || (a===2&&b!==1) || (b===2&&a!==1)) continue;
    const sx=Math.sign(di), sy=Math.sign(dj), L=Math.sqrt(di*di+dj*dj);
    NB.push({di,dj,L,ux:di/L,uy:dj/L,knight:a+b===3, i1:a===2?[sx,0]:[0,sy], i2:[sx,sy]}); }
  const CMIN=330; let C0=650;
  // cost per µm of a free cell: cheapest on the clearance ridges between arteries, dear next to an existing vein
  const wCache=new Float32Array(NC), wStamp=new Int32Array(NC);
  function cellCost(k){ if(wStamp[k]===stamp) return wCache[k]; wStamp[k]=stamp;
    const c=vclr[k]; let w=Infinity;
    if(c>=CMIN){ w=1+(C0/c)*(C0/c); const vn=vNear[k]; if(vn<1100) w*=vn<500?5:(vn<800?2.5:1.5); }
    wCache[k]=w; return w; }
  const rootDir=c=>{ if(c===stubHead) return [0,1]; const ex=exits.find(e=>e.cell===c); return ex?ex.n:[0,1]; };
  function joinPenalty(u, v){   // tributaries should meet the tree with the flow (a Y, not a T or a hook)
    let b=u; for(let s=0;s<3;s++){ const p=prev[b]; if(p<0) break; b=p; }
    const a=norm(cx(v)-cx(b), cy(v)-cy(b));
    let f=v; for(let s=0;s<6;s++){ const d=dn[f]; if(d<0) break; f=d; }
    const t=f===v ? rootDir(v) : norm(cx(f)-cx(v), cy(f)-cy(v));
    return 2500*Math.max(0, angle(a,t)-1);
  }
  function tracePath(end){
    const rev=[]; for(let c=end;c!==-1;c=prev[c]) rev.push(c); rev.reverse();
    const path=[rev[0]];
    for(let k=1;k<rev.length;k++){ const a=rev[k-1], b=rev[k], ai=a%nx, aj=(a/nx)|0, di=b%nx-ai, dj=((b/nx)|0)-aj;
      if(Math.abs(di)+Math.abs(dj)===3){ const sx=Math.sign(di), sy=Math.sign(dj);
        const i1=Math.abs(di)===2 ? aj*nx+ai+sx : (aj+sy)*nx+ai, i2=(aj+sy)*nx+ai+sx;
        path.push(vclr[i1]>=vclr[i2]?i1:i2); }
      path.push(b); }
    return path;
  }
  // srcs: [[cell, initial cost, start direction]]: within 700 µm of its source a vein keeps within ~65° of that direction,
  // and it (almost) never doubles back within 1.5 mm
  function route(srcs){
    stamp++; hn=0;
    for(const [c,k,d] of srcs){ if(seen[c]===stamp && dist[c]<=k) continue; seen[c]=stamp; dist[c]=k; prev[c]=-1; org[c]=c; sdx[c]=d[0]; sdy[c]=d[1]; hpush(k,c); }
    while(hn){ const u0=hpop();
      if(u0<0){ const path=tracePath(-u0-1); path.exit=true; return path; }
      const u=u0; if(done[u]===stamp) continue; done[u]=stamp;
      if(dn[u]!==-2) return tracePath(u);
      const du=dist[u], ui=u%nx, uj=(u/nx)|0;
      if(exits.length<MAXEXIT){ const ex=exitCapable(u); if(ex && farFromExits(ex[0],ex[1])) hpush(du+EXITCOST,-u-1); }
      for(const s of NB){ const i=ui+s.di, j=uj+s.dj; if(i<0||j<0||i>=nx||j>=ny) continue; const v=j*nx+i; if(done[v]===stamp) continue;
        const vt=dn[v]!==-2; let w;
        if(s.knight){ const k1=(uj+s.i1[1])*nx+ui+s.i1[0], k2=(uj+s.i2[1])*nx+ui+s.i2[0];
          if(dn[k1]!==-2 || dn[k2]!==-2) continue;
          w=vt?1:(2*cellCost(v)+cellCost(k1)+cellCost(k2))/4; }
        else { if(s.di&&s.dj && !vt && (dn[uj*nx+i]!==-2 || dn[j*nx+ui]!==-2)) continue;   // never slip diagonally through a vein
          w=vt?1:cellCost(v); }
        if(vt && (joinBlock[v] || up[v]>=2)) continue;
        if(w===Infinity) continue;
        const cf=s.ux*UAX[0]+s.uy*UAX[1]; if(cf<0) w*=1-1.5*cf;                    // drain along the flow axis
        { const o=org[u], dx=cx(v)-cx(o), dy=cy(v)-cy(o), d2=dx*dx+dy*dy;
          if(d2<1500*1500){ const cs=s.ux*sdx[o]+s.uy*sdy[o]; if(d2<700*700){ if(cs<0.4) w*=1+8*(0.4-cs); } else if(cs<-0.25) w*=20; } }
        let nd=du+s.L*h*w; if(vt) nd+=joinPenalty(u,v);
        if(seen[v]!==stamp || nd<dist[v]){ seen[v]=stamp; dist[v]=nd; prev[v]=u; org[v]=org[u]; hpush(nd,v); } }
    }
    return null;
  }
  function addPath(path){
    const last=path[path.length-1];
    if(path.exit){ const ex=exitCapable(last); exits.push({x:ex[0],y:ex[1],cell:last,n:[ex[2],ex[3]]}); dn[last]=-1;
      // nothing may pass between the exit's last cell and the map edge
      const x0=cx(last), y0=cy(last), L=hyp(ex[0]-x0,ex[1]-y0);
      for(let s=0;s<=L+h;s+=h/2){ const x=x0+(ex[0]-x0)*Math.min(1,s/(L||1)), y=y0+(ex[1]-y0)*Math.min(1,s/(L||1));
        for(let o=-3*h;o<=3*h;o+=h/2){ const k=cellOf(x+ex[3]*o, y+ex[2]*o); if(k!==last && dn[k]===-2) vclr[k]=-1; } } }
    for(let i=0;i<path.length-1;i++){ dn[path[i]]=path[i+1]; up[path[i+1]]++; stampVein(path[i]); }
    stampVein(last);
    for(let c=path[0]; c>=0; c=dn[c]) cnt[c]+=1;
    blockDisk(last, path.exit ? 1500 : 2.5*rV(cnt[last]+2)*1.15+200);
    if(up[stubHead]<2) joinBlock[stubHead]=0;
    for(const ex of exits) if(up[ex.cell]<2) joinBlock[ex.cell]=0;
    blockDisk(path[0], 900);
  }
  // every arterial tip drains through its own route: it leaves straight ahead of the tip (the first stretch becomes the
  // capillary connector) and runs along the ridges between arteries until it meets the tree; farthest tips first
  const farFirst=(a,b)=>hyp(b.x-OX,b.y-OY)-hyp(a.x-OX,a.y-OY);
  const tips=[];
  for(const e of art){ const tip=nodes[e.b]; if(!tip.aTip) continue;
    const P=e.P, m=P.length-1; let k=m; while(k>0 && hyp(P[k][0]-P[m][0],P[k][1]-P[m][1])<300) k--;
    tips.push({id:tip.id, x:tip.x, y:tip.y, t:norm(P[m][0]-P[k][0],P[m][1]-P[k][1]), r:e.r}); }
  tips.sort(farFirst);
  const tipOfCell=new Map();
  tips.forEach((T,ti)=>{ C0=650-150*Math.min(1,ti/Math.max(1,tips.length*0.6));
    for(const [a,d] of [[0,600],[0.35,650],[-0.35,650],[0,800],[0.7,700],[-0.7,700]]){
      const u=rot(T.t,a), x=T.x+u[0]*d, y=T.y+u[1]*d; if(x<400||y<400||x>W-400||y>H-400) continue;
      const c=cellOf(x,y); if(dn[c]!==-2 || vclr[c]<CMIN) continue;
      let clear=true; for(let f=0.35; f<1; f+=0.1) if(dn[cellOf(T.x+u[0]*d*f, T.y+u[1]*d*f)]!==-2){ clear=false; break; }
      if(!clear) continue;
      const path=route([[c,0,norm(T.t[0]+u[0],T.t[1]+u[1])]]);
      if(path){ T.cell=c; tipOfCell.set(c,T); addPath(path); }
      return; } });

  // ================================================================== 5. venous vessels from the cell tree
  const isNodeCell=c=>dn[c]===-1 || up[c]!==1;
  const vNodeOfCell=new Map();
  function vnode(c){ let n=vNodeOfCell.get(c); if(!n){ n=addNode(cx(c),cy(c)); vNodeOfCell.set(c,n); } return n; }
  let vEdges=[];
  for(let c=0;c<NC;c++){ if(dn[c]===-2 || !isNodeCell(c)) continue;
    if(dn[c]===-1){
      if(c===stubHead) vEdges.push({aC:c, bN:outlet, units:cnt[c], stub:true});
      else { const ex=exits.find(e=>e.cell===c); ex.node=addNode(ex.x,ex.y,'outlet'); vEdges.push({aC:c, bN:ex.node, units:cnt[c], exitStub:ex}); }
      continue; }
    const cells=[c]; let d=dn[c]; while(!isNodeCell(d)){ cells.push(d); d=dn[d]; } cells.push(d);
    vEdges.push({aC:c, bC:d, cells, units:cnt[cells[cells.length-2]]});
  }
  // an exit stub with a single upstream vessel becomes one smooth vessel
  for(const e of vEdges.filter(e=>e.exitStub)){ if(up[e.aC]!==1) continue; const u=vEdges.find(f=>f.bC===e.aC);
    if(u){ u.bC=undefined; u.bN=e.bN; u.toExit=e.exitStub; e.dead=true; } }
  vEdges=vEdges.filter(e=>!e.dead);
  for(const e of vEdges){ e.a=vnode(e.aC).id; e.b=e.bN?e.bN.id:vnode(e.bC).id; }
  for(const c of [stubHead].concat(exits.map(e=>e.cell))) if(vNodeOfCell.has(c)) vNodeOfCell.get(c).pin=true;
  const qMain=Math.max(1,cnt[stubHead]);
  const rVq=q=>venR(Math.max(q,0.3),K,qMain);
  // fair each vessel: resample the cell path, smooth, straight perpendicular leg into an exit
  for(const e of vEdges){ e.r=rVq(e.units); let P;
    if(e.stub) P=[[nodes[e.a].x,nodes[e.a].y],[OX,OY]];
    else if(e.exitStub) P=[[nodes[e.a].x,nodes[e.a].y],[e.exitStub.x,e.exitStub.y]];
    else { P=e.cells.map(c=>[cx(c),cy(c),0]); if(e.toExit) P.push([e.toExit.x,e.toExit.y,0]);
      const T=tipOfCell.get(e.aC); if(T){ e.tip=T; P=[[T.x,T.y,0],[T.x+T.t[0]*200,T.y+T.t[1]*200,0]].concat(P); }
      P=smooth(resample(P,()=>110), 40, e.tip?3:2);
      if(e.toExit){ const ex=e.toExit; let acc=0, k=P.length-1; while(k>1 && acc<1300){ acc+=hyp(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]); k--; }
        const A=P[k], tA=norm(P[k+1][0]-P[k-1][0],P[k+1][1]-P[k-1][1]), d=hyp(ex.x-A[0],ex.y-A[1]);
        P=P.slice(0,k).concat(hermite(A,tA,[ex.x,ex.y],ex.n,d,d,14)); } }
    e.P=withR(P,e.r); e.c=arcs(e.P); }
  // confluences: steer each tributary's last stretch to arrive at (at most) its Murray angle, as a Y with the flow
  { const inV=new Map(), outV=new Map();
    for(const e of vEdges){ if(!inV.has(e.b)) inV.set(e.b,[]); inV.get(e.b).push(e); outV.set(e.a,e); }
    for(const [nid,ins] of inV){ const o=outV.get(nid); if(!o || ins.length!==2) continue;
      const r0=o.r, dOut=tanAt(o.P,o.c,Math.min(2*r0,o.c[o.c.length-1]*0.4)), back=[-dOut[0],-dOut[1]];
      const th=murrayAngles(r0,ins[0].r,ins[1].r);
      ins.forEach((e,i)=>{ const L=e.c[e.c.length-1], Lb=Math.min(L*0.45, 3.5*e.r+700); if(Lb<400) return;
        const q=at(e.P,e.c,L-Lb), u=norm(q[0]-nodes[nid].x, q[1]-nodes[nid].y);   // upstream direction at the node
        const want=clamp(th[i],0.3,1.15); if(angle(u,back)<=want+0.3) return;
        const sg=cross(back,u)>=0?1:-1, tIn=rot(back,sg*want), tq=tanAt(e.P,e.c,L-Lb), B=[nodes[nid].x,nodes[nid].y], d=hyp(B[0]-q[0],B[1]-q[1]);
        const Hc=hermite([q[0],q[1]],tq,B,[-tIn[0],-tIn[1]],d*0.9,d*0.9,Math.max(8,Math.ceil(Lb/80)));
        e.P=e.P.slice(0,q[2]+1).concat(withR(Hc.slice(1),e.r)); e.c=arcs(e.P); }); } }

  // ================================================================== 6. AV connectors (capillary beds at the arterial tips)
  for(const e of art) e.c=arcs(e.P);
  const mkField=()=>new Float32Array(NC).fill(CMAX);
  let vF=mkField(); for(const e of vEdges) stampPoly(vF,e.P,650);
  const cF=mkField();
  const GAP=150, MARG=40, CAPMAX=2000;
  function buildCap(A,tA,B,tB,r0,r1){ const d=hyp(B[0]-A[0],B[1]-A[1]), n=Math.max(12,Math.ceil(d/60)), rm=clamp(0.6*Math.min(r0,r1),108,135);
    return hermite(A,tA,B,tB,d*0.85,d*0.85,n).map((p,i)=>{ const t=i/n, w=Math.pow(Math.sin(Math.PI*t),0.8); return [p[0],p[1],(r0*(1-t)+r1*t)*(1-w)+rm*w]; }); }
  // a connector is short, never doubles back, and keeps the tissue gap from everything it does not join
  function capValid(P, exA, exB, rA_, rB_){
    const c=arcs(P), L=c[c.length-1]; if(L>CAPMAX) return false; { const tu=turning(P); if(Math.abs(tu[0])>1.75 || tu[1]>2.8) return false; }
    for(let i=1;i<P.length-1;i++){ const p=P[i], s=c[i], rc=p[2];
      if(p[0]<150||p[1]<150||p[0]>W-150||p[1]>H-150) return false;
      if(fAt(cF,p[0],p[1])-rc<GAP+MARG) return false;
      if(s>exA && fAt(clr,p[0],p[1])-rc<GAP+MARG) return false;
      if(L-s>exB && fAt(vF,p[0],p[1])-rc<GAP+MARG) return false;
      if(s>1.5*rA_ && L-s>1.5*rB_){ const ax=P[i][0]-P[i-1][0], ay=P[i][1]-P[i-1][1], bx=P[i+1][0]-P[i][0], by=P[i+1][1]-P[i][1];
        const la=hyp(ax,ay), lb=hyp(bx,by), th=Math.acos(clamp((ax*bx+ay*by)/((la*lb)||1),-1,1)); if(th>1e-4 && 0.5*(la+lb)/th<2.3*rc) return false; } }
    return true;
  }
  const caps=[];
  // 6a. each tip's route: its first stretch (≤ 1.9 mm) becomes the connector, the rest stays a venule
  { const capProfile=(P,r0,r1)=>{ const c=arcs(P), L=c[c.length-1], rm=clamp(0.6*Math.min(r0,r1),108,135);
      return P.map((p,i)=>{ const t=c[i]/L, w=Math.pow(Math.sin(Math.PI*t),0.8); return [p[0],p[1],(r0*(1-t)+r1*t)*(1-w)+rm*w]; }); };
    const outV=new Map(); for(const e of vEdges) outV.set(e.a,e);
    for(const e of vEdges.slice()){ const T=e.tip; if(!T) continue; const L=e.c[e.c.length-1], r1=e.r, down=outV.get(e.b);
      const whole=L<=1900 ? [L] : [], svs=whole.concat([1100,900,1300,750,1500,1700].filter(sv=>sv<=L-1.5*r1-200));
      const opts2=[];   // [sv, connector polyline]: follow the route, or (if it curls) cut straight across to it further on
      for(const sv of svs){ const q=at(e.P,e.c,sv); opts2.push([sv, q, capProfile(e.P.slice(0,q[2]+1).concat([[q[0],q[1],r1]]), T.r, r1)]); }
      const cut=[]; for(let sv=450; sv<=Math.min(L-1.5*r1-200, 4000); sv+=150){ const q=at(e.P,e.c,sv), d=hyp(q[0]-T.x,q[1]-T.y); if(d<400||d>CAPMAX) continue;
        const toV=norm(q[0]-T.x,q[1]-T.y), a1=angle(toV,T.t); if(a1>1.5) continue; cut.push([d+600*a1+0.2*sv, sv, q]); }
      cut.sort((x,y)=>x[0]-y[0]);
      for(const [,sv,q] of cut.slice(0,12)) opts2.push([sv, q, buildCap([T.x,T.y],T.t,[q[0],q[1]],tanAt(e.P,e.c,sv),T.r,r1)]);
      // the connector and the first 2.5 mm of vein after it must not hook back (no candy canes)
      const onward=sv=>{ const Q=[]; let src=e.P, c=e.c, s0=sv;
        for(let k=0;k<2 && src;k++){ for(let i=1;i<src.length;i++) if(c[i]>s0 && c[i]<=s0+2500) Q.push(src[i]); if(k===0 && s0+2500>c[c.length-1] && down){ s0=s0-c[c.length-1]; src=down.P; c=down.c; } else break; }
        return Q; };
      for(const [sv,q,Pc] of opts2){
        const rEnd=sv===L && down ? Math.max(r1,down.r) : r1;
        if(Math.abs(turning(Pc.concat(onward(sv)))[0])>2.2) continue;
        if(!capValid(Pc,3*T.r,3*rEnd,T.r,r1)) continue;
        const cp={P:Pc, a:T.id}; caps.push(cp); T.done=true; stampPoly(cF,Pc,650);
        if(sv===L){ cp.b=e.b; vEdges.splice(vEdges.indexOf(e),1); }
        else { const N=addNode(q[0],q[1]); e.P=[[q[0],q[1],r1]].concat(e.P.slice(q[2]+1)); e.c=arcs(e.P); e.a=N.id; cp.b=N.id; }
        break; } } }
  const tipList=tips.map(T=>({id:T.id, T:[T.x,T.y], tT:T.t, r0:T.r, done:T.done}));
  // drop every unfed venous branch (routes whose connector failed) and merge the pass-through confluences they leave
  { const fedNode=new Set(caps.map(cp=>cp.b));
    for(let changed=true; changed;){ changed=false; const inD=new Map(); for(const e of vEdges) inD.set(e.b,(inD.get(e.b)||0)+1);
      const keep=vEdges.filter(e=>e.stub || e.exitStub || inD.get(e.a) || fedNode.has(e.a)); if(keep.length!==vEdges.length){ vEdges=keep; changed=true; } }
    for(let again=true; again;){ again=false; const inE=new Map(), outE=new Map();
      for(const e of vEdges){ if(!inE.has(e.b)) inE.set(e.b,[]); inE.get(e.b).push(e); outE.set(e.a,e); }
      for(const [n,ins] of inE){ const o=outE.get(n); if(ins.length!==1 || !o || o.stub || o.exitStub || fedNode.has(n)) continue;
        const e1=ins[0], P=e1.P.concat(o.P.slice(1)), k0=e1.P.length-1;
        for(let pass=0;pass<8;pass++) for(let i=Math.max(1,k0-8);i<=Math.min(P.length-2,k0+8);i++) P[i]=[(P[i-1][0]+2*P[i][0]+P[i+1][0])/4,(P[i-1][1]+2*P[i][1]+P[i+1][1])/4,P[i][2]];
        e1.P=P; e1.c=arcs(P); e1.b=o.b; e1.toExit=o.toExit; vEdges.splice(vEdges.indexOf(o),1); again=true; break; } }
  }
  // venous flows (connectors drained) and calibres of the pruned tree
  function veinFlows(){ const inE=new Map(), capAt=new Map(), memo=new Map();
    for(const e of vEdges){ if(!inE.has(e.b)) inE.set(e.b,[]); inE.get(e.b).push(e); }
    for(const cp of caps) if(cp.b!==undefined) capAt.set(cp.b,(capAt.get(cp.b)||0)+1);
    const fl=e=>{ if(memo.has(e)) return memo.get(e); let q=capAt.get(e.a)||0; for(const f of (inE.get(e.a)||[])) q+=fl(f); memo.set(e,q); return q; };
    let qm=1; for(const e of vEdges){ e.units=fl(e); if(e.stub) qm=Math.max(qm,e.units); }
    return qm; }
  let qMainV=veinFlows();
  const rVp=q=>venR(Math.max(q,0.3),caps.length+4,qMainV+3);   // +4/+3: room for the side connectors still to come
  for(const e of vEdges){ e.r=rVp(e.units); e.P=withR(e.P,e.r); e.c=arcs(e.P); }
  vF=mkField(); for(const e of vEdges) stampPoly(vF,e.P,650);
  // 6b. remaining tips → the side of a thin vein, joining with its flow, with room for a junction
  const JL=[];   // junctions {x,y,r}
  for(const e of art){ if(nodes[e.a].type==='inlet') continue; const p=aIn.get(e.a); JL.push({x:nodes[e.a].x,y:nodes[e.a].y,r:p?p.r:RA}); }
  { const deg=new Map(); for(const e of vEdges){ deg.set(e.a,(deg.get(e.a)||0)+1); deg.set(e.b,(deg.get(e.b)||0)+1); }
    for(const e of vEdges) if((deg.get(e.b)||0)>=3) JL.push({x:nodes[e.b].x,y:nodes[e.b].y,r:e.r*1.15}); }
  const jOK=(x,y,r)=>JL.every(j=>hyp(j.x-x,j.y-y)>=2.5*Math.max(j.r,r)*1.08+120);
  const rVmaxSide=rVp(qMainV*0.45);
  for(const tp of tipList){ if(tp.done) continue; const {T,tT,r0}=tp, cands=[];
    for(const ve of vEdges){ if(ve.stub||ve.exitStub||ve.r>rVmaxSide) continue; const Lv=ve.c[ve.c.length-1], rj=rVp(ve.units+1);
      for(let sv=2.5*rj*1.1+150; sv<=Lv-(2.5*rj*1.15+150); sv+=140){ const q=at(ve.P,ve.c,sv), d=hyp(q[0]-T[0],q[1]-T[1]); if(d<450||d>CAPMAX) continue;
        const toV=norm(q[0]-T[0],q[1]-T[1]), a1=angle(toV,tT); if(a1>1.5) continue;
        const vd=tanAt(ve.P,ve.c,sv); if(toV[0]*vd[0]+toV[1]*vd[1]<-0.2) continue;   // join with the venous flow
        cands.push({cost:d+800*a1, ve, sv, V:[q[0],q[1]], vd, rj}); } }
    cands.sort((x,y)=>x.cost-y.cost);
    for(const cd of cands.slice(0,40)){ if(!jOK(cd.V[0],cd.V[1],cd.rj)) continue;
      const toV=norm(cd.V[0]-T[0],cd.V[1]-T[1]), tV=norm(cd.vd[0]*0.6+toV[0]*0.4, cd.vd[1]*0.6+toV[1]*0.4), r1=rVp(1);
      const P=buildCap(T,tT,cd.V,tV,r0,r1); if(!capValid(P,3*r0,3*cd.rj,r0,r1)) continue;
      caps.push({P, a:tp.id, ve:cd.ve, sv:cd.sv}); tp.done=true; JL.push({x:cd.V[0],y:cd.V[1],r:cd.rj}); stampPoly(cF,P,650); break; } }


  // ================================================================== 7. assembly, radii, relaxation, self-check and repair
  let FE=[];   // {a,b,type,P,q}
  { const vSplits=new Map();
    for(const cp of caps) if(cp.ve){ if(!vSplits.has(cp.ve)) vSplits.set(cp.ve,[]); vSplits.get(cp.ve).push(cp); }
    for(const e of art) FE.push({a:e.a,b:e.b,type:'art',P:e.P,rigB:e.rigB});
    for(const e of vEdges){ const sp=(vSplits.get(e)||[]).sort((u,v)=>u.sv-v.sv); let P=e.P, c=e.c, a=e.a, off=0;
      for(const cp of sp){ const q=at(P,c,cp.sv-off), N=addNode(q[0],q[1]); cp.b=N.id;
        FE.push({a,b:N.id,type:'ven',P:P.slice(0,q[2]+1).concat([[q[0],q[1],e.r]])});
        P=[[q[0],q[1],e.r]].concat(P.slice(q[2]+1)); c=arcs(P); off=cp.sv; a=N.id; }
      FE.push({a,b:e.b,type:'ven',P}); }
    for(const cp of caps) FE.push({a:cp.a,b:cp.b,type:'cap',P:cp.P,q:1}); }
  const byEnds=()=>{ const outE=new Map(), inE=new Map();
    for(const e of FE){ if(!outE.has(e.a)) outE.set(e.a,[]); outE.get(e.a).push(e); if(!inE.has(e.b)) inE.set(e.b,[]); inE.get(e.b).push(e); }
    return {outE,inE}; };
  function prune(){   // keep only edges on an inlet → outlet path
    for(let changed=true; changed;){ changed=false; const {outE,inE}=byEnds(), fw=new Set(), bw=new Set();
      const st=nodes.filter(n=>n.type==='inlet').map(n=>n.id); st.forEach(i=>fw.add(i));
      while(st.length){ const u=st.pop(); for(const e of (outE.get(u)||[])) if(!fw.has(e.b)){ fw.add(e.b); st.push(e.b); } }
      const s2=nodes.filter(n=>n.type==='outlet').map(n=>n.id); s2.forEach(i=>bw.add(i));
      while(s2.length){ const u=s2.pop(); for(const e of (inE.get(u)||[])) if(!bw.has(e.a)){ bw.add(e.a); s2.push(e.a); } }
      const keep=FE.filter(e=>fw.has(e.a)&&bw.has(e.b)); if(keep.length!==FE.length){ FE=keep; changed=true; } }
  }
  function mergeDeg2(){   // pass-through nodes (1 in, 1 out, same type) become one smooth vessel
    for(let again=true; again;){ again=false; const {outE,inE}=byEnds();
      for(const [n,ins] of inE){ const outs=outE.get(n)||[]; if(ins.length!==1||outs.length!==1||nodes[n].type!=='junction') continue;
        const e1=ins[0], e2=outs[0]; if(e1.type!==e2.type || e1.type==='cap' || e1===e2) continue;
        const P=e1.P.concat(e2.P.slice(1)), k0=e1.P.length-1;
        for(let pass=0;pass<6;pass++) for(let i=Math.max(1,k0-6);i<=Math.min(P.length-2,k0+6);i++) P[i]=[(P[i-1][0]+2*P[i][0]+P[i+1][0])/4,(P[i-1][1]+2*P[i][1]+P[i+1][1])/4,P[i][2]];
        e1.P=P; e1.b=e2.b; FE.splice(FE.indexOf(e2),1); again=true; break; } }
  }
  function flowsRadii(){   // Murray radii from the flows: arteries from the inlet, veins anchored at the main outlet
    const {outE,inE}=byEnds(), mA=new Map(), mV=new Map();
    const flowA=e=>{ if(e.type==='cap') return e.q; if(mA.has(e)) return mA.get(e); let q=0; for(const f of (outE.get(e.b)||[])) q+=flowA(f); mA.set(e,q); return q; };
    const flowV=e=>{ if(e.type==='cap') return e.q; if(mV.has(e)) return mV.get(e); let q=0; for(const f of (inE.get(e.a)||[])) q+=flowV(f); mV.set(e,q); return q; };
    let Qin=0, Qmain=0;
    for(const e of FE){ if(e.type==='art'){ e.q=flowA(e); if(nodes[e.a].type==='inlet') Qin+=e.q; } else if(e.type==='ven'){ e.q=flowV(e); if(e.b===outlet.id) Qmain=Math.max(Qmain,e.q); } }
    if(!Qmain) for(const e of FE) if(e.type==='ven' && nodes[e.b].type==='outlet') Qmain=Math.max(Qmain,e.q);
    const rA=q=>Math.max(160, RA*Math.pow(q/Qin,1/GAMMA)), rVv=q=>venR(q,Qin,Qmain);
    for(const e of FE){ e.dirty=true;
      if(e.type==='art') e.P=withR(e.P,rA(e.q));
      else if(e.type==='ven') e.P=withR(e.P,rVv(e.q));
      else { const r0=rA(e.q), r1=rVv(e.q), c=arcs(e.P), L=c[c.length-1], rm=clamp(0.6*Math.min(r0,r1),105,135);
        e.P=e.P.map((p,i)=>{ const t=c[i]/L, w=Math.pow(Math.sin(Math.PI*t),0.8); return [p[0],p[1],(r0*(1-t)+r1*t)*(1-w)+rm*w]; }); } }
  }
  // curvature limiter: smooth interior points whose radius of curvature is below ~2.2 r
  function limitCurv(P){ const n=P.length; if(n<5) return P;
    for(let it=0; it<40; it++){ const c=arcs(P), L=c[n-1], ex0=1.5*P[0][2]+30, ex1=1.5*P[n-1][2]+30, mark=new Uint8Array(n); let bad=false;
      for(let i=1;i<n-1;i++){ if(c[i]<ex0||L-c[i]<ex1) continue; const ax=P[i][0]-P[i-1][0], ay=P[i][1]-P[i-1][1], bx=P[i+1][0]-P[i][0], by=P[i+1][1]-P[i][1];
        const la=hyp(ax,ay), lb=hyp(bx,by); if(la<1e-6||lb<1e-6) continue; const th=Math.acos(clamp((ax*bx+ay*by)/(la*lb),-1,1)); if(th<1e-4) continue;
        if(0.5*(la+lb)/th<2.2*P[i][2]){ bad=true; for(let k=i-2;k<=i+2;k++) if(k>0&&k<n-1) mark[k]=1; } }
      if(!bad) break;
      const Q=P.map(p=>p.slice()); for(let i=1;i<n-1;i++) if(mark[i]){ Q[i][0]=0.5*P[i][0]+0.25*(P[i-1][0]+P[i+1][0]); Q[i][1]=0.5*P[i][1]+0.25*(P[i-1][1]+P[i+1][1]); }
      P=Q; }
    return P; }
  // turn limiter near the output resolution (12° per step, R ≥ 1.6 r)
  function fixTurns(P){ const n=P.length; if(n<5) return P;
    for(let it=0; it<30; it++){ const c=arcs(P), L=c[n-1], ex0=1.5*P[0][2], ex1=1.5*P[n-1][2]; let bad=false;
      for(let i=1;i<n-1;i++){ if(c[i]<ex0-5||L-c[i]<ex1-5) continue; const ax=P[i][0]-P[i-1][0], ay=P[i][1]-P[i-1][1], bx=P[i+1][0]-P[i][0], by=P[i+1][1]-P[i][1];
        const la=hyp(ax,ay), lb=hyp(bx,by); if(la<1e-6||lb<1e-6) continue; const th=Math.acos(clamp((ax*bx+ay*by)/(la*lb),-1,1));
        if(th>0.19 || (th>1e-4 && 0.5*(la+lb)/th<1.6*P[i][2])){ bad=true; for(let k=Math.max(1,i-1);k<=Math.min(n-2,i+1);k++) P[k]=[0.5*P[k][0]+0.25*(P[k-1][0]+P[k+1][0]),0.5*P[k][1]+0.25*(P[k-1][1]+P[k+1][1]),P[k][2]]; } }
      if(!bad) break; }
    return P; }
  const stepOf=r=>Math.min(0.42*r,140);
  function finalRelax(iters, margin){
    for(const e of FE){ e.P=resample(e.P,()=>280); e.fixA=nodes[e.a].type==='inlet'?900:0; e.fixB=nodes[e.b].type==='outlet'?1500:0; }
    for(const n of nodes) n.fixed=(n.type!=='junction')||!!n.pin;
    for(const e of FE) if(nodes[e.b].type==='outlet') nodes[e.a].fixed=true;
    relaxJoint({nodes, edges:FE, W, H}, iters, margin, W, H);
  }
  // Murray steering of junctions: a fork's parent arrives along the r²-weighted mean of its children's directions, no
  // child leaves more than ~95° off it, and tributaries (veins or connectors) meet their vein as a Y with the flow
  function shapeJunctions(){
    const {outE,inE}=byEnds();
    const dirAt=(e,atStart,d)=>{ const P=e.P, c=arcs(P), L=c[c.length-1], s=Math.min(d,0.45*L), q=atStart?at(P,c,s):at(P,c,L-s), N=atStart?P[0]:P[P.length-1]; return norm(q[0]-N[0],q[1]-N[1]); };
    // rebuild the stretch of e next to the node so that it meets the node along t (t points away from the node)
    // (the last `st` µm run straight along t, the stretch before bends smoothly into it)
    const reshape=(e,atStart,t,st0)=>{ const P=e.P, c=arcs(P), L=c[c.length-1], st=Math.min(st0,0.4*L), Lb=Math.min(0.8*L, st+Math.max(600,1.2*st)); if(Lb<st+250) return;
      const q=at(P,c,atStart?Lb:L-Lb), tq=tanAt(P,c,atStart?Lb:L-Lb), N=atStart?P[0]:P[P.length-1], Q=[N[0]+t[0]*st, N[1]+t[1]*st];
      const d=hyp(q[0]-Q[0],q[1]-Q[1]), n=Math.max(6,Math.ceil((Lb-st)/90)), m=Math.max(2,Math.ceil(st/90)), S=[];
      for(let i=0;i<=m;i++) S.push([N[0]+t[0]*st*i/m, N[1]+t[1]*st*i/m]);
      if(atStart){ const Hc=hermite(Q,t,[q[0],q[1]],tq,d*0.9,d*0.9,n); e.P=withR(S.concat(Hc.slice(1)),P[0][2]).concat(P.slice(q[2]+1)); }
      else { const Hc=hermite([q[0],q[1]],tq,Q,[-t[0],-t[1]],d*0.9,d*0.9,n); e.P=P.slice(0,q[2]+1).concat(withR(Hc.slice(1).concat(S.reverse().slice(1)),P[P.length-1][2])); }
      e.dirty=true; };
    for(const [n,outs] of outE){ const ins=inE.get(n)||[]; if(nodes[n].type!=='junction') continue;
      if(ins.length===1 && outs.length===2 && ins[0].type==='art' && outs.every(e=>e.type==='art')){
        const pe=ins[0], rp=pe.P[pe.P.length-1][2], r=outs.map(e=>e.P[0][2]), u=outs.map(e=>dirAt(e,true,2*rp)), back=dirAt(pe,false,2*rp);
        const dJ=norm(r[0]*r[0]*u[0][0]+r[1]*r[1]*u[1][0], r[0]*r[0]*u[0][1]+r[1]*r[1]*u[1][1]);
        if(angle(dJ,[-back[0],-back[1]])>0.2 && angle(dJ,[-back[0],-back[1]])<1.5) reshape(pe,false,[-dJ[0],-dJ[1]],2*rp);
        const th=murrayAngles(rp,r[0],r[1]);
        outs.forEach((e,i)=>{ if(angle(u[i],dJ)<=1.65) return; const sg=cross(dJ,u[i])>=0?1:-1; reshape(e,true,rot(dJ,sg*clamp(th[i],0.4,1.4)),2*rp); });
      }
      if(outs.length===1 && ins.length===2 && outs[0].type==='ven' && ins.every(e=>e.type!=='art')){
        const o=outs[0], r0=o.P[0][2], dOut=dirAt(o,true,2*r0), back=[-dOut[0],-dOut[1]], r=ins.map(e=>e.P[e.P.length-1][2]), th=murrayAngles(r0,r[0],r[1]);
        ins.forEach((e,i)=>{ const u=dirAt(e,false,2*r0), want=clamp(th[i],0.3,1.15); if(angle(u,back)<=want+0.3) return;
          const sg=cross(back,u)>=0?1:-1; reshape(e,false,rot(back,sg*want),Math.min(2*r0,1.5*r[i]+300)); });
      }
    }
  }
  function surgicalPush(v, OE){   // push the two vessels of a gap apart (smooth cosine window)
    const A=OE[v.ea].src, B=OE[v.eb].src; if(!FE.includes(A)||!FE.includes(B)) return;
    A.dirty=true; B.dirty=true; const dir=norm(v.pa[0]-v.pb[0], v.pa[1]-v.pb[1]), amt=v.deficit+180;
    for(const [E,pt,sg] of [[A,v.pa,1],[B,v.pb,-1]]){ const P=E.P, c=arcs(P), L=c[P.length-1];
      let bi=0, bd=1e18; for(let i=0;i<P.length;i++){ const d=(P[i][0]-pt[0])**2+(P[i][1]-pt[1])**2; if(d<bd){bd=d;bi=i;} }
      const win=Math.max(700, 2.5*P[bi][2]);
      const fa=(E.fixA||0)+60, fb=(E.fixB||0)+60;
      for(let i=1;i<P.length-1;i++){ const ds=Math.abs(c[i]-c[bi]); if(ds>win || c[i]<fa || L-c[i]<fb) continue;
        const w=Math.cos(Math.PI/2*ds/win)**2*Math.min(1, (c[i]-fa+240)/300, (L-c[i]-fb+240)/300), m=P[i][2]+60;
        P[i][0]=clamp(P[i][0]+dir[0]*sg*amt*0.55*w, Math.min(m,P[i][0]), Math.max(W-m,P[i][0]));
        P[i][1]=clamp(P[i][1]+dir[1]*sg*amt*0.55*w, Math.min(m,P[i][1]), Math.max(H-m,P[i][1])); } }
  }
  function build(){
    const used=new Set(); for(const e of FE){ used.add(e.a); used.add(e.b); }
    const remap=new Map(), ON=[];
    for(const n of nodes) if(used.has(n.id)){ remap.set(n.id,ON.length); ON.push({id:ON.length,x:n.x,y:n.y,type:n.type}); }
    const OE=FE.map((e,k)=>{ let pts;
      if(!e.dirty && e.out) pts=e.out.map(p=>p.slice());
      else { pts=resample(limitCurv(resample(e.P,r=>Math.min(0.3*r,110))),stepOf); pts=fixTurns(resample(limitCurv(pts),stepOf)); e.out=pts.map(p=>p.slice()); e.dirty=false; }
      const A=ON[remap.get(e.a)], B=ON[remap.get(e.b)]; pts[0][0]=A.x; pts[0][1]=A.y; const l=pts[pts.length-1]; l[0]=B.x; l[1]=B.y;
      return {id:k,a:remap.get(e.a),b:remap.get(e.b),type:e.type,pts,src:e}; });
    return {ON,OE};
  }
  let result=null, structural=true, incr=null;
  const MAXR=7;
  for(let round=0; round<MAXR; round++){
    if(structural){ prune(); mergeDeg2(); flowsRadii(); if(round===0) shapeJunctions(); finalRelax(round===0?10:5, round===0?80:120); }
    structural=false;
    const {ON,OE}=build();
    let V;
    if(incr && result){ const only=new Set(); OE.forEach((e,k)=>{ if(incr.has(e.src)) only.add(k); });
      V=result.V.filter(v=>v.kind!=='jspace' && !(v.ea!=null && only.has(v.ea)) && !(v.eb!=null && only.has(v.eb))).concat(checkNet(ON,OE,only)); }
    else V=checkNet(ON,OE);
    incr=null; result={ON,OE,V};
    if(!V.length) break;
    // repair: drop connectors involved in a violation (their dead ends are pruned next round); push two vessels apart;
    // for any other vessel drop the few connectors that feed / drain it
    let acted=0, pushed=null; const {outE,inE}=byEnds();
    const depCaps=e=>{ const res=new Set(), st=[e], seenE=new Set([e]);
      while(st.length && res.size<4){ const x=st.pop(); if(x.type==='cap'){ res.add(x); continue; }
        for(const y of (x.type==='art'?(outE.get(x.b)||[]):(inE.get(x.a)||[]))) if(!seenE.has(y)){ seenE.add(y); st.push(y); } }
      return res.size<4 ? [...res] : null; };
    const drop=c=>{ const i=FE.indexOf(c); if(i>=0){ FE.splice(i,1); acted++; structural=true; } };
    for(const v of V){ const cands=[];
      if(v.ea!=null) cands.push(OE[v.ea].src); if(v.eb!=null) cands.push(OE[v.eb].src);
      if(v.kind==='jspace') for(const e of OE) if(e.a===v.na||e.b===v.na||e.a===v.nb||e.b===v.nb) cands.push(e.src);
      const capC=cands.find(e=>e.type==='cap'); if(capC){ drop(capC); continue; }
      if(round<MAXR-2 && v.kind==='gap'){ surgicalPush(v,OE); acted++; (pushed||(pushed=new Set())).add(OE[v.ea].src); pushed.add(OE[v.eb].src); continue; }
      let best=null; for(const e of cands){ const d=depCaps(e); if(d && d.length && (!best || d.length<best.length)) best=d; }
      if(best) for(const c of best) drop(c); }
    if(!acted) break;
    if(!structural && pushed) incr=pushed;
  }
  // last resort: locally slimmer vessels where a conflict survived all repair rounds
  for(let it=0; it<6 && result.V.length; it++){ const hit=new Set();
    for(const v of result.V){ if(v.ea!=null) hit.add(v.ea); if(v.eb!=null) hit.add(v.eb);
      if(v.kind==='jspace') result.OE.forEach((e,k)=>{ if(e.a===v.na||e.b===v.na||e.a===v.nb||e.b===v.nb) hit.add(k); }); }
    for(const k of hit){ const e=result.OE[k], A=e.pts[0].slice(), B=e.pts[e.pts.length-1].slice();
      const pts=fixTurns(resample(e.pts.map(p=>[p[0],p[1],Math.max(105,p[2]*0.9)]),stepOf)); pts[0][0]=A[0]; pts[0][1]=A[1]; const l=pts[pts.length-1]; l[0]=B[0]; l[1]=B[1]; e.pts=pts; }
    result.V=checkNet(result.ON,result.OE); }

  // ================================================================== output (mirrored by seed)
  const fx=x=>flipX?W-x:x, fy=y=>flipY?H-y:y;
  const outNodes=result.ON.map(n=>({id:n.id, x:fx(n.x), y:fy(n.y), type:n.type}));
  const outEdges=result.OE.map(e=>({id:e.id, a:e.a, b:e.b, type:e.type, pts:e.pts.map(p=>[fx(p[0]),fy(p[1]),p[2]])}));
  return { bounds:{x0:0,y0:0,x1:W,y1:H}, nodes:outNodes, edges:outEdges,
    meta:{ name:'anatomic', notes:'territory-split arterial tree; venous tree routed to the arterial tips along the ridges between arteries; capillary beds at the tips',
      valid:result.V.length===0, stats:{ terminals:K, caps:outEdges.filter(e=>e.type==='cap').length, outlets:outNodes.filter(n=>n.type==='outlet').length } } };
}

const BV = window.BV = window.BV || {};
const GEN = BV.GENERATORS = BV.GENERATORS || {}; const INFO = BV.GENERATOR_INFO = BV.GENERATOR_INFO || {};
GEN['anatomic'] = generate; INFO['anatomic'] = { label: 'Cortical surface', blurb: 'arteries fan in from one corner and interlock like fingers with veins draining to the far side' };
if (window.GENERATORS) window.GENERATORS['anatomic'] = generate;   // prototype harness
})();
