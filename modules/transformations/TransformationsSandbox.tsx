"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Equation } from "@/components/shared/Equation";
import { transformTemplate, transformLatex, type TransformParams } from "@/math-engine/transform";
import { compileFunction } from "@/math-engine/evaluate";
import { IDENTITY } from "./stages";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";

export function TransformationsSandbox() {
  const [raw, setRaw] = useState(BASE_FUNCTIONS[0].raw);
  const [draft, setDraft] = useState(BASE_FUNCTIONS[0].raw);
  const [values, setValues] = useState<TransformParams>(IDENTITY);

  const expression = transformTemplate(raw);

  const error = useMemo(() => {
    try {
      compileFunction(expression).evaluate(1, values);
      return null;
    } catch {
      return "Couldn't parse that expression.";
    }
  }, [expression, values]);

  const update = (patch: Partial<Pick<TransformParams, "a" | "b" | "h" | "k">>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          {!error && (
            <>
              <FunctionPlot
                expression={expression}
                scope={IDENTITY}
                color="var(--color-muted-foreground)"
                strokeWidth={1.5}
                label={`f(x) = ${raw}`}
              />
              <FunctionPlot
                expression={expression}
                scope={values}
                label={`a=${values.a.toFixed(1)}, b=${values.b.toFixed(1)}, h=${values.h.toFixed(1)}, k=${values.k.toFixed(1)}`}
              />
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setRaw(draft.trim());
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" />
          <Button type="submit">Set f(x)</Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {BASE_FUNCTIONS.map((fn) => (
            <button
              key={fn.id}
              onClick={() => {
                setDraft(fn.raw);
                setRaw(fn.raw);
              }}
              className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              {fn.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <Equation tex={transformLatex(raw, values)} />
        )}

        <div className="flex flex-col gap-4">
          {(["a", "b", "h", "k"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor={`sandbox-${key}`}>{key}</Label>
                <span className="font-mono">{values[key].toFixed(1)}</span>
              </div>
              <Slider
                id={`sandbox-${key}`}
                min={key === "a" ? -4 : key === "b" ? -3 : -6}
                max={key === "a" ? 4 : key === "b" ? 3 : 6}
                step={0.1}
                value={[values[key]]}
                onValueChange={(v) => update({ [key]: Array.isArray(v) ? v[0] : (v as number) })}
              />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
