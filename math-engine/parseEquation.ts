import { compileFunction } from "./evaluate";
import { assertSafeTyped } from "./safeExpression";

export type ParsedEquation =
  | { kind: "function"; expression: string }
  | { kind: "vertical"; x: number }
  | { kind: "implicit"; expression: string };

/**
 * Copy-pasting from a document or math editor commonly brings in typographic characters that
 * look right but aren't valid MathJS syntax — most notably U+2212 MINUS SIGN (as opposed to the
 * plain ASCII hyphen), which MathJS's parser rejects outright. Normalize the common ones so
 * pasted equations work the way they visually appear to.
 */
function normalize(raw: string): string {
  return raw
    .replace(/[−‒–—]/g, "-") // minus sign, figure/en/em dash -> hyphen
    .replace(/[×✕✖]/g, "*") // multiplication signs -> asterisk
    .replace(/÷/g, "/") // division sign -> slash
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

/**
 * Classifies a typed equation so the Sandbox can route it to the right renderer:
 * - "y = ..." (or no "=" at all) is a plain function of x.
 * - "x = <constant>" is a vertical line — can't be written as y=f(x), so it needs its own path.
 * - Anything else with an "=" (e.g. "x^2+y^2=25") is treated as implicit: g(x,y) = lhs - rhs = 0.
 */
export function parseEquation(raw: string): ParsedEquation | null {
  const trimmed = normalize(raw).trim();
  if (!trimmed) return null;

  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) {
    return { kind: "function", expression: trimmed };
  }

  const left = trimmed.slice(0, eqIndex).trim();
  const right = trimmed.slice(eqIndex + 1).trim();

  if (/^y$/i.test(left)) {
    return { kind: "function", expression: right };
  }

  if (/^x$/i.test(left)) {
    const value = safeEvaluateConstant(right);
    if (value !== null) return { kind: "vertical", x: value };
  }

  return { kind: "implicit", expression: `(${left})-(${right})` };
}

function safeEvaluateConstant(expr: string): number | null {
  try {
    const value = compileFunction(expr).evaluate(0);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Test-compiles a parsed equation so the UI can show *something* instead of silently rendering
 * nothing when an expression is malformed — e.g. a typographic character normalize() doesn't
 * cover, or a genuine syntax error.
 */
export function validateEquation(parsed: ParsedEquation): string | null {
  try {
    if (parsed.kind === "function") {
      compileFunction(parsed.expression).evaluate(1);
    } else if (parsed.kind === "implicit") {
      compileFunction(parsed.expression).evaluate(1, { y: 1 });
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Couldn't parse that expression.";
  }
}

/**
 * Why a typed equation cannot be used, or null when it is fine to plot. Checked before anything is
 * compiled or drawn, so text such as `sum(range(1, 1e8))` is refused instead of freezing the page.
 */
export function equationProblem(raw: string): string | null {
  const text = normalize(raw).trim();
  if (!text) return null;
  if ((text.match(/=/g) ?? []).length > 1) return "Use at most one = sign.";
  try {
    assertSafeTyped(text.replace("=", " "));
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Couldn't use that expression.";
  }
}
