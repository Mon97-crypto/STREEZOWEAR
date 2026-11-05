"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Media } from "@/lib/catalog/types";

type Props = {
  media: Media;
  /** delay offset so neighbouring pieces don't bob in sync */
  phase?: number;
  sizes?: string;
  priority?: boolean;
  /** externally forced highlight (e.g. parent card focused) */
  active?: boolean;
  className?: string;
};

const TILT = 8; // degrees — enough to feel 3D, never enough to distort the print

/**
 * A garment floating in the void. Mouse: spring-smoothed tilt + red light that follows the cursor,
 * masked to the garment's own silhouette so it falls on the fabric. Touch: the piece lights up as
 * it scrolls into the middle of the screen. Reduced motion: static, lit on hover/focus only.
 */
export function FloatingGarment({ media, phase = 0, sizes = "(max-width: 640px) 90vw, 33vw", priority, active, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(false);
  const [coarse, setCoarse] = useState(false);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.3);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const rotateY = useTransform(sx, [0, 1], [-TILT, TILT]);
  const rotateX = useTransform(sy, [0, 1], [TILT, -TILT]);
  const lx = useTransform(sx, (v) => `${v * 100}%`);
  const ly = useTransform(sy, (v) => `${Math.max(5, v * 100 - 15)}%`);
  const light = useMotionTemplate`radial-gradient(42% 36% at ${lx} ${ly}, rgb(255 30 60 / .42), rgb(255 30 60 / .08) 55%, transparent 75%)`;

  useEffect(() => {
    const mq = matchMedia("(hover: none)");
    setCoarse(mq.matches);
    if (!mq.matches || !ref.current) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: "-35% 0px -35% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // touch devices: slow ambient drift of the light instead of cursor tracking
  useEffect(() => {
    if (!coarse || reduce || !inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = (t - t0) / 2400;
      px.set(0.5 + Math.sin(k) * 0.25);
      py.set(0.32 + Math.cos(k * 0.8) * 0.12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [coarse, reduce, inView, px, py]);

  const lit = hover || inView || !!active;
  const isCutout = media.kind === "cutout";
  const mask = isCutout ? `url(${media.src})` : "radial-gradient(60% 60% at 50% 50%, #000 60%, transparent 100%)";

  return (
    <div
      ref={ref}
      className={`relative grid aspect-[4/5] place-items-center overflow-hidden ${className}`}
      style={{ background: "radial-gradient(60% 50% at 50% 42%, #15151b 0%, var(--sw-void) 72%)", perspective: 1200 }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        px.set(0.5);
        py.set(0.3);
      }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
    >
      {/* ambient haze */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ background: "radial-gradient(45% 38% at 50% 40%, var(--sw-neon-haze), transparent 75%)", opacity: lit ? 1 : 0 }}
      />
      {/* floor shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[9%] left-[18%] right-[18%] h-[7%] rounded-[50%] blur-md transition-all duration-700"
        style={{ background: "radial-gradient(closest-side, rgb(0 0 0 / .85), transparent)", transform: lit ? "scale(.82)" : "none", opacity: lit ? 0.6 : 1 }}
      />
      <div className="sw-float relative z-[1] w-[84%]" style={{ animationDelay: `${-phase}s` }}>
        <motion.div
          className="relative"
          style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY }}
          animate={{ y: lit && !reduce ? -8 : 0, scale: lit && !reduce ? 1.03 : 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <div
            className="relative transition-[filter] duration-700"
            style={{
              filter: !isCutout
                ? "none"
                : lit
                  ? "drop-shadow(0 0 1px rgb(255 30 60 / .7)) drop-shadow(0 0 22px rgb(255 30 60 / .28)) drop-shadow(0 40px 34px rgb(0 0 0 / .7))"
                  : "drop-shadow(0 30px 30px rgb(0 0 0 / .6))",
            }}
          >
            <Image
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
              sizes={sizes}
              priority={priority}
              draggable={false}
              className="h-auto w-full select-none"
              style={isCutout ? undefined : { WebkitMaskImage: mask, maskImage: mask }}
            />
            {/* the red light, falling on the fabric only */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-700"
              style={{
                backgroundImage: light,
                WebkitMaskImage: mask,
                maskImage: mask,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                opacity: lit ? (isCutout ? 1 : 0.55) : 0,
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
