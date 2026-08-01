"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Logo from "./Logo";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const EMAIL = "ops@semicentric.co";

export const COPY = {
  lead: "semicentric is a security company. we work on software that reads the systems people actually run.",
  what: "not the source in your repo: the containers, binaries, and dependencies that ship with it.",
  list: "leave an email if you want to know when we open it up.",
};

const WORD = "semicentric".split("");
const LEAD_S = 0.08;
const STEP_S = 0.045;
export const LOGO_AT_S = LEAD_S + (WORD.length - 1) * STEP_S + 0.08;
export const AFTER_S = LOGO_AT_S + 0.28;

export function In({
  children,
  delay = 0,
  className,
  style,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "p";
}) {
  const reduced = useReducedMotion();
  const Component = as === "p" ? motion.p : motion.div;
  return (
    <Component
      initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(6px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.75, delay: reduced ? 0 : AFTER_S + delay, ease: EASE }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}

export function Wordmark({
  className,
  markClassName,
  stacked = false,
  spread = false,
}: {
  className?: string;
  markClassName?: string;
  stacked?: boolean;
  spread?: boolean;
}) {
  const reduced = useReducedMotion();
  const letters = (from: number, to: number) =>
    WORD.slice(from, to).map((ch, i) => (
      <motion.span
        key={from + i}
        initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{
          duration: 0.65,
          ease: EASE,
          delay: reduced ? 0 : LEAD_S + (from + i) * STEP_S,
        }}
        style={{ willChange: "filter, opacity" }}
        className="inline-block"
      >
        {ch}
      </motion.span>
    ));

  const mark = (
    <span
      aria-hidden
      className={`relative z-10 inline-flex shrink-0 overflow-visible ${markClassName ?? "ml-[0.16em]"}`}
      style={{ height: "0.78em", aspectRatio: "604/440" }}
    >
      <Logo className="h-full w-auto text-ink" animated delay={reduced ? 0 : LOGO_AT_S} />
    </span>
  );

  if (stacked) {
    return (
      <h1 className={`font-display leading-[0.92] tracking-tight text-ink ${className ?? ""}`}>
        <span className="sr-only">semicentric</span>
        <span aria-hidden className="block">
          {letters(0, 4)}
        </span>
        <span aria-hidden className="flex items-center">
          {letters(4, WORD.length)}
          {mark}
        </span>
      </h1>
    );
  }

  if (spread) {
    return (
      <h1
        className={`font-display flex w-full items-center justify-between leading-none text-ink ${className ?? ""}`}
      >
        <span className="sr-only">semicentric</span>
        {letters(0, WORD.length)}
        {mark}
      </h1>
    );
  }

  return (
    <h1
      className={`font-display relative inline-flex items-center leading-none tracking-tight text-ink ${className ?? ""}`}
    >
      <span className="sr-only">semicentric</span>
      <span aria-hidden className="inline-flex">
        {letters(0, WORD.length)}
      </span>
      {mark}
    </h1>
  );
}

export const linkClass =
  "text-muted [transition-property:color,scale] duration-150 ease-out [@media(hover:hover)]:hover:text-ink active:scale-[0.98]";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(EMAIL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`relative cursor-pointer text-left ${linkClass}`}
    >
      <span className="invisible" aria-hidden>
        {EMAIL}
      </span>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={String(copied)}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: EASE }}
          className="absolute inset-0 whitespace-nowrap"
        >
          {copied ? "copied" : EMAIL}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Links({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <div
      className={`flex gap-x-7 text-[15px] ${
        vertical ? "flex-col items-start gap-y-2.5" : "flex-wrap items-center gap-y-2"
      } ${className ?? ""}`}
    >
      <CopyEmail />
      <a
        href="https://github.com/semicentric"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        github
      </a>
      <a
        href="https://x.com/semicentric"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        @semicentric
      </a>
    </div>
  );
}
