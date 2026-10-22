import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { isAdmin } from "@/lib/auth";
import { ensureDatabase } from "@/db/bootstrap";
import { orders } from "@/db/schema";
import { ORDER_STATUSES } from "@/lib/helpers";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/orders/:id
 * `{ status?: string, waDispatched?: boolean }`
 * Used by the checkout modal to confirm the WhatsApp window actually opened
 * and by the kitchen console to move an order along the line.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureDatabase();
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });
    }

    const body = (await request.json()) as {
      status?: unknown;
      waDispatched?: unknown;
    };

    const patch: { status?: string; waDispatched?: boolean } = {};
    if (typeof body.status === "string") {
      // Only the kitchen (logged in) may change order status.
      if (!(await isAdmin())) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      const allowed = ORDER_STATUSES as readonly string[];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
      }
      patch.status = body.status;
    }
    if (typeof body.waDispatched === "boolean") {
      patch.waDispatched = body.waDispatched;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
    }

    await db.update(orders).set(patch).where(eq(orders.id, id));
    return NextResponse.json({ ok: true, id, ...patch });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown order patch error";
    console.error(`[API_ORDERS_PATCH] ${msg}`);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureDatabase();
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });
    }
    await db.delete(orders).where(eq(orders.id, id));
    return NextResponse.json({ ok: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown order delete error";
    console.error(`[API_ORDERS_DELETE] ${msg}`);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
