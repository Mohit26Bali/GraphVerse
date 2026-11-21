"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { riemannRectangles, riemannSum, accumulationSamples, type RiemannMethod } from "@/math-engine/integral";
import { RiemannBars } from "./RiemannBars";
import { AccumulationCurve } from "./AccumulationCurve";

const DOMAIN: [number, number] = [-6, 6];
const METHODS: RiemannMethod[] = ["left", "midpoint", "right"];

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function IntegralSandbox() {
  const [draft, setDraft] = useState("sin(x)");
  const [raw, setRaw] = useState("sin(x)");
  const [bounds, setBounds] = useState<[number, number]>([-2, 2]);
  const [n, setN] = useState(20);
  const [method, setMethod] = useState<RiemannMethod>("midpoint");

  const error = useMemo(() => {
    try {
      compileFunction(raw).evaluate(1);
      return null;
    } catch {
      return "Couldn't parse that expression.";
    }
  }, [raw]);

  const compiled = useMemo(() => compileFunction(raw), [raw]);
  const rects = useMemo(() => (error ? [] : riemannRectangles(compiled, bounds, n, method)), [compiled, bounds, n, method, error]);
  const area = useMemo(() => riemannSum(rects), [rects]);
  const accPoints = useMemo(() => (error ? [] : accumulationSamples(compiled, bounds[0], DOMAIN)), [compiled, bounds, error]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1 border-b border-border md:border-r md:border-b-0">
          <div className="h-full">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-4, 4]}>
              {!error && (
                <>
                  <RiemannBars rects={rects} />
                  <FunctionPlot expression={raw} color="var(--color-chart-2)" strokeWidth={2} />
                </>
              )}
            </GraphCanvas>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <div className="h-full">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-4, 4]}>
              {!error && (
                <>
                  <AccumulationCurve points={accPoints} />
                  <Point x={bounds[1]} y={area} color="var(--color-chart-4)" radius={5} tooltip={`A(${bounds[1]}) = ${round(area)}`} />
                </>
              )}
            </GraphCanvas>
          </div>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-4 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Bounds</Label>
            <span className="font-mono">
              [{bounds[0].toFixed(1)}, {bounds[1].toFixed(1)}]
            </span>
          </div>
          <Slider
            min={DOMAIN[0]}
            max={DOMAIN[1]}
            step={0.1}
            value={bounds}
            onValueChange={(v) => Array.isArray(v) && v.length === 2 && setBounds([v[0], v[1]])}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Rectangles (n)</Label>
            <span className="font-mono">{n}</span>
          </div>
          <Slider min={2} max={80} step={1} value={[n]} onValueChange={(v) => setN(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <div className="flex gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 rounded-md border px-2 py-1.5 text-sm capitalize transition-colors ${
                m === method
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {!error && (
          <p className="text-sm text-muted-foreground">
            Net area: <span className="font-mono text-foreground">{round(area)}</span>
          </p>
        )}
      </aside>
    </div>
  );
}
