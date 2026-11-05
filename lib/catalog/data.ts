/**
 * Launch catalogue (Phase 2 static source).
 * Facts supplied by the owner: prices, sizes S–XL, 15 units per size, cotton/polyester, 250 GSM,
 * Drop 01 "Rugged Boyz". Product names and descriptive copy are written from the artwork and can be
 * renamed. Phase 3 replaces this module with Supabase queries behind lib/catalog/queries.ts.
 */
import type { Category, Colour, Drop, Product, Variant } from "./types";
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
    details: ["Hand-finished crystal front graphic", "Washed-black finish", "Ribbed crew neck"],
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
    details: ["Hand-finished crystal front graphic", "Washed-black finish", "Ribbed crew neck"],
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
    details: ["Full-hand velvet", "Hand-finished crystal portrait", "Ribbed cuffs"],
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

/**
 * Lineup tees (owner-supplied 8-tee lineup photo). Same owner facts as the launch tees:
 * ₹499, S–XL, 15 per size, cotton/polyester, 250 GSM. Imagery is cut from a single group shot,
 * so each piece currently has one view; individual photos will replace these.
 */
type LineupSpec = { id: string; name: string; short: string; line: string; colour: Colour; code: string; size: [number, number]; limited?: boolean };

const WASHED_BLACK: Colour = { name: "Washed Black", hex: "#2a2a2e" };
const BLACK: Colour = { name: "Black", hex: "#0c0c0e" };
const OFF_WHITE: Colour = { name: "Off-White", hex: "#e9e4da" };
const BLOOD: Colour = { name: "Blood Red", hex: "#6e0f1c" };

const LINEUP: LineupSpec[] = [
  { id: "villain-era", name: "Villain Era", short: "Stone angel under the gothic crest. Oversized tee.", line: "A stone angel with wings spread wide under a gothic STREEZOWEAR crest, traced in crystal on black.", colour: BLACK, code: "VILLAIN", size: [427, 492] },
  { id: "doomsday", name: "Doomsday", short: "Falling angel in red thorns. Oversized tee.", line: "A falling angel wrapped in red thorns, the gothic crest burning above. Crystal-detailed on off-white.", colour: OFF_WHITE, code: "DOOMSDAY", size: [388, 477] },
  { id: "lucifer", name: "Lucifer", short: "Marble face crowned in thorns. Oversized tee.", line: "A cracked marble face under a crown of thorns, red veins running through the stone. Crystal-detailed on black.", colour: BLACK, code: "LUCIFER", size: [392, 484], limited: true },
  { id: "heaven-falls", name: "Heaven Falls", short: "Winged figure on blood red. Oversized tee.", line: "A winged figure over the gothic crest, crystal lines running down a deep blood-red wash.", colour: BLOOD, code: "HEAVEN", size: [385, 485], limited: true },
  { id: "born-to-sin", name: "Born to Sin", short: "Serpent and winged blade. Oversized tee.", line: "A serpent coiled round a winged blade, set in crystal on off-white.", colour: OFF_WHITE, code: "BORNSIN", size: [427, 489] },
  { id: "paradise-lost", name: "Paradise Lost", short: "Hooded angel in mourning. Oversized tee.", line: "A hooded angel in mourning under a crystal halo and the gothic crest. Black.", colour: BLACK, code: "PARADISE", size: [319, 496] },
  { id: "the-end-is-near", name: "The End Is Near", short: "Cathedral under a blood moon. Oversized tee.", line: "Spires rising under a blood moon beneath the gothic crest, crystal lines through the night sky. Washed black.", colour: WASHED_BLACK, code: "ENDNEAR", size: [439, 498] },
  { id: "no-saints-left", name: "No Saints Left", short: "Gothic cross in thorns. Oversized tee.", line: "A gothic cross wrapped in thorns under the crest, crystal-detailed on off-white.", colour: OFF_WHITE, code: "NOSAINTS", size: [379, 491] },
];

const lineupProducts: Product[] = LINEUP.map((t) => ({
  id: t.id,
  slug: `${t.id}-oversized-tee`,
  name: t.name,
  short: t.short,
  description: [t.line, "Drop shoulders, a boxy fit that hangs right."],
  categories: ["t-shirts", "oversized-t-shirts", "new-arrivals", ...(t.limited ? ["limited-edition"] : [])],
  drop: "rugged-boyz",
  pricePaise: rupees(499),
  salePricePaise: null,
  isNew: true,
  isLimited: !!t.limited,
  isFeatured: true,
  isCustomisable: true,
  fabric: "Cotton, polyester",
  gsm: 250,
  fit: "Oversized, drop shoulder",
  details: ["Hand-finished crystal graphic", "Gothic STREEZOWEAR crest", "Ribbed crew neck"],
  colours: [t.colour],
  sizes: [...SIZES],
  variants: variants(t.code, t.colour.name, t.colour.name === "Off-White" ? "OWHT" : t.colour.name === "Blood Red" ? "BLD" : t.colour.name === "Black" ? "BLK" : "WBLK"),
  cutout: { src: `${P}/${t.id}-cutout.webp`, alt: `${t.name} oversized tee — ${t.short.replace(/\. Oversized tee\.$/, "").toLowerCase()}`, width: t.size[0], height: t.size[1], kind: "cutout" },
  images: [
    { src: `${P}/${t.id}-cutout.webp`, alt: `${t.name} oversized tee, front`, width: t.size[0], height: t.size[1], kind: "cutout" },
    { src: `${P}/lineup-eight-tees-1556.webp`, alt: "The STREEZØWEAR lineup: eight crystal-detailed oversized tees", width: 1556, height: 1038, kind: "image" },
  ],
  video: null,
}));

products.push(...lineupProducts);

export const drops: Drop[] = [
  {
    slug: "rugged-boyz",
    number: "01",
    name: "Rugged Boyz",
    status: "live",
    launchAt: null, // PLACEHOLDER — set the official launch date
    headline: "Rugged Boyz.",
    intro: "Drop 01. Stone angels, blood moons, serpents, saints and the face behind the brand, set in crystal.",
    story: [
      "Rugged Boyz is where STREEZØWEAR starts. Eleven pieces, each one built around a single image and hand-finished in crystal.",
      "Heavyweight 250 GSM in black, washed black, off-white, blood red and velvet. Limited run. When the run is gone, it's gone.",
    ],
    video: { desktop: "/media/campaign/seraph-1080.mp4", mobile: "/media/campaign/seraph-720.mp4", mobileWebm: "/media/campaign/seraph-720.webm", poster: "/media/campaign/seraph-poster.jpg" },
    stills: [
      { src: "/media/products/lineup-eight-tees-1556.webp", alt: "The STREEZØWEAR lineup: eight crystal-detailed oversized tees", width: 1556, height: 1038, kind: "image" },
    ],
    products: [
      "seraph-oversized-tee",
      "villain-era-oversized-tee",
      "rugged-boy-velvet-full-sleeve-tee",
      "doomsday-oversized-tee",
      "lucifer-oversized-tee",
      "blood-moon-oversized-tee",
      "heaven-falls-oversized-tee",
      "born-to-sin-oversized-tee",
      "paradise-lost-oversized-tee",
      "the-end-is-near-oversized-tee",
      "no-saints-left-oversized-tee",
    ],
    isLimited: true,
  },
];
