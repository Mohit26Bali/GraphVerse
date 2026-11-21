"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSweep } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { symbolicDerivative, tangentAt } from "@/math-engine/derivative";
import { Play, Pause } from "lucide-react";

const DOMAIN: [number, number] = [-5, 5];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function DerivativeExplore() {
  const [fnId, setFnId] = useState(BASE_FUNCTIONS[0].id);
  const fn = BASE_FUNCTIONS.find((f) => f.id === fnId) ?? BASE_FUNCTIONS[0];
  const derivExpr = useMemo(() => symbolicDerivative(fn.raw), [fn]);
  const [hasStarted, setHasStarted] = useState(false);

  const { value: x0, isPlaying, toggle, setValue: setX0 } = useSweep({
    min: DOMAIN[0],
    max: DOMAIN[1],
    speed: 1.5,
    loop: true,
  });

  const handlePlay = useCallback(() => {
    setHasStarted(true);
    toggle();
  }, [toggle]);

  const selectFn = useCallback((id: string) => {
    setFnId(id);
    setHasStarted(false);
    setX0(DOMAIN[0]);
  }, [setX0]);

  const compiledF = compileFunction(fn.raw);
  const compiledDeriv = compileFunction(derivExpr);
  const tangent = tangentAt(compiledF, compiledDeriv, x0);
  const y0 = compiledF.evaluate(x0);
  const derivGuarded = hasStarted ? `(x <= ${x0}) ? (${derivExpr}) : NaN` : derivExpr;

  const explainState = useExplain();

  const buildContext = () =>
    `Function f(x) = ${fn.raw}, derivative f'(x) = ${derivExpr}. ` +
    `At x = ${round(x0)}, f(x) = ${round(y0)} and the slope of the tangent line is ` +
    `${Number.isFinite(tangent.slope) ? round(tangent.slope) : "undefined (f is not differentiable here)"}.`;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1 border-b border-border md:border-r md:border-b-0">
          <p className="border-b border-border px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            f(x)
          </p>
          <div className="h-[calc(100%-2rem)]">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-5, 5]}>
              <FunctionPlot expression={fn.raw} color="var(--color-chart-2)" />
              {Number.isFinite(tangent.slope) && (
                <FunctionPlot
                  expression="m*x+b"
                  scope={{ m: tangent.slope, b: tangent.intercept }}
                  color="var(--color-chart-4)"
                  strokeWidth={2}
                />
              )}
              <Point x={x0} y={y0} color="var(--color-chart-2)" radius={5} tooltip={`(${round(x0)}, ${round(y0)})`} />
            </GraphCanvas>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <p className="border-b border-border px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            f&apos;(x)
          </p>
          <div className="h-[calc(100%-2rem)]">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-5, 5]}>
              <FunctionPlot expression={derivGuarded} color="var(--color-chart-4)" />
              {Number.isFinite(tangent.slope) && (
                <Point x={x0} y={tangent.slope} color="var(--color-chart-4)" radius={5} tooltip={`slope = ${round(tangent.slope)}`} />
              )}
            </GraphCanvas>
          </div>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {BASE_FUNCTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFn(f.id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                f.id === fnId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          f&apos;(x) = {derivExpr}
        </p>

        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={handlePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            slope at x = {round(x0)}:{" "}
            <span className="font-mono text-foreground">
              {Number.isFinite(tangent.slope) ? round(tangent.slope) : "undefined"}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Point (x)</Label>
            <span className="font-mono">{x0.toFixed(2)}</span>
          </div>
          <Slider
            min={DOMAIN[0]}
            max={DOMAIN[1]}
            step={0.02}
            value={[x0]}
            onValueChange={(v) => {
              setHasStarted(true);
              setX0(Array.isArray(v) ? v[0] : (v as number));
            }}
          />
        </div>

        {!Number.isFinite(tangent.slope) && (
          <p className="text-sm text-muted-foreground">
            f is not differentiable at this x — there&apos;s a corner or discontinuity here.
          </p>
        )}

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Derivatives", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
