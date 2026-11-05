"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/catalog/types";

/**
 * Muted, inline campaign film. Picks the mobile or desktop encode, plays only while on screen,
 * and falls back to the poster for reduced motion or data-saver.
 */
export function CampaignVideo({ video, className = "", priority = false }: { video: Video; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"poster" | "mobile" | "desktop">("poster");

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const saveData = !!conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
    if (reduce || saveData) return;
    setMode(matchMedia("(max-width: 900px)").matches ? "mobile" : "desktop");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || mode === "poster") return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (mode === "poster") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={video.poster} alt="" aria-hidden className={className} fetchPriority={priority ? "high" : "auto"} />;
  }
  return (
    <video ref={ref} className={className} muted loop playsInline preload={priority ? "auto" : "metadata"} poster={video.poster} aria-hidden>
      {mode === "mobile" && video.mobileWebm && <source src={video.mobileWebm} type="video/webm" />}
      <source src={mode === "mobile" ? video.mobile : video.desktop} type="video/mp4" />
    </video>
  );
}
