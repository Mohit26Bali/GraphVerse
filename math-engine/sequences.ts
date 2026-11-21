import { compileFunction } from "./evaluate";

export function compileTerm(termExpression: string) {
  return compileFunction(termExpression, "n");
}

/** S_1..S_count for a term expression in n (n starts at 1). Non-finite terms are skipped. */
export function partialSums(termExpression: string, count: number): { n: number; value: number }[] {
  const fn = compileTerm(termExpression);
  const points: { n: number; value: number }[] = [];
  let sum = 0;
  for (let n = 1; n <= count; n++) {
    const term = fn.evaluate(n);
    if (Number.isFinite(term)) sum += term;
    points.push({ n, value: sum });
  }
  return points;
}

/** a_1..a_count for a term expression in n — the raw sequence, not the running sum. */
export function sequenceTerms(termExpression: string, count: number): { n: number; value: number }[] {
  const fn = compileTerm(termExpression);
  const points: { n: number; value: number }[] = [];
  for (let n = 1; n <= count; n++) {
    points.push({ n, value: fn.evaluate(n) });
  }
  return points;
}
