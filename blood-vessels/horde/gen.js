/* ============================================================================
   HORDE — vessel-network generators
   ----------------------------------------------------------------------------
   BV.generate(seed, opts) → { bounds, nodes:[{id,x,y,type}], edges:[{id,a,b,type,pts:[[x,y,r]]}] }
   (µm, y down; see net.js). 'comb' is a simple development layout; the default
   generator is BV.GEN_DEFAULT.
   ========================================================================== */
(function(){
'use strict';
const BV = window.BV = window.BV || {};
const GEN = BV.GENERATORS = BV.GENERATORS || {};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

GEN.comb = function(seed, opts){
  const rng = mulberry32(seed|0), W = opts.width, H = opts.height;
  const nodes = [], edges = [];
  const node = (x,y,type='junction') => { const n = {id:nodes.length,x,y,type}; nodes.push(n); return n; };
  // cubic Bézier edge with given end tangents, resampled at ≤ min(0.4 r, 120)
  function edge(a, b, type, r0, r1, t0, t1, k0, k1){
    const L = Math.hypot(b.x-a.x, b.y-a.y);
    const c1 = [a.x + t0[0]*L*(k0||0.35), a.y + t0[1]*L*(k0||0.35)];
    const c2 = [b.x - t1[0]*L*(k1||0.35), b.y - t1[1]*L*(k1||0.35)];
    const P = t => { const u=1-t; return [u*u*u*a.x+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*b.x, u*u*u*a.y+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*b.y]; };
    // dense, then arc-length resample
    const D = []; let acc = 0, prev = P(0); D.push([prev[0],prev[1],0]);
    for(let i=1;i<=400;i++){ const p = P(i/400); acc += Math.hypot(p[0]-prev[0], p[1]-prev[1]); D.push([p[0],p[1],acc]); prev = p; }
    const pts = []; let s = 0, j = 0;
    while(true){
      const f = acc > 0 ? s/acc : 0, r = r0 + (r1-r0)*(f*f*(3-2*f));
      while(j < D.length-2 && D[j+1][2] < s) j++;
      const q = D[j], w = D[j+1], u = (s - q[2])/Math.max(1e-9, w[2]-q[2]);
      pts.push([q[0]+(w[0]-q[0])*u, q[1]+(w[1]-q[1])*u, r]);
      if(s >= acc) break;
      s = Math.min(acc, s + Math.min(0.4*Math.min(r, r1, r0), 120));
    }
    pts[0][0]=a.x; pts[0][1]=a.y; const l=pts[pts.length-1]; l[0]=b.x; l[1]=b.y; l[2]=r1;
    edges.push({id:edges.length, a:a.id, b:b.id, type, pts});
  }
  const norm = (x,y) => { const l = Math.hypot(x,y)||1; return [x/l,y/l]; };
  const murray = (rp, rc) => Math.cbrt(Math.max(rp*rp*rp - rc*rc*rc, 1));
  const NB = 5, x0 = W*0.12, dx = (W*0.84 - x0)/(NB-0.5);
  const yA = H*0.20, yV = H*0.82;
  const rA = 700, rV = 820;
  const ain = node(0, yA + 300, 'inlet'), vout = node(0, yV - 300, 'outlet');
  const aTips = [], vTips = [];
  // arterial trunk with downward teeth
  let prev = ain, rPrev = rA;
  for(let i=0;i<NB;i++){
    const j = node(x0 + i*dx, yA + (rng()-0.5)*500);
    const rB = Math.max(230, rPrev*0.6);
    const rNext = Math.max(300, murray(rPrev, rB));
    edge(prev, j, 'art', rPrev, rPrev, i ? norm(j.x-prev.x, j.y-prev.y) : [1,0], [1,0], 0.3, 0.3);
    const tip = node(j.x + dx*0.06, H*0.52 + (rng()-0.5)*300);
    edge(j, tip, 'art', rB, Math.max(200, rB*0.8), norm(0.35, 1), norm(0.0, 1), 0.4, 0.4);
    aTips.push(tip);
    prev = j; rPrev = rNext;
  }
  const aEnd = node(W*0.95, H*0.44);
  edge(prev, aEnd, 'art', rPrev, Math.max(220, rPrev*0.8), [1,0], [0.15,1], 0.45, 0.45);
  // venous trunk (flow toward the outlet on the left) with upward teeth
  let vprev = vout, rv = rV;
  for(let i=0;i<NB;i++){
    const j = node(x0 + (i+0.5)*dx, yV + (rng()-0.5)*500);
    const rIn = Math.max(330, rV*Math.pow(0.84, i));
    edge(j, vprev, 'ven', rIn, i ? Math.max(330, rV*Math.pow(0.84, i-1)) : rV, norm(vprev.x-j.x, vprev.y-j.y), [-1,0], 0.3, 0.3);
    const tip = node(j.x - dx*0.06, H*0.48 + (rng()-0.5)*300);
    const rB = Math.max(250, rIn*0.62);
    edge(tip, j, 'ven', Math.max(220, rB*0.8), rB, norm(0.0, 1), norm(-0.35, 1), 0.4, 0.4);
    vTips.push(tip);
    vprev = j;
  }
  const vEnd = node(W*0.95, H*0.62);
  edge(vEnd, vprev, 'ven', 300, Math.max(330, rV*Math.pow(0.84, NB-1)), [-0.2,1], [-1,0], 0.45, 0.45);
  // AV connectors: each arterial tooth to the venous teeth on either side (one diagonal per gap)
  const cap = (a, v) => {
    const sx = Math.sign(v.x-a.x);
    edge(a, v, 'cap', 150, 150, norm(sx, 0.9), norm(sx, -0.9), 0.5, 0.5);
    const e = edges[edges.length-1]; const n = e.pts.length;
    e.pts.forEach((p,i)=>{ const f = i/(n-1); p[2] = 170 - 60*Math.sin(Math.PI*f); });
  };
  for(let i=0;i<NB;i++){
    cap(aTips[i], vTips[i]);                       // right neighbour
    if(i > 0) cap(aTips[i], vTips[i-1]);           // left neighbour
  }
  cap(aEnd, vEnd);
  return { bounds:{x0:0,y0:0,x1:W,y1:H}, nodes, edges, meta:{name:'dev'} };
};

BV.GEN_DEFAULT = BV.GEN_DEFAULT || 'comb';
BV.generate = function(seed, opts){
  opts = Object.assign({ width: 22000, height: 14000 }, opts || {});
  const name = opts.generator || BV.GEN_DEFAULT;
  return GEN[name](seed, opts);
};
})();
