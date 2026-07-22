"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [focused, setFocused] = useState(false);
  const [formHeight, setFormHeight] = useState<number | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "semicentric" }),
      });
      if (res.ok && formRef.current) {
        setFormHeight(formRef.current.offsetHeight);
      }
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: formHeight }}>
        <motion.p
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm text-neutral-500"
        >
          you&rsquo;re in.
        </motion.p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm" ref={formRef}>
      <div
        className={`relative flex items-center border rounded-xl [transition-property:border-color,background-color] duration-300 ease-out ${
          focused
            ? "border-neutral-500 bg-white"
            : "border-neutral-300 bg-white"
        } ${state === "error" ? "border-red-400" : ""}`}
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          name="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="you@email.com"
          className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none min-w-0"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="relative shrink-0 mr-1.5 bg-neutral-900 text-white text-xs font-medium tracking-wide px-3.5 py-1.5 rounded-md hover:bg-neutral-700 active:scale-[0.96] [transition-property:background-color,scale,opacity] duration-150 ease-out disabled:opacity-40 cursor-pointer overflow-hidden"
        >
          <span className="invisible" aria-hidden>
            {state === "loading" ? "submitting" : state === "error" ? "try again" : "join waitlist"}
          </span>
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={state}
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={
                state === "loading"
                  ? { opacity: [1, 0.4, 1], scale: 1, filter: "blur(0px)" }
                  : { opacity: 1, scale: 1, filter: "blur(0px)" }
              }
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={
                state === "loading"
                  ? {
                      opacity: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                      scale: { type: "spring", duration: 0.3, bounce: 0 },
                      filter: { type: "spring", duration: 0.3, bounce: 0 },
                    }
                  : { type: "spring", duration: 0.3, bounce: 0 }
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              {state === "loading" ? "submitting" : state === "error" ? "try again" : "join waitlist"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      {state === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 mt-2 ml-1"
        >
          something went wrong. try again.
        </motion.p>
      )}
    </form>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollWord({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(progress, range, ["#cfcfcf", "#0a0a0a"]);
  return (
    <motion.span style={{ color }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

function PinnedReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const words = text.split(" ");
  const FILL_END = 0.72;
  return (
    <div ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-dvh flex items-center">
        <p className={className}>
          {words.map((w, i) => (
            <ScrollWord
              key={i}
              progress={scrollYProgress}
              range={[
                (i / words.length) * FILL_END,
                ((i + 1) / words.length) * FILL_END,
              ]}
            >
              {w}
            </ScrollWord>
          ))}
        </p>
      </div>
    </div>
  );
}

function ContactLink({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText("plyght@semicentric.co");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`cursor-pointer ${className ?? ""}`}
    >
      {copied ? "copied!" : "contact"}
    </button>
  );
}

const CAPABILITIES = [
  {
    label: "uncover",
    body: "the agents study what you actually ship and run, down to the artifact, even where the source is missing, stale, or owned by someone else. nothing hides just because no one looked.",
  },
  {
    label: "prove",
    body: "every component and every reachable weakness, traced to the exact thing it lives in and confirmed against what's really deployed. the kind of evidence that survives an audit.",
  },
  {
    label: "remediate",
    body: "the fix gets written, applied, and checked against the real system before anyone trusts it. finding the problem and closing it stop being two separate jobs.",
  },
];

const STATS = [
  { value: "any artifact", label: "what you ship and run" },
  { value: "adversary-grade", label: "the attacker's whole playbook" },
  { value: "audit-ready", label: "evidence that survives review" },
  { value: "nothing leaves", label: "your data stays on your machine" },
];

const serif = "font-[family-name:var(--font-record-disc)]";

const WORD = "semicentric".split("");
const EASE = [0.22, 1, 0.36, 1] as const;
const START_DELAY_S = 0.1;
const TRAVEL_S = 0.85;
const TITLE_DONE_S = START_DELAY_S + TRAVEL_S + 0.15;

function HeroTitle() {
  const wordRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    const word = wordRef.current;
    const logo = logoRef.current;
    if (!word || !logo) return;

    const wordRect = word.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    const startX = wordRect.left - logoRect.left;

    controls.set({ x: startX });
    controls.start({
      x: 0,
      transition: { duration: TRAVEL_S, delay: START_DELAY_S, ease: "linear" },
    });
  }, [controls]);

  return (
    <div className="flex w-full justify-center">
      <div
        className={`${serif} relative inline-flex items-center text-[clamp(2.5rem,11vw,6.5rem)] leading-none tracking-tight text-neutral-900`}
      >
        <span ref={wordRef} className="inline-flex">
          {WORD.map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: "-0.12em" }}
              animate={{ opacity: 1, x: "0em" }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: START_DELAY_S + (i / WORD.length) * TRAVEL_S,
              }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </span>

        <motion.span
          ref={logoRef}
          animate={controls}
          className="relative z-10 inline-flex ml-[0.16em] shrink-0 overflow-visible"
          style={{ height: "0.78em", aspectRatio: "604/440" }}
        >
          <Logo className="h-full w-auto text-neutral-900" animated />
        </motion.span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="w-full">
      <div className="relative z-10 bg-[#fafafa] shadow-[0_20px_45px_-14px_rgba(0,0,0,0.4)]">
      <section className="px-6 md:px-12 pt-28 pb-28 md:pt-40 md:pb-36">
        <div className="mx-auto w-full max-w-3xl flex flex-col items-center text-center">
          <HeroTitle />

          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: TITLE_DONE_S + 0.15, ease: "easeOut" }}
            className="mt-10 max-w-md text-neutral-600 text-base md:text-lg leading-relaxed [text-wrap:pretty]"
          >
            security that understands your systems as well as the people
            trying to break them.
          </motion.p>
        </div>
      </section>

      <PinnedReveal
        text="most security tools read what your code is meant to do. what matters is what your systems actually do once they're live. that gap is where almost every breach begins."
        className={`${serif} mx-auto max-w-4xl px-6 md:px-12 text-3xl md:text-5xl leading-[1.2] tracking-tight`}
      />
      <PinnedReveal
        text="semicentric builds security agents that examine a system the way an attacker would. they assume nothing, verify everything, and surface what's really there. then it gets closed, before it becomes someone's way in. and they do it all without your data ever leaving your machine."
        className={`${serif} mx-auto max-w-4xl px-6 md:px-12 text-3xl md:text-5xl leading-[1.2] tracking-tight`}
      />

      <section>
        <div className="mx-auto max-w-5xl px-6 md:px-12 py-24 md:py-36">
          <Reveal className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            what we do
          </Reveal>
          <Reveal
            delay={0.05}
            className={`${serif} mt-6 max-w-2xl text-3xl md:text-4xl leading-tight tracking-tight text-neutral-900 [text-wrap:balance]`}
          >
            the gaps an attacker would find, resolved before they do.
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 md:grid-cols-3">
            {CAPABILITIES.map((c, i) => (
              <Reveal
                key={c.label}
                delay={i * 0.08}
                className="flex flex-col gap-4 bg-[#fafafa] p-8 md:p-10"
              >
                <span
                  className={`${serif} text-2xl tracking-tight text-neutral-900`}
                >
                  {c.label}
                </span>
                <p className="text-base text-neutral-600 leading-relaxed [text-wrap:pretty]">
                  {c.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist">
        <div className="mx-auto max-w-5xl px-6 md:px-12 py-24 md:py-40 flex flex-col items-center text-center">
          <Reveal className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            the waitlist is open
          </Reveal>
          <Reveal
            delay={0.05}
            className={`${serif} mt-6 text-4xl md:text-6xl leading-[1.05] tracking-tight text-neutral-900 [text-wrap:balance]`}
          >
            be first to deploy.
          </Reveal>
          <Reveal
            delay={0.1}
            className="mt-6 max-w-md text-lg text-neutral-600 leading-relaxed [text-wrap:pretty]"
          >
            we&rsquo;re onboarding early teams now. leave your email and
            we&rsquo;ll reach out when it&rsquo;s your turn.
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 w-full max-w-3xl"
          >
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <span
                  className={`${serif} text-2xl md:text-3xl tracking-tight text-neutral-900`}
                >
                  {s.value}
                </span>
                <span className="text-[11px] uppercase tracking-[0.15em] text-neutral-400">
                  {s.label}
                </span>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.2} className="mt-16 flex justify-center w-full">
            <WaitlistForm />
          </Reveal>
        </div>
      </section>

      </div>

      <footer className="fixed inset-x-0 bottom-0 z-0 h-[42vh] bg-neutral-950 text-neutral-400 flex flex-col overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-white/[0.05] pointer-events-none"
        />
        <div className="relative flex-1 min-h-0 overflow-hidden flex items-center justify-center px-6">
          <Logo className="w-[62%] max-w-xl h-auto text-[#161616] [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.6))_drop-shadow(0_1px_0_rgba(255,255,255,0.06))]" />
          <span
            className={`${serif} absolute inset-0 flex items-center justify-center translate-y-1 text-[clamp(1.75rem,8vw,5rem)] leading-none tracking-tight text-neutral-100`}
          >
            semicentric
          </span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 md:px-12 pb-[max(2.5rem,env(safe-area-inset-bottom))] space-y-4 text-xs">
          <div className="flex items-center justify-between tracking-wide text-neutral-400">
            <div className="flex items-center gap-6">
              <ContactLink className="hover:text-white [transition-property:color] duration-200" />
              <a
                href="https://github.com/semicentric"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white [transition-property:color] duration-200"
              >
                github
              </a>
            </div>
            <a
              href="https://x.com/semicentric"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white [transition-property:color] duration-200"
            >
              x
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-neutral-600">
            <p>© 2026 semicentric. all rights reserved.</p>
            <p>building in stealth.</p>
          </div>
        </div>
      </footer>
      <div aria-hidden className="h-[42vh]" />
    </div>
  );
}
