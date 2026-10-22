import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Public menu board. Every row is rendered by the storefront `MenuShowcase`
 * and edited from the `/admin` kitchen console.
 */
export const menuItems = pgTable("menu_items", {
  id: varchar("id", { length: 48 }).primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull().default(0),
  category: varchar("category", { length: 80 }).notNull(),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  imageUrl: text("image_url").notNull().default(""),
  isAvailable: boolean("is_available").notNull().default(true),
  isSignature: boolean("is_signature").notNull().default(false),
  spiceLevel: integer("spice_level").notNull().default(0),
  prepMinutes: integer("prep_minutes").notNull().default(25),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

/** Key/value store powering every editable string on the storefront. */
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

/**
 * Orders are persisted server-side *before* the WhatsApp window opens so the
 * kitchen always keeps an audit trail even if the visitor closes the tab.
 */
export const orders = pgTable("orders", {
  id: varchar("id", { length: 48 }).primaryKey(),
  reference: varchar("reference", { length: 24 }).notNull(),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  address: text("address").notNull(),
  zone: varchar("zone", { length: 80 }).notNull(),
  note: text("note").notNull().default(""),
  items: jsonb("items").$type<
    { title: string; quantity: number; price: number }[]
  >().notNull(),
  subtotal: integer("subtotal").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull().default(0),
  status: varchar("status", { length: 24 }).notNull().default("pending"),
  waDispatched: boolean("wa_dispatched").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type MenuItemRow = typeof menuItems.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;

/** Photos uploaded from the kitchen console (stored as base64 text). */
export const images = pgTable("images", {
  id: varchar("id", { length: 48 }).primaryKey(),
  contentType: varchar("content_type", { length: 60 }).notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});
