"use client";

import { useMemo } from "react";
import { useGraphContext, Point } from "@/graph-engine";
import { compileFunction } from "@/math-engine/evaluate";
import { findTurningPoints } from "@/math-engine/analysis";

export interface TurningPointsProps {
  expression: string;
  scope?: Record<string, number>;
}

export function TurningPoints({ expression, scope }: TurningPointsProps) {
  const { xDomain } = useGraphContext();

  const points = useMemo(() => {
    try {
      const fn = compileFunction(expression);
      return findTurningPoints(fn, { domain: xDomain, samples: 600, scope });
    } catch {
      return [];
    }
  }, [expression, scope, xDomain]);

  return (
    <>
      {points.map((p) => (
        <Point
          key={`${p.type}-${p.x.toFixed(3)}`}
          x={p.x}
          y={p.y}
          radius={4}
          color={p.type === "max" ? "var(--color-chart-5)" : "var(--color-chart-4)"}
          tooltip={`local ${p.type} at (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`}
        />
      ))}
    </>
  );
}
