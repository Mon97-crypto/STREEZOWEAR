import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/store/PageHead";
import { DraftNotice, Placeholder } from "@/components/store/Placeholder";
import { business } from "@/lib/config/business";

export const metadata: Metadata = { title: "Terms & conditions", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <>
      <PageHead kicker="Terms" title="Terms & conditions." />
      <div className="wrap prose-sw max-w-3xl">
        <DraftNotice />
        <p>These terms apply when you use this site or buy from <Placeholder>{business.legalName}</Placeholder> (GSTIN <Placeholder>{business.gstin ?? "to be added"}</Placeholder>), {business.address}.</p>
        <h2>Orders and pricing</h2>
        <p>Prices are in Indian Rupees and include applicable taxes. An order is confirmed only once payment is verified. We may cancel and fully refund an order if a piece sells out or a pricing error occurs.</p>
        <h2>Limited drops</h2>
        <p>Drops are limited runs. Stock is reserved for you only while checkout is in progress.</p>
        <h2>Custom pieces</h2>
        <p>You confirm you own or have the rights to any text or artwork you submit. We can decline artwork that infringes someone else&apos;s rights or that we judge offensive.</p>
        <h2>Delivery, returns and refunds</h2>
        <p>See the <Link href="/shipping-policy">shipping policy</Link> and the <Link href="/returns">returns policy</Link>.</p>
        <h2>Intellectual property</h2>
        <p>The STREEZØWEAR name, logo, designs and content on this site belong to {business.legalName}. Don&apos;t reuse them without written permission.</p>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India. Courts in <Placeholder>Bangalore, Karnataka</Placeholder> have jurisdiction.</p>
      </div>
    </>
  );
}
