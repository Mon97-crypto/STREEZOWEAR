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
  it("is off without a token and model", () => {
    expect(() => replicateProvider({})).toThrow(TryOnError);
  });
  it("maps inputs onto the model's names and picks the right endpoint", () => {
    const m = parseMapping(undefined);
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
  it("polls until done, then fetches the result image", async () => {
    const calls: string[] = [];
    const fake = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url); calls.push(`${init?.method ?? "GET"} ${u}`);
      if (u.endsWith("/predictions")) return Response.json({ id: "p1", status: "processing", urls: { get: "https://api.replicate.com/v1/predictions/p1", cancel: "https://api.replicate.com/v1/predictions/p1/cancel" } }, { status: 201 });
      if (u.endsWith("/p1")) return Response.json({ id: "p1", status: "succeeded", output: ["https://replicate.delivery/out.png"] });
      return new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } });
    });
    const p = replicateProvider({ REPLICATE_API_TOKEN: "t", REPLICATE_TRYON_MODEL: "o/m:v" }, fake as unknown as typeof fetch);
    const r = await p.run(input, new AbortController().signal);
    expect(r.mime).toBe("image/png");
    expect(r.bytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(calls).toEqual(["POST https://api.replicate.com/v1/predictions", "GET https://api.replicate.com/v1/predictions/p1", "GET https://replicate.delivery/out.png"]);
  });
  it("reports a failed job as rejected", async () => {
    const fake = vi.fn(async () => Response.json({ id: "p", status: "failed", error: "nsfw" }, { status: 201 }));
    const p = replicateProvider({ REPLICATE_API_TOKEN: "t", REPLICATE_TRYON_MODEL: "o/m" }, fake as unknown as typeof fetch);
    await expect(p.run(input, new AbortController().signal)).rejects.toMatchObject({ code: "rejected" });
  });
});
