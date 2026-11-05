import Link from "next/link";

export function Coming({ children, cta = { href: "/shop", label: "Back to the shop" } }: { children: React.ReactNode; cta?: { href: string; label: string } }) {
  return (
    <div className="max-w-xl border border-gunmetal bg-carbon p-8">
      <p className="label text-neon">Coming online</p>
      <div className="mt-4 leading-relaxed text-steel">{children}</div>
      <Link href={cta.href} className="btn btn-ghost mt-8">{cta.label}</Link>
    </div>
  );
}
