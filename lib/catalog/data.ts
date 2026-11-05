/**
 * Launch catalogue (Phase 2 static source).
 * Facts supplied by the owner: prices, sizes S–XL, 15 units per size, cotton/polyester, 250 GSM,
 * Drop 01 "Rugged Boyz". Product names and descriptive copy are written from the artwork and can be
 * renamed. Phase 3 replaces this module with Supabase queries behind lib/catalog/queries.ts.
 */
import type { Category, Drop, Product, Variant } from "./types";
import { rupees } from "@/lib/pricing/format";

const SIZES = ["S", "M", "L", "XL"] as const;
const STOCK_PER_SIZE = 15;

function variants(code: string, colour: string, colourCode: string): Variant[] {
  return SIZES.map((size) => ({ sku: `SZW-${code}-${colourCode}-${size}`, size, colour, stock: STOCK_PER_SIZE }));
}

const P = "/media/products";

export const categories: Category[] = [
  { slug: "t-shirts", name: "T-Shirts", description: "Premium printed tees. Heavyweight, built to hang right." },
  { slug: "oversized-t-shirts", name: "Oversized T-Shirts", description: "Drop shoulders, boxy fit, 250 GSM." },
  { slug: "hoodies", name: "Hoodies", description: "Heavyweight hoodies. First drop on the way." },
  { slug: "sweatshirts", name: "Sweatshirts", description: "Crewnecks for the cold nights. First drop on the way." },
  { slug: "limited-edition", name: "Limited Edition", description: "One run. When it's gone, it's gone." },
  { slug: "new-arrivals", name: "New Arrivals", description: "The latest off the street." },
];

