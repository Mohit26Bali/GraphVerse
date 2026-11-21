export interface ExpContext {
  id: string;
  label: string;
  aLabel: string;
  unit: string;
  describe: (A: number, b: number, x: number, y: number) => string;
}

export const CONTEXTS: ExpContext[] = [
  {
    id: "population",
    label: "Population",
    aLabel: "Starting population",
    unit: "organisms",
    describe: (A, b, x, y) =>
      `A population of ${A} organisms, changing by a factor of ${b.toFixed(2)}× per generation, reaches about ${Math.round(y)} after ${x.toFixed(1)} generations.`,
  },
  {
    id: "finance",
    label: "Finance",
    aLabel: "Initial investment",
    unit: "$",
    describe: (A, b, x, y) =>
      `An investment of $${A}, compounding at ${b.toFixed(2)}× per year, grows to about $${Math.round(y)} after ${x.toFixed(1)} years.`,
  },
  {
    id: "decay",
    label: "Radioactive decay",
    aLabel: "Initial mass",
    unit: "g",
    describe: (A, b, x, y) =>
      `A ${A}g sample, decaying by a factor of ${b.toFixed(2)}× per half-life, leaves about ${Math.max(y, 0).toFixed(2)}g after ${x.toFixed(1)} half-lives.`,
  },
  {
    id: "continuous",
    label: "Continuous growth",
    aLabel: "Initial value",
    unit: "",
    describe: (A, b, x, y) =>
      `Starting at ${A} and compounding continuously at factor ${b.toFixed(2)}× per unit of x, the value reaches about ${y.toFixed(2)} at x = ${x.toFixed(1)}.`,
  },
];
