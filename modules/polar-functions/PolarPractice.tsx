"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, ParametricPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { POLAR_CURVES, polarDefaultParams, toCartesianExpressions } from "@/math-engine/polar";

const TOLERANCE_RATIO = 0.12;

function randomCurve() {
  return POLAR_CURVES[Math.floor(Math.random() * POLAR_CURVES.length)];
}

function randomizeParams(curve: (typeof POLAR_CURVES)[number]): Record<string, number> {
  return Object.fromEntries(
    curve.params.map((p) => {
      const steps = Math.round((p.max - p.min) / p.step);
      const value = p.min + p.step * Math.round(Math.random() * steps);
      return [p.key, value];
    }),
  );
}

export function PolarPractice() {
  const [curve, setCurve] = useState(() => randomCurve());
  const [target, setTarget] = useState(() => randomizeParams(curve));
  const [guess, setGuess] = useState<Record<string, number>>(() => polarDefaultParams(curve));
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const { xExpression, yExpression } = toCartesianExpressions(curve.rExpression);

  const isMatch = useCallback(
    (g: Record<string, number>) =>
      curve.params.every((p) => {
        const tolerance = Math.max((p.max - p.min) * TOLERANCE_RATIO, p.step);
        return Math.abs((g[p.key] ?? 0) - (target[p.key] ?? 0)) <= tolerance;
      }),
    [curve, target],
  );

  const nextRound = useCallback(() => {
    const next = randomCurve();
    setCurve(next);
    setTarget(randomizeParams(next));
    setGuess(polarDefaultParams(next));
    setStatus("playing");
  }, []);

  const update = useCallback(
    (key: string, value: number) => {
      if (status === "correct") return;
      setGuess((prev) => {
        const next = { ...prev, [key]: value };
        if (isMatch(next)) {
          setStatus("correct");
          setScore((s) => s + 1);
        }
        return next;
      });
    },
    [status, isMatch],
  );

  const tDomain = useMemo<[number, number]>(
    () => [0, Math.max(curve.tMax(target), curve.tMax(guess))],
    [curve, target, guess],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-10, 10]} initialYDomain={[-10, 10]}>
          <ParametricPlot
            xExpression={xExpression}
            yExpression={yExpression}
            scope={target}
            tDomain={tDomain}
            color="var(--color-muted-foreground)"
            label="target"
          />
          <ParametricPlot
            xExpression={xExpression}
            yExpression={yExpression}
            scope={guess}
            tDomain={tDomain}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            label="your curve"
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Match the {curve.label.toLowerCase()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust the parameters until your curve overlaps the target.
          </p>
        </div>

        {curve.params.map((p) => (
          <div key={p.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <Label>{p.label}</Label>
              <span className="font-mono">{guess[p.key]?.toFixed(2)}</span>
            </div>
            <Slider
              min={p.min}
              max={p.max}
              step={p.step}
              value={[guess[p.key] ?? p.default]}
              onValueChange={(v) => update(p.key, Array.isArray(v) ? v[0] : (v as number))}
              disabled={status === "correct"}
            />
          </div>
        ))}

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Matched — r(θ) sets the distance from the origin at each angle. Get that formula right and the
            shape traces identically at every angle, petal for petal.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span>
          </p>
          <Button onClick={nextRound} disabled={status !== "correct"}>
            Next target
          </Button>
        </div>
      </aside>
    </div>
  );
}
