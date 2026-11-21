"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TOLERANCE = 0.3;

function randomTarget() {
  const a = [-2, -1.5, -1, 1, 1.5, 2][Math.floor(Math.random() * 6)];
  const h = Math.round((Math.random() * 6 - 3) * 2) / 2;
  const k = Math.round((Math.random() * 6 - 3) * 2) / 2;
  return { a, h, k };
}

export function QuadraticPractice() {
  const [target, setTarget] = useState(() => randomTarget());
  const [guess, setGuess] = useState({ a: 1, h: 0, k: 0 });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const isCorrect =
    Math.abs(guess.a - target.a) <= TOLERANCE &&
    Math.abs(guess.h - target.h) <= TOLERANCE &&
    Math.abs(guess.k - target.k) <= TOLERANCE;

  const nextRound = useCallback(() => {
    setTarget(randomTarget());
    setGuess({ a: 1, h: 0, k: 0 });
    setStatus("playing");
  }, []);

  const update = useCallback(
    (patch: Partial<typeof guess>) => {
      if (status === "correct") return;
      setGuess((prev) => {
        const next = { ...prev, ...patch };
        const correct =
          Math.abs(next.a - target.a) <= TOLERANCE &&
          Math.abs(next.h - target.h) <= TOLERANCE &&
          Math.abs(next.k - target.k) <= TOLERANCE;
        if (correct) {
          setStatus("correct");
          setScore((s) => s + 1);
        }
        return next;
      });
    },
    [status, target],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          <FunctionPlot
            expression="ta*(x-th)^2+tk"
            scope={{ ta: target.a, th: target.h, tk: target.k }}
            color="var(--color-muted-foreground)"
            label="target parabola"
          />
          <FunctionPlot
            expression="a*(x-h)^2+k"
            scope={guess}
            color={isCorrect ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            label={`your parabola, a=${guess.a.toFixed(1)}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Match the dashed parabola</p>
          <p className="mt-1 text-sm text-muted-foreground">Adjust a, h, and k until your curve overlaps it.</p>
        </div>

        {(["a", "h", "k"] as const).map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor={`practice-${key}`}>{key}</Label>
              <span className="font-mono">{guess[key].toFixed(1)}</span>
            </div>
            <Slider
              id={`practice-${key}`}
              min={key === "a" ? -3 : -5}
              max={key === "a" ? 3 : 5}
              step={0.1}
              value={[guess[key]]}
              onValueChange={(v) => update({ [key]: Array.isArray(v) ? v[0] : (v as number) })}
              disabled={status === "correct"}
            />
          </div>
        ))}

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Matched — a={target.a}, h={target.h}, k={target.k}. a sets how steep and which way it opens,
            while (h, k) is the vertex itself — get all three and the whole curve lines up.
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
