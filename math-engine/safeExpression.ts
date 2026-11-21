/**
 * Guards every expression before it reaches mathjs.
 *
 * mathjs is far more than a calculator: it can build huge matrices, sum ranges of a hundred
 * million numbers, redefine its own functions and more. The Sandbox and every module's
 * "type your own function" box send text straight into it, and a graph evaluates that text
 * hundreds of times per frame, so one heavy call freezes the tab (`combinations(1e9, 5e8)`
 * takes 16 seconds, `sum(range(1, 1e8))` takes 9).
 *
 * The rule is simple: only plain characters, and every function call must be one of the
 * instant scalar functions listed here. Symbols (x, y, t, a, pi ...) are always fine.
 */

export class UnsafeExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeExpressionError";
  }
}

/** Longest expression a visitor may type into a box. */
export const MAX_TYPED_LENGTH = 200;
/** Hard cap for any expression, including ones the app builds itself (long Fourier sums). */
export const MAX_ANY_LENGTH = 4000;

export const ALLOWED_FUNCTIONS: ReadonlySet<string> = new Set([
  "abs", "acos", "acosh", "acot", "acoth", "acsc", "acsch", "asec", "asech", "asin", "asinh",
  "atan", "atan2", "atanh", "cbrt", "ceil", "cos", "cosh", "cot", "coth", "csc", "csch",
  "cube", "exp", "expm1", "factorial", "fix", "floor", "gamma", "hypot", "log", "log10",
  "log1p", "log2", "max", "min", "mod", "nthRoot", "pow", "round", "sec", "sech", "sign",
  "sin", "sinh", "sqrt", "square", "tan", "tanh",
]);

/**
 * Digits, letters, underscore, spaces, the arithmetic characters, comparisons and the
 * conditional "a ? b : c" that the Piecewise module builds. No square or curly brackets, quotes,
 * semicolons, or dots-after-names (property access).
 */
const ALLOWED_CHARS = /^[0-9A-Za-z_+\-*/^().,!%\s<>=?:]*$/;

/** Characters a visitor may type: the same set without the conditional and "=" (the Sandbox splits on "=" first). */
const TYPED_CHARS = /^[0-9A-Za-z_+\-*/^().,!%\s<>]*$/;

const REFUSED = "Use only numbers, letters, + - * / ^ ! % and brackets.";

/** Throws UnsafeExpressionError when the text is not plain maths. Returns the text unchanged otherwise. */
export function assertSafeExpression(expression: string, maxLength: number = MAX_ANY_LENGTH): string {
  if (typeof expression !== "string") throw new UnsafeExpressionError("Enter an expression.");
  if (expression.length > maxLength) {
    throw new UnsafeExpressionError(`That expression is too long (limit ${maxLength} characters).`);
  }
  if (!ALLOWED_CHARS.test(expression)) throw new UnsafeExpressionError(REFUSED);

  // A colon is only allowed as the second half of "a ? b : c". On its own it is the range
  // operator, and 1:100000000 would build a hundred-million-element list.
  if ((expression.match(/:/g) ?? []).length !== (expression.match(/\?/g) ?? []).length) {
    throw new UnsafeExpressionError(REFUSED);
  }

  // A dot may only sit inside a number; after a name or bracket it would be property access (x.y).
  if (/[A-Za-z_)]\s*\./.test(expression)) throw new UnsafeExpressionError(REFUSED);

  // A name directly followed by "(" is a function call, so it must be on the list.
  for (const [, name] of expression.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) {
    if (!ALLOWED_FUNCTIONS.has(name)) {
      throw new UnsafeExpressionError(
        /^[a-zA-Z]$/.test(name) ? `Write ${name}*(...) to multiply by ${name}.` : `"${name}" is not available here.`,
      );
    }
  }
  return expression;
}

/** The check for text a visitor typed: the stricter character set plus the shorter typed-length limit. */
export function assertSafeTyped(expression: string): string {
  if (typeof expression === "string" && !TYPED_CHARS.test(expression)) throw new UnsafeExpressionError(REFUSED);
  return assertSafeExpression(expression, MAX_TYPED_LENGTH);
}
