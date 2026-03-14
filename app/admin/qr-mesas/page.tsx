"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, QrCode } from "lucide-react";

export default function QRTablesPage() {
  const [numTables, setNumTables] = useState(10);
  const [baseUrl, setBaseUrl] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  // Detectar URL base automáticamente (usar URL de producción por defecto)
  useState(() => {
    if (typeof window !== "undefined") {
      // Usar la URL de producción configurada en .env, o detectar automáticamente
      const productionUrl = process.env.NEXT_PUBLIC_BASE_URL;
      setBaseUrl(productionUrl || window.location.origin);
    }
  });

  const generateTableUrl = (tableNumber: number) => {
    return `${baseUrl}/mesa/${tableNumber}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadQR = (tableNumber: number) => {
    const svg = document.getElementById(`qr-${tableNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `mesa-${tableNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 no-print">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Códigos QR para Mesas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Genera códigos QR para que los clientes puedan hacer pedidos desde sus mesas
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 no-print">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Número de Mesas
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={numTables}
                onChange={(e) => setNumTables(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                URL Base del Sitio
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://turestaurante.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              <Printer className="w-5 h-5" />
              Imprimir Todos
            </button>
          </div>
        </div>

        {/* QR Codes Grid */}
        <div ref={printRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: numTables }, (_, i) => i + 1).map((tableNumber) => (
            <div
              key={tableNumber}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 print:break-inside-avoid print:shadow-none print:border-2 print:border-gray-300"
            >
              <div className="text-center">
                <div className="bg-primary-500 text-white rounded-t-lg py-3 -mx-6 -mt-6 mb-4">
                  <h3 className="text-2xl font-bold">Mesa {tableNumber}</h3>
                  <p className="text-sm opacity-90">Restaurante</p>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      id={`qr-${tableNumber}`}
                      value={generateTableUrl(tableNumber)}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Escanea para hacer tu pedido
                </p>

                <button
                  onClick={() => downloadQR(tableNumber)}
                  className="no-print flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-all w-full justify-center"
                >
                  <Download className="w-4 h-4" />
                  Descargar PNG
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 break-all">
                  {generateTableUrl(tableNumber)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
