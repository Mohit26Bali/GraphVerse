"use client";

import { useGraphContext } from "@/graph-engine";
import type { RiemannRect } from "@/math-engine/integral";

export interface RiemannBarsProps {
  rects: RiemannRect[];
}

/** Draws each Riemann rectangle from the x-axis to its sampled height — green above the axis (positive area), red below (negative, subtracted from the net total). */
export function RiemannBars({ rects }: RiemannBarsProps) {
  const { xScale, yScale } = useGraphContext();
  const zeroY = yScale(0);

  return (
    <g>
      {rects.map((r) => {
        const x0 = xScale(r.x0);
        const x1 = xScale(r.x1);
        const y = yScale(r.height);
        const top = Math.min(y, zeroY);
        const height = Math.abs(y - zeroY);
        const positive = r.height >= 0;

        return (
          <rect
            key={`${r.x0}-${r.x1}`}
            x={Math.min(x0, x1)}
            y={top}
            width={Math.abs(x1 - x0)}
            height={height}
            fill={positive ? "var(--color-chart-1)" : "var(--color-destructive)"}
            fillOpacity={0.35}
            stroke={positive ? "var(--color-chart-1)" : "var(--color-destructive)"}
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
}
