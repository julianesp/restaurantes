import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tu Restaurante - Gastronomía de Calidad",
  description:
    "Los mejores platos con ingredientes frescos y recetas tradicionales. Experiencia gastronómica única. Pedidos por WhatsApp.",
  keywords: "restaurante, gastronomía, comida, platos, delivery, calidad",
  authors: [{ name: "Tu Restaurante" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Tu Restaurante - Gastronomía de Calidad",
    description:
      "Los mejores platos con ingredientes frescos y recetas tradicionales",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
