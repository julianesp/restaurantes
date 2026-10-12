import RegistroForm from "./RegistroForm";
import { ROOT_DOMAIN } from "@/lib/tenant-host";
import Link from "next/link";
import BrasayaLogo from "@/components/BrasayaLogo";

export const metadata = { title: "Crea tu restaurante en Brasaya" };

export default function RegistroPage() {
  // Se muestra en el campo de subdominio, p. ej. ".tusaas.com"
  const suffix = ROOT_DOMAIN ? `.${ROOT_DOMAIN}` : ".localhost:3000";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <Link href="/" className="mb-6 inline-flex" aria-label="Brasaya, ir al inicio">
          <BrasayaLogo size={32} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Crea tu restaurante en Brasaya</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          14 días de prueba gratis. Sin tarjeta de crédito.
        </p>
        <RegistroForm suffix={suffix} />
      </div>
    </main>
  );
}
