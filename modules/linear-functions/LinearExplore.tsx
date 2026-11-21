"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Equation } from "@/components/shared/Equation";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { formatLineEquation } from "@/math-engine/linear";
import { SlopeTriangle } from "./SlopeTriangle";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function LinearExplore() {
  const [m, setM] = useState(1);
  const [b, setB] = useState(0);

  const tableRows = useMemo(
    () => [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => ({ x, y: round(m * x + b) })),
    [m, b],
  );

  const explainState = useExplain();
  const buildContext = (next: { m: number; b: number }) =>
    `Line y = mx + b with slope m=${round(next.m)} and y-intercept b=${round(next.b)}. ` +
    `Equation: ${formatLineEquation(next.m, next.b)}. ` +
    `The line rises ${round(next.m)} units for every 1 unit right, and crosses the y-axis at (0, ${round(next.b)}).`;
  const explainAfterCommit = (next: { m: number; b: number }) =>
    explainState.explain({ moduleTitle: "Linear Functions", context: buildContext(next) });

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          <SlopeTriangle m={m} b={b} x0={0} run={2} />
          <FunctionPlot expression="m*x+b" scope={{ m, b }} label={formatLineEquation(m, b)} />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <Equation tex={formatLineEquation(m, b).replace("y = ", "y = ")} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="slope-slider">Slope (m)</Label>
            <span className="font-mono">{m.toFixed(1)}</span>
          </div>
          <Slider
            id="slope-slider"
            min={-5}
            max={5}
            step={0.1}
            value={[m]}
            onValueChange={(v) => setM(Array.isArray(v) ? v[0] : v)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="intercept-slider">Intercept (b)</Label>
            <span className="font-mono">{b.toFixed(1)}</span>
          </div>
          <Slider
            id="intercept-slider"
            min={-10}
            max={10}
            step={0.5}
            value={[b]}
            onValueChange={(v) => setB(Array.isArray(v) ? v[0] : v)}
          />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Table</p>
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="border-b border-border pb-1 text-left font-normal">x</th>
                <th className="border-b border-border pb-1 text-left font-normal">y</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.x}>
                  <td className="py-0.5">{row.x}</td>
                  <td className="py-0.5">{row.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          A car starts {Math.abs(b)} miles {b >= 0 ? "past" : "before"} the origin and
          travels at {Math.abs(m)} miles per hour {m >= 0 ? "forward" : "in reverse"}.
        </p>

        <ExplainPanel state={explainState} onRequest={() => explainAfterCommit({ m, b })} />
      </aside>
    </div>
  );
}
