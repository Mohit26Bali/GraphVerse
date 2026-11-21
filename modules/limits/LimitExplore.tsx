"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point, ReferenceLine } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { compileFunction } from "@/math-engine/evaluate";
import { analyzeLimit, epsilonTable } from "@/math-engine/limits";
import { LIMIT_PRESETS } from "./presets";
import { CLASSIFICATION_INFO } from "./classificationInfo";

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function fmt(n: number): string {
  return Number.isFinite(n) ? round(n).toString() : "undefined";
}

export function LimitExplore() {
  const [presetId, setPresetId] = useState(LIMIT_PRESETS[0].id);
  const preset = LIMIT_PRESETS.find((p) => p.id === presetId) ?? LIMIT_PRESETS[0];
  const [a, setA] = useState(preset.a);
  const [zoomT, setZoomT] = useState(0.3);

  const fn = useMemo(() => compileFunction(preset.raw), [preset]);
  const analysis = useMemo(() => analyzeLimit(fn, a), [fn, a]);
  const table = useMemo(() => epsilonTable(fn, a), [fn, a]);
  const info = CLASSIFICATION_INFO[analysis.classification];

  const delta = 2 * Math.pow(10, -4 * zoomT);
  const centerY = analysis.limitValue ?? (Number.isFinite(analysis.functionValue) ? analysis.functionValue : 0);

  const explainState = useExplain();
  const buildContext = (nextA: number = a) => {
    const nextAnalysis = analyzeLimit(fn, nextA);
    const nextInfo = CLASSIFICATION_INFO[nextAnalysis.classification];
    return (
      `Function f(x) = ${preset.raw}, approaching x = ${round(nextA)}. ` +
      `Left-hand limit ≈ ${fmt(nextAnalysis.leftLimit)}, right-hand limit ≈ ${fmt(nextAnalysis.rightLimit)}, ` +
      `f(${round(nextA)}) = ${fmt(nextAnalysis.functionValue)}. ` +
      `Classification: ${nextInfo.label} — ${nextInfo.explanation}`
    );
  };

  const selectPreset = (id: string) => {
    const next = LIMIT_PRESETS.find((p) => p.id === id) ?? LIMIT_PRESETS[0];
    setPresetId(id);
    setA(next.a);
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1">
          <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-6, 6]}>
            <FunctionPlot expression={preset.raw} />
            {analysis.classification === "infinite" && (
              <ReferenceLine orientation="vertical" at={a} label={`x = ${round(a)}`} />
            )}
            {analysis.classification === "continuous" && (
              <Point x={a} y={analysis.functionValue} radius={5} tooltip={`f(${round(a)}) = ${fmt(analysis.functionValue)}`} />
            )}
            {analysis.classification === "removable" && analysis.limitValue !== null && (
              <Point
                x={a}
                y={analysis.limitValue}
                filled={false}
                radius={5}
                tooltip={`limit = ${fmt(analysis.limitValue)}, but f(${round(a)}) = ${fmt(analysis.functionValue)}`}
              />
            )}
            {analysis.classification === "jump" && (
              <>
                <Point
                  x={a}
                  y={analysis.leftLimit}
                  filled={Number.isFinite(analysis.functionValue) && Math.abs(analysis.functionValue - analysis.leftLimit) < 1e-2}
                  color="var(--color-chart-2)"
                  radius={5}
                  tooltip={`approaches ${fmt(analysis.leftLimit)} from the left`}
                />
                <Point
                  x={a}
                  y={analysis.rightLimit}
                  filled={Number.isFinite(analysis.functionValue) && Math.abs(analysis.functionValue - analysis.rightLimit) < 1e-2}
                  color="var(--color-chart-4)"
                  radius={5}
                  tooltip={`approaches ${fmt(analysis.rightLimit)} from the right`}
                />
              </>
            )}
          </GraphCanvas>
        </div>

        <div className="flex h-56 w-full shrink-0 flex-col border-t border-border md:h-auto md:w-72 md:border-t-0 md:border-l">
          <p className="border-b border-border px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
            Zoom in on x = {round(a)}
          </p>
          <div className="min-h-0 flex-1">
            <GraphCanvas
              key={presetId}
              initialXDomain={[a - delta, a + delta]}
              initialYDomain={[centerY - delta * 4, centerY + delta * 4]}
              showAxes
            >
              <FunctionPlot expression={preset.raw} strokeWidth={2} />
            </GraphCanvas>
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-center justify-between text-xs">
              <Label>Zoom</Label>
              <span className="font-mono text-muted-foreground">±{delta.toExponential(1)}</span>
            </div>
            <Slider min={0} max={1} step={0.01} value={[zoomT]} onValueChange={(v) => setZoomT(Array.isArray(v) ? v[0] : (v as number))} />
          </div>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-4 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {LIMIT_PRESETS.map((p) => (
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

        <p className="text-sm text-muted-foreground">{preset.description}</p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Point of interest (a)</Label>
            <span className="font-mono">{a.toFixed(2)}</span>
          </div>
          <Slider
            min={-5}
            max={5}
            step={0.05}
            value={[a]}
            onValueChange={(v) => setA(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className={`rounded-md border p-3 text-sm ${info.colorClass}`}>
          <p className="font-medium">{info.label}</p>
          <p className="mt-1 text-muted-foreground">{info.explanation}</p>
        </div>

        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Watch it converge</p>
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
        </div>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Limits", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
