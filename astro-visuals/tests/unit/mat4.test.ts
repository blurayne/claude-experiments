import { describe, it, expect } from 'vitest'
import { perspective, lookAt, mul, type Mat4, type Vec3 } from '../../src/core/mat4'

/**
 * The first module extracted far enough to be testable on its own, and the reason the
 * refactor is worth doing: none of this could be exercised while it lived in a 5,000-line
 * script that needed a WebGL context to load.
 *
 * These are properties rather than golden numbers. A screenshot already tells us the matrices
 * are the ones the page used to build; what it cannot tell us is whether they are RIGHT — and
 * a handedness mistake here is exactly the class of bug that shipped once already (v2.61.0,
 * where the whole scene was a mirror image of the real galactic frame and self-consistently
 * wrong everywhere, so nothing looked broken).
 */

const near = (a: number, b: number, eps = 1e-5): boolean => Math.abs(a - b) < eps

/** Apply a column-major mat4 to a point, perspective divide included. */
function transform(m: Mat4, p: Vec3): [number, number, number, number] {
  const [x, y, z] = p
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
    m[3] * x + m[7] * y + m[11] * z + m[15],
  ]
}

describe('perspective', () => {
  const fov = Math.PI / 3
  const P = perspective(fov, 16 / 9, 0.1, 1000)

  it('puts a point on the near plane at w = its distance', () => {
    // The projection is right-handed in view space: the camera looks down -z, so a visible
    // point has negative z and w comes out positive.
    const [, , , w] = transform(P, [0, 0, -5])
    expect(w).toBeCloseTo(5)
  })

  it('leaves the view centre at the centre of the screen', () => {
    const [x, y, , w] = transform(P, [0, 0, -10])
    expect(near(x / w, 0)).toBe(true)
    expect(near(y / w, 0)).toBe(true)
  })

  it('is narrower horizontally than vertically only by the aspect ratio', () => {
    // A point one unit right and one unit up at the same depth must land further from centre
    // vertically, on a wider-than-tall viewport.
    const [x, y, , w] = transform(P, [1, 1, -10])
    expect(Math.abs(y / w)).toBeGreaterThan(Math.abs(x / w))
    expect(near(Math.abs(y / w) / Math.abs(x / w), 16 / 9)).toBe(true)
  })

  it('maps the near and far planes to -1 and +1 in NDC', () => {
    const n = transform(P, [0, 0, -0.1])
    const f = transform(P, [0, 0, -1000])
    expect(n[2] / n[3]).toBeCloseTo(-1, 4)
    expect(f[2] / f[3]).toBeCloseTo(1, 4)
  })
})

describe('lookAt', () => {
  it('puts the eye at the origin of view space', () => {
    const V = lookAt([3, 4, 5], [0, 0, 0], [0, 1, 0])
    const [x, y, z] = transform(V, [3, 4, 5])
    expect(near(x, 0)).toBe(true)
    expect(near(y, 0)).toBe(true)
    expect(near(z, 0)).toBe(true)
  })

  it('puts the target straight ahead, down -z', () => {
    const V = lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0])
    const [x, y, z] = transform(V, [0, 0, 0])
    expect(near(x, 0)).toBe(true)
    expect(near(y, 0)).toBe(true)
    expect(z).toBeLessThan(0)
    expect(near(z, -10)).toBe(true)
  })

  it('keeps up pointing up', () => {
    const V = lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0])
    const above = transform(V, [0, 1, 0])
    expect(above[1]).toBeGreaterThan(0)
  })

  it('is right-handed: with up = +y and the eye on +z, world +x is screen right', () => {
    // This is the assertion that would have caught v2.61.0's mirrored scene at the source
    // rather than by noticing Rigel on the wrong side of Betelgeuse.
    const V = lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0])
    const right = transform(V, [1, 0, 0])
    expect(right[0]).toBeGreaterThan(0)
  })

  it('survives a degenerate up vector without producing NaN', () => {
    // Looking straight down with up = +y is the classic singularity. The page's camera clamps
    // pitch so it should never ask, but a matrix full of NaN blanks the screen silently.
    const V = lookAt([0, 10, 0], [0, 0, 0], [0, 1, 0])
    expect([...V].every(Number.isFinite)).toBe(true)
  })
})

describe('mul', () => {
  const I = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])

  it('leaves a matrix alone when multiplied by the identity', () => {
    const P = perspective(1, 1.5, 0.5, 100)
    expect([...mul(P, I)]).toEqual([...P])
    expect([...mul(I, P)]).toEqual([...P])
  })

  it('composes projection and view the way the frame does', () => {
    // proj * view applied to a point must equal proj applied to (view applied to it).
    const P = perspective(Math.PI / 4, 1, 0.1, 100)
    const V = lookAt([0, 0, 8], [0, 0, 0], [0, 1, 0])
    const PV = mul(P, V)

    const point: Vec3 = [1, 2, -3]
    const viewed = transform(V, point)
    const both = transform(P, [viewed[0], viewed[1], viewed[2]])
    const once = transform(PV, point)

    for (let i = 0; i < 4; i++) expect(near(once[i]!, both[i]!, 1e-4)).toBe(true)
  })

  it('is not commutative, which is why the argument order is load-bearing', () => {
    const P = perspective(1, 2, 0.1, 50)
    const V = lookAt([1, 2, 3], [0, 0, 0], [0, 1, 0])
    expect([...mul(P, V)]).not.toEqual([...mul(V, P)])
  })
})
