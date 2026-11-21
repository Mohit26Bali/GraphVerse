export interface SeriesPreset {
  id: string;
  label: string;
  /** Term expression in n, e.g. "(1/2)^n" — n starts at 1. */
  termExpression: string;
  /** Closed-form limit of the partial sums, or null if the series is known to diverge. */
  limit: number | null;
  description: string;
}

/**
 * Closed forms verified numerically against 2000-term partial sums before shipping:
 * geometric series -> a/(1-r), alternating harmonic -> ln 2, p-series (p=2) -> pi^2/6
 * (the Basel problem), plain harmonic confirmed to keep growing (never settles) out to
 * S_2000 ~= 8.18, well past S_60 ~= 4.68 — genuinely divergent, just slowly.
 */
export const SERIES_PRESETS: SeriesPreset[] = [
  {
    id: "geometric-half",
    label: "Σ (1/2)ⁿ",
    termExpression: "(1/2)^n",
    limit: 1,
    description: "Each term is half the one before — the classic converging geometric series.",
  },
  {
    id: "geometric-neg-third",
    label: "Σ (-1/3)ⁿ",
    termExpression: "(-1/3)^n",
    limit: -0.25,
    description: "A geometric series with a negative ratio — it overshoots the limit from both sides as it converges.",
  },
  {
    id: "alternating-harmonic",
    label: "Σ (-1)ⁿ⁺¹/n",
    termExpression: "((-1)^(n+1))/n",
    limit: Math.log(2),
    description: "Terms shrink but only alternate in sign — converges, but much more slowly than a geometric series.",
  },
  {
    id: "p-series-2",
    label: "Σ 1/n²",
    termExpression: "1/n^2",
    limit: Math.PI ** 2 / 6,
    description: "Terms shrink fast enough to converge — famously to π²/6 (the Basel problem).",
  },
  {
    id: "harmonic",
    label: "Σ 1/n",
    termExpression: "1/n",
    limit: null,
    description: "Terms shrink, but not fast enough — this one grows without bound, just very slowly.",
  },
  {
    id: "constant",
    label: "Σ 1",
    termExpression: "1",
    limit: null,
    description: "The terms don't shrink at all — adding 1 every time obviously grows without bound.",
  },
];
