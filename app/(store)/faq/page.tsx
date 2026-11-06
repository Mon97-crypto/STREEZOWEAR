import type { Metadata } from "next";
import { Accordion } from "@/components/store/Accordion";
import { PageHead } from "@/components/store/PageHead";
import { policies } from "@/lib/config/business";
import { EXPRESS } from "@/lib/delivery/express";

export const metadata: Metadata = { title: "FAQs", description: "Sizing, delivery, customisation and returns at STREEZØWEAR.", alternates: { canonical: "/faq" } };

const FAQ = [
  { title: "How do the tees fit?", body: "Our tees are oversized with drop shoulders: a boxy fit that hangs loose. If you want it less roomy, go one size down. Check the size guide for each piece." },
  { title: "What are they made of?", body: "Cotton and polyester, 250 GSM. Heavy, with a premium hand. Big prints on the back, a logo on the chest and a hit on the sleeve. Our crystal pieces are hand-finished." },
  { title: "What is 60-minute delivery?", body: `Express delivery within about ${EXPRESS.radiusKm} km of ${EXPRESS.origin.name}, Bangalore. Enter your PIN code on any product page to check. It's offered at checkout during delivery hours, when the piece is in stock.` },
  { title: "Do you ship across India?", body: "Yes. Standard courier delivery across India. You'll see the rate and estimate at checkout." },
  { title: "Can I customise a piece?", body: "Yes. That's One of One, our custom studio. Two ways in: put your name or short text on the left chest, upper back or sleeve, or send your own artwork for a quote. Custom pieces are made to order." },
  { title: "Can I return or exchange?", body: `Requests within ${policies.returnWindowDays} days of delivery, as set out in the returns policy. Custom pieces can't be returned unless they arrive faulty.` },
  { title: "Is Cash on Delivery available?", body: policies.codEnabled ? "Yes, on eligible orders. You'll see the option at checkout." : "Not right now. Pay securely online by UPI, card or net banking." },
  { title: "Will a design come back?", body: "Usually not. Every design drops once in a limited run. When it's gone, it's gone." },
];

export default function Faq() {
  return (
    <>
      <PageHead kicker="FAQs" title="Straight answers." />
      <div className="wrap max-w-3xl"><Accordion items={FAQ} /></div>
    </>
  );
}
