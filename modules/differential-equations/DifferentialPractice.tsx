"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, Point, type DataPoint } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { slopeFieldGrid, solveTrajectory, type TrajectoryPoint } from "@/math-engine/differential";
import { SlopeField } from "./SlopeField";
import { Trajectory } from "./Trajectory";
import { ODE_PRESETS } from "./presets";

const DOMAIN: [number, number] = [-5, 5];
const TOLERANCE = 0.5;
const SAFE_PRESETS = ODE_PRESETS.filter((p) => p.id !== "circle");

function yAt(traj: TrajectoryPoint[], x: number): number {
  if (traj.length === 0) return NaN;
  let lo = traj[0];
  let hi = traj[traj.length - 1];
  if (x <= lo.x) return lo.y;
  if (x >= hi.x) return hi.y;
  for (let i = 0; i < traj.length - 1; i++) {
    if (traj[i].x <= x && traj[i + 1].x >= x) {
      lo = traj[i];
      hi = traj[i + 1];
      break;
    }
  }
  const span = hi.x - lo.x || 1e-9;
  const t = (x - lo.x) / span;
  return lo.y + t * (hi.y - lo.y);
}

function randomRound() {
  const preset = SAFE_PRESETS[Math.floor(Math.random() * SAFE_PRESETS.length)];
  const x0 = Math.round((Math.random() * 4 - 2) * 2) / 2;
  const y0 = Math.round((Math.random() * 4 - 2) * 2) / 2;
  return { preset, x0, y0 };
}

export function DifferentialPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [guess, setGuess] = useState<DataPoint | null>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const compiled = useMemo(() => compileFunction(round.preset.raw), [round]);
  const field = useMemo(() => slopeFieldGrid(compiled, DOMAIN, DOMAIN, 15, 12), [compiled]);
  const target = useMemo(() => solveTrajectory(compiled, round.x0, round.y0, DOMAIN), [compiled, round]);
  const guessTraj = useMemo(
    () => (guess ? solveTrajectory(compiled, guess.x, guess.y, DOMAIN) : null),
    [compiled, guess],
  );

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setGuess(null);
    setStatus("playing");
  }, []);

  const handleClick = useCallback(
    (point: DataPoint) => {
      if (status === "correct") return;
      setGuess(point);
      const testXs = [round.x0 - 1.5, round.x0 - 0.5, round.x0 + 0.5, round.x0 + 1.5].filter(
        (x) => x >= DOMAIN[0] && x <= DOMAIN[1],
      );
      const trial = solveTrajectory(compiled, point.x, point.y, DOMAIN);
      const worst = Math.max(...testXs.map((x) => Math.abs(yAt(target, x) - yAt(trial, x))));
      if (worst <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, round, target, compiled],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={DOMAIN} onCanvasClick={handleClick}>
          <SlopeField points={field} />
          <Trajectory points={target} color="var(--color-muted-foreground)" strokeWidth={2} />
          {guessTraj && (
            <Trajectory points={guessTraj} color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"} />
          )}
          {guess && <Point x={guess.x} y={guess.y} color="var(--color-chart-4)" radius={5} />}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Find the trajectory</p>
          <p className="mt-1 font-mono text-sm">{round.preset.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click anywhere on the gray curve to trace your own trajectory through it.
          </p>
        </div>

        {guess && (
          <p className={`text-sm ${status === "correct" ? "text-chart-1" : "text-destructive"}`}>
            {status === "correct"
              ? "That point lies on the same solution curve — every point obeys the same rule dy/dx = f(x, y), so any point on the curve retraces the identical path."
              : "Not quite on the curve — try again."}
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
