"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, Point, type DataPoint } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { compileFunction } from "@/math-engine/evaluate";
import { slopeFieldGrid, solveTrajectory } from "@/math-engine/differential";
import { SlopeField } from "./SlopeField";
import { Trajectory } from "./Trajectory";
import { ODE_PRESETS } from "./presets";

const DOMAIN: [number, number] = [-6, 6];
const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function DifferentialExplore() {
  const [presetId, setPresetId] = useState(ODE_PRESETS[0].id);
  const preset = ODE_PRESETS.find((p) => p.id === presetId) ?? ODE_PRESETS[0];
  const [starts, setStarts] = useState<DataPoint[]>([{ x: 0, y: 1 }]);

  const compiled = useMemo(() => compileFunction(preset.raw), [preset]);
  const field = useMemo(() => slopeFieldGrid(compiled, DOMAIN, DOMAIN, 19, 15), [compiled]);
  const trajectories = useMemo(
    () => starts.map((s) => solveTrajectory(compiled, s.x, s.y, DOMAIN)),
    [compiled, starts],
  );

  const selectPreset = useCallback((id: string) => {
    setPresetId(id);
    setStarts([{ x: 0, y: 1 }]);
  }, []);

  const handleClick = useCallback((point: DataPoint) => {
    setStarts((prev) => (prev.length >= 6 ? [...prev.slice(1), point] : [...prev, point]));
  }, []);

  const explainState = useExplain();
  const buildContext = () =>
    `Solving the differential equation dy/dx = ${preset.raw} (${preset.label}). ` +
    (starts.length > 0
      ? `The slope field is shown along with trajector${starts.length === 1 ? "y" : "ies"} traced from ${starts.length} starting point${starts.length === 1 ? "" : "s"}: ${starts.map((s) => `(${round(s.x)}, ${round(s.y)})`).join(", ")}.`
      : "Only the slope field is shown — no trajectories have been traced yet.");

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={DOMAIN} onCanvasClick={handleClick}>
          <SlopeField points={field} />
          {trajectories.map((traj, i) => (
            <Trajectory key={i} points={traj} color={PALETTE[i % PALETTE.length]} />
          ))}
          {starts.map((s, i) => (
            <Point key={i} x={s.x} y={s.y} color={PALETTE[i % PALETTE.length]} radius={5} tooltip={`(${s.x.toFixed(2)}, ${s.y.toFixed(2)})`} />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {ODE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPreset(p.id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                p.id === presetId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{preset.description}</p>

        <p className="text-sm text-muted-foreground">
          Click anywhere on the plane to trace the trajectory through that point (up to 6 at
          once).
        </p>

        <Button variant="outline" onClick={() => setStarts([])} disabled={starts.length === 0}>
          Clear trajectories
        </Button>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {starts.map((s, i) => (
            <p key={i} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
              <span className="font-mono">
                ({s.x.toFixed(2)}, {s.y.toFixed(2)})
              </span>
            </p>
          ))}
        </div>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Differential Equations", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
