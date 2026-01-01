"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface CryptoPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Daftar koin yang mau ditampilkan
  const coins = [
    { id: "bitcoin", symbol: "BTC" },
    { id: "ethereum", symbol: "ETH" },
    { id: "solana", symbol: "SOL" },
    { id: "binancecoin", symbol: "BNB" },
    { id: "ripple", symbol: "XRP" },
    { id: "cardano", symbol: "ADA" },
    { id: "dogecoin", symbol: "DOGE" },
  ];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Menggunakan API CoinGecko (Gratis & Public)
        const ids = coins.map(c => c.id).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setPrices(data);
        }
      } catch (error) {
        console.error("Gagal mengambil harga:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    
    // Auto refresh setiap 60 detik
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null; // Jangan tampilkan apa-apa saat loading awal agar tidak layout shift kasar

  // Duplikasi data untuk efek looping marquee yang mulus (infinite scroll)
  const marqueeData = [...prices, ...prices, ...prices]; 

  return (
    <div className="w-full bg-[#050505] border-b border-white/5 h-10 flex items-center overflow-hidden relative z-50">
      
      {/* Label Statis (Opsional) */}
      <div className="absolute left-0 top-0 bottom-0 bg-[#050505] px-3 z-10 flex items-center border-r border-white/10 shadow-[5px_0_15px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 text-red-500 text-xs font-bold tracking-widest animate-pulse">
          <Activity size={14} />
          LIVE
        </div>
      </div>

      {/* Marquee Container */}
      <div className="flex items-center animate-marquee whitespace-nowrap pl-20">
        {marqueeData.map((coin, index) => (
          <div key={`${coin.id}-${index}`} className="flex items-center gap-2 px-6 border-r border-white/5 text-xs font-mono">
            <span className="font-bold text-slate-300">{coin.symbol.toUpperCase()}</span>
            <span className="text-white">${coin.current_price.toLocaleString()}</span>
            <span className={`flex items-center gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Style untuk animasi CSS murni */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Geser setengah karena data diduplikasi */
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused; /* Pause saat di-hover user */
        }
      `}</style>
    </div>
  );
}