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

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <In delay={0.5} className="order-2 sm:order-1">
          <Links className="justify-between sm:justify-start" />
        </In>
        <In delay={0.58} className="order-1 w-full sm:order-2 sm:max-w-[17rem]">
          <Waitlist />
        </In>
      </div>
    </div>
  );
}
