import { parse } from "mathjs";

export interface TransformParams {
  a: number;
  b: number;
  h: number;
  k: number;
  [key: string]: number;
}

/** Replaces standalone `x` (not the "x" inside identifiers like "exp") with `inner`. */
function substituteX(rawExpression: string, inner: string): string {
  return rawExpression.replace(/\bx\b/g, `(${inner})`);
}

/**
 * Builds "a*(f(b*(x-h)))+k" from any raw expression in x — the general
 * a·f(b(x−h))+k transformation template shared by every base function.
 * `a`/`b`/`h`/`k` stay as scope variables so the compiled AST is stable
 * while sliders (or the animation engine) drive their values.
 */
export function transformTemplate(rawExpression: string): string {
  const substituted = substituteX(rawExpression, "b*(x-h)");
  return `a*(${substituted})+k`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Same template, but with literal numbers baked in — for display (LaTeX) only, never compiled/cached. */
export function transformLatex(rawExpression: string, { a, b, h, k }: TransformParams): string {
  const substituted = substituteX(rawExpression, `${round(b)}*(x-(${round(h)}))`);
  const expr = `${round(a)}*(${substituted})+${round(k)}`;
  try {
    return `y = ${parse(expr).toTex({ parenthesis: "auto" })}`;
  } catch {
    return `y = ${expr}`;
  }
}
