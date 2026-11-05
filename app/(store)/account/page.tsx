import type { Metadata } from "next";
import { Coming } from "@/components/store/Coming";
import { PageHead } from "@/components/store/PageHead";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function Account() {
  return (
    <>
      <PageHead kicker="Account" title="Your street." />
      <div className="wrap">
        <Coming>
          Accounts open soon: sign in with email, saved addresses, order history, tracking and a wishlist that syncs across devices. Guest checkout stays available.
        </Coming>
      </div>
    </>
  );
}
