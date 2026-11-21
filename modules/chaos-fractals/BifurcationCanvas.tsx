"use client";

import { useEffect, useRef } from "react";

export interface BifurcationCanvasProps {
  rDomain?: [number, number];
  width?: number;
  height?: number;
  highlightR?: number;
}

/** Renders the logistic map's bifurcation diagram as a dense scatter — thousands of dots, so canvas rather than individual SVG elements. */
export function BifurcationCanvas({ rDomain = [2.4, 4], width = 560, height = 280, highlightR }: BifurcationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#101215";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(140,170,255,0.55)";

    const [rMin, rMax] = rDomain;
    const transient = 200;
    const settle = 80;

    for (let px = 0; px < width; px++) {
      const r = rMin + (px / width) * (rMax - rMin);
      let x = 0.5;
      for (let i = 0; i < transient; i++) x = r * x * (1 - x);
      for (let i = 0; i < settle; i++) {
        x = r * x * (1 - x);
        const py = height - x * height;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    if (highlightR !== undefined) {
      const px = ((highlightR - rMin) / (rMax - rMin)) * width;
      // Canvas can't resolve CSS custom properties, so this is a literal color, not var(--color-chart-4).
      ctx.strokeStyle = "#ffd23f";
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
  }, [rDomain, width, height, highlightR]);

  return <canvas ref={canvasRef} style={{ width, height }} className="rounded-md" />;
}
