"use client";

import { motion } from "framer-motion";
import Logo from "./Logo";
import FooterLinks from "./FooterLinks";

const ANIM_END = 0.85;

export default function Hero() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 md:px-12 lg:px-20">
      <div className="relative w-full max-w-sm">
        <div className="relative h-8 md:h-10 mb-5">
          <div className="flex items-center gap-3 h-full">
            <div className="relative h-full shrink-0 overflow-visible" style={{ aspectRatio: "604/440" }}>
              <Logo className="h-full w-auto text-white" animated />
            </div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: ANIM_END, ease: "easeOut" as const }}
              className="text-base md:text-lg font-medium tracking-tight text-white whitespace-nowrap"
            >
              semicentric
            </motion.span>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: ANIM_END + 0.1, ease: "easeOut" as const }}
          className="text-neutral-500 text-xs md:text-sm leading-relaxed mb-6 max-w-xs"
        >
          A couple sentences about semicentric go here. This is placeholder text
          that you can replace with the real description later.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: ANIM_END + 0.2, ease: "easeOut" as const }}
        >
          <FooterLinks />
        </motion.div>
      </div>
    </div>
  );
}
