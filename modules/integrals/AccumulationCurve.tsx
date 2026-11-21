"use client";

import { useMemo } from "react";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { useGraphContext } from "@/graph-engine";
import type { AccumulationPoint } from "@/math-engine/integral";

export interface AccumulationCurveProps {
  points: AccumulationPoint[];
  /** Only draw points up to this x — for the "accumulator grows" progressive reveal. */
  upTo?: number;
  color?: string;
  strokeWidth?: number;
}

/** Plots a precomputed A(x) lookup table (from accumulationSamples) as a curve — there's no closed-form expression to hand FunctionPlot here. */
export function AccumulationCurve({ points, upTo, color = "var(--color-chart-4)", strokeWidth = 2.5 }: AccumulationCurveProps) {
  const { xScale, yScale, viewport } = useGraphContext();

  const path = useMemo(() => {
    const visible = upTo === undefined ? points : points.filter((p) => p.x <= upTo);
    if (visible.length < 2) return null;

    const generator = d3Line<AccumulationPoint>()
      .curve(curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    return generator(visible);
  }, [points, upTo, xScale, yScale]);

  if (!path || viewport.width === 0) return null;

  return (
    <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  );
}
