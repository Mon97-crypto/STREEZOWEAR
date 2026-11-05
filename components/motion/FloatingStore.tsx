"use client";

import Image from "next/image";
import Link from "next/link";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart/store";
import type { Media, Product } from "@/lib/catalog/types";
import { formatINR } from "@/lib/pricing/format";

/**
 * The floating store. Garments hang in the void on a slow 3D orbit, overlapping like a rack.
 * Drag or swipe to spin, arrows/keys to step, click a piece to bring it forward.
 * The front piece catches the red light. Reduced motion: no auto-spin, step with the arrows.
 */

const TAU = Math.PI * 2;
const AUTO_SPEED = TAU / 48000; // one revolution per 48 s
const MIN_ITEMS = 6;

type Item = { key: string; product: Product; productIndex: number };

function mediaOf(p: Product): Media {
  return p.cutout ?? p.images[0]!;
}

export function FloatingStore({ products, kicker }: { products: Product[]; kicker: string }) {
  const reduce = useReducedMotion();
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    let k = 0;
    while (out.length < Math.max(MIN_ITEMS, products.length)) {
      products.forEach((product, productIndex) => out.push({ key: `${product.slug}-${k++}`, product, productIndex }));
    }
    return out.slice(0, Math.max(MIN_ITEMS, products.length));
  }, [products]);
  const N = items.length;
  const step = TAU / N;

  const stageRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1200);
  const rot = useMotionValue(0);
  const vel = useRef(0);
  const hovering = useRef(false);
  const drag = useRef<{ x: number; t: number; moved: number } | null>(null);
  const suppressClick = useRef(false);
  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focus, setFocus] = useState<number | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // which item is at the front
  useEffect(
    () =>
      rot.on("change", (r) => {
        const i = (((Math.round(-r / step) % N) + N) % N) as number;
        setFront((f) => (f === i ? f : i));
      }),
    [rot, step, N],
  );

  useAnimationFrame((_, dt) => {
    if (focus !== null || drag.current) return;
    const d = Math.min(dt, 48);
    if (Math.abs(vel.current) > 0.00001) {
      rot.set(rot.get() + vel.current * d);
      vel.current *= Math.pow(0.94, d / 16);
    } else if (!reduce && !hovering.current) {
      rot.set(rot.get() - AUTO_SPEED * d);
    }
  });

  const radius = w < 640 ? w * 0.34 : Math.min(w * 0.3, 460);
  const itemW = w < 640 ? Math.min(w * 0.58, 300) : Math.min(w * 0.27, 400);

  const stepBy = useCallback(
    (dir: 1 | -1) => {
      vel.current = 0;
      const target = Math.round(rot.get() / step) * step + dir * step;
      animate(rot, target, { type: "spring", stiffness: 70, damping: 18 });
    },
    [rot, step],
  );

  // pointer drag (window listeners so clicks on items still work)
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const now = performance.now();
      const dx = e.clientX - d.x;
      d.moved += Math.abs(dx);
      const dr = dx / (radius * 1.15);
      rot.set(rot.get() + dr);
      vel.current = dr / Math.max(now - d.t, 1);
      d.x = e.clientX;
      d.t = now;
    };
    const up = () => {
      if (drag.current && drag.current.moved > 6) suppressClick.current = true;
      drag.current = null;
      setTimeout(() => (suppressClick.current = false), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [radius, rot]);

  useEffect(() => {
    if (focus === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocus(null);
      if (e.key === "ArrowRight") setFocus((f) => (f === null ? f : (f + 1) % products.length));
      if (e.key === "ArrowLeft") setFocus((f) => (f === null ? f : (f - 1 + products.length) % products.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, products.length]);

  const frontProduct = items[front]!.product;
  const frontIdx = items[front]!.productIndex;

  return (
    <div className="relative">
      <div
        ref={stageRef}
        className="relative h-[500px] w-full select-none overflow-hidden sm:h-[min(78svh,760px)] sm:min-h-[520px]"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          if (focus !== null || e.button !== 0) return;
          vel.current = 0;
          drag.current = { x: e.clientX, t: performance.now(), moved: 0 };
        }}
        onKeyDown={(e) => {
          if (focus !== null) return;
          if (e.key === "ArrowRight") stepBy(-1);
          if (e.key === "ArrowLeft") stepBy(1);
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Floating store — drag to spin, select a piece to open it"
      >
        {/* giant outline type behind the rack */}
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={focus === null ? "ring" : products[focus]!.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="display whitespace-nowrap text-center text-[clamp(5rem,17vw,17rem)] leading-[0.85] text-transparent"
              style={{ WebkitTextStroke: "1px rgb(255 30 60 / .22)" }}
            >
              {focus === null ? (<>Neon<br />on night</>) : products[focus]!.name}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* floor glow */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[10%] bottom-[8%] h-24 rounded-[50%] blur-3xl" style={{ background: "radial-gradient(closest-side, rgb(255 30 60 / .16), transparent)" }} />

        {/* the orbit */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: focus === null ? 1 : 0, scale: focus === null ? 1 : 0.9, filter: focus === null ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: focus === null ? "auto" : "none" }}
          aria-hidden={focus !== null}
        >
          {items.map((it, i) => (
            <OrbitItem
              key={it.key}
              item={it}
              baseAngle={i * step}
              rot={rot}
              radius={radius}
              width={itemW}
              lit={hovered ? hovered === it.key : i === front}
              phase={i * 1.3}
              onHover={(on) => {
                hovering.current = on;
                setHovered(on ? it.key : null);
              }}
              onOpen={() => {
                if (suppressClick.current) return;
                setFocus(it.productIndex);
              }}
            />
          ))}
        </motion.div>

        {/* focused piece */}
        <AnimatePresence>
          {focus !== null && <FocusView key="focus" products={products} index={focus} onIndex={setFocus} onClose={() => setFocus(null)} kicker={kicker} />}
        </AnimatePresence>
      </div>

      {/* rail under the stage */}
      <div className={`mt-2 flex items-center justify-between gap-4 border-t border-gunmetal pt-4 transition-opacity duration-300 ${focus === null ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="min-w-0">
          <p className="label text-[0.65rem] text-steel">
            {String(frontIdx + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
          </p>
          <p className="display truncate text-lg" aria-live="polite">
            {frontProduct.name} <span className="label ml-2 text-[0.7rem] text-neon">{formatINR(frontProduct.salePricePaise ?? frontProduct.pricePaise)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2" aria-hidden>
          {products.map((p, k) => (
            <span key={p.slug} className={`h-1.5 transition-all duration-300 ${k === frontIdx ? "w-6 bg-neon shadow-[0_0_8px_var(--sw-neon-glow)]" : "w-1.5 bg-gunmetal"}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="label hidden text-[0.6rem] text-steel md:inline">Drag to spin · tap to open</span>
          <button type="button" onClick={() => stepBy(1)} aria-label="Previous piece" className="grid h-11 w-11 place-items-center border border-gunmetal hover:border-neon hover:text-neon">←</button>
          <button type="button" onClick={() => stepBy(-1)} aria-label="Next piece" className="grid h-11 w-11 place-items-center border border-gunmetal hover:border-neon hover:text-neon">→</button>
        </div>
      </div>
    </div>
  );
}

function OrbitItem({
  item,
  baseAngle,
  rot,
  radius,
  width,
  lit,
  phase,
  onHover,
  onOpen,
}: {
  item: Item;
  baseAngle: number;
  rot: MotionValue<number>;
  radius: number;
  width: number;
  lit: boolean;
  phase: number;
  onHover: (on: boolean) => void;
  onOpen: () => void;
}) {
  const depth = useTransform(rot, (r) => (Math.cos(r + baseAngle) + 1) / 2); // 1 = front
  const x = useTransform(rot, (r) => Math.sin(r + baseAngle) * radius);
  const y = useTransform(depth, (d) => (1 - d) * -46);
  const scale = useTransform(depth, (d) => 0.52 + d * 0.56);
  const zIndex = useTransform(depth, (d) => Math.round(d * 100));
  const opacity = useTransform(depth, (d) => 0.28 + d * 0.72);
  const filter = useTransform(depth, (d) => `blur(${((1 - d) * 3.2).toFixed(2)}px) brightness(${(0.45 + d * 0.55).toFixed(2)})`);
  const rotateY = useTransform(rot, (r) => Math.sin(r + baseAngle) * -18);
  const media = mediaOf(item.product);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ x, y, scale, zIndex, opacity, filter, width, marginLeft: -width / 2, marginTop: -width * 0.55, rotateY, transformPerspective: 1200 }}
    >
      <div className="sw-float" style={{ animationDelay: `${-phase}s` }}>
        <button
          type="button"
          onClick={onOpen}
          onPointerEnter={(e) => e.pointerType === "mouse" && onHover(true)}
          onPointerLeave={() => onHover(false)}
          onFocus={() => onHover(true)}
          onBlur={() => onHover(false)}
          aria-label={`Open ${item.product.name}, ${formatINR(item.product.salePricePaise ?? item.product.pricePaise)}`}
          className="block w-full cursor-grab outline-none active:cursor-grabbing"
        >
          <LitGarment media={media} lit={lit} sizes="(max-width: 640px) 60vw, 28vw" />
        </button>
      </div>
    </motion.div>
  );
}

/** Garment image with the brand's red light falling on the fabric (masked to its silhouette). */
export function LitGarment({ media, lit, sizes, priority }: { media: Media; lit: boolean; sizes: string; priority?: boolean }) {
  const isCutout = media.kind === "cutout";
  const mask = isCutout ? `url(${media.src})` : "radial-gradient(58% 58% at 50% 50%, #000 58%, transparent 100%)";
  return (
    <div
      className="relative transition-[filter] duration-700"
      style={{
        filter:
          isCutout && lit
            ? "drop-shadow(0 0 1px rgb(255 30 60 / .75)) drop-shadow(0 0 24px rgb(255 30 60 / .3)) drop-shadow(0 40px 30px rgb(0 0 0 / .75))"
            : isCutout
              ? "drop-shadow(0 34px 28px rgb(0 0 0 / .7))"
              : "none",
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
        className="pointer-events-none h-auto w-full"
        style={isCutout ? undefined : { WebkitMaskImage: mask, maskImage: mask }}
      />
      <div
        aria-hidden
        className="sw-light pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-700"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          opacity: lit ? (isCutout ? 1 : 0.55) : 0,
        }}
      />
    </div>
  );
}

function FocusView({ products, index, onIndex, onClose, kicker }: { products: Product[]; index: number; onIndex: (i: number) => void; onClose: () => void; kicker: string }) {
  const p = products[index]!;
  const [size, setSize] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const add = useCart((s) => s.add);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  useEffect(() => {
    setSize(null);
    setMsg(null);
  }, [index]);

  const go = (d: number) => onIndex((index + d + products.length) % products.length);

  return (
    <motion.div
      className="absolute inset-0 z-[200] grid items-center gap-6 px-1 md:grid-cols-[1.15fr_1fr]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-label={p.name}
    >
      <div className="relative mx-auto w-[min(70%,46svh,420px)] md:w-[min(88%,62svh,540px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, scale: 0.82, x: -40, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 40 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          >
            <div className="sw-float">
              <LitGarment media={mediaOf(p)} lit sizes="(max-width: 768px) 78vw, 40vw" priority />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        key={`panel-${p.slug}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="relative z-10 max-md:-mt-4 max-md:bg-void/80 max-md:p-4 max-md:backdrop-blur"
      >
        <p className="label text-[0.65rem] text-neon">{kicker} · {String(index + 1).padStart(2, "0")}/{String(products.length).padStart(2, "0")}</p>
        <h3 className="display mt-3 text-[clamp(2.25rem,5vw,4.5rem)]">{p.name}</h3>
        <p className="mt-2 max-w-sm text-steel max-md:hidden">{p.short}</p>
        <p className="label mt-4 text-base tracking-[0.12em] text-neon">{formatINR(p.salePricePaise ?? p.pricePaise)}</p>

        <div className="mt-5 flex items-center gap-3">
          {p.colours.map((c) => (
            <span key={c.name} className="flex items-center gap-2 text-xs text-steel">
              <span className="h-4 w-4 rounded-full border border-neon" style={{ background: c.hex }} />{c.name}
            </span>
          ))}
        </div>

        <div className="mt-5 flex gap-2" role="group" aria-label="Size">
          {p.sizes.map((s) => {
            const v = p.variants.find((x) => x.size === s);
            const out = !v || v.stock === 0;
            return (
              <button key={s} type="button" disabled={out} aria-pressed={size === s} onClick={() => setSize(s)} className={`label h-11 w-12 border text-xs ${size === s ? "border-neon bg-neon text-void" : out ? "border-gunmetal text-gunmetal line-through" : "border-gunmetal hover:border-chrome"}`}>
                {s}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const v = size ? p.variants.find((x) => x.size === size) : null;
              if (!v) return setMsg("Pick a size first.");
              const r = add({ slug: p.slug, sku: v.sku, size: v.size, colour: v.colour, qty: 1 });
              setMsg(r.added ? null : "That size is sold out in your bag.");
            }}
          >
            Add to bag
          </button>
          <Link href={`/products/${p.slug}`} className="btn btn-ghost">View product</Link>
        </div>
        <p className="mt-2 min-h-5 text-sm text-neon" role="status">{msg}</p>

        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous piece" className="grid h-11 w-11 place-items-center border border-gunmetal hover:border-neon hover:text-neon">←</button>
          <button type="button" onClick={() => go(1)} aria-label="Next piece" className="grid h-11 w-11 place-items-center border border-gunmetal hover:border-neon hover:text-neon">→</button>
          <button ref={closeRef} type="button" onClick={onClose} className="label ml-2 h-11 px-3 text-[0.65rem] text-steel hover:text-chrome">
            ✕ Back to the rack
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
