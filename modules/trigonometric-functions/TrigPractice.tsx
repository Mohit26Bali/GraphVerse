"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trigTemplate, trigScope, type TrigKind, type TrigParams } from "@/math-engine/trig";

const TOLERANCE = 0.25;
const IDENTITY: TrigParams = { amplitude: 1, frequency: 1, phase: 0, shift: 0 };

function randomTarget(): TrigParams {
  const amplitude = [0.5, 1, 1.5, 2][Math.floor(Math.random() * 4)];
  const frequency = [0.5, 1, 1.5, 2][Math.floor(Math.random() * 4)];
  const phase = Math.round((Math.random() * 6 - 3) * 2) / 2;
  const shift = Math.round((Math.random() * 4 - 2) * 2) / 2;
  return { amplitude, frequency, phase, shift };
}

function randomKind(): TrigKind {
  return Math.random() < 0.5 ? "sin" : "cos";
}

export function TrigPractice() {
  const [kind, setKind] = useState<TrigKind>(() => randomKind());
  const [target, setTarget] = useState<TrigParams>(() => randomTarget());
  const [guess, setGuess] = useState<TrigParams>(IDENTITY);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const expression = trigTemplate(kind);

  const isMatch = useCallback(
    (g: TrigParams) =>
      Math.abs(g.amplitude - target.amplitude) <= TOLERANCE &&
      Math.abs(g.frequency - target.frequency) <= TOLERANCE &&
      Math.abs(g.phase - target.phase) <= TOLERANCE &&
      Math.abs(g.shift - target.shift) <= TOLERANCE,
    [target],
  );

  const nextRound = useCallback(() => {
    setKind(randomKind());
    setTarget(randomTarget());
    setGuess(IDENTITY);
    setStatus("playing");
  }, []);

  const update = useCallback(
    (patch: Partial<TrigParams>) => {
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
        <GraphCanvas initialXDomain={[-8, 8]} initialYDomain={[-4, 4]}>
          <FunctionPlot
            expression={expression}
            scope={trigScope(target)}
            color="var(--color-muted-foreground)"
            label="target"
          />
          <FunctionPlot
            expression={expression}
            scope={trigScope(guess)}
            color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"}
            label={`your ${kind}(x): A=${guess.amplitude}, B=${guess.frequency}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Match the dashed {kind}(x) wave
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust amplitude, frequency, phase, and vertical shift.
          </p>
        </div>

        {(
          [
            { key: "amplitude", label: "Amplitude", min: 0.2, max: 3, step: 0.1 },
            { key: "frequency", label: "Frequency", min: 0.2, max: 4, step: 0.1 },
            { key: "phase", label: "Phase", min: -3.2, max: 3.2, step: 0.1 },
            { key: "shift", label: "Vertical shift", min: -3, max: 3, step: 0.1 },
          ] as const
        ).map((ctrl) => (
          <div key={ctrl.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor={`practice-${ctrl.key}`}>{ctrl.label}</Label>
              <span className="font-mono">{guess[ctrl.key].toFixed(1)}</span>
            </div>
            <Slider
              id={`practice-${ctrl.key}`}
              min={ctrl.min}
              max={ctrl.max}
              step={ctrl.step}
              value={[guess[ctrl.key]]}
              onValueChange={(v) => update({ [ctrl.key]: Array.isArray(v) ? v[0] : (v as number) })}
              disabled={status === "correct"}
            />
          </div>
        ))}

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Matched — amplitude sets the height, frequency sets how fast it repeats, phase shifts it
            sideways, and vertical shift moves the midline. Match all four and the waves overlap exactly.
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
