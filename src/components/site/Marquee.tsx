"use client";

import React from "react";

interface MarqueeProps {
  words: string[];
  variant?: "dark" | "light";
}

/**
 * Seamless dish-name ticker. The track is duplicated and translated -50%,
 * so the loop has no visible seam. Pauses on hover.
 */
export default function Marquee({ words, variant = "dark" }: MarqueeProps) {
  if (!words || words.length === 0) return null;

  const isDark = variant === "dark";

  return (
    <div
      className={`relative overflow-hidden border-y ${
        isDark
          ? "border-forest-hover/40 bg-charcoal text-ivory"
          : "border-charcoal/10 bg-forest-light text-forest"
      }`}
      aria-hidden="true"
    >
      <div className="marquee-track animate-marquee flex w-max items-center gap-8 py-3.5 whitespace-nowrap">
        {Array.from({ length: 2 }).map((_, dup) => (
          <div key={dup} className="flex items-center gap-8">
            {words.map((word, i) => (
              <span key={`${dup}-${i}`} className="flex items-center gap-8">
                <span className="font-serif text-base font-semibold tracking-tight sm:text-lg">
                  {word}
                </span>
                <span className={isDark ? "text-gold" : "text-clay"}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Edge fades */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-16 ${
          isDark
            ? "bg-gradient-to-r from-charcoal to-transparent"
            : "bg-gradient-to-r from-forest-light to-transparent"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-16 ${
          isDark
            ? "bg-gradient-to-l from-charcoal to-transparent"
            : "bg-gradient-to-l from-forest-light to-transparent"
        }`}
      />
    </div>
  );
}
