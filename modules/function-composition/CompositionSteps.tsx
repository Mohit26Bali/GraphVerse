"use client";

import { useGraphContext } from "@/graph-engine";

export interface CompositionStepsProps {
  x0: number;
  fx0: number;
  gfx0: number;
}

/**
 * Draws the classic "staircase" for composition: up to f(x0), across to the y=x line
 * (so f(x0) becomes the next input), down to the x-axis, then up to g(f(x0)) — the same
 * y=x mirror trick used to visualize inverses in the Logarithms module.
 */
export function CompositionSteps({ x0, fx0, gfx0 }: CompositionStepsProps) {
  const { xScale, yScale } = useGraphContext();
  if (![x0, fx0, gfx0].every(Number.isFinite)) return null;

  const points: [number, number][] = [
    [x0, 0],
    [x0, fx0],
    [fx0, fx0],
    [fx0, 0],
    [fx0, gfx0],
  ];
  const path = points
    .map(([px, py], i) => `${i === 0 ? "M" : "L"} ${xScale(px)} ${yScale(py)}`)
    .join(" ");

  return <path d={path} fill="none" stroke="var(--color-chart-3)" strokeWidth={1.5} strokeDasharray="4 3" />;
}
