"use client";

import { useCallback, useState } from "react";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Equation } from "@/components/shared/Equation";
import { useAnimatedValues } from "@/animation-engine";
import { transformTemplate, transformLatex, type TransformParams } from "@/math-engine/transform";
import { STAGES, IDENTITY } from "./stages";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { Play, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

const SLIDER_CONFIG: Record<keyof TransformParams, { min: number; max: number; step: number }> = {
  a: { min: -4, max: 4, step: 0.1 },
  b: { min: -3, max: 3, step: 0.1 },
  h: { min: -6, max: 6, step: 0.1 },
  k: { min: -6, max: 6, step: 0.1 },
};

export function TransformationsExplore() {
  const [baseId, setBaseId] = useState(BASE_FUNCTIONS[0].id);
  const base = BASE_FUNCTIONS.find((f) => f.id === baseId) ?? BASE_FUNCTIONS[0];
  const { values, animateTo, setImmediate, stop } = useAnimatedValues<TransformParams>(IDENTITY);
  const [stageIndex, setStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const expression = transformTemplate(base.raw);

  const goToStage = useCallback(
    async (index: number) => {
      setStageIndex(index);
      await animateTo(STAGES[index].values, { duration: 1 });
    },
    [animateTo],
  );

  const playAll = useCallback(async () => {
    setIsPlaying(true);
    for (let i = stageIndex < STAGES.length - 1 ? stageIndex + 1 : 0; i < STAGES.length; i++) {
      setStageIndex(i);
      await animateTo(STAGES[i].values, { duration: 1.1 });
    }
    setIsPlaying(false);
  }, [animateTo, stageIndex]);

  const reset = useCallback(() => {
    stop();
    setStageIndex(0);
    setImmediate(IDENTITY);
  }, [stop, setImmediate]);

  const updateParam = (key: keyof TransformParams, value: number) => {
    stop();
    setImmediate({ [key]: value } as Partial<TransformParams>);
  };

  const explainState = useExplain();

  const buildContext = (overrides: Partial<TransformParams> = {}) => {
    const v = { ...values, ...overrides };
    const parts: string[] = [];
    if (v.k !== 0) parts.push(`shifted vertically by k=${round(v.k)}`);
    if (v.h !== 0) parts.push(`shifted horizontally by h=${round(v.h)}`);
    if (v.a !== 1) parts.push(`vertically stretched/compressed by a factor of a=${round(v.a)}${v.a < 0 ? " (also reflected across the x-axis)" : ""}`);
    if (v.b !== 1) parts.push(`horizontally stretched/compressed by a factor of b=${round(v.b)}`);
    const summary = parts.length > 0 ? parts.join(", ") : "no transformation applied (identity)";
    return (
      `Base function f(x) = ${base.raw}. Currently: ${summary}. ` +
      `Walkthrough stage: "${STAGES[stageIndex].label}" — ${STAGES[stageIndex].caption}`
    );
  };
  const explainAfterCommit = (overrides: Partial<TransformParams> = {}) =>
    explainState.explain({ moduleTitle: "Function Transformations", context: buildContext(overrides) });

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas>
          <FunctionPlot
            expression={expression}
            scope={IDENTITY}
            color="var(--color-muted-foreground)"
            strokeWidth={1.5}
            label={`f(x) = ${base.raw}`}
          />
          <FunctionPlot
            expression={expression}
            scope={values}
            label={`a=${values.a.toFixed(1)}, b=${values.b.toFixed(1)}, h=${values.h.toFixed(1)}, k=${values.k.toFixed(1)}`}
          />
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {BASE_FUNCTIONS.map((fn) => (
            <button
              key={fn.id}
              onClick={() => setBaseId(fn.id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                fn.id === baseId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {fn.label}
            </button>
          ))}
        </div>

        <Equation tex={transformLatex(base.raw, values)} />

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <p className="text-sm font-medium">{STAGES[stageIndex].label}</p>
          <p className="text-sm text-muted-foreground">{STAGES[stageIndex].caption}</p>
          <div className="mt-1 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={stageIndex === 0 || isPlaying}
              onClick={() => goToStage(stageIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button className="flex-1" onClick={playAll} disabled={isPlaying}>
              <Play className="h-4 w-4" /> {stageIndex === STAGES.length - 1 ? "Play again" : "Play"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={stageIndex === STAGES.length - 1 || isPlaying}
              onClick={() => goToStage(stageIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={reset} disabled={isPlaying}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {(Object.keys(SLIDER_CONFIG) as Array<keyof TransformParams>).map((key) => (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <Label>{key}</Label>
                <span className="font-mono">{values[key].toFixed(1)}</span>
              </div>
              <Slider
                min={SLIDER_CONFIG[key].min}
                max={SLIDER_CONFIG[key].max}
                step={SLIDER_CONFIG[key].step}
                value={[values[key]]}
                onValueChange={(v) => updateParam(key, Array.isArray(v) ? v[0] : (v as number))}
                disabled={isPlaying}
              />
            </div>
          ))}
        </div>

        <ExplainPanel state={explainState} onRequest={() => explainAfterCommit()} />
      </aside>
    </div>
  );
}
