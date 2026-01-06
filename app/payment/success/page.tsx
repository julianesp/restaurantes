"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const type = searchParams.get("type"); // 'reserva' o 'pedido'
  const reference = searchParams.get("reference");

  useEffect(() => {
    const processPayment = async () => {
      try {
        if (!reference || !type) {
          throw new Error("Referencia o tipo de pago no encontrado");
        }

        // Obtener datos guardados en localStorage
        const storageKey = `${type}_${reference}`;
        const dataString = localStorage.getItem(storageKey);

        if (!dataString) {
          throw new Error("Datos de la transacción no encontrados");
        }

        const data = JSON.parse(dataString);

        // Enviar confirmación por WhatsApp
        if (type === "reserva") {
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
        } else if (type === "pedido") {
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
          type === "reserva"
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
  }, [reference, type]);

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
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
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
