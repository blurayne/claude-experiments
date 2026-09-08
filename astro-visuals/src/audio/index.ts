import { $ } from '../core/dom'

/**
 * Everything you hear: a drone synthesised live through Web Audio, three ambient tracks
 * fetched as files, and two banks of recorded effects.
 *
 * The volume sliders ARE the switches. Zero reads "off", stops the sound and leaves the graph
 * unbuilt; raising one from zero builds it. There is no separate toggle, deliberately, and
 * tests/e2e/boot.spec.ts asserts it because a refactor can undo a design rule silently.
 *
 * Nothing is built at import time. Browsers refuse audio before a user gesture, so armUnlock
 * waits for one and then resumes the context, loads the banks and starts the track — and
 * disarms only once something actually played, because a refused promise means try again on
 * the next gesture rather than give up.
 *
 * The music is three separate files rather than embedded: ten megabytes of base64 would
 * bloat the page past any sane single-file limit, and this way nothing is fetched until
 * music is turned on.
 */

export interface AudioGraph {
  ctx: AudioContext
  master: GainNode
  comp: DynamicsCompressorNode
  droneG: GainNode
}

/**
 * The state the interface writes and the graph reads. `graph` is null until the first gesture
 * builds it, which is why almost everything here begins by checking for it.
 */
/** The two recorded banks, and the throttle that keeps repeats from stacking. */
export type BankName = 'sn' | 'birth'
interface Bank {
  src: string[]
  gain: number
  max: number
  bufs: AudioBuffer[] | null
  els: HTMLAudioElement[] | null
  voices: number
}

/** Which effects are switched on. `pn` and `drone` have no bank; they are synthesised. */
export type FxName = 'birth' | 'sn' | 'pn' | 'drone'

export const sound = {
  soundOn: false,
  sfxVol: 0,
  musicOn: true,
  musicVol: 0.4,
  trackIx: 0,
  graph: null as AudioGraph | null,
}


const sfxLast: Partial<Record<string, number>> = {};
export function initAudio(){
  // Safari still shipped the prefixed constructor when this was written; the cast is the
  // only honest way to say "either of these, and TypeScript knows about one".
  const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  const ctx = new Ctor();
  const comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
  const master = ctx.createGain(); master.gain.value = sound.soundOn?sound.sfxVol:0; master.connect(comp);
  // Ambient drone. It needs energy above ~150 Hz or laptop and phone speakers reproduce
  // nothing at all, so the deep sines carry a set of quieter mid partials with them.
  const droneG = ctx.createGain(); droneG.gain.value = 1; droneG.connect(master);
  const padG = ctx.createGain(); padG.gain.value = 0.20; padG.connect(droneG);
  for(const [f,g0] of [[55,0.34],[55.6,0.34],[110.4,0.26],[165.3,0.15],[220.6,0.10],[330.9,0.05]]){
    const o = ctx.createOscillator(); o.type='sine'; o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = g0;
    o.connect(g); g.connect(padG); o.start();
  }
  const nbuf = ctx.createBuffer(1, ctx.sampleRate*4, ctx.sampleRate);
  const nd = nbuf.getChannelData(0); let v = 0;
  for(let i=0;i<nd.length;i++){ v = v*0.98 + (Math.random()*2-1)*0.04; nd[i] = v*6; }
  const ns = ctx.createBufferSource(); ns.buffer = nbuf; ns.loop = true;
  const nf = ctx.createBiquadFilter(); nf.type='lowpass'; nf.frequency.value = 140;
  const ng = ctx.createGain(); ng.gain.value = 0.5;
  ns.connect(nf); nf.connect(ng); ng.connect(padG); ns.start();
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
  const lg = ctx.createGain(); lg.gain.value = 0.06;
  lfo.connect(lg); lg.connect(padG.gain); lfo.start();
  return {ctx, master, comp, droneG};
}
// background music: two ambient tracks shipped alongside this page (music/*.mp3).
// Kept as separate files rather than embedded: 10 MB of base64 would bloat the HTML
// past any sane single-file limit, and this way nothing is fetched until music is on.
export const TRACKS = [
  {src:'music/galactic-year-remix-1.mp3', name:'Galactic Year — Remix I'},
  {src:'music/galactic-year-1.mp3', name:'Galactic Year I'},
  {src:'music/galactic-year-2.mp3', name:'Galactic Year II'},
];

