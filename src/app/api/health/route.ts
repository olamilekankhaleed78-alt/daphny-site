import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDatabase } from "@/db/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    // Create tables + seed first-run content so the storefront is never blank.
    await ensureDatabase();
    return Response.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown health error";
    console.error(`[HEALTH] ${message}`);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
