"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, ReferenceLine } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { analyzeLimit, type LimitClassification } from "@/math-engine/limits";
import { LIMIT_PRESETS } from "./presets";
import { CLASSIFICATION_INFO } from "./classificationInfo";

const CHOICES: LimitClassification[] = ["continuous", "removable", "jump", "infinite"];

function randomPreset() {
  return LIMIT_PRESETS[Math.floor(Math.random() * LIMIT_PRESETS.length)];
}

export function LimitPractice() {
  const [preset, setPreset] = useState(() => randomPreset());
  const [guess, setGuess] = useState<LimitClassification | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const fn = useMemo(() => compileFunction(preset.raw), [preset]);
  const analysis = useMemo(() => analyzeLimit(fn, preset.a), [fn, preset]);
  const isCorrect = guess === analysis.classification;

  const nextRound = useCallback(() => {
    setPreset(randomPreset());
    setGuess(null);
  }, []);

  const handleGuess = useCallback(
    (choice: LimitClassification) => {
      if (guess) return;
      setGuess(choice);
      setAttempts((a) => a + 1);
      if (choice === analysis.classification) setScore((s) => s + 1);
    },
    [guess, analysis],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-6, 6]}>
          <FunctionPlot expression={preset.raw} />
          {guess && analysis.classification === "infinite" && (
            <ReferenceLine orientation="vertical" at={preset.a} />
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Classify the limit at x = {preset.a}
          </p>
          <p className="mt-1 font-mono text-sm">f(x) = {preset.raw}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {CHOICES.map((choice) => (
            <button
              key={choice}
              onClick={() => handleGuess(choice)}
              disabled={guess !== null}
              className={`rounded-md border px-2 py-2 text-sm transition-colors disabled:cursor-default ${
                guess === choice
                  ? choice === analysis.classification
                    ? "border-chart-1 bg-chart-1/15 text-chart-1"
                    : "border-destructive bg-destructive/10 text-destructive"
                  : guess && choice === analysis.classification
                    ? "border-chart-1 text-chart-1"
                    : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {CLASSIFICATION_INFO[choice].label}
            </button>
          ))}
        </div>

        {guess && (
          <p className={`text-sm ${isCorrect ? "text-chart-1" : "text-destructive"}`}>
            {isCorrect ? "Correct." : `Not quite — this is ${CLASSIFICATION_INFO[analysis.classification].label.toLowerCase()}.`}{" "}
            {CLASSIFICATION_INFO[analysis.classification].explanation}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span> / {attempts}
          </p>
          <Button onClick={nextRound} disabled={!guess}>
            Next
          </Button>
        </div>
      </aside>
    </div>
  );
}
