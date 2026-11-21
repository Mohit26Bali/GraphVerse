"use client";

import { useGraphContext } from "@/graph-engine";

export interface LadderSegmentProps {
  x0: number;
  y0: number;
  color?: string;
}

/** Draws the ladder as a straight segment from (x0, 0) on the ground to (0, y0) on the wall — a one-off geometric diagram, not a plotted function, so it bypasses FunctionPlot entirely. */
export function LadderSegment({ x0, y0, color = "var(--color-chart-1)" }: LadderSegmentProps) {
  const { xScale, yScale } = useGraphContext();

  return (
    <line
      x1={xScale(x0)}
      y1={yScale(0)}
      x2={xScale(0)}
      y2={yScale(y0)}
      stroke={color}
      strokeWidth={4}
      strokeLinecap="round"
    />
  );
}
