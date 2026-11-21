import { parse } from "mathjs";

/** Discrete growth-factor form: y = A*b^x + k. */
export const expTemplate = "A*b^x+k";

/** Continuous rate form: y = A*e^(r*x) + k — the limit of discrete compounding as steps shrink. */
export const expRateTemplate = "A*exp(r*x)+k";

/** Growth factor b that behaves like continuous rate r over one unit of x. */
export function rateToBase(r: number): number {
  return Math.exp(r);
}

/** Continuous rate that behaves like discrete growth factor b over one unit of x. */
export function baseToRate(b: number): number {
  return Math.log(b);
}

/** Steps needed for a discrete growth factor b to double (b>1) or halve (0<b<1) the value. */
export function discreteDoublingTime(b: number): number {
  return Math.log(2) / Math.log(b);
}

/** Time needed for continuous rate r to double (r>0) or halve (r<0) the value. */
export function continuousDoublingTime(r: number): number {
  return Math.log(2) / r;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatExpLatex(A: number, b: number, k: number): string {
  const expr = `${round(A)}*${round(b)}^x+${round(k)}`;
  try {
    return `y = ${parse(expr).toTex({ parenthesis: "auto" })}`;
  } catch {
    return `y = ${expr}`;
  }
}

export function formatExpRateLatex(A: number, r: number, k: number): string {
  const expr = `${round(A)}*exp(${round(r)}*x)+${round(k)}`;
  try {
    return `y = ${parse(expr).toTex({ parenthesis: "auto" })}`;
  } catch {
    return `y = ${expr}`;
  }
}
