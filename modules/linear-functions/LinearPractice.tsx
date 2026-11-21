"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TOLERANCE = 0.15;

function randomTarget(): number {
  const options = [-4, -3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3, 4];
  return options[Math.floor(Math.random() * options.length)];
}

export function LinearPractice() {
  const [target, setTarget] = useState(() => randomTarget());
  const [m, setM] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const isCorrect = Math.abs(m - target) <= TOLERANCE;

  const nextRound = useCallback(() => {
    setTarget(randomTarget());
    setM(0);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number | readonly number[]) => {
      if (status === "correct") return;
      const next = Array.isArray(value) ? value[0] : (value as number);
      setM(next);
      if (Math.abs(next - target) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, target],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          <FunctionPlot
            expression="target*x"
            scope={{ target }}
            color="var(--color-muted-foreground)"
            strokeWidth={2}
            label="target line"
          />
          <FunctionPlot
            expression="m*x"
            scope={{ m }}
            color={isCorrect ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            label={`your line, m = ${m.toFixed(1)}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-72 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Match the dashed line&apos;s slope</p>
          <p className="mt-1 text-sm text-muted-foreground">Drag the slider until your line overlaps it.</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="practice-slope">Your slope (m)</Label>
            <span className="font-mono">{m.toFixed(1)}</span>
          </div>
          <Slider
            id="practice-slope"
            min={-5}
            max={5}
            step={0.1}
            value={[m]}
            onValueChange={handleChange}
            disabled={status === "correct"}
          />
        </div>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Matched — the target slope was {target}. Same slope means the line rises (or falls) at the
            same rate per unit of x, so any line with that slope is parallel to it.
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
