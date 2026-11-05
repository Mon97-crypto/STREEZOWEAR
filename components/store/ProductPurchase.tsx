"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "@/lib/cart/store";
import { MAX_PER_LINE, qtyForSku } from "@/lib/cart/logic";
import type { Product } from "@/lib/catalog/types";
import { formatINR } from "@/lib/pricing/format";
import { useHydrated } from "@/components/ui/useHydrated";
import { WishlistButton } from "./WishlistButton";

const LOW = 5;

export function ProductPurchase({ product }: { product: Product }) {
  const [colour, setColour] = useState(product.colours[0]!.name);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);
  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const hydrated = useHydrated();

  const variant = size ? product.variants.find((v) => v.size === size && v.colour === colour) ?? null : null;
  const inCart = variant && hydrated ? qtyForSku(lines, variant.sku) : 0;
  const available = variant ? Math.max(0, variant.stock - inCart) : 0;
  const maxQty = Math.min(available, MAX_PER_LINE);
  const price = product.salePricePaise ?? product.pricePaise;

  function addToCart() {
    if (!variant) {
      setMsg("Pick a size first.");
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const r = add({ slug: product.slug, sku: variant.sku, size: variant.size, colour, qty });
    if (r.added === 0) setMsg(r.reason === "out-of-stock" ? "That size is sold out." : "You have the maximum for this size in your bag.");
    else {
      setMsg(r.reason === "limit" ? `Added ${r.added} — that's all we have in ${variant.size}.` : null);
      setPulse((p) => p + 1);
      setQty(1);
    }
  }

  const stockLine = !variant
    ? null
    : available === 0
      ? <span className="text-steel">Sold out in {variant.size}</span>
      : available <= LOW
        ? <span className="text-neon">Only {available} left in {variant.size}</span>
        : <span className="text-chrome">In stock</span>;

  return (
    <div>
      {product.colours.length > 0 && (
        <fieldset className="mt-8">
          <legend className="label mb-3 text-steel">Colour — <span className="text-chrome">{colour}</span></legend>
          <div className="flex gap-2">
            {product.colours.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={c.name === colour}
                aria-label={c.name}
                onClick={() => setColour(c.name)}
                className={`h-11 w-11 border ${c.name === colour ? "border-neon" : "border-gunmetal"}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </fieldset>
      )}

      <fieldset id="size-picker" className="mt-8 scroll-mt-28">
        <div className="mb-3 flex items-baseline justify-between">
          <legend className="label text-steel">Size{size && <> — <span className="text-chrome">{size}</span></>}</legend>
          <Link href="/size-guide" className="label text-[0.65rem] text-steel underline-offset-4 hover:text-neon hover:underline">Size guide</Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.sizes.map((s) => {
            const v = product.variants.find((x) => x.size === s && x.colour === colour);
            const out = !v || v.stock === 0;
            return (
              <button
                key={s}
                type="button"
                disabled={out}
                aria-pressed={size === s}
                onClick={() => {
                  setSize(s);
                  setQty(1);
                  setMsg(null);
                }}
                className={`label h-12 border text-sm transition-colors ${
                  size === s ? "border-neon bg-neon text-void" : out ? "border-gunmetal text-gunmetal line-through" : "border-gunmetal hover:border-chrome"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        <p className="mt-3 min-h-5 text-sm" aria-live="polite">{stockLine}</p>
      </fieldset>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-[52px] items-center border border-gunmetal" role="group" aria-label="Quantity">
          <button type="button" className="h-full w-12 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} aria-label="Decrease quantity">−</button>
          <span className="w-8 text-center tabular-nums">{qty}</span>
          <button type="button" className="h-full w-12 disabled:opacity-30" disabled={!variant || qty >= maxQty} onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
        </div>
        <WishlistButton slug={product.slug} name={product.name} withLabel className="h-[52px] border border-gunmetal px-4 hover:border-neon" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <motion.button key={pulse} type="button" onClick={addToCart} disabled={!!variant && available === 0} className="btn btn-primary" animate={pulse ? { scale: [1, 0.97, 1] } : undefined} transition={{ duration: 0.3 }}>
          Add to bag · {formatINR(price * qty)}
        </motion.button>
        <button type="button" onClick={addToCart} disabled={!!variant && available === 0} className="btn btn-ghost">Buy now</button>
      </div>
      <AnimatePresence>
        {msg && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-neon" role="status">
            {msg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Mobile: sticky add-to-bag */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-gunmetal bg-void/95 px-4 py-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="min-w-0 flex-1">
          <p className="display truncate text-sm">{product.name}</p>
          <p className="label text-[0.65rem] text-neon">{formatINR(price)}{size ? ` · ${size}` : ""}</p>
        </div>
        <button type="button" onClick={addToCart} disabled={!!variant && available === 0} className="btn btn-primary !min-h-12 !px-5">
          {size ? "Add to bag" : "Pick size"}
        </button>
      </div>
    </div>
  );
}
