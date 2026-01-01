import { supabase } from "../../../lib/supabase";
import { ArrowLeft, Calendar, Clock, ExternalLink, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "../../../components/ShareButtons"; 
import ReactionButtons from "../../../components/ReactionButtons";
import { Metadata, ResolvingMetadata } from "next";

// Force dynamic rendering agar data selalu fresh
export const revalidate = 0;

interface Props {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

// --- FUNGSI GENERATE METADATA (SEO) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  const { data: post } = await supabase
    .from("posts")
    .select("title, content, image_url")
    .eq("id", id)
    .single();
 
  if (!post) {
    return { title: "Post Not Found" };
  }
 
  const description = post.content ? post.content.slice(0, 160).replace(/\n/g, ' ') + '...' : 'Market Intelligence Update';
  const images = post.image_url ? [post.image_url] : [];
 
  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: images,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: images,
    },
  };
}

// --- FORMATTER TEXT ---
const formatText = (text: string) => {
  if (!text) return null;

  return text.split('\n').map((line, lineIndex) => {
    const cleanLine = line.trim();
    if (!cleanLine) return <div key={lineIndex} className="h-4" />; 

    // Auto-Heading
    if (cleanLine.startsWith('*') && cleanLine.endsWith('*') && cleanLine.length < 100 && !cleanLine.includes('\n')) {
      const content = cleanLine.slice(1, -1);
      return (
        <h3 key={lineIndex} className="text-2xl font-bold text-white mt-10 mb-6 border-l-4 border-red-500 pl-4 animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0 hover:border-l-8 transition-all duration-300 cursor-default" style={{ animationDelay: `${lineIndex * 0.05}s` }}>
          {content}
        </h3>
      );
    }

    // Auto-Quote
    if (cleanLine.startsWith('_') && cleanLine.endsWith('_') && cleanLine.length < 300) {
      const content = cleanLine.slice(1, -1);
      return (
        <blockquote key={lineIndex} className="relative flex gap-4 p-6 my-8 bg-slate-900/50 rounded-xl border border-slate-800 animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0 hover:bg-slate-900 hover:border-red-500/30 transition-all duration-500 group" style={{ animationDelay: `${lineIndex * 0.05}s` }}>
           <Quote className="absolute top-4 right-4 text-slate-800/50 w-16 h-16 -z-10 group-hover:text-slate-800 transition-colors" />
           <Quote className="flex-shrink-0 text-red-500 w-6 h-6 mt-1" />
           <p className="italic text-slate-300 font-serif text-lg leading-relaxed">
             {content}
           </p>
        </blockquote>
      );
    }

    // List Logic
    const isBullet = cleanLine.startsWith('- ');
    const isNumbered = /^\d+\.\s/.test(cleanLine);
    let containerClass = "mb-4 text-lg text-slate-300 leading-relaxed animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0 hover:text-slate-100 transition-colors duration-300";
    let content = line;
    let numberPrefix = "";

    if (isBullet) {
      containerClass = "pl-8 mb-3 relative text-lg text-slate-300 leading-relaxed animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0 hover:translate-x-1 transition-all duration-300";
      content = line.replace('- ', ''); 
    } else if (isNumbered) {
      containerClass = "pl-8 mb-3 relative text-lg text-slate-300 leading-relaxed animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0 hover:translate-x-1 transition-all duration-300";
      const match = line.trim().match(/^(\d+\.)\s+(.*)/);
      if (match) {
        numberPrefix = match[1]; 
        content = match[2];      
      }
    }

    const parts = content.split(/(\*[^*]+\*|\*\*[^*]+\*\*|_[^_]+_|https?:\/\/[^\s]+)/g);

    return (
      <div key={lineIndex} className={containerClass} style={{ animationDelay: `${lineIndex * 0.03}s` }}>
        {isBullet && (
          <span className="absolute left-1 top-3.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
        )}
        {isNumbered && numberPrefix && (
             <span className="absolute left-0 top-0 text-white font-bold font-mono text-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]">{numberPrefix}</span>
        )}
        <span>
          {parts.map((part, partIndex) => {
            if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('**') && part.endsWith('**'))) {
              const text = part.replace(/\*/g, '');
              return <strong key={partIndex} className="text-white font-bold bg-white/5 px-1 rounded">{text}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
              return <em key={partIndex} className="italic text-slate-400 font-serif">{part.slice(1, -1)}</em>;
            }
            if (part.match(/^https?:\/\//)) {
              try {
                const url = new URL(part);
                const domain = url.hostname.replace('www.', ''); 
                return (
                  <a key={partIndex} href={part} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mx-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 no-underline">
                    <ExternalLink size={12} />
                    {domain}
                  </a>
                );
              } catch (e) {
                return part;
              }
            }
            return part;
          })}
        </span>
      </div>
    );
  });
};

export default async function PostDetail({ params }: Props) {
  const { id } = await params;

  // 1. Ambil Data dari Supabase
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) return notFound();

  return (
    // Hapus bg-slate-950 di sini agar background body (logo) terlihat
    <main className="min-h-screen text-slate-200 pb-20 overflow-x-hidden">
      
      {/* Inject Keyframes */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Tombol Kembali */}
      <div className="max-w-4xl mx-auto px-4 pt-8 mb-6 animate-[fadeInUp_0.5s_ease-out_forwards]">
        <Link href="/" className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <div className="p-2 rounded-full bg-slate-900 group-hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          </div>
          <span className="font-medium">Kembali ke Dashboard</span>
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4">
        {/* Header Standard: Judul & Meta */}
        <header className="mb-10 border-b border-slate-800 pb-8 animate-[fadeInUp_0.7s_ease-out_forwards]">
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-mono text-slate-500">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
               post.category === 'news' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30' :
               post.category === 'btc' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30' : 
               'bg-purple-900/20 text-purple-400 border border-purple-500/30'
            }`}>
              {post.category}
            </span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <Calendar size={14} className="text-slate-400" />
              {new Date(post.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </span>
            {post.updated_at && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/20 border border-red-900/30 text-red-400 animate-pulse">
                <Clock size={14} /> Updated
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 leading-tight mb-8 drop-shadow-sm">{post.title}</h1>
          {post.image_url && (
            <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group animate-[scaleIn_0.8s_ease-out_forwards]">
              <Image src={post.image_url} alt={post.title} fill className="object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-110" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-xs font-mono text-white/70">
                Crypto Slayer Intelligence
              </div>
            </div>
          )}
        </header>

        <div className="prose prose-invert prose-lg max-w-none text-slate-300 pb-12">
          {formatText(post.content)}
        </div>

        {/* Reaction Buttons */}
        <ReactionButtons 
          postId={post.id} 
          initialCounts={{
            bullish: post.reaction_bullish || 0,
            bearish: post.reaction_bearish || 0,
            rocket: post.reaction_rocket || 0
          }} 
        />

        {/* Share Buttons */}
        <ShareButtons title={post.title} category={post.category} id={post.id} />

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
      </article>
    </main>
  );
}