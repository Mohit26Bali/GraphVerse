"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

export interface AnimateOptions {
  duration?: number;
  ease?: string;
}

export interface AnimationStep<T> {
  to: Partial<T>;
  options?: AnimateOptions;
}

/**
 * Tweens a record of numeric parameters over time with GSAP, decoupled from any
 * particular UI control. Sliders can call `setImmediate`; a scripted sequence
 * (e.g. a transformation walkthrough) can call `runSequence` instead — both
 * drive the same state.
 */
export function useAnimatedValues<T extends Record<string, number>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const proxy = useRef<T>({ ...initial });
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => () => {
    tween.current?.kill();
  }, []);

  const animateTo = useCallback((target: Partial<T>, options: AnimateOptions = {}) => {
    tween.current?.kill();
    return new Promise<void>((resolve) => {
      tween.current = gsap.to(proxy.current, {
        ...target,
        duration: options.duration ?? 0.8,
        ease: options.ease ?? "power2.inOut",
        onUpdate: () => setValues({ ...proxy.current }),
        onComplete: () => resolve(),
      });
    });
  }, []);

  const runSequence = useCallback(
    async (steps: Array<AnimationStep<T>>) => {
      for (const step of steps) {
        await animateTo(step.to, step.options);
      }
    },
    [animateTo],
  );

  const setImmediate = useCallback((next: Partial<T>) => {
    tween.current?.kill();
    proxy.current = { ...proxy.current, ...next };
    setValues({ ...proxy.current });
  }, []);

  const stop = useCallback(() => {
    tween.current?.kill();
  }, []);

  return { values, animateTo, runSequence, setImmediate, stop };
}
