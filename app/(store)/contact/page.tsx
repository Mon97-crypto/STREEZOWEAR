import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { Placeholder } from "@/components/store/Placeholder";
import { business } from "@/lib/config/business";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with STREEZØWEAR.", alternates: { canonical: "/contact" } };

export default function Contact() {
  const rows: [string, React.ReactNode][] = [
    ["Email", <Placeholder key="e">{business.email}</Placeholder>],
    ["Phone / WhatsApp", <Placeholder key="p">{business.phone}</Placeholder>],
    ["Instagram", <Placeholder key="i">@{business.instagram}</Placeholder>],
    ["Based in", `${business.city}, ${business.state}`],
  ];
  return (
    <>
      <PageHead kicker="Contact" title="Talk to us." intro="Orders, sizing, custom pieces or collabs. We reply fast." />
      <div className="wrap">
        <dl className="max-w-2xl divide-y divide-gunmetal border-y border-gunmetal">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="label text-steel">{k}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-steel">Have an order number ready if it&apos;s about an order.</p>
      </div>
    </>
  );
}
