import { NextResponse } from "next/server";
import { platformCtx } from "@/lib/tenant";
import { loadRestaurants, listAllPayments, colombiaDay } from "@/lib/platform-stats";
import { toCsv } from "@/lib/csv";

const STATUS: Record<string, string> = {
  exempt: "Demo", trial: "En prueba", active: "Al día", grace: "Vencido (gracia)", suspended: "Suspendido",
  approved: "Aprobado", pending: "Pendiente", rejected: "Rechazado", failed: "Fallido",
};

// GET /api/platform/manage/export?tipo=restaurantes|cobros — descarga en CSV (para Excel)
export async function GET(request: Request) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;

  const tipo = new URL(request.url).searchParams.get("tipo");
  let csv: string;
  if (tipo === "restaurantes") {
    const rows = await loadRestaurants();
    csv = toCsv(
      ["Restaurante", "Subdominio", "Dueño", "Estado", "Acceso hasta", "Platos", "Pedidos 30 días", "Pedidos total", "Vendido 30 días (COP)", "Pagado a Brasaya (COP)", "Último pago", "Registro"],
      rows.map((r) => [
        r.name, r.slug, r.owner_email, STATUS[r.billing.status], r.billing.accessUntil?.slice(0, 10) ?? "",
        r.items, r.orders_30d, r.orders, Math.round(r.sales_30d), r.paid_total, r.last_payment?.slice(0, 10) ?? "", r.created_at.slice(0, 10),
      ])
    );
  } else if (tipo === "cobros") {
    const rows = await listAllPayments(5000);
    csv = toCsv(
      ["Fecha", "Restaurante", "Subdominio", "Monto (COP)", "Meses", "Medio", "Estado", "Referencia", "ref_payco", "Periodo desde", "Periodo hasta", "Registrado por", "Nota"],
      rows.map((p) => [
        p.created_at, p.restaurant_name ?? "(eliminado)", p.slug ?? "", p.amount, p.months, p.payment_method ?? "epayco",
        STATUS[p.status], p.reference, p.ref_payco ?? "", p.period_start?.slice(0, 10) ?? "", p.period_end?.slice(0, 10) ?? "",
        p.created_by ?? "", p.notes ?? "",
      ])
    );
  } else {
    return NextResponse.json({ error: "Tipo de exportación no válido" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="brasaya-${tipo}-${colombiaDay()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
