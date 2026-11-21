"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point, ReferenceLine } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { analyzeLimit, epsilonTable } from "@/math-engine/limits";
import { CLASSIFICATION_INFO } from "./classificationInfo";

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function fmt(n: number): string {
  return Number.isFinite(n) ? round(n).toString() : "undefined";
}

export function LimitSandbox() {
  const [draft, setDraft] = useState("(x^2-4)/(x-2)");
  const [raw, setRaw] = useState("(x^2-4)/(x-2)");
  const [a, setA] = useState(2);

  const error = useMemo(() => {
    try {
      compileFunction(raw).evaluate(a + 1);
      return null;
    } catch {
      return "Couldn't parse that expression.";
    }
  }, [raw, a]);

  const fn = useMemo(() => compileFunction(raw), [raw]);
  const analysis = useMemo(() => (error ? null : analyzeLimit(fn, a)), [fn, a, error]);
  const table = useMemo(() => (error ? [] : epsilonTable(fn, a)), [fn, a, error]);
  const info = analysis ? CLASSIFICATION_INFO[analysis.classification] : null;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-6, 6]}>
          {!error && (
            <>
              <FunctionPlot expression={raw} />
              {analysis?.classification === "infinite" && (
                <ReferenceLine orientation="vertical" at={a} label={`x = ${round(a)}`} />
              )}
              {analysis?.classification === "continuous" && (
                <Point x={a} y={analysis.functionValue} radius={5} />
              )}
              {analysis?.classification === "removable" && analysis.limitValue !== null && (
                <Point x={a} y={analysis.limitValue} filled={false} radius={5} />
              )}
              {analysis?.classification === "jump" && (
                <>
                  <Point x={a} y={analysis.leftLimit} color="var(--color-chart-2)" radius={5} />
                  <Point x={a} y={analysis.rightLimit} color="var(--color-chart-4)" radius={5} />
                </>
              )}
            </>
          )}
        </GraphCanvas>
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
            <Label>Point of interest (a)</Label>
            <span className="font-mono">{a.toFixed(2)}</span>
          </div>
          <Slider min={-5} max={5} step={0.05} value={[a]} onValueChange={(v) => setA(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        {info && (
          <div className={`rounded-md border p-3 text-sm ${info.colorClass}`}>
            <p className="font-medium">{info.label}</p>
            <p className="mt-1 text-muted-foreground">{info.explanation}</p>
          </div>
        )}

        {table.length > 0 && (
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="border-b border-border pb-1 text-left font-normal">ε</th>
                <th className="border-b border-border pb-1 text-left font-normal">f(a-ε)</th>
                <th className="border-b border-border pb-1 text-left font-normal">f(a+ε)</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.epsilon}>
                  <td className="py-0.5">{row.epsilon}</td>
                  <td className="py-0.5">{fmt(row.left)}</td>
                  <td className="py-0.5">{fmt(row.right)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </aside>
    </div>
  );
}
