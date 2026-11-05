export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL" | (string & {});

export type Media = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** cutout = transparent garment for the floating showroom */
  kind: "image" | "cutout" | "detail";
};

export type Video = { desktop: string; mobile: string; mobileWebm?: string; poster: string };

export type Colour = { name: string; hex: string };

export type Variant = {
  sku: string;
  size: Size;
  colour: string;
  /** Units available to sell. Phase 3: comes from inventory.on_hand - reserved. */
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** one line for cards and hover */
  short: string;
  description: string[];
  categories: string[];
  drop: string | null;
  pricePaise: number;
  salePricePaise: number | null;
  isNew: boolean;
  isLimited: boolean;
  isFeatured: boolean;
  isCustomisable: boolean;
  fabric: string;
  gsm: number;
  fit: string | null;
  details: string[];
  colours: Colour[];
  sizes: Size[];
  variants: Variant[];
  cutout: Media | null;
  images: Media[];
  video: Video | null;
};

export type Category = { slug: string; name: string; description: string };

export type Drop = {
  slug: string;
  number: string;
  name: string;
  status: "draft" | "scheduled" | "live" | "archived";
  /** ISO timestamp; null when launched without a scheduled date */
  launchAt: string | null;
  headline: string;
  intro: string;
  story: string[];
  video: Video;
  stills: Media[];
  products: string[]; // product slugs, in display order
  isLimited: boolean;
};
