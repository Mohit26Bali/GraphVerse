"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSweepOptions {
  min?: number;
  /** Defaults to unbounded (matches "just keep rotating forever"). */
  max?: number;
  /** Units per second. */
  speed?: number;
  /** When max is finite, wrap back to min instead of stopping there. */
  loop?: boolean;
}

/**
 * Continuously sweeps a value forward via requestAnimationFrame while playing — either
 * unbounded (e.g. an angle that just keeps spinning) or looping within [min, max] (e.g. a
 * parametric curve's t re-tracing itself). Unbounded, non-looping motion like this doesn't
 * fit the tween-between-two-states model animation-engine's GSAP hook is built for.
 */
export function useSweep({ min = 0, max = Infinity, speed = 1, loop = true }: UseSweepOptions = {}) {
  const [value, setValue] = useState(min);
  const [isPlaying, setIsPlaying] = useState(false);
  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const tick = (t: number) => {
      if (lastRef.current != null) {
        const dt = (t - lastRef.current) / 1000;
        setValue((prev) => {
          let next = prev + speed * dt;
          if (Number.isFinite(max)) {
            const span = max - min;
            if (loop && span > 0) {
              next = min + (((next - min) % span) + span) % span;
            } else if (next > max) {
              next = max;
            }
          }
          return next;
        });
      }
      lastRef.current = t;
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      lastRef.current = null;
    };
  }, [isPlaying, speed, min, max, loop]);

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const setManually = useCallback((next: number) => {
    setIsPlaying(false);
    setValue(next);
  }, []);

  return { value, isPlaying, toggle, setValue: setManually };
}
