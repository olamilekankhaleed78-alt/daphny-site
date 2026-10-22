"use client";

import React, { useCallback, useEffect, useState } from "react";
import { TESTIMONIALS } from "@/lib/content";
import { IconQuote, IconStar } from "@/components/icons";
import Reveal from "./Reveal";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "text-gold" : "text-charcoal/15"}`}
        />
      ))}
    </span>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  const next = useCallback(() => setActive((v) => (v + 1) % count), [count]);
  const prev = useCallback(() => setActive((v) => (v - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || count === 0) return;
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [paused, next, count]);

  if (count === 0) return null;
  const featured = TESTIMONIALS[active];

  return (
    <section id="voices" className="relative overflow-hidden bg-canvas py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 10% 100%, rgba(27,77,62,0.14), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 font-sans text-[11px] font-bold tracking-[0.24em] text-clay uppercase">
              Voices from the queue
            </p>
            <h3 className="font-serif text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-black tracking-[-0.02em] text-charcoal">
              Lagos keeps talking.
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 text-charcoal transition-all duration-300 hover:border-forest hover:bg-forest hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M14.5 6.5 9 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 text-charcoal transition-all duration-300 hover:border-forest hover:bg-forest hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="m9.5 6.5 5.5 5.5-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </Reveal>

        {/* Featured rotating quote */}
        <div
          className="relative mb-14 overflow-hidden rounded-card border border-charcoal/10 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(26,23,20,0.6)] sm:p-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <IconQuote className="absolute top-6 right-8 h-16 w-16 text-forest-light sm:h-24 sm:w-24" />

          <div key={active} className="animate-fade-in relative max-w-3xl">
            <Stars rating={featured.rating} />
            <blockquote className="mt-6 font-serif text-[clamp(1.35rem,3vw,2.1rem)] leading-[1.35] font-semibold tracking-tight text-charcoal">
              “{featured.text}”
            </blockquote>
            <p className="mt-7 font-sans text-xs font-bold tracking-[0.18em] text-clay uppercase">
              {featured.name} <span className="text-bone">· {featured.zone}</span>
            </p>
          </div>

          {/* Dots */}
          <div className="relative mt-8 flex items-center gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show review from ${t.name}`}
                className={`h-1.5 rounded-full transition-all duration-400 ${
                  i === active ? "w-8 bg-forest" : "w-3 bg-charcoal/15 hover:bg-charcoal/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scattered postcards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.slice(0, 6).map((t, i) => {
            const tilts = ["-rotate-[1.6deg]", "rotate-[1.2deg]", "-rotate-[0.8deg]"];
            return (
              <Reveal key={t.name} delay={i * 70}>
                <figure
                  className={`group h-full rounded-card border border-charcoal/10 bg-ivory p-6 transition-all duration-500 hover:rotate-0 hover:-translate-y-1.5 hover:border-forest/30 hover:shadow-[0_28px_54px_-30px_rgba(26,23,20,0.5)] ${
                    tilts[i % tilts.length]
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Stars rating={t.rating} />
                    <span className="font-serif text-4xl leading-none text-charcoal/10 transition-colors duration-500 group-hover:text-clay/30">
                      ”
                    </span>
                  </div>
                  <figcaption className="mt-4">
                    <p className="font-sans text-sm leading-relaxed text-charcoal/75">
                      {t.text}
                    </p>
                    <p className="mt-4 border-t border-charcoal/10 pt-3 font-sans text-[11px] font-bold tracking-[0.16em] text-forest uppercase">
                      {t.name}
                      <span className="ml-2 font-medium tracking-normal text-bone normal-case">
                        {t.zone}
                      </span>
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
