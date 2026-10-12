import { NextResponse } from "next/server";
import { first } from "@/lib/db";
import { RESERVED_SLUGS, SLUG_REGEX } from "@/lib/tenant-host";

// GET /api/platform/slug-available?slug=mi-restaurante (público)
export async function GET(request: Request) {
  const slug = (new URL(request.url).searchParams.get("slug") || "").toLowerCase().trim();

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({
      available: false,
      reason: "Usa de 3 a 30 caracteres: letras minúsculas, números y guiones (sin empezar ni terminar con guion).",
    });
  }
  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({ available: false, reason: "Ese nombre está reservado." });
  }

  const existing = await first("SELECT id FROM restaurants WHERE slug = ?", slug);
  return NextResponse.json({
    available: !existing,
    reason: existing ? "Ese subdominio ya está en uso." : null,
  });
}
