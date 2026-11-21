import { parse } from "mathjs";

export type TrigKind = "sin" | "cos" | "tan";

export interface TrigParams {
  amplitude: number;
  frequency: number;
  phase: number;
  shift: number;
}

/** "A*sin(B*(x-C))+D" — A/B/C/D stay as scope variables so the compiled AST is stable while sliders move. */
export function trigTemplate(kind: TrigKind): string {
  return `A*${kind}(B*(x-C))+D`;
}

export function trigScope({ amplitude, frequency, phase, shift }: TrigParams): Record<string, number> {
  return { A: amplitude, B: frequency, C: phase, D: shift };
}

export function trigPeriod(frequency: number): number {
  return (2 * Math.PI) / Math.max(Math.abs(frequency), 1e-4);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatTrigLatex(kind: TrigKind, { amplitude, frequency, phase, shift }: TrigParams): string {
  const expr = `${round(amplitude)}*${kind}(${round(frequency)}*(x-(${round(phase)})))+${round(shift)}`;
  try {
    return `y = ${parse(expr).toTex({ parenthesis: "auto" })}`;
  } catch {
    return `y = ${expr}`;
  }
}
