"use client";

import { useState } from "react";
import { useGraphContext } from "./GraphContext";
import { GraphTooltip } from "./GraphTooltip";

export interface PointProps {
  x: number;
  y: number;
  color?: string;
  radius?: number;
  label?: string;
  /** Shown in a floating tooltip on hover — e.g. "vertex (2, -3)". */
  tooltip?: string;
  /** False draws a hollow (open) circle — the standard convention for an excluded endpoint / discontinuity. */
  filled?: boolean;
}

export function Point({ x, y, color = "var(--color-chart-1)", radius = 5, label, tooltip, filled = true }: PointProps) {
  const { xScale, yScale } = useGraphContext();
  const [hovered, setHovered] = useState(false);
  const cx = xScale(x);
  const cy = yScale(y);

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={filled ? color : "var(--color-background)"}
        stroke={filled ? "var(--color-background)" : color}
        strokeWidth={filled ? 1.5 : 2}
      />
      {tooltip && (
        <circle
          cx={cx}
          cy={cy}
          r={Math.max(radius, 10)}
          fill="transparent"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ cursor: "pointer" }}
        />
      )}
      {label && (
        <text
          x={cx + radius + 4}
          y={cy - radius - 2}
          className="fill-foreground text-xs font-mono"
        >
          {label}
        </text>
      )}
      {hovered && tooltip && <GraphTooltip x={cx} y={cy}>{tooltip}</GraphTooltip>}
    </g>
  );
}
