import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { run } from "@/lib/db";
import { limitRequest } from "@/lib/rate-limit";
import { colombiaDay } from "@/lib/platform-stats";
import { BOT_UA, TRACKED_PATHS, classifyUserAgent, referrerHost } from "@/lib/visits";

const VISITOR_ID = /^[a-f0-9-]{16,40}$/i;

// POST /api/platform/visit — una visita (sesión de navegador) a la landing de Brasaya. Sin IP ni datos personales.
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT_UA.test(ua)) return new NextResponse(null, { status: 204 });

  const limited = await limitRequest(request, "visit", "platform", 30, 60 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const visitorId = typeof body.visitor === "string" && VISITOR_ID.test(body.visitor) ? body.visitor.toLowerCase() : null;
  const path = typeof body.path === "string" && body.path in TRACKED_PATHS ? body.path : null;
  if (!visitorId || !path) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });

  const host = request.headers.get("host") || "";
  const utm = typeof body.utm === "string" ? body.utm.trim().toLowerCase().slice(0, 60) || null : null;
  const country = (request.headers.get("cf-ipcountry") || "").toUpperCase();
  const { userId } = await auth();
  const { device, os, browser } = classifyUserAgent(ua);

  await run(
    `INSERT INTO site_visits (id, visitor_id, day, path, referrer, utm_source, device, os, browser, country, signed_in)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    crypto.randomUUID(), visitorId, colombiaDay(), path, referrerHost(body.referrer, host), utm,
    device, os, browser, /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null, userId ? 1 : 0
  );
  return new NextResponse(null, { status: 204 });
}
