import { NextResponse } from "next/server";
import { adminCtx, invalidateTenantCache } from "@/lib/tenant";
import { EDITABLE_SETTINGS, validHex } from "@/lib/branding";
import { run, nowIso } from "@/lib/db";
import { normalizePhone, whatsappAvailable } from "@/lib/whatsapp";

const MAX_LEN: Record<string, number> = { about: 2000, tagline: 160, hours: 200, address: 200 };
const URL_KEYS = ["logo_url", "instagram_url", "facebook_url", "tiktok_url"];

// GET /api/tenant/settings — configuración editable del restaurante (admin)
export async function GET() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const settings: Record<string, string> = {};
  for (const key of EDITABLE_SETTINGS) {
    const value = ctx.tenant.settings?.[key];
    settings[key] = typeof value === "string" ? value : "";
  }
  return NextResponse.json({
    name: ctx.tenant.name,
    slug: ctx.tenant.slug,
    plan: ctx.tenant.plan,
    status: ctx.tenant.status,
    trial_ends_at: ctx.tenant.trial_ends_at,
    settings,
    // El bot lo aporta la plataforma; el restaurante solo necesita su chat
    telegram_bot_available: !!process.env.TELEGRAM_BOT_TOKEN,
    // El número de WhatsApp que envía los avisos también lo aporta la plataforma
    whatsapp_available: whatsappAvailable(),
  });
}

// PATCH /api/tenant/settings — actualiza nombre y configuración (admin)
export async function PATCH(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const body = await request.json().catch(() => ({}));
  const incoming = (body.settings ?? {}) as Record<string, unknown>;
  const next: Record<string, unknown> = { ...ctx.tenant.settings };

  for (const key of EDITABLE_SETTINGS) {
    if (!(key in incoming)) continue;
    const raw = incoming[key];
    if (raw !== null && typeof raw !== "string") {
      return NextResponse.json({ error: `Valor no válido para ${key}` }, { status: 400 });
    }
    const value = (raw ?? "").trim();

    if (key === "primary_color" && value && !validHex(value)) {
      return NextResponse.json({ error: "El color debe tener el formato #RRGGBB" }, { status: 400 });
    }
    // Las URL se renderizan en href/src: solo http(s) o rutas propias (/media/...)
    if (URL_KEYS.includes(key) && value && !/^(https?:\/\/|\/media\/)/i.test(value)) {
      return NextResponse.json({ error: `${key} debe empezar por http(s)://` }, { status: 400 });
    }
    if (key === "whatsapp" && value && !/^\+?\d[\d\s-]{6,18}$/.test(value)) {
      return NextResponse.json({ error: "WhatsApp: solo dígitos con indicativo, p. ej. 573001234567" }, { status: 400 });
    }
    if (key === "whatsapp_alerts" && value && !normalizePhone(value)) {
      return NextResponse.json({ error: "WhatsApp para alertas: celular con indicativo, p. ej. 573001234567" }, { status: 400 });
    }
    if (key === "telegram_chat_id" && value && !/^-?\d{5,20}$/.test(value)) {
      return NextResponse.json({ error: "El ID de chat de Telegram es un número (puede empezar con -)" }, { status: 400 });
    }
    if (value.length > (MAX_LEN[key] ?? 300)) {
      return NextResponse.json({ error: `${key} es demasiado largo` }, { status: 400 });
    }

    if (value) next[key] = value;
    else delete next[key];
  }

  const name = typeof body.name === "string" ? body.name.trim() : null;
  if (name !== null && (name.length < 2 || name.length > 60)) {
    return NextResponse.json({ error: "El nombre debe tener entre 2 y 60 caracteres" }, { status: 400 });
  }

  await run(
    "UPDATE restaurants SET name = COALESCE(?, name), settings = ?, updated_at = ? WHERE id = ?",
    name,
    JSON.stringify(next),
    nowIso(),
    ctx.tenant.id
  );
  invalidateTenantCache(ctx.tenant.slug);

  return NextResponse.json({ success: true });
}
