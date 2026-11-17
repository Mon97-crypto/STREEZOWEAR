/** A provider that redraws a person wearing a garment. Server-only. */
export type TryOnInput = {
  /** the visitor's photo, JPEG/PNG/WebP bytes (never stored) */
  person: { bytes: Uint8Array; mime: string };
  /** the garment image, JPEG on a plain background */
  garment: { bytes: Uint8Array; mime: string };
  /** short plain description of the garment, some models use it */
  description: string;
};

export type TryOnResult = { bytes: Uint8Array; mime: string };

export class TryOnError extends Error {
  constructor(
    public code: "not_configured" | "timeout" | "rejected" | "provider_error" | "bad_output",
    message: string,
  ) {
    super(message);
  }
}

export interface TryOnProvider {
  name: string;
  run(input: TryOnInput, signal: AbortSignal): Promise<TryOnResult>;
}
