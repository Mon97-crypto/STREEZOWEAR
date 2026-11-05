/**
 * Customisation — owner chose (c): both
 *   A) name/text on fixed placements, added straight to the cart
 *   B) customer artwork, reviewed by STREEZØWEAR and quoted before anything is charged
 */
export const TEXT_PLACEMENTS = [
  { id: "left-chest", label: "Left chest", maxChars: 12, note: "Small hit, 3–4 in wide" },
  { id: "upper-back", label: "Upper back", maxChars: 18, note: "Across the shoulders" },
  { id: "sleeve", label: "Sleeve", maxChars: 10, note: "Down the left sleeve" },
] as const;

export const TEXT_STYLES = [
  { id: "display", label: "Display", className: "font-display italic font-black uppercase tracking-tight" },
  { id: "mono", label: "Mono", className: "font-label italic uppercase tracking-[0.25em]" },
] as const;

export const TEXT_COLOURS = [
  { id: "chrome", label: "Chrome", hex: "#E8E8EC" },
  { id: "neon", label: "Neon Red", hex: "#FF1E3C" },
] as const;

/** PLACEHOLDER — price of a text add-on in paise. null = not yet priced: preview works, add-to-cart is held. */
export const TEXT_ADDON_PAISE: number | null = null;

/** Letters, numbers, space and a few safe symbols. No emoji or markup. */
export const TEXT_ALLOWED = /^[A-Za-z0-9 .\-&'!#]*$/;

export const ARTWORK = {
  maxBytes: 15 * 1024 * 1024,
  /** SVG deliberately excluded (can carry scripts). */
  mimeTypes: ["image/png", "image/jpeg", "application/pdf"] as readonly string[],
  extensions: [".png", ".jpg", ".jpeg", ".pdf"] as readonly string[],
  guidance: "PNG with transparent background, 300 DPI at print size (up to 12 in wide), or a print-ready PDF.",
} as const;

export type TextPlacementId = (typeof TEXT_PLACEMENTS)[number]["id"];
export type TextStyleId = (typeof TEXT_STYLES)[number]["id"];
export type TextColourId = (typeof TEXT_COLOURS)[number]["id"];
