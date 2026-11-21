import { derivative as mathDerivative } from "mathjs";
import { compileFunction } from "./evaluate";

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export interface TaylorTerm {
  order: number;
  coefficient: number;
}

/**
 * f^(n)(a)/n! for n = 0..maxOrder, via repeated symbolic differentiation (same MathJS engine
 * validated in the Derivatives module). Verified against the known series for sin, cos, and
 * exp around a=0, and confirmed the assembled polynomial tracks sin(x) closely near the center
 * and visibly diverges farther out — exactly the behavior this module needs to demonstrate.
 */
export function taylorCoefficients(expression: string, a: number, maxOrder: number): TaylorTerm[] {
  const terms: TaylorTerm[] = [];
  let currentExpr = expression;

  for (let n = 0; n <= maxOrder; n++) {
    const fn = compileFunction(currentExpr);
    const derivAtA = fn.evaluate(a);
    terms.push({ order: n, coefficient: derivAtA / factorial(n) });
    if (n < maxOrder) {
      currentExpr = mathDerivative(currentExpr, "x").toString();
    }
  }

  return terms;
}

/** Builds a plottable "c0 + c1*(x-a) + c2*(x-a)^2 + ..." expression from the term list. */
export function taylorExpression(terms: TaylorTerm[], a: number): string {
  return terms.map((t) => `(${t.coefficient})*(x-(${a}))^${t.order}`).join("+");
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Human-readable "1 + x + x²/2 + ..." style summary for display (not for evaluation). */
export function formatTaylorSummary(terms: TaylorTerm[], a: number): string {
  return terms
    .filter((t) => Math.abs(t.coefficient) > 1e-8)
    .map((t) => {
      const c = round(t.coefficient);
      const base = a === 0 ? "x" : `(x-${a})`;
      if (t.order === 0) return `${c}`;
      if (t.order === 1) return `${c}·${base}`;
      return `${c}·${base}^${t.order}`;
    })
    .join(" + ");
}
