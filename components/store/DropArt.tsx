import Image from "next/image";
import type { Media } from "@/lib/catalog/types";

/** Drop hero without a film: the collection's artwork as vertical panels (rows on phones). */
export function DropArt({ stills, className = "", priority = false }: { stills: Media[]; className?: string; priority?: boolean }) {
  return (
    <div aria-hidden className={`grid gap-px bg-void md:grid-cols-[repeat(var(--n),1fr)] ${className}`} style={{ ["--n" as string]: stills.length, gridTemplateRows: `repeat(${stills.length}, 1fr)` }}>
      {stills.map((m, i) => (
        <div key={m.src} className="relative overflow-hidden md:row-span-full">
          <Image src={m.src} alt="" fill priority={priority && i < 2} sizes="(max-width: 768px) 100vw, 20vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
