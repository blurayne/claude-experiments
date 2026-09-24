/* ============================================================================
   HORDE — simulation
   ----------------------------------------------------------------------------
   S = BV.createSim(net, {seed, difficulty})     (µm, seconds, y down)
   S.update(dt, {time, view:{x0,y0,x1,y1}, z, rbcLOD})   S.rbc   S.units   S.pulse
   S.selectInRect / selectAt / selectAll / clearSelection / command(x, y)
   S.stats  S.events  S.orders  S.home  S.reset(seed)   (see PUBLIC API below)

   RED CELLS   viewport-local pool (≤ 5000) held at ~18 % of the lumen area by a
               14×n bin controller: rim bins where the flow (relative to the
               moving camera) enters the view are topped up every frame, with
               the new cells placed at the rim so the inflow is exact; newly
               revealed bins fill with a short fade; only real pile-ups drain.
               Cells ride the Poiseuille profile (lateral a = 1+N and depth),
               drift a little, tumble with the shear, fade in / out.
   WBC HORDE   SoA arrays. Per cell: flow carriage + swim thrust (crab-angled
               against the cross-flow) + soft, mobility-weighted separation
               (spatial hash) + mild cohesion / alignment + wall contact
               (projection back into N < −wall − (r+gap)/rB; slope-corrected and
               Newton steps where vessels blend, never accepting a position
               outside the lumen). States: MOVE (follow an order's flow field),
               HOLD (seek a wall anchor), ADHERE (marginated: rolling → firm
               arrest, clumps grow by contact), CHASE (engulf a nearby
               pathogen), TRANSIT (left through the venous outlet, re-enters at
               the arterial inlet), DYING.
               Lanes: a cell never swims straight into a flow it can't beat — it
               first slides into the slow near-wall lane (upstream travel, and
               the last stretch before a target in fast flow).
   SOFT BODY   display only (never feeds back into the game): a jiggle
               amplitude (decaying impulse, raised by impacts on neighbours
               and walls, engulfing, orders, stops, adhesion, chewing on a
               lesion) and a damped squash & stretch spring along the heading
               (target from swim effort, ground speed and sideways squeeze;
               driven by the acceleration along the heading, kicked on events).
   NAVIGATION  lumen grid (40 µm, built in time slices). Anisotropic Dijkstra
               from the target's cross-section (a seed disc, so lanes don't all
               converge on one point): cost = length / ground speed, where the
               ground speed is the swim speed left after cancelling the cross-flow
               plus the along-flow component (downstream at the mean speed,
               upstream and across at the local Poiseuille speed). The venous
               outlet links to the arterial inlet ("through the heart").
               Directions: best neighbour, parabolic refinement, flow-following
               on near-ties, bilinear blend. Orders on a lesion are attack
               orders; orders into a torrent (AV connectors) park upstream.
   GAME        infection sites in vessel walls emit viruses / bacteria; bacteria
               colonise walls and divide into small colonies; WBCs engulf on
               contact (digest, energy cost) and drain sites they crowd; escapes
               through the outlet, the live load and live sites raise infection;
               waves, score, reinforcements at the arterial inlet, events.
               Won when the last wave's lesions are all down and < 3 pathogens
               remain (stragglers are cleared MOPUP_T s after the last lesion).
   OUTPUT      S.rbc   {data, count}  8 floats: x y r depth angle tumble oxy alpha
               S.units {data, count} 16 floats: x y r type angle phase flags hp
               lookX lookY stretch tint e0 e1 e2 e3 (see packUnits)
   Deterministic for a seed and the same sequence of update(dt > 0)/command()
   calls (seeded PRNGs; game logic never depends on the camera, and camera-
   only update(0) calls in between change nothing). Hot loops allocate
   nothing (typed arrays; field samples through net.sample.f).
   ========================================================================== */
