"use client";

import { useState } from "react";
import { GraphCanvas, Point, type DataPoint } from "@/graph-engine";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";

function snap(value: number, step: number) {
  return Math.round(value / step) * step;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function CoordinatePlaneExplore() {
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [cursor, setCursor] = useState<DataPoint | null>(null);

  const displayCursor = cursor
    ? snapToGrid
      ? { x: snap(cursor.x, 1), y: snap(cursor.y, 1) }
      : { x: cursor.x, y: cursor.y }
    : null;

  const explainState = useExplain();
  const buildContext = () =>
    `Grid is ${showGrid ? "visible" : "hidden"} and snap-to-grid is ${snapToGrid ? "on" : "off"}. ` +
    (displayCursor
      ? `The cursor is currently at (${round(displayCursor.x)}, ${round(displayCursor.y)}).`
      : "The cursor hasn't moved over the plane yet.");

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas
          showGrid={showGrid}
          onCanvasPointerMove={setCursor}
        >
          {displayCursor && (
            <Point x={displayCursor.x} y={displayCursor.y} color="var(--color-chart-2)" radius={4} />
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-64 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Cursor</p>
          <p className="mt-1 font-mono text-lg">
            {displayCursor
              ? `(${displayCursor.x.toFixed(snapToGrid ? 0 : 2)}, ${displayCursor.y.toFixed(snapToGrid ? 0 : 2)})`
              : "— , —"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="explore-grid" checked={showGrid} onCheckedChange={setShowGrid} />
          <Label htmlFor="explore-grid">Show grid</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="explore-snap" checked={snapToGrid} onCheckedChange={setSnapToGrid} />
          <Label htmlFor="explore-snap">Snap to grid</Label>
        </div>

        <p className="text-sm text-muted-foreground">
          Scroll to zoom, drag to pan. Move your cursor over the plane to read
          its coordinates.
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Coordinate Plane", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
