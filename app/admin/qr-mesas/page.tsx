"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, QrCode, Printer, Plus, Trash2 } from "lucide-react";
import OrdersBoard from "@/components/kitchen/OrdersBoard";
import { QRCodeSVG } from "qrcode.react";

// El QR apunta al subdominio del restaurante desde el que se está administrando
const getBaseUrl = () =>
  typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "";
const TABLES_KEY = "qr_tables";

export default function MesasPedidosPage() {
  const [tab, setTab] = useState<"pedidos" | "qr">("pedidos");
  // Mesas dinámicas
  const [tables, setTables] = useState<number[]>([]);
  const [newTableNum, setNewTableNum] = useState("");

  // Cargar mesas desde localStorage (o inicializar con 1-12)
  useEffect(() => {
    const saved = localStorage.getItem(TABLES_KEY);
    if (saved) {
      try { setTables(JSON.parse(saved)); } catch { setTables(Array.from({ length: 12 }, (_, i) => i + 1)); }
    } else {
      setTables(Array.from({ length: 12 }, (_, i) => i + 1));
    }
  }, []);

  const saveTables = (updated: number[]) => {
    setTables(updated);
    localStorage.setItem(TABLES_KEY, JSON.stringify(updated));
  };

  const addTable = () => {
    const num = parseInt(newTableNum);
    if (!num || num < 1 || num > 999) return;
    if (tables.includes(num)) { setNewTableNum(""); return; }
    saveTables([...tables, num].sort((a, b) => a - b));
    setNewTableNum("");
  };

  const removeTable = (num: number) => {
    saveTables(tables.filter(t => t !== num));
  };

  const printQR = (tableId: number) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const url = `${getBaseUrl()}/mesa/${tableId}`;
    win.document.write(`
      <html><head><title>QR Mesa ${tableId}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px}h2{margin-bottom:8px}p{color:#666;margin-bottom:20px}img{width:220px;height:220px}</style>
      </head><body>
      <h2>Mesa ${tableId}</h2>
      <p>Escanea para pedir</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}" />
      <p style="margin-top:16px;font-size:12px;color:#999">${url}</p>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Mesas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pedidos en tiempo real · QR por mesa
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("pedidos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${tab === "pedidos" ? "bg-primary-500 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
            <UtensilsCrossed className="w-4 h-4" />
            Pedidos activos
          </button>
          <button onClick={() => setTab("qr")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${tab === "qr" ? "bg-primary-500 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
            <QrCode className="w-4 h-4" />
            Códigos QR
          </button>
        </div>

        {/* TAB QR */}
        {tab === "qr" && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Agrega las mesas de tu restaurante, imprime cada QR y pégalo en la mesa correspondiente.
            </p>

            {/* Agregar mesa */}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="number"
                min={1}
                max={999}
                value={newTableNum}
                onChange={e => setNewTableNum(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTable()}
                placeholder="Nº de mesa"
                className="w-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none text-center font-bold"
              />
              <button
                onClick={addTable}
                disabled={!newTableNum}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar mesa
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-500">{tables.length} mesa{tables.length !== 1 ? "s" : ""}</span>
            </div>

            {tables.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                <QrCode className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No hay mesas configuradas</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Agrega el número de una mesa para generar su QR</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map((tableId) => {
                  const url = `${getBaseUrl()}/mesa/${tableId}`;
                  return (
                    <div key={tableId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center gap-3 relative group">
                      <button
                        onClick={() => removeTable(tableId)}
                        title="Eliminar mesa"
                        className="absolute top-2 right-2 p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Mesa {tableId}</p>
                      <QRCodeSVG value={url} size={100} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
                      <button
                        onClick={() => printQR(tableId)}
                        className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB PEDIDOS: el mismo tablero que usa la cocina (/cocina) */}
        {tab === "pedidos" && <OrdersBoard />}
      </div>
    </div>
  );
}
