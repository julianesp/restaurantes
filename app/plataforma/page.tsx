import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  QrCode,
  ChefHat,
  Bike,
  CreditCard,
  Ticket,
  BarChart3,
  Globe,
  UserPlus,
  Upload,
  Share2,
  Check,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import GuidedTour from "@/components/platform/GuidedTour";
import FeatureTabs from "@/components/platform/FeatureTabs";
import EmberEdge from "@/components/EmberEdge";
import PlatformHeader from "@/components/platform/PlatformHeader";
import FoodSlider from "@/components/FoodSlider";
import BrasayaLogo from "@/components/BrasayaLogo";
import { tenantUrl } from "@/lib/tenant-host";
import { MONTHLY_PRICE_LABEL } from "@/lib/billing";

export const metadata = {
  title: "Brasaya: tu restaurante, encendido en línea",
  description:
    "Menú digital, pedidos por QR, cocina conectada, domicilios, tiqueteras y estadísticas para restaurantes de toda Colombia. Prueba gratis 14 días.",
};

// Fotos de ejemplo (las mismas del restaurante de prueba)
const PHOTO = (n: number) => `https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/${n}.jpg`;

// Láminas de la presentación: beneficios de tener cuenta en Brasaya
const benefits = [
  { id: 1, image: PHOTO(1), name: "Tu carta, siempre al día", price: "Menú digital",
    description: "Cambia platos y precios desde el celular y tus clientes lo ven al instante." },
  { id: 2, image: PHOTO(2), name: "Pedidos sin filas", price: "Pedidos por QR",
    description: "Tus clientes piden desde la mesa y la cocina recibe el pedido enseguida." },
  { id: 3, image: PHOTO(3), name: "Domicilios que llegan completos", price: "Domicilios",
    description: "El cliente arma su pedido en tu sitio y te llega listo por WhatsApp." },
  { id: 4, image: PHOTO(4), name: "Clientes que vuelven", price: "Tiqueteras",
    description: "Vende paquetes de almuerzos por adelantado y lleva el saldo de cada cliente." },
  { id: 5, image: PHOTO(5), name: "Sabes cuánto vendes", price: "Estadísticas",
    description: "Ventas del día, la semana y el mes, y tu plato estrella, sin hojas de cálculo." },
];

const PRICE = MONTHLY_PRICE_LABEL;

// Contacto comercial de Brasaya (mismo WhatsApp del restaurante principal; cambiarlo aquí si hace falta)
const WHATSAPP = "573174503604";
const WHATSAPP_LABEL = "+57 317 450 3604";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola, quiero saber más sobre Brasaya para mi restaurante.")}`;

const included = [
  "Sitio web propio con tu logo y tu color",
  "Menú digital ilimitado",
  "Pedidos por QR en todas tus mesas",
  "Panel de cocina y meseros",
  "Domicilios por WhatsApp",
  "Pagos en línea con ePayco",
  "Tiqueteras y fidelización",
  "Estadísticas de ventas",
];

const services = [
  { icon: QrCode, title: "Pedidos por QR", text: "Cada mesa tiene su código: el cliente pide y paga desde el celular." },
  { icon: ChefHat, title: "Cocina y meseros conectados", text: "Los pedidos llegan al panel de cocina y a Telegram, con chat entre el equipo." },
  { icon: Bike, title: "Domicilios por WhatsApp", text: "Tus clientes arman el pedido en tu sitio y te llega listo por WhatsApp." },
  { icon: CreditCard, title: "Pagos en línea", text: "Cobra con ePayco y entrega la factura al instante." },
  { icon: Ticket, title: "Tiqueteras", text: "Vende paquetes de almuerzos y lleva el saldo de cada cliente." },
  { icon: BarChart3, title: "Estadísticas", text: "Ventas por día, semana y mes, y el plato estrella de cada semana." },
];

const start = [
  { icon: UserPlus, title: "Crea tu cuenta", text: "Elige el nombre y la dirección de tu restaurante. Tarda dos minutos." },
  { icon: Upload, title: "Sube tu carta", text: "Platos, fotos y precios desde el celular o el computador." },
  { icon: Share2, title: "Comparte tu enlace", text: "Pon los QR en las mesas y el enlace en tus redes. Listo para vender." },
];

