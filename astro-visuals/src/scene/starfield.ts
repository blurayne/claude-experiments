import { gauss } from '../core/rng'

/**
 * The backdrop: 3,200 stars on a sphere at 7,500 units, far outside anything else drawn.
 *
 * It used to be a bare block declaring `var starPos, starSize, starCol` and relying on `var`
 * hoisting to reach the pointVAO call two hundred lines below. That works, and it means the
 * block cannot be moved, tidied into `const`, or extracted without silently producing an
 * empty starfield — the arrays would still exist, still be the right length, and be full of
 * zeros. Returning them removes the dependence instead of reproducing it.
 *
 * Consumes randomness, so WHERE it is called from matters: the parity gate compares a seeded
 * stream, and this is the first of the seven eval-time consumers. It must stay the first.
 */

export interface Starfield {
  pos: Float32Array
  size: Float32Array
  col: Float32Array
}

/** How many. The draw call needs it too, so it is exported rather than inlined twice. */
export const N_STAR = 3200

export function buildStarfield(): Starfield {
  const pos = new Float32Array(N_STAR * 3)
  const size = new Float32Array(N_STAR)
  const col = new Float32Array(N_STAR * 3)
  for (let i = 0; i < N_STAR; i++) {
    const th = Math.random()*2*Math.PI, ph = Math.acos(2*Math.random()-1), r = 7500;
    pos[i*3]=r*Math.sin(ph)*Math.cos(th); pos[i*3+1]=r*Math.cos(ph); pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
    size[i]= 6 + Math.random()*9;
    const w = .35+Math.random()*.5, warm=Math.random()*.15;
    col[i*3]=w+warm; col[i*3+1]=w+warm*.5; col[i*3+2]=w+Math.random()*.2;
  }
  return { pos, size, col }
}
