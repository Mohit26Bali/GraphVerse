"use client";

import { useEffect, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, ImplicitPlot, ReferenceLine } from "@/graph-engine";
import { useSandboxStore, type PlottedFunction } from "@/stores/useSandboxStore";
import { equationProblem, parseEquation, validateEquation } from "@/math-engine/parseEquation";
import { Intersections } from "./Intersections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

/** Delays error display until typing pauses, so mid-expression states like "x^" don't flash red. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function FunctionRow({
  fn,
  onChange,
  onToggleVisibility,
  onRemove,
  onHoverChange,
}: {
  fn: PlottedFunction;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const debouncedExpression = useDebouncedValue(fn.expression, 400);
  const error = useMemo(() => {
    const unsafe = equationProblem(debouncedExpression);
    if (unsafe) return unsafe;
    const parsed = parseEquation(debouncedExpression);
    return parsed ? validateEquation(parsed) : null;
  }, [debouncedExpression]);

  return (
    <div
      className="flex flex-col gap-1"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div className="flex items-center gap-2 rounded-md border border-border p-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: fn.color }} />
        <Input
          value={fn.expression}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Equation: ${fn.expression}`}
          maxLength={200}
          spellCheck={false}
          autoComplete="off"
          className="h-8 flex-1 font-mono text-sm"
        />
        <Switch checked={fn.visible} onCheckedChange={onToggleVisibility} aria-label="Show or hide this function" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove} aria-label="Remove this function">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="px-1 text-xs text-destructive">Couldn&apos;t parse this: {error}</p>}
    </div>
  );
}

const EXAMPLES = [
  { label: "Cubic", expression: "x^3 - 3x" },
  { label: "Rational", expression: "1/x" },
  { label: "Sine", expression: "sin(x) * 2" },
  { label: "Circle", expression: "x^2 + y^2 = 25" },
  { label: "Ellipse", expression: "x^2/16 + y^2/4 = 1" },
  { label: "Sideways parabola", expression: "y^2 = x" },
  { label: "Hyperbola", expression: "x^2 - y^2 = 4" },
  { label: "Vertical line", expression: "x = 3" },
];

export default function SandboxPage() {
  const { functions, showGrid, addFunction, removeFunction, updateExpression, toggleVisibility, toggleGrid } =
    useSandboxStore();
  const [draft, setDraft] = useState("x^2");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const parsedItems = useMemo(
    () =>
      functions
        .filter((fn) => fn.visible && equationProblem(fn.expression) === null)
        .map((fn) => ({
          id: fn.id,
          color: fn.color,
          expression: fn.expression,
          parsed: parseEquation(fn.expression),
        }))
        .filter((item): item is typeof item & { parsed: NonNullable<typeof item.parsed> } => item.parsed !== null),
    [functions],
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col md:flex-row">
      <aside className="flex w-full flex-col gap-4 overflow-y-auto border-b border-border p-4 md:w-80 md:border-b-0 md:border-r">
        <div>
          <h1 className="text-lg font-semibold">Sandbox</h1>
          <p className="text-sm text-muted-foreground">
            Plot a function of x, a vertical line (x = ...), or an implicit equation in x and y.
            Where two functions (or a function and a vertical line) cross, the intersection is
            marked automatically.
          </p>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) {
              addFunction(draft.trim());
              setDraft("");
            }
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="New equation"
            maxLength={200}
            spellCheck={false}
            autoComplete="off"
            placeholder="e.g. sin(x) * 2, or x^2+y^2=25"
            className="font-mono"
          />
          <Button type="submit">Plot</Button>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Examples</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.expression}
                onClick={() => addFunction(ex.expression)}
                title={ex.expression}
                className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {functions.map((fn) => (
            <FunctionRow
              key={fn.id}
              fn={fn}
              onChange={(value) => updateExpression(fn.id, value)}
              onToggleVisibility={() => toggleVisibility(fn.id)}
              onRemove={() => removeFunction(fn.id)}
              onHoverChange={(hovered) => setHoveredId(hovered ? fn.id : null)}
            />
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Switch id="grid-toggle" checked={showGrid} onCheckedChange={toggleGrid} />
          <Label htmlFor="grid-toggle">Show grid</Label>
        </div>
      </aside>

      <main className="relative min-h-0 flex-1">
        <GraphCanvas showGrid={showGrid}>
          {parsedItems.map((item) => {
            const isDimmed = hoveredId !== null && hoveredId !== item.id;
            const isHighlighted = hoveredId === item.id;
            const opacity = isDimmed ? 0.25 : 1;
            const strokeWidth = isHighlighted ? 3.5 : 2.5;

            if (item.parsed.kind === "function") {
              return (
                <g key={item.id} opacity={opacity}>
                  <FunctionPlot
                    expression={item.parsed.expression}
                    color={item.color}
                    strokeWidth={strokeWidth}
                    label={item.expression}
                  />
                </g>
              );
            }
            if (item.parsed.kind === "vertical") {
              return (
                <g key={item.id} opacity={opacity}>
                  <ReferenceLine
                    orientation="vertical"
                    at={item.parsed.x}
                    color={item.color}
                    dashed={false}
                    strokeWidth={strokeWidth}
                    tooltip={item.expression}
                  />
                </g>
              );
            }
            return (
              <g key={item.id} opacity={opacity}>
                <ImplicitPlot
                  expression={item.parsed.expression}
                  color={item.color}
                  strokeWidth={strokeWidth}
                  label={item.expression}
                />
              </g>
            );
          })}
          <Intersections items={parsedItems} />
        </GraphCanvas>
        {functions.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <p className="rounded-md border border-border bg-background/90 px-4 py-2 text-center text-sm text-muted-foreground shadow-sm">
              Nothing plotted yet — try an example on the left, or type an expression and hit Plot.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
