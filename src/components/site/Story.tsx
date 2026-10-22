"use client";

import React, { useState } from "react";
import { STORY_BEATS } from "@/lib/content";
import type { SiteSettings } from "@/lib/types";
import { IconLeaf, IconQuote } from "@/components/icons";
import Reveal from "./Reveal";

interface StoryProps {
  settings: SiteSettings;
}

function StoryImage({
  src,
  alt,
  className = "",
  fallbackChar = "D",
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackChar?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div
        className={`flex items-center justify-center bg-[radial-gradient(circle_at_30%_25%,#2f6f57,#143b2f)] ${className}`}
      >
        <span className="font-serif text-6xl font-black text-white/20">{fallbackChar}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export default function Story({ settings }: StoryProps) {
  return (
    <section
      id="story"
      className="grain relative overflow-hidden bg-charcoal py-20 text-ivory lg:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 15% 10%, rgba(217,164,65,0.22), transparent 60%), radial-gradient(ellipse 55% 45% at 90% 85%, rgba(27,77,62,0.55), transparent 62%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        {/* ─── Sticky image collage ─── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card border border-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
              <StoryImage
                src={settings.chef_image_url}
                alt={`${settings.chef_name} cooking over an open flame`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/75 via-transparent to-transparent" />
            </div>

            <div className="animate-floaty absolute -right-4 -bottom-10 w-40 overflow-hidden rounded-card border-4 border-charcoal shadow-2xl sm:-right-8 sm:w-52">
              <div className="aspect-[4/3]">
                <StoryImage
                  src={settings.kitchen_image_url}
                  alt="Wood-fire kitchen in Lagos"
                  fallbackChar="K"
                />
              </div>
            </div>

            <div className="absolute -top-5 -left-3 hidden rounded-card bg-clay px-4 py-3 text-white shadow-xl sm:block">
              <p className="font-serif text-2xl leading-none font-black">11</p>
              <p className="mt-1 font-sans text-[9px] font-bold tracking-[0.2em] uppercase">
                Years on
                <br />
                the same fire
              </p>
            </div>
          </div>

          {/* Quote card */}
          <div className="mt-16 rounded-card border border-white/12 bg-white/5 p-6 backdrop-blur-sm sm:mt-20">
            <IconQuote className="h-7 w-7 text-gold/70" />
            <blockquote className="mt-4 font-serif text-xl leading-snug font-semibold text-ivory italic">
              “{settings.chef_quote}”
            </blockquote>
            <p className="mt-4 font-sans text-[11px] font-bold tracking-[0.2em] text-gold uppercase">
              {settings.chef_name} · Head cook & owner
            </p>
          </div>
        </div>

        {/* ─── Scrolling narrative ─── */}
        <div>
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.24em] text-gold uppercase">
              <IconLeaf className="h-4 w-4" />
              Our story
            </p>
            <h3 className="font-serif text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-black tracking-[-0.02em]">
              {settings.about_title}
            </h3>
            <p className="mt-6 max-w-xl font-sans text-[15px] leading-[1.85] text-ivory/70">
              {settings.about_body}
            </p>
          </Reveal>

          {/* Timeline */}
          <ol className="mt-14 space-y-0 border-l border-white/15 pl-0">
            {STORY_BEATS.map((beat, i) => (
              <Reveal key={beat.year} delay={i * 90}>
                <li className="group relative pb-10 pl-8 last:pb-0">
                  <span className="absolute top-1.5 -left-[7px] h-3.5 w-3.5 rounded-full border-2 border-charcoal bg-gold transition-all duration-500 group-hover:scale-125 group-hover:bg-clay" />
                  <p className="font-sans text-[10px] font-bold tracking-[0.24em] text-gold uppercase">
                    {beat.year}
                  </p>
                  <h4 className="mt-2 font-serif text-xl font-bold text-ivory transition-colors duration-300 group-hover:text-gold">
                    {beat.title}
                  </h4>
                  <p className="mt-2 max-w-lg font-sans text-sm leading-relaxed text-ivory/60">
                    {beat.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          {/* Numbers */}
          <Reveal delay={120}>
            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/12 bg-white/12 sm:grid-cols-4">
              {[
                { value: "5am", label: "Mile 12 market run" },
                { value: "10", label: "Riders on the road" },
                { value: "1,240+", label: "Orders dispatched" },
                { value: "0", label: "Pots held overnight" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-charcoal px-4 py-5 text-center transition-colors duration-300 hover:bg-charcoal-soft"
                >
                  <p className="font-serif text-2xl leading-none font-black text-gold">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-sans text-[10px] leading-snug tracking-[0.1em] text-ivory/55 uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
