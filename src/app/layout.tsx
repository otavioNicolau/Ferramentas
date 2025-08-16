import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { getRequestLang, getDictionary } from "@/i18n/server";
import { I18nProvider } from "@/i18n/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const adsenseAccount = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT;

// Metadata será gerada dinamicamente no generateMetadata
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const dict = await getDictionary(lang);
  
  return {
    title: dict['app.title'] || 'Ferramentas Úteis',
    description: dict['app.description'] || 'Ferramentas online gratuitas para PDF, conversores e muito mais',
    other: adsenseAccount
      ? { "google-adsense-account": adsenseAccount }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getRequestLang();
  const dict = await getDictionary(lang);
  
  return (
    <html lang={lang}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider lang={lang} dict={dict}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
