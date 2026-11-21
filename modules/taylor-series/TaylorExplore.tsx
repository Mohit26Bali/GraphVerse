"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSweep } from "@/animation-engine";
import { compileFunction } from "@/math-engine/evaluate";
import { taylorCoefficients, taylorExpression, formatTaylorSummary } from "@/math-engine/taylor";
import { ErrorShading } from "./ErrorShading";
import { TAYLOR_PRESETS } from "./presets";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { Play, Pause } from "lucide-react";

const DOMAIN: [number, number] = [-6, 6];
const MAX_ORDER = 10;

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function TaylorExplore() {
  const [presetId, setPresetId] = useState(TAYLOR_PRESETS[0].id);
  const preset = TAYLOR_PRESETS.find((p) => p.id === presetId) ?? TAYLOR_PRESETS[0];

  const { value: orderFloat, isPlaying, toggle, setValue: setOrderFloat } = useSweep({
    min: 0,
    max: MAX_ORDER,
    speed: 1.5,
    loop: false,
  });
  const order = Math.round(orderFloat);

  const terms = useMemo(() => taylorCoefficients(preset.raw, 0, MAX_ORDER), [preset]);
  const polyExpr = useMemo(
    () => taylorExpression(terms.slice(0, order + 1), 0),
    [terms, order],
  );

  const maxError = useMemo(() => {
    const f = compileFunction(preset.raw);
    const p = compileFunction(polyExpr);
    let worst = 0;
    for (let i = 0; i <= 100; i++) {
      const x = DOMAIN[0] + (i / 100) * (DOMAIN[1] - DOMAIN[0]);
      const diff = Math.abs(f.evaluate(x) - p.evaluate(x));
      if (Number.isFinite(diff)) worst = Math.max(worst, diff);
    }
    return worst;
  }, [preset, polyExpr]);

  const selectPreset = useCallback(
    (id: string) => {
      setPresetId(id);
      setOrderFloat(0);
    },
    [setOrderFloat],
  );

  const explainState = useExplain();

  const buildContext = () =>
    `Approximating ${preset.label} with a Taylor polynomial centered at x=0, currently using terms up to degree ${order}: ` +
    `P(x) = ${formatTaylorSummary(terms.slice(0, order + 1), 0)}. ` +
    `Max error over [${DOMAIN[0]}, ${DOMAIN[1]}] is ${round(maxError)} — ${
      order === 0 ? "no terms yet, a poor fit" : maxError < 0.5 ? "a close fit" : "still a noticeable gap far from the center"
    }.`;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-4, 4]}>
          <ErrorShading expressionA={preset.raw} expressionB={polyExpr} domain={DOMAIN} />
          <FunctionPlot expression={preset.raw} color="var(--color-chart-2)" strokeWidth={2} label={preset.label} />
          <FunctionPlot expression={polyExpr} color="var(--color-chart-4)" strokeWidth={2} label={`degree ${order} polynomial`} />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {TAYLOR_PRESETS.map((p) => (
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

        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={toggle} disabled={order >= MAX_ORDER && !isPlaying}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            Degree <span className="font-mono text-foreground">{order}</span> polynomial
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Terms (degree)</Label>
            <span className="font-mono">{order}</span>
          </div>
          <Slider min={0} max={MAX_ORDER} step={1} value={[order]} onValueChange={(v) => setOrderFloat(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <p className="font-mono text-xs break-words text-muted-foreground">
          P(x) = {formatTaylorSummary(terms.slice(0, order + 1), 0)}
        </p>

        <p className="text-sm text-muted-foreground">
          Max error over [{DOMAIN[0]}, {DOMAIN[1]}]:{" "}
          <span className="font-mono text-foreground">{round(maxError)}</span>
        </p>

        <p className="text-sm text-muted-foreground">
          The shaded region is where the polynomial and the true function disagree — watch it
          shrink near x = 0 as you add terms, while it can stay large (or grow) far from center.
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Taylor Series", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
