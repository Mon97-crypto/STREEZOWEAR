"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CloseIcon } from "@/components/ui/Icons";
import type { Media, Video } from "@/lib/catalog/types";

type Slide = { type: "image"; media: Media } | { type: "video"; video: Video };

export function ProductGallery({ name, images, video }: { name: string; images: Media[]; video: Video | null }) {
  const slides: Slide[] = [...images.map((m) => ({ type: "image" as const, media: m })), ...(video ? [{ type: "video" as const, video }] : [])];
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);
  const cur = slides[i]!;

  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 self-start lg:sticky lg:top-24 lg:flex-row">
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:pb-0" role="tablist" aria-label={`${name} views`}>
        {slides.map((s, k) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === i}
            aria-label={s.type === "video" ? "Film" : s.media.alt}
            onClick={() => setI(k)}
            className={`relative aspect-square w-16 shrink-0 overflow-hidden border bg-carbon lg:w-full ${k === i ? "border-neon" : "border-gunmetal hover:border-steel"}`}
          >
            {s.type === "image" ? (
              <Image src={s.media.src} alt="" width={s.media.width} height={s.media.height} sizes="80px" className={`h-full w-full ${s.media.kind === "cutout" ? "object-contain p-1" : "object-cover"}`} />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.video.poster} alt="" className="h-full w-full object-cover" />
                <span className="label absolute inset-0 grid place-items-center bg-void/50 text-[0.6rem] text-chrome">Film</span>
              </>
            )}
          </button>
        ))}
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden bg-carbon">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {cur.type === "image" ? (
              <button
                type="button"
                className="block aspect-square w-full cursor-zoom-in overflow-hidden"
                aria-label={`Zoom: ${cur.media.alt}`}
                onClick={() => setFull(true)}
                onPointerMove={(e) => {
                  if (e.pointerType !== "mouse") return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onPointerLeave={() => setZoom(null)}
              >
                <Image
                  src={cur.media.src}
                  alt={cur.media.alt}
                  width={cur.media.width}
                  height={cur.media.height}
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={`h-full w-full transition-transform duration-200 ${cur.media.kind === "cutout" ? (cur.media.width < 800 ? "object-contain p-[16%]" : "object-contain p-[8%]") : cur.media.kind === "image" && cur.media.width / cur.media.height > 1.2 ? "object-contain" : "object-cover"}`}
                  style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                />
              </button>
            ) : (
              <video className="aspect-square w-full object-cover" controls muted playsInline loop poster={cur.video.poster} preload="metadata">
                <source src={cur.video.mobile} type="video/mp4" media="(max-width: 900px)" />
                <source src={cur.video.desktop} type="video/mp4" />
              </video>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {full && cur.type === "image" && (
          <motion.div
            className="fixed inset-0 z-[70] overflow-auto bg-void"
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" onClick={() => setFull(false)} className="fixed right-4 top-4 z-10 grid h-12 w-12 place-items-center bg-void/80" aria-label="Close zoom" autoFocus>
              <CloseIcon className="h-6 w-6" />
            </button>
            <Image src={cur.media.src} alt={cur.media.alt} width={cur.media.width} height={cur.media.height} sizes="200vw" className="h-auto w-[200vw] max-w-none sm:w-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
