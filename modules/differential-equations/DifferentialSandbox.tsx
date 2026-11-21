"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, Point, type DataPoint } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { slopeFieldGrid, solveTrajectory } from "@/math-engine/differential";
import { SlopeField } from "./SlopeField";
import { Trajectory } from "./Trajectory";

const DOMAIN: [number, number] = [-6, 6];
const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function DifferentialSandbox() {
  const [draft, setDraft] = useState("y*sin(x)-0.3*y");
  const [raw, setRaw] = useState("y*sin(x)-0.3*y");
  const [starts, setStarts] = useState<DataPoint[]>([{ x: -3, y: 1 }]);

  const error = useMemo(() => {
    try {
      compileFunction(raw).evaluate(1, { y: 1 });
      return null;
    } catch {
      return "Couldn't parse that expression.";
    }
  }, [raw]);

  const compiled = useMemo(() => compileFunction(raw), [raw]);
  const field = useMemo(() => (error ? [] : slopeFieldGrid(compiled, DOMAIN, DOMAIN, 19, 15)), [compiled, error]);
  const trajectories = useMemo(
    () => (error ? [] : starts.map((s) => solveTrajectory(compiled, s.x, s.y, DOMAIN))),
    [compiled, starts, error],
  );

  const handleClick = useCallback((point: DataPoint) => {
    setStarts((prev) => (prev.length >= 6 ? [...prev.slice(1), point] : [...prev, point]));
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={DOMAIN} onCanvasClick={handleClick}>
          {!error && (
            <>
              <SlopeField points={field} />
              {trajectories.map((traj, i) => (
                <Trajectory key={i} points={traj} color={PALETTE[i % PALETTE.length]} />
              ))}
              {starts.map((s, i) => (
                <Point key={i} x={s.x} y={s.y} color={PALETTE[i % PALETTE.length]} radius={5} />
              ))}
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div>
          <Label>dy/dx = f(x, y)</Label>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setRaw(draft.trim());
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" />
          <Button type="submit">Plot</Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-sm text-muted-foreground">
          Click anywhere on the plane to trace the trajectory through that point (up to 6 at
          once).
        </p>

        <Button variant="outline" onClick={() => setStarts([])} disabled={starts.length === 0}>
          Clear trajectories
        </Button>
      </aside>
    </div>
  );
}
