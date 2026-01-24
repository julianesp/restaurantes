import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import AOSInit from "@/components/AOSInit";
import { CartProvider } from "@/context/CartContext";
import CartButton from "@/components/CartButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restaurante Munay - Gastronomía del Valle de Sibundoy",
  description:
    "Restaurante Munay en Valle de Sibundoy, Putumayo. Los mejores platos tradicionales con ingredientes frescos. Reservas y pedidos en línea. El único restaurante con presencia digital en el Alto Putumayo.",
  keywords:
    "restaurante sibundoy, restaurante putumayo, comida tradicional, gastronomía putumayo, munay, restaurante valle de sibundoy, delivery putumayo, pedidos en línea, reservas restaurante",
  authors: [{ name: "Restaurante Munay" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Restaurante Munay - Gastronomía del Valle de Sibundoy",
    description:
      "El primer restaurante con presencia digital en el Alto Putumayo. Descubre nuestros platos tradicionales y especialidades.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            enableColorScheme={false}
            disableTransitionOnChange
            storageKey="restaurant-theme"
            forcedTheme={undefined}
          >
            <CartProvider>
              {children}
              <CartButton />
              <AOSInit />
              <Analytics />
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