export const products: Product[] = [
  {
    id: "seraph",
    slug: "seraph-oversized-tee",
    name: "Seraph",
    short: "Stone angel, crystal halo. Oversized tee.",
    description: [
      "A stone angel under a crystal halo, wings set in red and silver stones that catch every light on the street.",
      "Washed black, drop shoulders, a boxy fit that hangs right.",
    ],
    categories: ["t-shirts", "oversized-t-shirts", "limited-edition", "new-arrivals"],
    drop: "rugged-boyz",
    pricePaise: rupees(499),
    salePricePaise: null,
    isNew: true,
    isLimited: true,
    isFeatured: true,
    isCustomisable: true,
    fabric: "Cotton, polyester",
    gsm: 250,
    fit: "Oversized, drop shoulder",
    details: ["Crystal-detailed front graphic", "Washed-black finish", "Ribbed crew neck"],
    colours: [{ name: "Washed Black", hex: "#2a2a2e" }],
    sizes: [...SIZES],
    variants: variants("SERAPH", "Washed Black", "WBLK"),
    cutout: { src: `${P}/seraph-angel-tee-cutout-1200.webp`, alt: "Seraph oversized tee — stone angel with crystal wings on washed black", width: 1200, height: 1094, kind: "cutout" },
    images: [
      { src: `${P}/seraph-angel-tee-cutout-1200.webp`, alt: "Seraph oversized tee, front", width: 1200, height: 1094, kind: "cutout" },
      { src: `${P}/seraph-angel-tee-1600.webp`, alt: "Seraph oversized tee on the studio backdrop", width: 1600, height: 1600, kind: "image" },
      { src: `${P}/seraph-detail-halo-1080.webp`, alt: "Seraph — close-up of the crystal halo and angel", width: 1080, height: 1080, kind: "detail" },
      { src: `${P}/seraph-detail-wings-1080.webp`, alt: "Seraph — macro of red and silver crystal wings", width: 1080, height: 1080, kind: "detail" },
      { src: `${P}/seraph-detail-profile-1080.webp`, alt: "Seraph — side profile, drop shoulder", width: 1080, height: 1080, kind: "detail" },
    ],
    video: { desktop: "/media/campaign/seraph-1080.mp4", mobile: "/media/campaign/seraph-720.mp4", mobileWebm: "/media/campaign/seraph-720.webm", poster: "/media/campaign/seraph-poster.jpg" },
  },
  {
    id: "blood-moon",
    slug: "blood-moon-oversized-tee",
    name: "Blood Moon",
    short: "Gothic spires under a red moon. Oversized tee.",
    description: [
      "A cathedral rising out of the dark under a blood moon. Crystal lines trace the spires and the cracks in the ground.",
      "Washed black, drop shoulders, a boxy fit that hangs right.",
    ],
    categories: ["t-shirts", "oversized-t-shirts", "new-arrivals"],
    drop: "rugged-boyz",
    pricePaise: rupees(499),
    salePricePaise: null,
    isNew: true,
    isLimited: false,
    isFeatured: true,
    isCustomisable: true,
    fabric: "Cotton, polyester",
    gsm: 250,
    fit: "Oversized, drop shoulder",
    details: ["Crystal-detailed front graphic", "Washed-black finish", "Ribbed crew neck"],
    colours: [{ name: "Washed Black", hex: "#2a2a2e" }],
    sizes: [...SIZES],
    variants: variants("BLOODMOON", "Washed Black", "WBLK"),
    cutout: { src: `${P}/blood-moon-cathedral-tee-cutout-1200.webp`, alt: "Blood Moon oversized tee — gothic cathedral under a red moon", width: 1200, height: 1147, kind: "cutout" },
    images: [
      { src: `${P}/blood-moon-cathedral-tee-cutout-1200.webp`, alt: "Blood Moon oversized tee, front", width: 1200, height: 1147, kind: "cutout" },
      { src: `${P}/blood-moon-cathedral-tee-1600.webp`, alt: "Blood Moon oversized tee on the studio backdrop", width: 1600, height: 1600, kind: "image" },
      { src: `${P}/blood-moon-detail-moon-1080.webp`, alt: "Blood Moon — close-up of the red moon and spires", width: 1080, height: 1080, kind: "detail" },
      { src: `${P}/blood-moon-detail-cathedral-1080.webp`, alt: "Blood Moon — close-up of the crystal-traced cathedral", width: 1080, height: 1080, kind: "detail" },
    ],
    video: null,
  },
  {
    id: "rugged-boy-velvet",
    slug: "rugged-boy-velvet-full-sleeve-tee",
    name: "Rugged Boy Velvet",
    short: "Crystal portrait on black velvet. Full sleeve.",
    description: [
      "The face of the brand, set in red and silver crystals on black velvet. This is the piece the drop is named for.",
      "Full sleeves, ribbed cuffs, and a velvet hand that looks expensive under any light.",
    ],
    categories: ["t-shirts", "limited-edition", "new-arrivals"],
    drop: "rugged-boyz",
    pricePaise: rupees(799),
    salePricePaise: null,
    isNew: true,
    isLimited: true,
    isFeatured: true,
    isCustomisable: false,
    fabric: "Cotton, polyester",
    gsm: 250,
    fit: null,
    details: ["Full-hand velvet", "Crystal-detailed portrait", "Ribbed cuffs"],
    colours: [{ name: "Black", hex: "#0c0c0e" }],
    sizes: [...SIZES],
    variants: variants("RUGGEDVLV", "Black", "BLK"),
    cutout: null,
    images: [
      { src: `${P}/velvet-portrait-longsleeve-1600.webp`, alt: "Rugged Boy velvet full-sleeve tee, front", width: 1600, height: 1600, kind: "image" },
      { src: `${P}/velvet-detail-portrait-1080.webp`, alt: "Rugged Boy velvet — close-up of the crystal portrait", width: 1080, height: 1080, kind: "detail" },
      { src: `${P}/velvet-detail-sleeve-1080.webp`, alt: "Rugged Boy velvet — macro of velvet sleeve and cuff", width: 1080, height: 1080, kind: "detail" },
      { src: `${P}/velvet-detail-profile-1080.webp`, alt: "Rugged Boy velvet — side profile", width: 1080, height: 1080, kind: "detail" },
    ],
    video: { desktop: "/media/campaign/velvet-1080.mp4", mobile: "/media/campaign/velvet-720.mp4", mobileWebm: "/media/campaign/velvet-720.webm", poster: "/media/campaign/velvet-poster.jpg" },
  },
];

export const drops: Drop[] = [
  {
    slug: "rugged-boyz",
    number: "01",
    name: "Rugged Boyz",
    status: "live",
    launchAt: null, // PLACEHOLDER — set the official launch date
    headline: "Rugged Boyz.",
    intro: "Drop 01. Stone angels, blood moons and the face behind the brand, set in crystal on black.",
    story: [
      "Rugged Boyz is where STREEZØWEAR starts. Three pieces, each one built around a single image and finished by hand in crystal.",
      "Heavyweight 250 GSM, washed black and velvet. Limited run. When the run is gone, it's gone.",
    ],
    video: { desktop: "/media/campaign/seraph-1080.mp4", mobile: "/media/campaign/seraph-720.mp4", mobileWebm: "/media/campaign/seraph-720.webm", poster: "/media/campaign/seraph-poster.jpg" },
    stills: [
      { src: "/media/products/lineup-five-tees-1312.webp", alt: "STREEZØWEAR lineup on concrete", width: 1312, height: 1199, kind: "image" },
    ],
    products: ["seraph-oversized-tee", "rugged-boy-velvet-full-sleeve-tee", "blood-moon-oversized-tee"],
    isLimited: true,
  },
];
