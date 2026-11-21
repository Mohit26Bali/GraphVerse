import type { LimitClassification } from "@/math-engine/limits";

export const CLASSIFICATION_INFO: Record<
  LimitClassification,
  { label: string; colorClass: string; explanation: string }
> = {
  continuous: {
    label: "Continuous",
    colorClass: "border-chart-1/40 text-chart-1",
    explanation: "The limit exists and equals f(a) — no gap, no jump.",
  },
  removable: {
    label: "Removable discontinuity",
    colorClass: "border-chart-4/40 text-chart-4",
    explanation: "The limit exists, but f(a) is undefined or doesn't match it — a hole in the graph.",
  },
  jump: {
    label: "Jump discontinuity",
    colorClass: "border-destructive/40 text-destructive",
    explanation: "The left and right limits disagree — there's no single limit here.",
  },
  infinite: {
    label: "Infinite limit",
    colorClass: "border-chart-5/40 text-chart-5",
    explanation: "The function grows without bound near this point — a vertical asymptote.",
  },
  "undefined-nearby": {
    label: "Undefined nearby",
    colorClass: "border-muted-foreground/40 text-muted-foreground",
    explanation: "The function isn't defined close enough to this point to estimate a limit.",
  },
};
