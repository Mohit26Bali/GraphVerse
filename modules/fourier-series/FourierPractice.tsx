"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { fourierCoefficients, reconstructionExpression, WAVE_REFERENCE, type WaveKind } from "@/math-engine/fourier";

const WAVES: { id: WaveKind; label: string }[] = [
  { id: "square", label: "square wave" },
  { id: "sawtooth", label: "sawtooth wave" },
  { id: "triangle", label: "triangle wave" },
];
const TOLERANCE = 0.15;
const T_MAX = 2 * Math.PI;

function randomRound() {
  return WAVES[Math.floor(Math.random() * WAVES.length)];
}

function maxError(kind: WaveKind, termCount: number): number {
  const reference = compileFunction(WAVE_REFERENCE[kind]);
  const harmonics = fourierCoefficients(kind, termCount);
  const recon = compileFunction(reconstructionExpression(harmonics));
  let worst = 0;
  // Skip a small window around known discontinuities (Gibbs overshoot never fully vanishes there).
  for (let i = 5; i <= 95; i++) {
    const t = (i / 100) * T_MAX;
    const diff = Math.abs(reference.evaluate(t) - recon.evaluate(t));
    if (Number.isFinite(diff)) worst = Math.max(worst, diff);
  }
  return worst;
}

export function FourierPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [termCount, setTermCount] = useState(1);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const harmonics = useMemo(() => fourierCoefficients(round.id, termCount), [round, termCount]);
  const signalExpr = useMemo(() => reconstructionExpression(harmonics), [harmonics]);
  const error = useMemo(() => maxError(round.id, termCount), [round, termCount]);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setTermCount(1);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setTermCount(value);
      if (maxError(round.id, value) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, round],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[0, T_MAX]} initialYDomain={[-1.6, 1.6]}>
          <FunctionPlot expression={WAVE_REFERENCE[round.id]} color="var(--color-muted-foreground)" strokeWidth={1.5} />
          <FunctionPlot
            expression={signalExpr}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            strokeWidth={2}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Reconstruct the {round.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add harmonics until the reconstruction (colored) closely matches the target (gray).
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Harmonics</Label>
            <span className="font-mono">{termCount}</span>
          </div>
          <Slider
            min={1}
            max={20}
            step={1}
            value={[termCount]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Max error away from jumps: <span className="font-mono text-foreground">{error.toFixed(3)}</span>
        </p>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Close enough at {termCount} harmonics. Each one adds a sine wave at a whole-number multiple of
            the base frequency — more harmonics sharpen the corners, though a real jump never fully
            smooths out (the Gibbs phenomenon).
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
