"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSweep } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { BASE_FUNCTIONS } from "@/math-engine/baseFunctions";
import { compileFunction } from "@/math-engine/evaluate";
import { riemannRectangles, riemannSum, accumulationSamples, type RiemannMethod } from "@/math-engine/integral";
import { RiemannBars } from "./RiemannBars";
import { AccumulationCurve } from "./AccumulationCurve";
import { Play, Pause } from "lucide-react";

const DOMAIN: [number, number] = [-5, 5];
const METHODS: RiemannMethod[] = ["left", "midpoint", "right"];

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function IntegralExplore() {
  const [fnId, setFnId] = useState(BASE_FUNCTIONS[2].id); // sin(x), a good "net area" example
  const fn = BASE_FUNCTIONS.find((f) => f.id === fnId) ?? BASE_FUNCTIONS[2];
  const [n, setN] = useState(10);
  const [method, setMethod] = useState<RiemannMethod>("midpoint");
  const [hasStarted, setHasStarted] = useState(false);

  const { value: x0, isPlaying, toggle, setValue: setX0 } = useSweep({
    min: DOMAIN[0],
    max: DOMAIN[1],
    speed: 1.5,
    loop: true,
  });

  const compiled = compileFunction(fn.raw);
  const rects = useMemo(() => riemannRectangles(compiled, DOMAIN, n, method), [compiled, n, method]);
  const approxArea = useMemo(() => riemannSum(rects), [rects]);
  const exactRects = useMemo(() => riemannRectangles(compiled, DOMAIN, 2000, "midpoint"), [compiled]);
  const exactArea = useMemo(() => riemannSum(exactRects), [exactRects]);

  const accPoints = useMemo(() => accumulationSamples(compiled, DOMAIN[0], DOMAIN), [compiled]);
  const currentA = accPoints.reduce((best, p) => (Math.abs(p.x - x0) < Math.abs(best.x - x0) ? p : best), accPoints[0]);

  const explainState = useExplain();

  const buildContext = () =>
    `Function f(x) = ${fn.raw}, integrated over [${DOMAIN[0]}, ${DOMAIN[1]}] using ${n} ${method} Riemann rectangles. ` +
    `Approximate area = ${round(approxArea)} (fine estimate with n=2000: ${round(exactArea)}). ` +
    (hasStarted
      ? `Accumulated area up to x=${round(x0)} is A(${round(x0)}) = ${round(currentA.y)}.`
      : "Playback hasn't started yet.");

  const handlePlay = () => {
    setHasStarted(true);
    toggle();
  };

  const selectFn = (id: string) => {
    setFnId(id);
    setHasStarted(false);
    setX0(DOMAIN[0]);
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1 border-b border-border md:border-r md:border-b-0">
          <p className="border-b border-border px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            f(x) with Riemann rectangles
          </p>
          <div className="h-[calc(100%-2rem)]">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-4, 4]}>
              <RiemannBars rects={rects} />
              <FunctionPlot expression={fn.raw} color="var(--color-chart-2)" strokeWidth={2} />
            </GraphCanvas>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <p className="border-b border-border px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            Accumulation A(x) = ∫ from {DOMAIN[0]} to x
          </p>
          <div className="h-[calc(100%-2rem)]">
            <GraphCanvas initialXDomain={DOMAIN} initialYDomain={[-4, 4]}>
              <AccumulationCurve points={accPoints} upTo={hasStarted ? x0 : undefined} />
              {hasStarted && <Point x={currentA.x} y={currentA.y} color="var(--color-chart-4)" radius={5} tooltip={`A(${round(currentA.x)}) = ${round(currentA.y)}`} />}
            </GraphCanvas>
          </div>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-wrap gap-1.5">
          {BASE_FUNCTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFn(f.id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                f.id === fnId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={handlePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            A({round(x0)}) ={" "}
            <span className="font-mono text-foreground">{hasStarted ? round(currentA.y) : "—"}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Rectangles (n)</Label>
            <span className="font-mono">{n}</span>
          </div>
          <Slider min={2} max={80} step={1} value={[n]} onValueChange={(v) => setN(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <div className="flex gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 rounded-md border px-2 py-1.5 text-sm capitalize transition-colors ${
                m === method
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1 rounded-md border border-border p-3 text-sm">
          <p className="text-muted-foreground">
            Approximation (n={n}):{" "}
            <span className="font-mono text-foreground">{round(approxArea)}</span>
          </p>
          <p className="text-muted-foreground">
            Fine estimate (n=2000):{" "}
            <span className="font-mono text-foreground">{round(exactArea)}</span>
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Rectangles above the x-axis count as positive area (green); below count as negative
          (red) and subtract from the total — that&apos;s the <em>net</em> area, not the total
          shaded region.
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Integrals", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
