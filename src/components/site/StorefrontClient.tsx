"use client";

import React, { useMemo, useState } from "react";
import { CartProvider } from "@/context/CartContext";
import { sanitizePhoneForTel, sanitizePhoneForWhatsApp } from "@/lib/helpers";
import { GALLERY_IDS, galleryPhoto } from "@/lib/content";
import type { MenuItemData, SiteSettings } from "@/lib/types";
import Header from "./Header";
import Hero from "./Hero";
import Marquee from "./Marquee";
import SignaturePots from "./SignaturePots";
import MenuShowcase from "./MenuShowcase";
import Story from "./Story";
import DeliveryZones from "./DeliveryZones";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import WhatsAppFab from "./WhatsAppFab";
import CartDrawer from "./CartDrawer";
import Reveal from "./Reveal";
import { IconBasket } from "@/components/icons";

interface StorefrontClientProps {
  settings: SiteSettings;
  menuItems: MenuItemData[];
}

/* ─── Gallery strip ─── */
function GalleryStrip() {
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const labels = [
    "Party jollof, wood fire",
    "Suya off the coal",
    "Puff puff, fried to order",
    "Whole grilled tilapia",
    "Zobo over crushed ice",
    "Assorted meat, peppered",
  ];

  return (
    <section className="relative overflow-hidden bg-charcoal py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[11px] font-bold tracking-[0.24em] text-gold uppercase">
              From the pass
            </p>
            <h3 className="mt-2 font-serif text-3xl font-black tracking-tight text-ivory sm:text-4xl">
              Tonight, unretouched.
            </h3>
          </div>
          <p className="max-w-sm font-sans text-sm leading-relaxed text-ivory/50">
            No food styling, no gloss spray. This is what leaves the kitchen between 6pm and
            9pm on a normal Lagos weekday.
          </p>
        </Reveal>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {GALLERY_IDS.map((id, i) => (
            <Reveal
              key={id}
              delay={i * 60}
              className="w-[70vw] flex-shrink-0 snap-start sm:w-auto"
            >
              <figure className="group relative aspect-square overflow-hidden rounded-card border border-white/10">
                {broken[id] ? (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#2f6f57,#143b2f)]">
                    <IconBasket className="h-8 w-8 text-white/20" />
                  </div>
                ) : (
                  <img
                    src={galleryPhoto(id)}
                    alt={labels[i] ?? "Dish from the Daphny Dodo kitchen"}
                    loading="lazy"
                    decoding="async"
                    onError={() => setBroken((prev) => ({ ...prev, [id]: true }))}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
                <figcaption className="absolute right-3 bottom-3 left-3 translate-y-2 font-sans text-[10px] leading-snug font-bold tracking-[0.12em] text-ivory uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {labels[i] ?? ""}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Storefront shell ─── */
export default function StorefrontClient({ settings, menuItems }: StorefrontClientProps) {
  const cleanPhone = sanitizePhoneForWhatsApp(settings.phone_number);
  const telPhone = sanitizePhoneForTel(settings.phone_number);

  const whatsappUrl = useMemo(
    () =>
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hello ${settings.business_name}! I'd like to make a reservation and ask about tonight's menu.`
      )}`,
    [cleanPhone, settings.business_name]
  );

  const signatureDishes = useMemo(
    () => menuItems.filter((item) => item.isSignature).slice(0, 6),
    [menuItems]
  );

  const marqueeWords = useMemo(() => {
    const names = menuItems.map((i) => i.title).slice(0, 16);
    return names.length > 0 ? names : ["Party jollof", "Egusi & pounded yam", "Beef suya"];
  }, [menuItems]);

  return (
    <CartProvider>
      {/* Checkout modal reads the dispatch number from here. */}
      <div
        data-restaurant-phone={settings.phone_number}
        className="hidden"
        aria-hidden="true"
      />

      <div className="relative min-h-screen bg-canvas selection:bg-forest">
        <a
          href="#menu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-card focus:bg-forest focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to the menu
        </a>

        <Header settings={settings} />

        <Hero
          settings={settings}
          signatureDishes={signatureDishes}
          totalDishes={menuItems.length}
          whatsappUrl={whatsappUrl}
        />

        <Marquee words={marqueeWords} variant="dark" />

        <SignaturePots dishes={signatureDishes} />

        <Marquee words={marqueeWords.slice().reverse()} variant="light" />

        {/* ─── Menu board ─── */}
        <main id="menu" className="relative scroll-mt-28 bg-ivory py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 text-center">
              <span className="mb-3 inline-block font-sans text-[11px] font-bold tracking-[0.24em] text-clay uppercase">
                Our offerings · {menuItems.length} dishes
              </span>
              <h3 className="font-serif text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-black tracking-[-0.02em] text-charcoal">
                Tonight&apos;s board
              </h3>
              <div className="hairline mx-auto mt-5 h-px w-24" />
              <p className="mx-auto mt-5 max-w-xl font-sans text-[15px] leading-relaxed text-charcoal/60">
                Tap a dish to drop it into your tray. Quantities, totals and delivery pricing
                all stay on this page — nothing redirects you anywhere.
              </p>
            </Reveal>

            <MenuShowcase items={menuItems} isLoading={false} />
          </div>
        </main>

        <Story settings={settings} />

        <GalleryStrip />

        <DeliveryZones settings={settings} />

        <Testimonials />

        <Footer settings={settings} whatsappUrl={whatsappUrl} />

        <WhatsAppFab whatsappUrl={whatsappUrl} />

        <CartDrawer settings={settings} />

        {/* Tel target kept reachable for assistive tech */}
        <a href={`tel:${telPhone}`} className="sr-only">
          Call {settings.phone_number}
        </a>
      </div>
    </CartProvider>
  );
}
