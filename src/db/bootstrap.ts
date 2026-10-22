import { sql } from "drizzle-orm";
import { db } from "@/db";
import { menuItems, siteSettings } from "./schema";
import { DEFAULT_SETTINGS, SEED_MENU } from "./seed-data";

/**
 * The platform may hand us a completely empty PostgreSQL instance, and
 * `drizzle-kit push` is not guaranteed to run in the final preview.
 * `ensureDatabase()` therefore creates the tables idempotently and seeds the
 * first-run content so the storefront is never blank.
 */
let readyPromise: Promise<void> | null = null;

async function applyDdl(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id varchar(48) PRIMARY KEY,
      title varchar(200) NOT NULL,
      description text NOT NULL DEFAULT '',
      price integer NOT NULL DEFAULT 0,
      category varchar(80) NOT NULL,
      tags text[] NOT NULL DEFAULT '{}'::text[],
      image_url text NOT NULL DEFAULT '',
      is_available boolean NOT NULL DEFAULT true,
      is_signature boolean NOT NULL DEFAULT false,
      spice_level integer NOT NULL DEFAULT 0,
      prep_minutes integer NOT NULL DEFAULT 25,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key varchar(80) PRIMARY KEY,
      value text NOT NULL DEFAULT '',
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id varchar(48) PRIMARY KEY,
      reference varchar(24) NOT NULL,
      customer_name varchar(160) NOT NULL,
      phone varchar(40) NOT NULL,
      address text NOT NULL,
      zone varchar(80) NOT NULL,
      note text NOT NULL DEFAULT '',
      items jsonb NOT NULL DEFAULT '[]'::jsonb,
      subtotal integer NOT NULL DEFAULT 0,
      delivery_fee integer NOT NULL DEFAULT 0,
      total integer NOT NULL DEFAULT 0,
      status varchar(24) NOT NULL DEFAULT 'pending',
      wa_dispatched boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items (category)`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC)`
  );
}

async function seedIfEmpty(): Promise<void> {
  // ── Menu ──
  const countRows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(menuItems);
  const existing = countRows[0]?.n ?? 0;

  if (existing === 0) {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    await db.insert(menuItems).values(
      SEED_MENU.map((item) => ({
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
        createdAt: now,
        updatedAt: now,
      }))
    );
    console.log(`[SEED] Inserted ${SEED_MENU.length} menu items.`);
  }

  // ── Settings (never overwrite values an admin already saved) ──
  const settingRows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(siteSettings);
  const existingSettings = settingRows[0]?.n ?? 0;

  if (existingSettings === 0) {
    const entries = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
    }));
    await db.insert(siteSettings).values(entries);
    console.log(`[SEED] Inserted ${entries.length} site settings.`);
  }
}

export async function ensureDatabase(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      await applyDdl();
      await seedIfEmpty();
    })().catch((error: unknown) => {
      // Allow a later request to retry instead of caching a failure forever.
      readyPromise = null;
      const msg = error instanceof Error ? error.message : "Unknown bootstrap error";
      console.error(`[DB_BOOTSTRAP] ${msg}`);
      throw error;
    });
  }
  await readyPromise;
}
