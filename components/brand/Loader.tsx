"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { SMark } from "./Logo";

/** First visit per session only. The bolt strikes across the S, then the page reveals. */
export function Loader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("szw-intro") === "1";
      sessionStorage.setItem("szw-intro", "1");
    } catch {}
    if (seen || reduce) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          className="sw-dark fixed inset-0 z-[90] grid place-items-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } }}
          aria-hidden
        >
          <div className="relative">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <SMark size={140} />
            </motion.div>
            <motion.div
              className="absolute left-[-30%] right-[-30%] top-1/2 h-[2px] -rotate-[52deg]"
              style={{ background: "linear-gradient(90deg,transparent,#ff1e3c,#ffd0d7,#ff1e3c,transparent)", boxShadow: "0 0 18px 2px rgb(255 30 60/.6)" }}
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 1 }}
              animate={{ clipPath: "inset(0 0% 0 0)", opacity: [1, 1, 0] }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
