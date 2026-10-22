"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatNairaPrice, sanitizePhoneForTel } from "@/lib/helpers";
import type { SiteSettings } from "@/lib/types";
import {
  IconBars,
  IconBasket,
  IconClose,
  IconLogoMark,
  IconPhone,
} from "@/components/icons";

const NAV_LINKS = [
  { id: "menu", label: "Menu" },
  { id: "signature", label: "Signature" },
  { id: "story", label: "Our story" },
  { id: "delivery", label: "Delivery" },
  { id: "voices", label: "Voices" },
];

interface HeaderProps {
  settings: SiteSettings;
}

export default function Header({ settings }: HeaderProps) {
  const { totalItems, subtotal } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("menu");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      let current = NAV_LINKS[0].id;
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 160) current = link.id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = useCallback((id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const telHref = `tel:${sanitizePhoneForTel(settings.phone_number)}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* ── Announcement ticker ── */}
      <div className="overflow-hidden border-b border-forest-hover/40 bg-forest text-ivory">
        <div className="marquee-track animate-marquee-slow flex w-max items-center gap-10 py-1.5 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-10">
              {[
                settings.announcement,
                `Kitchen · ${settings.opening_hours}`,
                `Dispatch ETA ${settings.delivery_eta}`,
                settings.address,
              ]
                .filter(Boolean)
                .map((text, i) => (
                  <span
                    key={`${dup}-${i}`}
                    className="flex items-center gap-3 font-sans text-[10px] font-semibold tracking-[0.18em] uppercase"
                  >
                    <span className="text-gold">✦</span>
                    {text}
                  </span>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main bar ── */}
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "border-b border-charcoal/10 bg-ivory/90 shadow-[0_8px_30px_-18px_rgba(26,23,20,0.55)] backdrop-blur-xl"
            : "border-b border-transparent bg-ivory/60 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2.5 text-left"
            aria-label="Daphny Dodo Cuisine — back to top"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-forest text-ivory transition-transform duration-500 group-hover:rotate-[-8deg]">
              <IconLogoMark className="h-6 w-6" />
              <span className="absolute -top-1 left-1/2 h-3 w-[2px] -translate-x-1/2 rounded-full bg-gold/0" />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[1.15rem] font-bold tracking-tight text-charcoal">
                Daphny Dodo
              </span>
              <span className="mt-0.5 block font-sans text-[9px] font-bold tracking-[0.32em] text-clay uppercase">
                Cuisine · Lagos
              </span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => goTo(link.id)}
                data-active={activeSection === link.id}
                className="nav-sweep font-sans text-[13px] font-semibold text-charcoal/75 transition-colors hover:text-forest data-[active=true]:text-forest"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <a
              href={telHref}
              className="hidden items-center gap-2 rounded-card border border-charcoal/12 px-3.5 py-2 font-sans text-xs font-semibold text-charcoal/80 transition-all duration-300 hover:border-forest hover:text-forest md:flex"
            >
              <IconPhone className="h-4 w-4 text-forest" />
              {settings.phone_number}
            </a>

            <button
              type="button"
              onClick={() => goTo("menu")}
              className="shimmer relative hidden items-center gap-2 rounded-card bg-charcoal px-4 py-2.5 font-sans text-xs font-bold tracking-[0.12em] text-ivory uppercase transition-all duration-300 hover:bg-forest sm:flex"
            >
              <IconBasket className="h-4 w-4" />
              {totalItems > 0 ? formatNairaPrice(subtotal) : "Order now"}
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 font-sans text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-card border border-charcoal/12 text-charcoal transition-colors hover:border-forest hover:text-forest lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconBars className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div className="animate-slide-down border-t border-charcoal/10 bg-ivory lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
              {NAV_LINKS.map((link, i) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => goTo(link.id)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="animate-slide-down flex items-center justify-between border-b border-charcoal/8 py-3.5 text-left font-serif text-lg font-semibold text-charcoal transition-colors hover:text-forest"
                >
                  {link.label}
                  <span className="font-sans text-[10px] tracking-[0.2em] text-bone uppercase">
                    0{i + 1}
                  </span>
                </button>
              ))}
              <a
                href={telHref}
                className="flex items-center justify-center gap-2 bg-forest py-3.5 font-sans text-xs font-bold tracking-[0.14em] text-ivory uppercase"
              >
                <IconPhone className="h-4 w-4" />
                {settings.phone_number}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
