# Phase 2: Storefront experience

## Owner decisions applied

| Decision | Where it lives |
|---|---|
| 60-min delivery: 8–10 km from Muthanallur Cross, Dommasandra | `lib/delivery/express.ts`: radius 10 km, PIN allowlist, haversine check ready for Phase 4 |
| Customisation: both (text on fixed spots + artwork for quote) | `lib/customise/options.ts`, `/customise` |
| Velvet portrait: owner's likeness, rights confirmed | Named **Rugged Boy Velvet**, lead piece of Drop 01 |
| ₹499 tees, ₹799 full-hand velvet; S–XL; 15/size; cotton-polyester; 250 GSM | `lib/catalog/data.ts` (enforced by `tests/unit/catalog.test.ts`) |
| Drop 01: Rugged Boyz | `lib/catalog/data.ts` → `/drops/rugged-boyz` |
| Company "Streezowear", Bangalore, Karnataka, dummy phone | `lib/config/business.ts` |

## What was built

- **Next.js 15 App Router + TypeScript (strict) + Tailwind 4 + Motion.** Fonts are self-hosted
  (Archivo, JetBrains Mono, Inter), and every page is statically prerendered (32 routes).
- **Brand:** logo loader (S mark + bolt strike, first visit per session), sticky header (transparent
  over film, then Void on scroll), full mobile menu, footer lockup.
- **Homepage story:** hero film → showroom → four chapters (street, drop, make it yours, 60 minutes)
  → velvet drop film → craft facts → customise + 60-min PIN check → lineup.
- **Floating showroom (`FloatingGarment`):** idle float, spring-smoothed cursor tilt (≤ 8°), red light
  masked to the garment silhouette, lift and edge glow. On touch screens the piece lights as it reaches
  mid-screen and the light drifts on its own. Reduced motion: static.
- **Catalogue:** `/shop` and 6 category pages with sort, and an honest empty state for hoodies and
  sweatshirts. Badges: New drop, Limited, Out of stock, Sale.
- **Product pages** `/products/[slug]`: gallery (cutout, studio photo, film-frame detail shots, film),
  hover zoom and full-screen zoom, colour and size, per-size stock with "only N left", quantity
  clamped to stock, add to bag with feedback, buy now, wishlist, sticky mobile add-to-bag,
  60-min PIN check, fabric/GSM/fit, shipping and returns, related pieces, reviews section, Product JSON-LD.
- **Drops:** `/drops` index and an editorial `/drops/rugged-boyz` (film hero, story, showroom,
  alternating close-up rows, lineup). Countdown appears automatically for scheduled drops.
- **Customise:** (A) live SVG preview of your text on left chest, upper back or sleeve, in display or
  mono type, chrome or neon. (B) Artwork request form with Zod validation, PNG/JPG/PDF only (no SVG),
  15 MB limit.
- **Bag:** drawer and `/cart`, change size, change quantity, remove. Stock is shared across plain and
  custom lines of the same SKU. Wishlist and search.
- **Pages:** about (from the brand book), contact, FAQs, size guide, shipping, returns, privacy, terms,
  track, account, 404. Policy pages are marked **Draft** and placeholders are visibly dashed.
- **SEO:** unique titles and descriptions, canonical URLs, Open Graph, sitemap.xml, robots.txt.
  **noindex until `NEXT_PUBLIC_SITE_INDEXABLE=true`.**
- **Security headers:** CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.
- **Fixed:** the two campaign films were mislabelled in Phase 1 (seraph ↔ velvet). Names are now correct.

## Update: floating store and street ambience

- **Floating store** (`components/motion/FloatingStore.tsx`) replaces the showroom grid on the homepage,
  modelled on the owner's reference video: garments hang on a slow 3D orbit and overlap like a rack,
  the front piece is largest and catches the red light, back pieces are smaller, dimmer and softly blurred.
  Drag or swipe to spin (with inertia), use the arrows or the keyboard to step, and hover to pause.
  Clicking a piece brings it forward: big floating garment, giant outline name behind it, price, size
  picker, add to bag, view product, previous and next. Escape returns to the rack.
- **Street ambience** (`components/brand/StreetAmbient.tsx`) sits behind every store page: typed neon
  signage ("NEW DROP. LIMITED RUN.", "60 MIN · DOMMASANDRA"…), a blinking REC · LIVE indicator, a live
  Bangalore clock, flickering codes, street glyphs (bolt, crosshair, arrow, barcode, hazard), falling
  red light streaks, a slow scan line, a faint street grid and breathing red haze. On phones only the
  glyphs and light effects show, so text never collides with content. Reduced motion makes it static.

## Update: eight lineup tees added

Villain Era, Doomsday, Lucifer, Heaven Falls, Born to Sin, Paradise Lost, The End Is Near and No Saints Left
are now products in Drop 01 and hang on the floating rack (11 pieces). They use the owner facts: ₹499,
S–XL, 15 per size, cotton-polyester, 250 GSM. Lucifer and Heaven Falls are marked Limited (change in
`lib/catalog/data.ts`).

