"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSweep } from "@/animation-engine";
import { useExplain } from "@/components/shared/useExplain";
import { ExplainPanel } from "@/components/shared/ExplainPanel";
import { trigPeriod } from "@/math-engine/trig";
import { CircleGeometry } from "./CircleGeometry";
import { Play, Pause } from "lucide-react";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function TrigExplore() {
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const [shift, setShift] = useState(0);
  const [showTangent, setShowTangent] = useState(false);

  const { value: angle, isPlaying, toggle, setValue: setAngle } = useSweep({ speed: 1.2 });

  const effectiveAngle = frequency * (angle - phase);
  const sinValue = Math.sin(effectiveAngle);
  const cosValue = Math.cos(effectiveAngle);
  const tanValue = Math.tan(effectiveAngle);

  const displayX = useMemo(() => {
    // Subtract the nearest whole number of periods so displayX stays congruent to
    // `angle` (mod period) — i.e. the marker lands exactly on the plotted curve —
    // while keeping it centered near the visible domain instead of drifting off-screen.
    const period = trigPeriod(frequency);
    return angle - period * Math.round(angle / period);
  }, [angle, frequency]);

  const sinScope = { A: amplitude, B: frequency, C: phase, D: shift };

  const explainState = useExplain();

  const buildContext = () =>
    `Amplitude=${round(amplitude)}, Frequency=${round(frequency)}, Phase=${round(phase)}, Vertical shift=${round(shift)}. ` +
    `Current angle=${round(angle % (2 * Math.PI))} rad, sin=${round(sinValue)}, cos=${round(cosValue)}` +
    (showTangent ? `, tan=${Number.isFinite(tanValue) ? round(tanValue) : "undefined"}` : "") +
    ".";

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-px md:flex-row">
        <div className="aspect-square w-full shrink-0 md:h-full md:w-80">
          <GraphCanvas initialXDomain={[-1.6, 1.6]} initialYDomain={[-1.6, 1.6]} showGrid={false}>
            <CircleGeometry angle={effectiveAngle} />
          </GraphCanvas>
        </div>
        <div className="min-h-0 flex-1">
          <GraphCanvas initialXDomain={[-8, 8]} initialYDomain={[-4, 4]}>
            <FunctionPlot expression="A*sin(B*(x-C))+D" scope={sinScope} color="var(--color-chart-2)" label="sin(x)" />
            <FunctionPlot expression="A*cos(B*(x-C))+D" scope={sinScope} color="var(--color-chart-4)" label="cos(x)" />
            {showTangent && (
              <FunctionPlot expression="A*tan(B*(x-C))+D" scope={sinScope} color="var(--color-chart-5)" label="tan(x)" />
            )}
            <Point
              x={displayX}
              y={amplitude * sinValue + shift}
              color="var(--color-chart-2)"
              radius={5}
              tooltip={`sin = ${round(sinValue)}`}
            />
            <Point
              x={displayX}
              y={amplitude * cosValue + shift}
              color="var(--color-chart-4)"
              radius={5}
              tooltip={`cos = ${round(cosValue)}`}
            />
            {showTangent && Number.isFinite(tanValue) && Math.abs(tanValue) < 20 && (
              <Point
                x={displayX}
                y={amplitude * tanValue + shift}
                color="var(--color-chart-5)"
                radius={5}
                tooltip={`tan = ${round(tanValue)}`}
              />
            )}
          </GraphCanvas>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div className="flex items-center gap-3 rounded-md border border-border p-3">
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={toggle}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-chart-2" /> sin = {round(sinValue)}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-chart-4" /> cos = {round(cosValue)}
            </span>
            {showTangent && (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-chart-5" /> tan = {round(tanValue)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Angle (θ)</Label>
            <span className="font-mono">{round(angle % (2 * Math.PI))} rad</span>
          </div>
          <Slider
            min={0}
            max={2 * Math.PI}
            step={0.01}
            value={[((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)]}
            onValueChange={(v) => setAngle(Array.isArray(v) ? v[0] : (v as number))}
          />
        </div>

        {(
          [
            { key: "amplitude", label: "Amplitude", value: amplitude, set: setAmplitude, min: 0.2, max: 3, step: 0.1 },
            { key: "frequency", label: "Frequency", value: frequency, set: setFrequency, min: 0.2, max: 4, step: 0.1 },
            { key: "phase", label: "Phase", value: phase, set: setPhase, min: -3.2, max: 3.2, step: 0.1 },
            { key: "shift", label: "Vertical shift", value: shift, set: setShift, min: -3, max: 3, step: 0.1 },
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

        <div className="flex items-center gap-2">
          <Switch id="tangent-toggle" checked={showTangent} onCheckedChange={setShowTangent} />
          <Label htmlFor="tangent-toggle">Show tan(x)</Label>
        </div>

        <p className="text-sm text-muted-foreground">
          Period: <span className="font-mono text-foreground">{round(trigPeriod(frequency))}</span>
        </p>

        <ExplainPanel
          state={explainState}
          onRequest={() => explainState.explain({ moduleTitle: "Trigonometric Functions", context: buildContext() })}
        />
      </aside>
    </div>
  );
}
