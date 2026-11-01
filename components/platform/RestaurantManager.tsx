"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, Crown, Trash2 } from "lucide-react";

interface Props {
  restaurant: { id: string; slug: string; name: string; plan: string; status: string };
  /** Texto ya formateado de "Acceso hasta" */
  accessUntil: string;
  /** Bloqueado por falta de pago (no a mano): se arregla extendiendo el acceso, no reactivando */
  expired: boolean;
}

interface Member {
  email: string;
  role: "owner" | "admin";
}

const btn =
  "rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const input =
  "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-stone-700 dark:bg-stone-950 dark:text-white";

/** Opciones de la plataforma para un restaurante: estado, acceso, miembros y eliminación. */
export default function RestaurantManager({ restaurant, accessUntil, expired }: Props) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [days, setDays] = useState("30");
  const [kind, setKind] = useState<"paid" | "trial">("paid");
  const [newEmail, setNewEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const isDemo = restaurant.plan === "legacy";
  // Suspensión manual desde la plataforma (columna status); la de falta de pago sale de las fechas
  const suspended = restaurant.status === "suspended" || restaurant.status === "canceled";
  const base = `/api/platform/manage/${encodeURIComponent(restaurant.id)}`;

  const call = async (url: string, method: string, body?: unknown) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: data.error || "No se pudo completar la acción" });
        return null;
      }
      return data;
    } catch {
      setMessage({ ok: false, text: "Error de conexión. Inténtalo de nuevo." });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const open = async () => {
    dialog.current?.showModal();
    setMessage(null);
    setConfirm("");
    const data = await call(`${base}/members`, "GET");
    if (data) setMembers(data.members);
  };

  const restaurantAction = async (body: Record<string, unknown>, done: string) => {
    if (await call(base, "PATCH", body)) {
      setMessage({ ok: true, text: done });
      router.refresh();
    }
  };

  const memberAction = async (method: string, email: string, done: string) => {
    const data = await call(`${base}/members`, method, { email });
    if (data) {
      setMembers(data.members);
      setMessage({ ok: true, text: done });
      router.refresh();
    }
  };

  const remove = async () => {
    if (await call(base, "DELETE", { confirm })) {
      dialog.current?.close();
      router.refresh();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-white"
        aria-label={`Gestionar ${restaurant.name}`}
        title="Gestionar"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      <dialog
        ref={dialog}
        className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl bg-white p-0 text-left text-stone-700 shadow-2xl backdrop:bg-black/50 dark:bg-stone-900 dark:text-stone-300"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">{restaurant.name}</h2>
            <p className="text-xs text-stone-500">{restaurant.slug}</p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-5 py-5">
          {message && (
            <p
              role="status"
              className={`rounded-lg px-3 py-2 text-sm ${
                message.ok
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {message.text}
            </p>
          )}

          {isDemo && (
            <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm dark:bg-stone-800">
              Es el restaurante de demostración: no se puede suspender, extender ni eliminar.
            </p>
          )}

          {!isDemo && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-stone-900 dark:text-white">Estado</h3>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm">
                  {suspended
                    ? "Suspendido a mano: sitio y panel bloqueados."
                    : expired
                      ? `Bloqueado por falta de pago (venció: ${accessUntil}). Extiende el acceso para reabrirlo.`
                      : `Activo. Acceso hasta: ${accessUntil}`}
                </span>
                {suspended ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => restaurantAction({ action: "reactivate" }, "Restaurante reactivado.")}
                    className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
                  >
                    Reactivar
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => restaurantAction({ action: "suspend" }, "Restaurante suspendido.")}
                    className={`${btn} border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950`}
                  >
                    Suspender
                  </button>
                )}
              </div>
            </section>
          )}

          {!isDemo && (
            <section>
              <h3 className="mb-1 text-sm font-semibold text-stone-900 dark:text-white">Extender acceso</h3>
              <p className="mb-2 text-xs text-stone-500">
                Se suma desde la fecha de vencimiento actual (o desde hoy si ya venció). No registra un pago: si el
                restaurante te pagó por Nequi o en efectivo, usa “Registrar pago manual”.
              </p>
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  restaurantAction(
                    { action: "extend", days: Number(days), kind },
                    `Acceso extendido ${days} días (${kind === "paid" ? "pagado" : "prueba"}).`
                  );
                }}
              >
                <input
                  type="number"
                  min={1}
                  max={365}
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className={`${input} w-24`}
                  aria-label="Días"
                />
                <span className="text-sm">días de</span>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as "paid" | "trial")}
                  className={input}
                  aria-label="Tipo de acceso"
                >
                  <option value="paid">acceso pagado (cortesía)</option>
                  <option value="trial">prueba gratis</option>
                </select>
                <button type="submit" disabled={busy} className={`${btn} bg-primary-600 text-white hover:bg-primary-700`}>
                  Extender
                </button>
              </form>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-sm font-semibold text-stone-900 dark:text-white">Miembros</h3>
            <p className="mb-2 text-xs text-stone-500">
              Correos que pueden entrar al panel de este restaurante (con su cuenta de Brasaya).
            </p>
            {members === null ? (
              <p className="text-sm text-stone-500">Cargando…</p>
            ) : (
              <ul className="mb-3 divide-y divide-stone-100 rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
                {members.map((m) => (
                  <li key={m.email} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{m.email}</span>
                      {m.role === "owner" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                          <Crown className="h-3 w-3" /> Dueño
                        </span>
                      )}
                    </span>
                    {m.role !== "owner" && (
                      <span className="flex gap-1">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => memberAction("PATCH", m.email, `${m.email} ahora es el dueño.`)}
                          className={`${btn} text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800`}
                        >
                          Hacer dueño
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => memberAction("DELETE", m.email, `${m.email} ya no es miembro.`)}
                          className={`${btn} text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950`}
                        >
                          Quitar
                        </button>
                      </span>
                    )}
                  </li>
                ))}
                {members.length === 0 && <li className="px-3 py-2 text-sm text-stone-500">Sin miembros.</li>}
              </ul>
            )}
            <form
              className="flex flex-wrap gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                await memberAction("POST", newEmail, `${newEmail.trim().toLowerCase()} agregado como administrador.`);
                setNewEmail("");
              }}
            >
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className={`${input} min-w-0 flex-1`}
                aria-label="Correo del nuevo administrador"
              />
              <button type="submit" disabled={busy} className={`${btn} bg-stone-900 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200`}>
                Agregar
              </button>
            </form>
          </section>

          {!isDemo && (
            <section className="rounded-xl border border-red-200 p-4 dark:border-red-900">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                <Trash2 className="h-4 w-4" /> Eliminar restaurante
              </h3>
              <p className="mb-3 text-xs text-stone-600 dark:text-stone-400">
                Borra para siempre el menú, los pedidos, los pagos de la suscripción, los miembros y las imágenes. No se
                puede deshacer. Escribe <strong className="font-mono">{restaurant.slug}</strong> para confirmar.
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${input} min-w-0 flex-1 font-mono`}
                  aria-label="Subdominio para confirmar"
                  autoComplete="off"
                />
                <button
                  type="button"
                  disabled={busy || confirm !== restaurant.slug}
                  onClick={remove}
                  className={`${btn} bg-red-600 text-white hover:bg-red-700`}
                >
                  Eliminar para siempre
                </button>
              </div>
            </section>
          )}
        </div>
      </dialog>
    </>
  );
}
