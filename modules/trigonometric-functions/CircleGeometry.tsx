"use client";

import { useState } from "react";
import { useGraphContext, GraphTooltip } from "@/graph-engine";

export interface CircleGeometryProps {
  /** Effective angle B*(theta-C), in radians. */
  angle: number;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function CircleGeometry({ angle }: CircleGeometryProps) {
  const { xScale, yScale } = useGraphContext();
  const [hovered, setHovered] = useState(false);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const originX = xScale(0);
  const originY = yScale(0);
  const pointX = xScale(cos);
  const pointY = yScale(sin);
  const radiusPx = Math.abs(xScale(1) - xScale(0));

  return (
    <g>
      <circle cx={originX} cy={originY} r={radiusPx} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
      <line
        x1={pointX}
        y1={originY}
        x2={pointX}
        y2={pointY}
        stroke="var(--color-chart-1)"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <line
        x1={originX}
        y1={pointY}
        x2={pointX}
        y2={pointY}
        stroke="var(--color-chart-4)"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <line x1={originX} y1={originY} x2={pointX} y2={pointY} stroke="var(--color-chart-2)" strokeWidth={2} />
      <circle cx={pointX} cy={pointY} r={5} fill="var(--color-chart-2)" stroke="var(--color-background)" strokeWidth={1.5} />
      <circle
        cx={pointX}
        cy={pointY}
        r={12}
        fill="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer" }}
      />
      {hovered && (
        <GraphTooltip x={pointX} y={pointY}>
          angle = {round(angle)} rad · ({round(cos)}, {round(sin)})
        </GraphTooltip>
      )}
    </g>
  );
}
