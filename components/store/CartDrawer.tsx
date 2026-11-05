"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { CloseIcon } from "@/components/ui/Icons";
import { useHydrated } from "@/components/ui/useHydrated";
import { cartCount, useCart } from "@/lib/cart/store";
import { CartLines, CartSummary } from "./CartLines";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const count = useCart((s) => cartCount(s.lines));
  const hydrated = useHydrated();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {hydrated && open && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-[60] bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col border-l border-gunmetal bg-void"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-gunmetal px-6 py-5">
              <p className="display text-xl">Your bag <span className="label ml-2 text-steel">{count}</span></p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close bag" className="grid h-11 w-11 place-items-center" autoFocus>
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            {count === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="display text-3xl">Bag&apos;s empty.</p>
                <p className="text-steel">The street&apos;s waiting.</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-primary">Shop the drop</Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6"><CartLines compact /></div>
                <div className="border-t border-gunmetal px-6 py-5">
                  <CartSummary />
                  <Link href="/cart" onClick={() => setOpen(false)} className="label mt-4 block text-center text-steel hover:text-chrome">View full bag</Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
