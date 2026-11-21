"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * The looping background video. Moving content that plays for more than a few seconds needs a
 * way to stop it, so there is a pause button, and visitors who ask their device for reduced
 * motion get the still poster instead of the video.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (paused) el.pause();
    else void el.play().catch(() => {});
  }, [paused, reduced]);

  if (reduced) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/vid-poster.jpg)" }}
      />
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        src="/vid.mp4"
        poster="/vid-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play background video" : "Pause background video"}
        className="absolute right-4 bottom-4 z-10 flex size-9 items-center justify-center rounded-sm border border-border bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
      >
        {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </>
  );
}
