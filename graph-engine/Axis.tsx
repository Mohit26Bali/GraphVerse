"use client";

import { useMemo } from "react";
import { useGraphContext } from "./GraphContext";
import { niceStep } from "./ticks";

export function Axis() {
  const { xScale, yScale, xDomain, yDomain, viewport } = useGraphContext();

  const originX = xScale(0);
  const originY = yScale(0);
  const axisOnScreen = {
    x: originX >= 0 && originX <= viewport.width,
    y: originY >= 0 && originY <= viewport.height,
  };

  const xTicks = useMemo(() => {
    const step = niceStep(xDomain, viewport.width);
    const start = Math.ceil(xDomain[0] / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= xDomain[1]; v += step) {
      if (Math.abs(v) > 1e-9) ticks.push(v);
    }
    return ticks;
  }, [xDomain, viewport.width]);

  const yTicks = useMemo(() => {
    const step = niceStep(yDomain, viewport.height);
    const start = Math.ceil(yDomain[0] / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= yDomain[1]; v += step) {
      if (Math.abs(v) > 1e-9) ticks.push(v);
    }
    return ticks;
  }, [yDomain, viewport.height]);

  return (
    <g>
      {axisOnScreen.y && (
        <line
          x1={0}
          x2={viewport.width}
          y1={originY}
          y2={originY}
          className="stroke-foreground/60"
          strokeWidth={1.5}
        />
      )}
      {axisOnScreen.x && (
        <line
          x1={originX}
          x2={originX}
          y1={0}
          y2={viewport.height}
          className="stroke-foreground/60"
          strokeWidth={1.5}
        />
      )}

      {axisOnScreen.y &&
        xTicks.map((tick) => (
          <text
            key={`x-label-${tick}`}
            x={xScale(tick)}
            y={originY + 14}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] font-mono"
          >
            {tick}
          </text>
        ))}
      {axisOnScreen.x &&
        yTicks.map((tick) => (
          <text
            key={`y-label-${tick}`}
            x={originX + 6}
            y={yScale(tick) + 3}
            textAnchor="start"
            className="fill-muted-foreground text-[10px] font-mono"
          >
            {tick}
          </text>
        ))}
    </g>
  );
}
