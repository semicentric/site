"use client";

import { useState } from "react";

export default function FooterLinks() {
  const [copied, setCopied] = useState(false);

  const handleContact = () => {
    navigator.clipboard.writeText("plyght@semicentric.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-5 text-xs tracking-wide">
      <button
        onClick={handleContact}
        className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
      >
        {copied ? "Copied!" : "Contact"}
      </button>
      <a
        href="https://github.com/semicentric"
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-500 hover:text-white transition-colors"
      >
        GitHub
      </a>
      <a
        href="https://x.com/semicentric"
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-500 hover:text-white transition-colors"
      >
        X
      </a>
    </div>
  );
}