- Cut from the single 8-tee group photo with `scripts/assets/cutout_lineup8.py` (BiRefNet segmentation on a
  gamma-lifted copy, fabric-colour seam separation, hem hull fill, manual trims). Masters are in
  `assets/source/products/cutouts-lineup8/`.
- **Limits:** each cutout is ~390×490 px, so it's sharp on the rack but soft when enlarged on a product
  page. Where tees overlap in the photo, the hidden sleeve isn't there to recover (Doomsday left,
  Lucifer right, Paradise Lost left). Individual front/back photos of each tee will fix both.

## Update: The Origin Collection, One of One, light theme

- **Drop 01 is now The Origin Collection:** The Final Form, The Last Hero, Tokyo Speed Demon, The Dark Side
  and Main Character Energy (₹499, S–XL, 15/size, cotton-poly 250 GSM). These five are the only pieces on the
  floating rack. Each product has back, front and sleeve cutouts plus the print close-up and artwork panel
  from the collection board (`scripts/assets/cutout_origin.py`). The drop page uses the artwork as its hero
  (no film yet).
- **The older gothic tees** (Seraph, Blood Moon and the 8-tee lineup) were later removed from the shop completely,
  along with their web images (originals kept in `assets/source/`). The five-tee gothic image remains the
  "Next drop" teaser.
- **One of One** replaces the Rugged Boyz section: it's the custom-studio feature, keeping the velvet film. The
  velvet portrait tee is a customisation example only (`customExample` in `lib/catalog/data.ts`): no product
  page, not sellable, not on the rack (enforced by a test). `/customise` is titled One of One and shows it as an
  example.
- **Light/dark theme toggle** in the header (and the mobile menu). Light = white + red: tokens remapped in
  `design/tokens.css`, red deepened to #E3112F for text contrast on white. The choice is saved per browser and
  applied before first paint. The header, footer, loader, homepage hero, One of One and drop heroes stay dark
  (`.sw-dark`), because the official logo must sit on black and the film reads on dark.
- **IP warning:** The Last Hero depicts Batman (cowl and bat emblem). The Final Form and Main Character Energy
  closely resemble existing anime characters. Get legal advice or redesign before selling.

## Update: Drop 01 line-up replaced

The rack and shop now carry only Redline, Violet Oni, Tokyo Speed Demon, Main Character Energy and The Last Hero
(The Origin Collection, ₹499, S–XL ×15, cotton-poly 250 GSM). Images are split from the owner's product sheets
with `scripts/assets/split_sheets.py` (transparent sheets split by alpha; the Redline sheet is on black and is
segmented first). Views are ~560–770 px. Earlier Origin images (Final Form, Dark Side, art/detail panels) are removed.
To add the next pieces: run the script on the new sheet, then add an entry to `DROP01` in `lib/catalog/data.ts`.
"Violet Oni" is a working name.

Later added: Fallen Angel, Ronin and Neon Run (8 pieces). "Fallen Angel", "Ronin" and "Neon Run" are working names.
The Fallen Angel sheet is shot over a red moon and must be split with `:isnet-general-use` (see the script usage).

## Honest limits (by design until later phases)

| Not live yet | Why | Phase |
|---|---|---|
| Checkout button | Needs Razorpay + server-side pricing and stock reservation | 4 |
| Text customisation add-to-bag | Add-on **price not set** (`TEXT_ADDON_PAISE = null`) | when priced |
| Artwork upload submit | Needs private storage, server-side file checks, admin inbox | 3 |
| Accounts, order tracking, reviews | Need Supabase Auth and the database | 3–4 |
| Stock decrements | Stock is the static 15/size until the inventory tables exist | 3 |
| Bag / wishlist | Saved in this browser only; moves server-side with accounts | 3 |

## Tested

- `npm run typecheck`: clean. `npm test`: 20/20 (cart stock rules, catalogue facts, media files exist,
  PIN and radius logic, money formatting, customisation and upload validation).
- `npm run build`: 32 static routes. `npm audit --omit=dev`: 0 vulnerabilities (PostCSS pinned via override).
- Browser (production build): homepage, product, drop, shop, customise, add-to-bag flow, hover light,
  mobile (iPhone 13) home, product and menu. No console errors, no horizontal overflow at 390 px.

## Needed from you

1. **Text customisation price** (add-on per piece) → unlocks custom add-to-bag.
2. **Exact dispatch coordinates** (drop a Google Maps pin) and confirmation of the express PINs
   (562125, 560035, 560087, 560103 are candidates), plus delivery hours and the express fee.
3. **Size chart** (chest, length and shoulder per size) for the size guide.
4. **Return window and COD**: currently placeholders (7 days, COD off).
5. Real **support email, phone, Instagram handle**, and the **Drop 01 launch date** if you want it shown.
6. Rename any product if you prefer: *Seraph*, *Blood Moon*, *Rugged Boy Velvet*.
