import { aiTryOnEnabled, getProvider, loadGarment } from "@/lib/tryon/ai";
import { TryOnError } from "@/lib/tryon/ai/types";
import { clientIp, MAX_AI_PHOTO_BYTES, sameOrigin, sniffImage } from "@/lib/tryon/ai/validate";
import { take } from "@/lib/security/rate-limit";

/**
 * Realistic try-on. The photo lives only in this request's memory: it is passed to the provider and
 * dropped when the response is sent. Nothing is written to disk, a database or logs.
 * The provider (Replicate) deletes inputs and outputs automatically about an hour after the job.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex" };
const fail = (status: number, error: string, extra: Record<string, string> = {}) =>
  Response.json({ error }, { status, headers: { ...NO_STORE, ...extra } });

export async function GET() {
  return Response.json({ enabled: aiTryOnEnabled() }, { headers: NO_STORE });
}

export async function POST(req: Request) {
  if (!aiTryOnEnabled()) return fail(503, "Realistic try-on isn't switched on yet.");
  if (!sameOrigin(req.headers.get("origin"), req.headers.get("host"))) return fail(403, "Not allowed.");

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

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 55_000);
  try {
    const out = await getProvider().run({ person: { bytes, mime }, garment, description: garment.description }, ac.signal);
    const dataUri = `data:${out.mime};base64,${Buffer.from(out.bytes).toString("base64")}`;
    return Response.json({ image: dataUri }, { headers: NO_STORE });
  } catch (e) {
    const code = e instanceof TryOnError ? e.code : "provider_error";
    // log the kind of failure only, never the image or the provider's echo of it
    console.error("[try-on] failed:", code);
    if (code === "timeout") return fail(504, "That took too long. Please try again.");
    if (code === "rejected") return fail(422, "We couldn't use that photo. Try a clear, front-facing photo of one person.");
    return fail(502, "Realistic try-on is unavailable right now. The instant preview still works.");
  } finally {
    clearTimeout(timer);
    bytes = null;
  }
}
