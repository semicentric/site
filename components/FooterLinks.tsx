"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const linkClass =
  "relative text-neutral-500 hover:text-white [transition-property:color] duration-200 ease-out before:absolute before:inset-0 before:-my-3.5 before:-mx-2 before:content-['']";

export default function FooterLinks() {
  const [copied, setCopied] = useState(false);

  const handleContact = () => {
    navigator.clipboard.writeText("plyght@semicentric.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-5 text-xs tracking-wide">
      <button
        onClick={handleContact}
        className={`${linkClass} active:scale-[0.96] [transition-property:color,scale] cursor-pointer overflow-hidden`}
      >
        <span className="invisible" aria-hidden>
          {copied ? "Copied!" : "Contact"}
        </span>
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={copied ? "copied" : "contact"}
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="absolute inset-0 flex items-center justify-start"
          >
            {copied ? "Copied!" : "Contact"}
          </motion.span>
        </AnimatePresence>
      </button>
      <a
        href="https://github.com/semicentric"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        GitHub
      </a>
      <a
        href="https://x.com/semicentric"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        X
      </a>
    </div>
  );
}
