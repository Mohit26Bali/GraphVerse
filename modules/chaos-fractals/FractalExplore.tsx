"use client";

import { useCallback, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import type { Complex } from "@/math-engine/fractal";
import { FractalCanvas } from "./FractalCanvas";

const DEFAULT_CENTER: Complex = { re: -0.5, im: 0 };
const DEFAULT_SCALE = 3;
const ZOOM_FACTOR = 0.35;

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function FractalExplore() {
  const [mode, setMode] = useState<"mandelbrot" | "julia">("mandelbrot");
  const [maxIterations, setMaxIterations] = useState(80);

  const [mCenter, setMCenter] = useState<Complex>(DEFAULT_CENTER);
  const [mScale, setMScale] = useState(DEFAULT_SCALE);

  const [juliaC, setJuliaC] = useState<Complex>({ re: -0.4, im: 0.6 });
  const [jCenter, setJCenter] = useState<Complex>({ re: 0, im: 0 });
  const [jScale, setJScale] = useState(3);

  const zoomIn = useCallback((c: Complex) => {
    setMCenter(c);
    setMScale((s) => s * ZOOM_FACTOR);
  }, []);
  const zoomOut = useCallback(() => setMScale((s) => Math.min(s / ZOOM_FACTOR, 4)), []);
  const resetMandelbrot = useCallback(() => {
    setMCenter(DEFAULT_CENTER);
    setMScale(DEFAULT_SCALE);
  }, []);

  const juliaZoomIn = useCallback((c: Complex) => {
    setJCenter(c);
    setJScale((s) => s * ZOOM_FACTOR);
  }, []);
  const juliaZoomOut = useCallback(() => setJScale((s) => Math.min(s / ZOOM_FACTOR, 4)), []);
  const resetJulia = useCallback(() => {
    setJCenter({ re: 0, im: 0 });
    setJScale(3);
  }, []);

  const explainState = useExplain();
  const buildContext = (iterations: number = maxIterations) =>
    mode === "mandelbrot"
      ? `Exploring the Mandelbrot set, centered at ${round(mCenter.re)} + ${round(mCenter.im)}i with zoom scale ${round(mScale)}, rendered with ${iterations} max iterations per point.`
      : `Exploring the Julia set for c = ${round(juliaC.re)} + ${round(juliaC.im)}i, centered at ${round(jCenter.re)} + ${round(jCenter.im)}i with zoom scale ${round(jScale)}, rendered with ${iterations} max iterations per point.`;
  const explainAfterCommit = (iterations: number) =>
    explainState.explain({ moduleTitle: "Chaos & Fractals", context: buildContext(iterations) });

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 items-center justify-center gap-6 overflow-auto p-6">
        {mode === "mandelbrot" ? (
          <FractalCanvas kind="mandelbrot" center={mCenter} scale={mScale} maxIterations={maxIterations} size={440} onPick={zoomIn} />
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">Click to choose c</p>
              <FractalCanvas
                kind="mandelbrot"
                center={DEFAULT_CENTER}
                scale={DEFAULT_SCALE}
                maxIterations={60}
                size={220}
                onPick={setJuliaC}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-xs text-muted-foreground">
                c = {round(juliaC.re)} + {round(juliaC.im)}i
              </p>
              <FractalCanvas
                kind="julia"
                juliaC={juliaC}
                center={jCenter}
                scale={jScale}
                maxIterations={maxIterations}
                size={380}
                onPick={juliaZoomIn}
              />
            </div>
          </>
        )}
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div className="flex gap-1.5">
          {(["mandelbrot", "julia"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md border px-2.5 py-1.5 text-sm capitalize transition-colors ${
                m === mode
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Detail (iterations)</Label>
            <span className="font-mono">{maxIterations}</span>
          </div>
          <Slider
            min={20}
            max={200}
            step={10}
            value={[maxIterations]}
            onValueChange={(v) => setMaxIterations(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        {mode === "mandelbrot" ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={zoomOut}>
              Zoom out
            </Button>
            <Button variant="outline" className="flex-1" onClick={resetMandelbrot}>
              Reset
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={juliaZoomOut}>
              Zoom out
            </Button>
            <Button variant="outline" className="flex-1" onClick={resetJulia}>
              Reset
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {mode === "mandelbrot"
            ? "Click anywhere to zoom in — the boundary has detail at every scale, forever."
            : "Points inside the Mandelbrot set produce a connected Julia set; points outside produce scattered \"dust.\" Click the small Mandelbrot to pick c, then click the Julia set to zoom in."}
        </p>

        <ExplainPanel state={explainState} onRequest={() => explainAfterCommit(maxIterations)} />
      </aside>
    </div>
  );
}
