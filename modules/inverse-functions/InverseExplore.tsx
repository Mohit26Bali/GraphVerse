"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, ReflectionMorph, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAnimatedValues } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { checkOneToOne } from "@/math-engine/inverse";

const FULL_DOMAIN: [number, number] = [-6, 6];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function InverseExplore() {
  const [fnId, setFnId] = useState(BASE_FUNCTIONS[0].id);
  const fn = BASE_FUNCTIONS.find((f) => f.id === fnId) ?? BASE_FUNCTIONS[0];
  const [restrict, setRestrict] = useState(false);
  const { values, animateTo, setImmediate } = useAnimatedValues({ t: 0 });

  const domain = useMemo<[number, number]>(
    () => (restrict ? [0, FULL_DOMAIN[1]] : FULL_DOMAIN),
    [restrict],
  );
  const reflected = values.t > 0.5;

  const result = useMemo(() => {
    const compiled = compileFunction(fn.raw);
    return checkOneToOne(compiled, domain);
  }, [fn, domain]);

  const explainState = useExplain();
  const buildContext = () =>
    `Function f(x) = ${fn.raw} on domain [${round(domain[0])}, ${round(domain[1])}]${restrict ? " (restricted to x ≥ 0)" : ""}. ` +
    (result.isOneToOne
      ? "It is one-to-one on this domain, so its reflection across y = x is a genuine inverse function."
      : `It is NOT one-to-one on this domain — x=${round(result.conflictPair?.[0] ?? 0)} and x=${round(result.conflictPair?.[1] ?? 0)} share the same output, so its reflection fails the vertical line test and isn't a function.`);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={FULL_DOMAIN} initialYDomain={[-6, 6]}>
          <FunctionPlot expression="x" color="var(--color-border)" strokeWidth={1.5} label="y = x" />
          <ReflectionMorph expression={fn.raw} t={values.t} domain={domain} />
          {!result.isOneToOne && result.conflictPair && (
            <>
              <Point
                x={result.conflictPair[0]}
                y={compileFunction(fn.raw).evaluate(result.conflictPair[0])}
                color="var(--color-destructive)"
                radius={5}
                tooltip="same height as the other red point — fails the horizontal line test"
              />
              <Point
                x={result.conflictPair[1]}
                y={compileFunction(fn.raw).evaluate(result.conflictPair[1])}
                color="var(--color-destructive)"
                radius={5}
                tooltip="same height as the other red point — fails the horizontal line test"
              />
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {BASE_FUNCTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFnId(f.id);
                setImmediate({ t: 0 });
              }}
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

        <div className="flex items-center gap-2">
          <Switch id="restrict-toggle" checked={restrict} onCheckedChange={setRestrict} />
          <Label htmlFor="restrict-toggle">Restrict domain to x ≥ 0</Label>
        </div>

        <div
          className={`rounded-md border p-3 text-sm ${
            result.isOneToOne ? "border-chart-1/40 text-chart-1" : "border-destructive/40 text-destructive"
          }`}
        >
          {result.isOneToOne
            ? "One-to-one on this domain — its reflection is a genuine function."
            : "Not one-to-one on this domain — two x-values share a y-value (marked in red), so its reflection would fail the vertical line test and isn't a function."}
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <p className="text-sm text-muted-foreground">
            {reflected
              ? `This is the mirror of ${fn.label} across y = x.`
              : `This is ${fn.label}. Press Reflect to watch it flip across y = x.`}
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
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[values.t]}
            onValueChange={(v) => setImmediate({ t: Array.isArray(v) ? v[0] : (v as number) })}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          A function only has an inverse (that&apos;s also a function) if it&apos;s one-to-one —
          restricting the domain is how you turn a many-to-one function like x² or |x| into one
          that is.
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Inverse Functions", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
