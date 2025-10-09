import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saboreos Pizza - Pizzas Artesanales del Putumayo",
  description:
    "Las mejores pizzas artesanales de Saboreos Pizza. Ingredientes frescos, masa casera y el auténtico sabor del Putumayo. Pedidos por WhatsApp.",
  keywords:
    "pizzas, artesanales, Putumayo, Saboreos, comida italiana, delivery",
  authors: [{ name: "Saboreos Pizza" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Saboreos Pizza - Pizzas Artesanales del Putumayo",
    description:
      "Las mejores pizzas artesanales con ingredientes frescos y masa casera",
    type: "website",
    images: [
      {
        url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/logo_saboreos.png",
        width: 512,
        height: 512,
        alt: "Saboreos Pizza Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
