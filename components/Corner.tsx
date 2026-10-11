"use client";

import Projects from "./Projects";
import { In, Links, Wordmark } from "./shared";
import Waitlist from "./Waitlist";

export default function Corner() {
  return (
    <div className="flex min-h-dvh flex-col gap-12 px-6 py-10 sm:px-12 sm:py-14">
      <Wordmark className="text-[1.75rem] sm:text-[2rem]" />

      <div className="flex flex-1 items-center">
        <Projects />
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <In delay={0.5}>
          <Links />
        </In>
        <In delay={0.58} className="w-full max-w-[17rem]">
          <Waitlist />
        </In>
      </div>
    </div>
  );
}
