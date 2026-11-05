# STREEZØWEAR — Phase 1: Asset Audit, Design System & Architecture

Status: **Phase 1 complete. Waiting on the owner's decisions (§9) before Phase 2.**
Nothing here is application code yet. This phase fixes the brand rules, the asset pipeline,
the technical architecture and the data model so later phases do not have to be redone.

Visual proof of direction: [`design/styleboard.html`](../design/styleboard.html)
(serve the repo root over HTTP, e.g. `python3 -m http.server`, then open `/design/styleboard.html`;
the fabric-light mask needs HTTP, not `file://`).

---

## 1. Asset audit

| Asset | What it is | Status | Used for |
|---|---|---|---|
| `STREEZOWEAR_Brand_Book.pdf` (11 pp) | Official brand book, Edition 01, Bangalore 2026 | ✅ Source of truth for colour, type, voice, logo rules | Everything |
| Logo — primary on black (1800², extracted from brand book, unaltered) | Chrome S + bolt, wordmark, tagline lockup | ✅ | Hero, loader, footer, checkout, order confirmation |
| Logo — primary transparent (1800×1456, alpha rebuilt from the PDF's own soft mask) | Print-only per brand book | ⚠️ Print only | Not used on web (kept for DTF/merch) |
| S mark on black (1000²) | Mark | ✅ | Favicon, app icon, loader, social |
| S mark transparent | Print-only | ⚠️ Print only | Neck labels / sleeve prints only |
| Wordmark crop (`public/brand/wordmark*.webp`) | Pixel crop of the official lockup's wordmark row. No redraw, recolour or reshaping | ✅ | Sticky header (brand book permits "wordmark only", min 160 px on screen) |
| `2.webp` Blood Moon cathedral tee (2000²) | Washed-black oversized tee, crystal-detailed red moon + cathedral, grey studio backdrop | ✅ | Product + showroom |
| `3.webp` Seraph angel tee (2000²) | Washed-black oversized tee, crystal-detailed angel/halo, grey backdrop | ✅ | Product + showroom; matches video 1 |
| `4.webp` Velvet portrait long sleeve (2000²) | Black velvet long sleeve, crystal portrait of a man, on black velvet | ⚠️ See §9 (likeness) | Product + showroom; matches video 2 |
| `1.webp` five-tee lineup (1312×1199) | VILLAIN ERA · DOOMSDAY · LUCIFER · APOCALYPSE · REBEL FOREVER on concrete | ⚠️ Composite only | Campaign/editorial image. Each design needs its own photos before it can be sold |
| Video 1 `surreal_product_world_6deab495` (10 s, 1080p24) | Seraph tee floating over fog → macro of crystal wings → floating hero turn | ✅ | Hero film / Seraph drop |
| Video 2 `surreal_product_world_133b03bc` (10 s, 1080p24) | Crystal particles → velvet macro → floating long sleeve → portrait close-ups | ✅ | Velvet drop campaign |

**What the reference films say about the aesthetic.** Garments float alone in a dark, fogged void.
One hard light source, slow camera moves, macro close-ups on the crystal work, red as the only colour.
That is the brief for the floating showroom and the drop pages: *one garment, one light, lots of black.*

**Asset findings to act on**

1. **Generator watermark.** `2/3/4.webp` and both videos carry a small four-point sparkle watermark in
   the bottom-right corner (looks like an AI-image tool mark). The garment cutouts naturally leave it out,
   but the full-frame images and videos still show it. Clean exports are recommended for production.
2. **Backgrounds are not transparent.** Tees sit on a grey gradient (RGB ~63–116). I built a
   cutout prototype (`scripts/assets/cutout_prototype.py`) that subtracts the backdrop per row; results
   in `public/media/products/*-cutout-*.webp` are good enough for direction, with slightly rough edges
   at the shoulders and hem shadow. **For launch, use professional cutouts or shoot on black.**
   The velvet long sleeve is already on near-black, so it is shown with a soft radial edge fade instead.
   Neither method changes the garment's proportions or artwork.
3. **The lineup tees have small neck labels.** At this resolution I can't read them. Confirm they're
   STREEZØWEAR labels, or mockups, before the image goes public.
4. **No hoodie or sweatshirt photography yet.** The category structure supports them, but there's
   nothing to list.

### Web outputs produced (`public/`)

| File | Spec |
|---|---|
| `brand/logo-primary.webp`, `logo-primary-900.webp` | Official lockup on Void |
| `brand/wordmark.webp`, `wordmark-sm.webp` | Header wordmark |
| `brand/s-mark*.png/webp`, `/favicon.ico` | 16/32/48/180/192/512 icon set |
| `media/campaign/{seraph,velvet}-1080.mp4` | H.264, CRF 23, ≤4 Mbps, faststart, **audio stripped** (always muted) |
| `media/campaign/{seraph,velvet}-720.{mp4,webm}` | Mobile: H.264 ≤1.8 Mbps and VP9 |
| `media/campaign/*-poster.jpg` | Poster frames. Also used when reduced motion or data saving is on |
| `media/products/*-{1600,800,400}.webp` | Responsive product images |
| `media/products/*-cutout-{1200,600}.webp` | Transparent garment cutouts for the showroom (prototype quality) |

Originals are kept unchanged in `assets/source/`. In Phase 3 the masters move to Supabase Storage
and `public/media` only holds launch content.

---

## 2. Brand conflicts and how they were resolved

You asked me to follow the brand book. Where the brief and the book disagree, **the book wins**:

| Topic | Project brief | Brand book (used) |
|---|---|---|
| Primary background | `#050505` | **Void `#07070A`**, which also matches the logo files so the lockup's background is invisible |
| Secondary background | `#101010` | **Carbon `#131318`** |
| Neon red | `#FF1744` | **Neon Red `#FF1E3C`** |
| Deep red | `#B00020` | **Blood `#A01529`**: fills only, never text on black |
| Silver | `#C7CBD2` | **Steel `#888C96`** (secondary text) + **Chrome `#E8E8EC`** (primary text) |
| Borders | none | **Gunmetal `#3B3E45`** |
| White | `#F5F5F5` | Chrome `#E8E8EC` is the lightest text colour. Pure white only for highlights inside the chrome gradient |
| Tagline | "OWN YOUR STREET. DEFINE YOUR STYLE." | **"OWN YOUR STREET, DEFINE YOUR STYLE."** The book says "exact wording and punctuation" |
| Name | STREEZOWEAR | **STREEZØWEAR** in headlines and UI; `streezowear` in URLs, handles and SEO slugs |
| Buttons | "subtle red hover" | **Neon-red buttons with black text** (book §08) |

---

## 3. Design system

Tokens: [`design/tokens.css`](../design/tokens.css). Phase 2 maps them into Tailwind's theme so every
utility comes from the same values.

**Colour.** 70% black · 20% chrome · 10% red. Red is the *light source*: outlines, the bolt, primary
buttons, prices, drop callouts, focus rings. Neon glow appears only on red elements and only on black.
Chrome gradient appears only on the logo and big display words.

**Type** (Google Fonts, self-hosted through `next/font`, so there are no layout shift or third-party requests):

| Role | Face | Rules |
|---|---|---|
| Display / headlines | **Archivo 900 Italic** | All caps, −0.02em, line-height 0.92. Drop names, section heads, product names |
| Labels / tagline / sizes / SKUs | **JetBrains Mono 500 Italic** | All caps, 0.2–0.3em tracking. Nav, badges, buttons, sizes, prices |
| Body | **Inter 400 / 600** | Sentence case. Descriptions, policies, forms |

**Shape.** Sharp: 2 px radius, hairline Gunmetal rules, no pill cards and no colourful gradients.
Short red rule-dashes frame labels (`— DROP 01 —`). The bolt slash (a thin diagonal from lower left to
upper right) appears once per layout at most.

**Voice** (book §06). Short, confident, no begging. "New drop. Limited run. Don't sleep."
"Welcome to the street. Wear it loud." No "mega sale", no exclamation marks, minimal emoji.

**Motion language** (from the logo's bolt):

| Pattern | Spec |
|---|---|
| Loader | S mark fades up, the bolt "strikes" left to right (clip-path, 600 ms), then the glow settles. Shown only on first visit per session and skipped if the page is ready within 300 ms |
| Idle float | `translateY` ±10 px, 6 s ease-in-out loop, phases staggered per piece |
| Cursor tilt | ≤ 8° rotateX/Y, smoothed with a spring. Mouse pointers only. Touch uses tap-to-light |
| Fabric light | Red radial light that follows the cursor, **masked to the garment's own silhouette** so it falls on the fabric rather than the background. 0.42 alpha at peak, 700 ms fade. No flashing |
| Lift | translateZ 40 px + 8 px up, shadow shrinks, 1 px red edge glow |
| Reveals | 24 px rise + fade, `ease-out-expo`, once per element |
| Page transitions | 320 ms cross-fade + slight scale. Shared-element morph from showroom piece to product gallery |
| Reduced motion | All of the above off. Videos replaced by posters. Same content |

Proven in the style board: hero over campaign film, sticky header (transparent → Void), three
floating pieces with cursor tilt and fabric light, story chapters, drop countdown, swatches and type.
Mobile at 390 px has no horizontal overflow.

---

## 4. Story framing (homepage narrative)

The homepage reads as a campaign. It's a sequence of chapters, not a product grid:

1. **Hero.** The Seraph film plays behind *OWN YOUR STREET, DEFINE YOUR STYLE.* Primary CTA:
   *Shop the latest drop*.
2. **The showroom.** "Neon on night." Floating pieces, red light on hover, *View product*.
3. **The story.** Four chapters:
   01 *The street*: born in Bangalore, the night city.
   02 *The drop*: every design drops once, limited run.
   03 *Make it yours*: customisation.
   04 *60 minutes*: express delivery in Bangalore.
4. **The drop.** Current or next drop: campaign film (velvet), countdown, *Notify me* or *Shop the drop*.
5. **The craft.** Macro stills from the films (crystal work, washed cotton) next to factual
   fabric and GSM details. **These come from you. I won't invent them.**
6. **Lineup.** Editorial use of the five-tee lineup image, linking to the archive.
7. **Footer.** Full lockup on Void, "Welcome to the street. Wear it loud."

All copy in the style board is marked as sample where it states a fact I don't have
(prices, GSM, delivery zones, customisation scope).

---

## 5. Technical architecture

```
Browser ──► Vercel (Next.js App Router, RSC)
             ├─ Public storefront  (RSC + ISR; client islands for motion, cart, gallery)
             ├─ /admin             (separate route group + layout, server-side role gate, noindex)
             ├─ Route handlers     /api/*  (webhooks, cart, checkout, tracking)
             └─ Server actions     (forms; Zod-validated; CSRF-protected by Next origin check)
                    │
                    ├──► Supabase Postgres  (RLS on every table; SECURITY DEFINER RPCs for stock/orders)
                    ├──► Supabase Auth      (email+password, email verify, reset; Google OAuth optional)
                    ├──► Supabase Storage   (product media, drop media; admin-only writes)
                    ├──► Razorpay           (orders API, Checkout.js, signature verify, webhooks, refunds)
                    ├──► Shipping layer     (ShippingProvider interface)
                    │       ├─ Shiprocket   (serviceability, rates, shipment, AWB, pickup, label, tracking webhooks)
                    │       └─ Hyperlocal   (60-min Bangalore partner — §9)
                    ├──► Email              (Resend recommended; React Email templates)
                    └──► Rate limiting      (Upstash Redis recommended; Postgres fallback)
```

**Stack:** Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · Framer Motion · Supabase
(Postgres, Auth, Storage) · Razorpay · Shiprocket · Resend · Zod · Vitest (unit/integration) ·
Playwright (end-to-end) · Vercel.

### Key commerce flows

**Price and discount truth.** The browser only ever sends `{variantId, qty}` and an optional coupon code.
The server reloads prices, sale prices, coupon rules and shipping from the database and computes totals.
Amounts are stored as integer paise.

**Checkout → payment → order (overselling and duplicate-proof)**

1. `POST /api/checkout`: validate the cart with Zod, then recompute totals. An **idempotency key**
   (per cart revision) means repeated submits return the same pending order.
2. Postgres RPC `reserve_stock(order_id)`: in one transaction, `SELECT … FOR UPDATE` on each variant's
   inventory row, check `on_hand - reserved >= qty`, and increment `reserved`. It fails atomically if
   anything is short. The reservation expires after 15 min.
3. Create the Razorpay order on the server (amount from the database, `receipt = order_number`) and store
   `razorpay_order_id`.
4. The client opens Razorpay Checkout. On the handler callback the server **verifies the HMAC signature**
   (`order_id|payment_id`, key secret). Even then, the order only moves to *Payment confirmed* after
   the server confirms the payment as `captured`, through a webhook or a server-side fetch.
5. `POST /api/webhooks/razorpay`: verify `X-Razorpay-Signature` against the raw body with the webhook
   secret, then insert into `payment_events(event_id UNIQUE)`. A duplicate means the event was already
   processed, and the handler returns 200 and does nothing. `payment.captured` runs `commit_stock`
   (reserved → sold, ledger rows), marks the order paid and sends the confirmation email exactly once.
6. **Failed or cancelled payments** release the reservation. **Late capture after the reservation
   expired**: stock is re-checked. If it's no longer available, the order is flagged and an automatic
   refund starts, logged for the admin. A scheduled job (Vercel Cron) releases expired reservations
   and reconciles orders still pending payment against the Razorpay API.
7. **COD** (if enabled): the same reservation goes straight to *Order placed (COD)*, with optional
   OTP or phone confirmation and per-PIN or per-amount caps set in admin.

**Guest cart.** An opaque 128-bit cart ID in an `HttpOnly; Secure; SameSite=Lax` signed cookie, with the
cart stored on the server. On login the guest cart merges into the account cart.

**Public tracking.** Order number + email or phone must both match. The lookup is rate-limited per
IP and per order number and returns the same generic error for "not found" and "wrong contact".
Order numbers are non-sequential (`SZW-` + date + random base32) so they can't be enumerated.
The response shows status and courier events, never the full address.

**Admin.** A separate `(admin)` route group. Middleware and every server action check
`has_role('admin')` against `user_roles` in the database, never a client flag. There is no
signup route. The first admin is created with `pnpm admin:provision` (server-only script, service-role
key, reads `ADMIN_EMAIL`, sends an invite). Admin sessions have a shorter idle timeout. Every admin
mutation writes to `audit_log` (actor, action, entity, before/after diff, IP).

---

## 6. Proposed folder structure

```
streezowear/
├─ app/
│  ├─ (store)/                    # customer-facing site, shared header/footer
│  │  ├─ page.tsx                 # cinematic homepage
│  │  ├─ shop/[[...category]]/    # catalogue + category filters
│  │  ├─ products/[slug]/         # SEO product pages (+ opengraph-image.tsx, JSON-LD)
│  │  ├─ drops/  drops/[slug]/    # drop index + editorial drop landing
│  │  ├─ customise/               # customisation flow (scope per §9)
│  │  ├─ cart/  checkout/  order/[number]/confirmed/
│  │  ├─ track/                   # public order tracking
│  │  ├─ account/(orders|addresses|wishlist|profile)/
│  │  ├─ auth/(sign-in|sign-up|verify|reset|callback)/
│  │  └─ (pages)/about|contact|faq|size-guide|shipping|returns|privacy|terms/
│  ├─ (admin)/admin/              # owner control centre — noindex, role-gated layout
│  │  ├─ page.tsx                 # overview + charts
│  │  ├─ products/ drops/ inventory/ orders/ customers/ discounts/ reports/ settings/ audit/
│  ├─ api/
│  │  ├─ webhooks/razorpay/route.ts
│  │  ├─ webhooks/shiprocket/route.ts
│  │  ├─ checkout/route.ts  cart/route.ts  track/route.ts
│  │  └─ cron/(release-reservations|reconcile-payments|publish-drops)/route.ts
│  ├─ sitemap.ts  robots.ts  layout.tsx  globals.css
├─ components/
│  ├─ brand/        # Logo, Loader, BoltSlash, RuleLabel
│  ├─ motion/       # FloatingGarment, FabricLight, Reveal, PageTransition
│  ├─ store/        # Header, ProductCard, Gallery, SizePicker, CartDrawer, DropHero, Countdown
│  ├─ checkout/     # Steps, AddressForm, ShippingOptions, RazorpayButton
│  ├─ admin/        # DataTable, StatCard, Charts, MediaUploader, VariantGrid
│  └─ ui/           # Button, Input, Select, Dialog, Toast, Badge (token-driven primitives)
├─ lib/
│  ├─ db/           # typed Supabase clients: browser (anon), server (user session), admin (service — server-only)
│  ├─ auth/         # session helpers, requireUser, requireAdmin
│  ├─ catalog/  cart/  pricing/  discounts/  inventory/  orders/   # business logic (pure, tested)
│  ├─ payments/razorpay/          # orders, signature verify, webhook handlers, refunds
│  ├─ shipping/                   # ShippingProvider interface, shiprocket/, hyperlocal/
│  ├─ email/                      # Resend client + React Email templates
│  ├─ security/                   # rate-limit, csp, upload validation, idempotency
│  ├─ validation/                 # Zod schemas shared by client & server
│  └─ config/                     # env (Zod-parsed, server/client split), business settings
├─ supabase/
│  ├─ migrations/                 # SQL: schema, RLS policies, RPCs, triggers
│  ├─ seed.sql                    # clearly-labelled SAMPLE catalogue
│  └─ tests/                      # pgTAP RLS/permission tests
├─ scripts/  admin-provision.ts  assets/
├─ design/   tokens.css  styleboard.html
├─ public/   brand/  media/
├─ tests/    unit/  integration/  e2e/
├─ docs/     PHASE-1.md  SETUP.md  DEPLOYMENT.md
├─ README.md  SECURITY.md  .env.example  middleware.ts  next.config.ts
```

---

## 7. Data model (Phase 3 migrations)

```
profiles(id→auth.users, full_name, phone, marketing_opt_in)
user_roles(user_id, role ∈ {admin, staff})                 -- admin-only writes; no self-assignment
addresses(id, user_id, name, phone, house, street, locality, city, state, pin, landmark, is_default)

categories(id, slug, name, parent_id, sort, is_active)
products(id, slug UNIQUE, name, description, fabric, gsm, fit, care, base_price_paise,
         sale_price_paise, status ∈ {draft, published, archived}, is_featured, is_limited,
         is_customisable, seo_title, seo_description, published_at)
product_categories(product_id, category_id)
product_media(id, product_id, kind ∈ {image, video, cutout}, url, alt, sort, colour)
product_variants(id, product_id, sku UNIQUE, size, colour, price_override_paise, is_active)
inventory(variant_id PK, on_hand ≥ 0, reserved ≥ 0, low_stock_threshold, CHECK reserved ≤ on_hand)
inventory_ledger(id, variant_id, delta, reason ∈ {restock, sale, reservation, release, adjust, return},
                 order_id, actor_id, note, created_at)        -- append-only

drops(id, slug, name, description, launch_at, status ∈ {draft, scheduled, live, archived},
      hero_video_desktop, hero_video_mobile, poster, is_limited)
drop_media(id, drop_id, kind, url, alt, sort)   drop_products(drop_id, product_id, sort)

carts(id, user_id NULL, token_hash NULL, coupon_id, updated_at)
cart_items(cart_id, variant_id, qty, customisation_json)
wishlists(user_id, product_id)
reviews(id, product_id, user_id, order_item_id, rating, body, status ∈ {pending, approved, hidden})

coupons(id, code UNIQUE, kind ∈ {percent, fixed, free_shipping}, value, min_cart_paise,
        first_order_only, drop_id, starts_at, ends_at, max_redemptions, per_customer_limit, is_active)
coupon_redemptions(coupon_id, order_id, user_id, email_hash)

orders(id, order_number UNIQUE, user_id NULL, email, phone, status, payment_status,
       fulfilment_status, shipping_method ∈ {standard, express_60}, address_snapshot jsonb,
       subtotal, discount, shipping, total (paise), idempotency_key UNIQUE, reserved_until, created_at)
order_items(order_id, variant_id, sku, name_snapshot, size, colour, unit_price_paise, qty, customisation_json)
order_status_history(order_id, from, to, actor_id, note, created_at)
payments(id, order_id, provider, provider_order_id UNIQUE, provider_payment_id UNIQUE, method, status, amount, raw)
payment_events(event_id PK, type, payload, processed_at)      -- webhook idempotency
refunds(id, payment_id, provider_refund_id, amount, status, reason, actor_id)
shipments(id, order_id, provider, awb, courier, label_url, pickup_at, status, tracking_url)
shipment_events(id, shipment_id, provider_event_id UNIQUE, status, location, occurred_at)

customisation_options(...)  customisation_assets(...)          -- shape depends on §9 decision
delivery_zones(pin, express_enabled, cutoff_local_time, fee_paise)
business_settings(key PK, value jsonb)                          -- COD toggle, policies, contact info
audit_log(id, actor_id, action, entity, entity_id, diff jsonb, ip, created_at)
```

**RLS outline.** Customers can `select` and `update` only their own profile, addresses, wishlist,
carts and reviews, and can `select` only their own orders, order items and shipments. They can't
write to orders directly; all order writes go through server code. Catalogue tables are publicly
readable only where `status='published'`. Everything else is admin-only through `has_role()`.
`inventory`, `payments`, `payment_events` and `audit_log` have no client access at all.
pgTAP tests prove each policy, both allowed and denied.

---

## 8. Integrations — what each needs

| Integration | Needed from you | Built as |
|---|---|---|
| Supabase | Project URL, anon key, service-role key (server only), DB password | Migrations + RLS + Storage buckets |
| Razorpay | Test key ID + secret, webhook secret; later live keys and KYC-activated account | Orders API, Checkout, verify, webhooks, refunds |
| Shiprocket | API user email + password (API user, not the main login), pickup location name/address | Provider adapter, rates, shipments, tracking webhook |
| 60-min hyperlocal | Provider choice + API access (§9) | `ShippingProvider` adapter |
| Email (Resend) | API key + verified sending domain (DNS) | Order, shipping and auth emails |
| Rate limit (Upstash) | Redis REST URL + token | Auth, checkout, tracking, coupon endpoints |
| Google login (optional) | OAuth client in Google Cloud | Supabase Auth provider |
| Domain | Registrar access | Vercel + email DNS |

No integration will be called "production-ready" until it has been tested against the real service.

---

## 9. Decisions needed from you before Phase 2/3

1. **60-minute delivery.** Which areas (PIN list or radius from your dispatch point), operating hours
   and order cut-off, fee, and which partner? Standard Shiprocket couriers can't promise 60 minutes.
   That needs a hyperlocal rider partner. Shiprocket offers a hyperlocal product; Porter, Borzo and
   similar have APIs too. Verify the current API availability with your account manager. Until then I
   build it behind the `ShippingProvider` interface, gated by `delivery_zones`, and it's shown only for
   serviceable PINs, only while in stock locally, and only before the cut-off.
2. **Customisation scope.** (a) Name or text on set placements, priced add-on, or (b) customers upload
   their own artwork for admin review and a quote, or (c) both. This decides the data model,
   upload security (b needs file scanning and moderation), made-to-order stock handling and a
   no-returns policy for custom pieces.
3. **Velvet portrait long sleeve.** The print shows a realistic man's face. Is this a real person? If so,
   confirm you hold the rights to sell merchandise with their likeness.
4. **Catalogue facts per product:** price, sizes, colours, stock per size, fabric, GSM, fit, care,
   and which drop each belongs to. I will not invent these.
5. **Drop names.** I've used *Drop 01 = Seraph / Blood Moon* and *Drop 02 = Velvet* as placeholders.
   Tell me the real drop names and launch dates.
6. **Business details for policy pages:** legal entity name, GSTIN, registered address, support email
   and phone, return window, exchange vs refund, COD on or off (and any COD fee or limits).
7. **Asset upgrades:** clean, watermark-free product renders (ideally transparent PNG or shot on black,
   with front/back/detail angles per product), plus the five lineup designs photographed individually.

---

## 10. What Phase 2 will do

Scaffold the Next.js app with the token-driven Tailwind theme, self-hosted fonts and CSP headers.
Then build the header, logo loader, cinematic hero, the floating showroom as Framer Motion components
(spring-smoothed tilt, fabric light, touch tap-to-light, reduced motion), product cards, the product
page (gallery, zoom, video, variants), the catalogue, the drop landing page, story chapters, the mobile
menu and mobile layouts. All of it runs on a clearly labelled **sample** catalogue built from the four
supplied garments, structured to swap straight to the database in Phase 3.
