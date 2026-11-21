"use client";

import { useCallback, useState } from "react";

export interface ExplainInput {
  moduleTitle: string;
  context: string;
}

export interface UseExplainResult {
  explanation: string | null;
  loading: boolean;
  error: string | null;
  explain: (input: ExplainInput) => void;
  reset: () => void;
}

/** Calls /api/explain (a server-side proxy to Groq) — never call the Groq API directly from the client. */
export function useExplain(): UseExplainResult {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explain = useCallback((input: ExplainInput) => {
    setLoading(true);
    setError(null);

    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
        setExplanation(data.explanation);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
  }, []);

  const reset = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return { explanation, loading, error, explain, reset };
}
