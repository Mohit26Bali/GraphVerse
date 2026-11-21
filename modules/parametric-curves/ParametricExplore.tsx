"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, ParametricPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSweep } from "@/animation-engine";
import { PARAMETRIC_CURVES, getCurveById, defaultParams } from "@/math-engine/parametric";
import { compileFunction } from "@/math-engine/evaluate";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { Play, Pause } from "lucide-react";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function ParametricExplore() {
  const [curveId, setCurveId] = useState(PARAMETRIC_CURVES[0].id);
  const curve = getCurveById(curveId);
  const [params, setParams] = useState<Record<string, number>>(() => defaultParams(curve));
  const [hasStarted, setHasStarted] = useState(false);

  const { value: t, isPlaying, toggle } = useSweep({ min: 0, max: curve.tMax, speed: curve.tMax / 8, loop: true });

  const selectCurve = useCallback((id: string) => {
    const next = getCurveById(id);
    setCurveId(id);
    setParams(defaultParams(next));
    setHasStarted(false);
  }, []);

  const handlePlay = useCallback(() => {
    setHasStarted(true);
    toggle();
  }, [toggle]);

  const drawnUpTo = hasStarted ? t : curve.tMax;
  const point = {
    x: compileFunction(curve.xExpression, "t").evaluate(t, params),
    y: compileFunction(curve.yExpression, "t").evaluate(t, params),
  };

  const explainState = useExplain();

  const buildContext = () =>
    `Curve: ${curve.label} — ${curve.description} Parameters: ` +
    curve.params.map((p) => `${p.label}=${round(params[p.key] ?? p.default)}`).join(", ") +
    `. Current parameter t=${round(t)} (full sweep to t=${round(curve.tMax)}), traced point ≈ (${
      Number.isFinite(point.x) ? round(point.x) : "undefined"
    }, ${Number.isFinite(point.y) ? round(point.y) : "undefined"}).`;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-10, 10]} initialYDomain={[-10, 10]}>
          <ParametricPlot
            xExpression={curve.xExpression}
            yExpression={curve.yExpression}
            scope={params}
            tDomain={[0, drawnUpTo]}
            label={curve.label}
          />
          {hasStarted && Number.isFinite(point.x) && Number.isFinite(point.y) && (
            <Point x={point.x} y={point.y} color="var(--color-chart-2)" radius={5} />
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {PARAMETRIC_CURVES.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCurve(c.id)}
              className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                c.id === curveId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{curve.description}</p>

        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={handlePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            t = <span className="font-mono text-foreground">{round(t)}</span>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {curve.params.map((p) => (
            <div key={p.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <Label>{p.label}</Label>
                <span className="font-mono">{params[p.key]?.toFixed(1)}</span>
              </div>
              <Slider
                min={p.min}
                max={p.max}
                step={p.step}
                value={[params[p.key] ?? p.default]}
                onValueChange={(v) =>
                  setParams((prev) => ({ ...prev, [p.key]: Array.isArray(v) ? v[0] : (v as number) }))
                }
              />
            </div>
          ))}
        </div>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Parametric Curves", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
