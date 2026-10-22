import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDatabase } from "@/db/bootstrap";
import { menuItems } from "@/db/schema";
import { MENU_CATEGORIES } from "@/lib/helpers";

export const dynamic = "force-dynamic";

/** GET /api/menu?category=Rice%20Dishes&available=true */
export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const availableOnly = url.searchParams.get("available") === "true";

    const rows = await db
      .select()
      .from(menuItems)
      .where(availableOnly ? eq(menuItems.isAvailable, true) : undefined)
      .orderBy(asc(menuItems.sortOrder), asc(menuItems.createdAt));

    const filtered =
      category && category !== "All"
        ? rows.filter((r) => r.category.toLowerCase() === category.toLowerCase())
        : rows;

    return NextResponse.json({
      ok: true,
      categories: MENU_CATEGORIES,
      count: filtered.length,
      items: filtered,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown menu API error";
    console.error(`[API_MENU_GET] ${msg}`);
    return NextResponse.json({ ok: false, items: [] }, { status: 500 });
  }
}
