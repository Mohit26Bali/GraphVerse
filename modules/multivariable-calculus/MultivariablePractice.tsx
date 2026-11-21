"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { evaluate2D, gradientAt, type Point2D } from "@/math-engine/multivariable";
import { ContourCanvas } from "./ContourCanvas";
import { SURFACE_PRESETS, type SurfacePreset } from "./presets";

const PRACTICE_PRESETS = SURFACE_PRESETS.filter((p) => p.criticalPoint && p.classification);
const TOLERANCE = 0.6;

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function randomPreset(): SurfacePreset {
  return PRACTICE_PRESETS[Math.floor(Math.random() * PRACTICE_PRESETS.length)];
}

type Stage = "locate" | "classify" | "correct";

export function MultivariablePractice() {
  const [preset, setPreset] = useState(() => randomPreset());
  const [stage, setStage] = useState<Stage>("locate");
  const [clicked, setClicked] = useState<Point2D | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const gradient = useMemo(
    () => (clicked ? gradientAt(preset.expression, clicked) : null),
    [preset, clicked],
  );

  const nextRound = useCallback(() => {
    setPreset(randomPreset());
    setStage("locate");
    setClicked(null);
    setFeedback(null);
  }, []);

  const handlePick = useCallback(
    (point: Point2D) => {
      if (stage !== "locate") return;
      setClicked(point);
      const target = preset.criticalPoint!;
      const dist = Math.hypot(point.x - target.x, point.y - target.y);
      if (dist <= TOLERANCE) {
        setStage("classify");
        setFeedback(null);
      } else {
        setFeedback("Not quite — look for where the color bands stop changing, or the gradient arrow would shrink to nothing.");
      }
    },
    [stage, preset],
  );

  const classify = useCallback(
    (choice: "min" | "max" | "saddle") => {
      if (choice === preset.classification) {
        setStage("correct");
        setScore((s) => s + 1);
        setFeedback(null);
      } else {
        setFeedback("Not that one — check which directions the surface rises and which it falls.");
      }
    },
    [preset],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <ContourCanvas
          expression={preset.expression}
          domain={preset.domain}
          probePoint={clicked}
          arrows={stage !== "locate" && gradient ? [{ ...gradient, color: "#fff" }] : undefined}
          onPick={handlePick}
          size={400}
        />
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">f(x, y) = {preset.label}</p>
        </div>

        {stage === "locate" && (
          <p className="text-sm text-muted-foreground">
            Click the point on the surface where the gradient is zero — the critical point.
          </p>
        )}

        {stage === "classify" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Found it — f = {round(evaluate2D(preset.expression, preset.criticalPoint!))} there, gradient ≈ (0, 0).
              Is it a local minimum, a local maximum, or a saddle point?
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => classify("min")}>
                Local minimum
              </Button>
              <Button variant="outline" onClick={() => classify("max")}>
                Local maximum
              </Button>
              <Button variant="outline" onClick={() => classify("saddle")}>
                Saddle point
              </Button>
            </div>
          </div>
        )}

        {feedback && <p className="text-sm text-destructive">{feedback}</p>}

        {stage === "correct" && (
          <p className="text-sm text-chart-1">
            Correct — a {preset.classification === "saddle" ? "saddle point" : `local ${preset.classification}imum`}.{" "}
            {preset.description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span>
          </p>
          <Button onClick={nextRound} disabled={stage !== "correct"}>
            Next
          </Button>
        </div>
      </aside>
    </div>
  );
}
