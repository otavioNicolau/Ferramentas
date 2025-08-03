import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UtilidadeWeb - Ferramentas Online Gratuitas",
  description: "Conjunto de ferramentas online gratuitas para resolver tarefas do dia a dia. Conversores, editores PDF, geradores e muito mais.",
  keywords: "ferramentas online, conversor PDF, gerador QR code, download YouTube, utilidades web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
