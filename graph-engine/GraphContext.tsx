"use client";

import { createContext, useContext } from "react";
import type { Scales, Viewport } from "./types";

export interface GraphContextValue extends Scales {
  viewport: Viewport;
}

export const GraphContext = createContext<GraphContextValue | null>(null);

export function useGraphContext(): GraphContextValue {
  const ctx = useContext(GraphContext);
  if (!ctx) {
    throw new Error("Graph engine components must be used inside <GraphCanvas>.");
  }
  return ctx;
}
