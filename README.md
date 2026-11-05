# STREEZØWEAR

**Own your street, define your style.** Premium streetwear ecommerce for STREEZØWEAR, Bangalore.

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Asset audit, design system, architecture | ✅ [`docs/PHASE-1.md`](docs/PHASE-1.md) |
| 2 | Storefront: Next.js, motion, floating showroom, catalogue, drops, customisation UI | ✅ [`docs/PHASE-2.md`](docs/PHASE-2.md) |
| 3 | Supabase schema + RLS, auth, accounts, server cart, inventory, artwork uploads | Next |
| 4 | Razorpay checkout, email, Shiprocket + 60-min partner, tracking | — |
| 5 | Admin dashboard | — |
| 6 | Security hardening & end-to-end tests | — |
| 7 | Production launch | — |

## Run locally

Requires Node 20.9+.

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
npm test             # unit tests
npm run typecheck
npm run build && npm start
```

## Deploy

Vercel, framework **Next.js**. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Where things live

| Path | What |
|---|---|
| `app/(store)/` | Customer-facing pages (home, shop, products, drops, customise, bag, policies) |
| `components/brand` · `motion` · `store` | Logo/loader, floating garment & reveals, commerce UI |
| `lib/catalog/` | Catalogue types, launch data, async query layer (swaps to Supabase in Phase 3) |
| `lib/cart/` | Pure cart rules (stock-clamped) + browser store |
| `lib/config/business.ts` | Business details & policy values. **Placeholders marked** |
| `lib/delivery/express.ts` | 60-minute zone: origin, radius, PIN allowlist |
| `lib/customise/`, `lib/validation/` | Customisation options + Zod schemas |
| `design/tokens.css` | Brand tokens (source: brand book) |
| `public/brand`, `public/media` | Web-optimised logo, product and film assets |
| `assets/source/` | Untouched originals (not deployed) |
