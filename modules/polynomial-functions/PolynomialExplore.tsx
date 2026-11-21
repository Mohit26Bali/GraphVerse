"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Equation } from "@/components/shared/Equation";
import {
  polynomialTemplate,
  polynomialScope,
  polynomialDegree,
  formatFactoredEquation,
  type RootFactor,
} from "@/math-engine/polynomial";
import { TurningPoints } from "./TurningPoints";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { Plus, X } from "lucide-react";

const MAX_FACTORS = 4;

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function newFactor(index: number): RootFactor {
  return { id: crypto.randomUUID(), root: index - 1, multiplicity: 1 };
}

export function PolynomialExplore() {
  const [a, setA] = useState(1);
  const [factors, setFactors] = useState<RootFactor[]>([newFactor(0), newFactor(1)]);

  const expression = useMemo(() => polynomialTemplate(factors), [factors]);
  const scope = useMemo(() => polynomialScope(a, factors), [a, factors]);
  const degree = polynomialDegree(factors);

  const addFactor = () => {
    if (factors.length >= MAX_FACTORS) return;
    setFactors((prev) => [...prev, newFactor(prev.length)]);
  };
  const removeFactor = (id: string) => setFactors((prev) => prev.filter((f) => f.id !== id));
  const updateFactor = (id: string, patch: Partial<Pick<RootFactor, "root" | "multiplicity">>) =>
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const explainState = useExplain();
  const buildContext = (nextA: number, nextFactors: RootFactor[]) =>
    `Polynomial ${formatFactoredEquation(nextA, nextFactors)}, degree ${polynomialDegree(nextFactors)}, leading coefficient a=${round(nextA)}. ` +
    `Roots: ` +
    nextFactors
      .map((f) => `x=${round(f.root)}${f.multiplicity > 1 ? ` (multiplicity ${f.multiplicity}, ${f.multiplicity % 2 === 0 ? "touches and bounces off" : "crosses"} the x-axis)` : " (crosses the x-axis)"}`)
      .join(", ") +
    ".";
  const explainAfterCommit = (nextA: number, nextFactors: RootFactor[]) =>
    explainState.explain({ moduleTitle: "Polynomial Functions", context: buildContext(nextA, nextFactors) });

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          <FunctionPlot expression={expression} scope={scope} label={formatFactoredEquation(a, factors)} />
          <TurningPoints expression={expression} scope={scope} />
          {factors.map((f) => (
            <Point
              key={f.id}
              x={f.root}
              y={0}
              radius={f.multiplicity > 1 ? 6 : 4}
              color="var(--color-chart-3)"
              label={f.multiplicity > 1 ? `×${f.multiplicity}` : undefined}
              tooltip={`root x = ${f.root.toFixed(1)} (multiplicity ${f.multiplicity})`}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <Equation tex={formatFactoredEquation(a, factors)} />
        <p className="text-sm text-muted-foreground">Degree: <span className="font-mono text-foreground">{degree}</span></p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="a-slider">Leading coefficient (a)</Label>
            <span className="font-mono">{a.toFixed(1)}</span>
          </div>
          <Slider
            id="a-slider"
            min={-2}
            max={2}
            step={0.1}
            value={[a]}
            onValueChange={(v) => setA(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Roots</p>
          <Button variant="ghost" size="sm" onClick={addFactor} disabled={factors.length >= MAX_FACTORS}>
            <Plus className="h-3.5 w-3.5" /> Add root
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {factors.map((f) => (
            <div key={f.id} className="flex flex-col gap-2 rounded-md border border-border p-2">
              <div className="flex items-center justify-between text-sm">
                <Label>Root at x = {f.root.toFixed(1)}</Label>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFactor(f.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Slider
                min={-6}
                max={6}
                step={0.1}
                value={[f.root]}
                onValueChange={(v) => updateFactor(f.id, { root: Array.isArray(v) ? v[0] : (v as number) })}
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Multiplicity</span>
                {([1, 2, 3] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => updateFactor(f.id, { multiplicity: m })}
                    className={`h-6 w-6 rounded-md border text-xs font-mono transition-colors ${
                      f.multiplicity === m
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Odd multiplicity roots cross the x-axis; even multiplicity roots touch and bounce back.
        </p>

        <ExplainPanel state={explainState} onRequest={() => explainAfterCommit(a, factors)} />
      </aside>
    </div>
  );
}
