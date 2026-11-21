"use client";

import type { ReactNode } from "react";

export interface GraphTooltipProps {
  /** SVG-local pixel coordinates (same space as xScale/yScale output). */
  x: number;
  y: number;
  children: ReactNode;
}

/** Floating label anchored to a point in the SVG, rendered as real HTML via foreignObject so it can share the app's styling. */
export function GraphTooltip({ x, y, children }: GraphTooltipProps) {
  return (
    <foreignObject
      x={x - 100}
      y={y - 40}
      width={200}
      height={32}
      style={{ overflow: "visible", pointerEvents: "none" }}
    >
      <div className="flex justify-center">
        <div className="w-max max-w-[220px] rounded-md border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md">
          {children}
        </div>
      </div>
    </foreignObject>
  );
}
