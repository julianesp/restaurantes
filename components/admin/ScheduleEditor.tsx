"use client";

import { useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import TimeWheel from "@/components/admin/TimeWheel";
import { DAYS, formatRange, type DayKey, type Schedule } from "@/lib/hours";

/** Horario de la semana: cada día abierto o cerrado, con sus horas elegidas en ruedas. */
export default function ScheduleEditor({ value, onChange }: { value: Schedule; onChange: (s: Schedule) => void }) {
  const [editing, setEditing] = useState<DayKey | null>(null);

  const update = (day: DayKey, patch: Partial<Schedule[DayKey]>) => onChange({ ...value, [day]: { ...value[day], ...patch } });
  const copyToAll = (day: DayKey) => {
    const { from, to } = value[day];
    onChange(Object.fromEntries(DAYS.map((d) => [d.key, value[d.key].open ? { ...value[d.key], from, to } : value[d.key]])) as Schedule);
  };

  return (
    <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
      {DAYS.map((day) => {
        const d = value[day.key];
        const open = editing === day.key && d.open;
        return (
          <li key={day.key} className="px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-medium text-gray-900 dark:text-white">{day.long}</span>
              <button
                type="button"
                role="switch"
                aria-checked={d.open}
                aria-label={`${day.long}: ${d.open ? "abierto" : "cerrado"}`}
                onClick={() => {
                  update(day.key, { open: !d.open });
                  if (d.open && editing === day.key) setEditing(null);
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${d.open ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#fafaf9] shadow transition-transform duration-200 ease-out ${d.open ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              {d.open ? (
                <button
                  type="button"
                  onClick={() => setEditing(open ? null : day.key)}
                  aria-expanded={open}
                  className="ml-auto inline-flex min-w-0 items-center gap-1 rounded-lg px-2 py-1 text-sm tabular-nums text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="truncate">{formatRange(d)}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <span className="ml-auto text-sm text-gray-500">Cerrado</span>
              )}
            </div>

            {open && (
              <div className="mt-3 space-y-3 pb-1">
                <div className="flex flex-wrap items-start justify-center gap-4 sm:justify-start">
                  <TimeWheel label="Abre" value={d.from} onChange={(from) => update(day.key, { from })} />
                  <TimeWheel label="Cierra" value={d.to} onChange={(to) => update(day.key, { to })} />
                </div>
                {d.to <= d.from && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">La hora de cierre es antes que la de apertura: se entiende que cierra al día siguiente.</p>
                )}
                <button
                  type="button"
                  onClick={() => copyToAll(day.key)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                >
                  <Copy className="h-4 w-4" /> Usar este horario en todos los días abiertos
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
