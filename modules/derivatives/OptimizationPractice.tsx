"use client";

import { useCallback, useMemo, useState } from "react";
import { GraphCanvas, FunctionPlot, Point } from "@/graph-engine";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fenceArea, fenceOptimalWidth } from "@/math-engine/derivative";

const TOLERANCE = 0.5;

function randomRound() {
  const P = 20 + Math.floor(Math.random() * 8) * 4; // 20, 24, ..., 48
  return { P };
}

function FenceDiagram({ P, w, l }: { P: number; w: number; l: number }) {
  const boxSize = 180;
  const scale = boxSize / P;
  const wPx = Math.max(w * scale, 2);
  const lPx = Math.max(l * scale, 2);
  const originX = 20;
  const originY = boxSize - lPx + 20;

  return (
    <svg width={boxSize + 40} height={boxSize + 40} viewBox={`0 0 ${boxSize + 40} ${boxSize + 40}`}>
      {/* wall: thick line on the left, no fence needed there */}
      <line x1={originX} y1={originY} x2={originX} y2={originY + lPx} stroke="var(--color-muted-foreground)" strokeWidth={6} />
      {/* fenced sides */}
      <rect
        x={originX}
        y={originY}
        width={wPx}
        height={lPx}
        fill="var(--color-chart-1)"
        fillOpacity={0.15}
        stroke="var(--color-chart-1)"
        strokeWidth={3}
      />
      <text x={originX + wPx / 2} y={originY + lPx + 16} textAnchor="middle" className="fill-muted-foreground text-xs font-mono">
        w = {w.toFixed(1)}
      </text>
      <text x={originX - 8} y={originY + lPx / 2} textAnchor="end" className="fill-muted-foreground text-xs font-mono">
        l = {l.toFixed(1)}
      </text>
    </svg>
  );
}

export function OptimizationPractice() {
  const [round, setRound] = useState(() => randomRound());
  const [w, setW] = useState(1);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct">("playing");

  const optW = useMemo(() => fenceOptimalWidth(round.P), [round]);
  const l = round.P - 2 * w;
  const area = fenceArea(round.P, w);
  const maxArea = fenceArea(round.P, optW);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setW(1);
    setStatus("playing");
  }, []);

  const handleChange = useCallback(
    (value: number) => {
      if (status === "correct") return;
      setW(value);
      if (Math.abs(value - optW) <= TOLERANCE) {
        setStatus("correct");
        setScore((s) => s + 1);
      }
    },
    [status, optW],
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex items-center justify-center">
          <FenceDiagram P={round.P} w={w} l={l} />
        </div>
        <div className="h-56">
          <GraphCanvas initialXDomain={[0, round.P / 2]} initialYDomain={[0, maxArea * 1.2]}>
            <FunctionPlot expression="w*(P-2*w)" variable="w" scope={{ P: round.P }} color="var(--color-chart-2)" strokeWidth={2} />
            <Point x={w} y={area} color={status === "correct" ? "var(--color-chart-1)" : "var(--color-chart-4)"} radius={5} />
          </GraphCanvas>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-border p-4 md:w-80 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Optimization</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You have {round.P}m of fencing to enclose a rectangular field against an existing wall — so only
            3 sides need fencing. Find the width w that gives the largest possible area.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Width w</Label>
            <span className="font-mono">{w.toFixed(1)}</span>
          </div>
          <Slider
            min={0.5}
            max={round.P / 2 - 0.5}
            step={0.1}
            value={[w]}
            onValueChange={(v) => handleChange(Array.isArray(v) ? v[0] : (v as number))}
            disabled={status === "correct"}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Area: <span className="font-mono text-foreground">{area.toFixed(1)} m²</span>
        </p>

        {status === "correct" && (
          <p className="text-sm text-chart-1">
            Correct — w = {optW.toFixed(1)} maximizes the area at {maxArea.toFixed(1)} m². With A(w) =
            w(P−2w), the derivative dA/dw = P−4w hits exactly 0 right at this width — the same &quot;flat
            slope at the peak&quot; idea from every other critical point you&apos;ve found so far, just applied
            to find the best answer instead of just describing the curve.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-foreground">{score}</span>
          </p>
          <Button onClick={nextRound} disabled={status !== "correct"}>
            Next
          </Button>
        </div>
      </aside>
    </div>
  );
}