export default function PlataformaPage() {
  return (
    // isolate: el humo del borde final (z-index -1) queda sobre este fondo y detrás del contenido
    <div data-platform-landing className="isolate min-h-[100dvh] bg-[rgb(var(--background))]">
      {/* Cabecera fija y transparente */}
      <PlatformHeader />

      <main>
        {/* Presentación: beneficios de Brasaya */}
        <section data-nav-dark className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden">
          <FoodSlider foods={benefits} autoplayInterval={5000} />
          <div className="absolute inset-x-0 bottom-20 z-30 flex justify-center px-4 md:bottom-16 md:justify-start md:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/registro"
                className="btn-press group inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/30 hover:bg-primary-700"
              >
                Probar 14 días gratis
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#recorrido"
                className="btn-press inline-flex items-center rounded-full bg-white/90 px-6 py-3.5 font-semibold text-stone-900 shadow-lg shadow-black/20 backdrop-blur hover:bg-white/95"
              >
                Ver el recorrido
              </a>
            </div>
          </div>
        </section>

        {/* Presentación de la plataforma */}
        <section className="px-4 py-20 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-[1.05] text-gray-950 dark:text-white md:text-5xl lg:text-6xl">
              Tu restaurante, <span className="text-primary-600 dark:text-primary-400">encendido</span> en línea
            </h1>
            <p className="max-w-[56ch] text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Brasaya reúne la carta, los pedidos, la cocina y las ventas de tu restaurante en un solo lugar. Sin instalar
              nada y por {PRICE} al mes.
            </p>
          </div>
        </section>

        {/* Servicios: mosaico */}
        <section id="servicios" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="mb-3 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
                Todo lo que tu restaurante necesita
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Una sola plataforma para la carta, los pedidos, la cocina y las ventas.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-4">
              {/* Celda grande: menú digital, con foto */}
              <article className="relative overflow-hidden rounded-3xl bg-gray-900 sm:col-span-2 lg:row-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTO(1)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="relative flex h-full min-h-[280px] flex-col justify-end p-7 text-white">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <h3 className="mb-2 text-2xl font-bold">Menú digital</h3>
                  <p className="max-w-sm text-white/80">
                    Tu carta con fotos, precios y especiales del día. La actualizas desde el celular y se ve al instante.
                  </p>
                </div>
              </article>

              {services.map((s) => (
                <article
                  key={s.title}
                  className="flex flex-col justify-between gap-6 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="mb-1.5 font-semibold text-gray-950 dark:text-white">{s.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{s.text}</p>
                  </div>
                </article>
              ))}

              {/* Celda ancha con el color de marca: sitio propio */}
              <article className="flex flex-col justify-between gap-6 rounded-3xl bg-primary-600 p-7 text-white sm:col-span-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="mb-1.5 text-xl font-semibold">Tu propio sitio web</h3>
                  <p className="max-w-md text-white/85">
                    Tu restaurante en <span className="font-semibold">turestaurante.brasaya.com</span>, con tu logo, tu color y tus redes.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Recorrido guiado con gráficos */}
        <GuidedTour />

        {/* Más características, por rol */}
        <FeatureTabs />

        {/* Cómo empezar */}
        <section id="empezar" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">Empieza hoy mismo</h2>
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              {/* Línea que une las tres acciones (escritorio) */}
              <span aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-gray-200 dark:bg-gray-800 md:block" />
              {start.map((s) => (
                <li key={s.title} className="relative">
                  <span className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white ring-8 ring-[rgb(var(--background))]">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mb-1.5 text-lg font-semibold text-gray-950 dark:text-white">{s.title}</h3>
                  <p className="max-w-xs text-gray-600 dark:text-gray-400">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        {/* Precio */}
        <section id="precio" className="scroll-mt-24 px-4 pb-24 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[32px] border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900 sm:p-10 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="mb-3 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">Un solo plan, todo incluido</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">Sin costos de instalación ni contratos de permanencia.</p>
              <p className="mb-1 flex items-baseline gap-2">
                <span className="text-5xl font-bold tabular-nums text-gray-950 dark:text-white">{PRICE}</span>
                <span className="text-gray-600 dark:text-gray-400">COP al mes</span>
              </p>
              <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">Los primeros 14 días son gratis, sin tarjeta de crédito.</p>
              <Link
                href="/registro"
                className="btn-press group inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 font-semibold text-white hover:bg-primary-700"
              >
                Probar 14 días gratis
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-800 dark:text-gray-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Cierre con el carbón encendido */}
      <footer data-nav-dark className="relative mt-10 bg-primary-700 text-white dark:bg-primary-900">
        <EmberEdge />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-xl">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl">Enciende tu restaurante en línea</h2>
              <p className="text-lg text-white/80">14 días gratis, sin tarjeta de crédito. Después, {PRICE} al mes.</p>
            </div>
            <Link
              href="/registro"
              className="btn-press inline-flex shrink-0 items-center gap-2 rounded-full bg-[#fafaf9] px-7 py-3.5 font-semibold text-[rgb(var(--primary-800))] hover:bg-white"
            >
              Probar 14 días gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Datos y enlaces */}
          <div className="grid gap-10 border-t border-white/15 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <Link href="/" aria-label="Brasaya, inicio" className="group mb-4 inline-flex [&_.font-display]:!text-white [&_.font-display_span]:!text-[#FFD166]">
                <BrasayaLogo size={34} />
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-white/75">
                La plataforma para restaurantes de toda Colombia: carta, pedidos, cocina y ventas en un solo lugar.
              </p>
            </div>

            <nav aria-label="Producto">
              <h3 className="mb-4 text-sm font-semibold text-white">Producto</h3>
              <ul className="space-y-2.5 text-sm text-white/75">
                <li><a href="#servicios" className="hover:text-white">Servicios</a></li>
                <li><a href="#recorrido" className="hover:text-white">Recorrido guiado</a></li>
                <li><a href="#caracteristicas" className="hover:text-white">Características</a></li>
                <li><a href="#precio" className="hover:text-white">Precio</a></li>
              </ul>
            </nav>

            <nav aria-label="Para restaurantes">
              <h3 className="mb-4 text-sm font-semibold text-white">Para restaurantes</h3>
              <ul className="space-y-2.5 text-sm text-white/75">
                <li><Link href="/registro" className="hover:text-white">Crear mi restaurante</Link></li>
                <li><Link href="/sign-in" className="hover:text-white">Iniciar sesión</Link></li>
                <li><a href={tenantUrl("restaurante")} className="hover:text-white">Ver un restaurante de ejemplo</a></li>
              </ul>
            </nav>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Contacto</h3>
              <ul className="space-y-3 text-sm text-white/75">
                <li>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    WhatsApp {WHATSAPP_LABEL}
                  </a>
                </li>
                <li className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Pagos seguros con ePayco
                </li>
                <li>Soporte en español</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/15 pt-6 text-sm text-white/60 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} Brasaya. Hecho en Colombia.</span>
            <span>brasaya.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
