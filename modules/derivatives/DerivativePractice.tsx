"use client";

import { useState } from "react";
import { TangentPractice } from "./TangentPractice";
import { RelatedRatesPractice } from "./RelatedRatesPractice";
import { OptimizationPractice } from "./OptimizationPractice";

const MODES = [
  { id: "tangent", label: "Tangent slope", component: TangentPractice },
  { id: "related-rates", label: "Related rates", component: RelatedRatesPractice },
  { id: "optimization", label: "Optimization", component: OptimizationPractice },
] as const;

export function DerivativePractice() {
  const [modeId, setModeId] = useState<(typeof MODES)[number]["id"]>("tangent");
  const mode = MODES.find((m) => m.id === modeId) ?? MODES[0];
  const Active = mode.component;

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1.5 border-b border-border px-4 py-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setModeId(m.id)}
            className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
              m.id === modeId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <Active />
      </div>
    </div>
  );
}
