export interface Line {
  m: number;
  b: number;
}

export interface Point2D {
  x: number;
  y: number;
}

/** Returns the intersection of two lines, or null if they're parallel (including coincident). */
export function intersectLines(a: Line, b: Line): Point2D | null {
  if (Math.abs(a.m - b.m) < 1e-9) return null;
  const x = (b.b - a.b) / (a.m - b.m);
  const y = a.m * x + a.b;
  return { x, y };
}

/** Formats a slope-intercept equation, e.g. m=2.5, b=-1 -> "y = 2.5x - 1". */
export function formatLineEquation(m: number, b: number): string {
  const mPart = m === 1 ? "x" : m === -1 ? "-x" : `${round(m)}x`;
  const bPart = b === 0 ? "" : b > 0 ? ` + ${round(b)}` : ` - ${round(Math.abs(b))}`;
  return `y = ${mPart}${bPart}`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
