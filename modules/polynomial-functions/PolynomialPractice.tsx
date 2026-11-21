"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point, type DataPoint } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { polynomialTemplate, polynomialScope, type RootFactor } from "@/math-engine/polynomial";

const TOLERANCE = 0.7;

function randomFactors(): RootFactor[] {
  const count = 2 + Math.floor(Math.random() * 2); // 2 or 3 distinct roots
  const used = new Set<number>();
  const factors: RootFactor[] = [];
  while (factors.length < count) {
    const root = Math.round((Math.random() * 10 - 5) * 2) / 2;
    if (used.has(root)) continue;
    used.add(root);
    const multiplicity = Math.random() < 0.25 ? 2 : 1;
    factors.push({ id: crypto.randomUUID(), root, multiplicity });
  }
  return factors;
}

export function PolynomialPractice() {
  const [factors, setFactors] = useState<RootFactor[]>(() => randomFactors());
  const [found, setFound] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState<DataPoint[]>([]);
  const [score, setScore] = useState(0);

  const expression = useMemo(() => polynomialTemplate(factors), [factors]);
  const scope = useMemo(() => polynomialScope(1, factors), [factors]);
  const allFound = found.size === factors.length;

  const nextRound = useCallback(() => {
    setFactors(randomFactors());
    setFound(new Set());
    setMisses([]);
  }, []);

  const handleClick = useCallback(
    (point: DataPoint) => {
      if (allFound) return;
      const hit = factors.find(
        (f) => !found.has(f.id) && Math.hypot(point.x - f.root, point.y) <= TOLERANCE,
      );
      if (hit) {
        setFound((prev) => {
          const next = new Set(prev);
          next.add(hit.id);
          return next;
        });
        setScore((s) => s + 1);
        setMisses([]);
      } else {
        setMisses((prev) => [...prev, point]);
      }
    },
    [allFound, factors, found],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas onCanvasClick={handleClick}>
          <FunctionPlot expression={expression} scope={scope} />
          {factors.map((f) =>
            found.has(f.id) ? (
              <Point
                key={f.id}
                x={f.root}
                y={0}
                color="var(--color-chart-1)"
                radius={6}
                tooltip={`root x = ${f.root.toFixed(1)} (multiplicity ${f.multiplicity})`}
              />
            ) : null,
          )}
          {misses.map((m, i) => (
            <Point key={i} x={m.x} y={m.y} color="var(--color-destructive)" radius={3} />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-72 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Locate the roots</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click on the curve where it crosses (or touches) the x-axis.
          </p>
        </div>

        <p className="text-sm">
          Found <span className="font-mono text-foreground">{found.size}</span> of{" "}
          <span className="font-mono text-foreground">{factors.length}</span>
        </p>

        {allFound && (
          <p className="text-sm text-chart-1">
            All roots found — each one is exactly where the curve&apos;s height is zero, the only place a
            graph can cross or touch the x-axis.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span>
          </p>
          <Button onClick={nextRound} disabled={!allFound}>
            Next polynomial
          </Button>
        </div>
      </aside>
    </div>
  );
}
