"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point, ReferenceLine } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Equation } from "@/components/shared/Equation";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import {
  formatVertexEquation,
  quadraticRoots,
  quadraticTangentAt,
  quadraticValueAt,
} from "@/math-engine/quadratic";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function QuadraticExplore() {
  const [a, setA] = useState(1);
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const [showTangent, setShowTangent] = useState(false);
  const [x0, setX0] = useState(2);

  const roots = useMemo(() => quadraticRoots({ a, h, k }), [a, h, k]);
  const tangent = useMemo(() => quadraticTangentAt({ a, h, k }, x0), [a, h, k, x0]);
  const y0 = quadraticValueAt({ a, h, k }, x0);

  const explainState = useExplain();
  const buildContext = (next: { a: number; h: number; k: number }) => {
    const r = quadraticRoots(next);
    return (
      `Vertex form y = a(x-h)^2+k with a=${round(next.a)}, h=${round(next.h)}, k=${round(next.k)}. ` +
      `Vertex at (${round(next.h)}, ${round(next.k)}). ` +
      `Roots: ${r.length === 0 ? "none real" : r.map(round).join(", ")}.`
    );
  };
  const explainAfterCommit = (next: { a: number; h: number; k: number }) =>
    explainState.explain({ moduleTitle: "Quadratic Functions", context: buildContext(next) });

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          <ReferenceLine orientation="vertical" at={h} label={`x = ${round(h)}`} />
          <FunctionPlot expression="a*(x-h)^2+k" scope={{ a, h, k }} label={formatVertexEquation(a, h, k)} />
          {showTangent && (
            <FunctionPlot
              expression="tm*x+tb"
              scope={{ tm: tangent.m, tb: tangent.b }}
              color="var(--color-chart-2)"
              strokeWidth={2}
              label={`tangent, slope = ${tangent.m.toFixed(2)}`}
            />
          )}
          {showTangent && (
            <Point x={x0} y={y0} color="var(--color-chart-2)" tooltip={`(${x0.toFixed(2)}, ${y0.toFixed(2)})`} />
          )}
          <Point x={h} y={k} color="var(--color-chart-1)" label="vertex" tooltip={`vertex (${round(h)}, ${round(k)})`} />
          {roots.map((r) => (
            <Point
              key={r}
              x={r}
              y={0}
              color="var(--color-chart-3)"
              radius={4}
              tooltip={`root x ≈ ${round(r)}`}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <Equation tex={formatVertexEquation(a, h, k)} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="a-slider">Width / direction (a)</Label>
            <span className="font-mono">{a.toFixed(1)}</span>
          </div>
          <Slider
            id="a-slider"
            min={-3}
            max={3}
            step={0.1}
            value={[a]}
            onValueChange={(v) => setA(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="h-slider">Horizontal shift (h)</Label>
            <span className="font-mono">{h.toFixed(1)}</span>
          </div>
          <Slider
            id="h-slider"
            min={-5}
            max={5}
            step={0.1}
            value={[h]}
            onValueChange={(v) => setH(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="k-slider">Vertical shift (k)</Label>
            <span className="font-mono">{k.toFixed(1)}</span>
          </div>
          <Slider
            id="k-slider"
            min={-5}
            max={5}
            step={0.1}
            value={[k]}
            onValueChange={(v) => setK(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-border p-3">
          <div className="flex items-center gap-2">
            <Switch id="tangent-toggle" checked={showTangent} onCheckedChange={setShowTangent} />
            <Label htmlFor="tangent-toggle">Show tangent (derivative preview)</Label>
          </div>
          {showTangent && (
            <>
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="x0-slider">Point (x)</Label>
                <span className="font-mono">{x0.toFixed(1)}</span>
              </div>
              <Slider id="x0-slider" min={-5} max={5} step={0.1} value={[x0]} onValueChange={(v) => setX0(Array.isArray(v) ? v[0] : (v as number))} />
              <p className="text-sm text-muted-foreground">
                Slope at x = {x0.toFixed(1)}: <span className="font-mono text-foreground">{tangent.m.toFixed(2)}</span>
              </p>
            </>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Vertex: ({round(h)}, {round(k)})</p>
          <p>
            Roots:{" "}
            {roots.length === 0
              ? "none (real)"
              : roots.map((r) => round(r)).join(", ")}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          A ball launched under gravity follows this shape: {a < 0 ? "it rises then falls" : "it curves upward"},
          peaking at ({round(h)}, {round(k)}).
        </p>

        <ExplainPanel state={explainState} onRequest={() => explainAfterCommit({ a, h, k })} />
      </aside>
    </div>
  );
}
