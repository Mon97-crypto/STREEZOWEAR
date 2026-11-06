import { describe, expect, it } from "vitest";
import { EXPRESS, haversineKm, isExpressPin, isValidPin, withinExpressRadius } from "@/lib/delivery/express";
import { formatINR } from "@/lib/pricing/format";
import { artworkRequestSchema, textCustomisationSchema, validateArtworkFile } from "@/lib/validation/customise";

describe("express delivery", () => {
  it("validates PIN format", () => {
    expect(isValidPin("562125")).toBe(true);
    expect(isValidPin("062125")).toBe(false);
    expect(isValidPin("56212")).toBe(false);
  });
  it("only allowlisted PINs are express", () => {
    expect(isExpressPin("562125")).toBe(true);
    expect(isExpressPin("110001")).toBe(false);
  });
  it("radius check uses great-circle distance", () => {
    expect(haversineKm(EXPRESS.origin, EXPRESS.origin)).toBe(0);
    // ~0.09° latitude ≈ 10 km
    expect(withinExpressRadius({ lat: EXPRESS.origin.lat + 0.05, lng: EXPRESS.origin.lng })).toBe(true);
    expect(withinExpressRadius({ lat: EXPRESS.origin.lat + 0.2, lng: EXPRESS.origin.lng })).toBe(false);
  });
});

describe("money", () => {
  it("formats paise as rupees", () => {
    expect(formatINR(49900)).toBe("₹499");
    expect(formatINR(79900)).toBe("₹799");
    expect(formatINR(150050)).toBe("₹1,500.50");
  });
});

describe("customisation validation", () => {
  it("enforces per-placement length", () => {
    expect(textCustomisationSchema.safeParse({ placement: "sleeve", text: "TOO LONG TEXT", style: "mono", colour: "neon" }).success).toBe(false);
    expect(textCustomisationSchema.safeParse({ placement: "upper-back", text: "RUGGED BOYZ", style: "display", colour: "chrome" }).success).toBe(true);
  });
  it("rejects markup and emoji", () => {
    expect(textCustomisationSchema.safeParse({ placement: "upper-back", text: "<script>", style: "display", colour: "chrome" }).success).toBe(false);
    expect(textCustomisationSchema.safeParse({ placement: "left-chest", text: "HI 🔥", style: "display", colour: "chrome" }).success).toBe(false);
  });
  it("artwork files: type, extension and size", () => {
    expect(validateArtworkFile({ name: "a.png", type: "image/png", size: 1000 })).toBeNull();
    expect(validateArtworkFile({ name: "a.svg", type: "image/svg+xml", size: 1000 })).not.toBeNull();
    expect(validateArtworkFile({ name: "a.png", type: "application/x-msdownload", size: 1000 })).not.toBeNull();
    expect(validateArtworkFile({ name: "a.pdf", type: "application/pdf", size: 16 * 1024 * 1024 })).not.toBeNull();
  });
  it("artwork request requires a valid Indian mobile", () => {
    const ok = { name: "Raj", email: "raj@example.com", phone: "+91 98765 43210", garment: "the-final-form-oversized-tee", size: "M", quantity: "2", placement: "back" };
    expect(artworkRequestSchema.safeParse(ok).success).toBe(true);
    expect(artworkRequestSchema.safeParse({ ...ok, phone: "12345" }).success).toBe(false);
  });
});
