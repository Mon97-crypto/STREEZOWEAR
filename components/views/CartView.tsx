"use client";

import Link from "next/link";
import { CartLines, CartSummary } from "@/components/store/CartLines";
import { PageHead } from "@/components/store/PageHead";
import { useHydrated } from "@/components/ui/useHydrated";
import { cartCount, useCart } from "@/lib/cart/store";

export function CartView() {
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.lines));
  return (
    <>
      <PageHead kicker="Bag" title="Your bag." />
      <div className="wrap">
        {!hydrated ? <div className="h-64" /> : count === 0 ? (
          <div className="py-16">
            <p className="text-lg text-steel">Nothing here yet. The street&apos;s waiting.</p>
            <Link href="/shop" className="btn btn-primary mt-8">Shop the drop</Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div className="border-t border-gunmetal"><CartLines /></div>
            <aside className="self-start border border-gunmetal bg-carbon p-6 lg:sticky lg:top-24"><CartSummary /></aside>
          </div>
        )}
      </div>
    </>
  );
}
