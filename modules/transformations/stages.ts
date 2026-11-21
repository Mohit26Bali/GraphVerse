import type { TransformParams } from "@/math-engine/transform";

export interface TransformStage {
  label: string;
  caption: string;
  values: TransformParams;
}

/** The spec's canonical walkthrough: f(x) → f(x)+k → f(x-h) → af(x) → f(ax) → -f(x), each step cumulative. */
export const STAGES: TransformStage[] = [
  { label: "f(x)", caption: "The parent function, unchanged.", values: { a: 1, b: 1, h: 0, k: 0 } },
  { label: "f(x) + k", caption: "Adding k shifts the graph vertically.", values: { a: 1, b: 1, h: 0, k: 2 } },
  { label: "f(x - h)", caption: "Subtracting h inside the function shifts it horizontally.", values: { a: 1, b: 1, h: 3, k: 2 } },
  { label: "a · f(x)", caption: "Multiplying by a stretches (or compresses) it vertically.", values: { a: 2, b: 1, h: 3, k: 2 } },
  { label: "f(b · x)", caption: "Multiplying x by b stretches (or compresses) it horizontally.", values: { a: 2, b: 0.5, h: 3, k: 2 } },
  { label: "-f(x)", caption: "Flipping the sign reflects it across the x-axis.", values: { a: -2, b: 0.5, h: 3, k: 2 } },
];

export const IDENTITY: TransformParams = { a: 1, b: 1, h: 0, k: 0 };
