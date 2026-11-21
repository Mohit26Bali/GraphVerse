"use client";

import { useEffect, useRef } from "react";
import { sampleGrid, type Point2D } from "@/math-engine/multivariable";

export interface ContourArrow {
  dfdx: number;
  dfdy: number;
  color: string;
}

export interface ContourCanvasProps {
  expression: string;
  /** Square domain, shared by both x and y. */
  domain: [number, number];
  resolution?: number;
  size?: number;
  probePoint?: Point2D | null;
  /** Directions to draw as arrows from the probe point (not scaled to true magnitude — units vary too wildly across functions to size a fixed-pixel arrow sensibly). */
  arrows?: ContourArrow[];
  /** A sequence of points to draw as a connected trail (e.g. a gradient-descent walk). */
  path?: Point2D[];
  onPick?: (point: Point2D) => void;
}

const BANDS = 10;

function bandColor(t: number): [number, number, number] {
  // Posterizing into bands before mapping to color is what gives the "contour lines" look —
  // each band edge reads as a topographic line, without tracing actual iso-value curves.
  const banded = Math.floor(Math.min(Math.max(t, 0), 1) * BANDS) / BANDS;
  const hue = 240 - 240 * banded; // blue (low) -> red (high)
  const s = 0.65;
  const l = 0.3 + banded * 0.35;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else [r, g, b] = [x, 0, c];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Renders f(x,y) as a banded heatmap ("contour map") via ImageData — same rationale as FractalCanvas: an SVG element per grid cell would be impractical, so this sits outside the SVG-based graph-engine. */
export function ContourCanvas({
  expression,
  domain,
  resolution = 120,
  size = 380,
  probePoint,
  arrows,
  path,
  onPick,
}: ContourCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [d0, d1] = domain;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let grid: number[][];
    try {
      grid = sampleGrid(expression, domain, domain, resolution);
    } catch {
      ctx.fillStyle = "#101215";
      ctx.fillRect(0, 0, size, size);
      return;
    }

    const finite = grid.flat().filter(Number.isFinite);
    const min = finite.length > 0 ? Math.min(...finite) : 0;
    const max = finite.length > 0 ? Math.max(...finite) : 1;
    const span = max - min || 1;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    const cell = size / resolution;

    for (let py = 0; py < size; py++) {
      // Grid row 0 is y = domain min, but canvas row 0 is the top — flip so y increases upward.
      const gj = resolution - 1 - Math.floor(py / cell);
      for (let px = 0; px < size; px++) {
        const gi = Math.floor(px / cell);
        const v = grid[gj]?.[gi];
        const idx = (py * size + px) * 4;
        if (v === undefined || !Number.isFinite(v)) {
          data[idx] = 8;
          data[idx + 1] = 8;
          data[idx + 2] = 14;
        } else {
          const [r, g, b] = bandColor((v - min) / span);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const toPx = (x: number) => ((x - d0) / (d1 - d0)) * size;
    const toPy = (y: number) => size - ((y - d0) / (d1 - d0)) * size;

    if (path && path.length > 1) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(toPx(path[0].x), toPy(path[0].y));
      for (const p of path.slice(1)) ctx.lineTo(toPx(p.x), toPy(p.y));
      ctx.stroke();
      ctx.globalAlpha = 1;
      const last = path[path.length - 1];
      ctx.beginPath();
      ctx.arc(toPx(last.x), toPy(last.y), 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    if (probePoint) {
      const cx = toPx(probePoint.x);
      const cy = toPy(probePoint.y);

      for (const arrow of arrows ?? []) {
        const mag = Math.hypot(arrow.dfdx, arrow.dfdy);
        if (mag <= 1e-9) continue;
        const len = 42;
        const dx = (arrow.dfdx / mag) * len;
        const dy = (arrow.dfdy / mag) * len;
        const ex = cx + dx;
        const ey = cy - dy; // flip: positive dfdy points toward increasing y = up on screen = smaller py
        ctx.strokeStyle = arrow.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        const angle = Math.atan2(ey - cy, ex - cx);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 10 * Math.cos(angle - Math.PI / 6), ey - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ex - 10 * Math.cos(angle + Math.PI / 6), ey - 10 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = arrow.color;
        ctx.fill();
      }

      if (!path || path.length === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, d0, d1, resolution, size, probePoint?.x, probePoint?.y, JSON.stringify(arrows), JSON.stringify(path)]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPick) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    onPick({ x: d0 + px * (d1 - d0), y: d0 + (1 - py) * (d1 - d0) });
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
