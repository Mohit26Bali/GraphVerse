"use client";

import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { useGraphContext } from "./GraphContext";
import { GraphTooltip } from "./GraphTooltip";
import { compileFunction, sampleFunction, type Sampler } from "@/math-engine/evaluate";

export interface FunctionPlotProps {
  expression: string;
  scope?: Record<string, number>;
  color?: string;
  strokeWidth?: number;
  samples?: number;
  /** Sampling strategy; defaults to a uniform sampler. Swap in an adaptive one for sharp/oscillating curves. */
  sampler?: Sampler;
  /** Shown in a floating tooltip while hovering the curve — e.g. "y = 2x - 1". */
  label?: string;
  /** Which variable is swept along the horizontal axis — e.g. "y" to plot f(x0, y) as y varies, holding x0 fixed via scope. Defaults to "x". */
  variable?: string;
}

export function FunctionPlot({
  expression,
  scope,
  color = "var(--color-chart-1)",
  strokeWidth = 2.5,
  samples = 400,
  sampler = sampleFunction,
  label,
  variable = "x",
}: FunctionPlotProps) {
  const { xScale, yScale, xDomain, yDomain, viewport } = useGraphContext();
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const path = useMemo(() => {
    let compiled;
    try {
      compiled = compileFunction(expression, variable);
    } catch {
      return null;
    }

    const points = sampler(compiled, { domain: xDomain, samples, scope });

    // Values far outside the visible range (e.g. near a tan(x) asymptote) get treated as
    // gaps rather than connected — otherwise a pole renders as a false near-vertical spike.
    const ySpan = yDomain[1] - yDomain[0] || 1;
    const yPadding = ySpan * 3;
    const yMin = yDomain[0] - yPadding;
    const yMax = yDomain[1] + yPadding;
    const clipped = points.map((p) => (p.y < yMin || p.y > yMax ? { ...p, y: NaN } : p));

    const generator = d3Line<{ x: number; y: number }>()
      .defined((d) => Number.isFinite(d.y))
      .curve(curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    return generator(clipped);
  }, [expression, scope, xDomain, yDomain, samples, sampler, xScale, yScale, variable]);

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
