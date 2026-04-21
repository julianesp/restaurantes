"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  // ePayco envía parámetros diferentes
  const refPayco = searchParams.get("ref_payco");
  const transactionState = searchParams.get("x_transaction_state");
  const invoice = searchParams.get("x_invoice"); // Nuestra referencia

  // Parámetros legacy (para compatibilidad)
  const type = searchParams.get("type"); // 'reserva' o 'pedido'
  const reference = searchParams.get("reference") || invoice;

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Verificar estado de la transacción de ePayco
        if (transactionState && transactionState !== "Aceptada") {
          setStatus("error");
          if (transactionState === "Rechazada") {
            setMessage("El pago fue rechazado. Por favor intenta nuevamente o usa otro método de pago.");
          } else if (transactionState === "Pendiente") {
            setMessage("El pago está pendiente de confirmación. Te notificaremos cuando se complete.");
          } else {
            setMessage("Hubo un problema con el pago. Por favor contacta al restaurante.");
          }
          return;
        }

        if (!reference) {
          throw new Error("Referencia de pago no encontrada");
        }

        // Determinar tipo desde la referencia si no viene como parámetro
        let paymentType = type;
        if (!paymentType && reference) {
          paymentType = reference.startsWith("RESERVA") ? "reserva" : "pedido";
        }

        if (!paymentType) {
          throw new Error("Tipo de pago no encontrado");
        }

        // Obtener datos guardados en localStorage
        const storageKey = `${paymentType}_${reference}`;
        const dataString = localStorage.getItem(storageKey);

        if (!dataString) {
          throw new Error("Datos de la transacción no encontrados");
        }

        const data = JSON.parse(dataString);

        // Guardar referencia de ePayco si viene
        if (refPayco) {
          data.refPayco = refPayco;
          localStorage.setItem(storageKey, JSON.stringify(data));
        }

        // Enviar notificación al chef/admin vía Telegram
        if (paymentType === "reserva") {
          fetch('/api/notify-reservation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference,
              customerName: data.nombre,
              customerPhone: data.telefono,
              date: data.fecha,
              time: data.hora,
              people: data.personas,
              comments: data.comentarios,
              transactionId: refPayco,
            }),
          }).catch(() => {});
        } else if (paymentType === "pedido") {
          // Reconstruir items desde el texto del pedido o desde items guardados
          const items = data.items?.map((item: { name: string; quantity: number }) => ({
            name: item.name,
            quantity: item.quantity,
          })) || [{ name: data.pedido || 'Ver detalles', quantity: 1 }];

          fetch('/api/notify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference,
              customerName: data.nombre,
              customerPhone: data.telefono,
              address: data.direccion,
              city: data.barrio,
              items,
              total: data.total,
              serviceType: data.tipoServicio,
              notes: data.notas,
              transactionId: refPayco,
            }),
          }).catch(() => {});
        }

        // Enviar confirmación por WhatsApp
        if (paymentType === "reserva") {
          const mensaje = `*✅ RESERVA CONFIRMADA - PAGO RECIBIDO*%0A%0A` +
            `📋 *Referencia:* ${reference}%0A` +
            `👤 *Nombre:* ${data.nombre}%0A` +
            `📱 *Teléfono:* ${data.telefono}%0A` +
            `📅 *Fecha:* ${data.fecha}%0A` +
            `🕐 *Hora:* ${data.hora}%0A` +
            `👥 *Personas:* ${data.personas}%0A` +
            `${data.comentarios ? `📝 *Comentarios:* ${data.comentarios}%0A` : ""}` +
            `%0A💰 *Anticipo pagado:* $10.000 COP%0A` +
            `⏱️ *Mesa reservada por:* 1 hora%0A%0A` +
            `¡Gracias por tu reserva! Te esperamos.`;

          const numeroWhatsApp = "573174503604";
          const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

          // Esperar 2 segundos antes de redirigir
          setTimeout(() => {
            window.open(urlWhatsApp, "_blank");
            // Limpiar localStorage
            localStorage.removeItem(storageKey);
          }, 2000);
        } else if (paymentType === "pedido") {
          let mensaje = `*✅ PEDIDO CONFIRMADO - PAGO RECIBIDO*%0A%0A` +
            `📋 *Referencia:* ${reference}%0A` +
            `👤 *Nombre:* ${data.nombre}%0A` +
            `📱 *Teléfono:* ${data.telefono}%0A` +
            `${data.tipoServicio === "domicilio" ? "🏍️" : "🏪"} *Servicio:* ${
              data.tipoServicio === "domicilio" ? "Domicilio" : "Recoger en el local"
            }%0A`;

          if (data.tipoServicio === "domicilio") {
            mensaje += `📍 *Dirección:* ${data.direccion}%0A` +
              `🏘️ *Barrio:* ${data.barrio}%0A`;
          }

          mensaje += `🍽️ *Pedido:*%0A${data.pedido}%0A%0A` +
            `💰 *Total pagado:* $${data.total.toLocaleString("es-CO")} COP%0A%0A` +
            `¡Gracias por tu pedido! Pronto te contactaremos.`;

          const numeroWhatsApp = "573174503604";
          const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

          // Esperar 2 segundos antes de redirigir
          setTimeout(() => {
            window.open(urlWhatsApp, "_blank");
            // Limpiar localStorage
            localStorage.removeItem(storageKey);
          }, 2000);
        }

        setStatus("success");
        setMessage(
          paymentType === "reserva"
            ? "¡Tu reserva ha sido confirmada! En breve te redirigiremos a WhatsApp."
            : "¡Tu pedido ha sido confirmado! En breve te redirigiremos a WhatsApp."
        );
      } catch (error: unknown) {
        console.error("Error processing payment:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Error al procesar el pago. Por favor contacta al restaurante."
        );
      }
    };

    processPayment();
  }, [reference, type, refPayco, transactionState, invoice]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Procesando pago...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Por favor espera un momento
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Pago Exitoso!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            {refPayco && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Referencia ePayco:</strong> {refPayco}
                </p>
              </div>
            )}
            <div className="space-y-3">
              <Link
                href={`/invoice?type=${type || (reference?.startsWith("RESERVA") ? "reserva" : "pedido")}&reference=${reference}`}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <FileText className="w-5 h-5" />
                Ver y Descargar Factura
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error en el Pago
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al Inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Cargando...
            </h2>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
