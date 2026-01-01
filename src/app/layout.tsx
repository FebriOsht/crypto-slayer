import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PriceTicker from "../components/PriceTicker"; 
import GlobalSearch from "../components/GlobalSearch"; // 1. Import GlobalSearch

const inter = Inter({ subsets: ["latin"] });

// --- KONFIGURASI SEO GLOBAL ---
export const metadata: Metadata = {
  // Ganti URL ini dengan domain asli Anda saat sudah deploy (misal: https://cryptoslayer.com)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  
  title: {
    default: "Crypto Slayer - Market Intelligence",
    template: "%s | Crypto Slayer", // Hasilnya nanti: "Analisis BTC | Crypto Slayer"
  },
  description: "Platform analisis teknikal dan berita pasar tanpa sensor, langsung dari meja trading.",
  
  openGraph: {
    title: "Crypto Slayer",
    description: "Market Intelligence & Technicals",
    url: '/',
    siteName: 'Crypto Slayer',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Slayer',
    description: 'Market Intelligence & Technicals',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Ticker di Paling Atas */}
        <PriceTicker />

        {/* 2. Pasang Tombol Search Global */}
        <GlobalSearch />
        
        {children}
      </body>
    </html>
  );
}