"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import {
  evaluate2D,
  gradientAt,
  doubleIntegral,
  tangentLineExpression,
  sampleGrid,
  type Point2D,
} from "@/math-engine/multivariable";
import { ContourCanvas } from "./ContourCanvas";

const DOMAIN: [number, number] = [-4, 4];

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function MultivariableSandbox() {
  const [draft, setDraft] = useState("x^2 - y^2");
  const [raw, setRaw] = useState("x^2 - y^2");
  const [probe, setProbe] = useState<Point2D>({ x: 1, y: 1 });

  const error = useMemo(() => {
    try {
      compileFunction(raw).evaluate(0, { y: 0 });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Couldn't parse that expression.";
    }
  }, [raw]);

  const fValue = useMemo(() => (error ? 0 : evaluate2D(raw, probe)), [raw, probe, error]);
  const gradient = useMemo(() => (error ? { dfdx: 0, dfdy: 0 } : gradientAt(raw, probe)), [raw, probe, error]);
  const gradientMag = Math.hypot(gradient.dfdx, gradient.dfdy);

  const volume = useMemo(() => (error ? 0 : doubleIntegral(raw, DOMAIN, DOMAIN)), [raw, error]);

  const domainZ = useMemo<[number, number]>(() => {
    if (error) return [-1, 1];
    const grid = sampleGrid(raw, DOMAIN, DOMAIN, 40);
    const flat = grid.flat().filter(Number.isFinite);
    const min = flat.length > 0 ? Math.min(...flat) : -1;
    const max = flat.length > 0 ? Math.max(...flat) : 1;
    const pad = Math.max((max - min) * 0.1, 0.5);
    return [min - pad, max + pad];
  }, [raw, error]);

  const xSliceTangent = useMemo(() => tangentLineExpression(gradient.dfdx, probe.x, fValue, "x"), [gradient.dfdx, probe.x, fValue]);
  const ySliceTangent = useMemo(() => tangentLineExpression(gradient.dfdy, probe.y, fValue, "y"), [gradient.dfdy, probe.y, fValue]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">Click to move the probe point</p>
            {!error && (
              <ContourCanvas expression={raw} domain={DOMAIN} probePoint={probe} arrows={[{ ...gradient, color: "#fff" }]} onPick={setProbe} size={360} />
            )}
          </div>

          {!error && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">x-slice: f(x, {round(probe.y)})</p>
                <div className="h-40">
                  <GraphCanvas key={`x-${raw}`} initialXDomain={DOMAIN} initialYDomain={domainZ} showGrid={false}>
                    <FunctionPlot expression={raw} scope={{ y: probe.y }} color="var(--color-chart-2)" strokeWidth={2} />
                    <FunctionPlot expression={xSliceTangent} color="var(--color-chart-4)" strokeWidth={1.5} />
                    <Point x={probe.x} y={fValue} color="var(--color-chart-2)" radius={4} />
                  </GraphCanvas>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">y-slice: f({round(probe.x)}, y)</p>
                <div className="h-40">
                  <GraphCanvas key={`y-${raw}`} initialXDomain={DOMAIN} initialYDomain={domainZ} showGrid={false}>
                    <FunctionPlot expression={raw} variable="y" scope={{ x: probe.x }} color="var(--color-chart-3)" strokeWidth={2} />
                    <FunctionPlot expression={ySliceTangent} variable="y" color="var(--color-chart-4)" strokeWidth={1.5} />
                    <Point x={probe.y} y={fValue} color="var(--color-chart-3)" radius={4} />
                  </GraphCanvas>
                </div>
              </div>
            </div>
          )}
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
          <span className="flex items-center font-mono text-sm text-muted-foreground">f(x,y) =</span>
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" placeholder="e.g. sin(x)*cos(y)" />
          <Button type="submit">Plot</Button>
        </form>

        {error && <p className="text-sm text-destructive">Couldn&apos;t parse this: {error}</p>}

        {!error && (
          <>
            <div className="flex flex-col gap-1 rounded-md border border-border p-3 font-mono text-sm">
              <p>
                f({round(probe.x)}, {round(probe.y)}) = {round(fValue)}
              </p>
              <p className="text-chart-2">∂f/∂x = {round(gradient.dfdx)}</p>
              <p className="text-chart-3">∂f/∂y = {round(gradient.dfdy)}</p>
              <p className="mt-1 text-muted-foreground">|∇f| = {round(gradientMag)}</p>
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Double integral</p>
              <p className="mt-1 font-mono text-sm">
                ∬ f dA over [{DOMAIN[0]}, {DOMAIN[1]}]² ≈ <span className="text-foreground">{round(volume)}</span>
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
