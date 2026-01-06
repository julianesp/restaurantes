"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Download, Eye, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { downloadInvoice, viewInvoice } from "../../utils/invoice";

function InvoicePageContent() {
  const searchParams = useSearchParams();
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const type = searchParams.get("type");
  const reference = searchParams.get("reference");

  useEffect(() => {
    const loadInvoiceData = () => {
      try {
        if (!reference || !type) {
          throw new Error("Referencia o tipo no encontrado");
        }

        const storageKey = `${type}_${reference}`;
        const dataString = localStorage.getItem(storageKey);

        if (!dataString) {
          throw new Error("Datos de la factura no encontrados");
        }

        const data = JSON.parse(dataString);
        setInvoiceData(data);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error loading invoice data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar los datos de la factura"
        );
        setLoading(false);
      }
    };

    loadInvoiceData();
  }, [reference, type]);

  const handleDownload = () => {
    if (!invoiceData) return;

    downloadInvoice({
      reference: invoiceData.reference,
      type: type as 'reserva' | 'pedido',
      customerName: invoiceData.nombre,
      customerPhone: invoiceData.telefono,
      amount: type === 'reserva' ? 10000 : invoiceData.total,
      date: invoiceData.createdAt,
      // Reserva
      fecha: invoiceData.fecha,
      hora: invoiceData.hora,
      personas: invoiceData.personas,
      comentarios: invoiceData.comentarios,
      // Pedido
      tipoServicio: invoiceData.tipoServicio,
      direccion: invoiceData.direccion,
      barrio: invoiceData.barrio,
      pedido: invoiceData.pedido,
    });
  };

  const handleView = () => {
    if (!invoiceData) return;

    viewInvoice({
      reference: invoiceData.reference,
      type: type as 'reserva' | 'pedido',
      customerName: invoiceData.nombre,
      customerPhone: invoiceData.telefono,
      amount: type === 'reserva' ? 10000 : invoiceData.total,
      date: invoiceData.createdAt,
      // Reserva
      fecha: invoiceData.fecha,
      hora: invoiceData.hora,
      personas: invoiceData.personas,
      comentarios: invoiceData.comentarios,
      // Pedido
      tipoServicio: invoiceData.tipoServicio,
      direccion: invoiceData.direccion,
      barrio: invoiceData.barrio,
      pedido: invoiceData.pedido,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Cargando factura...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Factura de Pago
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type === 'reserva' ? 'Reserva de Mesa' : 'Pedido de Comida'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                PAGADO
              </span>
            </div>
          </div>

          {/* Información de la factura */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Referencia</p>
                <p className="font-mono font-semibold text-gray-900 dark:text-white">
                  {invoiceData.reference}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de emisión</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(invoiceData.createdAt).toLocaleString('es-CO')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {invoiceData.nombre}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {invoiceData.telefono}
                </p>
              </div>
            </div>
          </div>

          {/* Detalles específicos */}
          {type === 'reserva' ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Detalles de la Reserva
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>📅 Fecha: <span className="font-semibold">{invoiceData.fecha}</span></p>
                <p>🕐 Hora: <span className="font-semibold">{invoiceData.hora}</span></p>
                <p>👥 Personas: <span className="font-semibold">{invoiceData.personas}</span></p>
                {invoiceData.comentarios && (
                  <p>📝 Comentarios: <span className="font-semibold">{invoiceData.comentarios}</span></p>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Detalles del Pedido
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  {invoiceData.tipoServicio === 'domicilio' ? '🏍️' : '🏪'} Servicio:{' '}
                  <span className="font-semibold">
                    {invoiceData.tipoServicio === 'domicilio' ? 'Domicilio' : 'Recoger en local'}
                  </span>
                </p>
                {invoiceData.tipoServicio === 'domicilio' && (
                  <>
                    <p>📍 Dirección: <span className="font-semibold">{invoiceData.direccion}</span></p>
                    <p>🏘️ Barrio: <span className="font-semibold">{invoiceData.barrio}</span></p>
                  </>
                )}
                <p>🍽️ Pedido: <span className="font-semibold">{invoiceData.pedido}</span></p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Pagado</span>
              <span className="text-3xl font-bold">
                ${(type === 'reserva' ? 10000 : invoiceData.total).toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleView}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-500 text-primary-500 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 font-semibold"
            >
              <Eye className="w-5 h-5" />
              Ver Factura
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
            >
              <Download className="w-5 h-5" />
              Descargar PDF
            </button>
          </div>
          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
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
      <InvoicePageContent />
    </Suspense>
  );
}
