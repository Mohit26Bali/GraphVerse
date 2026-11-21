export interface SurfacePreset {
  id: string;
  label: string;
  expression: string;
  domain: [number, number];
  description: string;
  /** Only set for presets with one clear, unambiguous critical point — used by the Practice tab. */
  criticalPoint?: { x: number; y: number };
  classification?: "min" | "max" | "saddle";
}

export const SURFACE_PRESETS: SurfacePreset[] = [
  {
    id: "bowl",
    label: "x² + y²",
    expression: "x^2 + y^2",
    domain: [-3, 3],
    description: "A bowl — one clear minimum at the origin, gradient always points away from center (steepest ascent, radially).",
    criticalPoint: { x: 0, y: 0 },
    classification: "min",
  },
  {
    id: "inverted-bowl",
    label: "-(x² + y²)",
    expression: "-(x^2 + y^2)",
    domain: [-3, 3],
    description: "The bowl flipped upside down — one clear maximum at the origin instead of a minimum.",
    criticalPoint: { x: 0, y: 0 },
    classification: "max",
  },
  {
    id: "saddle",
    label: "x² - y²",
    expression: "x^2 - y^2",
    domain: [-3, 3],
    description: "A saddle — rises along x, falls along y. The origin is a critical point (gradient zero) but neither a max nor a min.",
    criticalPoint: { x: 0, y: 0 },
    classification: "saddle",
  },
  {
    id: "ripples",
    label: "sin(x)·cos(y)",
    expression: "sin(x)*cos(y)",
    domain: [-6, 6],
    description: "A grid of alternating bumps and dips — many local maxima, minima, and saddle points across one surface.",
  },
  {
    id: "product",
    label: "x·y",
    expression: "x*y",
    domain: [-3, 3],
    description: "Another saddle shape, this time symmetric across both diagonals instead of the axes.",
    criticalPoint: { x: 0, y: 0 },
    classification: "saddle",
  },
];
