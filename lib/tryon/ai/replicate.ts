import "server-only";
import { JOB_ID, TryOnError, type JobState, type TryOnInput, type TryOnProvider } from "./types";

/**
 * Replicate adapter. Replicate deletes API prediction inputs, outputs and logs about an hour
 * after a prediction finishes (replicate.com/docs/topics/predictions/data-retention).
 *
 * Config (server env only):
 *   REPLICATE_API_TOKEN    secret
 *   REPLICATE_TRYON_MODEL  "owner/name" (official/deployment-style) or "owner/name:version".
 *                          Default: prunaai/p-image-try-on (official model; best in our comparison).
 *   REPLICATE_TRYON_INPUTS optional JSON mapping our inputs onto the model's input names. A name ending in
 *     "[]" is sent as a one-item list. Default (for p-image-try-on):
 *     {"person":"person_image","garment":"garment_images[]","extra":{"output_format":"jpg","output_quality":92}}
 * Choose a model whose licence allows commercial use.
 */
type Mapping = { person: string; garment: string; description?: string; extra?: Record<string, unknown> };

export const DEFAULT_MODEL = "prunaai/p-image-try-on";
const DEFAULT_MAPPING: Mapping = { person: "person_image", garment: "garment_images[]", extra: { output_format: "jpg", output_quality: 92 } };
const API = "https://api.replicate.com/v1";
const MAX_OUTPUT_BYTES = 12 * 1024 * 1024;

const toDataUri = (b: Uint8Array, mime: string) => `data:${mime};base64,${Buffer.from(b).toString("base64")}`;

export function parseMapping(raw: string | undefined): Mapping {
  if (!raw) return DEFAULT_MAPPING;
  const m = JSON.parse(raw) as Mapping;
  if (typeof m.person !== "string" || typeof m.garment !== "string") throw new Error("REPLICATE_TRYON_INPUTS needs person and garment");
  return m;
}

export function buildRequest(model: string, input: TryOnInput, mapping: Mapping) {
  const body: Record<string, unknown> = { ...(mapping.extra ?? {}) };
  const put = (key: string, value: string) => {
    if (key.endsWith("[]")) body[key.slice(0, -2)] = [value];
    else body[key] = value;
  };
  put(mapping.person, toDataUri(input.person.bytes, input.person.mime));
  put(mapping.garment, toDataUri(input.garment.bytes, input.garment.mime));
  if (mapping.description) put(mapping.description, input.description);
  const [ref, version] = model.split(":");
  return version
    ? { url: `${API}/predictions`, json: { version, input: body } }
    : { url: `${API}/models/${ref}/predictions`, json: { input: body } };
}

function firstUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.map(firstUrl).find(Boolean) ?? null;
  if (output && typeof output === "object") {
    for (const v of Object.values(output)) { const u = firstUrl(v); if (u) return u; }
  }
  return null;
}

type Prediction = { id: string; model?: string; status: string; output?: unknown; error?: unknown; urls?: { get?: string; cancel?: string } };

type Env = Record<string, string | undefined>;

export function replicateProvider(env: Env = process.env, fetchImpl: typeof fetch = fetch): TryOnProvider {
  const token = env.REPLICATE_API_TOKEN;
  const model = env.REPLICATE_TRYON_MODEL || DEFAULT_MODEL;
  if (!token) throw new TryOnError("not_configured", "Replicate try-on is not configured");
  const mapping = parseMapping(env.REPLICATE_TRYON_INPUTS);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const modelRef = model.split(":")[0];

  async function finish(p: Prediction, signal: AbortSignal): Promise<JobState> {
    // only ever hand back jobs for our try-on model, so this can't be used to read anything else
    if (p.model && p.model !== modelRef) throw new TryOnError("not_found", "Unknown job");
    if (p.status === "starting" || p.status === "processing") return { status: "running", id: p.id };
    if (p.status !== "succeeded") throw new TryOnError(p.status === "failed" ? "rejected" : "provider_error", "Try-on failed");
    const url = firstUrl(p.output);
    if (!url || !/^https:\/\//.test(url)) throw new TryOnError("bad_output", "No image returned");
    const img = await fetchImpl(url, { signal, cache: "no-store" });
    if (!img.ok) throw new TryOnError("bad_output", "Could not fetch result");
    const mime = img.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    if (!mime.startsWith("image/")) throw new TryOnError("bad_output", "Result was not an image");
    const buf = new Uint8Array(await img.arrayBuffer());
    if (buf.byteLength > MAX_OUTPUT_BYTES) throw new TryOnError("bad_output", "Result too large");
    return { status: "done", result: { bytes: buf, mime } };
  }

  return {
    name: "replicate",
    async start(input, signal) {
      const req = buildRequest(model, input, mapping);
      const body = JSON.stringify(req.json);
      const send = () => fetchImpl(req.url, { method: "POST", headers: { ...headers, Prefer: "wait=10" }, body, signal, cache: "no-store" });
      let res = await send().catch(() => null);
      // one retry for a brief blip (busy / rate-limited / server error / dropped connection)
      if (!res || res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1500));
        res = await send();
      }
      if (res.status === 422) throw new TryOnError("rejected", "The model rejected the input");
      if (!res.ok) throw new TryOnError("provider_error", `Replicate ${res.status}`);
      return finish((await res.json()) as Prediction, signal);
    },
    async check(id, signal) {
      if (!JOB_ID.test(id)) throw new TryOnError("not_found", "Unknown job");
      const res = await fetchImpl(`${API}/predictions/${id}`, { headers, signal, cache: "no-store" });
      if (res.status === 404) throw new TryOnError("not_found", "Unknown job");
      if (!res.ok) throw new TryOnError("provider_error", `Replicate ${res.status}`);
      return finish((await res.json()) as Prediction, signal);
    },
    async cancel(id) {
      if (!JOB_ID.test(id)) return;
      await fetchImpl(`${API}/predictions/${id}/cancel`, { method: "POST", headers }).catch(() => {});
    },
  };
}
