# Deployment: Vercel

## Current (Phase 2: storefront, no secrets needed)

1. Vercel → your project → **Settings → Build & Deployment**:
   - **Framework Preset:** Next.js (also pinned in `vercel.json`)
   - **Build Command / Output Directory / Install Command:** leave every override **off**.
     If you set Output Directory during the earlier static deploy, switch the override off now. Otherwise
     the Next.js build output won't be found.
   - **Node.js version:** 20.x or 22.x
2. **Settings → Environment Variables** (Production and Preview):
   - `NEXT_PUBLIC_SITE_URL` = your live URL, e.g. `https://streezowear.vercel.app` (later your domain)
   - `NEXT_PUBLIC_SITE_INDEXABLE` = `false` until launch. Every page sends `noindex` and robots.txt disallows all.
     Set it to `true` on launch day and redeploy.
3. Push to the production branch, or **Deployments → ⋯ → Redeploy**.

Security headers (CSP, HSTS, frame denial, nosniff, referrer and permissions policy) are set in
`next.config.ts` and apply on Vercel automatically.

## Custom domain

**Settings → Domains → Add**, then copy the DNS records Vercel shows into your registrar. Update
`NEXT_PUBLIC_SITE_URL` to the domain and redeploy.

## Later phases (secrets)

Secrets go in Vercel Environment Variables only, never in the repository. See `.env.example`.
Anything without the `NEXT_PUBLIC_` prefix stays on the server. Never add that prefix to
`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` or courier credentials.
Full Supabase, Razorpay, Shiprocket and email setup will be documented here in Phases 3–4.
