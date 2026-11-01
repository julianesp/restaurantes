import { RefreshCcw } from "lucide-react";
import ReconcileForm from "@/components/platform/ReconcileForm";
import { requirePlatformAdmin } from "@/lib/platform-stats";
import { PageTitle, Card } from "@/components/platform/ui";

// Recupera pagos de la mensualidad que ePayco aprobó pero que no llegaron (webhook perdido, cliente que cerró la página)
export default async function ReconciliarPage() {
  await requirePlatformAdmin();
  return (
    <>
      <PageTitle icon={RefreshCcw} title="Reconciliar pagos de ePayco" subtitle="Para mensualidades que ePayco cobró pero que no se aplicaron solas." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ReconcileForm />
        </Card>
        <Card title="¿Cuándo usarlo?">
          <ol className="list-decimal space-y-2 px-8 py-4 text-sm text-stone-600 dark:text-stone-300">
            <li>Un restaurante dice que pagó pero sigue vencido.</li>
            <li>En el panel de ePayco → Transacciones, busca el pago (estado Aceptada) y copia su ref_payco.</li>
            <li>Pégalo aquí y pulsa Verificar: se consulta a ePayco y se muestra a qué restaurante corresponde.</li>
            <li>Si todo coincide, pulsa Aplicar.</li>
          </ol>
          <p className="border-t border-stone-200 px-4 py-3 text-xs text-stone-500 dark:border-stone-800">
            Solo se aplican pagos que ePayco confirma, por el monto exacto y del mismo restaurante. Los pagos de pedidos de los clientes no se manejan aquí.
          </p>
        </Card>
      </div>
    </>
  );
}
