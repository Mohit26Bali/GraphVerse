import { compileFunction } from "./evaluate";
import { findRealRoots } from "./analysis";

export interface Intersection {
  x: number;
  y: number;
}

/**
 * f(x) and g(x) intersect exactly where h(x) = f(x) - g(x) = 0 — so this just builds that
 * difference expression and hands it to the already-verified numeric root-finder (built for
 * the Polynomial module). Verified the difference-expression approach against a known case
 * (x² and 2x+1 meet at x = 1±√2) before wiring it in.
 */
export function findFunctionIntersections(
  exprA: string,
  exprB: string,
  domain: [number, number],
): Intersection[] {
  let diffFn;
  try {
    diffFn = compileFunction(`(${exprA})-(${exprB})`);
  } catch {
    return [];
  }

  const roots = findRealRoots(diffFn, { domain });

  let fnA;
  try {
    fnA = compileFunction(exprA);
  } catch {
    return [];
  }

  return roots
    .map((x) => {
      let y = NaN;
      try {
        y = fnA.evaluate(x);
      } catch {
        y = NaN;
      }
      return { x, y };
    })
    .filter((p) => Number.isFinite(p.y));
}

/** Where f(x) crosses a vertical line x = xLine — no root-finding needed, just one evaluation. */
export function findVerticalIntersection(expression: string, xLine: number): Intersection | null {
  try {
    const y = compileFunction(expression).evaluate(xLine);
    return Number.isFinite(y) ? { x: xLine, y } : null;
  } catch {
    return null;
  }
}
