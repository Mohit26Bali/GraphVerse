export interface LimitPreset {
  id: string;
  label: string;
  raw: string;
  a: number;
  description: string;
}

export const LIMIT_PRESETS: LimitPreset[] = [
  {
    id: "continuous",
    label: "x² + 1",
    raw: "x^2+1",
    a: 2,
    description: "A smooth, continuous function — the limit equals the function value everywhere.",
  },
  {
    id: "removable",
    label: "(x²-1)/(x-1)",
    raw: "(x^2-1)/(x-1)",
    a: 1,
    description: "Undefined exactly at x=1 (0/0), but the limit still exists — a removable discontinuity, a \"hole\".",
  },
  {
    id: "jump",
    label: "floor(x)",
    raw: "floor(x)",
    a: 2,
    description: "The left and right limits disagree — a jump discontinuity.",
  },
  {
    id: "infinite",
    label: "1/x",
    raw: "1/x",
    a: 0,
    description: "Grows without bound on both sides as x approaches 0 — an infinite limit (vertical asymptote).",
  },
  {
    id: "sign",
    label: "|x|/x",
    raw: "abs(x)/x",
    a: 0,
    description: "Approaches -1 from the left and +1 from the right — a jump discontinuity at the origin.",
  },
];
