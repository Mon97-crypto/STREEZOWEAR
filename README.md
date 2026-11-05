# STREEZØWEAR

**Own your street, define your style.** Premium streetwear ecommerce platform for STREEZØWEAR (Bangalore).

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Asset audit, design system, architecture | ✅ Done. See [`docs/PHASE-1.md`](docs/PHASE-1.md) |
| 2 | Storefront experience (Next.js, motion, floating showroom) | Waiting on Phase 1 decisions |
| 3 | Supabase schema, RLS, auth, cart, inventory | — |
| 4 | Razorpay, checkout, email, Shiprocket, tracking | — |
| 5 | Admin dashboard | — |
| 6 | Security & automated tests | — |
| 7 | Deployment | — |

## Repository layout (so far)

- `assets/source/`: untouched originals (brand book, logos extracted from it, product photos, campaign films)
- `public/brand`, `public/media`: web-optimised derivatives (WebP, H.264/VP9, posters, favicon set)
- `design/tokens.css`: brand design tokens (source: brand book)
- `design/styleboard.html`: interactive visual direction (serve repo root over HTTP to view)
- `scripts/assets/`: asset pipeline scripts
