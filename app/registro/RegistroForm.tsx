"use client";

import { useEffect, useState } from "react";

type SlugState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok" }
  | { status: "taken"; reason: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

export default function RegistroForm({ suffix }: { suffix: string }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [slugState, setSlugState] = useState<SlugState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El subdominio se propone a partir del nombre mientras el usuario no lo edite
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  // Verificación de disponibilidad con retardo para no consultar en cada tecla
  useEffect(() => {
    if (slug.length < 3) {
      setSlugState({ status: "idle" });
      return;
    }
    setSlugState({ status: "checking" });
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/platform/slug-available?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSlugState(
          data.available
            ? { status: "ok" }
            : { status: "taken", reason: data.reason || "No disponible" }
        );
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSlugState({ status: "idle" });
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/platform/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, city, phone }),
      });
      const data = await res.json();
      if ((res.ok || res.status === 409) && data.url) {
        // Se redirige al subdominio del restaurante (también si ya tenía uno)
        window.location.href = data.url;
        return;
      }
      setError(data.error || "No se pudo crear el restaurante");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
          Nombre del restaurante
        </label>
        <input id="name" required minLength={2} maxLength={60} value={name}
          onChange={(e) => setName(e.target.value)} className={input} placeholder="Ej: La Cocina de Ana" />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
          Dirección de tu sitio
        </label>
        <div className="flex items-stretch">
          <input id="slug" required value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            className={`${input} rounded-r-none`} placeholder="la-cocina-de-ana" />
          <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 text-sm text-gray-600 dark:text-gray-300">
            {suffix}
          </span>
        </div>
        <p className="mt-1 text-sm min-h-5" aria-live="polite">
          {slugState.status === "checking" && <span className="text-gray-500">Verificando…</span>}
          {slugState.status === "ok" && <span className="text-green-600">Disponible</span>}
          {slugState.status === "taken" && <span className="text-red-600">{slugState.reason}</span>}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Ciudad</label>
          <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Teléfono</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting || slugState.status === "taken" || slugState.status === "checking"}
        className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 transition-colors">
        {submitting ? "Creando…" : "Crear mi restaurante"}
      </button>
    </form>
  );
}
