"use client";

import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { useGraphContext } from "./GraphContext";
import { GraphTooltip } from "./GraphTooltip";
import { compileFunction } from "@/math-engine/evaluate";

export interface ParametricPlotProps {
  /** Expression for x, in terms of t. */
  xExpression: string;
  /** Expression for y, in terms of t. */
  yExpression: string;
  scope?: Record<string, number>;
  tDomain: [number, number];
  samples?: number;
  color?: string;
  strokeWidth?: number;
  /** Shown in a floating tooltip while hovering the curve. */
  label?: string;
}

export function ParametricPlot({
  xExpression,
  yExpression,
  scope,
  tDomain,
  samples = 500,
  color = "var(--color-chart-1)",
  strokeWidth = 2.5,
  label,
}: ParametricPlotProps) {
  const { xScale, yScale, viewport } = useGraphContext();
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const path = useMemo(() => {
    let xFn, yFn;
    try {
      xFn = compileFunction(xExpression, "t");
      yFn = compileFunction(yExpression, "t");
    } catch {
      return null;
    }

    const [start, end] = tDomain;
    const step = (end - start) / Math.max(samples - 1, 1);
    const points: { x: number; y: number }[] = new Array(samples);

    for (let i = 0; i < samples; i++) {
      const t = start + i * step;
      let x: number;
      let y: number;
      try {
        x = xFn.evaluate(t, scope);
        y = yFn.evaluate(t, scope);
      } catch {
        x = NaN;
        y = NaN;
      }
      points[i] = { x: Number.isFinite(x) ? x : NaN, y: Number.isFinite(y) ? y : NaN };
    }

    const generator = d3Line<{ x: number; y: number }>()
      .defined((d) => Number.isFinite(d.x) && Number.isFinite(d.y))
      .curve(curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    return generator(points);
  }, [xExpression, yExpression, scope, tDomain, samples, xScale, yScale]);

  if (!path || viewport.width === 0) return null;

  const handleHover = (event: ReactMouseEvent<SVGPathElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setHoverPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {label && (
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={14}
          onMouseEnter={handleHover}
          onMouseMove={handleHover}
          onMouseLeave={() => setHoverPos(null)}
          style={{ cursor: "pointer" }}
        />
      )}
      {label && hoverPos && (
        <GraphTooltip x={hoverPos.x} y={hoverPos.y}>
          {label}
        </GraphTooltip>
      )}
    </g>
  );
}
