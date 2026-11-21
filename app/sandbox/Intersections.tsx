"use client";

import { useMemo } from "react";
import { useGraphContext, Point } from "@/graph-engine";
import { findFunctionIntersections, findVerticalIntersection } from "@/math-engine/intersections";
import type { ParsedEquation } from "@/math-engine/parseEquation";

export interface SandboxItem {
  id: string;
  parsed: ParsedEquation;
}

/**
 * Computes intersections for every pair of plotted items and marks them. Only function×function
 * (via the difference-expression root-finder) and function×vertical-line (a single evaluation)
 * are handled — implicit curves are deliberately skipped here, since curve-vs-curve intersection
 * is a meaningfully harder problem than root-finding a 1D difference.
 */
export function Intersections({ items }: { items: SandboxItem[] }) {
  const { xDomain } = useGraphContext();

  const points = useMemo(() => {
    const results: { key: string; x: number; y: number }[] = [];

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];

        if (a.parsed.kind === "function" && b.parsed.kind === "function") {
          findFunctionIntersections(a.parsed.expression, b.parsed.expression, xDomain).forEach((p, k) =>
            results.push({ key: `${a.id}-${b.id}-${k}`, ...p }),
          );
        } else if (a.parsed.kind === "function" && b.parsed.kind === "vertical") {
          const hit = findVerticalIntersection(a.parsed.expression, b.parsed.x);
          if (hit) results.push({ key: `${a.id}-${b.id}`, ...hit });
        } else if (a.parsed.kind === "vertical" && b.parsed.kind === "function") {
          const hit = findVerticalIntersection(b.parsed.expression, a.parsed.x);
          if (hit) results.push({ key: `${a.id}-${b.id}`, ...hit });
        }
      }
    }

    return results;
  }, [items, xDomain]);

  return (
    <>
      {points.map((p) => (
        <Point
          key={p.key}
          x={p.x}
          y={p.y}
          radius={4}
          color="var(--color-foreground)"
          tooltip={`intersection (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`}
        />
      ))}
    </>
  );
}
