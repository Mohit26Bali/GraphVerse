"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { compileFunction } from "@/math-engine/evaluate";
import { findRealRoots, findTurningPoints } from "@/math-engine/analysis";

const PRESETS = ["x^3 - 3x + 1", "(x-1)^2*(x+2)", "x^4 - 5x^2 + 4", "x^3 - x"];
const DOMAIN: [number, number] = [-8, 8];

export function PolynomialSandbox() {
  const [expression, setExpression] = useState(PRESETS[0]);
  const [draft, setDraft] = useState(PRESETS[0]);

  const analysis = useMemo(() => {
    try {
      const fn = compileFunction(expression);
      const roots = findRealRoots(fn, { domain: DOMAIN });
      const turningPoints = findTurningPoints(fn, { domain: DOMAIN, samples: 1200 });
      return { roots, turningPoints, error: null as string | null };
    } catch {
      return { roots: [], turningPoints: [], error: "Couldn't parse that expression." };
    }
  }, [expression]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-8, 8]}>
          {!analysis.error && <FunctionPlot expression={expression} label={`y = ${expression}`} />}
          {analysis.roots.map((r) => (
            <Point
              key={`root-${r}`}
              x={r}
              y={0}
              radius={4}
              color="var(--color-chart-3)"
              tooltip={`root x ≈ ${r.toFixed(2)}`}
            />
          ))}
          {analysis.turningPoints.map((p) => (
            <Point
              key={`${p.type}-${p.x}`}
              x={p.x}
              y={p.y}
              radius={4}
              color={p.type === "max" ? "var(--color-chart-5)" : "var(--color-chart-4)"}
              tooltip={`local ${p.type} at (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setExpression(draft.trim());
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" />
          <Button type="submit">Plot</Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setDraft(p);
                setExpression(p);
              }}
              className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>

        {analysis.error ? (
          <p className="text-sm text-destructive">{analysis.error}</p>
        ) : (
          <>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Real roots</p>
              <p className="font-mono text-sm">
                {analysis.roots.length === 0
                  ? "none found"
                  : analysis.roots.map((r) => r.toFixed(2)).join(", ")}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Turning points</p>
              {analysis.turningPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">none found</p>
              ) : (
                <ul className="flex flex-col gap-0.5 font-mono text-sm">
                  {analysis.turningPoints.map((p) => (
                    <li key={`${p.type}-${p.x}`}>
                      {p.type} at ({p.x.toFixed(2)}, {p.y.toFixed(2)})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
