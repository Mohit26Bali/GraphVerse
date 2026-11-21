"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Equation } from "@/components/shared/Equation";
import { useAnimatedValues } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { composeExpressions, formatCompositionLatex } from "@/math-engine/composition";
import { CompositionMachine } from "./CompositionMachine";
import { CompositionSteps } from "./CompositionSteps";
import { RotateCcw } from "lucide-react";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function CompositionExplore() {
  const [fId, setFId] = useState(BASE_FUNCTIONS[0].id);
  const [gId, setGId] = useState(BASE_FUNCTIONS[2].id);
  const [x0, setX0] = useState(1.5);
  const { values, animateTo, setImmediate } = useAnimatedValues({ progress: 0 });

  const f = BASE_FUNCTIONS.find((fn) => fn.id === fId) ?? BASE_FUNCTIONS[0];
  const g = BASE_FUNCTIONS.find((fn) => fn.id === gId) ?? BASE_FUNCTIONS[0];
  const composed = composeExpressions(g.raw, f.raw);

  const fx0 = compileFunction(f.raw).evaluate(x0);
  const gfx0 = compileFunction(g.raw).evaluate(fx0);

  const explainState = useExplain();
  const buildContext = (nextX0: number = x0) => {
    const fVal = compileFunction(f.raw).evaluate(nextX0);
    const gVal = compileFunction(g.raw).evaluate(fVal);
    return (
      `f(x) = ${f.raw}, g(x) = ${g.raw}, composed as g(f(x)). ` +
      `At x=${round(nextX0)}: f(${round(nextX0)})=${round(fVal)}, then g(${round(fVal)})=${round(gVal)}, ` +
      `so g(f(${round(nextX0)}))=${round(gVal)}.`
    );
  };

  const run = useCallback(() => {
    setImmediate({ progress: 0 });
    animateTo({ progress: 1 }, { duration: 1.4 });
  }, [setImmediate, animateTo]);

  const reset = useCallback(() => setImmediate({ progress: 0 }), [setImmediate]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-6 py-5">
          <CompositionMachine
            x0={x0}
            fLabel="f"
            gLabel="g"
            fValue={fx0}
            gValue={gfx0}
            progress={values.progress}
          />
        </div>
        <div className="min-h-0 flex-1">
          <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-6, 6]}>
            <FunctionPlot expression="x" color="var(--color-border)" strokeWidth={1.5} label="y = x" />
            <FunctionPlot expression={f.raw} color="var(--color-chart-2)" label={`f(x) = ${f.raw}`} />
            <FunctionPlot expression={g.raw} color="var(--color-chart-4)" label={`g(x) = ${g.raw}`} />
            <FunctionPlot expression={composed} strokeWidth={3} label="g(f(x))" />
            <CompositionSteps x0={x0} fx0={fx0} gfx0={gfx0} />
            <Point x={x0} y={gfx0} radius={5} tooltip={`g(f(${x0.toFixed(1)})) = ${gfx0.toFixed(2)}`} />
          </GraphCanvas>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">f(x)</p>
          <div className="flex flex-wrap gap-1.5">
            {BASE_FUNCTIONS.map((fn) => (
              <button
                key={fn.id}
                onClick={() => setFId(fn.id)}
                className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                  fn.id === fId
                    ? "border-chart-2 bg-chart-2/15 text-chart-2"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {fn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">g(x)</p>
          <div className="flex flex-wrap gap-1.5">
            {BASE_FUNCTIONS.map((fn) => (
              <button
                key={fn.id}
                onClick={() => setGId(fn.id)}
                className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                  fn.id === gId
                    ? "border-chart-4 bg-chart-4/15 text-chart-4"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {fn.label}
              </button>
            ))}
          </div>
        </div>

        <Equation tex={`y = ${formatCompositionLatex("g", "f")}`} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Input (x)</Label>
            <span className="font-mono">{x0.toFixed(1)}</span>
          </div>
          <Slider
            min={-4}
            max={4}
            step={0.1}
            value={[x0]}
            onValueChange={(v) => setX0(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={run}>
            Run the machine
          </Button>
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          x flows into f first, and f&apos;s output becomes g&apos;s input — that&apos;s what the
          dashed staircase on the graph is tracing.
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Function Composition", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
