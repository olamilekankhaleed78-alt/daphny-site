"use server";

import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDatabase } from "@/db/bootstrap";
import { menuItems, orders, siteSettings } from "@/db/schema";
import { DEFAULT_SETTINGS, SEED_MENU } from "@/db/seed-data";
import {
  ORDER_STATUSES,
  makeId,
  makeReference,
  slugifyTitle,
} from "@/lib/helpers";
import type {
  MenuItemData,
  MenuItemDraft,
  OrderRecord,
  SiteSettings,
} from "@/lib/types";

/* ─────────────────────────────────────────────────────────────
   READ
   ───────────────────────────────────────────────────────────── */

export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureDatabase();
  const base: SiteSettings = { ...DEFAULT_SETTINGS };
  try {
    const rows = await db.select().from(siteSettings);
    for (const row of rows) {
      if (row.key in base) {
        (base as unknown as Record<string, string>)[row.key] = row.value;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown settings read error";
    console.error(`[SETTINGS_READ] ${msg}`);
  }
  return base;
}

export async function getMenuItems(): Promise<MenuItemData[]> {
  await ensureDatabase();
  try {
    const rows = await db
      .select()
      .from(menuItems)
      .orderBy(asc(menuItems.sortOrder), asc(menuItems.createdAt));
    return rows as MenuItemData[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown menu read error";
    console.error(`[MENU_READ] ${msg}`);
    return [];
  }
}

export async function listOrders(): Promise<OrderRecord[]> {
  await requireAdmin();
  await ensureDatabase();
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return rows.map((r) => ({
      id: r.id,
      reference: r.reference,
      customerName: r.customerName,
      phone: r.phone,
      address: r.address,
      zone: r.zone,
      note: r.note,
      items: Array.isArray(r.items) ? r.items : [],
      subtotal: r.subtotal,
      deliveryFee: r.deliveryFee,
      total: r.total,
      status: r.status,
      waDispatched: r.waDispatched,
      createdAt: r.createdAt,
    }));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown order read error";
    console.error(`[ORDER_READ] ${msg}`);
    return [];
  }
}

export async function getDashboardStats(): Promise<{
  menuCount: number;
  availableCount: number;
  orderCount: number;
  revenue: number;
  todayRevenue: number;
  todayCount: number;
  pendingCount: number;
  soldOut: { id: string; title: string }[];
}> {
  await requireAdmin();
  await ensureDatabase();
  const empty = {
    menuCount: 0,
    availableCount: 0,
    orderCount: 0,
    revenue: 0,
    todayRevenue: 0,
    todayCount: 0,
    pendingCount: 0,
    soldOut: [] as { id: string; title: string }[],
  };

  try {
    const [menuRow] = await db
      .select({
        menuCount: sql<number>`count(*)::int`,
        availableCount: sql<number>`count(*) filter (where is_available)::int`,
      })
      .from(menuItems);

    const [orderRow] = await db
      .select({
        orderCount: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(total), 0)::int`,
        pendingCount: sql<number>`count(*) filter (where status = 'pending')::int`,
        todayCount: sql<number>`count(*) filter (where created_at >= date_trunc('day', now()))::int`,
        todayRevenue: sql<number>`coalesce(sum(total) filter (where created_at >= date_trunc('day', now())), 0)::int`,
      })
      .from(orders);

    const soldOut = await db
      .select({ id: menuItems.id, title: menuItems.title })
      .from(menuItems)
      .where(eq(menuItems.isAvailable, false))
      .limit(12);

    return {
      menuCount: menuRow?.menuCount ?? 0,
      availableCount: menuRow?.availableCount ?? 0,
      orderCount: orderRow?.orderCount ?? 0,
      revenue: orderRow?.revenue ?? 0,
      todayRevenue: orderRow?.todayRevenue ?? 0,
      todayCount: orderRow?.todayCount ?? 0,
      pendingCount: orderRow?.pendingCount ?? 0,
      soldOut,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown stats error";
    console.error(`[STATS] ${msg}`);
    return empty;
  }
}

/* ─────────────────────────────────────────────────────────────
   WRITE — SETTINGS
   ───────────────────────────────────────────────────────────── */

export async function saveSiteSettings(
  patch: Partial<SiteSettings>
): Promise<{ ok: boolean; settings: SiteSettings; error?: string }> {
  await requireAdmin();
  await ensureDatabase();
  try {
    const allowed = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[];
    const entries = allowed
      .filter((key) => patch[key] !== undefined)
      .map((key) => ({ key, value: String(patch[key] ?? "") }));

    if (entries.length > 0) {
      await db
        .insert(siteSettings)
        .values(entries)
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value: sql`excluded.value`,
            updatedAt: sql`now()`,
          },
        });
    }
    const settings = await getSiteSettings();
    return { ok: true, settings };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown settings write error";
    console.error(`[SETTINGS_WRITE] ${msg}`);
    return { ok: false, settings: { ...DEFAULT_SETTINGS }, error: msg };
  }
}

/* ─────────────────────────────────────────────────────────────
   WRITE — MENU
   ───────────────────────────────────────────────────────────── */

export async function saveMenuItem(
  draft: MenuItemDraft
): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();
  await ensureDatabase();

  const title = (draft.title || "").trim();
  if (title.length < 2) {
    return { ok: false, error: "Dish name must be at least 2 characters." };
  }
  const price = Number.isFinite(draft.price) && draft.price >= 0 ? Math.round(draft.price) : 0;
  if (price <= 0) {
    return { ok: false, error: "Price must be greater than zero." };
  }
  const category = (draft.category || "").trim() || "Specials";

  const record = {
    title: title.slice(0, 200),
    description: (draft.description || "").trim(),
    price,
    category,
    tags: Array.isArray(draft.tags) ? draft.tags.slice(0, 6) : [],
    imageUrl: (draft.imageUrl || "").trim(),
    isAvailable: Boolean(draft.isAvailable),
    isSignature: Boolean(draft.isSignature),
    spiceLevel: Math.max(0, Math.min(4, Math.round(draft.spiceLevel || 0))),
    prepMinutes: Math.max(1, Math.min(480, Math.round(draft.prepMinutes || 25))),
    sortOrder: Math.max(0, Math.round(draft.sortOrder || 0)),
    updatedAt: sql`now()`,
  };

  try {
    if (draft.id) {
      await db.update(menuItems).set(record).where(eq(menuItems.id, draft.id));
      return { ok: true, id: draft.id };
    }
    const baseSlug = slugifyTitle(title).slice(0, 38);
    // Guard against a duplicate slug by suffixing, staying inside varchar(48).
    const clash = await db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(eq(menuItems.id, baseSlug))
      .limit(1);
    const finalId = clash.length > 0 ? `${baseSlug}-${makeId("x").slice(0, 8)}` : baseSlug;
    await db.insert(menuItems).values({ ...record, id: finalId });
    return { ok: true, id: finalId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown menu write error";
    console.error(`[MENU_WRITE] ${msg}`);
    return { ok: false, error: msg };
  }
}

export async function toggleMenuItemAvailability(
  id: string,
  isAvailable: boolean
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await ensureDatabase();
  if (!id) return { ok: false, error: "Missing id." };
  try {
    await db
      .update(menuItems)
      .set({ isAvailable, updatedAt: sql`now()` })
      .where(eq(menuItems.id, id));
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown toggle error";
    console.error(`[MENU_TOGGLE] ${msg}`);
    return { ok: false, error: msg };
  }
}

export async function deleteMenuItem(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await ensureDatabase();
  if (!id) return { ok: false, error: "Missing id." };
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown delete error";
    console.error(`[MENU_DELETE] ${msg}`);
    return { ok: false, error: msg };
  }
}

export async function resetMenuToDefaults(): Promise<{ ok: boolean; count: number }> {
  await requireAdmin();
  await ensureDatabase();
  try {
    await db.delete(menuItems);
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    await db.insert(menuItems).values(
      SEED_MENU_ROWS.map((item) => ({ ...item, createdAt: now, updatedAt: now }))
    );
    return { ok: true, count: SEED_MENU_ROWS.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown reset error";
    console.error(`[MENU_RESET] ${msg}`);
    return { ok: false, count: 0 };
  }
}

/* ─────────────────────────────────────────────────────────────
   WRITE — ORDERS
   ───────────────────────────────────────────────────────────── */

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await ensureDatabase();
  if (!id) return { ok: false, error: "Missing id." };
  const next = (ORDER_STATUSES as readonly string[]).includes(status) ? status : "pending";
  try {
    await db.update(orders).set({ status: next }).where(eq(orders.id, id));
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown order write error";
    console.error(`[ORDER_WRITE] ${msg}`);
    return { ok: false, error: msg };
  }
}

export async function deleteOrder(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await ensureDatabase();
  if (!id) return { ok: false, error: "Missing id." };
  try {
    await db.delete(orders).where(eq(orders.id, id));
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown order delete error";
    console.error(`[ORDER_DELETE] ${msg}`);
    return { ok: false, error: msg };
  }
}

/* Re-used by the reset action — kept local so the module stays a pure server-action file. */
const SEED_MENU_ROWS = SEED_MENU.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  price: item.price,
  category: item.category,
  tags: item.tags,
  imageUrl: item.imageUrl,
  isAvailable: item.isAvailable,
  isSignature: item.isSignature,
  spiceLevel: item.spiceLevel,
  prepMinutes: item.prepMinutes,
  sortOrder: item.sortOrder,
}));
