"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, DiscreteSeries, ReferenceLine } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSweep } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { partialSums, sequenceTerms } from "@/math-engine/sequences";
import { SERIES_PRESETS } from "./presets";
import { Play, Pause } from "lucide-react";

const DOMAIN_X: [number, number] = [0, 52];
const MAX_N = 50;

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function SequencesExplore() {
  const [presetId, setPresetId] = useState(SERIES_PRESETS[0].id);
  const preset = SERIES_PRESETS.find((p) => p.id === presetId) ?? SERIES_PRESETS[0];
  const [showTerms, setShowTerms] = useState(false);

  const { value: nFloat, isPlaying, toggle, setValue: setNFloat } = useSweep({
    min: 1,
    max: MAX_N,
    speed: 15,
    loop: false,
  });
  const n = Math.round(nFloat);

  const sums = useMemo(() => partialSums(preset.termExpression, MAX_N), [preset]);
  const terms = useMemo(() => sequenceTerms(preset.termExpression, MAX_N), [preset]);

  const visibleSums = sums.slice(0, n).map((p) => ({ x: p.n, y: p.value }));
  const visibleTerms = terms.slice(0, n).map((p) => ({ x: p.n, y: p.value }));
  const currentSum = sums[n - 1]?.value ?? 0;

  // Domains are sized from the full 50-term run (not just what's currently visible) so the
  // axes stay fixed while animating — otherwise the view would keep rescaling as n grows.
  const domainY = useMemo<[number, number]>(() => {
    const values = [0, ...sums.map((p) => p.value), ...(preset.limit !== null ? [preset.limit] : [])];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.15, 0.3);
    return [min - pad, max + pad];
  }, [sums, preset.limit]);

  const selectPreset = useCallback(
    (id: string) => {
      setPresetId(id);
      setNFloat(1);
    },
    [setNFloat],
  );

  const explainState = useExplain();

  const buildContext = () =>
    `Series ${preset.label}: ${preset.description} After summing ${n} terms, the partial sum is ${round(currentSum)}. ` +
    (preset.limit === null
      ? "This series diverges — the partial sums never settle on a finite value, they just keep growing."
      : `The partial sums converge to ${round(preset.limit)} as more terms are added.`);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas key={presetId} initialXDomain={DOMAIN_X} initialYDomain={domainY}>
          {preset.limit !== null && (
            <ReferenceLine orientation="horizontal" at={preset.limit} tooltip={`limit ≈ ${round(preset.limit)}`} />
          )}
          {showTerms ? (
            <DiscreteSeries points={visibleTerms} color="var(--color-chart-2)" label="terms (aₙ)" />
          ) : (
            <DiscreteSeries points={visibleSums} color="var(--color-chart-1)" label="partial sums (Sₙ)" />
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Series</p>
          <div className="flex flex-wrap gap-1.5">
            {SERIES_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPreset(p.id)}
                className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                  p.id === presetId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{preset.description}</p>

        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={toggle} disabled={n >= MAX_N && !isPlaying}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            Summing <span className="font-mono text-foreground">{n}</span> term{n === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Terms (n)</Label>
            <span className="font-mono">{n}</span>
          </div>
          <Slider min={1} max={MAX_N} step={1} value={[n]} onValueChange={(v) => setNFloat(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <div className="flex items-center gap-2">
          <Switch id="terms-toggle" checked={showTerms} onCheckedChange={setShowTerms} />
          <Label htmlFor="terms-toggle">Show individual terms instead of the running sum</Label>
        </div>

        <p className="text-sm text-muted-foreground">
          Partial sum S<sub>{n}</sub>: <span className="font-mono text-foreground">{round(currentSum)}</span>
        </p>

        <p className="text-sm text-muted-foreground">
          {preset.limit === null
            ? "Diverges — the running sum never levels off, it keeps climbing (just slowly)."
            : `Converges to ${round(preset.limit)} — watch the dots flatten toward the dashed line as n grows.`}
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Sequences & Series", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
