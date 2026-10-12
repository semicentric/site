"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Logo, { LOGO_RATIO } from "./Logo";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const EMAIL = "ops@semicentric.co";

export const COPY = {
  lead: "semicentric is a security company. the machine in the cloud should answer to you, without knowing you.",
  what: "your data stays on the hardware you own, from the firmware on the board to the model in the cloud.",
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
      style={{ height: "0.78em", aspectRatio: LOGO_RATIO }}
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
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Both labels stay mounted and cross-fade at once, centred on the email's
  // footprint. Opacity and scale only: a blur filter draws a stray hairline
  // on iOS Safari.
  const swap = { duration: 0.28, ease: EASE };
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(EMAIL);
        } catch {
          return;
        }
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1600);
      }}
      aria-label={copied ? "email copied" : `copy ${EMAIL}`}
      className={`relative cursor-pointer ${linkClass}`}
    >
      <motion.span
        aria-hidden
        className="block whitespace-nowrap"
        initial={false}
        animate={{ opacity: copied ? 0 : 1, scale: copied ? 0.97 : 1 }}
        transition={swap}
      >
        {EMAIL}
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        initial={false}
        animate={{ opacity: copied ? 1 : 0, scale: copied ? 1 : 1.03 }}
        transition={swap}
      >
        copied
      </motion.span>
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
      className={`flex gap-x-3 text-[14px] sm:gap-x-7 sm:text-[15px] ${
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
