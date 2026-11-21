"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { composeExpressions } from "@/math-engine/composition";
import { CompositionMachine } from "./CompositionMachine";

const TOLERANCE = 0.4;

function randomRound() {
  const f = BASE_FUNCTIONS[Math.floor(Math.random() * BASE_FUNCTIONS.length)];
  let g = BASE_FUNCTIONS[Math.floor(Math.random() * BASE_FUNCTIONS.length)];
  if (g.id === f.id) g = BASE_FUNCTIONS[(BASE_FUNCTIONS.indexOf(f) + 1) % BASE_FUNCTIONS.length];
  const x0 = Math.round((Math.random() * 4 - 2) * 2) / 2;
  return { f, g, x0 };
}

export function CompositionPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [guess, setGuess] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const composed = useMemo(() => composeExpressions(round.g.raw, round.f.raw), [round]);
  const fx0 = compileFunction(round.f.raw).evaluate(round.x0);
  const gfx0 = compileFunction(round.g.raw).evaluate(fx0);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setGuess(0);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setGuess(value);
      if (Number.isFinite(gfx0) && Math.abs(value - gfx0) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, gfx0],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-6 py-5">
          <CompositionMachine
            x0={round.x0}
            fLabel="f"
            gLabel="g"
            fValue={fx0}
            gValue={gfx0}
            progress={status === "correct" ? 1 : 0.5}
          />
        </div>
        <div className="min-h-0 flex-1">
          <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-6, 6]}>
            <FunctionPlot expression={composed} color="var(--color-muted-foreground)" />
            {status === "correct" && (
              <Point x={round.x0} y={gfx0} color="var(--color-chart-1)" radius={6} tooltip={`g(f(x)) = ${gfx0.toFixed(2)}`} />
            )}
            <Point x={round.x0} y={guess} color="var(--color-chart-4)" radius={5} tooltip={`your guess: ${guess.toFixed(1)}`} />
          </GraphCanvas>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimate the output</p>
          <p className="mt-1 font-mono text-sm">
            f(x) = {round.f.raw}, g(x) = {round.g.raw}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">What is g(f({round.x0}))?</p>
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
            Correct — g(f({round.x0})) = {gfx0.toFixed(2)}. f runs first, and its output becomes g&apos;s
            input — that order is why g(f(x)) usually differs from f(g(x)).
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
