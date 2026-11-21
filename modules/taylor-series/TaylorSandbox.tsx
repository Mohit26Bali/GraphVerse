"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { taylorCoefficients, taylorExpression, formatTaylorSummary } from "@/math-engine/taylor";
import { ErrorShading } from "./ErrorShading";

const DOMAIN: [number, number] = [-6, 6];
const MAX_ORDER = 10;

export function TaylorSandbox() {
  const [draft, setDraft] = useState("sin(x)");
  const [raw, setRaw] = useState("sin(x)");
  const [center, setCenter] = useState(0);
  const [order, setOrder] = useState(4);

  const error = useMemo(() => {
    try {
      compileFunction(raw).evaluate(center + 1);
      return null;
    } catch {
      return "Couldn't parse that expression, or it's not differentiable enough times here.";
    }
  }, [raw, center]);

  const terms = useMemo(() => {
    if (error) return [];
    try {
      return taylorCoefficients(raw, center, MAX_ORDER);
    } catch {
      return [];
    }
  }, [raw, center, error]);

  const polyExpr = useMemo(() => taylorExpression(terms.slice(0, order + 1), center), [terms, order, center]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-6, 6]}>
          {!error && terms.length > 0 && (
            <>
              <ErrorShading expressionA={raw} expressionB={polyExpr} domain={DOMAIN} />
              <FunctionPlot expression={raw} color="var(--color-chart-2)" strokeWidth={2} />
              <FunctionPlot expression={polyExpr} color="var(--color-chart-4)" strokeWidth={2} />
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
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
            <Label>Center (a)</Label>
            <span className="font-mono">{center.toFixed(1)}</span>
          </div>
          <Slider min={-4} max={4} step={0.1} value={[center]} onValueChange={(v) => setCenter(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Degree</Label>
            <span className="font-mono">{order}</span>
          </div>
          <Slider min={0} max={MAX_ORDER} step={1} value={[order]} onValueChange={(v) => setOrder(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        {!error && terms.length > 0 && (
          <p className="font-mono text-xs break-words text-muted-foreground">
            P(x) = {formatTaylorSummary(terms.slice(0, order + 1), center)}
          </p>
        )}
      </aside>
    </div>
  );
}
