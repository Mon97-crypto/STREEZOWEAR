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
 * Drop 01 — The Origin Collection. Oversized tees with a chest hit, a full back graphic and a sleeve print.
 * Images are split from the owner's product sheets (scripts/assets/split_sheets.py), ~560–770 px per view.
 * Add a piece: drop its views into public/media/products as <id>-<view>.webp and add a spec below.
 */
type View = "back" | "front" | "side" | "label" | "detail-face" | "detail-wing" | "detail-label";
type DropSpec = {
  id: string; name: string; tags: string; short: string; line: string;
  colour: Colour; code: string; cc: string;
  /** views in gallery order; the first is the face on the rack */
  views: [View, number, number][];
};

const VIEW_LABEL: Record<View, string> = {
  back: "back", front: "front", side: "sleeve", label: "folded, neck label",
  "detail-face": "close-up of the print", "detail-wing": "close-up of the wing", "detail-label": "close-up of the neck label",
};

const DROP01: DropSpec[] = [
  {
    id: "redline", name: "Redline", tags: "Racing / Tokyo / Night",
    short: "Red-eyed racer, blood moon. Oversized tee.",
    line: "A red-eyed racer with レッドライン down the chest; on the back, a black street car under a blood moon, pagoda and cherry blossom, with 赤線 REDLINE in brush script.",
    colour: { name: "Red", hex: "#d4141e" }, code: "REDLINE", cc: "RED",
    views: [["back", 769, 780], ["front", 762, 927]],
  },
  {
    id: "violet-oni", name: "Violet Oni", tags: "Demon / Myth / Fire",
    short: "Horned oni in violet fire. Oversized tee.",
    line: "A horned oni with burning yellow eyes, hands pressed together in violet flame across the back, with violet fire running up the front and sleeve.",
    colour: { name: "Purple", hex: "#4b1d8f" }, code: "VIOLETONI", cc: "PRP",
    views: [["back", 562, 599], ["front", 596, 606], ["side", 231, 614], ["label", 498, 503]],
  },
  {
    id: "tokyo-speed-demon", name: "Tokyo Speed Demon", tags: "Racing / Tokyo / Street culture",
    short: "Night racer, car 07. Oversized tee.",
    line: "A spiky-haired racer and his 07 car tearing through Tokyo, chequered flags and 東京 across the back, 07 on the chest.",
    colour: { name: "Orange", hex: "#e8601c" }, code: "SPEEDDEMON", cc: "ORG",
    views: [["back", 571, 591], ["front", 604, 590], ["side", 227, 596], ["label", 502, 510]],
  },
  {
    id: "main-character-energy", name: "Main Character Energy", tags: "Anime pop / Gen Z / Bold",
    short: "Pink shades, bubblegum, neon stars. Oversized tee.",
    line: "Pink shades, a bubblegum pop and blue lightning, with ヒーロー across the top of the back and a neon star on the chest and sleeve.",
    colour: { name: "Cobalt Blue", hex: "#1f3fd1" }, code: "MAINCHAR", cc: "CBLT",
    views: [["back", 563, 606], ["front", 606, 607], ["side", 225, 608], ["label", 505, 492]],
  },
  {
    id: "the-last-hero", name: "The Last Hero", tags: "Superhero / Origin / Rebellion",
    short: "Lone vigilante under a blood moon. Oversized tee.",
    line: "A lone caped figure against a blood moon over a burning skyline, THE LAST HERO slashed across the back, red thorns up the front.",
    colour: { name: "Cream", hex: "#e8e0d0" }, code: "LASTHERO", cc: "CRM",
    views: [["back", 563, 608], ["front", 611, 616], ["side", 229, 614], ["label", 491, 492]],
  },
  {
    id: "fallen-angel", name: "Fallen Angel", tags: "Myth / Fallen / Gothic",
    short: "Crowned stone face, falling angel. Oversized tee.",
    line: "A cracked stone face under a spiked crown on the front; on the back, a winged figure falling through red and black brushwork.",
    colour: { name: "Red / Black", hex: "#8c0f17" }, code: "FALLEN", cc: "RDBK",
    views: [["back", 629, 729], ["front", 621, 736], ["detail-face", 497, 393], ["detail-wing", 371, 393], ["detail-label", 350, 393]],
  },
  {
    id: "ronin", name: "Ronin", tags: "Samurai / Blade / Ink",
    short: "Masked samurai, drawn blade. Oversized tee.",
    line: "A masked samurai with a drawn blade in black ink across the back, black slashes running across the front and sleeve.",
    colour: { name: "Red", hex: "#d0141c" }, code: "RONIN", cc: "RED",
    views: [["back", 570, 607], ["front", 604, 607], ["side", 235, 614], ["label", 501, 490]],
  },
  {
    id: "neon-run", name: "Neon Run", tags: "Racing / City / Night",
    short: "Street car under a neon skyline. Oversized tee.",
    line: "A street car on wet tarmac under a neon skyline and an orange moon on the back, blue and white flame slashes across the front and sleeves.",
    colour: { name: "Orange", hex: "#e0561a" }, code: "NEONRUN", cc: "ORG",
    views: [["back", 479, 473], ["front", 477, 472], ["side", 222, 522], ["label", 557, 495]],
  },
];

const dropMedia = (t: DropSpec, [v, w, h]: [View, number, number]): Media => ({
  src: `${P}/${t.id}-${v}.webp`, alt: `${t.name} oversized tee, ${VIEW_LABEL[v]}`, width: w, height: h,
  kind: v.startsWith("detail") ? "detail" : "cutout",
});

const drop01Products: Product[] = DROP01.map((t) => ({
  id: t.id,
  slug: `${t.id}-oversized-tee`,
  name: t.name,
  short: t.short,
  description: [t.line, `${t.tags}. Drop shoulders, a boxy fit that hangs right.`],
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
  details: ["Back graphic", "Chest print", "Sleeve print", "Ribbed crew neck"],
  colours: [t.colour],
  sizes: [...SIZES],
  variants: variants(t.code, t.colour.name, t.cc),
  cutout: dropMedia(t, t.views[0]!),
  images: t.views.map((v) => dropMedia(t, v)),
  video: null,
}));

products.push(...drop01Products);

export const drops: Drop[] = [
  {
    slug: "origin-collection",
    number: "01",
    name: "The Origin Collection",
    status: "live",
    launchAt: null, // PLACEHOLDER — set the official launch date
    headline: "The Origin Collection.",
    intro: "Drop 01. Racers, demons, ronin, fallen angels and heroes. Eight stories, printed big on the back.",
    story: [
      "The Origin Collection is where STREEZØWEAR starts. Every piece is built around one character and one story, printed big on the back.",
      "Heavyweight 250 GSM oversized tees in red, purple, orange, cobalt and cream. A hit on the chest, a print on the sleeve. Limited run. When it's gone, it's gone.",
    ],
    video: null,
    heroArt: DROP01.map((t) => ({ ...dropMedia(t, t.views[0]!), alt: "" })),
    stills: [],
    products: DROP01.map((t) => `${t.id}-oversized-tee`),
    isLimited: true,
  },
];
