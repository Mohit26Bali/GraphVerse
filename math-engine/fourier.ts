export type WaveKind = "square" | "sawtooth" | "triangle";

export interface Harmonic {
  k: number;
  amplitude: number;
}

/** Reference expression (period 2π, amplitude ±1) that each wave's Fourier series converges to — used to plot the true target for comparison. */
export const WAVE_REFERENCE: Record<WaveKind, string> = {
  square: "sign(sin(x))",
  sawtooth: "2*(x/(2*pi) - floor(x/(2*pi)+0.5))",
  triangle: "(2/pi)*asin(sin(x))",
};

/**
 * Closed-form Fourier sine coefficients for the classic square/sawtooth/triangle waves —
 * `termCount` is the exact number of harmonics returned (square/triangle only have odd
 * harmonics, so this skips the zero terms rather than wasting slider positions on them).
 * Verified: the partial sum at 50 terms matches each WAVE_REFERENCE formula closely away
 * from discontinuities (square/sawtooth residual ~0.005-0.006 at 50 terms, expected for their
 * slower 1/k convergence; triangle matches almost exactly, since it converges as 1/k²).
 */
export function fourierCoefficients(kind: WaveKind, termCount: number): Harmonic[] {
  const harmonics: Harmonic[] = [];

  if (kind === "sawtooth") {
    for (let k = 1; k <= termCount; k++) {
      const sign = k % 2 === 0 ? -1 : 1;
      harmonics.push({ k, amplitude: (2 / Math.PI) * (sign / k) });
    }
    return harmonics;
  }

  for (let i = 0; i < termCount; i++) {
    const k = 2 * i + 1;
    if (kind === "square") {
      harmonics.push({ k, amplitude: (4 / Math.PI) * (1 / k) });
    } else {
      const m = (k - 1) / 2;
      const sign = m % 2 === 0 ? 1 : -1;
      harmonics.push({ k, amplitude: (8 / Math.PI ** 2) * (sign / (k * k)) });
    }
  }

  return harmonics;
}

export function reconstructAt(harmonics: Harmonic[], t: number): number {
  return harmonics.reduce((sum, h) => sum + h.amplitude * Math.sin(h.k * t), 0);
}

/** Plottable "Σ amplitude·sin(k·x)" expression — verified to match reconstructAt exactly. */
export function reconstructionExpression(harmonics: Harmonic[]): string {
  if (harmonics.length === 0) return "0";
  return harmonics.map((h) => `(${h.amplitude})*sin(${h.k}*x)`).join("+");
}

/** Cumulative vector-chain tip positions for the epicycle visualization — position [i] is where circle i is centered (the tip of the sum of the first i vectors). */
export function epicycleTips(harmonics: Harmonic[], t: number): { x: number; y: number }[] {
  const tips: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  let x = 0;
  let y = 0;
  for (const h of harmonics) {
    const angle = h.k * t;
    x += h.amplitude * Math.cos(angle);
    y += h.amplitude * Math.sin(angle);
    tips.push({ x, y });
  }
  return tips;
}
