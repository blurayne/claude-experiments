/**
 * The movement effect: streaks of light rushing past while the ship moves — a star field at
 * warp. Decoration, on its own see-through 2D canvas over the scene (and under the labels
 * and panels), in the eye's own space: points in a box ahead of the eye, one unit deep,
 * flowing against the ship's motion and drawn as lines from where each was a moment ago to
 * where it is. The speed that drives it is the APPARENT one — view heights a second — so it
 * looks the same at every scale, and is capped, or a burst at a fast clock would be white.
 * Strength follows the speed and fades in and out; nothing is drawn at rest, or with the
 * switch off.
 */
const N = 170
const P = new Float32Array(N*3)
let cv: HTMLCanvasElement | null = null, g: CanvasRenderingContext2D | null = null
let intensity = 0, drawn = false, dpr = 1
export const warp = { on: true }

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
export function initWarp(): void {
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
export function drawWarp(dt: number, active: boolean, vr: number, vu: number, vf: number): void {
  if(!cv || !g) return
  let sp = Math.hypot(vr, vu, vf)
  const target = active && warp.on ? warpStrength(sp) : 0
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
    let x = P[i*3] - mx*dt, y = P[i*3+1] - my*dt, z = P[i*3+2] - mz*dt
    // out of the box: back in at the far end going forward, near the eye going backward,
    // on the far side going sideways
    if(z < 0.05){ seed(i, 0.7, 1); continue }
    if(z > 1.05){ seed(i, 0.06, 0.3); continue }
    const sx = cx + x/z*foc, sy = cy - y/z*foc
    if(sx < -W*0.2 || sx > W*1.2 || sy < -H*0.2 || sy > H*1.2){ seed(i, 0.5, 1); continue }
    P[i*3] = x; P[i*3+1] = y; P[i*3+2] = z
    // where it was a moment ago: the tail
    const tz = Math.min(1.2, z + mz*T), tx = x + mx*T, ty = y + my*T
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
