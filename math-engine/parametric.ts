export interface ParametricParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface ParametricCurveDef {
  id: string;
  label: string;
  /** Expression for x, in terms of t and this curve's params. */
  xExpression: string;
  /** Expression for y, in terms of t and this curve's params. */
  yExpression: string;
  params: ParametricParam[];
  /** How far t needs to sweep to draw the full curve — generous fixed values, not derived from gcd/period math. */
  tMax: number;
  description: string;
}

export const PARAMETRIC_CURVES: ParametricCurveDef[] = [
  {
    id: "circle",
    label: "Circle",
    xExpression: "R*cos(t)",
    yExpression: "R*sin(t)",
    params: [{ key: "R", label: "Radius", min: 0.5, max: 4, step: 0.1, default: 2 }],
    tMax: 2 * Math.PI,
    description: "Every point stays exactly R away from the center — the same idea as the unit circle, generalized.",
  },
  {
    id: "ellipse",
    label: "Ellipse",
    xExpression: "A*cos(t)",
    yExpression: "B*sin(t)",
    params: [
      { key: "A", label: "Horizontal radius", min: 0.5, max: 4, step: 0.1, default: 3 },
      { key: "B", label: "Vertical radius", min: 0.5, max: 4, step: 0.1, default: 1.5 },
    ],
    tMax: 2 * Math.PI,
    description: "A stretched circle — independent horizontal and vertical radii.",
  },
  {
    id: "lissajous",
    label: "Lissajous",
    xExpression: "Ax*sin(a*t+d)",
    yExpression: "Ay*sin(b*t)",
    params: [
      { key: "Ax", label: "x amplitude", min: 0.5, max: 3, step: 0.1, default: 2 },
      { key: "Ay", label: "y amplitude", min: 0.5, max: 3, step: 0.1, default: 2 },
      { key: "a", label: "x frequency", min: 1, max: 5, step: 1, default: 3 },
      { key: "b", label: "y frequency", min: 1, max: 5, step: 1, default: 2 },
      { key: "d", label: "phase", min: -3.14, max: 3.14, step: 0.1, default: Math.PI / 2 },
    ],
    tMax: 12 * Math.PI,
    description: "Two perpendicular waves at different frequencies trace a figure — the pattern that drives an oscilloscope's X-Y mode.",
  },
  {
    id: "cycloid",
    label: "Cycloid",
    xExpression: "R*(t-sin(t))",
    yExpression: "R*(1-cos(t))",
    params: [{ key: "R", label: "Wheel radius", min: 0.3, max: 2, step: 0.1, default: 1 }],
    tMax: 4 * Math.PI,
    description: "The path traced by a point on the rim of a wheel rolling along a flat line.",
  },
  {
    id: "spirograph",
    label: "Spirograph",
    xExpression: "(R-r)*cos(t)+d*cos((R-r)/r*t)",
    yExpression: "(R-r)*sin(t)-d*sin((R-r)/r*t)",
    params: [
      { key: "R", label: "Fixed ring radius", min: 3, max: 10, step: 1, default: 8 },
      { key: "r", label: "Rolling circle radius", min: 1, max: 5, step: 1, default: 3 },
      { key: "d", label: "Pen offset", min: 0, max: 8, step: 0.5, default: 5 },
    ],
    tMax: 40 * Math.PI,
    description: "A smaller circle rolling inside a larger fixed ring, tracing a loop with a pen offset from its center — the classic toy.",
  },
];

export function getCurveById(id: string): ParametricCurveDef {
  return PARAMETRIC_CURVES.find((c) => c.id === id) ?? PARAMETRIC_CURVES[0];
}

export function defaultParams(curve: ParametricCurveDef): Record<string, number> {
  return Object.fromEntries(curve.params.map((p) => [p.key, p.default]));
}
