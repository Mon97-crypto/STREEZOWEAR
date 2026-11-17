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
    public code: "not_configured" | "timeout" | "rejected" | "provider_error" | "bad_output" | "not_found",
    message: string,
  ) {
    super(message);
  }
}

/** A job either finishes quickly (result) or is still running (id to check back with). */
export type JobState = { status: "done"; result: TryOnResult } | { status: "running"; id: string };

export interface TryOnProvider {
  name: string;
  /** start a job, waiting a few seconds in case it finishes straight away */
  start(input: TryOnInput, signal: AbortSignal): Promise<JobState>;
  /** check a running job */
  check(id: string, signal: AbortSignal): Promise<JobState>;
  /** stop a job nobody is waiting for any more (stops the billing) */
  cancel(id: string): Promise<void>;
}

/** job ids are opaque provider ids; accept only their shape */
export const JOB_ID = /^[a-z0-9]{16,40}$/;
