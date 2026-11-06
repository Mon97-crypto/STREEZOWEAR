import Link from "next/link";
import { LogoLockup } from "@/components/brand/Logo";
import { business } from "@/lib/config/business";

const COLS = [
  { title: "Shop", links: [["All products", "/shop"], ["New drops", "/drops"], ["T-Shirts", "/shop/t-shirts"], ["Limited edition", "/shop/limited-edition"], ["Customise", "/customise"]] },
  { title: "Help", links: [["Track order", "/track"], ["Shipping", "/shipping-policy"], ["Returns & refunds", "/returns"], ["Size guide", "/size-guide"], ["FAQs", "/faq"], ["Contact", "/contact"]] },
  { title: "Brand", links: [["About", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
] as const;

export function Footer() {
  return (
    <footer className="sw-dark mt-24 border-t border-gunmetal bg-void">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.2fr_2fr]">
        <div>
          <LogoLockup className="w-[min(280px,70vw)]" />
          <p className="label mt-2 text-steel">Welcome to the street. Wear it loud.</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="label mb-4 text-neon">{c.title}</p>
              <ul className="space-y-0.5 text-sm text-steel">
                {c.links.map(([label, href]) => (
                  <li key={href}><Link href={href} className="inline-block py-2 hover:text-chrome">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap flex flex-col justify-between gap-3 border-t border-gunmetal py-6 text-xs text-steel sm:flex-row">
        <p>© {new Date().getFullYear()} {business.legalName}. {business.city}, {business.state}.</p>
        <p className="label text-[0.65rem]">{business.shortTagline}</p>
      </div>
    </footer>
  );
}
