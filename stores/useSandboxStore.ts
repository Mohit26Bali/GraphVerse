import { create } from "zustand";

export interface PlottedFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

/** Every extra function costs a curve and an intersection search against all the others. */
export const MAX_FUNCTIONS = 10;
export const MAX_EXPRESSION_LENGTH = 200;

interface SandboxState {
  functions: PlottedFunction[];
  showGrid: boolean;
  addFunction: (expression: string) => void;
  removeFunction: (id: string) => void;
  updateExpression: (id: string, expression: string) => void;
  toggleVisibility: (id: string) => void;
  toggleGrid: () => void;
}

export const useSandboxStore = create<SandboxState>((set) => ({
  functions: [{ id: crypto.randomUUID(), expression: "sin(x)", color: PALETTE[0], visible: true }],
  showGrid: true,
  addFunction: (expression) =>
    set((state) => state.functions.length >= MAX_FUNCTIONS ? state : ({
      functions: [
        ...state.functions,
        {
          id: crypto.randomUUID(),
          expression: expression.slice(0, MAX_EXPRESSION_LENGTH),
          color: PALETTE[state.functions.length % PALETTE.length],
          visible: true,
        },
      ],
    })),
  removeFunction: (id) =>
    set((state) => ({ functions: state.functions.filter((f) => f.id !== id) })),
  updateExpression: (id, expression) =>
    set((state) => ({
      functions: state.functions.map((f) => (f.id === id ? { ...f, expression: expression.slice(0, MAX_EXPRESSION_LENGTH) } : f)),
    })),
  toggleVisibility: (id) =>
    set((state) => ({
      functions: state.functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
    })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}));
