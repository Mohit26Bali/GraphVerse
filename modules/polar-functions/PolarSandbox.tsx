"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, ParametricPlot } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POLAR_CURVES, getPolarCurveById, polarDefaultParams, toCartesianExpressions } from "@/math-engine/polar";
import { X, Plus } from "lucide-react";

interface SandboxCurve {
  id: string;
  curveId: string;
  params: Record<string, number>;
  color: string;
}

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function newCurve(index: number): SandboxCurve {
  const def = POLAR_CURVES[index % POLAR_CURVES.length];
  return { id: crypto.randomUUID(), curveId: def.id, params: polarDefaultParams(def), color: PALETTE[index % PALETTE.length] };
}

export function PolarSandbox() {
  const [curves, setCurves] = useState<SandboxCurve[]>([newCurve(0), newCurve(1)]);

  const addCurve = useCallback(() => {
    setCurves((prev) => [...prev, newCurve(prev.length)]);
  }, []);

  const removeCurve = useCallback((id: string) => {
    setCurves((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setCurveKind = useCallback((id: string, curveId: string) => {
    setCurves((prev) =>
      prev.map((c) => (c.id === id ? { ...c, curveId, params: polarDefaultParams(getPolarCurveById(curveId)) } : c)),
    );
  }, []);

  const updateParam = useCallback((id: string, key: string, value: number) => {
    setCurves((prev) =>
      prev.map((c) => (c.id === id ? { ...c, params: { ...c.params, [key]: value } } : c)),
    );
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-10, 10]} initialYDomain={[-10, 10]}>
          {curves.map((c) => {
            const def = getPolarCurveById(c.curveId);
            const { xExpression, yExpression } = toCartesianExpressions(def.rExpression);
            return (
              <ParametricPlot
                key={c.id}
                xExpression={xExpression}
                yExpression={yExpression}
                scope={c.params}
                tDomain={[0, def.tMax(c.params)]}
                color={c.color}
                label={def.label}
              />
            );
          })}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-3 overflow-y-auto border-t border-border p-4 md:w-md md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Curves</p>
          <Button variant="ghost" size="sm" onClick={addCurve}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {curves.map((c) => {
            const def = getPolarCurveById(c.curveId);
            return (
              <div key={c.id} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                  <select
                    value={c.curveId}
                    onChange={(e) => setCurveKind(c.id, e.target.value)}
                    className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-sm"
                  >
                    {POLAR_CURVES.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeCurve(c.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {def.params.map((p) => (
                    <div key={p.key} className="flex items-center gap-1">
                      <span className="font-mono text-xs text-muted-foreground">{p.key}</span>
                      <Input
                        type="number"
                        step={p.step}
                        value={c.params[p.key] ?? p.default}
                        onChange={(e) => updateParam(c.id, p.key, Number(e.target.value))}
                        className="h-7 w-14 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
