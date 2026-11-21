export type ModuleCategory =
  | "foundations"
  | "algebra"
  | "trigonometry"
  | "analysis"
  | "advanced";

export type ModuleStatus = "available" | "planned";

export interface ModuleMeta {
  id: string;
  slug: string;
  order: number;
  title: string;
  category: ModuleCategory;
  summary: string;
  status: ModuleStatus;
}

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  foundations: "Foundations",
  algebra: "Algebra",
  trigonometry: "Trigonometry",
  analysis: "Analysis",
  advanced: "Advanced Topics",
};
