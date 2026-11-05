/**
 * 60-minute express delivery — Bangalore hyperlocal zone.
 *
 * Owner brief: 8–10 km radius from Muthanallur Cross, Dommasandra.
 * The origin coordinates below are APPROXIMATE and must be replaced with the exact dispatch
 * point before launch. Serviceability in Phase 2 is a PIN allowlist (PINs are coarse areas, so
 * they are a first gate only). Phase 4 adds a precise distance check on the geocoded delivery
 * address, and the hyperlocal partner's own serviceability API, server-side.
 */
export const EXPRESS = {
  label: "60-minute delivery",
  origin: {
    name: "Muthanallur Cross, Dommasandra",
    lat: 12.8807, // APPROXIMATE — confirm
    lng: 77.7385, // APPROXIMATE — confirm
  },
  radiusKm: 10,
  /** PINs whose area falls at least partly inside the radius. VERIFY each against your rider partner. */
  pins: ["562125", "560035", "560087", "560103"] as readonly string[],
  /** PLACEHOLDER — operating window and same-hour cut-off, local time. */
  hours: { open: "10:00", lastOrder: "21:00" },
  /** PLACEHOLDER — fee in paise; null means "shown at checkout". */
  feePaise: null as number | null,
} as const;

export const PIN_RE = /^[1-9][0-9]{5}$/;

export function isValidPin(pin: string): boolean {
  return PIN_RE.test(pin.trim());
}

export function isExpressPin(pin: string): boolean {
  const p = pin.trim();
  return isValidPin(p) && EXPRESS.pins.includes(p);
}

/** Great-circle distance in km (used in Phase 4 with geocoded addresses). */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function withinExpressRadius(point: { lat: number; lng: number }): boolean {
  return haversineKm(EXPRESS.origin, point) <= EXPRESS.radiusKm;
}
