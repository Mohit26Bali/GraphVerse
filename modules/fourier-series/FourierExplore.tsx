"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSweep } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import {
  fourierCoefficients,
  reconstructionExpression,
  WAVE_REFERENCE,
  type WaveKind,
} from "@/math-engine/fourier";
import { EpicycleChain } from "./EpicycleChain";
import { Play, Pause } from "lucide-react";

const WAVES: { id: WaveKind; label: string }[] = [
  { id: "square", label: "Square wave" },
  { id: "sawtooth", label: "Sawtooth wave" },
  { id: "triangle", label: "Triangle wave" },
];

const T_MAX = 2 * Math.PI;

export function FourierExplore() {
  const [kind, setKind] = useState<WaveKind>("square");
  const [termCount, setTermCount] = useState(5);
  const [hasStarted, setHasStarted] = useState(false);

  const { value: t, isPlaying, toggle, setValue: setT } = useSweep({ min: 0, max: T_MAX, speed: 1, loop: true });

  const harmonics = useMemo(() => fourierCoefficients(kind, termCount), [kind, termCount]);
  const signalExpr = useMemo(() => reconstructionExpression(harmonics), [harmonics]);
  const guardedSignal = hasStarted ? `(x <= ${t}) ? (${signalExpr}) : NaN` : signalExpr;

  const handlePlay = useCallback(() => {
    setHasStarted(true);
    toggle();
  }, [toggle]);

  const selectWave = useCallback(
    (id: WaveKind) => {
      setKind(id);
      setHasStarted(false);
      setT(0);
    },
    [setT],
  );

  const explainState = useExplain();

  const buildContext = () =>
    `Approximating a ${WAVES.find((w) => w.id === kind)?.label.toLowerCase() ?? kind} using a Fourier series with ${harmonics.length} harmonic${harmonics.length === 1 ? "" : "s"}. ` +
    `Each harmonic is a spinning circle chained tip-to-tip to the previous one; the tip's height over time traces the reconstructed wave. More harmonics make the reconstruction sharper and closer to the target wave.`;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="aspect-square w-full shrink-0 md:h-full md:w-80">
          <GraphCanvas initialXDomain={[-2, 2]} initialYDomain={[-2, 2]} showGrid={false}>
            <EpicycleChain harmonics={harmonics} t={t} />
          </GraphCanvas>
        </div>
        <div className="min-h-0 flex-1">
          <GraphCanvas initialXDomain={[0, T_MAX]} initialYDomain={[-1.6, 1.6]}>
            <FunctionPlot expression={WAVE_REFERENCE[kind]} color="var(--color-border)" strokeWidth={1.5} label="target wave" />
            <FunctionPlot expression={guardedSignal} color="var(--color-chart-4)" strokeWidth={2} label="reconstruction" />
          </GraphCanvas>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {WAVES.map((w) => (
            <button
              key={w.id}
              onClick={() => selectWave(w.id)}
              className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                w.id === kind
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={handlePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            {harmonics.length} harmonic{harmonics.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Harmonics</Label>
            <span className="font-mono">{termCount}</span>
          </div>
          <Slider min={1} max={20} step={1} value={[termCount]} onValueChange={(v) => setTermCount(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <p className="text-sm text-muted-foreground">
          Each circle spins {harmonics.length > 0 ? "at a whole-number multiple of the base frequency" : ""} and is
          chained to the tip of the last — the final tip&apos;s height, traced over time, is the
          sum of every circle&apos;s contribution.
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Fourier Series", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
