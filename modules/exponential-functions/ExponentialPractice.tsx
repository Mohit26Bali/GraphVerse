"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { expTemplate } from "@/math-engine/exponential";

interface Params {
  A: number;
  b: number;
  k: number;
  [key: string]: number;
}

const TOLERANCE = 0.25;
const IDENTITY: Params = { A: 1, b: 1.5, k: 0 };

function randomTarget(): Params {
  const A = [0.5, 1, 1.5, 2][Math.floor(Math.random() * 4)];
  const b = [0.3, 0.5, 0.7, 1.3, 1.6, 2, 2.5][Math.floor(Math.random() * 7)];
  const k = Math.round((Math.random() * 4 - 2) * 2) / 2;
  return { A, b, k };
}

export function ExponentialPractice() {
  const [target, setTarget] = useState<Params>(() => randomTarget());
  const [guess, setGuess] = useState<Params>(IDENTITY);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const isMatch = useCallback(
    (g: Params) =>
      Math.abs(g.A - target.A) <= TOLERANCE &&
      Math.abs(g.b - target.b) <= TOLERANCE &&
      Math.abs(g.k - target.k) <= TOLERANCE,
    [target],
  );

  const nextRound = useCallback(() => {
    setTarget(randomTarget());
    setGuess(IDENTITY);
    setStatus("playing");
  }, []);

  const update = useCallback(
    (patch: Partial<Pick<Params, "A" | "b" | "k">>) => {
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
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-2, 10]}>
          <FunctionPlot expression={expTemplate} scope={target} color="var(--color-muted-foreground)" label="target" />
          <FunctionPlot
            expression={expTemplate}
            scope={guess}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            label={`your curve: A=${guess.A.toFixed(1)}, b=${guess.b.toFixed(2)}, k=${guess.k.toFixed(1)}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Match the dashed curve</p>
          <p className="mt-1 text-sm text-muted-foreground">Adjust A, b, and k until your curve overlaps it.</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>A</Label>
            <span className="font-mono">{guess.A.toFixed(1)}</span>
          </div>
          <Slider min={0.1} max={5} step={0.1} value={[guess.A]} onValueChange={(v) => update({ A: Array.isArray(v) ? v[0] : (v as number) })} disabled={status === "correct"} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>b</Label>
            <span className="font-mono">{guess.b.toFixed(2)}</span>
          </div>
          <Slider min={0.1} max={3} step={0.05} value={[guess.b]} onValueChange={(v) => update({ b: Array.isArray(v) ? v[0] : (v as number) })} disabled={status === "correct"} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>k</Label>
            <span className="font-mono">{guess.k.toFixed(1)}</span>
          </div>
          <Slider min={-3} max={3} step={0.1} value={[guess.k]} onValueChange={(v) => update({ k: Array.isArray(v) ? v[0] : (v as number) })} disabled={status === "correct"} />
        </div>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Matched — A is the starting value, b is the growth factor applied each step, and k is the
            horizontal asymptote the curve approaches but never reaches.
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
