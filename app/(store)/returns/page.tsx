import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { DraftNotice, Placeholder } from "@/components/store/Placeholder";
import { business, policies } from "@/lib/config/business";

export const metadata: Metadata = { title: "Returns & refunds", alternates: { canonical: "/returns" } };

export default function Returns() {
  return (
    <>
      <PageHead kicker="Returns" title="Returns & refunds." />
      <div className="wrap prose-sw max-w-3xl">
        <DraftNotice />
        <h2>Window</h2>
        <p>You can request a return or exchange within <Placeholder>{policies.returnWindowDays} days</Placeholder> of delivery.</p>
        <h2>Condition</h2>
        <p>Pieces must come back <Placeholder>unworn, unwashed, with original tags and packaging</Placeholder>.</p>
        <h2>Custom pieces</h2>
        <p>Pieces with your text or artwork are made to order and {policies.customPiecesReturnable ? "can be returned under the same terms." : "can't be returned or exchanged unless they arrive faulty or misprinted."}</p>
        <h2>Faulty or wrong item</h2>
        <p>Tell us within <Placeholder>48 hours</Placeholder> of delivery with photos, and we&apos;ll replace it or refund it in full, including shipping.</p>
        <h2>Refunds</h2>
        <p>Approved refunds go back to your original payment method within <Placeholder>{policies.refundProcessingDays} business days</Placeholder> of the return reaching us. Shipping charges are <Placeholder>non-refundable unless the item was faulty</Placeholder>.</p>
        <h2>How to start</h2>
        <p>Email <Placeholder>{business.email}</Placeholder> with your order number. Self-serve returns arrive with customer accounts.</p>
      </div>
    </>
  );
}
