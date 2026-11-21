import type { Piece } from "@/math-engine/piecewise";
import { generateStepPieces } from "@/math-engine/piecewise";

export interface Preset {
  id: string;
  label: string;
  description: string;
  build: (domain: [number, number]) => Piece[];
}

export const PRESETS: Preset[] = [
  {
    id: "abs",
    label: "|x|",
    description: "Two linear pieces meeting at a corner — continuous, but not smooth.",
    build: () => [
      { id: "abs-neg", expression: "-x", interval: { start: -Infinity, end: 0, startInclusive: false, endInclusive: false } },
      { id: "abs-pos", expression: "x", interval: { start: 0, end: Infinity, startInclusive: true, endInclusive: false } },
    ],
  },
  {
    id: "floor",
    label: "floor(x)",
    description: "Rounds down to the nearest integer — a staircase with a jump at every integer.",
    build: (domain) => generateStepPieces("floor", domain),
  },
  {
    id: "ceil",
    label: "ceil(x)",
    description: "Rounds up to the nearest integer — the same staircase, shifted.",
    build: (domain) => generateStepPieces("ceil", domain),
  },
  {
    id: "step",
    label: "step(x)",
    description: "A single jump at x = 0 — 0 for negative x, 1 for non-negative x.",
    build: (domain) => generateStepPieces("step", domain),
  },
];
