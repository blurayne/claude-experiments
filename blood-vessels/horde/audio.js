/* ============================================================================
   HORDE — procedural sound
   ----------------------------------------------------------------------------
   const A = BV.createAudio(opts)
     opts.context  an existing (Offline)AudioContext: set up at once (tests render
                   every sound offline); without it the engine waits for
                   A.unlock() — call it from a user gesture (autoplay rules)
     opts.clock    () → seconds: the scheduling clock (default ctx.currentTime;
                   an offline test passes a virtual clock and schedules a whole
                   scene before startRendering)
     opts.seed     seeds every random choice (variants, jitter, grains)
     opts.enabled  (default true)   opts.volume 0..1 (default 0.8)
     opts.log      an array: every voice started is appended (tests)
   A.unlock()               create / resume the context (user gesture; cheap —
                            the graph is built on the next A.update, the noise
                            loops and the reverb impulse in idle-time chunks)
   A.update(dt, st)         once per frame (see UPDATE below)
   A.event(e)               a game or UI event (see EVENTS below)
   A.setEnabled(on)  A.setVolume(v)  A.setHidden(h)   (fade, then suspend / resume, fade in)
   A.stats() → {state, voices, peakVoices, nodesPerSec, nodes, dropped, merged,
                stolen, gated, beats, beatsLate, beatsSkipped, bpm, gameRate,
                built, pending, graph, beds, jobs, bufferKB, frames, errors}
   A.available (Web Audio exists)   A.ctx (null until unlocked)   A.enabled   A.volume
   A.test = {names, play(name, o), buffer(name, v) (raw recipe samples),
             heartAt(t, bpm) (one beat), surgeAt(t), mix (bed multipliers),
             bus(name, g), setLog(array), G (the node graph), H (heart state)}

   Everything is synthesised here — no audio files, no network. One-shots are
   rendered in JS into small AudioBuffers ("recipes": damped sines, filtered
   noise, polyBLEP saws through time-varying biquads), a few variants each,
   built lazily in idle time (~1.5 ms per frame) and cached; a voice is then
   one AudioBufferSourceNode + one GainNode into a shared pan bus. Continuous
   beds (flow, rumble, swarm murmur, zoom whoosh, tension drone, flatline) are
   persistent node chains fed by two looping noise buffers and steered with
   setTargetAtTime, so steady state creates no nodes. No sound starts while
   muted, hidden or suspended (it would queue on the frozen clock and burst
   out on resume).

   HEART   S1 "lub": mitral + tricuspid closure, two damped low components
           18–30 ms apart (~45–70 Hz fundamental, glide down, ~110 ms), a
           leaflet knock; S2 "dub": aortic + pulmonic, shorter (~75–125 ms),
           higher, sharper, ~3–4 dB under S1, with a physiological split that
           widens on inspiration (the sim's breath also sways the level). A body
           low-pass and a dark synthesised convolution reverb put it inside the
           chest; a parallel harmonic path (band-pass → tanh → 380 Hz–1.4 kHz)
           adds the overtones laptop and phone speakers can play. A soft
           systolic flow whoosh fills S1→S2. Every beat picks a variant and
           varies level, pitch and timing (seeded).
           LOCK: the sim's heart is a phase accumulator (S.heart {phase, beat,
           bpm, bpmNow, breath, flat}) and BV.heartPh is rate-aware (u =
           phase·64/bpm: systole keeps its duration, diastole shortens). S1
           lands at u = 0.035, the onset of the systolic upstroke, ~0.1 s before
           the renderer's low-passed arterial dilation peaks, at every rate. S2
           follows after the physiological S1–S2 interval, 0.355 − 0.0018·(bpm −
           64) s (Weissler: ~0.36 s at rest, ~0.27 s at 110 bpm, systole ≈ 38 %
           → 50 % of the cycle); at rest it trails the rendered dicrotic notch by
           up to ~0.1 s (audio-late, inside the AV tolerance), at 110 bpm they
           coincide. Both are predicted on the audio clock from phase, rate
           (with the breathing swing) and the measured game/real time ratio
           (≥ 0.04: sync holds down to ~2 fps), scheduled once per beat inside a
           short lookahead. Pausing silences a beat already scheduled but not
           yet heard; it plays when the visible pulse reaches it after resume.
   AMBIENCE zoom decides where you are: zoomed out, outside the vessels — a
           deep, muffled body rumble (+ a quiet 150–300 Hz room band), the heart
           dominant; zoomed in over a lumen, inside the flow — rushing filtered
           noise whose level and brightness follow the vessel's speed (arteries
           bright and strongly pulsatile, veins dark and steady), surging on
           every beat with the sim's pulsatile flow, shifted half-way toward the
           vessel wall's pulse-wave delay (st.flow.delay), plus sparse "red cells
           tumbling past" micro-grains at high zoom (≤ 6/s, bunched on the
           surge). A band-pass whoosh follows zoom velocity (its pitch rises as
           you dive in, falls as you pull out). After a cardiac arrest the beds
           fade out under the flatline.
   MIX     buses heart / amb / phys (distance-muffled SFX) / dry (chimes,
           stingers) / ui → world (pause fade) → master (volume²) → compressor
           (catches storms and stingers only) → soft clipper (never above −1
           dBFS; not reached at the default volume). The heart ducks briefly
           under captures, orders and lesion kills — deeply only when a lub or
           dub would land on them. Events pan by screen x and fade with distance
           from the view (silent beyond ~1.3 screens) and at low zoom. Per-sound
           rate limits (token buckets), per-sound and global voice caps with
           priority stealing, and a node budget keep a zoomed-out horde eating
           50 viruses a second a pleasant fizz: bursts of captures merge into
           one "multi" voice, and the reward chime (at most every 0.6 s) climbs
           a C-major pentatonic step per chime to a "streak" chime.

   UPDATE st: {time, paused, state:'play'|'over'|'won', infection,
               heart:{phase, beat, bpm, bpmNow, breath, flat}, z, zMin, zMax,
               zv (d ln z/dt), vw, vh, flow:{lumen 0..1, speed µm/s, kind 0
               art..2 ven, pan, delay (pulse-wave delay, game s)},
               moving:{n, pan}, rbc (red cells shown)}
   EVENTS  sim: capture{kind} siteDown siteUp{kind} wave spawn{n} escape{kind}
           death over won (order is ignored: the UI sends 'command');
           UI: select{n} command{n, attack} nope click open close toggle
           preview (one heartbeat through the UI bus: the volume slider).
           Optional screen position {sx, sy} (css px) for pan + distance.
   ========================================================================== */
