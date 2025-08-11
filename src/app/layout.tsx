import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { getTranslations, getCurrentLanguage } from "@/config/language";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const t = getTranslations();
const lang = getCurrentLanguage();

export const metadata: Metadata = {
  title: t.siteTitle,
  description: t.siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={lang}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
