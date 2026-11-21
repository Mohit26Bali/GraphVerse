"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { symbolicDerivative, tangentAt } from "@/math-engine/derivative";

const DOMAIN: [number, number] = [-6, 6];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function DerivativeSandbox() {
  const [draft, setDraft] = useState("x^3-3*x");
  const [raw, setRaw] = useState("x^3-3*x");
  const [x0, setX0] = useState(1);

  const derivResult = useMemo(() => {
    try {
      return { expr: symbolicDerivative(raw), error: null as string | null };
    } catch {
      return { expr: null, error: "Couldn't differentiate that expression." };
    }
  }, [raw]);

  const evalError = useMemo(() => {
    try {
      compileFunction(raw).evaluate(1);
      return null;
    } catch {
      return "Couldn't parse that expression.";
    }
  }, [raw]);

  const error = evalError ?? derivResult.error;

  const tangent = useMemo(() => {
    if (error || !derivResult.expr) return null;
    return tangentAt(compileFunction(raw), compileFunction(derivResult.expr), x0);
  }, [raw, derivResult, x0, error]);

  const y0 = error ? NaN : compileFunction(raw).evaluate(x0);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1 border-b border-border md:border-r md:border-b-0">
          <div className="h-full">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-8, 8]}>
              {!error && (
                <>
                  <FunctionPlot expression={raw} color="var(--color-chart-2)" />
                  {tangent && Number.isFinite(tangent.slope) && (
                    <FunctionPlot
                      expression="m*x+b"
                      scope={{ m: tangent.slope, b: tangent.intercept }}
                      color="var(--color-chart-4)"
                      strokeWidth={2}
                    />
                  )}
                  {Number.isFinite(y0) && <Point x={x0} y={y0} color="var(--color-chart-2)" radius={5} />}
                </>
              )}
            </GraphCanvas>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <div className="h-full">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-8, 8]}>
              {!error && derivResult.expr && (
                <>
                  <FunctionPlot expression={derivResult.expr} color="var(--color-chart-4)" />
                  {tangent && Number.isFinite(tangent.slope) && (
                    <Point x={x0} y={tangent.slope} color="var(--color-chart-4)" radius={5} />
                  )}
                </>
              )}
            </GraphCanvas>
          </div>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
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

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">f&apos;(x) = {derivResult.expr}</p>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Point (x)</Label>
            <span className="font-mono">{x0.toFixed(2)}</span>
          </div>
          <Slider min={DOMAIN[0]} max={DOMAIN[1]} step={0.02} value={[x0]} onValueChange={(v) => setX0(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        {tangent && (
          <p className="text-sm text-muted-foreground">
            slope at x = {round(x0)}:{" "}
            <span className="font-mono text-foreground">
              {Number.isFinite(tangent.slope) ? round(tangent.slope) : "undefined"}
            </span>
          </p>
        )}
      </aside>
    </div>
  );
}
