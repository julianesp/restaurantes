import { Download } from "lucide-react";

/** Descarga en CSV (para Excel) desde /api/platform/manage/export. */
export default function ExportButton({ tipo }: { tipo: "restaurantes" | "cobros" }) {
  return (
    <a
      href={`/api/platform/manage/export?tipo=${tipo}`}
      className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
    >
      <Download className="h-4 w-4" /> Exportar a Excel (CSV)
    </a>
  );
}
