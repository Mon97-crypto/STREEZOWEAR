import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { DraftNotice, Placeholder } from "@/components/store/Placeholder";
import { policies } from "@/lib/config/business";
import { EXPRESS } from "@/lib/delivery/express";

export const metadata: Metadata = { title: "Shipping policy", alternates: { canonical: "/shipping-policy" } };

export default function Shipping() {
  return (
    <>
      <PageHead kicker="Shipping" title="Shipping policy." />
      <div className="wrap prose-sw max-w-3xl">
        <DraftNotice />
        <h2>60-minute delivery (Bangalore)</h2>
        <p>Available for addresses within about {EXPRESS.radiusKm} km of {EXPRESS.origin.name}, during delivery hours (<Placeholder>{EXPRESS.hours.open}–{EXPRESS.hours.lastOrder}</Placeholder>), for in-stock pieces. Availability is confirmed for your exact address at checkout. Fee: <Placeholder>{EXPRESS.feePaise === null ? "shown at checkout" : EXPRESS.feePaise / 100}</Placeholder>.</p>
        <p>Delivery inside 60 minutes is our target from order confirmation. Traffic, weather or rider availability can occasionally cause delays; if we can&apos;t make it, we&apos;ll tell you right away.</p>
        <h2>Standard delivery (India)</h2>
        <p>We ship across India through courier partners. Charges and an estimated delivery date are shown at checkout before you pay. Orders dispatch within <Placeholder>1–2 business days</Placeholder>.</p>
        <h2>Custom pieces</h2>
        <p>Text customisation and artwork orders are made to order. Production time is <Placeholder>to be confirmed</Placeholder> and is shown before you pay.</p>
        <h2>Tracking</h2>
        <p>You&apos;ll get a tracking link by email once your order ships. You can also use the Track order page with your order number and contact details.</p>
        <h2>Failed delivery</h2>
        <p>If a delivery attempt fails, the courier will retry or contact you. Parcels that return to us undelivered can be re-shipped; the re-shipping charge is <Placeholder>to be confirmed</Placeholder>.</p>
        <p>{policies.codEnabled ? "Cash on Delivery is available on eligible orders." : "Cash on Delivery is currently not offered."}</p>
      </div>
    </>
  );
}
