"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { LogoStack, Wordmark } from "@/components/brand/Logo";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/ui/Icons";
import { useHydrated } from "@/components/ui/useHydrated";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cartCount, useCart } from "@/lib/cart/store";
import { NAV } from "./nav";

export function Header() {
  const path = usePathname();
  const overHero = path === "/" || path.startsWith("/drops/");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.lines));
  const openCart = useCart((s) => s.setOpen);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const solid = scrolled || !overHero || menu;
  const compact = scrolled || menu;
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      <header
        className={`sw-dark fixed inset-x-0 top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300 ${
          solid ? "border-gunmetal bg-void" : "border-transparent bg-gradient-to-b from-void from-30% via-void/85 to-transparent"
        }`}
      >
        <nav
          className="wrap flex items-center justify-between gap-6 transition-[height] duration-300 ease-out-expo"
          style={{ height: compact ? "var(--sw-header-compact)" : "var(--sw-header)" }}
          aria-label="Main"
        >
          <Link href="/" aria-label="STREEZØWEAR home" className="relative grid shrink-0 place-items-start">
            {/* expanded: S mark stacked over the wordmark · compact: wordmark only */}
            <span
              className={`col-start-1 row-start-1 transition-all duration-300 ${compact ? "pointer-events-none -translate-y-2 scale-95 opacity-0" : "opacity-100"}`}
              aria-hidden={compact}
            >
              <LogoStack priority className="w-[112px] min-[380px]:w-[132px] md:w-[158px]" />
            </span>
            <span
              className={`col-start-1 row-start-1 self-center transition-all duration-300 ${compact ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
              aria-hidden={!compact}
            >
              <Wordmark priority className="w-[132px] min-[380px]:w-[150px] sm:w-[176px]" />
            </span>
          </Link>
          <ul className="label hidden items-center gap-7 xl:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className="relative py-2 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-px after:bg-neon after:shadow-[0_0_8px_var(--sw-neon-glow)] after:transition-all after:duration-300 aria-[current=page]:after:w-full after:w-0 hover:after:w-full"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center sm:gap-2">
            <ThemeToggle />
            <Link href="/search" aria-label="Search" className="grid h-11 w-11 place-items-center hover:text-neon"><SearchIcon className="h-5 w-5" /></Link>
            <Link href="/account" aria-label="Account" className="hidden h-11 w-11 place-items-center hover:text-neon sm:grid"><UserIcon className="h-5 w-5" /></Link>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden h-11 w-11 place-items-center hover:text-neon sm:grid"><HeartIcon className="h-5 w-5" /></Link>
            <button type="button" onClick={() => openCart(true)} aria-label={`Bag, ${hydrated ? count : 0} items`} className="relative grid h-11 w-11 place-items-center hover:text-neon">
              <BagIcon className="h-5 w-5" />
              <AnimatePresence>
                {hydrated && count > 0 && (
                  <motion.b
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-0.5 top-1 min-w-4 rounded-full bg-neon px-1 text-center text-[10px] font-semibold leading-4 text-void"
                  >
                    {count}
                  </motion.b>
                )}
              </AnimatePresence>
            </button>
            <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? "Close menu" : "Open menu"} className="grid h-11 w-11 place-items-center xl:hidden">
              {menu ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            className="sw-dark fixed inset-0 z-40 flex flex-col overflow-y-auto bg-void pt-[var(--sw-header-compact)] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="wrap flex flex-1 flex-col justify-center gap-1">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] }}>
                  <Link href={n.href} className={`display block py-2 text-4xl sm:text-5xl ${isActive(n.href) ? "text-neon" : ""}`}>
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="wrap flex gap-6 border-t border-gunmetal py-6">
              <Link href="/account" className="label">Account</Link>
              <Link href="/wishlist" className="label">Wishlist</Link>
              <Link href="/track" className="label">Track order</Link>
              <ThemeToggle withLabel className="-my-3 ml-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
