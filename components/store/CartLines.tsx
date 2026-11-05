"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/catalog/data";
import { effectivePrice } from "@/lib/catalog/queries";
import { TEXT_ADDON_PAISE, TEXT_COLOURS, TEXT_PLACEMENTS } from "@/lib/customise/options";
import { formatINR } from "@/lib/pricing/format";
import { useCart } from "@/lib/cart/store";
import type { CartLine } from "@/lib/cart/logic";
import { MAX_PER_LINE } from "@/lib/cart/logic";

export function linePrice(l: CartLine): number {
  const p = products.find((x) => x.slug === l.slug);
  if (!p) return 0;
  return (effectivePrice(p) + (l.custom ? (TEXT_ADDON_PAISE ?? 0) : 0)) * l.qty;
}

export function subtotal(lines: CartLine[]) {
  return lines.reduce((n, l) => n + linePrice(l), 0);
}

export function CartLines({ compact = false }: { compact?: boolean }) {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const changeSize = useCart((s) => s.changeSize);
  const close = useCart((s) => s.setOpen);

  return (
    <ul className="divide-y divide-gunmetal">
      {lines.map((l) => {
        const p = products.find((x) => x.slug === l.slug);
        if (!p) return null;
        const img = p.cutout ?? p.images[0]!;
        const variant = p.variants.find((v) => v.sku === l.sku);
        const stock = variant?.stock ?? 0;
        return (
          <li key={l.key} className="flex gap-4 py-5">
            <Link href={`/products/${p.slug}`} onClick={() => close(false)} className="grid h-28 w-24 shrink-0 place-items-center bg-carbon">
              <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="96px" className="h-auto w-[88%]" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="display text-base">{p.name}</p>
                  <p className="text-xs text-steel">{l.colour}</p>
                </div>
                <p className="label whitespace-nowrap tracking-[0.12em] text-neon">{formatINR(linePrice(l))}</p>
              </div>
              {l.custom && (
                <p className="text-xs text-steel">
                  Custom: “{l.custom.text}” · {TEXT_PLACEMENTS.find((x) => x.id === l.custom!.placement)?.label} ·{" "}
                  {TEXT_COLOURS.find((x) => x.id === l.custom!.colour)?.label}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor={`size-${l.key}`}>Size</label>
                <select
                  id={`size-${l.key}`}
                  value={l.size}
                  onChange={(e) => {
                    const v = p.variants.find((x) => x.size === e.target.value && x.colour === l.colour);
                    if (v) changeSize(l.key, v.sku, v.size);
                  }}
                  className="field !min-h-10 !w-auto !py-1.5 text-sm"
                >
                  {p.variants.filter((v) => v.colour === l.colour).map((v) => (
                    <option key={v.sku} value={v.size} disabled={v.stock === 0}>{v.size}{v.stock === 0 ? " — sold out" : ""}</option>
                  ))}
                </select>
                <div className="flex items-center border border-gunmetal" role="group" aria-label={`Quantity for ${p.name}`}>
                  <button type="button" className="h-10 w-10" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease quantity">−</button>
                  <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{l.qty}</span>
                  <button type="button" className="h-10 w-10 disabled:opacity-30" disabled={l.qty >= Math.min(stock, MAX_PER_LINE)} onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase quantity">+</button>
                </div>
                <button type="button" onClick={() => remove(l.key)} className={`text-xs text-steel underline-offset-4 hover:text-neon hover:underline ${compact ? "" : "ml-auto"}`}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CartSummary() {
  const lines = useCart((s) => s.lines);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between"><span className="text-steel">Subtotal</span><span className="tabular-nums">{formatINR(subtotal(lines))}</span></div>
      <div className="flex justify-between"><span className="text-steel">Shipping</span><span className="text-steel">At checkout</span></div>
      <div className="flex justify-between"><span className="text-steel">Discount code</span><span className="text-steel">At checkout</span></div>
      <div className="flex justify-between border-t border-gunmetal pt-3 text-base"><span>Estimated total</span><span className="tabular-nums text-neon">{formatINR(subtotal(lines))}</span></div>
      <button type="button" disabled className="btn btn-primary mt-2 w-full">Checkout</button>
      <p className="text-xs leading-relaxed text-steel">
        Checkout opens once payments are connected. Your bag is saved on this device.
      </p>
    </div>
  );
}
