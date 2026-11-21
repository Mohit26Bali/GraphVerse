"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point, type DataPoint } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { guardedExpression, findDiscontinuities } from "@/math-engine/piecewise";
import { PRESETS } from "./presets";

const DOMAIN: [number, number] = [-5, 5];
const TOLERANCE = 0.6;

function evaluateAt(expression: string, x: number): number {
  try {
    return compileFunction(expression).evaluate(x);
  } catch {
    return NaN;
  }
}

function randomPreset() {
  const jumpy = PRESETS.filter((p) => p.id !== "abs");
  return jumpy[Math.floor(Math.random() * jumpy.length)];
}

export function PiecewisePractice() {
  const [preset, setPreset] = useState(() => randomPreset());
  const [found, setFound] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState<DataPoint[]>([]);
  const [score, setScore] = useState(0);

  const pieces = useMemo(() => preset.build(DOMAIN), [preset]);
  const jumps = useMemo(() => findDiscontinuities(pieces, evaluateAt), [pieces]);
  const allFound = jumps.length > 0 && found.size === jumps.length;

  const nextRound = useCallback(() => {
    setPreset(randomPreset());
    setFound(new Set());
    setMisses([]);
  }, []);

  const handleClick = useCallback(
    (point: DataPoint) => {
      if (allFound) return;
      const hit = jumps.find(
        (j) => !found.has(j.x) && Math.abs(point.x - j.x) <= TOLERANCE,
      );
      if (hit) {
        setFound((prev) => new Set(prev).add(hit.x));
        setScore((s) => s + 1);
        setMisses([]);
      } else {
        setMisses((prev) => [...prev, point]);
      }
    },
    [allFound, jumps, found],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-3, 6]} onCanvasClick={handleClick}>
          {pieces.map((piece) => (
            <FunctionPlot key={piece.id} expression={guardedExpression(piece)} color="var(--color-chart-1)" />
          ))}
          {jumps
            .filter((j) => found.has(j.x))
            .map((j) => (
              <g key={j.x}>
                <Point x={j.x} y={j.leftValue} color="var(--color-chart-1)" radius={5} filled={j.leftInclusive} />
                <Point x={j.x} y={j.rightValue} color="var(--color-chart-1)" radius={5} filled={j.rightInclusive} />
              </g>
            ))}
          {misses.map((m, i) => (
            <Point key={i} x={m.x} y={m.y} color="var(--color-destructive)" radius={3} />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-72 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Find the jumps</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click on the graph where {preset.label} jumps to a new value.
          </p>
        </div>

        <p className="text-sm">
          Found <span className="font-mono text-foreground">{found.size}</span> of{" "}
          <span className="font-mono text-foreground">{jumps.length}</span>
        </p>

        {allFound && (
          <p className="text-sm text-chart-1">
            All jumps found — each one is where the rule defining the function actually changes; the
            height jumps because the two neighboring pieces don&apos;t agree at that boundary.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span>
          </p>
          <Button onClick={nextRound} disabled={!allFound}>
            Next function
          </Button>
        </div>
      </aside>
    </div>
  );
}
