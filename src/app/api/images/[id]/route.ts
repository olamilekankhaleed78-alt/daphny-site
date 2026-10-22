import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDatabase } from "@/db/bootstrap";
import { images } from "@/db/schema";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/images/:id — public, so the storefront can show uploaded photos. */
export async function GET(_request: Request, context: RouteContext) {
  try {
    await ensureDatabase();
    const { id } = await context.params;
    const rows = await db.select().from(images).where(eq(images.id, id)).limit(1);
    const row = rows[0];
    if (!row) return new Response("Not found", { status: 404 });

    return new Response(new Uint8Array(Buffer.from(row.data, "base64")), {
      headers: {
        "Content-Type": row.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown image error";
    console.error(`[API_IMAGES_GET] ${msg}`);
    return new Response("Error", { status: 500 });
  }
}
