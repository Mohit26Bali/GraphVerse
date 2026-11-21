"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { transformTemplate, type TransformParams } from "@/math-engine/transform";
import { IDENTITY } from "./stages";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";

const TOLERANCE = 0.3;

function randomTarget(): TransformParams {
  const a = [-2, -1.5, 1, 1.5, 2][Math.floor(Math.random() * 5)];
  const b = [0.5, 1, 1.5, 2][Math.floor(Math.random() * 4)];
  const h = Math.round((Math.random() * 8 - 4) * 2) / 2;
  const k = Math.round((Math.random() * 6 - 3) * 2) / 2;
  return { a, b, h, k };
}

function randomBase() {
  return BASE_FUNCTIONS[Math.floor(Math.random() * BASE_FUNCTIONS.length)];
}

export function TransformationsPractice() {
  const [base, setBase] = useState(() => randomBase());
  const [target, setTarget] = useState<TransformParams>(() => randomTarget());
  const [guess, setGuess] = useState<TransformParams>(IDENTITY);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const expression = transformTemplate(base.raw);

  const isMatch = useCallback(
    (g: TransformParams) =>
      Math.abs(g.a - target.a) <= TOLERANCE &&
      Math.abs(g.b - target.b) <= TOLERANCE &&
      Math.abs(g.h - target.h) <= TOLERANCE &&
      Math.abs(g.k - target.k) <= TOLERANCE,
    [target],
  );

  const nextRound = useCallback(() => {
    setBase(randomBase());
    setTarget(randomTarget());
    setGuess(IDENTITY);
    setStatus("playing");
  }, []);

  const update = useCallback(
    (patch: Partial<Pick<TransformParams, "a" | "b" | "h" | "k">>) => {
      if (status === "correct") return;
      setGuess((prev) => {
        const next = { ...prev, ...patch };
        if (isMatch(next)) {
          setStatus("correct");
          setScore((s) => s + 1);
        }
        return next;
      });
    },
    [status, isMatch],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          <FunctionPlot expression={expression} scope={target} color="var(--color-muted-foreground)" label="target" />
          <FunctionPlot
            expression={expression}
            scope={guess}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            label={`your curve: a=${guess.a.toFixed(1)}, b=${guess.b.toFixed(1)}, h=${guess.h.toFixed(1)}, k=${guess.k.toFixed(1)}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Match the transformed {base.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust a, b, h, and k until your curve overlaps the dashed target.
          </p>
        </div>

        {(["a", "b", "h", "k"] as const).map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor={`practice-${key}`}>{key}</Label>
              <span className="font-mono">{guess[key].toFixed(1)}</span>
            </div>
            <Slider
              id={`practice-${key}`}
              min={key === "a" ? -4 : key === "b" ? -3 : -6}
              max={key === "a" ? 4 : key === "b" ? 3 : 6}
              step={0.1}
              value={[guess[key]]}
              onValueChange={(v) => update({ [key]: Array.isArray(v) ? v[0] : (v as number) })}
              disabled={status === "correct"}
            />
          </div>
        ))}

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Matched — a stretches or reflects vertically, b stretches or reflects horizontally, and (h, k)
            shift the graph. Get all four and you&apos;ve reproduced the exact transformed curve.
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
