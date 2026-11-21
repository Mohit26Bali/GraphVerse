"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Complex } from "@/math-engine/fractal";
import { FractalCanvas } from "./FractalCanvas";

const MANDELBROT_CENTER: Complex = { re: -0.5, im: 0 };
const MANDELBROT_SCALE = 3;
const TOLERANCE = 0.15;

const INTERESTING_C: Complex[] = [
  { re: -0.4, im: 0.6 },
  { re: -0.8, im: 0.156 },
  { re: 0.285, im: 0.01 },
  { re: -0.7269, im: 0.1889 },
  { re: -0.123, im: 0.745 },
  { re: -1.25, im: 0 },
];

function randomC(): Complex {
  return INTERESTING_C[Math.floor(Math.random() * INTERESTING_C.length)];
}

export function FractalPractice() {
  const [target, setTarget] = useState(() => randomC());
  const [guess, setGuess] = useState<Complex | null>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const isCorrect = guess !== null && Math.hypot(guess.re - target.re, guess.im - target.im) <= TOLERANCE;

  const nextRound = useCallback(() => {
    setTarget(randomC());
    setGuess(null);
    setStatus("playing");
  }, []);

  const handlePick = useCallback(
    (c: Complex) => {
      if (status === "correct") return;
      setGuess(c);
      if (Math.hypot(c.re - target.re, c.im - target.im) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, target],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 items-center justify-center gap-6 overflow-auto p-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">This Julia set...</p>
          <FractalCanvas kind="julia" juliaC={target} center={{ re: 0, im: 0 }} scale={3} maxIterations={80} size={320} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">...came from where on the Mandelbrot set?</p>
          <FractalCanvas
            kind="mandelbrot"
            center={MANDELBROT_CENTER}
            scale={MANDELBROT_SCALE}
            maxIterations={80}
            size={320}
            onPick={handlePick}
          />
        </div>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Find the c value</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click on the Mandelbrot set where you think this Julia set&apos;s c came from.
          </p>
        </div>

        {guess && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">Your guess produces:</p>
            <FractalCanvas kind="julia" juliaC={guess} center={{ re: 0, im: 0 }} scale={3} maxIterations={80} size={160} />
          </div>
        )}

        {guess && (
          <p className={`text-sm ${isCorrect ? "text-chart-1" : "text-destructive"}`}>
            {isCorrect
              ? "Close enough — same shape family. Points near each other in c produce visually similar Julia sets, so your guess didn't need to be exact."
              : "Not quite — compare the two Julia sets and try again."}
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
