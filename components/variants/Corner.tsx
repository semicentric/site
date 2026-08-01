"use client";

import { COPY, In, Links, Wordmark } from "../shared";
import Waitlist from "../Waitlist";

export default function Corner() {
  return (
    <div className="flex min-h-dvh flex-col justify-between px-6 py-10 sm:px-12 sm:py-14">
      <Wordmark className="text-[1.75rem] sm:text-[2rem]" />

      <div className="max-w-[34rem] pb-8 sm:pb-4">
        <In
          as="p"
          className="font-display text-[1.5rem] leading-[1.4] tracking-[-0.014em] text-ink [text-wrap:pretty] sm:text-[1.75rem]"
        >
          {COPY.lead}
        </In>
        <In as="p" delay={0.08} className="mt-6 max-w-[26rem] text-[15px] leading-[1.7] text-body">
          {COPY.what}
        </In>
        <In delay={0.16} className="mt-10">
          <Links />
        </In>
        <In delay={0.24} className="mt-8 w-full max-w-[17rem]">
          <Waitlist />
        </In>
      </div>
    </div>
  );
}
