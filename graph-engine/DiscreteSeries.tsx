"use client";

import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { line as d3Line } from "d3-shape";
import { useGraphContext } from "./GraphContext";
import { GraphTooltip } from "./GraphTooltip";

export interface DiscreteSeriesProps {
  /** Discrete (index, value) pairs — e.g. partial sums S_n, plotted at integer x = n. */
  points: { x: number; y: number }[];
  color?: string;
  radius?: number;
  /** Connect consecutive points with a straight line — off draws a bare scatter (dot plot). */
  showLine?: boolean;
  strokeWidth?: number;
  label?: string;
}

/** Renders a finite set of discrete (x, y) points — no continuous sampling, unlike FunctionPlot. */
export function DiscreteSeries({
  points,
  color = "var(--color-chart-1)",
  radius = 3,
  showLine = true,
  strokeWidth = 2,
  label,
}: DiscreteSeriesProps) {
  const { xScale, yScale, viewport } = useGraphContext();
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const path = useMemo(() => {
    if (!showLine || points.length < 2) return null;
    const generator = d3Line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));
    return generator(points);
  }, [points, showLine, xScale, yScale]);

  if (viewport.width === 0) return null;

  const handleHover = (event: ReactMouseEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setHoverPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <g onMouseEnter={label ? handleHover : undefined} onMouseMove={label ? handleHover : undefined} onMouseLeave={() => setHoverPos(null)}>
      {path && <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} />}
      {points.map((p) => (
        <circle key={p.x} cx={xScale(p.x)} cy={yScale(p.y)} r={radius} fill={color} />
      ))}
      {label && hoverPos && (
        <GraphTooltip x={hoverPos.x} y={hoverPos.y}>
          {label}
        </GraphTooltip>
      )}
    </g>
  );
}
