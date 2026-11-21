export interface RootFactor {
  id: string;
  root: number;
  multiplicity: 1 | 2 | 3;
}

/** Builds "a*(x-r0)^m0*(x-r1)^m1*..." — root values live in `scope` so the compiled AST stays stable while roots are dragged. */
export function polynomialTemplate(factors: RootFactor[]): string {
  if (factors.length === 0) return "a";
  const terms = factors.map((f, i) => `(x-r${i})^${f.multiplicity}`).join("*");
  return `a*${terms}`;
}

export function polynomialScope(a: number, factors: RootFactor[]): Record<string, number> {
  const scope: Record<string, number> = { a };
  factors.forEach((f, i) => {
    scope[`r${i}`] = f.root;
  });
  return scope;
}

export function polynomialDegree(factors: RootFactor[]): number {
  return factors.reduce((sum, f) => sum + f.multiplicity, 0);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Human-readable factored equation with actual numbers, e.g. "y = 2(x + 1)(x - 3)^2". */
export function formatFactoredEquation(a: number, factors: RootFactor[]): string {
  const aRounded = round(a);
  if (factors.length === 0) return `y = ${aRounded}`;
  const aPart = aRounded === 1 ? "" : aRounded === -1 ? "-" : `${aRounded}`;
  const terms = factors
    .map((f) => {
      const r = round(f.root);
      const base = r === 0 ? "x" : r > 0 ? `(x - ${r})` : `(x + ${Math.abs(r)})`;
      return f.multiplicity === 1 ? base : `${base}^${f.multiplicity}`;
    })
    .join("");
  return `y = ${aPart}${terms}`;
}
