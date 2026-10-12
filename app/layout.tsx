import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import AOSInit from "@/components/AOSInit";
import { CartProvider } from "@/context/CartContext";
import CartButton from "@/components/CartButton";
import { FloatingThemeToggle } from "@/components/ThemeToggle";
import ThemeScheduler from "@/components/ThemeScheduler";
import { colombiaPeriod, themeStorageKey } from "@/lib/theme-schedule";
import { getTenant } from "@/lib/tenant";
import { brandingFor, themeCss } from "@/lib/branding";
import { TenantProvider } from "@/context/TenantContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Títulos: sans geométrica, cálida y legible (cuerpo en Geist)
const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Íconos de la plataforma Brasaya (pestaña, iOS, Android). Ver public/brand/.
const icons: Metadata["icons"] = {
  icon: [
    { url: "/brand/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon.ico", sizes: "48x48" },
  ],
  apple: "/brand/apple-touch-icon.png",
};

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();

  // Dominio raíz: metadatos de la plataforma (la landing define su propio título)
  if (!tenant) {
    return {
      title: "Brasaya: tu restaurante en línea",
      description: "Menú digital, pedidos por QR y gestión para restaurantes.",
      icons,
      manifest: "/manifest.json",
    };
  }

  const tagline = typeof tenant.settings?.tagline === "string" ? tenant.settings.tagline : "";
  const city = typeof tenant.settings?.city === "string" ? tenant.settings.city : "";
  const description =
    tagline || `Menú, pedidos y reservas en línea de ${tenant.name}${city ? ` en ${city}` : ""}.`;
  return {
    title: city ? `${tenant.name} - ${city}` : tenant.name,
    description,
    openGraph: { title: tenant.name, description, type: "website", locale: "es_CO" },
    icons,
    manifest: "/manifest.json",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await getTenant();
  // En el dominio raíz (sin restaurante) se usa una marca neutra de la plataforma
  const branding = tenant
    ? brandingFor(tenant)
    : { ...brandingFor({ id: "", slug: "", name: "Brasaya", status: "active", plan: "platform", trial_ends_at: null, owner_email: "", custom_domain: null, settings: {} }) };
  const theme = themeCss(branding.primaryColor);
  // Tema por la hora de Colombia: claro 7:00-18:00, oscuro el resto (ver lib/theme-schedule.ts)
  const period = colombiaPeriod();

  return (
    <ClerkProvider localization={esES}>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased bg-[rgb(var(--background))] text-gray-900 dark:text-gray-100`}
        >
          {/* Tema del restaurante. Va en el body (no en un <head> propio): vinext inyecta scripts en el
              <head> y declararlo aquí provoca un error de hidratación. */}
          {theme && <style dangerouslySetInnerHTML={{ __html: theme }} />}
          <ThemeProvider
            attribute="class"
            defaultTheme={period.theme}
            enableSystem={false}
            enableColorScheme={false}
            disableTransitionOnChange
            storageKey={themeStorageKey(period)}
            forcedTheme={undefined}
          >
            <TenantProvider branding={branding}>
              <CartProvider>
                {children}
                <CartButton />
                <FloatingThemeToggle />
                <ThemeScheduler periodId={period.id} />
                <AOSInit />
                <Analytics />
              </CartProvider>
            </TenantProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
