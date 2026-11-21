import type { CompiledFunction } from "./evaluate";

export interface OneToOneResult {
  isOneToOne: boolean;
  /** Two x-values that map to (nearly) the same y, proving the function fails the horizontal line test — present only when isOneToOne is false. */
  conflictPair?: [number, number];
}

/**
 * Numerically approximates the horizontal line test: sample the function, sort by y, and
 * look for two samples with close y-values but well-separated x-values. A heuristic (like
 * findRealRoots/findTurningPoints), not a symbolic proof — sufficient for a visual teaching tool.
 *
 * The y-tolerance is scaled against the sampled *y-range*, not the x-domain span — those are
 * different units, and comparing y-differences against an x-derived tolerance produced false
 * positives (verified: missed a real conflict in abs(x) over an asymmetric wide domain).
 */
export function checkOneToOne(
  fn: CompiledFunction,
  domain: [number, number],
  scope?: Record<string, number>,
  samples = 400,
): OneToOneResult {
  const [start, end] = domain;
  const span = end - start;
  if (span <= 0) return { isOneToOne: true };

  const step = span / Math.max(samples - 1, 1);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const x = start + i * step;
    let y: number;
    try {
      y = fn.evaluate(x, scope);
    } catch {
      y = NaN;
    }
    if (Number.isFinite(y)) points.push({ x, y });
  }

  const yValues = points.map((p) => p.y);
  const yRange = Math.max(...yValues) - Math.min(...yValues) || 1;
  const sorted = [...points].sort((a, b) => a.y - b.y);
  const yTolerance = yRange * 0.003;
  const xMinSeparation = span * 0.02;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (
      Math.abs(sorted[i].y - sorted[i + 1].y) < yTolerance &&
      Math.abs(sorted[i].x - sorted[i + 1].x) > xMinSeparation
    ) {
      return { isOneToOne: false, conflictPair: [sorted[i].x, sorted[i + 1].x] };
    }
  }

  return { isOneToOne: true };
}
