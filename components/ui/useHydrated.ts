"use client";

import { useEffect, useState } from "react";

/** true after first client render — avoids hydration mismatch for localStorage-backed state */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
