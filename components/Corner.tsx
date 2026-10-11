"use client";

import Projects from "./Projects";
import { In, Links, Wordmark } from "./shared";
import Waitlist from "./Waitlist";

export default function Corner() {
  return (
    <div className="flex min-h-dvh flex-col gap-12 px-6 py-10 sm:px-12 sm:py-14 md:h-dvh md:overflow-hidden">
      {/* The face carries ~0.09em of empty ascent above its letters, so pull the
          wordmark up by that much to match the footer's edge optically. */}
      <Wordmark className="-mt-[0.09em] text-[1.75rem] sm:text-[2rem]" />

      {/* On desktop the page is exactly one screen; the row is sized from this
          box's height via container units, so nothing ever scrolls. */}
      <div className="flex flex-1 items-center md:min-h-0 md:[container-type:size]">
        <Projects />
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <In delay={0.5} className="order-2 sm:order-1">
          {/* The waitlist's 0.5rem corners read as starting at their 45° point,
              r(1 - 1/√2) in from the box edge, so the links sit on that line. */}
          <Links className="justify-between px-[calc(0.5rem*(1-1/sqrt(2)))] max-[380px]:text-[13px] sm:justify-start sm:px-0" />
        </In>
        <In delay={0.58} className="order-1 w-full sm:order-2 sm:max-w-[17rem]">
          <Waitlist />
        </In>
      </div>
    </div>
  );
}