(function(){
'use strict';
const BV = window.BV = window.BV || {};
const TAU = Math.PI*2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const smooth = (a, b, x) => { const t = clamp((x - a)/(b - a), 0, 1); return t*t*(3 - 2*t); };
const dB = d => Math.pow(10, d/20);

// heart-sound timing against BV.heartPh (net.js): see HEART above. The curve is rate-aware
// (u = phase·HREF/bpm): S1 at u = S1_U; S2 after the physiological S1–S2 interval
const S1_U = 0.035, S1_LEAD = 0.006, HREF = 64;
const s2Delay = bpm => clamp(0.355 - 0.0018*(bpm - 64), 0.25, 0.37);
// game time / real time: at most SIM_MAXN·SIM_H = 50 ms of game time run per frame (main.js),
// so a 1–2 fps frame rate still measures ≥ 0.04
const RATE_MIN = 0.04;

function mulberry(seed){
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0)/4294967296; };
}
function hashStr(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ============================================================================
//  offline DSP (recipes render into Float32Arrays)
// ============================================================================
function Biq(){ this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0; this.z1 = 0; this.z2 = 0; }
Biq.prototype.set = function(type, f, Q, sr, gdb){
  const w = TAU*clamp(f, 5, sr*0.45)/sr, cw = Math.cos(w), sw = Math.sin(w), al = sw/(2*(Q || 0.7071));
  let b0, b1, b2, a0, a1, a2;
  if(type === 'lp'){ b0 = (1 - cw)/2; b1 = 1 - cw; b2 = b0; a0 = 1 + al; a1 = -2*cw; a2 = 1 - al; }
  else if(type === 'hp'){ b0 = (1 + cw)/2; b1 = -(1 + cw); b2 = b0; a0 = 1 + al; a1 = -2*cw; a2 = 1 - al; }
  else if(type === 'bp'){ b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2*cw; a2 = 1 - al; }
  else { const A = Math.pow(10, (gdb || 0)/40); b0 = 1 + al*A; b1 = -2*cw; b2 = 1 - al*A; a0 = 1 + al/A; a1 = -2*cw; a2 = 1 - al/A; }
  this.b0 = b0/a0; this.b1 = b1/a0; this.b2 = b2/a0; this.a1 = a1/a0; this.a2 = a2/a0;
  return this;
};
Biq.prototype.run = function(x){ const y = this.b0*x + this.z1; this.z1 = this.b1*x - this.a1*y + this.z2; this.z2 = this.b2*x - this.a2*y; return y; };

function makeRecipes(SR){
  const len = s => Math.max(1, Math.round(s*SR));
  const buf = s => new Float32Array(len(s));
  // raised-cosine attack 0 → 1 over a seconds
  const att = (t, a) => t >= a ? 1 : t <= 0 ? 0 : 0.5 - 0.5*Math.cos(Math.PI*t/a);
  function fades(b, fi, fo){
    const n = b.length, ni = Math.min(n, len(fi)), no = Math.min(n, len(fo));
    for(let i=0;i<ni;i++) b[i] *= 0.5 - 0.5*Math.cos(Math.PI*i/ni);
    for(let i=0;i<no;i++) b[n - 1 - i] *= 0.5 - 0.5*Math.cos(Math.PI*i/no);
    b[n - 1] = 0;
    return b;
  }
  function peak(b){ let m = 0; for(let i=0;i<b.length;i++){ const a = b[i] < 0 ? -b[i] : b[i]; if(a > m) m = a; } return m; }
  function norm(b, p){ const m = peak(b); if(m > 1e-9){ const k = p/m; for(let i=0;i<b.length;i++) b[i] *= k; } return b; }
  function filt(b, type, f, Q, g){ const q = new Biq().set(type, f, Q, SR, g); for(let i=0;i<b.length;i++) b[i] = q.run(b[i]); return b; }
  // time-varying filter: f(t) re-evaluated every 16 samples
  function filtV(b, type, fFn, Q, i0, i1){
    const q = new Biq(); i0 = i0 || 0; i1 = i1 == null ? b.length : i1;
    for(let i=i0;i<i1;i++){ if(((i - i0) & 15) === 0) q.set(type, fFn((i - i0)/SR), Q, SR); b[i] = q.run(b[i]); }
    return b;
  }
  function sat(b, d){ norm(b, 1); const k = 1/Math.tanh(d); for(let i=0;i<b.length;i++) b[i] = Math.tanh(d*b[i])*k; return b; }
  // noise (white, then optionally filtered), RMS-normalised to 1
  function noise(r, n, type, f, Q){
    const a = new Float32Array(n);
    for(let i=0;i<n;i++) a[i] = r()*2 - 1;
    if(type) filt(a, type, f, Q);
    let s = 0; for(let i=0;i<n;i++) s += a[i]*a[i];
    const k = s > 0 ? 1/Math.sqrt(s/n) : 0; for(let i=0;i<n;i++) a[i] *= k;
    return a;
  }
  // polyBLEP sawtooth, phase p in [0,1), increment dt
  function blep(p, dt){
    let v = 2*p - 1;
    if(p < dt){ const t = p/dt; v -= t + t - t*t - 1; }
    else if(p > 1 - dt){ const t = (p - 1)/dt; v -= t*t + t + t + 1; }
    return v;
  }
  // a damped low "thump" (a valve closing: the cardiohemic system rings for a few cycles)
  // parts: [ratio, amp, decay multiplier]
  function thump(b, r, t0, f0, dec, amp, a, glide, parts, nz, nzF){
    const i0 = len(t0), n = b.length;
    let ph = 0;
    for(let i=i0;i<n;i++){
      const tt = (i - i0)/SR; if(tt > dec*9) break;
      const e = amp*att(tt, a)*Math.exp(-tt/dec);
      ph += TAU*f0*(1 + glide*Math.exp(-tt/0.016))/SR;
      let y = Math.sin(ph);
      for(let k=0;k<parts.length;k++){ const p = parts[k]; y += p[1]*Math.exp(-tt/(dec*p[2]))*Math.sin(p[0]*ph); }
      b[i] += e*y;
    }
    if(nz){
      const m = Math.min(n - i0, len(0.07)), w = noise(r, m, 'lp', nzF, 0.8);
      for(let k=0;k<m;k++){ const tt = k/SR; b[i0 + k] += amp*nz*att(tt, 0.0015)*Math.exp(-tt/0.011)*w[k]; }
    }
  }
  // a bubble: sine with a rising pitch (Minnaert resonance of a shrinking bubble)
  function bubble(b, t0, f0, rise, dec, amp, a){
    const i0 = len(t0), n = b.length; a = a || 0.0008;
    let ph = 0;
    for(let i=i0;i<n;i++){
      const tt = (i - i0)/SR; if(tt > dec*8) break;
      ph += TAU*f0*(1 + rise*tt/(dec*3))/SR;
      b[i] += amp*att(tt, a)*Math.exp(-tt/dec)*Math.sin(ph);
    }
  }
  // generic tone: f(tt), amp(tt), partials [ratio, amp, decay s (0: none)]
  function tone(b, t0, dur, fFn, aFn, parts){
    const i0 = len(t0), i1 = Math.min(b.length, i0 + len(dur));
    let ph = 0;
    for(let i=i0;i<i1;i++){
      const tt = (i - i0)/SR, a = aFn(tt);
      ph += TAU*fFn(tt)/SR;
      let y = Math.sin(ph);
      if(parts) for(let k=0;k<parts.length;k++){ const p = parts[k]; y += p[1]*Math.sin(p[0]*ph)*(p[2] ? Math.exp(-tt/p[2]) : 1); }
      b[i] += a*y;
    }
  }
  // band-limited saw voice into b (f(tt), amp(tt))
  function saw(b, t0, dur, fFn, aFn){
    const i0 = len(t0), i1 = Math.min(b.length, i0 + len(dur));
    let p = 0;
    for(let i=i0;i<i1;i++){
      const tt = (i - i0)/SR, dt = fFn(tt)/SR;
      p += dt; if(p >= 1) p -= 1;
      b[i] += aFn(tt)*blep(p, dt);
    }
  }
  // wet squelch: resonant band-pass noise sweeping down
  function squelch(b, r, t0, f0, f1, dur, amp, Q){
    const i0 = len(t0), m = Math.min(b.length - i0, len(dur*2.2));
    if(m <= 0) return;
    const w = noise(r, m), q = new Biq();
    for(let k=0;k<m;k++){
      const tt = k/SR;
      if((k & 15) === 0) q.set('bp', f1 + (f0 - f1)*Math.exp(-tt/(dur*0.45)), Q, SR);
      b[i0 + k] += amp*att(tt, 0.003)*Math.exp(-tt/(dur*0.4))*q.run(w[k])*Math.sqrt(Q);
    }
  }
  // a soft bell / pluck (sine + decaying partials)
  function bell(b, t0, f, dec, amp, bright, p3){
    bright = bright == null ? 1 : bright;
    tone(b, t0, dec*7, () => f, tt => amp*att(tt, 0.0025)*Math.exp(-tt/dec),
      [[2, 0.28*bright, dec*0.45], [3, 0.1*bright, dec*0.3], [p3 || 2.76, 0.06*bright, dec*0.25]]);
  }
  // pad voice (two detuned saws) through a slowly closing low-pass, added into b
  function pad(b, r, t0, dur, f, amp, a, rel, lp0, lp1, sag){
    const n = len(dur + rel), tmp = new Float32Array(n);
    const env = tt => amp*att(tt, a)*(tt > dur ? Math.max(0, 1 - (tt - dur)/rel) : 1);
    const fq = tt => f*Math.pow(2, (sag || 0)*Math.min(1, tt/(dur + rel))/12);
    saw(tmp, 0, dur + rel, tt => fq(tt)*1.004, env);
    saw(tmp, 0, dur + rel, tt => fq(tt)*0.996, env);
    filtV(tmp, 'lp', tt => lp0 + (lp1 - lp0)*Math.min(1, tt/(dur + rel)), 0.8);
    const i0 = len(t0);
    for(let k=0;k<n && i0 + k < b.length;k++) b[i0 + k] += 0.5*tmp[k];
  }
  const NOTE = m => 440*Math.pow(2, (m - 69)/12);

  // ---- recipes: (r, v) → Float32Array, peak-normalised ------------------------
  const R = {};
  // HEART -------------------------------------------------------------------
  R.s1 = (r) => {
    const b = buf(0.26);
    const split = 0.018 + 0.012*r();
    const fM = 44 + 9*r(), fT = fM*(1.1 + 0.1*r());
    thump(b, r, S1_LEAD, fM, 0.038 + 0.008*r(), 1, 0.0075, 0.32 + 0.1*r(), [[2.05, 0.5, 0.55], [3.1, 0.22, 0.35]], 0.35, 140);
    thump(b, r, S1_LEAD + split, fT, 0.031 + 0.006*r(), 0.58 + 0.12*r(), 0.006, 0.28, [[2.1, 0.5, 0.5], [3.3, 0.22, 0.35]], 0.3, 170);
    // the leaflets snapping taut: a short, quiet knock a small speaker can still reproduce
    thump(b, r, S1_LEAD + 0.003, 185 + 45*r(), 0.014, 0.55, 0.002, 0.15, [], 0, 0);
    thump(b, r, S1_LEAD + split + 0.003, 205 + 45*r(), 0.013, 0.4, 0.002, 0.15, [], 0, 0);
    filt(b, 'hp', 26, 0.7); sat(b, 1.35); filt(b, 'lp', 500, 0.6); filt(b, 'lp', 500, 0.6);
    return norm(fades(b, 0.001, 0.035), 0.9);
  };
  // v selects the A2–P2 split: 0 (expiration, ~15 ms) … 7 (inspiration, ~44 ms)
  R.s2 = (r, v) => {
    const b = buf(0.19);
    const split = 0.015 + 0.029*(v % 8)/7 + 0.003*r();
    const fA = 62 + 10*r(), fP = fA*(1.08 + 0.08*r());
    thump(b, r, 0.003, fA, 0.031 + 0.004*r(), 1, 0.0028, 0.3, [[2.25, 0.55, 0.5], [3.6, 0.25, 0.32]], 0.5, 230);
    thump(b, r, 0.003 + split, fP, 0.027 + 0.003*r(), (0.5 + 0.1*r())*(0.6 + 0.4*(v % 8)/7), 0.0025, 0.25, [[2.3, 0.55, 0.5], [3.7, 0.24, 0.32]], 0.45, 260);
    thump(b, r, 0.0045, 230 + 50*r(), 0.01, 0.45, 0.0015, 0.15, [], 0, 0);
    thump(b, r, 0.0045 + split, 250 + 50*r(), 0.009, 0.3, 0.0015, 0.15, [], 0, 0);
    filt(b, 'hp', 30, 0.7); sat(b, 1.5); filt(b, 'lp', 640, 0.6); filt(b, 'lp', 640, 0.6);
    return norm(fades(b, 0.0008, 0.03), 0.9);
  };
  // ECG monitor beep (on each beat after a loss)
  R.beep = () => {
    const b = buf(0.16);
    tone(b, 0, 0.16, () => 960, tt => att(tt, 0.006)*(tt > 0.12 ? Math.max(0, 1 - (tt - 0.12)/0.03) : 1), [[2, 0.06, 0]]);
    return norm(fades(b, 0.001, 0.01), 0.9);
  };
  // WHITE CELLS ---------------------------------------------------------------
  // selection: a soft bubble pop
  R.pop = (r) => {
    const b = buf(0.14);
    bubble(b, 0.002, 420 + 380*r(), 0.55 + 0.3*r(), 0.018 + 0.012*r(), 1);
    const m = len(0.004), w = noise(r, m, 'bp', 2000, 1.2);
    for(let k=0;k<m;k++) b[len(0.002) + k] += 0.05*att(k/SR, 0.0005)*Math.exp(-k/SR/0.0012)*w[k];
    filt(b, 'lp', 3200, 0.7);
    return norm(fades(b, 0.0005, 0.02), 0.9);
  };
  // move order: a squishy, cute blob "blorp" (v odd: the eager rising "hup!" of an attack order)
  R.blorp = (r, v) => {
    const up = v & 1, D = 0.2 + 0.04*r();
    const b = buf(D + 0.04), F = 190 + 90*r(), ov = 1.15 + 0.12*r(), vib = 11 + 6*r();
    const fq = tt => {
      let k;
      if(tt < 0.035){ const x = tt/0.035; k = 0.78 + (ov - 0.78)*(1 - (1 - x)*(1 - x)); }
      else if(tt < 0.09) k = ov + (1 - ov)*smooth(0.035, 0.09, tt);
      else k = up ? 1 + 0.28*smooth(0.1, D, tt) : 1 - 0.12*smooth(0.1, D - 0.03, tt) - 0.1*smooth(D - 0.035, D, tt);
      return F*k*(1 + 0.035*Math.sin(TAU*vib*tt)*Math.exp(-tt/0.08));
    };
    // swell into the "o", relax, close on the "p"
    const env = tt => att(tt, 0.008)*(0.7 + 0.45*Math.exp(-Math.pow((tt - 0.05)/0.035, 2)))*(1 - 0.3*smooth(0.07, D - 0.05, tt))
      *(tt > D - 0.06 ? Math.max(0, 0.5 + 0.5*Math.cos(Math.PI*(tt - D + 0.06)/0.06)) : 1);
    const src = new Float32Array(b.length);
    saw(src, 0, D, fq, env);
    // formants: "b-l-o-rp": closed → open "o" → closing
    const f1 = tt => 300 + 380*smooth(0, 0.05, tt) - 230*smooth(0.07, D, tt);
    const f2 = tt => 820 + 330*smooth(0, 0.05, tt) - 300*smooth(0.07, D, tt);
    const a1 = Float32Array.from(src), a2 = Float32Array.from(src);
    filtV(a1, 'bp', f1, 4.5); filtV(a2, 'bp', f2, 6);
    for(let i=0;i<b.length;i++) b[i] = 1.6*a1[i] + 0.9*a2[i] + 0.08*src[i];
    filt(b, 'lp', 2300, 0.7);
    const pk = peak(b);
    bubble(b, 0.004, 700 + 300*r(), 0.5, 0.012, 0.25*pk);
    bubble(b, D - 0.035, (up ? 560 : 380) + 120*r(), 0.6, 0.012, 0.3*pk);
    return norm(fades(b, 0.001, 0.02), 0.9);
  };
  // swarm micro-grain: a wet squelch
  R.squelch = (r) => {
    const b = buf(0.12);
    squelch(b, r, 0.001, 900 + 500*r(), 280 + 120*r(), 0.05 + 0.03*r(), 1, 5);
    if(r() < 0.6) bubble(b, 0.01 + 0.03*r(), 320 + 200*r(), 0.4, 0.02, 0.5*peak(b));
    filt(b, 'lp', 2400, 0.7);
    return norm(fades(b, 0.001, 0.015), 0.9);
  };
  // a red cell tumbling past: a tiny soft "plip"
  R.rbc = (r) => {
    const b = buf(0.08);
    bubble(b, 0.001, 280 + 450*r(), 0.35, 0.008 + 0.009*r(), 1, 0.0015);
    if(r() < 0.4) bubble(b, 0.012 + 0.02*r(), 380 + 380*r(), 0.3, 0.006, 0.45, 0.0015);
    filt(b, 'lp', 2400, 0.7);
    return norm(fades(b, 0.0005, 0.012), 0.9);
  };
  // reinforcements: a rising bubbly arpeggio
  R.arp = (r) => {
    const notes = [72, 74, 76, 79, 81, 84], b = buf(0.85);
    notes.forEach((m, k) => {
      const t = 0.01 + k*0.068 + 0.006*r(), f = NOTE(m);
      bubble(b, t, f*0.82, 0.5, 0.03, 0.9);
      bell(b, t + 0.012, f, 0.09, 0.3, 0.6);
    });
    filt(b, 'lp', 4200, 0.7);
    return norm(fades(b, 0.001, 0.08), 0.9);
  };
  // a white cell dying: a small sad deflate
  R.deflate = (r) => {
    const D = 0.5 + 0.12*r(), b = buf(D + 0.05), f0 = 400 + 80*r();
    const fq = tt => f0*Math.pow(0.36, Math.pow(tt/D, 0.8))*(1 + 0.02*Math.sin(TAU*6*tt));
    const env = tt => 0.8*att(tt, 0.02)*(1 - smooth(0.25*D, D, tt));
    const src = new Float32Array(b.length);
    saw(src, 0, D, fq, env);
    filtV(src, 'lp', tt => 1400 - 900*tt/D, 0.9);
    const w = noise(r, b.length, 'bp', 1100, 1.4); filt(w, 'lp', 2200, 0.7);
    for(let i=0;i<b.length;i++){ const tt = i/SR; b[i] = src[i] + 0.1*w[i]*att(tt, 0.03)*(1 - smooth(0.1, D, tt)); }
    filt(b, 'lp', 2600, 0.7);
    return norm(fades(b, 0.001, 0.05), 0.9);
  };
  // COMBAT ------------------------------------------------------------------
  // the swallow under every capture: a quick downward "glk" (kept above the heart's band)
  function gulp(b, r, t, amp){
    const k = 0.85 + 0.3*r(), dec = 0.028 + 0.012*r();
    tone(b, t + 0.005 + 0.015*r(), 0.18, tt => k*(150 + 220*Math.exp(-tt/0.018)), tt => amp*att(tt, 0.003)*Math.exp(-tt/dec));
  }
  // virus engulfed: a crisper pop (a bright bubble, sometimes a second one, a click)
  R.gulpV = (r) => {
    const b = buf(0.2);
    gulp(b, r, 0, 0.35 + 0.2*r());
    const f = 900 + 600*r(), d = 0.006 + 0.003*r();
    bubble(b, 0.002, f, 0.4 + 0.4*r(), d, 0.75 + 0.25*r());
    if(r() < 0.5) bubble(b, 0.012 + 0.013*r(), f*(1.3 + 0.3*r()), 0.6, d*(0.7 + 0.4*r()), 0.35 + 0.35*r());
    const m = len(0.005), w = noise(r, m, 'bp', 2200, 1.4);
    for(let k=0;k<m;k++) b[len(0.002) + k] += 0.2*att(k/SR, 0.0004)*Math.exp(-k/SR/0.0013)*w[k];
    filt(b, 'lp', 3800, 0.7);
    return norm(fades(b, 0.0005, 0.03), 0.9);
  };
  // bacterium engulfed: a wetter squelch
  R.gulpB = (r) => {
    const b = buf(0.26);
    gulp(b, r, 0.018, 0.5);
    squelch(b, r, 0.001, 950 + 250*r(), 260, 0.09, 0.7, 6);
    bubble(b, 0.05, 320 + 100*r(), 0.4, 0.035, 0.45);
    filt(b, 'lp', 2600, 0.7);
    return norm(fades(b, 0.0008, 0.04), 0.9);
  };
  // reward chime (pitched by the combo at playback): E5, brightness, inharmonic partial,
  // a faint octave bell and the decay vary per variant
  R.chime = (r) => {
    const b = buf(0.8), f = NOTE(76), dec = 0.17 + 0.06*r();
    bell(b, 0.001, f, dec, 1, 0.6 + 0.4*r(), 2.7 + 0.1*r());
    const a2 = 0.15*r(); if(a2 > 0.005) bell(b, 0.001, f*2.003, dec*0.6, a2, 0.5);
    // a slightly mistuned twin: a slow 1.5–4 Hz shimmer, different in every variant
    bell(b, 0.001, f*(1.0025 + 0.0035*r()), dec*(0.8 + 0.4*r()), 0.2 + 0.2*r(), 0.3);
    return norm(fades(b, 0.0005, 0.12), 0.9);
  };
  // the top of a capture streak: a grace note up to a bright E6
  R.streak = (r) => {
    const b = buf(1.0), f = NOTE(88), dec = 0.24 + 0.05*r();
    bell(b, 0.001, NOTE(84), 0.06, 0.45, 0.8);
    bell(b, 0.055, f, dec, 1, 1, 2.7 + 0.1*r());
    bell(b, 0.055, f*2.003, dec*0.5, 0.12 + 0.08*r(), 0.5);
    filt(b, 'lp', 7000, 0.7);
    return norm(fades(b, 0.0005, 0.15), 0.9);
  };
  // many captures at once: a fizz of tiny pops
  R.multi = (r) => {
    const b = buf(0.34), n = 14 + (r()*8 | 0);
    for(let k=0;k<n;k++) bubble(b, 0.002 + 0.2*r()*r(), 500 + 900*r(), 0.5, 0.005 + 0.008*r(), 0.3 + 0.7*r());
    gulp(b, r, 0.004, 0.5);
    filt(b, 'lp', 3600, 0.7);
    return norm(fades(b, 0.001, 0.05), 0.9);
  };
  // lesion destroyed: a juicy splat
  R.splat = (r) => {
    const b = buf(0.7);
    tone(b, 0.002, 0.5, tt => 38 + 60*Math.exp(-tt/0.05), tt => att(tt, 0.004)*Math.exp(-tt/0.11));
    const m = len(0.4), w = noise(r, m), q = new Biq();
    for(let k=0;k<m;k++){ const tt = k/SR; if((k & 15) === 0) q.set('lp', 220 + 2300*Math.exp(-tt/0.06), 1.1, SR); b[len(0.003) + k] += 0.55*att(tt, 0.002)*Math.exp(-tt/0.07)*q.run(w[k]); }
    for(let k=0;k<9;k++) squelch(b, r, 0.04 + 0.42*r()*r(), 500 + 700*r(), 250 + 150*r(), 0.03 + 0.03*r(), 0.2 + 0.25*r(), 7);
    sat(b, 1.3); filt(b, 'lp', 3000, 0.7); filt(b, 'hp', 30, 0.7);
    return norm(fades(b, 0.0008, 0.1), 0.9);
  };
  // … and a short triumphant arpeggio + chord
  // (v: root position or first inversion, the chord topped by C6 or E6)
  R.triumph = (r, v) => {
    const b = buf(1.35), st = 0.06 + 0.02*r();
    const arp = (v & 1) ? [64, 67, 72, 76] : [67, 72, 76, 79], top = (v % 3) === 1 ? [76, 79, 84, 88] : [72, 76, 79, 84];
    arp.forEach((m, k) => bell(b, 0.002 + k*st, NOTE(m), 0.16, 0.7, 0.9));
    top.forEach(m => bell(b, 0.02 + 4*st, NOTE(m)*(1 + 0.001*(r() - 0.5)), 0.32, 0.35, 0.7));
    filt(b, 'lp', 5000, 0.7);
    return norm(fades(b, 0.001, 0.25), 0.9);
  };
  // new infection site: an ominous low alarm pulse (v: 1 = wave start, three pulses and deeper)
  R.alarm = (r, v) => {
    const np = v ? 3 : 2, gap = 0.36, b = buf(np*gap + 0.45);
    for(let k=0;k<np;k++){
      const t = 0.005 + k*gap, base = v ? 55 : 69.3, dip = k === np - 1 ? 0.93 : 0.97;
      const env = tt => att(tt, 0.035)*Math.exp(-tt/0.12);
      saw(b, t, 0.4, tt => base*(1 - (1 - dip)*Math.min(1, tt/0.3)), env);
      saw(b, t, 0.4, tt => base*1.059*(1 - (1 - dip)*Math.min(1, tt/0.3)), tt => 0.8*env(tt));
      saw(b, t, 0.4, tt => 2*base*(1 - (1 - dip)*Math.min(1, tt/0.3)), tt => 0.4*env(tt));      // an octave up (small speakers)
      tone(b, t, 0.45, tt => base*(1 - (1 - dip)*Math.min(1, tt/0.3)), tt => 1.1*att(tt, 0.04)*Math.exp(-tt/0.16));
    }
    filt(b, 'lp', 700, 0.9); filt(b, 'hp', 32, 0.7);
    return norm(fades(b, 0.002, 0.1), 0.9);
  };
  // a pathogen escaped into the veins: a sour, detuned buzz
  R.escape = (r) => {
    const D = 0.42, b = buf(D + 0.1), f = 146.8*Math.pow(2, (r() - 0.5)*2/12);
    const trem = 9 + 4*r(), det = 1.05 + 0.02*r(), fifth = 1.49 + 0.02*r(), lpEnd = 600 + 200*r();
    const env = tt => att(tt, 0.015)*(1 - smooth(D - 0.14, D, tt))*(1 + 0.18*Math.sin(TAU*trem*tt));
    const fq = k => tt => f*k*Math.pow(2, -3*Math.min(1, tt/D)/12);
    saw(b, 0, D, fq(1), env); saw(b, 0, D, fq(det), env); saw(b, 0, D, fq(fifth), tt => 0.4*env(tt));
    filtV(b, 'lp', tt => 1500 - (1500 - lpEnd)*Math.min(1, tt/D), 0.9);
    return norm(fades(b, 0.001, 0.05), 0.9);
  };
  // stingers
  R.win = (r) => {
    const b = buf(2.6);
    [60, 64, 67, 72].forEach(m => pad(b, r, 0.25, 1.4, NOTE(m), 0.35, 0.3, 0.8, 900, 2200, 0));
    [72, 76, 79, 84, 88].forEach((m, k) => bell(b, 0.002 + k*0.085, NOTE(m), 0.22, 0.8, 0.8));
    filt(b, 'lp', 5200, 0.7);
    return norm(fades(b, 0.001, 0.4), 0.9);
  };
  R.lose = (r) => {
    const b = buf(3.2);
    tone(b, 0.002, 1.2, tt => 40 + 40*Math.exp(-tt/0.12), tt => att(tt, 0.006)*Math.exp(-tt/0.35));
    [57, 60, 63, 45].forEach(m => pad(b, r, 0.04, 1.9, NOTE(m), 0.4, 0.12, 1.0, 1100, 300, -5));
    [[0.02, 64], [0.3, 60], [0.62, 57]].forEach(([t, m]) => bell(b, t, NOTE(m), 0.26, 0.5, 0.5));
    filt(b, 'hp', 30, 0.7); filt(b, 'lp', 3500, 0.7);
    return norm(fades(b, 0.001, 0.5), 0.9);
  };
  // UI ----------------------------------------------------------------------
  R.click = (r) => {
    const b = buf(0.05);
    tone(b, 0, 0.05, () => 1500 + 300*r(), tt => 0.5*att(tt, 0.0007)*Math.exp(-tt/0.0035));
    tone(b, 0, 0.05, () => 230 + 40*r(), tt => 0.8*att(tt, 0.001)*Math.exp(-tt/0.009));
    return norm(fades(b, 0.0002, 0.01), 0.9);
  };
  function sweep(b, r, f0, f1, D, up){
    const m = len(D), w = noise(r, m), q = new Biq();
    for(let k=0;k<m;k++){ const tt = k/SR; if((k & 15) === 0) q.set('bp', f0*Math.pow(f1/f0, tt/D), 2, SR); b[k] += 0.5*Math.sin(Math.PI*Math.pow(tt/D, up ? 0.6 : 1.4))*q.run(w[k]); }
    tone(b, 0, D, tt => (up ? 420 : 640)*Math.pow(up ? 1.5 : 1/1.5, tt/D), tt => 0.25*Math.sin(Math.PI*tt/D));
  }
  R.open = (r) => { const b = buf(0.22); sweep(b, r, 300, 1300, 0.2, true); filt(b, 'lp', 3000, 0.7); return norm(fades(b, 0.002, 0.02), 0.9); };
  R.close = (r) => { const b = buf(0.22); sweep(b, r, 1300, 300, 0.2, false); filt(b, 'lp', 3000, 0.7); return norm(fades(b, 0.002, 0.02), 0.9); };
  R.nope = () => {
    const b = buf(0.26);
    [[0, 330], [0.1, 262]].forEach(([t, f]) => tone(b, t, 0.12, () => f, tt => att(tt, 0.004)*Math.exp(-tt/0.04), [[3, 0.12, 0]]));
    filt(b, 'lp', 1800, 0.7);
    return norm(fades(b, 0.001, 0.03), 0.9);
  };
  R.toggle = () => {
    const b = buf(0.24);
    [[0, 523.25], [0.08, 783.99]].forEach(([t, f]) => bell(b, t, f, 0.05, 0.8, 0.5));
    return norm(fades(b, 0.001, 0.04), 0.9);
  };
  return R;
}

// the one-shot table: recipe, variants, level (dB), bus, concurrent cap, rate
// (per s, burst), priority (higher steals lower)
const SND = {
  s1:      { vars: 8,  db: -7,    bus: 'heart', max: 3, prio: 10 },
  s2:      { vars: 16, db: -10.8, bus: 'heart', max: 3, prio: 10 },
  beep:    { vars: 1,  db: -19, bus: 'dry', max: 2, prio: 9 },
  pop:     { vars: 8,  db: -10, bus: 'phys', max: 6, rate: [14, 6], prio: 5 },
  blorp:   { vars: 12, db: -7.5, bus: 'phys', max: 6, rate: [10, 5], prio: 6 },
  squelch: { vars: 10, db: -17, bus: 'phys', max: 6, rate: [20, 6], prio: 1 },
  rbc:     { vars: 12, db: -13, bus: 'amb', max: 6, rate: [24, 6], prio: 0 },
  arp:     { vars: 3,  db: -13, bus: 'dry', max: 2, rate: [0.6, 1], prio: 6 },
  deflate: { vars: 6,  db: -16.5, bus: 'phys', max: 3, rate: [3, 2], prio: 4 },
  gulpV:   { vars: 8,  db: -4.5, bus: 'phys', max: 6, rate: [10, 4], prio: 6 },
  gulpB:   { vars: 8,  db: -6.5, bus: 'phys', max: 6, rate: [10, 4], prio: 6 },
  chime:   { vars: 4,  db: -17.5, bus: 'dry', max: 4, rate: [8, 3], prio: 5 },
  streak:  { vars: 2,  db: -16,   bus: 'dry', max: 2, rate: [1, 1], prio: 6 },
  multi:   { vars: 6,  db: -8, bus: 'phys', max: 3, rate: [6, 2], prio: 6 },
  splat:   { vars: 4,  db: -5,  bus: 'phys', max: 3, rate: [3, 2], prio: 8 },
  triumph: { vars: 3,  db: -11, bus: 'dry', max: 2, rate: [1.5, 1], prio: 8 },
  alarm:   { vars: 2,  db: -7.5,  bus: 'dry', max: 2, rate: [1.2, 1], prio: 8 },
  escape:  { vars: 3,  db: -12, bus: 'dry', max: 2, rate: [1, 1], prio: 7 },
  win:     { vars: 1,  db: -6.5,  bus: 'dry', max: 1, prio: 11 },
  lose:    { vars: 1,  db: -5,  bus: 'dry', max: 1, prio: 11 },
  click:   { vars: 3,  db: -17.5, bus: 'ui', max: 3, rate: [16, 4], prio: 3 },
  open:    { vars: 2,  db: -21, bus: 'ui', max: 2, rate: [6, 2], prio: 3 },
  close:   { vars: 2,  db: -21, bus: 'ui', max: 2, rate: [6, 2], prio: 3 },
  nope:    { vars: 1,  db: -16.5, bus: 'ui', max: 2, rate: [4, 2], prio: 3 },
  toggle:  { vars: 1,  db: -15, bus: 'ui', max: 1, prio: 3 },
};
const NAMES = Object.keys(SND);
const MAX_VOICES = 32, NODE_BUDGET = 260;          // one-shot voices; nodes created per second (soft)
const HARM_DRIVE = 12, HARM_DB = -6.2;              // heart's harmonic path: tanh drive, level (+~1 dB full range)
const ROOM_K = 0.3;                                 // "muffled room" band (150–300 Hz) under the body rumble (~7 dB below it)
const PANS = [-0.8, -0.5, -0.22, 0, 0.22, 0.5, 0.8];

// ============================================================================
BV.createAudio = function(opts){
  opts = opts || {};
  const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
  const A = {};
  let ctx = null, G = null, R = null, SR = 48000;
  let enabled = opts.enabled !== false, hidden = false;
  let volume = clamp(opts.volume != null && isFinite(+opts.volume) ? +opts.volume : 0.8, 0, 1);
  const seed = (opts.seed | 0) || 1;
  const rnd = mulberry(seed*9301 + 49297);
  let LOG = Array.isArray(opts.log) ? opts.log : null;     // tests: every voice started {name, when, v, gain, rate, pan}
  const now = () => opts.clock ? opts.clock() : ctx ? ctx.currentTime : 0;
  const pnow = () => typeof performance !== 'undefined' ? performance.now() : Date.now();
  const isOffline = () => typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext;
  const bank = {};                  // name → [AudioBuffer | undefined]
  let buildQ = null;                // pending [name, v]
  const jobs = [];                  // chunked setup (reverb impulse, noise loops): fn(samples) → done
  const voices = [];
  const bucket = {};                // rate limiters
  const st0 = { frames:0, nodes:0, dropped:0, merged:0, stolen:0, beats:0, late:0, skipped:0, peakVoices:0, built:0, bufferSamples:0, errors:0, beds:false, gated:0 };
  const nodeWin = new Float64Array(20); let nodeWinT = 0;     // node creations, 50 ms bins over 1 s
  let resumeReq = -1e9;             // performance.now() of the last resume request
  A.available = !!(opts.context || AC);

  // ---- context + graph ---------------------------------------------------------------
  // A gesture only creates / resumes the context (cheap). The graph is built on the next
  // A.update; the reverb impulse and the two noise loops are generated in chunks in idle
  // time and the beds fade in when they are ready. A context passed in (tests) is set up
  // at once, synchronously.
  function start(c, sync){
    ctx = c; SR = ctx.sampleRate || 48000;
    R = makeRecipes(SR);
    // build order: the heart first, then what the first seconds need
    buildQ = [];
    for(let v=0; v<SND.s1.vars; v++) buildQ.push(['s1', v]);
    for(let v=0; v<SND.s2.vars; v++) buildQ.push(['s2', v]);
    for(const n of ['click', 'pop', 'blorp', 'gulpV', 'gulpB', 'chime', 'rbc', 'squelch', 'open', 'close', 'toggle', 'nope', 'multi', 'streak', 'alarm', 'arp', 'escape', 'deflate', 'splat', 'triumph', 'beep', 'win', 'lose'])
      for(let v=0; v<SND[n].vars; v++) buildQ.push([n, v]);
    if(sync){ build(); while(jobs.length) if(jobs[0](1e9)) jobs.shift(); }
  }
  const node = (n) => { countNodes(n || 1); };
  function mk(kind, p){
    let n;
    switch(kind){
      case 'gain': n = ctx.createGain(); if(p != null) n.gain.value = p; break;
      case 'filter': n = ctx.createBiquadFilter(); n.type = p[0]; n.frequency.value = p[1]; if(p[2] != null) n.Q.value = p[2]; break;
      case 'pan': n = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if(n.pan) n.pan.value = p || 0; break;
    }
    node();
    return n;
  }
  // a looping noise buffer (pink or brown, stereo; the tail cross-faded into the head),
  // generated `lim` samples per call
  function noiseJob(kind, sec, sd, done){
    const n = Math.round(sec*SR), m = Math.round(0.25*SR), b = ctx.createBuffer(2, n, SR), x = new Float32Array(n + m);
    let c = 0, i = 0, r = mulberry(sd), b0 = 0, b1 = 0, b2 = 0, br = 0;
    return lim => {
      const e = Math.min(n + m, i + lim);
      if(kind === 'pink') for(; i<e; i++){ const w = r()*2 - 1; b0 = 0.99765*b0 + w*0.099046; b1 = 0.963*b1 + w*0.2965164; b2 = 0.57*b2 + w*1.0526913; x[i] = (b0 + b1 + b2 + w*0.1848)*0.2; }
      else for(; i<e; i++){ const w = r()*2 - 1; br = (br + 0.02*w)/1.02; x[i] = br*3.5; }
      if(i < n + m) return false;
      const d = b.getChannelData(c);
      d.set(x.subarray(0, n));
      for(let k=0;k<m;k++){ const f = k/m; d[k] = x[k]*Math.sin(0.5*Math.PI*f) + x[n + k]*Math.cos(0.5*Math.PI*f); }
      if(++c >= 2){ done(b); return true; }
      i = 0; r = mulberry(sd + 101*c); b0 = b1 = b2 = br = 0;
      return false;
    };
  }
  // the reverb impulse: darkening decaying noise + early reflections off the chest wall
  function impulseJob(sec, done){
    const n = Math.round(sec*SR), b = ctx.createBuffer(2, n, SR);
    let c = 0, i = 0, r = mulberry(seed*7 + 77), lp = 0, d = b.getChannelData(0);
    return lim => {
      const e = Math.min(n, i + lim);
      for(; i<e; i++){
        const t = i/SR, fc = 320 + 2400*Math.exp(-t/0.12), a = 1 - Math.exp(-TAU*fc/SR);
        lp += a*((r()*2 - 1) - lp);
        d[i] = lp*Math.exp(-t/0.1)*(t < 0.004 ? t/0.004 : 1)*(i > n - 64 ? (n - i)/64 : 1);
      }
      if(i < n) return false;
      for(const [ms, g] of [[7 + 2*c, 0.5], [13 - c, -0.35], [21 + 3*c, 0.25], [31, -0.15]]){ const k = Math.round(ms*SR/1000); if(k < n) d[k] += g; }
      if(++c >= 2){ done(b); return true; }
      i = 0; lp = 0; r = mulberry(seed*7 + 77 + c); d = b.getChannelData(c);
      return false;
    };
  }
  function startLoop(b, hub){
    const s = ctx.createBufferSource(); node(); s.buffer = b; s.loop = true; s.connect(hub);
    const T = now(); s.start(T);
    hub.gain.cancelScheduledValues(T); hub.gain.setValueAtTime(0, T); hub.gain.setTargetAtTime(1, T, 0.15);
    return s;
  }
  function build(){
    const T = now();
    G = {};
    // output: master (volume) → compressor (catches storms and stingers only) → soft clipper (≤ −1 dBFS)
    G.master = mk('gain', 0);
    G.comp = ctx.createDynamicsCompressor(); node();
    G.comp.threshold.value = -10; G.comp.knee.value = 10; G.comp.ratio.value = 2; G.comp.attack.value = 0.004; G.comp.release.value = 0.2;
    G.clip = ctx.createWaveShaper(); node();
    { const N = 4096, cv = new Float32Array(N), L = dB(-1), K = 0.72*L;
      for(let i=0;i<N;i++){ const x = i/(N - 1)*2 - 1, a = Math.abs(x); let y = a <= K ? a : K + (L - K)*Math.tanh((a - K)/(L - K)); cv[i] = Math.sign(x)*Math.min(y, L); }
      G.clip.curve = cv; G.clip.oversample = 'none'; }
    G.master.connect(G.comp); G.comp.connect(G.clip); G.clip.connect(ctx.destination);
    G.world = mk('gain', 1); G.world.connect(G.master);
    // reverb: a dark, short body space (the impulse arrives from a job)
    G.rev = ctx.createConvolver(); node();
    G.revG = mk('gain', dB(-6)); G.rev.connect(G.revG); G.revG.connect(G.world);
    // heart: bus → body low-pass → level → duck (a capture or an order pushes it back for a
    // moment) → pan → world, and a parallel harmonic path (band-pass → tanh → high-pass: the
    // thump's overtones, so laptop and phone speakers still carry the beat)
    G.heart = mk('gain', 1);
    G.heartLP = mk('filter', ['lowpass', 650, 0.5]);
    G.heartG = mk('gain', 1);
    G.duck = mk('gain', 1);
    G.heartPan = mk('pan', -0.12);                   // the heart sits a little left
    G.heart.connect(G.heartLP); G.heartLP.connect(G.heartG); G.heartG.connect(G.duck); G.duck.connect(G.heartPan); G.heartPan.connect(G.world);
    G.heartSend = mk('gain', dB(-9)); G.duck.connect(G.heartSend); G.heartSend.connect(G.rev);
    G.hBP = mk('filter', ['bandpass', 90, 0.7]);
    G.hSh = ctx.createWaveShaper(); node();
    { const N = 2048, cv = new Float32Array(N), d = HARM_DRIVE, k = 1/Math.tanh(d);
      for(let i=0;i<N;i++){ const x = i/(N - 1)*2 - 1; cv[i] = Math.tanh(d*x)*k; }
      G.hSh.curve = cv; G.hSh.oversample = '2x'; }
    G.hHP1 = mk('filter', ['highpass', 380, 0.7]); G.hHP2 = mk('filter', ['highpass', 380, 0.7]);
    G.hLP = mk('filter', ['lowpass', 1400, 0.7]);
    G.hG = mk('gain', dB(HARM_DB));
    G.duck.connect(G.hBP); G.hBP.connect(G.hSh); G.hSh.connect(G.hHP1); G.hHP1.connect(G.hHP2); G.hHP2.connect(G.hLP); G.hLP.connect(G.hG); G.hG.connect(G.heartPan);
    // one-shot groups with pan buses
    const group = (name, dest, send) => {
      const g = { in: mk('gain', 1), pans: [] };
      for(const p of PANS){ const pn = mk('pan', p); pn.connect(g.in); g.pans.push(pn); }
      g.in.connect(dest);
      if(send != null){ g.send = mk('gain', dB(send)); g.in.connect(g.send); g.send.connect(G.rev); }
      G[name] = g;
    };
    G.physLP = mk('filter', ['lowpass', 12000, 0.5]);
    G.physLP.connect(G.world);
    group('phys', G.physLP, -14);
    group('dry', G.world, -18);
    group('amb', G.world, null);
    G.ui = { in: mk('gain', 1) }; G.ui.in.connect(G.master); G.ui.pans = null;
    // noise hubs: the looping sources connect here (fading in) once their buffers are ready
    G.pinkIn = mk('gain', 0); G.brownIn = mk('gain', 0);
    // body rumble (outside the vessels) + a quiet 150–300 Hz "muffled room" band small speakers reproduce
    G.rumHP = mk('filter', ['highpass', 24, 0.6]);
    G.rumLP = mk('filter', ['lowpass', 95, 0.6]);
    G.rumLP2 = mk('filter', ['lowpass', 95, 0.6]);
    G.rumG = mk('gain', 0);
    G.brownIn.connect(G.rumHP); G.rumHP.connect(G.rumLP); G.rumLP.connect(G.rumLP2); G.rumLP2.connect(G.rumG); G.rumG.connect(G.world);
    G.roomHP = mk('filter', ['highpass', 150, 0.7]);
    G.roomLP = mk('filter', ['lowpass', 300, 0.7]);
    G.roomK = mk('gain', ROOM_K);
    G.brownIn.connect(G.roomHP); G.roomHP.connect(G.roomLP); G.roomLP.connect(G.roomK); G.roomK.connect(G.rumG);
    // flow (inside a lumen): base level / cutoff per frame, surge (gain + detune) per beat
    G.flowHP = mk('filter', ['highpass', 80, 0.6]);
    G.flowLP = mk('filter', ['lowpass', 700, 0.75]);
    G.flowPk = mk('filter', ['peaking', 380, 0.9]); G.flowPk.gain.value = 4;
    G.flowG = mk('gain', 0);
    G.flowSurge = mk('gain', 1);
    G.flowPan = mk('pan', 0);
    G.pinkIn.connect(G.flowHP); G.flowHP.connect(G.flowLP); G.flowLP.connect(G.flowPk); G.flowPk.connect(G.flowG);
    G.flowG.connect(G.flowSurge); G.flowSurge.connect(G.flowPan); G.flowPan.connect(G.world);
    // systolic whoosh (heart bus, per-beat envelope)
    G.whBP = mk('filter', ['bandpass', 170, 0.9]);
    G.whG = mk('gain', 0);
    G.pinkIn.connect(G.whBP); G.whBP.connect(G.whG); G.whG.connect(G.heart);
    // swarm murmur bed: a narrow band whose centre keeps wandering (a wet, shifting texture)
    G.murBP = mk('filter', ['bandpass', 600, 2.5]);
    G.murLP = mk('filter', ['lowpass', 2500, 0.7]);
    G.murG = mk('gain', 0);
    G.murPan = mk('pan', 0);
    G.pinkIn.connect(G.murBP); G.murBP.connect(G.murLP); G.murLP.connect(G.murG); G.murG.connect(G.murPan); G.murPan.connect(G.physLP);
    // zoom whoosh (band-pass + low-pass: no hiss above a few kHz)
    G.zBP = mk('filter', ['bandpass', 300, 2.2]);
    G.zLP = mk('filter', ['lowpass', 3000, 0.6]);
    G.zG = mk('gain', 0);
    G.pinkIn.connect(G.zBP); G.zBP.connect(G.zLP); G.zLP.connect(G.zG); G.zG.connect(G.world);
    G.drone = null; G.flat = null;
    applyMaster(0);
    // setup jobs: the reverb first (the heart uses it), then the flow noise, then the rumble
    jobs.push(impulseJob(0.9, b => { G.rev.buffer = b; }));
    jobs.push(noiseJob('pink', 4, seed*3 + 1, b => { G.pink = startLoop(b, G.pinkIn); }));
    jobs.push(noiseJob('brown', 4, seed*5 + 2, b => { G.brown = startLoop(b, G.brownIn); st0.beds = true; }));
  }
  function droneBuild(){
    const T = now(), d = { oscs: [] };
    d.lp = mk('filter', ['lowpass', 220, 0.9]);
    d.g = mk('gain', 0);
    d.trem = mk('gain', 1);
    d.lp.connect(d.trem); d.trem.connect(d.g); d.g.connect(G.world);
    for(const [f, k] of [[55, 1], [58.27, 0.8], [82.41, 0.55]]){
      const o = ctx.createOscillator(); node(); o.type = 'sawtooth'; o.frequency.value = f;
      const og = mk('gain', k); o.connect(og); og.connect(d.lp); o.start(T); d.oscs.push(o);
    }
    // a quiet mid voice: the same minor-second rub two octaves up (small speakers hear it)
    d.mBP = mk('filter', ['bandpass', 300, 1]);
    d.mg = mk('gain', 0);
    d.mBP.connect(d.mg); d.mg.connect(G.world);
    for(const f of [220, 233.08]){ const o = ctx.createOscillator(); node(); o.type = 'triangle'; o.frequency.value = f; o.connect(d.mBP); o.start(T); d.oscs.push(o); }
    d.lfo = ctx.createOscillator(); node(); d.lfo.frequency.value = 0.35;
    d.lfoG = mk('gain', 0.3); d.lfo.connect(d.lfoG); d.lfoG.connect(d.trem.gain); d.lfo.start(T);
    G.drone = d;
  }
  function flatBuild(){
    const T = now(), f = {};
    f.o = ctx.createOscillator(); node(); f.o.type = 'sine'; f.o.frequency.value = 960;
    f.g = mk('gain', 0);
    f.o.connect(f.g); f.g.connect(G.world); f.o.start(T);
    G.flat = f;
  }
  // master level: volume² (perceptual), muted / hidden = 0; tau 0 = at once
  function applyMaster(tau){
    if(!G) return;
    const v = enabled && !hidden ? volume*volume : 0, T = now(), p = G.master.gain;
    p.cancelScheduledValues(T);
    if(!tau) p.setValueAtTime(v, T); else p.setTargetAtTime(v, T, tau);
  }
  function resume(){
    if(!ctx || isOffline() || !ctx.resume || ctx.state === 'running' || ctx.state === 'closed') return;
    resumeReq = pnow();
    const p = ctx.resume(); if(p && p.catch) p.catch(() => {});
  }
  function suspendLater(ms, still){
    setTimeout(() => { if(still() && ctx && ctx.state === 'running' && ctx.suspend){ const p = ctx.suspend(); if(p && p.catch) p.catch(() => {}); } }, ms);
  }

  // ---- buffers ---------------------------------------------------------------------------
  function getBuf(name, v){
    let b = bank[name]; if(!b) b = bank[name] = [];
    if(b[v]) return b[v];
    const r = mulberry(hashStr(name)*31 + v*7919 + seed);
    const data = R[name](r, v);
    const ab = ctx.createBuffer(1, data.length, SR);
    if(ab.copyToChannel) ab.copyToChannel(data, 0); else ab.getChannelData(0).set(data);
    b[v] = ab; st0.built++; st0.bufferSamples += data.length;
    return ab;
  }
  // idle-time work: setup jobs first, then the one-shot buffers
  function warm(ms){
    const t0 = pnow();
    while(jobs.length && pnow() - t0 < ms) if(jobs[0](12000)) jobs.shift();
    while(buildQ && buildQ.length && pnow() - t0 < ms){ const [n, v] = buildQ.shift(); getBuf(n, v); }
  }

  // ---- voices -----------------------------------------------------------------------------
  function roll(){
    const bin = Math.floor(now()*20);
    if(bin > nodeWinT){ if(bin - nodeWinT >= 20) nodeWin.fill(0); else for(let b=nodeWinT + 1; b<=bin; b++) nodeWin[b % 20] = 0; }
    if(bin !== nodeWinT) nodeWinT = bin;
    return bin;
  }
  function countNodes(n){ const bin = roll(); nodeWin[((bin % 20) + 20) % 20] += n; st0.nodes += n; }
  function nodesPerSec(){ roll(); let s = 0; for(let i=0;i<20;i++) s += nodeWin[i]; return s; }
  function allow(name){
    const S = SND[name]; if(!S.rate) return true;
    const t = now(); let b = bucket[name];
    if(!b) b = bucket[name] = { tok: S.rate[1], t };
    b.tok = Math.min(S.rate[1], b.tok + (t - b.t)*S.rate[0]); b.t = t;
    if(b.tok < 1) return false;
    b.tok -= 1; return true;
  }
  // may a sound start now? Not while muted or hidden, nor on a suspended context (a voice
  // scheduled on its frozen clock would wait and play, with everything else queued, on
  // resume) — except just after a resume request (the toggle sound, the very first click)
  function live(){
    if(!ctx || !enabled || hidden) return false;
    if(opts.clock || isOffline() || ctx.state === 'running') return true;
    return pnow() - resumeReq < 500;
  }
  function reap(t){
    for(let i=voices.length - 1;i>=0;i--) if(voices[i].end < t - 0.05) voices.splice(i, 1);
  }
  function steal(v, t){
    if(!v || v.dead) return;
    v.dead = true; st0.stolen++;
    try { v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0, t, 0.008); v.src.stop(Math.max(t, v.t0) + 0.06); } catch(e){}
    v.end = Math.max(t, v.t0) + 0.06;
  }
  // o: {when, gain (linear), pan (-1..1), rate, v (variant), force, bus (override)}
  function play(name, o){
    if(!G) return null;
    if(!live()){ st0.gated++; return null; }
    const S = SND[name]; o = o || {};
    const t = now(), when = Math.max(t, o.when || t);
    reap(t);
    // per-sound and global caps: steal the oldest of the same sound, else the lowest priority
    let same = 0, oldest = null;
    for(const v of voices) if(v.name === name && !v.dead && v.end > when){ same++; if(!oldest || v.t0 < oldest.t0) oldest = v; }
    if(same >= S.max){ if(S.prio >= 5 && oldest) steal(oldest, t); else { st0.dropped++; return null; } }
    let live_ = 0, low = null;
    for(const v of voices) if(!v.dead && v.end > t){ live_++; if(!low || v.prio < low.prio || (v.prio === low.prio && v.t0 < low.t0)) low = v; }
    if(live_ >= MAX_VOICES){ if(low && low.prio < S.prio) steal(low, t); else { st0.dropped++; return null; } }
    if(!o.force && S.prio < 5 && nodesPerSec() > NODE_BUDGET){ st0.dropped++; return null; }
    const vv = o.v != null ? o.v % S.vars : (rnd()*S.vars) | 0;
    const b = getBuf(name, vv);
    const src = ctx.createBufferSource(), g = ctx.createGain(); countNodes(2);
    src.buffer = b;
    const rate = o.rate || 1; if(rate !== 1) src.playbackRate.value = rate;
    g.gain.value = dB(S.db)*(o.gain == null ? 1 : o.gain);
    src.connect(g);
    const bus = o.bus || S.bus, grp = G[bus];
    if(bus === 'heart') g.connect(G.heart);
    else if(grp.pans){ const p = clamp(o.pan || 0, -1, 1); let k = 0, bd = 9; for(let i=0;i<PANS.length;i++){ const d = Math.abs(PANS[i] - p); if(d < bd){ bd = d; k = i; } } g.connect(grp.pans[k]); }
    else g.connect(grp.in);
    const v = { name, src, g, t0: when, end: when + b.duration/rate, prio: S.prio, dead: false };
    src.onended = () => { try { src.disconnect(); g.disconnect(); } catch(e){} v.end = -1; };
    src.start(when);
    voices.push(v);
    if(LOG && LOG.length < 20000) LOG.push({ name, when, v: vv, gain: g.gain.value, rate, pan: o.pan || 0, bus });
    if(voices.length > st0.peakVoices) st0.peakVoices = voices.length;
    return v;
  }
  // event position → {g, pan}: pan by screen x, fade with the distance from the view
  const view = { w: 1280, h: 720, zn: 0.5 };
  function spatial(e){
    if(!e || e.sx == null || !isFinite(e.sx) || !isFinite(e.sy)) return { g: 1, pan: 0 };
    const w = view.w, h = view.h;
    const dx = Math.max(0, -e.sx, e.sx - w)/w, dy = Math.max(0, -e.sy, e.sy - h)/h, d = Math.hypot(dx, dy);
    const g = d > 1.3 ? 0 : Math.exp(-3.2*d);
    return { g, pan: clamp((e.sx/w)*2 - 1, -1, 1)*0.85 };
  }
  // low zoom: physical sounds come from far away (quieter, and physLP muffles them)
  const zoomGain = () => 0.45 + 0.55*smooth(0.05, 0.6, view.zn);
  // is a heart sound (S1 / S2) sounding in [t0, t1]?
  function heartAt(t0, t1){
    for(const b of H.pend) for(const v of [b.v1, b.v2]) if(v && !v.dead && v.t0 < t1 && v.t0 + 0.13 > t0) return true;
    return false;
  }
  // the heart steps back for a moment under a reward or an order (τ 12 ms down, back after
  // 250 ms): deeper when a lub or dub would land on it, barely otherwise
  function duck(t, depth){
    if(!G) return;
    const p = G.duck.gain;
    try { p.cancelScheduledValues(t); p.setTargetAtTime(depth, t, 0.012); p.setTargetAtTime(1, t + 0.25, 0.15); } catch(e){}
  }
  // stop a param's automation where it is now and let it settle to v
  function holdParam(p, t, v, tau){
    try {
      if(p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t);
      else { const x = p.value; p.cancelScheduledValues(t); p.setValueAtTime(x, t); }
      p.setTargetAtTime(v, t, tau);
    } catch(e){}
  }

  // ---- heart ------------------------------------------------------------------------------
  const H = { next1: null, lastPhi: -1, lastBeat: -1, rate: 1, gameT: null, audT: 0, lastT: null, flat: false, bpm: 0, gap: 1/60,
              surge: 0, cents: 0, delay: 0, held: false, pend: [], surges: [] };
  const resp = t => Math.sin(TAU*t/4.3);            // breathing, when the sim gives none
  function heartBeat(t1, bpm, rate, over, inside, rs, n){
    // t1: time of S1 (the valve closure) on the audio clock. P: the beat period in real time
    // (the game can run slower than real time on slow frames); Ps: the systolic time scale
    // (the rate-aware pulse keeps its systolic timing at every rate). Per-beat variation.
    const rt = rate || 1, tach = clamp((bpm - 64)/51, 0, 1), P = 60/Math.max(20, bpm)/rt, Ps = 60/HREF/rt;
    if(rs == null || !isFinite(rs)) rs = resp(t1);
    const lvl = (1 - 0.07*Math.max(0, rs))*dB(1.5*tach)*dB((rnd() - 0.5)*2.4);
    const j1 = (rnd() - 0.5)*0.008, j2 = (rnd() - 0.5)*0.006;
    const pitch = 1 + 0.035*tach + (rnd() - 0.5)*0.03;
    // S1 (a fever accentuates it), S2 after the physiological S1–S2 interval (systole
    // shortens far less than diastole), its split widening on inspiration
    const v1 = play('s1', { when: t1 - S1_LEAD + j1, gain: lvl*dB(0.6*tach), rate: pitch, force: true });
    const t2 = t1 + Math.min(0.9, s2Delay(bpm)/rt);
    const split = Math.round(clamp(0.5 + 0.5*rs, 0, 1)*7);
    const v2 = play('s2', { when: t2 + j2, gain: lvl*dB((rnd() - 0.5)*2), rate: pitch*(1 + (rnd() - 0.5)*0.02), v: split + 8*(rnd() < 0.5 ? 1 : 0), force: true });
    // systolic whoosh: crescendo–decrescendo between S1 and S2
    const wg = G.whG.gain, w = 0.05*(1 + 1.2*tach)*(1 - 0.4*inside);
    wg.setValueAtTime(0, t1 + 0.02); wg.linearRampToValueAtTime(w, t1 + 0.02 + 0.45*(t2 - t1 - 0.02)); wg.linearRampToValueAtTime(0, t2 - 0.004);
    // the flow surges with the pulse (the sim's pulsatile flow: systolic peak, dicrotic wave),
    // half-way between the sim's red cells (no delay) and the vessel wall's pulse wave (it
    // reaches this vessel H.delay game-s after the heart); the audible whoosh is a little
    // wider than the sim's systolic spike
    const A_ = H.surge, C = H.cents, gs = G.flowSurge.gain, dt = G.flowLP.detune;
    const ts = t1 + 0.5*H.delay/rt, tp = ts + 0.08*Ps, tr = ts + 0.22*Ps, td = ts + 0.34*Ps, te = ts + Math.max(0.36*Ps, Math.min(0.6*Ps, 0.95*P - 0.01));
    gs.setValueAtTime(1, ts); gs.linearRampToValueAtTime(1 + A_, tp); gs.linearRampToValueAtTime(1 + 0.35*A_, tr); gs.linearRampToValueAtTime(1 + 0.4*A_, td); gs.linearRampToValueAtTime(1, te);
    dt.setValueAtTime(0, ts); dt.linearRampToValueAtTime(C, tp); dt.linearRampToValueAtTime(0.35*C, tr); dt.linearRampToValueAtTime(0.4*C, td); dt.linearRampToValueAtTime(0, te);
    H.surges.push(ts, tp, tr, td, te); if(H.surges.length > 20) H.surges.splice(0, 5);
    const vb = over ? play('beep', { when: t1 + 0.02, force: true }) : null;
    H.pend.push({ n, v1, v2, vb, t1 }); if(H.pend.length > 6) H.pend.shift();
    st0.beats++;
  }
  // the scheduled surge shape at time T, 0..1 (the red-cell grains bunch on it)
  function surgeAt(T){
    const s = H.surges;
    for(let i=s.length - 5;i>=0;i-=5){
      const ts = s[i], tp = s[i+1], tr = s[i+2], td = s[i+3], te = s[i+4];
      if(T < ts) continue;
      if(T >= te) return 0;
      if(T < tp) return (T - ts)/(tp - ts);
      if(T < tr) return 1 - 0.65*(T - tp)/(tr - tp);
      if(T < td) return 0.35 + 0.05*(T - tr)/(td - tr);
      return 0.4*(1 - (T - td)/(te - td));
    }
    return 0;
  }
  // pause: a beat already scheduled but not yet heard is silenced (it plays when the visible
  // pulse reaches it after the resume); the whoosh and the flow surge settle where they are
  function heartHold(t){
    let first = null;
    for(const b of H.pend){
      const s1t = b.v1 ? b.v1.t0 : b.t1 - S1_LEAD;
      if(s1t > t + 0.002){ steal(b.v1, t); steal(b.v2, t); steal(b.vb, t); if(first == null || b.n < first) first = b.n; }
      else if(b.v2 && b.v2.t0 > t + 0.03) steal(b.v2, t);
    }
    if(first != null && (H.next1 == null || first < H.next1)) H.next1 = first;
    H.pend.length = 0; H.surges.length = 0;
    holdParam(G.whG.gain, t, 0, 0.03); holdParam(G.flowSurge.gain, t, 1, 0.08); holdParam(G.flowLP.detune, t, 0, 0.08);
  }
  function heartSchedule(st, t, inside){
    const h = st.heart;
    if(H.lastT != null){ const da = t - H.lastT; if(da > 0 && da < 1) H.gap += (da - H.gap)*0.2; }   // real time between frames
    H.lastT = t;
    if(!h || !isFinite(h.phase)){ H.gameT = null; return; }
    // measured game-time / audio-time ratio (slow frames run the game slower than real
    // time), over ≥ 50 ms of unpaused play: never across a pause, a map load or a suspension
    if(st.paused || st.time == null || !isFinite(st.time) || H.gameT == null){ H.gameT = st.paused ? null : st.time; H.audT = t; }
    else {
      const dg = st.time - H.gameT, da = t - H.audT;
      if(dg < 0 || dg > 1 || da < 0 || da > 1){ H.gameT = st.time; H.audT = t; }
      else if(da >= 0.05){ H.rate += (clamp(dg/da, RATE_MIN, 1.25) - H.rate)*Math.min(1, da*3); H.gameT = st.time; H.audT = t; }
    }
    if(h.flat){ H.next1 = null; H.pend.length = 0; return; }
    const bpm = +h.bpm || 0, s1ph = S1_U*bpm/HREF;
    const Phi = h.beat + h.phase;
    // (re)initialise on start, after a reset / new map, or a jump
    if(H.next1 == null || h.beat < H.lastBeat || Phi < H.lastPhi - 0.01 || Phi > H.lastPhi + 3){
      H.next1 = h.phase < s1ph ? h.beat : h.beat + 1; H.pend.length = 0;
    }
    H.lastPhi = Phi; H.lastBeat = h.beat;
    if(st.paused){ if(!H.held){ H.held = true; heartHold(t); } return; }
    H.held = false;
    H.bpm = bpm;
    const bps = (+h.bpmNow || bpm)/60*H.rate; if(!(bps > 0.005)) return;
    const rs = h.breath != null && isFinite(h.breath) ? Math.sin(TAU*h.breath) : null;
    // lookahead: 1.5 frame gaps (0.1–0.45 s); a beat found late plays at once unless
    // it is more than about half a frame gap late (then it is skipped: never twice)
    const LOOK = clamp(1.5*H.gap, 0.1, 0.45), LATE = Math.max(0.08, 0.6*H.gap);
    // one beat = S1 + S2 + whoosh + surge, predicted from the phase and scheduled once,
    // when its S1 enters the lookahead
    while(true){
      const d = (H.next1 + s1ph - Phi)/bps;
      if(d > LOOK) break;
      if(d > -LATE){ if(d < 0) st0.late++; heartBeat(t + Math.max(0.004, d), bpm, H.rate, st.state === 'over', inside, rs, H.next1); }
      else st0.skipped++;
      H.next1++;
    }
  }
  function flatline(on){
    const T = now();
    if(on){
      if(!G.flat) flatBuild();
      const g = G.flat.g.gain;
      g.cancelScheduledValues(T); g.setValueAtTime(0, T);
      g.linearRampToValueAtTime(0.055, T + 0.03); g.setValueAtTime(0.055, T + 5); g.linearRampToValueAtTime(0, T + 9);
    } else if(G.flat){
      const g = G.flat.g.gain; g.cancelScheduledValues(T); g.setTargetAtTime(0, T, 0.03);
    }
  }

  // ---- per-frame --------------------------------------------------------------------------
  const pv = {};                                    // last values set per param (skip tiny changes)
  // bed levels (tests solo / mute parts of the mix through A.test.mix)
  const MIX = { heart: 1, rumble: 1, flow: 1, zoom: 1, swarm: 1, drone: 1 };
  function setP(key, param, v, tau, eps){
    const o = pv[key];
    if(o != null && Math.abs(o - v) <= (eps == null ? 1e-3 : eps)*Math.max(1e-3, Math.abs(o))) return;
    pv[key] = v; param.setTargetAtTime(v, now(), tau);
  }
  const grains = { rbc: -1, sq: -1 };
  const expo = rate => -Math.log(1 - rnd()*0.999)/rate;
  function stream(key, rate, t, hor, fn){
    if(!(rate > 0.2)){ grains[key] = -1; return; }
    let T = grains[key];
    if(!(T >= t)) T = t + expo(rate);                // start, or resume after a gap
    while(T < hor){ fn(T); T += expo(rate); }
    grains[key] = T;
  }
  const newCapture = () => ({ n: 0, v: 0, b: 0, sx: 0, sy: 0, g: 0, t: 0 });
  let wasPaused = false, capture = newCapture(), combo = 0, lastCapT = -9;
  let deathN = 0, deathSx = 0, deathSy = 0, lastWave = -9, lastSiteUp = -9, murNext = 0, lastPreview = -9;
  A.update = function(dt, st){
    if(!ctx) return;
    try { if(!G) build(); update(dt, st || {}); } catch(e){ st0.errors++; if(st0.errors < 4) console.error('[audio]', e); }
  };
  function update(dt, st){
    const t = now();
    st0.frames++;
    if(ctx.state !== 'running' && !opts.clock){
      // suspended (muted, hidden, not yet resumed): nothing accumulates to burst out on resume
      capture = newCapture(); deathN = 0; deathSx = 0; deathSy = 0; grains.rbc = -1; grains.sq = -1;
      H.gameT = null; H.lastT = null;
      warm(2); return;
    }
    warm(clamp(90*(+dt || 0), 1.5, 6));             // idle work: ~1.5 ms at 60 fps, more on slow frames
    view.w = st.vw || view.w; view.h = st.vh || view.h;
    const z = st.z || 0.1, zMin = st.zMin || 0.05, zMax = st.zMax || 5.33;
    view.zn = clamp(Math.log(z/zMin)/Math.log(Math.max(1.0001, zMax/zMin)), 0, 1);
    // pause: fade the world to near silence (the UI stays)
    const paused = !!st.paused;
    if(paused !== wasPaused){ wasPaused = paused; setP('world', G.world.gain, paused ? 0.04 : 1, paused ? 0.12 : 0.3, 0); }
    // cardiac arrest: circulation stops, the beds fade out under the flatline (τ 1.5 s)
    const flat = !!(st.heart && st.heart.flat), alive = flat ? 0 : 1, fT = tau => flat ? 1.5 : tau;
    // where are we: outside the vessels (rumble, heart) or inside the flow
    const fl = st.flow || {}, lumen = clamp(+fl.lumen || 0, 0, 1);
    const zi = smooth(Math.log(0.22), Math.log(1.5), Math.log(z));
    const inside = zi*(0.25 + 0.75*lumen);
    const spd = clamp((+fl.speed || 0)/260, 0, 1.5), ven = clamp((+fl.kind || 0) - 1, 0, 1), art = 1 - clamp(+fl.kind || 0, 0, 1);
    const sN = Math.min(1, spd);
    // the horde swimming on screen (units e2): murmur level; inside a lumen it has to rise
    // over the rushing flow, which yields a little to it
    const mv = st.moving || {}, nMov = Math.max(0, +mv.n || 0), wz = 0.35 + 0.65*smooth(Math.log(0.1), Math.log(1.6), Math.log(z));
    const mur = Math.min(1, Math.pow(nMov/150, 0.4))*wz;
    setP('rum', G.rumG.gain, MIX.rumble*0.2*(1 - 0.72*inside)*alive, fT(0.25));
    setP('flow', G.flowG.gain, MIX.flow*0.19*inside*(0.3 + 0.7*sN)*(1 - 0.25*ven)*(1 - 0.2*mur)*alive, fT(0.2));
    setP('flowF', G.flowLP.frequency, 340 + 1150*sN*(1 - 0.6*ven)*(0.6 + 0.4*art), 0.25);
    if(G.flowPan.pan) setP('flowPan', G.flowPan.pan, clamp(+fl.pan || 0, -0.7, 0.7), 0.3);
    H.surge = inside*(2*art + 0.5*(1 - art - ven) + 0.15*ven)*(0.45 + 0.55*sN);
    H.cents = inside*(900*art + 250*(1 - art - ven) + 80*ven);
    H.delay = clamp(+fl.delay || 0, 0, 0.6);
    setP('heartG', G.heartG.gain, MIX.heart*(1 - 0.3*inside), 0.3);
    setP('heartLP', G.heartLP.frequency, 650 - 270*inside, 0.3);
    setP('physLP', G.physLP.frequency, 1800 + 10000*smooth(0.1, 0.75, view.zn), 0.2);
    // zoom whoosh: level from zoom velocity, pitch from the zoom level (rises diving in)
    const zv = +st.zv || 0, za = Math.min(1, Math.abs(zv)/2.6);
    setP('zG', G.zG.gain, MIX.zoom*0.7*Math.pow(za, 1.2), za > 0.02 ? 0.05 : 0.12, 0.02);
    setP('zF', G.zBP.frequency, 180*Math.pow(2, 3.0*view.zn)*(1 + 0.25*Math.sign(zv)*za), 0.06, 0.01);
    // swarm murmur: its band wanders every 120–200 ms (a wet, shifting texture)
    setP('mur', G.murG.gain, paused ? 0 : MIX.swarm*0.42*mur*(1 + 0.9*inside)*alive, fT(0.25));
    if(mur > 0.01 && !paused && t >= murNext){ murNext = t + 0.12 + 0.08*rnd(); G.murBP.frequency.setTargetAtTime(420 + 480*rnd(), t, 0.08); }
    if(G.murPan.pan) setP('murPan', G.murPan.pan, clamp(+mv.pan || 0, -0.8, 0.8), 0.3);
    // heart
    heartSchedule(st, t, inside);
    if(flat !== H.flat){ H.flat = flat; flatline(flat); }
    // tension drone above 50 % infection
    const tension = st.state === 'play' ? smooth(0.5, 1, +st.infection || 0) : 0;
    if(tension > 0.001 && !G.drone) droneBuild();
    if(G.drone){
      setP('dg', G.drone.g.gain, MIX.drone*0.05*tension*alive, fT(0.8));
      setP('dm', G.drone.mg.gain, MIX.drone*0.012*tension*alive, fT(0.8));
      setP('dlp', G.drone.lp.frequency, 220 + 430*tension, 0.8);
      for(let i=0;i<G.drone.oscs.length;i++) setP('dd' + i, G.drone.oscs[i].detune, 150*tension, 1.5, 0.02);
      setP('dlfo', G.drone.lfo.frequency, 0.3 + 1.6*tension, 1);
    }
    // grains: Poisson streams scheduled up to 0.12 s ahead. Red cells tumbling past at high
    // zoom follow the flow speed and bunch on each beat (thinned by the surge shape);
    // squelches follow the swimming cells
    const hor = t + 0.12;
    const rbcRate = paused || flat || st.rbc === false ? 0 : Math.min(6, 9*smooth(Math.log(0.9), Math.log(3.5), Math.log(z))*lumen*(0.25 + 0.75*sN));
    stream('rbc', 1.4*rbcRate, t, hor, T => { if(1.4*rnd() > 0.6 + 0.8*surgeAt(T)) return; play('rbc', { when: T, gain: (0.35 + 0.65*rnd())*(1 + 0.4*art), pan: clamp((+fl.pan || 0) + (rnd() - 0.5)*1.4, -1, 1), rate: 0.85 + 0.3*rnd() }); });
    const sqRate = paused || flat ? 0 : Math.min(10, 1.3*Math.sqrt(nMov))*wz;
    stream('sq', sqRate, t, hor, T => play('squelch', { when: T, gain: (0.35 + 0.65*rnd())*zoomGain(), pan: clamp((+mv.pan || 0) + (rnd() - 0.5)*0.9, -1, 1), rate: 0.8 + 0.4*rnd() }));
    flushCaptures(t);
    flushDeaths(t);
    st0.voices = voices.length;
  }

  // ---- events -----------------------------------------------------------------------------
  // captures: single ones gulp (virus: crisp pop, bacterium: wet squelch); in a burst (a horde
  // eating many at once) they gather over 120 ms into one "multi" fizz whose level grows with
  // the count. The reward chime sounds at most every 0.6 s (0.8 s in a burst), quieter the
  // faster captures come, and climbs one step of STEP per chime while the streak lasts (no
  // 1.5 s gap); its top is a brighter "streak" chime, then the climb starts over.
  const STEP = [0, 3, 5, 8, 10, 12];                // E G A C D E: C-major pentatonic from E5
  let capRate = 0, capRateT = 0, lastChime = -9;
  function flushCaptures(t){
    const c = capture;
    capRate *= Math.exp(-(t - capRateT)/0.8); capRateT = t;
    if(!c.n) return;
    const burst = capRate > 4;
    if(t - c.t < (burst ? 0.12 : 0.03) && c.n < 40) return;
    const n = c.n, sx = c.sx/c.g, sy = c.sy/c.g, sp = spatial({ sx, sy }), zg = zoomGain();
    capture = newCapture();
    if(sp.g <= 0.01) return;
    if(t - lastCapT >= 1.5) combo = 0;              // the streak broke
    lastCapT = t;
    duck(t + 0.005, heartAt(t - 0.03, t + 0.2) ? (burst ? 0.7 : 0.42) : (burst ? 0.9 : 0.8));
    if(n <= 2 && !burst){
      for(let k=0;k<n;k++){
        const bac = k < c.b;
        if(allow(bac ? 'gulpB' : 'gulpV')) play(bac ? 'gulpB' : 'gulpV', { when: t + 0.005 + k*0.045 + 0.01*rnd(), gain: sp.g*zg*dB((rnd() - 0.5)*2), pan: sp.pan, rate: 0.94 + 0.12*rnd() });
      }
    } else {
      st0.merged += n - 1;
      if(allow('multi')) play('multi', { when: t + 0.005, gain: sp.g*zg*Math.min(1.5, 0.7 + 0.2*Math.log2(n)), pan: sp.pan, rate: (c.b > c.v ? 0.85 : 1) + 0.12*rnd() });
    }
    if(t - lastChime > (burst ? 0.8 : 0.6) && allow('chime')){
      lastChime = t;
      const cg = sp.g*(0.8 + 0.2*zg)*(burst ? 0.8 : 1)/(1 + 0.4*Math.max(0, capRate - 1));
      if(combo < STEP.length - 1){ play('chime', { when: t + 0.05, gain: cg, pan: sp.pan*0.6, rate: Math.pow(2, STEP[combo]/12) }); combo++; }
      else { if(allow('streak')) play('streak', { when: t + 0.05, gain: 1.2*cg, pan: sp.pan*0.6 }); combo = 0; }
    }
  }
  function flushDeaths(t){
    if(!deathN) return;
    const n = deathN, sp = spatial({ sx: deathSx/n, sy: deathSy/n });
    deathN = 0; deathSx = 0; deathSy = 0;
    if(sp.g <= 0.01) return;
    if(n > 1) st0.merged += n - 1;
    if(allow('deflate')) play('deflate', { when: t + 0.01, gain: sp.g*zoomGain()*Math.min(1.5, 0.8 + 0.25*Math.log2(n)), pan: sp.pan, rate: 0.92 + 0.16*rnd() });
  }
  A.event = function(e){
    if(!G || !ctx || !e) return;
    if(!live()){ st0.gated++; return; }
    try { onEvent(e); } catch(err){ st0.errors++; if(st0.errors < 4) console.error('[audio]', err); }
  };
  function onEvent(e){
    const t = now();
    const sp = spatial(e), zg = zoomGain();
    switch(e.type){
      case 'capture': {
        if(sp.g <= 0.01) return;
        const c = capture; if(!c.n) c.t = t;
        c.n++; if(e.kind === 'bacterium') c.b++; else c.v++;
        capRate = capRate*Math.exp(-(t - capRateT)/0.8) + 1/0.8; capRateT = t;
        const w = sp.g + 1e-3; c.sx += (e.sx != null ? e.sx : view.w/2)*w; c.sy += (e.sy != null ? e.sy : view.h/2)*w; c.g += w;
        break;
      }
      case 'death':
        if(sp.g <= 0.01) return;
        deathN++; deathSx += e.sx != null ? e.sx : view.w/2; deathSy += e.sy != null ? e.sy : view.h/2;
        break;
      case 'siteDown':
        duck(t, heartAt(t - 0.03, t + 0.3) ? 0.5 : 0.7);
        if(allow('splat')) play('splat', { when: t, gain: Math.max(0.35, sp.g)*zg, pan: sp.pan });
        if(allow('triumph')) play('triumph', { when: t + 0.12, gain: 1, pan: sp.pan*0.5 });
        break;
      case 'siteUp':
        if(t - lastWave < 1.5 || t - lastSiteUp < 0.8) return;
        lastSiteUp = t;
        if(allow('alarm')) play('alarm', { when: t, v: 0, gain: 0.8 + 0.2*sp.g, pan: sp.pan*0.6 });
        break;
      case 'wave':
        lastWave = t;
        if(allow('alarm')) play('alarm', { when: t, v: 1, force: true });
        break;
      case 'spawn':
        if(allow('arp')) play('arp', { when: t, gain: Math.max(0.5, sp.g), pan: sp.pan*0.7 });
        break;
      case 'escape':
        if(allow('escape')) play('escape', { when: t, gain: 0.7 + 0.3*sp.g, pan: sp.pan*0.7, rate: 0.97 + 0.06*rnd() });
        break;
      case 'over': play('lose', { when: t + 0.05, force: true }); break;
      case 'won': play('win', { when: t + 0.05, force: true }); break;
      // UI
      case 'select': {
        const n = Math.max(1, e.n | 0), k = n <= 1 ? 1 : n < 20 ? 2 : n < 120 ? 3 : 4;
        for(let i=0;i<k;i++) if(allow('pop')) play('pop', { when: t + i*(0.028 + 0.012*rnd()), gain: sp.g*(1 - 0.12*i)*dB((rnd() - 0.5)*2), pan: clamp(sp.pan + (rnd() - 0.5)*0.3*i, -1, 1), rate: 0.9 + 0.25*rnd() + 0.05*i });
        break;
      }
      case 'command': {
        const n = Math.max(1, e.n | 0), k = n <= 3 ? 1 : n < 30 ? 2 : n < 150 ? 3 : 4;
        const det = 0.02 + 0.06*Math.min(1, Math.log2(n)/8);   // chorus detune grows with the horde
        const base = 1.06 - 0.12*Math.min(1, Math.log2(n)/9);  // a bigger horde sounds a little bigger
        const g = Math.max(0.5, sp.g);
        duck(t, heartAt(t - 0.03, t + 0.25) ? 0.6 : 0.85);
        for(let i=0;i<k;i++){
          if(!allow('blorp')) break;
          play('blorp', { when: t + 0.004 + i*(0.035 + 0.04*rnd()), v: ((rnd()*6) | 0)*2 + (e.attack ? 1 : 0), gain: g*(i ? 0.72 : 1)*dB((rnd() - 0.5)*2), pan: clamp(sp.pan + (i ? (rnd() - 0.5)*0.6 : 0), -1, 1), rate: base*(1 + (rnd() - 0.5)*2*det) });
        }
        break;
      }
      case 'nope': if(allow('nope')) play('nope', { when: t }); break;
      case 'click': if(allow('click')) play('click', { when: t, rate: 0.95 + 0.1*rnd() }); break;
      case 'open': if(allow('open')) play('open', { when: t }); break;
      case 'close': if(allow('close')) play('close', { when: t }); break;
      case 'toggle': play('toggle', { when: t + 0.02, force: true }); break;
      // one heartbeat at its level through the UI bus (the volume slider: Settings pauses the world)
      case 'preview':
        if(t - lastPreview < 0.3) return;
        lastPreview = t;
        play('s1', { when: t + 0.01, bus: 'ui', force: true });
        play('s2', { when: t + 0.01 + 0.28, bus: 'ui', force: true });
        break;
    }
  }

  // ---- control ----------------------------------------------------------------------------
  A.unlock = function(){
    if(!enabled && !opts.context) return false;
    try {
      if(!ctx){
        if(opts.context) start(opts.context, true);
        else if(AC){
          let c; try { c = new AC({ latencyHint: 'interactive' }); } catch(e){ c = new AC(); }
          start(c, false);
          // iOS: a silent buffer started inside the gesture unlocks output
          try { const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, SR); s.connect(ctx.destination); s.start(0); } catch(e){}
        } else return false;
      }
      if(!hidden && enabled) resume();
      return true;
    } catch(e){ st0.errors++; console.warn('[audio] unavailable', e); return false; }
  };
  // mute: fade out, then suspend (the gain is below −60 dB by then); unmute: resume, fade in
  A.setEnabled = function(on){
    enabled = !!on;
    if(!ctx){ if(enabled && opts.context) A.unlock(); return; }
    applyMaster(enabled ? 0.06 : 0.03);
    if(isOffline()) return;
    if(enabled){ if(!hidden) resume(); }
    else suspendLater(200, () => !enabled);
  };
  A.setVolume = function(v){ v = +v; if(!isFinite(v)) return; volume = clamp(v, 0, 1); applyMaster(0.06); };
  // hidden tab: fade out (20 ms) and suspend; shown: resume from silence and fade in (no pop)
  A.setHidden = function(h){
    hidden = !!h;
    if(!ctx || isOffline()) return;
    const T = now(), p = G && G.master.gain;
    if(hidden){
      if(p){ p.cancelScheduledValues(T); p.setTargetAtTime(0, T, 0.02); }
      suspendLater(80, () => hidden);
    } else if(enabled){
      if(p){ p.cancelScheduledValues(T); p.setValueAtTime(0, T); p.setTargetAtTime(volume*volume, T + 0.02, 0.12); }
      resume();
    }
  };
  A.stats = function(){
    return {
      state: ctx ? ctx.state : (A.available ? 'locked' : 'unavailable'), enabled, volume,
      voices: voices.filter(v => v.end > now()).length, peakVoices: st0.peakVoices, nodesPerSec: G ? nodesPerSec() : 0,
      nodes: st0.nodes, dropped: st0.dropped, merged: st0.merged, stolen: st0.stolen, gated: st0.gated, beats: st0.beats, beatsLate: st0.late, beatsSkipped: st0.skipped,
      bpm: H.bpm, gameRate: +H.rate.toFixed(3), built: st0.built, pending: buildQ ? buildQ.length : 0, graph: !!G, beds: st0.beds, jobs: jobs.length,
      bufferKB: Math.round(st0.bufferSamples*4/1024), frames: st0.frames, errors: st0.errors,
    };
  };
  Object.defineProperty(A, 'ctx', { get: () => ctx });
  Object.defineProperty(A, 'enabled', { get: () => enabled });
  Object.defineProperty(A, 'volume', { get: () => volume });
  // test hooks
  A.test = {
    names: NAMES.slice(),
    play: (name, o) => play(name, Object.assign({ force: true }, o || {})),
    buffer: (name, v) => { if(!R) return null; const r = mulberry(hashStr(name)*31 + (v | 0)*7919 + seed); return R[name](r, v | 0); },
    heartAt: (t1, bpm) => heartBeat(t1, bpm || 64, 1, false, 0, null, 0),
    surgeAt: T => surgeAt(T),
    mix: MIX,                                        // bed multipliers {heart, rumble, flow, zoom, swarm, drone}
    setLog: (arr) => { LOG = Array.isArray(arr) ? arr : null; },
    bus: (name, g) => { const n = name === 'heart' ? G.heart : G[name] && G[name].in; if(n) n.gain.setValueAtTime(g, now()); },
    get G(){ return G; },
    get H(){ return H; },
  };
  if(opts.context) A.unlock();
  return A;
};
})();
