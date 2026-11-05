import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { DraftNotice, Placeholder } from "@/components/store/Placeholder";
import { business } from "@/lib/config/business";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <>
      <PageHead kicker="Privacy" title="Privacy policy." />
      <div className="wrap prose-sw max-w-3xl">
        <DraftNotice />
        <p><Placeholder>{business.legalName}</Placeholder>, {business.address}, runs this website. This page explains what personal data we collect and why.</p>
        <h2>What we collect</h2>
        <ul>
          <li>Order details: name, email, mobile number and delivery address, to fulfil and deliver your order.</li>
          <li>Account details, if you create an account: email, saved addresses, order history and wishlist.</li>
          <li>Payment status from our payment provider. We never see or store card numbers, CVVs or UPI PINs.</li>
          <li>Artwork you upload for custom pieces, used only to quote and produce your order.</li>
          <li>Basic technical data (device, browser, pages visited) to keep the site secure and working.</li>
        </ul>
        <h2>Who we share it with</h2>
        <p>Only the services needed to run your order: our payment processor, courier and delivery partners, our email provider and our hosting and database providers. We don&apos;t sell your data.</p>
        <h2>On this device</h2>
        <p>Your bag and wishlist are saved in your browser&apos;s local storage so they&apos;re still there when you come back. We don&apos;t use advertising cookies.</p>
        <h2>Your choices</h2>
        <p>You can ask to see, correct or delete your data by emailing <Placeholder>{business.email}</Placeholder>. Some order records must be kept for tax and legal reasons.</p>
        <h2>Contact</h2>
        <p>Grievance officer: <Placeholder>name, email, address</Placeholder>.</p>
      </div>
    </>
  );
}
