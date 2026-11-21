"use client";

import { useState } from "react";
import { GraphCanvas, FunctionPlot, ReferenceLine } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Equation } from "@/components/shared/Equation";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import {
  expTemplate,
  expRateTemplate,
  rateToBase,
  discreteDoublingTime,
  continuousDoublingTime,
  formatExpLatex,
  formatExpRateLatex,
} from "@/math-engine/exponential";
import { CONTEXTS } from "./contexts";

type Mode = "discrete" | "continuous";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function ExponentialExplore() {
  const [mode, setMode] = useState<Mode>("discrete");
  const [contextId, setContextId] = useState(CONTEXTS[0].id);
  const [A, setA] = useState(1);
  const [b, setB] = useState(2);
  const [r, setR] = useState(0.5);
  const [k, setK] = useState(0);
  const [sampleX, setSampleX] = useState(3);

  const context = CONTEXTS.find((c) => c.id === contextId) ?? CONTEXTS[0];
  const effectiveB = mode === "discrete" ? b : rateToBase(r);
  const sampleY = A * Math.pow(effectiveB, sampleX) + k;

  const doublingLabel =
    mode === "discrete" ? round(discreteDoublingTime(b)) : round(continuousDoublingTime(r));
  const isGrowth = mode === "discrete" ? b > 1 : r > 0;

  const explainState = useExplain();
  const buildContext = (next: { A: number; b: number; r: number; k: number; sampleX: number }) => {
    const effB = mode === "discrete" ? next.b : rateToBase(next.r);
    const y = next.A * Math.pow(effB, next.sampleX) + next.k;
    const doubling = mode === "discrete" ? round(discreteDoublingTime(next.b)) : round(continuousDoublingTime(next.r));
    const growing = mode === "discrete" ? next.b > 1 : next.r > 0;
    return (
      `${context.label} scenario, using the ${mode} model: A=${round(next.A)}, ` +
      `${mode === "discrete" ? `growth factor b=${round(next.b)}` : `continuous rate r=${round(next.r)}`}, vertical shift k=${round(next.k)}. ` +
      `The quantity is ${growing ? "growing" : "decaying"}, with a ${growing ? "doubling" : "halving"} time of about ${Number.isFinite(doubling) ? Math.abs(doubling) : "—"}. ` +
      `At x=${round(next.sampleX)}, y=${round(y)}.`
    );
  };
  const explainAfterCommit = (next: { A: number; b: number; r: number; k: number; sampleX: number }) =>
    explainState.explain({ moduleTitle: "Exponential Functions", context: buildContext(next) });

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-2, 10]}>
          <ReferenceLine orientation="horizontal" at={k} label={`asymptote y = ${round(k)}`} />
          {mode === "discrete" ? (
            <FunctionPlot expression={expTemplate} scope={{ A, b, k }} label={formatExpLatex(A, b, k).replace("y = ", "")} />
          ) : (
            <FunctionPlot expression={expRateTemplate} scope={{ A, r, k }} label={formatExpRateLatex(A, r, k).replace("y = ", "")} />
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {CONTEXTS.map((c) => (
            <button
              key={c.id}
              onClick={() => setContextId(c.id)}
              className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                c.id === contextId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(["discrete", "continuous"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${
                m === mode
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "discrete" ? "Discrete (bˣ)" : "Continuous (e^(rx))"}
            </button>
          ))}
        </div>

        <Equation tex={mode === "discrete" ? formatExpLatex(A, b, k) : formatExpRateLatex(A, r, k)} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>{context.aLabel}</Label>
            <span className="font-mono">{A.toFixed(1)}</span>
          </div>
          <Slider
            min={0.1}
            max={5}
            step={0.1}
            value={[A]}
            onValueChange={(v) => setA(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        {mode === "discrete" ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <Label>Growth factor (b)</Label>
              <span className="font-mono">{b.toFixed(2)}</span>
            </div>
            <Slider
              min={0.1}
              max={3}
              step={0.05}
              value={[b]}
              onValueChange={(v) => setB(Array.isArray(v) ? v[0] : (v as number))}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <Label>Rate (r)</Label>
              <span className="font-mono">{r.toFixed(2)}</span>
            </div>
            <Slider
              min={-2}
              max={2}
              step={0.05}
              value={[r]}
              onValueChange={(v) => setR(Array.isArray(v) ? v[0] : (v as number))}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Vertical shift / asymptote (k)</Label>
            <span className="font-mono">{k.toFixed(1)}</span>
          </div>
          <Slider
            min={-3}
            max={3}
            step={0.1}
            value={[k]}
            onValueChange={(v) => setK(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className="flex flex-col gap-1 rounded-md border border-border p-3 text-sm text-muted-foreground">
          <p>
            {isGrowth ? "Doubling" : "Halving"} time:{" "}
            <span className="font-mono text-foreground">
              {Number.isFinite(doublingLabel) ? Math.abs(doublingLabel) : "—"}
            </span>
          </p>
          <div className="flex items-center justify-between">
            <Label>Sample at x</Label>
            <span className="font-mono">{sampleX.toFixed(1)}</span>
          </div>
          <Slider
            min={-5}
            max={5}
            step={0.1}
            value={[sampleX]}
            onValueChange={(v) => setSampleX(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <p className="text-sm text-muted-foreground">{context.describe(A, effectiveB, sampleX, sampleY)}</p>

        <ExplainPanel state={explainState} onRequest={() => explainAfterCommit({ A, b, r, k, sampleX })} />
      </aside>
    </div>
  );
}