/**
 * The music element. One `<audio>`, reused for every track, because three elements would
 * mean three preloads and the point of `preload = 'none'` is that nothing is fetched until
 * music is actually turned on.
 */
export const player = new Audio();
player.preload = 'none';
player.volume = sound.musicVol;
player.addEventListener('ended', ()=> nextTrack());
player.addEventListener('error', ()=>{ $('trackName').textContent = 'track unavailable'; });
export function showTrack(){ $('trackName').textContent = (sound.trackIx+1)+'/'+TRACKS.length+' · '+TRACKS[sound.trackIx].name; }
export function playTrack(){
  if(!sound.musicOn) return null;
  const q = player.play();
  if(q && q.catch) q.catch(()=> armUnlock()); // autoplay blocked until the first gesture
  return q;                                   // handed back so the unlock can wait on it
}
export function loadTrack(i: number) {
  sound.trackIx = (i + TRACKS.length) % TRACKS.length;
  player.src = TRACKS[sound.trackIx].src;
  showTrack();
  return playTrack();
}
export function nextTrack(){ loadTrack(sound.trackIx + 1); }
// Browsers refuse sound.graph before a user gesture, so anything on by default waits for one.
// It waits for ANY of these — a phone that reports only touchend, a keyboard, a click on
// a control that swallowed the pointerdown — and it keeps waiting until the sound.graph is
// genuinely playing. The old version stood down on the first gesture whether or not the
// play succeeded, so one refused attempt (and a refusal is ordinary: a gesture the
// browser judges too old, a media element still loading) left the music dead for the
// rest of the visit with nothing left listening to try again.
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
let unlockArmed = false;
export function armUnlock(){
  if(unlockArmed) return;
  unlockArmed = true;
  const disarm = ()=>{
    if(!unlockArmed) return;
    unlockArmed = false;
    for(const t of UNLOCK_EVENTS) removeEventListener(t, go);
  };
  const go = ()=>{
    if(sound.graph) sound.graph.ctx.resume().catch(()=>{});
    loadBanks();                       // the samples may have been waiting on the context too
    if(!sound.musicOn){ disarm(); return; }
    const q = player.src ? playTrack() : loadTrack(sound.trackIx);
    if(q && q.then) q.then(disarm, ()=>{});   // still armed if it was refused: try the next gesture
    else disarm();
  };
  for(const t of UNLOCK_EVENTS) addEventListener(t, go);
}
// Recorded sample banks: five supernova blasts and four soft star ignitions, each
// picked at random with a slight detune so repeats never sound looped. Decoded through
// the sound.graph graph where fetch is allowed, so the effects volume and compressor still
// apply; opened straight from disk (file://) fetch is blocked and plain media elements
// stand in.
const BANKS: Record<BankName, Bank> = {
  sn:    { src:[1,2,3,4,5].map(i=>'sfx/supernova-'+i+'.mp3'), gain:0.80, max:3, bufs:null, els:null, voices:0 },
  birth: { src:[1,2,3,4].map(i=>'sfx/ignition-'+i+'.mp3'),    gain:0.62, max:5, bufs:null, els:null, voices:0 },
};
// `banksTried` used to latch before the work, so a single failed or — worse — never
// settling decode killed the samples for the whole visit: the catch that installs the
// <sound.graph> fallback only runs on a rejection, and decodeAudioData on a context the
// browser has interrupted can simply never settle either way. Now the latch is only
// held while an attempt is in flight, a timer installs the fallback if nothing has
// arrived, and every sfx() is free to ask again.
let banksLoading = false;
const banksDone = (b: Bank) => !!(b.bufs || b.els);
function elFallback(b: Bank): void { if(!banksDone(b)) b.els = b.src.map(s=>{ const a=new Audio(s); a.preload='auto'; return a; }); }
export function loadBanks(){
  if(banksLoading || !sound.graph) return;
  if(!sound.graph) return;
  const todo = Object.values(BANKS).filter(b => !banksDone(b));
  if(!todo.length) return;
  banksLoading = true;
  let left = todo.length;
  const done = ()=>{ if(--left === 0) banksLoading = false; };
  const ctx = sound.graph.ctx;   // loadBanks is only reached once the graph exists
  for(const b of todo){
    Promise.all(b.src.map(s => fetch(s).then(r=>r.arrayBuffer()).then(a=>ctx.decodeAudioData(a))))
      .then(bs => { b.bufs = bs; }, () => elFallback(b))
      .then(done, done);
  }
  setTimeout(()=>{ banksLoading = false; todo.forEach(elFallback); }, 6000);
}
export function playBank(k: BankName): boolean {
  const b = BANKS[k];
  // Only ever called once the graph exists — sfx() checks — but the type does not know that.
  if(!b || !sound.graph) return false;
  const {ctx, master} = sound.graph;
  if(b.bufs){
    if(b.voices >= b.max) return true; // already thick; skip rather than stack
    const src = ctx.createBufferSource();
    src.buffer = b.bufs[(Math.random()*b.bufs.length)|0]!;
    src.playbackRate.value = 0.93 + Math.random()*0.14;
    const g = ctx.createGain(); g.gain.value = b.gain;
    src.connect(g); g.connect(master); src.start(ctx.currentTime);
    b.voices++; src.onended = ()=>{ b.voices--; };
    return true;
  }
  if(b.els){
    // cloneNode returns Node; these are Audio elements by construction (see elFallback).
    const a = b.els[(Math.random()*b.els.length)|0]!.cloneNode() as HTMLAudioElement;
    a.volume = Math.min(1, sound.sfxVol*b.gain*1.4); a.play().catch(()=>{});
    return true;
  }
  return false; // not loaded yet
}
export const fxOn: Record<FxName, boolean> = {birth:true, sn:true, pn:true, drone:true};
export function sfx(kind: FxName): void {
  if(!sound.soundOn || !sound.graph || !fxOn[kind]) return;
  // Only two of the four have a recorded bank; `pn` and `drone` are synthesised.
  const bank = kind === 'sn' || kind === 'birth' ? BANKS[kind] : null;
  if(bank && !banksDone(bank)) loadBanks();   // never gave up on them
  const {ctx, master} = sound.graph, t = ctx.currentTime;
  // Blasts run 7.7 s: don't let them pile up. The drone is continuous and has no gap.
  const gap: number = {sn:1.4, birth:0.45, pn:0.25, drone:0}[kind];
  const last = sfxLast[kind];
  if(last !== undefined && t - last < gap) return;
  sfxLast[kind] = t;
  if(kind==='birth'){ // a soft ignition; silent until the samples are decoded
    playBank('birth');
    return;
  }
  if(kind==='sn'){ // the immense one: a recorded blast, or the synth until they load
    if(playBank('sn')) return;
    const o = ctx.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(90,t); o.frequency.exponentialRampToValueAtTime(28,t+1.6);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.5,t+0.08); g.gain.exponentialRampToValueAtTime(0.0001,t+2.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+2.7);
    const nb = ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate), nd2 = nb.getChannelData(0);
    for(let i=0;i<nd2.length;i++) nd2[i] = Math.random()*2-1;
    const s2 = ctx.createBufferSource(); s2.buffer = nb;
    const f = ctx.createBiquadFilter(); f.type='lowpass';
    f.frequency.setValueAtTime(2400,t); f.frequency.exponentialRampToValueAtTime(60,t+2.0);
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001,t);
    g2.gain.exponentialRampToValueAtTime(0.35,t+0.05); g2.gain.exponentialRampToValueAtTime(0.0001,t+2.2);
    s2.connect(f); f.connect(g2); g2.connect(master); s2.start(t); s2.stop(t+2.2);
  } else if(kind==='pn'){ // planetary nebula: an airy exhale
    const nb = ctx.createBuffer(1,ctx.sampleRate*1.4,ctx.sampleRate), nd2 = nb.getChannelData(0);
    for(let i=0;i<nd2.length;i++) nd2[i] = Math.random()*2-1;
    const s2 = ctx.createBufferSource(); s2.buffer = nb;
    const f = ctx.createBiquadFilter(); f.type='bandpass'; f.Q.value = 1.6;
    f.frequency.setValueAtTime(700,t); f.frequency.exponentialRampToValueAtTime(240,t+1.2);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(1.10,t+0.35); g.gain.exponentialRampToValueAtTime(0.0001,t+1.3);
    s2.connect(f); f.connect(g); g.connect(master); s2.start(t); s2.stop(t+1.4);
  }
}
export function applySfxGain(){
  if(!sound.graph) return;
  const at=sound.graph.ctx.currentTime;
  sound.graph.master.gain.cancelScheduledValues(at);
  sound.graph.master.gain.setTargetAtTime(sound.soundOn?sound.sfxVol:0.0, at, 0.3); // fade, never a click
}
