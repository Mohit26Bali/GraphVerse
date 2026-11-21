"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, DiscreteSeries, ReferenceLine } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { partialSums } from "@/math-engine/sequences";
import { SERIES_PRESETS, type SeriesPreset } from "./presets";

const MAX_N = 50;
const TOLERANCE = 0.05;
const DOMAIN_X: [number, number] = [0, 52];

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function randomPreset(): SeriesPreset {
  return SERIES_PRESETS[Math.floor(Math.random() * SERIES_PRESETS.length)];
}

type Stage = "classify" | "guess-limit" | "correct";

export function SequencesPractice() {
  const [preset, setPreset] = useState(() => randomPreset());
  const [stage, setStage] = useState<Stage>("classify");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [guess, setGuess] = useState(0);
  const [score, setScore] = useState(0);

  const sums = useMemo(() => partialSums(preset.termExpression, MAX_N), [preset]);
  const points = useMemo(() => sums.map((p) => ({ x: p.n, y: p.value })), [sums]);

  const domainY = useMemo<[number, number]>(() => {
    const values = [0, ...sums.map((p) => p.value), ...(preset.limit !== null ? [preset.limit] : [])];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.15, 0.3);
    return [min - pad, max + pad];
  }, [sums, preset.limit]);

  const nextRound = useCallback(() => {
    setPreset(randomPreset());
    setStage("classify");
    setFeedback(null);
    setGuess(0);
  }, []);

  const classify = useCallback(
    (choice: "converges" | "diverges") => {
      const actuallyConverges = preset.limit !== null;
      if (choice === "diverges" && !actuallyConverges) {
        setStage("correct");
        setScore((s) => s + 1);
        setFeedback(null);
      } else if (choice === "converges" && actuallyConverges) {
        setStage("guess-limit");
        setFeedback(null);
      } else {
        setFeedback(
          actuallyConverges
            ? "Actually this one converges — look again at how fast the terms shrink."
            : "Actually this one diverges — the terms don't shrink fast enough to settle anywhere.",
        );
      }
    },
    [preset],
  );

  const checkLimit = useCallback(() => {
    if (preset.limit === null) return;
    if (Math.abs(guess - preset.limit) <= TOLERANCE) {
      setStage("correct");
      setScore((s) => s + 1);
      setFeedback(null);
    } else {
      setFeedback(`Not quite — within ${TOLERANCE} of the true limit, please.`);
    }
  }, [guess, preset.limit]);

  const showGraph = stage !== "classify";

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas key={preset.id} initialXDomain={DOMAIN_X} initialYDomain={domainY}>
          {showGraph && (
            <>
              {preset.limit !== null && (
                <ReferenceLine orientation="horizontal" at={preset.limit} tooltip={`limit ≈ ${round(preset.limit)}`} />
              )}
              {stage === "guess-limit" && (
                <ReferenceLine orientation="horizontal" at={guess} color="var(--color-chart-4)" dashed strokeWidth={2} tooltip={`your guess: ${round(guess)}`} />
              )}
              <DiscreteSeries points={points} color="var(--color-chart-1)" label="partial sums (Sₙ)" />
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Does it converge?</p>
          <p className="mt-1 font-mono text-lg">{preset.label}</p>
        </div>

        {stage === "classify" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Judging from how the terms behave as n grows — does the running total settle on a
              finite value, or keep growing forever?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => classify("converges")}>
                Converges
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => classify("diverges")}>
                Diverges
              </Button>
            </div>
          </div>
        )}

        {stage === "guess-limit" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Correct — it converges. Now guess the limit:</p>
            <div className="flex items-center justify-between text-sm">
              <Label>Your guess</Label>
              <span className="font-mono">{guess.toFixed(2)}</span>
            </div>
            <Slider min={-1} max={2} step={0.01} value={[guess]} onValueChange={(v) => setGuess(Array.isArray(v) ? v[0] : (v as number))} />
            <p className="text-xs text-muted-foreground">
              The dashed line on the graph tracks your guess — line it up with where the dots flatten out.
            </p>
            <Button onClick={checkLimit}>Check</Button>
          </div>
        )}

        {feedback && <p className="text-sm text-destructive">{feedback}</p>}

        {stage === "correct" && (
          <p className="text-sm text-chart-1">
            {preset.limit === null
              ? `Diverges — ${preset.description.toLowerCase()}`
              : `Converges to ${round(preset.limit)} — ${preset.description.toLowerCase()}`}
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
