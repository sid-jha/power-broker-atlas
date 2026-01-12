"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-ink/20 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-ink/70 transition hover:border-ember/50 hover:text-ember"
    >
      {copied ? "Copied" : "Share"}
    </button>
  );
}
