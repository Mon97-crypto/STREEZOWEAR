"use client";

import { useState } from "react";
import { BoltIcon } from "@/components/ui/Icons";
import { EXPRESS, isExpressPin, isValidPin } from "@/lib/delivery/express";

/**
 * Informational PIN check. The binding check runs server-side at checkout (Phase 4)
 * against the exact address and the rider partner's live serviceability.
 */
export function ExpressCheck({ className = "" }: { className?: string }) {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<null | "yes" | "no" | "invalid">(null);
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        setResult(!isValidPin(pin) ? "invalid" : isExpressPin(pin) ? "yes" : "no");
      }}
    >
      <label htmlFor="pin" className="label mb-3 flex items-center gap-2 text-neon">
        <BoltIcon className="h-4 w-4" /> Check 60-minute delivery
      </label>
      <div className="flex gap-2">
        <input
          id="pin"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="PIN code"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setResult(null);
          }}
          className="field max-w-[11rem] tabular-nums"
        />
        <button className="btn btn-ghost" type="submit">Check</button>
      </div>
      <p className="mt-3 min-h-[1.5rem] text-sm" aria-live="polite">
        {result === "yes" && <span className="text-chrome">Your area is in range. 60-minute delivery is offered at checkout, during delivery hours.</span>}
        {result === "no" && <span className="text-steel">Outside the 60-minute zone. Standard delivery across India.</span>}
        {result === "invalid" && <span className="text-neon">Enter a 6-digit PIN code.</span>}
        {result === null && <span className="text-steel">{EXPRESS.radiusKm} km around {EXPRESS.origin.name}.</span>}
      </p>
    </form>
  );
}
