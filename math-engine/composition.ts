/** Replaces standalone `x` (not the "x" inside identifiers like "exp") with `inner`. Same safe substitution used by transform.ts. */
function substituteX(expression: string, inner: string): string {
  return expression.replace(/\bx\b/g, `(${inner})`);
}

/** Builds g(f(x)) by substituting f's expression everywhere g references x. */
export function composeExpressions(outerExpression: string, innerExpression: string): string {
  return substituteX(outerExpression, innerExpression);
}

export function formatCompositionLatex(outerLabel: string, innerLabel: string): string {
  return `${outerLabel}(${innerLabel}(x))`;
}
