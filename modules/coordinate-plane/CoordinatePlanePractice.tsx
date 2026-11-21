"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, Point, type DataPoint } from "@/graph-engine";
import { Button } from "@/components/ui/button";

const RANGE = 8;
const TOLERANCE = 0.6;

function randomTarget(): DataPoint {
  let x = 0;
  let y = 0;
  do {
    x = Math.round(Math.random() * RANGE * 2 - RANGE);
    y = Math.round(Math.random() * RANGE * 2 - RANGE);
  } while (x === 0 && y === 0);
  return { x, y };
}

type RoundStatus = "playing" | "correct";

export function CoordinatePlanePractice() {
  const [target, setTarget] = useState<DataPoint>(() => randomTarget());
  const [attempt, setAttempt] = useState<DataPoint | null>(null);
  const [status, setStatus] = useState<RoundStatus>("playing");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const nextRound = useCallback(() => {
    setTarget(randomTarget());
    setAttempt(null);
    setStatus("playing");
  }, []);

  const handleClick = useCallback(
    (point: DataPoint) => {
      if (status === "correct") return;
      setAttempt(point);
      setAttempts((a) => a + 1);
      const distance = Math.hypot(point.x - target.x, point.y - target.y);
      if (distance <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, target],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas onCanvasClick={handleClick}>
          {attempt && (
            <Point
              x={attempt.x}
              y={attempt.y}
              color={status === "correct" ? "var(--color-chart-1)" : "var(--color-destructive)"}
              tooltip={`your click (${attempt.x.toFixed(2)}, ${attempt.y.toFixed(2)})`}
            />
          )}
          {status === "correct" && (
            <Point
              x={target.x}
              y={target.y}
              color="var(--color-chart-1)"
              radius={7}
              tooltip={`target (${target.x}, ${target.y})`}
            />
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-64 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Click the point</p>
          <p className="mt-1 font-mono text-2xl">
            ({target.x}, {target.y})
          </p>
        </div>

        {status === "correct" ? (
          <p className="text-sm text-chart-1">
            Correct — ({target.x}, {target.y}) means {Math.abs(target.x)} units {target.x >= 0 ? "right of" : "left of"} the
            y-axis and {Math.abs(target.y)} units {target.y >= 0 ? "above" : "below"} the x-axis. That&apos;s all a
            coordinate is: two distances from the origin.
          </p>
        ) : attempt ? (
          <p className="text-sm text-destructive">Not quite. Try again.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Click anywhere on the plane.</p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span> correct in{" "}
            <span className="font-mono text-foreground">{attempts}</span> attempts
          </p>
          <Button onClick={nextRound} disabled={status !== "correct"}>
            Next point
          </Button>
        </div>
      </aside>
    </div>
  );
}
