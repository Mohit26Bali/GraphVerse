"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ladderY, ladderDyDt } from "@/math-engine/derivative";
import { LadderSegment } from "./LadderSegment";

const TOLERANCE = 0.15;
const DOMAIN: [number, number] = [0, 15];
const RATES = [1, 1.5, 2];

function randomRound() {
  const L = Math.round((8 + Math.random() * 5) * 2) / 2;
  const x0 = Math.round((2 + Math.random() * (L - 4)) * 2) / 2;
  const dxdt = RATES[Math.floor(Math.random() * RATES.length)];
  return { L, x0, dxdt };
}

export function RelatedRatesPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [guess, setGuess] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const y0 = useMemo(() => ladderY(round.L, round.x0), [round]);
  const trueDyDt = useMemo(() => ladderDyDt(round.L, round.x0, round.dxdt), [round]);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setGuess(0);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setGuess(value);
      if (Math.abs(value - trueDyDt) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, trueDyDt],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={DOMAIN}>
          <LadderSegment x0={round.x0} y0={y0} />
          <Point x={round.x0} y={0} color="var(--color-chart-2)" radius={5} tooltip={`base, x = ${round.x0}`} />
          <Point x={0} y={y0} color="var(--color-chart-3)" radius={5} tooltip={`top, y ≈ ${y0.toFixed(2)}`} />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Related rates</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A {round.L}m ladder leans against a wall. The base is {round.x0}m out and sliding away at{" "}
            {round.dxdt} m/s. How fast is the top sliding down the wall right now?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Your guess for dy/dt (m/s)</Label>
            <span className="font-mono">{guess.toFixed(1)}</span>
          </div>
          <Slider
            min={-6}
            max={0}
            step={0.1}
            value={[guess]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Correct — dy/dt ≈ {trueDyDt.toFixed(2)} m/s. Since x² + y² = L² at every instant, differentiating
            both sides gives 2x(dx/dt) + 2y(dy/dt) = 0, so dy/dt = −(x/y)(dx/dt) — the two rates are linked
            through that fixed relationship, which is exactly what &quot;related rates&quot; means.
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
