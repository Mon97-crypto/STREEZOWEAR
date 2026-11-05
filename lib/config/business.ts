/**
 * Business settings. Every value marked PLACEHOLDER must be confirmed before launch.
 * Phase 3 moves these into the `business_settings` table so they are editable from /admin.
 */
export const business = {
  name: "STREEZØWEAR",
  legalName: "Streezowear", // PLACEHOLDER — confirm registered entity name (and add GSTIN)
  gstin: null as string | null, // PLACEHOLDER
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  address: "Bangalore, Karnataka, India", // PLACEHOLDER — full registered address required for policy pages
  phone: "+91 00000 00000", // PLACEHOLDER — dummy number
  email: "support@example.com", // PLACEHOLDER — replace with a mailbox on your own domain
  instagram: "streezowear", // PLACEHOLDER — confirm handle
  tagline: "OWN YOUR STREET, DEFINE YOUR STYLE.",
  shortTagline: "OWN YOUR STREET.",
} as const;

export const policies = {
  /** PLACEHOLDER — number of days after delivery a return/exchange can be requested. */
  returnWindowDays: 7,
  /** PLACEHOLDER — refunds go back to the original payment method within this many business days. */
  refundProcessingDays: 7,
  /** PLACEHOLDER — Cash on Delivery. Off until you decide (COD fee/limits configurable in Phase 4). */
  codEnabled: false,
  /** PLACEHOLDER — custom pieces (text or artwork) are made to order: no returns unless defective/misprinted. */
  customPiecesReturnable: false,
  /** PLACEHOLDER — standard courier estimate shown before live Shiprocket rates are connected. */
  standardDeliveryEstimate: "Delivery estimate shown at checkout",
} as const;

export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
} as const;
