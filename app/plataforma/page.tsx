import Link from "next/link";
import ResFoodLogo from "@/components/ResFoodLogo";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "ResFood: gestiona tu restaurante en línea",
  description:
    "Menú digital, pedidos por QR, meseros, cocina y tiqueteras en un solo lugar. Prueba gratis 14 días.",
};

const features = [
  { title: "Menú digital", text: "Publica tu carta y cámbiala en segundos desde el celular." },
  { title: "Pedidos por QR", text: "Cada mesa tiene su código: el cliente pide y la cocina lo recibe." },
  { title: "Meseros y cocina", text: "Panel para meseros con PIN y chat directo con la cocina." },
  { title: "Tiqueteras y fidelización", text: "Vende paquetes de comidas y lleva el saldo de cada cliente." },
  { title: "Estadísticas", text: "Descubre qué platos se venden más y cuándo." },
  { title: "Tu propio sitio", text: "Tu restaurante en su propio subdominio, listo para compartir." },
];

export default function PlataformaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <header className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <ResFoodLogo size={34} />
        <nav className="flex items-center gap-4 text-sm font-medium">
          <ThemeToggle />
          <Link href="/sign-in" className="text-gray-700 dark:text-gray-200 hover:text-primary-600">Iniciar sesión</Link>
          <Link href="/registro" className="rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 transition-colors">
            Empezar gratis
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        <section className="py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-5 text-balance">
            Todo lo que tu restaurante necesita, en un solo lugar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 text-pretty">
            Menú digital, pedidos desde la mesa, panel de cocina y estadísticas.
            Sin instalar nada y con 14 días de prueba gratis.
          </p>
          <Link href="/registro"
            className="inline-block rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 shadow-lg transition-colors">
            Crear mi restaurante
          </Link>
        </section>

        <section className="pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <article key={f.title}
              className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow border border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-1">{f.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{f.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
