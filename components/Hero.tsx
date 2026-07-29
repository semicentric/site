"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import Logo from "./Logo";

const EASE = [0.22, 1, 0.36, 1] as const;

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
          transition={{ duration: 0.5, ease: EASE }}
          className="text-sm text-neutral-500"
        >
          you&rsquo;re in. we&rsquo;ll be in touch.
        </motion.p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm" ref={formRef}>
      <div
        className={`relative flex items-center border rounded-xl bg-white [transition-property:border-color] duration-300 ease-out ${
          focused ? "border-neutral-500" : "border-neutral-300"
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
          className="relative shrink-0 mr-1.5 bg-neutral-900 text-white text-xs font-medium tracking-wide px-3.5 py-2 rounded-md hover:bg-neutral-700 active:scale-[0.96] [transition-property:background-color,scale,opacity] duration-150 ease-out disabled:opacity-40 cursor-pointer overflow-hidden"
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
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-xs text-red-500 mt-2 ml-1"
        >
          that didn&rsquo;t go through. try again.
        </motion.p>
      )}
    </form>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
  blur = true,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  blur?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, filter: blur && !reduced ? "blur(6px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: blur && !reduced ? 0.8 : 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FillWord({
  word,
  progress,
  start,
  end,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const color = useTransform(progress, [start, end], ["#d4d4d4", "#0a0a0a"]);
  return <motion.span style={{ color }}>{word} </motion.span>;
}

function ScrollFill({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.65"],
  });
  const words = text.split(" ");

  if (reduced) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <FillWord
          key={i}
          word={w}
          progress={scrollYProgress}
          start={i / words.length}
          end={(i + 1) / words.length}
        />
      ))}
    </p>
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
      className={`relative cursor-pointer active:scale-[0.96] [transition-property:scale,color] duration-150 ease-out ${className ?? ""}`}
    >
      <span className="invisible" aria-hidden>
        contact
      </span>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={String(copied)}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.3, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        >
          {copied ? "copied" : "contact"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const CAPABILITIES = [
  {
    label: "uncover",
    body: "the agents read what you actually run, artifact by artifact. missing source, stale builds, and third party code included.",
  },
  {
    label: "prove",
    body: "every component and every reachable weakness, traced to the artifact it lives in and confirmed against the running system.",
  },
  {
    label: "remediate",
    body: "the agents write the fix, apply it, and check it against the real system. finding and closing stop being two jobs.",
  },
];

const STATS = [
  { value: "reads artifacts", label: "not just source" },
  { value: "proves reachability", label: "not just a cve list" },
  { value: "ships the fix", label: "not just a ticket" },
  { value: "runs local", label: "not just a promise" },
];

const serif = "font-[family-name:var(--font-record-disc)]";

const WORD = "semicentric".split("");
const LEAD_S = 0.08;
const STEP_S = 0.045;
const LETTERS_DONE_S = LEAD_S + (WORD.length - 1) * STEP_S;
const LOGO_AT_S = LETTERS_DONE_S + 0.08;
const SUB_AT_S = LOGO_AT_S + 0.35;

function HeroTitle() {
  const reduced = useReducedMotion();
  return (
    <div className="flex w-full justify-center">
      <h1
        className={`${serif} relative inline-flex items-center text-[clamp(2.5rem,11vw,6.5rem)] leading-none tracking-tight text-neutral-900`}
      >
        <span className="sr-only">semicentric</span>
        <span aria-hidden className="inline-flex">
          {WORD.map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.65,
                ease: EASE,
                delay: reduced ? 0 : LEAD_S + i * STEP_S,
              }}
              style={{ willChange: "filter, opacity" }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </span>

        <span
          aria-hidden
          className="relative z-10 inline-flex ml-[0.16em] shrink-0 overflow-visible"
          style={{ height: "0.78em", aspectRatio: "604/440" }}
        >
          <Logo
            className="h-full w-auto text-neutral-900"
            animated
            delay={reduced ? 0 : LOGO_AT_S}
          />
        </span>
      </h1>
    </div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  return (
    <div className="w-full">
      <div className="relative z-10 bg-[#fafafa] shadow-[0_20px_45px_-14px_rgba(0,0,0,0.4)]">
        <section className="px-6 md:px-12 pt-28 pb-28 md:pt-40 md:pb-36">
          <div className="mx-auto w-full max-w-3xl flex flex-col items-center text-center">
            <HeroTitle />

            <motion.p
              initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: reduced ? 0 : SUB_AT_S, ease: EASE }}
              className="mt-10 max-w-md text-neutral-600 text-base md:text-lg leading-relaxed [text-wrap:pretty]"
            >
              security that understands your systems as well as the people
              trying to break them.
            </motion.p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 md:px-12 py-28 md:py-44">
            <ScrollFill
              className={`${serif} text-3xl md:text-5xl leading-[1.25] tracking-tight [text-wrap:pretty]`}
              text="scanners read the code you wrote. attackers read the system you actually shipped. semicentric reads the second one. it maps every container, binary, and dependency you run, proves what an attacker could reach, then closes it. nothing leaves your machine."
            />
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-5xl px-6 md:px-12 py-24 md:py-36">
            <Reveal
              blur={false}
              className="text-xs uppercase tracking-[0.2em] text-neutral-400"
            >
              what we do
            </Reveal>
            <Reveal
              delay={0.06}
              className={`${serif} mt-6 max-w-2xl text-3xl md:text-4xl leading-tight tracking-tight text-neutral-900 [text-wrap:balance]`}
            >
              we find what an attacker would find, and we close it first.
            </Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 md:grid-cols-3">
              {CAPABILITIES.map((c, i) => (
                <Reveal
                  key={c.label}
                  delay={i * 0.1}
                  className="flex flex-col gap-4 bg-[#fafafa] p-8 md:p-10"
                >
                  <span className={`${serif} text-2xl tracking-tight text-neutral-900`}>
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
            <Reveal
              blur={false}
              className="text-xs uppercase tracking-[0.2em] text-neutral-400"
            >
              the waitlist is open
            </Reveal>
            <Reveal
              delay={0.06}
              className={`${serif} mt-6 text-4xl md:text-6xl leading-[1.05] tracking-tight text-neutral-900 [text-wrap:balance]`}
            >
              be first to deploy.
            </Reveal>
            <Reveal
              delay={0.12}
              className="mt-6 max-w-md text-lg text-neutral-600 leading-relaxed [text-wrap:pretty]"
            >
              we onboard in small batches. leave your email and we&rsquo;ll tell
              you when yours comes up.
            </Reveal>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 w-full max-w-3xl">
              {STATS.map((s, i) => (
                <Reveal
                  key={s.value}
                  delay={i * 0.08}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`${serif} text-2xl md:text-3xl tracking-tight text-neutral-900 [text-wrap:balance]`}
                  >
                    {s.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-neutral-400">
                    {s.label}
                  </span>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1} className="mt-16 flex justify-center w-full">
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
              <ContactLink className="hover:text-white" />
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
