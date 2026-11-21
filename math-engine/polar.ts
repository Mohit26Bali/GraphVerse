import type { ParametricParam } from "./parametric";

export interface PolarCurveDef {
  id: string;
  label: string;
  /** r(θ), in terms of t (representing θ) and this curve's params. */
  rExpression: string;
  params: ParametricParam[];
  /** How far θ needs to sweep to draw the full curve — can depend on params (e.g. spiral turns). */
  tMax: (params: Record<string, number>) => number;
  description: string;
}

export const POLAR_CURVES: PolarCurveDef[] = [
  {
    id: "rose",
    label: "Rose",
    rExpression: "A*cos(k*t)",
    params: [
      { key: "A", label: "Petal length", min: 0.5, max: 4, step: 0.1, default: 2 },
      { key: "k", label: "Petal factor (k)", min: 1, max: 7, step: 1, default: 3 },
    ],
    tMax: () => 2 * Math.PI,
    description: "r = A·cos(kθ) — odd k gives k petals, even k gives 2k petals.",
  },
  {
    id: "cardioid",
    label: "Cardioid",
    rExpression: "A*(1+cos(t))",
    params: [{ key: "A", label: "Size", min: 0.5, max: 3, step: 0.1, default: 2 }],
    tMax: () => 2 * Math.PI,
    description: "r = A(1 + cos θ) — a heart shape, the simplest member of the limaçon family.",
  },
  {
    id: "lemniscate",
    label: "Lemniscate",
    rExpression: "A*sqrt(cos(2*t))",
    params: [{ key: "A", label: "Size", min: 0.5, max: 3, step: 0.1, default: 2 }],
    tMax: () => 2 * Math.PI,
    description: "r² = A²cos(2θ) — a figure eight, undefined (and left blank) wherever cos(2θ) < 0.",
  },
  {
    id: "spiral",
    label: "Spiral",
    rExpression: "A*t",
    params: [
      { key: "A", label: "Growth rate", min: 0.1, max: 1, step: 0.05, default: 0.4 },
      { key: "turns", label: "Turns", min: 1, max: 5, step: 1, default: 3 },
    ],
    tMax: (params) => (params.turns ?? 3) * 2 * Math.PI,
    description: "r = Aθ — the distance from the origin grows steadily as the angle sweeps.",
  },
];

export function getPolarCurveById(id: string): PolarCurveDef {
  return POLAR_CURVES.find((c) => c.id === id) ?? POLAR_CURVES[0];
}

export function polarDefaultParams(curve: PolarCurveDef): Record<string, number> {
  return Object.fromEntries(curve.params.map((p) => [p.key, p.default]));
}

/**
 * x = r(θ)·cosθ, y = r(θ)·sinθ — this already handles negative r correctly with no special
 * casing: e.g. r=-2 at θ gives the same point as r=2 at θ+π automatically, since
 * cos/sin don't care about the sign fed into them.
 */
export function toCartesianExpressions(rExpression: string): { xExpression: string; yExpression: string } {
  return {
    xExpression: `(${rExpression})*cos(t)`,
    yExpression: `(${rExpression})*sin(t)`,
  };
}
