"use client";

import { useGraphContext } from "@/graph-engine";
import { epicycleTips } from "@/math-engine/fourier";
import type { Harmonic } from "@/math-engine/fourier";

export interface EpicycleChainProps {
  harmonics: Harmonic[];
  t: number;
}

/** Draws the classic chain of rotating circles, tip to tail — the last tip's y-coordinate is exactly the reconstructed signal at this instant. */
export function EpicycleChain({ harmonics, t }: EpicycleChainProps) {
  const { xScale, yScale } = useGraphContext();
  const tips = epicycleTips(harmonics, t);

  return (
    <g>
      {harmonics.map((h, i) => {
        const center = tips[i];
        const tip = tips[i + 1];
        const radiusPx = Math.abs(xScale(Math.abs(h.amplitude)) - xScale(0));
        return (
          <g key={h.k}>
            <circle
              cx={xScale(center.x)}
              cy={yScale(center.y)}
              r={radiusPx}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <line
              x1={xScale(center.x)}
              y1={yScale(center.y)}
              x2={xScale(tip.x)}
              y2={yScale(tip.y)}
              stroke="var(--color-chart-2)"
              strokeWidth={1.5}
            />
          </g>
        );
      })}
      {tips.slice(1).map((tip, i) => (
        <circle key={i} cx={xScale(tip.x)} cy={yScale(tip.y)} r={2} fill="var(--color-chart-2)" />
      ))}
      <circle
        cx={xScale(tips[tips.length - 1].x)}
        cy={yScale(tips[tips.length - 1].y)}
        r={5}
        fill="var(--color-chart-4)"
        stroke="var(--color-background)"
        strokeWidth={1.5}
      />
    </g>
  );
}
