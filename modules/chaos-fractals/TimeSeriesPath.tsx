"use client";

import { useMemo } from "react";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { useGraphContext } from "@/graph-engine";

export interface TimeSeriesPathProps {
  values: number[];
  color?: string;
  strokeWidth?: number;
}

export function TimeSeriesPath({ values, color = "var(--color-chart-2)", strokeWidth = 2 }: TimeSeriesPathProps) {
  const { xScale, yScale, viewport } = useGraphContext();

  const path = useMemo(() => {
    if (values.length < 2) return null;
    const points = values.map((y, n) => ({ x: n, y }));
    const generator = d3Line<{ x: number; y: number }>()
      .curve(curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));
    return generator(points);
  }, [values, xScale, yScale]);

  if (!path || viewport.width === 0) return null;

  return (
    <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  );
}
