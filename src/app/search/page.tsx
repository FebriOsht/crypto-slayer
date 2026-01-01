import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Calendar, ArrowRight, Flame } from "lucide-react";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || "";

  // Logic Pencarian Supabase (Case Insensitive)
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Header Hasil */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft size={20} /> Kembali ke Home
          </Link>
          
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Search className="text-red-500" size={32} />
            Hasil Pencarian: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">"{query}"</span>
          </h1>
          <p className="text-slate-500 mt-2">Ditemukan {posts?.length || 0} hasil yang cocok.</p>
        </div>

        {/* Grid Hasil (Mirip Homepage) */}
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1"
              >
                {post.image_url && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image 
                      src={post.image_url} 
                      alt={post.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs font-bold uppercase border border-white/10">
                      {post.category}
                    </div>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                   <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 font-mono">
                      <Calendar size={12} />
                      {new Date(post.created_at).toLocaleDateString('id-ID')}
                   </div>
                   <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
                     {post.title}
                   </h2>
                   <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                     {post.content}
                   </p>
                   <div className="mt-auto pt-4 border-t border-slate-800">
                     <Link href={`/${post.category}/${post.id}`} className="text-xs font-bold text-white flex items-center gap-1 hover:text-red-500">
                        Baca Selengkapnya <ArrowRight size={12} />
                     </Link>
                   </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
             <Flame size={48} className="mx-auto text-slate-700 mb-4" />
             <h3 className="text-xl font-bold text-white">Tidak Ditemukan</h3>
             <p className="text-slate-500">Coba kata kunci lain atau cek ejaan Anda.</p>
          </div>
        )}
      </div>
    </main>
  );
}