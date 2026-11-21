"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import type { UseExplainResult } from "./useExplain";

export interface ExplainPanelProps {
  state: UseExplainResult;
  onRequest: () => void;
  label?: string;
}

export function ExplainPanel({ state, onRequest, label = "Explain this" }: ExplainPanelProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <Button variant="outline" size="sm" onClick={onRequest} disabled={state.loading} className="self-start">
        {state.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {state.loading ? "Thinking…" : label}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.explanation && <p className="text-sm text-muted-foreground">{state.explanation}</p>}
    </div>
  );
}
