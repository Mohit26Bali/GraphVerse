"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { taylorCoefficients, taylorExpression } from "@/math-engine/taylor";
import { ErrorShading } from "./ErrorShading";
import { TAYLOR_PRESETS } from "./presets";

const DOMAIN: [number, number] = [-6, 6];
const MAX_ORDER = 10;
const TARGET_X_OPTIONS = [1.5, 2, 2.5, -2, -1.5];
const TOLERANCE = 0.05;

function randomRound() {
  const preset = TAYLOR_PRESETS[Math.floor(Math.random() * TAYLOR_PRESETS.length)];
  const targetX = TARGET_X_OPTIONS[Math.floor(Math.random() * TARGET_X_OPTIONS.length)];
  return { preset, targetX };
}

export function TaylorPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [order, setOrder] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const terms = useMemo(() => taylorCoefficients(round.preset.raw, 0, MAX_ORDER), [round]);
  const polyExpr = useMemo(() => taylorExpression(terms.slice(0, order + 1), 0), [terms, order]);

  const error = useMemo(() => {
    const f = compileFunction(round.preset.raw);
    const p = compileFunction(polyExpr);
    return Math.abs(f.evaluate(round.targetX) - p.evaluate(round.targetX));
  }, [round, polyExpr]);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setOrder(0);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setOrder(value);
      const f = compileFunction(round.preset.raw);
      const p = compileFunction(taylorExpression(terms.slice(0, value + 1), 0));
      const e = Math.abs(f.evaluate(round.targetX) - p.evaluate(round.targetX));
      if (e <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, round, terms],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-4, 4]}>
          <ErrorShading expressionA={round.preset.raw} expressionB={polyExpr} domain={DOMAIN} />
          <FunctionPlot expression={round.preset.raw} color="var(--color-chart-2)" strokeWidth={2} />
          <FunctionPlot
            expression={polyExpr}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            strokeWidth={2}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Find the smallest degree
          </p>
          <p className="mt-1 font-mono text-sm">f(x) = {round.preset.raw}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Get the approximation within {TOLERANCE} of the true value at x = {round.targetX}.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Degree</Label>
            <span className="font-mono">{order}</span>
          </div>
          <Slider
            min={0}
            max={MAX_ORDER}
            step={1}
            value={[order]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Error at x = {round.targetX}: <span className="font-mono text-foreground">{error.toFixed(4)}</span>
        </p>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Within tolerance at degree {order}. Each added term is one more derivative divided by a
            factorial — more terms tighten the fit near the center, though far from it the polynomial can
            still diverge.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span>
          </p>
          <Button onClick={nextRound} disabled={status !== "correct"}>
            Next
          </Button>
        </div>
      </aside>
    </div>
  );
}
