import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PriceTicker from "../components/PriceTicker"; 
import GlobalSearch from "../components/GlobalSearch";

const inter = Inter({ subsets: ["latin"] });

// --- KONFIGURASI SEO GLOBAL & ICON ---
export const metadata: Metadata = {
  // Ganti URL ini dengan domain asli Anda saat sudah deploy
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  
  title: {
    default: "Crypto Slayer - Market Intelligence",
    template: "%s | Crypto Slayer",
  },
  description: "Platform analisis teknikal dan berita pasar tanpa sensor, langsung dari meja trading.",
  
  // --- BAGIAN INI UNTUK LOGO DI SAMPING JUDUL (FAVICON) ---
  icons: {
    icon: '/crypto-slayerjpeg',      // Logo di Tab Browser (Desktop)
    shortcut: '/crypto-slayer.jpeg',  // Logo Shortcut
    apple: '/crypto-slayer.jpeg',     // Logo untuk Home Screen iPhone/iPad
  },

  openGraph: {
    title: "Crypto Slayer",
    description: "Market Intelligence & Technicals",
    url: '/',
    siteName: 'Crypto Slayer',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/crypto-slayer.jpeg', // Gambar default saat share link home
        width: 1200,
        height: 630,
        alt: 'Crypto Slayer Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Slayer',
    description: 'Market Intelligence & Technicals',
    images: ['/crypto-slayer.jpeg'],
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

        {/* Tombol Search Global */}
        <GlobalSearch />
        
        {children}
      </body>
    </html>
  );
}