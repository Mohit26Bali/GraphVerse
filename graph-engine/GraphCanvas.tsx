"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import { scaleLinear } from "d3-scale";
import { GraphContext } from "./GraphContext";
import type { Domain, Viewport } from "./types";
import { Grid } from "./Grid";
import { Axis } from "./Axis";

export interface DataPoint {
  x: number;
  y: number;
}

export interface GraphCanvasProps {
  children?: ReactNode;
  /** Initial data-space domain shown along x, before any zoom/pan. */
  initialXDomain?: Domain;
  /** Initial data-space domain shown along y, before any zoom/pan. */
  initialYDomain?: Domain;
  showGrid?: boolean;
  showAxes?: boolean;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  /** Fires with the data-space coordinate of a click that wasn't part of a pan/zoom drag. */
  onCanvasClick?: (point: DataPoint) => void;
  /** Fires as the pointer moves over the canvas; `null` on pointer leave. */
  onCanvasPointerMove?: (point: DataPoint | null) => void;
}

export function GraphCanvas({
  children,
  initialXDomain = [-10, 10],
  initialYDomain = [-10, 10],
  showGrid = true,
  showAxes = true,
  minZoom = 0.1,
  maxZoom = 40,
  className,
  onCanvasClick,
  onCanvasPointerMove,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setViewport({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseXScale = useMemo(
    () => scaleLinear().domain(initialXDomain).range([0, viewport.width || 1]),
    [initialXDomain, viewport.width],
  );
  const baseYScale = useMemo(
    () => scaleLinear().domain(initialYDomain).range([viewport.height || 1, 0]),
    [initialYDomain, viewport.height],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || viewport.width === 0 || viewport.height === 0) return;

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([minZoom, maxZoom])
      .on("zoom", (event) => setTransform(event.transform));

    select(svg).call(behavior);
    return () => {
      select(svg).on(".zoom", null);
    };
  }, [minZoom, maxZoom, viewport.width, viewport.height]);

  const xScale = useCallback(
    (x: number) => transform.applyX(baseXScale(x)),
    [transform, baseXScale],
  );
  const yScale = useCallback(
    (y: number) => transform.applyY(baseYScale(y)),
    [transform, baseYScale],
  );
  const xInvert = useCallback(
    (px: number) => baseXScale.invert(transform.invertX(px)),
    [transform, baseXScale],
  );
  const yInvert = useCallback(
    (py: number) => baseYScale.invert(transform.invertY(py)),
    [transform, baseYScale],
  );

  const xDomain = useMemo<Domain>(
    () => [xInvert(0), xInvert(viewport.width)],
    [xInvert, viewport.width],
  );
  const yDomain = useMemo<Domain>(
    () => [yInvert(viewport.height), yInvert(0)],
    [yInvert, viewport.height],
  );

  const contextValue = useMemo(
    () => ({ viewport, xScale, yScale, xInvert, yInvert, xDomain, yDomain }),
    [viewport, xScale, yScale, xInvert, yInvert, xDomain, yDomain],
  );

  const toDataPoint = useCallback(
    (clientX: number, clientY: number): DataPoint | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      return { x: xInvert(px), y: yInvert(py) };
    },
    [xInvert, yInvert],
  );

  const handlePointerDown = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    pointerDownPos.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleClick = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (!onCanvasClick) return;
      const down = pointerDownPos.current;
      const draggedFar =
        down &&
        Math.hypot(event.clientX - down.x, event.clientY - down.y) > 4;
      if (draggedFar) return;
      const point = toDataPoint(event.clientX, event.clientY);
      if (point) onCanvasClick(point);
    },
    [onCanvasClick, toDataPoint],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!onCanvasPointerMove) return;
      const point = toDataPoint(event.clientX, event.clientY);
      onCanvasPointerMove(point);
    },
    [onCanvasPointerMove, toDataPoint],
  );

  const handlePointerLeave = useCallback(() => {
    onCanvasPointerMove?.(null);
  }, [onCanvasPointerMove]);

  return (
    <div ref={containerRef} className={className ?? "relative h-full w-full"}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="touch-none select-none"
        role="img"
        aria-label="Interactive coordinate plane"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {viewport.width > 0 && viewport.height > 0 && (
          <GraphContext.Provider value={contextValue}>
            {showGrid && <Grid />}
            {showAxes && <Axis />}
            {children}
          </GraphContext.Provider>
        )}
      </svg>
      {(viewport.width === 0 || viewport.height === 0) && (
        <div className="absolute inset-0 animate-pulse bg-muted/30" aria-hidden="true" />
      )}
    </div>
  );
}
