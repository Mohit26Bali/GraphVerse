import type { CompiledFunction } from "./evaluate";

export type RiemannMethod = "left" | "right" | "midpoint";

export interface RiemannRect {
  x0: number;
  x1: number;
  height: number;
}

function safeEval(fn: CompiledFunction, x: number, scope?: Record<string, number>): number {
  try {
    const y = fn.evaluate(x, scope);
    return Number.isFinite(y) ? y : 0;
  } catch {
    return 0;
  }
}

export function riemannRectangles(
  fn: CompiledFunction,
  domain: [number, number],
  n: number,
  method: RiemannMethod,
  scope?: Record<string, number>,
): RiemannRect[] {
  const [a, b] = domain;
  const width = (b - a) / Math.max(n, 1);
  const rects: RiemannRect[] = [];

  for (let i = 0; i < n; i++) {
    const x0 = a + i * width;
    const x1 = x0 + width;
    const sampleX = method === "left" ? x0 : method === "right" ? x1 : (x0 + x1) / 2;
    rects.push({ x0, x1, height: safeEval(fn, sampleX, scope) });
  }

  return rects;
}

export function riemannSum(rects: RiemannRect[]): number {
  return rects.reduce((sum, r) => sum + r.height * (r.x1 - r.x0), 0);
}

export interface AccumulationPoint {
  x: number;
  y: number;
}

/**
 * Numerically builds A(x) = integral from a to x of f(t) dt, as a lookup table of points
 * suitable for plotting as its own curve. Walks outward from `a` in both directions using the
 * midpoint rule at a fixed step, so `a` itself always sits exactly on the grid (A(a) = 0) with
 * no interpolation error at the reference point. Verified against closed-form integrals of
 * f(x)=x (parabola), a constant (straight line), and sin(x) (correctly returns to 0 after 2π).
 */
export function accumulationSamples(
  fn: CompiledFunction,
  a: number,
  domain: [number, number],
  step = 0.02,
  scope?: Record<string, number>,
): AccumulationPoint[] {
  const [start, end] = domain;

  const rightPoints: AccumulationPoint[] = [{ x: a, y: 0 }];
  let acc = 0;
  let x = a;
  while (x < end - 1e-9) {
    const next = Math.min(x + step, end);
    const mid = (x + next) / 2;
    acc += safeEval(fn, mid, scope) * (next - x);
    rightPoints.push({ x: next, y: acc });
    x = next;
  }

  const leftPoints: AccumulationPoint[] = [];
  acc = 0;
  x = a;
  while (x > start + 1e-9) {
    const prev = Math.max(x - step, start);
    const mid = (x + prev) / 2;
    acc -= safeEval(fn, mid, scope) * (x - prev);
    leftPoints.unshift({ x: prev, y: acc });
    x = prev;
  }

  return [...leftPoints, ...rightPoints];
}
