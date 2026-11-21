"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { symbolicDerivative, tangentAt } from "@/math-engine/derivative";

const TOLERANCE = 0.35;
const DOMAIN: [number, number] = [-5, 5];

function randomRound() {
  const fn = BASE_FUNCTIONS[Math.floor(Math.random() * BASE_FUNCTIONS.length)];
  const x0 = fn.id === "sqrt" ? Math.round(Math.random() * 4 * 2) / 2 + 0.5 : Math.round((Math.random() * 6 - 3) * 2) / 2;
  return { fn, x0 };
}

export function TangentPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [guess, setGuess] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const derivExpr = useMemo(() => symbolicDerivative(round.fn.raw), [round]);
  const compiledF = compileFunction(round.fn.raw);
  const compiledDeriv = compileFunction(derivExpr);
  const tangent = tangentAt(compiledF, compiledDeriv, round.x0);
  const y0 = compiledF.evaluate(round.x0);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setGuess(0);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setGuess(value);
      if (Number.isFinite(tangent.slope) && Math.abs(value - tangent.slope) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, tangent.slope],
  );

  const guessTangent = { m: guess, b: y0 - guess * round.x0 };

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-5, 5]}>
          <FunctionPlot expression={round.fn.raw} color="var(--color-chart-2)" />
          <FunctionPlot
            expression="m*x+b"
            scope={guessTangent}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
          />
          <Point x={round.x0} y={y0} color="var(--color-chart-2)" radius={5} />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimate the slope</p>
          <p className="mt-1 font-mono text-sm">f(x) = {round.fn.raw}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            What&apos;s the slope of the tangent at x = {round.x0}?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Your guess</Label>
            <span className="font-mono">{guess.toFixed(1)}</span>
          </div>
          <Slider
            min={-6}
            max={6}
            step={0.1}
            value={[guess]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Correct — the slope is {tangent.slope.toFixed(2)}. That&apos;s the derivative evaluated at this
            exact x: the instantaneous rate of change, the slope of the curve at that single point.
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
