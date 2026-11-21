import type { CompiledFunction } from "../evaluate";
import { sampleFunction } from "../evaluate";

/** [min, max] domain to search, independent of the graph engine's own Domain type. */
type Domain = [number, number];

export interface RootFindOptions {
  domain: Domain;
  samples?: number;
  scope?: Record<string, number>;
  /** |y| below this counts as "touching" zero — catches even-multiplicity roots that don't cross. */
  touchThreshold?: number;
}

function bisect(fn: CompiledFunction, a: number, b: number, scope: Record<string, number> | undefined, iterations = 40): number {
  let lo = a;
  let hi = b;
  let fLo = fn.evaluate(lo, scope);
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const fMid = fn.evaluate(mid, scope);
    if (fLo === 0 || Math.sign(fLo) !== Math.sign(fMid)) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

/** Finds real roots numerically: sign changes are bisected to a tight tolerance, and near-zero local minima of |y| catch even-multiplicity "touch" roots. */
export function findRealRoots(fn: CompiledFunction, { domain, samples = 2000, scope, touchThreshold }: RootFindOptions): number[] {
  const points = sampleFunction(fn, { domain, samples, scope });
  const span = domain[1] - domain[0];
  const threshold = touchThreshold ?? span * 0.0015;
  const roots: number[] = [];
  const isClose = (x: number) => roots.some((r) => Math.abs(r - x) < span * 0.01);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    if (!Number.isFinite(p0.y) || !Number.isFinite(p1.y)) continue;
    if (p0.y === 0) {
      if (!isClose(p0.x)) roots.push(p0.x);
      continue;
    }
    if (p0.y * p1.y < 0) {
      const root = bisect(fn, p0.x, p1.x, scope);
      if (!isClose(root)) roots.push(root);
    }
  }

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const next = points[i + 1];
    if (![prev, cur, next].every((p) => Number.isFinite(p.y))) continue;
    const isLocalMin = Math.abs(cur.y) < Math.abs(prev.y) && Math.abs(cur.y) < Math.abs(next.y);
    if (isLocalMin && Math.abs(cur.y) < threshold && !isClose(cur.x)) {
      roots.push(cur.x);
    }
  }

  return roots.sort((a, b) => a - b);
}

export interface TurningPoint {
  x: number;
  y: number;
  type: "max" | "min";
}

/** Local extrema via sign changes in the finite-difference slope between samples. */
export function findTurningPoints(fn: CompiledFunction, { domain, samples = 2000, scope }: RootFindOptions): TurningPoint[] {
  const points = sampleFunction(fn, { domain, samples, scope });
  const turning: TurningPoint[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const next = points[i + 1];
    if (![prev, cur, next].every((p) => Number.isFinite(p.y))) continue;
    const slopeBefore = cur.y - prev.y;
    const slopeAfter = next.y - cur.y;
    if (slopeBefore > 0 && slopeAfter < 0) {
      turning.push({ x: cur.x, y: cur.y, type: "max" });
    } else if (slopeBefore < 0 && slopeAfter > 0) {
      turning.push({ x: cur.x, y: cur.y, type: "min" });
    }
  }

  return turning;
}
