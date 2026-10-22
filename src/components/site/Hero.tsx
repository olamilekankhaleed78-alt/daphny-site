"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatNairaPrice } from "@/lib/helpers";
import type { MenuItemData, SiteSettings } from "@/lib/types";
import {
  IconArrowDown,
  IconBasket,
  IconClock,
  IconFlame,
  IconStar,
  IconWhatsApp,
} from "@/components/icons";

interface HeroProps {
  settings: SiteSettings;
  signatureDishes: MenuItemData[];
  totalDishes: number;
  whatsappUrl: string;
}

/** Live Lagos clock — the kitchen genuinely runs on West Africa Time. */
function useLagosClock() {
  const [now, setNow] = useState<{ time: string; isOpen: boolean } | null>(null);

  useEffect(() => {
    const tick = () => {
      try {
        const time = new Intl.DateTimeFormat("en-NG", {
          timeZone: "Africa/Lagos",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
        const hour = parseInt(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: "Africa/Lagos",
            hour: "2-digit",
            hour12: false,
          }).format(new Date()),
          10
        );
        setNow({ time, isOpen: hour >= 11 && hour < 22 });
      } catch {
        setNow(null);
      }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export default function Hero({
  settings,
  signatureDishes,
  totalDishes,
  whatsappUrl,
}: HeroProps) {
  const { totalItems, subtotal } = useCart();
  const clock = useLagosClock();
  const [heroFailed, setHeroFailed] = useState(false);

  const cheapestSignature = signatureDishes
    .filter((d) => d.isAvailable)
    .sort((a, b) => a.price - b.price)[0];

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="grain relative overflow-hidden bg-ivory pt-[7.5rem] pb-16 sm:pt-[8.5rem] lg:pb-24">
      {/* Layered ambient background */}
      <div className="adaire-pattern pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(217,164,65,0.30) 0%, rgba(217,164,65,0) 68%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-56 -left-40 h-[32rem] w-[32rem] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(27,77,62,0.24) 0%, rgba(27,77,62,0) 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8">
        {/* ─── Copy column ─── */}
        <div className="max-w-xl">
          <div className="animate-slide-down mb-6 inline-flex items-center gap-2.5 rounded-full border border-forest/20 bg-white/70 py-1.5 pr-4 pl-2 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  clock?.isOpen ? "animate-badge-ping bg-clay" : "bg-bone"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  clock?.isOpen ? "bg-clay" : "bg-bone"
                }`}
              />
            </span>
            <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-charcoal uppercase">
              {clock?.isOpen ? "Kitchen open" : "Kitchen closed"}
              {clock ? ` · ${clock.time} WAT` : ""}
            </span>
          </div>

          <p className="animate-slide-down mb-4 font-sans text-[11px] font-bold tracking-[0.24em] text-clay uppercase">
            {settings.hero_eyebrow}
          </p>

          <h2
            className="animate-slide-down font-serif text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.98] font-black tracking-[-0.02em] text-charcoal"
            style={{ animationDelay: "60ms" }}
          >
            {(() => {
              const title =
                settings.hero_title?.trim() || "Everything here is cooked over wood.";
              const words = title.split(/\s+/);
              const lastRaw = words.pop() ?? "";
              const match = lastRaw.match(/^(.*?)([.!?,;:]*)$/);
              const lastWord = match?.[1] || lastRaw;
              const lastPunct = match?.[2] ?? "";

              return (
                <>
                  {words.map((word, i) => (
                    <span key={`${word}-${i}`}>{word} </span>
                  ))}
                  <span className="relative inline-block text-forest">
                    {lastWord}
                    <svg
                      className="absolute -bottom-1.5 left-0 h-3 w-full text-clay"
                      viewBox="0 0 200 12"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 8C40 3 84 2 122 5c26 2 48 5 76 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  {lastPunct}
                </>
              );
            })()}
          </h2>

          <p
            className="animate-slide-down mt-7 max-w-lg font-sans text-[15px] leading-relaxed text-charcoal/70 sm:text-base"
            style={{ animationDelay: "120ms" }}
          >
            {settings.hero_subtitle}
          </p>

          <div
            className="animate-slide-down mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <button
              type="button"
              onClick={scrollToMenu}
              className="shimmer group inline-flex items-center gap-2.5 rounded-card bg-forest px-6 py-3.5 font-sans text-sm font-bold tracking-[0.08em] text-ivory uppercase shadow-[0_18px_38px_-18px_rgba(27,77,62,1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-hover"
            >
              <IconBasket className="h-4.5 w-4.5" />
              Build my order
              {totalItems > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold tabular-nums">
                  {formatNairaPrice(subtotal)}
                </span>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-card border border-charcoal/20 px-6 py-3.5 font-sans text-sm font-bold tracking-[0.08em] text-charcoal uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-[#128C4B]"
            >
              <IconWhatsApp className="h-4.5 w-4.5" />
              Chat with kitchen
            </a>
          </div>

          {/* Trust strip */}
          <div
            className="animate-slide-down mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-charcoal/10 pt-6"
            style={{ animationDelay: "240ms" }}
          >
            {[
              { icon: <IconFlame className="h-4 w-4" />, value: "Wood fire", label: "Cooked daily, never held over" },
              { icon: <IconBasket className="h-4 w-4" />, value: `${totalDishes}`, label: "Dishes on tonight's board" },
              { icon: <IconStar className="h-4 w-4" />, value: "4.9", label: "From 1,240 Lagos orders" },
            ].map((stat, i) => (
              <div key={i}>
                <span className="mb-1.5 inline-flex text-clay">{stat.icon}</span>
                <p className="font-serif text-lg leading-none font-bold text-charcoal">
                  {stat.value}
                </p>
                <p className="mt-1.5 font-sans text-[11px] leading-snug text-bone">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Image column ─── */}
        <div className="relative">
          <div
            className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-charcoal shadow-[0_40px_80px_-40px_rgba(26,23,20,0.7)] sm:aspect-[5/5] lg:aspect-[4/4.6]"
            style={{ borderRadius: "46% 46% 12px 12px / 24% 24% 6px 6px" }}
          >
            {heroFailed ? (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_40%_30%,#2f6f57,#143b2f)]">
                <IconFlame className="h-16 w-16 text-gold/40" />
              </div>
            ) : (
              <img
                src={settings.hero_image_url}
                alt="A spread of Nigerian dishes from the Daphny Dodo kitchen"
                onError={() => setHeroFailed(true)}
                className="animate-ken-burns h-full w-full object-cover"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/10" />
          </div>

          {/* Floating card — tonight's pot */}
          {cheapestSignature && (
            <div className="animate-floaty absolute -bottom-4 -left-2 w-56 rounded-card border border-charcoal/10 bg-white/95 p-3.5 shadow-[0_20px_44px_-22px_rgba(26,23,20,0.6)] backdrop-blur sm:-left-6">
              <p className="font-sans text-[9px] font-bold tracking-[0.2em] text-clay uppercase">
                Tonight&apos;s pot
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-sm bg-canvas">
                  <img
                    src={cheapestSignature.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                    }}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-serif text-sm font-bold text-charcoal">
                    {cheapestSignature.title}
                  </span>
                  <span className="block font-sans text-xs font-bold text-forest">
                    {formatNairaPrice(cheapestSignature.price)}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={scrollToMenu}
                className="mt-2.5 w-full rounded-sm bg-forest-light py-1.5 font-sans text-[10px] font-bold tracking-[0.14em] text-forest uppercase transition-colors hover:bg-forest hover:text-white"
              >
                Add to my order
              </button>
            </div>
          )}

          {/* Floating card — dispatch clock */}
          <div className="absolute -top-3 -right-1 rounded-card border border-charcoal/10 bg-charcoal px-4 py-3 text-ivory shadow-[0_20px_44px_-22px_rgba(26,23,20,0.8)] sm:-right-5">
            <p className="flex items-center gap-1.5 font-sans text-[9px] font-bold tracking-[0.2em] text-gold uppercase">
              <IconClock className="h-3.5 w-3.5" />
              Dispatch
            </p>
            <p className="mt-1 font-serif text-lg leading-none font-bold">
              {settings.delivery_eta}
            </p>
            <p className="mt-1 font-sans text-[10px] text-ivory/60">across Lagos</p>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative mt-14 flex justify-center lg:mt-6">
        <button
          type="button"
          onClick={scrollToMenu}
          className="group flex flex-col items-center gap-1.5 text-bone transition-colors hover:text-forest"
          aria-label="Scroll to the menu"
        >
          <span className="font-sans text-[10px] font-bold tracking-[0.24em] uppercase">
            See tonight&apos;s board
          </span>
          <IconArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
