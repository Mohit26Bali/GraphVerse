"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, ReflectionMorph } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAnimatedValues } from "@/animation-engine";
import { compileFunction } from "@/math-engine/evaluate";
import { checkOneToOne } from "@/math-engine/inverse";

export function InverseSandbox() {
  const [draft, setDraft] = useState("x^3-3*x");
  const [raw, setRaw] = useState("x^3-3*x");
  const [domain, setDomain] = useState<[number, number]>([-6, 6]);
  const { values, animateTo, setImmediate } = useAnimatedValues({ t: 0 });

  const error = useMemo(() => {
    try {
      compileFunction(raw).evaluate(1);
      return null;
    } catch {
      return "Couldn't parse that expression.";
    }
  }, [raw]);

  const result = useMemo(() => {
    if (error) return { isOneToOne: true };
    return checkOneToOne(compileFunction(raw), domain);
  }, [raw, domain, error]);

  const reflected = values.t > 0.5;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-6, 6]}>
          <FunctionPlot expression="x" color="var(--color-border)" strokeWidth={1.5} label="y = x" />
          {!error && (
            <>
              <FunctionPlot expression={raw} color="var(--color-chart-2)" strokeWidth={1.5} />
              <ReflectionMorph expression={raw} t={values.t} domain={domain} />
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setRaw(draft.trim());
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" />
          <Button type="submit">Plot</Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Domain</Label>
            <span className="font-mono">
              [{domain[0].toFixed(1)}, {domain[1].toFixed(1)}]
            </span>
          </div>
          <Slider
            min={-6}
            max={6}
            step={0.1}
            value={domain}
            onValueChange={(v) => Array.isArray(v) && v.length === 2 && setDomain([v[0], v[1]])}
          />
        </div>

        {!error && (
          <div
            className={`rounded-md border p-3 text-sm ${
              result.isOneToOne ? "border-chart-1/40 text-chart-1" : "border-destructive/40 text-destructive"
            }`}
          >
            {result.isOneToOne
              ? "One-to-one on this domain — invertible."
              : "Not one-to-one on this domain — the reflection wouldn't be a function."}
          </div>
        )}

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
          <Button variant="ghost" onClick={() => setImmediate({ t: 0 })}>
            Snap
          </Button>
        </div>
      </aside>
    </div>
  );
}
