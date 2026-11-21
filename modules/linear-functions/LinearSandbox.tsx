"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { intersectLines, formatLineEquation } from "@/math-engine/linear";
import { X, Plus } from "lucide-react";

interface SandboxLine {
  id: string;
  m: number;
  b: number;
  color: string;
}

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function newLine(index: number): SandboxLine {
  return { id: crypto.randomUUID(), m: 1, b: index, color: PALETTE[index % PALETTE.length] };
}

export function LinearSandbox() {
  const [lines, setLines] = useState<SandboxLine[]>([newLine(0), newLine(1)]);

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, newLine(prev.length)]);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLine = useCallback((id: string, patch: Partial<Pick<SandboxLine, "m" | "b">>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const intersections = useMemo(() => {
    const points: { id: string; x: number; y: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const hit = intersectLines(lines[i], lines[j]);
        if (hit) points.push({ id: `${lines[i].id}-${lines[j].id}`, ...hit });
      }
    }
    return points;
  }, [lines]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          {lines.map((line) => (
            <FunctionPlot
              key={line.id}
              expression="m*x+b"
              scope={{ m: line.m, b: line.b }}
              color={line.color}
              label={formatLineEquation(line.m, line.b)}
            />
          ))}
          {intersections.map((pt) => (
            <Point
              key={pt.id}
              x={pt.x}
              y={pt.y}
              color="var(--color-foreground)"
              radius={4}
              tooltip={`intersection (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-3 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Lines</p>
          <Button variant="ghost" size="sm" onClick={addLine}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {lines.map((line) => (
            <div key={line.id} className="flex items-center gap-2 rounded-md border border-border p-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: line.color }} />
              <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">m</span>
              <Input
                type="number"
                step={0.5}
                value={line.m}
                onChange={(e) => updateLine(line.id, { m: Number(e.target.value) })}
                className="h-8 w-16 font-mono text-sm"
              />
              <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">b</span>
              <Input
                type="number"
                step={0.5}
                value={line.b}
                onChange={(e) => updateLine(line.id, { b: Number(e.target.value) })}
                className="h-8 w-16 font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeLine(line.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Intersections ({intersections.length})
          </p>
          {intersections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No intersections among current lines.</p>
          ) : (
            <ul className="flex flex-col gap-1 font-mono text-sm">
              {intersections.map((pt) => (
                <li key={pt.id}>
                  ({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {lines.map((l) => formatLineEquation(l.m, l.b)).join("  ·  ")}
        </p>
      </aside>
    </div>
  );
}
