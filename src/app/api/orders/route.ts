import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { isAdmin } from "@/lib/auth";
import { ensureDatabase } from "@/db/bootstrap";
import { menuItems, orders } from "@/db/schema";
import { getSiteSettings } from "@/app/actions";
import {
  DELIVERY_ZONES,
  getDeliveryFee,
  getFreeDeliveryThreshold,
  getMinimumOrder,
  makeId,
  makeReference,
} from "@/lib/helpers";

export const dynamic = "force-dynamic";

interface IncomingLine {
  id: unknown;
  quantity: unknown;
}

/**
 * POST /api/orders
 * Persists a web order. Prices are ALWAYS re-read from the database so the
 * browser can never post a tampered subtotal.
 */
export async function POST(request: Request) {
  try {
    await ensureDatabase();

    const body = (await request.json()) as {
      customerName?: unknown;
      phone?: unknown;
      address?: unknown;
      zone?: unknown;
      note?: unknown;
      items?: unknown;
      waDispatched?: unknown;
    };

    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const zone = String(body.zone ?? "").trim();
    const note = String(body.note ?? "").trim().slice(0, 500);

    const problems: string[] = [];
    if (customerName.length < 2) problems.push("Full name is required.");
    if (phone.replace(/[^0-9]/g, "").length < 10) problems.push("A valid phone number is required.");
    if (address.length < 10) problems.push("A detailed delivery address is required.");
    if (!DELIVERY_ZONES.includes(zone as (typeof DELIVERY_ZONES)[number])) {
      problems.push("Select a valid delivery zone.");
    }
    if (problems.length > 0) {
      return NextResponse.json({ ok: false, errors: problems }, { status: 400 });
    }

    const rawItems = Array.isArray(body.items) ? (body.items as IncomingLine[]) : [];
    if (rawItems.length === 0) {
      return NextResponse.json(
        { ok: false, errors: ["Your cart is empty."] },
        { status: 400 }
      );
    }

    const wanted = rawItems
      .map((line) => ({
        id: String(line?.id ?? "").trim(),
        quantity: Math.max(1, Math.min(99, Math.round(Number(line?.quantity ?? 1) || 1))),
      }))
      .filter((line) => line.id.length > 0);

    if (wanted.length === 0) {
      return NextResponse.json(
        { ok: false, errors: ["No valid dishes were submitted."] },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, wanted.map((w) => w.id)));

    const byId = new Map(rows.map((r) => [r.id, r]));
    const pricedLines: { title: string; quantity: number; price: number }[] = [];
    const unavailable: string[] = [];

    for (const line of wanted) {
      const row = byId.get(line.id);
      if (!row) continue;
      if (!row.isAvailable) {
        unavailable.push(row.title);
        continue;
      }
      pricedLines.push({
        title: row.title,
        quantity: line.quantity,
        price: row.price,
      });
    }

    if (pricedLines.length === 0) {
      return NextResponse.json(
        { ok: false, errors: ["None of the selected dishes are available right now."] },
        { status: 422 }
      );
    }

    const settings = await getSiteSettings();
    const subtotal = pricedLines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    const minimum = getMinimumOrder(settings);
    if (minimum > 0 && subtotal < minimum) {
      return NextResponse.json(
        {
          ok: false,
          errors: [`Our minimum order is ₦${minimum.toLocaleString("en-NG")}.`],
        },
        { status: 422 }
      );
    }

    const threshold = getFreeDeliveryThreshold(settings);
    const rawFee = getDeliveryFee(zone, settings);
    const deliveryFee = threshold > 0 && subtotal >= threshold ? 0 : rawFee;
    const total = subtotal + deliveryFee;

    const id = makeId("ord");
    const reference = makeReference();

    await db.insert(orders).values({
      id,
      reference,
      customerName: customerName.slice(0, 160),
      phone: phone.slice(0, 40),
      address,
      zone: zone.slice(0, 80),
      note,
      items: pricedLines,
      subtotal,
      deliveryFee,
      total,
      status: "pending",
      waDispatched: Boolean(body.waDispatched),
    });

    return NextResponse.json(
      {
        ok: true,
        order: {
          id,
          reference,
          customerName,
          phone,
          address,
          zone,
          note,
          items: pricedLines,
          subtotal,
          deliveryFee,
          total,
          status: "pending",
          waDispatched: Boolean(body.waDispatched),
          createdAt: new Date().toISOString(),
        },
        warnings: unavailable.length
          ? unavailable.map((t) => `${t} just sold out and was removed from your order.`)
          : [],
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown order API error";
    console.error(`[API_ORDERS_POST] ${msg}`);
    return NextResponse.json(
      { ok: false, errors: ["We could not record your order. Please try again."] },
      { status: 500 }
    );
  }
}

/** GET /api/orders — recent orders (kitchen console + integrations). */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
    const rows = await db
      .select()
      .from(orders)
      .orderBy(orders.createdAt)
      .limit(limit);
    return NextResponse.json({ ok: true, count: rows.length, orders: rows });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown order API error";
    console.error(`[API_ORDERS_GET] ${msg}`);
    return NextResponse.json({ ok: false, orders: [] }, { status: 500 });
  }
}
