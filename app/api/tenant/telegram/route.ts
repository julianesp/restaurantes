import { NextResponse } from "next/server";
import { adminCtx, invalidateTenantCache } from "@/lib/tenant";
import { first, run, nowIso } from "@/lib/db";
import { botUsername, findChatForCode, newLinkCode, LINK_TTL_MS } from "@/lib/telegram-link";
import { sendTestNotification, targetFor } from "@/lib/notificationService";

const freshSettings = async (id: string) =>
  (await first<{ settings: Record<string, unknown> }>("SELECT settings FROM restaurants WHERE id = ?", id))?.settings ?? {};

// POST /api/tenant/telegram { action: "start" | "check" } — conectar el chat de Telegram sin copiar IDs
export async function POST(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const body = await request.json().catch(() => ({}));

  if (body.action === "start") {
    const username = await botUsername();
    if (!username) return NextResponse.json({ error: "El bot de Telegram de la plataforma aún no está activado" }, { status: 503 });
    const code = newLinkCode();
    await run(
      `UPDATE restaurants SET settings = json_set(COALESCE(settings, '{}'), '$.telegram_link_code', ?, '$.telegram_link_exp', ?), updated_at = ?
       WHERE id = ?`,
      code, new Date(Date.now() + LINK_TTL_MS).toISOString(), nowIso(), ctx.tenant.id
    );
    return NextResponse.json({ url: `https://t.me/${username}?start=${code}`, code, username });
  }

  if (body.action === "check") {
    const s = await freshSettings(ctx.tenant.id);
    const code = typeof s.telegram_link_code === "string" ? s.telegram_link_code : "";
    const exp = typeof s.telegram_link_exp === "string" ? s.telegram_link_exp : "";
    if (!code || !exp || new Date(exp) < new Date()) {
      return NextResponse.json({ error: "El enlace venció. Toca otra vez “Conectar con Telegram”." }, { status: 400 });
    }
    const found = await findChatForCode(code);
    if (!found.ok) return NextResponse.json({ error: found.error }, { status: 502 });
    if (!found.chat) return NextResponse.json({ connected: false });

    await run(
      `UPDATE restaurants SET settings = json_remove(json_set(COALESCE(settings, '{}'), '$.telegram_chat_id', ?), '$.telegram_link_code', '$.telegram_link_exp'),
       updated_at = ? WHERE id = ?`,
      found.chat.id, nowIso(), ctx.tenant.id
    );
    invalidateTenantCache(ctx.tenant.slug);
    // Saludo de confirmación en el chat recién conectado
    await sendTestNotification(targetFor({ ...ctx.tenant, settings: { ...ctx.tenant.settings, telegram_chat_id: found.chat.id } }));
    return NextResponse.json({ connected: true, chatId: found.chat.id, chatName: found.chat.name });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}

// DELETE /api/tenant/telegram — deja de enviar avisos a Telegram
export async function DELETE() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  await run(
    `UPDATE restaurants SET settings = json_remove(COALESCE(settings, '{}'), '$.telegram_chat_id', '$.telegram_link_code', '$.telegram_link_exp'),
     updated_at = ? WHERE id = ?`,
    nowIso(), ctx.tenant.id
  );
  invalidateTenantCache(ctx.tenant.slug);
  return NextResponse.json({ ok: true });
}
