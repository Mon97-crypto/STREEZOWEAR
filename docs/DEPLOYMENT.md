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

## Realistic try-on (AI)

The instant try-on works with no setup. The "Make it realistic" step stays hidden until these are set in
**Vercel → Settings → Environment Variables** (Production), followed by a redeploy:

| Variable | Value |
|---|---|
| `TRYON_AI_ENABLED` | `true` |
| `REPLICATE_API_TOKEN` | from replicate.com → Account → API tokens (server-only; never `NEXT_PUBLIC_`) |
| `REPLICATE_TRYON_MODEL` | optional. Default `prunaai/p-image-try-on`, the best of four official models we compared (face, pose and background kept; ~3–5 s per run) |
| `REPLICATE_TRYON_INPUTS` | only if you switch to a model with different input names (a name ending `[]` is sent as a list) |
| `TRYON_PER_IP_PER_HOUR` / `TRYON_DAILY_LIMIT` | optional caps (default 5 per visitor per hour, 200 per day per server instance) |

**Model choice.** Compared on the same photo and tee: `prunaai/p-image-try-on` (best), `google/nano-banana`
(good, kept the undershirt, changed framing), `bytedance/seedream-4` and `flux-kontext-apps/multi-image-kontext-pro`
(both changed the face). If you switch, choose a model licensed for commercial use. Many popular open try-on models (e.g. IDM-VTON) are licensed for
non-commercial use only. Check the model page's licence before going live, and set a spending limit in Replicate's
billing settings.

**Data:** the photo is held only in memory for the request and never logged or stored. Replicate deletes API
inputs, outputs and logs about an hour after each job (replicate.com/docs/topics/predictions/data-retention).
Each try-on is billed by Replicate per run. The site starts the job and checks back every 2 s (up to 2 min), so a slow
queue never hits Vercel's function time limit; abandoned jobs are cancelled.
