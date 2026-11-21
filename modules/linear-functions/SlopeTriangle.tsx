"use client";

import { useGraphContext } from "@/graph-engine";

export interface SlopeTriangleProps {
  m: number;
  b: number;
  /** x-coordinate where the triangle's horizontal leg starts. */
  x0?: number;
  /** Width of the horizontal leg, in data units. */
  run?: number;
  color?: string;
}

export function SlopeTriangle({ m, b, x0 = 0, run = 2, color = "var(--color-chart-2)" }: SlopeTriangleProps) {
  const { xScale, yScale } = useGraphContext();

  const y0 = m * x0 + b;
  const x1 = x0 + run;
  const y1 = m * x1 + b;

  const p0 = { x: xScale(x0), y: yScale(y0) };
  const pRun = { x: xScale(x1), y: yScale(y0) };
  const p1 = { x: xScale(x1), y: yScale(y1) };

  return (
    <g>
      <path
        d={`M ${p0.x} ${p0.y} L ${pRun.x} ${pRun.y} L ${p1.x} ${p1.y} Z`}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text
        x={(p0.x + pRun.x) / 2}
        y={p0.y + 16}
        textAnchor="middle"
        className="fill-muted-foreground text-xs font-mono"
      >
        run = {run}
      </text>
      <text
        x={pRun.x + 8}
        y={(pRun.y + p1.y) / 2}
        textAnchor="start"
        className="fill-muted-foreground text-xs font-mono"
      >
        rise = {(m * run).toFixed(2)}
      </text>
    </g>
  );
}
