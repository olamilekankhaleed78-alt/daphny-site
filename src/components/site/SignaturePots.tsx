"use client";

import React, { useCallback, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatNairaPrice, SPICE_LABELS } from "@/lib/helpers";
import type { MenuItemData } from "@/lib/types";
import {
  IconBasket,
  IconChilli,
  IconMinus,
  IconPlus,
} from "@/components/icons";
import Reveal from "./Reveal";

interface SignaturePotsProps {
  dishes: MenuItemData[];
}

export default function SignaturePots({ dishes }: SignaturePotsProps) {
  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart();
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const handleAdd = useCallback(
    (dish: MenuItemData) => {
      if (!dish.isAvailable) return;
      addItem({
        id: dish.id,
        title: dish.title,
        price: dish.price,
        imageUrl: dish.imageUrl,
        category: dish.category,
      });
    },
    [addItem]
  );

  if (dishes.length === 0) return null;

  return (
    <section id="signature" className="relative overflow-hidden bg-canvas py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 85% 0%, rgba(194,87,26,0.10), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <p className="mb-3 font-sans text-[11px] font-bold tracking-[0.24em] text-clay uppercase">
            What people cross Lagos for
          </p>
          <h3 className="font-serif text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-black tracking-[-0.02em] text-charcoal">
            Six pots we would put our name on.
          </h3>
          <p className="mt-5 max-w-xl font-sans text-[15px] leading-relaxed text-charcoal/65">
            Everything here is cooked to order after you submit — nothing sits under a lamp.
            Add what you want; the tray at the bottom of the screen does the maths.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {dishes.map((dish, index) => {
            const qty = getItemQuantity(dish.id);
            const spice = Math.max(0, Math.min(4, dish.spiceLevel ?? 0));
            const offset = index % 2 === 1 ? "lg:mt-16" : "";

            return (
              <Reveal key={dish.id} delay={index * 80} className={offset}>
                <article className="group relative overflow-hidden rounded-card border border-charcoal/10 bg-white shadow-[0_2px_6px_rgba(26,23,20,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-forest/30 hover:shadow-[0_34px_64px_-32px_rgba(26,23,20,0.5)]">
                  {/* Oversized index numeral */}
                  <span className="pointer-events-none absolute -top-6 right-4 z-10 font-serif text-[7rem] leading-none font-black text-white/85 mix-blend-overlay select-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="relative aspect-[16/10] overflow-hidden bg-charcoal">
                    {broken[dish.id] ? (
                      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#2f6f57,#143b2f)]">
                        <IconBasket className="h-12 w-12 text-white/25" />
                      </div>
                    ) : (
                      <img
                        src={dish.imageUrl}
                        alt={dish.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => setBroken((prev) => ({ ...prev, [dish.id]: true }))}
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/15 to-transparent" />

                    <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-sans text-[9px] font-bold tracking-[0.22em] text-gold uppercase">
                          {dish.category}
                        </p>
                        <h4 className="mt-1 truncate font-serif text-2xl leading-tight font-bold text-white">
                          {dish.title}
                        </h4>
                      </div>
                      <span className="flex-shrink-0 rounded-sm bg-white/95 px-3 py-1.5 font-sans text-sm font-extrabold text-forest tabular-nums">
                        {formatNairaPrice(dish.price)}
                      </span>
                    </div>

                    {spice > 0 && (
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-sm bg-charcoal/70 px-2 py-1 backdrop-blur-sm">
                        {Array.from({ length: spice }).map((_, i) => (
                          <IconChilli key={i} className="h-3.5 w-3.5 text-clay" />
                        ))}
                        <span className="ml-1 font-sans text-[9px] font-bold tracking-[0.14em] text-white uppercase">
                          {SPICE_LABELS[spice]}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="clamp-2 font-sans text-[13px] leading-relaxed text-bone">
                      {dish.description}
                    </p>

                    <div className="mt-5">
                      {dish.isAvailable ? (
                        qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAdd(dish)}
                            className="shimmer flex w-full items-center justify-center gap-2 rounded-card border border-forest/25 bg-forest-light py-3 font-sans text-xs font-bold tracking-[0.14em] text-forest uppercase transition-all duration-300 hover:border-forest hover:bg-forest hover:text-white active:scale-[0.98]"
                          >
                            <IconPlus className="h-4 w-4" />
                            Add to order
                          </button>
                        ) : (
                          <div className="flex items-center justify-between overflow-hidden rounded-card bg-forest">
                            <button
                              type="button"
                              onClick={() => decrementItem(dish.id)}
                              aria-label={`Decrease ${dish.title}`}
                              className="flex h-11 w-12 items-center justify-center text-white/85 transition-colors hover:bg-white/15 active:scale-90"
                            >
                              <IconMinus className="h-4 w-4" />
                            </button>
                            <span className="flex-1 text-center font-serif text-sm font-bold text-white tabular-nums">
                              {qty} in your tray
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementItem(dish.id)}
                              aria-label={`Increase ${dish.title}`}
                              className="flex h-11 w-12 items-center justify-center text-white/85 transition-colors hover:bg-white/15 active:scale-90"
                            >
                              <IconPlus className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="w-full cursor-not-allowed rounded-card border border-dashed border-charcoal/15 py-3 text-center font-sans text-xs font-bold tracking-[0.14em] text-bone uppercase">
                          Sold out today
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
