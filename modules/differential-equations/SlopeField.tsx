"use client";

import { useGraphContext } from "@/graph-engine";
import type { SlopeFieldPoint } from "@/math-engine/differential";

export interface SlopeFieldProps {
  points: SlopeFieldPoint[];
  /** Fixed pixel length for every segment — only the angle encodes the slope, not the length, so steep slopes don't dominate the field visually. */
  length?: number;
}

export function SlopeField({ points, length = 14 }: SlopeFieldProps) {
  const { xScale, yScale } = useGraphContext();
  const dxPerUnit = xScale(1) - xScale(0);
  const dyPerUnit = yScale(1) - yScale(0);

  return (
    <g>
      {points.map((p, i) => {
        const cx = xScale(p.x);
        const cy = yScale(p.y);
        const dirX = dxPerUnit;
        const dirY = dyPerUnit * p.slope;
        const mag = Math.hypot(dirX, dirY) || 1;
        const ux = dirX / mag;
        const uy = dirY / mag;
        const half = length / 2;

        return (
          <line
            key={i}
            x1={cx - ux * half}
            y1={cy - uy * half}
            x2={cx + ux * half}
            y2={cy + uy * half}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}
