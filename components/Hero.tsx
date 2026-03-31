"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import FooterLinks from "./FooterLinks";

const PART_ANIM_END = 0.85;
const SETTLE_DELAY = 0.25;
const SETTLE_DURATION = 0.7;
const CONTENT_DELAY = PART_ANIM_END + SETTLE_DELAY + SETTLE_DURATION;

export default function Hero() {
  const targetRef = useRef<HTMLDivElement>(null);
  const containerControls = useAnimationControls();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const targetCx = rect.left + rect.width / 2;
    const targetCy = rect.top + rect.height / 2;
    const bigHeight = Math.min(window.innerHeight * 0.25, 160);

    containerControls.set({
      x: cx - targetCx,
      y: cy - targetCy,
      scale: bigHeight / rect.height,
    });

    setMounted(true);

    containerControls.start({
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: SETTLE_DURATION,
        delay: PART_ANIM_END + SETTLE_DELAY,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }, [containerControls]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 md:px-12 lg:px-20">
      <div className="relative w-full max-w-sm">
        <div className="relative h-8 md:h-10 mb-5">
          <div className="flex items-center gap-3 h-full">
            <motion.div
              ref={targetRef}
              className="relative h-full shrink-0 overflow-visible"
              style={{ aspectRatio: "604/440" }}
              animate={containerControls}
            >
              {mounted && (
                <Logo className="h-full w-auto text-white" animated />
              )}
            </motion.div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: CONTENT_DELAY, ease: "easeOut" }}
              className="text-lg md:text-xl font-medium tracking-tight text-white whitespace-nowrap"
            >
              semicentric
            </motion.span>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: CONTENT_DELAY + 0.1, ease: "easeOut" }}
          className="text-neutral-500 text-sm md:text-base leading-relaxed mb-6 max-w-sm"
        >
          the cybersecurity industry isn't obsolete. give us a minute, we're working on it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: CONTENT_DELAY + 0.2, ease: "easeOut" }}
        >
          <FooterLinks />
        </motion.div>
      </div>
    </div>
  );
}
