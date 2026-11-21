"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, DiscreteSeries, ReferenceLine } from "@/graph-engine";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { compileTerm, partialSums, sequenceTerms } from "@/math-engine/sequences";

const MAX_N = 80;
const DOMAIN_X: [number, number] = [0, MAX_N + 2];

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function SequencesSandbox() {
  const [draft, setDraft] = useState("1/n^2");
  const [raw, setRaw] = useState("1/n^2");
  const [n, setN] = useState(30);
  const [showTerms, setShowTerms] = useState(false);

  const error = useMemo(() => {
    try {
      compileTerm(raw).evaluate(1);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Couldn't parse that expression.";
    }
  }, [raw]);

  const sums = useMemo(() => (error ? [] : partialSums(raw, MAX_N)), [raw, error]);
  const terms = useMemo(() => (error ? [] : sequenceTerms(raw, MAX_N)), [raw, error]);

  const visibleSums = sums.slice(0, n).map((p) => ({ x: p.n, y: p.value }));
  const visibleTerms = terms.slice(0, n).map((p) => ({ x: p.n, y: p.value }));
  const currentSum = sums[n - 1]?.value ?? 0;

  const domainY = useMemo<[number, number]>(() => {
    if (sums.length === 0) return [-1, 1];
    const values = [0, ...sums.map((p) => p.value)];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.15, 0.3);
    return [min - pad, max + pad];
  }, [sums]);

  // A rough numerical read on where it's heading: compare the sum's growth over the last few
  // terms — if it's nearly flat, treat that as an approximate limit; otherwise call it divergent.
  const trend = useMemo(() => {
    if (sums.length < 10) return null;
    const last = sums[sums.length - 1].value;
    const prev = sums[sums.length - 10].value;
    const recentGrowth = Math.abs(last - prev);
    return recentGrowth < 0.01 ? { settling: true, near: last } : { settling: false, near: null };
  }, [sums]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <GraphCanvas initialXDomain={DOMAIN_X} initialYDomain={domainY}>
          {!error && (
            <>
              {trend?.settling && trend.near !== null && (
                <ReferenceLine orientation="horizontal" at={trend.near} tooltip={`~${round(trend.near)}`} />
              )}
              {showTerms ? (
                <DiscreteSeries points={visibleTerms} color="var(--color-chart-2)" label="terms (aₙ)" />
              ) : (
                <DiscreteSeries points={visibleSums} color="var(--color-chart-1)" label="partial sums (Sₙ)" />
              )}
            </>
          )}
        </GraphCanvas>
      </div>

      <aside className="flex w-full flex-col gap-4 overflow-y-auto border-t border-border p-4 md:w-96 md:border-t-0 md:border-l">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setRaw(draft.trim());
          }}
        >
          <span className="flex items-center font-mono text-sm text-muted-foreground">aₙ =</span>
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} spellCheck={false} autoComplete="off" className="font-mono" placeholder="e.g. 1/n^2, (2/3)^n" />
          <Button type="submit">Plot</Button>
        </form>

        {error && <p className="text-sm text-destructive">Couldn&apos;t parse this: {error}</p>}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Terms (n)</Label>
            <span className="font-mono">{n}</span>
          </div>
          <Slider min={1} max={MAX_N} step={1} value={[n]} onValueChange={(v) => setN(Array.isArray(v) ? v[0] : (v as number))} />
        </div>

        <div className="flex items-center gap-2">
          <Switch id="sandbox-terms-toggle" checked={showTerms} onCheckedChange={setShowTerms} />
          <Label htmlFor="sandbox-terms-toggle">Show individual terms instead of the running sum</Label>
        </div>

        {!error && (
          <p className="text-sm text-muted-foreground">
            Partial sum S<sub>{n}</sub>: <span className="font-mono text-foreground">{round(currentSum)}</span>
          </p>
        )}

        {!error && trend && (
          <p className="text-sm text-muted-foreground">
            {trend.settling
              ? `Looks like it's settling near ${round(trend.near ?? 0)} — the last 10 terms barely moved the sum.`
              : "Still moving noticeably over the last 10 terms — either it converges slowly, or it diverges."}
          </p>
        )}
      </aside>
    </div>
  );
}
