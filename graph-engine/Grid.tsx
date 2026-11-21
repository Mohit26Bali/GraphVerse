"use client";

import { useMemo } from "react";
import { useGraphContext } from "./GraphContext";
import { niceStep } from "./ticks";

export function Grid() {
  const { xScale, yScale, xDomain, yDomain, viewport } = useGraphContext();

  const xTicks = useMemo(() => {
    const step = niceStep(xDomain, viewport.width);
    const start = Math.ceil(xDomain[0] / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= xDomain[1]; v += step) ticks.push(v);
    return ticks;
  }, [xDomain, viewport.width]);

  const yTicks = useMemo(() => {
    const step = niceStep(yDomain, viewport.height);
    const start = Math.ceil(yDomain[0] / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= yDomain[1]; v += step) ticks.push(v);
    return ticks;
  }, [yDomain, viewport.height]);

  return (
    <g className="pointer-events-none">
      {xTicks.map((tick) => (
        <line
          key={`grid-x-${tick}`}
          x1={xScale(tick)}
          x2={xScale(tick)}
          y1={0}
          y2={viewport.height}
          className="stroke-border"
          strokeWidth={Math.abs(tick) < 1e-9 ? 0 : 1}
        />
      ))}
      {yTicks.map((tick) => (
        <line
          key={`grid-y-${tick}`}
          y1={yScale(tick)}
          y2={yScale(tick)}
          x1={0}
          x2={viewport.width}
          className="stroke-border"
          strokeWidth={Math.abs(tick) < 1e-9 ? 0 : 1}
        />
      ))}
    </g>
  );
}
