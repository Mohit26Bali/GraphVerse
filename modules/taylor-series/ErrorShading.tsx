"use client";

import { useMemo } from "react";
import { useGraphContext } from "@/graph-engine";
import { compileFunction } from "@/math-engine/evaluate";

export interface ErrorShadingProps {
  expressionA: string;
  expressionB: string;
  domain: [number, number];
  samples?: number;
  color?: string;
}

/** Shades the region between two curves — here, the gap between f(x) and its Taylor polynomial, making the approximation error visible rather than just numeric. */
export function ErrorShading({ expressionA, expressionB, domain, samples = 200, color = "var(--color-destructive)" }: ErrorShadingProps) {
  const { xScale, yScale, viewport } = useGraphContext();

  const path = useMemo(() => {
    let fnA, fnB;
    try {
      fnA = compileFunction(expressionA);
      fnB = compileFunction(expressionB);
    } catch {
      return null;
    }

    const [start, end] = domain;
    const step = (end - start) / (samples - 1);
    const top: { x: number; y: number }[] = [];
    const bottom: { x: number; y: number }[] = [];

    for (let i = 0; i < samples; i++) {
      const x = start + i * step;
      let a: number;
      let b: number;
      try {
        a = fnA.evaluate(x);
        b = fnB.evaluate(x);
      } catch {
        a = NaN;
        b = NaN;
      }
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      top.push({ x, y: Math.max(a, b) });
      bottom.push({ x, y: Math.min(a, b) });
    }

    if (top.length < 2) return null;

    let d = `M ${xScale(top[0].x)} ${yScale(top[0].y)}`;
    for (let i = 1; i < top.length; i++) d += ` L ${xScale(top[i].x)} ${yScale(top[i].y)}`;
    for (let i = bottom.length - 1; i >= 0; i--) d += ` L ${xScale(bottom[i].x)} ${yScale(bottom[i].y)}`;
    d += " Z";

    return d;
  }, [expressionA, expressionB, domain, samples, xScale, yScale]);

  if (!path || viewport.width === 0) return null;

  return <path d={path} fill={color} fillOpacity={0.15} stroke="none" />;
}
