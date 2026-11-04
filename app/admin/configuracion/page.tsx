"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import PaymentAccountSettings from "@/components/admin/PaymentAccountSettings";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import TelegramConnect from "@/components/admin/TelegramConnect";
import { CreditCard } from "lucide-react";
import { defaultSchedule, parseSchedule } from "@/lib/hours";

type Settings = Record<string, string>;

interface Loaded {
  name: string;
  slug: string;
  plan: string;
  status: string;
  trial_ends_at: string | null;
  settings: Settings;
  telegram_bot_available: boolean;
  whatsapp_available: boolean;
  can_configure_payments: boolean;
  online_payments: boolean;
}

const FIELDS: Array<{ key: string; label: string; placeholder?: string; multiline?: boolean; hint?: string }> = [
  { key: "tagline", label: "Eslogan", placeholder: "Comida casera con sabor a tradición" },
  { key: "about", label: "Sobre nosotros", multiline: true, hint: "Se muestra en la página Nosotros." },
  { key: "city", label: "Ciudad", placeholder: "Medellín, Antioquia" },
  { key: "address", label: "Dirección", placeholder: "Calle 1 # 2-3" },
  { key: "phone", label: "Teléfono", placeholder: "+57 300 000 0000" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "573001234567", hint: "Con indicativo, solo números." },
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/mirestaurante" },
  { key: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/mirestaurante" },
  { key: "tiktok_url", label: "TikTok", placeholder: "https://tiktok.com/@mirestaurante" },
];

const input =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function ConfiguracionPage() {
  const [data, setData] = useState<Loaded | null>(null);
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);

  useEffect(() => {
    fetch("/api/tenant/settings")
      .then((r) => r.json())
      .then((d: Loaded) => {
        setData(d);
        setName(d.name);
        setSettings(d.settings);
      })
      .catch(() => setMessage({ type: "error", text: "No se pudo cargar la configuración" }));
  }, []);

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, settings }),
      });
      const body = await res.json();
      setMessage(res.ok ? { type: "ok", text: "Cambios guardados" } : { type: "error", text: body.error || "No se pudo guardar" });
      // El color y el logo se leen al cargar la página: se recarga para verlos aplicados
      if (res.ok) setTimeout(() => window.location.reload(), 700);
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsappTest = async () => {
    setTestingWhatsapp(true);
    setMessage(null);
    try {
      const res = await fetch("/api/whatsapp/test", { method: "POST" });
      const body = await res.json();
      setMessage(body.success ? { type: "ok", text: "Mensaje de prueba enviado por WhatsApp" } : { type: "error", text: body.error || "No se pudo enviar" });
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setTestingWhatsapp(false);
    }
  };

  if (!data) return <p className="p-8 text-gray-600 dark:text-gray-300">Cargando…</p>;

  const schedule = parseSchedule(settings.hours_schedule) ?? defaultSchedule();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Configuración del restaurante</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Tu sitio: <strong>{data.slug}</strong> · Plan: {data.plan}
        {data.status === "trial" && data.trial_ends_at && ` · Prueba hasta ${new Date(data.trial_ends_at).toLocaleDateString("es-CO")}`}
      </p>

      <form onSubmit={save} className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Identidad</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Nombre</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} className={input} />
          </div>

          <div>
            <span className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Logo</span>
            <ImageUploader value={settings.logo_url || ""} onChange={(url: string) => set("logo_url", url)} />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Color principal</label>
            <div className="flex items-center gap-3">
              <input id="color" type="color" value={/^#[0-9a-f]{6}$/i.test(settings.primary_color || "") ? settings.primary_color : "#eb810f"}
                onChange={(e) => set("primary_color", e.target.value)} className="h-10 w-14 rounded border border-gray-300 dark:border-gray-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{settings.primary_color || "Color por defecto"}</span>
              {settings.primary_color && (
                <button type="button" onClick={() => set("primary_color", "")} className="text-sm text-primary-600 underline">Restablecer</button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Contacto e información</h2>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label htmlFor={f.key} className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">{f.label}</label>
              {f.multiline ? (
                <textarea id={f.key} rows={4} value={settings[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} className={input} />
              ) : (
                <input id={f.key} value={settings[f.key] || ""} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={input} />
              )}
              {f.hint && <p className="text-xs text-gray-500 mt-1">{f.hint}</p>}
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Horario de atención</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Activa los días que abres y toca las horas para cambiarlas: desliza los números hacia arriba o hacia abajo.
          </p>
          {!settings.hours_schedule && settings.hours && (
            <p className="text-sm text-gray-500">Horario anterior: “{settings.hours}”. Ajústalo aquí por días y guarda.</p>
          )}
          <ScheduleEditor value={schedule} onChange={(next) => set("hours_schedule", JSON.stringify(next))} />
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Avisos de pedidos por Telegram</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Recibe en Telegram cada pedido, reserva o problema con un pago, al instante y gratis.
          </p>
          <TelegramConnect
            chatId={settings.telegram_chat_id || ""}
            available={data.telegram_bot_available}
            onChange={(id) => set("telegram_chat_id", id)}
          />
          <p className="text-xs text-gray-500">
            ¿No usas Telegram? Más abajo puedes recibir los avisos por WhatsApp escribiendo solo tu número de celular.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Alertas por WhatsApp</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Brasaya te escribe por WhatsApp cuando entra un pedido pagado en línea y cuando tu mensualidad está por vencer.
            Escribe el celular que debe recibir los avisos; déjalo vacío si no los quieres.
          </p>
          {!data.whatsapp_available && (
            <p className="text-sm text-yellow-700 dark:text-yellow-400">Las alertas por WhatsApp de la plataforma aún no están activadas.</p>
          )}
          <input value={settings.whatsapp_alerts || ""} placeholder="Celular, p. ej. 3001234567" inputMode="tel"
            onChange={(e) => set("whatsapp_alerts", e.target.value)} className={input} aria-label="Celular para alertas por WhatsApp" />
          <button type="button" onClick={sendWhatsappTest} disabled={testingWhatsapp || !settings.whatsapp_alerts || !data.whatsapp_available}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm disabled:opacity-50">
            {testingWhatsapp ? "Enviando…" : "Enviar mensaje de prueba"}
          </button>
          <p className="text-xs text-gray-500">Guarda los cambios antes de enviar la prueba.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Pagos por Nequi</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Escribe tu número de Nequi y tus clientes podrán elegir <strong>Transferencia a Nequi</strong> al pedir: ven tu
            número y el valor, te transfieren y el pedido te llega por WhatsApp para que revises el comprobante antes de
            prepararlo. No tiene comisión. Déjalo vacío si no quieres ofrecerlo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="nequi_number" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Número de Nequi</label>
              <input id="nequi_number" value={settings.nequi_number || ""} placeholder="3001234567" inputMode="tel"
                onChange={(e) => set("nequi_number", e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="nequi_holder" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">A nombre de</label>
              <input id="nequi_holder" value={settings.nequi_holder || ""} placeholder="Nombre del titular" maxLength={60}
                onChange={(e) => set("nequi_holder", e.target.value)} className={input} />
            </div>
          </div>
          {!settings.whatsapp && (
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Llena también tu WhatsApp (arriba): ahí te llegan los pedidos pagados por Nequi.
            </p>
          )}
        </section>

        {message && (
          <p role="status" className={message.type === "ok" ? "text-green-700 text-sm" : "text-red-600 text-sm"}>{message.text}</p>
        )}
        <button type="submit" disabled={saving}
          className="rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold px-8 py-3 transition-colors">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      {data.can_configure_payments ? (
        <PaymentAccountSettings />
      ) : (
        <section id="pagos" className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <CreditCard className="h-5 w-5 text-primary-600" /> Pagos en línea (ePayco)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Solo el dueño del restaurante puede conectar o cambiar la cuenta de ePayco donde llegan los pagos.
          </p>
          <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            Estado: {data.online_payments ? "conectado" : "sin conectar"}
          </p>
        </section>
      )}
    </div>
  );
}
