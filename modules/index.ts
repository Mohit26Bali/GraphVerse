import type { ModuleMeta } from "@/types/module";

export const modules: ModuleMeta[] = [
  // Foundations
  { id: "coordinate-plane", slug: "coordinate-plane", order: 1, title: "Coordinate Plane", category: "foundations", summary: "Axes, origin, scaling, and quadrants.", status: "available" },
  { id: "linear-functions", slug: "linear-functions", order: 2, title: "Linear Functions", category: "foundations", summary: "Slope, intercept, parallel and perpendicular lines.", status: "available" },
  { id: "quadratic-functions", slug: "quadratic-functions", order: 3, title: "Quadratic Functions", category: "foundations", summary: "Parabolas, vertex, roots, and axis of symmetry.", status: "available" },

  // Algebra
  { id: "polynomial-functions", slug: "polynomial-functions", order: 4, title: "Polynomial Functions", category: "algebra", summary: "Degree, roots, multiplicity, turning points.", status: "available" },
  { id: "transformations", slug: "transformations", order: 5, title: "Function Transformations", category: "algebra", summary: "Shifts, stretches, and reflections, animated.", status: "available" },
  { id: "piecewise-functions", slug: "piecewise-functions", order: 9, title: "Piecewise Functions", category: "algebra", summary: "Absolute value, step, floor, ceiling, continuity.", status: "available" },

  // Trigonometry
  { id: "trigonometric-functions", slug: "trigonometric-functions", order: 6, title: "Trigonometric Functions", category: "trigonometry", summary: "Sine, cosine, tangent, and the unit circle.", status: "available" },
  { id: "polar-functions", slug: "polar-functions", order: 11, title: "Polar Functions", category: "trigonometry", summary: "Rose curves, cardioids, lemniscates, spirals.", status: "available" },
  { id: "parametric-curves", slug: "parametric-curves", order: 10, title: "Parametric Curves", category: "trigonometry", summary: "Circles, ellipses, Lissajous figures, spirographs.", status: "available" },

  // Analysis
  { id: "exponential-functions", slug: "exponential-functions", order: 7, title: "Exponential Functions", category: "analysis", summary: "Growth, decay, and the number e.", status: "available" },
  { id: "logarithms", slug: "logarithms", order: 8, title: "Logarithms", category: "analysis", summary: "Inverse of exponentials, mirrored across y = x.", status: "available" },
  { id: "function-composition", slug: "function-composition", order: 12, title: "Function Composition", category: "analysis", summary: "The input/output machine, visualized.", status: "available" },
  { id: "inverse-functions", slug: "inverse-functions", order: 13, title: "Inverse Functions", category: "analysis", summary: "Reflecting a function across y = x.", status: "available" },
  { id: "limits", slug: "limits", order: 14, title: "Limits", category: "analysis", summary: "Approaching values, continuity, infinite limits.", status: "available" },
  { id: "derivatives", slug: "derivatives", order: 15, title: "Derivatives", category: "analysis", summary: "Rate of change, slope, and the tangent line.", status: "available" },
  { id: "integrals", slug: "integrals", order: 16, title: "Integrals", category: "analysis", summary: "Area, accumulation, and net area.", status: "available" },

  // Advanced Topics
  { id: "sequences-series", slug: "sequences-series", order: 17, title: "Sequences & Series", category: "advanced", summary: "Partial sums, convergence, and divergence.", status: "available" },
  { id: "taylor-series", slug: "taylor-series", order: 18, title: "Taylor Series", category: "advanced", summary: "Approximating curves with polynomials.", status: "available" },
  { id: "fourier-series", slug: "fourier-series", order: 19, title: "Fourier Series", category: "advanced", summary: "Epicycles, harmonics, wave construction.", status: "available" },
  { id: "differential-equations", slug: "differential-equations", order: 20, title: "Differential Equations", category: "advanced", summary: "Slope fields, numerical solutions, trajectories.", status: "available" },
  { id: "chaos-fractals", slug: "chaos-fractals", order: 21, title: "Chaos & Fractals", category: "advanced", summary: "Mandelbrot, Julia sets, the logistic map.", status: "available" },
  { id: "multivariable-calculus", slug: "multivariable-calculus", order: 22, title: "Multivariable Calculus", category: "advanced", summary: "Contour maps, partial derivatives, gradients, double integrals.", status: "available" },
];

export function getModuleBySlug(slug: string): ModuleMeta | undefined {
  return modules.find((m) => m.slug === slug);
}
