"use client";

import { useState } from "react";
import { GraphCanvas, FunctionPlot, ReflectionMorph } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Equation } from "@/components/shared/Equation";
import { useAnimatedValues } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function LogarithmExplore() {
  const [base, setBase] = useState(2);
  const { values, animateTo, setImmediate } = useAnimatedValues({ t: 0 });

  const reflected = values.t > 0.5;

  const explainState = useExplain();
  const buildContext = (nextBase: number = base) =>
    `Exponential y = ${round(nextBase)}^x and its inverse, the logarithm y = log_${round(nextBase)}(x). ` +
    `A logarithm base ${round(nextBase)} answers "what power of ${round(nextBase)} gives x?". ` +
    `The two graphs are mirror images of each other across the line y = x, currently shown ${
      reflected ? "reflected as the logarithm" : "as the exponential"
    }.`;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-4, 4]} initialYDomain={[-4, 4]}>
          <FunctionPlot expression="x" color="var(--color-border)" strokeWidth={1.5} label="y = x" />
          <ReflectionMorph expression="b^x" scope={{ b: base }} t={values.t} />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-col gap-2">
          <Equation tex={`y = ${round(base)}^x`} />
          <Equation tex={`y = \\log_{${round(base)}}(x)`} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Base (b)</Label>
            <span className="font-mono">{base.toFixed(1)}</span>
          </div>
          <Slider
            min={1.1}
            max={4}
            step={0.1}
            value={[base]}
            onValueChange={(v) => setBase(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <p className="text-sm text-muted-foreground">
            {reflected
              ? "This is log_b(x) — every point of b^x, reflected across y = x."
              : "This is b^x. Press Reflect to watch it flip into its own inverse."}
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => animateTo({ t: 1 }, { duration: 1.2 })} disabled={reflected}>
              Reflect
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => animateTo({ t: 0 }, { duration: 1.2 })}
              disabled={!reflected}
            >
              Reset
            </Button>
          </div>
          <Slider min={0} max={1} step={0.01} value={[values.t]} onValueChange={(v) => setImmediate({ t: Array.isArray(v) ? v[0] : (v as number) })} />
        </div>

        <p className="text-sm text-muted-foreground">
          A logarithm asks &quot;what power of b gives x?&quot; &mdash; it&apos;s the operation that undoes an
          exponential, which is exactly why its graph is the exponential&apos;s mirror image across y = x.
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Logarithms", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
