"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSweep } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import {
  gradientAt,
  evaluate2D,
  doubleIntegral,
  tangentLineExpression,
  sampleGrid,
  directionalDerivative,
  gradientDescentPath,
  type Point2D,
} from "@/math-engine/multivariable";
import { ContourCanvas, type ContourArrow } from "./ContourCanvas";
import { SURFACE_PRESETS } from "./presets";
import { Play, Pause } from "lucide-react";

const MAX_STEPS = 50;
const LEARNING_RATE = 0.08;

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function MultivariableExplore() {
  const [presetId, setPresetId] = useState(SURFACE_PRESETS[0].id);
  const preset = SURFACE_PRESETS.find((p) => p.id === presetId) ?? SURFACE_PRESETS[0];
  const [probe, setProbe] = useState<Point2D>({ x: 1.2, y: 1.2 });
  const [showDescent, setShowDescent] = useState(false);
  const [angleDeg, setAngleDeg] = useState(45);
  const [walkStart, setWalkStart] = useState<Point2D | null>(null);

  const { value: stepsFloat, isPlaying: walking, toggle: toggleWalk, setValue: setStepsFloat } = useSweep({
    min: 0,
    max: MAX_STEPS,
    speed: 25,
    loop: false,
  });
  const steps = Math.floor(stepsFloat);

  const selectPreset = useCallback((id: string) => {
    setPresetId(id);
    setProbe({ x: 1.2, y: 1.2 });
    setWalkStart(null);
  }, []);

  const path = useMemo(
    () => (walkStart ? gradientDescentPath(preset.expression, walkStart, steps, LEARNING_RATE, preset.domain, !showDescent) : []),
    [walkStart, steps, preset, showDescent],
  );
  const activePoint = walkStart && path.length > 0 ? path[path.length - 1] : probe;

  const handleWalkButton = useCallback(() => {
    if (!walkStart) {
      // Fresh start: snapshot the current probe and begin from step 0.
      setWalkStart(probe);
      setStepsFloat(0);
      toggleWalk();
    } else {
      // Already walking (or paused mid-walk) — just pause/resume in place, don't restart.
      toggleWalk();
    }
  }, [walkStart, probe, setStepsFloat, toggleWalk]);

  const pick = useCallback((point: Point2D) => {
    setProbe(point);
    setWalkStart(null);
  }, []);

  const fValue = useMemo(() => evaluate2D(preset.expression, activePoint), [preset, activePoint]);
  const gradient = useMemo(() => gradientAt(preset.expression, activePoint), [preset, activePoint]);
  const gradientMag = Math.hypot(gradient.dfdx, gradient.dfdy);

  const angleRad = (angleDeg * Math.PI) / 180;
  const dirDeriv = useMemo(() => directionalDerivative(gradient, angleRad), [gradient, angleRad]);

  const arrows = useMemo<ContourArrow[]>(() => {
    const ascentSign = showDescent ? -1 : 1;
    return [
      { dfdx: ascentSign * gradient.dfdx, dfdy: ascentSign * gradient.dfdy, color: "#fff" },
      { dfdx: Math.cos(angleRad), dfdy: Math.sin(angleRad), color: "#ff8a3d" },
    ];
  }, [gradient, showDescent, angleRad]);

  const volume = useMemo(
    () => doubleIntegral(preset.expression, preset.domain, preset.domain),
    [preset],
  );

  // The slice graphs plot f's *value*, which can range far outside the spatial x/y domain
  // (e.g. x^2+y^2 reaches 18 at the corners of a [-3,3] domain) — so their y-axis needs its
  // own domain sized to the actual function range, not reused from the spatial domain.
  const domainZ = useMemo<[number, number]>(() => {
    const grid = sampleGrid(preset.expression, preset.domain, preset.domain, 40);
    const flat = grid.flat().filter(Number.isFinite);
    const min = flat.length > 0 ? Math.min(...flat) : -1;
    const max = flat.length > 0 ? Math.max(...flat) : 1;
    const pad = Math.max((max - min) * 0.1, 0.5);
    return [min - pad, max + pad];
  }, [preset]);

  const xSliceTangent = useMemo(
    () => tangentLineExpression(gradient.dfdx, activePoint.x, fValue, "x"),
    [gradient.dfdx, activePoint.x, fValue],
  );
  const ySliceTangent = useMemo(
    () => tangentLineExpression(gradient.dfdy, activePoint.y, fValue, "y"),
    [gradient.dfdy, activePoint.y, fValue],
  );

  const explainState = useExplain();
  const buildContext = () =>
    `Surface f(x,y) = ${preset.label}. ${preset.description} At the point (${round(activePoint.x)}, ${round(activePoint.y)}): ` +
    `f = ${round(fValue)}, ∂f/∂x = ${round(gradient.dfdx)}, ∂f/∂y = ${round(gradient.dfdy)}, ` +
    `gradient magnitude = ${round(gradientMag)} (the direction of steepest ascent). ` +
    `In the chosen direction (${angleDeg}°), the directional derivative is ${round(dirDeriv)}. ` +
    `The double integral of f over the whole visible region [${preset.domain[0]}, ${preset.domain[1]}]² is approximately ${round(volume)} — the signed volume between the surface and the plane.` +
    (walkStart ? ` A gradient-${showDescent ? "descent" : "ascent"} walk from (${round(walkStart.x)}, ${round(walkStart.y)}) has taken ${steps} steps.` : "");

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">Click the surface to move the probe point</p>
            <ContourCanvas
              expression={preset.expression}
              domain={preset.domain}
              probePoint={activePoint}
              arrows={arrows}
              path={path}
              onPick={pick}
              size={360}
            />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                x-slice: f(x, {round(activePoint.y)}) — fixing y, sweeping x
              </p>
              <div className="h-40">
                <GraphCanvas
                  key={`x-${presetId}`}
                  initialXDomain={preset.domain}
                  initialYDomain={domainZ}
                  showGrid={false}
                >
                  <FunctionPlot expression={preset.expression} scope={{ y: activePoint.y }} color="var(--color-chart-2)" strokeWidth={2} />
                  <FunctionPlot expression={xSliceTangent} color="var(--color-chart-4)" strokeWidth={1.5} />
                  <Point x={activePoint.x} y={fValue} color="var(--color-chart-2)" radius={4} tooltip={`slope ∂f/∂x = ${round(gradient.dfdx)}`} />
                </GraphCanvas>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                y-slice: f({round(activePoint.x)}, y) — fixing x, sweeping y
              </p>
              <div className="h-40">
                <GraphCanvas
                  key={`y-${presetId}`}
                  initialXDomain={preset.domain}
                  initialYDomain={domainZ}
                  showGrid={false}
                >
                  <FunctionPlot expression={preset.expression} variable="y" scope={{ x: activePoint.x }} color="var(--color-chart-3)" strokeWidth={2} />
                  <FunctionPlot expression={ySliceTangent} variable="y" color="var(--color-chart-4)" strokeWidth={1.5} />
                  <Point x={activePoint.y} y={fValue} color="var(--color-chart-3)" radius={4} tooltip={`slope ∂f/∂y = ${round(gradient.dfdy)}`} />
                </GraphCanvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Surface</p>
          <div className="flex flex-wrap gap-1.5">
            {SURFACE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPreset(p.id)}
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
        </div>

        <p className="text-sm text-muted-foreground">{preset.description}</p>

        <div className="flex flex-col gap-1 rounded-md border border-border p-3 font-mono text-sm">
          <p>
            f({round(activePoint.x)}, {round(activePoint.y)}) = {round(fValue)}
          </p>
          <p className="text-chart-2">∂f/∂x = {round(gradient.dfdx)}</p>
          <p className="text-chart-3">∂f/∂y = {round(gradient.dfdy)}</p>
          <p className="mt-1 text-muted-foreground">|∇f| = {round(gradientMag)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="descent-toggle" checked={showDescent} onCheckedChange={setShowDescent} />
          <Label htmlFor="descent-toggle">Steepest descent instead of ascent</Label>
        </div>

        <p className="text-sm text-muted-foreground">
          The white arrow points in the gradient&apos;s direction — steepest {showDescent ? "descent" : "ascent"} from
          the probe point. Where it shrinks to nothing, you&apos;ve found a critical point (a min, max, or saddle).
        </p>

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <div className="flex items-center justify-between text-sm">
            <Label>Direction (θ)</Label>
            <span className="font-mono">{angleDeg}°</span>
          </div>
          <Slider min={0} max={359} step={1} value={[angleDeg]} onValueChange={(v) => setAngleDeg(Array.isArray(v) ? v[0] : (v as number))} />
          <p className="text-sm text-muted-foreground">
            Directional derivative (amber arrow):{" "}
            <span className="font-mono text-foreground">{round(dirDeriv)}</span>
            {" — "}
            {Math.abs(gradientMag) > 1e-6 && Math.abs(dirDeriv - gradientMag) < 1e-3
              ? "maximum! lined up with the gradient."
              : "rotate until it lines up with the white arrow to find the max."}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleWalkButton}
              disabled={walkStart !== null && steps >= MAX_STEPS && !walking}
            >
              {walking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <p className="text-sm text-muted-foreground">
              {walkStart
                ? `Walking ${showDescent ? "downhill" : "uphill"} — step ${steps} of ${MAX_STEPS}`
                : `Walk ${showDescent ? "downhill" : "uphill"} from the probe point`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Takes small steps in the gradient&apos;s direction — this is gradient descent, the same idea used to
            train machine learning models. On the saddle, watch it slide off instead of settling.
          </p>
        </div>

        <div className="rounded-md border border-border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Double integral</p>
          <p className="mt-1 font-mono text-sm">
            ∬ f dA over [{preset.domain[0]}, {preset.domain[1]}]² ≈ <span className="text-foreground">{round(volume)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The signed volume trapped between the surface and the plane — positive where the surface is
            above the plane, negative where it dips below.
          </p>
        </div>

        <ExplainPanel state={explainState} onRequest={() => explainState.explain({ moduleTitle: "Multivariable Calculus", context: buildContext() })} />
      </aside>
    </div>
  );
}
