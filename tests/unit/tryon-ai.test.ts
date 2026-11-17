import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { buildRequest, parseMapping, replicateProvider } from "@/lib/tryon/ai/replicate";
import { TryOnError } from "@/lib/tryon/ai/types";
import { clientIp, sameOrigin, sniffImage } from "@/lib/tryon/ai/validate";
import { _resetRateLimits, take } from "@/lib/security/rate-limit";

const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const input = { person: { bytes: jpg, mime: "image/jpeg" }, garment: { bytes: jpg, mime: "image/jpeg" }, description: "tee" };

describe("try-on request checks", () => {
  it("sniffs the real file type", () => {
    expect(sniffImage(jpg)).toBe("image/jpeg");
    expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]))).toBe("image/png");
    expect(sniffImage(new TextEncoder().encode("RIFF1234WEBPVP8 "))).toBe("image/webp");
    expect(sniffImage(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImage(new TextEncoder().encode("GIF89a"))).toBeNull();
  });
  it("only accepts same-site posts", () => {
    expect(sameOrigin("https://streezowear.com", "streezowear.com")).toBe(true);
    expect(sameOrigin("https://evil.example", "streezowear.com")).toBe(false);
    expect(sameOrigin(null, "streezowear.com")).toBe(false);
  });
  it("reads the client IP", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });
});

describe("rate limit", () => {
  beforeEach(() => _resetRateLimits());
  it("allows up to the limit, then blocks until the window resets", () => {
    for (let i = 0; i < 3; i++) expect(take("k", 3, 1000, 0).ok).toBe(true);
    expect(take("k", 3, 1000, 10).ok).toBe(false);
    expect(take("k", 3, 1000, 1001).ok).toBe(true);
  });
});

describe("Replicate adapter", () => {
  it("is off without a token", () => {
    expect(() => replicateProvider({})).toThrow(TryOnError);
  });
  it("defaults to the p-image-try-on model and its input names", () => {
    const a = buildRequest("prunaai/p-image-try-on", input, parseMapping(undefined));
    expect(a.url).toBe("https://api.replicate.com/v1/models/prunaai/p-image-try-on/predictions");
    const body = (a.json as { input: Record<string, unknown> }).input;
    expect(body.person_image).toMatch(/^data:image\/jpeg;base64,/);
    expect(Array.isArray(body.garment_images)).toBe(true);
    expect((body.garment_images as string[])[0]).toMatch(/^data:image\/jpeg;base64,/);
  });
  it("maps inputs onto the model's names and picks the right endpoint", () => {
    const m = parseMapping('{"person":"human_img","garment":"garm_img","description":"garment_des","extra":{"category":"upper_body"}}');
    const a = buildRequest("owner/model", input, m);
    expect(a.url).toBe("https://api.replicate.com/v1/models/owner/model/predictions");
    const body = (a.json as { input: Record<string, string> }).input;
    expect(body.human_img).toMatch(/^data:image\/jpeg;base64,/);
    expect(body.garm_img).toMatch(/^data:image\/jpeg;base64,/);
    const b = buildRequest("owner/model:abc123", input, m);
    expect(b.url).toBe("https://api.replicate.com/v1/predictions");
    expect((b.json as { version: string }).version).toBe("abc123");
    expect(() => parseMapping('{"person":"a"}')).toThrow();
  });
  it("starts a job, then checks it until the image is ready", async () => {
    const calls: string[] = [];
    let n = 0;
    const fake = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url); calls.push(`${init?.method ?? "GET"} ${u}`);
      if (u.endsWith("/models/prunaai/p-image-try-on/predictions")) return Response.json({ id: "abcdefghijklmnop1234", model: "prunaai/p-image-try-on", status: "starting" }, { status: 201 });
      if (u.endsWith("/predictions/abcdefghijklmnop1234")) return Response.json({ id: "abcdefghijklmnop1234", model: "prunaai/p-image-try-on", status: ++n < 2 ? "processing" : "succeeded", output: "https://replicate.delivery/out.jpg" });
      return new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/jpeg" } });
    });
    const p = replicateProvider({ REPLICATE_API_TOKEN: "t" }, fake as unknown as typeof fetch);
    const sig = new AbortController().signal;
    const s1 = await p.start(input, sig);
    expect(s1).toEqual({ status: "running", id: "abcdefghijklmnop1234" });
    expect((await p.check("abcdefghijklmnop1234", sig)).status).toBe("running");
    const s3 = await p.check("abcdefghijklmnop1234", sig);
    expect(s3.status).toBe("done");
    if (s3.status === "done") expect(s3.result.bytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(calls.at(-1)).toBe("GET https://replicate.delivery/out.jpg");
  });
  it("won't check malformed ids or other models' jobs", async () => {
    const fake = vi.fn(async () => Response.json({ id: "abcdefghijklmnop1234", model: "someone/else", status: "succeeded", output: "https://x/y.jpg" }));
    const p = replicateProvider({ REPLICATE_API_TOKEN: "t" }, fake as unknown as typeof fetch);
    const sig = new AbortController().signal;
    await expect(p.check("../../account", sig)).rejects.toMatchObject({ code: "not_found" });
    await expect(p.check("abcdefghijklmnop1234", sig)).rejects.toMatchObject({ code: "not_found" });
  });
  it("retries once when Replicate is briefly busy", async () => {
    let n = 0;
    const fake = vi.fn(async (url: string | URL | Request) => {
      const u = String(url);
      if (u.includes("/predictions") && n++ === 0) return new Response("busy", { status: 429 });
      if (u.includes("/predictions")) return Response.json({ id: "abcdefghijklmnop1234", model: "prunaai/p-image-try-on", status: "processing" }, { status: 201 });
      return new Response("x");
    });
    const p = replicateProvider({ REPLICATE_API_TOKEN: "t" }, fake as unknown as typeof fetch);
    expect((await p.start(input, new AbortController().signal)).status).toBe("running");
    expect(fake).toHaveBeenCalledTimes(2);
  });
  it("reports a failed job as rejected", async () => {
    const fake = vi.fn(async () => Response.json({ id: "abcdefghijklmnop1234", status: "failed", error: "nsfw" }, { status: 201 }));
    const p = replicateProvider({ REPLICATE_API_TOKEN: "t", REPLICATE_TRYON_MODEL: "o/m" }, fake as unknown as typeof fetch);
    await expect(p.start(input, new AbortController().signal)).rejects.toMatchObject({ code: "rejected" });
  });
});
