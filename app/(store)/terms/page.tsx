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
        <p>The STREEZØWEAR name, logo, garment designs, artwork, photography, video, copy, and the design, layout and code of this website belong to {business.legalName}. All rights reserved. Don&apos;t reuse them without written permission.</p>
        <h2>No scraping, copying or AI use</h2>
        <p>You may not copy, reproduce or imitate this website&apos;s design, layout, look and feel, artwork or code; scrape, crawl or bulk-download any part of the site; or use any content from this site, including screenshots, to train, fine-tune or prompt artificial-intelligence or machine-learning systems, or to generate designs derived from it. Text-and-data-mining rights are expressly reserved. Breach may lead to legal action.</p>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India. Courts in <Placeholder>Bangalore, Karnataka</Placeholder> have jurisdiction.</p>
      </div>
    </>
  );
}
