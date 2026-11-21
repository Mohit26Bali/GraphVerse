"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TOLERANCE = 0.15;

function randomBase(): number {
  const options = [1.5, 2, 2.5, 3, 3.5];
  return options[Math.floor(Math.random() * options.length)];
}

export function LogarithmPractice() {
  const [target, setTarget] = useState(() => randomBase());
  const [guess, setGuess] = useState(2);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const isCorrect = Math.abs(guess - target) <= TOLERANCE;

  const nextRound = useCallback(() => {
    setTarget(randomBase());
    setGuess(2);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setGuess(value);
      if (Math.abs(value - target) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, target],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-4, 4]} initialYDomain={[-4, 4]}>
          <FunctionPlot expression="x" color="var(--color-border)" strokeWidth={1.5} label="y = x" />
          <FunctionPlot expression="tb^x" scope={{ tb: target }} color="var(--color-muted-foreground)" label="target exponential" />
          <FunctionPlot
            expression="log(x,gb)"
            scope={{ gb: guess }}
            color={isCorrect ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            label={`your log, base = ${guess.toFixed(1)}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Find the inverse</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The dashed curve is an exponential. Adjust your log&apos;s base until it becomes its exact mirror across y = x.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Your base</Label>
            <span className="font-mono">{guess.toFixed(1)}</span>
          </div>
          <Slider
            min={1.1}
            max={4}
            step={0.1}
            value={[guess]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Matched &mdash; a log and an exponential are true inverses only when they share the same base,
            which is why matching the base alone was enough to produce the exact mirror image.
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
