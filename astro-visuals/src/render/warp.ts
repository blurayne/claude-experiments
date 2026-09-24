/**
 * The movement effect: streaks of light rushing past while the ship moves — a star field at
 * warp. Decoration, on its own see-through 2D canvas over the scene (and under the labels
 * and panels), in the eye's own space: points in a box ahead of the eye, one unit deep,
 * flowing against the ship's motion and drawn as lines from where each was a moment ago to
 * where it is. The speed that drives it is the APPARENT one — view heights a second — so it
 * looks the same at every scale, and is capped, or a burst at a fast clock would be white.
 * Strength follows the speed and fades in and out; nothing is drawn at rest, or with the
 * switch off.
 *
 * The points are fixed in the world, so they turn with the ship's turns (v3.28.0): each
 * frame the change in the eye's frame is applied to them — a look round swings them, a
 * flip over sends them the other way, a roll wheels them round the centre — and the turn
 * adds to each streak's tail, so a fast turn smears them the way it would smear stars. A
 * fast turn alone brings some streaks up even at rest.
 */
const N = 170
const P = new Float32Array(N*3)
let cv: HTMLCanvasElement | null = null, g: CanvasRenderingContext2D | null = null
let intensity = 0, drawn = false, dpr = 1
export const warp = { on: true }
// The eye's frame last frame, as screen right, up and forward in the world, and the turn
// since: `turn` is (M − I)/dt, eased — how the eye-space points move a second from turning.
let prevE: number[][] | null = null
const turn = [0,0,0, 0,0,0, 0,0,0]
let turnRate = 0
/**
 * The rotation that carries eye-space points from the previous eye frame to this one, for
 * points fixed in the world: M[i][j] = e′ᵢ · eⱼ. Row-major, 9 numbers. Pure, and tested.
 */
export function frameChange(prev: number[][], cur: number[][]): number[] {
  const M = new Array(9)
  for(let i=0;i<3;i++) for(let j=0;j<3;j++) M[i*3+j] = cur[i][0]*prev[j][0] + cur[i][1]*prev[j][1] + cur[i][2]*prev[j][2]
  return M
}
/** the eye frame from the flight's basis: screen right is the world's right mirrored (the projection flips x) */
export function eyeFrame(r: readonly number[], u: readonly number[], d: readonly number[], mirror: number): number[][] {
  return [[r[0]*mirror, r[1]*mirror, r[2]*mirror], [u[0], u[1], u[2]], [-d[0], -d[1], -d[2]]]
}
/** how strong a turn alone makes the streaks: none below a gentle look, up to 0.6 from 3 rad/s */
export const turnStrength = (w: number): number => 0.6*Math.max(0, Math.min(1, (w - 0.3)/2.7))

function seed(i: number, z0: number, z1: number): void {
  P[i*3]   = (Math.random()*2 - 1)*0.9
  P[i*3+1] = (Math.random()*2 - 1)*0.9
  P[i*3+2] = z0 + Math.random()*(z1 - z0)
}
function resize(): void {
  if(!cv) return
  dpr = Math.min(2, devicePixelRatio || 1)
  cv.width = Math.round(innerWidth*dpr); cv.height = Math.round(innerHeight*dpr)
  drawn = true                              // a resize clears the canvas; draw or clear afresh
}
/** the points as they would be drawn now, in CSS pixels — for the debug checks in a browser */
export function warpProbe(): number[][] {
  const H = innerHeight, cx = innerWidth/2, cy = H/2, foc = (H/2)/Math.tan(Math.PI/6), out: number[][] = []
  for(let i=0;i<N;i++){ const z = P[i*3+2]; out.push([cx + P[i*3]/z*foc, cy - P[i*3+1]/z*foc, z]) }
  return out
}
export function initWarp(): void {
  if(location.search.includes('debug')) (window as unknown as { __warpProbe: () => number[][] }).__warpProbe = warpProbe
  cv = document.getElementById('warp') as HTMLCanvasElement | null
  g = cv ? cv.getContext('2d') : null
  for(let i=0;i<N;i++) seed(i, 0.05, 1)
  resize(); addEventListener('resize', resize)
}

