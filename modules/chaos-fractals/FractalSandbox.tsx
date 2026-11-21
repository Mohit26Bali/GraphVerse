"use client";

import { useMemo, useState } from "react";
import { GraphCanvas } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { logisticMap } from "@/math-engine/fractal";
import { BifurcationCanvas } from "./BifurcationCanvas";
import { TimeSeriesPath } from "./TimeSeriesPath";

const ITERATIONS = 60;

function describeRegime(r: number): string {
  if (r < 3) return "settles to a single fixed point";
  if (r < 3.449) return "oscillates between 2 values (period-2)";
  if (r < 3.544) return "oscillates between 4 values (period-4)";
  if (r < 3.57) return "period keeps doubling";
  return "chaotic — no repeating pattern";
}

export function FractalSandbox() {
  const [r, setR] = useState(3.2);

  const values = useMemo(() => logisticMap(r, 0.5, ITERATIONS), [r]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto p-6">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            x_n over time (r = {r.toFixed(3)})
          </p>
          <div className="h-56">
            <GraphCanvas initialXDomain={[0, ITERATIONS]} initialYDomain={[0, 1]}>
              <TimeSeriesPath values={values} />
            </GraphCanvas>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Bifurcation diagram — every r from 2.4 to 4
          </p>
          <BifurcationCanvas highlightR={r} />
        </div>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Growth rate (r)</Label>
            <span className="font-mono">{r.toFixed(3)}</span>
          </div>
          <Slider min={2.4} max={4} step={0.001} value={[r]} onValueChange={(v) => setR(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <p className="text-sm text-muted-foreground">
          x_(n+1) = r · x_n · (1 − x_n) — a simple population-growth model where r controls how
          aggressively the population rebounds each step.
        </p>

        <p className="text-sm text-foreground">At r = {r.toFixed(3)}: the population {describeRegime(r)}.</p>

        <p className="text-sm text-muted-foreground">
          The bifurcation diagram plots this same long-run behavior for every r at once — each
          vertical slice is exactly what the top graph would settle into at that r. The chaotic
          region isn&apos;t random; it&apos;s fully determined and still has visible structure.
        </p>
      </aside>
    </div>
  );
}
