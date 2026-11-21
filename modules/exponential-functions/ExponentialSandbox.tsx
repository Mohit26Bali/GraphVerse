"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { expTemplate, formatExpLatex } from "@/math-engine/exponential";
import { X, Plus } from "lucide-react";

interface SandboxCurve {
  id: string;
  A: number;
  b: number;
  k: number;
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
  return { id: crypto.randomUUID(), A: 1, b: 1.5 + index * 0.3, k: 0, color: PALETTE[index % PALETTE.length] };
}

export function ExponentialSandbox() {
  const [curves, setCurves] = useState<SandboxCurve[]>([newCurve(0), newCurve(1)]);

  const addCurve = useCallback(() => {
    setCurves((prev) => [...prev, newCurve(prev.length)]);
  }, []);

  const removeCurve = useCallback((id: string) => {
    setCurves((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCurve = useCallback((id: string, patch: Partial<Pick<SandboxCurve, "A" | "b" | "k">>) => {
    setCurves((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-2, 10]}>
          {curves.map((c) => (
            <FunctionPlot
              key={c.id}
              expression={expTemplate}
              scope={{ A: c.A, b: c.b, k: c.k }}
              color={c.color}
              label={formatExpLatex(c.A, c.b, c.k).replace("y = ", "")}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-3 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Curves</p>
          <Button variant="ghost" size="sm" onClick={addCurve}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {curves.map((c) => (
            <div key={c.id} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                {(["A", "b", "k"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground">{key}</span>
                    <Input
                      type="number"
                      step={key === "b" ? 0.1 : 0.5}
                      value={c[key]}
                      onChange={(e) => updateCurve(c.id, { [key]: Number(e.target.value) })}
                      className="h-8 w-16 font-mono text-sm"
                    />
                  </div>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeCurve(c.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="pl-4.5 font-mono text-xs text-muted-foreground">
                {c.b > 1 ? "growth" : c.b < 1 ? "decay" : "constant"}, asymptote y = {c.k}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
