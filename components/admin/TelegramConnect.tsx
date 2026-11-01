"use client";

import { useState } from "react";
import { CheckCircle2, Send, ExternalLink } from "lucide-react";

interface Props {
  chatId: string;
  available: boolean;
  /** Avisa a la página del chat conectado ("" al desconectar) para no pisarlo al guardar el formulario */
  onChange: (chatId: string) => void;
}

const btn = "rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50";

/** Conecta el chat de Telegram del restaurante en tres toques, sin copiar IDs (ver /api/tenant/telegram). */
export default function TelegramConnect({ chatId, available, onChange }: Props) {
  const [link, setLink] = useState<{ url: string; code: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [manual, setManual] = useState("");

  const call = async (method: string, body?: unknown) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tenant/telegram", {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: data.error || "No se pudo completar" });
        return null;
      }
      return data;
    } catch {
      setMessage({ ok: false, text: "Error de conexión. Intenta de nuevo." });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    const data = await call("POST", { action: "start" });
    if (data) setLink({ url: data.url, code: data.code });
  };

  const check = async () => {
    const data = await call("POST", { action: "check" });
    if (!data) return;
    if (data.connected) {
      onChange(data.chatId);
      setLink(null);
      setMessage({ ok: true, text: `¡Listo! Conectado con ${data.chatName}. Te enviamos un mensaje de prueba.` });
    } else {
      setMessage({ ok: false, text: "Aún no vemos tu mensaje. En Telegram toca “Iniciar” (o “Start”) y vuelve a intentar." });
    }
  };

  const test = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/test-notification");
      const body = await res.json();
      setMessage(body.success ? { ok: true, text: "Mensaje de prueba enviado a Telegram" } : { ok: false, text: body.error || "No se pudo enviar" });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (await call("DELETE")) {
      onChange("");
      setMessage({ ok: true, text: "Telegram desconectado: ya no recibirás avisos allí." });
    }
  };

  if (!available) {
    return (
      <div className="space-y-2">
        <button type="button" disabled className={`${btn} inline-flex cursor-not-allowed items-center gap-2 bg-sky-500 text-white`}>
          <Send className="h-4 w-4" /> Conectar con Telegram
        </button>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Los avisos por Telegram todavía no están disponibles en Brasaya. Te avisaremos cuando puedas conectarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chatId ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="flex-1 text-sm text-emerald-900 dark:text-emerald-200">Conectado: los avisos llegan a tu Telegram.</span>
          <button type="button" onClick={test} disabled={busy} className={`${btn} border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900`}>
            Enviar prueba
          </button>
          <button type="button" onClick={disconnect} disabled={busy} className={`${btn} text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950`}>
            Desconectar
          </button>
        </div>
      ) : link ? (
        <ol className="space-y-3 rounded-xl border border-primary-200 bg-primary-50/50 p-4 text-sm dark:border-primary-900 dark:bg-primary-950/20">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">1</span>
            <div>
              <p className="mb-2 text-gray-800 dark:text-gray-200">Abre el bot de Brasaya en Telegram (en el celular o el computador):</p>
              <a href={link.url} target="_blank" rel="noreferrer" className={`${btn} inline-flex items-center gap-2 bg-sky-500 text-white hover:bg-sky-600`}>
                <Send className="h-4 w-4" /> Abrir Telegram <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">2</span>
            <p className="text-gray-800 dark:text-gray-200">En Telegram toca el botón <strong>“Iniciar”</strong> (o <strong>“Start”</strong>) que aparece abajo.</p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">3</span>
            <div>
              <p className="mb-2 text-gray-800 dark:text-gray-200">Vuelve aquí y toca:</p>
              <button type="button" onClick={check} disabled={busy} className={`${btn} bg-primary-600 text-white hover:bg-primary-700`}>
                {busy ? "Buscando…" : "Ya toqué Iniciar"}
              </button>
            </div>
          </li>
          <li className="border-t border-primary-200 pt-3 text-xs text-gray-600 dark:border-primary-900 dark:text-gray-400">
            ¿Quieres los avisos en un grupo (por ejemplo, el de la cocina)? Agrega el bot al grupo y escribe allí este código:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-gray-900 dark:bg-gray-900 dark:text-white">{link.code}</code>. Luego toca “Ya toqué Iniciar”.
            El enlace vence en 15 minutos.
          </li>
        </ol>
      ) : (
        <button type="button" onClick={start} disabled={busy} className={`${btn} inline-flex items-center gap-2 bg-sky-500 text-white hover:bg-sky-600`}>
          <Send className="h-4 w-4" /> {busy ? "Preparando…" : "Conectar con Telegram"}
        </button>
      )}

      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}`}>{message.text}</p>
      )}

      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer select-none">Opción avanzada: pegar el ID del chat</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="ID del chat, p. ej. -1001234567890"
            inputMode="numeric"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            aria-label="ID del chat de Telegram"
          />
          <button
            type="button"
            disabled={!/^-?\d{5,20}$/.test(manual.trim())}
            onClick={() => {
              onChange(manual.trim());
              setManual("");
              setMessage({ ok: true, text: "ID agregado. Toca “Guardar cambios” para aplicarlo." });
            }}
            className={`${btn} border border-gray-300 dark:border-gray-600`}
          >
            Usar este ID
          </button>
        </div>
      </details>
    </div>
  );
}
