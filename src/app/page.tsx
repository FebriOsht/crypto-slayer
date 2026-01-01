"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Mengikuti path dari kode anda
import Link from "next/link";
import { 
  Flame, 
  Bitcoin, 
  Gem, 
  Newspaper, 
  Calendar, 
  ArrowRight, 
  TrendingUp 
} from "lucide-react";
import Image from "next/image";

type Category = "news" | "btc" | "alt";

interface Post {
  id: string;
  title: string;
  content: string;
  category: Category;
  image_url: string;
  created_at: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | Category>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    // Reset posts sementara untuk memicu animasi ulang saat tab ganti (opsional, tapi bagus visualnya)
    setPosts([]); 
    
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (activeTab !== "all") {
      query = query.eq("category", activeTab);
    }

    const { data } = await query;
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  // Konfigurasi Warna & Ikon per Kategori
  const getCategoryStyle = (cat: Category) => {
    switch(cat) {
      case 'news': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: <Newspaper size={14}/> };
      case 'btc': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: <Bitcoin size={14}/> };
      case 'alt': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: <Gem size={14}/> };
      default: return { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700', icon: <Flame size={14}/> };
    }
  };

  const tabs = [
    { id: "news", label: "Market News", icon: <Newspaper size={16} /> },
    { id: "btc", label: "Bitcoin Analysis", icon: <Bitcoin size={16} /> },
    { id: "alt", label: "Altcoin Gems", icon: <Gem size={16} /> },
  ];

  return (
    <main className="min-h-screen pb-20">
      {/* Inject Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* --- HERO SECTION --- */}
      <div className="relative pt-20 pb-10 px-4 text-center border-b border-white/5 bg-slate-950/50 animate-[fadeIn_0.8s_ease-out_forwards]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest mb-4 uppercase animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          Live Market Intel
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-4">
          CRYPTO <span className="text-red-600">SLAYER</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-lg">
          Platform analisis teknikal dan berita pasar tanpa sensor, langsung dari meja trading.
        </p>
      </div>

      {/* --- STICKY FILTER BAR --- */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 py-4 animate-[fadeIn_0.8s_ease-out_forwards]" style={{ animationDelay: '0.2s', opacity: 0 }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeTab === "all" 
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white"
              }`}
            >
              <TrendingUp size={16} /> All Feeds
            </button>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
           // SKELETON LOADING
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="bg-slate-900 h-96 rounded-2xl animate-pulse"></div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => { // Perhatikan penambahan index di sini
              const style = getCategoryStyle(post.category);
              return (
                <article 
                  key={post.id} 
                  // Tambahkan class animate-fadeInUp dan opacity-0 default
                  className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                  // Style delay dinamis berdasarkan urutan index (staggered animation)
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  
                  {/* Image Container */}
                  {post.image_url && (
                    <div className="relative h-56 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 opacity-60" />
                      <Image 
                        src={post.image_url} 
                        alt={post.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                      />
                      {/* Badge di atas gambar */}
                      <div className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${style.bg} ${style.text} ${style.border}`}>
                        {style.icon}
                        {post.category}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-3 font-mono">
                      <Calendar size={12} />
                      {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-red-500 transition-colors">
                      {post.title}
                    </h2>
                    
                    {/* Line Clamp membatasi preview text agar tidak terlalu panjang */}
                    <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line mb-6 line-clamp-[8]">
                      {post.content}
                    </div>

                    {/* Footer Card */}
                    <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                       <span className="text-xs text-slate-500 font-mono">By Admin</span>
                       
                       {/* LINK KE HALAMAN DETAIL */}
                       <Link 
                         href={`/${post.category}/${post.id}`}
                         className="text-xs font-bold text-white flex items-center gap-1 hover:text-red-500 transition-colors"
                       >
                         Full Analysis <ArrowRight size={12} />
                       </Link>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/50 animate-[fadeInUp_0.5s_ease-out_forwards]">
                <Flame size={48} className="mx-auto text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-white">Belum Ada Data</h3>
                <p className="text-slate-500">Tunggu admin memposting analisa terbaru.</p>
            </div>
        )}
      </div>

      {/* --- FOOTER SECTION KHUSUS HALAMAN UTAMA --- */}
      <footer className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-4 animate-[fadeInUp_0.9s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.5s' }}>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-slate-400 font-mono text-sm">
          <a href="https://t.me/DSBabyyBossssss" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 hover:underline transition-colors duration-300">Telegram</a>
          <a href="https://x.com/BabyyBossssss" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors duration-300">X (Twitter)</a>
          <a href="https://chatglobal.cryptodirectoryindonesia.io" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 hover:underline transition-colors duration-300">Chat Global</a>
        </div>
        <p className="text-slate-600 text-xs text-center">
          © {new Date().getFullYear()} Crypto Slayer Intelligence. All rights reserved.
        </p>
      </footer>
    </main>
  );
}