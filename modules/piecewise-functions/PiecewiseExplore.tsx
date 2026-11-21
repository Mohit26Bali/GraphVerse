"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { compileFunction } from "@/math-engine/evaluate";
import { guardedExpression, findDiscontinuities, containsX, type Piece } from "@/math-engine/piecewise";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { PRESETS } from "./presets";

const DOMAIN: [number, number] = [-6, 6];

function evaluateAt(expression: string, x: number): number {
  try {
    return compileFunction(expression).evaluate(x);
  } catch {
    return NaN;
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function PiecewiseExplore() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const isAbs = presetId === "abs";

  // The abs preset is rendered as one stable symbolic expression (A*abs(x-h)+k, scope-driven)
  // rather than through the piece/guardedExpression machinery, because its boundary (h) is
  // continuously dragged — baking a live slider value into a literal expression string would
  // recompile the AST on every drag tick. floor/ceil/step only change on a discrete button
  // click, so the piece-based approach (built for that) is fine for them.
  const [A, setA] = useState(1);
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);

  const pieces: Piece[] = useMemo(() => (isAbs ? [] : preset.build(DOMAIN)), [preset, isAbs]);
  const discontinuities = useMemo(() => (isAbs ? [] : findDiscontinuities(pieces, evaluateAt)), [pieces, isAbs]);
  const isContinuous = isAbs || discontinuities.length === 0;

  const [x0, setX0] = useState(1.5);
  const branch = isAbs
    ? x0 < h
      ? "left branch (x < h)"
      : "right branch (x ≥ h)"
    : pieces.find((p) => containsX(p, x0))?.expression ?? "undefined";
  const y0 = isAbs ? A * Math.abs(x0 - h) + k : evaluateAt(pieces.find((p) => containsX(p, x0))?.expression ?? "NaN", x0);

  const explainState = useExplain();
  const buildContext = (overrides: { A?: number; h?: number; k?: number; x0?: number } = {}) => {
    const cA = overrides.A ?? A;
    const ch = overrides.h ?? h;
    const ck = overrides.k ?? k;
    const cx0 = overrides.x0 ?? x0;
    const cBranch = isAbs
      ? cx0 < ch
        ? "left branch (x < h)"
        : "right branch (x ≥ h)"
      : pieces.find((p) => containsX(p, cx0))?.expression ?? "undefined";
    const cy0 = isAbs
      ? cA * Math.abs(cx0 - ch) + ck
      : evaluateAt(pieces.find((p) => containsX(p, cx0))?.expression ?? "NaN", cx0);
    const pieceDesc = isAbs
      ? `f(x) = A·|x-h|+k with A=${round(cA)}, h=${round(ch)}, k=${round(ck)} (corner at (${round(ch)}, ${round(ck)})).`
      : `${preset.label}: ${preset.description} Pieces: ` +
        pieces
          .map((p) => `${p.expression} on (${p.interval.startInclusive ? "[" : "("}${p.interval.start}, ${p.interval.end}${p.interval.endInclusive ? "]" : ")"})`)
          .join("; ") +
        ".";
    return (
      `${pieceDesc} ${isContinuous ? "The function is continuous everywhere shown." : `There ${discontinuities.length === 1 ? "is" : "are"} ${discontinuities.length} jump discontinuit${discontinuities.length === 1 ? "y" : "ies"} at x = ${discontinuities.map((d) => round(d.x)).join(", ")}.`} ` +
      `At the traced point x=${round(cx0)}, y=${Number.isFinite(cy0) ? round(cy0) : "undefined"}, on the ${cBranch}.`
    );
  };
  const explainAfterCommit = (overrides: { A?: number; h?: number; k?: number; x0?: number }) =>
    explainState.explain({ moduleTitle: "Piecewise Functions", context: buildContext(overrides) });

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-6, 6]}>
          {isAbs ? (
            <FunctionPlot expression="A*abs(x-h)+k" scope={{ A, h, k }} color="var(--color-chart-1)" label="A·|x-h|+k" />
          ) : (
            pieces.map((piece) => (
              <FunctionPlot
                key={piece.id}
                expression={guardedExpression(piece)}
                color="var(--color-chart-1)"
                label={preset.label}
              />
            ))
          )}
          {discontinuities.map((d) => (
            <g key={`jump-${d.x}`}>
              <Point
                x={d.x}
                y={d.leftValue}
                color="var(--color-chart-1)"
                radius={5}
                filled={d.leftInclusive}
                tooltip={`x = ${d.x}: ${d.leftInclusive ? "included" : "approaches"} ${d.leftValue}`}
              />
              <Point
                x={d.x}
                y={d.rightValue}
                color="var(--color-chart-1)"
                radius={5}
                filled={d.rightInclusive}
                tooltip={`x = ${d.x}: ${d.rightInclusive ? "included" : "approaches"} ${d.rightValue}`}
              />
            </g>
          ))}
          <Point
            x={x0}
            y={Number.isFinite(y0) ? y0 : 0}
            color="var(--color-chart-2)"
            radius={5}
            tooltip={`x = ${round(x0)}, y = ${Number.isFinite(y0) ? round(y0) : "undefined"}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                p.id === presetId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{preset.description}</p>

        {isAbs && (
          <div className="flex flex-col gap-3">
            {(
              [
                { key: "A", label: "Steepness (A)", value: A, set: setA, min: 0.2, max: 3, step: 0.1 },
                { key: "h", label: "Corner position (h)", value: h, set: setH, min: -4, max: 4, step: 0.1 },
                { key: "k", label: "Vertical shift (k)", value: k, set: setK, min: -3, max: 3, step: 0.1 },
              ] as const
            ).map((ctrl) => (
              <div key={ctrl.key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <Label>{ctrl.label}</Label>
                  <span className="font-mono">{ctrl.value.toFixed(1)}</span>
                </div>
                <Slider
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={[ctrl.value]}
                  onValueChange={(v) => ctrl.set(Array.isArray(v) ? v[0] : (v as number))}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <div className="flex items-center justify-between text-sm">
            <Label>Trace point (x)</Label>
            <span className="font-mono">{x0.toFixed(1)}</span>
          </div>
          <Slider
            min={DOMAIN[0]}
            max={DOMAIN[1]}
            step={0.1}
            value={[x0]}
            onValueChange={(v) => setX0(Array.isArray(v) ? v[0] : (v as number))}
          />
          <p className="text-sm text-muted-foreground">
            y = <span className="font-mono text-foreground">{Number.isFinite(y0) ? round(y0) : "undefined"}</span>,{" "}
            on {branch}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <p className="text-sm">
            {isContinuous ? (
              <span className="text-chart-1">Continuous everywhere shown.</span>
            ) : (
              <span className="text-chart-4">
                {discontinuities.length} jump discontinuit{discontinuities.length === 1 ? "y" : "ies"}
              </span>
            )}
          </p>
          {!isContinuous && (
            <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
              {discontinuities.map((d) => (
                <li key={`list-${d.x}`}>
                  at x = {d.x}: jumps from {d.leftValue} to {d.rightValue}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ExplainPanel state={explainState} onRequest={() => explainAfterCommit({})} />
      </aside>
    </div>
  );
}
