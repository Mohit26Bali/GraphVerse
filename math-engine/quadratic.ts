export interface Vertex {
  a: number;
  h: number;
  k: number;
}

/** Real roots of y = a(x-h)^2 + k, in vertex form. */
export function quadraticRoots({ a, h, k }: Vertex): number[] {
  if (a === 0) return [];
  const discriminant = -k / a;
  if (discriminant < -1e-9) return [];
  if (Math.abs(discriminant) < 1e-9) return [h];
  const offset = Math.sqrt(discriminant);
  return [h - offset, h + offset];
}

/** Slope of y = a(x-h)^2 + k at x0, via the power rule applied to the vertex form. */
export function quadraticSlopeAt({ a, h }: Vertex, x0: number): number {
  return 2 * a * (x0 - h);
}

export function quadraticValueAt({ a, h, k }: Vertex, x: number): number {
  return a * (x - h) ** 2 + k;
}

export interface Line {
  m: number;
  b: number;
}

/** Tangent line to the parabola at x0. */
export function quadraticTangentAt(vertex: Vertex, x0: number): Line {
  const m = quadraticSlopeAt(vertex, x0);
  const y0 = quadraticValueAt(vertex, x0);
  return { m, b: y0 - m * x0 };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formats vertex-form equation, e.g. a=2, h=-1, k=3 -> "y = 2(x + 1)^2 + 3". */
export function formatVertexEquation(a: number, h: number, k: number): string {
  const aPart = a === 1 ? "" : a === -1 ? "-" : `${round(a)}`;
  const hPart = h === 0 ? "x" : h > 0 ? `(x - ${round(h)})` : `(x + ${round(Math.abs(h))})`;
  const kPart = k === 0 ? "" : k > 0 ? ` + ${round(k)}` : ` - ${round(Math.abs(k))}`;
  return `y = ${aPart}${hPart}^2${kPart}`;
}
