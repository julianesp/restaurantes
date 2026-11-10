"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, UserCheck, UserX, KeyRound, RefreshCw, ChefHat, UtensilsCrossed, Copy, Mail } from "lucide-react";
import Swal from "sweetalert2";
import { isValidPin, PIN_MAX_LENGTH, PIN_MIN_LENGTH, PIN_RULE_TEXT } from "@/lib/waiter-pin";

// Equipo: meseros y chefs. Cada persona entra con su PROPIO correo (el dueño no comparte el suyo) y
// ve solo lo suyo; los meseros pueden tener además un PIN para una tableta compartida.

interface Person {
  email: string;
  name: string;
  role: "waiter" | "chef";
  active: boolean;
  account: boolean;
  pin: boolean;
}

const emptyForm = { name: "", email: "", role: "waiter" as Person["role"], pin: "" };
const color = "rgb(var(--primary-500))";
const input =
  "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none";

const post = (method: string, body: object) =>
  fetch("/api/team", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function EquipoAdminPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) setPeople(await res.json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const fail = (text: string) => Swal.fire({ icon: "error", title: "Error", text, confirmButtonColor: color });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin && !isValidPin(form.pin)) {
      Swal.fire({ icon: "warning", title: "PIN muy corto", text: `${PIN_RULE_TEXT}.`, confirmButtonColor: color });
      return;
    }
    setSaving(true);
    try {
      const res = await post("POST", { ...form, pin: form.role === "waiter" ? form.pin : "" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
      setForm(emptyForm);
      setShowForm(false);
      Swal.fire({
        icon: "success",
        title: "Agregado al equipo",
        text: `${form.name} ya puede entrar con ${form.email}.`,
        confirmButtonColor: color,
      });
    } catch (err) {
      fail(err instanceof Error ? err.message : "No se pudo agregar");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Person) => {
    const res = await post("PATCH", { email: p.email, active: !p.active });
    if (!res.ok) return fail((await res.json().catch(() => ({}))).error || "No se pudo cambiar el estado");
    await load();
  };

  const changePin = async (p: Person) => {
    const { value: newPin } = await Swal.fire({
      title: p.pin ? `Cambiar PIN de ${p.name}` : `PIN para ${p.name}`,
      text: "Sirve para entrar en una tableta compartida sin usar su correo.",
      input: "text",
      inputLabel: `PIN (${PIN_MIN_LENGTH}-${PIN_MAX_LENGTH} dígitos)`,
      inputAttributes: { maxlength: String(PIN_MAX_LENGTH), pattern: "[0-9]*", inputmode: "numeric" },
      showCancelButton: true,
      confirmButtonColor: color,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Guardar",
      inputValidator: (v) => (isValidPin(v) ? null : PIN_RULE_TEXT),
    });
    if (!newPin) return;
    const res = await post("PATCH", { email: p.email, pin: newPin });
    if (!res.ok) return fail((await res.json().catch(() => ({}))).error || "No se pudo guardar el PIN");
    Swal.fire({ icon: "success", title: "PIN guardado", timer: 1500, showConfirmButton: false });
    await load();
  };

  const remove = async (p: Person) => {
    const result = await Swal.fire({
      title: "¿Quitar del equipo?",
      html: `<strong>${p.name.replace(/</g, "&lt;")}</strong> ya no podrá entrar${p.pin ? " (ni con su correo ni con su PIN)" : ""}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: color,
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    await fetch(`/api/team?email=${encodeURIComponent(p.email)}`, { method: "DELETE" });
    await load();
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => Swal.fire({ icon: "success", title: "Enlace copiado", timer: 1200, showConfirmButton: false }),
      () => {}
    );
  };

  const links = [
    { label: "Meseros", path: "/mesero", Icon: UtensilsCrossed },
    { label: "Cocina", path: "/cocina", Icon: ChefHat },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipo</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {people.filter((p) => p.active).length} activos · {people.length} en total
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} aria-label="Actualizar" className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-500 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              <Plus className="w-5 h-5" />
              Agregar persona
            </button>
          </div>
        </div>

        {/* Cómo entran */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 mb-6 text-sm text-primary-900 dark:text-primary-200">
          <p className="font-semibold mb-1 flex items-center gap-2"><Mail className="w-4 h-4" />Cada quien entra con su propio correo</p>
          <p className="mb-3">
            Agrega el correo de tu mesero o chef y pídele que inicie sesión con ese mismo correo (con Google o con el código que le llega).
            Nunca compartas tu correo ni tu contraseña: verán solo su parte, sin acceso a ventas, menú ni configuración.
          </p>
          <div className="flex flex-wrap gap-2">
            {links.map(({ label, path, Icon }) => (
              <button key={path} onClick={() => copy(origin + path)} className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-800 px-3 py-1.5 text-xs font-medium hover:bg-primary-100 dark:hover:bg-gray-700">
                <Icon className="w-3.5 h-3.5" />
                {label}: <span className="font-mono">{origin.replace(/^https?:\/\//, "")}{path}</span>
                <Copy className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Agregar al equipo</h2>

            <fieldset className="mb-4">
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol</legend>
              <div className="flex gap-3">
                {([["waiter", "Mesero", UtensilsCrossed, "Toma pedidos de las mesas"], ["chef", "Chef", ChefHat, "Ve y avanza los pedidos"]] as const).map(([value, label, Icon, hint]) => (
                  <label key={value} className={`flex-1 cursor-pointer rounded-xl border-2 p-3 transition-colors ${form.role === value ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-600"}`}>
                    <input type="radio" name="role" value={value} checked={form.role === value} onChange={() => setForm({ ...form, role: value, pin: "" })} className="sr-only" />
                    <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><Icon className="w-4 h-4" />{label}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                <input id="team-name" required minLength={2} maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} placeholder="Ej: Carlos López" />
              </div>
              <div>
                <label htmlFor="team-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo *</label>
                <input id="team-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} placeholder="carlos@correo.com" />
              </div>
            </div>

            {form.role === "waiter" && (
              <div className="mb-4">
                <label htmlFor="team-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PIN <span className="font-normal text-gray-500">(opcional · {PIN_MIN_LENGTH}-{PIN_MAX_LENGTH} dígitos)</span>
                </label>
                <input id="team-pin" value={form.pin} maxLength={PIN_MAX_LENGTH} inputMode="numeric" onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} className={`${input} tracking-widest font-mono sm:max-w-xs`} placeholder="123456" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Para una tableta compartida en el local. Con su correo entra sin PIN.</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors disabled:opacity-60">
                {saving ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto" />
          </div>
        ) : people.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">Todavía no hay nadie en tu equipo.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Agrega a tus meseros y a tu chef con su correo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {people.map((p) => (
              <div key={p.email} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0 ${p.active ? "bg-primary-500" : "bg-gray-400"}`}>
                  {p.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{p.email}</p>
                  <p className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-medium">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-200">{p.role === "chef" ? "Chef" : "Mesero"}</span>
                    {p.account && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Entra con su correo</span>}
                    {p.pin && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Tiene PIN</span>}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${p.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                  {p.active ? "Activo" : "Inactivo"}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(p)} title={p.active ? "Desactivar" : "Activar"} aria-label={p.active ? "Desactivar" : "Activar"} className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {p.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  {p.role === "waiter" && (
                    <button onClick={() => changePin(p)} title={p.pin ? "Cambiar PIN" : "Poner un PIN"} aria-label={p.pin ? "Cambiar PIN" : "Poner un PIN"} className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <KeyRound className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => remove(p)} title="Quitar del equipo" aria-label="Quitar del equipo" className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
