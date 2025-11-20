import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";

import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Furni. - Tienda de Muebles Modernos",
  description: "Muebles atemporales, entregados en tu puerta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional"
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${poppins.variable} antialiased bg-background-light dark:bg-background-dark font-body text-charcoal dark:text-off-white`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}