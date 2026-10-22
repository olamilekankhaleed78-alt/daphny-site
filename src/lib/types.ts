/* ─────────────────────────────────────────────────────────────
   Shared domain types for the Daphny Dodo storefront.
   ───────────────────────────────────────────────────────────── */

/** Settings keys are snake_case because they map 1:1 onto the `site_settings` table. */
export interface SiteSettings {
  business_name: string;
  phone_number: string;
  email: string;
  address: string;
  opening_hours: string;
  kitchen_close: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  announcement: string;
  about_title: string;
  about_body: string;
  chef_name: string;
  chef_quote: string;
  chef_image_url: string;
  kitchen_image_url: string;
  market_image_url: string;
  delivery_eta: string;
  min_order: string;
  free_delivery_threshold: string;
  delivery_fees: string;
  payment_info: string;
  instagram_url: string;
  facebook_url: string;
  nextorder_url: string;
}

/** Shape consumed by `MenuShowcase` (camelCase — mirrors the Drizzle select). */
export interface MenuItemData {
  id: string;
  title: string;
  price: number;
  description: string;
  tags: string[];
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  isSignature?: boolean;
  spiceLevel?: number;
  prepMinutes?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** A single line on a persisted order. */
export interface OrderLine {
  title: string;
  quantity: number;
  price: number;
}

export interface OrderRecord {
  id: string;
  reference: string;
  customerName: string;
  phone: string;
  address: string;
  zone: string;
  note: string;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  waDispatched: boolean;
  createdAt: string;
}

export interface MenuItemDraft {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl: string;
  isAvailable: boolean;
  isSignature: boolean;
  spiceLevel: number;
  prepMinutes: number;
  sortOrder: number;
}
