"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { riemannRectangles, riemannSum } from "@/math-engine/integral";
import { RiemannBars } from "./RiemannBars";

const TOLERANCE_RATIO = 0.15;

function randomRound() {
  const fn = BASE_FUNCTIONS[Math.floor(Math.random() * BASE_FUNCTIONS.length)];
  const domainOptions: [number, number][] = [
    [-3, 3],
    [-2, 2],
    [0, 4],
    [-4, 0],
    [1, 4],
  ];
  const domain = domainOptions[Math.floor(Math.random() * domainOptions.length)];
  return { fn, domain };
}

export function IntegralPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [guess, setGuess] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const compiled = useMemo(() => compileFunction(round.fn.raw), [round]);
  const exactRects = useMemo(() => riemannRectangles(compiled, round.domain, 2000, "midpoint"), [compiled, round]);
  const exactArea = useMemo(() => riemannSum(exactRects), [exactRects]);
  const visibleRects = useMemo(() => riemannRectangles(compiled, round.domain, 40, "midpoint"), [compiled, round]);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setGuess(0);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setGuess(value);
      const tol = Math.max(Math.abs(exactArea) * TOLERANCE_RATIO, 0.3);
      if (Math.abs(value - exactArea) <= tol) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, exactArea],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-5, 5]} initialYDomain={[-4, 4]}>
          {status === "correct" && <RiemannBars rects={visibleRects} />}
          <FunctionPlot expression={round.fn.raw} color="var(--color-chart-2)" strokeWidth={2} />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimate the net area</p>
          <p className="mt-1 font-mono text-sm">f(x) = {round.fn.raw}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            What&apos;s the net area from x = {round.domain[0]} to x = {round.domain[1]}?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Your guess</Label>
            <span className="font-mono">{guess.toFixed(1)}</span>
          </div>
          <Slider
            min={-15}
            max={15}
            step={0.1}
            value={[guess]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Close enough — the net area is about {exactArea.toFixed(2)}. Area below the x-axis counts as
            negative, so this is the positive region minus the negative one, not the total shaded space.
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
