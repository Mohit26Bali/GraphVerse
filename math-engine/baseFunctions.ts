export interface BaseFunction {
  id: string;
  label: string;
  raw: string;
}

export const BASE_FUNCTIONS: BaseFunction[] = [
  { id: "quadratic", label: "x²", raw: "x^2" },
  { id: "cubic", label: "x³", raw: "x^3" },
  { id: "sine", label: "sin(x)", raw: "sin(x)" },
  { id: "sqrt", label: "√x", raw: "sqrt(x)" },
  { id: "abs", label: "|x|", raw: "abs(x)" },
];