/** apparent speed (view heights a second) at which the streaks are at full strength, and the cap on their motion */
export const WARP_FULL = 0.35, WARP_CAP = 4
/** how strong the streaks are at this apparent speed, 0..1 */
export const warpStrength = (vh: number): number => Math.max(0, Math.min(1, vh/WARP_FULL))

/**
 * One frame. `vr`, `vu`, `vf`: the ship's velocity along the eye's right, up and forward, in
 * view heights a second (screen right, not the mirrored world's).
 */
export function drawWarp(dt: number, active: boolean, vr: number, vu: number, vf: number, eye: number[][] | null): void {
  if(!cv || !g) return
  // the turn since last frame, applied to the points (they are fixed in the world)
  let M: number[] | null = null
  if(active && eye && prevE && dt > 0){
    M = frameChange(prevE, eye)
    const k = 1 - Math.exp(-dt/0.08)
    for(let i=0;i<9;i++) turn[i] += ((M[i] - (i % 4 === 0 ? 1 : 0))/dt - turn[i])*k
    turnRate = Math.acos(Math.max(-1, Math.min(1, (M[0] + M[4] + M[8] - 1)/2)))/dt
  } else { for(let i=0;i<9;i++) turn[i] = 0; turnRate = 0 }
  prevE = active && eye ? eye.map(e => e.slice()) : null
  let sp = Math.hypot(vr, vu, vf)
  const target = active && warp.on ? Math.max(warpStrength(sp), turnStrength(turnRate)) : 0
  intensity += (target - intensity)*(1 - Math.exp(-dt/0.25))
  if(intensity < 0.01){
    if(drawn){ g.clearRect(0, 0, cv.width, cv.height); drawn = false }
    return
  }
  if(sp > WARP_CAP){ const f = WARP_CAP/sp; vr *= f; vu *= f; vf *= f; sp = WARP_CAP }
  drawn = true
  const W = cv.width, H = cv.height, cx = W/2, cy = H/2, foc = (H/2)/Math.tan(Math.PI/6)
  const K = 0.55, T = 0.14                    // box units per view height; the streak's time span
  const mx = vr*K, my = vu*K, mz = vf*K
  g.clearRect(0, 0, W, H)
  g.globalCompositeOperation = 'lighter'
  g.lineCap = 'round'
  for(let i=0;i<N;i++){
    let x = P[i*3], y = P[i*3+1], z = P[i*3+2]
    if(M){ const a = x, b = y, c = z; x = M[0]*a + M[1]*b + M[2]*c; y = M[3]*a + M[4]*b + M[5]*c; z = M[6]*a + M[7]*b + M[8]*c }
    x -= mx*dt; y -= my*dt; z -= mz*dt
    // out of the box: back in at the far end going forward, near the eye going backward,
    // on the far side going sideways
    if(z < 0.05){ seed(i, 0.7, 1); continue }
    if(z > 1.05){ seed(i, 0.06, 0.3); continue }
    const sx = cx + x/z*foc, sy = cy - y/z*foc
    if(sx < -W*0.2 || sx > W*1.2 || sy < -H*0.2 || sy > H*1.2){ seed(i, 0.5, 1); continue }
    P[i*3] = x; P[i*3+1] = y; P[i*3+2] = z
    // where it was a moment ago: the tail — back along the motion, and back along the turn
    // (capped, so a snap of the wrist is a smear and not a line across the screen)
    const rs = Math.min(T, 0.6/Math.max(1e-6, turnRate))
    const tx = x + mx*T - (turn[0]*x + turn[1]*y + turn[2]*z)*rs
    const ty = y + my*T - (turn[3]*x + turn[4]*y + turn[5]*z)*rs
    const tz = Math.min(1.2, z + mz*T - (turn[6]*x + turn[7]*y + turn[8]*z)*rs)
    if(tz <= 0.02) continue
    const qx = cx + tx/tz*foc, qy = cy - ty/tz*foc
    const near = 1 - Math.min(1, z)            // nearer is brighter and wider
    const a = intensity*(0.12 + 0.75*near*near)
    if(a < 0.01) continue
    g.strokeStyle = 'rgba(175,215,255,' + a.toFixed(3) + ')'
    g.lineWidth = dpr*(0.5 + 1.8*near)
    g.beginPath(); g.moveTo(qx, qy); g.lineTo(sx, sy); g.stroke()
  }
  g.globalCompositeOperation = 'source-over'
}
