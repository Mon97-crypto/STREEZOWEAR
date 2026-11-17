import { aiTryOnEnabled, getProvider, loadGarment } from "@/lib/tryon/ai";
import { TryOnError, type JobState } from "@/lib/tryon/ai/types";
import { clientIp, MAX_AI_PHOTO_BYTES, sameOrigin, sniffImage } from "@/lib/tryon/ai/validate";
import { take } from "@/lib/security/rate-limit";

/**
 * Realistic try-on, in three short calls so no request runs near Vercel's time limit:
 *   POST            start a job (waits up to ~10 s; returns the image if it's already done)
 *   GET  ?id=…      check a running job; returns the image when done
 *   DELETE ?id=…    cancel a job the visitor gave up on
 * The photo lives only in the POST request's memory and is passed straight to the provider.
 * Nothing is written to disk, a database or logs. Replicate deletes inputs and outputs about an hour
 * after each job.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex" };
const fail = (status: number, error: string, extra: Record<string, string> = {}) =>
  Response.json({ error }, { status, headers: { ...NO_STORE, ...extra } });

function reply(state: JobState) {
  if (state.status === "running") return Response.json({ status: "running", id: state.id }, { status: 202, headers: NO_STORE });
  const dataUri = `data:${state.result.mime};base64,${Buffer.from(state.result.bytes).toString("base64")}`;
  return Response.json({ status: "done", image: dataUri }, { headers: NO_STORE });
}

function failure(e: unknown) {
  const code = e instanceof TryOnError ? e.code : "provider_error";
  // log the kind of failure and our own short message (e.g. "Replicate 429"), never the image or the provider's echo of it
  console.error("[try-on] failed:", code, e instanceof TryOnError ? e.message : (e as Error)?.name ?? "error");
  if (code === "timeout") return fail(504, "That took too long. Please try again.");
  if (code === "rejected") return fail(422, "We couldn't use that photo. Try a clear, front-facing photo of one person.");
  if (code === "not_found") return fail(404, "That try-on has expired. Please start again.");
  return fail(502, "Realistic try-on is unavailable right now. The instant preview still works.");
}

function guard(req: Request) {
  if (!aiTryOnEnabled()) return fail(503, "Realistic try-on isn't switched on yet.");
  if (!sameOrigin(req.headers.get("origin") ?? req.headers.get("referer"), req.headers.get("host"))) return fail(403, "Not allowed.");
  return null;
}

async function withTimeout<T>(ms: number, run: (s: AbortSignal) => Promise<T>) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await run(ac.signal); } finally { clearTimeout(t); }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ enabled: aiTryOnEnabled() }, { headers: NO_STORE });
  const blocked = guard(req);
  if (blocked) return blocked;
  const ip = clientIp(req.headers);
  if (!take(`tryon:poll:${ip}`, 120, 10 * 60 * 1000).ok) return fail(429, "Too many checks. Please wait a moment.");
  try { return reply(await withTimeout(20_000, (s) => getProvider().check(id, s))); } catch (e) { return failure(e); }
}

export async function DELETE(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const id = new URL(req.url).searchParams.get("id");
  if (id) await getProvider().cancel(id);
  return new Response(null, { status: 204, headers: NO_STORE });
}

export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;

  const ip = clientIp(req.headers);
  const perIp = take(`tryon:ip:${ip}`, Number(process.env.TRYON_PER_IP_PER_HOUR ?? 5), 60 * 60 * 1000);
  if (!perIp.ok) return fail(429, "You've hit the try-on limit for now. Try again later.", { "Retry-After": String(perIp.retryAfterS) });
  const daily = take("tryon:global", Number(process.env.TRYON_DAILY_LIMIT ?? 200), 24 * 60 * 60 * 1000);
  if (!daily.ok) return fail(429, "Realistic try-on is busy today. The instant preview still works.", { "Retry-After": String(daily.retryAfterS) });

  let form: FormData;
  try { form = await req.formData(); } catch { return fail(400, "Send the photo as a form upload."); }
  if (form.get("consent") !== "yes") return fail(400, "Please confirm the consent checkbox first.");
  const garment = await loadGarment(String(form.get("slug") ?? ""));
  if (!garment) return fail(400, "That piece isn't available for try-on.");
  const photo = form.get("photo");
  if (!(photo instanceof Blob) || photo.size === 0) return fail(400, "Add a photo first.");
  if (photo.size > MAX_AI_PHOTO_BYTES) return fail(413, "That photo is too large.");
  let bytes: Uint8Array | null = new Uint8Array(await photo.arrayBuffer());
  const mime = sniffImage(bytes);
  if (!mime) return fail(415, "Use a JPG, PNG or WebP photo.");
  try {
    const person = { bytes, mime };
    return reply(await withTimeout(25_000, (s) => getProvider().start({ person, garment, description: garment.description }, s)));
  } catch (e) {
    return failure(e);
  } finally {
    bytes = null;
  }
}
