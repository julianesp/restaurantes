import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { first } from "@/lib/db";
import type { Tenant } from "@/lib/tenant";

interface Step {
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
  optional?: boolean;
}

const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;

/**
 * Guía de primeros pasos para un restaurante recién creado: el sitio público arranca vacío
 * y todo se llena desde el panel. Desaparece cuando los pasos obligatorios están hechos.
 */
export default async function OnboardingChecklist({ tenant }: { tenant: Tenant }) {
  // El demo de la plataforma ya tiene su contenido
  if (tenant.plan === "legacy") return null;

  const counts = await first<{ items: number; specials: number; tables: number }>(
    `SELECT
       (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = ? AND is_available = 1) AS items,
       (SELECT COUNT(*) FROM daily_specials WHERE restaurant_id = ?) AS specials,
       (SELECT COUNT(*) FROM restaurant_tables WHERE restaurant_id = ?) AS tables`,
    tenant.id, tenant.id, tenant.id
  );
  const s = tenant.settings ?? {};

  const steps: Step[] = [
    {
      title: "Agrega tu menú",
      description: "Crea las categorías (entradas, platos fuertes, bebidas…) y agrega tus platos con precio y foto. Es lo que verán tus clientes en tu sitio.",
      href: "/admin/menu",
      cta: "Ir al menú",
      done: (counts?.items ?? 0) > 0,
    },
    {
      title: "Completa los datos del restaurante",
      description: "Sube tu logo, escribe la dirección y el WhatsApp donde recibirás los pedidos, y marca tu horario por días.",
      href: "/admin/configuracion",
      cta: "Ir a configuración",
      done: filled(s.logo_url) && filled(s.address) && (filled(s.whatsapp) || filled(s.phone)),
    },
    {
      title: "Publica los platos del día",
      description: "Aparecen en la portada de tu sitio. Ideal para el almuerzo o el corrientazo de hoy.",
      href: "/admin/daily-specials",
      cta: "Agregar plato del día",
      done: (counts?.specials ?? 0) > 0,
      optional: true,
    },
    {
      title: "Crea las mesas y sus códigos QR",
      description: "Tus clientes escanean el QR de la mesa y hacen el pedido desde el celular.",
      href: "/admin/qr-mesas",
      cta: "Crear mesas",
      done: (counts?.tables ?? 0) > 0,
      optional: true,
    },
    {
      title: "Recibe pagos en línea",
      description: "Conecta tu propia cuenta de ePayco (tarjeta, PSE y Nequi) o escribe tu número de Nequi para recibir transferencias. Mientras tanto, los pedidos llegan a tu WhatsApp.",
      href: "/admin/configuracion#pagos",
      cta: "Conectar pagos",
      done: s.online_payments === true || filled(s.nequi_number),
      optional: true,
    },
  ];

  const required = steps.filter((step) => !step.optional);
  if (required.every((step) => step.done)) return null;

  const doneCount = steps.filter((step) => step.done).length;
  const next = steps.find((step) => !step.done);

  return (
    <section
      aria-labelledby="onboarding-title"
      className="mb-8 rounded-2xl border border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-lg"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 id="onboarding-title" className="text-lg font-bold text-gray-900 dark:text-white">
          Primeros pasos para abrir tu restaurante
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {doneCount} de {steps.length} listos
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Tu sitio ya está publicado, pero está vacío hasta que agregues tu menú. Sigue estos pasos:
      </p>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-[width] duration-500 ease-out"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => {
          const isNext = step === next;
          return (
            <li
              key={step.title}
              className={`flex gap-3 rounded-xl p-3 ${
                isNext ? "bg-primary-50 dark:bg-primary-950/40 ring-1 ring-primary-200 dark:ring-primary-800" : ""
              }`}
            >
              {step.done ? (
                <CheckCircle2 className="w-6 h-6 shrink-0 text-green-600" aria-label="Hecho" />
              ) : (
                <Circle className="w-6 h-6 shrink-0 text-gray-400" aria-label="Pendiente" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold ${
                    step.done ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {i + 1}. {step.title}
                  {step.optional && (
                    <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400 no-underline">
                      (opcional)
                    </span>
                  )}
                </p>
                {!step.done && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{step.description}</p>
                    <Link
                      href={step.href}
                      {...(step.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${
                        isNext
                          ? "rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5"
                          : "text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      }`}
                    >
                      {step.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
