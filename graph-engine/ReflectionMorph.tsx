"use client";

import { useMemo } from "react";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { useGraphContext } from "./GraphContext";
import { compileFunction } from "@/math-engine/evaluate";

export interface ReflectionMorphProps {
  /** Expression for f(x). */
  expression: string;
  scope?: Record<string, number>;
  /** 0 = f(x) as drawn; 1 = every point reflected across y=x. */
  t: number;
  /** Sampling domain — fixed, independent of pan/zoom, so the morph geometry doesn't shift as the view changes. */
  domain?: [number, number];
  samples?: number;
  color?: string;
  strokeWidth?: number;
}

/** Interpolates every sampled point of y=f(x) toward its (x,y)->(y,x) reflection, tracing a live morph into f's mirror image across y=x. */
export function ReflectionMorph({
  expression,
  scope,
  t,
  domain = [-6, 6],
  samples = 300,
  color = "var(--color-chart-2)",
  strokeWidth = 2.5,
}: ReflectionMorphProps) {
  const { xScale, yScale, viewport } = useGraphContext();

  const path = useMemo(() => {
    let fn;
    try {
      fn = compileFunction(expression);
    } catch {
      return null;
    }

    const [start, end] = domain;
    const step = (end - start) / (samples - 1);
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < samples; i++) {
      const px = start + i * step;
      let py: number;
      try {
        py = fn.evaluate(px, scope);
      } catch {
        py = NaN;
      }
      if (!Number.isFinite(py)) continue;
      const ix = px + (py - px) * t;
      const iy = py + (px - py) * t;
      points.push({ x: ix, y: iy });
    }

    const generator = d3Line<{ x: number; y: number }>()
      .curve(curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    return generator(points);
  }, [expression, scope, t, domain, samples, xScale, yScale]);

  if (!path || viewport.width === 0) return null;

  return (
    <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  );
}
