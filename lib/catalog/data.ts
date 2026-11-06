/**
 * Launch catalogue (Phase 2 static source).
 * Facts supplied by the owner: ₹499 tees, sizes S–XL, 15 units per size, cotton/polyester, 250 GSM.
 * Drop 01 is "The Origin Collection" — the only line in the shop right now.
 * The velvet portrait piece is a customisation example: never sold, never on the rack.
 * Product names and descriptive copy are written from the artwork and can be renamed. Phase 3 replaces this module with Supabase queries behind lib/catalog/queries.ts.
 */
import type { Category, Colour, Drop, Media, Product, Variant, Video } from "./types";
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

/** Sellable products. Drop 01 (The Origin Collection) is appended below. */
export const products: Product[] = [];

/**
 * Customisation example ("One of One"): the owner's crystal portrait on black velvet.
 * Shown in the One of One section and on /customise only. Not a product, not on the rack.
 */
export const customExample: { name: string; video: Video; images: Media[] } = {
  name: "One of One — velvet portrait",
  video: { desktop: "/media/campaign/velvet-1080.mp4", mobile: "/media/campaign/velvet-720.mp4", mobileWebm: "/media/campaign/velvet-720.webm", poster: "/media/campaign/velvet-poster.jpg" },
  images: [
    { src: `${P}/velvet-portrait-longsleeve-1600.webp`, alt: "Custom example: crystal portrait on a black velvet full-sleeve tee", width: 1600, height: 1600, kind: "image" },
    { src: `${P}/velvet-detail-portrait-1080.webp`, alt: "Custom example: close-up of the crystal portrait", width: 1080, height: 1080, kind: "detail" },
    { src: `${P}/velvet-detail-sleeve-1080.webp`, alt: "Custom example: velvet sleeve and cuff", width: 1080, height: 1080, kind: "detail" },
  ],
};

/** The brand film used behind the homepage hero (mood, not a product listing). */
export const brandFilm: Video = { desktop: "/media/campaign/seraph-1080.mp4", mobile: "/media/campaign/seraph-720.mp4", mobileWebm: "/media/campaign/seraph-720.webm", poster: "/media/campaign/seraph-poster.jpg" };

/**
 * Drop 01 — The Origin Collection. Five oversized tees: logo on the front, full graphic on the back,
 * hit on the sleeve. Images are cut from the owner's collection boards (~300 px per view for now).
 */
type OriginSpec = {
  id: string; no: string; name: string; tags: string; short: string; line: string;
  colour: Colour; code: string; cc: string;
  sizes: Record<"front" | "back" | "side" | "art" | "detail", [number, number]>;
};

const ORIGIN: OriginSpec[] = [
  {
    id: "the-final-form", no: "01", name: "The Final Form", tags: "Anime / Transformation / Power",
    short: "Lightning-eyed transformation. Oversized tee.",
    line: "A white-haired fighter mid-transformation, blue lightning tearing through the back with 最終形態 running down the side.",
    colour: { name: "Black", hex: "#0c0c0e" }, code: "FINALFORM", cc: "BLK",
    sizes: { front: [292, 282], back: [299, 284], side: [146, 292], art: [479, 214], detail: [310, 214] },
  },
  {
    id: "the-last-hero", no: "02", name: "The Last Hero", tags: "Superhero / Origin / Rebellion",
    short: "Lone vigilante under a blood moon. Oversized tee.",
    line: "A lone caped figure against a blood moon over a burning skyline, THE LAST HERO slashed across the back.",
    colour: { name: "Cream", hex: "#e8e0d0" }, code: "LASTHERO", cc: "CRM",
    sizes: { front: [301, 283], back: [306, 284], side: [142, 285], art: [479, 233], detail: [310, 233] },
  },
  {
    id: "tokyo-speed-demon", no: "03", name: "Tokyo Speed Demon", tags: "Racing / Tokyo / Street culture",
    short: "Night racer, car 07. Oversized tee.",
    line: "A goggled racer and his 07 car tearing through Tokyo, chequered flags and 東京 across the back.",
    colour: { name: "Orange", hex: "#e8601c" }, code: "SPEEDDEMON", cc: "ORG",
    sizes: { front: [300, 276], back: [308, 275], side: [143, 277], art: [479, 222], detail: [310, 222] },
  },
  {
    id: "the-dark-side", no: "04", name: "The Dark Side", tags: "Gothic / Supernatural / Fallen",
    short: "Fallen angel, red halo. Oversized tee.",
    line: "A fallen angel with torn black wings under a red halo, THE DARK SIDE dripping beneath it.",
    colour: { name: "White", hex: "#f2f0ec" }, code: "DARKSIDE", cc: "WHT",
    sizes: { front: [290, 276], back: [311, 278], side: [137, 279], art: [479, 226], detail: [310, 226] },
  },
  {
    id: "main-character-energy", no: "05", name: "Main Character Energy", tags: "Anime pop / Gen Z / Bold",
    short: "Pink shades, bubblegum, neon stars. Oversized tee.",
    line: "Pink shades, a bubblegum pop and neon stars, with ヒーロー across the top of the back.",
    colour: { name: "Cobalt Blue", hex: "#1f3fd1" }, code: "MAINCHAR", cc: "CBLT",
    sizes: { front: [301, 284], back: [305, 286], side: [140, 287], art: [479, 235], detail: [310, 235] },
  },
];

