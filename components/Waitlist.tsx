"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
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

  return (
    <div className="relative h-6 max-w-xs">
      <AnimatePresence initial={false} mode="wait">
        {state === "done" ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-0 text-[15px] text-muted"
          >
            noted. we will write to you.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute inset-0 flex items-center rounded-lg bg-black/[0.045] pr-1 [transition-property:background-color] duration-200 ease-out focus-within:bg-black/[0.075]"
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
              placeholder="your email"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[15px] text-ink outline-none placeholder:text-faint"
            />
            <button
              type="submit"
              className="shrink-0 cursor-pointer rounded-md px-2.5 py-1.5 text-[15px] text-muted [transition-property:color,scale] duration-150 ease-out hover:text-ink active:scale-[0.95]"
            >
              {state === "loading" ? "…" : state === "error" ? "again" : "send"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
