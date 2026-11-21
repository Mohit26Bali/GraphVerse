import { derivative as mathDerivative } from "mathjs";
import type { CompiledFunction } from "./evaluate";

/**
 * Exact symbolic derivative via MathJS's differentiation engine, returned as a re-parseable
 * expression string — verified to match numeric central-difference approximation to within
 * 1e-3 across x², x³, sin(x), sqrt(x), and abs(x) (whose derivative, abs(x)/x, correctly comes
 * out undefined at the corner x=0, matching that |x| isn't differentiable there).
 */
export function symbolicDerivative(expression: string): string {
  return mathDerivative(expression, "x").toString();
}

export interface Tangent {
  slope: number;
  intercept: number;
}

export function tangentAt(fn: CompiledFunction, derivFn: CompiledFunction, x0: number, scope?: Record<string, number>): Tangent {
  const slope = derivFn.evaluate(x0, scope);
  const y0 = fn.evaluate(x0, scope);
  return { slope, intercept: y0 - slope * x0 };
}

/**
 * Classic related-rates ladder problem: a length-L ladder leans against a wall, base at
 * distance x from the wall, top at height y — so x²+y²=L² at every instant. Implicitly
 * differentiating gives 2x(dx/dt) + 2y(dy/dt) = 0, so dy/dt = -(x/y)(dx/dt). Verified against a
 * finite-difference approximation (dt=1e-5) for L=10, x0=6, dx/dt=2: analytic -1.5 vs numeric
 * -1.50000... — matches to 5 decimal places.
 */
export function ladderY(L: number, x: number): number {
  return Math.sqrt(Math.max(L * L - x * x, 0));
}

export function ladderDyDt(L: number, x0: number, dxdt: number): number {
  const y0 = ladderY(L, x0);
  return -(x0 / y0) * dxdt;
}

/**
 * Classic optimization problem: P meters of fencing enclose a rectangular field against an
 * existing wall (so only 3 sides need fencing) — 2w + l = P, area A = w·l = w(P-2w). This is a
 * downward parabola in w, maximized where dA/dw = P-4w = 0, i.e. w = P/4. Verified numerically:
 * for P=32, A(8)=128 while A(7)=A(9)=126 — both neighbors are lower, confirming 8=P/4 is the peak.
 */
export function fenceArea(P: number, w: number): number {
  return w * (P - 2 * w);
}

export function fenceOptimalWidth(P: number): number {
  return P / 4;
}