const originProducts: Product[] = ORIGIN.map((t) => {
  const m = (view: keyof OriginSpec["sizes"], alt: string, kind: Media["kind"]): Media => ({
    src: `${P}/${t.id}-${view}.webp`, alt, width: t.sizes[view][0], height: t.sizes[view][1], kind,
  });
  return {
    id: t.id,
    slug: `${t.id}-oversized-tee`,
    name: t.name,
    short: t.short,
    description: [t.line, `${t.tags}. Logo on the chest, full graphic on the back, a hit on the sleeve. Drop shoulders, a boxy fit that hangs right.`],
    categories: ["t-shirts", "oversized-t-shirts", "new-arrivals"],
    drop: "origin-collection",
    pricePaise: rupees(499),
    salePricePaise: null,
    isNew: true,
    isLimited: false,
    isFeatured: true,
    isCustomisable: true,
    fabric: "Cotton, polyester",
    gsm: 250,
    fit: "Oversized, drop shoulder",
    details: ["Back graphic", "Chest logo", "Sleeve print", "Ribbed crew neck"],
    colours: [t.colour],
    sizes: [...SIZES],
    variants: variants(t.code, t.colour.name, t.cc),
    cutout: m("back", `${t.name} oversized tee, back graphic`, "cutout"),
    images: [
      m("back", `${t.name} oversized tee, back`, "cutout"),
      m("front", `${t.name} oversized tee, front`, "cutout"),
      m("side", `${t.name} oversized tee, sleeve`, "cutout"),
      m("detail", `${t.name}: print close-up`, "detail"),
      m("art", `${t.name}: the artwork. ${t.tags}`, "image"),
    ],
    video: null,
  };
});

products.push(...originProducts);

export const drops: Drop[] = [
  {
    slug: "origin-collection",
    number: "01",
    name: "The Origin Collection",
    status: "live",
    launchAt: null, // PLACEHOLDER — set the official launch date
    headline: "The Origin Collection.",
    intro: "Drop 01. Five stories, five tees: the final form, the last hero, a Tokyo speed demon, the dark side and main character energy.",
    story: [
      "The Origin Collection is where STREEZØWEAR starts. Five characters, each with their own story, printed big on the back.",
      "Heavyweight 250 GSM oversized tees in black, cream, orange, white and cobalt. Logo on the chest, a hit on the sleeve. Limited run. When it's gone, it's gone.",
    ],
    video: null,
    heroArt: ORIGIN.map((t) => ({ src: `${P}/${t.id}-detail.webp`, alt: "", width: t.sizes.detail[0], height: t.sizes.detail[1], kind: "detail" as const })),
    stills: ORIGIN.map((t) => ({ src: `${P}/${t.id}-art.webp`, alt: `${t.no} ${t.name}: ${t.tags}`, width: t.sizes.art[0], height: t.sizes.art[1], kind: "image" as const })),
    products: ORIGIN.map((t) => `${t.id}-oversized-tee`),
    isLimited: true,
  },
];
