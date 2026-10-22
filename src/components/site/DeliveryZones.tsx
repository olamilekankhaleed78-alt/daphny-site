"use client";

import React from "react";
import { DELIVERY_ZONES, formatNairaPrice, getDeliveryFee, getFreeDeliveryThreshold, parseDeliveryFees } from "@/lib/helpers";
import { DELIVERY_ZONE_ETAS, HOW_IT_WORKS } from "@/lib/content";
import type { SiteSettings } from "@/lib/types";
import { IconClock, IconPin, IconScooter, IconTruck } from "@/components/icons";
import Reveal from "./Reveal";

interface DeliveryZonesProps {
  settings: SiteSettings;
}

export default function DeliveryZones({ settings }: DeliveryZonesProps) {
  const fees = parseDeliveryFees(settings);
  const threshold = getFreeDeliveryThreshold(settings);
  const cheapestZone = Object.entries(fees).sort((a, b) => a[1] - b[1])[0];

  return (
    <section id="delivery" className="relative overflow-hidden bg-ivory py-20 lg:py-28">
      <div className="adaire-pattern pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.24em] text-clay uppercase">
              <IconScooter className="h-4 w-4" />
              Logistics
            </p>
            <h3 className="font-serif text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-black tracking-[-0.02em] text-charcoal">
              We ride the whole of Lagos.
            </h3>
            <p className="mt-5 max-w-xl font-sans text-[15px] leading-relaxed text-charcoal/65">
              Delivery is priced per zone the moment you pick one at checkout — no surprise
              charges, no phone negotiation. Orders above{" "}
              <strong className="font-bold text-forest">{formatNairaPrice(threshold)}</strong>{" "}
              ride free.
            </p>
          </div>

          <div className="flex-shrink-0 rounded-card border border-forest/20 bg-forest-light px-6 py-5">
            <p className="font-sans text-[10px] font-bold tracking-[0.2em] text-forest uppercase">
              Average dispatch
            </p>
            <p className="mt-1.5 font-serif text-3xl leading-none font-black text-forest">
              {settings.delivery_eta}
            </p>
            <p className="mt-2 flex items-center gap-1.5 font-sans text-[11px] text-charcoal/60">
              <IconClock className="h-3.5 w-3.5" />
              Kitchen closes {settings.kitchen_close}
            </p>
          </div>
        </Reveal>

        {/* Zone grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DELIVERY_ZONES.map((zone, i) => {
            const fee = getDeliveryFee(zone, settings);
            const eta = DELIVERY_ZONE_ETAS[zone] ?? "On request";
            const isCheapest = cheapestZone && zone === cheapestZone[0];

            return (
              <Reveal key={zone} delay={i * 45}>
                <div
                  className={`group relative h-full overflow-hidden rounded-card border p-4 transition-all duration-400 hover:-translate-y-1 ${
                    isCheapest
                      ? "border-clay/40 bg-clay-light"
                      : "border-charcoal/10 bg-white hover:border-forest/35"
                  }`}
                >
                  {isCheapest && (
                    <span className="absolute top-0 right-0 rounded-bl-sm bg-clay px-2 py-0.5 font-sans text-[8px] font-bold tracking-[0.14em] text-white uppercase">
                      Our street
                    </span>
                  )}
                  <p className="flex items-center gap-1.5 font-serif text-base font-bold text-charcoal">
                    <IconPin
                      className={`h-4 w-4 transition-colors ${
                        isCheapest ? "text-clay" : "text-bone group-hover:text-forest"
                      }`}
                    />
                    {zone}
                  </p>
                  <p className="mt-2.5 font-sans text-xl leading-none font-extrabold text-forest tabular-nums">
                    {fee === 0 ? "Free" : formatNairaPrice(fee)}
                  </p>
                  <p className="mt-2 font-sans text-[11px] text-bone">{eta}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-20">
          <Reveal className="mb-8 text-center">
            <p className="font-sans text-[11px] font-bold tracking-[0.24em] text-clay uppercase">
              Three taps, no redirects
            </p>
            <h4 className="mt-3 font-serif text-3xl font-black tracking-tight text-charcoal sm:text-4xl">
              How ordering works here
            </h4>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.step} delay={i * 110}>
                <div className="group relative h-full overflow-hidden rounded-card border border-charcoal/10 bg-white p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-forest/30 hover:shadow-[0_28px_54px_-30px_rgba(26,23,20,0.5)]">
                  <span className="pointer-events-none absolute -top-3 -right-1 font-serif text-[6rem] leading-none font-black text-canvas transition-colors duration-500 group-hover:text-forest-light select-none">
                    {step.step}
                  </span>
                  <span className="relative mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest text-ivory transition-transform duration-500 group-hover:rotate-[-8deg]">
                    <IconTruck className="h-5 w-5" />
                  </span>
                  <h5 className="relative font-serif text-xl font-bold text-charcoal">
                    {step.title}
                  </h5>
                  <p className="relative mt-3 font-sans text-sm leading-relaxed text-bone">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Payment strip */}
        <Reveal delay={80}>
          <div className="mt-10 flex flex-col items-start gap-4 rounded-card border border-charcoal/10 bg-canvas px-6 py-5 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-forest-light text-forest">
              <IconScooter className="h-5 w-5" />
            </span>
            <p className="font-sans text-sm leading-relaxed text-charcoal/70">
              <strong className="font-bold text-charcoal">Payment.</strong>{" "}
              {settings.payment_info}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
