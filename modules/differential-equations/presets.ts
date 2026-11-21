export interface ODEPreset {
  id: string;
  label: string;
  raw: string;
  description: string;
}

export const ODE_PRESETS: ODEPreset[] = [
  {
    id: "growth",
    label: "dy/dx = y",
    raw: "y",
    description: "Exponential growth or decay — the rate of change is proportional to the current value.",
  },
  {
    id: "linear",
    label: "dy/dx = x - y",
    raw: "x-y",
    description: "Every trajectory bends toward the line y = x - 1 and follows it.",
  },
  {
    id: "circle",
    label: "dy/dx = -x/y",
    raw: "-x/y",
    description: "Traces circles centered on the origin — undefined exactly on y = 0.",
  },
  {
    id: "sine",
    label: "dy/dx = sin(x)",
    raw: "sin(x)",
    description: "Depends only on x, not y — every trajectory is just a vertical shift of the same shape.",
  },
  {
    id: "logistic",
    label: "dy/dx = y(1-y)",
    raw: "y*(1-y)",
    description: "Logistic growth — trajectories level off near y = 0 or y = 1, never crossing them.",
  },
];
