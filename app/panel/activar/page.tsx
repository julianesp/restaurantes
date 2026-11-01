import { BadgeCheck } from "lucide-react";
import ManualPaymentForm from "@/components/platform/ManualPaymentForm";
import { requirePlatformAdmin, loadRestaurants } from "@/lib/platform-stats";
import { MANUAL_METHODS } from "@/lib/platform-admin";
import { MONTHLY_PRICE_COP } from "@/lib/billing";
import { PageTitle, Card, formatDay } from "@/components/platform/ui";

// Pagos que no pasan por ePayco: se registran (quedan en el historial) y suman los meses de acceso
export default async function ActivarPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  await requirePlatformAdmin();
  const { r = "" } = await searchParams;
  const restaurants = (await loadRestaurants())
    .filter((x) => x.plan !== "legacy")
    .map((x) => ({ id: x.id, name: x.name, slug: x.slug, owner: x.owner_email, accessUntil: formatDay(x.billing.accessUntil) }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <>
      <PageTitle icon={BadgeCheck} title="Registrar pago manual" subtitle="Para pagos por Nequi, Daviplata, transferencia o efectivo, después de verificarlos." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ManualPaymentForm restaurants={restaurants} methods={MANUAL_METHODS} monthlyPrice={MONTHLY_PRICE_COP} initialId={r} />
        </Card>
        <Card title="Cómo usarlo">
          <ol className="list-decimal space-y-2 px-8 py-4 text-sm text-stone-600 dark:text-stone-300">
            <li>Recibe el comprobante del restaurante (por WhatsApp, por ejemplo).</li>
            <li>Verifica que el dinero llegó a tu cuenta de Nequi o del banco.</li>
            <li>Elige el restaurante, los meses y el monto recibido.</li>
            <li>Escribe el número del comprobante en la nota.</li>
            <li>Pulsa “Registrar pago y activar”: queda en el historial de cobros y el restaurante se reactiva si estaba vencido.</li>
          </ol>
          <p className="border-t border-stone-200 px-4 py-3 text-xs text-stone-500 dark:border-stone-800">
            Una suspensión hecha a mano no se levanta con un pago: usa Reactivar en Gestionar.
          </p>
        </Card>
      </div>
    </>
  );
}
