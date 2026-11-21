"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { checkOneToOne } from "@/math-engine/inverse";

// sin(x) is excluded: against a fixed right edge, no left-boundary choice makes it genuinely
// one-to-one (it still contains multiple oscillations past x≈1.57) — verified numerically.
const CANDIDATES = BASE_FUNCTIONS.filter((f) => ["quadratic", "abs"].includes(f.id));
const FULL_DOMAIN: [number, number] = [-6, 6];
// Require restricting at least this much of the domain, so the slider can't "win" by shrinking
// to a near-empty sliver near the right edge — verified that trivially passes for any function.
const MIN_SPAN = 3;
const MAX_BOUNDARY = FULL_DOMAIN[1] - MIN_SPAN;

function randomFn() {
  return CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)];
}

export function InversePractice() {
  const [fn, setFn] = useState(() => randomFn());
  const [boundary, setBoundary] = useState(-3);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const result = useMemo(() => {
    const compiled = compileFunction(fn.raw);
    return checkOneToOne(compiled, [boundary, FULL_DOMAIN[1]]);
  }, [fn, boundary]);

  const nextRound = useCallback(() => {
    setFn(randomFn());
    setBoundary(-3);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setBoundary(value);
      const compiled = compileFunction(fn.raw);
      if (checkOneToOne(compiled, [value, FULL_DOMAIN[1]]).isOneToOne) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, fn],
  );

  const restrictedExpression = `(x >= ${boundary}) ? (${fn.raw}) : NaN`;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={FULL_DOMAIN} initialYDomain={[-4, 6]}>
          <FunctionPlot expression={fn.raw} color="var(--color-muted-foreground)" strokeWidth={1.5} />
          <FunctionPlot
            expression={restrictedExpression}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            strokeWidth={3}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Make it invertible</p>
          <p className="mt-1 font-mono text-sm">f(x) = {fn.raw}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag the left boundary until the highlighted portion passes the horizontal line test.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Restrict to x ≥</Label>
            <span className="font-mono">{boundary.toFixed(1)}</span>
          </div>
          <Slider
            min={FULL_DOMAIN[0]}
            max={MAX_BOUNDARY}
            step={0.1}
            value={[boundary]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        <p className={`text-sm ${result.isOneToOne ? "text-chart-1" : "text-muted-foreground"}`}>
          {result.isOneToOne
            ? "One-to-one — this restriction works. No two x-values in this range now share the same y, so a true inverse function exists here."
            : "Still not one-to-one — two different x-values in this range still produce the same y, so it fails the horizontal line test."}
        </p>

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span>
          </p>
          <Button onClick={nextRound} disabled={status !== "correct"}>
            Next function
          </Button>
        </div>
      </aside>
    </div>
  );
}
