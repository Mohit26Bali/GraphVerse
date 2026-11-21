"use client";

interface StageProps {
  label: string;
  value: number | null;
  revealed: boolean;
}

function Stage({ label, value, revealed }: StageProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-card font-mono text-sm font-medium">
        {label}
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        {revealed && value !== null ? (Number.isFinite(value) ? value.toFixed(2) : "undefined") : "—"}
      </span>
    </div>
  );
}

function clamp01(n: number): number {
  return Math.min(Math.max(n, 0), 1);
}

export interface CompositionMachineProps {
  x0: number;
  fLabel: string;
  gLabel: string;
  fValue: number;
  gValue: number;
  /** 0 = token at input, 0.5 = token arrives at f, 1 = token arrives at g. */
  progress: number;
}

export function CompositionMachine({ x0, fLabel, gLabel, fValue, gValue, progress }: CompositionMachineProps) {
  const pastF = progress >= 0.5;
  const pastG = progress >= 1;
  const firstLegPosition = clamp01(progress / 0.5);
  const secondLegPosition = clamp01((progress - 0.5) / 0.5);

  return (
    <div className="relative flex items-center justify-between gap-2">
      <Stage label="x" value={x0} revealed />
      <div className="relative h-px flex-1 bg-border">
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-chart-2 transition-[left] duration-100"
          style={{ left: `${firstLegPosition * 100}%`, opacity: progress < 0.5 ? 1 : 0 }}
        />
      </div>
      <Stage label={fLabel} value={fValue} revealed={pastF} />
      <div className="relative h-px flex-1 bg-border">
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-chart-2 transition-[left] duration-100"
          style={{ left: `${secondLegPosition * 100}%`, opacity: progress >= 0.5 ? 1 : 0 }}
        />
      </div>
      <Stage label={gLabel} value={gValue} revealed={pastG} />
    </div>
  );
}
