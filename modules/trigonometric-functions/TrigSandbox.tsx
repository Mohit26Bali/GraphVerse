"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trigTemplate, trigScope, type TrigKind, type TrigParams } from "@/math-engine/trig";
import { X, Plus } from "lucide-react";

const KIND_CYCLE: Record<TrigKind, TrigKind> = { sin: "cos", cos: "tan", tan: "sin" };

interface SandboxWave extends TrigParams {
  id: string;
  kind: TrigKind;
  color: string;
}

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const DEFAULT_KINDS: TrigKind[] = ["sin", "cos"];

function newWave(index: number): SandboxWave {
  return {
    id: crypto.randomUUID(),
    kind: DEFAULT_KINDS[index % DEFAULT_KINDS.length],
    amplitude: 1,
    frequency: index + 1,
    phase: 0,
    shift: 0,
    color: PALETTE[index % PALETTE.length],
  };
}

export function TrigSandbox() {
  const [waves, setWaves] = useState<SandboxWave[]>([newWave(0), newWave(1)]);

  const addWave = useCallback(() => {
    setWaves((prev) => [...prev, newWave(prev.length)]);
  }, []);

  const removeWave = useCallback((id: string) => {
    setWaves((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWave = useCallback((id: string, patch: Partial<Omit<SandboxWave, "id" | "color">>) => {
    setWaves((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-8, 8]} initialYDomain={[-4, 4]}>
          {waves.map((w) => (
            <FunctionPlot
              key={w.id}
              expression={trigTemplate(w.kind)}
              scope={trigScope(w)}
              color={w.color}
              label={`${w.kind}(x): A=${w.amplitude}, B=${w.frequency}, C=${w.phase}, D=${w.shift}`}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-3 overflow-y-auto border-t border-border p-4 md:w-104 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Waves</p>
          <Button variant="ghost" size="sm" onClick={addWave}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {waves.map((w) => (
            <div key={w.id} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: w.color }} />
                <button
                  onClick={() => updateWave(w.id, { kind: KIND_CYCLE[w.kind] })}
                  className="w-10 rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  {w.kind}
                </button>
                {(
                  [
                    { key: "amplitude", label: "A" },
                    { key: "frequency", label: "B" },
                    { key: "phase", label: "C" },
                    { key: "shift", label: "D" },
                  ] as const
                ).map((field) => (
                  <div key={field.key} className="flex items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground">{field.label}</span>
                    <Input
                      type="number"
                      step={0.5}
                      value={w[field.key]}
                      onChange={(e) => updateWave(w.id, { [field.key]: Number(e.target.value) })}
                      className="h-8 w-14 font-mono text-sm"
                    />
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeWave(w.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
