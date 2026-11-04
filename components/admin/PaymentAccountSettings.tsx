"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, ExternalLink } from "lucide-react";

// Cuenta de ePayco del restaurante (/api/tenant/payments). Los pagos de los clientes llegan
// directo a esa cuenta; sin ella, los pedidos y reservas se envían por WhatsApp.

interface Status {
  configured: boolean;
  publicKeyHint: string | null;
  verifiedAt: string | null;
}

const input =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function PaymentAccountSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [editing, setEditing] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/tenant/payments")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStatus)
      .catch(() => setMessage({ type: "error", text: "No se pudo cargar la cuenta de pagos" }));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tenant/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, privateKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setStatus(data);
      setEditing(false);
      setPublicKey("");
      setPrivateKey("");
      setMessage({ type: "ok", text: "Cuenta conectada. Tus clientes ya pueden pagar en línea." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "No se pudo guardar" });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("¿Desconectar tu cuenta de ePayco? Tus clientes volverán a pedir por WhatsApp.")) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tenant/payments", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo desconectar");
      setStatus(data);
      setMessage({ type: "ok", text: "Cuenta desconectada." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "No se pudo desconectar" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="pagos" className="mt-10 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
        <CreditCard className="w-5 h-5" /> Pagos en línea (ePayco)
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Conecta <strong>tu propia cuenta de ePayco</strong> para que tus clientes paguen pedidos y reservas en línea. El dinero
        llega directo a tu cuenta; Brasaya no lo recibe ni cobra comisión sobre tus ventas. Mientras no la conectes, los pedidos
        llegan a tu WhatsApp y se pagan al recibir.
      </p>

      {status === null && !message && <p className="text-sm text-gray-500">Cargando…</p>}

      {status?.configured && !editing && (
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-green-800 dark:text-green-300">
            <CheckCircle2 className="w-4 h-4" /> Cuenta conectada
          </p>
          <p className="mt-1 text-gray-700 dark:text-gray-300">
            Llave pública <span className="font-mono">{status.publicKeyHint}</span>
            {status.verifiedAt && ` · verificada el ${new Date(status.verifiedAt).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={() => setEditing(true)} disabled={busy}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 disabled:opacity-50">
              Cambiar llaves
            </button>
            <button type="button" onClick={disconnect} disabled={busy}
              className="rounded-lg border border-red-300 dark:border-red-800 px-4 py-2 text-red-700 dark:text-red-400 disabled:opacity-50">
              Desconectar
            </button>
          </div>
        </div>
      )}

      {status && (!status.configured || editing) && (
        <form onSubmit={save} className="space-y-3">
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>
              Crea o abre tu cuenta en{" "}
              <a href="https://dashboard.epayco.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-600 underline">
                ePayco <ExternalLink className="w-3 h-3" />
              </a>{" "}
              (debe estar a nombre de tu restaurante o de su dueño).
            </li>
            <li>Ve a <strong>Integraciones → Llaves API</strong> y copia la <code>PUBLIC_KEY</code> y la <code>PRIVATE_KEY</code>.</li>
            <li>Pégalas aquí. Las probamos con ePayco antes de guardarlas y la privada se guarda cifrada.</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Para que tus clientes paguen con <strong>Nequi</strong> dentro de ePayco, revisa en tu panel de ePayco que Nequi
            esté activo entre tus medios de pago (si no aparece, pídeselo al soporte de ePayco).
          </p>
          <div>
            <label htmlFor="epayco-public" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">PUBLIC_KEY</label>
            <input id="epayco-public" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} required autoComplete="off" spellCheck={false} className={input} />
          </div>
          <div>
            <label htmlFor="epayco-private" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">PRIVATE_KEY</label>
            <input id="epayco-private" type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} required autoComplete="new-password" spellCheck={false} className={input} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy}
              className="rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 transition-colors">
              {busy ? "Verificando con ePayco…" : "Conectar cuenta"}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(false)} disabled={busy}
                className="rounded-xl border border-gray-300 dark:border-gray-600 px-6 py-2.5">
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {message && (
        <p role="status" className={message.type === "ok" ? "text-green-700 dark:text-green-400 text-sm" : "text-red-600 text-sm"}>{message.text}</p>
      )}
    </section>
  );
}
