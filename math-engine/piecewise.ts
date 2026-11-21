export interface Interval {
  start: number;
  end: number;
  startInclusive: boolean;
  endInclusive: boolean;
}

export interface Piece {
  id: string;
  expression: string;
  interval: Interval;
}

function bound(n: number): string {
  return Number.isFinite(n) ? String(n) : n > 0 ? "Infinity" : "-Infinity";
}

/**
 * Wraps a piece's expression with a domain guard so it evaluates to NaN outside its
 * interval — reusing FunctionPlot's existing NaN-gap handling instead of a bespoke
 * clipped renderer. Renders exactly like any other function everywhere else in the app.
 */
export function guardedExpression({ expression, interval }: Piece): string {
  const startOp = interval.startInclusive ? ">=" : ">";
  const endOp = interval.endInclusive ? "<=" : "<";
  return `(x ${startOp} ${bound(interval.start)} and x ${endOp} ${bound(interval.end)}) ? (${expression}) : NaN`;
}

export function containsX({ interval }: Piece, x: number): boolean {
  const afterStart = interval.startInclusive ? x >= interval.start : x > interval.start;
  const beforeEnd = interval.endInclusive ? x <= interval.end : x < interval.end;
  return afterStart && beforeEnd;
}

export interface Discontinuity {
  x: number;
  /** Value approached from the left piece, evaluated at the boundary regardless of inclusivity. */
  leftValue: number;
  /** Value approached from the right piece. */
  rightValue: number;
  /** Whether the left piece actually includes this boundary point (its endInclusive flag). */
  leftInclusive: boolean;
  /** Whether the right piece actually includes this boundary point (its startInclusive flag). */
  rightInclusive: boolean;
}

const JUMP_EPSILON = 1e-6;

function round(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/**
 * Finds boundaries between adjacent pieces (sorted by interval.start) where the left
 * piece's limit disagrees with the right piece's limit — a jump discontinuity. Pieces
 * that meet at the same value (like the two branches of |x|) are treated as continuous.
 */
export function findDiscontinuities(pieces: Piece[], evaluate: (expression: string, x: number) => number): Discontinuity[] {
  const sorted = [...pieces].sort((a, b) => a.interval.start - b.interval.start);
  const jumps: Discontinuity[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i];
    const right = sorted[i + 1];
    if (Math.abs(left.interval.end - right.interval.start) > JUMP_EPSILON) continue;
    if (!Number.isFinite(left.interval.end)) continue;

    const boundaryX = left.interval.end;
    const leftValue = evaluate(left.expression, boundaryX);
    const rightValue = evaluate(right.expression, boundaryX);
    if (Math.abs(leftValue - rightValue) > JUMP_EPSILON) {
      jumps.push({
        x: round(boundaryX),
        leftValue: round(leftValue),
        rightValue: round(rightValue),
        leftInclusive: left.interval.endInclusive,
        rightInclusive: right.interval.startInclusive,
      });
    }
  }

  return jumps;
}

export type StepKind = "floor" | "ceil" | "step";

/** Auto-generates the piece list for floor(x), ceil(x), or a unit step function, over a visible domain. */
export function generateStepPieces(kind: StepKind, domain: [number, number]): Piece[] {
  if (kind === "step") {
    return [
      { id: "step-neg", expression: "0", interval: { start: -Infinity, end: 0, startInclusive: false, endInclusive: false } },
      { id: "step-pos", expression: "1", interval: { start: 0, end: Infinity, startInclusive: true, endInclusive: false } },
    ];
  }

  const lo = Math.floor(domain[0]) - 1;
  const hi = Math.ceil(domain[1]) + 1;
  const pieces: Piece[] = [];

  for (let n = lo; n <= hi; n++) {
    if (kind === "floor") {
      pieces.push({
        id: `floor-${n}`,
        expression: String(n),
        interval: { start: n, end: n + 1, startInclusive: true, endInclusive: false },
      });
    } else {
      pieces.push({
        id: `ceil-${n}`,
        expression: String(n),
        interval: { start: n - 1, end: n, startInclusive: false, endInclusive: true },
      });
    }
  }

  return pieces;
}
