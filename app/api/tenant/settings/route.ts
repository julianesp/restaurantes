import { NextResponse } from "next/server";
import { adminCtx, invalidateTenantCache } from "@/lib/tenant";
import { EDITABLE_SETTINGS, validHex } from "@/lib/branding";
import { first, run, nowIso } from "@/lib/db";
import { normalizePhone, whatsappAvailable } from "@/lib/whatsapp";
import { parseSchedule, summarizeSchedule } from "@/lib/hours";
import { normalizeNequi } from "@/lib/nequi";

const MAX_LEN: Record<string, number> = { about: 2000, tagline: 160, hours: 200, hours_schedule: 1000, address: 200, nequi_holder: 60 };
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
    // Las llaves de ePayco las conecta el dueño del restaurante (o el equipo de Brasaya por él)
    can_configure_payments: ctx.role === "owner" || ctx.role === "platform",
    online_payments: ctx.tenant.settings?.online_payments === true,
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
  // Ajustes frescos de la base (no la copia en caché): no pisar claves que gestiona el sistema,
  // como online_payments (lib/payment-accounts.ts)
  const fresh = await first<{ settings: Record<string, unknown> }>("SELECT settings FROM restaurants WHERE id = ?", ctx.tenant.id);
  const next: Record<string, unknown> = { ...(fresh?.settings ?? ctx.tenant.settings) };

  for (const key of EDITABLE_SETTINGS) {
    if (!(key in incoming)) continue;
    const raw = incoming[key];
    if (raw !== null && typeof raw !== "string") {
      return NextResponse.json({ error: `Valor no válido para ${key}` }, { status: 400 });
    }
    let value = (raw ?? "").trim();

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
    if (key === "nequi_number" && value) {
      const nequi = normalizeNequi(value);
      if (!nequi) return NextResponse.json({ error: "Nequi: celular colombiano de 10 dígitos, p. ej. 3001234567" }, { status: 400 });
      value = nequi;
    }
    if (key === "hours_schedule" && value && !parseSchedule(value)) {
      return NextResponse.json({ error: "Horario no válido" }, { status: 400 });
    }
    if (value.length > (MAX_LEN[key] ?? 300)) {
      return NextResponse.json({ error: `${key} es demasiado largo` }, { status: 400 });
    }

    if (value) next[key] = value;
    else delete next[key];
  }

  // El horario por días manda: el texto de una línea (settings.hours) se genera a partir de él
  const schedule = parseSchedule(next.hours_schedule);
  if (schedule) next.hours = summarizeSchedule(schedule);

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
