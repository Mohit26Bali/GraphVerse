"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quadraticRoots, formatVertexEquation } from "@/math-engine/quadratic";
import { X, Plus } from "lucide-react";

interface SandboxParabola {
  id: string;
  a: number;
  h: number;
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

function newParabola(index: number): SandboxParabola {
  return { id: crypto.randomUUID(), a: 1, h: index, k: 0, color: PALETTE[index % PALETTE.length] };
}

export function QuadraticSandbox() {
  const [parabolas, setParabolas] = useState<SandboxParabola[]>([newParabola(0)]);

  const addParabola = useCallback(() => {
    setParabolas((prev) => [...prev, newParabola(prev.length)]);
  }, []);

  const removeParabola = useCallback((id: string) => {
    setParabolas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateParabola = useCallback(
    (id: string, patch: Partial<Pick<SandboxParabola, "a" | "h" | "k">>) => {
      setParabolas((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          {parabolas.map((p) => (
            <FunctionPlot
              key={p.id}
              expression="a*(x-h)^2+k"
              scope={{ a: p.a, h: p.h, k: p.k }}
              color={p.color}
              label={formatVertexEquation(p.a, p.h, p.k)}
            />
          ))}
          {parabolas.map((p) => (
            <Point
              key={`${p.id}-vertex`}
              x={p.h}
              y={p.k}
              color={p.color}
              radius={4}
              tooltip={`vertex (${p.h}, ${p.k})`}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-3 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Parabolas</p>
          <Button variant="ghost" size="sm" onClick={addParabola}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {parabolas.map((p) => {
            const roots = quadraticRoots(p);
            return (
              <div key={p.id} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                  {(["a", "h", "k"] as const).map((key) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="font-mono text-xs text-muted-foreground">{key}</span>
                      <Input
                        type="number"
                        step={0.5}
                        value={p[key]}
                        onChange={(e) => updateParabola(p.id, { [key]: Number(e.target.value) })}
                        className="h-8 w-14 font-mono text-sm"
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeParabola(p.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="pl-4.5 font-mono text-xs text-muted-foreground">
                  {formatVertexEquation(p.a, p.h, p.k)} · vertex ({p.h}, {p.k}) · roots{" "}
                  {roots.length === 0 ? "none" : roots.map((r) => r.toFixed(2)).join(", ")}
                </p>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
