"use client";

import { motion, useReducedMotion } from "motion/react";

/** Page transition: soft fade (opacity only, so fixed-position children are unaffected) on every navigation. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
