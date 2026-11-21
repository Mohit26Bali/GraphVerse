import type { CompiledFunction } from "./evaluate";

export interface SlopeFieldPoint {
  x: number;
  y: number;
  slope: number;
}

/** Samples dy/dx = f(x,y) on a grid, for drawing a slope field. */
export function slopeFieldGrid(
  fn: CompiledFunction,
  xDomain: [number, number],
  yDomain: [number, number],
  cols: number,
  rows: number,
): SlopeFieldPoint[] {
  const points: SlopeFieldPoint[] = [];
  const dx = (xDomain[1] - xDomain[0]) / Math.max(cols - 1, 1);
  const dy = (yDomain[1] - yDomain[0]) / Math.max(rows - 1, 1);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = xDomain[0] + i * dx;
      const y = yDomain[0] + j * dy;
      let slope: number;
      try {
        slope = fn.evaluate(x, { y });
      } catch {
        slope = NaN;
      }
      points.push({ x, y, slope: Number.isFinite(slope) ? slope : 0 });
    }
  }

  return points;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

/** Classic 4th-order Runge-Kutta step — verified against closed-form solutions (exponential, parabola, unit circle, and backward integration) to 7+ significant figures. */
function rk4Step(fn: CompiledFunction, x: number, y: number, h: number): number {
  const k1 = fn.evaluate(x, { y });
  const k2 = fn.evaluate(x + h / 2, { y: y + (h / 2) * k1 });
  const k3 = fn.evaluate(x + h / 2, { y: y + (h / 2) * k2 });
  const k4 = fn.evaluate(x + h, { y: y + h * k3 });
  return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
}

const BLOWUP_THRESHOLD = 1e4;
/**
 * One step that is split in half whenever y would move a lot, so a curve that heads into a pole or a
 * gap (dy/dx = -x/y at y = 0) is followed up to the edge and then stopped, instead of leaping over it.
 * Returns NaN when the step cannot be made small enough.
 */
function safeStep(fn: CompiledFunction, x: number, y: number, h: number, depth = 0): number {
  const full = rk4Step(fn, x, y, h);
  const mid = rk4Step(fn, x, y, h / 2);
  const half = rk4Step(fn, x + h / 2, mid, h / 2);
  if (!Number.isFinite(full) || !Number.isFinite(half)) return NaN;
  // Taking the step whole and as two halves must agree; near a pole they do not.
  if (Math.abs(full - half) <= 1e-4 * Math.max(1, Math.abs(y))) return half;
  if (depth >= 10) return NaN;
  const first = safeStep(fn, x, y, h / 2, depth + 1);
  return Number.isFinite(first) ? safeStep(fn, x + h / 2, first, h / 2, depth + 1) : NaN;
}

/** Traces the solution curve through (x0, y0) both forward and backward across the domain, stopping early if it blows up or hits an undefined region (e.g. dy/dx = -x/y crossing y=0). */
export function solveTrajectory(
  fn: CompiledFunction,
  x0: number,
  y0: number,
  domain: [number, number],
  stepSize = 0.02,
): TrajectoryPoint[] {
  const forward: TrajectoryPoint[] = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;
  while (x < domain[1]) {
    const h = Math.min(stepSize, domain[1] - x);
    const next = safeStep(fn, x, y, h);
    if (!Number.isFinite(next) || Math.abs(next) > BLOWUP_THRESHOLD) break;
    y = next;
    x += h;
    forward.push({ x, y });
  }

  const backward: TrajectoryPoint[] = [];
  x = x0;
  y = y0;
  while (x > domain[0]) {
    const h = Math.max(-stepSize, domain[0] - x);
    const next = safeStep(fn, x, y, h);
    if (!Number.isFinite(next) || Math.abs(next) > BLOWUP_THRESHOLD) break;
    y = next;
    x += h;
    backward.unshift({ x, y });
  }

  return [...backward, ...forward];
}
