"use client";

import { useState } from "react";
import { useGraphContext } from "./GraphContext";
import { GraphTooltip } from "./GraphTooltip";

export interface ReferenceLineProps {
  orientation: "vertical" | "horizontal";
  /** x value (vertical) or y value (horizontal) the line sits at. */
  at: number;
  color?: string;
  label?: string;
  dashed?: boolean;
  strokeWidth?: number;
  /** Shown in a floating tooltip on hover — e.g. "x = 3". */
  tooltip?: string;
}

export function ReferenceLine({
  orientation,
  at,
  color = "var(--color-muted-foreground)",
  label,
  dashed = true,
  strokeWidth = 1.5,
  tooltip,
}: ReferenceLineProps) {
  const { xScale, yScale, viewport } = useGraphContext();
  const [hovered, setHovered] = useState(false);

  const isVertical = orientation === "vertical";
  const pos = isVertical ? xScale(at) : yScale(at);

  return (
    <g>
      <line
        x1={isVertical ? pos : 0}
        x2={isVertical ? pos : viewport.width}
        y1={isVertical ? 0 : pos}
        y2={isVertical ? viewport.height : pos}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? "5 4" : undefined}
      />
      {tooltip && (
        <line
          x1={isVertical ? pos : 0}
          x2={isVertical ? pos : viewport.width}
          y1={isVertical ? 0 : pos}
          y2={isVertical ? viewport.height : pos}
          stroke="transparent"
          strokeWidth={14}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ cursor: "pointer" }}
        />
      )}
      {label && (
        <text
          x={isVertical ? pos + 6 : viewport.width - 6}
          y={isVertical ? 14 : pos - 6}
          textAnchor={isVertical ? "start" : "end"}
          className="fill-muted-foreground text-xs font-mono"
        >
          {label}
        </text>
      )}
      {hovered && tooltip && (
        <GraphTooltip x={isVertical ? pos : viewport.width / 2} y={isVertical ? viewport.height / 2 : pos}>
          {tooltip}
        </GraphTooltip>
      )}
    </g>
  );
}
