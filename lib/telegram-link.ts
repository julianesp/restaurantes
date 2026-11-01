/**
 * Conectar el chat de Telegram de un restaurante sin copiar IDs: el panel genera un código, la persona
 * abre t.me/<bot>?start=<código> y toca "Iniciar"; luego se busca ese mensaje con getUpdates y se guarda
 * el chat. No necesita webhook (getUpdates no funciona si el bot tiene uno configurado).
 */

const API = "https://api.telegram.org/bot";
export const LINK_TTL_MS = 15 * 60_000;

let cachedUsername: string | null = null;

/** Usuario del bot de la plataforma (p. ej. "BrasayaBot"), para armar el enlace t.me. */
export async function botUsername(): Promise<string | null> {
  if (cachedUsername) return cachedUsername;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${API}${token}/getMe`);
    const data = (await res.json()) as { ok: boolean; result?: { username?: string } };
    cachedUsername = data.ok && data.result?.username ? data.result.username : null;
  } catch {
    cachedUsername = null;
  }
  return cachedUsername;
}

/** Código de un solo uso: solo letras y números (lo que acepta el parámetro start de Telegram). */
export const newLinkCode = () => `BRSY${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

interface TelegramUpdate {
  message?: { text?: string; chat?: { id: number; title?: string; first_name?: string; username?: string } };
}

/** Busca en los mensajes recientes al bot el que trae el código ("/start CÓDIGO" o el código suelto). */
export function findChatInUpdates(updates: TelegramUpdate[], code: string): { id: string; name: string } | null {
  for (let i = updates.length - 1; i >= 0; i--) {
    const msg = updates[i].message;
    if (!msg?.chat || typeof msg.text !== "string") continue;
    if (msg.text.trim().toUpperCase().split(/\s+/).includes(code)) {
      const c = msg.chat;
      return { id: String(c.id), name: c.title || c.first_name || (c.username ? `@${c.username}` : "tu chat") };
    }
  }
  return null;
}

export type FindResult = { ok: true; chat: { id: string; name: string } | null } | { ok: false; error: string };

export async function findChatForCode(code: string): Promise<FindResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "El bot de Telegram de la plataforma no está activado" };
  try {
    const res = await fetch(`${API}${token}/getUpdates?allowed_updates=${encodeURIComponent('["message"]')}`);
    const data = (await res.json()) as { ok: boolean; result?: TelegramUpdate[]; description?: string };
    if (!data.ok) return { ok: false, error: "Telegram no respondió. Intenta de nuevo en un momento." };
    return { ok: true, chat: findChatInUpdates(data.result ?? [], code) };
  } catch {
    return { ok: false, error: "No se pudo contactar a Telegram. Intenta de nuevo." };
  }
}
