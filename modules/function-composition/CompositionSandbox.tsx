"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compileFunction } from "@/math-engine/evaluate";
import { composeExpressions } from "@/math-engine/composition";

export function CompositionSandbox() {
  const [fRaw, setFRaw] = useState("x^2");
  const [gRaw, setGRaw] = useState("sin(x)");

  const gf = useMemo(() => composeExpressions(gRaw, fRaw), [gRaw, fRaw]);
  const fg = useMemo(() => composeExpressions(fRaw, gRaw), [fRaw, gRaw]);

  const error = useMemo(() => {
    try {
      compileFunction(fRaw).evaluate(1);
      compileFunction(gRaw).evaluate(1);
      return null;
    } catch {
      return "Couldn't parse one of the expressions.";
    }
  }, [fRaw, gRaw]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-6, 6]}>
          {!error && (
            <>
              <FunctionPlot expression={fRaw} color="var(--color-chart-2)" strokeWidth={1.5} label={`f(x) = ${fRaw}`} />
              <FunctionPlot expression={gRaw} color="var(--color-chart-4)" strokeWidth={1.5} label={`g(x) = ${gRaw}`} />
              <FunctionPlot expression={gf} strokeWidth={3} label="g(f(x))" />
              <FunctionPlot expression={fg} color="var(--color-chart-5)" strokeWidth={3} label="f(g(x))" />
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div className="flex flex-col gap-2">
          <Label>f(x)</Label>
          <Input value={fRaw} onChange={(e) => setFRaw(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>g(x)</Label>
          <Input value={gRaw} onChange={(e) => setGRaw(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" />
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
            <p>g(f(x)) = {gf}</p>
            <p>f(g(x)) = {fg}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          g(f(x)) and f(g(x)) are usually different curves — composition doesn&apos;t commute,
          the order you apply the functions in matters.
        </p>
      </aside>
    </div>
  );
}
