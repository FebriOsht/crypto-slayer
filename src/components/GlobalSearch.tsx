"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // --- LOGIKA ANIMASI TYPEWRITER (BERGANTI-GANTI) ---
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    // Jika modal tertutup atau user sudah mengetik sesuatu, hentikan animasi & kosongkan
    if (!isOpen || query) {
      setPlaceholder(query ? "" : ""); 
      return;
    }

    // Daftar kalimat yang akan muncul bergantian
    const phrases = [
      "Ketik koin, berita, atau kata kunci...",
      "Cari analisis BTC, ETH, & Altcoins...",
      "Pantau update market terbaru..."
    ];

    let phraseIndex = 0; // Melacak kalimat ke-berapa
    let charIndex = 0;   // Melacak huruf ke-berapa
    let isPaused = false;
    let pauseCounter = 0;
    
    const typingSpeed = 50; // Kecepatan mengetik
    const pauseDuration = 30; // Lama jeda sebelum ganti kalimat
    
    const interval = setInterval(() => {
      const currentPhrase = phrases[phraseIndex];

      // Jika sedang fase jeda (setelah satu kalimat selesai)
      if (isPaused) {
        pauseCounter++;
        if (pauseCounter > pauseDuration) {
          // Reset untuk mulai mengetik kalimat BERIKUTNYA
          isPaused = false;
          pauseCounter = 0;
          charIndex = 0;
          setPlaceholder("");
          
          // Pindah ke index kalimat selanjutnya (looping)
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
        return;
      }

      // Proses mengetik karakter
      if (charIndex <= currentPhrase.length) {
        setPlaceholder(currentPhrase.slice(0, charIndex));
        charIndex++;
      } else {
        // Kalimat selesai, masuk fase jeda
        isPaused = true;
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [isOpen, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setTimeout(() => {
        setIsOpen(false);
        setIsSearching(false);
        setQuery("");
      }, 500);
    }
  };

  return (
    <>
       {/* Tombol Floating Search */}
       <button
         onClick={() => setIsOpen(!isOpen)}
         className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:bg-red-700 transition-all duration-300 hover:scale-110 active:scale-95 group"
         title="Cari Analisa"
       >
         <div className="relative">
            {isOpen ? <X size={24} /> : <Search size={24} />}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-50" />
         </div>
       </button>

       {/* Modal Overlay */}
       {isOpen && (
         <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md flex items-start justify-center pt-32 px-4 animate-[fadeIn_0.2s_ease-out]">
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative animate-[scaleIn_0.3s_ease-out]">
              <div className="relative group">
                <input
                  type="text"
                  // Placeholder dinamis dari state animasi
                  placeholder={placeholder}
                  className="w-full bg-slate-900/80 border-2 border-slate-700 text-white text-xl md:text-2xl rounded-2xl py-6 pl-16 pr-6 shadow-2xl focus:outline-none focus:border-red-500 focus:bg-slate-900 transition-all placeholder:text-slate-500 font-mono"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors">
                  {isSearching ? <Loader2 size={28} className="animate-spin" /> : <Search size={28} />}
                </div>
              </div>
              
              <div className="text-center mt-6 space-y-2">
                <p className="text-slate-500 text-sm font-mono">
                  Tekan <span className="text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700 mx-1">Enter</span> untuk mencari
                </p>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="text-red-500 text-sm hover:underline mt-2"
                >
                  Batalkan Pencarian
                </button>
              </div>
            </form>
            
            <div className="absolute inset-0 -z-10 cursor-pointer" onClick={() => setIsOpen(false)} />
         </div>
       )}

       <style jsx global>{`
         @keyframes fadeIn {
           from { opacity: 0; }
           to { opacity: 1; }
         }
         @keyframes scaleIn {
           from { opacity: 0; transform: scale(0.95); }
           to { opacity: 1; transform: scale(1); }
         }
       `}</style>
    </>
  );
}