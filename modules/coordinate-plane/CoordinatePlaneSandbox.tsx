"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, Point, type DataPoint } from "@/graph-engine";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NamedPoint extends DataPoint {
  id: string;
  label: string;
}

function labelFor(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

export function CoordinatePlaneSandbox() {
  const [points, setPoints] = useState<NamedPoint[]>([]);

  const handleClick = useCallback((point: DataPoint) => {
    setPoints((prev) => [
      ...prev,
      { ...point, id: crypto.randomUUID(), label: labelFor(prev.length) },
    ]);
  }, []);

  const removePoint = useCallback((id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas onCanvasClick={handleClick}>
          {points.map((p) => (
            <Point
              key={p.id}
              x={p.x}
              y={p.y}
              label={p.label}
              color="var(--color-chart-3)"
              tooltip={`${p.label} (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`}
            />
          ))}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-3 border-t border-border p-4 md:w-64 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Points</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPoints([])}
            disabled={points.length === 0}
          >
            Clear all
          </Button>
        </div>

        {points.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click anywhere on the plane to place a point.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {points.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-md border border-border px-2 py-1 font-mono text-sm"
              >
                <span>
                  {p.label} ({p.x.toFixed(2)}, {p.y.toFixed(2)})
                </span>
                <button
                  onClick={() => removePoint(p.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove point ${p.label}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
