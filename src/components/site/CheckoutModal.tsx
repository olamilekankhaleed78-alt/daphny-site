"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useCart } from "@/context/CartContext";
import {
  DELIVERY_ZONES,
  dispatchWhatsAppOrder,
  formatNairaPrice,
  getDeliveryFee,
  getFreeDeliveryThreshold,
  getMinimumOrder,
  buildWhatsAppOrderMessage,
  sanitizePhoneForWhatsApp,
  type CheckoutFormData,
} from "@/lib/helpers";
import type { OrderRecord, SiteSettings } from "@/lib/types";
import {
  IconAlert,
  IconCheck,
  IconClose,
  IconReceipt,
  IconScooter,
  IconWhatsApp,
} from "@/components/icons";

interface CheckoutModalProps {
  onClose: () => void;
  settings: SiteSettings;
}

const FIELD_ERRORS: Record<string, string> = {};

export default function CheckoutModal({ onClose, settings }: CheckoutModalProps) {
  const { items, subtotal, totalItems, clearCart } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
    deliveryZone: "",
    note: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>(
    FIELD_ERRORS
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [savedOrder, setSavedOrder] = useState<OrderRecord | null>(null);

  const threshold = getFreeDeliveryThreshold(settings);
  const minimum = getMinimumOrder(settings);

  const zoneFee = useMemo(
    () => getDeliveryFee(formData.deliveryZone || "", settings),
    [formData.deliveryZone, settings]
  );
  const freeDelivery = threshold > 0 && subtotal >= threshold;
  const deliveryFee = freeDelivery ? 0 : zoneFee;
  const grandTotal = subtotal + deliveryFee;
  const belowMinimum = minimum > 0 && subtotal < minimum;

  /* Lock body scroll while the overlay is open. */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  /* Escape closes — never mid-submit. */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isSubmitting]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name is required (minimum 2 characters).";
    }
    const digits = (formData.phoneNumber || "").replace(/[^0-9]/g, "");
    if (!formData.phoneNumber || digits.length < 10) {
      newErrors.phoneNumber = "Valid phone number is required (minimum 10 digits).";
    }
    if (!formData.deliveryAddress || formData.deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress = "Please provide a detailed delivery address.";
    }
    if (!formData.deliveryZone) {
      newErrors.deliveryZone = "Please select a delivery zone.";
    }
    if (belowMinimum) {
      newErrors.deliveryAddress = `Our minimum order is ${formatNairaPrice(minimum)}.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, belowMinimum, minimum]);

  const updateField = useCallback(
    (field: keyof CheckoutFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFormError(null);
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;
      setFormError(null);
      setWarnings([]);

      if (!validateForm()) return;
      if (items.length === 0) {
        setFormError("Your cart is empty.");
        return;
      }

      setIsSubmitting(true);

      try {
        /* 1 — Persist the order server-side. The API re-prices every line from
              the database so a stale or tampered cart can never be submitted. */
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: formData.fullName.trim(),
            phone: formData.phoneNumber.trim(),
            address: formData.deliveryAddress.trim(),
            zone: formData.deliveryZone.trim(),
            note: (formData.note || "").trim(),
            items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          order?: OrderRecord;
          errors?: string[];
          warnings?: string[];
        };

        if (!response.ok || !payload.ok || !payload.order) {
          const message =
            payload.errors && payload.errors.length > 0
              ? payload.errors.join(" ")
              : "We could not record your order. Please try again.";
          setFormError(message);
          setIsSubmitting(false);
          return;
        }

        const order = payload.order;
        if (payload.warnings && payload.warnings.length > 0) {
          setWarnings(payload.warnings);
        }
        setSavedOrder(order);

        /* 2 — Fire the WhatsApp dispatch with the server-confirmed totals. */
        const restaurantPhone =
          document.querySelector("[data-restaurant-phone]")?.getAttribute("data-restaurant-phone") ||
          settings.phone_number;

        const dispatchPayload: CheckoutFormData = {
          fullName: order.customerName,
          phoneNumber: order.phone,
          deliveryAddress: order.address,
          deliveryZone: order.zone,
          note: order.note,
          deliveryFee: order.deliveryFee,
          orderReference: order.reference,
        };

        const dispatched = dispatchWhatsAppOrder(
          dispatchPayload,
          order.items,
          order.total,
          restaurantPhone
        );

        /* 3 — Tell the kitchen console the WhatsApp window actually opened. */
        if (dispatched) {
          fetch(`/api/orders/${order.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ waDispatched: true }),
          }).catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : "Unknown patch error";
            console.error(`[CHECKOUT_DISPATCH_SYNC] ${msg}`);
          });
        }

        setSubmitSuccess(true);
        clearCart();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown checkout error";
        console.error(`[CHECKOUT_SUBMIT_ERROR] ${msg}`);
        setFormError("Network error while saving your order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, items, isSubmitting, validateForm, clearCart, settings.phone_number]
  );

  /* Re-open the WhatsApp thread with the exact stored payload. */
  const reopenWhatsApp = useCallback(() => {
    if (!savedOrder) return;
    const restaurantPhone =
      document.querySelector("[data-restaurant-phone]")?.getAttribute("data-restaurant-phone") ||
      settings.phone_number;
    const message = buildWhatsAppOrderMessage(
      {
        fullName: savedOrder.customerName,
        phoneNumber: savedOrder.phone,
        deliveryAddress: savedOrder.address,
        deliveryZone: savedOrder.zone,
        note: savedOrder.note,
        deliveryFee: savedOrder.deliveryFee,
        orderReference: savedOrder.reference,
      },
      savedOrder.items,
      savedOrder.total,
      restaurantPhone
    );
    const clean = sanitizePhoneForWhatsApp(restaurantPhone);
    if (!message || !clean) return;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }, [savedOrder, settings.phone_number]);

  const inputClass = (hasError: boolean) =>
    `w-full rounded-card border bg-white px-4 py-3 font-sans text-sm text-charcoal placeholder:text-bone/70 transition-all focus:outline-none focus:ring-2 ${
      hasError
        ? "border-clay/60 focus:border-clay focus:ring-clay/20"
        : "border-charcoal/12 focus:border-forest focus:ring-forest/15"
    }`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Delivery verification"
    >
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-charcoal/60 backdrop-blur-[3px]"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Panel */}
      <div className="animate-pop-in relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-card">
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-charcoal/8 bg-ivory px-6 py-4">
          <div className="min-w-0">
            <p className="font-sans text-[10px] font-bold tracking-[0.2em] text-clay uppercase">
              Step 2 of 2 · No external redirects
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-charcoal">
              Delivery verification
            </h2>
            <p className="mt-1 font-sans text-xs text-bone">
              {totalItems} item{totalItems !== 1 ? "s" : ""} · dispatched to our kitchen on
              WhatsApp
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-bone transition-colors hover:bg-white hover:text-charcoal disabled:opacity-40"
            aria-label="Close checkout"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* ─── SUCCESS ─── */}
        {submitSuccess && savedOrder ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center px-8 py-10 text-center">
              <span className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-forest-light">
                <span className="animate-badge-ping absolute inset-0 rounded-full bg-forest/30" />
                <IconCheck className="relative h-8 w-8 text-forest" />
              </span>
              <h3 className="font-serif text-3xl font-bold text-charcoal">Order sent!</h3>
              <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-bone">
                Your order has been forwarded to our kitchen via WhatsApp. We&apos;ll confirm
                payment and delivery timing shortly.
              </p>

              <div className="mt-6 w-full rounded-card border border-charcoal/10 bg-canvas px-5 py-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] font-bold tracking-[0.18em] text-bone uppercase">
                    Order reference
                  </span>
                  <span className="font-serif text-lg font-bold text-forest">
                    {savedOrder.reference}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-charcoal/10 pt-3">
                  <span className="font-sans text-xs text-bone">
                    {savedOrder.zone} · {settings.delivery_eta}
                  </span>
                  <span className="font-sans text-base font-extrabold text-charcoal">
                    {formatNairaPrice(savedOrder.total)}
                  </span>
                </div>
              </div>

              {warnings.length > 0 && (
                <ul className="mt-4 w-full space-y-1.5 text-left">
                  {warnings.map((w) => (
                    <li
                      key={w}
                      className="flex items-start gap-2 rounded-sm bg-gold-light px-3 py-2 font-sans text-[11px] text-charcoal/80"
                    >
                      <IconAlert className="mt-px h-3.5 w-3.5 flex-shrink-0 text-clay" />
                      {w}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={reopenWhatsApp}
                  className="flex flex-1 items-center justify-center gap-2 rounded-card border border-forest/30 bg-white py-3 font-sans text-xs font-bold tracking-[0.12em] text-forest uppercase transition-colors hover:bg-forest-light"
                >
                  <IconWhatsApp className="h-4 w-4" />
                  Re-open WhatsApp
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-card bg-forest py-3 font-sans text-xs font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-forest-hover"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ─── BODY ─── */}
            <div className="flex-1 overflow-y-auto">
              {/* Order summary */}
              <div className="border-b border-charcoal/8 px-6 py-4">
                <h3 className="mb-3 flex items-center gap-2 font-sans text-[10px] font-bold tracking-[0.18em] text-bone uppercase">
                  <IconReceipt className="h-3.5 w-3.5" />
                  Order summary
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-sans text-sm text-charcoal">
                          {item.title}
                        </span>
                        <span className="flex-shrink-0 font-sans text-xs text-bone">
                          ×{item.quantity}
                        </span>
                      </div>
                      <span className="ml-3 flex-shrink-0 font-sans text-sm font-semibold text-forest tabular-nums">
                        {formatNairaPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <dl className="mt-3 space-y-1.5 border-t border-charcoal/10 pt-3 font-sans text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-bone">Food subtotal</dt>
                    <dd className="font-semibold text-charcoal tabular-nums">
                      {formatNairaPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-bone">
                      <IconScooter className="h-3.5 w-3.5" />
                      Delivery
                      {formData.deliveryZone ? ` · ${formData.deliveryZone}` : ""}
                    </dt>
                    <dd className="font-semibold text-charcoal tabular-nums">
                      {!formData.deliveryZone ? (
                        <span className="text-bone/70">Select a zone</span>
                      ) : deliveryFee === 0 ? (
                        <span className="text-forest">FREE</span>
                      ) : (
                        formatNairaPrice(deliveryFee)
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-charcoal/10 pt-2">
                    <dt className="font-sans text-sm font-bold text-charcoal">Grand total</dt>
                    <dd className="font-serif text-lg font-bold text-forest tabular-nums">
                      {formatNairaPrice(grandTotal)}
                    </dd>
                  </div>
                </dl>

                {freeDelivery && (
                  <p className="mt-2 rounded-sm bg-forest-light px-3 py-2 font-sans text-[11px] font-semibold text-forest">
                    You qualify for free delivery across Lagos.
                  </p>
                )}
              </div>

              {/* Customer form */}
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
                <h3 className="font-sans text-[10px] font-bold tracking-[0.18em] text-bone uppercase">
                  Customer details
                </h3>

                <div>
                  <label
                    htmlFor="checkout-name"
                    className="mb-1.5 block font-sans text-xs font-semibold text-charcoal"
                  >
                    Full name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={inputClass(Boolean(errors.fullName))}
                    placeholder="e.g. Adaeze Okonkwo"
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 font-sans text-xs text-clay">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="mb-1.5 block font-sans text-xs font-semibold text-charcoal"
                  >
                    Phone number *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    className={inputClass(Boolean(errors.phoneNumber))}
                    placeholder="e.g. 0801 234 5678"
                    disabled={isSubmitting}
                    autoComplete="tel"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 font-sans text-xs text-clay">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-zone"
                    className="mb-1.5 block font-sans text-xs font-semibold text-charcoal"
                  >
                    Delivery zone *
                  </label>
                  <select
                    id="checkout-zone"
                    value={formData.deliveryZone}
                    onChange={(e) => updateField("deliveryZone", e.target.value)}
                    className={`${inputClass(Boolean(errors.deliveryZone))} appearance-none`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select a delivery zone…</option>
                    {DELIVERY_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone} — {formatNairaPrice(getDeliveryFee(zone, settings))}
                      </option>
                    ))}
                  </select>
                  {errors.deliveryZone && (
                    <p className="mt-1 font-sans text-xs text-clay">{errors.deliveryZone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-address"
                    className="mb-1.5 block font-sans text-xs font-semibold text-charcoal"
                  >
                    Detailed Lagos delivery address *
                  </label>
                  <textarea
                    id="checkout-address"
                    value={formData.deliveryAddress}
                    onChange={(e) => updateField("deliveryAddress", e.target.value)}
                    className={`${inputClass(Boolean(errors.deliveryAddress))} min-h-[84px] resize-y`}
                    placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, near Mega Chicken"
                    disabled={isSubmitting}
                    autoComplete="street-address"
                  />
                  {errors.deliveryAddress && (
                    <p className="mt-1 font-sans text-xs text-clay">{errors.deliveryAddress}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-note"
                    className="mb-1.5 block font-sans text-xs font-semibold text-charcoal"
                  >
                    Kitchen note <span className="font-normal text-bone">(optional)</span>
                  </label>
                  <textarea
                    id="checkout-note"
                    value={formData.note ?? ""}
                    onChange={(e) => updateField("note", e.target.value)}
                    className={`${inputClass(false)} min-h-[64px] resize-y`}
                    placeholder="No pepper in the egusi · deliver after 7pm · call on arrival"
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                </div>

                {formError && (
                  <p className="flex items-start gap-2 rounded-card bg-clay-light px-3 py-2.5 font-sans text-xs font-semibold text-clay">
                    <IconAlert className="mt-px h-4 w-4 flex-shrink-0" />
                    {formError}
                  </p>
                )}

                <p className="rounded-card bg-canvas px-3 py-2.5 font-sans text-[11px] leading-relaxed text-bone">
                  {settings.payment_info}
                </p>
              </form>
            </div>

            {/* ─── FOOTER ACTION ─── */}
            <div className="flex-shrink-0 border-t border-charcoal/8 bg-white px-6 py-4">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || items.length === 0 || belowMinimum}
                className="shimmer flex w-full items-center justify-center gap-2 rounded-card bg-[#25D366] py-3.5 font-sans text-sm font-bold tracking-[0.1em] text-charcoal uppercase transition-all duration-300 hover:bg-[#20BD5A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-80"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Recording your order…
                  </>
                ) : (
                  <>
                    <IconWhatsApp className="h-5 w-5" />
                    Send order to kitchen
                  </>
                )}
              </button>
              <p className="mt-2 text-center font-sans text-[11px] text-bone">
                Saved to our kitchen log, then opened in WhatsApp for confirmation.
              </p>
              {belowMinimum && (
                <p className="mt-1 text-center font-sans text-[11px] font-semibold text-clay">
                  Minimum order is {formatNairaPrice(minimum)}.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
