"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { products } from "@/lib/catalog/data";
import { addLine, changeSize, removeLine, setQty, type AddResult, type CartLine } from "./logic";

/**
 * Phase 2 cart: persisted in this browser only. Phase 3 moves it server-side
 * (account cart / signed guest-cart cookie) and merges on sign-in.
 */
function stockOf(sku: string): number {
  for (const p of products) for (const v of p.variants) if (v.sku === sku) return v.stock;
  return 0;
}

type CartState = {
  lines: CartLine[];
  open: boolean;
  add: (line: Omit<CartLine, "key">) => AddResult;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  changeSize: (key: string, sku: string, size: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,
      add: (line) => {
        const r = addLine(get().lines, line, stockOf(line.sku));
        if (r.added > 0) set({ lines: r.lines, open: true });
        return r;
      },
      setQty: (key, qty) => {
        const line = get().lines.find((l) => l.key === key);
        if (line) set({ lines: setQty(get().lines, key, qty, stockOf(line.sku)) });
      },
      remove: (key) => set({ lines: removeLine(get().lines, key) }),
      changeSize: (key, sku, size) => set({ lines: changeSize(get().lines, key, { sku, size }, stockOf(sku)) }),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "szw-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // drop lines whose SKU no longer exists
      merge: (persisted, current) => {
        const p = persisted as Partial<CartState> | undefined;
        const lines = (p?.lines ?? []).filter((l) => stockOf(l.sku) > 0);
        return { ...current, lines };
      },
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

type WishState = { slugs: string[]; toggle: (slug: string) => void; has: (slug: string) => boolean };

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set({ slugs: get().slugs.includes(slug) ? get().slugs.filter((s) => s !== slug) : [...get().slugs, slug] }),
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: "szw-wishlist-v1", storage: createJSONStorage(() => localStorage) },
  ),
);
