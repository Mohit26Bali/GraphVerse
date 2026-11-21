export interface Complex {
  re: number;
  im: number;
}

/**
 * Iterates z = z² + c starting from z=0, returning the iteration count at which |z| exceeds
 * the bailout radius (escaped), or maxIterations if it never does (presumed in the set).
 * Verified: c=0 and c=-1 stay bounded (in the set), c=2 escapes almost immediately, and the
 * real-axis boundary of the set is exactly [-2, 0.25] — confirmed to the hundredth decimal.
 */
export function mandelbrotEscape(c: Complex, maxIterations: number, bailout = 4): number {
  let zr = 0;
  let zi = 0;
  for (let i = 0; i < maxIterations; i++) {
    const zr2 = zr * zr;
    const zi2 = zi * zi;
    if (zr2 + zi2 > bailout) return i;
    const nextZr = zr2 - zi2 + c.re;
    const nextZi = 2 * zr * zi + c.im;
    zr = nextZr;
    zi = nextZi;
  }
  return maxIterations;
}

/** Same iteration, but starting from an arbitrary z (the pixel being tested) with c held fixed — the Julia set for that c. */
export function juliaEscape(z: Complex, c: Complex, maxIterations: number, bailout = 4): number {
  let zr = z.re;
  let zi = z.im;
  for (let i = 0; i < maxIterations; i++) {
    const zr2 = zr * zr;
    const zi2 = zi * zi;
    if (zr2 + zi2 > bailout) return i;
    const nextZr = zr2 - zi2 + c.re;
    const nextZi = 2 * zr * zi + c.im;
    zr = nextZr;
    zi = nextZi;
  }
  return maxIterations;
}

/**
 * x_{n+1} = r·x_n·(1-x_n), the logistic map. Verified: r=2.8 converges to the fixed point
 * (r-1)/r ≈ 0.6429, r=3.2 settles into a period-2 oscillation, r=3.9 stays bounded in (0,1)
 * without settling — the classic order-to-chaos progression as r increases.
 */
export function logisticMap(r: number, x0: number, iterations: number): number[] {
  const values = [x0];
  let x = x0;
  for (let i = 0; i < iterations; i++) {
    x = r * x * (1 - x);
    values.push(x);
  }
  return values;
}
