"use client";

import { useState } from "react";
import { Copy, Check, Twitter, Send, Share2, MessageCircle } from "lucide-react";

interface ShareProps {
  title: string;
  category: string;
  id: string;
}

export default function ShareButtons({ title, category, id }: ShareProps) {
  const [copied, setCopied] = useState(false);

  // Helper untuk mendapatkan URL saat ini di browser
  const getUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${category}/${id}`;
    }
    return "";
  };

  // Fungsi Salin Link dengan Template (Judul + Link di bawahnya)
  const handleCopy = () => {
    const url = getUrl();
    const text = `${title}\n${url}`; // Template: Judul [enter] Link
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fungsi Share ke Sosmed
  const handleShare = (platform: "twitter" | "telegram" | "whatsapp") => {
    const url = getUrl();
    const text = title; 
    
    // Template khusus untuk platform yang mendukung full body text (seperti WA)
    const textWithLink = `${title}\n${url}`;

    let shareUrl = "";
    
    // Twitter / X
    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } 
    // Telegram
    else if (platform === "telegram") {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    }
    // WhatsApp (Langsung kirim format Judul + Link)
    else if (platform === "whatsapp") {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(textWithLink)}`;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col items-center gap-4 my-10 animate-[fadeInUp_0.8s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center gap-2 text-slate-500 text-xs font-mono uppercase tracking-widest mb-2">
        <Share2 size={12} />
        Share Intel
      </div>
      
      <div className="flex gap-3 flex-wrap justify-center">
        {/* Tombol Copy Link */}
        <button
          onClick={handleCopy}
          className="group relative p-3 md:p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-green-500/50 hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          title="Salin Link"
        >
          {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
          
          {/* Tooltip 'Copied' */}
          <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-black text-xs font-bold rounded opacity-0 transition-opacity ${copied ? "opacity-100" : ""}`}>
            Copied!
          </span>
        </button>

        {/* Tombol X (Twitter) */}
        <button
          onClick={() => handleShare("twitter")}
          className="p-3 md:p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-white/50 hover:bg-black hover:-translate-y-1 transition-all duration-300 active:scale-95"
          title="Share ke X"
        >
          <Twitter size={20} />
        </button>

        {/* Tombol Telegram */}
        <button
          onClick={() => handleShare("telegram")}
          className="p-3 md:p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          title="Share ke Telegram"
        >
          <Send size={20} />
        </button>

        {/* Tombol WhatsApp */}
        <button
          onClick={() => handleShare("whatsapp")}
          className="p-3 md:p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-green-400 hover:border-green-500/50 hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          title="Share ke WhatsApp"
        >
          <MessageCircle size={20} />
        </button>
      </div>
    </div>
  );
}