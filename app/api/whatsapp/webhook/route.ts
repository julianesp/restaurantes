import { NextResponse } from "next/server";
import { applyStatus, verifySignature } from "@/lib/whatsapp";

/**
 * Webhook de WhatsApp Cloud (configurado en la app de Meta, campo "messages").
 *
 * GET: verificación inicial de Meta (hub.verify_token = WHATSAPP_VERIFY_TOKEN).
 * POST: estados de entrega de los mensajes enviados (sent/delivered/read/failed), firmados con
 * X-Hub-Signature-256 (WHATSAPP_APP_SECRET). Sin firma válida no se procesa nada.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (expected && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === expected) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

interface StatusUpdate {
  id: string;
  status: string;
  errors?: Array<{ title?: string; message?: string; code?: number }>;
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!(await verifySignature(raw, request.headers.get("x-hub-signature-256")))) {
    return NextResponse.json({ error: "Firma no válida" }, { status: 401 });
  }

  try {
    const body = JSON.parse(raw) as {
      entry?: Array<{ changes?: Array<{ value?: { statuses?: StatusUpdate[]; messages?: unknown[] } }> }>;
    };
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const s of change.value?.statuses ?? []) {
          const error = s.errors?.[0];
          await applyStatus(s.id, s.status, error ? `${error.code ?? ""} ${error.message || error.title || ""}`.trim() : undefined);
        }
        // Mensajes entrantes: por ahora no se responden automáticamente
        if (change.value?.messages?.length) console.log("[WHATSAPP] mensajes entrantes:", change.value.messages.length);
      }
    }
  } catch (error) {
    console.error("[WHATSAPP] webhook con cuerpo no válido:", error);
  }
  // Meta reintenta si no recibe 200: se responde 200 aunque algo no se haya podido aplicar
  return NextResponse.json({ success: true });
}
