import { NextResponse } from "next/server";
import { adminCtx } from "@/lib/tenant";
import { whatsappTest } from "@/lib/whatsapp";

// POST /api/whatsapp/test — el admin envía un mensaje de prueba a SU número de alertas
export async function POST() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const result = await whatsappTest(ctx.tenant);
  return NextResponse.json(result.ok ? { success: true } : { success: false, error: result.error }, { status: result.ok ? 200 : 400 });
}
