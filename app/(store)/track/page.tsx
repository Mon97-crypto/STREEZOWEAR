import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";

export const metadata: Metadata = { title: "Track order", description: "Track your STREEZØWEAR order.", alternates: { canonical: "/track" } };

export default function Track() {
  return (
    <>
      <PageHead kicker="Track order" title="Where's my fit?" intro="Enter your order number and the email or mobile number used at checkout." />
      <div className="wrap">
        <form className="grid max-w-xl gap-4" aria-describedby="track-note">
          <div>
            <label htmlFor="order" className="label mb-2 block text-steel">Order number</label>
            <input id="order" name="order" className="field uppercase" placeholder="SZW-…" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="contact" className="label mb-2 block text-steel">Email or mobile</label>
            <input id="contact" name="contact" className="field" autoComplete="email" />
          </div>
          <button type="submit" disabled className="btn btn-primary">Track</button>
          <p id="track-note" className="text-sm text-steel">Tracking goes live with the first orders.</p>
        </form>
      </div>
    </>
  );
}
