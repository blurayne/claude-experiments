/**
 * The two samplers every generator draws through.
 *
 * They call Math.random directly, exactly as before. That matters more than it looks: the
 * parity gate seeds Math.random and compares pixels, so the ORDER and COUNT of draws is part
 * of the picture. gauss() is a rejection sampler with no fixed draw count, so nothing here
 * may be memoised, batched or reordered. Threading an injectable Rng through the generators
 * is a later step, taken with the gate watching.
 */

export function gauss(): number { let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
export function expR(a: number, b: number, Rd: number): number { // radius in [a,b] from an exponential disk profile ~exp(-r/Rd)
  const ea=Math.exp(-a/Rd), eb=Math.exp(-b/Rd);
  return -Rd*Math.log(ea-(ea-eb)*Math.random());
}
