"use client";

import { useEffect, useRef } from "react";
import { mandelbrotEscape, juliaEscape, type Complex } from "@/math-engine/fractal";

export interface FractalCanvasProps {
  kind: "mandelbrot" | "julia";
  juliaC?: Complex;
  center: Complex;
  /** Width of the visible view, in complex-plane units. */
  scale: number;
  maxIterations: number;
  size?: number;
  onPick?: (c: Complex) => void;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  const hh = h * 6;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Renders escape-time iteration as a raster image via ImageData — an SVG element per pixel would be wildly impractical at this density, so this deliberately sits outside the SVG-based graph-engine. */
export function FractalCanvas({ kind, juliaC, center, scale, maxIterations, size = 380, onPick }: FractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    const c = juliaC ?? { re: -0.4, im: 0.6 };

    for (let py = 0; py < size; py++) {
      const im = center.im + (0.5 - py / size) * scale;
      for (let px = 0; px < size; px++) {
        const re = center.re + (px / size - 0.5) * scale;
        const escape =
          kind === "mandelbrot"
            ? mandelbrotEscape({ re, im }, maxIterations)
            : juliaEscape({ re, im }, c, maxIterations);

        const idx = (py * size + px) * 4;
        if (escape >= maxIterations) {
          data[idx] = 8;
          data[idx + 1] = 8;
          data[idx + 2] = 14;
        } else {
          const t = escape / maxIterations;
          const [r, g, b] = hslToRgb(0.55 + t * 0.45, 0.65, 0.15 + t * 0.45);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    // Depend on juliaC's fields, not the object itself — recomputing this loop is expensive
    // enough that a fresh-object-same-values render shouldn't trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, juliaC?.re, juliaC?.im, center.re, center.im, scale, maxIterations, size]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPick) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    onPick({ re: center.re + (px - 0.5) * scale, im: center.im + (0.5 - py) * scale });
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ width: size, height: size, cursor: onPick ? "crosshair" : "default" }}
      className="rounded-md"
    />
  );
}
