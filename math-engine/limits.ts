import type { CompiledFunction } from "./evaluate";

export type LimitClassification = "continuous" | "removable" | "jump" | "infinite" | "undefined-nearby";

export interface LimitAnalysis {
  /** f(a - epsilon) at a small epsilon — the left-hand limit estimate. */
  leftLimit: number;
  /** f(a + epsilon) at a small epsilon — the right-hand limit estimate. */
  rightLimit: number;
  /** f(a) itself, which may be NaN. */
  functionValue: number;
  /** (leftLimit + rightLimit) / 2, only meaningful when the two agree. */
  limitValue: number | null;
  classification: LimitClassification;
}

function safeEval(fn: CompiledFunction, x: number, scope?: Record<string, number>): number {
  try {
    const y = fn.evaluate(x, scope);
    return Number.isFinite(y) ? y : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Classifies the behavior of f near x=a by sampling at two shrinking epsilons and checking
 * whether the values are converging (continuous/removable), disagreeing (jump), or growing
 * without bound (infinite) as epsilon shrinks. A numeric heuristic — like findRealRoots or
 * checkOneToOne elsewhere in math-engine — not a symbolic proof, but verified against seven
 * known cases (continuous, removable hole, one/two-sided infinite, jump, sign function).
 */
export function analyzeLimit(fn: CompiledFunction, a: number, scope?: Record<string, number>): LimitAnalysis {
  const epsFar = 1e-2;
  const epsNear = 1e-4;

  const leftFar = safeEval(fn, a - epsFar, scope);
  const leftNear = safeEval(fn, a - epsNear, scope);
  const rightFar = safeEval(fn, a + epsFar, scope);
  const rightNear = safeEval(fn, a + epsNear, scope);
  const functionValue = safeEval(fn, a, scope);

  const diverges = (far: number, near: number) =>
    Number.isFinite(far) && Number.isFinite(near) && Math.abs(near) > Math.abs(far) * 5 && Math.abs(near) > 50;

  if (diverges(leftFar, leftNear) || diverges(rightFar, rightNear)) {
    return { leftLimit: leftNear, rightLimit: rightNear, functionValue, limitValue: null, classification: "infinite" };
  }

  if (!Number.isFinite(leftNear) || !Number.isFinite(rightNear)) {
    return {
      leftLimit: leftNear,
      rightLimit: rightNear,
      functionValue,
      limitValue: null,
      classification: "undefined-nearby",
    };
  }

  const scale = Math.max(Math.abs(leftNear), Math.abs(rightNear), 1);
  const agree = Math.abs(leftNear - rightNear) < scale * 1e-2;
  if (!agree) {
    return { leftLimit: leftNear, rightLimit: rightNear, functionValue, limitValue: null, classification: "jump" };
  }

  const limitValue = (leftNear + rightNear) / 2;
  const definedAtA = Number.isFinite(functionValue);
  const matches = definedAtA && Math.abs(functionValue - limitValue) < Math.max(Math.abs(limitValue), 1) * 1e-2;

  return {
    leftLimit: leftNear,
    rightLimit: rightNear,
    functionValue,
    limitValue,
    classification: definedAtA && matches ? "continuous" : "removable",
  };
}

/** Values of f at a sequence of shrinking epsilons on both sides of a, for the "watch it converge" table. */
export function epsilonTable(
  fn: CompiledFunction,
  a: number,
  epsilons: number[] = [0.5, 0.1, 0.01, 0.001, 0.0001],
  scope?: Record<string, number>,
): { epsilon: number; left: number; right: number }[] {
  return epsilons.map((epsilon) => ({
    epsilon,
    left: safeEval(fn, a - epsilon, scope),
    right: safeEval(fn, a + epsilon, scope),
  }));
}
