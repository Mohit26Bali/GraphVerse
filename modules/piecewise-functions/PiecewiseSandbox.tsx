"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { compileFunction } from "@/math-engine/evaluate";
import { guardedExpression, findDiscontinuities, type Piece } from "@/math-engine/piecewise";
import { X, Plus } from "lucide-react";

function evaluateAt(expression: string, x: number): number {
  try {
    return compileFunction(expression).evaluate(x);
  } catch {
    return NaN;
  }
}

function newPiece(index: number): Piece {
  return {
    id: crypto.randomUUID(),
    expression: index % 2 === 0 ? "x^2" : "2",
    interval: { start: index === 0 ? -3 : 0, end: index === 0 ? 0 : 3, startInclusive: true, endInclusive: false },
  };
}

export function PiecewiseSandbox() {
  const [pieces, setPieces] = useState<Piece[]>([newPiece(0), newPiece(1)]);

  const addPiece = useCallback(() => {
    setPieces((prev) => [...prev, newPiece(prev.length)]);
  }, []);

  const removePiece = useCallback((id: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePiece = useCallback((id: string, patch: Partial<Omit<Piece, "interval">> & { interval?: Partial<Piece["interval"]> }) => {
    setPieces((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...patch, interval: { ...p.interval, ...(patch.interval ?? {}) } }
          : p,
      ),
    );
  }, []);

  const jumps = useMemo(() => findDiscontinuities(pieces, evaluateAt), [pieces]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={[-6, 6]} initialYDomain={[-4, 8]}>
          {pieces.map((piece) => (
            <FunctionPlot key={piece.id} expression={guardedExpression(piece)} color="var(--color-chart-2)" />
          ))}
          {jumps.map((j) => (
            <g key={j.x}>
              <Point x={j.x} y={j.leftValue} color="var(--color-chart-2)" radius={5} filled={j.leftInclusive} />
              <Point x={j.x} y={j.rightValue} color="var(--color-chart-2)" radius={5} filled={j.rightInclusive} />
            </g>
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-3 overflow-y-auto border-t border-border p-4 md:w-md md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Pieces</p>
          <Button variant="ghost" size="sm" onClick={addPiece}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {pieces.map((p) => (
            <div key={p.id} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
              <div className="flex items-center gap-1.5">
                <Input
                  value={p.expression}
                  onChange={(e) => updatePiece(p.id, { expression: e.target.value })}
                  className="h-8 flex-1 font-mono text-sm"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removePiece(p.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updatePiece(p.id, { interval: { startInclusive: !p.interval.startInclusive } })
                  }
                  className="w-4 shrink-0 text-center font-mono text-xs text-muted-foreground hover:text-foreground"
                  title="Toggle whether the start is included"
                >
                  {p.interval.startInclusive ? "[" : "("}
                </button>
                <Slider
                  min={-6}
                  max={6}
                  step={0.5}
                  value={[p.interval.start, p.interval.end]}
                  onValueChange={(v) => {
                    const [start, end] = Array.isArray(v) ? v : [v, v];
                    updatePiece(p.id, { interval: { start, end } });
                  }}
                  className="flex-1"
                />
                <button
                  onClick={() => updatePiece(p.id, { interval: { endInclusive: !p.interval.endInclusive } })}
                  className="w-4 shrink-0 text-center font-mono text-xs text-muted-foreground hover:text-foreground"
                  title="Toggle whether the end is included"
                >
                  {p.interval.endInclusive ? "]" : ")"}
                </button>
              </div>
              <p className="pl-6.5 font-mono text-xs text-muted-foreground">
                {p.interval.startInclusive ? "[" : "("}
                {p.interval.start}, {p.interval.end}
                {p.interval.endInclusive ? "]" : ")"}
              </p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            Discontinuities ({jumps.length})
          </p>
          {jumps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jumps between adjacent pieces.</p>
          ) : (
            <ul className="flex flex-col gap-0.5 font-mono text-sm">
              {jumps.map((j) => (
                <li key={j.x}>
                  x = {j.x}: {j.leftValue} → {j.rightValue}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
