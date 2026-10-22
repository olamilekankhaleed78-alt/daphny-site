import type { OrderLine, SiteSettings } from "./types";

/* ─────────────────────────────────────────────────────────────
   FORMATTING
   ───────────────────────────────────────────────────────────── */

export function formatNairaPrice(priceInNaira: number): string {
  if (typeof priceInNaira !== "number" || isNaN(priceInNaira)) {
    return "₦0";
  }
  return `₦${Math.round(priceInNaira).toLocaleString("en-NG")}`;
}

export function formatCompactNaira(priceInNaira: number): string {
  if (typeof priceInNaira !== "number" || isNaN(priceInNaira)) return "₦0";
  if (Math.abs(priceInNaira) >= 1000) {
    return `₦${(priceInNaira / 1000).toFixed(priceInNaira % 1000 === 0 ? 0 : 1)}k`;
  }
  return formatNairaPrice(priceInNaira);
}

/* ─────────────────────────────────────────────────────────────
   PHONE SANITISATION
   ───────────────────────────────────────────────────────────── */

export function sanitizePhoneForWhatsApp(phone: string): string {
  if (!phone || typeof phone !== "string") return "";

  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 0) return "";

  // Nigerian local format: 08012345678 → 2348012345678
  if (digits.startsWith("0") && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  // Already carries the country code.
  if (digits.startsWith("234") && digits.length >= 13) {
    return digits;
  }
  return digits;
}

export function sanitizePhoneForTel(phone: string): string {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/[^\d+]/g, "");
}

/* ─────────────────────────────────────────────────────────────
   DOMAIN CONSTANTS
   ───────────────────────────────────────────────────────────── */

export const MENU_CATEGORIES = [
  "Soups & Swallows",
  "Rice Dishes",
  "Grills & BBQ",
  "Appetizers & Sides",
  "Proteins & Add-Ons",
  "Beverages",
  "Desserts",
  "Specials",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const DELIVERY_ZONES = [
  "Lekki",
  "Ikoyi",
  "Ikeja",
  "Ajah",
  "Victoria Island",
  "Surulere",
  "Yaba",
  "Maryland",
  "Gbagada",
  "Other",
] as const;

export type DeliveryZone = (typeof DELIVERY_ZONES)[number];

export const SPICE_LABELS = [
  "No heat",
  "Mild",
  "Medium",
  "Hot",
  "Serious heat",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "cooking",
  "dispatched",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/* ─────────────────────────────────────────────────────────────
   SETTINGS HELPERS
   ───────────────────────────────────────────────────────────── */

export function parseDeliveryFees(settings: SiteSettings): Record<string, number> {
  try {
    const parsed = JSON.parse(settings.delivery_fees || "{}") as Record<
      string,
      unknown
    >;
    const out: Record<string, number> = {};
    for (const zone of DELIVERY_ZONES) {
      const raw = parsed[zone];
      const value = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
      out[zone] = Number.isFinite(value) && value >= 0 ? value : 0;
    }
    return out;
  } catch {
    return Object.fromEntries(DELIVERY_ZONES.map((z) => [z, 0])) as Record<
      string,
      number
    >;
  }
}

export function getDeliveryFee(zone: string, settings: SiteSettings): number {
  if (!zone) return 0;
  const fees = parseDeliveryFees(settings);
  const fee = fees[zone];
  return typeof fee === "number" && Number.isFinite(fee) ? fee : 0;
}

export function getFreeDeliveryThreshold(settings: SiteSettings): number {
  const value = parseInt(settings.free_delivery_threshold || "0", 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function getMinimumOrder(settings: SiteSettings): number {
  const value = parseInt(settings.min_order || "0", 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/* ─────────────────────────────────────────────────────────────
   CHECKOUT + WHATSAPP DISPATCH
   ───────────────────────────────────────────────────────────── */

export interface CheckoutFormData {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  deliveryZone: string;
  /** Optional extras layered onto the dispatch payload. */
  note?: string;
  deliveryFee?: number;
  orderReference?: string;
  serviceLabel?: string;
}

export function buildWhatsAppOrderMessage(
  customer: CheckoutFormData,
  cartItems: OrderLine[],
  grandTotal: number,
  _restaurantPhone: string
): string {
  if (!cartItems || cartItems.length === 0) return "";

  const itemLines = cartItems
    .map((item) => {
      const lineTotal = (item.price || 0) * (item.quantity || 0);
      return `• ${item.title} x ${item.quantity} — ${formatNairaPrice(lineTotal)}`;
    })
    .join("\n");

  const fee = typeof customer.deliveryFee === "number" ? customer.deliveryFee : 0;
  const label = customer.serviceLabel || "CUSTOM WEB ORDER";
  const ref = customer.orderReference
    ? `*ORDER REF:* ${customer.orderReference}\n`
    : "";
  const note = customer.note && customer.note.trim().length > 0
    ? `\n*KITCHEN NOTE:*\n${customer.note.trim()}\n`
    : "";

  const message =
    `🇳🇬 *DAPHNY DODO CUISINE - ${label}*\n` +
    `--------------------------------------------\n` +
    ref +
    `*CUSTOMER DETAILS:*\n` +
    `• Name: ${customer.fullName}\n` +
    `• Phone: ${customer.phoneNumber}\n` +
    `\n` +
    `*ORDER BILL OF MATERIALS:*\n` +
    `${itemLines}\n` +
    `\n` +
    `*LOGISTICS & FREIGHT:*\n` +
    `• Address: ${customer.deliveryAddress}\n` +
    `• Region: ${customer.deliveryZone}\n` +
    `• Delivery fee: ${formatNairaPrice(fee)}\n` +
    note +
    `\n` +
    `*GRAND TOTAL:* ${formatNairaPrice(grandTotal)}\n` +
    `--------------------------------------------\n` +
    `_Click send to verify payment options and confirm delivery dispatch timing!_`;

  return message;
}

export function buildWhatsAppUrl(message: string, restaurantPhone: string): string | null {
  const cleanPhone = sanitizePhoneForWhatsApp(restaurantPhone);
  if (!cleanPhone || cleanPhone.length < 10) return null;
  if (!message || message.trim().length === 0) return null;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function dispatchWhatsAppOrder(
  customer: CheckoutFormData,
  cartItems: OrderLine[],
  grandTotal: number,
  restaurantPhone: string
): boolean {
  try {
    const cleanPhone = sanitizePhoneForWhatsApp(restaurantPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      console.error("[WA_DISPATCH] Invalid restaurant phone number.");
      return false;
    }

    const message = buildWhatsAppOrderMessage(
      customer,
      cartItems,
      grandTotal,
      restaurantPhone
    );
    if (!message || message.trim().length === 0) {
      console.error("[WA_DISPATCH] Empty order message.");
      return false;
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    if (typeof window !== "undefined") {
      const opened = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        // Popup blocked — fall back to a same-tab navigation.
        window.location.assign(waUrl);
      }
      return true;
    }
    return false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown WA dispatch error";
    console.error(`[WA_DISPATCH_ERROR] ${msg}`);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────
   MISC
   ───────────────────────────────────────────────────────────── */

export function makeReference(prefix = "DDC"): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${stamp}${rand}`;
}

export function makeId(prefix = "mi"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || makeId("dish")
  );
}

export function parseTagInput(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 6);
}

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
