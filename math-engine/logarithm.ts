import { parse } from "mathjs";

/** y = A*log_b(x-h) + k. Domain requires x > h; mathjs returns a Complex (non-number) result outside it, which compileFunction's evaluate() already turns into NaN. */
export const logTemplate = "A*log(x-h,b)+k";

/** The exponential this log is the inverse of, sharing the same base — used to draw the mirrored pair. */
export const expTemplate = "b^x";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatLogLatex(A: number, b: number, h: number, k: number): string {
  const expr = `${round(A)}*log(x-(${round(h)}),${round(b)})+${round(k)}`;
  try {
    return `y = ${parse(expr).toTex({ parenthesis: "auto" })}`;
  } catch {
    return `y = ${expr}`;
  }
}
