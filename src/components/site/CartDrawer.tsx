"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  formatNairaPrice,
  getDeliveryFee,
  getFreeDeliveryThreshold,
} from "@/lib/helpers";
import type { SiteSettings } from "@/lib/types";
import {
  IconBasket,
  IconChevron,
  IconClose,
  IconMinus,
  IconPlus,
  IconScooter,
  IconTrash,
} from "@/components/icons";
import CheckoutModal from "./CheckoutModal";

interface CartDrawerProps {
  settings: SiteSettings;
}

export default function CartDrawer({ settings }: CartDrawerProps) {
  const {
    items,
    totalItems,
    subtotal,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
  } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleOpenCheckout = useCallback(() => {
    if (totalItems === 0) return;
    setIsExpanded(false);
    setIsCheckoutOpen(true);
  }, [totalItems]);

  const handleCloseCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  /* Collapse the tray whenever the cart empties out. */
  useEffect(() => {
    if (totalItems === 0) setIsExpanded(false);
  }, [totalItems]);

  if (totalItems === 0) return null;

  const threshold = getFreeDeliveryThreshold(settings);
  const remainingForFree = threshold > 0 ? Math.max(0, threshold - subtotal) : 0;
  const progress =
    threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 0;
  const cheapestZone = settings ? getDeliveryFee("Surulere", settings) : 0;

  return (
    <>
      {/* ═══ EXPANDED TRAY ═══ */}
      {isExpanded && (
        <div className="fixed inset-x-0 bottom-[4.25rem] z-40 animate-slide-up md:bottom-[4.75rem]">
          <div className="mx-auto max-w-3xl px-3 pb-2">
            <div className="max-h-[52vh] overflow-y-auto rounded-t-card border border-b-0 border-charcoal/12 bg-white shadow-[0_-18px_50px_-24px_rgba(26,23,20,0.5)]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-charcoal/8 bg-white/95 px-5 py-3 backdrop-blur">
                <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-charcoal uppercase">
                  Your order tray
                </p>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-bone transition-colors hover:text-charcoal"
                  aria-label="Collapse order tray"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>

              <ul className="divide-y divide-charcoal/6">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-canvas">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-sm font-semibold text-charcoal">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-bone">
                        {formatNairaPrice(item.price)} each · {item.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-sm border border-charcoal/12">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.id)}
                        aria-label={`Decrease ${item.title}`}
                        className="flex h-8 w-8 items-center justify-center text-charcoal/70 transition-colors hover:bg-canvas hover:text-clay"
                      >
                        <IconMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center font-sans text-sm font-bold text-charcoal tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.id)}
                        aria-label={`Increase ${item.title}`}
                        className="flex h-8 w-8 items-center justify-center text-charcoal/70 transition-colors hover:bg-canvas hover:text-forest"
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="w-20 text-right font-sans text-sm font-bold text-forest tabular-nums">
                      {formatNairaPrice(item.price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="text-bone/60 transition-colors hover:text-clay"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between bg-ivory px-5 py-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-bone transition-colors hover:text-clay"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  Empty the tray
                </button>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-bone uppercase">
                    Subtotal
                  </p>
                  <p className="font-serif text-lg font-bold text-forest">
                    {formatNairaPrice(subtotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STICKY BOTTOM BAR ═══ */}
      <div className="animate-slide-up fixed inset-x-0 bottom-0 z-40">
        <div className="border-t border-forest/25 bg-white shadow-[0_-6px_28px_rgba(26,23,20,0.12)]">
          {/* Free-delivery progress hairline */}
          {threshold > 0 && (
            <div className="h-[3px] w-full bg-canvas">
              <div
                className="h-full bg-gradient-to-r from-forest to-clay transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-[4.25rem] items-center justify-between gap-4 md:h-[4.75rem]">
              {/* Summary + expander */}
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                aria-expanded={isExpanded}
                className="flex min-w-0 items-center gap-3 rounded-card px-2 py-1.5 text-left transition-colors hover:bg-canvas"
              >
                <span className="relative flex-shrink-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white">
                    <IconBasket className="h-5 w-5" />
                  </span>
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 font-sans text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-sans text-sm font-bold text-charcoal">
                    {totalItems} item{totalItems !== 1 ? "s" : ""} ·{" "}
                    {formatNairaPrice(subtotal)}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 truncate font-sans text-[11px] text-bone">
                    <IconScooter className="h-3.5 w-3.5 flex-shrink-0 text-forest" />
                    {remainingForFree > 0 ? (
                      <>
                        {formatNairaPrice(remainingForFree)} more for free delivery
                      </>
                    ) : (
                      <>Free delivery unlocked · from {formatNairaPrice(cheapestZone)}</>
                    )}
                  </span>
                </span>

                <IconChevron
                  className={`h-4 w-4 flex-shrink-0 text-bone transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mini previews (md+) */}
              <div className="hidden flex-1 items-center justify-center gap-2 overflow-hidden md:flex">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-sm bg-ivory py-1 pr-1.5 pl-1"
                  >
                    <span className="h-6 w-6 overflow-hidden rounded-sm bg-canvas">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                    </span>
                    <span className="max-w-[110px] truncate font-sans text-[11px] font-medium text-charcoal">
                      {item.title}
                    </span>
                    <span className="font-sans text-[10px] text-bone">×{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="ml-0.5 text-bone/50 transition-colors hover:text-clay"
                      aria-label={`Remove ${item.title}`}
                    >
                      <IconClose className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {items.length > 3 && (
                  <span className="flex-shrink-0 font-sans text-[11px] text-bone">
                    +{items.length - 3} more
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={clearCart}
                  title="Clear the order tray"
                  aria-label="Clear the order tray"
                  className="hidden items-center gap-1 rounded-card px-3 py-2 text-xs font-semibold text-bone transition-colors hover:bg-canvas hover:text-clay sm:flex"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  className="shimmer rounded-card bg-forest px-5 py-3 font-sans text-xs font-bold tracking-[0.12em] text-white uppercase shadow-[0_10px_24px_-12px_rgba(27,77,62,1)] transition-all duration-300 hover:bg-forest-hover active:scale-[0.98]"
                >
                  <span className="hidden sm:inline">Delivery verification</span>
                  <span className="sm:hidden">Checkout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CHECKOUT OVERLAY ═══ */}
      {isCheckoutOpen && <CheckoutModal onClose={handleCloseCheckout} settings={settings} />}
    </>
  );
}
