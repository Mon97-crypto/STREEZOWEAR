"use client";

import { useEffect, useState } from "react";

/**
 * Headline that types in line by line, holds, deletes, and repeats.
 * The full text is always in the DOM for screen readers and SEO; the typed copy is decorative.
 * An invisible copy reserves the final size so nothing below jumps while it types.
 * Reduced motion: shows the full headline, static.
 */
export function TypedHeadline({ lines, className = "" }: { lines: string[]; className?: string }) {
  const full = lines.join("\n");
  const [n, setN] = useState(full.length);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    let i = 0;
    let dir: 1 | -1 = 1;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += dir;
      setN(i);
      let wait = dir === 1 ? 70 + Math.random() * 50 : 28;
      if (dir === 1 && full[i - 1] === "\n") wait = 260;
      if (dir === 1 && i >= full.length) { dir = -1; wait = 3600; }
      else if (dir === -1 && i <= 0) { dir = 1; wait = 700; }
      t = setTimeout(tick, wait);
    };
    setN(0);
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, [full]);

  const shown = full.slice(0, n).split("\n");

  return (
    <h1 className={`relative ${className}`}>
      <span className="sr-only">{lines.join(" ")}</span>
      {/* reserves the final size */}
      <span aria-hidden className="invisible block">
        {lines.map((l, k) => <span key={k} className="block">{l}</span>)}
      </span>
      <span aria-hidden className="absolute inset-0 block">
        {lines.map((l, k) => {
          const s = shown[k];
          const isLast = animate && (k === shown.length - 1);
          return (
            <span key={k} className="block whitespace-pre">
              {s ?? ""}
              {isLast && <span className="sw-caret sw-hero-caret">|</span>}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
