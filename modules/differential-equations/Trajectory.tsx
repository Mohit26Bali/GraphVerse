"use client";

import { useMemo } from "react";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { useGraphContext } from "@/graph-engine";
import type { TrajectoryPoint } from "@/math-engine/differential";

export interface TrajectoryProps {
  points: TrajectoryPoint[];
  color?: string;
  strokeWidth?: number;
}

/** Plots a precomputed RK4 solution curve — no closed-form expression exists to hand FunctionPlot here. */
export function Trajectory({ points, color = "var(--color-chart-4)", strokeWidth = 2.5 }: TrajectoryProps) {
  const { xScale, yScale, viewport } = useGraphContext();

  const path = useMemo(() => {
    if (points.length < 2) return null;
    const generator = d3Line<TrajectoryPoint>()
      .curve(curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));
    return generator(points);
  }, [points, xScale, yScale]);

  if (!path || viewport.width === 0) return null;

  return (
    <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  );
}
