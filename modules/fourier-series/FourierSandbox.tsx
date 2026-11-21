"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSweep } from "@/animation-engine";
import { reconstructionExpression, type Harmonic } from "@/math-engine/fourier";
import { EpicycleChain } from "./EpicycleChain";
import { X, Plus, Play, Pause } from "lucide-react";

interface EditableHarmonic extends Harmonic {
  id: string;
}

const T_MAX = 2 * Math.PI;

function newHarmonic(index: number): EditableHarmonic {
  return { id: crypto.randomUUID(), k: index + 1, amplitude: 1 / (index + 1) };
}

export function FourierSandbox() {
  const [harmonics, setHarmonics] = useState<EditableHarmonic[]>([newHarmonic(0), newHarmonic(1)]);
  const { value: t, isPlaying, toggle } = useSweep({ min: 0, max: T_MAX, speed: 1, loop: true });

  const signalExpr = useMemo(() => reconstructionExpression(harmonics), [harmonics]);

  const addHarmonic = useCallback(() => {
    setHarmonics((prev) => [...prev, newHarmonic(prev.length)]);
  }, []);

  const removeHarmonic = useCallback((id: string) => {
    setHarmonics((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHarmonic = useCallback((id: string, patch: Partial<Pick<EditableHarmonic, "k" | "amplitude">>) => {
    setHarmonics((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="aspect-square w-full shrink-0 md:h-full md:w-72">
          <GraphCanvas initialXDomain={[-2, 2]} initialYDomain={[-2, 2]} showGrid={false}>
            <EpicycleChain harmonics={harmonics} t={t} />
          </GraphCanvas>
        </div>
        <div className="min-h-0 flex-1">
          <GraphCanvas initialXDomain={[0, T_MAX]} initialYDomain={[-2, 2]}>
            <FunctionPlot expression={signalExpr} color="var(--color-chart-4)" strokeWidth={2} />
          </GraphCanvas>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-3 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Harmonics</p>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={toggle}>
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={addHarmonic}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {harmonics.map((h) => (
            <div key={h.id} className="flex items-center gap-2 rounded-md border border-border p-2">
              <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">k</span>
              <Input
                type="number"
                step={1}
                min={1}
                value={h.k}
                onChange={(e) => updateHarmonic(h.id, { k: Math.max(1, Number(e.target.value)) })}
                className="h-8 w-16 font-mono text-sm"
              />
              <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">amp</span>
              <Input
                type="number"
                step={0.1}
                value={h.amplitude}
                onChange={(e) => updateHarmonic(h.id, { amplitude: Number(e.target.value) })}
                className="h-8 w-20 font-mono text-sm"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeHarmonic(h.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Mix any harmonics you like — k is the multiple of the base frequency, amplitude is how
          large that circle is.
        </p>
      </aside>
    </div>
  );
}
