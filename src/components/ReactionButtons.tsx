"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp, TrendingDown, Rocket } from "lucide-react";

interface ReactionProps {
  postId: string;
  initialCounts: {
    bullish: number;
    bearish: number;
    rocket: number;
  };
}

export default function ReactionButtons({ postId, initialCounts }: ReactionProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Load status vote dari browser
  useEffect(() => {
    const savedVote = localStorage.getItem(`vote_${postId}`);
    if (savedVote) {
      setUserVote(savedVote);
    }
  }, [postId]);

  const handleVote = async (type: 'bullish' | 'bearish' | 'rocket') => {
    if (isVoting) return;
    if (userVote === type) return; // Jika klik yang sama, tidak terjadi apa-apa

    setIsVoting(true);
    
    const newCounts = { ...counts };

    // 1. Jika user berpindah pilihan: Kurangi vote lama
    if (userVote) {
        const oldType = userVote as keyof typeof counts;
        if (newCounts[oldType] > 0) newCounts[oldType]--;
        
        // Panggil fungsi decrement di database (Pastikan Anda sudah buat fungsi SQL-nya)
        await supabase.rpc('decrement_reaction', { p_id: postId, r_type: userVote });
    }

    // 2. Tambahkan vote baru
    newCounts[type]++;
    await supabase.rpc('increment_reaction', { p_id: postId, r_type: type });

    // 3. Simpan state baru
    setCounts(newCounts);
    setUserVote(type);
    localStorage.setItem(`vote_${postId}`, type);
    
    setIsVoting(false);
  };

  return (
    // Container Flex Row Minimalis
    <div className="flex justify-center gap-6 my-8 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{ animationDelay: '0.3s' }}>
      
      {/* Tombol Bullish (Hijau) */}
      <button
        onClick={() => handleVote('bullish')}
        className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 transform active:scale-95 ${
          userVote === 'bullish' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-110' 
            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-green-400 hover:border-green-500/50 hover:bg-slate-800'
        }`}
        title="Bullish"
      >
        <TrendingUp size={24} />
        <span className="font-bold font-mono text-lg">{counts.bullish}</span>
      </button>

      {/* Tombol Rocket (Biru) */}
      <button
        onClick={() => handleVote('rocket')}
        className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 transform active:scale-95 ${
          userVote === 'rocket' 
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110' 
            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-slate-800'
        }`}
        title="To The Moon"
      >
        <Rocket size={24} />
        <span className="font-bold font-mono text-lg">{counts.rocket}</span>
      </button>

      {/* Tombol Bearish (Merah) */}
      <button
        onClick={() => handleVote('bearish')}
        className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 transform active:scale-95 ${
          userVote === 'bearish' 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-110' 
            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/50 hover:bg-slate-800'
        }`}
        title="Bearish"
      >
        <TrendingDown size={24} />
        <span className="font-bold font-mono text-lg">{counts.bearish}</span>
      </button>

    </div>
  );
}