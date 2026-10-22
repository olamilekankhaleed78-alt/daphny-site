"use client";

import React from "react";
import { formatNairaPrice, getDeliveryFee, sanitizePhoneForTel } from "@/lib/helpers";
import { DELIVERY_ZONES } from "@/lib/helpers";
import type { SiteSettings } from "@/lib/types";
import {
  IconArrowRight,
  IconClock,
  IconInstagram,
  IconLogoMark,
  IconMail,
  IconPhone,
  IconPin,
  IconWhatsApp,
} from "@/components/icons";

interface FooterProps {
  settings: SiteSettings;
  whatsappUrl: string;
}

const FOOTER_NAV = [
  { id: "menu", label: "Tonight's board" },
  { id: "signature", label: "Signature pots" },
  { id: "story", label: "Our story" },
  { id: "delivery", label: "Delivery zones" },
  { id: "voices", label: "Voices" },
];

export default function Footer({ settings, whatsappUrl }: FooterProps) {
  const telHref = `tel:${sanitizePhoneForTel(settings.phone_number)}`;
  const year = new Date().getFullYear();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer id="contact" className="relative overflow-hidden bg-charcoal text-ivory">
      {/* CTA band */}
      <div className="relative border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 90% at 20% 0%, rgba(194,87,26,0.30), transparent 60%), radial-gradient(ellipse 50% 80% at 85% 100%, rgba(27,77,62,0.55), transparent 60%)",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-16">
          <div>
            <p className="font-sans text-[11px] font-bold tracking-[0.24em] text-gold uppercase">
              Hungry already?
            </p>
            <h3 className="mt-3 max-w-xl font-serif text-[clamp(1.8rem,4vw,2.9rem)] leading-[1.05] font-black tracking-[-0.02em]">
              Start the tray — it takes about forty seconds.
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollTo("menu")}
              className="shimmer group inline-flex items-center gap-2 rounded-card bg-ivory px-6 py-3.5 font-sans text-xs font-bold tracking-[0.14em] text-charcoal uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold"
            >
              View the menu
              <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-card border border-white/25 px-6 py-3.5 font-sans text-xs font-bold tracking-[0.14em] text-ivory uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-[#25D366] hover:text-[#25D366]"
            >
              <IconWhatsApp className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-28 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-ivory">
                <IconLogoMark className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-serif text-lg leading-none font-bold">
                  {settings.business_name}
                </span>
                <span className="mt-1 block font-sans text-[9px] font-bold tracking-[0.3em] text-gold uppercase">
                  Lagos · Est. 2014
                </span>
              </span>
            </div>
            <p className="mt-5 font-sans text-sm leading-relaxed text-ivory/55">
              Authentic Nigerian cuisine cooked over wood fire in small batches every single
              day — and delivered hot to your door across Lagos.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ivory/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  <IconInstagram className="h-4 w-4" />
                </a>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ivory/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#25D366] hover:text-[#25D366]"
              >
                <IconWhatsApp className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${settings.email}`}
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ivory/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
              >
                <IconMail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-5 font-sans text-[10px] font-bold tracking-[0.2em] text-ivory/40 uppercase">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_NAV.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.id)}
                    className="nav-sweep font-sans text-sm text-ivory/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="/admin"
                  className="nav-sweep font-sans text-sm text-ivory/70 transition-colors hover:text-gold"
                >
                  Kitchen console
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 font-sans text-[10px] font-bold tracking-[0.2em] text-ivory/40 uppercase">
              Contact
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href={telHref}
                  className="group flex items-start gap-2.5 font-sans text-sm text-ivory/70 transition-colors hover:text-gold"
                >
                  <IconPhone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold/70" />
                  {settings.phone_number}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="group flex items-start gap-2.5 font-sans text-sm break-all text-ivory/70 transition-colors hover:text-gold"
                >
                  <IconMail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold/70" />
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 font-sans text-sm text-ivory/70">
                <IconPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold/70" />
                {settings.address}
              </li>
              <li className="flex items-start gap-2.5 font-sans text-sm text-ivory/70">
                <IconClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold/70" />
                <span>
                  {settings.opening_hours}
                  <br />
                  <span className="text-ivory/45">Last order {settings.kitchen_close}</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Zones */}
          <div>
            <h4 className="mb-5 font-sans text-[10px] font-bold tracking-[0.2em] text-ivory/40 uppercase">
              Delivery fees
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {DELIVERY_ZONES.map((zone) => (
                <li key={zone} className="flex items-baseline justify-between gap-2">
                  <span className="font-sans text-xs text-ivory/60">{zone}</span>
                  <span className="font-sans text-xs font-bold text-gold tabular-nums">
                    {formatNairaPrice(getDeliveryFee(zone, settings))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-sans text-[11px] leading-relaxed text-ivory/40">
              Free delivery on orders above {formatNairaPrice(Number(settings.free_delivery_threshold) || 0)}.
            </p>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="mt-14 overflow-hidden border-t border-white/10 pt-8">
          <p
            className="translate-y-[18%] text-center font-serif text-[clamp(2.6rem,13vw,11rem)] leading-none font-black tracking-[-0.03em] whitespace-nowrap text-white/6 select-none"
            aria-hidden="true"
          >
            DAPHNY DODO CUISINE
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="font-sans text-xs text-ivory/40">
            © {year} {settings.business_name}. All rights reserved.
          </p>
          <p className="font-sans text-[11px] text-ivory/35">
            Built as a native Next.js cart engine — zero third-party checkout redirects.
          </p>
        </div>
      </div>
    </footer>
  );
}
