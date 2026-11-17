import "server-only";
import { TryOnError, type TryOnInput, type TryOnProvider, type TryOnResult } from "./types";

/**
 * Replicate adapter. Replicate deletes API prediction inputs, outputs and logs about an hour
 * after a prediction finishes (replicate.com/docs/topics/predictions/data-retention).
 *
 * Config (server env only):
 *   REPLICATE_API_TOKEN    secret
 *   REPLICATE_TRYON_MODEL  "owner/name" (official/deployment-style) or "owner/name:version"
 *   REPLICATE_TRYON_INPUTS optional JSON mapping our inputs onto the model's input names, e.g.
 *     {"person":"human_img","garment":"garm_img","description":"garment_des","extra":{"category":"upper_body"}}
 * Choose a model whose licence allows commercial use.
 */
type Mapping = { person: string; garment: string; description?: string; extra?: Record<string, unknown> };

const DEFAULT_MAPPING: Mapping = { person: "human_img", garment: "garm_img", description: "garment_des", extra: { category: "upper_body" } };
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
  body[mapping.person] = toDataUri(input.person.bytes, input.person.mime);
  body[mapping.garment] = toDataUri(input.garment.bytes, input.garment.mime);
  if (mapping.description) body[mapping.description] = input.description;
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

type Prediction = { id: string; status: string; output?: unknown; error?: unknown; urls?: { get?: string; cancel?: string } };

type Env = Record<string, string | undefined>;

export function replicateProvider(env: Env = process.env, fetchImpl: typeof fetch = fetch): TryOnProvider {
  const token = env.REPLICATE_API_TOKEN;
  const model = env.REPLICATE_TRYON_MODEL;
  if (!token || !model) throw new TryOnError("not_configured", "Replicate try-on is not configured");
  const mapping = parseMapping(env.REPLICATE_TRYON_INPUTS);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  return {
    name: "replicate",
    async run(input, signal): Promise<TryOnResult> {
      const req = buildRequest(model, input, mapping);
      const res = await fetchImpl(req.url, { method: "POST", headers: { ...headers, Prefer: "wait=50" }, body: JSON.stringify(req.json), signal, cache: "no-store" });
      if (res.status === 422) throw new TryOnError("rejected", "The model rejected the input");
      if (!res.ok) throw new TryOnError("provider_error", `Replicate ${res.status}`);
      let p = (await res.json()) as Prediction;
      try {
        while (p.status === "starting" || p.status === "processing") {
          await new Promise((r) => setTimeout(r, 1500));
          if (signal.aborted) throw new TryOnError("timeout", "Timed out");
          const g = await fetchImpl(p.urls?.get ?? `${API}/predictions/${p.id}`, { headers, signal, cache: "no-store" });
          if (!g.ok) throw new TryOnError("provider_error", `Replicate ${g.status}`);
          p = (await g.json()) as Prediction;
        }
      } catch (e) {
        // stop the paid job if we give up on it
        if (p.urls?.cancel) await fetchImpl(p.urls.cancel, { method: "POST", headers }).catch(() => {});
        if (e instanceof TryOnError) throw e;
        throw new TryOnError(signal.aborted ? "timeout" : "provider_error", "Try-on did not finish");
      }
      if (p.status !== "succeeded") throw new TryOnError(p.status === "failed" ? "rejected" : "provider_error", "Try-on failed");
      const url = firstUrl(p.output);
      if (!url || !/^https:\/\//.test(url)) throw new TryOnError("bad_output", "No image returned");
      const img = await fetchImpl(url, { signal, cache: "no-store" });
      if (!img.ok) throw new TryOnError("bad_output", "Could not fetch result");
      const mime = img.headers.get("content-type")?.split(";")[0] ?? "image/png";
      if (!mime.startsWith("image/")) throw new TryOnError("bad_output", "Result was not an image");
      const buf = new Uint8Array(await img.arrayBuffer());
      if (buf.byteLength > MAX_OUTPUT_BYTES) throw new TryOnError("bad_output", "Result too large");
      return { bytes: buf, mime };
    },
  };
}
