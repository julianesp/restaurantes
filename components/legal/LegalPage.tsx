import Link from "next/link";
import BrasayaLogo from "@/components/BrasayaLogo";
import { LEGAL, LEGAL_WHATSAPP_URL } from "@/lib/legal";

/** Marco común de /terminos y /privacidad. */
export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 px-4 py-10">
      <article className="mx-auto max-w-3xl rounded-2xl bg-white dark:bg-stone-900 p-6 sm:p-10 shadow-sm text-stone-700 dark:text-stone-300 leading-relaxed">
        <Link href="/" className="mb-8 inline-flex" aria-label="Brasaya, ir al inicio">
          <BrasayaLogo size={32} />
        </Link>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-stone-500">Última actualización: {LEGAL.updatedLabel}</p>
        <div className="legal-body mt-8 space-y-4 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-stone-900 dark:[&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_a]:text-primary-700 dark:[&_a]:text-primary-300 [&_a]:underline">
          {children}
        </div>
        <nav className="mt-12 flex flex-wrap gap-4 border-t border-stone-200 dark:border-stone-800 pt-6 text-sm">
          <Link href="/terminos" className="underline">Términos y condiciones</Link>
          <Link href="/privacidad" className="underline">Política de tratamiento de datos</Link>
          <a href={LEGAL_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline">Contacto</a>
        </nav>
      </article>
    </main>
  );
}

/** Datos de identificación de Brasaya que estén completos en lib/legal.ts. */
export function LegalIdentity() {
  const rows = [
    ["Titular", LEGAL.legalName ? `${LEGAL.legalName} (marca ${LEGAL.brand})` : LEGAL.brand],
    ["NIT / Cédula", LEGAL.taxId],
    ["Dirección", LEGAL.address],
    ["Correo", LEGAL.email],
    ["WhatsApp", LEGAL.whatsappLabel],
    ["Sitio web", "https://brasaya.com"],
  ].filter(([, v]) => v);
  return (
    <ul>
      {rows.map(([k, v]) => (
        <li key={k}>
          <strong>{k}:</strong> {v}
        </li>
      ))}
    </ul>
  );
}
