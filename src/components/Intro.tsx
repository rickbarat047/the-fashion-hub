import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getProducts } from "../data/products";

interface IntroProps {
  onDone: () => void;
}

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

/**
 * Entry reveal — plays once per tab session on full page load.
 * Ivory brand plate over a charcoal curtain; both lift to unveil the site.
 * Self-driven exit: after the hold, curtains lift via `animate`, then onDone
 * unmounts. Click / tap skips immediately.
 * Reduced-motion visitors never see it (handled by parent).
 */
export const Intro: React.FC<IntroProps> = ({ onDone }) => {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Hold ~1.9s, then lift. Body scroll locked while mounted.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setLeaving(true), 1900);
    // Failsafe: never trap the visitor behind the intro, no matter what.
    const t2 = setTimeout(onDone, 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, [onDone]);

  // 0 → 100 counter over the visible hold
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const skip = () => setLeaving(true);

  return (
    <>
      {/* Back curtain — charcoal, lifts slightly after the brand plate */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[80] bg-[#1C1917]"
        initial={{ y: 0 }}
        animate={leaving ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.85, delay: leaving ? 0.12 : 0, ease: EASE }}
      />
      {/* Front plate — ivory brand moment */}
      <motion.div
        role="dialog"
        aria-label="The Fashion Hub — intro"
        onPointerDown={skip}
        className="fixed inset-0 z-[81] bg-[#FAF7F2] text-[#1C1917] flex flex-col justify-between px-5 sm:px-10 pt-6 pb-8 cursor-pointer select-none"
        initial={{ y: 0 }}
        animate={leaving ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.85, ease: EASE }}
        onAnimationComplete={() => {
          // Let the trailing charcoal curtain finish before unmounting.
          if (leaving) setTimeout(onDone, 160);
        }}
      >
        <div className="flex items-center justify-between meta-sm text-[#5F564A]">
          <span>SS26 — N°01</span>
          <span>Tap to skip</span>
        </div>

        <div className="text-center">
          <span className="block overflow-hidden">
            <motion.span
              className="block meta-sm text-[#702629]"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              The lookbook
            </motion.span>
          </span>
          <span className="block overflow-hidden mt-1">
            <motion.span
              className="block font-editorial font-light tracking-tight leading-[0.95] text-[17vw] sm:text-8xl"
              initial={{ y: "112%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
            >
              Fashion Hub
            </motion.span>
          </span>
          <motion.div
            className="meta-sm text-[#5F564A] mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            {getProducts().length} pieces · Direct Meesho pricing
          </motion.div>
        </div>

        <div>
          <div className="flex items-end justify-between meta-sm text-[#5F564A]">
            <span>Curated Indian fashion</span>
            <span className="font-editorial text-2xl text-[#1C1917] tabular-nums">
              {count}
            </span>
          </div>
          <div className="mt-2 h-[2px] bg-[#1C1917]/10 overflow-hidden">
            <motion.div
              className="h-full w-full bg-[#1C1917] origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};
