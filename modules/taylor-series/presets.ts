export interface TaylorPreset {
  id: string;
  label: string;
  raw: string;
}

export const TAYLOR_PRESETS: TaylorPreset[] = [
  { id: "sin", label: "sin(x)", raw: "sin(x)" },
  { id: "cos", label: "cos(x)", raw: "cos(x)" },
  { id: "exp", label: "eˣ", raw: "exp(x)" },
];
