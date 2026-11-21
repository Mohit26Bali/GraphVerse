import { compile, type EvalFunction } from "mathjs";
import { assertSafeExpression } from "./safeExpression";

export interface CompiledFunction {
  expression: string;
  evaluate: (x: number, scope?: Record<string, number>) => number;
}

/** Keeps the most recent compiled expressions; without a limit, every keystroke in a text box would stay in memory. */
const MAX_CACHED = 300;
const compileCache = new Map<string, EvalFunction>();

function getCompiled(expression: string): EvalFunction {
  const cached = compileCache.get(expression);
  if (cached) {
    // refresh its position so the least recently used entry is the one dropped
    compileCache.delete(expression);
    compileCache.set(expression, cached);
    return cached;
  }
  assertSafeExpression(expression);
  const node = compile(expression);
  compileCache.set(expression, node);
  if (compileCache.size > MAX_CACHED) compileCache.delete(compileCache.keys().next().value as string);
  return node;
}

/**
 * Compiles `y = f(x)` style expressions once and reuses the parsed AST for fast repeated
 * evaluation. `varName` lets the free variable be something other than "x" — e.g. "t" for
 * parametric curves — without affecting the compile cache, which is keyed on the expression
 * string alone (the parsed AST doesn't care what we later choose to call its free symbol).
 */
export function compileFunction(expression: string, varName: string = "x"): CompiledFunction {
  const node = getCompiled(expression);
  return {
    expression,
    evaluate: (value: number, scope: Record<string, number> = {}) => {
      const result = node.evaluate({ [varName]: value, ...scope });
      return typeof result === "number" ? result : NaN;
    },
  };
}

export interface SampleOptions {
  domain: [number, number];
  samples: number;
  scope?: Record<string, number>;
}

export interface SamplePoint {
  x: number;
  y: number;
}

/**
 * Any strategy that turns a compiled function into plot points implements this shape.
 * `sampleFunction` below is the default (uniform) one; an adaptive sampler that
 * concentrates points where curvature is high can be dropped in later without
 * callers (e.g. FunctionPlot) changing.
 */
export type Sampler = (fn: CompiledFunction, options: SampleOptions) => SamplePoint[];

/** Uniform sampler: fixed step size across the domain. Marks non-finite results as gaps (NaN) so the graph engine breaks the line there. */
export const sampleFunction: Sampler = (fn, { domain, samples, scope }) => {
  const [start, end] = domain;
  const step = (end - start) / Math.max(samples - 1, 1);
  const points: SamplePoint[] = new Array(samples);

  for (let i = 0; i < samples; i++) {
    const x = start + i * step;
    let y: number;
    try {
      y = fn.evaluate(x, scope);
    } catch {
      y = NaN;
    }
    points[i] = { x, y: Number.isFinite(y) ? y : NaN };
  }

  return points;
};
