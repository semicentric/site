"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import FooterLinks from "./FooterLinks";

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789";
const CONFIRM_TEXT = "you're in. we'll be in touch.";

function useTextScramble(target: string, active: boolean) {
  const [display, setDisplay] = useState("");
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    let iteration = 0;
    const total = target.length;
    const step = () => {
      setDisplay(
        target
          .split("")
          .map((char, i) => {
            if (i < iteration) return char;
            if (char === " ") return " ";
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join(""),
      );
      iteration += 0.6;
      if (iteration < total + 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, target]);

  return display;
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [focused, setFocused] = useState(false);
  const scrambled = useTextScramble(CONFIRM_TEXT, state === "done");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "semicentric" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-neutral-500 font-mono tracking-tight"
      >
        {scrambled}
      </motion.p>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-sm">
      <div
        className={`relative flex items-center border rounded-lg transition-colors duration-300 ${
          focused
            ? "border-neutral-600 bg-neutral-900/50"
            : "border-neutral-800 bg-transparent"
        } ${state === "error" ? "border-red-900/60" : ""}`}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="you@email.com"
          className="flex-1 bg-transparent px-3.5 py-2 text-sm text-white placeholder:text-neutral-600 outline-none min-w-0"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 mr-1.5 bg-white text-zinc-950 text-xs font-medium tracking-wide px-3.5 py-1.5 rounded-md hover:bg-neutral-200 active:scale-[0.97] transition-all disabled:opacity-40 cursor-pointer"
        >
          {state === "loading" ? (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              submitting
            </motion.span>
          ) : state === "error" ? (
            "try again"
          ) : (
            "join waitlist"
          )}
        </button>
      </div>
      {state === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400/70 mt-2 ml-1"
        >
          something went wrong. try again.
        </motion.p>
      )}
    </form>
  );
}

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
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: CONTENT_DELAY + 0.15, ease: "easeOut" }}
        >
          <WaitlistForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: CONTENT_DELAY + 0.25, ease: "easeOut" }}
          className="mt-6"
        >
          <FooterLinks />
        </motion.div>
      </div>
    </div>
  );
}
