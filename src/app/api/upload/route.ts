import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDatabase } from "@/db/bootstrap";
import { images } from "@/db/schema";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3_000_000;

function detectType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) return "image/png";
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/** POST /api/upload — admin only. Body: multipart form with a `file` field. */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureDatabase();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Image is too large." }, { status: 413 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = detectType(bytes);
    if (!contentType) {
      return NextResponse.json(
        { ok: false, error: "Please upload a JPEG, PNG or WebP image." },
        { status: 400 }
      );
    }
    const id = crypto.randomUUID();
    await db.insert(images).values({
      id,
      contentType,
      data: Buffer.from(bytes).toString("base64"),
    });
    return NextResponse.json({ ok: true, url: `/api/images/${id}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown upload error";
    console.error(`[API_UPLOAD] ${msg}`);
    return NextResponse.json({ ok: false, error: "Upload failed." }, { status: 500 });
  }
}
