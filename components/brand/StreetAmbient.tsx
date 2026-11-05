"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The street after dark, behind every page: small red neon details at the edges.
 * Typed signage, blinking indicators, a live Bangalore clock, coordinates, glyphs, slow scan lines.
 * Fixed, behind content, pointer-events none, low opacity — atmosphere, never noise.
 * Reduced motion: everything static.
 */

const PHRASES = [
  "NEW DROP. LIMITED RUN.",
  "DON'T SLEEP.",
  "OWN YOUR STREET.",
  "RUGGED BOYZ — DROP 01",
  "60 MIN · DOMMASANDRA",
  "WEAR IT LOUD.",
  "STAY LOCKED IN.",
  "BLR · 12.88°N 77.74°E",
  "NO RESTOCK.",
];

type Slot = { top: string; left?: string; right?: string; kind: "type" | "blink" | "glyph" | "clock" | "code" | "vert"; offset?: number; glyph?: keyof typeof GLYPHS };

const SLOTS: Slot[] = [
  { top: "14%", left: "2.5%", kind: "type", offset: 0 },
  { top: "22%", right: "2.5%", kind: "blink" },
  { top: "34%", left: "1%", kind: "glyph", glyph: "bolt" },
  { top: "46%", right: "2%", kind: "type", offset: 3 },
  { top: "58%", left: "2.5%", kind: "code" },
  { top: "68%", right: "1%", kind: "glyph", glyph: "cross" },
  { top: "78%", left: "2%", kind: "type", offset: 6 },
  { top: "86%", right: "2.5%", kind: "clock" },
  { top: "40%", right: "0.6%", kind: "vert" },
  { top: "28%", left: "8%", kind: "glyph", glyph: "arrow" },
  { top: "72%", left: "9%", kind: "glyph", glyph: "barcode" },
  { top: "52%", right: "8%", kind: "glyph", glyph: "hazard" },
];

const GLYPHS = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  cross: <><circle cx="12" cy="12" r="6" /><path d="M12 2v6M12 16v6M2 12h6M16 12h6" /></>,
  arrow: <path d="M3 12h16m-6-6 6 6-6 6" />,
  barcode: <path d="M3 5v14M6 5v14M8 5v14M11 5v14M14 5v14M15.5 5v14M18 5v14M21 5v14" />,
  hazard: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17v.5" /></>,
} as const;

function useTyper(offset: number, enabled: boolean) {
  const [text, setText] = useState(PHRASES[offset % PHRASES.length]!);
  useEffect(() => {
    if (!enabled) return;
    let i = offset % PHRASES.length;
    let n = 0;
    let dir: 1 | -1 = 1;
    let hold = 0;
    const t = setInterval(() => {
      const p = PHRASES[i]!;
      if (hold > 0) return void hold--;
      n += dir;
      if (n >= p.length) { dir = -1; hold = 28; }
      if (n <= 0) { dir = 1; i = (i + 1) % PHRASES.length; hold = 6; }
      setText(PHRASES[i]!.slice(0, Math.max(0, n)));
    }, 70 + (offset % 3) * 15);
    return () => clearInterval(t);
  }, [offset, enabled]);
  return text;
}

function Typer({ offset, animate }: { offset: number; animate: boolean }) {
  const text = useTyper(offset, animate);
  return (
    <span className="whitespace-nowrap">
      {text}
      <span className={animate ? "sw-caret" : ""}>▌</span>
    </span>
  );
}

function Clock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" }));
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">BLR {t ?? "--:--:--"} IST</span>;
}

export function StreetAmbient() {
  const reduce = useReducedMotion();
  const path = usePathname();
  const quiet = path.startsWith("/checkout"); // keep checkout distraction-free
  const animate = !reduce;
  if (quiet) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* night haze */}
      <div className="sw-breathe absolute -left-[20%] top-[55%] h-[70vh] w-[60vw] rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side, rgb(255 30 60 / .07), transparent)" }} />
      <div className="sw-breathe absolute -right-[15%] -top-[10%] h-[60vh] w-[50vw] rounded-full blur-3xl [animation-delay:-4s]" style={{ background: "radial-gradient(closest-side, rgb(160 21 41 / .09), transparent)" }} />
      {/* faint street grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(to right, #3B3E45 1px, transparent 1px), linear-gradient(to bottom, #3B3E45 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage: "radial-gradient(ellipse at center, transparent 35%, #000 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 35%, #000 100%)",
        }}
      />
      {/* rain / light streaks */}
      {animate && [12, 31, 57, 74, 90].map((l, i) => (
        <span key={l} className="sw-streak absolute top-0 h-24 w-px" style={{ left: `${l}%`, animationDelay: `${-i * 1.7}s`, animationDuration: `${5 + (i % 3)}s`, background: "linear-gradient(to bottom, transparent, rgb(255 30 60 / .35), transparent)" }} />
      ))}
      {/* scan line */}
      {animate && <div className="sw-scan absolute inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgb(255 30 60 / .25), transparent)" }} />}

      {SLOTS.map((s, i) => (
        <div
          key={i}
          className={`label absolute text-[0.62rem] text-neon/40 ${s.kind === "glyph" ? "" : s.kind === "blink" ? "hidden md:block" : "hidden xl:block"}`}
          style={{ top: s.top, left: s.left, right: s.right, textShadow: "0 0 8px rgb(255 30 60 / .35)" }}
        >
          {s.kind === "type" && <Typer offset={s.offset ?? 0} animate={animate} />}
          {s.kind === "blink" && (
            <span className="flex items-center gap-2">
              <span className={`inline-block h-1.5 w-1.5 rounded-full bg-neon ${animate ? "sw-blink" : ""}`} /> REC · LIVE
            </span>
          )}
          {s.kind === "clock" && <Clock />}
          {s.kind === "code" && <span className={animate ? "sw-flicker" : ""}>SZW—001 / 250GSM</span>}
          {s.kind === "vert" && (
            <span className={`block text-[0.58rem] [writing-mode:vertical-rl] ${animate ? "sw-flicker" : ""}`}>STREEZØWEAR · BANGALORE · EST. 2026</span>
          )}
          {s.kind === "glyph" && s.glyph && (
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${animate ? (i % 2 ? "sw-blink" : "sw-flicker") : ""}`} fill="none" stroke="currentColor" strokeWidth={1.4} style={{ animationDelay: `${-i * 0.9}s` }}>
              {GLYPHS[s.glyph]}
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