(function(){
'use strict';
const BV = window.BV = window.BV || {};
const CONST = BV.CONST;

const TUNE = BV.SIM_TUNE = Object.assign({
  // ---- white cells --------------------------------------------------------
  SWIM: 170,          // max swim speed (µm/s)
  CARRY: 0.9,         // share of the local flow that carries a swimming cell
  CARRY_ADH: 0.05,    // … a freshly adhered (rolling) cell; fades to 0 = firm arrest
  ARREST_T: 2.5,      // s of rolling before firm arrest
  TAU: 0.22,          // velocity relaxation time (s)
  TAU_ADH: 0.12,
  SEP: 2.12,          // preferred centre spacing (× WBC_R)
  K_SEP: 11,          // separation stiffness (1/s): push speed = K_SEP · overlap
  SEP_VMAX: 160,      // cap on the separation push (µm/s)
  MOB_ADH: 0.2,       // mobility of adhered cells in contacts
  COH_R: 4.2,         // cohesion / alignment radius (× WBC_R)
  K_COH: 0.45,        // cohesion gain (1/s)
  K_ALI: 0.25,        // alignment gain
  UP_LAT: 0.6,        // sideways bias toward the slow near-wall lane when swimming upstream
  APP_LAT: 1.2,       // sideways weight when changing lanes toward a target in fast flow
  WANDER: 0.16,       // heading wander (rad)
  ARR_MIN: 14,        // arrival radius = ARR_MIN + ARR_K · R · √(arrived)
  ARR_K: 1.25,
  K_SEEK: 2.2,        // seek gain for holding / arriving (1/s)
  ADH_T: 0.3,         // s touching a wall (or an adhered cell) before adhering
  ANCHOR_YIELD: 2,    // /s: a settling / adhered cell's anchor creeps after it while neighbours push it off
  WASH: 320,          // an idle cell further than this from its anchor re-seeks
  NEAR_DIRECT: 90,    // closer than this to the target: steer straight at it
  SENSE_IDLE: 110,    // pathogen sensing radius, idle / adhered cells
  SENSE_MOVE: 34,     // … moving cells (they grab what they brush past)
  SENSE_SLOW: 340,    // … idle cells, for near-stationary pathogens (stagnant pockets of wide vessels)
  SLOW_V: 30,         // pathogen speed (µm/s) below which SENSE_SLOW applies
  LEASH: 260,         // an idle chaser never strays further from its anchor
  CHASE_T: 5,         // s before a chase is abandoned
  MAX_CHASE_V: 2,     // chasers per virus
  MAX_CHASE_B: 3,     // … per bacterium
  DIGEST_V: 2.2,      // digest time (s), virus / bacterium
  DIGEST_B: 3.4,
  DIGEST_SLOW: 0.6,   // swim factor while digesting
  CHARGE_V: 0.1,      // energy per engulf (a neutrophil dies when it runs out)
  CHARGE_B: 0.16,
  SITE_WEAR: 0.004,   // energy/s spent while crowding an infection site
  VMAX: 900,          // hard speed clamp (µm/s)
  WALL_GAP: 1,        // cells keep their outline this far (µm) inside the lumen edge
  // ---- soft body (display only) --------------------------------------------
  JIG_DECAY: 4,       // jiggle amplitude decays as exp(−JIG_DECAY·t)
  JIG_V0: 20,         // closing speed (µm/s, ground velocities) below which a bump doesn't jiggle
  JIG_V1: 260,        // … at which a bump reaches JIG_BUMP (neighbours; walls need ×1.3)
  JIG_BUMP: 0.8,      // strongest jiggle from a bump (engulfing is 1)
  SQ_K: 5,            // sideways overlap (µm, summed over contacts) that fully squeezes a cell
  STR_W: 13,          // squash & stretch spring: angular frequency (rad/s)
  STR_Z: 0.4,         // … damping ratio (a little overshoot = jelly)
  STR_ACC: 0.012,     // … drive per µm/s² of acceleration along the heading
  // ---- navigation ---------------------------------------------------------
  NAV_CS: 40,         // nav grid spacing (µm)
  NAV_S: 150,         // swim speed the planner assumes (µm/s)
  SEED_R: 1.0, SEED_MIN: 90, SEED_MAX: 480,  // target seed disc radius (× local radius, clamped): cells entering it have arrived
  SEED_RAMP: 0.3,     // cost ramp inside the seed disc toward the target point
  TIE: 0.35,          // near-tie tolerance (× step cost) inside which cells follow the flow
  VMIN: 3,            // ground speed floor for the planner (µm/s): "near-impossible"
  RECIRC_COST: 26,    // planner cost of outlet → heart → inlet (s)
  RECIRC_T: 16,       // time a cell spends in transit (s)
  NAV_MS: 1.2,        // ms per update spent building the nav grid until it is ready
  DIJ_BUDGET: 4000,   // Dijkstra pops per update (3× that synchronously per command)
  // ---- pathogens ----------------------------------------------------------
  VIRUS_R: 3.2, BACT_R: 2.8, BACT_LEN: 2.2,
  BROWN: 7,           // virus drift (µm/s)
  VIRUS_MIG: 40,      // virus lateral migration speed toward the a≈0.6 lane (µm/s per unit a)
  BACT_SWIM: 14, BACT_CARRY: 0.8, BACT_FLEE: 22,
  BACT_STICK: 0.06,   // /s chance to colonise when touching a wall
  BACT_DIV: 16,       // s between divisions (only colonised bacteria divide)
  BACT_CAP: 90,
  COLONY_MAX: 4,      // a wall colony stops dividing at this many bacteria
  // ---- game ---------------------------------------------------------------
  START_WBC: 220,
  WBC_CAP: 600,
  REINF_T: 5, REINF_N: 10,
  SITE_HP: 220,       // WBC·seconds to destroy a site (grows per wave)
  SITE_PICK: 160,     // a move order this close to a lesion becomes an attack order
  SITE_CROWD: 30,     // at most this many cells drain a site at once
  SITE_REACH: 5,      // cells within site radius + this × WBC_R of the lesion centre attack it (2–3 layers of relaxed cells)
  SITE_REGEN: 0.006,  // hp/s when nobody attacks
  EMIT_V: 4.5, EMIT_B: 9.0,   // s between emissions (virus / bacteria site)
  INF_LIVE: 0.00008,  // infection /s per live pathogen
  INF_SITE: 0.0006,   // infection /s per live site
  INF_ESC_V: 0.008, INF_ESC_B: 0.013,
  INF_DECAY: 0.004,
  WAVES: 8, WAVE_T: 180, WAVE_BREAK: 10, FIRST_WAVE: 4,
  MOPUP_T: 30,        // s after the final wave's last lesion falls before stragglers are cleared (win)
  RBC_DENS: 0.19,     // area fraction of the lumen the red-cell pool aims for (measured ≈ 16–18 %)
}, BV.SIM_TUNE || {});

// ---------------------------------------------------------------------------
function Rng(seed){ this.s = (seed>>>0) ^ 0x9E3779B9; for(let i=0;i<4;i++) this.next(); }
Rng.prototype.next = function(){
  let a = this.s = (this.s + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// same stream as a 30-bit integer (a small int is never boxed, even when V8
// does not inline the call); caller scales by RI30 → [0, 1)
Rng.prototype.ni = function(){
  let a = this.s = (this.s + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return (t ^ (t >>> 14)) >>> 2;
};
const RI30 = 1/1073741824;
const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x-a)/(b-a))); return t*t*(3-2*t); };
const DI = [1,1,0,-1,-1,-1,0,1], DJ = [0,1,1,1,0,-1,-1,-1];
// wall projection: growing over-relaxation per try (where vessels of different
// wall thickness blend, e.g. junction crotches, the limit moves along with ∇N)
const RELAX = [1, 1.6, 2.5, 4, 4];
const DL = [1,Math.SQRT2,1,Math.SQRT2,1,Math.SQRT2,1,Math.SQRT2];
const DCX = new Float64Array(8), DCY = new Float64Array(8);
for(let k=0;k<8;k++){ DCX[k] = DI[k]/DL[k]; DCY[k] = DJ[k]/DL[k]; }

// unit states
const HOLD = 0, MOVE = 1, ADH = 2, CHASE = 3, TRANSIT = 4, DYING = 5;
// flags (instance buffer)
const F_SEL = 1, F_EAT = 2, F_HIT = 4, F_DIE = 8, F_ADH = 16, F_HOV = 32;

// ---------------------------------------------------------------------------
// spatial hash: counting sort into buckets, exact cell check (no duplicates)
function Hash(cap, cell, bits){
  this.cell = cell; this.inv = 1/cell; this.mask = (1<<bits) - 1;
  this.start = new Int32Array((1<<bits) + 1);
  this.items = new Int32Array(cap); this.bk = new Int32Array(cap);
  this.cx = new Int32Array(cap); this.cy = new Int32Array(cap);
}
Hash.prototype.key = function(cx, cy){ return (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) & this.mask; };
Hash.prototype.build = function(n, X, Y, skip){
  const st = this.start, inv = this.inv, M = this.mask + 1;
  st.fill(0);
  for(let i=0;i<n;i++){
    if(skip && skip(i)){ this.bk[i] = -1; continue; }
    const cx = Math.floor(X[i]*inv), cy = Math.floor(Y[i]*inv);
    this.cx[i] = cx; this.cy[i] = cy;
    const b = this.key(cx, cy); this.bk[i] = b; st[b+1]++;
  }
  for(let b=0;b<M;b++) st[b+1] += st[b];
  // fill (st[b] is used as a cursor, then restored)
  for(let i=0;i<n;i++){ const b = this.bk[i]; if(b >= 0) this.items[st[b]++] = i; }
  for(let b=M; b>0; b--) st[b] = st[b-1];
  st[0] = 0;
};

// ===========================================================================
BV.createSim = function(net, opts){
  opts = opts || {};
  const R = CONST.WBC_R, RR = CONST.RBC_R;
  const MAXW = opts.maxWbc || 1500, MAXR = opts.maxRbc || 5000;
  const MAXP = 640, MAXS = 32, MAXFX = 128, MAXF = 8;
  const b0 = net.bounds;
  // field samples go through Float64Arrays (net.sample.f): io[10], io[11] = x, y →
  // io[0..9] = N, rB, d, gx, gy, fx, fy, oxy, kind, wall. No per-call allocation.
  const SF = new Float64Array(12), AF = new Float64Array(12), LF = new Float64Array(12);
  const sampleF = net.sample.f || (() => { const o = {}; return io => { net.sample(io[10], io[11], o); io[0] = o.N; io[1] = o.rB; io[2] = o.d; io[3] = o.gx; io[4] = o.gy; io[5] = o.fx; io[6] = o.fy; io[7] = o.oxy; io[8] = o.kind; io[9] = o.wall; return io; }; })();
  const ev = {};

  // mean of the heart curve (planner uses the cycle-averaged pulse)
  let hMean = 0; for(let i=0;i<600;i++) hMean += BV.heart(i/600*60/66, 66); hMean /= 600;
  const pkMean = k => { const a = 0.72+0.56*hMean, c = 0.9+0.2*hMean, v = 0.96+0.08*hMean; return k <= 1 ? a + (c-a)*k : c + (v-c)*(k-1); };

  // ---- inlets / outlets ("mouths") ---------------------------------------
  const mouths = [];
  function endDir(P, atEnd){
    const n = P.length, r = atEnd ? P[n-1][2] : P[0][2];
    if(!atEnd){ let k=1; while(k<n-1 && Math.hypot(P[k][0]-P[0][0],P[k][1]-P[0][1]) < 1.2*r) k++; const dx=P[k][0]-P[0][0], dy=P[k][1]-P[0][1], L=Math.hypot(dx,dy)||1; return [dx/L,dy/L]; }
    const m=n-1; let k=m-1; while(k>0 && Math.hypot(P[k][0]-P[m][0],P[k][1]-P[m][1]) < 1.2*r) k--; const dx=P[m][0]-P[k][0], dy=P[m][1]-P[k][1], L=Math.hypot(dx,dy)||1; return [dx/L,dy/L];
  }
  for(const n of net.inlets) for(const e of n.outs){ const t = endDir(e.pts, false); mouths.push({ x:n.x, y:n.y, ox:-t[0], oy:-t[1], r:e.pts[0][2], out:false, art:e.type==='art' }); }
  for(const n of net.outlets) for(const e of n.ins){ const t = endDir(e.pts, true); mouths.push({ x:n.x, y:n.y, ox:t[0], oy:t[1], r:e.pts[e.pts.length-1][2], out:true, art:e.type==='art' }); }
  const NM = mouths.length;
  const mX = new Float64Array(NM), mY = new Float64Array(NM), mOX = new Float64Array(NM), mOY = new Float64Array(NM), mR2 = new Float64Array(NM), mOut = new Uint8Array(NM);
  mouths.forEach((m,i)=>{ mX[i]=m.x; mY[i]=m.y; mOX[i]=m.ox; mOY[i]=m.oy; mR2[i]=(2.6*m.r)*(2.6*m.r); mOut[i]=m.out?1:0; });
  let inMouth = mouths.filter(m=>!m.out).sort((a,b)=> (b.art-a.art) || (b.r-a.r))[0] || null;
  // re-entry point just inside the arterial inlet (known before the nav grid is)
  const inEntryX = inMouth ? inMouth.x - inMouth.ox*1.3*inMouth.r : 0.5*(b0.x0 + b0.x1);
  const inEntryY = inMouth ? inMouth.y - inMouth.oy*1.3*inMouth.r : 0.5*(b0.y0 + b0.y1);
  // returns the mouth index a point is beyond (within `margin` of the mouth plane), or -1
  // hot-path variant without double arguments: MB = [x, y, margin]
  const MB = new Float64Array(3);
  function mouthAt(){
    const x = MB[0], y = MB[1], margin = MB[2];
    for(let i=0;i<NM;i++){
      const dx = x - mX[i], dy = y - mY[i];
      if(dx*dx + dy*dy < mR2[i] && dx*mOX[i] + dy*mOY[i] > -margin) return i;
    }
    return -1;
  }
  function beyondMouth(x, y, margin){
    for(let i=0;i<NM;i++){
      const dx = x - mX[i], dy = y - mY[i];
      if(dx*dx + dy*dy < mR2[i] && dx*mOX[i] + dy*mOY[i] > -margin) return i;
    }
    return -1;
  }

  // =========================================================================
  //  NAV GRID (built in slices: coarse 2·CS lattice, then CS nodes where needed)
  // =========================================================================
  const CS = TUNE.NAV_CS;
  const OX = b0.x0, OY = b0.y0;
  const NW = Math.ceil((b0.x1-b0.x0)/CS) + 1, NH = Math.ceil((b0.y1-b0.y0)/CS) + 1;
  const CW = (NW>>1) + 2, CH = (NH>>1) + 2;
  const nidx = new Int32Array(NW*NH).fill(-1);
  let cN = new Float32Array(CW*CH), cA = new Float32Array(CW*CH*7), cC = new Int32Array(CW*CH);
  let fN = new Float32Array(NW*NH), fA = new Float32Array(NW*NH*7);
  const nav = { phase:0, row:0, ready:false, n:0, evals:0, mid:0, ms:0 };
  let nX, nY, nUx, nUy, nEf, nMouth, nb, cost, heap, hpos, hN = 0;
  let outMouthNodes = [], inEntry = -1;
  // Built in slices (time budget per call); the result does not depend on the
  // slicing, and a command before completion finishes it synchronously.
  let nN, nGx, nGy;
  function navStep(budgetMs){
    if(nav.ready) return;
    const t0 = performance.now();
    while(!nav.ready && performance.now() - t0 < budgetMs){
      if(nav.phase === 0) navCoarseRows(1);
      else if(nav.phase === 1) navFineRows(2);
      else if(nav.phase === 2) navCompact(8);
      else if(nav.phase === 3) navAttrRows(8);
      else if(nav.phase === 4) navEdgeRows(3);
      else navDone();
    }
    nav.ms += performance.now() - t0;
  }
  function navCoarseRows(rows){
    const N_ = cN, A_ = cA, C_ = cC;
    for(let r=0; r<rows && nav.row < CH; r++){
      const J = nav.row++;
      for(let I=0;I<CW;I++){
        const k = J*CW + I;
        net.evalAt(OX + 2*CS*I, OY + 2*CS*J, ev); nav.evals++;
        N_[k] = ev.N; C_[k] = ev.chain; const o = k*7;
        A_[o] = ev.rB; A_[o+1] = ev.fx; A_[o+2] = ev.fy; A_[o+3] = ev.kind; A_[o+4] = ev.gx; A_[o+5] = ev.gy; A_[o+6] = ev.wall;
      }
    }
    if(nav.row >= CH){ nav.phase = 1; nav.row = 0; }
  }
  function navFineRows(rows){
    const cN_ = cN, cA_ = cA, cC_ = cC, fN_ = fN, fA_ = fA;
    for(let r=0; r<rows && nav.row < NH; r++){
      const j = nav.row++;
      const J0 = j>>1, J1 = (j+1)>>1;
      for(let i=0;i<NW;i++){
        const k = j*NW + i, o = k*7;
        const I0 = i>>1, I1 = (i+1)>>1;
        const c00 = J0*CW+I0, c10 = J0*CW+I1, c01 = J1*CW+I0, c11 = J1*CW+I1;
        if(c00 === c11){
          const c = c00*7; fN_[k] = cN_[c00];
          fA_[o] = cA_[c]; fA_[o+1] = cA_[c+1]; fA_[o+2] = cA_[c+2]; fA_[o+3] = cA_[c+3]; fA_[o+4] = cA_[c+4]; fA_[o+5] = cA_[c+5]; fA_[o+6] = cA_[c+6];
          continue;
        }
        const n00 = cN_[c00], n10 = cN_[c10], n01 = cN_[c01], n11 = cN_[c11];
        let nmin = n00 < n10 ? n00 : n10; if(n01 < nmin) nmin = n01; if(n11 < nmin) nmin = n11;
        if(nmin > 0.8){ fN_[k] = nmin; continue; }
        let nmax = n00 > n10 ? n00 : n10; if(n01 > nmax) nmax = n01; if(n11 > nmax) nmax = n11;
        const ch = cC_[c00];
        // one vessel under all corners: N is near-linear across a wall at this
        // spacing, so interpolate; junction blends (mixed chains) get exact values
        if(ch === cC_[c10] && ch === cC_[c01] && ch === cC_[c11] && nmax < 5){
          fN_[k] = 0.25*(n00 + n10 + n01 + n11);
          const a = c00*7, b = c10*7, c = c01*7, d = c11*7;
          fA_[o] = 0.25*(cA_[a]+cA_[b]+cA_[c]+cA_[d]);
          fA_[o+1] = 0.25*(cA_[a+1]+cA_[b+1]+cA_[c+1]+cA_[d+1]);
          fA_[o+2] = 0.25*(cA_[a+2]+cA_[b+2]+cA_[c+2]+cA_[d+2]);
          fA_[o+3] = 0.25*(cA_[a+3]+cA_[b+3]+cA_[c+3]+cA_[d+3]);
          fA_[o+4] = 0.25*(cA_[a+4]+cA_[b+4]+cA_[c+4]+cA_[d+4]);
          fA_[o+5] = 0.25*(cA_[a+5]+cA_[b+5]+cA_[c+5]+cA_[d+5]);
          fA_[o+6] = 0.25*(cA_[a+6]+cA_[b+6]+cA_[c+6]+cA_[d+6]);
          continue;
        }
        net.evalAt(OX + CS*i, OY + CS*j, ev); nav.evals++;
        fN_[k] = ev.N;
        fA_[o] = ev.rB; fA_[o+1] = ev.fx; fA_[o+2] = ev.fy; fA_[o+3] = ev.kind; fA_[o+4] = ev.gx; fA_[o+5] = ev.gy; fA_[o+6] = ev.wall;
      }
    }
    if(nav.row >= NH){ nav.phase = 2; nav.row = 0; }
  }
  function navCompact(rows){
    // lumen nodes (a WBC centre fits) → compact ids (sliced by rows)
    const fN_ = fN, fA_ = fA, NI = nidx;
    let n = nav.n;
    for(let r=0; r<rows && nav.row < NH; r++){
      const j = nav.row++;
      for(let i=0;i<NW;i++){
        const k = j*NW + i, N = fN_[k]; if(!(N < 0)) continue;
        if(N < -fA_[k*7+6] - (R+1)/fA_[k*7]){
          if(NM && beyondMouth(OX + CS*i, OY + CS*j, 0) >= 0) continue;
          NI[k] = n++;
        }
      }
    }
    nav.n = n;
    if(nav.row < NH) return;
    nX = new Float32Array(n); nY = new Float32Array(n); nUx = new Float32Array(n); nUy = new Float32Array(n);
    nEf = new Float32Array(n); nMouth = new Int8Array(n).fill(-1);
    nN = new Float32Array(n); nGx = new Float32Array(n); nGy = new Float32Array(n);
    nb = new Int32Array(n*8).fill(-1); cost = new Float32Array(n*8).fill(Infinity);
    nav.phase = 3; nav.row = 0;
  }
  function navAttrRows(rows){
    const fN_ = fN, fA_ = fA, NI = nidx;
    const pA = 0.72+0.56*hMean, pC = 0.9+0.2*hMean, pV = 0.96+0.08*hMean, CAR = TUNE.CARRY;
    for(let r=0; r<rows && nav.row < NH; r++){
      const j = nav.row++;
      for(let i=0;i<NW;i++){
        const k = j*NW + i, id = NI[k]; if(id < 0) continue;
        const o = k*7, rB = fA_[o], kind = fA_[o+3], wall = fA_[o+6];
        nX[id] = OX + CS*i; nY[id] = OY + CS*j;
        const pm = (kind <= 1 ? pA + (pC-pA)*kind : pC + (pV-pC)*(kind-1))*CAR;
        nUx[id] = fA_[o+1]*pm; nUy[id] = fA_[o+2]*pm;
        // Poiseuille factor at this node's own lateral position, but never below
        // the lane a few cells off the wall (where a crawling horde actually is)
        let a = 1 + fN_[k]; const amax = 1 - wall - 2.5*R/rB; if(a > amax) a = amax; a = a < 0 ? 0 : a > 1 ? 1 : a;
        nEf[id] = 1.6*(1 - a*a);
        nN[id] = fN_[k]; const gx = fA_[o+4], gy = fA_[o+5], gl = Math.sqrt(gx*gx + gy*gy) || 1; nGx[id] = gx/gl; nGy[id] = gy/gl;
      }
    }
    if(nav.row >= NH){ cN = cA = cC = fN = fA = null; nav.phase = 4; nav.row = 0; }
  }
  function navEdgeRows(rows){
    const NI = nidx, NB = nb, CO = cost, X_ = nX, Y_ = nY, UX = nUx, UY = nUy, EF = nEf, N_ = nN, GX = nGx, GY = nGy;
    const S2 = TUNE.NAV_S*TUNE.NAV_S, VMIN = TUNE.VMIN;
    for(let r=0; r<rows && nav.row < NH; r++){
      const j = nav.row++;
      for(let i=0;i<NW;i++){
        const id = NI[j*NW+i]; if(id < 0) continue;
        for(let k=0;k<8;k++){
          const ii = i+DI[k], jj = j+DJ[k];
          if(ii<0||jj<0||ii>=NW||jj>=NH) continue;
          const jd = NI[jj*NW+ii]; if(jd < 0) continue;
          if((k & 1) && NI[j*NW+ii] < 0 && NI[jj*NW+i] < 0) continue;   // no diagonal corner cutting
          const dx = DCX[k], dy = DCY[k];
          // a thin wall (carina) between two near-wall nodes: both outward normals face the edge
          if(N_[id] > -0.6 && N_[jd] > -0.6 && (GX[id]*dx + GY[id]*dy) > 0.15 && (GX[jd]*dx + GY[jd]*dy) < -0.15){
            net.evalAt(0.5*(X_[id]+X_[jd]), 0.5*(Y_[id]+Y_[jd]), ev); nav.mid++;
            if(!(ev.N < -ev.wall - 0.5*R/ev.rB)) continue;
          }
          // mean flow along the move (lanes stay neutral downstream); the part
          // across the move, and anything against it, at the local Poiseuille speed
          const ux = 0.5*(UX[id]+UX[jd]), uy = 0.5*(UY[id]+UY[jd]), ef = 0.5*(EF[id]+EF[jd]);
          let up = ux*dx + uy*dy;
          const p2 = (ux*ux + uy*uy - up*up)*ef*ef;
          if(up < 0) up *= ef;
          const s = p2 < S2 ? Math.sqrt(S2 - p2) : 0;
          let v = s + up; if(v < VMIN) v = VMIN;
          NB[id*8+k] = jd; CO[id*8+k] = CS*DL[k]/v;
        }
      }
    }
    if(nav.row >= NH) nav.phase = 5;
  }
  function navDone(){
    // outlet mouths (linked to the inlet) and the inlet entry node
    outMouthNodes = [];
    const n = nav.n;
    for(let id=0; id<n; id++){
      for(let m=0;m<NM;m++){
        if(!mOut[m]) continue;
        const dx = nX[id]-mX[m], dy = nY[id]-mY[m], r = mouths[m].r;
        if(dx*dx+dy*dy < 1.44*r*r && dx*mOX[m]+dy*mOY[m] > -2.2*CS){ nMouth[id] = m; outMouthNodes.push(id); break; }
      }
    }
    if(inMouth) inEntry = nearestNode(inEntryX, inEntryY, 40);
    heap = new Int32Array(n); hpos = new Int32Array(n);
    nN = nGx = nGy = null;
    nav.ready = true; nav.phase = 6;
  }
  function nearestNode(x, y, maxRing){
    const ci = Math.round((x-OX)/CS), cj = Math.round((y-OY)/CS);
    let best = -1, bd = Infinity;
    for(let ring=0; ring<=maxRing; ring++){
      for(let j=cj-ring;j<=cj+ring;j++) for(let i=ci-ring;i<=ci+ring;i++){
        if(Math.max(Math.abs(i-ci), Math.abs(j-cj)) !== ring) continue;
        if(i<0||j<0||i>=NW||j>=NH) continue;
        const id = nidx[j*NW+i]; if(id < 0) continue;
        const d = (nX[id]-x)*(nX[id]-x) + (nY[id]-y)*(nY[id]-y);
        if(d < bd){ bd = d; best = id; }
      }
      if(best >= 0 && ring*CS > Math.sqrt(bd) + CS) break;
    }
    return best;
  }
  function ensureNav(){ if(!nav.ready) navStep(1e9); }

  // ---- flow fields (one per active order) ---------------------------------
  // Dijkstra from the target over the nav graph with an indexed binary heap
  // (keys kept inside the heap array for cache-friendly sifting).
  const fields = [];
  let pending = null, serialCounter = 0, hK = null;
  function newField(){ const n = nav.n; return { T:new Float32Array(n), link:new Uint8Array(n), dx:new Float32Array(n), dy:new Float32Array(n), dok:new Uint8Array(n),
    tx:0, ty:0, rs:100, seeds:0, site:-1, siteId:0, tnode:-1, done:true, linked:false, serial:0, users:0, arrived:0, stamp:0, pops:0, ms:0, readyFrame:0 }; }
  // Seeds: every lumen node of the target's cross-section (within Rs, connected
  // to the target inside that disc) starts with a small cost ramp toward the
  // target. A point seed would make every lane converge on it from far away; a
  // cross-section seed keeps the horde spread over the vessel width and leaves
  // the final gathering to the arrival steering.
  let seedQ = null;
  function heapInsert(id, v){
    let k = hN++;
    while(k > 0){ const p = (k-1)>>1; if(hK[p] <= v) break; heap[k] = heap[p]; hK[k] = hK[p]; hpos[heap[k]] = k; k = p; }
    heap[k] = id; hK[k] = v; hpos[id] = k;
  }
  function fieldStart(F, tnode, rs){
    if(pending && pending !== F) fieldStep(pending, 1e12);
    if(!hK){ hK = new Float64Array(nav.n); seedQ = new Int32Array(nav.n); }
    F.T.fill(Infinity); F.link.fill(0); F.dok.fill(0);
    hpos.fill(-1); hN = 0;
    F.tnode = tnode;
    const tx = F.tx, ty = F.ty, rs2 = rs*rs, ramp = TUNE.SEED_RAMP/TUNE.NAV_S;
    let qh = 0, qt = 0; seedQ[qt++] = tnode; F.T[tnode] = 0; F.dok[tnode] = 1;
    while(qh < qt){
      const j = seedQ[qh++];
      const d = Math.hypot(nX[j]-tx, nY[j]-ty);
      F.T[j] = d*ramp; heapInsert(j, F.T[j]);
      for(let k=0;k<8;k++){
        const i = nb[j*8+k]; if(i < 0 || F.dok[i]) continue;
        const dx = nX[i]-tx, dy = nY[i]-ty; if(dx*dx + dy*dy > rs2) continue;
        F.dok[i] = 1; seedQ[qt++] = i;
      }
    }
    F.dok.fill(0);
    F.seeds = qt;
    F.done = false; F.linked = false; F.pops = 0; F.ms = 0;
    pending = F;
  }
  function fieldStep(F, maxPops){
    const T = F.T, LNK = F.link, t0 = performance.now(), RC = TUNE.RECIRC_COST;
    const H = heap, K = hK, POS = hpos, NB = nb, CO = cost, OM = outMouthNodes, IE = inEntry;
    let n = hN, pops = 0;
    // place node id with key v at slot k and sift it up
    const up = (k, id, v) => {
      while(k > 0){ const p = (k-1)>>1; const kp = K[p]; if(kp <= v) break; const pid = H[p]; H[k] = pid; K[k] = kp; POS[pid] = k; k = p; }
      H[k] = id; K[k] = v; POS[id] = k;
    };
    while(n > 0 && pops < maxPops){
      const j = H[0], Tj = K[0];
      n--;
      if(n > 0){
        const id = H[n], v = K[n];
        let k = 0;
        for(;;){
          let c = 2*k + 1; if(c >= n) break;
          if(c + 1 < n && K[c+1] < K[c]) c++;
          if(K[c] >= v) break;
          H[k] = H[c]; K[k] = K[c]; POS[H[k]] = k; k = c;
        }
        H[k] = id; K[k] = v; POS[id] = k;
      }
      POS[j] = -2; pops++;
      if(j === IE && !F.linked){
        F.linked = true;
        const tl = Tj + RC;
        for(let q=0;q<OM.length;q++){
          const m = OM[q];
          if(POS[m] === -2 || !(tl < T[m])) continue;
          T[m] = tl; LNK[m] = 1;
          if(POS[m] >= 0) up(POS[m], m, tl); else { up(n, m, tl); n++; }
        }
      }
      const base = j*8;
      for(let k=0;k<8;k++){
        const i = NB[base+k]; if(i < 0) continue;
        const pi = POS[i]; if(pi === -2) continue;
        const t = Tj + CO[i*8 + (k^4)];
        if(t < T[i]){
          T[i] = t; LNK[i] = 0;
          if(pi >= 0) up(pi, i, t); else { up(n, i, t); n++; }
        }
      }
    }
    hN = n;
    F.pops += pops; F.ms += performance.now() - t0;
    if(n === 0){ F.done = true; if(pending === F) pending = null; }
  }
  // direction at a node: best neighbour, refined toward the better adjacent one
  const ND = new Float64Array(2);
  function nodeDir(F, id){
    if(F.dok[id]){ ND[0] = F.dx[id]; ND[1] = F.dy[id]; return true; }
    const T = F.T;
    if(F.link[id]){ const m = nMouth[id]; ND[0] = mOX[m]; ND[1] = mOY[m]; }
    else {
      const base = id*8;
      let bq = Infinity, bk = -1;
      for(let k=0;k<8;k++){ const j = nb[base+k]; if(j < 0) continue; const q = cost[base+k] + T[j]; if(q < bq){ bq = q; bk = k; } }
      if(bk < 0 || !(bq < Infinity)) return false;
      const km = (bk+7)&7, kp = (bk+1)&7;
      const jm = nb[base+km], jp = nb[base+kp];
      const qm = jm >= 0 ? cost[base+km] + T[jm] : Infinity, qp = jp >= 0 ? cost[base+kp] + T[jp] : Infinity;
      // near-ties: any direction in the admissible cone is as good as the best
      // one, so follow the flow there (cells keep their lanes instead of all
      // cutting toward the same line)
      const tau = TUNE.TIE*cost[base+bk];
      const ux = nUx[id], uy = nUy[id], ul = Math.sqrt(ux*ux + uy*uy);
      if(ul > 15 && tau > 0){
        const fa = Math.atan2(uy, ux)*4/Math.PI;               // flow angle in steps of 45°
        let rel = fa - bk; rel -= 8*Math.round(rel/8);          // −4..4
        const lo = qm <= bq + tau ? -1 : 0, hi = qp <= bq + tau ? 1 : 0;
        if(lo < hi && rel >= lo && rel <= hi){ ND[0] = ux/ul; ND[1] = uy/ul; cacheDir(F, id); return true; }
      }
      let off = 0;
      if(qm < Infinity && qp < Infinity){ const den = qm - 2*bq + qp; if(den > 1e-6){ off = 0.5*(qm - qp)/den; off = off < -0.5 ? -0.5 : off > 0.5 ? 0.5 : off; } }
      const ang = (bk + off)*Math.PI/4;
      ND[0] = Math.cos(ang); ND[1] = Math.sin(ang);
    }
    cacheDir(F, id);
    return true;
  }
  // a node's direction is final once it and all its neighbours are settled
  function cacheDir(F, id){
    if(!F.done){
      if(pending !== F || hpos[id] !== -2) return;
      const base = id*8;
      for(let k=0;k<8;k++){ const j = nb[base+k]; if(j >= 0 && hpos[j] !== -2) return; }
    }
    F.dx[id] = ND[0]; F.dy[id] = ND[1]; F.dok[id] = 1;
  }
  // bilinear direction at a point
  const NV = new Float64Array(5);   // out: dir x, y, cost-to-go T; in: NV[3], NV[4] = point
  function navDir(F, x, y){ NV[3] = x; NV[4] = y; return navDirIO(F); }
  function navDirIO(F){
    const x = NV[3], y = NV[4];
    const fx = (x - OX)/CS, fy = (y - OY)/CS;
    const i0 = Math.floor(fx), j0 = Math.floor(fy), a = fx - i0, b = fy - j0;
    const T = F.T;
    let sx = 0, sy = 0, sw = 0, sT = 0;
    for(let c=0;c<4;c++){
      const ii = i0 + (c&1), jj = j0 + (c>>1);
      if(ii<0||jj<0||ii>=NW||jj>=NH) continue;
      const id = nidx[jj*NW+ii]; if(id < 0 || !(T[id] < Infinity)) continue;
      const w = ((c&1) ? a : 1-a) * ((c>>1) ? b : 1-b) + 1e-4;
      if(!nodeDir(F, id)) continue;
      sx += w*ND[0]; sy += w*ND[1]; sw += w; sT += w*T[id];
    }
    if(sw > 0){
      const l = Math.sqrt(sx*sx + sy*sy);
      if(l > 1e-3*sw){ NV[0] = sx/l; NV[1] = sy/l; NV[2] = sT/sw; return true; }
    }
    // off the grid (fillet corner, wall-hugging spot): head for the nearest reached node
    let best = -1, bd = Infinity;
    for(let jj=j0-2;jj<=j0+3;jj++) for(let ii=i0-2;ii<=i0+3;ii++){
      if(ii<0||jj<0||ii>=NW||jj>=NH) continue;
      const id = nidx[jj*NW+ii]; if(id < 0 || !(T[id] < Infinity)) continue;
      const d = (nX[id]-x)*(nX[id]-x) + (nY[id]-y)*(nY[id]-y);
      if(d < bd){ bd = d; best = id; }
    }
    if(best < 0) return false;
    const d = Math.sqrt(bd) || 1;
    NV[0] = (nX[best]-x)/d; NV[1] = (nY[best]-y)/d; NV[2] = T[best];
    return true;
  }

  // =========================================================================
  //  STATE
  // =========================================================================
  // --- WBCs (dense, swap-remove) -------------------------------------------
  const W = {};
  const WF = ['flash','gap','x','y','vx','vy','hx','hy','lx','ly','ax','ay','tim','dig','digD','chg','ph','tint','sz','act','con','sepx','sepy','stT','stN','fl','fade','npd','npx','npy','seed',
    // soft body (display): jiggle amplitude, stretch spring (value, rate), smoothed ground velocity, squeeze target offset
    'jig','str','strV','pvx','pvy','sqz'];
  for(const k of WF) W[k] = new Float32Array(MAXW);
  W.st = new Uint8Array(MAXW); W.prev = new Uint8Array(MAXW); W.sel = new Uint8Array(MAXW); W.hov = new Uint8Array(MAXW);
  W.eat = new Uint8Array(MAXW); W.touch = new Uint8Array(MAXW); W.rch = new Uint8Array(MAXW);
  W.ord = new Int16Array(MAXW); W.ser = new Int32Array(MAXW); W.cs = new Int32Array(MAXW); W.cg = new Int32Array(MAXW);
  W.clg = new Uint8Array(MAXW);   // long-range chase (slow prey beyond SENSE_IDLE)
  const WKEYS = Object.keys(W);
  let nW = 0;
  // --- pathogens (slots) ---------------------------------------------------
  const P = {};
  for(const k of ['x','y','vx','vy','ph','tint','age','div','divD','ang','fade','ex','ey','lx','ly','near','hit']) P[k] = new Float32Array(MAXP);
  P.type = new Uint8Array(MAXP); P.gen = new Int32Array(MAXP); P.adh = new Uint8Array(MAXP); P.chase = new Uint8Array(MAXP);
  const pFree = new Int32Array(MAXP); let pFreeN = 0;
  // --- sites (slots) -------------------------------------------------------
  const Sx = {};
  for(const k of ['x','y','nx','ny','ex','ey','cx','cy','r','hp','max','rate','tim','ph','tint','crowd','flash','emit','die','ncnt']) Sx[k] = new Float32Array(MAXS);
  Sx.alive = new Uint8Array(MAXS); Sx.kind = new Uint8Array(MAXS); Sx.id = new Int32Array(MAXS); let siteSerial = 0;
  // --- FX (slots) ----------------------------------------------------------
  const FX = { x:new Float32Array(MAXFX), y:new Float32Array(MAXFX), r:new Float32Array(MAXFX), age:new Float32Array(MAXFX), dur:new Float32Array(MAXFX), kind:new Uint8Array(MAXFX), ph:new Float32Array(MAXFX), on:new Uint8Array(MAXFX) };
  // --- red cells -------------------------------------------------------------
  const Rc = {};
  for(const k of ['x','y','d','a','tp','tr','r','o','al','fr','sd']) Rc[k] = new Float32Array(MAXR);
  let nR = 0;
  // --- hashes / scratch -----------------------------------------------------
  const hashF = new Hash(MAXW, 24, 12);     // separation / contacts
  const hashC = new Hash(MAXW, 64, 11);     // sensing, sites, selection
  const bfsQ = new Int32Array(MAXW), mark = new Int32Array(MAXW); let markStamp = 1;
  const skipW = i => W.st[i] === TRANSIT;
  // --- output ---------------------------------------------------------------
  const rbc = { data: new Float32Array(MAXR*8), count: 0 };
  const units = { data: new Float32Array((MAXW + MAXP + MAXS + MAXFX)*16), count: 0 };
  const events = [];
  const stats = { wbc:0, selected:0, viruses:0, bacteria:0, sites:0, infection:0, immunity:0, score:0, wave:0, time:0, state:'play',
                  transit:0, captured:0, escaped:0, sitesDown:0, deaths:0, reinforced:0 };
  const orders = []; for(let i=0;i<MAXF;i++) orders.push({ active:false, x:0, y:0, n:0, serial:0, done:false, attack:false });
  const ordUsers = new Int32Array(MAXF), ordMoving = new Int32Array(MAXF);
  const home = { x: 0, y: 0 };

  let rng, rngV, rngR, simTime, pulse, frame, vframe = 0, diff, infection, score, wave, waveDeadline, breakUntil, nextReinf, state;
  const dbg = { kicks:0, projections:0, reverts:0, nanFix:0, lastUpdateMs:0, prof:null };

  // =========================================================================
  //  helpers
  // =========================================================================
  function isLumen(x, y, rad){
    SF[10] = x; SF[11] = y; sampleF(SF);
    return SF[0] < -SF[9] - rad/SF[1] && beyondMouth(x, y, rad) < 0;
  }
  function lineOfSight(x0, y0, x1, y1){
    for(let k=1;k<=3;k++){
      const t = k/4; LF[10] = x0 + (x1-x0)*t; LF[11] = y0 + (y1-y0)*t; sampleF(LF);
      if(!(LF[0] < -LF[9])) return false;
    }
    return true;
  }
  function wallAnchor(i){
    // nearest lumen-edge point for a cell's centre (N·rB is only an approximate
    // distance inside junction blends, so walk there in a few corrected steps)
    let px = W.x[i], py = W.y[i];
    for(let it=0; it<6; it++){
      AF[10] = px; AF[11] = py; sampleF(AF);
      const gap = (-AF[9] - (R*W.sz[i] + TUNE.WALL_GAP)/AF[1] - AF[0])*AF[1] - 0.5;
      if(gap > -0.3 && gap < 0.3) break;
      const step = Math.max(-0.4*AF[1], Math.min(0.6*AF[1], gap));
      px += AF[3]*step; py += AF[4]*step;
    }
    exactInside(px, py, R*W.sz[i] + TUNE.WALL_GAP + 0.5);
    W.ax[i] = EX[0]; W.ay[i] = EX[1];
  }
  // exact-field correction (net.evalAt) for points that stay put — anchors and
  // adhered cells: the bilinear physics tiles can be a few µm off where vessels
  // of different radius blend
  const EX = new Float64Array(2);
  function exactInside(x, y, rad){
    for(let it=0; it<4; it++){
      net.evalAt(x, y, ev);
      const gap = (-ev.wall - ev.N)*ev.rB - rad;
      if(gap >= 0 || !(ev.N < 50)) break;
      const st = -gap*RELAX[it] + 0.1; x -= ev.gx*st; y -= ev.gy*st;
    }
    EX[0] = x; EX[1] = y;
  }
  function addWbc(x, y, st){
    if(nW >= MAXW) return -1;
    const i = nW++;
    for(const k of WKEYS) W[k][i] = 0;
    W.x[i] = x; W.y[i] = y; W.st[i] = st; W.ord[i] = -1; W.cs[i] = -1;
    const a = rng.next()*Math.PI*2; W.hx[i] = Math.cos(a); W.hy[i] = Math.sin(a); W.lx[i] = W.hx[i]; W.ly[i] = W.hy[i];
    W.chg[i] = 1; W.ph[i] = rng.next()*100; W.tint[i] = rng.next(); W.sz[i] = 0.94 + 0.12*rng.next(); W.seed[i] = rng.next()*1000;
    W.fade[i] = 0; W.npd[i] = 1e9; W.str[i] = 1;
    wallAnchor(i);
    return i;
  }
  // soft body (display only): raise the jiggle to at least `a` (0..1) and give
  // the squash & stretch spring a kick (stretches along the heading) …
  function jiggle(i, a, kick){
    if(W.jig[i] < a) W.jig[i] = a;
    W.strV[i] += kick;
  }
  // … or a brief squash: the spring's rate is set so the stretch dips to about
  // 1 − depth from wherever it is (a moving cell is elongated), then rebounds
  function squash(i, a, depth){
    if(W.jig[i] < a) W.jig[i] = a;
    let v = -(W.str[i] - 1 + depth)*TUNE.STR_W*1.6; if(v < -6) v = -6;
    if(v < W.strV[i]) W.strV[i] = v;
  }
  function removeWbc(i){
    const l = --nW;
    if(i !== l) for(const k of WKEYS) W[k][i] = W[k][l];
  }
  function allocP(){
    if(pFreeN > 0) return pFree[--pFreeN];
    return -1;
  }
  function killP(p){ P.type[p] = 0; P.gen[p]++; pFree[pFreeN++] = p; }
  function addPathogen(type, x, y, ex, ey){
    if(type === 2){ let nb = 0; for(let p=0;p<MAXP;p++) if(P.type[p] === 2) nb++; if(nb >= TUNE.BACT_CAP) return -1; }
    const p = allocP(); if(p < 0) return -1;
    P.type[p] = type; P.x[p] = x; P.y[p] = y; P.vx[p] = 0; P.vy[p] = 0; P.ph[p] = rng.next()*100; P.tint[p] = rng.next();
    P.age[p] = 0; P.divD[p] = TUNE.BACT_DIV*(0.8 + 0.4*rng.next()); P.div[p] = P.divD[p];
    P.ang[p] = rng.next()*Math.PI*2; P.fade[p] = 0; P.ex[p] = ex||0; P.ey[p] = ey||0; P.adh[p] = 0; P.chase[p] = 0;
    P.lx[p] = Math.cos(P.ang[p]); P.ly[p] = Math.sin(P.ang[p]); P.near[p] = 1e9; P.hit[p] = 0;
    const rad = type === 1 ? TUNE.VIRUS_R : TUNE.BACT_R*1.4;
    for(let it=0; it<6; it++){
      AF[10] = P.x[p]; AF[11] = P.y[p]; sampleF(AF);
      const lim = -AF[9] - rad/AF[1]; if(AF[0] <= lim) return p;
      const pen = ((AF[0] - lim)*AF[1] + 0.1)*RELAX[it < 4 ? it : 3]; P.x[p] -= AF[3]*pen; P.y[p] -= AF[4]*pen;
    }
    killP(p);            // no room in the lumen here
    return -1;
  }
  function addFx(kind, x, y, r, dur){
    let s = -1, oldest = -1, oa = -1;
    for(let k=0;k<MAXFX;k++){ if(!FX.on[k]){ s = k; break; } const a = FX.age[k]/FX.dur[k]; if(a > oa){ oa = a; oldest = k; } }
    if(s < 0) s = oldest;
    FX.on[s] = 1; FX.kind[s] = kind; FX.x[s] = x; FX.y[s] = y; FX.r[s] = r; FX.age[s] = 0; FX.dur[s] = dur; FX.ph[s] = rng.next()*100;
  }
  function emit(e){ events.push(e); if(events.length > 256) events.splice(0, events.length - 256); }

  // bezier point helpers (site / home placement)
  const BZ = net.beziers;
  function bzPoint(b, t, out){
    const u = 1-t;
    out.x = u*u*b.ax + 2*u*t*b.bx + t*t*b.cx; out.y = u*u*b.ay + 2*u*t*b.by + t*t*b.cy;
    let tx = 2*(u*(b.bx-b.ax) + t*(b.cx-b.bx)), ty = 2*(u*(b.by-b.ay) + t*(b.cy-b.by));
    const l = Math.hypot(tx,ty) || 1; out.tx = tx/l; out.ty = ty/l; out.r = b.r0 + (b.r2-b.r0)*t; out.k = b.k0 + (b.k2-b.k0)*t;
    return out;
  }
  const bzLen = BZ.map(b => Math.hypot(b.bx-b.ax, b.by-b.ay) + Math.hypot(b.cx-b.bx, b.cy-b.by));

  // =========================================================================
  //  RESET / SETUP
  // =========================================================================
  // difficulty factor: a number (clamped 0.3..3) or 'easy' 0.7 / 'normal' 1 / 'hard' 1.4
  function parseDifficulty(d){
    if(typeof d === 'number') return d === d ? Math.max(0.3, Math.min(3, d)) : 1;
    return d === 'easy' ? 0.7 : d === 'hard' ? 1.4 : 1;
  }
  function reset(seed){
    seed = (seed == null ? (opts.seed|0) : seed|0);
    rng = new Rng(seed*2654435761 + 17); rngV = new Rng(seed*40503 + 991); rngR = new Rng(seed*69069 + 4057);
    diff = parseDifficulty(opts.difficulty);
    simTime = 0; pulse = BV.heart(0, 66); frame = 0;
    infection = 0; score = 0; wave = 0; waveDeadline = TUNE.FIRST_WAVE; breakUntil = -1; nextReinf = TUNE.REINF_T; state = 'play';
    nW = 0; nR = 0; rbcInit = false;
    P.type.fill(0); pFreeN = 0; for(let p=MAXP-1;p>=0;p--) pFree[pFreeN++] = p;
    Sx.alive.fill(0); FX.on.fill(0);
    for(const F of fields){ F.serial = 0; F.users = 0; }
    pending = null; hN = 0;
    for(const o of orders){ o.active = false; }
    events.length = 0;
    Object.assign(stats, { wbc:0, selected:0, viruses:0, bacteria:0, sites:0, infection:0, immunity:0, score:0, wave:0, time:0, state:'play',
      transit:0, captured:0, escaped:0, sitesDown:0, deaths:0, reinforced:0 });
    placeHome();
    const n0 = Math.min(opts.startWbc != null ? opts.startWbc : TUNE.START_WBC, MAXW);
    spawnCluster(home.x, home.y, n0, HOLD);
  }
  function placeHome(){
    // an arterial branch of comfortable width, not too far from the inlet
    let best = null, bs = Infinity; const o = {};
    const ix = inMouth ? inMouth.x : b0.x0, iy = inMouth ? inMouth.y : 0.5*(b0.y0+b0.y1);
    for(let i=0;i<BZ.length;i++){
      const b = BZ[i]; if(b.k0 > 0.3 || b.k2 > 0.3) continue;
      bzPoint(b, 0.5, o);
      if(o.r < 170 || o.r > 520) continue;
      const d = Math.hypot(o.x-ix, o.y-iy);
      if(d < 1800) continue;
      net.evalAt(o.x, o.y, ev); if(!(ev.N < -0.8) || Math.abs(ev.rB - o.r) > 0.08*o.r) continue;
      const s = d + 6*Math.abs(o.r - 300);
      if(s < bs){ bs = s; best = { x:o.x, y:o.y }; }
    }
    if(!best && inMouth) best = { x: inEntryX, y: inEntryY };
    if(!best){ const b = BZ[0]; bzPoint(b, 0.5, o); best = { x:o.x, y:o.y }; }
    home.x = best.x; home.y = best.y;
  }
  function spawnCluster(cx, cy, n, st){
    const rad = 1.25*R*Math.sqrt(n/0.62) + 8;
    let made = 0;
    for(let tries=0; made<n && tries<n*60; tries++){
      const a = rng.next()*Math.PI*2, rr = rad*Math.sqrt(rng.next());
      const x = cx + Math.cos(a)*rr, y = cy + Math.sin(a)*rr;
      if(!isLumen(x, y, R+1)) continue;
      let ok = true;
      for(let j=nW-made; j<nW; j++){ const dx = W.x[j]-x, dy = W.y[j]-y; if(dx*dx+dy*dy < (1.9*R)*(1.9*R)){ ok = false; break; } }
      if(!ok) continue;
      const i = addWbc(x, y, st); if(i < 0) break;
      W.fade[i] = 1; made++;
    }
    return made;
  }

  // =========================================================================
  //  WBC STEP
  // =========================================================================
  function fieldOf(i){
    const o = W.ord[i]; if(o < 0) return null;
    const F = fields[o]; if(!F || F.serial !== W.ser[i]) return null;
    return F;
  }
  function arrive(i, F){
    if(F) F.arrived++;
    W.st[i] = HOLD; W.tim[i] = 0; W.stN[i] = 0; W.fl[i] = 0; W.rch[i] = 0;
    squash(i, 0.5, 0.08);            // pulling up: wobble + a brief squash
    const s = F ? F.site : -1;
    if(s >= 0 && Sx.alive[s] === 1 && Sx.id[s] === F.siteId){
      // attack order: pile onto the lesion (spread a little along the wall)
      const j = (((W.seed[i]*7.31) % 2) - 1)*0.9*Sx.r[s];
      W.ax[i] = Sx.cx[s] - Sx.ny[s]*j; W.ay[i] = Sx.cy[s] + Sx.nx[s]*j;
      const ax = W.ax[i], ay = W.ay[i];
      AF[10] = ax; AF[11] = ay; sampleF(AF);
      const gap = (-AF[9] - R/AF[1] - AF[0])*AF[1];
      if(gap < 0){ W.ax[i] = ax + AF[3]*gap; W.ay[i] = ay + AF[4]*gap; }
    } else wallAnchor(i);
  }
  function endChase(i){
    const F = fieldOf(i);
    W.cs[i] = -1;
    if(W.prev[i] === MOVE && F) W.st[i] = MOVE;
    else {
      W.st[i] = HOLD; W.tim[i] = 0;
      const dx = W.x[i]-W.ax[i], dy = W.y[i]-W.ay[i];
      if(dx*dx + dy*dy > TUNE.LEASH*TUNE.LEASH) wallAnchor(i);
    }
  }
  function stepUnits(h){
    const Tn = TUNE, hb = pulse;
    const pa = 0.72+0.56*hb, pc = 0.9+0.2*hb, pv = 0.96+0.08*hb;
    const X = W.x, Y = W.y, VX = W.vx, VY = W.vy, ST = W.st, PVX = W.pvx, PVY = W.pvy;
    hashF.build(nW, X, Y, skipW);
    const kRel = 1 - Math.exp(-h/Tn.TAU), kAdh = 1 - Math.exp(-h/Tn.TAU_ADH);
    const SEPD = Tn.SEP*R, SEPD2 = SEPD*SEPD, COHR = Tn.COH_R*R, COHR2 = COHR*COHR, TOUCH2 = (2.35*R)*(2.35*R);
    const hs = hashF, items = hs.items, start = hs.start, hcx = hs.cx, hcy = hs.cy;
    // soft body constants for this substep
    const ih = 1/h, kV = 1 - Math.exp(-h*14), kJ = Math.exp(-h*Tn.JIG_DECAY), JB = Tn.JIG_BUMP, iJV = JB/(Tn.JIG_V1 - Tn.JIG_V0), iJW = iJV/1.3;
    const OM2 = Tn.STR_W*Tn.STR_W, ZW = 2*Tn.STR_Z*Tn.STR_W, KA = Tn.STR_ACC;
    const JIG = W.jig, STR = W.str, STRV = W.strV, SQZ = W.sqz, HX = W.hx, HY = W.hy;
    for(let i=0;i<nW;i++){
      const st = ST[i];
      W.sepx[i] = 0; W.sepy[i] = 0;
      if(st === TRANSIT) continue;
      const x = X[i], y = Y[i];
      SF[10] = x; SF[11] = y; sampleF(SF);
      const N = SF[0], rB = SF[1], kind = SF[8], gx = SF[3], gy = SF[4];
      let a = 1 + N; a = a < 0 ? 0 : a > 1 ? 1 : a;
      const prof = 1.6*(1 - a*a);
      const pkk = kind <= 1 ? pa + (pc-pa)*kind : pc + (pv-pc)*(kind-1);
      let ux = SF[5]*prof*pkk, uy = SF[6]*prof*pkk;
      // next to a wall the flow runs along it: drop the blended field's component
      // into the wall (junction crotches would otherwise pin cells against the tip)
      { const un = ux*gx + uy*gy, gp = W.gap[i]; if(un > 0 && gp < 3*R){ const w = gp <= 0 ? 1 : 1 - gp/(3*R); ux -= un*gx*w; uy -= un*gy*w; } }
      const ul = Math.sqrt(ux*ux + uy*uy);
      const dig = W.dig[i] > 0;
      const S = Tn.SWIM * (dig ? Tn.DIGEST_SLOW : 1) * (0.9 + 0.1*Math.sin(simTime*2.3 + W.ph[i])) * (0.75 + 0.25*W.chg[i]);
      let c = Tn.CARRY, tx = 0, ty = 0, k = kRel;
      const mySer = W.ser[i];

      // ---- neighbours: separation, cohesion, alignment, contacts --------
      const cx0 = hcx[i], cy0 = hcy[i];
      const mob = st === ADH ? Tn.MOB_ADH : 1;
      let sx = 0, sy = 0, cnx = 0, cny = 0, cn = 0, avx = 0, avy = 0, touchAdh = 0, touchArr = 0;
      // soft body: overlap across / along the heading (squeeze), hardest impact (ground velocities)
      const hdx = HX[i], hdy = HY[i], pvxi = PVX[i], pvyi = PVY[i];
      let cpl = 0, cpa = 0, bump = 0;
      for(let qy=cy0-1; qy<=cy0+1; qy++) for(let qx=cx0-1; qx<=cx0+1; qx++){
        const bkt = hs.key(qx, qy);
        for(let q=start[bkt], qe=start[bkt+1]; q<qe; q++){
          const j = items[q];
          if(j === i || hcx[j] !== qx || hcy[j] !== qy) continue;
          const dx = x - X[j], dy = y - Y[j], d2 = dx*dx + dy*dy;
          if(d2 > COHR2) continue;
          const stj = ST[j];
          if(d2 < SEPD2){
            const d = Math.sqrt(d2) || 1e-3;
            const mobj = stj === ADH ? Tn.MOB_ADH : 1;
            const share = 2*mob/(mob + mobj);
            let push = Tn.K_SEP*(SEPD - d)*share;
            let nx = dx/d, ny = dy/d;
            if(d2 < 1e-6){ nx = Math.cos(W.seed[i]); ny = Math.sin(W.seed[i]); }
            sx += nx*push; sy += ny*push;
            const ov = SEPD - d, ca = nx*hdx + ny*hdy, oa = ov*ca*ca; cpa += oa; cpl += ov - oa;
            const app = (PVX[j] - pvxi)*nx + (PVY[j] - pvyi)*ny;      // closing speed
            if(app > bump) bump = app;
          }
          if(d2 < TOUCH2){
            if(stj === ADH) touchAdh = 1;
            if((stj === HOLD || stj === ADH) && W.ser[j] === mySer && mySer) touchArr = 1;
          }
          if(st === MOVE && stj === MOVE && W.ser[j] === mySer){ cnx += X[j]; cny += Y[j]; avx += VX[j]; avy += VY[j]; cn++; }
        }
      }
      const sl = Math.sqrt(sx*sx + sy*sy);
      if(sl > Tn.SEP_VMAX){ sx *= Tn.SEP_VMAX/sl; sy *= Tn.SEP_VMAX/sl; }
      // separation pushes that point into the wall are dropped (the wall holds the cell)
      const lim = -SF[9] - (R*W.sz[i] + Tn.WALL_GAP)/rB;
      if(N > lim - 1.5/rB){ const sn = sx*gx + sy*gy; if(sn > 0){ sx -= sn*gx; sy -= sn*gy;
        const ov = sn*(1/Tn.K_SEP), ca = gx*hdx + gy*hdy, oa = ov*ca*ca; cpa += oa; cpl += ov - oa; } }   // squeezed against the wall
      W.sepx[i] = sx; W.sepy[i] = sy;
      W.touch[i] = touchAdh;
      // squeeze: pressed from the sides (or a lumen barely wider than the cell)
      // → elongate along the heading; pressed head-on → flatten
      { let q = (cpl - cpa)*(1/Tn.SQ_K); const lw = rB*(1 - SF[9]); if(lw < 5*R) q += (5*R - lw)*(1/(2*R));
        SQZ[i] = q > 1 ? 0.1 : q > 0 ? 0.1*q : q < -1 ? -0.07 : 0.07*q; }
      if(bump > Tn.JIG_V0){ let J = (bump - Tn.JIG_V0)*iJV; if(J > JB) J = JB; if(J > JIG[i]) JIG[i] = J; }

      // ---- state machine → thrust (tx,ty), carriage c ---------------------
      let wantX = W.hx[i], wantY = W.hy[i], thrustOn = false;
      if(st === MOVE){
        const F = fieldOf(i);
        if(!F){ arrive(i, null); }
        else if(frame < F.readyFrame){
          // order given, its flow field still being built: hold station against the flow
          tx = -c*ux; ty = -c*uy; const tl = Math.sqrt(tx*tx+ty*ty); if(tl > S){ tx *= S/tl; ty *= S/tl; }
        } else {
          const dx = F.tx - x, dy = F.ty - y, dist = Math.sqrt(dx*dx + dy*dy) || 1e-3;
          const arrR = Tn.ARR_MIN + Tn.ARR_K*R*Math.sqrt(F.arrived);
          let inSeed = false;
          // inside the target's seed disc (connected to it through the lumen)
          if(dist < F.rs){ NV[3] = x; NV[4] = y; if(navDirIO(F)) inSeed = NV[2] <= F.rs*Tn.SEED_RAMP/Tn.NAV_S + 0.15; }
          if(dist < arrR || inSeed || (touchArr && dist < 3*arrR + 60)){ arrive(i, F); }
          else {
            let dirx, diry, ok = true, Tloc = 0;
            if(dist < Tn.NEAR_DIRECT){ dirx = dx/dist; diry = dy/dist; Tloc = dist/Tn.NAV_S; }
            else if((NV[3] = x, NV[4] = y, navDirIO(F))){ dirx = NV[0]; diry = NV[1]; Tloc = NV[2]; }
            else ok = false;
            if(ok){
              // wander
              const wv = Tn.WANDER*Math.sin(simTime*0.9 + W.seed[i]) ;
              const cw = Math.cos(wv), sw = Math.sin(wv);
              let dX = dirx*cw - diry*sw, dY = dirx*sw + diry*cw;
              // lanes. Against a flow the cell can't beat, or closing in on a target
              // that sits in a slower lane, it first slides sideways into the slow
              // near-wall lane (swimming straight into such a flow is futile).
              if(ul > 1){
                const cu = (dX*ux + dY*uy)/ul;
                const nX = -uy/ul, nY = ux/ul, cul = c*ul;
                const offT = nX*dx + nY*dy;                     // target's lateral offset from this cell
                const tSide = offT > 2*R ? 1 : offT < -2*R ? -1 : 0;
                let side = 0, latW = 0, latFirst = false;
                if(cu < -0.2){
                  // upstream: toward the nearest wall; on the axis (∇N flips) the target's side or a fixed per-cell side
                  if(N > -0.85) side = (nX*gx + nY*gy) >= 0 ? 1 : -1;
                  else side = tSide && dist < 1500 ? tSide : (W.seed[i] % 2 < 1 ? 1 : -1);
                  if(cul > 0.75*S) latFirst = true; else latW = Tn.UP_LAT*Math.min(1, (-cu - 0.2)*1.6);
                } else if(cul > 0.6*S && Tloc < 8){
                  // closing in on the target in a lane too fast to stop in: slide over
                  // early (judged by the remaining path time) — toward the target's side
                  // when it sits off-centre in this same vessel, else to the nearest
                  // wall — so the cell arrives in a lane where it can hold
                  const sameV = tSide !== 0 && dist < 2500 && lineOfSight(x, y, F.tx, F.ty);
                  const wSide = (N > -0.85) ? ((nX*gx + nY*gy) >= 0 ? 1 : -1) : (W.seed[i] % 2 < 1 ? 1 : -1);
                  const aoff = sameV ? (offT < 0 ? -offT : offT) - 2*R : (-SF[9] - R/rB - N)*rB;
                  const needT = aoff/(0.9*S)*1.3 + 0.8 + F.rs*Tn.SEED_RAMP/Tn.NAV_S;   // path time needed to change lanes
                  // never against the field's own sideways intent (e.g. a branch to take)
                  const fLat = dirx*nX + diry*nY;
                  const agree = sameV || !(fLat > 0.15 || fLat < -0.15) || (fLat > 0 ? 1 : -1) === wSide;
                  if(aoff > 4 && Tloc < needT && agree){ side = sameV ? tSide : wSide; latW = Tn.APP_LAT; latFirst = Tloc < 0.75*needT; }
                }
                if(latFirst){ dX = nX*side*0.94 + dX*0.34; dY = nY*side*0.94 + dY*0.34; const l = Math.sqrt(dX*dX+dY*dY); dX /= l; dY /= l; }
                else if(latW > 0){ dX += nX*side*latW; dY += nY*side*latW; const l = Math.sqrt(dX*dX+dY*dY); dX /= l; dY /= l; }
              }
              // cohesion / alignment with the order group (mild)
              let gX = 0, gY = 0;
              if(cn > 0){
                gX = Tn.K_COH*(cnx/cn - x) + Tn.K_ALI*(avx/cn - VX[i]);
                gY = Tn.K_COH*(cny/cn - y) + Tn.K_ALI*(avy/cn - VY[i]);
              }
              if(dist < 2.5*arrR){
                // arrive: desired ground velocity slows near the target
                const vd = Math.min(S, Tn.K_SEEK*dist + 20);
                tx = dX*vd - c*ux + gX; ty = dY*vd - c*uy + gY;
                const tl = Math.sqrt(tx*tx + ty*ty); if(tl > S){ tx *= S/tl; ty *= S/tl; }
              } else {
                // crab: cancel the cross-flow, put the rest along the path
                const cux = c*ux, cuy = c*uy, up = cux*dX + cuy*dY;
                const px = cux - up*dX, py = cuy - up*dY, p2 = px*px + py*py;
                if(p2 < S*S){ const s = Math.sqrt(S*S - p2); tx = dX*s - px; ty = dY*s - py; }
                else { const pl = Math.sqrt(p2); tx = -px/pl*S; ty = -py/pl*S; }
                tx += gX; ty += gY;
              }
              thrustOn = true; wantX = dX; wantY = dY;
              // stuck watchdog (no progress along the field for 3 s)
              W.stT[i] += h;
              if(W.stT[i] > 1){
                W.stT[i] = 0;
                if(W.stN[i] > 0 && Tloc > W.stN[i] - 0.25 && dist > 3*arrR){
                  W.fl[i] += 1;
                  if(W.fl[i] >= 3){ W.fl[i] = 0; dbg.kicks++; const ka = rngV.next()*Math.PI*2; VX[i] += Math.cos(ka)*70 - gx*40; VY[i] += Math.sin(ka)*70 - gy*40; }
                } else W.fl[i] = 0;
                W.stN[i] = Tloc;
              }
            } else {
              // field not reached yet: hold station against the flow
              tx = -c*ux; ty = -c*uy; const tl = Math.sqrt(tx*tx+ty*ty); if(tl > S){ tx *= S/tl; ty *= S/tl; }
            }
          }
        }
      }
      const st2 = ST[i];
      if(st2 === HOLD){
        // heading for an anchor spot the crowd already fills (pushed back hard,
        // against the way to it): the anchor yields, so cells stop short instead
        // of squeezing into each other
        { const ex = W.ax[i] - x, ey = W.ay[i] - y, s2 = sx*sx + sy*sy, se = sx*ex + sy*ey;
          if(s2 > 400 && se < 0 && se*se > 0.25*s2*(ex*ex + ey*ey)){ const ky = h*Tn.ANCHOR_YIELD; W.ax[i] -= ex*ky; W.ay[i] -= ey*ky; } }
        const dx = W.ax[i] - x, dy = W.ay[i] - y, dist = Math.sqrt(dx*dx + dy*dy) || 1e-3;
        const vd = Math.min(S, Tn.K_SEEK*dist);
        tx = dx/dist*vd - c*ux; ty = dy/dist*vd - c*uy;
        const tl = Math.sqrt(tx*tx + ty*ty);
        if(tl > S){
          // can't hold against this flow: spend the thrust on getting out of the
          // fast lane first (across the flow), the rest against it
          if(ul > 1){
            const fX = ux/ul, fY = uy/ul, ta = tx*fX + ty*fY, pX = tx - ta*fX, pY = ty - ta*fY, pl = Math.sqrt(pX*pX + pY*pY);
            if(pl >= S){ tx = pX*S/pl; ty = pY*S/pl; }
            else { const rest = Math.sqrt(S*S - pl*pl)*(ta < 0 ? -1 : 1); tx = pX + fX*rest; ty = pY + fY*rest; }
          } else { tx *= S/tl; ty *= S/tl; }
        }
        thrustOn = dist > 3; if(thrustOn){ wantX = dx/dist; wantY = dy/dist; }
        const touching = W.con[i] > 0.5 || touchAdh;
        if(touching && dist < 5*R + 40){ W.tim[i] += h; if(W.tim[i] > Tn.ADH_T){ ST[i] = ADH; W.tim[i] = 0; exactInside(x, y, R*W.sz[i] + TUNE.WALL_GAP); W.ax[i] = EX[0]; W.ay[i] = EX[1]; squash(i, 0.4, 0.1); } }
        else W.tim[i] = Math.max(0, W.tim[i] - h);
        if(dist > Tn.WASH){
          const F = fieldOf(i);
          if(F){ ST[i] = MOVE; W.stN[i] = 0; W.rch[i] = 0; }
          else if(W.rch[i] || (frame + i) % 30 === 0){ W.rch[i] = 0; wallAnchor(i); }
        } else if(dist < 2.5*R) W.rch[i] = 1;     // reached its anchor once: displacement now means "washed away"

      } else if(st2 === ADH){
        W.tim[i] += h;
        c = Tn.CARRY_ADH*Math.max(0, 1 - W.tim[i]/Tn.ARREST_T);
        // the anchor yields to the crowd: a cell its neighbours keep pushing off
        // its anchor settles where it is pushed (a clump that arrived or adhered
        // squeezed together relaxes instead of staying squeezed for good)
        { const ex = W.ax[i] - x, ey = W.ay[i] - y;
          if(sx*ex + sy*ey < 0 && sx*sx + sy*sy > 16){ const ky = h*Tn.ANCHOR_YIELD; W.ax[i] -= ex*ky; W.ay[i] -= ey*ky; } }
        const dx = W.ax[i] - x, dy = W.ay[i] - y;
        tx = dx*1.5; ty = dy*1.5;
        const tl = Math.sqrt(tx*tx + ty*ty); if(tl > 12){ tx *= 12/tl; ty *= 12/tl; }
        k = kAdh;
      } else if(st2 === CHASE){
        const p = W.cs[i];
        if(p < 0 || P.type[p] === 0 || P.gen[p] !== W.cg[i]){ endChase(i); }
        else {
          const dx = P.x[p] - x, dy = P.y[p] - y, dist = Math.sqrt(dx*dx + dy*dy) || 1e-3;
          const tI = Math.min(0.8, dist/(S + 1));
          let axp = dx + (P.vx[p] - c*ux)*tI*0.6, ayp = dy + (P.vy[p] - c*uy)*tI*0.6;
          const al = Math.sqrt(axp*axp + ayp*ayp) || 1e-3;
          tx = axp/al*S; ty = ayp/al*S; thrustOn = true; wantX = axp/al; wantY = ayp/al;
          W.tim[i] += h;
          const lx = x - W.ax[i], ly = y - W.ay[i];
          const lsh = W.clg[i] ? Tn.SENSE_SLOW*1.5 : Tn.LEASH, far = W.clg[i] ? Tn.SENSE_SLOW*1.4 : Tn.SENSE_IDLE*1.8;
          if(W.tim[i] > Tn.CHASE_T || (W.prev[i] !== MOVE && lx*lx + ly*ly > lsh*lsh) || dist > far) endChase(i);
        }
      } else if(st2 === DYING){
        c = 1; tx = 0; ty = 0; W.tim[i] += h;
      }

      // ---- velocity relaxation --------------------------------------------
      const dvx = c*ux + tx, dvy = c*uy + ty;
      VX[i] += (dvx - VX[i])*k; VY[i] += (dvy - VY[i])*k;

      // ---- display: heading, look, activity --------------------------------
      const tl = Math.sqrt(tx*tx + ty*ty);
      const actT = ST[i] === ADH ? 0 : Math.min(1, tl/Tn.SWIM);
      W.act[i] += (actT - W.act[i])*Math.min(1, h*4);
      if(thrustOn && tl > 0.2*Tn.SWIM){
        const kh = Math.min(1, h*5);
        let hx = W.hx[i] + (wantX - W.hx[i])*kh, hy = W.hy[i] + (wantY - W.hy[i])*kh;
        const hl = Math.sqrt(hx*hx + hy*hy) || 1; W.hx[i] = hx/hl; W.hy[i] = hy/hl;
      }
      let lkx = W.hx[i], lky = W.hy[i];
      if(ST[i] === CHASE && W.cs[i] >= 0){ const p = W.cs[i]; const dx = P.x[p]-x, dy = P.y[p]-y, d = Math.sqrt(dx*dx+dy*dy)||1; lkx = dx/d; lky = dy/d; }
      else if(W.npd[i] < 150){ const dx = W.npx[i]-x, dy = W.npy[i]-y, d = Math.sqrt(dx*dx+dy*dy)||1; lkx = dx/d; lky = dy/d; }
      else if(ST[i] === ADH || ST[i] === HOLD){ const ang = 1.2*Math.sin(simTime*0.37 + W.seed[i]) + Math.atan2(W.hy[i], W.hx[i]); lkx = Math.cos(ang); lky = Math.sin(ang); }
      const kl = Math.min(1, h*4);
      let lx = W.lx[i] + (lkx - W.lx[i])*kl, ly = W.ly[i] + (lky - W.ly[i])*kl;
      const ll = Math.sqrt(lx*lx + ly*ly) || 1; W.lx[i] = lx/ll; W.ly[i] = ly/ll;
      if(W.dig[i] > 0){ W.dig[i] -= h; if(W.dig[i] <= 0){ W.dig[i] = 0; W.eat[i] = 0; if(W.chg[i] <= 0.001 && ST[i] !== DYING){ ST[i] = DYING; W.tim[i] = 0; W.sel[i] = 0; W.hov[i] = 0; } } }
      if(W.fade[i] < 1) W.fade[i] = Math.min(1, W.fade[i] + h*3);
      if(W.flash[i] > 0) W.flash[i] -= h;
    }

    // ---- integrate, wall contact, mouths -----------------------------------
    for(let i=0;i<nW;i++){
      const st = ST[i];
      if(st === TRANSIT) continue;
      let vx = VX[i] + W.sepx[i], vy = VY[i] + W.sepy[i];
      const vl = Math.sqrt(vx*vx + vy*vy);
      if(vl > Tn.VMAX){ vx *= Tn.VMAX/vl; vy *= Tn.VMAX/vl; }
      let x = X[i] + vx*h, y = Y[i] + vy*h;
      if(!(x === x && y === y)){ x = X[i]; y = Y[i]; VX[i] = 0; VY[i] = 0; dbg.nanFix++; }
      // mouths
      if(NM){
        MB[0] = x; MB[1] = y; MB[2] = R; const m = mouthAt();
        if(m >= 0){
          if(mOut[m] && st !== DYING){ ST[i] = TRANSIT; W.tim[i] = Tn.RECIRC_T; X[i] = x; Y[i] = y; W.cs[i] = -1; continue; }
          const dd = (x - mX[m])*mOX[m] + (y - mY[m])*mOY[m] + R;
          x -= mOX[m]*dd; y -= mOY[m]*dd; W.gap[i] = 0;
          const vn = VX[i]*mOX[m] + VY[i]*mOY[m]; if(vn > 0){ VX[i] -= vn*mOX[m]; VY[i] -= vn*mOY[m]; }
        }
      }
      // wall: keep the centre inside N < −wall − r/rB (cells that were far from
      // the wall before this step and moved less than that distance can't touch it)
      const rr = R*W.sz[i] + TUNE.WALL_GAP;
      let touched = false, wimp = 0;
      if(W.gap[i] > 2*vl*h + 4){ W.gap[i] -= 2*vl*h; W.con[i] = Math.max(0, W.con[i] - h*4); } else {
        let inside = false, pvio = 0, pstp = 0;
        for(let it=0; it<5; it++){
          SF[10] = x; SF[11] = y; sampleF(SF);
          const viol = (SF[0] + SF[9])*SF[1] + rr;          // µm-ish beyond the allowed limit
          if(viol <= 0){ inside = true; break; }
          if(it === 4) break;
          let dgx = SF[3], dgy = SF[4], pen = viol + 0.05;
          const vn = VX[i]*dgx + VY[i]*dgy;
          if(vn > 0){ VX[i] -= vn*dgx; VY[i] -= vn*dgy; }
          if(it === 0) wimp = PVX[i]*dgx + PVY[i]*dgy;     // hitting the wall at this (ground) speed
          if(it === 1){
            // N·rB is only a distance on a single vessel; in junction blends it
            // grows slower: take the step from the measured slope
            const sl = (pvio - viol)/pstp; pen = sl > 0.1 ? viol/sl + 0.05 : (viol + 0.05)*2.5;
          } else if(it >= 2){
            // still out (crotches where vessels of different radius / wall blend and
            // ∇N points the wrong way): Newton step on the numerical gradient of the
            // violation itself
            const e = 2;
            SF[10] = x + e; SF[11] = y; sampleF(SF); const vxp = (SF[0] + SF[9])*SF[1];
            SF[10] = x - e; sampleF(SF); const vxm = (SF[0] + SF[9])*SF[1];
            SF[10] = x; SF[11] = y + e; sampleF(SF); const vyp = (SF[0] + SF[9])*SF[1];
            SF[11] = y - e; sampleF(SF); const vym = (SF[0] + SF[9])*SF[1];
            const ngx = (vxp - vxm)/(2*e), ngy = (vyp - vym)/(2*e), n2 = ngx*ngx + ngy*ngy;
            if(n2 > 1e-4){ const nl = Math.sqrt(n2); dgx = ngx/nl; dgy = ngy/nl; pen = viol/nl + 0.1; }
            else pen = (viol + 0.05)*2.5;
          }
          if(pen > 4*viol + 8) pen = 4*viol + 8;
          pvio = viol; pstp = pen;
          x -= dgx*pen; y -= dgy*pen; touched = true; dbg.projections++;
        }
        if(!inside){
          // never accept a position outside the lumen: slide along the wall from
          // where it was (inside) — this is what gets cells round junction crotches
          // — or, failing that, stay put
          const x0 = X[i], y0 = Y[i];
          SF[10] = x0; SF[11] = y0; sampleF(SF);
          const gxo = SF[3], gyo = SF[4], mx = vx*h, my = vy*h, mn = mx*gxo + my*gyo;
          x = x0 + mx - (mn > 0 ? mn : 0)*gxo - gxo*0.3; y = y0 + my - (mn > 0 ? mn : 0)*gyo - gyo*0.3;
          SF[10] = x; SF[11] = y; sampleF(SF);
          if(!(SF[0] <= -SF[9] - rr/SF[1])){ x = x0; y = y0; SF[10] = x; SF[11] = y; sampleF(SF); }
          dbg.reverts++;
          const vn = VX[i]*gxo + VY[i]*gyo; if(vn > 0){ VX[i] -= vn*gxo; VY[i] -= vn*gyo; }
          const wi = PVX[i]*gxo + PVY[i]*gyo; if(wi > wimp) wimp = wi;
          touched = true;
        }
        { const lim = -SF[9] - rr/SF[1]; W.gap[i] = (lim - SF[0])*SF[1]; if(!touched && W.gap[i] < 1.2) touched = true; }
        W.con[i] = touched ? Math.min(1, W.con[i] + h*10) : Math.max(0, W.con[i] - h*4);
      }
      // ---- soft body (display only) ---------------------------------------
      // smoothed ground velocity → acceleration along the heading drives the
      // squash & stretch spring (speeding up stretches, braking / hitting
      // something head-on squashes, with a little jelly overshoot)
      {
        const opx = PVX[i], opy = PVY[i];
        const npx = opx + ((x - X[i])*ih - opx)*kV, npy = opy + ((y - Y[i])*ih - opy)*kV;
        PVX[i] = npx; PVY[i] = npy;
        const acc = ((npx - opx)*HX[i] + (npy - opy)*HY[i])*ih;
        let jg = JIG[i]*kJ;
        if(wimp > Tn.JIG_V0){ let J = (wimp - Tn.JIG_V0)*iJW; if(J > JB) J = JB; if(J > jg) jg = J; }
        JIG[i] = jg;
        const sp = Math.sqrt(npx*npx + npy*npy), e = sp < 25 ? 0 : sp > 260 ? 1 : (sp - 25)*(1/235);
        const tgt = 1 + (0.17*W.act[i] + 0.1*e)*(W.dig[i] > 0 ? 0.5 : 1) + SQZ[i];
        let sv = STR[i], vv = STRV[i];
        vv += h*(OM2*(tgt - sv) - ZW*vv + KA*acc);
        sv += h*vv;
        if(sv < 0.85){ sv = 0.85; if(vv < 0) vv = 0; } else if(sv > 1.35){ sv = 1.35; if(vv > 0) vv = 0; }
        STR[i] = sv; STRV[i] = vv;
      }
      X[i] = x; Y[i] = y;
    }
  }

  // =========================================================================
  //  PATHOGENS
  // =========================================================================
  function stepPathogens(h){
    const Tn = TUNE, hb = pulse;
    const pa = 0.72+0.56*hb, pc = 0.9+0.2*hb, pv = 0.96+0.08*hb, kAng = 1 - Math.exp(-h*9.75);
    for(let p=0;p<MAXP;p++){
      const ty = P.type[p]; if(!ty) continue;
      let x = P.x[p], y = P.y[p];
      SF[10] = x; SF[11] = y; sampleF(SF);
      let a = 1 + SF[0]; a = a < 0 ? 0 : a > 1 ? 1 : a;
      const kind = SF[8], pkk = kind <= 1 ? pa + (pc-pa)*kind : pc + (pv-pc)*(kind-1);
      const prof = 1.6*(1 - a*a)*pkk;
      const ph = P.ph[p], rad = ty === 1 ? Tn.VIRUS_R : Tn.BACT_R*1.4;
      let ux = SF[5]*prof, uy = SF[6]*prof;
      { const un = ux*SF[3] + uy*SF[4], gp = (-SF[9] - rad/SF[1] - SF[0])*SF[1]; if(un > 0 && gp < 12){ const w = gp <= 0 ? 1 : 1 - gp/12; ux -= un*SF[3]*w; uy -= un*SF[4]*w; } }
      let vx, vy;
      P.age[p] += h;
      if(ty === 1){
        // drift + slow migration toward the a ≈ 0.6 lane (tubular pinch effect),
        // so viruses leave the wall they were shed from and spread downstream
        const mig = -Tn.VIRUS_MIG*(a - 0.6);
        vx = ux + Tn.BROWN*Math.sin(simTime*1.7 + ph) + SF[3]*mig; vy = uy + Tn.BROWN*Math.cos(simTime*1.3 + ph*1.7) + SF[4]*mig;
        P.ang[p] += h*(0.6 + 0.4*Math.sin(ph));
      } else {
        if(P.adh[p]){ vx = ux*0.02; vy = uy*0.02; }
        else {
          const ang = P.ang[p];
          const sw = Tn.BACT_SWIM*(0.6 + 0.4*Math.sin(simTime*3.1 + ph));
          vx = ux*Tn.BACT_CARRY + Math.cos(ang)*sw; vy = uy*Tn.BACT_CARRY + Math.sin(ang)*sw;
          P.ang[p] += h*0.5*Math.sin(simTime*0.7 + ph*2.1);
        }
        // flee the nearest white cell
        if(P.near[p] < 50 && !P.adh[p]){ vx -= P.lx[p]*Tn.BACT_FLEE; vy -= P.ly[p]*Tn.BACT_FLEE; }
        // division: only colonies on the wall divide (free swimmers just drift)
        if(P.adh[p]) P.div[p] -= h;
        if(P.div[p] <= 0){
          P.div[p] = P.divD[p];
          // colonies stop growing at a handful of cells
          let near = 0;
          for(let q=0;q<MAXP;q++){ if(q === p || P.type[q] !== 2) continue; const dx = P.x[q]-x, dy = P.y[q]-y; if(dx*dx + dy*dy < 22*22) near++; }
          if(near >= Tn.COLONY_MAX - 1){ P.div[p] = P.divD[p]*1.5; }
          else {
          const ca = Math.cos(P.ang[p]), sa = Math.sin(P.ang[p]);
          const q = addPathogen(2, x + ca*Tn.BACT_R*2.4, y + sa*Tn.BACT_R*2.4, 0, 0);
          if(q >= 0){ P.adh[q] = P.adh[p]; P.ang[q] = P.ang[p] + (rng.next()-0.5)*0.8; P.fade[q] = 1; P.x[p] -= ca*Tn.BACT_R*1.2; P.y[p] -= sa*Tn.BACT_R*1.2; x = P.x[p]; y = P.y[p]; }
          }
        }
      }
      // ejected from a site: push into the lumen for the first half second
      if(P.age[p] < 0.6){ vx += P.ex[p]*70*(1 - P.age[p]/0.6); vy += P.ey[p]*70*(1 - P.age[p]/0.6); }
      P.vx[p] = vx; P.vy[p] = vy;
      if(ty === 2 && !P.adh[p] && vx*vx + vy*vy > 25){
        // a swimming rod's body axis turns smoothly toward where it's going
        // (game state: done here, per substep, never in packUnits)
        let d = Math.atan2(vy, vx) - P.ang[p]; d -= 6.2831853*Math.round(d/6.2831853);
        P.ang[p] += d*kAng;
      }
      x += vx*h; y += vy*h;
      if(NM){
        MB[0] = x; MB[1] = y; MB[2] = rad; const m = mouthAt();
        if(m >= 0){
          if(mOut[m]){ escape(p); continue; }
          const dd = (x - mX[m])*mOX[m] + (y - mY[m])*mOY[m] + rad; x -= mOX[m]*dd; y -= mOY[m]*dd;
        }
      }
      let touched = false, inside = false, pvio = 0, pstp = 0;
      for(let it=0; it<5; it++){
        SF[10] = x; SF[11] = y; sampleF(SF);
        const viol = (SF[0] + SF[9])*SF[1] + rad;
        if(viol <= 0){ inside = true; break; }
        if(it === 4) break;
        let pen = viol + 0.05;
        if(it){ const sl = (pvio - viol)/pstp; pen = sl > 0.1 ? viol/sl + 0.05 : (viol + 0.05)*2.5; if(pen > 4*viol + 8) pen = 4*viol + 8; }
        pvio = viol; pstp = pen;
        x -= SF[3]*pen; y -= SF[4]*pen; touched = true;
      }
      if(!inside){ x = P.x[p]; y = P.y[p]; }
      if(ty === 2 && touched && !P.adh[p] && P.age[p] > 1 && rng.next() < Tn.BACT_STICK*h) P.adh[p] = 1;
      P.x[p] = x; P.y[p] = y;
      if(P.fade[p] < 1) P.fade[p] = Math.min(1, P.fade[p] + h*2.5);
      if(P.hit[p] > 0) P.hit[p] -= h;
    }
  }
  function escape(p){
    const ty = P.type[p];
    if(state === 'play') infection += (ty === 1 ? TUNE.INF_ESC_V : TUNE.INF_ESC_B)*diff;
    stats.escaped++;
    emit({ type:'escape', x:P.x[p], y:P.y[p], kind: ty === 1 ? 'virus' : 'bacterium' });
    killP(p);
  }

  // engulf on contact (fine hash; positions are this substep's)
  function interact(){
    const hs = hashF, items = hs.items, start = hs.start, hcx = hs.cx, hcy = hs.cy, inv = hs.inv;
    for(let p=0;p<MAXP;p++){
      const ty = P.type[p]; if(!ty) continue;
      const x = P.x[p], y = P.y[p];
      const rad = ty === 1 ? TUNE.VIRUS_R : TUNE.BACT_R*1.5;
      const cx0 = Math.floor(x*inv), cy0 = Math.floor(y*inv);
      let eater = -1, bd = Infinity;
      for(let qy=cy0-1; qy<=cy0+1; qy++) for(let qx=cx0-1; qx<=cx0+1; qx++){
        const bkt = hs.key(qx, qy);
        for(let q=start[bkt], qe=start[bkt+1]; q<qe; q++){
          const j = items[q];
          if(j >= nW || hcx[j] !== qx || hcy[j] !== qy) continue;
          const st = W.st[j]; if(st === TRANSIT || st === DYING || W.dig[j] > 0 || W.chg[j] <= 0) continue;
          const dx = W.x[j]-x, dy = W.y[j]-y, d2 = dx*dx + dy*dy, rs = R*W.sz[j] + rad + 0.8;
          if(d2 < rs*rs && d2 < bd){ bd = d2; eater = j; }
        }
      }
      if(eater >= 0) engulf(eater, p);
    }
  }
  function engulf(j, p){
    const ty = P.type[p];
    W.dig[j] = ty === 1 ? TUNE.DIGEST_V : TUNE.DIGEST_B; W.digD[j] = W.dig[j]; W.eat[j] = ty;
    W.chg[j] = Math.max(0, W.chg[j] - (ty === 1 ? TUNE.CHARGE_V : TUNE.CHARGE_B));
    squash(j, 1, 0.12);              // gulp: full wobble, squashed round the prey
    const pts = ty === 1 ? 10 : 15;
    score += pts; stats.captured++;
    addFx(ty, P.x[p], P.y[p], ty === 1 ? 7 : 9, 0.55);
    emit({ type:'capture', x:P.x[p], y:P.y[p], kind: ty === 1 ? 'virus' : 'bacterium', score: pts });
    if(W.st[j] === CHASE && W.cs[j] === p) endChase(j);
    killP(p);
  }

  // =========================================================================
  //  GAME (once per frame)
  // =========================================================================
  function placeSite(kind){
    const o = {}, oh = {};
    let total = 0; for(let i=0;i<BZ.length;i++) total += bzLen[i]*siteWeight(BZ[i]);
    for(let tries=0; tries<300; tries++){
      let u = rng.next()*total, i = 0;
      for(; i<BZ.length-1; i++){ u -= bzLen[i]*siteWeight(BZ[i]); if(u <= 0) break; }
      const b = BZ[i];
      bzPoint(b, 0.1 + 0.8*rng.next(), o);
      const side = rng.next() < 0.5 ? -1 : 1;
      const nx = -o.ty*side, ny = o.tx*side;
      net.evalAt(o.x, o.y, ev); const wall = ev.wall;
      const x = o.x + nx*o.r*(1 - 0.45*wall), y = o.y + ny*o.r*(1 - 0.45*wall);
      net.evalAt(x, y, ev);
      if(!(ev.N > -ev.wall*0.95 && ev.N < -ev.wall*0.05)) continue;
      if(Math.abs(ev.N*ev.rB - ev.dmin) > 3) continue;          // not in a junction fillet
      if(ev.gx*nx + ev.gy*ny < 0.9) continue;
      // emission point in the lumen
      const ex = x - ev.gx*(ev.wall*0.6*ev.rB + 6), ey = y - ev.gy*(ev.wall*0.6*ev.rB + 6);
      if(!isLumen(ex, ey, 3)) continue;
      // attackable: white cells must be able to hold against the wall lane
      // here (no lesions in AV-connector torrents), same test as snapTarget
      { net.evalAt(ex, ey, oh); const ae = Math.max(0, 1 - oh.wall - 2*R/oh.rB);
        if(Math.hypot(oh.fx, oh.fy)*1.6*(1 - ae*ae)*pkMean(oh.kind)*1.15*TUNE.CARRY > 0.7*TUNE.SWIM) continue; }
      // spacing: other sites, the inlet, the outlets, the horde
      let ok = true;
      for(let s=0;s<MAXS;s++) if(Sx.alive[s] && Math.hypot(Sx.x[s]-x, Sx.y[s]-y) < 1600){ ok = false; break; }
      if(!ok) continue;
      for(let m=0;m<NM;m++) if(Math.hypot(mX[m]-x, mY[m]-y) < (mOut[m] ? 1500 : 2600)){ ok = false; break; }
      if(!ok) continue;
      let near = 0; for(let w=0; w<nW; w+=3){ const dx = W.x[w]-x, dy = W.y[w]-y; if(dx*dx+dy*dy < 900*900){ near = 1; break; } }
      if(near && tries < 200) continue;
      let s = -1; for(let q=0;q<MAXS;q++) if(!Sx.alive[q]){ s = q; break; }
      if(s < 0) return -1;
      Sx.alive[s] = 1; Sx.kind[s] = kind; Sx.x[s] = x; Sx.y[s] = y; Sx.nx[s] = ev.gx; Sx.ny[s] = ev.gy; Sx.ex[s] = ex; Sx.ey[s] = ey;
      Sx.id[s] = ++siteSerial;
      { // contact point: where a white cell's centre sits against the lesion
        let cx = x, cy = y;
        for(let it=0; it<6; it++){ net.evalAt(cx, cy, ev); const gap = (-ev.wall - (R + 0.5)/ev.rB - ev.N)*ev.rB; if(gap > -0.3 && gap < 0.3) break; cx += ev.gx*gap; cy += ev.gy*gap; }
        Sx.cx[s] = cx; Sx.cy[s] = cy;
      }
      Sx.r[s] = 18 + 12*rng.next() + Math.min(12, 0.03*o.r);
      Sx.hp[s] = 1; Sx.max[s] = TUNE.SITE_HP*(1 + 0.1*(wave-1))*diff;
      Sx.rate[s] = (kind === 1 ? TUNE.EMIT_V : TUNE.EMIT_B)/((1 + 0.08*(wave-1))*diff);
      Sx.tim[s] = 1 + rng.next()*2; Sx.ph[s] = rng.next()*100; Sx.tint[s] = rng.next();
      Sx.crowd[s] = 0; Sx.flash[s] = 0; Sx.emit[s] = 0; Sx.die[s] = 0; Sx.ncnt[s] = 0;
      emit({ type:'siteUp', x, y, kind: kind === 1 ? 'virus' : 'bacterium' });
      return s;
    }
    return -1;
  }
  function siteWeight(b){ const r = 0.5*(b.r0+b.r2), k = 0.5*(b.k0+b.k2); return (r > 520 ? 0.15 : r > 380 ? 0.5 : 1)*(k > 0.6 && k < 1.4 ? 0.3 : 1); }

  function gameStep(dt){
    const Tn = TUNE;
    // ---- transit (recirculation) & deaths ---------------------------------
    for(let i=nW-1;i>=0;i--){
      const st = W.st[i];
      if(st === TRANSIT){
        W.tim[i] -= dt;
        if(W.tim[i] <= 0 && inMouth){
          // re-enter at the arterial inlet, spread over the mouth
          let x = 0, y = 0, ok = false;
          for(let t=0;t<12 && !ok;t++){
            const s = (rng.next()*2 - 1)*0.75*inMouth.r, dpt = (0.8 + 0.8*rng.next())*inMouth.r;
            x = inMouth.x - inMouth.ox*dpt - inMouth.oy*s; y = inMouth.y - inMouth.oy*dpt + inMouth.ox*s;
            ok = isLumen(x, y, R+1);
          }
          if(!ok){ x = inEntryX; y = inEntryY; }
          W.x[i] = x; W.y[i] = y; W.vx[i] = 0; W.vy[i] = 0; W.fade[i] = 0; W.gap[i] = 0;
          W.pvx[i] = 0; W.pvy[i] = 0; W.str[i] = 1; W.strV[i] = 0; W.jig[i] = 0.6;   // popped out of the heart
          const F = fieldOf(i);
          W.st[i] = F ? MOVE : HOLD; W.stN[i] = 0; if(!F) wallAnchor(i);
        }
      } else if(st === DYING && W.tim[i] > 1.3){
        addFx(4, W.x[i], W.y[i], R*1.6, 0.8);
        emit({ type:'death', x:W.x[i], y:W.y[i] }); stats.deaths++;
        removeWbc(i);
      }
    }
    // coarse hash of the final positions (sites, sensing, selection)
    hashC.build(nW, W.x, W.y, skipW);
    if(state !== 'play') return;
    // ---- sites -------------------------------------------------------------
    let sitesAlive = 0;
    for(let s=0;s<MAXS;s++){
      if(!Sx.alive[s]) continue;
      if(Sx.alive[s] === 2){ Sx.die[s] += dt; if(Sx.die[s] > 1.4) Sx.alive[s] = 0; continue; }
      sitesAlive++;
      // crowd: cells touching the lesion
      const x = Sx.x[s], y = Sx.y[s], rc = Sx.r[s] + Tn.SITE_REACH*R, rc2 = rc*rc;
      const hs = hashC, inv = hs.inv, cx0 = Math.floor(x*inv), cy0 = Math.floor(y*inv);
      let n = 0;
      for(let qy=cy0-1; qy<=cy0+1; qy++) for(let qx=cx0-1; qx<=cx0+1; qx++){
        const bkt = hs.key(qx, qy);
        for(let q=hs.start[bkt], qe=hs.start[bkt+1]; q<qe; q++){
          const j = hs.items[q]; if(hs.cx[j] !== qx || hs.cy[j] !== qy) continue;
          if(W.st[j] === DYING) continue;
          const dx = W.x[j]-x, dy = W.y[j]-y;
          if(dx*dx + dy*dy < rc2){
            n++;
            // wear never drops a cell below 0.02 (and never lifts one that engulfing already drained)
            const c0 = W.chg[j], c1 = c0 > 0.02 ? Math.max(0.02, c0 - Tn.SITE_WEAR*dt) : c0; W.chg[j] = c1;
            if((c0 >= 0.5 && c1 < 0.5) || (c0 >= 0.25 && c1 < 0.25)) W.flash[j] = 0.35;
            // chewing on the lesion: a bite (wobble + squash) every ~0.8 s, own rhythm per cell
            const bt = (simTime + W.ph[j])*1.25; if(bt - Math.floor(bt) < dt*1.25) squash(j, 0.45, 0.06);
          }
        }
      }
      Sx.ncnt[s] = n;
      const eff = Math.min(n, Tn.SITE_CROWD);
      Sx.crowd[s] += (eff/Tn.SITE_CROWD - Sx.crowd[s])*Math.min(1, dt*3);
      if(eff > 0){ Sx.hp[s] -= dt*eff/Sx.max[s]; Sx.flash[s] = 0.25; }
      else Sx.hp[s] = Math.min(1, Sx.hp[s] + dt*Tn.SITE_REGEN);
      if(Sx.flash[s] > 0) Sx.flash[s] -= dt;
      Sx.emit[s] = Math.max(0, Sx.emit[s] - dt*2.5);
      if(Sx.hp[s] <= 0){
        Sx.hp[s] = 0; Sx.alive[s] = 2; Sx.die[s] = 0; sitesAlive--;
        const pts = 250; score += pts; stats.sitesDown++;
        addFx(3, x, y, Sx.r[s]*1.6, 1.2);
        emit({ type:'siteDown', x, y, score: pts });
        continue;
      }
      // emission (slowed while the lesion is crowded)
      Sx.tim[s] -= dt*(1 - 0.6*Sx.crowd[s]);
      if(Sx.tim[s] <= 0){
        Sx.tim[s] = Sx.rate[s]*(0.7 + 0.6*rng.next());
        const k = Sx.kind[s];
        const nx = -Sx.nx[s], ny = -Sx.ny[s];
        const jit = (rng.next()-0.5)*Sx.r[s]*0.8;
        const q = addPathogen(k, Sx.ex[s] - ny*jit, Sx.ey[s] + nx*jit, nx, ny);
        if(q >= 0){ Sx.emit[s] = 1; }
      }
    }
    // ---- infection / immunity --------------------------------------------
    let nv = 0, nbac = 0;
    for(let p=0;p<MAXP;p++){ const t = P.type[p]; if(t === 1) nv++; else if(t === 2) nbac++; }
    infection += dt*diff*(Tn.INF_LIVE*(nv + nbac) + Tn.INF_SITE*sitesAlive) - dt*Tn.INF_DECAY;
    infection = Math.max(0, Math.min(1, infection));
    // ---- waves -------------------------------------------------------------
    if(wave > 0 && sitesAlive === 0 && breakUntil < 0){
      breakUntil = simTime + Tn.WAVE_BREAK;
      if(wave >= 1){ const pts = 100*wave; score += pts; }
    }
    if(wave >= Tn.WAVES && sitesAlive === 0 && (nv + nbac < 3 || (breakUntil >= 0 && simTime >= breakUntil - Tn.WAVE_BREAK + Tn.MOPUP_T))){
      // every lesion is down: the last stragglers (e.g. a wall colony nobody
      // hunts) are cleared by the now-winning immune response
      for(let p=0;p<MAXP;p++){ const t = P.type[p]; if(!t) continue; addFx(t, P.x[p], P.y[p], t === 1 ? 7 : 9, 0.55); killP(p); }
      state = 'won'; emit({ type:'won', score });
    } else if((wave === 0 && simTime >= waveDeadline) || (wave > 0 && wave < Tn.WAVES && ((breakUntil >= 0 && simTime >= breakUntil) || simTime >= waveDeadline))){
      wave++; breakUntil = -1; waveDeadline = simTime + Tn.WAVE_T;
      const ns = 1 + Math.floor((wave - 1)/2);
      let made = 0;
      for(let k=0;k<ns;k++){ const kind = (wave >= 3 && k % 3 === 2) || (wave >= 5 && k % 2 === 1) ? 2 : 1; if(placeSite(kind) >= 0) made++; }
      emit({ type:'wave', wave, sites: made });
    }
    if(infection >= 1 && state === 'play'){ state = 'over'; emit({ type:'over', score }); }
    // ---- reinforcements ----------------------------------------------------
    if(simTime >= nextReinf){
      nextReinf = simTime + Tn.REINF_T;
      const cap = opts.wbcCap || Tn.WBC_CAP;
      if(inMouth && nW < cap){
        const n = Math.min(Tn.REINF_N, cap - nW);
        let made = 0;
        for(let t=0; t<n*20 && made<n; t++){
          const side = rng.next() < 0.5 ? -1 : 1;
          const along = (1.4 + 1.6*rng.next())*inMouth.r;
          const lat = side*(inMouth.r*(1 - 0.13) - R*(1.5 + 5*rng.next()));
          const x = inMouth.x - inMouth.ox*along - inMouth.oy*lat, y = inMouth.y - inMouth.oy*along + inMouth.ox*lat;
          if(!isLumen(x, y, R+1)) continue;
          const i = addWbc(x, y, HOLD); if(i < 0) break;
          W.jig[i] = 0.5;
          made++;
        }
        if(made){ stats.reinforced += made; emit({ type:'spawn', x: inMouth.x - inMouth.ox*2*inMouth.r, y: inMouth.y - inMouth.oy*2*inMouth.r, n: made }); }
      }
    }
  }

  // chase assignment + mutual awareness (once per frame)
  function senseStep(){
    const Tn = TUNE, hs = hashC, inv = hs.inv;
    for(let i=0;i<nW;i++) W.npd[i] = 1e9;
    for(let p=0;p<MAXP;p++) P.chase[p] = 0;
    for(let i=0;i<nW;i++) if(W.st[i] === CHASE){ const p = W.cs[i]; if(p >= 0 && P.type[p] && P.gen[p] === W.cg[i]) P.chase[p]++; }
    const RS = 120, RS2 = RS*RS;
    for(let p=0;p<MAXP;p++){
      const ty = P.type[p]; if(!ty) continue;
      const x = P.x[p], y = P.y[p];
      const cx0 = Math.floor(x*inv), cy0 = Math.floor(y*inv);
      let near = -1, nd = RS2, cand = -1, cd = Infinity;
      const maxC = ty === 1 ? Tn.MAX_CHASE_V : Tn.MAX_CHASE_B;
      const canAssign = P.chase[p] < maxC && ((p + frame) % 6 === 0);
      // near-stationary prey (stagnant pockets in wide veins) is hunted from
      // further away so parked cells clear what the flow never brings them
      const slow = canAssign && P.age[p] > 3 && P.vx[p]*P.vx[p] + P.vy[p]*P.vy[p] < Tn.SLOW_V*Tn.SLOW_V;
      const K = slow ? Math.ceil(Tn.SENSE_SLOW*inv) : 2, rsI = slow ? Tn.SENSE_SLOW : Tn.SENSE_IDLE;
      const lsh = slow ? Tn.SENSE_SLOW*1.2 : Tn.LEASH;
      for(let qy=cy0-K; qy<=cy0+K; qy++) for(let qx=cx0-K; qx<=cx0+K; qx++){
        const bkt = hs.key(qx, qy);
        for(let q=hs.start[bkt], qe=hs.start[bkt+1]; q<qe; q++){
          const j = hs.items[q]; if(hs.cx[j] !== qx || hs.cy[j] !== qy) continue;
          const dx = W.x[j]-x, dy = W.y[j]-y, d2 = dx*dx + dy*dy;
          if(d2 < RS2){
            if(d2 < nd){ nd = d2; near = j; }
            if(d2 < W.npd[j]*W.npd[j]){ W.npd[j] = Math.sqrt(d2); W.npx[j] = x; W.npy[j] = y; }
          } else if(!slow) continue;
          if(!canAssign) continue;
          const st = W.st[j];
          if(W.dig[j] > 0 || W.chg[j] <= 0) continue;
          let rs;
          if(st === HOLD || st === ADH){
            rs = rsI;
            const lx = x - W.ax[j], ly = y - W.ay[j]; if(lx*lx + ly*ly > lsh*lsh) continue;
          } else if(st === MOVE) rs = Tn.SENSE_MOVE;
          else continue;
          if(d2 < rs*rs && d2 < cd){ cd = d2; cand = j; }
        }
      }
      if(near >= 0){
        const d = Math.sqrt(nd) || 1;
        P.near[p] = d; P.lx[p] = (W.x[near]-x)/d; P.ly[p] = (W.y[near]-y)/d;
        P.hit[p] = d < R + 10 ? 0.2 : P.hit[p];
      } else P.near[p] = 1e9;
      if(cand >= 0){
        // line of sight through the lumen (midpoint check)
        const mx = 0.5*(x + W.x[cand]), my = 0.5*(y + W.y[cand]);
        const lng = cd > Tn.SENSE_IDLE*Tn.SENSE_IDLE;
        if(lng ? lineOfSight(W.x[cand], W.y[cand], x, y) : isLumen(mx, my, 1)){
          W.clg[cand] = lng ? 1 : 0;
          W.prev[cand] = W.st[cand] === MOVE ? MOVE : HOLD;
          W.st[cand] = CHASE; W.cs[cand] = p; W.cg[cand] = P.gen[p]; W.tim[cand] = 0;
          jiggle(cand, 0.35, 0.7);     // lunging after it
          P.chase[p]++;
        }
      }
    }
  }

  // =========================================================================
  //  RED CELLS
  // =========================================================================
  let rbcInit = false, lastBX = 0, lastBY = 0; const pv = { x0:0, y0:0, x1:0, y1:0 };
  const BMAX = 16*16;
  const bArea = new Float32Array(BMAX), bCnt = new Int32Array(BMAX), bSur = new Int32Array(BMAX), bTgt = new Float32Array(BMAX), bInf = new Uint8Array(BMAX);
  const bFx = new Float32Array(BMAX), bFy = new Float32Array(BMAX), bLum = new Int32Array(BMAX); let lastBXs = 0, lastBYs = 0;
  function updateRbc(dt, ctx){
    const V = ctx.view;
    let lod = ctx.rbcLOD;
    if(lod == null) lod = ctx.z ? smoothstep(2.5, 6, 2*RR*ctx.z) : 0;
    if(!V || !(lod > 0)){ nR = 0; rbc.count = 0; rbcInit = false; return; }
    const x0 = Math.min(V.x0, V.x1), x1 = Math.max(V.x0, V.x1), y0 = Math.min(V.y0, V.y1), y1 = Math.max(V.y0, V.y1);
    const vw = x1 - x0, vh = y1 - y0;
    const dtf = dt > 0 ? dt : 1/60;     // fades and refills keep going while the game is paused
    if(!(vw > 1 && vh > 1)){ nR = 0; rbc.count = 0; return; }
    // jump / zoom detection
    const ox = Math.max(0, Math.min(x1, pv.x1) - Math.max(x0, pv.x0)), oy = Math.max(0, Math.min(y1, pv.y1) - Math.max(y0, pv.y0));
    const jump = !rbcInit || ox*oy < 0.3*vw*vh;
    if(jump) nR = 0;
    // camera velocity (cells stream in from wherever the flow enters the moving view)
    let cvx = 0, cvy = 0;
    if(!jump && dt > 0){ cvx = (0.5*(x0 + x1) - 0.5*(pv.x0 + pv.x1))/dt; cvy = (0.5*(y0 + y1) - 0.5*(pv.y0 + pv.y1))/dt; }
    const px0 = pv.x0, py0 = pv.y0, px1 = pv.x1, py1 = pv.y1;
    pv.x0 = x0; pv.y0 = y0; pv.x1 = x1; pv.y1 = y1; rbcInit = true;
    // bins
    let BX, BY;
    if(vw >= vh){ BX = 14; BY = Math.max(3, Math.min(14, Math.round(14*vh/vw))); } else { BY = 14; BX = Math.max(3, Math.min(14, Math.round(14*vw/vh))); }
    const bw = vw/BX, bh = vh/BY, nb = BX*BY; lastBX = BX; lastBY = BY;
    const cellA = Math.PI*RR*RR;
    let tot = 0;
    // lumen area + mean flow per bin: 3×3 samples, or 2×2 (alternating offsets)
    // while the camera moves; nothing is re-sampled for a still camera
    const still = !jump && x0 === px0 && y0 === py0 && x1 === px1 && y1 === py1 && BX === lastBXs && BY === lastBYs;
    const SS = still ? 0 : (cvx !== 0 || cvy !== 0) ? 2 : 3, sOff = (vframe & 1) ? 0.25 : 0;
    lastBXs = BX; lastBYs = BY;
    for(let by=0; by<BY; by++) for(let bx=0; bx<BX; bx++){
      const k = by*BX + bx;
      bCnt[k] = 0;
      if(SS){
        let c = 0, fxs = 0, fys = 0;
        for(let s=0;s<SS*SS;s++){
          const sx = x0 + (bx + ((s%SS) + 0.5 + (SS === 2 ? sOff - 0.125 : 0))/SS)*bw, sy = y0 + (by + (((s/SS)|0) + 0.5 + (SS === 2 ? sOff - 0.125 : 0))/SS)*bh;
          SF[10] = sx; SF[11] = sy; sampleF(SF);
          if(SF[0] < -SF[9] - RR/SF[1]){ c++; fxs += SF[5]; fys += SF[6]; }
        }
        bArea[k] = c/(SS*SS)*bw*bh; bFx[k] = c ? fxs/c : 0; bFy[k] = c ? fys/c : 0; bLum[k] = c;
      }
      const c = bLum[k];
      bTgt[k] = bArea[k]*TUNE.RBC_DENS/cellA; tot += bTgt[k];
      // rim bins where the flow (relative to the moving camera) enters the view:
      // bit 1 = through the left side, 2 right, 4 top, 8 bottom
      // (cells span speeds from ~0 to 1.6× the mean, so a camera moving with the
      // flow sees slow cells enter at the front and fast ones at the back)
      let inf = 0;
      if(c && (bx === 0 || by === 0 || bx === BX-1 || by === BY-1)){
        // entering through a side with inward normal n: flow·n (slowest or fastest
        // cells) beats the camera's own motion along n. Written out (no closure:
        // captured doubles would be boxed on every write)
        const mx = bFx[k], my = bFy[k];
        if(bx === 0){ if(0.05*mx - cvx > 20 || 1.5*mx - cvx > 20) inf |= 1; }
        else if(bx === BX-1){ if(-0.05*mx + cvx > 20 || -1.5*mx + cvx > 20) inf |= 2; }
        if(by === 0){ if(0.05*my - cvy > 20 || 1.5*my - cvy > 20) inf |= 4; }
        else if(by === BY-1){ if(-0.05*my + cvy > 20 || -1.5*my + cvy > 20) inf |= 8; }
      }
      bInf[k] = inf;
      // newly revealed (not covered by last frame's rect): may be filled with a fade
      const bx0 = x0 + bx*bw, by0 = y0 + by*bh;
      const ovx = Math.max(0, Math.min(bx0 + bw, px1) - Math.max(bx0, px0)), ovy = Math.max(0, Math.min(by0 + bh, py1) - Math.max(by0, py0));
      if(ovx*ovy < 0.9*bw*bh) bInf[k] |= 16;
    }
    const scale = tot > 0.96*MAXR ? 0.96*MAXR/tot : 1;
    // advect
    const hb = pulse, pa = 0.72+0.56*hb, pc = 0.9+0.2*hb, pvv = 0.96+0.08*hb;
    const X = Rc.x, Y = Rc.y, D = Rc.d, RA = Rc.a, RT = Rc.tp, RTR = Rc.tr, RO = Rc.o, RAL = Rc.al, RFR = Rc.fr, RR_ = Rc.r, RSD = Rc.sd;
    const ibw = 1/bw, ibh = 1/bh, t08 = simTime*0.8, t05 = simTime*0.5, ko = Math.min(1, dt*2), stag = vframe & 3;
    for(let i=0;i<nR;){
      let x = X[i], y = Y[i];
      SF[10] = x; SF[11] = y; sampleF(SF);
      let a = 1 + SF[0]; a = a < 0 ? 0 : a > 1 ? 1 : a;
      const dd = 2*D[i] - 1; let rho2 = a*a + dd*dd; if(rho2 > 1) rho2 = 1;
      const kind = SF[8], pkk = kind <= 1 ? pa + (pc-pa)*kind : pc + (pvv-pc)*(kind-1);
      const spd = 1.6*(1 - rho2)*pkk + 0.03;
      const sd = RSD[i], rr = RR_[i];
      const lat = 2.5*Math.sin(t08 + sd);
      const vx = SF[5]*spd + SF[3]*lat, vy = SF[6]*spd + SF[4]*lat;
      const fsp = Math.sqrt(SF[5]*SF[5] + SF[6]*SF[6])/SF[1], oxy = SF[7];
      x += vx*dt; y += vy*dt;
      if(SF[0] > -SF[9] - rr/SF[1] - 0.1){
        SF[10] = x; SF[11] = y; sampleF(SF);
        const l2 = -SF[9] - rr/SF[1];
        if(SF[0] > l2){ const pen = (SF[0] - l2)*SF[1] + 0.05; x -= SF[3]*pen; y -= SF[4]*pen; }
      }
      // cull
      const fr0 = RFR[i];
      let dead = x < x0 || x > x1 || y < y0 || y > y1 || !(SF[0] < 0.5) || (fr0 < 0 && RAL[i] <= 0);
      if(!dead && NM){ MB[0] = x; MB[1] = y; MB[2] = 0; if(mouthAt() >= 0) dead = true; }
      if(dead){
        const l = --nR;
        if(i !== l){ X[i] = X[l]; Y[i] = Y[l]; D[i] = D[l]; RA[i] = RA[l]; RT[i] = RT[l]; RTR[i] = RTR[l]; RO[i] = RO[l]; RAL[i] = RAL[l]; RFR[i] = RFR[l]; RR_[i] = RR_[l]; RSD[i] = RSD[l]; }
        continue;
      }
      X[i] = x; Y[i] = y;
      if(((i + stag) & 3) === 0){ const sp2 = vx*vx + vy*vy; if(sp2 > 1) RA[i] = Math.atan2(vy, vx); }
      RT[i] += dt*RTR[i]*(0.5 + 6*a*fsp);
      RO[i] += (oxy - RO[i])*ko;
      let dp = D[i] + dt*0.02*Math.sin(t05 + sd*1.3); D[i] = dp < 0.04 ? 0.04 : dp > 0.96 ? 0.96 : dp;
      // fades
      let fr = fr0;
      if(fr > 0){ const al = RAL[i] + dtf*fr; if(al >= 1){ RAL[i] = 1; RFR[i] = 0; fr = 0; } else RAL[i] = al; }
      else if(fr < 0){ RAL[i] += dtf*fr; }
      // bin census (+ drain surplus)
      let bx = ((x - x0)*ibw)|0, by = ((y - y0)*ibh)|0; if(bx >= BX) bx = BX-1; if(by >= BY) by = BY-1;
      const k = by*BX + bx;
      if(fr >= 0){
        if(bSur[k] > 0 && fr === 0){ bSur[k]--; RFR[i] = -2.5; }
        else bCnt[k]++;
      }
      i++;
    }
    // spawn / drain per bin (a view-wide deficit — e.g. after zooming in from a
    // pool-capped zoom — lets every bin fill up slowly)
    let cntAll = 0, tgAll = 0; for(let k=0;k<nb;k++){ cntAll += bCnt[k]; tgAll += bTgt[k]*scale; }
    const globalLow = cntAll < 0.85*tgAll;
    for(let k=0;k<nb;k++){
      bSur[k] = 0;
      const tg = bTgt[k]*scale, need = tg - bCnt[k];
      const bx = k % BX, by = (k / BX)|0, inf = bInf[k];
      // inflow rim bins are topped up every frame (nothing else feeds them);
      // everywhere else only real gaps (newly revealed area) and real pile-ups
      // are corrected, so Poisson noise never makes cells blink in and out
      let n = 0;
      if(jump) n = need > 0 ? Math.floor(need + (rngR.ni()*RI30)) : 0;
      else if(inf & 15) n = need > 0 ? Math.floor(need + (rngR.ni()*RI30)) : 0;
      else if(inf & 16){ if(need > 0.6) n = Math.ceil(need*Math.min(1, dtf*6)); }
      else if(globalLow && need > 0.6) n = Math.floor(need*Math.min(1, dtf*1.5) + (rngR.ni()*RI30));
      else if(need > Math.max(4, 0.6*tg)) n = Math.ceil(need*Math.min(1, dtf*2));
      else if(need < -Math.max(3, 0.35*tg)) bSur[k] = Math.ceil(-need*Math.min(1, dtf*2));
      if(n <= 0) continue;
      const fade = jump ? 3.5 : (inf & 15) ? 9 : 2.5;
      const bxw = x0 + bx*bw, byw = y0 + by*bh;
      for(let s=0; s<n && nR<MAXR; s++){
        for(let t=0;t<4;t++){
          let x = bxw + (rngR.ni()*RI30)*bw, y = byw + (rngR.ni()*RI30)*bh;
          // inflow bins: new cells enter at the rim (a uniform refill would push
          // ~40 % too many cells inward)
          if(inf & 15){ const u = (rngR.ni()*RI30)*0.3;
            if(inf & 1) x = bxw + u*bw; else if(inf & 2) x = bxw + (1-u)*bw;
            if(inf & 4) y = byw + u*bh; else if(inf & 8) y = byw + (1-u)*bh; }
          SF[10] = x; SF[11] = y; sampleF(SF);
          const r = RR*(0.9 + 0.2*(rngR.ni()*RI30));
          if(!(SF[0] < -SF[9] - r/SF[1])) continue;
          if(NM){ MB[0] = x; MB[1] = y; MB[2] = 0; if(mouthAt() >= 0) continue; }
          const i = nR++;
          X[i] = x; Y[i] = y; D[i] = 0.05 + 0.9*(rngR.ni()*RI30); Rc.r[i] = r;
          Rc.a[i] = Math.atan2(SF[6], SF[5]) + ((rngR.ni()*RI30)-0.5)*0.3; Rc.tp[i] = (rngR.ni()*RI30)*6.283; Rc.tr[i] = 0.6 + 0.8*(rngR.ni()*RI30);
          Rc.o[i] = SF[7]; Rc.al[i] = 0; Rc.fr[i] = fade; Rc.sd[i] = (rngR.ni()*RI30)*100;
          break;
        }
      }
    }
    // pack
    const out = rbc.data;
    for(let i=0;i<nR;i++){
      const o = i*8;
      out[o] = X[i]; out[o+1] = Y[i]; out[o+2] = Rc.r[i]; out[o+3] = D[i]; out[o+4] = Rc.a[i];
      out[o+5] = 0.5 - 0.5*Math.cos(Rc.tp[i]); out[o+6] = Rc.o[i]; out[o+7] = Rc.al[i] < 0 ? 0 : Rc.al[i];
    }
    rbc.count = nR;
  }

  // =========================================================================
  //  PACK UNITS (16 floats)
  // =========================================================================
  // Unit instance (16 floats): x y r type angle phase flags hp lookX lookY
  // stretch tint e0 e1 e2 e3. Common: e0 = fade-out progress 0..1 while flag 8
  // (dying) is set, e3 = fade-in alpha 0..1 (spawn). Per type:
  //  0 WBC        angle heading, hp digest progress, look eyes, stretch
  //               0.85..1.35 along the heading (> 1 elongated: swim effort,
  //               speed, sideways squeeze; < 1 squashed: braking, head-on
  //               impacts, stopping, adhering, gulping; a damped spring, so it
  //               overshoots a little but never jumps), e0 (flag 8 not set)
  //               jiggle amplitude 0..1 (decaying impulse: bumps into
  //               neighbours / walls, engulfing 1, orders, stops, adhesion,
  //               bites on a lesion), e1 prey being digested (0 none,
  //               1 virus, 2 bacterium), e2 swim activity 0..1
  //  1 virus      angle spin, look → nearest white cell, e1 0, e2 speed 0..1
  //  2 bacterium  angle body axis, stretch 2.2..3 (rod; grows before dividing),
  //               e1 division progress 0..1, e2 speed 0..1, flag 16 colonised
  //  3 site       angle wall tangent, hp remaining, look → into the lumen,
  //               e1 crowd 0..1 (attackers), e2 emission pulse 0..1
  //  5 FX burst   hp life 1 → 0, tint colour (0.1 cyan: cell died, 0.5 green:
  //               bacterium / site, 0.85 orange: virus), e1 kind (1 virus,
  //               2 bacterium, 3 site destroyed, 4 white cell died)
  // flags: 1 selected, 2 eating, 4 hit (pathogen about to be caught, site
  // under attack, white cell worn down), 8 dying, 16 adhered, 32 hovered.
  // Order: sites, pathogens, white cells, FX.
  function packUnits(){
    const o = units.data; let n = 0;
    const put = (x,y,r,type,ang,ph,flags,hp,lx,ly,st,tint,e0,e1,e2,e3) => {
      const b = n*16; o[b]=x; o[b+1]=y; o[b+2]=r; o[b+3]=type; o[b+4]=ang; o[b+5]=ph; o[b+6]=flags; o[b+7]=hp;
      o[b+8]=lx; o[b+9]=ly; o[b+10]=st; o[b+11]=tint; o[b+12]=e0; o[b+13]=e1; o[b+14]=e2; o[b+15]=e3; n++;
    };
    for(let s=0;s<MAXS;s++){
      if(!Sx.alive[s]) continue;
      const dying = Sx.alive[s] === 2;
      const flags = (Sx.flash[s] > 0 ? F_HIT : 0) | (dying ? F_DIE : 0);
      put(Sx.x[s], Sx.y[s], Sx.r[s], 3, Math.atan2(Sx.nx[s], -Sx.ny[s]), Sx.ph[s], flags, Sx.hp[s],
          -Sx.nx[s], -Sx.ny[s], 1.5, Sx.tint[s], dying ? Math.min(1, Sx.die[s]/1.4) : 0, Sx.crowd[s], Sx.emit[s], 1);
    }
    for(let p=0;p<MAXP;p++){
      const ty = P.type[p]; if(!ty) continue;
      const sp = Math.sqrt(P.vx[p]*P.vx[p] + P.vy[p]*P.vy[p]);
      const flags = (P.hit[p] > 0 ? F_HIT : 0) | (P.adh[p] ? F_ADH : 0);
      let lx = P.lx[p], ly = P.ly[p];
      if(P.near[p] > 1e8){ const a = P.ang[p] + 0.8*Math.sin(simTime*0.5 + P.ph[p]); lx = Math.cos(a); ly = Math.sin(a); }
      if(ty === 1){
        put(P.x[p], P.y[p], TUNE.VIRUS_R, 1, P.ang[p], P.ph[p], flags, 1, lx, ly, 1, P.tint[p], 0, 0, Math.min(1, sp/400), P.fade[p]);
      } else {
        const dv = 1 - P.div[p]/P.divD[p];
        put(P.x[p], P.y[p], TUNE.BACT_R, 2, P.ang[p], P.ph[p], flags, 1, lx, ly, TUNE.BACT_LEN + 0.8*smoothstep(0.7, 1, dv), P.tint[p], 0, dv, Math.min(1, sp/300), P.fade[p]);
      }
    }
    for(let i=0;i<nW;i++){
      const st = W.st[i]; if(st === TRANSIT) continue;
      const flags = (W.sel[i] ? F_SEL : 0) | (W.dig[i] > 0 ? F_EAT : 0) | (st === DYING ? F_DIE : 0) | (st === ADH ? F_ADH : 0) | (W.hov[i] ? F_HOV : 0)
                  | (W.flash[i] > 0 ? F_HIT : 0);
      const hp = W.dig[i] > 0 ? 1 - W.dig[i]/W.digD[i] : 0;
      put(W.x[i], W.y[i], R*W.sz[i], 0, Math.atan2(W.hy[i], W.hx[i]), W.ph[i], flags, hp, W.lx[i], W.ly[i], W.str[i], W.tint[i],
          st === DYING ? Math.min(1, W.tim[i]/1.3) : W.jig[i], W.dig[i] > 0 ? W.eat[i] : 0, W.act[i], W.fade[i]);
    }
    for(let k=0;k<MAXFX;k++){
      if(!FX.on[k]) continue;
      const f = FX.age[k]/FX.dur[k], kd = FX.kind[k];
      const tint = kd === 1 ? 0.85 : kd === 2 || kd === 3 ? 0.5 : 0.1;
      put(FX.x[k], FX.y[k], FX.r[k], 5, 0, FX.ph[k], 0, 1 - f, 0, 0, 1, tint, 0, kd, 0, 1);
    }
    units.count = n;
  }

  // =========================================================================
  //  PUBLIC API
  // =========================================================================
  // update(dt, ctx)       advance (dt clamped to 0.05 s, sub-stepped at ≤ 1/45 s;
  //                       dt 0 = paused: red cells still follow the camera and
  //                       the units buffer is re-packed, the game state is untouched).
  //                       ctx.view = world rect incl. margin; ctx.rbcLOD 0 → no
  //                       red-cell particles (ctx.z alone also works).
  // selectInRect(x0,y0,x1,y1, additive) → n selected
  // selectAt(x, y, pickRadius µm, additive) → n   the clicked cell's connected
  //                       horde (cells within 34 µm of each other); nothing hit
  //                       → 0 and the selection is left unchanged
  // selectAll() → n, clearSelection() → 0, selectionCenter() → {x,y,n}|null
  // hoverAt(x, y, pickRadius) → n   flags that horde "hovered" (x = null clears)
  // command(x, y) → {ok, x, y, n, attack}   move order for the selection; the
  //                       target is snapped into the lumen (near a wall in fast
  //                       vessels, upstream of AV connectors); within SITE_PICK
  //                       of an infection site it is an attack order on it
  //                       (a cell that starts dying leaves the selection)
  // tracePath(x, y, orderSlot, maxPts, outFloat32) → points  path preview
  // orders[slot] {active, x, y, n (still moving), serial, done, attack}
  // stats {wbc, selected, viruses, bacteria, sites, infection, immunity, score,
  //        wave, time, state:'play'|'over'|'won', transit, captured, escaped,
  //        sitesDown, deaths, reinforced}
  // events (drain it), {type, x, y, …}: capture{kind,score} spawn{n} order{n,attack}
  //        siteUp{kind} siteDown{score} escape{kind} death; without a position:
  //        wave{wave,sites} over{score} won{score}
  // home {x,y} (start horde), pulse (BV.heart now), time, ready (nav grid built),
  // prewarm(ms) (build the nav grid in idle time), reset(seed),
  // setDifficulty(d) → factor ('easy' | 'normal' | 'hard' | number 0.3..3; live
  //                       lesions rescale their hit points and emission rate)
  const S = {
    rbc, units, events, stats, orders, home, pulse: 0, tune: TUNE, net,
    get time(){ return simTime; },
    get ready(){ return nav.ready; },
  };
  S.update = function(dt, ctx){
    const t0 = performance.now();
    ctx = ctx || {};
    dt = +dt; if(!(dt > 0)) dt = 0; if(dt > 0.05) dt = 0.05;
    // game frames count only when time advances (camera-only update(0) calls
    // must not shift the game's frame-staggered work); vframe paces the view
    if(dt > 0) frame++;
    vframe++;
    const PR = dbg.prof, now = PR ? () => performance.now() : null;
    let tp = PR ? now() : 0;
    const lap = PR ? (k) => { const t = now(); PR[k] = (PR[k]||0) + t - tp; tp = t; } : null;
    if(!nav.ready) navStep(TUNE.NAV_MS);
    // (also while paused, for the path preview: cells only read a field from its
    // readyFrame on, by when game frames alone have finished it — so how far
    // camera-only update(0) calls got never changes what they see)
    if(pending) fieldStep(pending, TUNE.DIJ_BUDGET);
    if(PR) lap('nav');
    if(dt > 0){
      const nsub = Math.max(1, Math.ceil(dt/(1/45)));
      const h = dt/nsub;
      for(let s=0;s<nsub;s++){
        simTime += h; pulse = BV.heart(simTime, 66);
        stepUnits(h); if(PR) lap('units');
        stepPathogens(h); if(PR) lap('patho');
        interact(); if(PR) lap('interact');
      }
      for(let k=0;k<MAXFX;k++) if(FX.on[k]){ FX.age[k] += dt; if(FX.age[k] >= FX.dur[k]) FX.on[k] = 0; }
      gameStep(dt); if(PR) lap('game');
      senseStep(); if(PR) lap('sense');
    } else {
      hashC.build(nW, W.x, W.y, skipW);
    }
    S.pulse = pulse;
    updateRbc(dt, ctx); if(PR) lap('rbc');
    // orders: users (cells on the order) and cells still moving, in one pass
    ordUsers.fill(0); ordMoving.fill(0);
    for(let i=0;i<nW;i++){
      const o = W.ord[i]; if(o < 0) continue;
      const F = fields[o]; if(!F || F.serial !== W.ser[i]) continue;
      // still under way: moving, in transit, or detoured into a chase from the move
      ordUsers[o]++; const st = W.st[i]; if(st === MOVE || st === TRANSIT || (st === CHASE && W.prev[i] === MOVE)) ordMoving[o]++;
    }
    for(let f=0; f<MAXF; f++){
      const o = orders[f], F = fields[f];
      if(F) F.users = ordUsers[f];
      if(!F || !F.serial || !ordUsers[f]){ o.active = false; continue; }
      o.active = true; o.x = F.tx; o.y = F.ty; o.n = ordMoving[f]; o.serial = F.serial; o.done = ordMoving[f] === 0; o.attack = F.site >= 0;
    }
    if(PR) lap('orders');
    packUnits(); if(PR) lap('pack');
    // stats
    let sel = 0, tr = 0, chg = 0;
    for(let i=0;i<nW;i++){ if(W.sel[i] && W.st[i] !== TRANSIT) sel++; if(W.st[i] === TRANSIT) tr++; if(W.st[i] !== DYING) chg += W.chg[i]; }
    let nv = 0, nbac = 0, ns = 0;
    for(let p=0;p<MAXP;p++){ const t = P.type[p]; if(t === 1) nv++; else if(t === 2) nbac++; }
    for(let s=0;s<MAXS;s++) if(Sx.alive[s] === 1) ns++;
    stats.wbc = nW; stats.selected = sel; stats.transit = tr; stats.viruses = nv; stats.bacteria = nbac; stats.sites = ns;
    stats.infection = infection < 1 ? infection : 1; stats.immunity = Math.max(0, Math.min(1, chg/(opts.wbcCap || TUNE.WBC_CAP)));
    stats.score = score; stats.wave = wave; stats.time = simTime; stats.state = state;
    dbg.lastUpdateMs = performance.now() - t0;
  };

  // ---- selection -----------------------------------------------------------
  function countSel(){ let n = 0; for(let i=0;i<nW;i++) if(W.sel[i] && W.st[i] !== TRANSIT && W.st[i] !== DYING) n++; return n; }
  S.selectInRect = function(x0, y0, x1, y1, additive){
    const ax = Math.min(x0,x1), bx = Math.max(x0,x1), ay = Math.min(y0,y1), by = Math.max(y0,y1);
    for(let i=0;i<nW;i++){
      const inside = W.st[i] !== TRANSIT && W.st[i] !== DYING && W.x[i] >= ax && W.x[i] <= bx && W.y[i] >= ay && W.y[i] <= by;
      if(inside) W.sel[i] = 1; else if(!additive) W.sel[i] = 0;
    }
    return countSel();
  };
  function flood(seed, out, link){
    markStamp++;
    let qh = 0, qt = 0; bfsQ[qt++] = seed; mark[seed] = markStamp;
    const hs = hashC, inv = hs.inv, L2 = link*link;
    while(qh < qt){
      const i = bfsQ[qh++]; out[i] = 1;
      const cx0 = Math.floor(W.x[i]*inv), cy0 = Math.floor(W.y[i]*inv);
      for(let qy=cy0-1; qy<=cy0+1; qy++) for(let qx=cx0-1; qx<=cx0+1; qx++){
        const bkt = hs.key(qx, qy);
        for(let q=hs.start[bkt], qe=hs.start[bkt+1]; q<qe; q++){
          const j = hs.items[q];
          if(j >= nW || mark[j] === markStamp || hs.cx[j] !== qx || hs.cy[j] !== qy) continue;
          if(W.st[j] === TRANSIT || W.st[j] === DYING) continue;
          const dx = W.x[j]-W.x[i], dy = W.y[j]-W.y[i];
          if(dx*dx + dy*dy < L2){ mark[j] = markStamp; bfsQ[qt++] = j; }
        }
      }
    }
    return qt;
  }
  function pick(x, y, pickR){
    let best = -1, bd = (pickR + R)*(pickR + R);
    for(let i=0;i<nW;i++){
      if(W.st[i] === TRANSIT || W.st[i] === DYING) continue;
      const dx = W.x[i]-x, dy = W.y[i]-y, d2 = dx*dx + dy*dy;
      if(d2 < bd){ bd = d2; best = i; }
    }
    return best;
  }
  S.selectAt = function(x, y, pickRadius, additive){
    hashC.build(nW, W.x, W.y, skipW);
    const i = pick(x, y, pickRadius || 0);
    if(i < 0) return 0;
    if(!additive) W.sel.fill(0);
    flood(i, W.sel, 34);
    return countSel();
  };
  S.selectAll = function(){ for(let i=0;i<nW;i++) W.sel[i] = (W.st[i] !== TRANSIT && W.st[i] !== DYING) ? 1 : W.sel[i]; return countSel(); };
  S.clearSelection = function(){ W.sel.fill(0); return 0; };
  S.hoverAt = function(x, y, pickRadius){
    W.hov.fill(0);
    if(x == null) return 0;
    hashC.build(nW, W.x, W.y, skipW);
    const i = pick(x, y, pickRadius || 0);
    if(i < 0) return 0;
    return flood(i, W.hov, 34);
  };
  S.selectionCenter = function(){
    let sx = 0, sy = 0, n = 0;
    for(let i=0;i<nW;i++) if(W.sel[i] && W.st[i] !== TRANSIT && W.st[i] !== DYING){ sx += W.x[i]; sy += W.y[i]; n++; }
    return n ? { x: sx/n, y: sy/n, n } : null;
  };

  // ---- orders ----------------------------------------------------------------
  function snapTarget(x, y){
    // 1. into the lumen (along −∇N), else the nearest nav node
    let px = x, py = y, ok = false;
    net.evalAt(px, py, ev);
    for(let it=0; it<8; it++){
      const lim = -ev.wall - 2.5*R/ev.rB;
      if(ev.N < lim && beyondMouth(px, py, R) < 0){ ok = true; break; }
      if(ev.N > 20) break;
      const step = (ev.N - lim)*ev.rB + 1;
      px -= ev.gx*step; py -= ev.gy*step;
      net.evalAt(px, py, ev);
    }
    if(!ok || Math.hypot(px-x, py-y) > 700){
      const id = nearestNode(x, y, 20); if(id < 0) return null;
      px = nX[id]; py = nY[id]; net.evalAt(px, py, ev);
      if(Math.hypot(px-x, py-y) > 900) return null;
    }
    // 2. a torrent nobody can park in (the wall lane a few cells deep is still too
    //    fast — AV connectors): walk upstream until a horde could hold there
    const holdSpd = () => { const ae = Math.max(0, 1 - ev.wall - 2*R/ev.rB); return Math.hypot(ev.fx, ev.fy)*1.6*(1 - ae*ae)*pkMean(ev.kind)*1.15*TUNE.CARRY; };
    if(holdSpd() > 0.8*TUNE.SWIM){
      let qx = px, qy = py, moved = 0;
      while(moved < 1600){
        const fl = Math.hypot(ev.fx, ev.fy) || 1;
        qx -= ev.fx/fl*20; qy -= ev.fy/fl*20; moved += 20;
        net.evalAt(qx, qy, ev);
        const lim = -ev.wall - 3*R/ev.rB;
        if(ev.N > lim){ const st = (ev.N - lim)*ev.rB + 1; qx -= ev.gx*st; qy -= ev.gy*st; net.evalAt(qx, qy, ev); }
        if(!(ev.N < -ev.wall)) break;
        if(holdSpd() <= 0.8*TUNE.SWIM){ px = qx; py = qy; break; }
      }
      net.evalAt(px, py, ev);
    }
    // 3. in a fast vessel, slide toward the nearest wall until holding position is possible
    for(let it=0; it<120; it++){
      let a = 1 + ev.N; a = a < 0 ? 0 : a > 1 ? 1 : a;
      const spd = Math.hypot(ev.fx, ev.fy)*1.6*(1 - a*a)*pkMean(ev.kind)*1.15*TUNE.CARRY;
      if(spd <= 0.55*TUNE.SWIM) break;
      if(ev.N > -ev.wall - 4*R/ev.rB) break;
      px += ev.gx*8; py += ev.gy*8; net.evalAt(px, py, ev);
    }
    return { x: px, y: py };
  }
  S.command = function(x, y){
    x = +x; y = +y; if(!(x === x && y === y)) return { ok:false, x, y };
    let nsel = 0; for(let i=0;i<nW;i++) if(W.sel[i] && W.st[i] !== TRANSIT && W.st[i] !== DYING) nsel++;
    ensureNav();
    // clicking on (or next to) an infection site is an attack order
    let site = -1, sd = Infinity;
    for(let q=0;q<MAXS;q++){ if(Sx.alive[q] !== 1) continue; const d = Math.hypot(Sx.x[q]-x, Sx.y[q]-y) - Sx.r[q]; if(d < TUNE.SITE_PICK && d < sd){ sd = d; site = q; } }
    const tgt = site >= 0 ? { x: Sx.cx[site], y: Sx.cy[site] } : snapTarget(x, y);
    if(!tgt) return { ok:false, x, y };
    if(!nsel) return { ok:false, x: tgt.x, y: tgt.y };
    const tnode = nearestNode(tgt.x, tgt.y, 6);
    if(tnode < 0) return { ok:false, x: tgt.x, y: tgt.y };
    // a free field slot (or the least-used one)
    for(const F of fields) F.users = 0;
    for(let i=0;i<nW;i++){ const F = fieldOf(i); if(F && !W.sel[i]) F.users++; }
    let slot = -1;
    for(let f=0; f<fields.length; f++) if(!fields[f].users){ slot = f; break; }
    if(slot < 0 && fields.length < MAXF){ fields.push(newField()); slot = fields.length-1; }
    if(slot < 0){ let best = Infinity; for(let f=0; f<fields.length; f++){ if(fields[f].users < best){ best = fields[f].users; slot = f; } } }
    const F = fields[slot];
    F.serial = ++serialCounter; F.tx = tgt.x; F.ty = tgt.y; F.arrived = 0; F.stamp = simTime;
    F.site = site; F.siteId = site >= 0 ? Sx.id[site] : 0;
    net.evalAt(tgt.x, tgt.y, ev);
    F.rs = site >= 0 ? TUNE.SEED_MIN : Math.max(TUNE.SEED_MIN, Math.min(TUNE.SEED_MAX, TUNE.SEED_R*ev.rB));
    fieldStart(F, tnode, F.rs);
    fieldStep(F, TUNE.DIJ_BUDGET*3);
    // game frames finish it at DIJ_BUDGET pops each (every node is popped once):
    // cells follow it from then on, however far update(0) calls took it before
    F.readyFrame = F.done ? 0 : frame + Math.ceil((nav.n - F.pops)/TUNE.DIJ_BUDGET);
    for(let i=0;i<nW;i++){
      if(!W.sel[i] || W.st[i] === TRANSIT || W.st[i] === DYING){
        continue;
      }
      if(W.st[i] === MOVE) jiggle(i, 0.3, 0.5); else jiggle(i, 0.55, 0.9);    // setting off: wobble + a lurch
      W.ord[i] = slot; W.ser[i] = F.serial; W.st[i] = MOVE; W.tim[i] = 0; W.stN[i] = 0; W.stT[i] = rng.next(); W.fl[i] = 0; W.cs[i] = -1;
    }
    // transit cells that were selected follow the order when they re-enter
    for(let i=0;i<nW;i++) if(W.sel[i] && W.st[i] === TRANSIT){ W.ord[i] = slot; W.ser[i] = F.serial; }
    emit({ type:'order', x: tgt.x, y: tgt.y, n: nsel, attack: site >= 0 });
    return { ok:true, x: tgt.x, y: tgt.y, n: nsel, attack: site >= 0 };
  };
  // path preview: follow the field of the order the selection is on (or of a point) from (x,y)
  S.tracePath = function(x, y, orderSlot, maxPts, out){
    const F = fields[orderSlot]; if(!F || !F.serial) return 0;
    out = out || new Float32Array(2*(maxPts||200)); maxPts = Math.min(maxPts || 200, out.length >> 1);
    let n = 0, px = x, py = y;
    for(let k=0;k<maxPts;k++){
      out[2*n] = px; out[2*n+1] = py; n++;
      const dx = F.tx - px, dy = F.ty - py, d = Math.hypot(dx, dy);
      if(d < 30){ if(n < maxPts){ out[2*n] = F.tx; out[2*n+1] = F.ty; n++; } break; }
      if(!navDir(F, px, py)) break;
      // inside the target's seed disc the cells have arrived (see MOVE): the
      // field there only spreads them out, so draw the last leg straight
      if(d < F.rs && NV[2] <= F.rs*TUNE.SEED_RAMP/TUNE.NAV_S + 0.15){ if(n < maxPts){ out[2*n] = F.tx; out[2*n+1] = F.ty; n++; } break; }
      px += NV[0]*CS*0.9; py += NV[1]*CS*0.9;
      const m = beyondMouth(px, py, 0); if(m >= 0 && mOut[m] && inMouth){ px = inEntryX; py = inEntryY; }
    }
    return n;
  };
  S.prewarm = function(ms){ if(!nav.ready) navStep(ms); return nav.ready; };
  S.reset = function(seed){ reset(seed); };
  S.setDifficulty = function(d){
    opts.difficulty = d;
    const old = diff; diff = parseDifficulty(d);
    // live lesions follow the new setting (hit points and emission rate scale with it)
    for(let s=0;s<MAXS;s++) if(Sx.alive[s] === 1){ Sx.max[s] *= diff/old; Sx.rate[s] *= old/diff; }
    return diff;
  };

  // debug / test access (not part of the contract)
  S._dbg = { W, P, Sx, FX, Rc, fields, nav, dbg, mouths, get nW(){ return nW; }, get nR(){ return nR; }, get infection(){ return infection; }, set infection(v){ infection = v; },
    navDir: (F,x,y)=> navDir(F,x,y) ? { x:NV[0], y:NV[1], T:NV[2] } : null, nidx, NW, NH, OX, OY, CS, get nX(){ return nX; }, get nY(){ return nY; },
    placeSite: k => placeSite(k), addPathogen: (t,x,y)=>addPathogen(t,x,y,0,0), spawnCluster: (x,y,n)=>spawnCluster(x,y,n,HOLD), inMouth, get inEntry(){ return inEntry; },
    get pending(){ return pending; }, finishPending: () => { if(pending) fieldStep(pending, 1e12); }, setWave: w => { wave = w; }, get state(){ return state; }, rbcBins: { bTgt, bCnt, bSur, bArea, get BX(){ return lastBX; }, get BY(){ return lastBY; } } };

  reset(opts.seed|0);
  return S;
};
})();
