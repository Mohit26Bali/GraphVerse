import type { Domain } from "./types";

/** Picks a "nice" (1/2/5 × 10^n) tick spacing so grid lines land on human-readable values, targeting ~80px between lines. */
export function niceStep(domain: Domain, pixelSpan: number, targetPx = 80): number {
  const span = Math.abs(domain[1] - domain[0]) || 1;
  const targetTicks = Math.max(pixelSpan / targetPx, 1);
  const rawStep = span / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let niceResidual: number;
  if (residual >= 5) niceResidual = 10;
  else if (residual >= 2) niceResidual = 5;
  else if (residual >= 1) niceResidual = 2;
  else niceResidual = 1;

  return niceResidual * magnitude;
}
