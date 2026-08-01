"use client";

import { useEffect, useState } from "react";
import Corner from "./variants/Corner";

const FONTS = [
  "record",
  "zodiak",
  "basteleur",
  "sligoil",
  "bluu-next",
  "cabinet-grotesk",
  "departure-mono",
] as const;
type Font = (typeof FONTS)[number];

export default function Site() {
  const [font, setFont] = useState<Font>("record");

  useEffect(() => {
    const read = () => {
      const f = window.location.hash.replace("#", "");
      if ((FONTS as readonly string[]).includes(f)) setFont(f as Font);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <div data-font={font}>
      <Corner />
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-full bg-black/[0.045] p-1 text-[11px] tracking-wide backdrop-blur-sm">
          {FONTS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFont(f);
                window.location.hash = f;
              }}
              className={`cursor-pointer rounded-full px-3 py-1 [transition-property:color,background-color,scale] duration-150 ease-out active:scale-[0.97] ${
                f === font ? "bg-paper text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
