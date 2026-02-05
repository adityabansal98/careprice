import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarePrice - Healthcare Price Comparison",
  description:
    "Compare knee surgery costs across hospitals. Find the best prices for knee replacements, arthroscopy, ACL repairs, meniscus surgery and more based on your insurance.",
  keywords: ["knee surgery cost", "knee replacement price", "ACL surgery cost", "arthroscopy price", "meniscus surgery cost", "orthopedic surgery prices"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {children}
      </body>
    </html>
  );
}

